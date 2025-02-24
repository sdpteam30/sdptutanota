import { AvailablePlans, PlanType, PlanTypeToName } from "../api/common/TutanotaConstants.js";
import { downcast, getFromMap } from "@tutao/tutanota-utils";
import { isIOSApp } from "../api/common/Env.js";
let dataProvider = null;
const IOS_EXCLUDED_FEATURES = ["pricing.family_label"];
export class FeatureListProvider {
    domainConfig;
    featureList = null;
    constructor(domainConfig) {
        this.domainConfig = domainConfig;
    }
    async init() {
        if ("undefined" === typeof fetch)
            return;
        const listResourceUrl = `${this.domainConfig.websiteBaseUrl}/resources/data/features.json`;
        try {
            const featureList = await fetch(listResourceUrl).then((r) => r.json());
            if (isIOSApp()) {
                this.stripUnsupportedIosFeatures(featureList);
            }
            this.countFeatures([...featureList.Free.categories, ...featureList.Revolutionary.categories, ...featureList.Legend.categories]);
            this.countFeatures([...featureList.Essential.categories, ...featureList.Advanced.categories, ...featureList.Unlimited.categories]);
            this.featureList = featureList;
        }
        catch (e) {
            console.warn(`failed to fetch feature list from  ${listResourceUrl}`, e);
        }
    }
    countFeatures(categories) {
        const featureCounts = new Map();
        for (const category of categories) {
            const count = featureCounts.get(category.title);
            const numberOfFeatures = category.features.length;
            if (count == null || numberOfFeatures > count.max) {
                featureCounts.set(category.title, { max: numberOfFeatures });
            }
        }
        for (const category of categories) {
            category.featureCount = getFromMap(featureCounts, category.title, () => {
                return { max: 0 };
            });
        }
    }
    static async getInitializedInstance(domainConfig) {
        if (dataProvider == null) {
            dataProvider = new FeatureListProvider(domainConfig);
            await dataProvider.init();
        }
        return dataProvider;
    }
    getFeatureList(targetSubscription) {
        if (this.featureList == null) {
            return { subtitle: "emptyString_msg", categories: [] };
        }
        else {
            return this.featureList[PlanTypeToName[targetSubscription]];
        }
    }
    featureLoadingDone() {
        return this.featureList != null;
    }
    /**
     * Remove features from the feature list that are unsupported for iOS and shouldn't be displayed to iOS users.
     * @param featureList feature list obtained from the server
     * @private
     */
    stripUnsupportedIosFeatures(featureList) {
        for (const plan of AvailablePlans) {
            const features = featureList[PlanTypeToName[plan]];
            for (const category of features.categories) {
                category.features = category.features.filter(({ text }) => {
                    return !IOS_EXCLUDED_FEATURES.includes(text);
                });
            }
        }
    }
}
/**
 * @returns the name to show to the user for the current subscription (PremiumBusiness -> Premium etc.)
 */
export function getDisplayNameOfPlanType(planType) {
    switch (planType) {
        case PlanType.PremiumBusiness:
            return downcast(PlanTypeToName[PlanType.Premium]);
        case PlanType.TeamsBusiness:
            return downcast(PlanTypeToName[PlanType.Teams]);
        default:
            return downcast(PlanTypeToName[planType]);
    }
}
//# sourceMappingURL=FeatureListProvider.js.map
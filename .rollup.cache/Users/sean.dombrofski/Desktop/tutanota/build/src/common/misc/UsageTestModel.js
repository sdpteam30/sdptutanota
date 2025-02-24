import { createUsageTestAssignmentIn, createUsageTestMetricData, createUsageTestParticipationIn, UsageTestAssignmentTypeRef, } from "../api/entities/usage/TypeRefs.js";
import { Stage, UsageTest } from "@tutao/tutanota-usagetests";
import { assertNotNull, filterInt, neverNull } from "@tutao/tutanota-utils";
import { BadRequestError, NotFoundError, PreconditionFailedError } from "../api/common/error/RestError";
import { UsageTestMetricType } from "../api/common/TutanotaConstants";
import { SuspensionError } from "../api/common/error/SuspensionError";
import { UsageTestAssignmentService, UsageTestParticipationService } from "../api/entities/usage/Services.js";
import { resolveTypeReference } from "../api/common/EntityFunctions";
import { lang } from "./LanguageViewModel";
import stream from "mithril/stream";
import { Dialog } from "../gui/base/Dialog";
import { DropDownSelector } from "../gui/base/DropDownSelector";
import m from "mithril";
import { isOfflineError } from "../api/common/utils/ErrorUtils.js";
import { CustomerPropertiesTypeRef, CustomerTypeRef } from "../api/entities/sys/TypeRefs.js";
import { createUserSettingsGroupRoot, UserSettingsGroupRootTypeRef } from "../api/entities/tutanota/TypeRefs.js";
import { isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
const PRESELECTED_LIKERT_VALUE = null;
export async function showExperienceSamplingDialog(stage, experienceSamplingOptions) {
    const likertMetrics = Array.from(stage.metricConfigs.values()).filter((metricConfig) => metricConfig.type === UsageTestMetricType.Likert);
    const selectedValues = new Map(likertMetrics.map((likertMetric) => [likertMetric.name, stream(PRESELECTED_LIKERT_VALUE)]));
    Dialog.showActionDialog({
        type: "EditMedium" /* DialogType.EditMedium */,
        okAction: (dialog) => {
            for (let [metricName, selectedValue] of selectedValues) {
                const selection = selectedValue();
                if (selection === null) {
                    // User did not select an answer
                    return Dialog.message("experienceSamplingSelectAnswer_msg");
                }
                stage.setMetric({
                    name: metricName,
                    value: selection,
                });
            }
            stage.complete().then(() => dialog.close());
            return Dialog.message("experienceSamplingThankYou_msg");
        },
        title: experienceSamplingOptions.title ?? "experienceSamplingHeader_label",
        child: () => {
            const children = [];
            if (experienceSamplingOptions.explanationText) {
                const explanationTextLines = lang.getTranslationText(experienceSamplingOptions.explanationText).split("\n");
                children.push(m("#dialog-message.text-break.text-prewrap.selectable.scroll", [explanationTextLines.map((line) => m(".text-break.selectable", line))]));
            }
            for (let likertMetricConfig of likertMetrics) {
                const metricOptions = experienceSamplingOptions["perMetric"][likertMetricConfig.name];
                const answerOptionItems = metricOptions.answerOptions.map((answerOption, index) => {
                    return {
                        name: answerOption,
                        value: (index + 1).toString(),
                    };
                });
                children.push(m("p.text-prewrap.scroll", lang.getTranslationText(metricOptions.question)));
                children.push(m(DropDownSelector, {
                    label: "experienceSamplingAnswer_label",
                    items: answerOptionItems,
                    selectedValue: selectedValues.get(likertMetricConfig.name),
                }));
            }
            return children;
        },
    });
}
export class EphemeralUsageTestStorage {
    assignments = null;
    testDeviceId = null;
    getAssignments() {
        return Promise.resolve(this.assignments);
    }
    getTestDeviceId() {
        return Promise.resolve(this.testDeviceId);
    }
    storeAssignments(persistedAssignmentData) {
        this.assignments = persistedAssignmentData;
        return Promise.resolve();
    }
    storeTestDeviceId(testDeviceId) {
        this.testDeviceId = testDeviceId;
        return Promise.resolve();
    }
}
export const ASSIGNMENT_UPDATE_INTERVAL_MS = 1000 * 60 * 60; // 1h
export class UsageTestModel {
    storages;
    dateProvider;
    serviceExecutor;
    entityClient;
    loginController;
    eventController;
    usageTestController;
    storageBehavior = 1 /* StorageBehavior.Ephemeral */;
    customerProperties;
    lastOptInDecision = null;
    lastPing = Promise.resolve();
    constructor(storages, dateProvider, serviceExecutor, entityClient, loginController, eventController, usageTestController) {
        this.storages = storages;
        this.dateProvider = dateProvider;
        this.serviceExecutor = serviceExecutor;
        this.entityClient = entityClient;
        this.loginController = loginController;
        this.eventController = eventController;
        this.usageTestController = usageTestController;
        eventController.addEntityListener((updates) => {
            return this.entityEventsReceived(updates);
        });
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            if (isUpdateForTypeRef(CustomerPropertiesTypeRef, update)) {
                await this.loginController.waitForFullLogin();
                await this.updateCustomerProperties();
            }
            else if (isUpdateForTypeRef(UserSettingsGroupRootTypeRef, update)) {
                await this.loginController.waitForFullLogin();
                const updatedOptInDecision = this.loginController.getUserController().userSettingsGroupRoot.usageDataOptedIn;
                if (this.lastOptInDecision === updatedOptInDecision) {
                    return;
                }
                // Opt-in decision has changed, load tests
                const tests = await this.loadActiveUsageTests();
                this.usageTestController().setTests(tests);
                this.lastOptInDecision = updatedOptInDecision;
            }
        }
    }
    /**
     * only for usage from the console. may have unintended consequences when used too early or too late.
     * @param test the name of the test to change the variant on
     * @param variant the number of the variant to use from here on
     */
    setVariant(test, variant) {
        this.usageTestController().getTest(test).variant = variant;
    }
    async updateCustomerProperties() {
        const customer = await this.entityClient.load(CustomerTypeRef, neverNull(this.loginController.getUserController().user.customer));
        this.customerProperties = await this.entityClient.load(CustomerPropertiesTypeRef, neverNull(customer.properties));
    }
    /**
     * Needs to be called after construction, ideally after login, so that the logged-in user's CustomerProperties are loaded.
     */
    async init() {
        await this.updateCustomerProperties();
    }
    setStorageBehavior(storageBehavior) {
        this.storageBehavior = storageBehavior;
    }
    storage() {
        return this.storages[this.storageBehavior];
    }
    /**
     * Returns true if the customer has opted out.
     * Defaults to true if init() has not been called.
     */
    isCustomerOptedOut() {
        return this.customerProperties?.usageDataOptedOut ?? true;
    }
    /**
     * Returns true if the opt-in dialog indicator should be shown, depending on the user's and the customer's decisions.
     * Defaults to false if init() has not been called.
     */
    showOptInIndicator() {
        if (!this.loginController.isUserLoggedIn() || this.isCustomerOptedOut()) {
            // shortcut if customer has opted out (or is not logged in)
            return false;
        }
        return this.loginController.getUserController().userSettingsGroupRoot.usageDataOptedIn === null;
    }
    /**
     * Sets the user's usage data opt-in decision. True means they opt in.
     *
     * Immediately refetches the user's active usage tests if they opted in.
     */
    async setOptInDecision(decision) {
        const userSettingsGroupRoot = createUserSettingsGroupRoot(this.loginController.getUserController().userSettingsGroupRoot);
        userSettingsGroupRoot.usageDataOptedIn = decision;
        await this.entityClient.update(userSettingsGroupRoot);
        this.lastOptInDecision = decision;
        // we need to unset the tests in case of an opt-out because otherwise we might keep using them
        // in case of an opt-in we need to load them because they might not yet have been loaded
        const tests = decision ? await this.doLoadActiveUsageTests() : [];
        this.usageTestController().setTests(tests);
    }
    getOptInDecision() {
        if (!this.loginController.isUserLoggedIn()) {
            return false;
        }
        const userOptIn = this.loginController.getUserController().userSettingsGroupRoot.usageDataOptedIn;
        if (!userOptIn) {
            // shortcut if userOptIn not set or equal to false
            return false;
        }
        // customer opt-out overrides the user setting
        return !assertNotNull(this.customerProperties).usageDataOptedOut;
    }
    /**
     * If the storageBehavior is set to StorageBehavior.Persist, then init() must have been called before calling this method.
     */
    async loadActiveUsageTests() {
        if (this.storageBehavior === 0 /* StorageBehavior.Persist */ && !this.getOptInDecision()) {
            return [];
        }
        return await this.doLoadActiveUsageTests();
    }
    async doLoadActiveUsageTests() {
        const persistedData = await this.storage().getAssignments();
        const modelVersion = await this.modelVersion();
        if (persistedData == null || persistedData.usageModelVersion !== modelVersion || Date.now() - persistedData.updatedAt > ASSIGNMENT_UPDATE_INTERVAL_MS) {
            return this.assignmentsToTests(await this.loadAssignments());
        }
        else {
            return this.assignmentsToTests(persistedData.assignments);
        }
    }
    async modelVersion() {
        const model = await resolveTypeReference(UsageTestAssignmentTypeRef);
        return filterInt(model.version);
    }
    async loadAssignments() {
        const testDeviceId = await this.storage().getTestDeviceId();
        const data = createUsageTestAssignmentIn({
            testDeviceId: testDeviceId,
        });
        try {
            const response = testDeviceId
                ? await this.serviceExecutor.put(UsageTestAssignmentService, data, {
                    suspensionBehavior: 1 /* SuspensionBehavior.Throw */,
                })
                : await this.serviceExecutor.post(UsageTestAssignmentService, data, {
                    suspensionBehavior: 1 /* SuspensionBehavior.Throw */,
                });
            await this.storage().storeTestDeviceId(response.testDeviceId);
            await this.storage().storeAssignments({
                assignments: response.assignments,
                updatedAt: this.dateProvider.now(),
                usageModelVersion: await this.modelVersion(),
            });
            return response.assignments;
        }
        catch (e) {
            if (e instanceof SuspensionError) {
                console.log("rate-limit for new assignments reached, disabling tests");
                return [];
            }
            else if (isOfflineError(e)) {
                console.log("offline, disabling tests");
                return [];
            }
            throw e;
        }
    }
    assignmentsToTests(assignments) {
        return assignments.map((usageTestAssignment) => {
            const test = new UsageTest(usageTestAssignment.testId, usageTestAssignment.name, Number(usageTestAssignment.variant), usageTestAssignment.sendPings);
            for (const [index, stageConfig] of usageTestAssignment.stages.entries()) {
                const stage = new Stage(index, test, Number(stageConfig.minPings), Number(stageConfig.maxPings));
                for (const metricConfig of stageConfig.metrics) {
                    const configValues = new Map();
                    for (const metricConfigValue of metricConfig.configValues) {
                        configValues.set(metricConfigValue.key, metricConfigValue.value);
                    }
                    stage.setMetricConfig({
                        name: metricConfig.name,
                        type: metricConfig.type,
                        configValues,
                    });
                }
                test.addStage(stage);
            }
            return test;
        });
    }
    async sendPing(test, stage) {
        this.lastPing = this.lastPing.then(() => this.doSendPing(stage, test), () => this.doSendPing(stage, test));
        return this.lastPing;
    }
    async doSendPing(stage, test) {
        // Immediately stop sending pings if the user has opted out.
        // Only applicable if the user opts out and then does not re-log.
        if (this.storageBehavior === 0 /* StorageBehavior.Persist */ && !this.getOptInDecision()) {
            return;
        }
        const testDeviceId = await this.storage().getTestDeviceId();
        if (testDeviceId == null) {
            console.warn("No device id set before sending pings");
            return;
        }
        const metrics = Array.from(stage.collectedMetrics).map(([key, { name, value }]) => createUsageTestMetricData({
            name: name,
            value: value,
        }));
        const data = createUsageTestParticipationIn({
            testId: test.testId,
            metrics,
            stage: stage.number.toString(),
            testDeviceId: testDeviceId,
        });
        try {
            await this.serviceExecutor.post(UsageTestParticipationService, data, {
                suspensionBehavior: 1 /* SuspensionBehavior.Throw */,
            });
        }
        catch (e) {
            if (e instanceof SuspensionError) {
                test.active = false;
                console.log("rate-limit for pings reached");
            }
            else if (e instanceof PreconditionFailedError) {
                if (e.data === "invalid_state") {
                    test.active = false;
                    console.log(`Tried to send ping for paused test ${test.testName}`, e);
                }
                else if (e.data === "invalid_restart") {
                    test.active = false;
                    console.log(`Tried to restart test '${test.testName}' in ParticipationMode.Once that device has already participated in`, e);
                }
                else if (e.data === "invalid_stage") {
                    console.log(`Tried to send ping for wrong stage ${stage.number} of test '${test.testName}'`, e);
                }
                else if (e.data === "invalid_stage_skip") {
                    console.log(`Tried to skip a required stage before stage ${stage.number} of test '${test.testName}'`, e);
                }
                else if (e.data === "invalid_stage_repetition") {
                    console.log(`Tried to repeat stage ${stage.number} of test '${test.testName}' too many times`, e);
                }
                else {
                    throw e;
                }
            }
            else if (e instanceof NotFoundError) {
                // Cached assignments are likely out of date if we run into a NotFoundError here.
                // We should not attempt to re-send pings, as the relevant test has likely been deleted.
                // Hence, we just remove the cached assignment and disable the test.
                test.active = false;
                console.log(`Tried to send ping. Removing test '${test.testName}' from storage`, e);
                const storedAssignments = await this.storage().getAssignments();
                if (storedAssignments) {
                    await this.storage().storeAssignments({
                        updatedAt: storedAssignments.updatedAt,
                        usageModelVersion: storedAssignments.usageModelVersion,
                        assignments: storedAssignments.assignments.filter((assignment) => assignment.testId !== test.testId),
                    });
                }
            }
            else if (e instanceof BadRequestError) {
                test.active = false;
                console.log(`Tried to send ping. Setting test '${test.testName}' inactive because it is misconfigured`, e);
            }
            else if (isOfflineError(e)) {
                console.log("Tried to send ping, but we are offline", e);
            }
            else {
                throw e;
            }
        }
    }
}
//# sourceMappingURL=UsageTestModel.js.map
import { createNewsIn } from "../../api/entities/tutanota/TypeRefs.js";
import { NewsService } from "../../api/entities/tutanota/Services.js";
import { NotFoundError } from "../../api/common/error/RestError.js";
import { isIOSApp } from "../../api/common/Env.js";
/**
 * Makes calls to the NewsService in order to load the user's unacknowledged NewsItems and stores them.
 */
export class NewsModel {
    serviceExecutor;
    storage;
    newsListItemFactory;
    liveNewsIds = [];
    liveNewsListItems = {};
    constructor(serviceExecutor, storage, newsListItemFactory) {
        this.serviceExecutor = serviceExecutor;
        this.storage = storage;
        this.newsListItemFactory = newsListItemFactory;
    }
    /**
     * Loads the user's unacknowledged NewsItems.
     */
    async loadNewsIds() {
        const response = await this.serviceExecutor.get(NewsService, null);
        this.liveNewsIds = [];
        this.liveNewsListItems = {};
        for (const newsItemId of response.newsItemIds) {
            const newsItemName = newsItemId.newsItemName;
            const newsListItem = await this.newsListItemFactory(newsItemName);
            if (!!newsListItem && (await newsListItem.isShown(newsItemId))) {
                // we can't display those news items unless we allow apple payments
                const unsupportedIosNewsItem = isIOSApp() && ["newPlans", "newPlansOfferEnding"].includes(newsItemId.newsItemName);
                if (!unsupportedIosNewsItem) {
                    this.liveNewsIds.push(newsItemId);
                    this.liveNewsListItems[newsItemName] = newsListItem;
                }
            }
        }
        return this.liveNewsIds;
    }
    /**
     * Acknowledges the NewsItem with the given ID.
     */
    async acknowledgeNews(newsItemId) {
        const data = createNewsIn({ newsItemId });
        try {
            await this.serviceExecutor.post(NewsService, data);
            return true;
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                // NewsItem not found, likely deleted on the server
                console.log(`Could not acknowledge newsItem with ID '${newsItemId}'`);
                return false;
            }
            else {
                throw e;
            }
        }
        finally {
            await this.loadNewsIds();
        }
    }
    acknowledgeNewsForDevice(newsItemId) {
        return this.storage.acknowledgeNewsItemForDevice(newsItemId);
    }
    hasAcknowledgedNewsForDevice(newsItemId) {
        return this.storage.hasAcknowledgedNewsItemForDevice(newsItemId);
    }
}
//# sourceMappingURL=NewsModel.js.map
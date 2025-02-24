import "./dist-chunk.js";
import "./ProgrammingError-chunk.js";
import "./Env-chunk.js";
import "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import "./dist2-chunk.js";
import "./WhitelabelCustomizations-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import "./styles-chunk.js";
import "./theme-chunk.js";
import "./TutanotaConstants-chunk.js";
import "./KeyManager-chunk.js";
import "./WindowFacade-chunk.js";
import "./RootView-chunk.js";
import "./size-chunk.js";
import "./HtmlUtils-chunk.js";
import "./EntityUtils-chunk.js";
import "./TypeModels2-chunk.js";
import "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import "./stream-chunk.js";
import "./ErrorUtils-chunk.js";
import "./RestError-chunk.js";
import "./OutOfSyncError-chunk.js";
import "./CancelledError-chunk.js";
import "./SuspensionError-chunk.js";
import "./LoginIncompleteError-chunk.js";
import "./CryptoError-chunk.js";
import "./error-chunk.js";
import "./RecipientsNotFoundError-chunk.js";
import "./DbError-chunk.js";
import "./QuotaExceededError-chunk.js";
import "./DeviceStorageUnavailableError-chunk.js";
import "./MailBodyTooLargeError-chunk.js";
import "./ImportError-chunk.js";
import "./WebauthnError-chunk.js";
import "./PermissionError-chunk.js";
import { Button, ButtonType } from "./Button-chunk.js";
import "./Icons-chunk.js";
import "./DialogHeaderBar-chunk.js";
import "./CountryList-chunk.js";
import "./Dialog-chunk.js";
import "./Icon-chunk.js";
import "./AriaUtils-chunk.js";
import "./IconButton-chunk.js";
import "./CommonLocator-chunk.js";
import { showUpgradeWizardOrSwitchSubscriptionDialog } from "./SubscriptionDialogs-chunk.js";

//#region src/common/misc/news/items/NewPlansOfferEndingNews.ts
var NewPlansOfferEndingNews = class {
	constructor(newsModel, userController) {
		this.newsModel = newsModel;
		this.userController = userController;
	}
	async isShown() {
		if (!this.userController.isGlobalAdmin()) return false;
		return !await this.userController.isNewPaidPlan();
	}
	render(newsId) {
		const acknowledgeAction = () => {
			this.newsModel.acknowledgeNews(newsId.newsItemId).then(mithril_default.redraw);
		};
		const buttonAttrs = [{
			label: "decideLater_action",
			click: () => acknowledgeAction(),
			type: ButtonType.Secondary
		}, {
			label: "showMoreUpgrade_action",
			click: async () => {
				await showUpgradeWizardOrSwitchSubscriptionDialog(this.userController);
				if (await this.userController.isNewPaidPlan()) acknowledgeAction();
			},
			type: ButtonType.Primary
		}];
		return mithril_default(".full-width", [
			mithril_default(".h4", lang.get("newPlansOfferEndingNews_title")),
			mithril_default(".pb", lang.get("newPlansExplanationPast_msg", {
				"{plan1}": "Revolutionary",
				"{plan2}": "Legend"
			})),
			mithril_default(".pb", lang.get("newPlansOfferEnding_msg")),
			mithril_default(".flex-end.flex-no-grow-no-shrink-auto.flex-wrap", buttonAttrs.map((a) => mithril_default(Button, a)))
		]);
	}
};

//#endregion
export { NewPlansOfferEndingNews };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3UGxhbnNPZmZlckVuZGluZ05ld3MtY2h1bmsuanMiLCJuYW1lcyI6WyJuZXdzTW9kZWw6IE5ld3NNb2RlbCIsInVzZXJDb250cm9sbGVyOiBVc2VyQ29udHJvbGxlciIsIm5ld3NJZDogTmV3c0lkIiwibSIsImJ1dHRvbkF0dHJzOiBBcnJheTxCdXR0b25BdHRycz4iXSwic291cmNlcyI6WyIuLi9zcmMvY29tbW9uL21pc2MvbmV3cy9pdGVtcy9OZXdQbGFuc09mZmVyRW5kaW5nTmV3cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZXdzTGlzdEl0ZW0gfSBmcm9tIFwiLi4vTmV3c0xpc3RJdGVtLmpzXCJcbmltcG9ydCBtLCB7IENoaWxkcmVuIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgTmV3c0lkIH0gZnJvbSBcIi4uLy4uLy4uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBJbmZvTGluaywgbGFuZyB9IGZyb20gXCIuLi8uLi9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBCdXR0b24sIEJ1dHRvbkF0dHJzLCBCdXR0b25UeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBOZXdzTW9kZWwgfSBmcm9tIFwiLi4vTmV3c01vZGVsLmpzXCJcbmltcG9ydCB7IFVzZXJDb250cm9sbGVyIH0gZnJvbSBcIi4uLy4uLy4uL2FwaS9tYWluL1VzZXJDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IHNob3dVcGdyYWRlV2l6YXJkT3JTd2l0Y2hTdWJzY3JpcHRpb25EaWFsb2cgfSBmcm9tIFwiLi4vLi4vU3Vic2NyaXB0aW9uRGlhbG9ncy5qc1wiXG5cbi8qKlxuICogTmV3cyBpdGVtIHRoYXQgaW5mb3JtcyBhZG1pbiB1c2VycyB0aGF0IHRoZSBuZXcgcHJpY2luZyBvZmZlciBpcyBlbmRpbmcgc29vbi5cbiAqL1xuZXhwb3J0IGNsYXNzIE5ld1BsYW5zT2ZmZXJFbmRpbmdOZXdzIGltcGxlbWVudHMgTmV3c0xpc3RJdGVtIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBuZXdzTW9kZWw6IE5ld3NNb2RlbCwgcHJpdmF0ZSByZWFkb25seSB1c2VyQ29udHJvbGxlcjogVXNlckNvbnRyb2xsZXIpIHt9XG5cblx0YXN5bmMgaXNTaG93bigpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoIXRoaXMudXNlckNvbnRyb2xsZXIuaXNHbG9iYWxBZG1pbigpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cblx0XHQvLyAvLyBEbyBub3Qgc2hvdyB0aGlzIGZvciBjdXN0b21lcnMgdGhhdCBhcmUgYWxyZWFkeSBvbiBhIG5ldyBwbGFuXG5cdFx0cmV0dXJuICEoYXdhaXQgdGhpcy51c2VyQ29udHJvbGxlci5pc05ld1BhaWRQbGFuKCkpXG5cdH1cblxuXHRyZW5kZXIobmV3c0lkOiBOZXdzSWQpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgYWNrbm93bGVkZ2VBY3Rpb24gPSAoKSA9PiB7XG5cdFx0XHR0aGlzLm5ld3NNb2RlbC5hY2tub3dsZWRnZU5ld3MobmV3c0lkLm5ld3NJdGVtSWQpLnRoZW4obS5yZWRyYXcpXG5cdFx0fVxuXG5cdFx0Y29uc3QgYnV0dG9uQXR0cnM6IEFycmF5PEJ1dHRvbkF0dHJzPiA9IFtcblx0XHRcdHtcblx0XHRcdFx0bGFiZWw6IFwiZGVjaWRlTGF0ZXJfYWN0aW9uXCIsXG5cdFx0XHRcdGNsaWNrOiAoKSA9PiBhY2tub3dsZWRnZUFjdGlvbigpLFxuXHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGxhYmVsOiBcInNob3dNb3JlVXBncmFkZV9hY3Rpb25cIixcblx0XHRcdFx0Y2xpY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRhd2FpdCBzaG93VXBncmFkZVdpemFyZE9yU3dpdGNoU3Vic2NyaXB0aW9uRGlhbG9nKHRoaXMudXNlckNvbnRyb2xsZXIpXG5cdFx0XHRcdFx0aWYgKGF3YWl0IHRoaXMudXNlckNvbnRyb2xsZXIuaXNOZXdQYWlkUGxhbigpKSB7XG5cdFx0XHRcdFx0XHRhY2tub3dsZWRnZUFjdGlvbigpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlByaW1hcnksXG5cdFx0XHR9LFxuXHRcdF1cblxuXHRcdHJldHVybiBtKFwiLmZ1bGwtd2lkdGhcIiwgW1xuXHRcdFx0bShcIi5oNFwiLCBsYW5nLmdldChcIm5ld1BsYW5zT2ZmZXJFbmRpbmdOZXdzX3RpdGxlXCIpKSxcblx0XHRcdG0oXG5cdFx0XHRcdFwiLnBiXCIsXG5cdFx0XHRcdGxhbmcuZ2V0KFwibmV3UGxhbnNFeHBsYW5hdGlvblBhc3RfbXNnXCIsIHtcblx0XHRcdFx0XHRcIntwbGFuMX1cIjogXCJSZXZvbHV0aW9uYXJ5XCIsXG5cdFx0XHRcdFx0XCJ7cGxhbjJ9XCI6IFwiTGVnZW5kXCIsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHRcdG0oXCIucGJcIiwgbGFuZy5nZXQoXCJuZXdQbGFuc09mZmVyRW5kaW5nX21zZ1wiKSksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5mbGV4LWVuZC5mbGV4LW5vLWdyb3ctbm8tc2hyaW5rLWF1dG8uZmxleC13cmFwXCIsXG5cdFx0XHRcdGJ1dHRvbkF0dHJzLm1hcCgoYSkgPT4gbShCdXR0b24sIGEpKSxcblx0XHRcdCksXG5cdFx0XSlcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBWWEsMEJBQU4sTUFBc0Q7Q0FDNUQsWUFBNkJBLFdBQXVDQyxnQkFBZ0M7RUFtRHBHLEtBbkQ2QjtFQW1ENUIsS0FuRG1FO0NBQWtDO0NBRXRHLE1BQU0sVUFBNEI7QUFDakMsT0FBSyxLQUFLLGVBQWUsZUFBZSxDQUN2QyxRQUFPO0FBSVIsVUFBUyxNQUFNLEtBQUssZUFBZSxlQUFlO0NBQ2xEO0NBRUQsT0FBT0MsUUFBMEI7RUFDaEMsTUFBTSxvQkFBb0IsTUFBTTtBQUMvQixRQUFLLFVBQVUsZ0JBQWdCLE9BQU8sV0FBVyxDQUFDLEtBQUtDLGdCQUFFLE9BQU87RUFDaEU7RUFFRCxNQUFNQyxjQUFrQyxDQUN2QztHQUNDLE9BQU87R0FDUCxPQUFPLE1BQU0sbUJBQW1CO0dBQ2hDLE1BQU0sV0FBVztFQUNqQixHQUNEO0dBQ0MsT0FBTztHQUNQLE9BQU8sWUFBWTtBQUNsQixVQUFNLDRDQUE0QyxLQUFLLGVBQWU7QUFDdEUsUUFBSSxNQUFNLEtBQUssZUFBZSxlQUFlLENBQzVDLG9CQUFtQjtHQUVwQjtHQUNELE1BQU0sV0FBVztFQUNqQixDQUNEO0FBRUQsU0FBTyxnQkFBRSxlQUFlO0dBQ3ZCLGdCQUFFLE9BQU8sS0FBSyxJQUFJLGdDQUFnQyxDQUFDO0dBQ25ELGdCQUNDLE9BQ0EsS0FBSyxJQUFJLCtCQUErQjtJQUN2QyxXQUFXO0lBQ1gsV0FBVztHQUNYLEVBQUMsQ0FDRjtHQUNELGdCQUFFLE9BQU8sS0FBSyxJQUFJLDBCQUEwQixDQUFDO0dBQzdDLGdCQUNDLG1EQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sZ0JBQUUsUUFBUSxFQUFFLENBQUMsQ0FDcEM7RUFDRCxFQUFDO0NBQ0Y7QUFDRCJ9
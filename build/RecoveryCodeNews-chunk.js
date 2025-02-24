import "./dist-chunk.js";
import "./ProgrammingError-chunk.js";
import { isApp } from "./Env-chunk.js";
import "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { LazyLoaded, daysToMillis, noOp, ofClass } from "./dist2-chunk.js";
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
import "./TypeModels-chunk.js";
import "./TypeRefs-chunk.js";
import "./CommonCalendarUtils-chunk.js";
import "./TypeModels2-chunk.js";
import "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import "./FormatValidator-chunk.js";
import "./stream-chunk.js";
import "./ErrorUtils-chunk.js";
import { AccessBlockedError, NotAuthenticatedError } from "./RestError-chunk.js";
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
import "./GroupUtils-chunk.js";
import { Button, ButtonType } from "./Button-chunk.js";
import "./Icons-chunk.js";
import "./DialogHeaderBar-chunk.js";
import "./CountryList-chunk.js";
import { Dialog, DialogType } from "./Dialog-chunk.js";
import { progressIcon } from "./Icon-chunk.js";
import "./AriaUtils-chunk.js";
import "./IconButton-chunk.js";
import "./Formatter-chunk.js";
import "./CommonLocator-chunk.js";
import "./MailAddressParser-chunk.js";
import "./BlobUtils-chunk.js";
import "./FileUtils-chunk.js";
import "./ProgressDialog-chunk.js";
import "./SharedMailUtils-chunk.js";
import "./PasswordUtils-chunk.js";
import "./ToggleButton-chunk.js";
import { copyToClipboard } from "./ClipboardUtils-chunk.js";
import "./PasswordField-chunk.js";
import { showRequestPasswordDialog } from "./PasswordRequestDialog-chunk.js";

//#region src/common/misc/news/items/RecoveryCodeNews.ts
var RecoveryCodeNews = class {
	recoveryCode = null;
	recoverCodeField = new LazyLoaded(async () => {
		const { RecoverCodeField } = await import("./RecoverCodeDialog2-chunk.js");
		mithril_default.redraw();
		return RecoverCodeField;
	});
	constructor(newsModel, userController, recoverCodeFacade) {
		this.newsModel = newsModel;
		this.userController = userController;
		this.recoverCodeFacade = recoverCodeFacade;
	}
	isShown(newsId) {
		const customerCreationTime = this.userController.userGroupInfo.created.getTime();
		return Promise.resolve(this.userController.isGlobalAdmin() && Date.now() - customerCreationTime > daysToMillis(14));
	}
	render(newsId) {
		const recoveryCode = this.recoveryCode;
		this.recoverCodeField.getAsync();
		const RecoverCodeField = this.recoverCodeField.getSync();
		return mithril_default(".full-width", [
			mithril_default(".h4", { style: { "text-transform": "capitalize" } }, lang.get("recoveryCode_label")),
			mithril_default("", lang.get("recoveryCodeReminder_msg")),
			recoveryCode ? RecoverCodeField ? mithril_default(RecoverCodeField, {
				showMessage: false,
				recoverCode: recoveryCode,
				showButtons: false
			}) : mithril_default(".flex.justify-center", progressIcon()) : null,
			mithril_default(".flex-end.flex-no-grow-no-shrink-auto.flex-wrap", [recoveryCode ? [
				this.renderCopyButton(recoveryCode),
				this.renderPrintButton(),
				this.confirmButton(newsId)
			] : [this.renderDoneButton(newsId), this.renderDisplayButton()]])
		]);
	}
	renderDoneButton(newsId) {
		return mithril_default(Button, {
			label: "done_action",
			type: ButtonType.Secondary,
			click: () => Dialog.showActionDialog({
				type: DialogType.EditSmall,
				okAction: async (dialog) => {
					dialog.close();
					this.newsModel.acknowledgeNews(newsId.newsItemId).then(mithril_default.redraw);
				},
				title: "recoveryCode_label",
				allowCancel: true,
				child: () => mithril_default("p", lang.get("recoveryCodeConfirmation_msg"))
			})
		});
	}
	renderPrintButton() {
		if (isApp() || typeof window.print !== "function") return null;
		return mithril_default(Button, {
			label: "print_action",
			type: ButtonType.Secondary,
			click: () => {
				window.print();
			}
		});
	}
	renderCopyButton(recoveryCode) {
		return mithril_default(Button, {
			label: "copy_action",
			type: ButtonType.Secondary,
			click: () => {
				copyToClipboard(recoveryCode);
			}
		});
	}
	renderDisplayButton() {
		return mithril_default(Button, {
			label: "recoveryCodeDisplay_action",
			click: async () => {
				this.getRecoverCodeDialogAfterPasswordVerification(this.userController);
			},
			type: ButtonType.Primary
		});
	}
	confirmButton(newsId) {
		return mithril_default(Button, {
			label: "paymentDataValidation_action",
			click: async () => {
				await this.newsModel.acknowledgeNews(newsId.newsItemId);
				mithril_default.redraw();
			},
			type: ButtonType.Primary
		});
	}
	getRecoverCodeDialogAfterPasswordVerification(userController) {
		const dialog = showRequestPasswordDialog({
			action: (pw) => {
				const hasRecoveryCode = !!userController.user.auth?.recoverCode;
				return (hasRecoveryCode ? this.recoverCodeFacade.getRecoverCodeHex(pw) : this.recoverCodeFacade.createRecoveryCode(pw)).then((recoverCode) => {
					dialog.close();
					this.recoveryCode = recoverCode;
					return "";
				}).catch(ofClass(NotAuthenticatedError, () => lang.get("invalidPassword_msg"))).catch(ofClass(AccessBlockedError, () => lang.get("tooManyAttempts_msg"))).finally(mithril_default.redraw);
			},
			cancel: {
				textId: "cancel_action",
				action: noOp
			}
		});
	}
};

//#endregion
export { RecoveryCodeNews };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVjb3ZlcnlDb2RlTmV3cy1jaHVuay5qcyIsIm5hbWVzIjpbIm5ld3NNb2RlbDogTmV3c01vZGVsIiwidXNlckNvbnRyb2xsZXI6IFVzZXJDb250cm9sbGVyIiwicmVjb3ZlckNvZGVGYWNhZGU6IFJlY292ZXJDb2RlRmFjYWRlIiwibmV3c0lkOiBOZXdzSWQiLCJtIiwicmVjb3ZlcnlDb2RlOiBzdHJpbmciXSwic291cmNlcyI6WyIuLi9zcmMvY29tbW9uL21pc2MvbmV3cy9pdGVtcy9SZWNvdmVyeUNvZGVOZXdzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5ld3NMaXN0SXRlbSB9IGZyb20gXCIuLi9OZXdzTGlzdEl0ZW0uanNcIlxuaW1wb3J0IG0sIHsgQ2hpbGRyZW4gfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBOZXdzSWQgfSBmcm9tIFwiLi4vLi4vLi4vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgQnV0dG9uLCBCdXR0b25UeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBOZXdzTW9kZWwgfSBmcm9tIFwiLi4vTmV3c01vZGVsLmpzXCJcbmltcG9ydCB7IERpYWxvZywgRGlhbG9nVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9ndWkvYmFzZS9EaWFsb2cuanNcIlxuaW1wb3J0IHsgQWNjZXNzQmxvY2tlZEVycm9yLCBOb3RBdXRoZW50aWNhdGVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vYXBpL2NvbW1vbi9lcnJvci9SZXN0RXJyb3IuanNcIlxuaW1wb3J0IHsgZGF5c1RvTWlsbGlzLCBMYXp5TG9hZGVkLCBub09wLCBvZkNsYXNzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBjb3B5VG9DbGlwYm9hcmQgfSBmcm9tIFwiLi4vLi4vQ2xpcGJvYXJkVXRpbHMuanNcIlxuaW1wb3J0IHsgVXNlckNvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vYXBpL21haW4vVXNlckNvbnRyb2xsZXIuanNcIlxuaW1wb3J0IHsgcHJvZ3Jlc3NJY29uIH0gZnJvbSBcIi4uLy4uLy4uL2d1aS9iYXNlL0ljb24uanNcIlxuaW1wb3J0IHsgVXNlck1hbmFnZW1lbnRGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvVXNlck1hbmFnZW1lbnRGYWNhZGUuanNcIlxuaW1wb3J0IHsgaXNBcHAgfSBmcm9tIFwiLi4vLi4vLi4vYXBpL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHsgc2hvd1JlcXVlc3RQYXNzd29yZERpYWxvZyB9IGZyb20gXCIuLi8uLi9wYXNzd29yZHMvUGFzc3dvcmRSZXF1ZXN0RGlhbG9nLmpzXCJcbmltcG9ydCB7IFJlY292ZXJDb2RlRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L1JlY292ZXJDb2RlRmFjYWRlLmpzXCJcblxuLyoqXG4gKiBOZXdzIGl0ZW0gdGhhdCBpbmZvcm1zIGFkbWluIHVzZXJzIGFib3V0IHRoZWlyIHJlY292ZXJ5IGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWNvdmVyeUNvZGVOZXdzIGltcGxlbWVudHMgTmV3c0xpc3RJdGVtIHtcblx0cHJpdmF0ZSByZWNvdmVyeUNvZGU6IHN0cmluZyB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgcmVhZG9ubHkgcmVjb3ZlckNvZGVGaWVsZCA9IG5ldyBMYXp5TG9hZGVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IFJlY292ZXJDb2RlRmllbGQgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL3NldHRpbmdzL2xvZ2luL1JlY292ZXJDb2RlRGlhbG9nLmpzXCIpXG5cdFx0bS5yZWRyYXcoKVxuXHRcdHJldHVybiBSZWNvdmVyQ29kZUZpZWxkXG5cdH0pXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBuZXdzTW9kZWw6IE5ld3NNb2RlbCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVzZXJDb250cm9sbGVyOiBVc2VyQ29udHJvbGxlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHJlY292ZXJDb2RlRmFjYWRlOiBSZWNvdmVyQ29kZUZhY2FkZSxcblx0KSB7fVxuXG5cdGlzU2hvd24obmV3c0lkOiBOZXdzSWQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBjdXN0b21lckNyZWF0aW9uVGltZSA9IHRoaXMudXNlckNvbnRyb2xsZXIudXNlckdyb3VwSW5mby5jcmVhdGVkLmdldFRpbWUoKVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy51c2VyQ29udHJvbGxlci5pc0dsb2JhbEFkbWluKCkgJiYgRGF0ZS5ub3coKSAtIGN1c3RvbWVyQ3JlYXRpb25UaW1lID4gZGF5c1RvTWlsbGlzKDE0KSlcblx0fVxuXG5cdHJlbmRlcihuZXdzSWQ6IE5ld3NJZCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCByZWNvdmVyeUNvZGUgPSB0aGlzLnJlY292ZXJ5Q29kZVxuXHRcdC8vIHRvZ2dsZSB0aGUgbG9hZCBpZiBpdCdzIG5vdCBzdGFydGVkIHlldFxuXHRcdHRoaXMucmVjb3ZlckNvZGVGaWVsZC5nZXRBc3luYygpXG5cblx0XHQvLyBXaWxsIChhbHdheXMpIGJlIG51bGwgb24gdGhlIGZpcnN0IGNhbGwgb2YgcmVuZGVyKCkgc2luY2UgZ2V0QXN5bmMoKSB3YXMganVzdCBjYWxsZWQgZm9yIHRoZSBmaXJzdCB0aW1lLlxuXHRcdC8vIFdoZW4gdGhlIHJlZHJhdyBpcyB0cmlnZ2VyZWQgaW4gdGhlIGxvYWQgZnVuY3Rpb24sIGl0IHdpbGwgYmUgcG9wdWxhdGVkIGFuZCByZW5kZXJlZCBjb3JyZWN0bHkuXG5cdFx0Y29uc3QgUmVjb3ZlckNvZGVGaWVsZCA9IHRoaXMucmVjb3ZlckNvZGVGaWVsZC5nZXRTeW5jKClcblxuXHRcdHJldHVybiBtKFwiLmZ1bGwtd2lkdGhcIiwgW1xuXHRcdFx0bShcblx0XHRcdFx0XCIuaDRcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcInRleHQtdHJhbnNmb3JtXCI6IFwiY2FwaXRhbGl6ZVwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGxhbmcuZ2V0KFwicmVjb3ZlcnlDb2RlX2xhYmVsXCIpLFxuXHRcdFx0KSxcblx0XHRcdG0oXCJcIiwgbGFuZy5nZXQoXCJyZWNvdmVyeUNvZGVSZW1pbmRlcl9tc2dcIikpLFxuXHRcdFx0cmVjb3ZlcnlDb2RlXG5cdFx0XHRcdD8gUmVjb3ZlckNvZGVGaWVsZFxuXHRcdFx0XHRcdD8gbShSZWNvdmVyQ29kZUZpZWxkLCB7XG5cdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0cmVjb3ZlckNvZGU6IHJlY292ZXJ5Q29kZSBhcyBzdHJpbmcsXG5cdFx0XHRcdFx0XHRcdHNob3dCdXR0b25zOiBmYWxzZSxcblx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0OiBtKFwiLmZsZXguanVzdGlmeS1jZW50ZXJcIiwgcHJvZ3Jlc3NJY29uKCkpXG5cdFx0XHRcdDogbnVsbCxcblx0XHRcdG0oXCIuZmxleC1lbmQuZmxleC1uby1ncm93LW5vLXNocmluay1hdXRvLmZsZXgtd3JhcFwiLCBbXG5cdFx0XHRcdHJlY292ZXJ5Q29kZVxuXHRcdFx0XHRcdD8gW3RoaXMucmVuZGVyQ29weUJ1dHRvbihyZWNvdmVyeUNvZGUpLCB0aGlzLnJlbmRlclByaW50QnV0dG9uKCksIHRoaXMuY29uZmlybUJ1dHRvbihuZXdzSWQpXVxuXHRcdFx0XHRcdDogW3RoaXMucmVuZGVyRG9uZUJ1dHRvbihuZXdzSWQpLCB0aGlzLnJlbmRlckRpc3BsYXlCdXR0b24oKV0sXG5cdFx0XHRdKSxcblx0XHRdKVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEb25lQnV0dG9uKG5ld3NJZDogTmV3c0lkKSB7XG5cdFx0cmV0dXJuIG0oQnV0dG9uLCB7XG5cdFx0XHRsYWJlbDogXCJkb25lX2FjdGlvblwiLFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHRjbGljazogKCkgPT5cblx0XHRcdFx0RGlhbG9nLnNob3dBY3Rpb25EaWFsb2coe1xuXHRcdFx0XHRcdHR5cGU6IERpYWxvZ1R5cGUuRWRpdFNtYWxsLFxuXHRcdFx0XHRcdG9rQWN0aW9uOiBhc3luYyAoZGlhbG9nKSA9PiB7XG5cdFx0XHRcdFx0XHRkaWFsb2cuY2xvc2UoKVxuXHRcdFx0XHRcdFx0dGhpcy5uZXdzTW9kZWwuYWNrbm93bGVkZ2VOZXdzKG5ld3NJZC5uZXdzSXRlbUlkKS50aGVuKG0ucmVkcmF3KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dGl0bGU6IFwicmVjb3ZlcnlDb2RlX2xhYmVsXCIsXG5cdFx0XHRcdFx0YWxsb3dDYW5jZWw6IHRydWUsXG5cdFx0XHRcdFx0Y2hpbGQ6ICgpID0+IG0oXCJwXCIsIGxhbmcuZ2V0KFwicmVjb3ZlcnlDb2RlQ29uZmlybWF0aW9uX21zZ1wiKSksXG5cdFx0XHRcdH0pLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclByaW50QnV0dG9uKCk6IENoaWxkcmVuIHtcblx0XHRpZiAoaXNBcHAoKSB8fCB0eXBlb2Ygd2luZG93LnByaW50ICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG0oQnV0dG9uLCB7XG5cdFx0XHRsYWJlbDogXCJwcmludF9hY3Rpb25cIixcblx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0d2luZG93LnByaW50KClcblx0XHRcdH0sXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ29weUJ1dHRvbihyZWNvdmVyeUNvZGU6IHN0cmluZyk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShCdXR0b24sIHtcblx0XHRcdGxhYmVsOiBcImNvcHlfYWN0aW9uXCIsXG5cdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdGNvcHlUb0NsaXBib2FyZChyZWNvdmVyeUNvZGUpXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRpc3BsYXlCdXR0b24oKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKEJ1dHRvbiwge1xuXHRcdFx0bGFiZWw6IFwicmVjb3ZlcnlDb2RlRGlzcGxheV9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0UmVjb3ZlckNvZGVEaWFsb2dBZnRlclBhc3N3b3JkVmVyaWZpY2F0aW9uKHRoaXMudXNlckNvbnRyb2xsZXIpXG5cdFx0XHR9LFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGNvbmZpcm1CdXR0b24obmV3c0lkOiBOZXdzSWQpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oQnV0dG9uLCB7XG5cdFx0XHRsYWJlbDogXCJwYXltZW50RGF0YVZhbGlkYXRpb25fYWN0aW9uXCIsXG5cdFx0XHRjbGljazogYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRhd2FpdCB0aGlzLm5ld3NNb2RlbC5hY2tub3dsZWRnZU5ld3MobmV3c0lkLm5ld3NJdGVtSWQpXG5cdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdH0sXG5cdFx0XHR0eXBlOiBCdXR0b25UeXBlLlByaW1hcnksXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgZ2V0UmVjb3ZlckNvZGVEaWFsb2dBZnRlclBhc3N3b3JkVmVyaWZpY2F0aW9uKHVzZXJDb250cm9sbGVyOiBVc2VyQ29udHJvbGxlcikge1xuXHRcdGNvbnN0IGRpYWxvZyA9IHNob3dSZXF1ZXN0UGFzc3dvcmREaWFsb2coe1xuXHRcdFx0YWN0aW9uOiAocHcpID0+IHtcblx0XHRcdFx0Y29uc3QgaGFzUmVjb3ZlcnlDb2RlID0gISF1c2VyQ29udHJvbGxlci51c2VyLmF1dGg/LnJlY292ZXJDb2RlXG5cblx0XHRcdFx0cmV0dXJuIChoYXNSZWNvdmVyeUNvZGUgPyB0aGlzLnJlY292ZXJDb2RlRmFjYWRlLmdldFJlY292ZXJDb2RlSGV4KHB3KSA6IHRoaXMucmVjb3ZlckNvZGVGYWNhZGUuY3JlYXRlUmVjb3ZlcnlDb2RlKHB3KSlcblx0XHRcdFx0XHQudGhlbigocmVjb3ZlckNvZGUpID0+IHtcblx0XHRcdFx0XHRcdGRpYWxvZy5jbG9zZSgpXG5cdFx0XHRcdFx0XHR0aGlzLnJlY292ZXJ5Q29kZSA9IHJlY292ZXJDb2RlXG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJcIlxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKG9mQ2xhc3MoTm90QXV0aGVudGljYXRlZEVycm9yLCAoKSA9PiBsYW5nLmdldChcImludmFsaWRQYXNzd29yZF9tc2dcIikpKVxuXHRcdFx0XHRcdC5jYXRjaChvZkNsYXNzKEFjY2Vzc0Jsb2NrZWRFcnJvciwgKCkgPT4gbGFuZy5nZXQoXCJ0b29NYW55QXR0ZW1wdHNfbXNnXCIpKSlcblx0XHRcdFx0XHQuZmluYWxseShtLnJlZHJhdylcblx0XHRcdH0sXG5cdFx0XHRjYW5jZWw6IHtcblx0XHRcdFx0dGV4dElkOiBcImNhbmNlbF9hY3Rpb25cIixcblx0XHRcdFx0YWN0aW9uOiBub09wLFxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFvQmEsbUJBQU4sTUFBK0M7Q0FDckQsQUFBUSxlQUE4QjtDQUN0QyxBQUFpQixtQkFBbUIsSUFBSSxXQUFXLFlBQVk7RUFDOUQsTUFBTSxFQUFFLGtCQUFrQixHQUFHLE1BQU0sT0FBTztBQUMxQyxrQkFBRSxRQUFRO0FBQ1YsU0FBTztDQUNQO0NBRUQsWUFDa0JBLFdBQ0FD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
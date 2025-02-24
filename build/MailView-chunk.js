import "./dist-chunk.js";
import "./ProgrammingError-chunk.js";
import { assertMainOrNode, isApp } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { AsyncResult, assertNotNull, downcast, groupByAndMap, isEmpty, last, neverNull, noOp, ofClass, pMap } from "./dist2-chunk.js";
import "./WhitelabelCustomizations-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import { AlphaEnum, DefaultAnimationTime, alpha, animations, ease, opacity, styles } from "./styles-chunk.js";
import { getElevatedBackground, getNavButtonIconBackground, stateBgHover, theme } from "./theme-chunk.js";
import { FeatureType, Keys, MailReportType, MailSetKind, MailState, getMailFolderType } from "./TutanotaConstants-chunk.js";
import { focusNext, focusPrevious, isKeyPressed, keyManager } from "./KeyManager-chunk.js";
import "./WindowFacade-chunk.js";
import { modal } from "./RootView-chunk.js";
import { px, size } from "./size-chunk.js";
import "./HtmlUtils-chunk.js";
import "./luxon-chunk.js";
import { elementIdPart, getElementId, getLetId, haveSameId, isSameId, listIdPart } from "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import { MailSetEntryTypeRef, MailTypeRef } from "./TypeRefs-chunk.js";
import "./CommonCalendarUtils-chunk.js";
import "./TypeModels2-chunk.js";
import "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import "./CalendarUtils-chunk.js";
import "./ImportExportUtils-chunk.js";
import "./FormatValidator-chunk.js";
import "./stream-chunk.js";
import { deviceConfig } from "./DeviceConfig-chunk.js";
import "./Logger-chunk.js";
import "./ErrorHandler-chunk.js";
import "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import { isOfflineError } from "./ErrorUtils-chunk.js";
import { LockedError, PreconditionFailedError } from "./RestError-chunk.js";
import "./SetupMultipleError-chunk.js";
import "./OutOfSyncError-chunk.js";
import { CancelledError } from "./CancelledError-chunk.js";
import "./EventQueue-chunk.js";
import "./EntityRestClient-chunk.js";
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
import { PermissionError } from "./PermissionError-chunk.js";
import "./MessageDispatcher-chunk.js";
import "./WorkerProxy-chunk.js";
import "./EntityUpdateUtils-chunk.js";
import "./dist3-chunk.js";
import "./KeyLoaderFacade-chunk.js";
import "./SessionType-chunk.js";
import "./Services-chunk.js";
import "./EntityClient-chunk.js";
import "./PageContextLoginListener-chunk.js";
import "./RestClient-chunk.js";
import "./BirthdayUtils-chunk.js";
import "./Services2-chunk.js";
import "./FolderSystem-chunk.js";
import "./GroupUtils-chunk.js";
import { isOfTypeOrSubfolderOf, isSpamOrTrashFolder } from "./MailChecks-chunk.js";
import { Button, ButtonColor, ButtonType } from "./Button-chunk.js";
import { Icons } from "./Icons-chunk.js";
import "./DialogHeaderBar-chunk.js";
import "./CountryList-chunk.js";
import { Dialog, DropDownSelector, DropType, INPUT, RowButton, TextField, attachDropdown } from "./Dialog-chunk.js";
import { BootIcons, Icon, IconSize } from "./Icon-chunk.js";
import "./AriaUtils-chunk.js";
import { ButtonSize, IconButton } from "./IconButton-chunk.js";
import "./CalendarEventWhenModel-chunk.js";
import "./Formatter-chunk.js";
import { makeTrackedProgressMonitor } from "./ProgressMonitor-chunk.js";
import "./Notifications-chunk.js";
import "./CalendarFacade-chunk.js";
import "./CalendarModel-chunk.js";
import "./GroupUtils2-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import "./UserError-chunk.js";
import "./MailAddressParser-chunk.js";
import "./BlobUtils-chunk.js";
import { deduplicateFilenames, fileListToArray } from "./FileUtils-chunk.js";
import { showProgressDialog } from "./ProgressDialog-chunk.js";
import { getMailboxName, readLocalFiles } from "./SharedMailUtils-chunk.js";
import "./PasswordUtils-chunk.js";
import "./Recipient-chunk.js";
import "./ContactUtils-chunk.js";
import "./RecipientsModel-chunk.js";
import "./CalendarGuiUtils-chunk.js";
import "./UpgradeRequiredError-chunk.js";
import "./ColorPickerModel-chunk.js";
import { showNotAvailableForFreeDialog } from "./SubscriptionDialogs-chunk.js";
import "./ExternalLink-chunk.js";
import "./ToggleButton-chunk.js";
import { ColumnEmptyMessageBox } from "./ColumnEmptyMessageBox-chunk.js";
import { NavButton, NavButtonColor, isNavButtonSelected, isSelectedPrefix } from "./NavButton-chunk.js";
import "./InfoBanner-chunk.js";
import { showSnackBar } from "./SnackBar-chunk.js";
import "./Credentials-chunk.js";
import "./NotificationOverlay-chunk.js";
import "./Checkbox-chunk.js";
import "./Expander-chunk.js";
import "./ClipboardUtils-chunk.js";
import "./Services4-chunk.js";
import "./BubbleButton-chunk.js";
import "./ErrorReporter-chunk.js";
import "./PasswordField-chunk.js";
import "./PasswordRequestDialog-chunk.js";
import "./ErrorHandlerImpl-chunk.js";
import { List, ListLoadingState, ListSwipeDecision, MultiselectMode, listSelectionKeyboardShortcuts } from "./List-chunk.js";
import "./SelectableRowContainer-chunk.js";
import "./CalendarRow-chunk.js";
import { MAIL_PREFIX } from "./RouteChange-chunk.js";
import { selectionAttrsForList } from "./ListModel-chunk.js";
import "./CalendarExporter-chunk.js";
import "./CalendarImporter-chunk.js";
import "./CustomerUtils-chunk.js";
import "./CalendarInvites-chunk.js";
import { BackgroundColumnLayout, ColumnType, FolderColumnView, Header, MobileHeader, SidebarSection, ViewColumn, ViewSlider } from "./MobileHeader-chunk.js";
import { mailLocator } from "./mailLocator-chunk.js";
import { BaseTopLevelView } from "./LoginScreenHeader-chunk.js";
import { DesktopListToolbar, DesktopViewerToolbar, EnterMultiselectIconButton, MultiselectMobileHeader, SidebarSectionRow } from "./SidebarSectionRow-chunk.js";
import { LoginButton } from "./LoginButton-chunk.js";
import { ColorPickerView } from "./ColorPickerView-chunk.js";
import { isNewMailActionAvailable } from "./NavFunctions-chunk.js";
import { CounterBadge } from "./CounterBadge-chunk.js";
import "./InfoIcon-chunk.js";
import "./Table-chunk.js";
import { ListColumnWrapper } from "./ListColumnWrapper-chunk.js";
import "./LoginUtils-chunk.js";
import "./AttachmentBubble-chunk.js";
import { archiveMails, getConversationTitle, getFolderIcon, getMoveMailBounds, moveMails, moveToInbox, promptAndDeleteMails, reportMailsAutomatically, showMoveMailsDropdown } from "./MailGuiUtils-chunk.js";
import "./UsageTestModel-chunk.js";
import { MAX_FOLDER_INDENT_LEVEL, assertSystemFolderOfType, getFolderName, getIndentedFolderNameForDropdown, getPathToFolderString } from "./MailUtils-chunk.js";
import "./BrowserWebauthn-chunk.js";
import "./PermissionType-chunk.js";
import "./CommonMailUtils-chunk.js";
import "./SearchUtils-chunk.js";
import "./FontIcons-chunk.js";
import { canDoDragAndDropExport, downloadMailBundle, generateExportFileName, generateMailFile, getMailExportMode } from "./MailViewerViewModel-chunk.js";
import "./LoadingState-chunk.js";
import "./inlineImagesUtils-chunk.js";
import { SelectAllCheckbox } from "./SelectAllCheckbox-chunk.js";
import { LazySearchBar } from "./LazySearchBar-chunk.js";
import { BottomNav } from "./BottomNav-chunk.js";
import "./Badge-chunk.js";
import { MailRow, getLabelColor } from "./MailRow-chunk.js";
import { ConversationViewer, LabelsPopup, MailFilterButton, MailViewerActions, MobileMailActionBar, MobileMailMultiselectionActionBar, MultiItemViewer, conversationCardMargin, getMailSelectionMessage } from "./MailFilterButton-chunk.js";

//#region src/mail-app/mail/view/MailListView.ts
assertMainOrNode();
var MailListView = class {
	exportedMails;
	_listDom;
	showingSpamOrTrash = false;
	showingDraft = false;
	showingArchive = false;
	attrs;
	get mailViewModel() {
		return this.attrs.mailViewModel;
	}
	renderConfig = {
		itemHeight: size.list_row_height,
		multiselectionAllowed: MultiselectMode.Enabled,
		createElement: (dom) => {
			const mailRow = new MailRow(this.mailViewModel.getSelectedMailSetKind() === MailSetKind.LABEL, (mail) => this.mailViewModel.getLabelsForMail(mail), (entity) => this.attrs.onSingleExclusiveSelection(entity));
			mithril_default.render(dom, mailRow.render());
			return mailRow;
		},
		swipe: locator.logins.isInternalUserLoggedIn() ? {
			renderLeftSpacer: () => this.renderLeftSpacer(),
			renderRightSpacer: () => this.renderRightSpacer(),
			swipeLeft: (listElement) => this.onSwipeLeft(listElement),
			swipeRight: (listElement) => this.onSwipeRight(listElement)
		} : null,
		dragStart: (event, row, selected) => this._newDragStart(event, row, selected)
	};
	constructor({ attrs }) {
		this.attrs = attrs;
		this.exportedMails = new Map();
		this._listDom = null;
		this.mailViewModel.showingTrashOrSpamFolder().then((result) => {
			this.showingSpamOrTrash = result;
			mithril_default.redraw();
		});
		this.mailViewModel.showingDraftsFolder().then((result) => {
			this.showingDraft = result;
			mithril_default.redraw();
		});
		this.targetInbox().then((result) => {
			this.showingArchive = result;
			mithril_default.redraw();
		});
		this.view = this.view.bind(this);
	}
	getRecoverFolder(mail, folders) {
		if (mail.state === MailState.DRAFT) return assertSystemFolderOfType(folders, MailSetKind.DRAFT);
else return assertSystemFolderOfType(folders, MailSetKind.INBOX);
	}
	_newDragStart(event, row, selected) {
		if (!row) return;
		const mailUnderCursor = row;
		if (isExportDragEvent(event)) {
			this._listDom?.classList.remove("drag-mod-key");
			event.preventDefault();
			const draggedMails = selected.has(mailUnderCursor) ? [...selected] : [mailUnderCursor];
			this._doExportDrag(draggedMails);
		} else if (styles.isDesktopLayout()) neverNull(event.dataTransfer).setData(DropType.Mail, getLetId(neverNull(mailUnderCursor))[1]);
else event.preventDefault();
	}
	_dragStart(event, row, selected) {
		if (!row.entity) return;
		const mailUnderCursor = row.entity;
		if (isExportDragEvent(event)) {
			this._listDom?.classList.remove("drag-mod-key");
			event.preventDefault();
			const draggedMails = selected.some((mail) => haveSameId(mail, mailUnderCursor)) ? selected.slice() : [mailUnderCursor];
			this._doExportDrag(draggedMails);
		} else if (styles.isDesktopLayout()) neverNull(event.dataTransfer).setData(DropType.Mail, getLetId(neverNull(mailUnderCursor))[1]);
else event.preventDefault();
	}
	async _doExportDrag(draggedMails) {
		assertNotNull(document.body).style.cursor = "progress";
		const mouseupPromise = new Promise((resolve) => {
			document.addEventListener("mouseup", resolve, { once: true });
		});
		const filePathsPromise = this._prepareMailsForDrag(draggedMails);
		const [didComplete, fileNames] = await Promise.race([filePathsPromise.then((filePaths) => [true, filePaths]), mouseupPromise.then(() => [false, []])]);
		if (didComplete) await locator.fileApp.startNativeDrag(fileNames);
else {
			await locator.desktopSystemFacade.focusApplicationWindow();
			Dialog.message("unsuccessfulDrop_msg");
		}
		neverNull(document.body).style.cursor = "default";
	}
	/**
	* Given a mail, will prepare it by downloading, bundling, saving, then returns the filepath of the saved file.
	* @returns {Promise<R>|Promise<string>}
	* @private
	* @param mails
	*/
	async _prepareMailsForDrag(mails) {
		const exportMode = await getMailExportMode();
		const progressMonitor = makeTrackedProgressMonitor(locator.progressTracker, 3 * mails.length + 1);
		progressMonitor.workDone(1);
		const mapKey = (mail) => `${getLetId(mail).join("")}${exportMode}`;
		const notDownloaded = [];
		const downloaded = [];
		const handleNotDownloaded = (mail) => {
			notDownloaded.push({
				mail,
				fileName: generateExportFileName(getElementId(mail), mail.subject, mail.receivedDate, exportMode)
			});
		};
		const handleDownloaded = (fileName, promise) => {
			progressMonitor.workDone(3);
			downloaded.push({
				fileName,
				promise
			});
		};
		for (let mail of mails) {
			const key = mapKey(mail);
			const existing = this.exportedMails.get(key);
			if (!existing || existing.result.state().status === "failure") handleNotDownloaded(mail);
else {
				const state = existing.result.state();
				switch (state.status) {
					case "pending": {
						handleDownloaded(existing.fileName, state.promise);
						continue;
					}
					case "complete": {
						const exists = await locator.fileApp.checkFileExistsInExportDir(existing.fileName);
						if (exists) handleDownloaded(existing.fileName, Promise.resolve(mail));
else handleNotDownloaded(mail);
					}
				}
			}
		}
		const deduplicatedNames = deduplicateFilenames(notDownloaded.map((f) => f.fileName), new Set(downloaded.map((f) => f.fileName)));
		const [newFiles, existingFiles] = await Promise.all([pMap(notDownloaded, async ({ mail, fileName }) => {
			const name = assertNotNull(deduplicatedNames[fileName].shift());
			const key = mapKey(mail);
			const downloadPromise = Promise.resolve().then(async () => {
				const { htmlSanitizer } = await import("./HtmlSanitizer2-chunk.js");
				const bundle = await downloadMailBundle(mail, locator.mailFacade, locator.entityClient, locator.fileController, htmlSanitizer, locator.cryptoFacade);
				progressMonitor.workDone(1);
				const file = await generateMailFile(bundle, name, exportMode);
				progressMonitor.workDone(1);
				await locator.fileApp.saveToExportDir(file);
				progressMonitor.workDone(1);
			});
			this.exportedMails.set(key, {
				fileName: name,
				result: new AsyncResult(downloadPromise)
			});
			await downloadPromise;
			return name;
		}), pMap(downloaded, (result) => result.promise.then(() => result.fileName))]);
		return newFiles.concat(existingFiles);
	}
	view(vnode) {
		this.attrs = vnode.attrs;
		const folder = this.mailViewModel.getFolder();
		const purgeButtonAttrs = {
			label: "clearFolder_action",
			type: ButtonType.Primary,
			colors: ButtonColor.Nav,
			click: async () => {
				vnode.attrs.onClearFolder();
			}
		};
		const onKeyDown = (event) => {
			if (isDragAndDropModifierHeld(event)) this._listDom?.classList.add("drag-mod-key");
		};
		const onKeyUp = (event) => {
			this._listDom?.classList.remove("drag-mod-key");
		};
		const listModel = vnode.attrs.mailViewModel.listModel;
		return mithril_default(
			".mail-list-wrapper",
			{
				oncreate: (vnode$1) => {
					this._listDom = downcast(vnode$1.dom.firstChild);
					if (canDoDragAndDropExport()) {
						assertNotNull(document.body).addEventListener("keydown", onKeyDown);
						assertNotNull(document.body).addEventListener("keyup", onKeyUp);
					}
				},
				onbeforeremove: (vnode$1) => {
					if (canDoDragAndDropExport()) {
						assertNotNull(document.body).removeEventListener("keydown", onKeyDown);
						assertNotNull(document.body).removeEventListener("keyup", onKeyUp);
					}
				}
			},
			// always render the wrapper so that the list is not re-created from scratch when
			// showingSpamOrTrash changes.
			mithril_default(ListColumnWrapper, { headerContent: this.renderListHeader(purgeButtonAttrs) }, listModel.isEmptyAndDone() ? mithril_default(ColumnEmptyMessageBox, {
				icon: BootIcons.Mail,
				message: "noMails_msg",
				color: theme.list_message_bg
			}) : mithril_default(List, {
				state: listModel.stateStream(),
				renderConfig: this.renderConfig,
				onLoadMore() {
					listModel.loadMore();
				},
				onRetryLoading() {
					listModel.retryLoading();
				},
				onSingleSelection: (item) => {
					vnode.attrs.onSingleSelection(item);
				},
				onSingleTogglingMultiselection: (item) => {
					vnode.attrs.onSingleInclusiveSelection(item, styles.isSingleColumnLayout());
				},
				onRangeSelectionTowards: (item) => {
					vnode.attrs.onRangeSelectionTowards(item);
				},
				onStopLoading() {
					listModel.stopLoading();
				}
			}))
);
	}
	renderListHeader(purgeButtonAttrs) {
		return mithril_default(".flex.col", [this.showingSpamOrTrash ? [mithril_default(".flex.flex-column.plr-l", [mithril_default(".small.flex-grow.pt", lang.get("storageDeletion_msg")), mithril_default(".mr-negative-s.align-self-end", mithril_default(Button, purgeButtonAttrs))])] : null]);
	}
	async targetInbox() {
		const selectedFolder = this.mailViewModel.getFolder();
		if (selectedFolder) {
			const mailDetails = await this.mailViewModel.getMailboxDetails();
			if (mailDetails.mailbox.folders) {
				const folders = await mailLocator.mailModel.getMailboxFoldersForId(mailDetails.mailbox.folders._id);
				return isOfTypeOrSubfolderOf(folders, selectedFolder, MailSetKind.ARCHIVE) || selectedFolder.folderType === MailSetKind.TRASH;
			}
		}
		return false;
	}
	async onSwipeLeft(listElement) {
		const wereDeleted = await promptAndDeleteMails(mailLocator.mailModel, [listElement], () => this.mailViewModel.listModel?.selectNone());
		return wereDeleted ? ListSwipeDecision.Commit : ListSwipeDecision.Cancel;
	}
	async onSwipeRight(listElement) {
		if (this.showingDraft) {
			this.mailViewModel.listModel?.selectNone();
			return ListSwipeDecision.Cancel;
		} else {
			const folders = await mailLocator.mailModel.getMailboxFoldersForMail(listElement);
			if (folders) {
				const targetMailFolder = this.showingSpamOrTrash ? this.getRecoverFolder(listElement, folders) : assertNotNull(folders.getSystemFolderByType(this.showingArchive ? MailSetKind.INBOX : MailSetKind.ARCHIVE));
				const wereMoved = await moveMails({
					mailboxModel: locator.mailboxModel,
					mailModel: mailLocator.mailModel,
					mails: [listElement],
					targetMailFolder
				});
				return wereMoved ? ListSwipeDecision.Commit : ListSwipeDecision.Cancel;
			} else return ListSwipeDecision.Cancel;
		}
	}
	renderLeftSpacer() {
		return this.showingDraft ? [mithril_default(Icon, { icon: Icons.Cancel }), mithril_default(".pl-s", lang.get("cancel_action"))] : [mithril_default(Icon, { icon: Icons.Folder }), mithril_default(".pl-s", this.showingSpamOrTrash ? lang.get("recover_label") : this.showingArchive ? lang.get("received_action") : lang.get("archive_label"))];
	}
	renderRightSpacer() {
		return [mithril_default(Icon, { icon: Icons.Trash }), mithril_default(".pl-s", lang.get("delete_action"))];
	}
};
function isExportDragEvent(event) {
	return canDoDragAndDropExport() && isDragAndDropModifierHeld(event);
}
function isDragAndDropModifierHeld(event) {
	return event.ctrlKey || event.altKey || event.key != null && isKeyPressed(event.key, Keys.CTRL, Keys.ALT);
}

//#endregion
//#region src/mail-app/mail/view/EditFolderDialog.ts
async function showEditFolderDialog(mailBoxDetail, editedFolder = null, parentFolder = null) {
	const noParentFolderOption = lang.get("comboBoxSelectionNone_msg");
	const mailGroupId = mailBoxDetail.mailGroup._id;
	const folders = await mailLocator.mailModel.getMailboxFoldersForId(assertNotNull(mailBoxDetail.mailbox.folders)._id);
	let folderNameValue = editedFolder?.name ?? "";
	let targetFolders = folders.getIndentedList(editedFolder).filter((folderInfo) => !(editedFolder === null && isSpamOrTrashFolder(folders, folderInfo.folder))).map((folderInfo) => {
		return {
			name: getIndentedFolderNameForDropdown(folderInfo),
			value: folderInfo.folder
		};
	});
	targetFolders = [{
		name: noParentFolderOption,
		value: null
	}, ...targetFolders];
	let selectedParentFolder = parentFolder;
	let form = () => [mithril_default(TextField, {
		label: editedFolder ? "rename_action" : "folderName_label",
		value: folderNameValue,
		oninput: (newInput) => {
			folderNameValue = newInput;
		}
	}), mithril_default(DropDownSelector, {
		label: "parentFolder_label",
		items: targetFolders,
		selectedValue: selectedParentFolder,
		selectedValueDisplay: selectedParentFolder ? getFolderName(selectedParentFolder) : noParentFolderOption,
		selectionChangedHandler: (newFolder) => selectedParentFolder = newFolder,
		helpLabel: () => selectedParentFolder ? getPathToFolderString(folders, selectedParentFolder) : ""
	})];
	async function getMailIdsGroupedByListId(folder) {
		const mailSetEntries = await locator.entityClient.loadAll(MailSetEntryTypeRef, folder.entries);
		return groupByAndMap(mailSetEntries, (mse) => listIdPart(mse.mail), (mse) => elementIdPart(mse.mail));
	}
	async function loadAllMailsOfFolder(folder, reportableMails) {
		const mailIdsPerBag = await getMailIdsGroupedByListId(folder);
		for (const [mailListId, mailIds] of mailIdsPerBag) reportableMails.push(...await locator.entityClient.loadMultiple(MailTypeRef, mailListId, mailIds));
	}
	const okAction = async (dialog) => {
		dialog.close();
		try {
			if (editedFolder === null) await locator.mailFacade.createMailFolder(folderNameValue, selectedParentFolder?._id ?? null, mailGroupId);
else if (selectedParentFolder?.folderType === MailSetKind.TRASH && !isSameId(selectedParentFolder._id, editedFolder.parentFolder)) {
				const confirmed = await Dialog.confirm(lang.makeTranslation("confirm", lang.get("confirmDeleteCustomFolder_msg", { "{1}": getFolderName(editedFolder) })));
				if (!confirmed) return;
				await locator.mailFacade.updateMailFolderName(editedFolder, folderNameValue);
				await mailLocator.mailModel.trashFolderAndSubfolders(editedFolder);
			} else if (selectedParentFolder?.folderType === MailSetKind.SPAM && !isSameId(selectedParentFolder._id, editedFolder.parentFolder)) {
				const confirmed = await Dialog.confirm(lang.makeTranslation("confirm", lang.get("confirmSpamCustomFolder_msg", { "{1}": getFolderName(editedFolder) })));
				if (!confirmed) return;
				const descendants = folders.getDescendantFoldersOfParent(editedFolder._id).sort((l, r) => r.level - l.level);
				let reportableMails = [];
				await loadAllMailsOfFolder(editedFolder, reportableMails);
				for (const descendant of descendants) await loadAllMailsOfFolder(descendant.folder, reportableMails);
				await reportMailsAutomatically(MailReportType.SPAM, locator.mailboxModel, mailLocator.mailModel, mailBoxDetail, reportableMails);
				await locator.mailFacade.updateMailFolderName(editedFolder, folderNameValue);
				await mailLocator.mailModel.sendFolderToSpam(editedFolder);
			} else {
				await locator.mailFacade.updateMailFolderName(editedFolder, folderNameValue);
				await locator.mailFacade.updateMailFolderParent(editedFolder, selectedParentFolder?._id || null);
			}
		} catch (error) {
			if (isOfflineError(error) || !(error instanceof LockedError)) throw error;
		}
	};
	Dialog.showActionDialog({
		title: editedFolder ? "editFolder_action" : "addFolder_action",
		child: form,
		validator: () => checkFolderName(mailBoxDetail, folders, folderNameValue, mailGroupId, selectedParentFolder?._id ?? null),
		allowOkWithReturn: true,
		okAction
	});
}
function checkFolderName(mailboxDetail, folders, name, mailGroupId, parentFolderId) {
	if (name.trim() === "") return "folderNameNeutral_msg";
else if (folders.getCustomFoldersOfParent(parentFolderId).some((f) => f.name === name)) return "folderNameInvalidExisting_msg";
else return null;
}

//#endregion
//#region src/mail-app/mail/view/MailFolderRow.ts
var MailFolderRow = class {
	hovered = false;
	onupdate(vnode) {
		if (isNavButtonSelected(vnode.attrs.button)) this.hovered = true;
	}
	view(vnode) {
		const { count, button, rightButton, expanded, indentationLevel, folder, hasChildren, editMode } = vnode.attrs;
		const icon = getFolderIcon(folder);
		const onHover = () => {
			vnode.attrs.onHover();
			this.hovered = true;
		};
		const handleForwardsTab = (event) => {
			if (event.key === "Tab" && !event.shiftKey) this.hovered = false;
		};
		const handleBackwardsTab = (event) => {
			if (event.key === "Tab" && event.shiftKey) this.hovered = false;
		};
		const indentationMargin = indentationLevel * size.hpad;
		const paddingNeeded = size.hpad_button;
		const buttonWidth = size.icon_size_large + paddingNeeded * 2;
		return mithril_default(".folder-row.flex.flex-row.mlr-button.border-radius-small.state-bg", {
			style: { background: isNavButtonSelected(button) ? stateBgHover : "" },
			title: lang.getTranslationText(button.label),
			onmouseenter: onHover,
			onmouseleave: () => {
				this.hovered = false;
			}
		}, [
			hasChildren && !expanded ? mithril_default(Icon, {
				style: {
					position: "absolute",
					bottom: px(9),
					left: px(5 + indentationMargin + buttonWidth / 2),
					fill: isNavButtonSelected(button) ? theme.navigation_button_selected : theme.navigation_button
				},
				icon: Icons.Add,
				class: "icon-small"
			}) : null,
			mithril_default("", { style: { marginLeft: px(indentationMargin) } }),
			this.renderHierarchyLine(vnode.attrs, indentationMargin),
			mithril_default("button.flex.items-center.justify-end" + (editMode || !hasChildren ? ".no-hover" : ""), {
				style: {
					left: px(indentationMargin),
					width: px(buttonWidth),
					height: px(size.button_height),
					paddingLeft: px(paddingNeeded),
					paddingRight: px(paddingNeeded),
					zIndex: 3
				},
				"data-testid": `btn:icon:${getFolderName(folder)}`,
				"data-expanded": vnode.attrs.expanded ? "true" : "false",
				onclick: vnode.attrs.onExpanderClick,
				onkeydown: handleBackwardsTab
			}, mithril_default(Icon, {
				icon,
				size: IconSize.Medium,
				style: { fill: isNavButtonSelected(button) ? theme.navigation_button_selected : theme.navigation_button }
			})),
			mithril_default(NavButton, {
				...button,
				onfocus: onHover,
				onkeydown: handleBackwardsTab
			}),
			rightButton && (editMode || !client.isMobileDevice() && this.hovered) ? mithril_default(IconButton, {
				...rightButton,
				click: (event, dom) => {
					rightButton.click(event, dom);
				},
				onkeydown: handleForwardsTab
			}) : mithril_default("", { style: { marginRight: px(size.hpad_button) } }, [mithril_default(CounterBadge, {
				count,
				color: theme.navigation_button_icon,
				background: getNavButtonIconBackground(),
				showFullCount: true
			})])
		]);
	}
	renderHierarchyLine({ indentationLevel, numberOfPreviousRows, isLastSibling, onSelectedPath }, indentationMargin) {
		const lineSize = 2;
		const border = `${lineSize}px solid ${theme.content_border}`;
		const verticalOffsetInsideRow = size.button_height / 2 + 1;
		const verticalOffsetForParent = (size.button_height - size.icon_size_large) / 2;
		const lengthOfHorizontalLine = size.hpad - 2;
		const leftOffset = indentationMargin;
		return indentationLevel !== 0 ? [isLastSibling || onSelectedPath ? mithril_default(".abs", { style: {
			width: px(lengthOfHorizontalLine),
			borderBottomLeftRadius: "3px",
			height: px(1 + verticalOffsetInsideRow + verticalOffsetForParent + numberOfPreviousRows * size.button_height),
			top: px(-verticalOffsetForParent - numberOfPreviousRows * size.button_height),
			left: px(leftOffset),
			borderLeft: border,
			borderBottom: border,
			zIndex: onSelectedPath ? 2 : 1
		} }) : mithril_default(".abs", { style: {
			height: px(lineSize),
			top: px(verticalOffsetInsideRow),
			left: px(leftOffset),
			width: px(lengthOfHorizontalLine),
			backgroundColor: theme.content_border
		} })] : null;
	}
};

//#endregion
//#region src/mail-app/mail/view/MailFoldersView.ts
var MailFoldersView = class {
	visibleRow = null;
	view({ attrs }) {
		const { mailboxDetail, mailModel } = attrs;
		const groupCounters = mailModel.mailboxCounters()[mailboxDetail.mailGroup._id] || {};
		const folders = mailModel.getFolderSystemByGroupId(mailboxDetail.mailGroup._id);
		const customSystems = folders?.customSubtrees ?? [];
		const systemSystems = folders?.systemSubtrees.filter((f) => f.folder.folderType !== MailSetKind.Imported) ?? [];
		const children = [];
		const selectedFolder = folders?.getIndentedList().map((f) => f.folder).find((f) => isSelectedPrefix(MAIL_PREFIX + "/" + getElementId(f)));
		const path = folders && selectedFolder ? folders.getPathToFolder(selectedFolder._id) : [];
		const isInternalUser = locator.logins.isInternalUserLoggedIn();
		const systemChildren = folders && this.renderFolderTree(systemSystems, groupCounters, folders, attrs, path, isInternalUser);
		if (systemChildren) children.push(...systemChildren.children);
		if (isInternalUser) {
			const customChildren = folders ? this.renderFolderTree(customSystems, groupCounters, folders, attrs, path, isInternalUser).children : [];
			children.push(mithril_default(SidebarSection, {
				name: "yourFolders_action",
				button: attrs.inEditMode ? this.renderCreateFolderAddButton(null, attrs) : this.renderEditFoldersButton(attrs),
				key: "yourFolders"
			}, customChildren));
			children.push(this.renderAddFolderButtonRow(attrs));
		}
		return children;
	}
	renderFolderTree(subSystems, groupCounters, folders, attrs, path, isInternalUser, indentationLevel = 0) {
		const result = {
			children: [],
			numRows: 0
		};
		for (let system of subSystems) {
			const id = getElementId(system.folder);
			const folderName = getFolderName(system.folder);
			const button = {
				label: lang.makeTranslation(`folder:${folderName}`, folderName),
				href: () => {
					if (attrs.inEditMode) return mithril_default.route.get();
else {
						const folderElementId = getElementId(system.folder);
						const mailId = attrs.mailFolderElementIdToSelectedMailId.get(folderElementId);
						if (mailId) return `${MAIL_PREFIX}/${folderElementId}/${mailId}`;
else return `${MAIL_PREFIX}/${folderElementId}`;
					}
				},
				isSelectedPrefix: attrs.inEditMode ? false : MAIL_PREFIX + "/" + getElementId(system.folder),
				colors: NavButtonColor.Nav,
				click: () => attrs.onFolderClick(system.folder),
				dropHandler: (dropData) => attrs.onFolderDrop(dropData, system.folder),
				disableHoverBackground: true,
				disabled: attrs.inEditMode
			};
			const currentExpansionState = attrs.inEditMode ? true : attrs.expandedFolders.has(getElementId(system.folder)) ?? false;
			const hasChildren = system.children.length > 0;
			const counterId = getElementId(system.folder);
			const summedCount = !currentExpansionState && hasChildren ? this.getTotalFolderCounter(groupCounters, system) : groupCounters[counterId];
			const childResult = hasChildren && currentExpansionState ? this.renderFolderTree(system.children, groupCounters, folders, attrs, path, isInternalUser, indentationLevel + 1) : {
				children: null,
				numRows: 0
			};
			const isTrashOrSpam = system.folder.folderType === MailSetKind.TRASH || system.folder.folderType === MailSetKind.SPAM;
			const isRightButtonVisible = this.visibleRow === id;
			const rightButton = isInternalUser && !isTrashOrSpam && (isRightButtonVisible || attrs.inEditMode) ? this.createFolderMoreButton(system.folder, folders, attrs, () => {
				this.visibleRow = null;
			}) : null;
			const render = mithril_default.fragment({ key: id }, [mithril_default(MailFolderRow, {
				count: attrs.inEditMode ? 0 : summedCount,
				button,
				folder: system.folder,
				rightButton,
				expanded: hasChildren ? currentExpansionState : null,
				indentationLevel: Math.min(indentationLevel, MAX_FOLDER_INDENT_LEVEL),
				onExpanderClick: hasChildren ? () => attrs.onFolderExpanded(system.folder, currentExpansionState) : noOp,
				hasChildren,
				onSelectedPath: path.includes(system.folder),
				numberOfPreviousRows: result.numRows,
				isLastSibling: last(subSystems) === system,
				editMode: attrs.inEditMode,
				onHover: () => {
					this.visibleRow = id;
				}
			}), childResult.children]);
			result.numRows += childResult.numRows + 1;
			result.children.push(render);
		}
		return result;
	}
	renderAddFolderButtonRow(attrs) {
		return mithril_default(RowButton, {
			label: "addFolder_action",
			key: "addFolder",
			icon: Icons.Add,
			class: "folder-row mlr-button border-radius-small",
			style: { width: `calc(100% - ${px(size.hpad_button * 2)})` },
			onclick: () => {
				attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, null, null);
			}
		});
	}
	getTotalFolderCounter(counters, system) {
		const counterId = getElementId(system.folder);
		return (counters[counterId] ?? 0) + system.children.reduce((acc, child) => acc + this.getTotalFolderCounter(counters, child), 0);
	}
	createFolderMoreButton(folder, folders, attrs, onClose) {
		return attachDropdown({
			mainButtonAttrs: {
				title: "more_label",
				icon: Icons.More,
				colors: ButtonColor.Nav,
				size: ButtonSize.Compact
			},
			childAttrs: () => {
				return folder.folderType === MailSetKind.CUSTOM ? isSpamOrTrashFolder(folders, folder) ? [this.editButtonAttrs(attrs, folders, folder), this.deleteButtonAttrs(attrs, folder)] : [
					this.editButtonAttrs(attrs, folders, folder),
					this.addButtonAttrs(attrs, folder),
					this.deleteButtonAttrs(attrs, folder)
				] : [this.addButtonAttrs(attrs, folder)];
			},
			onClose
		});
	}
	deleteButtonAttrs(attrs, folder) {
		return {
			label: "delete_action",
			icon: Icons.Trash,
			click: () => {
				attrs.onDeleteCustomMailFolder(folder);
			}
		};
	}
	addButtonAttrs(attrs, folder) {
		return {
			label: "addFolder_action",
			icon: Icons.Add,
			click: () => {
				attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, null, folder);
			}
		};
	}
	editButtonAttrs(attrs, folders, folder) {
		return {
			label: "edit_action",
			icon: Icons.Edit,
			click: () => {
				attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, folder, folder.parentFolder ? folders.getFolderById(elementIdPart(folder.parentFolder)) : null);
			}
		};
	}
	renderCreateFolderAddButton(parentFolder, attrs) {
		return mithril_default(IconButton, {
			title: "addFolder_action",
			click: () => {
				return attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, null, parentFolder);
			},
			icon: Icons.Add,
			size: ButtonSize.Compact
		});
	}
	renderEditFoldersButton(attrs) {
		return mithril_default(IconButton, {
			title: "edit_action",
			click: () => attrs.onEditMailbox(),
			icon: Icons.Edit,
			size: ButtonSize.Compact
		});
	}
};

//#endregion
//#region src/mail-app/mail/view/EditFoldersDialog.ts
var EditFoldersDialog = class EditFoldersDialog {
	visible;
	_shortcuts;
	_domDialog = null;
	/** The element that was focused before we've shown the component so that we can return it back upon closing. */
	focusedBeforeShown = null;
	_closeHandler = null;
	usedBottomNavBefore = styles.isUsingBottomNavigation();
	constructor(folderList) {
		this.folderList = folderList;
		this.visible = false;
		this._shortcuts = [
			{
				key: Keys.RETURN,
				shift: false,
				exec: () => this.close(),
				help: "close_alt"
			},
			{
				key: Keys.ESC,
				shift: false,
				exec: () => this.close(),
				help: "close_alt"
			},
			{
				key: Keys.TAB,
				shift: true,
				exec: () => this._domDialog ? focusPrevious(this._domDialog) : false,
				help: "selectPrevious_action"
			},
			{
				key: Keys.TAB,
				shift: false,
				exec: () => this._domDialog ? focusNext(this._domDialog) : false,
				help: "selectNext_action"
			}
		];
		this.view = this.view.bind(this);
	}
	view() {
		if (this.usedBottomNavBefore !== styles.isUsingBottomNavigation()) this.close();
		this.usedBottomNavBefore = styles.isUsingBottomNavigation();
		const marginTop = this.usedBottomNavBefore ? "env(safe-area-inset-top)" : px(size.navbar_height);
		return mithril_default(".flex.col", {
			style: {
				width: px(size.first_col_max_width - size.button_height),
				height: `calc(100% - ${marginTop})`,
				marginTop,
				marginLeft: px(size.button_height)
			},
			onclick: (e) => e.stopPropagation(),
			oncreate: (vnode) => {
				this._domDialog = vnode.dom;
				let animation = null;
				const bgcolor = theme.navigation_bg;
				const children = Array.from(this._domDialog.children);
				for (let child of children) child.style.opacity = "0";
				this._domDialog.style.backgroundColor = `rgba(0, 0, 0, 0)`;
				animation = Promise.all([animations.add(this._domDialog, alpha(AlphaEnum.BackgroundColor, bgcolor, 0, 1)), animations.add(children, opacity(0, 1, true), { delay: DefaultAnimationTime / 2 })]);
				window.requestAnimationFrame(() => {
					const activeElement = document.activeElement;
					if (activeElement && typeof activeElement.blur === "function") activeElement.blur();
				});
				animation.then(() => {
					this.defaultFocusOnLoad();
				});
			}
		}, [mithril_default(".plr-button.mt.mb", mithril_default(LoginButton, {
			label: "done_action",
			onclick: () => this.close()
		})), mithril_default(".scroll.overflow-x-hidden.flex.col.flex-grow", { onscroll: (e) => {
			const target = e.target;
			target.style.borderTop = `1px solid ${theme.content_border}`;
		} }, this.folderList())]);
	}
	defaultFocusOnLoad() {
		const dom = assertNotNull(this._domDialog);
		let inputs = Array.from(dom.querySelectorAll(INPUT));
		if (inputs.length > 0) inputs[0].focus();
else {
			let button = dom.querySelector("button");
			if (button) button.focus();
		}
	}
	hideAnimation() {
		let bgcolor = getElevatedBackground();
		if (this._domDialog) return Promise.all([animations.add(this._domDialog.children, opacity(1, 0, true)), animations.add(this._domDialog, alpha(AlphaEnum.BackgroundColor, bgcolor, 1, 0), {
			delay: DefaultAnimationTime / 2,
			easing: ease.linear
		})]).then(noOp);
else return Promise.resolve();
	}
	show() {
		this.focusedBeforeShown = document.activeElement;
		modal.display(this);
		this.visible = true;
		return this;
	}
	close() {
		this.visible = false;
		modal.remove(this);
	}
	/**
	* Should be called to close a dialog. Notifies the closeHandler about the close attempt.
	*/
	onClose() {
		if (this._closeHandler) this._closeHandler();
else this.close();
	}
	shortcuts() {
		return this._shortcuts;
	}
	backgroundClick(e) {}
	popState(e) {
		this.onClose();
		return false;
	}
	callingElement() {
		return this.focusedBeforeShown;
	}
	addShortcut(shortcut) {
		this._shortcuts.push(shortcut);
		if (this.visible) keyManager.registerModalShortcuts([shortcut]);
		return this;
	}
	static showEdit(folders) {
		new EditFoldersDialog(folders).show();
	}
};

//#endregion
//#region src/mail-app/mail/view/EditLabelDialog.ts
const LIMIT_EXCEEDED_ERROR = "limitReached";
async function showEditLabelDialog(mailbox, mailViewModel, label) {
	let name = label ? label.name : "";
	let color = label && label.color ? label.color : "";
	async function onOkClicked(dialog) {
		dialog.close();
		try {
			if (label) await mailViewModel.editLabel(label, {
				name,
				color
			});
else if (mailbox) await mailViewModel.createLabel(mailbox, {
				name,
				color
			});
		} catch (error) {
			if (error instanceof PreconditionFailedError) if (error.data === LIMIT_EXCEEDED_ERROR) showNotAvailableForFreeDialog();
else Dialog.message("unknownError_msg");
else if (isOfflineError(error) || !(error instanceof LockedError)) throw error;
		}
	}
	Dialog.showActionDialog({
		title: label ? "editLabel_action" : "addLabel_action",
		allowCancel: true,
		okAction: (dialog) => {
			onOkClicked(dialog);
		},
		child: () => mithril_default(".flex.col.gap-vpad", [mithril_default(TextField, {
			label: "name_label",
			value: name,
			oninput: (newName) => {
				name = newName;
			}
		}), mithril_default(ColorPickerView, {
			value: color,
			onselect: (newColor) => {
				color = newColor;
			}
		})])
	});
}

//#endregion
//#region src/mail-app/mail/view/MailView.ts
assertMainOrNode();
var MailView = class extends BaseTopLevelView {
	listColumn;
	folderColumn;
	mailColumn;
	viewSlider;
	cache;
	oncreate;
	onremove;
	countersStream = null;
	expandedState;
	mailViewModel;
	get conversationViewModel() {
		return this.mailViewModel.getConversationViewModel();
	}
	constructor(vnode) {
		super();
		this.expandedState = new Set(deviceConfig.getExpandedFolders(locator.logins.getUserController().userId));
		this.cache = vnode.attrs.cache;
		this.folderColumn = this.createFolderColumn(null, vnode.attrs.drawerAttrs);
		this.mailViewModel = vnode.attrs.mailViewModel;
		this.listColumn = new ViewColumn({ view: () => {
			const folder = this.mailViewModel.getFolder();
			return mithril_default(BackgroundColumnLayout, {
				backgroundColor: theme.navigation_bg,
				desktopToolbar: () => mithril_default(DesktopListToolbar, mithril_default(SelectAllCheckbox, selectionAttrsForList(this.mailViewModel)), this.renderFilterButton()),
				columnLayout: folder ? mithril_default("", { style: { marginBottom: px(conversationCardMargin) } }, mithril_default(MailListView, {
					key: getElementId(folder),
					mailViewModel: this.mailViewModel,
					onSingleSelection: (mail) => {
						this.mailViewModel.onSingleSelection(mail);
						if (!this.mailViewModel.listModel?.isInMultiselect()) {
							this.viewSlider.focus(this.mailColumn);
							Promise.resolve().then(() => {
								const conversationViewModel = this.mailViewModel.getConversationViewModel();
								if (conversationViewModel && isSameId(mail._id, conversationViewModel.primaryMail._id)) conversationViewModel?.primaryViewModel().setUnread(false);
							});
						}
					},
					onSingleInclusiveSelection: (...args) => {
						this.mailViewModel?.onSingleInclusiveSelection(...args);
					},
					onRangeSelectionTowards: (...args) => {
						this.mailViewModel.onRangeSelectionTowards(...args);
					},
					onSingleExclusiveSelection: (...args) => {
						this.mailViewModel.onSingleExclusiveSelection(...args);
					},
					onClearFolder: async () => {
						const folder$1 = this.mailViewModel.getFolder();
						if (folder$1 == null) {
							console.warn("Cannot delete folder, no folder is selected");
							return;
						}
						const confirmed = await Dialog.confirm(lang.getTranslation("confirmDeleteFinallySystemFolder_msg", { "{1}": getFolderName(folder$1) }));
						if (confirmed) showProgressDialog("progressDeleting_msg", this.mailViewModel.finallyDeleteAllMailsInSelectedFolder(folder$1));
					}
				})) : null,
				mobileHeader: () => this.mailViewModel.listModel?.isInMultiselect() ? mithril_default(MultiselectMobileHeader, {
					...selectionAttrsForList(this.mailViewModel.listModel),
					message: getMailSelectionMessage(this.mailViewModel.listModel.getSelectedAsArray())
				}) : mithril_default(MobileHeader, {
					...vnode.attrs.header,
					title: this.listColumn.getTitle(),
					columnType: "first",
					actions: [this.renderFilterButton(), mithril_default(EnterMultiselectIconButton, { clickAction: () => {
						this.mailViewModel.listModel?.enterMultiselect();
					} })],
					primaryAction: () => this.renderHeaderRightView(),
					backAction: () => this.viewSlider.focusPreviousColumn()
				})
			});
		} }, ColumnType.Background, {
			minWidth: size.second_col_min_width,
			maxWidth: size.second_col_max_width,
			headerCenter: () => {
				const folder = this.mailViewModel.getFolder();
				return folder ? lang.makeTranslation("folder_name", getFolderName(folder)) : "emptyString_msg";
			}
		});
		this.mailColumn = new ViewColumn({ view: () => {
			const viewModel = this.conversationViewModel;
			if (viewModel) return this.renderSingleMailViewer(vnode.attrs.header, viewModel);
else return this.renderMultiMailViewer(vnode.attrs.header);
		} }, ColumnType.Background, {
			minWidth: size.third_col_min_width,
			maxWidth: size.third_col_max_width,
			ariaLabel: () => lang.get("email_label")
		});
		this.viewSlider = new ViewSlider([
			this.folderColumn,
			this.listColumn,
			this.mailColumn
		]);
		this.viewSlider.focusedColumn = this.listColumn;
		const shortcuts = this.getShortcuts();
		vnode.attrs.mailViewModel.init();
		this.oncreate = (vnode$1) => {
			this.countersStream = mailLocator.mailModel.mailboxCounters.map(mithril_default.redraw);
			keyManager.registerShortcuts(shortcuts);
			this.cache.conversationViewPreference = deviceConfig.getConversationViewShowOnlySelectedMail();
		};
		this.onremove = () => {
			this.mailViewModel.listModel?.cancelLoadAll();
			this.countersStream?.end(true);
			this.countersStream = null;
			keyManager.unregisterShortcuts(shortcuts);
		};
	}
	renderFilterButton() {
		return mithril_default(MailFilterButton, {
			filter: this.mailViewModel.filterType,
			setFilter: (filter) => this.mailViewModel.setFilter(filter)
		});
	}
	mailViewerSingleActions(viewModel) {
		return mithril_default(MailViewerActions, {
			mailboxModel: viewModel.primaryViewModel().mailboxModel,
			mailModel: viewModel.primaryViewModel().mailModel,
			mailViewerViewModel: viewModel.primaryViewModel(),
			mails: [viewModel.primaryMail]
		});
	}
	renderSingleMailViewer(header, viewModel) {
		return mithril_default(BackgroundColumnLayout, {
			backgroundColor: theme.navigation_bg,
			desktopToolbar: () => mithril_default(DesktopViewerToolbar, this.mailViewerSingleActions(viewModel)),
			mobileHeader: () => mithril_default(MobileHeader, {
				...header,
				backAction: () => {
					this.viewSlider.focusPreviousColumn();
				},
				columnType: "other",
				actions: null,
				multicolumnActions: () => this.mailViewerSingleActions(viewModel),
				primaryAction: () => this.renderHeaderRightView(),
				title: getConversationTitle(viewModel)
			}),
			columnLayout: mithril_default(ConversationViewer, {
				key: getElementId(viewModel.primaryMail),
				viewModel,
				delayBodyRendering: this.viewSlider.waitForAnimation()
			})
		});
	}
	mailViewerMultiActions() {
		return mithril_default(MailViewerActions, {
			mailboxModel: locator.mailboxModel,
			mailModel: mailLocator.mailModel,
			mails: this.mailViewModel.listModel?.getSelectedAsArray() ?? [],
			selectNone: () => this.mailViewModel.listModel?.selectNone()
		});
	}
	renderMultiMailViewer(header) {
		return mithril_default(BackgroundColumnLayout, {
			backgroundColor: theme.navigation_bg,
			desktopToolbar: () => mithril_default(DesktopViewerToolbar, this.mailViewerMultiActions()),
			mobileHeader: () => mithril_default(MobileHeader, {
				actions: this.mailViewerMultiActions(),
				primaryAction: () => this.renderHeaderRightView(),
				backAction: () => this.viewSlider.focusPreviousColumn(),
				...header,
				columnType: "other"
			}),
			columnLayout: mithril_default(MultiItemViewer, {
				selectedEntities: this.mailViewModel.listModel?.getSelectedAsArray() ?? [],
				selectNone: () => {
					this.mailViewModel.listModel?.selectNone();
				},
				loadAll: () => this.mailViewModel.listModel?.loadAll(),
				stopLoadAll: () => this.mailViewModel.listModel?.cancelLoadAll(),
				loadingAll: this.mailViewModel.listModel?.isLoadingAll() ? "loading" : this.mailViewModel.listModel?.loadingStatus === ListLoadingState.Done ? "loaded" : "can_load",
				getSelectionMessage: (selected) => getMailSelectionMessage(selected)
			})
		});
	}
	view({ attrs }) {
		return mithril_default("#mail.main-view", {
			ondragover: (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			},
			ondrop: (ev) => {
				if (isNewMailActionAvailable() && ev.dataTransfer?.files && ev.dataTransfer.files.length > 0) this.handleFileDrop({
					dropType: DropType.ExternalFile,
					files: fileListToArray(ev.dataTransfer.files)
				});
				ev.stopPropagation();
				ev.preventDefault();
			}
		}, mithril_default(this.viewSlider, {
			header: mithril_default(Header, {
				rightView: this.renderHeaderRightView(),
				searchBar: () => locator.logins.isInternalUserLoggedIn() ? mithril_default(LazySearchBar, {
					placeholder: lang.get("searchEmails_placeholder"),
					disabled: !locator.logins.isFullyLoggedIn()
				}) : null,
				...attrs.header
			}),
			bottomNav: styles.isSingleColumnLayout() && this.viewSlider.focusedColumn === this.mailColumn && this.conversationViewModel ? mithril_default(MobileMailActionBar, { viewModel: this.conversationViewModel.primaryViewModel() }) : styles.isSingleColumnLayout() && this.mailViewModel.listModel?.isInMultiselect() ? mithril_default(MobileMailMultiselectionActionBar, {
				mails: this.mailViewModel.listModel.getSelectedAsArray(),
				selectNone: () => this.mailViewModel.listModel?.selectNone(),
				mailModel: mailLocator.mailModel,
				mailboxModel: locator.mailboxModel
			}) : mithril_default(BottomNav)
		}));
	}
	getViewSlider() {
		return this.viewSlider;
	}
	handleBackButton() {
		const listModel = this.mailViewModel.listModel;
		if (listModel && listModel.isInMultiselect()) {
			listModel.selectNone();
			return true;
		} else if (this.viewSlider.isFirstBackgroundColumnFocused()) {
			const folder = this.mailViewModel.getFolder();
			if (folder == null || getMailFolderType(folder) !== MailSetKind.INBOX) {
				this.mailViewModel.switchToFolder(MailSetKind.INBOX);
				return true;
			} else return false;
		} else return false;
	}
	renderHeaderRightView() {
		return isNewMailActionAvailable() ? [mithril_default(IconButton, {
			title: "newMail_action",
			click: () => this.showNewMailDialog().catch(ofClass(PermissionError, noOp)),
			icon: Icons.PencilSquare
		})] : null;
	}
	getShortcuts() {
		return [
			...listSelectionKeyboardShortcuts(MultiselectMode.Enabled, () => this.mailViewModel),
			{
				key: Keys.N,
				exec: () => {
					this.showNewMailDialog().catch(ofClass(PermissionError, noOp));
				},
				enabled: () => !!this.mailViewModel.getFolder() && isNewMailActionAvailable(),
				help: "newMail_action"
			},
			{
				key: Keys.DELETE,
				exec: () => {
					if (this.mailViewModel.listModel) this.deleteMails(this.mailViewModel.listModel.getSelectedAsArray());
				},
				help: "deleteEmails_action"
			},
			{
				key: Keys.BACKSPACE,
				exec: () => {
					if (this.mailViewModel.listModel) this.deleteMails(this.mailViewModel.listModel.getSelectedAsArray());
				},
				help: "deleteEmails_action"
			},
			{
				key: Keys.A,
				exec: () => {
					if (this.mailViewModel.listModel) archiveMails(this.mailViewModel.listModel.getSelectedAsArray());
					return true;
				},
				help: "archive_action",
				enabled: () => locator.logins.isInternalUserLoggedIn()
			},
			{
				key: Keys.I,
				exec: () => {
					if (this.mailViewModel.listModel) moveToInbox(this.mailViewModel.listModel.getSelectedAsArray());
					return true;
				},
				help: "moveToInbox_action"
			},
			{
				key: Keys.V,
				exec: () => {
					this.moveMails();
					return true;
				},
				help: "move_action"
			},
			{
				key: Keys.L,
				exec: () => {
					this.labels();
					return true;
				},
				help: "labels_label"
			},
			{
				key: Keys.U,
				exec: () => {
					if (this.mailViewModel.listModel) this.toggleUnreadMails(this.mailViewModel.listModel.getSelectedAsArray());
				},
				help: "toggleUnread_action"
			},
			{
				key: Keys.ONE,
				exec: () => {
					this.mailViewModel.switchToFolder(MailSetKind.INBOX);
					return true;
				},
				help: "switchInbox_action"
			},
			{
				key: Keys.TWO,
				exec: () => {
					this.mailViewModel.switchToFolder(MailSetKind.DRAFT);
					return true;
				},
				help: "switchDrafts_action"
			},
			{
				key: Keys.THREE,
				exec: () => {
					this.mailViewModel.switchToFolder(MailSetKind.SENT);
					return true;
				},
				help: "switchSentFolder_action"
			},
			{
				key: Keys.FOUR,
				exec: () => {
					this.mailViewModel.switchToFolder(MailSetKind.TRASH);
					return true;
				},
				help: "switchTrash_action"
			},
			{
				key: Keys.FIVE,
				exec: () => {
					this.mailViewModel.switchToFolder(MailSetKind.ARCHIVE);
					return true;
				},
				enabled: () => locator.logins.isInternalUserLoggedIn(),
				help: "switchArchive_action"
			},
			{
				key: Keys.SIX,
				exec: () => {
					this.mailViewModel.switchToFolder(MailSetKind.SPAM);
					return true;
				},
				enabled: () => locator.logins.isInternalUserLoggedIn() && !locator.logins.isEnabled(FeatureType.InternalCommunication),
				help: "switchSpam_action"
			},
			{
				key: Keys.CTRL,
				exec: () => false,
				enabled: canDoDragAndDropExport,
				help: "dragAndDrop_action"
			},
			{
				key: Keys.P,
				exec: () => {
					this.pressRelease();
					return true;
				},
				help: "emptyString_msg",
				enabled: () => locator.logins.isEnabled(FeatureType.Newsletter)
			}
		];
	}
	async pressRelease() {
		const { openPressReleaseEditor } = await import("./PressReleaseEditor-chunk.js");
		const mailboxDetails = await this.mailViewModel.getMailboxDetails();
		if (mailboxDetails) openPressReleaseEditor(mailboxDetails);
	}
	moveMails() {
		const mailList = this.mailViewModel.listModel;
		if (mailList == null) return;
		const selectedMails = mailList.getSelectedAsArray();
		showMoveMailsDropdown(locator.mailboxModel, mailLocator.mailModel, getMoveMailBounds(), selectedMails);
	}
	/**
	*Shortcut Method to show Labels dropdown only when atleast one mail is selected.
	*/
	labels() {
		const mailList = this.mailViewModel.listModel;
		if (mailList == null || !mailLocator.mailModel.canAssignLabels()) return;
		const labels = mailLocator.mailModel.getLabelStatesForMails(mailList.getSelectedAsArray());
		const selectedMails = mailList.getSelectedAsArray();
		if (isEmpty(labels) || isEmpty(selectedMails)) return;
		const popup = new LabelsPopup(document.activeElement, getMoveMailBounds(), styles.isDesktopLayout() ? 300 : 200, mailLocator.mailModel.getLabelsForMails(selectedMails), mailLocator.mailModel.getLabelStatesForMails(selectedMails), (addedLabels, removedLabels) => mailLocator.mailModel.applyLabels(selectedMails, addedLabels, removedLabels));
		popup.show();
	}
	createFolderColumn(editingFolderForMailGroup = null, drawerAttrs) {
		return new ViewColumn({ view: () => {
			return mithril_default(FolderColumnView, {
				drawer: drawerAttrs,
				button: editingFolderForMailGroup ? null : !styles.isUsingBottomNavigation() && isNewMailActionAvailable() ? {
					label: "newMail_action",
					click: () => this.showNewMailDialog().catch(ofClass(PermissionError, noOp))
				} : null,
				content: this.renderFoldersAndLabels(editingFolderForMailGroup),
				ariaLabel: "folderTitle_label"
			});
		} }, editingFolderForMailGroup ? ColumnType.Background : ColumnType.Foreground, {
			minWidth: size.first_col_min_width,
			maxWidth: size.first_col_max_width,
			headerCenter: "folderTitle_label"
		});
	}
	renderFoldersAndLabels(editingFolderForMailGroup) {
		const details = locator.mailboxModel.mailboxDetails() ?? [];
		return [...details.map((mailboxDetail) => {
			return this.renderFoldersAndLabelsForMailbox(mailboxDetail, editingFolderForMailGroup);
		})];
	}
	renderFoldersAndLabelsForMailbox(mailboxDetail, editingFolderForMailGroup) {
		const inEditMode = editingFolderForMailGroup === mailboxDetail.mailGroup._id;
		if (editingFolderForMailGroup && !inEditMode) return null;
else return mithril_default(SidebarSection, { name: lang.makeTranslation("mailbox_name", getMailboxName(locator.logins, mailboxDetail)) }, [this.createMailboxFolderItems(mailboxDetail, inEditMode, () => {
			EditFoldersDialog.showEdit(() => this.renderFoldersAndLabels(mailboxDetail.mailGroup._id));
		}), mailLocator.mailModel.canManageLabels() ? this.renderMailboxLabelItems(mailboxDetail, inEditMode, () => {
			EditFoldersDialog.showEdit(() => this.renderFoldersAndLabels(mailboxDetail.mailGroup._id));
		}) : null]);
	}
	createMailboxFolderItems(mailboxDetail, inEditMode, onEditMailbox) {
		return mithril_default(MailFoldersView, {
			mailModel: mailLocator.mailModel,
			mailboxDetail,
			expandedFolders: this.expandedState,
			mailFolderElementIdToSelectedMailId: this.mailViewModel.getMailFolderToSelectedMail(),
			onFolderClick: () => {
				if (!inEditMode) this.viewSlider.focus(this.listColumn);
			},
			onFolderExpanded: (folder, state) => this.setExpandedState(folder, state),
			onShowFolderAddEditDialog: (...args) => this.showFolderAddEditDialog(...args),
			onDeleteCustomMailFolder: (folder) => this.deleteCustomMailFolder(mailboxDetail, folder),
			onFolderDrop: (dropData, folder) => {
				if (dropData.dropType == DropType.Mail) this.handleFolderMailDrop(dropData, folder);
else if (dropData.dropType == DropType.ExternalFile) this.handeFolderFileDrop(dropData, mailboxDetail, folder);
			},
			inEditMode,
			onEditMailbox
		});
	}
	setExpandedState(folder, currentExpansionState) {
		if (currentExpansionState) this.expandedState.delete(getElementId(folder));
else this.expandedState.add(getElementId(folder));
		deviceConfig.setExpandedFolders(locator.logins.getUserController().userId, [...this.expandedState]);
	}
	onNewUrl(args, requestedPath) {
		if (requestedPath.startsWith("/mailto")) {
			if (location.hash.length > 5) {
				let url = location.hash.substring(5);
				let decodedUrl = decodeURIComponent(url);
				Promise.all([locator.mailboxModel.getUserMailboxDetails(), import("./MailEditor2-chunk.js")]).then(([mailboxDetails, { newMailtoUrlMailEditor }]) => {
					newMailtoUrlMailEditor(decodedUrl, false, mailboxDetails).then((editor) => editor.show()).catch(ofClass(CancelledError, noOp));
					history.pushState("", document.title, window.location.pathname);
				});
			}
		}
		if (isApp()) {
			let userGroupInfo = locator.logins.getUserController().userGroupInfo;
			locator.pushService.closePushNotification(userGroupInfo.mailAddressAliases.map((alias) => alias.mailAddress).concat(userGroupInfo.mailAddress || []));
		}
		if (typeof args.mail === "string") {
			const [mailListId, mailId] = args.mail.split(",");
			if (mailListId && mailId) {
				this.mailViewModel.showStickyMail([mailListId, mailId], () => showSnackBar({
					message: "mailMoved_msg",
					button: {
						label: "ok_action",
						click: noOp
					}
				}));
				this.viewSlider.focus(this.mailColumn);
			} else this.showMail(args);
		} else this.showMail(args);
	}
	showMail(args) {
		this.mailViewModel.showMailWithMailSetId(args.folderId, args.mailId);
		if (styles.isSingleColumnLayout() && !args.mailId && this.viewSlider.focusedColumn === this.mailColumn) this.viewSlider.focus(this.listColumn);
	}
	async handleFileDrop(fileDrop) {
		try {
			const [mailbox, dataFiles, { appendEmailSignature }, { newMailEditorFromTemplate }] = await Promise.all([
				this.mailViewModel.getMailboxDetails(),
				readLocalFiles(fileDrop.files),
				import("./Signature2-chunk.js"),
				import("./MailEditor2-chunk.js")
			]);
			if (mailbox != null) {
				const dialog = await newMailEditorFromTemplate(mailbox, {}, "", appendEmailSignature("", locator.logins.getUserController().props), dataFiles);
				dialog.show();
			}
		} catch (e) {
			if (!(e instanceof PermissionError)) throw e;
		}
	}
	async handleFolderMailDrop(dropData, folder) {
		const { mailId } = dropData;
		if (!this.mailViewModel.listModel) return;
		let mailsToMove = [];
		if (this.mailViewModel.listModel.isItemSelected(mailId)) mailsToMove = this.mailViewModel.listModel.getSelectedAsArray();
else {
			const entity = this.mailViewModel.listModel.getMail(mailId);
			if (entity) mailsToMove.push(entity);
		}
		moveMails({
			mailboxModel: locator.mailboxModel,
			mailModel: mailLocator.mailModel,
			mails: mailsToMove,
			targetMailFolder: folder
		});
	}
	async handeFolderFileDrop(dropData, mailboxDetail, mailFolder) {
		function droppedOnlyMailFiles(files) {
			return files.every((f) => f.name.endsWith(".eml") || f.name.endsWith(".mbox"));
		}
		await this.handleFileDrop(dropData);
	}
	async showNewMailDialog() {
		const mailboxDetails = await this.mailViewModel.getMailboxDetails();
		if (mailboxDetails == null) return;
		const { newMailEditor } = await import("./MailEditor2-chunk.js");
		const dialog = await newMailEditor(mailboxDetails);
		dialog.show();
	}
	async deleteCustomMailFolder(mailboxDetail, folder) {
		if (folder.folderType !== MailSetKind.CUSTOM) throw new Error("Cannot delete non-custom folder: " + String(folder._id));
		this.mailViewModel?.listModel?.selectNone();
		if (mailboxDetail.mailbox.folders == null) return;
		const folders = await mailLocator.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id);
		if (isSpamOrTrashFolder(folders, folder)) {
			const confirmed = await Dialog.confirm(lang.getTranslation("confirmDeleteFinallyCustomFolder_msg", { "{1}": getFolderName(folder) }));
			if (!confirmed) return;
			await mailLocator.mailModel.finallyDeleteCustomMailFolder(folder);
		} else {
			const confirmed = await Dialog.confirm(lang.getTranslation("confirmDeleteCustomFolder_msg", { "{1}": getFolderName(folder) }));
			if (!confirmed) return;
			await mailLocator.mailModel.trashFolderAndSubfolders(folder);
		}
	}
	logout() {
		mithril_default.route.set("/");
	}
	async toggleUnreadMails(mails) {
		if (mails.length == 0) return;
		await mailLocator.mailModel.markMails(mails, !mails[0].unread);
	}
	deleteMails(mails) {
		return promptAndDeleteMails(mailLocator.mailModel, mails, noOp);
	}
	async showFolderAddEditDialog(mailGroupId, folder, parentFolder) {
		const mailboxDetail = await locator.mailboxModel.getMailboxDetailsForMailGroup(mailGroupId);
		await showEditFolderDialog(mailboxDetail, folder, parentFolder);
	}
	async showLabelAddDialog(mailbox) {
		await showEditLabelDialog(mailbox, this.mailViewModel, null);
	}
	async showLabelEditDialog(label) {
		await showEditLabelDialog(null, this.mailViewModel, label);
	}
	async showLabelDeleteDialog(label) {
		const confirmed = await Dialog.confirm(lang.getTranslation("confirmDeleteLabel_msg", { "{1}": label.name }));
		if (!confirmed) return;
		await this.mailViewModel.deleteLabel(label);
	}
	renderMailboxLabelItems(mailboxDetail, inEditMode, onEditMailbox) {
		return [mithril_default(SidebarSection, {
			name: "labels_label",
			button: inEditMode ? this.renderAddLabelButton(mailboxDetail) : this.renderEditMailboxButton(onEditMailbox)
		}, [mithril_default(".flex.col", [Array.from(mailLocator.mailModel.getLabelsByGroupId(mailboxDetail.mailGroup._id).values()).map((label) => {
			const path = `${MAIL_PREFIX}/${getElementId(label)}`;
			return mithril_default(SidebarSectionRow, {
				icon: Icons.Label,
				iconColor: getLabelColor(label.color),
				label: lang.makeTranslation(`folder:${label.name}`, label.name),
				path,
				isSelectedPrefix: inEditMode ? false : path,
				disabled: inEditMode,
				onClick: () => {
					if (!inEditMode) this.viewSlider.focus(this.listColumn);
				},
				alwaysShowMoreButton: inEditMode,
				moreButton: attachDropdown({
					mainButtonAttrs: {
						icon: Icons.More,
						title: "more_label"
					},
					childAttrs: () => [{
						label: "edit_action",
						icon: Icons.Edit,
						click: () => {
							this.showLabelEditDialog(label);
						}
					}, {
						label: "delete_action",
						icon: Icons.Trash,
						click: () => {
							this.showLabelDeleteDialog(label);
						}
					}]
				})
			});
		})])]), mithril_default(RowButton, {
			label: "addLabel_action",
			icon: Icons.Add,
			class: "folder-row mlr-button border-radius-small",
			style: { width: `calc(100% - ${px(size.hpad_button * 2)})` },
			onclick: () => {
				this.showLabelAddDialog(mailboxDetail.mailbox);
			}
		})];
	}
	renderEditMailboxButton(onEditMailbox) {
		return mithril_default(IconButton, {
			icon: Icons.Edit,
			size: ButtonSize.Compact,
			title: "edit_action",
			click: onEditMailbox
		});
	}
	renderAddLabelButton(mailboxDetail) {
		return mithril_default(IconButton, {
			title: "addLabel_action",
			icon: Icons.Add,
			click: () => {
				this.showLabelAddDialog(mailboxDetail.mailbox);
			}
		});
	}
};

//#endregion
export { MailView };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbFZpZXctY2h1bmsuanMiLCJuYW1lcyI6WyJkb206IEhUTUxFbGVtZW50IiwibGlzdEVsZW1lbnQ6IE1haWwiLCJtYWlsOiBNYWlsIiwiZm9sZGVyczogRm9sZGVyU3lzdGVtIiwiZXZlbnQ6IERyYWdFdmVudCIsInJvdzogTWFpbCIsInNlbGVjdGVkOiBSZWFkb25seVNldDxNYWlsPiIsInJvdzogVmlydHVhbFJvdzxNYWlsPiIsInNlbGVjdGVkOiBSZWFkb25seUFycmF5PE1haWw+IiwiZHJhZ2dlZE1haWxzOiBBcnJheTxNYWlsPiIsIm1haWxzOiBBcnJheTxNYWlsPiIsIm5vdERvd25sb2FkZWQ6IEFycmF5PHsgbWFpbDogTWFpbDsgZmlsZU5hbWU6IHN0cmluZyB9PiIsImRvd25sb2FkZWQ6IEFycmF5PHsgZmlsZU5hbWU6IHN0cmluZzsgcHJvbWlzZTogUHJvbWlzZTxNYWlsPiB9PiIsImZpbGVOYW1lOiBzdHJpbmciLCJwcm9taXNlOiBQcm9taXNlPE1haWw+Iiwidm5vZGU6IFZub2RlPE1haWxMaXN0Vmlld0F0dHJzPiIsInB1cmdlQnV0dG9uQXR0cnM6IEJ1dHRvbkF0dHJzIiwiZXZlbnQ6IEtleWJvYXJkRXZlbnQiLCJ2bm9kZSIsIml0ZW06IE1haWwiLCJldmVudDogRHJhZ0V2ZW50IHwgS2V5Ym9hcmRFdmVudCIsIm1haWxCb3hEZXRhaWw6IE1haWxib3hEZXRhaWwiLCJlZGl0ZWRGb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsIiwicGFyZW50Rm9sZGVyOiBNYWlsRm9sZGVyIHwgbnVsbCIsInRhcmdldEZvbGRlcnM6IFNlbGVjdG9ySXRlbUxpc3Q8TWFpbEZvbGRlciB8IG51bGw+IiwiZm9sZGVySW5mbzogSW5kZW50ZWRGb2xkZXIiLCJuZXdGb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsIiwiZm9sZGVyOiBNYWlsRm9sZGVyIiwicmVwb3J0YWJsZU1haWxzOiBBcnJheTxNYWlsPiIsImRpYWxvZzogRGlhbG9nIiwibDogSW5kZW50ZWRGb2xkZXIiLCJyOiBJbmRlbnRlZEZvbGRlciIsIm1haWxib3hEZXRhaWw6IE1haWxib3hEZXRhaWwiLCJmb2xkZXJzOiBGb2xkZXJTeXN0ZW0iLCJuYW1lOiBzdHJpbmciLCJtYWlsR3JvdXBJZDogSWQiLCJwYXJlbnRGb2xkZXJJZDogSWRUdXBsZSB8IG51bGwiLCJ2bm9kZTogVm5vZGU8TWFpbEZvbGRlclJvd0F0dHJzPiIsImV2ZW50OiBLZXlib2FyZEV2ZW50IiwiaW5kZW50YXRpb25NYXJnaW46IG51bWJlciIsImNoaWxkcmVuOiBDaGlsZHJlbiIsInN1YlN5c3RlbXM6IHJlYWRvbmx5IEZvbGRlclN1YnRyZWVbXSIsImdyb3VwQ291bnRlcnM6IENvdW50ZXJzIiwiZm9sZGVyczogRm9sZGVyU3lzdGVtIiwiYXR0cnM6IE1haWxGb2xkZXJWaWV3QXR0cnMiLCJwYXRoOiBNYWlsRm9sZGVyW10iLCJpc0ludGVybmFsVXNlcjogYm9vbGVhbiIsImluZGVudGF0aW9uTGV2ZWw6IG51bWJlciIsInJlc3VsdDogeyBjaGlsZHJlbjogQ2hpbGRyZW5bXTsgbnVtUm93czogbnVtYmVyIH0iLCJidXR0b246IE5hdkJ1dHRvbkF0dHJzIiwiY291bnRlcnM6IENvdW50ZXJzIiwic3lzdGVtOiBGb2xkZXJTdWJ0cmVlIiwiZm9sZGVyOiBNYWlsRm9sZGVyIiwib25DbG9zZTogVGh1bmsiLCJwYXJlbnRGb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsIiwiZm9sZGVyTGlzdDogKCkgPT4gQ2hpbGRyZW4iLCJlOiBNb3VzZUV2ZW50IiwiYW5pbWF0aW9uOiBBbmltYXRpb25Qcm9taXNlIHwgbnVsbCIsImU6IEV2ZW50Iiwic2hvcnRjdXQ6IFNob3J0Y3V0IiwiZm9sZGVyczogKCkgPT4gQ2hpbGRyZW4iLCJtYWlsYm94OiBNYWlsQm94IHwgbnVsbCIsIm1haWxWaWV3TW9kZWw6IE1haWxWaWV3TW9kZWwiLCJsYWJlbDogTWFpbEZvbGRlciB8IG51bGwiLCJkaWFsb2c6IERpYWxvZyIsIm5ld0NvbG9yOiBzdHJpbmciLCJ2bm9kZTogVm5vZGU8TWFpbFZpZXdBdHRycz4iLCJmb2xkZXIiLCJ2bm9kZSIsIm0iLCJ2aWV3TW9kZWw6IENvbnZlcnNhdGlvblZpZXdNb2RlbCIsImhlYWRlcjogQXBwSGVhZGVyQXR0cnMiLCJzZWxlY3RlZDogUmVhZG9ubHlBcnJheTxNYWlsPiIsImV2OiBEcmFnRXZlbnQiLCJlZGl0aW5nRm9sZGVyRm9yTWFpbEdyb3VwOiBJZCB8IG51bGwiLCJkcmF3ZXJBdHRyczogRHJhd2VyTWVudUF0dHJzIiwibWFpbGJveERldGFpbDogTWFpbGJveERldGFpbCIsImVkaXRpbmdGb2xkZXJGb3JNYWlsR3JvdXA6IHN0cmluZyB8IG51bGwiLCJpbkVkaXRNb2RlOiBib29sZWFuIiwib25FZGl0TWFpbGJveDogKCkgPT4gdm9pZCIsImZvbGRlcjogTWFpbEZvbGRlciIsImN1cnJlbnRFeHBhbnNpb25TdGF0ZTogYm9vbGVhbiIsImFyZ3M6IFJlY29yZDxzdHJpbmcsIGFueT4iLCJyZXF1ZXN0ZWRQYXRoOiBzdHJpbmciLCJmaWxlRHJvcDogRmlsZURyb3BEYXRhIiwiZHJvcERhdGE6IE1haWxEcm9wRGF0YSIsIm1haWxzVG9Nb3ZlOiBNYWlsW10iLCJkcm9wRGF0YTogRmlsZURyb3BEYXRhIiwibWFpbEZvbGRlcjogTWFpbEZvbGRlciIsImZpbGVzOiBBcnJheTxGaWxlPiIsIm1haWxzOiBNYWlsW10iLCJtYWlsR3JvdXBJZDogSWQiLCJmb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsIiwicGFyZW50Rm9sZGVyOiBNYWlsRm9sZGVyIHwgbnVsbCIsIm1haWxib3g6IE1haWxCb3giLCJsYWJlbDogTWFpbEZvbGRlciIsIm9uRWRpdE1haWxib3g6ICgpID0+IHVua25vd24iXSwic291cmNlcyI6WyIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01haWxMaXN0Vmlldy50cyIsIi4uL3NyYy9tYWlsLWFwcC9tYWlsL3ZpZXcvRWRpdEZvbGRlckRpYWxvZy50cyIsIi4uL3NyYy9tYWlsLWFwcC9tYWlsL3ZpZXcvTWFpbEZvbGRlclJvdy50cyIsIi4uL3NyYy9tYWlsLWFwcC9tYWlsL3ZpZXcvTWFpbEZvbGRlcnNWaWV3LnRzIiwiLi4vc3JjL21haWwtYXBwL21haWwvdmlldy9FZGl0Rm9sZGVyc0RpYWxvZy50cyIsIi4uL3NyYy9tYWlsLWFwcC9tYWlsL3ZpZXcvRWRpdExhYmVsRGlhbG9nLnRzIiwiLi4vc3JjL21haWwtYXBwL21haWwvdmlldy9NYWlsVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuXG5pbXBvcnQgeyBLZXlzLCBNYWlsU2V0S2luZCwgTWFpbFN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB0eXBlIHsgTWFpbCwgTWFpbEZvbGRlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IHNpemUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zaXplXCJcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3N0eWxlc1wiXG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29uc1wiXG5pbXBvcnQgdHlwZSB7IEJ1dHRvbkF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHsgQnV0dG9uLCBCdXR0b25Db2xvciwgQnV0dG9uVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIEFzeW5jUmVzdWx0LCBkb3duY2FzdCwgbmV2ZXJOdWxsLCBwcm9taXNlTWFwIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IGdldEVsZW1lbnRJZCwgZ2V0TGV0SWQsIGhhdmVTYW1lSWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXRpbHNcIlxuaW1wb3J0IHsgbW92ZU1haWxzLCBwcm9tcHRBbmREZWxldGVNYWlscyB9IGZyb20gXCIuL01haWxHdWlVdGlsc1wiXG5pbXBvcnQgeyBNYWlsUm93IH0gZnJvbSBcIi4vTWFpbFJvd1wiXG5pbXBvcnQgeyBtYWtlVHJhY2tlZFByb2dyZXNzTW9uaXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9Qcm9ncmVzc01vbml0b3JcIlxuaW1wb3J0IHsgZ2VuZXJhdGVNYWlsRmlsZSwgZ2V0TWFpbEV4cG9ydE1vZGUgfSBmcm9tIFwiLi4vZXhwb3J0L0V4cG9ydGVyXCJcbmltcG9ydCB7IGRlZHVwbGljYXRlRmlsZW5hbWVzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0ZpbGVVdGlsc1wiXG5pbXBvcnQgeyBkb3dubG9hZE1haWxCdW5kbGUgfSBmcm9tIFwiLi4vZXhwb3J0L0J1bmRsZXJcIlxuaW1wb3J0IHsgTGlzdENvbHVtbldyYXBwZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9MaXN0Q29sdW1uV3JhcHBlclwiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudlwiXG5pbXBvcnQgeyBGb2xkZXJTeXN0ZW0gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vbWFpbC9Gb2xkZXJTeXN0ZW0uanNcIlxuaW1wb3J0IHsgTWFpbFZpZXdNb2RlbCB9IGZyb20gXCIuL01haWxWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgTGlzdCwgTGlzdEF0dHJzLCBMaXN0U3dpcGVEZWNpc2lvbiwgTXVsdGlzZWxlY3RNb2RlLCBSZW5kZXJDb25maWcsIFN3aXBlQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvTGlzdC5qc1wiXG5pbXBvcnQgQ29sdW1uRW1wdHlNZXNzYWdlQm94IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQ29sdW1uRW1wdHlNZXNzYWdlQm94LmpzXCJcbmltcG9ydCB7IEJvb3RJY29ucyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvaWNvbnMvQm9vdEljb25zLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHsgVmlydHVhbFJvdyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvTGlzdFV0aWxzLmpzXCJcbmltcG9ydCB7IGlzS2V5UHJlc3NlZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9LZXlNYW5hZ2VyLmpzXCJcbmltcG9ydCB7IG1haWxMb2NhdG9yIH0gZnJvbSBcIi4uLy4uL21haWxMb2NhdG9yLmpzXCJcbmltcG9ydCB7IGFzc2VydFN5c3RlbUZvbGRlck9mVHlwZSB9IGZyb20gXCIuLi9tb2RlbC9NYWlsVXRpbHMuanNcIlxuaW1wb3J0IHsgY2FuRG9EcmFnQW5kRHJvcEV4cG9ydCB9IGZyb20gXCIuL01haWxWaWV3ZXJVdGlscy5qc1wiXG5pbXBvcnQgeyBpc09mVHlwZU9yU3ViZm9sZGVyT2YgfSBmcm9tIFwiLi4vbW9kZWwvTWFpbENoZWNrcy5qc1wiXG5pbXBvcnQgeyBEcm9wVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvR3VpVXRpbHNcIlxuaW1wb3J0IHsgTGlzdEVsZW1lbnRMaXN0TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGlzdEVsZW1lbnRMaXN0TW9kZWxcIlxuaW1wb3J0IHsgZ2VuZXJhdGVFeHBvcnRGaWxlTmFtZSB9IGZyb20gXCIuLi9leHBvcnQvZW1sVXRpbHMuanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcblxuZXhwb3J0IGludGVyZmFjZSBNYWlsTGlzdFZpZXdBdHRycyB7XG5cdC8vIFdlIHdvdWxkIGxpa2UgdG8gbm90IGdldCBhbmQgaG9sZCB0byB0aGUgd2hvbGUgTWFpbFZpZXcgZXZlbnR1YWxseVxuXHQvLyBidXQgZm9yIHRoYXQgd2UgbmVlZCB0byByZXdyaXRlIHRoZSBMaXN0XG5cdG9uQ2xlYXJGb2xkZXI6ICgpID0+IHVua25vd25cblx0bWFpbFZpZXdNb2RlbDogTWFpbFZpZXdNb2RlbFxuXHRvblNpbmdsZVNlbGVjdGlvbjogKG1haWw6IE1haWwpID0+IHVua25vd25cblx0b25TaW5nbGVJbmNsdXNpdmVTZWxlY3Rpb246IExpc3RFbGVtZW50TGlzdE1vZGVsPE1haWw+W1wib25TaW5nbGVJbmNsdXNpdmVTZWxlY3Rpb25cIl1cblx0b25SYW5nZVNlbGVjdGlvblRvd2FyZHM6IExpc3RFbGVtZW50TGlzdE1vZGVsPE1haWw+W1wic2VsZWN0UmFuZ2VUb3dhcmRzXCJdXG5cdG9uU2luZ2xlRXhjbHVzaXZlU2VsZWN0aW9uOiBMaXN0RWxlbWVudExpc3RNb2RlbDxNYWlsPltcIm9uU2luZ2xlRXhjbHVzaXZlU2VsZWN0aW9uXCJdXG59XG5cbmV4cG9ydCBjbGFzcyBNYWlsTGlzdFZpZXcgaW1wbGVtZW50cyBDb21wb25lbnQ8TWFpbExpc3RWaWV3QXR0cnM+IHtcblx0Ly8gTWFpbHMgdGhhdCBhcmUgY3VycmVudGx5IGJlaW5nIG9yIGhhdmUgYWxyZWFkeSBiZWVuIGRvd25sb2FkZWQvYnVuZGxlZC9zYXZlZFxuXHQvLyBNYXAgb2YgKE1haWwuX2lkICsrIE1haWxFeHBvcnRNb2RlKSAtPiBQcm9taXNlPEZpbGVwYXRoPlxuXHQvLyBUT0RPIHRoaXMgY3VycmVudGx5IGdyb3dzIGJpZ2dlciBhbmQgYmlnZ2VyIGFuZCBiaWdnZXIgaWYgdGhlIHVzZXIgZ29lcyBvbiBhbiBleHBvcnRpbmcgc3ByZWUuXG5cdC8vICBtYXliZSB3ZSBzaG91bGQgZGVhbCB3aXRoIHRoaXMsIG9yIG1heWJlIHRoaXMgbmV2ZXIgYmVjb21lcyBhbiBpc3N1ZT9cblx0ZXhwb3J0ZWRNYWlsczogTWFwPFxuXHRcdHN0cmluZyxcblx0XHR7XG5cdFx0XHRmaWxlTmFtZTogc3RyaW5nXG5cdFx0XHRyZXN1bHQ6IEFzeW5jUmVzdWx0PGFueT5cblx0XHR9XG5cdD5cblx0Ly8gVXNlZCBmb3IgbW9kaWZ5aW5nIHRoZSBjdXJzb3IgZHVyaW5nIGRyYWcgYW5kIGRyb3Bcblx0X2xpc3REb206IEhUTUxFbGVtZW50IHwgbnVsbFxuXHRzaG93aW5nU3BhbU9yVHJhc2g6IGJvb2xlYW4gPSBmYWxzZVxuXHRzaG93aW5nRHJhZnQ6IGJvb2xlYW4gPSBmYWxzZVxuXHRzaG93aW5nQXJjaGl2ZTogYm9vbGVhbiA9IGZhbHNlXG5cdHByaXZhdGUgYXR0cnM6IE1haWxMaXN0Vmlld0F0dHJzXG5cblx0cHJpdmF0ZSBnZXQgbWFpbFZpZXdNb2RlbCgpOiBNYWlsVmlld01vZGVsIHtcblx0XHRyZXR1cm4gdGhpcy5hdHRycy5tYWlsVmlld01vZGVsXG5cdH1cblxuXHRwcml2YXRlIHJlYWRvbmx5IHJlbmRlckNvbmZpZzogUmVuZGVyQ29uZmlnPE1haWwsIE1haWxSb3c+ID0ge1xuXHRcdGl0ZW1IZWlnaHQ6IHNpemUubGlzdF9yb3dfaGVpZ2h0LFxuXHRcdG11bHRpc2VsZWN0aW9uQWxsb3dlZDogTXVsdGlzZWxlY3RNb2RlLkVuYWJsZWQsXG5cdFx0Y3JlYXRlRWxlbWVudDogKGRvbTogSFRNTEVsZW1lbnQpID0+IHtcblx0XHRcdGNvbnN0IG1haWxSb3cgPSBuZXcgTWFpbFJvdyhcblx0XHRcdFx0dGhpcy5tYWlsVmlld01vZGVsLmdldFNlbGVjdGVkTWFpbFNldEtpbmQoKSA9PT0gTWFpbFNldEtpbmQuTEFCRUwsXG5cdFx0XHRcdChtYWlsKSA9PiB0aGlzLm1haWxWaWV3TW9kZWwuZ2V0TGFiZWxzRm9yTWFpbChtYWlsKSxcblx0XHRcdFx0KGVudGl0eSkgPT4gdGhpcy5hdHRycy5vblNpbmdsZUV4Y2x1c2l2ZVNlbGVjdGlvbihlbnRpdHkpLFxuXHRcdFx0KVxuXHRcdFx0bS5yZW5kZXIoZG9tLCBtYWlsUm93LnJlbmRlcigpKVxuXHRcdFx0cmV0dXJuIG1haWxSb3dcblx0XHR9LFxuXHRcdHN3aXBlOiBsb2NhdG9yLmxvZ2lucy5pc0ludGVybmFsVXNlckxvZ2dlZEluKClcblx0XHRcdD8gKHtcblx0XHRcdFx0XHRyZW5kZXJMZWZ0U3BhY2VyOiAoKSA9PiB0aGlzLnJlbmRlckxlZnRTcGFjZXIoKSxcblx0XHRcdFx0XHRyZW5kZXJSaWdodFNwYWNlcjogKCkgPT4gdGhpcy5yZW5kZXJSaWdodFNwYWNlcigpLFxuXHRcdFx0XHRcdHN3aXBlTGVmdDogKGxpc3RFbGVtZW50OiBNYWlsKSA9PiB0aGlzLm9uU3dpcGVMZWZ0KGxpc3RFbGVtZW50KSxcblx0XHRcdFx0XHRzd2lwZVJpZ2h0OiAobGlzdEVsZW1lbnQ6IE1haWwpID0+IHRoaXMub25Td2lwZVJpZ2h0KGxpc3RFbGVtZW50KSxcblx0XHRcdCAgfSBzYXRpc2ZpZXMgU3dpcGVDb25maWd1cmF0aW9uPE1haWw+KVxuXHRcdFx0OiBudWxsLFxuXHRcdGRyYWdTdGFydDogKGV2ZW50LCByb3csIHNlbGVjdGVkKSA9PiB0aGlzLl9uZXdEcmFnU3RhcnQoZXZlbnQsIHJvdywgc2VsZWN0ZWQpLFxuXHR9XG5cblx0Y29uc3RydWN0b3IoeyBhdHRycyB9OiBWbm9kZTxNYWlsTGlzdFZpZXdBdHRycz4pIHtcblx0XHR0aGlzLmF0dHJzID0gYXR0cnNcblx0XHR0aGlzLmV4cG9ydGVkTWFpbHMgPSBuZXcgTWFwKClcblx0XHR0aGlzLl9saXN0RG9tID0gbnVsbFxuXHRcdHRoaXMubWFpbFZpZXdNb2RlbC5zaG93aW5nVHJhc2hPclNwYW1Gb2xkZXIoKS50aGVuKChyZXN1bHQpID0+IHtcblx0XHRcdHRoaXMuc2hvd2luZ1NwYW1PclRyYXNoID0gcmVzdWx0XG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fSlcblx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc2hvd2luZ0RyYWZ0c0ZvbGRlcigpLnRoZW4oKHJlc3VsdCkgPT4ge1xuXHRcdFx0dGhpcy5zaG93aW5nRHJhZnQgPSByZXN1bHRcblx0XHRcdG0ucmVkcmF3KClcblx0XHR9KVxuXHRcdHRoaXMudGFyZ2V0SW5ib3goKS50aGVuKChyZXN1bHQpID0+IHtcblx0XHRcdHRoaXMuc2hvd2luZ0FyY2hpdmUgPSByZXN1bHRcblx0XHRcdG0ucmVkcmF3KClcblx0XHR9KVxuXG5cdFx0Ly8gXCJ0aGlzXCIgaXMgaW5jb3JyZWN0bHkgYm91bmQgaWYgd2UgZG9uJ3QgZG8gaXQgdGhpcyB3YXlcblx0XHR0aGlzLnZpZXcgPSB0aGlzLnZpZXcuYmluZCh0aGlzKVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRSZWNvdmVyRm9sZGVyKG1haWw6IE1haWwsIGZvbGRlcnM6IEZvbGRlclN5c3RlbSk6IE1haWxGb2xkZXIge1xuXHRcdGlmIChtYWlsLnN0YXRlID09PSBNYWlsU3RhdGUuRFJBRlQpIHtcblx0XHRcdHJldHVybiBhc3NlcnRTeXN0ZW1Gb2xkZXJPZlR5cGUoZm9sZGVycywgTWFpbFNldEtpbmQuRFJBRlQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhc3NlcnRTeXN0ZW1Gb2xkZXJPZlR5cGUoZm9sZGVycywgTWFpbFNldEtpbmQuSU5CT1gpXG5cdFx0fVxuXHR9XG5cblx0Ly8gTk9URSB3ZSBkbyBhbGwgb2YgdGhlIGVsZWN0cm9uIGRyYWcgaGFuZGxpbmcgZGlyZWN0bHkgaW5zaWRlIE1haWxMaXN0VmlldywgYmVjYXVzZSB3ZSBjdXJyZW50bHkgaGF2ZSBubyBuZWVkIHRvIGdlbmVyYWxpc2Vcblx0Ly8gd291bGQgc3Ryb25nbHkgc3VnZ2VzdCB3aXRoIHN0YXJ0aW5nIGdlbmVyYWxpc2luZyB0aGlzIGZpcnN0IGlmIHdlIGV2ZXIgbmVlZCB0byBzdXBwb3J0IGRyYWdnaW5nIG1vcmUgdGhhbiBqdXN0IG1haWxzXG5cdF9uZXdEcmFnU3RhcnQoZXZlbnQ6IERyYWdFdmVudCwgcm93OiBNYWlsLCBzZWxlY3RlZDogUmVhZG9ubHlTZXQ8TWFpbD4pIHtcblx0XHRpZiAoIXJvdykgcmV0dXJuXG5cdFx0Y29uc3QgbWFpbFVuZGVyQ3Vyc29yID0gcm93XG5cblx0XHRpZiAoaXNFeHBvcnREcmFnRXZlbnQoZXZlbnQpKSB7XG5cdFx0XHQvLyBXZSBoYXZlIHRvIHJlbW92ZSB0aGUgZHJhZyBtb2Qga2V5IGNsYXNzIGhlcmUgYmVjYXVzZSBvbmNlIHRoZSBkcmFnc3RhcnQgaGFzIGJlZ3VuXG5cdFx0XHQvLyB3ZSB3b24ndCByZWNlaXZlIHRoZSBrZXl1cCBldmVudCB0aGF0IHdvdWxkIG5vcm1hbGx5IHJlbW92ZSBpdFxuXHRcdFx0dGhpcy5fbGlzdERvbT8uY2xhc3NMaXN0LnJlbW92ZShcImRyYWctbW9kLWtleVwiKVxuXHRcdFx0Ly8gV2UgaGF2ZSB0byBwcmV2ZW50RGVmYXVsdCBvciB3ZSBnZXQgbXlzdGVyaW91cyBhbmQgaW5jb25zaXN0ZW50IGVsZWN0cm9uIGNyYXNoZXMgYXQgdGhlIGNhbGwgdG8gc3RhcnREcmFnIGluIElQQ1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0Ly8gaWYgdGhlIG1haWwgYmVpbmcgZHJhZ2dlZCBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIG1haWxzIHRoYXQgYXJlIHNlbGVjdGVkLCB0aGVuIHdlIG9ubHkgZHJhZ1xuXHRcdFx0Ly8gdGhlIG1haWwgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZCwgdG8gbWF0Y2ggdGhlIGJlaGF2aW91ciBvZiByZWd1bGFyIGluLWFwcCBkcmFnZ2luZyBhbmQgZHJvcHBpbmdcblx0XHRcdC8vIHdoaWNoIHNlZW1pbmdseSBiZWhhdmVzIGhvdyBpdCBkb2VzIGp1c3QgYnkgZGVmYXVsdFxuXHRcdFx0Ly9jb25zdCBkcmFnZ2VkTWFpbHMgPSBzZWxlY3RlZC5maW5kKChtYWlsKSA9PiBoYXZlU2FtZUlkKG1haWwsIG1haWxVbmRlckN1cnNvcikpID8gc2VsZWN0ZWQuc2xpY2UoKSA6IFttYWlsVW5kZXJDdXJzb3JdXG5cdFx0XHRjb25zdCBkcmFnZ2VkTWFpbHMgPSBzZWxlY3RlZC5oYXMobWFpbFVuZGVyQ3Vyc29yKSA/IFsuLi5zZWxlY3RlZF0gOiBbbWFpbFVuZGVyQ3Vyc29yXVxuXG5cdFx0XHR0aGlzLl9kb0V4cG9ydERyYWcoZHJhZ2dlZE1haWxzKVxuXHRcdH0gZWxzZSBpZiAoc3R5bGVzLmlzRGVza3RvcExheW91dCgpKSB7XG5cdFx0XHQvLyBEZXNrdG9wIGxheW91dCBvbmx5IGJlY2F1c2UgaXQgZG9lc24ndCBtYWtlIHNlbnNlIHRvIGRyYWcgbWFpbHMgdG8gZm9sZGVycyB3aGVuIHRoZSBmb2xkZXIgbGlzdCBhbmQgbWFpbCBsaXN0IGFyZW4ndCB2aXNpYmxlIGF0IHRoZSBzYW1lIHRpbWVcblx0XHRcdG5ldmVyTnVsbChldmVudC5kYXRhVHJhbnNmZXIpLnNldERhdGEoRHJvcFR5cGUuTWFpbCwgZ2V0TGV0SWQobmV2ZXJOdWxsKG1haWxVbmRlckN1cnNvcikpWzFdKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0fVxuXHR9XG5cblx0Ly8gTk9URSB3ZSBkbyBhbGwgb2YgdGhlIGVsZWN0cm9uIGRyYWcgaGFuZGxpbmcgZGlyZWN0bHkgaW5zaWRlIE1haWxMaXN0VmlldywgYmVjYXVzZSB3ZSBjdXJyZW50bHkgaGF2ZSBubyBuZWVkIHRvIGdlbmVyYWxpc2Vcblx0Ly8gd291bGQgc3Ryb25nbHkgc3VnZ2VzdCB3aXRoIHN0YXJ0aW5nIGdlbmVyYWxpc2luZyB0aGlzIGZpcnN0IGlmIHdlIGV2ZXIgbmVlZCB0byBzdXBwb3J0IGRyYWdnaW5nIG1vcmUgdGhhbiBqdXN0IG1haWxzXG5cdF9kcmFnU3RhcnQoZXZlbnQ6IERyYWdFdmVudCwgcm93OiBWaXJ0dWFsUm93PE1haWw+LCBzZWxlY3RlZDogUmVhZG9ubHlBcnJheTxNYWlsPikge1xuXHRcdGlmICghcm93LmVudGl0eSkgcmV0dXJuXG5cdFx0Y29uc3QgbWFpbFVuZGVyQ3Vyc29yID0gcm93LmVudGl0eVxuXG5cdFx0aWYgKGlzRXhwb3J0RHJhZ0V2ZW50KGV2ZW50KSkge1xuXHRcdFx0Ly8gV2UgaGF2ZSB0byByZW1vdmUgdGhlIGRyYWcgbW9kIGtleSBjbGFzcyBoZXJlIGJlY2F1c2Ugb25jZSB0aGUgZHJhZ3N0YXJ0IGhhcyBiZWd1blxuXHRcdFx0Ly8gd2Ugd29uJ3QgcmVjZWl2ZSB0aGUga2V5dXAgZXZlbnQgdGhhdCB3b3VsZCBub3JtYWxseSByZW1vdmUgaXRcblx0XHRcdHRoaXMuX2xpc3REb20/LmNsYXNzTGlzdC5yZW1vdmUoXCJkcmFnLW1vZC1rZXlcIilcblx0XHRcdC8vIFdlIGhhdmUgdG8gcHJldmVudERlZmF1bHQgb3Igd2UgZ2V0IG15c3RlcmlvdXMgYW5kIGluY29uc2lzdGVudCBlbGVjdHJvbiBjcmFzaGVzIGF0IHRoZSBjYWxsIHRvIHN0YXJ0RHJhZyBpbiBJUENcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdC8vIGlmIHRoZSBtYWlsIGJlaW5nIGRyYWdnZWQgaXMgbm90IGluY2x1ZGVkIGluIHRoZSBtYWlscyB0aGF0IGFyZSBzZWxlY3RlZCwgdGhlbiB3ZSBvbmx5IGRyYWdcblx0XHRcdC8vIHRoZSBtYWlsIHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQsIHRvIG1hdGNoIHRoZSBiZWhhdmlvdXIgb2YgcmVndWxhciBpbi1hcHAgZHJhZ2dpbmcgYW5kIGRyb3BwaW5nXG5cdFx0XHQvLyB3aGljaCBzZWVtaW5nbHkgYmVoYXZlcyBob3cgaXQgZG9lcyBqdXN0IGJ5IGRlZmF1bHRcblx0XHRcdGNvbnN0IGRyYWdnZWRNYWlscyA9IHNlbGVjdGVkLnNvbWUoKG1haWwpID0+IGhhdmVTYW1lSWQobWFpbCwgbWFpbFVuZGVyQ3Vyc29yKSkgPyBzZWxlY3RlZC5zbGljZSgpIDogW21haWxVbmRlckN1cnNvcl1cblxuXHRcdFx0dGhpcy5fZG9FeHBvcnREcmFnKGRyYWdnZWRNYWlscylcblx0XHR9IGVsc2UgaWYgKHN0eWxlcy5pc0Rlc2t0b3BMYXlvdXQoKSkge1xuXHRcdFx0Ly8gRGVza3RvcCBsYXlvdXQgb25seSBiZWNhdXNlIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0byBkcmFnIG1haWxzIHRvIGZvbGRlcnMgd2hlbiB0aGUgZm9sZGVyIGxpc3QgYW5kIG1haWwgbGlzdCBhcmVuJ3QgdmlzaWJsZSBhdCB0aGUgc2FtZSB0aW1lXG5cdFx0XHRuZXZlck51bGwoZXZlbnQuZGF0YVRyYW5zZmVyKS5zZXREYXRhKERyb3BUeXBlLk1haWwsIGdldExldElkKG5ldmVyTnVsbChtYWlsVW5kZXJDdXJzb3IpKVsxXSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIF9kb0V4cG9ydERyYWcoZHJhZ2dlZE1haWxzOiBBcnJheTxNYWlsPik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGFzc2VydE5vdE51bGwoZG9jdW1lbnQuYm9keSkuc3R5bGUuY3Vyc29yID0gXCJwcm9ncmVzc1wiXG5cdFx0Ly8gV2UgbGlzdGVuIHRvIG1vdXNldXAgdG8gZGV0ZWN0IGlmIHRoZSB1c2VyIHJlbGVhc2VkIHRoZSBtb3VzZSBiZWZvcmUgdGhlIGRvd25sb2FkIHdhcyBjb21wbGV0ZVxuXHRcdC8vIHdlIGNhbid0IHVzZSBkcmFnZW5kIGJlY2F1c2Ugd2UgYnJva2UgdGhlIERyYWdFdmVudCBjaGFpbiBieSBjYWxsaW5nIHByZXZlbnQgZGVmYXVsdFxuXHRcdGNvbnN0IG1vdXNldXBQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHJlc29sdmUsIHtcblx0XHRcdFx0b25jZTogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0fSlcblxuXHRcdGNvbnN0IGZpbGVQYXRoc1Byb21pc2UgPSB0aGlzLl9wcmVwYXJlTWFpbHNGb3JEcmFnKGRyYWdnZWRNYWlscylcblxuXHRcdC8vIElmIHRoZSBkb3dubG9hZCBjb21wbGV0ZXMgYmVmb3JlIHRoZSB1c2VyIHJlbGVhc2VzIHRoZWlyIG1vdXNlLCB0aGVuIHdlIGNhbiBjYWxsIGVsZWN0cm9uIHN0YXJ0IGRyYWcgYW5kIGRvIHRoZSBvcGVyYXRpb25cblx0XHQvLyBvdGhlcndpc2Ugd2UgaGF2ZSB0byBnaXZlIHNvbWUga2luZCBvZiBmZWVkYmFjayB0byB0aGUgdXNlciB0aGF0IHRoZSBkcm9wIHdhcyB1bnN1Y2Nlc3NmdWxcblx0XHRjb25zdCBbZGlkQ29tcGxldGUsIGZpbGVOYW1lc10gPSBhd2FpdCBQcm9taXNlLnJhY2UoW2ZpbGVQYXRoc1Byb21pc2UudGhlbigoZmlsZVBhdGhzKSA9PiBbdHJ1ZSwgZmlsZVBhdGhzXSksIG1vdXNldXBQcm9taXNlLnRoZW4oKCkgPT4gW2ZhbHNlLCBbXV0pXSlcblxuXHRcdGlmIChkaWRDb21wbGV0ZSkge1xuXHRcdFx0YXdhaXQgbG9jYXRvci5maWxlQXBwLnN0YXJ0TmF0aXZlRHJhZyhmaWxlTmFtZXMgYXMgc3RyaW5nW10pXG5cdFx0fSBlbHNlIHtcblx0XHRcdGF3YWl0IGxvY2F0b3IuZGVza3RvcFN5c3RlbUZhY2FkZS5mb2N1c0FwcGxpY2F0aW9uV2luZG93KClcblx0XHRcdERpYWxvZy5tZXNzYWdlKFwidW5zdWNjZXNzZnVsRHJvcF9tc2dcIilcblx0XHR9XG5cblx0XHRuZXZlck51bGwoZG9jdW1lbnQuYm9keSkuc3R5bGUuY3Vyc29yID0gXCJkZWZhdWx0XCJcblx0fVxuXG5cdC8qKlxuXHQgKiBHaXZlbiBhIG1haWwsIHdpbGwgcHJlcGFyZSBpdCBieSBkb3dubG9hZGluZywgYnVuZGxpbmcsIHNhdmluZywgdGhlbiByZXR1cm5zIHRoZSBmaWxlcGF0aCBvZiB0aGUgc2F2ZWQgZmlsZS5cblx0ICogQHJldHVybnMge1Byb21pc2U8Uj58UHJvbWlzZTxzdHJpbmc+fVxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gbWFpbHNcblx0ICovXG5cdGFzeW5jIF9wcmVwYXJlTWFpbHNGb3JEcmFnKG1haWxzOiBBcnJheTxNYWlsPik6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuXHRcdGNvbnN0IGV4cG9ydE1vZGUgPSBhd2FpdCBnZXRNYWlsRXhwb3J0TW9kZSgpXG5cdFx0Ly8gMyBhY3Rpb25zIHBlciBtYWlsICsgMSB0byBpbmRpY2F0ZSB0aGF0IHNvbWV0aGluZyBpcyBoYXBwZW5pbmcgKGlmIHRoZSBkb3dubG9hZHMgdGFrZSBhIHdoaWxlKVxuXHRcdGNvbnN0IHByb2dyZXNzTW9uaXRvciA9IG1ha2VUcmFja2VkUHJvZ3Jlc3NNb25pdG9yKGxvY2F0b3IucHJvZ3Jlc3NUcmFja2VyLCAzICogbWFpbHMubGVuZ3RoICsgMSlcblx0XHRwcm9ncmVzc01vbml0b3Iud29ya0RvbmUoMSlcblxuXHRcdGNvbnN0IG1hcEtleSA9IChtYWlsOiBNYWlsKSA9PiBgJHtnZXRMZXRJZChtYWlsKS5qb2luKFwiXCIpfSR7ZXhwb3J0TW9kZX1gXG5cblx0XHRjb25zdCBub3REb3dubG9hZGVkOiBBcnJheTx7IG1haWw6IE1haWw7IGZpbGVOYW1lOiBzdHJpbmcgfT4gPSBbXVxuXHRcdGNvbnN0IGRvd25sb2FkZWQ6IEFycmF5PHsgZmlsZU5hbWU6IHN0cmluZzsgcHJvbWlzZTogUHJvbWlzZTxNYWlsPiB9PiA9IFtdXG5cblx0XHRjb25zdCBoYW5kbGVOb3REb3dubG9hZGVkID0gKG1haWw6IE1haWwpID0+IHtcblx0XHRcdG5vdERvd25sb2FkZWQucHVzaCh7XG5cdFx0XHRcdG1haWwsXG5cdFx0XHRcdGZpbGVOYW1lOiBnZW5lcmF0ZUV4cG9ydEZpbGVOYW1lKGdldEVsZW1lbnRJZChtYWlsKSwgbWFpbC5zdWJqZWN0LCBtYWlsLnJlY2VpdmVkRGF0ZSwgZXhwb3J0TW9kZSksXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGNvbnN0IGhhbmRsZURvd25sb2FkZWQgPSAoZmlsZU5hbWU6IHN0cmluZywgcHJvbWlzZTogUHJvbWlzZTxNYWlsPikgPT4ge1xuXHRcdFx0Ly8gd2UgZG9uJ3QgaGF2ZSB0byBkbyBhbnl0aGluZyBlbHNlIHdpdGggdGhlIGRvd25sb2FkZWQgb25lc1xuXHRcdFx0Ly8gc28gZmluaXNoIHRoaXMgY2h1bmsgb2Ygd29ya1xuXHRcdFx0cHJvZ3Jlc3NNb25pdG9yLndvcmtEb25lKDMpXG5cdFx0XHRkb3dubG9hZGVkLnB1c2goe1xuXHRcdFx0XHRmaWxlTmFtZSxcblx0XHRcdFx0cHJvbWlzZTogcHJvbWlzZSxcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0Ly8gR2F0aGVyIHVwIGZpbGVzIHRoYXQgaGF2ZSBiZWVuIGRvd25sb2FkZWRcblx0XHQvLyBhbmQgYWxsIGZpbGVzIHRoYXQgbmVlZCB0byBiZSBkb3dubG9hZGVkLCBvciB3ZXJlIGFscmVhZHkgZG93bmxvYWRlZCBidXQgaGF2ZSBkaXNhcHBlYXJlZFxuXHRcdGZvciAobGV0IG1haWwgb2YgbWFpbHMpIHtcblx0XHRcdGNvbnN0IGtleSA9IG1hcEtleShtYWlsKVxuXHRcdFx0Y29uc3QgZXhpc3RpbmcgPSB0aGlzLmV4cG9ydGVkTWFpbHMuZ2V0KGtleSlcblxuXHRcdFx0aWYgKCFleGlzdGluZyB8fCBleGlzdGluZy5yZXN1bHQuc3RhdGUoKS5zdGF0dXMgPT09IFwiZmFpbHVyZVwiKSB7XG5cdFx0XHRcdC8vIFNvbWV0aGluZyB3ZW50IHdyb25nIGxhc3QgdGltZSB3ZSB0cmllZCB0byBkcmFnIHRoaXMgZmlsZSxcblx0XHRcdFx0Ly8gc28gdHJ5IGFnYWluIChub3QgY29uZmlkZW50IHRoYXQgaXQgd2lsbCB3b3JrIHRoaXMgdGltZSwgdGhvdWdoKVxuXHRcdFx0XHRoYW5kbGVOb3REb3dubG9hZGVkKG1haWwpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzdGF0ZSA9IGV4aXN0aW5nLnJlc3VsdC5zdGF0ZSgpXG5cblx0XHRcdFx0c3dpdGNoIChzdGF0ZS5zdGF0dXMpIHtcblx0XHRcdFx0XHQvLyBNYWlsIGlzIHN0aWxsIGJlaW5nIHByZXBhcmVkLCBhbHJlYWR5IGhhcyBhIGZpbGUgcGF0aCBhc3NpZ25lZCB0byBpdFxuXHRcdFx0XHRcdGNhc2UgXCJwZW5kaW5nXCI6IHtcblx0XHRcdFx0XHRcdGhhbmRsZURvd25sb2FkZWQoZXhpc3RpbmcuZmlsZU5hbWUsIHN0YXRlLnByb21pc2UpXG5cdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNhc2UgXCJjb21wbGV0ZVwiOiB7XG5cdFx0XHRcdFx0XHQvLyBXZSBoYXZlIGRvd25sb2FkZWQgaXQsIGJ1dCB3ZSBuZWVkIHRvIGNoZWNrIGlmIGl0IHN0aWxsIGV4aXN0c1xuXHRcdFx0XHRcdFx0Y29uc3QgZXhpc3RzID0gYXdhaXQgbG9jYXRvci5maWxlQXBwLmNoZWNrRmlsZUV4aXN0c0luRXhwb3J0RGlyKGV4aXN0aW5nLmZpbGVOYW1lKVxuXG5cdFx0XHRcdFx0XHRpZiAoZXhpc3RzKSB7XG5cdFx0XHRcdFx0XHRcdGhhbmRsZURvd25sb2FkZWQoZXhpc3RpbmcuZmlsZU5hbWUsIFByb21pc2UucmVzb2x2ZShtYWlsKSlcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGhhbmRsZU5vdERvd25sb2FkZWQobWFpbClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBkZWR1cGxpY2F0ZWROYW1lcyA9IGRlZHVwbGljYXRlRmlsZW5hbWVzKFxuXHRcdFx0bm90RG93bmxvYWRlZC5tYXAoKGYpID0+IGYuZmlsZU5hbWUpLFxuXHRcdFx0bmV3IFNldChkb3dubG9hZGVkLm1hcCgoZikgPT4gZi5maWxlTmFtZSkpLFxuXHRcdClcblx0XHRjb25zdCBbbmV3RmlsZXMsIGV4aXN0aW5nRmlsZXNdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuXHRcdFx0Ly8gRG93bmxvYWQgYWxsIHRoZSBmaWxlcyB0aGF0IG5lZWQgZG93bmxvYWRpbmcsIHdhaXQgZm9yIHRoZW0sIGFuZCB0aGVuIHJldHVybiB0aGUgZmlsZW5hbWVcblx0XHRcdHByb21pc2VNYXAobm90RG93bmxvYWRlZCwgYXN5bmMgKHsgbWFpbCwgZmlsZU5hbWUgfSkgPT4ge1xuXHRcdFx0XHRjb25zdCBuYW1lID0gYXNzZXJ0Tm90TnVsbChkZWR1cGxpY2F0ZWROYW1lc1tmaWxlTmFtZV0uc2hpZnQoKSlcblx0XHRcdFx0Y29uc3Qga2V5ID0gbWFwS2V5KG1haWwpXG5cdFx0XHRcdGNvbnN0IGRvd25sb2FkUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgaHRtbFNhbml0aXplciB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL21pc2MvSHRtbFNhbml0aXplclwiKVxuXHRcdFx0XHRcdGNvbnN0IGJ1bmRsZSA9IGF3YWl0IGRvd25sb2FkTWFpbEJ1bmRsZShcblx0XHRcdFx0XHRcdG1haWwsXG5cdFx0XHRcdFx0XHRsb2NhdG9yLm1haWxGYWNhZGUsXG5cdFx0XHRcdFx0XHRsb2NhdG9yLmVudGl0eUNsaWVudCxcblx0XHRcdFx0XHRcdGxvY2F0b3IuZmlsZUNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRodG1sU2FuaXRpemVyLFxuXHRcdFx0XHRcdFx0bG9jYXRvci5jcnlwdG9GYWNhZGUsXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdHByb2dyZXNzTW9uaXRvci53b3JrRG9uZSgxKVxuXHRcdFx0XHRcdGNvbnN0IGZpbGUgPSBhd2FpdCBnZW5lcmF0ZU1haWxGaWxlKGJ1bmRsZSwgbmFtZSwgZXhwb3J0TW9kZSlcblx0XHRcdFx0XHRwcm9ncmVzc01vbml0b3Iud29ya0RvbmUoMSlcblx0XHRcdFx0XHRhd2FpdCBsb2NhdG9yLmZpbGVBcHAuc2F2ZVRvRXhwb3J0RGlyKGZpbGUpXG5cdFx0XHRcdFx0cHJvZ3Jlc3NNb25pdG9yLndvcmtEb25lKDEpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHRoaXMuZXhwb3J0ZWRNYWlscy5zZXQoa2V5LCB7XG5cdFx0XHRcdFx0ZmlsZU5hbWU6IG5hbWUsXG5cdFx0XHRcdFx0cmVzdWx0OiBuZXcgQXN5bmNSZXN1bHQoZG93bmxvYWRQcm9taXNlKSxcblx0XHRcdFx0fSlcblx0XHRcdFx0YXdhaXQgZG93bmxvYWRQcm9taXNlXG5cdFx0XHRcdHJldHVybiBuYW1lXG5cdFx0XHR9KSwgLy8gV2FpdCBmb3Igb25lcyB0aGF0IGFscmVhZHkgd2VyZSBkb3dubG9hZGluZyBvciBoYXZlIGZpbmlzaGVkLCBhbmQgIHRoZW4gcmV0dXJuIHRoZWlyIGZpbGVuYW1lcyB0b29cblx0XHRcdHByb21pc2VNYXAoZG93bmxvYWRlZCwgKHJlc3VsdCkgPT4gcmVzdWx0LnByb21pc2UudGhlbigoKSA9PiByZXN1bHQuZmlsZU5hbWUpKSxcblx0XHRdKVxuXHRcdC8vIGNvbWJpbmUgdGhlIGxpc3Qgb2YgbmV3bHkgZG93bmxvYWRlZCBhbmQgcHJldmlvdXNseSBkb3dubG9hZGVkIGZpbGVzXG5cdFx0cmV0dXJuIG5ld0ZpbGVzLmNvbmNhdChleGlzdGluZ0ZpbGVzKVxuXHR9XG5cblx0dmlldyh2bm9kZTogVm5vZGU8TWFpbExpc3RWaWV3QXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdHRoaXMuYXR0cnMgPSB2bm9kZS5hdHRyc1xuXG5cdFx0Ly8gU2F2ZSB0aGUgZm9sZGVyIGJlZm9yZSBzaG93aW5nIHRoZSBkaWFsb2cgc28gdGhhdCB0aGVyZSdzIG5vIGNoYW5jZSB0aGF0IGl0IHdpbGwgY2hhbmdlXG5cdFx0Y29uc3QgZm9sZGVyID0gdGhpcy5tYWlsVmlld01vZGVsLmdldEZvbGRlcigpXG5cdFx0Y29uc3QgcHVyZ2VCdXR0b25BdHRyczogQnV0dG9uQXR0cnMgPSB7XG5cdFx0XHRsYWJlbDogXCJjbGVhckZvbGRlcl9hY3Rpb25cIixcblx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuUHJpbWFyeSxcblx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuTmF2LFxuXHRcdFx0Y2xpY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0dm5vZGUuYXR0cnMub25DbGVhckZvbGRlcigpXG5cdFx0XHR9LFxuXHRcdH1cblxuXHRcdC8vIGxpc3RlbmVycyB0byBpbmRpY2F0ZSB0aGUgd2hlbiBtb2Qga2V5IGlzIGhlbGQsIGRyYWdnaW5nIHdpbGwgZG8gc29tZXRoaW5nXG5cdFx0Y29uc3Qgb25LZXlEb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG5cdFx0XHRpZiAoaXNEcmFnQW5kRHJvcE1vZGlmaWVySGVsZChldmVudCkpIHtcblx0XHRcdFx0dGhpcy5fbGlzdERvbT8uY2xhc3NMaXN0LmFkZChcImRyYWctbW9kLWtleVwiKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IG9uS2V5VXAgPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRcdC8vIFRoZSBldmVudCBkb2Vzbid0IGhhdmUgYVxuXHRcdFx0dGhpcy5fbGlzdERvbT8uY2xhc3NMaXN0LnJlbW92ZShcImRyYWctbW9kLWtleVwiKVxuXHRcdH1cblxuXHRcdGNvbnN0IGxpc3RNb2RlbCA9IHZub2RlLmF0dHJzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsIVxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIubWFpbC1saXN0LXdyYXBwZXJcIixcblx0XHRcdHtcblx0XHRcdFx0b25jcmVhdGU6ICh2bm9kZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2xpc3REb20gPSBkb3duY2FzdCh2bm9kZS5kb20uZmlyc3RDaGlsZClcblxuXHRcdFx0XHRcdGlmIChjYW5Eb0RyYWdBbmREcm9wRXhwb3J0KCkpIHtcblx0XHRcdFx0XHRcdGFzc2VydE5vdE51bGwoZG9jdW1lbnQuYm9keSkuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgb25LZXlEb3duKVxuXHRcdFx0XHRcdFx0YXNzZXJ0Tm90TnVsbChkb2N1bWVudC5ib2R5KS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgb25LZXlVcClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uYmVmb3JlcmVtb3ZlOiAodm5vZGUpID0+IHtcblx0XHRcdFx0XHRpZiAoY2FuRG9EcmFnQW5kRHJvcEV4cG9ydCgpKSB7XG5cdFx0XHRcdFx0XHRhc3NlcnROb3ROdWxsKGRvY3VtZW50LmJvZHkpLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIG9uS2V5RG93bilcblx0XHRcdFx0XHRcdGFzc2VydE5vdE51bGwoZG9jdW1lbnQuYm9keSkucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIG9uS2V5VXApXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdC8vIGFsd2F5cyByZW5kZXIgdGhlIHdyYXBwZXIgc28gdGhhdCB0aGUgbGlzdCBpcyBub3QgcmUtY3JlYXRlZCBmcm9tIHNjcmF0Y2ggd2hlblxuXHRcdFx0Ly8gc2hvd2luZ1NwYW1PclRyYXNoIGNoYW5nZXMuXG5cdFx0XHRtKFxuXHRcdFx0XHRMaXN0Q29sdW1uV3JhcHBlcixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGhlYWRlckNvbnRlbnQ6IHRoaXMucmVuZGVyTGlzdEhlYWRlcihwdXJnZUJ1dHRvbkF0dHJzKSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bGlzdE1vZGVsLmlzRW1wdHlBbmREb25lKClcblx0XHRcdFx0XHQ/IG0oQ29sdW1uRW1wdHlNZXNzYWdlQm94LCB7XG5cdFx0XHRcdFx0XHRcdGljb246IEJvb3RJY29ucy5NYWlsLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlOiBcIm5vTWFpbHNfbXNnXCIsXG5cdFx0XHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5saXN0X21lc3NhZ2VfYmcsXG5cdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdDogbShMaXN0LCB7XG5cdFx0XHRcdFx0XHRcdHN0YXRlOiBsaXN0TW9kZWwuc3RhdGVTdHJlYW0oKSxcblx0XHRcdFx0XHRcdFx0cmVuZGVyQ29uZmlnOiB0aGlzLnJlbmRlckNvbmZpZyxcblx0XHRcdFx0XHRcdFx0b25Mb2FkTW9yZSgpIHtcblx0XHRcdFx0XHRcdFx0XHRsaXN0TW9kZWwubG9hZE1vcmUoKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRvblJldHJ5TG9hZGluZygpIHtcblx0XHRcdFx0XHRcdFx0XHRsaXN0TW9kZWwucmV0cnlMb2FkaW5nKClcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0b25TaW5nbGVTZWxlY3Rpb246IChpdGVtKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0dm5vZGUuYXR0cnMub25TaW5nbGVTZWxlY3Rpb24oaXRlbSlcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0b25TaW5nbGVUb2dnbGluZ011bHRpc2VsZWN0aW9uOiAoaXRlbTogTWFpbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHZub2RlLmF0dHJzLm9uU2luZ2xlSW5jbHVzaXZlU2VsZWN0aW9uKGl0ZW0sIHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRvblJhbmdlU2VsZWN0aW9uVG93YXJkczogKGl0ZW06IE1haWwpID0+IHtcblx0XHRcdFx0XHRcdFx0XHR2bm9kZS5hdHRycy5vblJhbmdlU2VsZWN0aW9uVG93YXJkcyhpdGVtKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRvblN0b3BMb2FkaW5nKCkge1xuXHRcdFx0XHRcdFx0XHRcdGxpc3RNb2RlbC5zdG9wTG9hZGluZygpXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ICB9IHNhdGlzZmllcyBMaXN0QXR0cnM8TWFpbCwgTWFpbFJvdz4pLFxuXHRcdFx0KSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxpc3RIZWFkZXIocHVyZ2VCdXR0b25BdHRyczogQnV0dG9uQXR0cnMpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXCIuZmxleC5jb2xcIiwgW1xuXHRcdFx0dGhpcy5zaG93aW5nU3BhbU9yVHJhc2hcblx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRtKFwiLmZsZXguZmxleC1jb2x1bW4ucGxyLWxcIiwgW1xuXHRcdFx0XHRcdFx0XHRtKFwiLnNtYWxsLmZsZXgtZ3Jvdy5wdFwiLCBsYW5nLmdldChcInN0b3JhZ2VEZWxldGlvbl9tc2dcIikpLFxuXHRcdFx0XHRcdFx0XHRtKFwiLm1yLW5lZ2F0aXZlLXMuYWxpZ24tc2VsZi1lbmRcIiwgbShCdXR0b24sIHB1cmdlQnV0dG9uQXR0cnMpKSxcblx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHQgIF1cblx0XHRcdFx0OiBudWxsLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHRhcmdldEluYm94KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHNlbGVjdGVkRm9sZGVyID0gdGhpcy5tYWlsVmlld01vZGVsLmdldEZvbGRlcigpXG5cdFx0aWYgKHNlbGVjdGVkRm9sZGVyKSB7XG5cdFx0XHRjb25zdCBtYWlsRGV0YWlscyA9IGF3YWl0IHRoaXMubWFpbFZpZXdNb2RlbC5nZXRNYWlsYm94RGV0YWlscygpXG5cdFx0XHRpZiAobWFpbERldGFpbHMubWFpbGJveC5mb2xkZXJzKSB7XG5cdFx0XHRcdGNvbnN0IGZvbGRlcnMgPSBhd2FpdCBtYWlsTG9jYXRvci5tYWlsTW9kZWwuZ2V0TWFpbGJveEZvbGRlcnNGb3JJZChtYWlsRGV0YWlscy5tYWlsYm94LmZvbGRlcnMuX2lkKVxuXHRcdFx0XHRyZXR1cm4gaXNPZlR5cGVPclN1YmZvbGRlck9mKGZvbGRlcnMsIHNlbGVjdGVkRm9sZGVyLCBNYWlsU2V0S2luZC5BUkNISVZFKSB8fCBzZWxlY3RlZEZvbGRlci5mb2xkZXJUeXBlID09PSBNYWlsU2V0S2luZC5UUkFTSFxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgb25Td2lwZUxlZnQobGlzdEVsZW1lbnQ6IE1haWwpOiBQcm9taXNlPExpc3RTd2lwZURlY2lzaW9uPiB7XG5cdFx0Y29uc3Qgd2VyZURlbGV0ZWQgPSBhd2FpdCBwcm9tcHRBbmREZWxldGVNYWlscyhtYWlsTG9jYXRvci5tYWlsTW9kZWwsIFtsaXN0RWxlbWVudF0sICgpID0+IHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWw/LnNlbGVjdE5vbmUoKSlcblx0XHRyZXR1cm4gd2VyZURlbGV0ZWQgPyBMaXN0U3dpcGVEZWNpc2lvbi5Db21taXQgOiBMaXN0U3dpcGVEZWNpc2lvbi5DYW5jZWxcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgb25Td2lwZVJpZ2h0KGxpc3RFbGVtZW50OiBNYWlsKTogUHJvbWlzZTxMaXN0U3dpcGVEZWNpc2lvbj4ge1xuXHRcdGlmICh0aGlzLnNob3dpbmdEcmFmdCkge1xuXHRcdFx0Ly8ganVzdCBjYW5jZWwgc2VsZWN0aW9uIGlmIGluIGRyYWZ0c1xuXHRcdFx0dGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbD8uc2VsZWN0Tm9uZSgpXG5cdFx0XHRyZXR1cm4gTGlzdFN3aXBlRGVjaXNpb24uQ2FuY2VsXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGZvbGRlcnMgPSBhd2FpdCBtYWlsTG9jYXRvci5tYWlsTW9kZWwuZ2V0TWFpbGJveEZvbGRlcnNGb3JNYWlsKGxpc3RFbGVtZW50KVxuXHRcdFx0aWYgKGZvbGRlcnMpIHtcblx0XHRcdFx0Ly9DaGVjayBpZiB0aGUgdXNlciBpcyBpbiB0aGUgdHJhc2gvc3BhbSBmb2xkZXIgb3IgaWYgaXQncyBpbiBJbmJveCBvciBBcmNoaXZlXG5cdFx0XHRcdC8vdG8gZGV0ZXJtaW5hdGUgdGhlIHRhcmdldCBmb2xkZXJcblx0XHRcdFx0Y29uc3QgdGFyZ2V0TWFpbEZvbGRlciA9IHRoaXMuc2hvd2luZ1NwYW1PclRyYXNoXG5cdFx0XHRcdFx0PyB0aGlzLmdldFJlY292ZXJGb2xkZXIobGlzdEVsZW1lbnQsIGZvbGRlcnMpXG5cdFx0XHRcdFx0OiBhc3NlcnROb3ROdWxsKGZvbGRlcnMuZ2V0U3lzdGVtRm9sZGVyQnlUeXBlKHRoaXMuc2hvd2luZ0FyY2hpdmUgPyBNYWlsU2V0S2luZC5JTkJPWCA6IE1haWxTZXRLaW5kLkFSQ0hJVkUpKVxuXHRcdFx0XHRjb25zdCB3ZXJlTW92ZWQgPSBhd2FpdCBtb3ZlTWFpbHMoe1xuXHRcdFx0XHRcdG1haWxib3hNb2RlbDogbG9jYXRvci5tYWlsYm94TW9kZWwsXG5cdFx0XHRcdFx0bWFpbE1vZGVsOiBtYWlsTG9jYXRvci5tYWlsTW9kZWwsXG5cdFx0XHRcdFx0bWFpbHM6IFtsaXN0RWxlbWVudF0sXG5cdFx0XHRcdFx0dGFyZ2V0TWFpbEZvbGRlcixcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIHdlcmVNb3ZlZCA/IExpc3RTd2lwZURlY2lzaW9uLkNvbW1pdCA6IExpc3RTd2lwZURlY2lzaW9uLkNhbmNlbFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIExpc3RTd2lwZURlY2lzaW9uLkNhbmNlbFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyTGVmdFNwYWNlcigpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIHRoaXMuc2hvd2luZ0RyYWZ0XG5cdFx0XHQ/IFtcblx0XHRcdFx0XHRtKEljb24sIHtcblx0XHRcdFx0XHRcdGljb246IEljb25zLkNhbmNlbCxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRtKFwiLnBsLXNcIiwgbGFuZy5nZXQoXCJjYW5jZWxfYWN0aW9uXCIpKSwgLy8gaWYgdGhpcyBpcyB0aGUgZHJhZnRzIGZvbGRlciwgd2UgY2FuIG9ubHkgY2FuY2VsIHRoZSBzZWxlY3Rpb24gYXMgd2UgaGF2ZSBub3doZXJlIGVsc2UgdG8gcHV0IHRoZSBtYWlsXG5cdFx0XHQgIF1cblx0XHRcdDogW1xuXHRcdFx0XHRcdG0oSWNvbiwge1xuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuRm9sZGVyLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcIi5wbC1zXCIsXG5cdFx0XHRcdFx0XHR0aGlzLnNob3dpbmdTcGFtT3JUcmFzaFxuXHRcdFx0XHRcdFx0XHQ/IGxhbmcuZ2V0KFwicmVjb3Zlcl9sYWJlbFwiKSAvLyBzaG93IFwicmVjb3ZlclwiIGlmIHRoaXMgaXMgdGhlIHRyYXNoL3NwYW0gZm9sZGVyXG5cdFx0XHRcdFx0XHRcdDogdGhpcy5zaG93aW5nQXJjaGl2ZSAvLyBvdGhlcndpc2Ugc2hvdyBcImluYm94XCIgb3IgXCJhcmNoaXZlXCIgZGVwZW5kaW5nIG9uIHRoZSBmb2xkZXJcblx0XHRcdFx0XHRcdFx0PyBsYW5nLmdldChcInJlY2VpdmVkX2FjdGlvblwiKVxuXHRcdFx0XHRcdFx0XHQ6IGxhbmcuZ2V0KFwiYXJjaGl2ZV9sYWJlbFwiKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0ICBdXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclJpZ2h0U3BhY2VyKCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0bShJY29uLCB7XG5cdFx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdFx0fSksXG5cdFx0XHRtKFwiLnBsLXNcIiwgbGFuZy5nZXQoXCJkZWxldGVfYWN0aW9uXCIpKSxcblx0XHRdXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwb3J0RHJhZ0V2ZW50KGV2ZW50OiBEcmFnRXZlbnQpOiBib29sZWFuIHtcblx0cmV0dXJuIGNhbkRvRHJhZ0FuZERyb3BFeHBvcnQoKSAmJiBpc0RyYWdBbmREcm9wTW9kaWZpZXJIZWxkKGV2ZW50KVxufVxuXG5mdW5jdGlvbiBpc0RyYWdBbmREcm9wTW9kaWZpZXJIZWxkKGV2ZW50OiBEcmFnRXZlbnQgfCBLZXlib2FyZEV2ZW50KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0ZXZlbnQuY3RybEtleSB8fFxuXHRcdGV2ZW50LmFsdEtleSB8fFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHQoZXZlbnQua2V5ICE9IG51bGwgJiYgaXNLZXlQcmVzc2VkKGV2ZW50LmtleSwgS2V5cy5DVFJMLCBLZXlzLkFMVCkpXG5cdClcbn1cbiIsImltcG9ydCB7IE1haWwsIE1haWxGb2xkZXIsIE1haWxTZXRFbnRyeVR5cGVSZWYsIE1haWxUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgRHJvcERvd25TZWxlY3RvciwgU2VsZWN0b3JJdGVtTGlzdCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcERvd25TZWxlY3Rvci5qc1wiXG5pbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IExvY2tlZEVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBsYW5nLCBUcmFuc2xhdGlvbktleSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBNYWlsYm94RGV0YWlsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9tYWlsRnVuY3Rpb25hbGl0eS9NYWlsYm94TW9kZWwuanNcIlxuaW1wb3J0IHsgTWFpbFJlcG9ydFR5cGUsIE1haWxTZXRLaW5kIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGVsZW1lbnRJZFBhcnQsIGlzU2FtZUlkLCBsaXN0SWRQYXJ0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IHJlcG9ydE1haWxzQXV0b21hdGljYWxseSB9IGZyb20gXCIuL01haWxSZXBvcnREaWFsb2cuanNcIlxuaW1wb3J0IHsgaXNPZmZsaW5lRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRXJyb3JVdGlscy5qc1wiXG5pbXBvcnQgeyBncm91cEJ5QW5kTWFwIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBtYWlsTG9jYXRvciB9IGZyb20gXCIuLi8uLi9tYWlsTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgdHlwZSB7IEZvbGRlclN5c3RlbSwgSW5kZW50ZWRGb2xkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vbWFpbC9Gb2xkZXJTeXN0ZW0uanNcIlxuaW1wb3J0IHsgZ2V0Rm9sZGVyTmFtZSwgZ2V0SW5kZW50ZWRGb2xkZXJOYW1lRm9yRHJvcGRvd24sIGdldFBhdGhUb0ZvbGRlclN0cmluZyB9IGZyb20gXCIuLi9tb2RlbC9NYWlsVXRpbHMuanNcIlxuaW1wb3J0IHsgaXNTcGFtT3JUcmFzaEZvbGRlciB9IGZyb20gXCIuLi9tb2RlbC9NYWlsQ2hlY2tzLmpzXCJcblxuLyoqXG4gKiBEaWFsb2cgZm9yIEVkaXQgYW5kIEFkZCBmb2xkZXIgYXJlIHRoZSBzYW1lLlxuICogQHBhcmFtIGVkaXRlZEZvbGRlciBpZiB0aGlzIGlzIG51bGwsIGEgZm9sZGVyIGlzIGJlaW5nIGFkZGVkLCBvdGhlcndpc2UgYSBmb2xkZXIgaXMgYmVpbmcgZWRpdGVkXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaG93RWRpdEZvbGRlckRpYWxvZyhtYWlsQm94RGV0YWlsOiBNYWlsYm94RGV0YWlsLCBlZGl0ZWRGb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsID0gbnVsbCwgcGFyZW50Rm9sZGVyOiBNYWlsRm9sZGVyIHwgbnVsbCA9IG51bGwpIHtcblx0Y29uc3Qgbm9QYXJlbnRGb2xkZXJPcHRpb24gPSBsYW5nLmdldChcImNvbWJvQm94U2VsZWN0aW9uTm9uZV9tc2dcIilcblx0Y29uc3QgbWFpbEdyb3VwSWQgPSBtYWlsQm94RGV0YWlsLm1haWxHcm91cC5faWRcblx0Y29uc3QgZm9sZGVycyA9IGF3YWl0IG1haWxMb2NhdG9yLm1haWxNb2RlbC5nZXRNYWlsYm94Rm9sZGVyc0ZvcklkKGFzc2VydE5vdE51bGwobWFpbEJveERldGFpbC5tYWlsYm94LmZvbGRlcnMpLl9pZClcblx0bGV0IGZvbGRlck5hbWVWYWx1ZSA9IGVkaXRlZEZvbGRlcj8ubmFtZSA/PyBcIlwiXG5cdGxldCB0YXJnZXRGb2xkZXJzOiBTZWxlY3Rvckl0ZW1MaXN0PE1haWxGb2xkZXIgfCBudWxsPiA9IGZvbGRlcnNcblx0XHQuZ2V0SW5kZW50ZWRMaXN0KGVkaXRlZEZvbGRlcilcblx0XHQvLyBmaWx0ZXI6IFNQQU0gYW5kIFRSQVNIIGFuZCBkZXNjZW5kYW50cyBhcmUgb25seSBzaG93biBpZiBlZGl0aW5nIChmb2xkZXJzIGNhbiBvbmx5IGJlIG1vdmVkIHRoZXJlLCBub3QgY3JlYXRlZCB0aGVyZSlcblx0XHQuZmlsdGVyKChmb2xkZXJJbmZvOiBJbmRlbnRlZEZvbGRlcikgPT4gIShlZGl0ZWRGb2xkZXIgPT09IG51bGwgJiYgaXNTcGFtT3JUcmFzaEZvbGRlcihmb2xkZXJzLCBmb2xkZXJJbmZvLmZvbGRlcikpKVxuXHRcdC5tYXAoKGZvbGRlckluZm86IEluZGVudGVkRm9sZGVyKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRuYW1lOiBnZXRJbmRlbnRlZEZvbGRlck5hbWVGb3JEcm9wZG93bihmb2xkZXJJbmZvKSxcblx0XHRcdFx0dmFsdWU6IGZvbGRlckluZm8uZm9sZGVyLFxuXHRcdFx0fVxuXHRcdH0pXG5cdHRhcmdldEZvbGRlcnMgPSBbeyBuYW1lOiBub1BhcmVudEZvbGRlck9wdGlvbiwgdmFsdWU6IG51bGwgfSwgLi4udGFyZ2V0Rm9sZGVyc11cblx0bGV0IHNlbGVjdGVkUGFyZW50Rm9sZGVyID0gcGFyZW50Rm9sZGVyXG5cdGxldCBmb3JtID0gKCkgPT4gW1xuXHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRsYWJlbDogZWRpdGVkRm9sZGVyID8gXCJyZW5hbWVfYWN0aW9uXCIgOiBcImZvbGRlck5hbWVfbGFiZWxcIixcblx0XHRcdHZhbHVlOiBmb2xkZXJOYW1lVmFsdWUsXG5cdFx0XHRvbmlucHV0OiAobmV3SW5wdXQpID0+IHtcblx0XHRcdFx0Zm9sZGVyTmFtZVZhbHVlID0gbmV3SW5wdXRcblx0XHRcdH0sXG5cdFx0fSksXG5cdFx0bShEcm9wRG93blNlbGVjdG9yLCB7XG5cdFx0XHRsYWJlbDogXCJwYXJlbnRGb2xkZXJfbGFiZWxcIixcblx0XHRcdGl0ZW1zOiB0YXJnZXRGb2xkZXJzLFxuXHRcdFx0c2VsZWN0ZWRWYWx1ZTogc2VsZWN0ZWRQYXJlbnRGb2xkZXIsXG5cdFx0XHRzZWxlY3RlZFZhbHVlRGlzcGxheTogc2VsZWN0ZWRQYXJlbnRGb2xkZXIgPyBnZXRGb2xkZXJOYW1lKHNlbGVjdGVkUGFyZW50Rm9sZGVyKSA6IG5vUGFyZW50Rm9sZGVyT3B0aW9uLFxuXHRcdFx0c2VsZWN0aW9uQ2hhbmdlZEhhbmRsZXI6IChuZXdGb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsKSA9PiAoc2VsZWN0ZWRQYXJlbnRGb2xkZXIgPSBuZXdGb2xkZXIpLFxuXHRcdFx0aGVscExhYmVsOiAoKSA9PiAoc2VsZWN0ZWRQYXJlbnRGb2xkZXIgPyBnZXRQYXRoVG9Gb2xkZXJTdHJpbmcoZm9sZGVycywgc2VsZWN0ZWRQYXJlbnRGb2xkZXIpIDogXCJcIiksXG5cdFx0fSksXG5cdF1cblxuXHRhc3luYyBmdW5jdGlvbiBnZXRNYWlsSWRzR3JvdXBlZEJ5TGlzdElkKGZvbGRlcjogTWFpbEZvbGRlcik6IFByb21pc2U8TWFwPElkLCBJZFtdPj4ge1xuXHRcdGNvbnN0IG1haWxTZXRFbnRyaWVzID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZEFsbChNYWlsU2V0RW50cnlUeXBlUmVmLCBmb2xkZXIuZW50cmllcylcblx0XHRyZXR1cm4gZ3JvdXBCeUFuZE1hcChcblx0XHRcdG1haWxTZXRFbnRyaWVzLFxuXHRcdFx0KG1zZSkgPT4gbGlzdElkUGFydChtc2UubWFpbCksXG5cdFx0XHQobXNlKSA9PiBlbGVtZW50SWRQYXJ0KG1zZS5tYWlsKSxcblx0XHQpXG5cdH1cblxuXHRhc3luYyBmdW5jdGlvbiBsb2FkQWxsTWFpbHNPZkZvbGRlcihmb2xkZXI6IE1haWxGb2xkZXIsIHJlcG9ydGFibGVNYWlsczogQXJyYXk8TWFpbD4pIHtcblx0XHRjb25zdCBtYWlsSWRzUGVyQmFnID0gYXdhaXQgZ2V0TWFpbElkc0dyb3VwZWRCeUxpc3RJZChmb2xkZXIpXG5cdFx0Zm9yIChjb25zdCBbbWFpbExpc3RJZCwgbWFpbElkc10gb2YgbWFpbElkc1BlckJhZykge1xuXHRcdFx0cmVwb3J0YWJsZU1haWxzLnB1c2goLi4uKGF3YWl0IGxvY2F0b3IuZW50aXR5Q2xpZW50LmxvYWRNdWx0aXBsZShNYWlsVHlwZVJlZiwgbWFpbExpc3RJZCwgbWFpbElkcykpKVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IG9rQWN0aW9uID0gYXN5bmMgKGRpYWxvZzogRGlhbG9nKSA9PiB7XG5cdFx0Ly8gY2xvc2luZyByaWdodCBhd2F5IHRvIHByZXZlbnQgZHVwbGljYXRlIGFjdGlvbnNcblx0XHRkaWFsb2cuY2xvc2UoKVxuXHRcdHRyeSB7XG5cdFx0XHQvLyBpZiBmb2xkZXIgaXMgbnVsbCwgY3JlYXRlIG5ldyBmb2xkZXJcblx0XHRcdGlmIChlZGl0ZWRGb2xkZXIgPT09IG51bGwpIHtcblx0XHRcdFx0YXdhaXQgbG9jYXRvci5tYWlsRmFjYWRlLmNyZWF0ZU1haWxGb2xkZXIoZm9sZGVyTmFtZVZhbHVlLCBzZWxlY3RlZFBhcmVudEZvbGRlcj8uX2lkID8/IG51bGwsIG1haWxHcm91cElkKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gaWYgaXQgaXMgYmVpbmcgbW92ZWQgdG8gdHJhc2ggKGFuZCBub3QgYWxyZWFkeSBpbiB0cmFzaCksIGFzayBhYm91dCB0cmFzaGluZ1xuXHRcdFx0XHRpZiAoc2VsZWN0ZWRQYXJlbnRGb2xkZXI/LmZvbGRlclR5cGUgPT09IE1haWxTZXRLaW5kLlRSQVNIICYmICFpc1NhbWVJZChzZWxlY3RlZFBhcmVudEZvbGRlci5faWQsIGVkaXRlZEZvbGRlci5wYXJlbnRGb2xkZXIpKSB7XG5cdFx0XHRcdFx0Y29uc3QgY29uZmlybWVkID0gYXdhaXQgRGlhbG9nLmNvbmZpcm0oXG5cdFx0XHRcdFx0XHRsYW5nLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0XHRcdFx0XCJjb25maXJtXCIsXG5cdFx0XHRcdFx0XHRcdGxhbmcuZ2V0KFwiY29uZmlybURlbGV0ZUN1c3RvbUZvbGRlcl9tc2dcIiwge1xuXHRcdFx0XHRcdFx0XHRcdFwiezF9XCI6IGdldEZvbGRlck5hbWUoZWRpdGVkRm9sZGVyKSxcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHRpZiAoIWNvbmZpcm1lZCkgcmV0dXJuXG5cblx0XHRcdFx0XHRhd2FpdCBsb2NhdG9yLm1haWxGYWNhZGUudXBkYXRlTWFpbEZvbGRlck5hbWUoZWRpdGVkRm9sZGVyLCBmb2xkZXJOYW1lVmFsdWUpXG5cdFx0XHRcdFx0YXdhaXQgbWFpbExvY2F0b3IubWFpbE1vZGVsLnRyYXNoRm9sZGVyQW5kU3ViZm9sZGVycyhlZGl0ZWRGb2xkZXIpXG5cdFx0XHRcdH0gZWxzZSBpZiAoc2VsZWN0ZWRQYXJlbnRGb2xkZXI/LmZvbGRlclR5cGUgPT09IE1haWxTZXRLaW5kLlNQQU0gJiYgIWlzU2FtZUlkKHNlbGVjdGVkUGFyZW50Rm9sZGVyLl9pZCwgZWRpdGVkRm9sZGVyLnBhcmVudEZvbGRlcikpIHtcblx0XHRcdFx0XHQvLyBpZiBpdCBpcyBiZWluZyBtb3ZlZCB0byBzcGFtIChhbmQgbm90IGFscmVhZHkgaW4gc3BhbSksIGFzayBhYm91dCByZXBvcnRpbmcgY29udGFpbmluZyBlbWFpbHNcblx0XHRcdFx0XHRjb25zdCBjb25maXJtZWQgPSBhd2FpdCBEaWFsb2cuY29uZmlybShcblx0XHRcdFx0XHRcdGxhbmcubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRcImNvbmZpcm1cIixcblx0XHRcdFx0XHRcdFx0bGFuZy5nZXQoXCJjb25maXJtU3BhbUN1c3RvbUZvbGRlcl9tc2dcIiwge1xuXHRcdFx0XHRcdFx0XHRcdFwiezF9XCI6IGdldEZvbGRlck5hbWUoZWRpdGVkRm9sZGVyKSxcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHRpZiAoIWNvbmZpcm1lZCkgcmV0dXJuXG5cblx0XHRcdFx0XHQvLyBnZXQgbWFpbHMgdG8gcmVwb3J0IGJlZm9yZSBtb3ZpbmcgdG8gbWFpbCBtb2RlbFxuXHRcdFx0XHRcdGNvbnN0IGRlc2NlbmRhbnRzID0gZm9sZGVycy5nZXREZXNjZW5kYW50Rm9sZGVyc09mUGFyZW50KGVkaXRlZEZvbGRlci5faWQpLnNvcnQoKGw6IEluZGVudGVkRm9sZGVyLCByOiBJbmRlbnRlZEZvbGRlcikgPT4gci5sZXZlbCAtIGwubGV2ZWwpXG5cdFx0XHRcdFx0bGV0IHJlcG9ydGFibGVNYWlsczogQXJyYXk8TWFpbD4gPSBbXVxuXHRcdFx0XHRcdGF3YWl0IGxvYWRBbGxNYWlsc09mRm9sZGVyKGVkaXRlZEZvbGRlciwgcmVwb3J0YWJsZU1haWxzKVxuXHRcdFx0XHRcdGZvciAoY29uc3QgZGVzY2VuZGFudCBvZiBkZXNjZW5kYW50cykge1xuXHRcdFx0XHRcdFx0YXdhaXQgbG9hZEFsbE1haWxzT2ZGb2xkZXIoZGVzY2VuZGFudC5mb2xkZXIsIHJlcG9ydGFibGVNYWlscylcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YXdhaXQgcmVwb3J0TWFpbHNBdXRvbWF0aWNhbGx5KE1haWxSZXBvcnRUeXBlLlNQQU0sIGxvY2F0b3IubWFpbGJveE1vZGVsLCBtYWlsTG9jYXRvci5tYWlsTW9kZWwsIG1haWxCb3hEZXRhaWwsIHJlcG9ydGFibGVNYWlscylcblxuXHRcdFx0XHRcdGF3YWl0IGxvY2F0b3IubWFpbEZhY2FkZS51cGRhdGVNYWlsRm9sZGVyTmFtZShlZGl0ZWRGb2xkZXIsIGZvbGRlck5hbWVWYWx1ZSlcblx0XHRcdFx0XHRhd2FpdCBtYWlsTG9jYXRvci5tYWlsTW9kZWwuc2VuZEZvbGRlclRvU3BhbShlZGl0ZWRGb2xkZXIpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXdhaXQgbG9jYXRvci5tYWlsRmFjYWRlLnVwZGF0ZU1haWxGb2xkZXJOYW1lKGVkaXRlZEZvbGRlciwgZm9sZGVyTmFtZVZhbHVlKVxuXHRcdFx0XHRcdGF3YWl0IGxvY2F0b3IubWFpbEZhY2FkZS51cGRhdGVNYWlsRm9sZGVyUGFyZW50KGVkaXRlZEZvbGRlciwgc2VsZWN0ZWRQYXJlbnRGb2xkZXI/Ll9pZCB8fCBudWxsKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGlmIChpc09mZmxpbmVFcnJvcihlcnJvcikgfHwgIShlcnJvciBpbnN0YW5jZW9mIExvY2tlZEVycm9yKSkge1xuXHRcdFx0XHR0aHJvdyBlcnJvclxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdERpYWxvZy5zaG93QWN0aW9uRGlhbG9nKHtcblx0XHR0aXRsZTogZWRpdGVkRm9sZGVyID8gXCJlZGl0Rm9sZGVyX2FjdGlvblwiIDogXCJhZGRGb2xkZXJfYWN0aW9uXCIsXG5cdFx0Y2hpbGQ6IGZvcm0sXG5cdFx0dmFsaWRhdG9yOiAoKSA9PiBjaGVja0ZvbGRlck5hbWUobWFpbEJveERldGFpbCwgZm9sZGVycywgZm9sZGVyTmFtZVZhbHVlLCBtYWlsR3JvdXBJZCwgc2VsZWN0ZWRQYXJlbnRGb2xkZXI/Ll9pZCA/PyBudWxsKSxcblx0XHRhbGxvd09rV2l0aFJldHVybjogdHJ1ZSxcblx0XHRva0FjdGlvbjogb2tBY3Rpb24sXG5cdH0pXG59XG5cbmZ1bmN0aW9uIGNoZWNrRm9sZGVyTmFtZShcblx0bWFpbGJveERldGFpbDogTWFpbGJveERldGFpbCxcblx0Zm9sZGVyczogRm9sZGVyU3lzdGVtLFxuXHRuYW1lOiBzdHJpbmcsXG5cdG1haWxHcm91cElkOiBJZCxcblx0cGFyZW50Rm9sZGVySWQ6IElkVHVwbGUgfCBudWxsLFxuKTogVHJhbnNsYXRpb25LZXkgfCBudWxsIHtcblx0aWYgKG5hbWUudHJpbSgpID09PSBcIlwiKSB7XG5cdFx0cmV0dXJuIFwiZm9sZGVyTmFtZU5ldXRyYWxfbXNnXCJcblx0fSBlbHNlIGlmIChmb2xkZXJzLmdldEN1c3RvbUZvbGRlcnNPZlBhcmVudChwYXJlbnRGb2xkZXJJZCkuc29tZSgoZikgPT4gZi5uYW1lID09PSBuYW1lKSkge1xuXHRcdHJldHVybiBcImZvbGRlck5hbWVJbnZhbGlkRXhpc3RpbmdfbXNnXCJcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB0eXBlIHsgTmF2QnV0dG9uQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL05hdkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBpc05hdkJ1dHRvblNlbGVjdGVkLCBOYXZCdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL05hdkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBDb3VudGVyQmFkZ2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0NvdW50ZXJCYWRnZVwiXG5pbXBvcnQgeyBnZXROYXZCdXR0b25JY29uQmFja2dyb3VuZCwgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZVwiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemVcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiwgSWNvbkJ1dHRvbkF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IEljb24sIEljb25TaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyBzdGF0ZUJnSG92ZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9idWlsdGluVGhlbWVzLmpzXCJcbmltcG9ydCB7IGNsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9DbGllbnREZXRlY3Rvci5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IE1haWxGb2xkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmc1wiXG5pbXBvcnQgeyBnZXRGb2xkZXJJY29uIH0gZnJvbSBcIi4vTWFpbEd1aVV0aWxzXCJcbmltcG9ydCB7IGdldEZvbGRlck5hbWUgfSBmcm9tIFwiLi4vbW9kZWwvTWFpbFV0aWxzXCJcblxuZXhwb3J0IHR5cGUgTWFpbEZvbGRlclJvd0F0dHJzID0ge1xuXHRjb3VudDogbnVtYmVyXG5cdGJ1dHRvbjogTmF2QnV0dG9uQXR0cnNcblx0cmlnaHRCdXR0b24/OiBJY29uQnV0dG9uQXR0cnMgfCBudWxsXG5cdGV4cGFuZGVkOiBib29sZWFuIHwgbnVsbFxuXHRpbmRlbnRhdGlvbkxldmVsOiBudW1iZXJcblx0b25FeHBhbmRlckNsaWNrOiAoKSA9PiB1bmtub3duXG5cdGZvbGRlcjogTWFpbEZvbGRlclxuXHRoYXNDaGlsZHJlbjogYm9vbGVhblxuXHRvblNlbGVjdGVkUGF0aDogYm9vbGVhblxuXHRudW1iZXJPZlByZXZpb3VzUm93czogbnVtYmVyXG5cdGlzTGFzdFNpYmxpbmc6IGJvb2xlYW5cblx0ZWRpdE1vZGU6IGJvb2xlYW5cblx0b25Ib3ZlcjogKCkgPT4gdm9pZFxufVxuXG5leHBvcnQgY2xhc3MgTWFpbEZvbGRlclJvdyBpbXBsZW1lbnRzIENvbXBvbmVudDxNYWlsRm9sZGVyUm93QXR0cnM+IHtcblx0cHJpdmF0ZSBob3ZlcmVkOiBib29sZWFuID0gZmFsc2VcblxuXHRvbnVwZGF0ZSh2bm9kZTogVm5vZGU8TWFpbEZvbGRlclJvd0F0dHJzPik6IGFueSB7XG5cdFx0aWYgKGlzTmF2QnV0dG9uU2VsZWN0ZWQodm5vZGUuYXR0cnMuYnV0dG9uKSkge1xuXHRcdFx0dGhpcy5ob3ZlcmVkID0gdHJ1ZVxuXHRcdH1cblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPE1haWxGb2xkZXJSb3dBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBjb3VudCwgYnV0dG9uLCByaWdodEJ1dHRvbiwgZXhwYW5kZWQsIGluZGVudGF0aW9uTGV2ZWwsIGZvbGRlciwgaGFzQ2hpbGRyZW4sIGVkaXRNb2RlIH0gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IGljb24gPSBnZXRGb2xkZXJJY29uKGZvbGRlcilcblx0XHRjb25zdCBvbkhvdmVyID0gKCkgPT4ge1xuXHRcdFx0dm5vZGUuYXR0cnMub25Ib3ZlcigpXG5cdFx0XHR0aGlzLmhvdmVyZWQgPSB0cnVlXG5cdFx0fVxuXG5cdFx0Ly8gYmVjYXVzZSBvbmJsdXIgaXMgZmlyZWQgdXBvbiBjaGFuZ2luZyBmb2xkZXIgZHVlIHRvIHRoZSByb3V0ZSBjaGFuZ2Vcblx0XHQvLyB0aGVzZSBmdW5jdGlvbnMgY2FuIGJlIHVzZWQgdG8gaGFuZGxlIGtleWJvYXJkIG5hdmlnYXRpb25cblx0XHRjb25zdCBoYW5kbGVGb3J3YXJkc1RhYiA9IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdFx0aWYgKGV2ZW50LmtleSA9PT0gXCJUYWJcIiAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcblx0XHRcdFx0dGhpcy5ob3ZlcmVkID0gZmFsc2Vcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgaGFuZGxlQmFja3dhcmRzVGFiID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KSA9PiB7XG5cdFx0XHRpZiAoZXZlbnQua2V5ID09PSBcIlRhYlwiICYmIGV2ZW50LnNoaWZ0S2V5KSB0aGlzLmhvdmVyZWQgPSBmYWxzZVxuXHRcdH1cblxuXHRcdGNvbnN0IGluZGVudGF0aW9uTWFyZ2luID0gaW5kZW50YXRpb25MZXZlbCAqIHNpemUuaHBhZFxuXHRcdGNvbnN0IHBhZGRpbmdOZWVkZWQgPSBzaXplLmhwYWRfYnV0dG9uXG5cdFx0Y29uc3QgYnV0dG9uV2lkdGggPSBzaXplLmljb25fc2l6ZV9sYXJnZSArIHBhZGRpbmdOZWVkZWQgKiAyXG5cblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZvbGRlci1yb3cuZmxleC5mbGV4LXJvdy5tbHItYnV0dG9uLmJvcmRlci1yYWRpdXMtc21hbGwuc3RhdGUtYmdcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRiYWNrZ3JvdW5kOiBpc05hdkJ1dHRvblNlbGVjdGVkKGJ1dHRvbikgPyBzdGF0ZUJnSG92ZXIgOiBcIlwiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aXRsZTogbGFuZy5nZXRUcmFuc2xhdGlvblRleHQoYnV0dG9uLmxhYmVsKSxcblx0XHRcdFx0b25tb3VzZWVudGVyOiBvbkhvdmVyLFxuXHRcdFx0XHRvbm1vdXNlbGVhdmU6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmhvdmVyZWQgPSBmYWxzZVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0aGFzQ2hpbGRyZW4gJiYgIWV4cGFuZGVkXG5cdFx0XHRcdFx0PyBtKEljb24sIHtcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdGJvdHRvbTogcHgoOSksXG5cdFx0XHRcdFx0XHRcdFx0bGVmdDogcHgoNSArIGluZGVudGF0aW9uTWFyZ2luICsgYnV0dG9uV2lkdGggLyAyKSxcblx0XHRcdFx0XHRcdFx0XHRmaWxsOiBpc05hdkJ1dHRvblNlbGVjdGVkKGJ1dHRvbikgPyB0aGVtZS5uYXZpZ2F0aW9uX2J1dHRvbl9zZWxlY3RlZCA6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5BZGQsXG5cdFx0XHRcdFx0XHRcdGNsYXNzOiBcImljb24tc21hbGxcIixcblx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRtKFwiXCIsIHtcblx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0bWFyZ2luTGVmdDogcHgoaW5kZW50YXRpb25NYXJnaW4pLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHR0aGlzLnJlbmRlckhpZXJhcmNoeUxpbmUodm5vZGUuYXR0cnMsIGluZGVudGF0aW9uTWFyZ2luKSxcblx0XHRcdFx0bShcblx0XHRcdFx0XHRcImJ1dHRvbi5mbGV4Lml0ZW1zLWNlbnRlci5qdXN0aWZ5LWVuZFwiICsgKGVkaXRNb2RlIHx8ICFoYXNDaGlsZHJlbiA/IFwiLm5vLWhvdmVyXCIgOiBcIlwiKSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRsZWZ0OiBweChpbmRlbnRhdGlvbk1hcmdpbiksXG5cdFx0XHRcdFx0XHRcdHdpZHRoOiBweChidXR0b25XaWR0aCksXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHRcdFx0XHRcdFx0cGFkZGluZ0xlZnQ6IHB4KHBhZGRpbmdOZWVkZWQpLFxuXHRcdFx0XHRcdFx0XHRwYWRkaW5nUmlnaHQ6IHB4KHBhZGRpbmdOZWVkZWQpLFxuXHRcdFx0XHRcdFx0XHQvLyB0aGUgekluZGV4IGlzIHNvIHRoZSBoaWVyYXJjaHkgbGluZXMgbmV2ZXIgZ2V0IGRyYXduIG92ZXIgdGhlIGljb25cblx0XHRcdFx0XHRcdFx0ekluZGV4OiAzLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFwiZGF0YS10ZXN0aWRcIjogYGJ0bjppY29uOiR7Z2V0Rm9sZGVyTmFtZShmb2xkZXIpfWAsXG5cdFx0XHRcdFx0XHRcImRhdGEtZXhwYW5kZWRcIjogdm5vZGUuYXR0cnMuZXhwYW5kZWQgPyBcInRydWVcIiA6IFwiZmFsc2VcIixcblx0XHRcdFx0XHRcdG9uY2xpY2s6IHZub2RlLmF0dHJzLm9uRXhwYW5kZXJDbGljayxcblx0XHRcdFx0XHRcdG9ua2V5ZG93bjogaGFuZGxlQmFja3dhcmRzVGFiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bShJY29uLCB7XG5cdFx0XHRcdFx0XHRpY29uLFxuXHRcdFx0XHRcdFx0c2l6ZTogSWNvblNpemUuTWVkaXVtLFxuXHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0ZmlsbDogaXNOYXZCdXR0b25TZWxlY3RlZChidXR0b24pID8gdGhlbWUubmF2aWdhdGlvbl9idXR0b25fc2VsZWN0ZWQgOiB0aGVtZS5uYXZpZ2F0aW9uX2J1dHRvbixcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdCksXG5cdFx0XHRcdG0oTmF2QnV0dG9uLCB7XG5cdFx0XHRcdFx0Li4uYnV0dG9uLFxuXHRcdFx0XHRcdG9uZm9jdXM6IG9uSG92ZXIsXG5cdFx0XHRcdFx0b25rZXlkb3duOiBoYW5kbGVCYWNrd2FyZHNUYWIsXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHQvLyBzaG93IHRoZSBlZGl0IGJ1dHRvbiBpbiBlaXRoZXIgZWRpdCBtb2RlIG9yIG9uIGhvdmVyIChleGNsdWRpbmcgaG92ZXIgb24gbW9iaWxlKVxuXHRcdFx0XHRyaWdodEJ1dHRvbiAmJiAoZWRpdE1vZGUgfHwgKCFjbGllbnQuaXNNb2JpbGVEZXZpY2UoKSAmJiB0aGlzLmhvdmVyZWQpKVxuXHRcdFx0XHRcdD8gbShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdC4uLnJpZ2h0QnV0dG9uLFxuXHRcdFx0XHRcdFx0XHRjbGljazogKGV2ZW50LCBkb20pID0+IHtcblx0XHRcdFx0XHRcdFx0XHRyaWdodEJ1dHRvbi5jbGljayhldmVudCwgZG9tKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRvbmtleWRvd246IGhhbmRsZUZvcndhcmRzVGFiLFxuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IG0oXCJcIiwgeyBzdHlsZTogeyBtYXJnaW5SaWdodDogcHgoc2l6ZS5ocGFkX2J1dHRvbikgfSB9LCBbXG5cdFx0XHRcdFx0XHRcdG0oQ291bnRlckJhZGdlLCB7XG5cdFx0XHRcdFx0XHRcdFx0Y291bnQsXG5cdFx0XHRcdFx0XHRcdFx0Y29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uX2ljb24sXG5cdFx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogZ2V0TmF2QnV0dG9uSWNvbkJhY2tncm91bmQoKSxcblx0XHRcdFx0XHRcdFx0XHRzaG93RnVsbENvdW50OiB0cnVlLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHQgIF0pLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckhpZXJhcmNoeUxpbmUoeyBpbmRlbnRhdGlvbkxldmVsLCBudW1iZXJPZlByZXZpb3VzUm93cywgaXNMYXN0U2libGluZywgb25TZWxlY3RlZFBhdGggfTogTWFpbEZvbGRlclJvd0F0dHJzLCBpbmRlbnRhdGlvbk1hcmdpbjogbnVtYmVyKSB7XG5cdFx0Y29uc3QgbGluZVNpemUgPSAyXG5cdFx0Y29uc3QgYm9yZGVyID0gYCR7bGluZVNpemV9cHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gXG5cdFx0Y29uc3QgdmVydGljYWxPZmZzZXRJbnNpZGVSb3cgPSBzaXplLmJ1dHRvbl9oZWlnaHQgLyAyICsgMVxuXHRcdGNvbnN0IHZlcnRpY2FsT2Zmc2V0Rm9yUGFyZW50ID0gKHNpemUuYnV0dG9uX2hlaWdodCAtIHNpemUuaWNvbl9zaXplX2xhcmdlKSAvIDJcblx0XHRjb25zdCBsZW5ndGhPZkhvcml6b250YWxMaW5lID0gc2l6ZS5ocGFkIC0gMlxuXHRcdGNvbnN0IGxlZnRPZmZzZXQgPSBpbmRlbnRhdGlvbk1hcmdpblxuXG5cdFx0cmV0dXJuIGluZGVudGF0aW9uTGV2ZWwgIT09IDBcblx0XHRcdD8gW1xuXHRcdFx0XHRcdGlzTGFzdFNpYmxpbmcgfHwgb25TZWxlY3RlZFBhdGhcblx0XHRcdFx0XHRcdD8gLy8gZHJhdyBib3RoIHZlcnRpY2FsIGFuZCBob3Jpem9udGFsIGxpbmVzXG5cdFx0XHRcdFx0XHQgIG0oXCIuYWJzXCIsIHtcblx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg6IHB4KGxlbmd0aE9mSG9yaXpvbnRhbExpbmUpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Ym9yZGVyQm90dG9tTGVmdFJhZGl1czogXCIzcHhcIixcblx0XHRcdFx0XHRcdFx0XHRcdC8vIHRoZXJlJ3Mgc29tZSBzdWJ0bGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGJvcmRlciB3ZSB1c2UgaGVyZSBhbmQgdGhlIHRvcCBmb3IgdGhlIG90aGVyIGVsZW1lbnQgYW5kIHRoaXMgKzEgaXMgdG9cblx0XHRcdFx0XHRcdFx0XHRcdC8vIGFjY29tbW9kYXRlIGl0XG5cdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IHB4KDEgKyB2ZXJ0aWNhbE9mZnNldEluc2lkZVJvdyArIHZlcnRpY2FsT2Zmc2V0Rm9yUGFyZW50ICsgbnVtYmVyT2ZQcmV2aW91c1Jvd3MgKiBzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0dG9wOiBweCgtdmVydGljYWxPZmZzZXRGb3JQYXJlbnQgLSBudW1iZXJPZlByZXZpb3VzUm93cyAqIHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRcdFx0XHRcdFx0XHRsZWZ0OiBweChsZWZ0T2Zmc2V0KSxcblx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlckxlZnQ6IGJvcmRlcixcblx0XHRcdFx0XHRcdFx0XHRcdGJvcmRlckJvdHRvbTogYm9yZGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gd2UgbmVlZCB0byBkcmF3IHNlbGVjdGVkIGxpbmVzIG92ZXIgZXZlcnl0aGluZyBlbHNlLCBldmVuIHRoaW5ncyB0aGF0IGFyZSBkcmF3biBsYXRlclxuXHRcdFx0XHRcdFx0XHRcdFx0ekluZGV4OiBvblNlbGVjdGVkUGF0aCA/IDIgOiAxLFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHQ6IC8vIGRyYXcgb25seSB0aGUgaG9yaXpvbnRhbCBsaW5lXG5cdFx0XHRcdFx0XHQgIG0oXCIuYWJzXCIsIHtcblx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBweChsaW5lU2l6ZSksXG5cdFx0XHRcdFx0XHRcdFx0XHR0b3A6IHB4KHZlcnRpY2FsT2Zmc2V0SW5zaWRlUm93KSxcblx0XHRcdFx0XHRcdFx0XHRcdGxlZnQ6IHB4KGxlZnRPZmZzZXQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg6IHB4KGxlbmd0aE9mSG9yaXpvbnRhbExpbmUpLFxuXHRcdFx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiB0aGVtZS5jb250ZW50X2JvcmRlcixcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ICB9KSxcblx0XHRcdCAgXVxuXHRcdFx0OiBudWxsXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkLCBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IE1haWxib3hEZXRhaWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L01haWxib3hNb2RlbC5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IFNpZGViYXJTZWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvU2lkZWJhclNlY3Rpb24uanNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiwgSWNvbkJ1dHRvbkF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IEZvbGRlclN1YnRyZWUsIEZvbGRlclN5c3RlbSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9tYWlsL0ZvbGRlclN5c3RlbS5qc1wiXG5pbXBvcnQgeyBlbGVtZW50SWRQYXJ0LCBnZXRFbGVtZW50SWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXRpbHMuanNcIlxuaW1wb3J0IHsgaXNTZWxlY3RlZFByZWZpeCwgTmF2QnV0dG9uQXR0cnMsIE5hdkJ1dHRvbkNvbG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9OYXZCdXR0b24uanNcIlxuaW1wb3J0IHsgTUFJTF9QUkVGSVggfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvUm91dGVDaGFuZ2UuanNcIlxuaW1wb3J0IHsgTWFpbEZvbGRlclJvdyB9IGZyb20gXCIuL01haWxGb2xkZXJSb3cuanNcIlxuaW1wb3J0IHsgbGFzdCwgbm9PcCwgVGh1bmsgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IE1haWxGb2xkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBhdHRhY2hEcm9wZG93biwgRHJvcGRvd25CdXR0b25BdHRycyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IEJ1dHRvbkNvbG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHsgQnV0dG9uU2l6ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uU2l6ZS5qc1wiXG5pbXBvcnQgeyBNYWlsU2V0S2luZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgUm93QnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9idXR0b25zL1Jvd0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBNYWlsTW9kZWwgfSBmcm9tIFwiLi4vbW9kZWwvTWFpbE1vZGVsLmpzXCJcbmltcG9ydCB7IGdldEZvbGRlck5hbWUsIE1BWF9GT0xERVJfSU5ERU5UX0xFVkVMIH0gZnJvbSBcIi4uL21vZGVsL01haWxVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRGb2xkZXJJY29uIH0gZnJvbSBcIi4vTWFpbEd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IGlzU3BhbU9yVHJhc2hGb2xkZXIgfSBmcm9tIFwiLi4vbW9kZWwvTWFpbENoZWNrcy5qc1wiXG5pbXBvcnQgeyBEcm9wRGF0YSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvR3VpVXRpbHNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgTWFpbEZvbGRlclZpZXdBdHRycyB7XG5cdG1haWxNb2RlbDogTWFpbE1vZGVsXG5cdG1haWxib3hEZXRhaWw6IE1haWxib3hEZXRhaWxcblx0bWFpbEZvbGRlckVsZW1lbnRJZFRvU2VsZWN0ZWRNYWlsSWQ6IFJlYWRvbmx5TWFwPElkLCBJZD5cblx0b25Gb2xkZXJDbGljazogKGZvbGRlcjogTWFpbEZvbGRlcikgPT4gdW5rbm93blxuXHRvbkZvbGRlckRyb3A6IChkcm9wRGF0YTogRHJvcERhdGEsIGZvbGRlcjogTWFpbEZvbGRlcikgPT4gdW5rbm93blxuXHRleHBhbmRlZEZvbGRlcnM6IFJlYWRvbmx5U2V0PElkPlxuXHRvbkZvbGRlckV4cGFuZGVkOiAoZm9sZGVyOiBNYWlsRm9sZGVyLCBzdGF0ZTogYm9vbGVhbikgPT4gdW5rbm93blxuXHRvblNob3dGb2xkZXJBZGRFZGl0RGlhbG9nOiAobWFpbEdyb3VwSWQ6IElkLCBmb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsLCBwYXJlbnRGb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsKSA9PiB1bmtub3duXG5cdG9uRGVsZXRlQ3VzdG9tTWFpbEZvbGRlcjogKGZvbGRlcjogTWFpbEZvbGRlcikgPT4gdW5rbm93blxuXHRpbkVkaXRNb2RlOiBib29sZWFuXG5cdG9uRWRpdE1haWxib3g6ICgpID0+IHVua25vd25cbn1cblxudHlwZSBDb3VudGVycyA9IFJlY29yZDxzdHJpbmcsIG51bWJlcj5cblxuLyoqIERpc3BsYXlzIGEgdHJlZSBvZiBhbGwgZm9sZGVycy4gKi9cbmV4cG9ydCBjbGFzcyBNYWlsRm9sZGVyc1ZpZXcgaW1wbGVtZW50cyBDb21wb25lbnQ8TWFpbEZvbGRlclZpZXdBdHRycz4ge1xuXHQvLyBDb250YWlucyB0aGUgaWQgb2YgdGhlIHZpc2libGUgcm93XG5cdHByaXZhdGUgdmlzaWJsZVJvdzogc3RyaW5nIHwgbnVsbCA9IG51bGxcblxuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8TWFpbEZvbGRlclZpZXdBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBtYWlsYm94RGV0YWlsLCBtYWlsTW9kZWwgfSA9IGF0dHJzXG5cdFx0Y29uc3QgZ3JvdXBDb3VudGVycyA9IG1haWxNb2RlbC5tYWlsYm94Q291bnRlcnMoKVttYWlsYm94RGV0YWlsLm1haWxHcm91cC5faWRdIHx8IHt9XG5cdFx0Y29uc3QgZm9sZGVycyA9IG1haWxNb2RlbC5nZXRGb2xkZXJTeXN0ZW1CeUdyb3VwSWQobWFpbGJveERldGFpbC5tYWlsR3JvdXAuX2lkKVxuXHRcdC8vIEltcG9ydGFudDogdGhpcyBhcnJheSBpcyBrZXllZCBzbyBlYWNoIGl0ZW0gbXVzdCBoYXZlIGEga2V5IGFuZCBgbnVsbGAgY2Fubm90IGJlIGluIHRoZSBhcnJheVxuXHRcdC8vIFNvIGluc3RlYWQgd2UgcHVzaCBvciBub3QgcHVzaCBpbnRvIGFycmF5XG5cdFx0Y29uc3QgY3VzdG9tU3lzdGVtcyA9IGZvbGRlcnM/LmN1c3RvbVN1YnRyZWVzID8/IFtdXG5cdFx0Y29uc3Qgc3lzdGVtU3lzdGVtcyA9IGZvbGRlcnM/LnN5c3RlbVN1YnRyZWVzLmZpbHRlcigoZikgPT4gZi5mb2xkZXIuZm9sZGVyVHlwZSAhPT0gTWFpbFNldEtpbmQuSW1wb3J0ZWQpID8/IFtdXG5cdFx0Y29uc3QgY2hpbGRyZW46IENoaWxkcmVuID0gW11cblx0XHRjb25zdCBzZWxlY3RlZEZvbGRlciA9IGZvbGRlcnNcblx0XHRcdD8uZ2V0SW5kZW50ZWRMaXN0KClcblx0XHRcdC5tYXAoKGYpID0+IGYuZm9sZGVyKVxuXHRcdFx0LmZpbmQoKGYpID0+IGlzU2VsZWN0ZWRQcmVmaXgoTUFJTF9QUkVGSVggKyBcIi9cIiArIGdldEVsZW1lbnRJZChmKSkpXG5cdFx0Y29uc3QgcGF0aCA9IGZvbGRlcnMgJiYgc2VsZWN0ZWRGb2xkZXIgPyBmb2xkZXJzLmdldFBhdGhUb0ZvbGRlcihzZWxlY3RlZEZvbGRlci5faWQpIDogW11cblx0XHRjb25zdCBpc0ludGVybmFsVXNlciA9IGxvY2F0b3IubG9naW5zLmlzSW50ZXJuYWxVc2VyTG9nZ2VkSW4oKVxuXHRcdGNvbnN0IHN5c3RlbUNoaWxkcmVuID0gZm9sZGVycyAmJiB0aGlzLnJlbmRlckZvbGRlclRyZWUoc3lzdGVtU3lzdGVtcywgZ3JvdXBDb3VudGVycywgZm9sZGVycywgYXR0cnMsIHBhdGgsIGlzSW50ZXJuYWxVc2VyKVxuXHRcdGlmIChzeXN0ZW1DaGlsZHJlbikge1xuXHRcdFx0Y2hpbGRyZW4ucHVzaCguLi5zeXN0ZW1DaGlsZHJlbi5jaGlsZHJlbilcblx0XHR9XG5cdFx0aWYgKGlzSW50ZXJuYWxVc2VyKSB7XG5cdFx0XHRjb25zdCBjdXN0b21DaGlsZHJlbiA9IGZvbGRlcnMgPyB0aGlzLnJlbmRlckZvbGRlclRyZWUoY3VzdG9tU3lzdGVtcywgZ3JvdXBDb3VudGVycywgZm9sZGVycywgYXR0cnMsIHBhdGgsIGlzSW50ZXJuYWxVc2VyKS5jaGlsZHJlbiA6IFtdXG5cdFx0XHRjaGlsZHJlbi5wdXNoKFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFNpZGViYXJTZWN0aW9uLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG5hbWU6IFwieW91ckZvbGRlcnNfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRidXR0b246IGF0dHJzLmluRWRpdE1vZGUgPyB0aGlzLnJlbmRlckNyZWF0ZUZvbGRlckFkZEJ1dHRvbihudWxsLCBhdHRycykgOiB0aGlzLnJlbmRlckVkaXRGb2xkZXJzQnV0dG9uKGF0dHJzKSxcblx0XHRcdFx0XHRcdGtleTogXCJ5b3VyRm9sZGVyc1wiLCAvLyB3ZSBuZWVkIHRvIHNldCBhIGtleSBiZWNhdXNlIGZvbGRlciByb3dzIGFsc28gaGF2ZSBhIGtleS5cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGN1c3RvbUNoaWxkcmVuLFxuXHRcdFx0XHQpLFxuXHRcdFx0KVxuXHRcdFx0Y2hpbGRyZW4ucHVzaCh0aGlzLnJlbmRlckFkZEZvbGRlckJ1dHRvblJvdyhhdHRycykpXG5cdFx0fVxuXHRcdHJldHVybiBjaGlsZHJlblxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJGb2xkZXJUcmVlKFxuXHRcdHN1YlN5c3RlbXM6IHJlYWRvbmx5IEZvbGRlclN1YnRyZWVbXSxcblx0XHRncm91cENvdW50ZXJzOiBDb3VudGVycyxcblx0XHRmb2xkZXJzOiBGb2xkZXJTeXN0ZW0sXG5cdFx0YXR0cnM6IE1haWxGb2xkZXJWaWV3QXR0cnMsXG5cdFx0cGF0aDogTWFpbEZvbGRlcltdLFxuXHRcdGlzSW50ZXJuYWxVc2VyOiBib29sZWFuLFxuXHRcdGluZGVudGF0aW9uTGV2ZWw6IG51bWJlciA9IDAsXG5cdCk6IHsgY2hpbGRyZW46IENoaWxkcmVuW107IG51bVJvd3M6IG51bWJlciB9IHtcblx0XHQvLyB3ZSBuZWVkIHRvIGtlZXAgdHJhY2sgb2YgaG93IG1hbnkgcm93cyB3ZSd2ZSBkcmF3biBzbyBmYXIgZm9yIHRoaXMgc3VidHJlZSBzbyB0aGF0IHdlIGNhbiBkcmF3IGhpZXJhcmNoeSBsaW5lcyBjb3JyZWN0bHlcblx0XHRjb25zdCByZXN1bHQ6IHsgY2hpbGRyZW46IENoaWxkcmVuW107IG51bVJvd3M6IG51bWJlciB9ID0geyBjaGlsZHJlbjogW10sIG51bVJvd3M6IDAgfVxuXHRcdGZvciAobGV0IHN5c3RlbSBvZiBzdWJTeXN0ZW1zKSB7XG5cdFx0XHRjb25zdCBpZCA9IGdldEVsZW1lbnRJZChzeXN0ZW0uZm9sZGVyKVxuXHRcdFx0Y29uc3QgZm9sZGVyTmFtZSA9IGdldEZvbGRlck5hbWUoc3lzdGVtLmZvbGRlcilcblx0XHRcdGNvbnN0IGJ1dHRvbjogTmF2QnV0dG9uQXR0cnMgPSB7XG5cdFx0XHRcdGxhYmVsOiBsYW5nLm1ha2VUcmFuc2xhdGlvbihgZm9sZGVyOiR7Zm9sZGVyTmFtZX1gLCBmb2xkZXJOYW1lKSxcblx0XHRcdFx0aHJlZjogKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChhdHRycy5pbkVkaXRNb2RlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbS5yb3V0ZS5nZXQoKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBmb2xkZXJFbGVtZW50SWQgPSBnZXRFbGVtZW50SWQoc3lzdGVtLmZvbGRlcilcblx0XHRcdFx0XHRcdGNvbnN0IG1haWxJZCA9IGF0dHJzLm1haWxGb2xkZXJFbGVtZW50SWRUb1NlbGVjdGVkTWFpbElkLmdldChmb2xkZXJFbGVtZW50SWQpXG5cdFx0XHRcdFx0XHRpZiAobWFpbElkKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBgJHtNQUlMX1BSRUZJWH0vJHtmb2xkZXJFbGVtZW50SWR9LyR7bWFpbElkfWBcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBgJHtNQUlMX1BSRUZJWH0vJHtmb2xkZXJFbGVtZW50SWR9YFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0aXNTZWxlY3RlZFByZWZpeDogYXR0cnMuaW5FZGl0TW9kZSA/IGZhbHNlIDogTUFJTF9QUkVGSVggKyBcIi9cIiArIGdldEVsZW1lbnRJZChzeXN0ZW0uZm9sZGVyKSxcblx0XHRcdFx0Y29sb3JzOiBOYXZCdXR0b25Db2xvci5OYXYsXG5cdFx0XHRcdGNsaWNrOiAoKSA9PiBhdHRycy5vbkZvbGRlckNsaWNrKHN5c3RlbS5mb2xkZXIpLFxuXHRcdFx0XHRkcm9wSGFuZGxlcjogKGRyb3BEYXRhKSA9PiBhdHRycy5vbkZvbGRlckRyb3AoZHJvcERhdGEsIHN5c3RlbS5mb2xkZXIpLFxuXHRcdFx0XHRkaXNhYmxlSG92ZXJCYWNrZ3JvdW5kOiB0cnVlLFxuXHRcdFx0XHRkaXNhYmxlZDogYXR0cnMuaW5FZGl0TW9kZSxcblx0XHRcdH1cblx0XHRcdGNvbnN0IGN1cnJlbnRFeHBhbnNpb25TdGF0ZSA9IGF0dHJzLmluRWRpdE1vZGUgPyB0cnVlIDogYXR0cnMuZXhwYW5kZWRGb2xkZXJzLmhhcyhnZXRFbGVtZW50SWQoc3lzdGVtLmZvbGRlcikpID8/IGZhbHNlIC8vZGVmYXVsdCBpcyBmYWxzZVxuXHRcdFx0Y29uc3QgaGFzQ2hpbGRyZW4gPSBzeXN0ZW0uY2hpbGRyZW4ubGVuZ3RoID4gMFxuXHRcdFx0Y29uc3QgY291bnRlcklkID0gZ2V0RWxlbWVudElkKHN5c3RlbS5mb2xkZXIpXG5cdFx0XHRjb25zdCBzdW1tZWRDb3VudCA9ICFjdXJyZW50RXhwYW5zaW9uU3RhdGUgJiYgaGFzQ2hpbGRyZW4gPyB0aGlzLmdldFRvdGFsRm9sZGVyQ291bnRlcihncm91cENvdW50ZXJzLCBzeXN0ZW0pIDogZ3JvdXBDb3VudGVyc1tjb3VudGVySWRdXG5cdFx0XHRjb25zdCBjaGlsZFJlc3VsdCA9XG5cdFx0XHRcdGhhc0NoaWxkcmVuICYmIGN1cnJlbnRFeHBhbnNpb25TdGF0ZVxuXHRcdFx0XHRcdD8gdGhpcy5yZW5kZXJGb2xkZXJUcmVlKHN5c3RlbS5jaGlsZHJlbiwgZ3JvdXBDb3VudGVycywgZm9sZGVycywgYXR0cnMsIHBhdGgsIGlzSW50ZXJuYWxVc2VyLCBpbmRlbnRhdGlvbkxldmVsICsgMSlcblx0XHRcdFx0XHQ6IHsgY2hpbGRyZW46IG51bGwsIG51bVJvd3M6IDAgfVxuXHRcdFx0Y29uc3QgaXNUcmFzaE9yU3BhbSA9IHN5c3RlbS5mb2xkZXIuZm9sZGVyVHlwZSA9PT0gTWFpbFNldEtpbmQuVFJBU0ggfHwgc3lzdGVtLmZvbGRlci5mb2xkZXJUeXBlID09PSBNYWlsU2V0S2luZC5TUEFNXG5cdFx0XHRjb25zdCBpc1JpZ2h0QnV0dG9uVmlzaWJsZSA9IHRoaXMudmlzaWJsZVJvdyA9PT0gaWRcblx0XHRcdGNvbnN0IHJpZ2h0QnV0dG9uID1cblx0XHRcdFx0aXNJbnRlcm5hbFVzZXIgJiYgIWlzVHJhc2hPclNwYW0gJiYgKGlzUmlnaHRCdXR0b25WaXNpYmxlIHx8IGF0dHJzLmluRWRpdE1vZGUpXG5cdFx0XHRcdFx0PyB0aGlzLmNyZWF0ZUZvbGRlck1vcmVCdXR0b24oc3lzdGVtLmZvbGRlciwgZm9sZGVycywgYXR0cnMsICgpID0+IHtcblx0XHRcdFx0XHRcdFx0dGhpcy52aXNpYmxlUm93ID0gbnVsbFxuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IG51bGxcblx0XHRcdGNvbnN0IHJlbmRlciA9IG0uZnJhZ21lbnQoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRrZXk6IGlkLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0bShNYWlsRm9sZGVyUm93LCB7XG5cdFx0XHRcdFx0XHRjb3VudDogYXR0cnMuaW5FZGl0TW9kZSA/IDAgOiBzdW1tZWRDb3VudCxcblx0XHRcdFx0XHRcdGJ1dHRvbixcblx0XHRcdFx0XHRcdGZvbGRlcjogc3lzdGVtLmZvbGRlcixcblx0XHRcdFx0XHRcdHJpZ2h0QnV0dG9uLFxuXHRcdFx0XHRcdFx0ZXhwYW5kZWQ6IGhhc0NoaWxkcmVuID8gY3VycmVudEV4cGFuc2lvblN0YXRlIDogbnVsbCxcblx0XHRcdFx0XHRcdGluZGVudGF0aW9uTGV2ZWw6IE1hdGgubWluKGluZGVudGF0aW9uTGV2ZWwsIE1BWF9GT0xERVJfSU5ERU5UX0xFVkVMKSxcblx0XHRcdFx0XHRcdG9uRXhwYW5kZXJDbGljazogaGFzQ2hpbGRyZW4gPyAoKSA9PiBhdHRycy5vbkZvbGRlckV4cGFuZGVkKHN5c3RlbS5mb2xkZXIsIGN1cnJlbnRFeHBhbnNpb25TdGF0ZSkgOiBub09wLFxuXHRcdFx0XHRcdFx0aGFzQ2hpbGRyZW4sXG5cdFx0XHRcdFx0XHRvblNlbGVjdGVkUGF0aDogcGF0aC5pbmNsdWRlcyhzeXN0ZW0uZm9sZGVyKSxcblx0XHRcdFx0XHRcdG51bWJlck9mUHJldmlvdXNSb3dzOiByZXN1bHQubnVtUm93cyxcblx0XHRcdFx0XHRcdGlzTGFzdFNpYmxpbmc6IGxhc3Qoc3ViU3lzdGVtcykgPT09IHN5c3RlbSxcblx0XHRcdFx0XHRcdGVkaXRNb2RlOiBhdHRycy5pbkVkaXRNb2RlLFxuXHRcdFx0XHRcdFx0b25Ib3ZlcjogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnZpc2libGVSb3cgPSBpZFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRjaGlsZFJlc3VsdC5jaGlsZHJlbixcblx0XHRcdFx0XSxcblx0XHRcdClcblx0XHRcdHJlc3VsdC5udW1Sb3dzICs9IGNoaWxkUmVzdWx0Lm51bVJvd3MgKyAxXG5cdFx0XHRyZXN1bHQuY2hpbGRyZW4ucHVzaChyZW5kZXIpXG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQWRkRm9sZGVyQnV0dG9uUm93KGF0dHJzOiBNYWlsRm9sZGVyVmlld0F0dHJzKTogQ2hpbGQge1xuXHRcdC8vIFRoaXMgYnV0dG9uIG5lZWRzIHRvIGZpbGwgdGhlIHdob2xlIHJvdywgYnV0IGlzIG5vdCBhIG5hdmlnYXRpb24gYnV0dG9uIChzbyBJY29uQnV0dG9uIG9yIE5hdkJ1dHRvbiB3ZXJlbid0IGFwcHJvcHJpYXRlKVxuXHRcdHJldHVybiBtKFJvd0J1dHRvbiwge1xuXHRcdFx0bGFiZWw6IFwiYWRkRm9sZGVyX2FjdGlvblwiLFxuXHRcdFx0a2V5OiBcImFkZEZvbGRlclwiLFxuXHRcdFx0aWNvbjogSWNvbnMuQWRkLFxuXHRcdFx0Y2xhc3M6IFwiZm9sZGVyLXJvdyBtbHItYnV0dG9uIGJvcmRlci1yYWRpdXMtc21hbGxcIixcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdHdpZHRoOiBgY2FsYygxMDAlIC0gJHtweChzaXplLmhwYWRfYnV0dG9uICogMil9KWAsXG5cdFx0XHR9LFxuXHRcdFx0b25jbGljazogKCkgPT4ge1xuXHRcdFx0XHRhdHRycy5vblNob3dGb2xkZXJBZGRFZGl0RGlhbG9nKGF0dHJzLm1haWxib3hEZXRhaWwubWFpbEdyb3VwLl9pZCwgbnVsbCwgbnVsbClcblx0XHRcdH0sXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgZ2V0VG90YWxGb2xkZXJDb3VudGVyKGNvdW50ZXJzOiBDb3VudGVycywgc3lzdGVtOiBGb2xkZXJTdWJ0cmVlKTogbnVtYmVyIHtcblx0XHRjb25zdCBjb3VudGVySWQgPSBnZXRFbGVtZW50SWQoc3lzdGVtLmZvbGRlcilcblx0XHRyZXR1cm4gKGNvdW50ZXJzW2NvdW50ZXJJZF0gPz8gMCkgKyBzeXN0ZW0uY2hpbGRyZW4ucmVkdWNlKChhY2MsIGNoaWxkKSA9PiBhY2MgKyB0aGlzLmdldFRvdGFsRm9sZGVyQ291bnRlcihjb3VudGVycywgY2hpbGQpLCAwKVxuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVGb2xkZXJNb3JlQnV0dG9uKGZvbGRlcjogTWFpbEZvbGRlciwgZm9sZGVyczogRm9sZGVyU3lzdGVtLCBhdHRyczogTWFpbEZvbGRlclZpZXdBdHRycywgb25DbG9zZTogVGh1bmspOiBJY29uQnV0dG9uQXR0cnMge1xuXHRcdHJldHVybiBhdHRhY2hEcm9wZG93bih7XG5cdFx0XHRtYWluQnV0dG9uQXR0cnM6IHtcblx0XHRcdFx0dGl0bGU6IFwibW9yZV9sYWJlbFwiLFxuXHRcdFx0XHRpY29uOiBJY29ucy5Nb3JlLFxuXHRcdFx0XHRjb2xvcnM6IEJ1dHRvbkNvbG9yLk5hdixcblx0XHRcdFx0c2l6ZTogQnV0dG9uU2l6ZS5Db21wYWN0LFxuXHRcdFx0fSxcblx0XHRcdGNoaWxkQXR0cnM6ICgpID0+IHtcblx0XHRcdFx0cmV0dXJuIGZvbGRlci5mb2xkZXJUeXBlID09PSBNYWlsU2V0S2luZC5DVVNUT01cblx0XHRcdFx0XHQ/IC8vIGNhbm5vdCBhZGQgbmV3IGZvbGRlciB0byBjdXN0b20gZm9sZGVyIGluIHNwYW0gb3IgdHJhc2ggZm9sZGVyXG5cdFx0XHRcdFx0ICBpc1NwYW1PclRyYXNoRm9sZGVyKGZvbGRlcnMsIGZvbGRlcilcblx0XHRcdFx0XHRcdD8gW3RoaXMuZWRpdEJ1dHRvbkF0dHJzKGF0dHJzLCBmb2xkZXJzLCBmb2xkZXIpLCB0aGlzLmRlbGV0ZUJ1dHRvbkF0dHJzKGF0dHJzLCBmb2xkZXIpXVxuXHRcdFx0XHRcdFx0OiBbdGhpcy5lZGl0QnV0dG9uQXR0cnMoYXR0cnMsIGZvbGRlcnMsIGZvbGRlciksIHRoaXMuYWRkQnV0dG9uQXR0cnMoYXR0cnMsIGZvbGRlciksIHRoaXMuZGVsZXRlQnV0dG9uQXR0cnMoYXR0cnMsIGZvbGRlcildXG5cdFx0XHRcdFx0OiBbdGhpcy5hZGRCdXR0b25BdHRycyhhdHRycywgZm9sZGVyKV1cblx0XHRcdH0sXG5cdFx0XHRvbkNsb3NlLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGRlbGV0ZUJ1dHRvbkF0dHJzKGF0dHJzOiBNYWlsRm9sZGVyVmlld0F0dHJzLCBmb2xkZXI6IE1haWxGb2xkZXIpOiBEcm9wZG93bkJ1dHRvbkF0dHJzIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGFiZWw6IFwiZGVsZXRlX2FjdGlvblwiLFxuXHRcdFx0aWNvbjogSWNvbnMuVHJhc2gsXG5cdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRhdHRycy5vbkRlbGV0ZUN1c3RvbU1haWxGb2xkZXIoZm9sZGVyKVxuXHRcdFx0fSxcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFkZEJ1dHRvbkF0dHJzKGF0dHJzOiBNYWlsRm9sZGVyVmlld0F0dHJzLCBmb2xkZXI6IE1haWxGb2xkZXIpOiBEcm9wZG93bkJ1dHRvbkF0dHJzIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGFiZWw6IFwiYWRkRm9sZGVyX2FjdGlvblwiLFxuXHRcdFx0aWNvbjogSWNvbnMuQWRkLFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0YXR0cnMub25TaG93Rm9sZGVyQWRkRWRpdERpYWxvZyhhdHRycy5tYWlsYm94RGV0YWlsLm1haWxHcm91cC5faWQsIG51bGwsIGZvbGRlcilcblx0XHRcdH0sXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBlZGl0QnV0dG9uQXR0cnMoYXR0cnM6IE1haWxGb2xkZXJWaWV3QXR0cnMsIGZvbGRlcnM6IEZvbGRlclN5c3RlbSwgZm9sZGVyOiBNYWlsRm9sZGVyKTogRHJvcGRvd25CdXR0b25BdHRycyB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxhYmVsOiBcImVkaXRfYWN0aW9uXCIsXG5cdFx0XHRpY29uOiBJY29ucy5FZGl0LFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0YXR0cnMub25TaG93Rm9sZGVyQWRkRWRpdERpYWxvZyhcblx0XHRcdFx0XHRhdHRycy5tYWlsYm94RGV0YWlsLm1haWxHcm91cC5faWQsXG5cdFx0XHRcdFx0Zm9sZGVyLFxuXHRcdFx0XHRcdGZvbGRlci5wYXJlbnRGb2xkZXIgPyBmb2xkZXJzLmdldEZvbGRlckJ5SWQoZWxlbWVudElkUGFydChmb2xkZXIucGFyZW50Rm9sZGVyKSkgOiBudWxsLFxuXHRcdFx0XHQpXG5cdFx0XHR9LFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ3JlYXRlRm9sZGVyQWRkQnV0dG9uKHBhcmVudEZvbGRlcjogTWFpbEZvbGRlciB8IG51bGwsIGF0dHJzOiBNYWlsRm9sZGVyVmlld0F0dHJzKTogQ2hpbGQge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcImFkZEZvbGRlcl9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBhdHRycy5vblNob3dGb2xkZXJBZGRFZGl0RGlhbG9nKGF0dHJzLm1haWxib3hEZXRhaWwubWFpbEdyb3VwLl9pZCwgbnVsbCwgcGFyZW50Rm9sZGVyKVxuXHRcdFx0fSxcblx0XHRcdGljb246IEljb25zLkFkZCxcblx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJFZGl0Rm9sZGVyc0J1dHRvbihhdHRyczogTWFpbEZvbGRlclZpZXdBdHRycyk6IENoaWxkIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJlZGl0X2FjdGlvblwiLFxuXHRcdFx0Y2xpY2s6ICgpID0+IGF0dHJzLm9uRWRpdE1haWxib3goKSxcblx0XHRcdGljb246IEljb25zLkVkaXQsXG5cdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0fSlcblx0fVxufVxuIiwiaW1wb3J0IHsgbW9kYWwsIE1vZGFsQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Nb2RhbC5qc1wiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsLCBub09wLCBUaHVuayB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgZm9jdXNOZXh0LCBmb2N1c1ByZXZpb3VzLCBrZXlNYW5hZ2VyLCBTaG9ydGN1dCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9LZXlNYW5hZ2VyLmpzXCJcbmltcG9ydCB7IEtleXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IG0sIHsgQ2hpbGRyZW4gfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBhbHBoYSwgQWxwaGFFbnVtLCBBbmltYXRpb25Qcm9taXNlLCBhbmltYXRpb25zLCBEZWZhdWx0QW5pbWF0aW9uVGltZSwgb3BhY2l0eSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2FuaW1hdGlvbi9BbmltYXRpb25zLmpzXCJcbmltcG9ydCB7IGdldEVsZXZhdGVkQmFja2dyb3VuZCwgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZS5qc1wiXG5pbXBvcnQgeyBJTlBVVCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcbmltcG9ydCB7IGVhc2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9hbmltYXRpb24vRWFzaW5nLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBzdHlsZXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zdHlsZXMuanNcIlxuaW1wb3J0IHsgTG9naW5CdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2J1dHRvbnMvTG9naW5CdXR0b24uanNcIlxuXG5leHBvcnQgY2xhc3MgRWRpdEZvbGRlcnNEaWFsb2cgaW1wbGVtZW50cyBNb2RhbENvbXBvbmVudCB7XG5cdHByaXZhdGUgdmlzaWJsZTogYm9vbGVhblxuXHRwcml2YXRlIHJlYWRvbmx5IF9zaG9ydGN1dHM6IFNob3J0Y3V0W11cblx0cHJpdmF0ZSBfZG9tRGlhbG9nOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsXG5cdC8qKiBUaGUgZWxlbWVudCB0aGF0IHdhcyBmb2N1c2VkIGJlZm9yZSB3ZSd2ZSBzaG93biB0aGUgY29tcG9uZW50IHNvIHRoYXQgd2UgY2FuIHJldHVybiBpdCBiYWNrIHVwb24gY2xvc2luZy4gKi9cblx0cHJpdmF0ZSBmb2N1c2VkQmVmb3JlU2hvd246IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblxuXHRwcml2YXRlIF9jbG9zZUhhbmRsZXI6IFRodW5rIHwgbnVsbCA9IG51bGxcblxuXHRwcml2YXRlIHVzZWRCb3R0b21OYXZCZWZvcmU6IGJvb2xlYW4gPSBzdHlsZXMuaXNVc2luZ0JvdHRvbU5hdmlnYXRpb24oKVxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgZm9sZGVyTGlzdDogKCkgPT4gQ2hpbGRyZW4pIHtcblx0XHR0aGlzLnZpc2libGUgPSBmYWxzZVxuXG5cdFx0dGhpcy5fc2hvcnRjdXRzID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuUkVUVVJOLFxuXHRcdFx0XHRzaGlmdDogZmFsc2UsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHRoaXMuY2xvc2UoKSxcblx0XHRcdFx0aGVscDogXCJjbG9zZV9hbHRcIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5FU0MsXG5cdFx0XHRcdHNoaWZ0OiBmYWxzZSxcblx0XHRcdFx0ZXhlYzogKCkgPT4gdGhpcy5jbG9zZSgpLFxuXHRcdFx0XHRoZWxwOiBcImNsb3NlX2FsdFwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLlRBQixcblx0XHRcdFx0c2hpZnQ6IHRydWUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+ICh0aGlzLl9kb21EaWFsb2cgPyBmb2N1c1ByZXZpb3VzKHRoaXMuX2RvbURpYWxvZykgOiBmYWxzZSksXG5cdFx0XHRcdGhlbHA6IFwic2VsZWN0UHJldmlvdXNfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVEFCLFxuXHRcdFx0XHRzaGlmdDogZmFsc2UsXG5cdFx0XHRcdGV4ZWM6ICgpID0+ICh0aGlzLl9kb21EaWFsb2cgPyBmb2N1c05leHQodGhpcy5fZG9tRGlhbG9nKSA6IGZhbHNlKSxcblx0XHRcdFx0aGVscDogXCJzZWxlY3ROZXh0X2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRdXG5cblx0XHR0aGlzLnZpZXcgPSB0aGlzLnZpZXcuYmluZCh0aGlzKVxuXHR9XG5cblx0dmlldygpIHtcblx0XHRpZiAodGhpcy51c2VkQm90dG9tTmF2QmVmb3JlICE9PSBzdHlsZXMuaXNVc2luZ0JvdHRvbU5hdmlnYXRpb24oKSkge1xuXHRcdFx0dGhpcy5jbG9zZSgpXG5cdFx0fVxuXHRcdHRoaXMudXNlZEJvdHRvbU5hdkJlZm9yZSA9IHN0eWxlcy5pc1VzaW5nQm90dG9tTmF2aWdhdGlvbigpXG5cdFx0Y29uc3QgbWFyZ2luVG9wID0gdGhpcy51c2VkQm90dG9tTmF2QmVmb3JlID8gXCJlbnYoc2FmZS1hcmVhLWluc2V0LXRvcClcIiA6IHB4KHNpemUubmF2YmFyX2hlaWdodClcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguY29sXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0d2lkdGg6IHB4KHNpemUuZmlyc3RfY29sX21heF93aWR0aCAtIHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRcdFx0aGVpZ2h0OiBgY2FsYygxMDAlIC0gJHttYXJnaW5Ub3B9KWAsXG5cdFx0XHRcdFx0Ly8gZm9yIHRoZSBoZWFkZXJcblx0XHRcdFx0XHRtYXJnaW5Ub3AsXG5cdFx0XHRcdFx0bWFyZ2luTGVmdDogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHRcdFx0fSxcblx0XHRcdFx0b25jbGljazogKGU6IE1vdXNlRXZlbnQpID0+IGUuc3RvcFByb3BhZ2F0aW9uKCksXG5cdFx0XHRcdC8vIGRvIG5vdCBwcm9wYWdhdGUgY2xpY2tzIG9uIHRoZSBkaWFsb2cgYXMgdGhlIE1vZGFsIGV4cGVjdHMgYWxsIHByb3BhZ2F0ZWQgY2xpY2tzIHRvIGJlIGNsaWNrcyBvbiB0aGUgYmFja2dyb3VuZFxuXHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fZG9tRGlhbG9nID0gdm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50XG5cdFx0XHRcdFx0bGV0IGFuaW1hdGlvbjogQW5pbWF0aW9uUHJvbWlzZSB8IG51bGwgPSBudWxsXG5cblx0XHRcdFx0XHRjb25zdCBiZ2NvbG9yID0gdGhlbWUubmF2aWdhdGlvbl9iZ1xuXHRcdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuZnJvbSh0aGlzLl9kb21EaWFsb2cuY2hpbGRyZW4pIGFzIEFycmF5PEhUTUxFbGVtZW50PlxuXHRcdFx0XHRcdGZvciAobGV0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG5cdFx0XHRcdFx0XHRjaGlsZC5zdHlsZS5vcGFjaXR5ID0gXCIwXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fZG9tRGlhbG9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGByZ2JhKDAsIDAsIDAsIDApYFxuXHRcdFx0XHRcdGFuaW1hdGlvbiA9IFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHRcdGFuaW1hdGlvbnMuYWRkKHRoaXMuX2RvbURpYWxvZywgYWxwaGEoQWxwaGFFbnVtLkJhY2tncm91bmRDb2xvciwgYmdjb2xvciwgMCwgMSkpLFxuXHRcdFx0XHRcdFx0YW5pbWF0aW9ucy5hZGQoY2hpbGRyZW4sIG9wYWNpdHkoMCwgMSwgdHJ1ZSksIHtcblx0XHRcdFx0XHRcdFx0ZGVsYXk6IERlZmF1bHRBbmltYXRpb25UaW1lIC8gMixcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdF0pXG5cblx0XHRcdFx0XHQvLyBzZWxlY3QgZmlyc3QgaW5wdXQgZmllbGQuIGJsdXIgZmlyc3QgdG8gYXZvaWQgdGhhdCB1c2VycyBjYW4gZW50ZXIgdGV4dCBpbiB0aGUgcHJldmlvdXNseSBmb2N1c2VkIGVsZW1lbnQgd2hpbGUgdGhlIGFuaW1hdGlvbiBpcyBydW5uaW5nXG5cdFx0XHRcdFx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBhY3RpdmVFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IG51bGxcblx0XHRcdFx0XHRcdGlmIChhY3RpdmVFbGVtZW50ICYmIHR5cGVvZiBhY3RpdmVFbGVtZW50LmJsdXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdFx0XHRhY3RpdmVFbGVtZW50LmJsdXIoKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0YW5pbWF0aW9uLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5kZWZhdWx0Rm9jdXNPbkxvYWQoKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0W1xuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnBsci1idXR0b24ubXQubWJcIixcblx0XHRcdFx0XHRtKExvZ2luQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJkb25lX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0b25jbGljazogKCkgPT4gdGhpcy5jbG9zZSgpLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnNjcm9sbC5vdmVyZmxvdy14LWhpZGRlbi5mbGV4LmNvbC5mbGV4LWdyb3dcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRvbnNjcm9sbDogKGU6IEV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG5cdFx0XHRcdFx0XHRcdHRhcmdldC5zdHlsZS5ib3JkZXJUb3AgPSBgMXB4IHNvbGlkICR7dGhlbWUuY29udGVudF9ib3JkZXJ9YFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRoaXMuZm9sZGVyTGlzdCgpLFxuXHRcdFx0XHQpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGRlZmF1bHRGb2N1c09uTG9hZCgpIHtcblx0XHRjb25zdCBkb20gPSBhc3NlcnROb3ROdWxsKHRoaXMuX2RvbURpYWxvZylcblx0XHRsZXQgaW5wdXRzID0gQXJyYXkuZnJvbShkb20ucXVlcnlTZWxlY3RvckFsbChJTlBVVCkpIGFzIEFycmF5PEhUTUxFbGVtZW50PlxuXG5cdFx0aWYgKGlucHV0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRpbnB1dHNbMF0uZm9jdXMoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgYnV0dG9uID0gZG9tLnF1ZXJ5U2VsZWN0b3IoXCJidXR0b25cIilcblxuXHRcdFx0aWYgKGJ1dHRvbikge1xuXHRcdFx0XHRidXR0b24uZm9jdXMoKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGhpZGVBbmltYXRpb24oKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0bGV0IGJnY29sb3IgPSBnZXRFbGV2YXRlZEJhY2tncm91bmQoKVxuXG5cdFx0aWYgKHRoaXMuX2RvbURpYWxvZykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdFx0YW5pbWF0aW9ucy5hZGQodGhpcy5fZG9tRGlhbG9nLmNoaWxkcmVuLCBvcGFjaXR5KDEsIDAsIHRydWUpKSxcblx0XHRcdFx0YW5pbWF0aW9ucy5hZGQodGhpcy5fZG9tRGlhbG9nLCBhbHBoYShBbHBoYUVudW0uQmFja2dyb3VuZENvbG9yLCBiZ2NvbG9yLCAxLCAwKSwge1xuXHRcdFx0XHRcdGRlbGF5OiBEZWZhdWx0QW5pbWF0aW9uVGltZSAvIDIsXG5cdFx0XHRcdFx0ZWFzaW5nOiBlYXNlLmxpbmVhcixcblx0XHRcdFx0fSksXG5cdFx0XHRdKS50aGVuKG5vT3ApXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdH1cblx0fVxuXG5cdHNob3coKTogRWRpdEZvbGRlcnNEaWFsb2cge1xuXHRcdHRoaXMuZm9jdXNlZEJlZm9yZVNob3duID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudFxuXHRcdG1vZGFsLmRpc3BsYXkodGhpcylcblx0XHR0aGlzLnZpc2libGUgPSB0cnVlXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdGNsb3NlKCk6IHZvaWQge1xuXHRcdHRoaXMudmlzaWJsZSA9IGZhbHNlXG5cdFx0bW9kYWwucmVtb3ZlKHRoaXMpXG5cdH1cblxuXHQvKipcblx0ICogU2hvdWxkIGJlIGNhbGxlZCB0byBjbG9zZSBhIGRpYWxvZy4gTm90aWZpZXMgdGhlIGNsb3NlSGFuZGxlciBhYm91dCB0aGUgY2xvc2UgYXR0ZW1wdC5cblx0ICovXG5cdG9uQ2xvc2UoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuX2Nsb3NlSGFuZGxlcikge1xuXHRcdFx0dGhpcy5fY2xvc2VIYW5kbGVyKClcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jbG9zZSgpXG5cdFx0fVxuXHR9XG5cblx0c2hvcnRjdXRzKCk6IFNob3J0Y3V0W10ge1xuXHRcdHJldHVybiB0aGlzLl9zaG9ydGN1dHNcblx0fVxuXG5cdGJhY2tncm91bmRDbGljayhlOiBNb3VzZUV2ZW50KSB7fVxuXG5cdHBvcFN0YXRlKGU6IEV2ZW50KTogYm9vbGVhbiB7XG5cdFx0dGhpcy5vbkNsb3NlKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGNhbGxpbmdFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuZm9jdXNlZEJlZm9yZVNob3duXG5cdH1cblxuXHRhZGRTaG9ydGN1dChzaG9ydGN1dDogU2hvcnRjdXQpOiBFZGl0Rm9sZGVyc0RpYWxvZyB7XG5cdFx0dGhpcy5fc2hvcnRjdXRzLnB1c2goc2hvcnRjdXQpXG5cblx0XHRpZiAodGhpcy52aXNpYmxlKSB7XG5cdFx0XHRrZXlNYW5hZ2VyLnJlZ2lzdGVyTW9kYWxTaG9ydGN1dHMoW3Nob3J0Y3V0XSlcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0c3RhdGljIHNob3dFZGl0KGZvbGRlcnM6ICgpID0+IENoaWxkcmVuKSB7XG5cdFx0bmV3IEVkaXRGb2xkZXJzRGlhbG9nKGZvbGRlcnMpLnNob3coKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZ1wiXG5pbXBvcnQgeyBUZXh0RmllbGQsIFRleHRGaWVsZEF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9UZXh0RmllbGRcIlxuaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBNYWlsQm94LCBNYWlsRm9sZGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnNcIlxuaW1wb3J0IHsgaXNPZmZsaW5lRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRXJyb3JVdGlsc1wiXG5pbXBvcnQgeyBMb2NrZWRFcnJvciwgUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB7IE1haWxWaWV3TW9kZWwgfSBmcm9tIFwiLi9NYWlsVmlld01vZGVsXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgQ29sb3JQaWNrZXJWaWV3IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9jb2xvclBpY2tlci9Db2xvclBpY2tlclZpZXdcIlxuaW1wb3J0IHsgc2hvd05vdEF2YWlsYWJsZUZvckZyZWVEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvU3Vic2NyaXB0aW9uRGlhbG9nc1wiXG5cbmNvbnN0IExJTUlUX0VYQ0VFREVEX0VSUk9SID0gXCJsaW1pdFJlYWNoZWRcIlxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvd0VkaXRMYWJlbERpYWxvZyhtYWlsYm94OiBNYWlsQm94IHwgbnVsbCwgbWFpbFZpZXdNb2RlbDogTWFpbFZpZXdNb2RlbCwgbGFiZWw6IE1haWxGb2xkZXIgfCBudWxsKSB7XG5cdGxldCBuYW1lID0gbGFiZWwgPyBsYWJlbC5uYW1lIDogXCJcIlxuXHRsZXQgY29sb3IgPSBsYWJlbCAmJiBsYWJlbC5jb2xvciA/IGxhYmVsLmNvbG9yIDogXCJcIlxuXG5cdGFzeW5jIGZ1bmN0aW9uIG9uT2tDbGlja2VkKGRpYWxvZzogRGlhbG9nKSB7XG5cdFx0ZGlhbG9nLmNsb3NlKClcblx0XHR0cnkge1xuXHRcdFx0aWYgKGxhYmVsKSB7XG5cdFx0XHRcdC8vIGVkaXRpbmcgYSBsYWJlbFxuXHRcdFx0XHRhd2FpdCBtYWlsVmlld01vZGVsLmVkaXRMYWJlbChsYWJlbCwgeyBuYW1lLCBjb2xvciB9KVxuXHRcdFx0fSBlbHNlIGlmIChtYWlsYm94KSB7XG5cdFx0XHRcdC8vIGFkZGluZyBhIGxhYmVsXG5cdFx0XHRcdGF3YWl0IG1haWxWaWV3TW9kZWwuY3JlYXRlTGFiZWwobWFpbGJveCwgeyBuYW1lLCBjb2xvciB9KVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRpZiAoZXJyb3IgaW5zdGFuY2VvZiBQcmVjb25kaXRpb25GYWlsZWRFcnJvcikge1xuXHRcdFx0XHRpZiAoZXJyb3IuZGF0YSA9PT0gTElNSVRfRVhDRUVERURfRVJST1IpIHtcblx0XHRcdFx0XHRzaG93Tm90QXZhaWxhYmxlRm9yRnJlZURpYWxvZygpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0RGlhbG9nLm1lc3NhZ2UoXCJ1bmtub3duRXJyb3JfbXNnXCIpXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoaXNPZmZsaW5lRXJyb3IoZXJyb3IpIHx8ICEoZXJyb3IgaW5zdGFuY2VvZiBMb2NrZWRFcnJvcikpIHtcblx0XHRcdFx0dGhyb3cgZXJyb3Jcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHREaWFsb2cuc2hvd0FjdGlvbkRpYWxvZyh7XG5cdFx0dGl0bGU6IGxhYmVsID8gXCJlZGl0TGFiZWxfYWN0aW9uXCIgOiBcImFkZExhYmVsX2FjdGlvblwiLFxuXHRcdGFsbG93Q2FuY2VsOiB0cnVlLFxuXHRcdG9rQWN0aW9uOiAoZGlhbG9nOiBEaWFsb2cpID0+IHtcblx0XHRcdG9uT2tDbGlja2VkKGRpYWxvZylcblx0XHR9LFxuXHRcdGNoaWxkOiAoKSA9PlxuXHRcdFx0bShcIi5mbGV4LmNvbC5nYXAtdnBhZFwiLCBbXG5cdFx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwibmFtZV9sYWJlbFwiLFxuXHRcdFx0XHRcdHZhbHVlOiBuYW1lLFxuXHRcdFx0XHRcdG9uaW5wdXQ6IChuZXdOYW1lKSA9PiB7XG5cdFx0XHRcdFx0XHRuYW1lID0gbmV3TmFtZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0gc2F0aXNmaWVzIFRleHRGaWVsZEF0dHJzKSxcblx0XHRcdFx0bShDb2xvclBpY2tlclZpZXcsIHtcblx0XHRcdFx0XHR2YWx1ZTogY29sb3IsXG5cdFx0XHRcdFx0b25zZWxlY3Q6IChuZXdDb2xvcjogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRjb2xvciA9IG5ld0NvbG9yXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSksXG5cdFx0XHRdKSxcblx0fSlcbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IFZpZXdTbGlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9uYXYvVmlld1NsaWRlci5qc1wiXG5pbXBvcnQgeyBDb2x1bW5UeXBlLCBWaWV3Q29sdW1uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9WaWV3Q29sdW1uXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9EaWFsb2dcIlxuaW1wb3J0IHsgRmVhdHVyZVR5cGUsIGdldE1haWxGb2xkZXJUeXBlLCBLZXlzLCBNYWlsU2V0S2luZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBBcHBIZWFkZXJBdHRycywgSGVhZGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvSGVhZGVyLmpzXCJcbmltcG9ydCB7IE1haWwsIE1haWxCb3gsIE1haWxGb2xkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBpc0VtcHR5LCBub09wLCBvZkNsYXNzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBNYWlsTGlzdFZpZXcgfSBmcm9tIFwiLi9NYWlsTGlzdFZpZXdcIlxuaW1wb3J0IHsgYXNzZXJ0TWFpbk9yTm9kZSwgaXNBcHAgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW52XCJcbmltcG9ydCB0eXBlIHsgU2hvcnRjdXQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvS2V5TWFuYWdlclwiXG5pbXBvcnQgeyBrZXlNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXJcIlxuaW1wb3J0IHsgZ2V0TWFpbFNlbGVjdGlvbk1lc3NhZ2UsIE11bHRpSXRlbVZpZXdlciB9IGZyb20gXCIuL011bHRpSXRlbVZpZXdlci5qc1wiXG5pbXBvcnQgeyBJY29ucyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvaWNvbnMvSWNvbnNcIlxuaW1wb3J0IHsgc2hvd1Byb2dyZXNzRGlhbG9nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgdHlwZSB7IE1haWxib3hEZXRhaWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L01haWxib3hNb2RlbC5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IFBlcm1pc3Npb25FcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9QZXJtaXNzaW9uRXJyb3JcIlxuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc3R5bGVzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZVwiXG5pbXBvcnQgeyBhcmNoaXZlTWFpbHMsIGdldENvbnZlcnNhdGlvblRpdGxlLCBnZXRNb3ZlTWFpbEJvdW5kcywgbW92ZU1haWxzLCBtb3ZlVG9JbmJveCwgcHJvbXB0QW5kRGVsZXRlTWFpbHMsIHNob3dNb3ZlTWFpbHNEcm9wZG93biB9IGZyb20gXCIuL01haWxHdWlVdGlsc1wiXG5pbXBvcnQgeyBnZXRFbGVtZW50SWQsIGlzU2FtZUlkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzXCJcbmltcG9ydCB7IGlzTmV3TWFpbEFjdGlvbkF2YWlsYWJsZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL25hdi9OYXZGdW5jdGlvbnNcIlxuaW1wb3J0IHsgQ2FuY2VsbGVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvQ2FuY2VsbGVkRXJyb3JcIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgcmVhZExvY2FsRmlsZXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2ZpbGUvRmlsZUNvbnRyb2xsZXIuanNcIlxuaW1wb3J0IHsgTW9iaWxlTWFpbEFjdGlvbkJhciB9IGZyb20gXCIuL01vYmlsZU1haWxBY3Rpb25CYXIuanNcIlxuaW1wb3J0IHsgZGV2aWNlQ29uZmlnIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0RldmljZUNvbmZpZy5qc1wiXG5pbXBvcnQgeyBEcmF3ZXJNZW51QXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9uYXYvRHJhd2VyTWVudS5qc1wiXG5pbXBvcnQgeyBCYXNlVG9wTGV2ZWxWaWV3IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvQmFzZVRvcExldmVsVmlldy5qc1wiXG5pbXBvcnQgeyBzaG93RWRpdEZvbGRlckRpYWxvZyB9IGZyb20gXCIuL0VkaXRGb2xkZXJEaWFsb2cuanNcIlxuaW1wb3J0IHsgTWFpbEZvbGRlcnNWaWV3IH0gZnJvbSBcIi4vTWFpbEZvbGRlcnNWaWV3LmpzXCJcbmltcG9ydCB7IEZvbGRlckNvbHVtblZpZXcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9Gb2xkZXJDb2x1bW5WaWV3LmpzXCJcbmltcG9ydCB7IFNpZGViYXJTZWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvU2lkZWJhclNlY3Rpb24uanNcIlxuaW1wb3J0IHsgRWRpdEZvbGRlcnNEaWFsb2cgfSBmcm9tIFwiLi9FZGl0Rm9sZGVyc0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBUb3BMZXZlbEF0dHJzLCBUb3BMZXZlbFZpZXcgfSBmcm9tIFwiLi4vLi4vLi4vVG9wTGV2ZWxWaWV3LmpzXCJcbmltcG9ydCB7IENvbnZlcnNhdGlvblZpZXdNb2RlbCB9IGZyb20gXCIuL0NvbnZlcnNhdGlvblZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBjb252ZXJzYXRpb25DYXJkTWFyZ2luLCBDb252ZXJzYXRpb25WaWV3ZXIgfSBmcm9tIFwiLi9Db252ZXJzYXRpb25WaWV3ZXIuanNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBCYWNrZ3JvdW5kQ29sdW1uTGF5b3V0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvQmFja2dyb3VuZENvbHVtbkxheW91dC5qc1wiXG5pbXBvcnQgeyBNYWlsVmlld2VyQWN0aW9ucyB9IGZyb20gXCIuL01haWxWaWV3ZXJUb29sYmFyLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHsgTW9iaWxlTWFpbE11bHRpc2VsZWN0aW9uQWN0aW9uQmFyIH0gZnJvbSBcIi4vTW9iaWxlTWFpbE11bHRpc2VsZWN0aW9uQWN0aW9uQmFyLmpzXCJcbmltcG9ydCB7IFNlbGVjdEFsbENoZWNrYm94IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvU2VsZWN0QWxsQ2hlY2tib3guanNcIlxuaW1wb3J0IHsgRGVza3RvcExpc3RUb29sYmFyLCBEZXNrdG9wVmlld2VyVG9vbGJhciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL0Rlc2t0b3BUb29sYmFycy5qc1wiXG5pbXBvcnQgeyBNb2JpbGVIZWFkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9Nb2JpbGVIZWFkZXIuanNcIlxuaW1wb3J0IHsgTGF6eVNlYXJjaEJhciB9IGZyb20gXCIuLi8uLi9MYXp5U2VhcmNoQmFyLmpzXCJcbmltcG9ydCB7IE11bHRpc2VsZWN0TW9iaWxlSGVhZGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvTXVsdGlzZWxlY3RNb2JpbGVIZWFkZXIuanNcIlxuaW1wb3J0IHsgTWFpbFZpZXdNb2RlbCB9IGZyb20gXCIuL01haWxWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgc2VsZWN0aW9uQXR0cnNGb3JMaXN0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xpc3RNb2RlbC5qc1wiXG5pbXBvcnQgeyBMaXN0TG9hZGluZ1N0YXRlLCBNdWx0aXNlbGVjdE1vZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0xpc3QuanNcIlxuaW1wb3J0IHsgRW50ZXJNdWx0aXNlbGVjdEljb25CdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9FbnRlck11bHRpc2VsZWN0SWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBNYWlsRmlsdGVyQnV0dG9uIH0gZnJvbSBcIi4vTWFpbEZpbHRlckJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBsaXN0U2VsZWN0aW9uS2V5Ym9hcmRTaG9ydGN1dHMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0xpc3RVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRNYWlsYm94TmFtZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2hhcmVkTWFpbFV0aWxzLmpzXCJcbmltcG9ydCB7IEJvdHRvbU5hdiB9IGZyb20gXCIuLi8uLi9ndWkvQm90dG9tTmF2LmpzXCJcbmltcG9ydCB7IG1haWxMb2NhdG9yIH0gZnJvbSBcIi4uLy4uL21haWxMb2NhdG9yLmpzXCJcbmltcG9ydCB7IHNob3dTbmFja0JhciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvU25hY2tCYXIuanNcIlxuaW1wb3J0IHsgZ2V0Rm9sZGVyTmFtZSB9IGZyb20gXCIuLi9tb2RlbC9NYWlsVXRpbHMuanNcIlxuaW1wb3J0IHsgY2FuRG9EcmFnQW5kRHJvcEV4cG9ydCB9IGZyb20gXCIuL01haWxWaWV3ZXJVdGlscy5qc1wiXG5pbXBvcnQgeyBpc1NwYW1PclRyYXNoRm9sZGVyIH0gZnJvbSBcIi4uL21vZGVsL01haWxDaGVja3MuanNcIlxuaW1wb3J0IHsgc2hvd0VkaXRMYWJlbERpYWxvZyB9IGZyb20gXCIuL0VkaXRMYWJlbERpYWxvZ1wiXG5pbXBvcnQgeyBTaWRlYmFyU2VjdGlvblJvdyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvU2lkZWJhclNlY3Rpb25Sb3dcIlxuaW1wb3J0IHsgYXR0YWNoRHJvcGRvd24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3Bkb3duXCJcbmltcG9ydCB7IEJ1dHRvblNpemUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvblNpemVcIlxuaW1wb3J0IHsgUm93QnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9idXR0b25zL1Jvd0J1dHRvblwiXG5pbXBvcnQgeyBnZXRMYWJlbENvbG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9MYWJlbC5qc1wiXG5pbXBvcnQgeyBNQUlMX1BSRUZJWCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9Sb3V0ZUNoYW5nZVwiXG5pbXBvcnQgeyBEcm9wVHlwZSwgRmlsZURyb3BEYXRhLCBNYWlsRHJvcERhdGEgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0d1aVV0aWxzXCJcbmltcG9ydCB7IE1haWxJbXBvcnRlciB9IGZyb20gXCIuLi9pbXBvcnQvTWFpbEltcG9ydGVyLmpzXCJcbmltcG9ydCB7IGZpbGVMaXN0VG9BcnJheSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9GaWxlVXRpbHMuanNcIlxuaW1wb3J0IHsgTGFiZWxzUG9wdXAgfSBmcm9tIFwiLi9MYWJlbHNQb3B1cFwiXG5cbmFzc2VydE1haW5Pck5vZGUoKVxuXG4vKiogU3RhdGUgcGVyc2lzdGVkIGJldHdlZW4gcmUtY3JlYXRpb25zLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYWlsVmlld0NhY2hlIHtcblx0LyoqIFRoZSBwcmVmZXJlbmNlIGZvciBpZiBjb252ZXJzYXRpb24gdmlldyB3YXMgdXNlZCwgc28gd2UgY2FuIHJlc2V0IGlmIGl0IHdhcyBjaGFuZ2VkICovXG5cdGNvbnZlcnNhdGlvblZpZXdQcmVmZXJlbmNlOiBib29sZWFuIHwgbnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1haWxWaWV3QXR0cnMgZXh0ZW5kcyBUb3BMZXZlbEF0dHJzIHtcblx0ZHJhd2VyQXR0cnM6IERyYXdlck1lbnVBdHRyc1xuXHRjYWNoZTogTWFpbFZpZXdDYWNoZVxuXHRoZWFkZXI6IEFwcEhlYWRlckF0dHJzXG5cdG1haWxWaWV3TW9kZWw6IE1haWxWaWV3TW9kZWxcbn1cblxuLyoqXG4gKiBUb3AtbGV2ZWwgdmlldyBmb3IgZGlzcGxheWluZyBtYWlsYm94ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYWlsVmlldyBleHRlbmRzIEJhc2VUb3BMZXZlbFZpZXcgaW1wbGVtZW50cyBUb3BMZXZlbFZpZXc8TWFpbFZpZXdBdHRycz4ge1xuXHRwcml2YXRlIHJlYWRvbmx5IGxpc3RDb2x1bW46IFZpZXdDb2x1bW5cblx0cHJpdmF0ZSByZWFkb25seSBmb2xkZXJDb2x1bW46IFZpZXdDb2x1bW5cblx0cHJpdmF0ZSByZWFkb25seSBtYWlsQ29sdW1uOiBWaWV3Q29sdW1uXG5cdHByaXZhdGUgcmVhZG9ubHkgdmlld1NsaWRlcjogVmlld1NsaWRlclxuXHRjYWNoZTogTWFpbFZpZXdDYWNoZVxuXHRyZWFkb25seSBvbmNyZWF0ZTogVG9wTGV2ZWxWaWV3W1wib25jcmVhdGVcIl1cblx0cmVhZG9ubHkgb25yZW1vdmU6IFRvcExldmVsVmlld1tcIm9ucmVtb3ZlXCJdXG5cblx0cHJpdmF0ZSBjb3VudGVyc1N0cmVhbTogU3RyZWFtPHVua25vd24+IHwgbnVsbCA9IG51bGxcblxuXHRwcml2YXRlIHJlYWRvbmx5IGV4cGFuZGVkU3RhdGU6IFNldDxJZD5cblx0cHJpdmF0ZSByZWFkb25seSBtYWlsVmlld01vZGVsOiBNYWlsVmlld01vZGVsXG5cblx0Z2V0IGNvbnZlcnNhdGlvblZpZXdNb2RlbCgpOiBDb252ZXJzYXRpb25WaWV3TW9kZWwgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5tYWlsVmlld01vZGVsLmdldENvbnZlcnNhdGlvblZpZXdNb2RlbCgpXG5cdH1cblxuXHRjb25zdHJ1Y3Rvcih2bm9kZTogVm5vZGU8TWFpbFZpZXdBdHRycz4pIHtcblx0XHRzdXBlcigpXG5cdFx0dGhpcy5leHBhbmRlZFN0YXRlID0gbmV3IFNldChkZXZpY2VDb25maWcuZ2V0RXhwYW5kZWRGb2xkZXJzKGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlcklkKSlcblx0XHR0aGlzLmNhY2hlID0gdm5vZGUuYXR0cnMuY2FjaGVcblx0XHR0aGlzLmZvbGRlckNvbHVtbiA9IHRoaXMuY3JlYXRlRm9sZGVyQ29sdW1uKG51bGwsIHZub2RlLmF0dHJzLmRyYXdlckF0dHJzKVxuXHRcdHRoaXMubWFpbFZpZXdNb2RlbCA9IHZub2RlLmF0dHJzLm1haWxWaWV3TW9kZWxcblxuXHRcdHRoaXMubGlzdENvbHVtbiA9IG5ldyBWaWV3Q29sdW1uKFxuXHRcdFx0e1xuXHRcdFx0XHR2aWV3OiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZm9sZGVyID0gdGhpcy5tYWlsVmlld01vZGVsLmdldEZvbGRlcigpXG5cdFx0XHRcdFx0cmV0dXJuIG0oQmFja2dyb3VuZENvbHVtbkxheW91dCwge1xuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiB0aGVtZS5uYXZpZ2F0aW9uX2JnLFxuXHRcdFx0XHRcdFx0ZGVza3RvcFRvb2xiYXI6ICgpID0+IG0oRGVza3RvcExpc3RUb29sYmFyLCBtKFNlbGVjdEFsbENoZWNrYm94LCBzZWxlY3Rpb25BdHRyc0Zvckxpc3QodGhpcy5tYWlsVmlld01vZGVsKSksIHRoaXMucmVuZGVyRmlsdGVyQnV0dG9uKCkpLFxuXHRcdFx0XHRcdFx0Y29sdW1uTGF5b3V0OiBmb2xkZXJcblx0XHRcdFx0XHRcdFx0PyBtKFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJcIixcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtYXJnaW5Cb3R0b206IHB4KGNvbnZlcnNhdGlvbkNhcmRNYXJnaW4pLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdG0oTWFpbExpc3RWaWV3LCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGtleTogZ2V0RWxlbWVudElkKGZvbGRlciksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1haWxWaWV3TW9kZWw6IHRoaXMubWFpbFZpZXdNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25TaW5nbGVTZWxlY3Rpb246IChtYWlsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5tYWlsVmlld01vZGVsLm9uU2luZ2xlU2VsZWN0aW9uKG1haWwpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCF0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsPy5pc0luTXVsdGlzZWxlY3QoKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy52aWV3U2xpZGVyLmZvY3VzKHRoaXMubWFpbENvbHVtbilcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gTWFrZSBzdXJlIHRoYXQgd2UgbWFyayBtYWlsIGFzIHJlYWQgaWYgeW91IHNlbGVjdCB0aGUgbWFpbCBhZ2FpbiwgZXZlbiBpZiBpdCB3YXMgc2VsZWN0ZWQgYmVmb3JlLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gRG8gaXQgaW4gdGhlIG5leHQgZXZlbiBsb29wIHRvIG5vdCByZWx5IG9uIHdoYXQgaXMgY2FsbGVkIGZpcnN0LCBsaXN0TW9kZWwgb3IgdXMuIExpc3RNb2RlbCBjaGFuZ2VzIGFyZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gc3luYyBzbyB0aGlzIHNob3VsZCBiZSBlbm91Z2guXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29udmVyc2F0aW9uVmlld01vZGVsID0gdGhpcy5tYWlsVmlld01vZGVsLmdldENvbnZlcnNhdGlvblZpZXdNb2RlbCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChjb252ZXJzYXRpb25WaWV3TW9kZWwgJiYgaXNTYW1lSWQobWFpbC5faWQsIGNvbnZlcnNhdGlvblZpZXdNb2RlbC5wcmltYXJ5TWFpbC5faWQpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udmVyc2F0aW9uVmlld01vZGVsPy5wcmltYXJ5Vmlld01vZGVsKCkuc2V0VW5yZWFkKGZhbHNlKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25TaW5nbGVJbmNsdXNpdmVTZWxlY3Rpb246ICguLi5hcmdzKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5tYWlsVmlld01vZGVsPy5vblNpbmdsZUluY2x1c2l2ZVNlbGVjdGlvbiguLi5hcmdzKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvblJhbmdlU2VsZWN0aW9uVG93YXJkczogKC4uLmFyZ3MpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwub25SYW5nZVNlbGVjdGlvblRvd2FyZHMoLi4uYXJncylcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25TaW5nbGVFeGNsdXNpdmVTZWxlY3Rpb246ICguLi5hcmdzKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5tYWlsVmlld01vZGVsLm9uU2luZ2xlRXhjbHVzaXZlU2VsZWN0aW9uKC4uLmFyZ3MpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9uQ2xlYXJGb2xkZXI6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmb2xkZXIgPSB0aGlzLm1haWxWaWV3TW9kZWwuZ2V0Rm9sZGVyKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoZm9sZGVyID09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihcIkNhbm5vdCBkZWxldGUgZm9sZGVyLCBubyBmb2xkZXIgaXMgc2VsZWN0ZWRcIilcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb25maXJtZWQgPSBhd2FpdCBEaWFsb2cuY29uZmlybShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJjb25maXJtRGVsZXRlRmluYWxseVN5c3RlbUZvbGRlcl9tc2dcIiwgeyBcInsxfVwiOiBnZXRGb2xkZXJOYW1lKGZvbGRlcikgfSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChjb25maXJtZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dQcm9ncmVzc0RpYWxvZyhcInByb2dyZXNzRGVsZXRpbmdfbXNnXCIsIHRoaXMubWFpbFZpZXdNb2RlbC5maW5hbGx5RGVsZXRlQWxsTWFpbHNJblNlbGVjdGVkRm9sZGVyKGZvbGRlcikpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdFx0XHRtb2JpbGVIZWFkZXI6ICgpID0+XG5cdFx0XHRcdFx0XHRcdHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWw/LmlzSW5NdWx0aXNlbGVjdCgpXG5cdFx0XHRcdFx0XHRcdFx0PyBtKE11bHRpc2VsZWN0TW9iaWxlSGVhZGVyLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC4uLnNlbGVjdGlvbkF0dHJzRm9yTGlzdCh0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWVzc2FnZTogZ2V0TWFpbFNlbGVjdGlvbk1lc3NhZ2UodGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbC5nZXRTZWxlY3RlZEFzQXJyYXkoKSksXG5cdFx0XHRcdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdFx0XHRcdDogbShNb2JpbGVIZWFkZXIsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Li4udm5vZGUuYXR0cnMuaGVhZGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogdGhpcy5saXN0Q29sdW1uLmdldFRpdGxlKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbHVtblR5cGU6IFwiZmlyc3RcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uczogW1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMucmVuZGVyRmlsdGVyQnV0dG9uKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bShFbnRlck11bHRpc2VsZWN0SWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2tBY3Rpb246ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbD8uZW50ZXJNdWx0aXNlbGVjdCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRwcmltYXJ5QWN0aW9uOiAoKSA9PiB0aGlzLnJlbmRlckhlYWRlclJpZ2h0VmlldygpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRiYWNrQWN0aW9uOiAoKSA9PiB0aGlzLnZpZXdTbGlkZXIuZm9jdXNQcmV2aW91c0NvbHVtbigpLFxuXHRcdFx0XHRcdFx0XHRcdCAgfSksXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRDb2x1bW5UeXBlLkJhY2tncm91bmQsXG5cdFx0XHR7XG5cdFx0XHRcdG1pbldpZHRoOiBzaXplLnNlY29uZF9jb2xfbWluX3dpZHRoLFxuXHRcdFx0XHRtYXhXaWR0aDogc2l6ZS5zZWNvbmRfY29sX21heF93aWR0aCxcblx0XHRcdFx0aGVhZGVyQ2VudGVyOiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZm9sZGVyID0gdGhpcy5tYWlsVmlld01vZGVsLmdldEZvbGRlcigpXG5cdFx0XHRcdFx0cmV0dXJuIGZvbGRlciA/IGxhbmcubWFrZVRyYW5zbGF0aW9uKFwiZm9sZGVyX25hbWVcIiwgZ2V0Rm9sZGVyTmFtZShmb2xkZXIpKSA6IFwiZW1wdHlTdHJpbmdfbXNnXCJcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0KVxuXG5cdFx0dGhpcy5tYWlsQ29sdW1uID0gbmV3IFZpZXdDb2x1bW4oXG5cdFx0XHR7XG5cdFx0XHRcdHZpZXc6ICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCB2aWV3TW9kZWwgPSB0aGlzLmNvbnZlcnNhdGlvblZpZXdNb2RlbFxuXHRcdFx0XHRcdGlmICh2aWV3TW9kZWwpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnJlbmRlclNpbmdsZU1haWxWaWV3ZXIodm5vZGUuYXR0cnMuaGVhZGVyLCB2aWV3TW9kZWwpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnJlbmRlck11bHRpTWFpbFZpZXdlcih2bm9kZS5hdHRycy5oZWFkZXIpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdENvbHVtblR5cGUuQmFja2dyb3VuZCxcblx0XHRcdHtcblx0XHRcdFx0bWluV2lkdGg6IHNpemUudGhpcmRfY29sX21pbl93aWR0aCxcblx0XHRcdFx0bWF4V2lkdGg6IHNpemUudGhpcmRfY29sX21heF93aWR0aCxcblx0XHRcdFx0YXJpYUxhYmVsOiAoKSA9PiBsYW5nLmdldChcImVtYWlsX2xhYmVsXCIpLFxuXHRcdFx0fSxcblx0XHQpXG5cdFx0dGhpcy52aWV3U2xpZGVyID0gbmV3IFZpZXdTbGlkZXIoW3RoaXMuZm9sZGVyQ29sdW1uLCB0aGlzLmxpc3RDb2x1bW4sIHRoaXMubWFpbENvbHVtbl0pXG5cdFx0dGhpcy52aWV3U2xpZGVyLmZvY3VzZWRDb2x1bW4gPSB0aGlzLmxpc3RDb2x1bW5cblxuXHRcdGNvbnN0IHNob3J0Y3V0cyA9IHRoaXMuZ2V0U2hvcnRjdXRzKClcblx0XHR2bm9kZS5hdHRycy5tYWlsVmlld01vZGVsLmluaXQoKVxuXG5cdFx0dGhpcy5vbmNyZWF0ZSA9ICh2bm9kZSkgPT4ge1xuXHRcdFx0dGhpcy5jb3VudGVyc1N0cmVhbSA9IG1haWxMb2NhdG9yLm1haWxNb2RlbC5tYWlsYm94Q291bnRlcnMubWFwKG0ucmVkcmF3KVxuXHRcdFx0a2V5TWFuYWdlci5yZWdpc3RlclNob3J0Y3V0cyhzaG9ydGN1dHMpXG5cdFx0XHR0aGlzLmNhY2hlLmNvbnZlcnNhdGlvblZpZXdQcmVmZXJlbmNlID0gZGV2aWNlQ29uZmlnLmdldENvbnZlcnNhdGlvblZpZXdTaG93T25seVNlbGVjdGVkTWFpbCgpXG5cdFx0fVxuXG5cdFx0dGhpcy5vbnJlbW92ZSA9ICgpID0+IHtcblx0XHRcdC8vIGNhbmNlbCB0aGUgbG9hZGluZyBpZiB3ZSBhcmUgZGVzdHJveWVkXG5cdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsPy5jYW5jZWxMb2FkQWxsKClcblxuXHRcdFx0dGhpcy5jb3VudGVyc1N0cmVhbT8uZW5kKHRydWUpXG5cdFx0XHR0aGlzLmNvdW50ZXJzU3RyZWFtID0gbnVsbFxuXG5cdFx0XHRrZXlNYW5hZ2VyLnVucmVnaXN0ZXJTaG9ydGN1dHMoc2hvcnRjdXRzKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRmlsdGVyQnV0dG9uKCkge1xuXHRcdHJldHVybiBtKE1haWxGaWx0ZXJCdXR0b24sIHtcblx0XHRcdGZpbHRlcjogdGhpcy5tYWlsVmlld01vZGVsLmZpbHRlclR5cGUsXG5cdFx0XHRzZXRGaWx0ZXI6IChmaWx0ZXIpID0+IHRoaXMubWFpbFZpZXdNb2RlbC5zZXRGaWx0ZXIoZmlsdGVyKSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBtYWlsVmlld2VyU2luZ2xlQWN0aW9ucyh2aWV3TW9kZWw6IENvbnZlcnNhdGlvblZpZXdNb2RlbCkge1xuXHRcdHJldHVybiBtKE1haWxWaWV3ZXJBY3Rpb25zLCB7XG5cdFx0XHRtYWlsYm94TW9kZWw6IHZpZXdNb2RlbC5wcmltYXJ5Vmlld01vZGVsKCkubWFpbGJveE1vZGVsLFxuXHRcdFx0bWFpbE1vZGVsOiB2aWV3TW9kZWwucHJpbWFyeVZpZXdNb2RlbCgpLm1haWxNb2RlbCxcblx0XHRcdG1haWxWaWV3ZXJWaWV3TW9kZWw6IHZpZXdNb2RlbC5wcmltYXJ5Vmlld01vZGVsKCksXG5cdFx0XHRtYWlsczogW3ZpZXdNb2RlbC5wcmltYXJ5TWFpbF0sXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU2luZ2xlTWFpbFZpZXdlcihoZWFkZXI6IEFwcEhlYWRlckF0dHJzLCB2aWV3TW9kZWw6IENvbnZlcnNhdGlvblZpZXdNb2RlbCkge1xuXHRcdHJldHVybiBtKEJhY2tncm91bmRDb2x1bW5MYXlvdXQsIHtcblx0XHRcdGJhY2tncm91bmRDb2xvcjogdGhlbWUubmF2aWdhdGlvbl9iZyxcblx0XHRcdGRlc2t0b3BUb29sYmFyOiAoKSA9PiBtKERlc2t0b3BWaWV3ZXJUb29sYmFyLCB0aGlzLm1haWxWaWV3ZXJTaW5nbGVBY3Rpb25zKHZpZXdNb2RlbCkpLFxuXHRcdFx0bW9iaWxlSGVhZGVyOiAoKSA9PlxuXHRcdFx0XHRtKE1vYmlsZUhlYWRlciwge1xuXHRcdFx0XHRcdC4uLmhlYWRlcixcblx0XHRcdFx0XHRiYWNrQWN0aW9uOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnZpZXdTbGlkZXIuZm9jdXNQcmV2aW91c0NvbHVtbigpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb2x1bW5UeXBlOiBcIm90aGVyXCIsXG5cdFx0XHRcdFx0YWN0aW9uczogbnVsbCxcblx0XHRcdFx0XHRtdWx0aWNvbHVtbkFjdGlvbnM6ICgpID0+IHRoaXMubWFpbFZpZXdlclNpbmdsZUFjdGlvbnModmlld01vZGVsKSxcblx0XHRcdFx0XHRwcmltYXJ5QWN0aW9uOiAoKSA9PiB0aGlzLnJlbmRlckhlYWRlclJpZ2h0VmlldygpLFxuXHRcdFx0XHRcdHRpdGxlOiBnZXRDb252ZXJzYXRpb25UaXRsZSh2aWV3TW9kZWwpLFxuXHRcdFx0XHR9KSxcblx0XHRcdGNvbHVtbkxheW91dDogbShDb252ZXJzYXRpb25WaWV3ZXIsIHtcblx0XHRcdFx0Ly8gUmUtY3JlYXRlIHRoZSB3aG9sZSB2aWV3ZXIgYW5kIGl0cyB2bm9kZSB0cmVlIGlmIGVtYWlsIGhhcyBjaGFuZ2VkXG5cdFx0XHRcdGtleTogZ2V0RWxlbWVudElkKHZpZXdNb2RlbC5wcmltYXJ5TWFpbCksXG5cdFx0XHRcdHZpZXdNb2RlbDogdmlld01vZGVsLFxuXHRcdFx0XHQvLyB0aGlzIGFzc3VtZXMgdGhhdCB0aGUgdmlld1NsaWRlciBmb2N1cyBhbmltYXRpb24gaXMgYWxyZWFkeSBzdGFydGVkXG5cdFx0XHRcdGRlbGF5Qm9keVJlbmRlcmluZzogdGhpcy52aWV3U2xpZGVyLndhaXRGb3JBbmltYXRpb24oKSxcblx0XHRcdH0pLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIG1haWxWaWV3ZXJNdWx0aUFjdGlvbnMoKSB7XG5cdFx0cmV0dXJuIG0oTWFpbFZpZXdlckFjdGlvbnMsIHtcblx0XHRcdG1haWxib3hNb2RlbDogbG9jYXRvci5tYWlsYm94TW9kZWwsXG5cdFx0XHRtYWlsTW9kZWw6IG1haWxMb2NhdG9yLm1haWxNb2RlbCxcblx0XHRcdG1haWxzOiB0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsPy5nZXRTZWxlY3RlZEFzQXJyYXkoKSA/PyBbXSxcblx0XHRcdHNlbGVjdE5vbmU6ICgpID0+IHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWw/LnNlbGVjdE5vbmUoKSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJNdWx0aU1haWxWaWV3ZXIoaGVhZGVyOiBBcHBIZWFkZXJBdHRycykge1xuXHRcdHJldHVybiBtKEJhY2tncm91bmRDb2x1bW5MYXlvdXQsIHtcblx0XHRcdGJhY2tncm91bmRDb2xvcjogdGhlbWUubmF2aWdhdGlvbl9iZyxcblx0XHRcdGRlc2t0b3BUb29sYmFyOiAoKSA9PiBtKERlc2t0b3BWaWV3ZXJUb29sYmFyLCB0aGlzLm1haWxWaWV3ZXJNdWx0aUFjdGlvbnMoKSksXG5cdFx0XHRtb2JpbGVIZWFkZXI6ICgpID0+XG5cdFx0XHRcdG0oTW9iaWxlSGVhZGVyLCB7XG5cdFx0XHRcdFx0YWN0aW9uczogdGhpcy5tYWlsVmlld2VyTXVsdGlBY3Rpb25zKCksXG5cdFx0XHRcdFx0cHJpbWFyeUFjdGlvbjogKCkgPT4gdGhpcy5yZW5kZXJIZWFkZXJSaWdodFZpZXcoKSxcblx0XHRcdFx0XHRiYWNrQWN0aW9uOiAoKSA9PiB0aGlzLnZpZXdTbGlkZXIuZm9jdXNQcmV2aW91c0NvbHVtbigpLFxuXHRcdFx0XHRcdC4uLmhlYWRlcixcblx0XHRcdFx0XHRjb2x1bW5UeXBlOiBcIm90aGVyXCIsXG5cdFx0XHRcdH0pLFxuXHRcdFx0Y29sdW1uTGF5b3V0OiBtKE11bHRpSXRlbVZpZXdlciwge1xuXHRcdFx0XHRzZWxlY3RlZEVudGl0aWVzOiB0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsPy5nZXRTZWxlY3RlZEFzQXJyYXkoKSA/PyBbXSxcblx0XHRcdFx0c2VsZWN0Tm9uZTogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWw/LnNlbGVjdE5vbmUoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRsb2FkQWxsOiAoKSA9PiB0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsPy5sb2FkQWxsKCksXG5cdFx0XHRcdHN0b3BMb2FkQWxsOiAoKSA9PiB0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsPy5jYW5jZWxMb2FkQWxsKCksXG5cdFx0XHRcdGxvYWRpbmdBbGw6IHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWw/LmlzTG9hZGluZ0FsbCgpXG5cdFx0XHRcdFx0PyBcImxvYWRpbmdcIlxuXHRcdFx0XHRcdDogdGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbD8ubG9hZGluZ1N0YXR1cyA9PT0gTGlzdExvYWRpbmdTdGF0ZS5Eb25lXG5cdFx0XHRcdFx0PyBcImxvYWRlZFwiXG5cdFx0XHRcdFx0OiBcImNhbl9sb2FkXCIsXG5cdFx0XHRcdGdldFNlbGVjdGlvbk1lc3NhZ2U6IChzZWxlY3RlZDogUmVhZG9ubHlBcnJheTxNYWlsPikgPT4gZ2V0TWFpbFNlbGVjdGlvbk1lc3NhZ2Uoc2VsZWN0ZWQpLFxuXHRcdFx0fSksXG5cdFx0fSlcblx0fVxuXG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxNYWlsVmlld0F0dHJzPik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiI21haWwubWFpbi12aWV3XCIsXG5cdFx0XHR7XG5cdFx0XHRcdG9uZHJhZ292ZXI6IChldjogRHJhZ0V2ZW50KSA9PiB7XG5cdFx0XHRcdFx0Ly8gZG8gbm90IGNoZWNrIHRoZSBkYXRhIHRyYW5zZmVyIGhlcmUgYmVjYXVzZSBpdCBpcyBub3QgYWx3YXlzIGZpbGxlZCwgZS5nLiBpbiBTYWZhcmlcblx0XHRcdFx0XHRldi5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0fSxcblx0XHRcdFx0b25kcm9wOiAoZXY6IERyYWdFdmVudCkgPT4ge1xuXHRcdFx0XHRcdGlmIChpc05ld01haWxBY3Rpb25BdmFpbGFibGUoKSAmJiBldi5kYXRhVHJhbnNmZXI/LmZpbGVzICYmIGV2LmRhdGFUcmFuc2Zlci5maWxlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmhhbmRsZUZpbGVEcm9wKHtcblx0XHRcdFx0XHRcdFx0ZHJvcFR5cGU6IERyb3BUeXBlLkV4dGVybmFsRmlsZSxcblx0XHRcdFx0XHRcdFx0ZmlsZXM6IGZpbGVMaXN0VG9BcnJheShldi5kYXRhVHJhbnNmZXIuZmlsZXMpLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBwcmV2ZW50IGluIGFueSBjYXNlIGJlY2F1c2UgZmlyZWZveCB0cmllcyB0byBvcGVuXG5cdFx0XHRcdFx0Ly8gZGF0YVRyYW5zZmVyIGFzIGEgVVJMIG90aGVyd2lzZS5cblx0XHRcdFx0XHRldi5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdGV2LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRtKHRoaXMudmlld1NsaWRlciwge1xuXHRcdFx0XHRoZWFkZXI6IG0oSGVhZGVyLCB7XG5cdFx0XHRcdFx0cmlnaHRWaWV3OiB0aGlzLnJlbmRlckhlYWRlclJpZ2h0VmlldygpLFxuXHRcdFx0XHRcdHNlYXJjaEJhcjogKCkgPT5cblx0XHRcdFx0XHRcdC8vIG5vdCBzaG93aW5nIHNlYXJjaCBmb3IgZXh0ZXJuYWwgdXNlcnNcblx0XHRcdFx0XHRcdGxvY2F0b3IubG9naW5zLmlzSW50ZXJuYWxVc2VyTG9nZ2VkSW4oKVxuXHRcdFx0XHRcdFx0XHQ/IG0oTGF6eVNlYXJjaEJhciwge1xuXHRcdFx0XHRcdFx0XHRcdFx0cGxhY2Vob2xkZXI6IGxhbmcuZ2V0KFwic2VhcmNoRW1haWxzX3BsYWNlaG9sZGVyXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6ICFsb2NhdG9yLmxvZ2lucy5pc0Z1bGx5TG9nZ2VkSW4oKSxcblx0XHRcdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdFx0Li4uYXR0cnMuaGVhZGVyLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0Ym90dG9tTmF2OlxuXHRcdFx0XHRcdHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpICYmIHRoaXMudmlld1NsaWRlci5mb2N1c2VkQ29sdW1uID09PSB0aGlzLm1haWxDb2x1bW4gJiYgdGhpcy5jb252ZXJzYXRpb25WaWV3TW9kZWxcblx0XHRcdFx0XHRcdD8gbShNb2JpbGVNYWlsQWN0aW9uQmFyLCB7IHZpZXdNb2RlbDogdGhpcy5jb252ZXJzYXRpb25WaWV3TW9kZWwucHJpbWFyeVZpZXdNb2RlbCgpIH0pXG5cdFx0XHRcdFx0XHQ6IHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpICYmIHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWw/LmlzSW5NdWx0aXNlbGVjdCgpXG5cdFx0XHRcdFx0XHQ/IG0oTW9iaWxlTWFpbE11bHRpc2VsZWN0aW9uQWN0aW9uQmFyLCB7XG5cdFx0XHRcdFx0XHRcdFx0bWFpbHM6IHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWwuZ2V0U2VsZWN0ZWRBc0FycmF5KCksXG5cdFx0XHRcdFx0XHRcdFx0c2VsZWN0Tm9uZTogKCkgPT4gdGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbD8uc2VsZWN0Tm9uZSgpLFxuXHRcdFx0XHRcdFx0XHRcdG1haWxNb2RlbDogbWFpbExvY2F0b3IubWFpbE1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdG1haWxib3hNb2RlbDogbG9jYXRvci5tYWlsYm94TW9kZWwsXG5cdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHQ6IG0oQm90dG9tTmF2KSxcblx0XHRcdH0pLFxuXHRcdClcblx0fVxuXG5cdGdldFZpZXdTbGlkZXIoKTogVmlld1NsaWRlciB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLnZpZXdTbGlkZXJcblx0fVxuXG5cdGhhbmRsZUJhY2tCdXR0b24oKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgbGlzdE1vZGVsID0gdGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbFxuXHRcdGlmIChsaXN0TW9kZWwgJiYgbGlzdE1vZGVsLmlzSW5NdWx0aXNlbGVjdCgpKSB7XG5cdFx0XHRsaXN0TW9kZWwuc2VsZWN0Tm9uZSgpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH0gZWxzZSBpZiAodGhpcy52aWV3U2xpZGVyLmlzRmlyc3RCYWNrZ3JvdW5kQ29sdW1uRm9jdXNlZCgpKSB7XG5cdFx0XHRjb25zdCBmb2xkZXIgPSB0aGlzLm1haWxWaWV3TW9kZWwuZ2V0Rm9sZGVyKClcblx0XHRcdGlmIChmb2xkZXIgPT0gbnVsbCB8fCBnZXRNYWlsRm9sZGVyVHlwZShmb2xkZXIpICE9PSBNYWlsU2V0S2luZC5JTkJPWCkge1xuXHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc3dpdGNoVG9Gb2xkZXIoTWFpbFNldEtpbmQuSU5CT1gpXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJIZWFkZXJSaWdodFZpZXcoKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBpc05ld01haWxBY3Rpb25BdmFpbGFibGUoKVxuXHRcdFx0PyBbXG5cdFx0XHRcdFx0bShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHR0aXRsZTogXCJuZXdNYWlsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMuc2hvd05ld01haWxEaWFsb2coKS5jYXRjaChvZkNsYXNzKFBlcm1pc3Npb25FcnJvciwgbm9PcCkpLFxuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuUGVuY2lsU3F1YXJlLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0ICBdXG5cdFx0XHQ6IG51bGxcblx0fVxuXG5cdHByaXZhdGUgZ2V0U2hvcnRjdXRzKCk6IEFycmF5PFNob3J0Y3V0PiB7XG5cdFx0cmV0dXJuIFtcblx0XHRcdC4uLmxpc3RTZWxlY3Rpb25LZXlib2FyZFNob3J0Y3V0cyhNdWx0aXNlbGVjdE1vZGUuRW5hYmxlZCwgKCkgPT4gdGhpcy5tYWlsVmlld01vZGVsKSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLk4sXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLnNob3dOZXdNYWlsRGlhbG9nKCkuY2F0Y2gob2ZDbGFzcyhQZXJtaXNzaW9uRXJyb3IsIG5vT3ApKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiAhIXRoaXMubWFpbFZpZXdNb2RlbC5nZXRGb2xkZXIoKSAmJiBpc05ld01haWxBY3Rpb25BdmFpbGFibGUoKSxcblx0XHRcdFx0aGVscDogXCJuZXdNYWlsX2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkRFTEVURSxcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsKSB0aGlzLmRlbGV0ZU1haWxzKHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWwuZ2V0U2VsZWN0ZWRBc0FycmF5KCkpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlbHA6IFwiZGVsZXRlRW1haWxzX2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkJBQ0tTUEFDRSxcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsKSB0aGlzLmRlbGV0ZU1haWxzKHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWwuZ2V0U2VsZWN0ZWRBc0FycmF5KCkpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlbHA6IFwiZGVsZXRlRW1haWxzX2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkEsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbCkgYXJjaGl2ZU1haWxzKHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWwuZ2V0U2VsZWN0ZWRBc0FycmF5KCkpXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVscDogXCJhcmNoaXZlX2FjdGlvblwiLFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiBsb2NhdG9yLmxvZ2lucy5pc0ludGVybmFsVXNlckxvZ2dlZEluKCksXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuSSxcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsKSBtb3ZlVG9JbmJveCh0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsLmdldFNlbGVjdGVkQXNBcnJheSgpKVxuXHRcdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlbHA6IFwibW92ZVRvSW5ib3hfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVixcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMubW92ZU1haWxzKClcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcIm1vdmVfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuTCxcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMubGFiZWxzKClcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcImxhYmVsc19sYWJlbFwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLlUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbCkgdGhpcy50b2dnbGVVbnJlYWRNYWlscyh0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsLmdldFNlbGVjdGVkQXNBcnJheSgpKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcInRvZ2dsZVVucmVhZF9hY3Rpb25cIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5PTkUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc3dpdGNoVG9Gb2xkZXIoTWFpbFNldEtpbmQuSU5CT1gpXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVscDogXCJzd2l0Y2hJbmJveF9hY3Rpb25cIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5UV08sXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc3dpdGNoVG9Gb2xkZXIoTWFpbFNldEtpbmQuRFJBRlQpXG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVscDogXCJzd2l0Y2hEcmFmdHNfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVEhSRUUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc3dpdGNoVG9Gb2xkZXIoTWFpbFNldEtpbmQuU0VOVClcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcInN3aXRjaFNlbnRGb2xkZXJfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuRk9VUixcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMubWFpbFZpZXdNb2RlbC5zd2l0Y2hUb0ZvbGRlcihNYWlsU2V0S2luZC5UUkFTSClcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcInN3aXRjaFRyYXNoX2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkZJVkUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc3dpdGNoVG9Gb2xkZXIoTWFpbFNldEtpbmQuQVJDSElWRSlcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiBsb2NhdG9yLmxvZ2lucy5pc0ludGVybmFsVXNlckxvZ2dlZEluKCksXG5cdFx0XHRcdGhlbHA6IFwic3dpdGNoQXJjaGl2ZV9hY3Rpb25cIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5TSVgsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc3dpdGNoVG9Gb2xkZXIoTWFpbFNldEtpbmQuU1BBTSlcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiBsb2NhdG9yLmxvZ2lucy5pc0ludGVybmFsVXNlckxvZ2dlZEluKCkgJiYgIWxvY2F0b3IubG9naW5zLmlzRW5hYmxlZChGZWF0dXJlVHlwZS5JbnRlcm5hbENvbW11bmljYXRpb24pLFxuXHRcdFx0XHRoZWxwOiBcInN3aXRjaFNwYW1fYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuQ1RSTCxcblx0XHRcdFx0ZXhlYzogKCkgPT4gZmFsc2UsXG5cdFx0XHRcdGVuYWJsZWQ6IGNhbkRvRHJhZ0FuZERyb3BFeHBvcnQsXG5cdFx0XHRcdGhlbHA6IFwiZHJhZ0FuZERyb3BfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuUCxcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucHJlc3NSZWxlYXNlKClcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcImVtcHR5U3RyaW5nX21zZ1wiLFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiBsb2NhdG9yLmxvZ2lucy5pc0VuYWJsZWQoRmVhdHVyZVR5cGUuTmV3c2xldHRlciksXG5cdFx0XHR9LFxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHJlc3NSZWxlYXNlKCkge1xuXHRcdGNvbnN0IHsgb3BlblByZXNzUmVsZWFzZUVkaXRvciB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vcHJlc3MvUHJlc3NSZWxlYXNlRWRpdG9yXCIpXG5cdFx0Y29uc3QgbWFpbGJveERldGFpbHMgPSBhd2FpdCB0aGlzLm1haWxWaWV3TW9kZWwuZ2V0TWFpbGJveERldGFpbHMoKVxuXHRcdGlmIChtYWlsYm94RGV0YWlscykge1xuXHRcdFx0b3BlblByZXNzUmVsZWFzZUVkaXRvcihtYWlsYm94RGV0YWlscylcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG1vdmVNYWlscygpIHtcblx0XHRjb25zdCBtYWlsTGlzdCA9IHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWxcblx0XHRpZiAobWFpbExpc3QgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2VsZWN0ZWRNYWlscyA9IG1haWxMaXN0LmdldFNlbGVjdGVkQXNBcnJheSgpXG5cblx0XHRzaG93TW92ZU1haWxzRHJvcGRvd24obG9jYXRvci5tYWlsYm94TW9kZWwsIG1haWxMb2NhdG9yLm1haWxNb2RlbCwgZ2V0TW92ZU1haWxCb3VuZHMoKSwgc2VsZWN0ZWRNYWlscylcblx0fVxuXG5cdC8qKlxuXHQgKlNob3J0Y3V0IE1ldGhvZCB0byBzaG93IExhYmVscyBkcm9wZG93biBvbmx5IHdoZW4gYXRsZWFzdCBvbmUgbWFpbCBpcyBzZWxlY3RlZC5cblx0ICovXG5cdHByaXZhdGUgbGFiZWxzKCkge1xuXHRcdGNvbnN0IG1haWxMaXN0ID0gdGhpcy5tYWlsVmlld01vZGVsLmxpc3RNb2RlbFxuXHRcdGlmIChtYWlsTGlzdCA9PSBudWxsIHx8ICFtYWlsTG9jYXRvci5tYWlsTW9kZWwuY2FuQXNzaWduTGFiZWxzKCkpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRjb25zdCBsYWJlbHMgPSBtYWlsTG9jYXRvci5tYWlsTW9kZWwuZ2V0TGFiZWxTdGF0ZXNGb3JNYWlscyhtYWlsTGlzdC5nZXRTZWxlY3RlZEFzQXJyYXkoKSlcblx0XHRjb25zdCBzZWxlY3RlZE1haWxzID0gbWFpbExpc3QuZ2V0U2VsZWN0ZWRBc0FycmF5KClcblxuXHRcdGlmIChpc0VtcHR5KGxhYmVscykgfHwgaXNFbXB0eShzZWxlY3RlZE1haWxzKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgcG9wdXAgPSBuZXcgTGFiZWxzUG9wdXAoXG5cdFx0XHRkb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50LFxuXHRcdFx0Z2V0TW92ZU1haWxCb3VuZHMoKSxcblx0XHRcdHN0eWxlcy5pc0Rlc2t0b3BMYXlvdXQoKSA/IDMwMCA6IDIwMCxcblx0XHRcdG1haWxMb2NhdG9yLm1haWxNb2RlbC5nZXRMYWJlbHNGb3JNYWlscyhzZWxlY3RlZE1haWxzKSxcblx0XHRcdG1haWxMb2NhdG9yLm1haWxNb2RlbC5nZXRMYWJlbFN0YXRlc0Zvck1haWxzKHNlbGVjdGVkTWFpbHMpLFxuXHRcdFx0KGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzKSA9PiBtYWlsTG9jYXRvci5tYWlsTW9kZWwuYXBwbHlMYWJlbHMoc2VsZWN0ZWRNYWlscywgYWRkZWRMYWJlbHMsIHJlbW92ZWRMYWJlbHMpLFxuXHRcdClcblx0XHRwb3B1cC5zaG93KClcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlRm9sZGVyQ29sdW1uKGVkaXRpbmdGb2xkZXJGb3JNYWlsR3JvdXA6IElkIHwgbnVsbCA9IG51bGwsIGRyYXdlckF0dHJzOiBEcmF3ZXJNZW51QXR0cnMpIHtcblx0XHRyZXR1cm4gbmV3IFZpZXdDb2x1bW4oXG5cdFx0XHR7XG5cdFx0XHRcdHZpZXc6ICgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gbShGb2xkZXJDb2x1bW5WaWV3LCB7XG5cdFx0XHRcdFx0XHRkcmF3ZXI6IGRyYXdlckF0dHJzLFxuXHRcdFx0XHRcdFx0YnV0dG9uOiBlZGl0aW5nRm9sZGVyRm9yTWFpbEdyb3VwXG5cdFx0XHRcdFx0XHRcdD8gbnVsbFxuXHRcdFx0XHRcdFx0XHQ6ICFzdHlsZXMuaXNVc2luZ0JvdHRvbU5hdmlnYXRpb24oKSAmJiBpc05ld01haWxBY3Rpb25BdmFpbGFibGUoKVxuXHRcdFx0XHRcdFx0XHQ/IHtcblx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcIm5ld01haWxfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4gdGhpcy5zaG93TmV3TWFpbERpYWxvZygpLmNhdGNoKG9mQ2xhc3MoUGVybWlzc2lvbkVycm9yLCBub09wKSksXG5cdFx0XHRcdFx0XHRcdCAgfVxuXHRcdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdFx0XHRjb250ZW50OiB0aGlzLnJlbmRlckZvbGRlcnNBbmRMYWJlbHMoZWRpdGluZ0ZvbGRlckZvck1haWxHcm91cCksXG5cdFx0XHRcdFx0XHRhcmlhTGFiZWw6IFwiZm9sZGVyVGl0bGVfbGFiZWxcIixcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdGVkaXRpbmdGb2xkZXJGb3JNYWlsR3JvdXAgPyBDb2x1bW5UeXBlLkJhY2tncm91bmQgOiBDb2x1bW5UeXBlLkZvcmVncm91bmQsXG5cdFx0XHR7XG5cdFx0XHRcdG1pbldpZHRoOiBzaXplLmZpcnN0X2NvbF9taW5fd2lkdGgsXG5cdFx0XHRcdG1heFdpZHRoOiBzaXplLmZpcnN0X2NvbF9tYXhfd2lkdGgsXG5cdFx0XHRcdGhlYWRlckNlbnRlcjogXCJmb2xkZXJUaXRsZV9sYWJlbFwiLFxuXHRcdFx0fSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckZvbGRlcnNBbmRMYWJlbHMoZWRpdGluZ0ZvbGRlckZvck1haWxHcm91cDogSWQgfCBudWxsKSB7XG5cdFx0Y29uc3QgZGV0YWlscyA9IGxvY2F0b3IubWFpbGJveE1vZGVsLm1haWxib3hEZXRhaWxzKCkgPz8gW11cblx0XHRyZXR1cm4gW1xuXHRcdFx0Li4uZGV0YWlscy5tYXAoKG1haWxib3hEZXRhaWwpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucmVuZGVyRm9sZGVyc0FuZExhYmVsc0Zvck1haWxib3gobWFpbGJveERldGFpbCwgZWRpdGluZ0ZvbGRlckZvck1haWxHcm91cClcblx0XHRcdH0pLFxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRm9sZGVyc0FuZExhYmVsc0Zvck1haWxib3gobWFpbGJveERldGFpbDogTWFpbGJveERldGFpbCwgZWRpdGluZ0ZvbGRlckZvck1haWxHcm91cDogc3RyaW5nIHwgbnVsbCkge1xuXHRcdGNvbnN0IGluRWRpdE1vZGUgPSBlZGl0aW5nRm9sZGVyRm9yTWFpbEdyb3VwID09PSBtYWlsYm94RGV0YWlsLm1haWxHcm91cC5faWRcblx0XHQvLyBPbmx5IHNob3cgZm9sZGVycyBmb3IgbWFpbGJveCBpbiB3aGljaCBlZGl0IHdhcyBzZWxlY3RlZFxuXHRcdGlmIChlZGl0aW5nRm9sZGVyRm9yTWFpbEdyb3VwICYmICFpbkVkaXRNb2RlKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbShcblx0XHRcdFx0U2lkZWJhclNlY3Rpb24sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lOiBsYW5nLm1ha2VUcmFuc2xhdGlvbihcIm1haWxib3hfbmFtZVwiLCBnZXRNYWlsYm94TmFtZShsb2NhdG9yLmxvZ2lucywgbWFpbGJveERldGFpbCkpLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0dGhpcy5jcmVhdGVNYWlsYm94Rm9sZGVySXRlbXMobWFpbGJveERldGFpbCwgaW5FZGl0TW9kZSwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0RWRpdEZvbGRlcnNEaWFsb2cuc2hvd0VkaXQoKCkgPT4gdGhpcy5yZW5kZXJGb2xkZXJzQW5kTGFiZWxzKG1haWxib3hEZXRhaWwubWFpbEdyb3VwLl9pZCkpXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0bWFpbExvY2F0b3IubWFpbE1vZGVsLmNhbk1hbmFnZUxhYmVscygpXG5cdFx0XHRcdFx0XHQ/IHRoaXMucmVuZGVyTWFpbGJveExhYmVsSXRlbXMobWFpbGJveERldGFpbCwgaW5FZGl0TW9kZSwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdEVkaXRGb2xkZXJzRGlhbG9nLnNob3dFZGl0KCgpID0+IHRoaXMucmVuZGVyRm9sZGVyc0FuZExhYmVscyhtYWlsYm94RGV0YWlsLm1haWxHcm91cC5faWQpKVxuXHRcdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRdLFxuXHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlTWFpbGJveEZvbGRlckl0ZW1zKG1haWxib3hEZXRhaWw6IE1haWxib3hEZXRhaWwsIGluRWRpdE1vZGU6IGJvb2xlYW4sIG9uRWRpdE1haWxib3g6ICgpID0+IHZvaWQpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oTWFpbEZvbGRlcnNWaWV3LCB7XG5cdFx0XHRtYWlsTW9kZWw6IG1haWxMb2NhdG9yLm1haWxNb2RlbCxcblx0XHRcdG1haWxib3hEZXRhaWwsXG5cdFx0XHRleHBhbmRlZEZvbGRlcnM6IHRoaXMuZXhwYW5kZWRTdGF0ZSxcblx0XHRcdG1haWxGb2xkZXJFbGVtZW50SWRUb1NlbGVjdGVkTWFpbElkOiB0aGlzLm1haWxWaWV3TW9kZWwuZ2V0TWFpbEZvbGRlclRvU2VsZWN0ZWRNYWlsKCksXG5cdFx0XHRvbkZvbGRlckNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdGlmICghaW5FZGl0TW9kZSkge1xuXHRcdFx0XHRcdHRoaXMudmlld1NsaWRlci5mb2N1cyh0aGlzLmxpc3RDb2x1bW4pXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRvbkZvbGRlckV4cGFuZGVkOiAoZm9sZGVyLCBzdGF0ZSkgPT4gdGhpcy5zZXRFeHBhbmRlZFN0YXRlKGZvbGRlciwgc3RhdGUpLFxuXHRcdFx0b25TaG93Rm9sZGVyQWRkRWRpdERpYWxvZzogKC4uLmFyZ3MpID0+IHRoaXMuc2hvd0ZvbGRlckFkZEVkaXREaWFsb2coLi4uYXJncyksXG5cdFx0XHRvbkRlbGV0ZUN1c3RvbU1haWxGb2xkZXI6IChmb2xkZXIpID0+IHRoaXMuZGVsZXRlQ3VzdG9tTWFpbEZvbGRlcihtYWlsYm94RGV0YWlsLCBmb2xkZXIpLFxuXHRcdFx0b25Gb2xkZXJEcm9wOiAoZHJvcERhdGEsIGZvbGRlcikgPT4ge1xuXHRcdFx0XHRpZiAoZHJvcERhdGEuZHJvcFR5cGUgPT0gRHJvcFR5cGUuTWFpbCkge1xuXHRcdFx0XHRcdHRoaXMuaGFuZGxlRm9sZGVyTWFpbERyb3AoZHJvcERhdGEsIGZvbGRlcilcblx0XHRcdFx0fSBlbHNlIGlmIChkcm9wRGF0YS5kcm9wVHlwZSA9PSBEcm9wVHlwZS5FeHRlcm5hbEZpbGUpIHtcblx0XHRcdFx0XHR0aGlzLmhhbmRlRm9sZGVyRmlsZURyb3AoZHJvcERhdGEsIG1haWxib3hEZXRhaWwsIGZvbGRlcilcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGluRWRpdE1vZGUsXG5cdFx0XHRvbkVkaXRNYWlsYm94LFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHNldEV4cGFuZGVkU3RhdGUoZm9sZGVyOiBNYWlsRm9sZGVyLCBjdXJyZW50RXhwYW5zaW9uU3RhdGU6IGJvb2xlYW4pIHtcblx0XHRpZiAoY3VycmVudEV4cGFuc2lvblN0YXRlKSB7XG5cdFx0XHR0aGlzLmV4cGFuZGVkU3RhdGUuZGVsZXRlKGdldEVsZW1lbnRJZChmb2xkZXIpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmV4cGFuZGVkU3RhdGUuYWRkKGdldEVsZW1lbnRJZChmb2xkZXIpKVxuXHRcdH1cblx0XHRkZXZpY2VDb25maWcuc2V0RXhwYW5kZWRGb2xkZXJzKGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlcklkLCBbLi4udGhpcy5leHBhbmRlZFN0YXRlXSlcblx0fVxuXG5cdHByb3RlY3RlZCBvbk5ld1VybChhcmdzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCByZXF1ZXN0ZWRQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAocmVxdWVzdGVkUGF0aC5zdGFydHNXaXRoKFwiL21haWx0b1wiKSkge1xuXHRcdFx0aWYgKGxvY2F0aW9uLmhhc2gubGVuZ3RoID4gNSkge1xuXHRcdFx0XHRsZXQgdXJsID0gbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoNSlcblx0XHRcdFx0bGV0IGRlY29kZWRVcmwgPSBkZWNvZGVVUklDb21wb25lbnQodXJsKVxuXHRcdFx0XHRQcm9taXNlLmFsbChbbG9jYXRvci5tYWlsYm94TW9kZWwuZ2V0VXNlck1haWxib3hEZXRhaWxzKCksIGltcG9ydChcIi4uL2VkaXRvci9NYWlsRWRpdG9yXCIpXSkudGhlbihcblx0XHRcdFx0XHQoW21haWxib3hEZXRhaWxzLCB7IG5ld01haWx0b1VybE1haWxFZGl0b3IgfV0pID0+IHtcblx0XHRcdFx0XHRcdG5ld01haWx0b1VybE1haWxFZGl0b3IoZGVjb2RlZFVybCwgZmFsc2UsIG1haWxib3hEZXRhaWxzKVxuXHRcdFx0XHRcdFx0XHQudGhlbigoZWRpdG9yKSA9PiBlZGl0b3Iuc2hvdygpKVxuXHRcdFx0XHRcdFx0XHQuY2F0Y2gob2ZDbGFzcyhDYW5jZWxsZWRFcnJvciwgbm9PcCkpXG5cdFx0XHRcdFx0XHRoaXN0b3J5LnB1c2hTdGF0ZShcIlwiLCBkb2N1bWVudC50aXRsZSwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSAvLyByZW1vdmUgIyBmcm9tIHVybFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoaXNBcHAoKSkge1xuXHRcdFx0bGV0IHVzZXJHcm91cEluZm8gPSBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXJHcm91cEluZm9cblx0XHRcdGxvY2F0b3IucHVzaFNlcnZpY2UuY2xvc2VQdXNoTm90aWZpY2F0aW9uKFxuXHRcdFx0XHR1c2VyR3JvdXBJbmZvLm1haWxBZGRyZXNzQWxpYXNlcy5tYXAoKGFsaWFzKSA9PiBhbGlhcy5tYWlsQWRkcmVzcykuY29uY2F0KHVzZXJHcm91cEluZm8ubWFpbEFkZHJlc3MgfHwgW10pLFxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgYXJncy5tYWlsID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRjb25zdCBbbWFpbExpc3RJZCwgbWFpbElkXSA9IGFyZ3MubWFpbC5zcGxpdChcIixcIilcblx0XHRcdGlmIChtYWlsTGlzdElkICYmIG1haWxJZCkge1xuXHRcdFx0XHR0aGlzLm1haWxWaWV3TW9kZWwuc2hvd1N0aWNreU1haWwoW21haWxMaXN0SWQsIG1haWxJZF0sICgpID0+XG5cdFx0XHRcdFx0c2hvd1NuYWNrQmFyKHtcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IFwibWFpbE1vdmVkX21zZ1wiLFxuXHRcdFx0XHRcdFx0YnV0dG9uOiB7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcIm9rX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogbm9PcCxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdClcblx0XHRcdFx0dGhpcy52aWV3U2xpZGVyLmZvY3VzKHRoaXMubWFpbENvbHVtbilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc2hvd01haWwoYXJncylcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zaG93TWFpbChhcmdzKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc2hvd01haWwoYXJnczogUmVjb3JkPHN0cmluZywgYW55Pikge1xuXHRcdHRoaXMubWFpbFZpZXdNb2RlbC5zaG93TWFpbFdpdGhNYWlsU2V0SWQoYXJncy5mb2xkZXJJZCwgYXJncy5tYWlsSWQpXG5cdFx0aWYgKHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpICYmICFhcmdzLm1haWxJZCAmJiB0aGlzLnZpZXdTbGlkZXIuZm9jdXNlZENvbHVtbiA9PT0gdGhpcy5tYWlsQ29sdW1uKSB7XG5cdFx0XHR0aGlzLnZpZXdTbGlkZXIuZm9jdXModGhpcy5saXN0Q29sdW1uKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlRmlsZURyb3AoZmlsZURyb3A6IEZpbGVEcm9wRGF0YSkge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBbbWFpbGJveCwgZGF0YUZpbGVzLCB7IGFwcGVuZEVtYWlsU2lnbmF0dXJlIH0sIHsgbmV3TWFpbEVkaXRvckZyb21UZW1wbGF0ZSB9XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0dGhpcy5tYWlsVmlld01vZGVsLmdldE1haWxib3hEZXRhaWxzKCksXG5cdFx0XHRcdHJlYWRMb2NhbEZpbGVzKGZpbGVEcm9wLmZpbGVzKSxcblx0XHRcdFx0aW1wb3J0KFwiLi4vc2lnbmF0dXJlL1NpZ25hdHVyZVwiKSxcblx0XHRcdFx0aW1wb3J0KFwiLi4vZWRpdG9yL01haWxFZGl0b3JcIiksXG5cdFx0XHRdKVxuXG5cdFx0XHRpZiAobWFpbGJveCAhPSBudWxsKSB7XG5cdFx0XHRcdGNvbnN0IGRpYWxvZyA9IGF3YWl0IG5ld01haWxFZGl0b3JGcm9tVGVtcGxhdGUobWFpbGJveCwge30sIFwiXCIsIGFwcGVuZEVtYWlsU2lnbmF0dXJlKFwiXCIsIGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMpLCBkYXRhRmlsZXMpXG5cdFx0XHRcdGRpYWxvZy5zaG93KClcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoIShlIGluc3RhbmNlb2YgUGVybWlzc2lvbkVycm9yKSkgdGhyb3cgZVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlRm9sZGVyTWFpbERyb3AoZHJvcERhdGE6IE1haWxEcm9wRGF0YSwgZm9sZGVyOiBNYWlsRm9sZGVyKSB7XG5cdFx0Y29uc3QgeyBtYWlsSWQgfSA9IGRyb3BEYXRhXG5cdFx0aWYgKCF0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0bGV0IG1haWxzVG9Nb3ZlOiBNYWlsW10gPSBbXVxuXG5cdFx0Ly8gdGhlIGRyb3BwZWQgbWFpbCBpcyBhbW9uZyB0aGUgc2VsZWN0ZWQgbWFpbHMsIG1vdmUgYWxsIHNlbGVjdGVkIG1haWxzXG5cdFx0aWYgKHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWwuaXNJdGVtU2VsZWN0ZWQobWFpbElkKSkge1xuXHRcdFx0bWFpbHNUb01vdmUgPSB0aGlzLm1haWxWaWV3TW9kZWwubGlzdE1vZGVsLmdldFNlbGVjdGVkQXNBcnJheSgpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGVudGl0eSA9IHRoaXMubWFpbFZpZXdNb2RlbC5saXN0TW9kZWwuZ2V0TWFpbChtYWlsSWQpXG5cblx0XHRcdGlmIChlbnRpdHkpIHtcblx0XHRcdFx0bWFpbHNUb01vdmUucHVzaChlbnRpdHkpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bW92ZU1haWxzKHtcblx0XHRcdG1haWxib3hNb2RlbDogbG9jYXRvci5tYWlsYm94TW9kZWwsXG5cdFx0XHRtYWlsTW9kZWw6IG1haWxMb2NhdG9yLm1haWxNb2RlbCxcblx0XHRcdG1haWxzOiBtYWlsc1RvTW92ZSxcblx0XHRcdHRhcmdldE1haWxGb2xkZXI6IGZvbGRlcixcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kZUZvbGRlckZpbGVEcm9wKGRyb3BEYXRhOiBGaWxlRHJvcERhdGEsIG1haWxib3hEZXRhaWw6IE1haWxib3hEZXRhaWwsIG1haWxGb2xkZXI6IE1haWxGb2xkZXIpIHtcblx0XHRmdW5jdGlvbiBkcm9wcGVkT25seU1haWxGaWxlcyhmaWxlczogQXJyYXk8RmlsZT4pOiBib29sZWFuIHtcblx0XHRcdC8vIHRoZXJlJ3Mgc2ltaWxhciBsb2dpYyBvbiB0aGUgQXR0YWNobWVudEJ1YmJsZSwgYnV0IGZvciBuYXRpdmVseSBzaGFyZWQgZmlsZXMuXG5cdFx0XHRyZXR1cm4gZmlsZXMuZXZlcnkoKGYpID0+IGYubmFtZS5lbmRzV2l0aChcIi5lbWxcIikgfHwgZi5uYW1lLmVuZHNXaXRoKFwiLm1ib3hcIikpXG5cdFx0fVxuXG5cdFx0YXdhaXQgdGhpcy5oYW5kbGVGaWxlRHJvcChkcm9wRGF0YSlcblxuXHRcdC8vIERuRCBtYWlsIGltcG9ydGluZyBpcyBkaXNhYmxlZCBmb3Igbm93IGFzIHRoZSBNYWlsSW1wb3J0ZXIgbWlnaHQgbm90IGhhdmVcblx0XHQvLyBiZWVuIGluaXRpYWxpemVkIHlldC5cblx0XHQvL1xuXHRcdC8vIC8vIGltcG9ydGluZyBtYWlscyBpcyBjdXJyZW50bHkgb25seSBhbGxvd2VkIG9uIHBsYW4gTEVHRU5EIGFuZCBVTkxJTUlURURcblx0XHQvLyBjb25zdCBjdXJyZW50UGxhblR5cGUgPSBhd2FpdCBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmdldFBsYW5UeXBlKClcblx0XHQvLyBjb25zdCBpc0hpZ2hlc3RUaWVyUGxhbiA9IEhpZ2hlc3RUaWVyUGxhbnMuaW5jbHVkZXMoY3VycmVudFBsYW5UeXBlKVxuXHRcdC8vXG5cdFx0Ly8gbGV0IGltcG9ydEFjdGlvbjogeyB0ZXh0OiBUcmFuc2xhdGlvblRleHQ7IHZhbHVlOiBib29sZWFuIH0gPSB7XG5cdFx0Ly8gXHR0ZXh0OiBcImltcG9ydF9hY3Rpb25cIixcblx0XHQvLyBcdHZhbHVlOiB0cnVlLFxuXHRcdC8vIH1cblx0XHQvLyBsZXQgYXR0YWNoRmlsZXNBY3Rpb246IHsgdGV4dDogVHJhbnNsYXRpb25UZXh0OyB2YWx1ZTogYm9vbGVhbiB9ID0ge1xuXHRcdC8vIFx0dGV4dDogXCJhdHRhY2hGaWxlc19hY3Rpb25cIixcblx0XHQvLyBcdHZhbHVlOiBmYWxzZSxcblx0XHQvLyB9XG5cdFx0Ly8gY29uc3Qgd2lsbEltcG9ydCA9XG5cdFx0Ly8gXHRpc0hpZ2hlc3RUaWVyUGxhbiAmJiBkcm9wcGVkT25seU1haWxGaWxlcyhkcm9wRGF0YS5maWxlcykgJiYgKGF3YWl0IERpYWxvZy5jaG9pY2UoXCJlbWxPck1ib3hJblNoYXJpbmdGaWxlc19tc2dcIiwgW2ltcG9ydEFjdGlvbiwgYXR0YWNoRmlsZXNBY3Rpb25dKSlcblx0XHQvL1xuXHRcdC8vIGlmICghd2lsbEltcG9ydCkge1xuXHRcdC8vIFx0YXdhaXQgdGhpcy5oYW5kbGVGaWxlRHJvcChkcm9wRGF0YSlcblx0XHQvLyB9IGVsc2UgaWYgKG1haWxGb2xkZXIuX293bmVyR3JvdXAgJiYgdGhpcy5tYWlsSW1wb3J0ZXIpIHtcblx0XHQvLyBcdGF3YWl0IHRoaXMubWFpbEltcG9ydGVyLm9uU3RhcnRCdG5DbGljayhcblx0XHQvLyBcdFx0bWFpbEZvbGRlcixcblx0XHQvLyBcdFx0ZHJvcERhdGEuZmlsZXMubWFwKChmaWxlKSA9PiB3aW5kb3cubmF0aXZlQXBwLmdldFBhdGhGb3JGaWxlKGZpbGUpKSxcblx0XHQvLyBcdClcblx0XHQvLyB9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHNob3dOZXdNYWlsRGlhbG9nKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG1haWxib3hEZXRhaWxzID0gYXdhaXQgdGhpcy5tYWlsVmlld01vZGVsLmdldE1haWxib3hEZXRhaWxzKClcblx0XHRpZiAobWFpbGJveERldGFpbHMgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGNvbnN0IHsgbmV3TWFpbEVkaXRvciB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vZWRpdG9yL01haWxFZGl0b3JcIilcblx0XHRjb25zdCBkaWFsb2cgPSBhd2FpdCBuZXdNYWlsRWRpdG9yKG1haWxib3hEZXRhaWxzKVxuXHRcdGRpYWxvZy5zaG93KClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZGVsZXRlQ3VzdG9tTWFpbEZvbGRlcihtYWlsYm94RGV0YWlsOiBNYWlsYm94RGV0YWlsLCBmb2xkZXI6IE1haWxGb2xkZXIpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoZm9sZGVyLmZvbGRlclR5cGUgIT09IE1haWxTZXRLaW5kLkNVU1RPTSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGRlbGV0ZSBub24tY3VzdG9tIGZvbGRlcjogXCIgKyBTdHJpbmcoZm9sZGVyLl9pZCkpXG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIGFueSBzZWxlY3Rpb24gdG8gYXZvaWQgdGhhdCB0aGUgbmV4dCBtYWlsIGlzIGxvYWRlZCBhbmQgc2VsZWN0ZWQgZm9yIGVhY2ggZGVsZXRlZCBtYWlsIGV2ZW50XG5cdFx0dGhpcy5tYWlsVmlld01vZGVsPy5saXN0TW9kZWw/LnNlbGVjdE5vbmUoKVxuXHRcdGlmIChtYWlsYm94RGV0YWlsLm1haWxib3guZm9sZGVycyA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgZm9sZGVycyA9IGF3YWl0IG1haWxMb2NhdG9yLm1haWxNb2RlbC5nZXRNYWlsYm94Rm9sZGVyc0ZvcklkKG1haWxib3hEZXRhaWwubWFpbGJveC5mb2xkZXJzLl9pZClcblxuXHRcdGlmIChpc1NwYW1PclRyYXNoRm9sZGVyKGZvbGRlcnMsIGZvbGRlcikpIHtcblx0XHRcdGNvbnN0IGNvbmZpcm1lZCA9IGF3YWl0IERpYWxvZy5jb25maXJtKFxuXHRcdFx0XHRsYW5nLmdldFRyYW5zbGF0aW9uKFwiY29uZmlybURlbGV0ZUZpbmFsbHlDdXN0b21Gb2xkZXJfbXNnXCIsIHtcblx0XHRcdFx0XHRcInsxfVwiOiBnZXRGb2xkZXJOYW1lKGZvbGRlciksXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdFx0aWYgKCFjb25maXJtZWQpIHJldHVyblxuXHRcdFx0YXdhaXQgbWFpbExvY2F0b3IubWFpbE1vZGVsLmZpbmFsbHlEZWxldGVDdXN0b21NYWlsRm9sZGVyKGZvbGRlcilcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgY29uZmlybWVkID0gYXdhaXQgRGlhbG9nLmNvbmZpcm0oXG5cdFx0XHRcdGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJjb25maXJtRGVsZXRlQ3VzdG9tRm9sZGVyX21zZ1wiLCB7XG5cdFx0XHRcdFx0XCJ7MX1cIjogZ2V0Rm9sZGVyTmFtZShmb2xkZXIpLFxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHRcdGlmICghY29uZmlybWVkKSByZXR1cm5cblx0XHRcdGF3YWl0IG1haWxMb2NhdG9yLm1haWxNb2RlbC50cmFzaEZvbGRlckFuZFN1YmZvbGRlcnMoZm9sZGVyKVxuXHRcdH1cblx0fVxuXG5cdGxvZ291dCgpIHtcblx0XHRtLnJvdXRlLnNldChcIi9cIilcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdG9nZ2xlVW5yZWFkTWFpbHMobWFpbHM6IE1haWxbXSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChtYWlscy5sZW5ndGggPT0gMCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdC8vIHNldCBhbGwgc2VsZWN0ZWQgZW1haWxzIHRvIHRoZSBvcHBvc2l0ZSBvZiB0aGUgZmlyc3QgZW1haWwncyB1bnJlYWQgc3RhdGVcblx0XHRhd2FpdCBtYWlsTG9jYXRvci5tYWlsTW9kZWwubWFya01haWxzKG1haWxzLCAhbWFpbHNbMF0udW5yZWFkKVxuXHR9XG5cblx0cHJpdmF0ZSBkZWxldGVNYWlscyhtYWlsczogTWFpbFtdKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0cmV0dXJuIHByb21wdEFuZERlbGV0ZU1haWxzKG1haWxMb2NhdG9yLm1haWxNb2RlbCwgbWFpbHMsIG5vT3ApXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHNob3dGb2xkZXJBZGRFZGl0RGlhbG9nKG1haWxHcm91cElkOiBJZCwgZm9sZGVyOiBNYWlsRm9sZGVyIHwgbnVsbCwgcGFyZW50Rm9sZGVyOiBNYWlsRm9sZGVyIHwgbnVsbCkge1xuXHRcdGNvbnN0IG1haWxib3hEZXRhaWwgPSBhd2FpdCBsb2NhdG9yLm1haWxib3hNb2RlbC5nZXRNYWlsYm94RGV0YWlsc0Zvck1haWxHcm91cChtYWlsR3JvdXBJZClcblx0XHRhd2FpdCBzaG93RWRpdEZvbGRlckRpYWxvZyhtYWlsYm94RGV0YWlsLCBmb2xkZXIsIHBhcmVudEZvbGRlcilcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgc2hvd0xhYmVsQWRkRGlhbG9nKG1haWxib3g6IE1haWxCb3gpIHtcblx0XHRhd2FpdCBzaG93RWRpdExhYmVsRGlhbG9nKG1haWxib3gsIHRoaXMubWFpbFZpZXdNb2RlbCwgbnVsbClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgc2hvd0xhYmVsRWRpdERpYWxvZyhsYWJlbDogTWFpbEZvbGRlcikge1xuXHRcdGF3YWl0IHNob3dFZGl0TGFiZWxEaWFsb2cobnVsbCwgdGhpcy5tYWlsVmlld01vZGVsLCBsYWJlbClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgc2hvd0xhYmVsRGVsZXRlRGlhbG9nKGxhYmVsOiBNYWlsRm9sZGVyKSB7XG5cdFx0Y29uc3QgY29uZmlybWVkID0gYXdhaXQgRGlhbG9nLmNvbmZpcm0oXG5cdFx0XHRsYW5nLmdldFRyYW5zbGF0aW9uKFwiY29uZmlybURlbGV0ZUxhYmVsX21zZ1wiLCB7XG5cdFx0XHRcdFwiezF9XCI6IGxhYmVsLm5hbWUsXG5cdFx0XHR9KSxcblx0XHQpXG5cdFx0aWYgKCFjb25maXJtZWQpIHJldHVyblxuXHRcdGF3YWl0IHRoaXMubWFpbFZpZXdNb2RlbC5kZWxldGVMYWJlbChsYWJlbClcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyTWFpbGJveExhYmVsSXRlbXMobWFpbGJveERldGFpbDogTWFpbGJveERldGFpbCwgaW5FZGl0TW9kZTogYm9vbGVhbiwgb25FZGl0TWFpbGJveDogKCkgPT4gdm9pZCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0bShcblx0XHRcdFx0U2lkZWJhclNlY3Rpb24sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRuYW1lOiBcImxhYmVsc19sYWJlbFwiLFxuXHRcdFx0XHRcdGJ1dHRvbjogaW5FZGl0TW9kZSA/IHRoaXMucmVuZGVyQWRkTGFiZWxCdXR0b24obWFpbGJveERldGFpbCkgOiB0aGlzLnJlbmRlckVkaXRNYWlsYm94QnV0dG9uKG9uRWRpdE1haWxib3gpLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0bShcIi5mbGV4LmNvbFwiLCBbXG5cdFx0XHRcdFx0XHRBcnJheS5mcm9tKG1haWxMb2NhdG9yLm1haWxNb2RlbC5nZXRMYWJlbHNCeUdyb3VwSWQobWFpbGJveERldGFpbC5tYWlsR3JvdXAuX2lkKS52YWx1ZXMoKSkubWFwKChsYWJlbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBwYXRoID0gYCR7TUFJTF9QUkVGSVh9LyR7Z2V0RWxlbWVudElkKGxhYmVsKX1gXG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIG0oU2lkZWJhclNlY3Rpb25Sb3csIHtcblx0XHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5MYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRpY29uQ29sb3I6IGdldExhYmVsQ29sb3IobGFiZWwuY29sb3IpLFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBsYW5nLm1ha2VUcmFuc2xhdGlvbihgZm9sZGVyOiR7bGFiZWwubmFtZX1gLCBsYWJlbC5uYW1lKSxcblx0XHRcdFx0XHRcdFx0XHRwYXRoLFxuXHRcdFx0XHRcdFx0XHRcdGlzU2VsZWN0ZWRQcmVmaXg6IGluRWRpdE1vZGUgPyBmYWxzZSA6IHBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IGluRWRpdE1vZGUsXG5cdFx0XHRcdFx0XHRcdFx0b25DbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFpbkVkaXRNb2RlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMudmlld1NsaWRlci5mb2N1cyh0aGlzLmxpc3RDb2x1bW4pXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRhbHdheXNTaG93TW9yZUJ1dHRvbjogaW5FZGl0TW9kZSxcblx0XHRcdFx0XHRcdFx0XHRtb3JlQnV0dG9uOiBhdHRhY2hEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRcdFx0XHRtYWluQnV0dG9uQXR0cnM6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuTW9yZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGl0bGU6IFwibW9yZV9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoaWxkQXR0cnM6ICgpID0+IFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcImVkaXRfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuRWRpdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5zaG93TGFiZWxFZGl0RGlhbG9nKGxhYmVsKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJkZWxldGVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuVHJhc2gsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuc2hvd0xhYmVsRGVsZXRlRGlhbG9nKGxhYmVsKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdF0sXG5cdFx0XHQpLFxuXHRcdFx0bShSb3dCdXR0b24sIHtcblx0XHRcdFx0bGFiZWw6IFwiYWRkTGFiZWxfYWN0aW9uXCIsXG5cdFx0XHRcdGljb246IEljb25zLkFkZCxcblx0XHRcdFx0Y2xhc3M6IFwiZm9sZGVyLXJvdyBtbHItYnV0dG9uIGJvcmRlci1yYWRpdXMtc21hbGxcIixcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHR3aWR0aDogYGNhbGMoMTAwJSAtICR7cHgoc2l6ZS5ocGFkX2J1dHRvbiAqIDIpfSlgLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5zaG93TGFiZWxBZGREaWFsb2cobWFpbGJveERldGFpbC5tYWlsYm94KVxuXHRcdFx0XHR9LFxuXHRcdFx0fSksXG5cdFx0XVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJFZGl0TWFpbGJveEJ1dHRvbihvbkVkaXRNYWlsYm94OiAoKSA9PiB1bmtub3duKSB7XG5cdFx0cmV0dXJuIG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0aWNvbjogSWNvbnMuRWRpdCxcblx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdHRpdGxlOiBcImVkaXRfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogb25FZGl0TWFpbGJveCxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJBZGRMYWJlbEJ1dHRvbihtYWlsYm94RGV0YWlsOiBNYWlsYm94RGV0YWlsKSB7XG5cdFx0cmV0dXJuIG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0dGl0bGU6IFwiYWRkTGFiZWxfYWN0aW9uXCIsXG5cdFx0XHRpY29uOiBJY29ucy5BZGQsXG5cdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNob3dMYWJlbEFkZERpYWxvZyhtYWlsYm94RGV0YWlsLm1haWxib3gpXG5cdFx0XHR9LFxuXHRc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
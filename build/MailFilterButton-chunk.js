import { __toESM } from "./chunk-chunk.js";
import { assertMainOrNode, isAndroidApp, isApp, isDesktop, isIOSApp } from "./Env-chunk.js";
import { client, companyTeamLabel } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { LazyLoaded, assertNonNull, assertNotNull, defer, isNotNull, noOp, ofClass, resolveMaybeLazy } from "./dist2-chunk.js";
import { InfoLink, lang } from "./LanguageViewModel-chunk.js";
import { styles } from "./styles-chunk.js";
import { theme } from "./theme-chunk.js";
import { CalendarAttendeeStatus, CalendarMethod, EncryptionAuthStatus, FeatureType, InboxRuleType, Keys, MAX_LABELS_PER_MAIL, MailAuthenticationStatus, MailSetKind, SpamRuleFieldType, SpamRuleType, TabIndex } from "./TutanotaConstants-chunk.js";
import { focusNext, focusPrevious, isKeyPressed, keyManager } from "./KeyManager-chunk.js";
import { windowFacade } from "./WindowFacade-chunk.js";
import { modal } from "./RootView-chunk.js";
import { px, size } from "./size-chunk.js";
import { elementIdPart, getElementId, isSameId } from "./EntityUtils-chunk.js";
import { findAttendeeInAddresses } from "./CommonCalendarUtils-chunk.js";
import { createEmailSenderListElement } from "./TypeRefs2-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { CancelledError } from "./CancelledError-chunk.js";
import { BaseButton, Button, ButtonType } from "./Button-chunk.js";
import { Icons } from "./Icons-chunk.js";
import { DROPDOWN_MARGIN, Dialog, DialogType, Dropdown, canSeeTutaLinks, createAsyncDropdown, createDropdown, getCoordsOfMouseOrTouchEvent, showDropdown, showDropdownAtPosition } from "./Dialog-chunk.js";
import { BootIcons, Icon, IconSize, progressIcon } from "./Icon-chunk.js";
import { AriaRole, liveDataAttrs } from "./AriaUtils-chunk.js";
import { IconButton } from "./IconButton-chunk.js";
import { formatDateWithWeekday, formatDateWithWeekdayAndYear, formatStorageSize, formatTime } from "./Formatter-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { UserError } from "./UserError-chunk.js";
import { showProgressDialog } from "./ProgressDialog-chunk.js";
import { createNewContact, getMailAddressDisplayText } from "./SharedMailUtils-chunk.js";
import { ToggleButton } from "./ToggleButton-chunk.js";
import { ColumnEmptyMessageBox, IconMessageBox } from "./ColumnEmptyMessageBox-chunk.js";
import { BannerType, InfoBanner } from "./InfoBanner-chunk.js";
import { ExpanderButton, ExpanderPanel } from "./Expander-chunk.js";
import { copyToClipboard } from "./ClipboardUtils-chunk.js";
import { showUserError } from "./ErrorHandlerImpl-chunk.js";
import { ReplyResult } from "./CalendarInvites-chunk.js";
import { LabelState, mailLocator } from "./mailLocator-chunk.js";
import { MobileBottomActionBar, responsiveCardHMargin, responsiveCardHPadding } from "./SidebarSectionRow-chunk.js";
import { isNewMailActionAvailable } from "./NavFunctions-chunk.js";
import { ColumnWidth, Table } from "./Table-chunk.js";
import { AttachmentBubble, getAttachmentType } from "./AttachmentBubble-chunk.js";
import { PinchZoom, getConfidentialIcon, getFolderIconByType, isTutanotaTeamMail, promptAndDeleteMails, replaceCidsWithInlineImages, showMoveMailsDropdown } from "./MailGuiUtils-chunk.js";
import { allInSameMailbox, getExistingRuleForType } from "./MailUtils-chunk.js";
import { ContentBlockingStatus, MailFilterType, editDraft, exportMails, isRepliedTo, mailViewerMoreActions, showHeaderDialog, showSourceDialog } from "./MailViewerViewModel-chunk.js";
import { Badge } from "./Badge-chunk.js";
import { Label, getLabelColor } from "./MailRow-chunk.js";

//#region src/mail-app/mail/view/MultiItemViewer.ts
assertMainOrNode();
var MultiItemViewer = class {
	view({ attrs }) {
		const { selectedEntities } = attrs;
		return [mithril_default(".flex.col.fill-absolute", mithril_default(".flex-grow.rel.overflow-hidden", mithril_default(ColumnEmptyMessageBox, {
			message: attrs.getSelectionMessage(selectedEntities),
			icon: BootIcons.Mail,
			color: theme.content_message_bg,
			backgroundColor: theme.navigation_bg,
			bottomContent: this.renderEmptyMessageButtons(attrs)
		})))];
	}
	renderEmptyMessageButtons({ loadingAll, stopLoadAll, selectedEntities, selectNone, loadAll }) {
		return loadingAll === "loading" ? mithril_default(".flex.items-center", [mithril_default(Button, {
			label: "cancel_action",
			type: ButtonType.Secondary,
			click: () => {
				stopLoadAll();
			}
		}), mithril_default(".flex.items-center.plr-button", progressIcon())]) : selectedEntities.length === 0 ? null : mithril_default(".flex", [mithril_default(Button, {
			label: "cancel_action",
			type: ButtonType.Secondary,
			click: () => {
				selectNone();
			}
		}), loadingAll === "can_load" ? mithril_default(Button, {
			label: "loadAll_action",
			type: ButtonType.Secondary,
			click: () => {
				loadAll();
			}
		}) : null]);
	}
};
function getMailSelectionMessage(selectedEntities) {
	let nbrOfSelectedMails = selectedEntities.length;
	if (nbrOfSelectedMails === 0) return lang.getTranslation("noMail_msg");
else if (nbrOfSelectedMails === 1) return lang.getTranslation("oneMailSelected_msg");
else return lang.getTranslation("nbrOfMailsSelected_msg", { "{1}": nbrOfSelectedMails });
}

//#endregion
//#region src/mail-app/mail/view/LabelsPopup.ts
var LabelsPopup = class {
	dom = null;
	isMaxLabelsReached;
	constructor(sourceElement, origin, width, labelsForMails, labels, onLabelsApplied) {
		this.sourceElement = sourceElement;
		this.origin = origin;
		this.width = width;
		this.labelsForMails = labelsForMails;
		this.labels = labels;
		this.onLabelsApplied = onLabelsApplied;
		this.view = this.view.bind(this);
		this.oncreate = this.oncreate.bind(this);
		this.isMaxLabelsReached = this.checkIsMaxLabelsReached();
	}
	async hideAnimation() {}
	onClose() {
		modal.remove(this);
	}
	shortcuts() {
		return this.shortCuts;
	}
	backgroundClick(e) {
		modal.remove(this);
	}
	popState(e) {
		return true;
	}
	callingElement() {
		return this.sourceElement;
	}
	view() {
		return mithril_default(".flex.col.elevated-bg.abs.dropdown-shadow.pt-s.border-radius", {
			tabindex: TabIndex.Programmatic,
			role: AriaRole.Menu
		}, [
			mithril_default(".pb-s.scroll", this.labels.map((labelState) => {
				const { label, state } = labelState;
				const color = theme.content_button;
				const canToggleLabel = state === LabelState.Applied || state === LabelState.AppliedToSome || !this.isMaxLabelsReached;
				const opacity = !canToggleLabel ? .5 : undefined;
				return mithril_default("label-item.flex.items-center.plr.state-bg.cursor-pointer", {
					"data-labelid": getElementId(label),
					role: AriaRole.MenuItemCheckbox,
					tabindex: TabIndex.Default,
					"aria-checked": ariaCheckedForState(state),
					"aria-disabled": !canToggleLabel,
					onclick: canToggleLabel ? () => this.toggleLabel(labelState) : noOp
				}, [mithril_default(Icon, {
					icon: this.iconForState(state),
					size: IconSize.Medium,
					style: {
						fill: getLabelColor(label.color),
						opacity
					}
				}), mithril_default(".button-height.flex.items-center.ml.overflow-hidden", { style: {
					color,
					opacity
				} }, mithril_default(".text-ellipsis", label.name))]);
			})),
			this.isMaxLabelsReached && mithril_default(".small.center.pb-s", lang.get("maximumLabelsPerMailReached_msg")),
			mithril_default(BaseButton, {
				label: "apply_action",
				text: lang.get("apply_action"),
				class: "limit-width noselect bg-transparent button-height text-ellipsis content-accent-fg flex items-center plr-button button-content justify-center border-top state-bg",
				onclick: () => {
					this.applyLabels();
				}
			}),
			mithril_default(BaseButton, {
				label: "close_alt",
				text: lang.get("close_alt"),
				class: "hidden-until-focus content-accent-fg button-content",
				onclick: () => {
					modal.remove(this);
				}
			})
		]);
	}
	iconForState(state) {
		switch (state) {
			case LabelState.AppliedToSome: return Icons.LabelPartial;
			case LabelState.Applied: return Icons.Label;
			case LabelState.NotApplied: return Icons.LabelOutline;
		}
	}
	checkIsMaxLabelsReached() {
		const { addedLabels, removedLabels } = this.getSortedLabels();
		if (addedLabels.length >= MAX_LABELS_PER_MAIL) return true;
		for (const [, labels] of this.labelsForMails) {
			const labelsOnMail = new Set(labels.map((label) => getElementId(label)));
			for (const label of removedLabels) labelsOnMail.delete(getElementId(label));
			if (labelsOnMail.size >= MAX_LABELS_PER_MAIL) return true;
			for (const label of addedLabels) {
				labelsOnMail.add(getElementId(label));
				if (labelsOnMail.size >= MAX_LABELS_PER_MAIL) return true;
			}
		}
		return false;
	}
	getSortedLabels() {
		const removedLabels = [];
		const addedLabels = [];
		for (const { label, state } of this.labels) if (state === LabelState.Applied) addedLabels.push(label);
else if (state === LabelState.NotApplied) removedLabels.push(label);
		return {
			addedLabels,
			removedLabels
		};
	}
	applyLabels() {
		const { addedLabels, removedLabels } = this.getSortedLabels();
		this.onLabelsApplied(addedLabels, removedLabels);
		modal.remove(this);
	}
	oncreate(vnode) {
		this.dom = vnode.dom;
		const displayedLabels = Math.min(this.labels.length, 6);
		const height = (displayedLabels + 1) * size.button_height + size.vpad_small * 2;
		showDropdown(this.origin, this.dom, height, this.width).then(() => {
			const firstLabel = vnode.dom.getElementsByTagName("label-item").item(0);
			if (firstLabel !== null) firstLabel.focus();
else vnode.dom.focus();
		});
	}
	shortCuts = [
		{
			key: Keys.ESC,
			exec: () => this.onClose(),
			help: "close_alt"
		},
		{
			key: Keys.TAB,
			shift: true,
			exec: () => this.dom ? focusPrevious(this.dom) : false,
			help: "selectPrevious_action"
		},
		{
			key: Keys.TAB,
			shift: false,
			exec: () => this.dom ? focusNext(this.dom) : false,
			help: "selectNext_action"
		},
		{
			key: Keys.UP,
			exec: () => this.dom ? focusPrevious(this.dom) : false,
			help: "selectPrevious_action"
		},
		{
			key: Keys.DOWN,
			exec: () => this.dom ? focusNext(this.dom) : false,
			help: "selectNext_action"
		},
		{
			key: Keys.RETURN,
			exec: () => this.applyLabels(),
			help: "ok_action"
		},
		{
			key: Keys.SPACE,
			exec: () => {
				const labelId = document.activeElement?.getAttribute("data-labelid");
				if (labelId) {
					const labelItem = this.labels.find((item) => getElementId(item.label) === labelId);
					if (labelItem) this.toggleLabel(labelItem);
				} else return true;
			},
			help: "ok_action"
		}
	];
	show() {
		modal.displayUnique(this, false);
	}
	toggleLabel(labelState) {
		switch (labelState.state) {
			case LabelState.AppliedToSome:
				labelState.state = this.isMaxLabelsReached ? LabelState.NotApplied : LabelState.Applied;
				break;
			case LabelState.NotApplied:
				labelState.state = LabelState.Applied;
				break;
			case LabelState.Applied:
				labelState.state = LabelState.NotApplied;
				break;
		}
		this.isMaxLabelsReached = this.checkIsMaxLabelsReached();
	}
};
function ariaCheckedForState(state) {
	switch (state) {
		case LabelState.Applied: return "true";
		case LabelState.AppliedToSome: return "mixed";
		case LabelState.NotApplied: return "false";
	}
}

//#endregion
//#region src/mail-app/mail/view/MobileMailActionBar.ts
var MobileMailActionBar = class {
	dom = null;
	view(vnode) {
		const { attrs } = vnode;
		const { viewModel } = attrs;
		let actions;
		if (viewModel.isAnnouncement()) actions = [
			this.placeholder(),
			this.placeholder(),
			this.deleteButton(attrs),
			this.placeholder(),
			this.moreButton(attrs)
		];
else if (viewModel.isDraftMail()) actions = [
			this.placeholder(),
			this.placeholder(),
			this.deleteButton(attrs),
			this.moveButton(attrs),
			this.editButton(attrs)
		];
else if (viewModel.canForwardOrMove()) actions = [
			this.replyButton(attrs),
			this.forwardButton(attrs),
			this.deleteButton(attrs),
			this.moveButton(attrs),
			this.moreButton(attrs)
		];
else actions = [
			this.replyButton(attrs),
			this.placeholder(),
			this.deleteButton(attrs),
			this.placeholder(),
			this.moreButton(attrs)
		];
		return mithril_default(".bottom-nav.bottom-action-bar.flex.items-center.plr-l.justify-between", { oncreate: (vnode$1) => {
			this.dom = vnode$1.dom;
		} }, [actions]);
	}
	placeholder() {
		return mithril_default("", { style: { width: px(size.button_height) } });
	}
	moveButton({ viewModel }) {
		return mithril_default(IconButton, {
			title: "move_action",
			click: (e, dom) => showMoveMailsDropdown(viewModel.mailboxModel, viewModel.mailModel, dom.getBoundingClientRect(), [viewModel.mail], {
				width: this.dropdownWidth(),
				withBackground: true
			}),
			icon: Icons.Folder
		});
	}
	dropdownWidth() {
		return this.dom?.offsetWidth ? this.dom.offsetWidth - DROPDOWN_MARGIN * 2 : undefined;
	}
	moreButton({ viewModel }) {
		return mithril_default(IconButton, {
			title: "more_label",
			click: createDropdown({
				lazyButtons: () => {
					const moreButtons = [];
					if (viewModel.mailModel.canAssignLabels()) moreButtons.push({
						label: "assignLabel_action",
						click: (event, dom) => {
							const referenceDom = this.dom ?? dom;
							const popup = new LabelsPopup(referenceDom, referenceDom.getBoundingClientRect(), this.dropdownWidth() ?? 200, viewModel.mailModel.getLabelsForMails([viewModel.mail]), viewModel.mailModel.getLabelStatesForMails([viewModel.mail]), (addedLabels, removedLabels) => viewModel.mailModel.applyLabels([viewModel.mail], addedLabels, removedLabels));
							setTimeout(() => {
								popup.show();
							}, 16);
						},
						icon: Icons.Label
					});
					return [...moreButtons, ...mailViewerMoreActions(viewModel)];
				},
				width: this.dropdownWidth(),
				withBackground: true
			}),
			icon: Icons.More
		});
	}
	deleteButton({ viewModel }) {
		return mithril_default(IconButton, {
			title: "delete_action",
			click: () => promptAndDeleteMails(viewModel.mailModel, [viewModel.mail], noOp),
			icon: Icons.Trash
		});
	}
	forwardButton({ viewModel }) {
		return mithril_default(IconButton, {
			title: "forward_action",
			click: () => viewModel.forward().catch(ofClass(UserError, showUserError)),
			icon: Icons.Forward
		});
	}
	replyButton({ viewModel }) {
		return mithril_default(IconButton, {
			title: "reply_action",
			click: viewModel.canReplyAll() ? (e, dom) => {
				const dropdown = new Dropdown(() => {
					const buttons = [];
					buttons.push({
						label: "replyAll_action",
						icon: Icons.ReplyAll,
						click: () => viewModel.reply(true)
					});
					buttons.push({
						label: "reply_action",
						icon: Icons.Reply,
						click: () => viewModel.reply(false)
					});
					return buttons;
				}, this.dropdownWidth() ?? 300);
				const domRect = this.dom?.getBoundingClientRect() ?? dom.getBoundingClientRect();
				dropdown.setOrigin(domRect);
				modal.displayUnique(dropdown, true);
			} : () => viewModel.reply(false),
			icon: viewModel.canReplyAll() ? Icons.ReplyAll : Icons.Reply
		});
	}
	editButton(attrs) {
		return mithril_default(IconButton, {
			title: "edit_action",
			icon: Icons.Edit,
			click: () => editDraft(attrs.viewModel)
		});
	}
};

//#endregion
//#region src/mail-app/mail/view/EventBanner.ts
var EventBanner = class {
	/** ReplyButtons are used from mail-view and calendar-view.
	* they can't import each other and only have gui-base as a
	* common ancestor, where these don't belong. */
	ReplyButtons = new LazyLoaded(async () => (await import("./EventPreviewView2-chunk.js")).ReplyButtons);
	view({ attrs }) {
		const { contents, mail } = attrs;
		if (contents == null || contents.events.length === 0) return null;
		const messages = contents.events.map((event) => {
			const message = this.getMessage(event, attrs.mail, attrs.recipient, contents.method);
			return message == null ? null : {
				event,
				message
			};
		}).filter(isNotNull);
		return messages.map(({ event, message }) => mithril_default(InfoBanner, {
			message: () => message,
			type: BannerType.Info,
			icon: Icons.People,
			buttons: [{
				label: "viewEvent_action",
				click: (e, dom) => import("./CalendarInvites2-chunk.js").then(({ showEventDetails }) => showEventDetails(event, dom.getBoundingClientRect(), mail))
			}]
		}));
	}
	getMessage(event, mail, recipient, method) {
		const ownAttendee = findAttendeeInAddresses(event.attendees, [recipient]);
		if (method === CalendarMethod.REQUEST && ownAttendee != null) if (isRepliedTo(mail) && ownAttendee.status !== CalendarAttendeeStatus.NEEDS_ACTION) return mithril_default(".align-self-start.start.small", lang.get("alreadyReplied_msg"));
else if (this.ReplyButtons.isLoaded()) return mithril_default(this.ReplyButtons.getLoaded(), {
			ownAttendee,
			setParticipation: async (status) => sendResponse(event, recipient, status, mail)
		});
else {
			this.ReplyButtons.reload().then(mithril_default.redraw);
			return null;
		}
else if (method === CalendarMethod.REPLY) return mithril_default(".pt.align-self-start.start.small", lang.get("eventNotificationUpdated_msg"));
else return null;
	}
};
function sendResponse(event, recipient, status, previousMail) {
	showProgressDialog("pleaseWait_msg", import("./CalendarInvites2-chunk.js").then(async ({ getLatestEvent }) => {
		const latestEvent = await getLatestEvent(event);
		const ownAttendee = findAttendeeInAddresses(latestEvent.attendees, [recipient]);
		const calendarInviteHandler = await mailLocator.calendarInviteHandler();
		if (ownAttendee == null) {
			Dialog.message("attendeeNotFound_msg");
			return;
		}
		const mailboxDetails = await mailLocator.mailModel.getMailboxDetailsForMail(previousMail);
		if (mailboxDetails == null) return;
		const replyResult = await calendarInviteHandler.replyToEventInvitation(latestEvent, ownAttendee, status, previousMail, mailboxDetails);
		if (replyResult === ReplyResult.ReplySent) ownAttendee.status = status;
		mithril_default.redraw();
	}));
}

//#endregion
//#region src/common/gui/base/RecipientButton.ts
var RecipientButton = class {
	view({ attrs }) {
		return mithril_default("button.mr-button.content-accent-fg.print.small", {
			style: Object.assign({
				"white-space": "normal",
				"word-break": "break-all"
			}, attrs.style),
			onclick: (e) => attrs.click(e, e.target)
		}, [attrs.label]);
	}
};

//#endregion
//#region src/mail-app/mail/view/MailViewerHeader.ts
var MailViewerHeader = class {
	detailsExpanded = false;
	filesExpanded = false;
	view({ attrs }) {
		const { viewModel } = attrs;
		const dateTime = formatDateWithWeekday(viewModel.mail.receivedDate) + " • " + formatTime(viewModel.mail.receivedDate);
		const dateTimeFull = formatDateWithWeekdayAndYear(viewModel.mail.receivedDate) + " • " + formatTime(viewModel.mail.receivedDate);
		return mithril_default(".header.selectable", [
			this.renderSubjectActionsLine(attrs),
			this.renderFolderAndLabels(viewModel),
			this.renderAddressesAndDate(viewModel, attrs, dateTime, dateTimeFull),
			mithril_default(ExpanderPanel, { expanded: this.detailsExpanded }, this.renderDetails(attrs, { bubbleMenuWidth: 300 })),
			this.renderAttachments(viewModel, attrs.importFile),
			this.renderConnectionLostBanner(viewModel),
			this.renderEventBanner(viewModel),
			this.renderBanners(attrs)
		]);
	}
	renderFolderAndLabels(viewModel) {
		const folderInfo = viewModel.getFolderInfo();
		if (!folderInfo) return null;
		const icon = getFolderIconByType(folderInfo.folderType);
		const folderText = viewModel.getFolderMailboxText();
		const labels = viewModel.getLabels();
		if (folderText == null && labels.length === 0) return null;
		const margin = px(size.vpad_xsm);
		return mithril_default(".flex.mb-xs.flex-wrap", {
			style: {
				columnGap: margin,
				rowGap: margin
			},
			class: responsiveCardHMargin()
		}, [folderText ? mithril_default(".flex.small", [
			mithril_default(".b", mithril_default("", lang.get("location_label"))),
			mithril_default(Icon, {
				icon,
				container: "div",
				style: {
					fill: theme.content_button,
					marginLeft: margin
				}
			}),
			mithril_default(".span", folderInfo.name)
		]) : null, labels.map((label) => mithril_default(Label, {
			text: label.name,
			color: label.color ?? theme.content_accent
		}))]);
	}
	renderAddressesAndDate(viewModel, attrs, dateTime, dateTimeFull) {
		const folderInfo = viewModel.getFolderInfo();
		if (!folderInfo) return null;
		const displayedSender = viewModel.getDisplayedSender();
		return mithril_default(".flex.mt-xs.click.col", {
			class: responsiveCardHMargin(),
			role: "button",
			"aria-pressed": String(this.detailsExpanded),
			"aria-expanded": String(this.detailsExpanded),
			tabindex: TabIndex.Default,
			onclick: () => {
				this.detailsExpanded = !this.detailsExpanded;
			},
			onkeydown: (e) => {
				if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
					this.detailsExpanded = !this.detailsExpanded;
					e.preventDefault();
				}
			}
		}, [displayedSender == null ? null : mithril_default(".small.flex.flex-wrap.items-start", [mithril_default("span.text-break", getMailAddressDisplayText(displayedSender.name, displayedSender.address, false))]), mithril_default(".flex", [
			this.getRecipientEmailAddress(attrs),
			mithril_default(".flex-grow"),
			mithril_default(".flex.items-center.white-space-pre.ml-s.ml-between-s", {
				tabindex: TabIndex.Default,
				"aria-label": lang.get(viewModel.isConfidential() ? "confidential_action" : "nonConfidential_action") + ", " + dateTime
			}),
			mithril_default(".flex.ml-between-s.items-center", [
				viewModel.isConfidential() ? mithril_default(Icon, {
					icon: getConfidentialIcon(viewModel.mail),
					container: "div",
					style: { fill: theme.content_button },
					hoverText: lang.get("confidential_label")
				}) : null,
				mithril_default(Icon, {
					icon: getFolderIconByType(folderInfo.folderType),
					container: "div",
					style: { fill: theme.content_button },
					hoverText: folderInfo.name
				}),
				mithril_default(".small.font-weight-600.selectable.no-wrap", { style: { color: theme.content_button } }, [mithril_default(".noprint", dateTime), mithril_default(".noscreen", dateTimeFull)])
			])
		])]);
	}
	renderSubjectActionsLine(attrs) {
		const { viewModel } = attrs;
		const classes = this.makeSubjectActionsLineClasses();
		const senderName = viewModel.getDisplayedSender()?.name?.trim() ?? "";
		const displayAddressForSender = senderName === "";
		return mithril_default(classes, [mithril_default(".flex.flex-grow.align-self-start.items-start.overflow-hidden", {
			class: styles.isSingleColumnLayout() ? "mt-m" : "mt",
			role: "button",
			"mail-expander": "true",
			"aria-expanded": "true",
			tabindex: TabIndex.Default,
			onclick: (e) => {
				viewModel.collapseMail();
				e.stopPropagation();
			},
			onkeydown: (e) => {
				if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN) && e.target.hasAttribute("mail-expander")) {
					viewModel.collapseMail();
					e.preventDefault();
				}
			}
		}, [
			viewModel.isUnread() ? this.renderUnreadDot() : null,
			viewModel.isDraftMail() ? mithril_default(".mr-xs.align-self-center", mithril_default(Icon, {
				icon: Icons.Edit,
				container: "div",
				style: { fill: theme.content_button },
				hoverText: lang.get("draft_label")
			})) : null,
			this.tutaoBadge(viewModel),
			mithril_default("span" + (displayAddressForSender ? ".invisible.overflow-hidden" : ".text-break") + (viewModel.isUnread() ? ".font-weight-600" : ""), displayAddressForSender ? viewModel.getDisplayedSender()?.address ?? "" : senderName)
		]), mithril_default(".flex-end.items-start.ml-between-s", {
			class: styles.isSingleColumnLayout() ? "" : "mt-xs",
			style: { marginRight: styles.isSingleColumnLayout() ? "-3px" : "6px" },
			onclick: (e) => e.stopPropagation()
		}, this.moreButton(attrs))]);
	}
	renderUnreadDot() {
		return mithril_default(".flex.flex-no-grow.no-shrink.pr-s", { style: { paddingTop: "2px" } }, mithril_default(".dot.bg-accent-fg"));
	}
	makeSubjectActionsLineClasses() {
		let classes = ".flex.click";
		if (styles.isSingleColumnLayout()) classes += ".ml";
else classes += ".pl-l";
		return classes;
	}
	renderBanners(attrs) {
		const { viewModel } = attrs;
		if (viewModel.isCollapsed()) return null;
		return [
			mithril_default("." + responsiveCardHMargin(), this.renderPhishingWarning(viewModel) ?? viewModel.isWarningDismissed() ? null : this.renderHardAuthenticationFailWarning(viewModel) ?? this.renderSoftAuthenticationFailWarning(viewModel)),
			mithril_default("." + responsiveCardHMargin(), this.renderExternalContentBanner(attrs)),
			mithril_default("hr.hr.mt-xs." + responsiveCardHMargin())
		].filter(Boolean);
	}
	renderConnectionLostBanner(viewModel) {
		if (viewModel.isConnectionLost()) return mithril_default("." + responsiveCardHMargin(), mithril_default(InfoBanner, {
			message: "mailPartsNotLoaded_msg",
			icon: Icons.Warning,
			buttons: [{
				label: "retry_action",
				click: () => viewModel.loadAll(Promise.resolve())
			}]
		}));
else return null;
	}
	renderEventBanner(viewModel) {
		const eventAttachment = viewModel.getCalendarEventAttachment();
		return eventAttachment ? mithril_default("." + responsiveCardHMargin(), mithril_default(EventBanner, {
			contents: eventAttachment.contents,
			recipient: eventAttachment.recipient,
			mail: viewModel.mail
		})) : null;
	}
	renderDetails(attrs, { bubbleMenuWidth }) {
		const { viewModel, createMailAddressContextButtons } = attrs;
		const envelopeSender = viewModel.getDifferentEnvelopeSender();
		const displayedSender = viewModel.getDisplayedSender();
		return mithril_default("." + responsiveCardHPadding(), liveDataAttrs(), [
			mithril_default(".mt-s", displayedSender == null ? null : [mithril_default(".small.b", lang.get("from_label")), mithril_default(RecipientButton, {
				label: getMailAddressDisplayText(displayedSender.name, displayedSender.address, false),
				click: createAsyncDropdown({
					lazyButtons: () => createMailAddressContextButtons({
						mailAddress: displayedSender,
						defaultInboxRuleField: InboxRuleType.FROM_EQUALS
					}),
					width: bubbleMenuWidth
				})
			})], envelopeSender ? [mithril_default(".small.b", lang.get("sender_label")), mithril_default(RecipientButton, {
				label: getMailAddressDisplayText("", envelopeSender, false),
				click: createAsyncDropdown({
					lazyButtons: async () => {
						const childElements = [{
							info: lang.get("envelopeSenderInfo_msg"),
							center: false,
							bold: false
						}, {
							info: envelopeSender,
							center: true,
							bold: true
						}];
						const contextButtons = await createMailAddressContextButtons({
							mailAddress: {
								address: envelopeSender,
								name: ""
							},
							defaultInboxRuleField: InboxRuleType.FROM_EQUALS,
							createContact: false
						});
						return [...childElements, ...contextButtons];
					},
					width: bubbleMenuWidth
				})
			})] : null),
			mithril_default(".mt-s", viewModel.getToRecipients().length ? [mithril_default(".small.b", lang.get("to_label")), mithril_default(".flex.col.mt-between-s", viewModel.getToRecipients().map((recipient) => mithril_default(".flex", mithril_default(RecipientButton, {
				label: getMailAddressDisplayText(recipient.name, recipient.address, false),
				click: createAsyncDropdown({
					lazyButtons: () => createMailAddressContextButtons({
						mailAddress: recipient,
						defaultInboxRuleField: InboxRuleType.RECIPIENT_TO_EQUALS
					}),
					width: bubbleMenuWidth
				}),
				style: { flex: "0 1 auto" }
			}))))] : null),
			mithril_default(".mt-s", viewModel.getCcRecipients().length ? [mithril_default(".small.b", lang.get("cc_label")), mithril_default(".flex-start.flex-wrap", viewModel.getCcRecipients().map((recipient) => mithril_default(RecipientButton, {
				label: getMailAddressDisplayText(recipient.name, recipient.address, false),
				click: createAsyncDropdown({
					lazyButtons: () => createMailAddressContextButtons({
						mailAddress: recipient,
						defaultInboxRuleField: InboxRuleType.RECIPIENT_CC_EQUALS
					}),
					width: bubbleMenuWidth
				}),
				style: { flex: "0 1 auto" }
			})))] : null),
			mithril_default(".mt-s", viewModel.getBccRecipients().length ? [mithril_default(".small.b", lang.get("bcc_label")), mithril_default(".flex-start.flex-wrap", viewModel.getBccRecipients().map((recipient) => mithril_default(RecipientButton, {
				label: getMailAddressDisplayText(recipient.name, recipient.address, false),
				click: createAsyncDropdown({
					lazyButtons: () => createMailAddressContextButtons({
						mailAddress: recipient,
						defaultInboxRuleField: InboxRuleType.RECIPIENT_BCC_EQUALS
					}),
					width: bubbleMenuWidth
				}),
				style: { flex: "0 1 auto" }
			})))] : null),
			mithril_default(".mt-s", viewModel.getReplyTos().length ? [mithril_default(".small.b", lang.get("replyTo_label")), mithril_default(".flex-start.flex-wrap", viewModel.getReplyTos().map((recipient) => mithril_default(RecipientButton, {
				label: getMailAddressDisplayText(recipient.name, recipient.address, false),
				click: createAsyncDropdown({
					lazyButtons: () => createMailAddressContextButtons({
						mailAddress: recipient,
						defaultInboxRuleField: null
					}),
					width: bubbleMenuWidth
				}),
				style: { flex: "0 1 auto" }
			})))] : null)
		]);
	}
	renderAttachments(viewModel, importFile) {
		if (viewModel.isLoadingAttachments() && !viewModel.isConnectionLost()) return mithril_default(".flex." + responsiveCardHMargin(), [mithril_default(".flex-v-center.pl-button", progressIcon()), mithril_default(".small.flex-v-center.plr.button-height", lang.get("loading_msg"))]);
else {
			const attachments = viewModel.getNonInlineAttachments();
			const attachmentCount = attachments.length;
			if (attachmentCount === 0) return null;
			let totalAttachmentSize = 0;
			for (const attachment of attachments) totalAttachmentSize += Number(attachment.size);
			return [mithril_default(".flex.mt-s.mb-s." + responsiveCardHMargin(), liveDataAttrs(), [attachmentCount === 1 ? this.renderAttachmentContainer(viewModel, attachments, importFile) : mithril_default(ExpanderButton, {
				label: lang.makeTranslation("attachmentAmount_label", lang.get("attachmentAmount_label", { "{amount}": attachmentCount + "" }) + ` (${formatStorageSize(totalAttachmentSize)})`),
				style: {
					"padding-top": "inherit",
					height: "inherit",
					"min-height": "inherit",
					"text-decoration": "none",
					"font-weight": "normal"
				},
				expanded: this.filesExpanded,
				color: theme.content_fg,
				isBig: true,
				isUnformattedLabel: true,
				onExpandedChange: (change) => {
					this.filesExpanded = change;
				}
			})]), attachments.length > 1 ? mithril_default(ExpanderPanel, { expanded: this.filesExpanded }, mithril_default(".flex.col." + responsiveCardHMargin(), [mithril_default(".flex.flex-wrap.gap-hpad", this.renderAttachmentContainer(viewModel, attachments, importFile)), isIOSApp() ? null : mithril_default(".flex", mithril_default(Button, {
				label: "saveAll_action",
				type: ButtonType.Secondary,
				click: () => viewModel.downloadAll()
			}))])) : null];
		}
	}
	renderAttachmentContainer(viewModel, attachments, importFile) {
		return attachments.map((attachment) => {
			const attachmentType = getAttachmentType(attachment.mimeType ?? "");
			return mithril_default(AttachmentBubble, {
				attachment,
				remove: null,
				download: isAndroidApp() || isDesktop() ? () => viewModel.downloadAndOpenAttachment(attachment, false) : () => viewModel.downloadAndOpenAttachment(attachment, true),
				open: isAndroidApp() || isDesktop() ? () => viewModel.downloadAndOpenAttachment(attachment, true) : null,
				fileImport: viewModel.canImportFile(attachment) ? () => importFile(attachment) : null,
				type: attachmentType
			});
		});
	}
	tutaoBadge(viewModel) {
		return isTutanotaTeamMail(viewModel.mail) ? mithril_default(Badge, { classes: ".mr-s" }, companyTeamLabel) : null;
	}
	renderPhishingWarning(viewModel) {
		if (viewModel.isMailSuspicious()) return mithril_default(InfoBanner, {
			message: "phishingMessageBody_msg",
			icon: Icons.Warning,
			type: BannerType.Warning,
			helpLink: canSeeTutaLinks(viewModel.logins) ? InfoLink.Phishing : null,
			buttons: [{
				label: "markAsNotPhishing_action",
				click: () => viewModel.markAsNotPhishing().then(() => mithril_default.redraw())
			}]
		});
	}
	renderHardAuthenticationFailWarning(viewModel) {
		const authFailed = viewModel.checkMailAuthenticationStatus(MailAuthenticationStatus.HARD_FAIL) || viewModel.mail.encryptionAuthStatus === EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_FAILED;
		if (authFailed) return mithril_default(InfoBanner, {
			message: "mailAuthFailed_msg",
			icon: Icons.Warning,
			helpLink: canSeeTutaLinks(viewModel.logins) ? InfoLink.MailAuth : null,
			type: BannerType.Warning,
			buttons: [{
				label: "close_alt",
				click: () => viewModel.setWarningDismissed(true)
			}]
		});
	}
	renderSoftAuthenticationFailWarning(viewModel) {
		const buttons = [{
			label: "close_alt",
			click: () => viewModel.setWarningDismissed(true)
		}];
		if (viewModel.mail.encryptionAuthStatus === EncryptionAuthStatus.RSA_DESPITE_TUTACRYPT) return mithril_default(InfoBanner, {
			message: () => lang.get("deprecatedKeyWarning_msg"),
			icon: Icons.Warning,
			helpLink: canSeeTutaLinks(viewModel.logins) ? InfoLink.DeprecatedKey : null,
			buttons
		});
else if (viewModel.checkMailAuthenticationStatus(MailAuthenticationStatus.SOFT_FAIL)) return mithril_default(InfoBanner, {
			message: () => viewModel.mail.differentEnvelopeSender ? lang.get("mailAuthMissingWithTechnicalSender_msg", { "{sender}": viewModel.mail.differentEnvelopeSender }) : lang.get("mailAuthMissing_label"),
			icon: Icons.Warning,
			helpLink: canSeeTutaLinks(viewModel.logins) ? InfoLink.MailAuth : null,
			buttons
		});
else return null;
	}
	renderExternalContentBanner(attrs) {
		if (attrs.viewModel.getContentBlockingStatus() !== ContentBlockingStatus.Block) return null;
		const showButton = {
			label: "showBlockedContent_action",
			click: () => attrs.viewModel.setContentBlockingStatus(ContentBlockingStatus.Show)
		};
		const alwaysOrNeverAllowButtons = attrs.viewModel.canPersistBlockingStatus() ? [attrs.viewModel.checkMailAuthenticationStatus(MailAuthenticationStatus.AUTHENTICATED) ? {
			label: "allowExternalContentSender_action",
			click: () => attrs.viewModel.setContentBlockingStatus(ContentBlockingStatus.AlwaysShow)
		} : null, {
			label: "blockExternalContentSender_action",
			click: () => attrs.viewModel.setContentBlockingStatus(ContentBlockingStatus.AlwaysBlock)
		}].filter(isNotNull) : [];
		const maybeDropdownButtons = styles.isSingleColumnLayout() && alwaysOrNeverAllowButtons.length > 1 ? [{
			label: "more_label",
			click: createAsyncDropdown({
				width: 216,
				lazyButtons: async () => resolveMaybeLazy(alwaysOrNeverAllowButtons)
			})
		}] : alwaysOrNeverAllowButtons;
		return mithril_default(InfoBanner, {
			message: "contentBlocked_msg",
			icon: Icons.Picture,
			helpLink: canSeeTutaLinks(attrs.viewModel.logins) ? InfoLink.LoadImages : null,
			buttons: [showButton, ...maybeDropdownButtons]
		});
	}
	moreButton(attrs) {
		return mithril_default(IconButton, {
			title: "more_label",
			icon: Icons.More,
			click: this.prepareMoreActions(attrs)
		});
	}
	prepareMoreActions({ viewModel }) {
		return createDropdown({
			lazyButtons: () => {
				let actionButtons = [];
				if (viewModel.isDraftMail()) {
					actionButtons.push({
						label: "edit_action",
						click: () => editDraft(viewModel),
						icon: Icons.Edit
					});
					actionButtons.push({
						label: "move_action",
						click: (_, dom) => showMoveMailsDropdown(viewModel.mailboxModel, viewModel.mailModel, dom.getBoundingClientRect(), [viewModel.mail]),
						icon: Icons.Folder
					});
					actionButtons.push({
						label: "delete_action",
						click: () => promptAndDeleteMails(viewModel.mailModel, [viewModel.mail], noOp),
						icon: Icons.Trash
					});
				} else {
					if (viewModel.canForwardOrMove()) {
						actionButtons.push({
							label: "reply_action",
							click: () => viewModel.reply(false),
							icon: Icons.Reply
						});
						if (viewModel.canReplyAll()) actionButtons.push({
							label: "replyAll_action",
							click: () => viewModel.reply(true),
							icon: Icons.ReplyAll
						});
						actionButtons.push({
							label: "forward_action",
							click: () => viewModel.forward(),
							icon: Icons.Forward
						});
						actionButtons.push({
							label: "move_action",
							click: (_, dom) => showMoveMailsDropdown(viewModel.mailboxModel, viewModel.mailModel, dom.getBoundingClientRect(), [viewModel.mail]),
							icon: Icons.Folder
						});
					}
					if (viewModel.mailModel.canAssignLabels()) actionButtons.push({
						label: "assignLabel_action",
						click: (_, dom) => {
							const popup = new LabelsPopup(dom, dom.getBoundingClientRect(), styles.isDesktopLayout() ? 300 : 200, viewModel.mailModel.getLabelsForMails([viewModel.mail]), viewModel.mailModel.getLabelStatesForMails([viewModel.mail]), (addedLabels, removedLabels) => viewModel.mailModel.applyLabels([viewModel.mail], addedLabels, removedLabels));
							setTimeout(() => {
								popup.show();
							}, 16);
						},
						icon: Icons.Label
					});
					actionButtons.push({
						label: "delete_action",
						click: () => promptAndDeleteMails(viewModel.mailModel, [viewModel.mail], noOp),
						icon: Icons.Trash
					});
					actionButtons.push(...mailViewerMoreActions(viewModel));
				}
				return actionButtons;
			},
			width: 300
		});
	}
	getRecipientEmailAddress({ viewModel }) {
		const relevantRecipient = viewModel.getRelevantRecipient();
		if (relevantRecipient) {
			const numberOfAllRecipients = viewModel.getNumberOfRecipients();
			return mithril_default(".flex.click.small.ml-between-s.items-center", { style: { minWidth: "20px" } }, [
				mithril_default("", lang.get("mailViewerRecipients_label")),
				mithril_default(".text-ellipsis", relevantRecipient.address),
				mithril_default(".flex.no-wrap", [numberOfAllRecipients > 1 ? `+ ${numberOfAllRecipients - 1}` : null, mithril_default(Icon, {
					icon: BootIcons.Expand,
					container: "div",
					style: {
						fill: theme.content_fg,
						transform: this.detailsExpanded ? "rotate(180deg)" : ""
					}
				})])
			]);
		} else return "";
	}
};

//#endregion
//#region src/mail-app/mail/view/MailViewer.ts
var import_stream$1 = __toESM(require_stream(), 1);
assertMainOrNode();
var MailViewer = class {
	/** it is set after we measured mail body element */
	bodyLineHeight = null;
	/**
	* Delay the display of the progress spinner in main body view for a short time to suppress it when we are switching between cached emails
	* and we are just sanitizing
	*/
	delayProgressSpinner = true;
	resizeListener;
	resizeObserverViewport = null;
	resizeObserverZoomable = null;
	viewModel;
	pinchZoomable = null;
	shortcuts;
	scrollDom = null;
	domBodyDeferred = defer();
	domBody = null;
	shadowDomRoot = null;
	shadowDomMailContent = null;
	currentlyRenderedMailBody = null;
	lastContentBlockingStatus = null;
	loadAllListener = (0, import_stream$1.default)();
	/** for block quotes in mail bodies, whether to display quote before user interaction
	* is "none" until we render once */
	currentQuoteBehavior = "none";
	/** for block quotes in mail bodies, whether to display placeholder or original quote */
	quoteState = "unset";
	/** most recent resize animation frame request ID */
	resizeRaf;
	constructor(vnode) {
		this.setViewModel(vnode.attrs.viewModel, vnode.attrs.isPrimary);
		this.resizeListener = () => this.domBodyDeferred.promise.then((dom) => this.updateLineHeight(dom));
		this.shortcuts = this.setupShortcuts(vnode.attrs);
	}
	oncreate({ attrs }) {
		if (attrs.isPrimary) keyManager.registerShortcuts(this.shortcuts);
		windowFacade.addResizeListener(this.resizeListener);
	}
	onremove({ attrs }) {
		windowFacade.removeResizeListener(this.resizeListener);
		if (this.resizeObserverZoomable) this.resizeObserverZoomable.disconnect();
		if (this.resizeObserverViewport) this.resizeObserverViewport.disconnect();
		this.pinchZoomable?.remove();
		this.clearDomBody();
		if (attrs.isPrimary) keyManager.unregisterShortcuts(this.shortcuts);
	}
	setViewModel(viewModel, isPrimary) {
		const oldViewModel = this.viewModel;
		this.viewModel = viewModel;
		if (this.viewModel !== oldViewModel) {
			this.loadAllListener.end(true);
			this.loadAllListener = this.viewModel.loadCompleteNotification.map(async () => {
				await Promise.resolve();
				mithril_default.redraw.sync();
				await this.replaceInlineImages();
				mithril_default.redraw();
			});
			this.lastContentBlockingStatus = null;
			this.delayProgressSpinner = true;
			setTimeout(() => {
				this.delayProgressSpinner = false;
				mithril_default.redraw();
			}, 50);
		}
	}
	view(vnode) {
		this.handleContentBlockingOnRender();
		return [mithril_default(".mail-viewer.overflow-x-hidden", [
			this.renderMailHeader(vnode.attrs),
			this.renderMailSubject(vnode.attrs),
			mithril_default(".flex-grow.scroll-x.pt.pb.border-radius-big" + (this.viewModel.isContrastFixNeeded() ? ".bg-white.content-black" : " "), {
				class: responsiveCardHPadding(),
				oncreate: (vnode$1) => {
					this.scrollDom = vnode$1.dom;
				}
			}, this.renderMailBodySection(vnode.attrs)),
			this.renderQuoteExpanderButton()
		])];
	}
	renderMailSubject(attrs) {
		return mithril_default("h4.font-weight-600.mt.mb.text-break.selectable." + responsiveCardHMargin(), { "data-testid": `h:${lang.getTestId("subject_label")}` }, attrs.viewModel.getSubject());
	}
	/**
	* important: must be called after rendering the mail body part so that {@link quoteState} is set correctly.
	* The logic here relies on the fact that lifecycle methods will be called after body section lifecycle methods.
	*/
	renderQuoteExpanderButton() {
		const buttonHeight = 24;
		return mithril_default(".abs.flex.justify-center.full-width", {
			style: {
				bottom: px(-(buttonHeight / 2 + 1)),
				display: "hidden"
			},
			oncreate: ({ dom }) => {
				dom.style.display = this.quoteState === "noquotes" ? "none" : "";
			},
			onupdate: ({ dom }) => {
				dom.style.display = this.quoteState === "noquotes" ? "none" : "";
			}
		}, mithril_default(
			// needs flex for correct height
			".flex",
			{ style: {
				borderRadius: "25%",
				border: `1px solid ${theme.list_border}`,
				backgroundColor: theme.content_bg
			} },
			mithril_default(ToggleButton, {
				icon: Icons.More,
				title: "showText_action",
				toggled: this.shouldDisplayCollapsedQuotes(),
				onToggled: () => {
					this.quoteState = this.shouldDisplayCollapsedQuotes() ? "collapsed" : "expanded";
					if (this.shadowDomRoot) this.updateCollapsedQuotes(this.shadowDomRoot, this.shouldDisplayCollapsedQuotes());
				},
				style: {
					height: "24px",
					width: px(size.button_height_compact)
				}
			})
));
	}
	handleContentBlockingOnRender() {
		if (this.lastContentBlockingStatus != null && this.viewModel.getContentBlockingStatus() != this.lastContentBlockingStatus) Promise.resolve().then(async () => {
			mithril_default.redraw.sync();
			await this.replaceInlineImages();
		});
		this.lastContentBlockingStatus = this.viewModel.getContentBlockingStatus();
	}
	renderMailHeader(attrs) {
		return mithril_default(MailViewerHeader, {
			viewModel: this.viewModel,
			createMailAddressContextButtons: this.createMailAddressContextButtons.bind(this),
			isPrimary: attrs.isPrimary,
			importFile: (file) => this.handleAttachmentImport(file)
		});
	}
	onbeforeupdate(vnode) {
		this.setViewModel(vnode.attrs.viewModel, vnode.attrs.isPrimary);
		const shouldSkipRender = this.viewModel.isLoading() && this.delayProgressSpinner;
		return !shouldSkipRender;
	}
	renderMailBodySection(attrs) {
		if (this.viewModel.didErrorsOccur()) return mithril_default(IconMessageBox, {
			message: "corrupted_msg",
			icon: Icons.Warning,
			color: theme.content_message_bg
		});
		const sanitizedMailBody = this.viewModel.getSanitizedMailBody();
		if (this.viewModel.shouldDelayRendering()) return null;
else if (sanitizedMailBody != null) return this.renderMailBody(sanitizedMailBody, attrs);
else if (this.viewModel.isLoading()) return this.renderLoadingIcon();
else return null;
	}
	renderMailBody(sanitizedMailBody, attrs) {
		return mithril_default("#mail-body", {
			key: "mailBody",
			oncreate: (vnode) => {
				const dom = vnode.dom;
				this.setDomBody(dom);
				this.updateLineHeight(dom);
				this.renderShadowMailBody(sanitizedMailBody, attrs, vnode.dom);
				if (client.isMobileDevice()) {
					this.resizeObserverViewport?.disconnect();
					this.resizeObserverViewport = new ResizeObserver((entries) => {
						if (this.pinchZoomable) this.createPinchZoom(this.pinchZoomable.getZoomable(), vnode.dom);
					});
					this.resizeObserverViewport.observe(vnode.dom);
				}
			},
			onupdate: (vnode) => {
				const dom = vnode.dom;
				this.setDomBody(dom);
				if (!this.bodyLineHeight) this.updateLineHeight(vnode.dom);
				if (this.currentlyRenderedMailBody !== sanitizedMailBody) this.renderShadowMailBody(sanitizedMailBody, attrs, vnode.dom);
				if (this.currentQuoteBehavior !== attrs.defaultQuoteBehavior) this.updateCollapsedQuotes(assertNotNull(this.shadowDomRoot), attrs.defaultQuoteBehavior === "expand");
				this.currentQuoteBehavior = attrs.defaultQuoteBehavior;
				if (client.isMobileDevice() && !this.pinchZoomable && this.shadowDomMailContent) this.createPinchZoom(this.shadowDomMailContent, vnode.dom);
			},
			onbeforeremove: () => {
				this.clearDomBody();
			},
			onsubmit: (event) => {
				if (!confirm(lang.get("reallySubmitContent_msg"))) event.preventDefault();
			},
			style: {
				"line-height": this.bodyLineHeight ? this.bodyLineHeight.toString() : size.line_height,
				"transform-origin": "top left"
			}
		});
	}
	createPinchZoom(zoomable, viewport) {
		this.pinchZoomable?.remove();
		this.pinchZoomable = new PinchZoom(zoomable, viewport, true, (e, target) => {
			this.handleAnchorClick(e, target, true);
		});
	}
	updateCollapsedQuotes(dom, showQuote) {
		const quotes = dom.querySelectorAll("[tuta-collapsed-quote]");
		for (const quoteWrap of Array.from(quotes)) {
			const quote = quoteWrap.children[0];
			quote.style.display = showQuote ? "" : "none";
			const quoteIndicator = quoteWrap.children[1];
			quoteIndicator.style.display = showQuote ? "none" : "";
		}
		if (this.pinchZoomable) this.createPinchZoom(this.pinchZoomable.getZoomable(), this.pinchZoomable.getViewport());
	}
	shouldDisplayCollapsedQuotes() {
		return this.quoteState === "unset" ? this.currentQuoteBehavior === "expand" : this.quoteState === "expanded";
	}
	/**
	* manually wrap and style a mail body to display correctly inside a shadow root
	* @param sanitizedMailBody the mail body to display
	* @param attrs
	* @param parent the parent element that contains the shadowMailBody
	* @private
	*/
	renderShadowMailBody(sanitizedMailBody, attrs, parent) {
		this.currentQuoteBehavior = attrs.defaultQuoteBehavior;
		assertNonNull(this.shadowDomRoot, "shadow dom root is null!");
		while (this.shadowDomRoot.firstChild) this.shadowDomRoot.firstChild.remove();
		const wrapNode = document.createElement("div");
		wrapNode.className = "drag selectable touch-callout break-word-links" + (client.isMobileDevice() ? " break-pre" : "");
		wrapNode.setAttribute("data-testid", "mailBody_label");
		wrapNode.style.lineHeight = String(this.bodyLineHeight ? this.bodyLineHeight.toString() : size.line_height);
		wrapNode.style.transformOrigin = "0px 0px";
		const contentRoot = sanitizedMailBody.cloneNode(true);
		for (const child of Array.from(contentRoot.children)) child.removeAttribute("align");
		wrapNode.appendChild(contentRoot);
		this.shadowDomMailContent = wrapNode;
		const quoteElements = Array.from(wrapNode.querySelectorAll("blockquote:not(blockquote blockquote)"));
		if (quoteElements.length === 0) this.quoteState = "noquotes";
		for (const quote of quoteElements) this.createCollapsedBlockQuote(quote, this.shouldDisplayCollapsedQuotes());
		this.shadowDomRoot.appendChild(styles.getStyleSheetElement("main"));
		this.shadowDomRoot.appendChild(wrapNode);
		if (client.isMobileDevice()) {
			this.pinchZoomable = null;
			this.resizeObserverZoomable?.disconnect();
			this.resizeObserverZoomable = new ResizeObserver((entries) => {
				if (this.resizeRaf) cancelAnimationFrame(this.resizeRaf);
				this.resizeRaf = requestAnimationFrame(() => {
					this.createPinchZoom(wrapNode, parent);
				});
			});
			this.resizeObserverZoomable.observe(wrapNode);
		} else wrapNode.addEventListener("click", (event) => {
			this.handleAnchorClick(event, event.target, false);
		});
		this.currentlyRenderedMailBody = sanitizedMailBody;
	}
	createCollapsedBlockQuote(quote, expanded) {
		const quoteWrap = document.createElement("div");
		quoteWrap.setAttribute("tuta-collapsed-quote", "true");
		quote.replaceWith(quoteWrap);
		quote.style.display = expanded ? "" : "none";
		const quoteIndicator = document.createElement("div");
		quoteIndicator.classList.add("flex");
		quoteIndicator.style.borderLeft = `2px solid ${theme.content_border}`;
		quoteIndicator.style.display = expanded ? "none" : "";
		mithril_default.render(quoteIndicator, mithril_default(Icon, {
			icon: Icons.More,
			class: "icon-xl mlr",
			container: "div",
			style: { fill: theme.navigation_menu_icon }
		}));
		quoteWrap.appendChild(quote);
		quoteWrap.appendChild(quoteIndicator);
	}
	clearDomBody() {
		this.domBodyDeferred = defer();
		this.domBody = null;
		this.shadowDomRoot = null;
	}
	setDomBody(dom) {
		if (dom !== this.domBody || this.shadowDomRoot == null) {
			this.shadowDomRoot = dom.attachShadow({ mode: "open" });
			this.shadowDomRoot.getRootNode().addEventListener("keydown", (event) => {
				const { target } = event;
				if (this.eventTargetWithKeyboardInput(target)) event.stopPropagation();
			});
		}
		this.domBodyDeferred.resolve(dom);
		this.domBody = dom;
	}
	renderLoadingIcon() {
		return mithril_default(".progress-panel.flex-v-center.items-center", {
			key: "loadingIcon",
			style: { height: "200px" }
		}, [progressIcon(), mithril_default("small", lang.get("loading_msg"))]);
	}
	async replaceInlineImages() {
		const loadedInlineImages = await this.viewModel.getLoadedInlineImages();
		const domBody = await this.domBodyDeferred.promise;
		replaceCidsWithInlineImages(domBody, loadedInlineImages, (cid, event) => {
			const inlineAttachment = this.viewModel.getAttachments().find((attachment) => attachment.cid === cid);
			if (inlineAttachment && (!client.isMobileDevice() || !this.pinchZoomable || !this.pinchZoomable.isDraggingOrZooming())) {
				const coords = getCoordsOfMouseOrTouchEvent(event);
				showDropdownAtPosition([{
					label: "download_action",
					click: () => this.viewModel.downloadAndOpenAttachment(inlineAttachment, false)
				}, {
					label: "open_action",
					click: () => this.viewModel.downloadAndOpenAttachment(inlineAttachment, true)
				}], coords.x, coords.y);
			}
		});
	}
	setupShortcuts(attrs) {
		const userController = locator.logins.getUserController();
		const shortcuts = [
			{
				key: Keys.E,
				enabled: () => this.viewModel.isDraftMail(),
				exec: () => {
					editDraft(this.viewModel);
				},
				help: "editMail_action"
			},
			{
				key: Keys.H,
				enabled: () => !this.viewModel.isDraftMail(),
				exec: () => {
					showHeaderDialog(this.viewModel.getHeaders());
				},
				help: "showHeaders_action"
			},
			{
				key: Keys.I,
				enabled: () => !this.viewModel.isDraftMail(),
				exec: () => {
					showSourceDialog(this.viewModel.getMailBody());
				},
				help: "showSource_action"
			},
			{
				key: Keys.R,
				exec: () => {
					this.viewModel.reply(false);
				},
				enabled: () => !this.viewModel.isDraftMail(),
				help: "reply_action"
			},
			{
				key: Keys.R,
				shift: true,
				exec: () => {
					this.viewModel.reply(true);
				},
				enabled: () => !this.viewModel.isDraftMail(),
				help: "replyAll_action"
			}
		];
		if (userController.isInternalUser()) shortcuts.push({
			key: Keys.F,
			shift: true,
			enabled: () => !this.viewModel.isDraftMail(),
			exec: () => {
				this.viewModel.forward().catch(ofClass(UserError, showUserError));
			},
			help: "forward_action"
		});
		return shortcuts;
	}
	updateLineHeight(dom) {
		const width = dom.offsetWidth;
		if (width > 900) this.bodyLineHeight = size.line_height_l;
else if (width > 600) this.bodyLineHeight = size.line_height_m;
else this.bodyLineHeight = size.line_height;
		dom.style.lineHeight = String(this.bodyLineHeight);
	}
	async createMailAddressContextButtons(args) {
		const { mailAddress, defaultInboxRuleField, createContact = true } = args;
		const buttons = [];
		buttons.push({
			label: "copy_action",
			click: () => copyToClipboard(mailAddress.address)
		});
		if (locator.logins.getUserController().isInternalUser()) {
			if (createContact && !locator.logins.isEnabled(FeatureType.DisableContacts) && locator.logins.isFullyLoggedIn()) {
				const contact = await this.viewModel.contactModel.searchForContact(mailAddress.address);
				if (contact) buttons.push({
					label: "showContact_action",
					click: () => {
						const [listId, contactId] = assertNotNull(contact)._id;
						mithril_default.route.set("/contact/:listId/:contactId", {
							listId,
							contactId,
							focusItem: true
						});
					}
				});
else buttons.push({
					label: "createContact_action",
					click: () => {
						this.viewModel.contactModel.getContactListId().then((contactListId) => {
							import("./ContactEditor2-chunk.js").then(({ ContactEditor }) => {
								const contact$1 = createNewContact(locator.logins.getUserController().user, mailAddress.address, mailAddress.name);
								new ContactEditor(this.viewModel.entityClient, contact$1, assertNotNull(contactListId)).show();
							});
						});
					}
				});
			}
			if (defaultInboxRuleField && !locator.logins.isEnabled(FeatureType.InternalCommunication)) {
				const rule = getExistingRuleForType(locator.logins.getUserController().props, mailAddress.address.trim().toLowerCase(), defaultInboxRuleField);
				buttons.push({
					label: rule ? "editInboxRule_action" : "addInboxRule_action",
					click: async () => {
						const mailboxDetails = await this.viewModel.mailModel.getMailboxDetailsForMail(this.viewModel.mail);
						if (mailboxDetails == null) return;
						const { show, createInboxRuleTemplate } = await import("./AddInboxRuleDialog2-chunk.js");
						const newRule = rule ?? createInboxRuleTemplate(defaultInboxRuleField, mailAddress.address.trim().toLowerCase());
						show(mailboxDetails, newRule);
					}
				});
			}
			if (this.viewModel.canCreateSpamRule()) buttons.push({
				label: "addSpamRule_action",
				click: () => this.addSpamRule(defaultInboxRuleField, mailAddress.address)
			});
		}
		return buttons;
	}
	addSpamRule(defaultInboxRuleField, address) {
		const folder = this.viewModel.mailModel.getMailFolderForMail(this.viewModel.mail);
		const spamRuleType = folder && folder.folderType === MailSetKind.SPAM ? SpamRuleType.WHITELIST : SpamRuleType.BLACKLIST;
		let spamRuleField;
		switch (defaultInboxRuleField) {
			case InboxRuleType.RECIPIENT_TO_EQUALS:
				spamRuleField = SpamRuleFieldType.TO;
				break;
			case InboxRuleType.RECIPIENT_CC_EQUALS:
				spamRuleField = SpamRuleFieldType.CC;
				break;
			case InboxRuleType.RECIPIENT_BCC_EQUALS:
				spamRuleField = SpamRuleFieldType.BCC;
				break;
			default:
				spamRuleField = SpamRuleFieldType.FROM;
				break;
		}
		import("./AddSpamRuleDialog2-chunk.js").then(async ({ showAddSpamRuleDialog }) => {
			const value = address.trim().toLowerCase();
			showAddSpamRuleDialog(createEmailSenderListElement({
				value,
				type: spamRuleType,
				field: spamRuleField,
				hashedValue: await locator.worker.getWorkerInterface().cryptoFacade.sha256(value)
			}));
		});
	}
	handleAnchorClick(event, eventTarget, shouldDispatchSyntheticClick) {
		const href = eventTarget?.closest("a")?.getAttribute("href") ?? null;
		if (href) {
			if (href.startsWith("mailto:")) {
				event.preventDefault();
				if (isNewMailActionAvailable()) import("./MailEditor2-chunk.js").then(({ newMailtoUrlMailEditor }) => {
					newMailtoUrlMailEditor(href, !locator.logins.getUserController().props.defaultUnconfidential).then((editor) => editor.show()).catch(ofClass(CancelledError, noOp));
				});
			} else if (isSettingsLink(href, this.viewModel.mail)) {
				const newRoute = href.substring(href.indexOf("/settings/"));
				mithril_default.route.set(newRoute);
				event.preventDefault();
			} else if (shouldDispatchSyntheticClick) {
				const syntheticTag = document.createElement("a");
				syntheticTag.setAttribute("href", href);
				syntheticTag.setAttribute("target", "_blank");
				syntheticTag.setAttribute("rel", "noopener noreferrer");
				const newClickEvent = new MouseEvent("click");
				syntheticTag.dispatchEvent(newClickEvent);
			}
		}
	}
	/**
	* returns true if the passed in target is an HTMLElement that can receive some sort of keyboard input
	*/
	eventTargetWithKeyboardInput(target) {
		if (target && target instanceof HTMLElement) return target.matches("input[type=\"text\"], input[type=\"date\"], input[type=\"datetime-local\"], input[type=\"email\"], input[type=\"month\"], input[type=\"number\"],input[type=\"password\"], input[type=\"search\"], input[type=\"tel\"], input[type=\"time\"], input[type=\"url\"], input[type=\"week\"], input[type=\"datetime\"], textarea");
		return false;
	}
	async handleAttachmentImport(file) {
		try {
			await this.viewModel.importAttachment(file);
		} catch (e) {
			console.log(e);
			if (e instanceof UserError) return await Dialog.message(lang.makeTranslation("error_msg", e.message));
			await Dialog.message("unknownError_msg");
		}
	}
};
/**
* support and invoice mails can contain links to the settings page.
* we don't want normal mails to be able to link places in the app, though.
* */
function isSettingsLink(href, mail) {
	return (href.startsWith("/settings/") ?? false) && isTutanotaTeamMail(mail);
}

//#endregion
//#region src/mail-app/mail/view/CollapsedMailView.ts
var CollapsedMailView = class {
	view({ attrs }) {
		const { viewModel } = attrs;
		const { mail } = viewModel;
		const dateTime = formatDateWithWeekday(mail.receivedDate) + " • " + formatTime(mail.receivedDate);
		const folderInfo = viewModel.getFolderInfo();
		if (!folderInfo) return null;
		return mithril_default(".flex.items-center.pt.pb.click.no-wrap", {
			class: responsiveCardHPadding(),
			role: "button",
			"aria-expanded": "false",
			style: { color: theme.content_button },
			onclick: () => viewModel.expandMail(Promise.resolve()),
			onkeyup: (e) => {
				if (isKeyPressed(e.key, Keys.SPACE)) viewModel.expandMail(Promise.resolve());
			},
			tabindex: TabIndex.Default
		}, [
			viewModel.isUnread() ? this.renderUnreadDot() : null,
			viewModel.isDraftMail() ? mithril_default(".mr-xs", this.renderIcon(Icons.Edit, lang.get("draft_label"))) : null,
			this.renderSender(viewModel),
			mithril_default(".flex.ml-between-s.items-center", [
				mail.attachments.length > 0 ? this.renderIcon(Icons.Attachment, lang.get("attachment_label")) : null,
				viewModel.isConfidential() ? this.renderIcon(getConfidentialIcon(mail), lang.get("confidential_label")) : null,
				this.renderIcon(getFolderIconByType(folderInfo.folderType), folderInfo.name),
				mithril_default(".small.font-weight-600", dateTime)
			])
		]);
	}
	renderSender(viewModel) {
		const sender = viewModel.getDisplayedSender();
		return mithril_default(this.getMailAddressDisplayClasses(viewModel), sender == null ? "" : getMailAddressDisplayText(sender.name, sender.address, true));
	}
	getMailAddressDisplayClasses(viewModel) {
		let classes = ".flex-grow.text-ellipsis";
		if (viewModel.isUnread()) classes += ".font-weight-600";
		return classes;
	}
	renderUnreadDot() {
		return mithril_default(".flex.flex-no-grow.no-shrink.pr-s", mithril_default(".dot.bg-accent-fg", { style: { marginTop: 0 } }));
	}
	renderIcon(icon, hoverText = null) {
		return mithril_default(Icon, {
			icon,
			container: "div",
			style: { fill: theme.content_button },
			hoverText
		});
	}
};

//#endregion
//#region src/mail-app/mail/view/ConversationViewer.ts
const SCROLL_FACTOR = .8;
const conversationCardMargin = size.hpad_large;
var ConversationViewer = class {
	containerDom = null;
	didScroll = false;
	/** items from the last render, we need them to calculate the right subject based on the scroll position without the full re-render. */
	lastItems = null;
	shortcuts = [
		{
			key: Keys.PAGE_UP,
			exec: () => this.scrollUp(),
			help: "scrollUp_action"
		},
		{
			key: Keys.PAGE_DOWN,
			exec: () => this.scrollDown(),
			help: "scrollDown_action"
		},
		{
			key: Keys.HOME,
			exec: () => this.scrollToTop(),
			help: "scrollToTop_action"
		},
		{
			key: Keys.END,
			exec: () => this.scrollToBottom(),
			help: "scrollToBottom_action"
		}
	];
	oncreate() {
		keyManager.registerShortcuts(this.shortcuts);
	}
	onremove() {
		keyManager.unregisterShortcuts(this.shortcuts);
	}
	view(vnode) {
		const { viewModel, delayBodyRendering } = vnode.attrs;
		viewModel.init(delayBodyRendering);
		this.lastItems = viewModel.conversationItems();
		this.doScroll(viewModel, this.lastItems);
		return mithril_default(".fill-absolute.nav-bg.flex.col", [mithril_default(".flex-grow.overflow-y-scroll", {
			oncreate: (vnode$1) => {
				this.containerDom = vnode$1.dom;
			},
			onremove: () => {
				console.log("remove container");
			}
		}, this.renderItems(viewModel, this.lastItems), this.renderLoadingState(viewModel), this.renderFooter())]);
	}
	renderFooter() {
		const height = document.body.offsetHeight - (styles.isUsingBottomNavigation() ? size.navbar_height_mobile + size.bottom_nav_bar : size.navbar_height) - 300;
		return mithril_default(".mt-l.noprint", { style: { height: px(height) } });
	}
	renderItems(viewModel, entries) {
		return entries.map((entry, position) => {
			switch (entry.type) {
				case "mail": {
					const mailViewModel = entry.viewModel;
					const isPrimary = mailViewModel === viewModel.primaryViewModel();
					return this.renderViewer(mailViewModel, isPrimary, viewModel.isFinished() ? position : null);
				}
			}
		});
	}
	renderLoadingState(viewModel) {
		return viewModel.isConnectionLost() ? mithril_default(".center", mithril_default(Button, {
			type: ButtonType.Secondary,
			label: "retry_action",
			click: () => viewModel.retry()
		})) : !viewModel.isFinished() ? mithril_default(".font-weight-600.center.mt-l." + responsiveCardHMargin(), { style: { color: theme.content_button } }, lang.get("loading_msg")) : null;
	}
	renderViewer(mailViewModel, isPrimary, position) {
		return mithril_default(".mlr-safe-inset", mithril_default(".border-radius-big.rel", {
			class: responsiveCardHMargin(),
			key: elementIdPart(mailViewModel.mail.conversationEntry),
			style: {
				backgroundColor: theme.content_bg,
				marginTop: px(position == null || position === 0 ? 0 : conversationCardMargin)
			}
		}, mailViewModel.isCollapsed() ? mithril_default(CollapsedMailView, { viewModel: mailViewModel }) : mithril_default(MailViewer, {
			viewModel: mailViewModel,
			isPrimary,
			defaultQuoteBehavior: position === 0 ? "expand" : "collapse"
		})));
	}
	doScroll(viewModel, items) {
		const containerDom = this.containerDom;
		if (!this.didScroll && containerDom && viewModel.isFinished()) {
			const conversationId = viewModel.primaryMail.conversationEntry;
			this.didScroll = true;
			Promise.resolve().then(() => {
				const itemIndex = items.findIndex((e) => e.type === "mail" && isSameId(e.entryId, conversationId));
				if (itemIndex > 0) {
					const childDom = containerDom.childNodes[itemIndex];
					const parentTop = containerDom.getBoundingClientRect().top;
					const childTop = childDom.getBoundingClientRect().top;
					const relativeTop = childTop - parentTop;
					const top = relativeTop - conversationCardMargin * 2 - 10;
					containerDom.scrollTo({ top });
				}
			});
		}
	}
	scrollUp() {
		if (this.containerDom) this.containerDom.scrollBy({
			top: -this.containerDom.clientHeight * SCROLL_FACTOR,
			behavior: "smooth"
		});
	}
	scrollDown() {
		if (this.containerDom) this.containerDom.scrollBy({
			top: this.containerDom.clientHeight * SCROLL_FACTOR,
			behavior: "smooth"
		});
	}
	scrollToTop() {
		if (this.containerDom) this.containerDom.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	}
	scrollToBottom() {
		if (this.containerDom) this.containerDom.scrollTo({
			top: this.containerDom.scrollHeight - this.containerDom.offsetHeight,
			behavior: "smooth"
		});
	}
};

//#endregion
//#region src/mail-app/mail/view/MailViewerToolbar.ts
var import_stream = __toESM(require_stream(), 1);
var MailViewerActions = class {
	view(vnode) {
		return mithril_default(".flex.ml-between-s.items-center", [
			this.renderSingleMailActions(vnode.attrs),
			vnode.attrs.mailViewerViewModel ? mithril_default(".nav-bar-spacer") : null,
			this.renderActions(vnode.attrs),
			this.renderMoreButton(vnode.attrs.mailViewerViewModel)
		]);
	}
	renderActions(attrs) {
		const mailModel = attrs.mailViewerViewModel ? attrs.mailViewerViewModel.mailModel : attrs.mailModel;
		if (!mailModel || !attrs.mails) return null;
else if (attrs.mailViewerViewModel) return [
			this.renderDeleteButton(mailModel, attrs.mails, attrs.selectNone ?? noOp),
			attrs.mailViewerViewModel.canForwardOrMove() ? this.renderMoveButton(attrs.mailboxModel, mailModel, attrs.mails) : null,
			attrs.mailModel.canAssignLabels() ? this.renderLabelButton(mailModel, attrs.mails) : null,
			attrs.mailViewerViewModel.isDraftMail() ? null : this.renderReadButton(attrs)
		];
else if (attrs.mails.length > 0) return [
			this.renderDeleteButton(mailModel, attrs.mails, attrs.selectNone ?? noOp),
			attrs.mailModel.isMovingMailsAllowed() ? this.renderMoveButton(attrs.mailboxModel, mailModel, attrs.mails) : null,
			attrs.mailModel.canAssignLabels() && allInSameMailbox(attrs.mails) ? this.renderLabelButton(mailModel, attrs.mails) : null,
			this.renderReadButton(attrs),
			this.renderExportButton(attrs)
		];
	}
	renderSingleMailActions(attrs) {
		if (attrs.mailViewerViewModel) if (attrs.mailViewerViewModel.isAnnouncement()) return [];
else if (attrs.mailViewerViewModel.isDraftMail()) return [this.renderEditButton(attrs.mailViewerViewModel)];
else if (attrs.mailViewerViewModel.canForwardOrMove()) return [this.renderReplyButton(attrs.mailViewerViewModel), this.renderForwardButton(attrs.mailViewerViewModel)];
else return [this.renderReplyButton(attrs.mailViewerViewModel)];
else return [];
	}
	renderDeleteButton(mailModel, mails, selectNone) {
		return mithril_default(IconButton, {
			title: "delete_action",
			click: () => {
				promptAndDeleteMails(mailModel, mails, selectNone);
			},
			icon: Icons.Trash
		});
	}
	renderMoveButton(mailboxModel, mailModel, mails) {
		return mithril_default(IconButton, {
			title: "move_action",
			icon: Icons.Folder,
			click: (e, dom) => showMoveMailsDropdown(mailboxModel, mailModel, dom.getBoundingClientRect(), mails)
		});
	}
	renderLabelButton(mailModel, mails) {
		return mithril_default(IconButton, {
			title: "assignLabel_action",
			icon: Icons.Label,
			click: (_, dom) => {
				const popup = new LabelsPopup(dom, dom.getBoundingClientRect(), styles.isDesktopLayout() ? 300 : 200, mailModel.getLabelsForMails(mails), mailModel.getLabelStatesForMails(mails), (addedLabels, removedLabels) => mailModel.applyLabels(mails, addedLabels, removedLabels));
				popup.show();
			}
		});
	}
	renderReadButton({ mailModel, mailViewerViewModel, mails }) {
		const markAction = mailViewerViewModel ? (unread) => mailViewerViewModel.setUnread(unread) : (unread) => mailModel.markMails(mails, unread);
		const markReadButton = mithril_default(IconButton, {
			title: "markRead_action",
			click: () => markAction(false),
			icon: Icons.Eye
		});
		const markUnreadButton = mithril_default(IconButton, {
			title: "markUnread_action",
			click: () => markAction(true),
			icon: Icons.NoEye
		});
		if (mailViewerViewModel) if (mailViewerViewModel.isUnread()) return markReadButton;
else return markUnreadButton;
		return [markReadButton, markUnreadButton];
	}
	renderExportButton(attrs) {
		if (!isApp() && attrs.mailModel.isExportingMailsAllowed()) {
			const operation = locator.operationProgressTracker.startNewOperation();
			const ac = new AbortController();
			const headerBarAttrs = {
				left: [{
					label: "cancel_action",
					click: () => ac.abort(),
					type: ButtonType.Secondary
				}],
				middle: "emptyString_msg"
			};
			return mithril_default(IconButton, {
				title: "export_action",
				click: () => showProgressDialog(lang.getTranslation("mailExportProgress_msg", {
					"{current}": Math.round(operation.progress() / 100 * attrs.mails.length).toFixed(0),
					"{total}": attrs.mails.length
				}), exportMails(attrs.mails, locator.mailFacade, locator.entityClient, locator.fileController, locator.cryptoFacade, operation.id, ac.signal).then((result) => this.handleExportEmailsResult(result.failed)).finally(operation.done), operation.progress, true, headerBarAttrs),
				icon: Icons.Export
			});
		}
	}
	handleExportEmailsResult(mailList) {
		if (mailList && mailList.length > 0) {
			const lines = mailList.map((mail) => ({
				cells: [mail.sender.address, mail.subject],
				actionButtonAttrs: null
			}));
			const expanded = (0, import_stream.default)(false);
			const dialog = Dialog.createActionDialog({
				title: "failedToExport_title",
				child: () => mithril_default("", [
					mithril_default(".pt-m", lang.get("failedToExport_msg")),
					mithril_default(".flex-start.items-center", [mithril_default(ExpanderButton, {
						label: lang.makeTranslation("hide_show", `${lang.get(expanded() ? "hide_action" : "show_action")} ${lang.get("failedToExport_label", { "{0}": mailList.length })}`),
						expanded: expanded(),
						onExpandedChange: expanded
					})]),
					mithril_default(ExpanderPanel, { expanded: expanded() }, mithril_default(Table, {
						columnHeading: ["email_label", "subject_label"],
						columnWidths: [ColumnWidth.Largest, ColumnWidth.Largest],
						showActionButtonColumn: false,
						lines
					}))
				]),
				okAction: () => dialog.close(),
				allowCancel: false,
				okActionTextId: "ok_action",
				type: DialogType.EditMedium
			});
			dialog.show();
		}
	}
	renderReplyButton(viewModel) {
		const actions = [];
		actions.push(mithril_default(IconButton, {
			title: "reply_action",
			click: () => viewModel.reply(false),
			icon: Icons.Reply
		}));
		if (viewModel.canReplyAll()) actions.push(mithril_default(IconButton, {
			title: "replyAll_action",
			click: () => viewModel.reply(true),
			icon: Icons.ReplyAll
		}));
		return actions;
	}
	renderForwardButton(viewModel) {
		return mithril_default(IconButton, {
			title: "forward_action",
			click: () => viewModel.forward().catch(ofClass(UserError, showUserError)),
			icon: Icons.Forward
		});
	}
	renderMoreButton(viewModel) {
		let actions = [];
		if (viewModel) actions = mailViewerMoreActions(viewModel, false);
		return actions.length > 0 ? mithril_default(IconButton, {
			title: "more_label",
			icon: Icons.More,
			click: createDropdown({
				lazyButtons: () => actions,
				width: 300
			})
		}) : null;
	}
	renderEditButton(viewModel) {
		return mithril_default(IconButton, {
			title: "edit_action",
			click: () => editDraft(viewModel),
			icon: Icons.Edit
		});
	}
};

//#endregion
//#region src/mail-app/mail/view/MobileMailMultiselectionActionBar.ts
var MobileMailMultiselectionActionBar = class {
	dom = null;
	view({ attrs }) {
		const { mails, selectNone, mailModel, mailboxModel } = attrs;
		return mithril_default(MobileBottomActionBar, { oncreate: ({ dom }) => this.dom = dom }, [
			mithril_default(IconButton, {
				icon: Icons.Trash,
				title: "delete_action",
				click: () => promptAndDeleteMails(mailModel, mails, selectNone)
			}),
			mailModel.isMovingMailsAllowed() ? mithril_default(IconButton, {
				icon: Icons.Folder,
				title: "move_action",
				click: (e, dom) => {
					const referenceDom = this.dom ?? dom;
					showMoveMailsDropdown(mailboxModel, mailModel, referenceDom.getBoundingClientRect(), mails, {
						onSelected: () => selectNone,
						width: referenceDom.offsetWidth - DROPDOWN_MARGIN * 2
					});
				}
			}) : null,
			mailModel.canAssignLabels() && allInSameMailbox(mails) ? mithril_default(IconButton, {
				icon: Icons.Label,
				title: "assignLabel_action",
				click: (e, dom) => {
					const referenceDom = this.dom ?? dom;
					if (mails.length !== 0) {
						const popup = new LabelsPopup(referenceDom, referenceDom.getBoundingClientRect(), referenceDom.offsetWidth - DROPDOWN_MARGIN * 2, mailModel.getLabelsForMails(mails), mailModel.getLabelStatesForMails(mails), (addedLabels, removedLabels) => mailModel.applyLabels(mails, addedLabels, removedLabels));
						popup.show();
					}
				}
			}) : null,
			mithril_default(IconButton, {
				icon: Icons.Eye,
				title: "markRead_action",
				click: () => {
					mailModel.markMails(mails, false);
				}
			}),
			mithril_default(IconButton, {
				icon: Icons.NoEye,
				title: "markUnread_action",
				click: () => {
					mailModel.markMails(mails, true);
				}
			})
		]);
	}
};

//#endregion
//#region src/mail-app/mail/view/MailFilterButton.ts
var MailFilterButton = class {
	view({ attrs }) {
		return mithril_default(ToggleButton, {
			icon: Icons.Filter,
			title: "filter_label",
			toggled: attrs.filter != null,
			onToggled: (_, event) => this.showDropdown(attrs, event)
		});
	}
	showDropdown({ filter, setFilter }, event) {
		createDropdown({ lazyButtons: () => [
			{
				selected: filter === MailFilterType.Unread,
				label: "filterUnread_label",
				click: () => {
					setFilter(MailFilterType.Unread);
				}
			},
			{
				selected: filter === MailFilterType.Read,
				label: "filterRead_label",
				click: () => {
					setFilter(MailFilterType.Read);
				}
			},
			{
				selected: filter === MailFilterType.WithAttachments,
				label: "filterWithAttachments_label",
				click: () => {
					setFilter(MailFilterType.WithAttachments);
				}
			},
			{
				label: "filterAllMails_label",
				click: () => {
					setFilter(null);
				}
			}
		] })(event, event.target);
	}
};

//#endregion
export { ConversationViewer, LabelsPopup, MailFilterButton, MailViewerActions, MobileMailActionBar, MobileMailMultiselectionActionBar, MultiItemViewer, conversationCardMargin, getMailSelectionMessage };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbEZpbHRlckJ1dHRvbi1jaHVuay5qcyIsIm5hbWVzIjpbInNlbGVjdGVkRW50aXRpZXM6IFJlYWRvbmx5QXJyYXk8TWFpbD4iLCJzb3VyY2VFbGVtZW50OiBIVE1MRWxlbWVudCIsIm9yaWdpbjogUG9zUmVjdCIsIndpZHRoOiBudW1iZXIiLCJsYWJlbHNGb3JNYWlsczogUmVhZG9ubHlNYXA8SWQsIFJlYWRvbmx5QXJyYXk8TWFpbEZvbGRlcj4+IiwibGFiZWxzOiB7IGxhYmVsOiBNYWlsRm9sZGVyOyBzdGF0ZTogTGFiZWxTdGF0ZSB9W10iLCJvbkxhYmVsc0FwcGxpZWQ6IChhZGRlZExhYmVsczogTWFpbEZvbGRlcltdLCByZW1vdmVkTGFiZWxzOiBNYWlsRm9sZGVyW10pID0+IHVua25vd24iLCJlOiBNb3VzZUV2ZW50IiwiZTogRXZlbnQiLCJzdGF0ZTogTGFiZWxTdGF0ZSIsInJlbW92ZWRMYWJlbHM6IE1haWxGb2xkZXJbXSIsImFkZGVkTGFiZWxzOiBNYWlsRm9sZGVyW10iLCJ2bm9kZTogVm5vZGVET00iLCJsYWJlbFN0YXRlOiB7IGxhYmVsOiBNYWlsRm9sZGVyOyBzdGF0ZTogTGFiZWxTdGF0ZSB9Iiwidm5vZGU6IFZub2RlPE1vYmlsZU1haWxBY3Rpb25CYXJBdHRycz4iLCJhY3Rpb25zOiBDaGlsZHJlbltdIiwidm5vZGUiLCJtb3JlQnV0dG9uczogRHJvcGRvd25CdXR0b25BdHRyc1tdIiwiYnV0dG9uczogRHJvcGRvd25CdXR0b25BdHRyc1tdIiwiYXR0cnM6IE1vYmlsZU1haWxBY3Rpb25CYXJBdHRycyIsImV2ZW50OiBDYWxlbmRhckV2ZW50IiwibWFpbDogTWFpbCIsInJlY2lwaWVudDogc3RyaW5nIiwibWV0aG9kOiBDYWxlbmRhck1ldGhvZCIsInN0YXR1czogQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cyIsIm0iLCJwcmV2aW91c01haWw6IE1haWwiLCJlOiBNb3VzZUV2ZW50Iiwidmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsIiwiYXR0cnM6IE1haWxWaWV3ZXJIZWFkZXJBdHRycyIsImRhdGVUaW1lOiBzdHJpbmciLCJkYXRlVGltZUZ1bGw6IHN0cmluZyIsImU6IEtleWJvYXJkRXZlbnQiLCJlOiBNb3VzZUV2ZW50IiwiaW1wb3J0RmlsZTogKGZpbGU6IFR1dGFub3RhRmlsZSkgPT4gdm9pZCIsImF0dGFjaG1lbnRzOiBUdXRhbm90YUZpbGVbXSIsImJ1dHRvbnM6IFJlYWRvbmx5QXJyYXk8QmFubmVyQnV0dG9uQXR0cnMgfCBudWxsPiIsInNob3dCdXR0b246IEJhbm5lckJ1dHRvbkF0dHJzIiwibWF5YmVEcm9wZG93bkJ1dHRvbnM6IFJlYWRvbmx5QXJyYXk8QmFubmVyQnV0dG9uQXR0cnM+IiwiYWN0aW9uQnV0dG9uczogRHJvcGRvd25CdXR0b25BdHRyc1tdIiwiXzogTW91c2VFdmVudCIsImRvbTogSFRNTEVsZW1lbnQiLCJ2bm9kZTogVm5vZGU8TWFpbFZpZXdlckF0dHJzPiIsInZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCIsImlzUHJpbWFyeTogYm9vbGVhbiIsInZub2RlIiwiYXR0cnM6IE1haWxWaWV3ZXJBdHRycyIsImZpbGU6IFR1dGFub3RhRmlsZSIsInNhbml0aXplZE1haWxCb2R5OiBEb2N1bWVudEZyYWdtZW50IiwiZXZlbnQ6IEV2ZW50Iiwiem9vbWFibGU6IEhUTUxFbGVtZW50Iiwidmlld3BvcnQ6IEhUTUxFbGVtZW50IiwiZG9tOiBQYXJlbnROb2RlIiwic2hvd1F1b3RlOiBib29sZWFuIiwicXVvdGVzOiBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PiIsInBhcmVudDogSFRNTEVsZW1lbnQiLCJxdW90ZTogSFRNTEVsZW1lbnQiLCJleHBhbmRlZDogYm9vbGVhbiIsImRvbTogSFRNTEVsZW1lbnQiLCJzaG9ydGN1dHM6IFNob3J0Y3V0W10iLCJhcmdzOiB7XG5cdFx0bWFpbEFkZHJlc3M6IE1haWxBZGRyZXNzQW5kTmFtZVxuXHRcdGRlZmF1bHRJbmJveFJ1bGVGaWVsZDogSW5ib3hSdWxlVHlwZSB8IG51bGxcblx0XHRjcmVhdGVDb250YWN0PzogYm9vbGVhblxuXHR9IiwiY29udGFjdCIsImRlZmF1bHRJbmJveFJ1bGVGaWVsZDogSW5ib3hSdWxlVHlwZSB8IG51bGwiLCJhZGRyZXNzOiBzdHJpbmciLCJzcGFtUnVsZUZpZWxkOiBTcGFtUnVsZUZpZWxkVHlwZSIsImV2ZW50VGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwiLCJzaG91bGREaXNwYXRjaFN5bnRoZXRpY0NsaWNrOiBib29sZWFuIiwidGFyZ2V0OiBFdmVudFRhcmdldCB8IG51bGwiLCJocmVmOiBzdHJpbmciLCJtYWlsOiBNYWlsIiwiZTogS2V5Ym9hcmRFdmVudCIsInZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCIsImljb246IEFsbEljb25zIiwiaG92ZXJUZXh0OiBzdHJpbmcgfCBudWxsIiwidm5vZGU6IFZub2RlPENvbnZlcnNhdGlvblZpZXdlckF0dHJzPiIsInZub2RlIiwidmlld01vZGVsOiBDb252ZXJzYXRpb25WaWV3TW9kZWwiLCJlbnRyaWVzOiByZWFkb25seSBDb252ZXJzYXRpb25JdGVtW10iLCJtYWlsVmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsIiwiaXNQcmltYXJ5OiBib29sZWFuIiwicG9zaXRpb246IG51bWJlciB8IG51bGwiLCJpdGVtczogcmVhZG9ubHkgQ29udmVyc2F0aW9uSXRlbVtdIiwidm5vZGU6IFZub2RlPE1haWxWaWV3ZXJUb29sYmFyQXR0cnM+IiwiYXR0cnM6IE1haWxWaWV3ZXJUb29sYmFyQXR0cnMiLCJtYWlsTW9kZWw6IE1haWxNb2RlbCIsIm1haWxzOiBNYWlsW10iLCJzZWxlY3ROb25lOiAoKSA9PiB2b2lkIiwibWFpbGJveE1vZGVsOiBNYWlsYm94TW9kZWwiLCJtYXJrQWN0aW9uOiAodW5yZWFkOiBib29sZWFuKSA9PiB1bmtub3duIiwiaGVhZGVyQmFyQXR0cnM6IERpYWxvZ0hlYWRlckJhckF0dHJzIiwibWFpbExpc3Q6IE1haWxbXSIsInZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCIsImFjdGlvbnM6IENoaWxkcmVuIiwidmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsIHwgdW5kZWZpbmVkIiwiYWN0aW9uczogRHJvcGRvd25CdXR0b25BdHRyc1tdIiwiZXZlbnQ6IE1vdXNlRXZlbnQiXSwic291cmNlcyI6WyIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L011bHRpSXRlbVZpZXdlci50cyIsIi4uL3NyYy9tYWlsLWFwcC9tYWlsL3ZpZXcvTGFiZWxzUG9wdXAudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01vYmlsZU1haWxBY3Rpb25CYXIudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L0V2ZW50QmFubmVyLnRzIiwiLi4vc3JjL2NvbW1vbi9ndWkvYmFzZS9SZWNpcGllbnRCdXR0b24udHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01haWxWaWV3ZXJIZWFkZXIudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01haWxWaWV3ZXIudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L0NvbGxhcHNlZE1haWxWaWV3LnRzIiwiLi4vc3JjL21haWwtYXBwL21haWwvdmlldy9Db252ZXJzYXRpb25WaWV3ZXIudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01haWxWaWV3ZXJUb29sYmFyLnRzIiwiLi4vc3JjL21haWwtYXBwL21haWwvdmlldy9Nb2JpbGVNYWlsTXVsdGlzZWxlY3Rpb25BY3Rpb25CYXIudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01haWxGaWx0ZXJCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG0sIHsgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW52XCJcbmltcG9ydCBDb2x1bW5FbXB0eU1lc3NhZ2VCb3ggZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Db2x1bW5FbXB0eU1lc3NhZ2VCb3hcIlxuaW1wb3J0IHsgbGFuZywgVHJhbnNsYXRpb24sIE1heWJlVHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgQm9vdEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9Cb290SWNvbnNcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZVwiXG5pbXBvcnQgdHlwZSB7IE1haWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBCdXR0b24sIEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBwcm9ncmVzc0ljb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb24uanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcblxuZXhwb3J0IHR5cGUgTXVsdGlJdGVtVmlld2VyQXR0cnM8VD4gPSB7XG5cdHNlbGVjdGVkRW50aXRpZXM6IEFycmF5PFQ+XG5cdHNlbGVjdE5vbmU6ICgpID0+IHVua25vd25cblx0bG9hZGluZ0FsbDogXCJjYW5fbG9hZFwiIHwgXCJsb2FkaW5nXCIgfCBcImxvYWRlZFwiXG5cdGxvYWRBbGw6ICgpID0+IHVua25vd25cblx0c3RvcExvYWRBbGw6ICgpID0+IHVua25vd25cblx0Z2V0U2VsZWN0aW9uTWVzc2FnZTogKGVudGl0aWVzOiBSZWFkb25seUFycmF5PFQ+KSA9PiBNYXliZVRyYW5zbGF0aW9uXG59XG5cbmV4cG9ydCBjbGFzcyBNdWx0aUl0ZW1WaWV3ZXI8VD4gaW1wbGVtZW50cyBDb21wb25lbnQ8TXVsdGlJdGVtVmlld2VyQXR0cnM8VD4+IHtcblx0dmlldyh7IGF0dHJzIH06IFZub2RlPE11bHRpSXRlbVZpZXdlckF0dHJzPFQ+Pikge1xuXHRcdGNvbnN0IHsgc2VsZWN0ZWRFbnRpdGllcyB9ID0gYXR0cnNcblx0XHRyZXR1cm4gW1xuXHRcdFx0bShcblx0XHRcdFx0XCIuZmxleC5jb2wuZmlsbC1hYnNvbHV0ZVwiLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLmZsZXgtZ3Jvdy5yZWwub3ZlcmZsb3ctaGlkZGVuXCIsXG5cdFx0XHRcdFx0bShDb2x1bW5FbXB0eU1lc3NhZ2VCb3gsIHtcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IGF0dHJzLmdldFNlbGVjdGlvbk1lc3NhZ2Uoc2VsZWN0ZWRFbnRpdGllcyksXG5cdFx0XHRcdFx0XHRpY29uOiBCb290SWNvbnMuTWFpbCxcblx0XHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X21lc3NhZ2VfYmcsXG5cdFx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYmcsXG5cdFx0XHRcdFx0XHRib3R0b21Db250ZW50OiB0aGlzLnJlbmRlckVtcHR5TWVzc2FnZUJ1dHRvbnMoYXR0cnMpLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpLFxuXHRcdFx0KSxcblx0XHRdXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckVtcHR5TWVzc2FnZUJ1dHRvbnMoeyBsb2FkaW5nQWxsLCBzdG9wTG9hZEFsbCwgc2VsZWN0ZWRFbnRpdGllcywgc2VsZWN0Tm9uZSwgbG9hZEFsbCB9OiBNdWx0aUl0ZW1WaWV3ZXJBdHRyczxUPikge1xuXHRcdHJldHVybiBsb2FkaW5nQWxsID09PSBcImxvYWRpbmdcIlxuXHRcdFx0PyBtKFwiLmZsZXguaXRlbXMtY2VudGVyXCIsIFtcblx0XHRcdFx0XHRtKEJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRzdG9wTG9hZEFsbCgpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG0oXCIuZmxleC5pdGVtcy1jZW50ZXIucGxyLWJ1dHRvblwiLCBwcm9ncmVzc0ljb24oKSksXG5cdFx0XHQgIF0pXG5cdFx0XHQ6IHNlbGVjdGVkRW50aXRpZXMubGVuZ3RoID09PSAwXG5cdFx0XHQ/IG51bGxcblx0XHRcdDogbShcIi5mbGV4XCIsIFtcblx0XHRcdFx0XHRtKEJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRzZWxlY3ROb25lKClcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0bG9hZGluZ0FsbCA9PT0gXCJjYW5fbG9hZFwiXG5cdFx0XHRcdFx0XHQ/IG0oQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwibG9hZEFsbF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0bG9hZEFsbCgpXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdCAgXSlcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWFpbFNlbGVjdGlvbk1lc3NhZ2Uoc2VsZWN0ZWRFbnRpdGllczogUmVhZG9ubHlBcnJheTxNYWlsPik6IFRyYW5zbGF0aW9uIHtcblx0bGV0IG5ick9mU2VsZWN0ZWRNYWlscyA9IHNlbGVjdGVkRW50aXRpZXMubGVuZ3RoXG5cblx0aWYgKG5ick9mU2VsZWN0ZWRNYWlscyA9PT0gMCkge1xuXHRcdHJldHVybiBsYW5nLmdldFRyYW5zbGF0aW9uKFwibm9NYWlsX21zZ1wiKVxuXHR9IGVsc2UgaWYgKG5ick9mU2VsZWN0ZWRNYWlscyA9PT0gMSkge1xuXHRcdHJldHVybiBsYW5nLmdldFRyYW5zbGF0aW9uKFwib25lTWFpbFNlbGVjdGVkX21zZ1wiKVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBsYW5nLmdldFRyYW5zbGF0aW9uKFwibmJyT2ZNYWlsc1NlbGVjdGVkX21zZ1wiLCB7XG5cdFx0XHRcInsxfVwiOiBuYnJPZlNlbGVjdGVkTWFpbHMsXG5cdFx0fSlcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgbW9kYWwsIE1vZGFsQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Nb2RhbC5qc1wiXG5pbXBvcnQgeyBmb2N1c05leHQsIGZvY3VzUHJldmlvdXMsIFNob3J0Y3V0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXIuanNcIlxuaW1wb3J0IHsgQmFzZUJ1dHRvbiwgQmFzZUJ1dHRvbkF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9idXR0b25zL0Jhc2VCdXR0b24uanNcIlxuaW1wb3J0IHsgUG9zUmVjdCwgc2hvd0Ryb3Bkb3duIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Ecm9wZG93bi5qc1wiXG5pbXBvcnQgeyBNYWlsRm9sZGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgQWxsSWNvbnMsIEljb24sIEljb25TaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3RoZW1lLmpzXCJcbmltcG9ydCB7IEtleXMsIE1BWF9MQUJFTFNfUEVSX01BSUwsIFRhYkluZGV4IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGdldEVsZW1lbnRJZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRMYWJlbENvbG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9MYWJlbC5qc1wiXG5pbXBvcnQgeyBMYWJlbFN0YXRlIH0gZnJvbSBcIi4uL21vZGVsL01haWxNb2RlbC5qc1wiXG5pbXBvcnQgeyBBcmlhUm9sZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL0FyaWFVdGlscy5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IG5vT3AgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuLyoqXG4gKiBQb3B1cCB0aGF0IGRpc3BsYXlzIGFzc2lnbmVkIGxhYmVscyBhbmQgYWxsb3dzIGNoYW5naW5nIHRoZW1cbiAqL1xuZXhwb3J0IGNsYXNzIExhYmVsc1BvcHVwIGltcGxlbWVudHMgTW9kYWxDb21wb25lbnQge1xuXHRwcml2YXRlIGRvbTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGlzTWF4TGFiZWxzUmVhY2hlZDogYm9vbGVhblxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgc291cmNlRWxlbWVudDogSFRNTEVsZW1lbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBvcmlnaW46IFBvc1JlY3QsXG5cdFx0cHJpdmF0ZSByZWFkb25seSB3aWR0aDogbnVtYmVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbGFiZWxzRm9yTWFpbHM6IFJlYWRvbmx5TWFwPElkLCBSZWFkb25seUFycmF5PE1haWxGb2xkZXI+Pixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGxhYmVsczogeyBsYWJlbDogTWFpbEZvbGRlcjsgc3RhdGU6IExhYmVsU3RhdGUgfVtdLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgb25MYWJlbHNBcHBsaWVkOiAoYWRkZWRMYWJlbHM6IE1haWxGb2xkZXJbXSwgcmVtb3ZlZExhYmVsczogTWFpbEZvbGRlcltdKSA9PiB1bmtub3duLFxuXHQpIHtcblx0XHR0aGlzLnZpZXcgPSB0aGlzLnZpZXcuYmluZCh0aGlzKVxuXHRcdHRoaXMub25jcmVhdGUgPSB0aGlzLm9uY3JlYXRlLmJpbmQodGhpcylcblx0XHR0aGlzLmlzTWF4TGFiZWxzUmVhY2hlZCA9IHRoaXMuY2hlY2tJc01heExhYmVsc1JlYWNoZWQoKVxuXHR9XG5cblx0YXN5bmMgaGlkZUFuaW1hdGlvbigpOiBQcm9taXNlPHZvaWQ+IHt9XG5cblx0b25DbG9zZSgpOiB2b2lkIHtcblx0XHRtb2RhbC5yZW1vdmUodGhpcylcblx0fVxuXG5cdHNob3J0Y3V0cygpOiBTaG9ydGN1dFtdIHtcblx0XHRyZXR1cm4gdGhpcy5zaG9ydEN1dHNcblx0fVxuXG5cdGJhY2tncm91bmRDbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG5cdFx0bW9kYWwucmVtb3ZlKHRoaXMpXG5cdH1cblxuXHRwb3BTdGF0ZShlOiBFdmVudCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHRjYWxsaW5nRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLnNvdXJjZUVsZW1lbnRcblx0fVxuXG5cdHZpZXcoKTogdm9pZCB8IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcIi5mbGV4LmNvbC5lbGV2YXRlZC1iZy5hYnMuZHJvcGRvd24tc2hhZG93LnB0LXMuYm9yZGVyLXJhZGl1c1wiLCB7IHRhYmluZGV4OiBUYWJJbmRleC5Qcm9ncmFtbWF0aWMsIHJvbGU6IEFyaWFSb2xlLk1lbnUgfSwgW1xuXHRcdFx0bShcblx0XHRcdFx0XCIucGItcy5zY3JvbGxcIixcblx0XHRcdFx0dGhpcy5sYWJlbHMubWFwKChsYWJlbFN0YXRlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgeyBsYWJlbCwgc3RhdGUgfSA9IGxhYmVsU3RhdGVcblx0XHRcdFx0XHRjb25zdCBjb2xvciA9IHRoZW1lLmNvbnRlbnRfYnV0dG9uXG5cdFx0XHRcdFx0Y29uc3QgY2FuVG9nZ2xlTGFiZWwgPSBzdGF0ZSA9PT0gTGFiZWxTdGF0ZS5BcHBsaWVkIHx8IHN0YXRlID09PSBMYWJlbFN0YXRlLkFwcGxpZWRUb1NvbWUgfHwgIXRoaXMuaXNNYXhMYWJlbHNSZWFjaGVkXG5cdFx0XHRcdFx0Y29uc3Qgb3BhY2l0eSA9ICFjYW5Ub2dnbGVMYWJlbCA/IDAuNSA6IHVuZGVmaW5lZFxuXG5cdFx0XHRcdFx0cmV0dXJuIG0oXG5cdFx0XHRcdFx0XHRcImxhYmVsLWl0ZW0uZmxleC5pdGVtcy1jZW50ZXIucGxyLnN0YXRlLWJnLmN1cnNvci1wb2ludGVyXCIsXG5cblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XCJkYXRhLWxhYmVsaWRcIjogZ2V0RWxlbWVudElkKGxhYmVsKSxcblx0XHRcdFx0XHRcdFx0cm9sZTogQXJpYVJvbGUuTWVudUl0ZW1DaGVja2JveCxcblx0XHRcdFx0XHRcdFx0dGFiaW5kZXg6IFRhYkluZGV4LkRlZmF1bHQsXG5cdFx0XHRcdFx0XHRcdFwiYXJpYS1jaGVja2VkXCI6IGFyaWFDaGVja2VkRm9yU3RhdGUoc3RhdGUpLFxuXHRcdFx0XHRcdFx0XHRcImFyaWEtZGlzYWJsZWRcIjogIWNhblRvZ2dsZUxhYmVsLFxuXHRcdFx0XHRcdFx0XHRvbmNsaWNrOiBjYW5Ub2dnbGVMYWJlbCA/ICgpID0+IHRoaXMudG9nZ2xlTGFiZWwobGFiZWxTdGF0ZSkgOiBub09wLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0bShJY29uLCB7XG5cdFx0XHRcdFx0XHRcdFx0aWNvbjogdGhpcy5pY29uRm9yU3RhdGUoc3RhdGUpLFxuXHRcdFx0XHRcdFx0XHRcdHNpemU6IEljb25TaXplLk1lZGl1bSxcblx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsbDogZ2V0TGFiZWxDb2xvcihsYWJlbC5jb2xvciksXG5cdFx0XHRcdFx0XHRcdFx0XHRvcGFjaXR5LFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRtKFwiLmJ1dHRvbi1oZWlnaHQuZmxleC5pdGVtcy1jZW50ZXIubWwub3ZlcmZsb3ctaGlkZGVuXCIsIHsgc3R5bGU6IHsgY29sb3IsIG9wYWNpdHkgfSB9LCBtKFwiLnRleHQtZWxsaXBzaXNcIiwgbGFiZWwubmFtZSkpLFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHRcdHRoaXMuaXNNYXhMYWJlbHNSZWFjaGVkICYmIG0oXCIuc21hbGwuY2VudGVyLnBiLXNcIiwgbGFuZy5nZXQoXCJtYXhpbXVtTGFiZWxzUGVyTWFpbFJlYWNoZWRfbXNnXCIpKSxcblx0XHRcdG0oQmFzZUJ1dHRvbiwge1xuXHRcdFx0XHRsYWJlbDogXCJhcHBseV9hY3Rpb25cIixcblx0XHRcdFx0dGV4dDogbGFuZy5nZXQoXCJhcHBseV9hY3Rpb25cIiksXG5cdFx0XHRcdGNsYXNzOiBcImxpbWl0LXdpZHRoIG5vc2VsZWN0IGJnLXRyYW5zcGFyZW50IGJ1dHRvbi1oZWlnaHQgdGV4dC1lbGxpcHNpcyBjb250ZW50LWFjY2VudC1mZyBmbGV4IGl0ZW1zLWNlbnRlciBwbHItYnV0dG9uIGJ1dHRvbi1jb250ZW50IGp1c3RpZnktY2VudGVyIGJvcmRlci10b3Agc3RhdGUtYmdcIixcblx0XHRcdFx0b25jbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuYXBwbHlMYWJlbHMoKVxuXHRcdFx0XHR9LFxuXHRcdFx0fSBzYXRpc2ZpZXMgQmFzZUJ1dHRvbkF0dHJzKSxcblx0XHRcdG0oQmFzZUJ1dHRvbiwge1xuXHRcdFx0XHRsYWJlbDogXCJjbG9zZV9hbHRcIixcblx0XHRcdFx0dGV4dDogbGFuZy5nZXQoXCJjbG9zZV9hbHRcIiksXG5cdFx0XHRcdGNsYXNzOiBcImhpZGRlbi11bnRpbC1mb2N1cyBjb250ZW50LWFjY2VudC1mZyBidXR0b24tY29udGVudFwiLFxuXHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0bW9kYWwucmVtb3ZlKHRoaXMpXG5cdFx0XHRcdH0sXG5cdFx0XHR9KSxcblx0XHRdKVxuXHR9XG5cblx0cHJpdmF0ZSBpY29uRm9yU3RhdGUoc3RhdGU6IExhYmVsU3RhdGUpOiBBbGxJY29ucyB7XG5cdFx0c3dpdGNoIChzdGF0ZSkge1xuXHRcdFx0Y2FzZSBMYWJlbFN0YXRlLkFwcGxpZWRUb1NvbWU6XG5cdFx0XHRcdHJldHVybiBJY29ucy5MYWJlbFBhcnRpYWxcblx0XHRcdGNhc2UgTGFiZWxTdGF0ZS5BcHBsaWVkOlxuXHRcdFx0XHRyZXR1cm4gSWNvbnMuTGFiZWxcblx0XHRcdGNhc2UgTGFiZWxTdGF0ZS5Ob3RBcHBsaWVkOlxuXHRcdFx0XHRyZXR1cm4gSWNvbnMuTGFiZWxPdXRsaW5lXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjaGVja0lzTWF4TGFiZWxzUmVhY2hlZCgpOiBib29sZWFuIHtcblx0XHRjb25zdCB7IGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzIH0gPSB0aGlzLmdldFNvcnRlZExhYmVscygpXG5cdFx0aWYgKGFkZGVkTGFiZWxzLmxlbmd0aCA+PSBNQVhfTEFCRUxTX1BFUl9NQUlMKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblxuXHRcdGZvciAoY29uc3QgWywgbGFiZWxzXSBvZiB0aGlzLmxhYmVsc0Zvck1haWxzKSB7XG5cdFx0XHRjb25zdCBsYWJlbHNPbk1haWwgPSBuZXcgU2V0PElkPihsYWJlbHMubWFwKChsYWJlbCkgPT4gZ2V0RWxlbWVudElkKGxhYmVsKSkpXG5cblx0XHRcdGZvciAoY29uc3QgbGFiZWwgb2YgcmVtb3ZlZExhYmVscykge1xuXHRcdFx0XHRsYWJlbHNPbk1haWwuZGVsZXRlKGdldEVsZW1lbnRJZChsYWJlbCkpXG5cdFx0XHR9XG5cdFx0XHRpZiAobGFiZWxzT25NYWlsLnNpemUgPj0gTUFYX0xBQkVMU19QRVJfTUFJTCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGNvbnN0IGxhYmVsIG9mIGFkZGVkTGFiZWxzKSB7XG5cdFx0XHRcdGxhYmVsc09uTWFpbC5hZGQoZ2V0RWxlbWVudElkKGxhYmVsKSlcblx0XHRcdFx0aWYgKGxhYmVsc09uTWFpbC5zaXplID49IE1BWF9MQUJFTFNfUEVSX01BSUwpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRwcml2YXRlIGdldFNvcnRlZExhYmVscygpOiBSZWNvcmQ8XCJhZGRlZExhYmVsc1wiIHwgXCJyZW1vdmVkTGFiZWxzXCIsIE1haWxGb2xkZXJbXT4ge1xuXHRcdGNvbnN0IHJlbW92ZWRMYWJlbHM6IE1haWxGb2xkZXJbXSA9IFtdXG5cdFx0Y29uc3QgYWRkZWRMYWJlbHM6IE1haWxGb2xkZXJbXSA9IFtdXG5cdFx0Zm9yIChjb25zdCB7IGxhYmVsLCBzdGF0ZSB9IG9mIHRoaXMubGFiZWxzKSB7XG5cdFx0XHRpZiAoc3RhdGUgPT09IExhYmVsU3RhdGUuQXBwbGllZCkge1xuXHRcdFx0XHRhZGRlZExhYmVscy5wdXNoKGxhYmVsKVxuXHRcdFx0fSBlbHNlIGlmIChzdGF0ZSA9PT0gTGFiZWxTdGF0ZS5Ob3RBcHBsaWVkKSB7XG5cdFx0XHRcdHJlbW92ZWRMYWJlbHMucHVzaChsYWJlbClcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHsgYWRkZWRMYWJlbHMsIHJlbW92ZWRMYWJlbHMgfVxuXHR9XG5cblx0cHJpdmF0ZSBhcHBseUxhYmVscygpIHtcblx0XHRjb25zdCB7IGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzIH0gPSB0aGlzLmdldFNvcnRlZExhYmVscygpXG5cdFx0dGhpcy5vbkxhYmVsc0FwcGxpZWQoYWRkZWRMYWJlbHMsIHJlbW92ZWRMYWJlbHMpXG5cdFx0bW9kYWwucmVtb3ZlKHRoaXMpXG5cdH1cblxuXHRvbmNyZWF0ZSh2bm9kZTogVm5vZGVET00pIHtcblx0XHR0aGlzLmRvbSA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXG5cdFx0Ly8gcmVzdHJpY3QgbGFiZWwgaGVpZ2h0IHRvIHNob3dpbmcgbWF4aW11bSA2IGxhYmVscyB0byBhdm9pZCBvdmVyZmxvd1xuXHRcdGNvbnN0IGRpc3BsYXllZExhYmVscyA9IE1hdGgubWluKHRoaXMubGFiZWxzLmxlbmd0aCwgNilcblx0XHRjb25zdCBoZWlnaHQgPSAoZGlzcGxheWVkTGFiZWxzICsgMSkgKiBzaXplLmJ1dHRvbl9oZWlnaHQgKyBzaXplLnZwYWRfc21hbGwgKiAyXG5cdFx0c2hvd0Ryb3Bkb3duKHRoaXMub3JpZ2luLCB0aGlzLmRvbSwgaGVpZ2h0LCB0aGlzLndpZHRoKS50aGVuKCgpID0+IHtcblx0XHRcdGNvbnN0IGZpcnN0TGFiZWwgPSB2bm9kZS5kb20uZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJsYWJlbC1pdGVtXCIpLml0ZW0oMClcblx0XHRcdGlmIChmaXJzdExhYmVsICE9PSBudWxsKSB7XG5cdFx0XHRcdDsoZmlyc3RMYWJlbCBhcyBIVE1MRWxlbWVudCkuZm9jdXMoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Oyh2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQpLmZvY3VzKClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZWFkb25seSBzaG9ydEN1dHM6IEFycmF5PFNob3J0Y3V0PiA9IFtcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuRVNDLFxuXHRcdFx0ZXhlYzogKCkgPT4gdGhpcy5vbkNsb3NlKCksXG5cdFx0XHRoZWxwOiBcImNsb3NlX2FsdFwiLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0a2V5OiBLZXlzLlRBQixcblx0XHRcdHNoaWZ0OiB0cnVlLFxuXHRcdFx0ZXhlYzogKCkgPT4gKHRoaXMuZG9tID8gZm9jdXNQcmV2aW91cyh0aGlzLmRvbSkgOiBmYWxzZSksXG5cdFx0XHRoZWxwOiBcInNlbGVjdFByZXZpb3VzX2FjdGlvblwiLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0a2V5OiBLZXlzLlRBQixcblx0XHRcdHNoaWZ0OiBmYWxzZSxcblx0XHRcdGV4ZWM6ICgpID0+ICh0aGlzLmRvbSA/IGZvY3VzTmV4dCh0aGlzLmRvbSkgOiBmYWxzZSksXG5cdFx0XHRoZWxwOiBcInNlbGVjdE5leHRfYWN0aW9uXCIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuVVAsXG5cdFx0XHRleGVjOiAoKSA9PiAodGhpcy5kb20gPyBmb2N1c1ByZXZpb3VzKHRoaXMuZG9tKSA6IGZhbHNlKSxcblx0XHRcdGhlbHA6IFwic2VsZWN0UHJldmlvdXNfYWN0aW9uXCIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuRE9XTixcblx0XHRcdGV4ZWM6ICgpID0+ICh0aGlzLmRvbSA/IGZvY3VzTmV4dCh0aGlzLmRvbSkgOiBmYWxzZSksXG5cdFx0XHRoZWxwOiBcInNlbGVjdE5leHRfYWN0aW9uXCIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuUkVUVVJOLFxuXHRcdFx0ZXhlYzogKCkgPT4gdGhpcy5hcHBseUxhYmVscygpLFxuXHRcdFx0aGVscDogXCJva19hY3Rpb25cIixcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogS2V5cy5TUEFDRSxcblx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0Y29uc3QgbGFiZWxJZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ/LmdldEF0dHJpYnV0ZShcImRhdGEtbGFiZWxpZFwiKVxuXHRcdFx0XHRpZiAobGFiZWxJZCkge1xuXHRcdFx0XHRcdGNvbnN0IGxhYmVsSXRlbSA9IHRoaXMubGFiZWxzLmZpbmQoKGl0ZW0pID0+IGdldEVsZW1lbnRJZChpdGVtLmxhYmVsKSA9PT0gbGFiZWxJZClcblx0XHRcdFx0XHRpZiAobGFiZWxJdGVtKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnRvZ2dsZUxhYmVsKGxhYmVsSXRlbSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGhlbHA6IFwib2tfYWN0aW9uXCIsXG5cdFx0fSxcblx0XVxuXG5cdHNob3coKSB7XG5cdFx0bW9kYWwuZGlzcGxheVVuaXF1ZSh0aGlzLCBmYWxzZSlcblx0fVxuXG5cdHByaXZhdGUgdG9nZ2xlTGFiZWwobGFiZWxTdGF0ZTogeyBsYWJlbDogTWFpbEZvbGRlcjsgc3RhdGU6IExhYmVsU3RhdGUgfSkge1xuXHRcdHN3aXRjaCAobGFiZWxTdGF0ZS5zdGF0ZSkge1xuXHRcdFx0Y2FzZSBMYWJlbFN0YXRlLkFwcGxpZWRUb1NvbWU6XG5cdFx0XHRcdGxhYmVsU3RhdGUuc3RhdGUgPSB0aGlzLmlzTWF4TGFiZWxzUmVhY2hlZCA/IExhYmVsU3RhdGUuTm90QXBwbGllZCA6IExhYmVsU3RhdGUuQXBwbGllZFxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBMYWJlbFN0YXRlLk5vdEFwcGxpZWQ6XG5cdFx0XHRcdGxhYmVsU3RhdGUuc3RhdGUgPSBMYWJlbFN0YXRlLkFwcGxpZWRcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgTGFiZWxTdGF0ZS5BcHBsaWVkOlxuXHRcdFx0XHRsYWJlbFN0YXRlLnN0YXRlID0gTGFiZWxTdGF0ZS5Ob3RBcHBsaWVkXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0dGhpcy5pc01heExhYmVsc1JlYWNoZWQgPSB0aGlzLmNoZWNrSXNNYXhMYWJlbHNSZWFjaGVkKClcblx0fVxufVxuXG5mdW5jdGlvbiBhcmlhQ2hlY2tlZEZvclN0YXRlKHN0YXRlOiBMYWJlbFN0YXRlKTogc3RyaW5nIHtcblx0c3dpdGNoIChzdGF0ZSkge1xuXHRcdGNhc2UgTGFiZWxTdGF0ZS5BcHBsaWVkOlxuXHRcdFx0cmV0dXJuIFwidHJ1ZVwiXG5cdFx0Y2FzZSBMYWJlbFN0YXRlLkFwcGxpZWRUb1NvbWU6XG5cdFx0XHRyZXR1cm4gXCJtaXhlZFwiXG5cdFx0Y2FzZSBMYWJlbFN0YXRlLk5vdEFwcGxpZWQ6XG5cdFx0XHRyZXR1cm4gXCJmYWxzZVwiXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgTWFpbFZpZXdlclZpZXdNb2RlbCB9IGZyb20gXCIuL01haWxWaWV3ZXJWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBjcmVhdGVEcm9wZG93biwgRHJvcGRvd24sIERST1BET1dOX01BUkdJTiwgRHJvcGRvd25CdXR0b25BdHRycyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IFVzZXJFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vVXNlckVycm9yLmpzXCJcbmltcG9ydCB7IHNob3dVc2VyRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvRXJyb3JIYW5kbGVySW1wbC5qc1wiXG5pbXBvcnQgeyBwcm9tcHRBbmREZWxldGVNYWlscywgc2hvd01vdmVNYWlsc0Ryb3Bkb3duIH0gZnJvbSBcIi4vTWFpbEd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IG5vT3AsIG9mQ2xhc3MgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IG1vZGFsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Nb2RhbC5qc1wiXG5pbXBvcnQgeyBlZGl0RHJhZnQsIG1haWxWaWV3ZXJNb3JlQWN0aW9ucyB9IGZyb20gXCIuL01haWxWaWV3ZXJVdGlscy5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgTGFiZWxzUG9wdXAgfSBmcm9tIFwiLi9MYWJlbHNQb3B1cC5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgTW9iaWxlTWFpbEFjdGlvbkJhckF0dHJzIHtcblx0dmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsXG59XG5cbmV4cG9ydCBjbGFzcyBNb2JpbGVNYWlsQWN0aW9uQmFyIGltcGxlbWVudHMgQ29tcG9uZW50PE1vYmlsZU1haWxBY3Rpb25CYXJBdHRycz4ge1xuXHRwcml2YXRlIGRvbTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXG5cdHZpZXcodm5vZGU6IFZub2RlPE1vYmlsZU1haWxBY3Rpb25CYXJBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBhdHRycyB9ID0gdm5vZGVcblx0XHRjb25zdCB7IHZpZXdNb2RlbCB9ID0gYXR0cnNcblx0XHRsZXQgYWN0aW9uczogQ2hpbGRyZW5bXVxuXG5cdFx0aWYgKHZpZXdNb2RlbC5pc0Fubm91bmNlbWVudCgpKSB7XG5cdFx0XHRhY3Rpb25zID0gW3RoaXMucGxhY2Vob2xkZXIoKSwgdGhpcy5wbGFjZWhvbGRlcigpLCB0aGlzLmRlbGV0ZUJ1dHRvbihhdHRycyksIHRoaXMucGxhY2Vob2xkZXIoKSwgdGhpcy5tb3JlQnV0dG9uKGF0dHJzKV1cblx0XHR9IGVsc2UgaWYgKHZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpKSB7XG5cdFx0XHRhY3Rpb25zID0gW3RoaXMucGxhY2Vob2xkZXIoKSwgdGhpcy5wbGFjZWhvbGRlcigpLCB0aGlzLmRlbGV0ZUJ1dHRvbihhdHRycyksIHRoaXMubW92ZUJ1dHRvbihhdHRycyksIHRoaXMuZWRpdEJ1dHRvbihhdHRycyldXG5cdFx0fSBlbHNlIGlmICh2aWV3TW9kZWwuY2FuRm9yd2FyZE9yTW92ZSgpKSB7XG5cdFx0XHRhY3Rpb25zID0gW3RoaXMucmVwbHlCdXR0b24oYXR0cnMpLCB0aGlzLmZvcndhcmRCdXR0b24oYXR0cnMpLCB0aGlzLmRlbGV0ZUJ1dHRvbihhdHRycyksIHRoaXMubW92ZUJ1dHRvbihhdHRycyksIHRoaXMubW9yZUJ1dHRvbihhdHRycyldXG5cdFx0fSBlbHNlIHtcblx0XHRcdGFjdGlvbnMgPSBbdGhpcy5yZXBseUJ1dHRvbihhdHRycyksIHRoaXMucGxhY2Vob2xkZXIoKSwgdGhpcy5kZWxldGVCdXR0b24oYXR0cnMpLCB0aGlzLnBsYWNlaG9sZGVyKCksIHRoaXMubW9yZUJ1dHRvbihhdHRycyldXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5ib3R0b20tbmF2LmJvdHRvbS1hY3Rpb24tYmFyLmZsZXguaXRlbXMtY2VudGVyLnBsci1sLmp1c3RpZnktYmV0d2VlblwiLFxuXHRcdFx0e1xuXHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5kb20gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbYWN0aW9uc10sXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBwbGFjZWhvbGRlcigpIHtcblx0XHRyZXR1cm4gbShcIlwiLCB7XG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHR3aWR0aDogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHRcdH0sXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgbW92ZUJ1dHRvbih7IHZpZXdNb2RlbCB9OiBNb2JpbGVNYWlsQWN0aW9uQmFyQXR0cnMpIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJtb3ZlX2FjdGlvblwiLFxuXHRcdFx0Y2xpY2s6IChlLCBkb20pID0+XG5cdFx0XHRcdHNob3dNb3ZlTWFpbHNEcm9wZG93bih2aWV3TW9kZWwubWFpbGJveE1vZGVsLCB2aWV3TW9kZWwubWFpbE1vZGVsLCBkb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIFt2aWV3TW9kZWwubWFpbF0sIHtcblx0XHRcdFx0XHR3aWR0aDogdGhpcy5kcm9wZG93bldpZHRoKCksXG5cdFx0XHRcdFx0d2l0aEJhY2tncm91bmQ6IHRydWUsXG5cdFx0XHRcdH0pLFxuXHRcdFx0aWNvbjogSWNvbnMuRm9sZGVyLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGRyb3Bkb3duV2lkdGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZG9tPy5vZmZzZXRXaWR0aCA/IHRoaXMuZG9tLm9mZnNldFdpZHRoIC0gRFJPUERPV05fTUFSR0lOICogMiA6IHVuZGVmaW5lZFxuXHR9XG5cblx0cHJpdmF0ZSBtb3JlQnV0dG9uKHsgdmlld01vZGVsIH06IE1vYmlsZU1haWxBY3Rpb25CYXJBdHRycykge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcIm1vcmVfbGFiZWxcIixcblx0XHRcdGNsaWNrOiBjcmVhdGVEcm9wZG93bih7XG5cdFx0XHRcdGxhenlCdXR0b25zOiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgbW9yZUJ1dHRvbnM6IERyb3Bkb3duQnV0dG9uQXR0cnNbXSA9IFtdXG5cdFx0XHRcdFx0aWYgKHZpZXdNb2RlbC5tYWlsTW9kZWwuY2FuQXNzaWduTGFiZWxzKCkpIHtcblx0XHRcdFx0XHRcdG1vcmVCdXR0b25zLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogXCJhc3NpZ25MYWJlbF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0Y2xpY2s6IChldmVudCwgZG9tKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVmZXJlbmNlRG9tID0gdGhpcy5kb20gPz8gZG9tXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcG9wdXAgPSBuZXcgTGFiZWxzUG9wdXAoXG5cdFx0XHRcdFx0XHRcdFx0XHRyZWZlcmVuY2VEb20sXG5cdFx0XHRcdFx0XHRcdFx0XHRyZWZlcmVuY2VEb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmRyb3Bkb3duV2lkdGgoKSA/PyAyMDAsXG5cdFx0XHRcdFx0XHRcdFx0XHR2aWV3TW9kZWwubWFpbE1vZGVsLmdldExhYmVsc0Zvck1haWxzKFt2aWV3TW9kZWwubWFpbF0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmlld01vZGVsLm1haWxNb2RlbC5nZXRMYWJlbFN0YXRlc0Zvck1haWxzKFt2aWV3TW9kZWwubWFpbF0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0KGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzKSA9PiB2aWV3TW9kZWwubWFpbE1vZGVsLmFwcGx5TGFiZWxzKFt2aWV3TW9kZWwubWFpbF0sIGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzKSxcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRwb3B1cC5zaG93KClcblx0XHRcdFx0XHRcdFx0XHR9LCAxNilcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuTGFiZWwsXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gWy4uLm1vcmVCdXR0b25zLCAuLi5tYWlsVmlld2VyTW9yZUFjdGlvbnModmlld01vZGVsKV1cblx0XHRcdFx0fSxcblx0XHRcdFx0d2lkdGg6IHRoaXMuZHJvcGRvd25XaWR0aCgpLFxuXHRcdFx0XHR3aXRoQmFja2dyb3VuZDogdHJ1ZSxcblx0XHRcdH0pLFxuXHRcdFx0aWNvbjogSWNvbnMuTW9yZSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBkZWxldGVCdXR0b24oeyB2aWV3TW9kZWwgfTogTW9iaWxlTWFpbEFjdGlvbkJhckF0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcImRlbGV0ZV9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoKSA9PiBwcm9tcHRBbmREZWxldGVNYWlscyh2aWV3TW9kZWwubWFpbE1vZGVsLCBbdmlld01vZGVsLm1haWxdLCBub09wKSxcblx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGZvcndhcmRCdXR0b24oeyB2aWV3TW9kZWwgfTogTW9iaWxlTWFpbEFjdGlvbkJhckF0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcImZvcndhcmRfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLmZvcndhcmQoKS5jYXRjaChvZkNsYXNzKFVzZXJFcnJvciwgc2hvd1VzZXJFcnJvcikpLFxuXHRcdFx0aWNvbjogSWNvbnMuRm9yd2FyZCxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZXBseUJ1dHRvbih7IHZpZXdNb2RlbCB9OiBNb2JpbGVNYWlsQWN0aW9uQmFyQXR0cnMpIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJyZXBseV9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiB2aWV3TW9kZWwuY2FuUmVwbHlBbGwoKVxuXHRcdFx0XHQ/IChlLCBkb20pID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IGRyb3Bkb3duID0gbmV3IERyb3Bkb3duKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYnV0dG9uczogRHJvcGRvd25CdXR0b25BdHRyc1tdID0gW11cblx0XHRcdFx0XHRcdFx0YnV0dG9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJyZXBseUFsbF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5SZXBseUFsbCxcblx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLnJlcGx5KHRydWUpLFxuXHRcdFx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwicmVwbHlfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuUmVwbHksXG5cdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHZpZXdNb2RlbC5yZXBseShmYWxzZSksXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdHJldHVybiBidXR0b25zXG5cdFx0XHRcdFx0XHR9LCB0aGlzLmRyb3Bkb3duV2lkdGgoKSA/PyAzMDApXG5cblx0XHRcdFx0XHRcdGNvbnN0IGRvbVJlY3QgPSB0aGlzLmRvbT8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgPz8gZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cdFx0XHRcdFx0XHRkcm9wZG93bi5zZXRPcmlnaW4oZG9tUmVjdClcblx0XHRcdFx0XHRcdG1vZGFsLmRpc3BsYXlVbmlxdWUoZHJvcGRvd24sIHRydWUpXG5cdFx0XHRcdCAgfVxuXHRcdFx0XHQ6ICgpID0+IHZpZXdNb2RlbC5yZXBseShmYWxzZSksXG5cdFx0XHRpY29uOiB2aWV3TW9kZWwuY2FuUmVwbHlBbGwoKSA/IEljb25zLlJlcGx5QWxsIDogSWNvbnMuUmVwbHksXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgZWRpdEJ1dHRvbihhdHRyczogTW9iaWxlTWFpbEFjdGlvbkJhckF0dHJzKSB7XG5cdFx0cmV0dXJuIG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0dGl0bGU6IFwiZWRpdF9hY3Rpb25cIixcblx0XHRcdGljb246IEljb25zLkVkaXQsXG5cdFx0XHRjbGljazogKCkgPT4gZWRpdERyYWZ0KGF0dHJzLnZpZXdNb2RlbCksXG5cdFx0fSlcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLCBDYWxlbmRhck1ldGhvZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB0eXBlIHsgQ2FsZW5kYXJFdmVudCwgTWFpbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IHNob3dQcm9ncmVzc0RpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2RpYWxvZ3MvUHJvZ3Jlc3NEaWFsb2dcIlxuaW1wb3J0IHsgZmluZEF0dGVuZGVlSW5BZGRyZXNzZXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvQ29tbW9uQ2FsZW5kYXJVdGlscy5qc1wiXG5pbXBvcnQgeyBCYW5uZXJUeXBlLCBJbmZvQmFubmVyLCBJbmZvQmFubmVyQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0luZm9CYW5uZXIuanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IGlzTm90TnVsbCwgTGF6eUxvYWRlZCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgUGFyc2VkSWNhbEZpbGVDb250ZW50LCBSZXBseVJlc3VsdCB9IGZyb20gXCIuLi8uLi8uLi9jYWxlbmRhci1hcHAvY2FsZW5kYXIvdmlldy9DYWxlbmRhckludml0ZXMuanNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vQ29tbW9uTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBtYWlsTG9jYXRvciB9IGZyb20gXCIuLi8uLi9tYWlsTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBpc1JlcGxpZWRUbyB9IGZyb20gXCIuL01haWxWaWV3ZXJVdGlscy5qc1wiXG5cbmV4cG9ydCB0eXBlIEV2ZW50QmFubmVyQXR0cnMgPSB7XG5cdGNvbnRlbnRzOiBQYXJzZWRJY2FsRmlsZUNvbnRlbnRcblx0bWFpbDogTWFpbFxuXHRyZWNpcGllbnQ6IHN0cmluZ1xufVxuXG4vKipcbiAqIGRpc3BsYXllZCBhYm92ZSBhIG1haWwgdGhhdCBjb250YWlucyBhIGNhbGVuZGFyIGludml0ZS5cbiAqIEl0cyBtYWluIGZ1bmN0aW9uIGlzIHRvIG1ha2UgaXQgcG9zc2libGUgdG8gaW5zcGVjdCB0aGUgZXZlbnQgd2l0aCB0aGUgQ2FsZW5kYXJFdmVudFBvcHVwLCB0byBxdWljayByZXNwb25kXG4gKiB5b3VyIGF0dGVuZGFuY2Ugd2l0aCBBY2NlcHQvRGVjbGluZS9UZW50YXRpdmUgd2hpbGUgYWRkaW5nIHRoZSBldmVudCB0byB5b3VyIHBlcnNvbmFsIGNhbGVuZGFyXG4gKi9cbmV4cG9ydCBjbGFzcyBFdmVudEJhbm5lciBpbXBsZW1lbnRzIENvbXBvbmVudDxFdmVudEJhbm5lckF0dHJzPiB7XG5cdC8qKiBSZXBseUJ1dHRvbnMgYXJlIHVzZWQgZnJvbSBtYWlsLXZpZXcgYW5kIGNhbGVuZGFyLXZpZXcuXG5cdCAqIHRoZXkgY2FuJ3QgaW1wb3J0IGVhY2ggb3RoZXIgYW5kIG9ubHkgaGF2ZSBndWktYmFzZSBhcyBhXG5cdCAqIGNvbW1vbiBhbmNlc3Rvciwgd2hlcmUgdGhlc2UgZG9uJ3QgYmVsb25nLiAqL1xuXHRwcml2YXRlIHJlYWRvbmx5IFJlcGx5QnV0dG9ucyA9IG5ldyBMYXp5TG9hZGVkKGFzeW5jICgpID0+IChhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL2V2ZW50cG9wdXAvRXZlbnRQcmV2aWV3Vmlldy5qc1wiKSkuUmVwbHlCdXR0b25zKVxuXG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxFdmVudEJhbm5lckF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IGNvbnRlbnRzLCBtYWlsIH0gPSBhdHRyc1xuXHRcdGlmIChjb250ZW50cyA9PSBudWxsIHx8IGNvbnRlbnRzLmV2ZW50cy5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG5cblx0XHRjb25zdCBtZXNzYWdlcyA9IGNvbnRlbnRzLmV2ZW50c1xuXHRcdFx0Lm1hcCgoZXZlbnQ6IENhbGVuZGFyRXZlbnQpOiB7IGV2ZW50OiBDYWxlbmRhckV2ZW50OyBtZXNzYWdlOiBDaGlsZHJlbiB9IHwgTm9uZSA9PiB7XG5cdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSB0aGlzLmdldE1lc3NhZ2UoZXZlbnQsIGF0dHJzLm1haWwsIGF0dHJzLnJlY2lwaWVudCwgY29udGVudHMubWV0aG9kKVxuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZSA9PSBudWxsID8gbnVsbCA6IHsgZXZlbnQsIG1lc3NhZ2UgfVxuXHRcdFx0fSlcblx0XHRcdC8vIHRodW5kZXJiaXJkIGRvZXMgbm90IGFkZCBhdHRlbmRlZXMgdG8gcmVzY2hlZHVsZWQgaW5zdGFuY2VzIHdoZW4gdGhleSB3ZXJlIGFkZGVkIGR1cmluZyBhbiBcImFsbCBldmVudFwiXG5cdFx0XHQvLyBlZGl0IG9wZXJhdGlvbiwgYnV0IF93aWxsXyBzZW5kIGFsbCB0aGUgZXZlbnRzIHRvIHRoZSBwYXJ0aWNpcGFudHMgaW4gYSBzaW5nbGUgZmlsZS4gd2UgZG8gbm90IHNob3cgdGhlXG5cdFx0XHQvLyBiYW5uZXIgZm9yIGV2ZW50cyB0aGF0IGRvIG5vdCBtZW50aW9uIHVzLlxuXHRcdFx0LmZpbHRlcihpc05vdE51bGwpXG5cblx0XHRyZXR1cm4gbWVzc2FnZXMubWFwKCh7IGV2ZW50LCBtZXNzYWdlIH0pID0+XG5cdFx0XHRtKEluZm9CYW5uZXIsIHtcblx0XHRcdFx0bWVzc2FnZTogKCkgPT4gbWVzc2FnZSxcblx0XHRcdFx0dHlwZTogQmFubmVyVHlwZS5JbmZvLFxuXHRcdFx0XHRpY29uOiBJY29ucy5QZW9wbGUsXG5cdFx0XHRcdGJ1dHRvbnM6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJ2aWV3RXZlbnRfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRjbGljazogKGUsIGRvbSkgPT5cblx0XHRcdFx0XHRcdFx0aW1wb3J0KFwiLi4vLi4vLi4vY2FsZW5kYXItYXBwL2NhbGVuZGFyL3ZpZXcvQ2FsZW5kYXJJbnZpdGVzLmpzXCIpLnRoZW4oKHsgc2hvd0V2ZW50RGV0YWlscyB9KSA9PlxuXHRcdFx0XHRcdFx0XHRcdHNob3dFdmVudERldGFpbHMoZXZlbnQsIGRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgbWFpbCksXG5cdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XSxcblx0XHRcdH0gc2F0aXNmaWVzIEluZm9CYW5uZXJBdHRycyksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRNZXNzYWdlKGV2ZW50OiBDYWxlbmRhckV2ZW50LCBtYWlsOiBNYWlsLCByZWNpcGllbnQ6IHN0cmluZywgbWV0aG9kOiBDYWxlbmRhck1ldGhvZCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBvd25BdHRlbmRlZSA9IGZpbmRBdHRlbmRlZUluQWRkcmVzc2VzKGV2ZW50LmF0dGVuZGVlcywgW3JlY2lwaWVudF0pXG5cdFx0aWYgKG1ldGhvZCA9PT0gQ2FsZW5kYXJNZXRob2QuUkVRVUVTVCAmJiBvd25BdHRlbmRlZSAhPSBudWxsKSB7XG5cdFx0XHQvLyBzb21lIG1haWxzIGNvbnRhaW4gbW9yZSB0aGFuIG9uZSBldmVudCB0aGF0IHdlIHdhbnQgdG8gYmUgYWJsZSB0byByZXNwb25kIHRvXG5cdFx0XHQvLyBzZXBhcmF0ZWx5LlxuXHRcdFx0aWYgKGlzUmVwbGllZFRvKG1haWwpICYmIG93bkF0dGVuZGVlLnN0YXR1cyAhPT0gQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cy5ORUVEU19BQ1RJT04pIHtcblx0XHRcdFx0cmV0dXJuIG0oXCIuYWxpZ24tc2VsZi1zdGFydC5zdGFydC5zbWFsbFwiLCBsYW5nLmdldChcImFscmVhZHlSZXBsaWVkX21zZ1wiKSlcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5SZXBseUJ1dHRvbnMuaXNMb2FkZWQoKSkge1xuXHRcdFx0XHRyZXR1cm4gbSh0aGlzLlJlcGx5QnV0dG9ucy5nZXRMb2FkZWQoKSwge1xuXHRcdFx0XHRcdG93bkF0dGVuZGVlLFxuXHRcdFx0XHRcdHNldFBhcnRpY2lwYXRpb246IGFzeW5jIChzdGF0dXM6IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMpID0+IHNlbmRSZXNwb25zZShldmVudCwgcmVjaXBpZW50LCBzdGF0dXMsIG1haWwpLFxuXHRcdFx0XHR9KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5SZXBseUJ1dHRvbnMucmVsb2FkKCkudGhlbihtLnJlZHJhdylcblx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG1ldGhvZCA9PT0gQ2FsZW5kYXJNZXRob2QuUkVQTFkpIHtcblx0XHRcdHJldHVybiBtKFwiLnB0LmFsaWduLXNlbGYtc3RhcnQuc3RhcnQuc21hbGxcIiwgbGFuZy5nZXQoXCJldmVudE5vdGlmaWNhdGlvblVwZGF0ZWRfbXNnXCIpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxufVxuXG4vKiogc2hvdyBhIHByb2dyZXNzIGRpYWxvZyB3aGlsZSBzZW5kaW5nIGEgcmVzcG9uc2UgdG8gdGhlIGV2ZW50J3Mgb3JnYW5pemVyIGFuZCB1cGRhdGUgdGhlIHVpLiB3aWxsIGFsd2F5cyBzZW5kIGEgcmVwbHksIGV2ZW4gaWYgdGhlIHN0YXR1cyBkaWQgbm90IGNoYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZW5kUmVzcG9uc2UoZXZlbnQ6IENhbGVuZGFyRXZlbnQsIHJlY2lwaWVudDogc3RyaW5nLCBzdGF0dXM6IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMsIHByZXZpb3VzTWFpbDogTWFpbCkge1xuXHRzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XCJwbGVhc2VXYWl0X21zZ1wiLFxuXHRcdGltcG9ydChcIi4uLy4uLy4uL2NhbGVuZGFyLWFwcC9jYWxlbmRhci92aWV3L0NhbGVuZGFySW52aXRlcy5qc1wiKS50aGVuKGFzeW5jICh7IGdldExhdGVzdEV2ZW50IH0pID0+IHtcblx0XHRcdGNvbnN0IGxhdGVzdEV2ZW50ID0gYXdhaXQgZ2V0TGF0ZXN0RXZlbnQoZXZlbnQpXG5cdFx0XHRjb25zdCBvd25BdHRlbmRlZSA9IGZpbmRBdHRlbmRlZUluQWRkcmVzc2VzKGxhdGVzdEV2ZW50LmF0dGVuZGVlcywgW3JlY2lwaWVudF0pXG5cdFx0XHRjb25zdCBjYWxlbmRhckludml0ZUhhbmRsZXIgPSBhd2FpdCBtYWlsTG9jYXRvci5jYWxlbmRhckludml0ZUhhbmRsZXIoKVxuXG5cdFx0XHRpZiAob3duQXR0ZW5kZWUgPT0gbnVsbCkge1xuXHRcdFx0XHREaWFsb2cubWVzc2FnZShcImF0dGVuZGVlTm90Rm91bmRfbXNnXCIpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtYWlsYm94RGV0YWlscyA9IGF3YWl0IG1haWxMb2NhdG9yLm1haWxNb2RlbC5nZXRNYWlsYm94RGV0YWlsc0Zvck1haWwocHJldmlvdXNNYWlsKVxuXHRcdFx0aWYgKG1haWxib3hEZXRhaWxzID09IG51bGwpIHJldHVyblxuXG5cdFx0XHRjb25zdCByZXBseVJlc3VsdCA9IGF3YWl0IGNhbGVuZGFySW52aXRlSGFuZGxlci5yZXBseVRvRXZlbnRJbnZpdGF0aW9uKGxhdGVzdEV2ZW50LCBvd25BdHRlbmRlZSwgc3RhdHVzLCBwcmV2aW91c01haWwsIG1haWxib3hEZXRhaWxzKVxuXHRcdFx0aWYgKHJlcGx5UmVzdWx0ID09PSBSZXBseVJlc3VsdC5SZXBseVNlbnQpIHtcblx0XHRcdFx0b3duQXR0ZW5kZWUuc3RhdHVzID0gc3RhdHVzXG5cdFx0XHR9XG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fSksXG5cdClcbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBDbGlja0hhbmRsZXIgfSBmcm9tIFwiLi9HdWlVdGlsc1wiXG5cbmV4cG9ydCB0eXBlIEF0dHJzID0ge1xuXHRsYWJlbDogc3RyaW5nXG5cdGNsaWNrOiBDbGlja0hhbmRsZXJcblx0c3R5bGU/OiBvYmplY3Rcbn1cblxuZXhwb3J0IGNsYXNzIFJlY2lwaWVudEJ1dHRvbiBpbXBsZW1lbnRzIENvbXBvbmVudDxBdHRycz4ge1xuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8QXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCJidXR0b24ubXItYnV0dG9uLmNvbnRlbnQtYWNjZW50LWZnLnByaW50LnNtYWxsXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiBPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFwid2hpdGUtc3BhY2VcIjogXCJub3JtYWxcIixcblx0XHRcdFx0XHRcdFwid29yZC1icmVha1wiOiBcImJyZWFrLWFsbFwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YXR0cnMuc3R5bGUsXG5cdFx0XHRcdCksXG5cdFx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiBhdHRycy5jbGljayhlLCBlLnRhcmdldCBhcyBIVE1MRWxlbWVudCksXG5cdFx0XHR9LFxuXHRcdFx0W2F0dHJzLmxhYmVsXSxcblx0XHQpXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgSW5mb0xpbmssIGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZS5qc1wiXG5pbXBvcnQgeyBzdHlsZXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zdHlsZXMuanNcIlxuaW1wb3J0IHsgRXhwYW5kZXJCdXR0b24sIEV4cGFuZGVyUGFuZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0V4cGFuZGVyLmpzXCJcbmltcG9ydCB7IEZpbGUgYXMgVHV0YW5vdGFGaWxlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQmFubmVyQnV0dG9uQXR0cnMsIEJhbm5lclR5cGUsIEluZm9CYW5uZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0luZm9CYW5uZXIuanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IEV2ZW50QmFubmVyLCBFdmVudEJhbm5lckF0dHJzIH0gZnJvbSBcIi4vRXZlbnRCYW5uZXIuanNcIlxuaW1wb3J0IHsgUmVjaXBpZW50QnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9SZWNpcGllbnRCdXR0b24uanNcIlxuaW1wb3J0IHsgY3JlYXRlQXN5bmNEcm9wZG93biwgY3JlYXRlRHJvcGRvd24sIERyb3Bkb3duQnV0dG9uQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3Bkb3duLmpzXCJcbmltcG9ydCB7IEVuY3J5cHRpb25BdXRoU3RhdHVzLCBJbmJveFJ1bGVUeXBlLCBLZXlzLCBNYWlsQXV0aGVudGljYXRpb25TdGF0dXMsIFRhYkluZGV4IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IEljb24sIHByb2dyZXNzSWNvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbi5qc1wiXG5pbXBvcnQgeyBmb3JtYXREYXRlV2l0aFdlZWtkYXksIGZvcm1hdERhdGVXaXRoV2Vla2RheUFuZFllYXIsIGZvcm1hdFN0b3JhZ2VTaXplLCBmb3JtYXRUaW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0Zvcm1hdHRlci5qc1wiXG5pbXBvcnQgeyBpc0FuZHJvaWRBcHAsIGlzRGVza3RvcCwgaXNJT1NBcHAgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IEJ1dHRvbiwgQnV0dG9uVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCBCYWRnZSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0JhZGdlLmpzXCJcbmltcG9ydCB7IENvbnRlbnRCbG9ja2luZ1N0YXR1cywgTWFpbFZpZXdlclZpZXdNb2RlbCB9IGZyb20gXCIuL01haWxWaWV3ZXJWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgY2FuU2VlVHV0YUxpbmtzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9HdWlVdGlscy5qc1wiXG5pbXBvcnQgeyBpc05vdE51bGwsIG5vT3AsIHJlc29sdmVNYXliZUxhenkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEljb25CdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb25CdXR0b24uanNcIlxuaW1wb3J0IHsgZ2V0Q29uZmlkZW50aWFsSWNvbiwgZ2V0Rm9sZGVySWNvbkJ5VHlwZSwgaXNUdXRhbm90YVRlYW1NYWlsLCBwcm9tcHRBbmREZWxldGVNYWlscywgc2hvd01vdmVNYWlsc0Ryb3Bkb3duIH0gZnJvbSBcIi4vTWFpbEd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IEJvb3RJY29ucyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvaWNvbnMvQm9vdEljb25zLmpzXCJcbmltcG9ydCB7IGVkaXREcmFmdCwgbWFpbFZpZXdlck1vcmVBY3Rpb25zIH0gZnJvbSBcIi4vTWFpbFZpZXdlclV0aWxzLmpzXCJcbmltcG9ydCB7IGxpdmVEYXRhQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9BcmlhVXRpbHMuanNcIlxuaW1wb3J0IHsgaXNLZXlQcmVzc2VkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXIuanNcIlxuaW1wb3J0IHsgQXR0YWNobWVudEJ1YmJsZSwgZ2V0QXR0YWNobWVudFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9BdHRhY2htZW50QnViYmxlLmpzXCJcbmltcG9ydCB7IHJlc3BvbnNpdmVDYXJkSE1hcmdpbiwgcmVzcG9uc2l2ZUNhcmRIUGFkZGluZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2NhcmRzLmpzXCJcbmltcG9ydCB7IGNvbXBhbnlUZWFtTGFiZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvQ2xpZW50Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L1NoYXJlZE1haWxVdGlscy5qc1wiXG5pbXBvcnQgeyBNYWlsQWRkcmVzc0FuZE5hbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vQ29tbW9uTWFpbFV0aWxzLmpzXCJcbmltcG9ydCB7IExhYmVsc1BvcHVwIH0gZnJvbSBcIi4vTGFiZWxzUG9wdXAuanNcIlxuaW1wb3J0IHsgTGFiZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0xhYmVsLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5cbmV4cG9ydCB0eXBlIE1haWxBZGRyZXNzRHJvcGRvd25DcmVhdG9yID0gKGFyZ3M6IHtcblx0bWFpbEFkZHJlc3M6IE1haWxBZGRyZXNzQW5kTmFtZVxuXHRkZWZhdWx0SW5ib3hSdWxlRmllbGQ6IEluYm94UnVsZVR5cGUgfCBudWxsXG5cdGNyZWF0ZUNvbnRhY3Q/OiBib29sZWFuXG59KSA9PiBQcm9taXNlPEFycmF5PERyb3Bkb3duQnV0dG9uQXR0cnM+PlxuXG5leHBvcnQgaW50ZXJmYWNlIE1haWxWaWV3ZXJIZWFkZXJBdHRycyB7XG5cdC8vIFBhc3NpbmcgdGhlIHdob2xlIHZpZXdNb2RlbCBiZWNhdXNlIHRoZXJlIGFyZSBhIGxvdCBvZiBzZXBhcmF0ZSBiaXRzIHdlIG1pZ2h0IG5lZWQuXG5cdC8vIElmIHdlIHdhbnQgdG8gcmV1c2UgdGhpcyB2aWV3IHdlIHNob3VsZCBwcm9iYWJseSBwYXNzIGV2ZXJ5dGhpbmcgb24gaXRzIG93bi5cblx0dmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsXG5cdGNyZWF0ZU1haWxBZGRyZXNzQ29udGV4dEJ1dHRvbnM6IE1haWxBZGRyZXNzRHJvcGRvd25DcmVhdG9yXG5cdGlzUHJpbWFyeTogYm9vbGVhblxuXHRpbXBvcnRGaWxlOiAoZmlsZTogVHV0YW5vdGFGaWxlKSA9PiB2b2lkXG59XG5cbi8qKiBUaGUgdXBwZXIgcGFydCBvZiB0aGUgbWFpbCB2aWV3ZXIsIGV2ZXJ5dGhpbmcgYnV0IHRoZSBtYWlsIGJvZHkgaXRzZWxmLiAqL1xuZXhwb3J0IGNsYXNzIE1haWxWaWV3ZXJIZWFkZXIgaW1wbGVtZW50cyBDb21wb25lbnQ8TWFpbFZpZXdlckhlYWRlckF0dHJzPiB7XG5cdHByaXZhdGUgZGV0YWlsc0V4cGFuZGVkID0gZmFsc2Vcblx0cHJpdmF0ZSBmaWxlc0V4cGFuZGVkID0gZmFsc2VcblxuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8TWFpbFZpZXdlckhlYWRlckF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHZpZXdNb2RlbCB9ID0gYXR0cnNcblx0XHRjb25zdCBkYXRlVGltZSA9IGZvcm1hdERhdGVXaXRoV2Vla2RheSh2aWV3TW9kZWwubWFpbC5yZWNlaXZlZERhdGUpICsgXCIg4oCiIFwiICsgZm9ybWF0VGltZSh2aWV3TW9kZWwubWFpbC5yZWNlaXZlZERhdGUpXG5cdFx0Y29uc3QgZGF0ZVRpbWVGdWxsID0gZm9ybWF0RGF0ZVdpdGhXZWVrZGF5QW5kWWVhcih2aWV3TW9kZWwubWFpbC5yZWNlaXZlZERhdGUpICsgXCIg4oCiIFwiICsgZm9ybWF0VGltZSh2aWV3TW9kZWwubWFpbC5yZWNlaXZlZERhdGUpXG5cblx0XHRyZXR1cm4gbShcIi5oZWFkZXIuc2VsZWN0YWJsZVwiLCBbXG5cdFx0XHR0aGlzLnJlbmRlclN1YmplY3RBY3Rpb25zTGluZShhdHRycyksXG5cdFx0XHR0aGlzLnJlbmRlckZvbGRlckFuZExhYmVscyh2aWV3TW9kZWwpLFxuXHRcdFx0dGhpcy5yZW5kZXJBZGRyZXNzZXNBbmREYXRlKHZpZXdNb2RlbCwgYXR0cnMsIGRhdGVUaW1lLCBkYXRlVGltZUZ1bGwpLFxuXHRcdFx0bShcblx0XHRcdFx0RXhwYW5kZXJQYW5lbCxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGV4cGFuZGVkOiB0aGlzLmRldGFpbHNFeHBhbmRlZCxcblx0XHRcdFx0fSxcblx0XHRcdFx0dGhpcy5yZW5kZXJEZXRhaWxzKGF0dHJzLCB7IGJ1YmJsZU1lbnVXaWR0aDogMzAwIH0pLFxuXHRcdFx0KSxcblx0XHRcdHRoaXMucmVuZGVyQXR0YWNobWVudHModmlld01vZGVsLCBhdHRycy5pbXBvcnRGaWxlKSxcblx0XHRcdHRoaXMucmVuZGVyQ29ubmVjdGlvbkxvc3RCYW5uZXIodmlld01vZGVsKSxcblx0XHRcdHRoaXMucmVuZGVyRXZlbnRCYW5uZXIodmlld01vZGVsKSxcblx0XHRcdHRoaXMucmVuZGVyQmFubmVycyhhdHRycyksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRm9sZGVyQW5kTGFiZWxzKHZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCkge1xuXHRcdGNvbnN0IGZvbGRlckluZm8gPSB2aWV3TW9kZWwuZ2V0Rm9sZGVySW5mbygpXG5cdFx0aWYgKCFmb2xkZXJJbmZvKSByZXR1cm4gbnVsbFxuXHRcdGNvbnN0IGljb24gPSBnZXRGb2xkZXJJY29uQnlUeXBlKGZvbGRlckluZm8uZm9sZGVyVHlwZSlcblxuXHRcdGNvbnN0IGZvbGRlclRleHQgPSB2aWV3TW9kZWwuZ2V0Rm9sZGVyTWFpbGJveFRleHQoKVxuXHRcdGNvbnN0IGxhYmVscyA9IHZpZXdNb2RlbC5nZXRMYWJlbHMoKVxuXHRcdGlmIChmb2xkZXJUZXh0ID09IG51bGwgJiYgbGFiZWxzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRjb25zdCBtYXJnaW4gPSBweChzaXplLnZwYWRfeHNtKVxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuZmxleC5tYi14cy5mbGV4LXdyYXBcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRjb2x1bW5HYXA6IG1hcmdpbixcblx0XHRcdFx0XHRyb3dHYXA6IG1hcmdpbixcblx0XHRcdFx0fSxcblx0XHRcdFx0Y2xhc3M6IHJlc3BvbnNpdmVDYXJkSE1hcmdpbigpLFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0Zm9sZGVyVGV4dFxuXHRcdFx0XHRcdD8gbShcIi5mbGV4LnNtYWxsXCIsIFtcblx0XHRcdFx0XHRcdFx0bShcIi5iXCIsIG0oXCJcIiwgbGFuZy5nZXQoXCJsb2NhdGlvbl9sYWJlbFwiKSkpLFxuXHRcdFx0XHRcdFx0XHRtKEljb24sIHtcblx0XHRcdFx0XHRcdFx0XHRpY29uLFxuXHRcdFx0XHRcdFx0XHRcdGNvbnRhaW5lcjogXCJkaXZcIixcblx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9idXR0b24sXG5cdFx0XHRcdFx0XHRcdFx0XHRtYXJnaW5MZWZ0OiBtYXJnaW4sXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdG0oXCIuc3BhblwiLCBmb2xkZXJJbmZvLm5hbWUpLFxuXHRcdFx0XHRcdCAgXSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdGxhYmVscy5tYXAoKGxhYmVsKSA9PlxuXHRcdFx0XHRcdG0oTGFiZWwsIHtcblx0XHRcdFx0XHRcdHRleHQ6IGxhYmVsLm5hbWUsXG5cdFx0XHRcdFx0XHRjb2xvcjogbGFiZWwuY29sb3IgPz8gdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdCksXG5cdFx0XHRdLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQWRkcmVzc2VzQW5kRGF0ZSh2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwsIGF0dHJzOiBNYWlsVmlld2VySGVhZGVyQXR0cnMsIGRhdGVUaW1lOiBzdHJpbmcsIGRhdGVUaW1lRnVsbDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgZm9sZGVySW5mbyA9IHZpZXdNb2RlbC5nZXRGb2xkZXJJbmZvKClcblx0XHRpZiAoIWZvbGRlckluZm8pIHJldHVybiBudWxsXG5cblx0XHRjb25zdCBkaXNwbGF5ZWRTZW5kZXIgPSB2aWV3TW9kZWwuZ2V0RGlzcGxheWVkU2VuZGVyKClcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXgubXQteHMuY2xpY2suY29sXCIsXG5cdFx0XHR7XG5cdFx0XHRcdGNsYXNzOiByZXNwb25zaXZlQ2FyZEhNYXJnaW4oKSxcblx0XHRcdFx0cm9sZTogXCJidXR0b25cIixcblx0XHRcdFx0XCJhcmlhLXByZXNzZWRcIjogU3RyaW5nKHRoaXMuZGV0YWlsc0V4cGFuZGVkKSxcblx0XHRcdFx0XCJhcmlhLWV4cGFuZGVkXCI6IFN0cmluZyh0aGlzLmRldGFpbHNFeHBhbmRlZCksXG5cdFx0XHRcdHRhYmluZGV4OiBUYWJJbmRleC5EZWZhdWx0LFxuXHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5kZXRhaWxzRXhwYW5kZWQgPSAhdGhpcy5kZXRhaWxzRXhwYW5kZWRcblx0XHRcdFx0fSxcblx0XHRcdFx0b25rZXlkb3duOiAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdFx0XHRcdGlmIChpc0tleVByZXNzZWQoZS5rZXksIEtleXMuU1BBQ0UsIEtleXMuUkVUVVJOKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5kZXRhaWxzRXhwYW5kZWQgPSAhdGhpcy5kZXRhaWxzRXhwYW5kZWRcblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdGRpc3BsYXllZFNlbmRlciA9PSBudWxsXG5cdFx0XHRcdFx0PyBudWxsXG5cdFx0XHRcdFx0OiBtKFwiLnNtYWxsLmZsZXguZmxleC13cmFwLml0ZW1zLXN0YXJ0XCIsIFtcblx0XHRcdFx0XHRcdFx0bShcInNwYW4udGV4dC1icmVha1wiLCBnZXRNYWlsQWRkcmVzc0Rpc3BsYXlUZXh0KGRpc3BsYXllZFNlbmRlci5uYW1lLCBkaXNwbGF5ZWRTZW5kZXIuYWRkcmVzcywgZmFsc2UpKSxcblx0XHRcdFx0XHQgIF0pLFxuXHRcdFx0XHRtKFwiLmZsZXhcIiwgW1xuXHRcdFx0XHRcdHRoaXMuZ2V0UmVjaXBpZW50RW1haWxBZGRyZXNzKGF0dHJzKSxcblx0XHRcdFx0XHRtKFwiLmZsZXgtZ3Jvd1wiKSxcblx0XHRcdFx0XHRtKFwiLmZsZXguaXRlbXMtY2VudGVyLndoaXRlLXNwYWNlLXByZS5tbC1zLm1sLWJldHdlZW4tc1wiLCB7XG5cdFx0XHRcdFx0XHQvLyBPcmNhIHJlZnVzZXMgdG8gcmVhZCB1dCB1bmxlc3MgaXQncyBub3QgZm9jdXNhYmxlXG5cdFx0XHRcdFx0XHR0YWJpbmRleDogVGFiSW5kZXguRGVmYXVsdCxcblx0XHRcdFx0XHRcdFwiYXJpYS1sYWJlbFwiOiBsYW5nLmdldCh2aWV3TW9kZWwuaXNDb25maWRlbnRpYWwoKSA/IFwiY29uZmlkZW50aWFsX2FjdGlvblwiIDogXCJub25Db25maWRlbnRpYWxfYWN0aW9uXCIpICsgXCIsIFwiICsgZGF0ZVRpbWUsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0bShcIi5mbGV4Lm1sLWJldHdlZW4tcy5pdGVtcy1jZW50ZXJcIiwgW1xuXHRcdFx0XHRcdFx0dmlld01vZGVsLmlzQ29uZmlkZW50aWFsKClcblx0XHRcdFx0XHRcdFx0PyBtKEljb24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdGljb246IGdldENvbmZpZGVudGlhbEljb24odmlld01vZGVsLm1haWwpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGFpbmVyOiBcImRpdlwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9idXR0b24sXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0aG92ZXJUZXh0OiBsYW5nLmdldChcImNvbmZpZGVudGlhbF9sYWJlbFwiKSxcblx0XHRcdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdFx0XHQ6IG51bGwsXG5cblx0XHRcdFx0XHRcdG0oSWNvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBnZXRGb2xkZXJJY29uQnlUeXBlKGZvbGRlckluZm8uZm9sZGVyVHlwZSksXG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lcjogXCJkaXZcIixcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0aG92ZXJUZXh0OiBmb2xkZXJJbmZvLm5hbWUsXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdG0oXCIuc21hbGwuZm9udC13ZWlnaHQtNjAwLnNlbGVjdGFibGUubm8td3JhcFwiLCB7IHN0eWxlOiB7IGNvbG9yOiB0aGVtZS5jb250ZW50X2J1dHRvbiB9IH0sIFtcblx0XHRcdFx0XHRcdFx0bShcIi5ub3ByaW50XCIsIGRhdGVUaW1lKSwgLy8gc2hvdyB0aGUgc2hvcnQgZGF0ZSB3aGVuIHZpZXdpbmdcblx0XHRcdFx0XHRcdFx0bShcIi5ub3NjcmVlblwiLCBkYXRlVGltZUZ1bGwpLCAvLyBzaG93IHRoZSBkYXRlIHdpdGggeWVhciB3aGVuIHByaW50aW5nXG5cdFx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XSksXG5cdFx0XHRdLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU3ViamVjdEFjdGlvbnNMaW5lKGF0dHJzOiBNYWlsVmlld2VySGVhZGVyQXR0cnMpIHtcblx0XHRjb25zdCB7IHZpZXdNb2RlbCB9ID0gYXR0cnNcblx0XHRjb25zdCBjbGFzc2VzID0gdGhpcy5tYWtlU3ViamVjdEFjdGlvbnNMaW5lQ2xhc3NlcygpXG5cdFx0Y29uc3Qgc2VuZGVyTmFtZSA9IHZpZXdNb2RlbC5nZXREaXNwbGF5ZWRTZW5kZXIoKT8ubmFtZT8udHJpbSgpID8/IFwiXCJcblx0XHRjb25zdCBkaXNwbGF5QWRkcmVzc0ZvclNlbmRlciA9IHNlbmRlck5hbWUgPT09IFwiXCJcblxuXHRcdHJldHVybiBtKGNsYXNzZXMsIFtcblx0XHRcdG0oXG5cdFx0XHRcdFwiLmZsZXguZmxleC1ncm93LmFsaWduLXNlbGYtc3RhcnQuaXRlbXMtc3RhcnQub3ZlcmZsb3ctaGlkZGVuXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGFzczogc3R5bGVzLmlzU2luZ2xlQ29sdW1uTGF5b3V0KCkgPyBcIm10LW1cIiA6IFwibXRcIixcblx0XHRcdFx0XHRyb2xlOiBcImJ1dHRvblwiLFxuXHRcdFx0XHRcdFwibWFpbC1leHBhbmRlclwiOiBcInRydWVcIixcblx0XHRcdFx0XHQvLyBcImFyaWEtZXhwYW5kZWRcIiBpcyBhbHdheXMgdHJ1ZSBiZWNhdXNlIHRoaXMgY29tcG9uZW50IGlzIG9ubHkgdXNlZCBpbiBleHBhbmRlZCB2aWV3XG5cdFx0XHRcdFx0XCJhcmlhLWV4cGFuZGVkXCI6IFwidHJ1ZVwiLFxuXHRcdFx0XHRcdHRhYmluZGV4OiBUYWJJbmRleC5EZWZhdWx0LFxuXHRcdFx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHR2aWV3TW9kZWwuY29sbGFwc2VNYWlsKClcblx0XHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9ua2V5ZG93bjogKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRcdFx0XHRcdGlmIChpc0tleVByZXNzZWQoZS5rZXksIEtleXMuU1BBQ0UsIEtleXMuUkVUVVJOKSAmJiAoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLmhhc0F0dHJpYnV0ZShcIm1haWwtZXhwYW5kZXJcIikpIHtcblx0XHRcdFx0XHRcdFx0dmlld01vZGVsLmNvbGxhcHNlTWFpbCgpXG5cdFx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFtcblx0XHRcdFx0XHR2aWV3TW9kZWwuaXNVbnJlYWQoKSA/IHRoaXMucmVuZGVyVW5yZWFkRG90KCkgOiBudWxsLFxuXHRcdFx0XHRcdHZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpXG5cdFx0XHRcdFx0XHQ/IG0oXG5cdFx0XHRcdFx0XHRcdFx0XCIubXIteHMuYWxpZ24tc2VsZi1jZW50ZXJcIixcblx0XHRcdFx0XHRcdFx0XHRtKEljb24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLkVkaXQsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250YWluZXI6IFwiZGl2XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmaWxsOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRob3ZlclRleHQ6IGxhbmcuZ2V0KFwiZHJhZnRfbGFiZWxcIiksXG5cdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0XHR0aGlzLnR1dGFvQmFkZ2Uodmlld01vZGVsKSxcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCJzcGFuXCIgKyAoZGlzcGxheUFkZHJlc3NGb3JTZW5kZXIgPyBcIi5pbnZpc2libGUub3ZlcmZsb3ctaGlkZGVuXCIgOiBcIi50ZXh0LWJyZWFrXCIpICsgKHZpZXdNb2RlbC5pc1VucmVhZCgpID8gXCIuZm9udC13ZWlnaHQtNjAwXCIgOiBcIlwiKSxcblx0XHRcdFx0XHRcdGRpc3BsYXlBZGRyZXNzRm9yU2VuZGVyID8gdmlld01vZGVsLmdldERpc3BsYXllZFNlbmRlcigpPy5hZGRyZXNzID8/IFwiXCIgOiBzZW5kZXJOYW1lLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdF0sXG5cdFx0XHQpLFxuXHRcdFx0bShcblx0XHRcdFx0XCIuZmxleC1lbmQuaXRlbXMtc3RhcnQubWwtYmV0d2Vlbi1zXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGFzczogc3R5bGVzLmlzU2luZ2xlQ29sdW1uTGF5b3V0KCkgPyBcIlwiIDogXCJtdC14c1wiLFxuXHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHQvLyBhbGlnbiBcIm1vcmVcIiBidXR0b24gd2l0aCB0aGUgZGF0ZXRpbWUgdGV4dFxuXHRcdFx0XHRcdFx0bWFyZ2luUmlnaHQ6IHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpID8gXCItM3B4XCIgOiBcIjZweFwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25jbGljazogKGU6IE1vdXNlRXZlbnQpID0+IGUuc3RvcFByb3BhZ2F0aW9uKCksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXMubW9yZUJ1dHRvbihhdHRycyksXG5cdFx0XHQpLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclVucmVhZERvdCgpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5mbGV4LmZsZXgtbm8tZ3Jvdy5uby1zaHJpbmsucHItc1wiLFxuXHRcdFx0e1xuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdHBhZGRpbmdUb3A6IFwiMnB4XCIsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0bShcIi5kb3QuYmctYWNjZW50LWZnXCIpLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgbWFrZVN1YmplY3RBY3Rpb25zTGluZUNsYXNzZXMoKSB7XG5cdFx0bGV0IGNsYXNzZXMgPSBcIi5mbGV4LmNsaWNrXCJcblx0XHRpZiAoc3R5bGVzLmlzU2luZ2xlQ29sdW1uTGF5b3V0KCkpIHtcblx0XHRcdGNsYXNzZXMgKz0gXCIubWxcIlxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjbGFzc2VzICs9IFwiLnBsLWxcIlxuXHRcdH1cblxuXHRcdHJldHVybiBjbGFzc2VzXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckJhbm5lcnMoYXR0cnM6IE1haWxWaWV3ZXJIZWFkZXJBdHRycyk6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHZpZXdNb2RlbCB9ID0gYXR0cnNcblx0XHRpZiAodmlld01vZGVsLmlzQ29sbGFwc2VkKCkpIHJldHVybiBudWxsXG5cdFx0Ly8gd2UgZG9uJ3Qgd3JhcCBpdCBpbiBhIHNpbmdsZSBlbGVtZW50IGJlY2F1c2Ugb3VyIGNvbnRhaW5lciBtaWdodCBkZXBlbmQgb24gdXMgYmVpbmcgc2VwYXJhdGUgY2hpbGRyZW4gZm9yIG1hcmdpbnNcblx0XHRyZXR1cm4gW1xuXHRcdFx0bShcblx0XHRcdFx0XCIuXCIgKyByZXNwb25zaXZlQ2FyZEhNYXJnaW4oKSxcblx0XHRcdFx0dGhpcy5yZW5kZXJQaGlzaGluZ1dhcm5pbmcodmlld01vZGVsKSA/PyB2aWV3TW9kZWwuaXNXYXJuaW5nRGlzbWlzc2VkKClcblx0XHRcdFx0XHQ/IG51bGxcblx0XHRcdFx0XHQ6IHRoaXMucmVuZGVySGFyZEF1dGhlbnRpY2F0aW9uRmFpbFdhcm5pbmcodmlld01vZGVsKSA/PyB0aGlzLnJlbmRlclNvZnRBdXRoZW50aWNhdGlvbkZhaWxXYXJuaW5nKHZpZXdNb2RlbCksXG5cdFx0XHQpLFxuXHRcdFx0bShcIi5cIiArIHJlc3BvbnNpdmVDYXJkSE1hcmdpbigpLCB0aGlzLnJlbmRlckV4dGVybmFsQ29udGVudEJhbm5lcihhdHRycykpLFxuXHRcdFx0bShcImhyLmhyLm10LXhzLlwiICsgcmVzcG9uc2l2ZUNhcmRITWFyZ2luKCkpLFxuXHRcdF0uZmlsdGVyKEJvb2xlYW4pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckNvbm5lY3Rpb25Mb3N0QmFubmVyKHZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCk6IENoaWxkcmVuIHtcblx0XHQvLyBJZiB0aGUgbWFpbCBib2R5IGZhaWxlZCB0byBsb2FkLCB0aGVuIHdlIHNob3cgYSBtZXNzYWdlIGluIHRoZSBtYWluIGNvbHVtblxuXHRcdC8vIElmIHRoZSBtYWlsIGJvZHkgZGlkIGxvYWQgYnV0IG5vdCBldmVyeXRoaW5nIGVsc2UsIHdlIHNob3cgdGhlIG1lc3NhZ2UgaGVyZVxuXHRcdGlmICh2aWV3TW9kZWwuaXNDb25uZWN0aW9uTG9zdCgpKSB7XG5cdFx0XHRyZXR1cm4gbShcblx0XHRcdFx0XCIuXCIgKyByZXNwb25zaXZlQ2FyZEhNYXJnaW4oKSxcblx0XHRcdFx0bShJbmZvQmFubmVyLCB7XG5cdFx0XHRcdFx0bWVzc2FnZTogXCJtYWlsUGFydHNOb3RMb2FkZWRfbXNnXCIsXG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuV2FybmluZyxcblx0XHRcdFx0XHRidXR0b25zOiBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcInJldHJ5X2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLmxvYWRBbGwoUHJvbWlzZS5yZXNvbHZlKCkpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckV2ZW50QmFubmVyKHZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBldmVudEF0dGFjaG1lbnQgPSB2aWV3TW9kZWwuZ2V0Q2FsZW5kYXJFdmVudEF0dGFjaG1lbnQoKVxuXHRcdHJldHVybiBldmVudEF0dGFjaG1lbnRcblx0XHRcdD8gbShcblx0XHRcdFx0XHRcIi5cIiArIHJlc3BvbnNpdmVDYXJkSE1hcmdpbigpLFxuXHRcdFx0XHRcdG0oRXZlbnRCYW5uZXIsIHtcblx0XHRcdFx0XHRcdGNvbnRlbnRzOiBldmVudEF0dGFjaG1lbnQuY29udGVudHMsXG5cdFx0XHRcdFx0XHRyZWNpcGllbnQ6IGV2ZW50QXR0YWNobWVudC5yZWNpcGllbnQsXG5cdFx0XHRcdFx0XHRtYWlsOiB2aWV3TW9kZWwubWFpbCxcblx0XHRcdFx0XHR9IHNhdGlzZmllcyBFdmVudEJhbm5lckF0dHJzKSxcblx0XHRcdCAgKVxuXHRcdFx0OiBudWxsXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRldGFpbHMoYXR0cnM6IE1haWxWaWV3ZXJIZWFkZXJBdHRycywgeyBidWJibGVNZW51V2lkdGggfTogeyBidWJibGVNZW51V2lkdGg6IG51bWJlciB9KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgdmlld01vZGVsLCBjcmVhdGVNYWlsQWRkcmVzc0NvbnRleHRCdXR0b25zIH0gPSBhdHRyc1xuXHRcdGNvbnN0IGVudmVsb3BlU2VuZGVyID0gdmlld01vZGVsLmdldERpZmZlcmVudEVudmVsb3BlU2VuZGVyKClcblx0XHRjb25zdCBkaXNwbGF5ZWRTZW5kZXIgPSB2aWV3TW9kZWwuZ2V0RGlzcGxheWVkU2VuZGVyKClcblxuXHRcdHJldHVybiBtKFwiLlwiICsgcmVzcG9uc2l2ZUNhcmRIUGFkZGluZygpLCBsaXZlRGF0YUF0dHJzKCksIFtcblx0XHRcdG0oXG5cdFx0XHRcdFwiLm10LXNcIixcblx0XHRcdFx0ZGlzcGxheWVkU2VuZGVyID09IG51bGxcblx0XHRcdFx0XHQ/IG51bGxcblx0XHRcdFx0XHQ6IFtcblx0XHRcdFx0XHRcdFx0bShcIi5zbWFsbC5iXCIsIGxhbmcuZ2V0KFwiZnJvbV9sYWJlbFwiKSksXG5cdFx0XHRcdFx0XHRcdG0oUmVjaXBpZW50QnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQoZGlzcGxheWVkU2VuZGVyLm5hbWUsIGRpc3BsYXllZFNlbmRlci5hZGRyZXNzLCBmYWxzZSksXG5cdFx0XHRcdFx0XHRcdFx0Y2xpY2s6IGNyZWF0ZUFzeW5jRHJvcGRvd24oe1xuXHRcdFx0XHRcdFx0XHRcdFx0bGF6eUJ1dHRvbnM6ICgpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNyZWF0ZU1haWxBZGRyZXNzQ29udGV4dEJ1dHRvbnMoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1haWxBZGRyZXNzOiBkaXNwbGF5ZWRTZW5kZXIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdEluYm94UnVsZUZpZWxkOiBJbmJveFJ1bGVUeXBlLkZST01fRVFVQUxTLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBidWJibGVNZW51V2lkdGgsXG5cdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCAgXSxcblx0XHRcdFx0ZW52ZWxvcGVTZW5kZXJcblx0XHRcdFx0XHQ/IFtcblx0XHRcdFx0XHRcdFx0bShcIi5zbWFsbC5iXCIsIGxhbmcuZ2V0KFwic2VuZGVyX2xhYmVsXCIpKSxcblx0XHRcdFx0XHRcdFx0bShSZWNpcGllbnRCdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogZ2V0TWFpbEFkZHJlc3NEaXNwbGF5VGV4dChcIlwiLCBlbnZlbG9wZVNlbmRlciwgZmFsc2UpLFxuXHRcdFx0XHRcdFx0XHRcdGNsaWNrOiBjcmVhdGVBc3luY0Ryb3Bkb3duKHtcblx0XHRcdFx0XHRcdFx0XHRcdGxhenlCdXR0b25zOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGNoaWxkRWxlbWVudHMgPSBbXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aW5mbzogbGFuZy5nZXQoXCJlbnZlbG9wZVNlbmRlckluZm9fbXNnXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2VudGVyOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJvbGQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aW5mbzogZW52ZWxvcGVTZW5kZXIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjZW50ZXI6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRib2xkOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29udGV4dEJ1dHRvbnMgPSBhd2FpdCBjcmVhdGVNYWlsQWRkcmVzc0NvbnRleHRCdXR0b25zKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtYWlsQWRkcmVzczoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWRkcmVzczogZW52ZWxvcGVTZW5kZXIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuYW1lOiBcIlwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdEluYm94UnVsZUZpZWxkOiBJbmJveFJ1bGVUeXBlLkZST01fRVFVQUxTLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNyZWF0ZUNvbnRhY3Q6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gWy4uLmNoaWxkRWxlbWVudHMsIC4uLmNvbnRleHRCdXR0b25zXVxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBidWJibGVNZW51V2lkdGgsXG5cdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdCksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5tdC1zXCIsXG5cdFx0XHRcdHZpZXdNb2RlbC5nZXRUb1JlY2lwaWVudHMoKS5sZW5ndGhcblx0XHRcdFx0XHQ/IFtcblx0XHRcdFx0XHRcdFx0bShcIi5zbWFsbC5iXCIsIGxhbmcuZ2V0KFwidG9fbGFiZWxcIikpLFxuXHRcdFx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XHRcdFwiLmZsZXguY29sLm10LWJldHdlZW4tc1wiLFxuXHRcdFx0XHRcdFx0XHRcdHZpZXdNb2RlbC5nZXRUb1JlY2lwaWVudHMoKS5tYXAoKHJlY2lwaWVudCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiLmZsZXhcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0bShSZWNpcGllbnRCdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbDogZ2V0TWFpbEFkZHJlc3NEaXNwbGF5VGV4dChyZWNpcGllbnQubmFtZSwgcmVjaXBpZW50LmFkZHJlc3MsIGZhbHNlKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjbGljazogY3JlYXRlQXN5bmNEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y3JlYXRlTWFpbEFkZHJlc3NDb250ZXh0QnV0dG9ucyh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWFpbEFkZHJlc3M6IHJlY2lwaWVudCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0SW5ib3hSdWxlRmllbGQ6IEluYm94UnVsZVR5cGUuUkVDSVBJRU5UX1RPX0VRVUFMUyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDogYnViYmxlTWVudVdpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRvIHdyYXAgdGV4dCBpbnNpZGUgZmxleCBjb250YWluZXIsIHdlIG5lZWQgdG8gYWxsb3cgZWxlbWVudCB0byBzaHJpbmsgYW5kIHBpY2sgb3duIHdpZHRoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZsZXg6IFwiMCAxIGF1dG9cIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHQgIF1cblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHQpLFxuXHRcdFx0bShcblx0XHRcdFx0XCIubXQtc1wiLFxuXHRcdFx0XHR2aWV3TW9kZWwuZ2V0Q2NSZWNpcGllbnRzKCkubGVuZ3RoXG5cdFx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRcdG0oXCIuc21hbGwuYlwiLCBsYW5nLmdldChcImNjX2xhYmVsXCIpKSxcblx0XHRcdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFx0XHRcIi5mbGV4LXN0YXJ0LmZsZXgtd3JhcFwiLFxuXHRcdFx0XHRcdFx0XHRcdHZpZXdNb2RlbC5nZXRDY1JlY2lwaWVudHMoKS5tYXAoKHJlY2lwaWVudCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdG0oUmVjaXBpZW50QnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBnZXRNYWlsQWRkcmVzc0Rpc3BsYXlUZXh0KHJlY2lwaWVudC5uYW1lLCByZWNpcGllbnQuYWRkcmVzcywgZmFsc2UpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjbGljazogY3JlYXRlQXN5bmNEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGF6eUJ1dHRvbnM6ICgpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVNYWlsQWRkcmVzc0NvbnRleHRCdXR0b25zKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWFpbEFkZHJlc3M6IHJlY2lwaWVudCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdEluYm94UnVsZUZpZWxkOiBJbmJveFJ1bGVUeXBlLlJFQ0lQSUVOVF9DQ19FUVVBTFMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDogYnViYmxlTWVudVdpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbGV4OiBcIjAgMSBhdXRvXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdCksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5tdC1zXCIsXG5cdFx0XHRcdHZpZXdNb2RlbC5nZXRCY2NSZWNpcGllbnRzKCkubGVuZ3RoXG5cdFx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRcdG0oXCIuc21hbGwuYlwiLCBsYW5nLmdldChcImJjY19sYWJlbFwiKSksXG5cdFx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFx0XCIuZmxleC1zdGFydC5mbGV4LXdyYXBcIixcblx0XHRcdFx0XHRcdFx0XHR2aWV3TW9kZWwuZ2V0QmNjUmVjaXBpZW50cygpLm1hcCgocmVjaXBpZW50KSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0bShSZWNpcGllbnRCdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQocmVjaXBpZW50Lm5hbWUsIHJlY2lwaWVudC5hZGRyZXNzLCBmYWxzZSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsaWNrOiBjcmVhdGVBc3luY0Ryb3Bkb3duKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNyZWF0ZU1haWxBZGRyZXNzQ29udGV4dEJ1dHRvbnMoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtYWlsQWRkcmVzczogcmVjaXBpZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0SW5ib3hSdWxlRmllbGQ6IEluYm94UnVsZVR5cGUuUkVDSVBJRU5UX0JDQ19FUVVBTFMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDogYnViYmxlTWVudVdpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbGV4OiBcIjAgMSBhdXRvXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdCksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5tdC1zXCIsXG5cdFx0XHRcdHZpZXdNb2RlbC5nZXRSZXBseVRvcygpLmxlbmd0aFxuXHRcdFx0XHRcdD8gW1xuXHRcdFx0XHRcdFx0XHRtKFwiLnNtYWxsLmJcIiwgbGFuZy5nZXQoXCJyZXBseVRvX2xhYmVsXCIpKSxcblx0XHRcdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFx0XHRcIi5mbGV4LXN0YXJ0LmZsZXgtd3JhcFwiLFxuXHRcdFx0XHRcdFx0XHRcdHZpZXdNb2RlbC5nZXRSZXBseVRvcygpLm1hcCgocmVjaXBpZW50KSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0bShSZWNpcGllbnRCdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQocmVjaXBpZW50Lm5hbWUsIHJlY2lwaWVudC5hZGRyZXNzLCBmYWxzZSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsaWNrOiBjcmVhdGVBc3luY0Ryb3Bkb3duKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNyZWF0ZU1haWxBZGRyZXNzQ29udGV4dEJ1dHRvbnMoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtYWlsQWRkcmVzczogcmVjaXBpZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0SW5ib3hSdWxlRmllbGQ6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDogYnViYmxlTWVudVdpZHRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmbGV4OiBcIjAgMSBhdXRvXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdCksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQXR0YWNobWVudHModmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsLCBpbXBvcnRGaWxlOiAoZmlsZTogVHV0YW5vdGFGaWxlKSA9PiB2b2lkKTogQ2hpbGRyZW4ge1xuXHRcdC8vIFNob3cgYSBsb2FkaW5nIHN5bWJvbCBpZiB3ZSBhcmUgbG9hZGluZyBhdHRhY2htZW50c1xuXHRcdGlmICh2aWV3TW9kZWwuaXNMb2FkaW5nQXR0YWNobWVudHMoKSAmJiAhdmlld01vZGVsLmlzQ29ubmVjdGlvbkxvc3QoKSkge1xuXHRcdFx0cmV0dXJuIG0oXCIuZmxleC5cIiArIHJlc3BvbnNpdmVDYXJkSE1hcmdpbigpLCBbXG5cdFx0XHRcdG0oXCIuZmxleC12LWNlbnRlci5wbC1idXR0b25cIiwgcHJvZ3Jlc3NJY29uKCkpLFxuXHRcdFx0XHRtKFwiLnNtYWxsLmZsZXgtdi1jZW50ZXIucGxyLmJ1dHRvbi1oZWlnaHRcIiwgbGFuZy5nZXQoXCJsb2FkaW5nX21zZ1wiKSksXG5cdFx0XHRdKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBhdHRhY2htZW50cyA9IHZpZXdNb2RlbC5nZXROb25JbmxpbmVBdHRhY2htZW50cygpXG5cdFx0XHRjb25zdCBhdHRhY2htZW50Q291bnQgPSBhdHRhY2htZW50cy5sZW5ndGhcblxuXHRcdFx0Ly8gRG8gbm90aGluZyBpZiB3ZSBoYXZlIG5vIGF0dGFjaG1lbnRzXG5cdFx0XHRpZiAoYXR0YWNobWVudENvdW50ID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cblx0XHRcdC8vIEdldCB0aGUgdG90YWwgc2l6ZSBvZiB0aGUgYXR0YWNobWVudHNcblx0XHRcdGxldCB0b3RhbEF0dGFjaG1lbnRTaXplID0gMFxuXHRcdFx0Zm9yIChjb25zdCBhdHRhY2htZW50IG9mIGF0dGFjaG1lbnRzKSB7XG5cdFx0XHRcdHRvdGFsQXR0YWNobWVudFNpemUgKz0gTnVtYmVyKGF0dGFjaG1lbnQuc2l6ZSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0bShcIi5mbGV4Lm10LXMubWItc1wiICsgXCIuXCIgKyByZXNwb25zaXZlQ2FyZEhNYXJnaW4oKSwgbGl2ZURhdGFBdHRycygpLCBbXG5cdFx0XHRcdFx0YXR0YWNobWVudENvdW50ID09PSAxXG5cdFx0XHRcdFx0XHQ/IC8vIElmIHdlIGhhdmUgZXhhY3RseSBvbmUgYXR0YWNobWVudCwganVzdCBzaG93IHRoZSBhdHRhY2htZW50XG5cdFx0XHRcdFx0XHQgIHRoaXMucmVuZGVyQXR0YWNobWVudENvbnRhaW5lcih2aWV3TW9kZWwsIGF0dGFjaG1lbnRzLCBpbXBvcnRGaWxlKVxuXHRcdFx0XHRcdFx0OiAvLyBPdGhlcndpc2UsIHdlIHNob3cgdGhlIG51bWJlciBvZiBhdHRhY2htZW50cyBhbmQgaXRzIHRvdGFsIHNpemUgYWxvbmcgd2l0aCBhIHNob3cgYWxsIGJ1dHRvblxuXHRcdFx0XHRcdFx0ICBtKEV4cGFuZGVyQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGxhbmcubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJhdHRhY2htZW50QW1vdW50X2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRsYW5nLmdldChcImF0dGFjaG1lbnRBbW91bnRfbGFiZWxcIiwgeyBcInthbW91bnR9XCI6IGF0dGFjaG1lbnRDb3VudCArIFwiXCIgfSkgKyBgICgke2Zvcm1hdFN0b3JhZ2VTaXplKHRvdGFsQXR0YWNobWVudFNpemUpfSlgLFxuXHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFwicGFkZGluZy10b3BcIjogXCJpbmhlcml0XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IFwiaW5oZXJpdFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJtaW4taGVpZ2h0XCI6IFwiaW5oZXJpdFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJ0ZXh0LWRlY29yYXRpb25cIjogXCJub25lXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcImZvbnQtd2VpZ2h0XCI6IFwibm9ybWFsXCIsXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRleHBhbmRlZDogdGhpcy5maWxlc0V4cGFuZGVkLFxuXHRcdFx0XHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2ZnLFxuXHRcdFx0XHRcdFx0XHRcdGlzQmlnOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdGlzVW5mb3JtYXR0ZWRMYWJlbDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRvbkV4cGFuZGVkQ2hhbmdlOiAoY2hhbmdlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZpbGVzRXhwYW5kZWQgPSBjaGFuZ2Vcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ICB9KSxcblx0XHRcdFx0XSksXG5cblx0XHRcdFx0Ly8gaWYgd2UgaGF2ZSBtb3JlIHRoYW4gb25lIGF0dGFjaG1lbnQsIGxpc3QgdGhlbSBoZXJlIGluIHRoaXMgZXhwYW5kZXIgcGFuZWxcblx0XHRcdFx0YXR0YWNobWVudHMubGVuZ3RoID4gMVxuXHRcdFx0XHRcdD8gbShcblx0XHRcdFx0XHRcdFx0RXhwYW5kZXJQYW5lbCxcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiB0aGlzLmZpbGVzRXhwYW5kZWQsXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdG0oXCIuZmxleC5jb2wuXCIgKyByZXNwb25zaXZlQ2FyZEhNYXJnaW4oKSwgW1xuXHRcdFx0XHRcdFx0XHRcdG0oXCIuZmxleC5mbGV4LXdyYXAuZ2FwLWhwYWRcIiwgdGhpcy5yZW5kZXJBdHRhY2htZW50Q29udGFpbmVyKHZpZXdNb2RlbCwgYXR0YWNobWVudHMsIGltcG9ydEZpbGUpKSxcblx0XHRcdFx0XHRcdFx0XHRpc0lPU0FwcCgpXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IG51bGxcblx0XHRcdFx0XHRcdFx0XHRcdDogbShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcIi5mbGV4XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bShCdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcInNhdmVBbGxfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB2aWV3TW9kZWwuZG93bmxvYWRBbGwoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdCAgKSxcblx0XHRcdFx0XHRcdFx0XSksXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQXR0YWNobWVudENvbnRhaW5lcih2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwsIGF0dGFjaG1lbnRzOiBUdXRhbm90YUZpbGVbXSwgaW1wb3J0RmlsZTogKGZpbGU6IFR1dGFub3RhRmlsZSkgPT4gdm9pZCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gYXR0YWNobWVudHMubWFwKChhdHRhY2htZW50KSA9PiB7XG5cdFx0XHRjb25zdCBhdHRhY2htZW50VHlwZSA9IGdldEF0dGFjaG1lbnRUeXBlKGF0dGFjaG1lbnQubWltZVR5cGUgPz8gXCJcIilcblx0XHRcdHJldHVybiBtKEF0dGFjaG1lbnRCdWJibGUsIHtcblx0XHRcdFx0YXR0YWNobWVudCxcblx0XHRcdFx0cmVtb3ZlOiBudWxsLFxuXHRcdFx0XHRkb3dubG9hZDpcblx0XHRcdFx0XHRpc0FuZHJvaWRBcHAoKSB8fCBpc0Rlc2t0b3AoKVxuXHRcdFx0XHRcdFx0PyAoKSA9PiB2aWV3TW9kZWwuZG93bmxvYWRBbmRPcGVuQXR0YWNobWVudChhdHRhY2htZW50LCBmYWxzZSlcblx0XHRcdFx0XHRcdDogKCkgPT4gdmlld01vZGVsLmRvd25sb2FkQW5kT3BlbkF0dGFjaG1lbnQoYXR0YWNobWVudCwgdHJ1ZSksXG5cdFx0XHRcdG9wZW46IGlzQW5kcm9pZEFwcCgpIHx8IGlzRGVza3RvcCgpID8gKCkgPT4gdmlld01vZGVsLmRvd25sb2FkQW5kT3BlbkF0dGFjaG1lbnQoYXR0YWNobWVudCwgdHJ1ZSkgOiBudWxsLFxuXHRcdFx0XHRmaWxlSW1wb3J0OiB2aWV3TW9kZWwuY2FuSW1wb3J0RmlsZShhdHRhY2htZW50KSA/ICgpID0+IGltcG9ydEZpbGUoYXR0YWNobWVudCkgOiBudWxsLFxuXHRcdFx0XHR0eXBlOiBhdHRhY2htZW50VHlwZSxcblx0XHRcdH0pXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgdHV0YW9CYWRnZSh2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIGlzVHV0YW5vdGFUZWFtTWFpbCh2aWV3TW9kZWwubWFpbClcblx0XHRcdD8gbShcblx0XHRcdFx0XHRCYWRnZSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjbGFzc2VzOiBcIi5tci1zXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjb21wYW55VGVhbUxhYmVsLFxuXHRcdFx0ICApXG5cdFx0XHQ6IG51bGxcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUGhpc2hpbmdXYXJuaW5nKHZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCk6IENoaWxkcmVuIHwgbnVsbCB7XG5cdFx0aWYgKHZpZXdNb2RlbC5pc01haWxTdXNwaWNpb3VzKCkpIHtcblx0XHRcdHJldHVybiBtKEluZm9CYW5uZXIsIHtcblx0XHRcdFx0bWVzc2FnZTogXCJwaGlzaGluZ01lc3NhZ2VCb2R5X21zZ1wiLFxuXHRcdFx0XHRpY29uOiBJY29ucy5XYXJuaW5nLFxuXHRcdFx0XHR0eXBlOiBCYW5uZXJUeXBlLldhcm5pbmcsXG5cdFx0XHRcdGhlbHBMaW5rOiBjYW5TZWVUdXRhTGlua3Modmlld01vZGVsLmxvZ2lucykgPyBJbmZvTGluay5QaGlzaGluZyA6IG51bGwsXG5cdFx0XHRcdGJ1dHRvbnM6IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJtYXJrQXNOb3RQaGlzaGluZ19hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB2aWV3TW9kZWwubWFya0FzTm90UGhpc2hpbmcoKS50aGVuKCgpID0+IG0ucmVkcmF3KCkpLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVySGFyZEF1dGhlbnRpY2F0aW9uRmFpbFdhcm5pbmcodmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsKTogQ2hpbGRyZW4gfCBudWxsIHtcblx0XHRjb25zdCBhdXRoRmFpbGVkID1cblx0XHRcdHZpZXdNb2RlbC5jaGVja01haWxBdXRoZW50aWNhdGlvblN0YXR1cyhNYWlsQXV0aGVudGljYXRpb25TdGF0dXMuSEFSRF9GQUlMKSB8fFxuXHRcdFx0dmlld01vZGVsLm1haWwuZW5jcnlwdGlvbkF1dGhTdGF0dXMgPT09IEVuY3J5cHRpb25BdXRoU3RhdHVzLlRVVEFDUllQVF9BVVRIRU5USUNBVElPTl9GQUlMRURcblxuXHRcdGlmIChhdXRoRmFpbGVkKSB7XG5cdFx0XHRyZXR1cm4gbShJbmZvQmFubmVyLCB7XG5cdFx0XHRcdG1lc3NhZ2U6IFwibWFpbEF1dGhGYWlsZWRfbXNnXCIsXG5cdFx0XHRcdGljb246IEljb25zLldhcm5pbmcsXG5cdFx0XHRcdGhlbHBMaW5rOiBjYW5TZWVUdXRhTGlua3Modmlld01vZGVsLmxvZ2lucykgPyBJbmZvTGluay5NYWlsQXV0aCA6IG51bGwsXG5cdFx0XHRcdHR5cGU6IEJhbm5lclR5cGUuV2FybmluZyxcblx0XHRcdFx0YnV0dG9uczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcImNsb3NlX2FsdFwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHZpZXdNb2RlbC5zZXRXYXJuaW5nRGlzbWlzc2VkKHRydWUpLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU29mdEF1dGhlbnRpY2F0aW9uRmFpbFdhcm5pbmcodmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsKTogQ2hpbGRyZW4gfCBudWxsIHtcblx0XHRjb25zdCBidXR0b25zOiBSZWFkb25seUFycmF5PEJhbm5lckJ1dHRvbkF0dHJzIHwgbnVsbD4gPSBbXG5cdFx0XHR7XG5cdFx0XHRcdGxhYmVsOiBcImNsb3NlX2FsdFwiLFxuXHRcdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLnNldFdhcm5pbmdEaXNtaXNzZWQodHJ1ZSksXG5cdFx0XHR9LFxuXHRcdF1cblx0XHRpZiAodmlld01vZGVsLm1haWwuZW5jcnlwdGlvbkF1dGhTdGF0dXMgPT09IEVuY3J5cHRpb25BdXRoU3RhdHVzLlJTQV9ERVNQSVRFX1RVVEFDUllQVCkge1xuXHRcdFx0cmV0dXJuIG0oSW5mb0Jhbm5lciwge1xuXHRcdFx0XHRtZXNzYWdlOiAoKSA9PiBsYW5nLmdldChcImRlcHJlY2F0ZWRLZXlXYXJuaW5nX21zZ1wiKSxcblx0XHRcdFx0aWNvbjogSWNvbnMuV2FybmluZyxcblx0XHRcdFx0aGVscExpbms6IGNhblNlZVR1dGFMaW5rcyh2aWV3TW9kZWwubG9naW5zKSA/IEluZm9MaW5rLkRlcHJlY2F0ZWRLZXkgOiBudWxsLFxuXHRcdFx0XHRidXR0b25zOiBidXR0b25zLFxuXHRcdFx0fSlcblx0XHR9IGVsc2UgaWYgKHZpZXdNb2RlbC5jaGVja01haWxBdXRoZW50aWNhdGlvblN0YXR1cyhNYWlsQXV0aGVudGljYXRpb25TdGF0dXMuU09GVF9GQUlMKSkge1xuXHRcdFx0cmV0dXJuIG0oSW5mb0Jhbm5lciwge1xuXHRcdFx0XHRtZXNzYWdlOiAoKSA9PlxuXHRcdFx0XHRcdHZpZXdNb2RlbC5tYWlsLmRpZmZlcmVudEVudmVsb3BlU2VuZGVyXG5cdFx0XHRcdFx0XHQ/IGxhbmcuZ2V0KFwibWFpbEF1dGhNaXNzaW5nV2l0aFRlY2huaWNhbFNlbmRlcl9tc2dcIiwge1xuXHRcdFx0XHRcdFx0XHRcdFwie3NlbmRlcn1cIjogdmlld01vZGVsLm1haWwuZGlmZmVyZW50RW52ZWxvcGVTZW5kZXIsXG5cdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHQ6IGxhbmcuZ2V0KFwibWFpbEF1dGhNaXNzaW5nX2xhYmVsXCIpLFxuXHRcdFx0XHRpY29uOiBJY29ucy5XYXJuaW5nLFxuXHRcdFx0XHRoZWxwTGluazogY2FuU2VlVHV0YUxpbmtzKHZpZXdNb2RlbC5sb2dpbnMpID8gSW5mb0xpbmsuTWFpbEF1dGggOiBudWxsLFxuXHRcdFx0XHRidXR0b25zOiBidXR0b25zLFxuXHRcdFx0fSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckV4dGVybmFsQ29udGVudEJhbm5lcihhdHRyczogTWFpbFZpZXdlckhlYWRlckF0dHJzKTogQ2hpbGRyZW4gfCBudWxsIHtcblx0XHQvLyBvbmx5IHNob3cgYmFubmVyIHdoZW4gdGhlcmUgYXJlIGJsb2NrZWQgaW1hZ2VzIGFuZCB0aGUgdXNlciBoYXNuJ3QgbWFkZSBhIGRlY2lzaW9uIGFib3V0IGhvdyB0byBoYW5kbGUgdGhlbVxuXHRcdGlmIChhdHRycy52aWV3TW9kZWwuZ2V0Q29udGVudEJsb2NraW5nU3RhdHVzKCkgIT09IENvbnRlbnRCbG9ja2luZ1N0YXR1cy5CbG9jaykge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRjb25zdCBzaG93QnV0dG9uOiBCYW5uZXJCdXR0b25BdHRycyA9IHtcblx0XHRcdGxhYmVsOiBcInNob3dCbG9ja2VkQ29udGVudF9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoKSA9PiBhdHRycy52aWV3TW9kZWwuc2V0Q29udGVudEJsb2NraW5nU3RhdHVzKENvbnRlbnRCbG9ja2luZ1N0YXR1cy5TaG93KSxcblx0XHR9XG5cdFx0Y29uc3QgYWx3YXlzT3JOZXZlckFsbG93QnV0dG9ucyA9IGF0dHJzLnZpZXdNb2RlbC5jYW5QZXJzaXN0QmxvY2tpbmdTdGF0dXMoKVxuXHRcdFx0PyBbXG5cdFx0XHRcdFx0YXR0cnMudmlld01vZGVsLmNoZWNrTWFpbEF1dGhlbnRpY2F0aW9uU3RhdHVzKE1haWxBdXRoZW50aWNhdGlvblN0YXR1cy5BVVRIRU5USUNBVEVEKVxuXHRcdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiYWxsb3dFeHRlcm5hbENvbnRlbnRTZW5kZXJfYWN0aW9uXCIgYXMgY29uc3QsXG5cdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGF0dHJzLnZpZXdNb2RlbC5zZXRDb250ZW50QmxvY2tpbmdTdGF0dXMoQ29udGVudEJsb2NraW5nU3RhdHVzLkFsd2F5c1Nob3cpLFxuXHRcdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiYmxvY2tFeHRlcm5hbENvbnRlbnRTZW5kZXJfYWN0aW9uXCIgYXMgY29uc3QsXG5cdFx0XHRcdFx0XHRjbGljazogKCkgPT4gYXR0cnMudmlld01vZGVsLnNldENvbnRlbnRCbG9ja2luZ1N0YXR1cyhDb250ZW50QmxvY2tpbmdTdGF0dXMuQWx3YXlzQmxvY2spLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHQgIF0uZmlsdGVyKGlzTm90TnVsbClcblx0XHRcdDogW11cblx0XHQvLyBvbiBuYXJyb3cgc2NyZWVucyB0aGUgYnV0dG9ucyB3aWxsIGVuZCB1cCBvbiAyIGxpbmVzIGlmIHRoZXJlIGFyZSB0b28gbWFueSwgdGhpcyBsb29rcyBiYWQuXG5cdFx0Y29uc3QgbWF5YmVEcm9wZG93bkJ1dHRvbnM6IFJlYWRvbmx5QXJyYXk8QmFubmVyQnV0dG9uQXR0cnM+ID1cblx0XHRcdHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpICYmIGFsd2F5c09yTmV2ZXJBbGxvd0J1dHRvbnMubGVuZ3RoID4gMVxuXHRcdFx0XHQ/IFtcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IFwibW9yZV9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogY3JlYXRlQXN5bmNEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6IDIxNixcblx0XHRcdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogYXN5bmMgKCkgPT4gcmVzb2x2ZU1heWJlTGF6eShhbHdheXNPck5ldmVyQWxsb3dCdXR0b25zKSxcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHQgIF1cblx0XHRcdFx0OiBhbHdheXNPck5ldmVyQWxsb3dCdXR0b25zXG5cdFx0cmV0dXJuIG0oSW5mb0Jhbm5lciwge1xuXHRcdFx0bWVzc2FnZTogXCJjb250ZW50QmxvY2tlZF9tc2dcIixcblx0XHRcdGljb246IEljb25zLlBpY3R1cmUsXG5cdFx0XHRoZWxwTGluazogY2FuU2VlVHV0YUxpbmtzKGF0dHJzLnZpZXdNb2RlbC5sb2dpbnMpID8gSW5mb0xpbmsuTG9hZEltYWdlcyA6IG51bGwsXG5cdFx0XHRidXR0b25zOiBbc2hvd0J1dHRvbiwgLi4ubWF5YmVEcm9wZG93bkJ1dHRvbnNdLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIG1vcmVCdXR0b24oYXR0cnM6IE1haWxWaWV3ZXJIZWFkZXJBdHRycyk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJtb3JlX2xhYmVsXCIsXG5cdFx0XHRpY29uOiBJY29ucy5Nb3JlLFxuXHRcdFx0Y2xpY2s6IHRoaXMucHJlcGFyZU1vcmVBY3Rpb25zKGF0dHJzKSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBwcmVwYXJlTW9yZUFjdGlvbnMoeyB2aWV3TW9kZWwgfTogTWFpbFZpZXdlckhlYWRlckF0dHJzKSB7XG5cdFx0cmV0dXJuIGNyZWF0ZURyb3Bkb3duKHtcblx0XHRcdGxhenlCdXR0b25zOiAoKSA9PiB7XG5cdFx0XHRcdGxldCBhY3Rpb25CdXR0b25zOiBEcm9wZG93bkJ1dHRvbkF0dHJzW10gPSBbXVxuXHRcdFx0XHRpZiAodmlld01vZGVsLmlzRHJhZnRNYWlsKCkpIHtcblx0XHRcdFx0XHRhY3Rpb25CdXR0b25zLnB1c2goe1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiZWRpdF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiBlZGl0RHJhZnQodmlld01vZGVsKSxcblx0XHRcdFx0XHRcdGljb246IEljb25zLkVkaXQsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRhY3Rpb25CdXR0b25zLnB1c2goe1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwibW92ZV9hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoXzogTW91c2VFdmVudCwgZG9tOiBIVE1MRWxlbWVudCkgPT5cblx0XHRcdFx0XHRcdFx0c2hvd01vdmVNYWlsc0Ryb3Bkb3duKHZpZXdNb2RlbC5tYWlsYm94TW9kZWwsIHZpZXdNb2RlbC5tYWlsTW9kZWwsIGRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgW3ZpZXdNb2RlbC5tYWlsXSksXG5cdFx0XHRcdFx0XHRpY29uOiBJY29ucy5Gb2xkZXIsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRhY3Rpb25CdXR0b25zLnB1c2goe1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiZGVsZXRlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHByb21wdEFuZERlbGV0ZU1haWxzKHZpZXdNb2RlbC5tYWlsTW9kZWwsIFt2aWV3TW9kZWwubWFpbF0sIG5vT3ApLFxuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuVHJhc2gsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAodmlld01vZGVsLmNhbkZvcndhcmRPck1vdmUoKSkge1xuXHRcdFx0XHRcdFx0YWN0aW9uQnV0dG9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IFwicmVwbHlfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB2aWV3TW9kZWwucmVwbHkoZmFsc2UpLFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5SZXBseSxcblx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRcdGlmICh2aWV3TW9kZWwuY2FuUmVwbHlBbGwoKSkge1xuXHRcdFx0XHRcdFx0XHRhY3Rpb25CdXR0b25zLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcInJlcGx5QWxsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB2aWV3TW9kZWwucmVwbHkodHJ1ZSksXG5cdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuUmVwbHlBbGwsXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGFjdGlvbkJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcImZvcndhcmRfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB2aWV3TW9kZWwuZm9yd2FyZCgpLFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5Gb3J3YXJkLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdGFjdGlvbkJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcIm1vdmVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoXzogTW91c2VFdmVudCwgZG9tOiBIVE1MRWxlbWVudCkgPT5cblx0XHRcdFx0XHRcdFx0XHRzaG93TW92ZU1haWxzRHJvcGRvd24odmlld01vZGVsLm1haWxib3hNb2RlbCwgdmlld01vZGVsLm1haWxNb2RlbCwgZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBbdmlld01vZGVsLm1haWxdKSxcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuRm9sZGVyLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHZpZXdNb2RlbC5tYWlsTW9kZWwuY2FuQXNzaWduTGFiZWxzKCkpIHtcblx0XHRcdFx0XHRcdGFjdGlvbkJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcImFzc2lnbkxhYmVsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogKF8sIGRvbSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHBvcHVwID0gbmV3IExhYmVsc1BvcHVwKFxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3R5bGVzLmlzRGVza3RvcExheW91dCgpID8gMzAwIDogMjAwLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmlld01vZGVsLm1haWxNb2RlbC5nZXRMYWJlbHNGb3JNYWlscyhbdmlld01vZGVsLm1haWxdKSxcblx0XHRcdFx0XHRcdFx0XHRcdHZpZXdNb2RlbC5tYWlsTW9kZWwuZ2V0TGFiZWxTdGF0ZXNGb3JNYWlscyhbdmlld01vZGVsLm1haWxdKSxcblx0XHRcdFx0XHRcdFx0XHRcdChhZGRlZExhYmVscywgcmVtb3ZlZExhYmVscykgPT4gdmlld01vZGVsLm1haWxNb2RlbC5hcHBseUxhYmVscyhbdmlld01vZGVsLm1haWxdLCBhZGRlZExhYmVscywgcmVtb3ZlZExhYmVscyksXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdC8vIHdhaXRpbmcgZm9yIHRoZSBkcm9wZG93biB0byBiZSBjbG9zZWRcblx0XHRcdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHBvcHVwLnNob3coKVxuXHRcdFx0XHRcdFx0XHRcdH0sIDE2KVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5MYWJlbCxcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YWN0aW9uQnV0dG9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcImRlbGV0ZV9hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiBwcm9tcHRBbmREZWxldGVNYWlscyh2aWV3TW9kZWwubWFpbE1vZGVsLCBbdmlld01vZGVsLm1haWxdLCBub09wKSxcblx0XHRcdFx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRhY3Rpb25CdXR0b25zLnB1c2goLi4ubWFpbFZpZXdlck1vcmVBY3Rpb25zKHZpZXdNb2RlbCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYWN0aW9uQnV0dG9uc1xuXHRcdFx0fSxcblx0XHRcdHdpZHRoOiAzMDAsXG5cdFx0fSlcblx0fVxuXG5cdGdldFJlY2lwaWVudEVtYWlsQWRkcmVzcyh7IHZpZXdNb2RlbCB9OiBNYWlsVmlld2VySGVhZGVyQXR0cnMpIHtcblx0XHRjb25zdCByZWxldmFudFJlY2lwaWVudCA9IHZpZXdNb2RlbC5nZXRSZWxldmFudFJlY2lwaWVudCgpXG5cblx0XHRpZiAocmVsZXZhbnRSZWNpcGllbnQpIHtcblx0XHRcdGNvbnN0IG51bWJlck9mQWxsUmVjaXBpZW50cyA9IHZpZXdNb2RlbC5nZXROdW1iZXJPZlJlY2lwaWVudHMoKVxuXHRcdFx0cmV0dXJuIG0oXG5cdFx0XHRcdFwiLmZsZXguY2xpY2suc21hbGwubWwtYmV0d2Vlbi1zLml0ZW1zLWNlbnRlclwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdC8vIHVzZSB0aGlzIHRvIGFsbG93IHRoZSBjb250YWluZXIgdG8gc2hyaW5rLCBvdGhlcndpc2UgaXQgZG9lc24ndCB3YW50IHRvIGN1dCB0aGUgcmVjaXBpZW50IGFkZHJlc3Ncblx0XHRcdFx0XHRcdG1pbldpZHRoOiBcIjIwcHhcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0bShcIlwiLCBsYW5nLmdldChcIm1haWxWaWV3ZXJSZWNpcGllbnRzX2xhYmVsXCIpKSxcblx0XHRcdFx0XHRtKFwiLnRleHQtZWxsaXBzaXNcIiwgcmVsZXZhbnRSZWNpcGllbnQuYWRkcmVzcyksXG5cdFx0XHRcdFx0bShcIi5mbGV4Lm5vLXdyYXBcIiwgW1xuXHRcdFx0XHRcdFx0bnVtYmVyT2ZBbGxSZWNpcGllbnRzID4gMSA/IGArICR7bnVtYmVyT2ZBbGxSZWNpcGllbnRzIC0gMX1gIDogbnVsbCxcblx0XHRcdFx0XHRcdG0oSWNvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBCb290SWNvbnMuRXhwYW5kLFxuXHRcdFx0XHRcdFx0XHRjb250YWluZXI6IFwiZGl2XCIsXG5cdFx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9mZyxcblx0XHRcdFx0XHRcdFx0XHR0cmFuc2Zvcm06IHRoaXMuZGV0YWlsc0V4cGFuZGVkID8gXCJyb3RhdGUoMTgwZGVnKVwiIDogXCJcIixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRdLFxuXHRcdFx0KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IHsgcHgsIHNpemUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zaXplXCJcbmltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgd2luZG93RmFjYWRlLCB3aW5kb3dTaXplTGlzdGVuZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvV2luZG93RmFjYWRlXCJcbmltcG9ydCB7IEZlYXR1cmVUeXBlLCBJbmJveFJ1bGVUeXBlLCBLZXlzLCBNYWlsU2V0S2luZCwgU3BhbVJ1bGVGaWVsZFR5cGUsIFNwYW1SdWxlVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBGaWxlIGFzIFR1dGFub3RhRmlsZSwgTWFpbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgYXNzZXJ0TWFpbk9yTm9kZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgYXNzZXJ0Tm9uTnVsbCwgYXNzZXJ0Tm90TnVsbCwgZGVmZXIsIERlZmVycmVkT2JqZWN0LCBub09wLCBvZkNsYXNzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBJY29uTWVzc2FnZUJveCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQ29sdW1uRW1wdHlNZXNzYWdlQm94XCJcbmltcG9ydCB0eXBlIHsgU2hvcnRjdXQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvS2V5TWFuYWdlclwiXG5pbXBvcnQgeyBrZXlNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXJcIlxuaW1wb3J0IHsgSWNvbiwgcHJvZ3Jlc3NJY29uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29uc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3RoZW1lXCJcbmltcG9ydCB7IGNsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9DbGllbnREZXRlY3RvclwiXG5pbXBvcnQgeyBzdHlsZXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zdHlsZXNcIlxuaW1wb3J0IHsgRHJvcGRvd25CdXR0b25BdHRycywgc2hvd0Ryb3Bkb3duQXRQb3NpdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgaXNUdXRhbm90YVRlYW1NYWlsLCByZXBsYWNlQ2lkc1dpdGhJbmxpbmVJbWFnZXMgfSBmcm9tIFwiLi9NYWlsR3VpVXRpbHNcIlxuaW1wb3J0IHsgZ2V0Q29vcmRzT2ZNb3VzZU9yVG91Y2hFdmVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvR3VpVXRpbHNcIlxuaW1wb3J0IHsgY29weVRvQ2xpcGJvYXJkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0NsaXBib2FyZFV0aWxzXCJcbmltcG9ydCB7IENvbnRlbnRCbG9ja2luZ1N0YXR1cywgTWFpbFZpZXdlclZpZXdNb2RlbCB9IGZyb20gXCIuL01haWxWaWV3ZXJWaWV3TW9kZWxcIlxuaW1wb3J0IHsgY3JlYXRlRW1haWxTZW5kZXJMaXN0RWxlbWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBVc2VyRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJFcnJvclwiXG5pbXBvcnQgeyBzaG93VXNlckVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0Vycm9ySGFuZGxlckltcGxcIlxuaW1wb3J0IHsgaXNOZXdNYWlsQWN0aW9uQXZhaWxhYmxlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvbmF2L05hdkZ1bmN0aW9uc1wiXG5pbXBvcnQgeyBDYW5jZWxsZWRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9DYW5jZWxsZWRFcnJvclwiXG5pbXBvcnQgeyBNYWlsVmlld2VySGVhZGVyIH0gZnJvbSBcIi4vTWFpbFZpZXdlckhlYWRlci5qc1wiXG5pbXBvcnQgeyBlZGl0RHJhZnQsIHNob3dIZWFkZXJEaWFsb2csIHNob3dTb3VyY2VEaWFsb2cgfSBmcm9tIFwiLi9NYWlsVmlld2VyVXRpbHMuanNcIlxuaW1wb3J0IHsgVG9nZ2xlQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9idXR0b25zL1RvZ2dsZUJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IFBpbmNoWm9vbSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL1BpbmNoWm9vbS5qc1wiXG5pbXBvcnQgeyByZXNwb25zaXZlQ2FyZEhNYXJnaW4sIHJlc3BvbnNpdmVDYXJkSFBhZGRpbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9jYXJkcy5qc1wiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBjcmVhdGVOZXdDb250YWN0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9tYWlsRnVuY3Rpb25hbGl0eS9TaGFyZWRNYWlsVXRpbHMuanNcIlxuaW1wb3J0IHsgZ2V0RXhpc3RpbmdSdWxlRm9yVHlwZSB9IGZyb20gXCIuLi9tb2RlbC9NYWlsVXRpbHMuanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcblxudHlwZSBNYWlsQWRkcmVzc0FuZE5hbWUgPSB7XG5cdG5hbWU6IHN0cmluZ1xuXHRhZGRyZXNzOiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgTWFpbFZpZXdlckF0dHJzID0ge1xuXHR2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWxcblx0aXNQcmltYXJ5OiBib29sZWFuXG5cdC8qKlxuXHQgKiBNYWlsIGJvZHkgbWlnaHQgY29udGFpbiBibG9ja3F1b3RlcyB0aGF0IHdlIHdhbnQgdG8gY29sbGFwc2UgaW4gc29tZSBjYXNlcyAoZS5nLiB0aGUgdGhyZWFkIGlzIHZpc2libGUgaW4gY29udmVyc2F0aW9uIGFueXdheSkgb3IgZXhwYW5kIGluIG90aGVyXG5cdCAqIGNhc2VzIChlLmcuIGlmIGl0J3MgYSBzaW5nbGUvdGhlIGZpcnN0IGVtYWlsIGluIHRoZSBjb252ZXJzYXRpb24pLlxuXHQgKlxuXHQgKi9cblx0ZGVmYXVsdFF1b3RlQmVoYXZpb3I6IFwiY29sbGFwc2VcIiB8IFwiZXhwYW5kXCJcbn1cblxuLyoqXG4gKiBUaGUgTWFpbFZpZXdlciBkaXNwbGF5cyBhIG1haWwuIFRoZSBtYWlsIGJvZHkgaXMgbG9hZGVkIGFzeW5jaHJvbm91c2x5LlxuICpcbiAqIFRoZSB2aWV3ZXIgaGFzIGEgbG9uZ2VyIGxpZmVjeWNsZSB0aGFuIHZpZXdNb2RlbCBzbyB3ZSBuZWVkIHRvIGJlIGNhcmVmdWwgYWJvdXQgdGhlIHN0YXRlLlxuICovXG5leHBvcnQgY2xhc3MgTWFpbFZpZXdlciBpbXBsZW1lbnRzIENvbXBvbmVudDxNYWlsVmlld2VyQXR0cnM+IHtcblx0LyoqIGl0IGlzIHNldCBhZnRlciB3ZSBtZWFzdXJlZCBtYWlsIGJvZHkgZWxlbWVudCAqL1xuXHRwcml2YXRlIGJvZHlMaW5lSGVpZ2h0OiBudW1iZXIgfCBudWxsID0gbnVsbFxuXG5cdC8qKlxuXHQgKiBEZWxheSB0aGUgZGlzcGxheSBvZiB0aGUgcHJvZ3Jlc3Mgc3Bpbm5lciBpbiBtYWluIGJvZHkgdmlldyBmb3IgYSBzaG9ydCB0aW1lIHRvIHN1cHByZXNzIGl0IHdoZW4gd2UgYXJlIHN3aXRjaGluZyBiZXR3ZWVuIGNhY2hlZCBlbWFpbHNcblx0ICogYW5kIHdlIGFyZSBqdXN0IHNhbml0aXppbmdcblx0ICovXG5cdHByaXZhdGUgZGVsYXlQcm9ncmVzc1NwaW5uZXIgPSB0cnVlXG5cblx0cHJpdmF0ZSByZWFkb25seSByZXNpemVMaXN0ZW5lcjogd2luZG93U2l6ZUxpc3RlbmVyXG5cdHByaXZhdGUgcmVzaXplT2JzZXJ2ZXJWaWV3cG9ydDogUmVzaXplT2JzZXJ2ZXIgfCBudWxsID0gbnVsbCAvLyBuZWVkZWQgdG8gZGV0ZWN0IG9yaWVudGF0aW9uIGNoYW5nZSB0byByZWNyZWF0ZSBwaW5jaHpvb20gYXQgdGhlIHJpZ2h0IHRpbWVcblx0cHJpdmF0ZSByZXNpemVPYnNlcnZlclpvb21hYmxlOiBSZXNpemVPYnNlcnZlciB8IG51bGwgPSBudWxsIC8vIG5lZWRlZCB0byByZWNyZWF0ZSBwaW5jaHpvb20gZS5nLiB3aGVuIGxvYWRpbmcgaW1hZ2VzXG5cblx0cHJpdmF0ZSB2aWV3TW9kZWwhOiBNYWlsVmlld2VyVmlld01vZGVsXG5cdHByaXZhdGUgcGluY2hab29tYWJsZTogUGluY2hab29tIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSByZWFkb25seSBzaG9ydGN1dHM6IEFycmF5PFNob3J0Y3V0PlxuXG5cdHByaXZhdGUgc2Nyb2xsRG9tOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsXG5cblx0cHJpdmF0ZSBkb21Cb2R5RGVmZXJyZWQ6IERlZmVycmVkT2JqZWN0PEhUTUxFbGVtZW50PiA9IGRlZmVyKClcblx0cHJpdmF0ZSBkb21Cb2R5OiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsXG5cblx0cHJpdmF0ZSBzaGFkb3dEb21Sb290OiBTaGFkb3dSb290IHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBzaGFkb3dEb21NYWlsQ29udGVudDogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGN1cnJlbnRseVJlbmRlcmVkTWFpbEJvZHk6IERvY3VtZW50RnJhZ21lbnQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGxhc3RDb250ZW50QmxvY2tpbmdTdGF0dXM6IENvbnRlbnRCbG9ja2luZ1N0YXR1cyB8IG51bGwgPSBudWxsXG5cblx0cHJpdmF0ZSBsb2FkQWxsTGlzdGVuZXIgPSBzdHJlYW0oKVxuXHQvKiogZm9yIGJsb2NrIHF1b3RlcyBpbiBtYWlsIGJvZGllcywgd2hldGhlciB0byBkaXNwbGF5IHF1b3RlIGJlZm9yZSB1c2VyIGludGVyYWN0aW9uXG5cdCAqIGlzIFwibm9uZVwiIHVudGlsIHdlIHJlbmRlciBvbmNlICovXG5cdHByaXZhdGUgY3VycmVudFF1b3RlQmVoYXZpb3I6IFwibm9uZVwiIHwgXCJjb2xsYXBzZVwiIHwgXCJleHBhbmRcIiA9IFwibm9uZVwiXG5cdC8qKiBmb3IgYmxvY2sgcXVvdGVzIGluIG1haWwgYm9kaWVzLCB3aGV0aGVyIHRvIGRpc3BsYXkgcGxhY2Vob2xkZXIgb3Igb3JpZ2luYWwgcXVvdGUgKi9cblx0cHJpdmF0ZSBxdW90ZVN0YXRlOiBcIm5vcXVvdGVzXCIgfCBcInVuc2V0XCIgfCBcImNvbGxhcHNlZFwiIHwgXCJleHBhbmRlZFwiID0gXCJ1bnNldFwiXG5cblx0LyoqIG1vc3QgcmVjZW50IHJlc2l6ZSBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCBJRCAqL1xuXHRwcml2YXRlIHJlc2l6ZVJhZjogbnVtYmVyIHwgdW5kZWZpbmVkXG5cblx0Y29uc3RydWN0b3Iodm5vZGU6IFZub2RlPE1haWxWaWV3ZXJBdHRycz4pIHtcblx0XHR0aGlzLnNldFZpZXdNb2RlbCh2bm9kZS5hdHRycy52aWV3TW9kZWwsIHZub2RlLmF0dHJzLmlzUHJpbWFyeSlcblxuXHRcdHRoaXMucmVzaXplTGlzdGVuZXIgPSAoKSA9PiB0aGlzLmRvbUJvZHlEZWZlcnJlZC5wcm9taXNlLnRoZW4oKGRvbSkgPT4gdGhpcy51cGRhdGVMaW5lSGVpZ2h0KGRvbSkpXG5cblx0XHR0aGlzLnNob3J0Y3V0cyA9IHRoaXMuc2V0dXBTaG9ydGN1dHModm5vZGUuYXR0cnMpXG5cdH1cblxuXHRvbmNyZWF0ZSh7IGF0dHJzIH06IFZub2RlPE1haWxWaWV3ZXJBdHRycz4pIHtcblx0XHRpZiAoYXR0cnMuaXNQcmltYXJ5KSB7XG5cdFx0XHRrZXlNYW5hZ2VyLnJlZ2lzdGVyU2hvcnRjdXRzKHRoaXMuc2hvcnRjdXRzKVxuXHRcdH1cblx0XHR3aW5kb3dGYWNhZGUuYWRkUmVzaXplTGlzdGVuZXIodGhpcy5yZXNpemVMaXN0ZW5lcilcblx0fVxuXG5cdG9ucmVtb3ZlKHsgYXR0cnMgfTogVm5vZGU8TWFpbFZpZXdlckF0dHJzPikge1xuXHRcdHdpbmRvd0ZhY2FkZS5yZW1vdmVSZXNpemVMaXN0ZW5lcih0aGlzLnJlc2l6ZUxpc3RlbmVyKVxuXHRcdGlmICh0aGlzLnJlc2l6ZU9ic2VydmVyWm9vbWFibGUpIHtcblx0XHRcdHRoaXMucmVzaXplT2JzZXJ2ZXJab29tYWJsZS5kaXNjb25uZWN0KClcblx0XHR9XG5cdFx0aWYgKHRoaXMucmVzaXplT2JzZXJ2ZXJWaWV3cG9ydCkge1xuXHRcdFx0dGhpcy5yZXNpemVPYnNlcnZlclZpZXdwb3J0LmRpc2Nvbm5lY3QoKVxuXHRcdH1cblx0XHR0aGlzLnBpbmNoWm9vbWFibGU/LnJlbW92ZSgpIC8vIHJlbW92ZSB0aGUgbGlzdGVuZXJzXG5cdFx0dGhpcy5jbGVhckRvbUJvZHkoKVxuXHRcdGlmIChhdHRycy5pc1ByaW1hcnkpIHtcblx0XHRcdGtleU1hbmFnZXIudW5yZWdpc3RlclNob3J0Y3V0cyh0aGlzLnNob3J0Y3V0cylcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHNldFZpZXdNb2RlbCh2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwsIGlzUHJpbWFyeTogYm9vbGVhbikge1xuXHRcdC8vIEZpZ3VyaW5nIG91dCB3aGV0aGVyIHdlIGhhdmUgYSBuZXcgZW1haWwgYXNzaWduZWQuXG5cdFx0Y29uc3Qgb2xkVmlld01vZGVsID0gdGhpcy52aWV3TW9kZWxcblx0XHR0aGlzLnZpZXdNb2RlbCA9IHZpZXdNb2RlbFxuXHRcdGlmICh0aGlzLnZpZXdNb2RlbCAhPT0gb2xkVmlld01vZGVsKSB7XG5cdFx0XHR0aGlzLmxvYWRBbGxMaXN0ZW5lci5lbmQodHJ1ZSlcblx0XHRcdHRoaXMubG9hZEFsbExpc3RlbmVyID0gdGhpcy52aWV3TW9kZWwubG9hZENvbXBsZXRlTm90aWZpY2F0aW9uLm1hcChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdC8vIHN0cmVhbXMgYXJlIHByZXR0eSBtdWNoIHN5bmNocm9ub3VzLCBzbyB3ZSBjb3VsZCBiZSBpbiB0aGUgbWlkZGxlIG9mIGEgcmVkcmF3IGhlcmUgYW5kIG1pdGhyaWwgZG9lcyBub3QganVzdCBzY2hlZHVsZSBhbm90aGVyIHJlZHJhdywgaXRcblx0XHRcdFx0Ly8gd2lsbCBlcnJvciBvdXQgc28gYmVmb3JlIGNhbGxpbmcgbS5yZWRyYXcuc3luYygpIHdlIHdhbnQgdG8gbWFrZSBzdXJlIHRoYXQgd2UgYXJlIG5vdCBpbnNpZGUgYSByZWRyYXcgYnkganVzdCBzY2hlZHVsaW5nIGEgbWljcm90YXNrIHdpdGhcblx0XHRcdFx0Ly8gdGhpcyBzaW1wbGUgYXdhaXQuXG5cdFx0XHRcdGF3YWl0IFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHRcdC8vIFdhaXQgZm9yIG1haWwgYm9keSB0byBiZSByZWRyYXduIGJlZm9yZSByZXBsYWNpbmcgaW1hZ2VzXG5cdFx0XHRcdG0ucmVkcmF3LnN5bmMoKVxuXHRcdFx0XHRhd2FpdCB0aGlzLnJlcGxhY2VJbmxpbmVJbWFnZXMoKVxuXHRcdFx0XHRtLnJlZHJhdygpXG5cdFx0XHR9KVxuXG5cdFx0XHR0aGlzLmxhc3RDb250ZW50QmxvY2tpbmdTdGF0dXMgPSBudWxsXG5cdFx0XHR0aGlzLmRlbGF5UHJvZ3Jlc3NTcGlubmVyID0gdHJ1ZVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZGVsYXlQcm9ncmVzc1NwaW5uZXIgPSBmYWxzZVxuXHRcdFx0XHRtLnJlZHJhdygpXG5cdFx0XHR9LCA1MClcblx0XHR9XG5cdH1cblxuXHR2aWV3KHZub2RlOiBWbm9kZTxNYWlsVmlld2VyQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdHRoaXMuaGFuZGxlQ29udGVudEJsb2NraW5nT25SZW5kZXIoKVxuXG5cdFx0cmV0dXJuIFtcblx0XHRcdG0oXCIubWFpbC12aWV3ZXIub3ZlcmZsb3cteC1oaWRkZW5cIiwgW1xuXHRcdFx0XHR0aGlzLnJlbmRlck1haWxIZWFkZXIodm5vZGUuYXR0cnMpLFxuXHRcdFx0XHR0aGlzLnJlbmRlck1haWxTdWJqZWN0KHZub2RlLmF0dHJzKSxcblx0XHRcdFx0bShcblx0XHRcdFx0XHRcIi5mbGV4LWdyb3cuc2Nyb2xsLXgucHQucGIuYm9yZGVyLXJhZGl1cy1iaWdcIiArICh0aGlzLnZpZXdNb2RlbC5pc0NvbnRyYXN0Rml4TmVlZGVkKCkgPyBcIi5iZy13aGl0ZS5jb250ZW50LWJsYWNrXCIgOiBcIiBcIiksXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2xhc3M6IHJlc3BvbnNpdmVDYXJkSFBhZGRpbmcoKSxcblx0XHRcdFx0XHRcdG9uY3JlYXRlOiAodm5vZGUpID0+IHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zY3JvbGxEb20gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR0aGlzLnJlbmRlck1haWxCb2R5U2VjdGlvbih2bm9kZS5hdHRycyksXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoaXMucmVuZGVyUXVvdGVFeHBhbmRlckJ1dHRvbigpLFxuXHRcdFx0XSksXG5cdFx0XVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJNYWlsU3ViamVjdChhdHRyczogTWFpbFZpZXdlckF0dHJzKSB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcImg0LmZvbnQtd2VpZ2h0LTYwMC5tdC5tYi50ZXh0LWJyZWFrLnNlbGVjdGFibGUuXCIgKyByZXNwb25zaXZlQ2FyZEhNYXJnaW4oKSxcblx0XHRcdHtcblx0XHRcdFx0XCJkYXRhLXRlc3RpZFwiOiBgaDoke2xhbmcuZ2V0VGVzdElkKFwic3ViamVjdF9sYWJlbFwiKX1gLFxuXHRcdFx0fSxcblx0XHRcdGF0dHJzLnZpZXdNb2RlbC5nZXRTdWJqZWN0KCksXG5cdFx0KVxuXHR9XG5cblx0LyoqXG5cdCAqIGltcG9ydGFudDogbXVzdCBiZSBjYWxsZWQgYWZ0ZXIgcmVuZGVyaW5nIHRoZSBtYWlsIGJvZHkgcGFydCBzbyB0aGF0IHtAbGluayBxdW90ZVN0YXRlfSBpcyBzZXQgY29ycmVjdGx5LlxuXHQgKiBUaGUgbG9naWMgaGVyZSByZWxpZXMgb24gdGhlIGZhY3QgdGhhdCBsaWZlY3ljbGUgbWV0aG9kcyB3aWxsIGJlIGNhbGxlZCBhZnRlciBib2R5IHNlY3Rpb24gbGlmZWN5Y2xlIG1ldGhvZHMuXG5cdCAqL1xuXHRwcml2YXRlIHJlbmRlclF1b3RlRXhwYW5kZXJCdXR0b24oKSB7XG5cdFx0Y29uc3QgYnV0dG9uSGVpZ2h0ID0gMjRcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmFicy5mbGV4Lmp1c3RpZnktY2VudGVyLmZ1bGwtd2lkdGhcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHQvLyArMSBmb3IgdGhlIGJvcmRlclxuXHRcdFx0XHRcdGJvdHRvbTogcHgoLShidXR0b25IZWlnaHQgLyAyICsgMSkpLFxuXHRcdFx0XHRcdGRpc3BsYXk6IFwiaGlkZGVuXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uY3JlYXRlOiAoeyBkb20gfSkgPT4ge1xuXHRcdFx0XHRcdDsoZG9tIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5kaXNwbGF5ID0gdGhpcy5xdW90ZVN0YXRlID09PSBcIm5vcXVvdGVzXCIgPyBcIm5vbmVcIiA6IFwiXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0b251cGRhdGU6ICh7IGRvbSB9KSA9PiB7XG5cdFx0XHRcdFx0Oyhkb20gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSB0aGlzLnF1b3RlU3RhdGUgPT09IFwibm9xdW90ZXNcIiA/IFwibm9uZVwiIDogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdG0oXG5cdFx0XHRcdC8vIG5lZWRzIGZsZXggZm9yIGNvcnJlY3QgaGVpZ2h0XG5cdFx0XHRcdFwiLmZsZXhcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRib3JkZXJSYWRpdXM6IFwiMjUlXCIsXG5cdFx0XHRcdFx0XHRib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5saXN0X2JvcmRlcn1gLFxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiB0aGVtZS5jb250ZW50X2JnLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG0oVG9nZ2xlQnV0dG9uLCB7XG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuTW9yZSxcblx0XHRcdFx0XHR0aXRsZTogXCJzaG93VGV4dF9hY3Rpb25cIixcblx0XHRcdFx0XHR0b2dnbGVkOiB0aGlzLnNob3VsZERpc3BsYXlDb2xsYXBzZWRRdW90ZXMoKSxcblx0XHRcdFx0XHRvblRvZ2dsZWQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMucXVvdGVTdGF0ZSA9IHRoaXMuc2hvdWxkRGlzcGxheUNvbGxhcHNlZFF1b3RlcygpID8gXCJjb2xsYXBzZWRcIiA6IFwiZXhwYW5kZWRcIlxuXHRcdFx0XHRcdFx0aWYgKHRoaXMuc2hhZG93RG9tUm9vdCkgdGhpcy51cGRhdGVDb2xsYXBzZWRRdW90ZXModGhpcy5zaGFkb3dEb21Sb290LCB0aGlzLnNob3VsZERpc3BsYXlDb2xsYXBzZWRRdW90ZXMoKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRoZWlnaHQ6IFwiMjRweFwiLFxuXHRcdFx0XHRcdFx0d2lkdGg6IHB4KHNpemUuYnV0dG9uX2hlaWdodF9jb21wYWN0KSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdCksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBoYW5kbGVDb250ZW50QmxvY2tpbmdPblJlbmRlcigpIHtcblx0XHRpZiAodGhpcy5sYXN0Q29udGVudEJsb2NraW5nU3RhdHVzICE9IG51bGwgJiYgdGhpcy52aWV3TW9kZWwuZ2V0Q29udGVudEJsb2NraW5nU3RhdHVzKCkgIT0gdGhpcy5sYXN0Q29udGVudEJsb2NraW5nU3RhdHVzKSB7XG5cdFx0XHRQcm9taXNlLnJlc29sdmUoKS50aGVuKGFzeW5jICgpID0+IHtcblx0XHRcdFx0Ly8gV2FpdCBmb3IgbmV3IG1haWwgYm9keSB0byBiZSByZW5kZXJlZCBiZWZvcmUgcmVwbGFjaW5nIGltYWdlcy4gUHJvYmFibHkgbm90IG5lY2Vzc2FyeSBhbnltb3JlIGFzIHdlIGFscmVhZHkgc2NoZWR1bGUgaXQgYWZ0ZXIgdGhlIHJlbmRlclxuXHRcdFx0XHQvLyBidXQgYmV0dGVyIGJlIHNhZmUuXG5cdFx0XHRcdG0ucmVkcmF3LnN5bmMoKVxuXHRcdFx0XHRhd2FpdCB0aGlzLnJlcGxhY2VJbmxpbmVJbWFnZXMoKVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0dGhpcy5sYXN0Q29udGVudEJsb2NraW5nU3RhdHVzID0gdGhpcy52aWV3TW9kZWwuZ2V0Q29udGVudEJsb2NraW5nU3RhdHVzKClcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyTWFpbEhlYWRlcihhdHRyczogTWFpbFZpZXdlckF0dHJzKSB7XG5cdFx0cmV0dXJuIG0oTWFpbFZpZXdlckhlYWRlciwge1xuXHRcdFx0dmlld01vZGVsOiB0aGlzLnZpZXdNb2RlbCxcblx0XHRcdGNyZWF0ZU1haWxBZGRyZXNzQ29udGV4dEJ1dHRvbnM6IHRoaXMuY3JlYXRlTWFpbEFkZHJlc3NDb250ZXh0QnV0dG9ucy5iaW5kKHRoaXMpLFxuXHRcdFx0aXNQcmltYXJ5OiBhdHRycy5pc1ByaW1hcnksXG5cdFx0XHRpbXBvcnRGaWxlOiAoZmlsZTogVHV0YW5vdGFGaWxlKSA9PiB0aGlzLmhhbmRsZUF0dGFjaG1lbnRJbXBvcnQoZmlsZSksXG5cdFx0fSlcblx0fVxuXG5cdG9uYmVmb3JldXBkYXRlKHZub2RlOiBWbm9kZTxNYWlsVmlld2VyQXR0cnM+KTogYm9vbGVhbiB8IHZvaWQge1xuXHRcdC8vIFNldHRpbmcgdmlld01vZGVsIGhlcmUgdG8gaGF2ZSB2aWV3TW9kZWwgdGhhdCB3ZSB3aWxsIHVzZSBmb3IgcmVuZGVyIGFscmVhZHkgYW5kIGJlIGFibGUgdG8gbWFrZSBhIGRlY2lzaW9uXG5cdFx0Ly8gYWJvdXQgc2tpcHBpbmcgcmVuZGVyaW5nXG5cdFx0dGhpcy5zZXRWaWV3TW9kZWwodm5vZGUuYXR0cnMudmlld01vZGVsLCB2bm9kZS5hdHRycy5pc1ByaW1hcnkpXG5cdFx0Ly8gV2Ugc2tpcCByZW5kZXJpbmcgcHJvZ3Jlc3MgaW5kaWNhdG9yIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gZW1haWxzLlxuXHRcdC8vIEhvd2V2ZXIgaWYgd2UgYWxyZWFkeSBsb2FkZWQgdGhlIG1haWwgdGhlbiB3ZSBjYW4ganVzdCByZW5kZXIgaXQuXG5cdFx0Y29uc3Qgc2hvdWxkU2tpcFJlbmRlciA9IHRoaXMudmlld01vZGVsLmlzTG9hZGluZygpICYmIHRoaXMuZGVsYXlQcm9ncmVzc1NwaW5uZXJcblx0XHRyZXR1cm4gIXNob3VsZFNraXBSZW5kZXJcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyTWFpbEJvZHlTZWN0aW9uKGF0dHJzOiBNYWlsVmlld2VyQXR0cnMpOiBDaGlsZHJlbiB7XG5cdFx0aWYgKHRoaXMudmlld01vZGVsLmRpZEVycm9yc09jY3VyKCkpIHtcblx0XHRcdHJldHVybiBtKEljb25NZXNzYWdlQm94LCB7XG5cdFx0XHRcdG1lc3NhZ2U6IFwiY29ycnVwdGVkX21zZ1wiLFxuXHRcdFx0XHRpY29uOiBJY29ucy5XYXJuaW5nLFxuXHRcdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9tZXNzYWdlX2JnLFxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRjb25zdCBzYW5pdGl6ZWRNYWlsQm9keSA9IHRoaXMudmlld01vZGVsLmdldFNhbml0aXplZE1haWxCb2R5KClcblxuXHRcdC8vIERvIG5vdCByZW5kZXIgcHJvZ3Jlc3Mgc3Bpbm5lciBvciBtYWlsIGJvZHkgd2hpbGUgd2UgYXJlIGFuaW1hdGluZy5cblx0XHRpZiAodGhpcy52aWV3TW9kZWwuc2hvdWxkRGVsYXlSZW5kZXJpbmcoKSkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2UgaWYgKHNhbml0aXplZE1haWxCb2R5ICE9IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlbmRlck1haWxCb2R5KHNhbml0aXplZE1haWxCb2R5LCBhdHRycylcblx0XHR9IGVsc2UgaWYgKHRoaXMudmlld01vZGVsLmlzTG9hZGluZygpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5yZW5kZXJMb2FkaW5nSWNvbigpXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFRoZSBib2R5IGZhaWxlZCB0byBsb2FkLCBqdXN0IHNob3cgYmxhbmsgYm9keSBiZWNhdXNlIHRoZXJlIGlzIGEgYmFubmVyXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyTWFpbEJvZHkoc2FuaXRpemVkTWFpbEJvZHk6IERvY3VtZW50RnJhZ21lbnQsIGF0dHJzOiBNYWlsVmlld2VyQXR0cnMpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXCIjbWFpbC1ib2R5XCIsIHtcblx0XHRcdC8vIGtleSB0byBhdm9pZCBtaXRocmlsIHJldXNpbmcgdGhlIGRvbSBlbGVtZW50IHdoZW4gaXQgc2hvdWxkIHN3aXRjaCB0aGUgcmVuZGVyaW5nIHRoZSBsb2FkaW5nIHNwaW5uZXJcblx0XHRcdGtleTogXCJtYWlsQm9keVwiLFxuXHRcdFx0b25jcmVhdGU6ICh2bm9kZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBkb20gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0dGhpcy5zZXREb21Cb2R5KGRvbSlcblx0XHRcdFx0dGhpcy51cGRhdGVMaW5lSGVpZ2h0KGRvbSlcblx0XHRcdFx0dGhpcy5yZW5kZXJTaGFkb3dNYWlsQm9keShzYW5pdGl6ZWRNYWlsQm9keSwgYXR0cnMsIHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudClcblx0XHRcdFx0aWYgKGNsaWVudC5pc01vYmlsZURldmljZSgpKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNpemVPYnNlcnZlclZpZXdwb3J0Py5kaXNjb25uZWN0KClcblx0XHRcdFx0XHR0aGlzLnJlc2l6ZU9ic2VydmVyVmlld3BvcnQgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcblx0XHRcdFx0XHRcdGlmICh0aGlzLnBpbmNoWm9vbWFibGUpIHtcblx0XHRcdFx0XHRcdFx0Ly8gcmVjcmVhdGUgaWYgdGhlIG9yaWVudGF0aW9uIG9mIHRoZSBkZXZpY2UgY2hhbmdlcyAtPiBzaXplIG9mIHRoZSB2aWV3cG9ydCAvIG1haWwtYm9keSBjaGFuZ2VzXG5cdFx0XHRcdFx0XHRcdHRoaXMuY3JlYXRlUGluY2hab29tKHRoaXMucGluY2hab29tYWJsZS5nZXRab29tYWJsZSgpLCB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR0aGlzLnJlc2l6ZU9ic2VydmVyVmlld3BvcnQub2JzZXJ2ZSh2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQpXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRvbnVwZGF0ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGRvbSA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXHRcdFx0XHR0aGlzLnNldERvbUJvZHkoZG9tKVxuXG5cdFx0XHRcdC8vIE9ubHkgbWVhc3VyZSBhbmQgdXBkYXRlIGxpbmUgaGVpZ2h0IG9uY2UuXG5cdFx0XHRcdC8vIEJVVCB3ZSBuZWVkIHRvIGRvIGluIGZyb20gb251cGRhdGUgdG9vIGlmIHdlIHN3YXAgbWFpbFZpZXdlciBidXQgbWl0aHJpbCBkb2VzIG5vdCByZWFsaXplXG5cdFx0XHRcdC8vIHRoYXQgaXQncyBhIGRpZmZlcmVudCB2bm9kZSBzbyBvbmNyZWF0ZSBtaWdodCBub3QgYmUgY2FsbGVkLlxuXHRcdFx0XHRpZiAoIXRoaXMuYm9keUxpbmVIZWlnaHQpIHtcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZUxpbmVIZWlnaHQodm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50KVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHRoaXMuY3VycmVudGx5UmVuZGVyZWRNYWlsQm9keSAhPT0gc2FuaXRpemVkTWFpbEJvZHkpIHRoaXMucmVuZGVyU2hhZG93TWFpbEJvZHkoc2FuaXRpemVkTWFpbEJvZHksIGF0dHJzLCB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQpXG5cdFx0XHRcdC8vIElmIHRoZSBxdW90ZSBiZWhhdmlvciBjaGFuZ2VzIChlLmcuIGFmdGVyIGxvYWRpbmcgaXMgZmluaXNoZWQpIHdlIHNob3VsZCB1cGRhdGUgdGhlIHF1b3Rlcy5cblx0XHRcdFx0Ly8gSWYgd2UgYWxyZWFkeSByZW5kZXJlZCBpdCBjb3JyZWN0bHkgaXQgd2lsbCBhbHJlYWR5IGJlIHNldCBpbiByZW5kZXJTaGFkb3dNYWlsQm9keSgpIHNvIHdlIHdpbGwgYXZvaWQgZG9pbmcgaXQgdHdpY2UuXG5cdFx0XHRcdGlmICh0aGlzLmN1cnJlbnRRdW90ZUJlaGF2aW9yICE9PSBhdHRycy5kZWZhdWx0UXVvdGVCZWhhdmlvcikge1xuXHRcdFx0XHRcdHRoaXMudXBkYXRlQ29sbGFwc2VkUXVvdGVzKGFzc2VydE5vdE51bGwodGhpcy5zaGFkb3dEb21Sb290KSwgYXR0cnMuZGVmYXVsdFF1b3RlQmVoYXZpb3IgPT09IFwiZXhwYW5kXCIpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5jdXJyZW50UXVvdGVCZWhhdmlvciA9IGF0dHJzLmRlZmF1bHRRdW90ZUJlaGF2aW9yXG5cblx0XHRcdFx0aWYgKGNsaWVudC5pc01vYmlsZURldmljZSgpICYmICF0aGlzLnBpbmNoWm9vbWFibGUgJiYgdGhpcy5zaGFkb3dEb21NYWlsQ29udGVudCkge1xuXHRcdFx0XHRcdHRoaXMuY3JlYXRlUGluY2hab29tKHRoaXMuc2hhZG93RG9tTWFpbENvbnRlbnQsIHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG9uYmVmb3JlcmVtb3ZlOiAoKSA9PiB7XG5cdFx0XHRcdC8vIENsZWFyIGRvbSBib2R5IGluIGNhc2UgdGhlcmUgd2lsbCBiZSBhIG5ldyBvbmUsIHdlIHdhbnQgcHJvbWlzZSB0byBiZSB1cC10by1kYXRlXG5cdFx0XHRcdHRoaXMuY2xlYXJEb21Cb2R5KClcblx0XHRcdH0sXG5cdFx0XHRvbnN1Ym1pdDogKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdFx0XHQvLyB1c2UgdGhlIGRlZmF1bHQgY29uZmlybSBkaWFsb2cgaGVyZSBiZWNhdXNlIHRoZSBzdWJtaXQgY2FuIG5vdCBiZSBkb25lIGFzeW5jXG5cdFx0XHRcdGlmICghY29uZmlybShsYW5nLmdldChcInJlYWxseVN1Ym1pdENvbnRlbnRfbXNnXCIpKSkge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFwibGluZS1oZWlnaHRcIjogdGhpcy5ib2R5TGluZUhlaWdodCA/IHRoaXMuYm9keUxpbmVIZWlnaHQudG9TdHJpbmcoKSA6IHNpemUubGluZV9oZWlnaHQsXG5cdFx0XHRcdFwidHJhbnNmb3JtLW9yaWdpblwiOiBcInRvcCBsZWZ0XCIsXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZVBpbmNoWm9vbSh6b29tYWJsZTogSFRNTEVsZW1lbnQsIHZpZXdwb3J0OiBIVE1MRWxlbWVudCkge1xuXHRcdC8vIHRoZSBQaW5jaFpvb20gY2xhc3MgZG9lcyBub3QgYWxsb3cgYSBjaGFuZ2luZyB6b29tYWJsZSByZWN0IHNpemUgKG1haWwgYm9keSBjb250ZW50KS4gV2hlbiB3ZSBzaG93IHByZXZpb3VzbHkgdW5sb2FkZWQgaW1hZ2VzIHRoZSBzaXplXG5cdFx0Ly8gb2YgdGhlIG1haWwgYm9keSBjaGFuZ2VzLiBTbyB3ZSBoYXZlIHRvIGNyZWF0ZSBhIG5ldyBQaW5jaFpvb20gb2JqZWN0XG5cdFx0dGhpcy5waW5jaFpvb21hYmxlPy5yZW1vdmUoKVxuXG5cdFx0dGhpcy5waW5jaFpvb21hYmxlID0gbmV3IFBpbmNoWm9vbSh6b29tYWJsZSwgdmlld3BvcnQsIHRydWUsIChlLCB0YXJnZXQpID0+IHtcblx0XHRcdHRoaXMuaGFuZGxlQW5jaG9yQ2xpY2soZSwgdGFyZ2V0LCB0cnVlKVxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUNvbGxhcHNlZFF1b3Rlcyhkb206IFBhcmVudE5vZGUsIHNob3dRdW90ZTogYm9vbGVhbikge1xuXHRcdGNvbnN0IHF1b3RlczogTm9kZUxpc3RPZjxIVE1MRWxlbWVudD4gPSBkb20ucXVlcnlTZWxlY3RvckFsbChcIlt0dXRhLWNvbGxhcHNlZC1xdW90ZV1cIilcblx0XHRmb3IgKGNvbnN0IHF1b3RlV3JhcCBvZiBBcnJheS5mcm9tKHF1b3RlcykpIHtcblx0XHRcdGNvbnN0IHF1b3RlID0gcXVvdGVXcmFwLmNoaWxkcmVuWzBdIGFzIEhUTUxFbGVtZW50XG5cdFx0XHRxdW90ZS5zdHlsZS5kaXNwbGF5ID0gc2hvd1F1b3RlID8gXCJcIiA6IFwibm9uZVwiXG5cdFx0XHRjb25zdCBxdW90ZUluZGljYXRvciA9IHF1b3RlV3JhcC5jaGlsZHJlblsxXSBhcyBIVE1MRWxlbWVudFxuXHRcdFx0cXVvdGVJbmRpY2F0b3Iuc3R5bGUuZGlzcGxheSA9IHNob3dRdW90ZSA/IFwibm9uZVwiIDogXCJcIlxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnBpbmNoWm9vbWFibGUpIHtcblx0XHRcdHRoaXMuY3JlYXRlUGluY2hab29tKHRoaXMucGluY2hab29tYWJsZS5nZXRab29tYWJsZSgpLCB0aGlzLnBpbmNoWm9vbWFibGUuZ2V0Vmlld3BvcnQoKSlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHNob3VsZERpc3BsYXlDb2xsYXBzZWRRdW90ZXMoKTogYm9vbGVhbiB7XG5cdFx0Ly8gaWYgdGhlIHVzZXIgZGlkbid0IGRvIGFueXRoaW5nIHlldCB0YWtlIHRoZSBiZWhhdmlvciBwYXNzZWQgZnJvbSB0aGUgb3V0c2lkZSwgb3RoZXJ3aXNlIHdoYXRldmVyIHVzZXIgaGFzIHNlbGVjdGVkXG5cdFx0cmV0dXJuIHRoaXMucXVvdGVTdGF0ZSA9PT0gXCJ1bnNldFwiID8gdGhpcy5jdXJyZW50UXVvdGVCZWhhdmlvciA9PT0gXCJleHBhbmRcIiA6IHRoaXMucXVvdGVTdGF0ZSA9PT0gXCJleHBhbmRlZFwiXG5cdH1cblxuXHQvKipcblx0ICogbWFudWFsbHkgd3JhcCBhbmQgc3R5bGUgYSBtYWlsIGJvZHkgdG8gZGlzcGxheSBjb3JyZWN0bHkgaW5zaWRlIGEgc2hhZG93IHJvb3Rcblx0ICogQHBhcmFtIHNhbml0aXplZE1haWxCb2R5IHRoZSBtYWlsIGJvZHkgdG8gZGlzcGxheVxuXHQgKiBAcGFyYW0gYXR0cnNcblx0ICogQHBhcmFtIHBhcmVudCB0aGUgcGFyZW50IGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgc2hhZG93TWFpbEJvZHlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgcmVuZGVyU2hhZG93TWFpbEJvZHkoc2FuaXRpemVkTWFpbEJvZHk6IERvY3VtZW50RnJhZ21lbnQsIGF0dHJzOiBNYWlsVmlld2VyQXR0cnMsIHBhcmVudDogSFRNTEVsZW1lbnQpIHtcblx0XHR0aGlzLmN1cnJlbnRRdW90ZUJlaGF2aW9yID0gYXR0cnMuZGVmYXVsdFF1b3RlQmVoYXZpb3Jcblx0XHRhc3NlcnROb25OdWxsKHRoaXMuc2hhZG93RG9tUm9vdCwgXCJzaGFkb3cgZG9tIHJvb3QgaXMgbnVsbCFcIilcblx0XHR3aGlsZSAodGhpcy5zaGFkb3dEb21Sb290LmZpcnN0Q2hpbGQpIHtcblx0XHRcdHRoaXMuc2hhZG93RG9tUm9vdC5maXJzdENoaWxkLnJlbW92ZSgpXG5cdFx0fVxuXHRcdGNvbnN0IHdyYXBOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuXHRcdHdyYXBOb2RlLmNsYXNzTmFtZSA9IFwiZHJhZyBzZWxlY3RhYmxlIHRvdWNoLWNhbGxvdXQgYnJlYWstd29yZC1saW5rc1wiICsgKGNsaWVudC5pc01vYmlsZURldmljZSgpID8gXCIgYnJlYWstcHJlXCIgOiBcIlwiKVxuXHRcdHdyYXBOb2RlLnNldEF0dHJpYnV0ZShcImRhdGEtdGVzdGlkXCIsIFwibWFpbEJvZHlfbGFiZWxcIilcblx0XHR3cmFwTm9kZS5zdHlsZS5saW5lSGVpZ2h0ID0gU3RyaW5nKHRoaXMuYm9keUxpbmVIZWlnaHQgPyB0aGlzLmJvZHlMaW5lSGVpZ2h0LnRvU3RyaW5nKCkgOiBzaXplLmxpbmVfaGVpZ2h0KVxuXHRcdHdyYXBOb2RlLnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IFwiMHB4IDBweFwiXG5cblx0XHQvLyBSZW1vdmUgXCJhbGlnblwiIHByb3BlcnR5IGZyb20gdGhlIHRvcC1sZXZlbCBjb250ZW50IGFzIGl0IGNhdXNlcyBvdmVyZmxvdy5cblx0XHQvLyBOb3RlOiB0aGlzIGlzIG5vdCBDU1MgYWxpZ24sIHRoaXMgaXMgYSBkZXByZWNhdGVkIGFsaWduIGF0dHJpYnV0ZS5cblx0XHQvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R1dGFvL3R1dGFub3RhL2lzc3Vlcy84MjcxXG5cdFx0Y29uc3QgY29udGVudFJvb3QgPSBzYW5pdGl6ZWRNYWlsQm9keS5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnRcblx0XHRmb3IgKGNvbnN0IGNoaWxkIG9mIEFycmF5LmZyb20oY29udGVudFJvb3QuY2hpbGRyZW4pKSB7XG5cdFx0XHRjaGlsZC5yZW1vdmVBdHRyaWJ1dGUoXCJhbGlnblwiKVxuXHRcdH1cblxuXHRcdHdyYXBOb2RlLmFwcGVuZENoaWxkKGNvbnRlbnRSb290KVxuXG5cdFx0dGhpcy5zaGFkb3dEb21NYWlsQ29udGVudCA9IHdyYXBOb2RlXG5cblx0XHQvLyBxdWVyeSBhbGwgdG9wIGxldmVsIGJsb2NrIHF1b3Rlc1xuXHRcdGNvbnN0IHF1b3RlRWxlbWVudHMgPSBBcnJheS5mcm9tKHdyYXBOb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJibG9ja3F1b3RlOm5vdChibG9ja3F1b3RlIGJsb2NrcXVvdGUpXCIpKSBhcyBIVE1MRWxlbWVudFtdXG5cdFx0aWYgKHF1b3RlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLnF1b3RlU3RhdGUgPSBcIm5vcXVvdGVzXCJcblx0XHR9XG5cdFx0Zm9yIChjb25zdCBxdW90ZSBvZiBxdW90ZUVsZW1lbnRzKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZUNvbGxhcHNlZEJsb2NrUXVvdGUocXVvdGUsIHRoaXMuc2hvdWxkRGlzcGxheUNvbGxhcHNlZFF1b3RlcygpKVxuXHRcdH1cblxuXHRcdHRoaXMuc2hhZG93RG9tUm9vdC5hcHBlbmRDaGlsZChzdHlsZXMuZ2V0U3R5bGVTaGVldEVsZW1lbnQoXCJtYWluXCIpKVxuXHRcdHRoaXMuc2hhZG93RG9tUm9vdC5hcHBlbmRDaGlsZCh3cmFwTm9kZSlcblxuXHRcdGlmIChjbGllbnQuaXNNb2JpbGVEZXZpY2UoKSkge1xuXHRcdFx0dGhpcy5waW5jaFpvb21hYmxlID0gbnVsbFxuXHRcdFx0dGhpcy5yZXNpemVPYnNlcnZlclpvb21hYmxlPy5kaXNjb25uZWN0KClcblx0XHRcdHRoaXMucmVzaXplT2JzZXJ2ZXJab29tYWJsZSA9IG5ldyBSZXNpemVPYnNlcnZlcigoZW50cmllcykgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5yZXNpemVSYWYpIHtcblx0XHRcdFx0XHQvLyBkaWQgd2UgYWxyZWFkeSBzY2hlZHVsZSBhIHJlc2V0IGZvciBwaW5jaCB0byB6b29tIGluIHRoZSBmcmFtZVxuXHRcdFx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMucmVzaXplUmFmKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucmVzaXplUmFmID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmNyZWF0ZVBpbmNoWm9vbSh3cmFwTm9kZSwgcGFyZW50KSAvLyByZWNyZWF0ZSBmb3IgZXhhbXBsZSBpZiBpbWFnZXMgYXJlIGxvYWRlZCBzbG93bHlcblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdFx0XHR0aGlzLnJlc2l6ZU9ic2VydmVyWm9vbWFibGUub2JzZXJ2ZSh3cmFwTm9kZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0d3JhcE5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChldmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmhhbmRsZUFuY2hvckNsaWNrKGV2ZW50LCBldmVudC50YXJnZXQsIGZhbHNlKVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0dGhpcy5jdXJyZW50bHlSZW5kZXJlZE1haWxCb2R5ID0gc2FuaXRpemVkTWFpbEJvZHlcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQ29sbGFwc2VkQmxvY2tRdW90ZShxdW90ZTogSFRNTEVsZW1lbnQsIGV4cGFuZGVkOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgcXVvdGVXcmFwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxuXHRcdC8vIHVzZWQgdG8gcXVlcnkgcXVvdGVzIGxhdGVyXG5cdFx0cXVvdGVXcmFwLnNldEF0dHJpYnV0ZShcInR1dGEtY29sbGFwc2VkLXF1b3RlXCIsIFwidHJ1ZVwiKVxuXG5cdFx0cXVvdGUucmVwbGFjZVdpdGgocXVvdGVXcmFwKVxuXHRcdHF1b3RlLnN0eWxlLmRpc3BsYXkgPSBleHBhbmRlZCA/IFwiXCIgOiBcIm5vbmVcIlxuXG5cdFx0Y29uc3QgcXVvdGVJbmRpY2F0b3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXG5cdFx0cXVvdGVJbmRpY2F0b3IuY2xhc3NMaXN0LmFkZChcImZsZXhcIilcblx0XHRxdW90ZUluZGljYXRvci5zdHlsZS5ib3JkZXJMZWZ0ID0gYDJweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWBcblx0XHRxdW90ZUluZGljYXRvci5zdHlsZS5kaXNwbGF5ID0gZXhwYW5kZWQgPyBcIm5vbmVcIiA6IFwiXCJcblxuXHRcdG0ucmVuZGVyKFxuXHRcdFx0cXVvdGVJbmRpY2F0b3IsXG5cdFx0XHRtKEljb24sIHtcblx0XHRcdFx0aWNvbjogSWNvbnMuTW9yZSxcblx0XHRcdFx0Y2xhc3M6IFwiaWNvbi14bCBtbHJcIixcblx0XHRcdFx0Y29udGFpbmVyOiBcImRpdlwiLFxuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdGZpbGw6IHRoZW1lLm5hdmlnYXRpb25fbWVudV9pY29uLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSksXG5cdFx0KVxuXG5cdFx0cXVvdGVXcmFwLmFwcGVuZENoaWxkKHF1b3RlKVxuXHRcdHF1b3RlV3JhcC5hcHBlbmRDaGlsZChxdW90ZUluZGljYXRvcilcblx0fVxuXG5cdHByaXZhdGUgY2xlYXJEb21Cb2R5KCkge1xuXHRcdHRoaXMuZG9tQm9keURlZmVycmVkID0gZGVmZXIoKVxuXHRcdHRoaXMuZG9tQm9keSA9IG51bGxcblx0XHR0aGlzLnNoYWRvd0RvbVJvb3QgPSBudWxsXG5cdH1cblxuXHRwcml2YXRlIHNldERvbUJvZHkoZG9tOiBIVE1MRWxlbWVudCkge1xuXHRcdGlmIChkb20gIT09IHRoaXMuZG9tQm9keSB8fCB0aGlzLnNoYWRvd0RvbVJvb3QgPT0gbnVsbCkge1xuXHRcdFx0Ly8gSWYgdGhlIGRvbSBlbGVtZW50IGhhc24ndCBiZWVuIGNyZWF0ZWQgYW5ldyBpbiBvbnVwZGF0ZVxuXHRcdFx0Ly8gdGhlbiB0cnlpbmcgdG8gY3JlYXRlIGEgbmV3IHNoYWRvdyByb290IG9uIHRoZSBzYW1lIG5vZGUgd2lsbCBjYXVzZSBhbiBlcnJvclxuXHRcdFx0dGhpcy5zaGFkb3dEb21Sb290ID0gZG9tLmF0dGFjaFNoYWRvdyh7IG1vZGU6IFwib3BlblwiIH0pXG5cblx0XHRcdC8vIEFsbG93IGZvcm1zIGluc2lkZSBvZiBtYWlsIGJvZGllcyB0byBiZSBmaWxsZWQgb3V0IHdpdGhvdXQgcmVzdWx0aW5nIGluIGtleXN0cm9rZXMgYmVpbmcgaW50ZXJwcmV0ZWQgYXMgc2hvcnRjdXRzXG5cdFx0XHR0aGlzLnNoYWRvd0RvbVJvb3QuZ2V0Um9vdE5vZGUoKS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQ6IEV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudFxuXHRcdFx0XHRpZiAodGhpcy5ldmVudFRhcmdldFdpdGhLZXlib2FyZElucHV0KHRhcmdldCkpIHtcblx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdHRoaXMuZG9tQm9keURlZmVycmVkLnJlc29sdmUoZG9tKVxuXHRcdHRoaXMuZG9tQm9keSA9IGRvbVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJMb2FkaW5nSWNvbigpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5wcm9ncmVzcy1wYW5lbC5mbGV4LXYtY2VudGVyLml0ZW1zLWNlbnRlclwiLFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IFwibG9hZGluZ0ljb25cIixcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRoZWlnaHQ6IFwiMjAwcHhcIixcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbcHJvZ3Jlc3NJY29uKCksIG0oXCJzbWFsbFwiLCBsYW5nLmdldChcImxvYWRpbmdfbXNnXCIpKV0sXG5cdFx0KVxuXHR9XG5cblx0YXN5bmMgcmVwbGFjZUlubGluZUltYWdlcygpIHtcblx0XHRjb25zdCBsb2FkZWRJbmxpbmVJbWFnZXMgPSBhd2FpdCB0aGlzLnZpZXdNb2RlbC5nZXRMb2FkZWRJbmxpbmVJbWFnZXMoKVxuXHRcdGNvbnN0IGRvbUJvZHkgPSBhd2FpdCB0aGlzLmRvbUJvZHlEZWZlcnJlZC5wcm9taXNlXG5cdFx0cmVwbGFjZUNpZHNXaXRoSW5saW5lSW1hZ2VzKGRvbUJvZHksIGxvYWRlZElubGluZUltYWdlcywgKGNpZCwgZXZlbnQpID0+IHtcblx0XHRcdGNvbnN0IGlubGluZUF0dGFjaG1lbnQgPSB0aGlzLnZpZXdNb2RlbC5nZXRBdHRhY2htZW50cygpLmZpbmQoKGF0dGFjaG1lbnQpID0+IGF0dGFjaG1lbnQuY2lkID09PSBjaWQpXG5cdFx0XHRpZiAoaW5saW5lQXR0YWNobWVudCAmJiAoIWNsaWVudC5pc01vYmlsZURldmljZSgpIHx8ICF0aGlzLnBpbmNoWm9vbWFibGUgfHwgIXRoaXMucGluY2hab29tYWJsZS5pc0RyYWdnaW5nT3Jab29taW5nKCkpKSB7XG5cdFx0XHRcdGNvbnN0IGNvb3JkcyA9IGdldENvb3Jkc09mTW91c2VPclRvdWNoRXZlbnQoZXZlbnQpXG5cdFx0XHRcdHNob3dEcm9wZG93bkF0UG9zaXRpb24oXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogXCJkb3dubG9hZF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMudmlld01vZGVsLmRvd25sb2FkQW5kT3BlbkF0dGFjaG1lbnQoaW5saW5lQXR0YWNobWVudCwgZmFsc2UpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IFwib3Blbl9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMudmlld01vZGVsLmRvd25sb2FkQW5kT3BlbkF0dGFjaG1lbnQoaW5saW5lQXR0YWNobWVudCwgdHJ1ZSksXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0Y29vcmRzLngsXG5cdFx0XHRcdFx0Y29vcmRzLnksXG5cdFx0XHRcdClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBzZXR1cFNob3J0Y3V0cyhhdHRyczogTWFpbFZpZXdlckF0dHJzKTogQXJyYXk8U2hvcnRjdXQ+IHtcblx0XHRjb25zdCB1c2VyQ29udHJvbGxlciA9IGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKClcblx0XHRjb25zdCBzaG9ydGN1dHM6IFNob3J0Y3V0W10gPSBbXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5FLFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiB0aGlzLnZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpLFxuXHRcdFx0XHRleGVjOiAoKSA9PiB7XG5cdFx0XHRcdFx0ZWRpdERyYWZ0KHRoaXMudmlld01vZGVsKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcImVkaXRNYWlsX2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkgsXG5cdFx0XHRcdGVuYWJsZWQ6ICgpID0+ICF0aGlzLnZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpLFxuXHRcdFx0XHRleGVjOiAoKSA9PiB7XG5cdFx0XHRcdFx0c2hvd0hlYWRlckRpYWxvZyh0aGlzLnZpZXdNb2RlbC5nZXRIZWFkZXJzKCkpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlbHA6IFwic2hvd0hlYWRlcnNfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuSSxcblx0XHRcdFx0ZW5hYmxlZDogKCkgPT4gIXRoaXMudmlld01vZGVsLmlzRHJhZnRNYWlsKCksXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHRzaG93U291cmNlRGlhbG9nKHRoaXMudmlld01vZGVsLmdldE1haWxCb2R5KCkpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlbHA6IFwic2hvd1NvdXJjZV9hY3Rpb25cIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5SLFxuXHRcdFx0XHRleGVjOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy52aWV3TW9kZWwucmVwbHkoZmFsc2UpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuYWJsZWQ6ICgpID0+ICF0aGlzLnZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpLFxuXHRcdFx0XHRoZWxwOiBcInJlcGx5X2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLlIsXG5cdFx0XHRcdHNoaWZ0OiB0cnVlLFxuXHRcdFx0XHRleGVjOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy52aWV3TW9kZWwucmVwbHkodHJ1ZSlcblx0XHRcdFx0fSxcblx0XHRcdFx0ZW5hYmxlZDogKCkgPT4gIXRoaXMudmlld01vZGVsLmlzRHJhZnRNYWlsKCksXG5cdFx0XHRcdGhlbHA6IFwicmVwbHlBbGxfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdF1cblxuXHRcdGlmICh1c2VyQ29udHJvbGxlci5pc0ludGVybmFsVXNlcigpKSB7XG5cdFx0XHRzaG9ydGN1dHMucHVzaCh7XG5cdFx0XHRcdGtleTogS2V5cy5GLFxuXHRcdFx0XHRzaGlmdDogdHJ1ZSxcblx0XHRcdFx0ZW5hYmxlZDogKCkgPT4gIXRoaXMudmlld01vZGVsLmlzRHJhZnRNYWlsKCksXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLnZpZXdNb2RlbC5mb3J3YXJkKCkuY2F0Y2gob2ZDbGFzcyhVc2VyRXJyb3IsIHNob3dVc2VyRXJyb3IpKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcImZvcndhcmRfYWN0aW9uXCIsXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdHJldHVybiBzaG9ydGN1dHNcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlTGluZUhlaWdodChkb206IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3Qgd2lkdGggPSBkb20ub2Zmc2V0V2lkdGhcblxuXHRcdGlmICh3aWR0aCA+IDkwMCkge1xuXHRcdFx0dGhpcy5ib2R5TGluZUhlaWdodCA9IHNpemUubGluZV9oZWlnaHRfbFxuXHRcdH0gZWxzZSBpZiAod2lkdGggPiA2MDApIHtcblx0XHRcdHRoaXMuYm9keUxpbmVIZWlnaHQgPSBzaXplLmxpbmVfaGVpZ2h0X21cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5ib2R5TGluZUhlaWdodCA9IHNpemUubGluZV9oZWlnaHRcblx0XHR9XG5cblx0XHRkb20uc3R5bGUubGluZUhlaWdodCA9IFN0cmluZyh0aGlzLmJvZHlMaW5lSGVpZ2h0KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjcmVhdGVNYWlsQWRkcmVzc0NvbnRleHRCdXR0b25zKGFyZ3M6IHtcblx0XHRtYWlsQWRkcmVzczogTWFpbEFkZHJlc3NBbmROYW1lXG5cdFx0ZGVmYXVsdEluYm94UnVsZUZpZWxkOiBJbmJveFJ1bGVUeXBlIHwgbnVsbFxuXHRcdGNyZWF0ZUNvbnRhY3Q/OiBib29sZWFuXG5cdH0pOiBQcm9taXNlPEFycmF5PERyb3Bkb3duQnV0dG9uQXR0cnM+PiB7XG5cdFx0Y29uc3QgeyBtYWlsQWRkcmVzcywgZGVmYXVsdEluYm94UnVsZUZpZWxkLCBjcmVhdGVDb250YWN0ID0gdHJ1ZSB9ID0gYXJnc1xuXG5cdFx0Y29uc3QgYnV0dG9ucyA9IFtdIGFzIEFycmF5PERyb3Bkb3duQnV0dG9uQXR0cnM+XG5cblx0XHRidXR0b25zLnB1c2goe1xuXHRcdFx0bGFiZWw6IFwiY29weV9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoKSA9PiBjb3B5VG9DbGlwYm9hcmQobWFpbEFkZHJlc3MuYWRkcmVzcyksXG5cdFx0fSlcblxuXHRcdGlmIChsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmlzSW50ZXJuYWxVc2VyKCkpIHtcblx0XHRcdC8vc2VhcmNoaW5nIGZvciBjb250YWN0cyB3aWxsIG5ldmVyIHJlc29sdmUgaWYgdGhlIHVzZXIgaGFzIG5vdCBsb2dnZWQgaW4gb25saW5lXG5cdFx0XHRpZiAoY3JlYXRlQ29udGFjdCAmJiAhbG9jYXRvci5sb2dpbnMuaXNFbmFibGVkKEZlYXR1cmVUeXBlLkRpc2FibGVDb250YWN0cykgJiYgbG9jYXRvci5sb2dpbnMuaXNGdWxseUxvZ2dlZEluKCkpIHtcblx0XHRcdFx0Y29uc3QgY29udGFjdCA9IGF3YWl0IHRoaXMudmlld01vZGVsLmNvbnRhY3RNb2RlbC5zZWFyY2hGb3JDb250YWN0KG1haWxBZGRyZXNzLmFkZHJlc3MpXG5cdFx0XHRcdGlmIChjb250YWN0KSB7XG5cdFx0XHRcdFx0YnV0dG9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcInNob3dDb250YWN0X2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgW2xpc3RJZCwgY29udGFjdElkXSA9IGFzc2VydE5vdE51bGwoY29udGFjdCkuX2lkXG5cdFx0XHRcdFx0XHRcdG0ucm91dGUuc2V0KFwiL2NvbnRhY3QvOmxpc3RJZC86Y29udGFjdElkXCIsIHsgbGlzdElkLCBjb250YWN0SWQsIGZvY3VzSXRlbTogdHJ1ZSB9KVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJjcmVhdGVDb250YWN0X2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0dGhpcy52aWV3TW9kZWwuY29udGFjdE1vZGVsLmdldENvbnRhY3RMaXN0SWQoKS50aGVuKChjb250YWN0TGlzdElkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aW1wb3J0KFwiLi4vLi4vY29udGFjdHMvQ29udGFjdEVkaXRvclwiKS50aGVuKCh7IENvbnRhY3RFZGl0b3IgfSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29udGFjdCA9IGNyZWF0ZU5ld0NvbnRhY3QobG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyLCBtYWlsQWRkcmVzcy5hZGRyZXNzLCBtYWlsQWRkcmVzcy5uYW1lKVxuXHRcdFx0XHRcdFx0XHRcdFx0bmV3IENvbnRhY3RFZGl0b3IodGhpcy52aWV3TW9kZWwuZW50aXR5Q2xpZW50LCBjb250YWN0LCBhc3NlcnROb3ROdWxsKGNvbnRhY3RMaXN0SWQpKS5zaG93KClcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmIChkZWZhdWx0SW5ib3hSdWxlRmllbGQgJiYgIWxvY2F0b3IubG9naW5zLmlzRW5hYmxlZChGZWF0dXJlVHlwZS5JbnRlcm5hbENvbW11bmljYXRpb24pKSB7XG5cdFx0XHRcdGNvbnN0IHJ1bGUgPSBnZXRFeGlzdGluZ1J1bGVGb3JUeXBlKGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMsIG1haWxBZGRyZXNzLmFkZHJlc3MudHJpbSgpLnRvTG93ZXJDYXNlKCksIGRlZmF1bHRJbmJveFJ1bGVGaWVsZClcblx0XHRcdFx0YnV0dG9ucy5wdXNoKHtcblx0XHRcdFx0XHRsYWJlbDogcnVsZSA/IFwiZWRpdEluYm94UnVsZV9hY3Rpb25cIiA6IFwiYWRkSW5ib3hSdWxlX2FjdGlvblwiLFxuXHRcdFx0XHRcdGNsaWNrOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBtYWlsYm94RGV0YWlscyA9IGF3YWl0IHRoaXMudmlld01vZGVsLm1haWxNb2RlbC5nZXRNYWlsYm94RGV0YWlsc0Zvck1haWwodGhpcy52aWV3TW9kZWwubWFpbClcblx0XHRcdFx0XHRcdGlmIChtYWlsYm94RGV0YWlscyA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgeyBzaG93LCBjcmVhdGVJbmJveFJ1bGVUZW1wbGF0ZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vc2V0dGluZ3MvQWRkSW5ib3hSdWxlRGlhbG9nXCIpXG5cdFx0XHRcdFx0XHRjb25zdCBuZXdSdWxlID0gcnVsZSA/PyBjcmVhdGVJbmJveFJ1bGVUZW1wbGF0ZShkZWZhdWx0SW5ib3hSdWxlRmllbGQsIG1haWxBZGRyZXNzLmFkZHJlc3MudHJpbSgpLnRvTG93ZXJDYXNlKCkpXG5cblx0XHRcdFx0XHRcdHNob3cobWFpbGJveERldGFpbHMsIG5ld1J1bGUpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSlcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMudmlld01vZGVsLmNhbkNyZWF0ZVNwYW1SdWxlKCkpIHtcblx0XHRcdFx0YnV0dG9ucy5wdXNoKHtcblx0XHRcdFx0XHRsYWJlbDogXCJhZGRTcGFtUnVsZV9hY3Rpb25cIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4gdGhpcy5hZGRTcGFtUnVsZShkZWZhdWx0SW5ib3hSdWxlRmllbGQsIG1haWxBZGRyZXNzLmFkZHJlc3MpLFxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBidXR0b25zXG5cdH1cblxuXHRwcml2YXRlIGFkZFNwYW1SdWxlKGRlZmF1bHRJbmJveFJ1bGVGaWVsZDogSW5ib3hSdWxlVHlwZSB8IG51bGwsIGFkZHJlc3M6IHN0cmluZykge1xuXHRcdGNvbnN0IGZvbGRlciA9IHRoaXMudmlld01vZGVsLm1haWxNb2RlbC5nZXRNYWlsRm9sZGVyRm9yTWFpbCh0aGlzLnZpZXdNb2RlbC5tYWlsKVxuXG5cdFx0Y29uc3Qgc3BhbVJ1bGVUeXBlID0gZm9sZGVyICYmIGZvbGRlci5mb2xkZXJUeXBlID09PSBNYWlsU2V0S2luZC5TUEFNID8gU3BhbVJ1bGVUeXBlLldISVRFTElTVCA6IFNwYW1SdWxlVHlwZS5CTEFDS0xJU1RcblxuXHRcdGxldCBzcGFtUnVsZUZpZWxkOiBTcGFtUnVsZUZpZWxkVHlwZVxuXHRcdHN3aXRjaCAoZGVmYXVsdEluYm94UnVsZUZpZWxkKSB7XG5cdFx0XHRjYXNlIEluYm94UnVsZVR5cGUuUkVDSVBJRU5UX1RPX0VRVUFMUzpcblx0XHRcdFx0c3BhbVJ1bGVGaWVsZCA9IFNwYW1SdWxlRmllbGRUeXBlLlRPXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgSW5ib3hSdWxlVHlwZS5SRUNJUElFTlRfQ0NfRVFVQUxTOlxuXHRcdFx0XHRzcGFtUnVsZUZpZWxkID0gU3BhbVJ1bGVGaWVsZFR5cGUuQ0Ncblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBJbmJveFJ1bGVUeXBlLlJFQ0lQSUVOVF9CQ0NfRVFVQUxTOlxuXHRcdFx0XHRzcGFtUnVsZUZpZWxkID0gU3BhbVJ1bGVGaWVsZFR5cGUuQkNDXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHNwYW1SdWxlRmllbGQgPSBTcGFtUnVsZUZpZWxkVHlwZS5GUk9NXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0aW1wb3J0KFwiLi4vLi4vc2V0dGluZ3MvQWRkU3BhbVJ1bGVEaWFsb2dcIikudGhlbihhc3luYyAoeyBzaG93QWRkU3BhbVJ1bGVEaWFsb2cgfSkgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBhZGRyZXNzLnRyaW0oKS50b0xvd2VyQ2FzZSgpXG5cdFx0XHRzaG93QWRkU3BhbVJ1bGVEaWFsb2coXG5cdFx0XHRcdGNyZWF0ZUVtYWlsU2VuZGVyTGlzdEVsZW1lbnQoe1xuXHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdHR5cGU6IHNwYW1SdWxlVHlwZSxcblx0XHRcdFx0XHRmaWVsZDogc3BhbVJ1bGVGaWVsZCxcblx0XHRcdFx0XHRoYXNoZWRWYWx1ZTogYXdhaXQgbG9jYXRvci53b3JrZXIuZ2V0V29ya2VySW50ZXJmYWNlKCkuY3J5cHRvRmFjYWRlLnNoYTI1Nih2YWx1ZSksXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZUFuY2hvckNsaWNrKGV2ZW50OiBFdmVudCwgZXZlbnRUYXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbCwgc2hvdWxkRGlzcGF0Y2hTeW50aGV0aWNDbGljazogYm9vbGVhbik6IHZvaWQge1xuXHRcdGNvbnN0IGhyZWYgPSAoZXZlbnRUYXJnZXQgYXMgRWxlbWVudCB8IG51bGwpPy5jbG9zZXN0KFwiYVwiKT8uZ2V0QXR0cmlidXRlKFwiaHJlZlwiKSA/PyBudWxsXG5cdFx0aWYgKGhyZWYpIHtcblx0XHRcdGlmIChocmVmLnN0YXJ0c1dpdGgoXCJtYWlsdG86XCIpKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXHRcdFx0XHRpZiAoaXNOZXdNYWlsQWN0aW9uQXZhaWxhYmxlKCkpIHtcblx0XHRcdFx0XHQvLyBkaXNhYmxlIG5ldyBtYWlscyBmb3IgZXh0ZXJuYWwgdXNlcnMuXG5cdFx0XHRcdFx0aW1wb3J0KFwiLi4vZWRpdG9yL01haWxFZGl0b3JcIikudGhlbigoeyBuZXdNYWlsdG9VcmxNYWlsRWRpdG9yIH0pID0+IHtcblx0XHRcdFx0XHRcdG5ld01haWx0b1VybE1haWxFZGl0b3IoaHJlZiwgIWxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMuZGVmYXVsdFVuY29uZmlkZW50aWFsKVxuXHRcdFx0XHRcdFx0XHQudGhlbigoZWRpdG9yKSA9PiBlZGl0b3Iuc2hvdygpKVxuXHRcdFx0XHRcdFx0XHQuY2F0Y2gob2ZDbGFzcyhDYW5jZWxsZWRFcnJvciwgbm9PcCkpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpc1NldHRpbmdzTGluayhocmVmLCB0aGlzLnZpZXdNb2RlbC5tYWlsKSkge1xuXHRcdFx0XHQvLyBOYXZpZ2F0ZSB0byB0aGUgc2V0dGluZ3MgbWVudSBpZiB0aGV5IGFyZSBsaW5rZWQgd2l0aGluIGFuIGVtYWlsLlxuXHRcdFx0XHRjb25zdCBuZXdSb3V0ZSA9IGhyZWYuc3Vic3RyaW5nKGhyZWYuaW5kZXhPZihcIi9zZXR0aW5ncy9cIikpXG5cdFx0XHRcdG0ucm91dGUuc2V0KG5ld1JvdXRlKVxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHR9IGVsc2UgaWYgKHNob3VsZERpc3BhdGNoU3ludGhldGljQ2xpY2spIHtcblx0XHRcdFx0Y29uc3Qgc3ludGhldGljVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIilcblx0XHRcdFx0c3ludGhldGljVGFnLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgaHJlZilcblx0XHRcdFx0c3ludGhldGljVGFnLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKVxuXHRcdFx0XHRzeW50aGV0aWNUYWcuc2V0QXR0cmlidXRlKFwicmVsXCIsIFwibm9vcGVuZXIgbm9yZWZlcnJlclwiKVxuXHRcdFx0XHRjb25zdCBuZXdDbGlja0V2ZW50ID0gbmV3IE1vdXNlRXZlbnQoXCJjbGlja1wiKVxuXHRcdFx0XHRzeW50aGV0aWNUYWcuZGlzcGF0Y2hFdmVudChuZXdDbGlja0V2ZW50KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiByZXR1cm5zIHRydWUgaWYgdGhlIHBhc3NlZCBpbiB0YXJnZXQgaXMgYW4gSFRNTEVsZW1lbnQgdGhhdCBjYW4gcmVjZWl2ZSBzb21lIHNvcnQgb2Yga2V5Ym9hcmQgaW5wdXRcblx0ICovXG5cdHByaXZhdGUgZXZlbnRUYXJnZXRXaXRoS2V5Ym9hcmRJbnB1dCh0YXJnZXQ6IEV2ZW50VGFyZ2V0IHwgbnVsbCk6IGJvb2xlYW4ge1xuXHRcdGlmICh0YXJnZXQgJiYgdGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0YXJnZXQubWF0Y2hlcyhcblx0XHRcdFx0J2lucHV0W3R5cGU9XCJ0ZXh0XCJdLCBpbnB1dFt0eXBlPVwiZGF0ZVwiXSwgaW5wdXRbdHlwZT1cImRhdGV0aW1lLWxvY2FsXCJdLCBpbnB1dFt0eXBlPVwiZW1haWxcIl0sIGlucHV0W3R5cGU9XCJtb250aFwiXSwgaW5wdXRbdHlwZT1cIm51bWJlclwiXSwnICtcblx0XHRcdFx0XHQnaW5wdXRbdHlwZT1cInBhc3N3b3JkXCJdLCBpbnB1dFt0eXBlPVwic2VhcmNoXCJdLCBpbnB1dFt0eXBlPVwidGVsXCJdLCBpbnB1dFt0eXBlPVwidGltZVwiXSwgaW5wdXRbdHlwZT1cInVybFwiXSwgaW5wdXRbdHlwZT1cIndlZWtcIl0sIGlucHV0W3R5cGU9XCJkYXRldGltZVwiXSwgdGV4dGFyZWEnLFxuXHRcdFx0KVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlQXR0YWNobWVudEltcG9ydChmaWxlOiBUdXRhbm90YUZpbGUpIHtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy52aWV3TW9kZWwuaW1wb3J0QXR0YWNobWVudChmaWxlKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUubG9nKGUpXG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFVzZXJFcnJvcikge1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgRGlhbG9nLm1lc3NhZ2UobGFuZy5tYWtlVHJhbnNsYXRpb24oXCJlcnJvcl9tc2dcIiwgZS5tZXNzYWdlKSlcblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXCJ1bmtub3duRXJyb3JfbXNnXCIpXG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCB0eXBlIENyZWF0ZU1haWxWaWV3ZXJPcHRpb25zID0ge1xuXHRtYWlsOiBNYWlsXG5cdHNob3dGb2xkZXI6IGJvb2xlYW5cblx0ZGVsYXlCb2R5UmVuZGVyaW5nVW50aWw/OiBQcm9taXNlPHZvaWQ+XG59XG5cbi8qKlxuICogc3VwcG9ydCBhbmQgaW52b2ljZSBtYWlscyBjYW4gY29udGFpbiBsaW5rcyB0byB0aGUgc2V0dGluZ3MgcGFnZS5cbiAqIHdlIGRvbid0IHdhbnQgbm9ybWFsIG1haWxzIHRvIGJlIGFibGUgdG8gbGluayBwbGFjZXMgaW4gdGhlIGFwcCwgdGhvdWdoLlxuICogKi9cbmZ1bmN0aW9uIGlzU2V0dGluZ3NMaW5rKGhyZWY6IHN0cmluZywgbWFpbDogTWFpbCk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gKGhyZWYuc3RhcnRzV2l0aChcIi9zZXR0aW5ncy9cIikgPz8gZmFsc2UpICYmIGlzVHV0YW5vdGFUZWFtTWFpbChtYWlsKVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBmb3JtYXREYXRlV2l0aFdlZWtkYXksIGZvcm1hdFRpbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvRm9ybWF0dGVyLmpzXCJcbmltcG9ydCB7IE1haWxWaWV3ZXJWaWV3TW9kZWwgfSBmcm9tIFwiLi9NYWlsVmlld2VyVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHsgQWxsSWNvbnMsIEljb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb24uanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IHJlc3BvbnNpdmVDYXJkSFBhZGRpbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9jYXJkcy5qc1wiXG5pbXBvcnQgeyBLZXlzLCBUYWJJbmRleCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBpc0tleVByZXNzZWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvS2V5TWFuYWdlci5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L1NoYXJlZE1haWxVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRDb25maWRlbnRpYWxJY29uLCBnZXRGb2xkZXJJY29uQnlUeXBlIH0gZnJvbSBcIi4vTWFpbEd1aVV0aWxzLmpzXCJcblxuZXhwb3J0IGludGVyZmFjZSBDb2xsYXBzZWRNYWlsVmlld0F0dHJzIHtcblx0dmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsXG59XG5cbmV4cG9ydCBjbGFzcyBDb2xsYXBzZWRNYWlsVmlldyBpbXBsZW1lbnRzIENvbXBvbmVudDxDb2xsYXBzZWRNYWlsVmlld0F0dHJzPiB7XG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxDb2xsYXBzZWRNYWlsVmlld0F0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHZpZXdNb2RlbCB9ID0gYXR0cnNcblx0XHRjb25zdCB7IG1haWwgfSA9IHZpZXdNb2RlbFxuXHRcdGNvbnN0IGRhdGVUaW1lID0gZm9ybWF0RGF0ZVdpdGhXZWVrZGF5KG1haWwucmVjZWl2ZWREYXRlKSArIFwiIOKAoiBcIiArIGZvcm1hdFRpbWUobWFpbC5yZWNlaXZlZERhdGUpXG5cdFx0Y29uc3QgZm9sZGVySW5mbyA9IHZpZXdNb2RlbC5nZXRGb2xkZXJJbmZvKClcblx0XHRpZiAoIWZvbGRlckluZm8pIHJldHVybiBudWxsXG5cblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguaXRlbXMtY2VudGVyLnB0LnBiLmNsaWNrLm5vLXdyYXBcIixcblx0XHRcdHtcblx0XHRcdFx0Y2xhc3M6IHJlc3BvbnNpdmVDYXJkSFBhZGRpbmcoKSxcblx0XHRcdFx0cm9sZTogXCJidXR0b25cIixcblx0XHRcdFx0XCJhcmlhLWV4cGFuZGVkXCI6IFwiZmFsc2VcIixcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9idXR0b24sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uY2xpY2s6ICgpID0+IHZpZXdNb2RlbC5leHBhbmRNYWlsKFByb21pc2UucmVzb2x2ZSgpKSxcblx0XHRcdFx0b25rZXl1cDogKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRcdFx0XHRpZiAoaXNLZXlQcmVzc2VkKGUua2V5LCBLZXlzLlNQQUNFKSkge1xuXHRcdFx0XHRcdFx0dmlld01vZGVsLmV4cGFuZE1haWwoUHJvbWlzZS5yZXNvbHZlKCkpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0YWJpbmRleDogVGFiSW5kZXguRGVmYXVsdCxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdHZpZXdNb2RlbC5pc1VucmVhZCgpID8gdGhpcy5yZW5kZXJVbnJlYWREb3QoKSA6IG51bGwsXG5cdFx0XHRcdHZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpID8gbShcIi5tci14c1wiLCB0aGlzLnJlbmRlckljb24oSWNvbnMuRWRpdCwgbGFuZy5nZXQoXCJkcmFmdF9sYWJlbFwiKSkpIDogbnVsbCxcblx0XHRcdFx0dGhpcy5yZW5kZXJTZW5kZXIodmlld01vZGVsKSxcblx0XHRcdFx0bShcIi5mbGV4Lm1sLWJldHdlZW4tcy5pdGVtcy1jZW50ZXJcIiwgW1xuXHRcdFx0XHRcdG1haWwuYXR0YWNobWVudHMubGVuZ3RoID4gMCA/IHRoaXMucmVuZGVySWNvbihJY29ucy5BdHRhY2htZW50LCBsYW5nLmdldChcImF0dGFjaG1lbnRfbGFiZWxcIikpIDogbnVsbCxcblx0XHRcdFx0XHR2aWV3TW9kZWwuaXNDb25maWRlbnRpYWwoKSA/IHRoaXMucmVuZGVySWNvbihnZXRDb25maWRlbnRpYWxJY29uKG1haWwpLCBsYW5nLmdldChcImNvbmZpZGVudGlhbF9sYWJlbFwiKSkgOiBudWxsLFxuXHRcdFx0XHRcdHRoaXMucmVuZGVySWNvbihnZXRGb2xkZXJJY29uQnlUeXBlKGZvbGRlckluZm8uZm9sZGVyVHlwZSksIGZvbGRlckluZm8ubmFtZSksXG5cdFx0XHRcdFx0bShcIi5zbWFsbC5mb250LXdlaWdodC02MDBcIiwgZGF0ZVRpbWUpLFxuXHRcdFx0XHRdKSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJTZW5kZXIodmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsKSB7XG5cdFx0Y29uc3Qgc2VuZGVyID0gdmlld01vZGVsLmdldERpc3BsYXllZFNlbmRlcigpXG5cdFx0cmV0dXJuIG0odGhpcy5nZXRNYWlsQWRkcmVzc0Rpc3BsYXlDbGFzc2VzKHZpZXdNb2RlbCksIHNlbmRlciA9PSBudWxsID8gXCJcIiA6IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQoc2VuZGVyLm5hbWUsIHNlbmRlci5hZGRyZXNzLCB0cnVlKSlcblx0fVxuXG5cdHByaXZhdGUgZ2V0TWFpbEFkZHJlc3NEaXNwbGF5Q2xhc3Nlcyh2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwpOiBzdHJpbmcge1xuXHRcdGxldCBjbGFzc2VzID0gXCIuZmxleC1ncm93LnRleHQtZWxsaXBzaXNcIlxuXHRcdGlmICh2aWV3TW9kZWwuaXNVbnJlYWQoKSkge1xuXHRcdFx0Y2xhc3NlcyArPSBcIi5mb250LXdlaWdodC02MDBcIlxuXHRcdH1cblx0XHRyZXR1cm4gY2xhc3Nlc1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJVbnJlYWREb3QoKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuZmxleC5mbGV4LW5vLWdyb3cubm8tc2hyaW5rLnByLXNcIixcblx0XHRcdG0oXCIuZG90LmJnLWFjY2VudC1mZ1wiLCB7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0bWFyZ2luVG9wOiAwLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJJY29uKGljb246IEFsbEljb25zLCBob3ZlclRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsKSB7XG5cdFx0cmV0dXJuIG0oSWNvbiwge1xuXHRcdFx0aWNvbixcblx0XHRcdGNvbnRhaW5lcjogXCJkaXZcIixcblx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdGZpbGw6IHRoZW1lLmNvbnRlbnRfYnV0dG9uLFxuXHRcdFx0fSxcblx0XHRcdGhvdmVyVGV4dDogaG92ZXJUZXh0LFxuXHRcdH0pXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgQ29udmVyc2F0aW9uSXRlbSwgQ29udmVyc2F0aW9uVmlld01vZGVsIH0gZnJvbSBcIi4vQ29udmVyc2F0aW9uVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IE1haWxWaWV3ZXIgfSBmcm9tIFwiLi9NYWlsVmlld2VyLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZS5qc1wiXG5pbXBvcnQgeyBCdXR0b24sIEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBlbGVtZW50SWRQYXJ0LCBpc1NhbWVJZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBDb2xsYXBzZWRNYWlsVmlldyB9IGZyb20gXCIuL0NvbGxhcHNlZE1haWxWaWV3LmpzXCJcbmltcG9ydCB7IE1haWxWaWV3ZXJWaWV3TW9kZWwgfSBmcm9tIFwiLi9NYWlsVmlld2VyVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBLZXlzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGtleU1hbmFnZXIsIFNob3J0Y3V0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXIuanNcIlxuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc3R5bGVzLmpzXCJcbmltcG9ydCB7IHJlc3BvbnNpdmVDYXJkSE1hcmdpbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2NhcmRzLmpzXCJcblxuZXhwb3J0IGludGVyZmFjZSBDb252ZXJzYXRpb25WaWV3ZXJBdHRycyB7XG5cdHZpZXdNb2RlbDogQ29udmVyc2F0aW9uVmlld01vZGVsXG5cdGRlbGF5Qm9keVJlbmRlcmluZzogUHJvbWlzZTx1bmtub3duPlxufVxuXG5jb25zdCBTQ1JPTExfRkFDVE9SID0gNCAvIDVcblxuZXhwb3J0IGNvbnN0IGNvbnZlcnNhdGlvbkNhcmRNYXJnaW4gPSBzaXplLmhwYWRfbGFyZ2VcblxuLyoqXG4gKiBEaXNwbGF5cyBtYWlscyBpbiBhIGNvbnZlcnNhdGlvblxuICovXG5leHBvcnQgY2xhc3MgQ29udmVyc2F0aW9uVmlld2VyIGltcGxlbWVudHMgQ29tcG9uZW50PENvbnZlcnNhdGlvblZpZXdlckF0dHJzPiB7XG5cdHByaXZhdGUgY29udGFpbmVyRG9tOiBIVE1MRWxlbWVudCB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgZGlkU2Nyb2xsID0gZmFsc2Vcblx0LyoqIGl0ZW1zIGZyb20gdGhlIGxhc3QgcmVuZGVyLCB3ZSBuZWVkIHRoZW0gdG8gY2FsY3VsYXRlIHRoZSByaWdodCBzdWJqZWN0IGJhc2VkIG9uIHRoZSBzY3JvbGwgcG9zaXRpb24gd2l0aG91dCB0aGUgZnVsbCByZS1yZW5kZXIuICovXG5cdHByaXZhdGUgbGFzdEl0ZW1zOiByZWFkb25seSBDb252ZXJzYXRpb25JdGVtW10gfCBudWxsID0gbnVsbFxuXG5cdHByaXZhdGUgcmVhZG9ubHkgc2hvcnRjdXRzOiBTaG9ydGN1dFtdID0gW1xuXHRcdHtcblx0XHRcdGtleTogS2V5cy5QQUdFX1VQLFxuXHRcdFx0ZXhlYzogKCkgPT4gdGhpcy5zY3JvbGxVcCgpLFxuXHRcdFx0aGVscDogXCJzY3JvbGxVcF9hY3Rpb25cIixcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogS2V5cy5QQUdFX0RPV04sXG5cdFx0XHRleGVjOiAoKSA9PiB0aGlzLnNjcm9sbERvd24oKSxcblx0XHRcdGhlbHA6IFwic2Nyb2xsRG93bl9hY3Rpb25cIixcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogS2V5cy5IT01FLFxuXHRcdFx0ZXhlYzogKCkgPT4gdGhpcy5zY3JvbGxUb1RvcCgpLFxuXHRcdFx0aGVscDogXCJzY3JvbGxUb1RvcF9hY3Rpb25cIixcblx0XHR9LFxuXHRcdHtcblx0XHRcdGtleTogS2V5cy5FTkQsXG5cdFx0XHRleGVjOiAoKSA9PiB0aGlzLnNjcm9sbFRvQm90dG9tKCksXG5cdFx0XHRoZWxwOiBcInNjcm9sbFRvQm90dG9tX2FjdGlvblwiLFxuXHRcdH0sXG5cdF1cblxuXHRvbmNyZWF0ZSgpIHtcblx0XHRrZXlNYW5hZ2VyLnJlZ2lzdGVyU2hvcnRjdXRzKHRoaXMuc2hvcnRjdXRzKVxuXHR9XG5cblx0b25yZW1vdmUoKSB7XG5cdFx0a2V5TWFuYWdlci51bnJlZ2lzdGVyU2hvcnRjdXRzKHRoaXMuc2hvcnRjdXRzKVxuXHR9XG5cblx0dmlldyh2bm9kZTogVm5vZGU8Q29udmVyc2F0aW9uVmlld2VyQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgdmlld01vZGVsLCBkZWxheUJvZHlSZW5kZXJpbmcgfSA9IHZub2RlLmF0dHJzXG5cblx0XHR2aWV3TW9kZWwuaW5pdChkZWxheUJvZHlSZW5kZXJpbmcpXG5cblx0XHR0aGlzLmxhc3RJdGVtcyA9IHZpZXdNb2RlbC5jb252ZXJzYXRpb25JdGVtcygpXG5cdFx0dGhpcy5kb1Njcm9sbCh2aWV3TW9kZWwsIHRoaXMubGFzdEl0ZW1zKVxuXG5cdFx0cmV0dXJuIG0oXCIuZmlsbC1hYnNvbHV0ZS5uYXYtYmcuZmxleC5jb2xcIiwgW1xuXHRcdFx0Ly8gc2VlIGNvbW1lbnQgZm9yIC5zY3JvbGxiYXItZ3V0dGVyLXN0YWJsZS1vci1mYWxsYmFja1xuXHRcdFx0bShcblx0XHRcdFx0XCIuZmxleC1ncm93Lm92ZXJmbG93LXktc2Nyb2xsXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRhaW5lckRvbSA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25yZW1vdmU6ICgpID0+IHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwicmVtb3ZlIGNvbnRhaW5lclwiKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXMucmVuZGVySXRlbXModmlld01vZGVsLCB0aGlzLmxhc3RJdGVtcyksXG5cdFx0XHRcdHRoaXMucmVuZGVyTG9hZGluZ1N0YXRlKHZpZXdNb2RlbCksXG5cdFx0XHRcdHRoaXMucmVuZGVyRm9vdGVyKCksXG5cdFx0XHQpLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckZvb3RlcigpIHtcblx0XHQvLyBIYXZpbmcgbW9yZSByb29tIGF0IHRoZSBib3R0b20gYWxsb3dzIHRoZSBsYXN0IGVtYWlsIHNvIGl0IGlzIChhbG1vc3QpIGFsd2F5cyBpbiB0aGUgc2FtZSBwbGFjZSBvbiB0aGUgc2NyZWVuLlxuXHRcdC8vIFdlIHJlZHVjZSBzcGFjZSBieSAxMDAgZm9yIHRoZSBoZWFkZXIgb2YgdGhlIHZpZXdlciBhbmQgYSBiaXQgbW9yZVxuXHRcdGNvbnN0IGhlaWdodCA9XG5cdFx0XHRkb2N1bWVudC5ib2R5Lm9mZnNldEhlaWdodCAtIChzdHlsZXMuaXNVc2luZ0JvdHRvbU5hdmlnYXRpb24oKSA/IHNpemUubmF2YmFyX2hlaWdodF9tb2JpbGUgKyBzaXplLmJvdHRvbV9uYXZfYmFyIDogc2l6ZS5uYXZiYXJfaGVpZ2h0KSAtIDMwMFxuXHRcdHJldHVybiBtKFwiLm10LWwubm9wcmludFwiLCB7XG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRoZWlnaHQ6IHB4KGhlaWdodCksXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckl0ZW1zKHZpZXdNb2RlbDogQ29udmVyc2F0aW9uVmlld01vZGVsLCBlbnRyaWVzOiByZWFkb25seSBDb252ZXJzYXRpb25JdGVtW10pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIGVudHJpZXMubWFwKChlbnRyeSwgcG9zaXRpb24pID0+IHtcblx0XHRcdHN3aXRjaCAoZW50cnkudHlwZSkge1xuXHRcdFx0XHRjYXNlIFwibWFpbFwiOiB7XG5cdFx0XHRcdFx0Y29uc3QgbWFpbFZpZXdNb2RlbCA9IGVudHJ5LnZpZXdNb2RlbFxuXHRcdFx0XHRcdGNvbnN0IGlzUHJpbWFyeSA9IG1haWxWaWV3TW9kZWwgPT09IHZpZXdNb2RlbC5wcmltYXJ5Vmlld01vZGVsKClcblx0XHRcdFx0XHQvLyBvbmx5IHBhc3MgaW4gcG9zaXRpb24gaWYgd2UgZG8gaGF2ZSBhbiBhY3R1YWwgY29udmVyc2F0aW9uIHBvc2l0aW9uXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucmVuZGVyVmlld2VyKG1haWxWaWV3TW9kZWwsIGlzUHJpbWFyeSwgdmlld01vZGVsLmlzRmluaXNoZWQoKSA/IHBvc2l0aW9uIDogbnVsbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxvYWRpbmdTdGF0ZSh2aWV3TW9kZWw6IENvbnZlcnNhdGlvblZpZXdNb2RlbCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gdmlld01vZGVsLmlzQ29ubmVjdGlvbkxvc3QoKVxuXHRcdFx0PyBtKFxuXHRcdFx0XHRcdFwiLmNlbnRlclwiLFxuXHRcdFx0XHRcdG0oQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdFx0XHRcdGxhYmVsOiBcInJldHJ5X2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHZpZXdNb2RlbC5yZXRyeSgpLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0ICApXG5cdFx0XHQ6ICF2aWV3TW9kZWwuaXNGaW5pc2hlZCgpXG5cdFx0XHQ/IG0oXG5cdFx0XHRcdFx0XCIuZm9udC13ZWlnaHQtNjAwLmNlbnRlci5tdC1sXCIgKyBcIi5cIiArIHJlc3BvbnNpdmVDYXJkSE1hcmdpbigpLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRsYW5nLmdldChcImxvYWRpbmdfbXNnXCIpLFxuXHRcdFx0ICApXG5cdFx0XHQ6IG51bGxcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVmlld2VyKG1haWxWaWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwsIGlzUHJpbWFyeTogYm9vbGVhbiwgcG9zaXRpb246IG51bWJlciB8IG51bGwpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5tbHItc2FmZS1pbnNldFwiLFxuXHRcdFx0bShcblx0XHRcdFx0XCIuYm9yZGVyLXJhZGl1cy1iaWcucmVsXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGFzczogcmVzcG9uc2l2ZUNhcmRITWFyZ2luKCksXG5cdFx0XHRcdFx0a2V5OiBlbGVtZW50SWRQYXJ0KG1haWxWaWV3TW9kZWwubWFpbC5jb252ZXJzYXRpb25FbnRyeSksXG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogdGhlbWUuY29udGVudF9iZyxcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogcHgocG9zaXRpb24gPT0gbnVsbCB8fCBwb3NpdGlvbiA9PT0gMCA/IDAgOiBjb252ZXJzYXRpb25DYXJkTWFyZ2luKSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYWlsVmlld01vZGVsLmlzQ29sbGFwc2VkKClcblx0XHRcdFx0XHQ/IG0oQ29sbGFwc2VkTWFpbFZpZXcsIHtcblx0XHRcdFx0XHRcdFx0dmlld01vZGVsOiBtYWlsVmlld01vZGVsLFxuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IG0oTWFpbFZpZXdlciwge1xuXHRcdFx0XHRcdFx0XHR2aWV3TW9kZWw6IG1haWxWaWV3TW9kZWwsXG5cdFx0XHRcdFx0XHRcdGlzUHJpbWFyeTogaXNQcmltYXJ5LFxuXHRcdFx0XHRcdFx0XHQvLyB3ZSB3YW50IHRvIGV4cGFuZCBmb3IgdGhlIGZpcnN0IGVtYWlsIGxpa2Ugd2hlbiBpdCdzIGEgZm9yd2FyZGVkIGVtYWlsXG5cdFx0XHRcdFx0XHRcdGRlZmF1bHRRdW90ZUJlaGF2aW9yOiBwb3NpdGlvbiA9PT0gMCA/IFwiZXhwYW5kXCIgOiBcImNvbGxhcHNlXCIsXG5cdFx0XHRcdFx0ICB9KSxcblx0XHRcdCksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBkb1Njcm9sbCh2aWV3TW9kZWw6IENvbnZlcnNhdGlvblZpZXdNb2RlbCwgaXRlbXM6IHJlYWRvbmx5IENvbnZlcnNhdGlvbkl0ZW1bXSkge1xuXHRcdGNvbnN0IGNvbnRhaW5lckRvbSA9IHRoaXMuY29udGFpbmVyRG9tXG5cdFx0aWYgKCF0aGlzLmRpZFNjcm9sbCAmJiBjb250YWluZXJEb20gJiYgdmlld01vZGVsLmlzRmluaXNoZWQoKSkge1xuXHRcdFx0Y29uc3QgY29udmVyc2F0aW9uSWQgPSB2aWV3TW9kZWwucHJpbWFyeU1haWwuY29udmVyc2F0aW9uRW50cnlcblxuXHRcdFx0dGhpcy5kaWRTY3JvbGwgPSB0cnVlXG5cdFx0XHQvLyBXZSBuZWVkIHRvIGRvIHRoaXMgYXQgdGhlIGVuZCBvZiB0aGUgZnJhbWUgd2hlbiBldmVyeSBjaGFuZ2UgaXMgYWxyZWFkeSBhcHBsaWVkLlxuXHRcdFx0Ly8gUHJvbWlzZS5yZXNvbHZlKCkgc2NoZWR1bGVzIGEgbWljcm90YXNrIGV4YWN0bHkgd2hlcmUgd2UgbmVlZCBpdC5cblx0XHRcdC8vIFJBRiBpcyB0b28gbG9uZyBhbmQgd291bGQgZmxhc2ggdGhlIHdyb25nIGZyYW1lXG5cdFx0XHRQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0Ly8gVGhlcmUncyBhIGNoYW5jZSB0aGF0IGl0ZW0gYXJlIG5vdCBpbiBzeW5jIHdpdGggZG9tIGJ1dCBpdCdzIHZlcnkgdW5saWtlbHksIHRoaXMgaXMgdGhlIHNhbWUgZnJhbWUgYWZ0ZXIgdGhlIGxhc3QgcmVuZGVyIHdlIHVzZWQgdGhlIGl0ZW1zXG5cdFx0XHRcdC8vIGFuZCB2aWV3TW9kZWwgaXMgZmluaXNoZWQuXG5cdFx0XHRcdGNvbnN0IGl0ZW1JbmRleCA9IGl0ZW1zLmZpbmRJbmRleCgoZSkgPT4gZS50eXBlID09PSBcIm1haWxcIiAmJiBpc1NhbWVJZChlLmVudHJ5SWQsIGNvbnZlcnNhdGlvbklkKSlcblx0XHRcdFx0Ly8gRG9uJ3Qgc2Nyb2xsIGlmIGl0J3MgYWxyZWFkeSB0aGUgZmlyc3QgKG9yIGlmIHdlIGRpZG4ndCBmaW5kIGl0IGJ1dCB0aGF0IHdvdWxkIGJlIHdlaXJkKVxuXHRcdFx0XHRpZiAoaXRlbUluZGV4ID4gMCkge1xuXHRcdFx0XHRcdGNvbnN0IGNoaWxkRG9tID0gY29udGFpbmVyRG9tLmNoaWxkTm9kZXNbaXRlbUluZGV4XSBhcyBIVE1MRWxlbWVudFxuXHRcdFx0XHRcdGNvbnN0IHBhcmVudFRvcCA9IGNvbnRhaW5lckRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3Bcblx0XHRcdFx0XHRjb25zdCBjaGlsZFRvcCA9IGNoaWxkRG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuXHRcdFx0XHRcdGNvbnN0IHJlbGF0aXZlVG9wID0gY2hpbGRUb3AgLSBwYXJlbnRUb3Bcblx0XHRcdFx0XHRjb25zdCB0b3AgPSByZWxhdGl2ZVRvcCAtIGNvbnZlcnNhdGlvbkNhcmRNYXJnaW4gKiAyIC0gMTBcblx0XHRcdFx0XHRjb250YWluZXJEb20uc2Nyb2xsVG8oeyB0b3A6IHRvcCB9KVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc2Nyb2xsVXAoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuY29udGFpbmVyRG9tKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lckRvbS5zY3JvbGxCeSh7IHRvcDogLXRoaXMuY29udGFpbmVyRG9tLmNsaWVudEhlaWdodCAqIFNDUk9MTF9GQUNUT1IsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBzY3JvbGxEb3duKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmNvbnRhaW5lckRvbSkge1xuXHRcdFx0dGhpcy5jb250YWluZXJEb20uc2Nyb2xsQnkoeyB0b3A6IHRoaXMuY29udGFpbmVyRG9tLmNsaWVudEhlaWdodCAqIFNDUk9MTF9GQUNUT1IsIGJlaGF2aW9yOiBcInNtb290aFwiIH0pXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBzY3JvbGxUb1RvcCgpOiB2b2lkIHtcblx0XHRpZiAodGhpcy5jb250YWluZXJEb20pIHtcblx0XHRcdHRoaXMuY29udGFpbmVyRG9tLnNjcm9sbFRvKHsgdG9wOiAwLCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc2Nyb2xsVG9Cb3R0b20oKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuY29udGFpbmVyRG9tKSB7XG5cdFx0XHR0aGlzLmNvbnRhaW5lckRvbS5zY3JvbGxUbyh7IHRvcDogdGhpcy5jb250YWluZXJEb20uc2Nyb2xsSGVpZ2h0IC0gdGhpcy5jb250YWluZXJEb20ub2Zmc2V0SGVpZ2h0LCBiZWhhdmlvcjogXCJzbW9vdGhcIiB9KVxuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBNYWlsYm94TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L01haWxib3hNb2RlbC5qc1wiXG5pbXBvcnQgeyBNYWlsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBwcm9tcHRBbmREZWxldGVNYWlscywgc2hvd01vdmVNYWlsc0Ryb3Bkb3duIH0gZnJvbSBcIi4vTWFpbEd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IG5vT3AsIG9mQ2xhc3MgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyBNYWlsVmlld2VyVmlld01vZGVsIH0gZnJvbSBcIi4vTWFpbFZpZXdlclZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBVc2VyRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJFcnJvci5qc1wiXG5pbXBvcnQgeyBzaG93VXNlckVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0Vycm9ySGFuZGxlckltcGwuanNcIlxuaW1wb3J0IHsgY3JlYXRlRHJvcGRvd24sIERyb3Bkb3duQnV0dG9uQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3Bkb3duLmpzXCJcbmltcG9ydCB7IGVkaXREcmFmdCwgbWFpbFZpZXdlck1vcmVBY3Rpb25zIH0gZnJvbSBcIi4vTWFpbFZpZXdlclV0aWxzLmpzXCJcbmltcG9ydCB7IEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBpc0FwcCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vQ29tbW9uTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBzaG93UHJvZ3Jlc3NEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9kaWFsb2dzL1Byb2dyZXNzRGlhbG9nLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgRGlhbG9nSGVhZGVyQmFyQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZ0hlYWRlckJhci5qc1wiXG5pbXBvcnQgeyBEaWFsb2csIERpYWxvZ1R5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBDb2x1bW5XaWR0aCwgVGFibGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1RhYmxlLmpzXCJcbmltcG9ydCB7IEV4cGFuZGVyQnV0dG9uLCBFeHBhbmRlclBhbmVsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9FeHBhbmRlci5qc1wiXG5pbXBvcnQgc3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBleHBvcnRNYWlscyB9IGZyb20gXCIuLi9leHBvcnQvRXhwb3J0ZXIuanNcIlxuaW1wb3J0IHsgTWFpbE1vZGVsIH0gZnJvbSBcIi4uL21vZGVsL01haWxNb2RlbC5qc1wiXG5pbXBvcnQgeyBMYWJlbHNQb3B1cCB9IGZyb20gXCIuL0xhYmVsc1BvcHVwLmpzXCJcbmltcG9ydCB7IGFsbEluU2FtZU1haWxib3ggfSBmcm9tIFwiLi4vbW9kZWwvTWFpbFV0aWxzXCJcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3N0eWxlc1wiXG5cbi8qXG5cdG5vdGUgdGhhdCBtYWlsVmlld2VyVmlld01vZGVsIGhhcyBhIG1haWxNb2RlbCwgc28geW91IGRvIG5vdCBuZWVkIHRvIHBhc3MgYm90aCBpZiB5b3UgcGFzcyBhIG1haWxWaWV3ZXJWaWV3TW9kZWxcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYWlsVmlld2VyVG9vbGJhckF0dHJzIHtcblx0bWFpbGJveE1vZGVsOiBNYWlsYm94TW9kZWxcblx0bWFpbE1vZGVsOiBNYWlsTW9kZWxcblx0bWFpbFZpZXdlclZpZXdNb2RlbD86IE1haWxWaWV3ZXJWaWV3TW9kZWxcblx0bWFpbHM6IE1haWxbXVxuXHRzZWxlY3ROb25lPzogKCkgPT4gdm9pZFxufVxuXG4vLyBOb3RlOiB0aGlzIGlzIG9ubHkgdXNlZCBmb3Igbm9uLW1vYmlsZSB2aWV3cy4gUGxlYXNlIGFsc28gdXBkYXRlIE1vYmlsZU1haWxNdWx0aXNlbGVjdGlvbkFjdGlvbkJhciBvciBNb2JpbGVNYWlsQWN0aW9uQmFyXG5leHBvcnQgY2xhc3MgTWFpbFZpZXdlckFjdGlvbnMgaW1wbGVtZW50cyBDb21wb25lbnQ8TWFpbFZpZXdlclRvb2xiYXJBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxNYWlsVmlld2VyVG9vbGJhckF0dHJzPikge1xuXHRcdHJldHVybiBtKFwiLmZsZXgubWwtYmV0d2Vlbi1zLml0ZW1zLWNlbnRlclwiLCBbXG5cdFx0XHR0aGlzLnJlbmRlclNpbmdsZU1haWxBY3Rpb25zKHZub2RlLmF0dHJzKSxcblx0XHRcdHZub2RlLmF0dHJzLm1haWxWaWV3ZXJWaWV3TW9kZWwgPyBtKFwiLm5hdi1iYXItc3BhY2VyXCIpIDogbnVsbCxcblx0XHRcdHRoaXMucmVuZGVyQWN0aW9ucyh2bm9kZS5hdHRycyksXG5cdFx0XHR0aGlzLnJlbmRlck1vcmVCdXR0b24odm5vZGUuYXR0cnMubWFpbFZpZXdlclZpZXdNb2RlbCksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQWN0aW9ucyhhdHRyczogTWFpbFZpZXdlclRvb2xiYXJBdHRycyk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBtYWlsTW9kZWwgPSBhdHRycy5tYWlsVmlld2VyVmlld01vZGVsID8gYXR0cnMubWFpbFZpZXdlclZpZXdNb2RlbC5tYWlsTW9kZWwgOiBhdHRycy5tYWlsTW9kZWxcblxuXHRcdGlmICghbWFpbE1vZGVsIHx8ICFhdHRycy5tYWlscykge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2UgaWYgKGF0dHJzLm1haWxWaWV3ZXJWaWV3TW9kZWwpIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHRoaXMucmVuZGVyRGVsZXRlQnV0dG9uKG1haWxNb2RlbCwgYXR0cnMubWFpbHMsIGF0dHJzLnNlbGVjdE5vbmUgPz8gbm9PcCksXG5cdFx0XHRcdGF0dHJzLm1haWxWaWV3ZXJWaWV3TW9kZWwuY2FuRm9yd2FyZE9yTW92ZSgpID8gdGhpcy5yZW5kZXJNb3ZlQnV0dG9uKGF0dHJzLm1haWxib3hNb2RlbCwgbWFpbE1vZGVsLCBhdHRycy5tYWlscykgOiBudWxsLFxuXHRcdFx0XHRhdHRycy5tYWlsTW9kZWwuY2FuQXNzaWduTGFiZWxzKCkgPyB0aGlzLnJlbmRlckxhYmVsQnV0dG9uKG1haWxNb2RlbCwgYXR0cnMubWFpbHMpIDogbnVsbCxcblx0XHRcdFx0YXR0cnMubWFpbFZpZXdlclZpZXdNb2RlbC5pc0RyYWZ0TWFpbCgpID8gbnVsbCA6IHRoaXMucmVuZGVyUmVhZEJ1dHRvbihhdHRycyksXG5cdFx0XHRdXG5cdFx0fSBlbHNlIGlmIChhdHRycy5tYWlscy5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHR0aGlzLnJlbmRlckRlbGV0ZUJ1dHRvbihtYWlsTW9kZWwsIGF0dHJzLm1haWxzLCBhdHRycy5zZWxlY3ROb25lID8/IG5vT3ApLFxuXHRcdFx0XHRhdHRycy5tYWlsTW9kZWwuaXNNb3ZpbmdNYWlsc0FsbG93ZWQoKSA/IHRoaXMucmVuZGVyTW92ZUJ1dHRvbihhdHRycy5tYWlsYm94TW9kZWwsIG1haWxNb2RlbCwgYXR0cnMubWFpbHMpIDogbnVsbCxcblx0XHRcdFx0YXR0cnMubWFpbE1vZGVsLmNhbkFzc2lnbkxhYmVscygpICYmIGFsbEluU2FtZU1haWxib3goYXR0cnMubWFpbHMpID8gdGhpcy5yZW5kZXJMYWJlbEJ1dHRvbihtYWlsTW9kZWwsIGF0dHJzLm1haWxzKSA6IG51bGwsXG5cdFx0XHRcdHRoaXMucmVuZGVyUmVhZEJ1dHRvbihhdHRycyksXG5cdFx0XHRcdHRoaXMucmVuZGVyRXhwb3J0QnV0dG9uKGF0dHJzKSxcblx0XHRcdF1cblx0XHR9XG5cdH1cblxuXHQvKlxuXHQgKiBBY3Rpb25zIHRoYXQgY2FuIG9ubHkgYmUgdGFrZW4gb24gYSBzaW5nbGUgbWFpbCAocmVwbHksIGZvcndhcmQsIGVkaXQsIGFzc2lnbilcblx0ICogV2lsbCBvbmx5IHJldHVybiBhY3Rpb25zIGlmIHRoZXJlIGlzIGEgbWFpbFZpZXdlclZpZXdNb2RlbFxuXHQgKiAqL1xuXHRwcml2YXRlIHJlbmRlclNpbmdsZU1haWxBY3Rpb25zKGF0dHJzOiBNYWlsVmlld2VyVG9vbGJhckF0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdC8vIG1haWxWaWV3ZXJWaWV3TW9kZWwgbWVhbnMgd2UgYXJlIHZpZXdpbmcgb25lIG1haWw7IGlmIHRoZXJlIGlzIG9ubHkgdGhlIG1haWxNb2RlbCwgaXQgaXMgY29taW5nIGZyb20gYSBNdWx0aVZpZXdlclxuXHRcdGlmIChhdHRycy5tYWlsVmlld2VyVmlld01vZGVsKSB7XG5cdFx0XHRpZiAoYXR0cnMubWFpbFZpZXdlclZpZXdNb2RlbC5pc0Fubm91bmNlbWVudCgpKSB7XG5cdFx0XHRcdHJldHVybiBbXVxuXHRcdFx0fSBlbHNlIGlmIChhdHRycy5tYWlsVmlld2VyVmlld01vZGVsLmlzRHJhZnRNYWlsKCkpIHtcblx0XHRcdFx0cmV0dXJuIFt0aGlzLnJlbmRlckVkaXRCdXR0b24oYXR0cnMubWFpbFZpZXdlclZpZXdNb2RlbCldXG5cdFx0XHR9IGVsc2UgaWYgKGF0dHJzLm1haWxWaWV3ZXJWaWV3TW9kZWwuY2FuRm9yd2FyZE9yTW92ZSgpKSB7XG5cdFx0XHRcdHJldHVybiBbdGhpcy5yZW5kZXJSZXBseUJ1dHRvbihhdHRycy5tYWlsVmlld2VyVmlld01vZGVsKSwgdGhpcy5yZW5kZXJGb3J3YXJkQnV0dG9uKGF0dHJzLm1haWxWaWV3ZXJWaWV3TW9kZWwpXVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFt0aGlzLnJlbmRlclJlcGx5QnV0dG9uKGF0dHJzLm1haWxWaWV3ZXJWaWV3TW9kZWwpXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRlbGV0ZUJ1dHRvbihtYWlsTW9kZWw6IE1haWxNb2RlbCwgbWFpbHM6IE1haWxbXSwgc2VsZWN0Tm9uZTogKCkgPT4gdm9pZCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJkZWxldGVfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRwcm9tcHRBbmREZWxldGVNYWlscyhtYWlsTW9kZWwsIG1haWxzLCBzZWxlY3ROb25lKVxuXHRcdFx0fSxcblx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlck1vdmVCdXR0b24obWFpbGJveE1vZGVsOiBNYWlsYm94TW9kZWwsIG1haWxNb2RlbDogTWFpbE1vZGVsLCBtYWlsczogTWFpbFtdKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcIm1vdmVfYWN0aW9uXCIsXG5cdFx0XHRpY29uOiBJY29ucy5Gb2xkZXIsXG5cdFx0XHRjbGljazogKGUsIGRvbSkgPT4gc2hvd01vdmVNYWlsc0Ryb3Bkb3duKG1haWxib3hNb2RlbCwgbWFpbE1vZGVsLCBkb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIG1haWxzKSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJMYWJlbEJ1dHRvbihtYWlsTW9kZWw6IE1haWxNb2RlbCwgbWFpbHM6IE1haWxbXSk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJhc3NpZ25MYWJlbF9hY3Rpb25cIixcblx0XHRcdGljb246IEljb25zLkxhYmVsLFxuXHRcdFx0Y2xpY2s6IChfLCBkb20pID0+IHtcblx0XHRcdFx0Y29uc3QgcG9wdXAgPSBuZXcgTGFiZWxzUG9wdXAoXG5cdFx0XHRcdFx0ZG9tLFxuXHRcdFx0XHRcdGRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcblx0XHRcdFx0XHRzdHlsZXMuaXNEZXNrdG9wTGF5b3V0KCkgPyAzMDAgOiAyMDAsXG5cdFx0XHRcdFx0bWFpbE1vZGVsLmdldExhYmVsc0Zvck1haWxzKG1haWxzKSxcblx0XHRcdFx0XHRtYWlsTW9kZWwuZ2V0TGFiZWxTdGF0ZXNGb3JNYWlscyhtYWlscyksXG5cdFx0XHRcdFx0KGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzKSA9PiBtYWlsTW9kZWwuYXBwbHlMYWJlbHMobWFpbHMsIGFkZGVkTGFiZWxzLCByZW1vdmVkTGFiZWxzKSxcblx0XHRcdFx0KVxuXHRcdFx0XHRwb3B1cC5zaG93KClcblx0XHRcdH0sXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUmVhZEJ1dHRvbih7IG1haWxNb2RlbCwgbWFpbFZpZXdlclZpZXdNb2RlbCwgbWFpbHMgfTogTWFpbFZpZXdlclRvb2xiYXJBdHRycyk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBtYXJrQWN0aW9uOiAodW5yZWFkOiBib29sZWFuKSA9PiB1bmtub3duID0gbWFpbFZpZXdlclZpZXdNb2RlbFxuXHRcdFx0PyAodW5yZWFkKSA9PiBtYWlsVmlld2VyVmlld01vZGVsLnNldFVucmVhZCh1bnJlYWQpXG5cdFx0XHQ6ICh1bnJlYWQpID0+IG1haWxNb2RlbC5tYXJrTWFpbHMobWFpbHMsIHVucmVhZClcblxuXHRcdGNvbnN0IG1hcmtSZWFkQnV0dG9uID0gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJtYXJrUmVhZF9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoKSA9PiBtYXJrQWN0aW9uKGZhbHNlKSxcblx0XHRcdGljb246IEljb25zLkV5ZSxcblx0XHR9KVxuXHRcdGNvbnN0IG1hcmtVbnJlYWRCdXR0b24gPSBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcIm1hcmtVbnJlYWRfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogKCkgPT4gbWFya0FjdGlvbih0cnVlKSxcblx0XHRcdGljb246IEljb25zLk5vRXllLFxuXHRcdH0pXG5cblx0XHQvLyBtYWlsVmlld2VyVmlld01vZGVsIG1lYW5zIHdlIGFyZSB2aWV3aW5nIG9uZSBtYWlsOyBpZiB0aGVyZSBpcyBvbmx5IHRoZSBtYWlsTW9kZWwsIGl0IGlzIGNvbWluZyBmcm9tIGEgTXVsdGlWaWV3ZXJcblx0XHRpZiAobWFpbFZpZXdlclZpZXdNb2RlbCkge1xuXHRcdFx0aWYgKG1haWxWaWV3ZXJWaWV3TW9kZWwuaXNVbnJlYWQoKSkge1xuXHRcdFx0XHRyZXR1cm4gbWFya1JlYWRCdXR0b25cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBtYXJrVW5yZWFkQnV0dG9uXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFttYXJrUmVhZEJ1dHRvbiwgbWFya1VucmVhZEJ1dHRvbl1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRXhwb3J0QnV0dG9uKGF0dHJzOiBNYWlsVmlld2VyVG9vbGJhckF0dHJzKSB7XG5cdFx0aWYgKCFpc0FwcCgpICYmIGF0dHJzLm1haWxNb2RlbC5pc0V4cG9ydGluZ01haWxzQWxsb3dlZCgpKSB7XG5cdFx0XHRjb25zdCBvcGVyYXRpb24gPSBsb2NhdG9yLm9wZXJhdGlvblByb2dyZXNzVHJhY2tlci5zdGFydE5ld09wZXJhdGlvbigpXG5cdFx0XHRjb25zdCBhYyA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKVxuXHRcdFx0Y29uc3QgaGVhZGVyQmFyQXR0cnM6IERpYWxvZ0hlYWRlckJhckF0dHJzID0ge1xuXHRcdFx0XHRsZWZ0OiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGFjLmFib3J0KCksXG5cdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRdLFxuXHRcdFx0XHRtaWRkbGU6IFwiZW1wdHlTdHJpbmdfbXNnXCIsXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdFx0dGl0bGU6IFwiZXhwb3J0X2FjdGlvblwiLFxuXHRcdFx0XHRjbGljazogKCkgPT5cblx0XHRcdFx0XHRzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcdFx0XHRsYW5nLmdldFRyYW5zbGF0aW9uKFwibWFpbEV4cG9ydFByb2dyZXNzX21zZ1wiLCB7XG5cdFx0XHRcdFx0XHRcdFwie2N1cnJlbnR9XCI6IE1hdGgucm91bmQoKG9wZXJhdGlvbi5wcm9ncmVzcygpIC8gMTAwKSAqIGF0dHJzLm1haWxzLmxlbmd0aCkudG9GaXhlZCgwKSxcblx0XHRcdFx0XHRcdFx0XCJ7dG90YWx9XCI6IGF0dHJzLm1haWxzLmxlbmd0aCxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0ZXhwb3J0TWFpbHMoXG5cdFx0XHRcdFx0XHRcdGF0dHJzLm1haWxzLFxuXHRcdFx0XHRcdFx0XHRsb2NhdG9yLm1haWxGYWNhZGUsXG5cdFx0XHRcdFx0XHRcdGxvY2F0b3IuZW50aXR5Q2xpZW50LFxuXHRcdFx0XHRcdFx0XHRsb2NhdG9yLmZpbGVDb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRsb2NhdG9yLmNyeXB0b0ZhY2FkZSxcblx0XHRcdFx0XHRcdFx0b3BlcmF0aW9uLmlkLFxuXHRcdFx0XHRcdFx0XHRhYy5zaWduYWwsXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdC50aGVuKChyZXN1bHQpID0+IHRoaXMuaGFuZGxlRXhwb3J0RW1haWxzUmVzdWx0KHJlc3VsdC5mYWlsZWQpKVxuXHRcdFx0XHRcdFx0XHQuZmluYWxseShvcGVyYXRpb24uZG9uZSksXG5cdFx0XHRcdFx0XHRvcGVyYXRpb24ucHJvZ3Jlc3MsXG5cdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0aGVhZGVyQmFyQXR0cnMsXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0aWNvbjogSWNvbnMuRXhwb3J0LFxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGhhbmRsZUV4cG9ydEVtYWlsc1Jlc3VsdChtYWlsTGlzdDogTWFpbFtdKSB7XG5cdFx0aWYgKG1haWxMaXN0ICYmIG1haWxMaXN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGxpbmVzID0gbWFpbExpc3QubWFwKChtYWlsKSA9PiAoe1xuXHRcdFx0XHRjZWxsczogW21haWwuc2VuZGVyLmFkZHJlc3MsIG1haWwuc3ViamVjdF0sXG5cdFx0XHRcdGFjdGlvbkJ1dHRvbkF0dHJzOiBudWxsLFxuXHRcdFx0fSkpXG5cblx0XHRcdGNvbnN0IGV4cGFuZGVkID0gc3RyZWFtPGJvb2xlYW4+KGZhbHNlKVxuXHRcdFx0Y29uc3QgZGlhbG9nID0gRGlhbG9nLmNyZWF0ZUFjdGlvbkRpYWxvZyh7XG5cdFx0XHRcdHRpdGxlOiBcImZhaWxlZFRvRXhwb3J0X3RpdGxlXCIsXG5cdFx0XHRcdGNoaWxkOiAoKSA9PlxuXHRcdFx0XHRcdG0oXCJcIiwgW1xuXHRcdFx0XHRcdFx0bShcIi5wdC1tXCIsIGxhbmcuZ2V0KFwiZmFpbGVkVG9FeHBvcnRfbXNnXCIpKSxcblx0XHRcdFx0XHRcdG0oXCIuZmxleC1zdGFydC5pdGVtcy1jZW50ZXJcIiwgW1xuXHRcdFx0XHRcdFx0XHRtKEV4cGFuZGVyQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IGxhbmcubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJoaWRlX3Nob3dcIixcblx0XHRcdFx0XHRcdFx0XHRcdGAke2xhbmcuZ2V0KGV4cGFuZGVkKCkgPyBcImhpZGVfYWN0aW9uXCIgOiBcInNob3dfYWN0aW9uXCIpfSAke2xhbmcuZ2V0KFwiZmFpbGVkVG9FeHBvcnRfbGFiZWxcIiwgeyBcInswfVwiOiBtYWlsTGlzdC5sZW5ndGggfSl9YCxcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiBleHBhbmRlZCgpLFxuXHRcdFx0XHRcdFx0XHRcdG9uRXhwYW5kZWRDaGFuZ2U6IGV4cGFuZGVkLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFx0RXhwYW5kZXJQYW5lbCxcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiBleHBhbmRlZCgpLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRtKFRhYmxlLCB7XG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uSGVhZGluZzogW1wiZW1haWxfbGFiZWxcIiwgXCJzdWJqZWN0X2xhYmVsXCJdLFxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbldpZHRoczogW0NvbHVtbldpZHRoLkxhcmdlc3QsIENvbHVtbldpZHRoLkxhcmdlc3RdLFxuXHRcdFx0XHRcdFx0XHRcdHNob3dBY3Rpb25CdXR0b25Db2x1bW46IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdGxpbmVzLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdG9rQWN0aW9uOiAoKSA9PiBkaWFsb2cuY2xvc2UoKSxcblx0XHRcdFx0YWxsb3dDYW5jZWw6IGZhbHNlLFxuXHRcdFx0XHRva0FjdGlvblRleHRJZDogXCJva19hY3Rpb25cIixcblx0XHRcdFx0dHlwZTogRGlhbG9nVHlwZS5FZGl0TWVkaXVtLFxuXHRcdFx0fSlcblxuXHRcdFx0ZGlhbG9nLnNob3coKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUmVwbHlCdXR0b24odmlld01vZGVsOiBNYWlsVmlld2VyVmlld01vZGVsKSB7XG5cdFx0Y29uc3QgYWN0aW9uczogQ2hpbGRyZW4gPSBbXVxuXHRcdGFjdGlvbnMucHVzaChcblx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHR0aXRsZTogXCJyZXBseV9hY3Rpb25cIixcblx0XHRcdFx0Y2xpY2s6ICgpID0+IHZpZXdNb2RlbC5yZXBseShmYWxzZSksXG5cdFx0XHRcdGljb246IEljb25zLlJlcGx5LFxuXHRcdFx0fSksXG5cdFx0KVxuXG5cdFx0aWYgKHZpZXdNb2RlbC5jYW5SZXBseUFsbCgpKSB7XG5cdFx0XHRhY3Rpb25zLnB1c2goXG5cdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRpdGxlOiBcInJlcGx5QWxsX2FjdGlvblwiLFxuXHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB2aWV3TW9kZWwucmVwbHkodHJ1ZSksXG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuUmVwbHlBbGwsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH1cblx0XHRyZXR1cm4gYWN0aW9uc1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJGb3J3YXJkQnV0dG9uKHZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCkge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcImZvcndhcmRfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLmZvcndhcmQoKS5jYXRjaChvZkNsYXNzKFVzZXJFcnJvciwgc2hvd1VzZXJFcnJvcikpLFxuXHRcdFx0aWNvbjogSWNvbnMuRm9yd2FyZCxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJNb3JlQnV0dG9uKHZpZXdNb2RlbDogTWFpbFZpZXdlclZpZXdNb2RlbCB8IHVuZGVmaW5lZCk6IENoaWxkcmVuIHtcblx0XHRsZXQgYWN0aW9uczogRHJvcGRvd25CdXR0b25BdHRyc1tdID0gW11cblxuXHRcdGlmICh2aWV3TW9kZWwpIHtcblx0XHRcdGFjdGlvbnMgPSBtYWlsVmlld2VyTW9yZUFjdGlvbnModmlld01vZGVsLCBmYWxzZSlcblx0XHR9XG5cblx0XHRyZXR1cm4gYWN0aW9ucy5sZW5ndGggPiAwXG5cdFx0XHQ/IG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRpdGxlOiBcIm1vcmVfbGFiZWxcIixcblx0XHRcdFx0XHRpY29uOiBJY29ucy5Nb3JlLFxuXHRcdFx0XHRcdGNsaWNrOiBjcmVhdGVEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogKCkgPT4gYWN0aW9ucyxcblx0XHRcdFx0XHRcdHdpZHRoOiAzMDAsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHQgIH0pXG5cdFx0XHQ6IG51bGxcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRWRpdEJ1dHRvbih2aWV3TW9kZWw6IE1haWxWaWV3ZXJWaWV3TW9kZWwpIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJlZGl0X2FjdGlvblwiLFxuXHRcdFx0Y2xpY2s6ICgpID0+IGVkaXREcmFmdCh2aWV3TW9kZWwpLFxuXHRcdFx0aWNvbjogSWNvbnMuRWRpdCxcblx0XHR9KVxuXHR9XG59XG4iLCJpbXBvcnQgeyBNYWlsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBJY29ucyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvaWNvbnMvSWNvbnMuanNcIlxuaW1wb3J0IHsgcHJvbXB0QW5kRGVsZXRlTWFpbHMsIHNob3dNb3ZlTWFpbHNEcm9wZG93biB9IGZyb20gXCIuL01haWxHdWlVdGlscy5qc1wiXG5pbXBvcnQgeyBEUk9QRE9XTl9NQVJHSU4gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3Bkb3duLmpzXCJcbmltcG9ydCB7IE1vYmlsZUJvdHRvbUFjdGlvbkJhciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL01vYmlsZUJvdHRvbUFjdGlvbkJhci5qc1wiXG5pbXBvcnQgeyBNYWlsYm94TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L01haWxib3hNb2RlbC5qc1wiXG5pbXBvcnQgeyBNYWlsTW9kZWwgfSBmcm9tIFwiLi4vbW9kZWwvTWFpbE1vZGVsLmpzXCJcbmltcG9ydCB7IExhYmVsc1BvcHVwIH0gZnJvbSBcIi4vTGFiZWxzUG9wdXAuanNcIlxuaW1wb3J0IHsgYWxsSW5TYW1lTWFpbGJveCB9IGZyb20gXCIuLi9tb2RlbC9NYWlsVXRpbHNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIE1vYmlsZU1haWxNdWx0aXNlbGVjdGlvbkFjdGlvbkJhckF0dHJzIHtcblx0bWFpbHM6IHJlYWRvbmx5IE1haWxbXVxuXHRtYWlsTW9kZWw6IE1haWxNb2RlbFxuXHRtYWlsYm94TW9kZWw6IE1haWxib3hNb2RlbFxuXHRzZWxlY3ROb25lOiAoKSA9PiB1bmtub3duXG59XG5cbi8vIE5vdGU6IFRoZSBNYWlsVmlld2VyVG9vbGJhciBpcyB0aGUgY291bnRlcnBhcnQgZm9yIHRoaXMgb24gbm9uLW1vYmlsZSB2aWV3cy4gUGxlYXNlIHVwZGF0ZSB0aGVyZSB0b28gaWYgbmVlZGVkXG5leHBvcnQgY2xhc3MgTW9iaWxlTWFpbE11bHRpc2VsZWN0aW9uQWN0aW9uQmFyIHtcblx0cHJpdmF0ZSBkb206IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblxuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8TW9iaWxlTWFpbE11bHRpc2VsZWN0aW9uQWN0aW9uQmFyQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgbWFpbHMsIHNlbGVjdE5vbmUsIG1haWxNb2RlbCwgbWFpbGJveE1vZGVsIH0gPSBhdHRyc1xuXHRcdHJldHVybiBtKFxuXHRcdFx0TW9iaWxlQm90dG9tQWN0aW9uQmFyLFxuXHRcdFx0e1xuXHRcdFx0XHRvbmNyZWF0ZTogKHsgZG9tIH0pID0+ICh0aGlzLmRvbSA9IGRvbSBhcyBIVE1MRWxlbWVudCksXG5cdFx0XHR9LFxuXHRcdFx0W1xuXHRcdFx0XHRtKEljb25CdXR0b24sIHtcblx0XHRcdFx0XHRpY29uOiBJY29ucy5UcmFzaCxcblx0XHRcdFx0XHR0aXRsZTogXCJkZWxldGVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHByb21wdEFuZERlbGV0ZU1haWxzKG1haWxNb2RlbCwgbWFpbHMsIHNlbGVjdE5vbmUpLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bWFpbE1vZGVsLmlzTW92aW5nTWFpbHNBbGxvd2VkKClcblx0XHRcdFx0XHQ/IG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5Gb2xkZXIsXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBcIm1vdmVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoZSwgZG9tKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVmZXJlbmNlRG9tID0gdGhpcy5kb20gPz8gZG9tXG5cdFx0XHRcdFx0XHRcdFx0c2hvd01vdmVNYWlsc0Ryb3Bkb3duKG1haWxib3hNb2RlbCwgbWFpbE1vZGVsLCByZWZlcmVuY2VEb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIG1haWxzLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvblNlbGVjdGVkOiAoKSA9PiBzZWxlY3ROb25lLFxuXHRcdFx0XHRcdFx0XHRcdFx0d2lkdGg6IHJlZmVyZW5jZURvbS5vZmZzZXRXaWR0aCAtIERST1BET1dOX01BUkdJTiAqIDIsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRtYWlsTW9kZWwuY2FuQXNzaWduTGFiZWxzKCkgJiYgYWxsSW5TYW1lTWFpbGJveChtYWlscylcblx0XHRcdFx0XHQ/IG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5MYWJlbCxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IFwiYXNzaWduTGFiZWxfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoZSwgZG9tKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcmVmZXJlbmNlRG9tID0gdGhpcy5kb20gPz8gZG9tXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG1haWxzLmxlbmd0aCAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcG9wdXAgPSBuZXcgTGFiZWxzUG9wdXAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlZmVyZW5jZURvbSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVmZXJlbmNlRG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZWZlcmVuY2VEb20ub2Zmc2V0V2lkdGggLSBEUk9QRE9XTl9NQVJHSU4gKiAyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtYWlsTW9kZWwuZ2V0TGFiZWxzRm9yTWFpbHMobWFpbHMpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtYWlsTW9kZWwuZ2V0TGFiZWxTdGF0ZXNGb3JNYWlscyhtYWlscyksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdChhZGRlZExhYmVscywgcmVtb3ZlZExhYmVscykgPT4gbWFpbE1vZGVsLmFwcGx5TGFiZWxzKG1haWxzLCBhZGRlZExhYmVscywgcmVtb3ZlZExhYmVscyksXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0XHRwb3B1cC5zaG93KClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0bShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuRXllLFxuXHRcdFx0XHRcdHRpdGxlOiBcIm1hcmtSZWFkX2FjdGlvblwiLFxuXHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRtYWlsTW9kZWwubWFya01haWxzKG1haWxzLCBmYWxzZSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuTm9FeWUsXG5cdFx0XHRcdFx0dGl0bGU6IFwibWFya1VucmVhZF9hY3Rpb25cIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0bWFpbE1vZGVsLm1hcmtNYWlscyhtYWlscywgdHJ1ZSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ2xhc3NDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IGNyZWF0ZURyb3Bkb3duIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Ecm9wZG93bi5qc1wiXG5pbXBvcnQgeyBUb2dnbGVCdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2J1dHRvbnMvVG9nZ2xlQnV0dG9uLmpzXCJcblxuaW1wb3J0IHsgTWFpbEZpbHRlclR5cGUgfSBmcm9tIFwiLi9NYWlsVmlld2VyVXRpbHMuanNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIE1haWxGaWx0ZXJCdXR0b25BdHRycyB7XG5cdGZpbHRlcjogTWFpbEZpbHRlclR5cGUgfCBudWxsXG5cdHNldEZpbHRlcjogKGZpbHRlcjogTWFpbEZpbHRlclR5cGUgfCBudWxsKSA9PiB1bmtub3duXG59XG5cbmV4cG9ydCBjbGFzcyBNYWlsRmlsdGVyQnV0dG9uIGltcGxlbWVudHMgQ2xhc3NDb21wb25lbnQ8TWFpbEZpbHRlckJ1dHRvbkF0dHJzPiB7XG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxNYWlsRmlsdGVyQnV0dG9uQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFRvZ2dsZUJ1dHRvbiwge1xuXHRcdFx0aWNvbjogSWNvbnMuRmlsdGVyLFxuXHRcdFx0dGl0bGU6IFwiZmlsdGVyX2xhYmVsXCIsXG5cdFx0XHR0b2dnbGVkOiBhdHRycy5maWx0ZXIgIT0gbnVsbCxcblx0XHRcdG9uVG9nZ2xlZDogKF8sIGV2ZW50KSA9PiB0aGlzLnNob3dEcm9wZG93bihhdHRycywgZXZlbnQpLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHNob3dEcm9wZG93bih7IGZpbHRlciwgc2V0RmlsdGVyIH06IE1haWxGaWx0ZXJCdXR0b25BdHRycywgZXZlbnQ6IE1vdXNlRXZlbnQpIHtcblx0XHRjcmVhdGVEcm9wZG93bih7XG5cdFx0XHRsYXp5QnV0dG9uczogKCkgPT4gW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0ZWQ6IGZpbHRlciA9PT0gTWFpbEZpbHRlclR5cGUuVW5yZWFkLFxuXHRcdFx0XHRcdGxhYmVsOiBcImZpbHRlclVucmVhZF9sYWJlbFwiLFxuXHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRzZXRGaWx0ZXIoTWFpbEZpbHRlclR5cGUuVW5yZWFkKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3RlZDogZmlsdGVyID09PSBNYWlsRmlsdGVyVHlwZS5SZWFkLFxuXHRcdFx0XHRcdGxhYmVsOiBcImZpbHRlclJlYWRfbGFiZWxcIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0c2V0RmlsdGVyKE1haWxGaWx0ZXJUeXBlLlJlYWQpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbGVjdGVkOiBmaWx0ZXIgPT09IE1haWxGaWx0ZXJUeXBlLldpdGhBdHRhY2htZW50cyxcblx0XHRcdFx0XHRsYWJlbDogXCJmaWx0ZXJXaXRoQXR0YWNobWVudHNfbGFiZWxcIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0c2V0RmlsdGVyKE1haWxGaWx0ZXJUeXBlLldpdGhBdHRhY2htZW50cylcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGFiZWw6IFwiZmlsdGVyQWxsTWFpbHNfbGFiZWxcIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0c2V0RmlsdGVyKG51bGwpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0fSkoZXZlbnQsIGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudClcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVQSxrQkFBa0I7SUFXTCxrQkFBTixNQUF1RTtDQUM3RSxLQUFLLEVBQUUsT0FBdUMsRUFBRTtFQUMvQyxNQUFNLEVBQUUsa0JBQWtCLEdBQUc7QUFD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
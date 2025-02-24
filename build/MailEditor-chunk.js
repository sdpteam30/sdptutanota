import { __toESM } from "./chunk-chunk.js";
import { assertMainOrNode, isApp, isBrowser, isDesktop } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { LazyLoaded, SortedArray, assertNotNull, cleanMatch, debounce, downcast, getFirstOrThrow, isNotNull, memoized, neverNull, noOp, ofClass, pMap, resolveMaybeLazy, startsWith, typedValues } from "./dist2-chunk.js";
import { InfoLink, lang, languageByCode } from "./LanguageViewModel-chunk.js";
import { DefaultAnimationTime, animations, height, opacity, styles } from "./styles-chunk.js";
import { getNavButtonIconBackground, theme } from "./theme-chunk.js";
import { ALLOWED_IMAGE_FORMATS, ConversationType, ExternalImageRule, FeatureType, Keys, MailAuthenticationStatus, MailMethod, OperationType, ShareCapability } from "./TutanotaConstants-chunk.js";
import { isKeyPressed, keyboardEventToKeyPress } from "./KeyManager-chunk.js";
import { windowFacade } from "./WindowFacade-chunk.js";
import { LayerType, displayOverlay, modal } from "./RootView-chunk.js";
import { inputLineHeight, px, size } from "./size-chunk.js";
import { getElementId, getEtId, getLetId, isSameId } from "./EntityUtils-chunk.js";
import { ContactTypeRef, EmailTemplateTypeRef, KnowledgeBaseEntryTypeRef, MailTypeRef, TemplateGroupRootTypeRef, createTranslationGetIn } from "./TypeRefs-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { FileOpenError, isOfflineError } from "./ErrorUtils-chunk.js";
import { NotFoundError, TooManyRequestsError } from "./RestError-chunk.js";
import { CancelledError } from "./CancelledError-chunk.js";
import { isUpdateForTypeRef } from "./EntityUpdateUtils-chunk.js";
import { TranslationService } from "./Services2-chunk.js";
import { Button, ButtonColor, ButtonType } from "./Button-chunk.js";
import { Icons } from "./Icons-chunk.js";
import { Autocomplete, Dialog, DomRectReadOnlyPolyfilled, DropDownSelector, Dropdown, TextField, attachDropdown, canSeeTutaLinks, createDropdown, getConfirmation, makeListSelectionChangedScrollHandler } from "./Dialog-chunk.js";
import { BootIcons, Icon } from "./Icon-chunk.js";
import { ButtonSize, IconButton } from "./IconButton-chunk.js";
import { getSharedGroupName, hasCapabilityOnGroup } from "./GroupUtils2-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { UserError } from "./UserError-chunk.js";
import { parseMailtoUrl } from "./MailAddressParser-chunk.js";
import { createDataFile } from "./BlobUtils-chunk.js";
import { fileListToArray, isTutanotaFile } from "./FileUtils-chunk.js";
import { showProgressDialog } from "./ProgressDialog-chunk.js";
import { RecipientField, checkAttachmentSize, createNewContact, dialogTitleTranslationKey, getEnabledMailAddressesWithUser, getMailAddressDisplayText, readLocalFiles } from "./SharedMailUtils-chunk.js";
import { RecipientType } from "./Recipient-chunk.js";
import { getContactDisplayName } from "./ContactUtils-chunk.js";
import { showPlanUpgradeRequiredDialog } from "./SubscriptionDialogs-chunk.js";
import { ToggleButton } from "./ToggleButton-chunk.js";
import { MailRecipientsTextField } from "./MailRecipientsTextField-chunk.js";
import { InfoBanner } from "./InfoBanner-chunk.js";
import { ExpanderPanel } from "./Expander-chunk.js";
import { PasswordField } from "./PasswordField-chunk.js";
import { showUserError } from "./ErrorHandlerImpl-chunk.js";
import { handleRatingByEvent } from "./InAppRatingDialog-chunk.js";
import { isCustomizationEnabledForCustomer } from "./CustomerUtils-chunk.js";
import { SaveErrorReason, SaveStatusEnum, mailLocator } from "./mailLocator-chunk.js";
import { CounterBadge } from "./CounterBadge-chunk.js";
import { Editor, RichTextToolbar, animateToolbar } from "./HtmlEditor-chunk.js";
import { htmlSanitizer } from "./HtmlSanitizer-chunk.js";
import { appendEmailSignature } from "./Signature-chunk.js";
import { checkApprovalStatus } from "./LoginUtils-chunk.js";
import { AttachmentBubble } from "./AttachmentBubble-chunk.js";
import { chooseAndAttachFile, cleanupInlineAttachments, createAttachmentBubbleAttrs, getConfidentialStateMessage } from "./MailEditorViewModel-chunk.js";
import { createInlineImage, isMailContrastFixNeeded, promptAndDeleteMails, replaceCidsWithInlineImages, replaceInlineImagesWithCids } from "./MailGuiUtils-chunk.js";
import { SELECT_NEXT_TEMPLATE, SELECT_PREV_TEMPLATE, TEMPLATE_SHORTCUT_PREFIX, TemplatePopupModel, loadTemplateGroupInstance, search } from "./TemplatePopupModel-chunk.js";
import { ContentBlockingStatus } from "./MailViewerViewModel-chunk.js";

//#region src/mail-app/templates/view/TemplateConstants.ts
const TEMPLATE_POPUP_HEIGHT = 340;
const TEMPLATE_POPUP_TWO_COLUMN_MIN_WIDTH = 600;
const TEMPLATE_LIST_ENTRY_HEIGHT = 47;
const TEMPLATE_LIST_ENTRY_WIDTH = 354;

//#endregion
//#region src/mail-app/templates/view/TemplatePopupResultRow.ts
var TemplatePopupResultRow = class {
	view(vnode) {
		const { title, tag } = vnode.attrs.template;
		return mithril_default(".flex.flex-column.overflow-hidden.full-width.ml-s", {
			style: { height: px(TEMPLATE_LIST_ENTRY_HEIGHT) },
			title
		}, [mithril_default(".text-ellipsis.smaller", { style: { marginLeft: "4px" } }, title), mithril_default(".flex.badge-line-height.text-ellipsis", [tag ? mithril_default(".small.keyword-bubble-no-padding.pl-s.pr-s.border-radius.no-wrap.small.min-content", TEMPLATE_SHORTCUT_PREFIX + tag.toLowerCase()) : null])]);
	}
};

//#endregion
//#region src/mail-app/templates/view/TemplateExpander.ts
var TemplateExpander = class {
	sanitizedText = memoized((text) => htmlSanitizer.sanitizeHTML(text, {
		blockExternalContent: false,
		allowRelativeLinks: true
	}).html);
	view({ attrs }) {
		const { model, template } = attrs;
		const selectedContent = model.getSelectedContent();
		return mithril_default(".flex.flex-column.flex-grow.scroll.ml-s", {
			style: { maxHeight: px(TEMPLATE_POPUP_HEIGHT - size.button_height) },
			onkeydown: (e) => {
				if (isKeyPressed(e.key, Keys.TAB)) e.preventDefault();
			}
		}, [mithril_default(".text-break.smaller.b.text-center", { style: { "border-bottom": `1px solid ${theme.content_border}` } }, template.title), mithril_default(".text-break.flex-grow.pr.overflow-y-visible.pt", selectedContent ? mithril_default.trust(this.sanitizedText(selectedContent.text)) : null)]);
	}
};

//#endregion
//#region src/mail-app/templates/view/TemplateSearchBar.ts
var TemplateSearchBar = class {
	domInput = null;
	view(vnode) {
		const a = vnode.attrs;
		return mithril_default(".inputWrapper.pt-xs.pb-xs", { style: { "border-bottom": `1px solid ${theme.content_border}` } }, this._getInputField(a));
	}
	_getInputField(a) {
		return mithril_default("input.input", {
			placeholder: a.placeholder && lang.getTranslationText(a.placeholder),
			oncreate: (vnode) => {
				this.domInput = vnode.dom;
				this.domInput.value = a.value();
				this.domInput.focus();
			},
			onkeydown: (e) => {
				const key = keyboardEventToKeyPress(e);
				return a.keyHandler != null ? a.keyHandler(key) : true;
			},
			oninput: () => {
				const domInput = assertNotNull(this.domInput);
				a.value(domInput.value);
				a.oninput?.(domInput.value, domInput);
			},
			style: { lineHeight: px(inputLineHeight) }
		});
	}
};

//#endregion
//#region src/mail-app/templates/TemplateGroupUtils.ts
async function createInitialTemplateListIfAllowed() {
	const userController = locator.logins.getUserController();
	const customer = await userController.loadCustomer();
	const { getAvailablePlansWithTemplates } = await import("./SubscriptionUtils2-chunk.js");
	let allowed = (await userController.getPlanConfig()).templates || isCustomizationEnabledForCustomer(customer, FeatureType.BusinessFeatureEnabled);
	if (!allowed) if (userController.isGlobalAdmin()) allowed = await showPlanUpgradeRequiredDialog(await getAvailablePlansWithTemplates());
else Dialog.message("contactAdmin_msg");
	if (allowed) {
		const groupId = await locator.groupManagementFacade.createTemplateGroup("");
		return locator.entityClient.load(TemplateGroupRootTypeRef, groupId);
	} else return null;
}

//#endregion
//#region src/common/gui/ScrollSelectList.ts
var ScrollSelectList = class {
	selectedItem = null;
	view(vnode) {
		const a = vnode.attrs;
		return mithril_default(".flex.flex-column.scroll-no-overlay", a.items.length > 0 ? a.items.map((item) => this.renderRow(item, vnode)) : mithril_default(".row-selected.text-center.pt", lang.get(resolveMaybeLazy(a.emptyListMessage))));
	}
	onupdate(vnode) {
		const newSelectedItem = vnode.attrs.selectedItem;
		if (newSelectedItem !== this.selectedItem) {
			this._onSelectionChanged(newSelectedItem, vnode.attrs.items, vnode.dom);
			mithril_default.redraw();
		}
	}
	renderRow(item, vnode) {
		const a = vnode.attrs;
		const isSelected = a.selectedItem === item;
		return mithril_default(".flex.flex-column.click", { style: { maxWidth: a.width } }, [mithril_default(".flex.template-list-row" + (isSelected ? ".row-selected" : ""), {
			onclick: (e) => {
				a.onItemSelected(item);
				e.stopPropagation();
			},
			ondblclick: (e) => {
				a.onItemSelected(item);
				a.onItemDoubleClicked(item);
				e.stopPropagation();
			}
		}, [a.renderItem(item), isSelected ? mithril_default(Icon, {
			icon: Icons.ArrowForward,
			style: {
				marginTop: "auto",
				marginBottom: "auto"
			}
		}) : mithril_default("", { style: {
			width: "17.1px",
			height: "16px"
		} })])]);
	}
	_onSelectionChanged(selectedItem, items, scrollDom) {
		this.selectedItem = selectedItem;
		if (selectedItem != null) {
			const selectedIndex = items.indexOf(selectedItem);
			if (selectedIndex !== -1) {
				const selectedDomElement = scrollDom.children.item(selectedIndex);
				if (selectedDomElement) selectedDomElement.scrollIntoView({
					block: "nearest",
					inline: "nearest"
				});
			}
		}
	}
};

//#endregion
//#region src/mail-app/templates/view/TemplatePopup.ts
var import_stream$4 = __toESM(require_stream(), 1);
function showTemplatePopupInEditor(templateModel, editor, template, highlightedText) {
	const initialSearchString = template ? TEMPLATE_SHORTCUT_PREFIX + template.tag : highlightedText;
	const cursorRect = editor.getCursorPosition();
	const editorRect = editor.getDOM().getBoundingClientRect();
	const onSelect = (text) => {
		editor.insertHTML(text);
		editor.focus();
	};
	let rect;
	const availableHeightBelowCursor = window.innerHeight - cursorRect.bottom;
	const popUpHeight = TEMPLATE_POPUP_HEIGHT + 10;
	const popUpWidth = editorRect.right - editorRect.left;
	if (availableHeightBelowCursor < popUpHeight) {
		const diff = popUpHeight - availableHeightBelowCursor;
		rect = new DomRectReadOnlyPolyfilled(editorRect.left, cursorRect.bottom - diff, popUpWidth, cursorRect.height);
	} else rect = new DomRectReadOnlyPolyfilled(editorRect.left, cursorRect.bottom, popUpWidth, cursorRect.height);
	const popup = new TemplatePopup(templateModel, rect, onSelect, initialSearchString, () => editor.focus());
	templateModel.search(initialSearchString);
	popup.show();
}
var TemplatePopup = class {
	_rect;
	_shortcuts;
	_onSelect;
	_initialWindowWidth;
	_resizeListener;
	_redrawStream;
	_templateModel;
	_searchBarValue;
	_selectTemplateButtonAttrs;
	_inputDom = null;
	_debounceFilter;
	focusedBeforeShown = null;
	constructor(templateModel, rect, onSelect, initialSearchString, restoreEditorFocus) {
		this.restoreEditorFocus = restoreEditorFocus;
		this._rect = rect;
		this._onSelect = onSelect;
		this._initialWindowWidth = window.innerWidth;
		this._resizeListener = () => {
			this._close();
		};
		this._searchBarValue = (0, import_stream$4.default)(initialSearchString);
		this._templateModel = templateModel;
		this._shortcuts = [
			{
				key: Keys.ESC,
				enabled: () => true,
				exec: () => {
					this.restoreEditorFocus?.();
					this._close();
					mithril_default.redraw();
				},
				help: "closeTemplate_action"
			},
			{
				key: Keys.RETURN,
				enabled: () => true,
				exec: () => {
					const selectedContent = this._templateModel.getSelectedContent();
					if (selectedContent) {
						this._onSelect(selectedContent.text);
						this._close();
					}
				},
				help: "insertTemplate_action"
			},
			{
				key: Keys.UP,
				enabled: () => true,
				exec: () => {
					this._templateModel.selectNextTemplate(SELECT_PREV_TEMPLATE);
				},
				help: "selectPreviousTemplate_action"
			},
			{
				key: Keys.DOWN,
				enabled: () => true,
				exec: () => {
					this._templateModel.selectNextTemplate(SELECT_NEXT_TEMPLATE);
				},
				help: "selectNextTemplate_action"
			}
		];
		this._redrawStream = templateModel.searchResults.map((results) => {
			mithril_default.redraw();
		});
		this._selectTemplateButtonAttrs = {
			label: "selectTemplate_action",
			click: () => {
				const selected = this._templateModel.getSelectedContent();
				if (selected) {
					this._onSelect(selected.text);
					this._close();
				}
			},
			type: ButtonType.Primary
		};
		this._debounceFilter = debounce(200, (value) => {
			templateModel.search(value);
		});
		this._debounceFilter(initialSearchString);
	}
	view = () => {
		const showTwoColumns = this._isScreenWideEnough();
		return mithril_default(".flex.flex-column.abs.elevated-bg.border-radius.dropdown-shadow", {
			style: {
				width: px(this._rect.width),
				height: px(TEMPLATE_POPUP_HEIGHT),
				top: px(this._rect.top),
				left: px(this._rect.left)
			},
			onclick: (e) => {
				this._inputDom?.focus();
				e.stopPropagation();
			},
			oncreate: () => {
				windowFacade.addResizeListener(this._resizeListener);
			},
			onremove: () => {
				windowFacade.removeResizeListener(this._resizeListener);
			}
		}, [this._renderHeader(), mithril_default(".flex.flex-grow.scroll.mb-s", [mithril_default(".flex.flex-column.scroll" + (showTwoColumns ? ".pr" : ""), { style: { flex: "1 1 40%" } }, this._renderList()), showTwoColumns ? mithril_default(".flex.flex-column.flex-grow-shrink-half", { style: { flex: "1 1 60%" } }, this._renderRightColumn()) : null])]);
	};
	_renderHeader() {
		const selectedTemplate = this._templateModel.getSelectedTemplate();
		return mithril_default(".flex-space-between.center-vertically.pl.pr-s", [mithril_default(".flex-start", [mithril_default(".flex.center-vertically", this._renderSearchBar()), this._renderAddButton()]), mithril_default(".flex-end", [selectedTemplate ? this._renderEditButtons(selectedTemplate) : null])]);
	}
	_renderSearchBar = () => {
		return mithril_default(TemplateSearchBar, {
			value: this._searchBarValue,
			placeholder: "filter_label",
			keyHandler: (keyPress) => {
				if (isKeyPressed(keyPress.key, Keys.DOWN, Keys.UP)) {
					this._templateModel.selectNextTemplate(isKeyPressed(keyPress.key, Keys.UP) ? SELECT_PREV_TEMPLATE : SELECT_NEXT_TEMPLATE);
					return false;
				} else return true;
			},
			oninput: (value) => {
				this._debounceFilter(value);
			},
			oncreate: (vnode) => {
				this._inputDom = vnode.dom.firstElementChild;
			}
		});
	};
	_renderAddButton() {
		const attrs = this._createAddButtonAttributes();
		return mithril_default("", { onkeydown: (e) => {
			if (isKeyPressed(e.key, Keys.TAB) && !this._templateModel.getSelectedTemplate()) {
				this._inputDom?.focus();
				e.preventDefault();
			}
		} }, attrs ? mithril_default(IconButton, attrs) : null);
	}
	_createAddButtonAttributes() {
		const templateGroupInstances = this._templateModel.getTemplateGroupInstances();
		const writeableGroups = templateGroupInstances.filter((instance) => hasCapabilityOnGroup(locator.logins.getUserController().user, instance.group, ShareCapability.Write));
		if (templateGroupInstances.length === 0) return {
			title: "createTemplate_action",
			click: () => {
				createInitialTemplateListIfAllowed().then((groupRoot) => {
					if (groupRoot) this.showTemplateEditor(null, groupRoot);
				});
			},
			icon: Icons.Add,
			colors: ButtonColor.DrawerNav
		};
else if (writeableGroups.length === 1) return {
			title: "createTemplate_action",
			click: () => this.showTemplateEditor(null, writeableGroups[0].groupRoot),
			icon: Icons.Add,
			colors: ButtonColor.DrawerNav
		};
else if (writeableGroups.length > 1) return attachDropdown({
			mainButtonAttrs: {
				title: "createTemplate_action",
				icon: Icons.Add,
				colors: ButtonColor.DrawerNav
			},
			childAttrs: () => writeableGroups.map((groupInstances) => {
				return {
					label: lang.makeTranslation("group_name", getSharedGroupName(groupInstances.groupInfo, locator.logins.getUserController(), true)),
					click: () => this.showTemplateEditor(null, groupInstances.groupRoot)
				};
			})
		});
else return null;
	}
	_renderEditButtons(selectedTemplate) {
		const selectedContent = this._templateModel.getSelectedContent();
		const selectedGroup = this._templateModel.getSelectedTemplateGroupInstance();
		const canEdit = !!selectedGroup && hasCapabilityOnGroup(locator.logins.getUserController().user, selectedGroup.group, ShareCapability.Write);
		return [
			mithril_default(".flex.flex-column.justify-center.mr-m", selectedContent ? mithril_default("", lang.get(languageByCode[selectedContent.languageCode].textId)) : ""),
			mithril_default(IconButton, attachDropdown({
				mainButtonAttrs: {
					title: "chooseLanguage_action",
					icon: Icons.Language
				},
				childAttrs: () => selectedTemplate.contents.map((content) => {
					const langCode = downcast(content.languageCode);
					return {
						label: languageByCode[langCode].textId,
						click: (e) => {
							e.stopPropagation();
							this._templateModel.setSelectedContentLanguage(langCode);
							this._inputDom?.focus();
						}
					};
				})
			})),
			canEdit ? [mithril_default(IconButton, {
				title: "editTemplate_action",
				click: () => locator.entityClient.load(TemplateGroupRootTypeRef, neverNull(selectedTemplate._ownerGroup)).then((groupRoot) => this.showTemplateEditor(selectedTemplate, groupRoot)),
				icon: Icons.Edit,
				colors: ButtonColor.DrawerNav
			}), mithril_default(IconButton, {
				title: "remove_action",
				click: () => {
					getConfirmation("deleteTemplate_msg").confirmed(() => locator.entityClient.erase(selectedTemplate));
				},
				icon: Icons.Trash,
				colors: ButtonColor.DrawerNav
			})] : null,
			mithril_default(".pr-s", mithril_default(".nav-bar-spacer")),
			mithril_default("", { onkeydown: (e) => {
				if (isKeyPressed(e.key, Keys.TAB)) {
					this._inputDom?.focus();
					e.preventDefault();
				}
			} }, mithril_default(Button, this._selectTemplateButtonAttrs))
		];
	}
	_renderList() {
		return mithril_default(ScrollSelectList, {
			items: this._templateModel.searchResults(),
			selectedItem: this._templateModel.selectedTemplate(),
			onItemSelected: this._templateModel.selectedTemplate,
			emptyListMessage: () => this._templateModel.isLoaded() ? "nothingFound_label" : "loadingTemplates_label",
			width: TEMPLATE_LIST_ENTRY_WIDTH,
			renderItem: (template) => mithril_default(TemplatePopupResultRow, { template }),
			onItemDoubleClicked: (_) => {
				const selected = this._templateModel.getSelectedContent();
				if (selected) {
					this._onSelect(selected.text);
					this._close();
				}
			}
		});
	}
	_renderRightColumn() {
		const template = this._templateModel.getSelectedTemplate();
		if (template) return [mithril_default(TemplateExpander, {
			template,
			model: this._templateModel
		})];
else return null;
	}
	_isScreenWideEnough() {
		return window.innerWidth > TEMPLATE_POPUP_TWO_COLUMN_MIN_WIDTH;
	}
	_getWindowWidthChange() {
		return window.innerWidth - this._initialWindowWidth;
	}
	show() {
		this.focusedBeforeShown = document.activeElement;
		modal.display(this, false);
	}
	_close() {
		modal.remove(this);
	}
	backgroundClick(e) {
		this.restoreEditorFocus?.();
		this._close();
	}
	hideAnimation() {
		return Promise.resolve();
	}
	onClose() {
		this._redrawStream.end(true);
	}
	shortcuts() {
		return this._shortcuts;
	}
	popState(e) {
		return true;
	}
	callingElement() {
		return this.focusedBeforeShown;
	}
	showTemplateEditor(templateToEdit, groupRoot) {
		import("./TemplateEditor2-chunk.js").then((editor) => {
			editor.showTemplateEditor(templateToEdit, groupRoot);
		});
	}
};

//#endregion
//#region src/mail-app/templates/view/TemplateShortcutListener.ts
function registerTemplateShortcutListener(editor, templateModel) {
	const listener = new TemplateShortcutListener(editor, templateModel, lang);
	editor.addEventListener("keydown", (event) => listener.handleKeyDown(event));
	editor.addEventListener("cursor", (event) => listener.handleCursorChange(event));
	return listener;
}
var TemplateShortcutListener = class {
	_currentCursorPosition;
	_editor;
	_templateModel;
	_lang;
	constructor(editor, templateModel, lang$1) {
		this._editor = editor;
		this._currentCursorPosition = null;
		this._templateModel = templateModel;
		this._lang = lang$1;
	}
	handleKeyDown(event) {
		if (isKeyPressed(event.key, Keys.TAB) && this._currentCursorPosition) {
			const cursorEndPos = this._currentCursorPosition;
			const text = cursorEndPos.startContainer.nodeType === Node.TEXT_NODE ? cursorEndPos.startContainer.textContent ?? "" : "";
			const templateShortcutStartIndex = text.lastIndexOf(TEMPLATE_SHORTCUT_PREFIX);
			const lastWhiteSpaceIndex = text.search(/\s\S*$/);
			if (templateShortcutStartIndex !== -1 && templateShortcutStartIndex < cursorEndPos.startOffset && templateShortcutStartIndex > lastWhiteSpaceIndex) {
				event.stopPropagation();
				event.preventDefault();
				const range = document.createRange();
				range.setStart(cursorEndPos.startContainer, templateShortcutStartIndex);
				range.setEnd(cursorEndPos.startContainer, cursorEndPos.startOffset);
				this._editor.setSelection(range);
				const selectedText = this._editor.getSelectedText();
				const template = this._templateModel.findTemplateWithTag(selectedText);
				if (template) if (template.contents.length > 1) {
					let buttons = template.contents.map((content) => {
						return {
							label: languageByCode[downcast(content.languageCode)].textId,
							click: () => {
								this._editor.insertHTML(content.text);
								this._editor.focus();
							}
						};
					});
					const dropdown = new Dropdown(() => buttons, 200);
					dropdown.setOrigin(this._editor.getCursorPosition());
					modal.displayUnique(dropdown, false);
				} else this._editor.insertHTML(getFirstOrThrow(template.contents).text);
else showTemplatePopupInEditor(this._templateModel, this._editor, null, selectedText);
			}
		}
	}
	handleCursorChange(event) {
		this._currentCursorPosition = event.detail.range;
	}
};

//#endregion
//#region src/mail-app/knowledgebase/view/KnowledgeBaseListEntry.ts
const KNOWLEDGEBASE_LIST_ENTRY_HEIGHT = 50;
var KnowledgeBaseListEntry = class {
	view(vnode) {
		const { title, keywords } = vnode.attrs.entry;
		return mithril_default(".flex.flex-column.overflow-hidden.full-width", { style: { height: px(KNOWLEDGEBASE_LIST_ENTRY_HEIGHT) } }, [mithril_default(".text-ellipsis.mb-xs.b", title), mithril_default(".flex.badge-line-height.text-ellipsis", [keywords.map((keyword) => {
			return mithril_default(".b.small.teamLabel.pl-s.pr-s.border-radius.no-wrap.small.mr-s.min-content", keyword.keyword);
		})])]);
	}
};

//#endregion
//#region src/mail-app/knowledgebase/view/KnowledgeBaseEntryView.ts
var KnowledgeBaseEntryView = class {
	_sanitizedEntry;
	constructor() {
		this._sanitizedEntry = memoized((entry) => {
			return { content: htmlSanitizer.sanitizeHTML(entry.description, { blockExternalContent: true }).html };
		});
	}
	view({ attrs }) {
		return mithril_default(".flex.flex-column", [this._renderContent(attrs)]);
	}
	_renderContent(attrs) {
		const { entry, readonly } = attrs;
		return mithril_default("", { onclick: (event) => {
			this._handleAnchorClick(event, attrs);
		} }, [mithril_default(".flex.mt-l.center-vertically.selectable", mithril_default(".h4.text-ellipsis", entry.title), !readonly ? [mithril_default(".flex.flex-grow.justify-end", [this.renderEditButton(entry), this.renderRemoveButton(entry)])] : null), mithril_default("", [mithril_default(".mt-s.flex.mt-s.wrap", [entry.keywords.map((entryKeyword) => {
			return mithril_default(".keyword-bubble.selectable", entryKeyword.keyword);
		})]), mithril_default(".flex.flex-column.mt-s", [mithril_default(".editor-border.text-break.selectable", mithril_default.trust(this._sanitizedEntry(entry).content))])])]);
	}
	renderRemoveButton(entry) {
		return mithril_default(IconButton, {
			title: "remove_action",
			icon: Icons.Trash,
			click: () => {
				getConfirmation("deleteEntryConfirm_msg").confirmed(() => locator.entityClient.erase(entry).catch(ofClass(NotFoundError, noOp)));
			}
		});
	}
	renderEditButton(entry) {
		return mithril_default(IconButton, {
			title: "edit_action",
			icon: Icons.Edit,
			click: () => {
				import("./KnowledgeBaseEditor2-chunk.js").then(({ showKnowledgeBaseEditor: showKnowledgeBaseEditor$1 }) => {
					locator.entityClient.load(TemplateGroupRootTypeRef, neverNull(entry._ownerGroup)).then((groupRoot) => {
						showKnowledgeBaseEditor$1(entry, groupRoot);
					});
				});
			}
		});
	}
	_handleAnchorClick(event, attrs) {
		let target = event.target;
		if (target && target.closest) {
			let anchorElement = target.closest("a");
			if (anchorElement && startsWith(anchorElement.href, "tutatemplate:")) {
				event.preventDefault();
				const [listId, elementId] = new URL(anchorElement.href).pathname.split("/");
				attrs.onTemplateSelected([listId, elementId]);
			}
		}
	}
};

//#endregion
//#region src/mail-app/knowledgebase/view/KnowledgeBaseDialogContent.ts
var import_stream$3 = __toESM(require_stream(), 1);
var KnowledgeBaseDialogContent = class {
	_streams;
	filterValue = "";
	_selectionChangedListener;
	constructor() {
		this._streams = [];
	}
	oncreate({ attrs }) {
		const { model } = attrs;
		this._streams.push(import_stream$3.default.combine(() => {
			mithril_default.redraw();
		}, [model.selectedEntry, model.filteredEntries]));
	}
	onremove() {
		for (let stream$5 of this._streams) stream$5.end(true);
	}
	view({ attrs }) {
		const model = attrs.model;
		const selectedEntry = model.selectedEntry();
		return selectedEntry ? mithril_default(KnowledgeBaseEntryView, {
			entry: selectedEntry,
			onTemplateSelected: (templateId) => {
				model.loadTemplate(templateId).then((fetchedTemplate) => {
					attrs.onTemplateSelect(fetchedTemplate);
				}).catch(ofClass(NotFoundError, () => Dialog.message("templateNotExists_msg")));
			},
			readonly: model.isReadOnly(selectedEntry)
		}) : [
			mithril_default(TextField, {
				label: "filter_label",
				value: this.filterValue,
				oninput: (value) => {
					this.filterValue = value;
					model.filter(value);
					mithril_default.redraw();
				}
			}),
			this._renderKeywords(model),
			this._renderList(model, attrs)
		];
	}
	_renderKeywords(model) {
		const matchedKeywords = model.getMatchedKeywordsInContent();
		return mithril_default(".flex.mt-s.wrap", [matchedKeywords.length > 0 ? mithril_default(".small.full-width", lang.get("matchingKeywords_label")) : null, matchedKeywords.map((keyword) => {
			return mithril_default(".keyword-bubble-no-padding.plr-button.pl-s.pr-s.border-radius.no-wrap.mr-s.min-content", keyword);
		})]);
	}
	_renderList(model, attrs) {
		return mithril_default(".mt-s.scroll", {
			oncreate: (vnode) => {
				this._selectionChangedListener = model.selectedEntry.map(makeListSelectionChangedScrollHandler(vnode.dom, KNOWLEDGEBASE_LIST_ENTRY_HEIGHT, model.getSelectedEntryIndex.bind(model)));
			},
			onbeforeremove: () => {
				this._selectionChangedListener.end();
			}
		}, [model.containsResult() ? model.filteredEntries().map((entry) => this._renderListEntry(model, entry)) : mithril_default(".center", lang.get("noEntryFound_label"))]);
	}
	_renderListEntry(model, entry) {
		return mithril_default(".flex.flex-column.click.hoverable-list-item", [mithril_default(".flex", { onclick: () => {
			model.selectedEntry(entry);
		} }, [mithril_default(KnowledgeBaseListEntry, { entry }), mithril_default("", { style: {
			width: "17.1px",
			height: "16px"
		} })])]);
	}
};

//#endregion
//#region src/mail-app/knowledgebase/view/KnowledgeBaseDialog.ts
var import_stream$2 = __toESM(require_stream(), 1);
function createKnowledgeBaseDialogInjection(knowledgeBase, templateModel, editor) {
	const knowledgebaseAttrs = {
		onTemplateSelect: (template) => {
			showTemplatePopupInEditor(templateModel, editor, template, "");
		},
		model: knowledgeBase
	};
	const isDialogVisible = (0, import_stream$2.default)(false);
	return {
		visible: isDialogVisible,
		headerAttrs: _createHeaderAttrs(knowledgebaseAttrs, isDialogVisible),
		componentAttrs: knowledgebaseAttrs,
		component: KnowledgeBaseDialogContent
	};
}
function _createHeaderAttrs(attrs, isDialogVisible) {
	return () => {
		const selectedEntry = attrs.model.selectedEntry();
		return selectedEntry ? createEntryViewHeader(selectedEntry, attrs.model) : createListViewHeader(attrs.model, isDialogVisible);
	};
}
function createEntryViewHeader(entry, model) {
	return {
		left: [{
			label: "back_action",
			click: () => model.selectedEntry(null),
			type: ButtonType.Secondary
		}],
		middle: "knowledgebase_label"
	};
}
function createListViewHeader(model, isDialogVisible) {
	return {
		left: () => [{
			label: "close_alt",
			click: () => isDialogVisible(false),
			type: ButtonType.Primary
		}],
		middle: "knowledgebase_label",
		right: [createAddButtonAttrs(model)]
	};
}
function createAddButtonAttrs(model) {
	const templateGroupInstances = model.getTemplateGroupInstances();
	if (templateGroupInstances.length === 1) return {
		label: "add_action",
		click: () => {
			showKnowledgeBaseEditor(null, templateGroupInstances[0].groupRoot);
		},
		type: ButtonType.Primary
	};
else return {
		label: "add_action",
		type: ButtonType.Primary,
		click: createDropdown({ lazyButtons: () => templateGroupInstances.map((groupInstances) => {
			return {
				label: lang.makeTranslation("group_name", getSharedGroupName(groupInstances.groupInfo, model.userController, true)),
				click: () => {
					showKnowledgeBaseEditor(null, groupInstances.groupRoot);
				}
			};
		}) })
	};
}
function showKnowledgeBaseEditor(entryToEdit, groupRoot) {
	import("./KnowledgeBaseEditor2-chunk.js").then((editor) => {
		editor.showKnowledgeBaseEditor(entryToEdit, groupRoot);
	});
}

//#endregion
//#region src/mail-app/knowledgebase/model/KnowledgeBaseSearchFilter.ts
function knowledgeBaseSearch(input, allEntries) {
	return search(input, allEntries, [
		"title",
		"description",
		"keywords.keyword"
	], false);
}

//#endregion
//#region src/mail-app/knowledgebase/model/KnowledgeBaseModel.ts
var import_stream$1 = __toESM(require_stream(), 1);
const SELECT_NEXT_ENTRY = "next";
function compareKnowledgeBaseEntriesForSort(entry1, entry2) {
	return entry1.title.localeCompare(entry2.title);
}
var KnowledgeBaseModel = class {
	_allEntries;
	filteredEntries;
	selectedEntry;
	_allKeywords;
	_matchedKeywordsInContent;
	_filterValue;
	_eventController;
	_entityClient;
	_entityEventReceived;
	_groupInstances;
	_initialized;
	userController;
	constructor(eventController, entityClient, userController) {
		this._eventController = eventController;
		this._entityClient = entityClient;
		this.userController = userController;
		this._allEntries = SortedArray.empty(compareKnowledgeBaseEntriesForSort);
		this._allKeywords = [];
		this._matchedKeywordsInContent = [];
		this.filteredEntries = (0, import_stream$1.default)(this._allEntries.array);
		this.selectedEntry = (0, import_stream$1.default)(null);
		this._filterValue = "";
		this._entityEventReceived = (updates) => {
			return this._entityUpdate(updates);
		};
		this._eventController.addEntityListener(this._entityEventReceived);
		this._groupInstances = [];
		this._allKeywords = [];
		this.filteredEntries(this._allEntries.array);
		this.selectedEntry(this.containsResult() ? this.filteredEntries()[0] : null);
		this._initialized = new LazyLoaded(() => {
			const templateMemberships = this.userController.getTemplateMemberships();
			let newGroupInstances = [];
			return pMap(templateMemberships, (membership) => loadTemplateGroupInstance(membership, entityClient)).then((groupInstances) => {
				newGroupInstances = groupInstances;
				return loadKnowledgebaseEntries(groupInstances, entityClient);
			}).then((knowledgebaseEntries) => {
				this._allEntries.insertAll(knowledgebaseEntries);
				this._groupInstances = newGroupInstances;
				this.initAllKeywords();
				return this;
			});
		});
	}
	init() {
		return this._initialized.getAsync();
	}
	isInitialized() {
		return this._initialized.isLoaded();
	}
	getTemplateGroupInstances() {
		return this._groupInstances;
	}
	initAllKeywords() {
		this._allKeywords = [];
		this._matchedKeywordsInContent = [];
		for (const entry of this._allEntries.array) for (const keyword of entry.keywords) this._allKeywords.push(keyword.keyword);
	}
	isSelectedEntry(entry) {
		return this.selectedEntry() === entry;
	}
	containsResult() {
		return this.filteredEntries().length > 0;
	}
	getAllKeywords() {
		return this._allKeywords.sort();
	}
	getMatchedKeywordsInContent() {
		return this._matchedKeywordsInContent;
	}
	getLanguageFromTemplate(template) {
		const clientLanguage = lang.code;
		const hasClientLanguage = template.contents.some((content) => content.languageCode === clientLanguage);
		if (hasClientLanguage) return clientLanguage;
		return downcast(template.contents[0].languageCode);
	}
	sortEntriesByMatchingKeywords(emailContent) {
		this._matchedKeywordsInContent = [];
		const emailContentNoTags = emailContent.replace(/(<([^>]+)>)/gi, "");
		for (const keyword of this._allKeywords) if (emailContentNoTags.includes(keyword)) this._matchedKeywordsInContent.push(keyword);
		this._allEntries = SortedArray.from(this._allEntries.array, (a, b) => this._compareEntriesByMatchedKeywords(a, b));
		this._filterValue = "";
		this.filteredEntries(this._allEntries.array);
	}
	_compareEntriesByMatchedKeywords(entry1, entry2) {
		const difference = this._getMatchedKeywordsNumber(entry2) - this._getMatchedKeywordsNumber(entry1);
		return difference === 0 ? compareKnowledgeBaseEntriesForSort(entry1, entry2) : difference;
	}
	_getMatchedKeywordsNumber(entry) {
		let matches = 0;
		for (const k of entry.keywords) if (this._matchedKeywordsInContent.includes(k.keyword)) matches++;
		return matches;
	}
	filter(input) {
		this._filterValue = input;
		const inputTrimmed = input.trim();
		if (inputTrimmed) this.filteredEntries(knowledgeBaseSearch(inputTrimmed, this._allEntries.array));
else this.filteredEntries(this._allEntries.array);
	}
	selectNextEntry(action) {
		const selectedIndex = this.getSelectedEntryIndex();
		const nextIndex = selectedIndex + (action === SELECT_NEXT_ENTRY ? 1 : -1);
		if (nextIndex >= 0 && nextIndex < this.filteredEntries().length) {
			const nextSelectedEntry = this.filteredEntries()[nextIndex];
			this.selectedEntry(nextSelectedEntry);
			return true;
		}
		return false;
	}
	getSelectedEntryIndex() {
		const selectedEntry = this.selectedEntry();
		if (selectedEntry == null) return -1;
		return this.filteredEntries().indexOf(selectedEntry);
	}
	_removeFromAllKeywords(keyword) {
		const index = this._allKeywords.indexOf(keyword);
		if (index > -1) this._allKeywords.splice(index, 1);
	}
	dispose() {
		this._eventController.removeEntityListener(this._entityEventReceived);
	}
	loadTemplate(templateId) {
		return this._entityClient.load(EmailTemplateTypeRef, templateId);
	}
	isReadOnly(entry) {
		const instance = this._groupInstances.find((instance$1) => isSameId(entry._ownerGroup, getEtId(instance$1.group)));
		return !instance || !hasCapabilityOnGroup(this.userController.user, instance.group, ShareCapability.Write);
	}
	_entityUpdate(updates) {
		return pMap(updates, (update) => {
			if (isUpdateForTypeRef(KnowledgeBaseEntryTypeRef, update)) {
				if (update.operation === OperationType.CREATE) return this._entityClient.load(KnowledgeBaseEntryTypeRef, [update.instanceListId, update.instanceId]).then((entry) => {
					this._allEntries.insert(entry);
					this.filter(this._filterValue);
				});
else if (update.operation === OperationType.UPDATE) return this._entityClient.load(KnowledgeBaseEntryTypeRef, [update.instanceListId, update.instanceId]).then((updatedEntry) => {
					this._allEntries.removeFirst((e) => isSameId(getElementId(e), update.instanceId));
					this._allEntries.insert(updatedEntry);
					this.filter(this._filterValue);
					const oldSelectedEntry = this.selectedEntry();
					if (oldSelectedEntry && isSameId(oldSelectedEntry._id, updatedEntry._id)) this.selectedEntry(updatedEntry);
				});
else if (update.operation === OperationType.DELETE) {
					const selected = this.selectedEntry();
					if (selected && isSameId(getLetId(selected), [update.instanceListId, update.instanceId])) this.selectedEntry(null);
					this._allEntries.removeFirst((e) => isSameId(getElementId(e), update.instanceId));
					this.filter(this._filterValue);
				}
			}
		}).then(noOp);
	}
};
function loadKnowledgebaseEntries(templateGroups, entityClient) {
	return pMap(templateGroups, (group) => entityClient.loadAll(KnowledgeBaseEntryTypeRef, group.groupRoot.knowledgeBase)).then((groupedTemplates) => groupedTemplates.flat());
}

//#endregion
//#region src/mail-app/mail/view/MinimizedEditorOverlay.ts
const COUNTER_POS_OFFSET = px(-8);
var MinimizedEditorOverlay = class {
	_listener;
	_eventController;
	constructor(vnode) {
		const { minimizedEditor, viewModel, eventController } = vnode.attrs;
		this._eventController = eventController;
		this._listener = (updates, eventOwnerGroupId) => {
			return pMap(updates, (update) => {
				if (isUpdateForTypeRef(MailTypeRef, update) && update.operation === OperationType.DELETE) {
					let draft = minimizedEditor.sendMailModel.getDraft();
					if (draft && isSameId(draft._id, [update.instanceListId, update.instanceId])) viewModel.removeMinimizedEditor(minimizedEditor);
				}
			});
		};
		eventController.addEntityListener(this._listener);
	}
	onremove() {
		this._eventController.removeEntityListener(this._listener);
	}
	view(vnode) {
		const { minimizedEditor, viewModel, eventController } = vnode.attrs;
		const subject = minimizedEditor.sendMailModel.getSubject();
		return mithril_default(".elevated-bg.pl.border-radius", [mithril_default(CounterBadge, {
			count: viewModel.getMinimizedEditors().indexOf(minimizedEditor) + 1,
			position: {
				top: COUNTER_POS_OFFSET,
				right: COUNTER_POS_OFFSET
			},
			color: theme.navigation_button_icon,
			background: getNavButtonIconBackground()
		}), mithril_default(".flex.justify-between.pb-xs.pt-xs", [mithril_default(".flex.col.justify-center.min-width-0.flex-grow", { onclick: () => viewModel.reopenMinimizedEditor(minimizedEditor) }, [mithril_default(".b.text-ellipsis", subject ? subject : lang.get("newMail_action")), mithril_default(".small.text-ellipsis", getStatusMessage(minimizedEditor.saveStatus()))]), mithril_default(".flex.items-center.justify-right", [
			!styles.isSingleColumnLayout() ? mithril_default(IconButton, {
				title: "edit_action",
				click: () => viewModel.reopenMinimizedEditor(minimizedEditor),
				icon: Icons.Edit
			}) : null,
			mithril_default(IconButton, {
				title: "delete_action",
				click: () => this._onDeleteClicked(minimizedEditor, viewModel),
				icon: Icons.Trash
			}),
			mithril_default(IconButton, {
				title: "close_alt",
				click: () => viewModel.removeMinimizedEditor(minimizedEditor),
				icon: Icons.Cancel
			})
		])])]);
	}
	_onDeleteClicked(minimizedEditor, viewModel) {
		const model = minimizedEditor.sendMailModel;
		viewModel.removeMinimizedEditor(minimizedEditor);
		minimizedEditor.saveStatus.map(async ({ status }) => {
			if (status !== SaveStatusEnum.Saving) {
				const draft = model.draft;
				if (draft) await promptAndDeleteMails(mailLocator.mailModel, [draft], noOp);
			}
		});
	}
};
function getStatusMessage(saveStatus) {
	switch (saveStatus.status) {
		case SaveStatusEnum.Saving: return lang.get("save_msg");
		case SaveStatusEnum.NotSaved: switch (saveStatus.reason) {
			case SaveErrorReason.ConnectionLost: return lang.get("draftNotSavedConnectionLost_msg");
			default: return lang.get("draftNotSaved_msg");
		}
		case SaveStatusEnum.Saved: return lang.get("draftSaved_msg");
		default: return "";
	}
}

//#endregion
//#region src/mail-app/mail/view/MinimizedMailEditorOverlay.ts
assertMainOrNode();
const MINIMIZED_OVERLAY_WIDTH_WIDE = 350;
const MINIMIZED_OVERLAY_WIDTH_SMALL = 220;
function showMinimizedMailEditor(dialog, sendMailModel, viewModel, eventController, dispose, saveStatus) {
	let closeOverlayFunction = noOp;
	const minimizedEditor = viewModel.minimizeMailEditor(dialog, sendMailModel, dispose, saveStatus, () => closeOverlayFunction());
	setTimeout(() => {
		closeOverlayFunction = showMinimizedEditorOverlay(viewModel, minimizedEditor, eventController);
	}, DefaultAnimationTime);
}
function showMinimizedEditorOverlay(viewModel, minimizedEditor, eventController) {
	return displayOverlay(() => getOverlayPosition(), { view: () => mithril_default(MinimizedEditorOverlay, {
		viewModel,
		minimizedEditor,
		eventController
	}) }, "slide-bottom", undefined, "minimized-shadow");
}
function getOverlayPosition() {
	return {
		bottom: styles.isUsingBottomNavigation() ? px(size.hpad) : px(size.vpad),
		right: styles.isUsingBottomNavigation() ? px(size.hpad) : px(size.hpad_medium),
		width: px(styles.isSingleColumnLayout() ? MINIMIZED_OVERLAY_WIDTH_SMALL : MINIMIZED_OVERLAY_WIDTH_WIDE),
		zIndex: LayerType.LowPriorityOverlay
	};
}

//#endregion
//#region src/mail-app/mail/editor/MailEditor.ts
var import_stream = __toESM(require_stream(), 1);
function createMailEditorAttrs(model, doBlockExternalContent, doFocusEditorOnLoad, dialog, templateModel, knowledgeBaseInjection, search$1, alwaysBlockExternalContent) {
	return {
		model,
		doBlockExternalContent: (0, import_stream.default)(doBlockExternalContent),
		doShowToolbar: (0, import_stream.default)(false),
		selectedNotificationLanguage: (0, import_stream.default)(""),
		dialog,
		templateModel,
		knowledgeBaseInjection,
		search: search$1,
		alwaysBlockExternalContent
	};
}
var MailEditor = class {
	attrs;
	editor;
	recipientFieldTexts = {
		to: (0, import_stream.default)(""),
		cc: (0, import_stream.default)(""),
		bcc: (0, import_stream.default)("")
	};
	mentionedInlineImages;
	inlineImageElements;
	templateModel;
	knowledgeBaseInjection = null;
	sendMailModel;
	areDetailsExpanded;
	recipientShowConfidential = new Map();
	blockExternalContent;
	alwaysBlockExternalContent = false;
	blockedExternalContent = 0;
	constructor(vnode) {
		const a = vnode.attrs;
		this.attrs = a;
		this.inlineImageElements = [];
		this.mentionedInlineImages = [];
		const model = a.model;
		this.sendMailModel = model;
		this.templateModel = a.templateModel;
		this.blockExternalContent = a.doBlockExternalContent();
		this.alwaysBlockExternalContent = a.alwaysBlockExternalContent;
		this.areDetailsExpanded = model.bccRecipients().length + model.ccRecipients().length > 0;
		this.editor = new Editor(200, (html, isPaste) => {
			const sanitized = htmlSanitizer.sanitizeFragment(html, { blockExternalContent: !isPaste && this.blockExternalContent });
			this.blockedExternalContent = sanitized.blockedExternalContent;
			this.mentionedInlineImages = sanitized.inlineImageCids;
			return sanitized.fragment;
		}, null);
		const onEditorChanged = () => {
			cleanupInlineAttachments(this.editor.getDOM(), this.inlineImageElements, model.getAttachments());
			model.markAsChangedIfNecessary(true);
			mithril_default.redraw();
		};
		this.editor.initialized.promise.then(() => {
			this.editor.setHTML(model.getBody());
			const editorDom = this.editor.getDOM();
			const contrastFixNeeded = isMailContrastFixNeeded(editorDom);
			if (contrastFixNeeded) editorDom.classList.add("bg-fix-quoted");
			this.processInlineImages();
			new MutationObserver(onEditorChanged).observe(this.editor.getDOM(), {
				attributes: false,
				childList: true,
				subtree: true
			});
			this.editor.addChangeListener(() => model.setBody(replaceInlineImagesWithCids(this.editor.getDOM()).innerHTML));
			this.editor.addEventListener("pasteImage", ({ detail }) => {
				const items = Array.from(detail.clipboardData.items);
				const imageItems = items.filter((item) => /image/.test(item.type));
				if (!imageItems.length) return false;
				const file = imageItems[0]?.getAsFile();
				if (file == null) return false;
				const reader = new FileReader();
				reader.onload = () => {
					if (reader.result == null || "string" === typeof reader.result) return;
					const newInlineImages = [createDataFile(file.name, file.type, new Uint8Array(reader.result))];
					model.attachFiles(newInlineImages);
					this.insertInlineImages(model, newInlineImages);
				};
				reader.readAsArrayBuffer(file);
			});
			if (a.templateModel) a.templateModel.init().then((templateModel) => {
				registerTemplateShortcutListener(this.editor, templateModel);
			});
		});
		model.onMailChanged.map(() => mithril_default.redraw());
		model.setOnBeforeSendFunction(() => {
			let invalidText = "";
			for (const leftoverText of typedValues(this.recipientFieldTexts)) if (leftoverText().trim() !== "") invalidText += "\n" + leftoverText().trim();
			if (invalidText !== "") throw new UserError(lang.makeTranslation("invalidRecipients_msg", lang.get("invalidRecipients_msg") + invalidText));
		});
		const dialog = a.dialog();
		if (model.getConversationType() === ConversationType.REPLY || model.toRecipients().length) dialog.setFocusOnLoadFunction(() => {
			this.editor.initialized.promise.then(() => this.editor.focus());
		});
		const shortcuts = [
			{
				key: Keys.SPACE,
				ctrlOrCmd: true,
				exec: () => this.openTemplates(),
				help: "openTemplatePopup_msg"
			},
			{
				key: Keys.B,
				ctrlOrCmd: true,
				exec: noOp,
				help: "formatTextBold_msg"
			},
			{
				key: Keys.I,
				ctrlOrCmd: true,
				exec: noOp,
				help: "formatTextItalic_msg"
			},
			{
				key: Keys.U,
				ctrlOrCmd: true,
				exec: noOp,
				help: "formatTextUnderline_msg"
			}
		];
		for (const shortcut of shortcuts) dialog.addShortcut(shortcut);
		this.editor.initialized.promise.then(() => {
			a.knowledgeBaseInjection(this.editor).then((injection) => {
				this.knowledgeBaseInjection = injection;
				mithril_default.redraw();
			});
		});
	}
	downloadInlineImage(model, cid) {
		const tutanotaFiles = model.getAttachments().filter((attachment) => isTutanotaFile(attachment));
		const inlineAttachment = tutanotaFiles.find((attachment) => attachment.cid === cid);
		if (inlineAttachment && isTutanotaFile(inlineAttachment)) locator.fileController.open(inlineAttachment).catch(ofClass(FileOpenError, () => Dialog.message("canNotOpenFileOnDevice_msg")));
	}
	view(vnode) {
		const a = vnode.attrs;
		this.attrs = a;
		const { model } = a;
		this.sendMailModel = model;
		const showConfidentialButton = model.containsExternalRecipients();
		const isConfidential = model.isConfidential() && showConfidentialButton;
		const confidentialButtonAttrs = {
			title: "confidential_action",
			onToggled: (_, e) => {
				e.stopPropagation();
				model.setConfidential(!model.isConfidential());
			},
			icon: model.isConfidential() ? Icons.Lock : Icons.Unlock,
			toggled: model.isConfidential(),
			size: ButtonSize.Compact
		};
		const attachFilesButtonAttrs = {
			title: "attachFiles_action",
			click: (ev, dom) => chooseAndAttachFile(model, dom.getBoundingClientRect()).then(() => mithril_default.redraw()),
			icon: Icons.Attachment,
			size: ButtonSize.Compact
		};
		const plaintextFormatting = locator.logins.getUserController().props.sendPlaintextOnly;
		this.editor.setCreatesLists(!plaintextFormatting);
		const toolbarButton = () => !plaintextFormatting ? mithril_default(ToggleButton, {
			title: "showRichTextToolbar_action",
			icon: Icons.FontSize,
			size: ButtonSize.Compact,
			toggled: a.doShowToolbar(),
			onToggled: (_, e) => {
				a.doShowToolbar(!a.doShowToolbar());
				e.stopPropagation();
				this.editor.focus();
			}
		}) : null;
		const subjectFieldAttrs = {
			label: "subject_label",
			helpLabel: () => getConfidentialStateMessage(model.isConfidential()),
			value: model.getSubject(),
			oninput: (val) => model.setSubject(val),
			injectionsRight: () => mithril_default(".flex.end.ml-between-s.items-center", [
				showConfidentialButton ? mithril_default(ToggleButton, confidentialButtonAttrs) : null,
				this.knowledgeBaseInjection ? this.renderToggleKnowledgeBase(this.knowledgeBaseInjection) : null,
				mithril_default(IconButton, attachFilesButtonAttrs),
				toolbarButton()
			])
		};
		const attachmentBubbleAttrs = createAttachmentBubbleAttrs(model, this.inlineImageElements);
		let editCustomNotificationMailAttrs = null;
		if (locator.logins.getUserController().isGlobalAdmin()) editCustomNotificationMailAttrs = attachDropdown({
			mainButtonAttrs: {
				title: "more_label",
				icon: Icons.More,
				size: ButtonSize.Compact
			},
			childAttrs: () => [{
				label: "add_action",
				click: () => {
					import("./EditNotificationEmailDialog2-chunk.js").then(({ showAddOrEditNotificationEmailDialog }) => showAddOrEditNotificationEmailDialog(locator.logins.getUserController()));
				}
			}, {
				label: "edit_action",
				click: () => {
					import("./EditNotificationEmailDialog2-chunk.js").then(({ showAddOrEditNotificationEmailDialog }) => showAddOrEditNotificationEmailDialog(locator.logins.getUserController(), model.getSelectedNotificationLanguageCode()));
				}
			}]
		});
		return mithril_default("#mail-editor.full-height.text.touch-callout.flex.flex-column", {
			onclick: (e) => {
				if (e.target === this.editor.getDOM()) this.editor.focus();
			},
			ondragover: (ev) => {
				ev.stopPropagation();
				ev.preventDefault();
			},
			ondrop: (ev) => {
				if (ev.dataTransfer?.files && ev.dataTransfer.files.length > 0) {
					let nativeFiles = fileListToArray(ev.dataTransfer.files);
					readLocalFiles(nativeFiles).then((dataFiles) => {
						model.attachFiles(dataFiles);
						mithril_default.redraw();
					}).catch((e) => {
						console.log(e);
						return Dialog.message("couldNotAttachFile_msg");
					});
					ev.stopPropagation();
					ev.preventDefault();
				}
			}
		}, [
			mithril_default(".rel", this.renderRecipientField(RecipientField.TO, this.recipientFieldTexts.to, a.search)),
			mithril_default(".rel", mithril_default(ExpanderPanel, { expanded: this.areDetailsExpanded }, mithril_default(".details", [this.renderRecipientField(RecipientField.CC, this.recipientFieldTexts.cc, a.search), this.renderRecipientField(RecipientField.BCC, this.recipientFieldTexts.bcc, a.search)]))),
			mithril_default(".wrapping-row", [mithril_default("", { style: { "min-width": "250px" } }, mithril_default(DropDownSelector, {
				label: "sender_label",
				items: getEnabledMailAddressesWithUser(model.mailboxDetails, model.user().userGroupInfo).sort().map((mailAddress) => ({
					name: mailAddress,
					value: mailAddress
				})),
				selectedValue: a.model.getSender(),
				selectedValueDisplay: getMailAddressDisplayText(a.model.getSenderName(), a.model.getSender(), false),
				selectionChangedHandler: (selection) => model.setSender(selection),
				dropdownWidth: 250
			})), isConfidential ? mithril_default(".flex", {
				style: { "min-width": "250px" },
				oncreate: (vnode$1) => {
					const htmlDom = vnode$1.dom;
					htmlDom.style.opacity = "0";
					return animations.add(htmlDom, opacity(0, 1, true));
				},
				onbeforeremove: (vnode$1) => {
					const htmlDom = vnode$1.dom;
					htmlDom.style.opacity = "1";
					return animations.add(htmlDom, opacity(1, 0, true));
				}
			}, [mithril_default(".flex-grow", mithril_default(DropDownSelector, {
				label: "notificationMailLanguage_label",
				items: model.getAvailableNotificationTemplateLanguages().map((language) => {
					return {
						name: lang.get(language.textId),
						value: language.code
					};
				}),
				selectedValue: model.getSelectedNotificationLanguageCode(),
				selectionChangedHandler: (v) => model.setSelectedNotificationLanguageCode(v),
				dropdownWidth: 250
			})), editCustomNotificationMailAttrs ? mithril_default(".pt.flex-no-grow.flex-end.border-bottom.flex.items-center", mithril_default(IconButton, editCustomNotificationMailAttrs)) : null]) : null]),
			isConfidential ? this.renderPasswordFields() : null,
			mithril_default(".row", mithril_default(TextField, subjectFieldAttrs)),
			mithril_default(".flex-start.flex-wrap.mt-s.mb-s.gap-hpad", attachmentBubbleAttrs.map((a$1) => mithril_default(AttachmentBubble, a$1))),
			model.getAttachments().length > 0 ? mithril_default("hr.hr") : null,
			this.renderExternalContentBanner(this.attrs),
			a.doShowToolbar() ? this.renderToolbar(model) : null,
			mithril_default(".pt-s.text.scroll-x.break-word-links.flex.flex-column.flex-grow", { onclick: () => this.editor.focus() }, mithril_default(this.editor)),
			mithril_default(".pb")
		]);
	}
	renderExternalContentBanner(attrs) {
		if (!this.blockExternalContent || this.alwaysBlockExternalContent || this.blockedExternalContent === 0) return null;
		const showButton = {
			label: "showBlockedContent_action",
			click: () => {
				this.updateExternalContentStatus(ContentBlockingStatus.Show);
				this.processInlineImages();
			}
		};
		return mithril_default(InfoBanner, {
			message: "contentBlocked_msg",
			icon: Icons.Picture,
			helpLink: canSeeTutaLinks(attrs.model.logins) ? InfoLink.LoadImages : null,
			buttons: [showButton]
		});
	}
	updateExternalContentStatus(status) {
		this.blockExternalContent = status === ContentBlockingStatus.Block || status === ContentBlockingStatus.AlwaysBlock;
		const sanitized = htmlSanitizer.sanitizeHTML(this.editor.getHTML(), { blockExternalContent: this.blockExternalContent });
		this.editor.setHTML(sanitized.html);
	}
	processInlineImages() {
		this.inlineImageElements = replaceCidsWithInlineImages(this.editor.getDOM(), this.sendMailModel.loadedInlineImages, (cid, event, dom) => {
			const downloadClickHandler = createDropdown({ lazyButtons: () => [{
				label: "download_action",
				click: () => this.downloadInlineImage(this.sendMailModel, cid)
			}] });
			downloadClickHandler(downcast(event), dom);
		});
	}
	renderToggleKnowledgeBase(knowledgeBaseInjection) {
		return mithril_default(ToggleButton, {
			title: "openKnowledgebase_action",
			toggled: knowledgeBaseInjection.visible(),
			onToggled: () => {
				if (knowledgeBaseInjection.visible()) knowledgeBaseInjection.visible(false);
else {
					knowledgeBaseInjection.componentAttrs.model.sortEntriesByMatchingKeywords(this.editor.getValue());
					knowledgeBaseInjection.visible(true);
					knowledgeBaseInjection.componentAttrs.model.init();
				}
			},
			icon: Icons.Book,
			size: ButtonSize.Compact
		});
	}
	renderToolbar(model) {
		return mithril_default.fragment({ onbeforeremove: ({ dom }) => animateToolbar(dom.children[0], false) }, [mithril_default(RichTextToolbar, {
			editor: this.editor,
			imageButtonClickHandler: isApp() ? null : (event) => this.imageButtonClickHandler(model, event.target.getBoundingClientRect()),
			customButtonAttrs: this.templateModel ? [{
				title: "openTemplatePopup_msg",
				click: () => {
					this.openTemplates();
				},
				icon: Icons.ListAlt,
				size: ButtonSize.Compact
			}] : []
		}), mithril_default("hr.hr")]);
	}
	async imageButtonClickHandler(model, rect) {
		const files = await chooseAndAttachFile(model, rect, ALLOWED_IMAGE_FORMATS);
		if (!files || files.length === 0) return;
		return await this.insertInlineImages(model, files);
	}
	async insertInlineImages(model, files) {
		for (const file of files) {
			const img = createInlineImage(file);
			model.loadedInlineImages.set(img.cid, img);
			this.inlineImageElements.push(this.editor.insertImage(img.objectUrl, {
				cid: img.cid,
				style: "max-width: 100%"
			}));
		}
		mithril_default.redraw();
	}
	renderPasswordFields() {
		return mithril_default(".external-recipients.overflow-hidden", {
			oncreate: (vnode) => this.animateHeight(vnode.dom, true),
			onbeforeremove: (vnode) => this.animateHeight(vnode.dom, false)
		}, this.sendMailModel.allRecipients().filter((r) => r.type === RecipientType.EXTERNAL).map((recipient) => {
			if (!this.recipientShowConfidential.has(recipient.address)) this.recipientShowConfidential.set(recipient.address, false);
			return mithril_default(PasswordField, {
				oncreate: (vnode) => this.animateHeight(vnode.dom, true),
				onbeforeremove: (vnode) => this.animateHeight(vnode.dom, false),
				label: lang.getTranslation("passwordFor_label", { "{1}": recipient.address }),
				value: this.sendMailModel.getPassword(recipient.address),
				passwordStrength: this.sendMailModel.getPasswordStrength(recipient),
				status: "auto",
				autocompleteAs: Autocomplete.off,
				oninput: (val) => this.sendMailModel.setPassword(recipient.address, val)
			});
		}));
	}
	renderRecipientField(field, fieldText, search$1) {
		const label = {
			to: "to_label",
			cc: "cc_label",
			bcc: "bcc_label"
		}[field];
		return mithril_default(MailRecipientsTextField, {
			label,
			text: fieldText(),
			onTextChanged: (text) => fieldText(text),
			recipients: this.sendMailModel.getRecipientList(field),
			onRecipientAdded: async (address, name) => {
				try {
					await this.sendMailModel.addRecipient(field, {
						address,
						name
					});
				} catch (e) {
					if (isOfflineError(e)) {} else if (e instanceof TooManyRequestsError) await Dialog.message("tooManyAttempts_msg");
else throw e;
				}
			},
			onRecipientRemoved: (address) => this.sendMailModel.removeRecipientByAddress(address, field),
			getRecipientClickedDropdownAttrs: (address) => {
				const recipient = this.sendMailModel.getRecipient(field, address);
				return this.getRecipientClickedContextButtons(recipient, field);
			},
			disabled: !this.sendMailModel.logins.isInternalUserLoggedIn(),
			injectionsRight: field === RecipientField.TO && this.sendMailModel.logins.isInternalUserLoggedIn() ? mithril_default("", mithril_default(ToggleButton, {
				title: "show_action",
				icon: BootIcons.Expand,
				size: ButtonSize.Compact,
				toggled: this.areDetailsExpanded,
				onToggled: (_, e) => {
					e.stopPropagation();
					this.areDetailsExpanded = !this.areDetailsExpanded;
				}
			})) : null,
			search: search$1
		});
	}
	async getRecipientClickedContextButtons(recipient, field) {
		const { entity, contactModel } = this.sendMailModel;
		const canEditBubbleRecipient = locator.logins.getUserController().isInternalUser() && !locator.logins.isEnabled(FeatureType.DisableContacts);
		const canRemoveBubble = locator.logins.getUserController().isInternalUser();
		const createdContactReceiver = (contactElementId) => {
			const mailAddress = recipient.address;
			contactModel.getContactListId().then((contactListId) => {
				if (!contactListId) return;
				const id = [contactListId, contactElementId];
				entity.load(ContactTypeRef, id).then((contact) => {
					if (contact.mailAddresses.some((ma) => cleanMatch(ma.address, mailAddress))) {
						recipient.setName(getContactDisplayName(contact));
						recipient.setContact(contact);
					} else this.sendMailModel.removeRecipient(recipient, field, false);
				});
			});
		};
		const contextButtons = [];
		if (canEditBubbleRecipient) if (recipient.contact && recipient.contact._id) contextButtons.push({
			label: "editContact_label",
			click: () => {
				import("./ContactEditor2-chunk.js").then(({ ContactEditor }) => new ContactEditor(entity, recipient.contact).show());
			}
		});
else contextButtons.push({
			label: "createContact_action",
			click: () => {
				contactModel.getContactListId().then((contactListId) => {
					const newContact = createNewContact(locator.logins.getUserController().user, recipient.address, recipient.name);
					import("./ContactEditor2-chunk.js").then(({ ContactEditor }) => {
						new ContactEditor(entity, newContact, assertNotNull(contactListId), createdContactReceiver).show();
					});
				});
			}
		});
		if (canRemoveBubble) contextButtons.push({
			label: "remove_action",
			click: () => this.sendMailModel.removeRecipient(recipient, field, false)
		});
		return contextButtons;
	}
	openTemplates() {
		if (this.templateModel) this.templateModel.init().then((templateModel) => {
			showTemplatePopupInEditor(templateModel, this.editor, null, this.editor.getSelectedText());
		});
	}
	animateHeight(domElement, fadein) {
		let childHeight = domElement.offsetHeight;
		return animations.add(domElement, fadein ? height(0, childHeight) : height(childHeight, 0)).then(() => {
			domElement.style.height = "";
		});
	}
};
/**
* Creates a new Dialog with a MailEditor inside.
* @param model
* @param blockExternalContent
* @param alwaysBlockExternalContent
* @returns {Dialog}
* @private
*/
async function createMailEditorDialog(model, blockExternalContent = false, alwaysBlockExternalContent = false) {
	let dialog;
	let mailEditorAttrs;
	const save = (showProgress = true) => {
		const savePromise = model.saveDraft(true, MailMethod.NONE);
		if (showProgress) return showProgressDialog("save_msg", savePromise);
else return savePromise;
	};
	const send = async () => {
		if (model.isSharedMailbox() && model.containsExternalRecipients() && model.isConfidential()) {
			await Dialog.message("sharedMailboxCanNotSendConfidentialExternal_msg");
			return;
		}
		try {
			const success = await model.send(MailMethod.NONE, Dialog.confirm, showProgressDialog);
			if (success) {
				dispose();
				dialog.close();
				await handleRatingByEvent();
			}
		} catch (e) {
			if (e instanceof UserError) showUserError(e);
else throw e;
		}
	};
	const disposables = [];
	const dispose = () => {
		model.dispose();
		if (templatePopupModel) templatePopupModel.dispose();
		for (const disposable of disposables) disposable.dispose();
	};
	const minimize = () => {
		let saveStatus = (0, import_stream.default)({ status: SaveStatusEnum.Saving });
		if (model.hasMailChanged()) save(false).then(() => saveStatus({ status: SaveStatusEnum.Saved })).catch((e) => {
			const reason = isOfflineError(e) ? SaveErrorReason.ConnectionLost : SaveErrorReason.Unknown;
			saveStatus({
				status: SaveStatusEnum.NotSaved,
				reason
			});
			if (reason === SaveErrorReason.Unknown) if (e instanceof UserError) showUserError(e);
else throw e;
		}).finally(() => mithril_default.redraw());
else if (!model.draft) {
			dispose();
			dialog.close();
			return;
		} else saveStatus = (0, import_stream.default)({ status: SaveStatusEnum.Saved });
		showMinimizedMailEditor(dialog, model, mailLocator.minimizedMailModel, locator.eventController, dispose, saveStatus);
	};
	let windowCloseUnsubscribe = () => {};
	const headerBarAttrs = {
		left: [{
			label: "close_alt",
			click: () => minimize(),
			type: ButtonType.Secondary
		}],
		right: [{
			label: "send_action",
			click: () => {
				send();
			},
			type: ButtonType.Primary
		}],
		middle: dialogTitleTranslationKey(model.getConversationType()),
		create: () => {
			if (isBrowser()) windowCloseUnsubscribe = windowFacade.addWindowCloseListener(() => {});
else if (isDesktop()) windowCloseUnsubscribe = windowFacade.addWindowCloseListener(() => {
				minimize();
			});
		},
		remove: () => {
			windowCloseUnsubscribe();
		}
	};
	const templatePopupModel = locator.logins.isInternalUserLoggedIn() && client.isDesktopDevice() ? new TemplatePopupModel(locator.eventController, locator.logins, locator.entityClient) : null;
	const createKnowledgebaseButtonAttrs = async (editor) => {
		if (locator.logins.isInternalUserLoggedIn()) {
			const customer = await locator.logins.getUserController().loadCustomer();
			if (styles.isDesktopLayout() && templatePopupModel && locator.logins.getUserController().getTemplateMemberships().length > 0 && isCustomizationEnabledForCustomer(customer, FeatureType.KnowledgeBase)) {
				const knowledgebaseModel = new KnowledgeBaseModel(locator.eventController, locator.entityClient, locator.logins.getUserController());
				await knowledgebaseModel.init();
				disposables.push(knowledgebaseModel);
				const knowledgebaseInjection = createKnowledgeBaseDialogInjection(knowledgebaseModel, templatePopupModel, editor);
				dialog.setInjectionRight(knowledgebaseInjection);
				return knowledgebaseInjection;
			} else return null;
		} else return null;
	};
	mailEditorAttrs = createMailEditorAttrs(model, blockExternalContent, model.toRecipients().length !== 0, () => dialog, templatePopupModel, createKnowledgebaseButtonAttrs, await locator.recipientsSearchModel(), alwaysBlockExternalContent);
	const shortcuts = [
		{
			key: Keys.ESC,
			exec: () => {
				minimize();
			},
			help: "close_alt"
		},
		{
			key: Keys.S,
			ctrlOrCmd: true,
			exec: () => {
				save().catch(ofClass(UserError, showUserError));
			},
			help: "save_action"
		},
		{
			key: Keys.S,
			ctrlOrCmd: true,
			shift: true,
			exec: () => {
				send();
			},
			help: "send_action"
		},
		{
			key: Keys.RETURN,
			ctrlOrCmd: true,
			exec: () => {
				send();
			},
			help: "send_action"
		}
	];
	dialog = Dialog.editDialog(headerBarAttrs, MailEditor, mailEditorAttrs);
	dialog.setCloseHandler(() => minimize());
	for (let shortcut of shortcuts) dialog.addShortcut(shortcut);
	return dialog;
}
async function newMailEditor(mailboxDetails) {
	await checkApprovalStatus(locator.logins, false);
	const { appendEmailSignature: appendEmailSignature$1 } = await import("./Signature2-chunk.js");
	const signature = appendEmailSignature$1("", locator.logins.getUserController().props);
	const detailsProperties = await getMailboxDetailsAndProperties(mailboxDetails);
	return newMailEditorFromTemplate(detailsProperties.mailboxDetails, {}, "", signature);
}
async function getExternalContentRulesForEditor(model, currentStatus) {
	let contentRules;
	const previousMail = model.getPreviousMail();
	if (!previousMail) contentRules = {
		alwaysBlockExternalContent: false,
		blockExternalContent: false
	};
else {
		const externalImageRule = await locator.configFacade.getExternalImageRule(previousMail.sender.address).catch((e) => {
			console.log("Error getting external image rule:", e);
			return ExternalImageRule.None;
		});
		let isAuthenticatedMail;
		if (previousMail.authStatus !== null) isAuthenticatedMail = previousMail.authStatus === MailAuthenticationStatus.AUTHENTICATED;
else {
			const mailDetails = await locator.mailFacade.loadMailDetailsBlob(previousMail);
			isAuthenticatedMail = mailDetails.authStatus === MailAuthenticationStatus.AUTHENTICATED;
		}
		if (externalImageRule === ExternalImageRule.Block || externalImageRule === ExternalImageRule.None && model.isUserPreviousSender()) contentRules = {
			alwaysBlockExternalContent: externalImageRule === ExternalImageRule.Block,
			blockExternalContent: true
		};
else if (externalImageRule === ExternalImageRule.Allow && isAuthenticatedMail) contentRules = {
			alwaysBlockExternalContent: false,
			blockExternalContent: false
		};
else contentRules = {
			alwaysBlockExternalContent: false,
			blockExternalContent: currentStatus
		};
	}
	return contentRules;
}
async function newMailEditorAsResponse(args, blockExternalContent, inlineImages, mailboxDetails) {
	const detailsProperties = await getMailboxDetailsAndProperties(mailboxDetails);
	const model = await locator.sendMailModel(detailsProperties.mailboxDetails, detailsProperties.mailboxProperties);
	await model.initAsResponse(args, inlineImages);
	const externalImageRules = await getExternalContentRulesForEditor(model, blockExternalContent);
	return createMailEditorDialog(model, externalImageRules?.blockExternalContent, externalImageRules?.alwaysBlockExternalContent);
}
async function newMailEditorFromDraft(mail, mailDetails, attachments, inlineImages, blockExternalContent, mailboxDetails) {
	const detailsProperties = await getMailboxDetailsAndProperties(mailboxDetails);
	const model = await locator.sendMailModel(detailsProperties.mailboxDetails, detailsProperties.mailboxProperties);
	await model.initWithDraft(mail, mailDetails, attachments, inlineImages);
	const externalImageRules = await getExternalContentRulesForEditor(model, blockExternalContent);
	return createMailEditorDialog(model, externalImageRules?.blockExternalContent, externalImageRules?.alwaysBlockExternalContent);
}
async function newMailtoUrlMailEditor(mailtoUrl, confidential, mailboxDetails) {
	const detailsProperties = await getMailboxDetailsAndProperties(mailboxDetails);
	const mailTo = parseMailtoUrl(mailtoUrl);
	let dataFiles = [];
	if (mailTo.attach) {
		const attach = mailTo.attach;
		if (isDesktop()) {
			const files = await Promise.all(attach.map((uri) => locator.fileApp.readDataFile(uri)));
			dataFiles = files.filter(isNotNull);
		}
		const keepAttachments = dataFiles.length === 0 || await Dialog.confirm("attachmentWarning_msg", "attachFiles_action", () => dataFiles.map((df, i) => mithril_default(".text-break.selectable.mt-xs", { title: attach[i] }, df.name)));
		if (keepAttachments) {
			const sizeCheckResult = checkAttachmentSize(dataFiles);
			dataFiles = sizeCheckResult.attachableFiles;
			if (sizeCheckResult.tooBigFiles.length > 0) await Dialog.message("tooBigAttachment_msg", () => sizeCheckResult.tooBigFiles.map((file) => mithril_default(".text-break.selectable", file)));
		} else throw new CancelledError("user cancelled opening mail editor with attachments");
	}
	return newMailEditorFromTemplate(detailsProperties.mailboxDetails, mailTo.recipients, mailTo.subject || "", appendEmailSignature(mailTo.body || "", locator.logins.getUserController().props), dataFiles, confidential, undefined, true);
}
async function newMailEditorFromTemplate(mailboxDetails, recipients, subject, bodyText, attachments, confidential, senderMailAddress, initialChangedState) {
	const mailboxProperties = await locator.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
	return locator.sendMailModel(mailboxDetails, mailboxProperties).then((model) => model.initWithTemplate(recipients, subject, bodyText, attachments, confidential, senderMailAddress, initialChangedState)).then((model) => createMailEditorDialog(model));
}
async function writeInviteMail(referralLink) {
	const detailsProperties = await getMailboxDetailsAndProperties(null);
	const username = locator.logins.getUserController().userGroupInfo.name;
	const body = lang.get("invitationMailBody_msg", {
		"{registrationLink}": referralLink,
		"{username}": username
	});
	const { invitationSubject } = await locator.serviceExecutor.get(TranslationService, createTranslationGetIn({ lang: lang.code }));
	const dialog = await newMailEditorFromTemplate(detailsProperties.mailboxDetails, {}, invitationSubject, body, [], false);
	dialog.show();
}
async function writeGiftCardMail(link, mailboxDetails) {
	const detailsProperties = await getMailboxDetailsAndProperties(mailboxDetails);
	const bodyText = lang.get("defaultShareGiftCardBody_msg", {
		"{link}": "<a href=\"" + link + "\">" + link + "</a>",
		"{username}": locator.logins.getUserController().userGroupInfo.name
	}).split("\n").join("<br />");
	const { giftCardSubject } = await locator.serviceExecutor.get(TranslationService, createTranslationGetIn({ lang: lang.code }));
	locator.sendMailModel(detailsProperties.mailboxDetails, detailsProperties.mailboxProperties).then((model) => model.initWithTemplate({}, giftCardSubject, appendEmailSignature(bodyText, locator.logins.getUserController().props), [], false)).then((model) => createMailEditorDialog(model, false)).then((dialog) => dialog.show());
}
async function getMailboxDetailsAndProperties(mailboxDetails) {
	mailboxDetails = mailboxDetails ?? await locator.mailboxModel.getUserMailboxDetails();
	const mailboxProperties = await locator.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
	return {
		mailboxDetails,
		mailboxProperties
	};
}

//#endregion
export { KnowledgeBaseEntryView, MailEditor, createInitialTemplateListIfAllowed, createMailEditorAttrs, knowledgeBaseSearch, newMailEditor, newMailEditorAsResponse, newMailEditorFromDraft, newMailEditorFromTemplate, newMailtoUrlMailEditor, writeGiftCardMail, writeInviteMail };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbEVkaXRvci1jaHVuay5qcyIsIm5hbWVzIjpbInZub2RlOiBWbm9kZTxUZW1wbGF0ZVJlc3VsdFJvd0F0dHJzPiIsInRleHQ6IHN0cmluZyIsImU6IEtleWJvYXJkRXZlbnQiLCJ2bm9kZTogVm5vZGU8VGVtcGxhdGVTZWFyY2hCYXJBdHRycz4iLCJhOiBUZW1wbGF0ZVNlYXJjaEJhckF0dHJzIiwiZTogS2V5Ym9hcmRFdmVudCIsInZub2RlOiBDVm5vZGU8U2Nyb2xsU2VsZWN0TGlzdEF0dHJzPFQ+PiIsInZub2RlOiBDVm5vZGVET008U2Nyb2xsU2VsZWN0TGlzdEF0dHJzPFQ+PiIsIml0ZW06IFQiLCJ2bm9kZTogVm5vZGU8U2Nyb2xsU2VsZWN0TGlzdEF0dHJzPFQ+PiIsImU6IE1vdXNlRXZlbnQiLCJzZWxlY3RlZEl0ZW06IFQgfCBudWxsIiwiaXRlbXM6IFJlYWRvbmx5QXJyYXk8VD4iLCJzY3JvbGxEb206IEhUTUxFbGVtZW50IiwidGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsIiwiZWRpdG9yOiBFZGl0b3IiLCJ0ZW1wbGF0ZTogRW1haWxUZW1wbGF0ZSB8IG51bGwiLCJoaWdobGlnaHRlZFRleHQ6IHN0cmluZyIsInRleHQ6IHN0cmluZyIsInJlY3Q6IFBvc1JlY3QiLCJvblNlbGVjdDogKGFyZzA6IHN0cmluZykgPT4gdm9pZCIsImluaXRpYWxTZWFyY2hTdHJpbmc6IHN0cmluZyIsInJlc3RvcmVFZGl0b3JGb2N1cz86ICgpID0+IHZvaWQiLCJ2YWx1ZTogc3RyaW5nIiwiZTogTW91c2VFdmVudCIsImU6IEtleWJvYXJkRXZlbnQiLCJzZWxlY3RlZFRlbXBsYXRlOiBFbWFpbFRlbXBsYXRlIiwibGFuZ0NvZGU6IExhbmd1YWdlQ29kZSIsInRlbXBsYXRlOiBFbWFpbFRlbXBsYXRlIiwiXzogRW1haWxUZW1wbGF0ZSIsImU6IEV2ZW50IiwidGVtcGxhdGVUb0VkaXQ6IEVtYWlsVGVtcGxhdGUgfCBudWxsIiwiZ3JvdXBSb290OiBUZW1wbGF0ZUdyb3VwUm9vdCIsImVkaXRvcjogRWRpdG9yIiwidGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsIiwiZXZlbnQ6IEtleWJvYXJkRXZlbnQiLCJldmVudDogQ3VzdG9tRXZlbnQ8eyByYW5nZTogUmFuZ2UgfCBudWxsIH0+IiwibGFuZzogTGFuZ3VhZ2VWaWV3TW9kZWwiLCJsYW5nIiwidm5vZGU6IFZub2RlPEtub3dsZWRnZWJhc2VMaXN0RW50cnlBdHRycz4iLCJhdHRyczogS25vd2xlZGdlQmFzZUVudHJ5Vmlld0F0dHJzIiwiZXZlbnQ6IE1vdXNlRXZlbnQiLCJlbnRyeTogS25vd2xlZGdlQmFzZUVudHJ5IiwiZXZlbnQ6IEV2ZW50Iiwic3RyZWFtIiwibW9kZWw6IEtub3dsZWRnZUJhc2VNb2RlbCIsImF0dHJzOiBLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzIiwiZW50cnk6IEtub3dsZWRnZUJhc2VFbnRyeSIsImtub3dsZWRnZUJhc2U6IEtub3dsZWRnZUJhc2VNb2RlbCIsInRlbXBsYXRlTW9kZWw6IFRlbXBsYXRlUG9wdXBNb2RlbCIsImVkaXRvcjogRWRpdG9yIiwia25vd2xlZGdlYmFzZUF0dHJzOiBLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzIiwiYXR0cnM6IEtub3dsZWRnZWJhc2VEaWFsb2dDb250ZW50QXR0cnMiLCJpc0RpYWxvZ1Zpc2libGU6IFN0cmVhbTxib29sZWFuPiIsImVudHJ5OiBLbm93bGVkZ2VCYXNlRW50cnkiLCJtb2RlbDogS25vd2xlZGdlQmFzZU1vZGVsIiwiZW50cnlUb0VkaXQ6IEtub3dsZWRnZUJhc2VFbnRyeSB8IG51bGwiLCJncm91cFJvb3Q6IFRlbXBsYXRlR3JvdXBSb290IiwiaW5wdXQ6IHN0cmluZyIsImFsbEVudHJpZXM6IFJlYWRvbmx5QXJyYXk8S25vd2xlZGdlQmFzZUVudHJ5PiIsImVudHJ5MTogS25vd2xlZGdlQmFzZUVudHJ5IiwiZW50cnkyOiBLbm93bGVkZ2VCYXNlRW50cnkiLCJldmVudENvbnRyb2xsZXI6IEV2ZW50Q29udHJvbGxlciIsImVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50IiwidXNlckNvbnRyb2xsZXI6IFVzZXJDb250cm9sbGVyIiwibmV3R3JvdXBJbnN0YW5jZXM6IFRlbXBsYXRlR3JvdXBJbnN0YW5jZVtdIiwiZW50cnk6IEtub3dsZWRnZUJhc2VFbnRyeSIsInRlbXBsYXRlOiBFbWFpbFRlbXBsYXRlIiwiZW1haWxDb250ZW50OiBzdHJpbmciLCJpbnB1dDogc3RyaW5nIiwiYWN0aW9uOiBzdHJpbmciLCJrZXl3b3JkOiBzdHJpbmciLCJ0ZW1wbGF0ZUlkOiBJZFR1cGxlIiwiaW5zdGFuY2UiLCJ1cGRhdGVzOiBSZWFkb25seUFycmF5PEVudGl0eVVwZGF0ZURhdGE+IiwidGVtcGxhdGVHcm91cHM6IEFycmF5PFRlbXBsYXRlR3JvdXBJbnN0YW5jZT4iLCJ2bm9kZTogVm5vZGU8TWluaW1pemVkRWRpdG9yT3ZlcmxheUF0dHJzPiIsInVwZGF0ZXM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlRGF0YT4iLCJldmVudE93bmVyR3JvdXBJZDogSWQiLCJtaW5pbWl6ZWRFZGl0b3I6IE1pbmltaXplZEVkaXRvciIsInZpZXdNb2RlbDogTWluaW1pemVkTWFpbEVkaXRvclZpZXdNb2RlbCIsInNhdmVTdGF0dXM6IFNhdmVTdGF0dXMiLCJkaWFsb2c6IERpYWxvZyIsInNlbmRNYWlsTW9kZWw6IFNlbmRNYWlsTW9kZWwiLCJ2aWV3TW9kZWw6IE1pbmltaXplZE1haWxFZGl0b3JWaWV3TW9kZWwiLCJldmVudENvbnRyb2xsZXI6IEV2ZW50Q29udHJvbGxlciIsImRpc3Bvc2U6ICgpID0+IHZvaWQiLCJzYXZlU3RhdHVzOiBTdHJlYW08U2F2ZVN0YXR1cz4iLCJjbG9zZU92ZXJsYXlGdW5jdGlvbjogKCkgPT4gdm9pZCIsIm1pbmltaXplZEVkaXRvcjogTWluaW1pemVkRWRpdG9yIiwibW9kZWw6IFNlbmRNYWlsTW9kZWwiLCJkb0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBib29sZWFuIiwiZG9Gb2N1c0VkaXRvck9uTG9hZDogYm9vbGVhbiIsImRpYWxvZzogbGF6eTxEaWFsb2c+IiwidGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsIHwgbnVsbCIsImtub3dsZWRnZUJhc2VJbmplY3Rpb246IChlZGl0b3I6IEVkaXRvcikgPT4gUHJvbWlzZTxEaWFsb2dJbmplY3Rpb25SaWdodEF0dHJzPEtub3dsZWRnZWJhc2VEaWFsb2dDb250ZW50QXR0cnM+IHwgbnVsbD4iLCJzZWFyY2g6IFJlY2lwaWVudHNTZWFyY2hNb2RlbCIsImFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBib29sZWFuIiwidm5vZGU6IFZub2RlPE1haWxFZGl0b3JBdHRycz4iLCJzaG9ydGN1dHM6IFNob3J0Y3V0W10iLCJjaWQ6IHN0cmluZyIsImNvbmZpZGVudGlhbEJ1dHRvbkF0dHJzOiBUb2dnbGVCdXR0b25BdHRycyIsImF0dGFjaEZpbGVzQnV0dG9uQXR0cnM6IEljb25CdXR0b25BdHRycyIsInN1YmplY3RGaWVsZEF0dHJzOiBUZXh0RmllbGRBdHRycyIsImVkaXRDdXN0b21Ob3RpZmljYXRpb25NYWlsQXR0cnM6IEljb25CdXR0b25BdHRycyB8IG51bGwiLCJlOiBNb3VzZUV2ZW50IiwiZXY6IERyYWdFdmVudCIsInNlbGVjdGlvbjogc3RyaW5nIiwidm5vZGUiLCJ2OiBzdHJpbmciLCJhIiwiYXR0cnM6IE1haWxFZGl0b3JBdHRycyIsInNob3dCdXR0b246IEJhbm5lckJ1dHRvbkF0dHJzIiwic3RhdHVzOiBDb250ZW50QmxvY2tpbmdTdGF0dXMiLCJrbm93bGVkZ2VCYXNlSW5qZWN0aW9uOiBEaWFsb2dJbmplY3Rpb25SaWdodEF0dHJzPEtub3dsZWRnZWJhc2VEaWFsb2dDb250ZW50QXR0cnM+IiwiZXZlbnQ6IEV2ZW50IiwicmVjdDogRE9NUmVjdCIsImZpbGVzOiBSZWFkb25seUFycmF5PERhdGFGaWxlIHwgRmlsZVJlZmVyZW5jZT4iLCJmaWVsZDogUmVjaXBpZW50RmllbGQiLCJmaWVsZFRleHQ6IFN0cmVhbTxzdHJpbmc+IiwicmVjaXBpZW50OiBSZXNvbHZhYmxlUmVjaXBpZW50IiwiY29udGFjdEVsZW1lbnRJZDogSWQiLCJjb250YWN0TGlzdElkOiBzdHJpbmciLCJpZDogSWRUdXBsZSIsImNvbnRhY3Q6IENvbnRhY3QiLCJjb250ZXh0QnV0dG9uczogQXJyYXk8RHJvcGRvd25DaGlsZEF0dHJzPiIsImNvbnRhY3RMaXN0SWQ6IElkIiwiZG9tRWxlbWVudDogSFRNTEVsZW1lbnQiLCJmYWRlaW46IGJvb2xlYW4iLCJkaWFsb2c6IERpYWxvZyIsIm1haWxFZGl0b3JBdHRyczogTWFpbEVkaXRvckF0dHJzIiwic2hvd1Byb2dyZXNzOiBib29sZWFuIiwiZGlzcG9zYWJsZXM6IHsgZGlzcG9zZTogKCkgPT4gdW5rbm93biB9W10iLCJoZWFkZXJCYXJBdHRyczogRGlhbG9nSGVhZGVyQmFyQXR0cnMiLCJlZGl0b3I6IEVkaXRvciIsIm1haWxib3hEZXRhaWxzOiBNYWlsYm94RGV0YWlsIiwiY3VycmVudFN0YXR1czogYm9vbGVhbiIsImU6IHVua25vd24iLCJhcmdzOiBJbml0QXNSZXNwb25zZUFyZ3MiLCJibG9ja0V4dGVybmFsQ29udGVudDogYm9vbGVhbiIsImlubGluZUltYWdlczogSW5saW5lSW1hZ2VzIiwibWFpbGJveERldGFpbHM/OiBNYWlsYm94RGV0YWlsIiwibWFpbDogTWFpbCIsIm1haWxEZXRhaWxzOiBNYWlsRGV0YWlscyIsImF0dGFjaG1lbnRzOiBUdXRhbm90YUZpbGVbXSIsIm1haWx0b1VybDogc3RyaW5nIiwiY29uZmlkZW50aWFsOiBib29sZWFuIiwiZGF0YUZpbGVzOiBBdHRhY2htZW50W10iLCJyZWNpcGllbnRzOiBSZWNpcGllbnRzIiwic3ViamVjdDogc3RyaW5nIiwiYm9keVRleHQ6IHN0cmluZyIsImF0dGFjaG1lbnRzPzogUmVhZG9ubHlBcnJheTxBdHRhY2htZW50PiIsImNvbmZpZGVudGlhbD86IGJvb2xlYW4iLCJzZW5kZXJNYWlsQWRkcmVzcz86IHN0cmluZyIsImluaXRpYWxDaGFuZ2VkU3RhdGU/OiBib29sZWFuIiwicmVmZXJyYWxMaW5rOiBzdHJpbmciLCJsaW5rOiBzdHJpbmciLCJtYWlsYm94RGV0YWlsczogTWFpbGJveERldGFpbCB8IG51bGwgfCB1bmRlZmluZWQiXSwic291cmNlcyI6WyIuLi9zcmMvbWFpbC1hcHAvdGVtcGxhdGVzL3ZpZXcvVGVtcGxhdGVDb25zdGFudHMudHMiLCIuLi9zcmMvbWFpbC1hcHAvdGVtcGxhdGVzL3ZpZXcvVGVtcGxhdGVQb3B1cFJlc3VsdFJvdy50cyIsIi4uL3NyYy9tYWlsLWFwcC90ZW1wbGF0ZXMvdmlldy9UZW1wbGF0ZUV4cGFuZGVyLnRzIiwiLi4vc3JjL21haWwtYXBwL3RlbXBsYXRlcy92aWV3L1RlbXBsYXRlU2VhcmNoQmFyLnRzIiwiLi4vc3JjL21haWwtYXBwL3RlbXBsYXRlcy9UZW1wbGF0ZUdyb3VwVXRpbHMudHMiLCIuLi9zcmMvY29tbW9uL2d1aS9TY3JvbGxTZWxlY3RMaXN0LnRzIiwiLi4vc3JjL21haWwtYXBwL3RlbXBsYXRlcy92aWV3L1RlbXBsYXRlUG9wdXAudHMiLCIuLi9zcmMvbWFpbC1hcHAvdGVtcGxhdGVzL3ZpZXcvVGVtcGxhdGVTaG9ydGN1dExpc3RlbmVyLnRzIiwiLi4vc3JjL21haWwtYXBwL2tub3dsZWRnZWJhc2Uvdmlldy9Lbm93bGVkZ2VCYXNlTGlzdEVudHJ5LnRzIiwiLi4vc3JjL21haWwtYXBwL2tub3dsZWRnZWJhc2Uvdmlldy9Lbm93bGVkZ2VCYXNlRW50cnlWaWV3LnRzIiwiLi4vc3JjL21haWwtYXBwL2tub3dsZWRnZWJhc2Uvdmlldy9Lbm93bGVkZ2VCYXNlRGlhbG9nQ29udGVudC50cyIsIi4uL3NyYy9tYWlsLWFwcC9rbm93bGVkZ2ViYXNlL3ZpZXcvS25vd2xlZGdlQmFzZURpYWxvZy50cyIsIi4uL3NyYy9tYWlsLWFwcC9rbm93bGVkZ2ViYXNlL21vZGVsL0tub3dsZWRnZUJhc2VTZWFyY2hGaWx0ZXIudHMiLCIuLi9zcmMvbWFpbC1hcHAva25vd2xlZGdlYmFzZS9tb2RlbC9Lbm93bGVkZ2VCYXNlTW9kZWwudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01pbmltaXplZEVkaXRvck92ZXJsYXkudHMiLCIuLi9zcmMvbWFpbC1hcHAvbWFpbC92aWV3L01pbmltaXplZE1haWxFZGl0b3JPdmVybGF5LnRzIiwiLi4vc3JjL21haWwtYXBwL21haWwvZWRpdG9yL01haWxFZGl0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IFRFTVBMQVRFX1BPUFVQX0hFSUdIVCA9IDM0MFxuZXhwb3J0IGNvbnN0IFRFTVBMQVRFX1BPUFVQX1RXT19DT0xVTU5fTUlOX1dJRFRIID0gNjAwXG5leHBvcnQgY29uc3QgVEVNUExBVEVfTElTVF9FTlRSWV9IRUlHSFQgPSA0N1xuZXhwb3J0IGNvbnN0IFRFTVBMQVRFX0xJU1RfRU5UUllfV0lEVEggPSAzNTRcbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgcHggfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zaXplXCJcbmltcG9ydCB0eXBlIHsgRW1haWxUZW1wbGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFRFTVBMQVRFX1NIT1JUQ1VUX1BSRUZJWCB9IGZyb20gXCIuLi9tb2RlbC9UZW1wbGF0ZVBvcHVwTW9kZWwuanNcIlxuaW1wb3J0IHsgVEVNUExBVEVfTElTVF9FTlRSWV9IRUlHSFQgfSBmcm9tIFwiLi9UZW1wbGF0ZUNvbnN0YW50cy5qc1wiXG5cbmV4cG9ydCB0eXBlIFRlbXBsYXRlUmVzdWx0Um93QXR0cnMgPSB7XG5cdHRlbXBsYXRlOiBFbWFpbFRlbXBsYXRlXG59XG5cbi8qKlxuICogICByZW5kZXJzIG9uZSBlbnRyeSBvZiB0aGUgbGlzdCBpbiB0aGUgdGVtcGxhdGUgcG9wdXBcbiAqL1xuZXhwb3J0IGNsYXNzIFRlbXBsYXRlUG9wdXBSZXN1bHRSb3cgaW1wbGVtZW50cyBDb21wb25lbnQ8VGVtcGxhdGVSZXN1bHRSb3dBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxUZW1wbGF0ZVJlc3VsdFJvd0F0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHRpdGxlLCB0YWcgfSA9IHZub2RlLmF0dHJzLnRlbXBsYXRlXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5mbGV4LmZsZXgtY29sdW1uLm92ZXJmbG93LWhpZGRlbi5mdWxsLXdpZHRoLm1sLXNcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRoZWlnaHQ6IHB4KFRFTVBMQVRFX0xJU1RfRU5UUllfSEVJR0hUKSxcblx0XHRcdFx0fSxcblx0XHRcdFx0Ly8gdGhpcyB0aXRsZSBpcyBmb3IgdGhlIGhvdmVyIHRleHRcblx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0Ly8gbWFyZ2luTGVmdCA0cHggYmVjYXVzZSBib3JkZXItcmFkaXVzIG9mIHRhZyBoYXMgbWFyZ2luIG9mIDRweFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnRleHQtZWxsaXBzaXMuc21hbGxlclwiLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdG1hcmdpbkxlZnQ6IFwiNHB4XCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dGl0bGUsXG5cdFx0XHRcdCksXG5cdFx0XHRcdG0oXCIuZmxleC5iYWRnZS1saW5lLWhlaWdodC50ZXh0LWVsbGlwc2lzXCIsIFtcblx0XHRcdFx0XHR0YWdcblx0XHRcdFx0XHRcdD8gbShcIi5zbWFsbC5rZXl3b3JkLWJ1YmJsZS1uby1wYWRkaW5nLnBsLXMucHItcy5ib3JkZXItcmFkaXVzLm5vLXdyYXAuc21hbGwubWluLWNvbnRlbnRcIiwgVEVNUExBVEVfU0hPUlRDVVRfUFJFRklYICsgdGFnLnRvTG93ZXJDYXNlKCkpXG5cdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdF0pLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgcHgsIHNpemUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zaXplXCJcbmltcG9ydCB7IEtleXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgVGVtcGxhdGVQb3B1cE1vZGVsIH0gZnJvbSBcIi4uL21vZGVsL1RlbXBsYXRlUG9wdXBNb2RlbC5qc1wiXG5pbXBvcnQgeyBpc0tleVByZXNzZWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvS2V5TWFuYWdlclwiXG5pbXBvcnQgdHlwZSB7IEVtYWlsVGVtcGxhdGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBURU1QTEFURV9QT1BVUF9IRUlHSFQgfSBmcm9tIFwiLi9UZW1wbGF0ZUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBtZW1vaXplZCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgaHRtbFNhbml0aXplciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9IdG1sU2FuaXRpemVyLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvdGhlbWUuanNcIlxuXG4vKipcbiAqIFRlbXBsYXRlRXhwYW5kZXIgaXMgdGhlIHJpZ2h0IHNpZGUgdGhhdCBpcyByZW5kZXJlZCB3aXRoaW4gdGhlIFBvcHVwLiBDb25zaXN0cyBvZiBEcm9wZG93biwgQ29udGVudCBhbmQgQnV0dG9uLlxuICogVGhlIFBvcHVwIGhhbmRsZXMgd2hldGhlciB0aGUgRXhwYW5kZXIgc2hvdWxkIGJlIHJlbmRlcmVkIG9yIG5vdCwgZGVwZW5kaW5nIG9uIGF2YWlsYWJsZSB3aWR0aC1zcGFjZS5cbiAqL1xuZXhwb3J0IHR5cGUgVGVtcGxhdGVFeHBhbmRlckF0dHJzID0ge1xuXHR0ZW1wbGF0ZTogRW1haWxUZW1wbGF0ZVxuXHRtb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsXG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZUV4cGFuZGVyIGltcGxlbWVudHMgQ29tcG9uZW50PFRlbXBsYXRlRXhwYW5kZXJBdHRycz4ge1xuXHRwcml2YXRlIHJlYWRvbmx5IHNhbml0aXplZFRleHQgPSBtZW1vaXplZChcblx0XHQodGV4dDogc3RyaW5nKSA9PlxuXHRcdFx0aHRtbFNhbml0aXplci5zYW5pdGl6ZUhUTUwodGV4dCwge1xuXHRcdFx0XHRibG9ja0V4dGVybmFsQ29udGVudDogZmFsc2UsXG5cdFx0XHRcdGFsbG93UmVsYXRpdmVMaW5rczogdHJ1ZSxcblx0XHRcdH0pLmh0bWwsXG5cdClcblxuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8VGVtcGxhdGVFeHBhbmRlckF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IG1vZGVsLCB0ZW1wbGF0ZSB9ID0gYXR0cnNcblx0XHRjb25zdCBzZWxlY3RlZENvbnRlbnQgPSBtb2RlbC5nZXRTZWxlY3RlZENvbnRlbnQoKVxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuZmxleC5mbGV4LWNvbHVtbi5mbGV4LWdyb3cuc2Nyb2xsLm1sLXNcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHQvLyBtYXhIZWlnaHQgaGFzIHRvIGJlIHNldCwgYmVjYXVzZSBvdGhlcndpc2UgdGhlIGNvbnRlbnQgd291bGQgb3ZlcmZsb3cgb3V0c2lkZSB0aGUgZmxleGJveCAoLTQ0IGJlY2F1c2Ugb2YgaGVhZGVyIGhlaWdodClcblx0XHRcdFx0XHRtYXhIZWlnaHQ6IHB4KFRFTVBMQVRFX1BPUFVQX0hFSUdIVCAtIHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9ua2V5ZG93bjogKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRcdFx0XHRpZiAoaXNLZXlQcmVzc2VkKGUua2V5LCBLZXlzLlRBQikpIHtcblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCIudGV4dC1icmVhay5zbWFsbGVyLmIudGV4dC1jZW50ZXJcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcImJvcmRlci1ib3R0b21cIjogYDFweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWAsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dGVtcGxhdGUudGl0bGUsXG5cdFx0XHRcdCksXG5cdFx0XHRcdG0oXCIudGV4dC1icmVhay5mbGV4LWdyb3cucHIub3ZlcmZsb3cteS12aXNpYmxlLnB0XCIsIHNlbGVjdGVkQ29udGVudCA/IG0udHJ1c3QodGhpcy5zYW5pdGl6ZWRUZXh0KHNlbGVjdGVkQ29udGVudC50ZXh0KSkgOiBudWxsKSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ2xhc3NDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBNYXliZVRyYW5zbGF0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgaW5wdXRMaW5lSGVpZ2h0LCBweCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemVcIlxuaW1wb3J0IHsga2V5Ym9hcmRFdmVudFRvS2V5UHJlc3MsIGtleUhhbmRsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvS2V5TWFuYWdlclwiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3RoZW1lXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcblxuZXhwb3J0IHR5cGUgVGVtcGxhdGVTZWFyY2hCYXJBdHRycyA9IHtcblx0dmFsdWU6IFN0cmVhbTxzdHJpbmc+XG5cdHBsYWNlaG9sZGVyPzogTWF5YmVUcmFuc2xhdGlvblxuXHRvbmlucHV0PzogKHZhbHVlOiBzdHJpbmcsIGlucHV0OiBIVE1MSW5wdXRFbGVtZW50KSA9PiB1bmtub3duXG5cdGtleUhhbmRsZXI/OiBrZXlIYW5kbGVyXG59XG5cbmV4cG9ydCBjbGFzcyBUZW1wbGF0ZVNlYXJjaEJhciBpbXBsZW1lbnRzIENsYXNzQ29tcG9uZW50PFRlbXBsYXRlU2VhcmNoQmFyQXR0cnM+IHtcblx0ZG9tSW5wdXQ6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXG5cdHZpZXcodm5vZGU6IFZub2RlPFRlbXBsYXRlU2VhcmNoQmFyQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGEgPSB2bm9kZS5hdHRyc1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuaW5wdXRXcmFwcGVyLnB0LXhzLnBiLXhzXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdHRoaXMuX2dldElucHV0RmllbGQoYSksXG5cdFx0KVxuXHR9XG5cblx0X2dldElucHV0RmllbGQoYTogVGVtcGxhdGVTZWFyY2hCYXJBdHRycyk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcImlucHV0LmlucHV0XCIsIHtcblx0XHRcdHBsYWNlaG9sZGVyOiBhLnBsYWNlaG9sZGVyICYmIGxhbmcuZ2V0VHJhbnNsYXRpb25UZXh0KGEucGxhY2Vob2xkZXIpLFxuXHRcdFx0b25jcmVhdGU6ICh2bm9kZSkgPT4ge1xuXHRcdFx0XHR0aGlzLmRvbUlucHV0ID0gdm5vZGUuZG9tIGFzIEhUTUxJbnB1dEVsZW1lbnRcblx0XHRcdFx0dGhpcy5kb21JbnB1dC52YWx1ZSA9IGEudmFsdWUoKVxuXHRcdFx0XHR0aGlzLmRvbUlucHV0LmZvY3VzKClcblx0XHRcdH0sXG5cdFx0XHRvbmtleWRvd246IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGtleSA9IGtleWJvYXJkRXZlbnRUb0tleVByZXNzKGUpXG5cdFx0XHRcdHJldHVybiBhLmtleUhhbmRsZXIgIT0gbnVsbCA/IGEua2V5SGFuZGxlcihrZXkpIDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdG9uaW5wdXQ6ICgpID0+IHtcblx0XHRcdFx0Y29uc3QgZG9tSW5wdXQgPSBhc3NlcnROb3ROdWxsKHRoaXMuZG9tSW5wdXQpXG5cdFx0XHRcdGEudmFsdWUoZG9tSW5wdXQudmFsdWUpXG5cdFx0XHRcdGEub25pbnB1dD8uKGRvbUlucHV0LnZhbHVlLCBkb21JbnB1dClcblx0XHRcdH0sXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRsaW5lSGVpZ2h0OiBweChpbnB1dExpbmVIZWlnaHQpLFxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG59XG4iLCJpbXBvcnQgdHlwZSB7IFRlbXBsYXRlR3JvdXBSb290IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgVGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgc2hvd1BsYW5VcGdyYWRlUmVxdWlyZWREaWFsb2cgfSBmcm9tIFwiLi4vLi4vY29tbW9uL21pc2MvU3Vic2NyaXB0aW9uRGlhbG9nc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IEZlYXR1cmVUeXBlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgaXNDdXN0b21pemF0aW9uRW5hYmxlZEZvckN1c3RvbWVyIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0N1c3RvbWVyVXRpbHMuanNcIlxuXG4vKipcbiAqIEByZXR1cm4gVHJ1ZSBpZiB0aGUgZ3JvdXAgaGFzIGJlZW4gY3JlYXRlZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUluaXRpYWxUZW1wbGF0ZUxpc3RJZkFsbG93ZWQoKTogUHJvbWlzZTxUZW1wbGF0ZUdyb3VwUm9vdCB8IG51bGw+IHtcblx0Y29uc3QgdXNlckNvbnRyb2xsZXIgPSBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpXG5cdGNvbnN0IGN1c3RvbWVyID0gYXdhaXQgdXNlckNvbnRyb2xsZXIubG9hZEN1c3RvbWVyKClcblx0Y29uc3QgeyBnZXRBdmFpbGFibGVQbGFuc1dpdGhUZW1wbGF0ZXMgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uL2NvbW1vbi9zdWJzY3JpcHRpb24vU3Vic2NyaXB0aW9uVXRpbHMuanNcIilcblx0bGV0IGFsbG93ZWQgPSAoYXdhaXQgdXNlckNvbnRyb2xsZXIuZ2V0UGxhbkNvbmZpZygpKS50ZW1wbGF0ZXMgfHwgaXNDdXN0b21pemF0aW9uRW5hYmxlZEZvckN1c3RvbWVyKGN1c3RvbWVyLCBGZWF0dXJlVHlwZS5CdXNpbmVzc0ZlYXR1cmVFbmFibGVkKVxuXHRpZiAoIWFsbG93ZWQpIHtcblx0XHRpZiAodXNlckNvbnRyb2xsZXIuaXNHbG9iYWxBZG1pbigpKSB7XG5cdFx0XHRhbGxvd2VkID0gYXdhaXQgc2hvd1BsYW5VcGdyYWRlUmVxdWlyZWREaWFsb2coYXdhaXQgZ2V0QXZhaWxhYmxlUGxhbnNXaXRoVGVtcGxhdGVzKCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdERpYWxvZy5tZXNzYWdlKFwiY29udGFjdEFkbWluX21zZ1wiKVxuXHRcdH1cblx0fVxuXG5cdGlmIChhbGxvd2VkKSB7XG5cdFx0Y29uc3QgZ3JvdXBJZCA9IGF3YWl0IGxvY2F0b3IuZ3JvdXBNYW5hZ2VtZW50RmFjYWRlLmNyZWF0ZVRlbXBsYXRlR3JvdXAoXCJcIilcblx0XHRyZXR1cm4gbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZDxUZW1wbGF0ZUdyb3VwUm9vdD4oVGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmLCBncm91cElkKVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDbGFzc0NvbXBvbmVudCwgQ29tcG9uZW50LCBDVm5vZGUsIENWbm9kZURPTSwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBUcmFuc2xhdGlvbktleSB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4vYmFzZS9JY29uXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4vYmFzZS9pY29ucy9JY29uc1wiXG5pbXBvcnQgdHlwZSB7IE1heWJlTGF6eSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgcmVzb2x2ZU1heWJlTGF6eSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuXG5leHBvcnQgdHlwZSBTY3JvbGxTZWxlY3RMaXN0QXR0cnM8VD4gPSB7XG5cdGl0ZW1zOiBSZWFkb25seUFycmF5PFQ+XG5cdHNlbGVjdGVkSXRlbTogVCB8IG51bGxcblx0b25JdGVtU2VsZWN0ZWQ6IChpdGVtOiBUKSA9PiB1bmtub3duXG5cdGVtcHR5TGlzdE1lc3NhZ2U6IE1heWJlTGF6eTxUcmFuc2xhdGlvbktleT5cblx0d2lkdGg6IG51bWJlclxuXHRyZW5kZXJJdGVtOiAoaXRlbTogVCkgPT4gQ2hpbGRyZW5cblx0b25JdGVtRG91YmxlQ2xpY2tlZDogKGl0ZW06IFQpID0+IHVua25vd25cbn1cblxuZXhwb3J0IGNsYXNzIFNjcm9sbFNlbGVjdExpc3Q8VD4gaW1wbGVtZW50cyBDbGFzc0NvbXBvbmVudDxTY3JvbGxTZWxlY3RMaXN0QXR0cnM8VD4+IHtcblx0cHJpdmF0ZSBzZWxlY3RlZEl0ZW06IFQgfCBudWxsID0gbnVsbFxuXG5cdHZpZXcodm5vZGU6IENWbm9kZTxTY3JvbGxTZWxlY3RMaXN0QXR0cnM8VD4+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGEgPSB2bm9kZS5hdHRyc1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuZmxleC5mbGV4LWNvbHVtbi5zY3JvbGwtbm8tb3ZlcmxheVwiLFxuXHRcdFx0YS5pdGVtcy5sZW5ndGggPiAwXG5cdFx0XHRcdD8gYS5pdGVtcy5tYXAoKGl0ZW0pID0+IHRoaXMucmVuZGVyUm93KGl0ZW0sIHZub2RlKSlcblx0XHRcdFx0OiBtKFwiLnJvdy1zZWxlY3RlZC50ZXh0LWNlbnRlci5wdFwiLCBsYW5nLmdldChyZXNvbHZlTWF5YmVMYXp5KGEuZW1wdHlMaXN0TWVzc2FnZSkpKSxcblx0XHQpXG5cdH1cblxuXHRvbnVwZGF0ZSh2bm9kZTogQ1Zub2RlRE9NPFNjcm9sbFNlbGVjdExpc3RBdHRyczxUPj4pIHtcblx0XHRjb25zdCBuZXdTZWxlY3RlZEl0ZW0gPSB2bm9kZS5hdHRycy5zZWxlY3RlZEl0ZW1cblxuXHRcdGlmIChuZXdTZWxlY3RlZEl0ZW0gIT09IHRoaXMuc2VsZWN0ZWRJdGVtKSB7XG5cdFx0XHR0aGlzLl9vblNlbGVjdGlvbkNoYW5nZWQobmV3U2VsZWN0ZWRJdGVtLCB2bm9kZS5hdHRycy5pdGVtcywgdm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50KVxuXHRcdFx0Ly8gRW5zdXJlcyB0aGF0IHJlZHJhdyBoYXBwZW5zIGFmdGVyIHNlbGVjdGVkIGl0ZW0gY2hhbmdlZCB0aGlzIGd1YXJhbnRlc3MgdGhhdCB0aGUgc2VsZWN0ZWQgaXRlbSBpcyBmb2N1c2VkIGNvcnJlY3RseS5cblx0XHRcdC8vIFNlbGVjdGluZyB0aGUgY29ycmVjdCBpdGVtIGluIHRoZSBsaXN0IHJlcXVpcmVzIHRoYXQgdGhlIChwb3NzaWJsZSBmaWx0ZXJlZCkgbGlzdCBuZWVkcyByZW5kZXIgZmlyc3QgYW5kIHRoZW4gd2Vcblx0XHRcdC8vIGNhbiBzY3JvbGwgdG8gdGhlIG5ldyBzZWxlY3RlZCBpdGVtLiBUaGVyZWZvcmUgd2UgY2FsbCBvblNlbGVjdGlvbkNoYW5nZSBpbiBvbnVwZGF0ZSBjYWxsYmFjay5cblx0XHRcdG0ucmVkcmF3KClcblx0XHR9XG5cdH1cblxuXHRyZW5kZXJSb3coaXRlbTogVCwgdm5vZGU6IFZub2RlPFNjcm9sbFNlbGVjdExpc3RBdHRyczxUPj4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgYSA9IHZub2RlLmF0dHJzXG5cdFx0Y29uc3QgaXNTZWxlY3RlZCA9IGEuc2VsZWN0ZWRJdGVtID09PSBpdGVtXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5mbGV4LmZsZXgtY29sdW1uLmNsaWNrXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0bWF4V2lkdGg6IGEud2lkdGgsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0W1xuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLmZsZXgudGVtcGxhdGUtbGlzdC1yb3dcIiArIChpc1NlbGVjdGVkID8gXCIucm93LXNlbGVjdGVkXCIgOiBcIlwiKSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRvbmNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRhLm9uSXRlbVNlbGVjdGVkKGl0ZW0pXG5cdFx0XHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRvbmRibGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRhLm9uSXRlbVNlbGVjdGVkKGl0ZW0pXG5cdFx0XHRcdFx0XHRcdGEub25JdGVtRG91YmxlQ2xpY2tlZChpdGVtKVxuXHRcdFx0XHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0YS5yZW5kZXJJdGVtKGl0ZW0pLFxuXHRcdFx0XHRcdFx0aXNTZWxlY3RlZFxuXHRcdFx0XHRcdFx0XHQ/IG0oSWNvbiwge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuQXJyb3dGb3J3YXJkLFxuXHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWFyZ2luVG9wOiBcImF1dG9cIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWFyZ2luQm90dG9tOiBcImF1dG9cIixcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHRcdFx0OiBtKFwiXCIsIHtcblx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBcIjE3LjFweFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IFwiMTZweFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0ICB9KSxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHQpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRfb25TZWxlY3Rpb25DaGFuZ2VkKHNlbGVjdGVkSXRlbTogVCB8IG51bGwsIGl0ZW1zOiBSZWFkb25seUFycmF5PFQ+LCBzY3JvbGxEb206IEhUTUxFbGVtZW50KSB7XG5cdFx0dGhpcy5zZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1cblx0XHRpZiAoc2VsZWN0ZWRJdGVtICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IHNlbGVjdGVkSW5kZXggPSBpdGVtcy5pbmRleE9mKHNlbGVjdGVkSXRlbSlcblxuXHRcdFx0aWYgKHNlbGVjdGVkSW5kZXggIT09IC0xKSB7XG5cdFx0XHRcdGNvbnN0IHNlbGVjdGVkRG9tRWxlbWVudCA9IHNjcm9sbERvbS5jaGlsZHJlbi5pdGVtKHNlbGVjdGVkSW5kZXgpXG5cblx0XHRcdFx0aWYgKHNlbGVjdGVkRG9tRWxlbWVudCkge1xuXHRcdFx0XHRcdHNlbGVjdGVkRG9tRWxlbWVudC5zY3JvbGxJbnRvVmlldyh7XG5cdFx0XHRcdFx0XHRibG9jazogXCJuZWFyZXN0XCIsXG5cdFx0XHRcdFx0XHRpbmxpbmU6IFwibmVhcmVzdFwiLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBNb2RhbENvbXBvbmVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvTW9kYWxcIlxuaW1wb3J0IHsgbW9kYWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL01vZGFsXCJcbmltcG9ydCB7IHB4IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZVwiXG5pbXBvcnQgdHlwZSB7IFNob3J0Y3V0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXJcIlxuaW1wb3J0IHsgaXNLZXlQcmVzc2VkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXJcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgS2V5cywgU2hhcmVDYXBhYmlsaXR5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IFRlbXBsYXRlUG9wdXBSZXN1bHRSb3cgfSBmcm9tIFwiLi9UZW1wbGF0ZVBvcHVwUmVzdWx0Um93LmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29uc1wiXG5pbXBvcnQgeyBUZW1wbGF0ZUV4cGFuZGVyIH0gZnJvbSBcIi4vVGVtcGxhdGVFeHBhbmRlci5qc1wiXG5pbXBvcnQgdHlwZSB7IExhbmd1YWdlQ29kZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBsYW5nLCBsYW5ndWFnZUJ5Q29kZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgdHlwZSB7IHdpbmRvd1NpemVMaXN0ZW5lciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9XaW5kb3dGYWNhZGVcIlxuaW1wb3J0IHsgd2luZG93RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL1dpbmRvd0ZhY2FkZVwiXG5pbXBvcnQgdHlwZSB7IEVtYWlsVGVtcGxhdGUsIFRlbXBsYXRlR3JvdXBSb290IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgVGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHR5cGUgeyBCdXR0b25BdHRycyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJ1dHRvbiwgQnV0dG9uQ29sb3IsIEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBTRUxFQ1RfTkVYVF9URU1QTEFURSwgU0VMRUNUX1BSRVZfVEVNUExBVEUsIFRFTVBMQVRFX1NIT1JUQ1VUX1BSRUZJWCwgVGVtcGxhdGVQb3B1cE1vZGVsIH0gZnJvbSBcIi4uL21vZGVsL1RlbXBsYXRlUG9wdXBNb2RlbC5qc1wiXG5pbXBvcnQgeyBhdHRhY2hEcm9wZG93biwgRG9tUmVjdFJlYWRPbmx5UG9seWZpbGxlZCwgUG9zUmVjdCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgZGVib3VuY2UsIGRvd25jYXN0LCBuZXZlck51bGwgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3JcIlxuaW1wb3J0IHsgVGVtcGxhdGVTZWFyY2hCYXIgfSBmcm9tIFwiLi9UZW1wbGF0ZVNlYXJjaEJhci5qc1wiXG5pbXBvcnQgeyBFZGl0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9lZGl0b3IvRWRpdG9yXCJcbmltcG9ydCB7IGdldFNoYXJlZEdyb3VwTmFtZSwgaGFzQ2FwYWJpbGl0eU9uR3JvdXAgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3NoYXJpbmcvR3JvdXBVdGlsc1wiXG5pbXBvcnQgeyBjcmVhdGVJbml0aWFsVGVtcGxhdGVMaXN0SWZBbGxvd2VkIH0gZnJvbSBcIi4uL1RlbXBsYXRlR3JvdXBVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRDb25maXJtYXRpb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0d1aVV0aWxzXCJcbmltcG9ydCB7IFNjcm9sbFNlbGVjdExpc3QgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9TY3JvbGxTZWxlY3RMaXN0XCJcbmltcG9ydCB7IEljb25CdXR0b24sIEljb25CdXR0b25BdHRycyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBURU1QTEFURV9MSVNUX0VOVFJZX1dJRFRILCBURU1QTEFURV9QT1BVUF9IRUlHSFQsIFRFTVBMQVRFX1BPUFVQX1RXT19DT0xVTU5fTUlOX1dJRFRIIH0gZnJvbSBcIi4vVGVtcGxhdGVDb25zdGFudHMuanNcIlxuXG4vKipcbiAqXHRDcmVhdGVzIGEgTW9kYWwvUG9wdXAgdGhhdCBhbGxvd3MgdXNlciB0byBwYXN0ZSB0ZW1wbGF0ZXMgZGlyZWN0bHkgaW50byB0aGUgTWFpbEVkaXRvci5cbiAqXHRBbHNvIGFsbG93cyB1c2VyIHRvIGNoYW5nZSBkZXNpcmVkIGxhbmd1YWdlIHdoZW4gcGFzdGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dUZW1wbGF0ZVBvcHVwSW5FZGl0b3IodGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsLCBlZGl0b3I6IEVkaXRvciwgdGVtcGxhdGU6IEVtYWlsVGVtcGxhdGUgfCBudWxsLCBoaWdobGlnaHRlZFRleHQ6IHN0cmluZykge1xuXHRjb25zdCBpbml0aWFsU2VhcmNoU3RyaW5nID0gdGVtcGxhdGUgPyBURU1QTEFURV9TSE9SVENVVF9QUkVGSVggKyB0ZW1wbGF0ZS50YWcgOiBoaWdobGlnaHRlZFRleHRcblx0Y29uc3QgY3Vyc29yUmVjdCA9IGVkaXRvci5nZXRDdXJzb3JQb3NpdGlvbigpXG5cdGNvbnN0IGVkaXRvclJlY3QgPSBlZGl0b3IuZ2V0RE9NKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuXHRjb25zdCBvblNlbGVjdCA9ICh0ZXh0OiBzdHJpbmcpID0+IHtcblx0XHRlZGl0b3IuaW5zZXJ0SFRNTCh0ZXh0KVxuXHRcdGVkaXRvci5mb2N1cygpXG5cdH1cblxuXHRsZXQgcmVjdFxuXHRjb25zdCBhdmFpbGFibGVIZWlnaHRCZWxvd0N1cnNvciA9IHdpbmRvdy5pbm5lckhlaWdodCAtIGN1cnNvclJlY3QuYm90dG9tXG5cdGNvbnN0IHBvcFVwSGVpZ2h0ID0gVEVNUExBVEVfUE9QVVBfSEVJR0hUICsgMTAgLy8gaGVpZ2h0ICsgMTBweCBvZmZzZXQgZm9yIHNwYWNlIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuXG5cblx0Ly8gQnkgZGVmYXVsdCB0aGUgcG9wdXAgaXMgc2hvd24gYmVsb3cgdGhlIGN1cnNvci4gSWYgdGhlcmUgaXMgbm90IGVub3VnaCBzcGFjZSBtb3ZlIHRoZSBwb3B1cCBhYm92ZSB0aGUgY3Vyc29yXG5cdGNvbnN0IHBvcFVwV2lkdGggPSBlZGl0b3JSZWN0LnJpZ2h0IC0gZWRpdG9yUmVjdC5sZWZ0XG5cblx0aWYgKGF2YWlsYWJsZUhlaWdodEJlbG93Q3Vyc29yIDwgcG9wVXBIZWlnaHQpIHtcblx0XHRjb25zdCBkaWZmID0gcG9wVXBIZWlnaHQgLSBhdmFpbGFibGVIZWlnaHRCZWxvd0N1cnNvclxuXHRcdHJlY3QgPSBuZXcgRG9tUmVjdFJlYWRPbmx5UG9seWZpbGxlZChlZGl0b3JSZWN0LmxlZnQsIGN1cnNvclJlY3QuYm90dG9tIC0gZGlmZiwgcG9wVXBXaWR0aCwgY3Vyc29yUmVjdC5oZWlnaHQpXG5cdH0gZWxzZSB7XG5cdFx0cmVjdCA9IG5ldyBEb21SZWN0UmVhZE9ubHlQb2x5ZmlsbGVkKGVkaXRvclJlY3QubGVmdCwgY3Vyc29yUmVjdC5ib3R0b20sIHBvcFVwV2lkdGgsIGN1cnNvclJlY3QuaGVpZ2h0KVxuXHR9XG5cblx0Y29uc3QgcG9wdXAgPSBuZXcgVGVtcGxhdGVQb3B1cCh0ZW1wbGF0ZU1vZGVsLCByZWN0LCBvblNlbGVjdCwgaW5pdGlhbFNlYXJjaFN0cmluZywgKCkgPT4gZWRpdG9yLmZvY3VzKCkpXG5cdHRlbXBsYXRlTW9kZWwuc2VhcmNoKGluaXRpYWxTZWFyY2hTdHJpbmcpXG5cdHBvcHVwLnNob3coKVxufVxuXG5leHBvcnQgY2xhc3MgVGVtcGxhdGVQb3B1cCBpbXBsZW1lbnRzIE1vZGFsQ29tcG9uZW50IHtcblx0cHJpdmF0ZSBfcmVjdDogUG9zUmVjdFxuXHRwcml2YXRlIF9zaG9ydGN1dHM6IFNob3J0Y3V0W11cblx0cHJpdmF0ZSBfb25TZWxlY3Q6IChfOiBzdHJpbmcpID0+IHZvaWRcblx0cHJpdmF0ZSBfaW5pdGlhbFdpbmRvd1dpZHRoOiBudW1iZXJcblx0cHJpdmF0ZSBfcmVzaXplTGlzdGVuZXI6IHdpbmRvd1NpemVMaXN0ZW5lclxuXHRwcml2YXRlIF9yZWRyYXdTdHJlYW06IFN0cmVhbTxhbnk+XG5cdHByaXZhdGUgcmVhZG9ubHkgX3RlbXBsYXRlTW9kZWw6IFRlbXBsYXRlUG9wdXBNb2RlbFxuXHRwcml2YXRlIHJlYWRvbmx5IF9zZWFyY2hCYXJWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfc2VsZWN0VGVtcGxhdGVCdXR0b25BdHRyczogQnV0dG9uQXR0cnNcblx0cHJpdmF0ZSBfaW5wdXREb206IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBfZGVib3VuY2VGaWx0ZXI6IChfOiBzdHJpbmcpID0+IHZvaWRcblx0cHJpdmF0ZSBmb2N1c2VkQmVmb3JlU2hvd246IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHR0ZW1wbGF0ZU1vZGVsOiBUZW1wbGF0ZVBvcHVwTW9kZWwsXG5cdFx0cmVjdDogUG9zUmVjdCxcblx0XHRvblNlbGVjdDogKGFyZzA6IHN0cmluZykgPT4gdm9pZCxcblx0XHRpbml0aWFsU2VhcmNoU3RyaW5nOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSByZWFkb25seSByZXN0b3JlRWRpdG9yRm9jdXM/OiAoKSA9PiB2b2lkLFxuXHQpIHtcblx0XHR0aGlzLl9yZWN0ID0gcmVjdFxuXHRcdHRoaXMuX29uU2VsZWN0ID0gb25TZWxlY3Rcblx0XHR0aGlzLl9pbml0aWFsV2luZG93V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG5cdFx0dGhpcy5fcmVzaXplTGlzdGVuZXIgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jbG9zZSgpXG5cdFx0fVxuXG5cdFx0dGhpcy5fc2VhcmNoQmFyVmFsdWUgPSBzdHJlYW0oaW5pdGlhbFNlYXJjaFN0cmluZylcblx0XHR0aGlzLl90ZW1wbGF0ZU1vZGVsID0gdGVtcGxhdGVNb2RlbFxuXHRcdHRoaXMuX3Nob3J0Y3V0cyA9IFtcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkVTQyxcblx0XHRcdFx0ZW5hYmxlZDogKCkgPT4gdHJ1ZSxcblx0XHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMucmVzdG9yZUVkaXRvckZvY3VzPy4oKVxuXG5cdFx0XHRcdFx0dGhpcy5fY2xvc2UoKVxuXG5cdFx0XHRcdFx0bS5yZWRyYXcoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRoZWxwOiBcImNsb3NlVGVtcGxhdGVfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuUkVUVVJOLFxuXHRcdFx0XHRlbmFibGVkOiAoKSA9PiB0cnVlLFxuXHRcdFx0XHRleGVjOiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWRDb250ZW50ID0gdGhpcy5fdGVtcGxhdGVNb2RlbC5nZXRTZWxlY3RlZENvbnRlbnQoKVxuXG5cdFx0XHRcdFx0aWYgKHNlbGVjdGVkQ29udGVudCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fb25TZWxlY3Qoc2VsZWN0ZWRDb250ZW50LnRleHQpXG5cblx0XHRcdFx0XHRcdHRoaXMuX2Nsb3NlKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGhlbHA6IFwiaW5zZXJ0VGVtcGxhdGVfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVVAsXG5cdFx0XHRcdGVuYWJsZWQ6ICgpID0+IHRydWUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl90ZW1wbGF0ZU1vZGVsLnNlbGVjdE5leHRUZW1wbGF0ZShTRUxFQ1RfUFJFVl9URU1QTEFURSlcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVscDogXCJzZWxlY3RQcmV2aW91c1RlbXBsYXRlX2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0a2V5OiBLZXlzLkRPV04sXG5cdFx0XHRcdGVuYWJsZWQ6ICgpID0+IHRydWUsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl90ZW1wbGF0ZU1vZGVsLnNlbGVjdE5leHRUZW1wbGF0ZShTRUxFQ1RfTkVYVF9URU1QTEFURSlcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVscDogXCJzZWxlY3ROZXh0VGVtcGxhdGVfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdF1cblx0XHR0aGlzLl9yZWRyYXdTdHJlYW0gPSB0ZW1wbGF0ZU1vZGVsLnNlYXJjaFJlc3VsdHMubWFwKChyZXN1bHRzKSA9PiB7XG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fSlcblx0XHR0aGlzLl9zZWxlY3RUZW1wbGF0ZUJ1dHRvbkF0dHJzID0ge1xuXHRcdFx0bGFiZWw6IFwic2VsZWN0VGVtcGxhdGVfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBzZWxlY3RlZCA9IHRoaXMuX3RlbXBsYXRlTW9kZWwuZ2V0U2VsZWN0ZWRDb250ZW50KClcblxuXHRcdFx0XHRpZiAoc2VsZWN0ZWQpIHtcblx0XHRcdFx0XHR0aGlzLl9vblNlbGVjdChzZWxlY3RlZC50ZXh0KVxuXG5cdFx0XHRcdFx0dGhpcy5fY2xvc2UoKVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdH1cblx0XHR0aGlzLl9kZWJvdW5jZUZpbHRlciA9IGRlYm91bmNlKDIwMCwgKHZhbHVlOiBzdHJpbmcpID0+IHtcblx0XHRcdHRlbXBsYXRlTW9kZWwuc2VhcmNoKHZhbHVlKVxuXHRcdH0pXG5cblx0XHR0aGlzLl9kZWJvdW5jZUZpbHRlcihpbml0aWFsU2VhcmNoU3RyaW5nKVxuXHR9XG5cblx0dmlldzogKCkgPT4gQ2hpbGRyZW4gPSAoKSA9PiB7XG5cdFx0Y29uc3Qgc2hvd1R3b0NvbHVtbnMgPSB0aGlzLl9pc1NjcmVlbldpZGVFbm91Z2goKVxuXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5mbGV4LmZsZXgtY29sdW1uLmFicy5lbGV2YXRlZC1iZy5ib3JkZXItcmFkaXVzLmRyb3Bkb3duLXNoYWRvd1wiLFxuXHRcdFx0e1xuXHRcdFx0XHQvLyBNYWluIFdyYXBwZXJcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHR3aWR0aDogcHgodGhpcy5fcmVjdC53aWR0aCksXG5cdFx0XHRcdFx0aGVpZ2h0OiBweChURU1QTEFURV9QT1BVUF9IRUlHSFQpLFxuXHRcdFx0XHRcdHRvcDogcHgodGhpcy5fcmVjdC50b3ApLFxuXHRcdFx0XHRcdGxlZnQ6IHB4KHRoaXMuX3JlY3QubGVmdCksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5faW5wdXREb20/LmZvY3VzKClcblxuXHRcdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0fSxcblx0XHRcdFx0b25jcmVhdGU6ICgpID0+IHtcblx0XHRcdFx0XHR3aW5kb3dGYWNhZGUuYWRkUmVzaXplTGlzdGVuZXIodGhpcy5fcmVzaXplTGlzdGVuZXIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9ucmVtb3ZlOiAoKSA9PiB7XG5cdFx0XHRcdFx0d2luZG93RmFjYWRlLnJlbW92ZVJlc2l6ZUxpc3RlbmVyKHRoaXMuX3Jlc2l6ZUxpc3RlbmVyKVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0dGhpcy5fcmVuZGVySGVhZGVyKCksXG5cdFx0XHRcdG0oXCIuZmxleC5mbGV4LWdyb3cuc2Nyb2xsLm1iLXNcIiwgW1xuXHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcIi5mbGV4LmZsZXgtY29sdW1uLnNjcm9sbFwiICsgKHNob3dUd29Db2x1bW5zID8gXCIucHJcIiA6IFwiXCIpLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdGZsZXg6IFwiMSAxIDQwJVwiLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHRoaXMuX3JlbmRlckxpc3QoKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdHNob3dUd29Db2x1bW5zXG5cdFx0XHRcdFx0XHQ/IG0oXG5cdFx0XHRcdFx0XHRcdFx0XCIuZmxleC5mbGV4LWNvbHVtbi5mbGV4LWdyb3ctc2hyaW5rLWhhbGZcIixcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmbGV4OiBcIjEgMSA2MCVcIixcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHR0aGlzLl9yZW5kZXJSaWdodENvbHVtbigpLFxuXHRcdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdF0pLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRfcmVuZGVySGVhZGVyKCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBzZWxlY3RlZFRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNb2RlbC5nZXRTZWxlY3RlZFRlbXBsYXRlKClcblxuXHRcdHJldHVybiBtKFwiLmZsZXgtc3BhY2UtYmV0d2Vlbi5jZW50ZXItdmVydGljYWxseS5wbC5wci1zXCIsIFtcblx0XHRcdG0oXCIuZmxleC1zdGFydFwiLCBbbShcIi5mbGV4LmNlbnRlci12ZXJ0aWNhbGx5XCIsIHRoaXMuX3JlbmRlclNlYXJjaEJhcigpKSwgdGhpcy5fcmVuZGVyQWRkQnV0dG9uKCldKSxcblx0XHRcdG0oXCIuZmxleC1lbmRcIiwgW1xuXHRcdFx0XHRzZWxlY3RlZFRlbXBsYXRlXG5cdFx0XHRcdFx0PyB0aGlzLl9yZW5kZXJFZGl0QnV0dG9ucyhzZWxlY3RlZFRlbXBsYXRlKSAvLyBSaWdodCBoZWFkZXIgd3JhcHBlclxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdF0pLFxuXHRcdF0pXG5cdH1cblxuXHRfcmVuZGVyU2VhcmNoQmFyOiAoKSA9PiBDaGlsZHJlbiA9ICgpID0+IHtcblx0XHRyZXR1cm4gbShUZW1wbGF0ZVNlYXJjaEJhciwge1xuXHRcdFx0dmFsdWU6IHRoaXMuX3NlYXJjaEJhclZhbHVlLFxuXHRcdFx0cGxhY2Vob2xkZXI6IFwiZmlsdGVyX2xhYmVsXCIsXG5cdFx0XHRrZXlIYW5kbGVyOiAoa2V5UHJlc3MpID0+IHtcblx0XHRcdFx0aWYgKGlzS2V5UHJlc3NlZChrZXlQcmVzcy5rZXksIEtleXMuRE9XTiwgS2V5cy5VUCkpIHtcblx0XHRcdFx0XHQvLyBUaGlzIGR1cGxpY2F0ZXMgdGhlIGxpc3RlbmVyIHNldCBpbiB0aGlzLl9zaG9ydGN1dHNcblx0XHRcdFx0XHQvLyBiZWNhdXNlIHRoZSBpbnB1dCBjb25zdW1lcyB0aGUgZXZlbnRcblx0XHRcdFx0XHR0aGlzLl90ZW1wbGF0ZU1vZGVsLnNlbGVjdE5leHRUZW1wbGF0ZShpc0tleVByZXNzZWQoa2V5UHJlc3Mua2V5LCBLZXlzLlVQKSA/IFNFTEVDVF9QUkVWX1RFTVBMQVRFIDogU0VMRUNUX05FWFRfVEVNUExBVEUpXG5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0b25pbnB1dDogKHZhbHVlKSA9PiB7XG5cdFx0XHRcdHRoaXMuX2RlYm91bmNlRmlsdGVyKHZhbHVlKVxuXHRcdFx0fSxcblx0XHRcdG9uY3JlYXRlOiAodm5vZGUpID0+IHtcblx0XHRcdFx0dGhpcy5faW5wdXREb20gPSB2bm9kZS5kb20uZmlyc3RFbGVtZW50Q2hpbGQgYXMgSFRNTEVsZW1lbnQgLy8gZmlyc3RFbGVtZW50Q2hpbGQgaXMgdGhlIGlucHV0IGZpZWxkIG9mIHRoZSBpbnB1dCB3cmFwcGVyXG5cdFx0XHR9LFxuXHRcdH0pXG5cdH1cblxuXHRfcmVuZGVyQWRkQnV0dG9uKCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBhdHRycyA9IHRoaXMuX2NyZWF0ZUFkZEJ1dHRvbkF0dHJpYnV0ZXMoKVxuXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIlwiLFxuXHRcdFx0e1xuXHRcdFx0XHRvbmtleWRvd246IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0Ly8gcHJldmVudHMgdGFiYmluZyBpbnRvIHRoZSBiYWNrZ3JvdW5kIG9mIHRoZSBtb2RhbFxuXHRcdFx0XHRcdGlmIChpc0tleVByZXNzZWQoZS5rZXksIEtleXMuVEFCKSAmJiAhdGhpcy5fdGVtcGxhdGVNb2RlbC5nZXRTZWxlY3RlZFRlbXBsYXRlKCkpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2lucHV0RG9tPy5mb2N1cygpXG5cblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRhdHRycyA/IG0oSWNvbkJ1dHRvbiwgYXR0cnMgYXMgSWNvbkJ1dHRvbkF0dHJzKSA6IG51bGwsXG5cdFx0KVxuXHR9XG5cblx0X2NyZWF0ZUFkZEJ1dHRvbkF0dHJpYnV0ZXMoKTogSWNvbkJ1dHRvbkF0dHJzIHwgbnVsbCB7XG5cdFx0Y29uc3QgdGVtcGxhdGVHcm91cEluc3RhbmNlcyA9IHRoaXMuX3RlbXBsYXRlTW9kZWwuZ2V0VGVtcGxhdGVHcm91cEluc3RhbmNlcygpXG5cblx0XHRjb25zdCB3cml0ZWFibGVHcm91cHMgPSB0ZW1wbGF0ZUdyb3VwSW5zdGFuY2VzLmZpbHRlcigoaW5zdGFuY2UpID0+XG5cdFx0XHRoYXNDYXBhYmlsaXR5T25Hcm91cChsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIsIGluc3RhbmNlLmdyb3VwLCBTaGFyZUNhcGFiaWxpdHkuV3JpdGUpLFxuXHRcdClcblxuXHRcdGlmICh0ZW1wbGF0ZUdyb3VwSW5zdGFuY2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGl0bGU6IFwiY3JlYXRlVGVtcGxhdGVfYWN0aW9uXCIsXG5cdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0Y3JlYXRlSW5pdGlhbFRlbXBsYXRlTGlzdElmQWxsb3dlZCgpLnRoZW4oKGdyb3VwUm9vdCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGdyb3VwUm9vdCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnNob3dUZW1wbGF0ZUVkaXRvcihudWxsLCBncm91cFJvb3QpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSxcblx0XHRcdFx0aWNvbjogSWNvbnMuQWRkLFxuXHRcdFx0XHRjb2xvcnM6IEJ1dHRvbkNvbG9yLkRyYXdlck5hdixcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHdyaXRlYWJsZUdyb3Vwcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHRpdGxlOiBcImNyZWF0ZVRlbXBsYXRlX2FjdGlvblwiLFxuXHRcdFx0XHRjbGljazogKCkgPT4gdGhpcy5zaG93VGVtcGxhdGVFZGl0b3IobnVsbCwgd3JpdGVhYmxlR3JvdXBzWzBdLmdyb3VwUm9vdCksXG5cdFx0XHRcdGljb246IEljb25zLkFkZCxcblx0XHRcdFx0Y29sb3JzOiBCdXR0b25Db2xvci5EcmF3ZXJOYXYsXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh3cml0ZWFibGVHcm91cHMubGVuZ3RoID4gMSkge1xuXHRcdFx0cmV0dXJuIGF0dGFjaERyb3Bkb3duKHtcblx0XHRcdFx0bWFpbkJ1dHRvbkF0dHJzOiB7XG5cdFx0XHRcdFx0dGl0bGU6IFwiY3JlYXRlVGVtcGxhdGVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuQWRkLFxuXHRcdFx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuRHJhd2VyTmF2LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjaGlsZEF0dHJzOiAoKSA9PlxuXHRcdFx0XHRcdHdyaXRlYWJsZUdyb3Vwcy5tYXAoKGdyb3VwSW5zdGFuY2VzKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogbGFuZy5tYWtlVHJhbnNsYXRpb24oXCJncm91cF9uYW1lXCIsIGdldFNoYXJlZEdyb3VwTmFtZShncm91cEluc3RhbmNlcy5ncm91cEluZm8sIGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCksIHRydWUpKSxcblx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMuc2hvd1RlbXBsYXRlRWRpdG9yKG51bGwsIGdyb3VwSW5zdGFuY2VzLmdyb3VwUm9vdCksXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHR9KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXG5cdF9yZW5kZXJFZGl0QnV0dG9ucyhzZWxlY3RlZFRlbXBsYXRlOiBFbWFpbFRlbXBsYXRlKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHNlbGVjdGVkQ29udGVudCA9IHRoaXMuX3RlbXBsYXRlTW9kZWwuZ2V0U2VsZWN0ZWRDb250ZW50KClcblxuXHRcdGNvbnN0IHNlbGVjdGVkR3JvdXAgPSB0aGlzLl90ZW1wbGF0ZU1vZGVsLmdldFNlbGVjdGVkVGVtcGxhdGVHcm91cEluc3RhbmNlKClcblxuXHRcdGNvbnN0IGNhbkVkaXQgPSAhIXNlbGVjdGVkR3JvdXAgJiYgaGFzQ2FwYWJpbGl0eU9uR3JvdXAobG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyLCBzZWxlY3RlZEdyb3VwLmdyb3VwLCBTaGFyZUNhcGFiaWxpdHkuV3JpdGUpXG5cdFx0cmV0dXJuIFtcblx0XHRcdG0oXCIuZmxleC5mbGV4LWNvbHVtbi5qdXN0aWZ5LWNlbnRlci5tci1tXCIsIHNlbGVjdGVkQ29udGVudCA/IG0oXCJcIiwgbGFuZy5nZXQobGFuZ3VhZ2VCeUNvZGVbc2VsZWN0ZWRDb250ZW50Lmxhbmd1YWdlQ29kZV0udGV4dElkKSkgOiBcIlwiKSxcblx0XHRcdG0oXG5cdFx0XHRcdEljb25CdXR0b24sXG5cdFx0XHRcdGF0dGFjaERyb3Bkb3duKHtcblx0XHRcdFx0XHRtYWluQnV0dG9uQXR0cnM6IHtcblx0XHRcdFx0XHRcdHRpdGxlOiBcImNob29zZUxhbmd1YWdlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuTGFuZ3VhZ2UsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjaGlsZEF0dHJzOiAoKSA9PlxuXHRcdFx0XHRcdFx0c2VsZWN0ZWRUZW1wbGF0ZS5jb250ZW50cy5tYXAoKGNvbnRlbnQpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgbGFuZ0NvZGU6IExhbmd1YWdlQ29kZSA9IGRvd25jYXN0KGNvbnRlbnQubGFuZ3VhZ2VDb2RlKVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBsYW5ndWFnZUJ5Q29kZVtsYW5nQ29kZV0udGV4dElkLFxuXHRcdFx0XHRcdFx0XHRcdGNsaWNrOiAoZTogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fdGVtcGxhdGVNb2RlbC5zZXRTZWxlY3RlZENvbnRlbnRMYW5ndWFnZShsYW5nQ29kZSlcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX2lucHV0RG9tPy5mb2N1cygpXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHRcdGNhbkVkaXRcblx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRtKEljb25CdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0dGl0bGU6IFwiZWRpdFRlbXBsYXRlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT5cblx0XHRcdFx0XHRcdFx0XHRsb2NhdG9yLmVudGl0eUNsaWVudFxuXHRcdFx0XHRcdFx0XHRcdFx0LmxvYWQoVGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmLCBuZXZlck51bGwoc2VsZWN0ZWRUZW1wbGF0ZS5fb3duZXJHcm91cCkpXG5cdFx0XHRcdFx0XHRcdFx0XHQudGhlbigoZ3JvdXBSb290KSA9PiB0aGlzLnNob3dUZW1wbGF0ZUVkaXRvcihzZWxlY3RlZFRlbXBsYXRlLCBncm91cFJvb3QpKSxcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuRWRpdCxcblx0XHRcdFx0XHRcdFx0Y29sb3JzOiBCdXR0b25Db2xvci5EcmF3ZXJOYXYsXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogXCJyZW1vdmVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Z2V0Q29uZmlybWF0aW9uKFwiZGVsZXRlVGVtcGxhdGVfbXNnXCIpLmNvbmZpcm1lZCgoKSA9PiBsb2NhdG9yLmVudGl0eUNsaWVudC5lcmFzZShzZWxlY3RlZFRlbXBsYXRlKSlcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuVHJhc2gsXG5cdFx0XHRcdFx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuRHJhd2VyTmF2LFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdCAgXVxuXHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRtKFwiLnByLXNcIiwgbShcIi5uYXYtYmFyLXNwYWNlclwiKSksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIlwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0b25rZXlkb3duOiAoZTogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gcHJldmVudHMgdGFiYmluZyBpbnRvIHRoZSBiYWNrZ3JvdW5kIG9mIHRoZSBtb2RhbFxuXHRcdFx0XHRcdFx0aWYgKGlzS2V5UHJlc3NlZChlLmtleSwgS2V5cy5UQUIpKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2lucHV0RG9tPy5mb2N1cygpXG5cblx0XHRcdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bShCdXR0b24sIHRoaXMuX3NlbGVjdFRlbXBsYXRlQnV0dG9uQXR0cnMpLFxuXHRcdFx0KSxcblx0XHRdXG5cdH1cblxuXHRfcmVuZGVyTGlzdCgpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oU2Nyb2xsU2VsZWN0TGlzdCwge1xuXHRcdFx0aXRlbXM6IHRoaXMuX3RlbXBsYXRlTW9kZWwuc2VhcmNoUmVzdWx0cygpLFxuXHRcdFx0c2VsZWN0ZWRJdGVtOiB0aGlzLl90ZW1wbGF0ZU1vZGVsLnNlbGVjdGVkVGVtcGxhdGUoKSxcblx0XHRcdG9uSXRlbVNlbGVjdGVkOiB0aGlzLl90ZW1wbGF0ZU1vZGVsLnNlbGVjdGVkVGVtcGxhdGUsXG5cdFx0XHRlbXB0eUxpc3RNZXNzYWdlOiAoKSA9PiAodGhpcy5fdGVtcGxhdGVNb2RlbC5pc0xvYWRlZCgpID8gXCJub3RoaW5nRm91bmRfbGFiZWxcIiA6IFwibG9hZGluZ1RlbXBsYXRlc19sYWJlbFwiKSxcblx0XHRcdHdpZHRoOiBURU1QTEFURV9MSVNUX0VOVFJZX1dJRFRILFxuXHRcdFx0cmVuZGVySXRlbTogKHRlbXBsYXRlOiBFbWFpbFRlbXBsYXRlKSA9PlxuXHRcdFx0XHRtKFRlbXBsYXRlUG9wdXBSZXN1bHRSb3csIHtcblx0XHRcdFx0XHR0ZW1wbGF0ZTogdGVtcGxhdGUsXG5cdFx0XHRcdH0pLFxuXHRcdFx0b25JdGVtRG91YmxlQ2xpY2tlZDogKF86IEVtYWlsVGVtcGxhdGUpID0+IHtcblx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSB0aGlzLl90ZW1wbGF0ZU1vZGVsLmdldFNlbGVjdGVkQ29udGVudCgpXG5cblx0XHRcdFx0aWYgKHNlbGVjdGVkKSB7XG5cdFx0XHRcdFx0dGhpcy5fb25TZWxlY3Qoc2VsZWN0ZWQudGV4dClcblxuXHRcdFx0XHRcdHRoaXMuX2Nsb3NlKClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0X3JlbmRlclJpZ2h0Q29sdW1uKCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCB0ZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlTW9kZWwuZ2V0U2VsZWN0ZWRUZW1wbGF0ZSgpXG5cblx0XHRpZiAodGVtcGxhdGUpIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdG0oVGVtcGxhdGVFeHBhbmRlciwge1xuXHRcdFx0XHRcdHRlbXBsYXRlOiB0ZW1wbGF0ZSxcblx0XHRcdFx0XHRtb2RlbDogdGhpcy5fdGVtcGxhdGVNb2RlbCxcblx0XHRcdFx0fSksXG5cdFx0XHRdXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHR9XG5cblx0X2lzU2NyZWVuV2lkZUVub3VnaCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gd2luZG93LmlubmVyV2lkdGggPiBURU1QTEFURV9QT1BVUF9UV09fQ09MVU1OX01JTl9XSURUSFxuXHR9XG5cblx0X2dldFdpbmRvd1dpZHRoQ2hhbmdlKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIC0gdGhpcy5faW5pdGlhbFdpbmRvd1dpZHRoXG5cdH1cblxuXHRzaG93KCkge1xuXHRcdHRoaXMuZm9jdXNlZEJlZm9yZVNob3duID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCBhcyBIVE1MRWxlbWVudFxuXHRcdG1vZGFsLmRpc3BsYXkodGhpcywgZmFsc2UpXG5cdH1cblxuXHRfY2xvc2UoKTogdm9pZCB7XG5cdFx0bW9kYWwucmVtb3ZlKHRoaXMpXG5cdH1cblxuXHRiYWNrZ3JvdW5kQ2xpY2soZTogTW91c2VFdmVudCk6IHZvaWQge1xuXHRcdHRoaXMucmVzdG9yZUVkaXRvckZvY3VzPy4oKVxuXHRcdHRoaXMuX2Nsb3NlKClcblx0fVxuXG5cdGhpZGVBbmltYXRpb24oKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdH1cblxuXHRvbkNsb3NlKCk6IHZvaWQge1xuXHRcdHRoaXMuX3JlZHJhd1N0cmVhbS5lbmQodHJ1ZSlcblx0fVxuXG5cdHNob3J0Y3V0cygpOiBTaG9ydGN1dFtdIHtcblx0XHRyZXR1cm4gdGhpcy5fc2hvcnRjdXRzXG5cdH1cblxuXHRwb3BTdGF0ZShlOiBFdmVudCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHRjYWxsaW5nRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLmZvY3VzZWRCZWZvcmVTaG93blxuXHR9XG5cblx0c2hvd1RlbXBsYXRlRWRpdG9yKHRlbXBsYXRlVG9FZGl0OiBFbWFpbFRlbXBsYXRlIHwgbnVsbCwgZ3JvdXBSb290OiBUZW1wbGF0ZUdyb3VwUm9vdCkge1xuXHRcdGltcG9ydChcIi4uLy4uL3NldHRpbmdzL1RlbXBsYXRlRWRpdG9yLmpzXCIpLnRoZW4oKGVkaXRvcikgPT4ge1xuXHRcdFx0ZWRpdG9yLnNob3dUZW1wbGF0ZUVkaXRvcih0ZW1wbGF0ZVRvRWRpdCwgZ3JvdXBSb290KVxuXHRcdH0pXG5cdH1cbn1cbiIsImltcG9ydCB7IEVkaXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2VkaXRvci9FZGl0b3JcIlxuaW1wb3J0IHsgaXNLZXlQcmVzc2VkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0tleU1hbmFnZXJcIlxuaW1wb3J0IHsgZG93bmNhc3QsIGdldEZpcnN0T3JUaHJvdyB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgS2V5cyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBURU1QTEFURV9TSE9SVENVVF9QUkVGSVgsIFRlbXBsYXRlUG9wdXBNb2RlbCB9IGZyb20gXCIuLi9tb2RlbC9UZW1wbGF0ZVBvcHVwTW9kZWwuanNcIlxuaW1wb3J0IHsgbGFuZywgbGFuZ3VhZ2VCeUNvZGUsIExhbmd1YWdlVmlld01vZGVsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IERyb3Bkb3duIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Ecm9wZG93bi5qc1wiXG5pbXBvcnQgeyBtb2RhbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvTW9kYWxcIlxuaW1wb3J0IHsgc2hvd1RlbXBsYXRlUG9wdXBJbkVkaXRvciB9IGZyb20gXCIuL1RlbXBsYXRlUG9wdXAuanNcIlxuXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJUZW1wbGF0ZVNob3J0Y3V0TGlzdGVuZXIoZWRpdG9yOiBFZGl0b3IsIHRlbXBsYXRlTW9kZWw6IFRlbXBsYXRlUG9wdXBNb2RlbCk6IFRlbXBsYXRlU2hvcnRjdXRMaXN0ZW5lciB7XG5cdGNvbnN0IGxpc3RlbmVyID0gbmV3IFRlbXBsYXRlU2hvcnRjdXRMaXN0ZW5lcihlZGl0b3IsIHRlbXBsYXRlTW9kZWwsIGxhbmcpXG5cdGVkaXRvci5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpID0+IGxpc3RlbmVyLmhhbmRsZUtleURvd24oZXZlbnQpKVxuXHRlZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcihcImN1cnNvclwiLCAoZXZlbnQ6IEN1c3RvbUV2ZW50PHsgcmFuZ2U6IFJhbmdlIHwgbnVsbCB9PikgPT4gbGlzdGVuZXIuaGFuZGxlQ3Vyc29yQ2hhbmdlKGV2ZW50KSlcblx0cmV0dXJuIGxpc3RlbmVyXG59XG5cbmNsYXNzIFRlbXBsYXRlU2hvcnRjdXRMaXN0ZW5lciB7XG5cdF9jdXJyZW50Q3Vyc29yUG9zaXRpb246IFJhbmdlIHwgbnVsbFxuXHRfZWRpdG9yOiBFZGl0b3Jcblx0X3RlbXBsYXRlTW9kZWw6IFRlbXBsYXRlUG9wdXBNb2RlbFxuXHRfbGFuZzogTGFuZ3VhZ2VWaWV3TW9kZWxcblxuXHRjb25zdHJ1Y3RvcihlZGl0b3I6IEVkaXRvciwgdGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsLCBsYW5nOiBMYW5ndWFnZVZpZXdNb2RlbCkge1xuXHRcdHRoaXMuX2VkaXRvciA9IGVkaXRvclxuXHRcdHRoaXMuX2N1cnJlbnRDdXJzb3JQb3NpdGlvbiA9IG51bGxcblx0XHR0aGlzLl90ZW1wbGF0ZU1vZGVsID0gdGVtcGxhdGVNb2RlbFxuXHRcdHRoaXMuX2xhbmcgPSBsYW5nXG5cdH1cblxuXHQvLyBhZGQgdGhpcyBldmVudCBsaXN0ZW5lciB0byBoYW5kbGUgcXVpY2sgc2VsZWN0aW9uIG9mIHRlbXBsYXRlcyBpbnNpZGUgdGhlIGVkaXRvclxuXHRoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG5cdFx0aWYgKGlzS2V5UHJlc3NlZChldmVudC5rZXksIEtleXMuVEFCKSAmJiB0aGlzLl9jdXJyZW50Q3Vyc29yUG9zaXRpb24pIHtcblx0XHRcdGNvbnN0IGN1cnNvckVuZFBvcyA9IHRoaXMuX2N1cnJlbnRDdXJzb3JQb3NpdGlvblxuXHRcdFx0Y29uc3QgdGV4dCA9IGN1cnNvckVuZFBvcy5zdGFydENvbnRhaW5lci5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgPyBjdXJzb3JFbmRQb3Muc3RhcnRDb250YWluZXIudGV4dENvbnRlbnQgPz8gXCJcIiA6IFwiXCJcblx0XHRcdGNvbnN0IHRlbXBsYXRlU2hvcnRjdXRTdGFydEluZGV4ID0gdGV4dC5sYXN0SW5kZXhPZihURU1QTEFURV9TSE9SVENVVF9QUkVGSVgpXG5cdFx0XHRjb25zdCBsYXN0V2hpdGVTcGFjZUluZGV4ID0gdGV4dC5zZWFyY2goL1xcc1xcUyokLylcblxuXHRcdFx0aWYgKFxuXHRcdFx0XHR0ZW1wbGF0ZVNob3J0Y3V0U3RhcnRJbmRleCAhPT0gLTEgJiZcblx0XHRcdFx0dGVtcGxhdGVTaG9ydGN1dFN0YXJ0SW5kZXggPCBjdXJzb3JFbmRQb3Muc3RhcnRPZmZzZXQgJiZcblx0XHRcdFx0dGVtcGxhdGVTaG9ydGN1dFN0YXJ0SW5kZXggPiBsYXN0V2hpdGVTcGFjZUluZGV4XG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gc3RvcFByb3BhZ2F0aW9uICYgcHJldmVudERlZmF1bHQgdG8gcHJldmVudCB0YWJiaW5nIHRvIFwiY2xvc2VcIiBidXR0b24gb3IgdGFiYmluZyBpbnRvIGJhY2tncm91bmRcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRjb25zdCByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKClcblx0XHRcdFx0cmFuZ2Uuc2V0U3RhcnQoY3Vyc29yRW5kUG9zLnN0YXJ0Q29udGFpbmVyLCB0ZW1wbGF0ZVNob3J0Y3V0U3RhcnRJbmRleClcblx0XHRcdFx0cmFuZ2Uuc2V0RW5kKGN1cnNvckVuZFBvcy5zdGFydENvbnRhaW5lciwgY3Vyc29yRW5kUG9zLnN0YXJ0T2Zmc2V0KVxuXG5cdFx0XHRcdHRoaXMuX2VkaXRvci5zZXRTZWxlY3Rpb24ocmFuZ2UpXG5cblx0XHRcdFx0Ly8gZmluZCBhbmQgaW5zZXJ0IHRlbXBsYXRlXG5cdFx0XHRcdGNvbnN0IHNlbGVjdGVkVGV4dCA9IHRoaXMuX2VkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuXG5cdFx0XHRcdGNvbnN0IHRlbXBsYXRlID0gdGhpcy5fdGVtcGxhdGVNb2RlbC5maW5kVGVtcGxhdGVXaXRoVGFnKHNlbGVjdGVkVGV4dClcblxuXHRcdFx0XHRpZiAodGVtcGxhdGUpIHtcblx0XHRcdFx0XHRpZiAodGVtcGxhdGUuY29udGVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0Ly8gbXVsdGlwbGUgbGFuZ3VhZ2VzXG5cdFx0XHRcdFx0XHQvLyBzaG93IGRyb3Bkb3duIHRvIHNlbGVjdCBsYW5ndWFnZVxuXHRcdFx0XHRcdFx0bGV0IGJ1dHRvbnMgPSB0ZW1wbGF0ZS5jb250ZW50cy5tYXAoKGNvbnRlbnQpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogbGFuZ3VhZ2VCeUNvZGVbZG93bmNhc3QoY29udGVudC5sYW5ndWFnZUNvZGUpXS50ZXh0SWQsXG5cdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX2VkaXRvci5pbnNlcnRIVE1MKGNvbnRlbnQudGV4dClcblxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fZWRpdG9yLmZvY3VzKClcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0Y29uc3QgZHJvcGRvd24gPSBuZXcgRHJvcGRvd24oKCkgPT4gYnV0dG9ucywgMjAwKVxuXHRcdFx0XHRcdFx0ZHJvcGRvd24uc2V0T3JpZ2luKHRoaXMuX2VkaXRvci5nZXRDdXJzb3JQb3NpdGlvbigpKVxuXHRcdFx0XHRcdFx0bW9kYWwuZGlzcGxheVVuaXF1ZShkcm9wZG93biwgZmFsc2UpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuX2VkaXRvci5pbnNlcnRIVE1MKGdldEZpcnN0T3JUaHJvdyh0ZW1wbGF0ZS5jb250ZW50cykudGV4dClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2hvd1RlbXBsYXRlUG9wdXBJbkVkaXRvcih0aGlzLl90ZW1wbGF0ZU1vZGVsLCB0aGlzLl9lZGl0b3IsIG51bGwsIHNlbGVjdGVkVGV4dClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGhhbmRsZUN1cnNvckNoYW5nZShldmVudDogQ3VzdG9tRXZlbnQ8eyByYW5nZTogUmFuZ2UgfCBudWxsIH0+KSB7XG5cdFx0dGhpcy5fY3VycmVudEN1cnNvclBvc2l0aW9uID0gZXZlbnQuZGV0YWlsLnJhbmdlXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBLbm93bGVkZ2VCYXNlRW50cnkgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBweCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuXG5leHBvcnQgdHlwZSBLbm93bGVkZ2ViYXNlTGlzdEVudHJ5QXR0cnMgPSB7XG5cdGVudHJ5OiBLbm93bGVkZ2VCYXNlRW50cnlcbn1cbmV4cG9ydCBjb25zdCBLTk9XTEVER0VCQVNFX0xJU1RfRU5UUllfSEVJR0hUID0gNTBcblxuLyoqXG4gKiAgUmVuZGVycyBvbmUgbGlzdCBlbnRyeSBvZiB0aGUga25vd2xlZGdlQmFzZVxuICovXG5leHBvcnQgY2xhc3MgS25vd2xlZGdlQmFzZUxpc3RFbnRyeSBpbXBsZW1lbnRzIENvbXBvbmVudDxLbm93bGVkZ2ViYXNlTGlzdEVudHJ5QXR0cnM+IHtcblx0dmlldyh2bm9kZTogVm5vZGU8S25vd2xlZGdlYmFzZUxpc3RFbnRyeUF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHRpdGxlLCBrZXl3b3JkcyB9ID0gdm5vZGUuYXR0cnMuZW50cnlcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguZmxleC1jb2x1bW4ub3ZlcmZsb3ctaGlkZGVuLmZ1bGwtd2lkdGhcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRoZWlnaHQ6IHB4KEtOT1dMRURHRUJBU0VfTElTVF9FTlRSWV9IRUlHSFQpLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0bShcIi50ZXh0LWVsbGlwc2lzLm1iLXhzLmJcIiwgdGl0bGUpLFxuXHRcdFx0XHRtKFwiLmZsZXguYmFkZ2UtbGluZS1oZWlnaHQudGV4dC1lbGxpcHNpc1wiLCBbXG5cdFx0XHRcdFx0a2V5d29yZHMubWFwKChrZXl3b3JkKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbShcIi5iLnNtYWxsLnRlYW1MYWJlbC5wbC1zLnByLXMuYm9yZGVyLXJhZGl1cy5uby13cmFwLnNtYWxsLm1yLXMubWluLWNvbnRlbnRcIiwga2V5d29yZC5rZXl3b3JkKVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRdKSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB0eXBlIHsgS25vd2xlZGdlQmFzZUVudHJ5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgVGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgbWVtb2l6ZWQsIG5ldmVyTnVsbCwgbm9PcCwgb2ZDbGFzcywgc3RhcnRzV2l0aCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgaHRtbFNhbml0aXplciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9IdG1sU2FuaXRpemVyLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IGdldENvbmZpcm1hdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvR3VpVXRpbHMuanNcIlxuaW1wb3J0IHsgTm90Rm91bmRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9SZXN0RXJyb3IuanNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5cbnR5cGUgS25vd2xlZGdlQmFzZUVudHJ5Vmlld0F0dHJzID0ge1xuXHRlbnRyeTogS25vd2xlZGdlQmFzZUVudHJ5XG5cdG9uVGVtcGxhdGVTZWxlY3RlZDogKGFyZzA6IElkVHVwbGUpID0+IHVua25vd25cblx0cmVhZG9ubHk6IGJvb2xlYW5cbn1cblxuLyoqXG4gKiAgUmVuZGVycyBvbmUga25vd2xlZGdlQmFzZSBlbnRyeVxuICovXG5leHBvcnQgY2xhc3MgS25vd2xlZGdlQmFzZUVudHJ5VmlldyBpbXBsZW1lbnRzIENvbXBvbmVudDxLbm93bGVkZ2VCYXNlRW50cnlWaWV3QXR0cnM+IHtcblx0X3Nhbml0aXplZEVudHJ5OiAoYXJnMDogS25vd2xlZGdlQmFzZUVudHJ5KSA9PiB7XG5cdFx0Y29udGVudDogc3RyaW5nXG5cdH1cblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLl9zYW5pdGl6ZWRFbnRyeSA9IG1lbW9pemVkKChlbnRyeSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Y29udGVudDogaHRtbFNhbml0aXplci5zYW5pdGl6ZUhUTUwoZW50cnkuZGVzY3JpcHRpb24sIHtcblx0XHRcdFx0XHRibG9ja0V4dGVybmFsQ29udGVudDogdHJ1ZSxcblx0XHRcdFx0fSkuaHRtbCxcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0dmlldyh7IGF0dHJzIH06IFZub2RlPEtub3dsZWRnZUJhc2VFbnRyeVZpZXdBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXCIuZmxleC5mbGV4LWNvbHVtblwiLCBbdGhpcy5fcmVuZGVyQ29udGVudChhdHRycyldKVxuXHR9XG5cblx0X3JlbmRlckNvbnRlbnQoYXR0cnM6IEtub3dsZWRnZUJhc2VFbnRyeVZpZXdBdHRycyk6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IGVudHJ5LCByZWFkb25seSB9ID0gYXR0cnNcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiXCIsXG5cdFx0XHR7XG5cdFx0XHRcdG9uY2xpY2s6IChldmVudDogTW91c2VFdmVudCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2hhbmRsZUFuY2hvckNsaWNrKGV2ZW50LCBhdHRycylcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCIuZmxleC5tdC1sLmNlbnRlci12ZXJ0aWNhbGx5LnNlbGVjdGFibGVcIixcblx0XHRcdFx0XHRtKFwiLmg0LnRleHQtZWxsaXBzaXNcIiwgZW50cnkudGl0bGUpLFxuXHRcdFx0XHRcdCFyZWFkb25seSA/IFttKFwiLmZsZXguZmxleC1ncm93Lmp1c3RpZnktZW5kXCIsIFt0aGlzLnJlbmRlckVkaXRCdXR0b24oZW50cnkpLCB0aGlzLnJlbmRlclJlbW92ZUJ1dHRvbihlbnRyeSldKV0gOiBudWxsLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFwiXCIsIFtcblx0XHRcdFx0XHRtKFwiLm10LXMuZmxleC5tdC1zLndyYXBcIiwgW1xuXHRcdFx0XHRcdFx0ZW50cnkua2V5d29yZHMubWFwKChlbnRyeUtleXdvcmQpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG0oXCIua2V5d29yZC1idWJibGUuc2VsZWN0YWJsZVwiLCBlbnRyeUtleXdvcmQua2V5d29yZClcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdG0oXCIuZmxleC5mbGV4LWNvbHVtbi5tdC1zXCIsIFttKFwiLmVkaXRvci1ib3JkZXIudGV4dC1icmVhay5zZWxlY3RhYmxlXCIsIG0udHJ1c3QodGhpcy5fc2FuaXRpemVkRW50cnkoZW50cnkpLmNvbnRlbnQpKV0pLFxuXHRcdFx0XHRdKSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJSZW1vdmVCdXR0b24oZW50cnk6IEtub3dsZWRnZUJhc2VFbnRyeSkge1xuXHRcdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHRcdHRpdGxlOiBcInJlbW92ZV9hY3Rpb25cIixcblx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0Z2V0Q29uZmlybWF0aW9uKFwiZGVsZXRlRW50cnlDb25maXJtX21zZ1wiKS5jb25maXJtZWQoKCkgPT4gbG9jYXRvci5lbnRpdHlDbGllbnQuZXJhc2UoZW50cnkpLmNhdGNoKG9mQ2xhc3MoTm90Rm91bmRFcnJvciwgbm9PcCkpKVxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJFZGl0QnV0dG9uKGVudHJ5OiBLbm93bGVkZ2VCYXNlRW50cnkpIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJlZGl0X2FjdGlvblwiLFxuXHRcdFx0aWNvbjogSWNvbnMuRWRpdCxcblx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdGltcG9ydChcIi4uLy4uL3NldHRpbmdzL0tub3dsZWRnZUJhc2VFZGl0b3IuanNcIikudGhlbigoeyBzaG93S25vd2xlZGdlQmFzZUVkaXRvciB9KSA9PiB7XG5cdFx0XHRcdFx0bG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChUZW1wbGF0ZUdyb3VwUm9vdFR5cGVSZWYsIG5ldmVyTnVsbChlbnRyeS5fb3duZXJHcm91cCkpLnRoZW4oKGdyb3VwUm9vdCkgPT4ge1xuXHRcdFx0XHRcdFx0c2hvd0tub3dsZWRnZUJhc2VFZGl0b3IoZW50cnksIGdyb3VwUm9vdClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0X2hhbmRsZUFuY2hvckNsaWNrKGV2ZW50OiBFdmVudCwgYXR0cnM6IEtub3dsZWRnZUJhc2VFbnRyeVZpZXdBdHRycyk6IHZvaWQge1xuXHRcdGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQgYXMgYW55XG5cblx0XHRpZiAodGFyZ2V0ICYmIHRhcmdldC5jbG9zZXN0KSB7XG5cdFx0XHRsZXQgYW5jaG9yRWxlbWVudCA9IHRhcmdldC5jbG9zZXN0KFwiYVwiKVxuXG5cdFx0XHRpZiAoYW5jaG9yRWxlbWVudCAmJiBzdGFydHNXaXRoKGFuY2hvckVsZW1lbnQuaHJlZiwgXCJ0dXRhdGVtcGxhdGU6XCIpKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0Y29uc3QgW2xpc3RJZCwgZWxlbWVudElkXSA9IG5ldyBVUkwoYW5jaG9yRWxlbWVudC5ocmVmKS5wYXRobmFtZS5zcGxpdChcIi9cIilcblx0XHRcdFx0YXR0cnMub25UZW1wbGF0ZVNlbGVjdGVkKFtsaXN0SWQsIGVsZW1lbnRJZF0pXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IEtub3dsZWRnZUJhc2VNb2RlbCB9IGZyb20gXCIuLi9tb2RlbC9Lbm93bGVkZ2VCYXNlTW9kZWwuanNcIlxuaW1wb3J0IHR5cGUgeyBFbWFpbFRlbXBsYXRlLCBLbm93bGVkZ2VCYXNlRW50cnkgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBLTk9XTEVER0VCQVNFX0xJU1RfRU5UUllfSEVJR0hULCBLbm93bGVkZ2VCYXNlTGlzdEVudHJ5IH0gZnJvbSBcIi4vS25vd2xlZGdlQmFzZUxpc3RFbnRyeS5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCBzdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCB7IEtub3dsZWRnZUJhc2VFbnRyeVZpZXcgfSBmcm9tIFwiLi9Lbm93bGVkZ2VCYXNlRW50cnlWaWV3LmpzXCJcbmltcG9ydCB7IE5vdEZvdW5kRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yLmpzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcbmltcG9ydCB7IFRleHRGaWVsZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IG1ha2VMaXN0U2VsZWN0aW9uQ2hhbmdlZFNjcm9sbEhhbmRsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0d1aVV0aWxzLmpzXCJcbmltcG9ydCB7IG9mQ2xhc3MgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuZXhwb3J0IHR5cGUgS25vd2xlZGdlYmFzZURpYWxvZ0NvbnRlbnRBdHRycyA9IHtcblx0cmVhZG9ubHkgb25UZW1wbGF0ZVNlbGVjdDogKGFyZzA6IEVtYWlsVGVtcGxhdGUpID0+IHZvaWRcblx0cmVhZG9ubHkgbW9kZWw6IEtub3dsZWRnZUJhc2VNb2RlbFxufVxuXG4vKipcbiAqICBSZW5kZXJzIHRoZSBTZWFyY2hCYXIgYW5kIHRoZSBwYWdlcyAobGlzdCwgZW50cnksIHRlbXBsYXRlKSBvZiB0aGUga25vd2xlZGdlQmFzZSBiZXNpZGVzIHRoZSBNYWlsRWRpdG9yXG4gKi9cbmV4cG9ydCBjbGFzcyBLbm93bGVkZ2VCYXNlRGlhbG9nQ29udGVudCBpbXBsZW1lbnRzIENvbXBvbmVudDxLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzPiB7XG5cdHByaXZhdGUgX3N0cmVhbXM6IEFycmF5PFN0cmVhbTxhbnk+PlxuXHRwcml2YXRlIGZpbHRlclZhbHVlOiBzdHJpbmcgPSBcIlwiXG5cdHByaXZhdGUgX3NlbGVjdGlvbkNoYW5nZWRMaXN0ZW5lciE6IFN0cmVhbTx2b2lkPlxuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuX3N0cmVhbXMgPSBbXVxuXHR9XG5cblx0b25jcmVhdGUoeyBhdHRycyB9OiBWbm9kZTxLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzPikge1xuXHRcdGNvbnN0IHsgbW9kZWwgfSA9IGF0dHJzXG5cblx0XHR0aGlzLl9zdHJlYW1zLnB1c2goXG5cdFx0XHRzdHJlYW0uY29tYmluZSgoKSA9PiB7XG5cdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdH0sIFttb2RlbC5zZWxlY3RlZEVudHJ5LCBtb2RlbC5maWx0ZXJlZEVudHJpZXNdKSxcblx0XHQpXG5cdH1cblxuXHRvbnJlbW92ZSgpIHtcblx0XHRmb3IgKGxldCBzdHJlYW0gb2YgdGhpcy5fc3RyZWFtcykge1xuXHRcdFx0c3RyZWFtLmVuZCh0cnVlKVxuXHRcdH1cblx0fVxuXG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCBtb2RlbCA9IGF0dHJzLm1vZGVsXG5cdFx0Y29uc3Qgc2VsZWN0ZWRFbnRyeSA9IG1vZGVsLnNlbGVjdGVkRW50cnkoKVxuXHRcdHJldHVybiBzZWxlY3RlZEVudHJ5XG5cdFx0XHQ/IG0oS25vd2xlZGdlQmFzZUVudHJ5Vmlldywge1xuXHRcdFx0XHRcdGVudHJ5OiBzZWxlY3RlZEVudHJ5LFxuXHRcdFx0XHRcdG9uVGVtcGxhdGVTZWxlY3RlZDogKHRlbXBsYXRlSWQpID0+IHtcblx0XHRcdFx0XHRcdG1vZGVsXG5cdFx0XHRcdFx0XHRcdC5sb2FkVGVtcGxhdGUodGVtcGxhdGVJZClcblx0XHRcdFx0XHRcdFx0LnRoZW4oKGZldGNoZWRUZW1wbGF0ZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGF0dHJzLm9uVGVtcGxhdGVTZWxlY3QoZmV0Y2hlZFRlbXBsYXRlKVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQuY2F0Y2gob2ZDbGFzcyhOb3RGb3VuZEVycm9yLCAoKSA9PiBEaWFsb2cubWVzc2FnZShcInRlbXBsYXRlTm90RXhpc3RzX21zZ1wiKSkpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRyZWFkb25seTogbW9kZWwuaXNSZWFkT25seShzZWxlY3RlZEVudHJ5KSxcblx0XHRcdCAgfSlcblx0XHRcdDogW1xuXHRcdFx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJmaWx0ZXJfbGFiZWxcIixcblx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLmZpbHRlclZhbHVlLFxuXHRcdFx0XHRcdFx0b25pbnB1dDogKHZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZmlsdGVyVmFsdWUgPSB2YWx1ZVxuXHRcdFx0XHRcdFx0XHRtb2RlbC5maWx0ZXIodmFsdWUpXG5cdFx0XHRcdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0dGhpcy5fcmVuZGVyS2V5d29yZHMobW9kZWwpLFxuXHRcdFx0XHRcdHRoaXMuX3JlbmRlckxpc3QobW9kZWwsIGF0dHJzKSxcblx0XHRcdCAgXVxuXHR9XG5cblx0X3JlbmRlcktleXdvcmRzKG1vZGVsOiBLbm93bGVkZ2VCYXNlTW9kZWwpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgbWF0Y2hlZEtleXdvcmRzID0gbW9kZWwuZ2V0TWF0Y2hlZEtleXdvcmRzSW5Db250ZW50KClcblx0XHRyZXR1cm4gbShcIi5mbGV4Lm10LXMud3JhcFwiLCBbXG5cdFx0XHRtYXRjaGVkS2V5d29yZHMubGVuZ3RoID4gMCA/IG0oXCIuc21hbGwuZnVsbC13aWR0aFwiLCBsYW5nLmdldChcIm1hdGNoaW5nS2V5d29yZHNfbGFiZWxcIikpIDogbnVsbCxcblx0XHRcdG1hdGNoZWRLZXl3b3Jkcy5tYXAoKGtleXdvcmQpID0+IHtcblx0XHRcdFx0cmV0dXJuIG0oXCIua2V5d29yZC1idWJibGUtbm8tcGFkZGluZy5wbHItYnV0dG9uLnBsLXMucHItcy5ib3JkZXItcmFkaXVzLm5vLXdyYXAubXItcy5taW4tY29udGVudFwiLCBrZXl3b3JkKVxuXHRcdFx0fSksXG5cdFx0XSlcblx0fVxuXG5cdF9yZW5kZXJMaXN0KG1vZGVsOiBLbm93bGVkZ2VCYXNlTW9kZWwsIGF0dHJzOiBLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIubXQtcy5zY3JvbGxcIixcblx0XHRcdHtcblx0XHRcdFx0b25jcmVhdGU6ICh2bm9kZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX3NlbGVjdGlvbkNoYW5nZWRMaXN0ZW5lciA9IG1vZGVsLnNlbGVjdGVkRW50cnkubWFwKFxuXHRcdFx0XHRcdFx0bWFrZUxpc3RTZWxlY3Rpb25DaGFuZ2VkU2Nyb2xsSGFuZGxlcihcblx0XHRcdFx0XHRcdFx0dm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50LFxuXHRcdFx0XHRcdFx0XHRLTk9XTEVER0VCQVNFX0xJU1RfRU5UUllfSEVJR0hULFxuXHRcdFx0XHRcdFx0XHRtb2RlbC5nZXRTZWxlY3RlZEVudHJ5SW5kZXguYmluZChtb2RlbCksXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdClcblx0XHRcdFx0fSxcblx0XHRcdFx0b25iZWZvcmVyZW1vdmU6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9zZWxlY3Rpb25DaGFuZ2VkTGlzdGVuZXIuZW5kKClcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdG1vZGVsLmNvbnRhaW5zUmVzdWx0KClcblx0XHRcdFx0XHQ/IG1vZGVsLmZpbHRlcmVkRW50cmllcygpLm1hcCgoZW50cnkpID0+IHRoaXMuX3JlbmRlckxpc3RFbnRyeShtb2RlbCwgZW50cnkpKVxuXHRcdFx0XHRcdDogbShcIi5jZW50ZXJcIiwgbGFuZy5nZXQoXCJub0VudHJ5Rm91bmRfbGFiZWxcIikpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRfcmVuZGVyTGlzdEVudHJ5KG1vZGVsOiBLbm93bGVkZ2VCYXNlTW9kZWwsIGVudHJ5OiBLbm93bGVkZ2VCYXNlRW50cnkpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXCIuZmxleC5mbGV4LWNvbHVtbi5jbGljay5ob3ZlcmFibGUtbGlzdC1pdGVtXCIsIFtcblx0XHRcdG0oXG5cdFx0XHRcdFwiLmZsZXhcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdG1vZGVsLnNlbGVjdGVkRW50cnkoZW50cnkpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0W1xuXHRcdFx0XHRcdG0oS25vd2xlZGdlQmFzZUxpc3RFbnRyeSwge1xuXHRcdFx0XHRcdFx0ZW50cnk6IGVudHJ5LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG0oXCJcIiwge1xuXHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0d2lkdGg6IFwiMTcuMXB4XCIsXG5cdFx0XHRcdFx0XHRcdGhlaWdodDogXCIxNnB4XCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRdLFxuXHRcdFx0KSxcblx0XHRdKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBLbm93bGVkZ2VCYXNlTW9kZWwgfSBmcm9tIFwiLi4vbW9kZWwvS25vd2xlZGdlQmFzZU1vZGVsLmpzXCJcbmltcG9ydCB7IEVkaXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2VkaXRvci9FZGl0b3IuanNcIlxuaW1wb3J0IHR5cGUgeyBLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzIH0gZnJvbSBcIi4vS25vd2xlZGdlQmFzZURpYWxvZ0NvbnRlbnQuanNcIlxuaW1wb3J0IHsgS25vd2xlZGdlQmFzZURpYWxvZ0NvbnRlbnQgfSBmcm9tIFwiLi9Lbm93bGVkZ2VCYXNlRGlhbG9nQ29udGVudC5qc1wiXG5pbXBvcnQgeyBzaG93VGVtcGxhdGVQb3B1cEluRWRpdG9yIH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRlcy92aWV3L1RlbXBsYXRlUG9wdXAuanNcIlxuaW1wb3J0IHR5cGUgeyBCdXR0b25BdHRycyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgdHlwZSB7IERpYWxvZ0hlYWRlckJhckF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9EaWFsb2dIZWFkZXJCYXIuanNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgdHlwZSB7IEtub3dsZWRnZUJhc2VFbnRyeSwgVGVtcGxhdGVHcm91cFJvb3QgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgdHlwZSB7IGxhenkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGNyZWF0ZURyb3Bkb3duIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Ecm9wZG93bi5qc1wiXG5pbXBvcnQgc3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgU3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgdHlwZSB7IERpYWxvZ0luamVjdGlvblJpZ2h0QXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZ0luamVjdGlvblJpZ2h0LmpzXCJcbmltcG9ydCB7IFRlbXBsYXRlUG9wdXBNb2RlbCB9IGZyb20gXCIuLi8uLi90ZW1wbGF0ZXMvbW9kZWwvVGVtcGxhdGVQb3B1cE1vZGVsLmpzXCJcblxuaW1wb3J0IHsgZ2V0U2hhcmVkR3JvdXBOYW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9zaGFyaW5nL0dyb3VwVXRpbHMuanNcIlxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS25vd2xlZGdlQmFzZURpYWxvZ0luamVjdGlvbihcblx0a25vd2xlZGdlQmFzZTogS25vd2xlZGdlQmFzZU1vZGVsLFxuXHR0ZW1wbGF0ZU1vZGVsOiBUZW1wbGF0ZVBvcHVwTW9kZWwsXG5cdGVkaXRvcjogRWRpdG9yLFxuKTogRGlhbG9nSW5qZWN0aW9uUmlnaHRBdHRyczxLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzPiB7XG5cdGNvbnN0IGtub3dsZWRnZWJhc2VBdHRyczogS25vd2xlZGdlYmFzZURpYWxvZ0NvbnRlbnRBdHRycyA9IHtcblx0XHRvblRlbXBsYXRlU2VsZWN0OiAodGVtcGxhdGUpID0+IHtcblx0XHRcdHNob3dUZW1wbGF0ZVBvcHVwSW5FZGl0b3IodGVtcGxhdGVNb2RlbCwgZWRpdG9yLCB0ZW1wbGF0ZSwgXCJcIilcblx0XHR9LFxuXHRcdG1vZGVsOiBrbm93bGVkZ2VCYXNlLFxuXHR9XG5cdGNvbnN0IGlzRGlhbG9nVmlzaWJsZSA9IHN0cmVhbShmYWxzZSlcblx0cmV0dXJuIHtcblx0XHR2aXNpYmxlOiBpc0RpYWxvZ1Zpc2libGUsXG5cdFx0aGVhZGVyQXR0cnM6IF9jcmVhdGVIZWFkZXJBdHRycyhrbm93bGVkZ2ViYXNlQXR0cnMsIGlzRGlhbG9nVmlzaWJsZSksXG5cdFx0Y29tcG9uZW50QXR0cnM6IGtub3dsZWRnZWJhc2VBdHRycyxcblx0XHRjb21wb25lbnQ6IEtub3dsZWRnZUJhc2VEaWFsb2dDb250ZW50LFxuXHR9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVIZWFkZXJBdHRycyhhdHRyczogS25vd2xlZGdlYmFzZURpYWxvZ0NvbnRlbnRBdHRycywgaXNEaWFsb2dWaXNpYmxlOiBTdHJlYW08Ym9vbGVhbj4pOiBsYXp5PERpYWxvZ0hlYWRlckJhckF0dHJzPiB7XG5cdHJldHVybiAoKSA9PiB7XG5cdFx0Y29uc3Qgc2VsZWN0ZWRFbnRyeSA9IGF0dHJzLm1vZGVsLnNlbGVjdGVkRW50cnkoKVxuXHRcdHJldHVybiBzZWxlY3RlZEVudHJ5ID8gY3JlYXRlRW50cnlWaWV3SGVhZGVyKHNlbGVjdGVkRW50cnksIGF0dHJzLm1vZGVsKSA6IGNyZWF0ZUxpc3RWaWV3SGVhZGVyKGF0dHJzLm1vZGVsLCBpc0RpYWxvZ1Zpc2libGUpXG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlRW50cnlWaWV3SGVhZGVyKGVudHJ5OiBLbm93bGVkZ2VCYXNlRW50cnksIG1vZGVsOiBLbm93bGVkZ2VCYXNlTW9kZWwpOiBEaWFsb2dIZWFkZXJCYXJBdHRycyB7XG5cdHJldHVybiB7XG5cdFx0bGVmdDogW1xuXHRcdFx0e1xuXHRcdFx0XHRsYWJlbDogXCJiYWNrX2FjdGlvblwiLFxuXHRcdFx0XHRjbGljazogKCkgPT4gbW9kZWwuc2VsZWN0ZWRFbnRyeShudWxsKSxcblx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHR9LFxuXHRcdF0sXG5cdFx0bWlkZGxlOiBcImtub3dsZWRnZWJhc2VfbGFiZWxcIixcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXN0Vmlld0hlYWRlcihtb2RlbDogS25vd2xlZGdlQmFzZU1vZGVsLCBpc0RpYWxvZ1Zpc2libGU6IFN0cmVhbTxib29sZWFuPik6IERpYWxvZ0hlYWRlckJhckF0dHJzIHtcblx0cmV0dXJuIHtcblx0XHRsZWZ0OiAoKSA9PiBbXG5cdFx0XHR7XG5cdFx0XHRcdGxhYmVsOiBcImNsb3NlX2FsdFwiLFxuXHRcdFx0XHRjbGljazogKCkgPT4gaXNEaWFsb2dWaXNpYmxlKGZhbHNlKSxcblx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdFx0fSxcblx0XHRdLFxuXHRcdG1pZGRsZTogXCJrbm93bGVkZ2ViYXNlX2xhYmVsXCIsXG5cdFx0cmlnaHQ6IFtjcmVhdGVBZGRCdXR0b25BdHRycyhtb2RlbCldLFxuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFkZEJ1dHRvbkF0dHJzKG1vZGVsOiBLbm93bGVkZ2VCYXNlTW9kZWwpOiBCdXR0b25BdHRycyB7XG5cdGNvbnN0IHRlbXBsYXRlR3JvdXBJbnN0YW5jZXMgPSBtb2RlbC5nZXRUZW1wbGF0ZUdyb3VwSW5zdGFuY2VzKClcblxuXHRpZiAodGVtcGxhdGVHcm91cEluc3RhbmNlcy5sZW5ndGggPT09IDEpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGFiZWw6IFwiYWRkX2FjdGlvblwiLFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0c2hvd0tub3dsZWRnZUJhc2VFZGl0b3IobnVsbCwgdGVtcGxhdGVHcm91cEluc3RhbmNlc1swXS5ncm91cFJvb3QpXG5cdFx0XHR9LFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGFiZWw6IFwiYWRkX2FjdGlvblwiLFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdFx0Y2xpY2s6IGNyZWF0ZURyb3Bkb3duKHtcblx0XHRcdFx0bGF6eUJ1dHRvbnM6ICgpID0+XG5cdFx0XHRcdFx0dGVtcGxhdGVHcm91cEluc3RhbmNlcy5tYXAoKGdyb3VwSW5zdGFuY2VzKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogbGFuZy5tYWtlVHJhbnNsYXRpb24oXCJncm91cF9uYW1lXCIsIGdldFNoYXJlZEdyb3VwTmFtZShncm91cEluc3RhbmNlcy5ncm91cEluZm8sIG1vZGVsLnVzZXJDb250cm9sbGVyLCB0cnVlKSksXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0c2hvd0tub3dsZWRnZUJhc2VFZGl0b3IobnVsbCwgZ3JvdXBJbnN0YW5jZXMuZ3JvdXBSb290KVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0fSksXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHNob3dLbm93bGVkZ2VCYXNlRWRpdG9yKGVudHJ5VG9FZGl0OiBLbm93bGVkZ2VCYXNlRW50cnkgfCBudWxsLCBncm91cFJvb3Q6IFRlbXBsYXRlR3JvdXBSb290KSB7XG5cdGltcG9ydChcIi4uLy4uL3NldHRpbmdzL0tub3dsZWRnZUJhc2VFZGl0b3IuanNcIikudGhlbigoZWRpdG9yKSA9PiB7XG5cdFx0ZWRpdG9yLnNob3dLbm93bGVkZ2VCYXNlRWRpdG9yKGVudHJ5VG9FZGl0LCBncm91cFJvb3QpXG5cdH0pXG59XG4iLCJpbXBvcnQgdHlwZSB7IEtub3dsZWRnZUJhc2VFbnRyeSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IHNlYXJjaCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9QbGFpblRleHRTZWFyY2guanNcIlxuXG5leHBvcnQgZnVuY3Rpb24ga25vd2xlZGdlQmFzZVNlYXJjaChpbnB1dDogc3RyaW5nLCBhbGxFbnRyaWVzOiBSZWFkb25seUFycmF5PEtub3dsZWRnZUJhc2VFbnRyeT4pOiBSZWFkb25seUFycmF5PEtub3dsZWRnZUJhc2VFbnRyeT4ge1xuXHRyZXR1cm4gc2VhcmNoKGlucHV0LCBhbGxFbnRyaWVzLCBbXCJ0aXRsZVwiLCBcImRlc2NyaXB0aW9uXCIsIFwia2V5d29yZHMua2V5d29yZFwiXSwgZmFsc2UpXG59XG4iLCJpbXBvcnQgdHlwZSB7IEVtYWlsVGVtcGxhdGUsIEtub3dsZWRnZUJhc2VFbnRyeSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEVtYWlsVGVtcGxhdGVUeXBlUmVmLCBLbm93bGVkZ2VCYXNlRW50cnlUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgRW50aXR5Q2xpZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudGl0eUNsaWVudC5qc1wiXG5pbXBvcnQgeyBrbm93bGVkZ2VCYXNlU2VhcmNoIH0gZnJvbSBcIi4vS25vd2xlZGdlQmFzZVNlYXJjaEZpbHRlci5qc1wiXG5pbXBvcnQgdHlwZSB7IExhbmd1YWdlQ29kZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCBzdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCB7IE9wZXJhdGlvblR5cGUsIFNoYXJlQ2FwYWJpbGl0eSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBkb3duY2FzdCwgTGF6eUxvYWRlZCwgbm9PcCwgcHJvbWlzZU1hcCwgU29ydGVkQXJyYXkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGdldEVsZW1lbnRJZCwgZ2V0RXRJZCwgZ2V0TGV0SWQsIGlzU2FtZUlkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB0eXBlIHsgVGVtcGxhdGVHcm91cEluc3RhbmNlIH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRlcy9tb2RlbC9UZW1wbGF0ZUdyb3VwTW9kZWwuanNcIlxuaW1wb3J0IHsgbG9hZFRlbXBsYXRlR3JvdXBJbnN0YW5jZSB9IGZyb20gXCIuLi8uLi90ZW1wbGF0ZXMvbW9kZWwvVGVtcGxhdGVQb3B1cE1vZGVsLmpzXCJcbmltcG9ydCB0eXBlIHsgVXNlckNvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IGhhc0NhcGFiaWxpdHlPbkdyb3VwIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9zaGFyaW5nL0dyb3VwVXRpbHMuanNcIlxuaW1wb3J0IHsgRW50aXR5VXBkYXRlRGF0YSwgaXNVcGRhdGVGb3JUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVVwZGF0ZVV0aWxzLmpzXCJcbmltcG9ydCB7IEVudGl0eUV2ZW50c0xpc3RlbmVyLCBFdmVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0V2ZW50Q29udHJvbGxlci5qc1wiXG5cbmV4cG9ydCBjb25zdCBTRUxFQ1RfTkVYVF9FTlRSWSA9IFwibmV4dFwiXG5cbmZ1bmN0aW9uIGNvbXBhcmVLbm93bGVkZ2VCYXNlRW50cmllc0ZvclNvcnQoZW50cnkxOiBLbm93bGVkZ2VCYXNlRW50cnksIGVudHJ5MjogS25vd2xlZGdlQmFzZUVudHJ5KTogbnVtYmVyIHtcblx0cmV0dXJuIGVudHJ5MS50aXRsZS5sb2NhbGVDb21wYXJlKGVudHJ5Mi50aXRsZSlcbn1cblxuLyoqXG4gKiAgIE1vZGVsIHRoYXQgaG9sZHMgbWFpbiBsb2dpYyBmb3IgdGhlIEtub3dsZWRnZWJhc2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBLbm93bGVkZ2VCYXNlTW9kZWwge1xuXHRfYWxsRW50cmllczogU29ydGVkQXJyYXk8S25vd2xlZGdlQmFzZUVudHJ5PlxuXHRmaWx0ZXJlZEVudHJpZXM6IFN0cmVhbTxSZWFkb25seUFycmF5PEtub3dsZWRnZUJhc2VFbnRyeT4+XG5cdHNlbGVjdGVkRW50cnk6IFN0cmVhbTxLbm93bGVkZ2VCYXNlRW50cnkgfCBudWxsPlxuXHRfYWxsS2V5d29yZHM6IEFycmF5PHN0cmluZz5cblx0X21hdGNoZWRLZXl3b3Jkc0luQ29udGVudDogQXJyYXk8c3RyaW5nIHwgbnVsbD5cblx0X2ZpbHRlclZhbHVlOiBzdHJpbmdcblx0cmVhZG9ubHkgX2V2ZW50Q29udHJvbGxlcjogRXZlbnRDb250cm9sbGVyXG5cdHJlYWRvbmx5IF9lbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudFxuXHRyZWFkb25seSBfZW50aXR5RXZlbnRSZWNlaXZlZDogRW50aXR5RXZlbnRzTGlzdGVuZXJcblx0X2dyb3VwSW5zdGFuY2VzOiBBcnJheTxUZW1wbGF0ZUdyb3VwSW5zdGFuY2U+XG5cdF9pbml0aWFsaXplZDogTGF6eUxvYWRlZDxLbm93bGVkZ2VCYXNlTW9kZWw+XG5cdHJlYWRvbmx5IHVzZXJDb250cm9sbGVyOiBVc2VyQ29udHJvbGxlclxuXG5cdGNvbnN0cnVjdG9yKGV2ZW50Q29udHJvbGxlcjogRXZlbnRDb250cm9sbGVyLCBlbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudCwgdXNlckNvbnRyb2xsZXI6IFVzZXJDb250cm9sbGVyKSB7XG5cdFx0dGhpcy5fZXZlbnRDb250cm9sbGVyID0gZXZlbnRDb250cm9sbGVyXG5cdFx0dGhpcy5fZW50aXR5Q2xpZW50ID0gZW50aXR5Q2xpZW50XG5cdFx0dGhpcy51c2VyQ29udHJvbGxlciA9IHVzZXJDb250cm9sbGVyXG5cdFx0dGhpcy5fYWxsRW50cmllcyA9IFNvcnRlZEFycmF5LmVtcHR5KGNvbXBhcmVLbm93bGVkZ2VCYXNlRW50cmllc0ZvclNvcnQpXG5cdFx0dGhpcy5fYWxsS2V5d29yZHMgPSBbXVxuXHRcdHRoaXMuX21hdGNoZWRLZXl3b3Jkc0luQ29udGVudCA9IFtdXG5cdFx0dGhpcy5maWx0ZXJlZEVudHJpZXMgPSBzdHJlYW0odGhpcy5fYWxsRW50cmllcy5hcnJheSlcblx0XHR0aGlzLnNlbGVjdGVkRW50cnkgPSBzdHJlYW08S25vd2xlZGdlQmFzZUVudHJ5IHwgbnVsbD4obnVsbClcblx0XHR0aGlzLl9maWx0ZXJWYWx1ZSA9IFwiXCJcblxuXHRcdHRoaXMuX2VudGl0eUV2ZW50UmVjZWl2ZWQgPSAodXBkYXRlcykgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2VudGl0eVVwZGF0ZSh1cGRhdGVzKVxuXHRcdH1cblxuXHRcdHRoaXMuX2V2ZW50Q29udHJvbGxlci5hZGRFbnRpdHlMaXN0ZW5lcih0aGlzLl9lbnRpdHlFdmVudFJlY2VpdmVkKVxuXG5cdFx0dGhpcy5fZ3JvdXBJbnN0YW5jZXMgPSBbXVxuXHRcdHRoaXMuX2FsbEtleXdvcmRzID0gW11cblx0XHR0aGlzLmZpbHRlcmVkRW50cmllcyh0aGlzLl9hbGxFbnRyaWVzLmFycmF5KVxuXHRcdHRoaXMuc2VsZWN0ZWRFbnRyeSh0aGlzLmNvbnRhaW5zUmVzdWx0KCkgPyB0aGlzLmZpbHRlcmVkRW50cmllcygpWzBdIDogbnVsbClcblx0XHR0aGlzLl9pbml0aWFsaXplZCA9IG5ldyBMYXp5TG9hZGVkKCgpID0+IHtcblx0XHRcdGNvbnN0IHRlbXBsYXRlTWVtYmVyc2hpcHMgPSB0aGlzLnVzZXJDb250cm9sbGVyLmdldFRlbXBsYXRlTWVtYmVyc2hpcHMoKVxuXG5cdFx0XHRsZXQgbmV3R3JvdXBJbnN0YW5jZXM6IFRlbXBsYXRlR3JvdXBJbnN0YW5jZVtdID0gW11cblx0XHRcdHJldHVybiBwcm9taXNlTWFwKHRlbXBsYXRlTWVtYmVyc2hpcHMsIChtZW1iZXJzaGlwKSA9PiBsb2FkVGVtcGxhdGVHcm91cEluc3RhbmNlKG1lbWJlcnNoaXAsIGVudGl0eUNsaWVudCkpXG5cdFx0XHRcdC50aGVuKChncm91cEluc3RhbmNlcykgPT4ge1xuXHRcdFx0XHRcdG5ld0dyb3VwSW5zdGFuY2VzID0gZ3JvdXBJbnN0YW5jZXNcblx0XHRcdFx0XHRyZXR1cm4gbG9hZEtub3dsZWRnZWJhc2VFbnRyaWVzKGdyb3VwSW5zdGFuY2VzLCBlbnRpdHlDbGllbnQpXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChrbm93bGVkZ2ViYXNlRW50cmllcykgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2FsbEVudHJpZXMuaW5zZXJ0QWxsKGtub3dsZWRnZWJhc2VFbnRyaWVzKVxuXG5cdFx0XHRcdFx0dGhpcy5fZ3JvdXBJbnN0YW5jZXMgPSBuZXdHcm91cEluc3RhbmNlc1xuXHRcdFx0XHRcdHRoaXMuaW5pdEFsbEtleXdvcmRzKClcblx0XHRcdFx0XHRyZXR1cm4gdGhpc1xuXHRcdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHRpbml0KCk6IFByb21pc2U8S25vd2xlZGdlQmFzZU1vZGVsPiB7XG5cdFx0cmV0dXJuIHRoaXMuX2luaXRpYWxpemVkLmdldEFzeW5jKClcblx0fVxuXG5cdGlzSW5pdGlhbGl6ZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuX2luaXRpYWxpemVkLmlzTG9hZGVkKClcblx0fVxuXG5cdGdldFRlbXBsYXRlR3JvdXBJbnN0YW5jZXMoKTogQXJyYXk8VGVtcGxhdGVHcm91cEluc3RhbmNlPiB7XG5cdFx0cmV0dXJuIHRoaXMuX2dyb3VwSW5zdGFuY2VzXG5cdH1cblxuXHRpbml0QWxsS2V5d29yZHMoKSB7XG5cdFx0dGhpcy5fYWxsS2V5d29yZHMgPSBbXVxuXHRcdHRoaXMuX21hdGNoZWRLZXl3b3Jkc0luQ29udGVudCA9IFtdXG5cblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMuX2FsbEVudHJpZXMuYXJyYXkpIHtcblx0XHRcdGZvciAoY29uc3Qga2V5d29yZCBvZiBlbnRyeS5rZXl3b3Jkcykge1xuXHRcdFx0XHR0aGlzLl9hbGxLZXl3b3Jkcy5wdXNoKGtleXdvcmQua2V5d29yZClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRpc1NlbGVjdGVkRW50cnkoZW50cnk6IEtub3dsZWRnZUJhc2VFbnRyeSk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLnNlbGVjdGVkRW50cnkoKSA9PT0gZW50cnlcblx0fVxuXG5cdGNvbnRhaW5zUmVzdWx0KCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmZpbHRlcmVkRW50cmllcygpLmxlbmd0aCA+IDBcblx0fVxuXG5cdGdldEFsbEtleXdvcmRzKCk6IEFycmF5PHN0cmluZz4ge1xuXHRcdHJldHVybiB0aGlzLl9hbGxLZXl3b3Jkcy5zb3J0KClcblx0fVxuXG5cdGdldE1hdGNoZWRLZXl3b3Jkc0luQ29udGVudCgpOiBBcnJheTxzdHJpbmcgfCBudWxsPiB7XG5cdFx0cmV0dXJuIHRoaXMuX21hdGNoZWRLZXl3b3Jkc0luQ29udGVudFxuXHR9XG5cblx0Z2V0TGFuZ3VhZ2VGcm9tVGVtcGxhdGUodGVtcGxhdGU6IEVtYWlsVGVtcGxhdGUpOiBMYW5ndWFnZUNvZGUge1xuXHRcdGNvbnN0IGNsaWVudExhbmd1YWdlID0gbGFuZy5jb2RlXG5cdFx0Y29uc3QgaGFzQ2xpZW50TGFuZ3VhZ2UgPSB0ZW1wbGF0ZS5jb250ZW50cy5zb21lKChjb250ZW50KSA9PiBjb250ZW50Lmxhbmd1YWdlQ29kZSA9PT0gY2xpZW50TGFuZ3VhZ2UpXG5cblx0XHRpZiAoaGFzQ2xpZW50TGFuZ3VhZ2UpIHtcblx0XHRcdHJldHVybiBjbGllbnRMYW5ndWFnZVxuXHRcdH1cblxuXHRcdHJldHVybiBkb3duY2FzdCh0ZW1wbGF0ZS5jb250ZW50c1swXS5sYW5ndWFnZUNvZGUpXG5cdH1cblxuXHRzb3J0RW50cmllc0J5TWF0Y2hpbmdLZXl3b3JkcyhlbWFpbENvbnRlbnQ6IHN0cmluZykge1xuXHRcdHRoaXMuX21hdGNoZWRLZXl3b3Jkc0luQ29udGVudCA9IFtdXG5cdFx0Y29uc3QgZW1haWxDb250ZW50Tm9UYWdzID0gZW1haWxDb250ZW50LnJlcGxhY2UoLyg8KFtePl0rKT4pL2dpLCBcIlwiKSAvLyByZW1vdmUgYWxsIGh0bWwgdGFnc1xuXG5cdFx0Zm9yIChjb25zdCBrZXl3b3JkIG9mIHRoaXMuX2FsbEtleXdvcmRzKSB7XG5cdFx0XHRpZiAoZW1haWxDb250ZW50Tm9UYWdzLmluY2x1ZGVzKGtleXdvcmQpKSB7XG5cdFx0XHRcdHRoaXMuX21hdGNoZWRLZXl3b3Jkc0luQ29udGVudC5wdXNoKGtleXdvcmQpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fYWxsRW50cmllcyA9IFNvcnRlZEFycmF5LmZyb20odGhpcy5fYWxsRW50cmllcy5hcnJheSwgKGEsIGIpID0+IHRoaXMuX2NvbXBhcmVFbnRyaWVzQnlNYXRjaGVkS2V5d29yZHMoYSwgYikpXG5cdFx0dGhpcy5fZmlsdGVyVmFsdWUgPSBcIlwiXG5cdFx0dGhpcy5maWx0ZXJlZEVudHJpZXModGhpcy5fYWxsRW50cmllcy5hcnJheSlcblx0fVxuXG5cdF9jb21wYXJlRW50cmllc0J5TWF0Y2hlZEtleXdvcmRzKGVudHJ5MTogS25vd2xlZGdlQmFzZUVudHJ5LCBlbnRyeTI6IEtub3dsZWRnZUJhc2VFbnRyeSk6IG51bWJlciB7XG5cdFx0Y29uc3QgZGlmZmVyZW5jZSA9IHRoaXMuX2dldE1hdGNoZWRLZXl3b3Jkc051bWJlcihlbnRyeTIpIC0gdGhpcy5fZ2V0TWF0Y2hlZEtleXdvcmRzTnVtYmVyKGVudHJ5MSlcblxuXHRcdHJldHVybiBkaWZmZXJlbmNlID09PSAwID8gY29tcGFyZUtub3dsZWRnZUJhc2VFbnRyaWVzRm9yU29ydChlbnRyeTEsIGVudHJ5MikgOiBkaWZmZXJlbmNlXG5cdH1cblxuXHRfZ2V0TWF0Y2hlZEtleXdvcmRzTnVtYmVyKGVudHJ5OiBLbm93bGVkZ2VCYXNlRW50cnkpOiBudW1iZXIge1xuXHRcdGxldCBtYXRjaGVzID0gMFxuXHRcdGZvciAoY29uc3QgayBvZiBlbnRyeS5rZXl3b3Jkcykge1xuXHRcdFx0aWYgKHRoaXMuX21hdGNoZWRLZXl3b3Jkc0luQ29udGVudC5pbmNsdWRlcyhrLmtleXdvcmQpKSB7XG5cdFx0XHRcdG1hdGNoZXMrK1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWF0Y2hlc1xuXHR9XG5cblx0ZmlsdGVyKGlucHV0OiBzdHJpbmcpOiB2b2lkIHtcblx0XHR0aGlzLl9maWx0ZXJWYWx1ZSA9IGlucHV0XG5cdFx0Y29uc3QgaW5wdXRUcmltbWVkID0gaW5wdXQudHJpbSgpXG5cblx0XHRpZiAoaW5wdXRUcmltbWVkKSB7XG5cdFx0XHR0aGlzLmZpbHRlcmVkRW50cmllcyhrbm93bGVkZ2VCYXNlU2VhcmNoKGlucHV0VHJpbW1lZCwgdGhpcy5fYWxsRW50cmllcy5hcnJheSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZmlsdGVyZWRFbnRyaWVzKHRoaXMuX2FsbEVudHJpZXMuYXJyYXkpXG5cdFx0fVxuXHR9XG5cblx0c2VsZWN0TmV4dEVudHJ5KGFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0Ly8gcmV0dXJucyB0cnVlIGlmIHNlbGVjdGlvbiBpcyBjaGFuZ2VkXG5cdFx0Y29uc3Qgc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0U2VsZWN0ZWRFbnRyeUluZGV4KClcblx0XHRjb25zdCBuZXh0SW5kZXggPSBzZWxlY3RlZEluZGV4ICsgKGFjdGlvbiA9PT0gU0VMRUNUX05FWFRfRU5UUlkgPyAxIDogLTEpXG5cblx0XHRpZiAobmV4dEluZGV4ID49IDAgJiYgbmV4dEluZGV4IDwgdGhpcy5maWx0ZXJlZEVudHJpZXMoKS5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IG5leHRTZWxlY3RlZEVudHJ5ID0gdGhpcy5maWx0ZXJlZEVudHJpZXMoKVtuZXh0SW5kZXhdXG5cdFx0XHR0aGlzLnNlbGVjdGVkRW50cnkobmV4dFNlbGVjdGVkRW50cnkpXG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0Z2V0U2VsZWN0ZWRFbnRyeUluZGV4KCk6IG51bWJlciB7XG5cdFx0Y29uc3Qgc2VsZWN0ZWRFbnRyeSA9IHRoaXMuc2VsZWN0ZWRFbnRyeSgpXG5cdFx0aWYgKHNlbGVjdGVkRW50cnkgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIC0xXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmZpbHRlcmVkRW50cmllcygpLmluZGV4T2Yoc2VsZWN0ZWRFbnRyeSlcblx0fVxuXG5cdF9yZW1vdmVGcm9tQWxsS2V5d29yZHMoa2V5d29yZDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLl9hbGxLZXl3b3Jkcy5pbmRleE9mKGtleXdvcmQpXG5cblx0XHRpZiAoaW5kZXggPiAtMSkge1xuXHRcdFx0dGhpcy5fYWxsS2V5d29yZHMuc3BsaWNlKGluZGV4LCAxKVxuXHRcdH1cblx0fVxuXG5cdGRpc3Bvc2UoKSB7XG5cdFx0dGhpcy5fZXZlbnRDb250cm9sbGVyLnJlbW92ZUVudGl0eUxpc3RlbmVyKHRoaXMuX2VudGl0eUV2ZW50UmVjZWl2ZWQpXG5cdH1cblxuXHRsb2FkVGVtcGxhdGUodGVtcGxhdGVJZDogSWRUdXBsZSk6IFByb21pc2U8RW1haWxUZW1wbGF0ZT4ge1xuXHRcdHJldHVybiB0aGlzLl9lbnRpdHlDbGllbnQubG9hZChFbWFpbFRlbXBsYXRlVHlwZVJlZiwgdGVtcGxhdGVJZClcblx0fVxuXG5cdGlzUmVhZE9ubHkoZW50cnk6IEtub3dsZWRnZUJhc2VFbnRyeSk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGluc3RhbmNlID0gdGhpcy5fZ3JvdXBJbnN0YW5jZXMuZmluZCgoaW5zdGFuY2UpID0+IGlzU2FtZUlkKGVudHJ5Ll9vd25lckdyb3VwLCBnZXRFdElkKGluc3RhbmNlLmdyb3VwKSkpXG5cblx0XHRyZXR1cm4gIWluc3RhbmNlIHx8ICFoYXNDYXBhYmlsaXR5T25Hcm91cCh0aGlzLnVzZXJDb250cm9sbGVyLnVzZXIsIGluc3RhbmNlLmdyb3VwLCBTaGFyZUNhcGFiaWxpdHkuV3JpdGUpXG5cdH1cblxuXHRfZW50aXR5VXBkYXRlKHVwZGF0ZXM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlRGF0YT4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gcHJvbWlzZU1hcCh1cGRhdGVzLCAodXBkYXRlKSA9PiB7XG5cdFx0XHRpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKEtub3dsZWRnZUJhc2VFbnRyeVR5cGVSZWYsIHVwZGF0ZSkpIHtcblx0XHRcdFx0aWYgKHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuQ1JFQVRFKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2VudGl0eUNsaWVudC5sb2FkKEtub3dsZWRnZUJhc2VFbnRyeVR5cGVSZWYsIFt1cGRhdGUuaW5zdGFuY2VMaXN0SWQsIHVwZGF0ZS5pbnN0YW5jZUlkXSkudGhlbigoZW50cnkpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX2FsbEVudHJpZXMuaW5zZXJ0KGVudHJ5KVxuXG5cdFx0XHRcdFx0XHR0aGlzLmZpbHRlcih0aGlzLl9maWx0ZXJWYWx1ZSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2UgaWYgKHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuVVBEQVRFKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2VudGl0eUNsaWVudC5sb2FkKEtub3dsZWRnZUJhc2VFbnRyeVR5cGVSZWYsIFt1cGRhdGUuaW5zdGFuY2VMaXN0SWQsIHVwZGF0ZS5pbnN0YW5jZUlkXSkudGhlbigodXBkYXRlZEVudHJ5KSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl9hbGxFbnRyaWVzLnJlbW92ZUZpcnN0KChlKSA9PiBpc1NhbWVJZChnZXRFbGVtZW50SWQoZSksIHVwZGF0ZS5pbnN0YW5jZUlkKSlcblxuXHRcdFx0XHRcdFx0dGhpcy5fYWxsRW50cmllcy5pbnNlcnQodXBkYXRlZEVudHJ5KVxuXG5cdFx0XHRcdFx0XHR0aGlzLmZpbHRlcih0aGlzLl9maWx0ZXJWYWx1ZSlcblx0XHRcdFx0XHRcdGNvbnN0IG9sZFNlbGVjdGVkRW50cnkgPSB0aGlzLnNlbGVjdGVkRW50cnkoKVxuXG5cdFx0XHRcdFx0XHRpZiAob2xkU2VsZWN0ZWRFbnRyeSAmJiBpc1NhbWVJZChvbGRTZWxlY3RlZEVudHJ5Ll9pZCwgdXBkYXRlZEVudHJ5Ll9pZCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5zZWxlY3RlZEVudHJ5KHVwZGF0ZWRFbnRyeSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2UgaWYgKHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuREVMRVRFKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkRW50cnkoKVxuXG5cdFx0XHRcdFx0aWYgKHNlbGVjdGVkICYmIGlzU2FtZUlkKGdldExldElkKHNlbGVjdGVkKSwgW3VwZGF0ZS5pbnN0YW5jZUxpc3RJZCwgdXBkYXRlLmluc3RhbmNlSWRdKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZWxlY3RlZEVudHJ5KG51bGwpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5fYWxsRW50cmllcy5yZW1vdmVGaXJzdCgoZSkgPT4gaXNTYW1lSWQoZ2V0RWxlbWVudElkKGUpLCB1cGRhdGUuaW5zdGFuY2VJZCkpXG5cblx0XHRcdFx0XHR0aGlzLmZpbHRlcih0aGlzLl9maWx0ZXJWYWx1ZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4obm9PcClcblx0fVxufVxuXG5mdW5jdGlvbiBsb2FkS25vd2xlZGdlYmFzZUVudHJpZXModGVtcGxhdGVHcm91cHM6IEFycmF5PFRlbXBsYXRlR3JvdXBJbnN0YW5jZT4sIGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50KTogUHJvbWlzZTxBcnJheTxLbm93bGVkZ2VCYXNlRW50cnk+PiB7XG5cdHJldHVybiBwcm9taXNlTWFwKHRlbXBsYXRlR3JvdXBzLCAoZ3JvdXApID0+IGVudGl0eUNsaWVudC5sb2FkQWxsKEtub3dsZWRnZUJhc2VFbnRyeVR5cGVSZWYsIGdyb3VwLmdyb3VwUm9vdC5rbm93bGVkZ2VCYXNlKSkudGhlbigoZ3JvdXBlZFRlbXBsYXRlcykgPT5cblx0XHRncm91cGVkVGVtcGxhdGVzLmZsYXQoKSxcblx0KVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBDb3VudGVyQmFkZ2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0NvdW50ZXJCYWRnZVwiXG5pbXBvcnQgeyBnZXROYXZCdXR0b25JY29uQmFja2dyb3VuZCwgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZVwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IEJ1dHRvbiwgQnV0dG9uQ29sb3IsIEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgdHlwZSB7IE1pbmltaXplZEVkaXRvciwgTWluaW1pemVkTWFpbEVkaXRvclZpZXdNb2RlbCB9IGZyb20gXCIuLi9tb2RlbC9NaW5pbWl6ZWRNYWlsRWRpdG9yVmlld01vZGVsXCJcbmltcG9ydCB7IFNhdmVFcnJvclJlYXNvbiwgU2F2ZVN0YXR1cywgU2F2ZVN0YXR1c0VudW0gfSBmcm9tIFwiLi4vbW9kZWwvTWluaW1pemVkTWFpbEVkaXRvclZpZXdNb2RlbFwiXG5pbXBvcnQgeyBweCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3NpemVcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zXCJcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL3N0eWxlc1wiXG5pbXBvcnQgeyBwcm9tcHRBbmREZWxldGVNYWlscyB9IGZyb20gXCIuL01haWxHdWlVdGlsc1wiXG5pbXBvcnQgeyBNYWlsVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IE9wZXJhdGlvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgaXNTYW1lSWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXRpbHNcIlxuaW1wb3J0IHsgbm9PcCwgcHJvbWlzZU1hcCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgRW50aXR5VXBkYXRlRGF0YSwgaXNVcGRhdGVGb3JUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVVwZGF0ZVV0aWxzLmpzXCJcbmltcG9ydCB7IEVudGl0eUV2ZW50c0xpc3RlbmVyLCBFdmVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0V2ZW50Q29udHJvbGxlci5qc1wiXG5pbXBvcnQgeyBJY29uQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IG1haWxMb2NhdG9yIH0gZnJvbSBcIi4uLy4uL21haWxMb2NhdG9yLmpzXCJcblxuY29uc3QgQ09VTlRFUl9QT1NfT0ZGU0VUID0gcHgoLTgpXG5leHBvcnQgdHlwZSBNaW5pbWl6ZWRFZGl0b3JPdmVybGF5QXR0cnMgPSB7XG5cdHZpZXdNb2RlbDogTWluaW1pemVkTWFpbEVkaXRvclZpZXdNb2RlbFxuXHRtaW5pbWl6ZWRFZGl0b3I6IE1pbmltaXplZEVkaXRvclxuXHRldmVudENvbnRyb2xsZXI6IEV2ZW50Q29udHJvbGxlclxufVxuXG5leHBvcnQgY2xhc3MgTWluaW1pemVkRWRpdG9yT3ZlcmxheSBpbXBsZW1lbnRzIENvbXBvbmVudDxNaW5pbWl6ZWRFZGl0b3JPdmVybGF5QXR0cnM+IHtcblx0X2xpc3RlbmVyOiBFbnRpdHlFdmVudHNMaXN0ZW5lclxuXHRfZXZlbnRDb250cm9sbGVyOiBFdmVudENvbnRyb2xsZXJcblxuXHRjb25zdHJ1Y3Rvcih2bm9kZTogVm5vZGU8TWluaW1pemVkRWRpdG9yT3ZlcmxheUF0dHJzPikge1xuXHRcdGNvbnN0IHsgbWluaW1pemVkRWRpdG9yLCB2aWV3TW9kZWwsIGV2ZW50Q29udHJvbGxlciB9ID0gdm5vZGUuYXR0cnNcblx0XHR0aGlzLl9ldmVudENvbnRyb2xsZXIgPSBldmVudENvbnRyb2xsZXJcblxuXHRcdHRoaXMuX2xpc3RlbmVyID0gKHVwZGF0ZXM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlRGF0YT4sIGV2ZW50T3duZXJHcm91cElkOiBJZCk6IFByb21pc2U8dW5rbm93bj4gPT4ge1xuXHRcdFx0cmV0dXJuIHByb21pc2VNYXAodXBkYXRlcywgKHVwZGF0ZSkgPT4ge1xuXHRcdFx0XHRpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKE1haWxUeXBlUmVmLCB1cGRhdGUpICYmIHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuREVMRVRFKSB7XG5cdFx0XHRcdFx0bGV0IGRyYWZ0ID0gbWluaW1pemVkRWRpdG9yLnNlbmRNYWlsTW9kZWwuZ2V0RHJhZnQoKVxuXG5cdFx0XHRcdFx0aWYgKGRyYWZ0ICYmIGlzU2FtZUlkKGRyYWZ0Ll9pZCwgW3VwZGF0ZS5pbnN0YW5jZUxpc3RJZCwgdXBkYXRlLmluc3RhbmNlSWRdKSkge1xuXHRcdFx0XHRcdFx0dmlld01vZGVsLnJlbW92ZU1pbmltaXplZEVkaXRvcihtaW5pbWl6ZWRFZGl0b3IpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGV2ZW50Q29udHJvbGxlci5hZGRFbnRpdHlMaXN0ZW5lcih0aGlzLl9saXN0ZW5lcilcblx0fVxuXG5cdG9ucmVtb3ZlKCkge1xuXHRcdHRoaXMuX2V2ZW50Q29udHJvbGxlci5yZW1vdmVFbnRpdHlMaXN0ZW5lcih0aGlzLl9saXN0ZW5lcilcblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPE1pbmltaXplZEVkaXRvck92ZXJsYXlBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBtaW5pbWl6ZWRFZGl0b3IsIHZpZXdNb2RlbCwgZXZlbnRDb250cm9sbGVyIH0gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IHN1YmplY3QgPSBtaW5pbWl6ZWRFZGl0b3Iuc2VuZE1haWxNb2RlbC5nZXRTdWJqZWN0KClcblx0XHRyZXR1cm4gbShcIi5lbGV2YXRlZC1iZy5wbC5ib3JkZXItcmFkaXVzXCIsIFtcblx0XHRcdG0oQ291bnRlckJhZGdlLCB7XG5cdFx0XHRcdGNvdW50OiB2aWV3TW9kZWwuZ2V0TWluaW1pemVkRWRpdG9ycygpLmluZGV4T2YobWluaW1pemVkRWRpdG9yKSArIDEsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0dG9wOiBDT1VOVEVSX1BPU19PRkZTRVQsXG5cdFx0XHRcdFx0cmlnaHQ6IENPVU5URVJfUE9TX09GRlNFVCxcblx0XHRcdFx0fSxcblx0XHRcdFx0Y29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uX2ljb24sXG5cdFx0XHRcdGJhY2tncm91bmQ6IGdldE5hdkJ1dHRvbkljb25CYWNrZ3JvdW5kKCksXG5cdFx0XHR9KSxcblx0XHRcdG0oXCIuZmxleC5qdXN0aWZ5LWJldHdlZW4ucGIteHMucHQteHNcIiwgW1xuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLmZsZXguY29sLmp1c3RpZnktY2VudGVyLm1pbi13aWR0aC0wLmZsZXgtZ3Jvd1wiLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHZpZXdNb2RlbC5yZW9wZW5NaW5pbWl6ZWRFZGl0b3IobWluaW1pemVkRWRpdG9yKSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdG0oXCIuYi50ZXh0LWVsbGlwc2lzXCIsIHN1YmplY3QgPyBzdWJqZWN0IDogbGFuZy5nZXQoXCJuZXdNYWlsX2FjdGlvblwiKSksXG5cdFx0XHRcdFx0XHRtKFwiLnNtYWxsLnRleHQtZWxsaXBzaXNcIiwgZ2V0U3RhdHVzTWVzc2FnZShtaW5pbWl6ZWRFZGl0b3Iuc2F2ZVN0YXR1cygpKSksXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0KSxcblx0XHRcdFx0bShcIi5mbGV4Lml0ZW1zLWNlbnRlci5qdXN0aWZ5LXJpZ2h0XCIsIFtcblx0XHRcdFx0XHQhc3R5bGVzLmlzU2luZ2xlQ29sdW1uTGF5b3V0KClcblx0XHRcdFx0XHRcdD8gbShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IFwiZWRpdF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLnJlb3Blbk1pbmltaXplZEVkaXRvcihtaW5pbWl6ZWRFZGl0b3IpLFxuXHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLkVkaXQsXG5cdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdFx0bShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHR0aXRsZTogXCJkZWxldGVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRjbGljazogKCkgPT4gdGhpcy5fb25EZWxldGVDbGlja2VkKG1pbmltaXplZEVkaXRvciwgdmlld01vZGVsKSxcblx0XHRcdFx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0dGl0bGU6IFwiY2xvc2VfYWx0XCIsXG5cdFx0XHRcdFx0XHRjbGljazogKCkgPT4gdmlld01vZGVsLnJlbW92ZU1pbmltaXplZEVkaXRvcihtaW5pbWl6ZWRFZGl0b3IpLFxuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuQ2FuY2VsLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRdKSxcblx0XHRcdF0pLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIF9vbkRlbGV0ZUNsaWNrZWQobWluaW1pemVkRWRpdG9yOiBNaW5pbWl6ZWRFZGl0b3IsIHZpZXdNb2RlbDogTWluaW1pemVkTWFpbEVkaXRvclZpZXdNb2RlbCkge1xuXHRcdGNvbnN0IG1vZGVsID0gbWluaW1pemVkRWRpdG9yLnNlbmRNYWlsTW9kZWxcblx0XHR2aWV3TW9kZWwucmVtb3ZlTWluaW1pemVkRWRpdG9yKG1pbmltaXplZEVkaXRvcilcblx0XHQvLyBvbmx5IGRlbGV0ZSBvbmNlIHNhdmUgaGFzIGZpbmlzaGVkXG5cdFx0bWluaW1pemVkRWRpdG9yLnNhdmVTdGF0dXMubWFwKGFzeW5jICh7IHN0YXR1cyB9KSA9PiB7XG5cdFx0XHRpZiAoc3RhdHVzICE9PSBTYXZlU3RhdHVzRW51bS5TYXZpbmcpIHtcblx0XHRcdFx0Y29uc3QgZHJhZnQgPSBtb2RlbC5kcmFmdFxuXG5cdFx0XHRcdGlmIChkcmFmdCkge1xuXHRcdFx0XHRcdGF3YWl0IHByb21wdEFuZERlbGV0ZU1haWxzKG1haWxMb2NhdG9yLm1haWxNb2RlbCwgW2RyYWZ0XSwgbm9PcClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0U3RhdHVzTWVzc2FnZShzYXZlU3RhdHVzOiBTYXZlU3RhdHVzKTogc3RyaW5nIHtcblx0c3dpdGNoIChzYXZlU3RhdHVzLnN0YXR1cykge1xuXHRcdGNhc2UgU2F2ZVN0YXR1c0VudW0uU2F2aW5nOlxuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwic2F2ZV9tc2dcIilcblx0XHRjYXNlIFNhdmVTdGF0dXNFbnVtLk5vdFNhdmVkOlxuXHRcdFx0c3dpdGNoIChzYXZlU3RhdHVzLnJlYXNvbikge1xuXHRcdFx0XHRjYXNlIFNhdmVFcnJvclJlYXNvbi5Db25uZWN0aW9uTG9zdDpcblx0XHRcdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJkcmFmdE5vdFNhdmVkQ29ubmVjdGlvbkxvc3RfbXNnXCIpXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwiZHJhZnROb3RTYXZlZF9tc2dcIilcblx0XHRcdH1cblx0XHRjYXNlIFNhdmVTdGF0dXNFbnVtLlNhdmVkOlxuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwiZHJhZnRTYXZlZF9tc2dcIilcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIFwiXCJcblx0fVxufVxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgcHgsIHNpemUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zaXplXCJcbmltcG9ydCB7IGRpc3BsYXlPdmVybGF5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9PdmVybGF5XCJcbmltcG9ydCB7IERlZmF1bHRBbmltYXRpb25UaW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYW5pbWF0aW9uL0FuaW1hdGlvbnNcIlxuaW1wb3J0IHsgRXZlbnRDb250cm9sbGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9FdmVudENvbnRyb2xsZXJcIlxuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc3R5bGVzXCJcbmltcG9ydCB7IExheWVyVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9Sb290Vmlld1wiXG5pbXBvcnQgdHlwZSB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB0eXBlIHsgU2VuZE1haWxNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2VuZE1haWxNb2RlbC5qc1wiXG5pbXBvcnQgdHlwZSB7IE1pbmltaXplZEVkaXRvciwgU2F2ZVN0YXR1cyB9IGZyb20gXCIuLi9tb2RlbC9NaW5pbWl6ZWRNYWlsRWRpdG9yVmlld01vZGVsXCJcbmltcG9ydCB7IE1pbmltaXplZE1haWxFZGl0b3JWaWV3TW9kZWwgfSBmcm9tIFwiLi4vbW9kZWwvTWluaW1pemVkTWFpbEVkaXRvclZpZXdNb2RlbFwiXG5pbXBvcnQgeyBNaW5pbWl6ZWRFZGl0b3JPdmVybGF5IH0gZnJvbSBcIi4vTWluaW1pemVkRWRpdG9yT3ZlcmxheVwiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudlwiXG5pbXBvcnQgU3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBub09wIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5cbmFzc2VydE1haW5Pck5vZGUoKVxuY29uc3QgTUlOSU1JWkVEX09WRVJMQVlfV0lEVEhfV0lERSA9IDM1MFxuY29uc3QgTUlOSU1JWkVEX09WRVJMQVlfV0lEVEhfU01BTEwgPSAyMjBcblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dNaW5pbWl6ZWRNYWlsRWRpdG9yKFxuXHRkaWFsb2c6IERpYWxvZyxcblx0c2VuZE1haWxNb2RlbDogU2VuZE1haWxNb2RlbCxcblx0dmlld01vZGVsOiBNaW5pbWl6ZWRNYWlsRWRpdG9yVmlld01vZGVsLFxuXHRldmVudENvbnRyb2xsZXI6IEV2ZW50Q29udHJvbGxlcixcblx0ZGlzcG9zZTogKCkgPT4gdm9pZCxcblx0c2F2ZVN0YXR1czogU3RyZWFtPFNhdmVTdGF0dXM+LFxuKTogdm9pZCB7XG5cdGxldCBjbG9zZU92ZXJsYXlGdW5jdGlvbjogKCkgPT4gdm9pZCA9IG5vT3AgLy8gd2lsbCBiZSBhc3NpZ25lZCB3aXRoIHRoZSBhY3R1YWwgY2xvc2UgZnVuY3Rpb24gd2hlbiBvdmVybGF5IGlzIHZpc2libGUuXG5cblx0Y29uc3QgbWluaW1pemVkRWRpdG9yID0gdmlld01vZGVsLm1pbmltaXplTWFpbEVkaXRvcihkaWFsb2csIHNlbmRNYWlsTW9kZWwsIGRpc3Bvc2UsIHNhdmVTdGF0dXMsICgpID0+IGNsb3NlT3ZlcmxheUZ1bmN0aW9uKCkpXG5cdC8vIG9ubHkgc2hvdyBvdmVybGF5IG9uY2UgZWRpdG9yIGlzIGdvbmVcblx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0Y2xvc2VPdmVybGF5RnVuY3Rpb24gPSBzaG93TWluaW1pemVkRWRpdG9yT3ZlcmxheSh2aWV3TW9kZWwsIG1pbmltaXplZEVkaXRvciwgZXZlbnRDb250cm9sbGVyKVxuXHR9LCBEZWZhdWx0QW5pbWF0aW9uVGltZSlcbn1cblxuZnVuY3Rpb24gc2hvd01pbmltaXplZEVkaXRvck92ZXJsYXkodmlld01vZGVsOiBNaW5pbWl6ZWRNYWlsRWRpdG9yVmlld01vZGVsLCBtaW5pbWl6ZWRFZGl0b3I6IE1pbmltaXplZEVkaXRvciwgZXZlbnRDb250cm9sbGVyOiBFdmVudENvbnRyb2xsZXIpOiAoKSA9PiB2b2lkIHtcblx0cmV0dXJuIGRpc3BsYXlPdmVybGF5KFxuXHRcdCgpID0+IGdldE92ZXJsYXlQb3NpdGlvbigpLFxuXHRcdHtcblx0XHRcdHZpZXc6ICgpID0+XG5cdFx0XHRcdG0oTWluaW1pemVkRWRpdG9yT3ZlcmxheSwge1xuXHRcdFx0XHRcdHZpZXdNb2RlbCxcblx0XHRcdFx0XHRtaW5pbWl6ZWRFZGl0b3IsXG5cdFx0XHRcdFx0ZXZlbnRDb250cm9sbGVyLFxuXHRcdFx0XHR9KSxcblx0XHR9LFxuXHRcdFwic2xpZGUtYm90dG9tXCIsXG5cdFx0dW5kZWZpbmVkLFxuXHRcdFwibWluaW1pemVkLXNoYWRvd1wiLFxuXHQpXG59XG5cbmZ1bmN0aW9uIGdldE92ZXJsYXlQb3NpdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRib3R0b206IHN0eWxlcy5pc1VzaW5nQm90dG9tTmF2aWdhdGlvbigpID8gcHgoc2l6ZS5ocGFkKSA6IHB4KHNpemUudnBhZCksXG5cdFx0Ly8gcG9zaXRpb24gd2lsbCBjaGFuZ2Ugd2l0aCB0cmFuc2xhdGVZXG5cdFx0cmlnaHQ6IHN0eWxlcy5pc1VzaW5nQm90dG9tTmF2aWdhdGlvbigpID8gcHgoc2l6ZS5ocGFkKSA6IHB4KHNpemUuaHBhZF9tZWRpdW0pLFxuXHRcdHdpZHRoOiBweChzdHlsZXMuaXNTaW5nbGVDb2x1bW5MYXlvdXQoKSA/IE1JTklNSVpFRF9PVkVSTEFZX1dJRFRIX1NNQUxMIDogTUlOSU1JWkVEX09WRVJMQVlfV0lEVEhfV0lERSksXG5cdFx0ekluZGV4OiBMYXllclR5cGUuTG93UHJpb3JpdHlPdmVybGF5LFxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCBzdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCB7IEVkaXRvciwgSW1hZ2VQYXN0ZUV2ZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvZWRpdG9yL0VkaXRvclwiXG5pbXBvcnQgdHlwZSB7IEF0dGFjaG1lbnQsIEluaXRBc1Jlc3BvbnNlQXJncywgU2VuZE1haWxNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2VuZE1haWxNb2RlbC5qc1wiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZ1wiXG5pbXBvcnQgeyBJbmZvTGluaywgbGFuZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgdHlwZSB7IE1haWxib3hEZXRhaWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L01haWxib3hNb2RlbC5qc1wiXG5pbXBvcnQgeyBjaGVja0FwcHJvdmFsU3RhdHVzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xvZ2luVXRpbHNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vQ29tbW9uTG9jYXRvclwiXG5pbXBvcnQge1xuXHRBTExPV0VEX0lNQUdFX0ZPUk1BVFMsXG5cdENvbnZlcnNhdGlvblR5cGUsXG5cdEV4dGVybmFsSW1hZ2VSdWxlLFxuXHRGZWF0dXJlVHlwZSxcblx0S2V5cyxcblx0TWFpbEF1dGhlbnRpY2F0aW9uU3RhdHVzLFxuXHRNYWlsTWV0aG9kLFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgVG9vTWFueVJlcXVlc3RzRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB0eXBlIHsgRGlhbG9nSGVhZGVyQmFyQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZ0hlYWRlckJhclwiXG5pbXBvcnQgeyBCdXR0b25UeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHsgYXR0YWNoRHJvcGRvd24sIGNyZWF0ZURyb3Bkb3duLCBEcm9wZG93bkNoaWxkQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3Bkb3duLmpzXCJcbmltcG9ydCB7IGlzQXBwLCBpc0Jyb3dzZXIsIGlzRGVza3RvcCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zXCJcbmltcG9ydCB7IEFuaW1hdGlvblByb21pc2UsIGFuaW1hdGlvbnMsIGhlaWdodCwgb3BhY2l0eSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2FuaW1hdGlvbi9BbmltYXRpb25zXCJcbmltcG9ydCB0eXBlIHsgVGV4dEZpZWxkQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyBBdXRvY29tcGxldGUsIFRleHRGaWVsZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IGNob29zZUFuZEF0dGFjaEZpbGUsIGNsZWFudXBJbmxpbmVBdHRhY2htZW50cywgY3JlYXRlQXR0YWNobWVudEJ1YmJsZUF0dHJzLCBnZXRDb25maWRlbnRpYWxTdGF0ZU1lc3NhZ2UgfSBmcm9tIFwiLi9NYWlsRWRpdG9yVmlld01vZGVsXCJcbmltcG9ydCB7IEV4cGFuZGVyUGFuZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0V4cGFuZGVyXCJcbmltcG9ydCB7IHdpbmRvd0ZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9XaW5kb3dGYWNhZGVcIlxuaW1wb3J0IHsgVXNlckVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Vc2VyRXJyb3JcIlxuaW1wb3J0IHsgc2hvd1Byb2dyZXNzRGlhbG9nIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgeyBodG1sU2FuaXRpemVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0h0bWxTYW5pdGl6ZXJcIlxuaW1wb3J0IHsgRHJvcERvd25TZWxlY3RvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcERvd25TZWxlY3Rvci5qc1wiXG5pbXBvcnQge1xuXHRDb250YWN0LFxuXHRDb250YWN0VHlwZVJlZixcblx0Y3JlYXRlVHJhbnNsYXRpb25HZXRJbixcblx0RmlsZSBhcyBUdXRhbm90YUZpbGUsXG5cdE1haWwsXG5cdE1haWxib3hQcm9wZXJ0aWVzLFxuXHRNYWlsRGV0YWlscyxcbn0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgRmlsZU9wZW5FcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9GaWxlT3BlbkVycm9yXCJcbmltcG9ydCB0eXBlIHsgbGF6eSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgY2xlYW5NYXRjaCwgZG93bmNhc3QsIGlzTm90TnVsbCwgbm9PcCwgb2ZDbGFzcywgdHlwZWRWYWx1ZXMgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGNyZWF0ZUlubGluZUltYWdlLCBpc01haWxDb250cmFzdEZpeE5lZWRlZCwgcmVwbGFjZUNpZHNXaXRoSW5saW5lSW1hZ2VzLCByZXBsYWNlSW5saW5lSW1hZ2VzV2l0aENpZHMgfSBmcm9tIFwiLi4vdmlldy9NYWlsR3VpVXRpbHNcIlxuaW1wb3J0IHsgY2xpZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0NsaWVudERldGVjdG9yXCJcbmltcG9ydCB7IGFwcGVuZEVtYWlsU2lnbmF0dXJlIH0gZnJvbSBcIi4uL3NpZ25hdHVyZS9TaWduYXR1cmVcIlxuaW1wb3J0IHsgc2hvd1RlbXBsYXRlUG9wdXBJbkVkaXRvciB9IGZyb20gXCIuLi8uLi90ZW1wbGF0ZXMvdmlldy9UZW1wbGF0ZVBvcHVwXCJcbmltcG9ydCB7IHJlZ2lzdGVyVGVtcGxhdGVTaG9ydGN1dExpc3RlbmVyIH0gZnJvbSBcIi4uLy4uL3RlbXBsYXRlcy92aWV3L1RlbXBsYXRlU2hvcnRjdXRMaXN0ZW5lclwiXG5pbXBvcnQgeyBUZW1wbGF0ZVBvcHVwTW9kZWwgfSBmcm9tIFwiLi4vLi4vdGVtcGxhdGVzL21vZGVsL1RlbXBsYXRlUG9wdXBNb2RlbFwiXG5pbXBvcnQgeyBjcmVhdGVLbm93bGVkZ2VCYXNlRGlhbG9nSW5qZWN0aW9uIH0gZnJvbSBcIi4uLy4uL2tub3dsZWRnZWJhc2Uvdmlldy9Lbm93bGVkZ2VCYXNlRGlhbG9nXCJcbmltcG9ydCB7IEtub3dsZWRnZUJhc2VNb2RlbCB9IGZyb20gXCIuLi8uLi9rbm93bGVkZ2ViYXNlL21vZGVsL0tub3dsZWRnZUJhc2VNb2RlbFwiXG5pbXBvcnQgeyBzdHlsZXMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9zdHlsZXNcIlxuaW1wb3J0IHsgc2hvd01pbmltaXplZE1haWxFZGl0b3IgfSBmcm9tIFwiLi4vdmlldy9NaW5pbWl6ZWRNYWlsRWRpdG9yT3ZlcmxheVwiXG5pbXBvcnQgeyBTYXZlRXJyb3JSZWFzb24sIFNhdmVTdGF0dXMsIFNhdmVTdGF0dXNFbnVtIH0gZnJvbSBcIi4uL21vZGVsL01pbmltaXplZE1haWxFZGl0b3JWaWV3TW9kZWxcIlxuaW1wb3J0IHsgZmlsZUxpc3RUb0FycmF5LCBGaWxlUmVmZXJlbmNlLCBpc1R1dGFub3RhRmlsZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9GaWxlVXRpbHNcIlxuaW1wb3J0IHsgcGFyc2VNYWlsdG9VcmwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvcGFyc2luZy9NYWlsQWRkcmVzc1BhcnNlclwiXG5pbXBvcnQgeyBDYW5jZWxsZWRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9DYW5jZWxsZWRFcnJvclwiXG5pbXBvcnQgeyBTaG9ydGN1dCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9LZXlNYW5hZ2VyXCJcbmltcG9ydCB7IFJlY2lwaWVudHMsIFJlY2lwaWVudFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vcmVjaXBpZW50cy9SZWNpcGllbnRcIlxuaW1wb3J0IHsgc2hvd1VzZXJFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9FcnJvckhhbmRsZXJJbXBsXCJcbmltcG9ydCB7IE1haWxSZWNpcGllbnRzVGV4dEZpZWxkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvTWFpbFJlY2lwaWVudHNUZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgZ2V0Q29udGFjdERpc3BsYXlOYW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9jb250YWN0c0Z1bmN0aW9uYWxpdHkvQ29udGFjdFV0aWxzLmpzXCJcbmltcG9ydCB7IFJlc29sdmFibGVSZWNpcGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1JlY2lwaWVudHNNb2RlbFwiXG5cbmltcG9ydCB7IGFuaW1hdGVUb29sYmFyLCBSaWNoVGV4dFRvb2xiYXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1JpY2hUZXh0VG9vbGJhci5qc1wiXG5pbXBvcnQgeyByZWFkTG9jYWxGaWxlcyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZmlsZS9GaWxlQ29udHJvbGxlclwiXG5pbXBvcnQgeyBJY29uQnV0dG9uLCBJY29uQnV0dG9uQXR0cnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb25CdXR0b24uanNcIlxuaW1wb3J0IHsgVG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25BdHRycyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvYnV0dG9ucy9Ub2dnbGVCdXR0b24uanNcIlxuaW1wb3J0IHsgQm9vdEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9Cb290SWNvbnMuanNcIlxuaW1wb3J0IHsgQnV0dG9uU2l6ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uU2l6ZS5qc1wiXG5pbXBvcnQgeyBEaWFsb2dJbmplY3Rpb25SaWdodEF0dHJzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9EaWFsb2dJbmplY3Rpb25SaWdodC5qc1wiXG5pbXBvcnQgeyBLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzIH0gZnJvbSBcIi4uLy4uL2tub3dsZWRnZWJhc2Uvdmlldy9Lbm93bGVkZ2VCYXNlRGlhbG9nQ29udGVudC5qc1wiXG5pbXBvcnQgeyBSZWNpcGllbnRzU2VhcmNoTW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvUmVjaXBpZW50c1NlYXJjaE1vZGVsLmpzXCJcbmltcG9ydCB7IGNyZWF0ZURhdGFGaWxlLCBEYXRhRmlsZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9EYXRhRmlsZS5qc1wiXG5pbXBvcnQgeyBBdHRhY2htZW50QnViYmxlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvQXR0YWNobWVudEJ1YmJsZS5qc1wiXG5pbXBvcnQgeyBDb250ZW50QmxvY2tpbmdTdGF0dXMgfSBmcm9tIFwiLi4vdmlldy9NYWlsVmlld2VyVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGNhblNlZVR1dGFMaW5rcyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvR3VpVXRpbHMuanNcIlxuaW1wb3J0IHsgQmFubmVyQnV0dG9uQXR0cnMsIEluZm9CYW5uZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0luZm9CYW5uZXIuanNcIlxuaW1wb3J0IHsgaXNDdXN0b21pemF0aW9uRW5hYmxlZEZvckN1c3RvbWVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0N1c3RvbWVyVXRpbHMuanNcIlxuaW1wb3J0IHsgaXNPZmZsaW5lRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRXJyb3JVdGlscy5qc1wiXG5pbXBvcnQgeyBUcmFuc2xhdGlvblNlcnZpY2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9TZXJ2aWNlcy5qc1wiXG5pbXBvcnQgeyBQYXNzd29yZEZpZWxkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL3Bhc3N3b3Jkcy9QYXNzd29yZEZpZWxkLmpzXCJcbmltcG9ydCB7IElubGluZUltYWdlcyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvaW5saW5lSW1hZ2VzVXRpbHMuanNcIlxuaW1wb3J0IHtcblx0Y2hlY2tBdHRhY2htZW50U2l6ZSxcblx0Y3JlYXRlTmV3Q29udGFjdCxcblx0ZGlhbG9nVGl0bGVUcmFuc2xhdGlvbktleSxcblx0Z2V0RW5hYmxlZE1haWxBZGRyZXNzZXNXaXRoVXNlcixcblx0Z2V0TWFpbEFkZHJlc3NEaXNwbGF5VGV4dCxcblx0UmVjaXBpZW50RmllbGQsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2hhcmVkTWFpbFV0aWxzLmpzXCJcbmltcG9ydCB7IG1haWxMb2NhdG9yIH0gZnJvbSBcIi4uLy4uL21haWxMb2NhdG9yLmpzXCJcblxuaW1wb3J0IHsgaGFuZGxlUmF0aW5nQnlFdmVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vcmF0aW5ncy9JbkFwcFJhdGluZ0RpYWxvZy5qc1wiXG5cbmV4cG9ydCB0eXBlIE1haWxFZGl0b3JBdHRycyA9IHtcblx0bW9kZWw6IFNlbmRNYWlsTW9kZWxcblx0ZG9CbG9ja0V4dGVybmFsQ29udGVudDogU3RyZWFtPGJvb2xlYW4+XG5cdGRvU2hvd1Rvb2xiYXI6IFN0cmVhbTxib29sZWFuPlxuXHRvbmxvYWQ/OiAoZWRpdG9yOiBFZGl0b3IpID0+IHZvaWRcblx0b25jbG9zZT86ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiBhbnlcblx0c2VsZWN0ZWROb3RpZmljYXRpb25MYW5ndWFnZTogU3RyZWFtPHN0cmluZz5cblx0ZGlhbG9nOiBsYXp5PERpYWxvZz5cblx0dGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsIHwgbnVsbFxuXHRrbm93bGVkZ2VCYXNlSW5qZWN0aW9uOiAoZWRpdG9yOiBFZGl0b3IpID0+IFByb21pc2U8RGlhbG9nSW5qZWN0aW9uUmlnaHRBdHRyczxLbm93bGVkZ2ViYXNlRGlhbG9nQ29udGVudEF0dHJzPiB8IG51bGw+XG5cdHNlYXJjaDogUmVjaXBpZW50c1NlYXJjaE1vZGVsXG5cdGFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBib29sZWFuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNYWlsRWRpdG9yQXR0cnMoXG5cdG1vZGVsOiBTZW5kTWFpbE1vZGVsLFxuXHRkb0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBib29sZWFuLFxuXHRkb0ZvY3VzRWRpdG9yT25Mb2FkOiBib29sZWFuLFxuXHRkaWFsb2c6IGxhenk8RGlhbG9nPixcblx0dGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsIHwgbnVsbCxcblx0a25vd2xlZGdlQmFzZUluamVjdGlvbjogKGVkaXRvcjogRWRpdG9yKSA9PiBQcm9taXNlPERpYWxvZ0luamVjdGlvblJpZ2h0QXR0cnM8S25vd2xlZGdlYmFzZURpYWxvZ0NvbnRlbnRBdHRycz4gfCBudWxsPixcblx0c2VhcmNoOiBSZWNpcGllbnRzU2VhcmNoTW9kZWwsXG5cdGFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBib29sZWFuLFxuKTogTWFpbEVkaXRvckF0dHJzIHtcblx0cmV0dXJuIHtcblx0XHRtb2RlbCxcblx0XHRkb0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBzdHJlYW0oZG9CbG9ja0V4dGVybmFsQ29udGVudCksXG5cdFx0ZG9TaG93VG9vbGJhcjogc3RyZWFtPGJvb2xlYW4+KGZhbHNlKSxcblx0XHRzZWxlY3RlZE5vdGlmaWNhdGlvbkxhbmd1YWdlOiBzdHJlYW0oXCJcIiksXG5cdFx0ZGlhbG9nLFxuXHRcdHRlbXBsYXRlTW9kZWwsXG5cdFx0a25vd2xlZGdlQmFzZUluamVjdGlvbjoga25vd2xlZGdlQmFzZUluamVjdGlvbixcblx0XHRzZWFyY2gsXG5cdFx0YWx3YXlzQmxvY2tFeHRlcm5hbENvbnRlbnQsXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIE1haWxFZGl0b3IgaW1wbGVtZW50cyBDb21wb25lbnQ8TWFpbEVkaXRvckF0dHJzPiB7XG5cdHByaXZhdGUgYXR0cnM6IE1haWxFZGl0b3JBdHRyc1xuXG5cdGVkaXRvcjogRWRpdG9yXG5cblx0cHJpdmF0ZSByZWFkb25seSByZWNpcGllbnRGaWVsZFRleHRzID0ge1xuXHRcdHRvOiBzdHJlYW0oXCJcIiksXG5cdFx0Y2M6IHN0cmVhbShcIlwiKSxcblx0XHRiY2M6IHN0cmVhbShcIlwiKSxcblx0fVxuXG5cdG1lbnRpb25lZElubGluZUltYWdlczogQXJyYXk8c3RyaW5nPlxuXHRpbmxpbmVJbWFnZUVsZW1lbnRzOiBBcnJheTxIVE1MRWxlbWVudD5cblx0dGVtcGxhdGVNb2RlbDogVGVtcGxhdGVQb3B1cE1vZGVsIHwgbnVsbFxuXHRrbm93bGVkZ2VCYXNlSW5qZWN0aW9uOiBEaWFsb2dJbmplY3Rpb25SaWdodEF0dHJzPEtub3dsZWRnZWJhc2VEaWFsb2dDb250ZW50QXR0cnM+IHwgbnVsbCA9IG51bGxcblx0c2VuZE1haWxNb2RlbDogU2VuZE1haWxNb2RlbFxuXHRwcml2YXRlIGFyZURldGFpbHNFeHBhbmRlZDogYm9vbGVhblxuXHRwcml2YXRlIHJlY2lwaWVudFNob3dDb25maWRlbnRpYWw6IE1hcDxzdHJpbmcsIGJvb2xlYW4+ID0gbmV3IE1hcCgpXG5cdHByaXZhdGUgYmxvY2tFeHRlcm5hbENvbnRlbnQ6IGJvb2xlYW5cblx0cHJpdmF0ZSByZWFkb25seSBhbHdheXNCbG9ja0V4dGVybmFsQ29udGVudDogYm9vbGVhbiA9IGZhbHNlXG5cdC8vIGlmIHdlJ3JlIHNldCB0byBibG9jayBleHRlcm5hbCBjb250ZW50LCBidXQgdGhlcmUgaXMgbm8gY29udGVudCB0byBibG9jayxcblx0Ly8gd2UgZG9uJ3Qgd2FudCB0byBzaG93IHRoZSBiYW5uZXIuXG5cdHByaXZhdGUgYmxvY2tlZEV4dGVybmFsQ29udGVudDogbnVtYmVyID0gMFxuXG5cdGNvbnN0cnVjdG9yKHZub2RlOiBWbm9kZTxNYWlsRWRpdG9yQXR0cnM+KSB7XG5cdFx0Y29uc3QgYSA9IHZub2RlLmF0dHJzXG5cdFx0dGhpcy5hdHRycyA9IGFcblx0XHR0aGlzLmlubGluZUltYWdlRWxlbWVudHMgPSBbXVxuXHRcdHRoaXMubWVudGlvbmVkSW5saW5lSW1hZ2VzID0gW11cblx0XHRjb25zdCBtb2RlbCA9IGEubW9kZWxcblx0XHR0aGlzLnNlbmRNYWlsTW9kZWwgPSBtb2RlbFxuXHRcdHRoaXMudGVtcGxhdGVNb2RlbCA9IGEudGVtcGxhdGVNb2RlbFxuXHRcdHRoaXMuYmxvY2tFeHRlcm5hbENvbnRlbnQgPSBhLmRvQmxvY2tFeHRlcm5hbENvbnRlbnQoKVxuXHRcdHRoaXMuYWx3YXlzQmxvY2tFeHRlcm5hbENvbnRlbnQgPSBhLmFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50XG5cblx0XHQvLyBpZiB3ZSBoYXZlIGFueSBDQy9CQ0MgcmVjaXBpZW50cywgd2Ugc2hvdWxkIHNob3cgdGhlc2Ugc28sIHNob3VsZCB0aGUgdXNlciBzZW5kIHRoZSBtYWlsLCB0aGV5IGtub3cgd2hlcmUgaXQgd2lsbCBiZSBnb2luZyB0b1xuXHRcdHRoaXMuYXJlRGV0YWlsc0V4cGFuZGVkID0gbW9kZWwuYmNjUmVjaXBpZW50cygpLmxlbmd0aCArIG1vZGVsLmNjUmVjaXBpZW50cygpLmxlbmd0aCA+IDBcblxuXHRcdHRoaXMuZWRpdG9yID0gbmV3IEVkaXRvcihcblx0XHRcdDIwMCxcblx0XHRcdChodG1sLCBpc1Bhc3RlKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHNhbml0aXplZCA9IGh0bWxTYW5pdGl6ZXIuc2FuaXRpemVGcmFnbWVudChodG1sLCB7XG5cdFx0XHRcdFx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6ICFpc1Bhc3RlICYmIHRoaXMuYmxvY2tFeHRlcm5hbENvbnRlbnQsXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHRoaXMuYmxvY2tlZEV4dGVybmFsQ29udGVudCA9IHNhbml0aXplZC5ibG9ja2VkRXh0ZXJuYWxDb250ZW50XG5cblx0XHRcdFx0dGhpcy5tZW50aW9uZWRJbmxpbmVJbWFnZXMgPSBzYW5pdGl6ZWQuaW5saW5lSW1hZ2VDaWRzXG5cdFx0XHRcdHJldHVybiBzYW5pdGl6ZWQuZnJhZ21lbnRcblx0XHRcdH0sXG5cdFx0XHRudWxsLFxuXHRcdClcblxuXHRcdGNvbnN0IG9uRWRpdG9yQ2hhbmdlZCA9ICgpID0+IHtcblx0XHRcdGNsZWFudXBJbmxpbmVBdHRhY2htZW50cyh0aGlzLmVkaXRvci5nZXRET00oKSwgdGhpcy5pbmxpbmVJbWFnZUVsZW1lbnRzLCBtb2RlbC5nZXRBdHRhY2htZW50cygpKVxuXHRcdFx0bW9kZWwubWFya0FzQ2hhbmdlZElmTmVjZXNzYXJ5KHRydWUpXG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fVxuXG5cdFx0Ly8gY2FsbCB0aGlzIGFzeW5jIGJlY2F1c2UgdGhlIGVkaXRvciBpcyBub3QgaW5pdGlhbGl6ZWQgYmVmb3JlIHRoaXMgbWFpbCBlZGl0b3IgZGlhbG9nIGlzIHNob3duXG5cdFx0dGhpcy5lZGl0b3IuaW5pdGlhbGl6ZWQucHJvbWlzZS50aGVuKCgpID0+IHtcblx0XHRcdHRoaXMuZWRpdG9yLnNldEhUTUwobW9kZWwuZ2V0Qm9keSgpKVxuXG5cdFx0XHRjb25zdCBlZGl0b3JEb20gPSB0aGlzLmVkaXRvci5nZXRET00oKVxuXHRcdFx0Y29uc3QgY29udHJhc3RGaXhOZWVkZWQgPSBpc01haWxDb250cmFzdEZpeE5lZWRlZChlZGl0b3JEb20pXG5cdFx0XHQvLyBJZiBtYWlsIGJvZHkgY2Fubm90IGJlIGRpc3BsYXllZCBhcy1pcyBvbiB0aGUgZGFyayBiYWNrZ3JvdW5kIHRoZW4gYXBwbHkgdGhlIGJhY2tncm91bmQgYW5kIHRleHQgY29sb3Jcblx0XHRcdC8vIGZpeC4gVGhpcyBjbGFzcyB3aWxsIGNoYW5nZSB0dXRhbm90YS1xdW90ZSdzIGluc2lkZSBvZiBpdC5cblx0XHRcdGlmIChjb250cmFzdEZpeE5lZWRlZCkge1xuXHRcdFx0XHRlZGl0b3JEb20uY2xhc3NMaXN0LmFkZChcImJnLWZpeC1xdW90ZWRcIilcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5wcm9jZXNzSW5saW5lSW1hZ2VzKClcblxuXHRcdFx0Ly8gQWRkIG11dGF0aW9uIG9ic2VydmVyIHRvIHJlbW92ZSBhdHRhY2htZW50cyB3aGVuIGNvcnJlc3BvbmRpbmcgRE9NIGVsZW1lbnQgaXMgcmVtb3ZlZFxuXHRcdFx0bmV3IE11dGF0aW9uT2JzZXJ2ZXIob25FZGl0b3JDaGFuZ2VkKS5vYnNlcnZlKHRoaXMuZWRpdG9yLmdldERPTSgpLCB7XG5cdFx0XHRcdGF0dHJpYnV0ZXM6IGZhbHNlLFxuXHRcdFx0XHRjaGlsZExpc3Q6IHRydWUsXG5cdFx0XHRcdHN1YnRyZWU6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0Ly8gc2luY2UgdGhlIGVkaXRvciBpcyB0aGUgc291cmNlIGZvciB0aGUgYm9keSB0ZXh0LCB0aGUgbW9kZWwgd29uJ3Qga25vdyBpZiB0aGUgYm9keSBoYXMgY2hhbmdlZCB1bmxlc3Mgd2UgdGVsbCBpdFxuXHRcdFx0dGhpcy5lZGl0b3IuYWRkQ2hhbmdlTGlzdGVuZXIoKCkgPT4gbW9kZWwuc2V0Qm9keShyZXBsYWNlSW5saW5lSW1hZ2VzV2l0aENpZHModGhpcy5lZGl0b3IuZ2V0RE9NKCkpLmlubmVySFRNTCkpXG5cdFx0XHR0aGlzLmVkaXRvci5hZGRFdmVudExpc3RlbmVyKFwicGFzdGVJbWFnZVwiLCAoeyBkZXRhaWwgfTogSW1hZ2VQYXN0ZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGl0ZW1zID0gQXJyYXkuZnJvbShkZXRhaWwuY2xpcGJvYXJkRGF0YS5pdGVtcylcblx0XHRcdFx0Y29uc3QgaW1hZ2VJdGVtcyA9IGl0ZW1zLmZpbHRlcigoaXRlbSkgPT4gL2ltYWdlLy50ZXN0KGl0ZW0udHlwZSkpXG5cdFx0XHRcdGlmICghaW1hZ2VJdGVtcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBmaWxlID0gaW1hZ2VJdGVtc1swXT8uZ2V0QXNGaWxlKClcblx0XHRcdFx0aWYgKGZpbGUgPT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcblx0XHRcdFx0cmVhZGVyLm9ubG9hZCA9ICgpID0+IHtcblx0XHRcdFx0XHRpZiAocmVhZGVyLnJlc3VsdCA9PSBudWxsIHx8IFwic3RyaW5nXCIgPT09IHR5cGVvZiByZWFkZXIucmVzdWx0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgbmV3SW5saW5lSW1hZ2VzID0gW2NyZWF0ZURhdGFGaWxlKGZpbGUubmFtZSwgZmlsZS50eXBlLCBuZXcgVWludDhBcnJheShyZWFkZXIucmVzdWx0KSldXG5cdFx0XHRcdFx0bW9kZWwuYXR0YWNoRmlsZXMobmV3SW5saW5lSW1hZ2VzKVxuXHRcdFx0XHRcdHRoaXMuaW5zZXJ0SW5saW5lSW1hZ2VzKG1vZGVsLCBuZXdJbmxpbmVJbWFnZXMpXG5cdFx0XHRcdH1cblx0XHRcdFx0cmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpXG5cdFx0XHR9KVxuXG5cdFx0XHRpZiAoYS50ZW1wbGF0ZU1vZGVsKSB7XG5cdFx0XHRcdGEudGVtcGxhdGVNb2RlbC5pbml0KCkudGhlbigodGVtcGxhdGVNb2RlbCkgPT4ge1xuXHRcdFx0XHRcdC8vIGFkZCB0aGlzIGV2ZW50IGxpc3RlbmVyIHRvIGhhbmRsZSBxdWljayBzZWxlY3Rpb24gb2YgdGVtcGxhdGVzIGluc2lkZSB0aGUgZWRpdG9yXG5cdFx0XHRcdFx0cmVnaXN0ZXJUZW1wbGF0ZVNob3J0Y3V0TGlzdGVuZXIodGhpcy5lZGl0b3IsIHRlbXBsYXRlTW9kZWwpXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdG1vZGVsLm9uTWFpbENoYW5nZWQubWFwKCgpID0+IG0ucmVkcmF3KCkpXG5cdFx0Ly8gTGVmdG92ZXIgdGV4dCBpbiByZWNpcGllbnQgZmllbGQgaXMgYW4gZXJyb3Jcblx0XHRtb2RlbC5zZXRPbkJlZm9yZVNlbmRGdW5jdGlvbigoKSA9PiB7XG5cdFx0XHRsZXQgaW52YWxpZFRleHQgPSBcIlwiXG5cdFx0XHRmb3IgKGNvbnN0IGxlZnRvdmVyVGV4dCBvZiB0eXBlZFZhbHVlcyh0aGlzLnJlY2lwaWVudEZpZWxkVGV4dHMpKSB7XG5cdFx0XHRcdGlmIChsZWZ0b3ZlclRleHQoKS50cmltKCkgIT09IFwiXCIpIHtcblx0XHRcdFx0XHRpbnZhbGlkVGV4dCArPSBcIlxcblwiICsgbGVmdG92ZXJUZXh0KCkudHJpbSgpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGludmFsaWRUZXh0ICE9PSBcIlwiKSB7XG5cdFx0XHRcdHRocm93IG5ldyBVc2VyRXJyb3IobGFuZy5tYWtlVHJhbnNsYXRpb24oXCJpbnZhbGlkUmVjaXBpZW50c19tc2dcIiwgbGFuZy5nZXQoXCJpbnZhbGlkUmVjaXBpZW50c19tc2dcIikgKyBpbnZhbGlkVGV4dCkpXG5cdFx0XHR9XG5cdFx0fSlcblx0XHRjb25zdCBkaWFsb2cgPSBhLmRpYWxvZygpXG5cblx0XHRpZiAobW9kZWwuZ2V0Q29udmVyc2F0aW9uVHlwZSgpID09PSBDb252ZXJzYXRpb25UeXBlLlJFUExZIHx8IG1vZGVsLnRvUmVjaXBpZW50cygpLmxlbmd0aCkge1xuXHRcdFx0ZGlhbG9nLnNldEZvY3VzT25Mb2FkRnVuY3Rpb24oKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmVkaXRvci5pbml0aWFsaXplZC5wcm9taXNlLnRoZW4oKCkgPT4gdGhpcy5lZGl0b3IuZm9jdXMoKSlcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2hvcnRjdXRzOiBTaG9ydGN1dFtdID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuU1BBQ0UsXG5cdFx0XHRcdGN0cmxPckNtZDogdHJ1ZSxcblx0XHRcdFx0ZXhlYzogKCkgPT4gdGhpcy5vcGVuVGVtcGxhdGVzKCksXG5cdFx0XHRcdGhlbHA6IFwib3BlblRlbXBsYXRlUG9wdXBfbXNnXCIsXG5cdFx0XHR9LCAvLyBCIChib2xkKSwgSSAoaXRhbGljKSwgYW5kIFUgKHVuZGVybGluZSkgYXJlIGhhbmRsZWQgYnkgc3F1aXJlXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5CLFxuXHRcdFx0XHRjdHJsT3JDbWQ6IHRydWUsXG5cdFx0XHRcdGV4ZWM6IG5vT3AsXG5cdFx0XHRcdGhlbHA6IFwiZm9ybWF0VGV4dEJvbGRfbXNnXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuSSxcblx0XHRcdFx0Y3RybE9yQ21kOiB0cnVlLFxuXHRcdFx0XHRleGVjOiBub09wLFxuXHRcdFx0XHRoZWxwOiBcImZvcm1hdFRleHRJdGFsaWNfbXNnXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVSxcblx0XHRcdFx0Y3RybE9yQ21kOiB0cnVlLFxuXHRcdFx0XHRleGVjOiBub09wLFxuXHRcdFx0XHRoZWxwOiBcImZvcm1hdFRleHRVbmRlcmxpbmVfbXNnXCIsXG5cdFx0XHR9LFxuXHRcdF1cblx0XHRmb3IgKGNvbnN0IHNob3J0Y3V0IG9mIHNob3J0Y3V0cykge1xuXHRcdFx0ZGlhbG9nLmFkZFNob3J0Y3V0KHNob3J0Y3V0KVxuXHRcdH1cblx0XHR0aGlzLmVkaXRvci5pbml0aWFsaXplZC5wcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0YS5rbm93bGVkZ2VCYXNlSW5qZWN0aW9uKHRoaXMuZWRpdG9yKS50aGVuKChpbmplY3Rpb24pID0+IHtcblx0XHRcdFx0dGhpcy5rbm93bGVkZ2VCYXNlSW5qZWN0aW9uID0gaW5qZWN0aW9uXG5cdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdH0pXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgZG93bmxvYWRJbmxpbmVJbWFnZShtb2RlbDogU2VuZE1haWxNb2RlbCwgY2lkOiBzdHJpbmcpIHtcblx0XHRjb25zdCB0dXRhbm90YUZpbGVzID0gbW9kZWwuZ2V0QXR0YWNobWVudHMoKS5maWx0ZXIoKGF0dGFjaG1lbnQpID0+IGlzVHV0YW5vdGFGaWxlKGF0dGFjaG1lbnQpKVxuXHRcdGNvbnN0IGlubGluZUF0dGFjaG1lbnQgPSB0dXRhbm90YUZpbGVzLmZpbmQoKGF0dGFjaG1lbnQpID0+IGF0dGFjaG1lbnQuY2lkID09PSBjaWQpXG5cblx0XHRpZiAoaW5saW5lQXR0YWNobWVudCAmJiBpc1R1dGFub3RhRmlsZShpbmxpbmVBdHRhY2htZW50KSkge1xuXHRcdFx0bG9jYXRvci5maWxlQ29udHJvbGxlci5vcGVuKGlubGluZUF0dGFjaG1lbnQpLmNhdGNoKG9mQ2xhc3MoRmlsZU9wZW5FcnJvciwgKCkgPT4gRGlhbG9nLm1lc3NhZ2UoXCJjYW5Ob3RPcGVuRmlsZU9uRGV2aWNlX21zZ1wiKSkpXG5cdFx0fVxuXHR9XG5cblx0dmlldyh2bm9kZTogVm5vZGU8TWFpbEVkaXRvckF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCBhID0gdm5vZGUuYXR0cnNcblx0XHR0aGlzLmF0dHJzID0gYVxuXHRcdGNvbnN0IHsgbW9kZWwgfSA9IGFcblx0XHR0aGlzLnNlbmRNYWlsTW9kZWwgPSBtb2RlbFxuXG5cdFx0Y29uc3Qgc2hvd0NvbmZpZGVudGlhbEJ1dHRvbiA9IG1vZGVsLmNvbnRhaW5zRXh0ZXJuYWxSZWNpcGllbnRzKClcblx0XHRjb25zdCBpc0NvbmZpZGVudGlhbCA9IG1vZGVsLmlzQ29uZmlkZW50aWFsKCkgJiYgc2hvd0NvbmZpZGVudGlhbEJ1dHRvblxuXHRcdGNvbnN0IGNvbmZpZGVudGlhbEJ1dHRvbkF0dHJzOiBUb2dnbGVCdXR0b25BdHRycyA9IHtcblx0XHRcdHRpdGxlOiBcImNvbmZpZGVudGlhbF9hY3Rpb25cIixcblx0XHRcdG9uVG9nZ2xlZDogKF8sIGUpID0+IHtcblx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRtb2RlbC5zZXRDb25maWRlbnRpYWwoIW1vZGVsLmlzQ29uZmlkZW50aWFsKCkpXG5cdFx0XHR9LFxuXHRcdFx0aWNvbjogbW9kZWwuaXNDb25maWRlbnRpYWwoKSA/IEljb25zLkxvY2sgOiBJY29ucy5VbmxvY2ssXG5cdFx0XHR0b2dnbGVkOiBtb2RlbC5pc0NvbmZpZGVudGlhbCgpLFxuXHRcdFx0c2l6ZTogQnV0dG9uU2l6ZS5Db21wYWN0LFxuXHRcdH1cblx0XHRjb25zdCBhdHRhY2hGaWxlc0J1dHRvbkF0dHJzOiBJY29uQnV0dG9uQXR0cnMgPSB7XG5cdFx0XHR0aXRsZTogXCJhdHRhY2hGaWxlc19hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoZXYsIGRvbSkgPT4gY2hvb3NlQW5kQXR0YWNoRmlsZShtb2RlbCwgZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKS50aGVuKCgpID0+IG0ucmVkcmF3KCkpLFxuXHRcdFx0aWNvbjogSWNvbnMuQXR0YWNobWVudCxcblx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHR9XG5cdFx0Y29uc3QgcGxhaW50ZXh0Rm9ybWF0dGluZyA9IGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMuc2VuZFBsYWludGV4dE9ubHlcblx0XHR0aGlzLmVkaXRvci5zZXRDcmVhdGVzTGlzdHMoIXBsYWludGV4dEZvcm1hdHRpbmcpXG5cblx0XHRjb25zdCB0b29sYmFyQnV0dG9uID0gKCkgPT5cblx0XHRcdCFwbGFpbnRleHRGb3JtYXR0aW5nXG5cdFx0XHRcdD8gbShUb2dnbGVCdXR0b24sIHtcblx0XHRcdFx0XHRcdHRpdGxlOiBcInNob3dSaWNoVGV4dFRvb2xiYXJfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRpY29uOiBJY29ucy5Gb250U2l6ZSxcblx0XHRcdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0XHRcdHRvZ2dsZWQ6IGEuZG9TaG93VG9vbGJhcigpLFxuXHRcdFx0XHRcdFx0b25Ub2dnbGVkOiAoXywgZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRhLmRvU2hvd1Rvb2xiYXIoIWEuZG9TaG93VG9vbGJhcigpKVxuXHRcdFx0XHRcdFx0XHQvLyBTdG9wIHRoZSBzdWJqZWN0IGJhciBmcm9tIGJlaW5nIGZvY3VzZWRcblx0XHRcdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdFx0XHR0aGlzLmVkaXRvci5mb2N1cygpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogbnVsbFxuXG5cdFx0Y29uc3Qgc3ViamVjdEZpZWxkQXR0cnM6IFRleHRGaWVsZEF0dHJzID0ge1xuXHRcdFx0bGFiZWw6IFwic3ViamVjdF9sYWJlbFwiLFxuXHRcdFx0aGVscExhYmVsOiAoKSA9PiBnZXRDb25maWRlbnRpYWxTdGF0ZU1lc3NhZ2UobW9kZWwuaXNDb25maWRlbnRpYWwoKSksXG5cdFx0XHR2YWx1ZTogbW9kZWwuZ2V0U3ViamVjdCgpLFxuXHRcdFx0b25pbnB1dDogKHZhbCkgPT4gbW9kZWwuc2V0U3ViamVjdCh2YWwpLFxuXHRcdFx0aW5qZWN0aW9uc1JpZ2h0OiAoKSA9PlxuXHRcdFx0XHRtKFwiLmZsZXguZW5kLm1sLWJldHdlZW4tcy5pdGVtcy1jZW50ZXJcIiwgW1xuXHRcdFx0XHRcdHNob3dDb25maWRlbnRpYWxCdXR0b24gPyBtKFRvZ2dsZUJ1dHRvbiwgY29uZmlkZW50aWFsQnV0dG9uQXR0cnMpIDogbnVsbCxcblx0XHRcdFx0XHR0aGlzLmtub3dsZWRnZUJhc2VJbmplY3Rpb24gPyB0aGlzLnJlbmRlclRvZ2dsZUtub3dsZWRnZUJhc2UodGhpcy5rbm93bGVkZ2VCYXNlSW5qZWN0aW9uKSA6IG51bGwsXG5cdFx0XHRcdFx0bShJY29uQnV0dG9uLCBhdHRhY2hGaWxlc0J1dHRvbkF0dHJzKSxcblx0XHRcdFx0XHR0b29sYmFyQnV0dG9uKCksXG5cdFx0XHRcdF0pLFxuXHRcdH1cblxuXHRcdGNvbnN0IGF0dGFjaG1lbnRCdWJibGVBdHRycyA9IGNyZWF0ZUF0dGFjaG1lbnRCdWJibGVBdHRycyhtb2RlbCwgdGhpcy5pbmxpbmVJbWFnZUVsZW1lbnRzKVxuXG5cdFx0bGV0IGVkaXRDdXN0b21Ob3RpZmljYXRpb25NYWlsQXR0cnM6IEljb25CdXR0b25BdHRycyB8IG51bGwgPSBudWxsXG5cblx0XHRpZiAobG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc0dsb2JhbEFkbWluKCkpIHtcblx0XHRcdGVkaXRDdXN0b21Ob3RpZmljYXRpb25NYWlsQXR0cnMgPSBhdHRhY2hEcm9wZG93bih7XG5cdFx0XHRcdG1haW5CdXR0b25BdHRyczoge1xuXHRcdFx0XHRcdHRpdGxlOiBcIm1vcmVfbGFiZWxcIixcblx0XHRcdFx0XHRpY29uOiBJY29ucy5Nb3JlLFxuXHRcdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0fSxcblx0XHRcdFx0Y2hpbGRBdHRyczogKCkgPT4gW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcImFkZF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9zZXR0aW5ncy9FZGl0Tm90aWZpY2F0aW9uRW1haWxEaWFsb2cuanNcIikudGhlbigoeyBzaG93QWRkT3JFZGl0Tm90aWZpY2F0aW9uRW1haWxEaWFsb2cgfSkgPT5cblx0XHRcdFx0XHRcdFx0XHRzaG93QWRkT3JFZGl0Tm90aWZpY2F0aW9uRW1haWxEaWFsb2cobG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKSksXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJlZGl0X2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0aW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL3NldHRpbmdzL0VkaXROb3RpZmljYXRpb25FbWFpbERpYWxvZy5qc1wiKS50aGVuKCh7IHNob3dBZGRPckVkaXROb3RpZmljYXRpb25FbWFpbERpYWxvZyB9KSA9PlxuXHRcdFx0XHRcdFx0XHRcdHNob3dBZGRPckVkaXROb3RpZmljYXRpb25FbWFpbERpYWxvZyhsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLCBtb2RlbC5nZXRTZWxlY3RlZE5vdGlmaWNhdGlvbkxhbmd1YWdlQ29kZSgpKSxcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRdLFxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRyZXR1cm4gbShcblx0XHRcdFwiI21haWwtZWRpdG9yLmZ1bGwtaGVpZ2h0LnRleHQudG91Y2gtY2FsbG91dC5mbGV4LmZsZXgtY29sdW1uXCIsXG5cdFx0XHR7XG5cdFx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0aWYgKGUudGFyZ2V0ID09PSB0aGlzLmVkaXRvci5nZXRET00oKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5lZGl0b3IuZm9jdXMoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0b25kcmFnb3ZlcjogKGV2OiBEcmFnRXZlbnQpID0+IHtcblx0XHRcdFx0XHQvLyBkbyBub3QgY2hlY2sgdGhlIGRhdGEgdHJhbnNmZXIgaGVyZSBiZWNhdXNlIGl0IGlzIG5vdCBhbHdheXMgZmlsbGVkLCBlLmcuIGluIFNhZmFyaVxuXHRcdFx0XHRcdGV2LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0ZXYucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbmRyb3A6IChldjogRHJhZ0V2ZW50KSA9PiB7XG5cdFx0XHRcdFx0aWYgKGV2LmRhdGFUcmFuc2Zlcj8uZmlsZXMgJiYgZXYuZGF0YVRyYW5zZmVyLmZpbGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGxldCBuYXRpdmVGaWxlcyA9IGZpbGVMaXN0VG9BcnJheShldi5kYXRhVHJhbnNmZXIuZmlsZXMpXG5cdFx0XHRcdFx0XHRyZWFkTG9jYWxGaWxlcyhuYXRpdmVGaWxlcylcblx0XHRcdFx0XHRcdFx0LnRoZW4oKGRhdGFGaWxlcykgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdG1vZGVsLmF0dGFjaEZpbGVzKGRhdGFGaWxlcyBhcyBhbnkpXG5cdFx0XHRcdFx0XHRcdFx0bS5yZWRyYXcoKVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQuY2F0Y2goKGUpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhlKVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBEaWFsb2cubWVzc2FnZShcImNvdWxkTm90QXR0YWNoRmlsZV9tc2dcIilcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdGV2LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHRldi5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0bShcIi5yZWxcIiwgdGhpcy5yZW5kZXJSZWNpcGllbnRGaWVsZChSZWNpcGllbnRGaWVsZC5UTywgdGhpcy5yZWNpcGllbnRGaWVsZFRleHRzLnRvLCBhLnNlYXJjaCkpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnJlbFwiLFxuXHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRFeHBhbmRlclBhbmVsLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRleHBhbmRlZDogdGhpcy5hcmVEZXRhaWxzRXhwYW5kZWQsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bShcIi5kZXRhaWxzXCIsIFtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJSZWNpcGllbnRGaWVsZChSZWNpcGllbnRGaWVsZC5DQywgdGhpcy5yZWNpcGllbnRGaWVsZFRleHRzLmNjLCBhLnNlYXJjaCksXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVuZGVyUmVjaXBpZW50RmllbGQoUmVjaXBpZW50RmllbGQuQkNDLCB0aGlzLnJlY2lwaWVudEZpZWxkVGV4dHMuYmNjLCBhLnNlYXJjaCksXG5cdFx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFwiLndyYXBwaW5nLXJvd1wiLCBbXG5cdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdFx0XCJtaW4td2lkdGhcIjogXCIyNTBweFwiLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG0oRHJvcERvd25TZWxlY3Rvciwge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogXCJzZW5kZXJfbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0aXRlbXM6IGdldEVuYWJsZWRNYWlsQWRkcmVzc2VzV2l0aFVzZXIobW9kZWwubWFpbGJveERldGFpbHMsIG1vZGVsLnVzZXIoKS51c2VyR3JvdXBJbmZvKVxuXHRcdFx0XHRcdFx0XHRcdC5zb3J0KClcblx0XHRcdFx0XHRcdFx0XHQubWFwKChtYWlsQWRkcmVzcykgPT4gKHtcblx0XHRcdFx0XHRcdFx0XHRcdG5hbWU6IG1haWxBZGRyZXNzLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU6IG1haWxBZGRyZXNzLFxuXHRcdFx0XHRcdFx0XHRcdH0pKSxcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRWYWx1ZTogYS5tb2RlbC5nZXRTZW5kZXIoKSxcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRWYWx1ZURpc3BsYXk6IGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQoYS5tb2RlbC5nZXRTZW5kZXJOYW1lKCksIGEubW9kZWwuZ2V0U2VuZGVyKCksIGZhbHNlKSxcblx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uQ2hhbmdlZEhhbmRsZXI6IChzZWxlY3Rpb246IHN0cmluZykgPT4gbW9kZWwuc2V0U2VuZGVyKHNlbGVjdGlvbiksXG5cdFx0XHRcdFx0XHRcdGRyb3Bkb3duV2lkdGg6IDI1MCxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0aXNDb25maWRlbnRpYWxcblx0XHRcdFx0XHRcdD8gbShcblx0XHRcdFx0XHRcdFx0XHRcIi5mbGV4XCIsXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJtaW4td2lkdGhcIjogXCIyNTBweFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdG9uY3JlYXRlOiAodm5vZGUpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgaHRtbERvbSA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRodG1sRG9tLnN0eWxlLm9wYWNpdHkgPSBcIjBcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYW5pbWF0aW9ucy5hZGQoaHRtbERvbSwgb3BhY2l0eSgwLCAxLCB0cnVlKSlcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRvbmJlZm9yZXJlbW92ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGh0bWxEb20gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0XHRcdFx0XHRcdFx0aHRtbERvbS5zdHlsZS5vcGFjaXR5ID0gXCIxXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFuaW1hdGlvbnMuYWRkKGh0bWxEb20sIG9wYWNpdHkoMSwgMCwgdHJ1ZSkpXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCIuZmxleC1ncm93XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG0oRHJvcERvd25TZWxlY3Rvciwge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcIm5vdGlmaWNhdGlvbk1haWxMYW5ndWFnZV9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGl0ZW1zOiBtb2RlbC5nZXRBdmFpbGFibGVOb3RpZmljYXRpb25UZW1wbGF0ZUxhbmd1YWdlcygpLm1hcCgobGFuZ3VhZ2UpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5hbWU6IGxhbmcuZ2V0KGxhbmd1YWdlLnRleHRJZCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBsYW5ndWFnZS5jb2RlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGVkVmFsdWU6IG1vZGVsLmdldFNlbGVjdGVkTm90aWZpY2F0aW9uTGFuZ3VhZ2VDb2RlKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uQ2hhbmdlZEhhbmRsZXI6ICh2OiBzdHJpbmcpID0+IG1vZGVsLnNldFNlbGVjdGVkTm90aWZpY2F0aW9uTGFuZ3VhZ2VDb2RlKHYpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRyb3Bkb3duV2lkdGg6IDI1MCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZWRpdEN1c3RvbU5vdGlmaWNhdGlvbk1haWxBdHRyc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQ/IG0oXCIucHQuZmxleC1uby1ncm93LmZsZXgtZW5kLmJvcmRlci1ib3R0b20uZmxleC5pdGVtcy1jZW50ZXJcIiwgbShJY29uQnV0dG9uLCBlZGl0Q3VzdG9tTm90aWZpY2F0aW9uTWFpbEF0dHJzKSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0XSksXG5cdFx0XHRcdGlzQ29uZmlkZW50aWFsID8gdGhpcy5yZW5kZXJQYXNzd29yZEZpZWxkcygpIDogbnVsbCxcblx0XHRcdFx0bShcIi5yb3dcIiwgbShUZXh0RmllbGQsIHN1YmplY3RGaWVsZEF0dHJzKSksXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCIuZmxleC1zdGFydC5mbGV4LXdyYXAubXQtcy5tYi1zLmdhcC1ocGFkXCIsXG5cdFx0XHRcdFx0YXR0YWNobWVudEJ1YmJsZUF0dHJzLm1hcCgoYSkgPT4gbShBdHRhY2htZW50QnViYmxlLCBhKSksXG5cdFx0XHRcdCksXG5cdFx0XHRcdG1vZGVsLmdldEF0dGFjaG1lbnRzKCkubGVuZ3RoID4gMCA/IG0oXCJoci5oclwiKSA6IG51bGwsXG5cdFx0XHRcdHRoaXMucmVuZGVyRXh0ZXJuYWxDb250ZW50QmFubmVyKHRoaXMuYXR0cnMpLFxuXHRcdFx0XHRhLmRvU2hvd1Rvb2xiYXIoKSA/IHRoaXMucmVuZGVyVG9vbGJhcihtb2RlbCkgOiBudWxsLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnB0LXMudGV4dC5zY3JvbGwteC5icmVhay13b3JkLWxpbmtzLmZsZXguZmxleC1jb2x1bW4uZmxleC1ncm93XCIsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0b25jbGljazogKCkgPT4gdGhpcy5lZGl0b3IuZm9jdXMoKSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG0odGhpcy5lZGl0b3IpLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFwiLnBiXCIpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckV4dGVybmFsQ29udGVudEJhbm5lcihhdHRyczogTWFpbEVkaXRvckF0dHJzKTogQ2hpbGRyZW4gfCBudWxsIHtcblx0XHRpZiAoIXRoaXMuYmxvY2tFeHRlcm5hbENvbnRlbnQgfHwgdGhpcy5hbHdheXNCbG9ja0V4dGVybmFsQ29udGVudCB8fCB0aGlzLmJsb2NrZWRFeHRlcm5hbENvbnRlbnQgPT09IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2hvd0J1dHRvbjogQmFubmVyQnV0dG9uQXR0cnMgPSB7XG5cdFx0XHRsYWJlbDogXCJzaG93QmxvY2tlZENvbnRlbnRfYWN0aW9uXCIsXG5cdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnVwZGF0ZUV4dGVybmFsQ29udGVudFN0YXR1cyhDb250ZW50QmxvY2tpbmdTdGF0dXMuU2hvdylcblx0XHRcdFx0dGhpcy5wcm9jZXNzSW5saW5lSW1hZ2VzKClcblx0XHRcdH0sXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG0oSW5mb0Jhbm5lciwge1xuXHRcdFx0bWVzc2FnZTogXCJjb250ZW50QmxvY2tlZF9tc2dcIixcblx0XHRcdGljb246IEljb25zLlBpY3R1cmUsXG5cdFx0XHRoZWxwTGluazogY2FuU2VlVHV0YUxpbmtzKGF0dHJzLm1vZGVsLmxvZ2lucykgPyBJbmZvTGluay5Mb2FkSW1hZ2VzIDogbnVsbCxcblx0XHRcdGJ1dHRvbnM6IFtzaG93QnV0dG9uXSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVFeHRlcm5hbENvbnRlbnRTdGF0dXMoc3RhdHVzOiBDb250ZW50QmxvY2tpbmdTdGF0dXMpIHtcblx0XHR0aGlzLmJsb2NrRXh0ZXJuYWxDb250ZW50ID0gc3RhdHVzID09PSBDb250ZW50QmxvY2tpbmdTdGF0dXMuQmxvY2sgfHwgc3RhdHVzID09PSBDb250ZW50QmxvY2tpbmdTdGF0dXMuQWx3YXlzQmxvY2tcblxuXHRcdGNvbnN0IHNhbml0aXplZCA9IGh0bWxTYW5pdGl6ZXIuc2FuaXRpemVIVE1MKHRoaXMuZWRpdG9yLmdldEhUTUwoKSwge1xuXHRcdFx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IHRoaXMuYmxvY2tFeHRlcm5hbENvbnRlbnQsXG5cdFx0fSlcblxuXHRcdHRoaXMuZWRpdG9yLnNldEhUTUwoc2FuaXRpemVkLmh0bWwpXG5cdH1cblxuXHRwcml2YXRlIHByb2Nlc3NJbmxpbmVJbWFnZXMoKSB7XG5cdFx0dGhpcy5pbmxpbmVJbWFnZUVsZW1lbnRzID0gcmVwbGFjZUNpZHNXaXRoSW5saW5lSW1hZ2VzKHRoaXMuZWRpdG9yLmdldERPTSgpLCB0aGlzLnNlbmRNYWlsTW9kZWwubG9hZGVkSW5saW5lSW1hZ2VzLCAoY2lkLCBldmVudCwgZG9tKSA9PiB7XG5cdFx0XHRjb25zdCBkb3dubG9hZENsaWNrSGFuZGxlciA9IGNyZWF0ZURyb3Bkb3duKHtcblx0XHRcdFx0bGF6eUJ1dHRvbnM6ICgpID0+IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJkb3dubG9hZF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB0aGlzLmRvd25sb2FkSW5saW5lSW1hZ2UodGhpcy5zZW5kTWFpbE1vZGVsLCBjaWQpLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9KVxuXHRcdFx0ZG93bmxvYWRDbGlja0hhbmRsZXIoZG93bmNhc3QoZXZlbnQpLCBkb20pXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVG9nZ2xlS25vd2xlZGdlQmFzZShrbm93bGVkZ2VCYXNlSW5qZWN0aW9uOiBEaWFsb2dJbmplY3Rpb25SaWdodEF0dHJzPEtub3dsZWRnZWJhc2VEaWFsb2dDb250ZW50QXR0cnM+KSB7XG5cdFx0cmV0dXJuIG0oVG9nZ2xlQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJvcGVuS25vd2xlZGdlYmFzZV9hY3Rpb25cIixcblx0XHRcdHRvZ2dsZWQ6IGtub3dsZWRnZUJhc2VJbmplY3Rpb24udmlzaWJsZSgpLFxuXHRcdFx0b25Ub2dnbGVkOiAoKSA9PiB7XG5cdFx0XHRcdGlmIChrbm93bGVkZ2VCYXNlSW5qZWN0aW9uLnZpc2libGUoKSkge1xuXHRcdFx0XHRcdGtub3dsZWRnZUJhc2VJbmplY3Rpb24udmlzaWJsZShmYWxzZSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRrbm93bGVkZ2VCYXNlSW5qZWN0aW9uLmNvbXBvbmVudEF0dHJzLm1vZGVsLnNvcnRFbnRyaWVzQnlNYXRjaGluZ0tleXdvcmRzKHRoaXMuZWRpdG9yLmdldFZhbHVlKCkpXG5cdFx0XHRcdFx0a25vd2xlZGdlQmFzZUluamVjdGlvbi52aXNpYmxlKHRydWUpXG5cdFx0XHRcdFx0a25vd2xlZGdlQmFzZUluamVjdGlvbi5jb21wb25lbnRBdHRycy5tb2RlbC5pbml0KClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGljb246IEljb25zLkJvb2ssXG5cdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyVG9vbGJhcihtb2RlbDogU2VuZE1haWxNb2RlbCk6IENoaWxkcmVuIHtcblx0XHQvLyBUb29sYmFyIGlzIG5vdCByZW1vdmVkIGZyb20gRE9NIGRpcmVjdGx5LCBvbmx5IGl0J3MgcGFyZW50IChhcnJheSkgaXMgc28gd2UgaGF2ZSB0byBhbmltYXRlIGl0IG1hbnVhbGx5LlxuXHRcdC8vIG0uZnJhZ21lbnQoKSBnaXZlcyB1cyBhIHZub2RlIHdpdGhvdXQgYWN0dWFsIERPTSBlbGVtZW50IHNvIHRoYXQgd2UgY2FuIHJ1biBjYWxsYmFjayBvbiByZW1vdmFsXG5cdFx0cmV0dXJuIG0uZnJhZ21lbnQoXG5cdFx0XHR7XG5cdFx0XHRcdG9uYmVmb3JlcmVtb3ZlOiAoeyBkb20gfSkgPT4gYW5pbWF0ZVRvb2xiYXIoZG9tLmNoaWxkcmVuWzBdIGFzIEhUTUxFbGVtZW50LCBmYWxzZSksXG5cdFx0XHR9LFxuXHRcdFx0W1xuXHRcdFx0XHRtKFJpY2hUZXh0VG9vbGJhciwge1xuXHRcdFx0XHRcdGVkaXRvcjogdGhpcy5lZGl0b3IsXG5cdFx0XHRcdFx0aW1hZ2VCdXR0b25DbGlja0hhbmRsZXI6IGlzQXBwKClcblx0XHRcdFx0XHRcdD8gbnVsbFxuXHRcdFx0XHRcdFx0OiAoZXZlbnQ6IEV2ZW50KSA9PiB0aGlzLmltYWdlQnV0dG9uQ2xpY2tIYW5kbGVyKG1vZGVsLCAoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSksXG5cdFx0XHRcdFx0Y3VzdG9tQnV0dG9uQXR0cnM6IHRoaXMudGVtcGxhdGVNb2RlbFxuXHRcdFx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0dGl0bGU6IFwib3BlblRlbXBsYXRlUG9wdXBfbXNnXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLm9wZW5UZW1wbGF0ZXMoKVxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLkxpc3RBbHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdFx0OiBbXSxcblx0XHRcdFx0fSksXG5cdFx0XHRcdG0oXCJoci5oclwiKSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBpbWFnZUJ1dHRvbkNsaWNrSGFuZGxlcihtb2RlbDogU2VuZE1haWxNb2RlbCwgcmVjdDogRE9NUmVjdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGZpbGVzID0gYXdhaXQgY2hvb3NlQW5kQXR0YWNoRmlsZShtb2RlbCwgcmVjdCwgQUxMT1dFRF9JTUFHRV9GT1JNQVRTKVxuXHRcdGlmICghZmlsZXMgfHwgZmlsZXMubGVuZ3RoID09PSAwKSByZXR1cm5cblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5pbnNlcnRJbmxpbmVJbWFnZXMobW9kZWwsIGZpbGVzKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBpbnNlcnRJbmxpbmVJbWFnZXMobW9kZWw6IFNlbmRNYWlsTW9kZWwsIGZpbGVzOiBSZWFkb25seUFycmF5PERhdGFGaWxlIHwgRmlsZVJlZmVyZW5jZT4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcblx0XHRcdGNvbnN0IGltZyA9IGNyZWF0ZUlubGluZUltYWdlKGZpbGUgYXMgRGF0YUZpbGUpXG5cdFx0XHRtb2RlbC5sb2FkZWRJbmxpbmVJbWFnZXMuc2V0KGltZy5jaWQsIGltZylcblx0XHRcdHRoaXMuaW5saW5lSW1hZ2VFbGVtZW50cy5wdXNoKFxuXHRcdFx0XHR0aGlzLmVkaXRvci5pbnNlcnRJbWFnZShpbWcub2JqZWN0VXJsLCB7XG5cdFx0XHRcdFx0Y2lkOiBpbWcuY2lkLFxuXHRcdFx0XHRcdHN0eWxlOiBcIm1heC13aWR0aDogMTAwJVwiLFxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHR9XG5cdFx0bS5yZWRyYXcoKVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJQYXNzd29yZEZpZWxkcygpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5leHRlcm5hbC1yZWNpcGllbnRzLm92ZXJmbG93LWhpZGRlblwiLFxuXHRcdFx0e1xuXHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB0aGlzLmFuaW1hdGVIZWlnaHQodm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50LCB0cnVlKSxcblx0XHRcdFx0b25iZWZvcmVyZW1vdmU6ICh2bm9kZSkgPT4gdGhpcy5hbmltYXRlSGVpZ2h0KHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudCwgZmFsc2UpLFxuXHRcdFx0fSxcblx0XHRcdHRoaXMuc2VuZE1haWxNb2RlbFxuXHRcdFx0XHQuYWxsUmVjaXBpZW50cygpXG5cdFx0XHRcdC5maWx0ZXIoKHIpID0+IHIudHlwZSA9PT0gUmVjaXBpZW50VHlwZS5FWFRFUk5BTClcblx0XHRcdFx0Lm1hcCgocmVjaXBpZW50KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLnJlY2lwaWVudFNob3dDb25maWRlbnRpYWwuaGFzKHJlY2lwaWVudC5hZGRyZXNzKSkgdGhpcy5yZWNpcGllbnRTaG93Q29uZmlkZW50aWFsLnNldChyZWNpcGllbnQuYWRkcmVzcywgZmFsc2UpXG5cblx0XHRcdFx0XHRyZXR1cm4gbShQYXNzd29yZEZpZWxkLCB7XG5cdFx0XHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB0aGlzLmFuaW1hdGVIZWlnaHQodm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50LCB0cnVlKSxcblx0XHRcdFx0XHRcdG9uYmVmb3JlcmVtb3ZlOiAodm5vZGUpID0+IHRoaXMuYW5pbWF0ZUhlaWdodCh2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQsIGZhbHNlKSxcblx0XHRcdFx0XHRcdGxhYmVsOiBsYW5nLmdldFRyYW5zbGF0aW9uKFwicGFzc3dvcmRGb3JfbGFiZWxcIiwgeyBcInsxfVwiOiByZWNpcGllbnQuYWRkcmVzcyB9KSxcblx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLnNlbmRNYWlsTW9kZWwuZ2V0UGFzc3dvcmQocmVjaXBpZW50LmFkZHJlc3MpLFxuXHRcdFx0XHRcdFx0cGFzc3dvcmRTdHJlbmd0aDogdGhpcy5zZW5kTWFpbE1vZGVsLmdldFBhc3N3b3JkU3RyZW5ndGgocmVjaXBpZW50KSxcblx0XHRcdFx0XHRcdHN0YXR1czogXCJhdXRvXCIsXG5cdFx0XHRcdFx0XHRhdXRvY29tcGxldGVBczogQXV0b2NvbXBsZXRlLm9mZixcblx0XHRcdFx0XHRcdG9uaW5wdXQ6ICh2YWwpID0+IHRoaXMuc2VuZE1haWxNb2RlbC5zZXRQYXNzd29yZChyZWNpcGllbnQuYWRkcmVzcywgdmFsKSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclJlY2lwaWVudEZpZWxkKGZpZWxkOiBSZWNpcGllbnRGaWVsZCwgZmllbGRUZXh0OiBTdHJlYW08c3RyaW5nPiwgc2VhcmNoOiBSZWNpcGllbnRzU2VhcmNoTW9kZWwpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgbGFiZWwgPSAoXG5cdFx0XHR7XG5cdFx0XHRcdHRvOiBcInRvX2xhYmVsXCIsXG5cdFx0XHRcdGNjOiBcImNjX2xhYmVsXCIsXG5cdFx0XHRcdGJjYzogXCJiY2NfbGFiZWxcIixcblx0XHRcdH0gYXMgY29uc3Rcblx0XHQpW2ZpZWxkXVxuXG5cdFx0cmV0dXJuIG0oTWFpbFJlY2lwaWVudHNUZXh0RmllbGQsIHtcblx0XHRcdGxhYmVsLFxuXHRcdFx0dGV4dDogZmllbGRUZXh0KCksXG5cdFx0XHRvblRleHRDaGFuZ2VkOiAodGV4dCkgPT4gZmllbGRUZXh0KHRleHQpLFxuXHRcdFx0cmVjaXBpZW50czogdGhpcy5zZW5kTWFpbE1vZGVsLmdldFJlY2lwaWVudExpc3QoZmllbGQpLFxuXHRcdFx0b25SZWNpcGllbnRBZGRlZDogYXN5bmMgKGFkZHJlc3MsIG5hbWUpID0+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnNlbmRNYWlsTW9kZWwuYWRkUmVjaXBpZW50KGZpZWxkLCB7IGFkZHJlc3MsIG5hbWUgfSlcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGlmIChpc09mZmxpbmVFcnJvcihlKSkge1xuXHRcdFx0XHRcdFx0Ly8gd2UgYXJlIG9mZmxpbmUgYnV0IHdlIHdhbnQgdG8gc2hvdyB0aGUgZXJyb3IgZGlhbG9nIG9ubHkgd2hlbiB3ZSBjbGljayBvbiBzZW5kLlxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIFRvb01hbnlSZXF1ZXN0c0Vycm9yKSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBEaWFsb2cubWVzc2FnZShcInRvb01hbnlBdHRlbXB0c19tc2dcIilcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG9uUmVjaXBpZW50UmVtb3ZlZDogKGFkZHJlc3MpID0+IHRoaXMuc2VuZE1haWxNb2RlbC5yZW1vdmVSZWNpcGllbnRCeUFkZHJlc3MoYWRkcmVzcywgZmllbGQpLFxuXHRcdFx0Z2V0UmVjaXBpZW50Q2xpY2tlZERyb3Bkb3duQXR0cnM6IChhZGRyZXNzKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHJlY2lwaWVudCA9IHRoaXMuc2VuZE1haWxNb2RlbC5nZXRSZWNpcGllbnQoZmllbGQsIGFkZHJlc3MpIVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRSZWNpcGllbnRDbGlja2VkQ29udGV4dEJ1dHRvbnMocmVjaXBpZW50LCBmaWVsZClcblx0XHRcdH0sXG5cdFx0XHRkaXNhYmxlZDogIXRoaXMuc2VuZE1haWxNb2RlbC5sb2dpbnMuaXNJbnRlcm5hbFVzZXJMb2dnZWRJbigpLFxuXHRcdFx0aW5qZWN0aW9uc1JpZ2h0OlxuXHRcdFx0XHRmaWVsZCA9PT0gUmVjaXBpZW50RmllbGQuVE8gJiYgdGhpcy5zZW5kTWFpbE1vZGVsLmxvZ2lucy5pc0ludGVybmFsVXNlckxvZ2dlZEluKClcblx0XHRcdFx0XHQ/IG0oXG5cdFx0XHRcdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFx0XHRcdG0oVG9nZ2xlQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IFwic2hvd19hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHRpY29uOiBCb290SWNvbnMuRXhwYW5kLFxuXHRcdFx0XHRcdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0XHRcdFx0XHR0b2dnbGVkOiB0aGlzLmFyZURldGFpbHNFeHBhbmRlZCxcblx0XHRcdFx0XHRcdFx0XHRvblRvZ2dsZWQ6IChfLCBlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmFyZURldGFpbHNFeHBhbmRlZCA9ICF0aGlzLmFyZURldGFpbHNFeHBhbmRlZFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdHNlYXJjaCxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBnZXRSZWNpcGllbnRDbGlja2VkQ29udGV4dEJ1dHRvbnMocmVjaXBpZW50OiBSZXNvbHZhYmxlUmVjaXBpZW50LCBmaWVsZDogUmVjaXBpZW50RmllbGQpOiBQcm9taXNlPERyb3Bkb3duQ2hpbGRBdHRyc1tdPiB7XG5cdFx0Y29uc3QgeyBlbnRpdHksIGNvbnRhY3RNb2RlbCB9ID0gdGhpcy5zZW5kTWFpbE1vZGVsXG5cblx0XHRjb25zdCBjYW5FZGl0QnViYmxlUmVjaXBpZW50ID0gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc0ludGVybmFsVXNlcigpICYmICFsb2NhdG9yLmxvZ2lucy5pc0VuYWJsZWQoRmVhdHVyZVR5cGUuRGlzYWJsZUNvbnRhY3RzKVxuXG5cdFx0Y29uc3QgY2FuUmVtb3ZlQnViYmxlID0gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc0ludGVybmFsVXNlcigpXG5cblx0XHRjb25zdCBjcmVhdGVkQ29udGFjdFJlY2VpdmVyID0gKGNvbnRhY3RFbGVtZW50SWQ6IElkKSA9PiB7XG5cdFx0XHRjb25zdCBtYWlsQWRkcmVzcyA9IHJlY2lwaWVudC5hZGRyZXNzXG5cblx0XHRcdGNvbnRhY3RNb2RlbC5nZXRDb250YWN0TGlzdElkKCkudGhlbigoY29udGFjdExpc3RJZDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmICghY29udGFjdExpc3RJZCkgcmV0dXJuXG5cdFx0XHRcdGNvbnN0IGlkOiBJZFR1cGxlID0gW2NvbnRhY3RMaXN0SWQsIGNvbnRhY3RFbGVtZW50SWRdXG5cdFx0XHRcdGVudGl0eS5sb2FkKENvbnRhY3RUeXBlUmVmLCBpZCkudGhlbigoY29udGFjdDogQ29udGFjdCkgPT4ge1xuXHRcdFx0XHRcdGlmIChjb250YWN0Lm1haWxBZGRyZXNzZXMuc29tZSgobWEpID0+IGNsZWFuTWF0Y2gobWEuYWRkcmVzcywgbWFpbEFkZHJlc3MpKSkge1xuXHRcdFx0XHRcdFx0cmVjaXBpZW50LnNldE5hbWUoZ2V0Q29udGFjdERpc3BsYXlOYW1lKGNvbnRhY3QpKVxuXHRcdFx0XHRcdFx0cmVjaXBpZW50LnNldENvbnRhY3QoY29udGFjdClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5zZW5kTWFpbE1vZGVsLnJlbW92ZVJlY2lwaWVudChyZWNpcGllbnQsIGZpZWxkLCBmYWxzZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGNvbnN0IGNvbnRleHRCdXR0b25zOiBBcnJheTxEcm9wZG93bkNoaWxkQXR0cnM+ID0gW11cblxuXHRcdGlmIChjYW5FZGl0QnViYmxlUmVjaXBpZW50KSB7XG5cdFx0XHRpZiAocmVjaXBpZW50LmNvbnRhY3QgJiYgcmVjaXBpZW50LmNvbnRhY3QuX2lkKSB7XG5cdFx0XHRcdGNvbnRleHRCdXR0b25zLnB1c2goe1xuXHRcdFx0XHRcdGxhYmVsOiBcImVkaXRDb250YWN0X2xhYmVsXCIsXG5cdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdGltcG9ydChcIi4uLy4uL2NvbnRhY3RzL0NvbnRhY3RFZGl0b3JcIikudGhlbigoeyBDb250YWN0RWRpdG9yIH0pID0+IG5ldyBDb250YWN0RWRpdG9yKGVudGl0eSwgcmVjaXBpZW50LmNvbnRhY3QpLnNob3coKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29udGV4dEJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdFx0bGFiZWw6IFwiY3JlYXRlQ29udGFjdF9hY3Rpb25cIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gY29udGFjdCBsaXN0XG5cdFx0XHRcdFx0XHRjb250YWN0TW9kZWwuZ2V0Q29udGFjdExpc3RJZCgpLnRoZW4oKGNvbnRhY3RMaXN0SWQ6IElkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5ld0NvbnRhY3QgPSBjcmVhdGVOZXdDb250YWN0KGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlciwgcmVjaXBpZW50LmFkZHJlc3MsIHJlY2lwaWVudC5uYW1lKVxuXHRcdFx0XHRcdFx0XHRpbXBvcnQoXCIuLi8uLi9jb250YWN0cy9Db250YWN0RWRpdG9yXCIpLnRoZW4oKHsgQ29udGFjdEVkaXRvciB9KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZXh0ZXJuYWwgdXNlcnMgZG9uJ3Qgc2VlIGVkaXQgYnV0dG9uc1xuXHRcdFx0XHRcdFx0XHRcdG5ldyBDb250YWN0RWRpdG9yKGVudGl0eSwgbmV3Q29udGFjdCwgYXNzZXJ0Tm90TnVsbChjb250YWN0TGlzdElkKSwgY3JlYXRlZENvbnRhY3RSZWNlaXZlcikuc2hvdygpXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGNhblJlbW92ZUJ1YmJsZSkge1xuXHRcdFx0Y29udGV4dEJ1dHRvbnMucHVzaCh7XG5cdFx0XHRcdGxhYmVsOiBcInJlbW92ZV9hY3Rpb25cIixcblx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMuc2VuZE1haWxNb2RlbC5yZW1vdmVSZWNpcGllbnQocmVjaXBpZW50LCBmaWVsZCwgZmFsc2UpLFxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRyZXR1cm4gY29udGV4dEJ1dHRvbnNcblx0fVxuXG5cdHByaXZhdGUgb3BlblRlbXBsYXRlcygpIHtcblx0XHRpZiAodGhpcy50ZW1wbGF0ZU1vZGVsKSB7XG5cdFx0XHR0aGlzLnRlbXBsYXRlTW9kZWwuaW5pdCgpLnRoZW4oKHRlbXBsYXRlTW9kZWwpID0+IHtcblx0XHRcdFx0c2hvd1RlbXBsYXRlUG9wdXBJbkVkaXRvcih0ZW1wbGF0ZU1vZGVsLCB0aGlzLmVkaXRvciwgbnVsbCwgdGhpcy5lZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KCkpXG5cdFx0XHR9KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYW5pbWF0ZUhlaWdodChkb21FbGVtZW50OiBIVE1MRWxlbWVudCwgZmFkZWluOiBib29sZWFuKTogQW5pbWF0aW9uUHJvbWlzZSB7XG5cdFx0bGV0IGNoaWxkSGVpZ2h0ID0gZG9tRWxlbWVudC5vZmZzZXRIZWlnaHRcblx0XHRyZXR1cm4gYW5pbWF0aW9ucy5hZGQoZG9tRWxlbWVudCwgZmFkZWluID8gaGVpZ2h0KDAsIGNoaWxkSGVpZ2h0KSA6IGhlaWdodChjaGlsZEhlaWdodCwgMCkpLnRoZW4oKCkgPT4ge1xuXHRcdFx0ZG9tRWxlbWVudC5zdHlsZS5oZWlnaHQgPSBcIlwiXG5cdFx0fSlcblx0fVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgRGlhbG9nIHdpdGggYSBNYWlsRWRpdG9yIGluc2lkZS5cbiAqIEBwYXJhbSBtb2RlbFxuICogQHBhcmFtIGJsb2NrRXh0ZXJuYWxDb250ZW50XG4gKiBAcGFyYW0gYWx3YXlzQmxvY2tFeHRlcm5hbENvbnRlbnRcbiAqIEByZXR1cm5zIHtEaWFsb2d9XG4gKiBAcHJpdmF0ZVxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVNYWlsRWRpdG9yRGlhbG9nKG1vZGVsOiBTZW5kTWFpbE1vZGVsLCBibG9ja0V4dGVybmFsQ29udGVudCA9IGZhbHNlLCBhbHdheXNCbG9ja0V4dGVybmFsQ29udGVudCA9IGZhbHNlKTogUHJvbWlzZTxEaWFsb2c+IHtcblx0bGV0IGRpYWxvZzogRGlhbG9nXG5cdGxldCBtYWlsRWRpdG9yQXR0cnM6IE1haWxFZGl0b3JBdHRyc1xuXG5cdGNvbnN0IHNhdmUgPSAoc2hvd1Byb2dyZXNzOiBib29sZWFuID0gdHJ1ZSkgPT4ge1xuXHRcdGNvbnN0IHNhdmVQcm9taXNlID0gbW9kZWwuc2F2ZURyYWZ0KHRydWUsIE1haWxNZXRob2QuTk9ORSlcblxuXHRcdGlmIChzaG93UHJvZ3Jlc3MpIHtcblx0XHRcdHJldHVybiBzaG93UHJvZ3Jlc3NEaWFsb2coXCJzYXZlX21zZ1wiLCBzYXZlUHJvbWlzZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNhdmVQcm9taXNlXG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qgc2VuZCA9IGFzeW5jICgpID0+IHtcblx0XHRpZiAobW9kZWwuaXNTaGFyZWRNYWlsYm94KCkgJiYgbW9kZWwuY29udGFpbnNFeHRlcm5hbFJlY2lwaWVudHMoKSAmJiBtb2RlbC5pc0NvbmZpZGVudGlhbCgpKSB7XG5cdFx0XHRhd2FpdCBEaWFsb2cubWVzc2FnZShcInNoYXJlZE1haWxib3hDYW5Ob3RTZW5kQ29uZmlkZW50aWFsRXh0ZXJuYWxfbXNnXCIpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgc3VjY2VzcyA9IGF3YWl0IG1vZGVsLnNlbmQoTWFpbE1ldGhvZC5OT05FLCBEaWFsb2cuY29uZmlybSwgc2hvd1Byb2dyZXNzRGlhbG9nKVxuXHRcdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRcdFx0ZGlzcG9zZSgpXG5cdFx0XHRcdGRpYWxvZy5jbG9zZSgpXG5cblx0XHRcdFx0YXdhaXQgaGFuZGxlUmF0aW5nQnlFdmVudCgpXG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBVc2VyRXJyb3IpIHtcblx0XHRcdFx0c2hvd1VzZXJFcnJvcihlKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIGtlZXAgdHJhY2sgb2YgdGhpbmdzIHdlIG5lZWQgdG8gZGlzcG9zZSBvZiB3aGVuIHRoZSBlZGl0b3IgaXMgY29tcGxldGVseSBjbG9zZWRcblx0Y29uc3QgZGlzcG9zYWJsZXM6IHsgZGlzcG9zZTogKCkgPT4gdW5rbm93biB9W10gPSBbXVxuXG5cdGNvbnN0IGRpc3Bvc2UgPSAoKSA9PiB7XG5cdFx0bW9kZWwuZGlzcG9zZSgpXG5cdFx0aWYgKHRlbXBsYXRlUG9wdXBNb2RlbCkgdGVtcGxhdGVQb3B1cE1vZGVsLmRpc3Bvc2UoKVxuXHRcdGZvciAoY29uc3QgZGlzcG9zYWJsZSBvZiBkaXNwb3NhYmxlcykge1xuXHRcdFx0ZGlzcG9zYWJsZS5kaXNwb3NlKClcblx0XHR9XG5cdH1cblxuXHRjb25zdCBtaW5pbWl6ZSA9ICgpID0+IHtcblx0XHRsZXQgc2F2ZVN0YXR1cyA9IHN0cmVhbTxTYXZlU3RhdHVzPih7IHN0YXR1czogU2F2ZVN0YXR1c0VudW0uU2F2aW5nIH0pXG5cdFx0aWYgKG1vZGVsLmhhc01haWxDaGFuZ2VkKCkpIHtcblx0XHRcdHNhdmUoZmFsc2UpXG5cdFx0XHRcdC50aGVuKCgpID0+IHNhdmVTdGF0dXMoeyBzdGF0dXM6IFNhdmVTdGF0dXNFbnVtLlNhdmVkIH0pKVxuXHRcdFx0XHQuY2F0Y2goKGUpID0+IHtcblx0XHRcdFx0XHRjb25zdCByZWFzb24gPSBpc09mZmxpbmVFcnJvcihlKSA/IFNhdmVFcnJvclJlYXNvbi5Db25uZWN0aW9uTG9zdCA6IFNhdmVFcnJvclJlYXNvbi5Vbmtub3duXG5cblx0XHRcdFx0XHRzYXZlU3RhdHVzKHsgc3RhdHVzOiBTYXZlU3RhdHVzRW51bS5Ob3RTYXZlZCwgcmVhc29uIH0pXG5cblx0XHRcdFx0XHQvLyBJZiB3ZSBkb24ndCBzaG93IHRoZSBlcnJvciBpbiB0aGUgbWluaW1pemVkIGVycm9yIGRpYWxvZyxcblx0XHRcdFx0XHQvLyBUaGVuIHdlIG5lZWQgdG8gY29tbXVuaWNhdGUgaXQgaW4gYSBkaWFsb2cgb3IgYXMgYW4gdW5oYW5kbGVkIGVycm9yXG5cdFx0XHRcdFx0aWYgKHJlYXNvbiA9PT0gU2F2ZUVycm9yUmVhc29uLlVua25vd24pIHtcblx0XHRcdFx0XHRcdGlmIChlIGluc3RhbmNlb2YgVXNlckVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdHNob3dVc2VyRXJyb3IoZSlcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IGVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5maW5hbGx5KCgpID0+IG0ucmVkcmF3KCkpXG5cdFx0fSBlbHNlIGlmICghbW9kZWwuZHJhZnQpIHtcblx0XHRcdC8vIElmIHRoZSBtYWlsIGlzIHVuY2hhbmdlZCBhbmQgdGhlcmUgd2FzIG5vIHByZWV4aXN0aW5nIGRyYWZ0LCBjbG9zZSBpbnN0ZWFkIG9mIHNhdmluZyBhbmQgcmV0dXJuIHRvIG5vdCBzaG93IG1pbmltaXplZCBtYWlsIGVkaXRvclxuXHRcdFx0ZGlzcG9zZSgpXG5cdFx0XHRkaWFsb2cuY2xvc2UoKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdC8vIElmIHRoZSBtYWlsIGlzIHVuY2hhbmdlZCBhbmQgdGhlcmUgL2lzLyBhIHByZWV4aXN0aW5nIGRyYWZ0LCB0aGVyZSB3YXMgbm8gY2hhbmdlIGFuZCB0aGUgbWFpbCBpcyBhbHJlYWR5IHNhdmVkXG5cdFx0ZWxzZSBzYXZlU3RhdHVzID0gc3RyZWFtPFNhdmVTdGF0dXM+KHsgc3RhdHVzOiBTYXZlU3RhdHVzRW51bS5TYXZlZCB9KVxuXHRcdHNob3dNaW5pbWl6ZWRNYWlsRWRpdG9yKGRpYWxvZywgbW9kZWwsIG1haWxMb2NhdG9yLm1pbmltaXplZE1haWxNb2RlbCwgbG9jYXRvci5ldmVudENvbnRyb2xsZXIsIGRpc3Bvc2UsIHNhdmVTdGF0dXMpXG5cdH1cblxuXHRsZXQgd2luZG93Q2xvc2VVbnN1YnNjcmliZSA9ICgpID0+IHt9XG5cblx0Y29uc3QgaGVhZGVyQmFyQXR0cnM6IERpYWxvZ0hlYWRlckJhckF0dHJzID0ge1xuXHRcdGxlZnQ6IFtcblx0XHRcdHtcblx0XHRcdFx0bGFiZWw6IFwiY2xvc2VfYWx0XCIsXG5cdFx0XHRcdGNsaWNrOiAoKSA9PiBtaW5pbWl6ZSgpLFxuXHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdH0sXG5cdFx0XSxcblx0XHRyaWdodDogW1xuXHRcdFx0e1xuXHRcdFx0XHRsYWJlbDogXCJzZW5kX2FjdGlvblwiLFxuXHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdHNlbmQoKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlByaW1hcnksXG5cdFx0XHR9LFxuXHRcdF0sXG5cdFx0bWlkZGxlOiBkaWFsb2dUaXRsZVRyYW5zbGF0aW9uS2V5KG1vZGVsLmdldENvbnZlcnNhdGlvblR5cGUoKSksXG5cdFx0Y3JlYXRlOiAoKSA9PiB7XG5cdFx0XHRpZiAoaXNCcm93c2VyKCkpIHtcblx0XHRcdFx0Ly8gSGF2ZSBhIHNpbXBsZSBsaXN0ZW5lciBvbiBicm93c2VyLCBzbyB0aGVpciBicm93c2VyIHdpbGwgbWFrZSB0aGUgdXNlciBhc2sgaWYgdGhleSBhcmUgc3VyZSB0aGV5IHdhbnQgdG8gY2xvc2Ugd2hlbiBjbG9zaW5nIHRoZSB0YWIvd2luZG93XG5cdFx0XHRcdHdpbmRvd0Nsb3NlVW5zdWJzY3JpYmUgPSB3aW5kb3dGYWNhZGUuYWRkV2luZG93Q2xvc2VMaXN0ZW5lcigoKSA9PiB7fSlcblx0XHRcdH0gZWxzZSBpZiAoaXNEZXNrdG9wKCkpIHtcblx0XHRcdFx0Ly8gU2ltdWxhdGUgY2xpY2tpbmcgdGhlIENsb3NlIGJ1dHRvbiB3aGVuIG9uIHRoZSBkZXNrdG9wIHNvIHRoZXkgY2FuIHNlZSB0aGV5IGNhbiBzYXZlIGEgZHJhZnQgcmF0aGVyIHRoYW4gY29tcGxldGVseSBjbG9zaW5nIGl0XG5cdFx0XHRcdHdpbmRvd0Nsb3NlVW5zdWJzY3JpYmUgPSB3aW5kb3dGYWNhZGUuYWRkV2luZG93Q2xvc2VMaXN0ZW5lcigoKSA9PiB7XG5cdFx0XHRcdFx0bWluaW1pemUoKVxuXHRcdFx0XHR9KVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVtb3ZlOiAoKSA9PiB7XG5cdFx0XHR3aW5kb3dDbG9zZVVuc3Vic2NyaWJlKClcblx0XHR9LFxuXHR9XG5cdGNvbnN0IHRlbXBsYXRlUG9wdXBNb2RlbCA9XG5cdFx0bG9jYXRvci5sb2dpbnMuaXNJbnRlcm5hbFVzZXJMb2dnZWRJbigpICYmIGNsaWVudC5pc0Rlc2t0b3BEZXZpY2UoKVxuXHRcdFx0PyBuZXcgVGVtcGxhdGVQb3B1cE1vZGVsKGxvY2F0b3IuZXZlbnRDb250cm9sbGVyLCBsb2NhdG9yLmxvZ2lucywgbG9jYXRvci5lbnRpdHlDbGllbnQpXG5cdFx0XHQ6IG51bGxcblxuXHRjb25zdCBjcmVhdGVLbm93bGVkZ2ViYXNlQnV0dG9uQXR0cnMgPSBhc3luYyAoZWRpdG9yOiBFZGl0b3IpID0+IHtcblx0XHRpZiAobG9jYXRvci5sb2dpbnMuaXNJbnRlcm5hbFVzZXJMb2dnZWRJbigpKSB7XG5cdFx0XHRjb25zdCBjdXN0b21lciA9IGF3YWl0IGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkubG9hZEN1c3RvbWVyKClcblx0XHRcdC8vIG9ubHkgY3JlYXRlIGtub3dsZWRnZWJhc2UgYnV0dG9uIGZvciBpbnRlcm5hbCB1c2VycyB3aXRoIHZhbGlkIHRlbXBsYXRlIGdyb3VwIGFuZCBlbmFibGVkIEtub3dsZWRnZWJhc2VGZWF0dXJlXG5cdFx0XHRpZiAoXG5cdFx0XHRcdHN0eWxlcy5pc0Rlc2t0b3BMYXlvdXQoKSAmJlxuXHRcdFx0XHR0ZW1wbGF0ZVBvcHVwTW9kZWwgJiZcblx0XHRcdFx0bG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5nZXRUZW1wbGF0ZU1lbWJlcnNoaXBzKCkubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRpc0N1c3RvbWl6YXRpb25FbmFibGVkRm9yQ3VzdG9tZXIoY3VzdG9tZXIsIEZlYXR1cmVUeXBlLktub3dsZWRnZUJhc2UpXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qga25vd2xlZGdlYmFzZU1vZGVsID0gbmV3IEtub3dsZWRnZUJhc2VNb2RlbChsb2NhdG9yLmV2ZW50Q29udHJvbGxlciwgbG9jYXRvci5lbnRpdHlDbGllbnQsIGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkpXG5cdFx0XHRcdGF3YWl0IGtub3dsZWRnZWJhc2VNb2RlbC5pbml0KClcblxuXHRcdFx0XHQvLyBtYWtlIHN1cmUgd2UgZGlzcG9zZSBrbm93bGVkYmFzZU1vZGVsIG9uY2UgdGhlIGVkaXRvciBpcyBjbG9zZWRcblx0XHRcdFx0ZGlzcG9zYWJsZXMucHVzaChrbm93bGVkZ2ViYXNlTW9kZWwpXG5cblx0XHRcdFx0Y29uc3Qga25vd2xlZGdlYmFzZUluamVjdGlvbiA9IGNyZWF0ZUtub3dsZWRnZUJhc2VEaWFsb2dJbmplY3Rpb24oa25vd2xlZGdlYmFzZU1vZGVsLCB0ZW1wbGF0ZVBvcHVwTW9kZWwsIGVkaXRvcilcblx0XHRcdFx0ZGlhbG9nLnNldEluamVjdGlvblJpZ2h0KGtub3dsZWRnZWJhc2VJbmplY3Rpb24pXG5cdFx0XHRcdHJldHVybiBrbm93bGVkZ2ViYXNlSW5qZWN0aW9uXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXG5cdG1haWxFZGl0b3JBdHRycyA9IGNyZWF0ZU1haWxFZGl0b3JBdHRycyhcblx0XHRtb2RlbCxcblx0XHRibG9ja0V4dGVybmFsQ29udGVudCxcblx0XHRtb2RlbC50b1JlY2lwaWVudHMoKS5sZW5ndGggIT09IDAsXG5cdFx0KCkgPT4gZGlhbG9nLFxuXHRcdHRlbXBsYXRlUG9wdXBNb2RlbCxcblx0XHRjcmVhdGVLbm93bGVkZ2ViYXNlQnV0dG9uQXR0cnMsXG5cdFx0YXdhaXQgbG9jYXRvci5yZWNpcGllbnRzU2VhcmNoTW9kZWwoKSxcblx0XHRhbHdheXNCbG9ja0V4dGVybmFsQ29udGVudCxcblx0KVxuXHRjb25zdCBzaG9ydGN1dHM6IFNob3J0Y3V0W10gPSBbXG5cdFx0e1xuXHRcdFx0a2V5OiBLZXlzLkVTQyxcblx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0bWluaW1pemUoKVxuXHRcdFx0fSxcblx0XHRcdGhlbHA6IFwiY2xvc2VfYWx0XCIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuUyxcblx0XHRcdGN0cmxPckNtZDogdHJ1ZSxcblx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0c2F2ZSgpLmNhdGNoKG9mQ2xhc3MoVXNlckVycm9yLCBzaG93VXNlckVycm9yKSlcblx0XHRcdH0sXG5cdFx0XHRoZWxwOiBcInNhdmVfYWN0aW9uXCIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuUyxcblx0XHRcdGN0cmxPckNtZDogdHJ1ZSxcblx0XHRcdHNoaWZ0OiB0cnVlLFxuXHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRzZW5kKClcblx0XHRcdH0sXG5cdFx0XHRoZWxwOiBcInNlbmRfYWN0aW9uXCIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IEtleXMuUkVUVVJOLFxuXHRcdFx0Y3RybE9yQ21kOiB0cnVlLFxuXHRcdFx0ZXhlYzogKCkgPT4ge1xuXHRcdFx0XHRzZW5kKClcblx0XHRcdH0sXG5cdFx0XHRoZWxwOiBcInNlbmRfYWN0aW9uXCIsXG5cdFx0fSxcblx0XVxuXHRkaWFsb2cgPSBEaWFsb2cuZWRpdERpYWxvZyhoZWFkZXJCYXJBdHRycywgTWFpbEVkaXRvciwgbWFpbEVkaXRvckF0dHJzKVxuXHRkaWFsb2cuc2V0Q2xvc2VIYW5kbGVyKCgpID0+IG1pbmltaXplKCkpXG5cblx0Zm9yIChsZXQgc2hvcnRjdXQgb2Ygc2hvcnRjdXRzKSB7XG5cdFx0ZGlhbG9nLmFkZFNob3J0Y3V0KHNob3J0Y3V0KVxuXHR9XG5cblx0cmV0dXJuIGRpYWxvZ1xufVxuXG4vKipcbiAqIG9wZW4gYSBNYWlsRWRpdG9yXG4gKiBAcGFyYW0gbWFpbGJveERldGFpbHMgZGV0YWlscyB0byB1c2Ugd2hlbiBzZW5kaW5nIGFuIGVtYWlsXG4gKiBAcmV0dXJucyB7Kn1cbiAqIEBwcml2YXRlXG4gKiBAdGhyb3dzIFBlcm1pc3Npb25FcnJvclxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3TWFpbEVkaXRvcihtYWlsYm94RGV0YWlsczogTWFpbGJveERldGFpbCk6IFByb21pc2U8RGlhbG9nPiB7XG5cdC8vIFdlIGNoZWNrIGFwcHJvdmFsIHN0YXR1cyBzbyBhcyB0byBnZXQgYSBkaWFsb2cgaW5mb3JtaW5nIHRoZSB1c2VyIHRoYXQgdGhleSBjYW5ub3Qgc2VuZCBtYWlsc1xuXHQvLyBidXQgd2Ugc3RpbGwgd2FudCB0byBvcGVuIHRoZSBtYWlsIGVkaXRvciBiZWNhdXNlIHRoZXkgc2hvdWxkIHN0aWxsIGJlIGFibGUgdG8gY29udGFjdCBzYWxlc0B0dXRhby5kZVxuXHRhd2FpdCBjaGVja0FwcHJvdmFsU3RhdHVzKGxvY2F0b3IubG9naW5zLCBmYWxzZSlcblx0Y29uc3QgeyBhcHBlbmRFbWFpbFNpZ25hdHVyZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vc2lnbmF0dXJlL1NpZ25hdHVyZVwiKVxuXHRjb25zdCBzaWduYXR1cmUgPSBhcHBlbmRFbWFpbFNpZ25hdHVyZShcIlwiLCBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnByb3BzKVxuXHRjb25zdCBkZXRhaWxzUHJvcGVydGllcyA9IGF3YWl0IGdldE1haWxib3hEZXRhaWxzQW5kUHJvcGVydGllcyhtYWlsYm94RGV0YWlscylcblx0cmV0dXJuIG5ld01haWxFZGl0b3JGcm9tVGVtcGxhdGUoZGV0YWlsc1Byb3BlcnRpZXMubWFpbGJveERldGFpbHMsIHt9LCBcIlwiLCBzaWduYXR1cmUpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEV4dGVybmFsQ29udGVudFJ1bGVzRm9yRWRpdG9yKG1vZGVsOiBTZW5kTWFpbE1vZGVsLCBjdXJyZW50U3RhdHVzOiBib29sZWFuKSB7XG5cdGxldCBjb250ZW50UnVsZXNcblx0Y29uc3QgcHJldmlvdXNNYWlsID0gbW9kZWwuZ2V0UHJldmlvdXNNYWlsKClcblxuXHRpZiAoIXByZXZpb3VzTWFpbCkge1xuXHRcdGNvbnRlbnRSdWxlcyA9IHtcblx0XHRcdGFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBmYWxzZSxcblx0XHRcdC8vIGV4dGVybmFsIGNvbnRlbnQgaW4gYSBtYWlsIGZvciB3aGljaCB3ZSBkb24ndCBoYXZlIGFcblx0XHRcdC8vIHByZXZpb3VzIG1haWwgbXVzdCBoYXZlIGJlZW4gcHV0IHRoZXJlIGJ5IHVzLlxuXHRcdFx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IGZhbHNlLFxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRjb25zdCBleHRlcm5hbEltYWdlUnVsZSA9IGF3YWl0IGxvY2F0b3IuY29uZmlnRmFjYWRlLmdldEV4dGVybmFsSW1hZ2VSdWxlKHByZXZpb3VzTWFpbC5zZW5kZXIuYWRkcmVzcykuY2F0Y2goKGU6IHVua25vd24pID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKFwiRXJyb3IgZ2V0dGluZyBleHRlcm5hbCBpbWFnZSBydWxlOlwiLCBlKVxuXHRcdFx0cmV0dXJuIEV4dGVybmFsSW1hZ2VSdWxlLk5vbmVcblx0XHR9KVxuXG5cdFx0bGV0IGlzQXV0aGVudGljYXRlZE1haWxcblx0XHRpZiAocHJldmlvdXNNYWlsLmF1dGhTdGF0dXMgIT09IG51bGwpIHtcblx0XHRcdGlzQXV0aGVudGljYXRlZE1haWwgPSBwcmV2aW91c01haWwuYXV0aFN0YXR1cyA9PT0gTWFpbEF1dGhlbnRpY2F0aW9uU3RhdHVzLkFVVEhFTlRJQ0FURURcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgbWFpbERldGFpbHMgPSBhd2FpdCBsb2NhdG9yLm1haWxGYWNhZGUubG9hZE1haWxEZXRhaWxzQmxvYihwcmV2aW91c01haWwpXG5cdFx0XHRpc0F1dGhlbnRpY2F0ZWRNYWlsID0gbWFpbERldGFpbHMuYXV0aFN0YXR1cyA9PT0gTWFpbEF1dGhlbnRpY2F0aW9uU3RhdHVzLkFVVEhFTlRJQ0FURURcblx0XHR9XG5cblx0XHRpZiAoZXh0ZXJuYWxJbWFnZVJ1bGUgPT09IEV4dGVybmFsSW1hZ2VSdWxlLkJsb2NrIHx8IChleHRlcm5hbEltYWdlUnVsZSA9PT0gRXh0ZXJuYWxJbWFnZVJ1bGUuTm9uZSAmJiBtb2RlbC5pc1VzZXJQcmV2aW91c1NlbmRlcigpKSkge1xuXHRcdFx0Y29udGVudFJ1bGVzID0ge1xuXHRcdFx0XHQvLyBXaGVuIHdlIGhhdmUgYW4gZXhwbGljaXQgcnVsZSBmb3IgYmxvY2tpbmcgaW1hZ2VzIHdlIGRvbsK0dFxuXHRcdFx0XHQvLyB3YW50IHRvIHByb21wdCB0aGUgdXNlciBhYm91dCBzaG93aW5nIGltYWdlcyBhZ2FpblxuXHRcdFx0XHRhbHdheXNCbG9ja0V4dGVybmFsQ29udGVudDogZXh0ZXJuYWxJbWFnZVJ1bGUgPT09IEV4dGVybmFsSW1hZ2VSdWxlLkJsb2NrLFxuXHRcdFx0XHRibG9ja0V4dGVybmFsQ29udGVudDogdHJ1ZSxcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGV4dGVybmFsSW1hZ2VSdWxlID09PSBFeHRlcm5hbEltYWdlUnVsZS5BbGxvdyAmJiBpc0F1dGhlbnRpY2F0ZWRNYWlsKSB7XG5cdFx0XHRjb250ZW50UnVsZXMgPSB7XG5cdFx0XHRcdGFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBmYWxzZSxcblx0XHRcdFx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IGZhbHNlLFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb250ZW50UnVsZXMgPSB7XG5cdFx0XHRcdGFsd2F5c0Jsb2NrRXh0ZXJuYWxDb250ZW50OiBmYWxzZSxcblx0XHRcdFx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IGN1cnJlbnRTdGF0dXMsXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGNvbnRlbnRSdWxlc1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbmV3TWFpbEVkaXRvckFzUmVzcG9uc2UoXG5cdGFyZ3M6IEluaXRBc1Jlc3BvbnNlQXJncyxcblx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IGJvb2xlYW4sXG5cdGlubGluZUltYWdlczogSW5saW5lSW1hZ2VzLFxuXHRtYWlsYm94RGV0YWlscz86IE1haWxib3hEZXRhaWwsXG4pOiBQcm9taXNlPERpYWxvZz4ge1xuXHRjb25zdCBkZXRhaWxzUHJvcGVydGllcyA9IGF3YWl0IGdldE1haWxib3hEZXRhaWxzQW5kUHJvcGVydGllcyhtYWlsYm94RGV0YWlscylcblx0Y29uc3QgbW9kZWwgPSBhd2FpdCBsb2NhdG9yLnNlbmRNYWlsTW9kZWwoZGV0YWlsc1Byb3BlcnRpZXMubWFpbGJveERldGFpbHMsIGRldGFpbHNQcm9wZXJ0aWVzLm1haWxib3hQcm9wZXJ0aWVzKVxuXHRhd2FpdCBtb2RlbC5pbml0QXNSZXNwb25zZShhcmdzLCBpbmxpbmVJbWFnZXMpXG5cblx0Y29uc3QgZXh0ZXJuYWxJbWFnZVJ1bGVzID0gYXdhaXQgZ2V0RXh0ZXJuYWxDb250ZW50UnVsZXNGb3JFZGl0b3IobW9kZWwsIGJsb2NrRXh0ZXJuYWxDb250ZW50KVxuXHRyZXR1cm4gY3JlYXRlTWFpbEVkaXRvckRpYWxvZyhtb2RlbCwgZXh0ZXJuYWxJbWFnZVJ1bGVzPy5ibG9ja0V4dGVybmFsQ29udGVudCwgZXh0ZXJuYWxJbWFnZVJ1bGVzPy5hbHdheXNCbG9ja0V4dGVybmFsQ29udGVudClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld01haWxFZGl0b3JGcm9tRHJhZnQoXG5cdG1haWw6IE1haWwsXG5cdG1haWxEZXRhaWxzOiBNYWlsRGV0YWlscyxcblx0YXR0YWNobWVudHM6IFR1dGFub3RhRmlsZVtdLFxuXHRpbmxpbmVJbWFnZXM6IElubGluZUltYWdlcyxcblx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IGJvb2xlYW4sXG5cdG1haWxib3hEZXRhaWxzPzogTWFpbGJveERldGFpbCxcbik6IFByb21pc2U8RGlhbG9nPiB7XG5cdGNvbnN0IGRldGFpbHNQcm9wZXJ0aWVzID0gYXdhaXQgZ2V0TWFpbGJveERldGFpbHNBbmRQcm9wZXJ0aWVzKG1haWxib3hEZXRhaWxzKVxuXHRjb25zdCBtb2RlbCA9IGF3YWl0IGxvY2F0b3Iuc2VuZE1haWxNb2RlbChkZXRhaWxzUHJvcGVydGllcy5tYWlsYm94RGV0YWlscywgZGV0YWlsc1Byb3BlcnRpZXMubWFpbGJveFByb3BlcnRpZXMpXG5cdGF3YWl0IG1vZGVsLmluaXRXaXRoRHJhZnQobWFpbCwgbWFpbERldGFpbHMsIGF0dGFjaG1lbnRzLCBpbmxpbmVJbWFnZXMpXG5cdGNvbnN0IGV4dGVybmFsSW1hZ2VSdWxlcyA9IGF3YWl0IGdldEV4dGVybmFsQ29udGVudFJ1bGVzRm9yRWRpdG9yKG1vZGVsLCBibG9ja0V4dGVybmFsQ29udGVudClcblx0cmV0dXJuIGNyZWF0ZU1haWxFZGl0b3JEaWFsb2cobW9kZWwsIGV4dGVybmFsSW1hZ2VSdWxlcz8uYmxvY2tFeHRlcm5hbENvbnRlbnQsIGV4dGVybmFsSW1hZ2VSdWxlcz8uYWx3YXlzQmxvY2tFeHRlcm5hbENvbnRlbnQpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBuZXdNYWlsdG9VcmxNYWlsRWRpdG9yKG1haWx0b1VybDogc3RyaW5nLCBjb25maWRlbnRpYWw6IGJvb2xlYW4sIG1haWxib3hEZXRhaWxzPzogTWFpbGJveERldGFpbCk6IFByb21pc2U8RGlhbG9nPiB7XG5cdGNvbnN0IGRldGFpbHNQcm9wZXJ0aWVzID0gYXdhaXQgZ2V0TWFpbGJveERldGFpbHNBbmRQcm9wZXJ0aWVzKG1haWxib3hEZXRhaWxzKVxuXHRjb25zdCBtYWlsVG8gPSBwYXJzZU1haWx0b1VybChtYWlsdG9VcmwpXG5cdGxldCBkYXRhRmlsZXM6IEF0dGFjaG1lbnRbXSA9IFtdXG5cblx0aWYgKG1haWxUby5hdHRhY2gpIHtcblx0XHRjb25zdCBhdHRhY2ggPSBtYWlsVG8uYXR0YWNoXG5cblx0XHRpZiAoaXNEZXNrdG9wKCkpIHtcblx0XHRcdGNvbnN0IGZpbGVzID0gYXdhaXQgUHJvbWlzZS5hbGwoYXR0YWNoLm1hcCgodXJpKSA9PiBsb2NhdG9yLmZpbGVBcHAucmVhZERhdGFGaWxlKHVyaSkpKVxuXHRcdFx0ZGF0YUZpbGVzID0gZmlsZXMuZmlsdGVyKGlzTm90TnVsbClcblx0XHR9XG5cdFx0Ly8gbWFrZSBzdXJlIHRoZSB1c2VyIGlzIGF3YXJlIHRoYXQgKGFuZCB3aGljaCkgZmlsZXMgaGF2ZSBiZWVuIGF0dGFjaGVkXG5cdFx0Y29uc3Qga2VlcEF0dGFjaG1lbnRzID1cblx0XHRcdGRhdGFGaWxlcy5sZW5ndGggPT09IDAgfHxcblx0XHRcdChhd2FpdCBEaWFsb2cuY29uZmlybShcImF0dGFjaG1lbnRXYXJuaW5nX21zZ1wiLCBcImF0dGFjaEZpbGVzX2FjdGlvblwiLCAoKSA9PlxuXHRcdFx0XHRkYXRhRmlsZXMubWFwKChkZiwgaSkgPT5cblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCIudGV4dC1icmVhay5zZWxlY3RhYmxlLm10LXhzXCIsXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBhdHRhY2hbaV0sXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ZGYubmFtZSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHQpLFxuXHRcdFx0KSlcblxuXHRcdGlmIChrZWVwQXR0YWNobWVudHMpIHtcblx0XHRcdGNvbnN0IHNpemVDaGVja1Jlc3VsdCA9IGNoZWNrQXR0YWNobWVudFNpemUoZGF0YUZpbGVzKVxuXHRcdFx0ZGF0YUZpbGVzID0gc2l6ZUNoZWNrUmVzdWx0LmF0dGFjaGFibGVGaWxlc1xuXG5cdFx0XHRpZiAoc2l6ZUNoZWNrUmVzdWx0LnRvb0JpZ0ZpbGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXCJ0b29CaWdBdHRhY2htZW50X21zZ1wiLCAoKSA9PiBzaXplQ2hlY2tSZXN1bHQudG9vQmlnRmlsZXMubWFwKChmaWxlKSA9PiBtKFwiLnRleHQtYnJlYWsuc2VsZWN0YWJsZVwiLCBmaWxlKSkpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBDYW5jZWxsZWRFcnJvcihcInVzZXIgY2FuY2VsbGVkIG9wZW5pbmcgbWFpbCBlZGl0b3Igd2l0aCBhdHRhY2htZW50c1wiKVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBuZXdNYWlsRWRpdG9yRnJvbVRlbXBsYXRlKFxuXHRcdGRldGFpbHNQcm9wZXJ0aWVzLm1haWxib3hEZXRhaWxzLFxuXHRcdG1haWxUby5yZWNpcGllbnRzLFxuXHRcdG1haWxUby5zdWJqZWN0IHx8IFwiXCIsXG5cdFx0YXBwZW5kRW1haWxTaWduYXR1cmUobWFpbFRvLmJvZHkgfHwgXCJcIiwgbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5wcm9wcyksXG5cdFx0ZGF0YUZpbGVzLFxuXHRcdGNvbmZpZGVudGlhbCxcblx0XHR1bmRlZmluZWQsXG5cdFx0dHJ1ZSwgLy8gZW1haWxzIGNyZWF0ZWQgd2l0aCBtYWlsdG8gc2hvdWxkIGFsd2F5cyBzYXZlIGFzIGRyYWZ0XG5cdClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG5ld01haWxFZGl0b3JGcm9tVGVtcGxhdGUoXG5cdG1haWxib3hEZXRhaWxzOiBNYWlsYm94RGV0YWlsLFxuXHRyZWNpcGllbnRzOiBSZWNpcGllbnRzLFxuXHRzdWJqZWN0OiBzdHJpbmcsXG5cdGJvZHlUZXh0OiBzdHJpbmcsXG5cdGF0dGFjaG1lbnRzPzogUmVhZG9ubHlBcnJheTxBdHRhY2htZW50Pixcblx0Y29uZmlkZW50aWFsPzogYm9vbGVhbixcblx0c2VuZGVyTWFpbEFkZHJlc3M/OiBzdHJpbmcsXG5cdGluaXRpYWxDaGFuZ2VkU3RhdGU/OiBib29sZWFuLFxuKTogUHJvbWlzZTxEaWFsb2c+IHtcblx0Y29uc3QgbWFpbGJveFByb3BlcnRpZXMgPSBhd2FpdCBsb2NhdG9yLm1haWxib3hNb2RlbC5nZXRNYWlsYm94UHJvcGVydGllcyhtYWlsYm94RGV0YWlscy5tYWlsYm94R3JvdXBSb290KVxuXHRyZXR1cm4gbG9jYXRvclxuXHRcdC5zZW5kTWFpbE1vZGVsKG1haWxib3hEZXRhaWxzLCBtYWlsYm94UHJvcGVydGllcylcblx0XHQudGhlbigobW9kZWwpID0+IG1vZGVsLmluaXRXaXRoVGVtcGxhdGUocmVjaXBpZW50cywgc3ViamVjdCwgYm9keVRleHQsIGF0dGFjaG1lbnRzLCBjb25maWRlbnRpYWwsIHNlbmRlck1haWxBZGRyZXNzLCBpbml0aWFsQ2hhbmdlZFN0YXRlKSlcblx0XHQudGhlbigobW9kZWwpID0+IGNyZWF0ZU1haWxFZGl0b3JEaWFsb2cobW9kZWwpKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbmQgc2hvdyBhIG5ldyBtYWlsIGVkaXRvciB3aXRoIGFuIGludml0ZSBtZXNzYWdlXG4gKiBAcGFyYW0gcmVmZXJyYWxMaW5rXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlSW52aXRlTWFpbChyZWZlcnJhbExpbms6IHN0cmluZykge1xuXHRjb25zdCBkZXRhaWxzUHJvcGVydGllcyA9IGF3YWl0IGdldE1haWxib3hEZXRhaWxzQW5kUHJvcGVydGllcyhudWxsKVxuXHRjb25zdCB1c2VybmFtZSA9IGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlckdyb3VwSW5mby5uYW1lXG5cdGNvbnN0IGJvZHkgPSBsYW5nLmdldChcImludml0YXRpb25NYWlsQm9keV9tc2dcIiwge1xuXHRcdFwie3JlZ2lzdHJhdGlvbkxpbmt9XCI6IHJlZmVycmFsTGluayxcblx0XHRcInt1c2VybmFtZX1cIjogdXNlcm5hbWUsXG5cdH0pXG5cdGNvbnN0IHsgaW52aXRhdGlvblN1YmplY3QgfSA9IGF3YWl0IGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLmdldChUcmFuc2xhdGlvblNlcnZpY2UsIGNyZWF0ZVRyYW5zbGF0aW9uR2V0SW4oeyBsYW5nOiBsYW5nLmNvZGUgfSkpXG5cdGNvbnN0IGRpYWxvZyA9IGF3YWl0IG5ld01haWxFZGl0b3JGcm9tVGVtcGxhdGUoZGV0YWlsc1Byb3BlcnRpZXMubWFpbGJveERldGFpbHMsIHt9LCBpbnZpdGF0aW9uU3ViamVjdCwgYm9keSwgW10sIGZhbHNlKVxuXHRkaWFsb2cuc2hvdygpXG59XG5cbi8qKlxuICogQ3JlYXRlIGFuZCBzaG93IGEgbmV3IG1haWwgZWRpdG9yIHdpdGggYW4gaW52aXRlIG1lc3NhZ2VcbiAqIEBwYXJhbSBsaW5rIHRoZSBsaW5rIHRvIHRoZSBnaWZ0Y2FyZFxuICogQHBhcmFtIG1haWxib3hEZXRhaWxzXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHdyaXRlR2lmdENhcmRNYWlsKGxpbms6IHN0cmluZywgbWFpbGJveERldGFpbHM/OiBNYWlsYm94RGV0YWlsKSB7XG5cdGNvbnN0IGRldGFpbHNQcm9wZXJ0aWVzID0gYXdhaXQgZ2V0TWFpbGJveERldGFpbHNBbmRQcm9wZXJ0aWVzKG1haWxib3hEZXRhaWxzKVxuXHRjb25zdCBib2R5VGV4dCA9IGxhbmdcblx0XHQuZ2V0KFwiZGVmYXVsdFNoYXJlR2lmdENhcmRCb2R5X21zZ1wiLCB7XG5cdFx0XHRcIntsaW5rfVwiOiAnPGEgaHJlZj1cIicgKyBsaW5rICsgJ1wiPicgKyBsaW5rICsgXCI8L2E+XCIsXG5cdFx0XHRcInt1c2VybmFtZX1cIjogbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyR3JvdXBJbmZvLm5hbWUsXG5cdFx0fSlcblx0XHQuc3BsaXQoXCJcXG5cIilcblx0XHQuam9pbihcIjxiciAvPlwiKVxuXHRjb25zdCB7IGdpZnRDYXJkU3ViamVjdCB9ID0gYXdhaXQgbG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IuZ2V0KFRyYW5zbGF0aW9uU2VydmljZSwgY3JlYXRlVHJhbnNsYXRpb25HZXRJbih7IGxhbmc6IGxhbmcuY29kZSB9KSlcblx0bG9jYXRvclxuXHRcdC5zZW5kTWFpbE1vZGVsKGRldGFpbHNQcm9wZXJ0aWVzLm1haWxib3hEZXRhaWxzLCBkZXRhaWxzUHJvcGVydGllcy5tYWlsYm94UHJvcGVydGllcylcblx0XHQudGhlbigobW9kZWwpID0+IG1vZGVsLmluaXRXaXRoVGVtcGxhdGUoe30sIGdpZnRDYXJkU3ViamVjdCwgYXBwZW5kRW1haWxTaWduYXR1cmUoYm9keVRleHQsIGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMpLCBbXSwgZmFsc2UpKVxuXHRcdC50aGVuKChtb2RlbCkgPT4gY3JlYXRlTWFpbEVkaXRvckRpYWxvZyhtb2RlbCwgZmFsc2UpKVxuXHRcdC50aGVuKChkaWFsb2cpID0+IGRpYWxvZy5zaG93KCkpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldE1haWxib3hEZXRhaWxzQW5kUHJvcGVydGllcyhcblx0bWFpbGJveERldGFpbHM6IE1haWxib3hEZXRhaWwgfCBudWxsIHwgdW5kZWZpbmVkLFxuKTogUHJvbWlzZTx7IG1haWxib3hEZXRhaWxzOiBNYWlsYm94RGV0YWlsOyBtYWlsYm94UHJvcGVydGllczogTWFpbGJveFByb3BlcnRpZXMgfT4ge1xuXHRtYWlsYm94RGV0YWlscyA9IG1haWxib3hEZXRhaWxzID8/IChhd2FpdCBsb2NhdG9yLm1haWxib3hNb2RlbC5nZXRVc2VyTWFpbGJveERldGFpbHMoKSlcblx0Y29uc3QgbWFpbGJveFByb3BlcnRpZXMgPSBhd2FpdCBsb2NhdG9yLm1haWxib3hNb2RlbC5nZXRNYWlsYm94UHJvcGVydGllcyhtYWlsYm94RGV0YWlscy5tYWlsYm94R3JvdXBSb290KVxuXHRyZXR1cm4geyBtYWlsYm94RGV0YWlscywgbWFpbGJveFByb3BlcnRpZXMgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQWEsd0JBQXdCO01BQ3hCLHNDQUFzQztNQUN0Qyw2QkFBNkI7TUFDN0IsNEJB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
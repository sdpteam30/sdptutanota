import m from "mithril";
import { modal } from "../../../common/gui/base/Modal";
import { px } from "../../../common/gui/size";
import { isKeyPressed } from "../../../common/misc/KeyManager";
import stream from "mithril/stream";
import { Keys } from "../../../common/api/common/TutanotaConstants";
import { TemplatePopupResultRow } from "./TemplatePopupResultRow.js";
import { TemplateExpander } from "./TemplateExpander.js";
import { lang, languageByCode } from "../../../common/misc/LanguageViewModel";
import { windowFacade } from "../../../common/misc/WindowFacade";
import { TemplateGroupRootTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { Button } from "../../../common/gui/base/Button.js";
import { SELECT_NEXT_TEMPLATE, SELECT_PREV_TEMPLATE, TEMPLATE_SHORTCUT_PREFIX } from "../model/TemplatePopupModel.js";
import { attachDropdown, DomRectReadOnlyPolyfilled } from "../../../common/gui/base/Dropdown.js";
import { debounce, downcast, neverNull } from "@tutao/tutanota-utils";
import { locator } from "../../../common/api/main/CommonLocator";
import { TemplateSearchBar } from "./TemplateSearchBar.js";
import { getSharedGroupName, hasCapabilityOnGroup } from "../../../common/sharing/GroupUtils";
import { createInitialTemplateListIfAllowed } from "../TemplateGroupUtils.js";
import { getConfirmation } from "../../../common/gui/base/GuiUtils";
import { ScrollSelectList } from "../../../common/gui/ScrollSelectList";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { TEMPLATE_LIST_ENTRY_WIDTH, TEMPLATE_POPUP_HEIGHT, TEMPLATE_POPUP_TWO_COLUMN_MIN_WIDTH } from "./TemplateConstants.js";
/**
 *	Creates a Modal/Popup that allows user to paste templates directly into the MailEditor.
 *	Also allows user to change desired language when pasting.
 */
export function showTemplatePopupInEditor(templateModel, editor, template, highlightedText) {
    const initialSearchString = template ? TEMPLATE_SHORTCUT_PREFIX + template.tag : highlightedText;
    const cursorRect = editor.getCursorPosition();
    const editorRect = editor.getDOM().getBoundingClientRect();
    const onSelect = (text) => {
        editor.insertHTML(text);
        editor.focus();
    };
    let rect;
    const availableHeightBelowCursor = window.innerHeight - cursorRect.bottom;
    const popUpHeight = TEMPLATE_POPUP_HEIGHT + 10; // height + 10px offset for space from the bottom of the screen
    // By default the popup is shown below the cursor. If there is not enough space move the popup above the cursor
    const popUpWidth = editorRect.right - editorRect.left;
    if (availableHeightBelowCursor < popUpHeight) {
        const diff = popUpHeight - availableHeightBelowCursor;
        rect = new DomRectReadOnlyPolyfilled(editorRect.left, cursorRect.bottom - diff, popUpWidth, cursorRect.height);
    }
    else {
        rect = new DomRectReadOnlyPolyfilled(editorRect.left, cursorRect.bottom, popUpWidth, cursorRect.height);
    }
    const popup = new TemplatePopup(templateModel, rect, onSelect, initialSearchString, () => editor.focus());
    templateModel.search(initialSearchString);
    popup.show();
}
export class TemplatePopup {
    restoreEditorFocus;
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
        this._searchBarValue = stream(initialSearchString);
        this._templateModel = templateModel;
        this._shortcuts = [
            {
                key: Keys.ESC,
                enabled: () => true,
                exec: () => {
                    this.restoreEditorFocus?.();
                    this._close();
                    m.redraw();
                },
                help: "closeTemplate_action",
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
                help: "insertTemplate_action",
            },
            {
                key: Keys.UP,
                enabled: () => true,
                exec: () => {
                    this._templateModel.selectNextTemplate(SELECT_PREV_TEMPLATE);
                },
                help: "selectPreviousTemplate_action",
            },
            {
                key: Keys.DOWN,
                enabled: () => true,
                exec: () => {
                    this._templateModel.selectNextTemplate(SELECT_NEXT_TEMPLATE);
                },
                help: "selectNextTemplate_action",
            },
        ];
        this._redrawStream = templateModel.searchResults.map((results) => {
            m.redraw();
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
            type: "primary" /* ButtonType.Primary */,
        };
        this._debounceFilter = debounce(200, (value) => {
            templateModel.search(value);
        });
        this._debounceFilter(initialSearchString);
    }
    view = () => {
        const showTwoColumns = this._isScreenWideEnough();
        return m(".flex.flex-column.abs.elevated-bg.border-radius.dropdown-shadow", {
            // Main Wrapper
            style: {
                width: px(this._rect.width),
                height: px(TEMPLATE_POPUP_HEIGHT),
                top: px(this._rect.top),
                left: px(this._rect.left),
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
            },
        }, [
            this._renderHeader(),
            m(".flex.flex-grow.scroll.mb-s", [
                m(".flex.flex-column.scroll" + (showTwoColumns ? ".pr" : ""), {
                    style: {
                        flex: "1 1 40%",
                    },
                }, this._renderList()),
                showTwoColumns
                    ? m(".flex.flex-column.flex-grow-shrink-half", {
                        style: {
                            flex: "1 1 60%",
                        },
                    }, this._renderRightColumn())
                    : null,
            ]),
        ]);
    };
    _renderHeader() {
        const selectedTemplate = this._templateModel.getSelectedTemplate();
        return m(".flex-space-between.center-vertically.pl.pr-s", [
            m(".flex-start", [m(".flex.center-vertically", this._renderSearchBar()), this._renderAddButton()]),
            m(".flex-end", [
                selectedTemplate
                    ? this._renderEditButtons(selectedTemplate) // Right header wrapper
                    : null,
            ]),
        ]);
    }
    _renderSearchBar = () => {
        return m(TemplateSearchBar, {
            value: this._searchBarValue,
            placeholder: "filter_label",
            keyHandler: (keyPress) => {
                if (isKeyPressed(keyPress.key, Keys.DOWN, Keys.UP)) {
                    // This duplicates the listener set in this._shortcuts
                    // because the input consumes the event
                    this._templateModel.selectNextTemplate(isKeyPressed(keyPress.key, Keys.UP) ? SELECT_PREV_TEMPLATE : SELECT_NEXT_TEMPLATE);
                    return false;
                }
                else {
                    return true;
                }
            },
            oninput: (value) => {
                this._debounceFilter(value);
            },
            oncreate: (vnode) => {
                this._inputDom = vnode.dom.firstElementChild; // firstElementChild is the input field of the input wrapper
            },
        });
    };
    _renderAddButton() {
        const attrs = this._createAddButtonAttributes();
        return m("", {
            onkeydown: (e) => {
                // prevents tabbing into the background of the modal
                if (isKeyPressed(e.key, Keys.TAB) && !this._templateModel.getSelectedTemplate()) {
                    this._inputDom?.focus();
                    e.preventDefault();
                }
            },
        }, attrs ? m(IconButton, attrs) : null);
    }
    _createAddButtonAttributes() {
        const templateGroupInstances = this._templateModel.getTemplateGroupInstances();
        const writeableGroups = templateGroupInstances.filter((instance) => hasCapabilityOnGroup(locator.logins.getUserController().user, instance.group, "1" /* ShareCapability.Write */));
        if (templateGroupInstances.length === 0) {
            return {
                title: "createTemplate_action",
                click: () => {
                    createInitialTemplateListIfAllowed().then((groupRoot) => {
                        if (groupRoot) {
                            this.showTemplateEditor(null, groupRoot);
                        }
                    });
                },
                icon: "Add" /* Icons.Add */,
                colors: "drawernav" /* ButtonColor.DrawerNav */,
            };
        }
        else if (writeableGroups.length === 1) {
            return {
                title: "createTemplate_action",
                click: () => this.showTemplateEditor(null, writeableGroups[0].groupRoot),
                icon: "Add" /* Icons.Add */,
                colors: "drawernav" /* ButtonColor.DrawerNav */,
            };
        }
        else if (writeableGroups.length > 1) {
            return attachDropdown({
                mainButtonAttrs: {
                    title: "createTemplate_action",
                    icon: "Add" /* Icons.Add */,
                    colors: "drawernav" /* ButtonColor.DrawerNav */,
                },
                childAttrs: () => writeableGroups.map((groupInstances) => {
                    return {
                        label: lang.makeTranslation("group_name", getSharedGroupName(groupInstances.groupInfo, locator.logins.getUserController(), true)),
                        click: () => this.showTemplateEditor(null, groupInstances.groupRoot),
                    };
                }),
            });
        }
        else {
            return null;
        }
    }
    _renderEditButtons(selectedTemplate) {
        const selectedContent = this._templateModel.getSelectedContent();
        const selectedGroup = this._templateModel.getSelectedTemplateGroupInstance();
        const canEdit = !!selectedGroup && hasCapabilityOnGroup(locator.logins.getUserController().user, selectedGroup.group, "1" /* ShareCapability.Write */);
        return [
            m(".flex.flex-column.justify-center.mr-m", selectedContent ? m("", lang.get(languageByCode[selectedContent.languageCode].textId)) : ""),
            m(IconButton, attachDropdown({
                mainButtonAttrs: {
                    title: "chooseLanguage_action",
                    icon: "Language" /* Icons.Language */,
                },
                childAttrs: () => selectedTemplate.contents.map((content) => {
                    const langCode = downcast(content.languageCode);
                    return {
                        label: languageByCode[langCode].textId,
                        click: (e) => {
                            e.stopPropagation();
                            this._templateModel.setSelectedContentLanguage(langCode);
                            this._inputDom?.focus();
                        },
                    };
                }),
            })),
            canEdit
                ? [
                    m(IconButton, {
                        title: "editTemplate_action",
                        click: () => locator.entityClient
                            .load(TemplateGroupRootTypeRef, neverNull(selectedTemplate._ownerGroup))
                            .then((groupRoot) => this.showTemplateEditor(selectedTemplate, groupRoot)),
                        icon: "Edit" /* Icons.Edit */,
                        colors: "drawernav" /* ButtonColor.DrawerNav */,
                    }),
                    m(IconButton, {
                        title: "remove_action",
                        click: () => {
                            getConfirmation("deleteTemplate_msg").confirmed(() => locator.entityClient.erase(selectedTemplate));
                        },
                        icon: "Trash" /* Icons.Trash */,
                        colors: "drawernav" /* ButtonColor.DrawerNav */,
                    }),
                ]
                : null,
            m(".pr-s", m(".nav-bar-spacer")),
            m("", {
                onkeydown: (e) => {
                    // prevents tabbing into the background of the modal
                    if (isKeyPressed(e.key, Keys.TAB)) {
                        this._inputDom?.focus();
                        e.preventDefault();
                    }
                },
            }, m(Button, this._selectTemplateButtonAttrs)),
        ];
    }
    _renderList() {
        return m(ScrollSelectList, {
            items: this._templateModel.searchResults(),
            selectedItem: this._templateModel.selectedTemplate(),
            onItemSelected: this._templateModel.selectedTemplate,
            emptyListMessage: () => (this._templateModel.isLoaded() ? "nothingFound_label" : "loadingTemplates_label"),
            width: TEMPLATE_LIST_ENTRY_WIDTH,
            renderItem: (template) => m(TemplatePopupResultRow, {
                template: template,
            }),
            onItemDoubleClicked: (_) => {
                const selected = this._templateModel.getSelectedContent();
                if (selected) {
                    this._onSelect(selected.text);
                    this._close();
                }
            },
        });
    }
    _renderRightColumn() {
        const template = this._templateModel.getSelectedTemplate();
        if (template) {
            return [
                m(TemplateExpander, {
                    template: template,
                    model: this._templateModel,
                }),
            ];
        }
        else {
            return null;
        }
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
        import("../../settings/TemplateEditor.js").then((editor) => {
            editor.showTemplateEditor(templateToEdit, groupRoot);
        });
    }
}
//# sourceMappingURL=TemplatePopup.js.map
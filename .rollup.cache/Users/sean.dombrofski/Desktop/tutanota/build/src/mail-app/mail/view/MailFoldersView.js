import m from "mithril";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { SidebarSection } from "../../../common/gui/SidebarSection.js";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { elementIdPart, getElementId } from "../../../common/api/common/utils/EntityUtils.js";
import { isSelectedPrefix } from "../../../common/gui/base/NavButton.js";
import { MAIL_PREFIX } from "../../../common/misc/RouteChange.js";
import { MailFolderRow } from "./MailFolderRow.js";
import { last, noOp } from "@tutao/tutanota-utils";
import { attachDropdown } from "../../../common/gui/base/Dropdown.js";
import { MailSetKind } from "../../../common/api/common/TutanotaConstants.js";
import { px, size } from "../../../common/gui/size.js";
import { RowButton } from "../../../common/gui/base/buttons/RowButton.js";
import { getFolderName, MAX_FOLDER_INDENT_LEVEL } from "../model/MailUtils.js";
import { isSpamOrTrashFolder } from "../model/MailChecks.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
/** Displays a tree of all folders. */
export class MailFoldersView {
    // Contains the id of the visible row
    visibleRow = null;
    view({ attrs }) {
        const { mailboxDetail, mailModel } = attrs;
        const groupCounters = mailModel.mailboxCounters()[mailboxDetail.mailGroup._id] || {};
        const folders = mailModel.getFolderSystemByGroupId(mailboxDetail.mailGroup._id);
        // Important: this array is keyed so each item must have a key and `null` cannot be in the array
        // So instead we push or not push into array
        const customSystems = folders?.customSubtrees ?? [];
        const systemSystems = folders?.systemSubtrees.filter((f) => f.folder.folderType !== MailSetKind.Imported) ?? [];
        const children = [];
        const selectedFolder = folders
            ?.getIndentedList()
            .map((f) => f.folder)
            .find((f) => isSelectedPrefix(MAIL_PREFIX + "/" + getElementId(f)));
        const path = folders && selectedFolder ? folders.getPathToFolder(selectedFolder._id) : [];
        const isInternalUser = locator.logins.isInternalUserLoggedIn();
        const systemChildren = folders && this.renderFolderTree(systemSystems, groupCounters, folders, attrs, path, isInternalUser);
        if (systemChildren) {
            children.push(...systemChildren.children);
        }
        if (isInternalUser) {
            const customChildren = folders ? this.renderFolderTree(customSystems, groupCounters, folders, attrs, path, isInternalUser).children : [];
            children.push(m(SidebarSection, {
                name: "yourFolders_action",
                button: attrs.inEditMode ? this.renderCreateFolderAddButton(null, attrs) : this.renderEditFoldersButton(attrs),
                key: "yourFolders", // we need to set a key because folder rows also have a key.
            }, customChildren));
            children.push(this.renderAddFolderButtonRow(attrs));
        }
        return children;
    }
    renderFolderTree(subSystems, groupCounters, folders, attrs, path, isInternalUser, indentationLevel = 0) {
        // we need to keep track of how many rows we've drawn so far for this subtree so that we can draw hierarchy lines correctly
        const result = { children: [], numRows: 0 };
        for (let system of subSystems) {
            const id = getElementId(system.folder);
            const folderName = getFolderName(system.folder);
            const button = {
                label: lang.makeTranslation(`folder:${folderName}`, folderName),
                href: () => {
                    if (attrs.inEditMode) {
                        return m.route.get();
                    }
                    else {
                        const folderElementId = getElementId(system.folder);
                        const mailId = attrs.mailFolderElementIdToSelectedMailId.get(folderElementId);
                        if (mailId) {
                            return `${MAIL_PREFIX}/${folderElementId}/${mailId}`;
                        }
                        else {
                            return `${MAIL_PREFIX}/${folderElementId}`;
                        }
                    }
                },
                isSelectedPrefix: attrs.inEditMode ? false : MAIL_PREFIX + "/" + getElementId(system.folder),
                colors: "nav" /* NavButtonColor.Nav */,
                click: () => attrs.onFolderClick(system.folder),
                dropHandler: (dropData) => attrs.onFolderDrop(dropData, system.folder),
                disableHoverBackground: true,
                disabled: attrs.inEditMode,
            };
            const currentExpansionState = attrs.inEditMode ? true : attrs.expandedFolders.has(getElementId(system.folder)) ?? false; //default is false
            const hasChildren = system.children.length > 0;
            const counterId = getElementId(system.folder);
            const summedCount = !currentExpansionState && hasChildren ? this.getTotalFolderCounter(groupCounters, system) : groupCounters[counterId];
            const childResult = hasChildren && currentExpansionState
                ? this.renderFolderTree(system.children, groupCounters, folders, attrs, path, isInternalUser, indentationLevel + 1)
                : { children: null, numRows: 0 };
            const isTrashOrSpam = system.folder.folderType === MailSetKind.TRASH || system.folder.folderType === MailSetKind.SPAM;
            const isRightButtonVisible = this.visibleRow === id;
            const rightButton = isInternalUser && !isTrashOrSpam && (isRightButtonVisible || attrs.inEditMode)
                ? this.createFolderMoreButton(system.folder, folders, attrs, () => {
                    this.visibleRow = null;
                })
                : null;
            const render = m.fragment({
                key: id,
            }, [
                m(MailFolderRow, {
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
                    },
                }),
                childResult.children,
            ]);
            result.numRows += childResult.numRows + 1;
            result.children.push(render);
        }
        return result;
    }
    renderAddFolderButtonRow(attrs) {
        // This button needs to fill the whole row, but is not a navigation button (so IconButton or NavButton weren't appropriate)
        return m(RowButton, {
            label: "addFolder_action",
            key: "addFolder",
            icon: "Add" /* Icons.Add */,
            class: "folder-row mlr-button border-radius-small",
            style: {
                width: `calc(100% - ${px(size.hpad_button * 2)})`,
            },
            onclick: () => {
                attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, null, null);
            },
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
                icon: "More" /* Icons.More */,
                colors: "nav" /* ButtonColor.Nav */,
                size: 1 /* ButtonSize.Compact */,
            },
            childAttrs: () => {
                return folder.folderType === MailSetKind.CUSTOM
                    ? // cannot add new folder to custom folder in spam or trash folder
                        isSpamOrTrashFolder(folders, folder)
                            ? [this.editButtonAttrs(attrs, folders, folder), this.deleteButtonAttrs(attrs, folder)]
                            : [this.editButtonAttrs(attrs, folders, folder), this.addButtonAttrs(attrs, folder), this.deleteButtonAttrs(attrs, folder)]
                    : [this.addButtonAttrs(attrs, folder)];
            },
            onClose,
        });
    }
    deleteButtonAttrs(attrs, folder) {
        return {
            label: "delete_action",
            icon: "Trash" /* Icons.Trash */,
            click: () => {
                attrs.onDeleteCustomMailFolder(folder);
            },
        };
    }
    addButtonAttrs(attrs, folder) {
        return {
            label: "addFolder_action",
            icon: "Add" /* Icons.Add */,
            click: () => {
                attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, null, folder);
            },
        };
    }
    editButtonAttrs(attrs, folders, folder) {
        return {
            label: "edit_action",
            icon: "Edit" /* Icons.Edit */,
            click: () => {
                attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, folder, folder.parentFolder ? folders.getFolderById(elementIdPart(folder.parentFolder)) : null);
            },
        };
    }
    renderCreateFolderAddButton(parentFolder, attrs) {
        return m(IconButton, {
            title: "addFolder_action",
            click: () => {
                return attrs.onShowFolderAddEditDialog(attrs.mailboxDetail.mailGroup._id, null, parentFolder);
            },
            icon: "Add" /* Icons.Add */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
    renderEditFoldersButton(attrs) {
        return m(IconButton, {
            title: "edit_action",
            click: () => attrs.onEditMailbox(),
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
}
//# sourceMappingURL=MailFoldersView.js.map
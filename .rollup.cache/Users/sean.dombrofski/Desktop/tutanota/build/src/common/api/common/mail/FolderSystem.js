import { groupBy, partition } from "@tutao/tutanota-utils";
import { isFolder, MailSetKind } from "../TutanotaConstants.js";
import { elementIdPart, getElementId, isSameId } from "../utils/EntityUtils.js";
/** Accessor for the folder trees. */
export class FolderSystem {
    systemSubtrees;
    customSubtrees;
    importedMailSet;
    constructor(mailSets) {
        const [folders, nonFolders] = partition(mailSets, (f) => isFolder(f));
        const folderByParent = groupBy(folders, (folder) => (folder.parentFolder ? elementIdPart(folder.parentFolder) : null));
        const topLevelFolders = folders.filter((f) => f.parentFolder == null);
        const [systemFolders, customFolders] = partition(topLevelFolders, (f) => f.folderType !== MailSetKind.CUSTOM);
        this.importedMailSet = nonFolders.find((f) => f.folderType === MailSetKind.Imported) || null;
        this.systemSubtrees = systemFolders.sort(compareSystem).map((f) => this.makeSubtree(folderByParent, f, compareCustom));
        this.customSubtrees = customFolders.sort(compareCustom).map((f) => this.makeSubtree(folderByParent, f, compareCustom));
    }
    getIndentedList(excludeFolder = null) {
        return [...this.getIndentedFolderList(this.systemSubtrees, excludeFolder), ...this.getIndentedFolderList(this.customSubtrees, excludeFolder)];
    }
    /** Search for a specific folder type. Some mailboxes might not have some system folders! */
    getSystemFolderByType(type) {
        return this.systemSubtrees.find((f) => f.folder.folderType === type)?.folder ?? null;
    }
    getFolderById(folderId) {
        const subtree = this.getFolderByIdInSubtrees(this.systemSubtrees, folderId) ?? this.getFolderByIdInSubtrees(this.customSubtrees, folderId);
        return subtree?.folder ?? null;
    }
    getFolderByMail(mail) {
        const sets = mail.sets;
        for (const setId of sets) {
            const folder = this.getFolderById(elementIdPart(setId));
            if (folder != null) {
                return folder;
            }
        }
        return null;
    }
    /**
     * Returns the children of a parent (applies only to custom folders)
     * if no parent is given, the top level custom folders are returned
     */
    getCustomFoldersOfParent(parent) {
        if (parent) {
            const parentFolder = this.getFolderByIdInSubtrees([...this.customSubtrees, ...this.systemSubtrees], elementIdPart(parent));
            return parentFolder ? parentFolder.children.map((child) => child.folder) : [];
        }
        else {
            return this.customSubtrees.map((subtree) => subtree.folder);
        }
    }
    getDescendantFoldersOfParent(parent) {
        const parentFolder = this.getFolderByIdInSubtrees([...this.customSubtrees, ...this.systemSubtrees], elementIdPart(parent));
        if (parentFolder) {
            return this.getIndentedFolderList([parentFolder]).slice(1);
        }
        else {
            return [];
        }
    }
    /** returns all parents of the folder, including the folder itself */
    getPathToFolder(folderId) {
        return this.getPathToFolderInSubtrees(this.systemSubtrees, folderId) ?? this.getPathToFolderInSubtrees(this.customSubtrees, folderId) ?? [];
    }
    checkFolderForAncestor(folder, potentialAncestorId) {
        let currentFolderPointer = folder;
        while (true) {
            if (currentFolderPointer?.parentFolder == null) {
                return false;
            }
            else if (isSameId(currentFolderPointer.parentFolder, potentialAncestorId)) {
                return true;
            }
            currentFolderPointer = this.getFolderById(elementIdPart(currentFolderPointer.parentFolder));
        }
    }
    getIndentedFolderList(subtrees, excludeFolder = null, currentLevel = 0) {
        const plainList = [];
        for (const subtree of subtrees) {
            if (!excludeFolder || !isSameId(subtree.folder._id, excludeFolder._id)) {
                plainList.push({ level: currentLevel, folder: subtree.folder });
                plainList.push(...this.getIndentedFolderList(subtree.children, excludeFolder, currentLevel + 1));
            }
        }
        return plainList;
    }
    getIndentedSystemList() {
        return this.systemSubtrees.map((subtree) => {
            return { level: 0, folder: subtree.folder };
        });
    }
    getFolderByIdInSubtrees(systems, folderId) {
        return this.getFolderBy(systems, (system) => isSameId(getElementId(system.folder), folderId));
    }
    getFolderBy(systems, predicate) {
        const topLevel = systems.find(predicate);
        if (topLevel) {
            return topLevel;
        }
        else {
            for (const topLevelSystem of systems) {
                const found = this.getFolderBy(topLevelSystem.children, predicate);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }
    getPathToFolderInSubtrees(systems, folderId) {
        for (const system of systems) {
            if (isSameId(system.folder._id, folderId)) {
                return [system.folder];
            }
            const subpath = this.getPathToFolderInSubtrees(system.children, folderId);
            if (subpath) {
                return [system.folder].concat(...subpath);
            }
        }
        return null;
    }
    makeSubtree(folderByParent, parent, comparator) {
        const childrenFolders = folderByParent.get(getElementId(parent));
        if (childrenFolders) {
            const childSystems = childrenFolders
                .slice()
                .sort(comparator)
                .map((child) => this.makeSubtree(folderByParent, child, comparator));
            return { folder: parent, children: childSystems };
        }
        else {
            return { folder: parent, children: [] };
        }
    }
}
function compareCustom(folder1, folder2) {
    return folder1.name.localeCompare(folder2.name);
}
const folderTypeToOrder = {
    [MailSetKind.INBOX]: 0,
    [MailSetKind.DRAFT]: 1,
    [MailSetKind.SENT]: 2,
    [MailSetKind.TRASH]: 4,
    [MailSetKind.ARCHIVE]: 5,
    [MailSetKind.SPAM]: 6,
    [MailSetKind.ALL]: 7,
};
function compareSystem(folder1, folder2) {
    const order1 = folderTypeToOrder[folder1.folderType] ?? 7;
    const order2 = folderTypeToOrder[folder2.folderType] ?? 7;
    return order1 - order2;
}
//# sourceMappingURL=FolderSystem.js.map
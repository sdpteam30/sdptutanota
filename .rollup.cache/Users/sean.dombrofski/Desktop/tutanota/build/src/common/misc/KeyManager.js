import { Keys } from "../api/common/TutanotaConstants";
import { mod } from "@tutao/tutanota-utils";
import { assertMainOrNodeBoot, isAppleDevice } from "../api/common/Env";
import m from "mithril";
assertMainOrNodeBoot();
export const TABBABLE = "button, input, textarea, div[contenteditable='true'], [tabindex='0'], a, [role=button], [role=input]";
/**
 * Convert the keyboard event into a key press
 * @param event event to convert
 */
export function keyboardEventToKeyPress(event) {
    const ctrlOrCmd = isAppleDevice() ? event.metaKey : event.ctrlKey;
    return {
        key: event.key,
        ctrlOrCmd,
        shift: event.shiftKey,
        alt: event.altKey,
        // Ignore these modifiers if ctrlOrCmd is set, as it will otherwise cause either both ctrl/ctrlOrCmd to be set or meta/ctrlOrCmd to be set, which will
        // make the shortcut not fire
        ctrl: !ctrlOrCmd && event.ctrlKey,
        meta: !ctrlOrCmd && event.metaKey,
    };
}
export function useKeyHandler(e, onKey) {
    // keydown is used to cancel certain keypresses of the user (mainly needed for the BubbleTextField)
    const key = keyboardEventToKeyPress(e);
    return onKey != null ? onKey(key) : true;
}
function isFocusable(e) {
    if ("disabled" in e && !!e.disabled) {
        return false;
    }
    if (e.tabIndex === -1) {
        // also filter for tabIndex here to restrict tabbing to invisible inputs
        return false;
    }
    return (e.style.display !== "none" &&
        // check that none of the parents have hidden=true or aria-hidden=true
        e.closest("[hidden]:not([hidden=false]), [aria-hidden]:not([aria-hidden=false]), [inert]:not([inert=false])") == null);
}
export function focusPrevious(dom) {
    const tabbable = Array.from(dom.querySelectorAll(TABBABLE)).filter(isFocusable);
    const selected = tabbable.find((e) => document.activeElement === e);
    if (selected) {
        //work around for squire so tabulator actions are executed properly
        //squire makes a list which can be indented and manages this with tab and shift tab
        const selection = window.getSelection();
        if (selection &&
            selection.focusNode &&
            (selection.focusNode.nodeName === "LI" || (selection.focusNode.parentNode && selection.focusNode.parentNode.nodeName === "LI"))) {
            return true; //dont change selection if selection is in list
        }
        else {
            tabbable[mod(tabbable.indexOf(selected) - 1, tabbable.length)].focus();
            return false;
        }
    }
    else if (tabbable.length > 0) {
        tabbable[tabbable.length - 1].focus();
        return false;
    }
    return true;
}
export function focusNext(dom) {
    const tabbable = Array.from(dom.querySelectorAll(TABBABLE)).filter(isFocusable);
    const selected = tabbable.find((e) => document.activeElement === e);
    if (selected) {
        //work around for squire so tabulator actions are executed properly
        //squire makes a list which can be indented and manages this with tab and shift tab
        const selection = window.getSelection();
        if (selection &&
            selection.focusNode &&
            (selection.focusNode.nodeName === "LI" || (selection.focusNode.parentNode && selection.focusNode.parentNode.nodeName === "LI"))) {
            return true; //dont change selection
        }
        else {
            tabbable[mod(tabbable.indexOf(selected) + 1, tabbable.length)].focus();
            return false;
        }
    }
    else if (tabbable.length > 0) {
        tabbable[0].focus();
        return false;
    }
    return true;
}
function createKeyIdentifier(key, modifiers) {
    return (key +
        (modifiers?.ctrlOrCmd ? "X" : "") +
        (modifiers?.ctrl ? "C" : "") +
        (modifiers?.alt ? "A" : "") +
        (modifiers?.shift ? "S" : "") +
        (modifiers?.meta ? "M" : ""));
}
/**
 * KeyManager offers the API for (un)registration of all keyboard shortcuts and routes
 * key presses to the correct handler.
 *
 * Shortcuts that are registered by a modal always take precedence.
 */
class KeyManager {
    keyToShortcut;
    // override for shortcuts: If a modal is visible, only modal-shortcuts should be active
    keyToModalShortcut;
    desktopShortcuts;
    isHelpOpen = false;
    constructor() {
        const helpShortcut = {
            key: Keys.F1,
            exec: () => this.openF1Help(),
            help: "showHelp_action",
        };
        const helpId = createKeyIdentifier(helpShortcut.key.code);
        this.keyToShortcut = new Map([[helpId, helpShortcut]]);
        // override for _shortcuts: If a modal is visible, only modal-shortcuts should be active
        this.keyToModalShortcut = new Map([[helpId, helpShortcut]]);
        this.desktopShortcuts = [];
        if (!window.document.addEventListener)
            return;
        window.document.addEventListener("keydown", (e) => this.handleKeydown(e), false);
    }
    handleKeydown(e) {
        // If we get a keyboard event while in a composition system (such as an input method editor),
        // it should be ignored (since the system should be handling key commands for that).
        if (!e.isComposing) {
            const keysToShortcuts = this.keyToModalShortcut.size > 1 ? this.keyToModalShortcut : this.keyToShortcut;
            const keyPress = keyboardEventToKeyPress(e);
            const shortcut = keyPress.key ? keysToShortcuts.get(createKeyIdentifier(e.key.toLowerCase(), keyPress)) : null;
            if (shortcut != null && (shortcut.enabled == null || shortcut.enabled())) {
                if (shortcut.exec(keyPress) !== true) {
                    e.preventDefault();
                }
            }
            m.redraw();
        }
    }
    /**
     * open a dialog listing all currently active shortcuts
     * @param forceBaseShortcuts set to true for the special case where the dialog is opened
     * from the support dropdown (which registers its own shortcuts as modal shortcuts)
     */
    openF1Help(forceBaseShortcuts = false) {
        if (this.isHelpOpen)
            return;
        this.isHelpOpen = true;
        // we decide which shortcuts to show right now.
        //
        // the help dialog will register its own shortcuts which would override the
        // standard shortcuts if we did this later
        //
        // we can't do this in the register/unregister method because the modal
        // unregisters the old dialog shortcuts and then registers the new ones
        // when the top dialog changes, leading to a situation where
        // modalshortcuts is empty.
        const shortcutsToShow = this.keyToModalShortcut.size > 1 && !forceBaseShortcuts
            ? Array.from(this.keyToModalShortcut.values()) // copy values, they will change
            : [...this.keyToShortcut.values(), ...this.desktopShortcuts];
        import("../gui/dialogs/ShortcutDialog.js").then(({ showShortcutDialog }) => showShortcutDialog(shortcutsToShow)).then(() => (this.isHelpOpen = false));
    }
    registerShortcuts(shortcuts) {
        this.applyOperation(shortcuts, (id, s) => this.keyToShortcut.set(id, s));
    }
    unregisterShortcuts(shortcuts) {
        this.applyOperation(shortcuts, (id, _) => this.keyToShortcut.delete(id));
    }
    registerDesktopShortcuts(shortcuts) {
        this.applyOperation(shortcuts, (_, s) => this.desktopShortcuts.push(s));
    }
    registerModalShortcuts(shortcuts) {
        this.applyOperation(shortcuts, (id, s) => this.keyToModalShortcut.set(id, s));
    }
    unregisterModalShortcuts(shortcuts) {
        this.applyOperation(shortcuts, (id, _) => this.keyToModalShortcut.delete(id));
    }
    /**
     *
     * @param shortcuts list of shortcuts to operate on
     * @param operation operation to execute for every shortcut and its ID
     * @private
     */
    applyOperation(shortcuts, operation) {
        for (const s of shortcuts) {
            operation(createKeyIdentifier(s.key.code, s), s);
        }
    }
}
/**
 *
 * @param key The key to be checked, should correspond to KeyEvent.key
 * @param keys Keys to be checked against, type of Keys
 */
export function isKeyPressed(key, ...keys) {
    if (key != null) {
        return keys.some((k) => k.code === key.toLowerCase());
    }
    return false;
}
export const keyManager = new KeyManager();
//# sourceMappingURL=KeyManager.js.map
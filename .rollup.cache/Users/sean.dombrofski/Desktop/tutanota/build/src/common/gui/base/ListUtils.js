import { Keys } from "../../api/common/TutanotaConstants.js";
import { mapLazily } from "@tutao/tutanota-utils";
import { isBrowser } from "../../api/common/Env.js";
export const ACTION_DISTANCE = 150;
export const PageSize = 100;
export function listSelectionKeyboardShortcuts(multiselectMode, callbacks) {
    const multiselectionEnabled = multiselectMode == 1 /* MultiselectMode.Enabled */ ? () => true : () => false;
    return [
        {
            key: Keys.UP,
            exec: mapLazily(callbacks, (list) => list?.selectPrevious(false)),
            help: "selectPrevious_action",
        },
        {
            key: Keys.K,
            exec: mapLazily(callbacks, (list) => list?.selectPrevious(false)),
            help: "selectPrevious_action",
        },
        {
            key: Keys.UP,
            shift: true,
            exec: mapLazily(callbacks, (list) => list?.selectPrevious(true)),
            help: "addPrevious_action",
            enabled: multiselectionEnabled,
        },
        {
            key: Keys.K,
            shift: true,
            exec: mapLazily(callbacks, (list) => list?.selectPrevious(true)),
            help: "addPrevious_action",
            enabled: multiselectionEnabled,
        },
        {
            key: Keys.DOWN,
            exec: mapLazily(callbacks, (list) => list?.selectNext(false)),
            help: "selectNext_action",
        },
        {
            key: Keys.J,
            exec: mapLazily(callbacks, (list) => list?.selectNext(false)),
            help: "selectNext_action",
        },
        {
            key: Keys.DOWN,
            shift: true,
            exec: mapLazily(callbacks, (list) => list?.selectNext(true)),
            help: "addNext_action",
            enabled: multiselectionEnabled,
        },
        {
            key: Keys.J,
            shift: true,
            exec: mapLazily(callbacks, (list) => list?.selectNext(true)),
            help: "addNext_action",
            enabled: multiselectionEnabled,
        },
        {
            key: Keys.A,
            ctrlOrCmd: true,
            shift: true,
            exec: mapLazily(callbacks, (list) => (list?.areAllSelected() ? list.selectNone() : list?.selectAll())),
            help: "selectAllLoaded_action",
            // this specific shortcut conflicts with a chrome shortcut. it was chosen because it's adjacent to ctrl + A
            // for select all.
            enabled: () => multiselectionEnabled() && !isBrowser(),
        },
    ];
}
export function onlySingleSelection(state) {
    if (state.selectedItems.size === 1) {
        return state.selectedItems.values().next().value;
    }
    else {
        return null;
    }
}
//# sourceMappingURL=ListUtils.js.map
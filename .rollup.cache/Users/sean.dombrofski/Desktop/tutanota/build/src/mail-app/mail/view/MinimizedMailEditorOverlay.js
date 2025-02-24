import m from "mithril";
import { px, size } from "../../../common/gui/size";
import { displayOverlay } from "../../../common/gui/base/Overlay";
import { DefaultAnimationTime } from "../../../common/gui/animation/Animations";
import { styles } from "../../../common/gui/styles";
import { MinimizedEditorOverlay } from "./MinimizedEditorOverlay";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { noOp } from "@tutao/tutanota-utils";
assertMainOrNode();
const MINIMIZED_OVERLAY_WIDTH_WIDE = 350;
const MINIMIZED_OVERLAY_WIDTH_SMALL = 220;
export function showMinimizedMailEditor(dialog, sendMailModel, viewModel, eventController, dispose, saveStatus) {
    let closeOverlayFunction = noOp; // will be assigned with the actual close function when overlay is visible.
    const minimizedEditor = viewModel.minimizeMailEditor(dialog, sendMailModel, dispose, saveStatus, () => closeOverlayFunction());
    // only show overlay once editor is gone
    setTimeout(() => {
        closeOverlayFunction = showMinimizedEditorOverlay(viewModel, minimizedEditor, eventController);
    }, DefaultAnimationTime);
}
function showMinimizedEditorOverlay(viewModel, minimizedEditor, eventController) {
    return displayOverlay(() => getOverlayPosition(), {
        view: () => m(MinimizedEditorOverlay, {
            viewModel,
            minimizedEditor,
            eventController,
        }),
    }, "slide-bottom", undefined, "minimized-shadow");
}
function getOverlayPosition() {
    return {
        bottom: styles.isUsingBottomNavigation() ? px(size.hpad) : px(size.vpad),
        // position will change with translateY
        right: styles.isUsingBottomNavigation() ? px(size.hpad) : px(size.hpad_medium),
        width: px(styles.isSingleColumnLayout() ? MINIMIZED_OVERLAY_WIDTH_SMALL : MINIMIZED_OVERLAY_WIDTH_WIDE),
        zIndex: 100 /* LayerType.LowPriorityOverlay */,
    };
}
//# sourceMappingURL=MinimizedMailEditorOverlay.js.map
import { DrawerMenu } from "./nav/DrawerMenu.js";
import { theme } from "./theme.js";
import m from "mithril";
import { lang } from "../misc/LanguageViewModel.js";
import { landmarkAttrs } from "./AriaUtils.js";
import { MainCreateButton } from "./MainCreateButton.js";
export class FolderColumnView {
    view({ attrs }) {
        return m(".flex.height-100p.nav-bg", [
            m(DrawerMenu, attrs.drawer),
            m(".folder-column.flex-grow.overflow-x-hidden.flex.col", landmarkAttrs("navigation" /* AriaLandmarks.Navigation */, lang.getTranslationText(attrs.ariaLabel)), [
                this.renderMainButton(attrs),
                m(".scroll.scrollbar-gutter-stable-or-fallback.visible-scrollbar.overflow-x-hidden.flex.col.flex-grow", {
                    onscroll: (e) => {
                        e.redraw = false;
                        const target = e.target;
                        if (attrs.button == null || target.scrollTop === 0) {
                            target.style.borderTop = "";
                        }
                        else {
                            target.style.borderTop = `1px solid ${theme.content_border}`;
                        }
                    },
                }, attrs.content),
            ]),
        ]);
    }
    renderMainButton(attrs) {
        if (attrs.button) {
            return m(".plr-button-double.scrollbar-gutter-stable-or-fallback.scroll", m(MainCreateButton, { label: attrs.button.label, click: attrs.button.click }));
        }
        else {
            return null;
        }
    }
}
//# sourceMappingURL=FolderColumnView.js.map
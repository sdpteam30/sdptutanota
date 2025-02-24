import m from "mithril";
import { CalendarSwipeHandler } from "./CalendarSwipeHandler.js";
import { lang } from "../../misc/LanguageViewModel.js";
export class Carousel {
    containerDom = null;
    swipeHandler = null;
    view(vnode) {
        const attrs = vnode.attrs;
        return m("section.flex-space-around.column-gap-s", {
            role: "group",
            "aria-roledescription": "carousel",
            "aria-label": lang.get(attrs.label),
            class: attrs.class,
            style: attrs.style,
            oncreate: (swiperNode) => {
                this.containerDom = swiperNode.dom;
                this.swipeHandler = new CalendarSwipeHandler(this.containerDom, (isNext) => attrs.onSwipe(isNext));
                this.swipeHandler.attach();
            },
        }, attrs.slides.map((slide) => renderSlide(slide)));
    }
}
function renderSlide(slide) {
    return m(".full-width.min-width-full", {
        role: "group",
        "aria-role": "slide",
        "aria-label": lang.get(slide.label),
    }, slide.element);
}
//# sourceMappingURL=Carousel.js.map
import m from "mithril";
import { px, size } from "../../../common/gui/size";
import { Icon } from "../../../common/gui/base/Icon";
import { colorForBg } from "../../../common/gui/base/GuiUtils";
const lineHeight = size.calendar_line_height;
const lineHeightPx = px(lineHeight);
export class CalendarEventBubble {
    hasFinishedInitialRender = false;
    oncreate(vnode) {
        this.hasFinishedInitialRender = true;
    }
    view({ attrs }) {
        // This helps us stop flickering in certain cases where we want to disable and re-enable fade in (ie. when dragging events)
        // Reapplying the animation to the element will cause it to trigger instantly, so we don't want to do that
        const doFadeIn = !this.hasFinishedInitialRender && attrs.fadeIn;
        const enablePointerEvents = attrs.enablePointerEvents;
        return m(".calendar-event.small.overflow-hidden.flex.cursor-pointer" +
            (doFadeIn ? ".fade-in" : "") +
            (attrs.noBorderLeft ? ".event-continues-left" : "") +
            (attrs.noBorderRight ? ".event-continues-right" : ""), {
            style: {
                background: "#" + attrs.color,
                color: colorForBg("#" + attrs.color),
                minHeight: lineHeightPx,
                height: px(attrs.height ? Math.max(attrs.height, 0) : lineHeight),
                "padding-top": px(attrs.verticalPadding || 0),
                opacity: attrs.opacity,
                pointerEvents: enablePointerEvents ? "auto" : "none",
            },
            tabIndex: enablePointerEvents ? "0" /* TabIndex.Default */ : "-1" /* TabIndex.Programmatic */,
            onclick: (e) => {
                e.stopPropagation();
                attrs.click(e, e.target);
            },
            onkeydown: (e) => {
                attrs.keyDown(e, e.target);
            },
        }, [
            attrs.hasAlarm
                ? m(Icon, {
                    icon: "Notifications" /* Icons.Notifications */,
                    style: {
                        fill: colorForBg("#" + attrs.color),
                        "padding-top": "2px",
                        "padding-right": "2px",
                    },
                    class: "icon-small",
                })
                : null,
            attrs.isAltered
                ? m(Icon, {
                    icon: "Edit" /* Icons.Edit */,
                    style: {
                        fill: colorForBg("#" + attrs.color),
                        "padding-top": "2px",
                        "padding-right": "2px",
                    },
                    class: "icon-small",
                })
                : null,
            attrs.isClientOnly
                ? m(Icon, {
                    icon: "Gift" /* Icons.Gift */,
                    style: {
                        fill: colorForBg("#" + attrs.color),
                        "padding-top": "2px",
                        "padding-right": "2px",
                    },
                    class: "icon-small",
                })
                : null,
            m(".flex.col", {
                style: {
                    // Limit the width to trigger ellipsis
                    width: "95%",
                },
            }, CalendarEventBubble.renderContent(attrs)),
        ]);
    }
    static renderContent({ height: maybeHeight, text, secondLineText, color }) {
        // If the bubble has 2 or more lines worth of vertical space, then we will render the text + the secondLineText on separate lines
        // Otherwise we will combine them onto a single line
        const height = maybeHeight ?? lineHeight;
        const isMultiline = height >= lineHeight * 2;
        if (isMultiline) {
            // How many lines of text that will fit in the bubble
            // we dont want any cut in half lines in case the bubble cannot fit a whole number of lines
            const linesInBubble = Math.floor(height / lineHeight);
            // leave space for the second text line. it will be restricted to a maximum of one line in height
            const topSectionMaxLines = secondLineText != null ? linesInBubble - 1 : linesInBubble;
            const topSectionClass = topSectionMaxLines === 1 ? ".text-clip" : ".text-ellipsis-multi-line";
            return [
                // The wrapper around `text` is needed to stop `-webkit-box` from changing the height
                CalendarEventBubble.renderTextSection("", m(topSectionClass, {
                    style: {
                        "-webkit-line-clamp": topSectionMaxLines, // This helps resizing the text to show as much as possible of its contents
                    },
                }, text), topSectionMaxLines * lineHeight),
                secondLineText ? CalendarEventBubble.renderTextSection(".text-ellipsis", secondLineText, lineHeight) : null,
            ];
        }
        else {
            return CalendarEventBubble.renderTextSection(".text-clip", secondLineText
                ? [
                    `${text} `,
                    m(Icon, {
                        icon: "Time" /* Icons.Time */,
                        style: {
                            fill: colorForBg("#" + color),
                            "padding-top": "2px",
                            "padding-right": "2px",
                            "vertical-align": "text-top",
                        },
                        class: "icon-small",
                    }),
                    `${secondLineText}`,
                ]
                : text, lineHeight);
        }
    }
    static renderTextSection(classes, text, maxHeight) {
        return m(classes, {
            style: {
                lineHeight: lineHeightPx,
                maxHeight: px(maxHeight),
            },
        }, text);
    }
}
//# sourceMappingURL=CalendarEventBubble.js.map
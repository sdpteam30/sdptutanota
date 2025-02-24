import "./dist-chunk.js";
import "./ProgrammingError-chunk.js";
import { assertMainOrNode, assertMainOrNodeBoot, isAdminClient, isApp, isElectronClient } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import "./mithril-chunk.js";
import "./dist2-chunk.js";
import "./WhitelabelCustomizations-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import { DefaultAnimationTime, styles } from "./styles-chunk.js";
import { getContentButtonIconBackground, getElevatedBackground, getNavigationMenuBg, stateBgActive, stateBgFocus, stateBgHover, stateBgLike, theme } from "./theme-chunk.js";
import "./WindowFacade-chunk.js";
import { px, size } from "./size-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { FontIcons } from "./FontIcons-chunk.js";

//#region src/common/gui/mixins.ts
assertMainOrNodeBoot();
const noselect = {
	_webkit_touch_callout: "none",
	_webkit_user_select: "none",
	_khtml_user_select: "none",
	_moz_user_select: "none",
	_ms_user_select: "none",
	user_select: "none"
};
function position_absolute(top, right, bottom, left) {
	return {
		position: "absolute",
		top: positionValue(top),
		right: positionValue(right),
		bottom: positionValue(bottom),
		left: positionValue(left)
	};
}
function positionValue(value) {
	if (value) return px(value);
else if (value === 0) return 0;
else return "unset";
}

//#endregion
//#region src/common/gui/main-styles.ts
assertMainOrNode();
function getFonts() {
	const fonts = [
		"-apple-system",
		"system-ui",
		"BlinkMacSystemFont",
		"Segoe UI",
		"Roboto",
		"Helvetica Neue",
		"Helvetica",
		"Arial",
		"sans-serif"
	];
	if (env.platformId === "win32" && lang.code === "ja") fonts.push("SimHei", "黑体");
	fonts.push("Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol");
	return fonts.join(", ");
}
const boxShadow = `0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)`;
const searchBarShadow = "0px 2px 4px rgb(0, 0, 0, 0.12)";
const scrollbarWidthHeight = px(18);
styles.registerStyle("main", () => {
	const lightTheme = locator.themeController.getBaseTheme("light");
	return {
		"#link-tt": isElectronClient() ? {
			"pointer-events": "none",
			"font-size": px(size.font_size_small),
			"padding-left": px(size.hpad_small),
			"padding-right": px(size.hpad_small),
			"padding-top": px(size.vpad_xs),
			position: "fixed",
			bottom: px(size.vpad_xs),
			left: px(size.vpad_xs),
			"text-align": "center",
			color: theme.content_bg,
			"text-decoration": "none",
			"background-color": theme.content_fg,
			border: "1px solid " + theme.content_bg,
			opacity: 0,
			transition: "opacity .1s linear",
			"font-family": "monospace"
		} : {},
		"#link-tt.reveal": isElectronClient() ? {
			opacity: 1,
			transition: "opacity .1s linear",
			"z-index": 9999
		} : {},
		"*:not(input):not(textarea)": isAdminClient() ? {} : {
			"user-select": "none",
			"-ms-user-select": "none",
			"-webkit-user-select": "none",
			"-moz-user-select": "none",
			"-webkit-touch-callout": "none",
			"-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)"
		},
		"*:not(input):not(textarea):not([draggable='true'])": { "-webkit-user-drag": "none" },
		":where(.mouse-nav) *, :where(.touch-nav) *": { outline: "none" },
		".selectable": {
			cursor: "text",
			"user-select": "text !important",
			"-ms-user-select": "text !important",
			"-webkit-user-select": "text !important",
			"-moz-user-select": "text !important",
			"-webkit-touch-callout": "default !important"
		},
		".selectable *": {
			"user-select": "text !important",
			"-ms-user-select": "text !important",
			"-webkit-user-select": "text !important",
			"-moz-user-select": "text !important",
			"-webkit-touch-callout": "default !important"
		},
		"@font-face": {
			"font-family": "'Ionicons'",
			src: `url('${window.tutao.appState.prefixWithoutFile}/images/font.ttf') format('truetype')`,
			"font-weight": "normal",
			"font-style": "normal"
		},
		".touch-callout *": { "-webkit-touch-callout": "default !important" },
		[`html, body, div, article, section, main, footer, header, form, fieldset, legend,
            pre, code, p, a, h1, h2, h3, h4, h5, h6, ul, ol, li, dl, dt, dd, textarea,
            input[type="email"], input[type="number"], input[type="password"],
            input[type="tel"], input[type="text"], input[type="url"], .border-box`]: { "box-sizing": "border-box" },
		a: { color: "inherit" },
		":root": {
			"--safe-area-inset-bottom": "env(safe-area-inset-bottom)",
			"--safe-area-inset-top": "env(safe-area-inset-top)",
			"--safe-area-inset-right": "env(safe-area-inset-right)",
			"--safe-area-inset-left": "env(safe-area-inset-left)"
		},
		"html, body": {
			height: "100%",
			margin: 0,
			width: "100%"
		},
		html: { "-webkit-font-smoothing": "subpixel-antialiased" },
		body: {
			position: "fixed",
			"background-color": `${theme.content_bg} !important`
		},
		"button, textarea": {
			padding: 0,
			"text-align": "left"
		},
		button: { background: "transparent" },
		"button:disabled": { cursor: "default" },
		"body, button": {
			overflow: "hidden",
			"font-family": getFonts(),
			"font-size": px(size.font_size_base),
			"line-height": size.line_height,
			color: theme.content_fg,
			"-webkit-text-size-adjust": "none"
		},
		"small, .small": { "font-size": px(size.font_size_small) },
		".smaller": { "font-size": px(size.font_size_smaller) },
		".normal-font-size": { "font-size": px(size.font_size_base) },
		".b": { "font-weight": "bold" },
		".font-weight-600": { "font-weight": "600" },
		".i": { "font-style": "italic" },
		".click": {
			cursor: "pointer",
			"-webkit-tap-highlight-color": "rgba(255, 255, 255, 0)"
		},
		".click-disabled": { cursor: "default" },
		".text": { cursor: "text" },
		".overflow-hidden": { overflow: "hidden" },
		".overflow-x-hidden": { "overflow-x": "hidden" },
		".overflow-y-hidden": { "overflow-y": "hidden" },
		".overflow-y-visible": { "overflow-y": "visible !important" },
		".overflow-y-scroll": {
			"overflow-y": "scroll",
			"webkit-overflow-scrolling": "touch"
		},
		".overflow-visible": { overflow: "visible" },
		"h1, h2, h3, h4, h5, h6": {
			margin: 0,
			"font-weight": "normal"
		},
		"h1, .h1": { "font-size": px(size.font_size_base * 2) },
		"h2, .h2": { "font-size": px(size.font_size_base * 1.8) },
		"h3, .h3": { "font-size": px(size.font_size_base * 1.6) },
		"h4, .h4": { "font-size": px(size.font_size_base * 1.4) },
		"h5, .h5": { "font-size": px(size.font_size_base * 1.2) },
		"h6, .h6": { "font-size": px(size.font_size_base * 1.1) },
		"input, button, select, textarea": {
			"font-family": "inherit",
			"font-size": "inherit",
			"line-height": "inherit"
		},
		".hr": {
			margin: 0,
			border: "none",
			height: "1px",
			"background-color": theme.list_border
		},
		".border": { border: `1px solid ${theme.content_border}` },
		".border-top": { "border-top": `1px solid ${theme.content_border}` },
		"#mail-body.break-pre pre": {
			"white-space": "pre-wrap",
			"word-break": "normal",
			"overflow-wrap": "anywhere"
		},
		".white-space-pre": { "white-space": "pre" },
		".white-space": { "white-space": "normal" },
		".min-content": {
			width: "min-content",
			height: "min-content"
		},
		".width-min-content": { width: "min-content" },
		".m-0": { margin: 0 },
		".mt": { "margin-top": px(size.vpad) },
		".mt-xs": { "margin-top": px(size.vpad_xs) },
		".mt-xxs": { "margin-top": px(2) },
		".mt-s": { "margin-top": px(size.vpad_small) },
		".mt-m": { "margin-top": px(size.hpad) },
		".mt-l": { "margin-top": px(size.vpad_large) },
		".mt-xl": { "margin-top": px(size.vpad_xl) },
		".mt-form": { "margin-top": px(size.hpad_medium) },
		".mb-0": { "margin-bottom": 0 },
		".mb": { "margin-bottom": px(size.vpad) },
		".mb-s": { "margin-bottom": px(size.vpad_small) },
		".mb-xs": { "margin-bottom": px(size.vpad_xs) },
		".mb-l": { "margin-bottom": px(size.vpad_large) },
		".mb-xl": { "margin-bottom": px(size.vpad_xl) },
		".mb-xxl": { "margin-bottom": px(size.vpad_xxl) },
		".mlr": {
			"margin-left": px(size.hpad),
			"margin-right": px(size.hpad)
		},
		".mlr-button": {
			"margin-left": px(size.hpad_button),
			"margin-right": px(size.hpad_button)
		},
		".mlr-l": {
			"margin-left": px(size.hpad_large),
			"margin-right": px(size.hpad_large)
		},
		".mr-s": { "margin-right": px(size.vpad_small) },
		".mr-xs": { "margin-right": px(size.vpad_xs) },
		".ml-s": { "margin-left": px(size.vpad_small) },
		".ml-m": { "margin-left": px(size.hpad_medium) },
		".ml-l": { "margin-left": px(size.hpad_large) },
		".mr-m": { "margin-right": px(size.hpad_medium) },
		".mr-l": { "margin-right": px(size.hpad_large) },
		".mlr-s": {
			"margin-left": px(size.hpad_small),
			"margin-right": px(size.hpad_small)
		},
		".mlr-xs": {
			"margin-left": px(size.vpad_xs),
			"margin-right": px(size.vpad_xs)
		},
		".ml-hpad_small": { "margin-left": px(size.hpad_small) },
		".mr-hpad-small": { "margin-right": px(size.hpad_small) },
		".mtb-0": {
			"margin-top": px(0),
			"margin-bottom": px(0)
		},
		".mr": { "margin-right": px(size.hpad) },
		".ml": { "margin-left": px(size.hpad) },
		".p0": { padding: "0" },
		".pt": { "padding-top": px(size.vpad) },
		".pt-0": { "padding-top": 0 },
		".pt-s": { "padding-top": px(size.vpad_small) },
		".pt-l": { "padding-top": px(size.vpad_large) },
		".pt-m": { "padding-top": px(size.hpad) },
		".pt-ml": { "padding-top": px(size.vpad_ml) },
		".pt-xl": { "padding-top": px(size.vpad_xl) },
		".pt-xs": { "padding-top": px(size.vpad_xs) },
		".pb-0": { "padding-bottom": 0 },
		".pb": { "padding-bottom": px(size.vpad) },
		".pb-2": { "padding-bottom": "2px" },
		".pb-s": { "padding-bottom": px(size.vpad_small) },
		".drag": { "touch-action": "auto" },
		".pb-xs": { "padding-bottom": px(size.vpad_xs) },
		".pb-l": { "padding-bottom": px(size.vpad_large) },
		".pb-xl": { "padding-bottom": px(size.vpad_xl) },
		".pb-m": { "padding-bottom": px(size.hpad) },
		".pb-ml": { "padding-bottom": px(size.vpad_ml) },
		".pb-floating": { "padding-bottom": px(size.button_floating_size + size.hpad_large) },
		".plr": {
			"padding-left": px(size.hpad),
			"padding-right": px(size.hpad)
		},
		".pl": { "padding-left": px(size.hpad) },
		".pl-s": { "padding-left": px(size.hpad_small) },
		".pl-m": { "padding-left": px(size.hpad) },
		".pl-xs": { "padding-left": px(size.vpad_xs) },
		".pl-vpad-m": { "padding-left": px(size.vpad) },
		".pl-vpad-s": { "padding-left": px(size.vpad_small) },
		".pl-vpad-l": { "padding-left": px(size.vpad_large) },
		".pr": { "padding-right": px(size.hpad) },
		".pr-s": { "padding-right": px(size.hpad_small) },
		".pr-vpad-s": { "padding-right": px(size.vpad_small) },
		".pr-m": { "padding-right": px(size.vpad) },
		".plr-s": {
			"padding-left": px(size.hpad_small),
			"padding-right": px(size.hpad_small)
		},
		".plr-m": {
			"padding-left": px(size.hpad),
			"padding-right": px(size.hpad)
		},
		".plr-l": {
			"padding-left": px(size.hpad_large),
			"padding-right": px(size.hpad_large)
		},
		".plr-2l": {
			"padding-left": px(size.hpad_large * 2),
			"padding-right": px(size.hpad_large * 2)
		},
		".pl-l": { "padding-left": px(size.hpad_large) },
		".pr-l": { "padding-right": px(size.hpad_large) },
		".plr-button": {
			"padding-left": px(size.hpad_button),
			"padding-right": px(size.hpad_button)
		},
		".plr-button-double": {
			"padding-left": px(size.hpad_button * 2),
			"padding-right": px(size.hpad_button * 2)
		},
		".plr-nav-button": {
			"padding-left": px(size.hpad_nav_button),
			"padding-right": px(size.hpad_nav_button)
		},
		".pl-button": { "padding-left": px(size.hpad_button) },
		".mr-button": { "margin-right": px(size.hpad_button) },
		".ml-button": { "margin-left": px(size.hpad_button) },
		".mt-negative-hpad-button": { "margin-top": px(-size.hpad_button) },
		".mt-negative-s": { "margin-top": px(-size.vpad_small) },
		".mt-negative-m": { "margin-top": px(-size.vpad) },
		".mt-negative-l": { "margin-top": px(-size.hpad_large) },
		".mr-negative-s": { "margin-right": px(-size.hpad_button) },
		".mr-negative-l": { "margin-right": px(-size.hpad_large) },
		".ml-negative-s": { "margin-left": px(-size.hpad_button) },
		".ml-negative-l": { "margin-left": px(-size.hpad_large) },
		".ml-negative-xs": { "margin-left": px(-3) },
		".ml-negative-bubble": { "margin-left": px(-7) },
		".mr-negative-m": { "margin-right": px(-(size.hpad_button + size.hpad_nav_button)) },
		".fixed-bottom-right": {
			position: "fixed",
			bottom: px(size.hpad),
			right: px(size.hpad_large)
		},
		".mr-negative-xs": { "margin-right": px(-3) },
		".text-ellipsis": {
			overflow: "hidden",
			"text-overflow": "ellipsis",
			"min-width": 0,
			"white-space": "nowrap"
		},
		".text-ellipsis-multi-line": {
			display: "-webkit-box",
			"-webkit-line-clamp": 3,
			"-webkit-box-orient": "vertical",
			overflow: " hidden",
			"text-overflow": "ellipsis"
		},
		".text-clip": {
			overflow: "hidden",
			"text-overflow": "clip",
			"min-width": 0,
			"white-space": "nowrap"
		},
		".min-width-0": { "min-width": 0 },
		".min-width-full": { "min-width": "100%" },
		".text-break": {
			overflow: "hidden",
			"word-break": "normal",
			"overflow-wrap": "anywhere"
		},
		".break-word": {
			"word-break": "normal",
			"overflow-wrap": "break-word",
			hyphens: "auto"
		},
		".break-all": { "word-break": "break-all" },
		".break-word-links a": { "overflow-wrap": "anywhere" },
		".text-prewrap": { "white-space": "pre-wrap" },
		".text-preline": { "white-space": "pre-line" },
		".text-pre": { "white-space": "pre" },
		".uppercase": { "text-transform": "uppercase" },
		".line-break-anywhere": { "line-break": "anywhere" },
		".z1": { "z-index": "1" },
		".z2": { "z-index": "2" },
		".z3": { "z-index": "3" },
		".z4": { "z-index": "4" },
		".noselect": noselect,
		".no-wrap": { "white-space": "nowrap" },
		".height-100p": { height: "100%" },
		".view-columns": { overflow: "hidden" },
		".view-column": { "will-change": "transform" },
		".will-change-alpha": { "will-change": "alpha" },
		".border-bottom": { "border-bottom": `1px solid ${theme.content_border}` },
		".border-left": { "border-left": `1px solid ${theme.content_border}` },
		".bg-transparent": { "background-color": "transparent" },
		".bg-white": { "background-color": "white" },
		".bg-fix-quoted blockquote.tutanota_quote": {
			"background-color": "white",
			color: "black",
			"border-width": "4px"
		},
		".content-black": { color: "black" },
		".content-fg": { color: theme.content_fg },
		".content-accent-fg": { color: theme.content_accent },
		".content-accent-accent": { "accent-color": theme.content_accent },
		".icon-accent svg": { fill: theme.content_accent },
		".svg-content-fg path": { fill: theme.content_fg },
		".content-bg": { "background-color": theme.content_bg },
		".nav-bg": { "background-color": theme.navigation_bg },
		".content-hover:hover": { color: theme.content_accent },
		".no-hover": { "pointer-events": "none" },
		".content-message-bg": { "background-color": theme.content_message_bg },
		".elevated-bg": { "background-color": getElevatedBackground() },
		".list-bg": { "background-color": theme.list_bg },
		".list-accent-fg": { color: theme.list_accent_fg },
		".svg-list-accent-fg path": { fill: theme.list_accent_fg },
		".bg-accent-fg": { "background-color": theme.list_accent_fg },
		".list-border-bottom": { "border-bottom": `1px solid ${theme.list_border}` },
		".accent-bg-translucent": {
			background: `${theme.content_accent}2C`,
			color: theme.content_accent
		},
		".button-bg": {
			background: theme.content_button,
			color: theme.navigation_bg,
			opacity: "0.5"
		},
		".accent-bg": {
			"background-color": theme.content_accent,
			color: theme.content_button_icon_selected
		},
		".accent-bg-cyber-monday": {
			"background-color": theme.content_accent_cyber_monday,
			color: theme.content_button_icon_selected
		},
		".accent-fg": { color: theme.content_button_icon },
		".accent-fg path": { fill: theme.content_button_icon },
		".red": { "background-color": "#840010" },
		".swipe-spacer": { color: "#ffffff" },
		".swipe-spacer path": { fill: "#ffffff" },
		".blue": { "background-color": "#2196F3" },
		".underline": { "text-decoration": "underline" },
		".hover-ul:hover": { "text-decoration": isApp() ? "none" : "underline" },
		".fill-absolute": {
			position: "absolute",
			top: 0,
			bottom: 0,
			left: 0,
			right: 0
		},
		".fill-flex": {
			"flex-basis": "100%",
			"flex-shrink": 0
		},
		".abs": { position: "absolute" },
		".fixed": { position: "fixed" },
		".rel": { position: "relative" },
		".max-width-s": { "max-width": px(360) },
		".max-width-m": { "max-width": px(450) },
		".max-width-l": { "max-width": px(800) },
		".max-width-200": { "max-width": px(200) },
		".scroll": {
			"overflow-y": client.overflowAuto,
			"-webkit-overflow-scrolling": "touch"
		},
		".scroll-no-overlay": {
			"overflow-y": "auto",
			"-webkit-overflow-scrolling": "touch"
		},
		".scroll-x": {
			"overflow-x": "auto",
			"-webkit-overflow-scrolling": "touch"
		},
		"*": {
			"scrollbar-color": `${theme.content_button} transparent`,
			"scrollbar-width": "thin"
		},
		"::-webkit-scrollbar": !client.isMobileDevice() ? {
			background: "transparent",
			width: scrollbarWidthHeight,
			height: scrollbarWidthHeight
		} : {},
		"::-webkit-scrollbar-thumb": !client.isMobileDevice() ? {
			background: theme.content_button,
			"border-left": "15px solid transparent",
			"background-clip": "padding-box"
		} : {},
		"*::-webkit-scrollbar-thumb:hover": { "border-left": "8px solid transparent" },
		".visible-scrollbar::-webkit-scrollbar": {
			background: "transparent",
			width: "6px"
		},
		".visible-scrollbar::-webkit-scrollbar-thumb": {
			background: theme.content_button,
			"border-radius": "3px"
		},
		".scrollbar-gutter-stable-or-fallback": { "scrollbar-gutter": "stable" },
		"@supports not (scrollbar-gutter: stable)": { ".scrollbar-gutter-stable-or-fallback": { "padding-right": scrollbarWidthHeight } },
		".center": { "text-align": "center" },
		".dropdown-info": {
			"padding-bottom": "5px",
			"padding-left": "16px",
			"padding-right": "16px"
		},
		".dropdown-info + .dropdown-button": { "border-top": `1px solid ${theme.content_border}` },
		".dropdown-info + .dropdown-info": { "padding-top": "0" },
		".text-center": { "text-align": "center" },
		".right": { "text-align": "right" },
		".left": { "text-align": "left" },
		".start": { "text-align": "start" },
		".statusTextColor": { color: theme.content_accent },
		".button-height": { height: px(size.button_height) },
		".button-min-height": { "min-height": px(size.button_height) },
		".button-min-width": { "min-width": px(size.button_height) },
		".button-width-fixed": { width: px(size.button_height) },
		".large-button-height": { height: px(size.button_floating_size) },
		".large-button-width": { width: px(size.button_floating_size) },
		".notification-min-width": { "min-width": px(400) },
		".full-height": { "min-height": client.isIos() ? "101%" : "100%" },
		".full-width": { width: "100%" },
		".half-width": { width: "50%" },
		".block": { display: "block" },
		".inline-block": { display: "inline-block" },
		".no-text-decoration": { "text-decoration": "none" },
		".strike": { "text-decoration": "line-through" },
		".text-align-vertical": { "vertical-align": "text-top" },
		".flex-space-around": {
			display: "flex",
			"justify-content": "space-around"
		},
		".flex-space-between": {
			display: "flex",
			"justify-content": "space-between"
		},
		".flex-fixed": { flex: "0 0 auto" },
		".flex-center": {
			display: "flex",
			"justify-content": "center"
		},
		".flex-end": {
			display: "flex",
			"justify-content": "flex-end"
		},
		".flex-start": {
			display: "flex",
			"justify-content": "flex-start"
		},
		".flex-v-center": {
			display: "flex",
			"flex-direction": "column",
			"justify-content": "center"
		},
		".flex-direction-change": {
			display: "flex",
			"justify-content": "center"
		},
		".flex-column": { "flex-direction": "column" },
		".col": { "flex-direction": "column" },
		".row": { "flex-direction": "row" },
		".flex-column-reverse": { "flex-direction": "column-reverse" },
		".col-reverse": { "flex-direction": "column-reverse" },
		".column-gap": { "column-gap": px(size.hpad) },
		".column-gap-s": { "column-gap": px(size.hpad_small) },
		".gap-vpad": { gap: px(size.vpad) },
		".gap-vpad-xs": { gap: px(size.vpad_xsm) },
		".gap-vpad-s": { gap: px(size.vpad_small) },
		".gap-vpad-s-15": { gap: px(size.vpad_small * 1.5) },
		".gap-hpad": { gap: px(size.hpad) },
		".gap-vpad-xxl": { gap: px(size.vpad_xxl) },
		".flex": { display: "flex" },
		".flex-grow": { flex: "1" },
		".flex-hide": { flex: "0" },
		".flex-third": {
			flex: "1 0 0",
			"min-width": "100px"
		},
		".flex-third-middle": { flex: "2 1 0" },
		".flex-half": { flex: "0 0 50%" },
		".flex-grow-shrink-half": { flex: "1 1 50%" },
		".flex-nogrow-shrink-half": { flex: "0 1 50%" },
		".flex-grow-shrink-auto": { flex: "1 1 auto" },
		".flex-grow-shrink-0": { flex: "1 1 0px" },
		".flex-grow-shrink-150": { flex: "1 1 150px" },
		".flex-no-shrink": { flex: "1 0 0" },
		".flex-no-grow-no-shrink-auto": { flex: "0 0 auto" },
		".flex-no-grow": { flex: "0" },
		".no-shrink": { "flex-shrink": "0" },
		".flex-no-grow-shrink-auto": { flex: "0 1 auto" },
		".flex-wrap": { "flex-wrap": "wrap" },
		".wrap": { "flex-wrap": "wrap" },
		".items-center": { "align-items": "center" },
		".center-vertically": { "align-items": "center" },
		".items-end": { "align-items": "flex-end" },
		".items-start": { "align-items": "flex-start" },
		".items-base": { "align-items": "baseline" },
		".items-stretch": { "align-items": "stretch" },
		".align-self-start": { "align-self": "start" },
		".align-self-center": { "align-self": "center" },
		".align-self-end": { "align-self": "flex-end" },
		".align-self-stretch": { "align-self": "stretch" },
		".justify-center": { "justify-content": "center" },
		".center-horizontally": { "justify-content": "center" },
		".justify-between": { "justify-content": "space-between" },
		".justify-end": { "justify-content": "flex-end" },
		".justify-start": { "justify-content": "flex-start" },
		".justify-right": { "justify-content": "right" },
		".child-grow > *": { flex: "1 1 auto" },
		".last-child-fixed > *:last-child": { flex: "1 0 100px" },
		".limit-width": { "max-width": "100%" },
		".flex-transition": { transition: "flex 200ms linear" },
		".border-radius": { "border-radius": px(size.border_radius) },
		".border-radius-top": {
			"border-top-left-radius": px(size.border_radius),
			"border-top-right-radius": px(size.border_radius)
		},
		".border-radius-top-left-big": { "border-top-left-radius": px(size.border_radius_larger) },
		".border-radius-top-right-big": { "border-top-right-radius": px(size.border_radius_larger) },
		".border-radius-bottom": {
			"border-bottom-left-radius": px(size.border_radius),
			"border-bottom-right-radius": px(size.border_radius)
		},
		".border-radius-small": { "border-radius": px(size.border_radius_small) },
		".border-radius-big": { "border-radius": px(size.border_radius_larger) },
		".border-radius-m": { "border-radius": px(size.border_radius_medium) },
		".border-radius-top-left-m": { "border-top-left-radius": px(size.border_radius_medium) },
		".border-radius-top-right-m": { "border-top-right-radius": px(size.border_radius_medium) },
		".settings-item": {
			border: 0,
			cursor: "pointer",
			overflow: "hidden",
			"white-space": "nowrap",
			margin: 0,
			"flex-shrink": 0,
			"-webkit-tap-highlight-color": "rgba(255, 255, 255, 0)",
			"padding-bottom": px(size.icon_size_small),
			"padding-top": px(size.icon_size_small),
			"border-bottom": `1px solid ${theme.button_bubble_bg} !important`
		},
		".settings-item:last-child": { "border-bottom": "none !important" },
		".editor-border": {
			border: `2px solid ${theme.content_border}`,
			"padding-top": px(size.vpad_small),
			"padding-bottom": px(size.vpad_small),
			"padding-left": px(size.hpad),
			"padding-right": px(size.hpad)
		},
		".editor-border-active": {
			border: `3px solid ${theme.content_accent}`,
			"padding-top": px(size.vpad_small - 1),
			"padding-bottom": px(size.vpad_small - 1),
			"padding-left": px(size.hpad - 1),
			"padding-right": px(size.hpad - 1)
		},
		".editor-no-top-border": { "border-top-color": "transparent" },
		".icon": {
			height: px(size.icon_size_medium),
			width: px(size.icon_size_medium)
		},
		".icon > svg": {
			height: px(size.icon_size_medium),
			width: px(size.icon_size_medium)
		},
		".icon-progress-search": {
			height: `${px(20)} !important`,
			width: `${px(20)} !important`
		},
		".icon-progress-search > svg": {
			height: `${px(20)} !important`,
			width: `${px(20)} !important`
		},
		".search-bar": {
			transition: "all 200ms",
			"background-color": stateBgLike
		},
		".search-bar:hover": { "background-color": stateBgHover },
		".search-bar[focused=true]": {
			"background-color": theme.content_bg,
			"box-shadow": searchBarShadow
		},
		".fab-shadow": { "box-shadow": "0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)" },
		".icon-progress-tiny": {
			height: px(15),
			width: px(15)
		},
		".icon-progress-tiny > svg": {
			height: px(15),
			width: px(15)
		},
		".icon-small": {
			height: px(size.icon_size_small),
			width: px(size.icon_size_small)
		},
		".icon-small > svg": {
			height: px(size.icon_size_small),
			width: px(size.icon_size_small)
		},
		".icon-large": {
			height: px(size.icon_size_large),
			width: px(size.icon_size_large)
		},
		".icon-medium-large": {
			height: px(size.icon_size_medium_large),
			width: px(size.icon_size_medium_large)
		},
		".icon-medium-large > svg": {
			height: px(size.icon_size_medium_large),
			width: px(size.icon_size_medium_large)
		},
		".icon-large > svg": {
			height: px(size.icon_size_large),
			width: px(size.icon_size_large)
		},
		".icon-xl": {
			height: px(size.icon_size_xl),
			width: px(size.icon_size_xl)
		},
		".icon-xl > svg": {
			height: px(size.icon_size_xl),
			width: px(size.icon_size_xl)
		},
		".icon-xxl": {
			height: px(size.icon_size_xxl),
			width: px(size.icon_size_xxl)
		},
		".icon-xxl > svg": {
			height: px(size.icon_size_xxl),
			width: px(size.icon_size_xxl)
		},
		".icon-message-box": {
			height: px(size.icon_message_box),
			width: px(size.icon_message_box)
		},
		".icon-message-box > svg": {
			height: px(size.icon_message_box),
			width: px(size.icon_message_box)
		},
		".icon-progress > svg": {
			"animation-name": "rotate-icon",
			"animation-duration": "2s",
			"animation-iteration-count": "infinite",
			"animation-timing-function": "calculatePosition",
			"transform-origin": "50% 50%",
			display: "inline-block"
		},
		".icon-button": {
			"border-radius": "25%",
			width: px(size.button_height),
			height: px(size.button_height),
			"max-width": px(size.button_height),
			"max-height": px(size.button_height)
		},
		".center-h": { margin: "0 auto" },
		".toggle-button": {
			"border-radius": "25%",
			width: px(size.button_height),
			height: px(size.button_height),
			"max-width": px(size.button_height),
			"max-height": px(size.button_height)
		},
		".wizard-next-button": {
			"margin-top": "auto",
			"margin-bottom": px(size.vpad)
		},
		".wizard-breadcrumb": {
			border: `1px solid ${getContentButtonIconBackground()}`,
			color: "inherit",
			"transition-property": "border-width, border-color, color, background-color",
			"transition-duration": `${DefaultAnimationTime - 70}ms`,
			"transition-timing-function": "ease-out",
			"will-change": "border-width, border-color, color"
		},
		".wizard-breadcrumb-active": {
			border: `2px solid ${theme.content_accent}`,
			color: theme.content_accent,
			"transition-property": "border-width, border-color, color, background-color",
			"transition-duration": `${DefaultAnimationTime - 70}ms`,
			"transition-timing-function": "ease-out",
			"will-change": "border-width, color, background-color"
		},
		".wizard-breadcrumb-previous": {
			border: `1px solid ${theme.content_accent}`,
			color: "inherit",
			"background-color": theme.content_accent,
			"transition-property": "border-width, border-color, color, background-color",
			"transition-duration": `${DefaultAnimationTime - 70}ms`,
			"transition-timing-function": "ease-out",
			"will-change": "border-width, border-color, color, background-color"
		},
		".wizard-breadcrumb-line": {
			"border-top": `3px dotted ${theme.content_border}`,
			height: 0,
			transition: `border-top-color ${DefaultAnimationTime}ms ease-out`,
			"will-change": "border-top-style, border-top-color"
		},
		".wizard-breadcrumb-line-active": {
			"border-top": `3px solid ${theme.content_accent}`,
			height: 0,
			transition: `border-top-color ${DefaultAnimationTime}ms ease-out`
		},
		".compact": {
			width: `${size.button_height_compact}px !important`,
			height: `${size.button_height_compact}px !important`
		},
		".large": {
			width: `${size.button_floating_size}px`,
			height: `${size.button_floating_size}px`,
			"max-width": `${size.button_floating_size}px`,
			"max-height": `${size.button_floating_size}px`
		},
		".state-bg": {
			background: "transparent",
			transition: "background 0.6s",
			opacity: "1 !important"
		},
		":where(.mouse-nav) .state-bg:hover, :where(.keyboard-nav) .state-bg:hover": {
			background: stateBgHover,
			"transition-duration": ".3s"
		},
		":where(.keyboard-nav) .state-bg:focus": {
			background: stateBgFocus,
			"transition-duration": ".3s",
			outline: "none"
		},
		".state-bg:active, .state-bg[pressed=true]": {
			background: stateBgActive,
			"transition-duration": ".3s"
		},
		".flash": { transition: `opacity ${DefaultAnimationTime}ms` },
		".flash:active": { opacity: "0.4" },
		".disabled": { opacity: "0.7" },
		".translucent": { opacity: "0.4" },
		".opaque": { opacity: "1" },
		"@keyframes rotate-icon": {
			"0%": { transform: "rotate(0deg)" },
			"100%": { transform: "rotate(360deg)" }
		},
		".main-view": {
			position: "absolute",
			top: 0,
			right: px(0),
			bottom: px(0),
			left: px(0),
			"overflow-x": "hidden"
		},
		".mlr-safe-inset": {
			"margin-right": "env(safe-area-inset-right)",
			"margin-left": "env(safe-area-inset-left)"
		},
		".plr-safe-inset": {
			"padding-right": "env(safe-area-inset-right)",
			"padding-left": "env(safe-area-inset-left)"
		},
		".mt-safe-inset": { "margin-top": "env(safe-area-inset-top)" },
		".header-nav": {
			height: px(size.navbar_height),
			"background-color": theme.navigation_bg,
			"z-index": 2
		},
		".bottom-nav": {
			"border-top": `1px solid ${theme.navigation_border}`,
			height: positionValue(size.bottom_nav_bar),
			background: theme.header_bg,
			"margin-bottom": "env(safe-area-inset-bottom)",
			"z-index": 2
		},
		".notification-overlay-content": {
			"margin-left": px(size.vpad),
			"margin-right": px(size.vpad),
			"padding-top": px(size.vpad)
		},
		".logo-circle": {
			width: px(size.button_icon_bg_size),
			height: px(size.button_icon_bg_size),
			"border-radius": "50%",
			overflow: "hidden"
		},
		".dot": {
			width: px(size.dot_size),
			height: px(size.dot_size),
			"border-radius": "50%",
			overflow: "hidden",
			"margin-top": px(6)
		},
		".news-button": { position: "relative" },
		".logo-text": {
			height: px(size.header_logo_height),
			width: px(128)
		},
		".logo-height": { height: px(size.header_logo_height) },
		".logo-height > svg, .logo-height > img": { height: px(size.header_logo_height) },
		".custom-logo": {
			width: px(200),
			"background-repeat": "no-repeat",
			"background-size": "auto 100%"
		},
		".nav-bar-spacer": {
			width: "0px",
			height: "22px",
			"margin-left": "2px",
			"border-color": theme.navigation_border,
			"border-width": "1px",
			"border-style": "solid"
		},
		".dialog": { "min-width": px(200) },
		".dialog-width-l": { "max-width": px(800) },
		".dialog-width-m": { "max-width": px(500) },
		".dialog-width-s": { "max-width": px(400) },
		".dialog-width-alert": { "max-width": px(350) },
		".dialog-header": {
			"border-bottom": `1px solid ${theme.content_border}`,
			height: px(size.button_height + 1)
		},
		".dialog-header-line-height": { "line-height": px(size.button_height) },
		".dialog-progress": {
			"text-align": "center",
			padding: px(size.hpad_large),
			width: `calc(100% - ${2 * size.hpad}px)`
		},
		".faq-items img": {
			"max-width": "100%",
			height: "auto"
		},
		".dialog-container": position_absolute(size.button_height + 1, 0, 0, 0),
		".dialog-contentButtonsBottom": { padding: `0 ${px(size.hpad_large)} ${px(size.vpad)} ${px(size.hpad_large)}` },
		".dialog-img": {
			width: px(150),
			height: "auto"
		},
		".dialog-buttons": { "border-top": `1px solid ${theme.content_border}` },
		".dialog-buttons > button": { flex: "1" },
		".dialog-buttons > button:not(:first-child)": {
			"border-left": `1px solid ${theme.content_border}`,
			"margin-left": "0"
		},
		".dialog-height-small": { "min-height": "65vh" },
		".dialog-max-height": { "max-height": "calc(100vh - 100px)" },
		" .folder-column": {
			height: "100%",
			"padding-top": "env(safe-area-inset-top)"
		},
		".list-border-right": { "border-right": `1px solid ${theme.list_border}` },
		".folders": { "margin-bottom": px(12) },
		".folder-row": {
			"align-items": "center",
			position: "relative"
		},
		".template-list-row": {
			"border-left": px(size.border_selection) + " solid transparent",
			"align-items": "center",
			position: "relative"
		},
		".counter-badge": {
			"padding-left": px(4),
			"padding-right": px(4),
			"border-radius": px(8),
			"line-height": px(16),
			"font-size": px(size.font_size_small),
			"font-weight": "bold",
			"min-width": px(16),
			"min-height": px(16),
			"text-align": "center"
		},
		".row-selected": {
			"border-color": `${theme.list_accent_fg} !important`,
			color: `${theme.list_accent_fg}`
		},
		".hoverable-list-item:hover": {
			"border-color": `${theme.list_accent_fg} !important`,
			color: `${theme.list_accent_fg}`
		},
		".expander": {
			height: px(size.button_height),
			"min-width": px(size.button_height)
		},
		".mail-viewer-firstLine": { "pading-top": px(10) },
		".hide-outline": { outline: "none" },
		".nofocus:focus": { outline: "none" },
		".input": { outline: "none" },
		"blockquote.tutanota_quote, blockquote[type=cite]": {
			"border-left": `1px solid ${theme.content_accent}`,
			"padding-left": px(size.hpad),
			"margin-left": px(0),
			"margin-right": px(0)
		},
		".tutanota-placeholder": {
			"max-width": "100px !important",
			"max-height": "100px !important"
		},
		".MsoNormal": { margin: 0 },
		".list": {
			overflow: "hidden",
			"list-style": "none",
			margin: 0,
			padding: 0
		},
		".list-row": {
			position: "absolute",
			left: 0,
			right: 0,
			height: px(size.list_row_height)
		},
		".odd-row": { "background-color": theme.list_bg },
		".list-loading": { bottom: 0 },
		".teamLabel": {
			color: theme.list_alternate_bg,
			"background-color": theme.list_accent_fg
		},
		".ion": {
			display: "inline-block",
			"font-family": "'Ionicons'",
			speak: "none",
			"font-style": "normal",
			"font-weight": "normal",
			"font-variant": "normal",
			"text-transform": "none",
			"text-rendering": "auto",
			"line-height": "1",
			"-webkit-font-smoothing": "antialiased",
			"-moz-osx-font-smoothing": "grayscale"
		},
		".badge-line-height": { "line-height": px(18) },
		".list-font-icons": {
			"letter-spacing": "1px",
			"text-align": "right",
			"margin-right": "-3px"
		},
		".monospace": { "font-family": "\"Lucida Console\", Monaco, monospace" },
		".hidden": { visibility: "hidden" },
		".action-bar": {
			width: "initial",
			"margin-left": "auto"
		},
		".ml-between-s > :not(:first-child)": { "margin-left": px(size.hpad_small) },
		".mt-between-s > :not(:first-child)": { "margin-top": px(size.hpad_small) },
		".mt-between-m > :not(:first-child)": { "margin-top": px(size.hpad) },
		".dropdown-panel": {
			position: "absolute",
			width: 0,
			height: 0,
			overflow: "hidden"
		},
		".dropdown-panel-scrollable": {
			position: "absolute",
			width: 0,
			height: 0,
			"overflow-x": "hidden",
			"overflow-y": "auto"
		},
		".dropdown-panel.fit-content, .dropdown-panel.fit-content .dropdown-content": { "min-width": "fit-content" },
		".dropdown-content:first-child": { "padding-top": px(size.vpad_small) },
		".dropdown-content:last-child": { "padding-bottom": px(size.vpad_small) },
		".dropdown-content, .dropdown-content > *": { width: "100%" },
		".dropdown-shadow": { "box-shadow": boxShadow },
		".minimized-shadow": { "box-shadow": `0px 0px 4px 2px ${theme.header_box_shadow_bg}` },
		".dropdown-bar": {
			"border-style": "solid",
			"border-width": "0px 0px 1px 0px",
			"border-color": theme.content_border,
			"padding-bottom": "1px",
			"z-index": 1,
			"border-radius": `${size.border_radius}px ${size.border_radius}px 0 0`,
			color: theme.content_fg
		},
		".dropdown-bar:focus": {
			"border-style": "solid",
			"border-width": "0px 0px 2px 0px",
			"border-color": `${theme.content_accent}`,
			"padding-bottom": "0px"
		},
		".dropdown-button": {
			height: px(size.button_height),
			"padding-left": px(size.vpad),
			"padding-right": px(size.vpad)
		},
		"button, .nav-button": {
			border: 0,
			cursor: "pointer",
			overflow: "hidden",
			"white-space": "nowrap",
			margin: 0,
			"flex-shrink": 0,
			"-webkit-tap-highlight-color": "rgba(255, 255, 255, 0)"
		},
		".nav-button:hover": !isApp() ? {} : {},
		".nav-button:focus": client.isDesktopDevice() ? {} : {},
		"button:focus, button:hover": client.isDesktopDevice() ? { opacity: .7 } : {},
		".button-icon": {
			width: px(size.button_icon_bg_size),
			height: px(size.button_icon_bg_size),
			"border-radius": px(size.button_icon_bg_size),
			"min-width": px(size.button_icon_bg_size)
		},
		".login": {
			width: "100%",
			"border-radius": px(size.border_radius)
		},
		".small-login-button": { width: "260px" },
		".button-content": {
			height: px(size.button_height),
			"min-width": px(size.button_height)
		},
		".text-bubble": { "padding-top": px(size.text_bubble_tpad) },
		".bubble": {
			"border-radius": px(size.border_radius),
			"background-color": theme.button_bubble_bg,
			color: theme.button_bubble_fg
		},
		".keyword-bubble": {
			"max-width": "300px",
			"border-radius": px(size.border_radius),
			"margin-bottom": px(size.vpad_small / 2),
			"margin-right": px(size.vpad_small / 2),
			"background-color": theme.button_bubble_bg,
			padding: `${px(size.vpad_small / 2)} ${px(size.vpad_small)} ${px(size.vpad_small / 2)} ${px(size.vpad_small)}`
		},
		".keyword-bubble-no-padding": {
			"max-width": "300px",
			"border-radius": px(size.border_radius),
			margin: px(size.vpad_small / 2),
			"background-color": theme.button_bubble_bg
		},
		".bubble-color": {
			"background-color": theme.button_bubble_bg,
			color: theme.button_bubble_fg
		},
		mark: {
			"background-color": theme.content_accent,
			color: theme.content_button_icon_selected
		},
		".segmentControl": {
			"border-top": `${px((size.button_height - size.button_height_bubble) / 2)} solid transparent`,
			"border-bottom": `${px((size.button_height - size.button_height_bubble) / 2)} solid transparent`
		},
		".segmentControl-border": {
			border: `1px solid ${theme.content_border}`,
			"padding-top": px(1),
			"padding-bottom": px(1),
			"padding-left": px(1),
			"padding-right": px(1)
		},
		".segmentControl-border-active": {
			border: `2px solid ${theme.content_accent}`,
			"padding-top": px(0),
			"padding-bottom": px(0),
			"padding-left": px(0),
			"padding-right": px(0)
		},
		".segmentControl-border-active-cyber-monday": { border: `2px solid ${theme.content_accent_cyber_monday}` },
		".segmentControlItem": {
			cursor: "pointer",
			background: "transparent"
		},
		".segmentControlItem:last-child": {
			"border-bottom-right-radius": px(size.border_radius_small),
			"border-top-right-radius": px(size.border_radius_small)
		},
		".segmentControlItem:first-child": {
			"border-bottom-left-radius": px(size.border_radius_small),
			"border-top-left-radius": px(size.border_radius_small)
		},
		".icon-segment-control": { "border-radius": px(size.border_radius) },
		".icon-segment-control-item": {
			"border-top": `1px solid ${stateBgHover}`,
			"border-bottom": `1px solid ${stateBgHover}`,
			"border-right": `0.5px solid ${stateBgHover}`,
			width: px(size.icon_segment_control_button_width),
			height: px(size.icon_segment_control_button_height),
			cursor: "pointer",
			background: "transparent"
		},
		".icon-segment-control-item[active]": {
			background: stateBgHover,
			"transition-duration": ".3s"
		},
		".icon-segment-control-item:first-child": {
			"border-bottom-left-radius": px(size.border_radius),
			"border-top-left-radius": px(size.border_radius),
			"border-left": `1px solid ${stateBgHover}`
		},
		".icon-segment-control-item:last-child": {
			"border-bottom-right-radius": px(size.border_radius),
			"border-top-right-radius": px(size.border_radius),
			"border-right": `1px solid ${stateBgHover}`
		},
		".payment-logo": { width: "124px" },
		".onboarding-logo, .onboarding-logo > svg": {
			width: "fit-content",
			height: px(160)
		},
		".onboarding-logo-large, .onboarding-logo-large > svg": {
			width: "fit-content",
			height: px(222)
		},
		"settings-illustration-large, .settings-illustration-large > svg": {
			width: "full-width",
			height: "fit-content"
		},
		".wrapping-row": {
			display: "flex",
			"flex-flow": "row wrap",
			"margin-right": px(-size.hpad_large)
		},
		".wrapping-row > *": {
			flex: "1 0 40%",
			"margin-right": px(size.hpad_large),
			"min-width": px(200)
		},
		".non-wrapping-row": {
			display: "flex",
			"flex-flow": "row",
			"margin-right": px(-size.hpad_large)
		},
		".non-wrapping-row > *": {
			flex: "1 0 40%",
			"margin-right": px(size.hpad_large)
		},
		".inputWrapper": {
			flex: "1 1 auto",
			background: "transparent",
			overflow: "hidden"
		},
		".input, .input-area": {
			display: "block",
			resize: "none",
			border: 0,
			padding: 0,
			margin: 0,
			background: "transparent",
			width: "100%",
			overflow: "hidden",
			color: theme.content_fg
		},
		".input-no-clear::-ms-clear": { display: "none" },
		".resize-none": { resize: "none" },
		".table": {
			"border-collapse": "collapse",
			"table-layout": "fixed",
			width: "100%"
		},
		".table-header-border tr:first-child": { "border-bottom": `1px solid ${theme.content_border}` },
		".table td": { "vertical-align": "middle" },
		td: { padding: 0 },
		".column-width-small": { width: px(size.column_width_s_desktop) },
		".column-width-largest": {},
		".buyOptionBox": {
			position: "relative",
			display: "inline-block",
			border: `1px solid ${theme.content_border}`,
			width: "100%",
			padding: px(10)
		},
		".plans-grid": {
			display: "grid",
			"grid-template-columns": "1fr",
			"grid-auto-flow": "column",
			"grid-template-rows": "auto 1fr"
		},
		"@media (max-width: 992px)": {
			".plans-grid": { "grid-template-rows": "auto 1fr auto 1fr" },
			".plans-grid > div:nth-child(3), .plans-grid > div:nth-child(4)": { order: 1 },
			".plans-grid > div:nth-child(5), .plans-grid > div:nth-child(6)": {
				"grid-column": "1 / 3",
				"justify-self": "center"
			},
			".plans-grid > div:nth-child(5)": { "grid-row-start": 3 },
			".plans-grid > div:nth-child(6)": { "grid-row-start": 4 }
		},
		"@media (max-width: 600px)": {
			".plans-grid": { "grid-template-rows": "auto min-content auto min-content auto min-content" },
			".plans-grid > div:nth-child(3), .plans-grid > div:nth-child(4)": { order: "unset" },
			".plans-grid > div:nth-child(5), .plans-grid > div:nth-child(6)": { "grid-column": "unset" },
			".plans-grid > div:nth-child(5)": { "grid-row-start": "unset" },
			".plans-grid > div:nth-child(6)": { "grid-row-start": "unset" }
		},
		".buyOptionBox.active": { border: `1px solid ${theme.content_accent}` },
		".buyOptionBox.highlighted": {
			border: `2px solid ${theme.content_accent}`,
			padding: px(9)
		},
		".buyOptionBox.highlighted.cyberMonday": {
			border: `2px solid ${theme.content_accent_cyber_monday}`,
			padding: px(9)
		},
		".info-badge": {
			"border-radius": px(8),
			"line-height": px(16),
			"font-size": px(12),
			"font-weight": "bold",
			width: px(16),
			height: px(16),
			"text-align": "center",
			color: "white",
			background: theme.content_button
		},
		".tooltip": {
			position: "relative",
			display: "inline-block"
		},
		".tooltip .tooltiptext": {
			visibility: "hidden",
			"background-color": theme.content_button,
			color: theme.content_bg,
			"text-align": "center",
			padding: "5px 5px",
			"border-radius": px(6),
			position: "absolute",
			"z-index": 1,
			top: "150%",
			left: "50%"
		},
		"details[open] summary ~ *": { animation: "expand .2s ease-in-out" },
		".expand": { animation: "expand .2s ease-in-out" },
		"@keyframes expand": {
			"0%": {
				opacity: 0,
				"margin-top": "-10px",
				height: "0%"
			},
			"100%": {
				opacity: 1,
				"margin-top": px(0),
				height: "100%"
			}
		},
		".info-badge:active": {
			background: theme.content_bg,
			color: theme.content_button
		},
		".tooltip:hover .tooltiptext, .tooltip[expanded=true] .tooltiptext": { visibility: "visible" },
		".ribbon-horizontal": {
			position: "absolute",
			"margin-bottom": "80px",
			background: theme.content_accent,
			top: "69px",
			left: "-6px",
			right: "-6px",
			color: theme.content_bg
		},
		".ribbon-horizontal-cyber-monday": {
			background: theme.content_bg_cyber_monday,
			color: theme.content_bg
		},
		".ribbon-horizontal:after": {
			content: "\"\"",
			position: "absolute",
			height: 0,
			width: 0,
			"border-left": `6px solid ${theme.content_accent}`,
			"border-bottom": "6px solid transparent",
			bottom: "-6px",
			right: 0
		},
		".ribbon-horizontal-cyber-monday:after": { "border-left": `6px solid ${theme.content_bg_cyber_monday}` },
		".ribbon-horizontal:before": {
			content: "\"\"",
			position: "absolute",
			height: 0,
			width: 0,
			"border-right": `6px solid ${theme.content_accent}`,
			"border-bottom": "6px solid transparent",
			bottom: "-6px",
			left: 0
		},
		".ribbon-horizontal-cyber-monday:before": { "border-right": `6px solid ${theme.content_bg_cyber_monday}` },
		".flex-end-on-child .button-content": { "align-items": "flex-end !important" },
		".calendar-checkbox": {
			height: px(22),
			width: px(22),
			"border-width": "1.5px",
			"border-style": "solid",
			"border-radius": "2px"
		},
		".checkbox-override": {
			appearance: "none",
			font: "inherit",
			margin: px(0),
			"margin-right": px(5),
			position: "relative",
			bottom: px(-2)
		},
		".checkbox": {
			appearance: "none",
			margin: "0",
			display: "block",
			width: px(size.checkbox_size),
			height: px(size.checkbox_size),
			border: `2px solid ${theme.content_button}`,
			"border-radius": "3px",
			position: "relative",
			transition: `border ${DefaultAnimationTime}ms cubic-bezier(.4,.0,.23,1)`,
			opacity: "0.8"
		},
		".checkbox:hover": { opacity: "1" },
		".checkbox:checked": {
			border: `7px solid ${theme.content_accent}`,
			opacity: "1"
		},
		".checkbox:checked:after": { display: "inline-flex" },
		".checkbox:after": {
			"font-family": "'Ionicons'",
			content: `'${FontIcons.Checkbox}'`,
			position: "absolute",
			display: "none",
			"font-size": "12px",
			top: "-6px",
			left: "-6px",
			right: 0,
			bottom: 0,
			"line-height": "12px",
			color: theme.content_bg,
			"align-items": "center",
			width: "12px",
			height: "12px"
		},
		".checkbox:before": {
			content: "''",
			position: "absolute",
			width: "30px",
			height: "30px",
			top: "-10px",
			left: "-10px",
			"border-radius": px(size.border_radius),
			transition: `all ${DefaultAnimationTime}ms cubic-bezier(.4,.0,.23,1)`
		},
		".checkbox:checked:before": {
			top: "-15px",
			left: "-15px"
		},
		".checkbox:hover:before": { background: stateBgHover },
		".checkbox:active:before": { background: stateBgActive },
		".list-checkbox": { opacity: "0.4" },
		".calendar-alternate-background": { background: `${theme.list_alternate_bg} !important` },
		".calendar-day:hover": { background: theme.list_alternate_bg },
		".calendar-day:hover .calendar-day-header-button": { opacity: 1 },
		".calendar-day-header-button": { opacity: 0 },
		".calendar-hour": {
			"border-bottom": `1px solid ${theme.content_border}`,
			height: px(size.calendar_hour_height),
			flex: "1 0 auto"
		},
		".calendar-hour:hover": { background: theme.list_alternate_bg },
		".calendar-column-border": { "border-right": `1px solid ${theme.list_border}` },
		".calendar-column-border:nth-child(7)": { "border-right": "none" },
		".calendar-hour-margin": { "margin-left": px(size.calendar_hour_width) },
		".calendar-hour-column": { width: px(size.calendar_hour_width) },
		".calendar-days-header-row": { height: px(size.calendar_days_header_height) },
		".calendar-day": {
			"border-top": `1px solid ${theme.list_border}`,
			transition: "background 0.4s",
			background: theme.list_bg
		},
		".cursor-pointer": { cursor: "pointer" },
		".calendar-day-indicator": {
			height: px(size.calendar_days_header_height),
			"line-height": px(size.calendar_days_header_height),
			"text-align": "center",
			"font-size": "14px"
		},
		".calendar-day .calendar-day-indicator:hover": {
			background: theme.list_message_bg,
			opacity: .7
		},
		".calendar-day-number": {
			margin: "3px auto",
			width: "22px"
		},
		".calendar-event": {
			"border-radius": px(4),
			border: ` ${size.calendar_event_border}px solid ${theme.content_bg}`,
			"padding-left": "4px",
			"font-weight": "600",
			"box-sizing": "content-box"
		},
		".calendar-current-day-circle": { "background-color": theme.content_button },
		".calendar-selected-day-circle": { "background-color": theme.content_accent },
		".calendar-current-day-text": {
			color: theme.content_bg,
			"font-weight": "bold"
		},
		".calendar-selected-day-text": {
			color: theme.content_bg,
			"font-weight": "bold"
		},
		".animation-reverse": { "animation-direction": "reverse" },
		".slide-bottom": {
			"animation-name": "slideFromBottom",
			"animation-iteration-count": 1,
			"animation-timing-function": "ease-in",
			"animation-duration": "100ms"
		},
		"@keyframes slideFromBottom": {
			"0%": { translate: "0 100%" },
			"100%": { translate: "0 0" }
		},
		".slide-top": {
			"animation-name": "slideFromTop",
			"animation-iteration-count": 1,
			"animation-timing-function": "ease-in",
			"animation-duration": "100ms"
		},
		"@keyframes slideFromTop": {
			"0%": { translate: "0 -100%" },
			"100%": { translate: "0 0" }
		},
		".fade-in": {
			opacity: 1,
			"animation-name": "fadeInOpacity",
			"animation-iteration-count": 1,
			"animation-timing-function": "ease-in",
			"animation-duration": "200ms"
		},
		"@keyframes fadeInOpacity": {
			"0%": { opacity: 0 },
			"100%": { opacity: 1 }
		},
		".calendar-bubble-more-padding-day .calendar-event": { border: `1px solid ${theme.list_bg}` },
		".darker-hover:hover": { filter: "brightness(95%)" },
		".darkest-hover:hover": { filter: "brightness(70%)" },
		".event-continues-left": {
			"border-top-left-radius": 0,
			"border-bottom-left-radius": 0,
			"border-left": "none"
		},
		".event-continues-right": {
			"margin-right": 0,
			"border-right": "none",
			"border-top-right-radius": 0,
			"border-bottom-right-radius": 0
		},
		".event-continues-right-arrow": {
			width: 0,
			height: 0,
			"border-top": "9px solid transparent",
			"border-bottom": "9px solid transparent",
			"border-left": "6px solid green",
			"margin-top": px(1),
			"margin-bottom": px(1)
		},
		".time-field": { width: "80px" },
		".time-picker input": { color: "rgba(0, 0, 0, 0)" },
		".time-picker-fake-display": {
			bottom: "1.6em",
			left: "0.1em"
		},
		".calendar-agenda-time-column": { width: px(80) },
		".calendar-agenda-time-column > *": { height: px(44) },
		".calendar-agenda-row": {
			"min-height": "44px",
			flex: "1 0 auto"
		},
		".calendar-switch-button": {
			width: "40px",
			"text-align": "center"
		},
		".calendar-long-events-header": {
			overflow: "hidden",
			"border-bottom": `1px solid ${theme.content_border}`
		},
		".calendar-month-week-number": {
			"font-size": "12px",
			opacity: "0.8",
			top: "8px",
			left: "6px"
		},
		".calendar-month-week-number:after": {
			content: "''",
			width: "100%",
			height: "100%",
			position: "absolute",
			top: "0",
			left: "0",
			padding: "35%",
			margin: "-35% -35%"
		},
		".color-option:not(.selected):focus-within, .color-option:not(.selected):hover": client.isDesktopDevice() ? { opacity: .7 } : {},
		".custom-color-container .text-field": { "padding-top": "0px" },
		".custom-color-container .text.input": {
			"text-transform": "uppercase",
			width: "9ch"
		},
		".custom-color-container .inputWrapper:before": {
			content: "\"#\" / \"\"",
			color: theme.content_message_bg
		},
		".calendar-invite-field": { "min-width": "80px" },
		".block-list": {
			"list-style": "none",
			padding: 0
		},
		".block-list li": { display: "block" },
		".sticky": { position: "sticky" },
		".text-fade": { color: theme.content_button },
		".no-appearance input, .no-appearance input::-webkit-outer-spin-button, .no-appearance input::-webkit-inner-spin-button": {
			"-webkit-appearance": "none",
			"-moz-appearance": "textfield",
			appearance: "none"
		},
		"@media (max-width: 400px)": {
			".flex-direction-change": {
				display: "flex",
				"flex-direction": "column-reverse",
				"justify-content": "center"
			},
			".column-width-small": { width: px(size.column_width_s_mobile) },
			"svg, img": { "shape-rendering": "optimizeSpeed" }
		},
		".transition-margin": { transition: `margin-bottom 200ms ease-in-out` },
		".circle": { "border-radius": "50%" },
		".clickable": { cursor: "pointer" },
		".switch-month-button svg": { fill: theme.navigation_button },
		"drawer-menu": {
			width: px(size.drawer_menu_width),
			background: getNavigationMenuBg()
		},
		".menu-shadow": { "box-shadow": "0 4px 5px 2px rgba(0,0,0,0.14), 0 4px 5px 2px rgba(0,0,0,0.14), 0 4px 5px 2px rgba(0,0,0,0.14)" },
		".big-input input": {
			"font-size": px(size.font_size_base * 1.4),
			"line-height": `${px(size.font_size_base * 1.4 + 2)} !important`
		},
		".hidden-until-focus": {
			position: "absolute",
			left: "-9999px",
			"z-index": "999",
			opacity: "0"
		},
		".hidden-until-focus:focus": {
			left: "50%",
			transform: "translate(-50%)",
			opacity: "1"
		},
		[`@media (max-width: ${size.desktop_layout_width - 1}px)`]: {
			".main-view": {
				top: 0,
				bottom: 0
			},
			".fixed-bottom-right": {
				bottom: px(size.hpad_large_mobile + size.bottom_nav_bar),
				right: px(size.hpad_large_mobile)
			},
			".custom-logo": { width: px(40) },
			".notification-overlay-content": { "padding-top": px(size.vpad_small) },
			".calendar-day-indicator": {
				height: "20px",
				"line-height": "20px",
				"text-align": "center",
				"font-size": "14px"
			},
			".calendar-day-number": {
				margin: "2px auto",
				width: "20px"
			},
			".calendar-hour-margin": { "margin-left": px(size.calendar_hour_width_mobile) },
			".calendar-month-week-number": {
				"font-size": "10px",
				opacity: "0.8",
				top: "3px",
				left: "3px"
			}
		},
		".cursor-grabbing *": { cursor: "grabbing !important" },
		".drag-mod-key *": { cursor: "copy !important" },
		".noscreen": { display: "none" },
		"@media print": {
			".color-adjust-exact": {
				"color-adjust": "exact",
				"-webkit-print-color-adjust": "exact"
			},
			".noprint": { display: "none !important" },
			".noscreen": { display: "initial" },
			".print": {
				color: "black",
				"background-color": "white",
				display: "block"
			},
			"html, body": {
				position: "initial",
				overflow: "visible !important",
				color: lightTheme.content_fg,
				"background-color": `${lightTheme.content_bg} !important`
			},
			".header-nav": { display: "none" },
			".main-view": {
				top: 0,
				position: "static !important"
			},
			".dropdown-panel": { display: "none" },
			".fill-absolute": {
				position: "static !important",
				display: "initial"
			},
			".view-columns": {
				width: "100% !important",
				transform: "initial !important",
				display: "initial",
				position: "initial"
			},
			".view-column:nth-child(1), .view-column:nth-child(2)": { display: "none" },
			".view-column": { width: "100% !important" },
			"#mail-viewer": {
				overflow: "visible",
				display: "block"
			},
			"#mail-body": { overflow: "visible" },
			"#login-view": { display: "none" },
			".dialog-header": { display: "none" },
			".dialog-container": {
				overflow: "visible",
				position: "static !important"
			},
			"#wizard-paging": { display: "none" },
			"button:not(.print)": { display: "none" },
			".bottom-nav": { display: "none" },
			".mobile .view-column:nth-child(2)": { display: "initial" },
			".folder-column": { display: "none" },
			pre: {
				"word-break": "normal",
				"overflow-wrap": "anywhere",
				"white-space": "break-spaces"
			}
		},
		"@keyframes onAutoFillStart": {
			from: {},
			to: {}
		},
		"@keyframes onAutoFillCancel": {
			from: {},
			to: {}
		},
		"input:-webkit-autofill": { "animation-name": "onAutoFillStart" },
		"input:not(:-webkit-autofill)": { "animation-name": "onAutoFillCancel" },
		".MsoListParagraph, .MsoListParagraphCxSpFirst, .MsoListParagraphCxSpMiddle, .MsoListParagraphCxSpLast": { "margin-left": "36.0pt" },
		"span.vertical-text": {
			transform: "rotate(180deg)",
			"writing-mode": "vertical-rl"
		},
		"ul.usage-test-opt-in-bullets": {
			margin: "0 auto",
			"list-style": "disc",
			"text-align": "left"
		},
		".bonus-month": {
			background: theme.content_accent,
			color: theme.content_bg,
			width: px(100),
			"min-width": px(100),
			height: px(100),
			"min-height": px(100),
			"border-radius": px(100)
		},
		".day-events-indicator": {
			"background-color": theme.content_accent,
			"border-radius": "50%",
			display: "inline-block",
			height: "5px",
			width: "5px",
			position: "absolute",
			bottom: 0,
			margin: "0 auto",
			left: 0,
			right: 0
		},
		".faded-day": { color: theme.navigation_menu_icon },
		".faded-text": { color: theme.content_message_bg },
		".svg-text-content-bg text": { fill: theme.content_bg },
		".overflow-auto": { overflow: "auto" },
		".float-action-button": {
			position: "fixed",
			"border-radius": "25%"
		},
		".posb-ml": { bottom: px(size.vpad_ml) },
		".posr-ml": { right: px(size.vpad_ml) },
		".mb-small-line-height": { "margin-bottom": px(size.line_height * size.font_size_small) },
		".tutaui-card-container": {
			"box-sizing": "border-box",
			"background-color": theme.content_bg,
			"border-radius": px(size.border_radius_medium),
			padding: px(size.vpad_small),
			position: "relative",
			height: "fit-content"
		},
		".tutaui-card-container-divide": { padding: "0" },
		".tutaui-card-container-divide > *:not(:last-child)": {
			"border-radius": "0",
			"border-bottom": `1px solid ${theme.button_bubble_bg}`
		},
		".tutaui-text-field, .child-text-editor [role='textbox']": {
			display: "block",
			"box-sizing": "border-box",
			"background-color": "transparent",
			border: "none",
			"border-radius": px(size.border_radius_medium),
			color: theme.content_fg,
			width: "100%",
			padding: px(size.vpad_small),
			transition: `background-color .1s ease-out`,
			"caret-color": theme.content_accent
		},
		".child-text-editor [role='textbox']:focus-visible": { outline: "medium invert color" },
		".tutaui-text-field:focus, .child-text-editor [role='textbox']:focus": { "background-color": theme.button_bubble_bg },
		".tutaui-text-field::placeholder": { color: theme.content_message_bg },
		".text-editor-placeholder": {
			position: "absolute",
			top: px(size.vpad_small),
			left: px(size.vpad_small),
			color: theme.content_message_bg
		},
		".tutaui-switch": {
			display: "flex",
			"align-items": "center",
			gap: px(size.vpad_small)
		},
		".tutaui-toggle-pill": {
			position: "relative",
			display: "block",
			width: "45.5px",
			height: "28px",
			"background-color": theme.content_message_bg,
			"border-radius": px(size.vpad_small * 4),
			transition: `background-color ${DefaultAnimationTime}ms ease-out`
		},
		".tutaui-toggle-pill:after": {
			position: "absolute",
			content: "''",
			width: "21px",
			height: "21px",
			top: "50%",
			"-webkit-transform": "translateY(-50%)",
			"-moz-transform": "translateY(-50%)",
			"-ms-transform": "translateY(-50%)",
			transform: "translateY(-50%)",
			margin: "0 4px",
			"background-color": "#fff",
			"border-radius": "50%",
			left: 0,
			transition: `left ${DefaultAnimationTime}ms ease-out`
		},
		".tutaui-toggle-pill.checked": { "background-color": theme.content_accent },
		".tutaui-toggle-pill.checked:after": { left: "calc(100% - 29px)" },
		".tutaui-toggle-pill input[type='checkbox']": {
			"z-index": "-1",
			visibility: "hidden",
			position: "absolute"
		},
		".tutaui-select-trigger": {
			display: "flex",
			"justify-content": "space-between",
			"align-items": "center",
			gap: px(size.vpad_small)
		},
		".fit-content": { width: "fit-content" },
		".tutaui-button-outline": {
			border: "2px solid",
			"border-radius": px(size.border_radius_medium),
			padding: px(size.border_radius_medium),
			"text-align": "center"
		},
		".unstyled-list": {
			"list-style": "none",
			margin: 0,
			padding: 0
		},
		".time-selection-grid": {
			display: "grid",
			"grid-template-columns": "2fr 6fr 3fr",
			"grid-gap": px(size.vpad_small),
			"align-items": "center"
		},
		".time-selection-grid > *": {
			overflow: "hidden",
			"white-space": "nowrap",
			"text-overflow": "clip"
		},
		".invisible": {
			all: "none",
			"background-color": "transparent",
			border: "none",
			color: "transparent"
		},
		".invisible::selection": {
			all: "none",
			"background-color": "transparent",
			border: "none",
			color: "transparent"
		},
		".invisible::-moz-selection": {
			all: "none",
			"background-color": "transparent",
			border: "none",
			color: "transparent"
		},
		".transition-transform": { transition: `transform ${DefaultAnimationTime}ms linear` },
		".border-none": { border: "none" },
		".big-radio": {
			width: "20px",
			height: "20px"
		},
		".outlined": {
			border: `2px solid ${theme.content_border}`,
			"border-radius": px(size.border_radius_medium)
		},
		".capitalize": { "text-transform": "capitalize" },
		".box-content": { "box-sizing": "content-box" },
		".fit-height": { height: "fit-content" },
		".min-h-s": { "min-height": px(size.vpad_xl * 4) },
		".border-content-message-bg": { "border-color": theme.content_message_bg },
		".border-radius-bottom-0": {
			"border-bottom-right-radius": px(0),
			"border-bottom-left-radius": px(0)
		}
	};
});

//#endregion
export { getFonts };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi1zdHlsZXMtY2h1bmsuanMiLCJuYW1lcyI6WyJ0b3A6IG51bWJlciB8IG51bGwiLCJyaWdodDogbnVtYmVyIHwgbnVsbCIsImJvdHRvbTogbnVtYmVyIHwgbnVsbCIsImxlZnQ6IG51bWJlciB8IG51bGwiLCJ2YWx1ZTogbnVtYmVyIHwgbnVsbCIsImZvbnRzOiBBcnJheTxzdHJpbmc+Il0sInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1vbi9ndWkvbWl4aW5zLnRzIiwiLi4vc3JjL2NvbW1vbi9ndWkvbWFpbi1zdHlsZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcHggfSBmcm9tIFwiLi9zaXplXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGVCb290IH0gZnJvbSBcIi4uL2FwaS9jb21tb24vRW52XCJcblxuYXNzZXJ0TWFpbk9yTm9kZUJvb3QoKVxuZXhwb3J0IGNvbnN0IG5vc2VsZWN0ID0ge1xuXHRfd2Via2l0X3RvdWNoX2NhbGxvdXQ6IFwibm9uZVwiLFxuXG5cdC8qIGlPUyBTYWZhcmkgKi9cblx0X3dlYmtpdF91c2VyX3NlbGVjdDogXCJub25lXCIsXG5cblx0LyogQ2hyb21lL1NhZmFyaS9PcGVyYSAqL1xuXHRfa2h0bWxfdXNlcl9zZWxlY3Q6IFwibm9uZVwiLFxuXG5cdC8qIEtvbnF1ZXJvciAqL1xuXHRfbW96X3VzZXJfc2VsZWN0OiBcIm5vbmVcIixcblxuXHQvKiBGaXJlZm94ICovXG5cdF9tc191c2VyX3NlbGVjdDogXCJub25lXCIsXG5cblx0LyogSUUvRWRnZSAqL1xuXHR1c2VyX3NlbGVjdDogXCJub25lXCIsXG5cdC8qIG5vbl9wcmVmaXhlZCB2ZXJzaW9uLCBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBieSBhbnkgYnJvd3NlciAqL1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb25fYWJzb2x1dGUoXG5cdHRvcDogbnVtYmVyIHwgbnVsbCxcblx0cmlnaHQ6IG51bWJlciB8IG51bGwsXG5cdGJvdHRvbTogbnVtYmVyIHwgbnVsbCxcblx0bGVmdDogbnVtYmVyIHwgbnVsbCxcbik6IHtcblx0Ym90dG9tOiBudW1iZXIgfCBzdHJpbmdcblx0bGVmdDogbnVtYmVyIHwgc3RyaW5nXG5cdHBvc2l0aW9uOiBzdHJpbmdcblx0cmlnaHQ6IG51bWJlciB8IHN0cmluZ1xuXHR0b3A6IG51bWJlciB8IHN0cmluZ1xufSB7XG5cdHJldHVybiB7XG5cdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHR0b3A6IHBvc2l0aW9uVmFsdWUodG9wKSxcblx0XHRyaWdodDogcG9zaXRpb25WYWx1ZShyaWdodCksXG5cdFx0Ym90dG9tOiBwb3NpdGlvblZhbHVlKGJvdHRvbSksXG5cdFx0bGVmdDogcG9zaXRpb25WYWx1ZShsZWZ0KSxcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb25WYWx1ZSh2YWx1ZTogbnVtYmVyIHwgbnVsbCk6IG51bWJlciB8IHN0cmluZyB7XG5cdGlmICh2YWx1ZSkge1xuXHRcdHJldHVybiBweCh2YWx1ZSlcblx0fSBlbHNlIGlmICh2YWx1ZSA9PT0gMCkge1xuXHRcdHJldHVybiAwXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwidW5zZXRcIlxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbGV4KGFyZ3M6IHN0cmluZyk6IHtcblx0X21zX2ZsZXg6IHN0cmluZ1xuXHRfd2Via2l0X2JveF9mbGV4OiBzdHJpbmdcblx0X3dlYmtpdF9mbGV4OiBzdHJpbmdcblx0ZmxleDogc3RyaW5nXG59IHtcblx0cmV0dXJuIHtcblx0XHRfd2Via2l0X2JveF9mbGV4OiBhcmdzLFxuXHRcdF93ZWJraXRfZmxleDogYXJncyxcblx0XHRfbXNfZmxleDogYXJncyxcblx0XHRmbGV4OiBhcmdzLFxuXHR9XG59XG5cbi8vIFdlIGFwcGx5IGJhY2tmYWNlX3Zpc2liaWxpdHkgb24gYWxsIGFuaW1hdGVkIGVsZW1lbnRzIHRvIGluY3JlYXNlIGFuaW1hdGlvbiBwZXJmb3JtYW5jZSBvbiBtb2JpbGUgZGV2aWNlc1xuZXhwb3J0IGNvbnN0IGJhY2tmYWNlX2ZpeCA9IHtcblx0X3dlYmtpdF9iYWNrZmFjZV92aXNpYmlsaXR5OiBcImhpZGRlblwiLFxuXHRiYWNrZmFjZV92aXNpYmlsaXR5OiBcImhpZGRlblwiLFxufVxuIiwiaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSBcIi4vc3R5bGVzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4vc2l6ZVwiXG5pbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vbWlzYy9DbGllbnREZXRlY3RvclwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgbm9zZWxlY3QsIHBvc2l0aW9uX2Fic29sdXRlLCBwb3NpdGlvblZhbHVlIH0gZnJvbSBcIi4vbWl4aW5zXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUsIGlzQWRtaW5DbGllbnQsIGlzQXBwLCBpc0VsZWN0cm9uQ2xpZW50IH0gZnJvbSBcIi4uL2FwaS9jb21tb24vRW52XCJcbmltcG9ydCB7IGdldENvbnRlbnRCdXR0b25JY29uQmFja2dyb3VuZCwgZ2V0RWxldmF0ZWRCYWNrZ3JvdW5kLCBnZXROYXZpZ2F0aW9uTWVudUJnLCB0aGVtZSB9IGZyb20gXCIuL3RoZW1lXCJcbmltcG9ydCB7IHN0YXRlQmdBY3RpdmUsIHN0YXRlQmdGb2N1cywgc3RhdGVCZ0hvdmVyLCBzdGF0ZUJnTGlrZSB9IGZyb20gXCIuL2J1aWx0aW5UaGVtZXMuanNcIlxuaW1wb3J0IHsgRm9udEljb25zIH0gZnJvbSBcIi4vYmFzZS9pY29ucy9Gb250SWNvbnMuanNcIlxuaW1wb3J0IHsgRGVmYXVsdEFuaW1hdGlvblRpbWUgfSBmcm9tIFwiLi9hbmltYXRpb24vQW5pbWF0aW9ucy5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3IuanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZvbnRzKCk6IHN0cmluZyB7XG5cdC8vIHNlZSBodHRwczovL2JpdHNvZmNvLmRlL3RoZS1uZXctc3lzdGVtLWZvbnQtc3RhY2svXG5cdGNvbnN0IGZvbnRzOiBBcnJheTxzdHJpbmc+ID0gW1xuXHRcdFwiLWFwcGxlLXN5c3RlbVwiLFxuXHRcdFwic3lzdGVtLXVpXCIsXG5cdFx0XCJCbGlua01hY1N5c3RlbUZvbnRcIixcblx0XHRcIlNlZ29lIFVJXCIsXG5cdFx0XCJSb2JvdG9cIixcblx0XHRcIkhlbHZldGljYSBOZXVlXCIsXG5cdFx0XCJIZWx2ZXRpY2FcIixcblx0XHRcIkFyaWFsXCIsXG5cdFx0XCJzYW5zLXNlcmlmXCIsXG5cdF1cblx0Ly8gd29ya2Fyb3VuZCBmb3IgaW5jb3JyZWN0IEphcGFuZXNlIGZvbnQgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS90dXRhby90dXRhbm90YS9pc3N1ZXMvMTkwOVxuXHRpZiAoZW52LnBsYXRmb3JtSWQgPT09IFwid2luMzJcIiAmJiBsYW5nLmNvZGUgPT09IFwiamFcIikgZm9udHMucHVzaChcIlNpbUhlaVwiLCBcIum7keS9k1wiKVxuXHRmb250cy5wdXNoKFwiQXBwbGUgQ29sb3IgRW1vamlcIiwgXCJTZWdvZSBVSSBFbW9qaVwiLCBcIlNlZ29lIFVJIFN5bWJvbFwiKVxuXHRyZXR1cm4gZm9udHMuam9pbihcIiwgXCIpXG59XG5cbmNvbnN0IGJveFNoYWRvdyA9IGAwIDEwcHggMjBweCByZ2JhKDAsMCwwLDAuMTkpLCAwIDZweCA2cHggcmdiYSgwLDAsMCwwLjIzKWBcbmNvbnN0IHNlYXJjaEJhclNoYWRvdyA9IFwiMHB4IDJweCA0cHggcmdiKDAsIDAsIDAsIDAuMTIpXCJcblxuY29uc3Qgc2Nyb2xsYmFyV2lkdGhIZWlnaHQgPSBweCgxOClcbnN0eWxlcy5yZWdpc3RlclN0eWxlKFwibWFpblwiLCAoKSA9PiB7XG5cdGNvbnN0IGxpZ2h0VGhlbWUgPSBsb2NhdG9yLnRoZW1lQ29udHJvbGxlci5nZXRCYXNlVGhlbWUoXCJsaWdodFwiKVxuXHRyZXR1cm4ge1xuXHRcdFwiI2xpbmstdHRcIjogaXNFbGVjdHJvbkNsaWVudCgpXG5cdFx0XHQ/IHtcblx0XHRcdFx0XHRcInBvaW50ZXItZXZlbnRzXCI6IFwibm9uZVwiLFxuXHRcdFx0XHRcdFwiZm9udC1zaXplXCI6IHB4KHNpemUuZm9udF9zaXplX3NtYWxsKSxcblx0XHRcdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdFx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdFx0XHRcdFwicGFkZGluZy10b3BcIjogcHgoc2l6ZS52cGFkX3hzKSxcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJmaXhlZFwiLFxuXHRcdFx0XHRcdGJvdHRvbTogcHgoc2l6ZS52cGFkX3hzKSxcblx0XHRcdFx0XHRsZWZ0OiBweChzaXplLnZwYWRfeHMpLFxuXHRcdFx0XHRcdFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiLFxuXHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2JnLFxuXHRcdFx0XHRcdFwidGV4dC1kZWNvcmF0aW9uXCI6IFwibm9uZVwiLFxuXHRcdFx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiB0aGVtZS5jb250ZW50X2ZnLFxuXHRcdFx0XHRcdGJvcmRlcjogXCIxcHggc29saWQgXCIgKyB0aGVtZS5jb250ZW50X2JnLFxuXHRcdFx0XHRcdG9wYWNpdHk6IDAsXG5cdFx0XHRcdFx0dHJhbnNpdGlvbjogXCJvcGFjaXR5IC4xcyBsaW5lYXJcIixcblx0XHRcdFx0XHRcImZvbnQtZmFtaWx5XCI6IFwibW9ub3NwYWNlXCIsXG5cdFx0XHQgIH1cblx0XHRcdDoge30sXG5cdFx0XCIjbGluay10dC5yZXZlYWxcIjogaXNFbGVjdHJvbkNsaWVudCgpXG5cdFx0XHQ/IHtcblx0XHRcdFx0XHRvcGFjaXR5OiAxLFxuXHRcdFx0XHRcdHRyYW5zaXRpb246IFwib3BhY2l0eSAuMXMgbGluZWFyXCIsXG5cdFx0XHRcdFx0XCJ6LWluZGV4XCI6IDk5OTksXG5cdFx0XHQgIH1cblx0XHRcdDoge30sXG5cdFx0XCIqOm5vdChpbnB1dCk6bm90KHRleHRhcmVhKVwiOiBpc0FkbWluQ2xpZW50KClcblx0XHRcdD8ge31cblx0XHRcdDoge1xuXHRcdFx0XHRcdFwidXNlci1zZWxlY3RcIjogXCJub25lXCIsXG5cblx0XHRcdFx0XHQvKiBkaXNhYmxlIHNlbGVjdGlvbi9Db3B5IGZvciBVSSBlbGVtZW50cyovXG5cdFx0XHRcdFx0XCItbXMtdXNlci1zZWxlY3RcIjogXCJub25lXCIsXG5cdFx0XHRcdFx0XCItd2Via2l0LXVzZXItc2VsZWN0XCI6IFwibm9uZVwiLFxuXHRcdFx0XHRcdFwiLW1vei11c2VyLXNlbGVjdFwiOiBcIm5vbmVcIixcblx0XHRcdFx0XHRcIi13ZWJraXQtdG91Y2gtY2FsbG91dFwiOiBcIm5vbmVcIixcblxuXHRcdFx0XHRcdC8qIGRpc2FibGUgdGhlIElPUyBwb3B1cCB3aGVuIGxvbmctcHJlc3Mgb24gYSBsaW5rICovXG5cdFx0XHRcdFx0XCItd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3JcIjogXCJyZ2JhKDAsIDAsIDAsIDApXCIsXG5cdFx0XHQgIH0sXG5cdFx0XCIqOm5vdChpbnB1dCk6bm90KHRleHRhcmVhKTpub3QoW2RyYWdnYWJsZT0ndHJ1ZSddKVwiOiB7XG5cdFx0XHRcIi13ZWJraXQtdXNlci1kcmFnXCI6IFwibm9uZVwiLFxuXHRcdH0sXG5cdFx0Ly8gRGlzYWJsZSBvdXRsaW5lIGZvciBtb3VzZSBhbmQgdG91Y2ggbmF2aWdhdGlvblxuXHRcdFwiOndoZXJlKC5tb3VzZS1uYXYpICosIDp3aGVyZSgudG91Y2gtbmF2KSAqXCI6IHtcblx0XHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdH0sXG5cdFx0XCIuc2VsZWN0YWJsZVwiOiB7XG5cdFx0XHRjdXJzb3I6IFwidGV4dFwiLFxuXHRcdFx0XCJ1c2VyLXNlbGVjdFwiOiBcInRleHQgIWltcG9ydGFudFwiLFxuXHRcdFx0XCItbXMtdXNlci1zZWxlY3RcIjogXCJ0ZXh0ICFpbXBvcnRhbnRcIixcblx0XHRcdFwiLXdlYmtpdC11c2VyLXNlbGVjdFwiOiBcInRleHQgIWltcG9ydGFudFwiLFxuXHRcdFx0XCItbW96LXVzZXItc2VsZWN0XCI6IFwidGV4dCAhaW1wb3J0YW50XCIsXG5cdFx0XHRcIi13ZWJraXQtdG91Y2gtY2FsbG91dFwiOiBcImRlZmF1bHQgIWltcG9ydGFudFwiLFxuXHRcdH0sXG5cdFx0XCIuc2VsZWN0YWJsZSAqXCI6IHtcblx0XHRcdFwidXNlci1zZWxlY3RcIjogXCJ0ZXh0ICFpbXBvcnRhbnRcIixcblx0XHRcdFwiLW1zLXVzZXItc2VsZWN0XCI6IFwidGV4dCAhaW1wb3J0YW50XCIsXG5cdFx0XHRcIi13ZWJraXQtdXNlci1zZWxlY3RcIjogXCJ0ZXh0ICFpbXBvcnRhbnRcIixcblx0XHRcdFwiLW1vei11c2VyLXNlbGVjdFwiOiBcInRleHQgIWltcG9ydGFudFwiLFxuXHRcdFx0XCItd2Via2l0LXRvdWNoLWNhbGxvdXRcIjogXCJkZWZhdWx0ICFpbXBvcnRhbnRcIixcblx0XHR9LFxuXHRcdFwiQGZvbnQtZmFjZVwiOiB7XG5cdFx0XHRcImZvbnQtZmFtaWx5XCI6IFwiJ0lvbmljb25zJ1wiLFxuXHRcdFx0c3JjOiBgdXJsKCcke3dpbmRvdy50dXRhby5hcHBTdGF0ZS5wcmVmaXhXaXRob3V0RmlsZX0vaW1hZ2VzL2ZvbnQudHRmJykgZm9ybWF0KCd0cnVldHlwZScpYCxcblx0XHRcdFwiZm9udC13ZWlnaHRcIjogXCJub3JtYWxcIixcblx0XHRcdFwiZm9udC1zdHlsZVwiOiBcIm5vcm1hbFwiLFxuXHRcdH0sXG5cdFx0Ly8gQWxsb3cgbG9uZy1jbGljayBjb250ZXh0dWFsIGFjdGlvbnMgZm9yIGlPU1xuXHRcdFwiLnRvdWNoLWNhbGxvdXQgKlwiOiB7XG5cdFx0XHRcIi13ZWJraXQtdG91Y2gtY2FsbG91dFwiOiBcImRlZmF1bHQgIWltcG9ydGFudFwiLFxuXHRcdH0sXG5cblx0XHQvKlxuICAgICBCb3ggU2l6aW5nXG4gICAgICovXG5cdFx0W2BodG1sLCBib2R5LCBkaXYsIGFydGljbGUsIHNlY3Rpb24sIG1haW4sIGZvb3RlciwgaGVhZGVyLCBmb3JtLCBmaWVsZHNldCwgbGVnZW5kLFxuICAgICAgICAgICAgcHJlLCBjb2RlLCBwLCBhLCBoMSwgaDIsIGgzLCBoNCwgaDUsIGg2LCB1bCwgb2wsIGxpLCBkbCwgZHQsIGRkLCB0ZXh0YXJlYSxcbiAgICAgICAgICAgIGlucHV0W3R5cGU9XCJlbWFpbFwiXSwgaW5wdXRbdHlwZT1cIm51bWJlclwiXSwgaW5wdXRbdHlwZT1cInBhc3N3b3JkXCJdLFxuICAgICAgICAgICAgaW5wdXRbdHlwZT1cInRlbFwiXSwgaW5wdXRbdHlwZT1cInRleHRcIl0sIGlucHV0W3R5cGU9XCJ1cmxcIl0sIC5ib3JkZXItYm94YF06IHtcblx0XHRcdFwiYm94LXNpemluZ1wiOiBcImJvcmRlci1ib3hcIixcblx0XHR9LFxuXHRcdGE6IHtcblx0XHRcdGNvbG9yOiBcImluaGVyaXRcIixcblx0XHR9LFxuXHRcdFwiOnJvb3RcIjoge1xuXHRcdFx0Ly8gV2UgbmVlZCBpdCBiZWNhdXNlIHdlIGNhbid0IGdldCBlbnYoKSB2YWx1ZSBmcm9tIEpTIGRpcmVjdGx5XG5cdFx0XHRcIi0tc2FmZS1hcmVhLWluc2V0LWJvdHRvbVwiOiBcImVudihzYWZlLWFyZWEtaW5zZXQtYm90dG9tKVwiLFxuXHRcdFx0XCItLXNhZmUtYXJlYS1pbnNldC10b3BcIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LXRvcClcIixcblx0XHRcdFwiLS1zYWZlLWFyZWEtaW5zZXQtcmlnaHRcIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LXJpZ2h0KVwiLFxuXHRcdFx0XCItLXNhZmUtYXJlYS1pbnNldC1sZWZ0XCI6IFwiZW52KHNhZmUtYXJlYS1pbnNldC1sZWZ0KVwiLFxuXHRcdH0sXG5cdFx0XCJodG1sLCBib2R5XCI6IHtcblx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHRtYXJnaW46IDAsXG5cdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0fSxcblx0XHRodG1sOiB7XG5cdFx0XHRcIi13ZWJraXQtZm9udC1zbW9vdGhpbmdcIjogXCJzdWJwaXhlbC1hbnRpYWxpYXNlZFwiLFxuXHRcdH0sXG5cdFx0Ly8gZGVmaW5lIGZvbnQtc21vb3RoaW5nIGZvciBjc3MgYW5pbWF0aW9uIGluIHNhZmFyaVxuXHRcdGJvZHk6IHtcblx0XHRcdHBvc2l0aW9uOiBcImZpeGVkXCIsXG5cdFx0XHQvLyBGaXggYm9keSBmb3IgaU9TICYgU2FmYXJpXG5cdFx0XHQvLyBJdCBpcyBpbmxpbmVkIHRvIFwidHJhbnNwYXJlbnRcIiBpbiBIVE1MIHNvIHdlIGhhdmUgdG8gb3ZlcndyaXRlIGl0LlxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IGAke3RoZW1lLmNvbnRlbnRfYmd9ICFpbXBvcnRhbnRgLFxuXHRcdH0sXG5cdFx0XCJidXR0b24sIHRleHRhcmVhXCI6IHtcblx0XHRcdHBhZGRpbmc6IDAsXG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJsZWZ0XCIsXG5cdFx0fSxcblx0XHRidXR0b246IHtcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIiwgLy8gcmVtb3ZlcyBkZWZhdWx0IGJyb3dzZXIgc3R5bGUgZm9yIGJ1dHRvbnNcblx0XHR9LFxuXHRcdFwiYnV0dG9uOmRpc2FibGVkXCI6IHtcblx0XHRcdGN1cnNvcjogXCJkZWZhdWx0XCIsXG5cdFx0fSxcblx0XHRcImJvZHksIGJ1dHRvblwiOiB7XG5cdFx0XHQvLyBZZXMgd2UgaGF2ZSB0byB0ZWxsIGJ1dHRvbnMgc2VwYXJhdGVseSBiZWNhdXNlIGJyb3dzZXIgYnV0dG9uIHN0eWxlcyBvdmVycmlkZSBnZW5lcmFsIGJvZHkgb25lc1xuXHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0XHQvLyBzZWU6IGh0dHBzOi8vd3d3LnNtYXNoaW5nbWFnYXppbmUuY29tLzIwMTUvMTEvdXNpbmctc3lzdGVtLXVpLWZvbnRzLXByYWN0aWNhbC1ndWlkZS8gYW5kIGdpdGh1YlxuXHRcdFx0XCJmb250LWZhbWlseVwiOiBnZXRGb250cygpLFxuXHRcdFx0XCJmb250LXNpemVcIjogcHgoc2l6ZS5mb250X3NpemVfYmFzZSksXG5cdFx0XHRcImxpbmUtaGVpZ2h0XCI6IHNpemUubGluZV9oZWlnaHQsXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9mZyxcblx0XHRcdFwiLXdlYmtpdC10ZXh0LXNpemUtYWRqdXN0XCI6IFwibm9uZVwiLCAvLyBmaXggZm9yIHNhZmFyaSBicm93c2VyXG5cdFx0fSxcblx0XHRcInNtYWxsLCAuc21hbGxcIjoge1xuXHRcdFx0XCJmb250LXNpemVcIjogcHgoc2l6ZS5mb250X3NpemVfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIuc21hbGxlclwiOiB7XG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9zbWFsbGVyKSxcblx0XHR9LFxuXHRcdFwiLm5vcm1hbC1mb250LXNpemVcIjoge1xuXHRcdFx0XCJmb250LXNpemVcIjogcHgoc2l6ZS5mb250X3NpemVfYmFzZSksXG5cdFx0fSxcblx0XHRcIi5iXCI6IHtcblx0XHRcdFwiZm9udC13ZWlnaHRcIjogXCJib2xkXCIsXG5cdFx0fSxcblx0XHRcIi5mb250LXdlaWdodC02MDBcIjoge1xuXHRcdFx0XCJmb250LXdlaWdodFwiOiBcIjYwMFwiLFxuXHRcdH0sXG5cdFx0XCIuaVwiOiB7XG5cdFx0XHRcImZvbnQtc3R5bGVcIjogXCJpdGFsaWNcIixcblx0XHR9LFxuXHRcdFwiLmNsaWNrXCI6IHtcblx0XHRcdGN1cnNvcjogXCJwb2ludGVyXCIsXG5cdFx0XHRcIi13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvclwiOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMClcIixcblx0XHR9LFxuXHRcdFwiLmNsaWNrLWRpc2FibGVkXCI6IHtcblx0XHRcdGN1cnNvcjogXCJkZWZhdWx0XCIsXG5cdFx0fSxcblx0XHRcIi50ZXh0XCI6IHtcblx0XHRcdGN1cnNvcjogXCJ0ZXh0XCIsXG5cdFx0fSxcblx0XHRcIi5vdmVyZmxvdy1oaWRkZW5cIjoge1xuXHRcdFx0b3ZlcmZsb3c6IFwiaGlkZGVuXCIsXG5cdFx0fSxcblx0XHRcIi5vdmVyZmxvdy14LWhpZGRlblwiOiB7XG5cdFx0XHRcIm92ZXJmbG93LXhcIjogXCJoaWRkZW5cIixcblx0XHR9LFxuXHRcdFwiLm92ZXJmbG93LXktaGlkZGVuXCI6IHtcblx0XHRcdFwib3ZlcmZsb3cteVwiOiBcImhpZGRlblwiLFxuXHRcdH0sXG5cdFx0XCIub3ZlcmZsb3cteS12aXNpYmxlXCI6IHtcblx0XHRcdFwib3ZlcmZsb3cteVwiOiBcInZpc2libGUgIWltcG9ydGFudFwiLFxuXHRcdH0sXG5cdFx0XCIub3ZlcmZsb3cteS1zY3JvbGxcIjoge1xuXHRcdFx0XCJvdmVyZmxvdy15XCI6IFwic2Nyb2xsXCIsXG5cdFx0XHRcIndlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmdcIjogXCJ0b3VjaFwiLFxuXHRcdH0sXG5cdFx0XCIub3ZlcmZsb3ctdmlzaWJsZVwiOiB7XG5cdFx0XHRvdmVyZmxvdzogXCJ2aXNpYmxlXCIsXG5cdFx0fSxcblx0XHRcImgxLCBoMiwgaDMsIGg0LCBoNSwgaDZcIjoge1xuXHRcdFx0bWFyZ2luOiAwLFxuXHRcdFx0XCJmb250LXdlaWdodFwiOiBcIm5vcm1hbFwiLFxuXHRcdH0sXG5cdFx0XCJoMSwgLmgxXCI6IHtcblx0XHRcdFwiZm9udC1zaXplXCI6IHB4KHNpemUuZm9udF9zaXplX2Jhc2UgKiAyKSxcblx0XHR9LFxuXHRcdFwiaDIsIC5oMlwiOiB7XG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9iYXNlICogMS44KSxcblx0XHR9LFxuXHRcdFwiaDMsIC5oM1wiOiB7XG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9iYXNlICogMS42KSxcblx0XHR9LFxuXHRcdFwiaDQsIC5oNFwiOiB7XG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9iYXNlICogMS40KSxcblx0XHR9LFxuXHRcdFwiaDUsIC5oNVwiOiB7XG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9iYXNlICogMS4yKSxcblx0XHR9LFxuXHRcdFwiaDYsIC5oNlwiOiB7XG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9iYXNlICogMS4xKSxcblx0XHR9LFxuXHRcdFwiaW5wdXQsIGJ1dHRvbiwgc2VsZWN0LCB0ZXh0YXJlYVwiOiB7XG5cdFx0XHRcImZvbnQtZmFtaWx5XCI6IFwiaW5oZXJpdFwiLFxuXHRcdFx0XCJmb250LXNpemVcIjogXCJpbmhlcml0XCIsXG5cdFx0XHRcImxpbmUtaGVpZ2h0XCI6IFwiaW5oZXJpdFwiLFxuXHRcdH0sXG5cdFx0XCIuaHJcIjoge1xuXHRcdFx0bWFyZ2luOiAwLFxuXHRcdFx0Ym9yZGVyOiBcIm5vbmVcIixcblx0XHRcdGhlaWdodDogXCIxcHhcIixcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiB0aGVtZS5saXN0X2JvcmRlcixcblx0XHR9LFxuXHRcdFwiLmJvcmRlclwiOiB7XG5cdFx0XHRib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0XCIuYm9yZGVyLXRvcFwiOiB7XG5cdFx0XHRcImJvcmRlci10b3BcIjogYDFweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWAsXG5cdFx0fSxcblx0XHRcIiNtYWlsLWJvZHkuYnJlYWstcHJlIHByZVwiOiB7XG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwicHJlLXdyYXBcIixcblx0XHRcdFwid29yZC1icmVha1wiOiBcIm5vcm1hbFwiLFxuXHRcdFx0XCJvdmVyZmxvdy13cmFwXCI6IFwiYW55d2hlcmVcIixcblx0XHR9LFxuXHRcdFwiLndoaXRlLXNwYWNlLXByZVwiOiB7XG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwicHJlXCIsXG5cdFx0fSxcblx0XHRcIi53aGl0ZS1zcGFjZVwiOiB7XG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwibm9ybWFsXCIsXG5cdFx0fSxcblx0XHRcIi5taW4tY29udGVudFwiOiB7XG5cdFx0XHR3aWR0aDogXCJtaW4tY29udGVudFwiLFxuXHRcdFx0aGVpZ2h0OiBcIm1pbi1jb250ZW50XCIsXG5cdFx0fSxcblx0XHRcIi53aWR0aC1taW4tY29udGVudFwiOiB7XG5cdFx0XHR3aWR0aDogXCJtaW4tY29udGVudFwiLFxuXHRcdH0sXG5cdFx0Ly8gbWFyZ2luc1xuXHRcdFwiLm0tMFwiOiB7XG5cdFx0XHRtYXJnaW46IDAsXG5cdFx0fSxcblx0XHRcIi5tdFwiOiB7XG5cdFx0XHRcIm1hcmdpbi10b3BcIjogcHgoc2l6ZS52cGFkKSxcblx0XHR9LFxuXHRcdFwiLm10LXhzXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweChzaXplLnZwYWRfeHMpLFxuXHRcdH0sXG5cdFx0XCIubXQteHhzXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweCgyKSxcblx0XHR9LFxuXHRcdFwiLm10LXNcIjoge1xuXHRcdFx0XCJtYXJnaW4tdG9wXCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5tdC1tXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0XCIubXQtbFwiOiB7XG5cdFx0XHRcIm1hcmdpbi10b3BcIjogcHgoc2l6ZS52cGFkX2xhcmdlKSxcblx0XHR9LFxuXHRcdFwiLm10LXhsXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweChzaXplLnZwYWRfeGwpLFxuXHRcdH0sXG5cdFx0XCIubXQtZm9ybVwiOiB7XG5cdFx0XHRcIm1hcmdpbi10b3BcIjogcHgoc2l6ZS5ocGFkX21lZGl1bSksXG5cdFx0fSxcblx0XHRcIi5tYi0wXCI6IHtcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiAwLFxuXHRcdH0sXG5cdFx0XCIubWJcIjoge1xuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IHB4KHNpemUudnBhZCksXG5cdFx0fSxcblx0XHRcIi5tYi1zXCI6IHtcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiBweChzaXplLnZwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIubWIteHNcIjoge1xuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IHB4KHNpemUudnBhZF94cyksXG5cdFx0fSxcblx0XHRcIi5tYi1sXCI6IHtcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiBweChzaXplLnZwYWRfbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIubWIteGxcIjoge1xuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IHB4KHNpemUudnBhZF94bCksXG5cdFx0fSxcblx0XHRcIi5tYi14eGxcIjoge1xuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IHB4KHNpemUudnBhZF94eGwpLFxuXHRcdH0sXG5cdFx0XCIubWxyXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkKSxcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHRcIi5tbHItYnV0dG9uXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkX2J1dHRvbiksXG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweChzaXplLmhwYWRfYnV0dG9uKSxcblx0XHR9LFxuXHRcdFwiLm1sci1sXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkX2xhcmdlKSxcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5tci1zXCI6IHtcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5tci14c1wiOiB7XG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweChzaXplLnZwYWRfeHMpLFxuXHRcdH0sXG5cdFx0XCIubWwtc1wiOiB7XG5cdFx0XHRcIm1hcmdpbi1sZWZ0XCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5tbC1tXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkX21lZGl1bSksXG5cdFx0fSxcblx0XHRcIi5tbC1sXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkX2xhcmdlKSxcblx0XHR9LFxuXHRcdFwiLm1yLW1cIjoge1xuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoc2l6ZS5ocGFkX21lZGl1bSksXG5cdFx0fSxcblx0XHRcIi5tci1sXCI6IHtcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5tbHItc1wiOiB7XG5cdFx0XHRcIm1hcmdpbi1sZWZ0XCI6IHB4KHNpemUuaHBhZF9zbWFsbCksXG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIubWxyLXhzXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS52cGFkX3hzKSxcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUudnBhZF94cyksXG5cdFx0fSxcblx0XHRcIi5tbC1ocGFkX3NtYWxsXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLm1yLWhwYWQtc21hbGxcIjoge1xuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoc2l6ZS5ocGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLm10Yi0wXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweCgwKSxcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiBweCgwKSxcblx0XHR9LFxuXHRcdFwiLm1yXCI6IHtcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHRcIi5tbFwiOiB7XG5cdFx0XHRcIm1hcmdpbi1sZWZ0XCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHQvLyBwYWRkaW5nc1xuXHRcdFwiLnAwXCI6IHtcblx0XHRcdHBhZGRpbmc6IFwiMFwiLFxuXHRcdH0sXG5cdFx0XCIucHRcIjoge1xuXHRcdFx0XCJwYWRkaW5nLXRvcFwiOiBweChzaXplLnZwYWQpLFxuXHRcdH0sXG5cdFx0XCIucHQtMFwiOiB7XG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IDAsXG5cdFx0fSxcblx0XHRcIi5wdC1zXCI6IHtcblx0XHRcdFwicGFkZGluZy10b3BcIjogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLnB0LWxcIjoge1xuXHRcdFx0XCJwYWRkaW5nLXRvcFwiOiBweChzaXplLnZwYWRfbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIucHQtbVwiOiB7XG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHRcIi5wdC1tbFwiOiB7XG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUudnBhZF9tbCksXG5cdFx0fSxcblx0XHRcIi5wdC14bFwiOiB7XG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUudnBhZF94bCksXG5cdFx0fSxcblx0XHRcIi5wdC14c1wiOiB7XG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUudnBhZF94cyksXG5cdFx0fSxcblx0XHRcIi5wYi0wXCI6IHtcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogMCxcblx0XHR9LFxuXHRcdFwiLnBiXCI6IHtcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogcHgoc2l6ZS52cGFkKSxcblx0XHR9LFxuXHRcdFwiLnBiLTJcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBcIjJweFwiLFxuXHRcdH0sXG5cdFx0Ly8gZm9yIGRyb3Bkb3duIHRvZ2dsZXNcblx0XHRcIi5wYi1zXCI6IHtcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLmRyYWdcIjoge1xuXHRcdFx0XCJ0b3VjaC1hY3Rpb25cIjogXCJhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi5wYi14c1wiOiB7XG5cdFx0XHRcInBhZGRpbmctYm90dG9tXCI6IHB4KHNpemUudnBhZF94cyksXG5cdFx0fSxcblx0XHRcIi5wYi1sXCI6IHtcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogcHgoc2l6ZS52cGFkX2xhcmdlKSxcblx0XHR9LFxuXHRcdFwiLnBiLXhsXCI6IHtcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogcHgoc2l6ZS52cGFkX3hsKSxcblx0XHR9LFxuXHRcdFwiLnBiLW1cIjoge1xuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0XCIucGItbWxcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBweChzaXplLnZwYWRfbWwpLFxuXHRcdH0sXG5cdFx0XCIucGItZmxvYXRpbmdcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBweChzaXplLmJ1dHRvbl9mbG9hdGluZ19zaXplICsgc2l6ZS5ocGFkX2xhcmdlKSxcblx0XHR9LFxuXHRcdC8vIGFsbG93IHNjcm9sbGluZyBhY3Jvc3MgdGhlIGZsb2F0aW5nIGJ1dHRvblxuXHRcdFwiLnBsclwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWQpLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHRcIi5wbFwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0XCIucGwtc1wiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIucGwtbVwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0XCIucGwteHNcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogcHgoc2l6ZS52cGFkX3hzKSxcblx0XHR9LFxuXHRcdFwiLnBsLXZwYWQtbVwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLnZwYWQpLFxuXHRcdH0sXG5cdFx0XCIucGwtdnBhZC1zXCI6IHtcblx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5wbC12cGFkLWxcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogcHgoc2l6ZS52cGFkX2xhcmdlKSxcblx0XHR9LFxuXHRcdFwiLnByXCI6IHtcblx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0XCIucHItc1wiOiB7XG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogcHgoc2l6ZS5ocGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLnByLXZwYWQtc1wiOiB7XG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLnByLW1cIjoge1xuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KHNpemUudnBhZCksXG5cdFx0fSxcblx0XHRcIi5wbHItc1wiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KHNpemUuaHBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5wbHItbVwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWQpLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHQvLyBwLWwgd2lsbCBiZSBvdmVyd3JpdHRlbiBpbiBtZWRpYSBxdWVyeSBtb2JpbGVcblx0XHRcIi5wbHItbFwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWRfbGFyZ2UpLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5wbHItMmxcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogcHgoc2l6ZS5ocGFkX2xhcmdlICogMiksXG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogcHgoc2l6ZS5ocGFkX2xhcmdlICogMiksXG5cdFx0fSxcblx0XHRcIi5wbC1sXCI6IHtcblx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5wci1sXCI6IHtcblx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLmhwYWRfbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIucGxyLWJ1dHRvblwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWRfYnV0dG9uKSxcblx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLmhwYWRfYnV0dG9uKSxcblx0XHR9LFxuXHRcdFwiLnBsci1idXR0b24tZG91YmxlXCI6IHtcblx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IHB4KHNpemUuaHBhZF9idXR0b24gKiAyKSxcblx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLmhwYWRfYnV0dG9uICogMiksXG5cdFx0fSxcblx0XHRcIi5wbHItbmF2LWJ1dHRvblwiOiB7XG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWRfbmF2X2J1dHRvbiksXG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogcHgoc2l6ZS5ocGFkX25hdl9idXR0b24pLFxuXHRcdH0sXG5cdFx0XCIucGwtYnV0dG9uXCI6IHtcblx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IHB4KHNpemUuaHBhZF9idXR0b24pLFxuXHRcdH0sXG5cdFx0XCIubXItYnV0dG9uXCI6IHtcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUuaHBhZF9idXR0b24pLFxuXHRcdH0sXG5cdFx0XCIubWwtYnV0dG9uXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoc2l6ZS5ocGFkX2J1dHRvbiksXG5cdFx0fSxcblx0XHRcIi5tdC1uZWdhdGl2ZS1ocGFkLWJ1dHRvblwiOiB7XG5cdFx0XHRcIm1hcmdpbi10b3BcIjogcHgoLXNpemUuaHBhZF9idXR0b24pLFxuXHRcdH0sXG5cdFx0XCIubXQtbmVnYXRpdmUtc1wiOiB7XG5cdFx0XHRcIm1hcmdpbi10b3BcIjogcHgoLXNpemUudnBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5tdC1uZWdhdGl2ZS1tXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweCgtc2l6ZS52cGFkKSxcblx0XHR9LFxuXHRcdFwiLm10LW5lZ2F0aXZlLWxcIjoge1xuXHRcdFx0XCJtYXJnaW4tdG9wXCI6IHB4KC1zaXplLmhwYWRfbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIubXItbmVnYXRpdmUtc1wiOiB7XG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweCgtc2l6ZS5ocGFkX2J1dHRvbiksXG5cdFx0fSxcblx0XHRcIi5tci1uZWdhdGl2ZS1sXCI6IHtcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KC1zaXplLmhwYWRfbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIubWwtbmVnYXRpdmUtc1wiOiB7XG5cdFx0XHRcIm1hcmdpbi1sZWZ0XCI6IHB4KC1zaXplLmhwYWRfYnV0dG9uKSxcblx0XHR9LFxuXHRcdC8vIG5lZ2F0aXZlIG1hcmdpbiB0byBoYW5kbGUgdGhlIGRlZmF1bHQgcGFkZGluZyBvZiBhIGJ1dHRvblxuXHRcdFwiLm1sLW5lZ2F0aXZlLWxcIjoge1xuXHRcdFx0XCJtYXJnaW4tbGVmdFwiOiBweCgtc2l6ZS5ocGFkX2xhcmdlKSxcblx0XHR9LFxuXHRcdFwiLm1sLW5lZ2F0aXZlLXhzXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoLTMpLFxuXHRcdH0sXG5cdFx0XCIubWwtbmVnYXRpdmUtYnViYmxlXCI6IHtcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoLTcpLFxuXHRcdH0sXG5cdFx0XCIubXItbmVnYXRpdmUtbVwiOiB7XG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweCgtKHNpemUuaHBhZF9idXR0b24gKyBzaXplLmhwYWRfbmF2X2J1dHRvbikpLFxuXHRcdH0sXG5cdFx0Ly8gbmVnYXRpdmUgbWFyZ2luIHRvIGhhbmRsZSB0aGUgcGFkZGluZyBvZiBhIG5hdiBidXR0b25cblx0XHRcIi5maXhlZC1ib3R0b20tcmlnaHRcIjoge1xuXHRcdFx0cG9zaXRpb246IFwiZml4ZWRcIixcblx0XHRcdGJvdHRvbTogcHgoc2l6ZS5ocGFkKSxcblx0XHRcdHJpZ2h0OiBweChzaXplLmhwYWRfbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIubXItbmVnYXRpdmUteHNcIjoge1xuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoLTMpLFxuXHRcdH0sXG5cdFx0Ly8gY29tbW9uIHNldHRpbmdcblx0XHRcIi50ZXh0LWVsbGlwc2lzXCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XCJ0ZXh0LW92ZXJmbG93XCI6IFwiZWxsaXBzaXNcIixcblx0XHRcdFwibWluLXdpZHRoXCI6IDAsXG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwibm93cmFwXCIsXG5cdFx0fSxcblx0XHRcIi50ZXh0LWVsbGlwc2lzLW11bHRpLWxpbmVcIjoge1xuXHRcdFx0Lypcblx0XHRcdCAqIFRoZSBgLXdlYmtpdC1saW5lLWNsYW1wYCBwcm9wZXJ0eSBpcyBzdGFuZGFyZGl6ZWQgYW5kIHN1cHBvcnRlZCBieSBhbGwgbWFqb3IgYnJvd3NlcnMuXG5cdFx0XHQgKiBJdCB3aWxsIGxpa2VseSBiZSByZXBsYWNlZCBieSBhIHByb3BlcnR5IGNhbGxlZCBgbGluZS1jbGFtcGAgaW4gdGhlIGZ1dHVyZS5cblx0XHRcdCAqIFNlZTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTLy13ZWJraXQtbGluZS1jbGFtcFxuXHRcdFx0ICovXG5cdFx0XHRkaXNwbGF5OiBcIi13ZWJraXQtYm94XCIsXG5cdFx0XHRcIi13ZWJraXQtbGluZS1jbGFtcFwiOiAzLFxuXHRcdFx0XCItd2Via2l0LWJveC1vcmllbnRcIjogXCJ2ZXJ0aWNhbFwiLFxuXHRcdFx0b3ZlcmZsb3c6IFwiIGhpZGRlblwiLFxuXHRcdFx0XCJ0ZXh0LW92ZXJmbG93XCI6IFwiZWxsaXBzaXNcIixcblx0XHR9LFxuXHRcdFwiLnRleHQtY2xpcFwiOiB7XG5cdFx0XHRvdmVyZmxvdzogXCJoaWRkZW5cIixcblx0XHRcdFwidGV4dC1vdmVyZmxvd1wiOiBcImNsaXBcIixcblx0XHRcdFwibWluLXdpZHRoXCI6IDAsXG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwibm93cmFwXCIsXG5cdFx0fSxcblx0XHRcIi5taW4td2lkdGgtMFwiOiB7XG5cdFx0XHRcIm1pbi13aWR0aFwiOiAwLFxuXHRcdH0sXG5cdFx0XCIubWluLXdpZHRoLWZ1bGxcIjoge1xuXHRcdFx0XCJtaW4td2lkdGhcIjogXCIxMDAlXCIsXG5cdFx0fSxcblx0XHQvLyB1c2VkIHRvIGVuYWJsZSB0ZXh0IGVsbGlwc2lzIGluIGZsZXggY2hpbGQgZWxlbWVudHMgc2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vZmxleGJveC10cnVuY2F0ZWQtdGV4dC9cblx0XHRcIi50ZXh0LWJyZWFrXCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XCJ3b3JkLWJyZWFrXCI6IFwibm9ybWFsXCIsXG5cdFx0XHRcIm92ZXJmbG93LXdyYXBcIjogXCJhbnl3aGVyZVwiLFxuXHRcdH0sXG5cdFx0XCIuYnJlYWstd29yZFwiOiB7XG5cdFx0XHRcIndvcmQtYnJlYWtcIjogXCJub3JtYWxcIixcblx0XHRcdFwib3ZlcmZsb3ctd3JhcFwiOiBcImJyZWFrLXdvcmRcIixcblx0XHRcdGh5cGhlbnM6IFwiYXV0b1wiLFxuXHRcdH0sXG5cdFx0XCIuYnJlYWstYWxsXCI6IHtcblx0XHRcdFwid29yZC1icmVha1wiOiBcImJyZWFrLWFsbFwiLFxuXHRcdH0sXG5cdFx0XCIuYnJlYWstd29yZC1saW5rcyBhXCI6IHtcblx0XHRcdFwib3ZlcmZsb3ctd3JhcFwiOiBcImFueXdoZXJlXCIsXG5cdFx0fSxcblx0XHRcIi50ZXh0LXByZXdyYXBcIjoge1xuXHRcdFx0XCJ3aGl0ZS1zcGFjZVwiOiBcInByZS13cmFwXCIsXG5cdFx0fSxcblx0XHRcIi50ZXh0LXByZWxpbmVcIjoge1xuXHRcdFx0XCJ3aGl0ZS1zcGFjZVwiOiBcInByZS1saW5lXCIsXG5cdFx0fSxcblx0XHRcIi50ZXh0LXByZVwiOiB7XG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwicHJlXCIsXG5cdFx0fSxcblx0XHRcIi51cHBlcmNhc2VcIjoge1xuXHRcdFx0XCJ0ZXh0LXRyYW5zZm9ybVwiOiBcInVwcGVyY2FzZVwiLFxuXHRcdH0sXG5cdFx0XCIubGluZS1icmVhay1hbnl3aGVyZVwiOiB7XG5cdFx0XHRcImxpbmUtYnJlYWtcIjogXCJhbnl3aGVyZVwiLFxuXHRcdH0sXG5cdFx0XCIuejFcIjoge1xuXHRcdFx0XCJ6LWluZGV4XCI6IFwiMVwiLFxuXHRcdH0sXG5cdFx0XCIuejJcIjoge1xuXHRcdFx0XCJ6LWluZGV4XCI6IFwiMlwiLFxuXHRcdH0sXG5cdFx0XCIuejNcIjoge1xuXHRcdFx0XCJ6LWluZGV4XCI6IFwiM1wiLFxuXHRcdH0sXG5cdFx0XCIuejRcIjoge1xuXHRcdFx0XCJ6LWluZGV4XCI6IFwiNFwiLFxuXHRcdH0sXG5cdFx0XCIubm9zZWxlY3RcIjogbm9zZWxlY3QsXG5cdFx0XCIubm8td3JhcFwiOiB7XG5cdFx0XHRcIndoaXRlLXNwYWNlXCI6IFwibm93cmFwXCIsXG5cdFx0fSxcblx0XHRcIi5oZWlnaHQtMTAwcFwiOiB7XG5cdFx0XHRoZWlnaHQ6IFwiMTAwJVwiLFxuXHRcdH0sXG5cdFx0XCIudmlldy1jb2x1bW5zXCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdH0sXG5cdFx0XCIudmlldy1jb2x1bW5cIjoge1xuXHRcdFx0XCJ3aWxsLWNoYW5nZVwiOiBcInRyYW5zZm9ybVwiLFxuXHRcdH0sXG5cdFx0XCIud2lsbC1jaGFuZ2UtYWxwaGFcIjoge1xuXHRcdFx0XCJ3aWxsLWNoYW5nZVwiOiBcImFscGhhXCIsXG5cdFx0fSxcblx0XHQvLyBib3JkZXJzXG5cdFx0XCIuYm9yZGVyLWJvdHRvbVwiOiB7XG5cdFx0XHRcImJvcmRlci1ib3R0b21cIjogYDFweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWAsXG5cdFx0fSxcblx0XHRcIi5ib3JkZXItbGVmdFwiOiB7XG5cdFx0XHRcImJvcmRlci1sZWZ0XCI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0Ly8gY29sb3JzXG5cdFx0XCIuYmctdHJhbnNwYXJlbnRcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwidHJhbnNwYXJlbnRcIixcblx0XHR9LFxuXHRcdFwiLmJnLXdoaXRlXCI6IHtcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiBcIndoaXRlXCIsXG5cdFx0fSxcblx0XHRcIi5iZy1maXgtcXVvdGVkIGJsb2NrcXVvdGUudHV0YW5vdGFfcXVvdGVcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwid2hpdGVcIixcblx0XHRcdGNvbG9yOiBcImJsYWNrXCIsXG5cdFx0XHQvLyBtYWtlIHRoZSBib3JkZXIgdGhpY2tlciBzbyBpdCBpcyBlYXNpZXIgdG8gc2VlXG5cdFx0XHRcImJvcmRlci13aWR0aFwiOiBcIjRweFwiLFxuXHRcdH0sXG5cdFx0XCIuY29udGVudC1ibGFja1wiOiB7XG5cdFx0XHRjb2xvcjogXCJibGFja1wiLFxuXHRcdH0sXG5cdFx0XCIuY29udGVudC1mZ1wiOiB7XG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9mZyxcblx0XHR9LFxuXHRcdFwiLmNvbnRlbnQtYWNjZW50LWZnXCI6IHtcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLmNvbnRlbnQtYWNjZW50LWFjY2VudFwiOiB7XG5cdFx0XHRcImFjY2VudC1jb2xvclwiOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLmljb24tYWNjZW50IHN2Z1wiOiB7XG5cdFx0XHRmaWxsOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLnN2Zy1jb250ZW50LWZnIHBhdGhcIjoge1xuXHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9mZyxcblx0XHR9LFxuXHRcdFwiLmNvbnRlbnQtYmdcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYmcsXG5cdFx0fSxcblx0XHRcIi5uYXYtYmdcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLm5hdmlnYXRpb25fYmcsXG5cdFx0fSxcblx0XHRcIi5jb250ZW50LWhvdmVyOmhvdmVyXCI6IHtcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLm5vLWhvdmVyXCI6IHtcblx0XHRcdFwicG9pbnRlci1ldmVudHNcIjogXCJub25lXCIsXG5cdFx0fSxcblx0XHRcIi5jb250ZW50LW1lc3NhZ2UtYmdcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfbWVzc2FnZV9iZyxcblx0XHR9LFxuXHRcdFwiLmVsZXZhdGVkLWJnXCI6IHtcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiBnZXRFbGV2YXRlZEJhY2tncm91bmQoKSxcblx0XHR9LFxuXHRcdFwiLmxpc3QtYmdcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmxpc3RfYmcsXG5cdFx0fSxcblx0XHRcIi5saXN0LWFjY2VudC1mZ1wiOiB7XG5cdFx0XHRjb2xvcjogdGhlbWUubGlzdF9hY2NlbnRfZmcsXG5cdFx0fSxcblx0XHRcIi5zdmctbGlzdC1hY2NlbnQtZmcgcGF0aFwiOiB7XG5cdFx0XHRmaWxsOiB0aGVtZS5saXN0X2FjY2VudF9mZyxcblx0XHR9LFxuXHRcdFwiLmJnLWFjY2VudC1mZ1wiOiB7XG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogdGhlbWUubGlzdF9hY2NlbnRfZmcsXG5cdFx0fSxcblx0XHRcIi5saXN0LWJvcmRlci1ib3R0b21cIjoge1xuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAxcHggc29saWQgJHt0aGVtZS5saXN0X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0XCIuYWNjZW50LWJnLXRyYW5zbHVjZW50XCI6IHtcblx0XHRcdGJhY2tncm91bmQ6IGAke3RoZW1lLmNvbnRlbnRfYWNjZW50fTJDYCxcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLmJ1dHRvbi1iZ1wiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHRcdGNvbG9yOiB0aGVtZS5uYXZpZ2F0aW9uX2JnLFxuXHRcdFx0b3BhY2l0eTogXCIwLjVcIixcblx0XHR9LFxuXHRcdFwiLmFjY2VudC1iZ1wiOiB7XG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9idXR0b25faWNvbl9zZWxlY3RlZCxcblx0XHR9LFxuXHRcdFwiLmFjY2VudC1iZy1jeWJlci1tb25kYXlcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYWNjZW50X2N5YmVyX21vbmRheSxcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2J1dHRvbl9pY29uX3NlbGVjdGVkLFxuXHRcdH0sXG5cdFx0XCIuYWNjZW50LWZnXCI6IHtcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2J1dHRvbl9pY29uLFxuXHRcdH0sXG5cdFx0XCIuYWNjZW50LWZnIHBhdGhcIjoge1xuXHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9idXR0b25faWNvbixcblx0XHR9LFxuXHRcdFwiLnJlZFwiOiB7XG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogXCIjODQwMDEwXCIsXG5cdFx0fSxcblx0XHRcIi5zd2lwZS1zcGFjZXJcIjoge1xuXHRcdFx0Y29sb3I6IFwiI2ZmZmZmZlwiLFxuXHRcdH0sXG5cdFx0XCIuc3dpcGUtc3BhY2VyIHBhdGhcIjoge1xuXHRcdFx0ZmlsbDogXCIjZmZmZmZmXCIsXG5cdFx0fSxcblx0XHRcIi5ibHVlXCI6IHtcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiBcIiMyMTk2RjNcIixcblx0XHR9LFxuXHRcdFwiLnVuZGVybGluZVwiOiB7XG5cdFx0XHRcInRleHQtZGVjb3JhdGlvblwiOiBcInVuZGVybGluZVwiLFxuXHRcdH0sXG5cdFx0XCIuaG92ZXItdWw6aG92ZXJcIjoge1xuXHRcdFx0XCJ0ZXh0LWRlY29yYXRpb25cIjogaXNBcHAoKSA/IFwibm9uZVwiIDogXCJ1bmRlcmxpbmVcIixcblx0XHR9LFxuXHRcdC8vIHBvc2l0aW9uaW5nMVxuXHRcdFwiLmZpbGwtYWJzb2x1dGVcIjoge1xuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdHRvcDogMCxcblx0XHRcdGJvdHRvbTogMCxcblx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRyaWdodDogMCxcblx0XHR9LFxuXHRcdFwiLmZpbGwtZmxleFwiOiB7XG5cdFx0XHRcImZsZXgtYmFzaXNcIjogXCIxMDAlXCIsXG5cdFx0XHRcImZsZXgtc2hyaW5rXCI6IDAsXG5cdFx0fSxcblx0XHRcIi5hYnNcIjoge1xuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHR9LFxuXHRcdFwiLmZpeGVkXCI6IHtcblx0XHRcdHBvc2l0aW9uOiBcImZpeGVkXCIsXG5cdFx0fSxcblx0XHRcIi5yZWxcIjoge1xuXHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmVcIixcblx0XHR9LFxuXHRcdFwiLm1heC13aWR0aC1zXCI6IHtcblx0XHRcdFwibWF4LXdpZHRoXCI6IHB4KDM2MCksXG5cdFx0fSxcblx0XHRcIi5tYXgtd2lkdGgtbVwiOiB7XG5cdFx0XHRcIm1heC13aWR0aFwiOiBweCg0NTApLFxuXHRcdH0sXG5cdFx0XCIubWF4LXdpZHRoLWxcIjoge1xuXHRcdFx0XCJtYXgtd2lkdGhcIjogcHgoODAwKSxcblx0XHR9LFxuXHRcdFwiLm1heC13aWR0aC0yMDBcIjoge1xuXHRcdFx0XCJtYXgtd2lkdGhcIjogcHgoMjAwKSxcblx0XHR9LFxuXHRcdFwiLnNjcm9sbFwiOiB7XG5cdFx0XHRcIm92ZXJmbG93LXlcIjogY2xpZW50Lm92ZXJmbG93QXV0byxcblx0XHRcdFwiLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmdcIjogXCJ0b3VjaFwiLFxuXHRcdH0sXG5cdFx0XCIuc2Nyb2xsLW5vLW92ZXJsYXlcIjoge1xuXHRcdFx0XCJvdmVyZmxvdy15XCI6IFwiYXV0b1wiLFxuXHRcdFx0XCItd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZ1wiOiBcInRvdWNoXCIsXG5cdFx0fSxcblx0XHRcIi5zY3JvbGwteFwiOiB7XG5cdFx0XHRcIm92ZXJmbG93LXhcIjogXCJhdXRvXCIsXG5cdFx0XHRcIi13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nXCI6IFwidG91Y2hcIixcblx0XHR9LFxuXHRcdFwiKlwiOiB7XG5cdFx0XHRcInNjcm9sbGJhci1jb2xvclwiOiBgJHt0aGVtZS5jb250ZW50X2J1dHRvbn0gdHJhbnNwYXJlbnRgLFxuXHRcdFx0XCJzY3JvbGxiYXItd2lkdGhcIjogXCJ0aGluXCIsXG5cdFx0fSxcblx0XHRcIjo6LXdlYmtpdC1zY3JvbGxiYXJcIjogIWNsaWVudC5pc01vYmlsZURldmljZSgpXG5cdFx0XHQ/IHtcblx0XHRcdFx0XHRiYWNrZ3JvdW5kOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0XHRcdFx0d2lkdGg6IHNjcm9sbGJhcldpZHRoSGVpZ2h0LCAvLyB3aWR0aCBvZiB2ZXJ0aWNhbCBzY3JvbGxiYXJcblx0XHRcdFx0XHRoZWlnaHQ6IHNjcm9sbGJhcldpZHRoSGVpZ2h0LCAvLyB3aWR0aCBvZiBob3Jpem9udGFsIHNjcm9sbGJhclxuXHRcdFx0ICB9XG5cdFx0XHQ6IHt9LFxuXHRcdFwiOjotd2Via2l0LXNjcm9sbGJhci10aHVtYlwiOiAhY2xpZW50LmlzTW9iaWxlRGV2aWNlKClcblx0XHRcdD8ge1xuXHRcdFx0XHRcdGJhY2tncm91bmQ6IHRoZW1lLmNvbnRlbnRfYnV0dG9uLFxuXHRcdFx0XHRcdC8vIHJlZHVjZSB0aGUgYmFja2dyb3VuZFxuXHRcdFx0XHRcdFwiYm9yZGVyLWxlZnRcIjogXCIxNXB4IHNvbGlkIHRyYW5zcGFyZW50XCIsXG5cdFx0XHRcdFx0XCJiYWNrZ3JvdW5kLWNsaXBcIjogXCJwYWRkaW5nLWJveFwiLFxuXHRcdFx0ICB9XG5cdFx0XHQ6IHt9LFxuXHRcdFwiKjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWI6aG92ZXJcIjoge1xuXHRcdFx0XCJib3JkZXItbGVmdFwiOiBcIjhweCBzb2xpZCB0cmFuc3BhcmVudFwiLFxuXHRcdH0sXG5cdFx0Ly8gc2Nyb2xsYmFyIHdpbGwgYmUgZGlzYWJsZWQgZm9yIG1vYmlsZSBkZXZpY2VzLCBldmVuIHdpdGggLnNjcm9sbCBhcHBsaWVkLFxuXHRcdC8vIGFwcGx5IHRoaXMgY2xhc3MgaWYgeW91IG5lZWQgaXQgdG8gc2hvd1xuXHRcdFwiLnZpc2libGUtc2Nyb2xsYmFyOjotd2Via2l0LXNjcm9sbGJhclwiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0XHR3aWR0aDogXCI2cHhcIixcblx0XHR9LFxuXHRcdFwiLnZpc2libGUtc2Nyb2xsYmFyOjotd2Via2l0LXNjcm9sbGJhci10aHVtYlwiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBcIjNweFwiLFxuXHRcdH0sXG5cdFx0Ly8gd2UgYXJlIHRyeWluZyB0byBoYW5kbGUgMyBjYXNlczpcblx0XHQvLyBnZWNrby9GRjogc3VwcG9ydHMgc2Nyb2xsYmFyLWd1dHRlciBidXQgbm90IGN1c3RvbSBzY3JvbGxiYXJzXG5cdFx0Ly8gYmxpbmsvQ2hyb21lOiBzdXBwb3J0cyBzY3JvbGxiYXItZ3V0dGVyIGFuZCBjdXN0b20gc2Nyb2xsYmFyc1xuXHRcdC8vIHdlYmtpdC9TYWZhcmk6IHN1cHBvcnRzIGN1c3RvbSBzY3JvbGxiYXJzIGJ1dCBub3Qgc2Nyb2xsYmFyLWd1dHRlclxuXHRcdC8vIHNvIGZvciBzY3JvbGxpbmcgY29udGFpbmVycyB3ZSBqdXN0IGZvcmNlIHRoZSBzY3JvbGxiYXJzIHdpdGggYG92ZXJmbG93OiBzY3JvbGxgIGFuZCBmb3Igbm9uLXNjcm9sbGluZyBvbmVzIHdlIGZhbGwgYmFjayB0byBwYWRkaW5nXG5cdFx0XCIuc2Nyb2xsYmFyLWd1dHRlci1zdGFibGUtb3ItZmFsbGJhY2tcIjoge1xuXHRcdFx0XCJzY3JvbGxiYXItZ3V0dGVyXCI6IFwic3RhYmxlXCIsXG5cdFx0fSxcblx0XHRcIkBzdXBwb3J0cyBub3QgKHNjcm9sbGJhci1ndXR0ZXI6IHN0YWJsZSlcIjoge1xuXHRcdFx0XCIuc2Nyb2xsYmFyLWd1dHRlci1zdGFibGUtb3ItZmFsbGJhY2tcIjoge1xuXHRcdFx0XHRcInBhZGRpbmctcmlnaHRcIjogc2Nyb2xsYmFyV2lkdGhIZWlnaHQsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0Ly9UT0RPOiBtaWdyYXRlIHRvIC50ZXh0LWNlbnRlclxuXHRcdFwiLmNlbnRlclwiOiB7XG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIixcblx0XHR9LFxuXHRcdFwiLmRyb3Bkb3duLWluZm9cIjoge1xuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBcIjVweFwiLFxuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogXCIxNnB4XCIsXG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogXCIxNnB4XCIsXG5cdFx0fSxcblx0XHRcIi5kcm9wZG93bi1pbmZvICsgLmRyb3Bkb3duLWJ1dHRvblwiOiB7XG5cdFx0XHRcImJvcmRlci10b3BcIjogYDFweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWAsXG5cdFx0fSxcblx0XHRcIi5kcm9wZG93bi1pbmZvICsgLmRyb3Bkb3duLWluZm9cIjoge1xuXHRcdFx0XCJwYWRkaW5nLXRvcFwiOiBcIjBcIixcblx0XHR9LFxuXHRcdFwiLnRleHQtY2VudGVyXCI6IHtcblx0XHRcdFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiLFxuXHRcdH0sXG5cdFx0XCIucmlnaHRcIjoge1xuXHRcdFx0XCJ0ZXh0LWFsaWduXCI6IFwicmlnaHRcIixcblx0XHR9LFxuXHRcdFwiLmxlZnRcIjoge1xuXHRcdFx0XCJ0ZXh0LWFsaWduXCI6IFwibGVmdFwiLFxuXHRcdH0sXG5cdFx0XCIuc3RhcnRcIjoge1xuXHRcdFx0XCJ0ZXh0LWFsaWduXCI6IFwic3RhcnRcIixcblx0XHR9LFxuXHRcdFwiLnN0YXR1c1RleHRDb2xvclwiOiB7XG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0fSxcblx0XHRcIi5idXR0b24taGVpZ2h0XCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHR9LFxuXHRcdFwiLmJ1dHRvbi1taW4taGVpZ2h0XCI6IHtcblx0XHRcdFwibWluLWhlaWdodFwiOiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdH0sXG5cdFx0XCIuYnV0dG9uLW1pbi13aWR0aFwiOiB7XG5cdFx0XHRcIm1pbi13aWR0aFwiOiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdH0sXG5cdFx0XCIuYnV0dG9uLXdpZHRoLWZpeGVkXCI6IHtcblx0XHRcdHdpZHRoOiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdH0sXG5cdFx0XCIubGFyZ2UtYnV0dG9uLWhlaWdodFwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuYnV0dG9uX2Zsb2F0aW5nX3NpemUpLFxuXHRcdH0sXG5cdFx0XCIubGFyZ2UtYnV0dG9uLXdpZHRoXCI6IHtcblx0XHRcdHdpZHRoOiBweChzaXplLmJ1dHRvbl9mbG9hdGluZ19zaXplKSxcblx0XHR9LFxuXHRcdFwiLm5vdGlmaWNhdGlvbi1taW4td2lkdGhcIjoge1xuXHRcdFx0XCJtaW4td2lkdGhcIjogcHgoNDAwKSxcblx0XHR9LFxuXHRcdC8vIFN0cmV0Y2ggZWRpdG9yIGEgbGl0dGxlIGJpdCBtb3JlIHRoYW4gcGFyZW50IHNvIHRoYXQgdGhlIGNvbnRlbnQgaXMgdmlzaWJsZVxuXHRcdFwiLmZ1bGwtaGVpZ2h0XCI6IHtcblx0XHRcdFwibWluLWhlaWdodFwiOiBjbGllbnQuaXNJb3MoKSA/IFwiMTAxJVwiIDogXCIxMDAlXCIsXG5cdFx0fSxcblx0XHRcIi5mdWxsLXdpZHRoXCI6IHtcblx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHR9LFxuXHRcdFwiLmhhbGYtd2lkdGhcIjoge1xuXHRcdFx0d2lkdGg6IFwiNTAlXCIsXG5cdFx0fSxcblx0XHRcIi5ibG9ja1wiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImJsb2NrXCIsXG5cdFx0fSxcblx0XHRcIi5pbmxpbmUtYmxvY2tcIjoge1xuXHRcdFx0ZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIixcblx0XHR9LFxuXHRcdFwiLm5vLXRleHQtZGVjb3JhdGlvblwiOiB7XG5cdFx0XHRcInRleHQtZGVjb3JhdGlvblwiOiBcIm5vbmVcIixcblx0XHR9LFxuXHRcdFwiLnN0cmlrZVwiOiB7XG5cdFx0XHRcInRleHQtZGVjb3JhdGlvblwiOiBcImxpbmUtdGhyb3VnaFwiLFxuXHRcdH0sXG5cdFx0XCIudGV4dC1hbGlnbi12ZXJ0aWNhbFwiOiB7XG5cdFx0XHRcInZlcnRpY2FsLWFsaWduXCI6IFwidGV4dC10b3BcIixcblx0XHR9LFxuXHRcdC8vIGZsZXggYm94XG5cdFx0XCIuZmxleC1zcGFjZS1hcm91bmRcIjoge1xuXHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRcImp1c3RpZnktY29udGVudFwiOiBcInNwYWNlLWFyb3VuZFwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC1zcGFjZS1iZXR3ZWVuXCI6IHtcblx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogXCJzcGFjZS1iZXR3ZWVuXCIsXG5cdFx0fSxcblx0XHRcIi5mbGV4LWZpeGVkXCI6IHtcblx0XHRcdGZsZXg6IFwiMCAwIGF1dG9cIixcblx0XHR9LFxuXHRcdFwiLmZsZXgtY2VudGVyXCI6IHtcblx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogXCJjZW50ZXJcIixcblx0XHR9LFxuXHRcdFwiLmZsZXgtZW5kXCI6IHtcblx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogXCJmbGV4LWVuZFwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC1zdGFydFwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdFwianVzdGlmeS1jb250ZW50XCI6IFwiZmxleC1zdGFydFwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC12LWNlbnRlclwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdFwiZmxleC1kaXJlY3Rpb25cIjogXCJjb2x1bW5cIixcblx0XHRcdFwianVzdGlmeS1jb250ZW50XCI6IFwiY2VudGVyXCIsXG5cdFx0fSxcblx0XHRcIi5mbGV4LWRpcmVjdGlvbi1jaGFuZ2VcIjoge1xuXHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRcImp1c3RpZnktY29udGVudFwiOiBcImNlbnRlclwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC1jb2x1bW5cIjoge1xuXHRcdFx0XCJmbGV4LWRpcmVjdGlvblwiOiBcImNvbHVtblwiLFxuXHRcdH0sXG5cdFx0Ly9UT0RPIG1pZ3JhdGUgdG8gLmNvbFxuXHRcdFwiLmNvbFwiOiB7XG5cdFx0XHRcImZsZXgtZGlyZWN0aW9uXCI6IFwiY29sdW1uXCIsXG5cdFx0fSxcblx0XHRcIi5yb3dcIjoge1xuXHRcdFx0XCJmbGV4LWRpcmVjdGlvblwiOiBcInJvd1wiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC1jb2x1bW4tcmV2ZXJzZVwiOiB7XG5cdFx0XHRcImZsZXgtZGlyZWN0aW9uXCI6IFwiY29sdW1uLXJldmVyc2VcIixcblx0XHR9LFxuXHRcdC8vVE9ETzogbWlncmF0ZSB0byBjb2wtcmV2ZXJzZVxuXHRcdFwiLmNvbC1yZXZlcnNlXCI6IHtcblx0XHRcdFwiZmxleC1kaXJlY3Rpb25cIjogXCJjb2x1bW4tcmV2ZXJzZVwiLFxuXHRcdH0sXG5cdFx0XCIuY29sdW1uLWdhcFwiOiB7XG5cdFx0XHRcImNvbHVtbi1nYXBcIjogcHgoc2l6ZS5ocGFkKSxcblx0XHR9LFxuXHRcdFwiLmNvbHVtbi1nYXAtc1wiOiB7XG5cdFx0XHRcImNvbHVtbi1nYXBcIjogcHgoc2l6ZS5ocGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLmdhcC12cGFkXCI6IHtcblx0XHRcdGdhcDogcHgoc2l6ZS52cGFkKSxcblx0XHR9LFxuXHRcdFwiLmdhcC12cGFkLXhzXCI6IHtcblx0XHRcdGdhcDogcHgoc2l6ZS52cGFkX3hzbSksXG5cdFx0fSxcblx0XHRcIi5nYXAtdnBhZC1zXCI6IHtcblx0XHRcdGdhcDogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLmdhcC12cGFkLXMtMTVcIjoge1xuXHRcdFx0Z2FwOiBweChzaXplLnZwYWRfc21hbGwgKiAxLjUpLFxuXHRcdH0sXG5cdFx0XCIuZ2FwLWhwYWRcIjoge1xuXHRcdFx0Z2FwOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0XCIuZ2FwLXZwYWQteHhsXCI6IHtcblx0XHRcdGdhcDogcHgoc2l6ZS52cGFkX3h4bCksXG5cdFx0fSxcblx0XHRcIi5mbGV4XCI6IHtcblx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC1ncm93XCI6IHtcblx0XHRcdGZsZXg6IFwiMVwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC1oaWRlXCI6IHtcblx0XHRcdGZsZXg6IFwiMFwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC10aGlyZFwiOiB7XG5cdFx0XHRmbGV4OiBcIjEgMCAwXCIsXG5cdFx0XHRcIm1pbi13aWR0aFwiOiBcIjEwMHB4XCIsXG5cdFx0fSxcblx0XHQvLyBzcGxpdHMgYSBmbGV4IGxheW91dCBpbnRvIHRocmVlIHNhbWUgd2lkdGggY29sdW1uc1xuXHRcdFwiLmZsZXgtdGhpcmQtbWlkZGxlXCI6IHtcblx0XHRcdGZsZXg6IFwiMiAxIDBcIixcblx0XHR9LFxuXHRcdC8vIHRha2UgdXAgbW9yZSBzcGFjZSBmb3IgdGhlIG1pZGRsZSBjb2x1bW5cblx0XHRcIi5mbGV4LWhhbGZcIjoge1xuXHRcdFx0ZmxleDogXCIwIDAgNTAlXCIsXG5cdFx0fSxcblx0XHQvLyBzcGxpdHMgYSBmbGV4IGxheW91dCBpbnRvIHR3byBzYW1lIHdpZHRoIGNvbHVtbnNcblx0XHRcIi5mbGV4LWdyb3ctc2hyaW5rLWhhbGZcIjoge1xuXHRcdFx0ZmxleDogXCIxIDEgNTAlXCIsXG5cdFx0fSxcblx0XHRcIi5mbGV4LW5vZ3Jvdy1zaHJpbmstaGFsZlwiOiB7XG5cdFx0XHRmbGV4OiBcIjAgMSA1MCVcIixcblx0XHR9LFxuXHRcdFwiLmZsZXgtZ3Jvdy1zaHJpbmstYXV0b1wiOiB7XG5cdFx0XHRmbGV4OiBcIjEgMSBhdXRvXCIsXG5cdFx0fSxcblx0XHQvLyBVc2VmdWwgZm9yIGtlZXBpbmcgcm93cyBvZiBudW1iZXJzIGFsaWduZWQgdmVydGljYWxseVxuXHRcdFwiLmZsZXgtZ3Jvdy1zaHJpbmstMFwiOiB7XG5cdFx0XHRmbGV4OiBcIjEgMSAwcHhcIixcblx0XHR9LFxuXHRcdC8vIGFsbG93IGVsZW1lbnQgdG8gZ3JvdyBhbmQgc2hyaW5rIHVzaW5nIHRoZSBlbGVtZW50cyB3aWR0aCBhcyBkZWZhdWx0IHNpemUuXG5cdFx0XCIuZmxleC1ncm93LXNocmluay0xNTBcIjoge1xuXHRcdFx0ZmxleDogXCIxIDEgMTUwcHhcIixcblx0XHR9LFxuXHRcdFwiLmZsZXgtbm8tc2hyaW5rXCI6IHtcblx0XHRcdGZsZXg6IFwiMSAwIDBcIixcblx0XHR9LFxuXHRcdFwiLmZsZXgtbm8tZ3Jvdy1uby1zaHJpbmstYXV0b1wiOiB7XG5cdFx0XHRmbGV4OiBcIjAgMCBhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi5mbGV4LW5vLWdyb3dcIjoge1xuXHRcdFx0ZmxleDogXCIwXCIsXG5cdFx0fSxcblx0XHRcIi5uby1zaHJpbmtcIjoge1xuXHRcdFx0XCJmbGV4LXNocmlua1wiOiBcIjBcIixcblx0XHR9LFxuXHRcdFwiLmZsZXgtbm8tZ3Jvdy1zaHJpbmstYXV0b1wiOiB7XG5cdFx0XHRmbGV4OiBcIjAgMSBhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi5mbGV4LXdyYXBcIjoge1xuXHRcdFx0XCJmbGV4LXdyYXBcIjogXCJ3cmFwXCIsXG5cdFx0fSxcblx0XHQvLyBUT0RPOiBtaWdyYXRlIHRvIC53cmFwXG5cdFx0XCIud3JhcFwiOiB7XG5cdFx0XHRcImZsZXgtd3JhcFwiOiBcIndyYXBcIixcblx0XHR9LFxuXHRcdC8vIGVsZW1lbnRzIG1heSBtb3ZlIGludG8gdGhlIG5leHQgbGluZVxuXHRcdFwiLml0ZW1zLWNlbnRlclwiOiB7XG5cdFx0XHRcImFsaWduLWl0ZW1zXCI6IFwiY2VudGVyXCIsXG5cdFx0fSxcblx0XHQvL1RPRE86IG1pZ3JhdGUgdG8gLmNlbnRlci12ZXJ0aWNhbGx5XG5cdFx0XCIuY2VudGVyLXZlcnRpY2FsbHlcIjoge1xuXHRcdFx0XCJhbGlnbi1pdGVtc1wiOiBcImNlbnRlclwiLFxuXHRcdH0sXG5cdFx0XCIuaXRlbXMtZW5kXCI6IHtcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJmbGV4LWVuZFwiLFxuXHRcdH0sXG5cdFx0XCIuaXRlbXMtc3RhcnRcIjoge1xuXHRcdFx0XCJhbGlnbi1pdGVtc1wiOiBcImZsZXgtc3RhcnRcIixcblx0XHR9LFxuXHRcdFwiLml0ZW1zLWJhc2VcIjoge1xuXHRcdFx0XCJhbGlnbi1pdGVtc1wiOiBcImJhc2VsaW5lXCIsXG5cdFx0fSxcblx0XHRcIi5pdGVtcy1zdHJldGNoXCI6IHtcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJzdHJldGNoXCIsXG5cdFx0fSxcblx0XHRcIi5hbGlnbi1zZWxmLXN0YXJ0XCI6IHtcblx0XHRcdFwiYWxpZ24tc2VsZlwiOiBcInN0YXJ0XCIsXG5cdFx0fSxcblx0XHRcIi5hbGlnbi1zZWxmLWNlbnRlclwiOiB7XG5cdFx0XHRcImFsaWduLXNlbGZcIjogXCJjZW50ZXJcIixcblx0XHR9LFxuXHRcdFwiLmFsaWduLXNlbGYtZW5kXCI6IHtcblx0XHRcdFwiYWxpZ24tc2VsZlwiOiBcImZsZXgtZW5kXCIsXG5cdFx0fSxcblx0XHRcIi5hbGlnbi1zZWxmLXN0cmV0Y2hcIjoge1xuXHRcdFx0XCJhbGlnbi1zZWxmXCI6IFwic3RyZXRjaFwiLFxuXHRcdH0sXG5cdFx0XCIuanVzdGlmeS1jZW50ZXJcIjoge1xuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogXCJjZW50ZXJcIixcblx0XHR9LFxuXHRcdC8vVE9ETzogbWlncmF0ZSB0byBqdXN0aWZ5LWhvcml6b250YWxseVxuXHRcdFwiLmNlbnRlci1ob3Jpem9udGFsbHlcIjoge1xuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogXCJjZW50ZXJcIixcblx0XHR9LFxuXHRcdFwiLmp1c3RpZnktYmV0d2VlblwiOiB7XG5cdFx0XHRcImp1c3RpZnktY29udGVudFwiOiBcInNwYWNlLWJldHdlZW5cIixcblx0XHR9LFxuXHRcdFwiLmp1c3RpZnktZW5kXCI6IHtcblx0XHRcdFwianVzdGlmeS1jb250ZW50XCI6IFwiZmxleC1lbmRcIixcblx0XHR9LFxuXHRcdFwiLmp1c3RpZnktc3RhcnRcIjoge1xuXHRcdFx0XCJqdXN0aWZ5LWNvbnRlbnRcIjogXCJmbGV4LXN0YXJ0XCIsXG5cdFx0fSxcblx0XHRcIi5qdXN0aWZ5LXJpZ2h0XCI6IHtcblx0XHRcdFwianVzdGlmeS1jb250ZW50XCI6IFwicmlnaHRcIixcblx0XHR9LFxuXHRcdFwiLmNoaWxkLWdyb3cgPiAqXCI6IHtcblx0XHRcdGZsZXg6IFwiMSAxIGF1dG9cIixcblx0XHR9LFxuXHRcdFwiLmxhc3QtY2hpbGQtZml4ZWQgPiAqOmxhc3QtY2hpbGRcIjoge1xuXHRcdFx0ZmxleDogXCIxIDAgMTAwcHhcIixcblx0XHR9LFxuXHRcdFwiLmxpbWl0LXdpZHRoXCI6IHtcblx0XHRcdFwibWF4LXdpZHRoXCI6IFwiMTAwJVwiLFxuXHRcdH0sXG5cdFx0XCIuZmxleC10cmFuc2l0aW9uXCI6IHtcblx0XHRcdHRyYW5zaXRpb246IFwiZmxleCAyMDBtcyBsaW5lYXJcIixcblx0XHR9LFxuXHRcdFwiLmJvcmRlci1yYWRpdXNcIjoge1xuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1cyksXG5cdFx0fSxcblx0XHRcIi5ib3JkZXItcmFkaXVzLXRvcFwiOiB7XG5cdFx0XHRcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHRcdFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHR9LFxuXHRcdFwiLmJvcmRlci1yYWRpdXMtdG9wLWxlZnQtYmlnXCI6IHtcblx0XHRcdFwiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiOiBweChzaXplLmJvcmRlcl9yYWRpdXNfbGFyZ2VyKSxcblx0XHR9LFxuXHRcdFwiLmJvcmRlci1yYWRpdXMtdG9wLXJpZ2h0LWJpZ1wiOiB7XG5cdFx0XHRcImJvcmRlci10b3AtcmlnaHQtcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1c19sYXJnZXIpLFxuXHRcdH0sXG5cdFx0XCIuYm9yZGVyLXJhZGl1cy1ib3R0b21cIjoge1xuXHRcdFx0XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1cyksXG5cdFx0XHRcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1cyksXG5cdFx0fSxcblx0XHRcIi5ib3JkZXItcmFkaXVzLXNtYWxsXCI6IHtcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBweChzaXplLmJvcmRlcl9yYWRpdXNfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIuYm9yZGVyLXJhZGl1cy1iaWdcIjoge1xuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1c19sYXJnZXIpLFxuXHRcdH0sXG5cdFx0XCIuYm9yZGVyLXJhZGl1cy1tXCI6IHtcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBweChzaXplLmJvcmRlcl9yYWRpdXNfbWVkaXVtKSxcblx0XHR9LFxuXHRcdFwiLmJvcmRlci1yYWRpdXMtdG9wLWxlZnQtbVwiOiB7XG5cdFx0XHRcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX21lZGl1bSksXG5cdFx0fSxcblx0XHRcIi5ib3JkZXItcmFkaXVzLXRvcC1yaWdodC1tXCI6IHtcblx0XHRcdFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX21lZGl1bSksXG5cdFx0fSxcblx0XHRcIi5zZXR0aW5ncy1pdGVtXCI6IHtcblx0XHRcdGJvcmRlcjogMCxcblx0XHRcdGN1cnNvcjogXCJwb2ludGVyXCIsXG5cdFx0XHRvdmVyZmxvdzogXCJoaWRkZW5cIixcblx0XHRcdFwid2hpdGUtc3BhY2VcIjogXCJub3dyYXBcIixcblx0XHRcdG1hcmdpbjogMCxcblx0XHRcdFwiZmxleC1zaHJpbmtcIjogMCxcblx0XHRcdFwiLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yXCI6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwKVwiLFxuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBweChzaXplLmljb25fc2l6ZV9zbWFsbCksXG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUuaWNvbl9zaXplX3NtYWxsKSxcblx0XHRcdFwiYm9yZGVyLWJvdHRvbVwiOiBgMXB4IHNvbGlkICR7dGhlbWUuYnV0dG9uX2J1YmJsZV9iZ30gIWltcG9ydGFudGAsXG5cdFx0fSxcblx0XHRcIi5zZXR0aW5ncy1pdGVtOmxhc3QtY2hpbGRcIjoge1xuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IFwibm9uZSAhaW1wb3J0YW50XCIsXG5cdFx0fSxcblx0XHRcIi5lZGl0b3ItYm9yZGVyXCI6IHtcblx0XHRcdGJvcmRlcjogYDJweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWAsXG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0XHRcInBhZGRpbmctYm90dG9tXCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWQpLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KHNpemUuaHBhZCksXG5cdFx0fSxcblx0XHRcIi5lZGl0b3ItYm9yZGVyLWFjdGl2ZVwiOiB7XG5cdFx0XHRib3JkZXI6IGAzcHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudH1gLFxuXHRcdFx0XCJwYWRkaW5nLXRvcFwiOiBweChzaXplLnZwYWRfc21hbGwgLSAxKSxcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogcHgoc2l6ZS52cGFkX3NtYWxsIC0gMSksXG5cdFx0XHRcInBhZGRpbmctbGVmdFwiOiBweChzaXplLmhwYWQgLSAxKSxcblx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLmhwYWQgLSAxKSxcblx0XHR9LFxuXHRcdFwiLmVkaXRvci1uby10b3AtYm9yZGVyXCI6IHtcblx0XHRcdFwiYm9yZGVyLXRvcC1jb2xvclwiOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0fSxcblx0XHQvLyBpY29uXG5cdFx0XCIuaWNvblwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuaWNvbl9zaXplX21lZGl1bSksXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5pY29uX3NpemVfbWVkaXVtKSxcblx0XHR9LFxuXHRcdFwiLmljb24gPiBzdmdcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmljb25fc2l6ZV9tZWRpdW0pLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuaWNvbl9zaXplX21lZGl1bSksXG5cdFx0fSxcblx0XHQvLyBhIGJpdCBjdXJzZWQgc29sdXRpb24gdG8gbWFrZSB0aGUgdmlzaWJsZSBpY29uIG5vdCB0b28gaHVnZSByZWxhdGl2ZSB0byB0aGUgdGlueSBcImNsb3NlXCIgaWNvbiB0aGF0IHdlIGhhdmUgYnV0IGFsc28gdG8ga2VlcCB0aGUgc2l6ZSBjb25zaXN0ZW50XG5cdFx0Ly8gd2l0aCBpY29uLWxhcmdlIHNvIHRoYXQgdGhlIHRleHQgZmllbGQgZG9lc24ndCBqdW1wIGFyb3VuZFxuXHRcdFwiLmljb24tcHJvZ3Jlc3Mtc2VhcmNoXCI6IHtcblx0XHRcdGhlaWdodDogYCR7cHgoMjApfSAhaW1wb3J0YW50YCxcblx0XHRcdHdpZHRoOiBgJHtweCgyMCl9ICFpbXBvcnRhbnRgLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi1wcm9ncmVzcy1zZWFyY2ggPiBzdmdcIjoge1xuXHRcdFx0aGVpZ2h0OiBgJHtweCgyMCl9ICFpbXBvcnRhbnRgLFxuXHRcdFx0d2lkdGg6IGAke3B4KDIwKX0gIWltcG9ydGFudGAsXG5cdFx0fSxcblx0XHRcIi5zZWFyY2gtYmFyXCI6IHtcblx0XHRcdHRyYW5zaXRpb246IFwiYWxsIDIwMG1zXCIsXG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogc3RhdGVCZ0xpa2UsXG5cdFx0fSxcblx0XHRcIi5zZWFyY2gtYmFyOmhvdmVyXCI6IHtcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiBzdGF0ZUJnSG92ZXIsXG5cdFx0fSxcblx0XHRcIi5zZWFyY2gtYmFyW2ZvY3VzZWQ9dHJ1ZV1cIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYmcsXG5cdFx0XHRcImJveC1zaGFkb3dcIjogc2VhcmNoQmFyU2hhZG93LFxuXHRcdH0sXG5cdFx0XCIuZmFiLXNoYWRvd1wiOiB7XG5cdFx0XHRcImJveC1zaGFkb3dcIjogXCIwcHggOHB4IDEycHggNnB4IHJnYmEoMCwgMCwgMCwgMC4xNSksIDBweCA0cHggNHB4IHJnYmEoMCwgMCwgMCwgMC4zKVwiLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi1wcm9ncmVzcy10aW55XCI6IHtcblx0XHRcdGhlaWdodDogcHgoMTUpLFxuXHRcdFx0d2lkdGg6IHB4KDE1KSxcblx0XHR9LFxuXHRcdFwiLmljb24tcHJvZ3Jlc3MtdGlueSA+IHN2Z1wiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KDE1KSxcblx0XHRcdHdpZHRoOiBweCgxNSksXG5cdFx0fSxcblx0XHRcIi5pY29uLXNtYWxsXCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5pY29uX3NpemVfc21hbGwpLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuaWNvbl9zaXplX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLmljb24tc21hbGwgPiBzdmdcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmljb25fc2l6ZV9zbWFsbCksXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5pY29uX3NpemVfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi1sYXJnZVwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuaWNvbl9zaXplX2xhcmdlKSxcblx0XHRcdHdpZHRoOiBweChzaXplLmljb25fc2l6ZV9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5pY29uLW1lZGl1bS1sYXJnZVwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuaWNvbl9zaXplX21lZGl1bV9sYXJnZSksXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5pY29uX3NpemVfbWVkaXVtX2xhcmdlKSxcblx0XHR9LFxuXHRcdFwiLmljb24tbWVkaXVtLWxhcmdlID4gc3ZnXCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5pY29uX3NpemVfbWVkaXVtX2xhcmdlKSxcblx0XHRcdHdpZHRoOiBweChzaXplLmljb25fc2l6ZV9tZWRpdW1fbGFyZ2UpLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi1sYXJnZSA+IHN2Z1wiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuaWNvbl9zaXplX2xhcmdlKSxcblx0XHRcdHdpZHRoOiBweChzaXplLmljb25fc2l6ZV9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5pY29uLXhsXCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5pY29uX3NpemVfeGwpLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuaWNvbl9zaXplX3hsKSxcblx0XHR9LFxuXHRcdFwiLmljb24teGwgPiBzdmdcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmljb25fc2l6ZV94bCksXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5pY29uX3NpemVfeGwpLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi14eGxcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmljb25fc2l6ZV94eGwpLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuaWNvbl9zaXplX3h4bCksXG5cdFx0fSxcblx0XHRcIi5pY29uLXh4bCA+IHN2Z1wiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuaWNvbl9zaXplX3h4bCksXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5pY29uX3NpemVfeHhsKSxcblx0XHR9LFxuXHRcdFwiLmljb24tbWVzc2FnZS1ib3hcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmljb25fbWVzc2FnZV9ib3gpLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuaWNvbl9tZXNzYWdlX2JveCksXG5cdFx0fSxcblx0XHRcIi5pY29uLW1lc3NhZ2UtYm94ID4gc3ZnXCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5pY29uX21lc3NhZ2VfYm94KSxcblx0XHRcdHdpZHRoOiBweChzaXplLmljb25fbWVzc2FnZV9ib3gpLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi1wcm9ncmVzcyA+IHN2Z1wiOiB7XG5cdFx0XHRcImFuaW1hdGlvbi1uYW1lXCI6IFwicm90YXRlLWljb25cIixcblx0XHRcdFwiYW5pbWF0aW9uLWR1cmF0aW9uXCI6IFwiMnNcIixcblx0XHRcdFwiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiOiBcImluZmluaXRlXCIsXG5cdFx0XHRcImFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb25cIjogXCJjYWxjdWxhdGVQb3NpdGlvblwiLFxuXHRcdFx0XCJ0cmFuc2Zvcm0tb3JpZ2luXCI6IFwiNTAlIDUwJVwiLFxuXHRcdFx0ZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIixcblx0XHR9LFxuXHRcdFwiLmljb24tYnV0dG9uXCI6IHtcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBcIjI1JVwiLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRcIm1heC13aWR0aFwiOiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdFx0XCJtYXgtaGVpZ2h0XCI6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0fSxcblx0XHRcIi5jZW50ZXItaFwiOiB7XG5cdFx0XHRtYXJnaW46IFwiMCBhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi50b2dnbGUtYnV0dG9uXCI6IHtcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBcIjI1JVwiLFxuXHRcdFx0d2lkdGg6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0XHRcIm1heC13aWR0aFwiOiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdFx0XCJtYXgtaGVpZ2h0XCI6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0fSxcblx0XHRcIi53aXphcmQtbmV4dC1idXR0b25cIjoge1xuXHRcdFx0XCJtYXJnaW4tdG9wXCI6IFwiYXV0b1wiLFxuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IHB4KHNpemUudnBhZCksXG5cdFx0fSxcblx0XHRcIi53aXphcmQtYnJlYWRjcnVtYlwiOiB7XG5cdFx0XHRib3JkZXI6IGAxcHggc29saWQgJHtnZXRDb250ZW50QnV0dG9uSWNvbkJhY2tncm91bmQoKX1gLFxuXHRcdFx0Y29sb3I6IFwiaW5oZXJpdFwiLFxuXHRcdFx0XCJ0cmFuc2l0aW9uLXByb3BlcnR5XCI6IFwiYm9yZGVyLXdpZHRoLCBib3JkZXItY29sb3IsIGNvbG9yLCBiYWNrZ3JvdW5kLWNvbG9yXCIsXG5cdFx0XHRcInRyYW5zaXRpb24tZHVyYXRpb25cIjogYCR7RGVmYXVsdEFuaW1hdGlvblRpbWUgLSA3MH1tc2AsXG5cdFx0XHRcInRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uXCI6IFwiZWFzZS1vdXRcIixcblx0XHRcdFwid2lsbC1jaGFuZ2VcIjogXCJib3JkZXItd2lkdGgsIGJvcmRlci1jb2xvciwgY29sb3JcIixcblx0XHR9LFxuXHRcdFwiLndpemFyZC1icmVhZGNydW1iLWFjdGl2ZVwiOiB7XG5cdFx0XHRib3JkZXI6IGAycHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudH1gLFxuXHRcdFx0Y29sb3I6IHRoZW1lLmNvbnRlbnRfYWNjZW50LFxuXHRcdFx0XCJ0cmFuc2l0aW9uLXByb3BlcnR5XCI6IFwiYm9yZGVyLXdpZHRoLCBib3JkZXItY29sb3IsIGNvbG9yLCBiYWNrZ3JvdW5kLWNvbG9yXCIsXG5cdFx0XHRcInRyYW5zaXRpb24tZHVyYXRpb25cIjogYCR7RGVmYXVsdEFuaW1hdGlvblRpbWUgLSA3MH1tc2AsXG5cdFx0XHRcInRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uXCI6IFwiZWFzZS1vdXRcIixcblx0XHRcdFwid2lsbC1jaGFuZ2VcIjogXCJib3JkZXItd2lkdGgsIGNvbG9yLCBiYWNrZ3JvdW5kLWNvbG9yXCIsXG5cdFx0fSxcblx0XHRcIi53aXphcmQtYnJlYWRjcnVtYi1wcmV2aW91c1wiOiB7XG5cdFx0XHRib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudH1gLFxuXHRcdFx0Y29sb3I6IFwiaW5oZXJpdFwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYWNjZW50LFxuXHRcdFx0XCJ0cmFuc2l0aW9uLXByb3BlcnR5XCI6IFwiYm9yZGVyLXdpZHRoLCBib3JkZXItY29sb3IsIGNvbG9yLCBiYWNrZ3JvdW5kLWNvbG9yXCIsXG5cdFx0XHRcInRyYW5zaXRpb24tZHVyYXRpb25cIjogYCR7RGVmYXVsdEFuaW1hdGlvblRpbWUgLSA3MH1tc2AsXG5cdFx0XHRcInRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uXCI6IFwiZWFzZS1vdXRcIixcblx0XHRcdFwid2lsbC1jaGFuZ2VcIjogXCJib3JkZXItd2lkdGgsIGJvcmRlci1jb2xvciwgY29sb3IsIGJhY2tncm91bmQtY29sb3JcIixcblx0XHR9LFxuXHRcdFwiLndpemFyZC1icmVhZGNydW1iLWxpbmVcIjoge1xuXHRcdFx0XCJib3JkZXItdG9wXCI6IGAzcHggZG90dGVkICR7dGhlbWUuY29udGVudF9ib3JkZXJ9YCxcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdHRyYW5zaXRpb246IGBib3JkZXItdG9wLWNvbG9yICR7RGVmYXVsdEFuaW1hdGlvblRpbWV9bXMgZWFzZS1vdXRgLFxuXHRcdFx0XCJ3aWxsLWNoYW5nZVwiOiBcImJvcmRlci10b3Atc3R5bGUsIGJvcmRlci10b3AtY29sb3JcIixcblx0XHR9LFxuXHRcdFwiLndpemFyZC1icmVhZGNydW1iLWxpbmUtYWN0aXZlXCI6IHtcblx0XHRcdFwiYm9yZGVyLXRvcFwiOiBgM3B4IHNvbGlkICR7dGhlbWUuY29udGVudF9hY2NlbnR9YCxcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdHRyYW5zaXRpb246IGBib3JkZXItdG9wLWNvbG9yICR7RGVmYXVsdEFuaW1hdGlvblRpbWV9bXMgZWFzZS1vdXRgLFxuXHRcdH0sXG5cdFx0XCIuY29tcGFjdFwiOiB7XG5cdFx0XHR3aWR0aDogYCR7c2l6ZS5idXR0b25faGVpZ2h0X2NvbXBhY3R9cHggIWltcG9ydGFudGAsXG5cdFx0XHRoZWlnaHQ6IGAke3NpemUuYnV0dG9uX2hlaWdodF9jb21wYWN0fXB4ICFpbXBvcnRhbnRgLFxuXHRcdH0sXG5cdFx0XCIubGFyZ2VcIjoge1xuXHRcdFx0d2lkdGg6IGAke3NpemUuYnV0dG9uX2Zsb2F0aW5nX3NpemV9cHhgLFxuXHRcdFx0aGVpZ2h0OiBgJHtzaXplLmJ1dHRvbl9mbG9hdGluZ19zaXplfXB4YCxcblx0XHRcdFwibWF4LXdpZHRoXCI6IGAke3NpemUuYnV0dG9uX2Zsb2F0aW5nX3NpemV9cHhgLFxuXHRcdFx0XCJtYXgtaGVpZ2h0XCI6IGAke3NpemUuYnV0dG9uX2Zsb2F0aW5nX3NpemV9cHhgLFxuXHRcdH0sXG5cdFx0Ly8gc3RhdGUtYmcgaXMgYSBzaW11bGF0aW9uIG9mIGEgXCJzdGF0ZSBsYXllclwiIGZyb20gTWF0ZXJpYWwgYnV0IHdpdGhvdXQgYW4gYWRkaXRpb25hbCBsYXllclxuXHRcdC8vIFdlIGRvbid0IGV4YWN0bHkgZm9sbG93IHRyYW5zcGFyZW5jeSBmb3IgaXQgYmVjYXVzZSB3ZSBjb21iaW5lIHRyYW5zcGFyZW5jeSB3aXRoIGxpZ2h0IGdyZXkgY29sb3Igd2hpY2ggd29ya3Mgd2VsbCBvbiBib3RoIGxpZ2h0IGFuZCBkYXJrIHRoZW1lc1xuXHRcdFwiLnN0YXRlLWJnXCI6IHtcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdHRyYW5zaXRpb246IFwiYmFja2dyb3VuZCAwLjZzXCIsXG5cdFx0XHQvLyB1bmRvaW5nIG91ciBkZWZhdWx0IGJ1dHRvbiBzdHlsaW5nXG5cdFx0XHRvcGFjaXR5OiBcIjEgIWltcG9ydGFudFwiLFxuXHRcdH0sXG5cdFx0Ly8gT25seSBlbmFibGUgaG92ZXIgZm9yIG1vdXNlIGFuZCBrZXlib2FyZCBuYXZpZ2F0aW9uIChub3QgdG91Y2gpIGJlY2F1c2Vcblx0XHQvLyA6aG92ZXIgd2lsbCBiZXQgc3R1Y2sgYWZ0ZXIgdGhlIHRvdWNoIG9uIG1vYmlsZS5cblx0XHQvLyBVc2UgOndoZXJlKCkgdG8gbm90IGNvdW50IHRvd2FyZHMgc3BlY2lmaWNpdHksIG90aGVyd2lzZSB0aGlzIGlzIG1vcmUgc3BlY2lmaWNcblx0XHQvLyB0aGFuIDphY3RpdmUgKHdoaWNoIGlzIHVuY29uZGl0aW9uYWxcblx0XHRcIjp3aGVyZSgubW91c2UtbmF2KSAuc3RhdGUtYmc6aG92ZXIsIDp3aGVyZSgua2V5Ym9hcmQtbmF2KSAuc3RhdGUtYmc6aG92ZXJcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogc3RhdGVCZ0hvdmVyLFxuXHRcdFx0XCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCI6IFwiLjNzXCIsXG5cdFx0fSxcblx0XHRcIjp3aGVyZSgua2V5Ym9hcmQtbmF2KSAuc3RhdGUtYmc6Zm9jdXNcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogc3RhdGVCZ0ZvY3VzLFxuXHRcdFx0XCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCI6IFwiLjNzXCIsXG5cdFx0XHQvLyBkaXNhYmxlIGRlZmF1bHQgZm9jdXMgaW5kaWNhdG9yIGJlY2F1c2Ugd2UgaGF2ZSBvdXIgb3duIGZvciB0aGlzIGVsZW1lbnRcblx0XHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdH0sXG5cdFx0XCIuc3RhdGUtYmc6YWN0aXZlLCAuc3RhdGUtYmdbcHJlc3NlZD10cnVlXVwiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiBzdGF0ZUJnQWN0aXZlLFxuXHRcdFx0XCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCI6IFwiLjNzXCIsXG5cdFx0fSxcblx0XHRcIi5mbGFzaFwiOiB7XG5cdFx0XHR0cmFuc2l0aW9uOiBgb3BhY2l0eSAke0RlZmF1bHRBbmltYXRpb25UaW1lfW1zYCxcblx0XHR9LFxuXHRcdFwiLmZsYXNoOmFjdGl2ZVwiOiB7XG5cdFx0XHRvcGFjaXR5OiBcIjAuNFwiLFxuXHRcdH0sXG5cdFx0XCIuZGlzYWJsZWRcIjoge1xuXHRcdFx0b3BhY2l0eTogXCIwLjdcIixcblx0XHR9LFxuXHRcdFwiLnRyYW5zbHVjZW50XCI6IHtcblx0XHRcdG9wYWNpdHk6IFwiMC40XCIsXG5cdFx0fSxcblx0XHRcIi5vcGFxdWVcIjoge1xuXHRcdFx0b3BhY2l0eTogXCIxXCIsXG5cdFx0fSxcblx0XHRcIkBrZXlmcmFtZXMgcm90YXRlLWljb25cIjoge1xuXHRcdFx0XCIwJVwiOiB7XG5cdFx0XHRcdHRyYW5zZm9ybTogXCJyb3RhdGUoMGRlZylcIixcblx0XHRcdH0sXG5cdFx0XHRcIjEwMCVcIjoge1xuXHRcdFx0XHR0cmFuc2Zvcm06IFwicm90YXRlKDM2MGRlZylcIixcblx0XHRcdH0sXG5cdFx0fSxcblx0XHQvLyBjdXN0b20gc3R5bGluZyBmb3Igdmlld3Ncblx0XHQvLyB0aGUgbWFpbiB2aWV3XG5cdFx0XCIubWFpbi12aWV3XCI6IHtcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHR0b3A6IDAsXG5cdFx0XHRyaWdodDogcHgoMCksXG5cdFx0XHRib3R0b206IHB4KDApLFxuXHRcdFx0bGVmdDogcHgoMCksXG5cdFx0XHRcIm92ZXJmbG93LXhcIjogXCJoaWRkZW5cIixcblx0XHR9LFxuXHRcdFwiLm1sci1zYWZlLWluc2V0XCI6IHtcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IFwiZW52KHNhZmUtYXJlYS1pbnNldC1yaWdodClcIixcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LWxlZnQpXCIsXG5cdFx0fSxcblx0XHRcIi5wbHItc2FmZS1pbnNldFwiOiB7XG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LXJpZ2h0KVwiLFxuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LWxlZnQpXCIsXG5cdFx0fSxcblx0XHRcIi5tdC1zYWZlLWluc2V0XCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBcImVudihzYWZlLWFyZWEtaW5zZXQtdG9wKVwiLFxuXHRcdH0sXG5cdFx0Ly8gaGVhZGVyXG5cdFx0XCIuaGVhZGVyLW5hdlwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUubmF2YmFyX2hlaWdodCksXG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogdGhlbWUubmF2aWdhdGlvbl9iZyxcblx0XHRcdFwiei1pbmRleFwiOiAyLFxuXHRcdH0sXG5cdFx0XCIuYm90dG9tLW5hdlwiOiB7XG5cdFx0XHRcImJvcmRlci10b3BcIjogYDFweCBzb2xpZCAke3RoZW1lLm5hdmlnYXRpb25fYm9yZGVyfWAsXG5cdFx0XHRoZWlnaHQ6IHBvc2l0aW9uVmFsdWUoc2l6ZS5ib3R0b21fbmF2X2JhciksXG5cdFx0XHRiYWNrZ3JvdW5kOiB0aGVtZS5oZWFkZXJfYmcsXG5cdFx0XHRcIm1hcmdpbi1ib3R0b21cIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LWJvdHRvbSlcIixcblx0XHRcdFwiei1pbmRleFwiOiAyLFxuXHRcdH0sXG5cdFx0XCIubm90aWZpY2F0aW9uLW92ZXJsYXktY29udGVudFwiOiB7XG5cdFx0XHRcIm1hcmdpbi1sZWZ0XCI6IHB4KHNpemUudnBhZCksXG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweChzaXplLnZwYWQpLFxuXHRcdFx0XCJwYWRkaW5nLXRvcFwiOiBweChzaXplLnZwYWQpLFxuXHRcdH0sXG5cdFx0XCIubG9nby1jaXJjbGVcIjoge1xuXHRcdFx0d2lkdGg6IHB4KHNpemUuYnV0dG9uX2ljb25fYmdfc2l6ZSksXG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuYnV0dG9uX2ljb25fYmdfc2l6ZSksXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogXCI1MCVcIixcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdH0sXG5cdFx0XCIuZG90XCI6IHtcblx0XHRcdHdpZHRoOiBweChzaXplLmRvdF9zaXplKSxcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5kb3Rfc2l6ZSksXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogXCI1MCVcIixcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XCJtYXJnaW4tdG9wXCI6IHB4KDYpLFxuXHRcdH0sXG5cdFx0XCIubmV3cy1idXR0b25cIjoge1xuXHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmVcIixcblx0XHR9LFxuXHRcdFwiLmxvZ28tdGV4dFwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuaGVhZGVyX2xvZ29faGVpZ2h0KSxcblx0XHRcdHdpZHRoOiBweCgxMjgpLFxuXHRcdH0sXG5cdFx0XCIubG9nby1oZWlnaHRcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmhlYWRlcl9sb2dvX2hlaWdodCksXG5cdFx0fSxcblx0XHRcIi5sb2dvLWhlaWdodCA+IHN2ZywgLmxvZ28taGVpZ2h0ID4gaW1nXCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5oZWFkZXJfbG9nb19oZWlnaHQpLFxuXHRcdH0sXG5cdFx0XCIuY3VzdG9tLWxvZ29cIjoge1xuXHRcdFx0d2lkdGg6IHB4KDIwMCksXG5cdFx0XHRcImJhY2tncm91bmQtcmVwZWF0XCI6IFwibm8tcmVwZWF0XCIsXG5cdFx0XHRcImJhY2tncm91bmQtc2l6ZVwiOiBcImF1dG8gMTAwJVwiLFxuXHRcdH0sXG5cdFx0XCIubmF2LWJhci1zcGFjZXJcIjoge1xuXHRcdFx0d2lkdGg6IFwiMHB4XCIsXG5cdFx0XHRoZWlnaHQ6IFwiMjJweFwiLFxuXHRcdFx0XCJtYXJnaW4tbGVmdFwiOiBcIjJweFwiLFxuXHRcdFx0XCJib3JkZXItY29sb3JcIjogdGhlbWUubmF2aWdhdGlvbl9ib3JkZXIsXG5cdFx0XHRcImJvcmRlci13aWR0aFwiOiBcIjFweFwiLFxuXHRcdFx0XCJib3JkZXItc3R5bGVcIjogXCJzb2xpZFwiLFxuXHRcdH0sXG5cdFx0Ly8gZGlhbG9nc1xuXHRcdFwiLmRpYWxvZ1wiOiB7XG5cdFx0XHRcIm1pbi13aWR0aFwiOiBweCgyMDApLFxuXHRcdH0sXG5cdFx0XCIuZGlhbG9nLXdpZHRoLWxcIjoge1xuXHRcdFx0XCJtYXgtd2lkdGhcIjogcHgoODAwKSxcblx0XHR9LFxuXHRcdFwiLmRpYWxvZy13aWR0aC1tXCI6IHtcblx0XHRcdFwibWF4LXdpZHRoXCI6IHB4KDUwMCksXG5cdFx0fSxcblx0XHRcIi5kaWFsb2ctd2lkdGgtc1wiOiB7XG5cdFx0XHRcIm1heC13aWR0aFwiOiBweCg0MDApLFxuXHRcdH0sXG5cdFx0XCIuZGlhbG9nLXdpZHRoLWFsZXJ0XCI6IHtcblx0XHRcdFwibWF4LXdpZHRoXCI6IHB4KDM1MCksXG5cdFx0fSxcblx0XHRcIi5kaWFsb2ctaGVhZGVyXCI6IHtcblx0XHRcdFwiYm9yZGVyLWJvdHRvbVwiOiBgMXB4IHNvbGlkICR7dGhlbWUuY29udGVudF9ib3JkZXJ9YCxcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5idXR0b25faGVpZ2h0ICsgMSksXG5cdFx0fSxcblx0XHRcIi5kaWFsb2ctaGVhZGVyLWxpbmUtaGVpZ2h0XCI6IHtcblx0XHRcdFwibGluZS1oZWlnaHRcIjogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHR9LFxuXHRcdFwiLmRpYWxvZy1wcm9ncmVzc1wiOiB7XG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIixcblx0XHRcdHBhZGRpbmc6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0XHR3aWR0aDogYGNhbGMoMTAwJSAtICR7MiAqIHNpemUuaHBhZH1weClgLFxuXHRcdH0sXG5cdFx0XCIuZmFxLWl0ZW1zIGltZ1wiOiB7XG5cdFx0XHRcIm1heC13aWR0aFwiOiBcIjEwMCVcIixcblx0XHRcdGhlaWdodDogXCJhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi5kaWFsb2ctY29udGFpbmVyXCI6IHBvc2l0aW9uX2Fic29sdXRlKHNpemUuYnV0dG9uX2hlaWdodCArIDEsIDAsIDAsIDApLFxuXHRcdFwiLmRpYWxvZy1jb250ZW50QnV0dG9uc0JvdHRvbVwiOiB7XG5cdFx0XHRwYWRkaW5nOiBgMCAke3B4KHNpemUuaHBhZF9sYXJnZSl9ICR7cHgoc2l6ZS52cGFkKX0gJHtweChzaXplLmhwYWRfbGFyZ2UpfWAsXG5cdFx0fSxcblx0XHRcIi5kaWFsb2ctaW1nXCI6IHtcblx0XHRcdHdpZHRoOiBweCgxNTApLFxuXHRcdFx0aGVpZ2h0OiBcImF1dG9cIixcblx0XHR9LFxuXHRcdFwiLmRpYWxvZy1idXR0b25zXCI6IHtcblx0XHRcdFwiYm9yZGVyLXRvcFwiOiBgMXB4IHNvbGlkICR7dGhlbWUuY29udGVudF9ib3JkZXJ9YCxcblx0XHR9LFxuXHRcdFwiLmRpYWxvZy1idXR0b25zID4gYnV0dG9uXCI6IHtcblx0XHRcdGZsZXg6IFwiMVwiLFxuXHRcdH0sXG5cdFx0XCIuZGlhbG9nLWJ1dHRvbnMgPiBidXR0b246bm90KDpmaXJzdC1jaGlsZClcIjoge1xuXHRcdFx0XCJib3JkZXItbGVmdFwiOiBgMXB4IHNvbGlkICR7dGhlbWUuY29udGVudF9ib3JkZXJ9YCxcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogXCIwXCIsXG5cdFx0fSxcblx0XHRcIi5kaWFsb2ctaGVpZ2h0LXNtYWxsXCI6IHtcblx0XHRcdFwibWluLWhlaWdodFwiOiBcIjY1dmhcIixcblx0XHR9LFxuXHRcdFwiLmRpYWxvZy1tYXgtaGVpZ2h0XCI6IHtcblx0XHRcdFwibWF4LWhlaWdodFwiOiBcImNhbGMoMTAwdmggLSAxMDBweClcIixcblx0XHR9LFxuXHRcdC8vIG1haWwgZm9sZGVyIHZpZXcgY29sdW1uXG5cdFx0XCIgLmZvbGRlci1jb2x1bW5cIjoge1xuXHRcdFx0aGVpZ2h0OiBcIjEwMCVcIixcblx0XHRcdFwicGFkZGluZy10b3BcIjogXCJlbnYoc2FmZS1hcmVhLWluc2V0LXRvcClcIixcblx0XHR9LFxuXHRcdFwiLmxpc3QtYm9yZGVyLXJpZ2h0XCI6IHtcblx0XHRcdFwiYm9yZGVyLXJpZ2h0XCI6IGAxcHggc29saWQgJHt0aGVtZS5saXN0X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0XCIuZm9sZGVyc1wiOiB7XG5cdFx0XHRcIm1hcmdpbi1ib3R0b21cIjogcHgoMTIpLFxuXHRcdH0sXG5cdFx0XCIuZm9sZGVyLXJvd1wiOiB7XG5cdFx0XHRcImFsaWduLWl0ZW1zXCI6IFwiY2VudGVyXCIsXG5cdFx0XHRwb3NpdGlvbjogXCJyZWxhdGl2ZVwiLFxuXHRcdH0sXG5cdFx0XCIudGVtcGxhdGUtbGlzdC1yb3dcIjoge1xuXHRcdFx0XCJib3JkZXItbGVmdFwiOiBweChzaXplLmJvcmRlcl9zZWxlY3Rpb24pICsgXCIgc29saWQgdHJhbnNwYXJlbnRcIixcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJjZW50ZXJcIixcblx0XHRcdHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG5cdFx0fSxcblx0XHRcIi5jb3VudGVyLWJhZGdlXCI6IHtcblx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IHB4KDQpLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KDQpLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KDgpLFxuXHRcdFx0XCJsaW5lLWhlaWdodFwiOiBweCgxNiksXG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBweChzaXplLmZvbnRfc2l6ZV9zbWFsbCksXG5cdFx0XHRcImZvbnQtd2VpZ2h0XCI6IFwiYm9sZFwiLFxuXHRcdFx0XCJtaW4td2lkdGhcIjogcHgoMTYpLFxuXHRcdFx0XCJtaW4taGVpZ2h0XCI6IHB4KDE2KSxcblx0XHRcdFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiLFxuXHRcdH0sXG5cdFx0XCIucm93LXNlbGVjdGVkXCI6IHtcblx0XHRcdFwiYm9yZGVyLWNvbG9yXCI6IGAke3RoZW1lLmxpc3RfYWNjZW50X2ZnfSAhaW1wb3J0YW50YCxcblx0XHRcdGNvbG9yOiBgJHt0aGVtZS5saXN0X2FjY2VudF9mZ31gLFxuXHRcdH0sXG5cdFx0XCIuaG92ZXJhYmxlLWxpc3QtaXRlbTpob3ZlclwiOiB7XG5cdFx0XHRcImJvcmRlci1jb2xvclwiOiBgJHt0aGVtZS5saXN0X2FjY2VudF9mZ30gIWltcG9ydGFudGAsXG5cdFx0XHRjb2xvcjogYCR7dGhlbWUubGlzdF9hY2NlbnRfZmd9YCxcblx0XHR9LFxuXHRcdFwiLmV4cGFuZGVyXCI6IHtcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHRcdFwibWluLXdpZHRoXCI6IHB4KHNpemUuYnV0dG9uX2hlaWdodCksXG5cdFx0fSxcblx0XHQvLyBtYWlsIHZpZXcgZWRpdG9yXG5cdFx0XCIubWFpbC12aWV3ZXItZmlyc3RMaW5lXCI6IHtcblx0XHRcdFwicGFkaW5nLXRvcFwiOiBweCgxMCksXG5cdFx0fSxcblx0XHRcIi5oaWRlLW91dGxpbmVcIjoge1xuXHRcdFx0b3V0bGluZTogXCJub25lXCIsXG5cdFx0fSxcblx0XHRcIi5ub2ZvY3VzOmZvY3VzXCI6IHtcblx0XHRcdG91dGxpbmU6IFwibm9uZVwiLFxuXHRcdH0sXG5cdFx0XCIuaW5wdXRcIjoge1xuXHRcdFx0b3V0bGluZTogXCJub25lXCIsXG5cdFx0fSxcblx0XHRcImJsb2NrcXVvdGUudHV0YW5vdGFfcXVvdGUsIGJsb2NrcXVvdGVbdHlwZT1jaXRlXVwiOiB7XG5cdFx0XHRcImJvcmRlci1sZWZ0XCI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudH1gLFxuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogcHgoc2l6ZS5ocGFkKSxcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogcHgoMCksXG5cdFx0XHRcIm1hcmdpbi1yaWdodFwiOiBweCgwKSxcblx0XHR9LFxuXHRcdFwiLnR1dGFub3RhLXBsYWNlaG9sZGVyXCI6IHtcblx0XHRcdFwibWF4LXdpZHRoXCI6IFwiMTAwcHggIWltcG9ydGFudFwiLFxuXHRcdFx0XCJtYXgtaGVpZ2h0XCI6IFwiMTAwcHggIWltcG9ydGFudFwiLFxuXHRcdH0sXG5cdFx0XCIuTXNvTm9ybWFsXCI6IHtcblx0XHRcdG1hcmdpbjogMCxcblx0XHR9LFxuXHRcdC8vIGxpc3Rcblx0XHRcIi5saXN0XCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XCJsaXN0LXN0eWxlXCI6IFwibm9uZVwiLFxuXHRcdFx0bWFyZ2luOiAwLFxuXHRcdFx0cGFkZGluZzogMCxcblx0XHR9LFxuXHRcdFwiLmxpc3Qtcm93XCI6IHtcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRsZWZ0OiAwLFxuXHRcdFx0cmlnaHQ6IDAsXG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUubGlzdF9yb3dfaGVpZ2h0KSxcblx0XHR9LFxuXHRcdFwiLm9kZC1yb3dcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmxpc3RfYmcsXG5cdFx0fSxcblx0XHRcIi5saXN0LWxvYWRpbmdcIjoge1xuXHRcdFx0Ym90dG9tOiAwLFxuXHRcdH0sXG5cdFx0Ly8gbWFpbCBsaXN0XG5cdFx0XCIudGVhbUxhYmVsXCI6IHtcblx0XHRcdGNvbG9yOiB0aGVtZS5saXN0X2FsdGVybmF0ZV9iZyxcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiB0aGVtZS5saXN0X2FjY2VudF9mZyxcblx0XHR9LFxuXHRcdFwiLmlvblwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImlubGluZS1ibG9ja1wiLFxuXHRcdFx0XCJmb250LWZhbWlseVwiOiBcIidJb25pY29ucydcIixcblx0XHRcdHNwZWFrOiBcIm5vbmVcIixcblx0XHRcdFwiZm9udC1zdHlsZVwiOiBcIm5vcm1hbFwiLFxuXHRcdFx0XCJmb250LXdlaWdodFwiOiBcIm5vcm1hbFwiLFxuXHRcdFx0XCJmb250LXZhcmlhbnRcIjogXCJub3JtYWxcIixcblx0XHRcdFwidGV4dC10cmFuc2Zvcm1cIjogXCJub25lXCIsXG5cdFx0XHRcInRleHQtcmVuZGVyaW5nXCI6IFwiYXV0b1wiLFxuXHRcdFx0XCJsaW5lLWhlaWdodFwiOiBcIjFcIixcblx0XHRcdFwiLXdlYmtpdC1mb250LXNtb290aGluZ1wiOiBcImFudGlhbGlhc2VkXCIsXG5cdFx0XHRcIi1tb3otb3N4LWZvbnQtc21vb3RoaW5nXCI6IFwiZ3JheXNjYWxlXCIsXG5cdFx0fSxcblx0XHRcIi5iYWRnZS1saW5lLWhlaWdodFwiOiB7XG5cdFx0XHRcImxpbmUtaGVpZ2h0XCI6IHB4KDE4KSxcblx0XHR9LFxuXHRcdFwiLmxpc3QtZm9udC1pY29uc1wiOiB7XG5cdFx0XHRcImxldHRlci1zcGFjaW5nXCI6IFwiMXB4XCIsXG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJyaWdodFwiLFxuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogXCItM3B4XCIsXG5cdFx0fSxcblx0XHRcIi5tb25vc3BhY2VcIjoge1xuXHRcdFx0XCJmb250LWZhbWlseVwiOiAnXCJMdWNpZGEgQ29uc29sZVwiLCBNb25hY28sIG1vbm9zcGFjZScsXG5cdFx0fSxcblx0XHRcIi5oaWRkZW5cIjoge1xuXHRcdFx0dmlzaWJpbGl0eTogXCJoaWRkZW5cIixcblx0XHR9LFxuXHRcdC8vIGFjdGlvbiBiYXJcblx0XHRcIi5hY3Rpb24tYmFyXCI6IHtcblx0XHRcdHdpZHRoOiBcImluaXRpYWxcIixcblx0XHRcdFwibWFyZ2luLWxlZnRcIjogXCJhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi5tbC1iZXR3ZWVuLXMgPiA6bm90KDpmaXJzdC1jaGlsZClcIjoge1xuXHRcdFx0XCJtYXJnaW4tbGVmdFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIubXQtYmV0d2Vlbi1zID4gOm5vdCg6Zmlyc3QtY2hpbGQpXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweChzaXplLmhwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIubXQtYmV0d2Vlbi1tID4gOm5vdCg6Zmlyc3QtY2hpbGQpXCI6IHtcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweChzaXplLmhwYWQpLFxuXHRcdH0sXG5cdFx0Ly8gZHJvcGRvd25cblx0XHRcIi5kcm9wZG93bi1wYW5lbFwiOiB7XG5cdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHRvdmVyZmxvdzogXCJoaWRkZW5cIiwgLy8gd2hpbGUgdGhlIGRyb3Bkb3duIGlzIHNsaWRlZCBvcGVuIHdlIGRvIG5vdCB3YW50IHRvIHNob3cgdGhlIHNjcm9sbGJhcnMuIG92ZXJmbG93LXkgaXMgbGF0ZXIgb3ZlcndyaXR0ZW4gdG8gc2hvdyBzY3JvbGxiYXJzIGlmIG5lY2Vzc2FyeVxuXHRcdH0sXG5cdFx0XCIuZHJvcGRvd24tcGFuZWwtc2Nyb2xsYWJsZVwiOiB7XG5cdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0d2lkdGg6IDAsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHRcIm92ZXJmbG93LXhcIjogXCJoaWRkZW5cIixcblx0XHRcdFwib3ZlcmZsb3cteVwiOiBcImF1dG9cIixcblx0XHR9LFxuXHRcdFwiLmRyb3Bkb3duLXBhbmVsLmZpdC1jb250ZW50LCAuZHJvcGRvd24tcGFuZWwuZml0LWNvbnRlbnQgLmRyb3Bkb3duLWNvbnRlbnRcIjoge1xuXHRcdFx0XCJtaW4td2lkdGhcIjogXCJmaXQtY29udGVudFwiLFxuXHRcdH0sXG5cdFx0XCIuZHJvcGRvd24tY29udGVudDpmaXJzdC1jaGlsZFwiOiB7XG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi5kcm9wZG93bi1jb250ZW50Omxhc3QtY2hpbGRcIjoge1xuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBweChzaXplLnZwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIuZHJvcGRvd24tY29udGVudCwgLmRyb3Bkb3duLWNvbnRlbnQgPiAqXCI6IHtcblx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHR9LFxuXHRcdFwiLmRyb3Bkb3duLXNoYWRvd1wiOiB7XG5cdFx0XHRcImJveC1zaGFkb3dcIjogYm94U2hhZG93LFxuXHRcdH0sXG5cdFx0XCIubWluaW1pemVkLXNoYWRvd1wiOiB7XG5cdFx0XHQvLyBzaGFkb3cgcGFyYW1zOiAxLm9mZnNldC14IDIub2Zmc2V0LXkgMy5ibHVyIDQuc3ByZWFkIDUuY29sb3Jcblx0XHRcdFwiYm94LXNoYWRvd1wiOiBgMHB4IDBweCA0cHggMnB4ICR7dGhlbWUuaGVhZGVyX2JveF9zaGFkb3dfYmd9YCwgLy8gc2ltaWxhciB0byBoZWFkZXIgYmFyIHNoYWRvd1xuXHRcdH0sXG5cdFx0Ly9kcm9wZG93biBmaWx0ZXIgYmFyXG5cdFx0XCIuZHJvcGRvd24tYmFyXCI6IHtcblx0XHRcdFwiYm9yZGVyLXN0eWxlXCI6IFwic29saWRcIixcblx0XHRcdFwiYm9yZGVyLXdpZHRoXCI6IFwiMHB4IDBweCAxcHggMHB4XCIsXG5cdFx0XHRcImJvcmRlci1jb2xvclwiOiB0aGVtZS5jb250ZW50X2JvcmRlcixcblx0XHRcdFwicGFkZGluZy1ib3R0b21cIjogXCIxcHhcIixcblx0XHRcdFwiei1pbmRleFwiOiAxLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IGAke3NpemUuYm9yZGVyX3JhZGl1c31weCAke3NpemUuYm9yZGVyX3JhZGl1c31weCAwIDBgLFxuXHRcdFx0Y29sb3I6IHRoZW1lLmNvbnRlbnRfZmcsXG5cdFx0fSxcblx0XHRcIi5kcm9wZG93bi1iYXI6Zm9jdXNcIjoge1xuXHRcdFx0XCJib3JkZXItc3R5bGVcIjogXCJzb2xpZFwiLFxuXHRcdFx0XCJib3JkZXItd2lkdGhcIjogXCIwcHggMHB4IDJweCAwcHhcIixcblx0XHRcdFwiYm9yZGVyLWNvbG9yXCI6IGAke3RoZW1lLmNvbnRlbnRfYWNjZW50fWAsXG5cdFx0XHRcInBhZGRpbmctYm90dG9tXCI6IFwiMHB4XCIsXG5cdFx0fSxcblx0XHRcIi5kcm9wZG93bi1idXR0b25cIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogcHgoc2l6ZS52cGFkKSxcblx0XHRcdFwicGFkZGluZy1yaWdodFwiOiBweChzaXplLnZwYWQpLFxuXHRcdH0sXG5cdFx0XCJidXR0b24sIC5uYXYtYnV0dG9uXCI6IHtcblx0XHRcdGJvcmRlcjogMCxcblx0XHRcdGN1cnNvcjogXCJwb2ludGVyXCIsXG5cdFx0XHRvdmVyZmxvdzogXCJoaWRkZW5cIixcblx0XHRcdFwid2hpdGUtc3BhY2VcIjogXCJub3dyYXBcIixcblx0XHRcdG1hcmdpbjogMCxcblx0XHRcdC8vIGZvciBzYWZhcmlcblx0XHRcdFwiZmxleC1zaHJpbmtcIjogMCxcblx0XHRcdFwiLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yXCI6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwKVwiLFxuXHRcdH0sXG5cdFx0XCIubmF2LWJ1dHRvbjpob3ZlclwiOiAhaXNBcHAoKVxuXHRcdFx0PyB7XG5cdFx0XHRcdFx0Ly8gXCJ0ZXh0LWRlY29yYXRpb25cIjogXCJ1bmRlcmxpbmVcIixcblx0XHRcdFx0XHQvLyBvcGFjaXR5OiAwLjcsXG5cdFx0XHQgIH1cblx0XHRcdDoge30sXG5cdFx0XCIubmF2LWJ1dHRvbjpmb2N1c1wiOiBjbGllbnQuaXNEZXNrdG9wRGV2aWNlKClcblx0XHRcdD8ge1xuXHRcdFx0XHRcdC8vIFwidGV4dC1kZWNvcmF0aW9uXCI6IFwidW5kZXJsaW5lXCIsXG5cdFx0XHRcdFx0Ly8gb3BhY2l0eTogMC43LFxuXHRcdFx0ICB9XG5cdFx0XHQ6IHt9LFxuXHRcdFwiYnV0dG9uOmZvY3VzLCBidXR0b246aG92ZXJcIjogY2xpZW50LmlzRGVza3RvcERldmljZSgpXG5cdFx0XHQ/IHtcblx0XHRcdFx0XHRvcGFjaXR5OiAwLjcsXG5cdFx0XHQgIH1cblx0XHRcdDoge30sXG5cdFx0XCIuYnV0dG9uLWljb25cIjoge1xuXHRcdFx0d2lkdGg6IHB4KHNpemUuYnV0dG9uX2ljb25fYmdfc2l6ZSksXG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuYnV0dG9uX2ljb25fYmdfc2l6ZSksXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5idXR0b25faWNvbl9iZ19zaXplKSxcblx0XHRcdFwibWluLXdpZHRoXCI6IHB4KHNpemUuYnV0dG9uX2ljb25fYmdfc2l6ZSksXG5cdFx0fSxcblx0XHRcIi5sb2dpblwiOiB7XG5cdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHR9LFxuXHRcdFwiLnNtYWxsLWxvZ2luLWJ1dHRvblwiOiB7XG5cdFx0XHR3aWR0aDogXCIyNjBweFwiLFxuXHRcdH0sXG5cdFx0XCIuYnV0dG9uLWNvbnRlbnRcIjoge1xuXHRcdFx0aGVpZ2h0OiBweChzaXplLmJ1dHRvbl9oZWlnaHQpLFxuXHRcdFx0XCJtaW4td2lkdGhcIjogcHgoc2l6ZS5idXR0b25faGVpZ2h0KSxcblx0XHR9LFxuXHRcdFwiLnRleHQtYnViYmxlXCI6IHtcblx0XHRcdFwicGFkZGluZy10b3BcIjogcHgoc2l6ZS50ZXh0X2J1YmJsZV90cGFkKSxcblx0XHR9LFxuXHRcdFwiLmJ1YmJsZVwiOiB7XG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiB0aGVtZS5idXR0b25fYnViYmxlX2JnLFxuXHRcdFx0Y29sb3I6IHRoZW1lLmJ1dHRvbl9idWJibGVfZmcsXG5cdFx0fSxcblx0XHRcIi5rZXl3b3JkLWJ1YmJsZVwiOiB7XG5cdFx0XHRcIm1heC13aWR0aFwiOiBcIjMwMHB4XCIsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiBweChzaXplLnZwYWRfc21hbGwgLyAyKSxcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUudnBhZF9zbWFsbCAvIDIpLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmJ1dHRvbl9idWJibGVfYmcsXG5cdFx0XHRwYWRkaW5nOiBgJHtweChzaXplLnZwYWRfc21hbGwgLyAyKX0gJHtweChzaXplLnZwYWRfc21hbGwpfSAke3B4KHNpemUudnBhZF9zbWFsbCAvIDIpfSAke3B4KHNpemUudnBhZF9zbWFsbCl9YCxcblx0XHR9LFxuXHRcdFwiLmtleXdvcmQtYnViYmxlLW5vLXBhZGRpbmdcIjoge1xuXHRcdFx0XCJtYXgtd2lkdGhcIjogXCIzMDBweFwiLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1cyksXG5cdFx0XHRtYXJnaW46IHB4KHNpemUudnBhZF9zbWFsbCAvIDIpLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmJ1dHRvbl9idWJibGVfYmcsXG5cdFx0fSxcblx0XHRcIi5idWJibGUtY29sb3JcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmJ1dHRvbl9idWJibGVfYmcsXG5cdFx0XHRjb2xvcjogdGhlbWUuYnV0dG9uX2J1YmJsZV9mZyxcblx0XHR9LFxuXHRcdG1hcms6IHtcblx0XHRcdC8vICdiYWNrZ3JvdW5kLWNvbG9yJzogdGhlbWUuY29udGVudF9idXR0b24sXG5cdFx0XHQvLyAnY29sb3InOiB0aGVtZS5jb250ZW50X2J1dHRvbl9pY29uLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYWNjZW50LFxuXHRcdFx0Y29sb3I6IHRoZW1lLmNvbnRlbnRfYnV0dG9uX2ljb25fc2VsZWN0ZWQsXG5cdFx0fSxcblx0XHRcIi5zZWdtZW50Q29udHJvbFwiOiB7XG5cdFx0XHQvLyBzYW1lIGJvcmRlciBhcyBmb3IgYnViYmxlIGJ1dHRvbnNcblx0XHRcdFwiYm9yZGVyLXRvcFwiOiBgJHtweCgoc2l6ZS5idXR0b25faGVpZ2h0IC0gc2l6ZS5idXR0b25faGVpZ2h0X2J1YmJsZSkgLyAyKX0gc29saWQgdHJhbnNwYXJlbnRgLFxuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAke3B4KChzaXplLmJ1dHRvbl9oZWlnaHQgLSBzaXplLmJ1dHRvbl9oZWlnaHRfYnViYmxlKSAvIDIpfSBzb2xpZCB0cmFuc3BhcmVudGAsXG5cdFx0fSxcblx0XHRcIi5zZWdtZW50Q29udHJvbC1ib3JkZXJcIjoge1xuXHRcdFx0Ym9yZGVyOiBgMXB4IHNvbGlkICR7dGhlbWUuY29udGVudF9ib3JkZXJ9YCxcblx0XHRcdFwicGFkZGluZy10b3BcIjogcHgoMSksXG5cdFx0XHRcInBhZGRpbmctYm90dG9tXCI6IHB4KDEpLFxuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogcHgoMSksXG5cdFx0XHRcInBhZGRpbmctcmlnaHRcIjogcHgoMSksXG5cdFx0fSxcblx0XHRcIi5zZWdtZW50Q29udHJvbC1ib3JkZXItYWN0aXZlXCI6IHtcblx0XHRcdGJvcmRlcjogYDJweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYWNjZW50fWAsXG5cdFx0XHRcInBhZGRpbmctdG9wXCI6IHB4KDApLFxuXHRcdFx0XCJwYWRkaW5nLWJvdHRvbVwiOiBweCgwKSxcblx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IHB4KDApLFxuXHRcdFx0XCJwYWRkaW5nLXJpZ2h0XCI6IHB4KDApLFxuXHRcdH0sXG5cdFx0XCIuc2VnbWVudENvbnRyb2wtYm9yZGVyLWFjdGl2ZS1jeWJlci1tb25kYXlcIjoge1xuXHRcdFx0Ym9yZGVyOiBgMnB4IHNvbGlkICR7dGhlbWUuY29udGVudF9hY2NlbnRfY3liZXJfbW9uZGF5fWAsXG5cdFx0fSxcblx0XHRcIi5zZWdtZW50Q29udHJvbEl0ZW1cIjoge1xuXHRcdFx0Y3Vyc29yOiBcInBvaW50ZXJcIixcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIixcblx0XHR9LFxuXHRcdFwiLnNlZ21lbnRDb250cm9sSXRlbTpsYXN0LWNoaWxkXCI6IHtcblx0XHRcdFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX3NtYWxsKSxcblx0XHRcdFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLnNlZ21lbnRDb250cm9sSXRlbTpmaXJzdC1jaGlsZFwiOiB7XG5cdFx0XHRcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX3NtYWxsKSxcblx0XHRcdFwiYm9yZGVyLXRvcC1sZWZ0LXJhZGl1c1wiOiBweChzaXplLmJvcmRlcl9yYWRpdXNfc21hbGwpLFxuXHRcdH0sXG5cblx0XHQvLyBJY29uU2VnbWVudENvbnRyb2xcblx0XHRcIi5pY29uLXNlZ21lbnQtY29udHJvbFwiOiB7XG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHR9LFxuXHRcdFwiLmljb24tc2VnbWVudC1jb250cm9sLWl0ZW1cIjoge1xuXHRcdFx0Ly8gTWFrZSB0aGluIGJvcmRlciBiZXR3ZWVuIGl0ZW1zIHZpYSBib3JkZXItcmlnaHRcblx0XHRcdFwiYm9yZGVyLXRvcFwiOiBgMXB4IHNvbGlkICR7c3RhdGVCZ0hvdmVyfWAsXG5cdFx0XHRcImJvcmRlci1ib3R0b21cIjogYDFweCBzb2xpZCAke3N0YXRlQmdIb3Zlcn1gLFxuXHRcdFx0XCJib3JkZXItcmlnaHRcIjogYDAuNXB4IHNvbGlkICR7c3RhdGVCZ0hvdmVyfWAsXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5pY29uX3NlZ21lbnRfY29udHJvbF9idXR0b25fd2lkdGgpLFxuXHRcdFx0aGVpZ2h0OiBweChzaXplLmljb25fc2VnbWVudF9jb250cm9sX2J1dHRvbl9oZWlnaHQpLFxuXHRcdFx0Y3Vyc29yOiBcInBvaW50ZXJcIixcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIixcblx0XHR9LFxuXHRcdFwiLmljb24tc2VnbWVudC1jb250cm9sLWl0ZW1bYWN0aXZlXVwiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiBzdGF0ZUJnSG92ZXIsXG5cdFx0XHRcInRyYW5zaXRpb24tZHVyYXRpb25cIjogXCIuM3NcIixcblx0XHR9LFxuXHRcdFwiLmljb24tc2VnbWVudC1jb250cm9sLWl0ZW06Zmlyc3QtY2hpbGRcIjoge1xuXHRcdFx0XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1cyksXG5cdFx0XHRcImJvcmRlci10b3AtbGVmdC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHRcdFwiYm9yZGVyLWxlZnRcIjogYDFweCBzb2xpZCAke3N0YXRlQmdIb3Zlcn1gLFxuXHRcdH0sXG5cdFx0XCIuaWNvbi1zZWdtZW50LWNvbnRyb2wtaXRlbTpsYXN0LWNoaWxkXCI6IHtcblx0XHRcdFwiYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHRcdFwiYm9yZGVyLXRvcC1yaWdodC1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzKSxcblx0XHRcdFwiYm9yZGVyLXJpZ2h0XCI6IGAxcHggc29saWQgJHtzdGF0ZUJnSG92ZXJ9YCxcblx0XHR9LFxuXHRcdFwiLnBheW1lbnQtbG9nb1wiOiB7XG5cdFx0XHQvLyB0aGF0J3MgdGhlIHNpemUgb2YgdGhlIFNWRyBhbmQgaXQgc2VlbXMgdG8gYmUgYSBnb29kIHNpemVcblx0XHRcdHdpZHRoOiBcIjEyNHB4XCIsXG5cdFx0fSxcblx0XHRcIi5vbmJvYXJkaW5nLWxvZ28sIC5vbmJvYXJkaW5nLWxvZ28gPiBzdmdcIjoge1xuXHRcdFx0d2lkdGg6IFwiZml0LWNvbnRlbnRcIixcblx0XHRcdGhlaWdodDogcHgoMTYwKSxcblx0XHR9LFxuXHRcdFwiLm9uYm9hcmRpbmctbG9nby1sYXJnZSwgLm9uYm9hcmRpbmctbG9nby1sYXJnZSA+IHN2Z1wiOiB7XG5cdFx0XHR3aWR0aDogXCJmaXQtY29udGVudFwiLFxuXHRcdFx0Ly8gVGhpcyB2YWx1ZSBicmluZ3MgdGhlIGJvdHRvbSBvZiB0aGUgaWxsdXN0cmF0aW9uIGlubGluZSB3aXRoIHRoZSBmaXJzdCBidXR0b24gb24gdGhlIG5vdGlmaWNhdGlvbnMgcGFnZVxuXHRcdFx0aGVpZ2h0OiBweCgyMjIpLFxuXHRcdH0sXG5cdFx0XCJzZXR0aW5ncy1pbGx1c3RyYXRpb24tbGFyZ2UsIC5zZXR0aW5ncy1pbGx1c3RyYXRpb24tbGFyZ2UgPiBzdmdcIjoge1xuXHRcdFx0d2lkdGg6IFwiZnVsbC13aWR0aFwiLFxuXHRcdFx0aGVpZ2h0OiBcImZpdC1jb250ZW50XCIsXG5cdFx0fSxcblx0XHQvLyBjb250YWN0XG5cdFx0XCIud3JhcHBpbmctcm93XCI6IHtcblx0XHRcdGRpc3BsYXk6IFwiZmxleFwiLFxuXHRcdFx0XCJmbGV4LWZsb3dcIjogXCJyb3cgd3JhcFwiLFxuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoLXNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi53cmFwcGluZy1yb3cgPiAqXCI6IHtcblx0XHRcdGZsZXg6IFwiMSAwIDQwJVwiLFxuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoc2l6ZS5ocGFkX2xhcmdlKSxcblx0XHRcdFwibWluLXdpZHRoXCI6IHB4KDIwMCksIC8vIG1ha2VzIHN1cmUgdGhlIHJvdyBpcyB3cmFwcGVkIHdpdGggdG9vIGxhcmdlIGNvbnRlbnRcblx0XHR9LFxuXHRcdFwiLm5vbi13cmFwcGluZy1yb3dcIjoge1xuXHRcdFx0ZGlzcGxheTogXCJmbGV4XCIsXG5cdFx0XHRcImZsZXgtZmxvd1wiOiBcInJvd1wiLFxuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoLXNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHRcIi5ub24td3JhcHBpbmctcm93ID4gKlwiOiB7XG5cdFx0XHRmbGV4OiBcIjEgMCA0MCVcIixcblx0XHRcdFwibWFyZ2luLXJpZ2h0XCI6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0fSxcblx0XHQvLyB0ZXh0IGlucHV0IGZpZWxkXG5cdFx0XCIuaW5wdXRXcmFwcGVyXCI6IHtcblx0XHRcdGZsZXg6IFwiMSAxIGF1dG9cIixcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdH0sXG5cdFx0Ly8gdGV4dGFyZWFcblx0XHRcIi5pbnB1dCwgLmlucHV0LWFyZWFcIjoge1xuXHRcdFx0ZGlzcGxheTogXCJibG9ja1wiLFxuXHRcdFx0cmVzaXplOiBcIm5vbmVcIixcblx0XHRcdGJvcmRlcjogMCxcblx0XHRcdHBhZGRpbmc6IDAsXG5cdFx0XHRtYXJnaW46IDAsXG5cdFx0XHQvLyBmb3Igc2FmYXJpIGJyb3dzZXJcblx0XHRcdGJhY2tncm91bmQ6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0Y29sb3I6IHRoZW1lLmNvbnRlbnRfZmcsXG5cdFx0fSxcblx0XHRcIi5pbnB1dC1uby1jbGVhcjo6LW1zLWNsZWFyXCI6IHtcblx0XHRcdC8vIHJlbW92ZSB0aGUgY2xlYXIgKHgpIGJ1dHRvbiBmcm9tIGVkZ2UgaW5wdXQgZmllbGRzXG5cdFx0XHRkaXNwbGF5OiBcIm5vbmVcIixcblx0XHR9LFxuXHRcdFwiLnJlc2l6ZS1ub25lXCI6IHtcblx0XHRcdHJlc2l6ZTogXCJub25lXCIsXG5cdFx0fSxcblx0XHQvLyB0YWJsZVxuXHRcdFwiLnRhYmxlXCI6IHtcblx0XHRcdFwiYm9yZGVyLWNvbGxhcHNlXCI6IFwiY29sbGFwc2VcIixcblx0XHRcdFwidGFibGUtbGF5b3V0XCI6IFwiZml4ZWRcIixcblx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHR9LFxuXHRcdFwiLnRhYmxlLWhlYWRlci1ib3JkZXIgdHI6Zmlyc3QtY2hpbGRcIjoge1xuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0XCIudGFibGUgdGRcIjoge1xuXHRcdFx0XCJ2ZXJ0aWNhbC1hbGlnblwiOiBcIm1pZGRsZVwiLFxuXHRcdH0sXG5cdFx0dGQ6IHtcblx0XHRcdHBhZGRpbmc6IDAsXG5cdFx0fSxcblx0XHRcIi5jb2x1bW4td2lkdGgtc21hbGxcIjoge1xuXHRcdFx0d2lkdGg6IHB4KHNpemUuY29sdW1uX3dpZHRoX3NfZGVza3RvcCksXG5cdFx0fSxcblx0XHRcIi5jb2x1bW4td2lkdGgtbGFyZ2VzdFwiOiB7fSxcblx0XHRcIi5idXlPcHRpb25Cb3hcIjoge1xuXHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmVcIixcblx0XHRcdGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG5cdFx0XHRib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdFx0d2lkdGg6IFwiMTAwJVwiLFxuXHRcdFx0cGFkZGluZzogcHgoMTApLFxuXHRcdH0sXG5cdFx0XCIucGxhbnMtZ3JpZFwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImdyaWRcIixcblx0XHRcdFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zXCI6IFwiMWZyXCIsXG5cdFx0XHRcImdyaWQtYXV0by1mbG93XCI6IFwiY29sdW1uXCIsXG5cdFx0XHRcImdyaWQtdGVtcGxhdGUtcm93c1wiOiBcImF1dG8gMWZyXCIsXG5cdFx0fSxcblx0XHRcIkBtZWRpYSAobWF4LXdpZHRoOiA5OTJweClcIjoge1xuXHRcdFx0XCIucGxhbnMtZ3JpZFwiOiB7XG5cdFx0XHRcdFwiZ3JpZC10ZW1wbGF0ZS1yb3dzXCI6IFwiYXV0byAxZnIgYXV0byAxZnJcIixcblx0XHRcdH0sXG5cdFx0XHRcIi5wbGFucy1ncmlkID4gZGl2Om50aC1jaGlsZCgzKSwgLnBsYW5zLWdyaWQgPiBkaXY6bnRoLWNoaWxkKDQpXCI6IHtcblx0XHRcdFx0b3JkZXI6IDEsXG5cdFx0XHR9LFxuXHRcdFx0XCIucGxhbnMtZ3JpZCA+IGRpdjpudGgtY2hpbGQoNSksIC5wbGFucy1ncmlkID4gZGl2Om50aC1jaGlsZCg2KVwiOiB7XG5cdFx0XHRcdFwiZ3JpZC1jb2x1bW5cIjogXCIxIC8gM1wiLFxuXHRcdFx0XHRcImp1c3RpZnktc2VsZlwiOiBcImNlbnRlclwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLnBsYW5zLWdyaWQgPiBkaXY6bnRoLWNoaWxkKDUpXCI6IHtcblx0XHRcdFx0XCJncmlkLXJvdy1zdGFydFwiOiAzLFxuXHRcdFx0fSxcblx0XHRcdFwiLnBsYW5zLWdyaWQgPiBkaXY6bnRoLWNoaWxkKDYpXCI6IHtcblx0XHRcdFx0XCJncmlkLXJvdy1zdGFydFwiOiA0LFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdFwiQG1lZGlhIChtYXgtd2lkdGg6IDYwMHB4KVwiOiB7XG5cdFx0XHRcIi5wbGFucy1ncmlkXCI6IHtcblx0XHRcdFx0XCJncmlkLXRlbXBsYXRlLXJvd3NcIjogXCJhdXRvIG1pbi1jb250ZW50IGF1dG8gbWluLWNvbnRlbnQgYXV0byBtaW4tY29udGVudFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLnBsYW5zLWdyaWQgPiBkaXY6bnRoLWNoaWxkKDMpLCAucGxhbnMtZ3JpZCA+IGRpdjpudGgtY2hpbGQoNClcIjoge1xuXHRcdFx0XHRvcmRlcjogXCJ1bnNldFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLnBsYW5zLWdyaWQgPiBkaXY6bnRoLWNoaWxkKDUpLCAucGxhbnMtZ3JpZCA+IGRpdjpudGgtY2hpbGQoNilcIjoge1xuXHRcdFx0XHRcImdyaWQtY29sdW1uXCI6IFwidW5zZXRcIixcblx0XHRcdH0sXG5cdFx0XHRcIi5wbGFucy1ncmlkID4gZGl2Om50aC1jaGlsZCg1KVwiOiB7XG5cdFx0XHRcdFwiZ3JpZC1yb3ctc3RhcnRcIjogXCJ1bnNldFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLnBsYW5zLWdyaWQgPiBkaXY6bnRoLWNoaWxkKDYpXCI6IHtcblx0XHRcdFx0XCJncmlkLXJvdy1zdGFydFwiOiBcInVuc2V0XCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0XCIuYnV5T3B0aW9uQm94LmFjdGl2ZVwiOiB7XG5cdFx0XHRib3JkZXI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudH1gLFxuXHRcdH0sXG5cdFx0XCIuYnV5T3B0aW9uQm94LmhpZ2hsaWdodGVkXCI6IHtcblx0XHRcdGJvcmRlcjogYDJweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYWNjZW50fWAsXG5cdFx0XHRwYWRkaW5nOiBweCg5KSxcblx0XHR9LFxuXHRcdFwiLmJ1eU9wdGlvbkJveC5oaWdobGlnaHRlZC5jeWJlck1vbmRheVwiOiB7XG5cdFx0XHRib3JkZXI6IGAycHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudF9jeWJlcl9tb25kYXl9YCxcblx0XHRcdHBhZGRpbmc6IHB4KDkpLFxuXHRcdH0sXG5cdFx0XCIuaW5mby1iYWRnZVwiOiB7XG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoOCksXG5cdFx0XHRcImxpbmUtaGVpZ2h0XCI6IHB4KDE2KSxcblx0XHRcdFwiZm9udC1zaXplXCI6IHB4KDEyKSxcblx0XHRcdFwiZm9udC13ZWlnaHRcIjogXCJib2xkXCIsXG5cdFx0XHR3aWR0aDogcHgoMTYpLFxuXHRcdFx0aGVpZ2h0OiBweCgxNiksXG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIixcblx0XHRcdGNvbG9yOiBcIndoaXRlXCIsXG5cdFx0XHRiYWNrZ3JvdW5kOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHR9LFxuXHRcdFwiLnRvb2x0aXBcIjoge1xuXHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmVcIixcblx0XHRcdGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG5cdFx0fSxcblx0XHRcIi50b29sdGlwIC50b29sdGlwdGV4dFwiOiB7XG5cdFx0XHR2aXNpYmlsaXR5OiBcImhpZGRlblwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYnV0dG9uLFxuXHRcdFx0Y29sb3I6IHRoZW1lLmNvbnRlbnRfYmcsXG5cdFx0XHRcInRleHQtYWxpZ25cIjogXCJjZW50ZXJcIixcblx0XHRcdHBhZGRpbmc6IFwiNXB4IDVweFwiLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KDYpLFxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFwiei1pbmRleFwiOiAxLFxuXHRcdFx0dG9wOiBcIjE1MCVcIixcblx0XHRcdGxlZnQ6IFwiNTAlXCIsXG5cdFx0fSxcblx0XHQvKiB3ZSdyZSBzZWxlY3RpbmcgZXZlcnkgZWxlbWVudCB0aGF0J3MgYWZ0ZXIgYSBzdW1tYXJ5IHRhZyBhbmQgaXMgaW5zaWRlIGFuIG9wZW5lZCBkZXRhaWxzIHRhZyAqL1xuXHRcdFwiZGV0YWlsc1tvcGVuXSBzdW1tYXJ5IH4gKlwiOiB7XG5cdFx0XHRhbmltYXRpb246IFwiZXhwYW5kIC4ycyBlYXNlLWluLW91dFwiLFxuXHRcdH0sXG5cdFx0XCIuZXhwYW5kXCI6IHtcblx0XHRcdGFuaW1hdGlvbjogXCJleHBhbmQgLjJzIGVhc2UtaW4tb3V0XCIsXG5cdFx0fSxcblx0XHRcIkBrZXlmcmFtZXMgZXhwYW5kXCI6IHtcblx0XHRcdFwiMCVcIjoge1xuXHRcdFx0XHRvcGFjaXR5OiAwLFxuXHRcdFx0XHRcIm1hcmdpbi10b3BcIjogXCItMTBweFwiLFxuXHRcdFx0XHRoZWlnaHQ6IFwiMCVcIixcblx0XHRcdH0sXG5cdFx0XHRcIjEwMCVcIjoge1xuXHRcdFx0XHRvcGFjaXR5OiAxLFxuXHRcdFx0XHRcIm1hcmdpbi10b3BcIjogcHgoMCksXG5cdFx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0XCIuaW5mby1iYWRnZTphY3RpdmVcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogdGhlbWUuY29udGVudF9iZyxcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2J1dHRvbixcblx0XHR9LFxuXHRcdFwiLnRvb2x0aXA6aG92ZXIgLnRvb2x0aXB0ZXh0LCAudG9vbHRpcFtleHBhbmRlZD10cnVlXSAudG9vbHRpcHRleHRcIjoge1xuXHRcdFx0dmlzaWJpbGl0eTogXCJ2aXNpYmxlXCIsXG5cdFx0fSxcblx0XHRcIi5yaWJib24taG9yaXpvbnRhbFwiOiB7XG5cdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IFwiODBweFwiLFxuXHRcdFx0YmFja2dyb3VuZDogdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0XHR0b3A6IFwiNjlweFwiLFxuXHRcdFx0bGVmdDogXCItNnB4XCIsXG5cdFx0XHRyaWdodDogXCItNnB4XCIsXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9iZyxcblx0XHR9LFxuXHRcdFwiLnJpYmJvbi1ob3Jpem9udGFsLWN5YmVyLW1vbmRheVwiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiB0aGVtZS5jb250ZW50X2JnX2N5YmVyX21vbmRheSxcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2JnLFxuXHRcdH0sXG5cdFx0XCIucmliYm9uLWhvcml6b250YWw6YWZ0ZXJcIjoge1xuXHRcdFx0Y29udGVudDogJ1wiXCInLFxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0XCJib3JkZXItbGVmdFwiOiBgNnB4IHNvbGlkICR7dGhlbWUuY29udGVudF9hY2NlbnR9YCxcblx0XHRcdFwiYm9yZGVyLWJvdHRvbVwiOiBcIjZweCBzb2xpZCB0cmFuc3BhcmVudFwiLFxuXHRcdFx0Ym90dG9tOiBcIi02cHhcIixcblx0XHRcdHJpZ2h0OiAwLFxuXHRcdH0sXG5cdFx0XCIucmliYm9uLWhvcml6b250YWwtY3liZXItbW9uZGF5OmFmdGVyXCI6IHtcblx0XHRcdFwiYm9yZGVyLWxlZnRcIjogYDZweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYmdfY3liZXJfbW9uZGF5fWAsXG5cdFx0fSxcblx0XHRcIi5yaWJib24taG9yaXpvbnRhbDpiZWZvcmVcIjoge1xuXHRcdFx0Y29udGVudDogJ1wiXCInLFxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0XCJib3JkZXItcmlnaHRcIjogYDZweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYWNjZW50fWAsXG5cdFx0XHRcImJvcmRlci1ib3R0b21cIjogXCI2cHggc29saWQgdHJhbnNwYXJlbnRcIixcblx0XHRcdGJvdHRvbTogXCItNnB4XCIsXG5cdFx0XHRsZWZ0OiAwLFxuXHRcdH0sXG5cdFx0XCIucmliYm9uLWhvcml6b250YWwtY3liZXItbW9uZGF5OmJlZm9yZVwiOiB7XG5cdFx0XHRcImJvcmRlci1yaWdodFwiOiBgNnB4IHNvbGlkICR7dGhlbWUuY29udGVudF9iZ19jeWJlcl9tb25kYXl9YCxcblx0XHR9LFxuXHRcdC8vIGNhbGVuZGFyXG5cdFx0XCIuZmxleC1lbmQtb24tY2hpbGQgLmJ1dHRvbi1jb250ZW50XCI6IHtcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJmbGV4LWVuZCAhaW1wb3J0YW50XCIsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1jaGVja2JveFwiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KDIyKSxcblx0XHRcdHdpZHRoOiBweCgyMiksXG5cdFx0XHRcImJvcmRlci13aWR0aFwiOiBcIjEuNXB4XCIsXG5cdFx0XHRcImJvcmRlci1zdHlsZVwiOiBcInNvbGlkXCIsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogXCIycHhcIixcblx0XHR9LFxuXHRcdFwiLmNoZWNrYm94LW92ZXJyaWRlXCI6IHtcblx0XHRcdGFwcGVhcmFuY2U6IFwibm9uZVwiLFxuXHRcdFx0Zm9udDogXCJpbmhlcml0XCIsXG5cdFx0XHRtYXJnaW46IHB4KDApLFxuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogcHgoNSksXG5cdFx0XHRwb3NpdGlvbjogXCJyZWxhdGl2ZVwiLFxuXHRcdFx0Ym90dG9tOiBweCgtMiksXG5cdFx0fSxcblx0XHRcIi5jaGVja2JveFwiOiB7XG5cdFx0XHRhcHBlYXJhbmNlOiBcIm5vbmVcIixcblx0XHRcdC8vIHJlc2V0IGJyb3dzZXIgc3R5bGVcblx0XHRcdG1hcmdpbjogXCIwXCIsXG5cdFx0XHRkaXNwbGF5OiBcImJsb2NrXCIsXG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5jaGVja2JveF9zaXplKSxcblx0XHRcdGhlaWdodDogcHgoc2l6ZS5jaGVja2JveF9zaXplKSxcblx0XHRcdGJvcmRlcjogYDJweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYnV0dG9ufWAsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogXCIzcHhcIixcblx0XHRcdHBvc2l0aW9uOiBcInJlbGF0aXZlXCIsXG5cdFx0XHR0cmFuc2l0aW9uOiBgYm9yZGVyICR7RGVmYXVsdEFuaW1hdGlvblRpbWV9bXMgY3ViaWMtYmV6aWVyKC40LC4wLC4yMywxKWAsXG5cdFx0XHRvcGFjaXR5OiBcIjAuOFwiLFxuXHRcdH0sXG5cdFx0XCIuY2hlY2tib3g6aG92ZXJcIjoge1xuXHRcdFx0b3BhY2l0eTogXCIxXCIsXG5cdFx0fSxcblx0XHRcIi5jaGVja2JveDpjaGVja2VkXCI6IHtcblx0XHRcdGJvcmRlcjogYDdweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYWNjZW50fWAsXG5cdFx0XHRvcGFjaXR5OiBcIjFcIixcblx0XHR9LFxuXHRcdFwiLmNoZWNrYm94OmNoZWNrZWQ6YWZ0ZXJcIjoge1xuXHRcdFx0ZGlzcGxheTogXCJpbmxpbmUtZmxleFwiLFxuXHRcdH0sXG5cdFx0XCIuY2hlY2tib3g6YWZ0ZXJcIjoge1xuXHRcdFx0XCJmb250LWZhbWlseVwiOiBcIidJb25pY29ucydcIixcblx0XHRcdGNvbnRlbnQ6IGAnJHtGb250SWNvbnMuQ2hlY2tib3h9J2AsXG5cdFx0XHRwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxuXHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0XHRcImZvbnQtc2l6ZVwiOiBcIjEycHhcIixcblx0XHRcdC8vIHJlbGF0ZWQgdG8gYm9yZGVyIHdpZHRoXG5cdFx0XHR0b3A6IFwiLTZweFwiLFxuXHRcdFx0bGVmdDogXCItNnB4XCIsXG5cdFx0XHRyaWdodDogMCxcblx0XHRcdGJvdHRvbTogMCxcblx0XHRcdFwibGluZS1oZWlnaHRcIjogXCIxMnB4XCIsXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9iZyxcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJjZW50ZXJcIixcblx0XHRcdHdpZHRoOiBcIjEycHhcIixcblx0XHRcdGhlaWdodDogXCIxMnB4XCIsXG5cdFx0fSxcblx0XHRcIi5jaGVja2JveDpiZWZvcmVcIjoge1xuXHRcdFx0Y29udGVudDogXCInJ1wiLFxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdHdpZHRoOiBcIjMwcHhcIixcblx0XHRcdGhlaWdodDogXCIzMHB4XCIsXG5cdFx0XHQvLyBwb3NpdGlvbiByZWxhdGl2ZSB0byB0aGUgaW5uZXIgc2l6ZSBvZiBjaGVja2JveCAoaW5zaWRlIHRoZSBib3JkZXIpXG5cdFx0XHR0b3A6IFwiLTEwcHhcIixcblx0XHRcdGxlZnQ6IFwiLTEwcHhcIixcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBweChzaXplLmJvcmRlcl9yYWRpdXMpLFxuXHRcdFx0Ly8gcG9zaXRpb24gaXMgcmVsYXRlIHRvIHBhZGRpbmcgYW5kIHdlIGFuaW1hdGUgcGFkZGluZyBzbyB0byBrZWVwIHRoZSBjaGVja2JveCBpbiBwbGFjZSB3ZSBhbHNvIGFuaW1hdGUgcG9zaXRpb24gc28gaXQgbG9va3MgbGlrZSBpdCBkb2Vzbid0IG1vdmVcblx0XHRcdHRyYW5zaXRpb246IGBhbGwgJHtEZWZhdWx0QW5pbWF0aW9uVGltZX1tcyBjdWJpYy1iZXppZXIoLjQsLjAsLjIzLDEpYCxcblx0XHR9LFxuXHRcdFwiLmNoZWNrYm94OmNoZWNrZWQ6YmVmb3JlXCI6IHtcblx0XHRcdC8vIHBvc2l0aW9uIHJlbGF0aXZlIHRvIHRoZSBpbm5lciBzaXplIG9mIHRoZSBjaGVja2JveCAoaW5zaWRlIHRoZSBib3JkZXIpIGFuZCBzZWxlY3RlZCBjaGVja2JveCBoYXMgYm9yZGVyIDUwJVxuXHRcdFx0dG9wOiBcIi0xNXB4XCIsXG5cdFx0XHRsZWZ0OiBcIi0xNXB4XCIsXG5cdFx0fSxcblx0XHRcIi5jaGVja2JveDpob3ZlcjpiZWZvcmVcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogc3RhdGVCZ0hvdmVyLFxuXHRcdH0sXG5cdFx0XCIuY2hlY2tib3g6YWN0aXZlOmJlZm9yZVwiOiB7XG5cdFx0XHRiYWNrZ3JvdW5kOiBzdGF0ZUJnQWN0aXZlLFxuXHRcdH0sXG5cdFx0XCIubGlzdC1jaGVja2JveFwiOiB7XG5cdFx0XHRvcGFjaXR5OiBcIjAuNFwiLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItYWx0ZXJuYXRlLWJhY2tncm91bmRcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogYCR7dGhlbWUubGlzdF9hbHRlcm5hdGVfYmd9ICFpbXBvcnRhbnRgLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItZGF5OmhvdmVyXCI6IHtcblx0XHRcdGJhY2tncm91bmQ6IHRoZW1lLmxpc3RfYWx0ZXJuYXRlX2JnLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItZGF5OmhvdmVyIC5jYWxlbmRhci1kYXktaGVhZGVyLWJ1dHRvblwiOiB7XG5cdFx0XHRvcGFjaXR5OiAxLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItZGF5LWhlYWRlci1idXR0b25cIjoge1xuXHRcdFx0b3BhY2l0eTogMCxcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLWhvdXJcIjoge1xuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdFx0aGVpZ2h0OiBweChzaXplLmNhbGVuZGFyX2hvdXJfaGVpZ2h0KSxcblx0XHRcdGZsZXg6IFwiMSAwIGF1dG9cIixcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLWhvdXI6aG92ZXJcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogdGhlbWUubGlzdF9hbHRlcm5hdGVfYmcsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1jb2x1bW4tYm9yZGVyXCI6IHtcblx0XHRcdFwiYm9yZGVyLXJpZ2h0XCI6IGAxcHggc29saWQgJHt0aGVtZS5saXN0X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItY29sdW1uLWJvcmRlcjpudGgtY2hpbGQoNylcIjoge1xuXHRcdFx0XCJib3JkZXItcmlnaHRcIjogXCJub25lXCIsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1ob3VyLW1hcmdpblwiOiB7XG5cdFx0XHRcIm1hcmdpbi1sZWZ0XCI6IHB4KHNpemUuY2FsZW5kYXJfaG91cl93aWR0aCksXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1ob3VyLWNvbHVtblwiOiB7XG5cdFx0XHR3aWR0aDogcHgoc2l6ZS5jYWxlbmRhcl9ob3VyX3dpZHRoKSxcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLWRheXMtaGVhZGVyLXJvd1wiOiB7XG5cdFx0XHRoZWlnaHQ6IHB4KHNpemUuY2FsZW5kYXJfZGF5c19oZWFkZXJfaGVpZ2h0KSxcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLWRheVwiOiB7XG5cdFx0XHRcImJvcmRlci10b3BcIjogYDFweCBzb2xpZCAke3RoZW1lLmxpc3RfYm9yZGVyfWAsXG5cdFx0XHR0cmFuc2l0aW9uOiBcImJhY2tncm91bmQgMC40c1wiLFxuXHRcdFx0YmFja2dyb3VuZDogdGhlbWUubGlzdF9iZyxcblx0XHR9LFxuXHRcdFwiLmN1cnNvci1wb2ludGVyXCI6IHtcblx0XHRcdGN1cnNvcjogXCJwb2ludGVyXCIsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1kYXktaW5kaWNhdG9yXCI6IHtcblx0XHRcdC8vIG92ZXJyaWRkZW4gZm9yIG1vYmlsZVxuXHRcdFx0aGVpZ2h0OiBweChzaXplLmNhbGVuZGFyX2RheXNfaGVhZGVyX2hlaWdodCksXG5cdFx0XHRcImxpbmUtaGVpZ2h0XCI6IHB4KHNpemUuY2FsZW5kYXJfZGF5c19oZWFkZXJfaGVpZ2h0KSxcblx0XHRcdFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiLFxuXHRcdFx0XCJmb250LXNpemVcIjogXCIxNHB4XCIsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1kYXkgLmNhbGVuZGFyLWRheS1pbmRpY2F0b3I6aG92ZXJcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogdGhlbWUubGlzdF9tZXNzYWdlX2JnLFxuXHRcdFx0b3BhY2l0eTogMC43LFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItZGF5LW51bWJlclwiOiB7XG5cdFx0XHRtYXJnaW46IFwiM3B4IGF1dG9cIixcblx0XHRcdHdpZHRoOiBcIjIycHhcIixcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLWV2ZW50XCI6IHtcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBweCg0KSxcblx0XHRcdGJvcmRlcjogYCAke3NpemUuY2FsZW5kYXJfZXZlbnRfYm9yZGVyfXB4IHNvbGlkICR7dGhlbWUuY29udGVudF9iZ31gLFxuXHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogXCI0cHhcIixcblx0XHRcdFwiZm9udC13ZWlnaHRcIjogXCI2MDBcIixcblx0XHRcdFwiYm94LXNpemluZ1wiOiBcImNvbnRlbnQtYm94XCIsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1jdXJyZW50LWRheS1jaXJjbGVcIjoge1xuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYnV0dG9uLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItc2VsZWN0ZWQtZGF5LWNpcmNsZVwiOiB7XG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1jdXJyZW50LWRheS10ZXh0XCI6IHtcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2JnLFxuXHRcdFx0XCJmb250LXdlaWdodFwiOiBcImJvbGRcIixcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLXNlbGVjdGVkLWRheS10ZXh0XCI6IHtcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2JnLFxuXHRcdFx0XCJmb250LXdlaWdodFwiOiBcImJvbGRcIixcblx0XHR9LFxuXHRcdFwiLmFuaW1hdGlvbi1yZXZlcnNlXCI6IHtcblx0XHRcdFwiYW5pbWF0aW9uLWRpcmVjdGlvblwiOiBcInJldmVyc2VcIixcblx0XHR9LFxuXHRcdFwiLnNsaWRlLWJvdHRvbVwiOiB7XG5cdFx0XHRcImFuaW1hdGlvbi1uYW1lXCI6IFwic2xpZGVGcm9tQm90dG9tXCIsXG5cdFx0XHRcImFuaW1hdGlvbi1pdGVyYXRpb24tY291bnRcIjogMSxcblx0XHRcdFwiYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvblwiOiBcImVhc2UtaW5cIixcblx0XHRcdFwiYW5pbWF0aW9uLWR1cmF0aW9uXCI6IFwiMTAwbXNcIixcblx0XHR9LFxuXHRcdFwiQGtleWZyYW1lcyBzbGlkZUZyb21Cb3R0b21cIjoge1xuXHRcdFx0XCIwJVwiOiB7XG5cdFx0XHRcdHRyYW5zbGF0ZTogXCIwIDEwMCVcIixcblx0XHRcdH0sXG5cdFx0XHRcIjEwMCVcIjoge1xuXHRcdFx0XHR0cmFuc2xhdGU6IFwiMCAwXCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0XCIuc2xpZGUtdG9wXCI6IHtcblx0XHRcdFwiYW5pbWF0aW9uLW5hbWVcIjogXCJzbGlkZUZyb21Ub3BcIixcblx0XHRcdFwiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiOiAxLFxuXHRcdFx0XCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCI6IFwiZWFzZS1pblwiLFxuXHRcdFx0XCJhbmltYXRpb24tZHVyYXRpb25cIjogXCIxMDBtc1wiLFxuXHRcdH0sXG5cdFx0XCJAa2V5ZnJhbWVzIHNsaWRlRnJvbVRvcFwiOiB7XG5cdFx0XHRcIjAlXCI6IHtcblx0XHRcdFx0dHJhbnNsYXRlOiBcIjAgLTEwMCVcIixcblx0XHRcdH0sXG5cdFx0XHRcIjEwMCVcIjoge1xuXHRcdFx0XHR0cmFuc2xhdGU6IFwiMCAwXCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0XCIuZmFkZS1pblwiOiB7XG5cdFx0XHRvcGFjaXR5OiAxLFxuXHRcdFx0XCJhbmltYXRpb24tbmFtZVwiOiBcImZhZGVJbk9wYWNpdHlcIixcblx0XHRcdFwiYW5pbWF0aW9uLWl0ZXJhdGlvbi1jb3VudFwiOiAxLFxuXHRcdFx0XCJhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uXCI6IFwiZWFzZS1pblwiLFxuXHRcdFx0XCJhbmltYXRpb24tZHVyYXRpb25cIjogXCIyMDBtc1wiLFxuXHRcdH0sXG5cdFx0XCJAa2V5ZnJhbWVzIGZhZGVJbk9wYWNpdHlcIjoge1xuXHRcdFx0XCIwJVwiOiB7XG5cdFx0XHRcdG9wYWNpdHk6IDAsXG5cdFx0XHR9LFxuXHRcdFx0XCIxMDAlXCI6IHtcblx0XHRcdFx0b3BhY2l0eTogMSxcblx0XHRcdH0sXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1idWJibGUtbW9yZS1wYWRkaW5nLWRheSAuY2FsZW5kYXItZXZlbnRcIjoge1xuXHRcdFx0Ym9yZGVyOiBgMXB4IHNvbGlkICR7dGhlbWUubGlzdF9iZ31gLFxuXHRcdH0sXG5cdFx0XCIuZGFya2VyLWhvdmVyOmhvdmVyXCI6IHtcblx0XHRcdGZpbHRlcjogXCJicmlnaHRuZXNzKDk1JSlcIixcblx0XHR9LFxuXHRcdFwiLmRhcmtlc3QtaG92ZXI6aG92ZXJcIjoge1xuXHRcdFx0ZmlsdGVyOiBcImJyaWdodG5lc3MoNzAlKVwiLFxuXHRcdH0sXG5cdFx0XCIuZXZlbnQtY29udGludWVzLWxlZnRcIjoge1xuXHRcdFx0XCJib3JkZXItdG9wLWxlZnQtcmFkaXVzXCI6IDAsXG5cdFx0XHRcImJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXNcIjogMCxcblx0XHRcdFwiYm9yZGVyLWxlZnRcIjogXCJub25lXCIsXG5cdFx0fSxcblx0XHRcIi5ldmVudC1jb250aW51ZXMtcmlnaHRcIjoge1xuXHRcdFx0XCJtYXJnaW4tcmlnaHRcIjogMCxcblx0XHRcdFwiYm9yZGVyLXJpZ2h0XCI6IFwibm9uZVwiLFxuXHRcdFx0XCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiOiAwLFxuXHRcdFx0XCJib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1c1wiOiAwLFxuXHRcdH0sXG5cdFx0XCIuZXZlbnQtY29udGludWVzLXJpZ2h0LWFycm93XCI6IHtcblx0XHRcdHdpZHRoOiAwLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0XCJib3JkZXItdG9wXCI6IFwiOXB4IHNvbGlkIHRyYW5zcGFyZW50XCIsXG5cdFx0XHRcImJvcmRlci1ib3R0b21cIjogXCI5cHggc29saWQgdHJhbnNwYXJlbnRcIixcblx0XHRcdFwiYm9yZGVyLWxlZnRcIjogXCI2cHggc29saWQgZ3JlZW5cIixcblx0XHRcdFwibWFyZ2luLXRvcFwiOiBweCgxKSxcblx0XHRcdFwibWFyZ2luLWJvdHRvbVwiOiBweCgxKSxcblx0XHR9LFxuXHRcdFwiLnRpbWUtZmllbGRcIjoge1xuXHRcdFx0d2lkdGg6IFwiODBweFwiLFxuXHRcdH0sXG5cdFx0XCIudGltZS1waWNrZXIgaW5wdXRcIjoge1xuXHRcdFx0Y29sb3I6IFwicmdiYSgwLCAwLCAwLCAwKVwiLFxuXHRcdH0sXG5cdFx0XCIudGltZS1waWNrZXItZmFrZS1kaXNwbGF5XCI6IHtcblx0XHRcdGJvdHRvbTogXCIxLjZlbVwiLFxuXHRcdFx0bGVmdDogXCIwLjFlbVwiLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItYWdlbmRhLXRpbWUtY29sdW1uXCI6IHtcblx0XHRcdHdpZHRoOiBweCg4MCksXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1hZ2VuZGEtdGltZS1jb2x1bW4gPiAqXCI6IHtcblx0XHRcdGhlaWdodDogcHgoNDQpLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItYWdlbmRhLXJvd1wiOiB7XG5cdFx0XHRcIm1pbi1oZWlnaHRcIjogXCI0NHB4XCIsXG5cdFx0XHRmbGV4OiBcIjEgMCBhdXRvXCIsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1zd2l0Y2gtYnV0dG9uXCI6IHtcblx0XHRcdHdpZHRoOiBcIjQwcHhcIixcblx0XHRcdFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItbG9uZy1ldmVudHMtaGVhZGVyXCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAxcHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdH0sXG5cdFx0XCIuY2FsZW5kYXItbW9udGgtd2Vlay1udW1iZXJcIjoge1xuXHRcdFx0XCJmb250LXNpemVcIjogXCIxMnB4XCIsXG5cdFx0XHRvcGFjaXR5OiBcIjAuOFwiLFxuXHRcdFx0dG9wOiBcIjhweFwiLFxuXHRcdFx0bGVmdDogXCI2cHhcIixcblx0XHR9LFxuXHRcdFwiLmNhbGVuZGFyLW1vbnRoLXdlZWstbnVtYmVyOmFmdGVyXCI6IHtcblx0XHRcdC8vIFVzZWQgdG8gZXhwYW5kIHRoZSBjbGlja2FibGUgYXJlYVxuXHRcdFx0Y29udGVudDogXCInJ1wiLFxuXHRcdFx0d2lkdGg6IFwiMTAwJVwiLFxuXHRcdFx0aGVpZ2h0OiBcIjEwMCVcIixcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHR0b3A6IFwiMFwiLFxuXHRcdFx0bGVmdDogXCIwXCIsXG5cdFx0XHRwYWRkaW5nOiBcIjM1JVwiLFxuXHRcdFx0bWFyZ2luOiBcIi0zNSUgLTM1JVwiLFxuXHRcdH0sXG5cdFx0XCIuY29sb3Itb3B0aW9uOm5vdCguc2VsZWN0ZWQpOmZvY3VzLXdpdGhpbiwgLmNvbG9yLW9wdGlvbjpub3QoLnNlbGVjdGVkKTpob3ZlclwiOiBjbGllbnQuaXNEZXNrdG9wRGV2aWNlKClcblx0XHRcdD8ge1xuXHRcdFx0XHRcdG9wYWNpdHk6IDAuNyxcblx0XHRcdCAgfVxuXHRcdFx0OiB7fSxcblx0XHRcIi5jdXN0b20tY29sb3ItY29udGFpbmVyIC50ZXh0LWZpZWxkXCI6IHtcblx0XHRcdFwicGFkZGluZy10b3BcIjogXCIwcHhcIixcblx0XHR9LFxuXHRcdFwiLmN1c3RvbS1jb2xvci1jb250YWluZXIgLnRleHQuaW5wdXRcIjoge1xuXHRcdFx0XCJ0ZXh0LXRyYW5zZm9ybVwiOiBcInVwcGVyY2FzZVwiLFxuXHRcdFx0d2lkdGg6IFwiOWNoXCIsXG5cdFx0fSxcblx0XHRcIi5jdXN0b20tY29sb3ItY29udGFpbmVyIC5pbnB1dFdyYXBwZXI6YmVmb3JlXCI6IHtcblx0XHRcdC8vIHNsYXNoIGluIGNvbnRlbnQgaXMgY29udGVudCBhbHQuIHNvIHRoYXQgaXQncyBpZ25vcmVkIGJ5IHNjcmVlbiByZWFkZXJzXG5cdFx0XHRjb250ZW50OiAnXCIjXCIgLyBcIlwiJyxcblx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X21lc3NhZ2VfYmcsXG5cdFx0fSxcblx0XHRcIi5jYWxlbmRhci1pbnZpdGUtZmllbGRcIjoge1xuXHRcdFx0XCJtaW4td2lkdGhcIjogXCI4MHB4XCIsXG5cdFx0fSxcblx0XHRcIi5ibG9jay1saXN0XCI6IHtcblx0XHRcdFwibGlzdC1zdHlsZVwiOiBcIm5vbmVcIixcblx0XHRcdHBhZGRpbmc6IDAsXG5cdFx0fSxcblx0XHRcIi5ibG9jay1saXN0IGxpXCI6IHtcblx0XHRcdGRpc3BsYXk6IFwiYmxvY2tcIixcblx0XHR9LFxuXHRcdFwiLnN0aWNreVwiOiB7XG5cdFx0XHRwb3NpdGlvbjogXCJzdGlja3lcIixcblx0XHR9LFxuXHRcdFwiLnRleHQtZmFkZVwiOiB7XG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9idXR0b24sXG5cdFx0fSxcblx0XHRcIi5uby1hcHBlYXJhbmNlIGlucHV0LCAubm8tYXBwZWFyYW5jZSBpbnB1dDo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiwgLm5vLWFwcGVhcmFuY2UgaW5wdXQ6Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b25cIjoge1xuXHRcdFx0XCItd2Via2l0LWFwcGVhcmFuY2VcIjogXCJub25lXCIsXG5cdFx0XHRcIi1tb3otYXBwZWFyYW5jZVwiOiBcInRleHRmaWVsZFwiLFxuXHRcdFx0YXBwZWFyYW5jZTogXCJub25lXCIsXG5cdFx0fSxcblx0XHQvLyBtZWRpYSBxdWVyeSBmb3Igc21hbGwgZGV2aWNlcyB3aGVyZSBlbGVtZW50cyBzaG91bGQgYmUgYXJyYW5nZWQgaW4gb25lIGNvbHVtblxuXHRcdC8vIGFsc28gYWRhcHRpb25zIGZvciB0YWJsZSBjb2x1bW4gd2lkdGhzXG5cdFx0XCJAbWVkaWEgKG1heC13aWR0aDogNDAwcHgpXCI6IHtcblx0XHRcdC8vIGN1cnJlbnRseSB1c2VkIGZvciB0aGUgcmVtaW5kZXIgZGlhbG9nXG5cdFx0XHRcIi5mbGV4LWRpcmVjdGlvbi1jaGFuZ2VcIjoge1xuXHRcdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdFx0XCJmbGV4LWRpcmVjdGlvblwiOiBcImNvbHVtbi1yZXZlcnNlXCIsXG5cdFx0XHRcdFwianVzdGlmeS1jb250ZW50XCI6IFwiY2VudGVyXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIuY29sdW1uLXdpZHRoLXNtYWxsXCI6IHtcblx0XHRcdFx0d2lkdGg6IHB4KHNpemUuY29sdW1uX3dpZHRoX3NfbW9iaWxlKSxcblx0XHRcdH0sXG5cdFx0XHQvLyBTcGVlZCB1cCBTVkcgcmVuZGVyaW5nIGluIHRoZSBvbmJvYXJkaW5nIHdpemFyZCBieSBkaXNhYmxpbmcgYW50aWFsaWFzaW5nXG5cdFx0XHRcInN2ZywgaW1nXCI6IHtcblx0XHRcdFx0XCJzaGFwZS1yZW5kZXJpbmdcIjogXCJvcHRpbWl6ZVNwZWVkXCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0XCIudHJhbnNpdGlvbi1tYXJnaW5cIjoge1xuXHRcdFx0dHJhbnNpdGlvbjogYG1hcmdpbi1ib3R0b20gMjAwbXMgZWFzZS1pbi1vdXRgLFxuXHRcdH0sXG5cdFx0XCIuY2lyY2xlXCI6IHtcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBcIjUwJVwiLFxuXHRcdH0sXG5cdFx0XCIuY2xpY2thYmxlXCI6IHtcblx0XHRcdGN1cnNvcjogXCJwb2ludGVyXCIsXG5cdFx0fSxcblx0XHRcIi5zd2l0Y2gtbW9udGgtYnV0dG9uIHN2Z1wiOiB7XG5cdFx0XHRmaWxsOiB0aGVtZS5uYXZpZ2F0aW9uX2J1dHRvbixcblx0XHR9LFxuXHRcdFwiZHJhd2VyLW1lbnVcIjoge1xuXHRcdFx0d2lkdGg6IHB4KHNpemUuZHJhd2VyX21lbnVfd2lkdGgpLFxuXHRcdFx0YmFja2dyb3VuZDogZ2V0TmF2aWdhdGlvbk1lbnVCZygpLFxuXHRcdH0sXG5cdFx0XCIubWVudS1zaGFkb3dcIjoge1xuXHRcdFx0XCJib3gtc2hhZG93XCI6IFwiMCA0cHggNXB4IDJweCByZ2JhKDAsMCwwLDAuMTQpLCAwIDRweCA1cHggMnB4IHJnYmEoMCwwLDAsMC4xNCksIDAgNHB4IDVweCAycHggcmdiYSgwLDAsMCwwLjE0KVwiLFxuXHRcdH0sXG5cdFx0XCIuYmlnLWlucHV0IGlucHV0XCI6IHtcblx0XHRcdFwiZm9udC1zaXplXCI6IHB4KHNpemUuZm9udF9zaXplX2Jhc2UgKiAxLjQpLFxuXHRcdFx0XCJsaW5lLWhlaWdodFwiOiBgJHtweChzaXplLmZvbnRfc2l6ZV9iYXNlICogMS40ICsgMil9ICFpbXBvcnRhbnRgLFxuXHRcdH0sXG5cdFx0XCIuaGlkZGVuLXVudGlsLWZvY3VzXCI6IHtcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRsZWZ0OiBcIi05OTk5cHhcIixcblx0XHRcdFwiei1pbmRleFwiOiBcIjk5OVwiLFxuXHRcdFx0b3BhY2l0eTogXCIwXCIsXG5cdFx0fSxcblx0XHRcIi5oaWRkZW4tdW50aWwtZm9jdXM6Zm9jdXNcIjoge1xuXHRcdFx0Ly8gcG9zaXRpb246IFwiaW5pdGlhbFwiLFxuXHRcdFx0bGVmdDogXCI1MCVcIixcblx0XHRcdHRyYW5zZm9ybTogXCJ0cmFuc2xhdGUoLTUwJSlcIixcblx0XHRcdG9wYWNpdHk6IFwiMVwiLFxuXHRcdH0sXG5cdFx0W2BAbWVkaWEgKG1heC13aWR0aDogJHtzaXplLmRlc2t0b3BfbGF5b3V0X3dpZHRoIC0gMX1weClgXToge1xuXHRcdFx0XCIubWFpbi12aWV3XCI6IHtcblx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRib3R0b206IDAsXG5cdFx0XHR9LFxuXHRcdFx0XCIuZml4ZWQtYm90dG9tLXJpZ2h0XCI6IHtcblx0XHRcdFx0Ym90dG9tOiBweChzaXplLmhwYWRfbGFyZ2VfbW9iaWxlICsgc2l6ZS5ib3R0b21fbmF2X2JhciksXG5cdFx0XHRcdHJpZ2h0OiBweChzaXplLmhwYWRfbGFyZ2VfbW9iaWxlKSxcblx0XHRcdH0sXG5cdFx0XHRcIi5jdXN0b20tbG9nb1wiOiB7XG5cdFx0XHRcdHdpZHRoOiBweCg0MCksXG5cdFx0XHR9LFxuXHRcdFx0XCIubm90aWZpY2F0aW9uLW92ZXJsYXktY29udGVudFwiOiB7XG5cdFx0XHRcdFwicGFkZGluZy10b3BcIjogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHRcdH0sXG5cdFx0XHRcIi5jYWxlbmRhci1kYXktaW5kaWNhdG9yXCI6IHtcblx0XHRcdFx0aGVpZ2h0OiBcIjIwcHhcIixcblx0XHRcdFx0XCJsaW5lLWhlaWdodFwiOiBcIjIwcHhcIixcblx0XHRcdFx0XCJ0ZXh0LWFsaWduXCI6IFwiY2VudGVyXCIsXG5cdFx0XHRcdFwiZm9udC1zaXplXCI6IFwiMTRweFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLmNhbGVuZGFyLWRheS1udW1iZXJcIjoge1xuXHRcdFx0XHRtYXJnaW46IFwiMnB4IGF1dG9cIixcblx0XHRcdFx0d2lkdGg6IFwiMjBweFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLmNhbGVuZGFyLWhvdXItbWFyZ2luXCI6IHtcblx0XHRcdFx0XCJtYXJnaW4tbGVmdFwiOiBweChzaXplLmNhbGVuZGFyX2hvdXJfd2lkdGhfbW9iaWxlKSxcblx0XHRcdH0sXG5cdFx0XHRcIi5jYWxlbmRhci1tb250aC13ZWVrLW51bWJlclwiOiB7XG5cdFx0XHRcdFwiZm9udC1zaXplXCI6IFwiMTBweFwiLFxuXHRcdFx0XHRvcGFjaXR5OiBcIjAuOFwiLFxuXHRcdFx0XHR0b3A6IFwiM3B4XCIsXG5cdFx0XHRcdGxlZnQ6IFwiM3B4XCIsXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0XCIuY3Vyc29yLWdyYWJiaW5nICpcIjoge1xuXHRcdFx0Y3Vyc29yOiBcImdyYWJiaW5nICFpbXBvcnRhbnRcIixcblx0XHR9LFxuXHRcdC8vIFRoaXMgaXMgYXBwbGllZCB0byBlbGVtZW50cyB0aGF0IHNob3VsZCBpbmRpY2F0ZSB0aGV5IHdpbGwgYmUgZHJhZ2dhYmxlIHdoZW4gc29tZSBrZXkgaXMgcHJlc3NlZC5cblx0XHQvLyBJZGVhbGx5IHdlIHdvdWxkIHVzZSBjdXJzb3I6IGdyYWIgaGVyZSwgYnV0IGl0IGRvZXNuJ3Qgc2VlbSB0byBiZSBzdXBwb3J0ZWQgaW4gZWxlY3Ryb25cblx0XHRcIi5kcmFnLW1vZC1rZXkgKlwiOiB7XG5cdFx0XHRjdXJzb3I6IFwiY29weSAhaW1wb3J0YW50XCIsXG5cdFx0fSxcblx0XHQvL1dlIHVzIHRoaXMgY2xhc3MgdG8gaGlkZSBjb250ZW50cyB0aGF0IHNob3VsZCBqdXN0IGJlIHZpc2libGUgZm9yIHByaW50aW5nXG5cdFx0XCIubm9zY3JlZW5cIjoge1xuXHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0fSxcblx0XHRcIkBtZWRpYSBwcmludFwiOiB7XG5cdFx0XHRcIi5jb2xvci1hZGp1c3QtZXhhY3RcIjoge1xuXHRcdFx0XHRcImNvbG9yLWFkanVzdFwiOiBcImV4YWN0XCIsXG5cdFx0XHRcdFwiLXdlYmtpdC1wcmludC1jb2xvci1hZGp1c3RcIjogXCJleGFjdFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLm5vcHJpbnRcIjoge1xuXHRcdFx0XHRkaXNwbGF5OiBcIm5vbmUgIWltcG9ydGFudFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLm5vc2NyZWVuXCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJpbml0aWFsXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIucHJpbnRcIjoge1xuXHRcdFx0XHRjb2xvcjogXCJibGFja1wiLFxuXHRcdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogXCJ3aGl0ZVwiLFxuXHRcdFx0XHRkaXNwbGF5OiBcImJsb2NrXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCJodG1sLCBib2R5XCI6IHtcblx0XHRcdFx0cG9zaXRpb246IFwiaW5pdGlhbFwiLFxuXHRcdFx0XHRvdmVyZmxvdzogXCJ2aXNpYmxlICFpbXBvcnRhbnRcIixcblx0XHRcdFx0Y29sb3I6IGxpZ2h0VGhlbWUuY29udGVudF9mZyxcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IGAke2xpZ2h0VGhlbWUuY29udGVudF9iZ30gIWltcG9ydGFudGAsXG5cdFx0XHR9LFxuXHRcdFx0Ly8gb3ZlcndyaXRlIHBvc2l0aW9uIFwiZml4ZWRcIiBvdGhlcndpc2Ugb25seSBvbmUgcGFnZSB3aWxsIGJlIHByaW50ZWQuXG5cdFx0XHRcIi5oZWFkZXItbmF2XCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIubWFpbi12aWV3XCI6IHtcblx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRwb3NpdGlvbjogXCJzdGF0aWMgIWltcG9ydGFudFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLmRyb3Bkb3duLXBhbmVsXCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIuZmlsbC1hYnNvbHV0ZVwiOiB7XG5cdFx0XHRcdHBvc2l0aW9uOiBcInN0YXRpYyAhaW1wb3J0YW50XCIsXG5cdFx0XHRcdGRpc3BsYXk6IFwiaW5pdGlhbFwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLnZpZXctY29sdW1uc1wiOiB7XG5cdFx0XHRcdHdpZHRoOiBcIjEwMCUgIWltcG9ydGFudFwiLFxuXHRcdFx0XHR0cmFuc2Zvcm06IFwiaW5pdGlhbCAhaW1wb3J0YW50XCIsXG5cdFx0XHRcdGRpc3BsYXk6IFwiaW5pdGlhbFwiLFxuXHRcdFx0XHRwb3NpdGlvbjogXCJpbml0aWFsXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIudmlldy1jb2x1bW46bnRoLWNoaWxkKDEpLCAudmlldy1jb2x1bW46bnRoLWNoaWxkKDIpXCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIudmlldy1jb2x1bW5cIjoge1xuXHRcdFx0XHR3aWR0aDogXCIxMDAlICFpbXBvcnRhbnRcIixcblx0XHRcdH0sXG5cdFx0XHRcIiNtYWlsLXZpZXdlclwiOiB7XG5cdFx0XHRcdG92ZXJmbG93OiBcInZpc2libGVcIixcblx0XHRcdFx0ZGlzcGxheTogXCJibG9ja1wiLFxuXHRcdFx0fSxcblx0XHRcdFwiI21haWwtYm9keVwiOiB7XG5cdFx0XHRcdG92ZXJmbG93OiBcInZpc2libGVcIixcblx0XHRcdH0sXG5cdFx0XHRcIiNsb2dpbi12aWV3XCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIuZGlhbG9nLWhlYWRlclwiOiB7XG5cdFx0XHRcdGRpc3BsYXk6IFwibm9uZVwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLmRpYWxvZy1jb250YWluZXJcIjoge1xuXHRcdFx0XHRvdmVyZmxvdzogXCJ2aXNpYmxlXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiBcInN0YXRpYyAhaW1wb3J0YW50XCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIjd2l6YXJkLXBhZ2luZ1wiOiB7XG5cdFx0XHRcdGRpc3BsYXk6IFwibm9uZVwiLFxuXHRcdFx0fSxcblx0XHRcdFwiYnV0dG9uOm5vdCgucHJpbnQpXCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJub25lXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIuYm90dG9tLW5hdlwiOiB7XG5cdFx0XHRcdGRpc3BsYXk6IFwibm9uZVwiLFxuXHRcdFx0fSxcblx0XHRcdFwiLm1vYmlsZSAudmlldy1jb2x1bW46bnRoLWNoaWxkKDIpXCI6IHtcblx0XHRcdFx0ZGlzcGxheTogXCJpbml0aWFsXCIsXG5cdFx0XHR9LFxuXHRcdFx0XCIuZm9sZGVyLWNvbHVtblwiOiB7XG5cdFx0XHRcdGRpc3BsYXk6IFwibm9uZVwiLFxuXHRcdFx0fSxcblx0XHRcdHByZToge1xuXHRcdFx0XHRcIndvcmQtYnJlYWtcIjogXCJub3JtYWxcIixcblx0XHRcdFx0XCJvdmVyZmxvdy13cmFwXCI6IFwiYW55d2hlcmVcIixcblx0XHRcdFx0XCJ3aGl0ZS1zcGFjZVwiOiBcImJyZWFrLXNwYWNlc1wiLFxuXHRcdFx0fSxcblx0XHR9LFxuXHRcdC8vIGRldGVjdCB3ZWJraXQgYXV0b2ZpbGxzOyBzZWUgVGV4dEZpZWxkIGFuZCBodHRwczovL21lZGl1bS5jb20vQGJydW5uL2RldGVjdGluZy1hdXRvZmlsbGVkLWZpZWxkcy1pbi1qYXZhc2NyaXB0LWFlZDU5OGQyNWRhN1xuXHRcdFwiQGtleWZyYW1lcyBvbkF1dG9GaWxsU3RhcnRcIjoge1xuXHRcdFx0ZnJvbToge1xuXHRcdFx0XHQvKiovXG5cdFx0XHR9LFxuXHRcdFx0dG86IHtcblx0XHRcdFx0LyoqL1xuXHRcdFx0fSxcblx0XHR9LFxuXHRcdFwiQGtleWZyYW1lcyBvbkF1dG9GaWxsQ2FuY2VsXCI6IHtcblx0XHRcdGZyb206IHtcblx0XHRcdFx0LyoqL1xuXHRcdFx0fSxcblx0XHRcdHRvOiB7XG5cdFx0XHRcdC8qKi9cblx0XHRcdH0sXG5cdFx0fSxcblx0XHQvLyB1c2UgdGhlIGFuaW1hdGlvbnMgYXMgaG9va3MgZm9yIEpTIHRvIGNhcHR1cmUgJ2FuaW1hdGlvbnN0YXJ0JyBldmVudHNcblx0XHRcImlucHV0Oi13ZWJraXQtYXV0b2ZpbGxcIjoge1xuXHRcdFx0XCJhbmltYXRpb24tbmFtZVwiOiBcIm9uQXV0b0ZpbGxTdGFydFwiLFxuXHRcdH0sXG5cdFx0XCJpbnB1dDpub3QoOi13ZWJraXQtYXV0b2ZpbGwpXCI6IHtcblx0XHRcdFwiYW5pbWF0aW9uLW5hbWVcIjogXCJvbkF1dG9GaWxsQ2FuY2VsXCIsXG5cdFx0fSxcblx0XHQvLyBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIE91dGxvb2sgMjAxMC8yMDEzIGVtYWlscy4gaGF2ZSBhIG5lZ2F0aXZlIGluZGVudGF0aW9uICgxOC4wcHQpIG9uIGVhY2ggbGlzdCBlbGVtZW50IGFuZCBhZGRpdGlvbmFsbHkgdGhpcyBjbGFzc1xuXHRcdC8vIHdlIHN0cmlwIGFsbCBnbG9iYWwgc3R5bGUgZGVmaW5pdGlvbnMsIHNvIHRoZSBsaXN0IGVsZW1lbnRzIGFyZSBvbmx5IGluZGVudGVkIHRvIHRoZSBsZWZ0IGlmIHdlIGRvIG5vdCBhbGxvdyB0aGUgTXNvTGlzdFBhcmFncmFwaCBjbGFzc2VzXG5cdFx0Ly8gdGhleSBhcmUgd2hpdGVsaXN0ZWQgaW4gSHRtbFNhbml0aXplci5qc1xuXHRcdFwiLk1zb0xpc3RQYXJhZ3JhcGgsIC5Nc29MaXN0UGFyYWdyYXBoQ3hTcEZpcnN0LCAuTXNvTGlzdFBhcmFncmFwaEN4U3BNaWRkbGUsIC5Nc29MaXN0UGFyYWdyYXBoQ3hTcExhc3RcIjoge1xuXHRcdFx0XCJtYXJnaW4tbGVmdFwiOiBcIjM2LjBwdFwiLFxuXHRcdH0sXG5cdFx0XCJzcGFuLnZlcnRpY2FsLXRleHRcIjoge1xuXHRcdFx0dHJhbnNmb3JtOiBcInJvdGF0ZSgxODBkZWcpXCIsXG5cdFx0XHRcIndyaXRpbmctbW9kZVwiOiBcInZlcnRpY2FsLXJsXCIsXG5cdFx0fSxcblx0XHRcInVsLnVzYWdlLXRlc3Qtb3B0LWluLWJ1bGxldHNcIjoge1xuXHRcdFx0bWFyZ2luOiBcIjAgYXV0b1wiLFxuXHRcdFx0XCJsaXN0LXN0eWxlXCI6IFwiZGlzY1wiLFxuXHRcdFx0XCJ0ZXh0LWFsaWduXCI6IFwibGVmdFwiLFxuXHRcdH0sXG5cdFx0XCIuYm9udXMtbW9udGhcIjoge1xuXHRcdFx0YmFja2dyb3VuZDogdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9iZyxcblx0XHRcdHdpZHRoOiBweCgxMDApLFxuXHRcdFx0XCJtaW4td2lkdGhcIjogcHgoMTAwKSxcblx0XHRcdGhlaWdodDogcHgoMTAwKSxcblx0XHRcdFwibWluLWhlaWdodFwiOiBweCgxMDApLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KDEwMCksXG5cdFx0fSxcblx0XHRcIi5kYXktZXZlbnRzLWluZGljYXRvclwiOiB7XG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogdGhlbWUuY29udGVudF9hY2NlbnQsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogXCI1MCVcIixcblx0XHRcdGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG5cdFx0XHRoZWlnaHQ6IFwiNXB4XCIsXG5cdFx0XHR3aWR0aDogXCI1cHhcIixcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRib3R0b206IDAsXG5cdFx0XHRtYXJnaW46IFwiMCBhdXRvXCIsXG5cdFx0XHRsZWZ0OiAwLFxuXHRcdFx0cmlnaHQ6IDAsXG5cdFx0fSxcblx0XHRcIi5mYWRlZC1kYXlcIjoge1xuXHRcdFx0Y29sb3I6IHRoZW1lLm5hdmlnYXRpb25fbWVudV9pY29uLFxuXHRcdH0sXG5cdFx0XCIuZmFkZWQtdGV4dFwiOiB7XG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9tZXNzYWdlX2JnLFxuXHRcdH0sXG5cdFx0XCIuc3ZnLXRleHQtY29udGVudC1iZyB0ZXh0XCI6IHtcblx0XHRcdGZpbGw6IHRoZW1lLmNvbnRlbnRfYmcsXG5cdFx0fSxcblx0XHRcIi5vdmVyZmxvdy1hdXRvXCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImF1dG9cIixcblx0XHR9LFxuXHRcdFwiLmZsb2F0LWFjdGlvbi1idXR0b25cIjoge1xuXHRcdFx0cG9zaXRpb246IFwiZml4ZWRcIixcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBcIjI1JVwiLFxuXHRcdH0sXG5cdFx0XCIucG9zYi1tbFwiOiB7XG5cdFx0XHRib3R0b206IHB4KHNpemUudnBhZF9tbCksXG5cdFx0fSxcblx0XHRcIi5wb3NyLW1sXCI6IHtcblx0XHRcdHJpZ2h0OiBweChzaXplLnZwYWRfbWwpLFxuXHRcdH0sXG5cdFx0XCIubWItc21hbGwtbGluZS1oZWlnaHRcIjoge1xuXHRcdFx0XCJtYXJnaW4tYm90dG9tXCI6IHB4KHNpemUubGluZV9oZWlnaHQgKiBzaXplLmZvbnRfc2l6ZV9zbWFsbCksXG5cdFx0fSxcblx0XHRcIi50dXRhdWktY2FyZC1jb250YWluZXJcIjoge1xuXHRcdFx0XCJib3gtc2l6aW5nXCI6IFwiYm9yZGVyLWJveFwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfYmcsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX21lZGl1bSksXG5cdFx0XHRwYWRkaW5nOiBweChzaXplLnZwYWRfc21hbGwpLFxuXHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmVcIixcblx0XHRcdGhlaWdodDogXCJmaXQtY29udGVudFwiLFxuXHRcdH0sXG5cdFx0XCIudHV0YXVpLWNhcmQtY29udGFpbmVyLWRpdmlkZVwiOiB7XG5cdFx0XHRwYWRkaW5nOiBcIjBcIixcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS1jYXJkLWNvbnRhaW5lci1kaXZpZGUgPiAqOm5vdCg6bGFzdC1jaGlsZClcIjoge1xuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IFwiMFwiLFxuXHRcdFx0XCJib3JkZXItYm90dG9tXCI6IGAxcHggc29saWQgJHt0aGVtZS5idXR0b25fYnViYmxlX2JnfWAsXG5cdFx0fSxcblx0XHRcIi50dXRhdWktdGV4dC1maWVsZCwgLmNoaWxkLXRleHQtZWRpdG9yIFtyb2xlPSd0ZXh0Ym94J11cIjoge1xuXHRcdFx0ZGlzcGxheTogXCJibG9ja1wiLFxuXHRcdFx0XCJib3gtc2l6aW5nXCI6IFwiYm9yZGVyLWJveFwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdGJvcmRlcjogXCJub25lXCIsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX21lZGl1bSksXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9mZyxcblx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdHBhZGRpbmc6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0XHR0cmFuc2l0aW9uOiBgYmFja2dyb3VuZC1jb2xvciAuMXMgZWFzZS1vdXRgLFxuXHRcdFx0XCJjYXJldC1jb2xvclwiOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLmNoaWxkLXRleHQtZWRpdG9yIFtyb2xlPSd0ZXh0Ym94J106Zm9jdXMtdmlzaWJsZVwiOiB7XG5cdFx0XHRvdXRsaW5lOiBcIm1lZGl1bSBpbnZlcnQgY29sb3JcIixcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS10ZXh0LWZpZWxkOmZvY3VzLCAuY2hpbGQtdGV4dC1lZGl0b3IgW3JvbGU9J3RleHRib3gnXTpmb2N1c1wiOiB7XG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogdGhlbWUuYnV0dG9uX2J1YmJsZV9iZyxcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS10ZXh0LWZpZWxkOjpwbGFjZWhvbGRlclwiOiB7XG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9tZXNzYWdlX2JnLFxuXHRcdH0sXG5cdFx0XCIudGV4dC1lZGl0b3ItcGxhY2Vob2xkZXJcIjoge1xuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdHRvcDogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHRcdGxlZnQ6IHB4KHNpemUudnBhZF9zbWFsbCksXG5cdFx0XHRjb2xvcjogdGhlbWUuY29udGVudF9tZXNzYWdlX2JnLFxuXHRcdH0sXG5cdFx0XCIudHV0YXVpLXN3aXRjaFwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJjZW50ZXJcIixcblx0XHRcdGdhcDogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS10b2dnbGUtcGlsbFwiOiB7XG5cdFx0XHRwb3NpdGlvbjogXCJyZWxhdGl2ZVwiLFxuXHRcdFx0ZGlzcGxheTogXCJibG9ja1wiLFxuXHRcdFx0d2lkdGg6IFwiNDUuNXB4XCIsXG5cdFx0XHRoZWlnaHQ6IFwiMjhweFwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLmNvbnRlbnRfbWVzc2FnZV9iZyxcblx0XHRcdFwiYm9yZGVyLXJhZGl1c1wiOiBweChzaXplLnZwYWRfc21hbGwgKiA0KSxcblx0XHRcdHRyYW5zaXRpb246IGBiYWNrZ3JvdW5kLWNvbG9yICR7RGVmYXVsdEFuaW1hdGlvblRpbWV9bXMgZWFzZS1vdXRgLFxuXHRcdH0sXG5cdFx0XCIudHV0YXVpLXRvZ2dsZS1waWxsOmFmdGVyXCI6IHtcblx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRjb250ZW50OiBcIicnXCIsXG5cdFx0XHR3aWR0aDogXCIyMXB4XCIsXG5cdFx0XHRoZWlnaHQ6IFwiMjFweFwiLFxuXHRcdFx0dG9wOiBcIjUwJVwiLFxuXHRcdFx0XCItd2Via2l0LXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZVkoLTUwJSlcIixcblx0XHRcdFwiLW1vei10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGVZKC01MCUpXCIsXG5cdFx0XHRcIi1tcy10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGVZKC01MCUpXCIsXG5cdFx0XHR0cmFuc2Zvcm06IFwidHJhbnNsYXRlWSgtNTAlKVwiLFxuXHRcdFx0bWFyZ2luOiBcIjAgNHB4XCIsXG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogXCIjZmZmXCIsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogXCI1MCVcIixcblx0XHRcdGxlZnQ6IDAsXG5cdFx0XHR0cmFuc2l0aW9uOiBgbGVmdCAke0RlZmF1bHRBbmltYXRpb25UaW1lfW1zIGVhc2Utb3V0YCxcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS10b2dnbGUtcGlsbC5jaGVja2VkXCI6IHtcblx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS10b2dnbGUtcGlsbC5jaGVja2VkOmFmdGVyXCI6IHtcblx0XHRcdGxlZnQ6IFwiY2FsYygxMDAlIC0gMjlweClcIixcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS10b2dnbGUtcGlsbCBpbnB1dFt0eXBlPSdjaGVja2JveCddXCI6IHtcblx0XHRcdFwiei1pbmRleFwiOiBcIi0xXCIsXG5cdFx0XHR2aXNpYmlsaXR5OiBcImhpZGRlblwiLFxuXHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS1zZWxlY3QtdHJpZ2dlclwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImZsZXhcIixcblx0XHRcdFwianVzdGlmeS1jb250ZW50XCI6IFwic3BhY2UtYmV0d2VlblwiLFxuXHRcdFx0XCJhbGlnbi1pdGVtc1wiOiBcImNlbnRlclwiLFxuXHRcdFx0Z2FwOiBweChzaXplLnZwYWRfc21hbGwpLFxuXHRcdH0sXG5cdFx0XCIuZml0LWNvbnRlbnRcIjoge1xuXHRcdFx0d2lkdGg6IFwiZml0LWNvbnRlbnRcIixcblx0XHR9LFxuXHRcdFwiLnR1dGF1aS1idXR0b24tb3V0bGluZVwiOiB7XG5cdFx0XHRib3JkZXI6IFwiMnB4IHNvbGlkXCIsXG5cdFx0XHRcImJvcmRlci1yYWRpdXNcIjogcHgoc2l6ZS5ib3JkZXJfcmFkaXVzX21lZGl1bSksXG5cdFx0XHRwYWRkaW5nOiBweChzaXplLmJvcmRlcl9yYWRpdXNfbWVkaXVtKSxcblx0XHRcdFwidGV4dC1hbGlnblwiOiBcImNlbnRlclwiLFxuXHRcdH0sXG5cdFx0XCIudW5zdHlsZWQtbGlzdFwiOiB7XG5cdFx0XHRcImxpc3Qtc3R5bGVcIjogXCJub25lXCIsXG5cdFx0XHRtYXJnaW46IDAsXG5cdFx0XHRwYWRkaW5nOiAwLFxuXHRcdH0sXG5cdFx0XCIudGltZS1zZWxlY3Rpb24tZ3JpZFwiOiB7XG5cdFx0XHRkaXNwbGF5OiBcImdyaWRcIixcblx0XHRcdFwiZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zXCI6IFwiMmZyIDZmciAzZnJcIixcblx0XHRcdFwiZ3JpZC1nYXBcIjogcHgoc2l6ZS52cGFkX3NtYWxsKSxcblx0XHRcdFwiYWxpZ24taXRlbXNcIjogXCJjZW50ZXJcIixcblx0XHR9LFxuXHRcdFwiLnRpbWUtc2VsZWN0aW9uLWdyaWQgPiAqXCI6IHtcblx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XCJ3aGl0ZS1zcGFjZVwiOiBcIm5vd3JhcFwiLFxuXHRcdFx0XCJ0ZXh0LW92ZXJmbG93XCI6IFwiY2xpcFwiLFxuXHRcdH0sXG5cdFx0XCIuaW52aXNpYmxlXCI6IHtcblx0XHRcdGFsbDogXCJub25lXCIsXG5cdFx0XHRcImJhY2tncm91bmQtY29sb3JcIjogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdFx0Ym9yZGVyOiBcIm5vbmVcIixcblx0XHRcdGNvbG9yOiBcInRyYW5zcGFyZW50XCIsXG5cdFx0fSxcblx0XHRcIi5pbnZpc2libGU6OnNlbGVjdGlvblwiOiB7XG5cdFx0XHRhbGw6IFwibm9uZVwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdGJvcmRlcjogXCJub25lXCIsXG5cdFx0XHRjb2xvcjogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdH0sXG5cdFx0XCIuaW52aXNpYmxlOjotbW96LXNlbGVjdGlvblwiOiB7XG5cdFx0XHRhbGw6IFwibm9uZVwiLFxuXHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IFwidHJhbnNwYXJlbnRcIixcblx0XHRcdGJvcmRlcjogXCJub25lXCIsXG5cdFx0XHRjb2xvcjogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdH0sXG5cdFx0XCIudHJhbnNpdGlvbi10cmFuc2Zvcm1cIjoge1xuXHRcdFx0dHJhbnNpdGlvbjogYHRyYW5zZm9ybSAke0RlZmF1bHRBbmltYXRpb25UaW1lfW1zIGxpbmVhcmAsXG5cdFx0fSxcblx0XHRcIi5ib3JkZXItbm9uZVwiOiB7XG5cdFx0XHRib3JkZXI6IFwibm9uZVwiLFxuXHRcdH0sXG5cdFx0XCIuYmlnLXJhZGlvXCI6IHtcblx0XHRcdC8qIEluY3JlYXNlIHJhZGlvIGJ1dHRvbidzIHNpemUgKi9cblx0XHRcdHdpZHRoOiBcIjIwcHhcIixcblx0XHRcdGhlaWdodDogXCIyMHB4XCIsXG5cdFx0fSxcblx0XHRcIi5vdXRsaW5lZFwiOiB7XG5cdFx0XHRib3JkZXI6IGAycHggc29saWQgJHt0aGVtZS5jb250ZW50X2JvcmRlcn1gLFxuXHRcdFx0XCJib3JkZXItcmFkaXVzXCI6IHB4KHNpemUuYm9yZGVyX3JhZGl1c19tZWRpdW0pLFxuXHRcdH0sXG5cdFx0XCIuY2FwaXRhbGl6ZVwiOiB7XG5cdFx0XHRcInRleHQtdHJhbnNmb3JtXCI6IFwiY2FwaXRhbGl6ZVwiLFxuXHRcdH0sXG5cdFx0XCIuYm94LWNvbnRlbnRcIjoge1xuXHRcdFx0XCJib3gtc2l6aW5nXCI6IFwiY29udGVudC1ib3hcIixcblx0XHR9LFxuXHRcdFwiLmZpdC1oZWlnaHRcIjoge1xuXHRcdFx0aGVpZ2h0OiBcImZpdC1jb250ZW50XCIsXG5cdFx0fSxcblx0XHRcIi5taW4taC1zXCI6IHtcblx0XHRcdFwibWluLWhlaWdodFwiOiBweChzaXplLnZwYWRfeGwgKiA0KSxcblx0XHR9LFxuXHRcdFwiLmJvcmRlci1jb250ZW50LW1lc3NhZ2UtYmdcIjoge1xuXHRcdFx0XCJib3JkZXItY29sb3JcIjogdGhlbWUuY29udGVudF9tZXNzYWdlX2JnLFxuXHRcdH0sXG5cdFx0XCIuYm9yZGVyLXJhZGl1cy1ib3R0b20tMFwiOiB7XG5cdFx0XHRcImJvcmRlci1ib3R0b20tcmlnaHQtcmFkaXVzXCI6IHB4KDApLFxuXHRcdFx0XCJib3JkZXItYm90dG9tLWxlZnQtcmFkaXVzXCI6IHB4KDApLFxuXHRcdH0sXG5cdH1cbn0pXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQSxzQkFBc0I7TUFDVCxXQUFXO0NBQ3ZC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
import { __toESM } from "./chunk-chunk.js";
import { assertMainOrNode, isIOSApp } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { NBSP, assertNotNull, resolveMaybeLazy } from "./dist2-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import { AlphaEnum, TransformEnum, alpha, animations, ease, styles, transform } from "./styles-chunk.js";
import { theme } from "./theme-chunk.js";
import { FeatureType, Keys } from "./TutanotaConstants-chunk.js";
import { keyManager } from "./KeyManager-chunk.js";
import { windowFacade } from "./WindowFacade-chunk.js";
import { LayerType } from "./RootView-chunk.js";
import { px, size } from "./size-chunk.js";
import { getSafeAreaInsetLeft } from "./HtmlUtils-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { BaseButton, ButtonColor, ButtonType } from "./Button-chunk.js";
import { Icons } from "./Icons-chunk.js";
import { DialogHeaderBar } from "./DialogHeaderBar-chunk.js";
import { Dialog, DialogType, createDropdown, pureComponent } from "./Dialog-chunk.js";
import { BootIcons, progressIcon } from "./Icon-chunk.js";
import { AriaLandmarks, landmarkAttrs } from "./AriaUtils-chunk.js";
import { IconButton } from "./IconButton-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { ColumnEmptyMessageBox } from "./ColumnEmptyMessageBox-chunk.js";
import { NavButton, NavButtonColor, isSelectedPrefix } from "./NavButton-chunk.js";
import { CALENDAR_PREFIX, CONTACTLIST_PREFIX, CONTACTS_PREFIX, LogoutUrl, MAIL_PREFIX, SETTINGS_PREFIX } from "./RouteChange-chunk.js";
import { OfflineIndicator, ProgressBar } from "./mailLocator-chunk.js";
import { DesktopBaseHeader } from "./LoginScreenHeader-chunk.js";
import { showSupportDialog$1 as showSupportDialog, showUpgradeDialog } from "./NavFunctions-chunk.js";
import { CounterBadge } from "./CounterBadge-chunk.js";

//#region src/common/gui/base/NavBar.ts
assertMainOrNode();
var NavBar = class {
	view({ children }) {
		return mithril_default("nav.nav-bar.flex-end", landmarkAttrs(AriaLandmarks.Navigation, "top"), children.map((child) => mithril_default(".plr-nav-button", child)));
	}
};

//#endregion
//#region src/common/gui/Header.ts
assertMainOrNode();
var Header = class {
	view({ attrs }) {
		return mithril_default(DesktopBaseHeader, [mithril_default(ProgressBar, { progress: attrs.offlineIndicatorModel.getProgress() }), this.renderNavigation(attrs)]);
	}
	/**
	* render the search and navigation bar in three-column layouts. if there is a navigation, also render an offline indicator.
	* @private
	*/
	renderNavigation(attrs) {
		return mithril_default(".flex-grow.flex.justify-end.items-center", [
			attrs.searchBar ? attrs.searchBar() : null,
			mithril_default(OfflineIndicator, attrs.offlineIndicatorModel.getCurrentAttrs()),
			mithril_default(".nav-bar-spacer"),
			mithril_default(NavBar, this.renderButtons())
		]);
	}
	renderButtons() {
		return [
			mithril_default(NavButton, {
				label: "emails_label",
				icon: () => BootIcons.Mail,
				href: MAIL_PREFIX,
				isSelectedPrefix: MAIL_PREFIX,
				colors: NavButtonColor.Header
			}),
			locator.logins.isInternalUserLoggedIn() && !locator.logins.isEnabled(FeatureType.DisableContacts) ? mithril_default(NavButton, {
				label: "contacts_label",
				icon: () => BootIcons.Contacts,
				href: CONTACTS_PREFIX,
				isSelectedPrefix: isSelectedPrefix(CONTACTS_PREFIX) || isSelectedPrefix(CONTACTLIST_PREFIX),
				colors: NavButtonColor.Header
			}) : null,
			locator.logins.isInternalUserLoggedIn() && !locator.logins.isEnabled(FeatureType.DisableCalendar) ? mithril_default(NavButton, {
				label: "calendar_label",
				icon: () => BootIcons.Calendar,
				href: CALENDAR_PREFIX,
				colors: NavButtonColor.Header,
				click: () => mithril_default.route.get().startsWith(CALENDAR_PREFIX)
			}) : null
		];
	}
};

//#endregion
//#region src/common/gui/base/ViewColumn.ts
assertMainOrNode();
let ColumnType = function(ColumnType$1) {
	ColumnType$1[ColumnType$1["Background"] = 1] = "Background";
	ColumnType$1[ColumnType$1["Foreground"] = 0] = "Foreground";
	return ColumnType$1;
}({});
var ViewColumn = class {
	component;
	columnType;
	minWidth;
	maxWidth;
	headerCenter;
	ariaLabel;
	width;
	offset;
	domColumn = null;
	isInForeground;
	isVisible;
	ariaRole = null;
	/**
	* Create a view column.
	* @param component The component that is rendered as this column
	* @param columnType The type of the view column.
	* @param minWidth The minimum allowed width for the view column.
	* @param headerCenter returned in {@link getTitle}. Used in ARIA landmark unless overriden by {@link ariaLabel}
	* @param ariaLabel used in ARIA landmark
	* @param maxWidth The maximum allowed width for the view column.
	* @param headerCenter The title of the view column.
	* @param ariaLabel The label of the view column to be read by screen readers. Defaults to headerCenter if not specified.
	*/
	constructor(component, columnType, { minWidth, maxWidth, headerCenter, ariaLabel = () => lang.getTranslationText(this.getTitle()) }) {
		this.component = component;
		this.columnType = columnType;
		this.minWidth = minWidth;
		this.maxWidth = maxWidth;
		this.headerCenter = headerCenter || "emptyString_msg";
		this.ariaLabel = ariaLabel ?? null;
		this.width = minWidth;
		this.offset = 0;
		this.isInForeground = false;
		this.isVisible = false;
		this.view = this.view.bind(this);
	}
	view() {
		const zIndex = !this.isVisible && this.columnType === ColumnType.Foreground ? LayerType.ForegroundMenu + 1 : "";
		const landmark = this.ariaRole ? landmarkAttrs(this.ariaRole, this.ariaLabel ? this.ariaLabel() : lang.getTranslationText(this.getTitle())) : {};
		return mithril_default(".view-column.fill-absolute", {
			...landmark,
			"data-testid": lang.getTranslationText(this.getTitle()),
			inert: !this.isVisible && !this.isInForeground,
			oncreate: (vnode) => {
				this.domColumn = vnode.dom;
				this.domColumn.style.transform = this.columnType === ColumnType.Foreground ? "translateX(" + this.getOffsetForeground(this.isInForeground) + "px)" : "";
				if (this.ariaRole === AriaLandmarks.Main) this.focus();
			},
			style: {
				zIndex,
				width: this.width + "px",
				left: this.offset + "px"
			}
		}, mithril_default(this.component));
	}
	getTitle() {
		return resolveMaybeLazy(this.headerCenter);
	}
	getOffsetForeground(foregroundState) {
		if (this.isVisible || foregroundState) return 0;
else return -this.width;
	}
	focus() {
		this.domColumn?.focus();
	}
};

//#endregion
//#region src/common/gui/nav/ViewSlider.ts
assertMainOrNode();
const gestureInfoFromTouch = (touch) => ({
	x: touch.pageX,
	y: touch.pageY,
	time: performance.now(),
	identifier: touch.identifier
});
var ViewSlider = class {
	mainColumn;
	focusedColumn;
	visibleBackgroundColumns;
	domSlidingPart;
	view;
	busy;
	isModalBackgroundVisible;
	resizeListener = () => this.updateVisibleBackgroundColumns();
	handleHistoryEvent = () => {
		const prev = this.getPreviousColumn();
		if (prev != null && prev.columnType !== ColumnType.Foreground) {
			this.focusPreviousColumn();
			return false;
		} else if (this.isForegroundColumnFocused()) {
			this.focusNextColumn();
			return false;
		}
		return true;
	};
	/** Creates the event listeners as soon as this component is loaded (invoked by mithril)*/
	oncreate = () => {
		this.updateVisibleBackgroundColumns();
		windowFacade.addResizeListener(this.resizeListener);
		windowFacade.addHistoryEventListener(this.handleHistoryEvent);
	};
	/** Removes the registered event listeners as soon as this component is unloaded (invoked by mithril)*/
	onremove = () => {
		windowFacade.removeResizeListener(this.resizeListener);
		windowFacade.removeHistoryEventListener(this.handleHistoryEvent);
	};
	getSideColDom = () => this.viewColumns[0].domColumn;
	constructor(viewColumns, enableDrawer = true) {
		this.viewColumns = viewColumns;
		this.enableDrawer = enableDrawer;
		this.mainColumn = assertNotNull(viewColumns.find((column) => column.columnType === ColumnType.Background), "there was no backgroung column passed to viewslider");
		this.focusedColumn = this.mainColumn;
		this.visibleBackgroundColumns = [];
		this.updateVisibleBackgroundColumns();
		this.busy = Promise.resolve();
		this.isModalBackgroundVisible = false;
		for (const column of this.viewColumns) column.ariaRole = this.getColumnRole(column);
		this.view = ({ attrs }) => {
			const mainSliderColumns = this.getColumnsForMainSlider();
			const allBackgroundColumnsAreVisible = this.visibleBackgroundColumns.length === mainSliderColumns.length;
			return mithril_default(".fill-absolute.flex.col", {
				oncreate: (vnode) => {
					if (this.enableDrawer) this.attachTouchHandler(vnode.dom);
				},
				onremove: () => {
					if (this.viewColumns[0].columnType === ColumnType.Foreground && this.viewColumns[0].isInForeground) {
						this.viewColumns[0].isInForeground = false;
						this.isModalBackgroundVisible = false;
					}
				}
			}, [
				styles.isUsingBottomNavigation() ? null : attrs.header,
				mithril_default(".view-columns.flex-grow.rel", {
					oncreate: (vnode) => {
						this.domSlidingPart = vnode.dom;
					},
					style: {
						width: this.getWidth() + "px",
						transform: "translateX(" + this.getOffset(this.visibleBackgroundColumns[0]) + "px)"
					}
				}, mainSliderColumns.map((column, index) => mithril_default(column, { rightBorder: allBackgroundColumnsAreVisible && index !== mainSliderColumns.length - 1 }))),
				styles.isUsingBottomNavigation() && !client.isCalendarApp() ? attrs.bottomNav : null,
				this.getColumnsForOverlay().map((c) => mithril_default(c, {})),
				this.enableDrawer ? this.createModalBackground() : null
			]);
		};
	}
	getColumnRole(column) {
		if (column.columnType === ColumnType.Foreground) return null;
		return this.mainColumn === column ? AriaLandmarks.Main : AriaLandmarks.Region;
	}
	getMainColumn() {
		return this.mainColumn;
	}
	getColumnsForMainSlider() {
		return this.viewColumns.filter((c) => c.columnType === ColumnType.Background || c.isVisible);
	}
	getColumnsForOverlay() {
		return this.viewColumns.filter((c) => c.columnType === ColumnType.Foreground && !c.isVisible);
	}
	createModalBackground() {
		if (this.isModalBackgroundVisible) return [mithril_default(".fill-absolute.will-change-alpha", {
			style: { zIndex: LayerType.ForegroundMenu },
			oncreate: (vnode) => {
				this.busy.then(() => animations.add(vnode.dom, alpha(AlphaEnum.BackgroundColor, theme.modal_bg, 0, .5)));
			},
			onbeforeremove: (vnode) => {
				return this.busy.then(() => animations.add(vnode.dom, alpha(AlphaEnum.BackgroundColor, theme.modal_bg, .5, 0)));
			},
			onclick: () => {
				this.focus(this.visibleBackgroundColumns[0]);
			}
		})];
else return [];
	}
	updateVisibleBackgroundColumns() {
		this.focusedColumn = this.focusedColumn || this.mainColumn;
		let visibleColumns = [this.focusedColumn.columnType === ColumnType.Background ? this.focusedColumn : this.mainColumn];
		let remainingSpace = window.innerWidth - visibleColumns[0].minWidth;
		let nextVisibleColumn = this.getNextVisibleColumn(visibleColumns, this.viewColumns);
		while (nextVisibleColumn && remainingSpace >= nextVisibleColumn.minWidth) {
			visibleColumns.push(nextVisibleColumn);
			remainingSpace -= nextVisibleColumn.minWidth;
			nextVisibleColumn = this.getNextVisibleColumn(visibleColumns, this.viewColumns);
		}
		visibleColumns.sort((a, b) => this.viewColumns.indexOf(a) - this.viewColumns.indexOf(b));
		this.distributeRemainingSpace(visibleColumns, remainingSpace);
		this.setWidthForHiddenColumns(visibleColumns);
		for (const column of this.viewColumns) column.isVisible = visibleColumns.includes(column);
		this.updateOffsets();
		this.visibleBackgroundColumns = visibleColumns;
		if (this.allColumnsVisible()) {
			this.focusedColumn.isInForeground = false;
			this.isModalBackgroundVisible = false;
			if (this.viewColumns[0].domColumn) this.viewColumns[0].domColumn.style.transform = "";
		}
		window.requestAnimationFrame(() => mithril_default.redraw());
	}
	getVisibleBackgroundColumns() {
		return this.visibleBackgroundColumns.slice();
	}
	isUsingOverlayColumns() {
		return this.viewColumns.every((c) => c.columnType !== ColumnType.Foreground || c.isVisible);
	}
	/**
	* Returns the next column which should become visible
	* @param visibleColumns All columns that will definitely be visible
	* @param allColumns All columns*
	*/
	getNextVisibleColumn(visibleColumns, allColumns) {
		let nextColumn = allColumns.find((column) => {
			return column.columnType === ColumnType.Background && visibleColumns.indexOf(column) < 0;
		});
		if (!nextColumn) nextColumn = allColumns.find((column) => {
			return column.columnType === ColumnType.Foreground && visibleColumns.indexOf(column) < 0;
		});
		return nextColumn ?? null;
	}
	getBackgroundColumns() {
		return this.viewColumns.filter((c) => c.columnType === ColumnType.Background);
	}
	/**
	* distributes the remaining space to all visible columns
	* @param visibleColumns
	* @param remainingSpace
	*/
	distributeRemainingSpace(visibleColumns, remainingSpace) {
		let spacePerColumn = remainingSpace / visibleColumns.length;
		for (const [index, visibleColumn] of visibleColumns.entries()) if (visibleColumns.length - 1 === index) visibleColumn.width = visibleColumn.minWidth + remainingSpace;
else {
			let spaceForThisColumn = Math.min(spacePerColumn, visibleColumn.maxWidth - visibleColumn.minWidth);
			remainingSpace -= spaceForThisColumn;
			visibleColumn.width = visibleColumn.minWidth + spaceForThisColumn;
		}
	}
	setWidthForHiddenColumns(visibleColumns) {
		if (this.viewColumns.length === visibleColumns.length) return;
		if (visibleColumns.length === 1) for (const column of this.viewColumns) column.width = visibleColumns[0].width;
		let foreGroundColumn = this.viewColumns.find((column) => column.columnType === ColumnType.Foreground);
		if (foreGroundColumn) {
			let remainingSpace = window.innerWidth - foreGroundColumn.minWidth - size.hpad_large;
			let additionalSpaceForColumn = Math.min(remainingSpace, foreGroundColumn.maxWidth - foreGroundColumn.minWidth);
			foreGroundColumn.width = foreGroundColumn.minWidth + additionalSpaceForColumn;
		}
	}
	async focus(viewColumn) {
		try {
			await this.busy;
			if (this.focusedColumn === viewColumn) return;
			if (this.focusedColumn.isInForeground) {
				this.busy = this.slideForegroundColumn(this.focusedColumn, false);
				await this.busy;
			}
			this.focusedColumn = viewColumn;
			if (viewColumn.columnType === ColumnType.Background && this.visibleBackgroundColumns.length === 1 && this.visibleBackgroundColumns.indexOf(viewColumn) < 0) {
				const currentOffset = this.domSlidingPart.getBoundingClientRect().left;
				this.busy = this.slideBackgroundColumns(viewColumn, currentOffset, this.getOffset(viewColumn));
			} else if (viewColumn.columnType === ColumnType.Foreground && this.visibleBackgroundColumns.indexOf(viewColumn) < 0) this.busy = this.slideForegroundColumn(viewColumn, true);
			await this.busy;
		} finally {
			mithril_default.redraw();
			viewColumn.focus();
		}
	}
	waitForAnimation() {
		return this.busy;
	}
	/**
	* Executes a slide animation for the background buttons.
	*/
	slideBackgroundColumns(nextVisibleViewColumn, oldOffset, newOffset) {
		return animations.add(this.domSlidingPart, transform(TransformEnum.TranslateX, oldOffset, newOffset), { easing: ease.inOut }).finally(() => {
			const [removed] = this.visibleBackgroundColumns.splice(0, 1, nextVisibleViewColumn);
			removed.isVisible = false;
			nextVisibleViewColumn.isVisible = true;
		});
	}
	/**
	* Executes a slide animation for the foreground button.
	*/
	slideForegroundColumn(foregroundColumn, toForeground) {
		if (!foregroundColumn.domColumn) return Promise.resolve();
		foregroundColumn.domColumn.style.visibility = "visible";
		const colRect = foregroundColumn.domColumn.getBoundingClientRect();
		const oldOffset = colRect.left;
		let newOffset = foregroundColumn.getOffsetForeground(toForeground);
		this.isModalBackgroundVisible = toForeground;
		return animations.add(assertNotNull(foregroundColumn.domColumn, "foreground column has no domcolumn"), transform(TransformEnum.TranslateX, oldOffset, newOffset), { easing: ease.in }).finally(() => {
			foregroundColumn.isInForeground = toForeground;
		});
	}
	updateOffsets() {
		let offset = 0;
		for (let column of this.viewColumns) if (column.columnType === ColumnType.Background || column.isVisible) {
			column.offset = offset;
			offset += column.width;
		}
	}
	getWidth() {
		let lastColumn = this.viewColumns[this.viewColumns.length - 1];
		return lastColumn.offset + lastColumn.width;
	}
	getOffset(column) {
		return 0 - column.offset;
	}
	isFocusPreviousPossible() {
		return this.getPreviousColumn() != null;
	}
	focusPreviousColumn() {
		if (this.isFocusPreviousPossible()) {
			window.getSelection()?.empty();
			return this.focus(assertNotNull(this.getPreviousColumn(), "previous column was null!"));
		} else return Promise.resolve();
	}
	focusNextColumn() {
		const indexOfCurrent = this.viewColumns.indexOf(this.focusedColumn);
		if (indexOfCurrent + 1 < this.viewColumns.length) this.focus(this.viewColumns[indexOfCurrent + 1]);
	}
	getPreviousColumn() {
		if (this.viewColumns.indexOf(this.visibleBackgroundColumns[0]) > 0 && !this.focusedColumn.isInForeground) {
			let visibleColumnIndex = this.viewColumns.indexOf(this.visibleBackgroundColumns[0]);
			return this.viewColumns[visibleColumnIndex - 1];
		}
		return null;
	}
	isFirstBackgroundColumnFocused() {
		return this.viewColumns.filter((column) => column.columnType === ColumnType.Background).indexOf(this.focusedColumn) === 0;
	}
	isForegroundColumnFocused() {
		return this.focusedColumn && this.focusedColumn.columnType === ColumnType.Foreground;
	}
	allColumnsVisible() {
		return this.visibleBackgroundColumns.length === this.viewColumns.length;
	}
	attachTouchHandler(element) {
		let lastGestureInfo;
		let oldGestureInfo;
		let initialGestureInfo;
		const VERTICAL = 1;
		const HORIZONTAL = 2;
		let directionLock = 0;
		const gestureEnd = (event) => {
			const safeLastGestureInfo = lastGestureInfo;
			const safeOldGestureInfo = oldGestureInfo;
			if (safeLastGestureInfo && safeOldGestureInfo && !this.allColumnsVisible()) {
				const touch = event.changedTouches[0];
				const mainCol = this.mainColumn.domColumn;
				const sideCol = this.getSideColDom();
				if (!mainCol || !sideCol) return;
				const mainColRect = mainCol.getBoundingClientRect();
				const velocity = (safeLastGestureInfo.x - safeOldGestureInfo.x) / (safeLastGestureInfo.time - safeOldGestureInfo.time);
				const show = () => {
					this.focusedColumn = this.viewColumns[0];
					this.busy = this.slideForegroundColumn(this.viewColumns[0], true);
					this.isModalBackgroundVisible = true;
				};
				const hide = () => {
					this.focusedColumn = this.viewColumns[1];
					this.busy = this.slideForegroundColumn(this.viewColumns[0], false);
					this.isModalBackgroundVisible = false;
				};
				if (this.getBackgroundColumns()[0].isVisible || this.focusedColumn.isInForeground) {
					if (velocity > .8) show();
else if (velocity < -.8 && directionLock !== VERTICAL) hide();
else if (touch.pageX > mainColRect.left + 100) show();
else if (directionLock !== VERTICAL) hide();
				} else if ((safeLastGestureInfo.x > window.innerWidth / 3 || velocity > .8) && directionLock !== VERTICAL) this.focusPreviousColumn();
else {
					const colRect = this.domSlidingPart.getBoundingClientRect();
					this.busy = this.slideBackgroundColumns(this.focusedColumn, colRect.left, -this.focusedColumn.offset);
					this.focus(this.focusedColumn);
				}
				this.busy.then(() => mithril_default.redraw());
			}
			if (safeLastGestureInfo && safeLastGestureInfo.identifier === event.changedTouches[0].identifier) {
				lastGestureInfo = null;
				oldGestureInfo = null;
				initialGestureInfo = null;
				directionLock = 0;
			}
		};
		const listeners = {
			touchstart: (event) => {
				if (lastGestureInfo) return;
				const mainCol = this.mainColumn.domColumn;
				const sideCol = this.getSideColDom();
				if (!mainCol || !sideCol || this.allColumnsVisible()) {
					lastGestureInfo = null;
					return;
				}
				if (event.touches.length === 1 && (this.viewColumns[0].isInForeground || event.touches[0].pageX < 40)) {
					if (!this.viewColumns[0].isInForeground) event.stopPropagation();
					lastGestureInfo = initialGestureInfo = gestureInfoFromTouch(event.touches[0]);
				}
			},
			touchmove: (event) => {
				const sideCol = this.getSideColDom();
				if (!sideCol || !this.mainColumn || this.allColumnsVisible()) return;
				const gestureInfo = lastGestureInfo;
				const safeInitialGestureInfo = initialGestureInfo;
				if (gestureInfo && safeInitialGestureInfo && event.touches.length === 1) {
					const touch = event.touches[0];
					const newTouchPos = touch.pageX;
					const sideColRect = sideCol.getBoundingClientRect();
					oldGestureInfo = lastGestureInfo;
					const safeLastInfo = lastGestureInfo = gestureInfoFromTouch(touch);
					if (directionLock === HORIZONTAL || directionLock !== VERTICAL && Math.abs(safeLastInfo.x - safeInitialGestureInfo.x) > 30) {
						directionLock = HORIZONTAL;
						if (this.getBackgroundColumns()[0].isVisible || this.focusedColumn.isInForeground) {
							const newTranslate = Math.min(sideColRect.left - (gestureInfo.x - newTouchPos), 0);
							sideCol.style.transform = `translateX(${newTranslate}px)`;
						} else {
							const slidingDomRect = this.domSlidingPart.getBoundingClientRect();
							const newTranslate = Math.max(slidingDomRect.left - (gestureInfo.x - newTouchPos), -this.focusedColumn.offset);
							this.domSlidingPart.style.transform = `translateX(${newTranslate}px)`;
						}
						if (event.cancelable !== false) event.preventDefault();
					} else if (directionLock !== VERTICAL && Math.abs(safeLastInfo.y - safeInitialGestureInfo.y) > 30) directionLock = VERTICAL;
					event.stopPropagation();
				}
			},
			touchend: gestureEnd,
			touchcancel: gestureEnd
		};
		for (let [name, listener] of Object.entries(listeners)) element.addEventListener(name, listener, true);
	}
};

//#endregion
//#region src/common/gui/MainCreateButton.ts
var MainCreateButton = class {
	view(vnode) {
		return mithril_default(BaseButton, {
			label: vnode.attrs.label,
			text: lang.get(vnode.attrs.label),
			onclick: vnode.attrs.click,
			class: `full-width border-radius-big center b flash ${vnode.attrs.class}`,
			style: {
				border: `2px solid ${theme.content_accent}`,
				height: px(size.button_height + size.vpad_xs * 2),
				color: theme.content_accent
			}
		});
	}
};

//#endregion
//#region src/common/misc/news/NewsList.ts
var NewsList = class {
	view(vnode) {
		if (vnode.attrs.liveNewsIds.length === 0) return mithril_default(ColumnEmptyMessageBox, {
			message: "noNews_msg",
			icon: Icons.Bulb,
			color: theme.content_message_bg
		});
		return mithril_default("", vnode.attrs.liveNewsIds.map((liveNewsId) => {
			const newsListItem = vnode.attrs.liveNewsListItems[liveNewsId.newsItemName];
			return mithril_default(".pt.pl-l.pr-l.flex.fill.border-grey.left.list-border-bottom", { key: liveNewsId.newsItemId }, newsListItem.render(liveNewsId));
		}));
	}
};

//#endregion
//#region src/common/misc/news/NewsDialog.ts
function showNewsDialog(newsModel) {
	const closeButton = {
		label: "close_alt",
		type: ButtonType.Secondary,
		click: () => {
			closeAction();
		}
	};
	const closeAction = () => {
		dialog.close();
	};
	const header = {
		left: [closeButton],
		middle: "news_label"
	};
	let loaded = false;
	newsModel.loadNewsIds().then(() => {
		loaded = true;
		mithril_default.redraw();
	});
	const child = { view: () => {
		return [mithril_default("", [loaded ? mithril_default(NewsList, {
			liveNewsIds: newsModel.liveNewsIds,
			liveNewsListItems: newsModel.liveNewsListItems
		}) : mithril_default(".flex-center.mt-l", mithril_default(".flex-v-center", [mithril_default(".full-width.flex-center", progressIcon()), mithril_default("p", lang.getTranslationText("pleaseWait_msg"))]))])];
	} };
	const dialog = new Dialog(DialogType.EditLarge, { view: () => {
		return mithril_default("", [mithril_default(DialogHeaderBar, header), mithril_default(".dialog-container.scroll", mithril_default(".fill-absolute", mithril_default(child)))]);
	} }).addShortcut({
		key: Keys.ESC,
		exec: () => {
			closeAction();
		},
		help: "close_alt"
	});
	dialog.show();
}

//#endregion
//#region src/common/gui/nav/DrawerMenu.ts
var DrawerMenu = class {
	view(vnode) {
		const { logins, newsModel, desktopSystemFacade } = vnode.attrs;
		const liveNewsCount = newsModel.liveNewsIds.length;
		const isInternalUser = logins.isInternalUserLoggedIn();
		const isLoggedIn = logins.isUserLoggedIn();
		const userController = logins.getUserController();
		return mithril_default("drawer-menu.flex.col.items-center.pt.pb", {
			...landmarkAttrs(AriaLandmarks.Contentinfo, "drawer menu"),
			style: {
				"padding-left": getSafeAreaInsetLeft(),
				"border-top-right-radius": styles.isDesktopLayout() ? px(size.border_radius_larger) : ""
			}
		}, [
			mithril_default(".flex-grow"),
			isInternalUser && isLoggedIn ? mithril_default(".news-button", [mithril_default(IconButton, {
				icon: Icons.Bulb,
				title: "news_label",
				click: () => showNewsDialog(newsModel),
				colors: ButtonColor.DrawerNav
			}), liveNewsCount > 0 ? mithril_default(CounterBadge, {
				count: liveNewsCount,
				position: {
					top: px(0),
					right: px(3)
				},
				color: "white",
				background: theme.list_accent_fg
			}) : null]) : null,
			logins.isGlobalAdminUserLoggedIn() && userController.isPaidAccount() ? mithril_default(IconButton, {
				icon: Icons.Gift,
				title: "buyGiftCard_label",
				click: () => {
					mithril_default.route.set("/settings/subscription");
					import("./PurchaseGiftCardDialog2-chunk.js").then(({ showPurchaseGiftCardDialog }) => {
						return showPurchaseGiftCardDialog();
					});
				},
				colors: ButtonColor.DrawerNav
			}) : null,
			desktopSystemFacade ? mithril_default(IconButton, {
				icon: Icons.NewWindow,
				title: "openNewWindow_action",
				click: () => {
					desktopSystemFacade.openNewWindow();
				},
				colors: ButtonColor.DrawerNav
			}) : null,
			!isIOSApp() && isLoggedIn && userController.isFreeAccount() ? mithril_default(IconButton, {
				icon: BootIcons.Premium,
				title: "upgradePremium_label",
				click: () => showUpgradeDialog(),
				colors: ButtonColor.DrawerNav
			}) : null,
			mithril_default(IconButton, {
				title: "showHelp_action",
				icon: BootIcons.Help,
				click: (e, dom) => createDropdown({
					width: 300,
					lazyButtons: () => [{
						icon: Icons.SpeechBubbleFill,
						label: "supportMenu_label",
						click: () => showSupportDialog(logins)
					}, {
						icon: Icons.KeyboardFill,
						label: "keyboardShortcuts_title",
						click: () => keyManager.openF1Help(true)
					}]
				})(e, dom),
				colors: ButtonColor.DrawerNav
			}),
			isInternalUser ? mithril_default(IconButton, {
				icon: BootIcons.Settings,
				title: "settings_label",
				click: () => mithril_default.route.set(SETTINGS_PREFIX),
				colors: ButtonColor.DrawerNav
			}) : null,
			mithril_default(IconButton, {
				icon: BootIcons.Logout,
				title: "switchAccount_action",
				click: () => mithril_default.route.set(LogoutUrl),
				colors: ButtonColor.DrawerNav
			})
		]);
	}
};

//#endregion
//#region src/common/gui/FolderColumnView.ts
var FolderColumnView = class {
	view({ attrs }) {
		return mithril_default(".flex.height-100p.nav-bg", [mithril_default(DrawerMenu, attrs.drawer), mithril_default(".folder-column.flex-grow.overflow-x-hidden.flex.col", landmarkAttrs(AriaLandmarks.Navigation, lang.getTranslationText(attrs.ariaLabel)), [this.renderMainButton(attrs), mithril_default(".scroll.scrollbar-gutter-stable-or-fallback.visible-scrollbar.overflow-x-hidden.flex.col.flex-grow", { onscroll: (e) => {
			e.redraw = false;
			const target = e.target;
			if (attrs.button == null || target.scrollTop === 0) target.style.borderTop = "";
else target.style.borderTop = `1px solid ${theme.content_border}`;
		} }, attrs.content)])]);
	}
	renderMainButton(attrs) {
		if (attrs.button) return mithril_default(".plr-button-double.scrollbar-gutter-stable-or-fallback.scroll", mithril_default(MainCreateButton, {
			label: attrs.button.label,
			click: attrs.button.click
		}));
else return null;
	}
};

//#endregion
//#region src/common/gui/SidebarSection.ts
var import_stream = __toESM(require_stream(), 1);
var SidebarSection = class {
	expanded = (0, import_stream.default)(true);
	view(vnode) {
		const { name, button, hideIfEmpty } = vnode.attrs;
		const content = vnode.children;
		if (hideIfEmpty && content == false) return null;
		return mithril_default(".sidebar-section", {
			"data-testid": `section:${lang.getTestId(name)}`,
			style: { color: theme.navigation_button }
		}, [mithril_default(".folder-row.flex-space-between.plr-button.pt-s.button-height", [mithril_default("small.b.align-self-center.text-ellipsis.plr-button", lang.getTranslationText(name).toLocaleUpperCase()), button ?? null]), content]);
	}
};

//#endregion
//#region src/common/gui/BackgroundColumnLayout.ts
var BackgroundColumnLayout = class {
	view({ attrs }) {
		return mithril_default(".list-column.flex.col.fill-absolute", {
			style: { backgroundColor: attrs.backgroundColor },
			class: attrs.classes ?? ""
		}, [
			styles.isUsingBottomNavigation() ? attrs.mobileHeader() : attrs.desktopToolbar(),
			mithril_default(".flex-grow.rel", attrs.columnLayout),
			attrs.floatingActionButton?.()
		]);
	}
};

//#endregion
//#region src/common/gui/BaseMobileHeader.ts
const BaseMobileHeader = pureComponent(({ left, center, right, injections }) => {
	return mithril_default(".flex.items-center.rel.button-height.mt-safe-inset.plr-safe-inset", { style: { height: px(size.navbar_height_mobile) } }, [
		left ?? null,
		mithril_default(".flex-grow.flex.items-center.min-width-0", { class: !left ? "ml-hpad_small" : "" }, center ?? null),
		right ?? null,
		injections ?? null
	]);
});

//#endregion
//#region src/common/gui/MobileHeader.ts
var MobileHeader = class {
	view({ attrs }) {
		const firstVisibleColumn = attrs.columnType === "first" || styles.isSingleColumnLayout();
		return mithril_default(BaseMobileHeader, {
			left: this.renderLeftAction(attrs),
			center: firstVisibleColumn ? mithril_default(MobileHeaderTitle, {
				title: attrs.title ? lang.getTranslationText(attrs.title) : undefined,
				bottom: mithril_default(OfflineIndicator, attrs.offlineIndicatorModel.getCurrentAttrs())
			}) : null,
			right: [
				styles.isSingleColumnLayout() ? null : attrs.multicolumnActions?.(),
				attrs.actions,
				styles.isSingleColumnLayout() || attrs.columnType === "other" ? attrs.primaryAction() : null
			],
			injections: firstVisibleColumn ? mithril_default(ProgressBar, { progress: attrs.offlineIndicatorModel.getProgress() }) : null
		});
	}
	renderLeftAction(attrs) {
		if (attrs.columnType === "first" && !attrs.useBackButton) return mithril_default(MobileHeaderMenuButton, {
			newsModel: attrs.newsModel,
			backAction: attrs.backAction
		});
else if (styles.isSingleColumnLayout() || attrs.useBackButton) return mithril_default(MobileHeaderBackButton, { backAction: attrs.backAction });
		return null;
	}
};
const MobileHeaderBackButton = pureComponent(({ backAction }) => {
	return mithril_default(IconButton, {
		title: "back_action",
		icon: BootIcons.Back,
		click: () => {
			backAction();
		}
	});
});
const MobileHeaderTitle = pureComponent(({ title, bottom, onTap }) => {
	return mithril_default(".flex.col.items-start.min-width-0", [mithril_default((onTap ? "button" : "") + ".font-weight-600.text-ellipsis.align-self-stretch", { onclick: (event) => onTap?.(event, event.target) }, title ?? NBSP), bottom]);
});
const MobileHeaderMenuButton = pureComponent(({ newsModel, backAction }) => {
	return mithril_default(".rel", [mithril_default(IconButton, {
		title: "menu_label",
		icon: BootIcons.MoreVertical,
		click: () => {
			backAction();
		}
	}), mithril_default(CounterBadge, {
		count: newsModel.liveNewsIds.length,
		position: {
			top: px(4),
			right: px(5)
		},
		color: "white",
		background: theme.list_accent_fg
	})]);
});

//#endregion
export { BackgroundColumnLayout, BaseMobileHeader, ColumnType, FolderColumnView, Header, MainCreateButton, MobileHeader, MobileHeaderBackButton, MobileHeaderMenuButton, MobileHeaderTitle, SidebarSection, ViewColumn, ViewSlider };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9iaWxlSGVhZGVyLWNodW5rLmpzIiwibmFtZXMiOlsiYXR0cnM6IEhlYWRlckF0dHJzIiwiY29tcG9uZW50OiBDb21wb25lbnQiLCJjb2x1bW5UeXBlOiBDb2x1bW5UeXBlIiwiZm9yZWdyb3VuZFN0YXRlOiBib29sZWFuIiwidG91Y2g6IFRvdWNoIiwidmlld0NvbHVtbnM6IFZpZXdDb2x1bW5bXSIsImVuYWJsZURyYXdlcjogYm9vbGVhbiIsImNvbHVtbjogVmlld0NvbHVtbiIsInZpc2libGVDb2x1bW5zOiBWaWV3Q29sdW1uW10iLCJhbGxDb2x1bW5zOiBWaWV3Q29sdW1uW10iLCJyZW1haW5pbmdTcGFjZTogbnVtYmVyIiwidmlld0NvbHVtbjogVmlld0NvbHVtbiIsIm5leHRWaXNpYmxlVmlld0NvbHVtbjogVmlld0NvbHVtbiIsIm9sZE9mZnNldDogbnVtYmVyIiwibmV3T2Zmc2V0OiBudW1iZXIiLCJmb3JlZ3JvdW5kQ29sdW1uOiBWaWV3Q29sdW1uIiwidG9Gb3JlZ3JvdW5kOiBib29sZWFuIiwiZWxlbWVudDogSFRNTEVsZW1lbnQiLCJsYXN0R2VzdHVyZUluZm86IEdlc3R1cmVJbmZvIHwgbnVsbCIsIm9sZEdlc3R1cmVJbmZvOiBHZXN0dXJlSW5mbyB8IG51bGwiLCJpbml0aWFsR2VzdHVyZUluZm86IEdlc3R1cmVJbmZvIHwgbnVsbCIsImRpcmVjdGlvbkxvY2s6IDAgfCAxIHwgMiIsImV2ZW50OiBhbnkiLCJ2bm9kZTogVm5vZGU8TWFpbkNyZWF0ZUJ1dHRvbkF0dHJzPiIsInZub2RlOiBWbm9kZTxOZXdzTGlzdEF0dHJzPiIsIm5ld3NNb2RlbDogTmV3c01vZGVsIiwiY2xvc2VCdXR0b246IEJ1dHRvbkF0dHJzIiwiaGVhZGVyOiBEaWFsb2dIZWFkZXJCYXJBdHRycyIsImNoaWxkOiBDb21wb25lbnQiLCJ2bm9kZTogVm5vZGU8RHJhd2VyTWVudUF0dHJzPiIsImU6IEV2ZW50UmVkcmF3PEV2ZW50PiIsImF0dHJzOiBBdHRycyIsInZub2RlOiBWbm9kZTxTaWRlYmFyU2VjdGlvbkF0dHJzPiIsImF0dHJzOiBNb2JpbGVIZWFkZXJBdHRycyIsImV2ZW50OiBNb3VzZUV2ZW50Il0sInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1vbi9ndWkvYmFzZS9OYXZCYXIudHMiLCIuLi9zcmMvY29tbW9uL2d1aS9IZWFkZXIudHMiLCIuLi9zcmMvY29tbW9uL2d1aS9iYXNlL1ZpZXdDb2x1bW4udHMiLCIuLi9zcmMvY29tbW9uL2d1aS9uYXYvVmlld1NsaWRlci50cyIsIi4uL3NyYy9jb21tb24vZ3VpL01haW5DcmVhdGVCdXR0b24udHMiLCIuLi9zcmMvY29tbW9uL21pc2MvbmV3cy9OZXdzTGlzdC50cyIsIi4uL3NyYy9jb21tb24vbWlzYy9uZXdzL05ld3NEaWFsb2cudHMiLCIuLi9zcmMvY29tbW9uL2d1aS9uYXYvRHJhd2VyTWVudS50cyIsIi4uL3NyYy9jb21tb24vZ3VpL0ZvbGRlckNvbHVtblZpZXcudHMiLCIuLi9zcmMvY29tbW9uL2d1aS9TaWRlYmFyU2VjdGlvbi50cyIsIi4uL3NyYy9jb21tb24vZ3VpL0JhY2tncm91bmRDb2x1bW5MYXlvdXQudHMiLCIuLi9zcmMvY29tbW9uL2d1aS9CYXNlTW9iaWxlSGVhZGVyLnRzIiwiLi4vc3JjL2NvbW1vbi9ndWkvTW9iaWxlSGVhZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtLCB7IENoaWxkLCBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IEFyaWFMYW5kbWFya3MsIGxhbmRtYXJrQXR0cnMgfSBmcm9tIFwiLi4vQXJpYVV0aWxzXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUgfSBmcm9tIFwiLi4vLi4vYXBpL2NvbW1vbi9FbnZcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcbmV4cG9ydCB0eXBlIEF0dHJzID0gdm9pZFxuXG5leHBvcnQgY2xhc3MgTmF2QmFyIGltcGxlbWVudHMgQ29tcG9uZW50PEF0dHJzPiB7XG5cdHZpZXcoeyBjaGlsZHJlbiB9OiBWbm9kZTxBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIm5hdi5uYXYtYmFyLmZsZXgtZW5kXCIsXG5cdFx0XHRsYW5kbWFya0F0dHJzKEFyaWFMYW5kbWFya3MuTmF2aWdhdGlvbiwgXCJ0b3BcIiksXG5cdFx0XHQoY2hpbGRyZW4gYXMgQXJyYXk8Q2hpbGQ+KS5tYXAoKGNoaWxkKSA9PiBtKFwiLnBsci1uYXYtYnV0dG9uXCIsIGNoaWxkKSksXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ2xhc3NDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgTmF2QmFyIH0gZnJvbSBcIi4vYmFzZS9OYXZCYXIuanNcIlxuaW1wb3J0IHsgaXNTZWxlY3RlZFByZWZpeCwgTmF2QnV0dG9uLCBOYXZCdXR0b25Db2xvciB9IGZyb20gXCIuL2Jhc2UvTmF2QnV0dG9uLmpzXCJcbmltcG9ydCB7IEZlYXR1cmVUeXBlIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgQm9vdEljb25zIH0gZnJvbSBcIi4vYmFzZS9pY29ucy9Cb290SWNvbnMuanNcIlxuaW1wb3J0IHsgQ0FMRU5EQVJfUFJFRklYLCBDT05UQUNUTElTVF9QUkVGSVgsIENPTlRBQ1RTX1BSRUZJWCwgTUFJTF9QUkVGSVggfSBmcm9tIFwiLi4vbWlzYy9Sb3V0ZUNoYW5nZS5qc1wiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IE9mZmxpbmVJbmRpY2F0b3IgfSBmcm9tIFwiLi9iYXNlL09mZmxpbmVJbmRpY2F0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZUluZGljYXRvclZpZXdNb2RlbCB9IGZyb20gXCIuL2Jhc2UvT2ZmbGluZUluZGljYXRvclZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBOZXdzTW9kZWwgfSBmcm9tIFwiLi4vbWlzYy9uZXdzL05ld3NNb2RlbC5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3IuanNcIlxuaW1wb3J0IHsgUHJvZ3Jlc3NCYXIgfSBmcm9tIFwiLi9iYXNlL1Byb2dyZXNzQmFyLmpzXCJcbmltcG9ydCB7IERlc2t0b3BCYXNlSGVhZGVyIH0gZnJvbSBcIi4vYmFzZS9EZXNrdG9wQmFzZUhlYWRlci5qc1wiXG5cbmFzc2VydE1haW5Pck5vZGUoKVxuXG4vKiogQXR0cnMgdGhhdCBhcmUgdXNlZCBieSBkaWZmZXJlbnQgaGVhZGVyIGNvbXBvbmVudHMgaW4gdGhlIGFwcC4gICovXG5leHBvcnQgaW50ZXJmYWNlIEFwcEhlYWRlckF0dHJzIHtcblx0bmV3c01vZGVsOiBOZXdzTW9kZWxcblx0b2ZmbGluZUluZGljYXRvck1vZGVsOiBPZmZsaW5lSW5kaWNhdG9yVmlld01vZGVsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVhZGVyQXR0cnMgZXh0ZW5kcyBBcHBIZWFkZXJBdHRycyB7XG5cdHJpZ2h0Vmlldz86IENoaWxkcmVuXG5cdGhhbmRsZUJhY2tQcmVzcz86ICgpID0+IGJvb2xlYW5cblx0LyoqIHNlYXJjaCBiYXIsIG9ubHkgcmVuZGVyZWQgd2hlbiBOT1QgdXNpbmcgYm90dG9tIG5hdmlnYXRpb24gKi9cblx0c2VhcmNoQmFyPzogKCkgPT4gQ2hpbGRyZW5cblx0LyoqIGNvbnRlbnQgaW4gdGhlIGNlbnRlciBvZiB0aGUgc2VhcmNoIGJhciwgd2hlcmUgdGl0bGUgYW5kIG9mZmxpbmUgc3RhdHVzIG5vcm1hbGx5IGFyZSAqL1xuXHRjZW50ZXJDb250ZW50PzogKCkgPT4gQ2hpbGRyZW5cbn1cblxuZXhwb3J0IGNsYXNzIEhlYWRlciBpbXBsZW1lbnRzIENsYXNzQ29tcG9uZW50PEhlYWRlckF0dHJzPiB7XG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxIZWFkZXJBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oRGVza3RvcEJhc2VIZWFkZXIsIFttKFByb2dyZXNzQmFyLCB7IHByb2dyZXNzOiBhdHRycy5vZmZsaW5lSW5kaWNhdG9yTW9kZWwuZ2V0UHJvZ3Jlc3MoKSB9KSwgdGhpcy5yZW5kZXJOYXZpZ2F0aW9uKGF0dHJzKV0pXG5cdH1cblxuXHQvKipcblx0ICogcmVuZGVyIHRoZSBzZWFyY2ggYW5kIG5hdmlnYXRpb24gYmFyIGluIHRocmVlLWNvbHVtbiBsYXlvdXRzLiBpZiB0aGVyZSBpcyBhIG5hdmlnYXRpb24sIGFsc28gcmVuZGVyIGFuIG9mZmxpbmUgaW5kaWNhdG9yLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSByZW5kZXJOYXZpZ2F0aW9uKGF0dHJzOiBIZWFkZXJBdHRycyk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcIi5mbGV4LWdyb3cuZmxleC5qdXN0aWZ5LWVuZC5pdGVtcy1jZW50ZXJcIiwgW1xuXHRcdFx0YXR0cnMuc2VhcmNoQmFyID8gYXR0cnMuc2VhcmNoQmFyKCkgOiBudWxsLFxuXHRcdFx0bShPZmZsaW5lSW5kaWNhdG9yLCBhdHRycy5vZmZsaW5lSW5kaWNhdG9yTW9kZWwuZ2V0Q3VycmVudEF0dHJzKCkpLFxuXHRcdFx0bShcIi5uYXYtYmFyLXNwYWNlclwiKSxcblx0XHRcdG0oTmF2QmFyLCB0aGlzLnJlbmRlckJ1dHRvbnMoKSksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQnV0dG9ucygpOiBDaGlsZHJlbiB7XG5cdFx0Ly8gV2UgYXNzaWduIGNsaWNrIGxpc3RlbmVycyB0byBidXR0b25zIHRvIG1vdmUgZm9jdXMgY29ycmVjdGx5IGlmIHRoZSB2aWV3IGlzIGFscmVhZHkgb3BlblxuXHRcdHJldHVybiBbXG5cdFx0XHRtKE5hdkJ1dHRvbiwge1xuXHRcdFx0XHRsYWJlbDogXCJlbWFpbHNfbGFiZWxcIixcblx0XHRcdFx0aWNvbjogKCkgPT4gQm9vdEljb25zLk1haWwsXG5cdFx0XHRcdGhyZWY6IE1BSUxfUFJFRklYLFxuXHRcdFx0XHRpc1NlbGVjdGVkUHJlZml4OiBNQUlMX1BSRUZJWCxcblx0XHRcdFx0Y29sb3JzOiBOYXZCdXR0b25Db2xvci5IZWFkZXIsXG5cdFx0XHR9KSxcblx0XHRcdC8vIG5vdCBhdmFpbGFibGUgZm9yIGV4dGVybmFsIG1haWxib3hlc1xuXHRcdFx0bG9jYXRvci5sb2dpbnMuaXNJbnRlcm5hbFVzZXJMb2dnZWRJbigpICYmICFsb2NhdG9yLmxvZ2lucy5pc0VuYWJsZWQoRmVhdHVyZVR5cGUuRGlzYWJsZUNvbnRhY3RzKVxuXHRcdFx0XHQ/IG0oTmF2QnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJjb250YWN0c19sYWJlbFwiLFxuXHRcdFx0XHRcdFx0aWNvbjogKCkgPT4gQm9vdEljb25zLkNvbnRhY3RzLFxuXHRcdFx0XHRcdFx0aHJlZjogQ09OVEFDVFNfUFJFRklYLFxuXHRcdFx0XHRcdFx0aXNTZWxlY3RlZFByZWZpeDogaXNTZWxlY3RlZFByZWZpeChDT05UQUNUU19QUkVGSVgpIHx8IGlzU2VsZWN0ZWRQcmVmaXgoQ09OVEFDVExJU1RfUFJFRklYKSxcblx0XHRcdFx0XHRcdGNvbG9yczogTmF2QnV0dG9uQ29sb3IuSGVhZGVyLFxuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogbnVsbCxcblx0XHRcdC8vIG5vdCBhdmFpbGFibGUgZm9yIGV4dGVybmFsIG1haWxib3hlc1xuXHRcdFx0bG9jYXRvci5sb2dpbnMuaXNJbnRlcm5hbFVzZXJMb2dnZWRJbigpICYmICFsb2NhdG9yLmxvZ2lucy5pc0VuYWJsZWQoRmVhdHVyZVR5cGUuRGlzYWJsZUNhbGVuZGFyKVxuXHRcdFx0XHQ/IG0oTmF2QnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJjYWxlbmRhcl9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0aWNvbjogKCkgPT4gQm9vdEljb25zLkNhbGVuZGFyLFxuXHRcdFx0XHRcdFx0aHJlZjogQ0FMRU5EQVJfUFJFRklYLFxuXHRcdFx0XHRcdFx0Y29sb3JzOiBOYXZCdXR0b25Db2xvci5IZWFkZXIsXG5cdFx0XHRcdFx0XHRjbGljazogKCkgPT4gbS5yb3V0ZS5nZXQoKS5zdGFydHNXaXRoKENBTEVOREFSX1BSRUZJWCksXG5cdFx0XHRcdCAgfSlcblx0XHRcdFx0OiBudWxsLFxuXHRcdF1cblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ29tcG9uZW50IH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgQXJpYUxhbmRtYXJrcywgbGFuZG1hcmtBdHRycyB9IGZyb20gXCIuLi9BcmlhVXRpbHNcIlxuaW1wb3J0IHsgTGF5ZXJUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL1Jvb3RWaWV3XCJcbmltcG9ydCB7IGxhenksIE1heWJlTGF6eSwgcmVzb2x2ZU1heWJlTGF6eSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgYXNzZXJ0TWFpbk9yTm9kZSB9IGZyb20gXCIuLi8uLi9hcGkvY29tbW9uL0VudlwiXG5pbXBvcnQgeyBsYW5nLCBUcmFuc2xhdGlvbiwgVHJhbnNsYXRpb25LZXksIE1heWJlVHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5cbmFzc2VydE1haW5Pck5vZGUoKVxuXG5leHBvcnQgY29uc3QgZW51bSBDb2x1bW5UeXBlIHtcblx0QmFja2dyb3VuZCA9IDEsXG5cdEZvcmVncm91bmQgPSAwLFxufVxuXG50eXBlIEF0dHJzID0ge1xuXHRyaWdodEJvcmRlcj86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIFZpZXdDb2x1bW4gaW1wbGVtZW50cyBDb21wb25lbnQ8QXR0cnM+IHtcblx0cHJpdmF0ZSByZWFkb25seSBjb21wb25lbnQ6IENvbXBvbmVudFxuXHRyZWFkb25seSBjb2x1bW5UeXBlOiBDb2x1bW5UeXBlXG5cdHJlYWRvbmx5IG1pbldpZHRoOiBudW1iZXJcblx0cmVhZG9ubHkgbWF4V2lkdGg6IG51bWJlclxuXHRwcml2YXRlIHJlYWRvbmx5IGhlYWRlckNlbnRlcjogTWF5YmVMYXp5PE1heWJlVHJhbnNsYXRpb24+XG5cdHByaXZhdGUgcmVhZG9ubHkgYXJpYUxhYmVsOiBsYXp5PHN0cmluZz5cblx0d2lkdGg6IG51bWJlclxuXHRvZmZzZXQ6IG51bWJlciAvLyBvZmZzZXQgdG8gdGhlIGxlZnRcblxuXHQvLyBub3QgcHJpdmF0ZSBiZWNhdXNlIHVzZWQgYnkgVmlld1NsaWRlclxuXHRkb21Db2x1bW46IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0aXNJbkZvcmVncm91bmQ6IGJvb2xlYW5cblx0aXNWaXNpYmxlOiBib29sZWFuXG5cdGFyaWFSb2xlOiBBcmlhTGFuZG1hcmtzIHwgbnVsbCA9IG51bGxcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgdmlldyBjb2x1bW4uXG5cdCAqIEBwYXJhbSBjb21wb25lbnQgVGhlIGNvbXBvbmVudCB0aGF0IGlzIHJlbmRlcmVkIGFzIHRoaXMgY29sdW1uXG5cdCAqIEBwYXJhbSBjb2x1bW5UeXBlIFRoZSB0eXBlIG9mIHRoZSB2aWV3IGNvbHVtbi5cblx0ICogQHBhcmFtIG1pbldpZHRoIFRoZSBtaW5pbXVtIGFsbG93ZWQgd2lkdGggZm9yIHRoZSB2aWV3IGNvbHVtbi5cblx0ICogQHBhcmFtIGhlYWRlckNlbnRlciByZXR1cm5lZCBpbiB7QGxpbmsgZ2V0VGl0bGV9LiBVc2VkIGluIEFSSUEgbGFuZG1hcmsgdW5sZXNzIG92ZXJyaWRlbiBieSB7QGxpbmsgYXJpYUxhYmVsfVxuXHQgKiBAcGFyYW0gYXJpYUxhYmVsIHVzZWQgaW4gQVJJQSBsYW5kbWFya1xuXHQgKiBAcGFyYW0gbWF4V2lkdGggVGhlIG1heGltdW0gYWxsb3dlZCB3aWR0aCBmb3IgdGhlIHZpZXcgY29sdW1uLlxuXHQgKiBAcGFyYW0gaGVhZGVyQ2VudGVyIFRoZSB0aXRsZSBvZiB0aGUgdmlldyBjb2x1bW4uXG5cdCAqIEBwYXJhbSBhcmlhTGFiZWwgVGhlIGxhYmVsIG9mIHRoZSB2aWV3IGNvbHVtbiB0byBiZSByZWFkIGJ5IHNjcmVlbiByZWFkZXJzLiBEZWZhdWx0cyB0byBoZWFkZXJDZW50ZXIgaWYgbm90IHNwZWNpZmllZC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGNvbXBvbmVudDogQ29tcG9uZW50LFxuXHRcdGNvbHVtblR5cGU6IENvbHVtblR5cGUsXG5cdFx0e1xuXHRcdFx0bWluV2lkdGgsXG5cdFx0XHRtYXhXaWR0aCxcblx0XHRcdC8vIG5vdGU6IGhlYWRlckNlbnRlciBpcyBhIGNhbmRpZGF0ZSBmb3IgcmVtb3ZhbCwgVmlld0NvbHVtbiBpcyBub3QgcmVzcG9uc2libGUgZm9yIHRoZSBoZWFkZXIuIFRoaXMgaXMgb25seSB1c2VmdWwgYXMgYW4gQVJJQSBkZXNjcmlwdGlvbiB3aGljaCB3ZSBjYW4gYWxyZWFkeVxuXHRcdFx0Ly8gcHJvdmlkZSBzZXBhcmF0ZWx5LiBXZSBzaG91bGQgYWx3YXlzIHJlcXVpcmUgYXJpYSBkZXNjcmlwdGlvbiBpbnN0ZWFkLlxuXHRcdFx0aGVhZGVyQ2VudGVyLFxuXHRcdFx0YXJpYUxhYmVsID0gKCkgPT4gbGFuZy5nZXRUcmFuc2xhdGlvblRleHQodGhpcy5nZXRUaXRsZSgpKSxcblx0XHR9OiB7XG5cdFx0XHRtaW5XaWR0aDogbnVtYmVyXG5cdFx0XHRtYXhXaWR0aDogbnVtYmVyXG5cdFx0XHRoZWFkZXJDZW50ZXI/OiBNYXliZUxhenk8TWF5YmVUcmFuc2xhdGlvbj5cblx0XHRcdGFyaWFMYWJlbD86IGxhenk8c3RyaW5nPlxuXHRcdH0sXG5cdCkge1xuXHRcdHRoaXMuY29tcG9uZW50ID0gY29tcG9uZW50XG5cdFx0dGhpcy5jb2x1bW5UeXBlID0gY29sdW1uVHlwZVxuXHRcdHRoaXMubWluV2lkdGggPSBtaW5XaWR0aFxuXHRcdHRoaXMubWF4V2lkdGggPSBtYXhXaWR0aFxuXG5cdFx0dGhpcy5oZWFkZXJDZW50ZXIgPSBoZWFkZXJDZW50ZXIgfHwgXCJlbXB0eVN0cmluZ19tc2dcIlxuXG5cdFx0dGhpcy5hcmlhTGFiZWwgPSBhcmlhTGFiZWwgPz8gbnVsbFxuXHRcdHRoaXMud2lkdGggPSBtaW5XaWR0aFxuXHRcdHRoaXMub2Zmc2V0ID0gMFxuXHRcdHRoaXMuaXNJbkZvcmVncm91bmQgPSBmYWxzZVxuXHRcdHRoaXMuaXNWaXNpYmxlID0gZmFsc2Vcblx0XHQvLyBmaXh1cCBmb3Igb2xkLXN0eWxlIGNvbXBvbmVudHNcblx0XHR0aGlzLnZpZXcgPSB0aGlzLnZpZXcuYmluZCh0aGlzKVxuXHR9XG5cblx0dmlldygpIHtcblx0XHRjb25zdCB6SW5kZXggPSAhdGhpcy5pc1Zpc2libGUgJiYgdGhpcy5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkZvcmVncm91bmQgPyBMYXllclR5cGUuRm9yZWdyb3VuZE1lbnUgKyAxIDogXCJcIlxuXHRcdGNvbnN0IGxhbmRtYXJrID0gdGhpcy5hcmlhUm9sZSA/IGxhbmRtYXJrQXR0cnModGhpcy5hcmlhUm9sZSwgdGhpcy5hcmlhTGFiZWwgPyB0aGlzLmFyaWFMYWJlbCgpIDogbGFuZy5nZXRUcmFuc2xhdGlvblRleHQodGhpcy5nZXRUaXRsZSgpKSkgOiB7fVxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIudmlldy1jb2x1bW4uZmlsbC1hYnNvbHV0ZVwiLFxuXHRcdFx0e1xuXHRcdFx0XHQuLi5sYW5kbWFyayxcblx0XHRcdFx0XCJkYXRhLXRlc3RpZFwiOiBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dCh0aGlzLmdldFRpdGxlKCkpLFxuXHRcdFx0XHRpbmVydDogIXRoaXMuaXNWaXNpYmxlICYmICF0aGlzLmlzSW5Gb3JlZ3JvdW5kLFxuXHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5kb21Db2x1bW4gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0XHR0aGlzLmRvbUNvbHVtbi5zdHlsZS50cmFuc2Zvcm0gPVxuXHRcdFx0XHRcdFx0dGhpcy5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkZvcmVncm91bmQgPyBcInRyYW5zbGF0ZVgoXCIgKyB0aGlzLmdldE9mZnNldEZvcmVncm91bmQodGhpcy5pc0luRm9yZWdyb3VuZCkgKyBcInB4KVwiIDogXCJcIlxuXG5cdFx0XHRcdFx0aWYgKHRoaXMuYXJpYVJvbGUgPT09IEFyaWFMYW5kbWFya3MuTWFpbikge1xuXHRcdFx0XHRcdFx0dGhpcy5mb2N1cygpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdHpJbmRleCxcblx0XHRcdFx0XHR3aWR0aDogdGhpcy53aWR0aCArIFwicHhcIixcblx0XHRcdFx0XHRsZWZ0OiB0aGlzLm9mZnNldCArIFwicHhcIixcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRtKHRoaXMuY29tcG9uZW50KSxcblx0XHQpXG5cdH1cblxuXHRnZXRUaXRsZSgpOiBNYXliZVRyYW5zbGF0aW9uIHtcblx0XHRyZXR1cm4gcmVzb2x2ZU1heWJlTGF6eSh0aGlzLmhlYWRlckNlbnRlcilcblx0fVxuXG5cdGdldE9mZnNldEZvcmVncm91bmQoZm9yZWdyb3VuZFN0YXRlOiBib29sZWFuKTogbnVtYmVyIHtcblx0XHRpZiAodGhpcy5pc1Zpc2libGUgfHwgZm9yZWdyb3VuZFN0YXRlKSB7XG5cdFx0XHRyZXR1cm4gMFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gLXRoaXMud2lkdGhcblx0XHR9XG5cdH1cblxuXHRmb2N1cygpIHtcblx0XHR0aGlzLmRvbUNvbHVtbj8uZm9jdXMoKVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50IH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgQ29sdW1uVHlwZSwgVmlld0NvbHVtbiB9IGZyb20gXCIuLi9iYXNlL1ZpZXdDb2x1bW4uanNcIlxuaW1wb3J0IHR5cGUgeyB3aW5kb3dTaXplTGlzdGVuZXIgfSBmcm9tIFwiLi4vLi4vbWlzYy9XaW5kb3dGYWNhZGUuanNcIlxuaW1wb3J0IHsgd2luZG93RmFjYWRlIH0gZnJvbSBcIi4uLy4uL21pc2MvV2luZG93RmFjYWRlLmpzXCJcbmltcG9ydCB7IHNpemUgfSBmcm9tIFwiLi4vc2l6ZS5qc1wiXG5pbXBvcnQgeyBhbHBoYSwgQWxwaGFFbnVtLCBhbmltYXRpb25zLCB0cmFuc2Zvcm0sIFRyYW5zZm9ybUVudW0gfSBmcm9tIFwiLi4vYW5pbWF0aW9uL0FuaW1hdGlvbnMuanNcIlxuaW1wb3J0IHsgZWFzZSB9IGZyb20gXCIuLi9hbmltYXRpb24vRWFzaW5nLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uL3RoZW1lLmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gXCIuLi9zdHlsZXMuanNcIlxuaW1wb3J0IHsgQXJpYUxhbmRtYXJrcyB9IGZyb20gXCIuLi9BcmlhVXRpbHMuanNcIlxuaW1wb3J0IHsgTGF5ZXJUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL1Jvb3RWaWV3LmpzXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUgfSBmcm9tIFwiLi4vLi4vYXBpL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHsgY2xpZW50IH0gZnJvbSBcIi4uLy4uL21pc2MvQ2xpZW50RGV0ZWN0b3IuanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcbmV4cG9ydCB0eXBlIEdlc3R1cmVJbmZvID0ge1xuXHR4OiBudW1iZXJcblx0eTogbnVtYmVyXG5cdHRpbWU6IG51bWJlclxuXHRpZGVudGlmaWVyOiBudW1iZXJcbn1cbmV4cG9ydCBjb25zdCBnZXN0dXJlSW5mb0Zyb21Ub3VjaCA9ICh0b3VjaDogVG91Y2gpOiBHZXN0dXJlSW5mbyA9PiAoe1xuXHR4OiB0b3VjaC5wYWdlWCxcblx0eTogdG91Y2gucGFnZVksXG5cdHRpbWU6IHBlcmZvcm1hbmNlLm5vdygpLFxuXHRpZGVudGlmaWVyOiB0b3VjaC5pZGVudGlmaWVyLFxufSlcblxuaW50ZXJmYWNlIFZpZXdTbGlkZXJBdHRycyB7XG5cdGhlYWRlcjogQ2hpbGRyZW5cblx0Ym90dG9tTmF2PzogQ2hpbGRyZW5cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdmlldyB3aXRoIG11bHRpcGxlIHZpZXcgY29sdW1ucy4gRGVwZW5kaW5nIG9uIHRoZSBzY3JlZW4gd2lkdGggYW5kIHRoZSB2aWV3IGNvbHVtbnMgY29uZmlndXJhdGlvbnMsXG4gKiB0aGUgYWN0dWFsIHdpZHRocyBhbmQgcG9zaXRpb25zIG9mIHRoZSB2aWV3IGNvbHVtbnMgaXMgY2FsY3VsYXRlZC4gVGhpcyBhbGxvd3MgYSBjb25zaXN0ZW50IGxheW91dCBmb3IgYW55IGJyb3dzZXJcbiAqIHJlc29sdXRpb24gb24gYW55IHR5cGUgb2YgZGV2aWNlLlxuICovXG5leHBvcnQgY2xhc3MgVmlld1NsaWRlciBpbXBsZW1lbnRzIENvbXBvbmVudDxWaWV3U2xpZGVyQXR0cnM+IHtcblx0cHJpdmF0ZSByZWFkb25seSBtYWluQ29sdW1uOiBWaWV3Q29sdW1uXG5cdGZvY3VzZWRDb2x1bW46IFZpZXdDb2x1bW5cblx0cHJpdmF0ZSB2aXNpYmxlQmFja2dyb3VuZENvbHVtbnM6IFZpZXdDb2x1bW5bXVxuXHRwcml2YXRlIGRvbVNsaWRpbmdQYXJ0ITogSFRNTEVsZW1lbnRcblx0dmlldzogQ29tcG9uZW50PFZpZXdTbGlkZXJBdHRycz5bXCJ2aWV3XCJdXG5cdHByaXZhdGUgYnVzeTogUHJvbWlzZTx1bmtub3duPlxuXHRwcml2YXRlIGlzTW9kYWxCYWNrZ3JvdW5kVmlzaWJsZTogYm9vbGVhblxuXHRwcml2YXRlIHJlYWRvbmx5IHJlc2l6ZUxpc3RlbmVyOiB3aW5kb3dTaXplTGlzdGVuZXIgPSAoKSA9PiB0aGlzLnVwZGF0ZVZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucygpXG5cdHByaXZhdGUgcmVhZG9ubHkgaGFuZGxlSGlzdG9yeUV2ZW50ID0gKCkgPT4ge1xuXHRcdGNvbnN0IHByZXYgPSB0aGlzLmdldFByZXZpb3VzQ29sdW1uKClcblx0XHRpZiAocHJldiAhPSBudWxsICYmIHByZXYuY29sdW1uVHlwZSAhPT0gQ29sdW1uVHlwZS5Gb3JlZ3JvdW5kKSB7XG5cdFx0XHR0aGlzLmZvY3VzUHJldmlvdXNDb2x1bW4oKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fSBlbHNlIGlmICh0aGlzLmlzRm9yZWdyb3VuZENvbHVtbkZvY3VzZWQoKSkge1xuXHRcdFx0dGhpcy5mb2N1c05leHRDb2x1bW4oKVxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHQvKiogQ3JlYXRlcyB0aGUgZXZlbnQgbGlzdGVuZXJzIGFzIHNvb24gYXMgdGhpcyBjb21wb25lbnQgaXMgbG9hZGVkIChpbnZva2VkIGJ5IG1pdGhyaWwpKi9cblx0b25jcmVhdGU6ICgpID0+IHZvaWQgPSAoKSA9PiB7XG5cdFx0dGhpcy51cGRhdGVWaXNpYmxlQmFja2dyb3VuZENvbHVtbnMoKVxuXG5cdFx0d2luZG93RmFjYWRlLmFkZFJlc2l6ZUxpc3RlbmVyKHRoaXMucmVzaXplTGlzdGVuZXIpXG5cdFx0d2luZG93RmFjYWRlLmFkZEhpc3RvcnlFdmVudExpc3RlbmVyKHRoaXMuaGFuZGxlSGlzdG9yeUV2ZW50KVxuXHR9XG5cblx0LyoqIFJlbW92ZXMgdGhlIHJlZ2lzdGVyZWQgZXZlbnQgbGlzdGVuZXJzIGFzIHNvb24gYXMgdGhpcyBjb21wb25lbnQgaXMgdW5sb2FkZWQgKGludm9rZWQgYnkgbWl0aHJpbCkqL1xuXHRvbnJlbW92ZTogKCkgPT4gdm9pZCA9ICgpID0+IHtcblx0XHR3aW5kb3dGYWNhZGUucmVtb3ZlUmVzaXplTGlzdGVuZXIodGhpcy5yZXNpemVMaXN0ZW5lcilcblx0XHR3aW5kb3dGYWNhZGUucmVtb3ZlSGlzdG9yeUV2ZW50TGlzdGVuZXIodGhpcy5oYW5kbGVIaXN0b3J5RXZlbnQpXG5cdH1cblx0cHJpdmF0ZSBnZXRTaWRlQ29sRG9tOiAoKSA9PiBIVE1MRWxlbWVudCB8IG51bGwgPSAoKSA9PiB0aGlzLnZpZXdDb2x1bW5zWzBdLmRvbUNvbHVtblxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgdmlld0NvbHVtbnM6IFZpZXdDb2x1bW5bXSwgcHJpdmF0ZSByZWFkb25seSBlbmFibGVEcmF3ZXI6IGJvb2xlYW4gPSB0cnVlKSB7XG5cdFx0Ly8gdGhlIGZpcnN0IGJhY2tncm91bmQgY29sdW1uIGlzIHRoZSBtYWluIGNvbHVtblxuXHRcdHRoaXMubWFpbkNvbHVtbiA9IGFzc2VydE5vdE51bGwoXG5cdFx0XHR2aWV3Q29sdW1ucy5maW5kKChjb2x1bW4pID0+IGNvbHVtbi5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkJhY2tncm91bmQpLFxuXHRcdFx0XCJ0aGVyZSB3YXMgbm8gYmFja2dyb3VuZyBjb2x1bW4gcGFzc2VkIHRvIHZpZXdzbGlkZXJcIixcblx0XHQpXG5cblx0XHR0aGlzLmZvY3VzZWRDb2x1bW4gPSB0aGlzLm1haW5Db2x1bW5cblx0XHR0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucyA9IFtdXG5cblx0XHR0aGlzLnVwZGF0ZVZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucygpXG5cblx0XHR0aGlzLmJ1c3kgPSBQcm9taXNlLnJlc29sdmUoKVxuXHRcdHRoaXMuaXNNb2RhbEJhY2tncm91bmRWaXNpYmxlID0gZmFsc2Vcblx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLnZpZXdDb2x1bW5zKSB7XG5cdFx0XHRjb2x1bW4uYXJpYVJvbGUgPSB0aGlzLmdldENvbHVtblJvbGUoY29sdW1uKVxuXHRcdH1cblxuXHRcdHRoaXMudmlldyA9ICh7IGF0dHJzIH0pOiBDaGlsZHJlbiA9PiB7XG5cdFx0XHRjb25zdCBtYWluU2xpZGVyQ29sdW1ucyA9IHRoaXMuZ2V0Q29sdW1uc0Zvck1haW5TbGlkZXIoKVxuXG5cdFx0XHRjb25zdCBhbGxCYWNrZ3JvdW5kQ29sdW1uc0FyZVZpc2libGUgPSB0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucy5sZW5ndGggPT09IG1haW5TbGlkZXJDb2x1bW5zLmxlbmd0aFxuXHRcdFx0cmV0dXJuIG0oXG5cdFx0XHRcdFwiLmZpbGwtYWJzb2x1dGUuZmxleC5jb2xcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG9uY3JlYXRlOiAodm5vZGUpID0+IHtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmVuYWJsZURyYXdlcikgdGhpcy5hdHRhY2hUb3VjaEhhbmRsZXIodm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50KVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25yZW1vdmU6ICgpID0+IHtcblx0XHRcdFx0XHRcdGlmICh0aGlzLnZpZXdDb2x1bW5zWzBdLmNvbHVtblR5cGUgPT09IENvbHVtblR5cGUuRm9yZWdyb3VuZCAmJiB0aGlzLnZpZXdDb2x1bW5zWzBdLmlzSW5Gb3JlZ3JvdW5kKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMudmlld0NvbHVtbnNbMF0uaXNJbkZvcmVncm91bmQgPSBmYWxzZVxuXHRcdFx0XHRcdFx0XHR0aGlzLmlzTW9kYWxCYWNrZ3JvdW5kVmlzaWJsZSA9IGZhbHNlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0W1xuXHRcdFx0XHRcdHN0eWxlcy5pc1VzaW5nQm90dG9tTmF2aWdhdGlvbigpID8gbnVsbCA6IGF0dHJzLmhlYWRlcixcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCIudmlldy1jb2x1bW5zLmZsZXgtZ3Jvdy5yZWxcIixcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0b25jcmVhdGU6ICh2bm9kZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuZG9tU2xpZGluZ1BhcnQgPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDogdGhpcy5nZXRXaWR0aCgpICsgXCJweFwiLFxuXHRcdFx0XHRcdFx0XHRcdHRyYW5zZm9ybTogXCJ0cmFuc2xhdGVYKFwiICsgdGhpcy5nZXRPZmZzZXQodGhpcy52aXNpYmxlQmFja2dyb3VuZENvbHVtbnNbMF0pICsgXCJweClcIixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRtYWluU2xpZGVyQ29sdW1ucy5tYXAoKGNvbHVtbiwgaW5kZXgpID0+XG5cdFx0XHRcdFx0XHRcdG0oY29sdW1uLCB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gT25seSBhcHBseSByaWdodCBib3JkZXIgaWYgMS4gYWxsIGJhY2tncm91bmQgY29sdW1ucyBhcmUgdmlzaWJsZS4gMi4gSXQncyBub3QgdGhlIGxhc3QgY29sdW1uLlxuXHRcdFx0XHRcdFx0XHRcdC8vIFBlcmhhcHMgdGhlIGNvbmRpdGlvbiBzaG91bGQgYmUgXCJ0aGVyZSdzIGFub3RoZXIgdmlzaWJsZSBjb2x1bW4gYWZ0ZXIgdGhpcyBvbmVcIiBidXQgaXQgd29ya3MgbGlrZSB0aGlzIHRvb1xuXHRcdFx0XHRcdFx0XHRcdHJpZ2h0Qm9yZGVyOiBhbGxCYWNrZ3JvdW5kQ29sdW1uc0FyZVZpc2libGUgJiYgaW5kZXggIT09IG1haW5TbGlkZXJDb2x1bW5zLmxlbmd0aCAtIDEsXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdHN0eWxlcy5pc1VzaW5nQm90dG9tTmF2aWdhdGlvbigpICYmICFjbGllbnQuaXNDYWxlbmRhckFwcCgpID8gYXR0cnMuYm90dG9tTmF2IDogbnVsbCxcblx0XHRcdFx0XHR0aGlzLmdldENvbHVtbnNGb3JPdmVybGF5KCkubWFwKChjKSA9PiBtKGMsIHt9KSksXG5cdFx0XHRcdFx0dGhpcy5lbmFibGVEcmF3ZXIgPyB0aGlzLmNyZWF0ZU1vZGFsQmFja2dyb3VuZCgpIDogbnVsbCxcblx0XHRcdFx0XSxcblx0XHRcdClcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGdldENvbHVtblJvbGUoY29sdW1uOiBWaWV3Q29sdW1uKTogQXJpYUxhbmRtYXJrcyB8IG51bGwge1xuXHRcdC8vIHJvbGUgIGZvciBmb3JlZ3JvdW5kIGNvbHVtbiBpcyBoYW5kbGVkIGluc2lkZSBGb2xkZXJDb2x1bW5WaWV3XG5cdFx0aWYgKGNvbHVtbi5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkZvcmVncm91bmQpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubWFpbkNvbHVtbiA9PT0gY29sdW1uID8gQXJpYUxhbmRtYXJrcy5NYWluIDogQXJpYUxhbmRtYXJrcy5SZWdpb25cblx0fVxuXG5cdGdldE1haW5Db2x1bW4oKTogVmlld0NvbHVtbiB7XG5cdFx0cmV0dXJuIHRoaXMubWFpbkNvbHVtblxuXHR9XG5cblx0cHJpdmF0ZSBnZXRDb2x1bW5zRm9yTWFpblNsaWRlcigpOiBBcnJheTxWaWV3Q29sdW1uPiB7XG5cdFx0cmV0dXJuIHRoaXMudmlld0NvbHVtbnMuZmlsdGVyKChjKSA9PiBjLmNvbHVtblR5cGUgPT09IENvbHVtblR5cGUuQmFja2dyb3VuZCB8fCBjLmlzVmlzaWJsZSlcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q29sdW1uc0Zvck92ZXJsYXkoKTogQXJyYXk8Vmlld0NvbHVtbj4ge1xuXHRcdHJldHVybiB0aGlzLnZpZXdDb2x1bW5zLmZpbHRlcigoYykgPT4gYy5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkZvcmVncm91bmQgJiYgIWMuaXNWaXNpYmxlKVxuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVNb2RhbEJhY2tncm91bmQoKTogQ2hpbGRyZW4ge1xuXHRcdGlmICh0aGlzLmlzTW9kYWxCYWNrZ3JvdW5kVmlzaWJsZSkge1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0bShcIi5maWxsLWFic29sdXRlLndpbGwtY2hhbmdlLWFscGhhXCIsIHtcblx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0ekluZGV4OiBMYXllclR5cGUuRm9yZWdyb3VuZE1lbnUsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmJ1c3kudGhlbigoKSA9PiBhbmltYXRpb25zLmFkZCh2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQsIGFscGhhKEFscGhhRW51bS5CYWNrZ3JvdW5kQ29sb3IsIHRoZW1lLm1vZGFsX2JnLCAwLCAwLjUpKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9uYmVmb3JlcmVtb3ZlOiAodm5vZGUpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmJ1c3kudGhlbigoKSA9PiBhbmltYXRpb25zLmFkZCh2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQsIGFscGhhKEFscGhhRW51bS5CYWNrZ3JvdW5kQ29sb3IsIHRoZW1lLm1vZGFsX2JnLCAwLjUsIDApKSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuZm9jdXModGhpcy52aXNpYmxlQmFja2dyb3VuZENvbHVtbnNbMF0pXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSksXG5cdFx0XHRdXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBbXVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlVmlzaWJsZUJhY2tncm91bmRDb2x1bW5zKCkge1xuXHRcdHRoaXMuZm9jdXNlZENvbHVtbiA9IHRoaXMuZm9jdXNlZENvbHVtbiB8fCB0aGlzLm1haW5Db2x1bW5cblx0XHRsZXQgdmlzaWJsZUNvbHVtbnM6IFZpZXdDb2x1bW5bXSA9IFt0aGlzLmZvY3VzZWRDb2x1bW4uY29sdW1uVHlwZSA9PT0gQ29sdW1uVHlwZS5CYWNrZ3JvdW5kID8gdGhpcy5mb2N1c2VkQ29sdW1uIDogdGhpcy5tYWluQ29sdW1uXVxuXHRcdGxldCByZW1haW5pbmdTcGFjZSA9IHdpbmRvdy5pbm5lcldpZHRoIC0gdmlzaWJsZUNvbHVtbnNbMF0ubWluV2lkdGhcblx0XHRsZXQgbmV4dFZpc2libGVDb2x1bW4gPSB0aGlzLmdldE5leHRWaXNpYmxlQ29sdW1uKHZpc2libGVDb2x1bW5zLCB0aGlzLnZpZXdDb2x1bW5zKVxuXG5cdFx0d2hpbGUgKG5leHRWaXNpYmxlQ29sdW1uICYmIHJlbWFpbmluZ1NwYWNlID49IG5leHRWaXNpYmxlQ29sdW1uLm1pbldpZHRoKSB7XG5cdFx0XHR2aXNpYmxlQ29sdW1ucy5wdXNoKG5leHRWaXNpYmxlQ29sdW1uKVxuXHRcdFx0cmVtYWluaW5nU3BhY2UgLT0gbmV4dFZpc2libGVDb2x1bW4ubWluV2lkdGhcblx0XHRcdG5leHRWaXNpYmxlQ29sdW1uID0gdGhpcy5nZXROZXh0VmlzaWJsZUNvbHVtbih2aXNpYmxlQ29sdW1ucywgdGhpcy52aWV3Q29sdW1ucylcblx0XHR9XG5cblx0XHQvLyB2aXNpYmxlIGNvbHVtbnMgbXVzdCBiZSBzb3J0IGJ5IHRoZSBpbml0aWFsIGNvbHVtbiBvcmRlclxuXHRcdHZpc2libGVDb2x1bW5zLnNvcnQoKGEsIGIpID0+IHRoaXMudmlld0NvbHVtbnMuaW5kZXhPZihhKSAtIHRoaXMudmlld0NvbHVtbnMuaW5kZXhPZihiKSlcblxuXHRcdHRoaXMuZGlzdHJpYnV0ZVJlbWFpbmluZ1NwYWNlKHZpc2libGVDb2x1bW5zLCByZW1haW5pbmdTcGFjZSlcblxuXHRcdHRoaXMuc2V0V2lkdGhGb3JIaWRkZW5Db2x1bW5zKHZpc2libGVDb2x1bW5zKVxuXG5cdFx0Zm9yIChjb25zdCBjb2x1bW4gb2YgdGhpcy52aWV3Q29sdW1ucykge1xuXHRcdFx0Y29sdW1uLmlzVmlzaWJsZSA9IHZpc2libGVDb2x1bW5zLmluY2x1ZGVzKGNvbHVtbilcblx0XHR9XG5cdFx0dGhpcy51cGRhdGVPZmZzZXRzKClcblx0XHR0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucyA9IHZpc2libGVDb2x1bW5zXG5cblx0XHRpZiAodGhpcy5hbGxDb2x1bW5zVmlzaWJsZSgpKSB7XG5cdFx0XHR0aGlzLmZvY3VzZWRDb2x1bW4uaXNJbkZvcmVncm91bmQgPSBmYWxzZVxuXHRcdFx0dGhpcy5pc01vZGFsQmFja2dyb3VuZFZpc2libGUgPSBmYWxzZVxuXG5cdFx0XHRpZiAodGhpcy52aWV3Q29sdW1uc1swXS5kb21Db2x1bW4pIHtcblx0XHRcdFx0dGhpcy52aWV3Q29sdW1uc1swXS5kb21Db2x1bW4uc3R5bGUudHJhbnNmb3JtID0gXCJcIlxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gbS5yZWRyYXcoKSlcblx0fVxuXG5cdGdldFZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucygpOiBWaWV3Q29sdW1uW10ge1xuXHRcdHJldHVybiB0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucy5zbGljZSgpXG5cdH1cblxuXHRpc1VzaW5nT3ZlcmxheUNvbHVtbnMoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlld0NvbHVtbnMuZXZlcnkoKGMpID0+IGMuY29sdW1uVHlwZSAhPT0gQ29sdW1uVHlwZS5Gb3JlZ3JvdW5kIHx8IGMuaXNWaXNpYmxlKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG5leHQgY29sdW1uIHdoaWNoIHNob3VsZCBiZWNvbWUgdmlzaWJsZVxuXHQgKiBAcGFyYW0gdmlzaWJsZUNvbHVtbnMgQWxsIGNvbHVtbnMgdGhhdCB3aWxsIGRlZmluaXRlbHkgYmUgdmlzaWJsZVxuXHQgKiBAcGFyYW0gYWxsQ29sdW1ucyBBbGwgY29sdW1ucypcblx0ICovXG5cdGdldE5leHRWaXNpYmxlQ29sdW1uKHZpc2libGVDb2x1bW5zOiBWaWV3Q29sdW1uW10sIGFsbENvbHVtbnM6IFZpZXdDb2x1bW5bXSk6IFZpZXdDb2x1bW4gfCBudWxsIHtcblx0XHQvLyBGaXJzdDogdHJ5IHRvIGZpbmQgYSBiYWNrZ3JvdW5kIGNvbHVtbiB3aGljaCBpcyBub3QgdmlzaWJsZVxuXHRcdGxldCBuZXh0Q29sdW1uID0gYWxsQ29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdHJldHVybiBjb2x1bW4uY29sdW1uVHlwZSA9PT0gQ29sdW1uVHlwZS5CYWNrZ3JvdW5kICYmIHZpc2libGVDb2x1bW5zLmluZGV4T2YoY29sdW1uKSA8IDBcblx0XHR9KVxuXG5cdFx0aWYgKCFuZXh0Q29sdW1uKSB7XG5cdFx0XHQvLyBTZWNvbmQ6IGlmIG5vIG1vcmUgYmFja2dyb3VuZCBjb2x1bW5zIGFyZSBhdmFpbGFibGUgYWRkIHRoZSBmb3JlZ3JvdW5kIGNvbHVtbiB0byB0aGUgdmlzaWJsZSBjb2x1bW5zXG5cdFx0XHRuZXh0Q29sdW1uID0gYWxsQ29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdFx0cmV0dXJuIGNvbHVtbi5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkZvcmVncm91bmQgJiYgdmlzaWJsZUNvbHVtbnMuaW5kZXhPZihjb2x1bW4pIDwgMFxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV4dENvbHVtbiA/PyBudWxsXG5cdH1cblxuXHRnZXRCYWNrZ3JvdW5kQ29sdW1ucygpOiBWaWV3Q29sdW1uW10ge1xuXHRcdHJldHVybiB0aGlzLnZpZXdDb2x1bW5zLmZpbHRlcigoYykgPT4gYy5jb2x1bW5UeXBlID09PSBDb2x1bW5UeXBlLkJhY2tncm91bmQpXG5cdH1cblxuXHQvKipcblx0ICogZGlzdHJpYnV0ZXMgdGhlIHJlbWFpbmluZyBzcGFjZSB0byBhbGwgdmlzaWJsZSBjb2x1bW5zXG5cdCAqIEBwYXJhbSB2aXNpYmxlQ29sdW1uc1xuXHQgKiBAcGFyYW0gcmVtYWluaW5nU3BhY2Vcblx0ICovXG5cdHByaXZhdGUgZGlzdHJpYnV0ZVJlbWFpbmluZ1NwYWNlKHZpc2libGVDb2x1bW5zOiBWaWV3Q29sdW1uW10sIHJlbWFpbmluZ1NwYWNlOiBudW1iZXIpIHtcblx0XHRsZXQgc3BhY2VQZXJDb2x1bW4gPSByZW1haW5pbmdTcGFjZSAvIHZpc2libGVDb2x1bW5zLmxlbmd0aFxuXHRcdGZvciAoY29uc3QgW2luZGV4LCB2aXNpYmxlQ29sdW1uXSBvZiB2aXNpYmxlQ29sdW1ucy5lbnRyaWVzKCkpIHtcblx0XHRcdGlmICh2aXNpYmxlQ29sdW1ucy5sZW5ndGggLSAxID09PSBpbmRleCkge1xuXHRcdFx0XHQvLyBpZ25vcmUgbWF4IHdpZHRoIGZvciB0aGUgbGFzdCB2aXNpYmxlIGNvbHVtblxuXHRcdFx0XHR2aXNpYmxlQ29sdW1uLndpZHRoID0gdmlzaWJsZUNvbHVtbi5taW5XaWR0aCArIHJlbWFpbmluZ1NwYWNlXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgc3BhY2VGb3JUaGlzQ29sdW1uID0gTWF0aC5taW4oc3BhY2VQZXJDb2x1bW4sIHZpc2libGVDb2x1bW4ubWF4V2lkdGggLSB2aXNpYmxlQ29sdW1uLm1pbldpZHRoKVxuXHRcdFx0XHRyZW1haW5pbmdTcGFjZSAtPSBzcGFjZUZvclRoaXNDb2x1bW5cblx0XHRcdFx0dmlzaWJsZUNvbHVtbi53aWR0aCA9IHZpc2libGVDb2x1bW4ubWluV2lkdGggKyBzcGFjZUZvclRoaXNDb2x1bW5cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHNldFdpZHRoRm9ySGlkZGVuQ29sdW1ucyh2aXNpYmxlQ29sdW1uczogVmlld0NvbHVtbltdKSB7XG5cdFx0Ly8gaWYgYWxsIGNvbHVtbnMgYXJlIHZpc2libGUgdGhlcmUgaXMgbm8gbmVlZCB0byBzZXQgdGhlIHdpZHRoXG5cdFx0aWYgKHRoaXMudmlld0NvbHVtbnMubGVuZ3RoID09PSB2aXNpYmxlQ29sdW1ucy5sZW5ndGgpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdC8vIGlmIG9ubHkgb25lIGNvbHVtbiBpcyB2aXNpYmxlIHNldCB0aGUgc2FtZSB3aWR0aCBmb3IgYWxsIGNvbHVtbnMgaWdub3JpbmcgbWF4IHdpZHRoXG5cdFx0aWYgKHZpc2libGVDb2x1bW5zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0Zm9yIChjb25zdCBjb2x1bW4gb2YgdGhpcy52aWV3Q29sdW1ucykge1xuXHRcdFx0XHRjb2x1bW4ud2lkdGggPSB2aXNpYmxlQ29sdW1uc1swXS53aWR0aFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFJlZHVjZSB0aGUgd2lkdGggb2YgdGhlIGZvcmVncm91bmQgYnV0dG9uIHRvIGtlZXAgYWx3YXlzIGEgc21hbGwgcGFydCBvZiB0aGUgYmFja2dyb3VuZCBidXR0b24gdmlzaWJsZS5cblx0XHRsZXQgZm9yZUdyb3VuZENvbHVtbiA9IHRoaXMudmlld0NvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4uY29sdW1uVHlwZSA9PT0gQ29sdW1uVHlwZS5Gb3JlZ3JvdW5kKVxuXG5cdFx0aWYgKGZvcmVHcm91bmRDb2x1bW4pIHtcblx0XHRcdGxldCByZW1haW5pbmdTcGFjZSA9IHdpbmRvdy5pbm5lcldpZHRoIC0gZm9yZUdyb3VuZENvbHVtbi5taW5XaWR0aCAtIHNpemUuaHBhZF9sYXJnZVxuXHRcdFx0bGV0IGFkZGl0aW9uYWxTcGFjZUZvckNvbHVtbiA9IE1hdGgubWluKHJlbWFpbmluZ1NwYWNlLCBmb3JlR3JvdW5kQ29sdW1uLm1heFdpZHRoIC0gZm9yZUdyb3VuZENvbHVtbi5taW5XaWR0aClcblx0XHRcdGZvcmVHcm91bmRDb2x1bW4ud2lkdGggPSBmb3JlR3JvdW5kQ29sdW1uLm1pbldpZHRoICsgYWRkaXRpb25hbFNwYWNlRm9yQ29sdW1uXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZm9jdXModmlld0NvbHVtbjogVmlld0NvbHVtbik6IFByb21pc2U8dW5rbm93bj4ge1xuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmJ1c3lcblx0XHRcdGlmICh0aGlzLmZvY3VzZWRDb2x1bW4gPT09IHZpZXdDb2x1bW4pIHJldHVyblxuXHRcdFx0Ly8gaGlkZSB0aGUgZm9yZWdyb3VuZCBjb2x1bW4gaWYgdGhlIGNvbHVtbiBpcyBpbiBmb3JlZ3JvdW5kXG5cdFx0XHRpZiAodGhpcy5mb2N1c2VkQ29sdW1uLmlzSW5Gb3JlZ3JvdW5kKSB7XG5cdFx0XHRcdHRoaXMuYnVzeSA9IHRoaXMuc2xpZGVGb3JlZ3JvdW5kQ29sdW1uKHRoaXMuZm9jdXNlZENvbHVtbiwgZmFsc2UpXG5cdFx0XHRcdGF3YWl0IHRoaXMuYnVzeVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmZvY3VzZWRDb2x1bW4gPSB2aWV3Q29sdW1uXG5cdFx0XHRpZiAoXG5cdFx0XHRcdHZpZXdDb2x1bW4uY29sdW1uVHlwZSA9PT0gQ29sdW1uVHlwZS5CYWNrZ3JvdW5kICYmXG5cdFx0XHRcdHRoaXMudmlzaWJsZUJhY2tncm91bmRDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0XHR0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucy5pbmRleE9mKHZpZXdDb2x1bW4pIDwgMFxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGN1cnJlbnRPZmZzZXQgPSB0aGlzLmRvbVNsaWRpbmdQYXJ0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnRcblx0XHRcdFx0dGhpcy5idXN5ID0gdGhpcy5zbGlkZUJhY2tncm91bmRDb2x1bW5zKHZpZXdDb2x1bW4sIGN1cnJlbnRPZmZzZXQsIHRoaXMuZ2V0T2Zmc2V0KHZpZXdDb2x1bW4pKVxuXHRcdFx0fSBlbHNlIGlmICh2aWV3Q29sdW1uLmNvbHVtblR5cGUgPT09IENvbHVtblR5cGUuRm9yZWdyb3VuZCAmJiB0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucy5pbmRleE9mKHZpZXdDb2x1bW4pIDwgMCkge1xuXHRcdFx0XHR0aGlzLmJ1c3kgPSB0aGlzLnNsaWRlRm9yZWdyb3VuZENvbHVtbih2aWV3Q29sdW1uLCB0cnVlKVxuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLmJ1c3lcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Ly8gZm9yIHVwZGF0aW5nIGhlYWRlciBiYXIgYWZ0ZXIgYW5pbWF0aW9uXG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0XHR2aWV3Q29sdW1uLmZvY3VzKClcblx0XHR9XG5cdH1cblxuXHR3YWl0Rm9yQW5pbWF0aW9uKCk6IFByb21pc2U8dW5rbm93bj4ge1xuXHRcdHJldHVybiB0aGlzLmJ1c3lcblx0fVxuXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBhIHNsaWRlIGFuaW1hdGlvbiBmb3IgdGhlIGJhY2tncm91bmQgYnV0dG9ucy5cblx0ICovXG5cdHByaXZhdGUgc2xpZGVCYWNrZ3JvdW5kQ29sdW1ucyhuZXh0VmlzaWJsZVZpZXdDb2x1bW46IFZpZXdDb2x1bW4sIG9sZE9mZnNldDogbnVtYmVyLCBuZXdPZmZzZXQ6IG51bWJlcik6IFByb21pc2U8dW5rbm93bj4ge1xuXHRcdHJldHVybiBhbmltYXRpb25zXG5cdFx0XHQuYWRkKHRoaXMuZG9tU2xpZGluZ1BhcnQsIHRyYW5zZm9ybShUcmFuc2Zvcm1FbnVtLlRyYW5zbGF0ZVgsIG9sZE9mZnNldCwgbmV3T2Zmc2V0KSwge1xuXHRcdFx0XHRlYXNpbmc6IGVhc2UuaW5PdXQsXG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHQvLyByZXBsYWNlIHRoZSB2aXNpYmxlIGNvbHVtblxuXHRcdFx0XHRjb25zdCBbcmVtb3ZlZF0gPSB0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1ucy5zcGxpY2UoMCwgMSwgbmV4dFZpc2libGVWaWV3Q29sdW1uKVxuXG5cdFx0XHRcdHJlbW92ZWQuaXNWaXNpYmxlID0gZmFsc2Vcblx0XHRcdFx0bmV4dFZpc2libGVWaWV3Q29sdW1uLmlzVmlzaWJsZSA9IHRydWVcblx0XHRcdH0pXG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZXMgYSBzbGlkZSBhbmltYXRpb24gZm9yIHRoZSBmb3JlZ3JvdW5kIGJ1dHRvbi5cblx0ICovXG5cdHByaXZhdGUgc2xpZGVGb3JlZ3JvdW5kQ29sdW1uKGZvcmVncm91bmRDb2x1bW46IFZpZXdDb2x1bW4sIHRvRm9yZWdyb3VuZDogYm9vbGVhbik6IFByb21pc2U8dW5rbm93bj4ge1xuXHRcdGlmICghZm9yZWdyb3VuZENvbHVtbi5kb21Db2x1bW4pIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXG5cdFx0Ly8gUmVtb3ZlIHRoZSBgdmlzaWJpbGl0eTogaGlkZGVuYCBmcm9tIHRoZSB0YXJnZXQgY29sdW1uIGJlZm9yZSBzdGFydGluZyB0aGUgYW5pbWF0aW9uLCBzbyBpdCBpcyB2aXNpYmxlIGR1cmluZyB0aGUgYW5pbWF0aW9uXG5cdFx0Zm9yZWdyb3VuZENvbHVtbi5kb21Db2x1bW4uc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiXG5cblx0XHRjb25zdCBjb2xSZWN0ID0gZm9yZWdyb3VuZENvbHVtbi5kb21Db2x1bW4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuXHRcdGNvbnN0IG9sZE9mZnNldCA9IGNvbFJlY3QubGVmdFxuXHRcdGxldCBuZXdPZmZzZXQgPSBmb3JlZ3JvdW5kQ29sdW1uLmdldE9mZnNldEZvcmVncm91bmQodG9Gb3JlZ3JvdW5kKVxuXHRcdHRoaXMuaXNNb2RhbEJhY2tncm91bmRWaXNpYmxlID0gdG9Gb3JlZ3JvdW5kXG5cdFx0cmV0dXJuIGFuaW1hdGlvbnNcblx0XHRcdC5hZGQoYXNzZXJ0Tm90TnVsbChmb3JlZ3JvdW5kQ29sdW1uLmRvbUNvbHVtbiwgXCJmb3JlZ3JvdW5kIGNvbHVtbiBoYXMgbm8gZG9tY29sdW1uXCIpLCB0cmFuc2Zvcm0oVHJhbnNmb3JtRW51bS5UcmFuc2xhdGVYLCBvbGRPZmZzZXQsIG5ld09mZnNldCksIHtcblx0XHRcdFx0ZWFzaW5nOiBlYXNlLmluLFxuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0Zm9yZWdyb3VuZENvbHVtbi5pc0luRm9yZWdyb3VuZCA9IHRvRm9yZWdyb3VuZFxuXHRcdFx0fSlcblx0fVxuXG5cdHVwZGF0ZU9mZnNldHMoKSB7XG5cdFx0bGV0IG9mZnNldCA9IDBcblxuXHRcdGZvciAobGV0IGNvbHVtbiBvZiB0aGlzLnZpZXdDb2x1bW5zKSB7XG5cdFx0XHRpZiAoY29sdW1uLmNvbHVtblR5cGUgPT09IENvbHVtblR5cGUuQmFja2dyb3VuZCB8fCBjb2x1bW4uaXNWaXNpYmxlKSB7XG5cdFx0XHRcdGNvbHVtbi5vZmZzZXQgPSBvZmZzZXRcblx0XHRcdFx0b2Zmc2V0ICs9IGNvbHVtbi53aWR0aFxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldFdpZHRoKCk6IG51bWJlciB7XG5cdFx0bGV0IGxhc3RDb2x1bW4gPSB0aGlzLnZpZXdDb2x1bW5zW3RoaXMudmlld0NvbHVtbnMubGVuZ3RoIC0gMV1cblx0XHRyZXR1cm4gbGFzdENvbHVtbi5vZmZzZXQgKyBsYXN0Q29sdW1uLndpZHRoXG5cdH1cblxuXHRnZXRPZmZzZXQoY29sdW1uOiBWaWV3Q29sdW1uKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gMCAtIGNvbHVtbi5vZmZzZXRcblx0fVxuXG5cdGlzRm9jdXNQcmV2aW91c1Bvc3NpYmxlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmdldFByZXZpb3VzQ29sdW1uKCkgIT0gbnVsbFxuXHR9XG5cblx0Zm9jdXNQcmV2aW91c0NvbHVtbigpOiBQcm9taXNlPHVua25vd24+IHtcblx0XHRpZiAodGhpcy5pc0ZvY3VzUHJldmlvdXNQb3NzaWJsZSgpKSB7XG5cdFx0XHR3aW5kb3cuZ2V0U2VsZWN0aW9uKCk/LmVtcHR5KCkgLy8gdHJ5IHRvIGRlc2VsZWN0IHRleHRcblx0XHRcdHJldHVybiB0aGlzLmZvY3VzKGFzc2VydE5vdE51bGwodGhpcy5nZXRQcmV2aW91c0NvbHVtbigpLCBcInByZXZpb3VzIGNvbHVtbiB3YXMgbnVsbCFcIikpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdH1cblx0fVxuXG5cdGZvY3VzTmV4dENvbHVtbigpIHtcblx0XHRjb25zdCBpbmRleE9mQ3VycmVudCA9IHRoaXMudmlld0NvbHVtbnMuaW5kZXhPZih0aGlzLmZvY3VzZWRDb2x1bW4pXG5cblx0XHRpZiAoaW5kZXhPZkN1cnJlbnQgKyAxIDwgdGhpcy52aWV3Q29sdW1ucy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuZm9jdXModGhpcy52aWV3Q29sdW1uc1tpbmRleE9mQ3VycmVudCArIDFdKVxuXHRcdH1cblx0fVxuXG5cdGdldFByZXZpb3VzQ29sdW1uKCk6IFZpZXdDb2x1bW4gfCBudWxsIHtcblx0XHRpZiAodGhpcy52aWV3Q29sdW1ucy5pbmRleE9mKHRoaXMudmlzaWJsZUJhY2tncm91bmRDb2x1bW5zWzBdKSA+IDAgJiYgIXRoaXMuZm9jdXNlZENvbHVtbi5pc0luRm9yZWdyb3VuZCkge1xuXHRcdFx0bGV0IHZpc2libGVDb2x1bW5JbmRleCA9IHRoaXMudmlld0NvbHVtbnMuaW5kZXhPZih0aGlzLnZpc2libGVCYWNrZ3JvdW5kQ29sdW1uc1swXSlcblx0XHRcdHJldHVybiB0aGlzLnZpZXdDb2x1bW5zW3Zpc2libGVDb2x1bW5JbmRleCAtIDFdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGxcblx0fVxuXG5cdGlzRmlyc3RCYWNrZ3JvdW5kQ29sdW1uRm9jdXNlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy52aWV3Q29sdW1ucy5maWx0ZXIoKGNvbHVtbikgPT4gY29sdW1uLmNvbHVtblR5cGUgPT09IENvbHVtblR5cGUuQmFja2dyb3VuZCkuaW5kZXhPZih0aGlzLmZvY3VzZWRDb2x1bW4pID09PSAwXG5cdH1cblxuXHRpc0ZvcmVncm91bmRDb2x1bW5Gb2N1c2VkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmZvY3VzZWRDb2x1bW4gJiYgdGhpcy5mb2N1c2VkQ29sdW1uLmNvbHVtblR5cGUgPT09IENvbHVtblR5cGUuRm9yZWdyb3VuZFxuXHR9XG5cblx0YWxsQ29sdW1uc1Zpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmlzaWJsZUJhY2tncm91bmRDb2x1bW5zLmxlbmd0aCA9PT0gdGhpcy52aWV3Q29sdW1ucy5sZW5ndGhcblx0fVxuXG5cdGF0dGFjaFRvdWNoSGFuZGxlcihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuXHRcdGxldCBsYXN0R2VzdHVyZUluZm86IEdlc3R1cmVJbmZvIHwgbnVsbFxuXHRcdGxldCBvbGRHZXN0dXJlSW5mbzogR2VzdHVyZUluZm8gfCBudWxsXG5cdFx0bGV0IGluaXRpYWxHZXN0dXJlSW5mbzogR2VzdHVyZUluZm8gfCBudWxsXG5cdFx0Y29uc3QgVkVSVElDQUwgPSAxXG5cdFx0Y29uc3QgSE9SSVpPTlRBTCA9IDJcblx0XHRsZXQgZGlyZWN0aW9uTG9jazogMCB8IDEgfCAyID0gMFxuXG5cdFx0Y29uc3QgZ2VzdHVyZUVuZCA9IChldmVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBzYWZlTGFzdEdlc3R1cmVJbmZvID0gbGFzdEdlc3R1cmVJbmZvXG5cdFx0XHRjb25zdCBzYWZlT2xkR2VzdHVyZUluZm8gPSBvbGRHZXN0dXJlSW5mb1xuXG5cdFx0XHRpZiAoc2FmZUxhc3RHZXN0dXJlSW5mbyAmJiBzYWZlT2xkR2VzdHVyZUluZm8gJiYgIXRoaXMuYWxsQ29sdW1uc1Zpc2libGUoKSkge1xuXHRcdFx0XHRjb25zdCB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdXG5cdFx0XHRcdGNvbnN0IG1haW5Db2wgPSB0aGlzLm1haW5Db2x1bW4uZG9tQ29sdW1uXG5cblx0XHRcdFx0Y29uc3Qgc2lkZUNvbCA9IHRoaXMuZ2V0U2lkZUNvbERvbSgpXG5cblx0XHRcdFx0aWYgKCFtYWluQ29sIHx8ICFzaWRlQ29sKSB7XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBtYWluQ29sUmVjdCA9IG1haW5Db2wuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblx0XHRcdFx0Y29uc3QgdmVsb2NpdHkgPSAoc2FmZUxhc3RHZXN0dXJlSW5mby54IC0gc2FmZU9sZEdlc3R1cmVJbmZvLngpIC8gKHNhZmVMYXN0R2VzdHVyZUluZm8udGltZSAtIHNhZmVPbGRHZXN0dXJlSW5mby50aW1lKVxuXG5cdFx0XHRcdGNvbnN0IHNob3cgPSAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5mb2N1c2VkQ29sdW1uID0gdGhpcy52aWV3Q29sdW1uc1swXVxuXHRcdFx0XHRcdHRoaXMuYnVzeSA9IHRoaXMuc2xpZGVGb3JlZ3JvdW5kQ29sdW1uKHRoaXMudmlld0NvbHVtbnNbMF0sIHRydWUpXG5cdFx0XHRcdFx0dGhpcy5pc01vZGFsQmFja2dyb3VuZFZpc2libGUgPSB0cnVlXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBoaWRlID0gKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuZm9jdXNlZENvbHVtbiA9IHRoaXMudmlld0NvbHVtbnNbMV1cblx0XHRcdFx0XHR0aGlzLmJ1c3kgPSB0aGlzLnNsaWRlRm9yZWdyb3VuZENvbHVtbih0aGlzLnZpZXdDb2x1bW5zWzBdLCBmYWxzZSlcblx0XHRcdFx0XHR0aGlzLmlzTW9kYWxCYWNrZ3JvdW5kVmlzaWJsZSA9IGZhbHNlXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBHZXN0dXJlIGZvciB0aGUgc2lkZSBjb2x1bW5cblx0XHRcdFx0aWYgKHRoaXMuZ2V0QmFja2dyb3VuZENvbHVtbnMoKVswXS5pc1Zpc2libGUgfHwgdGhpcy5mb2N1c2VkQ29sdW1uLmlzSW5Gb3JlZ3JvdW5kKSB7XG5cdFx0XHRcdFx0Ly8gR2VzdHVyZSB3YXMgd2l0aCBlbm91Z2ggdmVsb2NpdHkgdG8gc2hvdyB0aGUgbWVudVxuXHRcdFx0XHRcdGlmICh2ZWxvY2l0eSA+IDAuOCkge1xuXHRcdFx0XHRcdFx0c2hvdygpIC8vIEdlc3R1cmUgd2FzIHdpdGggZW5vdWdoIHZlbG9jaXR5IHRvIGhpZGUgdGhlIG1lbnUgYW5kIHdlJ3JlIG5vdCBzY3JvbGxpbmcgdmVydGljYWxseVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodmVsb2NpdHkgPCAtMC44ICYmIGRpcmVjdGlvbkxvY2sgIT09IFZFUlRJQ0FMKSB7XG5cdFx0XHRcdFx0XHRoaWRlKClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gRmluZ2VyIHdhcyByZWxlYXNlZCB3aXRob3V0IG11Y2ggdmVsb2NpdHkgc28gaWYgaXQncyBmdXJ0aGVyIHRoYW4gc29tZSBkaXN0YW5jZSBmcm9tIGVkZ2UsIG9wZW4gbWVudS4gT3RoZXJ3aXNlLCBjbG9zZSBpdC5cblx0XHRcdFx0XHRcdGlmICh0b3VjaC5wYWdlWCA+IG1haW5Db2xSZWN0LmxlZnQgKyAxMDApIHtcblx0XHRcdFx0XHRcdFx0c2hvdygpXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGRpcmVjdGlvbkxvY2sgIT09IFZFUlRJQ0FMKSB7XG5cdFx0XHRcdFx0XHRcdGhpZGUoKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBHZXN0dXJlIGZvciBzbGlkaW5nIG90aGVyIGNvbHVtbnNcblx0XHRcdFx0XHRpZiAoKHNhZmVMYXN0R2VzdHVyZUluZm8ueCA+IHdpbmRvdy5pbm5lcldpZHRoIC8gMyB8fCB2ZWxvY2l0eSA+IDAuOCkgJiYgZGlyZWN0aW9uTG9jayAhPT0gVkVSVElDQUwpIHtcblx0XHRcdFx0XHRcdHRoaXMuZm9jdXNQcmV2aW91c0NvbHVtbigpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbFJlY3QgPSB0aGlzLmRvbVNsaWRpbmdQYXJ0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHRcdFx0XHRcdC8vIFJlLWZvY3VzIHRoZSBjb2x1bW4gdG8gcmVzZXQgb2Zmc2V0IGNoYW5nZWQgYnkgdGhlIGdlc3R1cmVcblx0XHRcdFx0XHRcdHRoaXMuYnVzeSA9IHRoaXMuc2xpZGVCYWNrZ3JvdW5kQ29sdW1ucyh0aGlzLmZvY3VzZWRDb2x1bW4sIGNvbFJlY3QubGVmdCwgLXRoaXMuZm9jdXNlZENvbHVtbi5vZmZzZXQpXG5cdFx0XHRcdFx0XHR0aGlzLmZvY3VzKHRoaXMuZm9jdXNlZENvbHVtbilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmJ1c3kudGhlbigoKSA9PiBtLnJlZHJhdygpKVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0b3VjaCBhbmQgbm90IGFub3RoZXIgb25lXG5cdFx0XHRpZiAoc2FmZUxhc3RHZXN0dXJlSW5mbyAmJiBzYWZlTGFzdEdlc3R1cmVJbmZvLmlkZW50aWZpZXIgPT09IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXIpIHtcblx0XHRcdFx0bGFzdEdlc3R1cmVJbmZvID0gbnVsbFxuXHRcdFx0XHRvbGRHZXN0dXJlSW5mbyA9IG51bGxcblx0XHRcdFx0aW5pdGlhbEdlc3R1cmVJbmZvID0gbnVsbFxuXHRcdFx0XHRkaXJlY3Rpb25Mb2NrID0gMFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGxpc3RlbmVycyA9IHtcblx0XHRcdHRvdWNoc3RhcnQ6IChldmVudDogYW55KSA9PiB7XG5cdFx0XHRcdGlmIChsYXN0R2VzdHVyZUluZm8pIHtcblx0XHRcdFx0XHQvLyBBbHJlYWR5IGRldGVjdGluZyBhIGdlc3R1cmUsIGlnbm9yZSBzZWNvbmQgb25lXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBtYWluQ29sID0gdGhpcy5tYWluQ29sdW1uLmRvbUNvbHVtblxuXG5cdFx0XHRcdGNvbnN0IHNpZGVDb2wgPSB0aGlzLmdldFNpZGVDb2xEb20oKVxuXG5cdFx0XHRcdGlmICghbWFpbkNvbCB8fCAhc2lkZUNvbCB8fCB0aGlzLmFsbENvbHVtbnNWaXNpYmxlKCkpIHtcblx0XHRcdFx0XHRsYXN0R2VzdHVyZUluZm8gPSBudWxsXG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDEgJiYgKHRoaXMudmlld0NvbHVtbnNbMF0uaXNJbkZvcmVncm91bmQgfHwgZXZlbnQudG91Y2hlc1swXS5wYWdlWCA8IDQwKSkge1xuXHRcdFx0XHRcdC8vIE9ubHkgc3RvcCBwcm9wb2dhdGlvbiB3aGlsZSB0aGUgbWVudSBpcyBub3QgeWV0IGZ1bGx5IHZpc2libGVcblx0XHRcdFx0XHRpZiAoIXRoaXMudmlld0NvbHVtbnNbMF0uaXNJbkZvcmVncm91bmQpIHtcblx0XHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGFzdEdlc3R1cmVJbmZvID0gaW5pdGlhbEdlc3R1cmVJbmZvID0gZ2VzdHVyZUluZm9Gcm9tVG91Y2goZXZlbnQudG91Y2hlc1swXSlcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHRvdWNobW92ZTogKGV2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3Qgc2lkZUNvbCA9IHRoaXMuZ2V0U2lkZUNvbERvbSgpXG5cblx0XHRcdFx0aWYgKCFzaWRlQ29sIHx8ICF0aGlzLm1haW5Db2x1bW4gfHwgdGhpcy5hbGxDb2x1bW5zVmlzaWJsZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBnZXN0dXJlSW5mbyA9IGxhc3RHZXN0dXJlSW5mb1xuXHRcdFx0XHRjb25zdCBzYWZlSW5pdGlhbEdlc3R1cmVJbmZvID0gaW5pdGlhbEdlc3R1cmVJbmZvXG5cblx0XHRcdFx0aWYgKGdlc3R1cmVJbmZvICYmIHNhZmVJbml0aWFsR2VzdHVyZUluZm8gJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRjb25zdCB0b3VjaCA9IGV2ZW50LnRvdWNoZXNbMF1cblx0XHRcdFx0XHRjb25zdCBuZXdUb3VjaFBvcyA9IHRvdWNoLnBhZ2VYXG5cdFx0XHRcdFx0Y29uc3Qgc2lkZUNvbFJlY3QgPSBzaWRlQ29sLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cdFx0XHRcdFx0b2xkR2VzdHVyZUluZm8gPSBsYXN0R2VzdHVyZUluZm9cblx0XHRcdFx0XHRjb25zdCBzYWZlTGFzdEluZm8gPSAobGFzdEdlc3R1cmVJbmZvID0gZ2VzdHVyZUluZm9Gcm9tVG91Y2godG91Y2gpKVxuXG5cdFx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBob3Jpem9uYWwgbG9jayBvciB3ZSBkb24ndCBoYXZlIHZlcnRpY2FsIGxvY2sgYnV0IHdvdWxkIGxpa2UgdG8gYWNxdWlyZSBob3Jpem9udGFsIG9uZSwgdGhlIGxvY2sgaG9yaXpvbnRhbGx5XG5cdFx0XHRcdFx0aWYgKGRpcmVjdGlvbkxvY2sgPT09IEhPUklaT05UQUwgfHwgKGRpcmVjdGlvbkxvY2sgIT09IFZFUlRJQ0FMICYmIE1hdGguYWJzKHNhZmVMYXN0SW5mby54IC0gc2FmZUluaXRpYWxHZXN0dXJlSW5mby54KSA+IDMwKSkge1xuXHRcdFx0XHRcdFx0ZGlyZWN0aW9uTG9jayA9IEhPUklaT05UQUxcblxuXHRcdFx0XHRcdFx0Ly8gR2VzdHVyZSBmb3Igc2lkZSBjb2x1bW5cblx0XHRcdFx0XHRcdGlmICh0aGlzLmdldEJhY2tncm91bmRDb2x1bW5zKClbMF0uaXNWaXNpYmxlIHx8IHRoaXMuZm9jdXNlZENvbHVtbi5pc0luRm9yZWdyb3VuZCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBuZXdUcmFuc2xhdGUgPSBNYXRoLm1pbihzaWRlQ29sUmVjdC5sZWZ0IC0gKGdlc3R1cmVJbmZvLnggLSBuZXdUb3VjaFBvcyksIDApXG5cdFx0XHRcdFx0XHRcdHNpZGVDb2wuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHtuZXdUcmFuc2xhdGV9cHgpYFxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gR2VzdHVyZSBmb3IgYmFja2dyb3VuZCBjb2x1bW5cblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2xpZGluZ0RvbVJlY3QgPSB0aGlzLmRvbVNsaWRpbmdQYXJ0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cblx0XHRcdFx0XHRcdFx0Ly8gRG8gbm90IGFsbG93IHRvIG1vdmUgY29sdW1uIHRvIHRoZSBsZWZ0XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5ld1RyYW5zbGF0ZSA9IE1hdGgubWF4KHNsaWRpbmdEb21SZWN0LmxlZnQgLSAoZ2VzdHVyZUluZm8ueCAtIG5ld1RvdWNoUG9zKSwgLXRoaXMuZm9jdXNlZENvbHVtbi5vZmZzZXQpXG5cdFx0XHRcdFx0XHRcdHRoaXMuZG9tU2xpZGluZ1BhcnQuc3R5bGUudHJhbnNmb3JtID0gYHRyYW5zbGF0ZVgoJHtuZXdUcmFuc2xhdGV9cHgpYFxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBTY3JvbGwgZXZlbnRzIGFyZSBub3QgY2FuY2VsbGFibGUgYW5kIGJyb3dzZWVzIGNvbXBsYWluIGEgbG90XG5cdFx0XHRcdFx0XHRpZiAoZXZlbnQuY2FuY2VsYWJsZSAhPT0gZmFsc2UpIGV2ZW50LnByZXZlbnREZWZhdWx0KCkgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIHZlcnRpY2FsIGxvY2sgYnV0IHdlIHdvdWxkIGxpa2UgdG8gYWNxdWlyZSBvbmUsIGdldCBpdFxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoZGlyZWN0aW9uTG9jayAhPT0gVkVSVElDQUwgJiYgTWF0aC5hYnMoc2FmZUxhc3RJbmZvLnkgLSBzYWZlSW5pdGlhbEdlc3R1cmVJbmZvLnkpID4gMzApIHtcblx0XHRcdFx0XHRcdGRpcmVjdGlvbkxvY2sgPSBWRVJUSUNBTFxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR0b3VjaGVuZDogZ2VzdHVyZUVuZCxcblx0XHRcdHRvdWNoY2FuY2VsOiBnZXN0dXJlRW5kLFxuXHRcdH1cblxuXHRcdGZvciAobGV0IFtuYW1lLCBsaXN0ZW5lcl0gb2YgT2JqZWN0LmVudHJpZXMobGlzdGVuZXJzKSkge1xuXHRcdFx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGxpc3RlbmVyLCB0cnVlKVxuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IHsgbGFuZywgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBDbGlja0hhbmRsZXIgfSBmcm9tIFwiLi9iYXNlL0d1aVV0aWxzLmpzXCJcbmltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi90aGVtZS5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuL3NpemUuanNcIlxuaW1wb3J0IHsgQmFzZUJ1dHRvbiwgQmFzZUJ1dHRvbkF0dHJzIH0gZnJvbSBcIi4vYmFzZS9idXR0b25zL0Jhc2VCdXR0b24uanNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIE1haW5DcmVhdGVCdXR0b25BdHRycyB7XG5cdGxhYmVsOiBUcmFuc2xhdGlvbktleVxuXHRjbGljazogQ2xpY2tIYW5kbGVyXG5cdGNsYXNzPzogc3RyaW5nXG59XG5cbi8qKlxuICogTWFpbiBidXR0b24gdXNlZCB0byBvcGVuIHRoZSBjcmVhdGlvbiBkaWFsb2cgZm9yIGVtYWlscyxjb250YWN0cyBhbmQgZXZlbnRzLlxuICovXG5leHBvcnQgY2xhc3MgTWFpbkNyZWF0ZUJ1dHRvbiBpbXBsZW1lbnRzIENvbXBvbmVudDxNYWluQ3JlYXRlQnV0dG9uQXR0cnM+IHtcblx0dmlldyh2bm9kZTogVm5vZGU8TWFpbkNyZWF0ZUJ1dHRvbkF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShCYXNlQnV0dG9uLCB7XG5cdFx0XHRsYWJlbDogdm5vZGUuYXR0cnMubGFiZWwsXG5cdFx0XHR0ZXh0OiBsYW5nLmdldCh2bm9kZS5hdHRycy5sYWJlbCksXG5cdFx0XHRvbmNsaWNrOiB2bm9kZS5hdHRycy5jbGljayxcblx0XHRcdGNsYXNzOiBgZnVsbC13aWR0aCBib3JkZXItcmFkaXVzLWJpZyBjZW50ZXIgYiBmbGFzaCAke3Zub2RlLmF0dHJzLmNsYXNzfWAsXG5cdFx0XHRzdHlsZToge1xuXHRcdFx0XHRib3JkZXI6IGAycHggc29saWQgJHt0aGVtZS5jb250ZW50X2FjY2VudH1gLFxuXHRcdFx0XHQvLyBtYXRjaGluZyB0b29sYmFyXG5cdFx0XHRcdGhlaWdodDogcHgoc2l6ZS5idXR0b25faGVpZ2h0ICsgc2l6ZS52cGFkX3hzICogMiksXG5cdFx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X2FjY2VudCxcblx0XHRcdH0sXG5cdFx0fSBzYXRpc2ZpZXMgQmFzZUJ1dHRvbkF0dHJzKVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IE5ld3NJZCB9IGZyb20gXCIuLi8uLi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgTmV3c0xpc3RJdGVtIH0gZnJvbSBcIi4vTmV3c0xpc3RJdGVtLmpzXCJcbmltcG9ydCBDb2x1bW5FbXB0eU1lc3NhZ2VCb3ggZnJvbSBcIi4uLy4uL2d1aS9iYXNlL0NvbHVtbkVtcHR5TWVzc2FnZUJveC5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvaWNvbnMvSWNvbnMuanNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIE5ld3NMaXN0QXR0cnMge1xuXHRsaXZlTmV3c0xpc3RJdGVtczogUmVjb3JkPHN0cmluZywgTmV3c0xpc3RJdGVtPlxuXHRsaXZlTmV3c0lkczogTmV3c0lkW11cbn1cblxuLyoqXG4gKiBSZW5kZXJzIHRoZSB1c2VyJ3MgbGlzdCBvZiB1bmFja25vd2xlZGdlZCBuZXdzLlxuICovXG5leHBvcnQgY2xhc3MgTmV3c0xpc3QgaW1wbGVtZW50cyBDb21wb25lbnQ8TmV3c0xpc3RBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxOZXdzTGlzdEF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRpZiAodm5vZGUuYXR0cnMubGl2ZU5ld3NJZHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbShDb2x1bW5FbXB0eU1lc3NhZ2VCb3gsIHtcblx0XHRcdFx0bWVzc2FnZTogXCJub05ld3NfbXNnXCIsXG5cdFx0XHRcdGljb246IEljb25zLkJ1bGIsXG5cdFx0XHRcdGNvbG9yOiB0aGVtZS5jb250ZW50X21lc3NhZ2VfYmcsXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCJcIixcblx0XHRcdHZub2RlLmF0dHJzLmxpdmVOZXdzSWRzLm1hcCgobGl2ZU5ld3NJZCkgPT4ge1xuXHRcdFx0XHRjb25zdCBuZXdzTGlzdEl0ZW0gPSB2bm9kZS5hdHRycy5saXZlTmV3c0xpc3RJdGVtc1tsaXZlTmV3c0lkLm5ld3NJdGVtTmFtZV1cblxuXHRcdFx0XHRyZXR1cm4gbShcIi5wdC5wbC1sLnByLWwuZmxleC5maWxsLmJvcmRlci1ncmV5LmxlZnQubGlzdC1ib3JkZXItYm90dG9tXCIsIHsga2V5OiBsaXZlTmV3c0lkLm5ld3NJdGVtSWQgfSwgbmV3c0xpc3RJdGVtLnJlbmRlcihsaXZlTmV3c0lkKSlcblx0XHRcdH0pLFxuXHRcdClcblx0fVxufVxuIiwiaW1wb3J0IHsgQnV0dG9uQXR0cnMsIEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCBtLCB7IENvbXBvbmVudCB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IERpYWxvZ0hlYWRlckJhciwgRGlhbG9nSGVhZGVyQmFyQXR0cnMgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvRGlhbG9nSGVhZGVyQmFyLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgRGlhbG9nLCBEaWFsb2dUeXBlIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBLZXlzIH0gZnJvbSBcIi4uLy4uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgTmV3c0xpc3QgfSBmcm9tIFwiLi9OZXdzTGlzdC5qc1wiXG5pbXBvcnQgeyBOZXdzTW9kZWwgfSBmcm9tIFwiLi9OZXdzTW9kZWwuanNcIlxuaW1wb3J0IHsgcHJvZ3Jlc3NJY29uIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL0ljb24uanNcIlxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd05ld3NEaWFsb2cobmV3c01vZGVsOiBOZXdzTW9kZWwpIHtcblx0Y29uc3QgY2xvc2VCdXR0b246IEJ1dHRvbkF0dHJzID0ge1xuXHRcdGxhYmVsOiBcImNsb3NlX2FsdFwiLFxuXHRcdHR5cGU6IEJ1dHRvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRjbG9zZUFjdGlvbigpXG5cdFx0fSxcblx0fVxuXG5cdGNvbnN0IGNsb3NlQWN0aW9uID0gKCkgPT4ge1xuXHRcdGRpYWxvZy5jbG9zZSgpXG5cdH1cblx0Y29uc3QgaGVhZGVyOiBEaWFsb2dIZWFkZXJCYXJBdHRycyA9IHtcblx0XHRsZWZ0OiBbY2xvc2VCdXR0b25dLFxuXHRcdG1pZGRsZTogXCJuZXdzX2xhYmVsXCIsXG5cdH1cblxuXHRsZXQgbG9hZGVkID0gZmFsc2Vcblx0bmV3c01vZGVsLmxvYWROZXdzSWRzKCkudGhlbigoKSA9PiB7XG5cdFx0bG9hZGVkID0gdHJ1ZVxuXHRcdG0ucmVkcmF3KClcblx0fSlcblxuXHRjb25zdCBjaGlsZDogQ29tcG9uZW50ID0ge1xuXHRcdHZpZXc6ICgpID0+IHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdG0oXCJcIiwgW1xuXHRcdFx0XHRcdGxvYWRlZFxuXHRcdFx0XHRcdFx0PyBtKE5ld3NMaXN0LCB7XG5cdFx0XHRcdFx0XHRcdFx0bGl2ZU5ld3NJZHM6IG5ld3NNb2RlbC5saXZlTmV3c0lkcyxcblx0XHRcdFx0XHRcdFx0XHRsaXZlTmV3c0xpc3RJdGVtczogbmV3c01vZGVsLmxpdmVOZXdzTGlzdEl0ZW1zLFxuXHRcdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdFx0OiBtKFxuXHRcdFx0XHRcdFx0XHRcdFwiLmZsZXgtY2VudGVyLm10LWxcIixcblx0XHRcdFx0XHRcdFx0XHRtKFwiLmZsZXgtdi1jZW50ZXJcIiwgW20oXCIuZnVsbC13aWR0aC5mbGV4LWNlbnRlclwiLCBwcm9ncmVzc0ljb24oKSksIG0oXCJwXCIsIGxhbmcuZ2V0VHJhbnNsYXRpb25UZXh0KFwicGxlYXNlV2FpdF9tc2dcIikpXSksXG5cdFx0XHRcdFx0XHQgICksXG5cdFx0XHRcdF0pLFxuXHRcdFx0XVxuXHRcdH0sXG5cdH1cblxuXHRjb25zdCBkaWFsb2cgPSBuZXcgRGlhbG9nKERpYWxvZ1R5cGUuRWRpdExhcmdlLCB7XG5cdFx0dmlldzogKCkgPT4ge1xuXHRcdFx0cmV0dXJuIG0oXCJcIiwgW20oRGlhbG9nSGVhZGVyQmFyLCBoZWFkZXIpLCBtKFwiLmRpYWxvZy1jb250YWluZXIuc2Nyb2xsXCIsIG0oXCIuZmlsbC1hYnNvbHV0ZVwiLCBtKGNoaWxkKSkpXSlcblx0XHR9LFxuXHR9KS5hZGRTaG9ydGN1dCh7XG5cdFx0a2V5OiBLZXlzLkVTQyxcblx0XHRleGVjOiAoKSA9PiB7XG5cdFx0XHRjbG9zZUFjdGlvbigpXG5cdFx0fSxcblx0XHRoZWxwOiBcImNsb3NlX2FsdFwiLFxuXHR9KVxuXHRkaWFsb2cuc2hvdygpXG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IEJ1dHRvbkNvbG9yIH0gZnJvbSBcIi4uL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJvb3RJY29ucyB9IGZyb20gXCIuLi9iYXNlL2ljb25zL0Jvb3RJY29uc1wiXG5pbXBvcnQgeyBzaG93U3VwcG9ydERpYWxvZywgc2hvd1VwZ3JhZGVEaWFsb2cgfSBmcm9tIFwiLi9OYXZGdW5jdGlvbnNcIlxuaW1wb3J0IHsgaXNJT1NBcHAgfSBmcm9tIFwiLi4vLi4vYXBpL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgTG9nb3V0VXJsLCBTRVRUSU5HU19QUkVGSVggfSBmcm9tIFwiLi4vLi4vbWlzYy9Sb3V0ZUNoYW5nZVwiXG5pbXBvcnQgeyBnZXRTYWZlQXJlYUluc2V0TGVmdCB9IGZyb20gXCIuLi9IdG1sVXRpbHNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vYmFzZS9pY29ucy9JY29uc1wiXG5pbXBvcnQgeyBBcmlhTGFuZG1hcmtzLCBsYW5kbWFya0F0dHJzIH0gZnJvbSBcIi4uL0FyaWFVdGlsc1wiXG5pbXBvcnQgeyBjcmVhdGVEcm9wZG93biB9IGZyb20gXCIuLi9iYXNlL0Ryb3Bkb3duLmpzXCJcbmltcG9ydCB7IGtleU1hbmFnZXIgfSBmcm9tIFwiLi4vLi4vbWlzYy9LZXlNYW5hZ2VyXCJcbmltcG9ydCB7IENvdW50ZXJCYWRnZSB9IGZyb20gXCIuLi9iYXNlL0NvdW50ZXJCYWRnZS5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi9zaXplLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uL3RoZW1lLmpzXCJcbmltcG9ydCB7IHNob3dOZXdzRGlhbG9nIH0gZnJvbSBcIi4uLy4uL21pc2MvbmV3cy9OZXdzRGlhbG9nLmpzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi8uLi9hcGkvbWFpbi9Mb2dpbkNvbnRyb2xsZXIuanNcIlxuaW1wb3J0IHsgTmV3c01vZGVsIH0gZnJvbSBcIi4uLy4uL21pc2MvbmV3cy9OZXdzTW9kZWwuanNcIlxuaW1wb3J0IHsgRGVza3RvcFN5c3RlbUZhY2FkZSB9IGZyb20gXCIuLi8uLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9EZXNrdG9wU3lzdGVtRmFjYWRlLmpzXCJcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gXCIuLi9zdHlsZXMuanNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi9iYXNlL0ljb25CdXR0b24uanNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIERyYXdlck1lbnVBdHRycyB7XG5cdGxvZ2luczogTG9naW5Db250cm9sbGVyXG5cdG5ld3NNb2RlbDogTmV3c01vZGVsXG5cdGRlc2t0b3BTeXN0ZW1GYWNhZGU6IERlc2t0b3BTeXN0ZW1GYWNhZGUgfCBudWxsXG59XG5cbmV4cG9ydCBjbGFzcyBEcmF3ZXJNZW51IGltcGxlbWVudHMgQ29tcG9uZW50PERyYXdlck1lbnVBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxEcmF3ZXJNZW51QXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgbG9naW5zLCBuZXdzTW9kZWwsIGRlc2t0b3BTeXN0ZW1GYWNhZGUgfSA9IHZub2RlLmF0dHJzXG5cdFx0Y29uc3QgbGl2ZU5ld3NDb3VudCA9IG5ld3NNb2RlbC5saXZlTmV3c0lkcy5sZW5ndGhcblxuXHRcdGNvbnN0IGlzSW50ZXJuYWxVc2VyID0gbG9naW5zLmlzSW50ZXJuYWxVc2VyTG9nZ2VkSW4oKVxuXHRcdGNvbnN0IGlzTG9nZ2VkSW4gPSBsb2dpbnMuaXNVc2VyTG9nZ2VkSW4oKVxuXHRcdGNvbnN0IHVzZXJDb250cm9sbGVyID0gbG9naW5zLmdldFVzZXJDb250cm9sbGVyKClcblxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCJkcmF3ZXItbWVudS5mbGV4LmNvbC5pdGVtcy1jZW50ZXIucHQucGJcIixcblx0XHRcdHtcblx0XHRcdFx0Li4ubGFuZG1hcmtBdHRycyhBcmlhTGFuZG1hcmtzLkNvbnRlbnRpbmZvLCBcImRyYXdlciBtZW51XCIpLFxuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFwicGFkZGluZy1sZWZ0XCI6IGdldFNhZmVBcmVhSW5zZXRMZWZ0KCksXG5cdFx0XHRcdFx0XCJib3JkZXItdG9wLXJpZ2h0LXJhZGl1c1wiOiBzdHlsZXMuaXNEZXNrdG9wTGF5b3V0KCkgPyBweChzaXplLmJvcmRlcl9yYWRpdXNfbGFyZ2VyKSA6IFwiXCIsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0W1xuXHRcdFx0XHRtKFwiLmZsZXgtZ3Jvd1wiKSxcblx0XHRcdFx0aXNJbnRlcm5hbFVzZXIgJiYgaXNMb2dnZWRJblxuXHRcdFx0XHRcdD8gbShcIi5uZXdzLWJ1dHRvblwiLCBbXG5cdFx0XHRcdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLkJ1bGIsXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IFwibmV3c19sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiBzaG93TmV3c0RpYWxvZyhuZXdzTW9kZWwpLFxuXHRcdFx0XHRcdFx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuRHJhd2VyTmF2LFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0bGl2ZU5ld3NDb3VudCA+IDBcblx0XHRcdFx0XHRcdFx0XHQ/IG0oQ291bnRlckJhZGdlLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvdW50OiBsaXZlTmV3c0NvdW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRvcDogcHgoMCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmlnaHQ6IHB4KDMpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb2xvcjogXCJ3aGl0ZVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiB0aGVtZS5saXN0X2FjY2VudF9mZyxcblx0XHRcdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRcdCAgXSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdGxvZ2lucy5pc0dsb2JhbEFkbWluVXNlckxvZ2dlZEluKCkgJiYgdXNlckNvbnRyb2xsZXIuaXNQYWlkQWNjb3VudCgpXG5cdFx0XHRcdFx0PyBtKEljb25CdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuR2lmdCxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IFwiYnV5R2lmdENhcmRfbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRtLnJvdXRlLnNldChcIi9zZXR0aW5ncy9zdWJzY3JpcHRpb25cIilcblx0XHRcdFx0XHRcdFx0XHRpbXBvcnQoXCIuLi8uLi9zdWJzY3JpcHRpb24vZ2lmdGNhcmRzL1B1cmNoYXNlR2lmdENhcmREaWFsb2dcIikudGhlbigoeyBzaG93UHVyY2hhc2VHaWZ0Q2FyZERpYWxvZyB9KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2hvd1B1cmNoYXNlR2lmdENhcmREaWFsb2coKVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuRHJhd2VyTmF2LFxuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdGRlc2t0b3BTeXN0ZW1GYWNhZGVcblx0XHRcdFx0XHQ/IG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5OZXdXaW5kb3csXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBcIm9wZW5OZXdXaW5kb3dfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0ZGVza3RvcFN5c3RlbUZhY2FkZS5vcGVuTmV3V2luZG93KClcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0Y29sb3JzOiBCdXR0b25Db2xvci5EcmF3ZXJOYXYsXG5cdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0IWlzSU9TQXBwKCkgJiYgaXNMb2dnZWRJbiAmJiB1c2VyQ29udHJvbGxlci5pc0ZyZWVBY2NvdW50KClcblx0XHRcdFx0XHQ/IG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBCb290SWNvbnMuUHJlbWl1bSxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IFwidXBncmFkZVByZW1pdW1fbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHNob3dVcGdyYWRlRGlhbG9nKCksXG5cdFx0XHRcdFx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuRHJhd2VyTmF2LFxuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRpdGxlOiBcInNob3dIZWxwX2FjdGlvblwiLFxuXHRcdFx0XHRcdGljb246IEJvb3RJY29ucy5IZWxwLFxuXHRcdFx0XHRcdGNsaWNrOiAoZSwgZG9tKSA9PlxuXHRcdFx0XHRcdFx0Y3JlYXRlRHJvcGRvd24oe1xuXHRcdFx0XHRcdFx0XHR3aWR0aDogMzAwLFxuXHRcdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogKCkgPT4gW1xuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLlNwZWVjaEJ1YmJsZUZpbGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJzdXBwb3J0TWVudV9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHNob3dTdXBwb3J0RGlhbG9nKGxvZ2lucyksXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5LZXlib2FyZEZpbGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJrZXlib2FyZFNob3J0Y3V0c190aXRsZVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGtleU1hbmFnZXIub3BlbkYxSGVscCh0cnVlKSxcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0fSkoZSwgZG9tKSxcblx0XHRcdFx0XHRjb2xvcnM6IEJ1dHRvbkNvbG9yLkRyYXdlck5hdixcblx0XHRcdFx0fSksXG5cdFx0XHRcdGlzSW50ZXJuYWxVc2VyXG5cdFx0XHRcdFx0PyBtKEljb25CdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0aWNvbjogQm9vdEljb25zLlNldHRpbmdzLFxuXHRcdFx0XHRcdFx0XHR0aXRsZTogXCJzZXR0aW5nc19sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4gbS5yb3V0ZS5zZXQoU0VUVElOR1NfUFJFRklYKSxcblx0XHRcdFx0XHRcdFx0Y29sb3JzOiBCdXR0b25Db2xvci5EcmF3ZXJOYXYsXG5cdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0bShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0aWNvbjogQm9vdEljb25zLkxvZ291dCxcblx0XHRcdFx0XHR0aXRsZTogXCJzd2l0Y2hBY2NvdW50X2FjdGlvblwiLFxuXHRcdFx0XHRcdGNsaWNrOiAoKSA9PiBtLnJvdXRlLnNldChMb2dvdXRVcmwpLFxuXHRcdFx0XHRcdGNvbG9yczogQnV0dG9uQ29sb3IuRHJhd2VyTmF2LFxuXHRcdFx0XHR9KSxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgeyBEcmF3ZXJNZW51LCBEcmF3ZXJNZW51QXR0cnMgfSBmcm9tIFwiLi9uYXYvRHJhd2VyTWVudS5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuL3RoZW1lLmpzXCJcbmltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBUcmFuc2xhdGlvbktleSwgTWF5YmVUcmFuc2xhdGlvbiB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBBcmlhTGFuZG1hcmtzLCBsYW5kbWFya0F0dHJzIH0gZnJvbSBcIi4vQXJpYVV0aWxzLmpzXCJcbmltcG9ydCB0eXBlIHsgQ2xpY2tIYW5kbGVyIH0gZnJvbSBcIi4vYmFzZS9HdWlVdGlscy5qc1wiXG5pbXBvcnQgdHlwZSB7IGxhenkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IE1haW5DcmVhdGVCdXR0b24gfSBmcm9tIFwiLi9NYWluQ3JlYXRlQnV0dG9uLmpzXCJcblxuZXhwb3J0IHR5cGUgQXR0cnMgPSB7XG5cdC8qKiBCdXR0b24gdG8gYmUgZGlzcGxheWVkIG9uIHRvcCBvZiB0aGUgY29sdW1uKi9cblx0YnV0dG9uOiB7IGxhYmVsOiBUcmFuc2xhdGlvbktleTsgY2xpY2s6IENsaWNrSGFuZGxlciB9IHwgbnVsbCB8IHVuZGVmaW5lZFxuXHRjb250ZW50OiBDaGlsZHJlblxuXHRhcmlhTGFiZWw6IE1heWJlVHJhbnNsYXRpb25cblx0ZHJhd2VyOiBEcmF3ZXJNZW51QXR0cnNcbn1cblxuZXhwb3J0IGNsYXNzIEZvbGRlckNvbHVtblZpZXcgaW1wbGVtZW50cyBDb21wb25lbnQ8QXR0cnM+IHtcblx0dmlldyh7IGF0dHJzIH06IFZub2RlPEF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcIi5mbGV4LmhlaWdodC0xMDBwLm5hdi1iZ1wiLCBbXG5cdFx0XHRtKERyYXdlck1lbnUsIGF0dHJzLmRyYXdlciksXG5cdFx0XHRtKFwiLmZvbGRlci1jb2x1bW4uZmxleC1ncm93Lm92ZXJmbG93LXgtaGlkZGVuLmZsZXguY29sXCIsIGxhbmRtYXJrQXR0cnMoQXJpYUxhbmRtYXJrcy5OYXZpZ2F0aW9uLCBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dChhdHRycy5hcmlhTGFiZWwpKSwgW1xuXHRcdFx0XHR0aGlzLnJlbmRlck1haW5CdXR0b24oYXR0cnMpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnNjcm9sbC5zY3JvbGxiYXItZ3V0dGVyLXN0YWJsZS1vci1mYWxsYmFjay52aXNpYmxlLXNjcm9sbGJhci5vdmVyZmxvdy14LWhpZGRlbi5mbGV4LmNvbC5mbGV4LWdyb3dcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRvbnNjcm9sbDogKGU6IEV2ZW50UmVkcmF3PEV2ZW50PikgPT4ge1xuXHRcdFx0XHRcdFx0XHRlLnJlZHJhdyA9IGZhbHNlXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50XG5cdFx0XHRcdFx0XHRcdGlmIChhdHRycy5idXR0b24gPT0gbnVsbCB8fCB0YXJnZXQuc2Nyb2xsVG9wID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0LnN0eWxlLmJvcmRlclRvcCA9IFwiXCJcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQuc3R5bGUuYm9yZGVyVG9wID0gYDFweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYm9yZGVyfWBcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGF0dHJzLmNvbnRlbnQsXG5cdFx0XHRcdCksXG5cdFx0XHRdKSxcblx0XHRdKVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJNYWluQnV0dG9uKGF0dHJzOiBBdHRycyk6IENoaWxkcmVuIHtcblx0XHRpZiAoYXR0cnMuYnV0dG9uKSB7XG5cdFx0XHRyZXR1cm4gbShcblx0XHRcdFx0XCIucGxyLWJ1dHRvbi1kb3VibGUuc2Nyb2xsYmFyLWd1dHRlci1zdGFibGUtb3ItZmFsbGJhY2suc2Nyb2xsXCIsXG5cdFx0XHRcdG0oTWFpbkNyZWF0ZUJ1dHRvbiwgeyBsYWJlbDogYXR0cnMuYnV0dG9uLmxhYmVsLCBjbGljazogYXR0cnMuYnV0dG9uLmNsaWNrIH0pLFxuXHRcdFx0KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGQsIENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBNYXliZVRyYW5zbGF0aW9uIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4vdGhlbWVcIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuXG5leHBvcnQgdHlwZSBTaWRlYmFyU2VjdGlvbkF0dHJzID0ge1xuXHRuYW1lOiBNYXliZVRyYW5zbGF0aW9uXG5cdGJ1dHRvbj86IENoaWxkXG5cdGhpZGVJZkVtcHR5PzogdHJ1ZVxufVxuXG5leHBvcnQgY2xhc3MgU2lkZWJhclNlY3Rpb24gaW1wbGVtZW50cyBDb21wb25lbnQ8U2lkZWJhclNlY3Rpb25BdHRycz4ge1xuXHRleHBhbmRlZDogU3RyZWFtPGJvb2xlYW4+ID0gc3RyZWFtKHRydWUpXG5cblx0dmlldyh2bm9kZTogVm5vZGU8U2lkZWJhclNlY3Rpb25BdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBuYW1lLCBidXR0b24sIGhpZGVJZkVtcHR5IH0gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IGNvbnRlbnQgPSB2bm9kZS5jaGlsZHJlblxuXHRcdGlmIChoaWRlSWZFbXB0eSAmJiBjb250ZW50ID09IGZhbHNlKSByZXR1cm4gbnVsbCAvLyBVc2luZyBsb29zZSBlcXVhbGl0eSB0byBjaGVjayBpZiBjaGlsZHJlbiBoYXMgYW55IGNvbnRlbnRzXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5zaWRlYmFyLXNlY3Rpb25cIixcblx0XHRcdHtcblx0XHRcdFx0XCJkYXRhLXRlc3RpZFwiOiBgc2VjdGlvbjoke2xhbmcuZ2V0VGVzdElkKG5hbWUpfWAsXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0Y29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0bShcIi5mb2xkZXItcm93LmZsZXgtc3BhY2UtYmV0d2Vlbi5wbHItYnV0dG9uLnB0LXMuYnV0dG9uLWhlaWdodFwiLCBbXG5cdFx0XHRcdFx0bShcInNtYWxsLmIuYWxpZ24tc2VsZi1jZW50ZXIudGV4dC1lbGxpcHNpcy5wbHItYnV0dG9uXCIsIGxhbmcuZ2V0VHJhbnNsYXRpb25UZXh0KG5hbWUpLnRvTG9jYWxlVXBwZXJDYXNlKCkpLFxuXHRcdFx0XHRcdGJ1dHRvbiA/PyBudWxsLFxuXHRcdFx0XHRdKSxcblx0XHRcdFx0Y29udGVudCxcblx0XHRcdF0sXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IHN0eWxlcyB9IGZyb20gXCIuL3N0eWxlcy5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFja2dyb3VuZENvbHVtbkxheW91dEF0dHJzIHtcblx0bW9iaWxlSGVhZGVyOiAoKSA9PiBDaGlsZHJlblxuXHRkZXNrdG9wVG9vbGJhcjogKCkgPT4gQ2hpbGRyZW5cblx0Y29sdW1uTGF5b3V0OiBDaGlsZHJlblxuXHRiYWNrZ3JvdW5kQ29sb3I/OiBzdHJpbmdcblx0ZmxvYXRpbmdBY3Rpb25CdXR0b24/OiAoKSA9PiBDaGlsZHJlblxuXHRjbGFzc2VzPzogc3RyaW5nXG59XG5cbi8qKlxuICogQSBsYXlvdXQgY29tcG9uZW50IHRoYXQgb3JnYW5pemVzIHRoZSBjb2x1bW4uXG4gKiBSZW5kZXJzIGEgZnJhbWUgZm9yIHRoZSBsYXlvdXQgYW5kIGVpdGhlciBtb2JpbGUgaGVhZGVyIG9yIGRlc2t0b3AgdG9vbGJhci5cbiAqL1xuZXhwb3J0IGNsYXNzIEJhY2tncm91bmRDb2x1bW5MYXlvdXQgaW1wbGVtZW50cyBDb21wb25lbnQ8QmFja2dyb3VuZENvbHVtbkxheW91dEF0dHJzPiB7XG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxCYWNrZ3JvdW5kQ29sdW1uTGF5b3V0QXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIubGlzdC1jb2x1bW4uZmxleC5jb2wuZmlsbC1hYnNvbHV0ZVwiLFxuXHRcdFx0e1xuXHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdGJhY2tncm91bmRDb2xvcjogYXR0cnMuYmFja2dyb3VuZENvbG9yLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjbGFzczogYXR0cnMuY2xhc3NlcyA/PyBcIlwiLFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0c3R5bGVzLmlzVXNpbmdCb3R0b21OYXZpZ2F0aW9uKCkgPyBhdHRycy5tb2JpbGVIZWFkZXIoKSA6IGF0dHJzLmRlc2t0b3BUb29sYmFyKCksXG5cdFx0XHRcdG0oXCIuZmxleC1ncm93LnJlbFwiLCBhdHRycy5jb2x1bW5MYXlvdXQpLFxuXHRcdFx0XHRhdHRycy5mbG9hdGluZ0FjdGlvbkJ1dHRvbj8uKCksXG5cdFx0XHRdLFxuXHRcdClcblx0fVxufVxuIiwiaW1wb3J0IHsgcHVyZUNvbXBvbmVudCB9IGZyb20gXCIuL2Jhc2UvUHVyZUNvbXBvbmVudC5qc1wiXG5pbXBvcnQgbSwgeyBDaGlsZHJlbiB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4vc2l6ZS5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZU1vYmlsZUhlYWRlckF0dHJzIHtcblx0bGVmdD86IENoaWxkcmVuXG5cdGNlbnRlcj86IENoaWxkcmVuXG5cdHJpZ2h0PzogQ2hpbGRyZW5cblx0aW5qZWN0aW9ucz86IENoaWxkcmVuXG59XG5cbi8qKlxuICogQSBiYXNlIGNvbXBvbmVudCB0aGF0IHNob3VsZCBiZSB1c2VkIGZvciBhbGwgbW9iaWxlIGhlYWRlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCBCYXNlTW9iaWxlSGVhZGVyID0gcHVyZUNvbXBvbmVudCgoeyBsZWZ0LCBjZW50ZXIsIHJpZ2h0LCBpbmplY3Rpb25zIH06IEJhc2VNb2JpbGVIZWFkZXJBdHRycykgPT4ge1xuXHRyZXR1cm4gbShcblx0XHRcIi5mbGV4Lml0ZW1zLWNlbnRlci5yZWwuYnV0dG9uLWhlaWdodC5tdC1zYWZlLWluc2V0LnBsci1zYWZlLWluc2V0XCIsXG5cdFx0e1xuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0aGVpZ2h0OiBweChzaXplLm5hdmJhcl9oZWlnaHRfbW9iaWxlKSxcblx0XHRcdH0sXG5cdFx0fSxcblx0XHRbXG5cdFx0XHRsZWZ0ID8/IG51bGwsXG5cdFx0XHQvLyBub3JtYWxseSBtaW4td2lkdGg6IGlzIDAgYnV0IGluc2lkZSBmbGV4IGl0J3MgYXV0byBhbmQgd2UgbmVlZCB0byB0ZWFjaCBpdCBob3cgdG8gc2hyaW5rXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5mbGV4LWdyb3cuZmxleC5pdGVtcy1jZW50ZXIubWluLXdpZHRoLTBcIixcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNsYXNzOiAhbGVmdCA/IFwibWwtaHBhZF9zbWFsbFwiIDogXCJcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0Y2VudGVyID8/IG51bGwsXG5cdFx0XHQpLFxuXHRcdFx0cmlnaHQgPz8gbnVsbCxcblx0XHRcdGluamVjdGlvbnMgPz8gbnVsbCxcblx0XHRdLFxuXHQpXG59KVxuIiwiaW1wb3J0IHsgcHVyZUNvbXBvbmVudCB9IGZyb20gXCIuL2Jhc2UvUHVyZUNvbXBvbmVudC5qc1wiXG5pbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IE5CU1AgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEFwcEhlYWRlckF0dHJzIH0gZnJvbSBcIi4vSGVhZGVyLmpzXCJcbmltcG9ydCB7IEJhc2VNb2JpbGVIZWFkZXIgfSBmcm9tIFwiLi9CYXNlTW9iaWxlSGVhZGVyLmpzXCJcbmltcG9ydCB7IEljb25CdXR0b24gfSBmcm9tIFwiLi9iYXNlL0ljb25CdXR0b24uanNcIlxuaW1wb3J0IHsgQm9vdEljb25zIH0gZnJvbSBcIi4vYmFzZS9pY29ucy9Cb290SWNvbnMuanNcIlxuaW1wb3J0IHsgc3R5bGVzIH0gZnJvbSBcIi4vc3R5bGVzLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVJbmRpY2F0b3IgfSBmcm9tIFwiLi9iYXNlL09mZmxpbmVJbmRpY2F0b3IuanNcIlxuaW1wb3J0IHsgUHJvZ3Jlc3NCYXIgfSBmcm9tIFwiLi9iYXNlL1Byb2dyZXNzQmFyLmpzXCJcbmltcG9ydCB7IENvdW50ZXJCYWRnZSB9IGZyb20gXCIuL2Jhc2UvQ291bnRlckJhZGdlLmpzXCJcbmltcG9ydCB7IHB4IH0gZnJvbSBcIi4vc2l6ZS5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuL3RoZW1lLmpzXCJcbmltcG9ydCB7IE5ld3NNb2RlbCB9IGZyb20gXCIuLi9taXNjL25ld3MvTmV3c01vZGVsLmpzXCJcbmltcG9ydCB7IENsaWNrSGFuZGxlciB9IGZyb20gXCIuL2Jhc2UvR3VpVXRpbHMuanNcIlxuaW1wb3J0IHsgbGFuZywgTWF5YmVUcmFuc2xhdGlvbiB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcblxuZXhwb3J0IGludGVyZmFjZSBNb2JpbGVIZWFkZXJBdHRycyBleHRlbmRzIEFwcEhlYWRlckF0dHJzIHtcblx0Y29sdW1uVHlwZTogXCJmaXJzdFwiIHwgXCJvdGhlclwiXG5cdC8qKiBBY3Rpb25zIHRoYXQgc2hvdWxkIGJlIGRpc3BsYXllZCBvbiB0aGUgb3Bwb3NpdGUgc2lkZSBvZiBtZW51L2JhY2sgYnV0dG9uLiAqL1xuXHRhY3Rpb25zOiBDaGlsZHJlblxuXHQvKiogTGlrZSBhY3Rpb25zIHRoYXQgYXJlIG9ubHkgc3VwcG9zZWQgdG8gYmUgZGlzcGxheWVkIGluIG11bHRpLWNvbHVtbiBsYXlvdXQgKi9cblx0bXVsdGljb2x1bW5BY3Rpb25zPzogKCkgPT4gQ2hpbGRyZW5cblx0LyoqXG5cdCAqIEFuIGFjdGlvbiB0aGF0IGlzIGRpc3BsYXllZCBpbiB0aGUgY29ybmVyIG9mIHRoZSBzY3JlZW4gb3Bwb3NpdGUgb2YgbWVudS9iYWNrIGJ1dHRvbiwgd2lsbCBiZSBkaXNwbGF5ZWQgaW4gYW55IGNvbHVtbiBpbiBzaW5nbGUgY29sdW1uIGxheW91dCBvclxuXHQgKiBpbiB0aGUgc2Vjb25kIGNvbHVtbiBpbiB0d28gY29sdW1uIGxheW91dC5cblx0ICovXG5cdHByaW1hcnlBY3Rpb246ICgpID0+IENoaWxkcmVuXG5cdHRpdGxlPzogTWF5YmVUcmFuc2xhdGlvblxuXHRiYWNrQWN0aW9uOiAoKSA9PiB1bmtub3duXG5cdHVzZUJhY2tCdXR0b24/OiBib29sZWFuXG59XG5cbi8qKlxuICogQSBjb21wb25lbnQgdGhhdCByZW5kZXJzIGEgXCJzdGFuZGFyZFwiIG1vYmlsZSBoZWFkZXIuIEl0IGhhcyBtZW51L2JhY2sgYnV0dG9uIHdpdGggb2ZmbGluZSBpbmRpY2F0b3IsIHRpdGxlIGFuZCBvbmxpbmUgc3RhdHVzLCBzeW5jIHByb2dyZXNzIGFuZCBzb21lXG4gKiBhY3Rpb25zLlxuICpcbiAqIEl0IGlzIGludGVuZGVkIHRvIGJlIHVzZWQgaW4gYm90aCB0aGUgZmlyc3QgKFwibGlzdFwiKSBhbmQgdGhlIHNlY29uZCAoXCJ2aWV3ZXJcIikgY29sdW1ucy4gSXQgd2lsbCBhdXRvbWF0aWNhbGx5IGZpZ3VyZSB3aGV0aGVyIGl0IHNob3VsZCBkaXNwbGF5IG1lbnUvYmFja1xuICogYnV0dG9uLCB0aXRsZSBhbmQgYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vYmlsZUhlYWRlciBpbXBsZW1lbnRzIENvbXBvbmVudDxNb2JpbGVIZWFkZXJBdHRycz4ge1xuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8TW9iaWxlSGVhZGVyQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGZpcnN0VmlzaWJsZUNvbHVtbiA9IGF0dHJzLmNvbHVtblR5cGUgPT09IFwiZmlyc3RcIiB8fCBzdHlsZXMuaXNTaW5nbGVDb2x1bW5MYXlvdXQoKVxuXHRcdHJldHVybiBtKEJhc2VNb2JpbGVIZWFkZXIsIHtcblx0XHRcdGxlZnQ6IHRoaXMucmVuZGVyTGVmdEFjdGlvbihhdHRycyksXG5cdFx0XHRjZW50ZXI6IGZpcnN0VmlzaWJsZUNvbHVtblxuXHRcdFx0XHQ/IG0oTW9iaWxlSGVhZGVyVGl0bGUsIHtcblx0XHRcdFx0XHRcdHRpdGxlOiBhdHRycy50aXRsZSA/IGxhbmcuZ2V0VHJhbnNsYXRpb25UZXh0KGF0dHJzLnRpdGxlKSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdGJvdHRvbTogbShPZmZsaW5lSW5kaWNhdG9yLCBhdHRycy5vZmZsaW5lSW5kaWNhdG9yTW9kZWwuZ2V0Q3VycmVudEF0dHJzKCkpLFxuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogbnVsbCxcblx0XHRcdHJpZ2h0OiBbXG5cdFx0XHRcdHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpID8gbnVsbCA6IGF0dHJzLm11bHRpY29sdW1uQWN0aW9ucz8uKCksXG5cdFx0XHRcdGF0dHJzLmFjdGlvbnMsXG5cdFx0XHRcdHN0eWxlcy5pc1NpbmdsZUNvbHVtbkxheW91dCgpIHx8IGF0dHJzLmNvbHVtblR5cGUgPT09IFwib3RoZXJcIiA/IGF0dHJzLnByaW1hcnlBY3Rpb24oKSA6IG51bGwsXG5cdFx0XHRdLFxuXHRcdFx0aW5qZWN0aW9uczogZmlyc3RWaXNpYmxlQ29sdW1uID8gbShQcm9ncmVzc0JhciwgeyBwcm9ncmVzczogYXR0cnMub2ZmbGluZUluZGljYXRvck1vZGVsLmdldFByb2dyZXNzKCkgfSkgOiBudWxsLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxlZnRBY3Rpb24oYXR0cnM6IE1vYmlsZUhlYWRlckF0dHJzKSB7XG5cdFx0aWYgKGF0dHJzLmNvbHVtblR5cGUgPT09IFwiZmlyc3RcIiAmJiAhYXR0cnMudXNlQmFja0J1dHRvbikge1xuXHRcdFx0cmV0dXJuIG0oTW9iaWxlSGVhZGVyTWVudUJ1dHRvbiwgeyBuZXdzTW9kZWw6IGF0dHJzLm5ld3NNb2RlbCwgYmFja0FjdGlvbjogYXR0cnMuYmFja0FjdGlvbiB9KVxuXHRcdH0gZWxzZSBpZiAoc3R5bGVzLmlzU2luZ2xlQ29sdW1uTGF5b3V0KCkgfHwgYXR0cnMudXNlQmFja0J1dHRvbikge1xuXHRcdFx0cmV0dXJuIG0oTW9iaWxlSGVhZGVyQmFja0J1dHRvbiwgeyBiYWNrQWN0aW9uOiBhdHRycy5iYWNrQWN0aW9uIH0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG5leHBvcnQgY29uc3QgTW9iaWxlSGVhZGVyQmFja0J1dHRvbiA9IHB1cmVDb21wb25lbnQoKHsgYmFja0FjdGlvbiB9OiB7IGJhY2tBY3Rpb246ICgpID0+IHVua25vd24gfSkgPT4ge1xuXHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0dGl0bGU6IFwiYmFja19hY3Rpb25cIixcblx0XHRpY29uOiBCb290SWNvbnMuQmFjayxcblx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0YmFja0FjdGlvbigpXG5cdFx0fSxcblx0fSlcbn0pXG5cbmV4cG9ydCBjb25zdCBNb2JpbGVIZWFkZXJUaXRsZSA9IHB1cmVDb21wb25lbnQoKHsgdGl0bGUsIGJvdHRvbSwgb25UYXAgfTogeyB0aXRsZT86IHN0cmluZyB8IENoaWxkcmVuOyBib3R0b206IENoaWxkcmVuOyBvblRhcD86IENsaWNrSGFuZGxlciB9KSA9PiB7XG5cdC8vIG5vcm1hbGx5IG1pbi13aWR0aDogaXMgMCBidXQgaW5zaWRlIGZsZXggaXQncyBhdXRvIGFuZCB3ZSBuZWVkIHRvIHRlYWNoIGl0IGhvdyB0byBzaHJpbmtcblx0Ly8gYWxpZ24tc2VsZjogc3RyZXRjaCByZXN0cmljdCB0aGUgY2hpbGQgdG8gdGhlIHBhcmVudCB3aWR0aFxuXHQvLyB0ZXh0LWVsbGlwc2lzIGFscmVhZHkgc2V0cyBtaW4td2lkdGggdG8gMFxuXHRyZXR1cm4gbShcIi5mbGV4LmNvbC5pdGVtcy1zdGFydC5taW4td2lkdGgtMFwiLCBbXG5cdFx0bShcblx0XHRcdChvblRhcCA/IFwiYnV0dG9uXCIgOiBcIlwiKSArIFwiLmZvbnQtd2VpZ2h0LTYwMC50ZXh0LWVsbGlwc2lzLmFsaWduLXNlbGYtc3RyZXRjaFwiLFxuXHRcdFx0eyBvbmNsaWNrOiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IG9uVGFwPy4oZXZlbnQsIGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkgfSxcblx0XHRcdHRpdGxlID8/IE5CU1AsXG5cdFx0KSxcblx0XHRib3R0b20sXG5cdF0pXG59KVxuXG5leHBvcnQgY29uc3QgTW9iaWxlSGVhZGVyTWVudUJ1dHRvbiA9IHB1cmVDb21wb25lbnQoKHsgbmV3c01vZGVsLCBiYWNrQWN0aW9uIH06IHsgbmV3c01vZGVsOiBOZXdzTW9kZWw7IGJhY2tBY3Rpb246ICgpID0+IHVua25vd24gfSkgPT4ge1xuXHRyZXR1cm4gbShcIi5yZWxcIiwgW1xuXHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0dGl0bGU6IFwibWVudV9sYWJlbFwiLFxuXHRcdFx0aWNvbjogQm9vdEljb25zLk1vcmVWZXJ0aWNhbCxcblx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdGJhY2tBY3Rpb24oKVxuXHRcdFx0fSxcblx0XHR9KSxcblx0XHRtKENvdW50ZXJCYWRnZSwge1xuXHRcdFx0Y291bnQ6IG5ld3NNb2RlbC5saXZlTmV3c0lkcy5sZW5ndGgsXG5cdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHR0b3A6IHB4KDQpLFxuXHRcdFx0XHRyaWdodDogcHgoNSksXG5cdFx0XHR9LFxuXHRcdFx0Y29sb3I6IFwid2hpdGVcIixcblx0XHRcdGJhY2tncm91bmQ6IHRoZW1lLmxpc3RfYWNjZW50X2ZnLFxuXHRcdH0pLFxuXHRdKVxufSlcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJQSxrQkFBa0I7SUFHTCxTQUFOLE1BQXlDO0NBQy9DLEtBQUssRUFBRSxVQUF3QixFQUFZO0FBQzFDLFNBQU8sZ0JBQ04sd0JBQ0EsY0FBYyxjQUFjLFlBQVksTUFBTSxFQUM5QyxBQUFDLFNBQTBCLElBQUksQ0FBQyxVQUFVLGdCQUFFLG1CQUFtQixNQUFNLENBQUMsQ0FDdEU7Q0FDRDtBQUNEOzs7O0FDREQsa0JBQWtCO0lBaUJMLFNBQU4sTUFBb0Q7Q0FDMUQsS0FBSyxFQUFFLE9BQTJCLEVBQVk7QUFDN0MsU0FBTyxnQkFBRSxtQkFBbUIsQ0FBQyxnQkFBRSxhQUFhLEVBQUUsVUFBVSxNQUFNLHNCQUFzQixhQUFhLENBQUUsRUFBQyxFQUFFLEtBQUssaUJBQWlCLE1BQU0sQUFBQyxFQUFDO0NBQ3BJOzs7OztDQU1ELEFBQVEsaUJBQWlCQSxPQUE4QjtBQUN0RCxTQUFPLGdCQUFFLDRDQUE0QztHQUNwRCxN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
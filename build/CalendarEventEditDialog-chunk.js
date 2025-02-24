import { __toESM } from "./chunk-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { isApp } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { assertNotNull, debounceStart, deepEqual, getFirstOrThrow, noOp } from "./dist2-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import { DefaultAnimationTime } from "./styles-chunk.js";
import { theme } from "./theme-chunk.js";
import { AccountType, CalendarAttendeeStatus, EndType, Keys, RepeatPeriod, TabIndex, TimeFormat, defaultCalendarColor } from "./TutanotaConstants-chunk.js";
import { focusNext, focusPrevious, isKeyPressed, keyboardEventToKeyPress } from "./KeyManager-chunk.js";
import { modal } from "./RootView-chunk.js";
import { px, size } from "./size-chunk.js";
import { getSafeAreaInsetBottom, getSafeAreaInsetTop } from "./HtmlUtils-chunk.js";
import { AlarmIntervalUnit, getStartOfTheWeekOffsetForUser, getTimeFormatForUser, parseAlarmInterval } from "./CalendarUtils-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { BaseButton, ButtonColor, ButtonType, getColors } from "./Button-chunk.js";
import { Icons } from "./Icons-chunk.js";
import { Dialog, DropDownSelector, TextField, TextFieldType, attachDropdown, showDropdown } from "./Dialog-chunk.js";
import { BootIcons, Icon, IconSize } from "./Icon-chunk.js";
import { AriaRole } from "./AriaUtils-chunk.js";
import { ButtonSize, IconButton } from "./IconButton-chunk.js";
import { Time } from "./CalendarEventWhenModel-chunk.js";
import { convertTextToHtml, timeStringFromParts } from "./Formatter-chunk.js";
import { getSharedGroupName } from "./GroupUtils2-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { UserError } from "./UserError-chunk.js";
import { scaleToVisualPasswordStrength } from "./PasswordUtils-chunk.js";
import { RecipientType } from "./Recipient-chunk.js";
import { CalendarOperation, EventSaveResult, ReadonlyReason, askIfShouldSendCalendarUpdatesToAttendees, createAlarmIntervalItems, createAttendingItems, createCustomEndTypeOptions, createCustomRepeatRuleUnitValues, createIntervalValues, createRepeatRuleOptions, customFrequenciesOptions, hasPlanWithInvites, humanDescriptionForAlarmInterval, iconForAttendeeStatus } from "./CalendarGuiUtils-chunk.js";
import { UpgradeRequiredError } from "./UpgradeRequiredError-chunk.js";
import { showPlanUpgradeRequiredDialog } from "./SubscriptionDialogs-chunk.js";
import { formatRepetitionEnd, formatRepetitionFrequency } from "./EventPreviewView-chunk.js";
import { ToggleButton } from "./ToggleButton-chunk.js";
import { Card, SectionButton, Switch } from "./SectionButton-chunk.js";
import { DatePicker, InputMode, PickerPosition, SingleLineTextField } from "./DatePicker-chunk.js";
import { parseMailAddress, parsePastedInput, parseTypedInput } from "./MailRecipientsTextField-chunk.js";
import { IconMessageBox } from "./ColumnEmptyMessageBox-chunk.js";
import { BannerType, InfoBanner } from "./InfoBanner-chunk.js";
import { showUserError } from "./ErrorHandlerImpl-chunk.js";
import { handleRatingByEvent } from "./InAppRatingDialog-chunk.js";

//#region src/common/gui/base/Select.ts
var Select = class {
	isExpanded = false;
	dropdownContainer;
	key = 0;
	view({ attrs: { onchange, options, renderOption, renderDisplay, classes, selected, placeholder, expanded, disabled, ariaLabel, iconColor, id, noIcon, keepFocus, tabIndex, onclose, dropdownPosition } }) {
		return mithril_default("button.tutaui-select-trigger.clickable", {
			id,
			class: this.resolveClasses(classes, disabled, expanded),
			onclick: (event) => event.currentTarget && this.renderDropdown(options, event.currentTarget, onchange, renderOption, keepFocus ?? false, selected?.value, onclose, dropdownPosition),
			role: AriaRole.Combobox,
			ariaLabel,
			disabled,
			ariaExpanded: String(this.isExpanded),
			tabIndex: tabIndex ?? Number(disabled ? TabIndex.Programmatic : TabIndex.Default),
			value: selected?.ariaValue
		}, [selected != null ? renderDisplay(selected) : this.renderPlaceholder(placeholder), noIcon !== true ? mithril_default(Icon, {
			icon: BootIcons.Expand,
			container: "div",
			class: `fit-content transition-transform`,
			size: IconSize.Medium,
			style: { fill: iconColor ?? getColors(ButtonColor.Content).button }
		}) : null]);
	}
	resolveClasses(classes = [], disabled = false, expanded = false) {
		const classList = [...classes];
		if (disabled) classList.push("disabled", "click-disabled");
else classList.push("flash");
		if (expanded) classList.push("full-width");
else classList.push("fit-content");
		return classList.join(" ");
	}
	renderPlaceholder(placeholder) {
		if (placeholder == null || typeof placeholder === "string") return mithril_default("span.placeholder", placeholder ?? lang.get("noSelection_msg"));
		return placeholder;
	}
	renderDropdown(options, dom, onSelect, renderOptions, keepFocus, selected, onClose, dropdownPosition) {
		const optionListContainer = new OptionListContainer(options, (option) => {
			return mithril_default.fragment({
				key: ++this.key,
				oncreate: ({ dom: dom$1 }) => this.setupOption(dom$1, onSelect, option, optionListContainer, selected)
			}, [renderOptions(option)]);
		}, dom.getBoundingClientRect().width, keepFocus, dropdownPosition);
		optionListContainer.onClose = () => {
			optionListContainer.close();
			onClose?.();
			this.isExpanded = false;
		};
		optionListContainer.setOrigin(dom.getBoundingClientRect());
		this.isExpanded = true;
		this.dropdownContainer = optionListContainer;
		modal.displayUnique(optionListContainer, false);
	}
	setupOption(dom, onSelect, option, optionListContainer, selected) {
		dom.onclick = this.wrapOnChange.bind(this, onSelect, option, optionListContainer);
		if (!("disabled" in dom)) {
			dom.tabIndex = Number(TabIndex.Default);
			if (!dom.style.cursor) dom.style.cursor = "pointer";
			if (!dom.role) dom.role = AriaRole.Option;
			dom.ariaSelected = `${selected === option.value}`;
		}
		dom.onkeydown = (e) => {
			if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
				e.preventDefault();
				this.wrapOnChange(onSelect, option, optionListContainer);
			}
		};
	}
	wrapOnChange(callback, option, container) {
		callback(option);
		container.onClose();
	}
};
var OptionListContainer = class {
	domDropdown = null;
	view;
	origin = null;
	shortcuts;
	width;
	domContents = null;
	maxHeight = null;
	focusedBeforeShown = document.activeElement;
	children = [];
	constructor(items, buildFunction, width, keepFocus, dropdownPosition) {
		this.items = items;
		this.buildFunction = buildFunction;
		this.width = width;
		this.shortcuts = this.buildShortcuts;
		this.items.map((newItems) => {
			this.children = [];
			this.children.push(newItems.length === 0 ? this.renderNoItem() : newItems.map((item) => this.buildFunction(item)));
		});
		this.view = () => {
			return mithril_default(".dropdown-panel-scrollable.elevated-bg.border-radius.dropdown-shadow.fit-content", { oncreate: (vnode) => {
				this.domDropdown = vnode.dom;
				this.domDropdown.style.opacity = "0";
			} }, mithril_default(".dropdown-content.scroll.flex.flex-column", {
				role: AriaRole.Listbox,
				tabindex: TabIndex.Programmatic,
				oncreate: (vnode) => {
					this.domContents = vnode.dom;
				},
				onupdate: (vnode) => {
					if (this.maxHeight == null) {
						const children = Array.from(vnode.dom.children);
						this.maxHeight = Math.min(400 + size.vpad, children.reduce((accumulator, children$1) => accumulator + children$1.offsetHeight, 0) + size.vpad);
						if (this.origin) showDropdown(this.origin, assertNotNull(this.domDropdown), this.maxHeight, this.width, dropdownPosition).then(() => {
							const selectedOption = vnode.dom.querySelector("[aria-selected='true']");
							if (selectedOption && !keepFocus) selectedOption.focus();
else if (!keepFocus && (!this.domDropdown || focusNext(this.domDropdown))) this.domContents?.focus();
						});
					} else this.updateDropdownSize(vnode);
				},
				onscroll: (ev) => {
					const target = ev.target;
					ev.redraw = this.domContents != null && target.scrollTop < 0 && target.scrollTop + this.domContents.offsetHeight > target.scrollHeight;
				}
			}, this.children));
		};
	}
	updateDropdownSize(vnode) {
		if (!(this.origin && this.domDropdown)) return;
		const upperSpace = this.origin.top - getSafeAreaInsetTop();
		const lowerSpace = window.innerHeight - this.origin.bottom - getSafeAreaInsetBottom();
		const children = Array.from(vnode.dom.children);
		const contentHeight = Math.min(400 + size.vpad, children.reduce((accumulator, children$1) => accumulator + children$1.offsetHeight, 0) + size.vpad);
		this.maxHeight = lowerSpace > upperSpace ? Math.min(contentHeight, lowerSpace) : Math.min(contentHeight, upperSpace);
		const newHeight = px(this.maxHeight);
		if (this.domDropdown.style.height !== newHeight) this.domDropdown.style.height = newHeight;
	}
	renderNoItem() {
		return mithril_default("span.placeholder.text-center", { color: theme.list_message_bg }, lang.get("noEntries_msg"));
	}
	backgroundClick = (e) => {
		if (this.domDropdown && !e.target.classList.contains("doNotClose") && (this.domDropdown.contains(e.target) || this.domDropdown.parentNode === e.target)) this.onClose();
	};
	buildShortcuts() {
		return [
			{
				key: Keys.ESC,
				exec: () => this.onClose(),
				help: "close_alt"
			},
			{
				key: Keys.TAB,
				shift: true,
				exec: () => this.domDropdown ? focusPrevious(this.domDropdown) : false,
				help: "selectPrevious_action"
			},
			{
				key: Keys.TAB,
				shift: false,
				exec: () => this.domDropdown ? focusNext(this.domDropdown) : false,
				help: "selectNext_action"
			},
			{
				key: Keys.UP,
				exec: () => this.domDropdown ? focusPrevious(this.domDropdown) : false,
				help: "selectPrevious_action"
			},
			{
				key: Keys.DOWN,
				exec: () => this.domDropdown ? focusNext(this.domDropdown) : false,
				help: "selectNext_action"
			}
		];
	}
	setOrigin(origin) {
		this.origin = origin;
		return this;
	}
	close() {
		modal.remove(this);
	}
	hideAnimation() {
		return Promise.resolve();
	}
	onClose() {
		this.close();
	}
	popState(e) {
		this.onClose();
		return false;
	}
	callingElement() {
		return this.focusedBeforeShown;
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/pickers/GuestPicker.ts
var import_stream$6 = __toESM(require_stream(), 1);
var GuestPicker = class {
	isExpanded = false;
	isFocused = false;
	value = "";
	selected;
	options = (0, import_stream$6.default)([]);
	selectDOM = null;
	view({ attrs }) {
		return mithril_default(Select, {
			classes: ["flex-grow"],
			dropdownPosition: "bottom",
			onchange: ({ value: guest }) => {
				this.handleSelection(attrs, guest);
			},
			onclose: () => {
				this.isExpanded = false;
			},
			oncreate: (node) => {
				this.selectDOM = node;
			},
			selected: this.selected,
			ariaLabel: attrs.ariaLabel,
			disabled: attrs.disabled,
			options: this.options,
			noIcon: true,
			expanded: true,
			tabIndex: Number(TabIndex.Programmatic),
			placeholder: this.renderSearchInput(attrs),
			renderDisplay: () => this.renderSearchInput(attrs),
			renderOption: (option) => this.renderSuggestionItem(option === this.selected, option),
			keepFocus: true
		});
	}
	renderSuggestionItem(selected, option) {
		const firstRow = option.value.type === "recipient" ? option.value.value.name : mithril_default(Icon, {
			icon: Icons.People,
			style: {
				fill: theme.content_fg,
				"aria-describedby": lang.get("contactListName_label")
			}
		});
		const secondRow = option.value.type === "recipient" ? option.value.value.address : option.value.value.name;
		return mithril_default(".pt-s.pb-s.click.content-hover.button-min-height", {
			class: selected ? "content-accent-fg row-selected icon-accent" : "",
			style: {
				"padding-left": selected ? px(size.hpad_large - 3) : px(size.hpad_large),
				"border-left": selected ? "3px solid" : null
			}
		}, [mithril_default(".small.full-width.text-ellipsis", firstRow), mithril_default(".name.full-width.text-ellipsis", secondRow)]);
	}
	async handleSelection(attrs, guest) {
		if (guest.value != null) if (guest.type === "recipient") {
			const { address, name, contact } = guest.value;
			attrs.onRecipientAdded(address, name, contact);
			attrs.search.clear();
			this.value = "";
		} else {
			this.value = "";
			const recipients = await attrs.search.resolveContactList(guest.value);
			for (const { address, name, contact } of recipients) attrs.onRecipientAdded(address, name, contact);
			attrs.search.clear();
			mithril_default.redraw();
		}
	}
	renderSearchInput(attrs) {
		return mithril_default(SingleLineTextField, {
			classes: ["height-100p"],
			value: this.value,
			placeholder: lang.get("addGuest_label"),
			onclick: (e) => {
				e.stopImmediatePropagation();
				if (!this.isExpanded && this.value.length > 0 && this.selectDOM) {
					this.selectDOM.dom.click();
					this.isExpanded = true;
				}
			},
			oninput: (val) => {
				if (val.length > 0 && !this.isExpanded && this.selectDOM) {
					this.selectDOM.dom.click();
					this.isExpanded = true;
				}
				const { remainingText, newRecipients, errors } = val.length - this.value.length > 1 ? parsePastedInput(val) : parseTypedInput(val);
				for (const { address, name } of newRecipients) attrs.onRecipientAdded(address, name, null);
				if (errors.length === 1 && newRecipients.length === 0) this.value = getFirstOrThrow(errors);
else {
					if (errors.length > 0) Dialog.message(lang.makeTranslation("error_message", `${lang.get("invalidPastedRecipients_msg")}\n\n${errors.join("\n")}`));
					this.value = remainingText;
				}
				this.doSearch(val, attrs);
			},
			disabled: attrs.disabled,
			ariaLabel: attrs.ariaLabel,
			onfocus: (event) => {
				this.isFocused = true;
			},
			onblur: (e) => {
				if (this.isFocused) {
					this.resolveInput(attrs, false);
					this.isFocused = false;
				}
				e.redraw = false;
			},
			onkeydown: (event) => this.handleKeyDown(event, attrs),
			type: TextFieldType.Text
		});
	}
	doSearch = debounceStart(DefaultAnimationTime, (val, attrs) => {
		attrs.search.search(val).then(() => {
			const searchResult = attrs.search.results();
			if (searchResult.length === 0) this.selected = undefined;
			this.options(searchResult.map((option) => ({
				name: option.value.name,
				value: option,
				type: option.type,
				ariaValue: option.value.name
			})));
			mithril_default.redraw();
		});
	});
	handleKeyDown(event, attrs) {
		const keyPress = keyboardEventToKeyPress(event);
		switch (keyPress.key.toLowerCase()) {
			case Keys.RETURN.code:
				this.resolveInput(attrs, true);
				break;
			case Keys.DOWN.code:
				this.moveSelection(true);
				event.stopImmediatePropagation();
				return false;
			case Keys.UP.code:
				this.moveSelection(false);
				event.stopImmediatePropagation();
				return false;
		}
		return true;
	}
	moveSelection(forward) {
		const selectedIndex = this.selected ? this.options().indexOf(this.selected) : -1;
		const optionsLength = this.options().length;
		let newIndex;
		if (forward) newIndex = selectedIndex + 1 < optionsLength ? selectedIndex + 1 : 0;
else newIndex = selectedIndex - 1 >= 0 ? selectedIndex - 1 : optionsLength - 1;
		this.selected = this.options()[newIndex];
	}
	async selectSuggestion(attrs) {
		if (this.selected == null) return;
		if (this.selected.value.type === "recipient") {
			const { address, name, contact } = this.selected.value.value;
			attrs.onRecipientAdded(address, name, contact);
			attrs.search.clear();
			this.value = "";
		} else {
			attrs.search.clear();
			this.value = "";
			const recipients = await attrs.search.resolveContactList(this.selected.value.value);
			for (const { address, name, contact } of recipients) attrs.onRecipientAdded(address, name, contact);
			mithril_default.redraw();
		}
		this.closePicker();
	}
	/**
	* Resolves a typed in mail address or one of the suggested ones.
	* @param attrs
	* @param selectSuggestion boolean value indicating whether a suggestion should be selected or not. Should be true if a suggestion is explicitly selected by
	* for example hitting the enter key and false e.g. if the dialog is closed
	*/
	resolveInput(attrs, selectSuggestion) {
		const suggestions = attrs.search.results();
		if (suggestions.length > 0 && selectSuggestion) this.selectSuggestion(attrs);
else {
			const parsed = parseMailAddress(this.value);
			if (parsed != null) {
				attrs.onRecipientAdded(parsed.address, parsed.name, null);
				this.value = "";
				this.closePicker();
			}
		}
	}
	closePicker() {
		if (this.selectDOM) this.selectDOM.state.dropdownContainer?.onClose();
	}
};

//#endregion
//#region src/common/gui/PasswordInput.ts
var PasswordInput = class {
	showPassword = false;
	view(vnode) {
		return mithril_default(".flex.flex-grow.full-width.justify-between.items-center.gap-vpad-s", [
			vnode.attrs.showStrength ? mithril_default("div", { style: {
				width: px(size.icon_size_medium),
				height: px(size.icon_size_medium),
				border: `1px solid ${theme.content_button}`,
				borderRadius: "50%",
				background: `conic-gradient(from .25turn, ${theme.content_button} ${scaleToVisualPasswordStrength(vnode.attrs.strength)}%, transparent 0%)`
			} }) : null,
			mithril_default(SingleLineTextField, {
				classes: ["flex-grow"],
				ariaLabel: vnode.attrs.ariaLabel,
				type: this.showPassword ? TextFieldType.Text : TextFieldType.Password,
				value: vnode.attrs.password,
				oninput: vnode.attrs.oninput,
				style: { padding: `${px(size.vpad_xsm)} ${px(size.vpad_small)}` },
				placeholder: lang.get("password_label")
			}),
			mithril_default(IconButton, {
				size: ButtonSize.Compact,
				title: this.showPassword ? "concealPassword_action" : "revealPassword_action",
				icon: this.showPassword ? Icons.NoEye : Icons.Eye,
				click: () => this.showPassword = !this.showPassword
			})
		]);
	}
};

//#endregion
//#region src/common/gui/Divider.ts
var Divider = class {
	view({ attrs }) {
		return mithril_default("hr.m-0.border-none.full-width", { style: {
			height: "1px",
			backgroundColor: attrs.color,
			color: attrs.color,
			...attrs.style
		} });
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-view/AttendeeListEditor.ts
var import_stream$5 = __toESM(require_stream(), 1);
var AttendeeListEditor = class {
	hasPlanWithInvites = false;
	view({ attrs }) {
		const { whoModel } = attrs.model.editModels;
		const organizer = whoModel.organizer;
		return [mithril_default(".flex-grow.flex.flex-column.gap-vpad.pb.pt.fit-height", { style: { width: px(attrs.width) } }, [this.renderOrganizer(attrs.model, organizer), mithril_default(".flex.flex-column.gap-vpad-s", [
			mithril_default("small.uppercase.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("guests_label")),
			whoModel.canModifyGuests ? this.renderGuestsInput(whoModel, attrs.logins, attrs.recipientsSearch) : null,
			this.renderSendUpdateCheckbox(attrs.model.editModels.whoModel),
			this.renderGuestList(attrs, organizer)
		])])];
	}
	renderGuestList(attrs, organizer) {
		const { whoModel } = attrs.model.editModels;
		const guestItems = [];
		for (const guest of whoModel.guests) {
			let password;
			let strength;
			if (guest.type === RecipientType.EXTERNAL) {
				const presharedPassword = whoModel.getPresharedPassword(guest.address);
				password = presharedPassword.password;
				strength = presharedPassword.strength;
			}
			guestItems.push(() => this.renderGuest(guest, attrs, password, strength));
		}
		const ownGuest = whoModel.ownGuest;
		if (ownGuest != null && ownGuest.address !== organizer?.address) guestItems.push(() => this.renderGuest(ownGuest, attrs));
		const verticalPadding = guestItems.length > 0 ? size.vpad_small : 0;
		return guestItems.length === 0 ? mithril_default(Card, {
			classes: ["min-h-s flex flex-column gap-vpad-s"],
			style: { padding: `${px(verticalPadding)} ${px(guestItems.length === 0 ? size.vpad_small : 0)} ${px(size.vpad_small)} ${px(verticalPadding)}` }
		}, mithril_default(".flex.items-center.justify-center.min-h-s", [mithril_default(IconMessageBox, {
			message: "noEntries_msg",
			icon: Icons.People,
			color: theme.list_message_bg
		})])) : guestItems.map((r, index) => r());
	}
	renderGuestsInput(whoModel, logins, recipientsSearch) {
		const guests = whoModel.guests;
		const hasExternalGuests = guests.some((a) => a.type === RecipientType.EXTERNAL);
		return mithril_default(".flex.items-center.flex-grow.gap-vpad-s", [mithril_default(Card, {
			style: { padding: "0" },
			classes: ["flex-grow"]
		}, [mithril_default(".flex.flex-grow.rel.button-height", [mithril_default(GuestPicker, {
			ariaLabel: "addGuest_label",
			disabled: false,
			onRecipientAdded: async (address, name, contact) => {
				if (!await hasPlanWithInvites(logins) && !this.hasPlanWithInvites) {
					if (logins.getUserController().user.accountType === AccountType.EXTERNAL) return;
					if (logins.getUserController().isGlobalAdmin()) {
						const { getAvailablePlansWithEventInvites } = await import("./SubscriptionUtils2-chunk.js");
						const plansWithEventInvites = await getAvailablePlansWithEventInvites();
						if (plansWithEventInvites.length === 0) return;
						this.hasPlanWithInvites = await showPlanUpgradeRequiredDialog(plansWithEventInvites);
						if (!this.hasPlanWithInvites) return;
					} else Dialog.message("contactAdmin_msg");
				} else whoModel.addAttendee(address, contact);
			},
			search: recipientsSearch
		})])]), hasExternalGuests ? mithril_default(Card, { style: { padding: "0" } }, mithril_default(ToggleButton, {
			title: "confidential_action",
			onToggled: (_, e) => {
				whoModel.isConfidential = !whoModel.isConfidential;
				e.stopPropagation();
			},
			icon: whoModel.isConfidential ? Icons.Lock : Icons.Unlock,
			toggled: whoModel.isConfidential,
			size: ButtonSize.Normal
		})) : null]);
	}
	renderAttendeeStatus(model, organizer) {
		const { status } = organizer ?? { status: CalendarAttendeeStatus.TENTATIVE };
		const attendingOptions = createAttendingItems().filter((option) => option.selectable !== false);
		const attendingStatus = attendingOptions.find((option) => option.value === status);
		return mithril_default(".flex.flex-column.pl-vpad-s.pr-vpad-s", [mithril_default(Select, {
			onchange: (option) => {
				if (option.selectable === false) return;
				model.setOwnAttendance(option.value);
			},
			classes: ["button-min-height"],
			selected: attendingStatus,
			disabled: organizer == null,
			ariaLabel: lang.get("attending_label"),
			renderOption: (option) => mithril_default("button.items-center.flex-grow.state-bg.button-content.dropdown-button.pt-s.pb-s.button-min-height", {
				class: option.selectable === false ? `no-hover` : "",
				style: { color: option.value === status ? theme.content_button_selected : undefined }
			}, option.name),
			renderDisplay: (option) => mithril_default("", option.name),
			options: (0, import_stream$5.default)(attendingOptions),
			expanded: true,
			noIcon: organizer == null
		})]);
	}
	renderOrganizer(model, organizer) {
		const { whoModel } = model.editModels;
		if (!(whoModel.possibleOrganizers.length > 0 || organizer)) {
			console.log("Trying to access guest without organizer");
			return null;
		}
		const { address, name, status } = organizer ?? {};
		const hasGuest = whoModel.guests.length > 0;
		const isMe = organizer?.address === whoModel.ownGuest?.address;
		const editableOrganizer = whoModel.possibleOrganizers.length > 1 && isMe;
		const options = whoModel.possibleOrganizers.map((organizer$1) => {
			return {
				name: organizer$1.name,
				address: organizer$1.address,
				ariaValue: organizer$1.address,
				value: organizer$1.address
			};
		});
		const disabled = !editableOrganizer || !hasGuest;
		const selected = options.find((option) => option.address === address) ?? options[0];
		return mithril_default(".flex.col", [mithril_default("small.uppercase.pb-s.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("organizer_label")), mithril_default(Card, { style: { padding: `0` } }, [mithril_default(".flex.flex-column", [mithril_default(".flex.pl-vpad-s.pr-vpad-s", [mithril_default(Select, {
			classes: ["flex-grow", "button-min-height"],
			onchange: (option) => {
				const organizer$1 = whoModel.possibleOrganizers.find((organizer$2) => organizer$2.address === option.address);
				if (organizer$1) whoModel.addAttendee(organizer$1.address, null);
			},
			selected,
			disabled,
			ariaLabel: lang.get("organizer_label"),
			renderOption: (option) => mithril_default("button.items-center.flex-grow.state-bg.button-content.dropdown-button.pt-s.pb-s.button-min-height", { style: { color: selected.address === option.address ? theme.content_button_selected : undefined } }, option.address),
			renderDisplay: (option) => mithril_default("", option.name ? `${option.name} <${option.address}>` : option.address),
			options: (0, import_stream$5.default)(whoModel.possibleOrganizers.map((organizer$1) => {
				return {
					name: organizer$1.name,
					address: organizer$1.address,
					ariaValue: organizer$1.address,
					value: organizer$1.address
				};
			})),
			noIcon: disabled,
			expanded: true
		}), model.operation !== CalendarOperation.EditThis && organizer && !isMe ? mithril_default(IconButton, {
			title: "sendMail_alt",
			click: async () => (await import("./ContactView2-chunk.js")).writeMail(organizer, lang.get("repliedToEventInvite_msg", { "{event}": model.editModels.summary.content })),
			size: ButtonSize.Compact,
			icon: Icons.PencilSquare
		}) : null]), isMe && model.operation !== CalendarOperation.EditThis ? [mithril_default(Divider, { color: theme.button_bubble_bg }), this.renderAttendeeStatus(whoModel, organizer)] : null])])]);
	}
	renderSendUpdateCheckbox(whoModel) {
		return !whoModel.initiallyHadOtherAttendees || !whoModel.canModifyGuests ? null : mithril_default(Card, mithril_default(Switch, {
			checked: whoModel.shouldSendUpdates,
			onclick: (value) => whoModel.shouldSendUpdates = value,
			ariaLabel: lang.get("sendUpdates_label"),
			disabled: false,
			variant: "expanded"
		}, lang.get("sendUpdates_label")));
	}
	renderGuest(guest, { model }, password, strength) {
		const { whoModel } = model.editModels;
		const { address, name, status } = guest;
		const isMe = guest.address === whoModel.ownGuest?.address;
		const roleLabel = isMe ? `${lang.get("guest_label")} | ${lang.get("you_label")}` : lang.get("guest_label");
		const renderPasswordField = whoModel.isConfidential && password != null && guest.type === RecipientType.EXTERNAL;
		let rightContent = null;
		if (isMe) rightContent = mithril_default("", { style: { paddingRight: px(size.vpad_small) } }, this.renderAttendeeStatus(model.editModels.whoModel, guest));
else if (whoModel.canModifyGuests) rightContent = mithril_default(IconButton, {
			title: "remove_action",
			icon: Icons.Cancel,
			click: () => whoModel.removeAttendee(guest.address)
		});
		return mithril_default(Card, { style: { padding: `${px(size.vpad_small)} ${px(0)} ${px(size.vpad_small)} ${px(size.vpad_small)}` } }, mithril_default(".flex.flex-column.items-center", [mithril_default(".flex.items-center.flex-grow.full-width", [
			this.renderStatusIcon(status),
			mithril_default(".flex.flex-column.flex-grow.min-width-0", [mithril_default(".small", { style: { lineHeight: px(size.vpad_small) } }, roleLabel), mithril_default(".text-ellipsis", name.length > 0 ? `${name} ${address}` : address)]),
			rightContent
		]), renderPasswordField ? [mithril_default(".flex.full-width", { style: { padding: `0 0 ${px(size.vpad_xsm)} ${px(size.vpad_small + size.icon_size_medium_large)}` } }, mithril_default(Divider, { color: theme.button_bubble_bg })), this.renderPasswordField(address, password, strength ?? 0, whoModel)] : null]));
	}
	renderPasswordField(address, password, strength, whoModel) {
		const label = lang.get("passwordFor_label", { "{1}": address });
		return [mithril_default(".flex.flex-grow.full-width.justify-between.items-end", [mithril_default(".flex.flex-column.full-width", { style: {
			paddingLeft: px(size.hpad_medium + size.vpad_small),
			paddingRight: px((size.button_height - size.button_height_compact) / 2)
		} }, [mithril_default(PasswordInput, {
			ariaLabel: label,
			password,
			strength,
			oninput: (newPassword) => {
				whoModel.setPresharedPassword(address, newPassword);
			}
		})])])];
	}
	renderStatusIcon(status) {
		const icon = iconForAttendeeStatus[status];
		return mithril_default(Icon, {
			icon,
			size: IconSize.Large,
			class: "mr-s",
			style: { fill: theme.content_fg }
		});
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/pickers/TimePicker.ts
var import_stream$4 = __toESM(require_stream(), 1);
var TimePicker = class {
	values;
	focused;
	isExpanded = false;
	oldValue;
	value;
	amPm;
	constructor({ attrs }) {
		this.focused = false;
		this.value = "";
		this.amPm = attrs.timeFormat === TimeFormat.TWELVE_HOURS;
		const times = [];
		for (let hour = 0; hour < 24; hour++) for (let minute = 0; minute < 60; minute += 30) times.push(timeStringFromParts(hour, minute, this.amPm));
		this.oldValue = attrs.time?.toString(false) ?? "--";
		this.values = times;
	}
	view({ attrs }) {
		if (attrs.time) {
			const timeAsString = attrs.time?.toString(this.amPm) ?? "";
			if (!this.focused) this.value = timeAsString;
		}
		if (isApp()) return this.renderNativeTimePicker(attrs);
else return this.renderCustomTimePicker(attrs);
	}
	renderNativeTimePicker(attrs) {
		if (this.oldValue !== attrs.time?.toString(false)) this.onSelected(attrs);
		const timeAsString = attrs.time?.toString(false) ?? "";
		this.oldValue = timeAsString;
		this.value = timeAsString;
		const displayTime = attrs.time?.toString(this.amPm);
		return mithril_default(".rel", [mithril_default("input.fill-absolute.invisible.tutaui-button-outline", {
			disabled: attrs.disabled,
			type: TextFieldType.Time,
			style: {
				zIndex: 1,
				border: `2px solid ${theme.content_message_bg}`,
				width: "auto",
				height: "auto",
				appearance: "none",
				opacity: attrs.disabled ? .7 : 1
			},
			value: this.value,
			oninput: (event) => {
				const inputValue = event.target.value;
				if (this.value === inputValue) return;
				this.value = inputValue;
				attrs.onTimeSelected(Time.parseFromString(inputValue));
			}
		}), mithril_default(".tutaui-button-outline", {
			class: attrs.classes?.join(" "),
			style: {
				zIndex: "2",
				position: "inherit",
				borderColor: "transparent",
				pointerEvents: "none",
				padding: `${px(size.vpad_small)} 0`,
				opacity: attrs.disabled ? .7 : 1
			}
		}, displayTime)]);
	}
	renderCustomTimePicker(attrs) {
		const options = this.values.map((time) => ({
			value: time,
			name: time,
			ariaValue: time
		}));
		return mithril_default(Select, {
			onchange: (newValue) => {
				if (this.value === newValue.value) return;
				this.value = newValue.value;
				this.onSelected(attrs);
				mithril_default.redraw.sync();
			},
			onclose: () => {
				this.isExpanded = false;
			},
			selected: {
				value: this.value,
				name: this.value,
				ariaValue: this.value
			},
			ariaLabel: attrs.ariaLabel,
			disabled: attrs.disabled,
			options: (0, import_stream$4.default)(options),
			noIcon: true,
			expanded: true,
			tabIndex: Number(TabIndex.Programmatic),
			renderDisplay: () => this.renderTimeSelectInput(attrs),
			renderOption: (option) => this.renderTimeOptions(option),
			keepFocus: true
		});
	}
	renderTimeOptions(option) {
		return mithril_default("button.items-center.flex-grow", { class: "state-bg button-content dropdown-button pt-s pb-s button-min-height" }, option.name);
	}
	renderTimeSelectInput(attrs) {
		return mithril_default(SingleLineTextField, {
			classes: [
				...attrs.classes ?? [],
				"tutaui-button-outline",
				"text-center",
				"border-content-message-bg"
			],
			value: this.value,
			oninput: (val) => {
				if (this.value === val) return;
				this.value = val;
			},
			disabled: attrs.disabled,
			ariaLabel: attrs.ariaLabel,
			style: { textAlign: "center" },
			onclick: (e) => {
				e.stopImmediatePropagation();
				if (!this.isExpanded) {
					e.target.parentElement?.click();
					this.isExpanded = true;
				}
			},
			onfocus: (event) => {
				this.focused = true;
				if (!this.isExpanded) {
					event.target.parentElement?.click();
					this.isExpanded = true;
				}
			},
			onblur: (e) => {
				if (this.focused) this.onSelected(attrs);
				e.redraw = false;
			},
			type: TextFieldType.Text
		});
	}
	onSelected(attrs) {
		this.focused = false;
		attrs.onTimeSelected(Time.parseFromString(this.value));
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-view/EventTimeEditor.ts
var EventTimeEditor = class {
	view(vnode) {
		const { attrs } = vnode;
		const { startOfTheWeekOffset, editModel, timeFormat, disabled } = attrs;
		const appClasses = isApp() ? ["smaller"] : [];
		return mithril_default(".flex", [mithril_default(".flex.col.flex-grow.gap-vpad-s", [mithril_default(".flex.gap-vpad-s.items-center.pr-vpad-s", [mithril_default(Icon, {
			icon: Icons.Time,
			style: { fill: theme.content_fg },
			title: lang.get("timeSection_label"),
			size: IconSize.Medium
		}), mithril_default(Switch, {
			checked: editModel.isAllDay,
			onclick: (value) => editModel.isAllDay = value,
			ariaLabel: lang.get("allDay_label"),
			disabled,
			variant: "expanded"
		}, lang.get("allDay_label"))]), mithril_default(".flex.col.full-width.flex-grow.gap-vpad-s", { style: { paddingLeft: px(size.icon_size_large + size.vpad_small) } }, [mithril_default(Divider, { color: theme.button_bubble_bg }), mithril_default(".time-selection-grid.pr-vpad-s", [
			mithril_default("", lang.get("dateFrom_label")),
			mithril_default(`${isApp() ? "" : ".pl-vpad-l"}`, mithril_default(DatePicker, {
				classes: appClasses,
				date: attrs.editModel.startDate,
				onDateSelected: (date) => date && (editModel.startDate = date),
				startOfTheWeekOffset,
				label: "dateFrom_label",
				useInputButton: true,
				disabled: attrs.disabled
			})),
			mithril_default("", mithril_default(TimePicker, {
				classes: appClasses,
				time: editModel.startTime,
				onTimeSelected: (time) => editModel.startTime = time,
				timeFormat,
				disabled: attrs.disabled || attrs.editModel.isAllDay,
				ariaLabel: lang.get("startTime_label")
			})),
			mithril_default("", lang.get("dateTo_label")),
			mithril_default(`${isApp() ? "" : ".pl-vpad-l"}`, mithril_default(DatePicker, {
				classes: appClasses,
				date: attrs.editModel.endDate,
				onDateSelected: (date) => date && (editModel.endDate = date),
				startOfTheWeekOffset,
				label: "dateTo_label",
				useInputButton: true,
				disabled: attrs.disabled
			})),
			mithril_default("", mithril_default(TimePicker, {
				classes: appClasses,
				time: editModel.endTime,
				onTimeSelected: (time) => editModel.endTime = time,
				timeFormat,
				disabled: attrs.disabled || attrs.editModel.isAllDay,
				ariaLabel: lang.get("endTime_label")
			}))
		])])])]);
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/RemindersEditor.ts
var import_stream$3 = __toESM(require_stream(), 1);
var RemindersEditor = class {
	view(vnode) {
		const { addAlarm, removeAlarm, alarms, useNewEditor } = vnode.attrs;
		const addNewAlarm = (newAlarm) => {
			const hasAlarm = alarms.find((alarm) => deepEqual(alarm, newAlarm));
			if (hasAlarm) return;
			addAlarm(newAlarm);
		};
		return useNewEditor ? this.renderNewEditor(alarms, removeAlarm, addNewAlarm, addAlarm) : this.renderOldEditor(alarms, removeAlarm, addNewAlarm, vnode);
	}
	renderOldEditor(alarms, removeAlarm, addNewAlarm, vnode) {
		const textFieldAttrs = alarms.map((a) => ({
			value: humanDescriptionForAlarmInterval(a, lang.languageTag),
			label: "emptyString_msg",
			isReadOnly: true,
			injectionsRight: () => mithril_default(IconButton, {
				title: "delete_action",
				icon: Icons.Cancel,
				click: () => removeAlarm(a)
			})
		}));
		textFieldAttrs.push({
			value: lang.get("add_action"),
			label: "emptyString_msg",
			isReadOnly: true,
			injectionsRight: () => mithril_default(IconButton, attachDropdown({
				mainButtonAttrs: {
					title: "add_action",
					icon: Icons.Add
				},
				childAttrs: () => [...createAlarmIntervalItems(lang.languageTag).map((i) => ({
					label: lang.makeTranslation(i.name, i.name),
					click: () => addNewAlarm(i.value)
				})), {
					label: "calendarReminderIntervalDropdownCustomItem_label",
					click: () => {
						this.showCustomReminderIntervalDialog((value, unit) => {
							addNewAlarm({
								value,
								unit
							});
						});
					}
				}]
			}))
		});
		textFieldAttrs[0].label = vnode.attrs.label;
		return mithril_default(".flex.col.flex-half.pl-s", textFieldAttrs.map((a) => mithril_default(TextField, a)));
	}
	renderNewEditor(alarms, removeAlarm, addNewAlarm, addAlarm) {
		const alarmOptions = createAlarmIntervalItems(lang.languageTag).map((alarm) => ({
			text: alarm.name,
			value: alarm.value,
			ariaValue: alarm.name
		}));
		alarmOptions.push({
			text: lang.get("calendarReminderIntervalDropdownCustomItem_label"),
			ariaValue: lang.get("calendarReminderIntervalDropdownCustomItem_label"),
			value: {
				value: -1,
				unit: AlarmIntervalUnit.MINUTE
			}
		});
		const defaultSelected = {
			text: lang.get("addReminder_label"),
			value: {
				value: -2,
				unit: AlarmIntervalUnit.MINUTE
			},
			ariaValue: lang.get("addReminder_label")
		};
		return mithril_default("ul.unstyled-list.flex.col.flex-grow.gap-vpad-s", [alarms.map((alarm) => mithril_default("li.flex.justify-between.flew-grow.items-center.gap-vpad-s", [mithril_default("span.flex.justify-between", humanDescriptionForAlarmInterval(alarm, lang.languageTag)), mithril_default(BaseButton, {
			label: lang.makeTranslation("delete_action", `${lang.get("delete_action")} ${humanDescriptionForAlarmInterval(alarm, lang.languageTag)}`),
			onclick: () => removeAlarm(alarm),
			class: "flex items-center"
		}, mithril_default(Icon, {
			icon: Icons.Cancel,
			size: IconSize.Medium,
			style: { fill: getColors(ButtonColor.Content).button }
		}))])), mithril_default("li.items-center", mithril_default(Select, {
			ariaLabel: lang.get("calendarReminderIntervalValue_label"),
			selected: defaultSelected,
			options: (0, import_stream$3.default)(alarmOptions),
			renderOption: (option) => this.renderReminderOptions(option, false, false),
			renderDisplay: (option) => this.renderReminderOptions(option, alarms.length > 0, true),
			onchange: (newValue) => {
				if (newValue.value.value === -1) return setTimeout(() => {
					this.showCustomReminderIntervalDialog((value, unit) => {
						addNewAlarm({
							value,
							unit
						});
					});
				}, 0);
				addAlarm(newValue.value);
			},
			expanded: true,
			iconColor: getColors(ButtonColor.Content).button,
			noIcon: true
		}))]);
	}
	renderReminderOptions(option, hasAlarms, isDisplay) {
		return mithril_default("button.items-center.flex-grow", {
			tabIndex: isDisplay ? TabIndex.Programmatic : undefined,
			class: isDisplay ? `flex ${hasAlarms ? "text-fade" : ""}` : "state-bg button-content button-min-height dropdown-button pt-s pb-s"
		}, option.text);
	}
	showCustomReminderIntervalDialog(onAddAction) {
		let timeReminderValue = 0;
		let timeReminderUnit = AlarmIntervalUnit.MINUTE;
		Dialog.showActionDialog({
			title: "calendarReminderIntervalCustomDialog_title",
			allowOkWithReturn: true,
			child: { view: () => {
				const unitItems = createCustomRepeatRuleUnitValues() ?? [];
				return mithril_default(".flex full-width pt-s", [mithril_default(TextField, {
					type: TextFieldType.Number,
					min: 0,
					label: "calendarReminderIntervalValue_label",
					value: timeReminderValue.toString(),
					oninput: (v) => {
						const time = Number.parseInt(v);
						const isEmpty = v === "";
						if (!Number.isNaN(time) || isEmpty) timeReminderValue = isEmpty ? 0 : Math.abs(time);
					},
					class: "flex-half no-appearance"
				}), mithril_default(DropDownSelector, {
					label: "emptyString_msg",
					selectedValue: timeReminderUnit,
					items: unitItems,
					class: "flex-half pl-s",
					selectionChangedHandler: (selectedValue) => timeReminderUnit = selectedValue,
					disabled: false
				})]);
			} },
			okActionTextId: "add_action",
			okAction: (dialog) => {
				onAddAction(timeReminderValue, timeReminderUnit);
				dialog.close();
			}
		});
	}
};

//#endregion
//#region src/common/gui/base/RadioGroup.ts
var RadioGroup = class {
	view({ attrs }) {
		return mithril_default("ul.unstyled-list.flex.col.gap-vpad", {
			ariaLabel: lang.getTranslationText(attrs.ariaLabel),
			role: AriaRole.RadioGroup
		}, attrs.options.map((option) => this.renderOption(attrs.name, option, attrs.selectedOption, attrs.classes?.join(" "), attrs.onOptionSelected, attrs.injectionMap)));
	}
	renderOption(groupName, option, selectedOption, optionClass, onOptionSelected, injectionMap) {
		const name = lang.getTranslationText(groupName);
		const valueString = String(option.value);
		const isSelected = option.value === selectedOption;
		const optionId = `${name}-${valueString}`;
		return mithril_default("li.flex.gap-vpad.cursor-pointer.full-width.flash", {
			class: optionClass ?? "",
			onclick: () => {
				console.log("Clicked?");
				onOptionSelected(option.value);
			}
		}, [mithril_default("input[type=radio].m-0.big-radio.content-accent-accent", {
			name: lang.getTranslationText(groupName),
			value: valueString,
			id: optionId,
			checked: isSelected ? true : null,
			onkeydown: (event) => {
				if (isKeyPressed(event.key, Keys.RETURN)) onOptionSelected(option.value);
				return true;
			}
		}), mithril_default(".flex.flex-column.full-width", [mithril_default("label.cursor-pointer", { for: optionId }, lang.getTranslationText(option.name)), this.getInjection(String(option.value), injectionMap)])]);
	}
	getInjection(key, injectionMap) {
		if (!injectionMap || !injectionMap.has(key)) return null;
		return injectionMap.get(key);
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-view/RepeatRuleEditor.ts
var import_stream$2 = __toESM(require_stream(), 1);
var RepeatRuleEditor = class {
	repeatRuleType = null;
	repeatInterval = 0;
	intervalOptions = (0, import_stream$2.default)([]);
	intervalExpanded = false;
	numberValues = createIntervalValues();
	occurrencesOptions = (0, import_stream$2.default)([]);
	occurrencesExpanded = false;
	repeatOccurrences;
	constructor({ attrs }) {
		if (attrs.model.repeatPeriod != null) this.repeatRuleType = this.getRepeatType(attrs.model.repeatPeriod, attrs.model.repeatInterval, attrs.model.repeatEndType);
		this.intervalOptions(this.numberValues);
		this.occurrencesOptions(this.numberValues);
		this.repeatInterval = attrs.model.repeatInterval;
		this.repeatOccurrences = attrs.model.repeatEndOccurrences;
	}
	getRepeatType(period, interval, endTime) {
		if (interval > 1 || endTime !== EndType.Never) return "CUSTOM";
		return period;
	}
	view({ attrs }) {
		const customRuleOptions = customFrequenciesOptions.map((option) => ({
			...option,
			name: attrs.model.repeatInterval > 1 ? option.name.plural : option.name.singular
		}));
		return mithril_default(".pb.pt.flex.col.gap-vpad.fit-height", {
			class: this.repeatRuleType === "CUSTOM" ? "box-content" : "",
			style: { width: px(attrs.width) }
		}, [
			mithril_default(Card, { style: { padding: `${size.vpad}px` } }, mithril_default(RadioGroup, {
				ariaLabel: "calendarRepeating_label",
				name: "calendarRepeating_label",
				options: createRepeatRuleOptions(),
				selectedOption: this.repeatRuleType,
				onOptionSelected: (option) => {
					this.repeatRuleType = option;
					if (option === "CUSTOM") attrs.model.repeatPeriod = attrs.model.repeatPeriod ?? RepeatPeriod.DAILY;
else {
						attrs.model.repeatInterval = 1;
						attrs.model.repeatEndType = EndType.Never;
						attrs.model.repeatPeriod = option;
						attrs.backAction();
					}
				},
				classes: ["cursor-pointer"]
			})),
			this.renderFrequencyOptions(attrs, customRuleOptions),
			this.renderEndOptions(attrs)
		]);
	}
	renderEndOptions(attrs) {
		if (this.repeatRuleType !== "CUSTOM") return null;
		return mithril_default(".flex.col", [mithril_default("small.uppercase.pb-s.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("calendarRepeatStopCondition_label")), mithril_default(Card, {
			style: { padding: `${size.vpad}px` },
			classes: [
				"flex",
				"col",
				"gap-vpad-s"
			]
		}, [mithril_default(RadioGroup, {
			ariaLabel: "calendarRepeatStopCondition_label",
			name: "calendarRepeatStopCondition_label",
			options: createCustomEndTypeOptions(),
			selectedOption: attrs.model.repeatEndType,
			onOptionSelected: (option) => {
				attrs.model.repeatEndType = option;
			},
			classes: ["cursor-pointer"],
			injectionMap: this.buildInjections(attrs)
		})])]);
	}
	renderFrequencyOptions(attrs, customRuleOptions) {
		if (this.repeatRuleType !== "CUSTOM") return null;
		return mithril_default(".flex.col", [mithril_default("small.uppercase.pb-s.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("intervalFrequency_label")), mithril_default(Card, {
			style: { padding: `0 0 ${size.vpad}px` },
			classes: ["flex", "col"]
		}, [
			this.renderIntervalPicker(attrs),
			mithril_default(Divider, {
				color: theme.button_bubble_bg,
				style: { margin: `0 0 ${size.vpad}px` }
			}),
			mithril_default(RadioGroup, {
				ariaLabel: "intervalFrequency_label",
				name: "intervalFrequency_label",
				options: customRuleOptions,
				selectedOption: attrs.model.repeatPeriod,
				onOptionSelected: (option) => {
					this.updateCustomRule(attrs.model, { intervalFrequency: option });
				},
				classes: [
					"cursor-pointer",
					"capitalize",
					"pl-vpad-m",
					"pr-vpad-m"
				]
			})
		])]);
	}
	buildInjections(attrs) {
		const injectionMap = new Map();
		injectionMap.set(EndType.Count, this.renderEndsPicker(attrs));
		injectionMap.set(EndType.UntilDate, mithril_default(DatePicker, {
			date: attrs.model.repeatEndDateForDisplay,
			onDateSelected: (date) => date && (attrs.model.repeatEndDateForDisplay = date),
			label: "endDate_label",
			useInputButton: true,
			startOfTheWeekOffset: attrs.startOfTheWeekOffset,
			position: PickerPosition.TOP,
			classes: [
				"full-width",
				"flex-grow",
				attrs.model.repeatEndType !== EndType.UntilDate ? "disabled" : ""
			]
		}));
		return injectionMap;
	}
	updateCustomRule(whenModel, customRule) {
		const { interval, intervalFrequency } = customRule;
		if (interval && !isNaN(interval)) whenModel.repeatInterval = interval;
		if (intervalFrequency) whenModel.repeatPeriod = intervalFrequency;
	}
	renderIntervalPicker(attrs) {
		return mithril_default(Select, {
			onchange: (newValue) => {
				if (this.repeatInterval === newValue.value) return;
				this.repeatInterval = newValue.value;
				this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
				mithril_default.redraw.sync();
			},
			onclose: () => {
				this.intervalExpanded = false;
				this.intervalOptions(this.numberValues);
			},
			selected: {
				value: this.repeatInterval,
				name: this.repeatInterval.toString(),
				ariaValue: this.repeatInterval.toString()
			},
			ariaLabel: lang.get("repeatsEvery_label"),
			options: this.intervalOptions,
			noIcon: true,
			expanded: true,
			tabIndex: isApp() ? Number(TabIndex.Default) : Number(TabIndex.Programmatic),
			classes: ["no-appearance"],
			renderDisplay: () => mithril_default(SingleLineTextField, {
				classes: ["border-radius-bottom-0"],
				value: isNaN(this.repeatInterval) ? "" : this.repeatInterval.toString(),
				inputMode: isApp() ? InputMode.NONE : InputMode.TEXT,
				readonly: isApp(),
				oninput: (val) => {
					if (val !== "" && this.repeatInterval === Number(val)) return;
					this.repeatInterval = val === "" ? NaN : Number(val);
					if (!isNaN(this.repeatInterval)) {
						this.intervalOptions(this.numberValues.filter((opt) => opt.value.toString().startsWith(val)));
						this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
					} else this.intervalOptions(this.numberValues);
				},
				ariaLabel: lang.get("repeatsEvery_label"),
				onclick: (e) => {
					e.stopImmediatePropagation();
					if (!this.intervalExpanded) {
						e.target.parentElement?.click();
						this.intervalExpanded = true;
					}
				},
				onfocus: (event) => {
					if (!this.intervalExpanded) {
						event.target.parentElement?.click();
						this.intervalExpanded = true;
					}
				},
				onblur: (event) => {
					if (isNaN(this.repeatInterval)) {
						this.repeatInterval = this.numberValues[0].value;
						this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
					} else if (this.repeatInterval === 0) {
						this.repeatInterval = this.numberValues[0].value;
						this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
					}
				},
				style: { textAlign: "center" },
				max: 256,
				min: 1,
				type: TextFieldType.Number
			}),
			renderOption: (option) => mithril_default("button.items-center.flex-grow", { class: "state-bg button-content dropdown-button pt-s pb-s button-min-height" }, option.name),
			keepFocus: true
		});
	}
	renderEndsPicker(attrs) {
		return mithril_default(Select, {
			onchange: (newValue) => {
				if (this.repeatOccurrences === newValue.value) return;
				this.repeatOccurrences = newValue.value;
				attrs.model.repeatEndOccurrences = newValue.value;
			},
			onclose: () => {
				this.occurrencesExpanded = false;
				this.occurrencesOptions(this.numberValues);
			},
			selected: {
				value: this.repeatOccurrences,
				name: this.repeatOccurrences.toString(),
				ariaValue: this.repeatOccurrences.toString()
			},
			ariaLabel: lang.get("occurrencesCount_label"),
			options: this.occurrencesOptions,
			noIcon: true,
			expanded: true,
			tabIndex: isApp() ? Number(TabIndex.Default) : Number(TabIndex.Programmatic),
			classes: ["no-appearance"],
			renderDisplay: () => mithril_default(SingleLineTextField, {
				classes: [
					"tutaui-button-outline",
					"text-center",
					"border-content-message-bg"
				],
				value: isNaN(this.repeatOccurrences) ? "" : this.repeatOccurrences.toString(),
				inputMode: isApp() ? InputMode.NONE : InputMode.TEXT,
				readonly: isApp(),
				oninput: (val) => {
					if (val !== "" && this.repeatOccurrences === Number(val)) return;
					this.repeatOccurrences = val === "" ? NaN : Number(val);
					if (!isNaN(this.repeatOccurrences)) {
						this.occurrencesOptions(this.numberValues.filter((opt) => opt.value.toString().startsWith(val)));
						attrs.model.repeatEndOccurrences = this.repeatOccurrences;
					} else this.occurrencesOptions(this.numberValues);
				},
				ariaLabel: lang.get("occurrencesCount_label"),
				style: { textAlign: "center" },
				onclick: (e) => {
					e.stopImmediatePropagation();
					if (!this.occurrencesExpanded) {
						e.target.parentElement?.click();
						this.occurrencesExpanded = true;
					}
				},
				onfocus: (event) => {
					if (!this.occurrencesExpanded) {
						event.target.parentElement?.click();
						this.occurrencesExpanded = true;
					}
				},
				onblur: (event) => {
					if (isNaN(this.repeatOccurrences)) {
						this.repeatOccurrences = this.numberValues[0].value;
						attrs.model.repeatEndOccurrences = this.repeatOccurrences;
					} else if (this.repeatOccurrences === 0) {
						this.repeatOccurrences = this.numberValues[0].value;
						attrs.model.repeatEndOccurrences = this.repeatOccurrences;
					}
				},
				max: 256,
				min: 1,
				type: TextFieldType.Number
			}),
			renderOption: (option) => mithril_default("button.items-center.flex-grow", { class: "state-bg button-content dropdown-button pt-s pb-s button-min-height" }, option.name),
			keepFocus: true
		});
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-view/CalendarEventEditView.ts
var import_stream$1 = __toESM(require_stream(), 1);
let EditorPages = function(EditorPages$1) {
	EditorPages$1[EditorPages$1["MAIN"] = 0] = "MAIN";
	EditorPages$1[EditorPages$1["REPEAT_RULES"] = 1] = "REPEAT_RULES";
	EditorPages$1[EditorPages$1["GUESTS"] = 2] = "GUESTS";
	return EditorPages$1;
}({});
var CalendarEventEditView = class {
	timeFormat;
	startOfTheWeekOffset;
	defaultAlarms;
	transitionPage = null;
	hasAnimationEnded = true;
	pages = new Map();
	pagesWrapperDomElement;
	allowRenderMainPage = (0, import_stream$1.default)(true);
	dialogHeight = null;
	pageWidth = -1;
	translate = 0;
	constructor(vnode) {
		this.timeFormat = vnode.attrs.timeFormat;
		this.startOfTheWeekOffset = vnode.attrs.startOfTheWeekOffset;
		this.defaultAlarms = vnode.attrs.defaultAlarms;
		if (vnode.attrs.model.operation == CalendarOperation.Create) {
			const initialAlarms = vnode.attrs.defaultAlarms.get(vnode.attrs.model.editModels.whoModel.selectedCalendar.group._id) ?? [];
			vnode.attrs.model.editModels.alarmModel.addAll(initialAlarms);
		}
		this.pages.set(EditorPages.REPEAT_RULES, this.renderRepeatRulesPage);
		this.pages.set(EditorPages.GUESTS, this.renderGuestsPage);
		vnode.attrs.currentPage.map((page) => {
			this.hasAnimationEnded = false;
			if (page === EditorPages.MAIN) {
				this.allowRenderMainPage(true);
				this.translate = 0;
			}
		});
		this.allowRenderMainPage.map((allowRendering) => {
			return this.handleEditorStatus(allowRendering, vnode);
		});
	}
	onremove(vnode) {
		vnode.attrs.currentPage.end(true);
		this.allowRenderMainPage.end(true);
	}
	handleEditorStatus(allowRendering, vnode) {
		if (allowRendering && vnode.attrs.currentPage() === EditorPages.MAIN) {
			if (vnode.attrs.descriptionEditor.editor.domElement) vnode.attrs.descriptionEditor.editor.domElement.tabIndex = Number(TabIndex.Default);
			return vnode.attrs.descriptionEditor.setEnabled(true);
		}
		if (vnode.attrs.descriptionEditor.editor.domElement) vnode.attrs.descriptionEditor.editor.domElement.tabIndex = Number(TabIndex.Programmatic);
		vnode.attrs.descriptionEditor.setEnabled(false);
	}
	oncreate(vnode) {
		this.pagesWrapperDomElement = vnode.dom;
		this.pagesWrapperDomElement.addEventListener("transitionend", () => {
			if (vnode.attrs.currentPage() !== EditorPages.MAIN) {
				setTimeout(() => {
					this.allowRenderMainPage(false);
				}, DefaultAnimationTime);
				mithril_default.redraw();
				return;
			}
			this.transitionPage = vnode.attrs.currentPage();
			this.hasAnimationEnded = true;
			setTimeout(() => {
				this.allowRenderMainPage(true);
				mithril_default.redraw();
			}, DefaultAnimationTime);
		});
	}
	onupdate(vnode) {
		const dom = vnode.dom;
		if (this.dialogHeight == null && dom.parentElement) {
			this.dialogHeight = dom.parentElement.clientHeight;
			vnode.dom.style.height = px(this.dialogHeight);
		}
		if (this.pageWidth == -1 && dom.parentElement) {
			this.pageWidth = dom.parentElement.clientWidth - size.hpad_large * 2;
			vnode.dom.style.width = px(this.pageWidth * 2 + size.vpad_xxl);
			mithril_default.redraw();
		}
	}
	view(vnode) {
		return mithril_default(".flex.gap-vpad-xxl.fit-content.transition-transform", { style: { transform: `translateX(${this.translate}px)` } }, [this.renderMainPage(vnode), this.renderPage(vnode)]);
	}
	renderPage(vnode) {
		if (this.hasAnimationEnded || this.transitionPage == null) return this.pages.get(vnode.attrs.currentPage())?.apply(this, [vnode]);
		return this.pages.get(this.transitionPage)?.apply(this, [vnode]);
	}
	renderGuestsPage({ attrs: { model, recipientsSearch } }) {
		return mithril_default(AttendeeListEditor, {
			recipientsSearch,
			logins: locator.logins,
			model,
			width: this.pageWidth
		});
	}
	renderTitle(attrs) {
		const { model } = attrs;
		return mithril_default(Card, { style: { padding: "0" } }, mithril_default(SingleLineTextField, {
			value: model.editModels.summary.content,
			oninput: (newValue) => {
				model.editModels.summary.content = newValue;
			},
			ariaLabel: lang.get("title_placeholder"),
			placeholder: lang.get("title_placeholder"),
			disabled: !model.isFullyWritable(),
			style: { fontSize: px(size.font_size_base * 1.25) },
			type: TextFieldType.Text
		}));
	}
	renderReadonlyMessage(attrs) {
		const { model } = attrs;
		const makeMessage = (message) => mithril_default(InfoBanner, {
			message: () => mithril_default(".small.selectable", lang.get(message)),
			icon: Icons.People,
			type: BannerType.Info,
			buttons: []
		});
		switch (model.getReadonlyReason()) {
			case ReadonlyReason.SHARED: return makeMessage("cannotEditFullEvent_msg");
			case ReadonlyReason.SINGLE_INSTANCE: return makeMessage("cannotEditSingleInstance_msg");
			case ReadonlyReason.NOT_ORGANIZER: return makeMessage("cannotEditNotOrganizer_msg");
			case ReadonlyReason.UNKNOWN: return makeMessage("cannotEditEvent_msg");
			case ReadonlyReason.NONE: return null;
		}
	}
	renderEventTimeEditor(attrs) {
		const padding = px(size.vpad_small);
		return mithril_default(Card, { style: { padding: `${padding} 0 ${padding} ${padding}` } }, mithril_default(EventTimeEditor, {
			editModel: attrs.model.editModels.whenModel,
			timeFormat: this.timeFormat,
			startOfTheWeekOffset: this.startOfTheWeekOffset,
			disabled: !attrs.model.isFullyWritable()
		}));
	}
	renderRepeatRuleNavButton({ model, navigationCallback }) {
		const repeatRuleText = this.getTranslatedRepeatRule(model.editModels.whenModel.result.repeatRule, model.editModels.whenModel.isAllDay);
		return mithril_default(SectionButton, {
			leftIcon: {
				icon: Icons.Sync,
				title: "calendarRepeating_label"
			},
			text: lang.makeTranslation(repeatRuleText, repeatRuleText),
			isDisabled: !model.canEditSeries(),
			onclick: () => {
				this.transitionTo(EditorPages.REPEAT_RULES, navigationCallback);
			}
		});
	}
	transitionTo(target, navigationCallback) {
		this.hasAnimationEnded = false;
		this.transitionPage = target;
		this.translate = -(this.pageWidth + size.vpad_xxl);
		navigationCallback(target);
	}
	renderGuestsNavButton({ navigationCallback, model }) {
		return mithril_default(SectionButton, {
			leftIcon: {
				icon: Icons.People,
				title: "calendarRepeating_label"
			},
			text: "guests_label",
			injectionRight: model.editModels.whoModel.guests.length > 0 ? mithril_default("span", model.editModels.whoModel.guests.length) : null,
			onclick: () => {
				this.transitionTo(EditorPages.GUESTS, navigationCallback);
			}
		});
	}
	renderCalendarPicker(vnode) {
		const { model, groupColors } = vnode.attrs;
		const availableCalendars = model.editModels.whoModel.getAvailableCalendars();
		const options = availableCalendars.map((calendarInfo) => {
			const name = getSharedGroupName(calendarInfo.groupInfo, model.userController, calendarInfo.shared);
			return {
				name,
				color: "#" + (groupColors.get(calendarInfo.group._id) ?? defaultCalendarColor),
				value: calendarInfo,
				ariaValue: name
			};
		});
		const selectedCalendarInfo = model.editModels.whoModel.selectedCalendar;
		const selectedCalendarName = getSharedGroupName(selectedCalendarInfo.groupInfo, model.userController, selectedCalendarInfo.shared);
		let selected = {
			name: selectedCalendarName,
			color: "#" + (groupColors.get(selectedCalendarInfo.group._id) ?? defaultCalendarColor),
			value: model.editModels.whoModel.selectedCalendar,
			ariaValue: selectedCalendarName
		};
		return mithril_default(Card, { style: { padding: "0" } }, mithril_default(Select, {
			onchange: (val) => {
				model.editModels.alarmModel.removeAll();
				model.editModels.alarmModel.addAll(this.defaultAlarms.get(val.value.group._id) ?? []);
				model.editModels.whoModel.selectedCalendar = val.value;
			},
			options: (0, import_stream$1.default)(options),
			expanded: true,
			selected,
			classes: [
				"button-min-height",
				"pl-vpad-s",
				"pr-vpad-s"
			],
			renderOption: (option) => this.renderCalendarOptions(option, deepEqual(option.value, selected.value), false),
			renderDisplay: (option) => this.renderCalendarOptions(option, false, true),
			ariaLabel: lang.get("calendar_label"),
			disabled: !model.canChangeCalendar() || availableCalendars.length < 2
		}));
	}
	renderCalendarOptions(option, isSelected, isDisplay) {
		return mithril_default(".flex.items-center.gap-vpad-s.flex-grow", { class: `${isDisplay ? "" : "state-bg plr-button button-content dropdown-button pt-s pb-s button-min-height"}` }, [mithril_default("div", { style: {
			width: px(size.hpad_large),
			height: px(size.hpad_large),
			borderRadius: "50%",
			backgroundColor: option.color,
			marginInline: px(size.vpad_xsm / 2)
		} }), mithril_default("span", { style: { color: isSelected ? theme.content_button_selected : undefined } }, option.name)]);
	}
	renderRemindersEditor(vnode) {
		if (!vnode.attrs.model.editModels.alarmModel.canEditReminders) return null;
		const { alarmModel } = vnode.attrs.model.editModels;
		return mithril_default(Card, { classes: [
			"button-min-height",
			"flex",
			"items-center"
		] }, mithril_default(".flex.gap-vpad-s.items-start.flex-grow", [mithril_default(".flex", { class: alarmModel.alarms.length === 0 ? "items-center" : "items-start" }, [mithril_default(Icon, {
			icon: Icons.Clock,
			style: { fill: getColors(ButtonColor.Content).button },
			title: lang.get("reminderBeforeEvent_label"),
			size: IconSize.Medium
		})]), mithril_default(RemindersEditor, {
			alarms: alarmModel.alarms,
			addAlarm: alarmModel.addAlarm.bind(alarmModel),
			removeAlarm: alarmModel.removeAlarm.bind(alarmModel),
			label: "reminderBeforeEvent_label",
			useNewEditor: true
		})]));
	}
	renderLocationField(vnode) {
		const { model } = vnode.attrs;
		return mithril_default(Card, { style: { padding: "0" } }, mithril_default(".flex.gap-vpad-s.items-center", mithril_default(SingleLineTextField, {
			value: model.editModels.location.content,
			oninput: (newValue) => {
				model.editModels.location.content = newValue;
			},
			classes: ["button-min-height"],
			ariaLabel: lang.get("location_label"),
			placeholder: lang.get("location_label"),
			disabled: !model.isFullyWritable(),
			leadingIcon: {
				icon: Icons.Pin,
				color: getColors(ButtonColor.Content).button
			},
			type: TextFieldType.Text
		})));
	}
	renderDescriptionEditor(vnode) {
		return mithril_default(Card, {
			classes: ["child-text-editor", "rel"],
			style: { padding: "0" }
		}, [vnode.attrs.descriptionEditor.isEmpty() && !vnode.attrs.descriptionEditor.isActive() ? mithril_default("span.text-editor-placeholder", lang.get("description_label")) : null, mithril_default(vnode.attrs.descriptionEditor)]);
	}
	renderMainPage(vnode) {
		return mithril_default(".pb.pt.flex.col.gap-vpad.fit-height.box-content", { style: {
			transform: "translate(0)",
			color: theme.button_bubble_fg,
			"pointer-events": `${this.allowRenderMainPage() ? "auto" : "none"}`,
			width: px(this.pageWidth)
		} }, [this.allowRenderMainPage() ? mithril_default.fragment({}, [
			this.renderReadonlyMessage(vnode.attrs),
			this.renderTitle(vnode.attrs),
			this.renderEventTimeEditor(vnode.attrs),
			this.renderCalendarPicker(vnode),
			this.renderRepeatRuleNavButton(vnode.attrs),
			this.renderRemindersEditor(vnode),
			this.renderGuestsNavButton(vnode.attrs),
			this.renderLocationField(vnode)
		]) : null, this.renderDescriptionEditor(vnode)]);
	}
	renderRepeatRulesPage({ attrs: { model, navigationCallback } }) {
		const { whenModel } = model.editModels;
		return mithril_default(RepeatRuleEditor, {
			model: whenModel,
			startOfTheWeekOffset: this.startOfTheWeekOffset,
			width: this.pageWidth,
			backAction: () => navigationCallback(EditorPages.MAIN)
		});
	}
	getTranslatedRepeatRule(rule, isAllDay) {
		if (rule == null) return lang.get("calendarRepeatIntervalNoRepeat_label");
		const frequency = formatRepetitionFrequency(rule);
		return frequency ? frequency + formatRepetitionEnd(rule, isAllDay) : lang.get("unknownRepetition_msg");
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-view/CalendarEventEditDialog.ts
var import_stream = __toESM(require_stream(), 1);
var ConfirmationResult = function(ConfirmationResult$1) {
	ConfirmationResult$1[ConfirmationResult$1["Cancel"] = 0] = "Cancel";
	ConfirmationResult$1[ConfirmationResult$1["Continue"] = 1] = "Continue";
	return ConfirmationResult$1;
}(ConfirmationResult || {});
var EventEditorDialog = class {
	currentPage = (0, import_stream.default)(EditorPages.MAIN);
	dialog = null;
	headerDom = null;
	constructor() {}
	left() {
		if (this.currentPage() === EditorPages.MAIN) return [{
			label: "cancel_action",
			click: () => this.dialog?.close(),
			type: ButtonType.Secondary
		}];
		return [{
			label: "back_action",
			click: () => this.currentPage(EditorPages.MAIN),
			type: ButtonType.Secondary
		}];
	}
	right(okAction) {
		if (this.currentPage() === EditorPages.MAIN) return [{
			label: "save_action",
			click: (event, dom) => okAction(dom),
			type: ButtonType.Primary
		}];
		return [];
	}
	/**
	* the generic way to open any calendar edit dialog. the caller should know what to do after the
	* dialog is closed.
	*/
	async showCalendarEventEditDialog(model, responseMail, handler) {
		const recipientsSearch = await locator.recipientsSearchModel();
		const { HtmlEditor } = await import("./HtmlEditor2-chunk.js");
		const groupSettings = locator.logins.getUserController().userSettingsGroupRoot.groupSettings;
		const groupColors = groupSettings.reduce((acc, gc) => {
			acc.set(gc.group, gc.color);
			return acc;
		}, new Map());
		const defaultAlarms = groupSettings.reduce((acc, gc) => {
			acc.set(gc.group, gc.defaultAlarmsList.map((alarm) => parseAlarmInterval(alarm.trigger)));
			return acc;
		}, new Map());
		const descriptionText = convertTextToHtml(model.editModels.description.content);
		const descriptionEditor = new HtmlEditor().setShowOutline(true).setMinHeight(200).setEnabled(true).setValue(descriptionText);
		const okAction = (dom) => {
			model.editModels.description.content = descriptionEditor.getTrimmedValue();
			handler(dom.getBoundingClientRect(), () => dialog.close());
		};
		const summary = model.editModels.summary.content;
		const heading = summary.trim().length > 0 ? lang.makeTranslation("summary", summary) : "createEvent_label";
		const navigationCallback = (targetPage) => {
			this.currentPage(targetPage);
		};
		const dialog = Dialog.editMediumDialog({
			left: this.left.bind(this),
			middle: heading,
			right: this.right.bind(this, okAction),
			create: (dom) => {
				this.headerDom = dom;
			}
		}, CalendarEventEditView, {
			model,
			recipientsSearch,
			descriptionEditor,
			startOfTheWeekOffset: getStartOfTheWeekOffsetForUser(locator.logins.getUserController().userSettingsGroupRoot),
			timeFormat: getTimeFormatForUser(locator.logins.getUserController().userSettingsGroupRoot),
			groupColors,
			defaultAlarms,
			navigationCallback,
			currentPage: this.currentPage
		}, {
			height: "100%",
			"background-color": theme.navigation_bg
		}).addShortcut({
			key: Keys.ESC,
			exec: () => dialog.close(),
			help: "close_alt"
		}).addShortcut({
			key: Keys.S,
			ctrlOrCmd: true,
			exec: () => okAction(assertNotNull(this.headerDom, "headerDom was null")),
			help: "save_action"
		});
		if (client.isMobileDevice()) dialog.setFocusOnLoadFunction(noOp);
		this.dialog = dialog;
		dialog.show();
	}
	/**
	* show an edit dialog for an event that does not exist on the server yet (or anywhere else)
	*
	* will unconditionally send invites on save.
	* @param model the calendar event model used to edit and save the event
	*/
	async showNewCalendarEventEditDialog(model) {
		let finished = false;
		const okAction = async (posRect, finish) => {
			/** new event, so we always want to send invites. */
			model.editModels.whoModel.shouldSendUpdates = true;
			if (finished) return;
			try {
				const result = await model.apply();
				if (result === EventSaveResult.Saved) {
					finished = true;
					finish();
					await handleRatingByEvent();
				}
			} catch (e) {
				if (e instanceof UserError) showUserError(e);
else if (e instanceof UpgradeRequiredError) await showPlanUpgradeRequiredDialog(e.plans);
else throw e;
			}
		};
		return this.showCalendarEventEditDialog(model, null, okAction);
	}
	/**
	* show a dialog that allows to edit a calendar event that already exists.
	*
	* on save, will validate external passwords, account type and user intent before actually saving and sending updates/invites/cancellations.
	*
	* @param model the calendar event model used to edit & save the event
	* @param identity the identity of the event to edit
	* @param responseMail a mail containing an invite and/or update for this event in case we need to reply to the organizer
	*/
	async showExistingCalendarEventEditDialog(model, identity, responseMail = null) {
		let finished = false;
		if (identity.uid == null) throw new ProgrammingError("tried to edit existing event without uid, this is impossible for certain edit operations.");
		const okAction = async (posRect, finish) => {
			if (finished || await this.askUserIfUpdatesAreNeededOrCancel(model) === ConfirmationResult.Cancel) return;
			try {
				const result = await model.apply();
				if (result === EventSaveResult.Saved || result === EventSaveResult.NotFound) {
					finished = true;
					finish();
					if (result === EventSaveResult.NotFound) Dialog.message("eventNoLongerExists_msg");
				}
			} catch (e) {
				if (e instanceof UserError) showUserError(e);
else if (e instanceof UpgradeRequiredError) await showPlanUpgradeRequiredDialog(e.plans);
else throw e;
			}
		};
		await this.showCalendarEventEditDialog(model, responseMail, okAction);
	}
	/** if there are update worthy changes on the model, ask the user what to do with them.
	* @returns {ConfirmationResult} Cancel if the whole process should be cancelled, Continue if the user selected whether to send updates and the saving
	* should proceed.
	* */
	async askUserIfUpdatesAreNeededOrCancel(model) {
		if (model.isAskingForUpdatesNeeded()) switch (await askIfShouldSendCalendarUpdatesToAttendees()) {
			case "yes":
				model.editModels.whoModel.shouldSendUpdates = true;
				break;
			case "no": break;
			case "cancel":
				console.log("not saving event: user cancelled update sending.");
				return ConfirmationResult.Cancel;
		}
		return ConfirmationResult.Continue;
	}
};

//#endregion
export { EventEditorDialog, RemindersEditor };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FsZW5kYXJFdmVudEVkaXREaWFsb2ctY2h1bmsuanMiLCJuYW1lcyI6WyJldmVudDogTW91c2VFdmVudCIsImNsYXNzZXM6IEFycmF5PHN0cmluZz4iLCJkaXNhYmxlZDogYm9vbGVhbiIsImV4cGFuZGVkOiBib29sZWFuIiwicGxhY2Vob2xkZXI/OiBDaGlsZHJlbiIsIm9wdGlvbnM6IFN0cmVhbTxBcnJheTxVPj4iLCJkb206IEhUTUxFbGVtZW50Iiwib25TZWxlY3Q6IChvcHRpb246IFUpID0+IHZvaWQiLCJyZW5kZXJPcHRpb25zOiAob3B0aW9uOiBVKSA9PiBDaGlsZHJlbiIsImtlZXBGb2N1czogYm9vbGVhbiIsInNlbGVjdGVkPzogVCIsIm9uQ2xvc2U/OiAoKSA9PiB2b2lkIiwiZHJvcGRvd25Qb3NpdGlvbj86IFwidG9wXCIgfCBcImJvdHRvbVwiIiwib3B0aW9uTGlzdENvbnRhaW5lcjogT3B0aW9uTGlzdENvbnRhaW5lciIsIm9wdGlvbjogVSIsImRvbSIsInNlbGVjdGVkOiBUIHwgdW5kZWZpbmVkIiwiZTogS2V5Ym9hcmRFdmVudCIsImNhbGxiYWNrOiAob3B0aW9uOiBVKSA9PiB2b2lkIiwiY29udGFpbmVyOiBPcHRpb25MaXN0Q29udGFpbmVyIiwiaXRlbXM6IFN0cmVhbTxBcnJheTx1bmtub3duPj4iLCJidWlsZEZ1bmN0aW9uOiAob3B0aW9uOiB1bmtub3duKSA9PiBDaGlsZHJlbiIsIndpZHRoOiBudW1iZXIiLCJ2bm9kZTogVm5vZGVET008SFRNTEVsZW1lbnQ+IiwiY2hpbGRyZW4iLCJldjogRXZlbnRSZWRyYXc8RXZlbnQ+IiwiZTogTW91c2VFdmVudCIsIm9yaWdpbjogUG9zUmVjdCIsImU6IEV2ZW50Iiwibm9kZTogVm5vZGVET008U2VsZWN0QXR0cmlidXRlczxHdWVzdEl0ZW0sIFJlY2lwaWVudFNlYXJjaFJlc3VsdEl0ZW0+PiIsInNlbGVjdGVkOiBib29sZWFuIiwib3B0aW9uOiBHdWVzdEl0ZW0iLCJhdHRyczogR3Vlc3RQaWNrZXJBdHRycyIsImd1ZXN0OiBSZWNpcGllbnRTZWFyY2hSZXN1bHRJdGVtIiwiZTogTW91c2VFdmVudCIsInZhbDogc3RyaW5nIiwiZXZlbnQ6IEZvY3VzRXZlbnQiLCJlOiBhbnkiLCJldmVudDogS2V5Ym9hcmRFdmVudCIsImZvcndhcmQ6IGJvb2xlYW4iLCJzZWxlY3RTdWdnZXN0aW9uOiBib29sZWFuIiwidm5vZGU6IFZub2RlPFBhc3N3b3JkSW5wdXRBdHRyaWJ1dGVzLCB0aGlzPiIsImF0dHJzOiBBdHRlbmRlZUxpc3RFZGl0b3JBdHRycyIsIm9yZ2FuaXplcjogR3Vlc3QgfCBudWxsIiwiZ3Vlc3RJdGVtczogKCgpID0+IENoaWxkcmVuKVtdIiwicGFzc3dvcmQ6IHN0cmluZyIsInN0cmVuZ3RoOiBudW1iZXIiLCJ3aG9Nb2RlbDogQ2FsZW5kYXJFdmVudFdob01vZGVsIiwibG9naW5zOiBMb2dpbkNvbnRyb2xsZXIiLCJyZWNpcGllbnRzU2VhcmNoOiBSZWNpcGllbnRzU2VhcmNoTW9kZWwiLCJtb2RlbDogQ2FsZW5kYXJFdmVudFdob01vZGVsIiwibW9kZWw6IENhbGVuZGFyRXZlbnRNb2RlbCIsIm9yZ2FuaXplciIsImd1ZXN0OiBHdWVzdCIsInBhc3N3b3JkPzogc3RyaW5nIiwic3RyZW5ndGg/OiBudW1iZXIiLCJyaWdodENvbnRlbnQ6IENoaWxkcmVuIiwiYWRkcmVzczogc3RyaW5nIiwic3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzIiwidGltZXM6IHN0cmluZ1tdIiwiYXR0cnM6IFRpbWVQaWNrZXJBdHRycyIsImV2ZW50OiBJbnB1dEV2ZW50Iiwib3B0aW9uOiBUaW1lT3B0aW9uIiwidmFsOiBzdHJpbmciLCJlOiBNb3VzZUV2ZW50IiwiZXZlbnQ6IEZvY3VzRXZlbnQiLCJlOiBhbnkiLCJ2bm9kZTogVm5vZGU8RXZlbnRUaW1lRWRpdG9yQXR0cnM+Iiwidm5vZGU6IFZub2RlPFJlbWluZGVyc0VkaXRvckF0dHJzPiIsIm5ld0FsYXJtOiBBbGFybUludGVydmFsIiwiYWxhcm1zOiByZWFkb25seSBBbGFybUludGVydmFsW10iLCJyZW1vdmVBbGFybTogKGFsYXJtOiBBbGFybUludGVydmFsKSA9PiB1bmtub3duIiwiYWRkTmV3QWxhcm06IChuZXdBbGFybTogQWxhcm1JbnRlcnZhbCkgPT4gdm9pZCIsInRleHRGaWVsZEF0dHJzOiBBcnJheTxUZXh0RmllbGRBdHRycz4iLCJhZGRBbGFybTogKGFsYXJtOiBBbGFybUludGVydmFsKSA9PiB1bmtub3duIiwib3B0aW9uOiBSZW1pbmRlcnNTZWxlY3RPcHRpb24iLCJoYXNBbGFybXM6IGJvb2xlYW4iLCJpc0Rpc3BsYXk6IGJvb2xlYW4iLCJvbkFkZEFjdGlvbjogKHZhbHVlOiBudW1iZXIsIHVuaXQ6IEFsYXJtSW50ZXJ2YWxVbml0KSA9PiB2b2lkIiwidGltZVJlbWluZGVyVW5pdDogQWxhcm1JbnRlcnZhbFVuaXQiLCJzZWxlY3RlZFZhbHVlOiBBbGFybUludGVydmFsVW5pdCIsImRpYWxvZzogRGlhbG9nIiwiZ3JvdXBOYW1lOiBNYXliZVRyYW5zbGF0aW9uIiwib3B0aW9uOiBSYWRpb0dyb3VwT3B0aW9uPFQ+Iiwic2VsZWN0ZWRPcHRpb246IFQgfCBudWxsIiwib3B0aW9uQ2xhc3M6IHN0cmluZyB8IHVuZGVmaW5lZCIsIm9uT3B0aW9uU2VsZWN0ZWQ6IChhcmcwOiBUKSA9PiB1bmtub3duIiwiaW5qZWN0aW9uTWFwPzogTWFwPHN0cmluZywgQ2hpbGQ+IiwiZXZlbnQ6IEtleWJvYXJkRXZlbnQiLCJrZXk6IHN0cmluZyIsInBlcmlvZDogUmVwZWF0UGVyaW9kIiwiaW50ZXJ2YWw6IG51bWJlciIsImVuZFRpbWU6IEVuZFR5cGUiLCJvcHRpb246IFJlcGVhdFJ1bGVPcHRpb24iLCJhdHRyczogUmVwZWF0UnVsZUVkaXRvckF0dHJzIiwib3B0aW9uOiBFbmRUeXBlIiwiY3VzdG9tUnVsZU9wdGlvbnM6IFJhZGlvR3JvdXBPcHRpb248UmVwZWF0UGVyaW9kPltdIiwib3B0aW9uOiBSZXBlYXRQZXJpb2QiLCJ3aGVuTW9kZWw6IENhbGVuZGFyRXZlbnRXaGVuTW9kZWwiLCJjdXN0b21SdWxlOiBQYXJ0aWFsPHsgaW50ZXJ2YWw6IG51bWJlcjsgaW50ZXJ2YWxGcmVxdWVuY3k6IFJlcGVhdFBlcmlvZCB9PiIsInZhbDogc3RyaW5nIiwiZTogTW91c2VFdmVudCIsImV2ZW50OiBGb2N1c0V2ZW50Iiwidm5vZGU6IFZub2RlPENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzPiIsImFsbG93UmVuZGVyaW5nOiBib29sZWFuIiwidm5vZGU6IFZub2RlRE9NPENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzPiIsImF0dHJzOiBDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycyIsIm5ld1ZhbHVlOiBhbnkiLCJtZXNzYWdlOiBUcmFuc2xhdGlvbktleSIsInRhcmdldDogRWRpdG9yUGFnZXMiLCJuYXZpZ2F0aW9uQ2FsbGJhY2s6ICh0YXJnZXRQYWdlOiBFZGl0b3JQYWdlcykgPT4gdW5rbm93biIsIm9wdGlvbnM6IENhbGVuZGFyU2VsZWN0SXRlbVtdIiwic2VsZWN0ZWQ6IENhbGVuZGFyU2VsZWN0SXRlbSIsIm9wdGlvbjogQ2FsZW5kYXJTZWxlY3RJdGVtIiwiaXNTZWxlY3RlZDogYm9vbGVhbiIsImlzRGlzcGxheTogYm9vbGVhbiIsIm5ld1ZhbHVlOiBzdHJpbmciLCJydWxlOiBDYWxlbmRhclJlcGVhdFJ1bGUgfCBudWxsIiwiaXNBbGxEYXk6IGJvb2xlYW4iLCJva0FjdGlvbjogKGRvbTogSFRNTEVsZW1lbnQpID0+IHVua25vd24iLCJldmVudDogTW91c2VFdmVudCIsImRvbTogSFRNTEVsZW1lbnQiLCJtb2RlbDogQ2FsZW5kYXJFdmVudE1vZGVsIiwicmVzcG9uc2VNYWlsOiBNYWlsIHwgbnVsbCIsImhhbmRsZXI6IEVkaXREaWFsb2dPa0hhbmRsZXIiLCJncm91cENvbG9yczogTWFwPElkLCBzdHJpbmc+IiwiZGVmYXVsdEFsYXJtczogTWFwPElkLCBBbGFybUludGVydmFsW10+IiwiZGVzY3JpcHRpb25FZGl0b3I6IEh0bWxFZGl0b3IiLCJ0YXJnZXRQYWdlOiBFZGl0b3JQYWdlcyIsImRpYWxvZzogRGlhbG9nIiwib2tBY3Rpb246IEVkaXREaWFsb2dPa0hhbmRsZXIiLCJpZGVudGl0eTogQ2FsZW5kYXJFdmVudElkZW50aXR5Il0sInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1vbi9ndWkvYmFzZS9TZWxlY3QudHMiLCIuLi9zcmMvY2FsZW5kYXItYXBwL2NhbGVuZGFyL2d1aS9waWNrZXJzL0d1ZXN0UGlja2VyLnRzIiwiLi4vc3JjL2NvbW1vbi9ndWkvUGFzc3dvcmRJbnB1dC50cyIsIi4uL3NyYy9jb21tb24vZ3VpL0RpdmlkZXIudHMiLCIuLi9zcmMvY2FsZW5kYXItYXBwL2NhbGVuZGFyL2d1aS9ldmVudGVkaXRvci12aWV3L0F0dGVuZGVlTGlzdEVkaXRvci50cyIsIi4uL3NyYy9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL3BpY2tlcnMvVGltZVBpY2tlci50cyIsIi4uL3NyYy9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL2V2ZW50ZWRpdG9yLXZpZXcvRXZlbnRUaW1lRWRpdG9yLnRzIiwiLi4vc3JjL2NhbGVuZGFyLWFwcC9jYWxlbmRhci9ndWkvUmVtaW5kZXJzRWRpdG9yLnRzIiwiLi4vc3JjL2NvbW1vbi9ndWkvYmFzZS9SYWRpb0dyb3VwLnRzIiwiLi4vc3JjL2NhbGVuZGFyLWFwcC9jYWxlbmRhci9ndWkvZXZlbnRlZGl0b3Itdmlldy9SZXBlYXRSdWxlRWRpdG9yLnRzIiwiLi4vc3JjL2NhbGVuZGFyLWFwcC9jYWxlbmRhci9ndWkvZXZlbnRlZGl0b3Itdmlldy9DYWxlbmRhckV2ZW50RWRpdFZpZXcudHMiLCIuLi9zcmMvY2FsZW5kYXItYXBwL2NhbGVuZGFyL2d1aS9ldmVudGVkaXRvci12aWV3L0NhbGVuZGFyRXZlbnRFZGl0RGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtLCB7IENoaWxkcmVuLCBDbGFzc0NvbXBvbmVudCwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgbW9kYWwsIE1vZGFsQ29tcG9uZW50IH0gZnJvbSBcIi4vTW9kYWwuanNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgcHgsIHNpemUgfSBmcm9tIFwiLi4vc2l6ZS5qc1wiXG5pbXBvcnQgeyBLZXlzLCBUYWJJbmRleCB9IGZyb20gXCIuLi8uLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGZvY3VzTmV4dCwgZm9jdXNQcmV2aW91cywgaXNLZXlQcmVzc2VkLCBTaG9ydGN1dCB9IGZyb20gXCIuLi8uLi9taXNjL0tleU1hbmFnZXIuanNcIlxuaW1wb3J0IHsgdHlwZSBQb3NSZWN0LCBzaG93RHJvcGRvd24gfSBmcm9tIFwiLi9Ecm9wZG93bi5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgSWNvbiwgSWNvblNpemUgfSBmcm9tIFwiLi9JY29uLmpzXCJcbmltcG9ydCB7IEJ1dHRvbkNvbG9yLCBnZXRDb2xvcnMgfSBmcm9tIFwiLi9CdXR0b24uanNcIlxuaW1wb3J0IHsgQXJpYVJvbGUgfSBmcm9tIFwiLi4vQXJpYVV0aWxzLmpzXCJcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCB7IGdldFNhZmVBcmVhSW5zZXRCb3R0b20sIGdldFNhZmVBcmVhSW5zZXRUb3AgfSBmcm9tIFwiLi4vSHRtbFV0aWxzLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uL3RoZW1lLmpzXCJcbmltcG9ydCB7IEJvb3RJY29ucyB9IGZyb20gXCIuL2ljb25zL0Jvb3RJY29ucy5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0T3B0aW9uPFQ+IHtcblx0Ly8gSGVyZSB3ZSBkZWNsYXJlIGV2ZXJ5dGhpbmcgdGhhdCBpcyBpbXBvcnRhbnQgdG8gdXNlIGF0IHRoZSBzZWxlY3Qgb3B0aW9uXG5cdHZhbHVlOiBUXG5cdGFyaWFWYWx1ZTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0QXR0cmlidXRlczxVIGV4dGVuZHMgU2VsZWN0T3B0aW9uPFQ+LCBUPiB7XG5cdG9uY2hhbmdlOiAobmV3VmFsdWU6IFUpID0+IHZvaWRcblx0b3B0aW9uczogU3RyZWFtPEFycmF5PFU+PlxuXHQvKipcblx0ICogVGhpcyBhdHRyaWJ1dGUgaXMgcmVzcG9uc2libGUgdG8gcmVuZGVyIHRoZSBvcHRpb25zIGluc2lkZSB0aGUgZHJvcGRvd24uXG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IHJlbmRlck9wdGlvbiA9IChvcHRpb246IFUpID0+IG0oXCJzcGFuXCIsIG9wdGlvbi50ZXh0KTtcblx0ICogLi4uXG5cdCAqIHJlbmRlck9wdGlvbihjdXJyZW50T3B0aW9uKVxuXHQgKiAuLi5cblx0ICogQHBhcmFtIHtVfSBvcHRpb24gLSBPcHRpb24gdG8gYmUgcmVuZGVyZWRcblx0ICogQHJldHVybnMge0NoaWxkcmVufSBSZXR1cm5zIHRoZSByZW5kZXJlZCBvcHRpb25cblx0ICovXG5cdHJlbmRlck9wdGlvbjogKG9wdGlvbjogVSkgPT4gQ2hpbGRyZW5cblx0LyoqXG5cdCAqIFRoaXMgYXR0cmlidXRlIGlzIHJlc3BvbnNpYmxlIHRvIHJlbmRlciB0aGUgc2VsZWN0ZWQgb3B0aW9uIGluc2lkZSB0aGUgdHJpZ2dlci5cblx0ICogQGV4YW1wbGVcblx0ICogY29uc3QgcmVuZGVyU2VsZWN0ZWQgPSAob3B0aW9uOiBVKSA9PiBtKFwic3BhblwiLCBvcHRpb24udGV4dCk7XG5cdCAqIC4uLlxuXHQgKiByZW5kZXJTZWxlY3RlZChjdXJyZW50T3B0aW9uKVxuXHQgKiAuLi5cblx0ICogQHBhcmFtIHtVfSBvcHRpb24gLSBPcHRpb24gdG8gYmUgcmVuZGVyZWRcblx0ICogQHJldHVybnMge0NoaWxkcmVufSBSZXR1cm5zIHRoZSByZW5kZXJlZCBvcHRpb25cblx0ICovXG5cdHJlbmRlckRpc3BsYXk6IChvcHRpb246IFUpID0+IENoaWxkcmVuXG5cdGFyaWFMYWJlbDogc3RyaW5nXG5cdGlkPzogc3RyaW5nXG5cdGNsYXNzZXM/OiBBcnJheTxzdHJpbmc+XG5cdHNlbGVjdGVkPzogVVxuXHRwbGFjZWhvbGRlcj86IENoaWxkcmVuXG5cdGV4cGFuZGVkPzogYm9vbGVhblxuXHRkaXNhYmxlZD86IGJvb2xlYW5cblx0bm9JY29uPzogYm9vbGVhblxuXHQvKipcblx0ICogQGV4YW1wbGVcblx0ICogY29uc3QgYXR0cnMgPSB7XG5cdCAqICAgICAuLi5cblx0ICogICAgIGljb25Db2xvcjogXCIjMjAyMDIwXCJcblx0ICogICAgIC4uLlxuXHQgKiB9XG5cdCAqL1xuXHRpY29uQ29sb3I/OiBzdHJpbmdcblx0a2VlcEZvY3VzPzogYm9vbGVhblxuXHR0YWJJbmRleD86IG51bWJlclxuXHRvbmNsb3NlPzogKCkgPT4gdm9pZFxuXHRvbmNyZWF0ZT86ICguLi5hcmdzOiBhbnlbXSkgPT4gdW5rbm93blxuXHRkcm9wZG93blBvc2l0aW9uPzogXCJ0b3BcIiB8IFwiYm90dG9tXCJcbn1cblxudHlwZSBIVE1MRWxlbWVudFdpdGhBdHRycyA9IFBhcnRpYWw8UGljazxtLkF0dHJpYnV0ZXMsIFwiY2xhc3NcIj4gJiBPbWl0PEhUTUxCdXR0b25FbGVtZW50LCBcInN0eWxlXCI+ICYgU2VsZWN0QXR0cmlidXRlczxTZWxlY3RPcHRpb248dW5rbm93bj4sIHVua25vd24+PlxuXG5leHBvcnQgaW50ZXJmYWNlIFNlbGVjdFN0YXRlIHtcblx0ZHJvcGRvd25Db250YWluZXI/OiBPcHRpb25MaXN0Q29udGFpbmVyXG59XG5cbi8qKlxuICogU2VsZWN0IGNvbXBvbmVudFxuICogQHNlZSBDb21wb25lbnQgYXR0cmlidXRlczoge1NlbGVjdEF0dHJpYnV0ZXN9XG4gKiBAZXhhbXBsZVxuICpcbiAqIGludGVyZmFjZSBDYWxlbmRhclNlbGVjdEl0ZW0gZXh0ZW5kcyBTZWxlY3RPcHRpb248c3RyaW5nPiB7XG4gKiAgIGNvbG9yOiBzdHJpbmdcbiAqIFx0IG5hbWU6IHN0cmluZ1xuICogfVxuICpcbiAqIG0oU2VsZWN0PENhbGVuZGFyU2VsZWN0SXRlbSwgc3RyaW5nPiwge1xuICogICBjbGFzc2VzOiBbXCJjdXN0b20tbWFyZ2luc1wiXSxcbiAqICAgb25DaGFuZ2U6ICh2YWwpID0+IHtcbiAqIFx0ICAgdGhpcy5zZWxlY3RlZCA9IHZhbFxuICogICB9LFxuICogXHQgb3B0aW9uczogdGhpcy5vcHRpb25zLFxuICogXHQgZXhwYW5kZWQ6IHRydWUsXG4gKiBcdCBzZWxlY3RlZDogdGhpcy5zZWxlY3RlZCxcbiAqIFx0IHJlbmRlck9wdGlvbjogKG9wdGlvbikgPT4ge1xuICogXHQgICByZXR1cm4gbShcIi5mbGV4Lml0ZW1zLWNlbnRlci5nYXAtdnBhZC14c1wiLCBbXG4gKiBcdCAgICAgbShcImRpdlwiLCB7IHN0eWxlOiB7IHdpZHRoOiBcIjI0cHhcIiwgaGVpZ2h0OiBcIjI0cHhcIiwgYm9yZGVyUmFkaXVzOiBcIjUwJVwiLCBiYWNrZ3JvdW5kQ29sb3I6IG9wdGlvbi5jb2xvciB9IH0pLFxuICogICAgICAgbShcInNwYW5cIiwgb3B0aW9uLm5hbWUpLFxuICogXHQgICBdKVxuICogXHQgfSxcbiAqIFx0IHJlbmRlckRpc3BsYXk6IChvcHRpb24pID0+IG0oXCJzcGFuXCIsIHsgc3R5bGU6IHsgY29sb3I6IFwicmVkXCIgfSB9LCBvcHRpb24ubmFtZSksXG4gKiBcdCBhcmlhTGFiZWw6IFwiQ2FsZW5kYXJcIlxuICogfSksXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWxlY3Q8VSBleHRlbmRzIFNlbGVjdE9wdGlvbjxUPiwgVD4gaW1wbGVtZW50cyBDbGFzc0NvbXBvbmVudDxTZWxlY3RBdHRyaWJ1dGVzPFUsIFQ+PiB7XG5cdHByaXZhdGUgaXNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlXG5cdHByaXZhdGUgZHJvcGRvd25Db250YWluZXI/OiBPcHRpb25MaXN0Q29udGFpbmVyXG5cdHByaXZhdGUga2V5OiBudW1iZXIgPSAwXG5cblx0dmlldyh7XG5cdFx0YXR0cnM6IHtcblx0XHRcdG9uY2hhbmdlLFxuXHRcdFx0b3B0aW9ucyxcblx0XHRcdHJlbmRlck9wdGlvbixcblx0XHRcdHJlbmRlckRpc3BsYXksXG5cdFx0XHRjbGFzc2VzLFxuXHRcdFx0c2VsZWN0ZWQsXG5cdFx0XHRwbGFjZWhvbGRlcixcblx0XHRcdGV4cGFuZGVkLFxuXHRcdFx0ZGlzYWJsZWQsXG5cdFx0XHRhcmlhTGFiZWwsXG5cdFx0XHRpY29uQ29sb3IsXG5cdFx0XHRpZCxcblx0XHRcdG5vSWNvbixcblx0XHRcdGtlZXBGb2N1cyxcblx0XHRcdHRhYkluZGV4LFxuXHRcdFx0b25jbG9zZSxcblx0XHRcdGRyb3Bkb3duUG9zaXRpb24sXG5cdFx0fSxcblx0fTogVm5vZGU8U2VsZWN0QXR0cmlidXRlczxVLCBUPiwgdGhpcz4pIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiYnV0dG9uLnR1dGF1aS1zZWxlY3QtdHJpZ2dlci5jbGlja2FibGVcIixcblx0XHRcdHtcblx0XHRcdFx0aWQsXG5cdFx0XHRcdGNsYXNzOiB0aGlzLnJlc29sdmVDbGFzc2VzKGNsYXNzZXMsIGRpc2FibGVkLCBleHBhbmRlZCksXG5cdFx0XHRcdG9uY2xpY2s6IChldmVudDogTW91c2VFdmVudCkgPT5cblx0XHRcdFx0XHRldmVudC5jdXJyZW50VGFyZ2V0ICYmXG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJEcm9wZG93bihcblx0XHRcdFx0XHRcdG9wdGlvbnMsXG5cdFx0XHRcdFx0XHRldmVudC5jdXJyZW50VGFyZ2V0IGFzIEhUTUxFbGVtZW50LFxuXHRcdFx0XHRcdFx0b25jaGFuZ2UsXG5cdFx0XHRcdFx0XHRyZW5kZXJPcHRpb24sXG5cdFx0XHRcdFx0XHRrZWVwRm9jdXMgPz8gZmFsc2UsXG5cdFx0XHRcdFx0XHRzZWxlY3RlZD8udmFsdWUsXG5cdFx0XHRcdFx0XHRvbmNsb3NlLFxuXHRcdFx0XHRcdFx0ZHJvcGRvd25Qb3NpdGlvbixcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRyb2xlOiBBcmlhUm9sZS5Db21ib2JveCxcblx0XHRcdFx0YXJpYUxhYmVsLFxuXHRcdFx0XHRkaXNhYmxlZDogZGlzYWJsZWQsXG5cdFx0XHRcdGFyaWFFeHBhbmRlZDogU3RyaW5nKHRoaXMuaXNFeHBhbmRlZCksXG5cdFx0XHRcdHRhYkluZGV4OiB0YWJJbmRleCA/PyBOdW1iZXIoZGlzYWJsZWQgPyBUYWJJbmRleC5Qcm9ncmFtbWF0aWMgOiBUYWJJbmRleC5EZWZhdWx0KSxcblx0XHRcdFx0dmFsdWU6IHNlbGVjdGVkPy5hcmlhVmFsdWUsXG5cdFx0XHR9IHNhdGlzZmllcyBIVE1MRWxlbWVudFdpdGhBdHRycyxcblx0XHRcdFtcblx0XHRcdFx0c2VsZWN0ZWQgIT0gbnVsbCA/IHJlbmRlckRpc3BsYXkoc2VsZWN0ZWQpIDogdGhpcy5yZW5kZXJQbGFjZWhvbGRlcihwbGFjZWhvbGRlciksXG5cdFx0XHRcdG5vSWNvbiAhPT0gdHJ1ZVxuXHRcdFx0XHRcdD8gbShJY29uLCB7XG5cdFx0XHRcdFx0XHRcdGljb246IEJvb3RJY29ucy5FeHBhbmQsXG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lcjogXCJkaXZcIixcblx0XHRcdFx0XHRcdFx0Y2xhc3M6IGBmaXQtY29udGVudCB0cmFuc2l0aW9uLXRyYW5zZm9ybWAsXG5cdFx0XHRcdFx0XHRcdHNpemU6IEljb25TaXplLk1lZGl1bSxcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsOiBpY29uQ29sb3IgPz8gZ2V0Q29sb3JzKEJ1dHRvbkNvbG9yLkNvbnRlbnQpLmJ1dHRvbixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlc29sdmVDbGFzc2VzKGNsYXNzZXM6IEFycmF5PHN0cmluZz4gPSBbXSwgZGlzYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZSwgZXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRcdGNvbnN0IGNsYXNzTGlzdCA9IFsuLi5jbGFzc2VzXVxuXHRcdGlmIChkaXNhYmxlZCkge1xuXHRcdFx0Y2xhc3NMaXN0LnB1c2goXCJkaXNhYmxlZFwiLCBcImNsaWNrLWRpc2FibGVkXCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNsYXNzTGlzdC5wdXNoKFwiZmxhc2hcIilcblx0XHR9XG5cblx0XHRpZiAoZXhwYW5kZWQpIHtcblx0XHRcdGNsYXNzTGlzdC5wdXNoKFwiZnVsbC13aWR0aFwiKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjbGFzc0xpc3QucHVzaChcImZpdC1jb250ZW50XCIpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzTGlzdC5qb2luKFwiIFwiKVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJQbGFjZWhvbGRlcihwbGFjZWhvbGRlcj86IENoaWxkcmVuKTogQ2hpbGRyZW4ge1xuXHRcdGlmIChwbGFjZWhvbGRlciA9PSBudWxsIHx8IHR5cGVvZiBwbGFjZWhvbGRlciA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIG0oXCJzcGFuLnBsYWNlaG9sZGVyXCIsIHBsYWNlaG9sZGVyID8/IGxhbmcuZ2V0KFwibm9TZWxlY3Rpb25fbXNnXCIpKVxuXHRcdH1cblxuXHRcdHJldHVybiBwbGFjZWhvbGRlclxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJEcm9wZG93bihcblx0XHRvcHRpb25zOiBTdHJlYW08QXJyYXk8VT4+LFxuXHRcdGRvbTogSFRNTEVsZW1lbnQsXG5cdFx0b25TZWxlY3Q6IChvcHRpb246IFUpID0+IHZvaWQsXG5cdFx0cmVuZGVyT3B0aW9uczogKG9wdGlvbjogVSkgPT4gQ2hpbGRyZW4sXG5cdFx0a2VlcEZvY3VzOiBib29sZWFuLFxuXHRcdHNlbGVjdGVkPzogVCxcblx0XHRvbkNsb3NlPzogKCkgPT4gdm9pZCxcblx0XHRkcm9wZG93blBvc2l0aW9uPzogXCJ0b3BcIiB8IFwiYm90dG9tXCIsXG5cdCkge1xuXHRcdGNvbnN0IG9wdGlvbkxpc3RDb250YWluZXI6IE9wdGlvbkxpc3RDb250YWluZXIgPSBuZXcgT3B0aW9uTGlzdENvbnRhaW5lcihcblx0XHRcdG9wdGlvbnMsXG5cdFx0XHQob3B0aW9uOiBVKSA9PiB7XG5cdFx0XHRcdHJldHVybiBtLmZyYWdtZW50KFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGtleTogKyt0aGlzLmtleSxcblx0XHRcdFx0XHRcdG9uY3JlYXRlOiAoeyBkb20gfTogVm5vZGVET008VT4pID0+IHRoaXMuc2V0dXBPcHRpb24oZG9tIGFzIEhUTUxFbGVtZW50LCBvblNlbGVjdCwgb3B0aW9uLCBvcHRpb25MaXN0Q29udGFpbmVyLCBzZWxlY3RlZCksXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRbcmVuZGVyT3B0aW9ucyhvcHRpb24pXSxcblx0XHRcdFx0KVxuXHRcdFx0fSxcblx0XHRcdGRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCxcblx0XHRcdGtlZXBGb2N1cyxcblx0XHRcdGRyb3Bkb3duUG9zaXRpb24sXG5cdFx0KVxuXG5cdFx0b3B0aW9uTGlzdENvbnRhaW5lci5vbkNsb3NlID0gKCkgPT4ge1xuXHRcdFx0b3B0aW9uTGlzdENvbnRhaW5lci5jbG9zZSgpXG5cdFx0XHRvbkNsb3NlPy4oKVxuXHRcdFx0dGhpcy5pc0V4cGFuZGVkID0gZmFsc2Vcblx0XHR9XG5cblx0XHRvcHRpb25MaXN0Q29udGFpbmVyLnNldE9yaWdpbihkb20uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG5cblx0XHR0aGlzLmlzRXhwYW5kZWQgPSB0cnVlXG5cdFx0dGhpcy5kcm9wZG93bkNvbnRhaW5lciA9IG9wdGlvbkxpc3RDb250YWluZXJcblx0XHRtb2RhbC5kaXNwbGF5VW5pcXVlKG9wdGlvbkxpc3RDb250YWluZXIsIGZhbHNlKVxuXHR9XG5cblx0cHJpdmF0ZSBzZXR1cE9wdGlvbihkb206IEhUTUxFbGVtZW50LCBvblNlbGVjdDogKG9wdGlvbjogVSkgPT4gdm9pZCwgb3B0aW9uOiBVLCBvcHRpb25MaXN0Q29udGFpbmVyOiBPcHRpb25MaXN0Q29udGFpbmVyLCBzZWxlY3RlZDogVCB8IHVuZGVmaW5lZCkge1xuXHRcdGRvbS5vbmNsaWNrID0gdGhpcy53cmFwT25DaGFuZ2UuYmluZCh0aGlzLCBvblNlbGVjdCwgb3B0aW9uLCBvcHRpb25MaXN0Q29udGFpbmVyKVxuXG5cdFx0aWYgKCEoXCJkaXNhYmxlZFwiIGluIGRvbSkpIHtcblx0XHRcdC8vIFdlIGhhdmUgdG8gc2V0IHRoZSB0YWJJbmRleCB0byBtYWtlIHN1cmUgdGhhdCBpdCdsbCBiZSBmb2N1c2FibGUgYnkgdGFiYmluZ1xuXHRcdFx0ZG9tLnRhYkluZGV4ID0gTnVtYmVyKFRhYkluZGV4LkRlZmF1bHQpXG5cblx0XHRcdC8vIFdlIGhhdmUgdG8gc2V0IHRoZSBjdXJzb3IgcG9pbnRlciBhcyBhIGZhbGxiYWNrIG9mIHJlbmRlck9wdGlvbnMgdGhhdCBkb2Vzbid0IHNldCBpdFxuXHRcdFx0aWYgKCFkb20uc3R5bGUuY3Vyc29yKSB7XG5cdFx0XHRcdGRvbS5zdHlsZS5jdXJzb3IgPSBcInBvaW50ZXJcIlxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWRvbS5yb2xlKSB7XG5cdFx0XHRcdGRvbS5yb2xlID0gQXJpYVJvbGUuT3B0aW9uXG5cdFx0XHR9XG5cblx0XHRcdGRvbS5hcmlhU2VsZWN0ZWQgPSBgJHtzZWxlY3RlZCA9PT0gb3B0aW9uLnZhbHVlfWBcblx0XHR9XG5cblx0XHRkb20ub25rZXlkb3duID0gKGU6IEtleWJvYXJkRXZlbnQpID0+IHtcblx0XHRcdGlmIChpc0tleVByZXNzZWQoZS5rZXksIEtleXMuU1BBQ0UsIEtleXMuUkVUVVJOKSkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0dGhpcy53cmFwT25DaGFuZ2Uob25TZWxlY3QsIG9wdGlvbiwgb3B0aW9uTGlzdENvbnRhaW5lcilcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHdyYXBPbkNoYW5nZShjYWxsYmFjazogKG9wdGlvbjogVSkgPT4gdm9pZCwgb3B0aW9uOiBVLCBjb250YWluZXI6IE9wdGlvbkxpc3RDb250YWluZXIpIHtcblx0XHRjYWxsYmFjayhvcHRpb24pXG5cdFx0Y29udGFpbmVyLm9uQ2xvc2UoKVxuXHR9XG59XG5cbmNsYXNzIE9wdGlvbkxpc3RDb250YWluZXIgaW1wbGVtZW50cyBNb2RhbENvbXBvbmVudCB7XG5cdHByaXZhdGUgZG9tRHJvcGRvd246IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0dmlldzogTW9kYWxDb21wb25lbnRbXCJ2aWV3XCJdXG5cdG9yaWdpbjogUG9zUmVjdCB8IG51bGwgPSBudWxsXG5cdHNob3J0Y3V0czogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IGFueVxuXHRwcml2YXRlIHJlYWRvbmx5IHdpZHRoOiBudW1iZXJcblx0cHJpdmF0ZSBkb21Db250ZW50czogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIG1heEhlaWdodDogbnVtYmVyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBmb2N1c2VkQmVmb3JlU2hvd246IEhUTUxFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnRcblx0cHJpdmF0ZSBjaGlsZHJlbjogQ2hpbGRyZW5bXSA9IFtdXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBpdGVtczogU3RyZWFtPEFycmF5PHVua25vd24+Pixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGJ1aWxkRnVuY3Rpb246IChvcHRpb246IHVua25vd24pID0+IENoaWxkcmVuLFxuXHRcdHdpZHRoOiBudW1iZXIsXG5cdFx0a2VlcEZvY3VzOiBib29sZWFuLFxuXHRcdGRyb3Bkb3duUG9zaXRpb24/OiBcInRvcFwiIHwgXCJib3R0b21cIixcblx0KSB7XG5cdFx0dGhpcy53aWR0aCA9IHdpZHRoXG5cdFx0dGhpcy5zaG9ydGN1dHMgPSB0aGlzLmJ1aWxkU2hvcnRjdXRzXG5cblx0XHR0aGlzLml0ZW1zLm1hcCgobmV3SXRlbXMpID0+IHtcblx0XHRcdHRoaXMuY2hpbGRyZW4gPSBbXVxuXHRcdFx0dGhpcy5jaGlsZHJlbi5wdXNoKG5ld0l0ZW1zLmxlbmd0aCA9PT0gMCA/IHRoaXMucmVuZGVyTm9JdGVtKCkgOiBuZXdJdGVtcy5tYXAoKGl0ZW0pID0+IHRoaXMuYnVpbGRGdW5jdGlvbihpdGVtKSkpXG5cdFx0fSlcblxuXHRcdHRoaXMudmlldyA9ICgpID0+IHtcblx0XHRcdHJldHVybiBtKFxuXHRcdFx0XHRcIi5kcm9wZG93bi1wYW5lbC1zY3JvbGxhYmxlLmVsZXZhdGVkLWJnLmJvcmRlci1yYWRpdXMuZHJvcGRvd24tc2hhZG93LmZpdC1jb250ZW50XCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRvbmNyZWF0ZTogKHZub2RlOiBWbm9kZURPTTxIVE1MRWxlbWVudD4pID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuZG9tRHJvcGRvd24gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0XHRcdC8vIEl0IGlzIGltcG9ydGFudCB0byBzZXQgaW5pdGlhbCBvcGFjaXR5IHNvIHRoYXQgdXNlciBkb2Vzbid0IHNlZSBpdCB3aXRoIGZ1bGwgb3BhY2l0eSBiZWZvcmUgYW5pbWF0aW5nLlxuXHRcdFx0XHRcdFx0dGhpcy5kb21Ecm9wZG93bi5zdHlsZS5vcGFjaXR5ID0gXCIwXCJcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLmRyb3Bkb3duLWNvbnRlbnQuc2Nyb2xsLmZsZXguZmxleC1jb2x1bW5cIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyb2xlOiBBcmlhUm9sZS5MaXN0Ym94LFxuXHRcdFx0XHRcdFx0dGFiaW5kZXg6IFRhYkluZGV4LlByb2dyYW1tYXRpYyxcblx0XHRcdFx0XHRcdG9uY3JlYXRlOiAodm5vZGU6IFZub2RlRE9NPEhUTUxFbGVtZW50PikgPT4ge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmRvbUNvbnRlbnRzID0gdm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b251cGRhdGU6ICh2bm9kZTogVm5vZGVET008SFRNTEVsZW1lbnQ+KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLm1heEhlaWdodCA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgY2hpbGRyZW4gPSBBcnJheS5mcm9tKHZub2RlLmRvbS5jaGlsZHJlbikgYXMgQXJyYXk8SFRNTEVsZW1lbnQ+XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5tYXhIZWlnaHQgPSBNYXRoLm1pbihcblx0XHRcdFx0XHRcdFx0XHRcdDQwMCArIHNpemUudnBhZCxcblx0XHRcdFx0XHRcdFx0XHRcdGNoaWxkcmVuLnJlZHVjZSgoYWNjdW11bGF0b3IsIGNoaWxkcmVuKSA9PiBhY2N1bXVsYXRvciArIGNoaWxkcmVuLm9mZnNldEhlaWdodCwgMCkgKyBzaXplLnZwYWQsXG5cdFx0XHRcdFx0XHRcdFx0KSAvLyBzaXplLnBhZCBhY2NvdW50cyBmb3IgdG9wIGFuZCBib3R0b20gcGFkZGluZ1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMub3JpZ2luKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBUaGUgZHJvcGRvd24tY29udGVudCBlbGVtZW50IGlzIGFkZGVkIHRvIHRoZSBkb20gaGFzIGEgaGlkZGVuIGVsZW1lbnQgZmlyc3QuXG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBUaGUgbWF4SGVpZ2h0IGlzIGF2YWlsYWJsZSBhZnRlciB0aGUgZmlyc3Qgb251cGRhdGUgY2FsbC4gVGhlbiB0aGlzIHByb21pc2Ugd2lsbCByZXNvbHZlIGFuZCB3ZSBjYW4gc2FmZWx5XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBzaG93IHRoZSBkcm9wZG93bi5cblx0XHRcdFx0XHRcdFx0XHRcdC8vIE1vZGFsIGFsd2F5cyBzY2hlZHVsZXMgcmVkcmF3IGluIG9uY3JlYXRlKCkgb2YgYSBjb21wb25lbnQgc28gd2UgYXJlIGd1YXJhbnRlZWQgdG8gaGF2ZSBvbnVwZGF0ZSgpIGNhbGwuXG5cdFx0XHRcdFx0XHRcdFx0XHRzaG93RHJvcGRvd24odGhpcy5vcmlnaW4sIGFzc2VydE5vdE51bGwodGhpcy5kb21Ecm9wZG93biksIHRoaXMubWF4SGVpZ2h0LCB0aGlzLndpZHRoLCBkcm9wZG93blBvc2l0aW9uKS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWRPcHRpb24gPSB2bm9kZS5kb20ucXVlcnlTZWxlY3RvcihcIlthcmlhLXNlbGVjdGVkPSd0cnVlJ11cIikgYXMgSFRNTEVsZW1lbnQgfCBudWxsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChzZWxlY3RlZE9wdGlvbiAmJiAha2VlcEZvY3VzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRPcHRpb24uZm9jdXMoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCFrZWVwRm9jdXMgJiYgKCF0aGlzLmRvbURyb3Bkb3duIHx8IGZvY3VzTmV4dCh0aGlzLmRvbURyb3Bkb3duKSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmRvbUNvbnRlbnRzPy5mb2N1cygpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlRHJvcGRvd25TaXplKHZub2RlKVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b25zY3JvbGw6IChldjogRXZlbnRSZWRyYXc8RXZlbnQ+KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MRWxlbWVudFxuXHRcdFx0XHRcdFx0XHQvLyBuZWVkZWQgaGVyZSB0byBwcmV2ZW50IGZsaWNrZXJpbmcgb24gaW9zXG5cdFx0XHRcdFx0XHRcdGV2LnJlZHJhdyA9XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5kb21Db250ZW50cyAhPSBudWxsICYmIHRhcmdldC5zY3JvbGxUb3AgPCAwICYmIHRhcmdldC5zY3JvbGxUb3AgKyB0aGlzLmRvbUNvbnRlbnRzLm9mZnNldEhlaWdodCA+IHRhcmdldC5zY3JvbGxIZWlnaHRcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR0aGlzLmNoaWxkcmVuLFxuXHRcdFx0XHQpLFxuXHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRHJvcGRvd25TaXplKHZub2RlOiBWbm9kZURPTTxIVE1MRWxlbWVudD4pIHtcblx0XHRpZiAoISh0aGlzLm9yaWdpbiAmJiB0aGlzLmRvbURyb3Bkb3duKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgdXBwZXJTcGFjZSA9IHRoaXMub3JpZ2luLnRvcCAtIGdldFNhZmVBcmVhSW5zZXRUb3AoKVxuXHRcdGNvbnN0IGxvd2VyU3BhY2UgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSB0aGlzLm9yaWdpbi5ib3R0b20gLSBnZXRTYWZlQXJlYUluc2V0Qm90dG9tKClcblxuXHRcdGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuZnJvbSh2bm9kZS5kb20uY2hpbGRyZW4pIGFzIEFycmF5PEhUTUxFbGVtZW50PlxuXHRcdGNvbnN0IGNvbnRlbnRIZWlnaHQgPSBNYXRoLm1pbig0MDAgKyBzaXplLnZwYWQsIGNoaWxkcmVuLnJlZHVjZSgoYWNjdW11bGF0b3IsIGNoaWxkcmVuKSA9PiBhY2N1bXVsYXRvciArIGNoaWxkcmVuLm9mZnNldEhlaWdodCwgMCkgKyBzaXplLnZwYWQpXG5cblx0XHR0aGlzLm1heEhlaWdodCA9IGxvd2VyU3BhY2UgPiB1cHBlclNwYWNlID8gTWF0aC5taW4oY29udGVudEhlaWdodCwgbG93ZXJTcGFjZSkgOiBNYXRoLm1pbihjb250ZW50SGVpZ2h0LCB1cHBlclNwYWNlKVxuXHRcdGNvbnN0IG5ld0hlaWdodCA9IHB4KHRoaXMubWF4SGVpZ2h0KVxuXHRcdGlmICh0aGlzLmRvbURyb3Bkb3duLnN0eWxlLmhlaWdodCAhPT0gbmV3SGVpZ2h0KSB0aGlzLmRvbURyb3Bkb3duLnN0eWxlLmhlaWdodCA9IG5ld0hlaWdodFxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJOb0l0ZW0oKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFwic3Bhbi5wbGFjZWhvbGRlci50ZXh0LWNlbnRlclwiLCB7IGNvbG9yOiB0aGVtZS5saXN0X21lc3NhZ2VfYmcgfSwgbGFuZy5nZXQoXCJub0VudHJpZXNfbXNnXCIpKVxuXHR9XG5cblx0YmFja2dyb3VuZENsaWNrID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHR0aGlzLmRvbURyb3Bkb3duICYmXG5cdFx0XHQhKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5jbGFzc0xpc3QuY29udGFpbnMoXCJkb05vdENsb3NlXCIpICYmXG5cdFx0XHQodGhpcy5kb21Ecm9wZG93bi5jb250YWlucyhlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkgfHwgdGhpcy5kb21Ecm9wZG93bi5wYXJlbnROb2RlID09PSBlLnRhcmdldClcblx0XHQpIHtcblx0XHRcdHRoaXMub25DbG9zZSgpXG5cdFx0fVxuXHR9XG5cblx0YnVpbGRTaG9ydGN1dHMoKTogQXJyYXk8U2hvcnRjdXQ+IHtcblx0XHRyZXR1cm4gW1xuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuRVNDLFxuXHRcdFx0XHRleGVjOiAoKSA9PiB0aGlzLm9uQ2xvc2UoKSxcblx0XHRcdFx0aGVscDogXCJjbG9zZV9hbHRcIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5UQUIsXG5cdFx0XHRcdHNoaWZ0OiB0cnVlLFxuXHRcdFx0XHRleGVjOiAoKSA9PiAodGhpcy5kb21Ecm9wZG93biA/IGZvY3VzUHJldmlvdXModGhpcy5kb21Ecm9wZG93bikgOiBmYWxzZSksXG5cdFx0XHRcdGhlbHA6IFwic2VsZWN0UHJldmlvdXNfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVEFCLFxuXHRcdFx0XHRzaGlmdDogZmFsc2UsXG5cdFx0XHRcdGV4ZWM6ICgpID0+ICh0aGlzLmRvbURyb3Bkb3duID8gZm9jdXNOZXh0KHRoaXMuZG9tRHJvcGRvd24pIDogZmFsc2UpLFxuXHRcdFx0XHRoZWxwOiBcInNlbGVjdE5leHRfYWN0aW9uXCIsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRrZXk6IEtleXMuVVAsXG5cdFx0XHRcdGV4ZWM6ICgpID0+ICh0aGlzLmRvbURyb3Bkb3duID8gZm9jdXNQcmV2aW91cyh0aGlzLmRvbURyb3Bkb3duKSA6IGZhbHNlKSxcblx0XHRcdFx0aGVscDogXCJzZWxlY3RQcmV2aW91c19hY3Rpb25cIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGtleTogS2V5cy5ET1dOLFxuXHRcdFx0XHRleGVjOiAoKSA9PiAodGhpcy5kb21Ecm9wZG93biA/IGZvY3VzTmV4dCh0aGlzLmRvbURyb3Bkb3duKSA6IGZhbHNlKSxcblx0XHRcdFx0aGVscDogXCJzZWxlY3ROZXh0X2FjdGlvblwiLFxuXHRcdFx0fSxcblx0XHRdXG5cdH1cblxuXHRzZXRPcmlnaW4ob3JpZ2luOiBQb3NSZWN0KTogdGhpcyB7XG5cdFx0dGhpcy5vcmlnaW4gPSBvcmlnaW5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0Y2xvc2UoKTogdm9pZCB7XG5cdFx0bW9kYWwucmVtb3ZlKHRoaXMpXG5cdH1cblxuXHRoaWRlQW5pbWF0aW9uKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHR9XG5cblx0b25DbG9zZSgpOiB2b2lkIHtcblx0XHR0aGlzLmNsb3NlKClcblx0fVxuXG5cdHBvcFN0YXRlKGU6IEV2ZW50KTogYm9vbGVhbiB7XG5cdFx0dGhpcy5vbkNsb3NlKClcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGNhbGxpbmdFbGVtZW50KCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuZm9jdXNlZEJlZm9yZVNob3duXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENsYXNzQ29tcG9uZW50LCBWbm9kZSwgVm5vZGVET00gfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBTZWxlY3QsIFNlbGVjdEF0dHJpYnV0ZXMsIFNlbGVjdE9wdGlvbiwgU2VsZWN0U3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1NlbGVjdC5qc1wiXG5pbXBvcnQgeyBLZXlzLCBUYWJJbmRleCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBTaW5nbGVMaW5lVGV4dEZpZWxkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9TaW5nbGVMaW5lVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IGRlYm91bmNlU3RhcnQsIGdldEZpcnN0T3JUaHJvdyB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9EaWFsb2cuanNcIlxuaW1wb3J0IHsgbGFuZywgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgcGFyc2VNYWlsQWRkcmVzcywgcGFyc2VQYXN0ZWRJbnB1dCwgcGFyc2VUeXBlZElucHV0IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvTWFpbFJlY2lwaWVudHNUZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgQ29udGFjdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFJlY2lwaWVudFNlYXJjaFJlc3VsdEl0ZW0sIFJlY2lwaWVudHNTZWFyY2hNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9SZWNpcGllbnRzU2VhcmNoTW9kZWwuanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsga2V5Ym9hcmRFdmVudFRvS2V5UHJlc3MgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvS2V5TWFuYWdlci5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL3RoZW1lLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBEZWZhdWx0QW5pbWF0aW9uVGltZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2FuaW1hdGlvbi9BbmltYXRpb25zLmpzXCJcbmltcG9ydCB7IFRleHRGaWVsZFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgR3Vlc3RQaWNrZXJBdHRycyB7XG5cdGFyaWFMYWJlbDogVHJhbnNsYXRpb25LZXlcblx0b25SZWNpcGllbnRBZGRlZDogKGFkZHJlc3M6IHN0cmluZywgbmFtZTogc3RyaW5nIHwgbnVsbCwgY29udGFjdDogQ29udGFjdCB8IG51bGwpID0+IHZvaWRcblx0ZGlzYWJsZWQ6IGJvb2xlYW5cblx0c2VhcmNoOiBSZWNpcGllbnRzU2VhcmNoTW9kZWxcbn1cblxuaW50ZXJmYWNlIEd1ZXN0SXRlbSBleHRlbmRzIFNlbGVjdE9wdGlvbjxSZWNpcGllbnRTZWFyY2hSZXN1bHRJdGVtPiB7XG5cdG5hbWU6IHN0cmluZ1xuXHRhZGRyZXNzPzogc3RyaW5nXG5cdHR5cGU6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgR3Vlc3RQaWNrZXIgaW1wbGVtZW50cyBDbGFzc0NvbXBvbmVudDxHdWVzdFBpY2tlckF0dHJzPiB7XG5cdHByaXZhdGUgaXNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlXG5cdHByaXZhdGUgaXNGb2N1c2VkOiBib29sZWFuID0gZmFsc2Vcblx0cHJpdmF0ZSB2YWx1ZTogc3RyaW5nID0gXCJcIlxuXHRwcml2YXRlIHNlbGVjdGVkPzogR3Vlc3RJdGVtXG5cdHByaXZhdGUgb3B0aW9uczogc3RyZWFtPEFycmF5PEd1ZXN0SXRlbT4+ID0gc3RyZWFtKFtdKVxuXHRwcml2YXRlIHNlbGVjdERPTTogVm5vZGVET008U2VsZWN0QXR0cmlidXRlczxHdWVzdEl0ZW0sIFJlY2lwaWVudFNlYXJjaFJlc3VsdEl0ZW0+PiB8IG51bGwgPSBudWxsXG5cblx0dmlldyh7IGF0dHJzIH06IFZub2RlPEd1ZXN0UGlja2VyQXR0cnM+KSB7XG5cdFx0cmV0dXJuIG0oU2VsZWN0PEd1ZXN0SXRlbSwgUmVjaXBpZW50U2VhcmNoUmVzdWx0SXRlbT4sIHtcblx0XHRcdGNsYXNzZXM6IFtcImZsZXgtZ3Jvd1wiXSxcblx0XHRcdGRyb3Bkb3duUG9zaXRpb246IFwiYm90dG9tXCIsXG5cdFx0XHRvbmNoYW5nZTogKHsgdmFsdWU6IGd1ZXN0IH0pID0+IHtcblx0XHRcdFx0dGhpcy5oYW5kbGVTZWxlY3Rpb24oYXR0cnMsIGd1ZXN0KVxuXHRcdFx0fSxcblx0XHRcdG9uY2xvc2U6ICgpID0+IHtcblx0XHRcdFx0dGhpcy5pc0V4cGFuZGVkID0gZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRvbmNyZWF0ZTogKG5vZGU6IFZub2RlRE9NPFNlbGVjdEF0dHJpYnV0ZXM8R3Vlc3RJdGVtLCBSZWNpcGllbnRTZWFyY2hSZXN1bHRJdGVtPj4pID0+IHtcblx0XHRcdFx0dGhpcy5zZWxlY3RET00gPSBub2RlXG5cdFx0XHR9LFxuXHRcdFx0c2VsZWN0ZWQ6IHRoaXMuc2VsZWN0ZWQsXG5cdFx0XHRhcmlhTGFiZWw6IGF0dHJzLmFyaWFMYWJlbCxcblx0XHRcdGRpc2FibGVkOiBhdHRycy5kaXNhYmxlZCxcblx0XHRcdG9wdGlvbnM6IHRoaXMub3B0aW9ucyxcblx0XHRcdG5vSWNvbjogdHJ1ZSxcblx0XHRcdGV4cGFuZGVkOiB0cnVlLFxuXHRcdFx0dGFiSW5kZXg6IE51bWJlcihUYWJJbmRleC5Qcm9ncmFtbWF0aWMpLFxuXHRcdFx0cGxhY2Vob2xkZXI6IHRoaXMucmVuZGVyU2VhcmNoSW5wdXQoYXR0cnMpLFxuXHRcdFx0cmVuZGVyRGlzcGxheTogKCkgPT4gdGhpcy5yZW5kZXJTZWFyY2hJbnB1dChhdHRycyksXG5cdFx0XHRyZW5kZXJPcHRpb246IChvcHRpb24pID0+IHRoaXMucmVuZGVyU3VnZ2VzdGlvbkl0ZW0ob3B0aW9uID09PSB0aGlzLnNlbGVjdGVkLCBvcHRpb24pLFxuXHRcdFx0a2VlcEZvY3VzOiB0cnVlLFxuXHRcdH0gc2F0aXNmaWVzIFNlbGVjdEF0dHJpYnV0ZXM8R3Vlc3RJdGVtLCBSZWNpcGllbnRTZWFyY2hSZXN1bHRJdGVtPilcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU3VnZ2VzdGlvbkl0ZW0oc2VsZWN0ZWQ6IGJvb2xlYW4sIG9wdGlvbjogR3Vlc3RJdGVtKSB7XG5cdFx0Y29uc3QgZmlyc3RSb3cgPVxuXHRcdFx0b3B0aW9uLnZhbHVlLnR5cGUgPT09IFwicmVjaXBpZW50XCJcblx0XHRcdFx0PyBvcHRpb24udmFsdWUudmFsdWUubmFtZVxuXHRcdFx0XHQ6IG0oSWNvbiwge1xuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuUGVvcGxlLFxuXHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9mZyxcblx0XHRcdFx0XHRcdFx0XCJhcmlhLWRlc2NyaWJlZGJ5XCI6IGxhbmcuZ2V0KFwiY29udGFjdExpc3ROYW1lX2xhYmVsXCIpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0ICB9KVxuXHRcdGNvbnN0IHNlY29uZFJvdyA9IG9wdGlvbi52YWx1ZS50eXBlID09PSBcInJlY2lwaWVudFwiID8gb3B0aW9uLnZhbHVlLnZhbHVlLmFkZHJlc3MgOiBvcHRpb24udmFsdWUudmFsdWUubmFtZVxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIucHQtcy5wYi1zLmNsaWNrLmNvbnRlbnQtaG92ZXIuYnV0dG9uLW1pbi1oZWlnaHRcIixcblx0XHRcdHtcblx0XHRcdFx0Y2xhc3M6IHNlbGVjdGVkID8gXCJjb250ZW50LWFjY2VudC1mZyByb3ctc2VsZWN0ZWQgaWNvbi1hY2NlbnRcIiA6IFwiXCIsXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XCJwYWRkaW5nLWxlZnRcIjogc2VsZWN0ZWQgPyBweChzaXplLmhwYWRfbGFyZ2UgLSAzKSA6IHB4KHNpemUuaHBhZF9sYXJnZSksXG5cdFx0XHRcdFx0XCJib3JkZXItbGVmdFwiOiBzZWxlY3RlZCA/IFwiM3B4IHNvbGlkXCIgOiBudWxsLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFttKFwiLnNtYWxsLmZ1bGwtd2lkdGgudGV4dC1lbGxpcHNpc1wiLCBmaXJzdFJvdyksIG0oXCIubmFtZS5mdWxsLXdpZHRoLnRleHQtZWxsaXBzaXNcIiwgc2Vjb25kUm93KV0sXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVTZWxlY3Rpb24oYXR0cnM6IEd1ZXN0UGlja2VyQXR0cnMsIGd1ZXN0OiBSZWNpcGllbnRTZWFyY2hSZXN1bHRJdGVtKSB7XG5cdFx0aWYgKGd1ZXN0LnZhbHVlICE9IG51bGwpIHtcblx0XHRcdGlmIChndWVzdC50eXBlID09PSBcInJlY2lwaWVudFwiKSB7XG5cdFx0XHRcdGNvbnN0IHsgYWRkcmVzcywgbmFtZSwgY29udGFjdCB9ID0gZ3Vlc3QudmFsdWVcblx0XHRcdFx0YXR0cnMub25SZWNpcGllbnRBZGRlZChhZGRyZXNzLCBuYW1lLCBjb250YWN0KVxuXHRcdFx0XHRhdHRycy5zZWFyY2guY2xlYXIoKVxuXHRcdFx0XHR0aGlzLnZhbHVlID0gXCJcIlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy52YWx1ZSA9IFwiXCJcblx0XHRcdFx0Y29uc3QgcmVjaXBpZW50cyA9IGF3YWl0IGF0dHJzLnNlYXJjaC5yZXNvbHZlQ29udGFjdExpc3QoZ3Vlc3QudmFsdWUpXG5cdFx0XHRcdGZvciAoY29uc3QgeyBhZGRyZXNzLCBuYW1lLCBjb250YWN0IH0gb2YgcmVjaXBpZW50cykge1xuXHRcdFx0XHRcdGF0dHJzLm9uUmVjaXBpZW50QWRkZWQoYWRkcmVzcywgbmFtZSwgY29udGFjdClcblx0XHRcdFx0fVxuXHRcdFx0XHRhdHRycy5zZWFyY2guY2xlYXIoKVxuXHRcdFx0XHRtLnJlZHJhdygpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJTZWFyY2hJbnB1dChhdHRyczogR3Vlc3RQaWNrZXJBdHRycykge1xuXHRcdHJldHVybiBtKFNpbmdsZUxpbmVUZXh0RmllbGQsIHtcblx0XHRcdGNsYXNzZXM6IFtcImhlaWdodC0xMDBwXCJdLFxuXHRcdFx0dmFsdWU6IHRoaXMudmFsdWUsXG5cdFx0XHRwbGFjZWhvbGRlcjogbGFuZy5nZXQoXCJhZGRHdWVzdF9sYWJlbFwiKSxcblx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcblx0XHRcdFx0aWYgKCF0aGlzLmlzRXhwYW5kZWQgJiYgdGhpcy52YWx1ZS5sZW5ndGggPiAwICYmIHRoaXMuc2VsZWN0RE9NKSB7XG5cdFx0XHRcdFx0Oyh0aGlzLnNlbGVjdERPTS5kb20gYXMgSFRNTEVsZW1lbnQpLmNsaWNrKClcblx0XHRcdFx0XHR0aGlzLmlzRXhwYW5kZWQgPSB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRvbmlucHV0OiAodmFsOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKHZhbC5sZW5ndGggPiAwICYmICF0aGlzLmlzRXhwYW5kZWQgJiYgdGhpcy5zZWxlY3RET00pIHtcblx0XHRcdFx0XHQ7KHRoaXMuc2VsZWN0RE9NLmRvbSBhcyBIVE1MRWxlbWVudCkuY2xpY2soKVxuXHRcdFx0XHRcdHRoaXMuaXNFeHBhbmRlZCA9IHRydWVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGlmIHRoZSBuZXcgdGV4dCBsZW5ndGggaXMgbW9yZSB0aGFuIG9uZSBjaGFyYWN0ZXIgbG9uZ2VyLFxuXHRcdFx0XHQvLyBpdCBtZWFucyB0aGUgdXNlciBwYXN0ZWQgdGhlIHRleHQgaW4sIHNvIHdlIHdhbnQgdG8gdHJ5IGFuZCByZXNvbHZlIGEgbGlzdCBvZiBjb250YWN0c1xuXHRcdFx0XHRjb25zdCB7IHJlbWFpbmluZ1RleHQsIG5ld1JlY2lwaWVudHMsIGVycm9ycyB9ID0gdmFsLmxlbmd0aCAtIHRoaXMudmFsdWUubGVuZ3RoID4gMSA/IHBhcnNlUGFzdGVkSW5wdXQodmFsKSA6IHBhcnNlVHlwZWRJbnB1dCh2YWwpXG5cblx0XHRcdFx0Zm9yIChjb25zdCB7IGFkZHJlc3MsIG5hbWUgfSBvZiBuZXdSZWNpcGllbnRzKSB7XG5cdFx0XHRcdFx0YXR0cnMub25SZWNpcGllbnRBZGRlZChhZGRyZXNzLCBuYW1lLCBudWxsKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGVycm9ycy5sZW5ndGggPT09IDEgJiYgbmV3UmVjaXBpZW50cy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHQvLyBpZiB0aGVyZSB3YXMgYSBzaW5nbGUgcmVjaXBpZW50IGFuZCBpdCB3YXMgaW52YWxpZCB0aGVuIGp1c3QgcHJldGVuZCBub3RoaW5nIGhhcHBlbmVkXG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IGdldEZpcnN0T3JUaHJvdyhlcnJvcnMpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHREaWFsb2cubWVzc2FnZShsYW5nLm1ha2VUcmFuc2xhdGlvbihcImVycm9yX21lc3NhZ2VcIiwgYCR7bGFuZy5nZXQoXCJpbnZhbGlkUGFzdGVkUmVjaXBpZW50c19tc2dcIil9XFxuXFxuJHtlcnJvcnMuam9pbihcIlxcblwiKX1gKSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IHJlbWFpbmluZ1RleHRcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuZG9TZWFyY2godmFsLCBhdHRycylcblx0XHRcdH0sXG5cdFx0XHRkaXNhYmxlZDogYXR0cnMuZGlzYWJsZWQsXG5cdFx0XHRhcmlhTGFiZWw6IGF0dHJzLmFyaWFMYWJlbCxcblx0XHRcdG9uZm9jdXM6IChldmVudDogRm9jdXNFdmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLmlzRm9jdXNlZCA9IHRydWVcblx0XHRcdH0sXG5cdFx0XHRvbmJsdXI6IChlOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuaXNGb2N1c2VkKSB7XG5cdFx0XHRcdFx0dGhpcy5yZXNvbHZlSW5wdXQoYXR0cnMsIGZhbHNlKVxuXHRcdFx0XHRcdHRoaXMuaXNGb2N1c2VkID0gZmFsc2Vcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGUucmVkcmF3ID0gZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRvbmtleWRvd246IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4gdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50LCBhdHRycyksXG5cdFx0XHR0eXBlOiBUZXh0RmllbGRUeXBlLlRleHQsXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgZG9TZWFyY2ggPSBkZWJvdW5jZVN0YXJ0KERlZmF1bHRBbmltYXRpb25UaW1lLCAodmFsOiBzdHJpbmcsIGF0dHJzOiBHdWVzdFBpY2tlckF0dHJzKSA9PiB7XG5cdFx0YXR0cnMuc2VhcmNoLnNlYXJjaCh2YWwpLnRoZW4oKCkgPT4ge1xuXHRcdFx0Y29uc3Qgc2VhcmNoUmVzdWx0ID0gYXR0cnMuc2VhcmNoLnJlc3VsdHMoKVxuXG5cdFx0XHRpZiAoc2VhcmNoUmVzdWx0Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHR0aGlzLnNlbGVjdGVkID0gdW5kZWZpbmVkXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMub3B0aW9ucyhcblx0XHRcdFx0c2VhcmNoUmVzdWx0Lm1hcCgob3B0aW9uKSA9PiAoe1xuXHRcdFx0XHRcdG5hbWU6IG9wdGlvbi52YWx1ZS5uYW1lLFxuXHRcdFx0XHRcdHZhbHVlOiBvcHRpb24sXG5cdFx0XHRcdFx0dHlwZTogb3B0aW9uLnR5cGUsXG5cdFx0XHRcdFx0YXJpYVZhbHVlOiBvcHRpb24udmFsdWUubmFtZSxcblx0XHRcdFx0fSkpLFxuXHRcdFx0KVxuXG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fSlcblx0fSlcblxuXHRwcml2YXRlIGhhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQsIGF0dHJzOiBHdWVzdFBpY2tlckF0dHJzKSB7XG5cdFx0Y29uc3Qga2V5UHJlc3MgPSBrZXlib2FyZEV2ZW50VG9LZXlQcmVzcyhldmVudClcblxuXHRcdHN3aXRjaCAoa2V5UHJlc3Mua2V5LnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdGNhc2UgS2V5cy5SRVRVUk4uY29kZTpcblx0XHRcdFx0dGhpcy5yZXNvbHZlSW5wdXQoYXR0cnMsIHRydWUpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIEtleXMuRE9XTi5jb2RlOlxuXHRcdFx0XHR0aGlzLm1vdmVTZWxlY3Rpb24odHJ1ZSlcblx0XHRcdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRjYXNlIEtleXMuVVAuY29kZTpcblx0XHRcdFx0dGhpcy5tb3ZlU2VsZWN0aW9uKGZhbHNlKVxuXHRcdFx0XHRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZVxuXHR9XG5cblx0cHJpdmF0ZSBtb3ZlU2VsZWN0aW9uKGZvcndhcmQ6IGJvb2xlYW4pIHtcblx0XHRjb25zdCBzZWxlY3RlZEluZGV4ID0gdGhpcy5zZWxlY3RlZCA/IHRoaXMub3B0aW9ucygpLmluZGV4T2YodGhpcy5zZWxlY3RlZCkgOiAtMVxuXHRcdGNvbnN0IG9wdGlvbnNMZW5ndGggPSB0aGlzLm9wdGlvbnMoKS5sZW5ndGhcblxuXHRcdGxldCBuZXdJbmRleFxuXHRcdGlmIChmb3J3YXJkKSB7XG5cdFx0XHRuZXdJbmRleCA9IHNlbGVjdGVkSW5kZXggKyAxIDwgb3B0aW9uc0xlbmd0aCA/IHNlbGVjdGVkSW5kZXggKyAxIDogMFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdJbmRleCA9IHNlbGVjdGVkSW5kZXggLSAxID49IDAgPyBzZWxlY3RlZEluZGV4IC0gMSA6IG9wdGlvbnNMZW5ndGggLSAxXG5cdFx0fVxuXG5cdFx0dGhpcy5zZWxlY3RlZCA9IHRoaXMub3B0aW9ucygpW25ld0luZGV4XVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBzZWxlY3RTdWdnZXN0aW9uKGF0dHJzOiBHdWVzdFBpY2tlckF0dHJzKSB7XG5cdFx0aWYgKHRoaXMuc2VsZWN0ZWQgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuc2VsZWN0ZWQudmFsdWUudHlwZSA9PT0gXCJyZWNpcGllbnRcIikge1xuXHRcdFx0Y29uc3QgeyBhZGRyZXNzLCBuYW1lLCBjb250YWN0IH0gPSB0aGlzLnNlbGVjdGVkLnZhbHVlLnZhbHVlXG5cdFx0XHRhdHRycy5vblJlY2lwaWVudEFkZGVkKGFkZHJlc3MsIG5hbWUsIGNvbnRhY3QpXG5cdFx0XHRhdHRycy5zZWFyY2guY2xlYXIoKVxuXHRcdFx0dGhpcy52YWx1ZSA9IFwiXCJcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXR0cnMuc2VhcmNoLmNsZWFyKClcblx0XHRcdHRoaXMudmFsdWUgPSBcIlwiXG5cdFx0XHRjb25zdCByZWNpcGllbnRzID0gYXdhaXQgYXR0cnMuc2VhcmNoLnJlc29sdmVDb250YWN0TGlzdCh0aGlzLnNlbGVjdGVkLnZhbHVlLnZhbHVlKVxuXHRcdFx0Zm9yIChjb25zdCB7IGFkZHJlc3MsIG5hbWUsIGNvbnRhY3QgfSBvZiByZWNpcGllbnRzKSB7XG5cdFx0XHRcdGF0dHJzLm9uUmVjaXBpZW50QWRkZWQoYWRkcmVzcywgbmFtZSwgY29udGFjdClcblx0XHRcdH1cblx0XHRcdG0ucmVkcmF3KClcblx0XHR9XG5cblx0XHR0aGlzLmNsb3NlUGlja2VyKClcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyBhIHR5cGVkIGluIG1haWwgYWRkcmVzcyBvciBvbmUgb2YgdGhlIHN1Z2dlc3RlZCBvbmVzLlxuXHQgKiBAcGFyYW0gYXR0cnNcblx0ICogQHBhcmFtIHNlbGVjdFN1Z2dlc3Rpb24gYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgYSBzdWdnZXN0aW9uIHNob3VsZCBiZSBzZWxlY3RlZCBvciBub3QuIFNob3VsZCBiZSB0cnVlIGlmIGEgc3VnZ2VzdGlvbiBpcyBleHBsaWNpdGx5IHNlbGVjdGVkIGJ5XG5cdCAqIGZvciBleGFtcGxlIGhpdHRpbmcgdGhlIGVudGVyIGtleSBhbmQgZmFsc2UgZS5nLiBpZiB0aGUgZGlhbG9nIGlzIGNsb3NlZFxuXHQgKi9cblx0cHJpdmF0ZSByZXNvbHZlSW5wdXQoYXR0cnM6IEd1ZXN0UGlja2VyQXR0cnMsIHNlbGVjdFN1Z2dlc3Rpb246IGJvb2xlYW4pIHtcblx0XHRjb25zdCBzdWdnZXN0aW9ucyA9IGF0dHJzLnNlYXJjaC5yZXN1bHRzKClcblx0XHRpZiAoc3VnZ2VzdGlvbnMubGVuZ3RoID4gMCAmJiBzZWxlY3RTdWdnZXN0aW9uKSB7XG5cdFx0XHR0aGlzLnNlbGVjdFN1Z2dlc3Rpb24oYXR0cnMpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHBhcnNlZCA9IHBhcnNlTWFpbEFkZHJlc3ModGhpcy52YWx1ZSlcblx0XHRcdGlmIChwYXJzZWQgIT0gbnVsbCkge1xuXHRcdFx0XHRhdHRycy5vblJlY2lwaWVudEFkZGVkKHBhcnNlZC5hZGRyZXNzLCBwYXJzZWQubmFtZSwgbnVsbClcblx0XHRcdFx0dGhpcy52YWx1ZSA9IFwiXCJcblx0XHRcdFx0dGhpcy5jbG9zZVBpY2tlcigpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjbG9zZVBpY2tlcigpIHtcblx0XHRpZiAodGhpcy5zZWxlY3RET00pIHtcblx0XHRcdDsodGhpcy5zZWxlY3RET00uc3RhdGUgYXMgU2VsZWN0U3RhdGUpLmRyb3Bkb3duQ29udGFpbmVyPy5vbkNsb3NlKClcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDbGFzc0NvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBTaW5nbGVMaW5lVGV4dEZpZWxkIH0gZnJvbSBcIi4vYmFzZS9TaW5nbGVMaW5lVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IFRleHRGaWVsZFR5cGUgfSBmcm9tIFwiLi9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyBJY29uQnV0dG9uIH0gZnJvbSBcIi4vYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJ1dHRvblNpemUgfSBmcm9tIFwiLi9iYXNlL0J1dHRvblNpemUuanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4vdGhlbWUuanNcIlxuaW1wb3J0IHsgc2NhbGVUb1Zpc3VhbFBhc3N3b3JkU3RyZW5ndGggfSBmcm9tIFwiLi4vbWlzYy9wYXNzd29yZHMvUGFzc3dvcmRVdGlscy5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuL3NpemUuanNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcblxuZXhwb3J0IGludGVyZmFjZSBQYXNzd29yZElucHV0QXR0cmlidXRlcyB7XG5cdGFyaWFMYWJlbDogc3RyaW5nXG5cdHBhc3N3b3JkOiBzdHJpbmdcblx0c3RyZW5ndGg6IG51bWJlclxuXHRvbmlucHV0OiAobmV3VmFsdWU6IHN0cmluZykgPT4gdW5rbm93blxuXHRzaG93U3RyZW5ndGg/OiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBQYXNzd29yZElucHV0IGltcGxlbWVudHMgQ2xhc3NDb21wb25lbnQ8UGFzc3dvcmRJbnB1dEF0dHJpYnV0ZXM+IHtcblx0cHJpdmF0ZSBzaG93UGFzc3dvcmQ6IGJvb2xlYW4gPSBmYWxzZVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPFBhc3N3b3JkSW5wdXRBdHRyaWJ1dGVzLCB0aGlzPik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcIi5mbGV4LmZsZXgtZ3Jvdy5mdWxsLXdpZHRoLmp1c3RpZnktYmV0d2Vlbi5pdGVtcy1jZW50ZXIuZ2FwLXZwYWQtc1wiLCBbXG5cdFx0XHR2bm9kZS5hdHRycy5zaG93U3RyZW5ndGhcblx0XHRcdFx0PyBtKFwiZGl2XCIsIHtcblx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdHdpZHRoOiBweChzaXplLmljb25fc2l6ZV9tZWRpdW0pLFxuXHRcdFx0XHRcdFx0XHRoZWlnaHQ6IHB4KHNpemUuaWNvbl9zaXplX21lZGl1bSksXG5cdFx0XHRcdFx0XHRcdGJvcmRlcjogYDFweCBzb2xpZCAke3RoZW1lLmNvbnRlbnRfYnV0dG9ufWAsXG5cdFx0XHRcdFx0XHRcdGJvcmRlclJhZGl1czogXCI1MCVcIixcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogYGNvbmljLWdyYWRpZW50KGZyb20gLjI1dHVybiwgJHt0aGVtZS5jb250ZW50X2J1dHRvbn0gJHtzY2FsZVRvVmlzdWFsUGFzc3dvcmRTdHJlbmd0aChcblx0XHRcdFx0XHRcdFx0XHR2bm9kZS5hdHRycy5zdHJlbmd0aCxcblx0XHRcdFx0XHRcdFx0KX0lLCB0cmFuc3BhcmVudCAwJSlgLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRtKFNpbmdsZUxpbmVUZXh0RmllbGQsIHtcblx0XHRcdFx0Y2xhc3NlczogW1wiZmxleC1ncm93XCJdLFxuXHRcdFx0XHRhcmlhTGFiZWw6IHZub2RlLmF0dHJzLmFyaWFMYWJlbCxcblx0XHRcdFx0dHlwZTogdGhpcy5zaG93UGFzc3dvcmQgPyBUZXh0RmllbGRUeXBlLlRleHQgOiBUZXh0RmllbGRUeXBlLlBhc3N3b3JkLFxuXHRcdFx0XHR2YWx1ZTogdm5vZGUuYXR0cnMucGFzc3dvcmQsXG5cdFx0XHRcdG9uaW5wdXQ6IHZub2RlLmF0dHJzLm9uaW5wdXQsXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0cGFkZGluZzogYCR7cHgoc2l6ZS52cGFkX3hzbSl9ICR7cHgoc2l6ZS52cGFkX3NtYWxsKX1gLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRwbGFjZWhvbGRlcjogbGFuZy5nZXQoXCJwYXNzd29yZF9sYWJlbFwiKSxcblx0XHRcdH0pLFxuXHRcdFx0bShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0dGl0bGU6IHRoaXMuc2hvd1Bhc3N3b3JkID8gXCJjb25jZWFsUGFzc3dvcmRfYWN0aW9uXCIgOiBcInJldmVhbFBhc3N3b3JkX2FjdGlvblwiLFxuXHRcdFx0XHRpY29uOiB0aGlzLnNob3dQYXNzd29yZCA/IEljb25zLk5vRXllIDogSWNvbnMuRXllLFxuXHRcdFx0XHRjbGljazogKCkgPT4gKHRoaXMuc2hvd1Bhc3N3b3JkID0gIXRoaXMuc2hvd1Bhc3N3b3JkKSxcblx0XHRcdH0pLFxuXHRcdF0pXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENsYXNzQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcblxuZXhwb3J0IGludGVyZmFjZSBEaXZpZGVyQXR0cnMge1xuXHRjb2xvcjogc3RyaW5nXG5cdHN0eWxlPzogUGljazxDU1NTdHlsZURlY2xhcmF0aW9uLCBcIm1hcmdpblwiPlxufVxuXG5leHBvcnQgY2xhc3MgRGl2aWRlciBpbXBsZW1lbnRzIENsYXNzQ29tcG9uZW50PERpdmlkZXJBdHRycz4ge1xuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8RGl2aWRlckF0dHJzPikge1xuXHRcdHJldHVybiBtKFwiaHIubS0wLmJvcmRlci1ub25lLmZ1bGwtd2lkdGhcIiwge1xuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0aGVpZ2h0OiBcIjFweFwiLFxuXHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IGF0dHJzLmNvbG9yLFxuXHRcdFx0XHRjb2xvcjogYXR0cnMuY29sb3IsXG5cdFx0XHRcdC4uLmF0dHJzLnN0eWxlLFxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IFJlY2lwaWVudFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vcmVjaXBpZW50cy9SZWNpcGllbnQuanNcIlxuaW1wb3J0IHsgVG9nZ2xlQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9idXR0b25zL1RvZ2dsZUJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBJY29ucyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvaWNvbnMvSWNvbnMuanNcIlxuaW1wb3J0IHsgQnV0dG9uU2l6ZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uU2l6ZS5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IEFjY291bnRUeXBlLCBDYWxlbmRhckF0dGVuZGVlU3RhdHVzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IFJlY2lwaWVudHNTZWFyY2hNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9SZWNpcGllbnRzU2VhcmNoTW9kZWwuanNcIlxuaW1wb3J0IHsgR3Vlc3QgfSBmcm9tIFwiLi4vLi4vdmlldy9DYWxlbmRhckludml0ZXMuanNcIlxuaW1wb3J0IHsgSWNvbiwgSWNvblNpemUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb24uanNcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZS5qc1wiXG5pbXBvcnQgeyBJY29uQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckV2ZW50V2hvTW9kZWwgfSBmcm9tIFwiLi4vZXZlbnRlZGl0b3ItbW9kZWwvQ2FsZW5kYXJFdmVudFdob01vZGVsLmpzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL21haW4vTG9naW5Db250cm9sbGVyLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRNb2RlbCwgQ2FsZW5kYXJPcGVyYXRpb24gfSBmcm9tIFwiLi4vZXZlbnRlZGl0b3ItbW9kZWwvQ2FsZW5kYXJFdmVudE1vZGVsLmpzXCJcbmltcG9ydCB7IHNob3dQbGFuVXBncmFkZVJlcXVpcmVkRGlhbG9nIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9taXNjL1N1YnNjcmlwdGlvbkRpYWxvZ3MuanNcIlxuaW1wb3J0IHsgaGFzUGxhbldpdGhJbnZpdGVzIH0gZnJvbSBcIi4uL2V2ZW50ZWRpdG9yLW1vZGVsL0NhbGVuZGFyTm90aWZpY2F0aW9uTW9kZWwuanNcIlxuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9EaWFsb2cuanNcIlxuXG5pbXBvcnQgeyBBdHRlbmRpbmdJdGVtLCBjcmVhdGVBdHRlbmRpbmdJdGVtcywgaWNvbkZvckF0dGVuZGVlU3RhdHVzIH0gZnJvbSBcIi4uL0NhbGVuZGFyR3VpVXRpbHMuanNcIlxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQ2FyZC5qc1wiXG5pbXBvcnQgeyBTZWxlY3QsIFNlbGVjdEF0dHJpYnV0ZXMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1NlbGVjdC5qc1wiXG5pbXBvcnQgc3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBPcmdhbml6ZXJTZWxlY3RJdGVtIH0gZnJvbSBcIi4vQ2FsZW5kYXJFdmVudEVkaXRWaWV3LmpzXCJcbmltcG9ydCB7IEd1ZXN0UGlja2VyIH0gZnJvbSBcIi4uL3BpY2tlcnMvR3Vlc3RQaWNrZXIuanNcIlxuaW1wb3J0IHsgSWNvbk1lc3NhZ2VCb3ggfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0NvbHVtbkVtcHR5TWVzc2FnZUJveC5qc1wiXG5pbXBvcnQgeyBQYXNzd29yZElucHV0IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvUGFzc3dvcmRJbnB1dC5qc1wiXG5pbXBvcnQgeyBTd2l0Y2ggfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1N3aXRjaC5qc1wiXG5pbXBvcnQgeyBEaXZpZGVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvRGl2aWRlci5qc1wiXG5cbmV4cG9ydCB0eXBlIEF0dGVuZGVlTGlzdEVkaXRvckF0dHJzID0ge1xuXHQvKiogdGhlIGV2ZW50IHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIGVkaXRlZCAqL1xuXHRtb2RlbDogQ2FsZW5kYXJFdmVudE1vZGVsXG5cblx0LyoqIHRoZXNlIGFyZSBuZWVkZWQgdG8gc2hvdyBzdWdnZXN0aW9ucyBhbmQgZXh0ZXJuYWwgcGFzc3dvcmRzLiAqL1xuXHRyZWNpcGllbnRzU2VhcmNoOiBSZWNpcGllbnRzU2VhcmNoTW9kZWxcblx0bG9naW5zOiBMb2dpbkNvbnRyb2xsZXJcblx0d2lkdGg6IG51bWJlclxufVxuXG4vKipcbiAqIGFuIGVkaXRvciB0aGF0IGNhbiBlZGl0IHRoZSBhdHRlbmRlZXMgbGlzdCBvZiBhIGNhbGVuZGFyIGV2ZW50IHdpdGggc3VnZ2VzdGlvbnMsXG4gKiBpbmNsdWRpbmcgdGhlIG93biBhdHRlbmRhbmNlLCB0aGUgb3duIG9yZ2FuaXplciBhZGRyZXNzIGFuZCBleHRlcm5hbCBwYXNzd29yZHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdHRlbmRlZUxpc3RFZGl0b3IgaW1wbGVtZW50cyBDb21wb25lbnQ8QXR0ZW5kZWVMaXN0RWRpdG9yQXR0cnM+IHtcblx0cHJpdmF0ZSBoYXNQbGFuV2l0aEludml0ZXM6IGJvb2xlYW4gPSBmYWxzZVxuXG5cdHZpZXcoeyBhdHRycyB9OiBWbm9kZTxBdHRlbmRlZUxpc3RFZGl0b3JBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyB3aG9Nb2RlbCB9ID0gYXR0cnMubW9kZWwuZWRpdE1vZGVsc1xuXHRcdGNvbnN0IG9yZ2FuaXplciA9IHdob01vZGVsLm9yZ2FuaXplclxuXHRcdHJldHVybiBbXG5cdFx0XHRtKFwiLmZsZXgtZ3Jvdy5mbGV4LmZsZXgtY29sdW1uLmdhcC12cGFkLnBiLnB0LmZpdC1oZWlnaHRcIiwgeyBzdHlsZTogeyB3aWR0aDogcHgoYXR0cnMud2lkdGgpIH0gfSwgW1xuXHRcdFx0XHR0aGlzLnJlbmRlck9yZ2FuaXplcihhdHRycy5tb2RlbCwgb3JnYW5pemVyKSxcblx0XHRcdFx0bShcIi5mbGV4LmZsZXgtY29sdW1uLmdhcC12cGFkLXNcIiwgW1xuXHRcdFx0XHRcdG0oXCJzbWFsbC51cHBlcmNhc2UuYi50ZXh0LWVsbGlwc2lzXCIsIHsgc3R5bGU6IHsgY29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uIH0gfSwgbGFuZy5nZXQoXCJndWVzdHNfbGFiZWxcIikpLFxuXHRcdFx0XHRcdHdob01vZGVsLmNhbk1vZGlmeUd1ZXN0cyA/IHRoaXMucmVuZGVyR3Vlc3RzSW5wdXQod2hvTW9kZWwsIGF0dHJzLmxvZ2lucywgYXR0cnMucmVjaXBpZW50c1NlYXJjaCkgOiBudWxsLFxuXHRcdFx0XHRcdHRoaXMucmVuZGVyU2VuZFVwZGF0ZUNoZWNrYm94KGF0dHJzLm1vZGVsLmVkaXRNb2RlbHMud2hvTW9kZWwpLFxuXHRcdFx0XHRcdHRoaXMucmVuZGVyR3Vlc3RMaXN0KGF0dHJzLCBvcmdhbml6ZXIpLFxuXHRcdFx0XHRdKSxcblx0XHRcdF0pLFxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyR3Vlc3RMaXN0KGF0dHJzOiBBdHRlbmRlZUxpc3RFZGl0b3JBdHRycywgb3JnYW5pemVyOiBHdWVzdCB8IG51bGwpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyB3aG9Nb2RlbCB9ID0gYXR0cnMubW9kZWwuZWRpdE1vZGVsc1xuXHRcdGNvbnN0IGd1ZXN0SXRlbXM6ICgoKSA9PiBDaGlsZHJlbilbXSA9IFtdXG5cblx0XHRmb3IgKGNvbnN0IGd1ZXN0IG9mIHdob01vZGVsLmd1ZXN0cykge1xuXHRcdFx0bGV0IHBhc3N3b3JkOiBzdHJpbmdcblx0XHRcdGxldCBzdHJlbmd0aDogbnVtYmVyXG5cblx0XHRcdGlmIChndWVzdC50eXBlID09PSBSZWNpcGllbnRUeXBlLkVYVEVSTkFMKSB7XG5cdFx0XHRcdGNvbnN0IHByZXNoYXJlZFBhc3N3b3JkID0gd2hvTW9kZWwuZ2V0UHJlc2hhcmVkUGFzc3dvcmQoZ3Vlc3QuYWRkcmVzcylcblx0XHRcdFx0cGFzc3dvcmQgPSBwcmVzaGFyZWRQYXNzd29yZC5wYXNzd29yZFxuXHRcdFx0XHRzdHJlbmd0aCA9IHByZXNoYXJlZFBhc3N3b3JkLnN0cmVuZ3RoXG5cdFx0XHR9XG5cblx0XHRcdGd1ZXN0SXRlbXMucHVzaCgoKSA9PiB0aGlzLnJlbmRlckd1ZXN0KGd1ZXN0LCBhdHRycywgcGFzc3dvcmQsIHN0cmVuZ3RoKSlcblx0XHR9XG5cblx0XHQvLyBvd25HdWVzdCBpcyBuZXZlciBpbiB0aGUgZ3Vlc3QgbGlzdCwgYnV0IGl0IG1heSBiZSBpZGVudGljYWwgdG8gb3JnYW5pemVyLlxuXHRcdGNvbnN0IG93bkd1ZXN0ID0gd2hvTW9kZWwub3duR3Vlc3Rcblx0XHRpZiAob3duR3Vlc3QgIT0gbnVsbCAmJiBvd25HdWVzdC5hZGRyZXNzICE9PSBvcmdhbml6ZXI/LmFkZHJlc3MpIHtcblx0XHRcdGd1ZXN0SXRlbXMucHVzaCgoKSA9PiB0aGlzLnJlbmRlckd1ZXN0KG93bkd1ZXN0LCBhdHRycykpXG5cdFx0fVxuXG5cdFx0Y29uc3QgdmVydGljYWxQYWRkaW5nID0gZ3Vlc3RJdGVtcy5sZW5ndGggPiAwID8gc2l6ZS52cGFkX3NtYWxsIDogMFxuXG5cdFx0cmV0dXJuIGd1ZXN0SXRlbXMubGVuZ3RoID09PSAwXG5cdFx0XHQ/IG0oXG5cdFx0XHRcdFx0Q2FyZCxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjbGFzc2VzOiBbXCJtaW4taC1zIGZsZXggZmxleC1jb2x1bW4gZ2FwLXZwYWQtc1wiXSxcblx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdHBhZGRpbmc6IGAke3B4KHZlcnRpY2FsUGFkZGluZyl9ICR7cHgoZ3Vlc3RJdGVtcy5sZW5ndGggPT09IDAgPyBzaXplLnZwYWRfc21hbGwgOiAwKX0gJHtweChzaXplLnZwYWRfc21hbGwpfSAke3B4KFxuXHRcdFx0XHRcdFx0XHRcdHZlcnRpY2FsUGFkZGluZyxcblx0XHRcdFx0XHRcdFx0KX1gLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG0oXCIuZmxleC5pdGVtcy1jZW50ZXIuanVzdGlmeS1jZW50ZXIubWluLWgtc1wiLCBbXG5cdFx0XHRcdFx0XHRtKEljb25NZXNzYWdlQm94LCB7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IFwibm9FbnRyaWVzX21zZ1wiLFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5QZW9wbGUsXG5cdFx0XHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5saXN0X21lc3NhZ2VfYmcsXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRdKSxcblx0XHRcdCAgKVxuXHRcdFx0OiBndWVzdEl0ZW1zLm1hcCgociwgaW5kZXgpID0+IHIoKSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyR3Vlc3RzSW5wdXQod2hvTW9kZWw6IENhbGVuZGFyRXZlbnRXaG9Nb2RlbCwgbG9naW5zOiBMb2dpbkNvbnRyb2xsZXIsIHJlY2lwaWVudHNTZWFyY2g6IFJlY2lwaWVudHNTZWFyY2hNb2RlbCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCBndWVzdHMgPSB3aG9Nb2RlbC5ndWVzdHNcblx0XHRjb25zdCBoYXNFeHRlcm5hbEd1ZXN0cyA9IGd1ZXN0cy5zb21lKChhKSA9PiBhLnR5cGUgPT09IFJlY2lwaWVudFR5cGUuRVhURVJOQUwpXG5cblx0XHRyZXR1cm4gbShcIi5mbGV4Lml0ZW1zLWNlbnRlci5mbGV4LWdyb3cuZ2FwLXZwYWQtc1wiLCBbXG5cdFx0XHRtKENhcmQsIHsgc3R5bGU6IHsgcGFkZGluZzogXCIwXCIgfSwgY2xhc3NlczogW1wiZmxleC1ncm93XCJdIH0sIFtcblx0XHRcdFx0bShcIi5mbGV4LmZsZXgtZ3Jvdy5yZWwuYnV0dG9uLWhlaWdodFwiLCBbXG5cdFx0XHRcdFx0bShHdWVzdFBpY2tlciwge1xuXHRcdFx0XHRcdFx0YXJpYUxhYmVsOiBcImFkZEd1ZXN0X2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRcdFx0XHRvblJlY2lwaWVudEFkZGVkOiBhc3luYyAoYWRkcmVzcywgbmFtZSwgY29udGFjdCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoIShhd2FpdCBoYXNQbGFuV2l0aEludml0ZXMobG9naW5zKSkgJiYgIXRoaXMuaGFzUGxhbldpdGhJbnZpdGVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIuYWNjb3VudFR5cGUgPT09IEFjY291bnRUeXBlLkVYVEVSTkFMKSByZXR1cm5cblx0XHRcdFx0XHRcdFx0XHRpZiAobG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkuaXNHbG9iYWxBZG1pbigpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB7IGdldEF2YWlsYWJsZVBsYW5zV2l0aEV2ZW50SW52aXRlcyB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vLi4vY29tbW9uL3N1YnNjcmlwdGlvbi9TdWJzY3JpcHRpb25VdGlscy5qc1wiKVxuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgcGxhbnNXaXRoRXZlbnRJbnZpdGVzID0gYXdhaXQgZ2V0QXZhaWxhYmxlUGxhbnNXaXRoRXZlbnRJbnZpdGVzKClcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChwbGFuc1dpdGhFdmVudEludml0ZXMubGVuZ3RoID09PSAwKSByZXR1cm5cblx0XHRcdFx0XHRcdFx0XHRcdC8vZW50aXR5IGV2ZW50IHVwZGF0ZXMgYXJlIHRvbyBzbG93IHRvIGNhbGwgdXBkYXRlQnVzaW5lc3NGZWF0dXJlKClcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuaGFzUGxhbldpdGhJbnZpdGVzID0gYXdhaXQgc2hvd1BsYW5VcGdyYWRlUmVxdWlyZWREaWFsb2cocGxhbnNXaXRoRXZlbnRJbnZpdGVzKVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gdGhlIHVzZXIgY291bGQgaGF2ZSwgYnV0IGRpZCBub3QgdXBncmFkZS5cblx0XHRcdFx0XHRcdFx0XHRcdGlmICghdGhpcy5oYXNQbGFuV2l0aEludml0ZXMpIHJldHVyblxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHREaWFsb2cubWVzc2FnZShcImNvbnRhY3RBZG1pbl9tc2dcIilcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0d2hvTW9kZWwuYWRkQXR0ZW5kZWUoYWRkcmVzcywgY29udGFjdClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHNlYXJjaDogcmVjaXBpZW50c1NlYXJjaCxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XSksXG5cdFx0XHRdKSxcblx0XHRcdGhhc0V4dGVybmFsR3Vlc3RzXG5cdFx0XHRcdD8gbShcblx0XHRcdFx0XHRcdENhcmQsXG5cdFx0XHRcdFx0XHR7IHN0eWxlOiB7IHBhZGRpbmc6IFwiMFwiIH0gfSxcblx0XHRcdFx0XHRcdG0oVG9nZ2xlQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBcImNvbmZpZGVudGlhbF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0b25Ub2dnbGVkOiAoXywgZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHdob01vZGVsLmlzQ29uZmlkZW50aWFsID0gIXdob01vZGVsLmlzQ29uZmlkZW50aWFsXG5cdFx0XHRcdFx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRpY29uOiB3aG9Nb2RlbC5pc0NvbmZpZGVudGlhbCA/IEljb25zLkxvY2sgOiBJY29ucy5VbmxvY2ssXG5cdFx0XHRcdFx0XHRcdHRvZ2dsZWQ6IHdob01vZGVsLmlzQ29uZmlkZW50aWFsLFxuXHRcdFx0XHRcdFx0XHRzaXplOiBCdXR0b25TaXplLk5vcm1hbCxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQgIClcblx0XHRcdFx0OiBudWxsLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckF0dGVuZGVlU3RhdHVzKG1vZGVsOiBDYWxlbmRhckV2ZW50V2hvTW9kZWwsIG9yZ2FuaXplcjogR3Vlc3QgfCBudWxsKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgc3RhdHVzIH0gPSBvcmdhbml6ZXIgPz8geyBzdGF0dXM6IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuVEVOVEFUSVZFIH1cblxuXHRcdGNvbnN0IGF0dGVuZGluZ09wdGlvbnMgPSBjcmVhdGVBdHRlbmRpbmdJdGVtcygpLmZpbHRlcigob3B0aW9uKSA9PiBvcHRpb24uc2VsZWN0YWJsZSAhPT0gZmFsc2UpXG5cdFx0Y29uc3QgYXR0ZW5kaW5nU3RhdHVzID0gYXR0ZW5kaW5nT3B0aW9ucy5maW5kKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gc3RhdHVzKVxuXG5cdFx0cmV0dXJuIG0oXCIuZmxleC5mbGV4LWNvbHVtbi5wbC12cGFkLXMucHItdnBhZC1zXCIsIFtcblx0XHRcdG0oU2VsZWN0PEF0dGVuZGluZ0l0ZW0sIENhbGVuZGFyQXR0ZW5kZWVTdGF0dXM+LCB7XG5cdFx0XHRcdG9uY2hhbmdlOiAob3B0aW9uKSA9PiB7XG5cdFx0XHRcdFx0aWYgKG9wdGlvbi5zZWxlY3RhYmxlID09PSBmYWxzZSkgcmV0dXJuXG5cdFx0XHRcdFx0bW9kZWwuc2V0T3duQXR0ZW5kYW5jZShvcHRpb24udmFsdWUpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGNsYXNzZXM6IFtcImJ1dHRvbi1taW4taGVpZ2h0XCJdLFxuXHRcdFx0XHRzZWxlY3RlZDogYXR0ZW5kaW5nU3RhdHVzLFxuXHRcdFx0XHRkaXNhYmxlZDogb3JnYW5pemVyID09IG51bGwsXG5cdFx0XHRcdGFyaWFMYWJlbDogbGFuZy5nZXQoXCJhdHRlbmRpbmdfbGFiZWxcIiksXG5cdFx0XHRcdHJlbmRlck9wdGlvbjogKG9wdGlvbikgPT5cblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCJidXR0b24uaXRlbXMtY2VudGVyLmZsZXgtZ3Jvdy5zdGF0ZS1iZy5idXR0b24tY29udGVudC5kcm9wZG93bi1idXR0b24ucHQtcy5wYi1zLmJ1dHRvbi1taW4taGVpZ2h0XCIsXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNsYXNzOiBvcHRpb24uc2VsZWN0YWJsZSA9PT0gZmFsc2UgPyBgbm8taG92ZXJgIDogXCJcIixcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHsgY29sb3I6IG9wdGlvbi52YWx1ZSA9PT0gc3RhdHVzID8gdGhlbWUuY29udGVudF9idXR0b25fc2VsZWN0ZWQgOiB1bmRlZmluZWQgfSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRvcHRpb24ubmFtZSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRyZW5kZXJEaXNwbGF5OiAob3B0aW9uKSA9PiBtKFwiXCIsIG9wdGlvbi5uYW1lKSxcblx0XHRcdFx0b3B0aW9uczogc3RyZWFtKGF0dGVuZGluZ09wdGlvbnMpLFxuXHRcdFx0XHRleHBhbmRlZDogdHJ1ZSxcblx0XHRcdFx0bm9JY29uOiBvcmdhbml6ZXIgPT0gbnVsbCxcblx0XHRcdH0gc2F0aXNmaWVzIFNlbGVjdEF0dHJpYnV0ZXM8QXR0ZW5kaW5nSXRlbSwgQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cz4pLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlck9yZ2FuaXplcihtb2RlbDogQ2FsZW5kYXJFdmVudE1vZGVsLCBvcmdhbml6ZXI6IEd1ZXN0IHwgbnVsbCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHdob01vZGVsIH0gPSBtb2RlbC5lZGl0TW9kZWxzXG5cblx0XHRpZiAoISh3aG9Nb2RlbC5wb3NzaWJsZU9yZ2FuaXplcnMubGVuZ3RoID4gMCB8fCBvcmdhbml6ZXIpKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIlRyeWluZyB0byBhY2Nlc3MgZ3Vlc3Qgd2l0aG91dCBvcmdhbml6ZXJcIilcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0Y29uc3QgeyBhZGRyZXNzLCBuYW1lLCBzdGF0dXMgfSA9IG9yZ2FuaXplciA/PyB7fVxuXHRcdGNvbnN0IGhhc0d1ZXN0ID0gd2hvTW9kZWwuZ3Vlc3RzLmxlbmd0aCA+IDBcblx0XHRjb25zdCBpc01lID0gb3JnYW5pemVyPy5hZGRyZXNzID09PSB3aG9Nb2RlbC5vd25HdWVzdD8uYWRkcmVzc1xuXHRcdGNvbnN0IGVkaXRhYmxlT3JnYW5pemVyID0gd2hvTW9kZWwucG9zc2libGVPcmdhbml6ZXJzLmxlbmd0aCA+IDEgJiYgaXNNZVxuXG5cdFx0Y29uc3Qgb3B0aW9ucyA9IHdob01vZGVsLnBvc3NpYmxlT3JnYW5pemVycy5tYXAoKG9yZ2FuaXplcikgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bmFtZTogb3JnYW5pemVyLm5hbWUsXG5cdFx0XHRcdGFkZHJlc3M6IG9yZ2FuaXplci5hZGRyZXNzLFxuXHRcdFx0XHRhcmlhVmFsdWU6IG9yZ2FuaXplci5hZGRyZXNzLFxuXHRcdFx0XHR2YWx1ZTogb3JnYW5pemVyLmFkZHJlc3MsXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGNvbnN0IGRpc2FibGVkID0gIWVkaXRhYmxlT3JnYW5pemVyIHx8ICFoYXNHdWVzdFxuXHRcdGNvbnN0IHNlbGVjdGVkID0gb3B0aW9ucy5maW5kKChvcHRpb24pID0+IG9wdGlvbi5hZGRyZXNzID09PSBhZGRyZXNzKSA/PyBvcHRpb25zWzBdXG5cblx0XHRyZXR1cm4gbShcIi5mbGV4LmNvbFwiLCBbXG5cdFx0XHRtKFwic21hbGwudXBwZXJjYXNlLnBiLXMuYi50ZXh0LWVsbGlwc2lzXCIsIHsgc3R5bGU6IHsgY29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uIH0gfSwgbGFuZy5nZXQoXCJvcmdhbml6ZXJfbGFiZWxcIikpLFxuXHRcdFx0bShDYXJkLCB7IHN0eWxlOiB7IHBhZGRpbmc6IGAwYCB9IH0sIFtcblx0XHRcdFx0bShcIi5mbGV4LmZsZXgtY29sdW1uXCIsIFtcblx0XHRcdFx0XHRtKFwiLmZsZXgucGwtdnBhZC1zLnByLXZwYWQtc1wiLCBbXG5cdFx0XHRcdFx0XHRtKFNlbGVjdDxPcmdhbml6ZXJTZWxlY3RJdGVtLCBzdHJpbmc+LCB7XG5cdFx0XHRcdFx0XHRcdGNsYXNzZXM6IFtcImZsZXgtZ3Jvd1wiLCBcImJ1dHRvbi1taW4taGVpZ2h0XCJdLFxuXHRcdFx0XHRcdFx0XHRvbmNoYW5nZTogKG9wdGlvbikgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9yZ2FuaXplciA9IHdob01vZGVsLnBvc3NpYmxlT3JnYW5pemVycy5maW5kKChvcmdhbml6ZXIpID0+IG9yZ2FuaXplci5hZGRyZXNzID09PSBvcHRpb24uYWRkcmVzcylcblx0XHRcdFx0XHRcdFx0XHRpZiAob3JnYW5pemVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR3aG9Nb2RlbC5hZGRBdHRlbmRlZShvcmdhbml6ZXIuYWRkcmVzcywgbnVsbClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkLFxuXHRcdFx0XHRcdFx0XHRkaXNhYmxlZCxcblx0XHRcdFx0XHRcdFx0YXJpYUxhYmVsOiBsYW5nLmdldChcIm9yZ2FuaXplcl9sYWJlbFwiKSxcblx0XHRcdFx0XHRcdFx0cmVuZGVyT3B0aW9uOiAob3B0aW9uKSA9PlxuXHRcdFx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFx0XHRcImJ1dHRvbi5pdGVtcy1jZW50ZXIuZmxleC1ncm93LnN0YXRlLWJnLmJ1dHRvbi1jb250ZW50LmRyb3Bkb3duLWJ1dHRvbi5wdC1zLnBiLXMuYnV0dG9uLW1pbi1oZWlnaHRcIixcblx0XHRcdFx0XHRcdFx0XHRcdHsgc3R5bGU6IHsgY29sb3I6IHNlbGVjdGVkLmFkZHJlc3MgPT09IG9wdGlvbi5hZGRyZXNzID8gdGhlbWUuY29udGVudF9idXR0b25fc2VsZWN0ZWQgOiB1bmRlZmluZWQgfSB9LFxuXHRcdFx0XHRcdFx0XHRcdFx0b3B0aW9uLmFkZHJlc3MsXG5cdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0cmVuZGVyRGlzcGxheTogKG9wdGlvbikgPT4gbShcIlwiLCBvcHRpb24ubmFtZSA/IGAke29wdGlvbi5uYW1lfSA8JHtvcHRpb24uYWRkcmVzc30+YCA6IG9wdGlvbi5hZGRyZXNzKSxcblx0XHRcdFx0XHRcdFx0b3B0aW9uczogc3RyZWFtKFxuXHRcdFx0XHRcdFx0XHRcdHdob01vZGVsLnBvc3NpYmxlT3JnYW5pemVycy5tYXAoKG9yZ2FuaXplcikgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZTogb3JnYW5pemVyLm5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFkZHJlc3M6IG9yZ2FuaXplci5hZGRyZXNzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhcmlhVmFsdWU6IG9yZ2FuaXplci5hZGRyZXNzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogb3JnYW5pemVyLmFkZHJlc3MsXG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdG5vSWNvbjogZGlzYWJsZWQsXG5cdFx0XHRcdFx0XHRcdGV4cGFuZGVkOiB0cnVlLFxuXHRcdFx0XHRcdFx0fSBzYXRpc2ZpZXMgU2VsZWN0QXR0cmlidXRlczxPcmdhbml6ZXJTZWxlY3RJdGVtLCBzdHJpbmc+KSxcblx0XHRcdFx0XHRcdG1vZGVsLm9wZXJhdGlvbiAhPT0gQ2FsZW5kYXJPcGVyYXRpb24uRWRpdFRoaXMgJiYgb3JnYW5pemVyICYmICFpc01lXG5cdFx0XHRcdFx0XHRcdD8gbShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogXCJzZW5kTWFpbF9hbHRcIixcblx0XHRcdFx0XHRcdFx0XHRcdGNsaWNrOiBhc3luYyAoKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQoYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vLi4vbWFpbC1hcHAvY29udGFjdHMvdmlldy9Db250YWN0Vmlldy5qc1wiKSkud3JpdGVNYWlsKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9yZ2FuaXplcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYW5nLmdldChcInJlcGxpZWRUb0V2ZW50SW52aXRlX21zZ1wiLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcIntldmVudH1cIjogbW9kZWwuZWRpdE1vZGVscy5zdW1tYXJ5LmNvbnRlbnQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0XHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5QZW5jaWxTcXVhcmUsXG5cdFx0XHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHRcdGlzTWUgJiYgbW9kZWwub3BlcmF0aW9uICE9PSBDYWxlbmRhck9wZXJhdGlvbi5FZGl0VGhpc1xuXHRcdFx0XHRcdFx0PyBbbShEaXZpZGVyLCB7IGNvbG9yOiB0aGVtZS5idXR0b25fYnViYmxlX2JnIH0pLCB0aGlzLnJlbmRlckF0dGVuZGVlU3RhdHVzKHdob01vZGVsLCBvcmdhbml6ZXIpXVxuXHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRdKSxcblx0XHRcdF0pLFxuXHRcdF0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclNlbmRVcGRhdGVDaGVja2JveCh3aG9Nb2RlbDogQ2FsZW5kYXJFdmVudFdob01vZGVsKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiAhd2hvTW9kZWwuaW5pdGlhbGx5SGFkT3RoZXJBdHRlbmRlZXMgfHwgIXdob01vZGVsLmNhbk1vZGlmeUd1ZXN0c1xuXHRcdFx0PyBudWxsXG5cdFx0XHQ6IG0oXG5cdFx0XHRcdFx0Q2FyZCxcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0U3dpdGNoLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjaGVja2VkOiB3aG9Nb2RlbC5zaG91bGRTZW5kVXBkYXRlcyxcblx0XHRcdFx0XHRcdFx0b25jbGljazogKHZhbHVlKSA9PiAod2hvTW9kZWwuc2hvdWxkU2VuZFVwZGF0ZXMgPSB2YWx1ZSksXG5cdFx0XHRcdFx0XHRcdGFyaWFMYWJlbDogbGFuZy5nZXQoXCJzZW5kVXBkYXRlc19sYWJlbFwiKSxcblx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHR2YXJpYW50OiBcImV4cGFuZGVkXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bGFuZy5nZXQoXCJzZW5kVXBkYXRlc19sYWJlbFwiKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0ICApXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckd1ZXN0KGd1ZXN0OiBHdWVzdCwgeyBtb2RlbCB9OiBQaWNrPEF0dGVuZGVlTGlzdEVkaXRvckF0dHJzLCBcIm1vZGVsXCI+LCBwYXNzd29yZD86IHN0cmluZywgc3RyZW5ndGg/OiBudW1iZXIpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyB3aG9Nb2RlbCB9ID0gbW9kZWwuZWRpdE1vZGVsc1xuXHRcdGNvbnN0IHsgYWRkcmVzcywgbmFtZSwgc3RhdHVzIH0gPSBndWVzdFxuXHRcdGNvbnN0IGlzTWUgPSBndWVzdC5hZGRyZXNzID09PSB3aG9Nb2RlbC5vd25HdWVzdD8uYWRkcmVzc1xuXHRcdGNvbnN0IHJvbGVMYWJlbCA9IGlzTWUgPyBgJHtsYW5nLmdldChcImd1ZXN0X2xhYmVsXCIpfSB8ICR7bGFuZy5nZXQoXCJ5b3VfbGFiZWxcIil9YCA6IGxhbmcuZ2V0KFwiZ3Vlc3RfbGFiZWxcIilcblx0XHRjb25zdCByZW5kZXJQYXNzd29yZEZpZWxkID0gd2hvTW9kZWwuaXNDb25maWRlbnRpYWwgJiYgcGFzc3dvcmQgIT0gbnVsbCAmJiBndWVzdC50eXBlID09PSBSZWNpcGllbnRUeXBlLkVYVEVSTkFMXG5cblx0XHRsZXQgcmlnaHRDb250ZW50OiBDaGlsZHJlbiA9IG51bGxcblxuXHRcdGlmIChpc01lKSB7XG5cdFx0XHRyaWdodENvbnRlbnQgPSBtKFwiXCIsIHsgc3R5bGU6IHsgcGFkZGluZ1JpZ2h0OiBweChzaXplLnZwYWRfc21hbGwpIH0gfSwgdGhpcy5yZW5kZXJBdHRlbmRlZVN0YXR1cyhtb2RlbC5lZGl0TW9kZWxzLndob01vZGVsLCBndWVzdCkpXG5cdFx0fSBlbHNlIGlmICh3aG9Nb2RlbC5jYW5Nb2RpZnlHdWVzdHMpIHtcblx0XHRcdHJpZ2h0Q29udGVudCA9IG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHR0aXRsZTogXCJyZW1vdmVfYWN0aW9uXCIsXG5cdFx0XHRcdGljb246IEljb25zLkNhbmNlbCxcblx0XHRcdFx0Y2xpY2s6ICgpID0+IHdob01vZGVsLnJlbW92ZUF0dGVuZGVlKGd1ZXN0LmFkZHJlc3MpLFxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRyZXR1cm4gbShcblx0XHRcdENhcmQsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0cGFkZGluZzogYCR7cHgoc2l6ZS52cGFkX3NtYWxsKX0gJHtweCgwKX0gJHtweChzaXplLnZwYWRfc21hbGwpfSAke3B4KHNpemUudnBhZF9zbWFsbCl9YCxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRtKFwiLmZsZXguZmxleC1jb2x1bW4uaXRlbXMtY2VudGVyXCIsIFtcblx0XHRcdFx0bShcIi5mbGV4Lml0ZW1zLWNlbnRlci5mbGV4LWdyb3cuZnVsbC13aWR0aFwiLCBbXG5cdFx0XHRcdFx0dGhpcy5yZW5kZXJTdGF0dXNJY29uKHN0YXR1cyksXG5cdFx0XHRcdFx0bShcIi5mbGV4LmZsZXgtY29sdW1uLmZsZXgtZ3Jvdy5taW4td2lkdGgtMFwiLCBbXG5cdFx0XHRcdFx0XHRtKFwiLnNtYWxsXCIsIHsgc3R5bGU6IHsgbGluZUhlaWdodDogcHgoc2l6ZS52cGFkX3NtYWxsKSB9IH0sIHJvbGVMYWJlbCksXG5cdFx0XHRcdFx0XHRtKFwiLnRleHQtZWxsaXBzaXNcIiwgbmFtZS5sZW5ndGggPiAwID8gYCR7bmFtZX0gJHthZGRyZXNzfWAgOiBhZGRyZXNzKSxcblx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRyaWdodENvbnRlbnQsXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRyZW5kZXJQYXNzd29yZEZpZWxkXG5cdFx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFx0XCIuZmxleC5mdWxsLXdpZHRoXCIsXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cGFkZGluZzogYDAgMCAke3B4KHNpemUudnBhZF94c20pfSAke3B4KHNpemUudnBhZF9zbWFsbCArIHNpemUuaWNvbl9zaXplX21lZGl1bV9sYXJnZSl9YCxcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRtKERpdmlkZXIsIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5idXR0b25fYnViYmxlX2JnLFxuXHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlbmRlclBhc3N3b3JkRmllbGQoYWRkcmVzcywgcGFzc3dvcmQsIHN0cmVuZ3RoID8/IDAsIHdob01vZGVsKSxcblx0XHRcdFx0XHQgIF1cblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRdKSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclBhc3N3b3JkRmllbGQoYWRkcmVzczogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBzdHJlbmd0aDogbnVtYmVyLCB3aG9Nb2RlbDogQ2FsZW5kYXJFdmVudFdob01vZGVsKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGxhYmVsID0gbGFuZy5nZXQoXCJwYXNzd29yZEZvcl9sYWJlbFwiLCB7XG5cdFx0XHRcInsxfVwiOiBhZGRyZXNzLFxuXHRcdH0pXG5cdFx0cmV0dXJuIFtcblx0XHRcdG0oXCIuZmxleC5mbGV4LWdyb3cuZnVsbC13aWR0aC5qdXN0aWZ5LWJldHdlZW4uaXRlbXMtZW5kXCIsIFtcblx0XHRcdFx0bShcblx0XHRcdFx0XHRcIi5mbGV4LmZsZXgtY29sdW1uLmZ1bGwtd2lkdGhcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRwYWRkaW5nTGVmdDogcHgoc2l6ZS5ocGFkX21lZGl1bSArIHNpemUudnBhZF9zbWFsbCksXG5cdFx0XHRcdFx0XHRcdHBhZGRpbmdSaWdodDogcHgoKHNpemUuYnV0dG9uX2hlaWdodCAtIHNpemUuYnV0dG9uX2hlaWdodF9jb21wYWN0KSAvIDIpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdG0oUGFzc3dvcmRJbnB1dCwge1xuXHRcdFx0XHRcdFx0XHRhcmlhTGFiZWw6IGxhYmVsLFxuXHRcdFx0XHRcdFx0XHRwYXNzd29yZCxcblx0XHRcdFx0XHRcdFx0c3RyZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG9uaW5wdXQ6IChuZXdQYXNzd29yZCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHdob01vZGVsLnNldFByZXNoYXJlZFBhc3N3b3JkKGFkZHJlc3MsIG5ld1Bhc3N3b3JkKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0KSxcblx0XHRcdF0pLFxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU3RhdHVzSWNvbihzdGF0dXM6IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgaWNvbiA9IGljb25Gb3JBdHRlbmRlZVN0YXR1c1tzdGF0dXNdXG5cdFx0cmV0dXJuIG0oSWNvbiwge1xuXHRcdFx0aWNvbixcblx0XHRcdHNpemU6IEljb25TaXplLkxhcmdlLFxuXHRcdFx0Y2xhc3M6IFwibXItc1wiLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9mZyxcblx0XHRcdH0sXG5cdFx0fSlcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBUZXh0RmllbGRUeXBlIGFzIFRleHRGaWVsZFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL3RoZW1lLmpzXCJcbmltcG9ydCB7IFRhYkluZGV4LCBUaW1lRm9ybWF0IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IHRpbWVTdHJpbmdGcm9tUGFydHMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvRm9ybWF0dGVyLmpzXCJcbmltcG9ydCB7IFRpbWUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2NhbGVuZGFyL2RhdGUvVGltZS5qc1wiXG5pbXBvcnQgeyBTZWxlY3QsIFNlbGVjdEF0dHJpYnV0ZXMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1NlbGVjdC5qc1wiXG5pbXBvcnQgeyBTaW5nbGVMaW5lVGV4dEZpZWxkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9TaW5nbGVMaW5lVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IGlzQXBwIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0Vudi5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuXG5leHBvcnQgdHlwZSBUaW1lUGlja2VyQXR0cnMgPSB7XG5cdHRpbWU6IFRpbWUgfCBudWxsXG5cdG9uVGltZVNlbGVjdGVkOiAoYXJnMDogVGltZSB8IG51bGwpID0+IHVua25vd25cblx0dGltZUZvcm1hdDogVGltZUZvcm1hdFxuXHRkaXNhYmxlZD86IGJvb2xlYW5cblx0YXJpYUxhYmVsOiBzdHJpbmdcblx0Y2xhc3Nlcz86IEFycmF5PHN0cmluZz5cbn1cblxuaW50ZXJmYWNlIFRpbWVPcHRpb24ge1xuXHR2YWx1ZTogc3RyaW5nXG5cdGFyaWFWYWx1ZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgVGltZVBpY2tlciBpbXBsZW1lbnRzIENvbXBvbmVudDxUaW1lUGlja2VyQXR0cnM+IHtcblx0cHJpdmF0ZSB2YWx1ZXM6IFJlYWRvbmx5QXJyYXk8c3RyaW5nPlxuXHRwcml2YXRlIGZvY3VzZWQ6IGJvb2xlYW5cblx0cHJpdmF0ZSBpc0V4cGFuZGVkOiBib29sZWFuID0gZmFsc2Vcblx0cHJpdmF0ZSBvbGRWYWx1ZTogc3RyaW5nXG5cdHByaXZhdGUgdmFsdWU6IHN0cmluZ1xuXHRwcml2YXRlIHJlYWRvbmx5IGFtUG06IGJvb2xlYW5cblxuXHRjb25zdHJ1Y3Rvcih7IGF0dHJzIH06IFZub2RlPFRpbWVQaWNrZXJBdHRycz4pIHtcblx0XHR0aGlzLmZvY3VzZWQgPSBmYWxzZVxuXHRcdHRoaXMudmFsdWUgPSBcIlwiXG5cdFx0dGhpcy5hbVBtID0gYXR0cnMudGltZUZvcm1hdCA9PT0gVGltZUZvcm1hdC5UV0VMVkVfSE9VUlNcblx0XHRjb25zdCB0aW1lczogc3RyaW5nW10gPSBbXVxuXG5cdFx0Zm9yIChsZXQgaG91ciA9IDA7IGhvdXIgPCAyNDsgaG91cisrKSB7XG5cdFx0XHRmb3IgKGxldCBtaW51dGUgPSAwOyBtaW51dGUgPCA2MDsgbWludXRlICs9IDMwKSB7XG5cdFx0XHRcdHRpbWVzLnB1c2godGltZVN0cmluZ0Zyb21QYXJ0cyhob3VyLCBtaW51dGUsIHRoaXMuYW1QbSkpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMub2xkVmFsdWUgPSBhdHRycy50aW1lPy50b1N0cmluZyhmYWxzZSkgPz8gXCItLVwiXG5cdFx0dGhpcy52YWx1ZXMgPSB0aW1lc1xuXHR9XG5cblx0dmlldyh7IGF0dHJzIH06IFZub2RlPFRpbWVQaWNrZXJBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0aWYgKGF0dHJzLnRpbWUpIHtcblx0XHRcdGNvbnN0IHRpbWVBc1N0cmluZyA9IGF0dHJzLnRpbWU/LnRvU3RyaW5nKHRoaXMuYW1QbSkgPz8gXCJcIlxuXG5cdFx0XHRpZiAoIXRoaXMuZm9jdXNlZCkge1xuXHRcdFx0XHR0aGlzLnZhbHVlID0gdGltZUFzU3RyaW5nXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGlzQXBwKCkpIHtcblx0XHRcdHJldHVybiB0aGlzLnJlbmRlck5hdGl2ZVRpbWVQaWNrZXIoYXR0cnMpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLnJlbmRlckN1c3RvbVRpbWVQaWNrZXIoYXR0cnMpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJOYXRpdmVUaW1lUGlja2VyKGF0dHJzOiBUaW1lUGlja2VyQXR0cnMpOiBDaGlsZHJlbiB7XG5cdFx0aWYgKHRoaXMub2xkVmFsdWUgIT09IGF0dHJzLnRpbWU/LnRvU3RyaW5nKGZhbHNlKSkge1xuXHRcdFx0dGhpcy5vblNlbGVjdGVkKGF0dHJzKVxuXHRcdH1cblxuXHRcdC8vIGlucHV0W3R5cGU9dGltZV0gd2FudHMgdGltZSBpbiAyNGggZm9ybWF0LCBubyBtYXR0ZXIgd2hhdCBpcyBhY3R1YWxseSBkaXNwbGF5ZWQuIE90aGVyd2lzZSBpdCB3aWxsIGJlIGVtcHR5LlxuXHRcdGNvbnN0IHRpbWVBc1N0cmluZyA9IGF0dHJzLnRpbWU/LnRvU3RyaW5nKGZhbHNlKSA/PyBcIlwiXG5cdFx0dGhpcy5vbGRWYWx1ZSA9IHRpbWVBc1N0cmluZ1xuXHRcdHRoaXMudmFsdWUgPSB0aW1lQXNTdHJpbmdcblxuXHRcdGNvbnN0IGRpc3BsYXlUaW1lID0gYXR0cnMudGltZT8udG9TdHJpbmcodGhpcy5hbVBtKVxuXG5cdFx0cmV0dXJuIG0oXCIucmVsXCIsIFtcblx0XHRcdG0oXCJpbnB1dC5maWxsLWFic29sdXRlLmludmlzaWJsZS50dXRhdWktYnV0dG9uLW91dGxpbmVcIiwge1xuXHRcdFx0XHRkaXNhYmxlZDogYXR0cnMuZGlzYWJsZWQsXG5cdFx0XHRcdHR5cGU6IFRleHRGaWVsZFR5cGUuVGltZSxcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHR6SW5kZXg6IDEsXG5cdFx0XHRcdFx0Ym9yZGVyOiBgMnB4IHNvbGlkICR7dGhlbWUuY29udGVudF9tZXNzYWdlX2JnfWAsXG5cdFx0XHRcdFx0d2lkdGg6IFwiYXV0b1wiLFxuXHRcdFx0XHRcdGhlaWdodDogXCJhdXRvXCIsXG5cdFx0XHRcdFx0YXBwZWFyYW5jZTogXCJub25lXCIsXG5cdFx0XHRcdFx0b3BhY2l0eTogYXR0cnMuZGlzYWJsZWQgPyAwLjcgOiAxLjAsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnZhbHVlLFxuXHRcdFx0XHRvbmlucHV0OiAoZXZlbnQ6IElucHV0RXZlbnQpID0+IHtcblx0XHRcdFx0XHRjb25zdCBpbnB1dFZhbHVlID0gKGV2ZW50LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZVxuXHRcdFx0XHRcdGlmICh0aGlzLnZhbHVlID09PSBpbnB1dFZhbHVlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy52YWx1ZSA9IGlucHV0VmFsdWVcblx0XHRcdFx0XHRhdHRycy5vblRpbWVTZWxlY3RlZChUaW1lLnBhcnNlRnJvbVN0cmluZyhpbnB1dFZhbHVlKSlcblx0XHRcdFx0fSxcblx0XHRcdH0pLFxuXHRcdFx0bShcblx0XHRcdFx0XCIudHV0YXVpLWJ1dHRvbi1vdXRsaW5lXCIsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGFzczogYXR0cnMuY2xhc3Nlcz8uam9pbihcIiBcIiksXG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdHpJbmRleDogXCIyXCIsXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogXCJpbmhlcml0XCIsXG5cdFx0XHRcdFx0XHRib3JkZXJDb2xvcjogXCJ0cmFuc3BhcmVudFwiLFxuXHRcdFx0XHRcdFx0cG9pbnRlckV2ZW50czogXCJub25lXCIsXG5cdFx0XHRcdFx0XHRwYWRkaW5nOiBgJHtweChzaXplLnZwYWRfc21hbGwpfSAwYCxcblx0XHRcdFx0XHRcdG9wYWNpdHk6IGF0dHJzLmRpc2FibGVkID8gMC43IDogMS4wLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRpc3BsYXlUaW1lLFxuXHRcdFx0KSxcblx0XHRdKVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDdXN0b21UaW1lUGlja2VyKGF0dHJzOiBUaW1lUGlja2VyQXR0cnMpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3Qgb3B0aW9ucyA9IHRoaXMudmFsdWVzLm1hcCgodGltZSkgPT4gKHtcblx0XHRcdHZhbHVlOiB0aW1lLFxuXHRcdFx0bmFtZTogdGltZSxcblx0XHRcdGFyaWFWYWx1ZTogdGltZSxcblx0XHR9KSlcblxuXHRcdHJldHVybiBtKFNlbGVjdDxUaW1lT3B0aW9uLCBzdHJpbmc+LCB7XG5cdFx0XHRvbmNoYW5nZTogKG5ld1ZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLnZhbHVlID09PSBuZXdWYWx1ZS52YWx1ZSkge1xuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy52YWx1ZSA9IG5ld1ZhbHVlLnZhbHVlXG5cdFx0XHRcdHRoaXMub25TZWxlY3RlZChhdHRycylcblx0XHRcdFx0bS5yZWRyYXcuc3luYygpXG5cdFx0XHR9LFxuXHRcdFx0b25jbG9zZTogKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmlzRXhwYW5kZWQgPSBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdHNlbGVjdGVkOiB7IHZhbHVlOiB0aGlzLnZhbHVlLCBuYW1lOiB0aGlzLnZhbHVlLCBhcmlhVmFsdWU6IHRoaXMudmFsdWUgfSxcblx0XHRcdGFyaWFMYWJlbDogYXR0cnMuYXJpYUxhYmVsLFxuXHRcdFx0ZGlzYWJsZWQ6IGF0dHJzLmRpc2FibGVkLFxuXHRcdFx0b3B0aW9uczogc3RyZWFtKG9wdGlvbnMpLFxuXHRcdFx0bm9JY29uOiB0cnVlLFxuXHRcdFx0ZXhwYW5kZWQ6IHRydWUsXG5cdFx0XHR0YWJJbmRleDogTnVtYmVyKFRhYkluZGV4LlByb2dyYW1tYXRpYyksXG5cdFx0XHRyZW5kZXJEaXNwbGF5OiAoKSA9PiB0aGlzLnJlbmRlclRpbWVTZWxlY3RJbnB1dChhdHRycyksXG5cdFx0XHRyZW5kZXJPcHRpb246IChvcHRpb24pID0+IHRoaXMucmVuZGVyVGltZU9wdGlvbnMob3B0aW9uKSxcblx0XHRcdGtlZXBGb2N1czogdHJ1ZSxcblx0XHR9IHNhdGlzZmllcyBTZWxlY3RBdHRyaWJ1dGVzPFRpbWVPcHRpb24sIHN0cmluZz4pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRpbWVPcHRpb25zKG9wdGlvbjogVGltZU9wdGlvbikge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCJidXR0b24uaXRlbXMtY2VudGVyLmZsZXgtZ3Jvd1wiLFxuXHRcdFx0e1xuXHRcdFx0XHRjbGFzczogXCJzdGF0ZS1iZyBidXR0b24tY29udGVudCBkcm9wZG93bi1idXR0b24gcHQtcyBwYi1zIGJ1dHRvbi1taW4taGVpZ2h0XCIsXG5cdFx0XHR9LFxuXHRcdFx0b3B0aW9uLm5hbWUsXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJUaW1lU2VsZWN0SW5wdXQoYXR0cnM6IFRpbWVQaWNrZXJBdHRycykge1xuXHRcdHJldHVybiBtKFNpbmdsZUxpbmVUZXh0RmllbGQsIHtcblx0XHRcdGNsYXNzZXM6IFsuLi4oYXR0cnMuY2xhc3NlcyA/PyBbXSksIFwidHV0YXVpLWJ1dHRvbi1vdXRsaW5lXCIsIFwidGV4dC1jZW50ZXJcIiwgXCJib3JkZXItY29udGVudC1tZXNzYWdlLWJnXCJdLFxuXHRcdFx0dmFsdWU6IHRoaXMudmFsdWUsXG5cdFx0XHRvbmlucHV0OiAodmFsOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMudmFsdWUgPT09IHZhbCkge1xuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy52YWx1ZSA9IHZhbFxuXHRcdFx0fSxcblx0XHRcdGRpc2FibGVkOiBhdHRycy5kaXNhYmxlZCxcblx0XHRcdGFyaWFMYWJlbDogYXR0cnMuYXJpYUxhYmVsLFxuXHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0dGV4dEFsaWduOiBcImNlbnRlclwiLFxuXHRcdFx0fSxcblx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcblx0XHRcdFx0aWYgKCF0aGlzLmlzRXhwYW5kZWQpIHtcblx0XHRcdFx0XHQ7KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5wYXJlbnRFbGVtZW50Py5jbGljaygpXG5cdFx0XHRcdFx0dGhpcy5pc0V4cGFuZGVkID0gdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0b25mb2N1czogKGV2ZW50OiBGb2N1c0V2ZW50KSA9PiB7XG5cdFx0XHRcdHRoaXMuZm9jdXNlZCA9IHRydWVcblx0XHRcdFx0aWYgKCF0aGlzLmlzRXhwYW5kZWQpIHtcblx0XHRcdFx0XHQ7KGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCkucGFyZW50RWxlbWVudD8uY2xpY2soKVxuXHRcdFx0XHRcdHRoaXMuaXNFeHBhbmRlZCA9IHRydWVcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG9uYmx1cjogKGU6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5mb2N1c2VkKSB7XG5cdFx0XHRcdFx0dGhpcy5vblNlbGVjdGVkKGF0dHJzKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZS5yZWRyYXcgPSBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdHR5cGU6IFRleHRGaWVsZFR5cGUuVGV4dCxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBvblNlbGVjdGVkKGF0dHJzOiBUaW1lUGlja2VyQXR0cnMpIHtcblx0XHR0aGlzLmZvY3VzZWQgPSBmYWxzZVxuXG5cdFx0YXR0cnMub25UaW1lU2VsZWN0ZWQoVGltZS5wYXJzZUZyb21TdHJpbmcodGhpcy52YWx1ZSkpXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBUaW1lRm9ybWF0IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudFdoZW5Nb2RlbCB9IGZyb20gXCIuLi9ldmVudGVkaXRvci1tb2RlbC9DYWxlbmRhckV2ZW50V2hlbk1vZGVsLmpzXCJcbmltcG9ydCB7IFN3aXRjaCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvU3dpdGNoLmpzXCJcbmltcG9ydCB7IEljb24sIEljb25TaXplIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL3RoZW1lLmpzXCJcbmltcG9ydCB7IGlzQXBwIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0Vudi5qc1wiXG5pbXBvcnQgeyBEYXRlUGlja2VyIH0gZnJvbSBcIi4uL3BpY2tlcnMvRGF0ZVBpY2tlci5qc1wiXG5pbXBvcnQgeyBUaW1lUGlja2VyIH0gZnJvbSBcIi4uL3BpY2tlcnMvVGltZVBpY2tlci5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgRGl2aWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL0RpdmlkZXIuanNcIlxuXG5leHBvcnQgdHlwZSBFdmVudFRpbWVFZGl0b3JBdHRycyA9IHtcblx0c3RhcnRPZlRoZVdlZWtPZmZzZXQ6IG51bWJlclxuXHR0aW1lRm9ybWF0OiBUaW1lRm9ybWF0XG5cdGVkaXRNb2RlbDogQ2FsZW5kYXJFdmVudFdoZW5Nb2RlbFxuXHRkaXNhYmxlZDogYm9vbGVhblxufVxuXG4vKipcbiAqIGFuIGVkaXRvciBjb21wb25lbnQgdG8gZWRpdCB0aGUgc3RhcnQgZGF0ZSBhbmQgZW5kIGRhdGUgb2YgYSBjYWxlbmRhciBldmVudC5cbiAqIGFsc28gYWxsb3dzIHRvIGVkaXQgc3RhcnQgdGltZSBhbmQgZW5kIHRpbWUgZm9yIGV2ZW50cyB3aGVyZSB0aGF0IG1ha2VzIHNlbnNlIChpZSBub3QgYWxsLWRheSlcbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50VGltZUVkaXRvciBpbXBsZW1lbnRzIENvbXBvbmVudDxFdmVudFRpbWVFZGl0b3JBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxFdmVudFRpbWVFZGl0b3JBdHRycz4pIHtcblx0XHRjb25zdCB7IGF0dHJzIH0gPSB2bm9kZVxuXHRcdGNvbnN0IHsgc3RhcnRPZlRoZVdlZWtPZmZzZXQsIGVkaXRNb2RlbCwgdGltZUZvcm1hdCwgZGlzYWJsZWQgfSA9IGF0dHJzXG5cblx0XHRjb25zdCBhcHBDbGFzc2VzID0gaXNBcHAoKSA/IFtcInNtYWxsZXJcIl0gOiBbXVxuXG5cdFx0cmV0dXJuIG0oXCIuZmxleFwiLCBbXG5cdFx0XHRtKFwiLmZsZXguY29sLmZsZXgtZ3Jvdy5nYXAtdnBhZC1zXCIsIFtcblx0XHRcdFx0bShcIi5mbGV4LmdhcC12cGFkLXMuaXRlbXMtY2VudGVyLnByLXZwYWQtc1wiLCBbXG5cdFx0XHRcdFx0bShJY29uLCB7XG5cdFx0XHRcdFx0XHRpY29uOiBJY29ucy5UaW1lLFxuXHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0ZmlsbDogdGhlbWUuY29udGVudF9mZyxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR0aXRsZTogbGFuZy5nZXQoXCJ0aW1lU2VjdGlvbl9sYWJlbFwiKSxcblx0XHRcdFx0XHRcdHNpemU6IEljb25TaXplLk1lZGl1bSxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0U3dpdGNoLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRjaGVja2VkOiBlZGl0TW9kZWwuaXNBbGxEYXksXG5cdFx0XHRcdFx0XHRcdG9uY2xpY2s6ICh2YWx1ZSkgPT4gKGVkaXRNb2RlbC5pc0FsbERheSA9IHZhbHVlKSxcblx0XHRcdFx0XHRcdFx0YXJpYUxhYmVsOiBsYW5nLmdldChcImFsbERheV9sYWJlbFwiKSxcblx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IGRpc2FibGVkLFxuXHRcdFx0XHRcdFx0XHR2YXJpYW50OiBcImV4cGFuZGVkXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bGFuZy5nZXQoXCJhbGxEYXlfbGFiZWxcIiksXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XSksXG5cdFx0XHRcdG0oXCIuZmxleC5jb2wuZnVsbC13aWR0aC5mbGV4LWdyb3cuZ2FwLXZwYWQtc1wiLCB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiBweChzaXplLmljb25fc2l6ZV9sYXJnZSArIHNpemUudnBhZF9zbWFsbCkgfSB9LCBbXG5cdFx0XHRcdFx0bShEaXZpZGVyLCB7IGNvbG9yOiB0aGVtZS5idXR0b25fYnViYmxlX2JnIH0pLFxuXHRcdFx0XHRcdG0oXCIudGltZS1zZWxlY3Rpb24tZ3JpZC5wci12cGFkLXNcIiwgW1xuXHRcdFx0XHRcdFx0bShcIlwiLCBsYW5nLmdldChcImRhdGVGcm9tX2xhYmVsXCIpKSxcblx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdGAke2lzQXBwKCkgPyBcIlwiIDogXCIucGwtdnBhZC1sXCJ9YCxcblx0XHRcdFx0XHRcdFx0bShEYXRlUGlja2VyLCB7XG5cdFx0XHRcdFx0XHRcdFx0Y2xhc3NlczogYXBwQ2xhc3Nlcyxcblx0XHRcdFx0XHRcdFx0XHRkYXRlOiBhdHRycy5lZGl0TW9kZWwuc3RhcnREYXRlLFxuXHRcdFx0XHRcdFx0XHRcdG9uRGF0ZVNlbGVjdGVkOiAoZGF0ZSkgPT4gZGF0ZSAmJiAoZWRpdE1vZGVsLnN0YXJ0RGF0ZSA9IGRhdGUpLFxuXHRcdFx0XHRcdFx0XHRcdHN0YXJ0T2ZUaGVXZWVrT2Zmc2V0LFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcImRhdGVGcm9tX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdFx0dXNlSW5wdXRCdXR0b246IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IGF0dHJzLmRpc2FibGVkLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XHRcIlwiLFxuXHRcdFx0XHRcdFx0XHRtKFRpbWVQaWNrZXIsIHtcblx0XHRcdFx0XHRcdFx0XHRjbGFzc2VzOiBhcHBDbGFzc2VzLFxuXHRcdFx0XHRcdFx0XHRcdHRpbWU6IGVkaXRNb2RlbC5zdGFydFRpbWUsXG5cdFx0XHRcdFx0XHRcdFx0b25UaW1lU2VsZWN0ZWQ6ICh0aW1lKSA9PiAoZWRpdE1vZGVsLnN0YXJ0VGltZSA9IHRpbWUpLFxuXHRcdFx0XHRcdFx0XHRcdHRpbWVGb3JtYXQsXG5cdFx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IGF0dHJzLmRpc2FibGVkIHx8IGF0dHJzLmVkaXRNb2RlbC5pc0FsbERheSxcblx0XHRcdFx0XHRcdFx0XHRhcmlhTGFiZWw6IGxhbmcuZ2V0KFwic3RhcnRUaW1lX2xhYmVsXCIpLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRtKFwiXCIsIGxhbmcuZ2V0KFwiZGF0ZVRvX2xhYmVsXCIpKSxcblx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdGAke2lzQXBwKCkgPyBcIlwiIDogXCIucGwtdnBhZC1sXCJ9YCxcblx0XHRcdFx0XHRcdFx0bShEYXRlUGlja2VyLCB7XG5cdFx0XHRcdFx0XHRcdFx0Y2xhc3NlczogYXBwQ2xhc3Nlcyxcblx0XHRcdFx0XHRcdFx0XHRkYXRlOiBhdHRycy5lZGl0TW9kZWwuZW5kRGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRvbkRhdGVTZWxlY3RlZDogKGRhdGUpID0+IGRhdGUgJiYgKGVkaXRNb2RlbC5lbmREYXRlID0gZGF0ZSksXG5cdFx0XHRcdFx0XHRcdFx0c3RhcnRPZlRoZVdlZWtPZmZzZXQsXG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiZGF0ZVRvX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdFx0dXNlSW5wdXRCdXR0b246IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0ZGlzYWJsZWQ6IGF0dHJzLmRpc2FibGVkLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XHRcIlwiLFxuXHRcdFx0XHRcdFx0XHRtKFRpbWVQaWNrZXIsIHtcblx0XHRcdFx0XHRcdFx0XHRjbGFzc2VzOiBhcHBDbGFzc2VzLFxuXHRcdFx0XHRcdFx0XHRcdHRpbWU6IGVkaXRNb2RlbC5lbmRUaW1lLFxuXHRcdFx0XHRcdFx0XHRcdG9uVGltZVNlbGVjdGVkOiAodGltZSkgPT4gKGVkaXRNb2RlbC5lbmRUaW1lID0gdGltZSksXG5cdFx0XHRcdFx0XHRcdFx0dGltZUZvcm1hdCxcblx0XHRcdFx0XHRcdFx0XHRkaXNhYmxlZDogYXR0cnMuZGlzYWJsZWQgfHwgYXR0cnMuZWRpdE1vZGVsLmlzQWxsRGF5LFxuXHRcdFx0XHRcdFx0XHRcdGFyaWFMYWJlbDogbGFuZy5nZXQoXCJlbmRUaW1lX2xhYmVsXCIpLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdF0pLFxuXHRcdFx0XSksXG5cdFx0XSlcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBUZXh0RmllbGQsIFRleHRGaWVsZEF0dHJzLCBUZXh0RmllbGRUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9UZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgY3JlYXRlQWxhcm1JbnRlcnZhbEl0ZW1zLCBjcmVhdGVDdXN0b21SZXBlYXRSdWxlVW5pdFZhbHVlcywgaHVtYW5EZXNjcmlwdGlvbkZvckFsYXJtSW50ZXJ2YWwgfSBmcm9tIFwiLi9DYWxlbmRhckd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IGxhbmcsIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IEljb25CdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb25CdXR0b24uanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IGF0dGFjaERyb3Bkb3duIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Ecm9wZG93bi5qc1wiXG5pbXBvcnQgeyBBbGFybUludGVydmFsLCBBbGFybUludGVydmFsVW5pdCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vY2FsZW5kYXIvZGF0ZS9DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcbmltcG9ydCB7IERyb3BEb3duU2VsZWN0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3BEb3duU2VsZWN0b3IuanNcIlxuaW1wb3J0IHsgZGVlcEVxdWFsIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBTZWxlY3QsIFNlbGVjdEF0dHJpYnV0ZXMsIFNlbGVjdE9wdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvU2VsZWN0LmpzXCJcbmltcG9ydCB7IEljb24sIEljb25TaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IEJhc2VCdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2J1dHRvbnMvQmFzZUJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBCdXR0b25Db2xvciwgZ2V0Q29sb3JzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgVGFiSW5kZXggfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuXG5leHBvcnQgdHlwZSBSZW1pbmRlcnNFZGl0b3JBdHRycyA9IHtcblx0YWRkQWxhcm06IChhbGFybTogQWxhcm1JbnRlcnZhbCkgPT4gdW5rbm93blxuXHRyZW1vdmVBbGFybTogKGFsYXJtOiBBbGFybUludGVydmFsKSA9PiB1bmtub3duXG5cdGFsYXJtczogcmVhZG9ubHkgQWxhcm1JbnRlcnZhbFtdXG5cdGxhYmVsOiBUcmFuc2xhdGlvbktleVxuXHR1c2VOZXdFZGl0b3I6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBSZW1pbmRlcnNTZWxlY3RPcHRpb24gZXh0ZW5kcyBTZWxlY3RPcHRpb248QWxhcm1JbnRlcnZhbD4ge1xuXHR0ZXh0OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNsYXNzIFJlbWluZGVyc0VkaXRvciBpbXBsZW1lbnRzIENvbXBvbmVudDxSZW1pbmRlcnNFZGl0b3JBdHRycz4ge1xuXHR2aWV3KHZub2RlOiBWbm9kZTxSZW1pbmRlcnNFZGl0b3JBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBhZGRBbGFybSwgcmVtb3ZlQWxhcm0sIGFsYXJtcywgdXNlTmV3RWRpdG9yIH0gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IGFkZE5ld0FsYXJtID0gKG5ld0FsYXJtOiBBbGFybUludGVydmFsKSA9PiB7XG5cdFx0XHRjb25zdCBoYXNBbGFybSA9IGFsYXJtcy5maW5kKChhbGFybSkgPT4gZGVlcEVxdWFsKGFsYXJtLCBuZXdBbGFybSkpXG5cdFx0XHRpZiAoaGFzQWxhcm0pIHJldHVyblxuXHRcdFx0YWRkQWxhcm0obmV3QWxhcm0pXG5cdFx0fVxuXHRcdHJldHVybiB1c2VOZXdFZGl0b3IgPyB0aGlzLnJlbmRlck5ld0VkaXRvcihhbGFybXMsIHJlbW92ZUFsYXJtLCBhZGROZXdBbGFybSwgYWRkQWxhcm0pIDogdGhpcy5yZW5kZXJPbGRFZGl0b3IoYWxhcm1zLCByZW1vdmVBbGFybSwgYWRkTmV3QWxhcm0sIHZub2RlKVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJPbGRFZGl0b3IoXG5cdFx0YWxhcm1zOiByZWFkb25seSBBbGFybUludGVydmFsW10sXG5cdFx0cmVtb3ZlQWxhcm06IChhbGFybTogQWxhcm1JbnRlcnZhbCkgPT4gdW5rbm93bixcblx0XHRhZGROZXdBbGFybTogKG5ld0FsYXJtOiBBbGFybUludGVydmFsKSA9PiB2b2lkLFxuXHRcdHZub2RlOiBWbm9kZTxSZW1pbmRlcnNFZGl0b3JBdHRycz4sXG5cdCkge1xuXHRcdGNvbnN0IHRleHRGaWVsZEF0dHJzOiBBcnJheTxUZXh0RmllbGRBdHRycz4gPSBhbGFybXMubWFwKChhKSA9PiAoe1xuXHRcdFx0dmFsdWU6IGh1bWFuRGVzY3JpcHRpb25Gb3JBbGFybUludGVydmFsKGEsIGxhbmcubGFuZ3VhZ2VUYWcpLFxuXHRcdFx0bGFiZWw6IFwiZW1wdHlTdHJpbmdfbXNnXCIsXG5cdFx0XHRpc1JlYWRPbmx5OiB0cnVlLFxuXHRcdFx0aW5qZWN0aW9uc1JpZ2h0OiAoKSA9PlxuXHRcdFx0XHRtKEljb25CdXR0b24sIHtcblx0XHRcdFx0XHR0aXRsZTogXCJkZWxldGVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0aWNvbjogSWNvbnMuQ2FuY2VsLFxuXHRcdFx0XHRcdGNsaWNrOiAoKSA9PiByZW1vdmVBbGFybShhKSxcblx0XHRcdFx0fSksXG5cdFx0fSkpXG5cblx0XHR0ZXh0RmllbGRBdHRycy5wdXNoKHtcblx0XHRcdHZhbHVlOiBsYW5nLmdldChcImFkZF9hY3Rpb25cIiksXG5cdFx0XHRsYWJlbDogXCJlbXB0eVN0cmluZ19tc2dcIixcblx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRpbmplY3Rpb25zUmlnaHQ6ICgpID0+XG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0SWNvbkJ1dHRvbixcblx0XHRcdFx0XHRhdHRhY2hEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRtYWluQnV0dG9uQXR0cnM6IHtcblx0XHRcdFx0XHRcdFx0dGl0bGU6IFwiYWRkX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5BZGQsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0Y2hpbGRBdHRyczogKCkgPT4gW1xuXHRcdFx0XHRcdFx0XHQuLi5jcmVhdGVBbGFybUludGVydmFsSXRlbXMobGFuZy5sYW5ndWFnZVRhZykubWFwKChpKSA9PiAoe1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBsYW5nLm1ha2VUcmFuc2xhdGlvbihpLm5hbWUsIGkubmFtZSksXG5cdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGFkZE5ld0FsYXJtKGkudmFsdWUpLFxuXHRcdFx0XHRcdFx0XHR9KSksXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJjYWxlbmRhclJlbWluZGVySW50ZXJ2YWxEcm9wZG93bkN1c3RvbUl0ZW1fbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5zaG93Q3VzdG9tUmVtaW5kZXJJbnRlcnZhbERpYWxvZygodmFsdWUsIHVuaXQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YWRkTmV3QWxhcm0oe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHVuaXQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpLFxuXHRcdH0pXG5cblx0XHR0ZXh0RmllbGRBdHRyc1swXS5sYWJlbCA9IHZub2RlLmF0dHJzLmxhYmVsXG5cblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguY29sLmZsZXgtaGFsZi5wbC1zXCIsXG5cdFx0XHR0ZXh0RmllbGRBdHRycy5tYXAoKGEpID0+IG0oVGV4dEZpZWxkLCBhKSksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJOZXdFZGl0b3IoXG5cdFx0YWxhcm1zOiByZWFkb25seSBBbGFybUludGVydmFsW10sXG5cdFx0cmVtb3ZlQWxhcm06IChhbGFybTogQWxhcm1JbnRlcnZhbCkgPT4gdW5rbm93bixcblx0XHRhZGROZXdBbGFybTogKG5ld0FsYXJtOiBBbGFybUludGVydmFsKSA9PiB2b2lkLFxuXHRcdGFkZEFsYXJtOiAoYWxhcm06IEFsYXJtSW50ZXJ2YWwpID0+IHVua25vd24sXG5cdCkge1xuXHRcdGNvbnN0IGFsYXJtT3B0aW9ucyA9IGNyZWF0ZUFsYXJtSW50ZXJ2YWxJdGVtcyhsYW5nLmxhbmd1YWdlVGFnKS5tYXAoXG5cdFx0XHQoYWxhcm0pID0+XG5cdFx0XHRcdCh7XG5cdFx0XHRcdFx0dGV4dDogYWxhcm0ubmFtZSxcblx0XHRcdFx0XHR2YWx1ZTogYWxhcm0udmFsdWUsXG5cdFx0XHRcdFx0YXJpYVZhbHVlOiBhbGFybS5uYW1lLFxuXHRcdFx0XHR9IHNhdGlzZmllcyBSZW1pbmRlcnNTZWxlY3RPcHRpb24pLFxuXHRcdClcblxuXHRcdGFsYXJtT3B0aW9ucy5wdXNoKHtcblx0XHRcdHRleHQ6IGxhbmcuZ2V0KFwiY2FsZW5kYXJSZW1pbmRlckludGVydmFsRHJvcGRvd25DdXN0b21JdGVtX2xhYmVsXCIpLFxuXHRcdFx0YXJpYVZhbHVlOiBsYW5nLmdldChcImNhbGVuZGFyUmVtaW5kZXJJbnRlcnZhbERyb3Bkb3duQ3VzdG9tSXRlbV9sYWJlbFwiKSxcblx0XHRcdHZhbHVlOiB7IHZhbHVlOiAtMSwgdW5pdDogQWxhcm1JbnRlcnZhbFVuaXQuTUlOVVRFIH0sXG5cdFx0fSlcblxuXHRcdGNvbnN0IGRlZmF1bHRTZWxlY3RlZCA9IHtcblx0XHRcdHRleHQ6IGxhbmcuZ2V0KFwiYWRkUmVtaW5kZXJfbGFiZWxcIiksXG5cdFx0XHR2YWx1ZTogeyB2YWx1ZTogLTIsIHVuaXQ6IEFsYXJtSW50ZXJ2YWxVbml0Lk1JTlVURSB9LFxuXHRcdFx0YXJpYVZhbHVlOiBsYW5nLmdldChcImFkZFJlbWluZGVyX2xhYmVsXCIpLFxuXHRcdH1cblxuXHRcdHJldHVybiBtKFwidWwudW5zdHlsZWQtbGlzdC5mbGV4LmNvbC5mbGV4LWdyb3cuZ2FwLXZwYWQtc1wiLCBbXG5cdFx0XHRhbGFybXMubWFwKChhbGFybSkgPT5cblx0XHRcdFx0bShcImxpLmZsZXguanVzdGlmeS1iZXR3ZWVuLmZsZXctZ3Jvdy5pdGVtcy1jZW50ZXIuZ2FwLXZwYWQtc1wiLCBbXG5cdFx0XHRcdFx0bShcInNwYW4uZmxleC5qdXN0aWZ5LWJldHdlZW5cIiwgaHVtYW5EZXNjcmlwdGlvbkZvckFsYXJtSW50ZXJ2YWwoYWxhcm0sIGxhbmcubGFuZ3VhZ2VUYWcpKSxcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0QmFzZUJ1dHRvbixcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9UaGlzIG1pZ2h0IG5vdCBtYWtlIHNlbnNlIGluIG90aGVyIGxhbmd1YWdlcywgYnV0IGlzIGJldHRlciB0aGFuIHdoYXQgd2UgaGF2ZSBub3dcblx0XHRcdFx0XHRcdFx0bGFiZWw6IGxhbmcubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFwiZGVsZXRlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRcdGAke2xhbmcuZ2V0KFwiZGVsZXRlX2FjdGlvblwiKX0gJHtodW1hbkRlc2NyaXB0aW9uRm9yQWxhcm1JbnRlcnZhbChhbGFybSwgbGFuZy5sYW5ndWFnZVRhZyl9YCxcblx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0b25jbGljazogKCkgPT4gcmVtb3ZlQWxhcm0oYWxhcm0pLFxuXHRcdFx0XHRcdFx0XHRjbGFzczogXCJmbGV4IGl0ZW1zLWNlbnRlclwiLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG0oSWNvbiwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5DYW5jZWwsXG5cdFx0XHRcdFx0XHRcdHNpemU6IEljb25TaXplLk1lZGl1bSxcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRmaWxsOiBnZXRDb2xvcnMoQnV0dG9uQ29sb3IuQ29udGVudCkuYnV0dG9uLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XSksXG5cdFx0XHQpLFxuXHRcdFx0bShcblx0XHRcdFx0XCJsaS5pdGVtcy1jZW50ZXJcIixcblx0XHRcdFx0bShTZWxlY3Q8UmVtaW5kZXJzU2VsZWN0T3B0aW9uLCBBbGFybUludGVydmFsPiwge1xuXHRcdFx0XHRcdGFyaWFMYWJlbDogbGFuZy5nZXQoXCJjYWxlbmRhclJlbWluZGVySW50ZXJ2YWxWYWx1ZV9sYWJlbFwiKSxcblx0XHRcdFx0XHRzZWxlY3RlZDogZGVmYXVsdFNlbGVjdGVkLFxuXHRcdFx0XHRcdG9wdGlvbnM6IHN0cmVhbShhbGFybU9wdGlvbnMpLFxuXHRcdFx0XHRcdHJlbmRlck9wdGlvbjogKG9wdGlvbikgPT4gdGhpcy5yZW5kZXJSZW1pbmRlck9wdGlvbnMob3B0aW9uLCBmYWxzZSwgZmFsc2UpLFxuXHRcdFx0XHRcdHJlbmRlckRpc3BsYXk6IChvcHRpb24pID0+IHRoaXMucmVuZGVyUmVtaW5kZXJPcHRpb25zKG9wdGlvbiwgYWxhcm1zLmxlbmd0aCA+IDAsIHRydWUpLFxuXHRcdFx0XHRcdG9uY2hhbmdlOiAobmV3VmFsdWUpID0+IHtcblx0XHRcdFx0XHRcdGlmIChuZXdWYWx1ZS52YWx1ZS52YWx1ZSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0Ly8gdGltZW91dCBuZWVkZWQgdG8gcHJldmVudCB0aGUgY3VzdG9tIGludGVydmFsIGRpYWxvZyB0byBiZSBjbG9zZWQgYnkgdGhlIGtleSBldmVudCB0cmlnZ2VyZWQgaW5zaWRlIHRoZSBzZWxlY3QgY29tcG9uZW50XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnNob3dDdXN0b21SZW1pbmRlckludGVydmFsRGlhbG9nKCh2YWx1ZSwgdW5pdCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0YWRkTmV3QWxhcm0oe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dW5pdCxcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0fSwgMClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGFkZEFsYXJtKG5ld1ZhbHVlLnZhbHVlKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZXhwYW5kZWQ6IHRydWUsXG5cdFx0XHRcdFx0aWNvbkNvbG9yOiBnZXRDb2xvcnMoQnV0dG9uQ29sb3IuQ29udGVudCkuYnV0dG9uLFxuXHRcdFx0XHRcdG5vSWNvbjogdHJ1ZSxcblx0XHRcdFx0fSBzYXRpc2ZpZXMgU2VsZWN0QXR0cmlidXRlczxSZW1pbmRlcnNTZWxlY3RPcHRpb24sIEFsYXJtSW50ZXJ2YWw+KSxcblx0XHRcdCksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUmVtaW5kZXJPcHRpb25zKG9wdGlvbjogUmVtaW5kZXJzU2VsZWN0T3B0aW9uLCBoYXNBbGFybXM6IGJvb2xlYW4sIGlzRGlzcGxheTogYm9vbGVhbikge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCJidXR0b24uaXRlbXMtY2VudGVyLmZsZXgtZ3Jvd1wiLFxuXHRcdFx0e1xuXHRcdFx0XHR0YWJJbmRleDogaXNEaXNwbGF5ID8gVGFiSW5kZXguUHJvZ3JhbW1hdGljIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRjbGFzczogaXNEaXNwbGF5ID8gYGZsZXggJHtoYXNBbGFybXMgPyBcInRleHQtZmFkZVwiIDogXCJcIn1gIDogXCJzdGF0ZS1iZyBidXR0b24tY29udGVudCBidXR0b24tbWluLWhlaWdodCBkcm9wZG93bi1idXR0b24gcHQtcyBwYi1zXCIsXG5cdFx0XHR9LFxuXHRcdFx0b3B0aW9uLnRleHQsXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBzaG93Q3VzdG9tUmVtaW5kZXJJbnRlcnZhbERpYWxvZyhvbkFkZEFjdGlvbjogKHZhbHVlOiBudW1iZXIsIHVuaXQ6IEFsYXJtSW50ZXJ2YWxVbml0KSA9PiB2b2lkKSB7XG5cdFx0bGV0IHRpbWVSZW1pbmRlclZhbHVlID0gMFxuXHRcdGxldCB0aW1lUmVtaW5kZXJVbml0OiBBbGFybUludGVydmFsVW5pdCA9IEFsYXJtSW50ZXJ2YWxVbml0Lk1JTlVURVxuXG5cdFx0RGlhbG9nLnNob3dBY3Rpb25EaWFsb2coe1xuXHRcdFx0dGl0bGU6IFwiY2FsZW5kYXJSZW1pbmRlckludGVydmFsQ3VzdG9tRGlhbG9nX3RpdGxlXCIsXG5cdFx0XHRhbGxvd09rV2l0aFJldHVybjogdHJ1ZSxcblx0XHRcdGNoaWxkOiB7XG5cdFx0XHRcdHZpZXc6ICgpID0+IHtcblx0XHRcdFx0XHRjb25zdCB1bml0SXRlbXMgPSBjcmVhdGVDdXN0b21SZXBlYXRSdWxlVW5pdFZhbHVlcygpID8/IFtdXG5cdFx0XHRcdFx0cmV0dXJuIG0oXCIuZmxleCBmdWxsLXdpZHRoIHB0LXNcIiwgW1xuXHRcdFx0XHRcdFx0bShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdFx0dHlwZTogVGV4dEZpZWxkVHlwZS5OdW1iZXIsXG5cdFx0XHRcdFx0XHRcdG1pbjogMCxcblx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiY2FsZW5kYXJSZW1pbmRlckludGVydmFsVmFsdWVfbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0dmFsdWU6IHRpbWVSZW1pbmRlclZhbHVlLnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0XHRcdG9uaW5wdXQ6ICh2KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgdGltZSA9IE51bWJlci5wYXJzZUludCh2KVxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGlzRW1wdHkgPSB2ID09PSBcIlwiXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFOdW1iZXIuaXNOYU4odGltZSkgfHwgaXNFbXB0eSkgdGltZVJlbWluZGVyVmFsdWUgPSBpc0VtcHR5ID8gMCA6IE1hdGguYWJzKHRpbWUpXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdGNsYXNzOiBcImZsZXgtaGFsZiBuby1hcHBlYXJhbmNlXCIsIC8vUmVtb3ZlcyB0aGUgdXAvZG93biBhcnJvdyBmcm9tIGlucHV0IG51bWJlci4gUHJlc3NpbmcgYXJyb3cgdXAvZG93biBrZXkgc3RpbGwgd29ya2luZ1xuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRtKERyb3BEb3duU2VsZWN0b3IsIHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiZW1wdHlTdHJpbmdfbXNnXCIsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkVmFsdWU6IHRpbWVSZW1pbmRlclVuaXQsXG5cdFx0XHRcdFx0XHRcdGl0ZW1zOiB1bml0SXRlbXMsXG5cdFx0XHRcdFx0XHRcdGNsYXNzOiBcImZsZXgtaGFsZiBwbC1zXCIsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvbkNoYW5nZWRIYW5kbGVyOiAoc2VsZWN0ZWRWYWx1ZTogQWxhcm1JbnRlcnZhbFVuaXQpID0+ICh0aW1lUmVtaW5kZXJVbml0ID0gc2VsZWN0ZWRWYWx1ZSBhcyBBbGFybUludGVydmFsVW5pdCksXG5cdFx0XHRcdFx0XHRcdGRpc2FibGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0b2tBY3Rpb25UZXh0SWQ6IFwiYWRkX2FjdGlvblwiLFxuXHRcdFx0b2tBY3Rpb246IChkaWFsb2c6IERpYWxvZykgPT4ge1xuXHRcdFx0XHRvbkFkZEFjdGlvbih0aW1lUmVtaW5kZXJWYWx1ZSwgdGltZVJlbWluZGVyVW5pdClcblx0XHRcdFx0ZGlhbG9nLmNsb3NlKClcblx0XHRcdH0sXG5cdFx0fSlcblx0fVxufVxuIiwiaW1wb3J0IHR5cGUgeyBNYXliZVRyYW5zbGF0aW9uIH0gZnJvbSBcIi4uLy4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi8uLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCBtLCB7IENoaWxkLCBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGlzS2V5UHJlc3NlZCB9IGZyb20gXCIuLi8uLi9taXNjL0tleU1hbmFnZXIuanNcIlxuaW1wb3J0IHsgS2V5cyB9IGZyb20gXCIuLi8uLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IEFyaWFSb2xlIH0gZnJvbSBcIi4uL0FyaWFVdGlscy5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgU2luZ3VsYXJPclBsdXJhbExhYmVsIHtcblx0c2luZ3VsYXI6IE1heWJlVHJhbnNsYXRpb25cblx0cGx1cmFsOiBNYXliZVRyYW5zbGF0aW9uXG59XG5cbmV4cG9ydCB0eXBlIFJhZGlvR3JvdXBPcHRpb248VD4gPSB7XG5cdHJlYWRvbmx5IG5hbWU6IE1heWJlVHJhbnNsYXRpb25cblx0cmVhZG9ubHkgdmFsdWU6IFRcbn1cblxuZXhwb3J0IHR5cGUgUmFkaW9Hcm91cEF0dHJzPFQ+ID0ge1xuXHQvLyBUaGUgdW5pcXVlIG5hbWUgb2YgdGhlIHJhZGlvIGJ1dHRvbiBncm91cC4gVGhlIGJyb3dzZXIgdXNlcyBpdCB0byBncm91cCB0aGUgcmFkaW8gYnV0dG9ucyB0b2dldGhlci5cblx0bmFtZTogTWF5YmVUcmFuc2xhdGlvblxuXHRvcHRpb25zOiBSZWFkb25seUFycmF5PFJhZGlvR3JvdXBPcHRpb248VD4+XG5cdGFyaWFMYWJlbDogTWF5YmVUcmFuc2xhdGlvblxuXHRjbGFzc2VzPzogQXJyYXk8c3RyaW5nPlxuXHRzZWxlY3RlZE9wdGlvbjogVCB8IG51bGxcblx0b25PcHRpb25TZWxlY3RlZDogKGFyZzA6IFQpID0+IHVua25vd25cblx0aW5qZWN0aW9uTWFwPzogTWFwPHN0cmluZywgQ2hpbGQ+XG59XG5cbi8qKlxuICogQ29tcG9uZW50IHdoaWNoIHNob3dzIHNlbGVjdGlvbiBmb3IgYSBzaW5nbGUgY2hvaWNlLlxuICovXG5leHBvcnQgY2xhc3MgUmFkaW9Hcm91cDxUPiBpbXBsZW1lbnRzIENvbXBvbmVudDxSYWRpb0dyb3VwQXR0cnM8VD4+IHtcblx0dmlldyh7IGF0dHJzIH06IFZub2RlPFJhZGlvR3JvdXBBdHRyczxUPj4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcInVsLnVuc3R5bGVkLWxpc3QuZmxleC5jb2wuZ2FwLXZwYWRcIixcblx0XHRcdHtcblx0XHRcdFx0YXJpYUxhYmVsOiBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dChhdHRycy5hcmlhTGFiZWwpLFxuXHRcdFx0XHRyb2xlOiBBcmlhUm9sZS5SYWRpb0dyb3VwLFxuXHRcdFx0fSxcblx0XHRcdGF0dHJzLm9wdGlvbnMubWFwKChvcHRpb24pID0+XG5cdFx0XHRcdHRoaXMucmVuZGVyT3B0aW9uKGF0dHJzLm5hbWUsIG9wdGlvbiwgYXR0cnMuc2VsZWN0ZWRPcHRpb24sIGF0dHJzLmNsYXNzZXM/LmpvaW4oXCIgXCIpLCBhdHRycy5vbk9wdGlvblNlbGVjdGVkLCBhdHRycy5pbmplY3Rpb25NYXApLFxuXHRcdFx0KSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlck9wdGlvbihcblx0XHRncm91cE5hbWU6IE1heWJlVHJhbnNsYXRpb24sXG5cdFx0b3B0aW9uOiBSYWRpb0dyb3VwT3B0aW9uPFQ+LFxuXHRcdHNlbGVjdGVkT3B0aW9uOiBUIHwgbnVsbCxcblx0XHRvcHRpb25DbGFzczogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdG9uT3B0aW9uU2VsZWN0ZWQ6IChhcmcwOiBUKSA9PiB1bmtub3duLFxuXHRcdGluamVjdGlvbk1hcD86IE1hcDxzdHJpbmcsIENoaWxkPixcblx0KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IG5hbWUgPSBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dChncm91cE5hbWUpXG5cdFx0Y29uc3QgdmFsdWVTdHJpbmcgPSBTdHJpbmcob3B0aW9uLnZhbHVlKVxuXHRcdGNvbnN0IGlzU2VsZWN0ZWQgPSBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkT3B0aW9uXG5cblx0XHQvLyBJRHMgdXNlZCB0byBsaW5rIHRoZSBsYWJlbCBhbmQgZGVzY3JpcHRpb24gZm9yIGFjY2Vzc2liaWxpdHlcblx0XHRjb25zdCBvcHRpb25JZCA9IGAke25hbWV9LSR7dmFsdWVTdHJpbmd9YFxuXG5cdFx0Ly8gVGhlIHdyYXBwZXIgaXMgbmVlZGVkIGJlY2F1c2UgPGlucHV0PiBpcyBzZWxmLWNsb3NpbmcgYW5kIHdpbGwgbm90IHRha2UgdGhlIGxhYmVsIGFzIGEgY2hpbGRcblx0XHRyZXR1cm4gbShcblx0XHRcdFwibGkuZmxleC5nYXAtdnBhZC5jdXJzb3ItcG9pbnRlci5mdWxsLXdpZHRoLmZsYXNoXCIsXG5cdFx0XHR7XG5cdFx0XHRcdGNsYXNzOiBvcHRpb25DbGFzcyA/PyBcIlwiLFxuXHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJDbGlja2VkP1wiKVxuXHRcdFx0XHRcdG9uT3B0aW9uU2VsZWN0ZWQob3B0aW9uLnZhbHVlKVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0bShcImlucHV0W3R5cGU9cmFkaW9dLm0tMC5iaWctcmFkaW8uY29udGVudC1hY2NlbnQtYWNjZW50XCIsIHtcblx0XHRcdFx0XHQvKiBUaGUgYG5hbWVgIGF0dHJpYnV0ZSBkZWZpbmVzIHRoZSBncm91cCB0aGUgcmFkaW8gYnV0dG9uIGJlbG9uZ3MgdG8uIE5vdCB0aGUgbmFtZS9sYWJlbCBvZiB0aGUgcmFkaW8gYnV0dG9uIGl0c2VsZi5cblx0XHRcdFx0XHQgKiBTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSFRNTC9FbGVtZW50L2lucHV0L3JhZGlvI2RlZmluaW5nX2FfcmFkaW9fZ3JvdXBcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRuYW1lOiBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dChncm91cE5hbWUpLFxuXHRcdFx0XHRcdHZhbHVlOiB2YWx1ZVN0cmluZyxcblx0XHRcdFx0XHRpZDogb3B0aW9uSWQsXG5cdFx0XHRcdFx0Ly8gSGFuZGxlIGNoYW5nZXMgaW4gdmFsdWUgZnJvbSB0aGUgYXR0cmlidXRlc1xuXHRcdFx0XHRcdGNoZWNrZWQ6IGlzU2VsZWN0ZWQgPyB0cnVlIDogbnVsbCxcblx0XHRcdFx0XHRvbmtleWRvd246IChldmVudDogS2V5Ym9hcmRFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGlzS2V5UHJlc3NlZChldmVudC5rZXksIEtleXMuUkVUVVJOKSkge1xuXHRcdFx0XHRcdFx0XHRvbk9wdGlvblNlbGVjdGVkKG9wdGlvbi52YWx1ZSlcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bShcIi5mbGV4LmZsZXgtY29sdW1uLmZ1bGwtd2lkdGhcIiwgW1xuXHRcdFx0XHRcdG0oXCJsYWJlbC5jdXJzb3ItcG9pbnRlclwiLCB7IGZvcjogb3B0aW9uSWQgfSwgbGFuZy5nZXRUcmFuc2xhdGlvblRleHQob3B0aW9uLm5hbWUpKSxcblx0XHRcdFx0XHR0aGlzLmdldEluamVjdGlvbihTdHJpbmcob3B0aW9uLnZhbHVlKSwgaW5qZWN0aW9uTWFwKSxcblx0XHRcdFx0XSksXG5cdFx0XHRdLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgZ2V0SW5qZWN0aW9uKGtleTogc3RyaW5nLCBpbmplY3Rpb25NYXA/OiBNYXA8c3RyaW5nLCBDaGlsZD4pOiBDaGlsZCB7XG5cdFx0aWYgKCFpbmplY3Rpb25NYXAgfHwgIWluamVjdGlvbk1hcC5oYXMoa2V5KSkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5qZWN0aW9uTWFwLmdldChrZXkpXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkLCBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRXaGVuTW9kZWwgfSBmcm9tIFwiLi4vZXZlbnRlZGl0b3ItbW9kZWwvQ2FsZW5kYXJFdmVudFdoZW5Nb2RlbC5qc1wiXG5pbXBvcnQgeyBUZXh0RmllbGRUeXBlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9UZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBFbmRUeXBlLCBSZXBlYXRQZXJpb2QsIFRhYkluZGV4IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IERhdGVQaWNrZXIsIERhdGVQaWNrZXJBdHRycywgUGlja2VyUG9zaXRpb24gfSBmcm9tIFwiLi4vcGlja2Vycy9EYXRlUGlja2VyLmpzXCJcblxuaW1wb3J0IHsgY3JlYXRlQ3VzdG9tRW5kVHlwZU9wdGlvbnMsIGNyZWF0ZUludGVydmFsVmFsdWVzLCBjcmVhdGVSZXBlYXRSdWxlT3B0aW9ucywgY3VzdG9tRnJlcXVlbmNpZXNPcHRpb25zLCBJbnRlcnZhbE9wdGlvbiB9IGZyb20gXCIuLi9DYWxlbmRhckd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBDYXJkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9DYXJkLmpzXCJcbmltcG9ydCB7IFJhZGlvR3JvdXAsIFJhZGlvR3JvdXBBdHRycywgUmFkaW9Hcm91cE9wdGlvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvUmFkaW9Hcm91cC5qc1wiXG5pbXBvcnQgeyBJbnB1dE1vZGUsIFNpbmdsZUxpbmVUZXh0RmllbGQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1NpbmdsZUxpbmVUZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgU2VsZWN0LCBTZWxlY3RBdHRyaWJ1dGVzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9TZWxlY3QuanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgRGl2aWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL0RpdmlkZXIuanNcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZS5qc1wiXG5pbXBvcnQgeyBpc0FwcCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnYuanNcIlxuXG5leHBvcnQgdHlwZSBSZXBlYXRSdWxlRWRpdG9yQXR0cnMgPSB7XG5cdG1vZGVsOiBDYWxlbmRhckV2ZW50V2hlbk1vZGVsXG5cdHN0YXJ0T2ZUaGVXZWVrT2Zmc2V0OiBudW1iZXJcblx0d2lkdGg6IG51bWJlclxuXHRiYWNrQWN0aW9uOiAoKSA9PiB2b2lkXG59XG5cbnR5cGUgUmVwZWF0UnVsZU9wdGlvbiA9IFJlcGVhdFBlcmlvZCB8IFwiQ1VTVE9NXCIgfCBudWxsXG5cbmV4cG9ydCBjbGFzcyBSZXBlYXRSdWxlRWRpdG9yIGltcGxlbWVudHMgQ29tcG9uZW50PFJlcGVhdFJ1bGVFZGl0b3JBdHRycz4ge1xuXHRwcml2YXRlIHJlcGVhdFJ1bGVUeXBlOiBSZXBlYXRSdWxlT3B0aW9uIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSByZXBlYXRJbnRlcnZhbDogbnVtYmVyID0gMFxuXHRwcml2YXRlIGludGVydmFsT3B0aW9uczogc3RyZWFtPEludGVydmFsT3B0aW9uW10+ID0gc3RyZWFtKFtdKVxuXHRwcml2YXRlIGludGVydmFsRXhwYW5kZWQ6IGJvb2xlYW4gPSBmYWxzZVxuXG5cdHByaXZhdGUgbnVtYmVyVmFsdWVzOiBJbnRlcnZhbE9wdGlvbltdID0gY3JlYXRlSW50ZXJ2YWxWYWx1ZXMoKVxuXG5cdHByaXZhdGUgb2NjdXJyZW5jZXNPcHRpb25zOiBzdHJlYW08SW50ZXJ2YWxPcHRpb25bXT4gPSBzdHJlYW0oW10pXG5cdHByaXZhdGUgb2NjdXJyZW5jZXNFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlXG5cdHByaXZhdGUgcmVwZWF0T2NjdXJyZW5jZXM6IG51bWJlclxuXG5cdGNvbnN0cnVjdG9yKHsgYXR0cnMgfTogVm5vZGU8UmVwZWF0UnVsZUVkaXRvckF0dHJzPikge1xuXHRcdGlmIChhdHRycy5tb2RlbC5yZXBlYXRQZXJpb2QgIT0gbnVsbCkge1xuXHRcdFx0dGhpcy5yZXBlYXRSdWxlVHlwZSA9IHRoaXMuZ2V0UmVwZWF0VHlwZShhdHRycy5tb2RlbC5yZXBlYXRQZXJpb2QsIGF0dHJzLm1vZGVsLnJlcGVhdEludGVydmFsLCBhdHRycy5tb2RlbC5yZXBlYXRFbmRUeXBlKVxuXHRcdH1cblxuXHRcdHRoaXMuaW50ZXJ2YWxPcHRpb25zKHRoaXMubnVtYmVyVmFsdWVzKVxuXHRcdHRoaXMub2NjdXJyZW5jZXNPcHRpb25zKHRoaXMubnVtYmVyVmFsdWVzKVxuXG5cdFx0dGhpcy5yZXBlYXRJbnRlcnZhbCA9IGF0dHJzLm1vZGVsLnJlcGVhdEludGVydmFsXG5cdFx0dGhpcy5yZXBlYXRPY2N1cnJlbmNlcyA9IGF0dHJzLm1vZGVsLnJlcGVhdEVuZE9jY3VycmVuY2VzXG5cdH1cblxuXHRwcml2YXRlIGdldFJlcGVhdFR5cGUocGVyaW9kOiBSZXBlYXRQZXJpb2QsIGludGVydmFsOiBudW1iZXIsIGVuZFRpbWU6IEVuZFR5cGUpIHtcblx0XHRpZiAoaW50ZXJ2YWwgPiAxIHx8IGVuZFRpbWUgIT09IEVuZFR5cGUuTmV2ZXIpIHtcblx0XHRcdHJldHVybiBcIkNVU1RPTVwiXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHBlcmlvZFxuXHR9XG5cblx0dmlldyh7IGF0dHJzIH06IFZub2RlPFJlcGVhdFJ1bGVFZGl0b3JBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgY3VzdG9tUnVsZU9wdGlvbnMgPSBjdXN0b21GcmVxdWVuY2llc09wdGlvbnMubWFwKChvcHRpb24pID0+ICh7XG5cdFx0XHQuLi5vcHRpb24sXG5cdFx0XHRuYW1lOiBhdHRycy5tb2RlbC5yZXBlYXRJbnRlcnZhbCA+IDEgPyBvcHRpb24ubmFtZS5wbHVyYWwgOiBvcHRpb24ubmFtZS5zaW5ndWxhcixcblx0XHR9KSkgYXMgUmFkaW9Hcm91cE9wdGlvbjxSZXBlYXRQZXJpb2Q+W11cblxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIucGIucHQuZmxleC5jb2wuZ2FwLXZwYWQuZml0LWhlaWdodFwiLFxuXHRcdFx0e1xuXHRcdFx0XHRjbGFzczogdGhpcy5yZXBlYXRSdWxlVHlwZSA9PT0gXCJDVVNUT01cIiA/IFwiYm94LWNvbnRlbnRcIiA6IFwiXCIsXG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0d2lkdGg6IHB4KGF0dHJzLndpZHRoKSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0Q2FyZCxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRwYWRkaW5nOiBgJHtzaXplLnZwYWR9cHhgLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG0oUmFkaW9Hcm91cCwge1xuXHRcdFx0XHRcdFx0YXJpYUxhYmVsOiBcImNhbGVuZGFyUmVwZWF0aW5nX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRuYW1lOiBcImNhbGVuZGFyUmVwZWF0aW5nX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRvcHRpb25zOiBjcmVhdGVSZXBlYXRSdWxlT3B0aW9ucygpLFxuXHRcdFx0XHRcdFx0c2VsZWN0ZWRPcHRpb246IHRoaXMucmVwZWF0UnVsZVR5cGUsXG5cdFx0XHRcdFx0XHRvbk9wdGlvblNlbGVjdGVkOiAob3B0aW9uOiBSZXBlYXRSdWxlT3B0aW9uKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVwZWF0UnVsZVR5cGUgPSBvcHRpb25cblx0XHRcdFx0XHRcdFx0aWYgKG9wdGlvbiA9PT0gXCJDVVNUT01cIikge1xuXHRcdFx0XHRcdFx0XHRcdGF0dHJzLm1vZGVsLnJlcGVhdFBlcmlvZCA9IGF0dHJzLm1vZGVsLnJlcGVhdFBlcmlvZCA/PyBSZXBlYXRQZXJpb2QuREFJTFlcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRhdHRycy5tb2RlbC5yZXBlYXRJbnRlcnZhbCA9IDFcblx0XHRcdFx0XHRcdFx0XHRhdHRycy5tb2RlbC5yZXBlYXRFbmRUeXBlID0gRW5kVHlwZS5OZXZlclxuXHRcdFx0XHRcdFx0XHRcdGF0dHJzLm1vZGVsLnJlcGVhdFBlcmlvZCA9IG9wdGlvbiBhcyBSZXBlYXRQZXJpb2Rcblx0XHRcdFx0XHRcdFx0XHRhdHRycy5iYWNrQWN0aW9uKClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNsYXNzZXM6IFtcImN1cnNvci1wb2ludGVyXCJdLFxuXHRcdFx0XHRcdH0gc2F0aXNmaWVzIFJhZGlvR3JvdXBBdHRyczxSZXBlYXRSdWxlT3B0aW9uPiksXG5cdFx0XHRcdCksXG5cdFx0XHRcdHRoaXMucmVuZGVyRnJlcXVlbmN5T3B0aW9ucyhhdHRycywgY3VzdG9tUnVsZU9wdGlvbnMpLFxuXHRcdFx0XHR0aGlzLnJlbmRlckVuZE9wdGlvbnMoYXR0cnMpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckVuZE9wdGlvbnMoYXR0cnM6IFJlcGVhdFJ1bGVFZGl0b3JBdHRycykge1xuXHRcdGlmICh0aGlzLnJlcGVhdFJ1bGVUeXBlICE9PSBcIkNVU1RPTVwiKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblxuXHRcdHJldHVybiBtKFwiLmZsZXguY29sXCIsIFtcblx0XHRcdG0oXCJzbWFsbC51cHBlcmNhc2UucGItcy5iLnRleHQtZWxsaXBzaXNcIiwgeyBzdHlsZTogeyBjb2xvcjogdGhlbWUubmF2aWdhdGlvbl9idXR0b24gfSB9LCBsYW5nLmdldChcImNhbGVuZGFyUmVwZWF0U3RvcENvbmRpdGlvbl9sYWJlbFwiKSksXG5cdFx0XHRtKFxuXHRcdFx0XHRDYXJkLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdHBhZGRpbmc6IGAke3NpemUudnBhZH1weGAsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjbGFzc2VzOiBbXCJmbGV4XCIsIFwiY29sXCIsIFwiZ2FwLXZwYWQtc1wiXSxcblx0XHRcdFx0fSxcblx0XHRcdFx0W1xuXHRcdFx0XHRcdG0oUmFkaW9Hcm91cCwge1xuXHRcdFx0XHRcdFx0YXJpYUxhYmVsOiBcImNhbGVuZGFyUmVwZWF0U3RvcENvbmRpdGlvbl9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0bmFtZTogXCJjYWxlbmRhclJlcGVhdFN0b3BDb25kaXRpb25fbGFiZWxcIixcblx0XHRcdFx0XHRcdG9wdGlvbnM6IGNyZWF0ZUN1c3RvbUVuZFR5cGVPcHRpb25zKCksXG5cdFx0XHRcdFx0XHRzZWxlY3RlZE9wdGlvbjogYXR0cnMubW9kZWwucmVwZWF0RW5kVHlwZSxcblx0XHRcdFx0XHRcdG9uT3B0aW9uU2VsZWN0ZWQ6IChvcHRpb246IEVuZFR5cGUpID0+IHtcblx0XHRcdFx0XHRcdFx0YXR0cnMubW9kZWwucmVwZWF0RW5kVHlwZSA9IG9wdGlvblxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNsYXNzZXM6IFtcImN1cnNvci1wb2ludGVyXCJdLFxuXHRcdFx0XHRcdFx0aW5qZWN0aW9uTWFwOiB0aGlzLmJ1aWxkSW5qZWN0aW9ucyhhdHRycyksXG5cdFx0XHRcdFx0fSBzYXRpc2ZpZXMgUmFkaW9Hcm91cEF0dHJzPEVuZFR5cGU+KSxcblx0XHRcdFx0XSxcblx0XHRcdCksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyRnJlcXVlbmN5T3B0aW9ucyhhdHRyczogUmVwZWF0UnVsZUVkaXRvckF0dHJzLCBjdXN0b21SdWxlT3B0aW9uczogUmFkaW9Hcm91cE9wdGlvbjxSZXBlYXRQZXJpb2Q+W10pIHtcblx0XHRpZiAodGhpcy5yZXBlYXRSdWxlVHlwZSAhPT0gXCJDVVNUT01cIikge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRyZXR1cm4gbShcIi5mbGV4LmNvbFwiLCBbXG5cdFx0XHRtKFwic21hbGwudXBwZXJjYXNlLnBiLXMuYi50ZXh0LWVsbGlwc2lzXCIsIHsgc3R5bGU6IHsgY29sb3I6IHRoZW1lLm5hdmlnYXRpb25fYnV0dG9uIH0gfSwgbGFuZy5nZXQoXCJpbnRlcnZhbEZyZXF1ZW5jeV9sYWJlbFwiKSksXG5cdFx0XHRtKFxuXHRcdFx0XHRDYXJkLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdHBhZGRpbmc6IGAwIDAgJHtzaXplLnZwYWR9cHhgLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y2xhc3NlczogW1wiZmxleFwiLCBcImNvbFwiXSxcblx0XHRcdFx0fSxcblx0XHRcdFx0W1xuXHRcdFx0XHRcdHRoaXMucmVuZGVySW50ZXJ2YWxQaWNrZXIoYXR0cnMpLFxuXHRcdFx0XHRcdG0oRGl2aWRlciwgeyBjb2xvcjogdGhlbWUuYnV0dG9uX2J1YmJsZV9iZywgc3R5bGU6IHsgbWFyZ2luOiBgMCAwICR7c2l6ZS52cGFkfXB4YCB9IH0pLFxuXHRcdFx0XHRcdG0oUmFkaW9Hcm91cCwge1xuXHRcdFx0XHRcdFx0YXJpYUxhYmVsOiBcImludGVydmFsRnJlcXVlbmN5X2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRuYW1lOiBcImludGVydmFsRnJlcXVlbmN5X2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRvcHRpb25zOiBjdXN0b21SdWxlT3B0aW9ucyxcblx0XHRcdFx0XHRcdHNlbGVjdGVkT3B0aW9uOiBhdHRycy5tb2RlbC5yZXBlYXRQZXJpb2QsXG5cdFx0XHRcdFx0XHRvbk9wdGlvblNlbGVjdGVkOiAob3B0aW9uOiBSZXBlYXRQZXJpb2QpID0+IHtcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVDdXN0b21SdWxlKGF0dHJzLm1vZGVsLCB7IGludGVydmFsRnJlcXVlbmN5OiBvcHRpb24gfSlcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRjbGFzc2VzOiBbXCJjdXJzb3ItcG9pbnRlclwiLCBcImNhcGl0YWxpemVcIiwgXCJwbC12cGFkLW1cIiwgXCJwci12cGFkLW1cIl0sXG5cdFx0XHRcdFx0fSBzYXRpc2ZpZXMgUmFkaW9Hcm91cEF0dHJzPFJlcGVhdFBlcmlvZD4pLFxuXHRcdFx0XHRdLFxuXHRcdFx0KSxcblx0XHRdKVxuXHR9XG5cblx0cHJpdmF0ZSBidWlsZEluamVjdGlvbnMoYXR0cnM6IFJlcGVhdFJ1bGVFZGl0b3JBdHRycykge1xuXHRcdGNvbnN0IGluamVjdGlvbk1hcCA9IG5ldyBNYXA8c3RyaW5nLCBDaGlsZD4oKVxuXHRcdGluamVjdGlvbk1hcC5zZXQoRW5kVHlwZS5Db3VudCwgdGhpcy5yZW5kZXJFbmRzUGlja2VyKGF0dHJzKSlcblxuXHRcdGluamVjdGlvbk1hcC5zZXQoXG5cdFx0XHRFbmRUeXBlLlVudGlsRGF0ZSxcblx0XHRcdG0oRGF0ZVBpY2tlciwge1xuXHRcdFx0XHRkYXRlOiBhdHRycy5tb2RlbC5yZXBlYXRFbmREYXRlRm9yRGlzcGxheSxcblx0XHRcdFx0b25EYXRlU2VsZWN0ZWQ6IChkYXRlKSA9PiBkYXRlICYmIChhdHRycy5tb2RlbC5yZXBlYXRFbmREYXRlRm9yRGlzcGxheSA9IGRhdGUpLFxuXHRcdFx0XHRsYWJlbDogXCJlbmREYXRlX2xhYmVsXCIsXG5cdFx0XHRcdHVzZUlucHV0QnV0dG9uOiB0cnVlLFxuXHRcdFx0XHRzdGFydE9mVGhlV2Vla09mZnNldDogYXR0cnMuc3RhcnRPZlRoZVdlZWtPZmZzZXQsXG5cdFx0XHRcdHBvc2l0aW9uOiBQaWNrZXJQb3NpdGlvbi5UT1AsXG5cdFx0XHRcdGNsYXNzZXM6IFtcImZ1bGwtd2lkdGhcIiwgXCJmbGV4LWdyb3dcIiwgYXR0cnMubW9kZWwucmVwZWF0RW5kVHlwZSAhPT0gRW5kVHlwZS5VbnRpbERhdGUgPyBcImRpc2FibGVkXCIgOiBcIlwiXSxcblx0XHRcdH0gc2F0aXNmaWVzIERhdGVQaWNrZXJBdHRycyksXG5cdFx0KVxuXG5cdFx0cmV0dXJuIGluamVjdGlvbk1hcFxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVDdXN0b21SdWxlKHdoZW5Nb2RlbDogQ2FsZW5kYXJFdmVudFdoZW5Nb2RlbCwgY3VzdG9tUnVsZTogUGFydGlhbDx7IGludGVydmFsOiBudW1iZXI7IGludGVydmFsRnJlcXVlbmN5OiBSZXBlYXRQZXJpb2QgfT4pIHtcblx0XHRjb25zdCB7IGludGVydmFsLCBpbnRlcnZhbEZyZXF1ZW5jeSB9ID0gY3VzdG9tUnVsZVxuXG5cdFx0aWYgKGludGVydmFsICYmICFpc05hTihpbnRlcnZhbCkpIHtcblx0XHRcdHdoZW5Nb2RlbC5yZXBlYXRJbnRlcnZhbCA9IGludGVydmFsXG5cdFx0fVxuXG5cdFx0aWYgKGludGVydmFsRnJlcXVlbmN5KSB7XG5cdFx0XHR3aGVuTW9kZWwucmVwZWF0UGVyaW9kID0gaW50ZXJ2YWxGcmVxdWVuY3lcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckludGVydmFsUGlja2VyKGF0dHJzOiBSZXBlYXRSdWxlRWRpdG9yQXR0cnMpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oU2VsZWN0PEludGVydmFsT3B0aW9uLCBudW1iZXI+LCB7XG5cdFx0XHRvbmNoYW5nZTogKG5ld1ZhbHVlKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLnJlcGVhdEludGVydmFsID09PSBuZXdWYWx1ZS52YWx1ZSkge1xuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5yZXBlYXRJbnRlcnZhbCA9IG5ld1ZhbHVlLnZhbHVlXG5cdFx0XHRcdHRoaXMudXBkYXRlQ3VzdG9tUnVsZShhdHRycy5tb2RlbCwgeyBpbnRlcnZhbDogdGhpcy5yZXBlYXRJbnRlcnZhbCB9KVxuXHRcdFx0XHRtLnJlZHJhdy5zeW5jKClcblx0XHRcdH0sXG5cdFx0XHRvbmNsb3NlOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuaW50ZXJ2YWxFeHBhbmRlZCA9IGZhbHNlXG5cdFx0XHRcdHRoaXMuaW50ZXJ2YWxPcHRpb25zKHRoaXMubnVtYmVyVmFsdWVzKVxuXHRcdFx0fSxcblx0XHRcdHNlbGVjdGVkOiB7IHZhbHVlOiB0aGlzLnJlcGVhdEludGVydmFsLCBuYW1lOiB0aGlzLnJlcGVhdEludGVydmFsLnRvU3RyaW5nKCksIGFyaWFWYWx1ZTogdGhpcy5yZXBlYXRJbnRlcnZhbC50b1N0cmluZygpIH0sXG5cdFx0XHRhcmlhTGFiZWw6IGxhbmcuZ2V0KFwicmVwZWF0c0V2ZXJ5X2xhYmVsXCIpLFxuXHRcdFx0b3B0aW9uczogdGhpcy5pbnRlcnZhbE9wdGlvbnMsXG5cdFx0XHRub0ljb246IHRydWUsXG5cdFx0XHRleHBhbmRlZDogdHJ1ZSxcblx0XHRcdHRhYkluZGV4OiBpc0FwcCgpID8gTnVtYmVyKFRhYkluZGV4LkRlZmF1bHQpIDogTnVtYmVyKFRhYkluZGV4LlByb2dyYW1tYXRpYyksXG5cdFx0XHRjbGFzc2VzOiBbXCJuby1hcHBlYXJhbmNlXCJdLFxuXHRcdFx0cmVuZGVyRGlzcGxheTogKCkgPT5cblx0XHRcdFx0bShTaW5nbGVMaW5lVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0Y2xhc3NlczogW1wiYm9yZGVyLXJhZGl1cy1ib3R0b20tMFwiXSxcblx0XHRcdFx0XHR2YWx1ZTogaXNOYU4odGhpcy5yZXBlYXRJbnRlcnZhbCkgPyBcIlwiIDogdGhpcy5yZXBlYXRJbnRlcnZhbC50b1N0cmluZygpLFxuXHRcdFx0XHRcdGlucHV0TW9kZTogaXNBcHAoKSA/IElucHV0TW9kZS5OT05FIDogSW5wdXRNb2RlLlRFWFQsXG5cdFx0XHRcdFx0cmVhZG9ubHk6IGlzQXBwKCksXG5cdFx0XHRcdFx0b25pbnB1dDogKHZhbDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAodmFsICE9PSBcIlwiICYmIHRoaXMucmVwZWF0SW50ZXJ2YWwgPT09IE51bWJlcih2YWwpKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0aGlzLnJlcGVhdEludGVydmFsID0gdmFsID09PSBcIlwiID8gTmFOIDogTnVtYmVyKHZhbClcblx0XHRcdFx0XHRcdGlmICghaXNOYU4odGhpcy5yZXBlYXRJbnRlcnZhbCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5pbnRlcnZhbE9wdGlvbnModGhpcy5udW1iZXJWYWx1ZXMuZmlsdGVyKChvcHQpID0+IG9wdC52YWx1ZS50b1N0cmluZygpLnN0YXJ0c1dpdGgodmFsKSkpXG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlQ3VzdG9tUnVsZShhdHRycy5tb2RlbCwgeyBpbnRlcnZhbDogdGhpcy5yZXBlYXRJbnRlcnZhbCB9KVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5pbnRlcnZhbE9wdGlvbnModGhpcy5udW1iZXJWYWx1ZXMpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRhcmlhTGFiZWw6IGxhbmcuZ2V0KFwicmVwZWF0c0V2ZXJ5X2xhYmVsXCIpLFxuXHRcdFx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuaW50ZXJ2YWxFeHBhbmRlZCkge1xuXHRcdFx0XHRcdFx0XHQ7KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5wYXJlbnRFbGVtZW50Py5jbGljaygpXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW50ZXJ2YWxFeHBhbmRlZCA9IHRydWVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9uZm9jdXM6IChldmVudDogRm9jdXNFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKCF0aGlzLmludGVydmFsRXhwYW5kZWQpIHtcblx0XHRcdFx0XHRcdFx0OyhldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLnBhcmVudEVsZW1lbnQ/LmNsaWNrKClcblx0XHRcdFx0XHRcdFx0dGhpcy5pbnRlcnZhbEV4cGFuZGVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25ibHVyOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IHtcblx0XHRcdFx0XHRcdGlmIChpc05hTih0aGlzLnJlcGVhdEludGVydmFsKSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlcGVhdEludGVydmFsID0gdGhpcy5udW1iZXJWYWx1ZXNbMF0udmFsdWVcblx0XHRcdFx0XHRcdFx0dGhpcy51cGRhdGVDdXN0b21SdWxlKGF0dHJzLm1vZGVsLCB7IGludGVydmFsOiB0aGlzLnJlcGVhdEludGVydmFsIH0pXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMucmVwZWF0SW50ZXJ2YWwgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXBlYXRJbnRlcnZhbCA9IHRoaXMubnVtYmVyVmFsdWVzWzBdLnZhbHVlXG5cdFx0XHRcdFx0XHRcdHRoaXMudXBkYXRlQ3VzdG9tUnVsZShhdHRycy5tb2RlbCwgeyBpbnRlcnZhbDogdGhpcy5yZXBlYXRJbnRlcnZhbCB9KVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdHRleHRBbGlnbjogXCJjZW50ZXJcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1heDogMjU2LFxuXHRcdFx0XHRcdG1pbjogMSxcblx0XHRcdFx0XHR0eXBlOiBUZXh0RmllbGRUeXBlLk51bWJlcixcblx0XHRcdFx0fSksXG5cdFx0XHRyZW5kZXJPcHRpb246IChvcHRpb24pID0+XG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCJidXR0b24uaXRlbXMtY2VudGVyLmZsZXgtZ3Jvd1wiLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNsYXNzOiBcInN0YXRlLWJnIGJ1dHRvbi1jb250ZW50IGRyb3Bkb3duLWJ1dHRvbiBwdC1zIHBiLXMgYnV0dG9uLW1pbi1oZWlnaHRcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9wdGlvbi5uYW1lLFxuXHRcdFx0XHQpLFxuXHRcdFx0a2VlcEZvY3VzOiB0cnVlLFxuXHRcdH0gc2F0aXNmaWVzIFNlbGVjdEF0dHJpYnV0ZXM8SW50ZXJ2YWxPcHRpb24sIG51bWJlcj4pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckVuZHNQaWNrZXIoYXR0cnM6IFJlcGVhdFJ1bGVFZGl0b3JBdHRycyk6IENoaWxkIHtcblx0XHRyZXR1cm4gbShTZWxlY3Q8SW50ZXJ2YWxPcHRpb24sIG51bWJlcj4sIHtcblx0XHRcdG9uY2hhbmdlOiAobmV3VmFsdWUpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMucmVwZWF0T2NjdXJyZW5jZXMgPT09IG5ld1ZhbHVlLnZhbHVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLnJlcGVhdE9jY3VycmVuY2VzID0gbmV3VmFsdWUudmFsdWVcblx0XHRcdFx0YXR0cnMubW9kZWwucmVwZWF0RW5kT2NjdXJyZW5jZXMgPSBuZXdWYWx1ZS52YWx1ZVxuXHRcdFx0fSxcblx0XHRcdG9uY2xvc2U6ICgpID0+IHtcblx0XHRcdFx0dGhpcy5vY2N1cnJlbmNlc0V4cGFuZGVkID0gZmFsc2Vcblx0XHRcdFx0dGhpcy5vY2N1cnJlbmNlc09wdGlvbnModGhpcy5udW1iZXJWYWx1ZXMpXG5cdFx0XHR9LFxuXHRcdFx0c2VsZWN0ZWQ6IHsgdmFsdWU6IHRoaXMucmVwZWF0T2NjdXJyZW5jZXMsIG5hbWU6IHRoaXMucmVwZWF0T2NjdXJyZW5jZXMudG9TdHJpbmcoKSwgYXJpYVZhbHVlOiB0aGlzLnJlcGVhdE9jY3VycmVuY2VzLnRvU3RyaW5nKCkgfSxcblx0XHRcdGFyaWFMYWJlbDogbGFuZy5nZXQoXCJvY2N1cnJlbmNlc0NvdW50X2xhYmVsXCIpLFxuXHRcdFx0b3B0aW9uczogdGhpcy5vY2N1cnJlbmNlc09wdGlvbnMsXG5cdFx0XHRub0ljb246IHRydWUsXG5cdFx0XHRleHBhbmRlZDogdHJ1ZSxcblx0XHRcdHRhYkluZGV4OiBpc0FwcCgpID8gTnVtYmVyKFRhYkluZGV4LkRlZmF1bHQpIDogTnVtYmVyKFRhYkluZGV4LlByb2dyYW1tYXRpYyksXG5cdFx0XHRjbGFzc2VzOiBbXCJuby1hcHBlYXJhbmNlXCJdLFxuXHRcdFx0cmVuZGVyRGlzcGxheTogKCkgPT5cblx0XHRcdFx0bShTaW5nbGVMaW5lVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0Y2xhc3NlczogW1widHV0YXVpLWJ1dHRvbi1vdXRsaW5lXCIsIFwidGV4dC1jZW50ZXJcIiwgXCJib3JkZXItY29udGVudC1tZXNzYWdlLWJnXCJdLFxuXHRcdFx0XHRcdHZhbHVlOiBpc05hTih0aGlzLnJlcGVhdE9jY3VycmVuY2VzKSA/IFwiXCIgOiB0aGlzLnJlcGVhdE9jY3VycmVuY2VzLnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0aW5wdXRNb2RlOiBpc0FwcCgpID8gSW5wdXRNb2RlLk5PTkUgOiBJbnB1dE1vZGUuVEVYVCxcblx0XHRcdFx0XHRyZWFkb25seTogaXNBcHAoKSxcblx0XHRcdFx0XHRvbmlucHV0OiAodmFsOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdGlmICh2YWwgIT09IFwiXCIgJiYgdGhpcy5yZXBlYXRPY2N1cnJlbmNlcyA9PT0gTnVtYmVyKHZhbCkpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRoaXMucmVwZWF0T2NjdXJyZW5jZXMgPSB2YWwgPT09IFwiXCIgPyBOYU4gOiBOdW1iZXIodmFsKVxuXG5cdFx0XHRcdFx0XHRpZiAoIWlzTmFOKHRoaXMucmVwZWF0T2NjdXJyZW5jZXMpKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMub2NjdXJyZW5jZXNPcHRpb25zKHRoaXMubnVtYmVyVmFsdWVzLmZpbHRlcigob3B0KSA9PiBvcHQudmFsdWUudG9TdHJpbmcoKS5zdGFydHNXaXRoKHZhbCkpKVxuXHRcdFx0XHRcdFx0XHRhdHRycy5tb2RlbC5yZXBlYXRFbmRPY2N1cnJlbmNlcyA9IHRoaXMucmVwZWF0T2NjdXJyZW5jZXNcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMub2NjdXJyZW5jZXNPcHRpb25zKHRoaXMubnVtYmVyVmFsdWVzKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YXJpYUxhYmVsOiBsYW5nLmdldChcIm9jY3VycmVuY2VzQ291bnRfbGFiZWxcIiksXG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdHRleHRBbGlnbjogXCJjZW50ZXJcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9uY2xpY2s6IChlOiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMub2NjdXJyZW5jZXNFeHBhbmRlZCkge1xuXHRcdFx0XHRcdFx0XHQ7KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5wYXJlbnRFbGVtZW50Py5jbGljaygpXG5cdFx0XHRcdFx0XHRcdHRoaXMub2NjdXJyZW5jZXNFeHBhbmRlZCA9IHRydWVcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9uZm9jdXM6IChldmVudDogRm9jdXNFdmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKCF0aGlzLm9jY3VycmVuY2VzRXhwYW5kZWQpIHtcblx0XHRcdFx0XHRcdFx0OyhldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpLnBhcmVudEVsZW1lbnQ/LmNsaWNrKClcblx0XHRcdFx0XHRcdFx0dGhpcy5vY2N1cnJlbmNlc0V4cGFuZGVkID0gdHJ1ZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25ibHVyOiAoZXZlbnQ6IEZvY3VzRXZlbnQpID0+IHtcblx0XHRcdFx0XHRcdGlmIChpc05hTih0aGlzLnJlcGVhdE9jY3VycmVuY2VzKSkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlcGVhdE9jY3VycmVuY2VzID0gdGhpcy5udW1iZXJWYWx1ZXNbMF0udmFsdWVcblx0XHRcdFx0XHRcdFx0YXR0cnMubW9kZWwucmVwZWF0RW5kT2NjdXJyZW5jZXMgPSB0aGlzLnJlcGVhdE9jY3VycmVuY2VzXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMucmVwZWF0T2NjdXJyZW5jZXMgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5yZXBlYXRPY2N1cnJlbmNlcyA9IHRoaXMubnVtYmVyVmFsdWVzWzBdLnZhbHVlXG5cdFx0XHRcdFx0XHRcdGF0dHJzLm1vZGVsLnJlcGVhdEVuZE9jY3VycmVuY2VzID0gdGhpcy5yZXBlYXRPY2N1cnJlbmNlc1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bWF4OiAyNTYsXG5cdFx0XHRcdFx0bWluOiAxLFxuXHRcdFx0XHRcdHR5cGU6IFRleHRGaWVsZFR5cGUuTnVtYmVyLFxuXHRcdFx0XHR9KSxcblx0XHRcdHJlbmRlck9wdGlvbjogKG9wdGlvbikgPT5cblx0XHRcdFx0bShcblx0XHRcdFx0XHRcImJ1dHRvbi5pdGVtcy1jZW50ZXIuZmxleC1ncm93XCIsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2xhc3M6IFwic3RhdGUtYmcgYnV0dG9uLWNvbnRlbnQgZHJvcGRvd24tYnV0dG9uIHB0LXMgcGItcyBidXR0b24tbWluLWhlaWdodFwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b3B0aW9uLm5hbWUsXG5cdFx0XHRcdCksXG5cdFx0XHRrZWVwRm9jdXM6IHRydWUsXG5cdFx0fSBzYXRpc2ZpZXMgU2VsZWN0QXR0cmlidXRlczxJbnRlcnZhbE9wdGlvbiwgbnVtYmVyPilcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgQXR0ZW5kZWVMaXN0RWRpdG9yIH0gZnJvbSBcIi4vQXR0ZW5kZWVMaXN0RWRpdG9yLmpzXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3IuanNcIlxuaW1wb3J0IHsgRXZlbnRUaW1lRWRpdG9yLCBFdmVudFRpbWVFZGl0b3JBdHRycyB9IGZyb20gXCIuL0V2ZW50VGltZUVkaXRvci5qc1wiXG5pbXBvcnQgeyBkZWZhdWx0Q2FsZW5kYXJDb2xvciwgVGFiSW5kZXgsIFRpbWVGb3JtYXQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgbGFuZywgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgUmVjaXBpZW50c1NlYXJjaE1vZGVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9taXNjL1JlY2lwaWVudHNTZWFyY2hNb2RlbC5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckluZm8gfSBmcm9tIFwiLi4vLi4vbW9kZWwvQ2FsZW5kYXJNb2RlbC5qc1wiXG5pbXBvcnQgeyBBbGFybUludGVydmFsIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9jYWxlbmRhci9kYXRlL0NhbGVuZGFyVXRpbHMuanNcIlxuaW1wb3J0IHsgSHRtbEVkaXRvciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2VkaXRvci9IdG1sRWRpdG9yLmpzXCJcbmltcG9ydCB7IEJhbm5lclR5cGUsIEluZm9CYW5uZXIsIEluZm9CYW5uZXJBdHRycyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvSW5mb0Jhbm5lci5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckV2ZW50TW9kZWwsIENhbGVuZGFyT3BlcmF0aW9uLCBSZWFkb25seVJlYXNvbiB9IGZyb20gXCIuLi9ldmVudGVkaXRvci1tb2RlbC9DYWxlbmRhckV2ZW50TW9kZWwuanNcIlxuaW1wb3J0IHsgZ2V0U2hhcmVkR3JvdXBOYW1lIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9zaGFyaW5nL0dyb3VwVXRpbHMuanNcIlxuaW1wb3J0IHsgUmVtaW5kZXJzRWRpdG9yLCBSZW1pbmRlcnNFZGl0b3JBdHRycyB9IGZyb20gXCIuLi9SZW1pbmRlcnNFZGl0b3IuanNcIlxuaW1wb3J0IHsgU2luZ2xlTGluZVRleHRGaWVsZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvU2luZ2xlTGluZVRleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQ2FyZC5qc1wiXG5pbXBvcnQgeyBTZWxlY3QsIFNlbGVjdEF0dHJpYnV0ZXMsIFNlbGVjdE9wdGlvbiB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvU2VsZWN0LmpzXCJcbmltcG9ydCB7IEljb24sIEljb25TaXplIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHsgZGVlcEVxdWFsIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBCdXR0b25Db2xvciwgZ2V0Q29sb3JzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgUmVwZWF0UnVsZUVkaXRvciwgUmVwZWF0UnVsZUVkaXRvckF0dHJzIH0gZnJvbSBcIi4vUmVwZWF0UnVsZUVkaXRvci5qc1wiXG5pbXBvcnQgdHlwZSB7IENhbGVuZGFyUmVwZWF0UnVsZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IGZvcm1hdFJlcGV0aXRpb25FbmQsIGZvcm1hdFJlcGV0aXRpb25GcmVxdWVuY3kgfSBmcm9tIFwiLi4vZXZlbnRwb3B1cC9FdmVudFByZXZpZXdWaWV3LmpzXCJcbmltcG9ydCB7IFRleHRGaWVsZFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyBEZWZhdWx0QW5pbWF0aW9uVGltZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2FuaW1hdGlvbi9BbmltYXRpb25zLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyBTZWN0aW9uQnV0dG9uIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9idXR0b25zL1NlY3Rpb25CdXR0b24uanNcIlxuXG5leHBvcnQgdHlwZSBDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycyA9IHtcblx0bW9kZWw6IENhbGVuZGFyRXZlbnRNb2RlbFxuXHRncm91cENvbG9yczogTWFwPElkLCBzdHJpbmc+XG5cdHJlY2lwaWVudHNTZWFyY2g6IFJlY2lwaWVudHNTZWFyY2hNb2RlbFxuXHRkZXNjcmlwdGlvbkVkaXRvcjogSHRtbEVkaXRvclxuXHRzdGFydE9mVGhlV2Vla09mZnNldDogbnVtYmVyXG5cdHRpbWVGb3JtYXQ6IFRpbWVGb3JtYXRcblx0ZGVmYXVsdEFsYXJtczogTWFwPElkLCBBbGFybUludGVydmFsW10+XG5cdG5hdmlnYXRpb25DYWxsYmFjazogKHRhcmdldFBhZ2U6IEVkaXRvclBhZ2VzLCBjYWxsQmFjaz86ICguLi5hcmdzOiBhbnkpID0+IHVua25vd24pID0+IHVua25vd25cblx0Y3VycmVudFBhZ2U6IHN0cmVhbTxFZGl0b3JQYWdlcz5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBDYWxlbmRhclNlbGVjdEl0ZW0gZXh0ZW5kcyBTZWxlY3RPcHRpb248Q2FsZW5kYXJJbmZvPiB7XG5cdGNvbG9yOiBzdHJpbmdcblx0bmFtZTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3JnYW5pemVyU2VsZWN0SXRlbSBleHRlbmRzIFNlbGVjdE9wdGlvbjxzdHJpbmc+IHtcblx0bmFtZTogc3RyaW5nXG5cdGFkZHJlc3M6IHN0cmluZ1xufVxuXG5leHBvcnQgZW51bSBFZGl0b3JQYWdlcyB7XG5cdE1BSU4sXG5cdFJFUEVBVF9SVUxFUyxcblx0R1VFU1RTLFxufVxuXG4vKipcbiAqIGNvbWJpbmVzIHNldmVyYWwgc2VtaS1yZWxhdGVkIGVkaXRvciBjb21wb25lbnRzIGludG8gYSBmdWxsIGVkaXRvciBmb3IgZWRpdGluZyBjYWxlbmRhciBldmVudHNcbiAqIHRvIGJlIGRpc3BsYXllZCBpbiBhIGRpYWxvZy5cbiAqXG4gKiBjb250cm9scyB0aGUgZW5hYmxpbmcvZGlzYWJsaW5nIG9mIGNlcnRhaW4gZWRpdG9yIGNvbXBvbmVudHMgYW5kIHRoZSBkaXNwbGF5IG9mIGFkZGl0aW9uYWwgaW5mb1xuICogaW4gdGhlIGRpYWxvZyBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgdGhlIGV2ZW50IGJlaW5nIGVkaXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbGVuZGFyRXZlbnRFZGl0VmlldyBpbXBsZW1lbnRzIENvbXBvbmVudDxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4ge1xuXHRwcml2YXRlIHJlYWRvbmx5IHRpbWVGb3JtYXQ6IFRpbWVGb3JtYXRcblx0cHJpdmF0ZSByZWFkb25seSBzdGFydE9mVGhlV2Vla09mZnNldDogbnVtYmVyXG5cdHByaXZhdGUgcmVhZG9ubHkgZGVmYXVsdEFsYXJtczogTWFwPElkLCBBbGFybUludGVydmFsW10+XG5cblx0cHJpdmF0ZSB0cmFuc2l0aW9uUGFnZTogRWRpdG9yUGFnZXMgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGhhc0FuaW1hdGlvbkVuZGVkID0gdHJ1ZVxuXHRwcml2YXRlIHBhZ2VzOiBNYXA8RWRpdG9yUGFnZXMsICguLi5hcmdzOiBhbnkpID0+IENoaWxkcmVuPiA9IG5ldyBNYXAoKVxuXHRwcml2YXRlIHBhZ2VzV3JhcHBlckRvbUVsZW1lbnQhOiBIVE1MRWxlbWVudFxuXHRwcml2YXRlIGFsbG93UmVuZGVyTWFpblBhZ2U6IHN0cmVhbTxib29sZWFuPiA9IHN0cmVhbSh0cnVlKVxuXHRwcml2YXRlIGRpYWxvZ0hlaWdodDogbnVtYmVyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBwYWdlV2lkdGg6IG51bWJlciA9IC0xXG5cdHByaXZhdGUgdHJhbnNsYXRlID0gMFxuXG5cdGNvbnN0cnVjdG9yKHZub2RlOiBWbm9kZTxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4pIHtcblx0XHR0aGlzLnRpbWVGb3JtYXQgPSB2bm9kZS5hdHRycy50aW1lRm9ybWF0XG5cdFx0dGhpcy5zdGFydE9mVGhlV2Vla09mZnNldCA9IHZub2RlLmF0dHJzLnN0YXJ0T2ZUaGVXZWVrT2Zmc2V0XG5cdFx0dGhpcy5kZWZhdWx0QWxhcm1zID0gdm5vZGUuYXR0cnMuZGVmYXVsdEFsYXJtc1xuXG5cdFx0aWYgKHZub2RlLmF0dHJzLm1vZGVsLm9wZXJhdGlvbiA9PSBDYWxlbmRhck9wZXJhdGlvbi5DcmVhdGUpIHtcblx0XHRcdGNvbnN0IGluaXRpYWxBbGFybXMgPSB2bm9kZS5hdHRycy5kZWZhdWx0QWxhcm1zLmdldCh2bm9kZS5hdHRycy5tb2RlbC5lZGl0TW9kZWxzLndob01vZGVsLnNlbGVjdGVkQ2FsZW5kYXIuZ3JvdXAuX2lkKSA/PyBbXVxuXHRcdFx0dm5vZGUuYXR0cnMubW9kZWwuZWRpdE1vZGVscy5hbGFybU1vZGVsLmFkZEFsbChpbml0aWFsQWxhcm1zKVxuXHRcdH1cblxuXHRcdHRoaXMucGFnZXMuc2V0KEVkaXRvclBhZ2VzLlJFUEVBVF9SVUxFUywgdGhpcy5yZW5kZXJSZXBlYXRSdWxlc1BhZ2UpXG5cdFx0dGhpcy5wYWdlcy5zZXQoRWRpdG9yUGFnZXMuR1VFU1RTLCB0aGlzLnJlbmRlckd1ZXN0c1BhZ2UpXG5cblx0XHR2bm9kZS5hdHRycy5jdXJyZW50UGFnZS5tYXAoKHBhZ2UpID0+IHtcblx0XHRcdHRoaXMuaGFzQW5pbWF0aW9uRW5kZWQgPSBmYWxzZVxuXG5cdFx0XHRpZiAocGFnZSA9PT0gRWRpdG9yUGFnZXMuTUFJTikge1xuXHRcdFx0XHR0aGlzLmFsbG93UmVuZGVyTWFpblBhZ2UodHJ1ZSlcblx0XHRcdFx0dGhpcy50cmFuc2xhdGUgPSAwXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdHRoaXMuYWxsb3dSZW5kZXJNYWluUGFnZS5tYXAoKGFsbG93UmVuZGVyaW5nKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5oYW5kbGVFZGl0b3JTdGF0dXMoYWxsb3dSZW5kZXJpbmcsIHZub2RlKVxuXHRcdH0pXG5cdH1cblxuXHRvbnJlbW92ZSh2bm9kZTogVm5vZGU8Q2FsZW5kYXJFdmVudEVkaXRWaWV3QXR0cnM+KSB7XG5cdFx0dm5vZGUuYXR0cnMuY3VycmVudFBhZ2UuZW5kKHRydWUpXG5cdFx0dGhpcy5hbGxvd1JlbmRlck1haW5QYWdlLmVuZCh0cnVlKVxuXHR9XG5cblx0cHJpdmF0ZSBoYW5kbGVFZGl0b3JTdGF0dXMoYWxsb3dSZW5kZXJpbmc6IGJvb2xlYW4sIHZub2RlOiBWbm9kZTxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4pIHtcblx0XHRpZiAoYWxsb3dSZW5kZXJpbmcgJiYgdm5vZGUuYXR0cnMuY3VycmVudFBhZ2UoKSA9PT0gRWRpdG9yUGFnZXMuTUFJTikge1xuXHRcdFx0aWYgKHZub2RlLmF0dHJzLmRlc2NyaXB0aW9uRWRpdG9yLmVkaXRvci5kb21FbGVtZW50KSB7XG5cdFx0XHRcdHZub2RlLmF0dHJzLmRlc2NyaXB0aW9uRWRpdG9yLmVkaXRvci5kb21FbGVtZW50LnRhYkluZGV4ID0gTnVtYmVyKFRhYkluZGV4LkRlZmF1bHQpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdm5vZGUuYXR0cnMuZGVzY3JpcHRpb25FZGl0b3Iuc2V0RW5hYmxlZCh0cnVlKVxuXHRcdH1cblx0XHRpZiAodm5vZGUuYXR0cnMuZGVzY3JpcHRpb25FZGl0b3IuZWRpdG9yLmRvbUVsZW1lbnQpIHtcblx0XHRcdHZub2RlLmF0dHJzLmRlc2NyaXB0aW9uRWRpdG9yLmVkaXRvci5kb21FbGVtZW50LnRhYkluZGV4ID0gTnVtYmVyKFRhYkluZGV4LlByb2dyYW1tYXRpYylcblx0XHR9XG5cdFx0dm5vZGUuYXR0cnMuZGVzY3JpcHRpb25FZGl0b3Iuc2V0RW5hYmxlZChmYWxzZSlcblx0fVxuXG5cdG9uY3JlYXRlKHZub2RlOiBWbm9kZURPTTxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4pOiBhbnkge1xuXHRcdHRoaXMucGFnZXNXcmFwcGVyRG9tRWxlbWVudCA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXG5cdFx0dGhpcy5wYWdlc1dyYXBwZXJEb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsICgpID0+IHtcblx0XHRcdGlmICh2bm9kZS5hdHRycy5jdXJyZW50UGFnZSgpICE9PSBFZGl0b3JQYWdlcy5NQUlOKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuYWxsb3dSZW5kZXJNYWluUGFnZShmYWxzZSlcblx0XHRcdFx0fSwgRGVmYXVsdEFuaW1hdGlvblRpbWUpXG5cdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMudHJhbnNpdGlvblBhZ2UgPSB2bm9kZS5hdHRycy5jdXJyZW50UGFnZSgpXG5cdFx0XHR0aGlzLmhhc0FuaW1hdGlvbkVuZGVkID0gdHJ1ZVxuXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dGhpcy5hbGxvd1JlbmRlck1haW5QYWdlKHRydWUpXG5cdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdH0sIERlZmF1bHRBbmltYXRpb25UaW1lKVxuXHRcdH0pXG5cdH1cblxuXHRvbnVwZGF0ZSh2bm9kZTogVm5vZGVET008Q2FsZW5kYXJFdmVudEVkaXRWaWV3QXR0cnM+KTogYW55IHtcblx0XHRjb25zdCBkb20gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRpZiAodGhpcy5kaWFsb2dIZWlnaHQgPT0gbnVsbCAmJiBkb20ucGFyZW50RWxlbWVudCkge1xuXHRcdFx0dGhpcy5kaWFsb2dIZWlnaHQgPSBkb20ucGFyZW50RWxlbWVudC5jbGllbnRIZWlnaHRcblx0XHRcdDsodm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5oZWlnaHQgPSBweCh0aGlzLmRpYWxvZ0hlaWdodClcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wYWdlV2lkdGggPT0gLTEgJiYgZG9tLnBhcmVudEVsZW1lbnQpIHtcblx0XHRcdHRoaXMucGFnZVdpZHRoID0gZG9tLnBhcmVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBzaXplLmhwYWRfbGFyZ2UgKiAyXG5cdFx0XHQvLyBUd2ljZSB0aGUgcGFnZSB3aWR0aCAoTWFpbiBQYWdlICsgR3Vlc3RzL1JlcGVhdCkgcGx1cyB0aGUgZ2FwIGJldHdlZW4gcGFnZXMgKDY0cHgpXG5cdFx0XHQ7KHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudCkuc3R5bGUud2lkdGggPSBweCh0aGlzLnBhZ2VXaWR0aCAqIDIgKyBzaXplLnZwYWRfeHhsKVxuXHRcdFx0bS5yZWRyYXcoKVxuXHRcdH1cblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzPik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguZ2FwLXZwYWQteHhsLmZpdC1jb250ZW50LnRyYW5zaXRpb24tdHJhbnNmb3JtXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0dHJhbnNmb3JtOiBgdHJhbnNsYXRlWCgke3RoaXMudHJhbnNsYXRlfXB4KWAsXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0W3RoaXMucmVuZGVyTWFpblBhZ2Uodm5vZGUpLCB0aGlzLnJlbmRlclBhZ2Uodm5vZGUpXSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclBhZ2Uodm5vZGU6IFZub2RlPENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzPikge1xuXHRcdGlmICh0aGlzLmhhc0FuaW1hdGlvbkVuZGVkIHx8IHRoaXMudHJhbnNpdGlvblBhZ2UgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHRoaXMucGFnZXMuZ2V0KHZub2RlLmF0dHJzLmN1cnJlbnRQYWdlKCkpPy5hcHBseSh0aGlzLCBbdm5vZGVdKVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnBhZ2VzLmdldCh0aGlzLnRyYW5zaXRpb25QYWdlKT8uYXBwbHkodGhpcywgW3Zub2RlXSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyR3Vlc3RzUGFnZSh7IGF0dHJzOiB7IG1vZGVsLCByZWNpcGllbnRzU2VhcmNoIH0gfTogVm5vZGU8Q2FsZW5kYXJFdmVudEVkaXRWaWV3QXR0cnM+KSB7XG5cdFx0cmV0dXJuIG0oQXR0ZW5kZWVMaXN0RWRpdG9yLCB7XG5cdFx0XHRyZWNpcGllbnRzU2VhcmNoLFxuXHRcdFx0bG9naW5zOiBsb2NhdG9yLmxvZ2lucyxcblx0XHRcdG1vZGVsLFxuXHRcdFx0d2lkdGg6IHRoaXMucGFnZVdpZHRoLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclRpdGxlKGF0dHJzOiBDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycyk6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IG1vZGVsIH0gPSBhdHRyc1xuXHRcdHJldHVybiBtKFxuXHRcdFx0Q2FyZCxcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRwYWRkaW5nOiBcIjBcIixcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRtKFNpbmdsZUxpbmVUZXh0RmllbGQsIHtcblx0XHRcdFx0dmFsdWU6IG1vZGVsLmVkaXRNb2RlbHMuc3VtbWFyeS5jb250ZW50LFxuXHRcdFx0XHRvbmlucHV0OiAobmV3VmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRcdG1vZGVsLmVkaXRNb2RlbHMuc3VtbWFyeS5jb250ZW50ID0gbmV3VmFsdWVcblx0XHRcdFx0fSxcblx0XHRcdFx0YXJpYUxhYmVsOiBsYW5nLmdldChcInRpdGxlX3BsYWNlaG9sZGVyXCIpLFxuXHRcdFx0XHRwbGFjZWhvbGRlcjogbGFuZy5nZXQoXCJ0aXRsZV9wbGFjZWhvbGRlclwiKSxcblx0XHRcdFx0ZGlzYWJsZWQ6ICFtb2RlbC5pc0Z1bGx5V3JpdGFibGUoKSxcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRmb250U2l6ZTogcHgoc2l6ZS5mb250X3NpemVfYmFzZSAqIDEuMjUpLCAvLyBPdmVycmlkaW5nIHRoZSBjb21wb25lbnQgc3R5bGVcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogVGV4dEZpZWxkVHlwZS5UZXh0LFxuXHRcdFx0fSksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJSZWFkb25seU1lc3NhZ2UoYXR0cnM6IENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgbW9kZWwgfSA9IGF0dHJzXG5cdFx0Y29uc3QgbWFrZU1lc3NhZ2UgPSAobWVzc2FnZTogVHJhbnNsYXRpb25LZXkpOiBDaGlsZHJlbiA9PlxuXHRcdFx0bShJbmZvQmFubmVyLCB7XG5cdFx0XHRcdG1lc3NhZ2U6ICgpID0+IG0oXCIuc21hbGwuc2VsZWN0YWJsZVwiLCBsYW5nLmdldChtZXNzYWdlKSksXG5cdFx0XHRcdGljb246IEljb25zLlBlb3BsZSxcblx0XHRcdFx0dHlwZTogQmFubmVyVHlwZS5JbmZvLFxuXHRcdFx0XHRidXR0b25zOiBbXSxcblx0XHRcdH0gc2F0aXNmaWVzIEluZm9CYW5uZXJBdHRycylcblxuXHRcdHN3aXRjaCAobW9kZWwuZ2V0UmVhZG9ubHlSZWFzb24oKSkge1xuXHRcdFx0Y2FzZSBSZWFkb25seVJlYXNvbi5TSEFSRUQ6XG5cdFx0XHRcdHJldHVybiBtYWtlTWVzc2FnZShcImNhbm5vdEVkaXRGdWxsRXZlbnRfbXNnXCIpXG5cdFx0XHRjYXNlIFJlYWRvbmx5UmVhc29uLlNJTkdMRV9JTlNUQU5DRTpcblx0XHRcdFx0cmV0dXJuIG1ha2VNZXNzYWdlKFwiY2Fubm90RWRpdFNpbmdsZUluc3RhbmNlX21zZ1wiKVxuXHRcdFx0Y2FzZSBSZWFkb25seVJlYXNvbi5OT1RfT1JHQU5JWkVSOlxuXHRcdFx0XHRyZXR1cm4gbWFrZU1lc3NhZ2UoXCJjYW5ub3RFZGl0Tm90T3JnYW5pemVyX21zZ1wiKVxuXHRcdFx0Y2FzZSBSZWFkb25seVJlYXNvbi5VTktOT1dOOlxuXHRcdFx0XHRyZXR1cm4gbWFrZU1lc3NhZ2UoXCJjYW5ub3RFZGl0RXZlbnRfbXNnXCIpXG5cdFx0XHRjYXNlIFJlYWRvbmx5UmVhc29uLk5PTkU6XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJFdmVudFRpbWVFZGl0b3IoYXR0cnM6IENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHBhZGRpbmcgPSBweChzaXplLnZwYWRfc21hbGwpXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRDYXJkLFxuXHRcdFx0eyBzdHlsZTogeyBwYWRkaW5nOiBgJHtwYWRkaW5nfSAwICR7cGFkZGluZ30gJHtwYWRkaW5nfWAgfSB9LFxuXHRcdFx0bShFdmVudFRpbWVFZGl0b3IsIHtcblx0XHRcdFx0ZWRpdE1vZGVsOiBhdHRycy5tb2RlbC5lZGl0TW9kZWxzLndoZW5Nb2RlbCxcblx0XHRcdFx0dGltZUZvcm1hdDogdGhpcy50aW1lRm9ybWF0LFxuXHRcdFx0XHRzdGFydE9mVGhlV2Vla09mZnNldDogdGhpcy5zdGFydE9mVGhlV2Vla09mZnNldCxcblx0XHRcdFx0ZGlzYWJsZWQ6ICFhdHRycy5tb2RlbC5pc0Z1bGx5V3JpdGFibGUoKSxcblx0XHRcdH0gc2F0aXNmaWVzIEV2ZW50VGltZUVkaXRvckF0dHJzKSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclJlcGVhdFJ1bGVOYXZCdXR0b24oeyBtb2RlbCwgbmF2aWdhdGlvbkNhbGxiYWNrIH06IENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHJlcGVhdFJ1bGVUZXh0ID0gdGhpcy5nZXRUcmFuc2xhdGVkUmVwZWF0UnVsZShtb2RlbC5lZGl0TW9kZWxzLndoZW5Nb2RlbC5yZXN1bHQucmVwZWF0UnVsZSwgbW9kZWwuZWRpdE1vZGVscy53aGVuTW9kZWwuaXNBbGxEYXkpXG5cdFx0cmV0dXJuIG0oU2VjdGlvbkJ1dHRvbiwge1xuXHRcdFx0bGVmdEljb246IHsgaWNvbjogSWNvbnMuU3luYywgdGl0bGU6IFwiY2FsZW5kYXJSZXBlYXRpbmdfbGFiZWxcIiB9LFxuXHRcdFx0dGV4dDogbGFuZy5tYWtlVHJhbnNsYXRpb24ocmVwZWF0UnVsZVRleHQsIHJlcGVhdFJ1bGVUZXh0KSxcblx0XHRcdGlzRGlzYWJsZWQ6ICFtb2RlbC5jYW5FZGl0U2VyaWVzKCksXG5cdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMudHJhbnNpdGlvblRvKEVkaXRvclBhZ2VzLlJFUEVBVF9SVUxFUywgbmF2aWdhdGlvbkNhbGxiYWNrKVxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSB0cmFuc2l0aW9uVG8odGFyZ2V0OiBFZGl0b3JQYWdlcywgbmF2aWdhdGlvbkNhbGxiYWNrOiAodGFyZ2V0UGFnZTogRWRpdG9yUGFnZXMpID0+IHVua25vd24pIHtcblx0XHR0aGlzLmhhc0FuaW1hdGlvbkVuZGVkID0gZmFsc2Vcblx0XHR0aGlzLnRyYW5zaXRpb25QYWdlID0gdGFyZ2V0XG5cdFx0dGhpcy50cmFuc2xhdGUgPSAtKHRoaXMucGFnZVdpZHRoICsgc2l6ZS52cGFkX3h4bClcblx0XHRuYXZpZ2F0aW9uQ2FsbGJhY2sodGFyZ2V0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJHdWVzdHNOYXZCdXR0b24oeyBuYXZpZ2F0aW9uQ2FsbGJhY2ssIG1vZGVsIH06IENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFNlY3Rpb25CdXR0b24sIHtcblx0XHRcdGxlZnRJY29uOiB7IGljb246IEljb25zLlBlb3BsZSwgdGl0bGU6IFwiY2FsZW5kYXJSZXBlYXRpbmdfbGFiZWxcIiB9LFxuXHRcdFx0dGV4dDogXCJndWVzdHNfbGFiZWxcIixcblx0XHRcdGluamVjdGlvblJpZ2h0OiBtb2RlbC5lZGl0TW9kZWxzLndob01vZGVsLmd1ZXN0cy5sZW5ndGggPiAwID8gbShcInNwYW5cIiwgbW9kZWwuZWRpdE1vZGVscy53aG9Nb2RlbC5ndWVzdHMubGVuZ3RoKSA6IG51bGwsXG5cdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdHRoaXMudHJhbnNpdGlvblRvKEVkaXRvclBhZ2VzLkdVRVNUUywgbmF2aWdhdGlvbkNhbGxiYWNrKVxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDYWxlbmRhclBpY2tlcih2bm9kZTogVm5vZGU8Q2FsZW5kYXJFdmVudEVkaXRWaWV3QXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IHsgbW9kZWwsIGdyb3VwQ29sb3JzIH0gPSB2bm9kZS5hdHRyc1xuXHRcdGNvbnN0IGF2YWlsYWJsZUNhbGVuZGFycyA9IG1vZGVsLmVkaXRNb2RlbHMud2hvTW9kZWwuZ2V0QXZhaWxhYmxlQ2FsZW5kYXJzKClcblxuXHRcdGNvbnN0IG9wdGlvbnM6IENhbGVuZGFyU2VsZWN0SXRlbVtdID0gYXZhaWxhYmxlQ2FsZW5kYXJzLm1hcCgoY2FsZW5kYXJJbmZvKSA9PiB7XG5cdFx0XHRjb25zdCBuYW1lID0gZ2V0U2hhcmVkR3JvdXBOYW1lKGNhbGVuZGFySW5mby5ncm91cEluZm8sIG1vZGVsLnVzZXJDb250cm9sbGVyLCBjYWxlbmRhckluZm8uc2hhcmVkKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bmFtZSxcblx0XHRcdFx0Y29sb3I6IFwiI1wiICsgKGdyb3VwQ29sb3JzLmdldChjYWxlbmRhckluZm8uZ3JvdXAuX2lkKSA/PyBkZWZhdWx0Q2FsZW5kYXJDb2xvciksXG5cdFx0XHRcdHZhbHVlOiBjYWxlbmRhckluZm8sXG5cdFx0XHRcdGFyaWFWYWx1ZTogbmFtZSxcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0Y29uc3Qgc2VsZWN0ZWRDYWxlbmRhckluZm8gPSBtb2RlbC5lZGl0TW9kZWxzLndob01vZGVsLnNlbGVjdGVkQ2FsZW5kYXJcblx0XHRjb25zdCBzZWxlY3RlZENhbGVuZGFyTmFtZSA9IGdldFNoYXJlZEdyb3VwTmFtZShzZWxlY3RlZENhbGVuZGFySW5mby5ncm91cEluZm8sIG1vZGVsLnVzZXJDb250cm9sbGVyLCBzZWxlY3RlZENhbGVuZGFySW5mby5zaGFyZWQpXG5cdFx0bGV0IHNlbGVjdGVkOiBDYWxlbmRhclNlbGVjdEl0ZW0gPSB7XG5cdFx0XHRuYW1lOiBzZWxlY3RlZENhbGVuZGFyTmFtZSxcblx0XHRcdGNvbG9yOiBcIiNcIiArIChncm91cENvbG9ycy5nZXQoc2VsZWN0ZWRDYWxlbmRhckluZm8uZ3JvdXAuX2lkKSA/PyBkZWZhdWx0Q2FsZW5kYXJDb2xvciksXG5cdFx0XHR2YWx1ZTogbW9kZWwuZWRpdE1vZGVscy53aG9Nb2RlbC5zZWxlY3RlZENhbGVuZGFyLFxuXHRcdFx0YXJpYVZhbHVlOiBzZWxlY3RlZENhbGVuZGFyTmFtZSxcblx0XHR9XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRDYXJkLFxuXHRcdFx0eyBzdHlsZTogeyBwYWRkaW5nOiBcIjBcIiB9IH0sXG5cdFx0XHRtKFNlbGVjdDxDYWxlbmRhclNlbGVjdEl0ZW0sIENhbGVuZGFySW5mbz4sIHtcblx0XHRcdFx0b25jaGFuZ2U6ICh2YWwpID0+IHtcblx0XHRcdFx0XHRtb2RlbC5lZGl0TW9kZWxzLmFsYXJtTW9kZWwucmVtb3ZlQWxsKClcblx0XHRcdFx0XHRtb2RlbC5lZGl0TW9kZWxzLmFsYXJtTW9kZWwuYWRkQWxsKHRoaXMuZGVmYXVsdEFsYXJtcy5nZXQodmFsLnZhbHVlLmdyb3VwLl9pZCkgPz8gW10pXG5cdFx0XHRcdFx0bW9kZWwuZWRpdE1vZGVscy53aG9Nb2RlbC5zZWxlY3RlZENhbGVuZGFyID0gdmFsLnZhbHVlXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9wdGlvbnM6IHN0cmVhbShvcHRpb25zKSxcblx0XHRcdFx0ZXhwYW5kZWQ6IHRydWUsXG5cdFx0XHRcdHNlbGVjdGVkLFxuXHRcdFx0XHRjbGFzc2VzOiBbXCJidXR0b24tbWluLWhlaWdodFwiLCBcInBsLXZwYWQtc1wiLCBcInByLXZwYWQtc1wiXSxcblx0XHRcdFx0cmVuZGVyT3B0aW9uOiAob3B0aW9uKSA9PiB0aGlzLnJlbmRlckNhbGVuZGFyT3B0aW9ucyhvcHRpb24sIGRlZXBFcXVhbChvcHRpb24udmFsdWUsIHNlbGVjdGVkLnZhbHVlKSwgZmFsc2UpLFxuXHRcdFx0XHRyZW5kZXJEaXNwbGF5OiAob3B0aW9uKSA9PiB0aGlzLnJlbmRlckNhbGVuZGFyT3B0aW9ucyhvcHRpb24sIGZhbHNlLCB0cnVlKSxcblx0XHRcdFx0YXJpYUxhYmVsOiBsYW5nLmdldChcImNhbGVuZGFyX2xhYmVsXCIpLFxuXHRcdFx0XHRkaXNhYmxlZDogIW1vZGVsLmNhbkNoYW5nZUNhbGVuZGFyKCkgfHwgYXZhaWxhYmxlQ2FsZW5kYXJzLmxlbmd0aCA8IDIsXG5cdFx0XHR9IHNhdGlzZmllcyBTZWxlY3RBdHRyaWJ1dGVzPENhbGVuZGFyU2VsZWN0SXRlbSwgQ2FsZW5kYXJJbmZvPiksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDYWxlbmRhck9wdGlvbnMob3B0aW9uOiBDYWxlbmRhclNlbGVjdEl0ZW0sIGlzU2VsZWN0ZWQ6IGJvb2xlYW4sIGlzRGlzcGxheTogYm9vbGVhbikge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuZmxleC5pdGVtcy1jZW50ZXIuZ2FwLXZwYWQtcy5mbGV4LWdyb3dcIixcblx0XHRcdHsgY2xhc3M6IGAke2lzRGlzcGxheSA/IFwiXCIgOiBcInN0YXRlLWJnIHBsci1idXR0b24gYnV0dG9uLWNvbnRlbnQgZHJvcGRvd24tYnV0dG9uIHB0LXMgcGItcyBidXR0b24tbWluLWhlaWdodFwifWAgfSxcblx0XHRcdFtcblx0XHRcdFx0bShcImRpdlwiLCB7XG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdHdpZHRoOiBweChzaXplLmhwYWRfbGFyZ2UpLFxuXHRcdFx0XHRcdFx0aGVpZ2h0OiBweChzaXplLmhwYWRfbGFyZ2UpLFxuXHRcdFx0XHRcdFx0Ym9yZGVyUmFkaXVzOiBcIjUwJVwiLFxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBvcHRpb24uY29sb3IsXG5cdFx0XHRcdFx0XHRtYXJnaW5JbmxpbmU6IHB4KHNpemUudnBhZF94c20gLyAyKSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bShcInNwYW5cIiwgeyBzdHlsZTogeyBjb2xvcjogaXNTZWxlY3RlZCA/IHRoZW1lLmNvbnRlbnRfYnV0dG9uX3NlbGVjdGVkIDogdW5kZWZpbmVkIH0gfSwgb3B0aW9uLm5hbWUpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclJlbWluZGVyc0VkaXRvcih2bm9kZTogVm5vZGU8Q2FsZW5kYXJFdmVudEVkaXRWaWV3QXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGlmICghdm5vZGUuYXR0cnMubW9kZWwuZWRpdE1vZGVscy5hbGFybU1vZGVsLmNhbkVkaXRSZW1pbmRlcnMpIHJldHVybiBudWxsXG5cdFx0Y29uc3QgeyBhbGFybU1vZGVsIH0gPSB2bm9kZS5hdHRycy5tb2RlbC5lZGl0TW9kZWxzXG5cblx0XHRyZXR1cm4gbShcblx0XHRcdENhcmQsXG5cdFx0XHR7IGNsYXNzZXM6IFtcImJ1dHRvbi1taW4taGVpZ2h0XCIsIFwiZmxleFwiLCBcIml0ZW1zLWNlbnRlclwiXSB9LFxuXHRcdFx0bShcIi5mbGV4LmdhcC12cGFkLXMuaXRlbXMtc3RhcnQuZmxleC1ncm93XCIsIFtcblx0XHRcdFx0bShcblx0XHRcdFx0XHRcIi5mbGV4XCIsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y2xhc3M6IGFsYXJtTW9kZWwuYWxhcm1zLmxlbmd0aCA9PT0gMCA/IFwiaXRlbXMtY2VudGVyXCIgOiBcIml0ZW1zLXN0YXJ0XCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRtKEljb24sIHtcblx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuQ2xvY2ssXG5cdFx0XHRcdFx0XHRcdHN0eWxlOiB7IGZpbGw6IGdldENvbG9ycyhCdXR0b25Db2xvci5Db250ZW50KS5idXR0b24gfSxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IGxhbmcuZ2V0KFwicmVtaW5kZXJCZWZvcmVFdmVudF9sYWJlbFwiKSxcblx0XHRcdFx0XHRcdFx0c2l6ZTogSWNvblNpemUuTWVkaXVtLFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0KSxcblx0XHRcdFx0bShSZW1pbmRlcnNFZGl0b3IsIHtcblx0XHRcdFx0XHRhbGFybXM6IGFsYXJtTW9kZWwuYWxhcm1zLFxuXHRcdFx0XHRcdGFkZEFsYXJtOiBhbGFybU1vZGVsLmFkZEFsYXJtLmJpbmQoYWxhcm1Nb2RlbCksXG5cdFx0XHRcdFx0cmVtb3ZlQWxhcm06IGFsYXJtTW9kZWwucmVtb3ZlQWxhcm0uYmluZChhbGFybU1vZGVsKSxcblx0XHRcdFx0XHRsYWJlbDogXCJyZW1pbmRlckJlZm9yZUV2ZW50X2xhYmVsXCIsXG5cdFx0XHRcdFx0dXNlTmV3RWRpdG9yOiB0cnVlLFxuXHRcdFx0XHR9IHNhdGlzZmllcyBSZW1pbmRlcnNFZGl0b3JBdHRycyksXG5cdFx0XHRdKSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckxvY2F0aW9uRmllbGQodm5vZGU6IFZub2RlPENhbGVuZGFyRXZlbnRFZGl0Vmlld0F0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IG1vZGVsIH0gPSB2bm9kZS5hdHRyc1xuXHRcdHJldHVybiBtKFxuXHRcdFx0Q2FyZCxcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHsgcGFkZGluZzogXCIwXCIgfSxcblx0XHRcdH0sXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5mbGV4LmdhcC12cGFkLXMuaXRlbXMtY2VudGVyXCIsXG5cdFx0XHRcdG0oU2luZ2xlTGluZVRleHRGaWVsZCwge1xuXHRcdFx0XHRcdHZhbHVlOiBtb2RlbC5lZGl0TW9kZWxzLmxvY2F0aW9uLmNvbnRlbnQsXG5cdFx0XHRcdFx0b25pbnB1dDogKG5ld1ZhbHVlOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdG1vZGVsLmVkaXRNb2RlbHMubG9jYXRpb24uY29udGVudCA9IG5ld1ZhbHVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRjbGFzc2VzOiBbXCJidXR0b24tbWluLWhlaWdodFwiXSxcblx0XHRcdFx0XHRhcmlhTGFiZWw6IGxhbmcuZ2V0KFwibG9jYXRpb25fbGFiZWxcIiksXG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI6IGxhbmcuZ2V0KFwibG9jYXRpb25fbGFiZWxcIiksXG5cdFx0XHRcdFx0ZGlzYWJsZWQ6ICFtb2RlbC5pc0Z1bGx5V3JpdGFibGUoKSxcblx0XHRcdFx0XHRsZWFkaW5nSWNvbjoge1xuXHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuUGluLFxuXHRcdFx0XHRcdFx0Y29sb3I6IGdldENvbG9ycyhCdXR0b25Db2xvci5Db250ZW50KS5idXR0b24sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR0eXBlOiBUZXh0RmllbGRUeXBlLlRleHQsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckRlc2NyaXB0aW9uRWRpdG9yKHZub2RlOiBWbm9kZTxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRDYXJkLFxuXHRcdFx0e1xuXHRcdFx0XHRjbGFzc2VzOiBbXCJjaGlsZC10ZXh0LWVkaXRvclwiLCBcInJlbFwiXSxcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRwYWRkaW5nOiBcIjBcIixcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdHZub2RlLmF0dHJzLmRlc2NyaXB0aW9uRWRpdG9yLmlzRW1wdHkoKSAmJiAhdm5vZGUuYXR0cnMuZGVzY3JpcHRpb25FZGl0b3IuaXNBY3RpdmUoKVxuXHRcdFx0XHRcdD8gbShcInNwYW4udGV4dC1lZGl0b3ItcGxhY2Vob2xkZXJcIiwgbGFuZy5nZXQoXCJkZXNjcmlwdGlvbl9sYWJlbFwiKSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdG0odm5vZGUuYXR0cnMuZGVzY3JpcHRpb25FZGl0b3IpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlck1haW5QYWdlKHZub2RlOiBWbm9kZTxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5wYi5wdC5mbGV4LmNvbC5nYXAtdnBhZC5maXQtaGVpZ2h0LmJveC1jb250ZW50XCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0Ly8gVGhlIGRhdGUgcGlja2VyIGRpYWxvZ3MgaGF2ZSBwb3NpdGlvbjogZml4ZWQsIGFuZCB0aGV5IGFyZSBmaXhlZCByZWxhdGl2ZSB0byB0aGUgbW9zdCByZWNlbnQgYW5jZXN0b3Igd2l0aFxuXHRcdFx0XHRcdC8vIGEgdHJhbnNmb3JtLiBTbyBkb2luZyBhIG5vLW9wIHRyYW5zZm9ybSB3aWxsIG1ha2UgdGhlIGRyb3Bkb3ducyBzY3JvbGwgd2l0aCB0aGUgZGlhbG9nXG5cdFx0XHRcdFx0Ly8gd2l0aG91dCB0aGlzLCB0aGVuIHRoZSBkYXRlIHBpY2tlciBkaWFsb2dzIHdpbGwgc2hvdyBhdCB0aGUgc2FtZSBwbGFjZSBvbiB0aGUgc2NyZWVuIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGVcblx0XHRcdFx0XHQvLyBlZGl0b3IgaGFzIHNjcm9sbGVkIG9yIG5vdC5cblx0XHRcdFx0XHQvLyBJZGVhbGx5IHdlIGNvdWxkIGRvIHRoaXMgaW5zaWRlIERhdGVQaWNrZXIgaXRzZWxmLCBidXQgdGhlIHJlbmRlcmluZyBicmVha3MgYW5kIHRoZSBkaWFsb2cgYXBwZWFycyBiZWxvdyBpdCdzIHNpYmxpbmdzXG5cdFx0XHRcdFx0Ly8gV2UgYWxzbyBkb24ndCB3YW50IHRvIGRvIHRoaXMgZm9yIGFsbCBkaWFsb2dzIGJlY2F1c2UgaXQgY291bGQgcG90ZW50aWFsbHkgY2F1c2Ugb3RoZXIgaXNzdWVzXG5cdFx0XHRcdFx0dHJhbnNmb3JtOiBcInRyYW5zbGF0ZSgwKVwiLFxuXHRcdFx0XHRcdGNvbG9yOiB0aGVtZS5idXR0b25fYnViYmxlX2ZnLFxuXHRcdFx0XHRcdFwicG9pbnRlci1ldmVudHNcIjogYCR7dGhpcy5hbGxvd1JlbmRlck1haW5QYWdlKCkgPyBcImF1dG9cIiA6IFwibm9uZVwifWAsXG5cdFx0XHRcdFx0d2lkdGg6IHB4KHRoaXMucGFnZVdpZHRoKSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRbXG5cdFx0XHRcdHRoaXMuYWxsb3dSZW5kZXJNYWluUGFnZSgpXG5cdFx0XHRcdFx0PyBtLmZyYWdtZW50KHt9LCBbXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVuZGVyUmVhZG9ubHlNZXNzYWdlKHZub2RlLmF0dHJzKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJUaXRsZSh2bm9kZS5hdHRycyksXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVuZGVyRXZlbnRUaW1lRWRpdG9yKHZub2RlLmF0dHJzKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJDYWxlbmRhclBpY2tlcih2bm9kZSksXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVuZGVyUmVwZWF0UnVsZU5hdkJ1dHRvbih2bm9kZS5hdHRycyksXG5cdFx0XHRcdFx0XHRcdHRoaXMucmVuZGVyUmVtaW5kZXJzRWRpdG9yKHZub2RlKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5yZW5kZXJHdWVzdHNOYXZCdXR0b24odm5vZGUuYXR0cnMpLFxuXHRcdFx0XHRcdFx0XHR0aGlzLnJlbmRlckxvY2F0aW9uRmllbGQodm5vZGUpLFxuXHRcdFx0XHRcdCAgXSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdHRoaXMucmVuZGVyRGVzY3JpcHRpb25FZGl0b3Iodm5vZGUpLFxuXHRcdFx0XSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclJlcGVhdFJ1bGVzUGFnZSh7IGF0dHJzOiB7IG1vZGVsLCBuYXZpZ2F0aW9uQ2FsbGJhY2sgfSB9OiBWbm9kZTxDYWxlbmRhckV2ZW50RWRpdFZpZXdBdHRycz4pIHtcblx0XHRjb25zdCB7IHdoZW5Nb2RlbCB9ID0gbW9kZWwuZWRpdE1vZGVsc1xuXG5cdFx0cmV0dXJuIG0oUmVwZWF0UnVsZUVkaXRvciwge1xuXHRcdFx0bW9kZWw6IHdoZW5Nb2RlbCxcblx0XHRcdHN0YXJ0T2ZUaGVXZWVrT2Zmc2V0OiB0aGlzLnN0YXJ0T2ZUaGVXZWVrT2Zmc2V0LFxuXHRcdFx0d2lkdGg6IHRoaXMucGFnZVdpZHRoLFxuXHRcdFx0YmFja0FjdGlvbjogKCkgPT4gbmF2aWdhdGlvbkNhbGxiYWNrKEVkaXRvclBhZ2VzLk1BSU4pLFxuXHRcdH0gc2F0aXNmaWVzIFJlcGVhdFJ1bGVFZGl0b3JBdHRycylcblx0fVxuXG5cdHByaXZhdGUgZ2V0VHJhbnNsYXRlZFJlcGVhdFJ1bGUocnVsZTogQ2FsZW5kYXJSZXBlYXRSdWxlIHwgbnVsbCwgaXNBbGxEYXk6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRcdGlmIChydWxlID09IG51bGwpIHJldHVybiBsYW5nLmdldChcImNhbGVuZGFyUmVwZWF0SW50ZXJ2YWxOb1JlcGVhdF9sYWJlbFwiKVxuXG5cdFx0Y29uc3QgZnJlcXVlbmN5ID0gZm9ybWF0UmVwZXRpdGlvbkZyZXF1ZW5jeShydWxlKVxuXHRcdHJldHVybiBmcmVxdWVuY3kgPyBmcmVxdWVuY3kgKyBmb3JtYXRSZXBldGl0aW9uRW5kKHJ1bGUsIGlzQWxsRGF5KSA6IGxhbmcuZ2V0KFwidW5rbm93blJlcGV0aXRpb25fbXNnXCIpXG5cdH1cbn1cbiIsIi8qKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBmdW5jdGlvbnMgdXNlZCB0byBzZXQgdXAgYW5kIHRlYXIgZG93biBlZGl0IGRpYWxvZ3MgZm9yIGNhbGVuZGFyIGV2ZW50cy5cbiAqXG4gKiB0aGV5J3JlIG5vdCByZXNwb25zaWJsZSBmb3IgdXBob2xkaW5nIGludmFyaWFudHMgb3IgZW5zdXJlIHZhbGlkIGV2ZW50cyAoQ2FsZW5kYXJFdmVudE1vZGVsLmVkaXRNb2RlbHNcbiAqIGFuZCBDYWxlbmRhckV2ZW50RWRpdFZpZXcgZG8gdGhhdCksIGJ1dCBrbm93IHdoYXQgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byBhc2sgdGhlIHVzZXIgYmVmb3JlIHNhdmluZ1xuICogYW5kIHdoaWNoIG1ldGhvZHMgdG8gY2FsbCB0byBzYXZlIHRoZSBjaGFuZ2VzLlxuICovXG5cbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcbmltcG9ydCB7IGxhbmcsIE1heWJlVHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgQnV0dG9uQXR0cnMsIEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBLZXlzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IEFsYXJtSW50ZXJ2YWwsIGdldFN0YXJ0T2ZUaGVXZWVrT2Zmc2V0Rm9yVXNlciwgZ2V0VGltZUZvcm1hdEZvclVzZXIsIHBhcnNlQWxhcm1JbnRlcnZhbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vY2FsZW5kYXIvZGF0ZS9DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7IGNsaWVudCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9DbGllbnREZXRlY3Rvci5qc1wiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsLCBub09wLCBUaHVuayB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgUG9zUmVjdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgTWFpbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB0eXBlIHsgSHRtbEVkaXRvciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vZ3VpL2VkaXRvci9IdG1sRWRpdG9yLmpzXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3IuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudEVkaXRWaWV3LCBFZGl0b3JQYWdlcyB9IGZyb20gXCIuL0NhbGVuZGFyRXZlbnRFZGl0Vmlldy5qc1wiXG5pbXBvcnQgeyBhc2tJZlNob3VsZFNlbmRDYWxlbmRhclVwZGF0ZXNUb0F0dGVuZGVlcyB9IGZyb20gXCIuLi9DYWxlbmRhckd1aVV0aWxzLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRJZGVudGl0eSwgQ2FsZW5kYXJFdmVudE1vZGVsLCBFdmVudFNhdmVSZXN1bHQgfSBmcm9tIFwiLi4vZXZlbnRlZGl0b3ItbW9kZWwvQ2FsZW5kYXJFdmVudE1vZGVsLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBVcGdyYWRlUmVxdWlyZWRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL21haW4vVXBncmFkZVJlcXVpcmVkRXJyb3IuanNcIlxuaW1wb3J0IHsgc2hvd1BsYW5VcGdyYWRlUmVxdWlyZWREaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvU3Vic2NyaXB0aW9uRGlhbG9ncy5qc1wiXG5pbXBvcnQgeyBjb252ZXJ0VGV4dFRvSHRtbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9Gb3JtYXR0ZXIuanNcIlxuaW1wb3J0IHsgVXNlckVycm9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Vc2VyRXJyb3IuanNcIlxuaW1wb3J0IHsgc2hvd1VzZXJFcnJvciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9FcnJvckhhbmRsZXJJbXBsLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuXG5pbXBvcnQgeyBoYW5kbGVSYXRpbmdCeUV2ZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9yYXRpbmdzL0luQXBwUmF0aW5nRGlhbG9nLmpzXCJcblxuY29uc3QgZW51bSBDb25maXJtYXRpb25SZXN1bHQge1xuXHRDYW5jZWwsXG5cdENvbnRpbnVlLFxufVxuXG50eXBlIEVkaXREaWFsb2dPa0hhbmRsZXIgPSAocG9zUmVjdDogUG9zUmVjdCwgZmluaXNoOiBUaHVuaykgPT4gUHJvbWlzZTx1bmtub3duPlxuXG5leHBvcnQgY2xhc3MgRXZlbnRFZGl0b3JEaWFsb2cge1xuXHRwcml2YXRlIGN1cnJlbnRQYWdlOiBzdHJlYW08RWRpdG9yUGFnZXM+ID0gc3RyZWFtKEVkaXRvclBhZ2VzLk1BSU4pXG5cdHByaXZhdGUgZGlhbG9nOiBEaWFsb2cgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGhlYWRlckRvbTogSFRNTEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKCkge31cblxuXHRwcml2YXRlIGxlZnQoKTogQnV0dG9uQXR0cnNbXSB7XG5cdFx0aWYgKHRoaXMuY3VycmVudFBhZ2UoKSA9PT0gRWRpdG9yUGFnZXMuTUFJTikge1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhYmVsOiBcImNhbmNlbF9hY3Rpb25cIixcblx0XHRcdFx0XHRjbGljazogKCkgPT4gdGhpcy5kaWFsb2c/LmNsb3NlKCksXG5cdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHRcdH0sXG5cdFx0XHRdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtcblx0XHRcdHtcblx0XHRcdFx0bGFiZWw6IFwiYmFja19hY3Rpb25cIixcblx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMuY3VycmVudFBhZ2UoRWRpdG9yUGFnZXMuTUFJTiksXG5cdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0fSxcblx0XHRdXG5cdH1cblxuXHRwcml2YXRlIHJpZ2h0KG9rQWN0aW9uOiAoZG9tOiBIVE1MRWxlbWVudCkgPT4gdW5rbm93bik6IEJ1dHRvbkF0dHJzW10ge1xuXHRcdGlmICh0aGlzLmN1cnJlbnRQYWdlKCkgPT09IEVkaXRvclBhZ2VzLk1BSU4pIHtcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYWJlbDogXCJzYXZlX2FjdGlvblwiLFxuXHRcdFx0XHRcdGNsaWNrOiAoZXZlbnQ6IE1vdXNlRXZlbnQsIGRvbTogSFRNTEVsZW1lbnQpID0+IG9rQWN0aW9uKGRvbSksXG5cdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XVxuXHRcdH1cblxuXHRcdHJldHVybiBbXVxuXHR9XG5cblx0LyoqXG5cdCAqIHRoZSBnZW5lcmljIHdheSB0byBvcGVuIGFueSBjYWxlbmRhciBlZGl0IGRpYWxvZy4gdGhlIGNhbGxlciBzaG91bGQga25vdyB3aGF0IHRvIGRvIGFmdGVyIHRoZVxuXHQgKiBkaWFsb2cgaXMgY2xvc2VkLlxuXHQgKi9cblx0YXN5bmMgc2hvd0NhbGVuZGFyRXZlbnRFZGl0RGlhbG9nKG1vZGVsOiBDYWxlbmRhckV2ZW50TW9kZWwsIHJlc3BvbnNlTWFpbDogTWFpbCB8IG51bGwsIGhhbmRsZXI6IEVkaXREaWFsb2dPa0hhbmRsZXIpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCByZWNpcGllbnRzU2VhcmNoID0gYXdhaXQgbG9jYXRvci5yZWNpcGllbnRzU2VhcmNoTW9kZWwoKVxuXHRcdGNvbnN0IHsgSHRtbEVkaXRvciB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vLi4vY29tbW9uL2d1aS9lZGl0b3IvSHRtbEVkaXRvci5qc1wiKVxuXHRcdGNvbnN0IGdyb3VwU2V0dGluZ3MgPSBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXJTZXR0aW5nc0dyb3VwUm9vdC5ncm91cFNldHRpbmdzXG5cblx0XHRjb25zdCBncm91cENvbG9yczogTWFwPElkLCBzdHJpbmc+ID0gZ3JvdXBTZXR0aW5ncy5yZWR1Y2UoKGFjYywgZ2MpID0+IHtcblx0XHRcdGFjYy5zZXQoZ2MuZ3JvdXAsIGdjLmNvbG9yKVxuXHRcdFx0cmV0dXJuIGFjY1xuXHRcdH0sIG5ldyBNYXAoKSlcblxuXHRcdGNvbnN0IGRlZmF1bHRBbGFybXM6IE1hcDxJZCwgQWxhcm1JbnRlcnZhbFtdPiA9IGdyb3VwU2V0dGluZ3MucmVkdWNlKChhY2MsIGdjKSA9PiB7XG5cdFx0XHRhY2Muc2V0KFxuXHRcdFx0XHRnYy5ncm91cCxcblx0XHRcdFx0Z2MuZGVmYXVsdEFsYXJtc0xpc3QubWFwKChhbGFybSkgPT4gcGFyc2VBbGFybUludGVydmFsKGFsYXJtLnRyaWdnZXIpKSxcblx0XHRcdClcblx0XHRcdHJldHVybiBhY2Ncblx0XHR9LCBuZXcgTWFwKCkpXG5cblx0XHRjb25zdCBkZXNjcmlwdGlvblRleHQgPSBjb252ZXJ0VGV4dFRvSHRtbChtb2RlbC5lZGl0TW9kZWxzLmRlc2NyaXB0aW9uLmNvbnRlbnQpXG5cdFx0Y29uc3QgZGVzY3JpcHRpb25FZGl0b3I6IEh0bWxFZGl0b3IgPSBuZXcgSHRtbEVkaXRvcigpXG5cdFx0XHQuc2V0U2hvd091dGxpbmUodHJ1ZSlcblx0XHRcdC5zZXRNaW5IZWlnaHQoMjAwKVxuXHRcdFx0LnNldEVuYWJsZWQodHJ1ZSlcblx0XHRcdC8vIFdlIG9ubHkgc2V0IGl0IG9uY2UsIHdlIGRvbid0IHZpZXdNb2RlbCBvbiBldmVyeSBjaGFuZ2UsIHRoYXQgd291bGQgYmUgc2xvd1xuXHRcdFx0LnNldFZhbHVlKGRlc2NyaXB0aW9uVGV4dClcblxuXHRcdGNvbnN0IG9rQWN0aW9uID0gKGRvbTogSFRNTEVsZW1lbnQpID0+IHtcblx0XHRcdG1vZGVsLmVkaXRNb2RlbHMuZGVzY3JpcHRpb24uY29udGVudCA9IGRlc2NyaXB0aW9uRWRpdG9yLmdldFRyaW1tZWRWYWx1ZSgpXG5cdFx0XHRoYW5kbGVyKGRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgKCkgPT4gZGlhbG9nLmNsb3NlKCkpXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3VtbWFyeSA9IG1vZGVsLmVkaXRNb2RlbHMuc3VtbWFyeS5jb250ZW50XG5cdFx0Y29uc3QgaGVhZGluZyA9IHN1bW1hcnkudHJpbSgpLmxlbmd0aCA+IDAgPyBsYW5nLm1ha2VUcmFuc2xhdGlvbihcInN1bW1hcnlcIiwgc3VtbWFyeSkgOiBcImNyZWF0ZUV2ZW50X2xhYmVsXCJcblxuXHRcdGNvbnN0IG5hdmlnYXRpb25DYWxsYmFjayA9ICh0YXJnZXRQYWdlOiBFZGl0b3JQYWdlcykgPT4ge1xuXHRcdFx0dGhpcy5jdXJyZW50UGFnZSh0YXJnZXRQYWdlKVxuXHRcdH1cblxuXHRcdGNvbnN0IGRpYWxvZzogRGlhbG9nID0gRGlhbG9nLmVkaXRNZWRpdW1EaWFsb2coXG5cdFx0XHR7XG5cdFx0XHRcdGxlZnQ6IHRoaXMubGVmdC5iaW5kKHRoaXMpLFxuXHRcdFx0XHRtaWRkbGU6IGhlYWRpbmcsXG5cdFx0XHRcdHJpZ2h0OiB0aGlzLnJpZ2h0LmJpbmQodGhpcywgb2tBY3Rpb24pLFxuXHRcdFx0XHRjcmVhdGU6IChkb20pID0+IHtcblx0XHRcdFx0XHR0aGlzLmhlYWRlckRvbSA9IGRvbVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdENhbGVuZGFyRXZlbnRFZGl0Vmlldyxcblx0XHRcdHtcblx0XHRcdFx0bW9kZWwsXG5cdFx0XHRcdHJlY2lwaWVudHNTZWFyY2gsXG5cdFx0XHRcdGRlc2NyaXB0aW9uRWRpdG9yLFxuXHRcdFx0XHRzdGFydE9mVGhlV2Vla09mZnNldDogZ2V0U3RhcnRPZlRoZVdlZWtPZmZzZXRGb3JVc2VyKGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlclNldHRpbmdzR3JvdXBSb290KSxcblx0XHRcdFx0dGltZUZvcm1hdDogZ2V0VGltZUZvcm1hdEZvclVzZXIobG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyU2V0dGluZ3NHcm91cFJvb3QpLFxuXHRcdFx0XHRncm91cENvbG9ycyxcblx0XHRcdFx0ZGVmYXVsdEFsYXJtcyxcblx0XHRcdFx0bmF2aWdhdGlvbkNhbGxiYWNrLFxuXHRcdFx0XHRjdXJyZW50UGFnZTogdGhpcy5jdXJyZW50UGFnZSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGhlaWdodDogXCIxMDAlXCIsXG5cdFx0XHRcdFwiYmFja2dyb3VuZC1jb2xvclwiOiB0aGVtZS5uYXZpZ2F0aW9uX2JnLFxuXHRcdFx0fSxcblx0XHQpXG5cdFx0XHQuYWRkU2hvcnRjdXQoe1xuXHRcdFx0XHRrZXk6IEtleXMuRVNDLFxuXHRcdFx0XHRleGVjOiAoKSA9PiBkaWFsb2cuY2xvc2UoKSxcblx0XHRcdFx0aGVscDogXCJjbG9zZV9hbHRcIixcblx0XHRcdH0pXG5cdFx0XHQuYWRkU2hvcnRjdXQoe1xuXHRcdFx0XHRrZXk6IEtleXMuUyxcblx0XHRcdFx0Y3RybE9yQ21kOiB0cnVlLFxuXHRcdFx0XHRleGVjOiAoKSA9PiBva0FjdGlvbihhc3NlcnROb3ROdWxsKHRoaXMuaGVhZGVyRG9tLCBcImhlYWRlckRvbSB3YXMgbnVsbFwiKSksXG5cdFx0XHRcdGhlbHA6IFwic2F2ZV9hY3Rpb25cIixcblx0XHRcdH0pXG5cblx0XHRpZiAoY2xpZW50LmlzTW9iaWxlRGV2aWNlKCkpIHtcblx0XHRcdC8vIFByZXZlbnQgZm9jdXNpbmcgdGV4dCBmaWVsZCBhdXRvbWF0aWNhbGx5IG9uIG1vYmlsZS4gSXQgb3BlbnMga2V5Ym9hcmQgYW5kIHlvdSBkb24ndCBzZWUgYWxsIGRldGFpbHMuXG5cdFx0XHRkaWFsb2cuc2V0Rm9jdXNPbkxvYWRGdW5jdGlvbihub09wKVxuXHRcdH1cblxuXHRcdHRoaXMuZGlhbG9nID0gZGlhbG9nXG5cblx0XHRkaWFsb2cuc2hvdygpXG5cdH1cblxuXHQvKipcblx0ICogc2hvdyBhbiBlZGl0IGRpYWxvZyBmb3IgYW4gZXZlbnQgdGhhdCBkb2VzIG5vdCBleGlzdCBvbiB0aGUgc2VydmVyIHlldCAob3IgYW55d2hlcmUgZWxzZSlcblx0ICpcblx0ICogd2lsbCB1bmNvbmRpdGlvbmFsbHkgc2VuZCBpbnZpdGVzIG9uIHNhdmUuXG5cdCAqIEBwYXJhbSBtb2RlbCB0aGUgY2FsZW5kYXIgZXZlbnQgbW9kZWwgdXNlZCB0byBlZGl0IGFuZCBzYXZlIHRoZSBldmVudFxuXHQgKi9cblx0YXN5bmMgc2hvd05ld0NhbGVuZGFyRXZlbnRFZGl0RGlhbG9nKG1vZGVsOiBDYWxlbmRhckV2ZW50TW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRsZXQgZmluaXNoZWQgPSBmYWxzZVxuXG5cdFx0Y29uc3Qgb2tBY3Rpb246IEVkaXREaWFsb2dPa0hhbmRsZXIgPSBhc3luYyAocG9zUmVjdCwgZmluaXNoKSA9PiB7XG5cdFx0XHQvKiogbmV3IGV2ZW50LCBzbyB3ZSBhbHdheXMgd2FudCB0byBzZW5kIGludml0ZXMuICovXG5cdFx0XHRtb2RlbC5lZGl0TW9kZWxzLndob01vZGVsLnNob3VsZFNlbmRVcGRhdGVzID0gdHJ1ZVxuXHRcdFx0aWYgKGZpbmlzaGVkKSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBtb2RlbC5hcHBseSgpXG5cdFx0XHRcdGlmIChyZXN1bHQgPT09IEV2ZW50U2F2ZVJlc3VsdC5TYXZlZCkge1xuXHRcdFx0XHRcdGZpbmlzaGVkID0gdHJ1ZVxuXHRcdFx0XHRcdGZpbmlzaCgpXG5cblx0XHRcdFx0XHRhd2FpdCBoYW5kbGVSYXRpbmdCeUV2ZW50KClcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFVzZXJFcnJvcikge1xuXHRcdFx0XHRcdC8vIG5vaW5zcGVjdGlvbiBFUzZNaXNzaW5nQXdhaXRcblx0XHRcdFx0XHRzaG93VXNlckVycm9yKGUpXG5cdFx0XHRcdH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIFVwZ3JhZGVSZXF1aXJlZEVycm9yKSB7XG5cdFx0XHRcdFx0YXdhaXQgc2hvd1BsYW5VcGdyYWRlUmVxdWlyZWREaWFsb2coZS5wbGFucylcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5zaG93Q2FsZW5kYXJFdmVudEVkaXREaWFsb2cobW9kZWwsIG51bGwsIG9rQWN0aW9uKVxuXHR9XG5cblx0LyoqXG5cdCAqIHNob3cgYSBkaWFsb2cgdGhhdCBhbGxvd3MgdG8gZWRpdCBhIGNhbGVuZGFyIGV2ZW50IHRoYXQgYWxyZWFkeSBleGlzdHMuXG5cdCAqXG5cdCAqIG9uIHNhdmUsIHdpbGwgdmFsaWRhdGUgZXh0ZXJuYWwgcGFzc3dvcmRzLCBhY2NvdW50IHR5cGUgYW5kIHVzZXIgaW50ZW50IGJlZm9yZSBhY3R1YWxseSBzYXZpbmcgYW5kIHNlbmRpbmcgdXBkYXRlcy9pbnZpdGVzL2NhbmNlbGxhdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtb2RlbCB0aGUgY2FsZW5kYXIgZXZlbnQgbW9kZWwgdXNlZCB0byBlZGl0ICYgc2F2ZSB0aGUgZXZlbnRcblx0ICogQHBhcmFtIGlkZW50aXR5IHRoZSBpZGVudGl0eSBvZiB0aGUgZXZlbnQgdG8gZWRpdFxuXHQgKiBAcGFyYW0gcmVzcG9uc2VNYWlsIGEgbWFpbCBjb250YWluaW5nIGFuIGludml0ZSBhbmQvb3IgdXBkYXRlIGZvciB0aGlzIGV2ZW50IGluIGNhc2Ugd2UgbmVlZCB0byByZXBseSB0byB0aGUgb3JnYW5pemVyXG5cdCAqL1xuXHRhc3luYyBzaG93RXhpc3RpbmdDYWxlbmRhckV2ZW50RWRpdERpYWxvZyhtb2RlbDogQ2FsZW5kYXJFdmVudE1vZGVsLCBpZGVudGl0eTogQ2FsZW5kYXJFdmVudElkZW50aXR5LCByZXNwb25zZU1haWw6IE1haWwgfCBudWxsID0gbnVsbCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBmaW5pc2hlZCA9IGZhbHNlXG5cblx0XHRpZiAoaWRlbnRpdHkudWlkID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwidHJpZWQgdG8gZWRpdCBleGlzdGluZyBldmVudCB3aXRob3V0IHVpZCwgdGhpcyBpcyBpbXBvc3NpYmxlIGZvciBjZXJ0YWluIGVkaXQgb3BlcmF0aW9ucy5cIilcblx0XHR9XG5cblx0XHRjb25zdCBva0FjdGlvbjogRWRpdERpYWxvZ09rSGFuZGxlciA9IGFzeW5jIChwb3NSZWN0LCBmaW5pc2gpID0+IHtcblx0XHRcdGlmIChmaW5pc2hlZCB8fCAoYXdhaXQgdGhpcy5hc2tVc2VySWZVcGRhdGVzQXJlTmVlZGVkT3JDYW5jZWwobW9kZWwpKSA9PT0gQ29uZmlybWF0aW9uUmVzdWx0LkNhbmNlbCkge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgbW9kZWwuYXBwbHkoKVxuXHRcdFx0XHRpZiAocmVzdWx0ID09PSBFdmVudFNhdmVSZXN1bHQuU2F2ZWQgfHwgcmVzdWx0ID09PSBFdmVudFNhdmVSZXN1bHQuTm90Rm91bmQpIHtcblx0XHRcdFx0XHRmaW5pc2hlZCA9IHRydWVcblx0XHRcdFx0XHRmaW5pc2goKVxuXG5cdFx0XHRcdFx0Ly8gSW5mb3JtIHRoZSB1c2VyIHRoYXQgdGhlIGV2ZW50IHdhcyBkZWxldGVkLCBhdm9pZGluZyBtaXN1bmRlcnN0YW5kaW5nIHRoYXQgdGhlIGV2ZW50IHdhcyBzYXZlZFxuXHRcdFx0XHRcdGlmIChyZXN1bHQgPT09IEV2ZW50U2F2ZVJlc3VsdC5Ob3RGb3VuZCkgRGlhbG9nLm1lc3NhZ2UoXCJldmVudE5vTG9uZ2VyRXhpc3RzX21zZ1wiKVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmIChlIGluc3RhbmNlb2YgVXNlckVycm9yKSB7XG5cdFx0XHRcdFx0Ly8gbm9pbnNwZWN0aW9uIEVTNk1pc3NpbmdBd2FpdFxuXHRcdFx0XHRcdHNob3dVc2VyRXJyb3IoZSlcblx0XHRcdFx0fSBlbHNlIGlmIChlIGluc3RhbmNlb2YgVXBncmFkZVJlcXVpcmVkRXJyb3IpIHtcblx0XHRcdFx0XHRhd2FpdCBzaG93UGxhblVwZ3JhZGVSZXF1aXJlZERpYWxvZyhlLnBsYW5zKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IGVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnNob3dDYWxlbmRhckV2ZW50RWRpdERpYWxvZyhtb2RlbCwgcmVzcG9uc2VNYWlsLCBva0FjdGlvbilcblx0fVxuXG5cdC8qKiBpZiB0aGVyZSBhcmUgdXBkYXRlIHdvcnRoeSBjaGFuZ2VzIG9uIHRoZSBtb2RlbCwgYXNrIHRoZSB1c2VyIHdoYXQgdG8gZG8gd2l0aCB0aGVtLlxuXHQgKiBAcmV0dXJucyB7Q29uZmlybWF0aW9uUmVzdWx0fSBDYW5jZWwgaWYgdGhlIHdob2xlIHByb2Nlc3Mgc2hvdWxkIGJlIGNhbmNlbGxlZCwgQ29udGludWUgaWYgdGhlIHVzZXIgc2VsZWN0ZWQgd2hldGhlciB0byBzZW5kIHVwZGF0ZXMgYW5kIHRoZSBzYXZpbmdcblx0ICogc2hvdWxkIHByb2NlZWQuXG5cdCAqICovXG5cdGFzeW5jIGFza1VzZXJJZlVwZGF0ZXNBcmVOZWVkZWRPckNhbmNlbChtb2RlbDogQ2FsZW5kYXJFdmVudE1vZGVsKTogUHJvbWlzZTxDb25maXJtYXRpb25SZXN1bHQ+IHtcblx0XHRpZiAobW9kZWwuaXNBc2tpbmdGb3JVcGRhdGVzTmVlZGVkKCkpIHtcblx0XHRcdHN3aXRjaCAoYXdhaXQgYXNrSWZTaG91bGRTZW5kQ2FsZW5kYXJVcGRhdGVzVG9BdHRlbmRlZXMoKSkge1xuXHRcdFx0XHRjYXNlIFwieWVzXCI6XG5cdFx0XHRcdFx0bW9kZWwuZWRpdE1vZGVscy53aG9Nb2RlbC5zaG91bGRTZW5kVXBkYXRlcyA9IHRydWVcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFwibm9cIjpcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRjYXNlIFwiY2FuY2VsXCI6XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJub3Qgc2F2aW5nIGV2ZW50OiB1c2VyIGNhbmNlbGxlZCB1cGRhdGUgc2VuZGluZy5cIilcblx0XHRcdFx0XHRyZXR1cm4gQ29uZmlybWF0aW9uUmVzdWx0LkNhbmNlbFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBDb25maXJtYXRpb25SZXN1bHQuQ29udGludWVcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBeUdhLFNBQU4sTUFBNkY7Q0FDbkcsQUFBUSxhQUFzQjtDQUM5QixBQUFRO0NBQ1IsQUFBUSxNQUFjO0NBRXRCLEtBQUssRUFDSixPQUFPLEVBQ04sVUFDQSxTQUNBLGNBQ0EsZUFDQSxTQUNBLFVBQ0EsYUFDQSxVQUNBLFVBQ0EsV0FDQSxXQUNBLElBQ0EsUUFDQSxXQUNBLFVBQ0EsU0FDQSxrQkFDQSxFQUNvQyxFQUFFO0FBQ3ZDLFNBQU8sZ0JBQ04sMENBQ0E7R0FDQztHQUNBLE9BQU8sS0FBSyxlQUFlLFNBQVMsVUFBVSxTQUFTO0dBQ3ZELFNBQVMsQ0FBQ0EsVUFDVCxNQUFNLGlCQUNOLEtBQUssZUFDSixTQUNBLE1BQU0sZUFDTixVQUNBLGNBQ0EsYUFBYSxPQUNiLFVBQVUsT0FDVixTQUNBLGlCQUNBO0dBQ0YsTUFBTSxTQUFTO0dBQ2Y7R0FDVTtHQUNWLGNBQWMsT0FBTyxLQUFLLFdBQVc7R0FDckMsVUFBVSxZQUFZLE9BQU8sV0FBVyxTQUFTLGVBQWUsU0FBUyxRQUFRO0dBQ2pGLE9BQU8sVUFBVTtFQUNqQixHQUNELENBQ0MsWUFBWSxPQUFPLGNBQWMsU0FBUyxHQUFHLEtBQUssa0JBQWtCLFlBQVksRUFDaEYsV0FBVyxPQUNSLGdCQUFFLE1BQU07R0FDUixNQUFNLFVBQVU7R0FDaEIsV0FBVztHQUNYLFFBQVE7R0FDUixNQUFNLFNBQVM7R0FDZixPQUFPLEVBQ04sTUFBTSxhQUFhLFVBQVUsWUFBWSxRQUFRLENBQUMsT0FDbEQ7RUFDQSxFQUFDLEdBQ0YsSUFDSCxFQUNEO0NBQ0Q7Q0FFRCxBQUFRLGVBQWVDLFVBQXlCLENB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
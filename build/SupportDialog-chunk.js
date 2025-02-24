import { __toESM } from "./chunk-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertMainOrNode, isWebClient } from "./Env-chunk.js";
import { client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { noOp } from "./dist2-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import { theme } from "./theme-chunk.js";
import { Keys, MailMethod, PlanTypeToName } from "./TutanotaConstants-chunk.js";
import { windowFacade } from "./WindowFacade-chunk.js";
import { px, size } from "./size-chunk.js";
import { SupportDataTypeRef } from "./TypeRefs-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { CacheMode } from "./EntityRestClient-chunk.js";
import { BaseButton, ButtonColor, ButtonType, getColors } from "./Button-chunk.js";
import { BlueskyLogo, Icons, MastodonLogo } from "./Icons-chunk.js";
import { Dialog } from "./Dialog-chunk.js";
import { Icon, IconSize } from "./Icon-chunk.js";
import { convertTextToHtml } from "./Formatter-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { showProgressDialog } from "./ProgressDialog-chunk.js";
import { Card, SectionButton, Switch } from "./SectionButton-chunk.js";
import { clientInfoString, getLogAttachments } from "./ErrorReporter-chunk.js";
import { LoginButton } from "./LoginButton-chunk.js";
import { showUpgradeDialog } from "./NavFunctions-chunk.js";
import { HtmlEditor } from "./HtmlEditor-chunk.js";
import { htmlSanitizer } from "./HtmlSanitizer-chunk.js";
import { chooseAndAttachFile } from "./MailEditorViewModel-chunk.js";

//#region src/common/gui/dialogs/MultiPageDialog.ts
var import_stream$1 = __toESM(require_stream(), 1);
var MultiPageDialog = class {
	currentPageStream;
	pageStackStream;
	isAnimating = (0, import_stream$1.default)(false);
	constructor(rootPage) {
		this.currentPageStream = (0, import_stream$1.default)(rootPage);
		this.pageStackStream = (0, import_stream$1.default)([rootPage]);
	}
	goBack = (to) => {
		if (this.isAnimating() || this.pageStackStream().length < 2) return;
		const tmp = this.pageStackStream();
		if (to !== undefined) {
			if (!this.pageStackStream().includes(to)) {
				console.error(new ProgrammingError("Cannot go back to a page that was never visited before."));
				return;
			}
			while (tmp[tmp.length - 1] !== to) tmp.pop();
		} else tmp.pop();
		this.pageStackStream(tmp);
		this.currentPageStream(tmp[tmp.length - 1]);
	};
	navigateToPage = (target) => {
		if (this.isAnimating()) return;
		const tmp = this.pageStackStream();
		tmp.push(target);
		this.currentPageStream(target);
		this.pageStackStream(tmp);
	};
	/**
	* Prepares dialog attributes and builds a MediumDialog returning it to the caller
	* @param renderContent
	* @param getLeftAction
	* @param getPageTitle
	* @param getRightAction
	*/
	buildDialog(renderContent, { getLeftAction, getPageTitle, getRightAction }) {
		const dialog = Dialog.editMediumDialog({
			left: () => [getLeftAction?.(this.currentPageStream(), dialog, this.navigateToPage, this.goBack)].filter((item) => !!item),
			middle: getPageTitle(this.currentPageStream()),
			right: () => [getRightAction?.(this.currentPageStream(), dialog, this.navigateToPage, this.goBack)].filter((item) => !!item)
		}, MultiPageDialogViewWrapper, {
			currentPageStream: this.currentPageStream,
			renderContent: (page) => renderContent(page(), dialog, this.navigateToPage, this.goBack),
			stackStream: this.pageStackStream,
			isAnimating: this.isAnimating
		}, {
			height: "100%",
			"background-color": theme.navigation_bg
		});
		if (client.isMobileDevice()) dialog.setFocusOnLoadFunction(noOp);
		return dialog;
	}
};
var SlideDirection = function(SlideDirection$1) {
	SlideDirection$1[SlideDirection$1["LEFT"] = 0] = "LEFT";
	SlideDirection$1[SlideDirection$1["RIGHT"] = 1] = "RIGHT";
	return SlideDirection$1;
}(SlideDirection || {});
var MultiPageDialogViewWrapper = class {
	transitionPage = (0, import_stream$1.default)(null);
	dialogHeight = null;
	pageWidth = -1;
	translate = 0;
	pagesWrapperDomElement;
	stackSize = 1;
	slideDirection = undefined;
	transitionClass = "";
	constructor(vnode) {
		vnode.attrs.stackStream.map((newStack) => {
			const newStackLength = newStack.length;
			if (newStackLength < this.stackSize && newStack.length > 0) {
				this.slideDirection = SlideDirection.LEFT;
				this.goBack(vnode);
				this.stackSize = newStackLength;
			} else if (newStackLength > this.stackSize) {
				this.slideDirection = SlideDirection.RIGHT;
				this.stackSize = newStackLength;
				this.transitionTo(vnode, newStack[newStackLength - 1]);
			}
		});
	}
	resizeListener = () => {
		this.setPageWidth(this.pagesWrapperDomElement);
		mithril_default.redraw();
	};
	setPageWidth(dom) {
		const parentElement = dom.parentElement;
		if (parentElement) this.pageWidth = dom.parentElement.clientWidth - size.hpad_large * 2;
		dom.style.width = px(this.pageWidth * 2 + size.vpad_xxl);
	}
	onremove(vnode) {
		windowFacade.removeResizeListener(this.resizeListener);
		vnode.attrs.currentPageStream.end(true);
	}
	oncreate(vnode) {
		this.pagesWrapperDomElement = vnode.dom;
		vnode.dom.addEventListener("transitionend", () => {
			this.transitionClass = "";
			vnode.attrs.isAnimating(false);
			this.transitionPage(null);
			this.translate = 0;
			mithril_default.redraw();
		});
		windowFacade.addResizeListener(this.resizeListener);
	}
	onupdate(vnode) {
		const dom = vnode.dom;
		if (this.dialogHeight == null && dom.parentElement) {
			this.dialogHeight = dom.parentElement.clientHeight;
			vnode.dom.style.height = px(this.dialogHeight);
		}
		if (this.pageWidth == -1 && dom.parentElement) {
			this.setPageWidth(dom);
			mithril_default.redraw();
		}
	}
	wrap(children) {
		return mithril_default("", { style: { width: px(this.pageWidth) } }, children);
	}
	getFillerPage(currentPage, stack) {
		const page = this.slideDirection == SlideDirection.RIGHT ? stack[stack.length - 2] : this.transitionPage();
		return (0, import_stream$1.default)(page ?? currentPage);
	}
	renderPage(vnode) {
		const updatedStackSize = vnode.attrs.stackStream().length;
		const fillerPageStream = this.getFillerPage(vnode.attrs.currentPageStream(), vnode.attrs.stackStream());
		const pages = [this.wrap(vnode.attrs.renderContent(fillerPageStream)), this.wrap(vnode.attrs.renderContent(vnode.attrs.currentPageStream))];
		const isOnRootPage = this.transitionPage() == null && updatedStackSize >= 2;
		if (vnode.attrs.isAnimating() && !isOnRootPage) return this.slideDirection === SlideDirection.RIGHT ? pages : pages.reverse();
		return this.slideDirection === SlideDirection.RIGHT ? pages.reverse() : pages;
	}
	goBack(vnode) {
		this.tryScrollToTop();
		const target = vnode.attrs.currentPageStream();
		this.translate = -(this.pageWidth + size.vpad_xxl);
		mithril_default.redraw.sync();
		requestAnimationFrame(() => {
			vnode.attrs.isAnimating(true);
			this.transitionPage(target);
			this.transitionClass = "transition-transform";
			this.translate = 0;
		});
	}
	/**
	* Determines the parent element of the pages wrapper (which should be the dialog) and sets the `scrollTop` to `0`.
	* If the parent element is not found or does not include the `scroll` CSS class, nothing will happen.
	*/
	tryScrollToTop() {
		const parentElement = this.pagesWrapperDomElement.parentElement;
		if (parentElement?.classList.contains("scroll")) parentElement.scrollTop = 0;
	}
	transitionTo(vnode, target) {
		this.tryScrollToTop();
		this.translate = 0;
		mithril_default.redraw.sync();
		requestAnimationFrame(() => {
			vnode.attrs.isAnimating(true);
			this.transitionPage(target);
			this.transitionClass = "transition-transform";
			this.translate = -(this.pageWidth + size.vpad_xxl);
		});
	}
	view(vnode) {
		return mithril_default(".flex.gap-vpad-xxl.fit-content", {
			class: this.transitionClass,
			style: { transform: `translateX(${this.translate}px)` }
		}, this.renderPage(vnode));
	}
};

//#endregion
//#region src/common/support/NoSolutionSectionButton.ts
var NoSolutionSectionButton = class {
	view({ attrs: { onClick } }) {
		return mithril_default(SectionButton, {
			text: "other_label",
			onclick: onClick
		});
	}
};

//#endregion
//#region src/common/support/pages/SupportLandingPage.ts
var SupportLandingPage = class {
	view({ attrs: { data: { categories, selectedCategory }, goToContactSupport, toCategoryDetail } }) {
		const defaultHeight = 666;
		return mithril_default(".pt.pb", { style: { height: px(defaultHeight) } }, mithril_default(Card, { classes: [] }, mithril_default("", { style: { padding: "0.5em" } }, mithril_default(".center", mithril_default(Icon, {
			icon: Icons.SpeechBubbleOutline,
			size: IconSize.XXL
		})), mithril_default(".center.h4", lang.get("supportStartPage_title")), mithril_default(".center", lang.get("supportStartPage_msg")))), mithril_default(".pb.pt.flex.col.gap-vpad.fit-height.box-content", categories.map((category) => mithril_default(SectionButton, {
			leftIcon: {
				icon: category.icon,
				title: "close_alt",
				fill: theme.content_accent
			},
			text: {
				text: getLocalisedCategoryName(category, lang.languageTag),
				testId: ""
			},
			onclick: () => {
				selectedCategory(category);
				toCategoryDetail();
			}
		})), mithril_default(NoSolutionSectionButton, { onClick: goToContactSupport })));
	}
};

//#endregion
//#region src/common/support/pages/SupportCategoryPage.ts
var SupportCategoryPage = class {
	view({ attrs: { data: { selectedCategory, selectedTopic }, goToTopicDetailPage, goToContactSupport } }) {
		const languageTag = lang.languageTag;
		const currentlySelectedCategory = selectedCategory();
		return mithril_default(".pt.pb", [mithril_default(Card, { shouldDivide: true }, [
			mithril_default("section.pt-s.pb-s", { style: { padding: px(size.vpad_small) } }, [mithril_default(".h4.mb-0", getLocalisedCategoryName(selectedCategory(), languageTag)), mithril_default("p.mt-xs.mb-s", getLocalisedCategoryIntroduction(currentlySelectedCategory, languageTag))]),
			currentlySelectedCategory.topics.map((topic) => mithril_default(SectionButton, {
				text: {
					text: getLocalisedTopicIssue(topic, languageTag),
					testId: ""
				},
				onclick: () => {
					selectedTopic(topic);
					goToTopicDetailPage();
				}
			})),
			mithril_default(NoSolutionSectionButton, { onClick: () => goToContactSupport() })
		])]);
	}
};

//#endregion
//#region src/common/support/pages/SupportTopicPage.ts
var SupportTopicPage = class {
	view({ attrs: { data, goToContactSupportPage, goToSolutionWasHelpfulPage } }) {
		const topic = data.selectedTopic();
		if (topic == null) return;
		const languageTag = lang.languageTag;
		const solution = languageTag.includes("de") ? topic.solutionHtmlDE : topic.solutionHtmlEN;
		const sanitisedSolution = htmlSanitizer.sanitizeHTML(convertTextToHtml(solution), { blockExternalContent: true }).html;
		const issue = getLocalisedTopicIssue(topic, languageTag);
		return mithril_default(".flex.flex-column.pt.pb", {
			style: { "overflow-x": "auto" },
			class: "height-100p"
		}, [mithril_default(Card, {
			rootElementType: "div",
			classes: ["scroll", "mb"]
		}, mithril_default(".h4.m-0.pb", issue), mithril_default.trust(sanitisedSolution))], mithril_default(WasThisHelpful, {
			goToContactSupportPage,
			goToSolutionWasHelpfulPage
		}));
	}
};
var WasThisHelpful = class {
	view({ attrs: { goToContactSupportPage, goToSolutionWasHelpfulPage } }) {
		return mithril_default(".flex.flex-column.gap-vpad-s", mithril_default("small.uppercase.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("wasThisHelpful_msg")), mithril_default(Card, { shouldDivide: true }, [mithril_default(SectionButton, {
			text: "yes_label",
			onclick: goToSolutionWasHelpfulPage,
			rightIcon: {
				icon: Icons.Checkmark,
				title: "yes_label"
			}
		}), mithril_default(SectionButton, {
			text: "no_label",
			onclick: goToContactSupportPage
		})]));
	}
};

//#endregion
//#region src/common/support/pages/ContactSupportPage.ts
var ContactSupportPage = class {
	sendMailModel;
	oninit({ attrs: { data } }) {
		this.collectLogs().then((logs) => {
			data.logs(logs);
			mithril_default.redraw();
		});
	}
	async oncreate() {
		this.sendMailModel = await createSendMailModel();
		await this.sendMailModel.initWithTemplate({ to: [{
			name: null,
			address: "helpdesk@tutao.de"
		}] }, "", "", [], false);
	}
	/**
	* Gets the subject of the support request considering the users current plan and the path they took to get to the contact form.
	* Appends the category and topic if present.
	*
	* **Example output: `Support Request - Unlimited - Account: I cannot login.`**
	*/
	async getSubject(data) {
		const MAX_ISSUE_LENGTH = 60;
		let subject = `Support Request (${PlanTypeToName[await locator.logins.getUserController().getPlanType()]})`;
		const selectedCategory = data.selectedCategory();
		const selectedTopic = data.selectedTopic();
		if (selectedCategory != null && selectedTopic != null) {
			const localizedTopic = getLocalisedTopicIssue(selectedTopic, lang.languageTag);
			const issue = localizedTopic.length > MAX_ISSUE_LENGTH ? localizedTopic.substring(0, MAX_ISSUE_LENGTH) + "..." : localizedTopic;
			subject += ` - ${getLocalisedCategoryName(selectedCategory, lang.languageTag)}: ${issue}`;
		}
		if (selectedCategory != null && selectedTopic == null) subject += ` - ${getLocalisedCategoryName(selectedCategory, lang.languageTag)}`;
		return subject;
	}
	view({ attrs: { data, goToSuccessPage } }) {
		return mithril_default(".flex.flex-column.pt.height-100p.gap-vpad", mithril_default(Card, mithril_default("", mithril_default("p.h4.m-0", lang.get("supportForm_title")), mithril_default("p.m-0.mt-s", lang.get("supportForm_msg")))), mithril_default(Card, {
			classes: [
				"child-text-editor",
				"rel",
				"height-100p"
			],
			style: { padding: "0" }
		}, mithril_default(data.htmlEditor)), mithril_default(".flex.flex-column.gap-vpad.pb", { style: { marginTop: "auto" } }, mithril_default(Card, { shouldDivide: true }, [mithril_default(SectionButton, {
			text: "attachFiles_action",
			rightIcon: {
				icon: Icons.Attachment,
				title: "attachFiles_action"
			},
			onclick: async (_, dom) => {
				await chooseAndAttachFile(this.sendMailModel, dom.getBoundingClientRect());
				mithril_default.redraw();
			}
		}), (this.sendMailModel?.getAttachments() ?? []).map((attachment) => mithril_default(".flex.center-vertically.flex-space-between.pb-s.pt-s", { style: { paddingInline: px(size.vpad_small) } }, mithril_default("span.smaller", attachment.name), mithril_default(BaseButton, {
			label: "remove_action",
			onclick: () => {
				this.sendMailModel?.removeAttachment(attachment);
				mithril_default.redraw();
			},
			class: "flex justify-between flash"
		}, mithril_default(Icon, {
			icon: Icons.Trash,
			style: {
				fill: getColors(ButtonColor.Content).button,
				paddingInline: px((size.icon_size_large - size.icon_size_medium) / 2)
			},
			title: lang.get("remove_action"),
			size: IconSize.Normal
		}))))]), mithril_default(Card, mithril_default(".flex.gap-vpad-s.items-center", [mithril_default(Switch, {
			checked: data.shouldIncludeLogs(),
			onclick: (checked) => data.shouldIncludeLogs(checked),
			ariaLabel: lang.get("sendLogs_action"),
			variant: "expanded"
		}, lang.get("sendLogs_action"))])), mithril_default(".align-self-center.full-width", mithril_default(LoginButton, {
			label: "send_action",
			onclick: async () => {
				if (!this.sendMailModel) return;
				const message = data.htmlEditor.getValue();
				const mailBody = data.shouldIncludeLogs() ? `${message}${clientInfoString(new Date(), true).message}` : message;
				const sanitisedBody = htmlSanitizer.sanitizeHTML(convertTextToHtml(mailBody), { blockExternalContent: true }).html;
				this.sendMailModel.setBody(sanitisedBody);
				this.sendMailModel.setSubject(await this.getSubject(data));
				if (data.shouldIncludeLogs()) this.sendMailModel.attachFiles(data.logs());
				await this.sendMailModel.send(MailMethod.NONE, () => Promise.resolve(true), showProgressDialog);
				goToSuccessPage();
			}
		}))));
	}
	async collectLogs() {
		return await getLogAttachments(new Date());
	}
};
async function createSendMailModel() {
	const mailboxDetails = await locator.mailboxModel.getUserMailboxDetails();
	const mailboxProperties = await locator.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
	return await locator.sendMailModel(mailboxDetails, mailboxProperties);
}

//#endregion
//#region src/common/support/pages/SupportSuccessPage.ts
var SupportSuccessPage = class {
	view() {
		return mithril_default(".pt.pb", mithril_default(Card, { shouldDivide: true }, mithril_default(".plr", mithril_default(".h4.pb-s.pt-s", lang.get("supportSuccess_msg")), mithril_default("p.m-0", lang.get("supportSocialsInfo_msg")), mithril_default(".mt-l.mb-s", {}, mithril_default("img.block.full-width.height-100p", {
			src: `${window.tutao.appState.prefixWithoutFile}/images/leaving-wizard/problem.png`,
			alt: "",
			rel: "noreferrer",
			loading: "lazy",
			decoding: "async"
		}))), mithril_default(SectionButton, {
			text: {
				text: "Tuta Blog",
				testId: ""
			},
			injectionLeft: mithril_default("img", {
				src: `${window.tutao.appState.prefixWithoutFile}/images/logo-favicon-152.png`,
				alt: "Tuta.com logo",
				rel: "noreferrer",
				loading: "lazy",
				decoding: "async",
				style: {
					width: "20px",
					height: "20px",
					padding: "2px"
				}
			}),
			rightIcon: {
				icon: Icons.Open,
				title: "close_alt"
			},
			onclick: () => {
				windowFacade.openLink("https://tuta.com/blog");
			}
		}), mithril_default(SectionButton, {
			text: {
				text: "Mastodon",
				testId: ""
			},
			rightIcon: {
				icon: Icons.Open,
				title: "open_action"
			},
			injectionLeft: mithril_default(".", { style: {
				width: "24px",
				height: "24px"
			} }, mithril_default.trust(MastodonLogo)),
			onclick: () => {
				windowFacade.openLink("https://mastodon.social/@Tutanota");
			}
		}), mithril_default(SectionButton, {
			text: {
				text: "BlueSky",
				testId: ""
			},
			injectionLeft: mithril_default(".", { style: {
				width: "24px",
				height: "24px"
			} }, mithril_default.trust(BlueskyLogo)),
			rightIcon: {
				icon: Icons.Open,
				title: "open_action"
			},
			onclick: () => {
				windowFacade.openLink("https://bsky.app/profile/tutaprivacy.bsky.social");
			}
		})));
	}
};

//#endregion
//#region src/common/support/pages/EmailSupportUnavailablePage.ts
var EmailSupportUnavailablePage = class {
	view({ attrs: { data, goToContactSupportPage } }) {
		return mithril_default(".pt.pb", mithril_default(Card, { shouldDivide: true }, mithril_default("div.pt-s.pb-s.plr", [
			mithril_default(".h4.mt-xs", lang.get("supportNoDirectSupport_title")),
			mithril_default("p", lang.get("supportNoDirectSupport_msg")),
			mithril_default("img.block", {
				src: `${window.tutao.appState.prefixWithoutFile}/images/leaving-wizard/account.png`,
				alt: "",
				rel: "noreferrer",
				loading: "lazy",
				decoding: "async",
				style: {
					margin: "0 auto",
					width: "100%"
				}
			})
		]), mithril_default(SectionButton, {
			text: {
				text: "Tuta FAQ",
				testId: ""
			},
			injectionLeft: mithril_default("img", {
				src: `${window.tutao.appState.prefixWithoutFile}/images/logo-favicon-152.png`,
				alt: "Tuta.com logo",
				rel: "noreferrer",
				loading: "lazy",
				decoding: "async",
				style: {
					width: "20px",
					height: "20px",
					padding: "2px"
				}
			}),
			rightIcon: {
				icon: Icons.Open,
				title: "close_alt"
			},
			onclick: () => {
				windowFacade.openLink("https://tuta.com/support");
			}
		})), mithril_default(".mt-l.center", mithril_default(BaseButton, {
			label: "upgrade_action",
			text: lang.get("upgrade_action"),
			class: `button-content border-radius accent-bg center plr-button flash full-width`,
			onclick: async () => {
				await showUpgradeDialog();
				const isPaidPlanNow = !locator.logins.getUserController().isFreeAccount();
				if (isPaidPlanNow) {
					data.canHaveEmailSupport = true;
					setTimeout(() => {
						goToContactSupportPage();
					}, 1e3);
				}
			},
			disabled: false
		})));
	}
};

//#endregion
//#region src/common/support/SupportVisibilityMask.ts
let SupportVisibilityMask = function(SupportVisibilityMask$1) {
	SupportVisibilityMask$1[SupportVisibilityMask$1["DesktopOrWebApp"] = 1] = "DesktopOrWebApp";
	SupportVisibilityMask$1[SupportVisibilityMask$1["TutaMailMobile"] = 2] = "TutaMailMobile";
	SupportVisibilityMask$1[SupportVisibilityMask$1["TutaCalendarMobile"] = 4] = "TutaCalendarMobile";
	SupportVisibilityMask$1[SupportVisibilityMask$1["FreeUsers"] = 8] = "FreeUsers";
	SupportVisibilityMask$1[SupportVisibilityMask$1["PaidUsers"] = 16] = "PaidUsers";
	return SupportVisibilityMask$1;
}({});

//#endregion
//#region src/common/support/pages/SupportRequestSentPage.ts
var SupportRequestSentPage = class {
	view() {
		return mithril_default(".pt.pb", mithril_default(Card, mithril_default("", mithril_default(".h4.center.pb-s.pt-s", lang.get("supportRequestReceived_title")), mithril_default("p.center.m-0", lang.get("supportRequestReceived_msg")), mithril_default(".mt-l.mb-s", {}, mithril_default("img.pb.block.full-width.height-100p", {
			src: `${window.tutao.appState.prefixWithoutFile}/images/leaving-wizard/other.png`,
			alt: "",
			rel: "noreferrer",
			loading: "lazy",
			decoding: "async"
		})))));
	}
};

//#endregion
//#region src/common/support/SupportDialog.ts
var import_stream = __toESM(require_stream(), 1);
assertMainOrNode();
var SupportPages = function(SupportPages$1) {
	SupportPages$1[SupportPages$1["CATEGORIES"] = 0] = "CATEGORIES";
	SupportPages$1[SupportPages$1["CATEGORY_DETAIL"] = 1] = "CATEGORY_DETAIL";
	SupportPages$1[SupportPages$1["TOPIC_DETAIL"] = 2] = "TOPIC_DETAIL";
	SupportPages$1[SupportPages$1["CONTACT_SUPPORT"] = 3] = "CONTACT_SUPPORT";
	SupportPages$1[SupportPages$1["SUPPORT_REQUEST_SENT"] = 4] = "SUPPORT_REQUEST_SENT";
	SupportPages$1[SupportPages$1["EMAIL_SUPPORT_BEHIND_PAYWALL"] = 5] = "EMAIL_SUPPORT_BEHIND_PAYWALL";
	SupportPages$1[SupportPages$1["SOLUTION_WAS_HELPFUL"] = 6] = "SOLUTION_WAS_HELPFUL";
	return SupportPages$1;
}(SupportPages || {});
function isEnabled(visibility, mask) {
	return !!(visibility & mask);
}
async function showSupportDialog(logins) {
	const supportData = await locator.entityClient.load(SupportDataTypeRef, "--------1---", { cacheMode: CacheMode.WriteOnly });
	const categories = supportData.categories;
	for (const key in supportData.categories) {
		const filteredTopics = [];
		const supportCategory = categories[key];
		for (const topic of supportCategory.topics) {
			const visibility = Number(topic.visibility);
			const meetsPlatform = isEnabled(visibility, SupportVisibilityMask.TutaCalendarMobile) && client.isCalendarApp() || isEnabled(visibility, SupportVisibilityMask.TutaMailMobile) && client.isMailApp() || isEnabled(visibility, SupportVisibilityMask.DesktopOrWebApp) && (client.isDesktopDevice() || isWebClient());
			const isFreeAccount = !locator.logins.getUserController().isPaidAccount();
			const meetsCustomerStatus = isEnabled(visibility, SupportVisibilityMask.FreeUsers) && isFreeAccount || isEnabled(visibility, SupportVisibilityMask.PaidUsers) && !isFreeAccount;
			if (meetsPlatform && meetsCustomerStatus) filteredTopics.push(topic);
		}
		supportCategory.topics = filteredTopics;
	}
	const data = {
		canHaveEmailSupport: logins.isInternalUserLoggedIn() && logins.getUserController().isPaidAccount(),
		selectedCategory: (0, import_stream.default)(null),
		selectedTopic: (0, import_stream.default)(null),
		categories: supportData.categories.filter((cat) => cat.topics.length > 0),
		htmlEditor: new HtmlEditor().setMinHeight(250).setEnabled(true),
		shouldIncludeLogs: (0, import_stream.default)(true),
		logs: (0, import_stream.default)([])
	};
	const multiPageDialog = new MultiPageDialog(SupportPages.CATEGORIES).buildDialog((currentPage, dialog, navigateToPage, _) => {
		switch (currentPage) {
			case SupportPages.CATEGORY_DETAIL: return mithril_default(SupportCategoryPage, {
				data,
				goToContactSupport: () => {
					if (data.canHaveEmailSupport) navigateToPage(SupportPages.CONTACT_SUPPORT);
else navigateToPage(SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL);
				},
				goToTopicDetailPage: () => navigateToPage(SupportPages.TOPIC_DETAIL)
			});
			case SupportPages.TOPIC_DETAIL: return mithril_default(SupportTopicPage, {
				data,
				dialog,
				goToSolutionWasHelpfulPage: () => {
					navigateToPage(SupportPages.SOLUTION_WAS_HELPFUL);
				},
				goToContactSupportPage: () => {
					if (data.canHaveEmailSupport) navigateToPage(SupportPages.CONTACT_SUPPORT);
else navigateToPage(SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL);
				}
			});
			case SupportPages.CONTACT_SUPPORT: return mithril_default(ContactSupportPage, {
				data,
				goToSuccessPage: () => navigateToPage(SupportPages.SUPPORT_REQUEST_SENT)
			});
			case SupportPages.SOLUTION_WAS_HELPFUL: return mithril_default(SupportSuccessPage);
			case SupportPages.SUPPORT_REQUEST_SENT: return mithril_default(SupportRequestSentPage);
			case SupportPages.CATEGORIES: return mithril_default(SupportLandingPage, {
				data,
				toCategoryDetail: () => navigateToPage(SupportPages.CATEGORY_DETAIL),
				goToContactSupport: () => {
					if (data.canHaveEmailSupport) navigateToPage(SupportPages.CONTACT_SUPPORT);
else navigateToPage(SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL);
				}
			});
			case SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL: return mithril_default(EmailSupportUnavailablePage, {
				data,
				goToContactSupportPage: () => {
					navigateToPage(SupportPages.CONTACT_SUPPORT);
				}
			});
		}
	}, {
		getPageTitle: (_) => {
			return {
				testId: "back_action",
				text: lang.get("supportMenu_label")
			};
		},
		getLeftAction: (currentPage, dialog, navigateToPage, goBack) => {
			switch (currentPage) {
				case SupportPages.CATEGORIES: return {
					type: ButtonType.Secondary,
					click: () => dialog.close(),
					label: "close_alt",
					title: "close_alt"
				};
				case SupportPages.TOPIC_DETAIL:
				case SupportPages.CATEGORY_DETAIL:
				case SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL: return {
					type: ButtonType.Secondary,
					click: () => goBack(),
					label: "back_action",
					title: "back_action"
				};
				case SupportPages.CONTACT_SUPPORT: return {
					type: ButtonType.Secondary,
					click: async () => {
						if (data.htmlEditor.getTrimmedValue().length > 10) {
							const confirmed = await Dialog.confirm({
								testId: "close_alt",
								text: lang.get("supportBackLostRequest_msg")
							});
							if (confirmed) goBack();
						} else goBack();
					},
					label: "back_action",
					title: "back_action"
				};
				case SupportPages.SOLUTION_WAS_HELPFUL:
				case SupportPages.SUPPORT_REQUEST_SENT: return {
					type: ButtonType.Secondary,
					click: () => dialog.close(),
					label: "close_alt",
					title: "close_alt"
				};
			}
		},
		getRightAction: (currentPage, dialog, _, __) => {
			if (currentPage === SupportPages.EMAIL_SUPPORT_BEHIND_PAYWALL) return {
				type: ButtonType.Secondary,
				label: "close_alt",
				title: "close_alt",
				click: () => {
					dialog.close();
				}
			};
		}
	}).addShortcut({
		help: "close_alt",
		key: Keys.ESC,
		exec: () => multiPageDialog.close()
	}).show();
}
function getLocalisedCategoryName(category, languageTag) {
	return languageTag.includes("de") ? category.nameDE : category.nameEN;
}
function getLocalisedCategoryIntroduction(category, languageTag) {
	return languageTag.includes("de") ? category.introductionDE : category.introductionEN;
}
function getLocalisedTopicIssue(topic, languageTag) {
	return languageTag.includes("de") ? topic.issueDE : topic.issueEN;
}

//#endregion
export { getLocalisedCategoryIntroduction, getLocalisedCategoryName, getLocalisedTopicIssue, showSupportDialog };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3VwcG9ydERpYWxvZy1jaHVuay5qcyIsIm5hbWVzIjpbInJvb3RQYWdlOiBUUGFnZXMiLCJ0bz86IFRQYWdlcyIsInRhcmdldDogVFBhZ2VzIiwicmVuZGVyQ29udGVudDogQ29udGVudFJlbmRlcmVyPFRQYWdlcz4iLCJkaWFsb2c6IERpYWxvZyIsInBhZ2U6IHN0cmVhbTxUUGFnZXM+Iiwidm5vZGU6IFZub2RlPFByb3BzPFRQYWdlcz4+IiwibmV3U3RhY2s6IFRQYWdlc1tdIiwiZG9tOiBIVE1MRWxlbWVudCIsInZub2RlOiBWbm9kZURPTTxQcm9wczxUUGFnZXM+PiIsImNoaWxkcmVuOiBDaGlsZHJlbiIsImN1cnJlbnRQYWdlOiBUUGFnZXMiLCJzdGFjazogVFBhZ2VzW10iLCJkYXRhOiBTdXBwb3J0RGlhbG9nU3RhdGUiLCJ2aXNpYmlsaXR5OiBudW1iZXIiLCJtYXNrOiBTdXBwb3J0VmlzaWJpbGl0eU1hc2siLCJsb2dpbnM6IExvZ2luQ29udHJvbGxlciIsImZpbHRlcmVkVG9waWNzOiBTdXBwb3J0VG9waWNbXSIsImRhdGE6IFN1cHBvcnREaWFsb2dTdGF0ZSIsIm11bHRpUGFnZURpYWxvZzogRGlhbG9nIiwiY2F0ZWdvcnk6IFN1cHBvcnRDYXRlZ29yeSIsImxhbmd1YWdlVGFnOiBzdHJpbmciLCJ0b3BpYzogU3VwcG9ydFRvcGljIl0sInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1vbi9ndWkvZGlhbG9ncy9NdWx0aVBhZ2VEaWFsb2cudHMiLCIuLi9zcmMvY29tbW9uL3N1cHBvcnQvTm9Tb2x1dGlvblNlY3Rpb25CdXR0b24udHMiLCIuLi9zcmMvY29tbW9uL3N1cHBvcnQvcGFnZXMvU3VwcG9ydExhbmRpbmdQYWdlLnRzIiwiLi4vc3JjL2NvbW1vbi9zdXBwb3J0L3BhZ2VzL1N1cHBvcnRDYXRlZ29yeVBhZ2UudHMiLCIuLi9zcmMvY29tbW9uL3N1cHBvcnQvcGFnZXMvU3VwcG9ydFRvcGljUGFnZS50cyIsIi4uL3NyYy9jb21tb24vc3VwcG9ydC9wYWdlcy9Db250YWN0U3VwcG9ydFBhZ2UudHMiLCIuLi9zcmMvY29tbW9uL3N1cHBvcnQvcGFnZXMvU3VwcG9ydFN1Y2Nlc3NQYWdlLnRzIiwiLi4vc3JjL2NvbW1vbi9zdXBwb3J0L3BhZ2VzL0VtYWlsU3VwcG9ydFVuYXZhaWxhYmxlUGFnZS50cyIsIi4uL3NyYy9jb21tb24vc3VwcG9ydC9TdXBwb3J0VmlzaWJpbGl0eU1hc2sudHMiLCIuLi9zcmMvY29tbW9uL3N1cHBvcnQvcGFnZXMvU3VwcG9ydFJlcXVlc3RTZW50UGFnZS50cyIsIi4uL3NyYy9jb21tb24vc3VwcG9ydC9TdXBwb3J0RGlhbG9nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG5vT3AgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBCdXR0b25BdHRycyB9IGZyb20gXCIuLi9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgc3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi90aGVtZS5qc1wiXG5pbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSwgVm5vZGVET00gfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vLi4vbWlzYy9DbGllbnREZXRlY3Rvci5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi9zaXplLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vYXBpL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCB7IHdpbmRvd0ZhY2FkZSwgd2luZG93U2l6ZUxpc3RlbmVyIH0gZnJvbSBcIi4uLy4uL21pc2MvV2luZG93RmFjYWRlLmpzXCJcbmltcG9ydCB7IE1heWJlVHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5cbnR5cGUgQ29udGVudFJlbmRlcmVyPFRQYWdlcz4gPSAoY3VycmVudFBhZ2U6IFRQYWdlcywgZGlhbG9nOiBEaWFsb2csIG5hdmlnYXRlVG9QYWdlOiAodGFyZ2V0UGFnZTogVFBhZ2VzKSA9PiB2b2lkLCBnb0JhY2s6ICh0bz86IFRQYWdlcykgPT4gdm9pZCkgPT4gQ2hpbGRyZW5cbnR5cGUgRGlhbG9nQWN0aW9uPFRQYWdlcz4gPSAoXG5cdGN1cnJlbnRQYWdlOiBUUGFnZXMsXG5cdGRpYWxvZzogRGlhbG9nLFxuXHRuYXZpZ2F0ZVRvUGFnZTogKHRhcmdldFBhZ2U6IFRQYWdlcykgPT4gdm9pZCxcblx0Z29CYWNrOiAodG8/OiBUUGFnZXMpID0+IHZvaWQsXG4pID0+IEJ1dHRvbkF0dHJzIHwgdW5kZWZpbmVkXG5cbnR5cGUgRGlhbG9nSGVhZGVyT3B0aW9uczxUUGFnZXM+ID0ge1xuXHRnZXRMZWZ0QWN0aW9uPzogRGlhbG9nQWN0aW9uPFRQYWdlcz5cblx0Z2V0UmlnaHRBY3Rpb24/OiBEaWFsb2dBY3Rpb248VFBhZ2VzPlxuXHRnZXRQYWdlVGl0bGU6IChjdXJyZW50UGFnZTogVFBhZ2VzKSA9PiBNYXliZVRyYW5zbGF0aW9uXG59XG5cbi8qKlxuICogTXVsdGlwYWdlIGRpYWxvZyB3aXRoIHRyYW5zaXRpb24gYW5pbWF0aW9ucy5cbiAqXG4gKiBAZXhhbXBsZVxuICogZW51bSBVcGdyYWRlUGxhblBhZ2VzIHtcbiAqICAgUExBTixcbiAqICAgSU5WT0lDRSxcbiAqICAgQ09ORklSTVxuICogfVxuICpcbiAqIGZ1bmN0aW9uIHJlbmRlckNvbnRlbnQocGFnZSwgZGlhbG9nLCBuYXZpZ2F0ZVRvUGFnZSwgZ29CYWNrKSB7XG4gKiAgICAgaWYocGFnZSA9PT0gVXBncmFkZVBsYW5QYWdlcy5QTEFOKSB7XG4gKiAgICAgICAgIC8vIHJldHVybiB5b3VyIGNvbXBvbmVudCBoZXJlIGZvciB0aGUgXCJwbGFuXCIgcGFnZS4uLlxuICogICAgIH1cbiAqXG4gKiAgICAgLy8gLi4uIHJldHVybiB5b3VyIG90aGVyIHBhZ2VzXG4gKiB9XG4gKlxuICogZnVuY3Rpb24gZ2V0TGVmdEFjdGlvbihwYWdlLCBkaWFsb2csIG5hdmlnYXRlVG9QYWdlLCBnb0JhY2spIHtcbiAqIFx0XHRpZihwYWdlID09PSBVcGdyYWRlUGxhblBhZ2VzLlBMQU4pIHtcbiAqXHRcdFx0cmV0dXJuIHtcbiAqXHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcbiAqXHRcdFx0XHRjbGljazogKCkgPT4gZGlhbG9nLmNsb3NlKClcbiAqXHRcdFx0XHRsYWJlbDogKCkgPT4gXCJDbG9zZVwiLFxuICpcdFx0XHR9XG4gKlx0XHR9XG4gKiAgXHQvLyAuLi4gaGFuZGxlIG90aGVyIHBhZ2VzXG4gKiB9XG4gKlxuICogY29uc3QgZGlhbG9nID0gbmV3IE11bHRpUGFnZURpYWxvZzxVcGdyYWRlUGxhblBhZ2VzPigpXG4gKiBcdCAuYnVpbGREaWFsb2cocmVuZGVyQ29udGVudCwgeyBnZXRMZWZ0QWN0aW9uLCBnZXRQYWdlVGl0bGUsIGdldFJpZ2h0QWN0aW9uIH0pXG4gKlxuICogZGlhbG9nLnNob3coKVxuICpcbiAqIEBzZWUgQ29udGVudFJlbmRlcmVyXG4gKiBAc2VlIERpYWxvZ0FjdGlvblxuICogQHNlZSBEaWFsb2dIZWFkZXJPcHRpb25zXG4gKiBAc2VlIEJ1dHRvbkF0dHJzXG4gKi9cbmV4cG9ydCBjbGFzcyBNdWx0aVBhZ2VEaWFsb2c8VFBhZ2VzPiB7XG5cdHByaXZhdGUgcmVhZG9ubHkgY3VycmVudFBhZ2VTdHJlYW06IHN0cmVhbTxUUGFnZXM+XG5cdHByaXZhdGUgcmVhZG9ubHkgcGFnZVN0YWNrU3RyZWFtOiBzdHJlYW08VFBhZ2VzW10+XG5cdHByaXZhdGUgcmVhZG9ubHkgaXNBbmltYXRpbmc6IHN0cmVhbTxib29sZWFuPiA9IHN0cmVhbShmYWxzZSlcblxuXHRjb25zdHJ1Y3Rvcihyb290UGFnZTogVFBhZ2VzKSB7XG5cdFx0dGhpcy5jdXJyZW50UGFnZVN0cmVhbSA9IHN0cmVhbShyb290UGFnZSlcblx0XHR0aGlzLnBhZ2VTdGFja1N0cmVhbSA9IHN0cmVhbShbcm9vdFBhZ2VdKVxuXHR9XG5cblx0cHJpdmF0ZSByZWFkb25seSBnb0JhY2sgPSAodG8/OiBUUGFnZXMpID0+IHtcblx0XHRpZiAodGhpcy5pc0FuaW1hdGluZygpIHx8IHRoaXMucGFnZVN0YWNrU3RyZWFtKCkubGVuZ3RoIDwgMikge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgdG1wID0gdGhpcy5wYWdlU3RhY2tTdHJlYW0oKVxuXHRcdGlmICh0byAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZiAoIXRoaXMucGFnZVN0YWNrU3RyZWFtKCkuaW5jbHVkZXModG8pKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IobmV3IFByb2dyYW1taW5nRXJyb3IoXCJDYW5ub3QgZ28gYmFjayB0byBhIHBhZ2UgdGhhdCB3YXMgbmV2ZXIgdmlzaXRlZCBiZWZvcmUuXCIpKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0d2hpbGUgKHRtcFt0bXAubGVuZ3RoIC0gMV0gIT09IHRvKSB7XG5cdFx0XHRcdHRtcC5wb3AoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0bXAucG9wKClcblx0XHR9XG5cblx0XHR0aGlzLnBhZ2VTdGFja1N0cmVhbSh0bXApXG5cdFx0dGhpcy5jdXJyZW50UGFnZVN0cmVhbSh0bXBbdG1wLmxlbmd0aCAtIDFdKVxuXHR9XG5cblx0cHJpdmF0ZSByZWFkb25seSBuYXZpZ2F0ZVRvUGFnZSA9ICh0YXJnZXQ6IFRQYWdlcykgPT4ge1xuXHRcdGlmICh0aGlzLmlzQW5pbWF0aW5nKCkpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGNvbnN0IHRtcCA9IHRoaXMucGFnZVN0YWNrU3RyZWFtKClcblx0XHR0bXAucHVzaCh0YXJnZXQpXG5cblx0XHR0aGlzLmN1cnJlbnRQYWdlU3RyZWFtKHRhcmdldClcblx0XHR0aGlzLnBhZ2VTdGFja1N0cmVhbSh0bXApXG5cdH1cblxuXHQvKipcblx0ICogUHJlcGFyZXMgZGlhbG9nIGF0dHJpYnV0ZXMgYW5kIGJ1aWxkcyBhIE1lZGl1bURpYWxvZyByZXR1cm5pbmcgaXQgdG8gdGhlIGNhbGxlclxuXHQgKiBAcGFyYW0gcmVuZGVyQ29udGVudFxuXHQgKiBAcGFyYW0gZ2V0TGVmdEFjdGlvblxuXHQgKiBAcGFyYW0gZ2V0UGFnZVRpdGxlXG5cdCAqIEBwYXJhbSBnZXRSaWdodEFjdGlvblxuXHQgKi9cblx0YnVpbGREaWFsb2cocmVuZGVyQ29udGVudDogQ29udGVudFJlbmRlcmVyPFRQYWdlcz4sIHsgZ2V0TGVmdEFjdGlvbiwgZ2V0UGFnZVRpdGxlLCBnZXRSaWdodEFjdGlvbiB9OiBEaWFsb2dIZWFkZXJPcHRpb25zPFRQYWdlcz4pOiBEaWFsb2cge1xuXHRcdGNvbnN0IGRpYWxvZzogRGlhbG9nID0gRGlhbG9nLmVkaXRNZWRpdW1EaWFsb2coXG5cdFx0XHR7XG5cdFx0XHRcdGxlZnQ6ICgpID0+IFtnZXRMZWZ0QWN0aW9uPy4odGhpcy5jdXJyZW50UGFnZVN0cmVhbSgpLCBkaWFsb2csIHRoaXMubmF2aWdhdGVUb1BhZ2UsIHRoaXMuZ29CYWNrKV0uZmlsdGVyKChpdGVtKTogaXRlbSBpcyBCdXR0b25BdHRycyA9PiAhIWl0ZW0pLFxuXHRcdFx0XHRtaWRkbGU6IGdldFBhZ2VUaXRsZSh0aGlzLmN1cnJlbnRQYWdlU3RyZWFtKCkpLFxuXHRcdFx0XHRyaWdodDogKCkgPT5cblx0XHRcdFx0XHRbZ2V0UmlnaHRBY3Rpb24/Lih0aGlzLmN1cnJlbnRQYWdlU3RyZWFtKCksIGRpYWxvZywgdGhpcy5uYXZpZ2F0ZVRvUGFnZSwgdGhpcy5nb0JhY2spXS5maWx0ZXIoKGl0ZW0pOiBpdGVtIGlzIEJ1dHRvbkF0dHJzID0+ICEhaXRlbSksXG5cdFx0XHR9LFxuXHRcdFx0TXVsdGlQYWdlRGlhbG9nVmlld1dyYXBwZXI8VFBhZ2VzPixcblx0XHRcdHtcblx0XHRcdFx0Y3VycmVudFBhZ2VTdHJlYW06IHRoaXMuY3VycmVudFBhZ2VTdHJlYW0sXG5cdFx0XHRcdHJlbmRlckNvbnRlbnQ6IChwYWdlOiBzdHJlYW08VFBhZ2VzPikgPT4gcmVuZGVyQ29udGVudChwYWdlKCksIGRpYWxvZywgdGhpcy5uYXZpZ2F0ZVRvUGFnZSwgdGhpcy5nb0JhY2spLFxuXHRcdFx0XHRzdGFja1N0cmVhbTogdGhpcy5wYWdlU3RhY2tTdHJlYW0sXG5cdFx0XHRcdGlzQW5pbWF0aW5nOiB0aGlzLmlzQW5pbWF0aW5nLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0aGVpZ2h0OiBcIjEwMCVcIixcblx0XHRcdFx0XCJiYWNrZ3JvdW5kLWNvbG9yXCI6IHRoZW1lLm5hdmlnYXRpb25fYmcsXG5cdFx0XHR9LFxuXHRcdClcblxuXHRcdGlmIChjbGllbnQuaXNNb2JpbGVEZXZpY2UoKSkge1xuXHRcdFx0Ly8gUHJldmVudCBmb2N1c2luZyB0ZXh0IGZpZWxkIGF1dG9tYXRpY2FsbHkgb24gbW9iaWxlLiBJdCBvcGVucyBrZXlib2FyZCwgYW5kIHlvdSBkb24ndCBzZWUgYWxsIGRldGFpbHMuXG5cdFx0XHRkaWFsb2cuc2V0Rm9jdXNPbkxvYWRGdW5jdGlvbihub09wKVxuXHRcdH1cblxuXHRcdHJldHVybiBkaWFsb2dcblx0fVxufVxuXG50eXBlIFByb3BzPFRQYWdlcz4gPSB7XG5cdGN1cnJlbnRQYWdlU3RyZWFtOiBzdHJlYW08VFBhZ2VzPlxuXHRyZW5kZXJDb250ZW50OiAoY3VycmVudFBhZ2U6IHN0cmVhbTxUUGFnZXM+KSA9PiBDaGlsZHJlblxuXHRzdGFja1N0cmVhbTogc3RyZWFtPFRQYWdlc1tdPlxuXHRpc0FuaW1hdGluZzogc3RyZWFtPGJvb2xlYW4+XG59XG5cbmVudW0gU2xpZGVEaXJlY3Rpb24ge1xuXHRMRUZULFxuXHRSSUdIVCxcbn1cblxuY2xhc3MgTXVsdGlQYWdlRGlhbG9nVmlld1dyYXBwZXI8VFBhZ2VzPiBpbXBsZW1lbnRzIENvbXBvbmVudDxQcm9wczxUUGFnZXM+PiB7XG5cdHByaXZhdGUgcmVhZG9ubHkgdHJhbnNpdGlvblBhZ2U6IHN0cmVhbTxUUGFnZXMgfCBudWxsPiA9IHN0cmVhbShudWxsKVxuXHRwcml2YXRlIGRpYWxvZ0hlaWdodDogbnVtYmVyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBwYWdlV2lkdGg6IG51bWJlciA9IC0xXG5cdHByaXZhdGUgdHJhbnNsYXRlID0gMFxuXHRwcml2YXRlIHBhZ2VzV3JhcHBlckRvbUVsZW1lbnQhOiBIVE1MRWxlbWVudFxuXHQvLyBXZSBjYW4gYXNzdW1lIHRoZSBzdGFjayBzaXplIGlzIG9uZSBiZWNhdXNlIHdlIGFscmVhZHkgZW5mb3JjZSBoYXZpbmcgYSByb290IHBhZ2Ugd2hlbiBpbml0aWFsaXppbmcgTXVsdGlQYWdlRGlhbG9nXG5cdHByaXZhdGUgc3RhY2tTaXplID0gMVxuXHRwcml2YXRlIHNsaWRlRGlyZWN0aW9uOiBTbGlkZURpcmVjdGlvbiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuXHRwcml2YXRlIHRyYW5zaXRpb25DbGFzcyA9IFwiXCJcblxuXHRjb25zdHJ1Y3Rvcih2bm9kZTogVm5vZGU8UHJvcHM8VFBhZ2VzPj4pIHtcblx0XHR2bm9kZS5hdHRycy5zdGFja1N0cmVhbS5tYXAoKG5ld1N0YWNrOiBUUGFnZXNbXSkgPT4ge1xuXHRcdFx0Y29uc3QgbmV3U3RhY2tMZW5ndGggPSBuZXdTdGFjay5sZW5ndGhcblx0XHRcdGlmIChuZXdTdGFja0xlbmd0aCA8IHRoaXMuc3RhY2tTaXplICYmIG5ld1N0YWNrLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5zbGlkZURpcmVjdGlvbiA9IFNsaWRlRGlyZWN0aW9uLkxFRlRcblx0XHRcdFx0dGhpcy5nb0JhY2sodm5vZGUpXG5cdFx0XHRcdHRoaXMuc3RhY2tTaXplID0gbmV3U3RhY2tMZW5ndGhcblx0XHRcdH0gZWxzZSBpZiAobmV3U3RhY2tMZW5ndGggPiB0aGlzLnN0YWNrU2l6ZSkge1xuXHRcdFx0XHR0aGlzLnNsaWRlRGlyZWN0aW9uID0gU2xpZGVEaXJlY3Rpb24uUklHSFRcblx0XHRcdFx0dGhpcy5zdGFja1NpemUgPSBuZXdTdGFja0xlbmd0aFxuXHRcdFx0XHR0aGlzLnRyYW5zaXRpb25Ubyh2bm9kZSwgbmV3U3RhY2tbbmV3U3RhY2tMZW5ndGggLSAxXSlcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZWFkb25seSByZXNpemVMaXN0ZW5lcjogd2luZG93U2l6ZUxpc3RlbmVyID0gKCkgPT4ge1xuXHRcdHRoaXMuc2V0UGFnZVdpZHRoKHRoaXMucGFnZXNXcmFwcGVyRG9tRWxlbWVudClcblx0XHRtLnJlZHJhdygpXG5cdH1cblxuXHRwcml2YXRlIHNldFBhZ2VXaWR0aChkb206IEhUTUxFbGVtZW50KSB7XG5cdFx0Y29uc3QgcGFyZW50RWxlbWVudCA9IGRvbS5wYXJlbnRFbGVtZW50XG5cdFx0aWYgKHBhcmVudEVsZW1lbnQpIHtcblx0XHRcdHRoaXMucGFnZVdpZHRoID0gZG9tLnBhcmVudEVsZW1lbnQuY2xpZW50V2lkdGggLSBzaXplLmhwYWRfbGFyZ2UgKiAyXG5cdFx0fVxuXHRcdC8vIFR3aWNlIHRoZSBwYWdlIHdpZHRoIHBsdXMgdGhlIGdhcCBiZXR3ZWVuIHBhZ2VzICg2NHB4KVxuXHRcdGRvbS5zdHlsZS53aWR0aCA9IHB4KHRoaXMucGFnZVdpZHRoICogMiArIHNpemUudnBhZF94eGwpXG5cdH1cblxuXHRvbnJlbW92ZSh2bm9kZTogVm5vZGVET008UHJvcHM8VFBhZ2VzPj4pIHtcblx0XHR3aW5kb3dGYWNhZGUucmVtb3ZlUmVzaXplTGlzdGVuZXIodGhpcy5yZXNpemVMaXN0ZW5lcilcblx0XHR2bm9kZS5hdHRycy5jdXJyZW50UGFnZVN0cmVhbS5lbmQodHJ1ZSlcblx0fVxuXG5cdG9uY3JlYXRlKHZub2RlOiBWbm9kZURPTTxQcm9wczxUUGFnZXM+Pik6IHZvaWQge1xuXHRcdHRoaXMucGFnZXNXcmFwcGVyRG9tRWxlbWVudCA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXG5cdFx0dm5vZGUuZG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJ0cmFuc2l0aW9uZW5kXCIsICgpID0+IHtcblx0XHRcdHRoaXMudHJhbnNpdGlvbkNsYXNzID0gXCJcIlxuXHRcdFx0dm5vZGUuYXR0cnMuaXNBbmltYXRpbmcoZmFsc2UpXG5cdFx0XHR0aGlzLnRyYW5zaXRpb25QYWdlKG51bGwpXG5cdFx0XHR0aGlzLnRyYW5zbGF0ZSA9IDBcblx0XHRcdG0ucmVkcmF3KClcblx0XHR9KVxuXG5cdFx0d2luZG93RmFjYWRlLmFkZFJlc2l6ZUxpc3RlbmVyKHRoaXMucmVzaXplTGlzdGVuZXIpXG5cdH1cblxuXHRvbnVwZGF0ZSh2bm9kZTogVm5vZGVET008UHJvcHM8VFBhZ2VzPj4pOiBhbnkge1xuXHRcdGNvbnN0IGRvbSA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXHRcdGlmICh0aGlzLmRpYWxvZ0hlaWdodCA9PSBudWxsICYmIGRvbS5wYXJlbnRFbGVtZW50KSB7XG5cdFx0XHR0aGlzLmRpYWxvZ0hlaWdodCA9IGRvbS5wYXJlbnRFbGVtZW50LmNsaWVudEhlaWdodFxuXHRcdFx0Oyh2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmhlaWdodCA9IHB4KHRoaXMuZGlhbG9nSGVpZ2h0KVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnBhZ2VXaWR0aCA9PSAtMSAmJiBkb20ucGFyZW50RWxlbWVudCkge1xuXHRcdFx0dGhpcy5zZXRQYWdlV2lkdGgoZG9tKVxuXHRcdFx0bS5yZWRyYXcoKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgd3JhcChjaGlsZHJlbjogQ2hpbGRyZW4pIHtcblx0XHRyZXR1cm4gbShcIlwiLCB7IHN0eWxlOiB7IHdpZHRoOiBweCh0aGlzLnBhZ2VXaWR0aCkgfSB9LCBjaGlsZHJlbilcblx0fVxuXG5cdHByaXZhdGUgZ2V0RmlsbGVyUGFnZShjdXJyZW50UGFnZTogVFBhZ2VzLCBzdGFjazogVFBhZ2VzW10pOiBzdHJlYW08VFBhZ2VzPiB7XG5cdFx0Y29uc3QgcGFnZSA9IHRoaXMuc2xpZGVEaXJlY3Rpb24gPT0gU2xpZGVEaXJlY3Rpb24uUklHSFQgPyBzdGFja1tzdGFjay5sZW5ndGggLSAyXSA6IHRoaXMudHJhbnNpdGlvblBhZ2UoKVxuXHRcdHJldHVybiBzdHJlYW0ocGFnZSA/PyBjdXJyZW50UGFnZSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUGFnZSh2bm9kZTogVm5vZGU8UHJvcHM8VFBhZ2VzPj4pIHtcblx0XHRjb25zdCB1cGRhdGVkU3RhY2tTaXplID0gdm5vZGUuYXR0cnMuc3RhY2tTdHJlYW0oKS5sZW5ndGhcblxuXHRcdGNvbnN0IGZpbGxlclBhZ2VTdHJlYW0gPSB0aGlzLmdldEZpbGxlclBhZ2Uodm5vZGUuYXR0cnMuY3VycmVudFBhZ2VTdHJlYW0oKSwgdm5vZGUuYXR0cnMuc3RhY2tTdHJlYW0oKSlcblxuXHRcdGNvbnN0IHBhZ2VzID0gW3RoaXMud3JhcCh2bm9kZS5hdHRycy5yZW5kZXJDb250ZW50KGZpbGxlclBhZ2VTdHJlYW0pKSwgdGhpcy53cmFwKHZub2RlLmF0dHJzLnJlbmRlckNvbnRlbnQodm5vZGUuYXR0cnMuY3VycmVudFBhZ2VTdHJlYW0pKV1cblxuXHRcdGNvbnN0IGlzT25Sb290UGFnZSA9IHRoaXMudHJhbnNpdGlvblBhZ2UoKSA9PSBudWxsICYmIHVwZGF0ZWRTdGFja1NpemUgPj0gMlxuXG5cdFx0aWYgKHZub2RlLmF0dHJzLmlzQW5pbWF0aW5nKCkgJiYgIWlzT25Sb290UGFnZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc2xpZGVEaXJlY3Rpb24gPT09IFNsaWRlRGlyZWN0aW9uLlJJR0hUID8gcGFnZXMgOiBwYWdlcy5yZXZlcnNlKClcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5zbGlkZURpcmVjdGlvbiA9PT0gU2xpZGVEaXJlY3Rpb24uUklHSFQgPyBwYWdlcy5yZXZlcnNlKCkgOiBwYWdlc1xuXHR9XG5cblx0cHJpdmF0ZSBnb0JhY2sodm5vZGU6IFZub2RlPFByb3BzPFRQYWdlcz4+KSB7XG5cdFx0dGhpcy50cnlTY3JvbGxUb1RvcCgpXG5cblx0XHRjb25zdCB0YXJnZXQgPSB2bm9kZS5hdHRycy5jdXJyZW50UGFnZVN0cmVhbSgpXG5cdFx0dGhpcy50cmFuc2xhdGUgPSAtKHRoaXMucGFnZVdpZHRoICsgc2l6ZS52cGFkX3h4bClcblx0XHRtLnJlZHJhdy5zeW5jKClcblxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG5cdFx0XHR2bm9kZS5hdHRycy5pc0FuaW1hdGluZyh0cnVlKVxuXHRcdFx0dGhpcy50cmFuc2l0aW9uUGFnZSh0YXJnZXQpXG5cdFx0XHR0aGlzLnRyYW5zaXRpb25DbGFzcyA9IFwidHJhbnNpdGlvbi10cmFuc2Zvcm1cIlxuXHRcdFx0dGhpcy50cmFuc2xhdGUgPSAwXG5cdFx0fSlcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmVzIHRoZSBwYXJlbnQgZWxlbWVudCBvZiB0aGUgcGFnZXMgd3JhcHBlciAod2hpY2ggc2hvdWxkIGJlIHRoZSBkaWFsb2cpIGFuZCBzZXRzIHRoZSBgc2Nyb2xsVG9wYCB0byBgMGAuXG5cdCAqIElmIHRoZSBwYXJlbnQgZWxlbWVudCBpcyBub3QgZm91bmQgb3IgZG9lcyBub3QgaW5jbHVkZSB0aGUgYHNjcm9sbGAgQ1NTIGNsYXNzLCBub3RoaW5nIHdpbGwgaGFwcGVuLlxuXHQgKi9cblx0cHJpdmF0ZSB0cnlTY3JvbGxUb1RvcCgpIHtcblx0XHRjb25zdCBwYXJlbnRFbGVtZW50ID0gdGhpcy5wYWdlc1dyYXBwZXJEb21FbGVtZW50LnBhcmVudEVsZW1lbnRcblxuXHRcdGlmIChwYXJlbnRFbGVtZW50Py5jbGFzc0xpc3QuY29udGFpbnMoXCJzY3JvbGxcIikpIHtcblx0XHRcdHBhcmVudEVsZW1lbnQuc2Nyb2xsVG9wID0gMFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgdHJhbnNpdGlvblRvKHZub2RlOiBWbm9kZTxQcm9wczxUUGFnZXM+PiwgdGFyZ2V0OiBUUGFnZXMpIHtcblx0XHR0aGlzLnRyeVNjcm9sbFRvVG9wKClcblxuXHRcdHRoaXMudHJhbnNsYXRlID0gMFxuXHRcdG0ucmVkcmF3LnN5bmMoKVxuXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcblx0XHRcdHZub2RlLmF0dHJzLmlzQW5pbWF0aW5nKHRydWUpXG5cdFx0XHR0aGlzLnRyYW5zaXRpb25QYWdlKHRhcmdldClcblx0XHRcdHRoaXMudHJhbnNpdGlvbkNsYXNzID0gXCJ0cmFuc2l0aW9uLXRyYW5zZm9ybVwiXG5cdFx0XHR0aGlzLnRyYW5zbGF0ZSA9IC0odGhpcy5wYWdlV2lkdGggKyBzaXplLnZwYWRfeHhsKVxuXHRcdH0pXG5cdH1cblxuXHR2aWV3KHZub2RlOiBWbm9kZTxQcm9wczxUUGFnZXM+Pik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguZ2FwLXZwYWQteHhsLmZpdC1jb250ZW50XCIsXG5cdFx0XHR7XG5cdFx0XHRcdGNsYXNzOiB0aGlzLnRyYW5zaXRpb25DbGFzcyxcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHR0cmFuc2Zvcm06IGB0cmFuc2xhdGVYKCR7dGhpcy50cmFuc2xhdGV9cHgpYCxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHR0aGlzLnJlbmRlclBhZ2Uodm5vZGUpLFxuXHRcdClcblx0fVxufVxuIiwiaW1wb3J0IHsgVGh1bmsgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgU2VjdGlvbkJ1dHRvbiB9IGZyb20gXCIuLi9ndWkvYmFzZS9idXR0b25zL1NlY3Rpb25CdXR0b24uanNcIlxuXG5leHBvcnQgdHlwZSBQcm9wcyA9IHtcblx0b25DbGljazogVGh1bmtcbn1cblxuZXhwb3J0IGNsYXNzIE5vU29sdXRpb25TZWN0aW9uQnV0dG9uIGltcGxlbWVudHMgQ29tcG9uZW50PFByb3BzPiB7XG5cdHZpZXcoeyBhdHRyczogeyBvbkNsaWNrIH0gfTogVm5vZGU8UHJvcHM+KTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFNlY3Rpb25CdXR0b24sIHtcblx0XHRcdHRleHQ6IFwib3RoZXJfbGFiZWxcIixcblx0XHRcdG9uY2xpY2s6IG9uQ2xpY2ssXG5cdFx0fSlcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgU2VjdGlvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9idXR0b25zL1NlY3Rpb25CdXR0b24uanNcIlxuaW1wb3J0IHsgZ2V0TG9jYWxpc2VkQ2F0ZWdvcnlOYW1lLCBTdXBwb3J0RGlhbG9nU3RhdGUgfSBmcm9tIFwiLi4vU3VwcG9ydERpYWxvZy5qc1wiXG5pbXBvcnQgeyBUaHVuayB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgTm9Tb2x1dGlvblNlY3Rpb25CdXR0b24gfSBmcm9tIFwiLi4vTm9Tb2x1dGlvblNlY3Rpb25CdXR0b24uanNcIlxuaW1wb3J0IHsgcHggfSBmcm9tIFwiLi4vLi4vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9DYXJkLmpzXCJcbmltcG9ydCB7IEFsbEljb25zLCBJY29uLCBJY29uU2l6ZSB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uLy4uL2d1aS90aGVtZS5qc1wiXG5cbnR5cGUgUHJvcHMgPSB7XG5cdGRhdGE6IFN1cHBvcnREaWFsb2dTdGF0ZVxuXHR0b0NhdGVnb3J5RGV0YWlsOiBUaHVua1xuXHRnb1RvQ29udGFjdFN1cHBvcnQ6IFRodW5rXG59XG5cbmV4cG9ydCBjbGFzcyBTdXBwb3J0TGFuZGluZ1BhZ2UgaW1wbGVtZW50cyBDb21wb25lbnQ8UHJvcHM+IHtcblx0dmlldyh7XG5cdFx0YXR0cnM6IHtcblx0XHRcdGRhdGE6IHsgY2F0ZWdvcmllcywgc2VsZWN0ZWRDYXRlZ29yeSB9LFxuXHRcdFx0Z29Ub0NvbnRhY3RTdXBwb3J0LFxuXHRcdFx0dG9DYXRlZ29yeURldGFpbCxcblx0XHR9LFxuXHR9OiBWbm9kZTxQcm9wcz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgZGVmYXVsdEhlaWdodCA9IDY2NlxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIucHQucGJcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRoZWlnaHQ6IHB4KGRlZmF1bHRIZWlnaHQpLFxuXHRcdFx0XHRcdC8vIGhlaWdodDogcHgoc3R5bGVzLmJvZHlIZWlnaHQgPiBkZWZhdWx0SGVpZ2h0ID8gZGVmYXVsdEhlaWdodCA6IHN0eWxlcy5ib2R5SGVpZ2h0KSxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRtKFxuXHRcdFx0XHRDYXJkLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2xhc3NlczogW10sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCJcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRwYWRkaW5nOiBcIjAuNWVtXCIsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFwiLmNlbnRlclwiLFxuXHRcdFx0XHRcdFx0bShJY29uLCB7XG5cdFx0XHRcdFx0XHRcdGljb246IEljb25zLlNwZWVjaEJ1YmJsZU91dGxpbmUsXG5cdFx0XHRcdFx0XHRcdHNpemU6IEljb25TaXplLlhYTCxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0bShcIi5jZW50ZXIuaDRcIiwgbGFuZy5nZXQoXCJzdXBwb3J0U3RhcnRQYWdlX3RpdGxlXCIpKSxcblx0XHRcdFx0XHRtKFwiLmNlbnRlclwiLCBsYW5nLmdldChcInN1cHBvcnRTdGFydFBhZ2VfbXNnXCIpKSxcblx0XHRcdFx0KSxcblx0XHRcdCksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5wYi5wdC5mbGV4LmNvbC5nYXAtdnBhZC5maXQtaGVpZ2h0LmJveC1jb250ZW50XCIsXG5cdFx0XHRcdGNhdGVnb3JpZXMubWFwKChjYXRlZ29yeSkgPT5cblx0XHRcdFx0XHRtKFNlY3Rpb25CdXR0b24sIHtcblx0XHRcdFx0XHRcdGxlZnRJY29uOiB7IGljb246IGNhdGVnb3J5Lmljb24gYXMgQWxsSWNvbnMsIHRpdGxlOiBcImNsb3NlX2FsdFwiLCBmaWxsOiB0aGVtZS5jb250ZW50X2FjY2VudCB9LFxuXHRcdFx0XHRcdFx0dGV4dDogeyB0ZXh0OiBnZXRMb2NhbGlzZWRDYXRlZ29yeU5hbWUoY2F0ZWdvcnksIGxhbmcubGFuZ3VhZ2VUYWcpLCB0ZXN0SWQ6IFwiXCIgfSxcblx0XHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRDYXRlZ29yeShjYXRlZ29yeSlcblx0XHRcdFx0XHRcdFx0dG9DYXRlZ29yeURldGFpbCgpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKE5vU29sdXRpb25TZWN0aW9uQnV0dG9uLCB7XG5cdFx0XHRcdFx0b25DbGljazogZ29Ub0NvbnRhY3RTdXBwb3J0LFxuXHRcdFx0XHR9KSxcblx0XHRcdCksXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IFNlY3Rpb25CdXR0b24gfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvYnV0dG9ucy9TZWN0aW9uQnV0dG9uLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBnZXRMb2NhbGlzZWRDYXRlZ29yeUludHJvZHVjdGlvbiwgZ2V0TG9jYWxpc2VkQ2F0ZWdvcnlOYW1lLCBnZXRMb2NhbGlzZWRUb3BpY0lzc3VlLCBTdXBwb3J0RGlhbG9nU3RhdGUgfSBmcm9tIFwiLi4vU3VwcG9ydERpYWxvZy5qc1wiXG5pbXBvcnQgeyBUaHVuayB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgTm9Tb2x1dGlvblNlY3Rpb25CdXR0b24gfSBmcm9tIFwiLi4vTm9Tb2x1dGlvblNlY3Rpb25CdXR0b24uanNcIlxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9DYXJkLmpzXCJcbmltcG9ydCB7IHB4LCBzaXplIH0gZnJvbSBcIi4uLy4uL2d1aS9zaXplLmpzXCJcblxudHlwZSBQcm9wcyA9IHtcblx0ZGF0YTogU3VwcG9ydERpYWxvZ1N0YXRlXG5cdGdvVG9Db250YWN0U3VwcG9ydDogVGh1bmtcblx0Z29Ub1RvcGljRGV0YWlsUGFnZTogVGh1bmtcbn1cblxuZXhwb3J0IGNsYXNzIFN1cHBvcnRDYXRlZ29yeVBhZ2UgaW1wbGVtZW50cyBDb21wb25lbnQ8UHJvcHM+IHtcblx0dmlldyh7XG5cdFx0YXR0cnM6IHtcblx0XHRcdGRhdGE6IHsgc2VsZWN0ZWRDYXRlZ29yeSwgc2VsZWN0ZWRUb3BpYyB9LFxuXHRcdFx0Z29Ub1RvcGljRGV0YWlsUGFnZSxcblx0XHRcdGdvVG9Db250YWN0U3VwcG9ydCxcblx0XHR9LFxuXHR9OiBWbm9kZTxQcm9wcz4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgbGFuZ3VhZ2VUYWcgPSBsYW5nLmxhbmd1YWdlVGFnXG5cdFx0Y29uc3QgY3VycmVudGx5U2VsZWN0ZWRDYXRlZ29yeSA9IHNlbGVjdGVkQ2F0ZWdvcnkoKVxuXHRcdHJldHVybiBtKFwiLnB0LnBiXCIsIFtcblx0XHRcdG0oQ2FyZCwgeyBzaG91bGREaXZpZGU6IHRydWUgfSwgW1xuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwic2VjdGlvbi5wdC1zLnBiLXNcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRwYWRkaW5nOiBweChzaXplLnZwYWRfc21hbGwpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdG0oXCIuaDQubWItMFwiLCBnZXRMb2NhbGlzZWRDYXRlZ29yeU5hbWUoc2VsZWN0ZWRDYXRlZ29yeSgpISwgbGFuZ3VhZ2VUYWcpKSxcblx0XHRcdFx0XHRcdG0oXCJwLm10LXhzLm1iLXNcIiwgZ2V0TG9jYWxpc2VkQ2F0ZWdvcnlJbnRyb2R1Y3Rpb24oY3VycmVudGx5U2VsZWN0ZWRDYXRlZ29yeSEsIGxhbmd1YWdlVGFnKSksXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0KSxcblx0XHRcdFx0Y3VycmVudGx5U2VsZWN0ZWRDYXRlZ29yeSEudG9waWNzLm1hcCgodG9waWMpID0+XG5cdFx0XHRcdFx0bShTZWN0aW9uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHR0ZXh0OiB7IHRleHQ6IGdldExvY2FsaXNlZFRvcGljSXNzdWUodG9waWMsIGxhbmd1YWdlVGFnKSwgdGVzdElkOiBcIlwiIH0sXG5cdFx0XHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkVG9waWModG9waWMpXG5cdFx0XHRcdFx0XHRcdGdvVG9Ub3BpY0RldGFpbFBhZ2UoKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0KSxcblx0XHRcdFx0bShOb1NvbHV0aW9uU2VjdGlvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdG9uQ2xpY2s6ICgpID0+IGdvVG9Db250YWN0U3VwcG9ydCgpLFxuXHRcdFx0XHR9KSxcblx0XHRcdF0pLFxuXHRcdF0pXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi8uLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGh0bWxTYW5pdGl6ZXIgfSBmcm9tIFwiLi4vLi4vbWlzYy9IdG1sU2FuaXRpemVyLmpzXCJcbmltcG9ydCB7IGNvbnZlcnRUZXh0VG9IdG1sIH0gZnJvbSBcIi4uLy4uL21pc2MvRm9ybWF0dGVyLmpzXCJcbmltcG9ydCB7IGdldExvY2FsaXNlZFRvcGljSXNzdWUsIFN1cHBvcnREaWFsb2dTdGF0ZSB9IGZyb20gXCIuLi9TdXBwb3J0RGlhbG9nLmpzXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9EaWFsb2cuanNcIlxuaW1wb3J0IHsgVGh1bmsgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IENhcmQgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvQ2FyZC5qc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi8uLi9ndWkvdGhlbWUuanNcIlxuaW1wb3J0IHsgU2VjdGlvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9idXR0b25zL1NlY3Rpb25CdXR0b24uanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvaWNvbnMvSWNvbnMuanNcIlxuXG50eXBlIFByb3BzID0ge1xuXHRkYXRhOiBTdXBwb3J0RGlhbG9nU3RhdGVcblx0ZGlhbG9nOiBEaWFsb2dcblx0Z29Ub0NvbnRhY3RTdXBwb3J0UGFnZTogVGh1bmtcblx0Z29Ub1NvbHV0aW9uV2FzSGVscGZ1bFBhZ2U6IFRodW5rXG59XG5cbmV4cG9ydCBjbGFzcyBTdXBwb3J0VG9waWNQYWdlIGltcGxlbWVudHMgQ29tcG9uZW50PFByb3BzPiB7XG5cdHZpZXcoeyBhdHRyczogeyBkYXRhLCBnb1RvQ29udGFjdFN1cHBvcnRQYWdlLCBnb1RvU29sdXRpb25XYXNIZWxwZnVsUGFnZSB9IH06IFZub2RlPFByb3BzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB0b3BpYyA9IGRhdGEuc2VsZWN0ZWRUb3BpYygpXG5cdFx0aWYgKHRvcGljID09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGNvbnN0IGxhbmd1YWdlVGFnID0gbGFuZy5sYW5ndWFnZVRhZ1xuXHRcdGNvbnN0IHNvbHV0aW9uID0gbGFuZ3VhZ2VUYWcuaW5jbHVkZXMoXCJkZVwiKSA/IHRvcGljLnNvbHV0aW9uSHRtbERFIDogdG9waWMuc29sdXRpb25IdG1sRU5cblx0XHRjb25zdCBzYW5pdGlzZWRTb2x1dGlvbiA9IGh0bWxTYW5pdGl6ZXIuc2FuaXRpemVIVE1MKGNvbnZlcnRUZXh0VG9IdG1sKHNvbHV0aW9uKSwge1xuXHRcdFx0YmxvY2tFeHRlcm5hbENvbnRlbnQ6IHRydWUsXG5cdFx0fSkuaHRtbFxuXHRcdGNvbnN0IGlzc3VlID0gZ2V0TG9jYWxpc2VkVG9waWNJc3N1ZSh0b3BpYywgbGFuZ3VhZ2VUYWcpXG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5mbGV4LmZsZXgtY29sdW1uLnB0LnBiXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XCJvdmVyZmxvdy14XCI6IFwiYXV0b1wiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRjbGFzczogXCJoZWlnaHQtMTAwcFwiLFxuXHRcdFx0fSxcblx0XHRcdFtcblx0XHRcdFx0bShcblx0XHRcdFx0XHRDYXJkLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJvb3RFbGVtZW50VHlwZTogXCJkaXZcIixcblx0XHRcdFx0XHRcdGNsYXNzZXM6IFtcInNjcm9sbFwiLCBcIm1iXCJdLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bShcIi5oNC5tLTAucGJcIiwgaXNzdWUpLFxuXHRcdFx0XHRcdG0udHJ1c3Qoc2FuaXRpc2VkU29sdXRpb24pLFxuXHRcdFx0XHQpLFxuXHRcdFx0XSxcblx0XHRcdG0oV2FzVGhpc0hlbHBmdWwsIHsgZ29Ub0NvbnRhY3RTdXBwb3J0UGFnZSwgZ29Ub1NvbHV0aW9uV2FzSGVscGZ1bFBhZ2UgfSksXG5cdFx0KVxuXHR9XG59XG5cbmludGVyZmFjZSBXYXNUaGlzSGVscGZ1bEF0dHJzIHtcblx0Z29Ub0NvbnRhY3RTdXBwb3J0UGFnZTogVm9pZEZ1bmN0aW9uXG5cdGdvVG9Tb2x1dGlvbldhc0hlbHBmdWxQYWdlOiBWb2lkRnVuY3Rpb25cbn1cblxuY2xhc3MgV2FzVGhpc0hlbHBmdWwgaW1wbGVtZW50cyBDb21wb25lbnQ8V2FzVGhpc0hlbHBmdWxBdHRycz4ge1xuXHR2aWV3KHsgYXR0cnM6IHsgZ29Ub0NvbnRhY3RTdXBwb3J0UGFnZSwgZ29Ub1NvbHV0aW9uV2FzSGVscGZ1bFBhZ2UgfSB9OiBWbm9kZTxXYXNUaGlzSGVscGZ1bEF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLmZsZXguZmxleC1jb2x1bW4uZ2FwLXZwYWQtc1wiLFxuXHRcdFx0bShcInNtYWxsLnVwcGVyY2FzZS5iLnRleHQtZWxsaXBzaXNcIiwgeyBzdHlsZTogeyBjb2xvcjogdGhlbWUubmF2aWdhdGlvbl9idXR0b24gfSB9LCBsYW5nLmdldChcIndhc1RoaXNIZWxwZnVsX21zZ1wiKSksXG5cdFx0XHRtKENhcmQsIHsgc2hvdWxkRGl2aWRlOiB0cnVlIH0sIFtcblx0XHRcdFx0bShTZWN0aW9uQnV0dG9uLCB7XG5cdFx0XHRcdFx0dGV4dDogXCJ5ZXNfbGFiZWxcIixcblx0XHRcdFx0XHRvbmNsaWNrOiBnb1RvU29sdXRpb25XYXNIZWxwZnVsUGFnZSxcblx0XHRcdFx0XHRyaWdodEljb246IHsgaWNvbjogSWNvbnMuQ2hlY2ttYXJrLCB0aXRsZTogXCJ5ZXNfbGFiZWxcIiB9LFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bShTZWN0aW9uQnV0dG9uLCB7XG5cdFx0XHRcdFx0dGV4dDogXCJub19sYWJlbFwiLFxuXHRcdFx0XHRcdG9uY2xpY2s6IGdvVG9Db250YWN0U3VwcG9ydFBhZ2UsXG5cdFx0XHRcdH0pLFxuXHRcdFx0XSksXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGdldExvY2FsaXNlZENhdGVnb3J5TmFtZSwgZ2V0TG9jYWxpc2VkVG9waWNJc3N1ZSwgU3VwcG9ydERpYWxvZ1N0YXRlIH0gZnJvbSBcIi4uL1N1cHBvcnREaWFsb2cuanNcIlxuaW1wb3J0IHsgY2xpZW50SW5mb1N0cmluZywgZ2V0TG9nQXR0YWNobWVudHMgfSBmcm9tIFwiLi4vLi4vbWlzYy9FcnJvclJlcG9ydGVyLmpzXCJcbmltcG9ydCB7IERhdGFGaWxlIH0gZnJvbSBcIi4uLy4uL2FwaS9jb21tb24vRGF0YUZpbGUuanNcIlxuaW1wb3J0IHsgVGh1bmsgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vLi4vYXBpL21haW4vQ29tbW9uTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9DYXJkLmpzXCJcbmltcG9ydCB7IExvZ2luQnV0dG9uIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL2J1dHRvbnMvTG9naW5CdXR0b24uanNcIlxuaW1wb3J0IHsgaHRtbFNhbml0aXplciB9IGZyb20gXCIuLi8uLi9taXNjL0h0bWxTYW5pdGl6ZXIuanNcIlxuaW1wb3J0IHsgTWFpbE1ldGhvZCwgUGxhblR5cGVUb05hbWUgfSBmcm9tIFwiLi4vLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBTZW5kTWFpbE1vZGVsIH0gZnJvbSBcIi4uLy4uL21haWxGdW5jdGlvbmFsaXR5L1NlbmRNYWlsTW9kZWwuanNcIlxuaW1wb3J0IHsgY29udmVydFRleHRUb0h0bWwgfSBmcm9tIFwiLi4vLi4vbWlzYy9Gb3JtYXR0ZXIuanNcIlxuaW1wb3J0IHsgc2hvd1Byb2dyZXNzRGlhbG9nIH0gZnJvbSBcIi4uLy4uL2d1aS9kaWFsb2dzL1Byb2dyZXNzRGlhbG9nLmpzXCJcbmltcG9ydCB7IFN3aXRjaCB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9Td2l0Y2guanNcIlxuaW1wb3J0IHsgU2VjdGlvbkJ1dHRvbiB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9idXR0b25zL1NlY3Rpb25CdXR0b24uanNcIlxuaW1wb3J0IHsgSWNvbnMgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvaWNvbnMvSWNvbnMuanNcIlxuaW1wb3J0IHsgSWNvbiwgSWNvblNpemUgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvSWNvbi5qc1wiXG5pbXBvcnQgeyBCYXNlQnV0dG9uIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL2J1dHRvbnMvQmFzZUJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBCdXR0b25Db2xvciwgZ2V0Q29sb3JzIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBweCwgc2l6ZSB9IGZyb20gXCIuLi8uLi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBjaG9vc2VBbmRBdHRhY2hGaWxlIH0gZnJvbSBcIi4uLy4uLy4uL21haWwtYXBwL21haWwvZWRpdG9yL01haWxFZGl0b3JWaWV3TW9kZWwuanNcIlxuXG5leHBvcnQgdHlwZSBQcm9wcyA9IHtcblx0ZGF0YTogU3VwcG9ydERpYWxvZ1N0YXRlXG5cdGdvVG9TdWNjZXNzUGFnZTogVGh1bmtcbn1cblxuZXhwb3J0IGNsYXNzIENvbnRhY3RTdXBwb3J0UGFnZSBpbXBsZW1lbnRzIENvbXBvbmVudDxQcm9wcz4ge1xuXHRwcml2YXRlIHNlbmRNYWlsTW9kZWw6IFNlbmRNYWlsTW9kZWwgfCB1bmRlZmluZWRcblxuXHRvbmluaXQoeyBhdHRyczogeyBkYXRhIH0gfTogVm5vZGU8UHJvcHM+KSB7XG5cdFx0dGhpcy5jb2xsZWN0TG9ncygpLnRoZW4oKGxvZ3MpID0+IHtcblx0XHRcdGRhdGEubG9ncyhsb2dzKVxuXHRcdFx0bS5yZWRyYXcoKVxuXHRcdH0pXG5cdH1cblxuXHRhc3luYyBvbmNyZWF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLnNlbmRNYWlsTW9kZWwgPSBhd2FpdCBjcmVhdGVTZW5kTWFpbE1vZGVsKClcblx0XHRhd2FpdCB0aGlzLnNlbmRNYWlsTW9kZWwuaW5pdFdpdGhUZW1wbGF0ZShcblx0XHRcdHtcblx0XHRcdFx0dG86IFtcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRuYW1lOiBudWxsLFxuXHRcdFx0XHRcdFx0YWRkcmVzczogXCJoZWxwZGVza0B0dXRhby5kZVwiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHR9LFxuXHRcdFx0XCJcIixcblx0XHRcdFwiXCIsXG5cdFx0XHRbXSxcblx0XHRcdGZhbHNlLFxuXHRcdClcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBzdWJqZWN0IG9mIHRoZSBzdXBwb3J0IHJlcXVlc3QgY29uc2lkZXJpbmcgdGhlIHVzZXJzIGN1cnJlbnQgcGxhbiBhbmQgdGhlIHBhdGggdGhleSB0b29rIHRvIGdldCB0byB0aGUgY29udGFjdCBmb3JtLlxuXHQgKiBBcHBlbmRzIHRoZSBjYXRlZ29yeSBhbmQgdG9waWMgaWYgcHJlc2VudC5cblx0ICpcblx0ICogKipFeGFtcGxlIG91dHB1dDogYFN1cHBvcnQgUmVxdWVzdCAtIFVubGltaXRlZCAtIEFjY291bnQ6IEkgY2Fubm90IGxvZ2luLmAqKlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBnZXRTdWJqZWN0KGRhdGE6IFN1cHBvcnREaWFsb2dTdGF0ZSkge1xuXHRcdGNvbnN0IE1BWF9JU1NVRV9MRU5HVEggPSA2MFxuXHRcdGxldCBzdWJqZWN0ID0gYFN1cHBvcnQgUmVxdWVzdCAoJHtQbGFuVHlwZVRvTmFtZVthd2FpdCBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmdldFBsYW5UeXBlKCldfSlgXG5cblx0XHRjb25zdCBzZWxlY3RlZENhdGVnb3J5ID0gZGF0YS5zZWxlY3RlZENhdGVnb3J5KClcblx0XHRjb25zdCBzZWxlY3RlZFRvcGljID0gZGF0YS5zZWxlY3RlZFRvcGljKClcblxuXHRcdGlmIChzZWxlY3RlZENhdGVnb3J5ICE9IG51bGwgJiYgc2VsZWN0ZWRUb3BpYyAhPSBudWxsKSB7XG5cdFx0XHRjb25zdCBsb2NhbGl6ZWRUb3BpYyA9IGdldExvY2FsaXNlZFRvcGljSXNzdWUoc2VsZWN0ZWRUb3BpYywgbGFuZy5sYW5ndWFnZVRhZylcblx0XHRcdGNvbnN0IGlzc3VlID0gbG9jYWxpemVkVG9waWMubGVuZ3RoID4gTUFYX0lTU1VFX0xFTkdUSCA/IGxvY2FsaXplZFRvcGljLnN1YnN0cmluZygwLCBNQVhfSVNTVUVfTEVOR1RIKSArIFwiLi4uXCIgOiBsb2NhbGl6ZWRUb3BpY1xuXHRcdFx0c3ViamVjdCArPSBgIC0gJHtnZXRMb2NhbGlzZWRDYXRlZ29yeU5hbWUoc2VsZWN0ZWRDYXRlZ29yeSwgbGFuZy5sYW5ndWFnZVRhZyl9OiAke2lzc3VlfWBcblx0XHR9XG5cblx0XHRpZiAoc2VsZWN0ZWRDYXRlZ29yeSAhPSBudWxsICYmIHNlbGVjdGVkVG9waWMgPT0gbnVsbCkge1xuXHRcdFx0c3ViamVjdCArPSBgIC0gJHtnZXRMb2NhbGlzZWRDYXRlZ29yeU5hbWUoc2VsZWN0ZWRDYXRlZ29yeSwgbGFuZy5sYW5ndWFnZVRhZyl9YFxuXHRcdH1cblxuXHRcdHJldHVybiBzdWJqZWN0XG5cdH1cblxuXHR2aWV3KHsgYXR0cnM6IHsgZGF0YSwgZ29Ub1N1Y2Nlc3NQYWdlIH0gfTogVm5vZGU8UHJvcHM+KTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIuZmxleC5mbGV4LWNvbHVtbi5wdC5oZWlnaHQtMTAwcC5nYXAtdnBhZFwiLFxuXHRcdFx0bShDYXJkLCBtKFwiXCIsIG0oXCJwLmg0Lm0tMFwiLCBsYW5nLmdldChcInN1cHBvcnRGb3JtX3RpdGxlXCIpKSwgbShcInAubS0wLm10LXNcIiwgbGFuZy5nZXQoXCJzdXBwb3J0Rm9ybV9tc2dcIikpKSksXG5cdFx0XHRtKFxuXHRcdFx0XHRDYXJkLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2xhc3NlczogW1wiY2hpbGQtdGV4dC1lZGl0b3JcIiwgXCJyZWxcIiwgXCJoZWlnaHQtMTAwcFwiXSxcblx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0cGFkZGluZzogXCIwXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bShkYXRhLmh0bWxFZGl0b3IpLFxuXHRcdFx0KSxcblxuXHRcdFx0bShcblx0XHRcdFx0XCIuZmxleC5mbGV4LWNvbHVtbi5nYXAtdnBhZC5wYlwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdG1hcmdpblRvcDogXCJhdXRvXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bShcblx0XHRcdFx0XHRDYXJkLFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNob3VsZERpdmlkZTogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdG0oU2VjdGlvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHR0ZXh0OiBcImF0dGFjaEZpbGVzX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRyaWdodEljb246IHsgaWNvbjogSWNvbnMuQXR0YWNobWVudCwgdGl0bGU6IFwiYXR0YWNoRmlsZXNfYWN0aW9uXCIgfSxcblx0XHRcdFx0XHRcdFx0b25jbGljazogYXN5bmMgKF8sIGRvbSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGNob29zZUFuZEF0dGFjaEZpbGUodGhpcy5zZW5kTWFpbE1vZGVsISwgZG9tLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuXHRcdFx0XHRcdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0KHRoaXMuc2VuZE1haWxNb2RlbD8uZ2V0QXR0YWNobWVudHMoKSA/PyBbXSkubWFwKChhdHRhY2htZW50KSA9PlxuXHRcdFx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XHRcdFwiLmZsZXguY2VudGVyLXZlcnRpY2FsbHkuZmxleC1zcGFjZS1iZXR3ZWVuLnBiLXMucHQtc1wiLFxuXHRcdFx0XHRcdFx0XHRcdHsgc3R5bGU6IHsgcGFkZGluZ0lubGluZTogcHgoc2l6ZS52cGFkX3NtYWxsKSB9IH0sXG5cdFx0XHRcdFx0XHRcdFx0bShcInNwYW4uc21hbGxlclwiLCBhdHRhY2htZW50Lm5hbWUpLFxuXHRcdFx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFx0XHRCYXNlQnV0dG9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJyZW1vdmVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnNlbmRNYWlsTW9kZWw/LnJlbW92ZUF0dGFjaG1lbnQoYXR0YWNobWVudClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtLnJlZHJhdygpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNsYXNzOiBcImZsZXgganVzdGlmeS1iZXR3ZWVuIGZsYXNoXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0bShJY29uLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLlRyYXNoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZpbGw6IGdldENvbG9ycyhCdXR0b25Db2xvci5Db250ZW50KS5idXR0b24sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGFkZGluZ0lubGluZTogcHgoKHNpemUuaWNvbl9zaXplX2xhcmdlIC0gc2l6ZS5pY29uX3NpemVfbWVkaXVtKSAvIDIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogbGFuZy5nZXQoXCJyZW1vdmVfYWN0aW9uXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzaXplOiBJY29uU2l6ZS5Ob3JtYWwsXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRdLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdENhcmQsXG5cdFx0XHRcdFx0bShcIi5mbGV4LmdhcC12cGFkLXMuaXRlbXMtY2VudGVyXCIsIFtcblx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFN3aXRjaCxcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNoZWNrZWQ6IGRhdGEuc2hvdWxkSW5jbHVkZUxvZ3MoKSxcblx0XHRcdFx0XHRcdFx0XHRvbmNsaWNrOiAoY2hlY2tlZCkgPT4gZGF0YS5zaG91bGRJbmNsdWRlTG9ncyhjaGVja2VkKSxcblx0XHRcdFx0XHRcdFx0XHRhcmlhTGFiZWw6IGxhbmcuZ2V0KFwic2VuZExvZ3NfYWN0aW9uXCIpLFxuXHRcdFx0XHRcdFx0XHRcdHZhcmlhbnQ6IFwiZXhwYW5kZWRcIixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0bGFuZy5nZXQoXCJzZW5kTG9nc19hY3Rpb25cIiksXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdF0pLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLmFsaWduLXNlbGYtY2VudGVyLmZ1bGwtd2lkdGhcIixcblx0XHRcdFx0XHRtKExvZ2luQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJzZW5kX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0b25jbGljazogYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRpZiAoIXRoaXMuc2VuZE1haWxNb2RlbCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IGRhdGEuaHRtbEVkaXRvci5nZXRWYWx1ZSgpXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG1haWxCb2R5ID0gZGF0YS5zaG91bGRJbmNsdWRlTG9ncygpID8gYCR7bWVzc2FnZX0ke2NsaWVudEluZm9TdHJpbmcobmV3IERhdGUoKSwgdHJ1ZSkubWVzc2FnZX1gIDogbWVzc2FnZVxuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNhbml0aXNlZEJvZHkgPSBodG1sU2FuaXRpemVyLnNhbml0aXplSFRNTChjb252ZXJ0VGV4dFRvSHRtbChtYWlsQm9keSksIHtcblx0XHRcdFx0XHRcdFx0XHRibG9ja0V4dGVybmFsQ29udGVudDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0fSkuaHRtbFxuXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2VuZE1haWxNb2RlbC5zZXRCb2R5KHNhbml0aXNlZEJvZHkpXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2VuZE1haWxNb2RlbC5zZXRTdWJqZWN0KGF3YWl0IHRoaXMuZ2V0U3ViamVjdChkYXRhKSlcblxuXHRcdFx0XHRcdFx0XHRpZiAoZGF0YS5zaG91bGRJbmNsdWRlTG9ncygpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5zZW5kTWFpbE1vZGVsLmF0dGFjaEZpbGVzKGRhdGEubG9ncygpKVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5zZW5kTWFpbE1vZGVsLnNlbmQoTWFpbE1ldGhvZC5OT05FLCAoKSA9PiBQcm9taXNlLnJlc29sdmUodHJ1ZSksIHNob3dQcm9ncmVzc0RpYWxvZylcblxuXHRcdFx0XHRcdFx0XHRnb1RvU3VjY2Vzc1BhZ2UoKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0KSxcblx0XHRcdCksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjb2xsZWN0TG9ncygpOiBQcm9taXNlPERhdGFGaWxlW10+IHtcblx0XHRyZXR1cm4gYXdhaXQgZ2V0TG9nQXR0YWNobWVudHMobmV3IERhdGUoKSlcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVTZW5kTWFpbE1vZGVsKCk6IFByb21pc2U8U2VuZE1haWxNb2RlbD4ge1xuXHRjb25zdCBtYWlsYm94RGV0YWlscyA9IGF3YWl0IGxvY2F0b3IubWFpbGJveE1vZGVsLmdldFVzZXJNYWlsYm94RGV0YWlscygpXG5cdGNvbnN0IG1haWxib3hQcm9wZXJ0aWVzID0gYXdhaXQgbG9jYXRvci5tYWlsYm94TW9kZWwuZ2V0TWFpbGJveFByb3BlcnRpZXMobWFpbGJveERldGFpbHMubWFpbGJveEdyb3VwUm9vdClcblx0cmV0dXJuIGF3YWl0IGxvY2F0b3Iuc2VuZE1haWxNb2RlbChtYWlsYm94RGV0YWlscywgbWFpbGJveFByb3BlcnRpZXMpXG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50IH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi8uLi9ndWkvYmFzZS9DYXJkLmpzXCJcbmltcG9ydCB7IFNlY3Rpb25CdXR0b24gfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvYnV0dG9ucy9TZWN0aW9uQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJsdWVza3lMb2dvLCBJY29ucywgTWFzdG9kb25Mb2dvIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IHdpbmRvd0ZhY2FkZSB9IGZyb20gXCIuLi8uLi9taXNjL1dpbmRvd0ZhY2FkZS5qc1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uLy4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuXG5leHBvcnQgY2xhc3MgU3VwcG9ydFN1Y2Nlc3NQYWdlIGltcGxlbWVudHMgQ29tcG9uZW50IHtcblx0dmlldygpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5wdC5wYlwiLFxuXHRcdFx0bShcblx0XHRcdFx0Q2FyZCxcblx0XHRcdFx0eyBzaG91bGREaXZpZGU6IHRydWUgfSxcblx0XHRcdFx0bShcblx0XHRcdFx0XHRcIi5wbHJcIixcblx0XHRcdFx0XHRtKFwiLmg0LnBiLXMucHQtc1wiLCBsYW5nLmdldChcInN1cHBvcnRTdWNjZXNzX21zZ1wiKSksXG5cdFx0XHRcdFx0bShcInAubS0wXCIsIGxhbmcuZ2V0KFwic3VwcG9ydFNvY2lhbHNJbmZvX21zZ1wiKSksXG5cdFx0XHRcdFx0bShcblx0XHRcdFx0XHRcdFwiLm10LWwubWItc1wiLFxuXHRcdFx0XHRcdFx0e30sXG5cdFx0XHRcdFx0XHRtKFwiaW1nLmJsb2NrLmZ1bGwtd2lkdGguaGVpZ2h0LTEwMHBcIiwge1xuXHRcdFx0XHRcdFx0XHRzcmM6IGAke3dpbmRvdy50dXRhby5hcHBTdGF0ZS5wcmVmaXhXaXRob3V0RmlsZX0vaW1hZ2VzL2xlYXZpbmctd2l6YXJkL3Byb2JsZW0ucG5nYCxcblx0XHRcdFx0XHRcdFx0YWx0OiBcIlwiLFxuXHRcdFx0XHRcdFx0XHRyZWw6IFwibm9yZWZlcnJlclwiLFxuXHRcdFx0XHRcdFx0XHRsb2FkaW5nOiBcImxhenlcIixcblx0XHRcdFx0XHRcdFx0ZGVjb2Rpbmc6IFwiYXN5bmNcIixcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdCksXG5cdFx0XHRcdG0oU2VjdGlvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRleHQ6IHsgdGV4dDogXCJUdXRhIEJsb2dcIiwgdGVzdElkOiBcIlwiIH0sXG5cdFx0XHRcdFx0aW5qZWN0aW9uTGVmdDogbShcImltZ1wiLCB7XG5cdFx0XHRcdFx0XHRzcmM6IGAke3dpbmRvdy50dXRhby5hcHBTdGF0ZS5wcmVmaXhXaXRob3V0RmlsZX0vaW1hZ2VzL2xvZ28tZmF2aWNvbi0xNTIucG5nYCxcblx0XHRcdFx0XHRcdGFsdDogXCJUdXRhLmNvbSBsb2dvXCIsXG5cdFx0XHRcdFx0XHRyZWw6IFwibm9yZWZlcnJlclwiLFxuXHRcdFx0XHRcdFx0bG9hZGluZzogXCJsYXp5XCIsXG5cdFx0XHRcdFx0XHRkZWNvZGluZzogXCJhc3luY1wiLFxuXHRcdFx0XHRcdFx0c3R5bGU6IHsgd2lkdGg6IFwiMjBweFwiLCBoZWlnaHQ6IFwiMjBweFwiLCBwYWRkaW5nOiBcIjJweFwiIH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0cmlnaHRJY29uOiB7IGljb246IEljb25zLk9wZW4sIHRpdGxlOiBcImNsb3NlX2FsdFwiIH0sXG5cdFx0XHRcdFx0b25jbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0d2luZG93RmFjYWRlLm9wZW5MaW5rKFwiaHR0cHM6Ly90dXRhLmNvbS9ibG9nXCIpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSksXG5cdFx0XHRcdG0oU2VjdGlvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRleHQ6IHsgdGV4dDogXCJNYXN0b2RvblwiLCB0ZXN0SWQ6IFwiXCIgfSxcblx0XHRcdFx0XHRyaWdodEljb246IHsgaWNvbjogSWNvbnMuT3BlbiwgdGl0bGU6IFwib3Blbl9hY3Rpb25cIiB9LFxuXHRcdFx0XHRcdGluamVjdGlvbkxlZnQ6IG0oXG5cdFx0XHRcdFx0XHRcIi5cIixcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHR3aWR0aDogXCIyNHB4XCIsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBcIjI0cHhcIixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRtLnRydXN0KE1hc3RvZG9uTG9nbyksXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHR3aW5kb3dGYWNhZGUub3BlbkxpbmsoXCJodHRwczovL21hc3RvZG9uLnNvY2lhbC9AVHV0YW5vdGFcIilcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0bShTZWN0aW9uQnV0dG9uLCB7XG5cdFx0XHRcdFx0dGV4dDogeyB0ZXh0OiBcIkJsdWVTa3lcIiwgdGVzdElkOiBcIlwiIH0sXG5cdFx0XHRcdFx0aW5qZWN0aW9uTGVmdDogbShcblx0XHRcdFx0XHRcdFwiLlwiLFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBcIjI0cHhcIixcblx0XHRcdFx0XHRcdFx0XHRoZWlnaHQ6IFwiMjRweFwiLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG0udHJ1c3QoQmx1ZXNreUxvZ28pLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0cmlnaHRJY29uOiB7IGljb246IEljb25zLk9wZW4sIHRpdGxlOiBcIm9wZW5fYWN0aW9uXCIgfSxcblx0XHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHR3aW5kb3dGYWNhZGUub3BlbkxpbmsoXCJodHRwczovL2Jza3kuYXBwL3Byb2ZpbGUvdHV0YXByaXZhY3kuYnNreS5zb2NpYWxcIilcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdCksXG5cdFx0KVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL2ljb25zL0ljb25zLmpzXCJcbmltcG9ydCB7IEJhc2VCdXR0b24gfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvYnV0dG9ucy9CYXNlQnV0dG9uLmpzXCJcbmltcG9ydCB7IHNob3dVcGdyYWRlRGlhbG9nIH0gZnJvbSBcIi4uLy4uL2d1aS9uYXYvTmF2RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7IENhcmQgfSBmcm9tIFwiLi4vLi4vZ3VpL2Jhc2UvQ2FyZC5qc1wiXG5pbXBvcnQgeyBTZWN0aW9uQnV0dG9uIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL2J1dHRvbnMvU2VjdGlvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyB3aW5kb3dGYWNhZGUgfSBmcm9tIFwiLi4vLi4vbWlzYy9XaW5kb3dGYWNhZGUuanNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi8uLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IFN1cHBvcnREaWFsb2dTdGF0ZSB9IGZyb20gXCIuLi9TdXBwb3J0RGlhbG9nLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5cbnR5cGUgRW1haWxTdXBwb3J0VW5hdmFpbGFibGVBdHRycyA9IHtcblx0ZGF0YTogU3VwcG9ydERpYWxvZ1N0YXRlXG5cdGdvVG9Db250YWN0U3VwcG9ydFBhZ2U6ICgpID0+IHZvaWRcbn1cblxuZXhwb3J0IGNsYXNzIEVtYWlsU3VwcG9ydFVuYXZhaWxhYmxlUGFnZSBpbXBsZW1lbnRzIENvbXBvbmVudDxFbWFpbFN1cHBvcnRVbmF2YWlsYWJsZUF0dHJzPiB7XG5cdHZpZXcoeyBhdHRyczogeyBkYXRhLCBnb1RvQ29udGFjdFN1cHBvcnRQYWdlIH0gfTogVm5vZGU8RW1haWxTdXBwb3J0VW5hdmFpbGFibGVBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5wdC5wYlwiLFxuXHRcdFx0bShcblx0XHRcdFx0Q2FyZCxcblx0XHRcdFx0eyBzaG91bGREaXZpZGU6IHRydWUgfSxcblx0XHRcdFx0bShcImRpdi5wdC1zLnBiLXMucGxyXCIsIFtcblx0XHRcdFx0XHRtKFwiLmg0Lm10LXhzXCIsIGxhbmcuZ2V0KFwic3VwcG9ydE5vRGlyZWN0U3VwcG9ydF90aXRsZVwiKSksXG5cdFx0XHRcdFx0bShcInBcIiwgbGFuZy5nZXQoXCJzdXBwb3J0Tm9EaXJlY3RTdXBwb3J0X21zZ1wiKSksXG5cdFx0XHRcdFx0bShcImltZy5ibG9ja1wiLCB7XG5cdFx0XHRcdFx0XHRzcmM6IGAke3dpbmRvdy50dXRhby5hcHBTdGF0ZS5wcmVmaXhXaXRob3V0RmlsZX0vaW1hZ2VzL2xlYXZpbmctd2l6YXJkL2FjY291bnQucG5nYCxcblx0XHRcdFx0XHRcdGFsdDogXCJcIixcblx0XHRcdFx0XHRcdHJlbDogXCJub3JlZmVycmVyXCIsXG5cdFx0XHRcdFx0XHRsb2FkaW5nOiBcImxhenlcIixcblx0XHRcdFx0XHRcdGRlY29kaW5nOiBcImFzeW5jXCIsXG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRtYXJnaW46IFwiMCBhdXRvXCIsXG5cdFx0XHRcdFx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRtKFNlY3Rpb25CdXR0b24sIHtcblx0XHRcdFx0XHR0ZXh0OiB7IHRleHQ6IFwiVHV0YSBGQVFcIiwgdGVzdElkOiBcIlwiIH0sXG5cdFx0XHRcdFx0aW5qZWN0aW9uTGVmdDogbShcImltZ1wiLCB7XG5cdFx0XHRcdFx0XHRzcmM6IGAke3dpbmRvdy50dXRhby5hcHBTdGF0ZS5wcmVmaXhXaXRob3V0RmlsZX0vaW1hZ2VzL2xvZ28tZmF2aWNvbi0xNTIucG5nYCxcblx0XHRcdFx0XHRcdGFsdDogXCJUdXRhLmNvbSBsb2dvXCIsXG5cdFx0XHRcdFx0XHRyZWw6IFwibm9yZWZlcnJlclwiLFxuXHRcdFx0XHRcdFx0bG9hZGluZzogXCJsYXp5XCIsXG5cdFx0XHRcdFx0XHRkZWNvZGluZzogXCJhc3luY1wiLFxuXHRcdFx0XHRcdFx0c3R5bGU6IHsgd2lkdGg6IFwiMjBweFwiLCBoZWlnaHQ6IFwiMjBweFwiLCBwYWRkaW5nOiBcIjJweFwiIH0sXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0cmlnaHRJY29uOiB7IGljb246IEljb25zLk9wZW4sIHRpdGxlOiBcImNsb3NlX2FsdFwiIH0sXG5cdFx0XHRcdFx0b25jbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0d2luZG93RmFjYWRlLm9wZW5MaW5rKFwiaHR0cHM6Ly90dXRhLmNvbS9zdXBwb3J0XCIpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSksXG5cdFx0XHQpLFxuXHRcdFx0bShcblx0XHRcdFx0XCIubXQtbC5jZW50ZXJcIixcblx0XHRcdFx0bShCYXNlQnV0dG9uLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwidXBncmFkZV9hY3Rpb25cIixcblx0XHRcdFx0XHR0ZXh0OiBsYW5nLmdldChcInVwZ3JhZGVfYWN0aW9uXCIpLFxuXHRcdFx0XHRcdGNsYXNzOiBgYnV0dG9uLWNvbnRlbnQgYm9yZGVyLXJhZGl1cyBhY2NlbnQtYmcgY2VudGVyIHBsci1idXR0b24gZmxhc2ggZnVsbC13aWR0aGAsXG5cdFx0XHRcdFx0b25jbGljazogYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0YXdhaXQgc2hvd1VwZ3JhZGVEaWFsb2coKVxuXG5cdFx0XHRcdFx0XHRjb25zdCBpc1BhaWRQbGFuTm93ID0gIWxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkuaXNGcmVlQWNjb3VudCgpXG5cblx0XHRcdFx0XHRcdGlmIChpc1BhaWRQbGFuTm93KSB7XG5cdFx0XHRcdFx0XHRcdGRhdGEuY2FuSGF2ZUVtYWlsU3VwcG9ydCA9IHRydWVcblx0XHRcdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Z29Ub0NvbnRhY3RTdXBwb3J0UGFnZSgpXG5cdFx0XHRcdFx0XHRcdH0sIDEwMDApXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHQpXG5cdH1cbn1cbiIsImV4cG9ydCBlbnVtIFN1cHBvcnRWaXNpYmlsaXR5TWFzayB7XG5cdERlc2t0b3BPcldlYkFwcCA9IDEgPDwgMCwgLy8gMVxuXHRUdXRhTWFpbE1vYmlsZSA9IDEgPDwgMSwgLy8gMlxuXHRUdXRhQ2FsZW5kYXJNb2JpbGUgPSAxIDw8IDIsIC8vIDRcblx0RnJlZVVzZXJzID0gMSA8PCAzLCAvLyA4XG5cdFBhaWRVc2VycyA9IDEgPDwgNCwgLy8gMTZcbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBDYXJkIH0gZnJvbSBcIi4uLy4uL2d1aS9iYXNlL0NhcmQuanNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi8uLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcblxuZXhwb3J0IGNsYXNzIFN1cHBvcnRSZXF1ZXN0U2VudFBhZ2UgaW1wbGVtZW50cyBDb21wb25lbnQge1xuXHR2aWV3KCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiLnB0LnBiXCIsXG5cdFx0XHRtKFxuXHRcdFx0XHRDYXJkLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFx0bShcIi5oNC5jZW50ZXIucGItcy5wdC1zXCIsIGxhbmcuZ2V0KFwic3VwcG9ydFJlcXVlc3RSZWNlaXZlZF90aXRsZVwiKSksXG5cdFx0XHRcdFx0bShcInAuY2VudGVyLm0tMFwiLCBsYW5nLmdldChcInN1cHBvcnRSZXF1ZXN0UmVjZWl2ZWRfbXNnXCIpKSxcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCIubXQtbC5tYi1zXCIsXG5cdFx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRcdG0oXCJpbWcucGIuYmxvY2suZnVsbC13aWR0aC5oZWlnaHQtMTAwcFwiLCB7XG5cdFx0XHRcdFx0XHRcdHNyYzogYCR7d2luZG93LnR1dGFvLmFwcFN0YXRlLnByZWZpeFdpdGhvdXRGaWxlfS9pbWFnZXMvbGVhdmluZy13aXphcmQvb3RoZXIucG5nYCxcblx0XHRcdFx0XHRcdFx0YWx0OiBcIlwiLFxuXHRcdFx0XHRcdFx0XHRyZWw6IFwibm9yZWZlcnJlclwiLFxuXHRcdFx0XHRcdFx0XHRsb2FkaW5nOiBcImxhenlcIixcblx0XHRcdFx0XHRcdFx0ZGVjb2Rpbmc6IFwiYXN5bmNcIixcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdCksXG5cdFx0XHQpLFxuXHRcdClcblx0fVxufVxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgYXNzZXJ0TWFpbk9yTm9kZSwgaXNXZWJDbGllbnQgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgTG9naW5Db250cm9sbGVyIH0gZnJvbSBcIi4uL2FwaS9tYWluL0xvZ2luQ29udHJvbGxlci5qc1wiXG5pbXBvcnQgU3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBTdXBwb3J0Q2F0ZWdvcnksIFN1cHBvcnREYXRhVHlwZVJlZiwgU3VwcG9ydFRvcGljIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBNdWx0aVBhZ2VEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2RpYWxvZ3MvTXVsdGlQYWdlRGlhbG9nLmpzXCJcbmltcG9ydCB7IFN1cHBvcnRMYW5kaW5nUGFnZSB9IGZyb20gXCIuL3BhZ2VzL1N1cHBvcnRMYW5kaW5nUGFnZS5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3IuanNcIlxuaW1wb3J0IHsgU3VwcG9ydENhdGVnb3J5UGFnZSB9IGZyb20gXCIuL3BhZ2VzL1N1cHBvcnRDYXRlZ29yeVBhZ2UuanNcIlxuaW1wb3J0IHsgU3VwcG9ydFRvcGljUGFnZSB9IGZyb20gXCIuL3BhZ2VzL1N1cHBvcnRUb3BpY1BhZ2UuanNcIlxuaW1wb3J0IHsgQ29udGFjdFN1cHBvcnRQYWdlIH0gZnJvbSBcIi4vcGFnZXMvQ29udGFjdFN1cHBvcnRQYWdlLmpzXCJcbmltcG9ydCB7IFN1cHBvcnRTdWNjZXNzUGFnZSB9IGZyb20gXCIuL3BhZ2VzL1N1cHBvcnRTdWNjZXNzUGFnZS5qc1wiXG5pbXBvcnQgeyBCdXR0b25UeXBlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBLZXlzIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgSHRtbEVkaXRvciB9IGZyb20gXCIuLi9ndWkvZWRpdG9yL0h0bWxFZGl0b3IuanNcIlxuaW1wb3J0IHsgRGF0YUZpbGUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9EYXRhRmlsZS5qc1wiXG5pbXBvcnQgeyBFbWFpbFN1cHBvcnRVbmF2YWlsYWJsZVBhZ2UgfSBmcm9tIFwiLi9wYWdlcy9FbWFpbFN1cHBvcnRVbmF2YWlsYWJsZVBhZ2UuanNcIlxuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vbWlzYy9DbGllbnREZXRlY3RvclwiXG5pbXBvcnQgeyBTdXBwb3J0VmlzaWJpbGl0eU1hc2sgfSBmcm9tIFwiLi9TdXBwb3J0VmlzaWJpbGl0eU1hc2tcIlxuaW1wb3J0IHsgU3VwcG9ydFJlcXVlc3RTZW50UGFnZSB9IGZyb20gXCIuL3BhZ2VzL1N1cHBvcnRSZXF1ZXN0U2VudFBhZ2UuanNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IENhY2hlTW9kZSB9IGZyb20gXCIuLi9hcGkvd29ya2VyL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgU3VwcG9ydERpYWxvZ1N0YXRlIHtcblx0Y2FuSGF2ZUVtYWlsU3VwcG9ydDogYm9vbGVhblxuXHRzZWxlY3RlZENhdGVnb3J5OiBTdHJlYW08U3VwcG9ydENhdGVnb3J5IHwgbnVsbD5cblx0c2VsZWN0ZWRUb3BpYzogU3RyZWFtPFN1cHBvcnRUb3BpYyB8IG51bGw+XG5cdGNhdGVnb3JpZXM6IFN1cHBvcnRDYXRlZ29yeVtdXG5cdGh0bWxFZGl0b3I6IEh0bWxFZGl0b3Jcblx0c2hvdWxkSW5jbHVkZUxvZ3M6IFN0cmVhbTxib29sZWFuPlxuXHRsb2dzOiBTdHJlYW08RGF0YUZpbGVbXT5cbn1cblxuYXNzZXJ0TWFpbk9yTm9kZSgpXG5cbmVudW0gU3VwcG9ydFBhZ2VzIHtcblx0Q0FURUdPUklFUyxcblx0Q0FURUdPUllfREVUQUlMLFxuXHRUT1BJQ19ERVRBSUwsXG5cdENPTlRBQ1RfU1VQUE9SVCxcblx0U1VQUE9SVF9SRVFVRVNUX1NFTlQsXG5cdEVNQUlMX1NVUFBPUlRfQkVISU5EX1BBWVdBTEwsXG5cdFNPTFVUSU9OX1dBU19IRUxQRlVMLFxufVxuXG5mdW5jdGlvbiBpc0VuYWJsZWQodmlzaWJpbGl0eTogbnVtYmVyLCBtYXNrOiBTdXBwb3J0VmlzaWJpbGl0eU1hc2spIHtcblx0cmV0dXJuICEhKHZpc2liaWxpdHkgJiBtYXNrKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvd1N1cHBvcnREaWFsb2cobG9naW5zOiBMb2dpbkNvbnRyb2xsZXIpIHtcblx0Y29uc3Qgc3VwcG9ydERhdGEgPSBhd2FpdCBsb2NhdG9yLmVudGl0eUNsaWVudC5sb2FkKFN1cHBvcnREYXRhVHlwZVJlZiwgXCItLS0tLS0tLTEtLS1cIiwgeyBjYWNoZU1vZGU6IENhY2hlTW9kZS5Xcml0ZU9ubHkgfSlcblxuXHRjb25zdCBjYXRlZ29yaWVzID0gc3VwcG9ydERhdGEuY2F0ZWdvcmllc1xuXG5cdGZvciAoY29uc3Qga2V5IGluIHN1cHBvcnREYXRhLmNhdGVnb3JpZXMpIHtcblx0XHRjb25zdCBmaWx0ZXJlZFRvcGljczogU3VwcG9ydFRvcGljW10gPSBbXVxuXHRcdGNvbnN0IHN1cHBvcnRDYXRlZ29yeSA9IGNhdGVnb3JpZXNba2V5XVxuXHRcdGZvciAoY29uc3QgdG9waWMgb2Ygc3VwcG9ydENhdGVnb3J5LnRvcGljcykge1xuXHRcdFx0Y29uc3QgdmlzaWJpbGl0eSA9IE51bWJlcih0b3BpYy52aXNpYmlsaXR5KVxuXG5cdFx0XHRjb25zdCBtZWV0c1BsYXRmb3JtID1cblx0XHRcdFx0KGlzRW5hYmxlZCh2aXNpYmlsaXR5LCBTdXBwb3J0VmlzaWJpbGl0eU1hc2suVHV0YUNhbGVuZGFyTW9iaWxlKSAmJiBjbGllbnQuaXNDYWxlbmRhckFwcCgpKSB8fFxuXHRcdFx0XHQoaXNFbmFibGVkKHZpc2liaWxpdHksIFN1cHBvcnRWaXNpYmlsaXR5TWFzay5UdXRhTWFpbE1vYmlsZSkgJiYgY2xpZW50LmlzTWFpbEFwcCgpKSB8fFxuXHRcdFx0XHQoaXNFbmFibGVkKHZpc2liaWxpdHksIFN1cHBvcnRWaXNpYmlsaXR5TWFzay5EZXNrdG9wT3JXZWJBcHApICYmIChjbGllbnQuaXNEZXNrdG9wRGV2aWNlKCkgfHwgaXNXZWJDbGllbnQoKSkpXG5cblx0XHRcdGNvbnN0IGlzRnJlZUFjY291bnQgPSAhbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc1BhaWRBY2NvdW50KClcblx0XHRcdGNvbnN0IG1lZXRzQ3VzdG9tZXJTdGF0dXMgPVxuXHRcdFx0XHQoaXNFbmFibGVkKHZpc2liaWxpdHksIFN1cHBvcnRWaXNpYmlsaXR5TWFzay5GcmVlVXNlcnMpICYmIGlzRnJlZUFjY291bnQpIHx8XG5cdFx0XHRcdChpc0VuYWJsZWQodmlzaWJpbGl0eSwgU3VwcG9ydFZpc2liaWxpdHlNYXNrLlBhaWRVc2VycykgJiYgIWlzRnJlZUFjY291bnQpXG5cblx0XHRcdGlmIChtZWV0c1BsYXRmb3JtICYmIG1lZXRzQ3VzdG9tZXJTdGF0dXMpIHtcblx0XHRcdFx0ZmlsdGVyZWRUb3BpY3MucHVzaCh0b3BpYylcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzdXBwb3J0Q2F0ZWdvcnkudG9waWNzID0gZmlsdGVyZWRUb3BpY3Ncblx0fVxuXG5cdGNvbnN0IGRhdGE6IFN1cHBvcnREaWFsb2dTdGF0ZSA9IHtcblx0XHRjYW5IYXZlRW1haWxTdXBwb3J0OiBsb2dpbnMuaXNJbnRlcm5hbFVzZXJMb2dnZWRJbigpICYmIGxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmlzUGFpZEFjY291bnQoKSxcblx0XHRzZWxlY3RlZENhdGVnb3J5OiBTdHJlYW08U3VwcG9ydENhdGVnb3J5IHwgbnVsbD4obnVsbCksXG5cdFx0c2VsZWN0ZWRUb3BpYzogU3RyZWFtPFN1cHBvcnRUb3BpYyB8IG51bGw+KG51bGwpLFxuXHRcdGNhdGVnb3JpZXM6IHN1cHBvcnREYXRhLmNhdGVnb3JpZXMuZmlsdGVyKChjYXQpID0+IGNhdC50b3BpY3MubGVuZ3RoID4gMCksXG5cdFx0aHRtbEVkaXRvcjogbmV3IEh0bWxFZGl0b3IoKS5zZXRNaW5IZWlnaHQoMjUwKS5zZXRFbmFibGVkKHRydWUpLFxuXHRcdHNob3VsZEluY2x1ZGVMb2dzOiBTdHJlYW0odHJ1ZSksXG5cdFx0bG9nczogU3RyZWFtKFtdKSxcblx0fVxuXG5cdGNvbnN0IG11bHRpUGFnZURpYWxvZzogRGlhbG9nID0gbmV3IE11bHRpUGFnZURpYWxvZzxTdXBwb3J0UGFnZXM+KFN1cHBvcnRQYWdlcy5DQVRFR09SSUVTKVxuXHRcdC5idWlsZERpYWxvZyhcblx0XHRcdChjdXJyZW50UGFnZSwgZGlhbG9nLCBuYXZpZ2F0ZVRvUGFnZSwgXykgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKGN1cnJlbnRQYWdlKSB7XG5cdFx0XHRcdFx0Y2FzZSBTdXBwb3J0UGFnZXMuQ0FURUdPUllfREVUQUlMOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG0oU3VwcG9ydENhdGVnb3J5UGFnZSwge1xuXHRcdFx0XHRcdFx0XHRkYXRhLFxuXHRcdFx0XHRcdFx0XHRnb1RvQ29udGFjdFN1cHBvcnQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoZGF0YS5jYW5IYXZlRW1haWxTdXBwb3J0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuQ09OVEFDVF9TVVBQT1JUKVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuRU1BSUxfU1VQUE9SVF9CRUhJTkRfUEFZV0FMTClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdGdvVG9Ub3BpY0RldGFpbFBhZ2U6ICgpID0+IG5hdmlnYXRlVG9QYWdlKFN1cHBvcnRQYWdlcy5UT1BJQ19ERVRBSUwpLFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5UT1BJQ19ERVRBSUw6XG5cdFx0XHRcdFx0XHRyZXR1cm4gbShTdXBwb3J0VG9waWNQYWdlLCB7XG5cdFx0XHRcdFx0XHRcdGRhdGEsXG5cdFx0XHRcdFx0XHRcdGRpYWxvZyxcblx0XHRcdFx0XHRcdFx0Z29Ub1NvbHV0aW9uV2FzSGVscGZ1bFBhZ2U6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuU09MVVRJT05fV0FTX0hFTFBGVUwpXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdGdvVG9Db250YWN0U3VwcG9ydFBhZ2U6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoZGF0YS5jYW5IYXZlRW1haWxTdXBwb3J0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuQ09OVEFDVF9TVVBQT1JUKVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuRU1BSUxfU1VQUE9SVF9CRUhJTkRfUEFZV0FMTClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdGNhc2UgU3VwcG9ydFBhZ2VzLkNPTlRBQ1RfU1VQUE9SVDpcblx0XHRcdFx0XHRcdHJldHVybiBtKENvbnRhY3RTdXBwb3J0UGFnZSwgeyBkYXRhLCBnb1RvU3VjY2Vzc1BhZ2U6ICgpID0+IG5hdmlnYXRlVG9QYWdlKFN1cHBvcnRQYWdlcy5TVVBQT1JUX1JFUVVFU1RfU0VOVCkgfSlcblx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5TT0xVVElPTl9XQVNfSEVMUEZVTDpcblx0XHRcdFx0XHRcdHJldHVybiBtKFN1cHBvcnRTdWNjZXNzUGFnZSlcblx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5TVVBQT1JUX1JFUVVFU1RfU0VOVDoge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG0oU3VwcG9ydFJlcXVlc3RTZW50UGFnZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSBTdXBwb3J0UGFnZXMuQ0FURUdPUklFUzpcblx0XHRcdFx0XHRcdHJldHVybiBtKFN1cHBvcnRMYW5kaW5nUGFnZSwge1xuXHRcdFx0XHRcdFx0XHRkYXRhLFxuXHRcdFx0XHRcdFx0XHR0b0NhdGVnb3J5RGV0YWlsOiAoKSA9PiBuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuQ0FURUdPUllfREVUQUlMKSxcblx0XHRcdFx0XHRcdFx0Z29Ub0NvbnRhY3RTdXBwb3J0OiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGRhdGEuY2FuSGF2ZUVtYWlsU3VwcG9ydCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bmF2aWdhdGVUb1BhZ2UoU3VwcG9ydFBhZ2VzLkNPTlRBQ1RfU1VQUE9SVClcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0bmF2aWdhdGVUb1BhZ2UoU3VwcG9ydFBhZ2VzLkVNQUlMX1NVUFBPUlRfQkVISU5EX1BBWVdBTEwpXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5FTUFJTF9TVVBQT1JUX0JFSElORF9QQVlXQUxMOlxuXHRcdFx0XHRcdFx0cmV0dXJuIG0oRW1haWxTdXBwb3J0VW5hdmFpbGFibGVQYWdlLCB7XG5cdFx0XHRcdFx0XHRcdGRhdGEsXG5cdFx0XHRcdFx0XHRcdGdvVG9Db250YWN0U3VwcG9ydFBhZ2U6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0ZVRvUGFnZShTdXBwb3J0UGFnZXMuQ09OVEFDVF9TVVBQT1JUKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0Z2V0UGFnZVRpdGxlOiAoXykgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB7IHRlc3RJZDogXCJiYWNrX2FjdGlvblwiLCB0ZXh0OiBsYW5nLmdldChcInN1cHBvcnRNZW51X2xhYmVsXCIpIH1cblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0TGVmdEFjdGlvbjogKGN1cnJlbnRQYWdlLCBkaWFsb2csIG5hdmlnYXRlVG9QYWdlLCBnb0JhY2spID0+IHtcblx0XHRcdFx0XHRzd2l0Y2ggKGN1cnJlbnRQYWdlKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5DQVRFR09SSUVTOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4geyB0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSwgY2xpY2s6ICgpID0+IGRpYWxvZy5jbG9zZSgpLCBsYWJlbDogXCJjbG9zZV9hbHRcIiwgdGl0bGU6IFwiY2xvc2VfYWx0XCIgfVxuXHRcdFx0XHRcdFx0Y2FzZSBTdXBwb3J0UGFnZXMuVE9QSUNfREVUQUlMOlxuXHRcdFx0XHRcdFx0Y2FzZSBTdXBwb3J0UGFnZXMuQ0FURUdPUllfREVUQUlMOlxuXHRcdFx0XHRcdFx0Y2FzZSBTdXBwb3J0UGFnZXMuRU1BSUxfU1VQUE9SVF9CRUhJTkRfUEFZV0FMTDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksIGNsaWNrOiAoKSA9PiBnb0JhY2soKSwgbGFiZWw6IFwiYmFja19hY3Rpb25cIiwgdGl0bGU6IFwiYmFja19hY3Rpb25cIiB9XG5cdFx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5DT05UQUNUX1NVUFBPUlQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHRcdFx0XHRcdFx0Y2xpY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChkYXRhLmh0bWxFZGl0b3IuZ2V0VHJpbW1lZFZhbHVlKCkubGVuZ3RoID4gMTApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgY29uZmlybWVkID0gYXdhaXQgRGlhbG9nLmNvbmZpcm0oe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRlc3RJZDogXCJjbG9zZV9hbHRcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBsYW5nLmdldChcInN1cHBvcnRCYWNrTG9zdFJlcXVlc3RfbXNnXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoY29uZmlybWVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Z29CYWNrKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Z29CYWNrKClcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcImJhY2tfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdFx0dGl0bGU6IFwiYmFja19hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y2FzZSBTdXBwb3J0UGFnZXMuU09MVVRJT05fV0FTX0hFTFBGVUw6XG5cdFx0XHRcdFx0XHRjYXNlIFN1cHBvcnRQYWdlcy5TVVBQT1JUX1JFUVVFU1RfU0VOVDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgdHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksIGNsaWNrOiAoKSA9PiBkaWFsb2cuY2xvc2UoKSwgbGFiZWw6IFwiY2xvc2VfYWx0XCIsIHRpdGxlOiBcImNsb3NlX2FsdFwiIH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldFJpZ2h0QWN0aW9uOiAoY3VycmVudFBhZ2UsIGRpYWxvZywgXywgX18pID0+IHtcblx0XHRcdFx0XHRpZiAoY3VycmVudFBhZ2UgPT09IFN1cHBvcnRQYWdlcy5FTUFJTF9TVVBQT1JUX0JFSElORF9QQVlXQUxMKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiY2xvc2VfYWx0XCIsXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBcImNsb3NlX2FsdFwiLFxuXHRcdFx0XHRcdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGRpYWxvZy5jbG9zZSgpXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHQpXG5cdFx0LmFkZFNob3J0Y3V0KHtcblx0XHRcdGhlbHA6IFwiY2xvc2VfYWx0XCIsXG5cdFx0XHRrZXk6IEtleXMuRVNDLFxuXHRcdFx0ZXhlYzogKCkgPT4gbXVsdGlQYWdlRGlhbG9nLmNsb3NlKCksXG5cdFx0fSlcblx0XHQuc2hvdygpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGlzZWRDYXRlZ29yeU5hbWUoY2F0ZWdvcnk6IFN1cHBvcnRDYXRlZ29yeSwgbGFuZ3VhZ2VUYWc6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiBsYW5ndWFnZVRhZy5pbmNsdWRlcyhcImRlXCIpID8gY2F0ZWdvcnkubmFtZURFIDogY2F0ZWdvcnkubmFtZUVOXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGlzZWRDYXRlZ29yeUludHJvZHVjdGlvbihjYXRlZ29yeTogU3VwcG9ydENhdGVnb3J5LCBsYW5ndWFnZVRhZzogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIGxhbmd1YWdlVGFnLmluY2x1ZGVzKFwiZGVcIikgPyBjYXRlZ29yeS5pbnRyb2R1Y3Rpb25ERSA6IGNhdGVnb3J5LmludHJvZHVjdGlvbkVOXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbGlzZWRUb3BpY0lzc3VlKHRvcGljOiBTdXBwb3J0VG9waWMsIGxhbmd1YWdlVGFnOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gbGFuZ3VhZ2VUYWcuaW5jbHVkZXMoXCJkZVwiKSA/IHRvcGljLmlzc3VlREUgOiB0b3BpYy5pc3N1ZUVOXG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpRWEsa0JBQU4sTUFBOEI7Q0FDcEMsQUFBaUI7Q0FDakIsQUFBaUI7Q0FDakIsQUFBaUIsY0FBK0IsNkJBQU8sTUFBTTtDQUU3RCxZQUFZQSxVQUFrQjtBQUM3QixPQUFLLG9CQUFvQiw2QkFBTyxTQUFTO0FBQ3pDLE9BQUssa0JBQWtCLDZCQUFPLENBQUMsUUFBUyxFQUFDO0NBQ3pDO0NBRUQsQUFBaUIsU0FBUyxDQUFDQyxPQUFnQjtBQUMxQyxNQUFJLEtBQUssYUFBYSxJQUFJLEtBQUssaUJBQWlCLENBQUMsU0FBUyxFQUN6RDtFQUdELE1BQU0sTUFBTSxLQUFLLGlCQUFpQjtBQUNsQyxNQUFJLE9BQU8sV0FBVztBQUNyQixRQUFLLEtBQUssaUJBQWlCLENBQUMsU0FBUyxHQUFHLEVBQUU7QUFDekMsWUFBUSxNQUFNLElBQUksaUJBQWlCLDJEQUEyRDtBQUM5RjtHQUNBO0FBRUQsVUFBTyxJQUFJLElBQUksU0FBUyxPQUFPLEdBQzlCLEtBQUksS0FBSztFQUVWLE1BQ0EsS0FBSSxLQUFLO0FBR1YsT0FBSyxnQkFBZ0IsSUFBSTtBQUN6QixPQUFLLGtCQUFrQixJQUFJLElBQUksU0FBUyxHQUFHO0NBQzNDO0NBRUQsQUFBaUIsaUJBQWlCLENBQUNDLFdBQW1CO0FBQ3JELE1BQUksS0FBSyxhQUFhLENBQ3JCO0VBR0QsTUFBTSxNQUFNLEtBQUssaUJBQWlCO0FBQ2xDLE1BQUksS0FBSyxPQUFPO0FBRWhCLE9BQUssa0JBQWtCLE9BQU87QUFDOUIsT0FBSyxnQkFBZ0IsSUFBSTtDQUN6Qjs7Ozs7Ozs7Q0FTRCxZQUFZQyxlQUF3QyxFQUFFLGVBQWUsY0FBYyxnQkFBNkMsRUFBVTtFQUN6SSxNQUFNQyxTQUFpQixPQUFPLGlCQUM3QjtHQUNDLE1B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
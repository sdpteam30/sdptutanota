import m, { Children } from "mithril"
import { modal, ModalComponent } from "../../../common/gui/base/Modal.js"
import { Keys } from "../../../common/api/common/TutanotaConstants.js"
import type { Shortcut } from "../../../common/misc/KeyManager.js"

const HELP_LINK = "https://tuta.com/faq#phishing" // Tuta "learn more" link

export class MobyPhishInfoModal implements ModalComponent {
	private modalHandle?: ModalComponent

	view(): Children {
		return m(".modal-overlay", { onclick: (e: MouseEvent) => this.backgroundClick(e) }, [
			m(".modal-content", { onclick: (e: MouseEvent) => e.stopPropagation() }, [
				m(".dialog.elevated-bg.border-radius", { style: this.getModalStyle() }, [
					m(
						"p",
						{
							style: {
								fontSize: "16px",
								fontWeight: "bold",
								textAlign: "center",
								marginBottom: "15px",
								color: "black",
							},
						},
						"How Moby Protects You from Phishing",
					),

					m(
						"div",
						{
							style: {
								fontSize: "14px",
								textAlign: "left",
								marginBottom: "20px",
								color: "black",
								lineHeight: "1.6",
							},
						},
						[
							m("p", { style: { marginBottom: "12px" } }, "Phishing emails and websites mimic those from known, legitimate senders."),
							m("p", { style: { marginBottom: "6px" } }, m("strong", "Using Moby:")),
							m("ul", { style: { margin: "0 0 12px 20px", padding: "0" } }, [
								m(
									"li",
									{ style: { marginBottom: "6px" } },
									"Click on Moby when you receive an email or visit a website that appears to be from a known, legitimate sender.",
								),
								m("li", "Moby uses cryptography to verify legitimacy. It disables interactions until you mark the sender or website as known."),
							]),
							m(
								"p",
								{ style: { marginBottom: "0" } },
								"You'll be warned when an email or website only appears legitimate, but is not. With Moby, you are protected from them.",
							),
						],
					),

					m(
						"button",
						{
							onclick: () => this.closeModal(),
							style: { ...this.getCancelButtonStyle(), color: "black" },
						},
						"Close",
					),
				]),
			]),
		])
	}

	private closeModal() {
		if (this.modalHandle) {
			modal.remove(this.modalHandle)
		}
	}

	private getLearnMoreButtonStyle() {
		const baseStyle: any = {
			background: "#850122",
			color: "#ffffff",
			border: "none",
			padding: "12px",
			borderRadius: "8px",
			cursor: "pointer",
			width: "100%",
			fontSize: "14px",
			fontWeight: "bold",
			textAlign: "center",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			marginTop: "10px",
			transition: "opacity 0.2s ease",
		}

		baseStyle.onmouseover = (e: MouseEvent) => ((e.target as HTMLElement).style.opacity = "0.7")
		baseStyle.onmouseout = (e: MouseEvent) => ((e.target as HTMLElement).style.opacity = "1")

		return baseStyle
	}

	private getCancelButtonStyle() {
		return {
			background: "transparent",
			color: "#555",
			border: "1px solid #ccc",
			padding: "12px",
			borderRadius: "8px",
			cursor: "pointer",
			width: "100%",
			fontSize: "14px",
			fontWeight: "normal",
			textAlign: "center",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			marginTop: "10px",
			transition: "background-color 0.2s ease",
			onmouseover: (e: MouseEvent) => ((e.target as HTMLElement).style.backgroundColor = "#f2f2f2"),
			onmouseout: (e: MouseEvent) => ((e.target as HTMLElement).style.backgroundColor = "transparent"),
		}
	}

	private getModalStyle() {
		return {
			position: "fixed",
			top: "50%",
			left: "50%",
			transform: "translate(-50%, -50%)",
			padding: "25px",
			textAlign: "center",
			background: "#fff",
			boxShadow: "0px 5px 15px rgba(0,0,0,0.25)",
			borderRadius: "10px",
			width: "90%",
			maxWidth: "480px",
			display: "flex",
			flexDirection: "column",
			gap: "0px",
		}
	}

	hideAnimation(): Promise<void> {
		return Promise.resolve()
	}

	onClose(): void {}

	backgroundClick(e: MouseEvent): void {
		this.closeModal()
	}

	popState(): boolean {
		this.closeModal()
		return false
	}

	callingElement(): HTMLElement | null {
		return null
	}

	shortcuts(): Shortcut[] {
		return [
			{
				key: Keys.ESC,
				exec: () => {
					this.closeModal()
					return true
				},
				help: "close_alt",
			},
		]
	}

	setModalHandle(handle: ModalComponent) {
		this.modalHandle = handle
	}
}

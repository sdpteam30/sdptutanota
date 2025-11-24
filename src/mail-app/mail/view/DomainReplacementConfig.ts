/**
 * Configuration file for domain replacements
 * This file allows easy management of domain replacement rules
 */

import {
	addDomainReplacement,
	removeDomainReplacement,
	getDomainReplacements,
	addEmailReplacement,
	removeEmailReplacement,
	getEmailReplacements,
} from "./DomainReplacementUtils.js"

/**
 * Initialize domain replacement rules
 * Add your domain replacement rules here
 */
export function initializeDomainReplacements(): void {
	// Clear any existing replacements
	const existingReplacements = getDomainReplacements()
	existingReplacements.forEach((replacement) => {
		removeDomainReplacement(replacement.originalDomain)
	})

	const existingEmailReplacements = getEmailReplacements()
	existingEmailReplacements.forEach((replacement) => {
		removeEmailReplacement(replacement.originalEmail)
	})

	// Add your domain replacement rules here
	// Exact email replacements (take precedence over domain rules)
	addEmailReplacement("citytrust@tuta.com", "citytrust@citytrust.com")
	addEmailReplacement("sky41rl1nes@tuta.com", "cloudjet@cloudjetairways.com")
	addEmailReplacement("el1teh0tel@tuta.com", "meridian@meridiansuites.com")
	addEmailReplacement("citytrust@bskyakhargha1.help", "citytrust@citytrust.com")
	addEmailReplacement("cloudjetairways@bskyakhargha1.help", "cloudjet@cloudjetairways.com")
	addEmailReplacement("meridiansuites@bskyakhargha1.help", "meridian@meridiansuites.com")

	// If you still want domain-wide fallbacks, add them here (optional)
	// addDomainReplacement("tuta.com", "example.com")
}

/**
 * Get all current domain replacement rules
 * @returns Array of domain replacement rules
 */
export function getCurrentDomainReplacements() {
	return getDomainReplacements()
}

/**
 * Add a new domain replacement rule
 * @param originalDomain The domain to replace
 * @param replacementDomain The replacement domain
 */
export function addDomainReplacementRule(originalDomain: string, replacementDomain: string): void {
	addDomainReplacement(originalDomain, replacementDomain)
}

/**
 * Remove a domain replacement rule
 * @param originalDomain The domain to remove from replacements
 */
export function removeDomainReplacementRule(originalDomain: string): void {
	removeDomainReplacement(originalDomain)
}

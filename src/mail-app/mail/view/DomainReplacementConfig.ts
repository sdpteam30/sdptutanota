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
	type DomainReplacement,
	type EmailReplacement,
} from "../model/DomainReplacementUtils.js"

/**
 * Initialize domain replacement rules
 * Add your domain replacement rules here
 */
export function initializeDomainReplacements(): void {
	// Clear any existing replacements
	const existingReplacements = getDomainReplacements()
	existingReplacements.forEach((domainReplacement: DomainReplacement) => {
		removeDomainReplacement(domainReplacement.originalDomain)
	})

	const existingEmailReplacements = getEmailReplacements()
	existingEmailReplacements.forEach((emailReplacement: EmailReplacement) => {
		removeEmailReplacement(emailReplacement.originalEmail)
	})

	// Add your domain replacement rules here
	// Exact email replacements (take precedence over domain rules)
	addEmailReplacement("moby01@tutamail.com", "mobyphish@trincoll.edu")
	//legit emails:
	addEmailReplacement("citytrust@tuta.com", "citytrust@citytrust.com")
	addEmailReplacement("citytrust@bskyakhargha1.help", "citytrust@citytrust.com")
	addEmailReplacement("sky41rl1nes@tuta.com", "cloudjet@cloudjetairways.com")
	addEmailReplacement("cloudjetairways@bskyakhargha1.help", "cloudjet@cloudjetairways.com")
	addEmailReplacement("el1teh0tel@tuta.com", "meridian@meridiansuites.com")
	addEmailReplacement("meridiansuites@bskyakhargha1.help", "meridian@meridiansuites.com")

	//citytrust phishing emails:
	addEmailReplacement("citytrustphish@bskyakhargha1.help", "citytrust@citytrustbank.com")
	addEmailReplacement("8ankeasy@tuta.com", "citytrust@citytrustbank.com")
	addEmailReplacement("citytrustphish2@bskyakhargha1.help", "cltytrust@cltytrustbank.com")
	addEmailReplacement("firstnational8ank@bskyakhargha1.help", "cltytrust@cltytrustbank.com")
	//cloudjet phishing emails:
	addEmailReplacement("cloudjetairwaysphish@bskyakhargha1.help", "cIoudjet@cIoudjetairways.com")
	addEmailReplacement("expr3ss4irways@tuta.com", "cIoudjet@cIoudjetairway.com")
	addEmailReplacement("cloudjetairwaysphish2@bskyakhargha1.help", "cloudjet@cloudjetairway.com")
	addEmailReplacement("off1cem4x@tuta.com", "cloudjet@cloudjetairway.com")
	//meridian phishing emails:
	addEmailReplacement("meridiansuitesphish@bskyakhargha1.help", "meridian@meridiansuite.com")
	addEmailReplacement("urbanstay@tuta.com", "meridian@meridiansuite.com")
	addEmailReplacement("meridiansuitesphish2@bskyakhargha1.help", "rneridian@rneridiansuites.com")
	addEmailReplacement("luxurysu1tes@tuta.com", "rneridian@rneridiansuites.com")
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

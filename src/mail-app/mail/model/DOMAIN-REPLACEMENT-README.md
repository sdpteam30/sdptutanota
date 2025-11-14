# Domain Replacement for Study

## Overview

This feature allows you to replace email domains for study purposes. When configured, email addresses will be displayed and logged with **replacement domains** instead of their original domains.

The system supports two types of replacements:
1. **Exact email replacements** (highest priority) - Replace specific email addresses
2. **Domain-wide replacements** (fallback) - Replace all emails from a domain

## Configuration

Edit the file: `src/mail-app/mail/model/DomainReplacementConfig.ts`

### Example Configuration

```typescript
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

	// If you still want domain-wide fallbacks, add them here (optional)
	// addDomainReplacement("tuta.com", "example.com")
}
```

## How It Works

### Priority System

1. **Exact Email Match** (highest priority)
   - `citytrust@tuta.com` → `citytrust@citytrust.com`
   - Exact match takes precedence over domain rules
   
2. **Domain-Wide Match** (fallback)
   - If no exact email match, checks domain rules
   - `anyuser@tuta.com` → `anyuser@example.com` (if domain rule exists)

3. **No Match** (original preserved)
   - If no rules match, the original email is used

### What Gets Replaced

1. **Display**: Email addresses in the UI will show the **replacement**
   - Example: `citytrust@tuta.com` → displays as `citytrust@citytrust.com`

2. **Backend Logging**: All interactions logged to the backend use the **replaced address**
   - When clicking "Show images" → logs replaced address
   - When clicking "Always trust sender" → logs replaced address
   - When reporting spam/phishing → logs replaced address

3. **Console Logs**: You'll see replacement confirmations in the browser console
   ```
   📋 Email rule added: citytrust@tuta.com → citytrust@citytrust.com
   🔄 Email replacement: citytrust@tuta.com → citytrust@citytrust.com
   ```
   Or for domain rules:
   ```
   📋 Domain rule added: tuta.com → example.com
   🔄 Domain replacement: user@tuta.com → user@example.com
   ```

### What Gets Replaced

✅ **Sender addresses** displayed in mail viewer  
✅ **Sender addresses** logged to backend (`trusted_senders`, `email_sender_status`, `phishing_reports`)  
✅ **All interactions** with external content controls  
✅ **All phishing/spam reports**

❌ **NOT replaced**: Original email data in the database (read-only)

## Allowing Self-Alias Reporting

The system now allows reporting emails from your own aliases (for study accounts with multiple aliases). This is controlled in `MailViewerViewModel.ts`:

```typescript
canReport(): boolean {
	// Removed isTutanotaTeamMail() check to allow reporting own alias emails
	return this.getPhishingStatus() === MailPhishingStatus.UNKNOWN && this.logins.isInternalUserLoggedIn()
}
```

## Testing

1. Add domain mappings to `DomainReplacementConfig.ts`
2. Rebuild: `node make prod`
3. Refresh browser (hard refresh: Ctrl+Shift+R)
4. Open an email from a mapped domain
5. Check browser console for `🔄 Domain replacement:` logs
6. Check Supabase tables to verify replaced domains are logged

## Example Workflow

**Before:**
- Email from: `participant@study-phishing-test.com`

**After configuration:**
```typescript
{ "study-phishing-test.com": "gmail.com" }
```

**Result:**
- UI shows: `participant@gmail.com`
- Backend logs: `participant@gmail.com`
- Original mail data: unchanged

## Rebuilding After Changes

```bash
cd /home/sean/sdptutanota
node make prod
```

Then hard-refresh your browser (Ctrl+Shift+R or Cmd+Shift+R).


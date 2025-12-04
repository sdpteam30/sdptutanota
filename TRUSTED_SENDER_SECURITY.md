# Trusted Sender Security Mechanism

## Overview
This document describes the security mechanism for adding known senders to the trusted senders database. The system validates senders by email address, not by name, while allowing multiple email addresses to be associated with the same display name.

## Key Security Principles

### 1. Email is the Primary Identifier
- **Email addresses are unique identifiers**: Each combination of `(user_email, trusted_email)` is unique in the database
- **Name is for display only**: The `trusted_name` field is used for user convenience but is NOT used for authentication
- **Validation always happens by email**: The system validates senders by matching email addresses, never by name alone

### 2. Multiple Emails, Same Name
Users can add multiple email addresses with the same display name. For example:
- `info@amazon.com` → Name: "Amazon"
- `shop@amazon.com` → Name: "Amazon"
- `no-reply@amazon.com` → Name: "Amazon"

These are stored as **separate database rows**, each validated independently.

## How It Works

### Scenario 1: Adding a New Sender (Custom Entry)
When a user types a new sender name (not selecting from dropdown):
1. User receives an email from `sender@example.com`
2. User types "Example Company" as the sender name
3. System validates that the name matches the sender's display name in the email
4. If validated, adds entry: `(user_email, sender@example.com, "Example Company")`

### Scenario 2: Selecting an Existing Sender from Dropdown
When a user selects an existing sender name from the dropdown:
1. User receives an email from `shop@amazon.com`
2. User selects "Amazon" from the dropdown (already has `info@amazon.com` as "Amazon")
3. **SECURITY CHECK**: System validates that `shop@amazon.com` matches one of the emails already associated with "Amazon"
4. **If validation fails**: Shows error message with known email addresses
5. **If validation passes**: Confirms the email without adding a duplicate entry

### Scenario 3: Adding New Email for Existing Sender Name
If a user wants to add `shop@amazon.com` as "Amazon" (when only `info@amazon.com` exists):
1. User should NOT select from dropdown (this would fail validation)
2. User should type "Amazon" as a custom entry
3. System will add a new row: `(user_email, shop@amazon.com, "Amazon")`
4. Now both emails are independently validated as "Amazon"

## Backend Implementation

### New Endpoint: `/validate-sender-email`
```javascript
POST /validate-sender-email
{
  "user_email": "user@example.com",
  "sender_name": "Amazon",
  "sender_email": "shop@amazon.com"
}

Response:
{
  "valid": true/false,
  "sender_name": "Amazon",
  "sender_email": "shop@amazon.com",
  "known_emails": ["info@amazon.com", "orders@amazon.com"]
}
```

**Purpose**: Validates that when a user selects an existing sender name from the dropdown, the email address they're confirming matches one of the emails already associated with that sender name.

**Security**: 
- Case-insensitive email comparison
- Returns list of known emails (for user transparency)
- Prevents spoofing by ensuring exact email match

### Existing Endpoint: `/add-trusted`
```javascript
POST /add-trusted
{
  "user_email": "user@example.com",
  "trusted_email": "sender@example.com",
  "trusted_name": "Sender Name"
}
```

**Purpose**: Adds or updates a trusted sender entry.

**Security**:
- UPSERT with unique constraint on `(user_email, trusted_email)`
- Email normalization (lowercase, trim)
- Used when adding new custom sender entries

## Frontend Implementation

### Modal Flow

#### Known Sender Button Click

When a user clicks the "Known Sender" button in the banner:

1. **System checks if sender's email is already in trusted list**
   - Looks up sender's email address in the user's trusted senders list

2. **If email IS in trusted list** (Previously added sender):
   - Updates email status to "confirmed" silently (no modal shown)
   - Automatically unblocks content
   - Shows links and content immediately
   - **One-click confirmation - no dialogue needed!**

3. **If email is NOT in trusted list** (New sender):
   - Opens `MobyPhishConfirmSenderModal` (the adding senders dialogue)
   - User can select from dropdown OR type custom name
   - Proceeds to validation flow below

#### Adding Senders Dialogue Flow (MobyPhishConfirmSenderModal)

1. **User sees email from unknown sender**
   - System shows confirmation modal with dropdown of known senders

2. **User selects from dropdown** (`this.selectedSenderEmail` is populated)
   - Frontend calls `/validate-sender-email` to verify the actual email matches known emails for that sender
   - If valid: Updates email status to "confirmed" (no new DB entry needed)
   - If invalid: Shows error with list of known emails for that sender

3. **User types custom name** (`this.selectedSenderEmail` is empty)
   - Frontend validates name matches sender's display name
   - If match: Calls `/add-trusted` to create new entry
   - If no match: Shows phishing warning

## Security Benefits

1. **Prevents Name Spoofing**: 
   - Attacker cannot impersonate "Amazon" just by using that name
   - System validates by email address, which is harder to spoof

2. **User Transparency**:
   - When validation fails, user sees which emails are associated with that sender
   - Helps users identify legitimate vs. fraudulent emails

3. **Flexible Management**:
   - Users can manage multiple emails per organization
   - Each email is independently validated

4. **No Name-Based Trust**:
   - System never trusts based on display name alone
   - Always requires explicit email address validation

## Complete User Flows

### Flow 1: User clicks "Known Sender" for already-trusted email
1. User receives email from `info@amazon.com` (previously added to trusted list)
2. User clicks "Known Sender" button in banner
3. System checks: Is `info@amazon.com` in trusted list? **YES**
4. System silently updates status to "confirmed"
5. System automatically unblocks content
6. Links and images appear immediately
7. **Result**: One-click confirmation - email is confirmed, content shown, no dialogue needed!

### Flow 2: User clicks "Known Sender" for new email (not in list)
1. User receives email from `newvendor@example.com` (not in trusted list)
2. User clicks "Known Sender" button in banner
3. System checks: Is `newvendor@example.com` in trusted list? **NO**
4. Opens adding senders dialogue with dropdown
5. User types "New Vendor" as custom name
6. System validates name matches sender's display name
7. Adds `(user_email, newvendor@example.com, "New Vendor")` to database
8. **Result**: New sender added and confirmed

### Flow 3: User clicks "Known Sender" and selects existing sender name from dropdown
1. User receives email from `info@amazon.com` (not in list, but "Amazon" exists with `shop@amazon.com`)
2. User clicks "Known Sender" button
3. System checks: Is `info@amazon.com` in trusted list? **NO**
4. Opens adding senders dialogue
5. User selects "Amazon" from dropdown
6. System calls `/validate-sender-email` with:
   - sender_name: "Amazon"
   - sender_email: "info@amazon.com"
7. Backend checks: Is `info@amazon.com` associated with "Amazon"? **NO**
8. Shows error: "This email address (info@amazon.com) is not associated with the known sender 'Amazon'. Known addresses: shop@amazon.com"
9. User realizes this is a different Amazon email
10. User types "Amazon" as custom name instead
11. System adds new entry: `(user_email, info@amazon.com, "Amazon")`
12. **Result**: Both `info@amazon.com` and `shop@amazon.com` now map to "Amazon"

### Flow 4: User clicks "Known Sender" and correctly validates existing sender
1. User receives email from `shop@amazon.com` (already in list as "Amazon")
2. User clicks "Known Sender" button
3. System checks: Is `shop@amazon.com` in trusted list? **YES**
4. Silently updates status to "confirmed" and unblocks content
5. Links and images appear immediately
6. **Result**: One-click confirmation - instant access to content!

## Example Attack Scenarios

### Attack 1: Name Spoofing
**Attacker's Email**: `attacker@evil.com` with display name "Amazon"

**User Action**: Selects "Amazon" from dropdown

**System Response**: 
- Validates `attacker@evil.com` against known Amazon emails
- Finds no match
- Shows error: "This email address (attacker@evil.com) is not associated with the known sender 'Amazon'. Known addresses: info@amazon.com, shop@amazon.com"
- **Attack blocked! ✓**

### Attack 2: Similar Domain
**Attacker's Email**: `info@arnazon.com` (note the 'r' instead of 'm')

**User Action**: Types "Amazon" as custom entry

**System Response**:
- Email address doesn't match trusted list
- User must explicitly confirm and add
- System shows name mismatch warning if sender's display name doesn't match
- **User alerted! ✓**

## Database Schema

```sql
CREATE TABLE trusted_senders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  trusted_email TEXT NOT NULL,
  trusted_name TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_email, trusted_email)
)
```

**Key Constraint**: `UNIQUE(user_email, trusted_email)` ensures each email is only added once per user, but allows multiple emails with the same name.

## Testing Recommendations

1. **Test adding multiple emails with same name**
   - Add info@example.com as "Example"
   - Add shop@example.com as "Example"
   - Verify both exist as separate rows

2. **Test dropdown validation**
   - Add info@amazon.com as "Amazon"
   - Receive email from shop@amazon.com
   - Select "Amazon" from dropdown
   - Should show error (email not in known list)

3. **Test custom entry**
   - Receive email from new-sender@example.com
   - Type "Example" as custom name
   - Should add successfully as new entry

4. **Test case insensitivity**
   - Add Info@Amazon.com
   - Receive email from INFO@AMAZON.COM
   - Should match correctly (case-insensitive)

## Future Enhancements (Optional)

1. **Email Domain Verification**
   - Add domain-level trust (trust all @company.com)
   - More flexible but less secure

2. **Automatic Email Association**
   - Suggest adding new emails to existing sender names
   - Based on domain similarity or user patterns

3. **Rate Limiting**
   - Prevent abuse of validation endpoint
   - Limit number of sender additions per time period

4. **Audit Logging**
   - Track when senders are added/validated
   - Help identify suspicious patterns


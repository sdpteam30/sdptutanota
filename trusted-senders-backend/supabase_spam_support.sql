-- SQL script to add spam reporting support to Supabase database
-- Run this in your Supabase SQL editor

-- 1. CRITICAL: Fix the CHECK constraint to allow "reported_spam" status
-- The error you're seeing is: "violates check constraint email_sender_status_status_check"
-- This means the constraint doesn't include "reported_spam" yet

-- First, drop the existing constraint
ALTER TABLE email_sender_status DROP CONSTRAINT IF EXISTS email_sender_status_status_check;

-- Then add a new constraint that includes "reported_spam"
ALTER TABLE email_sender_status 
ADD CONSTRAINT email_sender_status_status_check 
CHECK (status IN (
  'confirmed', 
  'denied', 
  'added_to_trusted', 
  'removed_from_trusted', 
  'reported_phishing', 
  'reported_spam', 
  'reported_impersonation', 
  'trusted_once'
));

-- 2. Also fix the dev_email_sender_status constraint (if it exists)
ALTER TABLE dev_email_sender_status DROP CONSTRAINT IF EXISTS dev_email_sender_status_status_check;

ALTER TABLE dev_email_sender_status 
ADD CONSTRAINT dev_email_sender_status_status_check 
CHECK (status IN (
  'confirmed', 
  'denied', 
  'added_to_trusted', 
  'removed_from_trusted', 
  'reported_phishing', 
  'reported_spam', 
  'reported_impersonation', 
  'trusted_once'
));

-- 3. If you're using an ENUM type, you'll need to add the new value:
-- ALTER TYPE email_status_type ADD VALUE IF NOT EXISTS 'reported_spam';

-- 4. Ensure phishing_reports table has report_type column that accepts "phishing" (generic)
-- This should already exist, but you can verify with:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'phishing_reports' AND column_name = 'report_type';

-- 5. Create an index on email_sender_status for faster queries by status (optional but recommended):
CREATE INDEX IF NOT EXISTS idx_email_sender_status_status 
ON email_sender_status(status);

-- 6. Create an index on phishing_reports for faster queries by report_type (optional but recommended):
CREATE INDEX IF NOT EXISTS idx_phishing_reports_report_type 
ON phishing_reports(report_type);

-- 7. Create an index on email_sender_status for faster queries by user_email and status (optional but recommended):
CREATE INDEX IF NOT EXISTS idx_email_sender_status_user_status 
ON email_sender_status(user_email, status);

-- Note: The actual implementation depends on your specific database schema.
-- If you're using Supabase's automatic schema management, you may not need to run these manually.
-- However, if you have custom constraints or enums, you'll need to update them accordingly.


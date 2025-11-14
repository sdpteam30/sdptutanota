-- SQL script to create prefixed tables for development branch
-- Run this in your Supabase SQL Editor
-- These tables are isolated from production tables

-- Create dev_trusted_senders table
CREATE TABLE IF NOT EXISTS dev_trusted_senders (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    trusted_email TEXT NOT NULL,
    trusted_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, trusted_email)
);

-- Create indexes for dev_trusted_senders
CREATE INDEX IF NOT EXISTS idx_dev_trusted_senders_user ON dev_trusted_senders(user_email);
CREATE INDEX IF NOT EXISTS idx_dev_trusted_senders_email ON dev_trusted_senders(trusted_email);

-- Create dev_email_sender_status table
CREATE TABLE IF NOT EXISTS dev_email_sender_status (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    email_id TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'denied', 'added_to_trusted', 'removed_from_trusted', 'reported_phishing', 'reported_impersonation', 'trusted_once')),
    interaction_type TEXT DEFAULT 'interacted' CHECK (interaction_type IN ('interacted', 'auto_detected')),
    auth_failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, email_id)
);

-- Create indexes for dev_email_sender_status
CREATE INDEX IF NOT EXISTS idx_dev_email_sender_status_user ON dev_email_sender_status(user_email);
CREATE INDEX IF NOT EXISTS idx_dev_email_sender_status_sender ON dev_email_sender_status(sender_email);

-- Create dev_phishing_reports table
CREATE TABLE IF NOT EXISTS dev_phishing_reports (
    id BIGSERIAL PRIMARY KEY,
    user_email TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    report_type TEXT NOT NULL CHECK (report_type IN ('phishing', 'spam', 'impersonation')),
    email_id TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for dev_phishing_reports
CREATE INDEX IF NOT EXISTS idx_dev_phishing_reports_user ON dev_phishing_reports(user_email);
CREATE INDEX IF NOT EXISTS idx_dev_phishing_reports_sender ON dev_phishing_reports(sender_email);

-- Done! Tables created with 'dev_' prefix to isolate from other branches


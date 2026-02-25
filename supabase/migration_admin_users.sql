-- =====================================================
-- Multi-Admin RBAC Migration
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);

-- 2. Enable RLS (admin_users should only be accessible via service role)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No public policies — only service role (API) can access this table

-- =====================================================
-- IMPORTANT: Create your first super admin
-- =====================================================
-- You need to generate a password hash using the app's /api/admin/setup endpoint
-- OR run this script after starting the app:
--
--   curl -X POST http://localhost:3000/api/admin/setup \
--     -H "Content-Type: application/json" \
--     -d '{"username":"admin","password":"your_secure_password"}'
--
-- This endpoint only works once (if no users exist yet).
-- =====================================================

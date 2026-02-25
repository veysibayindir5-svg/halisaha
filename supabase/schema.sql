-- =====================================================
-- Halısaha Rezervasyon Sistemi - Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (role-based access control)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for username lookup
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);

-- Fields table (a facility can have multiple fields)
CREATE TABLE IF NOT EXISTS fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Halısaha',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'cancelled')),
  is_archived BOOLEAN DEFAULT FALSE,
  is_subscriber BOOLEAN DEFAULT FALSE,
  subscriber_group_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emoji TEXT,
  label TEXT NOT NULL,
  image_url TEXT, -- Placeholder for future real images
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings table (for dynamic contact info)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial gallery data
INSERT INTO gallery (emoji, label) VALUES
  ('⚽', 'Saha 1 - Genel Görünüm'),
  ('🏟️', 'Saha 2 - Akşam Görünümü'),
  ('🌙', 'Gece Aydınlatması'),
  ('🥅', 'Kale Detayı'),
  ('🌿', 'Çim Kalitesi'),
  ('🚿', 'Soyunma Odaları')
ON CONFLICT DO NOTHING;

-- Insert initial settings
INSERT INTO site_settings (key, value) VALUES
  ('phone', '0212 000 00 00'),
  ('email', 'info@halisaha.com'),
  ('address', 'Atatürk Mah. Spor Cad. No:1, İstanbul'),
  ('hours', 'Her gün 10:00 – 24:00')
ON CONFLICT DO NOTHING;

-- Index for fast slot lookups
CREATE INDEX IF NOT EXISTS idx_bookings_field_date ON bookings (field_id, booking_date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to facilities and fields
CREATE POLICY "Public can view facilities" ON facilities FOR SELECT TO anon USING (true);
CREATE POLICY "Public can view fields" ON fields FOR SELECT TO anon USING (true);

-- Allow public to read non-cancelled bookings (for timetable display)
CREATE POLICY "Public can view bookings" ON bookings FOR SELECT TO anon USING (status != 'cancelled');

-- Allow public to create bookings (pending status)
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT TO anon WITH CHECK (status = 'pending');

-- Service role (admin) has full access - this is handled by the service key
-- No restrictive policies needed for service role

-- =====================================================
-- Sample Data (optional, uncomment to use)
-- =====================================================

-- INSERT INTO facilities (name, address, phone) VALUES
--   ('Yıldız Halısaha', 'Atatürk Mah. Spor Cad. No:1, İstanbul', '0212 555 00 01'),
--   ('Olimpik Saha', 'Cumhuriyet Mah. Bağ Sok. No:5, İstanbul', '0212 555 00 02');

-- INSERT INTO fields (facility_id, name, type) VALUES
--   ((SELECT id FROM facilities WHERE name='Yıldız Halısaha'), 'Saha 1', 'Halısaha'),
--   ((SELECT id FROM facilities WHERE name='Yıldız Halısaha'), 'Saha 2', 'Futbol 7'),
--   ((SELECT id FROM facilities WHERE name='Olimpik Saha'), 'Analig Saha', 'Futbol 11');

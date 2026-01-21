-- =============================================
-- Music Playlist App - Database Schema
-- PostgreSQL (Supabase)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE
-- ข้อมูลผู้ใช้ (เชื่อมกับ Supabase Auth)
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- =============================================
-- 2. SONGS TABLE
-- ข้อมูลเพลงที่ถูกเพิ่มเข้าระบบ
-- =============================================
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    itunes_track_id TEXT UNIQUE NOT NULL,
    song_title TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    album_name TEXT,
    album_art_url TEXT,
    audio_preview_url TEXT,
    duration_ms INTEGER,
    release_date TEXT,
    genre TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Policies (songs are public to read)
CREATE POLICY "Anyone can view songs"
    ON songs FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert songs"
    ON songs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- =============================================
-- 3. PLAYLISTS TABLE
-- ข้อมูลเพลย์ลิสต์
-- =============================================
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own playlists"
    ON playlists FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own playlists"
    ON playlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
    ON playlists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
    ON playlists FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- 4. PLAYLIST_SONGS TABLE (Junction Table)
-- ตารางเชื่อมโยงเพลงและเพลย์ลิสต์ (Many-to-Many)
-- =============================================
CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(playlist_id, song_id)
);

-- Enable RLS
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view songs in their playlists"
    ON playlist_songs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE playlists.id = playlist_songs.playlist_id
            AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
        )
    );

CREATE POLICY "Users can add songs to their playlists"
    ON playlist_songs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE playlists.id = playlist_songs.playlist_id
            AND playlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove songs from their playlists"
    ON playlist_songs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM playlists
            WHERE playlists.id = playlist_songs.playlist_id
            AND playlists.user_id = auth.uid()
        )
    );

-- =============================================
-- INDEXES for Performance
-- =============================================
CREATE INDEX idx_songs_itunes_track_id ON songs(itunes_track_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
CREATE INDEX idx_playlist_songs_song_id ON playlist_songs(song_id);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at
    BEFORE UPDATE ON playlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

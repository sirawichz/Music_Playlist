-- =============================================
-- Music Playlist App - Database Schema
-- MySQL 8.0+
-- =============================================

-- Note: MySQL does not have Row Level Security (RLS) like PostgreSQL
-- Security must be handled at the application level or using stored procedures
-- For auth.users reference, you may need to create your own users table
-- or use VARCHAR(36) to store user IDs from your authentication system

-- =============================================
-- 1. USERS TABLE (Optional - if not using external auth)
-- =============================================
-- Uncomment if you need to create a users table
-- CREATE TABLE IF NOT EXISTS users (
--     id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     password_hash VARCHAR(255),
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
-- );

-- =============================================
-- 2. PROFILES TABLE
-- ข้อมูลผู้ใช้ (เชื่อมกับระบบ Authentication)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id CHAR(36) PRIMARY KEY,
    -- If using external auth, remove FOREIGN KEY and use:
    -- id CHAR(36) PRIMARY KEY,
    -- FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- 3. SONGS TABLE
-- ข้อมูลเพลงที่ถูกเพิ่มเข้าระบบ
-- =============================================
CREATE TABLE IF NOT EXISTS songs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    itunes_track_id VARCHAR(255) UNIQUE NOT NULL,
    song_title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    album_name VARCHAR(255),
    album_art_url TEXT,
    audio_preview_url TEXT,
    duration_ms INT,
    release_date VARCHAR(50),
    genre VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_songs_itunes_track_id (itunes_track_id)
);

-- =============================================
-- 4. PLAYLISTS TABLE
-- ข้อมูลเพลย์ลิสต์
-- =============================================
CREATE TABLE IF NOT EXISTS playlists (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    INDEX idx_playlists_user_id (user_id)
);

-- =============================================
-- 5. PLAYLIST_SONGS TABLE (Junction Table)
-- ตารางเชื่อมโยงเพลงและเพลย์ลิสต์ (Many-to-Many)
-- =============================================
CREATE TABLE IF NOT EXISTS playlist_songs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    playlist_id CHAR(36) NOT NULL,
    song_id CHAR(36) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_playlist_song (playlist_id, song_id),
    INDEX idx_playlist_songs_playlist_id (playlist_id),
    INDEX idx_playlist_songs_song_id (song_id)
);

-- =============================================
-- NOTES ON SECURITY (RLS Equivalent)
-- =============================================
-- MySQL does not have Row Level Security (RLS) like PostgreSQL
-- You must implement security at the application level:
--
-- 1. Application-level checks:
--    - Always filter queries by user_id in your application code
--    - Use parameterized queries to prevent SQL injection
--    - Validate user permissions before executing queries
--
-- 2. Stored Procedures (Optional):
--    - Create stored procedures that check user permissions
--    - Use application user context variables
--
-- 3. Views (Optional):
--    - Create views that filter data based on current user
--    - Requires session variables or application-level filtering
--
-- Example application-level security pattern:
-- SELECT * FROM playlists WHERE user_id = ? OR is_public = TRUE;
-- INSERT INTO playlists (user_id, name, ...) VALUES (?, ?, ...);
-- UPDATE playlists SET ... WHERE id = ? AND user_id = ?;
-- DELETE FROM playlists WHERE id = ? AND user_id = ?;

-- =============================================
-- HELPER STORED PROCEDURES (Optional)
-- =============================================
-- Example: Get user's playlists with security check
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS GetUserPlaylists(IN p_user_id CHAR(36))
BEGIN
    SELECT * FROM playlists 
    WHERE user_id = p_user_id OR is_public = TRUE
    ORDER BY created_at DESC;
END //

-- Example: Add song to playlist with security check
CREATE PROCEDURE IF NOT EXISTS AddSongToPlaylist(
    IN p_playlist_id CHAR(36),
    IN p_song_id CHAR(36),
    IN p_user_id CHAR(36)
)
BEGIN
    DECLARE playlist_owner CHAR(36);
    
    -- Check if user owns the playlist
    SELECT user_id INTO playlist_owner 
    FROM playlists 
    WHERE id = p_playlist_id;
    
    IF playlist_owner = p_user_id THEN
        INSERT INTO playlist_songs (playlist_id, song_id, position)
        VALUES (p_playlist_id, p_song_id, 0)
        ON DUPLICATE KEY UPDATE position = position;
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Access denied: You do not own this playlist';
    END IF;
END //

DELIMITER ;

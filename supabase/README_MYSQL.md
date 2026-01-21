# MySQL Schema Migration Guide

ไฟล์นี้เป็นคู่มือสำหรับการใช้งาน schema กับ MySQL แทน PostgreSQL (Supabase)

## 📁 ไฟล์ที่เกี่ยวข้อง

- `schema_mysql.sql` - Schema สำหรับ MySQL (standalone)
- `migrations/20260121000001_initial_schema_mysql.sql` - Migration file สำหรับ MySQL

## 🔄 ความแตกต่างระหว่าง PostgreSQL และ MySQL

### 1. Data Types

| PostgreSQL | MySQL |
|------------|-------|
| `UUID` | `CHAR(36)` |
| `TIMESTAMPTZ` | `DATETIME` |
| `TEXT` | `TEXT` หรือ `VARCHAR(255)` |
| `BOOLEAN` | `BOOLEAN` หรือ `TINYINT(1)` |

### 2. UUID Generation

- **PostgreSQL**: `uuid_generate_v4()`
- **MySQL**: `UUID()` (built-in function)

### 3. Row Level Security (RLS)

- **PostgreSQL**: มี RLS policies ในตัว
- **MySQL**: **ไม่มี RLS** - ต้องจัดการ security ที่ application level

### 4. Foreign Keys

- **PostgreSQL**: `REFERENCES auth.users(id)` (ใช้ Supabase Auth)
- **MySQL**: `REFERENCES profiles(id)` (ต้องสร้าง users table เอง หรือใช้ external auth)

## 🔒 Security Implementation

เนื่องจาก MySQL ไม่มี RLS คุณต้องจัดการ security ที่ application level:

### Application-Level Security Pattern

```javascript
// Example: Get user's playlists
const getPlaylists = async (userId) => {
  const query = `
    SELECT * FROM playlists 
    WHERE user_id = ? OR is_public = TRUE
  `;
  return db.query(query, [userId]);
};

// Example: Create playlist
const createPlaylist = async (userId, name, description) => {
  const query = `
    INSERT INTO playlists (user_id, name, description)
    VALUES (?, ?, ?)
  `;
  return db.query(query, [userId, name, description]);
};

// Example: Update playlist (with ownership check)
const updatePlaylist = async (playlistId, userId, updates) => {
  const query = `
    UPDATE playlists 
    SET name = ?, description = ?
    WHERE id = ? AND user_id = ?
  `;
  return db.query(query, [updates.name, updates.description, playlistId, userId]);
};

// Example: Delete playlist (with ownership check)
const deletePlaylist = async (playlistId, userId) => {
  const query = `
    DELETE FROM playlists 
    WHERE id = ? AND user_id = ?
  `;
  return db.query(query, [playlistId, userId]);
};
```

### Stored Procedures (Optional)

ไฟล์ migration รวม stored procedures ตัวอย่าง:
- `GetUserPlaylists(p_user_id)` - ดึง playlists ของ user
- `AddSongToPlaylist(p_playlist_id, p_song_id, p_user_id)` - เพิ่มเพลงเข้า playlist พร้อม security check

## 🚀 การใช้งาน

### 1. สร้าง Database

```sql
CREATE DATABASE music_playlist CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE music_playlist;
```

### 2. รัน Migration

```bash
# ใช้ MySQL client
mysql -u root -p music_playlist < supabase/migrations/20260121000001_initial_schema_mysql.sql

# หรือใช้ MySQL Workbench / phpMyAdmin
# Copy เนื้อหาจากไฟล์ migration แล้วรัน
```

### 3. เชื่อมต่อจาก Application

```javascript
// Example: Using mysql2
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_user',
  password: 'your_password',
  database: 'music_playlist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

## ⚠️ ข้อควรระวัง

1. **Authentication**: MySQL schema ไม่มี `auth.users` table - คุณต้องสร้างเองหรือใช้ external auth system
2. **Security**: ต้องจัดการ security ที่ application level ทุกครั้ง
3. **UUID**: MySQL ใช้ `CHAR(36)` แทน `UUID` type
4. **Timestamps**: MySQL ใช้ `DATETIME` แทน `TIMESTAMPTZ` (ไม่มี timezone)

## 📝 การปรับ Application Code

เมื่อเปลี่ยนจาก Supabase (PostgreSQL) เป็น MySQL คุณต้องปรับ:

1. **Database Connection**: เปลี่ยนจาก Supabase client เป็น MySQL client
2. **Query Syntax**: บาง syntax อาจแตกต่างกันเล็กน้อย
3. **Security Checks**: เพิ่ม user_id checks ในทุก query
4. **UUID Handling**: ใช้ `UUID()` function แทน `uuid_generate_v4()`

## 🔗 Resources

- [MySQL 8.0 Documentation](https://dev.mysql.com/doc/refman/8.0/en/)
- [MySQL UUID Function](https://dev.mysql.com/doc/refman/8.0/en/miscellaneous-functions.html#function_uuid)
- [MySQL Security Best Practices](https://dev.mysql.com/doc/refman/8.0/en/security.html)

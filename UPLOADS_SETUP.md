# Simplified Uploads System Setup

## Overview
This is a standalone uploads system that works independently from the main gallery system. It uses a simpler database structure to track uploaded photos and videos.

## Files Created
1. **uploads_database.sql** - Database schema for uploads
2. **config_uploads.php** - Separate configuration for uploads system
3. **simple_upload.php** (updated) - Upload handler using new database
4. **get_uploads.php** - API to retrieve uploads

## Setup Steps

### 1. Create the Database Table
Run this SQL in your InfinityFree database (if0_40203405_vault):

```sql
CREATE TABLE IF NOT EXISTS `cousin_uploads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cousin` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `tags` text,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(100),
  `file_size` bigint(20),
  `upload_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cousin` (`cousin`),
  KEY `idx_upload_date` (`upload_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_cousin_date` ON `cousin_uploads` (`cousin`, `upload_date` DESC);
```

### 2. Upload Files to InfinityFree
Upload these files to your hosting:
- `config_uploads.php`
- `simple_upload.php` (updated version)
- `get_uploads.php`

### 3. Test the Upload
Use your upload form to test. It should:
- Upload file to `/uploads/{cousin}/` folder ✓
- Create record in `cousin_uploads` table ✓

### 4. Retrieve Uploads

**Get all uploads:**
```
GET https://cousinvaults.free.nf/get_uploads.php
```

**Get uploads by cousin:**
```
GET https://cousinvaults.free.nf/get_uploads.php?cousin=abir
GET https://cousinvaults.free.nf/get_uploads.php?cousin=rubab
GET https://cousinvaults.free.nf/get_uploads.php?cousin=rahi
```

**With pagination:**
```
GET https://cousinvaults.free.nf/get_uploads.php?limit=20&offset=0
```

**Order by date (newest first - default):**
```
GET https://cousinvaults.free.nf/get_uploads.php?order=upload_date&dir=DESC
```

## Response Format

```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "id": 1,
        "cousin": "abir",
        "title": "Family Photo",
        "description": "Summer 2025",
        "tags": "family,summer",
        "file_name": "20250122_143022_photo_abc123.jpg",
        "file_path": "uploads/abir/20250122_143022_photo_abc123.jpg",
        "file_type": "image/jpeg",
        "file_size": 2048576,
        "upload_date": "2025-01-22 14:30:22",
        "file_url": "https://cousinvaults.free.nf/uploads/abir/20250122_143022_photo_abc123.jpg",
        "is_image": true,
        "is_video": false
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0,
    "count": 1
  }
}
```

## Benefits
- ✓ No dependencies on users table
- ✓ No authentication required
- ✓ Simple structure
- ✓ Easy to query
- ✓ Independent from main gallery system

## Notes
- The system uses the same database (if0_40203405_vault) but a separate table
- All uploads are public by default
- No user accounts needed - just cousin names (rubab, rahi, abir)

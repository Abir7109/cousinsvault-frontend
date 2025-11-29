# Cousins Memory Vault - Deployment Guide

## 📋 Overview
This is a complete family memory sharing platform designed for Rubab, Rahi, and Abir. The system includes user authentication, photo/video gallery, event management, and family tree functionality.

## 🛠️ Technology Stack
- **Backend**: PHP 8.3+ with MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: MySQL 8.0+
- **Hosting**: InfinityFree Compatible
- **Authentication**: JWT Tokens
- **File Upload**: Native PHP with GD library

## 🚀 Deployment Steps for InfinityFree

### Step 1: Prepare Files
1. Upload all files to your InfinityFree public_html directory
2. Ensure proper file permissions (755 for directories, 644 for files)
3. Create the following directories with write permissions (755):
   - `uploads/`
   - `uploads/images/`
   - `uploads/videos/`
   - `uploads/thumbnails/`

### Step 2: Database Setup
1. **Create MySQL Database**:
   - Go to InfinityFree Control Panel
   - Create a new MySQL database
   - Note down: hostname, database name, username, password

2. **Update Configuration**:
   ```php
   // In config.php, update these values:
   define('DB_HOST', 'sql301.infinityfree.com');     // Your MySQL hostname
   define('DB_NAME', 'if0_40203405_vault');          // Your database name
   define('DB_USER', 'if0_40203405');                // Your username
   define('DB_PASS', 'your_password_here');          // Your password
   define('SITE_URL', 'https://yourdomain.free.nf'); // Your site URL
   ```

3. **Import Database Schema**:
   - Use phpMyAdmin or MySQL client
   - Import the `database.sql` file
   - This creates all necessary tables and initial data

### Step 3: Test Installation
1. Visit `https://yourdomain.free.nf/db_test.php`
2. Check all green checkmarks for:
   - Database connection
   - Table creation
   - File permissions
   - JWT functionality

### Step 4: Generate Admin Password Hash
1. Run `https://yourdomain.free.nf/generate_hash.php`
2. Copy the generated hash
3. Update the users table:
   ```sql
   UPDATE users SET password_hash = 'generated_hash_here' WHERE username = 'Abir';
   ```

### Step 5: Security Setup
1. **Remove test files** (IMPORTANT):
   ```bash
   rm db_test.php
   rm generate_hash.php
   ```

2. **Update .htaccess** for production:
   - Remove debug lines
   - Ensure proper redirects
   - Block access to sensitive files

3. **Set proper file permissions**:
   - config.php: 600 (read-only by owner)
   - API files: 644
   - Upload directories: 755

## 👤 Default User Accounts

### Admin Account
- **Email**: rahikulmakhtum147@gmail.com
- **Username**: Abir
- **Password**: abirbd@#
- **Role**: Admin (full access)

### Auto-Detection for Family Members
The system automatically detects and assigns appropriate roles when Rubab or Rahi sign up:

#### For Rubab:
- Any variation of "rubab", "ruba", "rubaab" in name/username/email
- Auto-assigned role: Admin
- Auto-bio: "Creative graphic designer..."

#### For Rahi:
- Any variation of "rahi", "raahi", "rahee" in name/username/email  
- Auto-assigned role: Contributor
- Auto-bio: "Aspiring writer and poet..."

## 🔧 Configuration Options

### File Upload Settings
```php
define('MAX_FILE_SIZE', 10485760);              // 10MB max file size
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);
define('ALLOWED_VIDEO_TYPES', ['mp4', 'webm', 'mov']);
```

### Security Settings
```php
define('JWT_SECRET', 'your-secret-key');        // Change this!
define('PASSWORD_SALT', 'your-salt');           // Change this!
define('SESSION_TIMEOUT', 86400);               // 24 hours
```

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth?action=login` - User login
- `POST /api/v1/auth?action=signup` - User registration
- `POST /api/v1/auth?action=logout` - User logout
- `GET /api/v1/auth?action=profile` - Get user profile

### Gallery
- `GET /api/v1/gallery` - List gallery items
- `POST /api/v1/upload` - Upload files
- `POST /api/v1/gallery?action=like` - Toggle like
- `DELETE /api/v1/gallery?id={id}` - Delete item

### Events
- `GET /api/v1/events` - List events
- `POST /api/v1/events?action=create` - Create event
- `POST /api/v1/events?action=rsvp` - RSVP to event

### Family
- `GET /api/v1/family?action=tree` - Get family tree
- `GET /api/v1/family?action=stats` - Family statistics

## 📱 Features

### Core Features
- ✅ User authentication & authorization
- ✅ JWT-based session management
- ✅ File upload with thumbnails
- ✅ Photo & video gallery
- ✅ Event management & RSVP
- ✅ Family tree & member profiles
- ✅ Activity logging
- ✅ Search functionality
- ✅ Mobile responsive design

### Security Features
- ✅ Password hashing with salt
- ✅ CSRF protection
- ✅ File upload validation
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Rate limiting ready

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DB credentials in config.php
   - Verify database exists
   - Ensure MySQL service is running

2. **File Upload Not Working**
   - Check directory permissions (755)
   - Verify upload_max_filesize in php.ini
   - Ensure tmp directory is writable

3. **JWT Errors**
   - Verify JWT_SECRET is set
   - Check system time synchronization
   - Ensure proper token format

4. **Permission Denied**
   - Check file/directory permissions
   - Verify .htaccess is working
   - Ensure proper folder structure

### InfinityFree Specific Issues

1. **File Upload Limits**
   - InfinityFree has 10MB upload limit
   - Adjust MAX_FILE_SIZE accordingly
   - Use appropriate file compression

2. **Database Connection**
   - Use provided MySQL hostname
   - Follow exact connection format
   - Wait for database activation (up to 72 hours)

3. **CRON Jobs**
   - InfinityFree doesn't support cron
   - Use external services for scheduled tasks
   - Consider visitor-triggered cleanup

## 📞 Support

### For Developers
- Check error logs in InfinityFree control panel
- Use db_test.php for diagnostics
- Verify API responses in browser console

### For Users
- Contact admin (Abir) for account issues
- Use "Forgot Password" for login problems
- Check browser console for upload errors

## 🎯 Next Steps

1. **After Successful Deployment**:
   - Test all functionality
   - Create user accounts for Rubab and Rahi
   - Upload initial family photos
   - Create first family event

2. **Ongoing Maintenance**:
   - Regular database backups
   - Monitor disk space usage
   - Update password hashes if needed
   - Clean up old sessions periodically

3. **Enhancements**:
   - Add email notifications
   - Implement real-time chat
   - Create mobile app
   - Add advanced search filters

---

**Created by**: Abir Hasan  
**Contact**: [Instagram @r_m_abir71](https://instagram.com/r_m_abir71)  
**Version**: 1.0  
**Last Updated**: January 2025
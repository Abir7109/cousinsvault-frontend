-- ========================================
-- COUSIN PROFILES TABLE
-- Store customized profile data in database
-- ========================================

-- Create profiles table in the cousin_uploads database
CREATE TABLE IF NOT EXISTS cousin_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cousin VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    birthdate DATE NULL,
    relation VARCHAR(150) NULL,
    location VARCHAR(100) NULL,
    passion VARCHAR(200) NULL,
    bio TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    theme VARCHAR(20) DEFAULT 'sage',
    profile_photo_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cousin (cousin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default profile for Abir (already exists)
INSERT INTO cousin_profiles (cousin, name, relation, passion, bio, theme) 
VALUES ('abir', 'Abir Hasan', 'Tech Enthusiast & Developer', 'Programming & Technology', 
        'Passionate about creating digital experiences that bring families closer together. Love coding, innovation, and building meaningful connections through technology.', 
        'sage')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    relation = VALUES(relation),
    passion = VALUES(passion),
    bio = VALUES(bio);

-- Note: Run this SQL in your phpMyAdmin or MySQL client
-- Database: if0_40203405_cousin_uploads

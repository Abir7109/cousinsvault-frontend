-- Create a separate database and events tables for InfinityFree
-- Replace `if0_40203405_events` with your chosen DB name if needed

-- 1) Create database (run in phpMyAdmin or via hosting DB tools)
CREATE DATABASE IF NOT EXISTS `if0_40203405_events` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `if0_40203405_events`;

-- 2) Create events table
CREATE TABLE IF NOT EXISTS `events` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `creator_name` VARCHAR(100) DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `event_type` ENUM('family','birthday','reunion','celebration','holiday','other') NOT NULL DEFAULT 'other',
  `event_date` DATE NOT NULL,
  `event_time` TIME DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `end_time` TIME DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `max_attendees` INT DEFAULT NULL,
  `is_private` TINYINT(1) NOT NULL DEFAULT 0,
  `requires_rsvp` TINYINT(1) NOT NULL DEFAULT 1,
  `rsvp_deadline` DATETIME DEFAULT NULL,
  `color` VARCHAR(7) DEFAULT '#8FAE7B',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_date` (`event_date`),
  KEY `idx_event_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3) Create event_rsvps table
CREATE TABLE IF NOT EXISTS `event_rsvps` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `event_id` INT(11) NOT NULL,
  `name` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `rsvp_status` ENUM('yes','no','maybe') NOT NULL DEFAULT 'yes',
  `guest_count` INT NOT NULL DEFAULT 1,
  `dietary_requirements` TEXT,
  `notes` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_rsvp_status` (`rsvp_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: add foreign key if allowed by your hosting
-- ALTER TABLE `event_rsvps` ADD CONSTRAINT `fk_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE;

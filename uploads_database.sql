-- Simplified Uploads Database Schema
-- Independent system for tracking uploads

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

-- Optional: Add some indexes for better performance
CREATE INDEX `idx_cousin_date` ON `cousin_uploads` (`cousin`, `upload_date` DESC);

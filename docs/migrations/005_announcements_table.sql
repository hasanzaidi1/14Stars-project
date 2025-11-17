-- Migration: Create announcements table for homepage content
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `cta_label` varchar(100) DEFAULT NULL,
  `cta_url` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `published_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

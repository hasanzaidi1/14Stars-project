-- Dedicated teacher accounts migration
ALTER TABLE `teachers`
  DROP COLUMN IF EXISTS `password_hash`;

CREATE TABLE IF NOT EXISTS `teacher_accounts` (
  `account_id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50),
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

ALTER TABLE `teacher_accounts`
  ADD CONSTRAINT `fk_teacher_accounts_email`
  FOREIGN KEY (`email`) REFERENCES `teachers` (`t_email`)
  ON DELETE CASCADE;

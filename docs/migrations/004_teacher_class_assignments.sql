-- Teacher-class assignments bridge table migration
CREATE TABLE IF NOT EXISTS `teacher_class_assignments` (
  `assignment_id` INT AUTO_INCREMENT PRIMARY KEY,
  `teacher_id` INT NOT NULL,
  `level_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `school_year` VARCHAR(15) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_teacher_class_year` (`teacher_id`, `level_id`, `subject_id`, `school_year`),
  CONSTRAINT `fk_teacher_class_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`t_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_class_level` FOREIGN KEY (`level_id`) REFERENCES `level` (`level_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teacher_class_subject` FOREIGN KEY (`subject_id`) REFERENCES `subject` (`subject_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

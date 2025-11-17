-- Student-level term reference migration
ALTER TABLE `student_level`
  ADD COLUMN `term_id` INT NULL AFTER `level_id`,
  ADD INDEX `student_level_ibfk_3` (`term_id`),
  ADD CONSTRAINT `student_level_ibfk_3`
    FOREIGN KEY (`term_id`) REFERENCES `term` (`term_id`);

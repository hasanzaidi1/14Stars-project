-- Student grade tracking migration
ALTER TABLE `student_level`
  ADD COLUMN `midterm_grade` DECIMAL(5,2) NULL AFTER `school_year`,
  ADD COLUMN `final_grade` DECIMAL(5,2) NULL AFTER `midterm_grade`,
  ADD COLUMN `average_grade` DECIMAL(5,2) NULL AFTER `final_grade`;

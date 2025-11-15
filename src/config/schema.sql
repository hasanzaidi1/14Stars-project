
use admin14stars_education_center;

-- Table structure for table `guardian`
CREATE TABLE `guardian` (
  `g_id` int NOT NULL AUTO_INCREMENT,
  `g_f_name` text NOT NULL,
  `g_mi` text,
  `g_l_name` text,
  `g_cell` text,
  `g_email` text,
  `g_staddress` text,
  `g_city` text,
  `g_state` text,
  `g_zip` text,
  `gender` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`g_id`),
  CONSTRAINT `guardian_chk_1` CHECK (`gender` IN ('Male', 'Female'))
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `level`
CREATE TABLE `level` (
  `level_id` int NOT NULL AUTO_INCREMENT,
  `level_number` int NOT NULL,
  PRIMARY KEY (`level_id`),
  UNIQUE KEY `level_number` (`level_number`),
  CONSTRAINT `level_chk_1` CHECK (`level_number` BETWEEN 1 AND 8)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `parent_account`
CREATE TABLE `parent_account` (
  `g_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `f_name` text,
  `l_name` text,
  PRIMARY KEY (`g_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `school_year`
CREATE TABLE `school_year` (
  `id` int NOT NULL AUTO_INCREMENT,
  `year` year DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `student`
CREATE TABLE `student` (
  `St_ID` int NOT NULL AUTO_INCREMENT,
  `F_Name` text NOT NULL,
  `MI` text,
  `L_Name` text NOT NULL,
  `dob` date DEFAULT NULL,
  `st_address` text,
  `city` text,
  `state` text,
  `zip` text,
  `st_email` text,
  `st_cell` text,
  `st_gender` text,
  `student_location` enum('on-site','remote') DEFAULT NULL,
  PRIMARY KEY (`St_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `student_guardian`
CREATE TABLE `student_guardian` (
  `st_id` int NOT NULL,
  `g_id` int NOT NULL,
  `relationship_type` text,
  PRIMARY KEY (`st_id`, `g_id`),
  KEY `fk_guardian` (`g_id`),
  CONSTRAINT `fk_guardian` FOREIGN KEY (`g_id`) REFERENCES `guardian` (`g_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_student` FOREIGN KEY (`st_id`) REFERENCES `student` (`St_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `student_level`
CREATE TABLE `student_level` (
  `st_id` int NOT NULL,
  `level_id` int NOT NULL,
  `term_id` int DEFAULT NULL,
  `full_name` text NOT NULL,
  `subject` varchar(255) NOT NULL,
  `school_year` varchar(255) DEFAULT NULL,
  `midterm_grade` decimal(5,2) DEFAULT NULL,
  `final_grade` decimal(5,2) DEFAULT NULL,
  `average_grade` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`st_id`, `level_id`, `subject`),
  UNIQUE KEY `unique_student_level_subject` (`st_id`, `level_id`, `subject`),
  KEY `student_level_ibfk_2` (`level_id`),
  KEY `student_level_ibfk_3` (`term_id`),
  CONSTRAINT `student_level_ibfk_1` FOREIGN KEY (`st_id`) REFERENCES `student` (`St_ID`),
  CONSTRAINT `student_level_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `level` (`level_id`),
  CONSTRAINT `student_level_ibfk_3` FOREIGN KEY (`term_id`) REFERENCES `term` (`term_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `subject`
CREATE TABLE `subject` (
  `subject_id` int NOT NULL AUTO_INCREMENT,
  `subject` text NOT NULL,
  PRIMARY KEY (`subject_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `substitute`
CREATE TABLE `substitute` (
  `substitute_id` int NOT NULL AUTO_INCREMENT,
  `sub_f_name` text NOT NULL,
  `sub_l_name` text NOT NULL,
  `sub_email` text NOT NULL,
  `sub_phone` text,
  PRIMARY KEY (`substitute_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `substitute_requests`
CREATE TABLE `substitute_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `teacher_name` varchar(255) NOT NULL,
  `teacher_email` varchar(255) NOT NULL,
  `reason` text,
  `date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `satisfied_by` text,
  PRIMARY KEY (`id`),
  KEY `idx_teacher_email` (`teacher_email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `teachers`
CREATE TABLE `teachers` (
  `t_id` int NOT NULL AUTO_INCREMENT,
  `t_f_name` varchar(255) NOT NULL,
  `t_mi` varchar(10) DEFAULT NULL,
  `t_l_name` varchar(255) NOT NULL,
  `t_email` varchar(255) NOT NULL,
  `t_phone` varchar(50) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `t_staddress` varchar(255) DEFAULT NULL,
  `t_city` varchar(100) DEFAULT NULL,
  `t_state` varchar(100) DEFAULT NULL,
  `t_zip` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`t_id`),
  UNIQUE KEY `t_email` (`t_email`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dedicated teacher accounts table (stores credentials + account info only)
CREATE TABLE `teacher_accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `fk_teacher_accounts_email`
    FOREIGN KEY (`email`)
    REFERENCES `teachers` (`t_email`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ++++++++++++++++++ NEW QUERY NEEDS TO IMPLEMENTED ON THE VPS  ++++++++++++++++++
CREATE TABLE term (
    term_id INT AUTO_INCREMENT PRIMARY KEY,
    term_name VARCHAR(100) NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    UNIQUE (term_name, school_year)
);
-- END OF NEW QUERY

-- Table structure for table `sessions`
CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) NOT NULL,
  `expires` bigint unsigned NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

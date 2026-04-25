-- ============================================================
--  notown — Database Schema (InfinityFree / No Views)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = '';

CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `username`      VARCHAR(60)       NOT NULL,
  `email`         VARCHAR(120)      NOT NULL,
  `password_hash` VARCHAR(255)      NOT NULL,
  `avatar_color`  VARCHAR(7)        NOT NULL DEFAULT '#554BF9',
  `role`          ENUM('student','faculty','admin') NOT NULL DEFAULT 'student',
  `is_active`     TINYINT(1)        NOT NULL DEFAULT 1,
  `created_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email`    (`email`),
  UNIQUE KEY `uq_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `departments` (
  `id`         SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(120)      NOT NULL,
  `code`       VARCHAR(15)       NOT NULL,
  `icon`       VARCHAR(60)       NOT NULL DEFAULT 'book',
  `created_at` DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
  `id`            MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `department_id` SMALLINT UNSIGNED  NOT NULL,
  `name`          VARCHAR(150)       NOT NULL,
  `code`          VARCHAR(20)        NOT NULL,
  `credits`       TINYINT UNSIGNED   NOT NULL DEFAULT 3,
  `semester`      TINYINT UNSIGNED   NOT NULL DEFAULT 1,
  `created_at`    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_code` (`code`),
  INDEX `idx_department` (`department_id`),
  CONSTRAINT `fk_course_dept`
    FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notes` (
  `id`             INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `uploader_id`    INT UNSIGNED       NOT NULL,
  `course_id`      MEDIUMINT UNSIGNED NOT NULL,
  `title`          VARCHAR(200)       NOT NULL,
  `faculty_name`   VARCHAR(120)       NOT NULL,
  `semester`       TINYINT UNSIGNED   NOT NULL,
  `file_name`      VARCHAR(255)       NOT NULL,
  `file_path`      VARCHAR(512)       NOT NULL,
  `file_size`      BIGINT UNSIGNED    NOT NULL DEFAULT 0,
  `file_type`      VARCHAR(80)        NOT NULL DEFAULT '',
  `file_ext`       VARCHAR(20)        NOT NULL DEFAULT '',
  `remarks`        TEXT               NULL,
  `download_count` INT UNSIGNED       NOT NULL DEFAULT 0,
  `is_approved`    TINYINT(1)         NOT NULL DEFAULT 1,
  `uploaded_at`    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_uploader` (`uploader_id`),
  INDEX `idx_course`   (`course_id`),
  CONSTRAINT `fk_note_uploader`
    FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_note_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `downloads` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       INT UNSIGNED    NULL,
  `note_id`       INT UNSIGNED    NOT NULL,
  `ip_address`    VARCHAR(45)     NULL,
  `downloaded_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_note` (`note_id`),
  CONSTRAINT `fk_dl_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_dl_note`
    FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `course_selections` (
  `id`         BIGINT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED        NULL,
  `session_id` VARCHAR(128)        NULL,
  `course_id`  MEDIUMINT UNSIGNED NOT NULL,
  `added_at`   DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_sel_course`
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reviews` (
  `id`         INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  `user_id`    INT UNSIGNED     NOT NULL,
  `rating`     TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `headline`   VARCHAR(120)     NOT NULL,
  `body`       TEXT             NOT NULL,
  `is_visible` TINYINT(1)       NOT NULL DEFAULT 1,
  `created_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_id`),
  CONSTRAINT `fk_review_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `complaints` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NULL,
  `type`        ENUM('bug','content','suggestion','other') NOT NULL DEFAULT 'other',
  `subject`     VARCHAR(200) NOT NULL,
  `description` TEXT         NOT NULL,
  `status`      ENUM('open','in_review','resolved','dismissed') NOT NULL DEFAULT 'open',
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_complaint_user`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Seed data ────────────────────────────────────────────────
INSERT IGNORE INTO `departments` (`name`, `code`) VALUES
  ('Computer Science & Engineering',      'CSE'),
  ('Electrical & Electronic Engineering', 'EEE'),
  ('Business Administration',             'BBA'),
  ('Civil Engineering',                   'CE'),
  ('Mechanical Engineering',              'ME'),
  ('Mathematics',                         'MATH'),
  ('Physics',                             'PHY'),
  ('English',                             'ENG');

INSERT IGNORE INTO `courses` (`department_id`,`name`,`code`,`credits`,`semester`) VALUES
  (1,'Introduction to Programming','CSE101',3,1),
  (1,'Data Structures & Algorithms','CSE201',3,2),
  (1,'Database Management Systems','CSE301',3,3),
  (1,'Operating Systems','CSE401',3,4),
  (1,'Computer Networks','CSE501',3,5),
  (1,'Software Engineering','CSE601',3,6),
  (1,'Artificial Intelligence','CSE701',3,7),
  (1,'Machine Learning','CSE702',3,7),
  (2,'Circuit Theory','EEE101',3,1),
  (2,'Digital Logic Design','EEE201',3,2),
  (2,'Signals & Systems','EEE301',3,3),
  (2,'Microprocessors & Microcontrollers','EEE401',3,4),
  (3,'Principles of Management','BBA101',3,1),
  (3,'Financial Accounting','BBA201',3,2),
  (3,'Marketing Management','BBA301',3,3),
  (3,'Business Statistics','BBA401',3,4),
  (4,'Engineering Mechanics','CE101',3,1),
  (4,'Structural Analysis','CE301',3,3),
  (5,'Engineering Drawing','ME101',3,1),
  (5,'Thermodynamics','ME301',3,3),
  (6,'Calculus I','MATH101',3,1),
  (6,'Linear Algebra','MATH201',3,2),
  (6,'Differential Equations','MATH301',3,3),
  (7,'Physics I (Mechanics)','PHY101',3,1),
  (7,'Physics II (Electromagnetism)','PHY201',3,2),
  (8,'English Composition','ENG101',3,1),
  (8,'Technical Writing','ENG201',3,2);

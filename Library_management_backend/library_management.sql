-- -------------------------------------------------------------
-- TablePlus 6.4.4(604)
--
-- https://tableplus.com/
--
-- Database: library_management
-- Generation Time: 2025-06-15 00:44:47.2700
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `position` varchar(50) DEFAULT 'Librarian',
  `age` int(11) DEFAULT NULL CHECK (`age` >= 18 and `age` <= 100),
  `joining_date` datetime DEFAULT current_timestamp(),
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bookcopies` (
  `copy_id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) DEFAULT NULL,
  `available` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`copy_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `bookcopies_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `published_year` int(11) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `fines` (
  `fine_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) DEFAULT NULL,
  `amoun` decimal(10,2) DEFAULT NULL,
  `paid` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`fine_id`),
  KEY `loan_id` (`loan_id`),
  CONSTRAINT `fines_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `loans` (
  `loan_id` int(11) NOT NULL AUTO_INCREMENT,
  `copy_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `issued_on` date DEFAULT NULL,
  `returned_on` date DEFAULT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `copy_id` (`copy_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`copy_id`) REFERENCES `bookcopies` (`copy_id`),
  CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `admin` (`admin_id`, `full_name`, `position`, `age`, `joining_date`, `email`, `username`, `password_hash`, `is_active`) VALUES
(1, 'saikat', 'librariyan', 22, '2025-06-05 14:45:43', 'saikatsikder2911@gmail.com', 'mdhsaikats', '29112003', 1),
(2, 'Miraj', 'librariyan', 22, '2025-06-05 23:35:43', 'gachpala.business@gmail.com', 'miraj', '1234', 1),
(3, 'Anik', 'teacher', 18, '2025-06-10 17:00:07', 'anik@gmail.com', 'anik', '1234', 1),
(4, 'Tisha', 'Librariyan', 23, '2025-06-12 15:17:07', 'tisha1@gmail.com', 'tisha1', '2911', 1);

INSERT INTO `bookcopies` (`copy_id`, `book_id`, `available`) VALUES
(4, 1, 1),
(5, 2, 1),
(6, 3, 1);

INSERT INTO `books` (`book_id`, `title`, `author`, `isbn`, `published_year`, `genre`) VALUES
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 1925, 'Fiction'),
(2, 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 1960, 'Fiction'),
(3, '1984', 'George Orwell', '9780451524935', 1949, 'Dystopian'),
(4, 'sesherKobita', 'RobindronathTagor', '12313414717238712', 1999, 'nobel'),
(5, 'Civil all those body.', 'James Harmon', '9781651762844', 1989, 'Mystery'),
(6, 'Growth million watch.', 'Shawn Davis', '9781603342896', 1937, 'Romance'),
(7, 'Response claim with painting.', 'Dean Barnes', '9780654207178', 1852, 'Poetry'),
(8, 'Kid like.', 'Stephanie Parker', '9781653891757', 1930, 'Horror'),
(9, 'Network law.', 'Robert Singleton', '9780479800066', 1999, 'Fantasy'),
(10, 'Budget history decide.', 'Nicole Barber', '9780740339202', 1938, 'Science Fiction'),
(11, 'Form option themselves school natural.', 'Susan Carroll', '9781821168254', 1988, 'Science Fiction'),
(12, 'As push perhaps.', 'Nicole Brown', '9780738784878', 1854, 'Horror'),
(13, 'Mrs hard.', 'Cassandra Roman', '9781559445115', 1885, 'Poetry'),
(14, 'Detail offer bit floor.', 'Alexa White', '9780146873324', 1952, 'Romance'),
(15, 'Society word entire name million.', 'Tracy Dillon', '9780412972133', 1866, 'Fiction'),
(16, 'Financial note newspaper.', 'Katie Duran', '9781673037951', 1942, 'Mystery'),
(17, 'Safe near year.', 'Kimberly Wells', '9781019805725', 2018, 'Fiction'),
(18, 'Affect indicate.', 'Robert Fry', '9781709406034', 1918, 'Fantasy'),
(19, 'Claim government mission.', 'Jessica Gardner', '9780510972431', 2022, 'Mystery'),
(20, 'Practice guy school.', 'Lauren Jennings', '9781753324322', 1858, 'Horror'),
(21, 'Region deep free.', 'Marissa Williams', '9780442013820', 1884, 'Philosophy'),
(22, 'Resource weight bill bar growth.', 'Christina Reynolds', '9780109519306', 1990, 'Mystery'),
(23, 'Month skin.', 'Pedro Case', '9780156696678', 1950, 'Philosophy'),
(24, 'War can.', 'Marvin Collins', '9780738718163', 2010, 'Horror'),
(25, 'Stuff opportunity.', 'Mr. Ronald Spence', '9780106928729', 1908, 'Mystery'),
(26, 'Small why institution.', 'Andrea Williams', '9781324811855', 1961, 'Horror'),
(27, 'Check everyone family full vote.', 'John Shaw', '9781839165863', 1928, 'Mystery'),
(28, 'My family expert down story.', 'Evan Reyes', '9781417708024', 1915, 'Horror'),
(29, 'Practice research population short.', 'Andrew Brown', '9780668596244', 1940, 'Horror'),
(30, 'Network night name mission.', 'Jeremy Miller', '9780462820941', 1915, 'Poetry'),
(31, 'Provide manager training.', 'Catherine Reyes', '9780772276124', 1918, 'Science Fiction'),
(32, 'Environment center world.', 'John Strickland', '9780407084810', 1969, 'Science Fiction'),
(33, 'Not move four bit sign.', 'Cindy Henderson', '9781598303728', 1983, 'Mystery'),
(34, 'Future state themselves.', 'Jesus Barnes', '9780015101732', 1901, 'Fiction'),
(35, 'Kitchen floor bar capital.', 'Joshua Stephenson', '9780223014190', 1907, 'Romance'),
(36, 'Radio staff provide.', 'Danielle Floyd', '9780560272444', 1992, 'Fantasy'),
(37, 'Two probably.', 'Brad Schwartz', '9780768330731', 1880, 'Fiction'),
(38, 'Maybe save production into.', 'Sandra Webb', '9780031068903', 1864, 'Philosophy'),
(39, 'Box maintain arrive physical.', 'Jessica Villa', '9780083627042', 1979, 'Mystery'),
(40, 'Meet bring only statement offer.', 'Grant Turner', '9781014121158', 1904, 'History'),
(41, 'Rule until much leg.', 'Joshua Cooper', '9781460490884', 1975, 'Mystery'),
(42, 'Give animal focus some owner.', 'Stacy Smith', '9781374317505', 1921, 'Science Fiction'),
(43, 'Say white nothing hair art.', 'Todd Rojas', '9780549537311', 1974, 'Philosophy'),
(44, 'Another not two ahead ten.', 'James Williams', '9781010217770', 2010, 'Horror'),
(45, 'Spring less position white.', 'Beth Little', '9781466793828', 1930, 'Poetry'),
(46, 'According painting.', 'Maria Ortiz', '9781963640212', 1968, 'Biography'),
(47, 'Mention well director organization.', 'Mark Beard', '9781437210873', 1923, 'Romance'),
(48, 'Situation space health prevent type.', 'Alexander Williams', '9781863306843', 1952, 'Mystery'),
(49, 'Let down provide.', 'Thomas Jones', '9780157095135', 1978, 'Fantasy'),
(50, 'Good actually.', 'Kevin Clark', '9781404578487', 2014, 'Romance'),
(51, 'Maintain room sit.', 'Nicole Medina', '9781598755299', 1879, 'Horror'),
(52, 'Rule senior between ask.', 'Jose Hodges', '9780651609401', 1974, 'Biography'),
(53, 'Green myself financial her.', 'Bernard Curry', '9781573737555', 1945, 'Horror'),
(54, 'Economic represent my.', 'Jamie Jensen', '9781429683296', 1878, 'Science Fiction'),
(55, 'Feel simply away.', 'Tina Kemp', '9780196054001', 1886, 'Romance'),
(56, 'Support hard herself.', 'Sherry Schmidt', '9780223149946', 1864, 'History'),
(57, 'Its wife ability kid.', 'Mark Roberts', '9781790717071', 1999, 'History'),
(58, 'Surface section however interest edge.', 'Jennifer Turner', '9781420881486', 1933, 'Poetry'),
(59, 'Realize economic.', 'Russell Gregory', '9781972934272', 1989, 'Biography'),
(60, 'Not then.', 'David Ferguson', '9781729738283', 2024, 'History'),
(61, 'Floor suffer natural voice.', 'Erin Webb', '9781307751475', 1877, 'Horror'),
(62, 'Take where to service radio.', 'John Stephenson', '9780993757198', 1932, 'Fantasy'),
(63, 'Enough easy activity window.', 'Julia Peterson', '9781179788746', 1886, 'Fantasy'),
(64, 'Tonight professional.', 'Jason Sawyer', '9781651972168', 2003, 'Fantasy'),
(65, 'Leader Republican.', 'Bob Glenn', '9780253200945', 1909, 'Fiction'),
(66, 'Order article.', 'Scott Reyes', '9780568353114', 1880, 'Horror'),
(67, 'View specific away thought plant.', 'Briana Williams', '9781061571166', 1929, 'Horror'),
(68, 'Writer class.', 'Christine Sullivan', '9781626173002', 2023, 'Fiction'),
(69, 'Half figure.', 'Randall Wolfe', '9781085427104', 1861, 'Romance'),
(70, 'Young even force cost professor.', 'Sean Howard', '9781073102945', 1851, 'Poetry'),
(71, 'Provide final direction girl.', 'Victoria Davis', '9780486377131', 1937, 'Romance'),
(72, 'Age let employee.', 'Brandon Campbell MD', '9781514023082', 1949, 'Horror'),
(73, 'That song card.', 'Diana Jones', '9780639978727', 1998, 'Mystery'),
(74, 'View meeting.', 'Dr. Dawn Leach', '9781669325031', 1854, 'Philosophy'),
(75, 'Explain then itself.', 'Tiffany Potts', '9781106967923', 1964, 'Philosophy'),
(76, 'Need evidence form.', 'Mary Wood', '9780300694819', 1962, 'Fantasy'),
(77, 'Recently fear check.', 'Kenneth Ramos MD', '9780524370391', 2023, 'Mystery'),
(78, 'Picture five language concern many.', 'Raymond Perez', '9780147622600', 1911, 'Horror'),
(79, 'Far check study kind president.', 'Todd Tyler', '9781904250579', 1932, 'Science Fiction'),
(80, 'Buy face could.', 'Jennifer Saunders', '9780295308739', 1890, 'History'),
(81, 'Air economic leader space and.', 'Timothy Burns', '9780978145767', 1958, 'Fiction'),
(82, 'Us room.', 'Andrea Bullock', '9780143137672', 1944, 'Fantasy'),
(83, 'Democrat best edge meeting.', 'Dennis Bradford', '9781748563347', 1930, 'Biography'),
(84, 'Center appear others.', 'Donna Cherry', '9781574823042', 1936, 'Philosophy'),
(85, 'Worker see hope road real.', 'Ricky Jones', '9780605271258', 1912, 'Fiction'),
(86, 'Activity work improve those unit.', 'Zachary Norris', '9781147797954', 1984, 'Philosophy'),
(87, 'Care door fish there.', 'Jonathan Calderon', '9780072564075', 1966, 'Fantasy'),
(88, 'His clear not vote home.', 'Hannah Huff', '9780368645662', 1889, 'Biography'),
(89, 'Paper where specific.', 'Donald Ramirez', '9780876062098', 1867, 'Science Fiction'),
(90, 'Director week against billion all.', 'Anita Fisher', '9780073955186', 1899, 'Romance'),
(91, 'Future they.', 'Joseph Clark', '9781576220795', 1856, 'History'),
(92, 'Within sense main beat.', 'Christopher Simmons', '9780876684214', 1960, 'Poetry'),
(93, 'Her baby.', 'Christina Myers', '9781675743805', 2023, 'Horror'),
(94, 'Series offer bag community.', 'Dennis Mooney', '9780707866024', 2004, 'Romance'),
(95, 'Technology owner enjoy like buy.', 'James Johns', '9780301282794', 1959, 'Romance'),
(96, 'Need organization ahead mean.', 'Jennifer Sullivan', '9781076572202', 1935, 'Science Fiction'),
(97, 'Alone industry decision.', 'David Taylor', '9781511727778', 1950, 'Fantasy'),
(98, 'Onto property.', 'Chase Shields', '9780313962691', 1884, 'Mystery'),
(99, 'Theory daughter.', 'Justin Davis', '9781963872187', 1926, 'Biography'),
(100, 'Address during authority his including.', 'Richard Reed', '9780240834610', 2020, 'Mystery'),
(101, 'Usually military.', 'Jeremy Castro', '9781740132695', 2005, 'Horror'),
(102, 'Whether save hotel try.', 'Matthew Douglas', '9781493628889', 1961, 'History'),
(103, 'Less president better note.', 'Beverly Martin', '9781657699991', 1884, 'Philosophy'),
(104, 'Two order value right.', 'James Wright', '9780406767547', 1947, 'Horror'),
(105, 'Sesherkobita', 'Robindronath tagor', '1311443514123', 2000, 'Romantic'),
(106, 'The Alchemist', 'Paulo Coelho', '1232134143', 1999, 'History'),
(107, 'asdas', 'asdsadsad', '12312313', 2001, 'history');

INSERT INTO `loans` (`loan_id`, `copy_id`, `user_id`, `issued_on`, `returned_on`) VALUES
(1, 4, 1, '2025-06-05', NULL);

INSERT INTO `users` (`user_id`, `name`, `email`, `phone`) VALUES
(1, 'Alice Johnson', 'alice@example.com', '1234567890'),
(2, 'Bob Smith', 'bob@example.com', '0987654321'),
(3, 'saikat', 'saikatsikder2911@gmail.com', '01703594819'),
(4, 'Saikat', 'mdhsaikts@gmail.com', '1323131312'),
(5, 'User5', 'user5@example.com', '9000000005'),
(6, 'User6', 'user6@example.com', '9000000006'),
(7, 'User7', 'user7@example.com', '9000000007'),
(8, 'User8', 'user8@example.com', '9000000008'),
(9, 'User9', 'user9@example.com', '9000000009'),
(10, 'User10', 'user10@example.com', '9000000010'),
(11, 'User11', 'user11@example.com', '9000000011'),
(12, 'User12', 'user12@example.com', '9000000012'),
(13, 'User13', 'user13@example.com', '9000000013'),
(14, 'User14', 'user14@example.com', '9000000014'),
(15, 'User15', 'user15@example.com', '9000000015'),
(16, 'User16', 'user16@example.com', '9000000016'),
(17, 'User17', 'user17@example.com', '9000000017'),
(18, 'User18', 'user18@example.com', '9000000018'),
(19, 'User19', 'user19@example.com', '9000000019'),
(20, 'User20', 'user20@example.com', '9000000020'),
(21, 'User21', 'user21@example.com', '9000000021'),
(22, 'User22', 'user22@example.com', '9000000022'),
(23, 'User23', 'user23@example.com', '9000000023'),
(24, 'User24', 'user24@example.com', '9000000024'),
(25, 'User25', 'user25@example.com', '9000000025'),
(26, 'User26', 'user26@example.com', '9000000026'),
(27, 'User27', 'user27@example.com', '9000000027'),
(28, 'User28', 'user28@example.com', '9000000028'),
(29, 'User29', 'user29@example.com', '9000000029'),
(30, 'User30', 'user30@example.com', '9000000030'),
(31, 'User31', 'user31@example.com', '9000000031'),
(32, 'User32', 'user32@example.com', '9000000032'),
(33, 'User33', 'user33@example.com', '9000000033'),
(34, 'User34', 'user34@example.com', '9000000034'),
(35, 'User35', 'user35@example.com', '9000000035'),
(36, 'User36', 'user36@example.com', '9000000036'),
(37, 'User37', 'user37@example.com', '9000000037'),
(38, 'User38', 'user38@example.com', '9000000038'),
(39, 'User39', 'user39@example.com', '9000000039'),
(40, 'User40', 'user40@example.com', '9000000040'),
(41, 'User41', 'user41@example.com', '9000000041'),
(42, 'User42', 'user42@example.com', '9000000042'),
(43, 'User43', 'user43@example.com', '9000000043'),
(44, 'User44', 'user44@example.com', '9000000044'),
(45, 'User45', 'user45@example.com', '9000000045'),
(46, 'User46', 'user46@example.com', '9000000046'),
(47, 'User47', 'user47@example.com', '9000000047'),
(48, 'User48', 'user48@example.com', '9000000048'),
(49, 'User49', 'user49@example.com', '9000000049'),
(50, 'User50', 'user50@example.com', '9000000050'),
(51, 'User51', 'user51@example.com', '9000000051'),
(52, 'User52', 'user52@example.com', '9000000052'),
(53, 'User53', 'user53@example.com', '9000000053'),
(54, 'User54', 'user54@example.com', '9000000054'),
(55, 'User55', 'user55@example.com', '9000000055'),
(56, 'User56', 'user56@example.com', '9000000056'),
(57, 'User57', 'user57@example.com', '9000000057'),
(58, 'User58', 'user58@example.com', '9000000058'),
(59, 'User59', 'user59@example.com', '9000000059'),
(60, 'User60', 'user60@example.com', '9000000060'),
(61, 'User61', 'user61@example.com', '9000000061'),
(62, 'User62', 'user62@example.com', '9000000062'),
(63, 'User63', 'user63@example.com', '9000000063'),
(64, 'User64', 'user64@example.com', '9000000064'),
(65, 'User65', 'user65@example.com', '9000000065'),
(66, 'User66', 'user66@example.com', '9000000066'),
(67, 'User67', 'user67@example.com', '9000000067'),
(68, 'User68', 'user68@example.com', '9000000068'),
(69, 'User69', 'user69@example.com', '9000000069'),
(70, 'User70', 'user70@example.com', '9000000070'),
(71, 'User71', 'user71@example.com', '9000000071'),
(72, 'User72', 'user72@example.com', '9000000072'),
(73, 'User73', 'user73@example.com', '9000000073'),
(74, 'User74', 'user74@example.com', '9000000074'),
(75, 'User75', 'user75@example.com', '9000000075'),
(76, 'User76', 'user76@example.com', '9000000076'),
(77, 'User77', 'user77@example.com', '9000000077'),
(78, 'User78', 'user78@example.com', '9000000078'),
(79, 'User79', 'user79@example.com', '9000000079'),
(80, 'User80', 'user80@example.com', '9000000080'),
(81, 'User81', 'user81@example.com', '9000000081'),
(82, 'User82', 'user82@example.com', '9000000082'),
(83, 'User83', 'user83@example.com', '9000000083'),
(84, 'User84', 'user84@example.com', '9000000084'),
(85, 'User85', 'user85@example.com', '9000000085'),
(86, 'User86', 'user86@example.com', '9000000086'),
(87, 'User87', 'user87@example.com', '9000000087'),
(88, 'User88', 'user88@example.com', '9000000088'),
(89, 'User89', 'user89@example.com', '9000000089'),
(90, 'User90', 'user90@example.com', '9000000090'),
(91, 'User91', 'user91@example.com', '9000000091'),
(92, 'User92', 'user92@example.com', '9000000092'),
(93, 'User93', 'user93@example.com', '9000000093'),
(94, 'User94', 'user94@example.com', '9000000094'),
(95, 'User95', 'user95@example.com', '9000000095'),
(96, 'User96', 'user96@example.com', '9000000096'),
(97, 'User97', 'user97@example.com', '9000000097'),
(98, 'User98', 'user98@example.com', '9000000098'),
(99, 'User99', 'user99@example.com', '9000000099'),
(100, 'User100', 'user100@example.com', '9000000100'),
(101, 'Tisha', 'tisha@gmail.com', '01734535355'),
(102, 'Rehana Akter', 'rehanaakter@gmail.com', '01703594820');



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `admin`;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `bookcopies`;
CREATE TABLE `bookcopies` (
  `copy_id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) DEFAULT NULL,
  `status` enum('available','borrowed') NOT NULL DEFAULT 'available',
  PRIMARY KEY (`copy_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `bookcopies_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `published_year` int(11) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `fines`;
CREATE TABLE `fines` (
  `fine_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `paid` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`fine_id`),
  KEY `loan_id` (`loan_id`),
  CONSTRAINT `fines_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `loans`;
CREATE TABLE `loans` (
  `loan_id` int(11) NOT NULL AUTO_INCREMENT,
  `copy_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `issued_on` date DEFAULT curdate(),
  `returned_on` date DEFAULT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `copy_id` (`copy_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`copy_id`) REFERENCES `bookcopies` (`copy_id`),
  CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `admin` (`admin_id`, `full_name`, `position`, `age`, `joining_date`, `email`, `username`, `password_hash`, `is_active`) VALUES
(1, 'Md. Saikat Sikder', 'Librariyan', 22, '2025-08-07 02:05:58', 'saikatsikder2911@gmail.com', 'mdhsaikats', '29112003', 1);
INSERT INTO `bookcopies` (`copy_id`, `book_id`, `status`) VALUES
(49, 1, 'available'),
(50, 1, 'borrowed'),
(51, 2, 'available'),
(52, 2, 'available'),
(53, 3, 'available'),
(54, 3, 'borrowed'),
(55, 4, 'available'),
(56, 4, 'available'),
(57, 5, 'borrowed'),
(58, 6, 'borrowed'),
(59, 7, 'available'),
(60, 8, 'available'),
(61, 9, 'available'),
(62, 10, 'borrowed'),
(63, 11, 'available'),
(64, 12, 'available'),
(65, 13, 'borrowed'),
(66, 14, 'available'),
(67, 15, 'available'),
(68, 16, 'available'),
(69, 17, 'available'),
(70, 18, 'available'),
(71, 19, 'borrowed'),
(72, 20, 'available'),
(73, 21, 'available'),
(74, 21, 'available');
INSERT INTO `books` (`book_id`, `title`, `author`, `isbn`, `published_year`, `genre`) VALUES
(1, 'The Catcher in the Rye', 'J.D. Salinger', '9780316769488', 1951, 'Fiction'),
(2, 'Pride and Prejudice', 'Jane Austen', '9780141439518', 1813, 'Romance'),
(3, 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', 1937, 'Fantasy'),
(4, 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 2011, 'Psychology'),
(5, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', '9780062316097', 2014, 'History'),
(6, 'The Silent Patient', 'Alex Michaelides', '9781250301697', 2019, 'Thriller'),
(7, 'Becoming', 'Michelle Obama', '9781524763138', 2018, 'Biography'),
(8, 'Educated', 'Tara Westover', '9780399590504', 2018, 'Memoir'),
(9, 'Atomic Habits', 'James Clear', '9780735211292', 2018, 'Self-help'),
(10, 'The Midnight Library', 'Matt Haig', '9780525559474', 2020, 'Fantasy'),
(11, 'Where the Crawdads Sing', 'Delia Owens', '9780735219090', 2018, 'Mystery'),
(12, 'It Ends With Us', 'Colleen Hoover', '9781501110368', 2016, 'Romance'),
(13, 'Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 1997, 'Finance'),
(14, 'Zero to One', 'Peter Thiel', '9780804139298', 2014, 'Business'),
(15, 'The Lean Startup', 'Eric Ries', '9780307887894', 2011, 'Business'),
(16, 'Cracking the Coding Interview', 'Gayle Laakmann McDowell', '9780984782857', 2015, 'Education'),
(17, 'Clean Code', 'Robert C. Martin', '9780132350884', 2008, 'Programming'),
(18, 'The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 1999, 'Programming'),
(19, 'Design Patterns', 'Erich Gamma', '9780201633610', 1994, 'Programming'),
(20, 'Harry Potter and the Sorcerer\'s Stone', 'J.K. Rowling', '9780590353427', 1997, 'Fantasy'),
(21, 'Amar bagan', 'saikat', '1311443514141', 2025, 'History');
INSERT INTO `fines` (`fine_id`, `loan_id`, `amount`, `paid`) VALUES
(1, 2, '210.00', 0),
(2, 2, '210.00', 1),
(3, 3, '210.00', 0),
(4, 4, '210.00', 0),
(6, 3, '210.00', 1),
(7, 4, '210.00', 1);
INSERT INTO `loans` (`loan_id`, `copy_id`, `user_id`, `issued_on`, `returned_on`) VALUES
(1, 68, 21, '2025-08-07', '2025-08-07'),
(2, 49, 21, '2025-07-07', '2025-08-07'),
(3, 49, 21, '2025-07-07', '2025-08-07'),
(4, 53, 21, '2025-07-07', '2025-08-07'),
(5, 57, 21, '2025-08-07', NULL);
INSERT INTO `users` (`user_id`, `name`, `email`, `phone`) VALUES
(1, 'Arif Hossain', 'arif.hossain@gmail.com', '01720123456'),
(2, 'Riya Sultana', 'riya.sultana@example.com', '01711223344'),
(3, 'Tanvir Ahmed', 'tanvir.ahmed@diu.edu.bd', '01610345678'),
(4, 'Sadia Noor', 'sadia.noor@gmail.com', '01521234567'),
(5, 'Imran Kabir', 'imran.kabir@outlook.com', '01930345678'),
(6, 'Nusrat Jahan', 'nusrat.jahan@yahoo.com', '01744556677'),
(7, 'Hasibul Hasan', 'hasibul@protonmail.com', '01312345678'),
(8, 'Farzana Chowdhury', 'farzana.c@gmail.com', '01799221100'),
(9, 'Rakibul Islam', 'rakibul.i@gmail.com', '01688889999'),
(10, 'Mehjabin Nahar', 'mehjabin@diu.edu.bd', '01555556666'),
(11, 'Sajib Roy', 'sajib.roy@gmail.com', '01912223344'),
(12, 'Lubna Tania', 'lubna.tania@hotmail.com', '01476543210'),
(13, 'Towhidur Rahman', 'towhid98@gmail.com', '01888885555'),
(14, 'Sumaiya Akter', 'sumaiya.akter@diu.edu.bd', '01799998888'),
(15, 'Maruf Hossain', 'marufhossain@gmail.com', '01510001111'),
(16, 'Sharmin Sultana', 'sharminsultana@yahoo.com', '01320112233'),
(17, 'Anisur Rahman', 'anisur@library.org', '01976543210'),
(18, 'Fariha Khan', 'fariha.k@outlook.com', '01844443322'),
(19, 'Shahriar Alam', 'shahriar.alam@example.com', '01730303030'),
(20, 'Tanjina Toma', 'toma.tanjina@diu.edu.bd', '01666669999'),
(21, 'Saikat', 'saikatsikder2911@gmail.com', '01703594819');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
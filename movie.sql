
CREATE DATABASE IF NOT EXISTS movie_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE movie_booking;


-- 電影表
DROP TABLE IF EXISTS movies;
CREATE TABLE movies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL COMMENT '電影時長(分鐘)',
    genre VARCHAR(100),
    rating VARCHAR(10) COMMENT '分級(如: 普遍級, 保護級, 輔導級, 限制級)',
    poster_url VARCHAR(500),
    release_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 影廳表
DROP TABLE IF EXISTS theaters;
CREATE TABLE theaters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity INT NOT NULL COMMENT '總座位數',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 場次表
CREATE TABLE showtimes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movie_id INT NOT NULL,
    theater_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_seats INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE,
    INDEX idx_movie_date (movie_id, show_date),
    INDEX idx_date_time (show_date, show_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 座位表
CREATE TABLE seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    theater_id INT NOT NULL,
    row_label VARCHAR(5) NOT NULL COMMENT '排號(A-Z)',
    seat_number INT NOT NULL COMMENT '座位號碼',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE,
    UNIQUE KEY unique_seat (theater_id, row_label, seat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 訂單表
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10, 2) NOT NULL,
    booking_status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    INDEX idx_email (customer_email),
    INDEX idx_status (booking_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 訂票座位關聯表
CREATE TABLE booking_seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    seat_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_seat (booking_id, seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 已訂座位表(用於快速查詢某場次已訂座位)
CREATE TABLE showtime_booked_seats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    showtime_id INT NOT NULL,
    seat_id INT NOT NULL,
    booking_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE KEY unique_showtime_seat (showtime_id, seat_id),
    INDEX idx_showtime (showtime_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 測試資料
-- ============================================

-- 插入電影資料
INSERT INTO movies (title, description, duration, genre, rating, poster_url, release_date) VALUES
('玩命關頭X', '唐老大與他的家人必須面對過去最危險的敵人。在這場終極對決中，他們將突破極限，為保護所愛之人奮戰到底。', 142, '動作/冒險', '保護級', 'https://image.tmdb.org/t/p/w500/fiVW06jE7z9YnO4trhaMEdclSiC.jpg', '2024-05-15'),
('奧本海默', '「原子彈之父」羅伯特·奧本海默的傳奇故事。他如何領導曼哈頓計劃，開發出改變世界的原子彈，又如何面對這項發明帶來的道德困境。', 180, '劇情/傳記', '輔導級', 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', '2024-07-20'),
('芭比', '芭比在芭比樂園過著完美的生活，直到有一天她開始質疑一切。她踏上了前往真實世界的冒險旅程，在那裡發現了做人的真諦。', 114, '喜劇/奇幻', '普遍級', 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', '2024-07-25'),
('沙丘：第二部', '保羅·亞崔迪與弗瑞曼人聯手復仇，對抗摧毀他家族的陰謀者。面對愛人與已知宇宙命運的抉擇，他必須做出艱難的決定。', 166, '科幻/冒險', '輔導級', 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', '2024-03-01'),
('功夫熊貓4', '阿波必須訓練新的龍戰士，同時面對一個能夠召喚所有過往惡棍的邪惡巫師。這是一場關於傳承與成長的冒險。', 94, '動畫/喜劇', '普遍級', 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg', '2024-03-08');

-- 插入影廳資料
INSERT INTO theaters (name, capacity) VALUES
('1號廳 (豪華廳)', 100),
('2號廳 (IMAX廳)', 150),
('3號廳 (標準廳)', 80),
('4號廳 (VIP廳)', 60);

-- 為每個影廳建立座位
-- 1號廳: 10排 x 10座位 = 100座位
INSERT INTO seats (theater_id, row_label, seat_number)
SELECT 1, row_label, seat_number
FROM (
    SELECT CHAR(64 + units.n + tens.n * 10) as row_label, seat.n as seat_number
    FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) units
    CROSS JOIN (SELECT 0 n UNION SELECT 1) tens
    CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
                UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) seat
    WHERE units.n + tens.n * 10 < 10
) seat_data;

-- 2號廳: 10排 x 15座位 = 150座位
INSERT INTO seats (theater_id, row_label, seat_number)
SELECT 2, row_label, seat_number
FROM (
    SELECT CHAR(64 + units.n + tens.n * 10) as row_label, seat.n as seat_number
    FROM (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) units
    CROSS JOIN (SELECT 0 n UNION SELECT 1) tens
    CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
                UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
                UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15) seat
    WHERE units.n + tens.n * 10 < 10
) seat_data;

INSERT INTO seats (theater_id, row_label, seat_number)
SELECT 3, row_label, seat_number
FROM (
    SELECT CHAR(64 + r.n) as row_label, seat.n as seat_number
    FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) r
    CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
                UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) seat
) AS seat_data;

-- 4號廳: 6排 x 10座位 = 60座位
INSERT INTO seats (theater_id, row_label, seat_number)
SELECT 4, row_label, seat_number
FROM (
    SELECT CHAR(64 + r.n) as row_label, s.n as seat_number
    FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
          UNION SELECT 5 UNION SELECT 6) r
    CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
                UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) s
) AS seat_data_4;

-- 插入場次資料(接下來幾天的場次)
INSERT INTO showtimes (movie_id, theater_id, show_date, show_time, price, available_seats) VALUES
-- 玩命關頭X (movie_id = 1)
(1, 1, CURDATE(), '10:30:00', 280, 100),
(1, 1, CURDATE(), '14:00:00', 300, 100),
(1, 2, CURDATE(), '18:00:00', 350, 150),
(1, 2, CURDATE(), '21:00:00', 350, 150),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00', 280, 100),
(1, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:30:00', 350, 150),
(2, 2, CURDATE(), '15:30:00', 380, 150),
(2, 2, CURDATE(), '19:30:00', 380, 150),
(2, 4, CURDATE(), '20:00:00', 450, 60),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00', 380, 150),
(3, 3, CURDATE(), '11:00:00', 250, 80),
(3, 3, CURDATE(), '16:00:00', 280, 80),
(3, 1, CURDATE(), '20:30:00', 300, 100),
(3, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00', 250, 80),
(4, 2, CURDATE(), '13:00:00', 380, 150),
(4, 4, CURDATE(), '17:00:00', 450, 60),
(4, 2, CURDATE(), '21:30:00', 380, 150),
(4, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', 380, 150),
(5, 3, CURDATE(), '10:00:00', 220, 80),
(5, 1, CURDATE(), '12:30:00', 250, 100),
(5, 3, CURDATE(), '15:00:00', 250, 80),
(5, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', 250, 100);


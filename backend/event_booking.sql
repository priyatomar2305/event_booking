-- Database: event_booking
CREATE DATABASE IF NOT EXISTS event_booking;
USE event_booking;

-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    img VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_date (date)
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    qr_code_url VARCHAR(500),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_email (email),
    INDEX idx_event_id (event_id)
);

-- Insert sample events
INSERT INTO events (title, description, location, date, total_seats, available_seats, price, img) VALUES
('Tech Summit 2024', 'Annual technology conference with industry leaders', 'San Francisco, CA', '2024-12-15 09:00:00', 500, 450, 299.99, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'),
('Music Festival', '3-day music festival with top artists', 'Los Angeles, CA', '2024-11-20 14:00:00', 10000, 8500, 199.99, 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3'),
('Startup Workshop', 'Hands-on workshop for aspiring entrepreneurs', 'New York, NY', '2024-11-10 10:00:00', 100, 75, 149.99, 'https://images.unsplash.com/photo-1559136555-9303baea8ebd'),
('Food Expo', 'Culinary experience with master chefs', 'Chicago, IL', '2024-12-05 11:00:00', 300, 250, 89.99, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0'),
('Yoga Retreat', 'Weekend wellness retreat', 'Miami, FL', '2024-11-25 08:00:00', 50, 30, 249.99, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b');
-- Fix database structure to match application requirements
USE library1;

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS photo VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS favorite_book_id INT DEFAULT NULL;

-- Add missing columns to books table
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS photo VARCHAR(255) DEFAULT NULL;

-- Add missing columns to authors table
ALTER TABLE authors 
ADD COLUMN IF NOT EXISTS photo VARCHAR(255) DEFAULT NULL;

-- Add foreign key constraint for favorite_book_id if it doesn't exist
-- First check if constraint exists, if not add it
SET @constraint_exists = (SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'library1' 
    AND TABLE_NAME = 'users' 
    AND CONSTRAINT_NAME = 'fk_favorite_book');

SET @sql = IF(@constraint_exists = 0, 
    'ALTER TABLE users ADD CONSTRAINT fk_favorite_book FOREIGN KEY (favorite_book_id) REFERENCES books (book_id)', 
    'SELECT "Constraint already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (review_id),
  UNIQUE KEY unique_review (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (book_id) REFERENCES books(book_id)
);

-- Update existing books with descriptions
UPDATE books SET description = CASE book_id
  WHEN 1 THEN 'A touching story about overcoming personal struggles through silence and introspection.'
  WHEN 2 THEN 'Short stories capturing the beauty and complexity of daily moments.'
  WHEN 3 THEN 'Tales inspired by the ever-changing winds and the mysteries they carry.'
  WHEN 4 THEN 'A narrative exploring the balance between chaos and peace.'
  WHEN 5 THEN 'An evocative journey of discovery along the endless horizon.'
  WHEN 6 THEN 'Stories about transformation and the winds that guide us.'
  WHEN 7 THEN 'A poetic exploration of the inner paths we all travel.'
  WHEN 8 THEN 'A dramatic tale set against a backdrop of uncertain skies.'
  WHEN 9 THEN 'Reflections on moments of quiet and their powerful meanings.'
  WHEN 10 THEN 'A heartfelt story revolving around a final farewell.'
  WHEN 11 THEN 'Exploring what lies beyond spoken language and written text.'
  WHEN 12 THEN 'A vivid portrayal of urban life through its vibrant colors.'
  WHEN 13 THEN 'A metaphorical story about burdens and relief brought by rain.'
  WHEN 14 THEN 'A mysterious journey through the darkness and light of the night.'
  WHEN 15 THEN 'Stories that capture the fleeting nature of memories.'
  WHEN 16 THEN 'Exploring the roots and beginnings of our existence.'
  WHEN 17 THEN 'Small glimmers of hope in challenging times.'
  WHEN 18 THEN 'The marks left by life\'s journeys and struggles.'
  WHEN 19 THEN 'A perspective shift to see the world from a new angle.'
  WHEN 20 THEN 'Stories about unexpected changes and pauses in life.'
END
WHERE description IS NULL;

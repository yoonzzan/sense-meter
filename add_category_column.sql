-- Add category column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'daily';

-- Optional: Add a check constraint to ensure only valid categories are entered
-- ALTER TABLE posts ADD CONSTRAINT check_category CHECK (category IN ('work', 'relationship', 'daily', 'hobby', 'consumption', 'service', 'content', 'etc'));

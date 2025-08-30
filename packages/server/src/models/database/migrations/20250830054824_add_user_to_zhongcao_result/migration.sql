/*
  Safe migration to add user_id to ZhongcaoResult table
  
  Steps:
  1. Add nullable user_id column
  2. Update existing records to assign to first user (or delete if no users exist)
  3. Make column NOT NULL
  4. Add foreign key constraint
*/

-- Step 1: Add nullable user_id column
ALTER TABLE "ZhongcaoResult" ADD COLUMN "user_id" INTEGER;

-- Step 2: Update existing records - assign to first user if exists, otherwise delete orphaned records
DO $$
DECLARE
    first_user_id INTEGER;
BEGIN
    -- Get the first user ID
    SELECT id INTO first_user_id FROM "User" ORDER BY id LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Assign existing records to first user
        UPDATE "ZhongcaoResult" SET "user_id" = first_user_id WHERE "user_id" IS NULL;
    ELSE
        -- No users exist, delete orphaned records
        DELETE FROM "ZhongcaoResult" WHERE "user_id" IS NULL;
    END IF;
END $$;

-- Step 3: Make column NOT NULL
ALTER TABLE "ZhongcaoResult" ALTER COLUMN "user_id" SET NOT NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE "ZhongcaoResult" ADD CONSTRAINT "ZhongcaoResult_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

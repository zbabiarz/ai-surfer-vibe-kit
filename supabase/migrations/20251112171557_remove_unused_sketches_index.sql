/*
  # Remove Unused Index

  1. Changes
    - Drop the unused `sketches_user_id_idx` index on the `sketches` table
    - This index has not been used and removing it will improve performance and reduce storage overhead

  2. Security
    - No security implications as this only removes an unused index
    - The foreign key constraint `sketches_user_id_fkey` remains in place
*/

DROP INDEX IF EXISTS sketches_user_id_idx;

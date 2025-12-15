-- DropIndex
DROP INDEX "documents_geminiFileUri_key";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "extractedText" TEXT,
ALTER COLUMN "geminiFileUri" SET DEFAULT '',
ALTER COLUMN "geminiFileName" SET DEFAULT '';

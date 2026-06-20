-- AlterTable
ALTER TABLE "Wrestler" ADD COLUMN "personalScore" INTEGER;
ALTER TABLE "Wrestler" ADD COLUMN "personalVotes" INTEGER NOT NULL DEFAULT 0;

/*
  Warnings:

  - You are about to drop the `TemplateFork` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `Template` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TemplateFork_originalId_forkedId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TemplateFork";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "templateId" INTEGER NOT NULL,
    CONSTRAINT "UserTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTemplate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Template" ("code", "createdAt", "description", "id", "language", "tags", "title", "updatedAt") SELECT "code", "createdAt", "description", "id", "language", "tags", "title", "updatedAt" FROM "Template";
DROP TABLE "Template";
ALTER TABLE "new_Template" RENAME TO "Template";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserTemplate_userId_templateId_key" ON "UserTemplate"("userId", "templateId");

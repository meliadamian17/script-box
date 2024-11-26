-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'python',
    "defaultTheme" TEXT NOT NULL DEFAULT 'dark',
    "enableVim" BOOLEAN NOT NULL DEFAULT false,
    "relativeLineNumbers" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

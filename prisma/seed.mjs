import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Fetch all existing users
  const users = await prisma.user.findMany();

  for (const user of users) {
    // Check if the user already has preferences
    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      console.log(`Creating preferences for user: ${user.email}`);
      // Create default preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          defaultLanguage: "python",
          defaultTheme: "dark",
          enableVim: false,
          relativeLineNumbers: false,
        },
      });
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

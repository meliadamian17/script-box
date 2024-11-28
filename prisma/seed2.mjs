import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function seedData() {
  console.log("Seeding data...");

  // Step 1: Generate Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return prisma.user.create({
        data: {
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          profileImage: faker.image.avatar(),
          phoneNumber: faker.phone.number(),
          role: "USER",
        },
      });
    })
  );

  // Step 2: Generate Templates
  const templates = await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => {
      return prisma.template.create({
        data: {
          title: faker.helpers.arrayElement([
            "JavaScript Basics",
            "Python for Beginners",
            "HTML Boilerplate",
            "React Component Template",
            "SQL Query Snippets",
          ]),
          description: faker.lorem.sentence(),
          code: `// Example code snippet #${i + 1}\n${faker.lorem.lines(5)}`,
          language: faker.helpers.arrayElement(["JavaScript", "Python", "HTML", "SQL"]),
          tags: faker.helpers.arrayElement(["beginner", "frontend", "backend", "database"]),
          userId: faker.helpers.arrayElement(users).id,
        },
      });
    })
  );

  // Step 3: Generate Blog Posts
  const blogPosts = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      const randomTemplates = faker.helpers.arrayElements(templates, Math.floor(Math.random() * (50 - (-5) + 1)) + (-5));
      return prisma.blogPost.create({
        data: {
          title: faker.lorem.words(5),
          description: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(3),
          tags: faker.helpers.arrayElement(["tutorial", "guide", "tips"]),
          authorId: faker.helpers.arrayElement(users).id,
          templates: {
            connect: randomTemplates.map((template) => ({ id: template.id })),
          },
          rating: Math.floor(Math.random() * (50 - (-5) + 1)) + (-5), // Some posts pre-rated
        },
      });
    })
  );

  // Step 4: Generate Comments for Blog Posts
  await Promise.all(
    blogPosts.map(async (post) => {
      const comments = await Promise.all(
        Array.from({ length: Math.floor(Math.random() * (10 - (5) + 1)) + (5) }).map(() => {
          return prisma.comment.create({
            data: {
              content: faker.lorem.sentences(2),
              rating: Math.floor(Math.random() * (10 - (-3) + 1)) + (-3), // Pre-voted comments
              userId: faker.helpers.arrayElement(users).id,
              blogPostId: post.id,
            },
          });
        })
      );

      // Add replies to some comments
      const parentComment = faker.helpers.arrayElement(comments);
      if (parentComment) {
        await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
            userId: faker.helpers.arrayElement(users).id,
            parentId: parentComment.id,
            blogPostId: post.id,
          },
        });
      }
    })
  );

  console.log("Data seeded successfully!");
}

seedData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

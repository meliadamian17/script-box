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
    }),
  );

  const helloWorldExamples = {
    python: 'print("Hello, World!")',
    javascript: 'console.log("Hello, World!");',
    cpp: '#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
    c: '#include <stdio.h>\nint main() {\n printf("Hello, World!");\n     return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    go: 'package main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    php: '<?php\necho "Hello, World!";\n',
    rust: 'fn main() {\n    println!("Hello, World!");\n}',
    r: 'print("Hello, World!")',
    elixir: 'IO.puts("Hello World!")',
    csharp:
      'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
  };

  const supportedLanguages = Object.keys(helloWorldExamples);

  // Step 2: Generate Templates
  const templates = await Promise.all(
    Array.from({ length: 20 }).map(async (_, i) => {
      const language = faker.helpers
        .arrayElement(supportedLanguages)
        .toLowerCase();
      return prisma.template.create({
        data: {
          title: faker.helpers.arrayElement([
            "Basics of " + language,
            "Hello, World in " + language,
            "Getting Started with " + language,
          ]),
          description: `A simple "Hello, World!" program in ${language}.`,
          code: helloWorldExamples[language],
          language: language,
          tags: faker.helpers.arrayElement([
            "beginner",
            "language basics",
            language.toLowerCase(),
          ]),
          userId: faker.helpers.arrayElement(users).id,
        },
      });
    }),
  );

  // Step 3: Generate Blog Posts
  const blogPosts = await Promise.all(
    Array.from({ length: 30 }).map(async () => {
      const randomTemplates = faker.helpers.arrayElements(
        templates,
        Math.floor(Math.random() * (50 - -5 + 1)) + -5,
      );
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
          rating: Math.floor(Math.random() * (50 - -5 + 1)) + -5, // Some posts pre-rated
        },
      });
    }),
  );

  // Step 4: Generate Comments for Blog Posts
  await Promise.all(
    blogPosts.map(async (post) => {
      const comments = await Promise.all(
        Array.from({
          length: Math.floor(Math.random() * (10 - 5 + 1)) + 5,
        }).map(() => {
          return prisma.comment.create({
            data: {
              content: faker.lorem.sentences(2),
              rating: Math.floor(Math.random() * (10 - -3 + 1)) + -3, // Pre-voted comments
              userId: faker.helpers.arrayElement(users).id,
              blogPostId: post.id,
            },
          });
        }),
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
    }),
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

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Create initial users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "qpzm@example.com" },
      update: {},
      create: {
        name: "qpzm",
        email: "qpzm@example.com",
        password: "qpzm",
        role: "user",
        balance: 10000,
      },
    }),
    prisma.user.upsert({
      where: { email: "karl@example.com" },
      update: {},
      create: {
        name: "karl",
        email: "karl@example.com",
        password: "karl",
        role: "user",
        balance: 10000,
      },
    }),
    prisma.user.upsert({
      where: { email: "teddev@example.com" },
      update: {},
      create: {
        name: "teddev",
        email: "teddev@example.com",
        password: "teddev",
        role: "user",
        balance: 10000,
      },
    }),
    prisma.user.upsert({
      where: { email: "ky@example.com" },
      update: {},
      create: {
        name: "ky",
        email: "ky@example.com",
        password: "ky",
        role: "user",
        balance: 10000,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        name: "admin",
        email: "admin@example.com",
        password: "admin",
        role: "admin",
        balance: 10000,
      },
    }),
  ]);

  console.log(
    "Created users:",
    users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
    }))
  );
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

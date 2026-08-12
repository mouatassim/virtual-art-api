import { PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "../src/utils/hash";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.log("Seed skipped in production.");
    return;
  }

  const { hash, salt } = hashPassword("Dev@1234567890!");

  const user = await prisma.user.upsert({
    where: { email: "demo@virtual-art.app" },
    update: {},
    create: {
      email: "demo@virtual-art.app",
      firstName: "Demo",
      lastName: "Artist",
      hashedPassword: `${salt}:${hash}`,
      isActive: true,
      bio: "Demo artist account for development.",
    },
  });

  console.log(`Demo user: ${user.email} (id: ${user.id})`);

  const existingExpo = await prisma.expo.findFirst({ where: { userId: user.id } });
  if (!existingExpo) {
    const expo = await prisma.expo.create({
      data: {
        userId: user.id,
        title: "Open Walls",
        subtitle: "A virtual exhibition",
        isPublished: true,
        partitionLength: 8,
        partitionThickness: 0.3,
        partitionHeight: 3.4,
      },
    });
    console.log(`Demo expo created (id: ${expo.id})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

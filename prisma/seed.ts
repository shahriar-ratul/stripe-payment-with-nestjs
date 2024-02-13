import { PrismaClient } from '@prisma/client';

import { faker } from "@faker-js/faker";


const prisma = new PrismaClient();


async function main() {
    console.log(`Start seeding ...`);

    for (let i = 0; i < 10000; i++) {
        console.log(`Creating product ${i}`);
        await prisma.product.create({
            data: {
                name: faker.commerce.productName(),
                stock: 500,
                price: Number(faker.commerce.price()),
                description: faker.commerce.productDescription(),
            },
        });
        console.log(`done ${i} product`);
    }




    console.log(`Seeding finished.`);
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

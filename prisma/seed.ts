import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_USER_EMAIL || 'admin@fridge.com'
  const passwordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'admin123', 10)
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: passwordHash,
      products: {
        create: [
          {
            name: 'Milk',
            quantity: '1L',
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 5)), // Expires in 5 days
          },
          {
            name: 'Eggs',
            quantity: '12 pack',
            expiryDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Expired yesterday
          }
        ]
      }
    },
  })

  const dictItems = [
    { name: 'Milk', defaultQty: '1L' },
    { name: 'Eggs', defaultQty: '12 pack' },
    { name: 'Butter', defaultQty: '250g' },
  ]

  for (const item of dictItems) {
    await prisma.dictionary.upsert({
      where: {
        name_brand: {
          name: item.name,
          brand: ""
        }
      },
      update: {},
      create: {
        ...item,
        brand: ""
      },
    })
  }

  console.log({ user })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

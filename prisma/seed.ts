import bcrypt from "bcryptjs"
import "dotenv/config"
import { prisma } from "../src/lib/db"

async function main() {
    const email = "samsonicfash@gmail.com"
    const password = "Chr@stjesus1"
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email },
        update: { role: "ADMIN", isSuperAdmin: true },
        create: {
            email,
            password: hashedPassword,
            firstName: "Samson",
            lastName: "Fash",
            role: "ADMIN",
            emailVerified: new Date(),
            isSuperAdmin: true,
        },
    })

    console.log({ admin })
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    })

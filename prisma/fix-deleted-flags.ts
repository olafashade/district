import "dotenv/config"
import { prisma } from "../src/lib/db"

async function main() {
    console.log("Starting update of deleted flags...")

    // 1. Update Districts
    // Set deleted = false for all districts (default state)
    // If you want to respect existing deletedAt, we can refine this.
    // Assuming initialization:
    const districtUpdate = await prisma.district.updateMany({
        data: {
            deleted: false
        }
    })
    console.log(`Updated ${districtUpdate.count} districts to deleted=false.`)

    // 2. Update Chapters
    const chapterUpdate = await prisma.chapter.updateMany({
        data: {
            deleted: false
        }
    })
    console.log(`Updated ${chapterUpdate.count} chapters to deleted=false.`)

    // Optional: If you had 'deletedAt' set for some, you might want strict sync:
    // await prisma.district.updateMany({ where: { NOT: { deletedAt: null } }, data: { deleted: true } })
    // await prisma.chapter.updateMany({ where: { NOT: { deletedAt: null } }, data: { deleted: true } })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

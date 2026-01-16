"use server"

import { prisma } from "@/lib/db"
import { FinancialStatus, MemberType, UserRole } from "@prisma/client"

interface EntityProperty {
    Name: string
    Value: any
}

interface Entity {
    Properties: {
        $values: EntityProperty[]
    }
}

interface ApiResponse {
    Items: {
        $values: Entity[]
    }
}

function flattenEntity(entity: Entity): Record<string, any> {
    const flattened: Record<string, any> = {}
    if (entity.Properties && entity.Properties.$values) {
        for (const prop of entity.Properties.$values) {
            if (prop.Value && typeof prop.Value === 'object' && prop.Value.$value !== undefined) {
                flattened[prop.Name] = prop.Value.$value
            } else {
                flattened[prop.Name] = prop.Value
            }
        }
    }
    return flattened
}

export async function syncChaptersAndDistricts() {
    try {
        console.log("Starting Sync: Fetching external data...")
        const response = await fetch("https://it.oppf.org/api/get_chapters.php", {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const json = await response.json() as ApiResponse
        const items = json.Items?.$values || []

        console.log(`Fetched ${items.length} items. Processing...`)

        const flattenedItems = items.map(flattenEntity)
        let districtCount = 0
        let chapterCount = 0

        const districtCodes = new Set<string>()
        flattenedItems.forEach(item => {
            const code = item.District || item.CH_DISTRICT
            if (code) districtCodes.add(code)
        })

        console.log(`Found ${districtCodes.size} distinct districts.`)

        const districtMap = new Map<string, string>()

        for (const code of districtCodes) {
            const name = `District ${code}`

            let district = await prisma.district.findFirst({
                where: { number: code }
            })

            if (district) {
                console.log(`District ${code} exists.`)
            } else {
                console.log(`Creating District ${code}...`)
                district = await prisma.district.create({
                    data: {
                        name: name,
                        number: code
                    }
                })
                districtCount++
            }
            districtMap.set(code, district.id)
        }

        // 2. Sync Chapters
        for (const item of flattenedItems) {
            const districtCode = item.District || item.CH_DISTRICT
            const districtId = districtMap.get(districtCode)

            if (!districtId) {
                console.warn(`Skipping chapter ${item.ChapterName}: District ${districtCode} not found/created.`)
                continue
            }

            const chapterName = item.ChapterName
            const chapterCode = item.ChapterNumber || item.CH_CHAP_ID

            const email = item.chapter_email

            if (!chapterName) continue
            let existingChapter = null
            if (chapterCode) {
                existingChapter = await prisma.chapter.findFirst({
                    where: { code: chapterCode }
                })
            }

            if (!existingChapter) {
                existingChapter = await prisma.chapter.findFirst({
                    where: { name: chapterName }
                })
            }

            const chapterData = {
                name: chapterName,
                code: chapterCode || null,
                email: email || null,
                address: item.ChapterAddress || null,
                city: item.ChapterCity || null,
                state: item.ChapterState || null,
                zipcode: item.PostalCode || null,
                districtId: districtId
            }

            if (existingChapter) {
                // Update
                await prisma.chapter.update({
                    where: { id: existingChapter.id },
                    data: chapterData
                })
                // console.log(`Updated Chapter ${chapterName}`)
            } else {
                // Create
                await prisma.chapter.create({
                    data: chapterData
                })
                chapterCount++
                // console.log(`Created Chapter ${chapterName}`)
            }
        }

        return {
            success: true,
            message: `Sync complete. Processed ${flattenedItems.length} items. Created ${districtCount} new districts and ${chapterCount} new chapters.`
        }

    } catch (error: any) {
        console.error("Sync Error:", error)
        return { success: false, message: error.message || "Sync failed" }
    }
}

async function processMemberData(
    item: any,
    districtMap: Map<string, string>,
    chapterCodeMap: Map<string, string>,
    chapterNameMap: Map<string, string>
): Promise<boolean> {
    const memberId = item.MemberId
    if (!memberId) {
        return false
    }

    let email = item.Email
    if (!email || typeof email !== 'string' || email.trim() === "") {
        email = `missing_email_${memberId}@oppf.org`
    }
    email = email.toLowerCase().trim()

    const firstName = item.NameFirst || ""
    const lastName = item.NameLast || ""
    const middleName = item.NameMiddle || ""
    const name = item.NameFull || `${firstName} ${lastName}`.trim()

    let financialStatus: FinancialStatus = FinancialStatus.NON_FINANCIAL_MEMBER
    const catCode = item.MembershipCategoryCode

    if (['F', 'LM'].includes(catCode)) {
        financialStatus = FinancialStatus.FINANCIAL_MEMBER
    } else if (catCode === 'RC') {
        financialStatus = FinancialStatus.RECLAIMABLE_MEMBER
    } else if (catCode === 'NF') {
        financialStatus = FinancialStatus.NON_FINANCIAL_MEMBER
    }

    let memberType: MemberType = MemberType.NON_STUDENT
    const typeCode = item.MembershipMemberTypeCode
    if (typeCode === 'UG') {
        memberType = MemberType.STUDENT
    }

    const address = item.AddressFullMailing
    const city = item.AddressCity
    const state = item.AddressStateProvince
    const zip = item.AddressZip
    const phone = item.PhoneMobile || item.PhoneHome

    let initiationYear: number | null = null
    if (item.DateInitiation) {
        const date = new Date(item.DateInitiation)
        if (!isNaN(date.getFullYear())) {
            initiationYear = date.getFullYear()
        }
    }

    const districtCode = item.District
    const districtId = districtMap.get(districtCode)

    const chapterCode = item.ChapterNumber
    let chapterId = chapterCodeMap.get(chapterCode)

    let initiationChapterId: string | undefined = undefined
    const initChapterName = item.ChapterInitiated
    if (initChapterName) {
        initiationChapterId = chapterNameMap.get(initChapterName)
    }

    const userData: any = {
        name,
        firstName,
        lastName,
        middleName,
        email,
        controlNumber: memberId,
        financialStatus,
        memberType,
        phone: phone || null,
        mailingAddress: address || null,
        city: city || null,
        state: state || null,
        zipcode: zip || null,
        initiationYear,
        districtId: districtId || null,
        chapterId: chapterId || null,
        initiationChapterId: initiationChapterId || null
    }

    try {
        await prisma.user.upsert({
            where: { controlNumber: memberId },
            create: {
                ...userData,
                password: "",
                role: UserRole.USER
            },
            update: userData
        })
        return true
    } catch (err) {
        console.error(`Failed to upsert member ${memberId}:`, err)
        return false
    }
}

export async function syncMembers() {
    try {
        console.log("Starting Member Sync...")
        const response = await fetch("https://it.oppf.org/api/get_members_all.php", {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch members: ${response.statusText}`)
        }

        const json = await response.json() as ApiResponse
        const items = json.Items?.$values || []
        console.log(`Fetched ${items.length} members. Processing...`)

        const flattenedItems = items.map(flattenEntity)
        let successCount = 0
        let failCount = 0

        const districts = await prisma.district.findMany()
        const districtMap = new Map(districts.map(d => [d.number, d.id]))

        const chapters = await prisma.chapter.findMany()
        const chapterCodeMap = new Map(
            chapters
                .filter(c => c.code)
                .map(c => [c.code as string, c.id])
        )
        const chapterNameMap = new Map(chapters.map(c => [c.name, c.id]))

        for (const item of flattenedItems) {
            const success = await processMemberData(item, districtMap, chapterCodeMap, chapterNameMap)
            if (success) successCount++
            else failCount++
        }

        return {
            success: true,
            message: `Member sync complete. Processed ${successCount} users. Failed: ${failCount}.`
        }

    } catch (error: any) {
        console.error("Member Sync Error:", error)
        return { success: false, message: error.message || "Member Sync failed" }
    }
}

export async function syncFinancialMembers() {
    try {
        console.log("Starting Financial Member Sync...")
        const response = await fetch("https://it.oppf.org/api/get_financial_members.php", {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch financial members: ${response.statusText}`)
        }

        const json = await response.json() as ApiResponse
        const items = json.Items?.$values || []
        console.log(`Fetched ${items.length} financial members. Processing...`)

        const flattenedItems = items.map(flattenEntity)
        let successCount = 0
        let failCount = 0

        // Pre-fetch lookups
        const districts = await prisma.district.findMany()
        const districtMap = new Map(districts.map(d => [d.number, d.id]))

        const chapters = await prisma.chapter.findMany()
        const chapterCodeMap = new Map(
            chapters
                .filter(c => c.code)
                .map(c => [c.code as string, c.id])
        )
        const chapterNameMap = new Map(chapters.map(c => [c.name, c.id]))

        for (const item of flattenedItems) {
            const success = await processMemberData(item, districtMap, chapterCodeMap, chapterNameMap)
            if (success) successCount++
            else failCount++
        }

        return {
            success: true,
            message: `Financial member sync complete. Processed ${successCount} users. Failed: ${failCount}.`
        }

    } catch (error: any) {
        console.error("Financial Member Sync Error:", error)
        return { success: false, message: error.message || "Financial Member Sync failed" }
    }
}

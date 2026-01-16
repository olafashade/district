"use server"

import { uploadImage } from "@/lib/cloudinary"

export async function uploadFileAction(formData: FormData) {
    const file = formData.get("file") as File

    if (!file) {
        return { success: false, message: "No file provided" }
    }

    try {
        const url = await uploadImage(file)
        if (!url) {
            return { success: false, message: "Upload failed" }
        }
        return { success: true, url }
    } catch (error) {
        console.error("Upload error:", error)
        return { success: false, message: "Upload failed" }
    }
}

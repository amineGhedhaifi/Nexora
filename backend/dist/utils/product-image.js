import { unlink } from "node:fs/promises";
import path from "node:path";
const uploadDirectory = path.resolve(process.cwd(), "uploads", "products");
export async function deleteProductImage(imageUrl) {
    const filename = path.basename(imageUrl);
    // Only delete files with the expected generated WebP filename.
    if (!/^[0-9a-f-]{36}\.webp$/i.test(filename)) {
        return;
    }
    const filePath = path.join(uploadDirectory, filename);
    try {
        await unlink(filePath);
    }
    catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
}

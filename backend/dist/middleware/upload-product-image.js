import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { AppError } from "../utils/app-error.js";
const uploadDirectory = path.resolve(process.cwd(), "uploads", "products");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            callback(new AppError(400, "Only JPEG, PNG, and WebP images are allowed."));
            return;
        }
        callback(null, true);
    },
});
export const uploadProductImage = upload.single("image");
export async function processProductImage(buffer) {
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const outputPath = path.join(uploadDirectory, filename);
    try {
        await sharp(buffer, {
            limitInputPixels: 40_000_000,
        })
            .rotate()
            .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
        })
            .webp({ quality: 80 })
            .toFile(outputPath);
        return `/uploads/products/${filename}`;
    }
    catch {
        await unlink(outputPath).catch(() => { });
        throw new AppError(400, "The uploaded file is not a valid image.");
    }
}

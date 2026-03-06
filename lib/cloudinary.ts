// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResponse {
    public_id: string;
    secure_url: string;
    [key: string]: any;
}

/**
 * Uploads a file (buffer) to Cloudinary
 */
export async function uploadToCloudinary(
    fileBuffer: Buffer,
    folder: string = 'notes'
): Promise<CloudinaryUploadResponse> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto', // Important for PDFs
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error('Cloudinary upload failed: No result returned'));
                resolve(result as CloudinaryUploadResponse);
            }
        );

        uploadStream.end(fileBuffer);
    });
}

/**
 * Deletes a file from Cloudinary using its public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
}

/**
 * Extracts public_id from a Cloudinary URL
 * Example: https://res.cloudinary.com/demo/image/upload/v12345678/folder/sample.pdf -> folder/sample
 */
export function getPublicIdFromUrl(url: string): string | null {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const publicIdWithExtension = lastPart.split('.')[0];

    // Find where 'upload/' or 'auto/' is to get the full path including folders
    const uploadIndex = parts.indexOf('upload');
    const autoIndex = parts.indexOf('auto');
    const startIndex = Math.max(uploadIndex, autoIndex);

    if (startIndex === -1) return null;

    // Join parts after the version (which usually follows 'upload/')
    // parts[startIndex+1] is usually 'v12345678'
    const idParts = parts.slice(startIndex + 2);
    const fullId = idParts.join('/').split('.')[0];

    return fullId;
}

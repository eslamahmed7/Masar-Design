import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(
  file: string,
  options?: Record<string, unknown>,
) {
  return cloudinary.uploader.upload(file, {
    folder: 'masar',
    ...options,
  })
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}

export async function renameImage(
  fromPublicId: string,
  toPublicId: string,
  options?: Record<string, unknown>,
) {
  return cloudinary.uploader.rename(fromPublicId, toPublicId, options)
}

export async function createFolder(folderName: string) {
  return cloudinary.api.create_folder(folderName)
}

export async function listFolder(folderPath: string) {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: folderPath,
    max_results: 500,
  })
  return result
}

export function getOptimizedUrl(
  publicId: string,
  options?: Record<string, unknown>,
) {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  })
}

export function getResponsiveUrl(
  publicId: string,
  width: number,
  options?: Record<string, unknown>,
) {
  return cloudinary.url(publicId, {
    width,
    crop: 'fill',
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  })
}

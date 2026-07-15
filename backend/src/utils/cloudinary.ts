import fs from 'fs';
import path from 'path';

// Simplified local upload handler that mimics cloudinary or storage
export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadMediaFile = async (
  file: Express.Multer.File,
  folderName: string = 'general'
): Promise<UploadResult> => {
  // If CLOUDINARY_URL exists, we could use cloudinary SDK here.
  // For robustness, consistency, and offline local operations, we will build a reliable local storage server.
  // We can write to a local uploads directory served statically by Express.
  
  const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', folderName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname);
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const targetPath = path.join(uploadDir, uniqueName);

  await fs.promises.writeFile(targetPath, file.buffer);

  // Return the path relative to the Express static serving configuration (e.g. /uploads/folder/filename)
  const relativeUrl = `/uploads/${folderName}/${uniqueName}`;

  return {
    url: relativeUrl,
    publicId: uniqueName
  };
};

export const deleteMediaFile = async (url: string): Promise<boolean> => {
  try {
    if (url.startsWith('/uploads/')) {
      const relativePath = url.replace('/uploads/', '');
      const fullPath = path.join(__dirname, '..', '..', 'public', 'uploads', relativePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
  return false;
};

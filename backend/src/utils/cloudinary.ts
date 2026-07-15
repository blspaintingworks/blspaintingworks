import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  publicId: string;
}

const generateSignature = (params: Record<string, any>, apiSecret: string) => {
  const sortedKeys = Object.keys(params).sort();
  const signatureString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + apiSecret;
  return crypto.createHash('sha1').update(signatureString).digest('hex');
};

export const uploadMediaFile = async (
  file: Express.Multer.File,
  folderName: string = 'general'
): Promise<UploadResult> => {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (cloudinaryUrl) {
    try {
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        const apiKey = match[1];
        const apiSecret = match[2];
        const cloudName = match[3];

        const timestamp = Math.round(new Date().getTime() / 1000);
        const params = {
          folder: folderName,
          timestamp: timestamp
        };
        const signature = generateSignature(params, apiSecret);

        const formData = new FormData();
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('file', blob, file.originalname);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folderName);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        const result: any = await response.json();
        if (result.secure_url) {
          return {
            url: result.secure_url,
            publicId: result.public_id
          };
        } else {
          console.error('Cloudinary API upload error details:', result);
        }
      }
    } catch (err) {
      console.error('Cloudinary upload exception, falling back to local storage:', err);
    }
  }

  // Graceful fallback to local storage
  const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', folderName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileExt = path.extname(file.originalname);
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
  const targetPath = path.join(uploadDir, uniqueName);

  await fs.promises.writeFile(targetPath, file.buffer);
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
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (url.includes('cloudinary.com') && cloudinaryUrl) {
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        const apiKey = match[1];
        const apiSecret = match[2];
        const cloudName = match[3];

        const parts = url.split('/');
        const fileWithExt = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${fileWithExt.split('.')[0]}`;

        const timestamp = Math.round(new Date().getTime() / 1000);
        const params = {
          public_id: publicId,
          timestamp: timestamp
        };
        const signature = generateSignature(params, apiSecret);

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
          method: 'POST',
          body: formData
        });
        const result: any = await response.json();
        return result.result === 'ok';
      }
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
  return false;
};

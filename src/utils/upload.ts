import multer from 'multer';

// Store files in memory to process them (compress/upload) immediately
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});
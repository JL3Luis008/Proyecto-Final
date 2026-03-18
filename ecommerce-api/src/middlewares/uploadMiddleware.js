import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to create storage
const createStorage = (subfolder) => multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, `../uploads/${subfolder}/`));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure Multer for product images
export const upload = multer({
    storage: createStorage('products'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Multer for user avatars
export const uploadAvatar = multer({
    storage: createStorage('avatars'),
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

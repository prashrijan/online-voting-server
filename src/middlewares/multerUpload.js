import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = "uploads/";
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() + 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|tiff/;
    const extensionName = path.extname(file.originalname).toLowerCase();
    const isValidExtension = allowedTypes.test(extensionName);
    const isValidType = allowedTypes.test(file.mimetype);
    if (isValidType && isValidExtension) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only image files are allowed."),
            false
        );
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});

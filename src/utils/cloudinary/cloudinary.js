import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { conf } from "../../conf/conf.js";

cloudinary.config({
    cloud_name: conf.cloudName,
    api_key: conf.cloudinaryApiKey,
    api_secret: conf.cloudinaryApiSecret,
});

export const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "chunaab/users-profile",
        allowed_formats: ["jpeg", "png", "jpg"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
    },
});

export { cloudinary };

import { deleteUploadedFile } from "../fileUtil.js";
import { cloudinary } from "./cloudinary.js";

export const uploadToCloudinary = async (localFilePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: "auto",
            transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        deleteUploadedFile(localFilePath);
        return result.secure_url;
    } catch (error) {
        deleteUploadedFile(localFilePath);
        console.error("Error uploading to Cloudinary: ", error);
        throw error;
    }
};

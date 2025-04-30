import fs from "fs";
import path from "path";

export const deleteUploadedFile = (filePath) => {
    fs.unlink(path.resolve(filePath), () => {});
};

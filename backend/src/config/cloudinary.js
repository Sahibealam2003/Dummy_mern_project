import { v2 as cloudinary } from "cloudinary";

const configureCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
};

export const uploadToCloudinary = (fileBuffer) => {
    configureCloudinary();
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "avatars",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
};

export default cloudinary;

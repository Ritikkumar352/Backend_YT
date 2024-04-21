import { v2 as cloudinary } from "cloudniary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//method->parameter->upload -> unlink (delete) form local
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload -> clodinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file is uploaded on cloudinary ", response.url);
    console.log(response); // look these info of response
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally save temp fileas the upload operation got failed

    return null;
  }
};

export { uploadOnCloudinary };
// time stamp for this code 9:13:02 ...

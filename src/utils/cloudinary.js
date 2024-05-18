import { v2 as cloudinary } from "cloudinary";
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
    // file uploaded
    console.log(
      "file uploaded on cloudinary !! yayyyy and here is it's url using response.url ",
      response.url
    );
    //console.log(response); // look these info of response
    console.log("for response check cloudinary line 20");
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally save temp fileas the upload operation got failed

    return null;
  }
};

export { uploadOnCloudinary };

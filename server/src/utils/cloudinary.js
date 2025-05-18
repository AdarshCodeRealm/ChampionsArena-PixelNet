import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

//localFilePath = req.files.filename[0].path    --> filename getting when multer middleware name in route
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })
    // file has been uploaded successfull
    console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath)
    return response
  } 
  
  catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
   
    return null
  }
}

/**
 * Delete a file from Cloudinary using its URL or public ID
 * @param {string} fileUrl - The URL or public ID of the file to delete
 * @returns {Promise} - Result of the deletion operation
 */
const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return null;
    
    // Extract public ID from URL if a full URL is provided
    let publicId;
    if (fileUrl.includes('cloudinary.com')) {
      // Extract the public ID from the URL
      const urlParts = fileUrl.split('/');
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      publicId = fileNameWithExtension.split('.')[0]; // Remove file extension
    } else {
      // If it's already a public ID
      publicId = fileUrl;
    }
    
    // Delete the file from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("File deleted from Cloudinary:", publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
}

export { uploadOnCloudinary, deleteFromCloudinary }

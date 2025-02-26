import cloudinary from "../utils/cloudinary.js";

export const rollbackUploadedFiles = async (req, res, next) => {
  /**
   * @description delete images from cloudinary if the request failed
   * @param {string} folderPath - the folder path of the images
   */
  console.log("rollbackUploadedFiles middleware");
  if (req.folder) {
    console.log(req.folder);
    await cloudinary.api.delete_resources_by_prefix(req.folder);
    await cloudinary.api.delete_folder(req.folder);
  }
  next();
};

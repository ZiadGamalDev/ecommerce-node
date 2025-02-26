import brandModel from "../../../DB/models/brand-model.js";
import Brand from "../../../DB/models/brand-model.js";
import generateUniqurString from "../../utils/generate-unique-string.js";
import cloudinary from "../../utils/cloudinary.js";
//============================== get brands ==============================//

export const getBrands = async (req, res, next) => {
  const brands = await Brand.find();
  if (!brands) {
    return next({
      cause: 404,
      message: "No brands found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Brands retrieved successfully",
    data: brands,
  });
};

//============================== get brand by id ==============================//

export const getBrandById = async (req, res, next) => {
  const brandId = req.params.brandId;
  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next({
      cause: 404,
      message: " brand not found",
    });
  }
  res.status(200).json({
    success: true,
    message: "Brand retrieved successfully",
    data: brand,
  });
};

//============================== Add brand ==============================//

export const addBrand = async (req, res, next) => {
  console.log("hello from add brand");
  
  const { name } = req.body;
  const { _id } = req.user;
  const {categoryId} = req.params
  const isNameDuplicated = await brandModel.findOne({ name });
  if (isNameDuplicated) {
    return next({
      cause: 409,
      message: "Brand name already exist",
    });
  }
  if (!req.file) return next({ cause: 400, message: "logo is required" });
  const folderId = generateUniqurString(4);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.MAIN_FOLDER}/Brands/${folderId}` }
  );
  req.folder = `${process.env.MAIN_FOLDER}/Brands/${folderId}`;
  const addedBrand = {
    name,
    logo: { secure_url: secure_url, public_id: public_id },
    folderId,
    category: categoryId,
    addedBy: _id,
  }
console.log(addedBrand);

  const newBrand = await brandModel.create(addedBrand);
  
  res.status(201).json({
    success: true,
    message: "Brand added successfully",
    data: newBrand,
  });
};

//============================== update brand ==============================//
export const updateBrand = async (req, res, next) => {
  const { name, oldPublicId } = req.body;
  const { brandId } = req.params;
  const { _id } = req.user;
  const brand = await Brand.findById(brandId);
  if (!brand) return next({ cause: 404, message: "Brand not found" });
  if (name) {
    if (name == brand.name) {
      return next({ cause: 400, message: "Please enter a different name" });
    }
    const isNameDuplicated = await brandModel.findOne({ name });
    if (isNameDuplicated)
      return next({ cause: 409, message: "Brand name already exist" });
  }
  brand.name = name;
  await brand.save();
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "logo is required" });
    oldPublicId = brand.logo.public_id;
    const newPublicId = oldPublicId.split(`${brand.folderId}/`)[1];
    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Brands/${brand.folderId}`,
      public_id: newPublicId,
    });
    brand.logo.secure_url = secure_url;
  }
  brand.updatedBy = _id;
  await brand.save();
  res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    data: brand,
  });
};

//============================== delete brand ==============================//

export const deleteBrand = async (req, res, next) => {
  const { brandId } = req.params;
  const { _id } = req.user;
  // 1-find brand by id
  const brand = await Brand.findById(brandId);
  // 2- check if brand exist
  if (!brand) return next({ cause: 404, message: "Brand not found" });
  // 3- check if user is authorized to delete the brand
  if (brand.addedBy.toString() !== _id.toString())
    return next({
      cause: 401,
      message: "You are not authorized to delete this brand",
    });
    // 4- delete brand logo from cloudinary
  await cloudinary.uploader.destroy(brand.logo.public_id);
  // 5- delete folder from cloudinary
  if (brand.folderId) {
    await cloudinary.api.delete_folder(
      `${process.env.MAIN_FOLDER}/Brands/${brand.folderId}`
    );
  }
  // 6- delete brand from database
  await brandModel.findByIdAndDelete(brandId);
  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
};

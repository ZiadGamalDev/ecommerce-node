import generateUniqueString from "../../utils/generate-unique-string.js";
import categoryModel from "../../../DB/models/category-model.js";

import cloudinary from "../../utils/cloudinary.js";

//============================== add category ==============================//
export const addCategory = async (req, res, next) => {
  // 1- destructuring the request body
  const { name, description } = req.body;
  const { _id } = req.user;
  console.log(name);
  // 2- check if the category name is already exist
  const isNameDuplicated = await categoryModel.findOne({ name });
  if (isNameDuplicated) {
    return next({ cause: 409, message: "Category name is already exist" });
  }

  // 4- upload image to cloudinary
  if (!req.file) return next({ cause: 400, message: "Image is required" });

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`,
    }
  );
  // console.log(`category folder id:`, `${process.env.MAIN_FOLDER}/Categories/${folderId}`);
  req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`;

  // 5- generate the categroy object
  const category = {
    name,
    description,
    image: { secure_url: secure_url, public_id: public_id },
    folderId,
    addedBy: _id,
  };

  // 6- create the category
  const categoryCreated = new categoryModel(category);

  await categoryCreated.save();

  console.log(categoryCreated);
  req.savedDocs = { model: categoryModel, _id: categoryCreated._id };

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: categoryCreated,
  });
};

//================================ upadte category ================================//
export const updateCategory = async (req, res, next) => {
  // 1- destructuring the request body
  let { name, oldPublicId } = req.body;
  // 2- destructuring the request params
  const { categoryId } = req.params;
  // 3- destructuring _id from the request authUser
  const { _id } = req.user;

  // 4- check if the category is exist bu using categoryId
  const category = await categoryModel.findById(categoryId);
  if (!category) return next({ cause: 404, message: "Category not found" });
  console.log(category.name);

  // 5- check if the use want to update the name field
  if (name) {
    // 5.1 check if the new category name different from the old name
    if (name == category.name) {
      return next({
        cause: 400,
        message: "Please enter different category name from the existing one.",
      });
    }

    // 5.2 check if the new category name is already exist
    const isNameDuplicated = await categoryModel.findOne({ name });
    if (isNameDuplicated) {
      return next({ cause: 409, message: "Category name is already exist" });
    }
  }

  category.name = name;
  await category.save();

  // 6- check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });

    oldPublicId = category.image.public_id;
    const newPulicId = oldPublicId.split(`${category.folderId}/`)[1];

    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
      public_id: newPulicId,
    });

    category.image.secure_url = secure_url;
  }

  // 7- set value for the updatedBy field
  category.updatedBy = _id;

  await category.save();
  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

//============================== get all categories ==============================//
export const getAllCategories = async (req, res, next) => {
  try {
    // Properly structured populate for nested relationships
    const categories = await categoryModel.find().populate([
      {
        // Populate addedBy with selected user fields
        path: "addedBy",
        select: "username email role",
      },
      {
        // Populate updatedBy if it exists
        path: "updatedBy",
        select: "userName email role",
      },
      {
        // Populate brands directly related to category
        path: "brands",
        select: "name logo",
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  const categoryId = req.params.categoryId;
  console.log(categoryId);
  const category = await categoryModel.findById(categoryId);

  if (!category) {
    return next({ cause: 404, message: "Category not found" });
  }

  res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    data: category,
  });
};

//====================== delete category ======================//
// export const deleteCategory = async (req, res, next) => {
//     const { categoryId } = req.params

//     // 1- delete category
//     const catgory = await Category.findByIdAndDelete(categoryId)
//     if (!catgory) return next({ cause: 404, message: 'Category not found' })

//     // 2-delete the related subcategories
//     const subCategories = await subCategory.deleteMany({ categoryId })
//     if (subCategories.deletedCount <= 0) {
//         console.log(subCategories.deletedCount);
//         console.log('There is no related subcategories');
//     }

//     //3- delete the related brands
//     const brands = await Brand.deleteMany({ categoryId })
//     if (brands.deletedCount <= 0) {
//         console.log(brands.deletedCount);
//         console.log('There is no related brands');
//     }

//     // 4- delete the category folder from cloudinary
//     await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)
//     await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_FOLDER}/Categories/${catgory.folderId}`)

//     res.status(200).json({ success: true, message: 'Category deleted successfully' })
// }

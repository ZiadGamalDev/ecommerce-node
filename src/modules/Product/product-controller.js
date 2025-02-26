import brandModel from "../../../DB/models/brand-model";
import { systemRoles } from "./../../utils/system-roles";
import generateUniqurString from "./../../utils/generate-unique-string";
import cloudinary from "../../utils/cloudinary";
import productModel from "../../../DB/models/product-model";

export const addproduct = async (req, res, next) => {
  const {
    title,
    baseprice,
    stock,
    discountType,
    discountValue,
    specs,
    description,
  } = req.body;

  const { categoryId, brandId } = req.params;

  const addedBy = req.user._id;

  const brand = await brandModel.findById(brandId);

  if (!brand) return next({ cause: 404, message: "Brand not found" });

  if (brand.category.toString() !== categoryId)
    return next({ cause: 404, message: "Brand not found in this category" });

  if (
    req.user.role !== systemRoles.ADMIN &&
    brand.addedBy.toString() !== addedBy.toString()
  ) {
    return next({
      cause: 403,
      message: "You are not allowed to add product to this brand",
    });
  }

  const appliedPrice = baseprice - (baseprice * (discountValue || 0)) / 100;

  //Images

  if (!req.files) {
    return next({ cause: 400, message: "Product Images are requied" });
  }
  const images = [];
  const folderId = generateUniqurString(4);
  const folderPath = brand.logo.public_id.split(`${brand.folderId}`);

  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: folderPath + `${brand.folderId}/Products/${folderId}`,
      }
    );

    images.push({ secure_url: secure_url, public_id: public_id });
  }

  req.folder = folderPath + `${brand.folderId}/Products/${folderId}`;

  const product = {
    title: title,
    description: description,
    discount: { type: discountType, value: discountValue },
    basePrice: baseprice,
    appliedPrice: appliedPrice,
    specs: specs,
    category: categoryId,
    brand: brandId,
    images,
    addedBy,
    stock,
    folderId,
  };

  const newProduct = await productModel.create(product);
  req.savedDocs = { model: productModel, _id: newProduct._id };

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
};

export const updateProduct = async (req, res, next) => {
  // data from the request body
  const {
    title,
    specs,
    stock,
    basePrice,
    discountType,
    discountValue,

    description,
    oldPublicId,
  } = req.body;
  // data for condition
  const { productId } = req.params;
  // data from the request authUser
  const addedBy = req.user._id;

  // prodcuct Id
  const product = await productModel.findById(productId);
  if (!product) return next({ cause: 404, message: "Product not found" });

  // who will be authorized to update a product
  if (
    req.user.role !== systemRoles.ADMIN &&
    product.addedBy.toString() !== addedBy.toString()
  )
    return next({
      cause: 403,
      message: "You are not allowed to update this product",
    });

  // title update
  if (title) {
    product.title = title;
    // product.slug = slugify(title, { lower: true, replacement: '-' })
  }
  if (description) product.description = description;
  if (specs) product.specs = JSON.parse(specs);
  if (stock) product.stock = stock;

  // prices changes
  const appliedPrice =
    (basePrice || product.basePrice) *
    (1 - (discountValue || product.discount) / 100);
  product.appliedPrice = appliedPrice;

  if (basePrice) product.basePrice = basePrice;
  if (discountType) product.discount.type = discountType;

  if (discountValue) product.discount.value = discountValue;
  if (oldPublicId) {
    if (!req.file)
      return next({ cause: 400, message: "Please select new image" });

    const folderPath = product.Images[0].public_id.split(
      `${product.folderId}/`
    )[0];
    const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];

    // console.log('folderPath', folderPath)
    // console.log('newPublicId', newPublicId)
    // console.log(`oldPublicId`, oldPublicId);

    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: folderPath + `${product.folderId}`,
        public_id: newPublicId,
      }
    );
    product.Images.map((img) => {
      if (img.public_id === oldPublicId) {
        img.secure_url = secure_url;
      }
    });
    req.folder = folderPath + `${product.folderId}`;
  }

  await product.save();

  res
    .status(200)
    .json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
};


//TODO: seperate uploading/updating logic
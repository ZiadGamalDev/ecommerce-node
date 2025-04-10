import brandModel from "../../../DB/models/brand-model.js";
import { systemRoles } from "./../../utils/system-roles.js";
import generateUniqurString from "./../../utils/generate-unique-string.js";
import cloudinary from "../../utils/cloudinary.js";
import productModel from "../../../DB/models/product-model.js";
import categoryModel from "../../../DB/models/category-model.js";

export const addproduct = async (req, res, next) => {
    const { title, basePrice, stock, discountType, discountValue, description } = req.body;

    const { categoryId, brandId } = req.params;

    const addedBy = req.user._id;

    const brand = await brandModel.findById(brandId);

    if (!brand) return next({ cause: 404, message: "Brand not found" });

    if (brand.category.toString() !== categoryId) return next({ cause: 404, message: "Brand not found in this category" });

    if (req.user.role !== systemRoles.ADMIN && brand.addedBy.toString() !== addedBy.toString()) {
        return next({
            cause: 403,
            message: "You are not allowed to add product to this brand",
        });
    }

    const appliedPrice = basePrice - (basePrice * (discountValue || 0)) / 100;

    //Images

    if (!req.files) {
        return next({ cause: 400, message: "Product Images are requied" });
    }
    const images = [];
    const folderId = generateUniqurString(4);
    const folderPath = brand.logo.public_id.split(`${brand.folderId}`);

    for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
            folder: folderPath + `${brand.folderId}/Products/${folderId}`,
        });

        images.push({ secure_url: secure_url, public_id: public_id });
    }

    req.folder = folderPath + `${brand.folderId}/Products/${folderId}`;

    const product = { title: title, description: description, discount: { type: discountType, value: discountValue }, basePrice: basePrice, appliedPrice: appliedPrice, category: categoryId, brand: brandId, images, addedBy, stock, folderId };

    const newProduct = await productModel.create(product);
    req.savedDocs = { model: productModel, _id: newProduct._id };

    res.status(201).json({ success: true, message: "Product created successfully", data: newProduct });
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
    categoryId,
    brandId,
    description,
    oldPublicId,
  } = req.body;
  // data for condition
  const { productId } = req.params;
  // data from the request authUser
  const updatedBy = req.user._id;

    // prodcuct Id
    const product = await productModel.findById(productId);
    if (!product) return next({ cause: 404, message: "Product not found" });

    // who will be authorized to update a product
    if (req.user.role !== systemRoles.ADMIN && product.addedBy.toString() !== updatedBy.toString()) return next({ cause: 403, message: "You are not allowed to update this product" });

    // title update
    if (title) {
        product.title = title;
        // product.slug = slugify(title, { lower: true, replacement: '-' })
    }
    if (description) product.description = description;
    if (specs) product.specs = JSON.parse(specs);
    if (stock) product.stock = stock;

    // prices changes
    const appliedPrice = (basePrice || product.basePrice) * (1 - (discountValue || product.discount.value) / 100);
    product.appliedPrice = appliedPrice;

    if (basePrice) product.basePrice = basePrice;
    if (discountType) product.discount.type = discountType;

    if (discountValue) product.discount.value = discountValue;
    if (oldPublicId) {
        if (!req.file) return next({ cause: 400, message: "Please select new image" });

        const folderPath = product.Images[0].public_id.split(`${product.folderId}/`)[0];
        const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];

        // console.log('folderPath', folderPath)
        // console.log('newPublicId', newPublicId)
        // console.log(`oldPublicId`, oldPublicId);

        const { secure_url } = await cloudinaryConnection().uploader.upload(req.file.path, { folder: folderPath + `${product.folderId}`, public_id: newPublicId });
        product.Images.map((img) => {
            if (img.public_id === oldPublicId) {
                img.secure_url = secure_url;
            }
        });
        req.folder = folderPath + `${product.folderId}`;
    }

  product.updatedBy = updatedBy;
  product.category = categoryId || product.category;
  product.brand = brandId || product.brand;
  await product.save();

    res.status(200).json({ success: true, message: "Product updated successfully", data: product });
};

export const getProductById = async (req, res, next) => {
    const { productId } = req.params;

    const product = await productModel.findById(productId).populate({ path: "brand", select: "name logo" }).populate({ path: "category", select: "name image" }).populate({ path: "addedBy", select: "username email" });

    if (!product) return next({ cause: 404, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product retrieved successfully", data: product });
};

export const getAllProducts = async (req, res, next) => {
    try {
        let { minPrice, maxPrice, category, brand, search, page, limit } = req.query;

        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};

        if (minPrice || maxPrice) {
            filter.appliedPrice = {};
            if (minPrice) filter.appliedPrice.$gte = parseFloat(minPrice);
            if (maxPrice) filter.appliedPrice.$lte = parseFloat(maxPrice);
        }

        if (search) {
            filter.$text = { $search: search };
        }

        if (category) {
            const categoryDoc = await categoryModel.findOne({ slug: category.trim() }, "_id");
            if (categoryDoc) {
                filter.category = categoryDoc._id;
            } else {
                return res.status(200).json({ success: true, message: "No products found", data: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: page, limit } });
            }
        }

        if (brand) {
            const brandDoc = await brandModel.findOne({ slug: brand.trim() }, "_id");
            if (brandDoc) {
                filter.brand = brandDoc._id;
            } else {
                return res.status(200).json({ success: true, message: "No products found", data: [], pagination: { totalProducts: 0, totalPages: 0, currentPage: page, limit } });
            }
        }

        // Fetch products with filters, pagination, and sorting
        const products = await productModel.find(filter).populate({ path: "brand", select: "name logo" }).populate({ path: "category", select: "name image" }).populate({ path: "addedBy", select: "username email" }).sort({ createdAt: -1 }).skip(skip).limit(limit);

        // Get total count for pagination metadata
        const totalProducts = await productModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // --- Get min and max price among the filtered products ---
        const [minObj, maxObj] = await Promise.all([productModel.findOne(filter).sort({ appliedPrice: 1 }).limit(1), productModel.findOne(filter).sort({ appliedPrice: -1 }).limit(1)]);

        // Fallback to 0 if no products found
        const minPriceValue = minObj ? minObj.appliedPrice : 0;
        const maxPriceValue = maxObj ? maxObj.appliedPrice : 0;

        return res.status(200).json({ success: true, message: "Products retrieved successfully", data: products, minPrice: minPriceValue, maxPrice: maxPriceValue, pagination: { totalProducts, totalPages, currentPage: page, limit } });
    } catch (error) {
        next(error);
    }
};

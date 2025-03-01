import productModel from "../../../DB/models/product-model.js";

export const checkproductAvaliability = async (productId, quantity) => {
  const product = await productModel.findById(productId);

  if (!product || product.stock < quantity) return null;

  return product;
};

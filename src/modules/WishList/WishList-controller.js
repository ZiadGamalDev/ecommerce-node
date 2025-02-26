import WishList from "../../../DB/models/wishList-model.js";
import Product from "../../../DB/models/product-model.js";

//============================== Get Wishlist ==============================//
export const getWishList = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const wishlist = await WishList.findOne({ userId }).lean();

    if (!wishlist) return res.status(200).json({ wishlist: { products: [] } });

    res.status(200).json({ wishlist });
  } catch (error) {
    next(error);
  }
};

//============================== Add to Wishlist ==============================//
export const addToWishList = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { productId } = req.body;

    let wishlist = await WishList.findOne({ userId });
    if (!wishlist) {
      wishlist = new WishList({ userId, products: [] });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.stock <= 0)
      return res.status(400).json({ message: "Product is out of stock" });

    if (
      wishlist.products.some((item) => item.productId.toString() === productId)
    ) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    wishlist.products.push({
      productId,
      title: product.name,
      description: product.description,
      stock: product.stock,
    });

    await wishlist.save();
    res.status(200).json({ message: "Item added to wishlist", wishlist });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    next(error);
  }
};

//============================== Remove from Wishlist ==============================//
export const removeFromWishList = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { productId } = req.body;

    const wishlist = await WishList.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId: productId } } },
      { new: true }
    );

    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });

    res.status(200).json({ message: "Item removed from wishlist", wishlist });
  } catch (error) {
    next(error);
  }
};

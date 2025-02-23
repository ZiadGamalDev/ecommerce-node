import Cart from "../../../DB/models/cart-model.js";
import Product from "../../../DB/models/product-model.js";

//============================== get cart ==============================//
export const getCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
};

//============================== add to cart ==============================//
export const addToCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
      cart.products[productIndex].finalPrice =
        cart.products[productIndex].basePrice *
        cart.products[productIndex].quantity;
    } else {
      cart.products.push({
        productId,
        quantity,
        basePrice: product.price,
        finalPrice: product.price * quantity,
        title: product.name,
      });
    }

    cart.subTotal = cart.products.reduce(
      (sum, item) => sum + item.finalPrice,
      0
    );

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    next(error);
  }
};

//============================== remove from cart ==============================//
export const removeFromCart = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.subTotal = cart.products.reduce(
      (sum, item) => sum + item.finalPrice,
      0
    );

    await cart.save();
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    next(error);
  }
};

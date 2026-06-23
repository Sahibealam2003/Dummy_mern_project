import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";


const mapCartItems = (cart) => {
    if (!cart || !cart.items) return [];
    return cart.items.map(item => {
        if (!item.product) return null;
        return {
            id: item.product._id.toString(),
            _id: item.product._id,
            title: item.product.title,
            price: item.product.price,
            description: item.product.description,
            category: item.product.category,
            image: item.product.image,
            rating: item.product.rating,
            quantity: item.quantity
        };
    }).filter(item => item !== null);
};


export const getCart = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a cart" });
        }

        let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json(mapCartItems(cart));
    } catch (error) {
        console.error("Error in getCart:", error);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a cart" });
        }

        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId.toString()
        );

        if (existingItem) {
            existingItem.quantity += Number(quantity);
        } else {
            cart.items.push({ product: productId, quantity: Number(quantity) });
        }

        await cart.save();
        
        // Populate and return updated list
        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        res.status(200).json(mapCartItems(updatedCart));
    } catch (error) {
        console.error("Error in addToCart:", error);
        res.status(500).json({ error: "Failed to add to cart" });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a cart" });
        }

        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ error: "Product ID and quantity are required" });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId.toString()
        );

        if (existingItemIndex > -1) {
            const newQty = Number(quantity);
            if (newQty <= 0) {
                cart.items.splice(existingItemIndex, 1);
            } else {
                cart.items[existingItemIndex].quantity = newQty;
            }
            await cart.save();
        } else {
            return res.status(404).json({ error: "Item not found in cart" });
        }

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        res.status(200).json(mapCartItems(updatedCart));
    } catch (error) {
        console.error("Error in updateCartItem:", error);
        res.status(500).json({ error: "Failed to update cart" });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a cart" });
        }

        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId.toString()
        );

        await cart.save();

        const updatedCart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        res.status(200).json(mapCartItems(updatedCart));
    } catch (error) {
        console.error("Error in removeFromCart:", error);
        res.status(500).json({ error: "Failed to remove from cart" });
    }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
    try {
        if (req.user.role === "admin") {
            return res.status(403).json({ error: "Access denied. Admins cannot have a cart" });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.status(200).json([]);
    } catch (error) {
        console.error("Error in clearCart:", error);
        res.status(500).json({ error: "Failed to clear cart" });
    }
};

import Product from "../models/productModel.js";
import redis from "../config/redis.js";

// Get all products
export const getProducts = async (req, res) => {
    try {
        const cacheKey = "products:all";
        try {
            const cachedProducts = await redis.get(cacheKey);
            if (cachedProducts) {
                console.log("Serving all products from cache");
                return res.status(200).json(JSON.parse(cachedProducts));
            }
        } catch (cacheError) {
            console.error("Redis error fetching all products:", cacheError);
        }

        const products = await Product.find({}).sort({ createdAt: -1 });
        const mapped = products.map(p => ({
            id: p._id.toString(),
            _id: p._id,
            title: p.title,
            price: p.price,
            description: p.description,
            category: p.category,
            image: p.image,
            rating: p.rating
        }));

        try {
            await redis.set(cacheKey, JSON.stringify(mapped), "EX", 3600);
            console.log("Cached all products in Redis");
        } catch (cacheError) {
            console.error("Redis error caching all products:", cacheError);
        }

        res.status(200).json(mapped);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// Get single product by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `product:${id}`;
        try {
            const cachedProduct = await redis.get(cacheKey);
            if (cachedProduct) {
                console.log(`Serving product ${id} from cache`);
                return res.status(200).json(JSON.parse(cachedProduct));
            }
        } catch (cacheError) {
            console.error("Redis error fetching single product:", cacheError);
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const mappedProduct = {
            id: product._id.toString(),
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating
        };

        try {
            await redis.set(cacheKey, JSON.stringify(mappedProduct), "EX", 3600);
            console.log(`Cached product ${id} in Redis`);
        } catch (cacheError) {
            console.error("Redis error caching single product:", cacheError);
        }

        res.status(200).json(mappedProduct);
    } catch (error) {
        console.error("Error fetching single product:", error);
        res.status(500).json({ error: "Failed to fetch product" });
    }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
    try {
        const { title, price, description, category, image } = req.body;
        
        if (!title || !price || !description || !category) {
            return res.status(400).json({ error: "Title, price, description, and category are required" });
        }

        const product = await Product.create({
            title,
            price: Number(price),
            description,
            category,
            image: image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
            rating: { rate: 4.0, count: 1 }
        });

        // Invalidate all products cache
        try {
            await redis.del("products:all");
            console.log("Invalidated products:all cache");
        } catch (cacheError) {
            console.error("Redis error invalidating products cache:", cacheError);
        }

        res.status(201).json({
            id: product._id.toString(),
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
    try {
        const { title, price, description, category, image } = req.body;
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (title !== undefined) product.title = title;
        if (price !== undefined) product.price = Number(price);
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (image !== undefined) product.image = image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80";

        await product.save();

        // Invalidate cache
        try {
            await redis.del("products:all");
            await redis.del(`product:${id}`);
            console.log(`Invalidated cache for product:${id} and products:all`);
        } catch (cacheError) {
            console.error("Redis error invalidating product cache on update:", cacheError);
        }
        
        res.status(200).json({
            id: product._id.toString(),
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await Product.findByIdAndDelete(id);

        // Invalidate cache
        try {
            await redis.del("products:all");
            await redis.del(`product:${id}`);
            console.log(`Invalidated cache for product:${id} and products:all on deletion`);
        } catch (cacheError) {
            console.error("Redis error invalidating product cache on deletion:", cacheError);
        }

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
};

// Seeding logic (runs on DB initialization if product list is empty)
export const seedProducts = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log("No products found in DB. Seeding from Fakestore API...");
            const response = await fetch("https://fakestoreapi.com/products");
            if (response.ok) {
                const apiProducts = await response.json();
                const mappedProducts = apiProducts.map(p => ({
                    title: p.title,
                    price: p.price,
                    description: p.description,
                    category: p.category,
                    image: p.image,
                    rating: p.rating || { rate: 4.0, count: 10 }
                }));
                await Product.insertMany(mappedProducts);
                console.log(`Successfully seeded ${mappedProducts.length} products to MongoDB.`);
            } else {
                console.error("Failed to fetch products from Fakestore API for seeding.");
            }
        } else {
            console.log(`Database already has ${count} products. Seeding skipped.`);
        }
    } catch (error) {
        console.error("Error seeding products database:", error);
    }
};

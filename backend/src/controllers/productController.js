import Product from "../models/productModel.js";
import redis from "../config/redis.js";
import { dummyProducts } from "../utils/dummyProducts.js";

// Cache clearing helper for products
const clearProductsCache = async (productId = null) => {
    try {
        const keys = await redis.keys("products:*");
        if (keys.length > 0) {
            await redis.del(keys);
        }
        await redis.del("all_products");
        if (productId) {
            await redis.del(`product:${productId}`);
        }
        console.log("Redis products cache successfully invalidated");
    } catch (err) {
        console.error("Redis error invalidating products cache:", err);
    }
};

// Get all products (with Search, Filter, Sort & Pagination)
export const getProducts = async (req, res) => {
    try {
        const queryParams = req.query || {};
        const cacheKey = `products:${JSON.stringify(queryParams)}`;
        
        try {
            const cachedProducts = await redis.get(cacheKey);
            if (cachedProducts) {
                console.log(`Serving products for query ${JSON.stringify(queryParams)} from cache`);
                return res.status(200).json(JSON.parse(cachedProducts));
            }
        } catch (cacheError) {
            console.error("Redis error fetching products from cache:", cacheError);
        }

        // Build Mongoose Query
        const mongoQuery = {};

        if (queryParams.search) {
            mongoQuery.title = { $regex: queryParams.search, $options: "i" };
        }

        if (queryParams.category && queryParams.category !== "All" && queryParams.category !== "") {
            mongoQuery.category = queryParams.category;
        }

        if (queryParams.minPrice || queryParams.maxPrice) {
            mongoQuery.price = {};
            if (queryParams.minPrice) {
                mongoQuery.price.$gte = Number(queryParams.minPrice);
            }
            if (queryParams.maxPrice) {
                mongoQuery.price.$lte = Number(queryParams.maxPrice);
            }
        }

        // Sort Options
        let sortOption = { createdAt: -1, _id: 1 }; // default newest + stable sort
        if (queryParams.sort) {
            if (queryParams.sort === "price-asc") {
                sortOption = { price: 1, _id: 1 };
            } else if (queryParams.sort === "price-desc") {
                sortOption = { price: -1, _id: 1 };
            } else if (queryParams.sort === "newest") {
                sortOption = { createdAt: -1, _id: 1 };
            }
        }

        // Count matching documents for total pages calculation
        const totalProducts = await Product.countDocuments(mongoQuery);

        // Pagination
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 8;
        const skip = (page - 1) * limit;
        const pages = Math.ceil(totalProducts / limit) || 1;

        const products = await Product.find(mongoQuery)
            .sort(sortOption)
            .skip(skip)
            .limit(limit);

        const mapped = products.map(p => ({
            id: p._id.toString(),
            _id: p._id,
            title: p.title,
            price: p.price,
            description: p.description,
            category: p.category,
            image: p.image,
            rating: p.rating,
            reviews: p.reviews || []
        }));

        const result = {
            products: mapped,
            page,
            pages,
            totalProducts
        };

        try {
            await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);
            console.log(`Cached products for query ${JSON.stringify(queryParams)} in Redis`);
        } catch (cacheError) {
            console.error("Redis error caching products:", cacheError);
        }

        res.status(200).json(result);
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
            rating: product.rating,
            reviews: product.reviews || []
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
        await clearProductsCache();

        res.status(201).json({
            id: product._id.toString(),
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating,
            reviews: product.reviews || []
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
        await clearProductsCache(id);
        
        res.status(200).json({
            id: product._id.toString(),
            _id: product._id,
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category,
            image: product.image,
            rating: product.rating,
            reviews: product.reviews || []
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
        await clearProductsCache(id);

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
            console.log("No products found in DB. Seeding 50 premium dummy products...");
            await Product.insertMany(dummyProducts);
            console.log(`Successfully seeded ${dummyProducts.length} products to MongoDB.`);
        } else {
            console.log(`Database already has ${count} products. Seeding skipped.`);
        }
    } catch (error) {
        console.error("Error seeding products database:", error);
    }
};

// Create product review
export const createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { id } = req.params;

        if (!rating || !comment) {
            return res.status(400).json({ error: "Rating and comment are required" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if user already reviewed this product
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ error: "Product already reviewed" });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);

        // Recalculate average rating and count
        product.rating.count = product.reviews.length;
        product.rating.rate =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        // Round rate to 1 decimal place
        product.rating.rate = Math.round(product.rating.rate * 10) / 10;

        await product.save();

        // Invalidate cache in Redis
        await clearProductsCache(id);

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            rating: product.rating,
            reviews: product.reviews
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ error: "Failed to add review" });
    }
};

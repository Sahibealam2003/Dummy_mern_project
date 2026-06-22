import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/productModel.js";
import redis from "./src/config/redis.js";

dotenv.config();

const resetProducts = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB.");

        console.log("Deleting all products from MongoDB...");
        await Product.deleteMany({});
        console.log("All products deleted from MongoDB.");

        console.log("Clearing Redis cache...");
        await redis.del("products:all");
        // Fetch all product keys if any and delete them
        try {
            const productKeys = await redis.keys("product:*");
            if (productKeys && productKeys.length > 0) {
                await redis.del(productKeys);
                console.log(`Deleted product keys from Redis: ${productKeys.join(", ")}`);
            }
        } catch (redisKeysError) {
            console.error("Error clearing specific product keys from Redis:", redisKeysError);
        }
        console.log("Redis cache cleared.");

        console.log("Seeding products from Fakestore API...");
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
            console.error("Failed to fetch products from Fakestore API.");
        }

    } catch (error) {
        console.error("Error resetting products:", error);
    } finally {
        await mongoose.connection.close();
        // ioredis disconnect
        redis.disconnect();
        console.log("Connections closed. Reset complete!");
        process.exit(0);
    }
};

resetProducts();

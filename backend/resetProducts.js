 import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/productModel.js";
import redis from "./src/config/redis.js";
import { dummyProducts } from "./src/utils/dummyProducts.js";

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
        await redis.del("all_products");
        // Fetch all product keys if any and delete them
        try {
            const productKeys = await redis.keys("product:*");
            if (productKeys && productKeys.length > 0) {
                await redis.del(productKeys);
                console.log(`Deleted product keys from Redis: ${productKeys.join(", ")}`);
            }
            
            const productsListKeys = await redis.keys("products:*");
            if (productsListKeys && productsListKeys.length > 0) {
                await redis.del(productsListKeys);
                console.log(`Deleted products list keys from Redis: ${productsListKeys.join(", ")}`);
            }
        } catch (redisKeysError) {
            console.error("Error clearing specific product keys from Redis:", redisKeysError);
        }
        console.log("Redis cache cleared.");

        console.log("Seeding 50 premium dummy products...");
        await Product.insertMany(dummyProducts);
        console.log(`Successfully seeded ${dummyProducts.length} products to MongoDB.`);

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

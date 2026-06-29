import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;
const redis = redisUrl
    ? new Redis(redisUrl, { maxRetriesPerRequest: null })
    : new Redis({
        host: "localhost",
        port: 6379,
        maxRetriesPerRequest: null
    });

redis.on("connect", () => {
    console.log("Redis is connected");
});

redis.on("error", (err) => {
    console.log("Redis connection error:", err.message);
});

export default redis;

import Redis from "ioredis";


export const redisConnection = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest:null
    }
);


redisConnection.on(
    "connect",
    ()=>{
        console.log("Redis connected");
    }
);


redisConnection.on(
    "error",
    (err)=>{
        console.log("Redis error",err.message);
    }
);
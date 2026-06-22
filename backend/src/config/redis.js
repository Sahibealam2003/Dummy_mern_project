import IORedis from "ioredis";

const redis = new IORedis({
    host: "127.0.0.1",
    port: 6379
});

redis.on("connect",()=>{
    console.log("Redis Connected");
})

redis.on("error",(err)=>{
    console.log("Redis Error",err);
})


export default redis;
import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"
let socket =null
export const  initiateSocket = (userId)=>{
    if(!socket && userId){
        socket = io(SOCKET_URL,{
        withCredentials: true, 
        autoConnect:true           
        })
        socket.on("connect",()=>{
            console.log("socket id",socket.id)
            socket.emit("user:online",userId)
        })
        socket.on("disconnect",()=>{
            console.log("user offline")
        })
    }
    return socket
}

export const disconnectSocket=()=>{
    if(socket){
        socket.disconnect()
        socket =null
    }
}

export const getSocket =()=>socket

    
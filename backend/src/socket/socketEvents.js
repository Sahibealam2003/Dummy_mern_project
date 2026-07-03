export const registerSockeTEvent = (io, socket) => {
  console.log(`User connected: ${socket.id}`);
  // User room join (legacy)
  socket.on("Join", (userId) => {
    socket.join(userId.toString());
    console.log(`User joined room: ${userId}`);
  });

  //UsER online
  socket.on("user:online",(userId)=>{
    socket.join(userId.toString());
    console.log(`User joined room (user:online): ${userId}`)
  })

  socket.on('join-admin',()=>{
    socket.join("admins")
    console.log(`Admin joined room: admins`)
  })

  //disconnect
  socket.on("disconnect",()=>{
    console.log(`User disconnected: ${socket.id}`)
  })
};

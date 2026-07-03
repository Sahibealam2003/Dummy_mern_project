import { getIO } from "../config/socket.js";

//Customer notify
export const emitOrderCreated=(userId,order)=>{
    const io = getIO();
    io.to(userId.toString()).emit("newOrder",{
        order,
        message: "Order placed successfully"
    })
    console.log(`Order created  and sent to user: ${userId}`)
}

//Admin notify
export const emitOrderToNewAdmins = (order)=>{

    const io = getIO()
    io.to("admins").emit("new-order",order)
    console.log("new sent to admins dashboard")
}

//Custommer order UPdate notify
export const emitOrderStatusUpdate = (userId,order)=>{
    const io = getIO();
    io.to(userId.toString()).emit("orderStatusUpdate",{
        orderId: order._id,
        status : order.orderStatus,
        message: `Your order status has been updated to ${order.orderStatus}`
    });
    console.log(`Order status update sent to user: ${userId}`);
}


//Customer cnacel order notify
export const emitOrderCancelledToAdmins = (order)=>{
    const io = getIO();
    io.to("admins").emit("order-cancelled", order);
    console.log("Order cancelled sent to admins dashboard");
}
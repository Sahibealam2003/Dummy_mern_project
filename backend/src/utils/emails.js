export const welcomeEmail = (user) => {
    return {
        subject: "welcome to our app",
        html: `
        <h1>${user.name}</h1>
        <p>Thankyou For Registration On Our App</p>
        `
    }
}


export const orderCancelEmail = (order) => {
    return {
        subject: "Order Cancel",
        html: `
        
        <h1>Your order ${order.orderId} is cancelled</h1>
        <p>refund amount will be credited in your account within 3-5 business days</p>
        <p>Total refund amount : ${order.totalAmount.toFixed(2)}</p>
        `
    }
}

export const placedEmail = (order) => {

    return {

        subject: `Order Placed Successfully - ${order.orderNumber}`,

        html: `<h2>Order Placed Successfully 🎉</h2>
        <p>Hello ${order.customerName}</p>
        <p>
        Your order has been placed successfully.
        </p>
        <h3>Order Details</h3>
        <p>
        Order ID: ${order.orderNumber}
        </p>
        <p>
        Total Amount: ₹${order.totalAmount}
        </p>
        <h3>Products</h3>
        ${order.products.map(item => `
        <p>
        ${item.title}
        <br>
        Quantity: ${item.quantity}
        <br>
        Price: ₹${item.price}
        </p>
        `).join("")}
        <h3>Delivery Address</h3>
        <p>
        ${order.address}
        </p>
        <p>
        Thank you for shopping with ShopX
        </p>
`

    }

}

export const processingEmail = (order) => {

    return {

        subject: `Order Processing - ${order.orderNumber}`,

        html: `<h2>Your order is being processed ⚙️</h2>
                <p>
                We have started preparing your order.
                </p>
                 <p>
                    Order ID:
                    ${order.orderNumber}
                    </p>
                    <p>
                    Our team is packing your items.
                    </p>`
    }
}

export const shippedEmail = (order) => {

    return {
        subject: `Order Shipped - ${order.orderNumber}`,
        html: `
        <div style="font-family: Arial, sans-serif;">
            <h2>Your Order Has Been Shipped 🚚</h2>
            <p>
            Hello ${order.customerName || "Customer"},
            </p>
            <p>
            Great news! Your order has been shipped and is on the way.
            </p>
            <h3>Order Details</h3>
            <p>
            <b>Order ID:</b> ${order.orderNumber}
            </p>
            <p>
            <b>Total Amount:</b> ₹${order.totalAmount}
            </p>
            <h3>Products</h3>
            ${order.products.map(item => `
                <div>
                    <p>
                    <b>${item.title}</b>
                    </p>
                    <p>
                    Quantity: ${item.quantity}
                    </p>
                    <p>
                    Price: ₹${item.price}
                    </p>
                </div>
                <hr>
            `).join("")}
            <h3>Delivery Address</h3>
            <p>
            ${order.address}
            </p>
            <p>
            Your package is expected to arrive within 3-5 business days.
            </p>
            <p>
            You will receive another update when your order is out for delivery.
            </p>
            <br>
            <p>
            Thanks,<br>
            ShopX Team
            </p>
        </div>
        `
    }
}

export const deliveredMail = (order)=>{
    return{
        
    }
}
export const deliveredEmail = (order) => {

    return {

        subject: `Order Delivered Successfully - ${order.orderNumber}`,

        html: `

        <div style="font-family: Arial, sans-serif;">


            <h2>Your Order Has Been Delivered 🎉</h2>


            <p>
            Hello ${order.customerName || "Customer"},
            </p>


            <p>
            Your order has been delivered successfully.
            We hope you enjoy your purchase.
            </p>



            <h3>Order Details</h3>


            <p>
            <b>Order ID:</b> ${order.orderNumber}
            </p>


            <p>
            <b>Total Amount:</b> ₹${order.totalAmount}
            </p>



            <h3>Products</h3>


          




            <h3>Delivery Address</h3>


            <p>
            ${order.address}
            </p>



            <p>
            Thank you for shopping with ShopX.
            We look forward to serving you again.
            </p>




            <p>
            If you have any issue with your order, please contact support.
            </p>



            <br>


            <p>
            Thanks,<br>
            ShopX Team
            </p>



        </div>

        `
    }
}

export const resetPasswordEmail = (data) => {
    return {
        subject: "Reset Your Password",
        html: `
            <h2>Hello ${data.name}</h2>
            <p>You requested password reset</p>
            <a href="${data.resetUrl}">Reset Password</a>
        `
    };
};

export const orderUnderProcessingEmail =(data)=>{
    return {
        subject:"Your Order is Under Processing",
        html:`
        <p>${data.name}</p>
        <h1>Your Order is Under Processing</h1>
        <p>Thankyou For Shopping With Us</p>
        `
    }
}
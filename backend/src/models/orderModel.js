import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            title: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            image: {
                type: String
            }
        }
    ],
    shippingAddress: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        status: {
            type: String,
            default: "Pending"
        },
        cardLastFour: {
            type: String,
            default: "••••"
        },
        paymentMethod: {
            type: String,
            default: "Card"
        }
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ["Pending", "Processing", "Shipped", "Delivered"],
        default: "Pending"
    }
}, {
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

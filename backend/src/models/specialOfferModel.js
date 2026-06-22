import mongoose from "mongoose";

const specialOfferSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Coupon code is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    discount: {
        type: String,
        required: [true, "Discount value is required"]
    },
    title: {
        type: String,
        required: [true, "Offer title is required"],
        trim: true
    },
    desc: {
        type: String,
        required: [true, "Offer description is required"]
    },
    expiry: {
        type: String,
        required: [true, "Expiry date description is required"]
    },
    tag: {
        type: String,
        required: [true, "Tag is required"],
        trim: true
    },
    icon: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        default: "#e8622a"
    },
    bg: {
        type: String,
        default: "#fff3ed"
    }
}, {
    timestamps: true
});

const SpecialOffer = mongoose.model("SpecialOffer", specialOfferSchema);
export default SpecialOffer;

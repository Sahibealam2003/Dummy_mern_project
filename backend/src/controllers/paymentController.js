import razorpay from "../config/razorpay.js";
import crypto from "crypto"

export const createPaymentOrder = async (req,res)=>{

try{


const options = {

amount: Math.round(req.body.amount * 100),

currency:"INR",

receipt:crypto.randomBytes(10).toString("hex")

}



const order = await razorpay.orders.create(options);



res.status(200).json({

success:true,

order,

key: process.env.RAZORPAY_KEY_ID

})


}catch(error){

console.error("Error in createPaymentOrder:", error);

res.status(500).json({

success:false,

message:error.message

})


}


}


export const verifyPayment = async (req, res) => {


    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature

    } = req.body;



    const body =
        razorpay_order_id
        +
        "|"
        +
        razorpay_payment_id;



    const expectedSignature =
        crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");



    if (expectedSignature === razorpay_signature) {


        return res.json({

            success: true,

            message: "Payment Successful"

        })


    }


    res.status(400).json({

        success: false,

        message: "Payment Failed"

    })


}
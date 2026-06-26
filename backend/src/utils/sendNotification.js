import messaging from "../config/firebase.js";


export const sendNotification = async (
    fcmToken,
    title,
    body
) => {

    try {

        const message = {

            notification:{
                title,
                body
            },

            token:fcmToken

        };


        const response = await messaging.send(message);


        console.log(
            "Notification sent:",
            response
        );


    } catch(error){

        console.log(
            "Notification error:",
            error.message
        );

    }

};
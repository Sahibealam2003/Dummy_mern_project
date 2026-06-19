import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_MAIL && process.env.SMTP_PASSWORD;

    if (!hasSmtpConfig) {
        console.log("\n=========================================");
        console.log(`[DEV MODE] Email to: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message:\n${options.message}`);
        console.log("=========================================\n");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'MERN App'}" <${process.env.SMTP_MAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || `<p>${options.message}</p>`,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;

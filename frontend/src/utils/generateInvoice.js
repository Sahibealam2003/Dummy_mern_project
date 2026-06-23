import { jsPDF } from "jspdf";

/**
 * Programmatically generates and triggers download of a premium vector invoice PDF.
 * @param {Object} order - The order document containing items, prices, shipping, etc.
 */
export const generateInvoice = (order) => {
    if (!order) return;

    // Create A4 PDF Document (210mm x 297mm)
    const doc = new jsPDF("p", "mm", "a4");

    // Company/Brand Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(232, 98, 42); // SHOPx Orange
    doc.text("SHOPx", 20, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 78, 70);
    doc.text("Premium eCommerce Storefront", 20, 36);
    doc.text("support@shopx.com", 20, 41);

    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(44, 36, 32); // Dark brown / black
    doc.text("INVOICE", 150, 30);

    // Top Divider Line
    doc.setDrawColor(237, 232, 226);
    doc.setLineWidth(0.5);
    doc.line(20, 46, 190, 46);

    // Metadata Row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 126, 116);
    doc.text("ORDER NUMBER", 20, 54);
    doc.text("DATE PLACED", 85, 54);
    doc.text("PAYMENT STATUS", 150, 54);

    const orderNo = order.orderNumber || "N/A";
    const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
    const status = order.paymentInfo?.status || "Paid";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(44, 36, 32);
    doc.text(orderNo, 20, 62);
    doc.text(dateStr, 85, 62);
    doc.setTextColor(44, 122, 74); // Emerald color for Paid status
    doc.text(status, 150, 62);

    // Address Divider Line
    doc.setDrawColor(237, 232, 226);
    doc.line(20, 68, 190, 68);

    // Billing Info Block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 126, 116);
    doc.text("BILL TO", 20, 76);

    const clientName = order.shippingAddress?.name || order.user?.name || "Customer Account";
    const street = order.shippingAddress?.address || "N/A";
    const cityZip = `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.zip || ""}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(44, 36, 32);
    doc.text(clientName, 20, 83);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(90, 78, 70);
    doc.text(street, 20, 89);
    doc.text(cityZip, 20, 95);

    // Items Table Header Box
    doc.setFillColor(245, 243, 239);
    doc.rect(20, 105, 170, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 126, 116);
    doc.text("ITEM DESCRIPTION", 24, 110.5);
    doc.text("UNIT PRICE", 115, 110.5);
    doc.text("QTY", 145, 110.5);
    doc.text("TOTAL PRICE", 168, 110.5);

    // Draw Items
    let currentY = 120;
    const items = order.orderItems || [];
    
    items.forEach((item, index) => {
        // Truncate title if extremely long
        const cleanTitle = item.title.length > 42 
            ? item.title.substring(0, 40) + "..." 
            : item.title;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(44, 36, 32);
        doc.text(cleanTitle, 24, currentY);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(90, 78, 70);
        doc.text(`$${item.price.toFixed(2)}`, 115, currentY);
        doc.text(item.quantity.toString(), 145, currentY);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 36, 32);
        const lineTotal = item.price * item.quantity;
        doc.text(`$${lineTotal.toFixed(2)}`, 168, currentY);

        // Underline row
        doc.setDrawColor(245, 243, 239);
        doc.setLineWidth(0.3);
        doc.line(20, currentY + 4, 190, currentY + 4);

        currentY += 11;
    });

    // reverse-engineer subtotal, tax, discounts based on standard checkout rules
    const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const tax = subtotal * 0.1;
    const finalTotal = order.totalPrice;
    const shipping = order.shippingPrice !== undefined ? order.shippingPrice : (subtotal >= 49 ? 0.0 : 5.99);
    
    // discount is the difference if finalTotal is less than subtotal + tax + shipping
    let discount = (subtotal + tax + shipping) - finalTotal;
    if (discount < 0.02) discount = 0; // handle rounding errors

    // Summary calculations block (keep inside A4)
    currentY += 4;
    
    // Subtotal Row
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(140, 126, 116);
    doc.text("Subtotal:", 130, currentY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 36, 32);
    doc.text(`$${subtotal.toFixed(2)}`, 168, currentY);
    
    currentY += 6;

    // Shipping Row
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 126, 116);
    doc.text("Shipping:", 130, currentY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 36, 32);
    doc.text(shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`, 168, currentY);
    
    currentY += 6;

    // Tax Row
    doc.setFont("helvetica", "normal");
    doc.setTextColor(140, 126, 116);
    doc.text("Tax (10%):", 130, currentY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 36, 32);
    doc.text(`$${tax.toFixed(2)}`, 168, currentY);

    if (discount > 0) {
        currentY += 6;
        doc.setFont("helvetica", "medium");
        doc.setTextColor(44, 122, 74); // Green for savings
        doc.text("Promo Discount:", 130, currentY);
        doc.text(`-$${discount.toFixed(2)}`, 168, currentY);
    }

    currentY += 8;
    
    // Total Row Divider
    doc.setDrawColor(90, 78, 70);
    doc.setLineWidth(0.5);
    doc.line(125, currentY - 4, 190, currentY - 4);

    // Final Total Row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(232, 98, 42); // Accent color for final total
    doc.text("Total Paid:", 130, currentY);
    doc.text(`$${finalTotal.toFixed(2)}`, 168, currentY);

    // Professional Footer
    doc.setDrawColor(237, 232, 226);
    doc.setLineWidth(0.5);
    doc.line(20, 260, 190, 260);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(140, 126, 116);
    doc.text("Thank you for shopping with SHOPx!", 105, 270, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("This document is a valid invoice receipt of payment. For support questions, reach out to support@shopx.com", 105, 275, { align: "center" });

    // Save and Trigger browser download
    doc.save(`Invoice_${orderNo}.pdf`);
};

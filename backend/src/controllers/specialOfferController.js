import SpecialOffer from "../models/specialOfferModel.js";

// Fetch all special offers (Public)
export const getSpecialOffers = async (req, res) => {
    try {
        const offers = await SpecialOffer.find().sort({ createdAt: -1 });
        res.status(200).json(offers);
    } catch (error) {
        console.error("Error in getSpecialOffers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Create a special offer (Admin only)
export const createSpecialOffer = async (req, res) => {
    try {
        const { code, discount, title, desc, expiry, tag, icon, color, bg } = req.body;

        if (!code || !discount || !title || !desc || !expiry || !tag) {
            return res.status(400).json({ error: "Required fields are missing" });
        }

        const existingOffer = await SpecialOffer.findOne({ code: code.toUpperCase() });
        if (existingOffer) {
            return res.status(400).json({ error: "Special offer with this coupon code already exists" });
        }

        const newOffer = await SpecialOffer.create({
            code: code.toUpperCase(),
            discount,
            title,
            desc,
            expiry,
            tag,
            icon: icon || "",
            color: color || "#e8622a",
            bg: bg || "#fff3ed"
        });

        res.status(201).json({
            success: true,
            message: "Special offer created successfully",
            specialOffer: newOffer
        });
    } catch (error) {
        console.error("Error in createSpecialOffer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update a special offer (Admin only)
export const updateSpecialOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discount, title, desc, expiry, tag, icon, color, bg } = req.body;

        const offer = await SpecialOffer.findById(id);
        if (!offer) {
            return res.status(404).json({ error: "Special offer not found" });
        }

        if (code) {
            const existingOffer = await SpecialOffer.findOne({ code: code.toUpperCase() });
            if (existingOffer && existingOffer._id.toString() !== id) {
                return res.status(400).json({ error: "Another special offer with this coupon code already exists" });
            }
            offer.code = code.toUpperCase();
        }

        if (discount !== undefined) offer.discount = discount;
        if (title !== undefined) offer.title = title;
        if (desc !== undefined) offer.desc = desc;
        if (expiry !== undefined) offer.expiry = expiry;
        if (tag !== undefined) offer.tag = tag;
        if (icon !== undefined) offer.icon = icon;
        if (color !== undefined) offer.color = color;
        if (bg !== undefined) offer.bg = bg;

        await offer.save();

        res.status(200).json({
            success: true,
            message: "Special offer updated successfully",
            specialOffer: offer
        });
    } catch (error) {
        console.error("Error in updateSpecialOffer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a special offer (Admin only)
export const deleteSpecialOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offer = await SpecialOffer.findById(id);

        if (!offer) {
            return res.status(404).json({ error: "Special offer not found" });
        }

        await SpecialOffer.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Special offer deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteSpecialOffer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Seeding logic for Special Offers
export const seedSpecialOffers = async () => {
    try {
        const count = await SpecialOffer.countDocuments();
        if (count === 0) {
            console.log("No special offers found in DB. Seeding initial coupons...");
            
            const initialCoupons = [
                {
                    code: "NEWUSER20",
                    discount: "20% OFF",
                    title: "Welcome Discount",
                    desc: "Valid on your first purchase. No minimum order value.",
                    expiry: "Expires Jul 31, 2026",
                    tag: "WELCOME DEAL",
                    icon: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>`,
                    color: "#e8622a",
                    bg: "#fff3ed"
                },
                {
                    code: "SHOP10",
                    discount: "10% OFF",
                    title: "Site-wide Promotion",
                    desc: "Save 10% on orders above $49 across all categories.",
                    expiry: "Expires Dec 31, 2026",
                    tag: "SITE-WIDE",
                    icon: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`,
                    color: "#e8622a",
                    bg: "#fff3ed"
                },
                {
                    code: "FREESHIP",
                    discount: "FREE SHIPPING",
                    title: "Standard Delivery",
                    desc: "Get free standard shipping on orders above $25.",
                    expiry: "Expires Oct 15, 2026",
                    tag: "SHIPPING",
                    icon: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>`,
                    color: "#2c7a4a",
                    bg: "#f0fdf4"
                },
                {
                    code: "ELECTRO15",
                    discount: "15% OFF",
                    title: "Electronics Event",
                    desc: "Valid on all computers, smartphones, and accessories.",
                    expiry: "Expires Jun 30, 2026",
                    tag: "CATEGORY DEAL",
                    icon: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
                    color: "#2563eb",
                    bg: "#eff6ff"
                },
                {
                    code: "FASHION30",
                    discount: "30% OFF",
                    title: "Summer Collection",
                    desc: "Save big on selected clothing and apparel.",
                    expiry: "Expires Jun 25, 2026",
                    tag: "FLASH SALE",
                    icon: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C9 2 7 5 7 8c0 2 1 3.5 2.5 4.5L8 22h8l-1.5-9.5C16 11.5 17 10 17 8c0-3-2-6-5-6z"/></svg>`,
                    color: "#db2777",
                    bg: "#fdf2f8"
                },
                {
                    code: "CASHBACK5",
                    discount: "5% CASHBACK",
                    title: "Payment Reward",
                    desc: "Get 5% cashback instantly when paying via card.",
                    expiry: "Expires Aug 12, 2026",
                    tag: "CARD PROMO",
                    icon: `<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
                    color: "#7c3aed",
                    bg: "#f5f3ff"
                }
            ];

            await SpecialOffer.insertMany(initialCoupons);
            console.log("Successfully seeded initial special offers to MongoDB.");
        } else {
            console.log(`Database already has ${count} special offers. Seeding skipped.`);
        }
    } catch (error) {
        console.error("Error seeding special offers database:", error);
    }
};

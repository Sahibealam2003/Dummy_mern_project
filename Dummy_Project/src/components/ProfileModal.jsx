import React, { useEffect } from "react";

const INFO_ROW_CLS = "flex flex-col border-b border-[#f5f3ef] pb-1 last:border-0 last:pb-0";
const INFO_LABEL_CLS = "text-[10px] font-extrabold uppercase tracking-widest text-[#8c7e74] mb-1";
const INFO_VAL_CLS = "text-sm font-semibold text-[#2c2420]";

const ProfileModal = ({ isOpen, onClose, user }) => {
    // Dismiss modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Disable body scroll when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !user) return null;

    return (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45">
            {/* Click-out overlay */}
            <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

            {/* Modal Box */}
            <div className="animate-scale-in glass relative w-full max-w-sm overflow-hidden rounded-3xl p-6 shadow-2xl shadow-black/10 md:p-8">
                {/* Close X Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:bg-[#fdf9f5] hover:text-[#2c2420] hover:rotate-90 transition-all duration-200"
                    aria-label="Close profile"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Profile Header */}
                <div className="flex flex-col items-center mb-4 pt-2">
                    <span className="rounded-full bg-[#fff3ed] border border-[#e8622a]/20 px-3 text-[9px] font-bold uppercase tracking-widest text-[#e8622a] mb-2">
                        Member Account
                    </span>

                    {/* Large Circle Avatar */}
                    <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#e8622a]/30 shadow-lg mb-3">
                        {user.avatar ? (
                            <img src={user.avatar} className="h-full w-full object-cover" alt="avatar" />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center text-2xl font-black text-white uppercase"
                                style={{ background: "linear-gradient(135deg, #e8622a, #c44e1e)" }}
                            >
                                {user.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "U"}
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-[#2c2420]">
                        {user.name}
                    </h2>
                    <p className="text-xs text-[#8c7e74] font-medium mt-0.5">
                        {user.email}
                    </p>
                </div>

                {/* User Details Details */}
                <div className="bg-[#fafafa]/50 border border-[#ede8e2] rounded-2xl p-4 space-y-3 mb-2">
                    <div className={INFO_ROW_CLS}>
                        <span className={INFO_LABEL_CLS}>Full Name</span>
                        <span className={INFO_VAL_CLS}>{user.name}</span>
                    </div>

                    <div className={INFO_ROW_CLS}>
                        <span className={INFO_LABEL_CLS}>Email Address</span>
                        <span className={INFO_VAL_CLS}>{user.email}</span>
                    </div>

                    <div className={INFO_ROW_CLS}>
                        <span className={INFO_LABEL_CLS}>Phone Number</span>
                        <span className={INFO_VAL_CLS}>{user.phoneNumber || "Not provided"}</span>
                    </div>

                    <div className={INFO_ROW_CLS}>
                        <span className={INFO_LABEL_CLS}>Verification Status</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {user.isVerified ? (
                                <>
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Verified Account</span>
                                </>
                            ) : (
                                <>
                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Unverified</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Close Button */}
                <button
                    onClick={onClose}
                    className="btn-glow flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8622a] to-[#c44e1e] py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#e8622a]/20 transition-all duration-200 hover:opacity-95 hover:scale-[1.02]"
                >
                    Close Profile
                </button>
            </div>
        </div>
    );
};

export default ProfileModal;

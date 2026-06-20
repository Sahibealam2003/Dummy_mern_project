import React, { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../reducers/authSlice";
import { updateProfileApi } from "../services/authApi";

const INFO_ROW_CLS = "flex flex-col border-b border-[#f5f3ef] pb-1 last:border-0 last:pb-0";
const INFO_LABEL_CLS = "text-[10px] font-extrabold uppercase tracking-widest text-[#8c7e74] mb-1";
const INFO_VAL_CLS = "text-sm font-semibold text-[#2c2420]";

const ProfileModal = ({ isOpen, onClose, user }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || "");
            setPhoneNumber(user.phoneNumber || "");
            setAvatarFile(null);
            setAvatarPreview(user.avatar || "");
            setIsEditing(false);
            setError("");
            setSuccessMsg("");
        }
    }, [isOpen, user]);

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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Avatar image must be smaller than 2MB");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setError("");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("phoneNumber", phoneNumber);
            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            const data = await updateProfileApi(formData);
            if (data.success) {
                dispatch(updateUser(data.user));
                setSuccessMsg("Profile updated successfully!");
                setTimeout(() => {
                    setIsEditing(false);
                    setSuccessMsg("");
                }, 1200);
            } else {
                setError(data.error || "Update failed.");
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setError(err.response?.data?.error || "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setName(user.name || "");
        setPhoneNumber(user.phoneNumber || "");
        setAvatarFile(null);
        setAvatarPreview(user.avatar || "");
        setIsEditing(false);
        setError("");
        setSuccessMsg("");
    };

    return (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[#2c2420]/45">
            {/* Click-out overlay */}
            <div className="absolute inset-0 cursor-pointer" onClick={loading ? undefined : onClose} />

            {/* Modal Box */}
            <div className="animate-scale-in glass relative w-full max-w-sm overflow-hidden rounded-2xl p-6 shadow-2xl shadow-black/10 md:p-8">
                {/* Edit / Save Button (absolute top-4 left-4) */}
                {!isEditing ? (
                    <button
                        key="edit-btn"
                        onClick={() => setIsEditing(true)}
                        className="absolute top-4 left-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#e8622a] hover:bg-[#fffcfb] hover:text-[#d94e14] active:scale-95 transition-all duration-200"
                        aria-label="Edit profile"
                        type="button"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                ) : (
                    <button
                        key="save-btn"
                        type="submit"
                        form="profile-edit-form"
                        disabled={loading || name.trim().length < 3}
                        className="absolute top-4 left-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#e8622a] to-[#d94e14] text-white shadow-lg shadow-[#e8622a]/15 hover:shadow-[#e8622a]/35 active:scale-95 transition-all disabled:opacity-50"
                        aria-label="Save changes"
                    >
                        {loading ? (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </button>
                )}

                {/* Close X Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#ede8e2] bg-white text-[#8c7e74] hover:bg-[#fdf9f5] hover:text-[#2c2420] hover:rotate-90 transition-all duration-200 disabled:opacity-40"
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

                    {/* Circle Avatar (Interactive in Edit Mode) */}
                    <div className="relative group mb-3 select-none">
                        <div 
                            onClick={() => isEditing && !loading && fileInputRef.current?.click()}
                            className={`h-20 w-20 rounded-full overflow-hidden border-2 shadow-lg relative flex items-center justify-center ${
                                isEditing ? "border-[#e8622a] cursor-pointer hover:border-[#d94e14] transition-all hover:scale-105" : "border-[#e8622a]/30"
                            }`}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} className="h-full w-full object-cover" alt="avatar" />
                            ) : (
                                <div
                                    className="flex h-full w-full items-center justify-center text-2xl font-black text-white uppercase"
                                    style={{ background: "linear-gradient(135deg, #e8622a, #c44e1e)" }}
                                >
                                    {name ? name.split(" ").map(n => n[0]).join("").slice(0, 2) : "U"}
                                </div>
                            )}

                            {/* Camera overlay hover in Edit Mode */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Plus badge helper */}
                        {isEditing && (
                            <div 
                                onClick={() => !loading && fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 h-5 w-5 bg-[#e8622a] border border-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all text-white font-black text-xs"
                            >
                                +
                            </div>
                        )}

                        <input 
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-[#2c2420]">
                        {isEditing ? (name || "New Member") : user.name}
                    </h2>
                    <p className="text-xs text-[#8c7e74] font-medium mt-0.5">
                        {user.email}
                    </p>
                </div>

                {/* Error & Success Messages */}
                {error && (
                    <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 animate-shake">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700">
                        {successMsg}
                    </div>
                )}

                {/* Profile Form Details */}
                <form id="profile-edit-form" onSubmit={handleSave} className="space-y-4 mb-5">
                    <div className="bg-[#fafafa]/50 border border-[#ede8e2] rounded-xl p-4 space-y-4">
                        {/* Name Input / Row */}
                        <div className={isEditing ? "flex flex-col border-b border-[#ede8e2] pb-1.5 focus-within:border-[#e8622a] transition-all" : INFO_ROW_CLS}>
                            <span className={INFO_LABEL_CLS}>Full Name</span>
                            {isEditing ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <svg className="h-4 w-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        disabled={loading}
                                        className="w-full bg-transparent text-sm font-semibold text-[#2c2420] outline-none placeholder-stone-400"
                                        required
                                        minLength={3}
                                    />
                                </div>
                            ) : (
                                <span className={INFO_VAL_CLS}>{user.name}</span>
                            )}
                        </div>

                        {/* Email Row (Always read-only) */}
                        <div className={INFO_ROW_CLS}>
                            <span className={INFO_LABEL_CLS}>Email Address</span>
                            <span className={INFO_VAL_CLS}>{user.email}</span>
                        </div>

                        {/* Phone Number Input / Row */}
                        <div className={isEditing ? "flex flex-col border-b border-[#ede8e2] pb-1.5 focus-within:border-[#e8622a] transition-all" : INFO_ROW_CLS}>
                            <span className={INFO_LABEL_CLS}>Phone Number</span>
                            {isEditing ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <svg className="h-4 w-4 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <input 
                                        type="text" 
                                        value={phoneNumber} 
                                        onChange={(e) => setPhoneNumber(e.target.value)} 
                                        disabled={loading}
                                        className="w-full bg-transparent text-sm font-semibold text-[#2c2420] outline-none placeholder-stone-400"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            ) : (
                                <span className={INFO_VAL_CLS}>{user.phoneNumber || "Not provided"}</span>
                            )}
                        </div>

                        {/* Verification Status (Read-only) */}
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


                </form>
            </div>
        </div>
    );
};

export default ProfileModal;

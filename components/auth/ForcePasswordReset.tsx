"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";
import useAuthStore from "@/data/store/useAuthStore";
import authService from "@/data/services/authService";

export default function ForcePasswordReset({ onClose }: { onClose: () => void }) {
    const { user, token, setUser } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }
        if (newPassword.length < 6) {
            return setError("Password must be at least 6 characters long");
        }

        setLoading(true);
        try {
            await authService.resetAdminPassword({ currentPassword, newPassword });
            setSuccess("Password updated successfully!");
            
            // Update local user state so popup closes permanently
            if (user) {
                setUser({ ...user, isPasswordResetRequired: false });
            }
            
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 text-center border-b border-gray-100 relative">
                    <button 
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Do it later"
                    >
                        <X size={20} />
                    </button>
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-primary w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Update Your Password</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        For security reasons, we strongly recommend changing your temporary password immediately.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 text-center">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current (Temporary) Password</label>
                        <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                        >
                            Do it later
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success ? true : false}
                            className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-70"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

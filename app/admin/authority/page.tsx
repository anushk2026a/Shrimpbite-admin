"use client";

import { useState } from "react";
import { Shield, ShieldCheck, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import roleService from "@/data/services/roleService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AuthorityPage() {
    const queryClient = useQueryClient();
    
    // Edit Modal state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    
    // Bulk Update Mode (UI only for now, can implement later)
    const [isBulkUpdateMode, setIsBulkUpdateMode] = useState(false);

    const availableModules = [
        "Dashboard",
        "Retailers",
        "App Users",
        "Order Management",
        "Payout Settlements",
        "Communication Hub",
        "Admin role",
        "Control Authority"
    ];

    // Using React Query for roles fetching
    const { data: roles = [], isLoading: loading } = useQuery({
        queryKey: ["adminRoles"],
        queryFn: async () => {
            const res = await roleService.getRoles();
            return res.roles || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const handleOpenEdit = (role: any) => {
        setEditingRole(role);
        setSelectedModules(role.modules || []);
        setIsEditOpen(true);
    };

    const toggleModule = (module: string) => {
        setSelectedModules((prev: string[]) => 
            prev.includes(module) 
                ? prev.filter((m: string) => m !== module)
                : [...prev, module]
        );
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await roleService.updateRole(editingRole._id, { modules: selectedModules });
            toast.success("Role updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
            setIsEditOpen(false);
            setEditingRole(null);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update role");
        }
    };

    const toggleRoleStatus = async (roleId: string, currentStatus: boolean) => {
        try {
            await roleService.updateRole(roleId, { isActive: !currentStatus });
            toast.success(`Role ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            queryClient.invalidateQueries({ queryKey: ["adminRoles"] });
        } catch (err: any) {
            toast.error("Failed to toggle status");
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Control Authority</h1>
                    <p className="text-text-muted">Manage system-level permissions and access controls.</p>
                </div>
                <button 
                    onClick={() => setIsBulkUpdateMode(!isBulkUpdateMode)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm",
                        isBulkUpdateMode 
                            ? "bg-gray-100 text-gray-700"
                            : "bg-primary text-white hover:bg-primary-dark shadow-primary/20"
                    )}
                >
                    {isBulkUpdateMode ? <X size={16} /> : <ShieldCheck size={16} />}
                    {isBulkUpdateMode ? "Cancel Updates" : "Update Permissions"}
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-border-custom">
                    <h2 className="text-lg font-bold">Role Permissions Matrix</h2>
                </div>
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-xs font-bold text-primary uppercase">
                                <tr>
                                    <th className="px-6 py-4">System Role</th>
                                    <th className="px-6 py-4">Accessible Modules</th>
                                    <th className="px-6 py-4">Active Users</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {roles.map((role: any) => (
                                    <tr key={role._id} className="hover:bg-background-soft transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} className="text-primary shrink-0" />
                                                <span className="font-bold capitalize">{role.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2 max-w-md">
                                                {role.modules.map((mod: string) => (
                                                    <span key={mod} className="text-xs font-medium px-2 py-1 bg-background-soft rounded border border-border-custom">
                                                        {mod}
                                                    </span>
                                                ))}
                                                {role.modules.length === 0 && (
                                                    <span className="text-xs text-gray-400 italic">No access granted</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{role.activeCapacity || 0}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => isBulkUpdateMode && toggleRoleStatus(role._id, role.isActive)}
                                                disabled={!isBulkUpdateMode}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all",
                                                    role.isActive ? "bg-primary-light text-primary" : "bg-red-50 text-red-500",
                                                    isBulkUpdateMode && "hover:ring-2 hover:ring-offset-1 cursor-pointer"
                                                )}>
                                                {role.isActive ? "Active" : "Inactive"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleOpenEdit(role)}
                                                className={cn(
                                                    "px-4 py-1 flex items-center gap-2 mx-auto rounded-full text-[10px] font-bold border uppercase tracking-widest transition-all",
                                                    "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white whitespace-nowrap"
                                                )}>
                                                <Edit2 size={12} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {roles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No roles configured. Create roles from the Access Control page.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Role Modal */}
            {isEditOpen && editingRole && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsEditOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold">Edit Role: <span className="capitalize text-primary">{editingRole.name}</span></h2>
                                <p className="text-xs text-text-muted mt-1">Configure accessible modules for this system role.</p>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleUpdateRole} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Module Permissions</label>
                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {availableModules.map(mod => (
                                        <label key={mod} className={cn(
                                            "flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all",
                                            selectedModules.includes(mod) ? "bg-primary/5 border-primary/30" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                                        )}>
                                            <input
                                                type="checkbox"
                                                checked={selectedModules.includes(mod)}
                                                onChange={() => toggleModule(mod)}
                                                className="w-4 h-4 text-primary rounded focus:ring-primary border-gray-300"
                                            />
                                            <span className={cn("text-sm font-medium", selectedModules.includes(mod) ? "text-primary font-bold" : "text-gray-600")}>{mod}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                                    <Check size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

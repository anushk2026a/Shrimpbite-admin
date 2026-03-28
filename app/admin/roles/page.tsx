"use client";

import { useState, useEffect } from "react";
import { Shield, UserPlus, MoreVertical, Edit2, Trash2, Key, Users, Plus, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import roleService from "@/data/services/roleService";
import { toast } from "sonner";

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Create Role form state
    const [newRoleName, setNewRoleName] = useState("");
    const [selectedModules, setSelectedModules] = useState<string[]>([]);

    // Invite Admin form state
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRoleId, setInviteRoleId] = useState("");

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

    const loadData = async () => {
        setLoading(true);
        try {
            const [rolesRes, adminsRes] = await Promise.all([
                roleService.getRoles(),
                roleService.getAdmins()
            ]);
            setRoles(rolesRes.roles || []);
            setAdmins(adminsRes.admins || []);
        } catch (error) {
            console.error("Failed to load roles/admins", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await roleService.createRole({ name: newRoleName, modules: selectedModules });
            toast.success("Role created successfully!");
            setIsCreateRoleOpen(false);
            setNewRoleName("");
            setSelectedModules([]);
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to create role");
        }
    };

    const handleInviteAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await roleService.inviteAdmin({
                name: inviteName,
                email: inviteEmail,
                roleId: inviteRoleId
            });
            toast.success("Admin invited successfully!");
            setIsInviteOpen(false);
            setInviteName("");
            setInviteEmail("");
            setInviteRoleId("");
            loadData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to invite admin");
        }
    };

    const toggleModule = (module: string) => {
        setSelectedModules(prev => 
            prev.includes(module) 
                ? prev.filter(m => m !== module)
                : [...prev, module]
        );
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Access Control</h1>
                    <p className="text-text-muted">Command center for platform permissions and administrative hierarchy.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsInviteOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-border-custom text-text-primary hover:bg-background-soft transition-all text-sm font-medium shadow-sm"
                    >
                        <Mail size={16} /> Invite Admin
                    </button>
                    <button 
                        onClick={() => setIsCreateRoleOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium shadow-md shadow-primary/20"
                    >
                        <UserPlus size={16} /> Create New Role
                    </button>
                </div>
            </div>

            {/* Role Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Active Admins", value: admins.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary-light" },
                    { label: "Security Level", value: "Enterprise", icon: Shield, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "System Health", value: "Optimal", icon: Key, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border-custom shadow-sm flex items-center gap-4">
                        <div className={cn("p-4 rounded-xl", stat.bg, stat.color)}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-border-custom flex items-center justify-between">
                    <h3 className="text-lg font-bold">Role Hierarchy</h3>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-background-soft rounded-lg transition-colors">
                            <MoreVertical size={18} className="text-text-muted" />
                        </button>
                    </div>
                </div>
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Role Profile</th>
                                    <th className="px-6 py-4">Security Level</th>
                                    <th className="px-6 py-4">Active Capacity</th>
                                    <th className="px-6 py-4">Last Modified</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-custom text-sm">
                                {roles.map((role) => (
                                    <tr key={role._id} className="hover:bg-background-soft/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-background-soft flex items-center justify-center text-text-muted group-hover:bg-primary-light group-hover:text-primary transition-all">
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground capitalize">{role.name}</p>
                                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest truncate max-w-[150px]">
                                                        {role.modules.length > 0 ? role.modules[0] : "None"}
                                                        {role.modules.length > 1 && ` +${role.modules.length - 1} MORE`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex gap-0.5">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className={cn("w-1.5 h-3 rounded-sm", i < Math.min(Math.ceil(role.modules.length / 3) || 1, 3) ? "bg-primary" : "bg-slate-200")}></div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold text-text-muted">Level {Math.ceil(role.modules.length / 3) || 1}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex -space-x-2">
                                                {[...Array(Math.min(role.activeCapacity || 0, 3))].map((_, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin${role._id}${i}`} alt="" />
                                                    </div>
                                                ))}
                                                {(role.activeCapacity || 0) > 3 && (
                                                    <div className="w-7 h-7 rounded-full border-2 border-white bg-primary-light flex items-center justify-center text-[10px] font-bold text-primary">
                                                        +{(role.activeCapacity || 0) - 3}
                                                    </div>
                                                )}
                                                {(role.activeCapacity || 0) === 0 && (
                                                    <span className="text-xs text-text-muted font-medium ml-2">No users</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-text-muted">
                                            {new Date(role.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded text-[10px] font-black uppercase border",
                                                role.isActive ? "bg-primary-light text-primary border-primary/10" : "bg-red-50 text-red-500 border-red-100"
                                            )}>
                                                {role.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {roles.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No roles found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Role Modal */}
            {isCreateRoleOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateRoleOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center">
                            <h2 className="text-xl font-bold">Create New Role</h2>
                            <button onClick={() => setIsCreateRoleOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateRole} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="e.g., Content Editor"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Module Permissions</label>
                                <div className="grid grid-cols-2 gap-3">
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
                                <button type="button" onClick={() => setIsCreateRoleOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={!newRoleName || selectedModules.length === 0} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors disabled:opacity-50">Create Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invite Admin Modal */}
            {isInviteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)}></div>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border-custom flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold">Invite New Admin</h2>
                                <p className="text-xs text-text-muted mt-1">Send a secure invite with temporary credentials.</p>
                            </div>
                            <button onClick={() => setIsInviteOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleInviteAdmin} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border-custom rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border-custom rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Role</label>
                                <select
                                    required
                                    value={inviteRoleId}
                                    onChange={(e) => setInviteRoleId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-border-custom rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                >
                                    <option value="" disabled>Select a role...</option>
                                    {roles.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsInviteOpen(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={!inviteName || !inviteEmail || !inviteRoleId} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20 disabled:opacity-50">Send Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

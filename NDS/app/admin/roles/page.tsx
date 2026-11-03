"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  User,
  Briefcase,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "staff" | "admin";
  createdAt: string;
  lastSignIn: string | null;
}

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    badge: "bg-[#191919] text-[#C9A96E] border-[#3A352D]",
    desc: "Full atelier management access",
  },
  staff: {
    label: "Staff",
    icon: Briefcase,
    badge: "bg-sky-50 text-sky-800 border-sky-200",
    desc: "Order and product management",
  },
  customer: {
    label: "Customer",
    icon: User,
    badge: "bg-[#F5F3F0] text-[#77716D] border-[#EAE5DF]",
    desc: "Standard storefront access",
  },
};

export default function AdminRolesPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.warn("Could not load users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = (userId: string, role: string) => {
    setPendingRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSaveRole = async (userId: string) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;

    setSavingId(userId);
    try {
      const res = await fetch("/api/admin/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole as UserRecord["role"] } : u
          )
        );
        setPendingRoles((prev) => {
          const copy = { ...prev };
          delete copy[userId];
          return copy;
        });
        setSavedId(userId);
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch (e) {
      console.warn("Could not save role:", e);
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        (u.fullName || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    staff: users.filter((u) => u.role === "staff").length,
    customer: users.filter((u) => u.role === "customer").length,
  };

  return (
    <div className="space-y-6 sm:space-y-8">

      {/* Header */}
      <div className="pb-6 border-b border-[#EAE5DF] flex items-start justify-between">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1">
            ACCESS CONTROL
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#191919] font-normal tracking-tight">
            Role Management
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D] mt-1">
            Assign admin, staff, or customer roles to registered users.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F3F0] border border-[#EAE5DF] text-xs text-[#77716D] hover:text-[#191919] hover:border-[#191919] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { key: "all", label: "Total Users", count: counts.all, color: "text-[#191919]" },
          { key: "admin", label: "Admins", count: counts.admin, color: "text-[#C9A96E]" },
          { key: "staff", label: "Staff", count: counts.staff, color: "text-sky-700" },
          { key: "customer", label: "Customers", count: counts.customer, color: "text-[#77716D]" },
        ].map((stat) => (
          <div
            key={stat.key}
            className="bg-white border border-[#EAE5DF] p-4 shadow-xs text-center"
          >
            <span className={`font-serif text-2xl font-normal ${stat.color}`}>
              {stat.count}
            </span>
            <p className="text-[10px] uppercase tracking-wider text-[#77716D] mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-[#EAE5DF] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716D]" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F3F0] border border-[#EAE5DF] pl-10 pr-4 py-2.5 text-xs text-[#191919] placeholder-[#77716D] focus:outline-none focus:border-[#7B5644]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77716D] hover:text-[#191919]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          {(["all", "admin", "staff", "customer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap transition-colors border ${
                roleFilter === r
                  ? "bg-[#191919] text-[#FDFBF8] border-[#191919]"
                  : "bg-[#F5F3F0] text-[#77716D] border-[#EAE5DF] hover:text-[#191919]"
              }`}
            >
              {r === "all" ? `All (${counts.all})` : `${r} (${counts[r]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#EAE5DF] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EAE5DF] flex items-center justify-between">
          <span className="text-xs font-semibold text-[#191919] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#7B5644]" />
            {filteredUsers.length} User{filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#EAE5DF] border-t-[#7B5644] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#77716D]">Loading registered users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-[#A8A29E] mx-auto mb-3" />
            <p className="font-serif text-lg text-[#191919]">No Users Found</p>
            <p className="text-xs text-[#77716D] mt-1">
              {searchQuery ? "No users match your search." : "No registered users yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3F0] border-b border-[#EAE5DF] uppercase tracking-wider text-[10px] text-[#77716D] font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">User</th>
                  <th className="py-3 px-4 sm:px-6">Joined</th>
                  <th className="py-3 px-4 sm:px-6">Last Sign In</th>
                  <th className="py-3 px-4 sm:px-6">Current Role</th>
                  <th className="py-3 px-4 sm:px-6">Assign Role</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {filteredUsers.map((user) => {
                  const cfg = ROLE_CONFIG[user.role];
                  const RoleIcon = cfg.icon;
                  const pending = pendingRoles[user.id];
                  const isDirty = pending !== undefined && pending !== user.role;

                  return (
                    <tr key={user.id} className="hover:bg-[#FDFBF8] transition-colors">
                      {/* User info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5F3F0] border border-[#EAE5DF] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-[#7B5644] uppercase">
                              {(user.email[0] || "?").toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-[#191919]">
                              {user.fullName || user.email.split("@")[0]}
                            </p>
                            <p className="text-[11px] text-[#77716D] truncate max-w-[180px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="py-4 px-4 sm:px-6 text-[#77716D] whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Last sign in */}
                      <td className="py-4 px-4 sm:px-6 text-[#77716D] whitespace-nowrap">
                        {user.lastSignIn
                          ? new Date(user.lastSignIn).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                      </td>

                      {/* Current role badge */}
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold border ${cfg.badge}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Role selector */}
                      <td className="py-4 px-4 sm:px-6">
                        <select
                          value={pending ?? user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-[#F5F3F0] border border-[#EAE5DF] px-2.5 py-1.5 text-xs font-semibold text-[#191919] focus:outline-none focus:border-[#7B5644]"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Save action */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {savedId === user.id ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Saved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSaveRole(user.id)}
                            disabled={!isDirty || savingId === user.id}
                            className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold border transition-colors ${
                              isDirty
                                ? "bg-[#191919] text-[#FDFBF8] border-[#191919] hover:bg-[#7B5644] hover:border-[#7B5644]"
                                : "bg-[#F5F3F0] text-[#A8A29E] border-[#EAE5DF] cursor-not-allowed"
                            }`}
                          >
                            {savingId === user.id ? "Saving..." : "Save"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="p-4 bg-[#F5F3F0] border border-[#EAE5DF] text-xs text-[#77716D] leading-relaxed">
        <strong className="text-[#191919]">Role definitions:</strong>{" "}
        <span className="font-semibold text-[#C9A96E]">Admin</span> — full dashboard access, product &amp; order management.{" "}
        <span className="font-semibold text-sky-700">Staff</span> — order fulfillment and product visibility.{" "}
        <span className="font-semibold">Customer</span> — standard storefront access only.
        Role changes take effect on next login.
      </div>

    </div>
  );
}


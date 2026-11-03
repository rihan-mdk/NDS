"use client";

import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  X,
  Trash2,
  Percent,
  RefreshCw,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface PromoCodeRecord {
  id: string;
  code: string;
  discount_percent: number;
  description: string | null;
  is_active: boolean;
  usage_count: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoCodeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formCode, setFormCode] = useState("");
  const [formDiscount, setFormDiscount] = useState<number>(10);
  const [formDescription, setFormDescription] = useState("");
  const [formMaxUses, setFormMaxUses] = useState<string>("");
  const [formExpiresAt, setFormExpiresAt] = useState<string>("");

  const loadPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promos");
      if (res.ok) {
        const data = await res.json();
        setPromos(data.promos || []);
      }
    } catch (e) {
      console.warn("Could not load promo codes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/promos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });

      if (res.ok) {
        setPromos((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentStatus } : p))
        );
      }
    } catch (e) {
      console.error("Failed to toggle status:", e);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete promo code "${code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/promos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== id));
        setFeedbackMessage({ type: "success", text: `Promo code ${code} deleted successfully.` });
        setTimeout(() => setFeedbackMessage(null), 3500);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete promo code.");
      }
    } catch (e) {
      console.error("Failed to delete promo code:", e);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formDiscount) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode.trim().toUpperCase(),
          discount_percent: Number(formDiscount),
          description: formDescription.trim() || null,
          max_uses: formMaxUses ? parseInt(formMaxUses, 10) : null,
          expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPromos((prev) => [data.promo, ...prev]);
        setIsModalOpen(false);
        setFormCode("");
        setFormDiscount(10);
        setFormDescription("");
        setFormMaxUses("");
        setFormExpiresAt("");
        setFeedbackMessage({ type: "success", text: `Promo code "${data.promo.code}" created.` });
        setTimeout(() => setFeedbackMessage(null), 3500);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create promo code.");
      }
    } catch (e) {
      console.error("Failed to create promo code:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPromos = promos.filter((promo) => {
    const matchesSearch =
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && promo.is_active) ||
      (statusFilter === "inactive" && !promo.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalActive = promos.filter((p) => p.is_active).length;
  const totalUses = promos.reduce((sum, p) => sum + (p.usage_count || 0), 0);

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#EAE5DF]">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#7B5644] font-semibold block mb-1.5">
            ATELIER PRIVILEGES
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#191919] font-normal tracking-tight">
            Promotions &amp; Vouchers
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#77716D] mt-1">
            Configure client discounts, promotional campaigns, and VIP vouchers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadPromos()}
            disabled={loading}
            className="p-2.5 bg-white border border-[#EAE5DF] text-[#77716D] hover:text-[#191919] hover:border-[#191919] transition-colors"
            title="Refresh Promotions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#191919] text-[#FDFBF8] text-xs uppercase tracking-widest font-semibold hover:bg-[#7B5644] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promo Code</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 border text-xs flex items-center justify-between ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE5DF] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D] block mb-1">
              Total Promo Codes
            </span>
            <div className="font-serif text-2xl text-[#191919]">{promos.length}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center">
            <Tag className="w-5 h-5 text-[#7B5644]" />
          </div>
        </div>

        <div className="bg-white border border-[#EAE5DF] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D] block mb-1">
              Active Vouchers
            </span>
            <div className="font-serif text-2xl text-emerald-800">{totalActive}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white border border-[#EAE5DF] p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#77716D] block mb-1">
              Total Redemptions
            </span>
            <div className="font-serif text-2xl text-[#191919]">{totalUses}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#F5F3F0] flex items-center justify-center">
            <Percent className="w-5 h-5 text-[#7B5644]" />
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-[#EAE5DF] p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#77716D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FDFBF8] border border-[#EAE5DF] text-xs text-[#191919] placeholder-[#A8A29E] focus:outline-none focus:border-[#7B5644]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-[#77716D] uppercase tracking-wider font-semibold">Status:</span>
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold border transition-colors ${
                statusFilter === s
                  ? "bg-[#191919] text-[#FDFBF8] border-[#191919]"
                  : "bg-white text-[#77716D] border-[#EAE5DF] hover:border-[#191919]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Promo Codes Table ── */}
      <div className="bg-white border border-[#EAE5DF] shadow-xs">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#EAE5DF] border-t-[#7B5644] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#77716D]">Loading atelier promotion codes...</p>
          </div>
        ) : filteredPromos.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-10 h-10 text-[#A8A29E] mx-auto mb-3" />
            <p className="font-serif text-base text-[#191919]">No Promotion Codes Found</p>
            <p className="text-xs text-[#77716D] mt-1">
              Create your first promotional voucher using the button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F3F0] border-b border-[#EAE5DF] uppercase tracking-wider text-[10px] text-[#77716D] font-semibold">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Voucher Code</th>
                  <th className="py-3 px-4 sm:px-6">Discount</th>
                  <th className="py-3 px-4 sm:px-6">Description</th>
                  <th className="py-3 px-4 sm:px-6">Usage</th>
                  <th className="py-3 px-4 sm:px-6">Expiration</th>
                  <th className="py-3 px-4 sm:px-6">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE5DF]">
                {filteredPromos.map((promo) => {
                  const isExpired = promo.expires_at && new Date(promo.expires_at) < new Date();

                  return (
                    <tr key={promo.id} className="hover:bg-[#FDFBF8] transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-mono text-xs font-bold text-[#191919] bg-[#F5F3F0] border border-[#EAE5DF] px-2.5 py-1 rounded-xs tracking-wider">
                          {promo.code}
                        </span>
                      </td>

                      <td className="py-4 px-4 sm:px-6 font-semibold text-[#7B5644]">
                        {promo.discount_percent}% OFF
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-[#77716D]">
                        {promo.description || "—"}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-[#191919]">
                        <span className="font-mono font-medium">{promo.usage_count}</span>
                        {promo.max_uses ? (
                          <span className="text-[#77716D]"> / {promo.max_uses} max</span>
                        ) : (
                          <span className="text-[#77716D]"> (Unlimited)</span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-[#77716D]">
                        {promo.expires_at ? (
                          <span className={isExpired ? "text-red-700 font-medium" : ""}>
                            {new Date(promo.expires_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Never Expires</span>
                        )}
                      </td>

                      <td className="py-4 px-4 sm:px-6">
                        <button
                          onClick={() => handleToggleActive(promo.id, promo.is_active)}
                          className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border transition-colors ${
                            promo.is_active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200"
                          }`}
                        >
                          {promo.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => handleDelete(promo.id, promo.code)}
                          className="p-1.5 text-[#77716D] hover:text-red-700 transition-colors"
                          title="Delete Voucher"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create Promo Modal ── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => !submitting && setIsModalOpen(false)}
        >
          <div
            className="relative bg-[#FDFBF8] border border-[#EAE5DF] max-w-md w-full p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DF] mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7B5644] font-semibold block mb-0.5">
                  NEW VOUCHER
                </span>
                <h3 className="font-serif text-xl text-[#191919]">Create Promo Code</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="p-1 text-[#77716D] hover:text-[#191919]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-white border border-[#EAE5DF] text-xs font-mono uppercase text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                  Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#EAE5DF] text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                  Description / Campaign Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diwali Privilege 20% Voucher"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EAE5DF] text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={formMaxUses}
                    onChange={(e) => setFormMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE5DF] text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#191919] mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={formExpiresAt}
                    onChange={(e) => setFormExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE5DF] text-xs text-[#191919] focus:outline-none focus:border-[#7B5644]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE5DF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-[#EAE5DF] text-[#77716D] hover:text-[#191919] text-xs uppercase tracking-wider font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#191919] text-[#FDFBF8] hover:bg-[#7B5644] text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMsg("Could not send reset link. Please check your email and try again.");
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#FDFBF8] text-[#191919]">
      {/* Left Column: Editorial Image */}
      <div className="relative w-full lg:w-[55%] min-h-[300px] lg:min-h-auto bg-[#EFEEEB] overflow-hidden flex flex-col justify-between p-8 lg:p-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Luxury fashion editorial"
          className="absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.95]"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJpt-4xAPPD2y_sYhU90s1PyDcuMTlcdr7Tsgr9preP3ChZ-0YOqWHEimx4pGXvXZjLo_d_ZhlpbkbtVbTuPH8XinCqwqB1vRypf66P2pZbPkPoKq51i6CVsNm-nr-K90cOYZxiD6wfZjGgGEb9WtjCnGV3hseUUPqWPcQhymIdHMMSp-vMlKsWrT9ATqrIyMBU7i780F1l-UGP9W21ltdSNr5Cubb5s2xdK__NH_Qa-TAS0qC4fZWcQ"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        <div />

        <div className="relative z-10 max-w-md pt-24">
          <p className="font-serif text-lg sm:text-xl italic text-[#FDFBF8] mb-2 font-normal leading-relaxed">
            &ldquo;Every detail considered, every moment refined.&rdquo;
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-px bg-[#FDFBF8]/50" />
            <span className="text-[10px] text-[#FDFBF8]/80 tracking-[0.25em] uppercase font-medium">
              NEEL&apos;S DESIGNER STUDIO ATELIER
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Reset Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-[#FDFBF8]">
        <div className="w-full max-w-[420px] mx-auto py-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#77716D] hover:text-[#191919] transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>

          <div className="mb-10">
            <span className="text-[10px] tracking-[0.28em] text-[#191919] uppercase font-semibold block mb-4">
              NEEL&apos;S DESIGNER STUDIO
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#191919] tracking-tight mb-2">
              Reset Password
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
              Enter your registered email address. We&apos;ll send a secure reset link to your inbox.
            </p>
          </div>

          {sent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-serif text-lg text-[#191919] mb-2">Reset Link Sent</h3>
              <p className="text-xs text-[#77716D] leading-relaxed mb-4">
                A secure password reset link has been dispatched to <strong className="text-[#191919]">{email}</strong>. Check your inbox (and spam folder).
              </p>
              <Link
                href="/login"
                className="inline-block text-[10px] uppercase tracking-widest font-semibold text-[#191919] hover:text-[#7B5644] underline"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    className="block text-[10px] text-[#77716D] uppercase tracking-[0.18em] font-semibold mb-2"
                    htmlFor="email"
                  >
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="client@atelier.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 pl-10 bg-[#F5F3F0] text-xs text-[#191919] border border-transparent focus:border-[#191919] focus:bg-[#FFFFFF] focus:outline-none transition-colors"
                    />
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#77716D]" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-8 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[11px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {loading ? "SENDING RESET LINK..." : "SEND SECURE RESET LINK"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


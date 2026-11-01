"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please verify your credentials.");
      } else {
        const isAdminUser = email.trim().toLowerCase() === "neels9589@gmail.com";
        const target = redirectParam || (isAdminUser ? "/admin" : "/account");
        router.push(target);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col lg:flex-row bg-[#FDFBF8] text-[#191919]">
      {/* Left Column: Visual Showcase (55% Couture Editorial) */}
      <div className="relative w-full lg:w-[55%] min-h-[400px] lg:min-h-auto bg-[#EFEEEB] overflow-hidden flex flex-col justify-between p-8 lg:p-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="High-fashion bridal couture editorial photography"
          className="absolute inset-0 w-full h-full object-cover object-top filter contrast-[1.02] brightness-[0.98] transition-transform duration-1000 ease-out hover:scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSRoFIyTRiLouO77pUfuYJFhQ4O-bErCwcb46mAro95Rjwkyxu9VICndxflW1DaxmTBf76kf5vW7nQQGOJ5AZ4ScZCpacCwUf49bQkNNAyUsu2NnPzoMQFsAqHzJbDXuk8e3KaV3Geq1bZQiFDapXSDnWfXzkXVPBLjj3AyUjtNJVyXpLF5w4vnKO72eRBzNpPKbUl59ccOcP57Ua1fa5YFLzI-hpHAIRXvr03vBC45noD3MOrvY6XAA"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>

        <div></div>

        {/* Bottom Editorial Footnote */}
        <div className="relative z-10 max-w-md pt-24">
          <p className="font-serif text-lg sm:text-xl italic text-[#FDFBF8] mb-2 font-normal leading-relaxed">
            &ldquo;An intimate portal to bespoke couture.&rdquo;
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-px bg-[#FDFBF8]/50"></div>
            <span className="text-[10px] text-[#FDFBF8]/80 tracking-[0.25em] uppercase font-medium">
              NEEL&apos;S DESIGNER STUDIO ATELIER
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Form Container (45% Ivory Panel) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-[#FDFBF8]">
        <div className="w-full max-w-[420px] mx-auto py-8">
          <div className="mb-10 text-left">
            <span className="text-[10px] tracking-[0.28em] text-[#191919] uppercase font-semibold block mb-4">
              NEEL&apos;S DESIGNER STUDIO
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#191919] tracking-tight mb-2">
              Welcome Back.
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#77716D] leading-relaxed">
              Your personal atelier, just a moment away.
            </p>
          </div>

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
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="client@atelier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#F5F3F0] text-xs text-[#191919] border border-transparent focus:border-[#191919] focus:bg-[#FFFFFF] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-[10px] text-[#77716D] uppercase tracking-[0.18em] font-semibold"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] text-[#77716D] hover:text-[#191919] uppercase tracking-wider underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 pr-10 bg-[#F5F3F0] text-xs text-[#191919] border border-transparent focus:border-[#191919] focus:bg-[#FFFFFF] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[#77716D] hover:text-[#191919]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 bg-[#191919] hover:bg-[#7B5644] text-[#FDFBF8] text-[11px] font-semibold tracking-[0.24em] uppercase transition-all duration-300 flex items-center justify-center space-x-2 group cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? "AUTHENTICATING..." : "LOG IN"}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#EAE5DF] text-center">
            <p className="text-xs text-[#77716D]">
              New to Neel&apos;s Atelier?{" "}
              <Link href="/signup" className="font-semibold text-[#191919] hover:text-[#7B5644] underline underline-offset-4 ml-1">
                Create an Atelier Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF8]" />}>
      <LoginForm />
    </Suspense>
  );
}


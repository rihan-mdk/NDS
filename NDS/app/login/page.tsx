"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Component as SignInCard } from "@/components/ui/sign-in-card-2";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <SignInCard
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      onSubmit={handleSubmit}
      isLoading={loading}
      errorMsg={errorMsg}
      brandName="Neel's Designer Studio"
      brandSubtitle="Sign in to your bespoke atelier account"
      logoLetter="N"
      forgotPasswordHref="/forgot-password"
      signUpHref="/signup"
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}

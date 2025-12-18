import type { Metadata } from 'next';
import { LoginForm } from "@/components/auth/LoginForm";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your The Hunt Kitchen account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-slate">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

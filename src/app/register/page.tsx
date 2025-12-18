import type { Metadata } from 'next';
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your The Hunt Kitchen account to save recipes, shop, and more',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}

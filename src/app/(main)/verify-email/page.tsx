import { verifyVerificationToken } from "@/lib/verification-token";
import prisma from "@/lib/prisma";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SessionRefresh } from "@/components/auth/SessionRefresh";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorState message="No verification token provided." />;
  }

  const payload = verifyVerificationToken(token);

  if (!payload) {
    return (
      <ErrorState message="This verification link is invalid or has expired. Please request a new one from your account page." />
    );
  }

  // Update emailVerified in DB (idempotent)
  await prisma.user.update({
    where: { id: payload.sub },
    data: { emailVerified: true },
  });

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <SessionRefresh />
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Email Verified
          </h1>
          <p className="text-gray-600 mb-6">
            Your email address has been verified successfully. You&apos;re all
            set!
          </p>
          <Button asChild className="bg-[#2D5A3D] hover:bg-[#234a30]">
            <Link href="/account">Go to Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button asChild className="bg-[#2D5A3D] hover:bg-[#234a30]">
            <Link href="/account">Go to Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

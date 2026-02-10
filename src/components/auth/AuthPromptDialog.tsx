"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthPromptDialog({ open, onOpenChange }: AuthPromptDialogProps) {
  const pathname = usePathname();
  const callbackUrl = encodeURIComponent(pathname);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#4A3728]">
            Save Your Favorite Recipes
          </DialogTitle>
          <DialogDescription>
            Sign in or create an account to save recipes and access them anytime.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-2">
          <Button
            asChild
            className="bg-[#2D5A3D] hover:bg-[#2D5A3D]/90 text-white"
          >
            <Link href={`/login?callbackUrl=${callbackUrl}`}>Sign In</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-[#2D5A3D] text-[#2D5A3D] hover:bg-[#2D5A3D]/10"
          >
            <Link href={`/register?callbackUrl=${callbackUrl}`}>
              Create Account
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

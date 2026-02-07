'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { X, ChevronRight, User, ShoppingBag } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { navigation } from '@/config/site';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function MobileMenu({ open, onClose, user }: MobileMenuProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full bg-cream p-0 sm:w-80">
        <SheetHeader className="border-b border-stone p-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl text-forestGreen">
              Menu
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-forestGreen hover:text-hunterOrange hover:bg-transparent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex h-[calc(100vh-88px)] flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* User Section */}
            {user ? (
              <div className="mb-6">
                <div className="flex items-center space-x-3 rounded-lg bg-stone/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forestGreen text-white">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-semibold text-forestGreen">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-slate">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Link
                    href="/account/settings"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between rounded-lg px-4 py-2 text-sm text-forestGreen hover:text-hunterOrange hover:font-bold"
                  >
                    <span>Settings</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/account/favorites"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between rounded-lg px-4 py-2 text-sm text-forestGreen hover:text-hunterOrange hover:font-bold"
                  >
                    <span>Favorites</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <Separator className="my-4 bg-stone" />
              </div>
            ) : (
              <div className="mb-6">
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={handleLinkClick}
                    className="block"
                  >
                    <Button className="w-full bg-hunterOrange text-white hover:bg-hunterOrange/90">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={handleLinkClick}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
                    >
                      Register
                    </Button>
                  </Link>
                </div>
                <Separator className="my-4 bg-stone" />
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-2">
              {navigation.main.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-4 py-3 font-semibold transition-colors',
                    pathname === item.href
                      ? 'bg-hunterOrange/10 text-hunterOrange'
                      : 'text-forestGreen hover:bg-stone/30'
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-stone p-6">
            <div className="space-y-2">
              <Link
                href="/shop"
                onClick={handleLinkClick}
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full justify-start border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Products
                </Button>
              </Link>
              {user && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-errorRed hover:bg-errorRed/10 hover:text-errorRed"
                  onClick={() => {
                    onClose();
                    signOut({ callbackUrl: '/' });
                  }}
                >
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

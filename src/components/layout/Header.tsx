'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Search,
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useCartItemCount } from '@/hooks/useCart';
import { navigation } from '@/config/site';
import { MobileMenu } from './MobileMenu';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartItemCount = useCartItemCount();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b border-stone/50 bg-cream transition-shadow duration-200',
          scrolled && 'shadow-md'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-forestGreen">
                <Image
                  src="/images/thk-logo.jpg"
                  alt="The Hunt Kitchen"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>
              <span className="hidden font-serif text-xl font-bold text-forestGreen sm:block">
                The Hunt Kitchen
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-8 lg:flex">
              {navigation.main.map((item) =>
                'children' in item && item.children ? (
                  <DropdownMenu key={item.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="font-semibold text-barkBrown hover:text-hunterOrange"
                      >
                        {item.label}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-56 border-stone bg-cream"
                    >
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link
                            href={child.href}
                            className="cursor-pointer text-barkBrown hover:text-hunterOrange"
                          >
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'font-semibold text-barkBrown transition-colors hover:text-hunterOrange',
                      pathname === item.href && 'text-hunterOrange'
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className="text-barkBrown hover:text-hunterOrange"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* User Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-barkBrown hover:text-hunterOrange"
                      aria-label="Account menu"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 border-stone bg-cream"
                  >
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-barkBrown">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {user.role === 'ADMIN' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/admin"
                            className="cursor-pointer text-forestGreen hover:text-hunterOrange font-semibold"
                          >
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/orders"
                        className="cursor-pointer text-barkBrown hover:text-hunterOrange"
                      >
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/settings"
                        className="cursor-pointer text-barkBrown hover:text-hunterOrange"
                      >
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/account/favorites"
                        className="cursor-pointer text-barkBrown hover:text-hunterOrange"
                      >
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/api/auth/signout"
                        className="cursor-pointer text-errorRed hover:text-errorRed/80"
                      >
                        Sign Out
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-barkBrown hover:text-hunterOrange"
                      aria-label="Account menu"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 border-stone bg-cream"
                  >
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="cursor-pointer text-barkBrown hover:text-hunterOrange"
                      >
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/register?callbackUrl=${encodeURIComponent(pathname)}`}
                        className="cursor-pointer text-barkBrown hover:text-hunterOrange"
                      >
                        Register
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-barkBrown hover:text-hunterOrange"
                onClick={() => setCartOpen(true)}
                aria-label={`Shopping cart with ${cartItemCount} items`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-hunterOrange p-0 text-xs text-white"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="text-barkBrown hover:text-hunterOrange lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals/Drawers */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

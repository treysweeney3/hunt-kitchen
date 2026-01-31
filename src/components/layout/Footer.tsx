'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Youtube, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { siteConfig, navigation } from '@/config/site';
import { toast } from 'sonner';

// Pinterest icon from Lucide isn't available, so we'll create a simple SVG
const TikTok = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement newsletter subscription API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Thanks for subscribing to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-forestGreen border-t border-white/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-3">
              <Image
                src="/images/logo-white.png"
                alt="The Hunt Kitchen"
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <span className="font-serif text-xl font-bold text-white">
                The Hunt Kitchen
              </span>
            </Link>
            <p className="mb-6 text-sm text-white/80">{siteConfig.tagline}</p>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="mb-3 font-serif text-lg font-semibold text-white">
                Join Our Newsletter
              </h3>
              <p className="mb-3 text-sm text-white/80">
                Get weekly recipes, cooking tips, and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4">
              <Link
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 transition-colors hover:text-hunterOrange"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 transition-colors hover:text-hunterOrange"
                aria-label="TikTok"
              >
                <TikTok className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 transition-colors hover:text-hunterOrange"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 transition-colors hover:text-hunterOrange"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Recipes Column */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-white">
              Recipes
            </h3>
            <ul className="space-y-2">
              {navigation.footer.recipes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-hunterOrange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-white">
              Shop
            </h3>
            <ul className="space-y-2">
              {navigation.footer.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-hunterOrange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-white">
              Company
            </h3>
            <ul className="space-y-2">
              {navigation.footer.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-hunterOrange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 md:items-start">
              <p className="text-sm text-white/70">
                &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
                reserved.
              </p>
              <p className="text-sm text-white/70">
                Powered by{' '}
                <Link
                  href="https://deepsouthsoftware.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-hunterOrange transition-colors hover:text-hunterOrange/80"
                >
                  Deep South Software
                </Link>
              </p>
            </div>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-white/70 transition-colors hover:text-hunterOrange"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-white/70 transition-colors hover:text-hunterOrange"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

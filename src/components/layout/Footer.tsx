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
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
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
    <footer className="border-t border-stone bg-stone/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-forestGreen">
                <Image
                  src="/images/thk-logo.png"
                  alt="The Hunt Kitchen"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <span className="font-serif text-xl font-bold text-forestGreen">
                The Hunt Kitchen
              </span>
            </Link>
            <p className="mb-6 text-sm text-slate">{siteConfig.tagline}</p>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h3 className="mb-3 font-serif text-lg font-semibold text-barkBrown">
                Join Our Newsletter
              </h3>
              <p className="mb-3 text-sm text-slate">
                Get weekly recipes, cooking tips, and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-stone bg-cream text-barkBrown placeholder:text-slate/60"
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
                className="text-slate transition-colors hover:text-hunterOrange"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate transition-colors hover:text-hunterOrange"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate transition-colors hover:text-hunterOrange"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate transition-colors hover:text-hunterOrange"
                aria-label="Pinterest"
              >
                <PinterestIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Recipes Column */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-barkBrown">
              Recipes
            </h3>
            <ul className="space-y-2">
              {navigation.footer.recipes.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate transition-colors hover:text-hunterOrange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-barkBrown">
              Shop
            </h3>
            <ul className="space-y-2">
              {navigation.footer.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate transition-colors hover:text-hunterOrange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 font-serif text-lg font-semibold text-barkBrown">
              Company
            </h3>
            <ul className="space-y-2">
              {navigation.footer.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate transition-colors hover:text-hunterOrange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-stone pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 md:items-start">
              <p className="text-sm text-slate">
                &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
                reserved.
              </p>
              <p className="text-sm text-slate">
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
                className="text-sm text-slate transition-colors hover:text-hunterOrange"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-slate transition-colors hover:text-hunterOrange"
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

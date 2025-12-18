# Layout Components Usage Example

## Using RootLayout in app/layout.tsx

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RootLayout } from '@/components/layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayout user={session?.user}>
          {children}
        </RootLayout>
      </body>
    </html>
  );
}
```

## Manual Layout Assembly (if not using RootLayout)

```tsx
// app/layout.tsx
import { Inter } from 'next/font/google';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Header, Footer } from '@/components/layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col bg-cream">
          <Header user={session?.user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

## Using Individual Components in Client Components

```tsx
// app/custom-page/page.tsx
'use client';

import { useState } from 'react';
import { Header, Footer, CartDrawer, SearchModal } from '@/components/layout';
import { useSession } from 'next-auth/react';

export default function CustomPage() {
  const { data: session } = useSession();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream">
      <Header user={session?.user} />

      <main className="container mx-auto px-4 py-8">
        {/* Your page content */}
        <button onClick={() => setCartOpen(true)}>
          Open Cart
        </button>
        <button onClick={() => setSearchOpen(true)}>
          Open Search
        </button>
      </main>

      <Footer />

      {/* Standalone modals/drawers */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
```

## Complete Example Page

```tsx
// app/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 font-serif text-5xl font-bold text-forestGreen">
          Welcome to The Hunt Kitchen
        </h1>
        <p className="mb-8 text-xl text-barkBrown">
          From Field to Fork - Master the Art of Wild Game Cooking
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/recipes">
            <Button className="bg-hunterOrange text-white hover:bg-hunterOrange/90">
              Browse Recipes
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              variant="outline"
              className="border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
            >
              Shop Products
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-serif text-xl font-semibold text-forestGreen">
            Expert Recipes
          </h3>
          <p className="text-slate">
            Master wild game cooking with our tested recipes
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-serif text-xl font-semibold text-forestGreen">
            Premium Gear
          </h3>
          <p className="text-slate">
            Shop cookbooks, apparel, and hunting accessories
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-serif text-xl font-semibold text-forestGreen">
            Community
          </h3>
          <p className="text-slate">
            Join hunters who love to cook
          </p>
        </div>
      </section>
    </div>
  );
}
```

## Setting Up Custom Fonts

```tsx
// app/layout.tsx
import { Playfair_Display, Source_Sans_Pro } from 'next/font/google';
import { RootLayout } from '@/components/layout';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sourceSans = Source_Sans_Pro({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-sans">
        <RootLayout user={session?.user}>
          {children}
        </RootLayout>
      </body>
    </html>
  );
}
```

Then update `globals.css`:

```css
@theme inline {
  /* Add font family variables */
  --font-serif: var(--font-playfair-display);
  --font-sans: var(--font-source-sans-pro);

  /* ... rest of theme config ... */
}

/* Apply fonts */
.font-serif {
  font-family: var(--font-serif);
}

.font-sans {
  font-family: var(--font-sans);
}
```

## Toaster Setup (for notifications)

```tsx
// app/layout.tsx
import { Toaster } from 'sonner';
import { RootLayout } from '@/components/layout';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayout user={session?.user}>
          {children}
        </RootLayout>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#F5F2EB',
              color: '#4A3728',
              border: '1px solid #E8E4DD',
            },
          }}
        />
      </body>
    </html>
  );
}
```

## Testing with Mock Data

```tsx
// app/test-layout/page.tsx
import { Header, Footer } from '@/components/layout';

export default function TestLayoutPage() {
  // Mock user for testing
  const mockUser = {
    name: 'John Hunter',
    email: 'john@example.com',
    image: null,
  };

  return (
    <div className="min-h-screen bg-cream">
      <Header user={mockUser} />

      <main className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl font-bold text-forestGreen">
          Layout Test Page
        </h1>
        <p className="mt-4 text-barkBrown">
          This page demonstrates the layout components with a mock user.
        </p>
      </main>

      <Footer />
    </div>
  );
}
```

## Notes

1. **Authentication**: The examples use NextAuth.js with `getServerSession` for server components and `useSession` for client components.

2. **Custom Colors**: Make sure all custom color classes (forestGreen, hunterOrange, etc.) are defined in your `globals.css` file.

3. **Cart Functionality**: The cart drawer automatically integrates with the Zustand cart store. No additional setup needed.

4. **Search**: Implement the `/api/search` endpoint to enable actual search functionality.

5. **Newsletter**: Implement newsletter subscription API for the footer form.

6. **Images**: Place the logo file at `/public/images/thk-logo.jpg`.

7. **Responsive Testing**: Test on mobile, tablet, and desktop to ensure proper responsive behavior.

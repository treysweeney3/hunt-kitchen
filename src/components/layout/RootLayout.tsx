import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface RootLayoutProps {
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function RootLayout({ children, user }: RootLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

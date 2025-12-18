import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = {
    name: `${session.user.firstName} ${session.user.lastName}`,
    email: session.user.email,
    image: null,
    role: session.user.role,
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/account",
      icon: User,
    },
    {
      name: "Orders",
      href: "/account/orders",
      icon: Package,
    },
    {
      name: "Saved Recipes",
      href: "/account/saved-recipes",
      icon: Heart,
    },
    {
      name: "Addresses",
      href: "/account/addresses",
      icon: MapPin,
    },
    {
      name: "Settings",
      href: "/account/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header user={user} />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 sticky top-28">
              <div className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        "text-gray-700 hover:bg-gray-100 hover:text-[#2D5A3D]"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

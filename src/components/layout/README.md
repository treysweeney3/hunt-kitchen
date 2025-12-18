# Layout Components

Main layout components for The Hunt Kitchen website with a rustic, outdoorsy aesthetic following the brand's design system.

## Design System

### Colors
- **Forest Green** (`#2D5A3D`): Primary brand color for headings and important elements
- **Hunter Orange** (`#E07C24`): Accent color for CTAs and highlights
- **Bark Brown** (`#4A3728`): Text color
- **Cream** (`#F5F2EB`): Background color
- **Stone** (`#E8E4DD`): Secondary background color
- **Slate** (`#6B7280`): Muted text color
- **Error Red** (`#EF4444`): Error states
- **Success Green** (`#22C55E`): Success states

### Typography
- **Headings**: Serif font (Playfair Display)
- **Body**: Sans-serif font (Source Sans Pro)

## Components

### RootLayout
Main layout wrapper that includes header and footer.

```tsx
import { RootLayout } from '@/components/layout';

export default function Page() {
  return (
    <RootLayout user={user}>
      {/* Page content */}
    </RootLayout>
  );
}
```

### Header
Sticky header with navigation, search, cart, and user menu.

**Features:**
- Logo linking to home page
- Desktop navigation with dropdowns for Recipes and Shop
- Mobile hamburger menu
- Search icon triggering SearchModal
- User account dropdown (login/register or account menu)
- Cart icon with item count badge
- Sticky positioning with shadow on scroll

**Props:**
```ts
interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}
```

**Usage:**
```tsx
import { Header } from '@/components/layout';

<Header user={session?.user} />
```

### Footer
Site footer with branding, navigation, newsletter signup, and social media links.

**Features:**
- Logo and brand tagline
- Navigation columns (Recipes, Shop, Company)
- Newsletter signup form
- Social media icons (Instagram, Facebook, YouTube, Pinterest)
- Copyright and legal links
- Cream/Stone background

**Usage:**
```tsx
import { Footer } from '@/components/layout';

<Footer />
```

### MobileMenu
Slide-out mobile navigation using Sheet from shadcn/ui.

**Features:**
- Full navigation with collapsible sub-menus
- User account section (login/register buttons or user info)
- Account navigation links
- Shop products CTA
- Sign out option for authenticated users

**Props:**
```ts
interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}
```

**Usage:**
```tsx
import { MobileMenu } from '@/components/layout';

const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

<MobileMenu
  open={mobileMenuOpen}
  onClose={() => setMobileMenuOpen(false)}
  user={session?.user}
/>
```

### CartDrawer
Slide-out cart panel using Sheet from shadcn/ui.

**Features:**
- List of cart items with thumbnails and details
- Quantity controls (increment/decrement)
- Remove item button with smooth animation
- Subtotal and total display
- "View Cart" and "Checkout" buttons
- Empty cart state with shop CTA
- Uses cart store and hooks for state management

**Props:**
```ts
interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}
```

**Usage:**
```tsx
import { CartDrawer } from '@/components/layout';

const [cartOpen, setCartOpen] = useState(false);

<CartDrawer
  open={cartOpen}
  onClose={() => setCartOpen(false)}
/>
```

### SearchModal
Search modal using Dialog and Command components from shadcn/ui.

**Features:**
- Search input with real-time results
- Recent searches (stored in localStorage)
- Popular/trending searches
- Search results grouped by type (recipes and products)
- Result items with images and metadata
- "View all results" link to full search page
- Keyboard navigation support via Command component

**Props:**
```ts
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}
```

**Usage:**
```tsx
import { SearchModal } from '@/components/layout';

const [searchOpen, setSearchOpen] = useState(false);

<SearchModal
  open={searchOpen}
  onClose={() => setSearchOpen(false)}
/>
```

## Dependencies

These components use the following:
- **Cart Store**: `@/stores/cartStore`
- **Cart Hooks**: `@/hooks/useCart`, `useCartItemCount`
- **Site Config**: `@/config/site` (navigation and branding)
- **shadcn/ui Components**: Button, Sheet, Dialog, Command, DropdownMenu, Badge, Input, ScrollArea, Separator, Collapsible
- **Lucide Icons**: Search, User, ShoppingCart, Menu, ChevronDown, ChevronRight, Plus, Minus, Trash2, ShoppingBag, ChefHat, Clock, TrendingUp, X, Instagram, Facebook, Youtube, ArrowRight
- **Next.js**: Link, Image, useRouter, usePathname
- **Sonner**: toast notifications

## API Integration

### Search API
The SearchModal includes a placeholder for the search API. Implement the actual endpoint at `/api/search`:

```ts
// app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // Implement search logic
  const results = await searchRecipesAndProducts(query);

  return Response.json({ results });
}
```

### Newsletter API
The Footer includes a placeholder for newsletter subscription. Implement the actual endpoint:

```ts
// app/api/newsletter/subscribe/route.ts
export async function POST(request: Request) {
  const { email } = await request.json();

  // Implement newsletter subscription logic
  await subscribeToNewsletter(email);

  return Response.json({ success: true });
}
```

## Responsive Design

All components are fully responsive:
- **Mobile** (< 640px): Hamburger menu, stacked layout
- **Tablet** (640px - 1024px): Partial desktop layout with some mobile elements
- **Desktop** (> 1024px): Full navigation, side-by-side layouts

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Sufficient color contrast ratios

## Styling

Components use Tailwind CSS with custom color classes defined in `globals.css`. The rustic, outdoorsy aesthetic is achieved through:
- Natural color palette (greens, browns, earth tones)
- Rounded corners and soft shadows
- Serif fonts for headings
- Subtle animations and transitions
- Texture through layered backgrounds

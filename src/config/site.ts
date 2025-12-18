export const siteConfig = {
  name: "The Hunt Kitchen",
  tagline: "From Field to Fork - Master the Art of Wild Game Cooking",
  description:
    "Discover expert wild game recipes, cooking techniques, and merchandise for hunters who love to cook. From venison to wild boar, learn to transform your harvest into delicious meals.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://thehuntkitchen.com",
  ogImage: "/images/og-image.jpg",
  links: {
    instagram: "https://instagram.com/the_hunt_kitchen",
    facebook: "https://www.facebook.com/p/The-Hunt-Kitchen-61576020279789/",
    youtube: "https://youtube.com/@thehuntkitchen",
    pinterest: "https://pinterest.com/thehuntkitchen",
    email: "info@thehuntkitchen.com",
  },
  creator: {
    name: "The Hunt Kitchen",
    url: "https://thehuntkitchen.com/about",
  },
} as const;

export const colors = {
  primary: {
    forestGreen: "#2D5A3D",
    hunterOrange: "#E07C24",
    barkBrown: "#4A3728",
  },
  neutral: {
    cream: "#F5F2EB",
    stone: "#E8E4DD",
    charcoal: "#333333",
    slate: "#6B7280",
  },
  accent: {
    successGreen: "#22C55E",
    errorRed: "#EF4444",
    warningAmber: "#F59E0B",
  },
} as const;

export const navigation = {
  main: [
    {
      label: "Recipes",
      href: "/recipes",
      children: [
        { label: "All Recipes", href: "/recipes" },
        { label: "By Game Type", href: "/recipes/game" },
        { label: "By Category", href: "/recipes/category" },
        { label: "Featured Recipes", href: "/recipes?featured=true" },
      ],
    },
    {
      label: "Shop",
      href: "/shop",
      children: [
        { label: "All Products", href: "/shop" },
        { label: "Apparel", href: "/shop/category/apparel" },
        { label: "Cookbooks", href: "/shop/category/cookbooks" },
        { label: "Accessories", href: "/shop/category/accessories" },
      ],
    },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    recipes: [
      { label: "All Recipes", href: "/recipes" },
      { label: "Venison Recipes", href: "/recipes/game/venison" },
      { label: "Elk Recipes", href: "/recipes/game/elk" },
      { label: "Wild Boar Recipes", href: "/recipes/game/wild-boar" },
      { label: "Duck Recipes", href: "/recipes/game/duck" },
    ],
    shop: [
      { label: "All Products", href: "/shop" },
      { label: "Apparel", href: "/shop/category/apparel" },
      { label: "Cookbooks", href: "/shop/category/cookbooks" },
      { label: "Accessories", href: "/shop/category/accessories" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
} as const;

export const seo = {
  defaultTitle: "The Hunt Kitchen - Wild Game Recipes & Cooking",
  defaultDescription:
    "Master the art of wild game cooking with expert recipes, techniques, and tips. From field to fork, transform your harvest into delicious meals.",
  keywords: [
    "wild game recipes",
    "venison recipes",
    "elk recipes",
    "wild boar",
    "hunting recipes",
    "game meat cooking",
    "deer recipes",
    "wild turkey recipes",
    "duck recipes",
    "wild game cooking",
  ],
} as const;

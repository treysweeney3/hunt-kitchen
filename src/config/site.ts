export const siteConfig = {
  name: "The Hunt Kitchen",
  tagline: "Hunt Hard | Eat Better - Master the Art of Wild Game Cooking",
  description:
    "Discover expert wild game recipes, cooking techniques, and merchandise for hunters who love to cook. From venison to wild boar, learn to transform your harvest into delicious meals.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://thehuntkitchen.com",
  ogImage: "/images/og-image.jpg",
  links: {
    instagram: "https://instagram.com/the_hunt_kitchen",
    facebook: "https://www.facebook.com/p/The-Hunt-Kitchen-61576020279789/",
    youtube: "https://youtube.com/@TheHuntKitchen",
    tiktok: "https://tiktok.com/@the_hunt_kitchen",
    email: "thomas@thehuntkitchen.com",
  },
  creator: {
    name: "The Hunt Kitchen",
    url: "https://thehuntkitchen.com/about",
  },
} as const;

export const colors = {
  primary: {
    forestGreen: "#0f311f",
    hunterOrange: "#ff6600",
    barkBrown: "#03190e",
  },
  neutral: {
    cream: "#c8b999",
    stone: "#3d4b33",
    charcoal: "#03190e",
    slate: "#747355",
  },
  accent: {
    successGreen: "#22C55E",
    errorRed: "#EF4444",
    warningAmber: "#F59E0B",
  },
} as const;

export const navigation = {
  main: [
    { label: "Shop", href: "/shop" },
    { label: "Content", href: "/content" },
    { label: "Recipes", href: "/recipes" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    recipes: [
      { label: "All Recipes", href: "/recipes" },
      { label: "Venison Recipes", href: "/recipes/game/venison" },
      { label: "Turkey Recipes", href: "/recipes/game/turkey" },
      { label: "Wild Boar Recipes", href: "/recipes/game/wild-boar" },
      { label: "Duck Recipes", href: "/recipes/game/duck" },
    ],
    shop: [
      { label: "Cookbook", href: "/shop/category/cookbooks" },
      { label: "Merch", href: "/shop/category/merch" },
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
    "turkey recipes",
    "wild boar",
    "hunting recipes",
    "game meat cooking",
    "deer recipes",
    "wild turkey recipes",
    "duck recipes",
    "wild game cooking",
  ],
} as const;

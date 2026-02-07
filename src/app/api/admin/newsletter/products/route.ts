import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProducts, isShopifyConfigured } from "@/lib/shopify";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isShopifyConfigured()) {
      return NextResponse.json({ products: [] });
    }

    const { products } = await getProducts({ first: 50 });

    // Return a slim shape for the picker
    const slim = products.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      price: `$${p.price.toFixed(2)}`,
      imageUrl: p.featuredImage?.url || null,
      link: `https://thehuntkitchen.com/shop/${p.handle}`,
    }));

    return NextResponse.json({ products: slim });
  } catch (error) {
    console.error("Error fetching Shopify products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

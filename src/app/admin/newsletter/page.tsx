"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { X, Search, Send, Mail, Users, Package } from "lucide-react";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImageUrl: string | null;
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  price: string;
  imageUrl: string | null;
  link: string;
};

type SelectedProduct = {
  name: string;
  price: string;
  imageUrl: string;
  link: string;
};

export default function NewsletterPage() {
  // Form state
  const [subject, setSubject] = useState("");
  const [heroHeading, setHeroHeading] = useState("");
  const [heroText, setHeroText] = useState("");
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<SelectedProduct | null>(null);
  const [contentHtml, setContentHtml] = useState("");

  // Recipe picker state
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [recipeSearch, setRecipeSearch] = useState("");
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  // Product picker state
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);

  // Subscriber count
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);

  // Preview state
  const [previewHtml, setPreviewHtml] = useState("");
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // UI state
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    fetchRecipes();
    fetchShopifyProducts();
    fetchSubscriberCount();
  }, []);

  // Debounced live preview
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      fetchPreviewHtml();
    }, 500);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    subject,
    heroHeading,
    heroText,
    selectedRecipes,
    selectedProduct,
    contentHtml,
  ]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/admin/recipes");
      if (res.ok) {
        const data = await res.json();
        setAllRecipes(
          data
            .filter(
              (r: Recipe & { isPublished?: boolean }) =>
                r.isPublished !== false
            )
            .map((r: Recipe) => ({
              id: r.id,
              title: r.title,
              slug: r.slug,
              description: r.description,
              featuredImageUrl: r.featuredImageUrl,
            }))
        );
      }
    } catch {
      toast.error("Failed to load recipes");
    }
  };

  const fetchShopifyProducts = async () => {
    try {
      const res = await fetch("/api/admin/newsletter/products");
      if (res.ok) {
        const data = await res.json();
        setShopifyProducts(data.products || []);
      }
    } catch {
      // Silently fail — products are optional
    }
  };

  const fetchSubscriberCount = async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        const activeCount = data.filter(
          (s: { isSubscribed: boolean }) => s.isSubscribed
        ).length;
        setSubscriberCount(activeCount);
      }
    } catch {
      // Silently fail
    }
  };

  const fetchPreviewHtml = async () => {
    try {
      const res = await fetch("/api/admin/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject || "Newsletter Preview",
          heroHeading: heroHeading || undefined,
          heroText: heroText || undefined,
          recipeIds: selectedRecipes.map((r) => r.id),
          product: selectedProduct || undefined,
          contentHtml: contentHtml || undefined,
        }),
      });
      if (res.ok) {
        const html = await res.text();
        setPreviewHtml(html);
      }
    } catch {
      // Preview is best-effort
    }
  };

  // Write HTML into iframe when previewHtml changes
  useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml]);

  // Recipe picker
  const filteredRecipes = allRecipes.filter(
    (r) =>
      !selectedRecipes.some((sr) => sr.id === r.id) &&
      r.title.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  const addRecipe = useCallback(
    (recipe: Recipe) => {
      if (selectedRecipes.length >= 3) {
        toast.error("Maximum 3 featured recipes");
        return;
      }
      setSelectedRecipes((prev) => [...prev, recipe]);
      setRecipeSearch("");
      setShowRecipePicker(false);
    },
    [selectedRecipes.length]
  );

  const removeRecipe = (id: string) => {
    setSelectedRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  // Product picker
  const filteredProducts = shopifyProducts.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectProduct = (p: ShopifyProduct) => {
    setSelectedProduct({
      name: p.title,
      price: p.price,
      imageUrl: p.imageUrl || "",
      link: p.link,
    });
    setProductSearch("");
    setShowProductPicker(false);
  };

  const clearProduct = () => {
    setSelectedProduct(null);
  };

  // Payload builder
  const buildPayload = () => ({
    subject,
    heroHeading: heroHeading || undefined,
    heroText: heroText || undefined,
    recipeIds: selectedRecipes.map((r) => r.id),
    product: selectedProduct || undefined,
    contentHtml: contentHtml || undefined,
  });

  const handleEmailPreview = async () => {
    if (!subject.trim()) {
      toast.error("Subject line is required");
      return;
    }

    setPreviewing(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), previewOnly: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Preview failed");
      }

      toast.success("Preview sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send preview"
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error("Subject line is required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildPayload(), previewOnly: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Send failed");
      }

      toast.success(
        `Newsletter sent to ${data.sent} subscriber${data.sent !== 1 ? "s" : ""}` +
          (data.errors > 0 ? ` (${data.errors} errors)` : "")
      );

      setConfirmDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send newsletter"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Newsletter</h2>
          <p className="text-muted-foreground mt-1">
            Compose and send newsletters to subscribers
          </p>
        </div>
        {subscriberCount !== null && (
          <div className="flex items-center gap-2 text-sm text-white bg-muted px-3 py-1.5 rounded-md">
            <Users className="h-4 w-4" />
            {subscriberCount} active subscriber
            {subscriberCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Two-column layout: Form + Preview */}
      <div className="flex gap-6 items-start">
        {/* Left column: Compose form */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              placeholder="e.g. New Wild Game Recipes This Week"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Hero Section */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-lg">Hero / Intro</h3>
            <div className="space-y-2">
              <Label htmlFor="heroHeading">Heading</Label>
              <Input
                id="heroHeading"
                placeholder="e.g. Fresh From the Field"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroText">Intro Text</Label>
              <Textarea
                id="heroText"
                placeholder="A warm greeting or intro paragraph..."
                rows={3}
                value={heroText}
                onChange={(e) => setHeroText(e.target.value)}
              />
            </div>
          </div>

          {/* Featured Recipes */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Featured Recipes</h3>
              <span className="text-sm text-muted-foreground">
                {selectedRecipes.length}/3 selected
              </span>
            </div>

            {selectedRecipes.length > 0 && (
              <div className="space-y-2">
                {selectedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex items-center gap-3 rounded-md border bg-muted/50 p-3"
                  >
                    {recipe.featuredImageUrl && (
                      <img
                        src={recipe.featuredImageUrl}
                        alt={recipe.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{recipe.title}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {recipe.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRecipe(recipe.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedRecipes.length < 3 && (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes to add..."
                    className="pl-9"
                    value={recipeSearch}
                    onChange={(e) => {
                      setRecipeSearch(e.target.value);
                      setShowRecipePicker(true);
                    }}
                    onFocus={() => setShowRecipePicker(true)}
                    onBlur={() =>
                      setTimeout(() => setShowRecipePicker(false), 200)
                    }
                  />
                </div>
                {showRecipePicker && filteredRecipes.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg max-h-48 overflow-y-auto">
                    {filteredRecipes.slice(0, 8).map((recipe) => (
                      <button
                        key={recipe.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center gap-3"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addRecipe(recipe)}
                      >
                        {recipe.featuredImageUrl && (
                          <img
                            src={recipe.featuredImageUrl}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="truncate">{recipe.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Spotlight */}
          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Product Spotlight (Optional)
              </h3>
              {selectedProduct && (
                <Button variant="ghost" size="sm" onClick={clearProduct}>
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            {selectedProduct ? (
              <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                {selectedProduct.imageUrl && (
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {selectedProduct.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.price}
                  </p>
                </div>
              </div>
            ) : shopifyProducts.length > 0 ? (
              <div className="relative">
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products from your shop..."
                    className="pl-9"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductPicker(true);
                    }}
                    onFocus={() => setShowProductPicker(true)}
                    onBlur={() =>
                      setTimeout(() => setShowProductPicker(false), 200)
                    }
                  />
                </div>
                {showProductPicker && filteredProducts.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center gap-3"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectProduct(p)}
                      >
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        )}
                        <span className="flex-1 truncate">{p.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {p.price}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No Shopify products available. Check your Shopify configuration.
              </p>
            )}
          </div>

          {/* Content Block */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold text-lg">
              Content Block (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Free-form content for stories, tips, or updates. Supports basic
              HTML: &lt;p&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;.
            </p>
            <Textarea
              placeholder="<p>We've been out in the field testing new recipes...</p>"
              rows={6}
              value={contentHtml}
              onChange={(e) => setContentHtml(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleEmailPreview}
              disabled={previewing || !subject.trim()}
            >
              <Mail className="mr-2 h-4 w-4" />
              {previewing ? "Sending..." : "Email Preview to Me"}
            </Button>
            <Button
              onClick={() => {
                if (!subject.trim()) {
                  toast.error("Subject line is required");
                  return;
                }
                setConfirmDialogOpen(true);
              }}
              disabled={!subject.trim()}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to All Subscribers
            </Button>
          </div>
        </div>

        {/* Right column: Live Preview */}
        <div className="w-[420px] shrink-0 sticky top-6">
          <div className="rounded-lg border overflow-hidden bg-white">
            <div className="bg-muted px-4 py-2 border-b">
              <p className="text-sm font-medium text-white">
                Live Preview
              </p>
            </div>
            <iframe
              ref={iframeRef}
              title="Newsletter preview"
              className="w-full border-0"
              style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>

      {/* Send Confirmation Dialog */}
      <AlertDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Newsletter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send the newsletter to{" "}
              <strong>
                {subscriberCount ?? "all"} active subscriber
                {subscriberCount !== 1 ? "s" : ""}
              </strong>
              . This action cannot be undone.
              <br />
              <br />
              Subject: <strong>{subject}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : "Send Newsletter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type Recipe = {
  id: string;
  title: string;
  slug: string;
  featuredImageUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
};

export default function ReorderRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [filter, setFilter] = useState<"all" | "featured">("all");

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch("/api/admin/recipes");
        if (response.ok) {
          const data = await response.json();
          setRecipes(
            data
              .filter((r: Recipe) => r.isPublished)
              .sort((a: Recipe, b: Recipe) => a.displayOrder - b.displayOrder)
          );
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Failed to load recipes");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, []);

  const filteredRecipes =
    filter === "featured"
      ? recipes.filter((r) => r.isFeatured)
      : recipes;

  const moveItem = useCallback(
    (id: string, direction: "up" | "down" | "top" | "bottom") => {
      setRecipes((prev) => {
        const list = [...prev];
        const index = list.findIndex((r) => r.id === id);
        if (index === -1) return prev;

        const item = list[index];
        list.splice(index, 1);

        let newIndex: number;
        switch (direction) {
          case "up":
            newIndex = Math.max(0, index - 1);
            break;
          case "down":
            newIndex = Math.min(list.length, index + 1);
            break;
          case "top":
            newIndex = 0;
            break;
          case "bottom":
            newIndex = list.length;
            break;
        }

        list.splice(newIndex, 0, item);

        // Reassign displayOrder
        return list.map((r, i) => ({ ...r, displayOrder: i + 1 }));
      });
      setHasChanges(true);
    },
    []
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = recipes.map((r) => ({
        id: r.id,
        displayOrder: r.displayOrder,
      }));

      const response = await fetch("/api/admin/recipes/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order");
      }

      setHasChanges(false);
      toast.success("Recipe order saved");
    } catch (error) {
      toast.error("Failed to save recipe order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/recipes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Reorder Recipes</h2>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Order"}
        </Button>
      </div>

      {hasChanges && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          You have unsaved changes. Click "Save Order" to persist the new order.
        </div>
      )}

      <Tabs
        defaultValue="all"
        onValueChange={(v) => setFilter(v as "all" | "featured")}
      >
        <TabsList>
          <TabsTrigger value="all">All Published ({recipes.length})</TabsTrigger>
          <TabsTrigger value="featured">
            Featured Only ({recipes.filter((r) => r.isFeatured).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <RecipeList
            recipes={filteredRecipes}
            onMove={moveItem}
            totalCount={recipes.length}
          />
        </TabsContent>
        <TabsContent value="featured" className="mt-4">
          <RecipeList
            recipes={filteredRecipes}
            onMove={moveItem}
            totalCount={recipes.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecipeList({
  recipes,
  onMove,
  totalCount,
}: {
  recipes: Recipe[];
  onMove: (id: string, direction: "up" | "down" | "top" | "bottom") => void;
  totalCount: number;
}) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted p-12 text-center">
        <p className="text-muted-foreground">No recipes to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {recipes.map((recipe, index) => (
        <div
          key={recipe.id}
          className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
        >
          {/* Position number */}
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold">
            {recipe.displayOrder}
          </div>

          {/* Thumbnail */}
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {recipe.featuredImageUrl ? (
              <Image
                src={recipe.featuredImageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                N/A
              </div>
            )}
          </div>

          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{recipe.title}</p>
            <div className="flex gap-1 mt-0.5">
              {recipe.isFeatured && (
                <Badge variant="outline" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Move buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={recipe.displayOrder === 1}
              onClick={() => onMove(recipe.id, "top")}
              title="Move to top"
            >
              <ChevronsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={recipe.displayOrder === 1}
              onClick={() => onMove(recipe.id, "up")}
              title="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={recipe.displayOrder === totalCount}
              onClick={() => onMove(recipe.id, "down")}
              title="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={recipe.displayOrder === totalCount}
              onClick={() => onMove(recipe.id, "bottom")}
              title="Move to bottom"
            >
              <ChevronsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

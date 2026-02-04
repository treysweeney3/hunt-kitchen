"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type RecipeCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
};

type GameType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    recipes: number;
  };
};

type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

type GameTypeFormData = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function CategoriesPage() {
  const [recipeCategories, setRecipeCategories] = useState<RecipeCategory[]>([]);
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);

  // Recipe Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RecipeCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    displayOrder: 0,
    isActive: true,
  });
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  // Game Type modal state
  const [gameTypeModalOpen, setGameTypeModalOpen] = useState(false);
  const [editingGameType, setEditingGameType] = useState<GameType | null>(null);
  const [gameTypeForm, setGameTypeForm] = useState<GameTypeFormData>({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });
  const [gameTypeSubmitting, setGameTypeSubmitting] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "category" | "gameType"; item: RecipeCategory | GameType } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      const [recipeRes, gameTypeRes] = await Promise.all([
        fetch("/api/admin/categories/recipes"),
        fetch("/api/admin/game-types"),
      ]);

      if (recipeRes.ok) {
        const data = await recipeRes.json();
        setRecipeCategories(data);
      }

      if (gameTypeRes.ok) {
        const data = await gameTypeRes.json();
        setGameTypes(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Recipe Category handlers
  const openCategoryModal = (category?: RecipeCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        imageUrl: category.imageUrl || "",
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        displayOrder: 0,
        isActive: true,
      });
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategorySubmitting(true);

    try {
      const url = editingCategory
        ? `/api/admin/categories/recipes/${editingCategory.id}`
        : "/api/admin/categories/recipes";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(editingCategory ? "Category updated" : "Category created");
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Game Type handlers
  const openGameTypeModal = (gameType?: GameType) => {
    if (gameType) {
      setEditingGameType(gameType);
      setGameTypeForm({
        name: gameType.name,
        slug: gameType.slug,
        description: gameType.description || "",
        imageUrl: gameType.imageUrl || "",
        isActive: gameType.isActive,
      });
    } else {
      setEditingGameType(null);
      setGameTypeForm({
        name: "",
        slug: "",
        description: "",
        imageUrl: "",
        isActive: true,
      });
    }
    setGameTypeModalOpen(true);
  };

  const handleGameTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGameTypeSubmitting(true);

    try {
      const url = editingGameType
        ? `/api/admin/game-types/${editingGameType.id}`
        : "/api/admin/game-types";
      const method = editingGameType ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameTypeForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save game type");
      }

      toast.success(editingGameType ? "Game type updated" : "Game type created");
      setGameTypeModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save game type");
    } finally {
      setGameTypeSubmitting(false);
    }
  };

  // Delete handlers
  const confirmDelete = (type: "category" | "gameType", item: RecipeCategory | GameType) => {
    setItemToDelete({ type, item });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      const url =
        itemToDelete.type === "category"
          ? `/api/admin/categories/recipes/${itemToDelete.item.id}`
          : `/api/admin/game-types/${itemToDelete.item.id}`;

      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete");
      }

      toast.success(
        itemToDelete.type === "category" ? "Category deleted" : "Game type deleted"
      );
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const recipeCategoryColumns: ColumnDef<RecipeCategory>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {row.getValue("slug")}
        </div>
      ),
    },
    {
      accessorKey: "displayOrder",
      header: "Order",
      cell: ({ row }) => <div className="text-sm">{row.getValue("displayOrder")}</div>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return format(new Date(row.getValue("createdAt")), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openCategoryModal(category)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => confirmDelete("category", category)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  const gameTypeColumns: ColumnDef<GameType>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {row.getValue("slug")}
        </div>
      ),
    },
    {
      id: "recipes",
      header: "Recipes",
      cell: ({ row }) => {
        const gameType = row.original;
        return <div className="text-sm">{gameType._count?.recipes ?? 0}</div>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        return format(new Date(row.getValue("createdAt")), "MMM d, yyyy");
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const gameType = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openGameTypeModal(gameType)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => confirmDelete("gameType", gameType)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>

      <Tabs defaultValue="recipes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recipes">Recipe Categories</TabsTrigger>
          <TabsTrigger value="gameTypes">Game Types</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openCategoryModal()}>
              <Plus className="mr-2 h-4 w-4" />
              New Recipe Category
            </Button>
          </div>
          <DataTable
            columns={recipeCategoryColumns}
            data={recipeCategories}
            searchKey="name"
            searchPlaceholder="Search recipe categories..."
          />
        </TabsContent>

        <TabsContent value="gameTypes" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openGameTypeModal()}>
              <Plus className="mr-2 h-4 w-4" />
              New Game Type
            </Button>
          </div>
          <DataTable
            columns={gameTypeColumns}
            data={gameTypes}
            searchKey="name"
            searchPlaceholder="Search game types..."
          />
        </TabsContent>
      </Tabs>

      {/* Recipe Category Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Recipe Category" : "New Recipe Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the recipe category details below."
                : "Create a new recipe category for organizing recipes."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCategorySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm((prev) => ({
                      ...prev,
                      name,
                      slug: !editingCategory ? slugify(name) : prev.slug,
                    }));
                  }}
                  placeholder="e.g., Quick & Easy"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-slug">Slug</Label>
                <Input
                  id="category-slug"
                  value={categoryForm.slug}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="e.g., quick-easy"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
              {editingCategory && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="category-imageUrl">Image URL</Label>
                    <Input
                      id="category-imageUrl"
                      type="url"
                      value={categoryForm.imageUrl}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category-displayOrder">Display Order</Label>
                    <Input
                      id="category-displayOrder"
                      type="number"
                      value={categoryForm.displayOrder}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({
                          ...prev,
                          displayOrder: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="category-isActive"
                      checked={categoryForm.isActive}
                      onCheckedChange={(checked) =>
                        setCategoryForm((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label htmlFor="category-isActive">Active</Label>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={categorySubmitting}>
                {categorySubmitting
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Game Type Modal */}
      <Dialog open={gameTypeModalOpen} onOpenChange={setGameTypeModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingGameType ? "Edit Game Type" : "New Game Type"}
            </DialogTitle>
            <DialogDescription>
              {editingGameType
                ? "Update the game type details below."
                : "Create a new game type for categorizing recipes by protein source."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGameTypeSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="gameType-name">Name</Label>
                <Input
                  id="gameType-name"
                  value={gameTypeForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setGameTypeForm((prev) => ({
                      ...prev,
                      name,
                      slug: !editingGameType ? slugify(name) : prev.slug,
                    }));
                  }}
                  placeholder="e.g., Venison"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gameType-slug">Slug</Label>
                <Input
                  id="gameType-slug"
                  value={gameTypeForm.slug}
                  onChange={(e) =>
                    setGameTypeForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="e.g., venison"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gameType-description">Description</Label>
                <Textarea
                  id="gameType-description"
                  value={gameTypeForm.description}
                  onChange={(e) =>
                    setGameTypeForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Brief description of this game type..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gameType-imageUrl">Image URL</Label>
                <Input
                  id="gameType-imageUrl"
                  type="url"
                  value={gameTypeForm.imageUrl}
                  onChange={(e) =>
                    setGameTypeForm((prev) => ({ ...prev, imageUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="gameType-isActive"
                  checked={gameTypeForm.isActive}
                  onCheckedChange={(checked) =>
                    setGameTypeForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="gameType-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setGameTypeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={gameTypeSubmitting}>
                {gameTypeSubmitting
                  ? "Saving..."
                  : editingGameType
                    ? "Update Game Type"
                    : "Create Game Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the{" "}
              {itemToDelete?.type === "category" ? "category" : "game type"}{" "}
              <strong>{itemToDelete?.item.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

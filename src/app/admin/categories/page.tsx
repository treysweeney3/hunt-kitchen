"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { format } from "date-fns";

type Category = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
};

const createColumns = (): ColumnDef<Category>[] => [
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
];

export default function CategoriesPage() {
  const [recipeCategories, setRecipeCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const [recipeRes, productRes] = await Promise.all([
          fetch("/api/admin/categories/recipes"),
          fetch("/api/admin/categories/products"),
        ]);

        if (recipeRes.ok) {
          const data = await recipeRes.json();
          setRecipeCategories(data);
        }

        if (productRes.ok) {
          const data = await productRes.json();
          setProductCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

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
          <TabsTrigger value="products">Product Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Recipe Category
            </Button>
          </div>
          <DataTable
            columns={createColumns()}
            data={recipeCategories}
            searchKey="name"
            searchPlaceholder="Search recipe categories..."
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-end">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Product Category
            </Button>
          </div>
          <DataTable
            columns={createColumns()}
            data={productCategories}
            searchKey="name"
            searchPlaceholder="Search product categories..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

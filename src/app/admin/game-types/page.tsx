"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { format } from "date-fns";

type GameType = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    recipes: number;
  };
};

const columns: ColumnDef<GameType>[] = [
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
    cell: ({ row }) => <div className="text-sm">{row.original._count.recipes}</div>,
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

export default function GameTypesPage() {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGameTypes() {
      try {
        const response = await fetch("/api/admin/game-types");
        if (response.ok) {
          const data = await response.json();
          setGameTypes(data);
        }
      } catch (error) {
        console.error("Error fetching game types:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGameTypes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading game types...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Game Types</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Game Type
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={gameTypes}
        searchKey="name"
        searchPlaceholder="Search game types..."
      />
    </div>
  );
}

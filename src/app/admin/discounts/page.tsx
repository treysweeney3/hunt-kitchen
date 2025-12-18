"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

type Discount = {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: string;
  usageCount: number;
  usageLimit: number | null;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <div className="font-mono font-medium">{row.getValue("code")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.getValue("description");
      return desc ? (
        <div className="text-sm">{desc as string}</div>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "discountType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("discountType") as string;
      return (
        <Badge variant="outline">
          {type === "PERCENTAGE"
            ? "Percentage"
            : type === "FIXED_AMOUNT"
            ? "Fixed Amount"
            : "Free Shipping"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "discountValue",
    header: "Value",
    cell: ({ row }) => {
      const type = row.original.discountType;
      const value = Number(row.getValue("discountValue"));
      return (
        <div className="font-medium">
          {type === "PERCENTAGE" ? `${value}%` : `$${value.toFixed(2)}`}
        </div>
      );
    },
  },
  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => {
      const count = row.original.usageCount;
      const limit = row.original.usageLimit;
      return (
        <div className="text-sm">
          {count} {limit ? `/ ${limit}` : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const date = row.getValue("expiresAt");
      return date ? (
        <div className="text-sm">
          {format(new Date(date as string), "MMM d, yyyy")}
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Never</span>
      );
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
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscounts() {
      try {
        const response = await fetch("/api/admin/discounts");
        if (response.ok) {
          const data = await response.json();
          setDiscounts(data);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDiscounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading discounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Discount Codes</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Discount
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={discounts}
        searchKey="code"
        searchPlaceholder="Search discount codes..."
      />
    </div>
  );
}

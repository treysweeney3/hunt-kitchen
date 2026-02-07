"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
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

type Subscriber = {
  id: string;
  email: string;
  firstName: string | null;
  isSubscribed: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
  source: string | null;
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] =
    useState<Subscriber | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const confirmDelete = (subscriber: Subscriber) => {
    setSubscriberToDelete(subscriber);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!subscriberToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/subscribers/${subscriberToDelete.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Subscriber removed");
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
      setSubscribers((prev) =>
        prev.filter((s) => s.id !== subscriberToDelete.id)
      );
    } catch (error) {
      toast.error("Failed to delete subscriber");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Subscriber>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => {
        const name = row.getValue("firstName") as string | null;
        return (
          <div className="text-sm">{name || <span className="text-muted-foreground">-</span>}</div>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.getValue("source") as string | null;
        return (
          <div className="text-sm capitalize">
            {source || "website"}
          </div>
        );
      },
    },
    {
      accessorKey: "subscribedAt",
      header: "Subscribed",
      cell: ({ row }) =>
        format(new Date(row.getValue("subscribedAt")), "MMM d, yyyy"),
    },
    {
      accessorKey: "isSubscribed",
      header: "Status",
      cell: ({ row }) => {
        const isSubscribed = row.getValue("isSubscribed") as boolean;
        return (
          <Badge variant={isSubscribed ? "default" : "secondary"}>
            {isSubscribed ? "Active" : "Unsubscribed"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const subscriber = row.original;
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => confirmDelete(subscriber)}
              title="Delete subscriber"
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
        <p className="text-muted-foreground">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscribers</h2>
          <p className="text-muted-foreground mt-1">
            Newsletter subscribers ({subscribers.filter((s) => s.isSubscribed).length} active)
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={subscribers}
        searchKey="email"
        searchPlaceholder="Search by email..."
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <strong>{subscriberToDelete?.email}</strong> from the subscriber
              list. This action cannot be undone.
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

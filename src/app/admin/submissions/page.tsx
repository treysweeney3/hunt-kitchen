"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Mail, MailOpen, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from "sonner";

type Submission = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: string;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewSubmission, setViewSubmission] = useState<Submission | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] =
    useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleToggleRead = async (submission: Submission) => {
    try {
      const res = await fetch(`/api/admin/submissions/${submission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !submission.isRead }),
      });

      if (!res.ok) {
        throw new Error("Failed to update");
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id ? { ...s, isRead: !s.isRead } : s
        )
      );
      toast.success(
        submission.isRead ? "Marked as unread" : "Marked as read"
      );
    } catch (error) {
      toast.error("Failed to update submission");
    }
  };

  const handleView = async (submission: Submission) => {
    setViewSubmission(submission);

    // Auto-mark as read when viewing
    if (!submission.isRead) {
      try {
        const res = await fetch(`/api/admin/submissions/${submission.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });

        if (res.ok) {
          setSubmissions((prev) =>
            prev.map((s) =>
              s.id === submission.id ? { ...s, isRead: true } : s
            )
          );
        }
      } catch {
        // Silently fail — viewing still works
      }
    }
  };

  const confirmDelete = (submission: Submission) => {
    setSubmissionToDelete(submission);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!submissionToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/submissions/${submissionToDelete.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Submission deleted");
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
      setSubmissions((prev) =>
        prev.filter((s) => s.id !== submissionToDelete.id)
      );
    } catch (error) {
      toast.error("Failed to delete submission");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<Submission>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className={submission.isRead ? "" : "font-bold"}>
              {submission.name}
            </span>
            {!submission.isRead && (
              <Badge variant="default" className="text-xs">
                New
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue("email")}`}
          className="text-sm text-muted-foreground hover:underline"
        >
          {row.getValue("email") as string}
        </a>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => {
        const subject = row.getValue("subject") as string | null;
        return (
          <div className="max-w-[200px] truncate text-sm">
            {subject || "No subject"}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("createdAt")), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(submission)}
              title="View message"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleToggleRead(submission)}
              title={submission.isRead ? "Mark as unread" : "Mark as read"}
            >
              {submission.isRead ? (
                <MailOpen className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => confirmDelete(submission)}
              title="Delete"
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
        <p className="text-muted-foreground">Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
          <p className="text-muted-foreground mt-1">
            Contact form submissions ({submissions.filter((s) => !s.isRead).length} unread)
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={submissions}
        searchKey="name"
        searchPlaceholder="Search by name..."
      />

      {/* View Submission Dialog */}
      <Dialog
        open={!!viewSubmission}
        onOpenChange={(open) => !open && setViewSubmission(null)}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {viewSubmission?.subject || "No subject"}
            </DialogTitle>
            <DialogDescription>
              From {viewSubmission?.name} ({viewSubmission?.email}) on{" "}
              {viewSubmission &&
                format(
                  new Date(viewSubmission.createdAt),
                  "MMM d, yyyy 'at' h:mm a"
                )}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border p-4">
              <p className="whitespace-pre-wrap text-sm">
                {viewSubmission?.message}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${viewSubmission?.email}`}>Reply via Email</a>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the submission from{" "}
              <strong>{submissionToDelete?.name}</strong>. This action cannot be
              undone.
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

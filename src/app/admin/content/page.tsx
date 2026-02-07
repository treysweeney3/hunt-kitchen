"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface TikTokVideo {
  id: string;
  title: string;
}

interface InstagramPost {
  id: string;
  title: string;
}

interface YouTubeVideo {
  id: string;
  title: string;
  featured?: boolean;
}

interface SiteContent {
  tiktok_videos: TikTokVideo[];
  homepage_tiktok_videos: TikTokVideo[];
  instagram_posts: InstagramPost[];
  youtube_videos: YouTubeVideo[];
}

// ============================================================================
// Page component
// ============================================================================

export default function ContentManagementPage() {
  const [content, setContent] = useState<SiteContent>({
    tiktok_videos: [],
    homepage_tiktok_videos: [],
    instagram_posts: [],
    youtube_videos: [],
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch("/api/admin/content");
        if (response.ok) {
          const data = await response.json();
          setContent({
            tiktok_videos: data.tiktok_videos || [],
            homepage_tiktok_videos: data.homepage_tiktok_videos || [],
            instagram_posts: data.instagram_posts || [],
            youtube_videos: data.youtube_videos || [],
          });
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const saveContent = useCallback(
    async (key: keyof SiteContent) => {
      setSavingKey(key);
      try {
        const response = await fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: content[key] }),
        });

        if (!response.ok) throw new Error("Failed to save");
        toast.success("Content saved");
      } catch (error) {
        toast.error("Failed to save content");
      } finally {
        setSavingKey(null);
      }
    },
    [content]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
      </div>

      <Tabs defaultValue="tiktok" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="instagram">Instagram</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
        </TabsList>

        {/* TikTok Tab */}
        <TabsContent value="tiktok" className="space-y-8">
          <ContentSection
            title="Content Page Videos"
            description="Videos shown on the /content page"
            items={content.tiktok_videos}
            onChange={(items) =>
              setContent((prev) => ({ ...prev, tiktok_videos: items }))
            }
            onSave={() => saveContent("tiktok_videos")}
            saving={savingKey === "tiktok_videos"}
            idLabel="TikTok Video ID"
            idPlaceholder="e.g., 7546725499482000654"
          />
          <ContentSection
            title="Homepage Videos"
            description="Videos shown in the TikTok section on the homepage"
            items={content.homepage_tiktok_videos}
            onChange={(items) =>
              setContent((prev) => ({ ...prev, homepage_tiktok_videos: items }))
            }
            onSave={() => saveContent("homepage_tiktok_videos")}
            saving={savingKey === "homepage_tiktok_videos"}
            idLabel="TikTok Video ID"
            idPlaceholder="e.g., 7546725499482000654"
          />
        </TabsContent>

        {/* Instagram Tab */}
        <TabsContent value="instagram" className="space-y-8">
          <ContentSection
            title="Instagram Posts"
            description="Posts shown on the /content page (use the code after /p/ in the Instagram URL)"
            items={content.instagram_posts}
            onChange={(items) =>
              setContent((prev) => ({ ...prev, instagram_posts: items }))
            }
            onSave={() => saveContent("instagram_posts")}
            saving={savingKey === "instagram_posts"}
            idLabel="Instagram Post ID"
            idPlaceholder="e.g., DNJrlktJidZ"
          />
        </TabsContent>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="space-y-8">
          <YouTubeSection
            items={content.youtube_videos}
            onChange={(items) =>
              setContent((prev) => ({ ...prev, youtube_videos: items }))
            }
            onSave={() => saveContent("youtube_videos")}
            saving={savingKey === "youtube_videos"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Generic content list section (TikTok / Instagram)
// ============================================================================

function ContentSection<T extends { id: string; title: string }>({
  title,
  description,
  items,
  onChange,
  onSave,
  saving,
  idLabel,
  idPlaceholder,
}: {
  title: string;
  description: string;
  items: T[];
  onChange: (items: T[]) => void;
  onSave: () => void;
  saving: boolean;
  idLabel: string;
  idPlaceholder: string;
}) {
  const [newId, setNewId] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const addItem = () => {
    if (!newId.trim()) return;
    onChange([...items, { id: newId.trim(), title: newTitle.trim() } as T]);
    setNewId("");
    setNewTitle("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const list = [...items];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    onChange(list);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button onClick={onSave} disabled={saving} size="sm">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Item list */}
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-3 rounded-lg border bg-card p-3"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono truncate">{item.id}</p>
              {item.title && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={index === 0}
                onClick={() => moveItem(index, "up")}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={index === items.length - 1}
                onClick={() => moveItem(index, "down")}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="flex items-end gap-3 rounded-lg border border-dashed p-3">
        <div className="flex-1 grid gap-1.5">
          <Label className="text-xs">{idLabel}</Label>
          <Input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder={idPlaceholder}
            className="h-9"
          />
        </div>
        <div className="flex-1 grid gap-1.5">
          <Label className="text-xs">Title (optional)</Label>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Venison Tacos"
            className="h-9"
          />
        </div>
        <Button
          size="sm"
          onClick={addItem}
          disabled={!newId.trim()}
          className="h-9"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// YouTube section (with featured toggle)
// ============================================================================

function YouTubeSection({
  items,
  onChange,
  onSave,
  saving,
}: {
  items: YouTubeVideo[];
  onChange: (items: YouTubeVideo[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [newId, setNewId] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const addItem = () => {
    if (!newId.trim()) return;
    onChange([...items, { id: newId.trim(), title: newTitle.trim(), featured: false }]);
    setNewId("");
    setNewTitle("");
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const list = [...items];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= list.length) return;
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    onChange(list);
  };

  const toggleFeatured = (index: number) => {
    const list = items.map((item, i) => ({
      ...item,
      featured: i === index ? !item.featured : item.featured,
    }));
    onChange(list);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">YouTube Videos</h3>
          <p className="text-sm text-muted-foreground">
            Videos shown on the /content page. The featured video displays full-width.
          </p>
        </div>
        <Button onClick={onSave} disabled={saving} size="sm">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Item list */}
      <div className="space-y-1">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center gap-3 rounded-lg border bg-card p-3"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono truncate">{item.id}</p>
              {item.title && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <Switch
                  checked={item.featured || false}
                  onCheckedChange={() => toggleFeatured(index)}
                  id={`featured-${index}`}
                />
                <Label htmlFor={`featured-${index}`} className="text-xs">
                  Featured
                </Label>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => moveItem(index, "up")}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, "down")}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div className="flex items-end gap-3 rounded-lg border border-dashed p-3">
        <div className="flex-1 grid gap-1.5">
          <Label className="text-xs">YouTube Video ID</Label>
          <Input
            value={newId}
            onChange={(e) => setNewId(e.target.value)}
            placeholder="e.g., geDFMhYxRbQ"
            className="h-9"
          />
        </div>
        <div className="flex-1 grid gap-1.5">
          <Label className="text-xs">Title</Label>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Venison Enchiladas"
            className="h-9"
          />
        </div>
        <Button
          size="sm"
          onClick={addItem}
          disabled={!newId.trim()}
          className="h-9"
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
}

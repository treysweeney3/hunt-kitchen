"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { ZoomIn, X } from "lucide-react";

interface ProductGalleryProps {
  featuredImage: string;
  galleryImages?: string[];
  videoUrl?: string | null;
  productName: string;
  selectedImageUrl?: string | null;
}

export function ProductGallery({
  featuredImage,
  galleryImages = [],
  videoUrl,
  productName,
  selectedImageUrl,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Combine all media: featured image, gallery images (deduplicated), and optional video
  const allMedia = useMemo(() => {
    const seenUrls = new Set<string>();
    const media: Array<{ type: "image" | "video"; url: string }> = [];

    // Add featured image first
    if (featuredImage) {
      seenUrls.add(featuredImage);
      media.push({ type: "image", url: featuredImage });
    }

    // Add gallery images, skipping duplicates
    for (const url of galleryImages) {
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        media.push({ type: "image", url });
      }
    }

    // Add video if present
    if (videoUrl) {
      media.push({ type: "video", url: videoUrl });
    }

    return media;
  }, [featuredImage, galleryImages, videoUrl]);

  // When selectedImageUrl changes, find and select that image
  useEffect(() => {
    if (selectedImageUrl) {
      const index = allMedia.findIndex(
        (media) => media.type === "image" && media.url === selectedImageUrl
      );
      if (index !== -1) {
        setSelectedIndex(index);
      }
    }
  }, [selectedImageUrl, allMedia]);

  const selectedMedia = allMedia[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main image/video */}
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <AspectRatio ratio={4 / 5}>
          {selectedMedia.type === "image" ? (
            <div
              className="group relative h-full w-full cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src={selectedMedia.url}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                fill
                className={cn(
                  "object-cover transition-transform duration-300",
                  "group-hover:scale-110"
                )}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={selectedIndex === 0}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                <ZoomIn className="text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <video
                src={selectedMedia.url}
                controls
                className="h-full w-full object-cover"
                poster={featuredImage}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </AspectRatio>
      </div>

      {/* Thumbnail strip */}
      {allMedia.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative overflow-hidden rounded-md border-2 transition-all",
                selectedIndex === index
                  ? "border-[#2D5A3D] ring-2 ring-[#2D5A3D] ring-offset-2"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              <AspectRatio ratio={1}>
                {media.type === "image" ? (
                  <Image
                    src={media.url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 20vw, 10vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </AspectRatio>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedMedia.type === "image" ? (
              <div className="relative max-h-[90vh] w-full">
                <Image
                  src={selectedMedia.url}
                  alt={`${productName} - Full size`}
                  width={1200}
                  height={1500}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className="max-h-[90vh] w-full"
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

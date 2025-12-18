'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBreadcrumbStructuredData, type BreadcrumbItem } from '@/lib/seo';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  includeHome?: boolean;
}

/**
 * Breadcrumb navigation component with JSON-LD structured data
 * Automatically includes Home breadcrumb unless disabled
 */
export function Breadcrumbs({
  items,
  className,
  includeHome = true,
}: BreadcrumbsProps) {
  // Prepend Home to breadcrumbs if enabled
  const breadcrumbItems: BreadcrumbItem[] = includeHome
    ? [{ name: 'Home', href: '/' }, ...items]
    : items;

  // Generate structured data
  const structuredData = generateBreadcrumbStructuredData(breadcrumbItems);

  return (
    <>
      <JsonLd data={structuredData as unknown as Record<string, unknown>} />
      <nav
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-2 text-sm', className)}
      >
        <ol className="flex items-center space-x-2">
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-2 h-4 w-4 text-slate" aria-hidden="true" />
                )}
                {isLast ? (
                  <span
                    className="font-medium text-[#4A3728]"
                    aria-current="page"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href || '/'}
                    className="flex items-center gap-1 text-slate hover:text-[#2D5A3D] transition-colors"
                  >
                    {isFirst && includeHome && (
                      <Home className="h-4 w-4" aria-hidden="true" />
                    )}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

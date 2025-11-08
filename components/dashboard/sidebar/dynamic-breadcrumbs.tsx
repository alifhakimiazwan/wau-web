"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Map of route segments to display names
const segmentNames: Record<string, string> = {
  store: "Store",
  products: "Products",
  "lead-magnet": "Lead Magnet",
  digital: "Digital Product",
  physical: "Physical Product",
  settings: "Settings",
  profile: "Profile",
  design: "Design",
  analytics: "Analytics",
  create: "Create",
  edit: "Edit",
  new: "New",
};

export function DynamicBreadcrumbs() {
  const pathname = usePathname();

  // Split pathname into segments and filter out empty strings
  const segments = pathname.split("/").filter((segment) => segment !== "");

  // Generate breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    // Get display name, fallback to capitalized segment
    const label =
      segmentNames[segment] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
      label,
      href,
      isLast,
    };
  });

  // If no breadcrumbs (root path), show Dashboard
  if (breadcrumbs.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-1.5 sm:gap-2.5">
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

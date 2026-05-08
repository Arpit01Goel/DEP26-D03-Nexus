"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Notifications page - redirects to most relevant section
 * Users typically access notifications via the widget popup that routes to specific pages
 */
export default function NotificationsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to mailing as default for coordinators
    router.replace("/mailing");
  }, [router]);

  return null;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import AdminDashboardClient from "./AdminDashboardClient";
import { addBasePath } from "@/lib/base-path";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(addBasePath("/login"));
  }

  if (user.role !== "tpo_admin") {
    redirect(addBasePath("/unauthorized"));
  }

  return <AdminDashboardClient />;
}

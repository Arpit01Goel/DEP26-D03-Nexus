import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { canAccessAppPath } from "@/lib/auth/rbac";
import { addBasePath } from "@/lib/base-path";

export default async function MailingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(addBasePath("/login"));
  }

  if (!canAccessAppPath("/mailing", user)) {
    redirect(addBasePath("/unauthorized?from=/mailing"));
  }

  return <>{children}</>;
}

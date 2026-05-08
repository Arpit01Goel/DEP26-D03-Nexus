import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import StudentShell from "@/components/layout/StudentShell";
import { addBasePath } from "@/lib/base-path";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(addBasePath("/login"));
  }

  if (user.role !== "student") {
    redirect(addBasePath("/unauthorized?from=/student"));
  }

  return (
    <StudentShell
      currentUser={{
        name: user.name,
        email: user.email,
      }}
    >
      {children}
    </StudentShell>
  );
}

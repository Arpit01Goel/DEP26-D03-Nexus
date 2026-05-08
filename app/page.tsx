import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth";
import { addBasePath } from "@/lib/base-path";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(addBasePath("/login"));
  }

  redirect(addBasePath(user.role === "student" ? "/student/blogs" : "/companies"));
}

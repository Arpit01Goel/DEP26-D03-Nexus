import { redirect } from "next/navigation";
import { addBasePath } from "@/lib/base-path";

export default function StudentHomePage() {
  redirect(addBasePath("/student/blogs"));
}

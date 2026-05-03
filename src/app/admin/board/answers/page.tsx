import { redirect } from "next/navigation";

export default function AdminBoardAnswersRedirectPage() {
  redirect("/admin/board/topics");
}

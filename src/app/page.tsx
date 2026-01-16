import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function Home() {
  const session = await getServerSession(authOptions)
  console.log("HOME SESSION:", JSON.stringify(session, null, 2));

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  } else if (session.user.role === "USER") {
    redirect("/user/dashboard")
  } else {
    redirect("/login")
  }
}

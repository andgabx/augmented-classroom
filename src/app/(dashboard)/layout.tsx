import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/server/session";
import { Sidebar } from "@/features/auth/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{
          name: session.name ?? null,
          email: session.email ?? null,
          picture: session.picture ?? null,
        }}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="flex w-full flex-col gap-8 px-6 py-12 lg:px-10">{children}</div>
      </main>
    </div>
  );
}

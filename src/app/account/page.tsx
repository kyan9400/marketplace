import { requireUserId, getSession, signOut } from "@/lib/user";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata = { title: "Account • MyShop" };

export default async function AccountPage() {
  const uid = await requireUserId();
  const session = await getSession();

  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const [orders, addresses] = await Promise.all([
    prisma.order.count({ where: { userId: uid } }),
    prisma.address.count({ where: { userId: uid } }),
  ]);

  async function signOutAction() {
    "use server";
    await signOut();
    redirect("/signin");
  }

  if (!user) return null;

  const initials =
    (user.name || user.email)
      .split("@")[0]
      .split(/\s+/)
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "U";

  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-content-center rounded-full bg-blue-600 text-white text-lg font-semibold">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {user.name || "Your account"}
                </h1>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            <form action={signOutAction}>
              <button
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Orders" value={orders} />
            <StatCard label="Saved addresses" value={addresses} />
            <StatCard
              label="Member since"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium">Quick links</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="/orders"
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                View orders
              </a>
              <a
                href="/products"
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Continue shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-gray-600">{label}</div>
    </div>
  );
}

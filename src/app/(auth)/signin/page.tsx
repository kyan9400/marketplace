import { redirect } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "@/lib/user";

export const metadata = { title: "Sign in • MyShop" };

export default async function SignInPage() {
  const session = await getSession();
  if (session.uid) redirect("/account");

  async function action(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const name = String(formData.get("name") || "");
    await signIn(email, name || undefined);
    redirect("/account");
  }

  return (
    <main className="min-h-[80vh] bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="container mx-auto max-w-lg px-4 py-20">
        <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow-md p-8">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sign in with your email. Well create your account if it doesnt exist.
          </p>

          <form action={action} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Jane Doe"
                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            New here?{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

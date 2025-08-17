import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "./signout-button";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div>
        <p>You are not signed in.</p>
        <Link href="/signin" className="underline">Go to sign in</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mt-2">Signed in as {session.user.email}</p>
      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}


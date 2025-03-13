import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <>
        <h1 className="mb-4 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
          Not Google Drive
        </h1>
        <p className="mx-auto mb-8 max-w-md text-xl text-neutral-400 md:text-2xl">
          Poor version of Google Drive
        </p>
        <form
          action={async () => {
            "use server";

            const session = await auth();

            // If the user is not signed in, redirect to the sign-in page
            if (!session.userId) {
              return redirect("/sign-in");
            }

            // If the user is signed in, redirect to the drive page
            return redirect("/drive");
          }}
        >
          <Button
            size="lg"
            type="submit"
            className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            Get Started
          </Button>
        </form>
    </>
  );
}
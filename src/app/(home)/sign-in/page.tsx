import { Button } from "~/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <>
        <SignInButton forceRedirectUrl={"/drive"}>
          <Button
            size="lg"
            type="submit"
            className="border border-neutral-700 bg-neutral-800 text-white transition-colors hover:bg-neutral-700"
          >
            Sign In
          </Button>
        </SignInButton>
    </>
  );
}
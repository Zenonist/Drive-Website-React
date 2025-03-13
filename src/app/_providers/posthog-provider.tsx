// app/providers.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { usePostHog } from "posthog-js/react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useAuth, useUser } from "@clerk/nextjs";
import dynamicLoader from "next/dynamic";

// This allows us to load PostHog dynamically, so that it doesn't load on the server.
const SuspendedPostHogPageView = dynamicLoader(
  () => Promise.resolve({ default: PostHogPageView }),
  {
    // This component is set to not render during server-side rendering (SSR: false)
    ssr: false,
  },
);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com"
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

function PostHogPageView() {
  const userInfo = useUser();
  const posthog = usePostHog();

  // Identify user
  useEffect(() => {
    if (userInfo.user?.id) {
      posthog.identify(userInfo.user?.id, {
        email: userInfo.user?.emailAddresses[0]?.emailAddress,
        name: userInfo.user?.fullName,
      });
    } else {
      posthog.reset();
    }
  }, [posthog, userInfo.user]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track pageviews
  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }

      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

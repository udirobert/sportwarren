"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-white flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl" role="img" aria-label="warning">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
            <p className="text-gray-400 mb-6">
              We apologize for the inconvenience. Please try again.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-green-600 rounded-xl font-bold hover:bg-green-700 active:bg-green-800 transition-all min-h-[44px]"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
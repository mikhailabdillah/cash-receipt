"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="container mx-auto flex items-center gap-4 py-20">
      <p>Sorry, something went wrong</p>
      {/** biome-ignore lint/performance/noJsxPropsBind: <> */}
      <Button onClick={() => window.history.back()} type="button">
        Go Back
      </Button>
    </div>
  );
}

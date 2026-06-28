"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/lib/actions/bookmarks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SaveGuideButton({ slug, initialSaved }: { slug: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(saved && "text-brand")}
      onClick={() => {
        setSaved(!saved);
        startTransition(() => toggleBookmark("guide", slug).then(() => {}));
      }}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
      {saved ? "Saved" : "Save guide"}
    </Button>
  );
}

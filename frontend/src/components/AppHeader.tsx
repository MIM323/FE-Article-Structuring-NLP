import React from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const AppHeader = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center justify-center rounded-2xl border px-3 py-2 shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Wikipedia Article Structurer
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste raw article text → extract structure → generate infobox +
          wikitext.
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary" className="rounded-xl">
          NLP
        </Badge>
        <Badge variant="secondary" className="rounded-xl">
          Wikipedia
        </Badge>
      </div>
    </div>
  );
};

export default AppHeader;

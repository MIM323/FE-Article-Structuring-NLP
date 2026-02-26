import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Braces } from "lucide-react";

type Props = {
  structured: any;
  loading: boolean;
  generateWikitext: boolean;
  wikitext: string;
  jsonText: string;
  copyToClipboard: (t: string) => void;
};

export const OutputCard: React.FC<Props> = ({
  structured,
  loading,
  generateWikitext,
  wikitext,
  jsonText,
  copyToClipboard,
}) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Braces className="h-5 w-5" /> Output
        </CardTitle>
        <CardDescription>
          Structured result. Copy JSON into your pipeline or paste wikitext into
          the Wikipedia editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!structured && loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-1/2 rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-10 w-2/3 rounded-2xl" />
          </div>
        ) : null}

        {!structured && !loading ? (
          <Alert className="rounded-2xl">
            <Copy className="h-4 w-4" />
            <div className="ml-2">
              <div className="font-medium">No output yet</div>
              <div className="text-sm text-muted-foreground">
                Click Structure to generate JSON and wikitext.
              </div>
            </div>
          </Alert>
        ) : null}

        {structured ? (
          <Tabs
            defaultValue={generateWikitext ? "wikitext" : "json"}
            className="w-full"
          >
            <TabsList className="w-full justify-start rounded-2xl">
              <TabsTrigger
                value="wikitext"
                className="rounded-2xl"
                disabled={!generateWikitext}
              >
                Wikitext
              </TabsTrigger>
              <TabsTrigger value="json" className="rounded-2xl">
                JSON
              </TabsTrigger>
              <TabsTrigger value="fields" className="rounded-2xl">
                Infobox fields
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wikitext" className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Generated wikitext</div>
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => copyToClipboard(wikitext)}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
              <div className="mt-2 rounded-2xl border bg-muted/30">
                <ScrollArea className="h-[420px]">
                  <pre className="whitespace-pre-wrap break-words p-4 text-sm leading-relaxed">
                    {wikitext}
                  </pre>
                </ScrollArea>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Tip: Wikipedia editor accepts this directly. If you want to
                validate templates, you can paste into a sandbox here:{" "}
                <a href="https://en.wikipedia.org/w/index.php?title=Wikipedia:Sandbox&action=edit">
                  Sandbox
                </a>
                .
              </p>
            </TabsContent>

            <TabsContent value="json" className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Structured JSON</div>
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => copyToClipboard(jsonText)}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              </div>
              <div className="mt-2 rounded-2xl border bg-muted/30">
                <ScrollArea className="h-[420px]">
                  <pre className="whitespace-pre-wrap break-words p-4 text-sm leading-relaxed">
                    {jsonText}
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="fields" className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Infobox</div>
                <Badge variant="secondary" className="rounded-xl">
                  {structured?.infobox?.template || "(none)"}
                </Badge>
              </div>

              <div className="mt-3 rounded-2xl border">
                <div className="grid grid-cols-1 gap-0">
                  <div className="border-b p-3 text-xs text-muted-foreground">
                    These are the extracted key-value pairs. You can edit them
                    before saving in your backend.
                  </div>
                  <div className="p-3">
                    {structured?.infobox?.fields &&
                    Object.keys(structured.infobox.fields).length ? (
                      <div className="space-y-2">
                        {Object.entries(structured.infobox.fields).map(
                          ([k, v]) => (
                            <div
                              key={k}
                              className="flex flex-col gap-1 rounded-2xl border p-3"
                            >
                              <div className="text-xs text-muted-foreground">
                                {k}
                              </div>
                              <div className="text-sm font-medium leading-snug">
                                {String(v)}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No infobox fields returned.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default OutputCard;

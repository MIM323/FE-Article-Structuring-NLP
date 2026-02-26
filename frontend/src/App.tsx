import React, { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  FileText,
  Sparkles,
  Wand2,
  AlertTriangle,
  Braces,
  CheckCircle2,
} from "lucide-react";
import { ThemeProvider } from "./layout/ThemeProvider";

const safeJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
};

const postJson = async (url: any, payload: any, signal: any) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json();
};

const toInfoboxWikitext = (infobox: any) => {
  if (!infobox?.template) return "";
  const fields = infobox.fields || {};
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `| ${k} = ${String(v).trim()}`);
  return `{{${infobox.template}\n${lines.join("\n")}\n}}`;
};

const buildWikitextFromStructure = (structured: any) => {
  if (!structured) return "";
  const parts: string[] = [];

  if (structured.infobox) parts.push(toInfoboxWikitext(structured.infobox));
  if (structured.lead) parts.push(structured.lead.trim());

  const sections = Array.isArray(structured.sections)
    ? structured.sections
    : [];
  for (const s of sections) {
    const heading = s?.heading?.trim();
    const content = s?.content?.trim();
    if (heading) parts.push(`== ${heading} ==`);
    if (content) parts.push(content);
  }

  const refs = Array.isArray(structured.references)
    ? structured.references
    : [];
  if (refs.length) {
    parts.push("== References ==");
    parts.push("<references />");
  }

  const cats = Array.isArray(structured.categories)
    ? structured.categories
    : [];
  for (const c of cats) {
    const cat = String(c).trim();
    if (cat) parts.push(`[[Category:${cat}]]`);
  }

  return parts.filter(Boolean).join("\n\n").trim() + "\n";
};

const SAMPLE_INPUT = `Ada Lovelace (born 1815) was an English mathematician and writer, chiefly known for her work on Charles Babbage's proposed mechanical general-purpose computer, the Analytical Engine.\n\nShe was the first to recognise that the machine had applications beyond pure calculation, and published the first algorithm intended to be carried out by such a machine.\n\nLovelace was the only legitimate child of poet Lord Byron and was educated in mathematics and logic.`;

type StructuredArticle = {
  title?: string;
  lead?: string;
  infobox?: { template?: string; fields?: Record<string, string> };
  sections?: { heading?: string; content?: string }[];
  categories?: string[];
  references?: unknown[];
  wikitext?: string;
};

const MOCK_RESPONSE: StructuredArticle = {
  title: "Ada Lovelace",
  infobox: {
    template: "Infobox person",
    fields: {
      name: "Ada Lovelace",
      birth_date: "10 December 1815",
      birth_place: "London, England",
      death_date: "27 November 1852",
      occupation: "Mathematician, writer",
      known_for:
        "First computer programmer (algorithm for the Analytical Engine)",
    },
  },
  lead: "Ada Lovelace was an English mathematician ...",
  sections: [
    { heading: "Early life", content: "..." },
    { heading: "Work", content: "..." },
  ],
  categories: ["1815 births", "1852 deaths", "English mathematicians"],
  references: [],
};

const App = () => {
  const [title, setTitle] = useState("");
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [structured, setStructured] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [endpoint, setEndpoint] = useState("/api/structure");
  const [generateWikitext, setGenerateWikitext] = useState(true);
  const [template, setTemplate] = useState("Infobox person");
  const [useMock, setUseMock] = useState(true);

  const wikitext = useMemo(() => {
    if (!structured) return "";
    if (structured.wikitext) return structured.wikitext;
    return buildWikitextFromStructure(structured);
  }, [structured]);

  const jsonText = useMemo(
    () => (structured ? safeJson(structured) : ""),
    [structured],
  );

  const onStructure = async () => {
    setError("");
    setLoading(true);
    setStructured(null);

    const controller = new AbortController();
    try {
      if (useMock) {
        await new Promise((r) => setTimeout(r, 450));
        const mock: any = {
          ...MOCK_RESPONSE,
          title: title?.trim() || MOCK_RESPONSE.title,
          infobox: {
            ...MOCK_RESPONSE.infobox,
            template: template?.trim() || MOCK_RESPONSE.infobox?.template,
          },
        };
        if (generateWikitext) mock.wikitext = buildWikitextFromStructure(mock);
        setStructured(mock);
        return;
      }

      const payload = {
        title: title?.trim() || undefined,
        text: input,
        options: {
          generateWikitext,
          template,
        },
      };
      const data = await postJson(endpoint, payload, controller.signal);
      setStructured(data);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  const copyToClipboard = async (text: any) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center rounded-2xl border px-3 py-2 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Wikipedia Article Structurer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Paste raw article text → extract structure → generate infobox
                  + wikitext.
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

            {error ? (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Request failed</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* INPUT */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Input
                </CardTitle>
                <CardDescription>
                  Raw Wikipedia-style text (or scraped article text). Keep it
                  plain — no need for markup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Label htmlFor="title">Article title (optional)</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Ada Lovelace"
                      className="mt-1 rounded-2xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template">Infobox template</Label>
                    <Input
                      id="template"
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      placeholder="Infobox person"
                      className="mt-1 rounded-2xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="input">Text</Label>
                  <Textarea
                    id="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="mt-1 min-h-[320px] rounded-2xl"
                    placeholder="Paste raw article text here..."
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Characters:{" "}
                      <span className="font-medium text-foreground">
                        {input.length}
                      </span>
                    </span>
                    <span>
                      Approx words:{" "}
                      <span className="font-medium text-foreground">
                        {input.trim() ? input.trim().split(/\s+/).length : 0}
                      </span>
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="wikitext"
                        checked={generateWikitext}
                        onCheckedChange={setGenerateWikitext}
                      />
                      <Label htmlFor="wikitext">Generate wikitext</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="mock"
                        checked={useMock}
                        onCheckedChange={setUseMock}
                      />
                      <Label htmlFor="mock">Use mock (no backend)</Label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      className="rounded-2xl"
                      onClick={() => {
                        setTitle("");
                        setInput(SAMPLE_INPUT);
                        setStructured(null);
                        setError("");
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={onStructure}
                      className="rounded-2xl"
                      disabled={loading || !input.trim()}
                    >
                      {loading ? (
                        <span className="inline-flex items-center gap-2">
                          <Wand2 className="h-4 w-4 animate-pulse" />{" "}
                          Structuring…
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Wand2 className="h-4 w-4" /> Structure
                        </span>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <Label htmlFor="endpoint">Backend endpoint</Label>
                    <Input
                      id="endpoint"
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                      placeholder="/api/structure"
                      className="mt-1 rounded-2xl"
                      disabled={useMock}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      When you switch off mock mode, the app will POST to this
                      endpoint.
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Card className="w-full rounded-2xl border-dashed">
                      <CardContent className="pt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Suggested response supports both JSON + wikitext.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OUTPUT */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Braces className="h-5 w-5" /> Output
                </CardTitle>
                <CardDescription>
                  Structured result. Copy JSON into your pipeline or paste
                  wikitext into the Wikipedia editor.
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
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>No output yet</AlertTitle>
                    <AlertDescription>
                      Click <span className="font-medium">Structure</span> to
                      generate JSON and wikitext.
                    </AlertDescription>
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
                        <div className="text-sm font-medium">
                          Generated wikitext
                        </div>
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
                        Tip: Wikipedia editor accepts this directly. If you want
                        to validate templates, you can paste into a sandbox.
                      </p>
                    </TabsContent>

                    <TabsContent value="json" className="mt-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-medium">
                          Structured JSON
                        </div>
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
                            These are the extracted key-value pairs. You can
                            edit them before saving in your backend.
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
          </div>

          <div className="mt-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" /> Suggested API contract
                </CardTitle>
                <CardDescription>
                  Keep your backend simple: accept raw text, return structured
                  JSON + (optionally) wikitext.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="mb-2 text-sm font-medium">
                      POST {endpoint}
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                      {safeJson({
                        title: "Ada Lovelace",
                        text: "<raw text>",
                        options: {
                          generateWikitext: true,
                          template: "Infobox person",
                        },
                      })}
                    </pre>
                  </div>
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="mb-2 text-sm font-medium">200 OK</div>
                    <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                      {safeJson({
                        title: "Ada Lovelace",
                        infobox: {
                          template: "Infobox person",
                          fields: { name: "..." },
                        },
                        lead: "...",
                        sections: [{ heading: "Early life", content: "..." }],
                        categories: ["..."],
                        references: [],
                        wikitext: "...",
                      })}
                    </pre>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground">
                  Implementation notes:
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>
                      Start by returning only{" "}
                      <span className="font-medium text-foreground">
                        infobox.fields
                      </span>{" "}
                      +
                      <span className="font-medium text-foreground">
                        {" "}
                        sections
                      </span>
                      .
                    </li>
                    <li>
                      Add optional{" "}
                      <span className="font-medium text-foreground">
                        wikitext
                      </span>{" "}
                      generation in the backend later (or keep it
                      frontend-generated as shown).
                    </li>
                    <li>
                      If you plan to support many templates, return{" "}
                      <span className="font-medium text-foreground">
                        template
                      </span>
                      and a normalized field map; the UI can stay the same.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <footer className="mt-8 pb-4 text-center text-xs text-muted-foreground">
            Vilnius Tech
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;

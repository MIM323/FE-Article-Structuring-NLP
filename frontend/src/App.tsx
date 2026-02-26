// src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Sparkles, Wand2, AlertTriangle, Braces } from "lucide-react";

import { ThemeProvider } from "./layout/ThemeProvider";
import AppHeader from "./components/AppHeader";
import InputCard from "./components/InputCard";
import OutputCard from "./components/OutputCard";

const safeJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
};

const postJson = async (url: string, payload: any, signal: AbortSignal) => {
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

const App: React.FC = () => {
  const [title, setTitle] = useState("");
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [structured, setStructured] = useState<StructuredArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [endpoint, setEndpoint] = useState("/api/structure");
  const [generateWikitext, setGenerateWikitext] = useState(true);
  const [template, setTemplate] = useState("Infobox person");
  const [useMock, setUseMock] = useState(true);

  // Abort controller for "latest request wins"
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const wikitext = useMemo(() => {
    if (!structured) return "";
    if (structured.wikitext) return structured.wikitext;
    return buildWikitextFromStructure(structured);
  }, [structured]);

  const jsonText = useMemo(
    () => (structured ? safeJson(structured) : ""),
    [structured],
  );

  const onStructure = async (): Promise<void> => {
    setError("");
    setLoading(true);
    setStructured(null);

    // Abort any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (useMock) {
        await new Promise((r) => setTimeout(r, 450));
        const mock: StructuredArticle = {
          ...MOCK_RESPONSE,
          title: title?.trim() || MOCK_RESPONSE.title,
          infobox: {
            ...MOCK_RESPONSE.infobox,
            template: template?.trim() || MOCK_RESPONSE.infobox?.template,
          },
        };
        if (generateWikitext) {
          (mock as any).wikitext = buildWikitextFromStructure(mock);
        }
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

      const data = (await postJson(
        endpoint,
        payload,
        controller.signal,
      )) as StructuredArticle | null;

      setStructured(data);
    } catch (e: any) {
      // ignore abort errors
      if (e?.name !== "AbortError") {
        setError(e?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  const onReset = () => {
    setTitle("");
    setInput(SAMPLE_INPUT);
    setStructured(null);
    setError("");
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-2">
            <AppHeader />

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
            <InputCard
              title={title}
              setTitle={setTitle}
              input={input}
              setInput={setInput}
              endpoint={endpoint}
              setEndpoint={setEndpoint}
              generateWikitext={generateWikitext}
              setGenerateWikitext={setGenerateWikitext}
              template={template}
              setTemplate={setTemplate}
              useMock={useMock}
              setUseMock={setUseMock}
              onStructure={onStructure}
              onReset={onReset}
              loading={loading}
              disabledEndpoint={useMock}
            />

            {/* OUTPUT */}
            <OutputCard
              structured={structured}
              wikitext={wikitext}
              jsonText={jsonText}
              loading={loading}
              generateWikitext={generateWikitext}
              copyToClipboard={copyToClipboard}
            />
          </div>

          <div className="mt-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" /> Suggested API contract
                </CardTitle>
                <CardDescription>
                  Backend: accept raw text, return structured JSON + optionally
                  wikitext.
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

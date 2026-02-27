// src/components/InputCard.tsx
import React from "react";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CheckCircle2, Wand2 } from "lucide-react";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  input: string;
  setInput: (v: string) => void;

  template: string;
  setTemplate: (v: string) => void;

  generateWikitext: boolean;
  setGenerateWikitext: (v: boolean) => void;

  useMock: boolean;
  setUseMock: (v: boolean) => void;

  endpoint: string;
  setEndpoint: (v: string) => void;

  onStructure: () => Promise<void>;
  onReset: () => void;

  loading: boolean;
  disabledEndpoint: boolean;
};

const InputCard: React.FC<Props> = ({
  title,
  setTitle,
  input,
  setInput,
  template,
  setTemplate,
  generateWikitext,
  setGenerateWikitext,
  useMock,
  setUseMock,
  endpoint,
  setEndpoint,
  onStructure,
  onReset,
  loading,
  disabledEndpoint,
}) => {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Input</CardTitle>
        <CardDescription>
          Raw Wikipedia-style text (or scraped article text). Keep it plain — no
          need for markup.
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
              onClick={onReset}
            >
              Reset
            </Button>

            <Button
              onClick={() => void onStructure()}
              className="rounded-2xl"
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Wand2 className="h-4 w-4 animate-pulse" /> Structuring…
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
              placeholder="http://127.0.0.1:8000/api/structure"
              className="mt-1 rounded-2xl"
              disabled={disabledEndpoint}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              When you switch off mock mode, the app will POST to this endpoint.
            </p>
          </div>

          <div className="flex items-end">
            <Card className="w-full rounded-2xl border-dashed">
              <CardContent className="pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Suggested response
                  supports both JSON + wikitext.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputCard;

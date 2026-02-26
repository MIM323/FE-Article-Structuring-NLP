export type StructuredArticle = {
  title?: string;
  lead?: string;
  infobox?: { template?: string; fields?: Record<string, string> };
  sections?: { heading?: string; content?: string }[];
  categories?: string[];
  references?: unknown[];
  wikitext?: string;
};

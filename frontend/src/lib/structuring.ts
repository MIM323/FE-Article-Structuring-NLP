import type { StructuredArticle } from "@/types";

export const safeJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
};

export const toInfoboxWikitext = (infobox: any) => {
  if (!infobox?.template) return "";
  const fields = infobox.fields || {};
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
    .map(([k, v]) => `| ${k} = ${String(v).trim()}`);
  return `{{${infobox.template}\n${lines.join("\n")}\n}}`;
};

export const buildWikitextFromStructure = (structured: any) => {
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

export const SAMPLE_INPUT = `Ada Lovelace (born 1815) was an English mathematician and writer, chiefly known for her work on Charles Babbage's proposed mechanical general-purpose computer, the Analytical Engine.\n\nShe was the first to recognise that the machine had applications beyond pure calculation, and published the first algorithm intended to be carried out by such a machine.\n\nLovelace was the only legitimate child of poet Lord Byron and was educated in mathematics and logic.`;

export const MOCK_RESPONSE: StructuredArticle = {
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

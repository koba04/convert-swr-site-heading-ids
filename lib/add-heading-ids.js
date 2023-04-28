const { slug } = await import("github-slugger");

export const addHeadingIds = (mdx, headings) => {
  const lines = mdx.toString().split("\n");

  // ignore the title section
  const [_, ...targetHeadings] = headings;
  for (const head of targetHeadings) {
      const { level, line, text, idText } = head;
      if (/\[#.*\]$/.test(text)) {
        continue;
      }
      lines[line - 1] = "#".repeat(level) + " " + text + " " + `[#${slug(idText)}]`;
  }
  return lines.join("\n");
}


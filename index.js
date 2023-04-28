import fs from "node:fs/promises";
import { parseMDX } from "./lib/parse-mdx.js"
import { addHeadingIds } from "./lib/add-heading-ids.js";
import { globby } from "globby";

const translatedLangs = [
  'es-ES',
  'ja',
  'ko',
  'pt-BR',
  'ru',
  'zh-CN',
];

// node index.js vercel/swr-site
const swrSitePath = process.argv[2];

const originals = await globby(swrSitePath + "/pages/**/*\.en-US.mdx");
for (const original of originals) {
  const match = original.match(/(\/pages\/.*)\.(.*)\.mdx/);
  if (match === null) {
    console.log("Something went wrong: ", original);
    process.exit(1);
  }
  console.log(original);

  // process the original(en) file
  const mdx = await fs.readFile(original);
  const headings = await parseMDX(mdx);
  const modifiedMDX = addHeadingIds(mdx, headings);
  await fs.writeFile(original, modifiedMDX);

  // process other languages
  const [_, basePath] = match;
  for (const lang of translatedLangs) {
    const translation = `${swrSitePath}${basePath}.${lang}.mdx`;
    console.log(translation);

    const mdx = await fs.readFile(translation);
    const translatedHeadings = await parseMDX(mdx);

    // we can't reply on the line property because headins might be placed in different lines in translations.
    // so we rely on the structure of headings, which means they should have the same number of headings.
    if (headings.length !== translatedHeadings.length) {
      console.log("Something went wrong: ", translation);
      console.log({ translatedHeadings, headings });
      process.exit(1);
    }

    const modifiedTranslatedHeading = translatedHeadings.map((v, i) => ({
      ...v,
      // use original ids
      idText: headings[i].idText
    }));

    const modifiedMDX = addHeadingIds(mdx, modifiedTranslatedHeading);
    await fs.writeFile(translation, modifiedMDX);
  }
}

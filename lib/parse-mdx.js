import {unified} from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import {visit} from 'unist-util-visit'

const getFlattenedValue = (node) =>
  node.children
  .map(child =>
    'children' in child
      ? getFlattenedValue(child)
      : 'value' in child
      ? child.value
      : ''
  )
  .join('')

const getMarkdownText = (node) =>
  node.children.map(child => {
    if ('children' in child) {
      return getMarkdownText(child);
    }
    if ('value' in child) {
      if (child.type === "inlineCode") {
        return '`' + child.value + '`';
      }
      return child.value;
    }
    return '';
  }).join('')


export const parseMDX = async (mdx) => {
  const headings =  [];
  const plugin = () => (tree) => {
    visit(tree, (node) => {
        if (node.type === "heading") {
            const idText = getFlattenedValue(node);
            const markdownText = getMarkdownText(node);
            headings.push({
                level: node.depth,
                text: markdownText,
                idText: idText,
                line: node.position.start.line,
            });
        }
    })
  }

  await unified()
    .use(remarkParse)
    .use(remarkStringify)
    .use(plugin)
    .process(mdx);
  return headings;
}

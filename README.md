# Convert SWR Site heading ids

This adds ids to all headings in the SWR site, which solves https://github.com/vercel/swr-site/issues/341.
This uses the same algorithm with Nextra, so existing links with a hash fragment still works.

```
pnpm install
node index.js path/to/swr-site
```

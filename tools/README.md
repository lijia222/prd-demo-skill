# Release helper

`tools/release.js` will be added before the first public release. It must run the local checks, sensitive-information scan, npm pack preview, version update, and explicit confirmation before any GitHub push, tag, or npm publish.

No release command in this repository silently publishes or uses a long-lived credential.

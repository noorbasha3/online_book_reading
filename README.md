# Open Shelf — Free Digital Library

A static website built with HTML, CSS, and JavaScript. It has no payment or checkout features.

## Run locally
Open `index.html` in a modern browser. For best results, serve the folder using VS Code Live Server or `python -m http.server`.

## Publish free with GitHub Pages
1. Create/sign in to a GitHub account.
2. Create a public repository (for example `open-shelf`).
3. Upload `index.html`, `style.css`, and `script.js` to the repository root.
4. Open **Settings → Pages**.
5. Under Build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
6. Wait for GitHub to publish the site and open the Pages URL shown there.

## Important notes
- The sample catalogue links to Project Gutenberg pages for classic works. Copyright status can vary by country; check each source's terms before sharing.
- Uploaded files are stored locally in IndexedDB in the visitor's browser, not uploaded to a central server and not visible to other visitors. Clearing browser site data can remove these local files.
- TXT files open in the page reader. PDFs use the browser's built-in PDF viewer. EPUB files can be saved and downloaded here; in-browser EPUB rendering requires an EPUB library such as epub.js.
- Free static hosting does not provide shared user accounts or central file storage. To let the site owner publish books for all visitors, a backend or repository-based book catalogue is needed.

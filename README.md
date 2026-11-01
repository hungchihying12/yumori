
# Yumori ୨୧

A Japanese stationery-inspired personal styling diary prototype.

## Run locally

Open `index.html` in a browser, or use the VS Code Live Server extension.

## Publish with GitHub Pages

1. Create a GitHub repository named `yumori`.
2. Upload `index.html`, `style.css`, and `script.js` to the repository root.
3. Open Settings → Pages.
4. Choose Deploy from a branch, select `main` and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish the site.

## Included in this prototype

- Responsive home page and navigation
- Illustrated SVG donkey mascot with gentle idle movement
- Kaomojis and decorative symbols in interface copy; no kaomoji used as the donkey's face
- Colour preference diary
- Non-measurement-based personal style notes
- Wardrobe photo uploads, categories, and deletion
- Outfit-planner demo that references saved wardrobe items
- To Bring checklist
- Local profile settings

## Important limitations

This is a front-end prototype, not a production full-stack application.

- Data is stored in the current browser using `localStorage`; it is not a secure account, cloud database, or multi-user system.
- The outfit planner is a scripted local demo, not a real AI integration.
- There is no weather API integration.
- Do not store sensitive personal information in this prototype.
- Browser storage is limited. Keep uploaded images small; data may be cleared if browser data is removed.
- Google Fonts requires an internet connection; fallback fonts are provided.

For a production release, add a backend with secure authentication, database and private image storage. Put AI and weather API calls behind server-side endpoints, never in browser JavaScript. Add consent, access controls, deletion workflows, and test them before collecting personal data.

## Design note

Yumori uses kaomojis and decorative Japanese symbols in interface text. The donkey has an illustrated face and body language, not a kaomoji face.

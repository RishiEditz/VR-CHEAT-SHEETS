# VR Cheat Sheets

Interactive cheat sheets you can scroll through, copy commands from and test yourself on. Each sheet is a plain HTML page that works on phones, tablets, laptops and big screens.

## Sheets

| Sheet | Live page |
| --- | --- |
| Git | https://rishieditz.github.io/VR-CHEAT-SHEETS/git/ |

Each sheet has:

- five pages that scroll one after another, no tabs
- tap or click a command to copy it
- a 15-question quiz in random order, with a score out of 15 and a share-result button
- light and dark mode
- five printable PNG pages to download

## Run it locally

No build step. Open `index.html` in a browser, or serve the folder with any static server, for example `python3 -m http.server`.

## Structure

```
index.html      landing page
git/            the Git cheat sheet (index.html, style.css, script.js, page1-5.png)
```

New sheets go in their own folder, for example `sql/`, and get a card on the landing page.

By Rakshith Volam / VR Developments.

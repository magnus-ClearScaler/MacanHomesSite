# Macan Homes

A boutique residential atelier — luxury redesign.

## Structure

```
index.html              # Single-page site
assets/css/styles.css   # All styles
assets/js/main.js       # Interactions and motion
assets/images/          # Drop client-supplied photography here
```

## Image swap

All imagery is currently royalty-free Unsplash placeholders, referenced inline as `background-image: url(...)` in `index.html`. To replace with the real Macan Homes brand assets:

1. Add files under `assets/images/` (e.g. `hero.jpg`, `residence-01.jpg`).
2. Find each `background-image: url('https://images.unsplash.com/...')` in `index.html` and swap to the local path.

## Run locally

It's a static site. Open `index.html` directly in a browser, or serve the folder:

```
python3 -m http.server 8000
```

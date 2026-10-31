# AnimeNeek

## Run and build
1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Run the app with `npm start`.
4. Build installers with `npm run dist`.

## Where to update episode streaming sources
AnimeNeek reads the existing source index from GitHub. The URL is configured in:

`src/renderer/config.js` → `STREAM_INDEX_URL`

Current value:
`https://raw.githubusercontent.com/animeneek/Neek/main/anime/hianime.json`

To change the GitHub repository or file later, change only that URL. Use GitHub's **Raw** file URL, not the `/blob/` page URL.

### Keep the JSON structure unchanged
The app expects this structure:

```json
{
  "63159": {
    "1": {
      "Sub - Cen": "https://streamtape.to/e/example"
    },
    "2": {
      "Sub - Cen": "https://streamtape.to/e/example2",
      "Sub - Uncen": "https://streamtape.to/e/example3",
      "Dub": "https://streamtape.to/e/example4"
    }
  }
}
```

- Top-level key: MyAnimeList (MAL) anime ID.
- Second-level key: episode number (numeric keys such as `1`, or season-style keys such as `S01`).
- Each property under an episode: the exact source label shown in the player.
- The property value: the embed URL.
- Add or remove source properties in GitHub; the player buttons update automatically. The app refreshes this JSON every five minutes, so you do not need to rebuild the app for link changes.
- If an episode has no entry, AnimeNeek shows no source for that episode. MAL IDs are matched directly; `TMDB12345` top-level keys are also supported when AniList exposes a matching TMDB external link.

For Streamtape domains (`streamtape.com`, `streamtape.to`, `streamtape.net`), AnimeNeek adds the active profile theme's RGB accent as the `color` query parameter. Other hosts are left unchanged.

## Profiles and anime themes
- Open **Manage profiles** on the profile picker.
- Select a profile or use the pencil icon to edit its name and character picture.
- Use the X icon to delete a profile.
- Use **Remove picture** in the editor to clear the character image.
- Character search and anime character artwork are provided by AniList. Curated anime themes are in `src/renderer/app.js` in the `THEMES` array.
- To change theme colours, typography, or animation presets, edit the matching theme entry and the `FONTS` / `FX` maps in `src/renderer/app.js`.

## Main files
- `src/renderer/config.js` — GitHub JSON URL and landing-screen image.
- `src/renderer/provider.js` — reads episode sources and adds Streamtape player colour.
- `src/renderer/app.js` — profile editor, character picker, anime themes, player UI.
- `src/renderer/style.css` — visual styling.
- `src/main.js` and `src/preload.js` — secure Electron bridge for AniList, Jikan, and the GitHub JSON fetch.

The app keeps profile data, favourites, watch history, and watched-episode marks in local storage. These changes do not intentionally clear existing local data.

# Nuraan — Chapter 21

Everything is built and wired up. The site works right now, in placeholder
state — every voice note shows a "not added yet" note, and every photo shows
a dashed placeholder frame. Nothing to fix, just drop your real files in.

## 1. Add the voice notes

Put your 10 audio files in `audio/`, named exactly:

```
audio/voice-01.mp3
audio/voice-02.mp3
...
audio/voice-10.mp3
```

The moment a file with the right name exists, that chapter's player lights
up automatically — no code changes needed. MP3 is safest for browser
compatibility; if you record in another format, convert to `.mp3` first.

## 2. Add the photos

Put your photos in `images/`, named exactly:

```
images/photo-01.jpg
images/photo-02.jpg
...
images/photo-10.jpg
```

One interlude now plays after every chapter, in order — same as audio, drop
the file in with the right name and it fades in over the placeholder
automatically. `.jpg` is expected by default; if yours are `.png`, open
`js/script.js`, find the line with `".jpg"` inside the photo placeholder
section, and change it to `.png`.

To edit the year/caption under each photo, open `js/script.js` and look for
`PHOTOS_META` near the top — one line per photo, in order.

## 3. Write your personal letter

Open `index.html`, search for `letterMessage`, and replace the bracketed
placeholder line with your real message to Nuraan.

## 4. Double-check the wording

The 10 chapter titles and lines live in `js/script.js` under `CHAPTERS` near
the very top of the file — change any wording there if you want it more
specific to your own story with her.

## 5. Hosting

No backend, no build step — it's a static site. Easiest options:
- Zip the whole `nuraan-birthday` folder and open `index.html` directly, or
- Drop the folder into Netlify Drop, GitHub Pages, or Vercel for a private
  link you can text her.

If you host it, keep it unlisted/private — there's no password protection
built in.

## How it behaves

- She has to tap BEGIN before anything plays — first interaction is
  intentional, nothing autoplays.
- Only one voice note plays at a time.
- A chapter unlocks the next one automatically once its audio finishes.
- Progress is saved in the browser (localStorage), so if she closes the tab
  and comes back, she picks up where she left off. Already-unlocked chapters
  stay reachable via the dots at the top.
- The final chapter leads into the closing sequence → the letter → the
  "Chapter 21 Complete" screen, which has a quiet gold particle drift and a
  "Play Again" option.

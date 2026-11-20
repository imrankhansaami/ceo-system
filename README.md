# CEO System

A minimal, local-first system for the goals that matter — and how far along each one is.

No build step, no dependencies, no accounts, no server. One page, your browser, your data.

The page opens with the isti'adhah and the basmalah, and closes with alhamdulillah:

> أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
> *Auzubillah Minashaitan Nirajeem — "I seek refuge in Allah from the outcast Shaitan (Satan)."*
>
> بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
> *Bismillahir Rahmanir Rahim — "In the name of Allah, the Most Gracious, the Most Merciful."*
>
> الْحَمْدُ لِلَّهِ
> *Alhamdulillah — all praise is due to Allah.*

## Use it

Open `index.html` in a browser. That's it.

- **Add a goal** — type it, optionally give it a target date, press Enter.
- **Track progress** — drag the slider under a goal. Hitting 100% marks it done.
- **Rename** — click a goal's title, edit, press Enter (Escape cancels).
- **Done** — the circle on the left. Click again to reopen it.
- **Filter** — All, Active, Done.
- **Export / Import** — plain JSON, so your goals outlive the browser.
- **`/`** — jump to the new-goal field.

## How it's built

| File | |
| --- | --- |
| `index.html` | Structure, opening and closing |
| `styles.css` | Styling — emerald and gold, light and dark, khatim star lattice |
| `app.js` | State, storage, rendering — plain JavaScript, no framework |

The Arabic is set in [Amiri](https://fonts.google.com/specimen/Amiri), loaded from Google Fonts. Offline it falls back to the system Arabic fonts, and everything keeps working.

Goals live in `localStorage` under the key `ceo-system:goals:v1`. Nothing leaves the machine. Clearing your browser data clears the goals, so export once in a while if they matter.

## Live

https://imrankhansaami.github.io/ceo-system/

## License

MIT

# CEO System

A minimal, local-first system for the goals that matter — and how far along each one is.

No build step, no dependencies, no accounts, no server. One page, your browser, your data.

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
| `index.html` | Structure |
| `styles.css` | Styling, light and dark |
| `app.js` | State, storage, rendering — plain JavaScript, no framework |

Goals live in `localStorage` under the key `ceo-system:goals:v1`. Nothing leaves the machine. Clearing your browser data clears the goals, so export once in a while if they matter.

## Live

https://imrankhansaami.github.io/ceo-system/

## License

MIT

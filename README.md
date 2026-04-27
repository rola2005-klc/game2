# Game2 — 星糖消消乐

A lightweight, mobile-friendly Match-3 browser game built with vanilla HTML, CSS, and JavaScript. The game is playable as a static site and includes logic tests for the board engine.

Live demo: https://rola2005-klc.github.io/game2/

## What it demonstrates

- Interactive browser game logic without a framework
- Match detection, valid-swap checking, board collapse/refill, scoring, and move limits
- Mobile-first UI with touch-friendly layout, haptic feedback hooks, and reduced-motion support
- Lightweight automated tests for core game logic and mobile UI expectations

## Features

- 8x8 Match-3 board
- Adjacent swapping and invalid-move rejection
- Automatic clearing of 3+ matches
- Falling/refill cascade behavior
- 30-move limit and local best score
- Static deployment through GitHub Pages

## Run locally

```bash
python3 -m http.server 8765
# open http://127.0.0.1:8765
```

## Tests

```bash
node test.js
node mobile-ui.test.js
```

## Files

- `index.html` — static page shell
- `style.css` — responsive/cute mobile UI
- `game.js` — pure board/game logic functions
- `app.js` — DOM rendering and player interaction
- `test.js` — board engine tests
- `mobile-ui.test.js` — mobile UX/static checks

## Next improvements

- Add special candies for 4/5 matches
- Add sound effects with a mute toggle
- Add difficulty levels or timed mode
- Add screenshot/GIF preview to this README

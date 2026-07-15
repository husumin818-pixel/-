# Earth Hero Export

This export contains the current editable page code and assets.

## Run

Use Node.js:

```bash
npm start
```

Then open:

```text
http://localhost:4173
```

## Structure

- `index.html`: page entry
- `src/styles.css`: layout, scaling, masks, fixed positions
- `src/App.js`: page composition
- `src/components/Globe.js`: Three.js camera and globe setup
- `src/globe/`: globe geometry, shaders, interaction, geo data
- `images/`: exported bitmap assets
- `config/layout.json`: key layout values for future device adjustments

## Device Adjustment

The page uses a 2436px-wide design canvas and scales by viewport width:

```css
--stage-scale: window.innerWidth / 2436
```

Common values to adjust:

- Globe position and size: `.globe-stage` in `src/styles.css`
- Bottom content image position: `.content-panel` top in `src/styles.css`
- Hero overlay image: `images/baike-overlay.png`
- Long content image: `images/baike-content.png`
- Default globe view: camera/globe values in `src/components/Globe.js`

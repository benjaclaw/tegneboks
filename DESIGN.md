# Tegneboks — Design System

Tegneapp for barn 3–8 år. Alt er visuelt — ingen tekst i UI.
Inspirert av Crayola Create & Play, Kids Doodle og Toca Boca.

---

## 1. Fargepalett

Glade, pastell-aktige farger med høy kontrast for barnehender.

```
Primary:     #FF6B8A — varm rosa, hovedfarge på CTA og viktige elementer
Secondary:   #6BC5FF — klar himmelblå, sekundær aksent
Accent:      #FFD93D — solskinngul, highlight og aktive states
Background:  #FFF8F0 — varm kremhvit, app-bakgrunn
Surface:     #FFFFFF — kort, modaler, elevated surfaces
Canvas:      #FFFFFF — tegneflate-bakgrunn

Toolbar:     #FFF0E6 — varm lys peach, verktøylinje-bakgrunn
Border:      #FFE0CC — myk peach border
Shadow:      rgba(255, 107, 138, 0.15) — rosa skygge

Danger:      #FF6B6B — rød for destruktive handlinger (slett)
Success:     #51CF66 — grønn for bekreftelser
```

### Tegnefarger (12 stk)
Brukes i fargevelgeren — store sirkler barn kan trykke på.

```
Rød:         #FF4444
Oransje:     #FF8C42
Gul:         #FFD93D
Lime:        #A8E06C
Grønn:       #51CF66
Turkis:      #38D9A9
Blå:         #4DABF7
Indigo:      #5C7CFA
Lilla:       #9775FA
Rosa:        #F06595
Brun:        #8B5E3C
Svart:       #2C2C2C
```

---

## 2. Typografi

Brukes kun internt (tomme states, alerts). UI har INGEN synlig tekst.

```
Font:     Nunito — rund, leken, barnevennlig

h1:       32px / 800 (ExtraBold) / line-height 1.2
h2:       24px / 700 (Bold) / line-height 1.3
body:     18px / 600 (SemiBold) / line-height 1.5
caption:  14px / 600 (SemiBold) / line-height 1.4
```

Font lastes via expo-font / Google Fonts.

---

## 3. Spacing og Layout

```
Base unit:   4px
Spacing:     4, 8, 12, 16, 20, 24, 32, 48

Border radius:
  sm:    12px  — små elementer, ikoner
  md:    20px  — knapper, kort
  lg:    28px  — store kort, modaler
  full:  9999px — sirkler (fargevelger, runde knapper)

Touch targets:
  Minimum:   60x60px — ALLE interaktive elementer
  Anbefalt:  64x64px — hovedknapper
  Fargevelger: 48x48px (sirkel)
```

---

## 4. Komponenter

### IconButton
Rund knapp med kun ikon, brukes i toolbar.
```
Størrelse:    60x60px (md) / 72x72px (lg)
Radius:       full (sirkel)
Bakgrunn:     Surface (#FFFFFF)
Border:       2px solid Border (#FFE0CC)
Ikon:         28px, farge Text (#2C2C2C)
Shadow:       0 2px 8px Shadow

States:
  Default:    hvit bg, myk skygge
  Pressed:    scale(0.92), bg Toolbar (#FFF0E6)
  Selected:   bg Primary (#FF6B8A), ikon hvit
  Disabled:   opacity 0.4
```

### ColorCircle
Fargevelger-sirkel i toolbar.
```
Størrelse:    48x48px
Radius:       full (sirkel)
Border:       3px solid hvit

States:
  Default:    fyllt med fargen, hvit border
  Selected:   scale(1.2), 3px solid #2C2C2C, shadow
  Pressed:    scale(0.9)
```

### DrawingCard
Thumbnail-kort for lagrede tegninger i galleri.
```
Størrelse:    full width (2-kolonne grid), aspect-ratio 1:1
Radius:       md (20px)
Border:       2px solid Border (#FFE0CC)
Shadow:       0 4px 12px Shadow
Bakgrunn:     Surface

States:
  Default:    viser thumbnail
  Pressed:    scale(0.97)
  Long-press: shake-animasjon → slett-dialog
```

### NewDrawingButton
Stor knapp for å starte ny tegning.
```
Størrelse:    full width, 80px høy
Radius:       md (20px)
Bakgrunn:     gradient Primary → Secondary (#FF6B8A → #6BC5FF)
Ikon:         Plus-ikon, 36px, hvit
Shadow:       0 4px 16px rgba(255, 107, 138, 0.3)

States:
  Pressed:    scale(0.97), shadow reduseres
```

---

## 5. Animasjoner og Overganger

```
Page transitions:
  Type:       slide-from-right
  Duration:   300ms
  Easing:     ease-out (cubic-bezier(0, 0, 0.2, 1))

Micro-interactions:
  Button press:     scale(0.92), 100ms, spring
  Color select:     scale(1.2), 200ms, spring bounce
  Card press:       scale(0.97), 100ms
  Card long-press:  shake (rotate ±2°, 3 cycles, 80ms each)
  Tool select:      scale + bg color, 150ms

Loading states:
  Galleri:    shimmer-effekt på DrawingCard placeholders
  Lagring:    pulserende sirkel (Primary farge)

Haptic feedback:
  Light:      fargevelger, verktøybytte
  Medium:     lagre, ny tegning, angre
  Heavy:      slett tegning (etter bekreftelse)
```

---

## 6. Ikoner

**Bibliotek: Lucide React Native**
Runde, tydelige ikoner som barn lett gjenkjenner.

```
Stroke width:  2.5px (tykkere enn standard for synlighet)
Størrelse:     28px (standard), 36px (stor/CTA)

Ikoner i bruk:
  Ny tegning:     Plus
  Lagre:          Download / Save
  Angre:          Undo2
  Viskelær:       Eraser
  Blyant:         Pencil
  Slett:          Trash2
  Tilbake:        ArrowLeft
  Tykkelse:       Circle (fylt, ulik størrelse)
```

---

## 7. Inspirasjon

```
1. Crayola Create & Play
   Hva vi låner: Stor, tydelig fargevelger, runde knapper,
   barnevennlig layout med mye mellomrom

2. Kids Doodle
   Hva vi låner: Fullskjerm tegneflate, enkel toolbar nederst,
   fokus på selve tegningen

3. Toca Boca-serien
   Hva vi låner: Lekent fargevalg, ingen tekst i UI,
   store touch targets, glade farger
```

---

## 8. UI-bibliotek

```
NativeWind (Tailwind)  — all styling
Skia                   — tegneflate (canvas)
Lucide                 — ikoner
Reanimated             — animasjoner
Gesture Handler        — touch/gestures
expo-haptics           — haptisk feedback
```

Ingen ekstra komponent-bibliotek — alt bygges custom for full kontroll
over det barnevennlige uttrykket.

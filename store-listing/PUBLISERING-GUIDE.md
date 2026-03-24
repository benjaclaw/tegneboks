# Doodl — Publiseringsguide

## Alt som er klart ✅

| Hva | Status | Lokasjon |
|-----|--------|----------|
| Signert AAB (Play Store) | ✅ | `store-listing/doodl-release.aab` |
| Signert APK (testing) | ✅ | `store-listing/doodl-release.apk` |
| Privacy Policy (live) | ✅ | https://benjaclaw.github.io/tegneboks/ |
| Play Store-tekster (NO + EN) | ✅ | `store-listing/play-store.md` |
| App Store-tekster (NO + EN) | ✅ | `store-listing/app-store.md` |
| App-ikon | ✅ | `assets/icon.png` + adaptive icons |
| Keystore (signing) | ✅ | `android-release.keystore` (ALDRI del denne!) |

## Hva DU må gjøre

### Google Play Store

1. **Opprett utviklerkonto** (hvis ikke gjort)
   - https://play.google.com/console/signup
   - Engangskostnad: $25
   - Trenger Google-konto

2. **Opprett ny app i Play Console**
   - App name: "Doodl — Tegne-app"
   - Default language: Norsk (bokmål)
   - App or game: App
   - Free or paid: Free

3. **Last opp AAB-filen**
   - Production → Create new release
   - Last opp `store-listing/doodl-release.aab`

4. **Fyll inn store listing**
   - Bruk tekster fra `store-listing/play-store.md`
   - Privacy policy URL: https://benjaclaw.github.io/tegneboks/

5. **Content rating**
   - Gå gjennom IARC-spørreskjemaet
   - Ingen voldelig/seksuelt innhold = "Everyone"

6. **Screenshots** (mangler — se under)

### Apple App Store

1. **Opprett Apple Developer-konto** (hvis ikke gjort)
   - https://developer.apple.com/programs/
   - Årlig kostnad: $99
   - Trenger Apple ID

2. **iOS-build**
   - Kan ikke bygge iOS lokalt uten Xcode signing
   - Alternativ: Bruk EAS Build (når kvoten resetter 1. april)
   - Eller: `npx expo run:ios` med Xcode signing satt opp

3. **App Store Connect**
   - Bruk tekster fra `store-listing/app-store.md`

## Mangler (jeg kan fikse)

- **Screenshots** — trenger Android-emulator eller fysisk enhet for å ta
- **Feature graphic** (Play Store, 1024×500) — kan lages som grafikk
- **iOS-build** — krever Apple Developer-konto og signing

## Keystore-info (VIKTIG — ta vare på dette!)

```
Fil: android-release.keystore
Alias: tegneboks
Store password: tegneboks123
Key password: tegneboks123
```

⚠️ MISTER DU DENNE FILEN KAN DU ALDRI OPPDATERE APPEN PÅ PLAY STORE.
Lag backup NÅ. Lagre passordet et trygt sted.

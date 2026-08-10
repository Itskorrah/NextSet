# NextSet source assets and licences

Status: foundation inventory; not legal advice or production clearance  
Date reviewed: 2026-08-06  
Project licence status: no repository-wide open-source licence has been selected

## Policy

Every font, icon, image, device frame, illustration, animation, sound and exercise instruction used in production needs a recorded source, creator/rightsholder, exact version or generation provenance, licence, required notice, modification status and approved use. A file being present in a disposable prototype does not clear it for production, marketing, app-store screenshots or redistribution.

No competitor logo, screenshot, proprietary layout, illustration or distinctive asset may be copied. The directions extract interaction and hierarchy principles only.

## Generated visual references

| Asset | Provenance | Current permitted purpose | Clearance status |
|---|---|---|---|
| [`../../prototypes/visual-references/tempo-ledger-active-workout.png`](../../prototypes/visual-references/tempo-ledger-active-workout.png) | Generated for the NextSet foundation visual exploration; 852×1846 PNG | Internal direction review and documentation | **Prototype-only.** Generation prompt/ID and any publication clearance are not stored in this repository; retain them before external marketing use |
| [`../../prototypes/visual-references/field-kit-active-workout.png`](../../prototypes/visual-references/field-kit-active-workout.png) | Generated for the NextSet foundation visual exploration; 853×1844 PNG | Internal direction review and documentation | **Prototype-only.** Same limitation |
| [`../../prototypes/visual-references/open-pace-active-workout.png`](../../prototypes/visual-references/open-pace-active-workout.png) | Generated for the NextSet foundation visual exploration, then safety-edited with OpenAI image-generation result `exec-0dfd6b1f-183e-4007-a4aa-6f3a63a3ca20` to remove an unreviewed technique cue; directly inspected 2026-08-06; 853×1844 PNG; SHA-256 `a68691fc88c439da8d594f64392cdbcabe5e724258f2ff645e5e6c4f3cd49eb2` | Internal direction review and documentation | **Prototype-only.** Same limitation |

The three `*-active-workout-390x844.png` files are deterministic 390×844 normalization derivatives of those originals, created locally with `sips`; they inherit the originals' prototype-only status. The current Open Pace derivative has SHA-256 `cb9781c07205b257a2629401edecedd5f62ceb4f10266be4975eab86e03203d3`.

| Ten-screen board | Generation record | SHA-256 | Current status |
|---|---|---|---|
| [`tempo-ledger-ten-screen-board.png`](../../prototypes/visual-references/tempo-ledger-ten-screen-board.png) | Original OpenAI image-generation result `exec-13fdc7c8-8ff8-409e-b171-4d581c23fc7b`; safety edit `exec-ba602d2b-3ccd-4b32-b2b8-f3c0c5a9e77f` explicitly relabelled the Today focus copy as a user-authored session note; directly inspected 2026-08-06; 1506×1045 PNG | `8c94a367151b503dd01d6e84f964bf59b075be0d67c375554bc97933cf061499` | Foundation direction review; generated reference, never an implementation screenshot |
| [`field-kit-ten-screen-board.png`](../../prototypes/visual-references/field-kit-ten-screen-board.png) | OpenAI image-generation result `exec-84d72221-50a5-4ab0-9c64-b601f1082161`; generated and directly inspected 2026-08-06 | `6b166a0151d0e1745f2c8d946213dc3eb02e43c44a23e26982de78922cf1b578` | Foundation direction review; generated reference, never an implementation screenshot |
| [`open-pace-ten-screen-board.png`](../../prototypes/visual-references/open-pace-ten-screen-board.png) | Prior OpenAI image-generation edit `exec-df1802a8-e10a-4e6d-a685-d5d2e9a75257`; safety edit `exec-7c70f6d1-56f4-451a-a5e0-92dd7f9108b7` removed the same unreviewed technique cue from screen 4; directly inspected 2026-08-06; 1536×1024 PNG | `73eedd2ead289995a633401795c9435aa6fbf4ee32f66778531ab8a1f40f4731` | Foundation direction review; generated reference, never an implementation screenshot |

These outputs were generated for this user-requested foundation package with no third-party reference image supplied beyond earlier NextSet-generated direction art. That records provenance, not trademark, marketing or production clearance. The task owner should retain the generation records and obtain any review appropriate to later public marketing use.

Direct inspection found the provisional NextSet wordmark and generic workout/exercise imagery, not a deliberate competitor logo. That observation is not trademark, copyright or trade-dress clearance. “NextSet” itself remains provisional under [`../research/name-collision-scan.md`](../research/name-collision-scan.md).

## Protected prototype runtime assets

The following files are protected by [`../../prototypes/nextset-directions/AGENTS.md`](../../prototypes/nextset-directions/AGENTS.md) and belong to the disposable mobile preview runtime:

- `public/assets/iphone/Bezel.png`
- `public/assets/iphone/Keyboard.png`
- `public/assets/android/Pixel10.png`
- `public/assets/android/Keyboard.png`
- `public/assets/android/navigation-bar.svg`
- `public/assets/status/status-icons.svg`
- `public/assets/status/ios-status-icons.svg`

Provenance: all seven were copied unchanged by the official Product Design `mobile-app` bootstrap from the installed OpenAI Product Design plugin version `0.1.52`. The plugin manifest identifies the package as OpenAI-authored and proprietary; it provides no separate redistribution licence for these files. Their SHA-256 hashes are captured in the milestone validation evidence.

Accordingly, the seven files are **local template/runtime-only and excluded from Git publication** by both repository and prototype `.gitignore` rules. They remain in this managed workspace only so the protected runtime can be integrity-checked. A clone must re-bootstrap the licensed Product Design mobile template or supply independently cleared replacements before rendered prototype QA. Do not copy these assets into production, marketing or store output. The Apple Design Resources terms or Android brand guidance must not be guessed from visual resemblance.

System font fallbacks such as Avenir Next or Arial named in CSS are not bundled assets. Do not extract or redistribute proprietary OS font files; use them only through platform-supported system font APIs where allowed.

## Prototype icon source

The prototype imports `@radix-ui/react-icons` version `1.3.2`. Radix Icons is published under the MIT licence in its [official repository](https://github.com/radix-ui/icons) and [licence file](https://github.com/radix-ui/icons/blob/main/LICENSE) (accessed 2026-08-06).

Current status: acceptable for the disposable web prototype when the copyright/licence notice is retained in dependency notices. Production adoption is **not decided**. A native icon strategy must assess visual fit, platform conventions, coverage, optical sizing, accessibility labels and licence/notice handling. Icon presence never removes the need for a text/accessibility name.

## Proposed direction fonts

No proposed direction font is currently installed in or bundled by the prototype. CSS family names may silently use system fallback; therefore the visual references and prototype source are not font-rendering evidence.

| Direction | Proposed font | Source and licence | Obligations/status |
|---|---|---|---|
| Tempo Ledger | IBM Plex Sans and IBM Plex Mono | IBM's [official Plex repository](https://github.com/IBM/plex) and [licence](https://github.com/IBM/plex/blob/master/LICENSE.txt): SIL Open Font License 1.1, accessed 2026-08-06 | **Proposed.** Retain copyright/OFL; “Plex” is a reserved font name; review any modification/subsetting and exact release |
| Field Kit | Archivo width family | Omnibus-Type [official Archivo repository](https://github.com/Omnibus-Type/Archivo) and [foundry page](https://www.omnibus-type.com/fonts/archivo/): SIL OFL 1.1, accessed 2026-08-06 | **Proposed.** Pin exact width/weight files; retain OFL/copyright; test glyph coverage and long-label fallback |
| Field Kit | Atkinson Hyperlegible Mono/Next | Braille Institute [official font page](https://www.brailleinstitute.org/freefont/) states personal and commercial availability; upstream [font repository](https://github.com/googlefonts/atkinson-hyperlegible) records SIL OFL 1.1, accessed 2026-08-06 | **Proposed.** Retain OFL/copyright; verify exact Next/Mono package, trademarks/reserved names and language coverage |
| Open Pace | Recursive Sans & Mono | Arrow Type [official repository](https://github.com/arrowtype/recursive) and [project site](https://www.recursive.design/process/): SIL OFL 1.1, accessed 2026-08-06 | **Proposed.** Retain OFL/copyright; pin variable font version/axes; do not animate axes as essential feedback |

OFL permits broad bundling/use subject to its conditions, but this inventory is not legal advice. Release engineering must include the exact licence texts and preserve any reserved font names and copyright notices.

## Font currently declared by the prototype

`@fontsource/roboto` version `5.2.10` is pinned in the prototype lockfile with `OFL-1.1` metadata. Current Roboto sources are also published under OFL 1.1 in the Google Fonts [Roboto repository](https://github.com/googlefonts/roboto-3-classic) and [OFL file](https://github.com/googlefonts/roboto-3-classic/blob/main/OFL.txt) (accessed 2026-08-06).

Its current role is protected device-preview chrome, not a selected NextSet brand typeface. If retained in a distributable prototype, include the package's exact licence/copyright notice and verify the installed tarball rather than relying only on lockfile metadata.

## Direct prototype dependency licence snapshot

The pinned `package-lock.json` records the following direct-package metadata:

| Package group | Pinned version | Lockfile licence metadata |
|---|---:|---|
| React / React DOM | 19.2.7 | MIT |
| Radix Dialog / Dropdown Menu / Icons | 1.1.19 / 2.1.20 / 1.3.2 | MIT |
| `@use-gesture/react` | 10.3.1 | MIT |
| Motion | 12.42.2 | MIT |
| Vite / React plugin | 8.1.3 / 6.0.3 | MIT |
| TypeScript | 7.0.2 | Apache-2.0 |
| Playwright Test | 1.61.1 | Apache-2.0 |
| Fontsource Roboto | 5.2.10 | OFL-1.1 |

This table is a design-prototype snapshot, not a complete transitive licence report, security review or SBOM. A clean install from the pinned npm lockfile completed for prototype verification, but installed package licence files have not been reconciled into a generated notice bundle or SBOM. Before any distribution, generate a complete transitive inventory, inspect installed package contents/notices and resolve discrepancies.

## Original product assets not yet created

| Asset category | Current state | Requirement before production |
|---|---|---|
| NextSet wordmark/logo | Reference-only provisional treatments | Name clearance, original source file, ownership assignment, monochrome/high-contrast variants and trademark review |
| App icon and launch assets | Not created/approved | Original work, light/dark/tinted platform variants, accessibility/contrast review and source/licence record |
| Exercise icons/illustrations | No maintained production set | Original or appropriately licensed set, exercise/content review, text alternative, update owner and no false technique claim |
| Charts/graphics | Prototype CSS shapes only | Implement from product data; accessible summary/table; no copied competitor visual signature |
| Sound/haptic patterns | Not created as files | Prefer platform effects; licence any sound; provide sound/haptic-off alternatives |
| Share-card templates | Post-MVP, not created | Privacy preview, metadata stripping, licensed fonts/assets and no private field by default |
| Store screenshots | Not created | Capture actual approved production build only; never reuse generated references as product screenshots |

## Production intake checklist

For every asset, record:

```text
Asset ID and file hash
Purpose and screens
Creator / copyright holder
Original source URL or generation record
Exact version/date
Licence and full notice path
Reserved names / attribution / modification restrictions
Modifications made
Localisation and accessibility alternative
Security/privacy review where relevant
Approval owner and date
Replacement/removal plan
```

Reject an asset when provenance is missing, rights are ambiguous, the licence is incompatible, required attribution cannot be honoured, it copies a competitor identity, it embeds text that must scale/localise, or it lacks a maintainable accessible alternative.

## Release gate

Before any public build or asset export:

1. select and document the product name and visual direction;
2. create a complete source/licence inventory and SBOM from the exact build;
3. retain all required licence/copyright notices in the repository and distributable notices surface;
4. clear every font, icon, device/frame image, illustration, sound and marketing asset for its actual use;
5. remove prototype-only and unknown-provenance runtime assets from production;
6. verify store screenshots show the real approved build and synthetic non-private data;
7. obtain legal review where the product owner deems risk material.

Until then, all generated references, template device assets and visual marks remain foundation review material only.

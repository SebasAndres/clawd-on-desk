"use strict";

// Canonical catalogs for pet customization choices. Persisted settings store
// stable ids only; renderer-facing values are resolved here so neither menus
// nor untrusted preference data can supply CSS filters or asset paths.

const PET_TINT_CATALOG = Object.freeze([
  Object.freeze({
    id: "none",
    labelKey: "tintNone",
    filter: "",
  }),
  Object.freeze({
    id: "midnight",
    labelKey: "tintMidnight",
    filter: "hue-rotate(200deg) saturate(1.2) brightness(0.82)",
  }),
  Object.freeze({
    id: "gold",
    labelKey: "tintGold",
    filter: "sepia(0.8) saturate(2.2) hue-rotate(-18deg) brightness(1.05)",
  }),
  Object.freeze({
    id: "vaporwave",
    labelKey: "tintVaporwave",
    filter: "hue-rotate(265deg) saturate(1.6) contrast(1.05)",
  }),
  Object.freeze({
    id: "matcha",
    labelKey: "tintMatcha",
    filter: "hue-rotate(75deg) saturate(1.25) brightness(1)",
  }),
  Object.freeze({
    id: "mono",
    labelKey: "tintMono",
    filter: "grayscale(1) brightness(1.05)",
  }),
]);

const PET_TINT_BY_ID = new Map(PET_TINT_CATALOG.map((entry) => [entry.id, entry]));
const PET_TINT_IDS = Object.freeze(PET_TINT_CATALOG.map((entry) => entry.id));
const PET_TINT_THEME_ALIASES = Object.freeze({
  cloudling: Object.freeze({
    vaporwave: "matcha",
    matcha: "vaporwave",
  }),
});

function freezeAccessory({
  id,
  labelKey,
  file = null,
  viewBox = null,
  widthScale = 1,
  offsetY = 0,
  themeWidthScales = null,
  bodySkin = null,
}) {
  return Object.freeze({
    id,
    labelKey,
    file,
    viewBox: viewBox ? Object.freeze({ ...viewBox }) : null,
    widthScale,
    offsetY,
    themeWidthScales: themeWidthScales
      ? Object.freeze({ ...themeWidthScales })
      : null,
    bodySkin,
  });
}

const PET_ACCESSORY_CATALOG = Object.freeze([
  freezeAccessory({
    id: "none",
    labelKey: "accessoryNone",
  }),
  freezeAccessory({
    id: "cowboy-hat",
    labelKey: "accessoryCowboyHat",
    file: "cowboy-hat.svg",
    viewBox: { x: 0, y: 0, width: 16, height: 7 },
  }),
  freezeAccessory({
    id: "party-hat",
    labelKey: "accessoryPartyHat",
    file: "party-hat.svg",
    viewBox: { x: 0, y: 0, width: 11, height: 14 },
    widthScale: 0.7,
    offsetY: 0.3,
  }),
  freezeAccessory({
    id: "wizard-hat",
    labelKey: "accessoryWizardHat",
    file: "wizard-hat.svg",
    viewBox: { x: 0, y: 0, width: 15, height: 16 },
    widthScale: 0.95,
    offsetY: 0.3,
  }),
  freezeAccessory({
    id: "top-hat",
    labelKey: "accessoryTopHat",
    file: "top-hat.svg",
    viewBox: { x: 0, y: 0, width: 14, height: 10 },
    widthScale: 0.88,
    offsetY: 0.2,
  }),
  freezeAccessory({
    id: "santa-hat",
    labelKey: "accessorySantaHat",
    file: "santa-hat.svg",
    viewBox: { x: 0, y: 0, width: 16, height: 9 },
    offsetY: 0.2,
  }),
  freezeAccessory({
    id: "pumpkin-hat",
    labelKey: "accessoryPumpkinHat",
    file: "pumpkin-hat.svg",
    viewBox: { x: 0, y: 0, width: 13, height: 9 },
    widthScale: 0.85,
    offsetY: 0.4,
  }),
  freezeAccessory({
    id: "halo",
    labelKey: "accessoryHalo",
    file: "halo.svg",
    viewBox: { x: 0, y: 0, width: 14, height: 5 },
    widthScale: 1.15,
    offsetY: -1.4,
    themeWidthScales: { clawd: 0.9 },
  }),
  // The four entries below are positioned against the built-in "clawd"
  // theme's actual body geometry (assets/svg/clawd-idle-follow.svg: torso
  // rect y="6" h="7", eyes at y="8..10" (x="4..5" and "10..11"), legs from
  // y="11"). offsetY is the accessory's *bottom* edge relative to the
  // theme's baseY=6.5 attachment line (bigger = sinks further down the
  // torso); every entry here keeps its top edge at y>=11.0, a real margin
  // below the eyes (not just a hair under them), so it drapes over the
  // belly instead of covering the face. The granadero's saber is offset
  // sideways (not just down) past x=11 for the same reason — a straight
  // vertical drop from the hat would cross directly over the right eye.
  //
  // That margin needs to be a real unit or more, not a few tenths: once
  // "accessoryAnimations" is on, accessory-idle-sway (src/styles.css)
  // rotates the accessory rect ±2° around its own center every cycle,
  // which alone eats ~0.2 units of clearance at the top corners. The
  // original tuning here (offsetY 7.9/8.2, top edge landing at y=10.4)
  // predated that animation and left only 0.4 units of headroom below
  // the eyes (y=10) — enough for the sway to tip the scarf into the eye
  // on every swing, as seen in a screenshot report. offsetY bumped by
  // +0.6 across the board to restore a comfortable margin.
  freezeAccessory({
    id: "escarapela",
    labelKey: "accessoryEscarapela",
    file: "escarapela.svg",
    viewBox: { x: 0, y: 0, width: 11, height: 11 },
    // 0.25 is the layout engine's hard floor (pet-accessory-layout.js
    // rejects anything smaller and silently hides the accessory) — a
    // previous 0.15 here made the escarapela invisible.
    widthScale: 0.25,
    offsetY: 8.5,
  }),
  freezeAccessory({
    id: "granadero-hat",
    labelKey: "accessoryGranaderoHat",
    file: "granadero-hat.svg",
    // Wide composite: hat centered up top, saber held out to the right
    // (clear of the eyes) reaching down toward the legs.
    viewBox: { x: 0, y: 0, width: 20, height: 21 },
    widthScale: 0.7,
    offsetY: 5,
  }),
  freezeAccessory({
    id: "argentina-badge",
    labelKey: "accessoryArgentinaBadge",
    file: "argentina-badge.svg",
    viewBox: { x: 0, y: 0, width: 14, height: 5 },
    widthScale: 0.75,
    offsetY: 8.8,
  }),
  freezeAccessory({
    id: "boca-scarf",
    labelKey: "accessoryBocaScarf",
    file: "boca-scarf.svg",
    viewBox: { x: 0, y: 0, width: 15, height: 5 },
    widthScale: 0.75,
    offsetY: 8.5,
    // On the built-in Clawd theme the jersey is painted into the body
    // (assets/svg/boca/, generated by tools/generate-boca-skin.js) instead
    // of being overlaid, so it follows every animation transform. Other
    // themes keep the overlay above.
    bodySkin: Object.freeze({ themeId: "clawd", id: "boca" }),
  }),
]);

const PET_ACCESSORY_BY_ID = new Map(PET_ACCESSORY_CATALOG.map((entry) => [entry.id, entry]));
const PET_ACCESSORY_IDS = Object.freeze(PET_ACCESSORY_CATALOG.map((entry) => entry.id));

function isPetTintId(value) {
  return typeof value === "string" && PET_TINT_BY_ID.has(value);
}

function getPetTint(value) {
  return PET_TINT_BY_ID.get(value) || PET_TINT_BY_ID.get("none");
}

function getPetTintIdForTheme(selections, themeId) {
  if (typeof selections === "string") return getPetTint(selections).id;
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) return "none";
  if (typeof themeId !== "string" || !themeId) return "none";
  return getPetTint(selections[themeId]).id;
}

function isPetTintSupportedForTheme(theme) {
  if (!theme) return true;
  return !!(theme._capabilities && theme._capabilities.petTint === true);
}

function resolvePetTintPayload(value, theme = null) {
  const entry = getPetTint(value);
  if (!isPetTintSupportedForTheme(theme)) {
    return { id: "none", filter: "" };
  }
  const themeAliases = theme && theme._builtin === true
    ? PET_TINT_THEME_ALIASES[theme._id]
    : null;
  const recipeId = (themeAliases && themeAliases[entry.id]) || entry.id;
  const recipe = getPetTint(recipeId);
  return {
    id: entry.id,
    filter: recipe.filter,
  };
}

function listPetTintOptions() {
  return PET_TINT_CATALOG.map(({ id, labelKey }) => ({ id, labelKey }));
}

function isPetAccessoryId(value) {
  return typeof value === "string" && PET_ACCESSORY_BY_ID.has(value);
}

function getPetAccessory(value) {
  return PET_ACCESSORY_BY_ID.get(value) || PET_ACCESSORY_BY_ID.get("none");
}

function getPetAccessoryIdForTheme(selections, themeId) {
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) return "none";
  if (typeof themeId !== "string" || !themeId) return "none";
  return getPetAccessory(selections[themeId]).id;
}

function isPetAccessorySupportedForTheme(theme) {
  if (!theme) return false;
  return !!(theme._capabilities && theme._capabilities.accessories === true);
}

function resolvePetAccessoryPayload(value, theme = null) {
  const entry = getPetAccessory(value);
  const supported = isPetAccessorySupportedForTheme(theme);
  if (!supported || entry.id === "none") {
    return {
      id: "none",
      assetFile: null,
      aspect: 1,
      widthScale: 1,
      offsetY: 0,
    };
  }
  return {
    id: entry.id,
    assetFile: entry.file,
    aspect: entry.viewBox.width / entry.viewBox.height,
    widthScale: (
      theme
      && theme._builtin === true
      && entry.themeWidthScales
      && entry.themeWidthScales[theme._id]
    ) || entry.widthScale,
    offsetY: entry.offsetY,
    ...(
      entry.bodySkin
      && theme
      && theme._builtin === true
      && theme._id === entry.bodySkin.themeId
        ? { bodySkin: entry.bodySkin.id }
        : {}
    ),
  };
}

function listPetAccessoryOptions() {
  return PET_ACCESSORY_CATALOG.map(({ id, labelKey }) => ({ id, labelKey }));
}

module.exports = {
  PET_TINT_CATALOG,
  PET_TINT_IDS,
  isPetTintId,
  getPetTint,
  getPetTintIdForTheme,
  isPetTintSupportedForTheme,
  resolvePetTintPayload,
  listPetTintOptions,
  PET_ACCESSORY_CATALOG,
  PET_ACCESSORY_IDS,
  isPetAccessoryId,
  getPetAccessory,
  getPetAccessoryIdForTheme,
  isPetAccessorySupportedForTheme,
  resolvePetAccessoryPayload,
  listPetAccessoryOptions,
};

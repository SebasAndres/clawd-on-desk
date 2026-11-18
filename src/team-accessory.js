"use strict";

// Random "team of the day" accessory — currently just Boca Juniors. Unlike
// holiday-accessory.js this has no date windows: any day has a small,
// deterministic-per-day chance of showing the scarf, so restarting the app
// mid-day doesn't re-roll the outcome.

const TEAM_ACCESSORY_ID = "boca-scarf";
const DAILY_CHANCE_DEFAULT = 0.15;

function isValidDate(value) {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// FNV-1a over the calendar day string, normalized to [0, 1). Deterministic
// per day and stable across app restarts on the same day.
function hashDayToUnitInterval(key) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) / 0xffffffff;
}

function getTeamAccessoryForDate(date = new Date(), chance = DAILY_CHANCE_DEFAULT) {
  if (!isValidDate(date)) return null;
  if (typeof chance !== "number" || !Number.isFinite(chance) || chance <= 0) return null;
  const roll = hashDayToUnitInterval(`boca-scarf:${dateKey(date)}`);
  if (roll >= chance) return null;
  return { accessoryId: TEAM_ACCESSORY_ID };
}

function isTeamAccessoryEnabledForTheme(selections, themeId) {
  if (!selections || typeof selections !== "object" || Array.isArray(selections)) return false;
  if (typeof themeId !== "string" || !themeId) return false;
  return selections[themeId] === true;
}

module.exports = {
  TEAM_ACCESSORY_ID,
  DAILY_CHANCE_DEFAULT,
  getTeamAccessoryForDate,
  isTeamAccessoryEnabledForTheme,
};

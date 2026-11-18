"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const {
  TEAM_TINT_ID,
  DAILY_CHANCE_DEFAULT,
  getTeamAccessoryForDate,
  isTeamAccessoryEnabledForTheme,
} = require("../src/team-accessory");

function localDate(month, day, hour = 12, year = 2026) {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

describe("team accessory daily roll", () => {
  it("is deterministic for a given calendar day regardless of time-of-day", () => {
    const a = getTeamAccessoryForDate(localDate(4, 10, 0));
    const b = getTeamAccessoryForDate(localDate(4, 10, 23));
    assert.deepStrictEqual(a, b);
  });

  it("fails closed for invalid dates and non-positive chances", () => {
    assert.strictEqual(getTeamAccessoryForDate(new Date(NaN)), null);
    assert.strictEqual(getTeamAccessoryForDate(localDate(4, 10), 0), null);
    assert.strictEqual(getTeamAccessoryForDate(localDate(4, 10), -1), null);
    assert.strictEqual(getTeamAccessoryForDate(localDate(4, 10), NaN), null);
  });

  it("always rolls a hit at chance=1 and never at a vanishingly small chance", () => {
    const hit = getTeamAccessoryForDate(localDate(3, 3), 1);
    assert.deepStrictEqual(hit, { tintId: TEAM_TINT_ID });
    assert.strictEqual(getTeamAccessoryForDate(localDate(3, 3), Number.MIN_VALUE), null);
  });

  it("roughly matches the requested probability over a long enough span", () => {
    // A non-cryptographic hash isn't perfectly uniform over short, similar
    // date strings (a few thousand consecutive days can drift noticeably),
    // so this checks convergence over a multi-decade span instead.
    const chance = 0.15;
    let hits = 0;
    const days = 20000;
    for (let i = 0; i < days; i += 1) {
      const date = new Date(1970, 0, 1 + i, 12, 0, 0, 0);
      if (getTeamAccessoryForDate(date, chance)) hits += 1;
    }
    const rate = hits / days;
    assert.ok(Math.abs(rate - chance) < 0.02, `empirical rate ${rate} too far from ${chance}`);
  });

  it("defaults to a 15% daily chance", () => {
    assert.strictEqual(DAILY_CHANCE_DEFAULT, 0.15);
  });

  it("keeps the per-theme opt-in map independent from other selections", () => {
    assert.strictEqual(isTeamAccessoryEnabledForTheme({ clawd: true }, "clawd"), true);
    assert.strictEqual(isTeamAccessoryEnabledForTheme({ clawd: false }, "clawd"), false);
    assert.strictEqual(isTeamAccessoryEnabledForTheme("true", "clawd"), false);
    assert.strictEqual(isTeamAccessoryEnabledForTheme({ clawd: true }, ""), false);
    assert.strictEqual(isTeamAccessoryEnabledForTheme(null, "clawd"), false);
  });
});

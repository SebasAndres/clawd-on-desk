"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");

const { transform } = require("../tools/generate-boca-skin");
const { resolvePetAccessoryPayload, resolvePetTintPayload } = require("../src/pet-customization-catalog");

const SVG_DIR = path.join(__dirname, "..", "assets", "svg");

describe("Boca body skin", () => {
  it("paints the jersey after a plain torso and greys the body", () => {
    const { svg, count } = transform(
      '<svg>\n  <rect id="torso" x="2" y="6" width="11" height="7" fill="#DE886D"/>\n</svg>'
    );
    assert.strictEqual(count, 1);
    assert.match(svg, /id="torso"[^>]*fill="#A0A0A0"\/>\n  <rect x="2" y="11" width="11" height="2" fill="#0a2f6b"\/>/);
    assert.match(svg, /fill="#f5c518"/);
    assert.doesNotMatch(svg, /#DE886D/i);
  });

  it("wraps an animated torso so the jersey shares its transform", () => {
    const { svg } = transform(
      '<svg>\n  <rect class="once scale-top-left torso-shape" x="2" y="6" width="11" height="7" fill="#DE886D"/>\n</svg>'
    );
    assert.match(svg, /<g class="once scale-top-left torso-shape">\n    <rect x="2" y="6" width="11" height="7" fill="#A0A0A0"\/>/);
    assert.doesNotMatch(svg, /<rect[^>]*fill="#0a2f6b"[^>]*class=/);
  });

  it("leaves torso-shaped rects inside clip paths alone", () => {
    const { svg, count } = transform(
      '<svg><clipPath id="c">\n<rect x="2" y="6" width="11" height="7"/>\n</clipPath></svg>'
    );
    assert.strictEqual(count, 0);
    assert.doesNotMatch(svg, /0a2f6b/);
  });

  it("finds a torso in every built-in Clawd animation", () => {
    for (const file of fs.readdirSync(SVG_DIR).filter((f) => /^clawd-.*\.svg$/.test(f))) {
      const { count } = transform(fs.readFileSync(path.join(SVG_DIR, file), "utf8"));
      assert.ok(count > 0, `${file} has no torso`);
      assert.ok(fs.existsSync(path.join(SVG_DIR, "boca", file)), `assets/svg/boca/${file} missing — run tools/generate-boca-skin.js`);
    }
  });

  it("is a tint-slot body skin offered only for the built-in clawd theme", () => {
    const caps = { petTint: true, accessories: true };
    const clawd = resolvePetTintPayload("boca", { _id: "clawd", _builtin: true, _capabilities: caps });
    const calico = resolvePetTintPayload("boca", { _id: "calico", _builtin: true, _capabilities: caps });
    const fakeClawd = resolvePetTintPayload("boca", { _id: "clawd", _builtin: false, _capabilities: caps });
    assert.deepStrictEqual(clawd, { id: "boca", filter: "", bodySkin: "boca" });
    assert.deepStrictEqual(calico, { id: "none", filter: "" });
    assert.deepStrictEqual(fakeClawd, { id: "none", filter: "" });
  });

  it("leaves the accessory slot free for the soccer ball", () => {
    const ball = resolvePetAccessoryPayload("soccer-ball", {
      _id: "clawd", _builtin: true, _capabilities: { accessories: true },
    });
    assert.strictEqual(ball.id, "soccer-ball");
    assert.strictEqual(ball.assetFile, "soccer-ball.svg");
    assert.strictEqual(ball.bodySkin, undefined);
  });
});

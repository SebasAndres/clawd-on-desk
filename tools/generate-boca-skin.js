#!/usr/bin/env node
"use strict";

// Generates assets/svg/boca/*.svg: the built-in Clawd animations wearing a
// Boca Juniors jersey painted *into* the body (instead of an overlay
// accessory), so the shirt follows every breathe / bounce / jump transform.
//
// - Body colour (#DE886D) is baked to a neutral grey (#A0A0A0, ~ the "mono"
//   tint) because the renderer skips the CSS tint filter while this skin is
//   active (a grayscale filter would also grey out the jersey).
// - Right after every torso rect a blue band + gold stripe is inserted as
//   siblings, inheriting the torso's class/transform so they animate with it.
//
// Re-run after changing any assets/svg/clawd-*.svg:
//   node tools/generate-boca-skin.js

const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(__dirname, "..", "assets", "svg");
const OUT_DIR = path.join(SRC_DIR, "boca");

const BODY_RE = /#DE886D/gi;
const BODY_GREY = "#A0A0A0";
const BOCA_BLUE = "#0a2f6b";
const BOCA_GOLD = "#f5c518";

// Torso geometries used across the Clawd set → jersey rows (below the eyes).
const TORSOS = [
  {
    // standing torso: x=2 y=6 w=11 h=7, eyes at y=8..10
    match: { x: "2", y: "6", width: "11", height: "7" },
    rows: [
      { x: 2, y: 11, width: 11, height: 2, fill: BOCA_BLUE },
      { x: 2, y: 11.6, width: 11, height: 0.8, fill: BOCA_GOLD },
    ],
  },
  {
    // flattened "sploot" torso: x=1 y=10 w=13 h=5, shut eyes at y≈12.5
    match: { x: "1", y: "10", width: "13", height: "5" },
    rows: [
      { x: 1, y: 13.6, width: 13, height: 1.4, fill: BOCA_BLUE },
      { x: 1, y: 14.05, width: 13, height: 0.5, fill: BOCA_GOLD },
    ],
  },
];

const GEOMETRY_ATTRS = new Set(["x", "y", "width", "height", "id", "fill"]);

function parseAttrs(tag) {
  const attrs = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("[^"]*"|'[^']*')/g;
  let m;
  while ((m = re.exec(tag))) attrs.push([m[1], m[2].slice(1, -1)]);
  return attrs;
}

function matchTorso(attrs) {
  const map = Object.fromEntries(attrs);
  return TORSOS.find((t) => Object.entries(t.match).every(([k, v]) => map[k] === v)) || null;
}

function serialize(attrs) {
  return attrs.map(([k, v]) => ` ${k}="${v}"`).join("");
}

function jerseyRows(torso, indent) {
  return torso.rows
    .map((r) => `${indent}<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${r.fill}"/>`)
    .join("\n");
}

// Torso with no animation attrs → jersey rows become plain siblings.
// Torso with class/style/transform → wrap torso + jersey in a <g> carrying
// those attrs, so the pair animates as one block (this also keeps
// `transform-box: fill-box` origins correct: the group's bbox is the torso's).
function rewriteTorso(torso, attrs, indent) {
  const own = attrs.filter(([k]) => GEOMETRY_ATTRS.has(k));
  const anim = attrs.filter(([k]) => !GEOMETRY_ATTRS.has(k));
  if (anim.length === 0) {
    return `${indent}<rect${serialize(attrs)}/>\n${jerseyRows(torso, indent)}`;
  }
  const inner = `${indent}  `;
  return [
    `${indent}<g${serialize(anim)}>`,
    `${inner}<rect${serialize(own)}/>`,
    jerseyRows(torso, inner),
    `${indent}</g>`,
  ].join("\n");
}

// Non-rendered blocks (clip paths, masks, defs) may reuse the torso geometry;
// those must be left untouched.
const NON_RENDERED_RE = /<(defs|clipPath|mask|symbol|pattern)\b[\s\S]*?<\/\1>/g;

function transform(svg) {
  let count = 0;
  const rewrite = (chunk) => chunk.replace(/^([ \t]*)<rect\b([^>]*?)\/>/gm, (whole, indent, body) => {
    const attrs = parseAttrs(body);
    const torso = matchTorso(attrs);
    if (!torso) return whole;
    count += 1;
    return rewriteTorso(torso, attrs, indent);
  });
  let out = "";
  let last = 0;
  for (const m of svg.matchAll(NON_RENDERED_RE)) {
    out += rewrite(svg.slice(last, m.index)) + m[0];
    last = m.index + m[0].length;
  }
  out += rewrite(svg.slice(last));
  return { svg: out.replace(BODY_RE, BODY_GREY), count };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SRC_DIR).filter((f) => /^clawd-.*\.svg$/.test(f));
  const missing = [];
  for (const file of files) {
    const src = fs.readFileSync(path.join(SRC_DIR, file), "utf8");
    const { svg, count } = transform(src);
    if (count === 0) missing.push(file);
    fs.writeFileSync(path.join(OUT_DIR, file), svg);
  }
  console.log(`boca skin: wrote ${files.length} files to ${path.relative(process.cwd(), OUT_DIR)}`);
  if (missing.length) console.log(`no torso found (body recoloured only): ${missing.join(", ")}`);
}

if (require.main === module) main();

module.exports = { transform };

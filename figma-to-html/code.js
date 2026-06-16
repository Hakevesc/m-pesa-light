/* ============================================================
   Figma → HTML Exporter — main thread (runs in the Figma sandbox)

   Traverses the current selection (or the whole page), builds a
   compact intermediate tree (IR), runs simplification passes that
   strip purposeless wrapper frames and dead auto-layouts, then
   emits optimised HTML + CSS (de-duplicated classes, colours
   snapped to the M-PESA design tokens).

   This is the reverse of ../figma-export.js (HTML → Figma).
   ============================================================ */

figma.showUI(__html__, { width: 480, height: 680, themeColors: true });

// ── Design tokens (mirrors styles/design-tokens.css) ───────────────────────
var DESIGN_TOKENS = [
  { name: '--Primary',            hex: '#FE353D' },
  { name: '--Primary-Container',  hex: '#FFDFE0' },
  { name: '--On-Primary',         hex: '#FFF1F2' },
  { name: '--On-Surface',         hex: '#1C1C21' },
  { name: '--On-Surface-Low',     hex: '#7C7C87' },
  { name: '--Surface-Container',  hex: '#FCFCFC' },
  { name: '--Gray-0',             hex: '#FFFFFF' },
  { name: '--Success',            hex: '#1FC83B' },
  { name: '--M-Pesa-Red-800',     hex: '#A41016' },
  { name: '--M-Pesa-Red-600',     hex: '#ED1C24' },
  { name: '--M-Pesa-Red-700',     hex: '#C41520' }
];

figma.ui.onmessage = async function (msg) {
  if (msg.type === 'export') {
    try {
      var out = await runExport(msg.options || {});
      figma.ui.postMessage({ type: 'result', html: out.html, htmlLinked: out.htmlLinked, css: out.css, stats: out.stats });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: (e && e.message) ? e.message : String(e) });
    }
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// ── Tiny helpers ────────────────────────────────────────────────────────────
function prop(node, name, def) { try { var v = node[name]; return (v === undefined) ? def : v; } catch (e) { return def; } }
function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }
function clamp255(v) { return Math.max(0, Math.min(255, Math.round(v * 255))); }
function hex2(n) { var s = n.toString(16); return s.length < 2 ? '0' + s : s; }
function rgbHex(c) { return ('#' + hex2(clamp255(c.r)) + hex2(clamp255(c.g)) + hex2(clamp255(c.b))).toUpperCase(); }
function escapeHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeAttr(s) { return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 28); }

function colorCss(c, opacity) {
  var a = (c.a == null ? 1 : c.a) * (opacity == null ? 1 : opacity);
  if (a >= 0.999) return rgbHex(c);
  return 'rgba(' + clamp255(c.r) + ', ' + clamp255(c.g) + ', ' + clamp255(c.b) + ', ' + round(a, 3) + ')';
}

function maybeToken(ctx, cssColor) {
  if (!ctx.options.useTokens || !cssColor || cssColor[0] !== '#') return cssColor;
  var up = cssColor.toUpperCase();
  for (var i = 0; i < DESIGN_TOKENS.length; i++) {
    if (DESIGN_TOKENS[i].hex.toUpperCase() === up) {
      ctx.usedTokens[DESIGN_TOKENS[i].name] = DESIGN_TOKENS[i].hex;
      return 'var(' + DESIGN_TOKENS[i].name + ')';
    }
  }
  return cssColor;
}

// ── Paints / strokes / effects → CSS ────────────────────────────────────────
function topPaintColor(paints, ctx) {
  if (!paints || paints === figma.mixed) return null;
  for (var i = paints.length - 1; i >= 0; i--) {
    var p = paints[i];
    if (p.visible === false) continue;
    if (p.type === 'SOLID') return maybeToken(ctx, colorCss(p.color, p.opacity));
  }
  return null;
}

function gradientStops(p, ctx) {
  return p.gradientStops.map(function (s) {
    return maybeToken(ctx, colorCss(s.color, 1)) + ' ' + round(s.position * 100, 1) + '%';
  }).join(', ');
}
function gradientAngle(p) {
  var m = p.gradientTransform;
  if (!m) return 180;
  var deg = Math.atan2(m[1][0], m[0][0]) * 180 / Math.PI + 90;
  return round(deg, 1);
}
function backgroundCss(paints, ctx) {
  if (!paints || paints === figma.mixed || !paints.length) return null;
  for (var i = paints.length - 1; i >= 0; i--) {
    var p = paints[i];
    if (p.visible === false) continue;
    if (p.type === 'SOLID') return { color: maybeToken(ctx, colorCss(p.color, p.opacity)) };
    if (p.type === 'GRADIENT_LINEAR') return { gradient: 'linear-gradient(' + gradientAngle(p) + 'deg, ' + gradientStops(p, ctx) + ')' };
    if (p.type === 'GRADIENT_RADIAL' || p.type === 'GRADIENT_DIAMOND') return { gradient: 'radial-gradient(' + gradientStops(p, ctx) + ')' };
    if (p.type === 'GRADIENT_ANGULAR') return { gradient: 'conic-gradient(' + gradientStops(p, ctx) + ')' };
    if (p.type === 'IMAGE') return { image: true };
  }
  return null;
}

function borderCss(node, ctx) {
  var strokes = prop(node, 'strokes', null);
  if (!strokes || !strokes.length) return null;
  var s = null;
  for (var i = strokes.length - 1; i >= 0; i--) {
    if (strokes[i].visible !== false && strokes[i].type === 'SOLID') { s = strokes[i]; break; }
  }
  if (!s) return null;
  var w = prop(node, 'strokeWeight', 1);
  if (typeof w !== 'number') w = 1;
  return round(w, 2) + 'px solid ' + maybeToken(ctx, colorCss(s.color, s.opacity));
}

function radiusCss(node) {
  var cr = prop(node, 'cornerRadius', 0);
  if (typeof cr === 'number') return cr ? round(cr, 2) + 'px' : null;
  var tl = prop(node, 'topLeftRadius', 0), tr = prop(node, 'topRightRadius', 0),
      br = prop(node, 'bottomRightRadius', 0), bl = prop(node, 'bottomLeftRadius', 0);
  if (!(tl || tr || br || bl)) return null;
  return [tl, tr, br, bl].map(function (r) { return round(r, 2) + 'px'; }).join(' ');
}

function effectsCss(node) {
  var out = { shadow: [], filter: [], backdrop: [] };
  var effects = prop(node, 'effects', []);
  if (!effects) return out;
  effects.forEach(function (e) {
    if (e.visible === false) return;
    if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
      var inset = e.type === 'INNER_SHADOW' ? 'inset ' : '';
      out.shadow.push(inset + round(e.offset.x, 1) + 'px ' + round(e.offset.y, 1) + 'px ' +
        round(e.radius, 1) + 'px ' + round(e.spread || 0, 1) + 'px ' + colorCss(e.color, 1));
    } else if (e.type === 'LAYER_BLUR') { out.filter.push('blur(' + round(e.radius, 1) + 'px)'); }
    else if (e.type === 'BACKGROUND_BLUR') { out.backdrop.push('blur(' + round(e.radius, 1) + 'px)'); }
  });
  return out;
}

function textCss(node, ctx) {
  var css = {};
  var fn = prop(node, 'fontName', null);
  if (fn && fn !== figma.mixed && fn.family) css['font-family'] = "'" + fn.family + "', sans-serif";
  var fs = prop(node, 'fontSize', null);
  if (typeof fs === 'number') css['font-size'] = round(fs, 2) + 'px';
  var fw = prop(node, 'fontWeight', null);
  if (typeof fw === 'number' && fw !== 400) css['font-weight'] = fw;
  var col = topPaintColor(prop(node, 'fills', null), ctx);
  if (col) css['color'] = col;
  var lh = prop(node, 'lineHeight', null);
  if (lh && lh !== figma.mixed && lh.unit && lh.unit !== 'AUTO') {
    css['line-height'] = lh.unit === 'PERCENT' ? round(lh.value, 1) + '%' : round(lh.value, 2) + 'px';
  }
  var ls = prop(node, 'letterSpacing', null);
  if (ls && ls !== figma.mixed && ls.value) {
    css['letter-spacing'] = ls.unit === 'PERCENT'
      ? round(ls.value / 100 * (typeof fs === 'number' ? fs : 16), 2) + 'px'
      : round(ls.value, 2) + 'px';
  }
  var ta = prop(node, 'textAlignHorizontal', 'LEFT');
  if (ta && ta !== 'LEFT') css['text-align'] = ta === 'JUSTIFIED' ? 'justify' : ta.toLowerCase();
  var tc = prop(node, 'textCase', 'ORIGINAL');
  if (tc === 'UPPER') css['text-transform'] = 'uppercase';
  else if (tc === 'LOWER') css['text-transform'] = 'lowercase';
  else if (tc === 'TITLE') css['text-transform'] = 'capitalize';
  var td = prop(node, 'textDecoration', 'NONE');
  if (td === 'UNDERLINE') css['text-decoration'] = 'underline';
  else if (td === 'STRIKETHROUGH') css['text-decoration'] = 'line-through';
  return css;
}

function mapPrimary(v) { return ({ MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', SPACE_BETWEEN: 'space-between' })[v] || 'flex-start'; }
function mapCounter(v) { return ({ MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end', BASELINE: 'baseline' })[v] || 'flex-start'; }

// ── Async asset export (icons → inline SVG, image fills → data URI) ─────────
function base64(bytes) {
  if (typeof figma.base64Encode === 'function') return figma.base64Encode(bytes);
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', out = '';
  for (var i = 0; i < bytes.length; i += 3) {
    var b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += chars[b0 >> 2] + chars[((b0 & 3) << 4) | (b1 >> 4)];
    out += (i + 1 < bytes.length) ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += (i + 2 < bytes.length) ? chars[b2 & 63] : '=';
  }
  return out;
}
function bytesToStr(bytes) {
  var s = '';
  for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  try { return decodeURIComponent(escape(s)); } catch (e) { return s; }
}
async function exportSvg(node) {
  try {
    var bytes = await node.exportAsync({ format: 'SVG' });
    var svg = bytesToStr(bytes);
    // strip intrinsic width/height so the wrapper class controls sizing
    return svg.replace(/(<svg[^>]*?)\s(?:width|height)="[^"]*"/g, '$1');
  } catch (e) { return null; }
}
async function exportPng(node) {
  try {
    var bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 2 } });
    return 'data:image/png;base64,' + base64(bytes);
  } catch (e) { return null; }
}

// ── Build the intermediate representation ───────────────────────────────────
async function buildIR(node, ctx, isRoot) {
  if (node.visible === false) return null;
  if (typeof node.opacity === 'number' && node.opacity === 0) return null;

  var t = node.type;

  if (t === 'VECTOR' || t === 'STAR' || t === 'POLYGON' || t === 'LINE' || t === 'BOOLEAN_OPERATION') {
    var svg = await exportSvg(node);
    if (!svg) return null;
    return {
      kind: 'svg', name: node.name || 'icon', svg: svg, cssObj: {}, children: [],
      w: node.width, h: node.height, x: node.x, y: node.y, isRoot: !!isRoot, absolute: false,
      lsH: 'FIXED', lsV: 'FIXED', layoutPositioning: prop(node, 'layoutPositioning', 'AUTO'),
      layout: { mode: 'none' }
    };
  }

  var ir = {
    kind: 'box', name: node.name, figmaType: t,
    w: node.width, h: node.height, x: node.x, y: node.y, isRoot: !!isRoot, absolute: false,
    lsH: prop(node, 'layoutSizingHorizontal', 'FIXED'),
    lsV: prop(node, 'layoutSizingVertical', 'FIXED'),
    layoutPositioning: prop(node, 'layoutPositioning', 'AUTO'),
    cssObj: {}, children: [], layout: { mode: 'block', direction: 'row' }, pad: null
  };

  if (t === 'TEXT') {
    ir.kind = 'text';
    ir.text = node.characters || '';
    var tcss = textCss(node, ctx);
    for (var tk in tcss) ir.cssObj[tk] = tcss[tk];
    // Standalone text reports no layout sizing — derive it from auto-resize so
    // auto-width text hugs its content instead of getting pinned to a fixed width.
    var validSizes = { FIXED: 1, HUG: 1, FILL: 1 };
    var rawH = prop(node, 'layoutSizingHorizontal', null);
    var rawV = prop(node, 'layoutSizingVertical', null);
    var tar = prop(node, 'textAutoResize', 'NONE');
    ir.lsH = validSizes[rawH] ? rawH : (tar === 'WIDTH_AND_HEIGHT' ? 'HUG' : 'FIXED');
    ir.lsV = validSizes[rawV] ? rawV : ((tar === 'WIDTH_AND_HEIGHT' || tar === 'HEIGHT') ? 'HUG' : 'FIXED');
    return ir;
  }

  var lm = prop(node, 'layoutMode', 'NONE');
  if (lm && lm !== 'NONE') {
    ir.layout.mode = 'flex';
    ir.layout.direction = lm === 'HORIZONTAL' ? 'row' : 'column';
    ir.layout.gap = prop(node, 'itemSpacing', 0) || 0;
    ir.layout.wrap = prop(node, 'layoutWrap', 'NO_WRAP') === 'WRAP';
    ir.layout.justify = mapPrimary(prop(node, 'primaryAxisAlignItems', 'MIN'));
    ir.layout.align = mapCounter(prop(node, 'counterAxisAlignItems', 'MIN'));
    ir.pad = {
      t: prop(node, 'paddingTop', 0) || 0, r: prop(node, 'paddingRight', 0) || 0,
      b: prop(node, 'paddingBottom', 0) || 0, l: prop(node, 'paddingLeft', 0) || 0
    };
  }

  // visuals (groups carry no paint/stroke/effects of their own)
  if (t !== 'GROUP') {
    var bg = backgroundCss(prop(node, 'fills', null), ctx);
    if (bg) {
      if (bg.color) ir.cssObj['background'] = bg.color;
      else if (bg.gradient) ir.cssObj['background'] = bg.gradient;
      else if (bg.image) {
        var img = await exportPng(node);
        if (img) {
          ir.bgImage = img;
          ir.cssObj['background-image'] = 'url(' + img + ')';
          ir.cssObj['background-size'] = 'cover';
          ir.cssObj['background-position'] = 'center';
        }
      }
    }
    var bd = borderCss(node, ctx); if (bd) ir.cssObj['border'] = bd;
    var rad = radiusCss(node);
    if (t === 'ELLIPSE') rad = '50%';
    if (rad) ir.cssObj['border-radius'] = rad;
    var fx = effectsCss(node);
    if (fx.shadow.length) ir.cssObj['box-shadow'] = fx.shadow.join(', ');
    if (fx.filter.length) ir.cssObj['filter'] = fx.filter.join(' ');
    if (fx.backdrop.length) ir.cssObj['backdrop-filter'] = fx.backdrop.join(' ');
    if (prop(node, 'clipsContent', false)) ir.cssObj['overflow'] = 'hidden';
  }
  if (typeof node.opacity === 'number' && node.opacity < 1) ir.cssObj['opacity'] = round(node.opacity, 3);

  var kids = prop(node, 'children', null);
  if (kids && kids.length) {
    for (var i = 0; i < kids.length; i++) {
      var childIr = await buildIR(kids[i], ctx, false);
      if (childIr) {
        // children of a non-auto-layout frame are free-positioned (absolute);
        // children explicitly detached inside an auto-layout frame too.
        childIr.absolute = (ir.layout.mode !== 'flex') || (childIr.layoutPositioning === 'ABSOLUTE');
        ir.children.push(childIr);
      }
    }
  }
  return ir;
}

// ── Simplification passes ───────────────────────────────────────────────────
function countNodes(list) { var n = 0; list.forEach(function (x) { n++; if (x.children) n += countNodes(x.children); }); return n; }

function hasOwnVisual(node) {
  var c = node.cssObj;
  if (c['background'] || c['background-image'] || c['border'] || c['box-shadow'] ||
      c['border-radius'] || c['filter'] || c['backdrop-filter'] || c['overflow']) return true;
  if (c['opacity'] != null) return true;
  if (node.pad && (node.pad.t || node.pad.r || node.pad.b || node.pad.l)) return true;
  return false;
}

// A wrapper adds nothing if it has no visual style of its own and either holds a
// single child, or is a pure positioning group we can hoist into its parent.
function isRedundant(node) {
  if (node.kind !== 'box') return false;
  if (hasOwnVisual(node)) return false;
  var n = node.children ? node.children.length : 0;
  if (n === 0) return false;
  if (n === 1) return true;
  if (node.absolute && node.layout.mode !== 'flex') return true; // hoistable absolute group
  return false;
}

function simplify(node, isRoot, opts) {
  if (node.children && node.children.length) {
    var next = [];
    for (var i = 0; i < node.children.length; i++) {
      var res = simplify(node.children[i], false, opts);
      for (var j = 0; j < res.length; j++) next.push(res[j]);
    }
    node.children = next;
  }
  if (isRoot || node.kind === 'text' || node.kind === 'svg' || node.bgImage) return [node];

  // an auto-layout that arranges 0–1 children does nothing → demote to a block
  if (opts.stripLayout && node.layout.mode === 'flex' && node.children.length <= 1 && !hasOwnVisual(node)) {
    node.layout.mode = 'block';
    node.pad = null;
  }

  if (opts.simplifyFrames && isRedundant(node)) {
    var kids = node.children || [];
    if (node.absolute) {
      // hoisting into the grandparent's coordinate space → offset by our position
      kids.forEach(function (c) { c.x = (c.x || 0) + (node.x || 0); c.y = (c.y || 0) + (node.y || 0); c.absolute = true; });
    }
    if (kids.length === 1) {
      // the lone child takes over our role as the flex item
      var only = kids[0];
      if (node.lsH === 'FILL' && only.lsH !== 'FILL') only.lsH = 'FILL';
      if (node.lsV === 'FILL' && only.lsV !== 'FILL') only.lsV = 'FILL';
    }
    return kids;
  }
  return [node];
}

// ── Layout pass: resolve sizing + positioning into the cssObj ───────────────
function applySize(node, css, propName, sizing, px, isFlexItem, isMain) {
  if (node.absolute) { css[propName] = round(px, 1) + 'px'; return; }
  if (node.isRoot) { css[propName] = round(px, 1) + 'px'; return; }
  if (sizing === 'FILL') {
    if (isFlexItem && isMain) css['flex'] = '1 1 0%';
    else if (isFlexItem) css['align-self'] = 'stretch';
    else css[propName] = '100%';
    return;
  }
  if (sizing === 'HUG') return; // content-sized → leave unset
  css[propName] = round(px, 1) + 'px';
}

function setPadding(css, p) {
  var t = round(p.t, 1), r = round(p.r, 1), b = round(p.b, 1), l = round(p.l, 1);
  if (!(t || r || b || l)) return;
  if (t === r && r === b && b === l) css['padding'] = t + 'px';
  else if (t === b && l === r) css['padding'] = t + 'px ' + r + 'px';
  else css['padding'] = t + 'px ' + r + 'px ' + b + 'px ' + l + 'px';
}

function prepare(node, parent) {
  var css = node.cssObj;

  if (node.layout && node.layout.mode === 'flex') {
    css['display'] = 'flex';
    if (node.layout.direction === 'column') css['flex-direction'] = 'column';
    if (node.layout.gap) css['gap'] = round(node.layout.gap, 2) + 'px';
    if (node.layout.wrap) css['flex-wrap'] = 'wrap';
    if (node.layout.justify && node.layout.justify !== 'flex-start') css['justify-content'] = node.layout.justify;
    // CSS defaults align-items to `stretch`, but Figma's counter-axis default is
    // MIN (top/left) — so always emit it or the layout silently shifts.
    css['align-items'] = node.layout.align || 'flex-start';
    if (node.pad) setPadding(css, node.pad);
  }

  var hasAbsChild = node.children && node.children.some(function (c) { return c.absolute; });
  if (hasAbsChild && css['position'] == null) css['position'] = 'relative';

  if (node.absolute) {
    css['position'] = 'absolute';
    css['left'] = round(node.x || 0, 1) + 'px';
    css['top'] = round(node.y || 0, 1) + 'px';
  }

  var isFlexItem = parent && parent.layout && parent.layout.mode === 'flex' && !node.absolute;
  var parentRow = parent && parent.layout && parent.layout.direction === 'row';
  applySize(node, css, 'width', node.lsH || 'FIXED', node.w, isFlexItem, !!parentRow);
  applySize(node, css, 'height', node.lsV || 'FIXED', node.h, isFlexItem, !parentRow);

  if (node.children) node.children.forEach(function (c) { prepare(c, node); });
}

// ── Serialise CSS / build the class manager (the de-dup optimiser) ──────────
var PROP_ORDER = ['position', 'top', 'right', 'bottom', 'left', 'display', 'flex-direction',
  'flex-wrap', 'justify-content', 'align-items', 'align-self', 'flex', 'gap', 'width', 'height',
  'min-width', 'min-height', 'max-width', 'margin', 'padding', 'background', 'background-image',
  'background-size', 'background-position', 'border', 'border-radius', 'box-shadow', 'filter',
  'backdrop-filter', 'opacity', 'overflow', 'color', 'font-family', 'font-size', 'font-weight',
  'line-height', 'letter-spacing', 'text-align', 'text-transform', 'text-decoration'];

function serializeDecl(css) {
  var keys = Object.keys(css);
  keys.sort(function (a, b) {
    var ia = PROP_ORDER.indexOf(a), ib = PROP_ORDER.indexOf(b);
    if (ia < 0) ia = 999; if (ib < 0) ib = 999;
    return ia - ib || (a < b ? -1 : 1);
  });
  return keys.map(function (k) { return k + ': ' + css[k]; }).join('; ');
}

function makeSink(options) {
  var byDecl = {}, byName = {}, rules = [];
  function classFor(cssObj, name) {
    var decl = serializeDecl(cssObj);
    if (!decl) return null;
    if (!options.dedupe || byDecl[decl] == null) {
      var base = slug(name) || 'el', cls = base, i = 2;
      while (byName[cls]) { cls = base + '-' + i; i++; }
      byName[cls] = 1;
      rules.push({ cls: cls, decl: decl });
      if (options.dedupe) byDecl[decl] = cls;
      return cls;
    }
    return byDecl[decl];
  }
  return {
    inline: !!options.inlineStyles,
    attr: function (cssObj, name) {
      if (this.inline) { var d = serializeDecl(cssObj); return d ? ' style="' + escapeAttr(d) + '"' : ''; }
      var c = classFor(cssObj, name);
      return c ? ' class="' + c + '"' : '';
    },
    css: function () { return rules.map(function (r) { return '.' + r.cls + ' { ' + r.decl + '; }'; }).join('\n'); },
    count: function () { return rules.length; }
  };
}

// ── Render HTML ─────────────────────────────────────────────────────────────
function injectAttr(svg, attr) { if (!attr) return svg; return svg.replace('<svg', '<svg' + attr); }

function render(node, sink, depth) {
  var pad = new Array(depth + 1).join('  ');
  if (node.kind === 'svg') {
    return pad + injectAttr(node.svg || '<svg></svg>', sink.attr(node.cssObj, node.name || 'icon'));
  }
  var attr = sink.attr(node.cssObj, node.name);
  if (node.kind === 'text') {
    return pad + '<p' + attr + '>' + escapeHtml(node.text) + '</p>';
  }
  if (!node.children || !node.children.length) {
    return pad + '<div' + attr + '></div>';
  }
  var inner = node.children.map(function (c) { return render(c, sink, depth + 1); }).join('\n');
  return pad + '<div' + attr + '>\n' + inner + '\n' + pad + '</div>';
}

function indent(text, n) {
  var p = new Array(n + 1).join(' ');
  return text.split('\n').map(function (l) { return l ? p + l : l; }).join('\n');
}

function buildDoc(roots, sink, usedTokens) {
  var body = roots.map(function (r) { return render(r, sink, 1); }).join('\n');
  var tokenKeys = Object.keys(usedTokens);
  var rootCss = tokenKeys.length
    ? ':root {\n' + tokenKeys.map(function (k) { return '  ' + k + ': ' + usedTokens[k] + ';'; }).join('\n') + '\n}\n\n'
    : '';
  var base = '* { margin: 0; padding: 0; box-sizing: border-box; }\n' +
    "body { font-family: 'Switzer', 'Inter', sans-serif; background: #fff; }\n" +
    'svg { display: block; }\n\n';
  var sheet = rootCss + base + sink.css() + '\n';

  var head = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>Exported from Figma</title>\n';
  var htmlSingle = head + '<style>\n' + indent(sheet, 2) + '</style>\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
  var htmlLinked = head + '<link rel="stylesheet" href="style.css">\n</head>\n<body>\n' + body + '\n</body>\n</html>\n';
  return { htmlSingle: htmlSingle, htmlLinked: htmlLinked, css: sheet };
}

// ── Orchestration ───────────────────────────────────────────────────────────
async function runExport(options) {
  options = Object.assign({
    scope: 'selection', simplifyFrames: true, stripLayout: true,
    useTokens: true, dedupe: true, inlineStyles: false
  }, options);

  var sel = figma.currentPage.selection;
  var roots;
  if (options.scope === 'selection' && sel && sel.length) roots = sel.slice();
  else roots = figma.currentPage.children.slice();
  if (!roots.length) throw new Error('Nothing to export — select a frame, or add layers to the page.');

  var ctx = { options: options, usedTokens: {} };
  var irRoots = [];
  for (var i = 0; i < roots.length; i++) {
    var ir = await buildIR(roots[i], ctx, true);
    if (ir) irRoots.push(ir);
  }

  var before = countNodes(irRoots);
  if (options.simplifyFrames || options.stripLayout) {
    var simplified = [];
    for (var j = 0; j < irRoots.length; j++) {
      var r = simplify(irRoots[j], true, options);
      for (var m = 0; m < r.length; m++) simplified.push(r[m]);
    }
    irRoots = simplified;
  }
  var after = countNodes(irRoots);

  irRoots.forEach(function (r) { prepare(r, null); });

  var sink = makeSink(options);
  var docs = buildDoc(irRoots, sink, ctx.usedTokens);

  return {
    html: docs.htmlSingle,
    htmlLinked: docs.htmlLinked,
    css: docs.css,
    stats: { before: before, after: after, classes: sink.count() }
  };
}

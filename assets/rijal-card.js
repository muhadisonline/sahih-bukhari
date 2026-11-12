/* Sahabi / tabi'i card. Only a unique name from our Taqrib rows is clickable. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.RijalCard = api;
  if (typeof document !== "undefined" && document.currentScript) {
    var jsonUrl = new URL("rijal-card.json", document.currentScript.src).href;
    var boot = function () {
      if (!document.querySelector(".isnad")) return;
      fetch(jsonUrl)
        .then(function (res) { return res.json(); })
        .then(function (rows) { api.mount(document, rows); })
        .catch(function () {});
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
    else boot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var HAR = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/;
  var SKIP = { "بن": 1, "ابن": 1, "يعني": 1, "هو": 1, "وهي": 1, "وهو": 1 };
  var STOP = { "قال": 1, "يقول": 1, "تقول": 1, "قالا": 1, "قالوا": 1, "قالت": 1, "انه": 1, "انها": 1, "انهما": 1, "انهم": 1, "كلاهما": 1, "جميعا": 1, "رضي": 1, "رسول": 1, "النبي": 1, "ان": 1, "ح": 1 };
  var BAD = { "ابيه": 1, "امه": 1, "جده": 1, "رجل": 1, "شيخ": 1 };
  var LABELS = [
    ["b", "الطبقة"],
    ["r", "حكم ابن حجر"],
    ["y", "الكنية"],
    ["a", "النسب"],
    ["l", "اللقب"],
    ["d", "الوفاة"],
    ["c", "البلد"],
  ];

  function foldChar(c) {
    if (HAR.test(c)) return "";
    if ("أإآٱ".indexOf(c) >= 0) return "ا";
    if (c === "ى") return "ي";
    if (c === "ة") return "ه";
    if (!/[\u0621-\u064A\s]/.test(c)) return " ";
    return c;
  }

  function foldMap(value) {
    var text = "";
    var map = [];
    var src = String(value || "");
    for (var i = 0; i < src.length; i++) {
      var next = foldChar(src[i]);
      for (var k = 0; k < next.length; k++) {
        text += next[k];
        map.push(i);
      }
    }
    return { text: text, map: map };
  }

  function fold(value) {
    return foldMap(value).text.replace(/\s+/g, " ").trim();
  }

  function tokensOf(value) {
    var parts = fold(value).split(" ");
    var out = [];
    for (var i = 0; i < parts.length; i++) if (parts[i] && !SKIP[parts[i]]) out.push(parts[i]);
    return out;
  }

  function prepare(rows) {
    return rows.map(function (row) {
      var bag = {};
      tokensOf([row.n, row.a, row.l].join(" ")).forEach(function (token) { bag[token] = 1; });
      return { row: row, tokens: tokensOf(row.n), bag: bag };
    });
  }

  function matchTokens(people, tokens) {
    for (var n = tokens.length; n >= 2; n--) {
      var hits = [];
      for (var i = 0; i < people.length; i++) {
        var person = people[i];
        if (person.tokens.length < n) continue;
        var same = true;
        for (var k = 0; k < n; k++) if (person.tokens[k] !== tokens[k]) { same = false; break; }
        if (same) hits.push(person);
      }
      var extra = tokens.slice(n);
      if (extra.length) {
        if (!hits.length) continue;
        var narrowed = hits.filter(function (person) {
          for (var e = 0; e < extra.length; e++) if (!person.bag[extra[e]]) return false;
          return true;
        });
        if (narrowed.length === 1) return narrowed[0].row;
        return null;
      }
      if (hits.length === 1) return hits[0].row;
      if (hits.length > 1) return null;
    }
    return null;
  }

  function sahabiAfterRadi(people, tokens) {
    var hits = [];
    var n = tokens.length;
    for (var i = 0; i < people.length; i++) {
      var person = people[i];
      if (person.tokens.length < n) continue;
      var same = true;
      for (var k = 0; k < n; k++) if (person.tokens[k] !== tokens[k]) { same = false; break; }
      if (same) hits.push(person);
    }
    var sahaba = hits.filter(function (person) { return person.row.g === "s"; });
    if (sahaba.length === 1) return sahaba[0].row;
    return null;
  }

  function wordSpans(folded) {
    var words = [];
    var re = /\S+/g;
    var match;
    while ((match = re.exec(folded.text))) {
      words.push({
        token: fold(match[0]).trim(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    return words.filter(function (word) { return word.token; });
  }

  function isVerb(token) {
    if (token === "عن" || token === "وعن" || token === "فعن") return true;
    var core = token.replace(/^[وف]/, "");
    return /^(حدثنا|حدثني|حدثناه|حدثتها|حدثته|حدثتنا|اخبرنا|اخبرني|اخبره|اخبرته|اخبرتها|انبانا|انباني|سمعت|سمع|يحدث|يحدثه|تحدث)$/.test(core);
  }

  function owns(people, row, token) {
    var bare = token.charAt(0) === "و" ? token.slice(1) : token;
    for (var i = 0; i < people.length; i++) {
      if (people[i].row.i !== row.i) continue;
      return !!(people[i].bag[token] || people[i].bag[bare]);
    }
    return false;
  }

  function spans(text, people) {
    var folded = foldMap(text);
    var words = wordSpans(folded);
    var found = [];
    for (var i = 0; i < words.length; i++) {
      if (!isVerb(words[i].token)) continue;
      var tokens = [];
      var from = -1;
      var to = -1;
      var stopped = "";
      for (var j = i + 1; j < words.length && j < i + 14; j++) {
        var token = words[j].token;
        if (isVerb(token) || STOP[token] || token === "و") { stopped = token; break; }
        if (tokens.length >= 2 && token.charAt(0) === "و" && token.length > 2) {
          var rowNow = matchTokens(people, tokens);
          if (rowNow && !owns(people, rowNow, token)) { stopped = "و"; break; }
        }
        if (SKIP[token]) {
          to = words[j].end;
          continue;
        }
        if (from < 0) from = words[j].start;
        to = words[j].end;
        tokens.push(token);
      }
      if (tokens.length < 2 || BAD[tokens[0]] || from < 0) continue;
      var row = matchTokens(people, tokens);
      if (!row && stopped === "رضي") row = sahabiAfterRadi(people, tokens);
      if (!row) continue;
      var start = folded.map[from];
      var end = folded.map[Math.min(to - 1, folded.map.length - 1)] + 1;
      while (end < text.length && HAR.test(text.charAt(end))) end++;
      found.push({ start: start, end: end, row: row });
    }
    found.sort(function (a, b) { return b.end - b.start - (a.end - a.start) || a.start - b.start; });
    var kept = [];
    found.forEach(function (span) {
      if (kept.some(function (other) { return span.start < other.end && other.start < span.end; })) return;
      kept.push(span);
    });
    kept.sort(function (a, b) { return a.start - b.start; });
    return kept;
  }

  function css() {
    return ".isnad .rawi{font:inherit;color:inherit;background:none;border:0;padding:0;border-bottom:1px dashed currentColor;cursor:pointer}"
      + ".rijal-card{position:fixed;z-index:30;width:min(22rem,calc(100vw - 1.5rem));background:#fffdf9;border:1px solid #e6e1d8;padding:1rem 1rem .85rem;box-shadow:0 12px 40px rgba(22,21,19,.12)}"
      + ".rijal-card .kind{margin:0;color:#6e675f;font-size:.8rem}"
      + ".rijal-card h2{margin:.2rem 0 0;font-family:Amiri,serif;font-size:1.55rem;font-weight:400;line-height:1.45}"
      + ".rijal-card .row{display:grid;grid-template-columns:6.5rem 1fr;gap:.5rem;padding:.45rem 0;border-bottom:1px solid #e6e1d8}"
      + ".rijal-card dt{color:#6e675f;font-size:.8rem}.rijal-card dd{margin:0;font-family:Amiri,serif;font-size:1.15rem;line-height:1.55}"
      + ".rijal-card .foot{margin:.7rem 0 0;color:#6e675f;font-size:.78rem;line-height:1.7}"
      + ".rijal-card .x{position:absolute;top:.35rem;left:.35rem;border:0;background:none;min-width:2.2rem;min-height:2.2rem;color:#6e675f}";
  }

  function mount(doc, rows) {
    var nodes = doc.querySelectorAll(".isnad");
    if (!nodes.length) return;
    var people = prepare(rows);
    var byId = {};
    rows.forEach(function (row) { byId[row.i] = row; });
    if (!doc.getElementById("rijal-card-css")) {
      var style = doc.createElement("style");
      style.id = "rijal-card-css";
      style.textContent = css();
      doc.head.appendChild(style);
    }
    var card = doc.createElement("aside");
    card.className = "rijal-card";
    card.hidden = true;
    card.setAttribute("role", "dialog");
    doc.body.appendChild(card);
    function close() { card.hidden = true; }
    doc.addEventListener("keydown", function (event) { if (event.key === "Escape") close(); });
    doc.addEventListener("click", function (event) {
      if (card.hidden) return;
      if (event.target.closest && (event.target.closest(".rijal-card") || event.target.closest(".rawi"))) return;
      close();
    });
    function show(button, row) {
      card.replaceChildren();
      var closeBtn = doc.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "x";
      closeBtn.setAttribute("aria-label", "إغلاق");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", close);
      var kind = null;
      if (row.g === "s" || row.g === "t") {
        kind = doc.createElement("p");
        kind.className = "kind";
        kind.textContent = row.g === "s" ? "صحابي" : "تابعي";
      }
      var title = doc.createElement("h2");
      title.textContent = row.n;
      card.append(closeBtn);
      if (kind) card.appendChild(kind);
      card.appendChild(title);
      LABELS.forEach(function (pair) {
        if (!row[pair[0]]) return;
        var line = doc.createElement("div");
        line.className = "row";
        var dt = doc.createElement("dt");
        dt.textContent = pair[1];
        var dd = doc.createElement("dd");
        dd.textContent = row[pair[0]];
        line.append(dt, dd);
        card.appendChild(line);
      });
      var foot = doc.createElement("p");
      foot.className = "foot";
      foot.textContent = "من تقريب التهذيب. نُقل كما ورد، دون زيادة.";
      if (row.g === "s" || row.g === "t") {
        var link = doc.createElement("a");
        link.href = "/sahih-bukhari/sahaba/" + row.i + "/";
        link.textContent = "صفحته";
        foot.appendChild(doc.createElement("br"));
        foot.appendChild(link);
      }
      card.appendChild(foot);
      card.hidden = false;
      var rect = button.getBoundingClientRect();
      var width = Math.min(352, window.innerWidth - 24);
      var left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
      var top = rect.bottom + 8;
      card.style.width = width + "px";
      card.style.left = left + "px";
      card.style.top = top + "px";
      if (card.getBoundingClientRect().bottom > window.innerHeight - 8) {
        card.style.top = Math.max(8, rect.top - card.offsetHeight - 8) + "px";
      }
    }
    nodes.forEach(function (node) {
      var text = node.textContent || "";
      var hits = spans(text, people);
      if (!hits.length) return;
      var cursor = 0;
      var frag = doc.createDocumentFragment();
      hits.forEach(function (hit) {
        if (hit.start > cursor) frag.appendChild(doc.createTextNode(text.slice(cursor, hit.start)));
        var button = doc.createElement("button");
        button.type = "button";
        button.className = "rawi";
        button.textContent = text.slice(hit.start, hit.end);
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          show(button, byId[hit.row.i]);
        });
        frag.appendChild(button);
        cursor = hit.end;
      });
      if (cursor < text.length) frag.appendChild(doc.createTextNode(text.slice(cursor)));
      node.replaceChildren(frag);
    });
  }

  return { fold: fold, tokensOf: tokensOf, prepare: prepare, matchTokens: matchTokens, spans: spans, mount: mount };
});

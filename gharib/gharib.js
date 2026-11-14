
(function () {
  var input = document.getElementById("gq");
  var out = document.getElementById("out");
  function fold(value) {
    var s = String(value || "");
    s = s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
    s = s.replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
    s = s.replace(/[^\u0621-\u064A\s]/g, " ").replace(/\s+/g, " ").trim();
    return s;
  }
  function esc(value) {
    return String(value).replace(/[&<>"]/g, function (ch) {
      if (ch === "&") return "&" + "amp;";
      if (ch === "<") return "&" + "lt;";
      if (ch === ">") return "&" + "gt;";
      return "&" + "quot;";
    });
  }
  function show(rows) {
    if (!rows.length) {
      out.innerHTML = '<p class="meta">لا شرح بهذه الكلمة في ما نُقل من النهاية.</p>';
      return;
    }
    out.innerHTML = rows.slice(0, 40).map(function (row) {
      return '<article class="ghit" id="' + esc(row.r) + '"><h2>' + esc(row.a) + '</h2><p>' + esc(row.g) + '</p></article>';
    }).join("");
  }
  var data = [];
  fetch("gharib.json").then(function (res) { return res.json(); }).then(function (rows) {
    data = rows;
    var hash = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (hash) { input.value = hash; run(); }
  });
  function run() {
    var q = fold(input.value);
    if (q.length < 2) { out.innerHTML = ""; return; }
    var hits = data.filter(function (row) {
      if (row.r === q || fold(row.a) === q) return true;
      if (q.length < 3 || row.r.length < 3) return false;
      return row.r.indexOf(q) === 0 || q.indexOf(row.r) === 0;
    });
    hits.sort(function (a, b) {
      return (a.r === q ? 0 : 1) - (b.r === q ? 0 : 1) || a.r.length - b.r.length;
    });
    show(hits);
  }
  input.addEventListener("input", run);
})();

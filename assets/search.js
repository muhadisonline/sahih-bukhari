var AR = "٠١٢٣٤٥٦٧٨٩";
function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function west(s) { return String(s).replace(/[٠-٩]/g, function (d) { return AR.indexOf(d); }).replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }); }
function norm(s) {
  return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ة/g, "ه").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
var BASE = "";
var BOOKS = {"buxari": "صحيح البخاري", "muslim": "صحيح مسلم", "abudawud": "سنن أبي داود", "tirmidhi": "جامع الترمذي", "nasai": "سنن النسائي", "ibnmajah": "سنن ابن ماجه", "malik": "موطأ مالك", "darimi": "سنن الدارمي", "adab": "الأدب المفرد", "riyad": "رياض الصالحين"};
var ORDER = ["muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik", "darimi", "adab", "riyad", "buxari"];
function isBook(slug) { return Object.prototype.hasOwnProperty.call(BOOKS, slug); }
var cache = {};
var box = document.getElementById("results");
var status = document.getElementById("status");
var input = document.getElementById("qq");
var bookSel = document.getElementById("book");
var run = 0;
var PAGE = 40;

function address() {
  var q = input.value;
  var slug = bookSel.value;
  return "?q=" + encodeURIComponent(q) + (slug ? "&book=" + encodeURIComponent(slug) : "");
}
function hrefOf(slug, no) {
  no = String(no);
  if (!isBook(slug) || !/^\d+$/.test(no)) return "#";
  if (slug === "buxari") return "https://buxari.sunan.online/" + no + "/";
  return (BASE || "") + "/" + slug + "/" + no + "/";
}
function load(slug) {
  if (cache[slug]) return Promise.resolve(cache[slug]);
  return fetch((BASE || "") + "/assets/ix-" + slug + ".json?v=1").then(function (r) { return r.json(); }).then(function (rows) {
    cache[slug] = rows;
    return rows;
  });
}
function hit(row, q, numeric) {
  if (numeric) return row[0] === numeric;
  return q.length >= 2 && String(row[2] || "").indexOf(q) !== -1;
}
function item(slug, row) {
  return '<li><a href="' + hrefOf(slug, row[0]) + '"><span class="hit-no">' + escHtml(BOOKS[slug] || "") + " · الحديث " + ar(row[0]) + '</span><span class="hit-k">' + escHtml(row[3] || "") + '</span><span class="hit-s">' + escHtml(row[1] || "") + "</span></a></li>";
}
function render(q) {
  var my = ++run;
  q = west(q).trim();
  box.innerHTML = "";
  if (!q) { status.textContent = ""; return; }
  var numeric = /^\d+$/.test(q) ? Number(q) : 0;
  var nq = numeric ? "" : norm(q);
  if (!numeric && nq.length < 2) { status.textContent = "اكتب حرفين على الأقل"; return; }
  var books = (bookSel.value && isBook(bookSel.value)) ? [bookSel.value] : ORDER.slice();
  var bi = 0;
  var ri = 0;
  var shown = 0;
  function more() {
    var old = box.querySelector(".more");
    if (old) old.remove();
    if (bi >= books.length) return;
    var li = document.createElement("li");
    li.className = "more";
    var b = document.createElement("button");
    b.className = "btn ghost";
    b.type = "button";
    b.textContent = "المزيد";
    b.addEventListener("click", function () { li.remove(); step(); });
    li.appendChild(b);
    box.appendChild(li);
  }
  function step() {
    if (my !== run) return;
    if (bi >= books.length) {
      status.textContent = shown ? ar(shown) + " نتيجة" : "لا يوجد حديث مطابق";
      return;
    }
    var slug = books[bi];
    status.textContent = "… " + (BOOKS[slug] || "");
    load(slug).then(function (rows) {
      if (my !== run) return;
      var html = "";
      var added = 0;
      while (ri < rows.length && added < PAGE) {
        if (hit(rows[ri], nq, numeric)) {
          html += item(slug, rows[ri]);
          added++;
          shown++;
        }
        ri++;
      }
      if (html) box.insertAdjacentHTML("beforeend", html);
      if (ri >= rows.length) { bi++; ri = 0; }
      if (added < PAGE && bi < books.length) { step(); return; }
      status.textContent = shown ? ar(shown) + " نتيجة" : "لا يوجد حديث مطابق";
      if (bi < books.length) more();
    }).catch(function () { bi++; ri = 0; step(); });
  }
  step();
}
var params = new URLSearchParams(location.search);
if (params.get("book") && isBook(params.get("book"))) bookSel.value = params.get("book");
if (params.get("q")) { input.value = params.get("q"); render(params.get("q")); }
document.getElementById("sform").addEventListener("submit", function (e) {
  e.preventDefault();
  history.replaceState(null, "", address());
  render(input.value);
});
bookSel.addEventListener("change", function () {
  history.replaceState(null, "", address());
  render(input.value);
});

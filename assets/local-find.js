(function () {
  var css = document.createElement("style");
  css.textContent = ".book-find,.page-find{margin:.9rem 0 1.1rem}.book-find input,.page-find input{width:100%;border:1px solid #e6e1d8;background:#fff;padding:.7rem .85rem;font:inherit}.book-hits a{display:block;padding:.75rem 0;border-bottom:1px solid #e6e1d8;color:inherit;text-decoration:none}.book-hits .k{display:block;color:#6e675f;font-size:.85rem}.book-hits .t{display:block;font-family:Amiri,serif;font-size:1.2rem;line-height:1.5}";
  document.head.appendChild(css);
  var AR = "٠١٢٣٤٥٦٧٨٩";
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  function west(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return String(AR.indexOf(d)); }).replace(/[۰-۹]/g, function (d) { return String(FA.indexOf(d)); });
  }
  function fold(s) {
    return String(s)
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/[^\u0621-\u064A\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
  var page = document.querySelector(".page-find");
  if (page) {
    var entries = [].slice.call(document.querySelectorAll("main .entry"));
    page.querySelector("input").addEventListener("input", function () {
      var q = fold(this.value);
      var arabic = /[\u0621-\u064A]/.test(q);
      entries.forEach(function (el) {
        el.hidden = q.length >= 2 && arabic && fold(el.textContent).indexOf(q) < 0;
      });
    });
  }
  var book = document.querySelector(".book-find");
  if (!book) return;
  var box = book.querySelector("input");
  var out = document.querySelector(".book-hits");
  var slug = book.getAttribute("data-book");
  var rows = null;
  function show(nodes, note) {
    out.hidden = false;
    out.replaceChildren();
    if (note) {
      var p = document.createElement("p");
      p.className = "meta";
      p.textContent = note;
      out.append(p);
      return;
    }
    nodes.forEach(function (h) {
      var a = document.createElement("a");
      a.href = "/sahih-bukhari/" + slug + "/" + h[0] + "/";
      var k = document.createElement("span");
      k.className = "k";
      k.textContent = "الحديث " + ar(h[0]) + (h[3] ? " · " + h[3] : "");
      var t = document.createElement("span");
      t.className = "t";
      t.textContent = h[1];
      a.append(k, t);
      out.append(a);
    });
  }
  box.addEventListener("input", function () {
    var raw = west(box.value).trim();
    var q = fold(box.value);
    if (!raw) { out.hidden = true; out.replaceChildren(); return; }
    var arabic = /[\u0621-\u064A]/.test(q);
    var number = /^\d+$/.test(raw);
    if (!arabic && !number) { show([], "اكتب بالعربية"); return; }
    if (!number && q.length < 2) { out.hidden = true; out.replaceChildren(); return; }
    function paint() {
      var hits = [];
      if (number) {
        var no = Number(raw);
        for (var i = 0; i < rows.length && hits.length < 30; i++) if (rows[i][0] === no) hits.push(rows[i]);
      } else {
        for (var j = 0; j < rows.length && hits.length < 30; j++) if (rows[j][2].indexOf(q) !== -1) hits.push(rows[j]);
      }
      if (!hits.length) show([], "لا يوجد حديث مطابق");
      else show(hits);
    }
    if (!rows) {
      show([], "…");
      fetch("/sahih-bukhari/assets/ix-" + slug + ".json").then(function (r) { return r.json(); }).then(function (data) {
        rows = data;
        paint();
      }).catch(function () { show([], "تعذر البحث"); });
      return;
    }
    paint();
  });
})();

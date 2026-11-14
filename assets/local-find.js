(function () {
  var css = document.createElement("style");
  css.textContent = ".book-find,.page-find{margin:.9rem 0 1.1rem}.book-find input,.page-find input{width:100%;border:1px solid #e6e1d8;background:#fff;padding:.7rem .85rem;font:inherit}.book-hits a{display:block;padding:.75rem 0;border-bottom:1px solid #e6e1d8;color:inherit;text-decoration:none}.book-hits .k{display:block;color:#6e675f;font-size:.85rem}.book-hits .t{display:block;font-family:Amiri,serif;font-size:1.2rem;line-height:1.5}";
  document.head.appendChild(css);
  var AR = "٠١٢٣٤٥٦٧٨٩";
  var FA = "۰۱۲۳۴۵۶۷۸۹";
  var STOP = { "بن": 1, "ابن": 1, "بنت": 1, "في": 1, "من": 1, "على": 1, "الي": 1, "عن": 1, "ان": 1, "قال": 1 };
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
  function words(s) {
    return String(s).split(" ").map(function (w) {
      return w.indexOf("ال") === 0 && w.length > 4 ? w.slice(2) : w;
    }).filter(function (w) { return w && !STOP[w]; });
  }
  function inOrder(text, qws) {
    var hw = words(text);
    var i = 0;
    for (var k = 0; k < qws.length; k++) {
      while (i < hw.length && hw[i].indexOf(qws[k]) !== 0) i++;
      if (i >= hw.length) return false;
      i++;
    }
    return true;
  }
  function allWords(text, qws) {
    if (qws.length < 2) return false;
    var hw = words(text);
    for (var k = 0; k < qws.length; k++) {
      var ok = false;
      for (var i = 0; i < hw.length; i++) if (hw[i].indexOf(qws[k]) === 0) { ok = true; break; }
      if (!ok) return false;
    }
    return true;
  }
  function rankText(text, q, qws) {
    if (text.indexOf(q) >= 0 || text.replace(/\s+/g, "").indexOf(q.replace(/\s+/g, "")) >= 0) return 0;
    if (inOrder(text, qws)) return 1;
    if (allWords(text, qws)) return 2;
    return -1;
  }
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
  var page = document.querySelector(".page-find");
  if (page) {
    var entries = [].slice.call(document.querySelectorAll("main .entry"));
    var byNo = {};
    entries.forEach(function (el) {
      var href = el.getAttribute("href") || "";
      var m = href.match(/\/(\d+)\/$/);
      if (m) byNo[Number(m[1])] = el;
    });
    var parts = location.pathname.split("/");
    var kitabAt = parts.indexOf("kitab");
    var slug = kitabAt > 0 ? parts[kitabAt - 1] : "";
    var bookRows = null;
    var loading = false;
    var latest = "";
    function squash(s) { return fold(s).replace(/ال(?=[\u0621-\u064A])/g, "").replace(/\s+/g, ""); }
    function titles(q) {
      var key = squash(q);
      var arabic = /[\u0621-\u064A]/.test(key);
      entries.forEach(function (el) {
        el.hidden = key.length >= 2 && arabic && squash(el.textContent).indexOf(key) < 0;
      });
    }
    function showAll() {
      entries.forEach(function (el) { el.hidden = false; });
      document.querySelectorAll("main h2.bab-label").forEach(function (head) { head.hidden = false; });
    }
    function applyFull(q) {
      if (q.length < 2 || !/[\u0621-\u064A]/.test(q)) { showAll(); return; }
      var qws = words(q);
      var hit = {};
      bookRows.forEach(function (row) {
        if (!byNo[row[0]]) return;
        if (rankText(row[2], q, qws) >= 0) hit[row[0]] = 1;
      });
      entries.forEach(function (el) {
        var m = (el.getAttribute("href") || "").match(/\/(\d+)\/$/);
        if (!m) return;
        el.hidden = !hit[Number(m[1])];
      });
      document.querySelectorAll("main h2.bab-label").forEach(function (head) {
        var n = head.nextElementSibling;
        var any = false;
        while (n && n.tagName !== "H2") {
          if (n.classList && n.classList.contains("entry") && !n.hidden) any = true;
          n = n.nextElementSibling;
        }
        head.hidden = !any;
      });
    }
    page.querySelector("input").addEventListener("input", function () {
      var q = fold(this.value);
      latest = q;
      if (q.length < 2 || !/[\u0621-\u064A]/.test(q)) { showAll(); return; }
      titles(q);
      if (!slug || !Object.keys(byNo).length) return;
      function go() { applyFull(latest); }
      if (bookRows) { go(); return; }
      if (loading) return;
      loading = true;
      fetch("/assets/ix-" + slug + ".json").then(function (r) { return r.json(); }).then(function (data) {
        bookRows = data;
        go();
      }).catch(function () { loading = false; });
    });
  }
  var book = document.querySelector(".book-find");
  if (!book) return;
  var box = book.querySelector("input");
  var out = document.querySelector(".book-hits");
  var bookSlug = book.getAttribute("data-book");
  var rows = null;
  var timer = 0;
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
      a.href = "/" + bookSlug + "/" + (Math.floor(Number(h[0]) / 500) * 500) + "/" + h[0] + "/";
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
  function paint(raw, q) {
    var number = /^\d+$/.test(raw);
    var hits = [];
    if (number) {
      var no = Number(raw);
      for (var i = 0; i < rows.length; i++) if (rows[i][0] === no) hits.push([0, rows[i]]);
    } else {
      var qws = words(q);
      for (var j = 0; j < rows.length; j++) {
        var s = rankText(rows[j][2], q, qws);
        if (s >= 0) hits.push([s, rows[j]]);
      }
      hits.sort(function (a, b) { return a[0] - b[0] || a[1][0] - b[1][0]; });
    }
    var list = hits.slice(0, 30).map(function (item) { return item[1]; });
    if (!list.length) show([], "لا يوجد حديث مطابق");
    else show(list);
  }
  box.addEventListener("input", function () {
    var raw = west(box.value).trim();
    var q = fold(box.value);
    clearTimeout(timer);
    if (!raw) { out.hidden = true; out.replaceChildren(); return; }
    var arabic = /[\u0621-\u064A]/.test(q);
    var number = /^\d+$/.test(raw);
    if (!arabic && !number) { show([], "اكتب بالعربية"); return; }
    if (!number && q.length < 2) { out.hidden = true; out.replaceChildren(); return; }
    timer = setTimeout(function () {
      if (!rows) {
        show([], "…");
        fetch("/assets/ix-" + bookSlug + ".json").then(function (r) { return r.json(); }).then(function (data) {
          rows = data;
          paint(west(box.value).trim(), fold(box.value));
        }).catch(function () { show([], "تعذر البحث"); });
        return;
      }
      paint(raw, q);
    }, 140);
  });
})();

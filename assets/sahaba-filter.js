(function () {
  var q = document.getElementById("rq");
  var box = document.getElementById("people");
  var more = document.getElementById("more");
  var status = document.getElementById("pstatus");
  if (!q || !box) return;
  var form = q.form || q.closest("form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  var items = [].slice.call(box.children);
  var group = "s";
  var shown = 80;
  function fold(s) {
    return s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/ة/g, "ه");
  }
  function key(s) { return fold(s).replace(/ال(?=[\u0621-\u064A])/g, "").replace(/\s+/g, ""); }
  items.forEach(function (el) { el.setAttribute("data-k", key(el.getAttribute("data-n") || "")); });
  function paint() {
    var n = key(q.value);
    var count = 0;
    items.forEach(function (el) {
      var ok = (group === "all" || el.getAttribute("data-g") === group) && (!n || (el.getAttribute("data-k") || "").indexOf(n) >= 0);
      if (ok) count++;
      el.style.display = ok && count <= shown ? "" : "none";
    });
    if (status) status.textContent = count + " اسمًا";
    if (more) more.style.display = count > shown ? "" : "none";
  }
  q.addEventListener("input", function () { shown = 80; paint(); });
  if (more) more.addEventListener("click", function () { shown += 80; paint(); });
  [].slice.call(document.querySelectorAll(".filters button")).forEach(function (btn) {
    btn.addEventListener("click", function () {
      group = btn.getAttribute("data-g");
      shown = 80;
      [].slice.call(document.querySelectorAll(".filters button")).forEach(function (b) { b.classList.toggle("on", b === btn); });
      paint();
    });
  });
  paint();
})();

(function () {
  var AR = "٠١٢٣٤٥٦٧٨٩";
  function ar(n) { return String(n).replace(/\d/g, function (d) { return AR[d]; }); }
  var now = new Date();
  var start = Date.UTC(now.getFullYear(), 0, 1);
  var day = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - start) / 86400000);
  fetch("/assets/daily.json").then(function (r) { return r.json(); }).then(function (rows) {
    if (!rows.length) return;
    var h = rows[day % rows.length];
    var slug = String(h[0] || "");
    var no = String(h[1] || "");
    if (!/^[a-z]+$/.test(slug) || !/^\d+$/.test(no)) return;
    var a = document.getElementById("daily");
    if (a) a.href = "/" + slug + "/" + no + "/";
    var text = document.getElementById("daily-text");
    if (text) text.textContent = h[2];
    var meta = document.getElementById("daily-meta");
    if (meta) meta.textContent = h[3] + " · الحديث " + ar(h[1]);
  });
})();

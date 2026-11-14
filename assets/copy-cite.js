(function () {
  var btn = document.getElementById("copy");
  if (!btn) return;

  function hadithText(el) {
    if (!el) return "";
    var isnad = el.querySelector(".isnad");
    var full = (el.textContent || "").replace(/\u00a0/g, " ");
    if (!isnad) return full.trim();
    var chain = (isnad.textContent || "").replace(/\u00a0/g, " ");
    var rest = full.indexOf(chain) === 0 ? full.slice(chain.length) : full;
    return chain.trim() + "\n\n" + rest.trim();
  }

  btn.addEventListener("click", function () {
    var matn = document.getElementById("matn");
    var text = (btn.getAttribute("data-cite") || "") + "\n" + (btn.getAttribute("data-url") || "") + "\n\n" + hadithText(matn);
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = "تم النسخ";
      setTimeout(function () { btn.textContent = "انسخ المتن"; }, 1600);
    });
  });
})();

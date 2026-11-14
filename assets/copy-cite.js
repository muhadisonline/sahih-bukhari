(function () {
  var btn = document.getElementById("copy");
  if (!btn) return;
  btn.addEventListener("click", function () {
    var matn = document.getElementById("matn");
    var text = (btn.getAttribute("data-cite") || "") + "\n" + (btn.getAttribute("data-url") || "") + "\n\n" + (matn ? matn.innerText : "");
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = "تم النسخ";
      setTimeout(function () { btn.textContent = "انسخ المتن"; }, 1600);
    });
  });
})();

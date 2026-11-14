(function () {
  var key = "bukhari-size";
  function get() {
    var n = Number(localStorage.getItem(key) || "0");
    return n >= 0 && n <= 3 ? n : 0;
  }
  function apply(n) {
    document.documentElement.setAttribute("data-size", String(n));
    localStorage.setItem(key, String(n));
  }
  var gear = document.getElementById("gear");
  var panel = document.getElementById("set-panel");
  if (!gear || !panel) return;
  gear.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = panel.style.display === "none";
    panel.style.display = open ? "flex" : "none";
    gear.setAttribute("aria-expanded", open ? "true" : "false");
  });
  document.addEventListener("click", function () {
    panel.style.display = "none";
    gear.setAttribute("aria-expanded", "false");
  });
  panel.addEventListener("click", function (e) { e.stopPropagation(); });
  var down = document.getElementById("size-down");
  var up = document.getElementById("size-up");
  if (down) down.addEventListener("click", function () { apply(Math.max(0, get() - 1)); });
  if (up) up.addEventListener("click", function () { apply(Math.min(3, get() + 1)); });
})();

try {
  var n = localStorage.getItem("bukhari-size");
  if (n) document.documentElement.setAttribute("data-size", n);
} catch (e) {}

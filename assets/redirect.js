(function () {
  var meta = document.querySelector('meta[http-equiv="refresh" i]');
  if (!meta) return;
  var content = meta.getAttribute("content") || "";
  var match = content.match(/url\s*=\s*(.+)/i);
  if (match) location.replace(match[1].trim());
})();

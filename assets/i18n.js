/* Language support (Persian / English) shared by every page.
   - Load in <head> (synchronously) so text direction is set before the page paints.
   - Static markup keeps Persian text and carries English in data-en / data-en-<attr> attributes.
   - Scripts use tr("فارسی", "English") or I18N.num(), I18N.date().
   - Switching language saves the choice and reloads the page. */
(function (root) {
  "use strict";
  var KEY = "mdsa.lang";
  var lang = "fa";
  try { var saved = root.localStorage && root.localStorage.getItem(KEY); if (saved === "en" || saved === "fa") lang = saved; } catch (e) { }
  if (root.MDSA_LANG === "en" || root.MDSA_LANG === "fa") lang = root.MDSA_LANG;
  var I = {
    lang: lang,
    dir: lang === "fa" ? "rtl" : "ltr",
    isFa: lang === "fa",
    T: function (fa, en) { return lang === "en" && en !== undefined ? en : fa; },
    num: function (n, opts) { try { return new Intl.NumberFormat(lang === "fa" ? "fa-IR" : "en-US", opts).format(n); } catch (e) { return String(n); } },
    digits: function (s) { s = String(s); return lang === "fa" ? s.replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; }) : s; },
    date: function (d, opts) { try { return new Date(d).toLocaleDateString(lang === "fa" ? "fa-IR" : "en-US", opts); } catch (e) { return ""; } },
    set: function (l) {
      if (l !== "fa" && l !== "en") return;
      try { root.localStorage.setItem(KEY, l); } catch (e) { }
      root.location.reload();
    },
    /* Replace static Persian markup with English when needed. */
    apply: function (scope) {
      if (typeof document === "undefined") return;
      scope = scope || document;
      if (lang === "en") {
        var els = scope.querySelectorAll("[data-en],[data-en-html]");
        for (var i = 0; i < els.length; i++) {
          var el = els[i];
          if (el.hasAttribute("data-en-html")) el.innerHTML = el.getAttribute("data-en-html");
          else el.textContent = el.getAttribute("data-en");
        }
        var all = scope.querySelectorAll("*");
        for (var j = 0; j < all.length; j++) {
          var attrs = all[j].attributes;
          for (var k = 0; k < attrs.length; k++) {
            var a = attrs[k].name;
            if (a.indexOf("data-en-") === 0 && a !== "data-en-html") all[j].setAttribute(a.slice(8), attrs[k].value);
          }
        }
        var t = document.querySelector("title[data-en]");
        if (t) document.title = t.getAttribute("data-en");
      }
      document.documentElement.classList.remove("i18n-pending");
    },
    /* A compact language switch button (shows the other language). */
    toggle: function () {
      var b = document.createElement("button");
      b.type = "button"; b.className = "lang-btn";
      b.textContent = lang === "fa" ? "EN" : "فا";
      b.title = lang === "fa" ? "English" : "فارسی";
      b.setAttribute("aria-label", lang === "fa" ? "Switch to English" : "تغییر زبان به فارسی");
      b.addEventListener("click", function () { I.set(lang === "fa" ? "en" : "fa"); });
      return b;
    },
  };
  root.I18N = I;
  root.tr = I.T;
  if (typeof document !== "undefined") {
    var h = document.documentElement;
    h.lang = lang; h.dir = I.dir; h.classList.add("i18n-pending", "lang-" + lang);
    document.addEventListener("DOMContentLoaded", function () {
      I.apply();
      var slot = document.querySelector("[data-lang-slot]");
      if (slot && !slot.querySelector(".lang-btn")) slot.insertBefore(I.toggle(), slot.firstChild);
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this);

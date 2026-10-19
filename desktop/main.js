/* Desktop app (Electron) for macOS and Windows.
   Serves the web app from a private, stable origin (app://academy) so browser storage persists
   between launches, stores progress in the user's app-data folder, and opens external links
   in the default browser. */
"use strict";
const { app, BrowserWindow, Menu, protocol, shell, nativeTheme, dialog } = require("electron");
const path = require("path");
const { createHandler } = require("./serve");

const SCHEME = "app", HOST = "academy", ORIGIN = SCHEME + "://" + HOST;
protocol.registerSchemesAsPrivileged([{ scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, codeCache: true } }]);

if (!app.requestSingleInstanceLock()) { app.quit(); }
let win = null;
app.on("second-instance", () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

function isInternal(url) { return url.startsWith(ORIGIN + "/"); }

function createWindow() {
  nativeTheme.themeSource = "dark";
  win = new BrowserWindow({
    width: 1360, height: 900, minWidth: 380, minHeight: 500,
    backgroundColor: "#050b14", title: "آکادمی ریاضی و علم داده",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    autoHideMenuBar: process.platform !== "darwin",
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  win.once("ready-to-show", () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternal(url)) return { action: "allow" };
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!isInternal(url)) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); }
  });
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript("(window.I18N && I18N.lang) || 'fa'").then(buildMenu).catch(() => { });
  });
  win.loadURL(ORIGIN + "/index.html");
}

/* The menu follows the language chosen inside the app (saved in the page's storage as mdsa.lang). */
let menuLang = null;
const M = {
  fa: { file: "پرونده", home: "خانه", learn: "مسیر یادگیری", review: "مرور روزانه", solver: "حل‌گر گام‌به‌گام", tools: "ابزارهای تعاملی", python: "دفترچهٔ پایتون", progress: "پیشرفت و پشتیبان‌گیری", close: "بستن پنجره", quit: "خروج",
    edit: "ویرایش", undo: "برگرداندن", redo: "انجام دوباره", cut: "برش", copy: "کپی", paste: "چسباندن", selectAll: "انتخاب همه",
    view: "نما", reload: "بارگذاری دوباره", resetZoom: "اندازهٔ اصلی", zoomIn: "بزرگ‌نمایی", zoomOut: "کوچک‌نمایی", full: "تمام‌صفحه", dev: "ابزار توسعه‌دهنده", lang: "English",
    window: "پنجره", help: "راهنما", about: "دربارهٔ برنامه", author: "توسعه‌دهنده: ابراهیم سلیمی", rights: "تمامی حقوق نشر و استفادهٔ این نرم‌افزار محفوظ است و انتشار این نرم‌افزار بدون اطلاع سازنده پیگرد قانونی دارد.", github: "صفحهٔ پروژه در GitHub", dataDir: "پوشهٔ ذخیرهٔ پیشرفت", title: "آکادمی ریاضی و علم داده" },
  en: { file: "File", home: "Home", learn: "Learning path", review: "Daily review", solver: "Step-by-step solver", tools: "Interactive tools", python: "Python notebook", progress: "Progress and backup", close: "Close window", quit: "Quit",
    edit: "Edit", undo: "Undo", redo: "Redo", cut: "Cut", copy: "Copy", paste: "Paste", selectAll: "Select all",
    view: "View", reload: "Reload", resetZoom: "Actual size", zoomIn: "Zoom in", zoomOut: "Zoom out", full: "Full screen", dev: "Developer tools", lang: "فارسی",
    window: "Window", help: "Help", about: "About", author: "Developer: Ebrahim Salimi", rights: "All publication and usage rights of this software are reserved. Publishing this software without the developer's knowledge is subject to legal action.", github: "Project page on GitHub", dataDir: "Progress data folder", title: "Math & Data Science Academy" },
};
function buildMenu(lang) {
  lang = lang === "en" ? "en" : "fa";
  if (lang === menuLang) return;
  menuLang = lang;
  const t = M[lang], isMac = process.platform === "darwin";
  const go = p => () => win && win.loadURL(ORIGIN + "/" + p);
  const setLang = () => win && win.webContents.executeJavaScript("window.I18N && I18N.set(" + JSON.stringify(lang === "fa" ? "en" : "fa") + ")").catch(() => { });
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    { label: t.file, submenu: [{ label: t.home, accelerator: "CmdOrCtrl+H", click: go("index.html") }, { label: t.learn, accelerator: "CmdOrCtrl+L", click: go("index.html#learn") }, { label: t.review, click: go("index.html#review") },
      { label: t.solver, accelerator: "CmdOrCtrl+K", click: go("solver.html") }, { label: t.tools, click: go("math-tools.html") }, { label: t.python, click: go("python.html") }, { label: t.progress, click: go("index.html#progress") },
      { type: "separator" }, isMac ? { role: "close", label: t.close } : { role: "quit", label: t.quit }] },
    { label: t.edit, submenu: [{ role: "undo", label: t.undo }, { role: "redo", label: t.redo }, { type: "separator" }, { role: "cut", label: t.cut }, { role: "copy", label: t.copy }, { role: "paste", label: t.paste }, { role: "selectAll", label: t.selectAll }] },
    { label: t.view, submenu: [{ label: t.lang, click: setLang }, { type: "separator" }, { role: "reload", label: t.reload }, { type: "separator" }, { role: "resetZoom", label: t.resetZoom }, { role: "zoomIn", label: t.zoomIn }, { role: "zoomOut", label: t.zoomOut }, { type: "separator" }, { role: "togglefullscreen", label: t.full }, { role: "toggleDevTools", label: t.dev }] },
    { role: "windowMenu", label: t.window },
    { label: t.help, submenu: [{ label: t.about, click: () => dialog.showMessageBox(win, { type: "info", title: t.about, message: t.title + "  " + app.getVersion(), detail: t.author + "\n\n© " + new Date().getFullYear() + " — " + t.rights }) }, { type: "separator" }, { label: t.github, click: () => shell.openExternal("https://github.com/ebixs/math-data-science-academy") }, { label: t.dataDir, click: () => shell.openPath(app.getPath("userData")) }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  if (app.setAboutPanelOptions) app.setAboutPanelOptions({ applicationName: t.title, applicationVersion: app.getVersion(), copyright: "© " + new Date().getFullYear() + " " + t.author + "\n" + t.rights, authors: ["Ebrahim Salimi"] });
  if (win) win.setTitle(t.title);
}

app.whenReady().then(() => {
  const handle = createHandler({ root: path.join(__dirname, ".."), dataDir: app.getPath("userData") });
  protocol.handle(SCHEME, async (request) => {
    const url = new URL(request.url);
    if (url.host !== HOST) return new Response("Not found", { status: 404 });
    const body = request.method === "POST" ? Buffer.from(await request.arrayBuffer()) : null;
    const r = await handle({ method: request.method, pathname: url.pathname, body });
    return new Response(r.body, { status: r.status, headers: r.headers });
  });
  buildMenu("fa");
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

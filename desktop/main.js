/* Desktop app (Electron) for macOS and Windows.
   Serves the web app from a private, stable origin (app://academy) so browser storage persists
   between launches, stores progress in the user's app-data folder, and opens external links
   in the default browser. */
"use strict";
const { app, BrowserWindow, Menu, protocol, shell, nativeTheme } = require("electron");
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
  win.loadURL(ORIGIN + "/index.html");
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const go = p => () => win && win.loadURL(ORIGIN + "/" + p);
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    { label: "پرونده", submenu: [{ label: "خانه", accelerator: "CmdOrCtrl+H", click: go("index.html") }, { label: "حل‌گر گام‌به‌گام", accelerator: "CmdOrCtrl+K", click: go("solver.html") }, { label: "ابزارهای تعاملی", click: go("math-tools.html") }, { label: "دفترچهٔ پایتون", click: go("python.html") }, { type: "separator" }, isMac ? { role: "close", label: "بستن پنجره" } : { role: "quit", label: "خروج" }] },
    { label: "ویرایش", submenu: [{ role: "undo", label: "برگرداندن" }, { role: "redo", label: "انجام دوباره" }, { type: "separator" }, { role: "cut", label: "برش" }, { role: "copy", label: "کپی" }, { role: "paste", label: "چسباندن" }, { role: "selectAll", label: "انتخاب همه" }] },
    { label: "نما", submenu: [{ role: "reload", label: "بارگذاری دوباره" }, { type: "separator" }, { role: "resetZoom", label: "اندازهٔ اصلی" }, { role: "zoomIn", label: "بزرگ‌نمایی" }, { role: "zoomOut", label: "کوچک‌نمایی" }, { type: "separator" }, { role: "togglefullscreen", label: "تمام‌صفحه" }, { role: "toggleDevTools", label: "ابزار توسعه‌دهنده" }] },
    { role: "windowMenu", label: "پنجره" },
    { label: "راهنما", submenu: [{ label: "صفحهٔ پروژه در GitHub", click: () => shell.openExternal("https://github.com/ebixs/math-data-science-academy") }, { label: "پوشهٔ ذخیرهٔ پیشرفت", click: () => shell.openPath(app.getPath("userData")) }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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
  buildMenu();
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

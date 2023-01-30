import { app, BrowserView, BrowserWindow } from "electron";
import { join } from "node:path";
import { URL } from "node:url";

const TOP_BAR_HEIGHT = 73;

export let chrome: BrowserView | undefined;
export let webpage: BrowserView | undefined;
export let mainWindow: BrowserWindow | undefined;

async function createWindow() {
  mainWindow = new BrowserWindow({
    show: true,
    frame: false,
    width: 400,
    height: 600,
    minWidth: 400,
    minHeight: 400,

    // closable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    // alwaysOnTop: true,
  });

  createChrome();
  createWebpage();

  return mainWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}

function createChrome() {
  /**
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL("../renderer/dist/index.html", "file://" + __dirname).toString();

  chrome = new BrowserView({
    webPreferences: {
      preload: join(app.getAppPath(), "packages/preload/dist/index.cjs"),
      sandbox: false,
    },
  });
  mainWindow?.addBrowserView(chrome);

  function setSize() {
    if (!chrome) return;

    chrome.setBounds({
      x: 0,
      y: 0,
      width: mainWindow?.getContentBounds().width ?? 0,
      height: mainWindow?.getContentBounds().height ?? 0,
    });
  }

  setSize();
  autoResize(setSize);

  chrome.webContents.loadURL(pageUrl);
  chrome.webContents.on("dom-ready", () => {
    if (!chrome) return;

    // mainWindow?.setTopBrowserView(chrome);
    mainWindow?.show();

    webpage!.webContents.on("will-navigate", (_, url) => {
      console.log("will-navigate");
      chrome!.webContents.send("URL_CHANGED", url);
    });

    webpage!.webContents.on("did-navigate-in-page", (_, url) => {
      console.log("did-navigate-in-page");
      chrome!.webContents.send("URL_CHANGED", url);
    });
  });

  chrome.webContents.openDevTools({ mode: "detach" });
}

function createWebpage() {
  webpage = new BrowserView({
    webPreferences: {
      scrollBounce: true,
      backgroundThrottling: false,
    },
  });
  mainWindow?.addBrowserView(webpage);

  function setSize() {
    if (!mainWindow) return;

    webpage?.setBounds({
      x: 0,
      y: TOP_BAR_HEIGHT,
      width: mainWindow.getContentBounds().width,
      height: mainWindow.getContentBounds().height - TOP_BAR_HEIGHT,
    });
  }

  setSize();
  autoResize(setSize);

  webpage.setBackgroundColor("#ffffff");
  webpage.webContents.loadURL("https://github.com", {
    userAgent:
      "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36",
  });
}

function autoResize(onResize: () => void) {
  let lastHandle: NodeJS.Timeout;
  function handleWindowResize(e: any) {
    e.preventDefault();

    // the setTimeout is necessary because it runs after the event listener is handled
    lastHandle = setTimeout(() => {
      if (lastHandle != null) clearTimeout(lastHandle);
      if (mainWindow) onResize();
    });
  }

  mainWindow?.on("resize", handleWindowResize);
}

export function minimizeChrome() {
  if (!chrome) return;
  if (!webpage) return;

  mainWindow?.setTopBrowserView(webpage);
}

export function maximizeChrome() {
  if (!chrome) return;
  if (!webpage) return;

  mainWindow?.setTopBrowserView(chrome);
}

export function focusWebpage() {
  webpage?.webContents.focus();
}

export function focusChrome() {
  chrome?.webContents.focus();
}

import { app, BrowserView, BrowserWindow, globalShortcut } from "electron";
import { join } from "node:path";
import { URL } from "node:url";
import { registerHotkeys, unregisterHotkeys } from "./hotkeys";
import { tabs } from "./tabs";

export let chrome: BrowserView | undefined;
export let mainWindow: BrowserWindow | undefined;

const isDev = import.meta.env.DEV;

export async function createMainWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    frame: false,
    type: "panel",

    width: 400,
    height: 600,
    minWidth: 400,
    minHeight: 400,
    skipTaskbar: true,
    closable: isDev,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
  });

  mainWindow.removeMenu();

  mainWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });

  mainWindow.on("focus", registerHotkeys);
  mainWindow.on("blur", unregisterHotkeys);

  globalShortcut.register("CmdOrCtrl+Shift+M", toggleWindow);

  unpinWindow();
  createChrome();

  return mainWindow;
}

export function showWindow() {
  /**
   * This is a workaround for a bug where an old frame (from when the window was
   * hidden using window.hide()) is visible for a split second before showing
   * the correct frame.
   */
  chrome?.webContents.incrementCapturerCount();

  mainWindow?.showInactive();
  mainWindow?.focus();
  mainWindow?.setAlwaysOnTop(true);
}

function toggleWindow() {
  if (mainWindow?.isFocused()) hideWindow();
  else showWindow();
}

export function hideWindow() {
  mainWindow?.hide();
}

export function pinWindow() {
  mainWindow?.removeListener("blur", hideWindow);
}

export function unpinWindow() {
  mainWindow?.addListener("blur", hideWindow);
}

function createChrome() {
  /**
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    isDev && import.meta.env.VITE_DEV_SERVER_URL !== undefined
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
  chrome.webContents.openDevTools({ mode: "detach" });
}

export function autoResize(onResize: () => void) {
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

export function minimizeChrome() {}

export function maximizeChrome() {
  if (!chrome) return;

  mainWindow?.setTopBrowserView(chrome);
}

export function focusWebpage(tabId: string) {
  const browserView = tabs.get(tabId);

  if (!browserView) return;

  mainWindow?.setTopBrowserView(browserView);
  browserView.webContents.focus();
}

export function focusChrome() {
  chrome?.webContents.focus();
}

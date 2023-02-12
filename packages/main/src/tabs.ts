import { BrowserView, ipcMain } from "electron";
import { MOBILE_UA, TOP_BAR_HEIGHT } from "./constants";
import { autoResize, chrome, mainWindow } from "./mainWindow";

export type Tab = {
  id: string;
  url?: string;
  title?: string;
  isPinned?: boolean;
};

export const tabs = new Map<string, BrowserView>();

export function resetTabs(newTabs: Tab[]) {
  tabs.forEach((_, tabId) => destroyTab(tabId));
  tabs.clear();

  newTabs.forEach((t) => createTab(t));
}

export async function createTab(tab: Tab) {
  const browserView = new BrowserView({
    webPreferences: {
      scrollBounce: true,
    },
  });

  mainWindow?.addBrowserView(browserView);

  function setSize() {
    if (!mainWindow) return;

    browserView?.setBounds({
      x: 0,
      y: TOP_BAR_HEIGHT,
      width: mainWindow.getContentBounds().width,
      height: mainWindow.getContentBounds().height - TOP_BAR_HEIGHT,
    });
  }

  mainWindow?.setTopBrowserView(browserView);

  setSize();
  autoResize(setSize);

  browserView.webContents.on("will-navigate", (_, url) => {
    console.log("will-navigate");
    chrome?.webContents.send("URL_UPDATED", tab.id, url);
  });

  browserView.webContents.on("did-navigate-in-page", (_, url) => {
    console.log("did-navigate-in-page");
    chrome?.webContents.send("URL_UPDATED", tab.id, url);
  });

  browserView.webContents.on("page-favicon-updated", (_, urls) => {
    console.log("page-favicon-updated");
    chrome?.webContents.send("FAVICON_UPDATED", tab.id, urls);
  });

  browserView.webContents.on("page-title-updated", (_, title) => {
    console.log("page-title-updated");
    chrome?.webContents.send("TITLE_UPDATED", tab.id, title);
  });

  browserView.setBackgroundColor("#ffffff");

  if (tab?.url) {
    browserView.webContents.loadURL(tab.url, {
      userAgent: MOBILE_UA,
    });
  }

  tabs.set(tab.id, browserView);
}

export function destroyTab(id: string) {
  const browserView = tabs.get(id);

  if (!browserView) return;

  mainWindow?.removeBrowserView(browserView);
  (browserView.webContents as any).destroy(); // https://github.com/electron/electron/issues/10096#issuecomment-774505246
  tabs.delete(id);
}

/**
 * Navigate tab to a new URL. Also updates tab metadata with the new URL.
 */
export function navigateTab(id: string, url: string) {
  const browserView = tabs.get(id);

  if (!browserView) return;

  browserView.webContents.loadURL(url, {
    userAgent: MOBILE_UA,
  });
}

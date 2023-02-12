import { ipcMain } from "electron";
import { URL } from "node:url";
import { minimizeChrome, maximizeChrome, focusWebpage, focusChrome, chrome } from "./mainWindow";
import { createTab, destroyTab, tabs, navigateTab, Tab, resetTabs } from "./tabs";

[
  function handleUpdateUrl() {
    ipcMain.on("UPDATE_URL", (_, tabId: string, url: string) => {
      const browserView = tabs.get(tabId);

      if (!browserView) return;

      let fullUrl;
      try {
        fullUrl = new URL(url);

        if (!fullUrl.hostname) {
          // cases where the hostname was not identified
          // ex: user:password@www.example.com, example.com:8000
          fullUrl = new URL("https://" + url);
        }
      } catch (error) {
        fullUrl = new URL("https://" + url);
      }

      const fullUrlString = fullUrl.toString();

      navigateTab(tabId, fullUrlString);
      chrome?.webContents.send("URL_UPDATED", tabId, fullUrlString);
    });
  },

  function handleMinimizeChrome() {
    ipcMain.on("MINIMIZE_CHROME", () => minimizeChrome());
  },

  function handleMaximizeChrome() {
    ipcMain.on("MAXIMIZE_CHROME", () => maximizeChrome());
  },

  function handleFocusChrome() {
    ipcMain.on("FOCUS_CHROME", () => focusChrome());
  },

  function handleFocusWebpage() {
    ipcMain.on("FOCUS_WEBPAGE", (_, tabId: string) => focusWebpage(tabId));
  },

  function handleResetTabs() {
    ipcMain.on("RESET_TABS", (_, tabs: Tab[]) => {
      resetTabs(tabs);
    });
  },

  function handleCreateTab() {
    ipcMain.on("CREATE_TAB", (_, tab: Tab) => {
      createTab(tab);
    });
  },

  function handleDestroyTab() {
    ipcMain.on("DESTROY_TAB", (_, tabId: string) => {
      destroyTab(tabId);
    });
  },

  function handleNavigateTab() {
    ipcMain.on("NAVIGATE_TAB", (_, tabId: string, url: string) => {
      navigateTab(tabId, url);
    });
  },

  function goBack() {
    ipcMain.on("GO_BACK", (_, tabId: string) => {
      tabs.get(tabId)?.webContents.goBack();
    });
  },

  function goForward() {
    ipcMain.on("GO_FORWARD", (_, tabId: string) => {
      tabs.get(tabId)?.webContents.goForward();
    });
  },

  function reloadPage() {
    ipcMain.on("RELOAD_PAGE", (_, tabId: string) => {
      tabs.get(tabId)?.webContents.reload();
    });
  },
].forEach((f) => f());

import { ipcRenderer } from "electron";

export { versions } from "./versions";

export const electronApi = {
  subscribeToHotkeys(callback: (command: string) => void) {
    ipcRenderer.on("HOTKEY", (_, command: string) => callback(command));
  },

  subscribeToTabChanges(
    callback: (tab: { id: string; url?: string; title?: string; favicons?: string[] }) => void
  ) {
    ipcRenderer.on("URL_UPDATED", (_, tabId, url) => callback({ id: tabId, url }));
    ipcRenderer.on("TITLE_UPDATED", (_, tabId, title) => callback({ id: tabId, title }));
    ipcRenderer.on("FAVICON_UPDATED", (_, tabId, favicons) => callback({ id: tabId, favicons }));
  },

  updateUrl(tabId: string, url: string) {
    ipcRenderer.send("UPDATE_URL", tabId, url);
  },

  minimizeChrome() {
    ipcRenderer.send("MINIMIZE_CHROME");
  },

  maximizeChrome() {
    ipcRenderer.send("MAXIMIZE_CHROME");
  },

  focusChrome() {
    ipcRenderer.send("FOCUS_CHROME");
  },

  focusWebpage(tabId: string) {
    ipcRenderer.send("FOCUS_WEBPAGE", tabId);
  },

  resetTabs(tabs: any) {
    ipcRenderer.send("RESET_TABS", tabs);
  },

  createTab(tab: any) {
    ipcRenderer.send("CREATE_TAB", tab);
  },

  destroyTab(tabId: string) {
    ipcRenderer.send("DESTROY_TAB", tabId);
  },

  goBack(tabId: string) {
    ipcRenderer.send("GO_BACK", tabId);
  },

  goForward(tabId: string) {
    ipcRenderer.send("GO_FORWARD", tabId);
  },

  reloadPage(tabId: string) {
    ipcRenderer.send("RELOAD_PAGE", tabId);
  },
};

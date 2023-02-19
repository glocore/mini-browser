import { ipcRenderer } from "electron";

export { versions } from "./versions";

export const electronApi = {
  isMac: process.platform === "darwin",
  isWindows: process.platform === "win32",
  isLinux: process.platform === "linux",

  getWindowPinStatus() {
    return ipcRenderer.invoke("WINDOW_PIN_STATUS") as Promise<boolean>;
  },

  pinWindow() {
    ipcRenderer.send("PIN_WINDOW");
  },

  unpinWindow() {
    ipcRenderer.send("UNPIN_WINDOW");
  },

  subscribeToWindowFocus(callback: (isFocused: boolean) => void) {
    const handler = (_: unknown, isFocused: boolean) => callback(isFocused);

    ipcRenderer.on("WINDOW_FOCUS_CHANGE", handler);

    return () => {
      ipcRenderer.removeListener("WINDOW_FOCUS_CHANGE", handler);
    };
  },

  subscribeToHotkeys(callback: (command: string, ...args: any[]) => void) {
    const handler = (_: unknown, command: string, ...args: any[]) => callback(command, ...args);

    ipcRenderer.on("HOTKEY", handler);

    return () => {
      ipcRenderer.removeListener("HOTKEY", handler);
    };
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

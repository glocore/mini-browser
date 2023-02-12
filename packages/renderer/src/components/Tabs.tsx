import { electronApi } from "#preload";
import cx from "classnames";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef } from "react";
import { HiX } from "react-icons/hi";
import { MdClose } from "react-icons/md";
import { proxy, snapshot, useSnapshot } from "valtio";
import { Button } from "./Button";

type Tab = {
  id: string;
  url?: string;
  title?: string;
  favicons?: string[];
  isPinned?: boolean;
};

export const tabStore = proxy<{ tabs: Tab[]; activeTab?: string }>({
  tabs: [],
});

electronApi.subscribeToTabChanges(({ id, url, title, favicons }) => {
  const tabIndex = tabStore.tabs.findIndex((t) => t.id === id);

  if (tabIndex < 0) return;

  const tab = tabStore.tabs[tabIndex];
  tabStore.tabs[tabIndex] = {
    ...tab,
    url: url ?? tab.url,
    title: title ?? tab.title,
    favicons: favicons ?? tab.favicons,
  };
});

export function Tabs() {
  const { tabs, activeTab } = useSnapshot(tabStore);

  return (
    <div className="flex h-full">
      {tabs.map((t) => (
        <TabButton key={t.id} tab={t as any} isActiveTab={t.id === activeTab} />
      ))}
    </div>
  );
}

function TabButton({ tab, isActiveTab }: { tab: Tab; isActiveTab: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ inline: "nearest" });
  }, [isActiveTab]);

  const handleTabClick = useCallback(
    (tabId: string) => {
      if (isActiveTab) return;

      focusTab(tabId);
    },
    [isActiveTab]
  );

  const handleCloseClick = useCallback((e: any) => {
    e.stopPropagation();
    destroyTab(tab.id);
  }, []);

  return (
    <div ref={ref}>
      <div
        onClick={() => handleTabClick(tab.id)}
        title={tab.title ?? tab.url ?? "New Tab"}
        className={cx("no-drag h-full w-[120px] pl-2 pr-1 flex items-center select-none", {
          "bg-white": isActiveTab,
        })}
      >
        <div className="mr-1 w-3 h-3">
          {tab.favicons?.[0] ? <img src={tab.favicons?.[0]} className="w-full h-full" /> : null}
        </div>
        <span className="min-w-0 text-xs truncate flex-1">{tab.title ?? tab.url ?? "New Tab"}</span>
        <Button onClick={handleCloseClick} className="p-1 rounded hover:bg-gray-200">
          <HiX size={12} />
        </Button>
      </div>
    </div>
  );
}

export function resetTabs() {
  const id = nanoid();

  tabStore.tabs = [{ id }];
  tabStore.activeTab = id;
  electronApi.resetTabs(snapshot(tabStore.tabs));
}

export function createTab() {
  const id = nanoid();
  const tab = { id };

  tabStore.tabs.push(tab);
  tabStore.activeTab = id;

  electronApi.createTab(tab);
}

function focusTab(id: string) {
  electronApi.focusWebpage(id);
  tabStore.activeTab = id;
}

function destroyTab(tabId: string) {
  const tabIndex = tabStore.tabs.findIndex((t) => t.id === tabId);
  const tabBefore = tabStore.tabs[tabIndex - 1];
  const tabAfter = tabStore.tabs[tabIndex + 1];
  const isActiveTab = tabId === tabStore.activeTab;

  electronApi.destroyTab(tabId);
  tabStore.tabs = tabStore.tabs.filter((t) => t.id !== tabId);

  if (!isActiveTab) {
    return;
  }

  if (tabBefore) {
    focusTab(tabBefore.id);
    return;
  }

  if (tabAfter) {
    focusTab(tabAfter.id);
    return;
  }

  /** Single remaining tab */
  delete tabStore.activeTab;
}

export function getActiveTab() {
  const { activeTab, tabs } = snapshot(tabStore);

  return tabs.find((t) => t.id === activeTab);
}

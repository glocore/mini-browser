import { electronApi } from "#preload";
import cx from "classnames";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { BiPlanet } from "react-icons/bi";
import { HiX } from "react-icons/hi";
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

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    function handler() {
      const element = wrapperRef.current;

      if (!element) return;

      const _canScrollLeft = element.scrollLeft > 0;
      const _canScrollRight = element.scrollLeft + element.clientWidth < element.scrollWidth;

      if (_canScrollLeft) setCanScrollLeft(true);
      else setCanScrollLeft(false);

      if (_canScrollRight) setCanScrollRight(true);
      else setCanScrollRight(false);
    }

    wrapperRef.current?.addEventListener("scroll", handler);

    const ro = new ResizeObserver(handler);
    ro.observe(wrapperRef.current!);

    return () => {
      wrapperRef.current?.removeEventListener("scroll", handler);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="min-w-0 h-full relative">
      <div className="tablist w-full h-full" ref={wrapperRef} id="tabs-wrapper">
        <div className="flex h-full">
          {tabs.map((t) => (
            <TabButton key={t.id} tab={t as any} isActiveTab={t.id === activeTab} />
          ))}
        </div>
      </div>

      <div
        className={cx("absolute top-0 left-0 w-full h-full pointer-events-none transition-shadow", {
          "tablist-left-shadow": canScrollLeft && !canScrollRight,
          "tablist-right-shadow": !canScrollLeft && canScrollRight,
          "tablist-left-right-shadow": canScrollLeft && canScrollRight,
        })}
      />
    </div>
  );
}

function TabButton({ tab, isActiveTab }: { tab: Tab; isActiveTab: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActiveTab) return;
    if (!ref.current) return;
    ref.current?.scrollIntoView({ behavior: "smooth", inline: "nearest" });
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

  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    /** The last image in the favicons list are typically higher-res. */
    setFavicon(tab.favicons?.at(-1) ?? null);
  }, [tab.favicons]);

  return (
    <div ref={ref}>
      <div
        onClick={() => handleTabClick(tab.id)}
        title={tab.title ?? tab.url ?? "New Tab"}
        className={cx("no-drag h-full w-[120px] pl-2 pr-1 flex items-center select-none", {
          "bg-white": isActiveTab,
        })}
      >
        <div className="mr-1">
          {favicon ? (
            <img src={favicon} onError={() => setFavicon(null)} className="w-4 h-4" />
          ) : (
            <BiPlanet size={16} className="mt-[1px]" />
          )}
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
  document.getElementById("addressbar")?.focus();
}

export function createTab() {
  const id = nanoid();
  const tab = { id };

  tabStore.tabs.push(tab);
  tabStore.activeTab = id;

  electronApi.createTab(tab);
  document.getElementById("addressbar")?.focus();
}

function focusTab(id: string) {
  electronApi.focusWebpage(id);
  tabStore.activeTab = id;
}

export function destroyTab(tabId: string) {
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

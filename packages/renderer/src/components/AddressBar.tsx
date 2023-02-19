import { electronApi } from "#preload";
import { useCallback, useEffect, useRef, useState } from "react";
import { snapshot, useSnapshot } from "valtio";
import { tabStore } from "./Tabs";

export type AddressBarProps = {
  onFocus?: () => void;
  onBlur?: () => void;
};

export function AddressBar(props: AddressBarProps) {
  const addressBarRef = useRef<HTMLInputElement>(null);

  const { tabs, activeTab: activeTabId } = useSnapshot(tabStore);
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const activeTabUrl = activeTab?.url;

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (document.activeElement === addressBarRef.current) return;

    setInputValue(activeTabUrl ?? "");
  }, [activeTabUrl]);

  const handleAddressBarFocus = useCallback(() => {
    props.onFocus?.();

    setTimeout(() => {
      addressBarRef.current?.select();
    });
  }, [props.onFocus]);

  const handleAddressBarBlur = useCallback(() => {
    props.onBlur?.();
  }, [props.onBlur]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;

      e.preventDefault();
      e.stopPropagation();

      addressBarRef.current?.blur();

      electronApi.updateUrl(snapshot(tabStore).activeTab!, inputValue);

      props.onBlur?.();
    },
    [inputValue]
  );

  return (
    <input
      id="addressbar"
      autoFocus
      ref={addressBarRef}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onFocus={handleAddressBarFocus}
      onBlur={handleAddressBarBlur}
      className="flex-1 h-[90%] border-none outline-blue-600 outline-4 rounded-full mx-1 px-4 bg-gray-100 focus:bg-white text-sm"
    />
  );
}

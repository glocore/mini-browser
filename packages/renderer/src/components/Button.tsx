import { PropsWithChildren } from "react";

export function Button({
  children,
  className,
  type,
  ...rest
}: PropsWithChildren<React.HTMLProps<HTMLButtonElement>>) {
  return (
    <button className="hover:bg-gray-500/10 rounded p-1" type="button" {...rest}>
      {children}
    </button>
  );
}

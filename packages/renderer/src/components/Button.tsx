import { PropsWithChildren } from "react";

export function Button({
  children,
  className,
  type,
  ...rest
}: PropsWithChildren<React.HTMLProps<HTMLButtonElement>>) {
  return (
    <button className="hover:bg-gray-100 rounded-md p-1" type="button" {...rest}>
      {children}
    </button>
  );
}

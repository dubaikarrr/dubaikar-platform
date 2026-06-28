import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ink";
type Size = "sm" | "md" | "lg";

function classes(variant: Variant, size: Size, block?: boolean, iconOnly?: boolean) {
  return cn(
    "btn",
    `btn-${variant}`,
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    iconOnly && "btn-icon",
    block && "btn-block",
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconOnly?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  block,
  iconOnly,
  ...props
}: ButtonProps) {
  return <button className={cn(classes(variant, size, block, iconOnly), className)} {...props} />;
}

interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  block,
  ...props
}: ButtonLinkProps) {
  return <Link className={cn(classes(variant, size, block), className)} {...props} />;
}

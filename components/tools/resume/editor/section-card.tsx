"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  id: string;
  title: string;
  open: boolean;
  hidden: boolean;
  complete?: boolean;
  onToggleOpen: () => void;
  onToggleHidden: () => void;
  children: React.ReactNode;
}

/** A drag-sortable, collapsible, show/hide-able section in the editor. */
export function SectionCard({
  id,
  title,
  open,
  hidden,
  complete,
  onToggleOpen,
  onToggleHidden,
  children,
}: SectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface",
        isDragging && "opacity-60 shadow-lg",
        hidden && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          className="cursor-grab text-text-subtle hover:text-text active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggleOpen} className="flex flex-1 items-center gap-2 text-left">
          <span className="text-sm font-medium text-text">{title}</span>
          {complete ? (
            <span className="h-1.5 w-1.5 rounded-full bg-success" title="Has content" />
          ) : null}
        </button>
        <button
          onClick={onToggleHidden}
          className="text-text-subtle hover:text-text"
          title={hidden ? "Hidden, click to show" : "Visible, click to hide"}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button onClick={onToggleOpen} className="text-text-subtle hover:text-text">
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open ? <div className="border-t border-border p-3">{children}</div> : null}
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/format";

export interface SelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children?: React.ReactNode;
}

interface ParsedOption {
  value: string;
  label: string;
  disabled?: boolean;
}

function extractOptions(children: React.ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<{ value?: string | number; children?: React.ReactNode; disabled?: boolean }>(child) && child.type === "option") {
      const val = child.props.value !== undefined ? String(child.props.value) : "";
      const label =
        typeof child.props.children === "string" || typeof child.props.children === "number"
          ? String(child.props.children)
          : val;
      options.push({
        value: val,
        label,
        disabled: child.props.disabled,
      });
    }
  });
  return options;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, children, value, defaultValue, name, onChange, disabled, id, ...props }, ref) => {
    const options = React.useMemo(() => extractOptions(children), [children]);
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue ?? value ?? options[0]?.value ?? ""
    );
    const currentValue = isControlled ? value : internalValue;

    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      function handleEscape(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open]);

    const selectedOption =
      options.find((opt) => opt.value === currentValue) ?? options[0];

    function handleSelect(nextValue: string) {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      setOpen(false);
      if (onChange) {
        const syntheticEvent = {
          target: { value: nextValue, name: name ?? "" },
          currentTarget: { value: nextValue, name: name ?? "" },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    }

    return (
      <div ref={containerRef} className="relative w-full">
        {name && <input type="hidden" name={name} value={currentValue} />}

        <button
          ref={ref}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => !disabled && setOpen((prev) => !prev)}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#065f46]/30 focus-visible:border-[#065f46] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:border-emerald-300",
            open && "border-[#065f46] ring-2 ring-[#065f46]/20",
            className
          )}
          {...props}
        >
          <span className="truncate text-left">
            {selectedOption?.label || "Select..."}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[#52665a] transition-transform duration-200",
              open && "rotate-180 text-[#065f46]"
            )}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-emerald-100 bg-white p-1.5 shadow-lg animate-in fade-in-0 zoom-in-95 duration-100"
          >
            {options.map((opt) => {
              const active = opt.value === currentValue;
              return (
                <button
                  key={`${opt.value}-${opt.label}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  disabled={opt.disabled}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                    active
                      ? "bg-[#065f46] font-semibold text-white"
                      : "text-[#14221b] hover:bg-[#e6f4ec] hover:text-[#064e3b]",
                    opt.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

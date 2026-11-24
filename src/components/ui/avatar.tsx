import { cn } from "@/lib/utils/format";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover border border-border shrink-0",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        "rounded-full bg-secondary text-secondary-foreground font-semibold flex items-center justify-center border border-emerald-200 shrink-0",
        sizes[size],
        className
      )}
    >
      {initials || "ST"}
    </div>
  );
}

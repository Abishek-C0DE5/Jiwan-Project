import React from "react";

function renderInlineFormatting(text: string): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return <strong key={idx}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return <em key={idx}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

export function NoteContentRenderer({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="list-disc pl-6 space-y-1 text-sm leading-relaxed text-foreground">
          {listItems.map((item, i) => (
            <li key={i}>{renderInlineFormatting(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList(`line-${idx}`);

    if (!trimmed) {
      elements.push(<div key={`sp-${idx}`} className="h-2" />);
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${idx}`}
          className="text-base font-semibold text-foreground pt-2"
        >
          {renderInlineFormatting(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${idx}`}
          className="text-lg font-bold text-foreground pt-3 border-b border-border/60 pb-1"
        >
          {renderInlineFormatting(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${idx}`} className="text-xl font-bold text-foreground pt-3">
          {renderInlineFormatting(trimmed.slice(2))}
        </h1>
      );
    } else {
      elements.push(
        <p key={`p-${idx}`} className="text-sm leading-relaxed text-foreground">
          {renderInlineFormatting(line)}
        </p>
      );
    }
  });

  flushList("end");

  return <div className="space-y-2">{elements}</div>;
}

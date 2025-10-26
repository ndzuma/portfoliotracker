function parseInlineMarkdown(line: string): string {
  // Bold: **text** or __text__
  line = line.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="font-semibold text-foreground">$1</strong>',
  );
  line = line.replace(
    /__(.+?)__/g,
    '<strong class="font-semibold text-foreground">$1</strong>',
  );

  // Italic: *text* or _text_
  line = line.replace(
    /\*(.+?)\*/g,
    '<em class="italic text-foreground">$1</em>',
  );
  line = line.replace(
    /_(.+?)_/g,
    '<em class="italic text-foreground">$1</em>',
  );

  // Inline code: `code`
  line = line.replace(
    /`(.+?)`/g,
    '<code class="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">$1</code>',
  );

  // Links: [text](url)
  line = line.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">$1</a>',
  );

  return line;
}

/**
 * Parse markdown text into JSX elements with Tailwind styling
 * @param text - Raw markdown text to parse
 * @returns Array of JSX elements representing the parsed markdown
 */
export function parseMarkdown(text: string): JSX.Element[] | null {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = (index: number) => {
    if (listItems.length > 0) {
      const ListTag = listType === "ol" ? "ol" : "ul";
      const listClass =
        listType === "ol"
          ? "list-decimal list-inside mb-3 space-y-1"
          : "list-disc list-inside mb-3 space-y-1";

      elements.push(
        <ListTag key={`list-${index}`} className={listClass}>
          {listItems.map((item, i) => (
            <li
              key={i}
              className="text-sm text-muted-foreground leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(item) }}
            />
          ))}
        </ListTag>,
      );
      listItems = [];
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    line = line.trim();

    // Skip empty lines
    if (!line) {
      flushList(index);
      return;
    }

    // Headers
    if (line.startsWith("#### ")) {
      flushList(index);
      const content = line.replace(/^#### /, "");
      elements.push(
        <h4
          key={index}
          className="text-sm font-medium text-foreground mb-2 mt-2 first:mt-0 break-words"
        >
          {content}
        </h4>,
      );
    } else if (line.startsWith("### ")) {
      flushList(index);
      const content = line.replace(/^### /, "");
      elements.push(
        <h3
          key={index}
          className="text-base font-medium text-foreground mb-2 mt-3 first:mt-0 break-words"
        >
          {content}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushList(index);
      const content = line.replace(/^## /, "");
      elements.push(
        <h2
          key={index}
          className="text-lg font-semibold text-foreground mb-2 mt-3 first:mt-0 break-words"
        >
          {content}
        </h2>,
      );
    } else if (line.startsWith("# ")) {
      flushList(index);
      const content = line.replace(/^# /, "");
      elements.push(
        <h1
          key={index}
          className="text-xl font-semibold text-foreground mb-3 mt-4 first:mt-0 break-words"
        >
          {content}
        </h1>,
      );
    }
    // Unordered list
    else if (line.match(/^[-*+]\s/)) {
      const content = line.replace(/^[-*+]\s/, "");
      if (listType !== "ul") {
        flushList(index);
        listType = "ul";
      }
      listItems.push(content);
    }
    // Ordered list
    else if (line.match(/^\d+\.\s/)) {
      const content = line.replace(/^\d+\.\s/, "");
      if (listType !== "ol") {
        flushList(index);
        listType = "ol";
      }
      listItems.push(content);
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      flushList(index);
      const content = line.replace(/^> /, "");
      elements.push(
        <blockquote
          key={index}
          className="border-l-2 border-primary pl-3 italic text-muted-foreground my-3 break-words"
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(content) }}
        />,
      );
    }
    // Regular paragraph
    else {
      flushList(index);
      elements.push(
        <p
          key={index}
          className="text-sm text-muted-foreground leading-relaxed mb-3 last:mb-0 break-words"
          dangerouslySetInnerHTML={{ __html: parseInlineMarkdown(line) }}
        />,
      );
    }
  });

  // Flush any remaining list
  flushList(lines.length);

  return elements;
}

/**
 * Strip markdown code block wrapper (```markdown and ```)
 * @param text - Text that may contain markdown code block wrapper
 * @returns Cleaned text without code block wrapper
 */
export function cleanMarkdownWrapper(text: string): string {
  if (!text) return "";

  return text
    .replace(/^```markdown\s*\n?/i, "")
    .replace(/\n?```\s*$/, "")
    .trim();
}

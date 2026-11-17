"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

import "./chat-markdown.css";

function safeLinkTarget(href: string) {
  try {
    const url = new URL(href, "https://gittalk.invalid");
    return ["http:", "https:", "mailto:"].includes(url.protocol)
      ? href
      : null;
  } catch {
    return null;
  }
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const pattern =
    /(\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|~~(.+?)~~|\*([^*\n]+)\*|_([^_\n]+)_)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const key = `${keyPrefix}-${index++}`;
    if (match[2] && match[3]) {
      const href = safeLinkTarget(match[3]);
      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target={href.startsWith("mailto:") ? undefined : "_blank"}
            rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
            title={match[4]}
          >
            {match[2]}
          </a>
        ) : (
          match[2]
        )
      );
    } else if (match[5]) {
      nodes.push(<code key={key}>{match[5]}</code>);
    } else if (match[6] || match[7]) {
      nodes.push(<strong key={key}>{match[6] ?? match[7]}</strong>);
    } else if (match[8]) {
      nodes.push(<del key={key}>{match[8]}</del>);
    } else if (match[9] || match[10]) {
      nodes.push(<em key={key}>{match[9] ?? match[10]}</em>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function isBlockStart(lines: string[], index: number) {
  const line = lines[index];
  return (
    !line.trim() ||
    /^\s*```/.test(line) ||
    /^#{1,6}\s/.test(line) ||
    /^\s*(?:[-*+]|\d+\.)\s+/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)
  );
}

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      toast.add({
        title: "Could not copy code",
        description:
          error instanceof Error ? error.message : "Clipboard access failed.",
        type: "error",
      });
    }
  }

  return (
    <div className="group/code relative my-3 min-w-0">
      {language && (
        <span className="absolute top-3 left-4 text-[0.7rem] text-muted-foreground">
          {language}
        </span>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute top-2 right-2 opacity-70 hover:opacity-100"
        onClick={copyCode}
        aria-label={copied ? "Code copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
      >
        {copied ? <Check /> : <Copy />}
      </Button>
      <pre className={language ? "pt-9!" : undefined}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ChatMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^\s*```([\w.+-]*)\s*$/);
    if (fence) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        <CodeBlock
          key={`code-${index}`}
          code={codeLines.join("\n")}
          language={fence[1]}
        />
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      const level = heading[1].length;
      const children = renderInline(heading[2], `heading-${index}`);
      const headingClassName = "chat-markdown-heading";
      if (level === 1) {
        blocks.push(<h1 className={headingClassName} key={`h-${index}`}>{children}</h1>);
      } else if (level === 2) {
        blocks.push(<h2 className={headingClassName} key={`h-${index}`}>{children}</h2>);
      } else if (level === 3) {
        blocks.push(<h3 className={headingClassName} key={`h-${index}`}>{children}</h3>);
      } else {
        blocks.push(<h4 className={headingClassName} key={`h-${index}`}>{children}</h4>);
      }
      index += 1;
      continue;
    }

    if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
      blocks.push(<hr key={`hr-${index}`} />);
      index += 1;
      continue;
    }

    const listMatch = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = Boolean(listMatch[2]);
      const items: ReactNode[] = [];
      while (index < lines.length) {
        const itemMatch = lines[index].match(
          /^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/
        );
        if (!itemMatch || Boolean(itemMatch[2]) !== ordered) break;
        items.push(
          <li key={`li-${index}`}>
            {renderInline(itemMatch[3], `list-${index}`)}
          </li>
        );
        index += 1;
      }
      blocks.push(
        ordered ? (
          <ol key={`ol-${index}`}>{items}</ol>
        ) : (
          <ul key={`ul-${index}`}>{items}</ul>
        )
      );
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={`quote-line-${quoteIndex}`}>
              {renderInline(quoteLine, `quote-${index}-${quoteIndex}`)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && !isBlockStart(lines, index)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length === 0) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={`p-${index}`}>
        {paragraph.map((paragraphLine, paragraphIndex) => (
          <span key={`line-${paragraphIndex}`}>
            {paragraphIndex > 0 && <br />}
            {renderInline(paragraphLine, `paragraph-${index}-${paragraphIndex}`)}
          </span>
        ))}
      </p>
    );
  }

  return <div className="chat-markdown">{blocks}</div>;
}

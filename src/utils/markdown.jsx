import React from "react";

/**
 * Parsed inline markdown formatting.
 * Supported syntax:
 *   - **bold** -> <strong>
 *   - `code` -> <code>
 */
function parseInlineMarkdown(text) {
  if (!text) return "";
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-slate-900 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Line-by-line custom Markdown parser that produces React elements without dangerouslySetInnerHTML.
 * Supported elements:
 *   - Headers: #, ##, ###
 *   - Bullet points: - item, * item
 *   - Numbered list: 1. item
 *   - Fenced code blocks: ```lang ... ```
 *   - Paragraphs and empty spacing
 */
export function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let inCodeBlock = false;
  let codeBlockLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle fenced code block toggles
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // Close block
        elements.push(
          <pre
            key={`code-block-${i}`}
            className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono my-2.5 overflow-x-auto border border-slate-800 leading-normal"
          >
            <code className="block whitespace-pre">{codeBlockLines.join("\n")}</code>
          </pre>
        );
        inCodeBlock = false;
        codeBlockLines = [];
      } else {
        // Open block
        inCodeBlock = true;
      }
      continue;
    }

    // Accumulate code lines if inside block
    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Parse Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = parseInlineMarkdown(headerMatch[2]);
      const sizeClasses = {
        1: "text-lg font-bold text-slate-900 mt-4 mb-2 border-b border-slate-100 pb-1",
        2: "text-base font-bold text-slate-900 mt-3.5 mb-1.5",
        3: "text-sm font-bold text-slate-900 mt-3 mb-1",
      };
      const Tag = level === 1 ? "h1" : level === 2 ? "h2" : "h3";
      elements.push(
        <Tag key={`h-${i}`} className={sizeClasses[level] || "text-sm font-bold text-slate-900 mt-2.5 mb-1"}>
          {content}
        </Tag>
      );
      continue;
    }

    // Parse Unordered List Items
    const bulletMatch = line.match(/^[-*+]\s+(.*)$/);
    if (bulletMatch) {
      const content = parseInlineMarkdown(bulletMatch[1]);
      elements.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-sm text-slate-700 leading-relaxed mb-1">
          {content}
        </li>
      );
      continue;
    }

    // Parse Ordered List Items
    const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const content = parseInlineMarkdown(numberMatch[2]);
      elements.push(
        <li key={`ol-${i}`} className="ml-5 list-decimal text-sm text-slate-700 leading-relaxed mb-1">
          {content}
        </li>
      );
      continue;
    }

    // Handle empty spacing lines
    if (line.trim() === "") {
      elements.push(<div key={`space-${i}`} className="h-2" />);
      continue;
    }

    // Standard Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm text-slate-700 leading-relaxed mb-1.5">
        {parseInlineMarkdown(line)}
      </p>
    );
  }

  // Handle case where code block is not closed
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <pre
        key="code-block-unclosed"
        className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-mono my-2.5 overflow-x-auto border border-slate-800 leading-normal"
      >
        <code className="block whitespace-pre">{codeBlockLines.join("\n")}</code>
      </pre>
    );
  }

  return elements;
}

"use client";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="text-2xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b-2 border-indigo-200">
          {line.slice(2)}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-lg font-bold text-indigo-700 mt-6 mb-2">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-gray-800 mt-4 mb-1">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <p key={key++} className="font-semibold text-gray-800 mt-3 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-700 mb-1 flex gap-2">
          <span className="text-indigo-500 mt-1">•</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <li key={key++} className="ml-4 text-gray-700 mb-1 flex gap-2">
          <span className="text-indigo-600 font-bold min-w-[1.2rem]">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-2" />);
    } else if (line.startsWith("---")) {
      elements.push(<hr key={key++} className="my-4 border-gray-200" />);
    } else {
      elements.push(
        <p key={key++} className="text-gray-700 leading-relaxed mb-1"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
  }

  return <div className="prose-custom">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm font-mono">$1</code>');
}

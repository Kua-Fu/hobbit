import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface JsonHighlighterProps {
    data: any;
}

interface FoldRange {
    start: number;
    end: number;
}

const JsonHighlighter: React.FC<JsonHighlighterProps> = ({ data }) => {
    const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());

    const { lines, ranges } = useMemo(() => {
        if (data === undefined || data === null) return { lines: [], ranges: new Map() };

        const jsonStr = JSON.stringify(data, null, 2);
        const lines = jsonStr.split('\n');
        const ranges = new Map<number, number>();
        const stack: { line: number, char: string }[] = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
                stack.push({ line: index, char: trimmed.endsWith('{') ? '{' : '[' });
            } else if ((trimmed.startsWith('}') || trimmed.startsWith(']')) && stack.length > 0) {
                const last = stack[stack.length - 1];
                const expected = last.char === '{' ? '}' : ']';
                if (trimmed.startsWith(expected)) { // Simple check, matches indentation logic usually
                    stack.pop();
                    ranges.set(last.line, index);
                }
            }
        });

        return { lines, ranges };
    }, [data]);

    const toggleCollapse = (lineIndex: number) => {
        const newCollapsed = new Set(collapsedLines);
        if (newCollapsed.has(lineIndex)) {
            newCollapsed.delete(lineIndex);
        } else {
            newCollapsed.add(lineIndex);
        }
        setCollapsedLines(newCollapsed);
    };

    const highlightLine = (line: string) => {
        // Simple regex highlighting for a single line
        // Note: broken strings across lines aren't possible in valid JSON.stringify output
        // Escape HTML characters
        line = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Regex for basic JSON tokens
        const regex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

        return line.replace(regex, (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    if (!data) return null;

    return (
        <div className="json-editor-container">
            <div className="json-lines">
                {lines.map((line, index) => {
                    // Check if hidden (inside a collapsed block)
                    let isVisible = true;
                    // Inefficient linear check for simplicity, optimizing would involve skipping indices
                    // But we map all for now, and display none. 
                    // Better: We must skip render completely for large lists.

                    // Actually, let's map and filter. But since we need to retain index relative to original lines:
                    // We render based on logic.
                    return null;
                })}

                {/* Re-implement render loop to handle visibility properly */}
                {(() => {
                    const rendered = [];
                    for (let i = 0; i < lines.length; i++) {
                        const isCollapsedStart = collapsedLines.has(i);
                        const rangeEnd = ranges.get(i);
                        const hasRange = rangeEnd !== undefined;

                        // Check if this line is inside a collapsed block (skipped)
                        // This logic is tricky with a simple loop. 
                        // Instead, we check if we skipped to here.

                        // Let's perform skipping logic.
                        rendered.push(
                            <div key={i} className="json-line-row">
                                <div className="json-gutter">
                                    <span className="json-line-number">{i + 1}</span>
                                    {hasRange && (
                                        <span
                                            className="json-fold-toggle"
                                            onClick={() => toggleCollapse(i)}
                                        >
                                            {isCollapsedStart ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                        </span>
                                    )}
                                </div>
                                <div className="json-code">
                                    <span dangerouslySetInnerHTML={{ __html: highlightLine(lines[i]) }} />
                                    {isCollapsedStart && rangeEnd && (
                                        <span
                                            className="json-collapsed-indicator"
                                            onClick={() => toggleCollapse(i)}
                                        >
                                            ... {lines[rangeEnd].trim()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );

                        if (isCollapsedStart && rangeEnd) {
                            // Skip lines until rangeEnd
                            i = rangeEnd;
                            // Note: We skip the closing brace/bracket line too? 
                            // Usually editors show "Line { ... }"
                            // But here we might want to show "Line { ... }"
                            // If we skip to rangeEnd, 'i' increments to rangeEnd + 1 in next loop?
                            // No, for loop `i++` happens after.
                            // So if we set i = rangeEnd, next iter is rangeEnd + 1.
                            // The line `rangeEnd` (the closing bracket) is merged into the collapsed indicator?
                            // Yes, typically `... }`.
                        }
                    }
                    return rendered;
                })()}
            </div>
        </div>
    );
};

export default JsonHighlighter;

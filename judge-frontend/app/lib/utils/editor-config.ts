import { editor } from "monaco-editor";

export const DEEP_SPACE_THEME: editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: true,
    rules: [
        { token: "", background: "0B0C15" },
        { token: "keyword", foreground: "818CF8", fontStyle: "bold" }, // Indigo-400
        { token: "identifier", foreground: "E0E7FF" }, // Indigo-50
        { token: "type.identifier", foreground: "C084FC" }, // Purple-400
        { token: "string", foreground: "34D399" }, // Emerald-400
        { token: "number", foreground: "F472B6" }, // Pink-400
        { token: "comment", foreground: "6B7280", fontStyle: "italic" }, // Gray-500
        { token: "delimiter", foreground: "9CA3AF" }, // Gray-400
        { token: "function", foreground: "22D3EE" }, // Cyan-400
        { token: "variable", foreground: "E0E7FF" }, // Indigo-50
        { token: "operator", foreground: "C084FC" }, // Purple-400
    ],
    colors: {
        "editor.background": "#0B0C15",
        "editor.foreground": "#E0E7FF",
        "editor.lineHighlightBackground": "#1F293750",
        "editor.selectionBackground": "#4F46E533",
        "editor.inactiveSelectionBackground": "#4F46E515",
        "editorCursor.foreground": "#818CF8",
        "editorWhitespace.foreground": "#374151",
        "editorLineNumber.foreground": "#4B5563",
        "editorLineNumber.activeForeground": "#E0E7FF",
        "editorIndentGuide.background": "#1F2937",
        "editorIndentGuide.activeBackground": "#374151",
        "editorSuggestWidget.background": "#111827",
        "editorSuggestWidget.border": "#374151",
        "editorSuggestWidget.foreground": "#E0E7FF",
        "editorSuggestWidget.selectedBackground": "#374151",
        "editorSuggestWidget.highlightForeground": "#22D3EE",
        "editor.hoverHighlightBackground": "#37415150",
    }
};

export const PYTHON_SNIPPETS = [
    {
        label: "print",
        insertText: "print(${1:object})",
        documentation: "Print objects to the text stream file"
    },
    {
        label: "def",
        insertText: "def ${1:func_name}(${2:args}):\n\t${3:pass}",
        documentation: "Function definition"
    },
    {
        label: "if",
        insertText: "if ${1:condition}:\n\t${2:pass}",
        documentation: "If statement"
    },
    {
        label: "if/else",
        insertText: "if ${1:condition}:\n\t${2:pass}\nelse:\n\t${3:pass}",
        documentation: "If/Else statement"
    },
    {
        label: "for",
        insertText: "for ${1:target} in ${2:iter}:\n\t${3:pass}",
        documentation: "For loop"
    },
    {
        label: "while",
        insertText: "while ${1:condition}:\n\t${2:pass}",
        documentation: "While loop"
    },
    {
        label: "try/except",
        insertText: "try:\n\t${1:pass}\nexcept ${2:Exception} as ${3:e}:\n\t${4:pass}",
        documentation: "Try/Except block"
    },
    {
        label: "class",
        insertText: "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t${3:pass}",
        documentation: "Class definition"
    },
    {
        label: "main",
        insertText: "if __name__ == \"__main__\":\n\t${1:main()}",
        documentation: "Main execution block"
    },
    {
        label: "listcomp",
        insertText: "[${1:expression} for ${2:item} in ${3:iterable}]",
        documentation: "List comprehension"
    },
    {
        label: "dictcomp",
        insertText: "{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}",
        documentation: "Dictionary comprehension"
    },
    {
        label: "input_arr",
        insertText: "arr = list(map(int, input().split()))",
        documentation: "Read integer array from input"
    },
    {
        label: "input_n",
        insertText: "n = int(input())",
        documentation: "Read single integer input"
    },
    {
        label: "import_math",
        insertText: "import math",
        documentation: "Import math module"
    },
    {
        label: "import_sys",
        insertText: "import sys",
        documentation: "Import sys module"
    },
    {
        label: "bfs",
        insertText: "from collections import deque\n\ndef bfs(graph, start):\n\tvisited = set()\n\tqueue = deque([start])\n\tvisited.add(start)\n\n\twhile queue:\n\t\tvertex = queue.popleft()\n\t\t${1:# Process vertex}\n\t\tfor neighbor in graph[vertex]:\n\t\t\tif neighbor not in visited:\n\t\t\t\tvisited.add(neighbor)\n\t\t\t\tqueue.append(neighbor)",
        documentation: "Breadth-First Search Template"
    },
    {
        label: "dfs",
        insertText: "def dfs(graph, start, visited=None):\n\tif visited is None:\n\t\tvisited = set()\n\tvisited.add(start)\n\t${1:# Process vertex}\n\tfor neighbor in graph[start]:\n\t\tif neighbor not in visited:\n\t\t\tdfs(graph, neighbor, visited)\n\treturn visited",
        documentation: "Depth-First Search Template"
    }
];

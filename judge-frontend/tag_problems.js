const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '../judge-backend/problems');

const tagRules = {
    "Array": ["array", "list", "permutation", "duplicate", "intersect", "subarray", "subsequence", "rotate", "vector", "wealth", "sorted_array", "squares_of", "move_zeroes", "remove_duplicates"],
    "String": ["string", "anagram", "palindrome", "word", "parenthes", "sentence", "text", "vowel", "consonant", "letter", "prefix", "suffix", "regex", "ip_address", "ip address", "defanging", "valid_parentheses"],
    "Hash Table": ["hash", "map", "dict", "two_sum", "two sum", "three_sum", "three sum", "four_sum", "four sum", "duplicate", "anagram", "frequency", "contains_duplicate", "contains duplicate", "jewels", "stones", "ransom", "isomorphic", "word_pattern"],
    "Math": ["math", "integer", "roman", "number", "digit", "prime", "factorial", "fibonacci", "gcd", "lcm", "pow", "power", "sqrt", "add", "sum", "sub", "multiply", "divide", "modulo", "calculator", "tax", "coin", "degree", "geometry", "leap", "wealth", "fizz", "buzz", "even", "odd", "plus_one", "complement", "self_dividing"],
    "Dynamic Programming": ["dp", "dynamic programming", "climb", "stairs", "robber", "coin", "change", "knapsack", "subsequence", "path", "ways", "decode", "ticket", "edit", "distance", "climbing_stairs"],
    "Binary Search": ["binary_search", "binary search", "search", "peak", "first_bad", "first bad", "koko", "bananas", "missing", "sorted_array", "rotated"],
    "Sorting": ["sort", "merge", "heap", "priority", "parity", "frequent", "kth", "colors"],
    "Greedy": ["greedy", "jump", "flower", "candy", "lemonade", "gas", "interval", "meeting", "room", "non_overlap", "non overlap"],
    "Depth-First Search (DFS)": ["dfs", "depth-first", "depth first", "depth_first", "tree", "island", "flood", "word_search", "word search", "graph", "path", "province"],
    "Breadth-First Search (BFS)": ["bfs", "breadth-first", "breadth first", "breadth_first", "tree", "island", "graph", "shortest", "ladder"],
    "Tree": ["tree", "bst", "binary_tree", "binary tree", "inorder", "preorder", "postorder", "lca", "ancestor", "invert", "depth", "validate_bst"],
    "Linked List": ["linked_list", "linked list", "node", "cycle", "pointer", "reverse_linked", "reverse linked"],
    "Two Pointers": ["two_pointer", "two pointer", "pointer", "palindrome", "reverse", "three_sum", "three sum", "four_sum", "four sum", "container", "rain", "water", "sorted"],
    "Sliding Window": ["window", "substring", "longest_substring", "longest substring", "character", "consecutive", "ones"],
    "Graph": ["graph", "network", "delay", "clone", "course", "schedule", "province", "component", "town", "judge"],
    "Bit Manipulation": ["bit", "xor", "binary_to", "binary to", "decimal", "complement", "hamming"],
    "Stack": ["stack", "parenthes", "reverse_polish", "reverse polish", "rpn", "polish"],
    "Queue": ["queue", "sliding", "window"],
    "Backtracking": ["backtrack", "queen", "sudoku", "combination", "subset", "permutation", "parentheses"],
    "Matrix": ["matrix", "grid", "diagonal", "transpose", "rotate_image", "rotate image", "island", "reshape"]
};

function run() {
    if (!fs.existsSync(PROBLEMS_DIR)) {
        console.error(`Problems directory not found at: ${PROBLEMS_DIR}`);
        return;
    }

    const files = fs.readdirSync(PROBLEMS_DIR);
    let updatedCount = 0;

    for (const filename of files) {
        if (!filename.endsWith('.json')) continue;
        const filepath = path.join(PROBLEMS_DIR, filename);

        try {
            const data = fs.readFileSync(filepath, 'utf8');
            const problem = JSON.parse(data);

            const title = (problem.title || "").toLowerCase();
            const desc = (problem.description || "").toLowerCase();
            const fileId = (problem.id || "").toLowerCase();

            const tagsSet = new Set(problem.tags || []);

            for (const [tag, keywords] of Object.entries(tagRules)) {
                for (const keyword of keywords) {
                    if (title.includes(keyword) || desc.includes(keyword) || fileId.includes(keyword)) {
                        tagsSet.add(tag);
                        break;
                    }
                }
            }

            if (fileId.includes("two_sum") || title.includes("two sum")) {
                tagsSet.add("Array");
                tagsSet.add("Hash Table");
            }
            if (fileId.includes("binary_search") || title.includes("binary search")) {
                tagsSet.add("Binary Search");
                tagsSet.add("Array");
            }
            if (fileId.includes("climbing_stairs") || title.includes("climbing stairs")) {
                tagsSet.add("Dynamic Programming");
                tagsSet.add("Math");
            }

            if (tagsSet.size === 0) {
                tagsSet.add("General");
            }

            problem.tags = Array.from(tagsSet).sort();

            fs.writeFileSync(filepath, JSON.stringify(problem, null, 4), 'utf8');
            updatedCount++;
        } catch (e) {
            console.error(`Error processing file ${filename}:`, e);
        }
    }

    console.log(`Successfully updated ${updatedCount} files with tags.`);
}

run();

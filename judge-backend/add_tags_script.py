import os
import json

PROBLEMS_DIR = "problems"

tag_rules = {
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
}

def add_tags():
    if not os.path.exists(PROBLEMS_DIR):
        print(f"Directory {PROBLEMS_DIR} not found.")
        return

    updated_count = 0
    for filename in os.listdir(PROBLEMS_DIR):
        if not filename.endswith(".json"):
            continue
        
        filepath = os.path.join(PROBLEMS_DIR, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                problem = json.load(f)
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            continue

        title = problem.get("title", "").lower()
        desc = problem.get("description", "").lower()
        file_id = problem.get("id", "").lower()

        tags = set(problem.get("tags", []))

        # Check keyword rules
        for tag, keywords in tag_rules.items():
            for keyword in keywords:
                if keyword in title or keyword in desc or keyword in file_id:
                    tags.add(tag)
                    break # Add tag once

        # Specific custom manual rules for some common ones if they didn't catch properly
        if "two_sum" in file_id or "two sum" in title:
            tags.update(["Array", "Hash Table"])
        if "binary_search" in file_id or "binary search" in title:
            tags.update(["Binary Search", "Array"])
        if "climbing_stairs" in file_id or "climbing stairs" in title:
            tags.update(["Dynamic Programming", "Math"])

        # Default fallback
        if not tags:
            tags.add("General")

        problem["tags"] = sorted(list(tags))

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(problem, f, indent=4)
            updated_count += 1
        except Exception as e:
            print(f"Error writing {filename}: {e}")

    print(f"Successfully updated {updated_count} files with tags.")

if __name__ == "__main__":
    add_tags()

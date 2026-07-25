export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export type SupportedLanguage = "python" | "java" | "cpp" | "javascript";

export interface MultiLangCode {
    python: string;
    java: string;
    cpp: string;
    javascript: string;
}

export interface LearnTopic {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    categorySlug: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    readTime: string;
    summary: string;
    overview: string;
    keyConcepts: string[];
    timeComplexity?: {
        access?: string;
        search?: string;
        insertion?: string;
        deletion?: string;
        best?: string;
        average?: string;
        worst?: string;
    };
    spaceComplexity?: string;
    sections: Array<{
        heading: string;
        content: string;
        diagram?: string;
        codeSnippet?: {
            title: string;
            code: MultiLangCode;
        };
        callout?: {
            type: "tip" | "warning" | "note";
            text: string;
        };
    }>;
    quiz?: QuizQuestion[];
}

export interface LearnCategory {
    id: string;
    slug: string;
    title: string;
    icon: string;
    description: string;
    topics: LearnTopic[];
}

export const LEARN_CATEGORIES: LearnCategory[] = [
    {
        id: "ds",
        slug: "data-structures",
        title: "Data Structures",
        icon: "Layers",
        description: "Fundamental organizational structures for storing, managing, and retrieving data efficiently.",
        topics: [
            {
                id: "ds-arrays",
                slug: "arrays",
                categorySlug: "data-structures",
                title: "Arrays & Dynamic Arrays",
                subtitle: "Contiguous memory structures, CPU cache locality, and dynamic amortized resizing",
                difficulty: "Beginner",
                readTime: "45 min read",
                summary: "A textbook-grade deep dive into contiguous memory allocation, pointer arithmetic, CPU cache locality, dynamic resizing proofs, and software engineering applications.",
                overview: "An array is a fundamental linear data structure consisting of a collection of elements, each identified by at least one array index or key. In physical memory, array elements are stored in contiguous, sequential memory locations. This simple physical arrangement gives arrays their most powerful property: O(1) constant-time random access, making them the foundational building block for almost all high-performance software engineering.",
                keyConcepts: [
                    "Contiguous Memory Allocation & RAM Layout",
                    "Pointer Arithmetic and 0-Based Indexing: Address = Base + (index * size)",
                    "Static vs Dynamic Allocation Strategies",
                    "Amortized O(1) Complexity Proofs for Resizing",
                    "Hardware CPU Cache Locality & Spatial Prefetching",
                    "Bounds Checking and Buffer Overflow Vulnerabilities"
                ],
                timeComplexity: { access: "O(1)", search: "O(n)", insertion: "O(n)", deletion: "O(n)" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. Introduction to Arrays",
                        content: "Before understanding complex data structures like HashMaps, Trees, or Graphs, we must understand how computers store sequential data. Imagine you need to store the temperatures of 365 days. Creating 365 separate variables (`temp1`, `temp2`, ..., `temp365`) is impossible to manage, loop over, or scale. Arrays solve this by allocating a single, large block of memory to hold multiple items of the same data type. \n\nHistorically, early programming languages needed a way to predictably find data without following complex pointers. Arrays were introduced to map mathematical vectors and matrices directly to the physical structure of computer memory (RAM). By storing elements back-to-back, programs could mathematically calculate exactly where the N-th element resided without scanning the first N-1 elements. This solved the critical problem of random access retrieval."
                    },
                    {
                        heading: "2. Core Concept & Intuition",
                        content: "To build intuition, think of an array as a row of connected post office boxes. Each box is exactly the same size, they are numbered sequentially starting from 0, and they are located right next to each other on the same street. \n\nIf you know the location of the very first box (the 'Base Address') and you know the exact width of each box (the 'Element Size'), you can instantly calculate the physical location of the 50th box. You do not need to walk past boxes 1 through 49; you simply jump directly to the calculated location. \n\nThis is why arrays are zero-indexed. The index `i` does not represent 'the i-th element' in human counting; rather, it represents the *offset* distance from the starting address. The first element is at an offset of 0. The second element is at an offset of 1 width, and so on."
                    },
                    {
                        heading: "3. Internal Working & Memory Layout",
                        content: "When your program requests an array, the Operating System's memory allocator (like `malloc` in C) searches the Virtual Memory space for a contiguous, unbroken block of bytes large enough to fulfill the request. \n\nSuppose you create an array of five 32-bit integers (`int` in C/Java). A 32-bit integer requires 4 bytes of memory. Therefore, the OS must find 5 × 4 = 20 contiguous bytes. Let's assume the OS allocates this block starting at memory address `0x1000`. \n\nThe internal workings rely purely on Pointer Arithmetic. When you request `array[3]`, the CPU executes a hardware-level calculation:\n\n`Address(i) = Base_Address + (i × Size_Per_Element)`\n`Address(3) = 0x1000 + (3 × 4)`\n`Address(3) = 0x1000 + 12 = 0x100C`\n\nThe CPU directly fetches the 4 bytes starting at `0x100C`. There is no loop, no searching, and no traversal. This direct mathematical mapping is what guarantees O(1) retrieval time."
                    },
                    {
                        heading: "4. Step-by-Step Walkthrough: Dynamic Insertion",
                        content: "What happens when you try to insert a new element into the middle of an array? Because arrays are contiguous, you cannot simply 'squeeze' a new element between two existing ones. The memory addresses are fixed physical locations. \n\nSuppose we have an array `[A, B, D, E]` and we want to insert `C` at index 2 (between B and D). \n\nStep 1: Check capacity. Is there empty allocated space at the end of the array? If yes, proceed. (If no, the entire array must be resized and moved, which we will discuss later).\n\nStep 2: We must make space at index 2. To do this, we copy element `E` (index 3) to index 4. \n\nStep 3: We copy element `D` (index 2) to index 3. \n\nStep 4: Now that index 2 is conceptually 'empty' (its old value was copied safely to the right), we overwrite index 2 with the new value `C`.\n\nNotice that inserting at index `k` required shifting every element from `k` to the end of the array exactly one position to the right. This is why insertion in the middle of an array is fundamentally expensive."
                    },
                    {
                        heading: "5. Memory Visualization",
                        content: "Let us visualize the physical RAM state during the insertion process described above. Assume an array of characters, where each character is 1 byte, starting at address 0x2000.",
                        diagram: `INITIAL STATE: Array of size 4, capacity 6
Address:  0x2000 | 0x2001 | 0x2002 | 0x2003 | 0x2004 | 0x2005
Value:      'A'  |  'B'   |  'D'   |  'E'   | (null) | (null)
Index:       0   |   1    |   2    |   3    |   4    |   5

STEP 2 & 3: Shifting elements to the right to make space at index 2
Address:  0x2000 | 0x2001 | 0x2002 | 0x2003 | 0x2004 | 0x2005
Value:      'A'  |  'B'   |  'D'   |  'D'   |  'E'   | (null)
                           ^-- Overwritten, but safely copied to 0x2003

STEP 4: Insert 'C' at index 2
Address:  0x2000 | 0x2001 | 0x2002 | 0x2003 | 0x2004 | 0x2005
Value:      'A'  |  'B'   |  'C'   |  'D'   |  'E'   | (null)
Index:       0   |   1    |   2    |   3    |   4    |   5`
                    },
                    {
                        heading: "6. Hardware Perspective: CPU Cache & Spatial Locality",
                        content: "Understanding arrays requires understanding modern CPU architecture. Why are arrays universally faster than Linked Lists for sequential traversal, even if both are technically O(N) time complexity? \n\nThe answer is **Cache Spatial Locality**. Main memory (RAM) is exceptionally slow compared to the CPU. To bridge this gap, CPUs possess L1, L2, and L3 caches built directly into the processor die. When the CPU fetches `array[0]` from RAM, it does not fetch just those 4 bytes. The hardware memory controller fetches an entire 'Cache Line'—typically 64 bytes of contiguous memory—and stores it in the ultra-fast L1 cache. \n\nBecause an array is contiguous, fetching `array[0]` automatically pulls `array[1]` through `array[15]` into the L1 cache. When the CPU asks for `array[1]` in the next loop iteration, it experiences a 'Cache Hit', retrieving the data in ~1 nanosecond instead of waiting ~100 nanoseconds for RAM. Linked Lists, whose nodes are scattered randomly across the heap, suffer constant 'Cache Misses', stalling the CPU as it waits for RAM fetches. This hardware reality makes arrays the king of performance."
                    },
                    {
                        heading: "7. Complexity Analysis & Amortized Proof",
                        content: "Let us analyze the time complexity of array operations:\n\n- **Random Access (Get/Set): O(1) Best/Average/Worst case.** Because the address is calculated mathematically via `Base + (i * size)`, it takes the exact same number of CPU cycles to access index 0 as it does to access index 1,000,000.\n- **Search (Unsorted): O(N) Worst case.** To find a specific value, you must linearly check every index from 0 to N until you find it. If the value doesn't exist, you check exactly N elements.\n- **Insertion/Deletion (Middle): O(N) Worst case.** As visualized earlier, inserting at index 0 requires shifting N elements to the right. \n\n**Amortized Analysis of Dynamic Array Append:**\nWhen a dynamic array (like Python `list` or C++ `std::vector`) runs out of capacity, it must allocate a new array of double the size (2N) and copy all N elements over. This single operation is O(N). Does this mean appending is O(N)? No. \n\nUsing the Aggregate Method of Amortized Analysis: Imagine starting with capacity 1 and appending elements until size N. The cost of regular appends is 1. The cost of doubling occurs at sizes 1, 2, 4, 8, 16... \nThe total cost of doubling across N inserts is the geometric series sum: 1 + 2 + 4 + 8 + ... + N ≈ 2N. \nTotal cost of all inserts = (N regular inserts) + (2N copying operations) = 3N. \nAverage cost per insert = 3N / N = 3 operations. \nBecause 3 is a constant, appending to a dynamic array is **Amortized O(1)**."
                    },
                    {
                        heading: "8. Language-Specific Notes",
                        content: "How do different programming languages implement arrays under the hood?\n\n- **C / C++:** Standard arrays (`int arr[10]`) are pure, raw memory blocks. There is absolutely zero metadata or bounds checking. If you access `arr[11]`, C will silently allow you to read/write random memory, causing Segfaults or security breaches. C++ provides `std::vector` for safe, dynamic arrays.\n- **Java:** Arrays are first-class Objects stored on the heap. They contain an explicit `length` property and the JVM rigorously enforces bounds-checking, throwing `ArrayIndexOutOfBoundsException` instead of corrupting memory.\n- **Python:** Python `list` is actually a dynamic array of pointers, not primitive values. Because Python is dynamically typed, the array stores memory addresses pointing to the actual Integer or String objects scattered elsewhere on the heap. This causes poor cache locality compared to C arrays.\n- **JavaScript:** Historically, JS arrays were implemented as Hash Maps with integer keys! Modern V8 engines (Chrome/Node.js) heavily optimize arrays. If an array contains only integers, V8 allocates a true contiguous C++ array (PACKED_SMI_ELEMENTS). If you mix types or leave holes, it degrades to a dictionary (HOLEY_ELEMENTS)."
                    },
                    {
                        heading: "9. Code Example: Dynamic Array Implementation",
                        content: "To truly understand dynamic arrays, we must build one from scratch. Below is a production-style implementation of an auto-resizing dynamic array, mimicking the internal logic of C++ `std::vector` or Java `ArrayList`.",
                        codeSnippet: {
                            title: "Dynamic Array Core Implementation",
                            code: {
                                python: `class DynamicArray:\n    def __init__(self, capacity: int = 2):\n        """Initialize array with a base capacity."""\n        self.capacity = capacity\n        self.size = 0\n        # In a real lower-level language, this allocates raw memory bytes.\n        self.buffer = [None] * self.capacity\n\n    def append(self, val) -> None:\n        """Insert element at the end of the array in Amortized O(1) time."""\n        # Check if buffer is completely full\n        if self.size == self.capacity:\n            self._resize(self.capacity * 2) # Double the capacity\n            \n        # Safely insert at the end pointer\n        self.buffer[self.size] = val\n        self.size += 1\n\n    def _resize(self, new_capacity: int) -> None:\n        """Allocate a new larger buffer and copy elements over (O(N) time)."""\n        new_buffer = [None] * new_capacity\n        for i in range(self.size):\n            new_buffer[i] = self.buffer[i]\n        \n        self.buffer = new_buffer\n        self.capacity = new_capacity\n\n    def get(self, index: int):\n        """Retrieve element in strictly O(1) time."""\n        if index < 0 or index >= self.size:\n            raise IndexError("Index out of bounds")\n        return self.buffer[index]`,
                                java: `public class DynamicArray<T> {\n    private Object[] buffer;\n    private int size;\n    private int capacity;\n\n    public DynamicArray() {\n        this.capacity = 2;\n        this.size = 0;\n        this.buffer = new Object[this.capacity];\n    }\n\n    public void append(T val) {\n        // If array is full, double its capacity\n        if (this.size == this.capacity) {\n            resize(this.capacity * 2);\n        }\n        // Insert and increment size pointer\n        this.buffer[this.size++] = val;\n    }\n\n    private void resize(int newCapacity) {\n        Object[] newBuffer = new Object[newCapacity];\n        // System.arraycopy is heavily optimized in the JVM\n        System.arraycopy(this.buffer, 0, newBuffer, 0, this.size);\n        this.buffer = newBuffer;\n        this.capacity = newCapacity;\n    }\n\n    @SuppressWarnings("unchecked")\n    public T get(int index) {\n        // Mandatory bounds checking for safety\n        if (index < 0 || index >= this.size) {\n            throw new IndexOutOfBoundsException("Invalid index");\n        }\n        return (T) this.buffer[index];\n    }\n}`,
                                cpp: `#include <iostream>\n#include <stdexcept>\n\ntemplate <typename T>\nclass DynamicArray {\nprivate:\n    T* buffer;\n    int capacity;\n    int size;\n\n    void resize(int new_capacity) {\n        // Allocate new raw memory block on the heap\n        T* new_buffer = new T[new_capacity];\n        // Copy existing elements linearly\n        for (int i = 0; i < size; i++) {\n            new_buffer[i] = buffer[i];\n        }\n        // Free old memory to prevent memory leaks\n        delete[] buffer;\n        buffer = new_buffer;\n        capacity = new_capacity;\n    }\n\npublic:\n    DynamicArray() : capacity(2), size(0) {\n        buffer = new T[capacity];\n    }\n\n    ~DynamicArray() { \n        delete[] buffer; \n    }\n\n    void append(T val) {\n        if (size == capacity) {\n            resize(capacity * 2);\n        }\n        buffer[size++] = val;\n    }\n\n    T get(int index) const {\n        if (index < 0 || index >= size) {\n            throw std::out_of_range("Index out of bounds");\n        }\n        return buffer[index];\n    }\n};`,
                                javascript: `class DynamicArray {\n  constructor(capacity = 2) {\n    this.capacity = capacity;\n    this.size = 0;\n    // Allocate fixed size underlying array\n    this.buffer = new Array(this.capacity);\n  }\n\n  append(val) {\n    // Check capacity boundaries\n    if (this.size === this.capacity) {\n      this._resize(this.capacity * 2);\n    }\n    this.buffer[this.size++] = val;\n  }\n\n  _resize(newCapacity) {\n    const newBuffer = new Array(newCapacity);\n    // Copy elements linearly O(N)\n    for (let i = 0; i < this.size; i++) {\n      newBuffer[i] = this.buffer[i];\n    }\n    this.buffer = newBuffer;\n    this.capacity = newCapacity;\n  }\n\n  get(index) {\n    if (index < 0 || index >= this.size) {\n      throw new Error("Index out of bounds");\n    }\n    return this.buffer[index];\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "10. Code Explanation",
                        content: "Let us break down the implementation step-by-step to understand the engineering decisions:\n\n- **`buffer`, `size`, and `capacity` variables:** We maintain three states. The `buffer` holds the actual memory references. The `capacity` tracks the total physical size of the buffer. The `size` tracks how many elements the user has logically inserted. \n- **The `append` function:** We first check if `size == capacity`. If true, we have hit physical memory limits and must resize. If false, we simply place the value at `buffer[size]` and increment `size`. This logic executes in exactly `O(1)` time without looping, which is highly efficient.\n- **The `resize` function:** We allocate a brand new buffer of size `capacity * 2`. We then iterate from `0` to `size`, copying `buffer[i]` into `new_buffer[i]`. In C++, we explicitly call `delete[] buffer` to free the old memory and prevent memory leaks. In Python, Java, and JS, the Garbage Collector automatically reclaims the old array once we drop the reference.\n- **The `get` function:** We strictly enforce `index < 0` or `index >= size`. This is a critical security measure. Without bounds checking, malicious actors could request `get(-1000)` and read sensitive passwords located elsewhere in the application's RAM."
                    },
                    {
                        heading: "11. Common Mistakes & Pitfalls",
                        content: "Beginners frequently make errors when working with arrays, largely due to a misunderstanding of contiguous memory:\n\n- **Off-by-One Errors:** Because arrays are 0-indexed, an array of size `N` has valid indices from `0` to `N-1`. Writing a loop condition like `for (int i = 0; i <= N; i++)` will result in an out-of-bounds access on the final iteration.\n- **Appending to Fixed Arrays in C/Java:** Attempting to assign `arr[5] = 10` on an array initialized with size 5 will instantly crash the program. You cannot magically stretch static arrays; you must use dynamic array wrapper classes.\n- **Deleting by Reassigning to Null:** If you want to remove an element, setting `array[2] = null` does not delete the element or shrink the array. It merely leaves a 'hole' in the data. To truly delete an element, you must manually shift all elements from the right over to the left to close the gap."
                    },
                    {
                        heading: "12. Edge Cases",
                        content: "Arrays struggle in specific unusual scenarios:\n\n- **Integer Overflow on Capacity:** If a dynamic array grows incredibly large (e.g., 2 Billion elements), doubling the capacity might require calculating `2,000,000,000 * 2`, which exceeds the maximum 32-bit integer limit (2.14B), causing an integer overflow, negative capacity request, and instant crash. Robust libraries check for maximum integer thresholds before doubling.\n- **Memory Fragmentation:** If you request an array of 4 Gigabytes, the OS must find 4GB of strictly *contiguous* memory. If your RAM is fragmented—meaning you have 8GB free but scattered in small blocks—the OS will fail to allocate the array and throw an `OutOfMemoryError`, even though total free memory is sufficient."
                    },
                    {
                        heading: "13. Comparison: Arrays vs Linked Lists",
                        content: "The most fundamental choice in Computer Science is choosing between Arrays and Linked Lists:\n\n- **Random Access:** Arrays win easily. They calculate addresses mathematically in `O(1)` time. Linked lists must traverse pointer by pointer from the head, taking `O(N)` time.\n- **Insertions & Deletions:** Linked Lists win *if* you already have a pointer to the location. Inserting a node simply requires rewiring two pointers in `O(1)` time. Arrays require shifting massive amounts of data in `O(N)` time.\n- **Memory Overhead:** Arrays win. They only store raw data. Linked Lists must store the data plus an 8-byte memory pointer for every single node, effectively doubling the memory consumption for small data types like integers.\n- **CPU Cache Performance:** Arrays overwhelmingly win due to spatial locality and L1 cache prefetching, as discussed in the Hardware Perspective section."
                    },
                    {
                        heading: "14. Real-World Applications",
                        content: "Arrays are the most widely used structure in software engineering:\n\n- **Operating Systems (Linux Kernel):** The OS uses Page Tables (massive arrays) to map virtual memory addresses to physical RAM blocks.\n- **Databases (PostgreSQL, MySQL):** Databases store table rows on disk in Fixed-Size Array blocks (Pages) to ensure rapid I/O disk reads. \n- **Networking (TCP/IP):** Network packets are processed as byte arrays (Buffers). When reading a packet from a network socket, the OS reads the raw electrical signals into a contiguous byte array for rapid checksum validation.\n- **Image Processing & Game Engines:** A 1920x1080 screen is represented internally as a massive one-dimensional array of 2,073,600 pixels. Graphics Processing Units (GPUs) are specifically hardware-designed to execute mathematical operations across arrays (matrices) in parallel."
                    },
                    {
                        heading: "15. Interview Perspective",
                        content: "In algorithmic interviews at Google, Meta, or Amazon, arrays are the foundation of 80% of problems.\n\n- **Common Interview Questions:** Two Sum, Best Time to Buy and Sell Stock, Product of Array Except Self, Container With Most Water.\n- **Optimization Tricks:** Interviewers expect you to know array-specific algorithms like the 'Two Pointer Technique' (placing pointers at index 0 and N-1 to search sorted arrays) and the 'Sliding Window Technique' (to find optimal subarrays in O(N) time).\n- **When NOT to use:** If an interview problem requires you to constantly add and remove elements from the *front* or *middle* of a collection, you should immediately state: 'Because this requires O(N) shifting in an array, I will use a Linked List or Deque instead.' Demonstrating knowledge of when arrays fail is highly rated by interviewers."
                    },
                    {
                        heading: "16. Summary",
                        content: "We have explored arrays from the raw silicon CPU caches up to dynamic scaling algorithms. \n\nRemember: Arrays trade flexibility for raw speed. By forcing elements into strict, contiguous memory blocks, they unlock O(1) mathematical memory access and unparalleled CPU cache performance. While dynamic arrays abstract away the fixed-size limitations through amortized doubling, the underlying cost of O(N) middle-insertions remains. Mastering the trade-offs of contiguous memory is the first step toward mastering computer science."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why is accessing array[100] an O(1) operation?", options: ["Because the CPU has 100 cache lines.", "Because the compiler creates 100 variables.", "Because the exact memory address is calculated mathematically using pointer arithmetic.", "Because the OS pre-fetches the entire array."], correctIndex: 2, explanation: "Array lookup uses the formula BaseAddress + (Index * ElementSize) to directly calculate the physical RAM location in a single CPU instruction, skipping traversal." },
                    { id: "q2", question: "Why is inserting an element at index 0 of a dynamic array inefficient?", options: ["It requires the array to double in capacity.", "It requires shifting every existing element one position to the right (O(N) time).", "It causes a Stack Overflow error.", "It breaks CPU branch prediction."], correctIndex: 1, explanation: "Because arrays are contiguous, inserting at the front requires physically moving all N elements over by one slot to create empty space at index 0." }
                ]
            },
            {
                id: "ds-linked-lists",
                slug: "linked-lists",
                categorySlug: "data-structures",
                title: "Linked Lists",
                subtitle: "Singly, Doubly, and Circular Pointer-Chained Data Nodes",
                difficulty: "Beginner",
                readTime: "40 min read",
                summary: "A deep dive into dynamic heap allocation, non-contiguous memory, pointer manipulation, cycle detection, and memory leak prevention.",
                overview: "A Linked List is a fundamental linear data structure consisting of discrete nodes. Unlike arrays, these nodes are not stored sequentially in physical memory. Instead, they are dynamically allocated across the heap, and each node stores a memory pointer containing the exact physical address of the next node. This decentralization allows linked lists to grow and shrink dynamically without requiring expensive full-memory reallocation or element shifting, trading fast random access for constant-time localized insertions.",
                keyConcepts: [
                    "Dynamic Heap Allocation per Node vs Contiguous Array Memory",
                    "Pointer Dereferencing and Sequential Traversal (Pointer Chasing)",
                    "Singly, Doubly, and Circular Node Topologies",
                    "O(1) localized insertions via pointer rewiring",
                    "Dangling Pointers, Memory Leaks, and Garbage Collection",
                    "Floyd's Tortoise and Hare Cycle Finding Algorithm"
                ],
                timeComplexity: { access: "O(n)", search: "O(n)", insertion: "O(1)", deletion: "O(1)" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. Introduction to Linked Lists",
                        content: "When building software, arrays solve the problem of sequential data storage but introduce a critical limitation: rigid sizing. If an array runs out of space, the operating system must find a larger block of contiguous memory, copy every single element over, and destroy the old array. This operation is extremely expensive in performance-critical systems. \n\nLinked Lists were invented to solve this rigidness. Imagine a treasure hunt where every clue gives you the physical address of the next clue. The clues do not need to be physically next to each other in the real world; they can be scattered miles apart, as long as the chain of addresses remains unbroken. In computer science, this is achieved by dynamically allocating individual objects (nodes) wherever free space is available on the heap memory, and storing a 'pointer' (the memory address) of the next node."
                    },
                    {
                        heading: "2. Core Concept & Intuition",
                        content: "To build intuition, consider a train. A train is made of distinct cars. If you want to add a new car to the middle of the train, you do not need to rebuild the entire train. You simply uncouple two cars, insert the new one, and reattach the couplers. \n\nIn a linked list, each 'train car' is a Node. Each Node has two compartments: the `data` (the passenger) and the `next` pointer ( the coupler connecting to the next car). \n\nBecause nodes are independent, a Linked List has no predetermined size. It starts as a single `Head` pointer pointing to nothing (Null). When you add an item, you create a node, and tell the Head to point to it. You can do this indefinitely until the machine runs out of physical RAM."
                    },
                    {
                        heading: "3. Internal Working & Memory Layout",
                        content: "Unlike an array, which requires a single massive contiguous block of Virtual Memory, a linked list utilizes fragmented heap memory. \n\nWhen you instantiate a new Node in C (`malloc`) or Java (`new Node()`), the Memory Allocator finds a tiny gap of free memory just large enough for that specific node (e.g., 8 bytes for data + 8 bytes for a 64-bit pointer = 16 bytes total). \n\nSuppose Node A is placed at address `0x1000`. Next week, the system creates Node B. But addresses `0x1001` through `0x3000` are already occupied by other programs. The OS places Node B at `0x4000`. To connect them, the `next` pointer field inside Node A is mathematically assigned the value `0x4000`. When the CPU evaluates Node A, it reads the address `0x4000` and 'jumps' its execution context to that physical RAM location to find Node B. This process is called 'Pointer Dereferencing'."
                    },
                    {
                        heading: "4. Step-by-Step Walkthrough: Node Insertion",
                        content: "Let us walk through inserting a node `NewNode` between `Node A` and `Node B`. \n\nStep 1: The OS allocates memory for `NewNode` and sets its data value. At this moment, it is disconnected from the list. \n\nStep 2: We must connect `NewNode` to the rest of the list first. We set `NewNode.next` to point to `Node B`. (We find `Node B` because `Node A.next` currently points to it). \n\nStep 3: Finally, we sever the old connection between A and B, and point `Node A.next` to `NewNode`.\n\nCRITICAL ORDER: If you accidentally perform Step 3 before Step 2 (setting A.next = NewNode *before* linking NewNode to B), you will instantly lose the memory address of Node B. Node B and the entire rest of the list will be orphaned in memory, causing a catastrophic memory leak. In C/C++, you will never be able to access or delete them again."
                    },
                    {
                        heading: "5. Memory Visualization",
                        content: "Let us visualize the pointer rewiring required to insert a Node in the middle of a Singly Linked List.",
                        diagram: `INITIAL STATE:
[Head Pointer] -> [Node A] --------------------> [Node B] -> NULL
                  Address: 0x100                 Address: 0x800
                  Data: 10                       Data: 20
                  Next: 0x800                    Next: NULL

STEP 1 & 2: Allocate NewNode (0x400) and point its Next to Node B (0x800)
[Node A] --------------------------------------> [Node B] -> NULL
(0x100, Next: 0x800)                             (0x800, Next: NULL)
                                                  ^
                                                  |
[NewNode] ----------------------------------------+
(0x400, Data: 15, Next: 0x800)

STEP 3: Point Node A's Next to NewNode (0x400)
[Node A] -----------> [NewNode] ---------------> [Node B] -> NULL
(0x100, Next: 0x400)  (0x400, Next: 0x800)       (0x800, Next: NULL)`
                    },
                    {
                        heading: "6. Hardware Perspective: CPU Cache & Pointer Chasing",
                        content: "While linked lists sound mathematically elegant, they perform terribly on modern CPU hardware for sequential traversal. \n\nAs discussed in Arrays, modern CPUs rely heavily on L1 and L2 Caches. CPUs prefetch contiguous memory blocks (Cache Lines) into ultra-fast SRAM. Because array elements are physical neighbors, the CPU fetches 16 elements in a single RAM trip. \n\nLinked list nodes are dynamically scattered randomly across the heap. When the CPU reads Node A, it finds the pointer for Node B (`0x4000`). It checks the L1 cache for `0x4000`. It is not there (Cache Miss). The CPU must stall and wait ~100 nanoseconds for the main RAM to fetch Node B. At Node B, it reads the pointer for Node C (`0x9500`). Another Cache Miss. \n\nThis phenomenon is called **Pointer Chasing**. In real-world benchmarks, iterating through a 10,000-element Array is often 10x to 50x faster than iterating through a 10,000-element Linked List simply due to silicon cache architecture."
                    },
                    {
                        heading: "7. Complexity Analysis",
                        content: "Let us analyze the time complexity of Linked List operations:\n\n- **Random Access (Get/Set): O(N) Worst Case.** To find the 500th element, you must start at the Head and follow 500 pointers sequentially. You cannot mathematically calculate the address like an array.\n- **Search (Unsorted): O(N) Worst case.** You must traverse the entire list to find a value.\n- **Insertion/Deletion at Head: O(1) Best/Worst Case.** You simply create a node, point it to the current Head, and update the Head pointer. No shifting required.\n- **Insertion/Deletion in Middle: O(1) *IF* pointer is known.** If you already have a variable pointing to Node A, inserting after A is exactly 2 pointer assignments, taking O(1) time. However, if you must *find* Node A first, the total operation becomes O(N) due to the search phase."
                    },
                    {
                        heading: "8. Language-Specific Notes",
                        content: "Implementation of Linked Lists varies wildly depending on language memory management:\n\n- **C / C++:** Developers must manually allocate nodes using `malloc()` or `new`. Crucially, when a node is removed from the list, the developer MUST explicitly call `free()` or `delete`. Failing to do so causes a Memory Leak, where RAM remains permanently occupied until the server crashes.\n- **Java / C#:** The Java Virtual Machine (JVM) abstracts pointer management into 'References'. You simply set `A.next = B`. When a node is removed and no references point to it, the Garbage Collector automatically detects the orphaned memory and cleans it up in the background.\n- **JavaScript / Python:** Similar to Java, Python and JS use object references and garbage collection. There is no built-in Linked List primitive in JS, so you must write a custom ES6 Class. Python provides `collections.deque`, which is internally implemented as a doubly linked list of blocks."
                    },
                    {
                        heading: "9. Code Example: Singly Linked List Implementation",
                        content: "Below is a production-grade implementation of a Singly Linked List, featuring a Node class, head/tail pointers for O(1) appends, and safe memory traversal.",
                        codeSnippet: {
                            title: "Singly Linked List Implementation",
                            code: {
                                python: `class Node:\n    def __init__(self, val=0):\n        self.val = val\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        # Dummy node simplifies edge cases (empty list)\n        self.dummy_head = Node(-1)\n        self.tail = self.dummy_head\n        self.size = 0\n\n    def append(self, val) -> None:\n        """Appends to the end in O(1) time using tail pointer."""\n        new_node = Node(val)\n        self.tail.next = new_node\n        self.tail = new_node\n        self.size += 1\n\n    def insert_after_index(self, index: int, val: int) -> None:\n        """Finds node at index (O(N)) and inserts after it (O(1))."""\n        if index < 0 or index >= self.size:\n            raise IndexError("Index out of bounds")\n        \n        current = self.dummy_head.next\n        for _ in range(index):\n            current = current.next\n            \n        new_node = Node(val)\n        # Step 1: Point new node to next node\n        new_node.next = current.next\n        # Step 2: Point current node to new node\n        current.next = new_node\n        \n        # Update tail if we inserted at the very end\n        if new_node.next is None:\n            self.tail = new_node\n        self.size += 1\n\n    def display(self) -> list:\n        result = []\n        curr = self.dummy_head.next\n        while curr:\n            result.append(curr.val)\n            curr = curr.next\n        return result`,
                                java: `public class LinkedList<T> {\n    private static class Node<T> {\n        T val;\n        Node<T> next;\n        Node(T val) { this.val = val; }\n    }\n\n    private Node<T> dummyHead;\n    private Node<T> tail;\n    private int size;\n\n    public LinkedList() {\n        dummyHead = new Node<>(null);\n        tail = dummyHead;\n        size = 0;\n    }\n\n    public void append(T val) {\n        // O(1) insertion at the end using tail pointer\n        Node<T> newNode = new Node<>(val);\n        tail.next = newNode;\n        tail = newNode;\n        size++;\n    }\n\n    public void insertAfterIndex(int index, T val) {\n        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();\n        \n        Node<T> current = dummyHead.next;\n        for (int i = 0; i < index; i++) {\n            current = current.next;\n        }\n        \n        Node<T> newNode = new Node<>(val);\n        // Wiring pointers\n        newNode.next = current.next;\n        current.next = newNode;\n        \n        if (newNode.next == null) tail = newNode;\n        size++;\n    }\n}`,
                                cpp: `#include <iostream>\n#include <stdexcept>\n\ntemplate <typename T>\nclass LinkedList {\nprivate:\n    struct Node {\n        T val;\n        Node* next;\n        Node(T v) : val(v), next(nullptr) {}\n    };\n    \n    Node* dummyHead;\n    Node* tail;\n    int size;\n\npublic:\n    LinkedList() {\n        dummyHead = new Node(T()); // Default constructor\n        tail = dummyHead;\n        size = 0;\n    }\n\n    ~LinkedList() {\n        // Must manually free all nodes to prevent memory leaks\n        Node* curr = dummyHead;\n        while (curr != nullptr) {\n            Node* temp = curr;\n            curr = curr->next;\n            delete temp;\n        }\n    }\n\n    void append(T val) {\n        Node* newNode = new Node(val);\n        tail->next = newNode;\n        tail = newNode;\n        size++;\n    }\n};`,
                                javascript: `class Node {\n  constructor(val) {\n    this.val = val;\n    this.next = null;\n  }\n}\n\nclass LinkedList {\n  constructor() {\n    // Dummy head pattern prevents null checks on empty lists\n    this.dummyHead = new Node(null);\n    this.tail = this.dummyHead;\n    this.size = 0;\n  }\n\n  append(val) {\n    const newNode = new Node(val);\n    this.tail.next = newNode;\n    this.tail = newNode;\n    this.size++;\n  }\n\n  insertAfterIndex(index, val) {\n    if (index < 0 || index >= this.size) throw new Error("Out of bounds");\n    \n    let current = this.dummyHead.next;\n    for (let i = 0; i < index; i++) {\n      current = current.next;\n    }\n    \n    const newNode = new Node(val);\n    newNode.next = current.next;\n    current.next = newNode;\n    \n    if (!newNode.next) this.tail = newNode;\n    this.size++;\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "10. Code Explanation",
                        content: "Let us review the critical architectural decisions in the code above:\n\n- **The Dummy Head Pattern:** We initialize a `dummy_head` node that contains no real data. The actual list begins at `dummy_head.next`. Why? Without a dummy head, every insertion or deletion algorithm requires an `if (head == null)` edge-case check. The dummy node guarantees that every real node always has a predecessor, dramatically simplifying pointer logic.\n- **The Tail Pointer:** We maintain a `tail` pointer alongside the head. Without a tail pointer, appending to the end of the list requires an O(N) traversal to find the last node. By caching the tail, `append()` becomes a strictly O(1) constant-time operation.\n- **Memory Cleanup (C++):** Notice the Destructor (`~LinkedList`) in the C++ implementation. It iterates through the entire list, caching the current pointer in `temp`, moving `curr` to the next node, and explicitly calling `delete temp`. If this destructor is omitted, destroying the LinkedList object leaves all allocated nodes orphaned in the heap (a catastrophic memory leak)."
                    },
                    {
                        heading: "11. Common Mistakes & Pitfalls",
                        content: "Working with pointers is notoriously difficult for beginners. Common errors include:\n\n- **Null Pointer Dereferencing (Segfaults):** The most common error in computer science. If you write `current = current.next` when `current` is already Null, the application will instantly crash with a NullPointerException or Segfault. You must always verify `while (current != null)`.\n- **Orphaning the Tail:** If you iterate to the end of a list and delete the last node, you must remember to update the `tail` pointer to point to the *new* last node. If you forget, subsequent `append()` calls will attach nodes to a deleted ghost node.\n- **Infinite Loops:** If you accidentally wire Node C's `next` pointer back to Node B, traversing the list will cycle `B -> C -> B -> C` infinitely, hanging your application until it runs out of stack space or times out."
                    },
                    {
                        heading: "12. Edge Cases",
                        content: "Specific topologies require careful handling:\n\n- **Doubly Linked Lists:** Nodes contain both a `next` and `prev` pointer. This allows O(1) backward traversal and simplifies deletion (since you don't need to search for the predecessor). However, it doubles the pointer memory overhead and requires exactly four pointer rewires per insertion instead of two.\n- **Circular Linked Lists:** The `tail.next` pointer points back to the `head` instead of Null. This is used in OS Round-Robin schedulers. The edge case here is traversal: a standard `while(curr != null)` loop will run infinitely. You must track if you have arrived back at the `head` to terminate the loop."
                    },
                    {
                        heading: "13. Comparison: Linked Lists vs Arrays",
                        content: "When should you choose a Linked List over an Array?\n\n- **When you need constant O(1) insertions/deletions at the ENDs.** (Note: Dynamic Arrays also provide Amortized O(1) appends, making them highly competitive).\n- **When you have a massive, unpredictable number of elements** and you cannot afford the O(N) latency spike that occurs when a Dynamic Array doubles its capacity and copies millions of elements.\n- **When memory is highly fragmented.** If the OS cannot find a contiguous 100MB block for a massive array, a Linked List can squeeze into tiny gaps of memory across the heap.\n- **WARNING:** Because of CPU Cache Misses, Arrays will almost always outperform Linked Lists in real-world benchmarks for sequential reading. Use Linked Lists primarily for Queues, Deques, or complex graph structures."
                    },
                    {
                        heading: "14. Real-World Applications",
                        content: "Where are Linked Lists actually used in production?\n\n- **Operating System Schedulers:** Linux uses Circular Doubly Linked Lists to manage process execution queues (Round Robin scheduling). As tasks wake up or sleep, they are dynamically linked or unlinked in O(1) time.\n- **Browser History & Undo/Redo:** Your browser's Back/Forward buttons are powered by a Doubly Linked List. The current page is a node; clicking 'Back' follows the `prev` pointer, 'Forward' follows the `next` pointer.\n- **Hash Table Collisions:** In Java's `HashMap`, if two keys hash to the same bucket index, they are stored as a Linked List originating from that array index (Separate Chaining).\n- **Blockchain:** A blockchain is literally a Cryptographic Linked List. Each block contains a cryptographic hash (pointer) of the previous block. Modifying any historical block breaks the mathematical linkage."
                    },
                    {
                        heading: "15. Interview Perspective",
                        content: "Linked Lists are heavily featured in coding interviews to test your ability to mentally juggle pointers without crashing the program.\n\n- **Common Interview Questions:** Reverse a Linked List, Merge Two Sorted Lists, Find the Middle Node, Remove N-th Node From End.\n- **Optimization Trick: Tortoise and Hare (Floyd's Algorithm):** If an interviewer asks you to detect a cycle in a list, or find the middle node in one pass, use two pointers. The 'Slow' pointer moves 1 node at a time. The 'Fast' pointer moves 2 nodes. If there is a cycle, Fast will eventually lap and equal Slow. If you want the middle, when Fast reaches the end, Slow is exactly in the middle.\n- **Tip:** ALWAYS ask the interviewer if you can use a Dummy Head. It demonstrates engineering maturity and saves you 10 minutes of writing edge-case `if` statements."
                    },
                    {
                        heading: "16. Summary",
                        content: "Linked lists trade the mathematical perfection and cache-locality of Arrays for extreme dynamic flexibility. By decentralizing data across the heap and linking it via physical memory pointers, we achieve O(1) localized insertions and unbounded growth. Mastering Linked Lists is a rite of passage: it is the moment a programmer stops thinking about 'variables' and begins directly orchestrating raw physical memory addresses."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why is a Linked List insertion O(1) while an Array insertion is O(N)?", options: ["Linked Lists use L1 Cache.", "Linked List insertions only require updating two pointer addresses, bypassing the need to shift existing elements.", "Arrays must be re-compiled.", "Arrays are strongly typed."], correctIndex: 1, explanation: "Pointer rewiring is an instant, constant-time operation. Arrays force you to manually copy and shift all subsequent elements to maintain contiguity." },
                    { id: "q2", question: "What is the primary performance drawback of a Linked List compared to an Array?", options: ["It requires Garbage Collection.", "It takes O(N) time to append.", "Nodes scattered across the heap cause constant CPU Cache Misses (Pointer Chasing).", "It has a fixed capacity."], correctIndex: 2, explanation: "Because nodes are not physically adjacent in RAM, the CPU cannot prefetch them into ultra-fast L1 cache, forcing slow RAM lookups for every node." }
                ]
            },
            {
                id: "ds-stacks",
                slug: "stacks",
                categorySlug: "data-structures",
                title: "Stacks (LIFO)",
                subtitle: "Last-In, First-Out linear structures, hardware call-stacks, and recursion",
                difficulty: "Beginner",
                readTime: "35 min read",
                summary: "Master the LIFO discipline, understand hardware CPU stack frames, expression parsing, Backtracking algorithms, and the dangers of Stack Overflow.",
                overview: "A Stack is a restricted linear data structure that adheres strictly to the Last-In, First-Out (LIFO) protocol. Imagine a physical stack of dinner plates: you can only place a new plate on the very top, and you can only remove the plate that is currently on the very top. In computer science, this restriction is a feature, not a bug. By forcing LIFO access, Stacks form the architectural foundation for CPU instruction execution, recursive function calls, mathematical expression evaluation, and algorithmic backtracking.",
                keyConcepts: [
                    "LIFO (Last-In, First-Out) Storage Protocol",
                    "Push, Pop, and Peek Constant-Time O(1) Operations",
                    "Hardware CPU Activation Records & Call Stack Frames",
                    "Stack Overflow vs Stack Underflow Exception Conditions",
                    "Monotonic Stack Techniques for Next Greater Element Algorithms",
                    "Abstract Syntax Tree Parsing and Bracket Matching"
                ],
                timeComplexity: { access: "O(n)", search: "O(n)", insertion: "O(1)", deletion: "O(1)" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. Introduction to Stacks",
                        content: "Why restrict data access? If arrays and linked lists allow you to insert and delete data anywhere, why invent a structure that only lets you touch the top element? \n\nThe answer lies in enforcing predictability and order. When you hit the 'Undo' button in a text editor, you don't want to undo a random typing action from 5 minutes ago; you want to undo the *very last* action you took. When a web browser navigates backward, it must return to the *most recently* visited page. Stacks exist to guarantee that the most recently added item is absolutely the first item retrieved."
                    },
                    {
                        heading: "2. Core Concept & Intuition",
                        content: "Consider a chef receiving restaurant orders on a spike spindle (a sharp metal rod). As waitstaff bring in new paper orders, the chef spikes them down onto the rod. When the chef is ready to cook, they pull the order off the very top of the spike. The last order spiked (Last-In) is the first order cooked (First-Out). \n\nIn data structures, this rod is the Stack. Placing an item on top is called `Push`. Removing an item from the top is called `Pop`. Looking at the top item without removing it is called `Peek` (or `Top`). You cannot access the middle of the stack without first popping off everything above it."
                    },
                    {
                        heading: "3. Internal Working & Memory Layout",
                        content: "A Stack is an Abstract Data Type (ADT). This means it is a theoretical concept that must be backed by a concrete physical structure—typically an Array or a Linked List. \n\n**Array-Backed Stack:** A large contiguous array is allocated. A variable called `top_index` starts at `-1`. When you push an item, `top_index` increments to `0` and the array stores the item at `array[0]`. Pushing again increments `top_index` to `1`. Popping simply retrieves `array[top_index]` and decrements the index. This requires zero shifting, making it incredibly fast. \n\n**Linked List-Backed Stack:** Each push creates a dynamic Node. The new Node's `next` pointer is set to the current `Head`, and the `Head` is updated to the new Node. Popping simply moves the `Head` to `Head.next`. This guarantees O(1) operations but incurs pointer memory overhead."
                    },
                    {
                        heading: "4. Step-by-Step Walkthrough: Evaluating Expressions",
                        content: "One of the most famous algorithms utilizing Stacks is validating matched parentheses: `[{()}]`. \n\nStep 1: Initialize an empty stack. \nStep 2: Read `[`. It is an opening bracket. `Push` it onto the stack. \nStep 3: Read `{`. It is an opening bracket. `Push` it onto the stack. \nStep 4: Read `(`. It is an opening bracket. `Push` it onto the stack. \nStep 5: Read `)`. It is a closing bracket! We `Pop` the top of the stack. The popped element is `(`, which matches `)`. Validation succeeds. \nStep 6: Read `}`. We `Pop` the stack. The top is `{`. Matches successfully. \nStep 7: Read `]`. We `Pop` the stack. The top is `[`. Matches successfully. \nStep 8: We reach the end of the string. The stack is empty, meaning every opening bracket was perfectly closed in the correct LIFO order. If the stack was not empty, it would indicate unclosed brackets."
                    },
                    {
                        heading: "5. Memory Visualization",
                        content: "Let us visualize an Array-Backed Stack performing Push and Pop operations.",
                        diagram: `INITIAL: Empty Stack, Capacity 4
Array:  [ null, null, null, null ]
top_index = -1

PUSH 'A'
Array:  [ 'A', null, null, null ]
           ^ top_index = 0

PUSH 'B'
Array:  [ 'A', 'B', null, null ]
                ^ top_index = 1

PUSH 'C'
Array:  [ 'A', 'B', 'C', null ]
                     ^ top_index = 2

POP (Returns 'C')
Array:  [ 'A', 'B', 'C'*, null ]  *(Data remains, but is logically ignored)
                ^ top_index = 1`
                    },
                    {
                        heading: "6. Hardware Perspective: The CPU Call Stack",
                        content: "The concept of a Stack is built directly into silicon processors (x86, ARM). When you write a program and `Function A` calls `Function B`, the CPU must remember where to return after `Function B` finishes. \n\nThe OS allocates a specific region of fast RAM called the 'Hardware Call Stack'. A dedicated CPU register called the `Stack Pointer (SP)` tracks the top. When `Function A` calls `Function B`, the CPU automatically pushes the memory address of the next instruction (the Return Address) onto the Call Stack. It also pushes all of `Function B`'s local variables (creating a 'Stack Frame'). \n\nWhen `Function B` hits the `return` statement, the CPU pops the Stack Frame, retrieves the Return Address, and instantly jumps execution back to `Function A`. This hardware-level LIFO behavior is what makes function calls possible."
                    },
                    {
                        heading: "7. Complexity Analysis",
                        content: "Let us analyze the time complexity of Stack operations:\n\n- **Push: O(1) Time.** Appending to the end of an array (via index) or the head of a linked list requires no shifting and executes in constant time. (Amortized O(1) if dynamic arrays require resizing).\n- **Pop: O(1) Time.** Removing the top element is a simple index decrement or pointer reassignment.\n- **Peek/Top: O(1) Time.** Reading the top element does not require traversal.\n- **Search/Access: O(N) Time.** Stacks are NOT designed for searching. If you need to find an element at the bottom of the stack, you must `Pop` every element above it, taking linear O(N) time. \n- **Space Complexity: O(N)** where N is the number of elements pushed into the stack."
                    },
                    {
                        heading: "8. Language-Specific Notes",
                        content: "How do different programming languages handle Stacks?\n\n- **Python:** Python does not have a dedicated Stack class. Instead, you use the built-in `list`. Using `list.append(x)` (Push) and `list.pop()` (Pop) provides perfect O(1) stack behavior. Alternatively, `collections.deque` is heavily optimized for this.\n- **Java:** Java has a legacy `java.util.Stack` class, but it extends `Vector` and is synchronized (thread-safe), which makes it unnecessarily slow. Modern Java developers are strongly advised to use `Deque<Integer> stack = new ArrayDeque<>();` which acts as a massive array-backed stack with incredible performance.\n- **C++:** C++ provides `#include <stack>`, which is a container adapter. By default, it wraps a `std::deque`. It provides strict `push()`, `pop()`, and `top()` methods, preventing illegal random access.\n- **JavaScript:** Like Python, JS developers use the standard Array object using `Array.push()` and `Array.pop()`."
                    },
                    {
                        heading: "9. Code Example: Custom Stack Implementation",
                        content: "Below is a custom implementation of an Array-backed Stack. We implement explicit boundary checking to handle Stack Overflows and Underflows.",
                        codeSnippet: {
                            title: "Fixed-Capacity Array Stack Implementation",
                            code: {
                                python: `class CustomStack:\n    def __init__(self, max_size: int):\n        self.max_size = max_size\n        self.stack = [None] * max_size\n        self.top_index = -1\n\n    def push(self, val) -> None:\n        """Pushes an element onto the stack in O(1) time."""\n        if self.top_index >= self.max_size - 1:\n            raise OverflowError("Stack Overflow! Maximum capacity reached.")\n        self.top_index += 1\n        self.stack[self.top_index] = val\n\n    def pop(self):\n        """Removes and returns the top element in O(1) time."""\n        if self.is_empty():\n            raise IndexError("Stack Underflow! Cannot pop from an empty stack.")\n        val = self.stack[self.top_index]\n        # We do not need to delete the element, just decrement the pointer\n        self.top_index -= 1\n        return val\n\n    def peek(self):\n        """Returns the top element without removing it."""\n        if self.is_empty():\n            return None\n        return self.stack[self.top_index]\n\n    def is_empty(self) -> bool:\n        return self.top_index == -1`,
                                java: `public class CustomStack<T> {\n    private Object[] stack;\n    private int topIndex;\n    private int maxSize;\n\n    public CustomStack(int maxSize) {\n        this.maxSize = maxSize;\n        this.stack = new Object[maxSize];\n        this.topIndex = -1;\n    }\n\n    public void push(T val) {\n        if (topIndex >= maxSize - 1) {\n            throw new StackOverflowError("Stack is full!");\n        }\n        stack[++topIndex] = val;\n    }\n\n    @SuppressWarnings("unchecked")\n    public T pop() {\n        if (isEmpty()) {\n            throw new java.util.EmptyStackException();\n        }\n        return (T) stack[topIndex--];\n    }\n\n    @SuppressWarnings("unchecked")\n    public T peek() {\n        if (isEmpty()) return null;\n        return (T) stack[topIndex];\n    }\n\n    public boolean isEmpty() {\n        return topIndex == -1;\n    }\n}`,
                                cpp: `#include <iostream>\n#include <stdexcept>\n\ntemplate <typename T>\nclass CustomStack {\nprivate:\n    T* stack;\n    int topIndex;\n    int maxSize;\n\npublic:\n    CustomStack(int size) : maxSize(size), topIndex(-1) {\n        stack = new T[maxSize];\n    }\n\n    ~CustomStack() {\n        delete[] stack;\n    }\n\n    void push(T val) {\n        if (topIndex >= maxSize - 1) {\n            throw std::overflow_error("Stack Overflow!");\n        }\n        stack[++topIndex] = val;\n    }\n\n    T pop() {\n        if (isEmpty()) {\n            throw std::underflow_error("Stack Underflow!");\n        }\n        return stack[topIndex--];\n    }\n\n    T peek() const {\n        if (isEmpty()) throw std::underflow_error("Stack is empty");\n        return stack[topIndex];\n    }\n\n    bool isEmpty() const {\n        return topIndex == -1;\n    }\n};`,
                                javascript: `class CustomStack {\n  constructor(maxSize) {\n    this.maxSize = maxSize;\n    this.stack = new Array(maxSize);\n    this.topIndex = -1;\n  }\n\n  push(val) {\n    if (this.topIndex >= this.maxSize - 1) {\n      throw new Error("Stack Overflow!");\n    }\n    this.stack[++this.topIndex] = val;\n  }\n\n  pop() {\n    if (this.isEmpty()) {\n      throw new Error("Stack Underflow!");\n    }\n    return this.stack[this.topIndex--];\n  }\n\n  peek() {\n    if (this.isEmpty()) return null;\n    return this.stack[this.topIndex];\n  }\n\n  isEmpty() {\n    return this.topIndex === -1;\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "10. Code Explanation",
                        content: "Let us dissect the array-backed stack implementation:\n\n- **The `top_index` variable:** This is the heart of the stack. It starts at `-1` (indicating empty). When we push, we increment it *first*, then insert the value. When we pop, we read the value *first*, then decrement it. \n- **Logical vs Physical Deletion:** Notice that in the `pop()` function, we never actually erase or nullify the data in the array. We simply decrement `top_index`. The next time we call `push()`, it will overwrite the old 'ghost' data. This is a massive optimization because it saves CPU cycles.\n- **Exceptions (Overflow & Underflow):** We strictly check if `top_index >= max_size - 1` before pushing. This prevents Buffer Overflows (writing memory outside the array). Conversely, if `top_index == -1`, trying to read `array[-1]` would crash the program, so we throw an Underflow Exception."
                    },
                    {
                        heading: "11. Common Mistakes & Pitfalls",
                        content: "Stacks are conceptually simple, but implementation errors are frequent:\n\n- **Pushing after Stack Overflow:** If a stack is allocated with 10 elements, attempting an 11th push will cause an Index Out Of Bounds exception. Dynamic stacks solve this by auto-resizing, but hardware stacks (like the OS Call Stack) have fixed sizes. \n- **Popping an Empty Stack:** Always check `is_empty()` before calling `pop()`. \n- **Using Stacks for Queues:** A stack reverses order (LIFO). If you are trying to process jobs in the order they arrived (FIFO), using a stack will process the *newest* job first, entirely starving the oldest job. Use a Queue instead."
                    },
                    {
                        heading: "12. Edge Cases: Stack Overflow Exception",
                        content: "The most famous error in computer science is the **Stack Overflow**. \n\nBecause recursive functions use the Hardware Call Stack, an infinitely looping recursive function will continuously push new Activation Frames onto the OS memory. The OS reserves a limited amount of RAM for the call stack (typically 1MB to 8MB). If a recursive function calls itself 50,000 times without returning, the hardware stack fills up. The CPU attempts to write to memory it does not own, and the Operating System violently terminates the program with a `StackOverflowError` (Java) or `Segmentation Fault` (C++). Always ensure your recursive functions have a base case that `returns` (pops)!"
                    },
                    {
                        heading: "13. Comparison: Stack vs Queue",
                        content: "Stacks and Queues are two sides of the same coin:\n\n- **Order:** Stacks are LIFO (Last-In, First-Out). Queues are FIFO (First-In, First-Out).\n- **Insertion point:** Stacks insert and remove from the *same* end (the Top). Queues insert at the *rear* and remove from the *front*.\n- **Use Cases:** Stacks are used for backtracking, undo operations, and recursion (reversing actions). Queues are used for scheduling, networking packets, and breadth-first search (processing in order of arrival).\n- **Performance:** Both guarantee O(1) insertion and deletion."
                    },
                    {
                        heading: "14. Real-World Applications",
                        content: "Stacks are deeply embedded in modern software:\n\n- **Compilers & Parsers:** When GCC compiles C++ code, it uses Stacks to evaluate mathematical expressions (converting Infix notation `3 + 4 * 2` into Postfix / Reverse Polish Notation `3 4 2 * +`).\n- **Web Browsers:** The 'Back' button uses a stack. Every time you click a link, the current URL is pushed onto the `HistoryStack`. Clicking 'Back' pops the top URL and loads it.\n- **Text Editors:** Microsoft Word's 'Undo' functionality is a stack of Command Objects. `Ctrl+Z` pops the last command and executes its reverse action.\n- **Graph Algorithms:** Depth-First Search (DFS) relies on a Stack (either explicitly, or implicitly via recursion) to plunge deep into a graph structure before backtracking."
                    },
                    {
                        heading: "15. Interview Perspective",
                        content: "Stacks are a favorite topic in technical interviews, particularly for parsing and algorithmic puzzles.\n\n- **Common Interview Questions:** Valid Parentheses, Evaluate Reverse Polish Notation, Min Stack (design a stack that can `getMin()` in O(1) time), Daily Temperatures.\n- **Optimization Trick: The Monotonic Stack:** If an interviewer asks you to find the 'Next Greater Element' in an array (e.g., given `[73, 74, 75, 71, 69, 72, 76]`, find the next warmer day for each), a Monotonic Stack is the O(N) solution. You keep elements in the stack strictly decreasing. If a new element is larger than the top, you pop the top and resolve it. This is a very advanced and highly tested technique at FAANG companies."
                    },
                    {
                        heading: "16. Summary",
                        content: "The Stack is a triumph of restriction. By forbidding random access and enforcing strict LIFO rules, Stacks provide mathematical certainty about the order of operations. Whether implemented as a tiny array in your software or wired directly into the silicon logic gates of a CPU managing function calls, the Stack is the ultimate structure for parsing, evaluation, and backtracking algorithms."
                    }
                ],
                quiz: [
                    { id: "q1", question: "What is the primary cause of a 'Stack Overflow' error in a software application?", options: ["Using a Stack data structure instead of an Array.", "A recursive function failing to hit its base case, continuously pushing frames onto the hardware call stack.", "Popping from an empty stack.", "The CPU Cache running out of space."], correctIndex: 1, explanation: "An infinite recursion loop will push thousands of activation frames onto the OS hardware stack until it exhausts its allocated memory limit." },
                    { id: "q2", question: "How does a fixed-array Stack 'delete' an element during a Pop operation?", options: ["It writes Null to the array index.", "It shifts all elements down by one.", "It creates a new array of size N-1.", "It simply decrements the top_index pointer, leaving the old data to be overwritten later."], correctIndex: 3, explanation: "For maximum efficiency, the popped data is left in the physical array. The logical `top_index` pointer is decremented, so the application ignores the old data, which will be overwritten on the next Push." }
                ]
            },
            {
                id: "ds-queues",
                slug: "queues",
                categorySlug: "data-structures",
                title: "Queues & Deques (FIFO)",
                subtitle: "First-In, First-Out buffers, circular ring arrays, and double-ended queues",
                difficulty: "Beginner",
                readTime: "30 min read",
                summary: "Master FIFO queuing theory, Circular Ring Buffer modulo arithmetic, Double-Ended Queues (Deques), Thread-Safe Blocking Queues, and Breadth-First Search (BFS) applications.",
                overview: "A Queue is a fundamental linear data structure that strictly enforces the First-In, First-Out (FIFO) access protocol. Unlike a stack where you access the most recent item, a queue guarantees absolute fairness: the oldest item in the collection is always the first one to be removed. Imagine waiting in line at a grocery store checkout; the first person to enter the line is the first person to be served. Queues are the architectural backbone of asynchronous systems, message brokers (like Kafka or RabbitMQ), OS task schedulers, network packet routing, and Breadth-First Search algorithms.",
                keyConcepts: [
                    "FIFO (First-In, First-Out) Storage Protocol",
                    "Enqueue (Rear) & Dequeue (Front) Constant-Time O(1) Operations",
                    "The shifting problem of naive array-based queues",
                    "Circular Ring Buffers and Modulo Index Arithmetic: (index + 1) % Capacity",
                    "Double-Ended Queues (Deques) for O(1) Front/Back Insertions",
                    "Producer-Consumer Concurrency and Thread-Safe Blocking Queues"
                ],
                timeComplexity: { access: "O(n)", search: "O(n)", insertion: "O(1)", deletion: "O(1)" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. Introduction to Queues",
                        content: "When engineering systems that handle asynchronous traffic—like an API receiving 10,000 requests per second while the database can only process 500 per second—you cannot just throw away the extra requests. You need a holding pen. \n\nThis holding pen must process requests fairly in the exact order they arrived to prevent older requests from starving. The Queue data structure was designed precisely for this. By enforcing First-In, First-Out (FIFO) logic, Queues act as shock-absorbers between fast producers of data and slow consumers of data."
                    },
                    {
                        heading: "2. Core Concept & Intuition",
                        content: "The terminology for Queues is standard across the industry:\n\n- **Enqueue (or Push/Offer):** Adding a new element to the *Rear* (or Tail) of the queue. \n- **Dequeue (or Pop/Poll):** Removing and returning the oldest element from the *Front* (or Head) of the queue. \n- **Peek (or Front):** Looking at the oldest element without removing it. \n\nYou can visualize it as a pipe. Data enters through the back end of the pipe and flows forward. Data can only exit through the front end of the pipe."
                    },
                    {
                        heading: "3. The Shifting Problem (Naive Array Queue)",
                        content: "The simplest way to build a Queue is using a standard Array. You maintain a `tail_index` tracking the back. When you enqueue, you insert at `array[tail_index]` and increment the tail. This is O(1) time. \n\nHowever, a fatal flaw emerges during Dequeue. The oldest element is always at `array[0]`. When you remove `array[0]`, the 0th index is now empty. To maintain the array, you must physically shift every single remaining element one position to the left (moving index 1 to 0, index 2 to 1, etc.). \n\nBecause shifting N elements takes O(N) time, a naive array-based queue is disastrously slow for large datasets. Dequeuing 100,000 items would require billions of shifting operations."
                    },
                    {
                        heading: "4. The Solution: The Circular Ring Buffer",
                        content: "To achieve O(1) Dequeue without shifting, computer scientists invented the **Circular Ring Buffer**. \n\nInstead of shifting elements left when `array[0]` is dequeued, we simply move a `head_index` pointer to the right (to `array[1]`). The physical array stays exactly where it is. \n\nBut what happens when the `tail_index` reaches the end of the array? If `head_index` has moved forward, there is now empty space at the *beginning* of the array. The Circular Buffer solves this by wrapping the `tail_index` back to `0` using Modulo Arithmetic: \n\n`next_index = (current_index + 1) % capacity`\n\nThe logical queue literally chases itself in a circle around the physical array."
                    },
                    {
                        heading: "5. Memory Visualization: Circular Ring Buffer",
                        content: "Let us trace a Circular Buffer with a capacity of 5.",
                        diagram: `INITIAL: Capacity 5, Head = 0, Tail = 0
Array: [ _ , _ , _ , _ , _ ]
         ^H/T

ENQUEUE A, B, C (Tail increments)
Array: [ A , B , C , _ , _ ]
         ^H          ^T

DEQUEUE twice (Returns A, B. Head increments)
Array: [ _ , _ , C , _ , _ ]
                 ^H  ^T

ENQUEUE D, E, F (Tail wraps around to 0!)
Array: [ F , _ , C , D , E ]
             ^T  ^H
Notice how the array is physically [F, _, C, D, E], 
but logically the queue is [C, D, E, F].`
                    },
                    {
                        heading: "6. Double-Ended Queues (Deque)",
                        content: "A Deque (pronounced 'deck') is a hybrid structure that allows O(1) insertion and deletion at *both* the front and the rear. \n\nIt combines the capabilities of a Stack and a Queue into a single structure. Most modern programming languages use a Deque as their default underlying structure for Stacks and Queues because of its extreme flexibility. In Python, `collections.deque` is implemented internally as a doubly-linked list of fixed-size memory blocks, balancing the cache-locality of arrays with the non-contiguous flexibility of linked lists."
                    },
                    {
                        heading: "7. Hardware Perspective: CPU Caches & Deques",
                        content: "When choosing between a Linked-List Queue and a Circular-Array Queue, performance relies heavily on CPU hardware. \n\nA Linked-List Queue provides guaranteed O(1) enqueues, but suffers from Pointer Chasing and Cache Misses. A Circular-Array Queue keeps data physically contiguous, meaning the CPU's L1 cache will automatically prefetch the next items in the queue into SRAM. \n\nTherefore, for high-performance packet routing (like in NIC network cards) or audio buffering, OS kernels almost exclusively use fixed-size Circular Ring Buffers allocated directly in raw memory."
                    },
                    {
                        heading: "8. Concurrency: The Blocking Queue",
                        content: "In multithreaded architecture, Queues are the primary mechanism for thread communication (the Producer-Consumer pattern). \n\nIf Thread A (Producer) generates data and Thread B (Consumer) processes it, they share a Queue. But what if the Queue is empty? Thread B shouldn't waste CPU cycles spinning in an infinite loop checking if data has arrived. \n\nA **Blocking Queue** uses OS-level Semaphores and Mutex Locks. If the queue is empty, a `take()` operation puts Thread B to sleep (blocking it). When Thread A enqueues data, the Queue sends a hardware signal waking up Thread B. This is how high-performance web servers like Nginx and Tomcat distribute incoming HTTP requests to worker threads."
                    },
                    {
                        heading: "9. Complexity Analysis",
                        content: "Time complexity for a properly implemented Queue (Circular Array or Linked List):\n\n- **Enqueue (Push to back): O(1) Time.** Array index assignment or tail pointer rewire.\n- **Dequeue (Pop from front): O(1) Time.** Head pointer increment.\n- **Peek/Front: O(1) Time.**\n- **Search/Access: O(N) Time.** You must not use a Queue if you need random access to middle elements. \n- **Space Complexity: O(N).**"
                    },
                    {
                        heading: "10. Language-Specific Notes",
                        content: "Implementations across languages:\n\n- **Python:** NEVER use `list.pop(0)`. It triggers the O(N) array shifting problem. Always use `from collections import deque` and `deque.popleft()`.\n- **Java:** Use the `Queue<Integer> q = new LinkedList<>();` interface, or for maximum array performance, `ArrayDeque<>`. For threading, use `java.util.concurrent.BlockingQueue`.\n- **C++:** Use `#include <queue>`, which wraps `std::deque` by default. It provides strict `push()` (enqueue) and `pop()` (dequeue).\n- **JavaScript:** standard `Array.shift()` performs O(N) array shifting, making it terrible for large queues in Node.js. High-performance JS backends use custom Linked List queue implementations to achieve true O(1)."
                    },
                    {
                        heading: "11. Code Example: Circular Ring Buffer Implementation",
                        content: "Below is a production-grade implementation of a Fixed-Capacity Circular Queue using Modulo arithmetic.",
                        codeSnippet: {
                            title: "Circular Queue (Ring Buffer)",
                            code: {
                                python: `class CircularQueue:\n    def __init__(self, k: int):\n        self.k = k\n        self.queue = [None] * k\n        self.head = 0\n        self.size = 0\n\n    def enqueue(self, value: int) -> bool:\n        if self.isFull():\n            return False\n        # Modulo arithmetic calculates the logical tail index\n        tail_idx = (self.head + self.size) % self.k\n        self.queue[tail_idx] = value\n        self.size += 1\n        return True\n\n    def dequeue(self) -> bool:\n        if self.isEmpty():\n            return False\n        # Move head forward and wrap around if necessary\n        self.head = (self.head + 1) % self.k\n        self.size -= 1\n        return True\n\n    def Front(self) -> int:\n        return -1 if self.isEmpty() else self.queue[self.head]\n\n    def Rear(self) -> int:\n        if self.isEmpty(): return -1\n        tail_idx = (self.head + self.size - 1) % self.k\n        return self.queue[tail_idx]\n\n    def isEmpty(self) -> bool:\n        return self.size == 0\n\n    def isFull(self) -> bool:\n        return self.size == self.k`,
                                java: `public class CircularQueue {\n    private int[] queue;\n    private int head;\n    private int size;\n    private int k;\n\n    public CircularQueue(int k) {\n        this.k = k;\n        this.queue = new int[k];\n        this.head = 0;\n        this.size = 0;\n    }\n\n    public boolean enqueue(int value) {\n        if (isFull()) return false;\n        int tailIdx = (head + size) % k;\n        queue[tailIdx] = value;\n        size++;\n        return true;\n    }\n\n    public boolean dequeue() {\n        if (isEmpty()) return false;\n        head = (head + 1) % k;\n        size--;\n        return true;\n    }\n\n    public int front() {\n        return isEmpty() ? -1 : queue[head];\n    }\n\n    public int rear() {\n        if (isEmpty()) return -1;\n        int tailIdx = (head + size - 1) % k;\n        return queue[tailIdx];\n    }\n\n    public boolean isEmpty() { return size == 0; }\n    public boolean isFull() { return size == k; }\n}`,
                                cpp: `#include <vector>\n\nclass CircularQueue {\nprivate:\n    std::vector<int> queue;\n    int head, size, k;\n\npublic:\n    CircularQueue(int k) : k(k), head(0), size(0) {\n        queue.resize(k);\n    }\n\n    bool enqueue(int value) {\n        if (isFull()) return false;\n        int tailIdx = (head + size) % k;\n        queue[tailIdx] = value;\n        size++;\n        return true;\n    }\n\n    bool dequeue() {\n        if (isEmpty()) return false;\n        head = (head + 1) % k;\n        size--;\n        return true;\n    }\n\n    int Front() {\n        return isEmpty() ? -1 : queue[head];\n    }\n\n    int Rear() {\n        if (isEmpty()) return -1;\n        int tailIdx = (head + size - 1) % k;\n        return queue[tailIdx];\n    }\n\n    bool isEmpty() { return size == 0; }\n    bool isFull() { return size == k; }\n};`,
                                javascript: `class CircularQueue {\n  constructor(k) {\n    this.k = k;\n    this.queue = new Array(k);\n    this.head = 0;\n    this.size = 0;\n  }\n\n  enqueue(value) {\n    if (this.isFull()) return false;\n    const tailIdx = (this.head + this.size) % this.k;\n    this.queue[tailIdx] = value;\n    this.size++;\n    return true;\n  }\n\n  dequeue() {\n    if (this.isEmpty()) return false;\n    this.head = (this.head + 1) % this.k;\n    this.size--;\n    return true;\n  }\n\n  Front() {\n    return this.isEmpty() ? -1 : this.queue[this.head];\n  }\n\n  Rear() {\n    if (this.isEmpty()) return -1;\n    const tailIdx = (this.head + this.size - 1) % this.k;\n    return this.queue[tailIdx];\n  }\n\n  isEmpty() { return this.size === 0; }\n  isFull() { return this.size === this.k; }\n}`
                            }
                        }
                    },
                    {
                        heading: "12. Code Explanation",
                        content: "Let us dissect the Circular Queue mathematics:\n\n- **Tail Calculation:** Notice we do not explicitly store a `tail` pointer. We calculate it dynamically: `tailIdx = (head + size) % k`. This eliminates the risk of `head` and `tail` pointers drifting out of sync. \n- **The Modulo `%` Operator:** The modulus operator is the secret to the ring buffer. If `head = 4`, `size = 1`, and capacity `k = 5`. The calculation `(4 + 1) % 5` equals `0`. The tail wraps around flawlessly from the end of the array back to index 0.\n- **Logical Deletion:** When we `dequeue()`, we simply advance the `head` pointer and decrement `size`. We DO NOT overwrite the old data in the array with nulls or zeros, saving CPU cycles. The old ghost data is naturally overwritten the next time the tail wraps around."
                    },
                    {
                        heading: "13. Common Mistakes & Pitfalls",
                        content: "The biggest pitfall for beginners is using an Array without a head pointer. \n\nIf you write `array.remove_at(0)` or `array.shift()`, you are triggering an O(N) memory shift. If your queue handles 10,000 items, every single pop forces the CPU to copy 9,999 items in RAM. Your algorithm will timeout immediately. You must use a dedicated Queue/Deque class or implement a Head pointer."
                    },
                    {
                        heading: "14. Graph Algorithms: Breadth-First Search (BFS)",
                        content: "The most important algorithmic use case for Queues is **Breadth-First Search (BFS)**.\n\nImagine searching a maze. A Stack (DFS) makes you run down a single path until you hit a dead end, then backtrack. A Queue (BFS) makes you check all immediate neighbors one step away, then all neighbors two steps away, expanding like a ripple in a pond. \n\nBy enqueuing discovered nodes and dequeuing them to check their neighbors, the FIFO nature guarantees that all nodes at distance *d* are processed before any nodes at distance *d+1*. This is how GPS systems find the shortest path on a map."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "Queues power modern scalable infrastructure:\n\n- **Message Brokers:** Apache Kafka, RabbitMQ, and AWS SQS are literally massive Queues operating across server clusters. They decouple microservices, allowing a fast API to instantly enqueue a job and return a 200 OK, while a slow worker dequeues and processes the job hours later.\n- **Rate Limiting (Token Bucket):** APIs use queues to limit traffic. If 10,000 requests arrive, they are queued. If the queue is full, the server returns `429 Too Many Requests`.\n- **OS CPU Scheduling:** The Linux Kernel maintains a 'Ready Queue' of threads waiting for CPU time. Threads are dequeued, given a few milliseconds of CPU execution, and if unfinished, re-enqueued at the back (Round-Robin scheduling)."
                    },
                    {
                        heading: "16. Summary",
                        content: "Queues impose the ultimate law of fairness: First-In, First-Out. While conceptually simple, achieving true O(1) performance requires engineering ingenuity like the Circular Ring Buffer or Pointer-Chained Nodes. Whenever you are faced with a bottleneck between a fast producer and a slow consumer, or you need to process data in the strict order of arrival, the Queue is the definitive architectural solution."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why is a standard Array a poor choice for implementing a basic Queue?", options: ["Arrays cannot store objects.", "Removing the first element (array[0]) requires physically shifting all N remaining elements one position to the left, taking O(N) time.", "Arrays are LIFO.", "Arrays suffer from Cache Misses."], correctIndex: 1, explanation: "Without a moving `head` pointer (like in a Circular Buffer), deleting index 0 leaves an empty gap that must be filled by shifting the entire array, which is computationally catastrophic for large queues." },
                    { id: "q2", question: "In a Circular Ring Buffer with capacity 'k', what is the purpose of the Modulo arithmetic `(index + 1) % k`?", options: ["To encrypt the data.", "To automatically wrap the index back to 0 when it reaches the end of the physical array boundary.", "To calculate the median value.", "To prevent Thread Deadlocks."], correctIndex: 1, explanation: "Modulo arithmetic perfectly restricts an increasing integer to a bounded range [0, k-1], causing it to wrap around and form a logical circle over a linear array." }
                ]
            },
            {
                id: "ds-trees",
                slug: "binary-trees-and-bst",
                categorySlug: "data-structures",
                title: "Binary Trees & BSTs",
                subtitle: "Hierarchical trees, Binary Search Tree invariants, and AVL self-balancing rotations",
                difficulty: "Intermediate",
                readTime: "45 min read",
                summary: "Master hierarchical node trees, BST search invariants, Depth-First & Breadth-First traversals, structural deletion algorithms, and self-balancing height guarantees.",
                overview: "A Tree is a non-linear, hierarchical data structure consisting of nodes connected by directed edges. Unlike arrays or linked lists where data is sequential, trees organize data relationally, mimicking real-world structures like file systems, organizational charts, and HTML DOM trees. A Binary Tree restricts each node to a maximum of two children (`left` and `right`). A Binary Search Tree (BST) takes this further by enforcing a strict mathematical ordering invariant: all node values in the left subtree must be strictly less than the parent node, and all node values in the right subtree must be strictly greater. This simple rule unlocks O(log N) search times, matching the speed of Binary Search while allowing dynamic insertions and deletions.",
                keyConcepts: [
                    "Hierarchical Anatomy: Root, Parent, Children, Sibling, Leaf, Depth, and Height",
                    "The BST Ordering Invariant: Left Subtree < Node < Right Subtree",
                    "Depth-First Traversals (DFS): Pre-Order, In-Order (Sorted), Post-Order",
                    "Breadth-First Traversal (BFS): Level-Order iteration via Queues",
                    "Node Deletion complexities: Leaf deletion vs 1-Child vs 2-Child (In-Order Successor)",
                    "The Degeneracy Problem: Unbalanced Trees reducing to O(N) Linked Lists",
                    "Self-Balancing Trees (AVL & Red-Black Trees) and Tree Rotations"
                ],
                timeComplexity: { search: "O(log n) avg / O(n) worst", insertion: "O(log n) avg / O(n) worst", deletion: "O(log n) avg / O(n) worst" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. Introduction to Trees",
                        content: "Sequential data structures (Arrays, Linked Lists, Stacks, Queues) force us to search linearly. If you have 1 million unsorted items in a Linked List, finding one item requires up to 1 million checks (O(N) time). \n\nWe know that Binary Search on a sorted Array solves this, cutting 1 million checks down to just 20 checks (O(log N)). However, keeping an array sorted requires O(N) shifting every time you insert a new element. \n\nHow do we get the O(log N) search speed of a sorted array combined with the fast O(1) dynamic insertion of a Linked List? The answer is the Binary Search Tree."
                    },
                    {
                        heading: "2. Core Concept: The BST Invariant",
                        content: "A Binary Tree is constructed of Nodes, similar to a doubly-linked list. But instead of `prev` and `next`, the pointers are `left` and `right`. The very first node at the top is called the `Root`. Nodes with no children at the bottom are called `Leaves`.\n\nA Binary Search Tree (BST) enforces a strict rule (an Invariant) on every single node:\n1. Every value in the **left subtree** must be smaller than the node.\n2. Every value in the **right subtree** must be larger than the node.\n\nBecause this rule applies recursively to every subtree, a BST inherently maintains a sorted state."
                    },
                    {
                        heading: "3. Step-by-Step Walkthrough: BST Search",
                        content: "Let us search for the number `27` in a BST.\n\nStep 1: Start at the Root. The root value is `50`. \nStep 2: Is 27 == 50? No. \nStep 3: Is 27 < 50? Yes. Because of the BST Invariant, we know *for absolute certainty* that 27 cannot be in the right subtree. We completely ignore the right side of the tree and move to the `left` child. \nStep 4: The left child is `25`. \nStep 5: Is 27 == 25? No. \nStep 6: Is 27 > 25? Yes. We move to the `right` child of 25.\nStep 7: The node is `27`. We found it! \n\nNotice that at every step, we eliminated exactly half of the remaining nodes. This halving behavior is what gives the BST its O(log N) logarithmic time complexity."
                    },
                    {
                        heading: "4. Memory Visualization: Tree Construction",
                        content: "Let's visualize the construction of a BST by inserting the sequence: `[50, 25, 75, 10, 30]`",
                        diagram: `1. Insert 50 (Root)
       [50]

2. Insert 25 (25 < 50, goes Left)
       [50]
      /
   [25]

3. Insert 75 (75 > 50, goes Right)
       [50]
      /    \\
   [25]    [75]

4. Insert 10 (10 < 50 (L), 10 < 25 (L))
       [50]
      /    \\
   [25]    [75]
   /
[10]

5. Insert 30 (30 < 50 (L), 30 > 25 (R))
       [50]
      /    \\
   [25]    [75]
   /  \\
[10]  [30]`
                    },
                    {
                        heading: "5. Depth-First Traversals (DFS)",
                        content: "How do we print all the values in a tree? Because trees are 2-dimensional, we cannot just iterate from 0 to N. We must use recursive traversal algorithms. Depth-First Traversals plunge all the way down to the leaves before coming back up. There are three types:\n\n- **Pre-Order (Node, Left, Right):** Process the parent first, then the children. Used for copying a tree or exporting its structure.\n- **In-Order (Left, Node, Right):** Process the left child, then the parent, then the right child. *CRITICAL FACT:* Performing an In-Order traversal on a BST will always print the nodes in perfect ascending sorted order.\n- **Post-Order (Left, Right, Node):** Process the children first, then the parent. Used for deleting a tree from the bottom up, or evaluating AST math expressions."
                    },
                    {
                        heading: "6. Breadth-First Traversal (BFS)",
                        content: "Instead of diving deep, what if we want to read the tree level-by-level, left-to-right? This is Breadth-First Search (Level-Order Traversal).\n\nBFS cannot be done efficiently with simple recursion. It requires a **Queue**. \n1. Push the Root into the Queue. \n2. While the Queue is not empty: Dequeue a node, print it, and Enqueue its left child, then its right child. \n\nBFS is heavily used in finding the shortest path in unweighted graphs or rendering hierarchical UI components (like the DOM) level by level."
                    },
                    {
                        heading: "7. The Nightmare of Node Deletion",
                        content: "Inserting into a BST is easy: you just fall down the tree until you hit a Null pointer, and attach the node. Deleting a node is notoriously complicated because it fractures the tree structure. There are three cases:\n\n- **Case 1: Node is a Leaf (0 children).** Easiest. Just sever the pointer from its parent.\n- **Case 2: Node has 1 child.** Slightly harder. Cut the node out and connect its parent directly to its single child (bypassing the deleted node).\n- **Case 3: Node has 2 children.** The Nightmare. If you delete a node with two children, which child takes its place? You cannot connect both to the single parent pointer. The solution: Find the **In-Order Successor** (the smallest node in the right subtree). Copy the successor's value into the node you want to delete, and then delete the successor (which is guaranteed to fall into Case 1 or Case 2)."
                    },
                    {
                        heading: "8. Complexity Analysis & The Degeneracy Problem",
                        content: "What is the time complexity of a BST?\n\n- **Best/Average Case: O(log N).** If the tree is perfectly balanced (looks like a full triangle), its Height is `log2(N)`. Searching, inserting, and deleting only require traveling down the height of the tree.\n- **Worst Case: O(N).** Suppose you insert sorted data: `[10, 20, 30, 40, 50]`. 20 goes right of 10. 30 goes right of 20. The tree forms a single straight line leaning to the right. It has mathematically degraded into a Linked List. The Height is now `N`. Searching for 50 takes O(N) time. This is called a **Degenerate Tree**."
                    },
                    {
                        heading: "9. Self-Balancing Trees (AVL & Red-Black)",
                        content: "To prevent O(N) degradation, computer scientists invented Self-Balancing Trees like AVL Trees and Red-Black Trees.\n\nEvery time you insert a node, these trees calculate the height of the left and right subtrees. If the difference in height exceeds a threshold (e.g., > 1), the tree performs a **Tree Rotation**. By physically rewiring the pointers to rotate nodes left or right, the tree continuously flattens itself into a balanced triangle, mathematically guaranteeing that the height never exceeds O(log N), thus guaranteeing O(log N) operations in the worst-case scenario. Red-Black trees are the underlying data structure for Java's `TreeMap` and C++ `std::map`."
                    },
                    {
                        heading: "10. Code Example: BST Implementation & DFS",
                        content: "Below is a production implementation of a BST, featuring iterative insertion, recursive In-Order traversal, and the complex 2-child deletion algorithm.",
                        codeSnippet: {
                            title: "Binary Search Tree (Insertion, DFS, Deletion)",
                            code: {
                                python: `class TreeNode:\n    def __init__(self, val=0):\n        self.val = val\n        self.left = None\n        self.right = None\n\nclass BST:\n    def __init__(self):\n        self.root = None\n\n    def insert(self, val):\n        if not self.root:\n            self.root = TreeNode(val)\n            return\n        curr = self.root\n        while True:\n            if val < curr.val:\n                if not curr.left: curr.left = TreeNode(val); break\n                curr = curr.left\n            else:\n                if not curr.right: curr.right = TreeNode(val); break\n                curr = curr.right\n\n    def inorder(self, node, res=None):\n        if res is None: res = []\n        if node:\n            self.inorder(node.left, res)\n            res.append(node.val)\n            self.inorder(node.right, res)\n        return res\n\n    def delete(self, root, key):\n        if not root: return root\n        if key < root.val: root.left = self.delete(root.left, key)\n        elif key > root.val: root.right = self.delete(root.right, key)\n        else:\n            # Case 1 & 2: 0 or 1 child\n            if not root.left: return root.right\n            elif not root.right: return root.left\n            # Case 3: 2 children. Find min in right subtree (Successor)\n            temp = self.get_min(root.right)\n            root.val = temp.val\n            root.right = self.delete(root.right, temp.val)\n        return root\n\n    def get_min(self, node):\n        while node.left: node = node.left\n        return node`,
                                java: `class TreeNode {\n    int val;\n    TreeNode left, right;\n    TreeNode(int val) { this.val = val; }\n}\n\npublic class BST {\n    TreeNode root;\n\n    public void insert(int val) {\n        root = insertRec(root, val);\n    }\n\n    private TreeNode insertRec(TreeNode root, int val) {\n        if (root == null) return new TreeNode(val);\n        if (val < root.val) root.left = insertRec(root.left, val);\n        else if (val > root.val) root.right = insertRec(root.right, val);\n        return root;\n    }\n\n    public void inorder(TreeNode root) {\n        if (root != null) {\n            inorder(root.left);\n            System.out.print(root.val + " ");\n            inorder(root.right);\n        }\n    }\n\n    public TreeNode deleteNode(TreeNode root, int key) {\n        if (root == null) return root;\n        if (key < root.val) root.left = deleteNode(root.left, key);\n        else if (key > root.val) root.right = deleteNode(root.right, key);\n        else {\n            if (root.left == null) return root.right;\n            else if (root.right == null) return root.left;\n            \n            TreeNode temp = getMin(root.right);\n            root.val = temp.val;\n            root.right = deleteNode(root.right, temp.val);\n        }\n        return root;\n    }\n\n    private TreeNode getMin(TreeNode root) {\n        while (root.left != null) root = root.left;\n        return root;\n    }\n}`,
                                cpp: `#include <iostream>\n#include <vector>\n\nstruct TreeNode {\n    int val;\n    TreeNode *left, *right;\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nclass BST {\npublic:\n    TreeNode* root = nullptr;\n\n    TreeNode* insert(TreeNode* node, int val) {\n        if (!node) return new TreeNode(val);\n        if (val < node->val) node->left = insert(node->left, val);\n        else if (val > node->val) node->right = insert(node->right, val);\n        return node;\n    }\n\n    void inorder(TreeNode* node, std::vector<int>& res) {\n        if (!node) return;\n        inorder(node->left, res);\n        res.push_back(node->val);\n        inorder(node->right, res);\n    }\n\n    TreeNode* deleteNode(TreeNode* root, int key) {\n        if (!root) return root;\n        if (key < root->val) root->left = deleteNode(root->left, key);\n        else if (key > root->val) root->right = deleteNode(root->right, key);\n        else {\n            if (!root->left) { TreeNode* temp = root->right; delete root; return temp; }\n            else if (!root->right) { TreeNode* temp = root->left; delete root; return temp; }\n            \n            TreeNode* temp = getMin(root->right);\n            root->val = temp->val;\n            root->right = deleteNode(root->right, temp->val);\n        }\n        return root;\n    }\n\n    TreeNode* getMin(TreeNode* node) {\n        while (node->left) node = node->left;\n        return node;\n    }\n};`,
                                javascript: `class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}\n\nclass BST {\n  constructor() { this.root = null; }\n\n  insert(val) {\n    const newNode = new TreeNode(val);\n    if (!this.root) { this.root = newNode; return; }\n    let curr = this.root;\n    while (true) {\n      if (val < curr.val) {\n        if (!curr.left) { curr.left = newNode; break; }\n        curr = curr.left;\n      } else {\n        if (!curr.right) { curr.right = newNode; break; }\n        curr = curr.right;\n      }\n    }\n  }\n\n  deleteNode(root, key) {\n    if (!root) return root;\n    if (key < root.val) root.left = this.deleteNode(root.left, key);\n    else if (key > root.val) root.right = this.deleteNode(root.right, key);\n    else {\n      if (!root.left) return root.right;\n      else if (!root.right) return root.left;\n      \n      let minNode = this.getMin(root.right);\n      root.val = minNode.val;\n      root.right = this.deleteNode(root.right, minNode.val);\n    }\n    return root;\n  }\n\n  getMin(node) {\n    while (node.left) node = node.left;\n    return node;\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "11. Code Explanation",
                        content: "Reviewing the code architecture:\n\n- **Recursive Deletion:** The `deleteNode` function is naturally recursive. It returns the updated tree pointer back up the call stack. Notice Case 3 (Two Children): we find the minimum node in the right subtree (`getMin`), copy its value into the current root to preserve the BST invariant, and then recursively call `deleteNode` on the right subtree to remove the duplicated successor.\n- **Iterative vs Recursive Insertion:** In Python/JS, we used an iterative `while(true)` loop to traverse and insert. In Java/C++, we used recursion. Iterative traversal uses O(1) space, while recursive traversal uses O(H) call stack space, meaning deeply nested recursive trees can trigger a Stack Overflow."
                    },
                    {
                        heading: "12. Hardware Perspective: Cache Misses",
                        content: "Similar to Linked Lists, Binary Trees perform terribly on modern CPU hardware. Because nodes are allocated randomly across the heap, traversing a tree guarantees a CPU Cache Miss at every single edge traversal. \n\nWhile a BST provides O(log N) search, an Array provides O(log N) Binary Search. Because the Array sits in contiguous memory and utilizes L1 Cache, Binary Search on an array is often vastly faster in physical execution time than searching a BST. BSTs are only used when the dataset requires constant insertions and deletions, which Arrays cannot handle efficiently."
                    },
                    {
                        heading: "13. Edge Cases: Duplicate Values",
                        content: "What happens if you insert a duplicate value (e.g., `50`) into a BST that already contains `50`? \n\nThe basic BST invariant `Left < Node < Right` does not account for equality. You have three choices in implementation:\n1. Ignore duplicates (act like a Set).\n2. Allow duplicates on the right side: `Left < Node <= Right`.\n3. Keep a `count` frequency variable inside the Node itself. (This is the most memory-efficient and widely used approach in production databases)."
                    },
                    {
                        heading: "14. Graph Algorithms vs Tree Algorithms",
                        content: "It is critical to understand that a Tree is just a specialized form of a Graph. A Tree is a Directed Acyclic Graph (DAG) where every node has exactly one parent (except the root), and there are no cycles. \n\nBecause trees have no cycles, tree traversals (like In-Order or BFS) do not require a `visited` HashSet to prevent infinite loops. If you transition to Graph algorithms later, remember that you must add `visited` tracking to prevent cycling endlessly around a ring of nodes."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "Trees are the foundation of modern computing infrastructure:\n\n- **Database Indexing (B-Trees):** MySQL and PostgreSQL do not use binary trees; they use B-Trees (a self-balancing tree where nodes can have dozens of children). This reduces the height of the tree, minimizing the number of slow SSD disk reads required to find a database row.\n- **File Systems:** Your OS file directory (C:\\Users\\Documents) is a literal Tree structure.\n- **3D Graphics (BSP Trees):** Video games use Binary Space Partitioning Trees to recursively divide 3D space, allowing the rendering engine to quickly determine which polygons are visible to the camera camera and which are hidden behind walls.\n- **Compilers:** The code you write is parsed into an Abstract Syntax Tree (AST) before it is compiled into machine code."
                    },
                    {
                        heading: "16. Interview Perspective",
                        content: "Trees are arguably the most heavily tested data structure in FAANG technical interviews because they perfectly test a candidate's grasp of Recursion.\n\n- **Common Interview Questions:** Invert a Binary Tree, Find Lowest Common Ancestor, Validate if a Tree is a BST, Maximum Depth of Binary Tree, Serialize and Deserialize a Tree.\n- **Optimization Trick:** Always clarify if the tree is a Binary *Search* Tree or just a Binary Tree. If it is a BST, you can usually solve the problem in O(log N) time by exploiting the Left < Node < Right property. If it is just a Binary Tree, you are forced to search the entire tree in O(N) time."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why is a Self-Balancing Tree (like AVL or Red-Black) necessary in production environments?", options: ["They use contiguous memory to prevent Cache Misses.", "They prevent the tree from degrading into a skewed O(N) Linked List if sorted data is inserted sequentially.", "They allow duplicate nodes.", "They execute insertions in O(1) time."], correctIndex: 1, explanation: "If you insert 1, 2, 3, 4 into a standard BST, it forms a right-leaning straight line (O(N) search time). Self-balancing trees automatically rotate nodes to maintain a flat O(log N) triangle shape." },
                    { id: "q2", question: "If you perform an In-Order Traversal (Left, Node, Right) on a valid Binary Search Tree, what is the guaranteed result?", options: ["The nodes are printed in reverse order.", "The tree is perfectly balanced.", "The nodes are printed in perfect ascending sorted order.", "The root node is printed last."], correctIndex: 2, explanation: "Because the BST invariant guarantees Left < Node < Right, an In-Order traversal mathematically guarantees that elements are visited from absolute minimum to absolute maximum." }
                ]
            },
            {
                id: "ds-heaps",
                slug: "heaps-and-priority-queues",
                categorySlug: "data-structures",
                title: "Heaps & Priority Queues",
                subtitle: "Complete binary trees stored as arrays for min/max priority retrieval",
                difficulty: "Intermediate",
                readTime: "35 min read",
                summary: "Understand min-heap / max-heap invariants, complete binary tree array mappings, Sift-Up / Sift-Down operations, Heapify, and Dijkstra's algorithm applications.",
                overview: "A Heap is a specialized tree-based data structure that satisfies the Heap Property: in a Max-Heap, every parent node is strictly greater than or equal to its children; in a Min-Heap, every parent node is strictly less than or equal to its children. Unlike a Binary Search Tree (BST) which is sorted horizontally (left-to-right), a Heap is sorted vertically (top-to-bottom). Because it only cares about vertical relationships, a Heap cannot search for an arbitrary element efficiently. However, it is the absolute fastest data structure for repeatedly finding and removing the global maximum or minimum element in O(log N) time. Heaps are the engine behind Priority Queues, OS Task Schedulers, and Dijkstra's Shortest Path algorithm.",
                keyConcepts: [
                    "The Heap Property: Vertical Top-to-Bottom sorting",
                    "Complete Binary Trees and left-justified node population",
                    "The Implicit Array Mapping: left_child = 2i + 1, right_child = 2i + 2",
                    "Insertion via Sift-Up (Bubble-Up) in O(log N)",
                    "Deletion (Extract-Min) via Sift-Down (Sink-Down) in O(log N)",
                    "Heapify: Building a heap from an unsorted array in O(N) time"
                ],
                timeComplexity: { access: "O(1) for Root", search: "O(n)", insertion: "O(log n)", deletion: "O(log n)" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. The Need for Priority",
                        content: "Standard Queues are strictly First-In, First-Out (FIFO). But the real world rarely operates on pure FIFO. Imagine an emergency room: patients arrive in a certain order, but a patient with a heart attack (High Priority) must bypass the queue of patients with sprained ankles (Low Priority). \n\nIf we use an Array, finding the highest priority patient takes O(N) time. If we keep the Array sorted, finding the patient takes O(1) time, but inserting a new patient takes O(N) time because we have to shift elements. A Priority Queue solves this by using a Heap, giving us O(log N) insertion and O(log N) deletion."
                    },
                    {
                        heading: "2. The Complete Binary Tree",
                        content: "A Heap is always structured as a **Complete Binary Tree**. \n\nThis means every single level of the tree must be fully filled with nodes before you can start adding nodes to the next level down. Furthermore, when adding nodes to a new level, they must be filled from left-to-right without any gaps. \n\nThis strict structural requirement guarantees that the tree is perfectly balanced. A Heap with N nodes will always have an exact height of `floor(log2(N))`. It can never degrade into an O(N) Linked List like a BST can."
                    },
                    {
                        heading: "3. The Implicit Array Mapping (Zero Pointers)",
                        content: "Here is the greatest trick in computer science: Because a Heap is a Complete Binary Tree with no gaps, we do not need to use `TreeNode` objects with `left` and `right` pointers! \n\nWe can store the entire tree inside a flat Array, and calculate the parent/child relationships using pure math on the array indices. For any node at index `i` (using 0-based indexing):\n\n- **Left Child:** `2 * i + 1`\n- **Right Child:** `2 * i + 2`\n- **Parent Node:** `floor((i - 1) / 2)`\n\nThis saves massive amounts of RAM (no pointer overhead) and guarantees 100% CPU Cache Hits because the data is contiguous in memory."
                    },
                    {
                        heading: "4. Memory Visualization: Array Mapping",
                        content: "Let us trace how a Min-Heap tree maps perfectly into a flat array.",
                        diagram: `Min-Heap Tree:
       [10]          (Index 0)
      /    \\
   [20]    [30]      (Index 1, 2)
   /  \\    /
[40][50] [60]        (Index 3, 4, 5)

Flat Array: 
[ 10, 20, 30, 40, 50, 60 ]
  0   1   2   3   4   5

Let's test the math on Node 20 (Index 1):
Left Child  = 2(1) + 1 = 3 (Value 40)  -> CORRECT
Right Child = 2(1) + 2 = 4 (Value 50)  -> CORRECT
Parent      = (1-1)/2  = 0 (Value 10)  -> CORRECT`
                    },
                    {
                        heading: "5. Insertion: Sift-Up (Bubble-Up)",
                        content: "How do we add a new value (e.g., `5`) to our Min-Heap? \n\nStep 1: To maintain the Complete Tree structure, we must append `5` to the very end of the array (bottom-left most available spot in the tree). \nStep 2: However, `5` is smaller than its parent, violating the Min-Heap property. \nStep 3: We perform a **Sift-Up**. We compare `5` with its parent. If `5` is smaller, we swap them. We repeat this swapping process, bubbling the `5` up the tree until it is larger than its parent or it becomes the new Root. Because the tree height is `log(N)`, Sift-Up takes O(log N) time max."
                    },
                    {
                        heading: "6. Extract-Min: Sift-Down (Sink-Down)",
                        content: "How do we remove and return the minimum value? \n\nStep 1: The minimum value in a Min-Heap is always at the Root (Index 0). But if we remove Index 0, we fracture the array. \nStep 2: We take the very last element in the array and move it to Index 0. We then shrink the array size by 1. The Tree structure is preserved, but the Root is now a massive number that violates the Heap property. \nStep 3: We perform a **Sift-Down**. We compare the new Root with its two children, and swap it with the *smaller* of the two children. We repeat this, sinking the large number down the tree until it is smaller than both of its children. This also takes O(log N) time."
                    },
                    {
                        heading: "7. Building a Heap: O(N) vs O(N log N)",
                        content: "If you have an unsorted array of N elements, how do you turn it into a Heap? \n\nThe naive way is to create an empty Heap and `insert()` all N elements one by one. Since each insertion takes O(log N), building the heap takes **O(N log N)** time. \n\nBut there is a faster way called **Heapify**. We treat the unsorted array as a broken heap. We start at the last non-leaf node (index `N/2 - 1`) and call `Sift-Down` on every node working backwards to index 0. Because most nodes are at the bottom of the tree and only need to sift down 0 or 1 levels, the mathematics sum up to a beautiful **O(N)** time complexity. This is significantly faster."
                    },
                    {
                        heading: "8. The Priority Queue Interface",
                        content: "It is important to differentiate the abstract concept from the implementation. \n\nA **Priority Queue** is an Abstract Data Type (like a standard Queue) that requires `enqueue()` and `dequeue_highest_priority()`. \nA **Heap** is the physical data structure (using the array math and sift operations) that *implements* the Priority Queue efficiently."
                    },
                    {
                        heading: "9. Code Example: Custom Min-Heap Implementation",
                        content: "While all languages have built-in priority queues, implementing a raw Heap array demonstrates mastery of the Sift operations.",
                        codeSnippet: {
                            title: "Min-Heap Array Implementation",
                            code: {
                                python: `class MinHeap:\n    def __init__(self):\n        self.heap = []\n\n    def push(self, val):\n        self.heap.append(val)\n        self._sift_up(len(self.heap) - 1)\n\n    def pop(self):\n        if not self.heap: return None\n        if len(self.heap) == 1: return self.heap.pop()\n        \n        min_val = self.heap[0]\n        self.heap[0] = self.heap.pop() # Move last to root\n        self._sift_down(0)\n        return min_val\n\n    def _sift_up(self, idx):\n        parent = (idx - 1) // 2\n        if idx > 0 and self.heap[idx] < self.heap[parent]:\n            self.heap[idx], self.heap[parent] = self.heap[parent], self.heap[idx]\n            self._sift_up(parent)\n\n    def _sift_down(self, idx):\n        smallest = idx\n        left = 2 * idx + 1\n        right = 2 * idx + 2\n\n        if left < len(self.heap) and self.heap[left] < self.heap[smallest]:\n            smallest = left\n        if right < len(self.heap) and self.heap[right] < self.heap[smallest]:\n            smallest = right\n\n        if smallest != idx:\n            self.heap[idx], self.heap[smallest] = self.heap[smallest], self.heap[idx]\n            self._sift_down(smallest)`,
                                java: `import java.util.ArrayList;\n\npublic class MinHeap {\n    private ArrayList<Integer> heap = new ArrayList<>();\n\n    public void push(int val) {\n        heap.add(val);\n        siftUp(heap.size() - 1);\n    }\n\n    public Integer pop() {\n        if (heap.isEmpty()) return null;\n        if (heap.size() == 1) return heap.remove(heap.size() - 1);\n\n        int minVal = heap.get(0);\n        heap.set(0, heap.remove(heap.size() - 1));\n        siftDown(0);\n        return minVal;\n    }\n\n    private void siftUp(int idx) {\n        int parent = (idx - 1) / 2;\n        if (idx > 0 && heap.get(idx) < heap.get(parent)) {\n            swap(idx, parent);\n            siftUp(parent);\n        }\n    }\n\n    private void siftDown(int idx) {\n        int smallest = idx;\n        int left = 2 * idx + 1;\n        int right = 2 * idx + 2;\n\n        if (left < heap.size() && heap.get(left) < heap.get(smallest)) smallest = left;\n        if (right < heap.size() && heap.get(right) < heap.get(smallest)) smallest = right;\n\n        if (smallest != idx) {\n            swap(idx, smallest);\n            siftDown(smallest);\n        }\n    }\n\n    private void swap(int i, int j) {\n        int temp = heap.get(i);\n        heap.set(i, heap.get(j));\n        heap.set(j, temp);\n    }\n}`,
                                cpp: `#include <vector>\n#include <algorithm>\n\nclass MinHeap {\nprivate:\n    std::vector<int> heap;\n\n    void siftUp(int idx) {\n        int parent = (idx - 1) / 2;\n        if (idx > 0 && heap[idx] < heap[parent]) {\n            std::swap(heap[idx], heap[parent]);\n            siftUp(parent);\n        }\n    }\n\n    void siftDown(int idx) {\n        int smallest = idx;\n        int left = 2 * idx + 1;\n        int right = 2 * idx + 2;\n\n        if (left < heap.size() && heap[left] < heap[smallest]) smallest = left;\n        if (right < heap.size() && heap[right] < heap[smallest]) smallest = right;\n\n        if (smallest != idx) {\n            std::swap(heap[idx], heap[smallest]);\n            siftDown(smallest);\n        }\n    }\n\npublic:\n    void push(int val) {\n        heap.push_back(val);\n        siftUp(heap.size() - 1);\n    }\n\n    int pop() {\n        if (heap.empty()) throw std::out_of_range("Heap is empty");\n        int minVal = heap[0];\n        heap[0] = heap.back();\n        heap.pop_back();\n        siftDown(0);\n        return minVal;\n    }\n};`,
                                javascript: `class MinHeap {\n  constructor() { this.heap = []; }\n\n  push(val) {\n    this.heap.push(val);\n    this._siftUp(this.heap.length - 1);\n  }\n\n  pop() {\n    if (this.heap.length === 0) return null;\n    if (this.heap.length === 1) return this.heap.pop();\n    \n    const minVal = this.heap[0];\n    this.heap[0] = this.heap.pop();\n    this._siftDown(0);\n    return minVal;\n  }\n\n  _siftUp(idx) {\n    const parent = Math.floor((idx - 1) / 2);\n    if (idx > 0 && this.heap[idx] < this.heap[parent]) {\n      [this.heap[idx], this.heap[parent]] = [this.heap[parent], this.heap[idx]];\n      this._siftUp(parent);\n    }\n  }\n\n  _siftDown(idx) {\n    let smallest = idx;\n    const left = 2 * idx + 1;\n    const right = 2 * idx + 2;\n\n    if (left < this.heap.length && this.heap[left] < this.heap[smallest]) smallest = left;\n    if (right < this.heap.length && this.heap[right] < this.heap[smallest]) smallest = right;\n\n    if (smallest !== idx) {\n      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];\n      this._siftDown(smallest);\n    }\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "10. Code Explanation",
                        content: "Let us dissect the `_sift_down` logic:\n\nNotice that we calculate both the `left` and `right` children. Unlike a BST where we know exactly which way to go, a Min-Heap's left and right children have no guaranteed relationship to each other (the left could be 100, the right could be 5). We must check *both* children, find which one is the absolute smallest, and swap our current node with that smallest child. We recursively continue this until the node reaches the bottom or becomes smaller than both its children."
                    },
                    {
                        heading: "11. Language Built-ins",
                        content: "In technical interviews, you should never write a Heap from scratch unless asked. Use the highly optimized language built-ins:\n\n- **Python:** `import heapq`. The `heapq` module provides functions that act on standard lists: `heapq.heappush(arr, val)` and `heapq.heappop(arr)`. It is exclusively a Min-Heap. For a Max-Heap, you must multiply your values by `-1` before pushing.\n- **Java:** `PriorityQueue<Integer> pq = new PriorityQueue<>();`. It is a Min-Heap by default. For a Max-Heap, pass a reverse comparator: `new PriorityQueue<>(Collections.reverseOrder());`.\n- **C++:** `#include <queue>`. `std::priority_queue<int> pq;`. Interestingly, C++ is a **Max-Heap** by default. To make it a Min-Heap, use `std::priority_queue<int, std::vector<int>, std::greater<int>> pq;`."
                    },
                    {
                        heading: "12. Hardware Perspective: CPU Cache & Heaps",
                        content: "While Heaps are array-backed (granting contiguous memory), they actually suffer from Cache Misses when the heap gets very large. \n\nWhen a Sift-Down occurs, it jumps from Index 1, to Index 3, to Index 7, to Index 15. The memory jumps double in size every step. For a massive heap, these jumps quickly exceed the CPU's L1 and L2 cache boundaries, forcing the CPU to fetch from slow main RAM. B-Trees and Fibonacci Heaps are often used in extreme-scale systems to mitigate this."
                    },
                    {
                        heading: "13. Heap Sort",
                        content: "Heaps give us a famous O(N log N) sorting algorithm: Heap Sort. \n\nIf you take an unsorted array, run the O(N) Heapify process to turn it into a Max-Heap, and then repeatedly call Extract-Max, the elements will come out in descending order. By swapping the extracted max element to the end of the array, you can sort the entire array *in-place* with absolutely zero O(N) extra memory footprint (unlike Merge Sort). Heap Sort is heavily used in embedded systems with strict memory limits."
                    },
                    {
                        heading: "14. Graph Algorithms: Dijkstra's Algorithm",
                        content: "The most famous use case of a Priority Queue is Dijkstra's Shortest Path Algorithm for finding directions on a map. \n\nWhen traversing a road network, you don't want to use a standard Queue (BFS), because that treats all roads equally. Some roads are highways (fast), some are dirt roads (slow). Dijkstra pushes every discovered intersection into a Min-Heap, where the priority is the *total time taken to get there*. The Min-Heap guarantees that the algorithm always explores the fastest possible routes first, ensuring the shortest path is found optimally."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "Heaps are the backbone of priority systems:\n\n- **OS Schedulers:** Linux and Windows CPUs use Priority Queues to decide which thread to execute next. System threads (like handling keyboard input) have high priority; background update threads have low priority.\n- **Event-Driven Simulations:** Simulations push future events into a Min-Heap keyed by the timestamp of when they occur. The simulator just pops the closest event in time.\n- **Data Streams:** Finding the 'Top K Trending Tweets' in a stream of millions of tweets is solved using a Min-Heap of size K."
                    },
                    {
                        heading: "16. Summary",
                        content: "The Heap is a masterclass in exploiting mathematical properties. By restricting a binary tree to be perfectly 'Complete', it eliminates the need for pointers entirely, mapping perfectly into a flat Array. It abandons horizontal sorting (BST) in favor of vertical sorting, granting it the unparalleled ability to add and remove extreme values in O(log N) time, making it the definitive structure for Priority Queues and pathfinding algorithms."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why doesn't a Heap use 'TreeNode' objects with 'left' and 'right' pointers?", options: ["Pointers are banned in Java.", "Heaps are not actually trees.", "Because a Heap is a Complete Binary Tree, it can be mapped directly into a flat Array using the math `left = 2i+1`, saving massive pointer memory overhead.", "Pointers take O(N) time to traverse."], correctIndex: 2, explanation: "The Complete Tree property guarantees there are no gaps. This mathematical guarantee allows array indices to perfectly simulate tree edges, providing contiguous memory and saving RAM." },
                    { id: "q2", question: "If you have an unsorted array of N elements, what is the fastest time complexity to structure it into a valid Heap?", options: ["O(log N)", "O(N)", "O(N log N)", "O(N^2)"], correctIndex: 1, explanation: "While inserting N elements one-by-one takes O(N log N), the bottom-up 'Heapify' algorithm can transform an array into a heap in true O(N) time by sinking nodes from the bottom up." }
                ]
            },
            {
                id: "ds-hashtables",
                slug: "hash-tables",
                categorySlug: "data-structures",
                title: "Hash Tables & Hashing",
                subtitle: "Hash functions, collision resolution, and constant-time key-value mapping",
                difficulty: "Intermediate",
                readTime: "40 min read",
                summary: "Master cryptographic and non-cryptographic hashing, Open Addressing vs Separate Chaining collision resolution, Load Factors, Rehashing, and consistent hashing systems.",
                overview: "A Hash Table (or Dictionary/HashMap) is arguably the most important data structure in modern software engineering. It maps 'Keys' to 'Values' (like a dictionary mapping a word to its definition). Unlike arrays which require integer indices, Hash Tables allow strings, objects, or any arbitrary data type to act as the index. By passing the Key through a mathematical 'Hash Function', the string is deterministically converted into an integer index, allowing the data to be instantly stored in an underlying array. This provides near-magical O(1) constant time lookups, insertions, and deletions, regardless of whether the table holds ten items or ten billion items.",
                keyConcepts: [
                    "Deterministic Hash Functions and Uniform Distribution",
                    "The Modulo Bucket Index calculation: hash(key) % capacity",
                    "Collision Resolution 1: Separate Chaining (Linked Lists in Buckets)",
                    "Collision Resolution 2: Open Addressing (Linear & Quadratic Probing)",
                    "Load Factor thresholds and O(N) Rehashing triggers",
                    "Cryptographic (SHA-256) vs Non-Cryptographic (MurmurHash) algorithms"
                ],
                timeComplexity: { access: "O(1) avg / O(n) worst", search: "O(1) avg / O(n) worst", insertion: "O(1) avg / O(n) worst", deletion: "O(1) avg" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. The Dictionary Problem",
                        content: "Imagine building a Phone Book application. You want to look up 'Alice' and get her phone number. \n\nIf you use an Array, you must iterate through every entry until you find 'Alice' (O(N) time). If you sort the Array and use Binary Search, it takes O(log N) time, but inserting a new person requires O(N) shifting. If you use a Binary Search Tree, it takes O(log N) time for everything. \n\nBut we want perfection: O(1) time. We want to instantly know exactly where Alice's number is stored in RAM without searching. Hash Tables achieve this by turning the word 'Alice' into the memory address itself."
                    },
                    {
                        heading: "2. The Hash Function",
                        content: "The core of a Hash Table is the **Hash Function**. \n\nA Hash Function takes an input of any size (a string, an image, a file) and scrambles it into a fixed-size integer. For a hash function to be valid for a Hash Table, it must follow two absolute rules:\n1. **Deterministic:** If you input 'Alice', it must ALWAYS output the exact same integer (e.g., `83492749`).\n2. **Uniform Distribution:** It should scramble inputs so randomly that 'Alice' and 'Alicf' output completely different, wildly separated integers, preventing data from bunching up."
                    },
                    {
                        heading: "3. Mapping to the Array (Modulo Arithmetic)",
                        content: "Once we have the massive hash integer (e.g., `83492749`), we cannot just use it as an array index, because we do not have 83 million slots of memory. \n\nSuppose our underlying physical array only has a capacity of `10`. We use Modulo arithmetic to force the massive hash into the array bounds: `bucket_index = hash_value % capacity`.\n\nFor 'Alice': `83492749 % 10 = 9`. \nAlice's phone number is placed exactly at `array[9]`. When we want to look her up tomorrow, we hash 'Alice' again, get 9, and instantly check `array[9]`. This is O(1) access."
                    },
                    {
                        heading: "4. The Reality of Collisions",
                        content: "Because the number of possible inputs (infinite strings) is vastly larger than the capacity of our array (10 slots), the Pigeonhole Principle dictates that two different keys *must* eventually map to the same bucket. \n\nSuppose we hash 'Bob' and get `43288129`. We modulo it: `43288129 % 10 = 9`. \n\nBob maps to `array[9]`. But Alice is already at `array[9]`! This is called a **Hash Collision**. A Hash Table must have a system to resolve collisions without overwriting Alice's data."
                    },
                    {
                        heading: "5. Collision Resolution: Separate Chaining",
                        content: "The most common way to resolve collisions (used by Java's `HashMap`) is **Separate Chaining**.\n\nInstead of storing the data directly in the array slot, the array stores pointers to Linked Lists (or Trees). \nIf Alice and Bob both map to Index 9, `array[9]` becomes a Linked List: `[Alice's Data] -> [Bob's Data]`. \n\nWhen searching for 'Bob', we hash him, jump to Index 9, and then linearly traverse the linked list until we find Bob. If the hash function is good, the lists remain very short (1 or 2 items), preserving O(1) average time."
                    },
                    {
                        heading: "6. Collision Resolution: Open Addressing",
                        content: "The alternative is **Open Addressing** (used by Python's `dict`). It avoids Linked Lists entirely, keeping all data physically inside the main array to maximize CPU Cache hits. \n\nIf Bob maps to Index 9, but Alice is there, Open Addressing simply looks for the next available empty slot in the array. \n- **Linear Probing:** Check index 10, then 11, then 12... until an empty slot is found.\n- **Quadratic Probing:** Check index 9+1, then 9+4, then 9+9... jumping in quadratic intervals to avoid clustering.\n\nWhen searching for Bob later, if Index 9 is Alice, the algorithm just repeats the probing sequence until it finds Bob."
                    },
                    {
                        heading: "7. The Load Factor and Rehashing",
                        content: "As a Hash Table fills up, collisions become inevitable, and performance degrades from O(1) to O(N) as the chained linked lists grow infinitely long or Open Addressing probes endlessly. \n\nTo prevent this, Hash Tables monitor their **Load Factor** (Number of Elements / Total Capacity). In Java, the default threshold is `0.75` (75% full). \n\nWhen the table hits 75% capacity, it triggers a **Rehash**. The system halts, allocates a brand new array *double* the size of the old one, and individually re-hashes and moves every single item from the old array into the new array. This is a massive O(N) operation, which is why Hash Tables occasionally experience sudden latency spikes."
                    },
                    {
                        heading: "8. Cryptographic vs Non-Cryptographic Hashing",
                        content: "Not all hash functions are built the same.\n\n- **Cryptographic (SHA-256, MD5):** Designed for security. They are slow, mathematically irreversible, and immune to deliberate collision attacks (hackers trying to craft malicious inputs to break your server). Used for passwords and blockchains.\n- **Non-Cryptographic (MurmurHash, CityHash, FNV-1a):** Designed purely for speed and uniform distribution. They are blazingly fast but reversible. Hash Tables use these because security is not needed for memory indexing, only speed."
                    },
                    {
                        heading: "9. Denial of Service (DoS) via Hash Collisions",
                        content: "If a web server uses a predictable hash function, hackers can execute a 'Hash Collision DoS Attack'. \n\nThe hacker computes 100,000 distinct strings that they know will all modulo to the exact same array bucket (e.g., Index 0). They send these strings to the server as a JSON payload. The server's Hash Table degrades into a single massive Linked List of 100,000 items. Every subsequent insertion now takes O(N) time. The CPU hits 100% utilization just iterating the list, and the server crashes. Modern languages prevent this by randomizing the hash seed on every server boot."
                    },
                    {
                        heading: "10. Code Example: Custom Hash Table Implementation",
                        content: "Below is a custom implementation of a Hash Table using Separate Chaining for collision resolution.",
                        codeSnippet: {
                            title: "Hash Table (Separate Chaining)",
                            code: {
                                python: `class Node:\n    def __init__(self, key, value):\n        self.key = key\n        self.value = value\n        self.next = None\n\nclass HashTable:\n    def __init__(self, capacity=16):\n        self.capacity = capacity\n        self.buckets = [None] * self.capacity\n        self.size = 0\n\n    def _hash(self, key):\n        return hash(key) % self.capacity\n\n    def put(self, key, value):\n        idx = self._hash(key)\n        curr = self.buckets[idx]\n        \n        # Update if exists\n        while curr:\n            if curr.key == key:\n                curr.value = value\n                return\n            curr = curr.next\n            \n        # Insert new at head of chain\n        new_node = Node(key, value)\n        new_node.next = self.buckets[idx]\n        self.buckets[idx] = new_node\n        self.size += 1\n        \n        if self.size / self.capacity > 0.75: self._rehash()\n\n    def get(self, key):\n        idx = self._hash(key)\n        curr = self.buckets[idx]\n        while curr:\n            if curr.key == key: return curr.value\n            curr = curr.next\n        return None\n\n    def _rehash(self):\n        old_buckets = self.buckets\n        self.capacity *= 2\n        self.buckets = [None] * self.capacity\n        self.size = 0\n        for curr in old_buckets:\n            while curr:\n                self.put(curr.key, curr.value)\n                curr = curr.next`,
                                java: `class Node<K, V> {\n    K key;\n    V value;\n    Node<K, V> next;\n    public Node(K key, V value) { this.key = key; this.value = value; }\n}\n\npublic class CustomHashMap<K, V> {\n    private Node<K, V>[] buckets;\n    private int capacity = 16;\n    private int size = 0;\n\n    @SuppressWarnings(\"unchecked\")\n    public CustomHashMap() {\n        buckets = new Node[capacity];\n    }\n\n    private int getHash(K key) {\n        return Math.abs(key.hashCode()) % capacity;\n    }\n\n    public void put(K key, V value) {\n        int idx = getHash(key);\n        Node<K, V> curr = buckets[idx];\n\n        while (curr != null) {\n            if (curr.key.equals(key)) {\n                curr.value = value; return;\n            }\n            curr = curr.next;\n        }\n\n        Node<K, V> newNode = new Node<>(key, value);\n        newNode.next = buckets[idx];\n        buckets[idx] = newNode;\n        size++;\n\n        if ((float) size / capacity > 0.75f) rehash();\n    }\n\n    public V get(K key) {\n        int idx = getHash(key);\n        Node<K, V> curr = buckets[idx];\n        while (curr != null) {\n            if (curr.key.equals(key)) return curr.value;\n            curr = curr.next;\n        }\n        return null;\n    }\n\n    @SuppressWarnings(\"unchecked\")\n    private void rehash() {\n        Node<K, V>[] oldBuckets = buckets;\n        capacity *= 2;\n        buckets = new Node[capacity];\n        size = 0;\n        for (Node<K, V> head : oldBuckets) {\n            while (head != null) {\n                put(head.key, head.value);\n                head = head.next;\n            }\n        }\n    }\n}`,
                                cpp: `#include <vector>\n#include <string>\n#include <list>\n\nclass HashTable {\nprivate:\n    struct Node {\n        std::string key;\n        int value;\n    };\n    \n    std::vector<std::list<Node>> buckets;\n    int capacity;\n    int size;\n\n    int hashFunc(const std::string& key) {\n        return std::hash<std::string>{}(key) % capacity;\n    }\n\n    void rehash() {\n        auto old_buckets = buckets;\n        capacity *= 2;\n        buckets.assign(capacity, std::list<Node>());\n        size = 0;\n        for (auto& list : old_buckets) {\n            for (auto& node : list) {\n                put(node.key, node.value);\n            }\n        }\n    }\n\npublic:\n    HashTable(int cap = 16) : capacity(cap), size(0) {\n        buckets.resize(capacity);\n    }\n\n    void put(std::string key, int value) {\n        int idx = hashFunc(key);\n        for (auto& node : buckets[idx]) {\n            if (node.key == key) {\n                node.value = value;\n                return;\n            }\n        }\n        buckets[idx].push_back({key, value});\n        size++;\n        if ((float)size / capacity > 0.75) rehash();\n    }\n\n    int get(std::string key) {\n        int idx = hashFunc(key);\n        for (auto& node : buckets[idx]) {\n            if (node.key == key) return node.value;\n        }\n        return -1; // Not found\n    }\n};`,
                                javascript: `class Node {\n  constructor(key, value) {\n    this.key = key;\n    this.value = value;\n    this.next = null;\n  }\n}\n\nclass HashTable {\n  constructor(capacity = 16) {\n    this.capacity = capacity;\n    this.buckets = new Array(capacity).fill(null);\n    this.size = 0;\n  }\n\n  _hash(key) {\n    let hash = 0;\n    for (let i = 0; i < key.length; i++) {\n      hash = (hash << 5) - hash + key.charCodeAt(i);\n    }\n    return Math.abs(hash) % this.capacity;\n  }\n\n  put(key, value) {\n    const idx = this._hash(key);\n    let curr = this.buckets[idx];\n\n    while (curr) {\n      if (curr.key === key) {\n        curr.value = value;\n        return;\n      }\n      curr = curr.next;\n    }\n\n    const newNode = new Node(key, value);\n    newNode.next = this.buckets[idx];\n    this.buckets[idx] = newNode;\n    this.size++;\n\n    if (this.size / this.capacity > 0.75) this._rehash();\n  }\n\n  get(key) {\n    const idx = this._hash(key);\n    let curr = this.buckets[idx];\n    while (curr) {\n      if (curr.key === key) return curr.value;\n      curr = curr.next;\n    }\n    return null;\n  }\n\n  _rehash() {\n    const oldBuckets = this.buckets;\n    this.capacity *= 2;\n    this.buckets = new Array(this.capacity).fill(null);\n    this.size = 0;\n    for (let curr of oldBuckets) {\n      while (curr) {\n        this.put(curr.key, curr.value);\n        curr = curr.next;\n      }\n    }\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "11. Code Explanation",
                        content: "Reviewing the Chaining implementation:\n\n- **Insertion at Head:** When a collision occurs, we do not append the new `Node` to the *end* of the linked list (which would take O(L) time). We insert it at the *Head* of the list (by pointing `newNode.next` to the existing bucket head, and replacing the bucket). This guarantees O(1) collision insertion.\n- **Rehashing Detail:** Notice in `_rehash()` we don't just copy the old linked lists over. We must physically call `put()` on every single old node. Why? Because `capacity` has doubled from 16 to 32. A key that originally modulo'd to Index 5 `(21 % 16 = 5)` might now modulo to Index 21 `(21 % 32 = 21)`. Everything must be recalculated."
                    },
                    {
                        heading: "12. Hardware Optimization: Java 8 Trees",
                        content: "What happens if a Hash Table degrades into a massive Linked List due to extreme collisions? \n\nIn Java 8, Oracle Engineers implemented a brilliant fallback. If any single bucket's Linked List exceeds 8 elements, the `HashMap` dynamically transforms that specific Linked List into a Red-Black Binary Search Tree. This ensures that even in the absolutely worst-case collision scenario (or under a hacker's DoS attack), the search time degrades to O(log N) instead of catastrophic O(N)."
                    },
                    {
                        heading: "13. Sets vs Maps",
                        content: "A `HashSet` (or `set` in Python) is literally just a Hash Table under the hood. \n\nThe only difference is that a Map stores `(Key, Value)` pairs, while a Set only stores `(Key, Null)`. The Set uses the exact same hash function and bucket logic to provide O(1) insertion and O(1) existence checking, which is why Sets are the ultimate tool for removing duplicates from a list."
                    },
                    {
                        heading: "14. Advanced Concept: Consistent Hashing",
                        content: "In massive distributed systems (like Amazon AWS or Netflix), databases are sharded across hundreds of servers. If you want to find user Alice's data, which server is it on? \n\nYou use a Hash Table: `server_idx = hash('Alice') % num_servers`. \nBut what if `num_servers` changes? If Netflix adds a new server, the capacity changes from 100 to 101. Suddenly, the modulo math changes for *every single user*. The entire multi-petabyte database would need to be rehashed and moved over the network, crashing the internet. \n\n**Consistent Hashing** maps both the Users AND the Servers to an infinite 360-degree ring, ensuring that when a server is added or removed, only 1/Nth of the data needs to move."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "Hash Tables run the world:\n\n- **Databases:** NoSQL databases like Redis and Memcached are literally just giant RAM-based Hash Tables operating over a network.\n- **Compilers:** The compiler uses a 'Symbol Table' (a Hash Map) to keep track of every variable name you define and map it to a physical memory register.\n- **Caching:** Every web browser and CDN uses a HashMap to map a URL (Key) to the downloaded HTML/Image file (Value) so it doesn't have to re-download it.\n- **Cryptography:** Blockchain mining (Bitcoin) is essentially trillions of servers guessing random inputs into the SHA-256 Hash Function until they find an output that starts with a specific number of zeros."
                    },
                    {
                        heading: "16. Summary",
                        content: "The Hash Table is the closest thing to magic in computer science. By abandoning the idea of searching altogether and instead using mathematical cryptography to calculate exact memory addresses, it achieves O(1) scalability. Whether you are building a small Python script or architecting a globally distributed caching layer, the Hash Table is the undisputed king of fast data retrieval."
                    }
                ],
                quiz: [
                    { id: "q1", question: "What is the primary purpose of 'Rehashing' when a Hash Table exceeds its Load Factor?", options: ["To encrypt the data more securely.", "To switch from Open Addressing to Separate Chaining.", "To allocate a larger underlying array and recalculate all modulo indices to reduce collision frequency and restore O(1) performance.", "To delete old unused keys from memory."], correctIndex: 2, explanation: "As buckets fill up, collisions increase search time. Rehashing expands the physical array (usually doubling it) and recalculates all positions, thinning out the data and eliminating long collision chains." },
                    { id: "q2", question: "How does 'Separate Chaining' handle a Hash Collision?", options: ["It probes the array linearly to find the next empty slot.", "It throws an OutOfMemory Exception.", "It overwrites the old data with the new data.", "It stores both items in a Linked List (or Tree) located at that specific array index."], correctIndex: 3, explanation: "Separate Chaining handles collisions by allowing multiple items to share a single bucket index, linking them together sequentially so none are lost." }
                ]
            },
            {
                id: "ds-graphs",
                slug: "graph-data-structures",
                categorySlug: "data-structures",
                title: "Graph Representations",
                subtitle: "Adjacency Matrices, Adjacency Lists, and Edge Lists for modeling networks",
                difficulty: "Intermediate",
                readTime: "30 min read",
                summary: "Master the mathematical modeling of networks. Understand Directed vs Undirected graphs, Adjacency Matrices vs Adjacency Lists, and how memory constraints dictate Graph Architecture in production systems.",
                overview: "While Trees model hierarchical data (like a company org chart), Graphs model arbitrary relationships (like Facebook friendships, Google Maps road networks, or Internet routing protocols). A Graph mathematically consists of Vertices (the entities) and Edges (the connections between them). Because Graph traversal algorithms (like BFS, DFS, Dijkstra, and A*) are incredibly computationally expensive, the way you choose to physically store the Graph in RAM (the Representation) determines whether your algorithm runs in milliseconds or crashes the server with OutOfMemory errors.",
                keyConcepts: [
                    "Vertices (Nodes) and Edges (Connections)",
                    "Directed vs Undirected edges, Weighted vs Unweighted graphs",
                    "Adjacency Matrix: O(V^2) memory, O(1) edge lookup",
                    "Adjacency List: O(V + E) memory, O(Degree) edge lookup",
                    "Edge Lists and Object-Oriented representations",
                    "Sparse vs Dense graphs and their impact on data structure choice"
                ],
                spaceComplexity: "O(V + E) Adjacency List / O(V^2) Matrix",
                sections: [
                    {
                        heading: "1. The Anatomy of a Graph",
                        content: "A Graph is defined mathematically as `G = (V, E)`.\n- **V (Vertices/Nodes):** The entities in the network. If we are modeling Google Maps, the Vertices are the street intersections.\n- **E (Edges):** The links connecting the Vertices. In Google Maps, the Edges are the physical roads connecting the intersections.\n\nEvery data structure you have learned so far is technically a Graph. A Linked List is a Graph where every vertex has exactly 1 edge pointing forward. A Binary Tree is a Graph where every vertex has up to 2 edges pointing downward, and no cycles exist."
                    },
                    {
                        heading: "2. Graph Typology",
                        content: "Graphs are categorized by the nature of their edges:\n\n- **Undirected Graph:** Edges are two-way streets. If Alice is friends with Bob on Facebook, Bob is automatically friends with Alice. `A <-> B`.\n- **Directed Graph (Digraph):** Edges are one-way streets. If Alice follows Bob on Twitter, Bob does not automatically follow Alice. `A -> B`.\n- **Unweighted Graph:** All edges are equal. The cost to traverse from A to B is 1 step.\n- **Weighted Graph:** Edges have numerical costs. In Google Maps, the edge from City A to City B might have a weight of 50 (representing 50 miles or 50 minutes of driving time)."
                    },
                    {
                        heading: "3. Sparse vs Dense Graphs",
                        content: "Before writing any code, a Software Engineer must ask: 'Is my Graph Sparse or Dense?'\n\n- **Dense Graph:** Almost every vertex is connected to almost every other vertex. If there are `V` vertices, the number of edges `E` is close to `V^2`. (Example: A peer-to-peer network where every computer has an open socket to every other computer).\n- **Sparse Graph:** The number of edges `E` is very small compared to `V^2`. (Example: Facebook has 3 billion users `V`. If it were dense, everyone would have 3 billion friends. But the average user only has 300 friends. Therefore, `E` is microscopic compared to `V^2`).\n\nThe vast majority of real-world networks are Sparse."
                    },
                    {
                        heading: "4. Representation 1: Adjacency Matrix",
                        content: "An **Adjacency Matrix** is a 2D Array (a grid) of size `V x V`.\n\nIf the graph has 5 vertices (0 through 4), we create a `5x5` matrix initialized to zeroes (or infinity). If there is an edge connecting Vertex 2 to Vertex 4, we set `matrix[2][4] = 1`. If it is a weighted graph, we set `matrix[2][4] = weight`.\n\n- **Pros:** Checking if an edge exists between A and B takes absolutely blazing fast **O(1)** time by checking `matrix[A][B]`. Adding or removing an edge is also O(1).\n- **Cons:** It consumes massive **O(V^2)** memory. If Facebook used an Adjacency Matrix for its 3 billion users, the matrix would require `3 billion x 3 billion` memory slots, which is 9 Exabytes of RAM. This is physically impossible to build. Matrices are strictly for Dense graphs with very few vertices (V < 10,000)."
                    },
                    {
                        heading: "5. Representation 2: Adjacency List",
                        content: "An **Adjacency List** is an Array (or Hash Map) where each index represents a Vertex, and the value is a Linked List (or dynamic array) of all the neighbor Vertices it connects to.\n\nIf Vertex 2 connects to 4 and 5, `list[2] = [4, 5]`.\n\n- **Pros:** It consumes **O(V + E)** memory. For sparse graphs like Facebook, you only store the 300 actual friendships per user, entirely skipping the 2.99 billion empty connections. It is the absolute standard for 99% of graph algorithms.\n- **Cons:** Checking if an edge exists between A and B takes **O(Degree)** time. You must go to `list[A]` and iterate through all of A's neighbors to see if B is in the list."
                    },
                    {
                        heading: "6. Representation 3: Edge List",
                        content: "An **Edge List** simply ignores the Vertices entirely and stores a flat array of every Edge in the system.\n\n`edges = [ (A, B, weight), (B, C, weight), (C, D, weight) ]`\n\n- **Pros:** Extremely memory efficient. It is the preferred format for feeding graph data into Machine Learning models (like Graph Neural Networks) or SQL databases (a table with `from_id` and `to_id` columns).\n- **Cons:** Utterly useless for graph traversal. To find the neighbors of Vertex A, you must linearly scan the entire array of billions of edges in **O(E)** time."
                    },
                    {
                        heading: "7. Memory Visualization: Matrix vs List",
                        content: "Let us visualize an undirected graph with 3 vertices: 0, 1, and 2. \nEdges exist between (0-1) and (1-2).",
                        diagram: `Vertices: 3. Edges: 2.
Graph: 0 --- 1 --- 2

Adjacency Matrix (3x3 grid):
    0  1  2
0 [ 0, 1, 0 ]
1 [ 1, 0, 1 ]
2 [ 0, 1, 0 ]
Memory Used: 9 slots.

Adjacency List (Array of Arrays):
Index 0 -> [ 1 ]
Index 1 -> [ 0, 2 ]
Index 2 -> [ 1 ]
Memory Used: 3 list heads + 4 edge nodes = 7 slots.`
                    },
                    {
                        heading: "8. Handling String Vertices (Hash Maps)",
                        content: "In academic textbook problems, vertices are beautifully numbered from `0` to `V-1`. You can just use a standard Array for your Adjacency List `array[0] = [1, 2]`.\n\nIn the real world, vertices are UUID strings (e.g., `user_1234abcd`). You cannot use a string as an Array index. Therefore, real-world Adjacency Lists are built using a **Hash Map of Arrays**. The Key is the Vertex UUID, and the Value is an array of neighbor UUIDs."
                    },
                    {
                        heading: "9. Code Example: Object-Oriented Adjacency List",
                        content: "Here we implement a standard unweighted Adjacency List using Hash Maps to allow string-based vertex names (like 'JFK' to 'LAX' airports).",
                        codeSnippet: {
                            title: "Graph Adjacency List Construction",
                            code: {
                                python: `from collections import defaultdict\n\nclass Graph:\n    def __init__(self):\n        # Dictionary mapping string -> list of strings\n        self.adj_list = defaultdict(list)\n\n    def add_vertex(self, vertex):\n        if vertex not in self.adj_list:\n            self.adj_list[vertex] = []\n\n    def add_edge(self, src, dest, is_directed=False):\n        self.add_vertex(src)\n        self.add_vertex(dest)\n        \n        self.adj_list[src].append(dest)\n        if not is_directed:\n            self.adj_list[dest].append(src)\n\n    def get_neighbors(self, vertex):\n        return self.adj_list.get(vertex, [])`,
                                java: `import java.util.*;\n\npublic class Graph {\n    // HashMap mapping String -> List of Strings\n    private Map<String, List<String>> adjList = new HashMap<>();\n\n    public void addVertex(String vertex) {\n        adjList.putIfAbsent(vertex, new ArrayList<>());\n    }\n\n    public void addEdge(String src, String dest, boolean isDirected) {\n        addVertex(src);\n        addVertex(dest);\n        \n        adjList.get(src).add(dest);\n        if (!isDirected) {\n            adjList.get(dest).add(src);\n        }\n    }\n\n    public List<String> getNeighbors(String vertex) {\n        return adjList.getOrDefault(vertex, new ArrayList<>());\n    }\n}`,
                                cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n#include <string>\n\nclass Graph {\nprivate:\n    std::unordered_map<std::string, std::vector<std::string>> adjList;\n\npublic:\n    void addVertex(const std::string& vertex) {\n        if (adjList.find(vertex) == adjList.end()) {\n            adjList[vertex] = std::vector<std::string>();\n        }\n    }\n\n    void addEdge(const std::string& src, const std::string& dest, bool isDirected = false) {\n        addVertex(src);\n        addVertex(dest);\n        \n        adjList[src].push_back(dest);\n        if (!isDirected) {\n            adjList[dest].push_back(src);\n        }\n    }\n\n    std::vector<std::string> getNeighbors(const std::string& vertex) {\n        if (adjList.find(vertex) != adjList.end()) {\n            return adjList[vertex];\n        }\n        return {};\n    }\n};`,
                                javascript: `class Graph {\n  constructor() {\n    // Map mapping string -> array of strings\n    this.adjList = new Map();\n  }\n\n  addVertex(vertex) {\n    if (!this.adjList.has(vertex)) {\n      this.adjList.set(vertex, []);\n    }\n  }\n\n  addEdge(src, dest, isDirected = false) {\n    this.addVertex(src);\n    this.addVertex(dest);\n    \n    this.adjList.get(src).push(dest);\n    if (!isDirected) {\n      this.adjList.get(dest).push(src);\n    }\n  }\n\n  getNeighbors(vertex) {\n    return this.adjList.get(vertex) || [];\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "10. Code Explanation",
                        content: "Reviewing the Adjacency List architecture:\n\n- **Implicit Vertices:** Notice that we call `addVertex` inside `addEdge` as a safety mechanism. In Hash-Map backed graphs, a Vertex only physically exists in memory if it is a Key in the dictionary.\n- **Undirected Logic:** An undirected edge `A-B` is just two directed edges `A->B` and `B->A`. Our code handles this gracefully via the `if (!isDirected)` boolean flag, pushing the destination into the source's array, and the source into the destination's array."
                    },
                    {
                        heading: "11. Adding Weights",
                        content: "If you need to turn the above code into a Weighted Graph, you must change the Hash Map value. Instead of mapping a `String -> List[String]`, you map a `String -> List[EdgeObject]`. \n\nThe `EdgeObject` is a custom class or tuple containing `(destination_string, weight_integer)`. When traversing from A, you iterate through its EdgeObjects, giving you both the neighboring vertices and the cost to reach them."
                    },
                    {
                        heading: "12. The Concept of Degree",
                        content: "A vertex's **Degree** is the number of edges connected to it. \nIn a directed graph, this is split into:\n- **In-Degree:** How many edges point *towards* the vertex (e.g., how many followers you have).\n- **Out-Degree:** How many edges point *away* from the vertex (e.g., how many people you follow).\n\nIf a vertex has an In-Degree of 0, it is a 'Source'. If it has an Out-Degree of 0, it is a 'Sink'."
                    },
                    {
                        heading: "13. Traversal Preamble: The Visited Set",
                        content: "Trees have a strict top-down structure, guaranteeing you will eventually hit a leaf node and stop. \n\nGraphs have **Cycles**. A Cycle is a path that loops back on itself (A -> B -> C -> A). If you run a naive traversal algorithm on a Graph with a cycle, your algorithm will loop infinitely until it crashes with a Stack Overflow. Therefore, ALL graph traversal algorithms absolutely require a `visited` Hash Set to track which nodes have already been processed, preventing infinite loops."
                    },
                    {
                        heading: "14. Graph Architectures in Production",
                        content: "When graphs exceed RAM limits, traditional data structures fail. \n\nAt Facebook scale (Trillions of edges), the graph is distributed across thousands of servers. They use highly specialized Graph Databases like Neo4j or Amazon Neptune. These databases store the Adjacency List on physical SSDs, using custom caching layers (like TAO at Meta) to keep the most highly accessed vertices (like a celebrity's friend list) in fast RAM."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "Graphs are the ultimate data structure for network logic:\n\n- **Logistics:** FedEx and Amazon use Weighted Directed Graphs to route delivery trucks, minimizing the total 'weight' (fuel cost/time) using algorithms like Dijkstra's or A*.\n- **Social Networks:** Recommending 'People you may know' is a simple graph algorithm: find vertices that are 2 edges away from you (friends of friends) that share a high number of mutual edges.\n- **The Internet:** The entire World Wide Web is a Digraph. Webpages are Vertices, and hyperlinks are Edges. Google's original PageRank algorithm ranked websites by analyzing the In-Degree of each vertex."
                    },
                    {
                        heading: "16. Summary",
                        content: "A Graph is a mathematical abstraction of relationships. The Adjacency Matrix provides O(1) edge lookups at the catastrophic cost of O(V^2) memory, making it useless for modern scale. The Adjacency List uses Hash Maps and Arrays to provide O(V+E) memory, making it the undisputed industry standard. Before writing any graph algorithm, you must architect the representation correctly, handle string-based UUIDs, and prepare your `visited` sets for the inevitable cycles."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why do modern social networks use Adjacency Lists instead of Adjacency Matrices?", options: ["Matrices cannot model directed edges.", "Matrices consume O(V^2) memory, which would require impossible amounts of RAM to store billions of mostly unconnected users.", "Lists provide faster O(1) edge existence checks.", "Lists are required for weighted graphs."], correctIndex: 1, explanation: "Adjacency Matrices allocate memory for every single theoretical connection, even if it doesn't exist. For sparse real-world networks with billions of users, O(V^2) memory scaling is physically impossible." },
                    { id: "q2", question: "What is the fundamental difference between traversing a Tree and traversing a Graph?", options: ["Trees use BFS, Graphs use DFS.", "Graph traversals require a 'visited' Hash Set to prevent infinite loops caused by Cycles.", "Trees can have weights, Graphs cannot.", "Graph traversal is O(N^2) while Tree traversal is O(N)."], correctIndex: 1, explanation: "Because graphs can have loops (A connects to B connects to A), a traversal algorithm will get stuck infinitely unless it tracks which nodes have already been visited." }
                ]
            },
            {
                id: "ds-tries",
                slug: "tries-prefix-trees",
                categorySlug: "data-structures",
                title: "Tries (Prefix Trees)",
                subtitle: "Specialized tree structures for O(L) string search, autocomplete, and spellchecking",
                difficulty: "Advanced",
                readTime: "30 min read",
                summary: "Master Trie node branching, prefix sharing, fast O(L) string search, the IsEndOfWord flag, and how Tries power Google Autocomplete.",
                overview: "A Trie (pronounced 'try', derived from reTRIEval) is a highly specialized tree data structure designed exclusively for storing and searching strings. Unlike a Binary Search Tree (which stores entire strings inside a single node and requires O(log N) string comparisons), a Trie breaks strings down into individual characters. Each node in a Trie represents a single character. By sharing common prefixes (e.g., 'CAR' and 'CAT' share the 'C-A' nodes), Tries compress dictionary storage and allow for blazingly fast string lookups. The time complexity to find a word in a Trie is strictly O(L), where L is the length of the word, completely independent of how many millions of words are stored in the tree.",
                keyConcepts: [
                    "Character-by-character node branching",
                    "Prefix Sharing for massive memory compression",
                    "The `isEndOfWord` boolean flag (terminating nodes)",
                    "O(L) Insert and Search time (L = string length)",
                    "Space Complexity: O(Alphabet_Size * Nodes)",
                    "Applications: Autocomplete, Spellcheckers, IP Routing"
                ],
                timeComplexity: { search: "O(L)", insertion: "O(L)", deletion: "O(L)" },
                spaceComplexity: "O(ALPHABET_SIZE * N * L)",
                sections: [
                    {
                        heading: "1. The String Search Problem",
                        content: "Suppose you are building Google's Search Autocomplete. When a user types 'app', you need to instantly suggest 'apple', 'application', and 'appetite'. \n\nIf you store the English dictionary in a Hash Table, you can easily check if 'app' is a valid word, but a Hash Table cannot easily find words that *start* with 'app' without scanning the entire table. \nIf you store the dictionary in a sorted Array, you can use Binary Search to find words starting with 'app' in O(log N) time, but inserting a new trending search term takes O(N) time. \n\nThe Trie solves this by mapping the alphabet directly to tree edges. To find words starting with 'app', you simply walk down the 'a' edge, then the 'p' edge, then the 'p' edge. Every node below you is guaranteed to be a valid autocomplete suggestion."
                    },
                    {
                        heading: "2. Structure of a Trie Node",
                        content: "A standard Binary Tree node has two pointers: `left` and `right`. \nA Trie node has an array (or Hash Map) of pointers, one for every possible character in the alphabet. For lowercase English, a Trie node contains:\n\n1. `children = new TrieNode[26]` (An array of 26 pointers, one for a-z).\n2. `isEndOfWord = false` (A boolean flag indicating if a valid word ends at this exact node).\n\nNotice that the node *does not store the character itself*. The character is implied by the index in the `children` array. If `children[0]` is not null, it implies the letter 'a' exists."
                    },
                    {
                        heading: "3. Insertion and Prefix Sharing",
                        content: "Let us insert the word 'CAT' into an empty Trie.\n1. We start at the Root (which is always empty).\n2. We look at 'C'. The Root's `children['c']` is null. We create a new Node and attach it to the 'c' index.\n3. We move to the 'C' node and look at 'A'. `children['a']` is null. We create a new Node.\n4. We move to the 'A' node and look at 'T'. `children['t']` is null. We create a new Node.\n5. We move to the 'T' node. We have finished the word, so we mark `isEndOfWord = true` on the 'T' node.\n\nNow, let us insert 'CAR'. We start at Root. 'C' already exists! We move to 'C'. 'A' already exists! We move to 'A'. 'R' does not exist. We create 'R' and mark it `isEndOfWord = true`. We just stored 'CAR' by only allocating 1 new node, sharing the 'C' and 'A' with 'CAT'."
                    },
                    {
                        heading: "4. The isEndOfWord Flag",
                        content: "Why do we need the `isEndOfWord` flag? \n\nSuppose our Trie contains the word 'APPLET'. If a user searches for the word 'APP', the Trie will successfully trace the path A -> P -> P. But 'APP' was never explicitly inserted, it is just a prefix of 'APPLET'. \n\nBy checking the `isEndOfWord` flag on the second 'P' node, the Trie sees it is `false` and correctly reports that 'APP' is not a valid word in our dictionary, it is merely a prefix."
                    },
                    {
                        heading: "5. Memory Visualization: Prefix Tree",
                        content: "Visualizing a Trie containing: 'cat', 'car', 'cart', 'dog'. Nodes marked with (E) have `isEndOfWord = true`.",
                        diagram: `          (Root)
          /    \\
        'c'    'd'
        /        \\
      'a'        'o'
      / \\          \\
   (E)'t' 'r'(E)   'g'(E)
            \\
            't'(E)

Path for 'cart': Root -> c -> a -> r -> t.
'car' is a word because 'r' has (E).
'cart' is a word because 't' has (E).`
                    },
                    {
                        heading: "6. Time Complexity Magic",
                        content: "The time complexity to insert, search, or delete a word in a Trie is **O(L)**, where L is the length of the string. \n\nThis is mathematically profound. If you have a dictionary of 10 billion words, and you want to search for the word 'CAT', it takes exactly 3 operations. The size of the dictionary (N) is completely irrelevant to the search time. A Hash Table technically takes O(L) time as well (to compute the string hash), but Hash Tables suffer from collisions. Tries never collide."
                    },
                    {
                        heading: "7. Space Complexity Nightmare",
                        content: "The trade-off for this blazing O(L) speed is catastrophic memory consumption. \n\nIf we use an array of size 26 for the children, every single node allocates 26 pointers, even if it only has 1 child. A 64-bit machine uses 8 bytes per pointer. 26 * 8 = 208 bytes per node. If a word has 10 characters, it takes 2,080 bytes. A dictionary of 100,000 words could easily consume hundreds of megabytes of RAM for what should be a 1MB text file. \n\nTo optimize this, production Tries often use Hash Maps for the `children` instead of Arrays of size 26. This saves memory at the cost of slightly slower edge traversals."
                    },
                    {
                        heading: "8. Code Example: Object-Oriented Trie",
                        content: "Below is a complete implementation of a Trie using Arrays for children (assuming lowercase English letters only).",
                        codeSnippet: {
                            title: "Trie (Prefix Tree) Implementation",
                            code: {
                                python: `class TrieNode:\n    def __init__(self):\n        self.children = [None] * 26\n        self.is_end = False\n\nclass Trie:\n    def __init__(self):\n        self.root = TrieNode()\n\n    def insert(self, word):\n        curr = self.root\n        for char in word:\n            idx = ord(char) - ord('a')\n            if not curr.children[idx]:\n                curr.children[idx] = TrieNode()\n            curr = curr.children[idx]\n        curr.is_end = True\n\n    def search(self, word):\n        curr = self.root\n        for char in word:\n            idx = ord(char) - ord('a')\n            if not curr.children[idx]:\n                return False\n            curr = curr.children[idx]\n        return curr.is_end\n\n    def startsWith(self, prefix):\n        curr = self.root\n        for char in prefix:\n            idx = ord(char) - ord('a')\n            if not curr.children[idx]:\n                return False\n            curr = curr.children[idx]\n        return True`,
                                java: `class TrieNode {\n    TrieNode[] children = new TrieNode[26];\n    boolean isEnd = false;\n}\n\npublic class Trie {\n    private TrieNode root;\n\n    public Trie() {\n        root = new TrieNode();\n    }\n\n    public void insert(String word) {\n        TrieNode curr = root;\n        for (char c : word.toCharArray()) {\n            int idx = c - 'a';\n            if (curr.children[idx] == null) {\n                curr.children[idx] = new TrieNode();\n            }\n            curr = curr.children[idx];\n        }\n        curr.isEnd = true;\n    }\n\n    public boolean search(String word) {\n        TrieNode curr = root;\n        for (char c : word.toCharArray()) {\n            int idx = c - 'a';\n            if (curr.children[idx] == null) return false;\n            curr = curr.children[idx];\n        }\n        return curr.isEnd;\n    }\n\n    public boolean startsWith(String prefix) {\n        TrieNode curr = root;\n        for (char c : prefix.toCharArray()) {\n            int idx = c - 'a';\n            if (curr.children[idx] == null) return false;\n            curr = curr.children[idx];\n        }\n        return true;\n    }\n}`,
                                cpp: `#include <string>\n#include <vector>\n\nclass TrieNode {\npublic:\n    std::vector<TrieNode*> children;\n    bool isEnd;\n    TrieNode() : children(26, nullptr), isEnd(false) {}\n};\n\nclass Trie {\nprivate:\n    TrieNode* root;\npublic:\n    Trie() {\n        root = new TrieNode();\n    }\n\n    void insert(std::string word) {\n        TrieNode* curr = root;\n        for (char c : word) {\n            int idx = c - 'a';\n            if (!curr->children[idx]) {\n                curr->children[idx] = new TrieNode();\n            }\n            curr = curr->children[idx];\n        }\n        curr->isEnd = true;\n    }\n\n    bool search(std::string word) {\n        TrieNode* curr = root;\n        for (char c : word) {\n            int idx = c - 'a';\n            if (!curr->children[idx]) return false;\n            curr = curr->children[idx];\n        }\n        return curr->isEnd;\n    }\n\n    bool startsWith(std::string prefix) {\n        TrieNode* curr = root;\n        for (char c : prefix) {\n            int idx = c - 'a';\n            if (!curr->children[idx]) return false;\n            curr = curr->children[idx];\n        }\n        return true;\n    }\n};`,
                                javascript: `class TrieNode {\n  constructor() {\n    this.children = new Array(26).fill(null);\n    this.isEnd = false;\n  }\n}\n\nclass Trie {\n  constructor() {\n    this.root = new TrieNode();\n  }\n\n  insert(word) {\n    let curr = this.root;\n    for (let i = 0; i < word.length; i++) {\n      const idx = word.charCodeAt(i) - 97; // 'a' is 97\n      if (!curr.children[idx]) {\n        curr.children[idx] = new TrieNode();\n      }\n      curr = curr.children[idx];\n    }\n    curr.isEnd = true;\n  }\n\n  search(word) {\n    let curr = this.root;\n    for (let i = 0; i < word.length; i++) {\n      const idx = word.charCodeAt(i) - 97;\n      if (!curr.children[idx]) return false;\n      curr = curr.children[idx];\n    }\n    return curr.isEnd;\n  }\n\n  startsWith(prefix) {\n    let curr = this.root;\n    for (let i = 0; i < prefix.length; i++) {\n      const idx = prefix.charCodeAt(i) - 97;\n      if (!curr.children[idx]) return false;\n      curr = curr.children[idx];\n    }\n    return true;\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "9. Code Explanation",
                        content: "Notice the character math: `ord(char) - ord('a')`. \nThis maps 'a' to index 0, 'b' to 1, up to 'z' at 25. \n\nThe `startsWith` function is identical to `search`, except it ignores the `is_end` flag at the final node. As long as the path exists, the prefix is valid. To implement Autocomplete, you would call `startsWith(prefix)`, land on the final node of the prefix, and then run a Depth-First Search (DFS) from that node down to find all descendants that have `is_end == true`."
                    },
                    {
                        heading: "10. Deletion in a Trie",
                        content: "Deleting a word from a Trie is dangerous. If you want to delete 'CAT', you cannot just destroy the 'C' and 'A' nodes, because 'CAR' might be relying on them. \n\nProper deletion requires a recursive post-order traversal. You navigate to the end of the word ('T'), set `isEndOfWord = false`, and then ask: 'Does this node have any other children?' If not, you delete it. You move back up to 'A'. 'Does A have any other children?' Yes, it has 'R'. So you stop deleting. This safely removes 'CAT' while preserving 'CAR'."
                    },
                    {
                        heading: "11. Memory Optimizations: HashMaps",
                        content: "If your Trie needs to support capital letters, numbers, and symbols (ASCII 128), or even emojis (Unicode), using fixed Arrays for children becomes impossible. A node array of size 65,536 where 99% of slots are null is a disastrous waste of RAM. \n\nIn these cases, `children` is implemented as a Hash Map (e.g., `Map<Character, TrieNode>`). This guarantees that memory is only allocated for characters that actually exist."
                    },
                    {
                        heading: "12. Memory Optimizations: Radix Trees",
                        content: "A Radix Tree (or Patricia Trie) is a compressed version of a Trie. \n\nIf you insert the word 'EXTRAORDINARY', standard Tries create 13 individual nodes for a single word. A Radix Tree recognizes that there are no branching paths off these nodes, and compresses them into a single node containing the string block 'EXTRAORDINARY'. If you later insert 'EXTREME', the node splits at 'EXTR', branching into 'AORDINARY' and 'EME'. Radix Trees are vastly more memory efficient and are heavily used in OS kernel routing tables."
                    },
                    {
                        heading: "13. Tries vs Hash Tables",
                        content: "Why not just use a Hash Table for string lookups?\n\n1. **Prefix Searches:** Hash tables cannot do prefix searches (e.g., 'Find all words starting with app'). Tries can.\n2. **Alphabetical Sorting:** A DFS traversal of a Trie will naturally print out all words in perfect alphabetical order. Hash Tables are completely unordered.\n3. **Longest Common Prefix:** Finding the longest shared prefix between two strings is trivial in a Trie (just walk down until the tree branches). Hash Tables cannot do this."
                    },
                    {
                        heading: "14. IP Routing (Networking)",
                        content: "Tries do not just store letters; they can store binary bits (0s and 1s). \n\nWhen your home router receives a packet of data, it looks at the destination IP address (e.g., 192.168.1.5). The router's routing table is stored as a Binary Trie (where children are just 0 and 1). The router walks down the Trie matching the bits of the IP address to find the Longest Prefix Match, determining exactly which ethernet port to send the packet out of. This happens millions of times per second."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "Tries power critical text-processing systems:\n\n- **Search Autocomplete:** Google Search and IDE IntelliSense use Tries to instantly find all valid completions for the characters you are currently typing.\n- **Spell Checkers:** Microsoft Word runs every typed word through a Trie. If the Trie returns `false`, the word is squiggly-underlined in red.\n- **Boggle / Word Games:** To find all valid words on a Boggle board, algorithms run a DFS on the 2D board while simultaneously walking down a Trie of the English dictionary to instantly prune invalid paths."
                    },
                    {
                        heading: "16. Summary",
                        content: "The Trie is the undisputed master of strings. By breaking data down into its atomic characters and mapping them directly to tree edges, it completely eliminates the concept of 'comparing strings', reducing search time to the absolute theoretical limit of O(L). While it suffers from high memory overhead, prefix-sharing and Radix compression make it the engine behind every autocomplete and routing system in the world."
                    }
                ],
                quiz: [
                    { id: "q1", question: "Why is the time complexity to search for a word in a Trie O(L) instead of O(log N)?", options: ["Because Tries are perfectly balanced binary trees.", "Because you only step down one level for each character in the string (L levels), completely independent of how many words (N) are in the dictionary.", "Because Hash Tables have O(1) lookups.", "Because Tries do not allow duplicate strings."], correctIndex: 1, explanation: "If you search for 'CAT' (length 3), you check the 'C' node, the 'A' node, and the 'T' node. Three operations total, even if the Trie contains a billion other words." },
                    { id: "q2", question: "What happens if you use a fixed Array of size 128 (for full ASCII) in every Trie node?", options: ["The search time increases to O(N).", "The Trie becomes a Radix Tree.", "The memory consumption becomes catastrophic, as every node allocates 128 pointers even if it only has 1 child.", "The Trie can no longer perform Autocomplete."], correctIndex: 2, explanation: "Allocating 128 pointers (1024 bytes) per node creates massive amounts of empty null pointers. This is why production Tries often use Hash Maps to store children dynamically." }
                ]
            },
            {
                id: "ds-dsu",
                slug: "disjoint-set-union",
                categorySlug: "data-structures",
                title: "Disjoint Set Union (DSU)",
                subtitle: "Union-Find structure powering Kruskal's Algorithm and Network Connectivity",
                difficulty: "Advanced",
                readTime: "25 min read",
                summary: "Master the Union-Find algorithm. Understand Path Compression, Union by Rank, and the mathematically profound Inverse Ackermann time complexity that makes DSU operations effectively O(1).",
                overview: "Disjoint Set Union (DSU), also known as the Union-Find data structure, solves a very specific but incredibly common problem: grouping elements into non-overlapping (disjoint) sets and quickly answering two questions: 'Are these two elements in the same group?' and 'Merge these two groups together'. If you try to solve this with Hash Sets or Arrays, merging two groups takes O(N) time. By modeling the sets as inverted trees and applying two brilliant mathematical heuristics—Path Compression and Union by Rank—DSU achieves a time complexity of O(α(N)), where α is the Inverse Ackermann function. This function grows so slowly that for all particles in the observable universe, it is less than 5. Thus, DSU operates in amortized O(1) constant time.",
                keyConcepts: [
                    "Disjoint Sets: Elements belong to exactly one set",
                    "The `Find` operation: Discovering the root Representative of a set",
                    "The `Union` operation: Merging two sets by connecting their roots",
                    "Heuristic 1: Path Compression (Flattening the tree during Find)",
                    "Heuristic 2: Union by Rank (Attaching the shorter tree to the taller tree)",
                    "Inverse Ackermann Time Complexity: α(N) ≈ O(1)"
                ],
                timeComplexity: { search: "O(α(n))", insertion: "O(α(n))", deletion: "N/A" },
                spaceComplexity: "O(n)",
                sections: [
                    {
                        heading: "1. The Connectivity Problem",
                        content: "Imagine a map of 10,000 cities. A massive earthquake destroys all the roads. You slowly rebuild roads one by one. \nAfter rebuilding 500 roads, a user asks: 'Can I drive from City A to City B?' \n\nIf you use a standard Graph (Adjacency List) and run BFS or DFS every time the user asks, it takes O(V + E) time. If users ask 100,000 times, your server crashes. \n\nWe need a data structure that can dynamically add connections (`Union`) and answer connectivity queries (`Find`) in O(1) time. This is the exact problem DSU was invented to solve."
                    },
                    {
                        heading: "2. The Inverted Tree Model",
                        content: "DSU does not use Node objects. It uses a simple flat Array called `parent`.\n\nInitially, if there are 5 cities, `parent = [0, 1, 2, 3, 4]`. \nThis means City 0 is the 'parent' (or root) of City 0. Every element is its own isolated tree of size 1. \n\nIf we build a road between 2 and 3, we execute a Union. We make 2 the parent of 3. `parent[3] = 2`.\nThe array becomes `parent = [0, 1, 2, 2, 4]`. \nNow, if we ask 'Are 2 and 3 connected?', we look up their ultimate roots. The root of 2 is 2. The root of 3 is `parent[3] = 2`. Since they share the same root, they are connected."
                    },
                    {
                        heading: "3. The Find Operation",
                        content: "The `Find(x)` function traces the `parent` pointers upwards until it finds a node that is its own parent. That node is the **Representative** (or Root) of the entire set.\n\nSuppose `parent[C] = B` and `parent[B] = A` and `parent[A] = A`.\nTo find the root of C, we look at B. B is not the root, so we look at A. A is the root. \n`Find(C) -> A`. \n\nIf we want to check if C and D are in the same set, we simply calculate `Find(C) == Find(D)`."
                    },
                    {
                        heading: "4. The Naive Union Operation",
                        content: "To merge the set containing X and the set containing Y:\n1. Calculate `rootX = Find(X)`\n2. Calculate `rootY = Find(Y)`\n3. If they are different, arbitrarily set `parent[rootY] = rootX`.\n\nThis merges the two trees. However, if we do this blindly (e.g., `parent[2]=1`, `parent[3]=2`, `parent[4]=3`), the tree degrades into a straight Linked List. The `Find` operation will now take O(N) time to traverse from the bottom of the list to the root. We have ruined our performance."
                    },
                    {
                        heading: "5. Heuristic 1: Union by Rank (or Size)",
                        content: "To prevent the tree from degrading into a Linked List, we must be smart about which root becomes the parent of the other.\n\nWe maintain a second array called `rank` (or `size`), initially all 0. \nWhen merging RootX and RootY, we look at their Ranks (which approximates the height of the tree). \n**We always attach the shorter tree to the root of the taller tree.** \nBecause the shorter tree is absorbed into the taller one, the overall height of the new merged tree does not increase! The height only increases if we merge two trees of the exact same rank. This mathematically guarantees that the height of the tree will never exceed O(log N)."
                    },
                    {
                        heading: "6. Heuristic 2: Path Compression",
                        content: "O(log N) is fast, but we can do better. \n\nPath Compression modifies the `Find` function. \nSuppose we have a tall tree: `A -> B -> C -> D -> E`. \nIf we call `Find(E)`, we traverse up to D, C, B, and finally A. \n\nBefore returning 'A', the Find function pauses and thinks: 'I just did all this work to find out that A is the root. Why don't I update all the nodes I just visited to point directly to A?' \nIt rewires the tree instantly: `parent[E]=A`, `parent[D]=A`, `parent[C]=A`, `parent[B]=A`. \n\nThe next time anyone calls `Find(E)`, it takes exactly 1 step. This completely flattens the tree structure dynamically as it is used."
                    },
                    {
                        heading: "7. The Inverse Ackermann Function",
                        content: "When you combine **Union by Rank** and **Path Compression**, the time complexity collapses into a mathematical anomaly: **O(α(N))**. \n\nThe Ackermann function `A(m, n)` is a function that grows so incredibly fast that it breaks integer limits almost immediately. \n`A(4, 2)` has 19,729 digits. \nThe Inverse Ackermann function `α(N)` is the mathematical opposite. It asks: 'How many times do I have to apply the Ackermann function to get to N?' \nBecause the Ackermann function grows infinitely fast, the Inverse Ackermann function grows infinitely slow. For any number of elements N that could possibly fit in a computer, `α(N) ≤ 4`. Therefore, DSU operations are considered amortized O(1)."
                    },
                    {
                        heading: "8. Code Example: Full Optimized DSU",
                        content: "Here is the industry-standard implementation of DSU, featuring both Path Compression and Union by Rank.",
                        codeSnippet: {
                            title: "Disjoint Set Union (Optimized)",
                            code: {
                                python: `class DSU:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n\n    def find(self, i):\n        # Path Compression Heuristic\n        if self.parent[i] == i:\n            return i\n        self.parent[i] = self.find(self.parent[i])\n        return self.parent[i]\n\n    def union(self, i, j):\n        root_i = self.find(i)\n        root_j = self.find(j)\n\n        if root_i != root_j:\n            # Union by Rank Heuristic\n            if self.rank[root_i] < self.rank[root_j]:\n                root_i, root_j = root_j, root_i\n            self.parent[root_j] = root_i\n            \n            if self.rank[root_i] == self.rank[root_j]:\n                self.rank[root_i] += 1\n            return True # Successfully merged\n        return False # They were already in the same set`,
                                java: `public class DSU {\n    private int[] parent;\n    private int[] rank;\n\n    public DSU(int n) {\n        parent = new int[n];\n        rank = new int[n];\n        for (int i = 0; i < n; i++) {\n            parent[i] = i;\n            rank[i] = 0;\n        }\n    }\n\n    public int find(int i) {\n        // Path Compression\n        if (parent[i] == i) {\n            return i;\n        }\n        return parent[i] = find(parent[i]);\n    }\n\n    public boolean union(int i, int j) {\n        int rootI = find(i);\n        int rootJ = find(j);\n\n        if (rootI != rootJ) {\n            // Union by Rank\n            if (rank[rootI] < rank[rootJ]) {\n                int temp = rootI; rootI = rootJ; rootJ = temp;\n            }\n            parent[rootJ] = rootI;\n            \n            if (rank[rootI] == rank[rootJ]) {\n                rank[rootI]++;\n            }\n            return true;\n        }\n        return false;\n    }\n}`,
                                cpp: `#include <vector>\n#include <numeric>\n\nclass DSU {\nprivate:\n    std::vector<int> parent;\n    std::vector<int> rank;\n\npublic:\n    DSU(int n) {\n        parent.resize(n);\n        std::iota(parent.begin(), parent.end(), 0);\n        rank.assign(n, 0);\n    }\n\n    int find(int i) {\n        // Path Compression\n        if (parent[i] == i) {\n            return i;\n        }\n        return parent[i] = find(parent[i]);\n    }\n\n    bool unionSet(int i, int j) {\n        int rootI = find(i);\n        int rootJ = find(j);\n\n        if (rootI != rootJ) {\n            // Union by Rank\n            if (rank[rootI] < rank[rootJ]) {\n                std::swap(rootI, rootJ);\n            }\n            parent[rootJ] = rootI;\n            \n            if (rank[rootI] == rank[rootJ]) {\n                rank[rootI]++;\n            }\n            return true;\n        }\n        return false;\n    }\n};`,
                                javascript: `class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n  }\n\n  find(i) {\n    // Path Compression\n    if (this.parent[i] === i) {\n      return i;\n    }\n    this.parent[i] = this.find(this.parent[i]);\n    return this.parent[i];\n  }\n\n  union(i, j) {\n    let rootI = this.find(i);\n    let rootJ = this.find(j);\n\n    if (rootI !== rootJ) {\n      // Union by Rank\n      if (this.rank[rootI] < this.rank[rootJ]) {\n        [rootI, rootJ] = [rootJ, rootI]; // Swap\n      }\n      this.parent[rootJ] = rootI;\n      \n      if (this.rank[rootI] === this.rank[rootJ]) {\n        this.rank[rootI]++;\n      }\n      return true;\n    }\n    return false;\n  }\n}`
                            }
                        }
                    },
                    {
                        heading: "9. Code Explanation",
                        content: "Notice the elegance of Path Compression in `Find`. It is a single line of recursive code: `return parent[i] = find(parent[i]);`. As the recursion unwinds from the root back down to the target node, it assigns every single node's parent pointer directly to the ultimate root. \n\nIn `Union`, the return value is useful. If it returns `true`, it means we just connected two previously disconnected components. If it returns `false`, it means those two nodes were already connected. This exact boolean check is how we detect Cycles in a Graph."
                    },
                    {
                        heading: "10. Memory Visualization: Path Compression",
                        content: "Let us see Path Compression in action. We call `Find(4)` on a degraded tree.",
                        diagram: `Before Find(4):
      0 (Root)
      |
      1
      |
      2
      |
      3
      |
      4

After Find(4) executes, the tree instantly flattens:
         0 (Root)
       / | \\  \\
      1  2  3  4`
                    },
                    {
                        heading: "11. Detecting Cycles in Undirected Graphs",
                        content: "DSU is the absolute fastest way to detect a cycle in an undirected graph. \n\nIterate through all the edges `(u, v)`. For each edge, attempt to `union(u, v)`. \nIf `union` returns `false`, it means `u` and `v` are already in the same set! But we just found an edge connecting them! If an edge connects two nodes that already have a path between them, you have found a Cycle. \n\nThis is vastly simpler and faster to code than running a full DFS with a `visited` array and parent-tracking."
                    },
                    {
                        heading: "12. Kruskal's Minimum Spanning Tree",
                        content: "DSU is the engine behind Kruskal's Algorithm. \nGiven a weighted graph (like building the cheapest internet fiber network between cities), how do you connect all cities with the absolute minimum cost? \n\n1. Sort all edges from cheapest to most expensive.\n2. Iterate through the sorted edges.\n3. For each edge `(u, v)`, attempt to `union(u, v)`.\n4. If it returns `true` (they weren't connected yet), buy the edge! If it returns `false` (they are already connected), ignore the edge because it would create a redundant cycle.\n5. Stop when you have bought `V-1` edges. You have built a Minimum Spanning Tree."
                    },
                    {
                        heading: "13. Union by Size vs Rank",
                        content: "We implemented 'Union by Rank', which tracks the approximate height of the tree. \nAlternatively, you can implement 'Union by Size'. Instead of tracking height, you track the exact number of nodes in the set. `size = [1] * N`. When merging, you attach the smaller set to the larger set, and update `size[root_i] += size[root_j]`. \nBoth approaches are mathematically identical in performance, yielding O(α(N)). 'Size' is sometimes preferred if the interview question explicitly asks you 'What is the size of the largest group?'"
                    },
                    {
                        heading: "14. Number of Connected Components",
                        content: "How many disconnected islands exist in your graph? \nInitialize a variable `components = N`. \nEvery time `union(u, v)` successfully returns `true`, decrement `components -= 1` (because two islands just merged into one). \nWhen you are done processing all edges, `components` holds the exact number of disconnected groups. If `components == 1`, the entire graph is fully connected."
                    },
                    {
                        heading: "15. Real-World Applications",
                        content: "DSU powers connectivity algorithms across the industry:\n\n- **Network Routing:** OSPF protocols use Minimum Spanning Trees (powered by DSU) to prevent routing loops (broadcast storms) in physical ethernet switches.\n- **Image Processing:** Photoshop's 'Magic Wand' tool uses DSU to group adjacent pixels of similar colors into massive disjoint sets, allowing you to click once and select an entire sky.\n- **Social Networks:** Calculating distinct 'Communities' or checking if an 'Erdős Number' or 'Bacon Number' exists between two actors."
                    },
                    {
                        heading: "16. Summary",
                        content: "Disjoint Set Union is a masterpiece of algorithm design. By abandoning the Adjacency List and modeling sets as inverted arrays, it achieves what standard graphs cannot: O(1) dynamic connectivity. Path Compression and Union by Rank ensure the tree remains completely flat, yielding the mythical Inverse Ackermann time complexity. Whenever you hear 'grouping', 'dynamic connectivity', 'Kruskal's', or 'cycle detection', DSU is the answer."
                    }
                ],
                quiz: [
                    { id: "q1", question: "What happens if you do NOT implement 'Path Compression' and 'Union by Rank' in DSU?", options: ["The Find operation remains O(1) but Union degrades to O(N).", "The algorithm stops functioning and returns incorrect roots.", "The inverted trees can degrade into linear linked lists, causing both Find and Union to plummet to O(N) worst-case time.", "Memory usage skyrockets from O(N) to O(N^2)."], correctIndex: 2, explanation: "Without heuristics, merging tall trees onto short trees creates massive linear chains. Find(x) must traverse the entire chain taking O(N) time." },
                    { id: "q2", question: "How does DSU detect a Cycle in a Graph?", options: ["By tracking a 'visited' Hash Set during tree traversal.", "If you attempt to Union(u, v) and Find(u) == Find(v), it means they are already in the same set. Adding the edge (u, v) creates a Cycle.", "By checking if the total Rank of the root exceeds the number of nodes.", "By running BFS and checking for cross-edges."], correctIndex: 1, explanation: "If two nodes share the same root, a path already exists between them. Adding a direct edge between them forms a closed loop (a Cycle)." }
                ]
            }
        ]
    },
    {
        id: "algo",
        slug: "algorithms",
        title: "Algorithms",
        icon: "Cpu",
        description: "Step-by-step computational procedures for problem solving and data manipulation.",
        topics: [
            {
                id: "algo-binary-search",
                slug: "binary-search",
                categorySlug: "algorithms",
                title: "Binary Search",
                subtitle: "Logarithmic O(log n) divide and conquer searching on sorted search spaces",
                difficulty: "Beginner",
                readTime: "9 min read",
                summary: "Master binary search bounds, discrete predicate functions, and middle calculations.",
                overview: "Binary Search halves remaining candidates at every step by checking the middle element against target condition.",
                keyConcepts: ["Logarithmic reduction O(log n)", "Preventing Overflow: mid = low + (high - low) / 2", "Lower and Upper Bound variations"],
                timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
                spaceComplexity: "O(1)",
                sections: [
                    {
                        heading: "1. Iterative Binary Search",
                        content: "Adjusts low and high pointers based on value comparison until target is found or pointers cross.",
                        codeSnippet: {
                            title: "Iterative Binary Search",
                            code: {
                                python: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = low + (high - low) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1`,
                                java: `int binarySearch(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
                                cpp: `int binarySearch(const std::vector<int>& arr, int target) {\n    int low = 0, high = arr.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
                                javascript: `function binarySearch(arr, target) {\n  let low = 0, high = arr.length - 1;\n  while (low <= high) {\n    const mid = Math.floor(low + (high - low) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1;\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-sorting",
                slug: "sorting-algorithms",
                categorySlug: "algorithms",
                title: "Sorting Algorithms",
                subtitle: "Comparison-based paradigms: Merge Sort, Quick Sort, and Heap Sort",
                difficulty: "Intermediate",
                readTime: "15 min read",
                summary: "Explore Merge Sort, Quick Sort, and lower bound Ω(n log n) comparison proofs.",
                overview: "Sorting arranges elements in ascending/descending order. Comparison-based techniques hit a theoretical minimum bound of O(n log n).",
                keyConcepts: ["Divide & Conquer", "Stability in sorting", "In-place vs Out-of-place memory footprint"],
                timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n^2) QuickSort / O(n log n) MergeSort" },
                spaceComplexity: "O(n) MergeSort / O(1) HeapSort",
                sections: [
                    {
                        heading: "1. Quick Sort Partitioning",
                        content: "Picks a pivot and moves elements smaller than pivot to left, and larger elements to right.",
                        codeSnippet: {
                            title: "Quick Sort Implementation",
                            code: {
                                python: `def quick_sort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)`,
                                java: `void quickSort(int[] arr, int low, int high) {\n    if (low < high) {\n        int pIdx = partition(arr, low, high);\n        quickSort(arr, low, pIdx - 1);\n        quickSort(arr, pIdx + 1, high);\n    }\n}`,
                                cpp: `void quickSort(std::vector<int>& arr, int low, int high) {\n    if (low < high) {\n        int pIdx = partition(arr, low, high);\n        quickSort(arr, low, pIdx - 1);\n        quickSort(arr, pIdx + 1, high);\n    }\n}`,
                                javascript: `function quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter(x => x < pivot);\n  const middle = arr.filter(x => x === pivot);\n  const right = arr.filter(x => x > pivot);\n  return [...quickSort(left), ...middle, ...quickSort(right)];\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-two-pointers",
                slug: "two-pointers-sliding-window",
                categorySlug: "algorithms",
                title: "Two Pointers & Sliding Window",
                subtitle: "Linear optimization strategies over sequential data arrays",
                difficulty: "Intermediate",
                readTime: "11 min read",
                summary: "Master dynamic window resizing and converging array pointers.",
                overview: "Sliding Window and Two Pointer techniques convert naive O(n^2) nested array iterations into linear O(n) passes.",
                keyConcepts: ["Converging Pointers (left & right)", "Fixed vs Variable Sliding Window", "Monotonic Deque Window Tracking"],
                timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
                spaceComplexity: "O(1)",
                sections: [
                    {
                        heading: "1. Variable Length Sliding Window",
                        content: "Expands right window boundary until constraint breaks, then shrinks left boundary.",
                        codeSnippet: {
                            title: "Sliding Window (Max Sum Subarray)",
                            code: {
                                python: `def max_subarray_sum(arr, k):\n    curr_sum = sum(arr[:k])\n    max_sum = curr_sum\n    for i in range(k, len(arr)):\n        curr_sum += arr[i] - arr[i - k]\n        max_sum = max(max_sum, curr_sum)\n    return max_sum`,
                                java: `int maxSubarraySum(int[] arr, int k) {\n    int currSum = 0;\n    for (int i = 0; i < k; i++) currSum += arr[i];\n    int maxSum = currSum;\n    for (int i = k; i < arr.length; i++) {\n        currSum += arr[i] - arr[i - k];\n        maxSum = Math.max(maxSum, currSum);\n    }\n    return maxSum;\n}`,
                                cpp: `int maxSubarraySum(const std::vector<int>& arr, int k) {\n    int currSum = 0;\n    for (int i = 0; i < k; i++) currSum += arr[i];\n    int maxSum = currSum;\n    for (int i = k; i < arr.size(); i++) {\n        currSum += arr[i] - arr[i - k];\n        maxSum = std::max(maxSum, currSum);\n    }\n    return maxSum;\n}`,
                                javascript: `function maxSubarraySum(arr, k) {\n  let currSum = arr.slice(0, k).reduce((a, b) => a + b, 0);\n  let maxSum = currSum;\n  for (let i = k; i < arr.length; i++) {\n    currSum += arr[i] - arr[i - k];\n    maxSum = Math.max(maxSum, currSum);\n  }\n  return maxSum;\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-dp",
                slug: "dynamic-programming",
                categorySlug: "algorithms",
                title: "Dynamic Programming",
                subtitle: "Memoization (Top-Down) and Tabulation (Bottom-Up) paradigms",
                difficulty: "Advanced",
                readTime: "16 min read",
                summary: "Solve subproblem optimization tasks by caching overlapping solution states.",
                overview: "DP breaks optimization problems into subproblems, storing computed subproblem states to avoid redundant recalculation.",
                keyConcepts: ["Overlapping Subproblems", "Optimal Substructure", "State Transition Formulation"],
                timeComplexity: { average: "O(States * Transitions)" },
                spaceComplexity: "O(Number of States)",
                sections: [
                    {
                        heading: "1. 0/1 Knapsack Tabulation",
                        content: "Builds a 2D DP table where dp[i][w] represents maximum value obtainable with i items under weight limit w.",
                        codeSnippet: {
                            title: "0/1 Knapsack Bottom-Up DP",
                            code: {
                                python: `def knapsack(weights, values, capacity):\n    n = len(weights)\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(1, capacity + 1):\n            if weights[i-1] <= w:\n                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]], dp[i-1][w])\n            else: dp[i][w] = dp[i-1][w]\n    return dp[n][capacity]`,
                                java: `int knapsack(int[] weights, int[] values, int capacity) {\n    int n = weights.length;\n    int[][] dp = new int[n + 1][capacity + 1];\n    for (int i = 1; i <= n; i++) {\n        for (int w = 1; w <= capacity; w++) {\n            if (weights[i - 1] <= w)\n                dp[i][w] = Math.max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w]);\n            else dp[i][w] = dp[i - 1][w];\n        }\n    }\n    return dp[n][capacity];\n}`,
                                cpp: `int knapsack(const std::vector<int>& weights, const std::vector<int>& values, int capacity) {\n    int n = weights.size();\n    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(capacity + 1, 0));\n    for (int i = 1; i <= n; i++) {\n        for (int w = 1; w <= capacity; w++) {\n            if (weights[i - 1] <= w)\n                dp[i][w] = std::max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w]);\n            else dp[i][w] = dp[i - 1][w];\n        }\n    }\n    return dp[n][capacity];\n}`,
                                javascript: `function knapsack(weights, values, capacity) {\n  const n = weights.length;\n  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    for (let w = 1; w <= capacity; w++) {\n      if (weights[i - 1] <= w)\n        dp[i][w] = Math.max(values[i - 1] + dp[i - 1][w - weights[i - 1]], dp[i - 1][w]);\n      else dp[i][w] = dp[i - 1][w];\n    }\n  }\n  return dp[n][capacity];\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-greedy",
                slug: "greedy-algorithms",
                categorySlug: "algorithms",
                title: "Greedy Algorithms",
                subtitle: "Locally optimal choices leading to globally optimal solutions",
                difficulty: "Intermediate",
                readTime: "10 min read",
                summary: "Learn greedy choice properties, activity selection, and Huffman coding.",
                overview: "Greedy algorithms make the locally best choice at each step without backtracking.",
                keyConcepts: ["Greedy Choice Property", "Optimal Substructure Proofs"],
                timeComplexity: { average: "O(n log n) sorting phase" },
                spaceComplexity: "O(1)",
                sections: [
                    {
                        heading: "1. Interval Activity Selection",
                        content: "Sorts intervals by end time and greedily selects non-overlapping activities.",
                        codeSnippet: {
                            title: "Activity Selection Algorithm",
                            code: {
                                python: `def max_activities(intervals):\n    intervals.sort(key=lambda x: x[1])\n    count, last_end = 0, -1\n    for start, end in intervals:\n        if start >= last_end:\n            count += 1; last_end = end\n    return count`,
                                java: `import java.util.*;\nint maxActivities(int[][] intervals) {\n    Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1]));\n    int count = 0, lastEnd = -1;\n    for (int[] interval : intervals) {\n        if (interval[0] >= lastEnd) { count++; lastEnd = interval[1]; }\n    }\n    return count;\n}`,
                                cpp: `#include <vector>\n#include <algorithm>\nint maxActivities(std::vector<std::pair<int, int>>& intervals) {\n    std::sort(intervals.begin(), intervals.end(), [](auto& a, auto& b){ return a.second < b.second; });\n    int count = 0, lastEnd = -1;\n    for (auto& [start, end] : intervals) {\n        if (start >= lastEnd) { count++; lastEnd = end; }\n    }\n    return count;\n}`,
                                javascript: `function maxActivities(intervals) {\n  intervals.sort((a, b) => a[1] - b[1]);\n  let count = 0, lastEnd = -1;\n  for (const [start, end] of intervals) {\n    if (start >= lastEnd) { count++; lastEnd = end; }\n  }\n  return count;\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-backtracking",
                slug: "backtracking-algorithms",
                categorySlug: "algorithms",
                title: "Backtracking Algorithms",
                subtitle: "Systematic search space exploration with state pruning",
                difficulty: "Advanced",
                readTime: "14 min read",
                summary: "Master N-Queens, Sudoku solving, and state-space pruning.",
                overview: "Backtracking builds solution candidates incrementally, abandoning ('pruning') paths as soon as validity constraints fail.",
                keyConcepts: ["State Space Tree", "Constraint Pruning", "Recursive Choice & Reversal"],
                timeComplexity: { worst: "O(BranchingFactor^Depth)" },
                spaceComplexity: "O(Recursion Depth)",
                sections: [
                    {
                        heading: "1. N-Queens Solver Concept",
                        content: "Places queens row by row, pruning invalid column/diagonal attacks.",
                        codeSnippet: {
                            title: "Backtracking Choice Template",
                            code: {
                                python: `def backtrack(path, choices):\n    if is_solution(path): process_solution(path); return\n    for choice in choices:\n        if is_valid(choice):\n            path.append(choice) # Make choice\n            backtrack(path, get_next_choices(choice))\n            path.pop() # Backtrack choice`,
                                java: `void backtrack(List<Integer> path) {\n    if (isSolution(path)) { process(path); return; }\n    for (int choice : getChoices()) {\n        if (isValid(choice)) {\n            path.add(choice);\n            backtrack(path);\n            path.remove(path.size() - 1);\n        }\n    }\n}`,
                                cpp: `void backtrack(std::vector<int>& path) {\n    if (isSolution(path)) { process(path); return; }\n    for (int choice : getChoices()) {\n        if (isValid(choice)) {\n            path.push_back(choice);\n            backtrack(path);\n            path.pop_back();\n        }\n    }\n}`,
                                javascript: `function backtrack(path) {\n  if (isSolution(path)) { process(path); return; }\n  for (const choice of getChoices()) {\n    if (isValid(choice)) {\n      path.push(choice);\n      backtrack(path);\n      path.pop();\n    }\n  }\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-bfs-dfs",
                slug: "bfs-and-dfs",
                categorySlug: "algorithms",
                title: "Graph BFS & DFS",
                subtitle: "Breadth-First Search (Level-Order) vs Depth-First Search (Backtracking)",
                difficulty: "Intermediate",
                readTime: "12 min read",
                summary: "Understand queue-based BFS shortest paths and stack/recursive DFS traversals.",
                overview: "BFS explores graph nodes in expanding concentric rings (ideal for unweighted shortest paths). DFS explores paths deeply before backtracking.",
                keyConcepts: ["BFS Queue vs DFS Stack/Recursion", "Visited Set to prevent infinite loops", "Shortest Path property in unweighted graphs"],
                timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
                spaceComplexity: "O(V)",
                sections: [
                    {
                        heading: "1. Breadth-First Search Traversal",
                        content: "Processes vertices level by level using a FIFO queue.",
                        codeSnippet: {
                            title: "BFS Graph Traversal",
                            code: {
                                python: `from collections import deque\ndef bfs(graph, start):\n    visited = {start}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)`,
                                java: `import java.util.*;\nvoid bfs(Map<Integer, List<Integer>> graph, int start) {\n    Set<Integer> visited = new HashSet<>();\n    Queue<Integer> q = new LinkedList<>();\n    visited.add(start); q.add(start);\n    while (!q.isEmpty()) {\n        int node = q.poll();\n        for (int neighbor : graph.getOrDefault(node, Collections.emptyList())) {\n            if (!visited.contains(neighbor)) {\n                visited.add(neighbor); q.add(neighbor);\n            }\n        }\n    }\n}`,
                                cpp: `#include <queue>\n#include <unordered_set>\nvoid bfs(std::unordered_map<int, std::vector<int>>& graph, int start) {\n    std::unordered_set<int> visited{start};\n    std::queue<int> q; q.push(start);\n    while(!q.empty()) {\n        int node = q.front(); q.pop();\n        for(int neighbor : graph[node]) {\n            if(visited.find(neighbor) == visited.end()) {\n                visited.insert(neighbor); q.push(neighbor);\n            }\n        }\n    }\n}`,
                                javascript: `function bfs(graph, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  while (queue.length > 0) {\n    const node = queue.shift();\n    for (const neighbor of (graph.get(node) || [])) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-dijkstra",
                slug: "dijkstras-algorithm",
                categorySlug: "algorithms",
                title: "Dijkstra's Shortest Path",
                subtitle: "Single-source shortest path for non-negative weighted edge graphs",
                difficulty: "Advanced",
                readTime: "13 min read",
                summary: "Master greedy priority queue relaxation for shortest weighted graph paths.",
                overview: "Dijkstra's algorithm finds shortest paths from a single source node to all vertices in non-negative weighted graphs.",
                keyConcepts: ["Priority Queue (Min-Heap) relaxation", "Edge Relaxation: dist[v] = min(dist[v], dist[u] + weight)", "Non-negative edge weight constraint"],
                timeComplexity: { average: "O((V + E) log V)" },
                spaceComplexity: "O(V)",
                sections: [
                    {
                        heading: "1. Min-Heap Dijkstra Implementation",
                        content: "Repeatedly extracts the vertex with minimum tentative distance and relaxes its outgoing edges.",
                        codeSnippet: {
                            title: "Dijkstra Algorithm",
                            code: {
                                python: `import heapq\ndef dijkstra(graph, src, n):\n    dist = [float('inf')] * n\n    dist[src] = 0\n    pq = [(0, src)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, weight in graph[u]:\n            if dist[u] + weight < dist[v]:\n                dist[v] = dist[u] + weight\n                heapq.heappush(pq, (dist[v], v))\n    return dist`,
                                java: `import java.util.*;\nint[] dijkstra(List<List<int[]>> graph, int src, int n) {\n    int[] dist = new int[n]; Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[src] = 0;\n    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));\n    pq.add(new int[]{0, src});\n    while (!pq.isEmpty()) {\n        int[] curr = pq.poll(); int d = curr[0], u = curr[1];\n        if (d > dist[u]) continue;\n        for (int[] edge : graph.get(u)) {\n            int v = edge[0], weight = edge[1];\n            if (dist[u] + weight < dist[v]) {\n                dist[v] = dist[u] + weight; pq.add(new int[]{dist[v], v});\n            }\n        }\n    }\n    return dist;\n}`,
                                cpp: `#include <queue>\nstd::vector<int> dijkstra(const std::vector<std::vector<std::pair<int, int>>>& graph, int src, int n) {\n    std::vector<int> dist(n, 1e9); dist[src] = 0;\n    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;\n    pq.push({0, src});\n    while(!pq.empty()) {\n        auto [d, u] = pq.top(); pq.pop();\n        if (d > dist[u]) continue;\n        for (auto& [v, weight] : graph[u]) {\n            if (dist[u] + weight < dist[v]) {\n                dist[v] = dist[u] + weight; pq.push({dist[v], v});\n            }\n        }\n    }\n    return dist;\n}`,
                                javascript: `function dijkstra(graph, src, n) {\n  const dist = new Array(n).fill(Infinity);\n  dist[src] = 0;\n  // Min-priority queue simulated array\n  const pq = [[0, src]];\n  while (pq.length > 0) {\n    pq.sort((a, b) => a[0] - b[0]);\n    const [d, u] = pq.shift();\n    if (d > dist[u]) continue;\n    for (const [v, weight] of (graph[u] || [])) {\n      if (dist[u] + weight < dist[v]) {\n        dist[v] = dist[u] + weight;\n        pq.push([dist[v], v]);\n      }\n    }\n  }\n  return dist;\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-topological-sort",
                slug: "topological-sort",
                categorySlug: "algorithms",
                title: "Topological Sort (Kahn's & DFS)",
                subtitle: "Linear ordering of Directed Acyclic Graph (DAG) dependencies",
                difficulty: "Intermediate",
                readTime: "11 min read",
                summary: "Master dependency resolution in DAGs using Kahn's In-Degree algorithm.",
                overview: "Topological Sort orders vertices in a DAG such that for every directed edge u -> v, u appears before v.",
                keyConcepts: ["DAG requirement (No Directed Cycles)", "Kahn's Algorithm (In-Degree queue)", "Cycle Detection"],
                timeComplexity: { average: "O(V + E)" },
                spaceComplexity: "O(V)",
                sections: [
                    {
                        heading: "1. Kahn's Algorithm (In-Degree Queue)",
                        content: "Processes vertices with 0 incoming edges, decrementing neighbor in-degrees.",
                        codeSnippet: {
                            title: "Kahn's Topological Sort",
                            code: {
                                python: `from collections import deque\ndef topological_sort(n, edges):\n    in_degree = [0] * n\n    graph = [[] for _ in range(n)]\n    for u, v in edges:\n        graph[u].append(v); in_degree[v] += 1\n    q = deque([i for i in range(n) if in_degree[i] == 0])\n    order = []\n    while q:\n        u = q.popleft(); order.append(u)\n        for v in graph[u]:\n            in_degree[v] -= 1\n            if in_degree[v] == 0: q.append(v)\n    return order if len(order) == n else []`,
                                java: `import java.util.*;\nList<Integer> topologicalSort(int n, int[][] edges) {\n    int[] inDegree = new int[n];\n    List<List<Integer>> graph = new ArrayList<>();\n    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n    for (int[] e : edges) { graph.get(e[0]).add(e[1]); inDegree[e[1]]++; }\n    Queue<Integer> q = new LinkedList<>();\n    for (int i = 0; i < n; i++) if (inDegree[i] == 0) q.add(i);\n    List<Integer> order = new ArrayList<>();\n    while (!q.isEmpty()) {\n        int u = q.poll(); order.add(u);\n        for (int v : graph.get(u)) if (--inDegree[v] == 0) q.add(v);\n    }\n    return order.size() == n ? order : new ArrayList<>();\n}`,
                                cpp: `#include <vector>\n#include <queue>\nstd::vector<int> topologicalSort(int n, const std::vector<std::pair<int, int>>& edges) {\n    std::vector<int> inDegree(n, 0);\n    std::vector<std::vector<int>> graph(n);\n    for(auto& [u, v] : edges) { graph[u].push_back(v); inDegree[v]++; }\n    std::queue<int> q;\n    for(int i = 0; i < n; i++) if(inDegree[i] == 0) q.push(i);\n    std::vector<int> order;\n    while(!q.empty()) {\n        int u = q.front(); q.pop(); order.push_back(u);\n        for(int v : graph[u]) if(--inDegree[v] == 0) q.push(v);\n    }\n    return order.size() == n ? order : std::vector<int>();\n}`,
                                javascript: `function topologicalSort(n, edges) {\n  const inDegree = new Array(n).fill(0);\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) { graph[u].push(v); inDegree[v]++; }\n  const q = [];\n  for (let i = 0; i < n; i++) if (inDegree[i] === 0) q.push(i);\n  const order = [];\n  while (q.length > 0) {\n    const u = q.shift(); order.push(u);\n    for (const v of graph[u]) if (--inDegree[v] === 0) q.push(v);\n  }\n  return order.length === n ? order : [];\n}`
                            }
                        }
                    }
                ]
            },
            {
                id: "algo-bit-manipulation",
                slug: "bit-manipulation",
                categorySlug: "algorithms",
                title: "Bit Manipulation",
                subtitle: "Low-level bitwise operations, masks, and Brian Kernighan's trick",
                difficulty: "Intermediate",
                readTime: "9 min read",
                summary: "Master AND, OR, XOR, shifts, mask clearance, and bit tricks.",
                overview: "Bit manipulation executes binary arithmetic operations directly on integer bit patterns with zero memory overhead.",
                keyConcepts: ["Clear lowest set bit: n & (n - 1)", "XOR property: a ^ a = 0, a ^ 0 = a", "Bitmask flag tracking"],
                timeComplexity: { average: "O(1)" },
                spaceComplexity: "O(1)",
                sections: [
                    {
                        heading: "1. Kernighan Bit Count Trick",
                        content: "Clears the rightmost set 1-bit in constant execution rounds equal to set bit count.",
                        codeSnippet: {
                            title: "Brian Kernighan Set Bit Count",
                            code: {
                                python: `def count_set_bits(n):\n    count = 0\n    while n:\n        n &= (n - 1) # Clears rightmost set bit\n        count += 1\n    return count`,
                                java: `int countSetBits(int n) {\n    int count = 0;\n    while (n != 0) {\n        n &= (n - 1);\n        count++;\n    }\n    return count;\n}`,
                                cpp: `int countSetBits(int n) {\n    int count = 0;\n    while (n) {\n        n &= (n - 1);\n        count++;\n    }\n    return count;\n}`,
                                javascript: `function countSetBits(n) {\n  let count = 0;\n  while (n > 0) {\n    n &= (n - 1);\n    count++;\n  }\n  return count;\n}`
                            }
                        }
                    }
                ]
            }
        ]
    },
    {
        id: "cs-core",
        slug: "cs-core",
        title: "Computer Science Core",
        icon: "Terminal",
        description: "Fundamental systems topics including Operating Systems, Networking, and Databases.",
        topics: [
            {
                id: "cs-os-memory",
                slug: "memory-management",
                categorySlug: "cs-core",
                title: "OS Memory & Paging",
                subtitle: "Virtual Address Spaces, MMU Translation, and TLB Caches",
                difficulty: "Intermediate",
                readTime: "11 min read",
                summary: "Understand virtual memory addressing, MMU hardware translation, and page faults.",
                overview: "Virtual Memory abstracts physical RAM, giving processes isolated non-contiguous address spaces translated via Page Tables.",
                keyConcepts: ["Virtual Address Space vs Physical RAM", "Page Table & Translation Lookaside Buffer (TLB)", "Page Fault Handling"],
                sections: [
                    {
                        heading: "1. MMU Address Translation",
                        content: "Translates high virtual page numbers into physical page frame numbers."
                    }
                ]
            },
            {
                id: "cs-process-threads",
                slug: "processes-and-threads",
                categorySlug: "cs-core",
                title: "Processes & Threading",
                subtitle: "Context switching, PCB control blocks, and multi-threading models",
                difficulty: "Intermediate",
                readTime: "10 min read",
                summary: "Compare process isolation against shared-memory multi-threaded execution.",
                overview: "A Process is an executing instance with isolated memory space. Threads exist inside a process and share heap memory.",
                keyConcepts: ["Process Control Block (PCB)", "Shared Heap vs Private Stacks", "Context Switching Overhead"],
                sections: [{ heading: "1. Memory Sharing", content: "Threads share heap and file descriptors but keep private registers and stacks." }]
            },
            {
                id: "cs-concurrency",
                slug: "concurrency-and-deadlocks",
                categorySlug: "cs-core",
                title: "Concurrency & Deadlocks",
                subtitle: "Mutexes, Semaphores, Race Conditions, and Coffman Conditions",
                difficulty: "Advanced",
                readTime: "14 min read",
                summary: "Learn thread synchronization primitives and Coffman deadlock prevention.",
                overview: "Concurrency coordinates simultaneous access to shared resources without race conditions or deadlocks.",
                keyConcepts: ["Mutex vs Counting Semaphore", "4 Coffman Deadlock Conditions", "Banker's Algorithm for Avoidance"],
                sections: [{ heading: "1. Coffman Conditions", content: "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait." }]
            },
            {
                id: "cs-networks-http",
                slug: "network-protocols-http",
                categorySlug: "cs-core",
                title: "TCP/IP & HTTP/HTTPS",
                subtitle: "OSI 7-Layer model, 3-way handshakes, and TLS handshake",
                difficulty: "Intermediate",
                readTime: "13 min read",
                summary: "Understand transport reliability, TCP sequence numbers, and HTTPS TLS security.",
                overview: "Networking protocols structure data packet transmission across global networks.",
                keyConcepts: ["TCP 3-Way Handshake (SYN, SYN-ACK, ACK)", "UDP Unreliable Datagrams", "HTTPS TLS 1.3 Asymmetric Encryption"],
                sections: [{ heading: "1. TCP Handshake", content: "Establishes reliable sequence numbers before payload transmission." }]
            },
            {
                id: "cs-db-indexing",
                slug: "database-indexing-b-trees",
                categorySlug: "cs-core",
                title: "Database Indexing & B-Trees",
                subtitle: "B-Trees, B+ Trees, and LSM-Trees for disk-backed data retrieval",
                difficulty: "Advanced",
                readTime: "15 min read",
                summary: "Master high-fanout B+ Tree disk indexing and logarithmic search bounds.",
                overview: "Indexes trade storage space to avoid full table sequential disk scans.",
                keyConcepts: ["B+ Tree Fanout & Disk Page Alignments", "Clustered vs Secondary Index", "LSM Tree Write Amplification"],
                sections: [{ heading: "1. B+ Tree Node Mechanics", content: "Data records sit exclusively in linked leaf nodes for range scans." }]
            },
            {
                id: "cs-db-transactions",
                slug: "acid-and-transactions",
                categorySlug: "cs-core",
                title: "ACID Properties & Isolation",
                subtitle: "Atomicity, Consistency, Isolation Levels, and Two-Phase Locking",
                difficulty: "Advanced",
                readTime: "12 min read",
                summary: "Understand transactional guarantees and transaction isolation levels.",
                overview: "ACID guarantees reliable execution of database queries amidst hardware crashes.",
                keyConcepts: ["Atomicity & Write-Ahead Logging (WAL)", "Isolation Levels: Read Uncommitted to Serializable", "Dirty Reads & Phantom Reads"],
                sections: [{ heading: "1. Isolation Anomaly Matrix", content: "Stricter isolation levels eliminate phantom reads at throughput costs." }]
            },
            {
                id: "cs-db-nosql",
                slug: "sql-vs-nosql",
                categorySlug: "cs-core",
                title: "SQL vs NoSQL Paradigms",
                subtitle: "Relational tables vs Key-Value, Document, and Columnar stores",
                difficulty: "Intermediate",
                readTime: "10 min read",
                summary: "Compare relational schema constraints against schemaless document stores.",
                overview: "Relational databases optimize structured integrity; NoSQL database models scale horizontally.",
                keyConcepts: ["Relational Schema Normalization", "CAP Theorem (Consistency, Availability, Partition Tolerance)", "Eventual Consistency"],
                sections: [{ heading: "1. CAP Theorem Tradeoffs", content: "Distributed data stores can guarantee at most 2 of CP or AP under network partitions." }]
            },
            {
                id: "cs-design-patterns",
                slug: "design-patterns",
                categorySlug: "cs-core",
                title: "Software Design Patterns",
                subtitle: "Creational, Structural, and Behavioral Gang-of-Four Patterns",
                difficulty: "Intermediate",
                readTime: "14 min read",
                summary: "Master Singleton, Factory, Observer, Strategy, and Decorator architectural patterns.",
                overview: "Design Patterns present reusable solutions to standard software engineering object compositions.",
                keyConcepts: ["SOLID Design Principles", "Strategy Pattern for runtime policy switching", "Observer Pattern for event handling"],
                sections: [{ heading: "1. Strategy Pattern Concept", content: "Decouples algorithms into interchangeable policy objects." }]
            }
        ]
    },
    {
        id: "sys-design",
        slug: "system-design",
        title: "System Design & Scalability",
        icon: "Cpu",
        description: "Architectural blueprints for building resilient, high-throughput distributed systems.",
        topics: [
            {
                id: "sd-load-balancing",
                slug: "load-balancing-rate-limiting",
                categorySlug: "system-design",
                title: "Load Balancing & Rate Limiting",
                subtitle: "Layer 4/7 Traffic Routers, Consistent Hashing, and Token Bucket Algorithms",
                difficulty: "Advanced",
                readTime: "13 min read",
                summary: "Learn high-availability reverse proxies, consistent hash rings, and rate limiters.",
                overview: "Load Balancers distribute incoming network traffic evenly across server clusters.",
                keyConcepts: ["Layer 4 (TCP) vs Layer 7 (HTTP) Routing", "Consistent Hashing Ring", "Token Bucket & Leaky Bucket Rate Limiters"],
                sections: [{ heading: "1. Token Bucket Limiter", content: "Replenishes tokens periodically to smooth API request bursts." }]
            },
            {
                id: "sd-caching",
                slug: "caching-strategies",
                categorySlug: "system-design",
                title: "Distributed Caching (Redis)",
                subtitle: "Cache-Aside, Write-Through, Write-Back, and LRU Eviction Policies",
                difficulty: "Intermediate",
                readTime: "11 min read",
                summary: "Master in-memory caching patterns to reduce backend database load.",
                overview: "In-memory caching places fast RAM buffers between Application Servers and Databases.",
                keyConcepts: ["Cache-Aside Pattern", "Cache Stampede & Thundering Herd", "LRU / LFU Eviction Policies"],
                sections: [{ heading: "1. Cache-Aside Pattern", content: "App checks cache first; on miss, queries DB and populates cache." }]
            },
            {
                id: "sd-message-queues",
                slug: "message-queues-kafka",
                categorySlug: "system-design",
                title: "Message Queues & Event Streaming",
                subtitle: "Asynchronous processing with RabbitMQ and Apache Kafka log partitions",
                difficulty: "Advanced",
                readTime: "14 min read",
                summary: "Decouple microservices using pub-sub messaging and partitioned commit logs.",
                overview: "Message queues buffer asynchronous jobs, preventing downstream service overload.",
                keyConcepts: ["At-Least-Once vs Exactly-Once Semantics", "Kafka Distributed Commit Log", "Consumer Group Offset Management"],
                sections: [{ heading: "1. Kafka Log Partitioning", content: "Events are appended sequentially to immutable partition logs." }]
            },
            {
                id: "sd-sharding",
                slug: "database-sharding-replication",
                categorySlug: "system-design",
                title: "DB Sharding & Replication",
                subtitle: "Horizontal partitioning, Master-Replica setups, and Consensus",
                difficulty: "Advanced",
                readTime: "15 min read",
                summary: "Scale write throughput across distributed database nodes.",
                overview: "Sharding partitions data horizontally across independent database instances.",
                keyConcepts: ["Shard Key Selection", "Read Replicas & Replication Lag", "Raft/Paxos Consensus Protocols"],
                sections: [{ heading: "1. Horizontal Sharding", content: "Distributes rows based on shard key hash ranges." }]
            }
        ]
    },
    {
        id: "math",
        slug: "mathematics",
        title: "Mathematics & Bitwise Tricks",
        icon: "Terminal",
        description: "Essential mathematical algorithms for computational problem solving.",
        topics: [
            {
                id: "math-gcd-euclid",
                slug: "gcd-euclidean-algorithm",
                categorySlug: "mathematics",
                title: "Euclidean GCD Algorithm",
                subtitle: "Greatest Common Divisor and Extended Euclidean Linear Combinations",
                difficulty: "Beginner",
                readTime: "8 min read",
                summary: "Compute greatest common divisors in logarithmic steps.",
                overview: "The Euclidean Algorithm computes GCD using the identity gcd(a, b) = gcd(b, a % b).",
                keyConcepts: ["Euclidean Identity", "O(log(min(a,b))) Time Bound"],
                sections: [{ heading: "1. GCD Implementation", content: "Recursively replaces pair with (b, a % b) until b becomes 0." }]
            },
            {
                id: "math-sieve",
                slug: "sieve-of-eratosthenes",
                categorySlug: "mathematics",
                title: "Sieve of Eratosthenes",
                subtitle: "Generating prime numbers up to N in O(N log log N) time",
                difficulty: "Intermediate",
                readTime: "9 min read",
                summary: "Generate prime tables efficiently using composite marking.",
                overview: "The Sieve of Eratosthenes marks multiples of discovered primes starting from p^2.",
                keyConcepts: ["Composite Marking from p^2", "O(N log log N) Time Complexity"],
                sections: [{ heading: "1. Prime Sieve Logic", content: "Iterates up to sqrt(N) marking composite array slots." }]
            },
            {
                id: "math-fast-expo",
                slug: "fast-exponentiation",
                categorySlug: "mathematics",
                title: "Fast Modular Exponentiation",
                subtitle: "Computing (base^exp) % mod in O(log exp) operations",
                difficulty: "Intermediate",
                readTime: "8 min read",
                summary: "Compute large powers modulo M using binary exponentiation.",
                overview: "Binary Exponentiation computes powers by squaring base when exponent bit is 0.",
                keyConcepts: ["Divide and Conquer Exponentiation", "Preventing Integer Overflow with Modulo"],
                sections: [{ heading: "1. Binary Power Reduction", content: "Squares base at each step and multiplies target when power is odd." }]
            },
            {
                id: "math-combinatorics",
                slug: "combinatorics-pascals-triangle",
                categorySlug: "mathematics",
                title: "Combinatorics & Pascal's Triangle",
                subtitle: "Combinations nCr, Permutations nPr, and Modular Multiplicative Inverses",
                difficulty: "Intermediate",
                readTime: "10 min read",
                summary: "Compute nCr combinations modulo 10^9+7 using precomputed factorials.",
                overview: "Combinatorics calculates arrangements and selections of set elements.",
                keyConcepts: ["Pascal Identity nCr = (n-1)r + (n-1)(r-1)", "Fermat's Little Theorem for Mod Inverse"],
                sections: [{ heading: "1. Precomputed Factorials", content: "Allows O(1) combinations query using inverse factorials." }]
            }
        ]
    },
    {
        id: "adv-ds",
        slug: "advanced-dsa",
        title: "Advanced Data Structures & Strings",
        icon: "Layers",
        description: "Specialized high-performance data structures and string matching algorithms.",
        topics: [
            {
                id: "adv-segment-tree",
                slug: "segment-trees",
                categorySlug: "advanced-dsa",
                title: "Segment Trees",
                subtitle: "Range Query and Point Update tree structures in O(log N)",
                difficulty: "Advanced",
                readTime: "14 min read",
                summary: "Perform range min/max/sum queries and point updates in O(log N) time.",
                overview: "A Segment Tree stores interval query data over array segments in tree nodes.",
                keyConcepts: ["Range Query Decomposition", "Point & Lazy Range Updates"],
                sections: [{ heading: "1. Segment Tree Build", content: "Divides range [L, R] into left [L, mid] and right [mid+1, R] child segments." }]
            },
            {
                id: "adv-fenwick-tree",
                slug: "fenwick-trees-bit",
                categorySlug: "advanced-dsa",
                title: "Fenwick Trees (Binary Indexed Tree)",
                subtitle: "Space-efficient range prefix sum tree with low-bit index offsets",
                difficulty: "Advanced",
                readTime: "12 min read",
                summary: "Master bitwise lowest set bit index updates for prefix sum ranges.",
                overview: "Fenwick Trees calculate prefix sums and point updates in O(log N) using simple 1D array bit operations.",
                keyConcepts: ["Low-bit isolate: i & (-i)", "Compact 1D Array Storage"],
                sections: [{ heading: "1. Low-Bit Offset Traversal", content: "Adds i & (-i) during updates and subtracts low-bit during prefix queries." }]
            },
            {
                id: "adv-kmp-string",
                slug: "kmp-string-matching",
                categorySlug: "advanced-dsa",
                title: "KMP String Matching",
                subtitle: "Knuth-Morris-Pratt substring search using Prefix LPS tables in O(N+M)",
                difficulty: "Advanced",
                readTime: "13 min read",
                summary: "Find substring pattern occurrences without re-scanning text characters.",
                overview: "KMP utilizes a Longest Prefix Suffix (LPS) table to skip redundant character comparisons.",
                keyConcepts: ["LPS Table Construction", "O(N + M) Linear Match Guarantee"],
                sections: [{ heading: "1. LPS Table Calculation", content: "Stores length of longest matching proper prefix that is also a suffix." }]
            },
            {
                id: "adv-union-find-opt",
                slug: "advanced-union-find",
                categorySlug: "advanced-dsa",
                title: "Advanced DSU Optimizations",
                subtitle: "Undo operations, Rollback DSU, and Persistent Disjoint Sets",
                difficulty: "Advanced",
                readTime: "15 min read",
                summary: "Master stack-based DSU rollback for dynamic offline graph connectivity.",
                overview: "Rollback DSU omits path compression to allow O(log N) undo operations via explicit state stacks.",
                keyConcepts: ["DSU without Path Compression (Union by Rank only)", "Rollback Stack for Undo"],
                sections: [{ heading: "1. Undo Stack", content: "Pushes changed parent pointer entries to undo modifications on dynamic graphs." }]
            }
        ]
    }
];

export function getAllTopics(): LearnTopic[] {
    return LEARN_CATEGORIES.flatMap(c => c.topics);
}

export function getTopicBySlug(categorySlug: string, topicSlug: string): LearnTopic | undefined {
    const category = LEARN_CATEGORIES.find(c => c.slug === categorySlug);
    if (!category) return undefined;
    return category.topics.find(t => t.slug === topicSlug);
}

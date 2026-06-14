const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(__dirname, '../judge-backend/problems');
if (!fs.existsSync(PROBLEMS_DIR)) {
    fs.mkdirSync(PROBLEMS_DIR, { recursive: true });
}

// Helper: Random number generators
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice(arr) {
    return arr[randomInt(0, arr.length - 1)];
}
function randomChoices(arr, k) {
    let res = [];
    for (let i = 0; i < k; i++) res.push(randomChoice(arr));
    return res;
}
function randomSample(arr, k) {
    let copy = [...arr];
    let res = [];
    for (let i = 0; i < k; i++) {
        if (copy.length === 0) break;
        let idx = randomInt(0, copy.length - 1);
        res.push(copy.splice(idx, 1)[0]);
    }
    return res;
}

// ----------------- SOLVER FUNCTIONS -----------------

function solve_sum_of_squares(n) {
    return (n * (n + 1) * (2 * n + 1)) / 6;
}

function solve_is_power_of_five(n) {
    if (n <= 0) return "false";
    while (n % 5 === 0) {
        n = Math.floor(n / 5);
    }
    return n === 1 ? "true" : "false";
}

function solve_harshad_number_check(n) {
    if (n <= 0) return "false";
    let sumDigits = String(n).split('').reduce((acc, c) => acc + parseInt(c), 0);
    return n % sumDigits === 0 ? "true" : "false";
}

function solve_armstrong_numbers_in_range(low, high) {
    let res = [];
    for (let num = low; num <= high; num++) {
        let s = String(num);
        let k = s.length;
        let sumDigits = s.split('').reduce((acc, c) => acc + Math.pow(parseInt(c), k), 0);
        if (sumDigits === num) {
            res.push(num);
        }
    }
    return res.length > 0 ? res.join(' ') : "-1";
}

function solve_frequency_of_each_element(arr) {
    let freq = {};
    for (let x of arr) {
        freq[x] = (freq[x] || 0) + 1;
    }
    let sortedKeys = Object.keys(freq).map(Number).sort((a, b) => a - b);
    return sortedKeys.map(k => `${k}:${freq[k]}`).join(' ');
}

function solve_remove_all_occurrences(arr, val) {
    let res = arr.filter(x => x !== val);
    return res.length > 0 ? res.join(' ') : "-1";
}

function solve_find_first_occurrence_binary(arr, target) {
    let low = 0, high = arr.length - 1;
    let ans = -1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) {
            ans = mid;
            high = mid - 1;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return ans;
}

function solve_k_largest_elements(arr, k) {
    let res = [...arr].sort((a, b) => b - a).slice(0, k);
    return res.join(' ');
}

function solve_min_cost_climbing_stairs(cost) {
    let n = cost.length;
    if (n === 0) return 0;
    if (n === 1) return cost[0];
    let dp = new Array(n + 1).fill(0);
    for (let i = 2; i <= n; i++) {
        dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);
    }
    return dp[n];
}

function solve_count_substrings_with_k_distinct(s, k) {
    function at_most_k(s, k) {
        if (k < 0) return 0;
        let count = 0;
        let left = 0;
        let charMap = {};
        let distinctCount = 0;
        for (let right = 0; right < s.length; right++) {
            if (!charMap[s[right]]) {
                distinctCount++;
                charMap[s[right]] = 0;
            }
            charMap[s[right]]++;
            while (distinctCount > k) {
                charMap[s[left]]--;
                if (charMap[s[left]] === 0) {
                    distinctCount--;
                    delete charMap[s[left]];
                }
                left++;
            }
            count += right - left + 1;
        }
        return count;
    }
    return at_most_k(s, k) - at_most_k(s, k - 1);
}

function solve_longest_common_substring(s1, s2) {
    let n = s1.length, m = s2.length;
    let dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    let ans = 0;
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                ans = Math.max(ans, dp[i][j]);
            } else {
                dp[i][j] = 0;
            }
        }
    }
    return ans;
}

function solve_matrix_boundary_traversal(matrix) {
    if (!matrix || !matrix[0]) return "";
    let m = matrix.length, n = matrix[0].length;
    let res = [];
    if (m === 1) {
        res.push(...matrix[0]);
    } else if (n === 1) {
        for (let r = 0; r < m; r++) {
            res.push(matrix[r][0]);
        }
    } else {
        for (let c = 0; c < n; c++) res.push(matrix[0][c]);
        for (let r = 1; r < m - 1; r++) res.push(matrix[r][n - 1]);
        for (let c = n - 1; c >= 0; c--) res.push(matrix[m - 1][c]);
        for (let r = m - 2; r > 0; r--) res.push(matrix[r][0]);
    }
    return res.join(' ');
}

function solve_check_sparse_matrix(matrix) {
    let m = matrix.length;
    let n = matrix[0].length;
    let zeros = 0;
    for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
            if (matrix[r][c] === 0) zeros++;
        }
    }
    return zeros > (m * n) / 2 ? "true" : "false";
}

function solve_valid_ip_address(queryIP) {
    function is_ipv4(ip) {
        let parts = ip.split('.');
        if (parts.length !== 4) return false;
        for (let part of parts) {
            if (!/^\d+$/.test(part)) return false;
            let val = parseInt(part);
            if (val < 0 || val > 255) return false;
            if (part.length > 1 && part[0] === '0') return false;
        }
        return true;
    }

    function is_ipv6(ip) {
        let parts = ip.split(':');
        if (parts.length !== 8) return false;
        let hexDigits = "0123456789abcdefABCDEF";
        for (let part of parts) {
            if (part.length < 1 || part.length > 4) return false;
            for (let char of part) {
                if (hexDigits.indexOf(char) === -1) return false;
            }
        }
        return true;
    }

    if (is_ipv4(queryIP)) return "IPv4";
    if (is_ipv6(queryIP)) return "IPv6";
    return "Neither";
}

function solve_compress_string(s) {
    if (!s) return "";
    let res = [];
    let i = 0;
    while (i < s.length) {
        let char = s[i];
        let count = 0;
        while (i < s.length && s[i] === char) {
            count++;
            i++;
        }
        res.push(`${char}${count}`);
    }
    return res.join('');
}

function solve_longest_subarray_with_sum_k(arr, k) {
    let prefixSumMap = {};
    let currSum = 0;
    let maxLen = 0;
    for (let i = 0; i < arr.length; i++) {
        currSum += arr[i];
        if (currSum === k) {
            maxLen = i + 1;
        }
        if (prefixSumMap[currSum - k] !== undefined) {
            maxLen = Math.max(maxLen, i - prefixSumMap[currSum - k]);
        }
        if (prefixSumMap[currSum] === undefined) {
            prefixSumMap[currSum] = i;
        }
    }
    return maxLen;
}

function solve_subarray_with_given_sum(arr, k) {
    let left = 0;
    let currSum = 0;
    for (let right = 0; right < arr.length; right++) {
        currSum += arr[right];
        while (currSum > k && left < right) {
            currSum -= arr[left];
            left++;
        }
        if (currSum === k) {
            return `${left + 1} ${right + 1}`;
        }
    }
    return "-1";
}

function solve_count_subarrays_with_given_xor(arr, k) {
    let xorMap = { 0: 1 };
    let currXor = 0;
    let count = 0;
    for (let x of arr) {
        currXor ^= x;
        if (xorMap[currXor ^ k] !== undefined) {
            count += xorMap[currXor ^ k];
        }
        xorMap[currXor] = (xorMap[currXor] || 0) + 1;
    }
    return count;
}

function solve_maximum_sum_circular_subarray(arr) {
    let totalSum = arr.reduce((a, b) => a + b, 0);
    let currMax = arr[0], maxSum = arr[0];
    let currMin = arr[0], minSum = arr[0];
    for (let i = 1; i < arr.length; i++) {
        let x = arr[i];
        currMax = Math.max(x, currMax + x);
        maxSum = Math.max(maxSum, currMax);
        currMin = Math.min(x, currMin + x);
        minSum = Math.min(minSum, currMin);
    }
    if (maxSum < 0) return maxSum;
    return Math.max(maxSum, totalSum - minSum);
}

function solve_leaders_in_array(arr) {
    if (!arr.length) return "";
    let leaders = [];
    let maxRight = arr[arr.length - 1];
    leaders.push(maxRight);
    for (let i = arr.length - 2; i >= 0; i--) {
        if (arr[i] >= maxRight) {
            leaders.push(arr[i]);
            maxRight = arr[i];
        }
    }
    leaders.reverse();
    return leaders.join(' ');
}

function solve_equilibrium_point(arr) {
    let total = arr.reduce((a, b) => a + b, 0);
    let leftSum = 0;
    for (let i = 0; i < arr.length; i++) {
        total -= arr[i];
        if (leftSum === total) {
            return i + 1;
        }
        leftSum += arr[i];
    }
    return -1;
}

function solve_wave_array(arr) {
    let res = [...arr];
    for (let i = 0; i < res.length - 1; i += 2) {
        let tmp = res[i];
        res[i] = res[i + 1];
        res[i + 1] = tmp;
    }
    return res.join(' ');
}

function solve_triplet_sum_in_array(arr, k) {
    let sorted = [...arr].sort((a, b) => a - b);
    let n = sorted.length;
    for (let i = 0; i < n - 2; i++) {
        let left = i + 1, right = n - 1;
        while (left < right) {
            let s = sorted[i] + sorted[left] + sorted[right];
            if (s === k) {
                return "true";
            } else if (s < k) {
                left++;
            } else {
                right--;
            }
        }
    }
    return "false";
}

function solve_subarray_with_zero_sum(arr) {
    let s = new Set();
    let currSum = 0;
    for (let x of arr) {
        currSum += x;
        if (currSum === 0 || s.has(currSum)) {
            return "true";
        }
        s.add(currSum);
    }
    return "false";
}

function solve_kth_smallest_prime_fraction(arr, k) {
    let fractions = [];
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            fractions.push({ val: arr[i] / arr[j], num: arr[i], den: arr[j] });
        }
    }
    fractions.sort((a, b) => a.val - b.val);
    let target = fractions[k - 1];
    return `${target.num}/${target.den}`;
}

function solve_sort_array_by_frequency(arr) {
    let freq = {};
    for (let x of arr) {
        freq[x] = (freq[x] || 0) + 1;
    }
    let res = [...arr].sort((a, b) => {
        if (freq[a] !== freq[b]) {
            return freq[b] - freq[a];
        }
        return a - b;
    });
    return res.join(' ');
}

function solve_minimum_platforms(arr, dep) {
    let sortedArr = [...arr].sort((a, b) => a - b);
    let sortedDep = [...dep].sort((a, b) => a - b);
    let n = sortedArr.length;
    let platNeeded = 1;
    let result = 1;
    let i = 1, j = 0;
    while (i < n && j < n) {
        if (sortedArr[i] <= sortedDep[j]) {
            platNeeded++;
            i++;
        } else {
            platNeeded--;
            j++;
        }
        result = Math.max(result, platNeeded);
    }
    return result;
}

function solve_fractional_knapsack(values, weights, w) {
    let items = [];
    for (let i = 0; i < values.length; i++) {
        items.push({ ratio: values[i] / weights[i], val: values[i], wt: weights[i] });
    }
    items.sort((a, b) => b.ratio - a.ratio);
    let totalVal = 0.0;
    for (let item of items) {
        if (w >= item.wt) {
            w -= item.wt;
            totalVal += item.val;
        } else {
            totalVal += item.val * (w / item.wt);
            break;
        }
    }
    return totalVal.toFixed(2);
}

function solve_job_sequencing_problem(deadlines, profits) {
    let jobs = [];
    for (let i = 0; i < deadlines.length; i++) {
        jobs.push({ dl: deadlines[i], pf: profits[i] });
    }
    jobs.sort((a, b) => b.pf - a.pf);
    let maxDeadline = Math.max(...deadlines);
    let slot = new Array(maxDeadline + 1).fill(false);
    let count = 0;
    let totalProfit = 0;
    for (let job of jobs) {
        for (let j = Math.min(maxDeadline, job.dl); j > 0; j--) {
            if (!slot[j]) {
                slot[j] = true;
                count++;
                totalProfit += job.pf;
                break;
            }
        }
    }
    return `${count} ${totalProfit}`;
}

function solve_n_meetings_in_one_room(start, end) {
    let meetings = [];
    for (let i = 0; i < start.length; i++) {
        meetings.push({ s: start[i], e: end[i] });
    }
    meetings.sort((a, b) => a.e - b.e);
    let count = 0;
    let lastEnd = -1;
    for (let m of meetings) {
        if (m.s > lastEnd) {
            count++;
            lastEnd = m.e;
        }
    }
    return count;
}

function solve_combination_sum_iii(k, n) {
    let res = [];
    function backtrack(start, comb, target) {
        if (comb.length === k) {
            if (target === 0) {
                res.push([...comb]);
            }
            return;
        }
        for (let i = start; i <= 9; i++) {
            if (i > target) break;
            comb.push(i);
            backtrack(i + 1, comb, target - i);
            comb.pop();
        }
    }
    backtrack(1, [], n);
    if (res.length === 0) return "-1";
    return res.map(x => x.join(' ')).join(',');
}

function solve_generate_all_subsequences(s) {
    let res = [];
    function backtrack(idx, curr) {
        if (idx === s.length) {
            if (curr) res.push(curr);
            return;
        }
        backtrack(idx + 1, curr + s[idx]);
        backtrack(idx + 1, curr);
    }
    backtrack(0, "");
    res.sort();
    return res.length > 0 ? res.join(' ') : "-1";
}

function solve_word_boggle(dictionary, board) {
    if (!board || !board[0]) return "-1";
    let r = board.length, c = board[0].length;
    let found = new Set();

    function dfs(i, j, word, idx, visited) {
        if (idx === word.length) return true;
        if (i < 0 || i >= r || j < 0 || j >= c || visited[i][j] || board[i][j] !== word[idx]) {
            return false;
        }
        visited[i][j] = true;
        for (let di of [-1, 0, 1]) {
            for (let dj of [-1, 0, 1]) {
                if (di === 0 && dj === 0) continue;
                if (dfs(i + di, j + dj, word, idx + 1, visited)) {
                    visited[i][j] = false;
                    return true;
                }
            }
        }
        visited[i][j] = false;
        return false;
    }

    for (let word of dictionary) {
        let wordFound = false;
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                if (board[i][j] === word[0]) {
                    let visited = Array.from({ length: r }, () => new Array(c).fill(false));
                    if (dfs(i, j, word, 0, visited)) {
                        found.add(word);
                        wordFound = true;
                        break;
                    }
                }
            }
            if (wordFound) break;
        }
    }
    let sortedFound = Array.from(found).sort();
    return sortedFound.length > 0 ? sortedFound.join(' ') : "-1";
}

function solve_longest_happy_prefix(s) {
    let n = s.length;
    let lps = new Array(n).fill(0);
    let j = 0;
    for (let i = 1; i < n; i++) {
        while (j > 0 && s[i] !== s[j]) {
            j = lps[j - 1];
        }
        if (s[i] === s[j]) {
            j++;
            lps[i] = j;
        }
    }
    let length = lps[n - 1];
    return length > 0 ? s.substring(0, length) : "-1";
}

function solve_count_of_inversions(arr) {
    function mergeSort(arr, temp, left, right) {
        let invCount = 0;
        if (left < right) {
            let mid = Math.floor((left + right) / 2);
            invCount += mergeSort(arr, temp, left, mid);
            invCount += mergeSort(arr, temp, mid + 1, right);
            invCount += merge(arr, temp, left, mid, right);
        }
        return invCount;
    }

    function merge(arr, temp, left, mid, right) {
        let i = left, j = mid + 1, k = left;
        let invCount = 0;
        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
                invCount += (mid - i + 1);
            }
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (let idx = left; idx <= right; idx++) {
            arr[idx] = temp[idx];
        }
        return invCount;
    }

    let temp = new Array(arr.length).fill(0);
    let copy = [...arr];
    return mergeSort(copy, temp, 0, copy.length - 1);
}

function solve_merge_without_extra_space(arr1, arr2) {
    let res = [...arr1, ...arr2].sort((a, b) => a - b);
    return res.join(' ');
}

function solve_minimum_swaps_to_sort(arr) {
    let n = arr.length;
    let arrPos = arr.map((val, idx) => ({ val, idx }));
    arrPos.sort((a, b) => a.val - b.val);
    let vis = new Array(n).fill(false);
    let ans = 0;
    for (let i = 0; i < n; i++) {
        if (vis[i] || arrPos[i].idx === i) continue;
        let cycleSize = 0;
        let j = i;
        while (!vis[j]) {
            vis[j] = true;
            j = arrPos[j].idx;
            cycleSize++;
        }
        if (cycleSize > 0) {
            ans += (cycleSize - 1);
        }
    }
    return ans;
}

function solve_allocate_minimum_pages(arr, m) {
    let n = arr.length;
    if (n < m) return -1;

    function isFeasible(limit) {
        let students = 1;
        let currSum = 0;
        for (let pages of arr) {
            if (pages > limit) return false;
            if (currSum + pages > limit) {
                students++;
                currSum = pages;
                if (students > m) return false;
            } else {
                currSum += pages;
            }
        }
        return true;
    }

    let low = Math.max(...arr);
    let high = arr.reduce((a, b) => a + b, 0);
    let ans = -1;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (isFeasible(mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}

function solve_kth_element_of_two_sorted_arrays(arr1, arr2, k) {
    let res = [...arr1, ...arr2].sort((a, b) => a - b);
    return res[k - 1];
}

function solve_painters_partition_problem(boards, k) {
    function isFeasible(limit) {
        let painters = 1;
        let currSum = 0;
        for (let b of boards) {
            if (b > limit) return false;
            if (currSum + b > limit) {
                painters++;
                currSum = b;
                if (painters > k) return false;
            } else {
                currSum += b;
            }
        }
        return true;
    }

    let low = Math.max(...boards);
    let high = boards.reduce((a, b) => a + b, 0);
    let ans = high;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (isFeasible(mid)) {
            ans = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return ans;
}

// ----------------- PROBLEMS LIST DEFINITION -----------------

const problemsDefs = [
    {
        id: "sum_of_squares",
        title: "Sum of Squares",
        description: "Given an integer n, calculate the sum of squares of the first n natural numbers.",
        input_format: "A single integer n.",
        output_format: "A single integer representing the sum of squares.",
        constraints: { "n": "1 <= n <= 10^4" },
        difficulty: "easy",
        tags: ["Math"],
        generator: () => String(randomInt(1, 10000)),
        solver: (x) => solve_sum_of_squares(parseInt(x))
    },
    {
        id: "is_power_of_five",
        title: "Is Power of Five",
        description: "Given an integer n, return true if it is a power of five. Otherwise, return false.",
        input_format: "A single integer n.",
        output_format: "'true' or 'false'.",
        constraints: { "n": "-2^31 <= n <= 2^31 - 1" },
        difficulty: "easy",
        tags: ["Math"],
        generator: () => String(randomChoice([Math.pow(5, randomInt(0, 13)), randomInt(-1000, 10000)])),
        solver: (x) => solve_is_power_of_five(parseInt(x))
    },
    {
        id: "harshad_number_check",
        title: "Harshad Number Check",
        description: "An integer n is a Harshad number if it is divisible by the sum of its digits. Given n, check if it is a Harshad number.",
        input_format: "A single integer n.",
        output_format: "'true' or 'false'.",
        constraints: { "n": "1 <= n <= 10^9" },
        difficulty: "easy",
        tags: ["Math"],
        generator: () => String(randomInt(1, 10000000)),
        solver: (x) => solve_harshad_number_check(parseInt(x))
    },
    {
        id: "armstrong_numbers_in_range",
        title: "Armstrong Numbers in Range",
        description: "Given a range [low, high], print all Armstrong numbers in this range (inclusive) separated by space. If there are none, return -1.",
        input_format: "Two space-separated integers low and high.",
        output_format: "Space-separated Armstrong numbers or -1.",
        constraints: { "low, high": "1 <= low <= high <= 10^5" },
        difficulty: "easy",
        tags: ["Math"],
        generator: () => `${randomInt(1, 100)} ${randomInt(101, 10000)}`,
        solver: (x) => {
            let parts = x.split(' ').map(Number);
            return solve_armstrong_numbers_in_range(parts[0], parts[1]);
        }
    },
    {
        id: "frequency_of_each_element",
        title: "Frequency of Each Element",
        description: "Given an array of integers, count the frequency of each element. Return space-separated pairs of 'element:frequency' sorted by the element value.",
        input_format: "Space-separated integers.",
        output_format: "Space-separated element:frequency pairs.",
        constraints: { "arr.length": "1 <= length <= 10^4", "arr[i]": "-10^5 <= arr[i] <= 10^5" },
        difficulty: "easy",
        tags: ["Array", "Hash Table"],
        generator: () => Array.from({ length: randomInt(5, 100) }, () => randomInt(-50, 50)).join(' '),
        solver: (x) => solve_frequency_of_each_element(x.split(' ').map(Number))
    },
    {
        id: "remove_all_occurrences",
        title: "Remove All Occurrences",
        description: "Given an integer array and an integer val, remove all occurrences of val in-place. Return the remaining elements separated by space. If no elements remain, return -1.",
        input_format: "First line: space-separated array elements. Second line: target value to remove.",
        output_format: "Space-separated remaining elements or -1.",
        constraints: { "arr.length": "1 <= length <= 10^4", "arr[i], val": "-100 <= val, arr[i] <= 100" },
        difficulty: "easy",
        tags: ["Array"],
        generator: () => `${Array.from({ length: randomInt(10, 50) }, () => randomInt(1, 10)).join(' ')}\n${randomInt(1, 10)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_remove_all_occurrences(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "find_first_occurrence_binary",
        title: "Find First Occurrence (Binary Search)",
        description: "Given a sorted array of integers containing duplicates, find the 0-indexed position of the first occurrence of a target element. If the target is not present, return -1.",
        input_format: "First line: space-separated sorted array elements. Second line: target value.",
        output_format: "First index of target or -1.",
        constraints: { "arr.length": "1 <= length <= 10^5", "arr[i], target": "-10^9 <= val <= 10^9" },
        difficulty: "easy",
        tags: ["Array", "Binary Search"],
        generator: () => `${Array.from({ length: randomInt(20, 100) }, () => randomInt(1, 50)).sort((a, b) => a - b).join(' ')}\n${randomInt(1, 60)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_find_first_occurrence_binary(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "k_largest_elements",
        title: "K Largest Elements",
        description: "Given an array of integers and an integer k, return the k largest elements sorted in descending order.",
        input_format: "First line: space-separated array elements. Second line: integer k.",
        output_format: "Space-separated k largest elements.",
        constraints: { "arr.length": "1 <= length <= 10^4", "k": "1 <= k <= arr.length" },
        difficulty: "medium",
        tags: ["Array", "Sorting"],
        generator: () => `${Array.from({ length: 50 }, () => randomInt(-100, 100)).join(' ')}\n${randomInt(1, 15)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_k_largest_elements(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "min_cost_climbing_stairs",
        title: "Min Cost Climbing Stairs",
        description: "Given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. Find the minimum cost to reach the top.",
        input_format: "Space-separated cost values.",
        output_format: "Minimum cost.",
        constraints: { "cost.length": "2 <= length <= 1000", "cost[i]": "0 <= cost[i] <= 999" },
        difficulty: "easy",
        tags: ["Dynamic Programming", "Array"],
        generator: () => Array.from({ length: randomInt(10, 50) }, () => randomInt(10, 500)).join(' '),
        solver: (x) => solve_min_cost_climbing_stairs(x.split(' ').map(Number))
    },
    {
        id: "count_substrings_with_k_distinct",
        title: "Count Substrings with K Distinct Characters",
        description: "Given a string of lowercase alphabets, count the number of substrings containing exactly k distinct characters.",
        input_format: "First line: a string s. Second line: integer k.",
        output_format: "Number of substrings.",
        constraints: { "s.length": "1 <= length <= 10^4", "k": "1 <= k <= 26" },
        difficulty: "medium",
        tags: ["Sliding Window", "String"],
        generator: () => `${Array.from({ length: randomInt(30, 80) }, () => randomChoice('abcdefg'.split(''))).join('')}\n${randomInt(2, 4)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_count_substrings_with_k_distinct(lines[0], parseInt(lines[1]));
        }
    },
    {
        id: "longest_common_substring",
        title: "Longest Common Substring",
        description: "Given two strings s1 and s2, find the length of the longest common substring between them.",
        input_format: "First line: string s1. Second line: string s2.",
        output_format: "Length of longest common substring.",
        constraints: { "s1.length, s2.length": "1 <= length <= 1000" },
        difficulty: "medium",
        tags: ["Dynamic Programming", "String"],
        generator: () => `${Array.from({ length: randomInt(20, 50) }, () => randomChoice('abcde'.split(''))).join('')}\n${Array.from({ length: randomInt(20, 50) }, () => randomChoice('abcde'.split(''))).join('')}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_longest_common_substring(lines[0], lines[1]);
        }
    },
    {
        id: "matrix_boundary_traversal",
        title: "Matrix Boundary Traversal",
        description: "Given a matrix, return all boundary elements in clockwise order starting from top-left.",
        input_format: "First line: m and n (dimensions). Following m lines: space-separated row values.",
        output_format: "Space-separated boundary elements.",
        constraints: { "m, n": "1 <= m, n <= 100" },
        difficulty: "easy",
        tags: ["Matrix"],
        generator: () => {
            let r = randomInt(2, 8), c = randomInt(2, 8);
            let lines = [`${r} ${c}`];
            for (let i = 0; i < r; i++) {
                lines.push(Array.from({ length: c }, () => randomInt(1, 99)).join(' '));
            }
            return lines.join('\n');
        },
        solver: (x) => {
            let lines = x.trim().split('\n');
            let matrix = lines.slice(1).map(l => l.split(' ').map(Number));
            return solve_matrix_boundary_traversal(matrix);
        }
    },
    {
        id: "check_sparse_matrix",
        title: "Check Sparse Matrix",
        description: "Given a matrix, determine if it is a sparse matrix. A matrix is sparse if the number of zero elements is strictly greater than half of total elements.",
        input_format: "First line: m and n. Following m lines: space-separated row values.",
        output_format: "'true' or 'false'.",
        constraints: { "m, n": "1 <= m, n <= 100" },
        difficulty: "easy",
        tags: ["Matrix"],
        generator: () => {
            let r = randomInt(3, 8), c = randomInt(3, 8);
            let lines = [`${r} ${c}`];
            for (let i = 0; i < r; i++) {
                lines.push(Array.from({ length: c }, () => randomChoice([0, 0, 0, randomInt(1, 9)])).join(' '));
            }
            return lines.join('\n');
        },
        solver: (x) => {
            let lines = x.trim().split('\n');
            let matrix = lines.slice(1).map(l => l.split(' ').map(Number));
            return solve_check_sparse_matrix(matrix);
        }
    },
    {
        id: "valid_ip_address",
        title: "Valid IP Address",
        description: "Given a string queryIP, return 'IPv4' if it is a valid IPv4 address, 'IPv6' if it is a valid IPv6 address, or 'Neither' if it is not valid.",
        input_format: "A single string queryIP.",
        output_format: "'IPv4', 'IPv6', or 'Neither'.",
        constraints: { "queryIP": "1 <= queryIP.length <= 50" },
        difficulty: "medium",
        tags: ["String"],
        generator: () => randomChoice([
            "172.16.254.1", "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            "256.256.256.256", "2001:db8:85a3:0:0:8A2E:0370:7334",
            "192.168.1.01", "2001:0db8:85a3::8A2E:0370:7334"
        ]),
        solver: (x) => solve_valid_ip_address(x)
    },
    {
        id: "compress_string",
        title: "Compress String",
        description: "Implement a method to perform basic string compression using the counts of repeated characters. For example, aabcccccaaa would become a2b1c5a3.",
        input_format: "A single string containing alphabetical characters.",
        output_format: "The compressed string.",
        constraints: { "s.length": "1 <= length <= 1000" },
        difficulty: "easy",
        tags: ["String"],
        generator: () => {
            let parts = Array.from({ length: randomInt(5, 15) }, () => randomChoice('abcdefg'.split('')));
            return parts.map(c => c.repeat(randomInt(1, 5))).join('');
        },
        solver: (x) => solve_compress_string(x)
    },
    {
        id: "longest_subarray_with_sum_k",
        title: "Longest Subarray with Sum K",
        description: "Given an array of integers and an integer k, find the maximum length of a subarray whose sum is equal to k. If none, return 0.",
        input_format: "First line: space-separated array elements. Second line: integer k.",
        output_format: "Length of longest subarray.",
        constraints: { "arr.length": "1 <= length <= 10^5", "arr[i]": "-10^4 <= arr[i] <= 10^4", "k": "-10^9 <= k <= 10^9" },
        difficulty: "medium",
        tags: ["Array", "Hash Table"],
        generator: () => `${Array.from({ length: 50 }, () => randomInt(-10, 10)).join(' ')}\n${randomInt(-20, 20)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_longest_subarray_with_sum_k(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "subarray_with_given_sum",
        title: "Subarray with Given Sum",
        description: "Given an unsorted array of non-negative integers and an integer k, find a continuous subarray which adds to k. Return 1-based start and end indices of the first such subarray found. If none, return -1.",
        input_format: "First line: space-separated array elements. Second line: target sum k.",
        output_format: "Start and end indices separated by space, or -1.",
        constraints: { "arr.length": "1 <= length <= 10^5", "arr[i], k": "0 <= arr[i], k <= 10^9" },
        difficulty: "medium",
        tags: ["Array", "Two Pointers"],
        generator: () => `${Array.from({ length: 40 }, () => randomInt(1, 20)).join(' ')}\n${randomInt(10, 100)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_subarray_with_given_sum(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "count_subarrays_with_given_xor",
        title: "Count Subarrays with Given XOR",
        description: "Given an array of integers and an integer k, count the total number of subarrays having XOR sum equal to k.",
        input_format: "First line: space-separated array elements. Second line: target XOR value k.",
        output_format: "Number of subarrays.",
        constraints: { "arr.length": "1 <= length <= 10^4", "arr[i], k": "0 <= arr[i], k <= 10^5" },
        difficulty: "medium",
        tags: ["Array", "Hash Table"],
        generator: () => `${Array.from({ length: 30 }, () => randomInt(1, 15)).join(' ')}\n${randomInt(1, 15)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_count_subarrays_with_given_xor(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "maximum_sum_circular_subarray",
        title: "Maximum Sum Circular Subarray",
        description: "Given a circular integer array of size n, return the maximum possible sum of a non-empty subarray.",
        input_format: "Space-separated array elements.",
        output_format: "Maximum circular subarray sum.",
        constraints: { "arr.length": "1 <= length <= 3 * 10^4", "arr[i]": "-3 * 10^4 <= arr[i] <= 3 * 10^4" },
        difficulty: "medium",
        tags: ["Array", "Dynamic Programming"],
        generator: () => Array.from({ length: 30 }, () => randomInt(-50, 50)).join(' '),
        solver: (x) => solve_maximum_sum_circular_subarray(x.split(' ').map(Number))
    },
    {
        id: "leaders_in_array",
        title: "Leaders in Array",
        description: "Write a program to print all the leaders in the array. An element is leader if it is greater than or equal to all the elements to its right side. The rightmost element is always a leader.",
        input_format: "Space-separated array elements.",
        output_format: "Space-separated leaders in order of appearance.",
        constraints: { "arr.length": "1 <= length <= 10^5", "arr[i]": "-10^6 <= arr[i] <= 10^6" },
        difficulty: "easy",
        tags: ["Array"],
        generator: () => Array.from({ length: 30 }, () => randomInt(-100, 100)).join(' '),
        solver: (x) => solve_leaders_in_array(x.split(' ').map(Number))
    },
    {
        id: "equilibrium_point",
        title: "Equilibrium Point",
        description: "Given an array of integers, find the first 1-based index equilibrium point. An equilibrium point is a position such that the sum of elements before it is equal to the sum of elements after it. If none exists, return -1.",
        input_format: "Space-separated array elements.",
        output_format: "1-based index or -1.",
        constraints: { "arr.length": "1 <= length <= 10^5", "arr[i]": "-10^5 <= arr[i] <= 10^5" },
        difficulty: "easy",
        tags: ["Array"],
        generator: () => Array.from({ length: 15 }, () => randomInt(-10, 10)).join(' '),
        solver: (x) => solve_equilibrium_point(x.split(' ').map(Number))
    },
    {
        id: "wave_array",
        title: "Wave Array",
        description: "Given a sorted array of integers, sort the array into a wave-like array in-place (arr[0] >= arr[1] <= arr[2] >= arr[3]...). If there are multiple solutions, return the lexicographically smallest one.",
        input_format: "Space-separated sorted array elements.",
        output_format: "Space-separated wave array.",
        constraints: { "arr.length": "1 <= length <= 10^6", "arr[i]": "0 <= arr[i] <= 10^7" },
        difficulty: "easy",
        tags: ["Array", "Sorting"],
        generator: () => Array.from({ length: 20 }, () => randomInt(1, 100)).sort((a, b) => a - b).join(' '),
        solver: (x) => solve_wave_array(x.split(' ').map(Number))
    },
    {
        id: "triplet_sum_in_array",
        title: "Triplet Sum in Array",
        description: "Given an array of integers and a target sum, check if there exists a triplet in the array that sums up to the target.",
        input_format: "First line: space-separated array elements. Second line: target sum k.",
        output_format: "'true' or 'false'.",
        constraints: { "arr.length": "3 <= length <= 10^3", "arr[i], k": "-10^6 <= val <= 10^6" },
        difficulty: "medium",
        tags: ["Array", "Two Pointers"],
        generator: () => `${Array.from({ length: 30 }, () => randomInt(-50, 50)).join(' ')}\n${randomInt(-100, 100)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_triplet_sum_in_array(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "subarray_with_zero_sum",
        title: "Subarray with Zero Sum",
        description: "Given an array of integers, check if there is a subarray with sum 0.",
        input_format: "Space-separated array elements.",
        output_format: "'true' or 'false'.",
        constraints: { "arr.length": "1 <= length <= 10^4", "arr[i]": "-10^5 <= arr[i] <= 10^5" },
        difficulty: "easy",
        tags: ["Array", "Hash Table"],
        generator: () => Array.from({ length: 15 }, () => randomInt(-10, 10)).join(' '),
        solver: (x) => solve_subarray_with_zero_sum(x.split(' ').map(Number))
    },
    {
        id: "kth_smallest_prime_fraction",
        title: "Kth Smallest Prime Fraction",
        description: "You are given a sorted list of primes. For every pair of primes i and j, the fraction is prime[i]/prime[j]. Return the Kth smallest fraction in the format numerator/denominator.",
        input_format: "First line: space-separated primes. Second line: integer k.",
        output_format: "Fraction representation numerator/denominator.",
        constraints: { "arr.length": "2 <= length <= 1000", "k": "1 <= k <= length*(length-1)/2" },
        difficulty: "medium",
        tags: ["Binary Search", "Sorting"],
        generator: () => `2 3 5 7 11 13 17 19 23 29\n${randomInt(1, 40)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_kth_smallest_prime_fraction(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "sort_array_by_frequency",
        title: "Sort Array by Frequency",
        description: "Given an array of integers, sort the array according to the frequency of elements. If the frequencies are same, sort by the element values in ascending order.",
        input_format: "Space-separated array elements.",
        output_format: "Space-separated sorted array elements.",
        constraints: { "arr.length": "1 <= length <= 10^4", "arr[i]": "-10^5 <= arr[i] <= 10^5" },
        difficulty: "medium",
        tags: ["Sorting", "Hash Table"],
        generator: () => Array.from({ length: 40 }, () => randomInt(1, 15)).join(' '),
        solver: (x) => solve_sort_array_by_frequency(x.split(' ').map(Number))
    },
    {
        id: "minimum_platforms",
        title: "Minimum Platforms",
        description: "Given arrival and departure times of all trains that reach a railway station, find the minimum number of platforms required for the railway station so that no train is kept waiting.",
        input_format: "First line: space-separated arrival times (4-digit format). Second line: space-separated departure times.",
        output_format: "Minimum platforms count.",
        constraints: { "arr.length, dep.length": "1 <= length <= 5 * 10^4" },
        difficulty: "medium",
        tags: ["Greedy", "Sorting"],
        generator: () => {
            let pairs = [];
            for (let i = 0; i < 10; i++) {
                let arrTime = randomInt(900, 2200);
                pairs.push({ arr: arrTime, dep: arrTime + randomInt(5, 120) });
            }
            pairs.sort((a, b) => a.arr - b.arr);
            return `${pairs.map(p => p.arr).join(' ')}\n${pairs.map(p => p.dep).join(' ')}`;
        },
        solver: (x) => {
            let lines = x.split('\n');
            return solve_minimum_platforms(lines[0].split(' ').map(Number), lines[1].split(' ').map(Number));
        }
    },
    {
        id: "fractional_knapsack",
        title: "Fractional Knapsack",
        description: "Given weights and values of N items, we need to put these items in a knapsack of capacity W to get the maximum total value in the knapsack. You can break items for maximizing the total value.",
        input_format: "First line: values of items separated by space. Second line: weights of items. Third line: capacity w.",
        output_format: "Max total value (rounded to 2 decimal places).",
        constraints: { "N": "1 <= N <= 1000", "w": "1 <= w <= 10^5" },
        difficulty: "medium",
        tags: ["Greedy", "Sorting"],
        generator: () => `${Array.from({ length: 8 }, () => randomInt(50, 200)).join(' ')}\n${Array.from({ length: 8 }, () => randomInt(5, 50)).join(' ')}\n${randomInt(30, 150)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_fractional_knapsack(lines[0].split(' ').map(Number), lines[1].split(' ').map(Number), parseInt(lines[2]));
        }
    },
    {
        id: "job_sequencing_problem",
        title: "Job Sequencing Problem",
        description: "Given a set of jobs where each job has a deadline and profit, find the maximum profit that can be earned by scheduling jobs within deadlines. Each job takes 1 unit of time.",
        input_format: "First line: deadlines of jobs. Second line: profits of jobs.",
        output_format: "Space-separated count of jobs scheduled and maximum profit.",
        constraints: { "N": "1 <= N <= 10^5", "deadlines[i]": "1 <= val <= 100" },
        difficulty: "medium",
        tags: ["Greedy", "Sorting"],
        generator: () => `${Array.from({ length: 12 }, () => randomInt(1, 8)).join(' ')}\n${Array.from({ length: 12 }, () => randomInt(10, 100)).join(' ')}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_job_sequencing_problem(lines[0].split(' ').map(Number), lines[1].split(' ').map(Number));
        }
    },
    {
        id: "n_meetings_in_one_room",
        title: "N Meetings In One Room",
        description: "There is one meeting room in a firm. There are N meetings in the form of (start[i], end[i]). What is the maximum number of meetings that can be accommodated in the meeting room?",
        input_format: "First line: start times of N meetings. Second line: end times.",
        output_format: "Max count of meetings.",
        constraints: { "N": "1 <= N <= 10^5" },
        difficulty: "easy",
        tags: ["Greedy", "Sorting"],
        generator: () => {
            let pairs = [];
            for (let i = 0; i < 12; i++) {
                let start = randomInt(1, 30);
                pairs.push({ start, end: start + randomInt(1, 10) });
            }
            pairs.sort((a, b) => a.start - b.start);
            return `${pairs.map(p => p.start).join(' ')}\n${pairs.map(p => p.end).join(' ')}`;
        },
        solver: (x) => {
            let lines = x.split('\n');
            return solve_n_meetings_in_one_room(lines[0].split(' ').map(Number), lines[1].split(' ').map(Number));
        }
    },
    {
        id: "combination_sum_iii",
        title: "Combination Sum III",
        description: "Find all valid combinations of k numbers that sum up to n such that only numbers from 1 to 9 are used and each combination is a unique set of numbers. Combinations are comma-separated and values space-separated.",
        input_format: "First line: integer k. Second line: integer n.",
        output_format: "Comma-separated combinations, sorted. If none, return -1.",
        constraints: { "k": "2 <= k <= 9", "n": "1 <= n <= 60" },
        difficulty: "medium",
        tags: ["Backtracking"],
        generator: () => `${randomInt(2, 5)}\n${randomInt(10, 30)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_combination_sum_iii(parseInt(lines[0]), parseInt(lines[1]));
        }
    },
    {
        id: "generate_all_subsequences",
        title: "Generate All Subsequences",
        description: "Given a string of unique characters, generate all non-empty subsequences and return them separated by space in lexicographically sorted order.",
        input_format: "A single string containing unique characters.",
        output_format: "Space-separated subsequences.",
        constraints: { "s.length": "1 <= length <= 12" },
        difficulty: "medium",
        tags: ["Backtracking"],
        generator: () => randomSample("abcdefgh".split(''), randomInt(4, 7)).join(''),
        solver: (x) => solve_generate_all_subsequences(x)
    },
    {
        id: "word_boggle",
        title: "Word Boggle",
        description: "Given a dictionary of unique words and an M x N board, find all words in the dictionary that can be formed by sequential adjacent characters on the board.",
        input_format: "First line: dictionary words separated by space. Second line: board dimensions r and c. Following r lines: space-separated board characters.",
        output_format: "Space-separated words found, sorted lexicographically, or -1.",
        constraints: { "dictionary.length": "1 <= len <= 10", "r, c": "1 <= r, c <= 5" },
        difficulty: "hard",
        tags: ["DFS", "Backtracking", "Matrix"],
        generator: () => "CAT DOG BIRD FISH\n3 3\nC A T\nD O G\nB I R",
        solver: (x) => {
            let lines = x.trim().split('\n');
            let dictionary = lines[0].split(' ');
            let board = lines.slice(2).map(l => l.split(' '));
            return solve_word_boggle(dictionary, board);
        }
    },
    {
        id: "longest_happy_prefix",
        title: "Longest Happy Prefix",
        description: "A string is called a happy prefix if is a non-empty prefix which is also a suffix (excluding itself). Find the longest happy prefix. If none exists, return -1.",
        input_format: "A single string s.",
        output_format: "The happy prefix string or -1.",
        constraints: { "s.length": "1 <= length <= 10^5" },
        difficulty: "hard",
        tags: ["String"],
        generator: () => randomChoice(["ababab", "aaaaa", "abcde", "level", "acbacacbac"]),
        solver: (x) => solve_longest_happy_prefix(x)
    },
    {
        id: "count_of_inversions",
        title: "Count of Inversions",
        description: "Given an array of integers, find the count of inversions in the array. Two elements arr[i] and arr[j] form an inversion if arr[i] > arr[j] and i < j.",
        input_format: "Space-separated array elements.",
        output_format: "Inversion count.",
        constraints: { "arr.length": "1 <= length <= 10^5" },
        difficulty: "medium",
        tags: ["Divide and Conquer", "Sorting"],
        generator: () => Array.from({ length: 20 }, () => randomInt(1, 50)).join(' '),
        solver: (x) => solve_count_of_inversions(x.split(' ').map(Number))
    },
    {
        id: "merge_without_extra_space",
        title: "Merge Without Extra Space",
        description: "Merge two sorted arrays into one sorted array in-place, without using any extra memory space.",
        input_format: "First line: space-separated elements of first sorted array. Second line: elements of second sorted array.",
        output_format: "Space-separated combined sorted elements.",
        constraints: { "arr1.length, arr2.length": "1 <= length <= 10^4" },
        difficulty: "medium",
        tags: ["Array", "Sorting"],
        generator: () => `${Array.from({ length: 10 }, () => randomInt(1, 50)).sort((a, b) => a - b).join(' ')}\n${Array.from({ length: 10 }, () => randomInt(1, 50)).sort((a, b) => a - b).join(' ')}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_merge_without_extra_space(lines[0].split(' ').map(Number), lines[1].split(' ').map(Number));
        }
    },
    {
        id: "minimum_swaps_to_sort",
        title: "Minimum Swaps to Sort",
        description: "Given an array of N distinct elements, find the minimum number of swaps required to sort the array.",
        input_format: "Space-separated array elements of distinct values.",
        output_format: "Minimum swaps count.",
        constraints: { "arr.length": "1 <= length <= 10^5" },
        difficulty: "medium",
        tags: ["Sorting", "Array"],
        generator: () => randomSample(Array.from({ length: 99 }, (_, i) => i + 1), 20).join(' '),
        solver: (x) => solve_minimum_swaps_to_sort(x.split(' ').map(Number))
    },
    {
        id: "allocate_minimum_pages",
        title: "Allocate Minimum Pages",
        description: "Allocate books to m students such that the maximum number of pages allocated to a student is minimized. Return the minimized maximum pages. If allocation not possible, return -1.",
        input_format: "First line: space-separated integers representing pages of books. Second line: number of students m.",
        output_format: "Minimized max pages or -1.",
        constraints: { "arr.length": "1 <= length <= 10^5", "m": "1 <= m <= 10^5" },
        difficulty: "hard",
        tags: ["Binary Search", "Array"],
        generator: () => `${Array.from({ length: 10 }, () => randomInt(10, 100)).join(' ')}\n${randomInt(2, 5)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_allocate_minimum_pages(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    },
    {
        id: "kth_element_of_two_sorted_arrays",
        title: "Kth Element of Two Sorted Arrays",
        description: "Given two sorted arrays of size m and n, find the element that would be at the kth position of the combined sorted array.",
        input_format: "First line: space-separated elements of first sorted array. Second line: elements of second sorted array. Third line: target index k.",
        output_format: "Kth element value.",
        constraints: { "arr1.length, arr2.length": "1 <= length <= 10^5", "k": "1 <= k <= length1 + length2" },
        difficulty: "medium",
        tags: ["Binary Search", "Sorting"],
        generator: () => `${Array.from({ length: 10 }, () => randomInt(1, 50)).sort((a, b) => a - b).join(' ')}\n${Array.from({ length: 10 }, () => randomInt(1, 50)).sort((a, b) => a - b).join(' ')}\n${randomInt(1, 20)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_kth_element_of_two_sorted_arrays(lines[0].split(' ').map(Number), lines[1].split(' ').map(Number), parseInt(lines[2]));
        }
    },
    {
        id: "painters_partition_problem",
        title: "Painter's Partition Problem",
        description: "Dilpreet wants to paint his dog's home that has n boards. He wants to minimize the maximum time taken by a painter to paint all boards, given k painters are available. Assume 1 board takes 1 unit of time.",
        input_format: "First line: space-separated board lengths. Second line: number of painters k.",
        output_format: "Minimum time.",
        constraints: { "boards.length": "1 <= length <= 10^5", "k": "1 <= k <= 10^5" },
        difficulty: "medium",
        tags: ["Binary Search", "Array"],
        generator: () => `${Array.from({ length: 10 }, () => randomInt(10, 80)).join(' ')}\n${randomInt(2, 4)}`,
        solver: (x) => {
            let lines = x.split('\n');
            return solve_painters_partition_problem(lines[0].split(' ').map(Number), parseInt(lines[1]));
        }
    }
];

// ----------------- TESTCASE GENERATOR ENGINE -----------------

for (let pdef of problemsDefs) {
    console.log(`Generating problem: ${pdef.title}...`);
    
    // Generate Sample Test Cases (2-3 cases)
    let samples = [];
    for (let s = 0; s < 3; s++) {
        let attempts = 0;
        while (attempts < 15) {
            try {
                let inp = pdef.generator();
                let out = String(pdef.solver(inp));
                if (!samples.some(item => item.input === inp)) {
                    samples.push({ input: inp, output: out });
                    break;
                }
            } catch (e) {
                // Ignore errors during generation
            }
            attempts++;
        }
    }
            
    // Generate Hidden Test Cases (15-20 cases)
    let hiddens = [];
    for (let h = 0; h < 20; h++) {
        let attempts = 0;
        while (attempts < 20) {
            try {
                let inp = pdef.generator();
                let out = String(pdef.solver(inp));
                if (!hiddens.some(item => item.input === inp) && !samples.some(item => item.input === inp)) {
                    hiddens.push({ input: inp, output: out });
                    break;
                }
            } catch (e) {
                // Ignore
            }
            attempts++;
        }
    }

    let problemJson = {
        id: pdef.id,
        title: pdef.title,
        description: pdef.description,
        input_format: pdef.input_format,
        output_format: pdef.output_format,
        constraints: pdef.constraints,
        difficulty: pdef.difficulty,
        judge_mode: "str_compare_strip",
        time_limit: 1,
        sample_test_cases: samples,
        hidden_test_cases: hiddens,
        tags: pdef.tags
    };
    
    let filepath = path.join(PROBLEMS_DIR, `${pdef.id}.json`);
    fs.writeFileSync(filepath, JSON.stringify(problemJson, null, 4), 'utf8');
}

console.log("Finished generating 40 problems!");

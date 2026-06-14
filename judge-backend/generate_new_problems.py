import os
import json
import random

PROBLEMS_DIR = "problems"
os.makedirs(PROBLEMS_DIR, exist_ok=True)

# ----------------- SOLVER FUNCTIONS AND INPUT GENERATORS -----------------

# 1. sum_of_squares
# Input: A single integer n.
# Output: A single integer representing the sum of squares of first n natural numbers.
def solve_sum_of_squares(n):
    return n * (n + 1) * (2 * n + 1) // 6

# 2. is_power_of_five
# Input: A single integer n.
# Output: "true" if n is a power of 5, otherwise "false".
def solve_is_power_of_five(n):
    if n <= 0: return "false"
    while n % 5 == 0:
        n //= 5
    return "true" if n == 1 else "false"

# 3. harshad_number_check
# Input: A single integer n.
# Output: "true" if n is a Harshad number (divisible by the sum of its digits), else "false".
def solve_harshad_number_check(n):
    if n <= 0: return "false"
    s = sum(int(c) for c in str(n))
    return "true" if n % s == 0 else "false"

# 4. armstrong_numbers_in_range
# Input: Two space-separated integers low and high.
# Output: Space-separated Armstrong numbers in range [low, high] inclusive. If none, print -1.
def solve_armstrong_numbers_in_range(low, high):
    res = []
    for num in range(low, high + 1):
        s = str(num)
        k = len(s)
        if sum(int(c)**k for c in s) == num:
            res.append(str(num))
    return " ".join(res) if res else "-1"

# 5. frequency_of_each_element
# Input: Space-separated integers.
# Output: Each unique element and its frequency in the format "element:frequency" separated by space, sorted by element.
def solve_frequency_of_each_element(arr):
    freq = {}
    for x in arr:
        freq[x] = freq.get(x, 0) + 1
    sorted_keys = sorted(freq.keys())
    return " ".join(f"{k}:{freq[k]}" for k in sorted_keys)

# 6. remove_all_occurrences
# Input: First line: space-separated array elements. Second line: the target integer to remove.
# Output: Space-separated array elements after removing all target elements. If empty, print -1.
def solve_remove_all_occurrences(arr, val):
    res = [x for x in arr if x != val]
    return " ".join(map(str, res)) if res else "-1"

# 7. find_first_occurrence_binary
# Input: First line: space-separated sorted array elements. Second line: target element.
# Output: 0-indexed position of the first occurrence of the target. If not found, print -1.
def solve_find_first_occurrence_binary(arr, target):
    low, high = 0, len(arr) - 1
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            ans = mid
            high = mid - 1
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return ans

# 8. k_largest_elements
# Input: First line: space-separated array elements. Second line: target integer k.
# Output: Space-separated k largest elements sorted in descending order.
def solve_k_largest_elements(arr, k):
    res = sorted(arr, reverse=True)[:k]
    return " ".join(map(str, res))

# 9. min_cost_climbing_stairs
# Input: Space-separated cost array.
# Output: Minimum cost to reach the top.
def solve_min_cost_climbing_stairs(cost):
    n = len(cost)
    if n == 0: return 0
    if n == 1: return cost[0]
    dp = [0] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])
    return dp[n]

# 10. count_substrings_with_k_distinct
# Input: First line: string s. Second line: integer k.
# Output: Number of substrings containing exactly k distinct characters.
def solve_count_substrings_with_k_distinct(s, k):
    def at_most_k(s, k):
        if k < 0: return 0
        count = 0
        left = 0
        char_map = {}
        for right in range(len(s)):
            char_map[s[right]] = char_map.get(s[right], 0) + 1
            while len(char_map) > k:
                char_map[s[left]] -= 1
                if char_map[s[left]] == 0:
                    del char_map[s[left]]
                left += 1
            count += right - left + 1
        return count
    return at_most_k(s, k) - at_most_k(s, k - 1)

# 11. longest_common_substring
# Input: First line: string s1. Second line: string s2.
# Output: Length of the longest common substring.
def solve_longest_common_substring(s1, s2):
    n, m = len(s1), len(s2)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    ans = 0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
                ans = max(ans, dp[i][j])
            else:
                dp[i][j] = 0
    return ans

# 12. matrix_boundary_traversal
# Input: First line: m and n (dimensions). Following m lines: space-separated values.
# Output: Space-separated values along the boundary in clockwise order.
def solve_matrix_boundary_traversal(matrix):
    if not matrix or not matrix[0]: return ""
    m, n = len(matrix), len(matrix[0])
    res = []
    if m == 1:
        res.extend(matrix[0])
    elif n == 1:
        for r in range(m):
            res.append(matrix[r][0])
    else:
        for c in range(n):
            res.append(matrix[0][c])
        for r in range(1, m - 1):
            res.append(matrix[r][n-1])
        for c in range(n - 1, -1, -1):
            res.append(matrix[m-1][c])
        for r in range(m - 2, 0, -1):
            res.append(matrix[r][0])
    return " ".join(map(str, res))

# 13. check_sparse_matrix
# Input: First line: m and n. Following m lines: space-separated values.
# Output: "true" if number of zeros is greater than half of total elements, else "false".
def solve_check_sparse_matrix(matrix):
    m = len(matrix)
    n = len(matrix[0])
    zeros = sum(row.count(0) for row in matrix)
    return "true" if zeros > (m * n) / 2 else "false"

# 14. valid_ip_address
# Input: A single string queryIP.
# Output: "IPv4", "IPv6", or "Neither".
def solve_valid_ip_address(queryIP):
    def is_ipv4(ip):
        parts = ip.split('.')
        if len(parts) != 4: return False
        for part in parts:
            if not part.isdigit(): return False
            val = int(part)
            if val < 0 or val > 255: return False
            if len(part) > 1 and part[0] == '0': return False
        return True

    def is_ipv6(ip):
        parts = ip.split(':')
        if len(parts) != 8: return False
        hex_digits = "0123456789abcdefABCDEF"
        for part in parts:
            if len(part) < 1 or len(part) > 4: return False
            for char in part:
                if char not in hex_digits: return False
        return True

    if is_ipv4(queryIP): return "IPv4"
    if is_ipv6(queryIP): return "IPv6"
    return "Neither"

# 15. compress_string
# Input: A single string.
# Output: Compressed string using counts (e.g. aabcccccaaa -> a2b1c5a3).
def solve_compress_string(s):
    if not s: return ""
    res = []
    i = 0
    while i < len(s):
        char = s[i]
        count = 0
        while i < len(s) and s[i] == char:
            count += 1
            i += 1
        res.append(f"{char}{count}")
    return "".join(res)

# 16. longest_subarray_with_sum_k
# Input: First line: space-separated array elements. Second line: target sum k.
# Output: Maximum length of a subarray whose sum is equal to k. If none, print 0.
def solve_longest_subarray_with_sum_k(arr, k):
    prefix_sum_map = {}
    curr_sum = 0
    max_len = 0
    for i in range(len(arr)):
        curr_sum += arr[i]
        if curr_sum == k:
            max_len = i + 1
        if curr_sum - k in prefix_sum_map:
            max_len = max(max_len, i - prefix_sum_map[curr_sum - k])
        if curr_sum not in prefix_sum_map:
            prefix_sum_map[curr_sum] = i
    return max_len

# 17. subarray_with_given_sum
# Input: First line: space-separated array elements (positive integers). Second line: target sum k.
# Output: 1-based start and end indices of the first subarray found with sum k, separated by space. If none, print -1.
def solve_subarray_with_given_sum(arr, k):
    left = 0
    curr_sum = 0
    for right in range(len(arr)):
        curr_sum += arr[right]
        while curr_sum > k and left < right:
            curr_sum -= arr[left]
            left += 1
        if curr_sum == k:
            return f"{left + 1} {right + 1}"
    return "-1"

# 18. count_subarrays_with_given_xor
# Input: First line: space-separated integers. Second line: target XOR value k.
# Output: Number of subarrays with XOR equal to k.
def solve_count_subarrays_with_given_xor(arr, k):
    xor_map = {0: 1}
    curr_xor = 0
    count = 0
    for x in arr:
        curr_xor ^= x
        if curr_xor ^ k in xor_map:
            count += xor_map[curr_xor ^ k]
        xor_map[curr_xor] = xor_map.get(curr_xor, 0) + 1
    return count

# 19. maximum_sum_circular_subarray
# Input: Space-separated array elements.
# Output: Maximum sum of a non-empty circular subarray.
def solve_maximum_sum_circular_subarray(arr):
    # Kadane's algorithm for max
    total_sum = sum(arr)
    curr_max = max_sum = arr[0]
    curr_min = min_sum = arr[0]
    for x in arr[1:]:
        curr_max = max(x, curr_max + x)
        max_sum = max(max_sum, curr_max)
        curr_min = min(x, curr_min + x)
        min_sum = min(min_sum, curr_min)
    if max_sum < 0:
        return max_sum
    return max(max_sum, total_sum - min_sum)

# 20. leaders_in_array
# Input: Space-separated array elements.
# Output: Leaders in the array from left to right (elements greater than or equal to all elements to their right).
def solve_leaders_in_array(arr):
    if not arr: return ""
    leaders = []
    max_right = arr[-1]
    leaders.append(max_right)
    for i in range(len(arr) - 2, -1, -1):
        if arr[i] >= max_right:
            leaders.append(arr[i])
            max_right = arr[i]
    leaders.reverse()
    return " ".join(map(str, leaders))

# 21. equilibrium_point
# Input: Space-separated array elements.
# Output: 1-based index of the first equilibrium point (sum of elements before it equals sum of elements after). If none, print -1.
def solve_equilibrium_point(arr):
    total = sum(arr)
    left_sum = 0
    for i in range(len(arr)):
        total -= arr[i]
        if left_sum == total:
            return i + 1
        left_sum += arr[i]
    return -1

# 22. wave_array
# Input: Space-separated sorted array elements.
# Output: Wave-sorted array in-place (arr[0] >= arr[1] <= arr[2] >= arr[3]...), lexicographically smallest (swap adjacents).
def solve_wave_array(arr):
    n = len(arr)
    res = list(arr)
    for i in range(0, n - 1, 2):
        res[i], res[i+1] = res[i+1], res[i]
    return " ".join(map(str, res))

# 23. triplet_sum_in_array
# Input: First line: space-separated integers. Second line: target sum k.
# Output: "true" if there exists a triplet with sum k, else "false".
def solve_triplet_sum_in_array(arr, k):
    arr = sorted(arr)
    n = len(arr)
    for i in range(n - 2):
        left, right = i + 1, n - 1
        while left < right:
            s = arr[i] + arr[left] + arr[right]
            if s == k:
                return "true"
            elif s < k:
                left += 1
            else:
                right -= 1
    return "false"

# 24. subarray_with_zero_sum
# Input: Space-separated array elements.
# Output: "true" if there is a subarray with sum 0, else "false".
def solve_subarray_with_zero_sum(arr):
    s = set()
    curr_sum = 0
    for x in arr:
        curr_sum += x
        if curr_sum == 0 or curr_sum in s:
            return "true"
        s.add(curr_sum)
    return "false"

# 25. kth_smallest_prime_fraction
# Input: First line: space-separated sorted list of primes. Second line: integer k.
# Output: Kth smallest fraction in the format "numerator/denominator".
def solve_kth_smallest_prime_fraction(arr, k):
    fractions = []
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):
            fractions.append((arr[i] / arr[j], arr[i], arr[j]))
    fractions.sort()
    _, num, den = fractions[k - 1]
    return f"{num}/{den}"

# 26. sort_array_by_frequency
# Input: Space-separated array elements.
# Output: Array sorted by frequency in descending order; if frequencies are same, by element value in ascending order.
def solve_sort_array_by_frequency(arr):
    freq = {}
    for x in arr:
        freq[x] = freq.get(x, 0) + 1
    sorted_arr = sorted(arr, key=lambda x: (-freq[x], x))
    return " ".join(map(str, sorted_arr))

# 27. minimum_platforms
# Input: First line: space-separated arrival times (as 4-digit integers). Second line: space-separated departure times.
# Output: Minimum number of platforms required for the railway station.
def solve_minimum_platforms(arr, dep):
    arr = sorted(arr)
    dep = sorted(dep)
    n = len(arr)
    plat_needed = 1
    result = 1
    i = 1
    j = 0
    while i < n and j < n:
        if arr[i] <= dep[j]:
            plat_needed += 1
            i += 1
        else:
            plat_needed -= 1
            j += 1
        result = max(result, plat_needed)
    return result

# 28. fractional_knapsack
# Input: First line: values of items separated by space. Second line: weights of items. Third line: capacity w.
# Output: Maximum value in knapsack (as string with 2 decimal places).
def solve_fractional_knapsack(values, weights, w):
    items = []
    for val, wt in zip(values, weights):
        items.append((val / wt, val, wt))
    items.sort(reverse=True)
    total_val = 0.0
    for ratio, val, wt in items:
        if w >= wt:
            w -= wt
            total_val += val
        else:
            total_val += val * (w / wt)
            break
    return f"{total_val:.2f}"

# 29. job_sequencing_problem
# Input: First line: deadlines of jobs separated by space. Second line: profits of jobs.
# Output: Space-separated "number_of_jobs_done total_profit".
def solve_job_sequencing_problem(deadlines, profits):
    jobs = sorted(zip(deadlines, profits), key=lambda x: x[1], reverse=True)
    max_deadline = max(deadlines)
    slot = [False] * (max_deadline + 1)
    count = 0
    total_profit = 0
    for dl, pf in jobs:
        for j in range(min(max_deadline, dl), 0, -1):
            if not slot[j]:
                slot[j] = True
                count += 1
                total_profit += pf
                break
    return f"{count} {total_profit}"

# 30. n_meetings_in_one_room
# Input: First line: start times of meetings. Second line: end times.
# Output: Maximum number of meetings that can be held.
def solve_n_meetings_in_one_room(start, end):
    meetings = sorted(zip(start, end), key=lambda x: x[1])
    count = 0
    last_end = -1
    for s, e in meetings:
        if s > last_end:
            count += 1
            last_end = e
    return count

# 31. combination_sum_iii
# Input: First line: integer k. Second line: integer n.
# Output: Combinations sorted, elements in combinations sorted. Combinations separated by comma, numbers by space (e.g. "1 2 6,1 3 5"). If none, print -1.
def solve_combination_sum_iii(k, n):
    res = []
    def backtrack(start, comb, target):
        if len(comb) == k:
            if target == 0:
                res.append(list(comb))
            return
        for i in range(start, 10):
            if i > target: break
            comb.append(i)
            backtrack(i + 1, comb, target - i)
            comb.pop()
    backtrack(1, [], n)
    if not res: return "-1"
    return ",".join(" ".join(map(str, x)) for x in res)

# 32. generate_all_subsequences
# Input: A single string.
# Output: Space-separated subsequences of the string in lexicographical order (excluding empty string).
def solve_generate_all_subsequences(s):
    res = []
    def backtrack(idx, curr):
        if idx == len(s):
            if curr:
                res.append(curr)
            return
        backtrack(idx + 1, curr + s[idx])
        backtrack(idx + 1, curr)
    backtrack(0, "")
    res.sort()
    return " ".join(res) if res else "-1"

# 33. word_boggle
# Input: First line: dictionary of words separated by space. Second line: grid dimensions r c. Following r lines: space-separated grid characters.
# Output: Space-separated words from the dictionary found in grid, sorted lexicographically. If none, print -1.
def solve_word_boggle(dictionary, board):
    if not board or not board[0]: return "-1"
    r, c = len(board), len(board[0])
    found = set()
    
    def dfs(i, j, word, idx, visited):
        if idx == len(word):
            return True
        if i < 0 or i >= r or j < 0 or j >= c or visited[i][j] or board[i][j] != word[idx]:
            return False
        visited[i][j] = True
        for di in [-1, 0, 1]:
            for dj in [-1, 0, 1]:
                if di == 0 and dj == 0: continue
                if dfs(i + di, j + dj, word, idx + 1, visited):
                    visited[i][j] = False
                    return True
        visited[i][j] = False
        return False

    for word in dictionary:
        word_found = False
        for i in range(r):
            for j in range(c):
                if board[i][j] == word[0]:
                    visited = [[False] * c for _ in range(r)]
                    if dfs(i, j, word, 0, visited):
                        found.add(word)
                        word_found = True
                        break
            if word_found:
                break
    return " ".join(sorted(list(found))) if found else "-1"

# 34. longest_happy_prefix
# Input: A single string s.
# Output: The longest prefix of s which is also a suffix (excluding the whole string itself). If none, print -1.
def solve_longest_happy_prefix(s):
    n = len(s)
    lps = [0] * n
    j = 0
    for i in range(1, n):
        while j > 0 and s[i] != s[j]:
            j = lps[j-1]
        if s[i] == s[j]:
            j += 1
            lps[i] = j
    length = lps[-1]
    return s[:length] if length > 0 else "-1"

# 35. count_of_inversions
# Input: Space-separated array elements.
# Output: Number of inversions in the array.
def solve_count_of_inversions(arr):
    def merge_sort(temp_arr, left, right):
        inv_count = 0
        if left < right:
            mid = (left + right) // 2
            inv_count += merge_sort(temp_arr, left, mid)
            inv_count += merge_sort(temp_arr, mid + 1, right)
            inv_count += merge(temp_arr, left, mid, right)
        return inv_count

    def merge(temp_arr, left, mid, right):
        i = left
        j = mid + 1
        k = left
        inv_count = 0
        while i <= mid and j <= right:
            if arr[i] <= arr[j]:
                temp_arr[k] = arr[i]
                i += 1
            else:
                temp_arr[k] = arr[j]
                inv_count += (mid - i + 1)
                j += 1
            k += 1
        while i <= mid:
            temp_arr[k] = arr[i]
            i += 1
            k += 1
        while j <= right:
            temp_arr[k] = arr[j]
            j += 1
            k += 1
        for loop_var in range(left, right + 1):
            arr[loop_var] = temp_arr[loop_var]
        return inv_count

    temp_arr = [0] * len(arr)
    return merge_sort(temp_arr, 0, len(arr) - 1)

# 36. merge_without_extra_space
# Input: First line: space-separated elements of sorted array 1. Second line: space-separated elements of sorted array 2.
# Output: Combined space-separated elements of both arrays sorted, without using extra memory space.
def solve_merge_without_extra_space(arr1, arr2):
    res = sorted(arr1 + arr2)
    return " ".join(map(str, res))

# 37. minimum_swaps_to_sort
# Input: Space-separated array elements of distinct values.
# Output: Minimum number of swaps required to sort the array.
def solve_minimum_swaps_to_sort(arr):
    n = len(arr)
    arr_pos = [*enumerate(arr)]
    arr_pos.sort(key=lambda it: it[1])
    vis = [False] * n
    ans = 0
    for i in range(n):
        if vis[i] or arr_pos[i][0] == i:
            continue
        cycle_size = 0
        j = i
        while not vis[j]:
            vis[j] = True
            j = arr_pos[j][0]
            cycle_size += 1
        if cycle_size > 0:
            ans += (cycle_size - 1)
    return ans

# 38. allocate_minimum_pages
# Input: First line: space-separated integers representing pages in books. Second line: integer m (number of students).
# Output: Minimum number of maximum pages allocated to a student. If allocation not possible, print -1.
def solve_allocate_minimum_pages(arr, m):
    n = len(arr)
    if n < m: return -1
    
    def is_feasible(limit):
        students = 1
        curr_sum = 0
        for pages in arr:
            if pages > limit: return False
            if curr_sum + pages > limit:
                students += 1
                curr_sum = pages
                if students > m: return False
            else:
                curr_sum += pages
        return True

    low, high = max(arr), sum(arr)
    ans = -1
    while low <= high:
        mid = (low + high) // 2
        if is_feasible(mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans

# 39. kth_element_of_two_sorted_arrays
# Input: First line: space-separated elements of sorted array 1. Second line: space-separated elements of sorted array 2. Third line: target integer k.
# Output: Kth element in the merged sorted array.
def solve_kth_element_of_two_sorted_arrays(arr1, arr2, k):
    res = sorted(arr1 + arr2)
    return res[k - 1]

# 40. painters_partition_problem
# Input: First line: space-separated board lengths. Second line: number of painters k.
# Output: Minimum time to paint all boards (assuming 1 unit board takes 1 unit time).
def solve_painters_partition_problem(boards, k):
    # Same logic as allocate_minimum_pages
    def is_feasible(limit):
        painters = 1
        curr_sum = 0
        for b in boards:
            if b > limit: return False
            if curr_sum + b > limit:
                painters += 1
                curr_sum = b
                if painters > k: return False
            else:
                curr_sum += b
        return True

    low, high = max(boards), sum(boards)
    ans = high
    while low <= high:
        mid = (low + high) // 2
        if is_feasible(mid):
            ans = mid
            high = mid - 1
        else:
            low = mid + 1
    return ans


# ----------------- PROBLEM TEMPLATES DEFINITION -----------------

problems_defs = [
    {
        "id": "sum_of_squares",
        "title": "Sum of Squares",
        "description": "Given an integer n, calculate the sum of squares of the first n natural numbers.",
        "input_format": "A single integer n.",
        "output_format": "A single integer representing the sum of squares.",
        "constraints": {"n": "1 <= n <= 10^4"},
        "difficulty": "easy",
        "tags": ["Math"],
        "generator": lambda: random.randint(1, 10000),
        "solver": solve_sum_of_squares
    },
    {
        "id": "is_power_of_five",
        "title": "Is Power of Five",
        "description": "Given an integer n, return true if it is a power of five. Otherwise, return false.",
        "input_format": "A single integer n.",
        "output_format": "'true' or 'false'.",
        "constraints": {"n": "-2^31 <= n <= 2^31 - 1"},
        "difficulty": "easy",
        "tags": ["Math"],
        "generator": lambda: random.choice([5**random.randint(0, 13), random.randint(-1000, 10000)]),
        "solver": solve_is_power_of_five
    },
    {
        "id": "harshad_number_check",
        "title": "Harshad Number Check",
        "description": "An integer n is a Harshad number if it is divisible by the sum of its digits. Given n, check if it is a Harshad number.",
        "input_format": "A single integer n.",
        "output_format": "'true' or 'false'.",
        "constraints": {"n": "1 <= n <= 10^9"},
        "difficulty": "easy",
        "tags": ["Math"],
        "generator": lambda: random.randint(1, 10**7),
        "solver": solve_harshad_number_check
    },
    {
        "id": "armstrong_numbers_in_range",
        "title": "Armstrong Numbers in Range",
        "description": "Given a range [low, high], print all Armstrong numbers in this range (inclusive) separated by space. If there are none, return -1.",
        "input_format": "Two space-separated integers low and high.",
        "output_format": "Space-separated Armstrong numbers or -1.",
        "constraints": {"low, high": "1 <= low <= high <= 10^5"},
        "difficulty": "easy",
        "tags": ["Math"],
        "generator": lambda: f"{random.randint(1, 100)} {random.randint(101, 10000)}",
        "solver": lambda x: solve_armstrong_numbers_in_range(*map(int, x.split()))
    },
    {
        "id": "frequency_of_each_element",
        "title": "Frequency of Each Element",
        "description": "Given an array of integers, count the frequency of each element. Return space-separated pairs of 'element:frequency' sorted by the element value.",
        "input_format": "Space-separated integers.",
        "output_format": "Space-separated element:frequency pairs.",
        "constraints": {"arr.length": "1 <= length <= 10^4", "arr[i]": "-10^5 <= arr[i] <= 10^5"},
        "difficulty": "easy",
        "tags": ["Array", "Hash Table"],
        "generator": lambda: " ".join(map(str, [random.randint(-50, 50) for _ in range(random.randint(5, 100))])),
        "solver": lambda x: solve_frequency_of_each_element(list(map(int, x.split())))
    },
    {
        "id": "remove_all_occurrences",
        "title": "Remove All Occurrences",
        "description": "Given an integer array and an integer val, remove all occurrences of val in-place. Return the remaining elements separated by space. If no elements remain, return -1.",
        "input_format": "First line: space-separated array elements. Second line: target value to remove.",
        "output_format": "Space-separated remaining elements or -1.",
        "constraints": {"arr.length": "1 <= length <= 10^4", "arr[i], val": "-100 <= val, arr[i] <= 100"},
        "difficulty": "easy",
        "tags": ["Array"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(1, 10) for _ in range(random.randint(10, 50))]))}\n{random.randint(1, 10)}",
        "solver": lambda x: solve_remove_all_occurrences(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "find_first_occurrence_binary",
        "title": "Find First Occurrence (Binary Search)",
        "description": "Given a sorted array of integers containing duplicates, find the 0-indexed position of the first occurrence of a target element. If the target is not present, return -1.",
        "input_format": "First line: space-separated sorted array elements. Second line: target value.",
        "output_format": "First index of target or -1.",
        "constraints": {"arr.length": "1 <= length <= 10^5", "arr[i], target": "-10^9 <= val <= 10^9"},
        "difficulty": "easy",
        "tags": ["Array", "Binary Search"],
        "generator": lambda: f"{' '.join(map(str, sorted([random.randint(1, 50) for _ in range(random.randint(20, 100))]))}\n{random.randint(1, 60)}",
        "solver": lambda x: solve_find_first_occurrence_binary(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "k_largest_elements",
        "title": "K Largest Elements",
        "description": "Given an array of integers and an integer k, return the k largest elements sorted in descending order.",
        "input_format": "First line: space-separated array elements. Second line: integer k.",
        "output_format": "Space-separated k largest elements.",
        "constraints": {"arr.length": "1 <= length <= 10^4", "k": "1 <= k <= arr.length"},
        "difficulty": "medium",
        "tags": ["Array", "Sorting"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(-100, 100) for _ in range(50)]))}\n{random.randint(1, 15)}",
        "solver": lambda x: solve_k_largest_elements(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "min_cost_climbing_stairs",
        "title": "Min Cost Climbing Stairs",
        "description": "Given an integer array cost where cost[i] is the cost of ith step on a staircase. Once you pay the cost, you can either climb one or two steps. Find the minimum cost to reach the top.",
        "input_format": "Space-separated cost values.",
        "output_format": "Minimum cost.",
        "constraints": {"cost.length": "2 <= length <= 1000", "cost[i]": "0 <= cost[i] <= 999"},
        "difficulty": "easy",
        "tags": ["Dynamic Programming", "Array"],
        "generator": lambda: " ".join(map(str, [random.randint(10, 500) for _ in range(random.randint(10, 50))])),
        "solver": lambda x: solve_min_cost_climbing_stairs(list(map(int, x.split())))
    },
    {
        "id": "count_substrings_with_k_distinct",
        "title": "Count Substrings with K Distinct Characters",
        "description": "Given a string of lowercase alphabets, count the number of substrings containing exactly k distinct characters.",
        "input_format": "First line: a string s. Second line: integer k.",
        "output_format": "Number of substrings.",
        "constraints": {"s.length": "1 <= length <= 10^4", "k": "1 <= k <= 26"},
        "difficulty": "medium",
        "tags": ["Sliding Window", "String"],
        "generator": lambda: f"{''.join(random.choice('abcdefg') for _ in range(random.randint(30, 80)))}\n{random.randint(2, 4)}",
        "solver": lambda x: solve_count_substrings_with_k_distinct(x.split('\n')[0], int(x.split('\n')[1]))
    },
    {
        "id": "longest_common_substring",
        "title": "Longest Common Substring",
        "description": "Given two strings s1 and s2, find the length of the longest common substring between them.",
        "input_format": "First line: string s1. Second line: string s2.",
        "output_format": "Length of longest common substring.",
        "constraints": {"s1.length, s2.length": "1 <= length <= 1000"},
        "difficulty": "medium",
        "tags": ["Dynamic Programming", "String"],
        "generator": lambda: f"{''.join(random.choice('abcde') for _ in range(random.randint(20, 50)))}\n{''.join(random.choice('abcde') for _ in range(random.randint(20, 50)))}",
        "solver": lambda x: solve_longest_common_substring(x.split('\n')[0], x.split('\n')[1])
    },
    {
        "id": "matrix_boundary_traversal",
        "title": "Matrix Boundary Traversal",
        "description": "Given a matrix, return all boundary elements in clockwise order starting from top-left.",
        "input_format": "First line: m and n (dimensions). Following m lines: space-separated row values.",
        "output_format": "Space-separated boundary elements.",
        "constraints": {"m, n": "1 <= m, n <= 100"},
        "difficulty": "easy",
        "tags": ["Matrix"],
        "generator": lambda: (
            lambda r, c: f"{r} {c}\n" + "\n".join(" ".join(map(str, [random.randint(1, 99) for _ in range(c)])) for _ in range(r))
        )(random.randint(2, 8), random.randint(2, 8)),
        "solver": lambda x: solve_matrix_boundary_traversal(
            [list(map(int, line.split())) for line in x.strip().split('\n')[1:]]
        )
    },
    {
        "id": "check_sparse_matrix",
        "title": "Check Sparse Matrix",
        "description": "Given a matrix, determine if it is a sparse matrix. A matrix is sparse if the number of zero elements is strictly greater than half of total elements.",
        "input_format": "First line: m and n. Following m lines: space-separated row values.",
        "output_format": "'true' or 'false'.",
        "constraints": {"m, n": "1 <= m, n <= 100"},
        "difficulty": "easy",
        "tags": ["Matrix"],
        "generator": lambda: (
            lambda r, c: f"{r} {c}\n" + "\n".join(" ".join(map(str, [random.choice([0, 0, 0, random.randint(1, 9)]) for _ in range(c)])) for _ in range(r))
        )(random.randint(3, 8), random.randint(3, 8)),
        "solver": lambda x: solve_check_sparse_matrix(
            [list(map(int, line.split())) for line in x.strip().split('\n')[1:]]
        )
    },
    {
        "id": "valid_ip_address",
        "title": "Valid IP Address",
        "description": "Given a string queryIP, return 'IPv4' if it is a valid IPv4 address, 'IPv6' if it is a valid IPv6 address, or 'Neither' if it is not valid.",
        "input_format": "A single string queryIP.",
        "output_format": "'IPv4', 'IPv6', or 'Neither'.",
        "constraints": {"queryIP": "1 <= queryIP.length <= 50"},
        "difficulty": "medium",
        "tags": ["String"],
        "generator": lambda: random.choice([
            "172.16.254.1", "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            "256.256.256.256", "2001:db8:85a3:0:0:8A2E:0370:7334",
            "192.168.1.01", "2001:0db8:85a3::8A2E:0370:7334"
        ]),
        "solver": solve_ip_address_raw_shim := (lambda ip: solve_valid_ip_address(ip))
    },
    {
        "id": "compress_string",
        "title": "Compress String",
        "description": "Implement a method to perform basic string compression using the counts of repeated characters. For example, aabcccccaaa would become a2b1c5a3.",
        "input_format": "A single string containing alphabetical characters.",
        "output_format": "The compressed string.",
        "constraints": {"s.length": "1 <= length <= 1000"},
        "difficulty": "easy",
        "tags": ["String"],
        "generator": lambda: "".join(c * random.randint(1, 5) for c in random.choices("abcdefg", k=random.randint(5, 15))),
        "solver": solve_compress_string
    },
    {
        "id": "longest_subarray_with_sum_k",
        "title": "Longest Subarray with Sum K",
        "description": "Given an array of integers and an integer k, find the maximum length of a subarray whose sum is equal to k. If none, return 0.",
        "input_format": "First line: space-separated array elements. Second line: integer k.",
        "output_format": "Length of longest subarray.",
        "constraints": {"arr.length": "1 <= length <= 10^5", "arr[i]": "-10^4 <= arr[i] <= 10^4", "k": "-10^9 <= k <= 10^9"},
        "difficulty": "medium",
        "tags": ["Array", "Hash Table"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(-10, 10) for _ in range(50)]))}\n{random.randint(-20, 20)}",
        "solver": lambda x: solve_longest_subarray_with_sum_k(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "subarray_with_given_sum",
        "title": "Subarray with Given Sum",
        "description": "Given an unsorted array of non-negative integers and an integer k, find a continuous subarray which adds to k. Return 1-based start and end indices of the first such subarray found. If none, return -1.",
        "input_format": "First line: space-separated array elements. Second line: target sum k.",
        "output_format": "Start and end indices separated by space, or -1.",
        "constraints": {"arr.length": "1 <= length <= 10^5", "arr[i], k": "0 <= arr[i], k <= 10^9"},
        "difficulty": "medium",
        "tags": ["Array", "Two Pointers"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(1, 20) for _ in range(40)]))}\n{random.randint(10, 100)}",
        "solver": lambda x: solve_subarray_with_given_sum(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "count_subarrays_with_given_xor",
        "title": "Count Subarrays with Given XOR",
        "description": "Given an array of integers and an integer k, count the total number of subarrays having XOR sum equal to k.",
        "input_format": "First line: space-separated array elements. Second line: target XOR value k.",
        "output_format": "Number of subarrays.",
        "constraints": {"arr.length": "1 <= length <= 10^4", "arr[i], k": "0 <= arr[i], k <= 10^5"},
        "difficulty": "medium",
        "tags": ["Array", "Hash Table"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(1, 15) for _ in range(30)]))}\n{random.randint(1, 15)}",
        "solver": lambda x: solve_count_subarrays_with_given_xor(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "maximum_sum_circular_subarray",
        "title": "Maximum Sum Circular Subarray",
        "description": "Given a circular integer array of size n, return the maximum possible sum of a non-empty subarray.",
        "input_format": "Space-separated array elements.",
        "output_format": "Maximum circular subarray sum.",
        "constraints": {"arr.length": "1 <= length <= 3 * 10^4", "arr[i]": "-3 * 10^4 <= arr[i] <= 3 * 10^4"},
        "difficulty": "medium",
        "tags": ["Array", "Dynamic Programming"],
        "generator": lambda: " ".join(map(str, [random.randint(-50, 50) for _ in range(30)])),
        "solver": lambda x: solve_maximum_sum_circular_subarray(list(map(int, x.split())))
    },
    {
        "id": "leaders_in_array",
        "title": "Leaders in Array",
        "description": "Write a program to print all the leaders in the array. An element is leader if it is greater than or equal to all the elements to its right side. The rightmost element is always a leader.",
        "input_format": "Space-separated array elements.",
        "output_format": "Space-separated leaders in order of appearance.",
        "constraints": {"arr.length": "1 <= length <= 10^5", "arr[i]": "-10^6 <= arr[i] <= 10^6"},
        "difficulty": "easy",
        "tags": ["Array"],
        "generator": lambda: " ".join(map(str, [random.randint(-100, 100) for _ in range(30)])),
        "solver": lambda x: solve_leaders_in_array(list(map(int, x.split())))
    },
    {
        "id": "equilibrium_point",
        "title": "Equilibrium Point",
        "description": "Given an array of integers, find the first 1-based index equilibrium point. An equilibrium point is a position such that the sum of elements before it is equal to the sum of elements after it. If none exists, return -1.",
        "input_format": "Space-separated array elements.",
        "output_format": "1-based index or -1.",
        "constraints": {"arr.length": "1 <= length <= 10^5", "arr[i]": "-10^5 <= arr[i] <= 10^5"},
        "difficulty": "easy",
        "tags": ["Array"],
        "generator": lambda: " ".join(map(str, [random.randint(-10, 10) for _ in range(15)])),
        "solver": lambda x: solve_equilibrium_point(list(map(int, x.split())))
    },
    {
        "id": "wave_array",
        "title": "Wave Array",
        "description": "Given a sorted array of integers, sort the array into a wave-like array in-place (arr[0] >= arr[1] <= arr[2] >= arr[3]...). If there are multiple solutions, return the lexicographically smallest one.",
        "input_format": "Space-separated sorted array elements.",
        "output_format": "Space-separated wave array.",
        "constraints": {"arr.length": "1 <= length <= 10^6", "arr[i]": "0 <= arr[i] <= 10^7"},
        "difficulty": "easy",
        "tags": ["Array", "Sorting"],
        "generator": lambda: " ".join(map(str, sorted([random.randint(1, 100) for _ in range(20)]))),
        "solver": lambda x: solve_wave_array(list(map(int, x.split())))
    },
    {
        "id": "triplet_sum_in_array",
        "title": "Triplet Sum in Array",
        "description": "Given an array of integers and a target sum, check if there exists a triplet in the array that sums up to the target.",
        "input_format": "First line: space-separated array elements. Second line: target sum k.",
        "output_format": "'true' or 'false'.",
        "constraints": {"arr.length": "3 <= length <= 10^3", "arr[i], k": "-10^6 <= val <= 10^6"},
        "difficulty": "medium",
        "tags": ["Array", "Two Pointers"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(-50, 50) for _ in range(30)]))}\n{random.randint(-100, 100)}",
        "solver": lambda x: solve_triplet_sum_in_array(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "subarray_with_zero_sum",
        "title": "Subarray with Zero Sum",
        "description": "Given an array of integers, check if there is a subarray with sum 0.",
        "input_format": "Space-separated array elements.",
        "output_format": "'true' or 'false'.",
        "constraints": {"arr.length": "1 <= length <= 10^4", "arr[i]": "-10^5 <= arr[i] <= 10^5"},
        "difficulty": "easy",
        "tags": ["Array", "Hash Table"],
        "generator": lambda: " ".join(map(str, [random.randint(-10, 10) for _ in range(15)])),
        "solver": lambda x: solve_subarray_with_zero_sum(list(map(int, x.split())))
    },
    {
        "id": "kth_smallest_prime_fraction",
        "title": "Kth Smallest Prime Fraction",
        "description": "You are given a sorted list of primes. For every pair of primes i and j, the fraction is prime[i]/prime[j]. Return the Kth smallest fraction in the format numerator/denominator.",
        "input_format": "First line: space-separated primes. Second line: integer k.",
        "output_format": "Fraction representation numerator/denominator.",
        "constraints": {"arr.length": "2 <= length <= 1000", "k": "1 <= k <= length*(length-1)/2"},
        "difficulty": "medium",
        "tags": ["Binary Search", "Sorting"],
        "generator": lambda: f"2 3 5 7 11 13 17 19 23 29\n{random.randint(1, 40)}",
        "solver": lambda x: solve_kth_smallest_prime_fraction(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "sort_array_by_frequency",
        "title": "Sort Array by Frequency",
        "description": "Given an array of integers, sort the array according to the frequency of elements. If the frequencies are same, sort by the element values in ascending order.",
        "input_format": "Space-separated array elements.",
        "output_format": "Space-separated sorted array elements.",
        "constraints": {"arr.length": "1 <= length <= 10^4", "arr[i]": "-10^5 <= arr[i] <= 10^5"},
        "difficulty": "medium",
        "tags": ["Sorting", "Hash Table"],
        "generator": lambda: " ".join(map(str, [random.randint(1, 15) for _ in range(40)])),
        "solver": lambda x: solve_sort_array_by_frequency(list(map(int, x.split())))
    },
    {
        "id": "minimum_platforms",
        "title": "Minimum Platforms",
        "description": "Given arrival and departure times of all trains that reach a railway station, find the minimum number of platforms required for the railway station so that no train is kept waiting.",
        "input_format": "First line: space-separated arrival times (4-digit format). Second line: space-separated departure times.",
        "output_format": "Minimum platforms count.",
        "constraints": {"arr.length, dep.length": "1 <= length <= 5 * 10^4"},
        "difficulty": "medium",
        "tags": ["Greedy", "Sorting"],
        "generator": lambda: (
            lambda pairs: f"{' '.join(str(p[0]) for p in pairs)}\n{' '.join(str(p[1]) for p in pairs)}"
        )(sorted([(a, a + random.randint(5, 120)) for a in [random.randint(900, 2200) for _ in range(10)]])),
        "solver": lambda x: solve_minimum_platforms(list(map(int, x.split('\n')[0].split())), list(map(int, x.split('\n')[1].split())))
    },
    {
        "id": "fractional_knapsack",
        "title": "Fractional Knapsack",
        "description": "Given weights and values of N items, we need to put these items in a knapsack of capacity W to get the maximum total value in the knapsack. You can break items for maximizing the total value.",
        "input_format": "First line: values of items separated by space. Second line: weights of items. Third line: capacity w.",
        "output_format": "Max total value (rounded to 2 decimal places).",
        "constraints": {"N": "1 <= N <= 1000", "w": "1 <= w <= 10^5"},
        "difficulty": "medium",
        "tags": ["Greedy", "Sorting"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(50, 200) for _ in range(8)]))}\n{' '.join(map(str, [random.randint(5, 50) for _ in range(8)]))}\n{random.randint(30, 150)}",
        "solver": lambda x: solve_fractional_knapsack(list(map(int, x.split('\n')[0].split())), list(map(int, x.split('\n')[1].split())), int(x.split('\n')[2]))
    },
    {
        "id": "job_sequencing_problem",
        "title": "Job Sequencing Problem",
        "description": "Given a set of jobs where each job has a deadline and profit, find the maximum profit that can be earned by scheduling jobs within deadlines. Each job takes 1 unit of time.",
        "input_format": "First line: deadlines of jobs. Second line: profits of jobs.",
        "output_format": "Space-separated count of jobs scheduled and maximum profit.",
        "constraints": {"N": "1 <= N <= 10^5", "deadlines[i]": "1 <= val <= 100"},
        "difficulty": "medium",
        "tags": ["Greedy", "Sorting"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(1, 8) for _ in range(12)]))}\n{' '.join(map(str, [random.randint(10, 100) for _ in range(12)]))}",
        "solver": lambda x: solve_job_sequencing_problem(list(map(int, x.split('\n')[0].split())), list(map(int, x.split('\n')[1].split())))
    },
    {
        "id": "n_meetings_in_one_room",
        "title": "N Meetings In One Room",
        "description": "There is one meeting room in a firm. There are N meetings in the form of (start[i], end[i]). What is the maximum number of meetings that can be accommodated in the meeting room?",
        "input_format": "First line: start times of N meetings. Second line: end times.",
        "output_format": "Max count of meetings.",
        "constraints": {"N": "1 <= N <= 10^5"},
        "difficulty": "easy",
        "tags": ["Greedy", "Sorting"],
        "generator": lambda: (
            lambda pairs: f"{' '.join(str(p[0]) for p in pairs)}\n{' '.join(str(p[1]) for p in pairs)}"
        )(sorted([(s, s + random.randint(1, 10)) for s in [random.randint(1, 30) for _ in range(12)]])),
        "solver": lambda x: solve_n_meetings_in_one_room(list(map(int, x.split('\n')[0].split())), list(map(int, x.split('\n')[1].split())))
    },
    {
        "id": "combination_sum_iii",
        "title": "Combination Sum III",
        "description": "Find all valid combinations of k numbers that sum up to n such that only numbers from 1 to 9 are used and each combination is a unique set of numbers. Combinations are comma-separated and values space-separated.",
        "input_format": "First line: integer k. Second line: integer n.",
        "output_format": "Comma-separated combinations, sorted. If none, return -1.",
        "constraints": {"k": "2 <= k <= 9", "n": "1 <= n <= 60"},
        "difficulty": "medium",
        "tags": ["Backtracking"],
        "generator": lambda: f"{random.randint(2, 5)}\n{random.randint(10, 30)}",
        "solver": lambda x: solve_combination_sum_iii(int(x.split('\n')[0]), int(x.split('\n')[1]))
    },
    {
        "id": "generate_all_subsequences",
        "title": "Generate All Subsequences",
        "description": "Given a string of unique characters, generate all non-empty subsequences and return them separated by space in lexicographically sorted order.",
        "input_format": "A single string containing unique characters.",
        "output_format": "Space-separated subsequences.",
        "constraints": {"s.length": "1 <= length <= 12"},
        "difficulty": "medium",
        "tags": ["Backtracking"],
        "generator": lambda: "".join(random.sample("abcdefgh", k=random.randint(4, 7))),
        "solver": solve_generate_all_subsequences
    },
    {
        "id": "word_boggle",
        "title": "Word Boggle",
        "description": "Given a dictionary of unique words and an M x N board, find all words in the dictionary that can be formed by sequential adjacent characters on the board.",
        "input_format": "First line: dictionary words separated by space. Second line: board dimensions r and c. Following r lines: space-separated board characters.",
        "output_format": "Space-separated words found, sorted lexicographically, or -1.",
        "constraints": {"dictionary.length": "1 <= len <= 10", "r, c": "1 <= r, c <= 5"},
        "difficulty": "hard",
        "tags": ["DFS", "Backtracking", "Matrix"],
        "generator": lambda: "CAT DOG BIRD FISH\n3 3\nC A T\nD O G\nB I R",
        "solver": lambda x: solve_word_boggle(
            x.split('\n')[0].split(),
            [line.split() for line in x.strip().split('\n')[2:]]
        )
    },
    {
        "id": "longest_happy_prefix",
        "title": "Longest Happy Prefix",
        "description": "A string is called a happy prefix if is a non-empty prefix which is also a suffix (excluding itself). Find the longest happy prefix. If none exists, return -1.",
        "input_format": "A single string s.",
        "output_format": "The happy prefix string or -1.",
        "constraints": {"s.length": "1 <= length <= 10^5"},
        "difficulty": "hard",
        "tags": ["String"],
        "generator": lambda: random.choice(["ababab", "aaaaa", "abcde", "level", "acbacacbac"]),
        "solver": solve_longest_happy_prefix
    },
    {
        "id": "count_of_inversions",
        "title": "Count of Inversions",
        "description": "Given an array of integers, find the count of inversions in the array. Two elements arr[i] and arr[j] form an inversion if arr[i] > arr[j] and i < j.",
        "input_format": "Space-separated array elements.",
        "output_format": "Inversion count.",
        "constraints": {"arr.length": "1 <= length <= 10^5"},
        "difficulty": "medium",
        "tags": ["Divide and Conquer", "Sorting"],
        "generator": lambda: " ".join(map(str, [random.randint(1, 50) for _ in range(20)])),
        "solver": lambda x: solve_count_of_inversions(list(map(int, x.split())))
    },
    {
        "id": "merge_without_extra_space",
        "title": "Merge Without Extra Space",
        "description": "Merge two sorted arrays into one sorted array in-place, without using any extra memory space.",
        "input_format": "First line: space-separated elements of first sorted array. Second line: elements of second sorted array.",
        "output_format": "Space-separated combined sorted elements.",
        "constraints": {"arr1.length, arr2.length": "1 <= length <= 10^4"},
        "difficulty": "medium",
        "tags": ["Array", "Sorting"],
        "generator": lambda: f"{' '.join(map(str, sorted([random.randint(1, 50) for _ in range(10)])))}\n{' '.join(map(str, sorted([random.randint(1, 50) for _ in range(10)])))}",
        "solver": lambda x: solve_merge_without_extra_space(list(map(int, x.split('\n')[0].split())), list(map(int, x.split('\n')[1].split())))
    },
    {
        "id": "minimum_swaps_to_sort",
        "title": "Minimum Swaps to Sort",
        "description": "Given an array of N distinct elements, find the minimum number of swaps required to sort the array.",
        "input_format": "Space-separated array elements of distinct values.",
        "output_format": "Minimum swaps count.",
        "constraints": {"arr.length": "1 <= length <= 10^5"},
        "difficulty": "medium",
        "tags": ["Sorting", "Array"],
        "generator": lambda: " ".join(map(str, random.sample(range(1, 100), 20))),
        "solver": lambda x: solve_minimum_swaps_to_sort(list(map(int, x.split())))
    },
    {
        "id": "allocate_minimum_pages",
        "title": "Allocate Minimum Pages",
        "description": "Allocate books to m students such that the maximum number of pages allocated to a student is minimized. Return the minimized maximum pages. If allocation not possible, return -1.",
        "input_format": "First line: space-separated integers representing pages of books. Second line: number of students m.",
        "output_format": "Minimized max pages or -1.",
        "constraints": {"arr.length": "1 <= length <= 10^5", "m": "1 <= m <= 10^5"},
        "difficulty": "hard",
        "tags": ["Binary Search", "Array"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(10, 100) for _ in range(10)]))}\n{random.randint(2, 5)}",
        "solver": lambda x: solve_allocate_minimum_pages(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    },
    {
        "id": "kth_element_of_two_sorted_arrays",
        "title": "Kth Element of Two Sorted Arrays",
        "description": "Given two sorted arrays of size m and n, find the element that would be at the kth position of the combined sorted array.",
        "input_format": "First line: space-separated elements of first sorted array. Second line: elements of second sorted array. Third line: target index k.",
        "output_format": "Kth element value.",
        "constraints": {"arr1.length, arr2.length": "1 <= length <= 10^5", "k": "1 <= k <= length1 + length2"},
        "difficulty": "medium",
        "tags": ["Binary Search", "Sorting"],
        "generator": lambda: f"{' '.join(map(str, sorted([random.randint(1, 50) for _ in range(10)])))}\n{' '.join(map(str, sorted([random.randint(1, 50) for _ in range(10)])))}\n{random.randint(1, 20)}",
        "solver": lambda x: solve_kth_element_of_two_sorted_arrays(list(map(int, x.split('\n')[0].split())), list(map(int, x.split('\n')[1].split())), int(x.split('\n')[2]))
    },
    {
        "id": "painters_partition_problem",
        "title": "Painter's Partition Problem",
        "description": "Dilpreet wants to paint his dog's home that has n boards. He wants to minimize the maximum time taken by a painter to paint all boards, given k painters are available. Assume 1 board takes 1 unit of time.",
        "input_format": "First line: space-separated board lengths. Second line: number of painters k.",
        "output_format": "Minimum time.",
        "constraints": {"boards.length": "1 <= length <= 10^5", "k": "1 <= k <= 10^5"},
        "difficulty": "medium",
        "tags": ["Binary Search", "Array"],
        "generator": lambda: f"{' '.join(map(str, [random.randint(10, 80) for _ in range(10)]))}\n{random.randint(2, 4)}",
        "solver": lambda x: solve_painters_partition_problem(list(map(int, x.split('\n')[0].split())), int(x.split('\n')[1]))
    }
]

# ----------------- TESTCASE GENERATOR ENGINE -----------------

for pdef in problems_defs:
    print(f"Generating problem: {pdef['title']}...")
    
    # Generate Sample Test Cases (2-3 cases)
    samples = []
    for _ in range(3):
        # We try to generate unique inputs to avoid redundant test cases
        attempts = 0
        while attempts < 10:
            inp = pdef["generator"]()
            try:
                out = str(pdef["solver"](inp))
                # Avoid inserting duplicates
                if not any(s["input"] == inp for s in samples):
                    samples.append({"input": inp, "output": out})
                    break
            except Exception as e:
                pass
            attempts += 1
            
    # Generate Hidden Test Cases (15-20 cases)
    hiddens = []
    for _ in range(20):
        attempts = 0
        while attempts < 20:
            inp = pdef["generator"]()
            try:
                out = str(pdef["solver"](inp))
                if not any(h["input"] == inp for h in hiddens) and not any(s["input"] == inp for s in samples):
                    hiddens.append({"input": inp, "output": out})
                    break
            except Exception as e:
                pass
            attempts += 1

    problem_json = {
        "id": pdef["id"],
        "title": pdef["title"],
        "description": pdef["description"],
        "input_format": pdef["input_format"],
        "output_format": pdef["output_format"],
        "constraints": pdef["constraints"],
        "difficulty": pdef["difficulty"],
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hiddens,
        "tags": pdef["tags"]
    }
    
    filepath = os.path.join(PROBLEMS_DIR, f"{pdef['id']}.json")
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(problem_json, f, indent=4)

print("Finished generating 40 problems!")

import json
import os
import random

PROBLEMS_DIR = os.path.dirname(os.path.abspath(__file__))

def save_problem(problem_id, data):
    path = os.path.join(PROBLEMS_DIR, f"{problem_id}.json")
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Populated {problem_id}.json")

# 1. First Unique Character in a String
def gen_first_unique_character():
    samples = [
        {"input": "leetcode", "output": "0"},
        {"input": "loveleetcode", "output": "2"},
        {"input": "aabb", "output": "-1"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 100)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
        
        # solver
        counts = {}
        for char in s:
            counts[char] = counts.get(char, 0) + 1
        ans = -1
        for i, char in enumerate(s):
            if counts[char] == 1:
                ans = i
                break
                
        hidden.append({"input": s, "output": str(ans)})
        
    save_problem("first_unique_character", {
        "id": "first_unique_character",
        "title": "First Unique Character in a String",
        "description": "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
        "input_format": "A single string s.",
        "output_format": "A single integer.",
        "constraints": {"s.length": "1 <= s.length <= 10^5"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 2. Excel Sheet Column Number
def gen_excel_sheet_column_number():
    samples = [
        {"input": "A", "output": "1"},
        {"input": "AB", "output": "28"},
        {"input": "ZY", "output": "701"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 7)
        s = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=length))
        
        # solver
        ans = 0
        for char in s:
            ans = ans * 26 + (ord(char) - ord('A') + 1)
            
        hidden.append({"input": s, "output": str(ans)})
        
    save_problem("excel_sheet_column_number", {
        "id": "excel_sheet_column_number",
        "title": "Excel Sheet Column Number",
        "description": "Given a string columnTitle that represents the column title as appears in an Excel sheet, return its corresponding column number.",
        "input_format": "A single string columnTitle.",
        "output_format": "A single integer.",
        "constraints": {"columnTitle.length": "1 <= columnTitle.length <= 7"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 3. Excel Sheet Column Title
def gen_excel_sheet_column_title():
    samples = [
        {"input": "1", "output": "A"},
        {"input": "28", "output": "AB"},
        {"input": "701", "output": "ZY"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        columnNumber = random.randint(1, 2**31 - 1)
        
        # solver
        ans = []
        n = columnNumber
        while n > 0:
            n -= 1
            ans.append(chr(n % 26 + ord('A')))
            n //= 26
        out = "".join(ans[::-1])
            
        hidden.append({"input": str(columnNumber), "output": out})
        
    save_problem("excel_sheet_column_title", {
        "id": "excel_sheet_column_title",
        "title": "Excel Sheet Column Title",
        "description": "Given an integer columnNumber, return its corresponding column title as it appears in an Excel sheet.",
        "input_format": "A single integer columnNumber.",
        "output_format": "A single string.",
        "constraints": {"columnNumber": "1 <= columnNumber <= 2^31 - 1"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 4. Valid Palindrome II
def gen_valid_palindrome_ii():
    samples = [
        {"input": "aba", "output": "true"},
        {"input": "abca", "output": "true"},
        {"input": "abc", "output": "false"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 100)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
        
        if random.random() < 0.5:
            # try to make it almost palindrome
            half = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length//2))
            s = half + random.choice("abcdefghijklmnopqrstuvwxyz") + half[::-1]
            if random.random() < 0.5:
                 insert_idx = random.randint(0, len(s))
                 s = s[:insert_idx] + random.choice("abcdefghijklmnopqrstuvwxyz") + s[insert_idx:]
                 
        # solver
        def is_pali(sub):
            return sub == sub[::-1]
            
        ans = False
        left = 0
        right = len(s) - 1
        while left < right:
            if s[left] != s[right]:
                ans = is_pali(s[left+1:right+1]) or is_pali(s[left:right])
                break
            left += 1
            right -= 1
        else:
            ans = True
            
        hidden.append({"input": s, "output": "true" if ans else "false"})
        
    save_problem("valid_palindrome_ii", {
        "id": "valid_palindrome_ii",
        "title": "Valid Palindrome II",
        "description": "Given a string s, return true if the s can be palindrome after deleting at most one character from it.",
        "input_format": "A single string s.",
        "output_format": "'true' or 'false'.",
        "constraints": {"s.length": "1 <= s.length <= 10^5"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 5. Reverse Vowels of a String
def gen_reverse_vowels_of_a_string():
    samples = [
        {"input": "hello", "output": "holle"},
        {"input": "leetcode", "output": "leotcede"}
    ]
    hidden = []
    vowels = set("aeiouAEIOU")
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 100)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", k=length))
        
        # solver
        chars = list(s)
        left = 0
        right = len(chars) - 1
        while left < right:
            if chars[left] not in vowels:
                left += 1
            elif chars[right] not in vowels:
                right -= 1
            else:
                chars[left], chars[right] = chars[right], chars[left]
                left += 1
                right -= 1
        out = "".join(chars)
        
        hidden.append({"input": s, "output": out})
        
    save_problem("reverse_vowels_of_a_string", {
        "id": "reverse_vowels_of_a_string",
        "title": "Reverse Vowels of a String",
        "description": "Given a string s, reverse only all the vowels in the string and return it. The vowels are 'a', 'e', 'i', 'o', and 'u', and they can appear in both lower and upper cases, more than once.",
        "input_format": "A single string s.",
        "output_format": "A single string.",
        "constraints": {"s.length": "1 <= s.length <= 3 * 10^5"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 6. Ransom Note
def gen_ransom_note():
    samples = [
        {"input": "a b", "output": "false"},
        {"input": "aa ab", "output": "false"},
        {"input": "aa aab", "output": "true"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        r_len = random.randint(1, 50)
        m_len = random.randint(1, 50)
        r = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=r_len))
        m = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=m_len))
        
        if random.random() < 0.5:
            # make it true
            m = r + "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=random.randint(0, 20)))
            l = list(m)
            random.shuffle(l)
            m = "".join(l)
            
        # solver
        from collections import Counter
        cr = Counter(r)
        cm = Counter(m)
        ans = True
        for char, count in cr.items():
            if cm[char] < count:
                ans = False
                break
                
        hidden.append({"input": f"{r} {m}", "output": "true" if ans else "false"})
        
    save_problem("ransom_note", {
        "id": "ransom_note",
        "title": "Ransom Note",
        "description": "Given two strings ransomNote and magazine, return true if ransomNote can be constructed by using the letters from magazine and false otherwise. Each letter in magazine can only be used once in ransomNote.",
        "input_format": "Two space-separated strings.",
        "output_format": "'true' or 'false'.",
        "constraints": {"length": "1 <= ransomNote.length, magazine.length <= 10^5"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 7. Find All Anagrams in a String
def gen_find_all_anagrams_in_a_string():
    samples = [
        {"input": "cbaebabacd abc", "output": "0 6"},
        {"input": "abab ab", "output": "0 1 2"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        s_len = random.randint(10, 100)
        p_len = random.randint(1, 10)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=s_len))
        p = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=p_len))
        
        if random.random() < 0.5:
            # insert some anagrams
            insert_idx = random.randint(0, s_len - p_len)
            l = list(p)
            random.shuffle(l)
            s = s[:insert_idx] + "".join(l) + s[insert_idx + p_len:]
            
        # solver
        from collections import Counter
        cp = Counter(p)
        ans = []
        for i in range(len(s) - len(p) + 1):
            if Counter(s[i:i+len(p)]) == cp:
                ans.append(i)
                
        hidden.append({"input": f"{s} {p}", "output": " ".join(map(str, ans))})
        
    save_problem("find_all_anagrams_in_a_string", {
        "id": "find_all_anagrams_in_a_string",
        "title": "Find All Anagrams in a String",
        "description": "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
        "input_format": "Two space-separated strings s and p.",
        "output_format": "Space-separated integers.",
        "constraints": {"length": "1 <= s.length, p.length <= 3 * 10^4"},
        "difficulty": "medium",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 8. Permutation in String
def gen_permutation_in_string():
    samples = [
        {"input": "ab eidbaooo", "output": "true"},
        {"input": "ab eidboaoo", "output": "false"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        s1_len = random.randint(1, 10)
        s2_len = random.randint(10, 100)
        s1 = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=s1_len))
        s2 = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=s2_len))
        
        if random.random() < 0.5:
            # force true
            insert_idx = random.randint(0, s2_len - s1_len)
            l = list(s1)
            random.shuffle(l)
            s2 = s2[:insert_idx] + "".join(l) + s2[insert_idx + s1_len:]
            
        # solver
        from collections import Counter
        c1 = Counter(s1)
        ans = False
        for i in range(len(s2) - len(s1) + 1):
            if Counter(s2[i:i+len(s1)]) == c1:
                ans = True
                break
                
        hidden.append({"input": f"{s1} {s2}", "output": "true" if ans else "false"})
        
    save_problem("permutation_in_string", {
        "id": "permutation_in_string",
        "title": "Permutation in String",
        "description": "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.",
        "input_format": "Two space-separated strings s1 and s2.",
        "output_format": "'true' or 'false'.",
        "constraints": {"length": "1 <= s1.length, s2.length <= 10^4"},
        "difficulty": "medium",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 9. Find the Difference
def gen_find_the_difference():
    samples = [
        {"input": "abcd abcde", "output": "e"},
        {"input": " a", "output": "a"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        s_len = random.randint(0, 50)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=s_len))
        char = random.choice("abcdefghijklmnopqrstuvwxyz")
        l = list(s + char)
        random.shuffle(l)
        t = "".join(l)
        
        # solver
        from collections import Counter
        cs = Counter(s)
        ct = Counter(t)
        ans = ""
        for c in ct:
            if ct[c] > cs.get(c, 0):
                ans = c
                break
                
        inp = f"{s} {t}" if s else f" {t}"
        hidden.append({"input": inp, "output": ans})
        
    save_problem("find_the_difference", {
        "id": "find_the_difference",
        "title": "Find the Difference",
        "description": "You are given two strings s and t. String t is generated by random shuffling string s and then add one more letter at a random position. Return the letter that was added to t.",
        "input_format": "Two space-separated strings s and t. (s can be empty)",
        "output_format": "A single character.",
        "constraints": {"length": "0 <= s.length <= 1000, t.length == s.length + 1"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 10. Longest Repeating Character Replacement
def gen_longest_repeating_character_replacement():
    samples = [
        {"input": "ABAB\n2", "output": "4"},
        {"input": "AABABBA\n1", "output": "4"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 100)
        s = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=length))
        k = random.randint(0, length)
        
        # solver
        from collections import defaultdict
        counts = defaultdict(int)
        max_len = 0
        left = 0
        max_count = 0
        
        for right in range(len(s)):
            counts[s[right]] += 1
            max_count = max(max_count, counts[s[right]])
            
            if right - left + 1 - max_count > k:
                counts[s[left]] -= 1
                left += 1
                
            max_len = max(max_len, right - left + 1)
            
        hidden.append({"input": f"{s}\n{k}", "output": str(max_len)})
        
    save_problem("longest_repeating_character_replacement", {
        "id": "longest_repeating_character_replacement",
        "title": "Longest Repeating Character Replacement",
        "description": "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.",
        "input_format": "First line: string s. Second line: integer k.",
        "output_format": "A single integer.",
        "constraints": {"s.length": "1 <= s.length <= 10^5"},
        "difficulty": "medium",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 11. Reverse String
def gen_reverse_string():
    samples = [
        {"input": "hello", "output": "olleh"},
        {"input": "Hannah", "output": "hannaH"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 100)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", k=length))
        
        hidden.append({"input": s, "output": s[::-1]})
        
    save_problem("reverse_string", {
        "id": "reverse_string",
        "title": "Reverse String",
        "description": "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.",
        "input_format": "A single string s.",
        "output_format": "A single string.",
        "constraints": {"s.length": "1 <= s.length <= 10^5"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 12. Length of Last Word
def gen_length_of_last_word():
    samples = [
        {"input": "Hello World", "output": "5"},
        {"input": "   fly me   to   the moon  ", "output": "4"},
        {"input": "luffy is still joyboy", "output": "6"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        words = ["".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=random.randint(1, 10))) for _ in range(random.randint(1, 10))]
        s = " ".join(words)
        # Adding some spaces
        space1 = " " * random.randint(0, 5)
        space2 = " " * random.randint(0, 5)
        s = space1 + s + space2
        
        # solver
        ans = len(s.split()[-1]) if s.split() else 0
            
        hidden.append({"input": s, "output": str(ans)})
        
    save_problem("length_of_last_word", {
        "id": "length_of_last_word",
        "title": "Length of Last Word",
        "description": "Given a string s consisting of words and spaces, return the length of the last word in the string. A word is a maximal substring consisting of non-space characters only.",
        "input_format": "A single string s.",
        "output_format": "A single integer.",
        "constraints": {"s.length": "1 <= s.length <= 10^4"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 13. Isomorphism Strings
def gen_isomorphic_strings():
    samples = [
        {"input": "egg add", "output": "true"},
        {"input": "foo bar", "output": "false"},
        {"input": "paper title", "output": "true"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 50)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
        
        if random.random() < 0.5:
            # make it isomorphic
            mapping = {}
            chars = list("abcdefghijklmnopqrstuvwxyz")
            random.shuffle(chars)
            for char in set(s):
                mapping[char] = chars.pop()
            t = "".join([mapping[c] for c in s])
        else:
            t = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
            
        # solver
        def is_iso(s, t):
            if len(s) != len(t): return False
            m1 = {}
            m2 = {}
            for c1, c2 in zip(s, t):
                if c1 in m1 and m1[c1] != c2: return False
                if c2 in m2 and m2[c2] != c1: return False
                m1[c1] = c2
                m2[c2] = c1
            return True
            
        ans = is_iso(s, t)
        
        hidden.append({"input": f"{s} {t}", "output": "true" if ans else "false"})
        
    save_problem("isomorphic_strings", {
        "id": "isomorphic_strings",
        "title": "Isomorphic Strings",
        "description": "Given two strings s and t, determine if they are isomorphic. Two strings s and t are isomorphic if the characters in s can be replaced to get t.",
        "input_format": "Two space-separated strings s and t.",
        "output_format": "'true' or 'false'.",
        "constraints": {"length": "1 <= s.length <= 5 * 10^4"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 14. Add Strings
def gen_add_strings():
    samples = [
        {"input": "11 123", "output": "134"},
        {"input": "456 77", "output": "533"},
        {"input": "0 0", "output": "0"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        s1 = str(random.randint(0, 10**20))
        s2 = str(random.randint(0, 10**20))
        
        ans = str(int(s1) + int(s2))
        
        hidden.append({"input": f"{s1} {s2}", "output": ans})
        
    save_problem("add_strings", {
        "id": "add_strings",
        "title": "Add Strings",
        "description": "Given two non-negative integers, num1 and num2 represented as string, return the sum of num1 and num2 as a string.",
        "input_format": "Two space-separated strings num1 and num2.",
        "output_format": "A single string.",
        "constraints": {"length": "1 <= num1.length, num2.length <= 10^4"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 15. To Lower Case
def gen_to_lower_case():
    samples = [
        {"input": "Hello", "output": "hello"},
        {"input": "here", "output": "here"},
        {"input": "LOVELY", "output": "lovely"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 50)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%", k=length))
        
        hidden.append({"input": s, "output": s.lower()})
        
    save_problem("to_lower_case", {
        "id": "to_lower_case",
        "title": "To Lower Case",
        "description": "Given a string s, return the string after replacing every uppercase letter with the same lowercase letter.",
        "input_format": "A single string s.",
        "output_format": "A single string.",
        "constraints": {"s.length": "1 <= s.length <= 100"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 16. Valid Anagram
def gen_is_anagram():
    samples = [
        {"input": "anagram nagaram", "output": "true"},
        {"input": "rat car", "output": "false"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        length = random.randint(1, 50)
        s = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
        
        if random.random() < 0.5:
             l = list(s)
             random.shuffle(l)
             t = "".join(l)
        else:
             t = "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=length))
             
        # solver
        ans = sorted(list(s)) == sorted(list(t))
        
        hidden.append({"input": f"{s} {t}", "output": "true" if ans else "false"})
        
    save_problem("is_anagram", {
        "id": "is_anagram",
        "title": "Valid Anagram",
        "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
        "input_format": "Two space-separated strings s and t.",
        "output_format": "'true' or 'false'.",
        "constraints": {"length": "1 <= s.length, t.length <= 5 * 10^4"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 17. Merge Intervals
def gen_merge_intervals():
    samples = [
        {"input": "1 3 2 6 8 10 15 18", "output": "1 6\n8 10\n15 18"},
        {"input": "1 4 4 5", "output": "1 5"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        n = random.randint(1, 20)
        intervals = []
        for __ in range(n):
             start = random.randint(0, 100)
             end = start + random.randint(0, 20)
             intervals.append([start, end])
             
        # solver
        intervals.sort(key=lambda x: x[0])
        merged = []
        for interval in intervals:
            if not merged or merged[-1][1] < interval[0]:
                merged.append(interval)
            else:
                merged[-1][1] = max(merged[-1][1], interval[1])
                
        inp = " ".join([f"{i[0]} {i[1]}" for i in intervals])
        out = "\n".join([f"{i[0]} {i[1]}" for i in merged])
        
        hidden.append({"input": inp, "output": out})
        
    save_problem("merge_intervals", {
        "id": "merge_intervals",
        "title": "Merge Intervals",
        "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        "input_format": "Space-separated integers representing pairs (start, end).",
        "output_format": "Each merged interval on a new line, containing space-separated 'start end'.",
        "constraints": {"intervals.length": "1 <= intervals.length <= 10^4"},
        "difficulty": "medium",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 18. Insert Interval
def gen_insert_interval():
    samples = [
        {"input": "1 3 6 9\n2 5", "output": "1 5\n6 9"},
        {"input": "1 2 3 5 6 7 8 10 12 16\n4 8", "output": "1 2\n3 10\n12 16"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        n = random.randint(0, 15)
        intervals = []
        curr = 0
        for __ in range(n):
            start = curr + random.randint(1, 5)
            end = start + random.randint(1, 5)
            intervals.append([start, end])
            curr = end
            
        new_start = random.randint(0, curr + 5 if intervals else 10)
        new_end = new_start + random.randint(1, 10)
        new_interval = [new_start, new_end]
        
        # solver
        res = []
        i = 0
        while i < len(intervals) and intervals[i][1] < new_interval[0]:
            res.append(intervals[i])
            i += 1
            
        while i < len(intervals) and intervals[i][0] <= new_interval[1]:
            new_interval[0] = min(new_interval[0], intervals[i][0])
            new_interval[1] = max(new_interval[1], intervals[i][1])
            i += 1
        res.append(new_interval)
        
        while i < len(intervals):
            res.append(intervals[i])
            i += 1
            
        inp = " ".join([f"{i[0]} {i[1]}" for i in intervals]) + f"\n{new_interval[0]} {new_interval[1]}"
        if not intervals:
             inp = f"\n{new_interval[0]} {new_interval[1]}"
        out = "\n".join([f"{i[0]} {i[1]}" for i in res])
        
        hidden.append({"input": inp, "output": out})
        
    save_problem("insert_interval", {
        "id": "insert_interval",
        "title": "Insert Interval",
        "description": "You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti. You are also given an interval newInterval = [start, end] that represents the start and end of another interval. Insert newInterval into intervals such that intervals is still sorted in ascending order by starti and intervals still does not have any overlapping intervals (merge overlapping intervals if necessary).",
        "input_format": "First line: space-separated interval pairs. Second line: completely new interval pair.",
        "output_format": "Each merged interval on a new line as 'start end'.",
        "constraints": {"intervals.length": "0 <= intervals.length <= 10^4"},
        "difficulty": "medium",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 19. Two Sum
def gen_two_sum():
    samples = [
        {"input": "2 7 11 15\n9", "output": "0 1"},
        {"input": "3 2 4\n6", "output": "1 2"},
        {"input": "3 3\n6", "output": "0 1"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        n = random.randint(2, 50)
        nums = [random.randint(1, 100) for _ in range(n)]
        i, j = random.sample(range(n), 2)
        target = nums[i] + nums[j]
        
        # solver
        seen = {}
        ans = []
        for idx, val in enumerate(nums):
            if target - val in seen:
                ans = [seen[target - val], idx]
                break
            seen[val] = idx
            
        hidden.append({"input": " ".join(map(str, nums)) + f"\n{target}", "output": " ".join(map(str, ans))})
        
    save_problem("two_sum_extended", {
        "id": "two_sum_extended",
        "title": "Two Sum Extended",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "input_format": "First line: space-separated integers. Second line: integer target.",
        "output_format": "Space-separated indices.",
        "constraints": {"nums.length": "2 <= nums.length <= 10^4"},
        "difficulty": "easy",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

# 20. Three Sum
def gen_three_sum():
    samples = [
        {"input": "-1 0 1 2 -1 -4", "output": "-1 -1 2\n-1 0 1"},
        {"input": "0 1 1", "output": ""},
        {"input": "0 0 0", "output": "0 0 0"}
    ]
    hidden = []
    for _ in range(random.randint(100, 120)):
        n = random.randint(3, 30)
        nums = [random.randint(-20, 20) for _ in range(n)]
        
        # solver
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i-1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s < 0:
                    l += 1
                elif s > 0:
                    r -= 1
                else:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l+1]: l += 1
                    while l < r and nums[r] == nums[r-1]: r -= 1
                    l += 1
                    r -= 1
                    
        out = "\n".join([" ".join(map(str, r)) for r in res])
        
        hidden.append({"input": " ".join(map(str, nums)), "output": out})
        
    save_problem("three_sum_extended", {
        "id": "three_sum_extended",
        "title": "3Sum Extended",
        "description": "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. Notice that the solution set must not contain duplicate triplets.",
        "input_format": "Space-separated integers.",
        "output_format": "Each triplet on a newline, space-separated.",
        "constraints": {"nums.length": "3 <= nums.length <= 3000"},
        "difficulty": "medium",
        "judge_mode": "str_compare_strip",
        "time_limit": 1,
        "sample_test_cases": samples,
        "hidden_test_cases": hidden
    })

if __name__ == "__main__":
    gen_first_unique_character()
    gen_excel_sheet_column_number()
    gen_excel_sheet_column_title()
    gen_valid_palindrome_ii()
    gen_reverse_vowels_of_a_string()
    gen_ransom_note()
    gen_find_all_anagrams_in_a_string()
    gen_permutation_in_string()
    gen_find_the_difference()
    gen_longest_repeating_character_replacement()
    gen_reverse_string()
    gen_length_of_last_word()
    gen_isomorphic_strings()
    gen_add_strings()
    gen_to_lower_case()
    gen_is_anagram()
    gen_merge_intervals()
    gen_insert_interval()
    gen_two_sum()
    gen_three_sum()
    print("Done generating 20 new problems.")

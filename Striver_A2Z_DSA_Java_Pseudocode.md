# Striver's A2Z DSA Sheet — Complete Java Pseudocode Reference

> **Source structure:** [takeuforward.org — Strivers A2Z Sheet](https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z) — 18 steps, 474 problems (152 Easy / 186 Medium / 136 Hard).
>
> **How to use this file:** Every entry has a *name*, a one-line *problem summary*, and the **core logic function only** in Java-flavoured pseudocode. No imports, no classes, no `main()`, no I/O, no test harness. Helper functions appear only when the algorithm is meaningless without them (e.g. `dfs`, `solve`, `merge`).
>
> **Conventions used throughout**
> - `n = arr.length` is assumed available unless stated.
> - `for i in 0..n-1` means `for (int i = 0; i < n; i++)`.
> - `map`, `set`, `pq`, `st`, `q`, `dq` = HashMap, HashSet, PriorityQueue, Stack, Queue, Deque.
> - `Node { int val; Node next; }`, `TreeNode { int val; TreeNode left, right; }` are assumed.
> - `// TC:` time complexity, `// SC:` space complexity.
> - **[OPTIMAL]** marks the solution given. **[ALT]** notes a materially different brute/better approach.

---

## Table of Contents

| # | Step | Problems |
|---|------|----------|
| 1 | [Learn the Basics](#step-1--learn-the-basics) | 54 |
| 2 | [Important Sorting Techniques](#step-2--important-sorting-techniques) | 7 |
| 3 | [Arrays (Easy → Medium → Hard)](#step-3--arrays) | 40 |
| 4 | [Binary Search (1D, 2D, Search Space)](#step-4--binary-search) | 32 |
| 5 | [Strings (Basic & Medium)](#step-5--strings-basic--medium) | 15 |
| 6 | [Linked List (Single, Double, Medium, Hard)](#step-6--linked-list) | 31 |
| 7 | [Recursion (Pattern-wise)](#step-7--recursion-patternwise) | 25 |
| 8 | [Bit Manipulation](#step-8--bit-manipulation) | 18 |
| 9 | [Stack & Queues](#step-9--stack--queues) | 30 |
| 10 | [Sliding Window & Two Pointer](#step-10--sliding-window--two-pointer) | 12 |
| 11 | [Heaps](#step-11--heaps) | 17 |
| 12 | [Greedy Algorithms](#step-12--greedy-algorithms) | 15 |
| 13 | [Binary Trees](#step-13--binary-trees) | 38 |
| 14 | [Binary Search Trees](#step-14--binary-search-trees) | 16 |
| 15 | [Graphs](#step-15--graphs) | 53 |
| 16 | [Dynamic Programming](#step-16--dynamic-programming) | 55 |
| 17 | [Tries](#step-17--tries) | 7 |
| 18 | [Strings (Advanced / Pattern Matching)](#step-18--strings-advanced) | 9 |

---

# Step 1 — Learn the Basics

## 1.1 Language & Complexity Fundamentals *(9 items — conceptual)*

These sheet items are language warm-ups, not algorithms. Condensed reference:

| Item | Key takeaway |
|------|--------------|
| User Input / Output | `Scanner` / `BufferedReader`; prefer `BufferedReader` for large input. |
| Data Types | `int` 4B (±2.1e9), `long` 8B (±9.2e18), `char` 2B, `double` 8B. Overflow → use `long`. |
| If-Else | Ternary `cond ? a : b` for one-liners. |
| Switch Case | `switch(x){ case 1: ...; break; default: }`; fall-through if `break` omitted. |
| Arrays | `int[] a = new int[n];` fixed size, 0-indexed, contiguous, O(1) access. |
| Strings | Immutable in Java. Use `StringBuilder` for O(1) amortised append. |
| For Loops | `for(init; cond; update)`; nested loops multiply complexity. |
| While Loops | Use when iteration count is unknown; guard against infinite loops. |
| Functions | Pass-by-value for primitives, pass-by-reference-value for objects. |
| **Time & Space Complexity** | Drop constants & lower-order terms. ~10^8 ops/sec budget. Recursion costs O(depth) stack. |

---

## 1.2 Build-up Logical Thinking — Pattern Problems *(22 problems)*

All 22 patterns share one skeleton: an outer loop over rows, one or more inner loops emitting characters. Only the *bounds* change.

```java
// Universal pattern skeleton — TC: O(n^2), SC: O(1)
void pattern(int n) {
    for (int i = 0; i < n; i++) {          // rows
        for (int j = 0; j < <colBound(i)>; j++)   // columns
            print(<charFor(i, j)>);
        newLine();
    }
}
```

| # | Pattern | Row `i` (0-indexed) emits |
|---|---------|---------------------------|
| 1 | Rectangular star `n x n` | `n` stars |
| 2 | Right-angled triangle | `i+1` stars |
| 3 | Numbered triangle | numbers `1..i+1` |
| 4 | Repeated-number triangle | `(i+1)` repeated `i+1` times |
| 5 | Inverted right triangle | `n-i` stars |
| 6 | Inverted numbered triangle | numbers `1..n-i` |
| 7 | Star pyramid | `n-i-1` spaces, `2i+1` stars, `n-i-1` spaces |
| 8 | Inverted pyramid | `i` spaces, `2(n-i)-1` stars, `i` spaces |
| 9 | Diamond | pattern 7 then pattern 8 |
| 10 | Half-diamond (arrow) | `i<n ? i+1 : 2n-i-1` stars |
| 11 | Binary triangle | start = `i%2==0 ? 1 : 0`, then alternate |
| 12 | Number-crown | `i+1` numbers asc, `2(n-i-1)` spaces, `i+1` numbers desc |
| 13 | Continuous numbered triangle | running counter, `i+1` values |
| 14 | Letter triangle | `A .. A+i` |
| 15 | Inverted letter triangle | `A .. A+(n-i-1)` |
| 16 | Repeated letter triangle | `(char)('A'+i)` repeated `i+1` times |
| 17 | Alpha-hill | `n-i-1` spaces, letters up to `A+i` then back down |
| 18 | Reverse-letter triangle | letters `A+n-i-1 .. A+n-1` |
| 19 | Symmetric butterfly (void) | `n-i` stars, `2i` spaces, `n-i` stars; then mirror |
| 20 | Symmetric butterfly (solid) | `i+1` stars, `2(n-i-1)` spaces, `i+1` stars; then mirror |
| 21 | Hollow rectangle | star if `i==0 \|\| i==n-1 \|\| j==0 \|\| j==n-1` else space |
| 22 | Concentric-number square | `value = n - min(min(i,j), min(2n-2-i, 2n-2-j))` on a `(2n-1)` grid |

```java
// Pattern 22 core (the only non-trivial one) — TC: O(n^2)
void concentricSquare(int n) {
    int side = 2 * n - 1;
    for (int i = 0; i < side; i++)
        for (int j = 0; j < side; j++) {
            int top = i, left = j, right = side - 1 - j, bottom = side - 1 - i;
            print(n - min(min(top, bottom), min(left, right)));
        }
}
```

---

## 1.3 Java Collections / STL Essentials *(1 item — conceptual)*

| Structure | Java | Key ops & complexity |
|-----------|------|----------------------|
| Dynamic array | `ArrayList<T>` | `add` O(1) amortised, `get` O(1) |
| Hash map / set | `HashMap`, `HashSet` | O(1) avg, O(n) worst |
| Ordered map / set | `TreeMap`, `TreeSet` | O(log n); `floorKey`, `ceilingKey`, `firstKey` |
| Stack | `ArrayDeque` (preferred) / `Stack` | `push/pop/peek` O(1) |
| Queue / Deque | `ArrayDeque`, `LinkedList` | `offer/poll` O(1) |
| Heap | `PriorityQueue<T>` | `offer/poll` O(log n), `peek` O(1) |
| Pair | `int[]{a,b}` or custom class | — |
| Sorting | `Arrays.sort`, `Collections.sort`, `Comparator` | O(n log n) |

---

## 1.4 Basic Maths *(7 problems)*

### 1. Count Digits
Count digits of `n`; variant: count digits that evenly divide `n`.
```java
// TC: O(log10 n), SC: O(1)
int countDigits(int n) {
    if (n == 0) return 1;
    int cnt = 0;
    while (n > 0) { cnt++; n /= 10; }
    return cnt;                       // [ALT] (int)(Math.log10(n)) + 1
}
```

### 2. Reverse a Number
Return digit-reversed integer; return 0 on 32-bit overflow.
```java
// TC: O(log10 n), SC: O(1)
int reverse(int n) {
    long rev = 0;
    int sign = n < 0 ? -1 : 1; n = abs(n);
    while (n > 0) {
        rev = rev * 10 + n % 10;
        if (rev > INT_MAX) return 0;   // overflow guard
        n /= 10;
    }
    return (int)(sign * rev);
}
```

### 3. Check Palindrome Number
Is the number the same read backwards?
```java
// TC: O(log10 n), SC: O(1)
boolean isPalindrome(int n) {
    if (n < 0) return false;
    int rev = 0, temp = n;
    while (temp > 0) { rev = rev * 10 + temp % 10; temp /= 10; }
    return rev == n;
}
```

### 4. GCD / HCF
Greatest common divisor of a and b.
```java
// Euclidean algorithm — TC: O(log(min(a,b))), SC: O(1)
int gcd(int a, int b) {
    while (b != 0) { int t = b; b = a % b; a = t; }
    return a;                          // lcm(a,b) = a / gcd(a,b) * b
}
// [ALT] brute: loop i from min(a,b) down to 1 → O(min(a,b))
```

### 5. Armstrong Number
Sum of each digit raised to (number of digits) equals the number.
```java
// TC: O(d * log d), SC: O(1)
boolean isArmstrong(int n) {
    int d = countDigits(n), sum = 0, t = n;
    while (t > 0) { int dig = t % 10; sum += pow(dig, d); t /= 10; }
    return sum == n;
}
```

### 6. Print All Divisors
List every divisor of n.
```java
// TC: O(sqrt(n) + k log k), SC: O(k)
List<Integer> divisors(int n) {
    list = []
    for (int i = 1; i * i <= n; i++)
        if (n % i == 0) {
            list.add(i);
            if (i != n / i) list.add(n / i);   // pair divisor, avoid dup on perfect square
        }
    sort(list);
    return list;
}
```

### 7. Check for Prime
Is n prime?
```java
// TC: O(sqrt(n)), SC: O(1)
boolean isPrime(int n) {
    if (n <= 1) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}
```

---

## 1.5 Basic Recursion *(9 problems)*

### 1. Recursion Introduction — Print something N times
```java
// Every recursion = base case + smaller subproblem. TC: O(n), SC: O(n) stack
void f(int i, int n) {
    if (i > n) return;               // base case
    print("Name");
    f(i + 1, n);                     // recursive call on smaller problem
}
```

### 2. Print Name N Times
```java
void printName(int i, int n) {
    if (i > n) return;
    print("Name");
    printName(i + 1, n);
}
```

### 3. Print 1 to N (linear recursion)
```java
void printAsc(int i, int n) {
    if (i > n) return;
    print(i);
    printAsc(i + 1, n);
}
// Backtracking variant: call first, then print → prints N..1
```

### 4. Print N to 1
```java
void printDesc(int i) {
    if (i < 1) return;
    print(i);
    printDesc(i - 1);
}
```

### 5. Sum of First N Numbers
```java
// Functional style — TC: O(n), SC: O(n)
int sumN(int n) {
    if (n == 0) return 0;
    return n + sumN(n - 1);
}
// Parameterised style: void sum(int i, int acc) { if(i<1){print(acc);return;} sum(i-1, acc+i); }
```

### 6. Factorial of N
```java
long fact(int n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
}
```

### 7. Reverse an Array (recursively)
```java
// TC: O(n), SC: O(n) stack — two-pointer swap
void reverse(int[] a, int l, int r) {
    if (l >= r) return;
    swap(a, l, r);
    reverse(a, l + 1, r - 1);
}
```

### 8. Check String Palindrome (recursively)
```java
boolean isPal(String s, int i) {
    int n = s.length();
    if (i >= n / 2) return true;
    if (s.charAt(i) != s.charAt(n - 1 - i)) return false;
    return isPal(s, i + 1);
}
```

### 9. Multiple Recursion Calls — Fibonacci
```java
// Naive — TC: O(2^n). Memoise for O(n).
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
```

---

## 1.6 Basic Hashing *(6 problems)*

### 1. Hashing Theory — Number Hashing (pre-computation)
```java
// TC: O(n) build + O(1) per query, SC: O(maxValue)
int[] buildHash(int[] a, int maxValue) {
    int[] hash = new int[maxValue + 1];
    for (int x : a) hash[x]++;
    return hash;                     // query: hash[q]
}
```

### 2. Character Hashing
```java
// SC: O(26) for lowercase, O(256) for all ASCII
int[] charHash(String s) {
    int[] hash = new int[26];
    for (char c : s.toCharArray()) hash[c - 'a']++;
    return hash;
}
```

### 3. Hashing with Map (large / negative values)
```java
// TC: O(n) avg, O(n log n) if TreeMap; SC: O(n)
Map<Integer,Integer> freqMap(int[] a) {
    map = new HashMap<>();
    for (int x : a) map.put(x, map.getOrDefault(x, 0) + 1);
    return map;
}
```

### 4. Count Frequency of Each Element
```java
// TC: O(n), SC: O(n)
void countFrequency(int[] a) {
    map = freqMap(a);
    for (entry in map) print(entry.key, entry.value);
}
```

### 5. Find Highest & Lowest Frequency Element
```java
// TC: O(n), SC: O(n)
int[] highestLowestFreq(int[] a) {
    map = freqMap(a);
    int maxEl = 0, minEl = 0, maxF = 0, minF = INT_MAX;
    for (entry in map) {
        if (entry.value > maxF) { maxF = entry.value; maxEl = entry.key; }
        if (entry.value < minF) { minF = entry.value; minEl = entry.key; }
    }
    return new int[]{maxEl, minEl};
}
```

### 6. Division & Modulo Hashing Concept (collision handling)
```java
// Collisions resolved by chaining (LinkedList per bucket) or open addressing.
// Java HashMap: index = (n - 1) & hash(key); chaining → red-black tree after 8 collisions.
int bucketIndex(int key, int capacity) { return key % capacity; }
```

---

# Step 2 — Important Sorting Techniques

### 1. Selection Sort
Repeatedly pick the minimum from the unsorted suffix and place it at the front.
```java
// TC: O(n^2) always, SC: O(1). Not stable. Minimum number of swaps: n-1.
void selectionSort(int[] a) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[min]) min = j;
        swap(a, i, min);
    }
}
```

### 2. Bubble Sort
Repeatedly swap adjacent out-of-order pairs; largest bubbles to the end each pass.
```java
// TC: O(n^2) worst, O(n) best (already sorted, thanks to swapped flag). SC: O(1). Stable.
void bubbleSort(int[] a) {
    for (int i = n - 1; i >= 1; i--) {
        boolean swapped = false;
        for (int j = 0; j < i; j++)
            if (a[j] > a[j + 1]) { swap(a, j, j + 1); swapped = true; }
        if (!swapped) break;              // early exit optimisation
    }
}
```

### 3. Insertion Sort
Insert each element into its correct position within the sorted prefix.
```java
// TC: O(n^2) worst, O(n) best. SC: O(1). Stable. Great for nearly-sorted / small arrays.
void insertionSort(int[] a) {
    for (int i = 1; i < n; i++) {
        int j = i;
        while (j > 0 && a[j - 1] > a[j]) { swap(a, j, j - 1); j--; }
    }
}
```

### 4. Merge Sort
Divide array in half, sort each, merge the two sorted halves.
```java
// TC: O(n log n) always, SC: O(n). Stable. Divide & conquer.
void mergeSort(int[] a, int low, int high) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSort(a, low, mid);
    mergeSort(a, mid + 1, high);
    merge(a, low, mid, high);
}

void merge(int[] a, int low, int mid, int high) {
    temp = [];
    int left = low, right = mid + 1;
    while (left <= mid && right <= high)
        temp.add(a[left] <= a[right] ? a[left++] : a[right++]);   // <= keeps it stable
    while (left <= mid)  temp.add(a[left++]);
    while (right <= high) temp.add(a[right++]);
    copy temp back into a[low..high];
}
```

### 5. Recursive Bubble Sort
```java
// TC: O(n^2), SC: O(n) stack
void recBubble(int[] a, int n) {
    if (n == 1) return;
    boolean swapped = false;
    for (int j = 0; j < n - 1; j++)
        if (a[j] > a[j + 1]) { swap(a, j, j + 1); swapped = true; }
    if (!swapped) return;
    recBubble(a, n - 1);
}
```

### 6. Recursive Insertion Sort
```java
// TC: O(n^2), SC: O(n) stack
void recInsertion(int[] a, int i, int n) {
    if (i == n) return;
    int j = i;
    while (j > 0 && a[j - 1] > a[j]) { swap(a, j, j - 1); j--; }
    recInsertion(a, i + 1, n);
}
```

### 7. Quick Sort
Pick a pivot, partition so smaller elements go left and larger go right, recurse.
```java
// TC: O(n log n) avg, O(n^2) worst (sorted input + first-element pivot). SC: O(log n) stack. In-place, not stable.
void quickSort(int[] a, int low, int high) {
    if (low >= high) return;
    int p = partition(a, low, high);
    quickSort(a, low, p - 1);
    quickSort(a, p + 1, high);
}

int partition(int[] a, int low, int high) {
    int pivot = a[low], i = low, j = high;
    while (i < j) {
        while (i <= high - 1 && a[i] <= pivot) i++;    // find element > pivot from left
        while (j >= low + 1 && a[j] > pivot)  j--;     // find element <= pivot from right
        if (i < j) swap(a, i, j);
    }
    swap(a, low, j);                                   // place pivot at its sorted index
    return j;
}
// [ALT] Lomuto partition with random pivot avoids the sorted-array worst case.
```

---

# Step 3 — Arrays

## 3.1 Easy *(14 problems)*

### 1. Largest Element in Array
Return the maximum value.
```java
// TC: O(n), SC: O(1)
int largest(int[] a) {
    int max = a[0];
    for (int i = 1; i < n; i++) max = Math.max(max, a[i]);
    return max;
}
```

### 2. Second Largest Element (without sorting)
Return second-largest distinct value, -1 if none.
```java
// [OPTIMAL] single pass — TC: O(n), SC: O(1)
int secondLargest(int[] a) {
    int large = INT_MIN, second = INT_MIN;
    for (int x : a) {
        if (x > large) { second = large; large = x; }
        else if (x < large && x > second) second = x;   // strict < keeps duplicates out
    }
    return second == INT_MIN ? -1 : second;
}
// [ALT] sort then scan backwards for first value < a[n-1] → O(n log n)
```

### 3. Check if Array is Sorted (and rotated)
Return true if the array is non-decreasing (variant: sorted then rotated).
```java
// TC: O(n), SC: O(1)
boolean isSorted(int[] a) {
    for (int i = 1; i < n; i++) if (a[i] < a[i - 1]) return false;
    return true;
}

boolean isSortedAndRotated(int[] a) {
    int breaks = 0;
    for (int i = 0; i < n; i++)
        if (a[i] > a[(i + 1) % n]) breaks++;    // at most one "drop" allowed in a rotation
    return breaks <= 1;
}
```

### 4. Remove Duplicates from Sorted Array (in place)
Return new length k; first k elements are unique.
```java
// Two pointers — TC: O(n), SC: O(1)
int removeDuplicates(int[] a) {
    int i = 0;                        // i = last index of the unique region
    for (int j = 1; j < n; j++)
        if (a[j] != a[i]) a[++i] = a[j];
    return i + 1;
}
```

### 5. Left Rotate Array by One
```java
// TC: O(n), SC: O(1)
void rotateByOne(int[] a) {
    int first = a[0];
    for (int i = 1; i < n; i++) a[i - 1] = a[i];
    a[n - 1] = first;
}
```

### 6. Left Rotate Array by D Places
```java
// [OPTIMAL] reversal algorithm — TC: O(n), SC: O(1)
void rotateLeft(int[] a, int d) {
    d = d % n;
    reverse(a, 0, d - 1);       // reverse first d
    reverse(a, d, n - 1);       // reverse remaining
    reverse(a, 0, n - 1);       // reverse whole
}
// Right rotate: reverse(0,n-1); reverse(0,d-1); reverse(d,n-1)
// [ALT] temp array of size d → O(n) time, O(d) space
```

### 7. Move Zeroes to End
Preserve relative order of non-zeroes.
```java
// [OPTIMAL] two pointers, single pass — TC: O(n), SC: O(1)
void moveZeroes(int[] a) {
    int j = -1;
    for (int i = 0; i < n; i++) if (a[i] == 0) { j = i; break; }   // first zero
    if (j == -1) return;
    for (int i = j + 1; i < n; i++)
        if (a[i] != 0) { swap(a, i, j); j++; }
}
```

### 8. Linear Search
```java
// TC: O(n), SC: O(1)
int search(int[] a, int target) {
    for (int i = 0; i < n; i++) if (a[i] == target) return i;
    return -1;
}
```

### 9. Union of Two Sorted Arrays
Sorted array of all distinct elements from both.
```java
// [OPTIMAL] two pointers — TC: O(n+m), SC: O(1) extra (excluding answer)
List<Integer> union(int[] a, int[] b) {
    int i = 0, j = 0; res = [];
    while (i < n && j < m) {
        if (a[i] <= b[j]) { if (res.isEmpty() || res.last() != a[i]) res.add(a[i]); i++; }
        else              { if (res.isEmpty() || res.last() != b[j]) res.add(b[j]); j++; }
    }
    while (i < n) { if (res.last() != a[i]) res.add(a[i]); i++; }
    while (j < m) { if (res.last() != b[j]) res.add(b[j]); j++; }
    return res;
}

// Intersection variant
List<Integer> intersection(int[] a, int[] b) {
    int i = 0, j = 0; res = [];
    while (i < n && j < m) {
        if (a[i] < b[j]) i++;
        else if (a[i] > b[j]) j++;
        else { res.add(a[i]); i++; j++; }
    }
    return res;
}
```

### 10. Find Missing Number (0..n, one missing)
```java
// [OPTIMAL] XOR — TC: O(n), SC: O(1). No overflow risk.
int missingNumber(int[] a) {
    int xor = 0;
    for (int i = 0; i < n; i++) xor ^= a[i] ^ (i + 1);   // pairs cancel out
    return xor;
}
// [ALT] sum formula: n*(n+1)/2 - sum(a) — risk of overflow for large n
```

### 11. Maximum Consecutive Ones
```java
// TC: O(n), SC: O(1)
int findMaxConsecutiveOnes(int[] a) {
    int cnt = 0, max = 0;
    for (int x : a) { cnt = (x == 1) ? cnt + 1 : 0; max = Math.max(max, cnt); }
    return max;
}
```

### 12. Find the Number Appearing Once (all others twice)
```java
// [OPTIMAL] XOR — TC: O(n), SC: O(1)
int singleNumber(int[] a) {
    int xor = 0;
    for (int x : a) xor ^= x;      // x ^ x = 0, x ^ 0 = x
    return xor;
}
```

### 13. Longest Subarray with Sum K (positives only)
```java
// [OPTIMAL] sliding window (works because all elements > 0) — TC: O(2n), SC: O(1)
int longestSubarrayPositive(int[] a, long k) {
    int l = 0, r = 0, maxLen = 0; long sum = 0;
    while (r < n) {
        sum += a[r];
        while (l <= r && sum > k) sum -= a[l++];    // shrink from left
        if (sum == k) maxLen = Math.max(maxLen, r - l + 1);
        r++;
    }
    return maxLen;
}
```

### 14. Longest Subarray with Sum K (positives + negatives)
```java
// [OPTIMAL] prefix-sum hashmap — TC: O(n), SC: O(n)
int longestSubarray(int[] a, long k) {
    map = new HashMap<Long,Integer>();   // prefixSum -> earliest index
    long sum = 0; int maxLen = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i];
        if (sum == k) maxLen = i + 1;
        if (map.containsKey(sum - k)) maxLen = Math.max(maxLen, i - map.get(sum - k));
        map.putIfAbsent(sum, i);         // keep EARLIEST index for longest length
    }
    return maxLen;
}
```

---

## 3.2 Medium *(14 problems)*

### 15. Two Sum
Indices of two numbers summing to target.
```java
// [OPTIMAL] hashmap — TC: O(n), SC: O(n)
int[] twoSum(int[] a, int target) {
    map = new HashMap<Integer,Integer>();      // value -> index
    for (int i = 0; i < n; i++) {
        int need = target - a[i];
        if (map.containsKey(need)) return new int[]{map.get(need), i};
        map.put(a[i], i);
    }
    return new int[]{-1, -1};
}
// [ALT] if only "does it exist": sort + two pointers → O(n log n) time, O(1) space
```

### 16. Sort an Array of 0s, 1s and 2s
```java
// [OPTIMAL] Dutch National Flag — TC: O(n) single pass, SC: O(1)
void sortColors(int[] a) {
    int low = 0, mid = 0, high = n - 1;
    // invariant: [0,low-1]=0, [low,mid-1]=1, [high+1,n-1]=2, [mid,high]=unknown
    while (mid <= high) {
        if (a[mid] == 0)      { swap(a, low++, mid++); }
        else if (a[mid] == 1) { mid++; }
        else                  { swap(a, mid, high--); }   // don't advance mid
    }
}
// [ALT] counting sort (two passes) → O(2n)
```

### 17. Majority Element (> n/2)
```java
// [OPTIMAL] Boyer–Moore voting — TC: O(n), SC: O(1)
int majorityElement(int[] a) {
    int count = 0, candidate = 0;
    for (int x : a) {
        if (count == 0) { candidate = x; count = 1; }
        else count += (x == candidate) ? 1 : -1;
    }
    // verify if existence is not guaranteed
    return candidate;
}
```

### 18. Maximum Subarray Sum (Kadane's Algorithm)
```java
// [OPTIMAL] TC: O(n), SC: O(1)
long maxSubArray(int[] a) {
    long sum = 0, max = INT_MIN;
    for (int x : a) {
        sum += x;
        max = Math.max(max, sum);
        if (sum < 0) sum = 0;            // a negative prefix never helps
    }
    return max;    // if empty subarray allowed: max = Math.max(max, 0)
}
```

### 19. Print Subarray with Maximum Sum
```java
// Kadane + index tracking — TC: O(n), SC: O(1)
int[] maxSubArrayIndices(int[] a) {
    long sum = 0, max = INT_MIN;
    int start = 0, ansL = -1, ansR = -1;
    for (int i = 0; i < n; i++) {
        if (sum == 0) start = i;         // potential new window start
        sum += a[i];
        if (sum > max) { max = sum; ansL = start; ansR = i; }
        if (sum < 0) sum = 0;
    }
    return new int[]{ansL, ansR};
}
```

### 20. Stock Buy and Sell (single transaction)
```java
// TC: O(n), SC: O(1)
int maxProfit(int[] prices) {
    int minPrice = prices[0], profit = 0;
    for (int i = 1; i < n; i++) {
        profit = Math.max(profit, prices[i] - minPrice);
        minPrice = Math.min(minPrice, prices[i]);
    }
    return profit;
}
```

### 21. Rearrange Array Elements by Sign
Alternate positive/negative starting with positive.
```java
// Variant A: equal counts — TC: O(n), SC: O(n)
int[] rearrange(int[] a) {
    int[] res = new int[n];
    int pos = 0, neg = 1;
    for (int x : a) {
        if (x > 0) { res[pos] = x; pos += 2; }
        else       { res[neg] = x; neg += 2; }
    }
    return res;
}
// Variant B: unequal counts — collect pos[] and neg[], interleave min(p,q) pairs,
// then append the leftovers of the larger list in order. TC: O(2n), SC: O(n)
```

### 22. Next Permutation
Rearrange to the lexicographically next greater permutation, in place.
```java
// [OPTIMAL] TC: O(3n), SC: O(1)
void nextPermutation(int[] a) {
    int idx = -1;
    for (int i = n - 2; i >= 0; i--)                 // 1) find first dip from the right
        if (a[i] < a[i + 1]) { idx = i; break; }
    if (idx == -1) { reverse(a, 0, n - 1); return; } // already the largest → smallest
    for (int i = n - 1; i > idx; i--)                // 2) find rightmost element > a[idx]
        if (a[i] > a[idx]) { swap(a, i, idx); break; }
    reverse(a, idx + 1, n - 1);                      // 3) make the suffix smallest
}
```

### 23. Leaders in an Array
Elements greater than everything to their right.
```java
// [OPTIMAL] scan right to left — TC: O(n), SC: O(1)
List<Integer> leaders(int[] a) {
    res = []; int max = INT_MIN;
    for (int i = n - 1; i >= 0; i--)
        if (a[i] > max) { res.add(a[i]); max = a[i]; }
    reverse(res);
    return res;
}
```

### 24. Longest Consecutive Sequence
Length of the longest run of consecutive integers (unsorted).
```java
// [OPTIMAL] hash set — TC: O(n) amortised, SC: O(n)
int longestConsecutive(int[] a) {
    set = new HashSet<>(a);
    int best = 0;
    for (int x : set) {
        if (set.contains(x - 1)) continue;       // only start counting at a sequence head
        int cur = x, len = 1;
        while (set.contains(cur + 1)) { cur++; len++; }
        best = Math.max(best, len);
    }
    return best;
}
// [ALT] sort then linear scan → O(n log n), O(1) space
```

### 25. Set Matrix Zeroes
If an element is 0, set its entire row and column to 0.
```java
// [OPTIMAL] use row 0 and col 0 as markers — TC: O(2*m*n), SC: O(1)
void setZeroes(int[][] mat) {
    int col0 = 1;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (mat[i][j] == 0) {
                mat[i][0] = 0;
                if (j == 0) col0 = 0; else mat[0][j] = 0;
            }
    for (int i = m - 1; i >= 0; i--)              // fill bottom-up, right-to-left
        for (int j = n - 1; j >= 1; j--)
            if (mat[i][0] == 0 || mat[0][j] == 0) mat[i][j] = 0;
    if (mat[0][0] == 0) for (int j = 0; j < n; j++) mat[0][j] = 0;
    if (col0 == 0)      for (int i = 0; i < m; i++) mat[i][0] = 0;
}
// [ALT] two boolean arrays row[m], col[n] → O(m+n) space
```

### 26. Rotate Matrix by 90 Degrees (clockwise)
```java
// [OPTIMAL] transpose + reverse each row — TC: O(n^2), SC: O(1)
void rotate(int[][] mat) {
    for (int i = 0; i < n - 1; i++)
        for (int j = i + 1; j < n; j++) swap(mat[i][j], mat[j][i]);   // transpose
    for (int i = 0; i < n; i++) reverse(mat[i]);
}
// Anticlockwise: transpose then reverse columns (i.e. reverse row order).
```

### 27. Print Matrix in Spiral Order
```java
// TC: O(m*n), SC: O(1) extra
List<Integer> spiralOrder(int[][] mat) {
    res = []; int top = 0, bottom = m - 1, left = 0, right = n - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) res.add(mat[top][j]);       top++;
        for (int i = top; i <= bottom; i++) res.add(mat[i][right]);     right--;
        if (top <= bottom) { for (int j = right; j >= left; j--) res.add(mat[bottom][j]); bottom--; }
        if (left <= right) { for (int i = bottom; i >= top; i--) res.add(mat[i][left]);   left++; }
    }
    return res;
}
```

### 28. Count Subarrays with Given Sum K
```java
// [OPTIMAL] prefix sum + map of counts — TC: O(n), SC: O(n)
int subarraySum(int[] a, int k) {
    map = new HashMap<Integer,Integer>();
    map.put(0, 1);                       // empty prefix
    int sum = 0, count = 0;
    for (int x : a) {
        sum += x;
        count += map.getOrDefault(sum - k, 0);
        map.merge(sum, 1, Integer::sum);
    }
    return count;
}
```

---

## 3.3 Hard *(12 problems)*

### 29. Pascal's Triangle
Three variants: (a) element at (r,c), (b) print nth row, (c) print full triangle.
```java
// (a) nCr — TC: O(r), SC: O(1)
long element(int r, int c) { return nCr(r - 1, c - 1); }

long nCr(int n, int r) {
    long res = 1;
    for (int i = 0; i < r; i++) { res = res * (n - i); res = res / (i + 1); }
    return res;
}

// (b) nth row without recomputing nCr each time — TC: O(n), SC: O(1)
List<Long> row(int n) {
    res = [1]; long ans = 1;
    for (int i = 1; i < n; i++) { ans = ans * (n - i) / i; res.add(ans); }
    return res;
}

// (c) whole triangle — TC: O(n^2)
List<List<Long>> generate(int n) {
    for (int i = 1; i <= n; i++) out.add(row(i));
    return out;
}
```

### 30. Majority Elements (> n/3)
At most two such elements can exist.
```java
// [OPTIMAL] extended Boyer–Moore — TC: O(2n), SC: O(1)
List<Integer> majorityTwo(int[] a) {
    int c1 = 0, c2 = 0, e1 = INT_MIN, e2 = INT_MIN;
    for (int x : a) {
        if (c1 == 0 && x != e2) { c1 = 1; e1 = x; }
        else if (c2 == 0 && x != e1) { c2 = 1; e2 = x; }
        else if (x == e1) c1++;
        else if (x == e2) c2++;
        else { c1--; c2--; }
    }
    res = [];                              // verification pass is mandatory
    cnt1 = count(a, e1); cnt2 = count(a, e2);
    if (cnt1 > n / 3) res.add(e1);
    if (e2 != e1 && cnt2 > n / 3) res.add(e2);
    return res;
}
```

### 31. 3-Sum (unique triplets summing to 0)
```java
// [OPTIMAL] sort + two pointers — TC: O(n^2), SC: O(1) excluding output
List<List<Integer>> threeSum(int[] a) {
    sort(a); res = [];
    for (int i = 0; i < n; i++) {
        if (i > 0 && a[i] == a[i - 1]) continue;        // skip duplicate first element
        int j = i + 1, k = n - 1;
        while (j < k) {
            int sum = a[i] + a[j] + a[k];
            if (sum < 0) j++;
            else if (sum > 0) k--;
            else {
                res.add([a[i], a[j], a[k]]); j++; k--;
                while (j < k && a[j] == a[j - 1]) j++;   // skip duplicates
                while (j < k && a[k] == a[k + 1]) k--;
            }
        }
    }
    return res;
}
```

### 32. 4-Sum (unique quadruplets summing to target)
```java
// [OPTIMAL] sort + two nested loops + two pointers — TC: O(n^3), SC: O(1) extra
List<List<Integer>> fourSum(int[] a, int target) {
    sort(a); res = [];
    for (int i = 0; i < n; i++) {
        if (i > 0 && a[i] == a[i - 1]) continue;
        for (int j = i + 1; j < n; j++) {
            if (j > i + 1 && a[j] == a[j - 1]) continue;
            int k = j + 1, l = n - 1;
            while (k < l) {
                long sum = (long)a[i] + a[j] + a[k] + a[l];   // long avoids overflow
                if (sum < target) k++;
                else if (sum > target) l--;
                else {
                    res.add([a[i], a[j], a[k], a[l]]); k++; l--;
                    while (k < l && a[k] == a[k - 1]) k++;
                    while (k < l && a[l] == a[l + 1]) l--;
                }
            }
        }
    }
    return res;
}
```

### 33. Largest Subarray with Sum 0
```java
// [OPTIMAL] prefix sum + map — TC: O(n), SC: O(n)
int maxLen(int[] a) {
    map = new HashMap<Integer,Integer>();   // prefixSum -> earliest index
    int sum = 0, best = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i];
        if (sum == 0) best = i + 1;
        else if (map.containsKey(sum)) best = Math.max(best, i - map.get(sum));
        else map.put(sum, i);
    }
    return best;
}
```

### 34. Count Subarrays with Given XOR K
```java
// [OPTIMAL] prefix XOR + map — TC: O(n), SC: O(n)
int subarraysWithXorK(int[] a, int k) {
    map = new HashMap<Integer,Integer>();
    map.put(0, 1);
    int xr = 0, count = 0;
    for (int x : a) {
        xr ^= x;
        count += map.getOrDefault(xr ^ k, 0);   // need prefix P with P ^ xr == k
        map.merge(xr, 1, Integer::sum);
    }
    return count;
}
```

### 35. Merge Overlapping Subintervals
```java
// [OPTIMAL] sort by start — TC: O(n log n + n), SC: O(n) output
int[][] merge(int[][] intervals) {
    sort(intervals by start);
    res = [];
    for (int[] iv : intervals) {
        if (res.isEmpty() || iv[0] > res.last()[1]) res.add(iv);   // no overlap
        else res.last()[1] = Math.max(res.last()[1], iv[1]);       // extend
    }
    return res;
}
```

### 36. Merge Two Sorted Arrays without Extra Space
```java
// [OPTIMAL] gap method (Shell-sort style) — TC: O(log(n+m) * (n+m)), SC: O(1)
void mergeNoExtra(int[] a, int[] b) {
    int len = n + m, gap = (len / 2) + (len % 2);
    while (gap > 0) {
        int left = 0, right = gap;
        while (right < len) {
            if (left < n && right >= n)      swapIf(a[left],  b[right - n]);
            else if (left >= n)              swapIf(b[left - n], b[right - n]);
            else                             swapIf(a[left],  a[right]);
            left++; right++;
        }
        if (gap == 1) break;
        gap = (gap / 2) + (gap % 2);
    }
}
// [ALT] two pointers from a's end and b's start, swap out-of-order pairs,
//       then sort both arrays → O(min(n,m) + n log n + m log m), O(1) space
```

### 37. Find the Repeating and Missing Number
Array of 1..n with one number repeated and one missing.
```java
// [OPTIMAL] maths — TC: O(n), SC: O(1)
int[] findMissingRepeating(int[] a) {
    long Sn  = (long)n * (n + 1) / 2;
    long S2n = (long)n * (n + 1) * (2L * n + 1) / 6;
    long S = 0, S2 = 0;
    for (int x : a) { S += x; S2 += (long)x * x; }
    long val1 = S - Sn;                    // x - y  (x = repeating, y = missing)
    long val2 = (S2 - S2n) / val1;         // x + y
    long x = (val1 + val2) / 2, y = x - val1;
    return new int[]{(int)x, (int)y};
}
// [ALT] XOR approach: xor all + all 1..n, isolate differing bit, split into two buckets → O(n), O(1)
```

### 38. Count Inversions
Pairs (i, j) with i < j and a[i] > a[j].
```java
// [OPTIMAL] merge sort — TC: O(n log n), SC: O(n)
long countInversions(int[] a, int low, int high) {
    if (low >= high) return 0;
    int mid = (low + high) / 2;
    long cnt = countInversions(a, low, mid) + countInversions(a, mid + 1, high);
    cnt += mergeAndCount(a, low, mid, high);
    return cnt;
}

long mergeAndCount(int[] a, int low, int mid, int high) {
    temp = []; int left = low, right = mid + 1; long cnt = 0;
    while (left <= mid && right <= high) {
        if (a[left] <= a[right]) temp.add(a[left++]);
        else { cnt += (mid - left + 1); temp.add(a[right++]); }  // all of a[left..mid] > a[right]
    }
    drain remaining; copy temp back;
    return cnt;
}
```

### 39. Reverse Pairs
Count pairs (i, j) with i < j and a[i] > 2 * a[j].
```java
// [OPTIMAL] merge sort with a separate counting pass — TC: O(2n log n), SC: O(n)
long reversePairs(int[] a, int low, int high) {
    if (low >= high) return 0;
    int mid = (low + high) / 2;
    long cnt = reversePairs(a, low, mid) + reversePairs(a, mid + 1, high);
    cnt += countPairs(a, low, mid, high);      // must run BEFORE merge
    merge(a, low, mid, high);
    return cnt;
}

long countPairs(int[] a, int low, int mid, int high) {
    int right = mid + 1; long cnt = 0;
    for (int i = low; i <= mid; i++) {
        while (right <= high && a[i] > 2L * a[right]) right++;
        cnt += (right - (mid + 1));            // right pointer never resets → O(n) total
    }
    return cnt;
}
```

### 40. Maximum Product Subarray
```java
// [OPTIMAL] prefix & suffix products — TC: O(n), SC: O(1)
int maxProduct(int[] a) {
    int pre = 1, suf = 1, best = INT_MIN;
    for (int i = 0; i < n; i++) {
        if (pre == 0) pre = 1;                 // reset after a zero
        if (suf == 0) suf = 1;
        pre *= a[i];
        suf *= a[n - 1 - i];
        best = Math.max(best, Math.max(pre, suf));
    }
    return best;
}
// Intuition: an even count of negatives → whole product; odd count → best is a prefix or a suffix.
// [ALT] track running max/min per index (Kadane-style) → O(n), O(1)
```

---

# Step 4 — Binary Search

## 4.1 BS on 1D Arrays *(13 problems)*

### 1. Binary Search to Find X
```java
// TC: O(log n), SC: O(1)
int binarySearch(int[] a, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;     // avoids int overflow
        if (a[mid] == target) return mid;
        if (a[mid] < target) low = mid + 1; else high = mid - 1;
    }
    return -1;
}
```

### 2. Implement Lower Bound
Smallest index with `a[i] >= x` (n if none).
```java
// TC: O(log n), SC: O(1)
int lowerBound(int[] a, int x) {
    int low = 0, high = n - 1, ans = n;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] >= x) { ans = mid; high = mid - 1; }   // candidate; look further left
        else low = mid + 1;
    }
    return ans;
}
```

### 3. Implement Upper Bound
Smallest index with `a[i] > x`.
```java
int upperBound(int[] a, int x) {
    int low = 0, high = n - 1, ans = n;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] > x) { ans = mid; high = mid - 1; }
        else low = mid + 1;
    }
    return ans;
}
```

### 4. Search Insert Position
Index where x is, or where it would be inserted → identical to lower bound.
```java
int searchInsert(int[] a, int x) { return lowerBound(a, x); }
```

### 5. Floor and Ceil in Sorted Array
Floor = largest `<= x`; Ceil = smallest `>= x`.
```java
// TC: O(log n), SC: O(1)
int[] floorCeil(int[] a, int x) {
    int low = 0, high = n - 1, floor = -1, ceil = -1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] == x) return new int[]{a[mid], a[mid]};
        if (a[mid] < x) { floor = a[mid]; low = mid + 1; }
        else            { ceil  = a[mid]; high = mid - 1; }
    }
    return new int[]{floor, ceil};
}
```

### 6. First and Last Occurrence
```java
// [OPTIMAL] TC: O(2 log n), SC: O(1)
int[] searchRange(int[] a, int x) {
    int first = lowerBound(a, x);
    if (first == n || a[first] != x) return new int[]{-1, -1};
    int last = upperBound(a, x) - 1;
    return new int[]{first, last};
}
```

### 7. Count Occurrences in Sorted Array
```java
int countOccurrences(int[] a, int x) {
    int[] r = searchRange(a, x);
    return r[0] == -1 ? 0 : r[1] - r[0] + 1;
}
```

### 8. Search in Rotated Sorted Array I (distinct elements)
```java
// [OPTIMAL] TC: O(log n), SC: O(1)
int search(int[] a, int k) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] == k) return mid;
        if (a[low] <= a[mid]) {                        // left half is sorted
            if (a[low] <= k && k < a[mid]) high = mid - 1; else low = mid + 1;
        } else {                                       // right half is sorted
            if (a[mid] < k && k <= a[high]) low = mid + 1; else high = mid - 1;
        }
    }
    return -1;
}
```

### 9. Search in Rotated Sorted Array II (duplicates allowed)
```java
// TC: O(log n) avg, O(n) worst (e.g. [3,3,3,1,3]). SC: O(1)
boolean searchII(int[] a, int k) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] == k) return true;
        if (a[low] == a[mid] && a[mid] == a[high]) { low++; high--; continue; }  // can't decide
        if (a[low] <= a[mid]) {
            if (a[low] <= k && k < a[mid]) high = mid - 1; else low = mid + 1;
        } else {
            if (a[mid] < k && k <= a[high]) low = mid + 1; else high = mid - 1;
        }
    }
    return false;
}
```

### 10. Minimum in Rotated Sorted Array
```java
// TC: O(log n), SC: O(1)
int findMin(int[] a) {
    int low = 0, high = n - 1, ans = INT_MAX;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[low] <= a[mid]) { ans = Math.min(ans, a[low]); low = mid + 1; }  // left sorted, take its min
        else                  { ans = Math.min(ans, a[mid]); high = mid - 1; }
    }
    return ans;
}
```

### 11. Find Out How Many Times Array Has Been Rotated
Answer = index of the minimum element.
```java
int countRotations(int[] a) {
    int low = 0, high = n - 1, ans = INT_MAX, idx = -1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[low] <= a[mid]) { if (a[low] < ans) { ans = a[low]; idx = low; } low = mid + 1; }
        else                  { if (a[mid] < ans) { ans = a[mid]; idx = mid; } high = mid - 1; }
    }
    return idx;
}
```

### 12. Single Element in Sorted Array (all others twice)
```java
// [OPTIMAL] index-parity binary search — TC: O(log n), SC: O(1)
int singleNonDuplicate(int[] a) {
    if (n == 1) return a[0];
    if (a[0] != a[1]) return a[0];
    if (a[n - 1] != a[n - 2]) return a[n - 1];
    int low = 1, high = n - 2;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] != a[mid - 1] && a[mid] != a[mid + 1]) return a[mid];
        // before the single element: pairs are (even, odd); after: (odd, even)
        if ((mid % 2 == 1 && a[mid] == a[mid - 1]) || (mid % 2 == 0 && a[mid] == a[mid + 1]))
            low = mid + 1;         // still in the left (correct-parity) region
        else high = mid - 1;
    }
    return -1;
}
```

### 13. Find Peak Element
Element strictly greater than both neighbours (a[-1] = a[n] = -inf).
```java
// [OPTIMAL] TC: O(log n), SC: O(1)
int findPeakElement(int[] a) {
    if (n == 1) return 0;
    if (a[0] > a[1]) return 0;
    if (a[n - 1] > a[n - 2]) return n - 1;
    int low = 1, high = n - 2;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (a[mid] > a[mid - 1] && a[mid] > a[mid + 1]) return mid;
        if (a[mid] > a[mid - 1]) low = mid + 1;    // on an increasing slope → peak is right
        else high = mid - 1;                       // decreasing slope → peak is left
    }
    return -1;
}
```

---

## 4.2 BS on Answers *(14 problems)*

> **Pattern:** define a monotonic predicate `isPossible(mid)`, binary search over the answer range `[lo, hi]`, and keep the boundary where the predicate flips.

### 14. Find Square Root using Binary Search
```java
// TC: O(log n), SC: O(1)
int sqrtN(long n) {
    long low = 1, high = n, ans = 0;
    while (low <= high) {
        long mid = (low + high) / 2;
        if (mid * mid <= n) { ans = mid; low = mid + 1; }
        else high = mid - 1;
    }
    return (int)ans;
}
```

### 15. Nth Root of a Number
```java
// TC: O(log m * n), SC: O(1)
int nthRoot(int n, int m) {
    int low = 1, high = m;
    while (low <= high) {
        int mid = (low + high) / 2;
        int cmp = powCompare(mid, n, m);       // returns 0 if ==m, 1 if <m, 2 if >m
        if (cmp == 0) return mid;
        if (cmp == 1) low = mid + 1; else high = mid - 1;
    }
    return -1;
}

int powCompare(long base, int exp, int limit) {   // early-exit power to avoid overflow
    long res = 1;
    for (int i = 0; i < exp; i++) { res *= base; if (res > limit) return 2; }
    return res == limit ? 0 : 1;
}
```

### 16. Koko Eating Bananas
Minimum eating speed k to finish all piles within h hours.
```java
// TC: O(n log(max)), SC: O(1)
int minEatingSpeed(int[] piles, int h) {
    int low = 1, high = max(piles);
    while (low <= high) {
        int mid = (low + high) / 2;
        if (hoursNeeded(piles, mid) <= h) high = mid - 1;   // feasible → try slower
        else low = mid + 1;
    }
    return low;                                   // low = first feasible speed
}

long hoursNeeded(int[] piles, int k) {
    long h = 0;
    for (int p : piles) h += ceil(p / (double)k);
    return h;
}
```

### 17. Minimum Days to Make M Bouquets
Need m bouquets of k adjacent flowers each.
```java
// TC: O(n log(maxDay)), SC: O(1)
int minDays(int[] bloom, int m, int k) {
    if ((long)m * k > n) return -1;                    // impossible
    int low = min(bloom), high = max(bloom);
    while (low <= high) {
        int mid = (low + high) / 2;
        if (possible(bloom, mid, m, k)) high = mid - 1; else low = mid + 1;
    }
    return low;
}

boolean possible(int[] bloom, int day, int m, int k) {
    int run = 0, bouquets = 0;
    for (int b : bloom) {
        if (b <= day) { run++; if (run == k) { bouquets++; run = 0; } }
        else run = 0;                                  // adjacency broken
    }
    return bouquets >= m;
}
```

### 18. Find the Smallest Divisor Given a Threshold
```java
// TC: O(n log(max)), SC: O(1)
int smallestDivisor(int[] a, int limit) {
    int low = 1, high = max(a);
    while (low <= high) {
        int mid = (low + high) / 2;
        long sum = 0;
        for (int x : a) sum += ceil(x / (double)mid);
        if (sum <= limit) high = mid - 1; else low = mid + 1;
    }
    return low;
}
```

### 19. Capacity to Ship Packages within D Days
```java
// TC: O(n log(sum - max)), SC: O(1)
int shipWithinDays(int[] w, int days) {
    int low = max(w), high = sum(w);                 // must fit the heaviest package
    while (low <= high) {
        int mid = (low + high) / 2;
        if (daysNeeded(w, mid) <= days) high = mid - 1; else low = mid + 1;
    }
    return low;
}

int daysNeeded(int[] w, int cap) {
    int days = 1, load = 0;
    for (int x : w) {
        if (load + x > cap) { days++; load = x; } else load += x;
    }
    return days;
}
```

### 20. Kth Missing Positive Number
```java
// [OPTIMAL] TC: O(log n), SC: O(1)
int findKthPositive(int[] a, int k) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        int missing = a[mid] - (mid + 1);        // count of missing numbers up to index mid
        if (missing < k) low = mid + 1; else high = mid - 1;
    }
    return k + high + 1;                         // == low + k
}
```

### 21. Aggressive Cows
Place c cows in stalls maximising the minimum distance between any two.
```java
// TC: O(n log n + n log(maxDist)), SC: O(1)
int aggressiveCows(int[] stalls, int c) {
    sort(stalls);
    int low = 1, high = stalls[n - 1] - stalls[0], ans = 0;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (canPlace(stalls, mid, c)) { ans = mid; low = mid + 1; }  // maximise → go right
        else high = mid - 1;
    }
    return ans;
}

boolean canPlace(int[] s, int dist, int c) {
    int count = 1, last = s[0];
    for (int i = 1; i < n; i++)
        if (s[i] - last >= dist) { count++; last = s[i]; }
    return count >= c;
}
```

### 22. Book Allocation Problem
Allocate contiguous books to m students, minimising the maximum pages assigned.
```java
// TC: O(n log(sum - max)), SC: O(1)
int findPages(int[] pages, int m) {
    if (m > n) return -1;
    int low = max(pages), high = sum(pages);
    while (low <= high) {
        int mid = (low + high) / 2;
        if (studentsNeeded(pages, mid) <= m) high = mid - 1; else low = mid + 1;
    }
    return low;
}

int studentsNeeded(int[] pages, int limit) {
    int students = 1, cur = 0;
    for (int p : pages) { if (cur + p > limit) { students++; cur = p; } else cur += p; }
    return students;
}
```

### 23. Split Array — Largest Sum
Split into k contiguous subarrays minimising the largest subarray sum. *Identical to Book Allocation.*
```java
int splitArray(int[] a, int k) { return findPages(a, k); }
```

### 24. Painter's Partition
k painters, each paints contiguous boards at 1 unit/second — minimise total time. *Same template.*
```java
int painterPartition(int[] boards, int k) { return findPages(boards, k); }
```

### 25. Minimise Maximum Distance between Gas Stations
Place k new stations on a line to minimise the largest gap (real-valued answer).
```java
// [OPTIMAL] binary search on real answer — TC: O(n log(maxGap/precision)), SC: O(1)
double minimiseMaxDistance(int[] st, int k) {
    double low = 0, high = 0;
    for (int i = 0; i < n - 1; i++) high = Math.max(high, st[i + 1] - st[i]);
    while (high - low > 1e-6) {
        double mid = (low + high) / 2.0;
        if (stationsRequired(st, mid) > k) low = mid; else high = mid;
    }
    return high;
}

int stationsRequired(int[] st, double dist) {
    int cnt = 0;
    for (int i = 1; i < n; i++) {
        int inBetween = (int)((st[i] - st[i - 1]) / dist);
        if ((st[i] - st[i - 1]) == inBetween * dist) inBetween--;   // exact fit needs one fewer
        cnt += inBetween;
    }
    return cnt;
}
// [ALT] max-heap on (gap / sectionsSoFar) → O(n log n + k log n)
```

### 26. Median of Two Sorted Arrays
```java
// [OPTIMAL] partition-based BS on the smaller array — TC: O(log(min(n,m))), SC: O(1)
double findMedianSortedArrays(int[] a, int[] b) {
    if (n > m) return findMedianSortedArrays(b, a);      // binary search on smaller
    int total = n + m, left = (total + 1) / 2;
    int low = 0, high = n;
    while (low <= high) {
        int cut1 = (low + high) / 2, cut2 = left - cut1;
        int l1 = cut1 == 0 ? INT_MIN : a[cut1 - 1];
        int l2 = cut2 == 0 ? INT_MIN : b[cut2 - 1];
        int r1 = cut1 == n ? INT_MAX : a[cut1];
        int r2 = cut2 == m ? INT_MAX : b[cut2];
        if (l1 <= r2 && l2 <= r1) {                      // valid partition found
            if (total % 2 == 1) return Math.max(l1, l2);
            return (Math.max(l1, l2) + Math.min(r1, r2)) / 2.0;
        }
        if (l1 > r2) high = cut1 - 1; else low = cut1 + 1;
    }
    return 0;
}
```

### 27. Kth Element of Two Sorted Arrays
```java
// Same partition idea, with left = k — TC: O(log(min(n,m))), SC: O(1)
int kthElement(int[] a, int[] b, int k) {
    if (n > m) return kthElement(b, a, k);
    int low = Math.max(0, k - m), high = Math.min(k, n);
    while (low <= high) {
        int cut1 = (low + high) / 2, cut2 = k - cut1;
        int l1 = cut1 == 0 ? INT_MIN : a[cut1 - 1];
        int l2 = cut2 == 0 ? INT_MIN : b[cut2 - 1];
        int r1 = cut1 == n ? INT_MAX : a[cut1];
        int r2 = cut2 == m ? INT_MAX : b[cut2];
        if (l1 <= r2 && l2 <= r1) return Math.max(l1, l2);
        if (l1 > r2) high = cut1 - 1; else low = cut1 + 1;
    }
    return -1;
}
```

---

## 4.3 BS on 2D Matrices *(5 problems)*

### 28. Row with Maximum Number of 1's
Each row is sorted (0s then 1s).
```java
// [OPTIMAL] lower bound of 1 per row — TC: O(m log n), SC: O(1)
int rowWithMax1s(int[][] mat) {
    int best = -1, maxCount = 0;
    for (int i = 0; i < m; i++) {
        int countOnes = n - lowerBound(mat[i], 1);
        if (countOnes > maxCount) { maxCount = countOnes; best = i; }
    }
    return best;
}
// [ALT] staircase from top-right, move left on 1 / down on 0 → O(m + n)
```

### 29. Search in a 2D Matrix (fully sorted, row-major)
```java
// [OPTIMAL] treat as flattened 1D array — TC: O(log(m*n)), SC: O(1)
boolean searchMatrix(int[][] mat, int target) {
    int low = 0, high = m * n - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        int val = mat[mid / n][mid % n];
        if (val == target) return true;
        if (val < target) low = mid + 1; else high = mid - 1;
    }
    return false;
}
```

### 30. Search in Row-wise and Column-wise Sorted Matrix
```java
// [OPTIMAL] staircase search — TC: O(m + n), SC: O(1)
boolean searchMatrixII(int[][] mat, int target) {
    int row = 0, col = n - 1;                  // start at top-right corner
    while (row < m && col >= 0) {
        if (mat[row][col] == target) return true;
        if (mat[row][col] > target) col--; else row++;
    }
    return false;
}
```

### 31. Find Peak Element in 2D Matrix
Element greater than its 4 neighbours.
```java
// [OPTIMAL] binary search on columns — TC: O(n log m) (or O(m log n)), SC: O(1)
int[] findPeakGrid(int[][] mat) {
    int low = 0, high = n - 1;                 // columns
    while (low <= high) {
        int mid = (low + high) / 2;
        int row = maxRowIndexInColumn(mat, mid);
        int left  = mid - 1 >= 0 ? mat[row][mid - 1] : -1;
        int right = mid + 1 < n  ? mat[row][mid + 1] : -1;
        if (mat[row][mid] > left && mat[row][mid] > right) return new int[]{row, mid};
        if (left > mat[row][mid]) high = mid - 1; else low = mid + 1;
    }
    return new int[]{-1, -1};
}
```

### 32. Matrix Median
Median of a row-wise sorted matrix (m*n odd).
```java
// [OPTIMAL] BS on value range + count of elements <= mid — TC: O(log(max-min) * m log n), SC: O(1)
int matrixMedian(int[][] mat) {
    int low = INT_MAX, high = INT_MIN;
    for (int i = 0; i < m; i++) { low = min(low, mat[i][0]); high = max(high, mat[i][n - 1]); }
    int required = (m * n) / 2;
    while (low <= high) {
        int mid = (low + high) / 2;
        int smallerEqual = 0;
        for (int i = 0; i < m; i++) smallerEqual += upperBound(mat[i], mid);
        if (smallerEqual <= required) low = mid + 1; else high = mid - 1;
    }
    return low;
}
```

---

# Step 5 — Strings (Basic & Medium)

## 5.1 Basic *(7 problems)*

### 1. Remove Outermost Parentheses
Strip the outermost brackets of every primitive valid-parentheses block.
```java
// TC: O(n), SC: O(n) output
String removeOuterParentheses(String s) {
    sb = new StringBuilder(); int depth = 0;
    for (char c : s.toCharArray()) {
        if (c == '(') { if (depth > 0) sb.append(c); depth++; }
        else          { depth--; if (depth > 0) sb.append(c); }
    }
    return sb.toString();
}
```

### 2. Reverse Words in a String
"the sky is blue" → "blue is sky the"; collapse extra spaces.
```java
// TC: O(n), SC: O(n)
String reverseWords(String s) {
    words = s.trim().split("\\s+");
    sb = new StringBuilder();
    for (int i = words.length - 1; i >= 0; i--) {
        sb.append(words[i]);
        if (i > 0) sb.append(' ');
    }
    return sb.toString();
}
// [ALT] in-place on char[]: reverse whole string, then reverse each word → O(1) extra space
```

### 3. Largest Odd Number in a String
Longest prefix ending in an odd digit.
```java
// TC: O(n), SC: O(1)
String largestOddNumber(String s) {
    for (int i = s.length() - 1; i >= 0; i--)
        if ((s.charAt(i) - '0') % 2 == 1) return s.substring(0, i + 1);
    return "";
}
```

### 4. Longest Common Prefix
```java
// [OPTIMAL] vertical scanning — TC: O(n * minLen), SC: O(1)
String longestCommonPrefix(String[] strs) {
    sort(strs);                                  // lexicographic: only first & last matter
    String first = strs[0], last = strs[strs.length - 1];
    int i = 0;
    while (i < first.length() && i < last.length() && first.charAt(i) == last.charAt(i)) i++;
    return first.substring(0, i);
}
```

### 5. Isomorphic Strings
Characters of s can be replaced (1-to-1) to get t.
```java
// TC: O(n), SC: O(256)
boolean isIsomorphic(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] mapST = new int[256], mapTS = new int[256];   // store index+1, 0 = unseen
    for (int i = 0; i < s.length(); i++) {
        char a = s.charAt(i), b = t.charAt(i);
        if (mapST[a] != mapTS[b]) return false;         // mapping conflict
        mapST[a] = i + 1; mapTS[b] = i + 1;
    }
    return true;
}
```

### 6. Check if One String is a Rotation of Another
```java
// TC: O(n) with KMP-based indexOf, SC: O(n)
boolean rotateString(String s, String goal) {
    return s.length() == goal.length() && (s + s).contains(goal);
}
```

### 7. Check if Two Strings are Anagrams
```java
// TC: O(n), SC: O(26)
boolean isAnagram(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] count = new int[26];
    for (int i = 0; i < s.length(); i++) { count[s.charAt(i) - 'a']++; count[t.charAt(i) - 'a']--; }
    for (int c : count) if (c != 0) return false;
    return true;
}
```

---

## 5.2 Medium *(8 problems)*

### 8. Sort Characters by Frequency
```java
// [OPTIMAL] bucket sort by frequency — TC: O(n), SC: O(n). [ALT] max-heap → O(n log k)
String frequencySort(String s) {
    map = freqMap(s);
    List<Character>[] bucket = new List[s.length() + 1];      // index = frequency
    for (entry in map) bucket[entry.value].add(entry.key);
    sb = new StringBuilder();
    for (int f = s.length(); f >= 1; f--)
        if (bucket[f] != null)
            for (char c : bucket[f]) sb.append(repeat(c, f));
    return sb.toString();
}
```

### 9. Maximum Nesting Depth of Parentheses
```java
// TC: O(n), SC: O(1)
int maxDepth(String s) {
    int depth = 0, max = 0;
    for (char c : s.toCharArray()) {
        if (c == '(') max = Math.max(max, ++depth);
        else if (c == ')') depth--;
    }
    return max;
}
```

### 10. Roman to Integer (and Integer to Roman)
```java
// Roman -> Integer. TC: O(n), SC: O(1)
int romanToInt(String s) {
    map = {I:1, V:5, X:10, L:50, C:100, D:500, M:1000};
    int res = 0;
    for (int i = 0; i < s.length(); i++) {
        int cur = map[s.charAt(i)];
        // subtractive notation: a smaller value before a larger one is subtracted
        if (i + 1 < s.length() && cur < map[s.charAt(i + 1)]) res -= cur; else res += cur;
    }
    return res;
}

// Integer -> Roman. Greedy over descending value table. TC: O(1)
String intToRoman(int num) {
    int[] vals    = {1000,900,500,400,100,90,50,40,10,9,5,4,1};
    String[] syms = {"M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"};
    sb = new StringBuilder();
    for (int i = 0; i < vals.length; i++)
        while (num >= vals[i]) { sb.append(syms[i]); num -= vals[i]; }
    return sb.toString();
}
```

### 11. Implement Atoi (string → integer)
```java
// TC: O(n), SC: O(1)
int myAtoi(String s) {
    int i = 0, sign = 1; long res = 0;
    while (i < s.length() && s.charAt(i) == ' ') i++;                  // 1) skip spaces
    if (i < s.length() && (s.charAt(i) == '+' || s.charAt(i) == '-'))  // 2) sign
        sign = s.charAt(i++) == '-' ? -1 : 1;
    while (i < s.length() && isDigit(s.charAt(i))) {                   // 3) digits
        res = res * 10 + (s.charAt(i) - '0');
        if (sign == 1 && res > INT_MAX) return INT_MAX;                // 4) clamp
        if (sign == -1 && -res < INT_MIN) return INT_MIN;
        i++;
    }
    return (int)(sign * res);
}
```

### 12. Count Substrings with Exactly K Distinct Characters
```java
// [OPTIMAL] exactly(K) = atMost(K) - atMost(K-1) — TC: O(2n), SC: O(26)
int countKDistinct(String s, int k) { return atMost(s, k) - atMost(s, k - 1); }

int atMost(String s, int k) {
    int[] cnt = new int[26]; int l = 0, distinct = 0, res = 0;
    for (int r = 0; r < s.length(); r++) {
        if (cnt[s.charAt(r) - 'a']++ == 0) distinct++;
        while (distinct > k) if (--cnt[s.charAt(l++) - 'a'] == 0) distinct--;
        res += (r - l + 1);                 // all substrings ending at r
    }
    return res;
}
```

### 13. Longest Palindromic Substring (without DP)
```java
// [OPTIMAL] expand around centre — TC: O(n^2), SC: O(1)
String longestPalindrome(String s) {
    int start = 0, len = 0;
    for (int i = 0; i < s.length(); i++) {
        int l1 = expand(s, i, i);        // odd length centre
        int l2 = expand(s, i, i + 1);    // even length centre
        int cur = Math.max(l1, l2);
        if (cur > len) { len = cur; start = i - (cur - 1) / 2; }
    }
    return s.substring(start, start + len);
}

int expand(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
    return r - l - 1;
}
// [ALT] Manacher's algorithm → O(n). DP table → O(n^2) time, O(n^2) space.
```

### 14. Sum of Beauty of All Substrings
Beauty = (max char frequency − min non-zero char frequency).
```java
// TC: O(n^2 * 26), SC: O(26)
int beautySum(String s) {
    int total = 0;
    for (int i = 0; i < s.length(); i++) {
        int[] freq = new int[26];
        for (int j = i; j < s.length(); j++) {
            freq[s.charAt(j) - 'a']++;
            int max = 0, min = INT_MAX;
            for (int f : freq) { if (f > 0) min = Math.min(min, f); max = Math.max(max, f); }
            total += (max - min);
        }
    }
    return total;
}
```

### 15. Reverse Every Word in a String
Reverse characters of each word, keep word order.
```java
// TC: O(n), SC: O(n)
String reverseEachWord(String s) {
    sb = new StringBuilder();
    for (String w : s.split(" ")) sb.append(new StringBuilder(w).reverse()).append(' ');
    return sb.toString().trim();
}
```

---

# Step 6 — Linked List

> `class Node { int val; Node next; }` and `class DNode { int val; DNode next, prev; }`

## 6.1 Learn Singly Linked List *(5 problems)*

### 1. Introduction — Array to Linked List
```java
// TC: O(n), SC: O(n)
Node convert(int[] a) {
    Node head = new Node(a[0]), mover = head;
    for (int i = 1; i < n; i++) { mover.next = new Node(a[i]); mover = mover.next; }
    return head;
}
```

### 2. Insert a Node
```java
// Insert at head — O(1)
Node insertHead(Node head, int val) { Node t = new Node(val); t.next = head; return t; }

// Insert at tail — O(n)
Node insertTail(Node head, int val) {
    if (head == null) return new Node(val);
    Node cur = head;
    while (cur.next != null) cur = cur.next;
    cur.next = new Node(val);
    return head;
}

// Insert at k-th position (1-indexed) — O(k)
Node insertAtK(Node head, int val, int k) {
    if (k == 1) return insertHead(head, val);
    Node cur = head; int cnt = 0;
    while (cur != null) {
        cnt++;
        if (cnt == k - 1) { Node t = new Node(val); t.next = cur.next; cur.next = t; break; }
        cur = cur.next;
    }
    return head;
}
```

### 3. Delete a Node
```java
// Delete head — O(1)
Node deleteHead(Node head) { return head == null ? null : head.next; }

// Delete tail — O(n)
Node deleteTail(Node head) {
    if (head == null || head.next == null) return null;
    Node cur = head;
    while (cur.next.next != null) cur = cur.next;
    cur.next = null;
    return head;
}

// Delete k-th node — O(k)
Node deleteK(Node head, int k) {
    if (head == null) return null;
    if (k == 1) return head.next;
    Node cur = head, prev = null; int cnt = 0;
    while (cur != null) {
        cnt++;
        if (cnt == k) { prev.next = cur.next; break; }
        prev = cur; cur = cur.next;
    }
    return head;
}
```

### 4. Find Length of Linked List
```java
// TC: O(n), SC: O(1)
int length(Node head) {
    int cnt = 0;
    for (Node cur = head; cur != null; cur = cur.next) cnt++;
    return cnt;
}
```

### 5. Search an Element
```java
// TC: O(n), SC: O(1)
boolean search(Node head, int target) {
    for (Node cur = head; cur != null; cur = cur.next) if (cur.val == target) return true;
    return false;
}
```

---

## 6.2 Learn Doubly Linked List *(4 problems)*

### 6. Introduction — Array to Doubly Linked List
```java
// TC: O(n), SC: O(n)
DNode convertDLL(int[] a) {
    DNode head = new DNode(a[0]), prev = head;
    for (int i = 1; i < n; i++) {
        DNode t = new DNode(a[i]);
        t.prev = prev; prev.next = t; prev = t;
    }
    return head;
}
```

### 7. Insert a Node in DLL
```java
// Insert before a given node — O(1)
void insertBefore(DNode node, int val) {
    DNode t = new DNode(val);
    t.prev = node.prev; t.next = node;
    if (node.prev != null) node.prev.next = t;
    node.prev = t;
}

// Insert at k-th position: traverse to node at k, then insertBefore — O(k)
```

### 8. Delete a Node in DLL
```java
// Delete a given (non-head) node — O(1)
void deleteNode(DNode node) {
    DNode p = node.prev, nx = node.next;
    if (p != null) p.next = nx;
    if (nx != null) nx.prev = p;
    node.next = null; node.prev = null;
}

DNode deleteHead(DNode head) {
    if (head == null || head.next == null) return null;
    DNode nh = head.next; nh.prev = null; head.next = null;
    return nh;
}
```

### 9. Reverse a Doubly Linked List
```java
// [OPTIMAL] swap next/prev of every node — TC: O(n), SC: O(1)
DNode reverseDLL(DNode head) {
    DNode cur = head, last = null;
    while (cur != null) {
        last = cur.prev;
        cur.prev = cur.next;
        cur.next = last;
        cur = cur.prev;                 // move to what was originally next
    }
    return last == null ? head : last.prev;
}
// [ALT] stack of values, refill list → O(n) time, O(n) space
```

---

## 6.3 Medium Problems on Linked List *(15 problems)*

### 10. Middle of the Linked List
```java
// [OPTIMAL] tortoise & hare — TC: O(n/2), SC: O(1)
Node middleNode(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
    return slow;                       // for the FIRST middle: loop while fast.next != null && fast.next.next != null
}
```

### 11. Reverse a Linked List (Iterative)
```java
// TC: O(n), SC: O(1)
Node reverse(Node head) {
    Node prev = null, cur = head;
    while (cur != null) {
        Node nxt = cur.next;
        cur.next = prev;
        prev = cur; cur = nxt;
    }
    return prev;
}
```

### 12. Reverse a Linked List (Recursive)
```java
// TC: O(n), SC: O(n) stack
Node reverseRec(Node head) {
    if (head == null || head.next == null) return head;
    Node newHead = reverseRec(head.next);
    head.next.next = head;             // the node after head now points back to head
    head.next = null;
    return newHead;
}
```

### 13. Detect a Loop in Linked List
```java
// [OPTIMAL] Floyd's cycle detection — TC: O(n), SC: O(1)
boolean hasCycle(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
// [ALT] HashSet of visited nodes → O(n) time, O(n) space
```

### 14. Find the Starting Point of the Loop
```java
// [OPTIMAL] TC: O(n), SC: O(1)
Node detectCycleStart(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) {
            slow = head;                          // distance head→start == meeting→start
            while (slow != fast) { slow = slow.next; fast = fast.next; }
            return slow;
        }
    }
    return null;
}
```

### 15. Length of the Loop
```java
// TC: O(n), SC: O(1)
int loopLength(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) {
            int cnt = 1; Node cur = slow.next;
            while (cur != slow) { cnt++; cur = cur.next; }
            return cnt;
        }
    }
    return 0;
}
```

### 16. Check if Linked List is Palindrome
```java
// [OPTIMAL] reverse second half — TC: O(n), SC: O(1)
boolean isPalindrome(Node head) {
    if (head == null || head.next == null) return true;
    Node slow = head, fast = head;
    while (fast.next != null && fast.next.next != null) { slow = slow.next; fast = fast.next.next; }
    Node second = reverse(slow.next);         // slow = end of first half
    Node p1 = head, p2 = second;
    boolean ok = true;
    while (p2 != null) { if (p1.val != p2.val) { ok = false; break; } p1 = p1.next; p2 = p2.next; }
    slow.next = reverse(second);              // restore original list
    return ok;
}
```

### 17. Segregate Odd and Even Nodes (by position)
```java
// [OPTIMAL] two chains — TC: O(n), SC: O(1)
Node oddEvenList(Node head) {
    if (head == null || head.next == null) return head;
    Node odd = head, even = head.next, evenHead = even;
    while (even != null && even.next != null) {
        odd.next = odd.next.next;  odd = odd.next;
        even.next = even.next.next; even = even.next;
    }
    odd.next = evenHead;
    return head;
}
```

### 18. Remove Nth Node from End
```java
// [OPTIMAL] one pass, gap of n — TC: O(n), SC: O(1)
Node removeNthFromEnd(Node head, int n) {
    Node fast = head;
    for (int i = 0; i < n; i++) fast = fast.next;
    if (fast == null) return head.next;            // removing the head
    Node slow = head;
    while (fast.next != null) { fast = fast.next; slow = slow.next; }
    slow.next = slow.next.next;
    return head;
}
```

### 19. Delete the Middle Node
```java
// TC: O(n), SC: O(1) — stop slow one node before the middle
Node deleteMiddle(Node head) {
    if (head == null || head.next == null) return null;
    Node slow = head, fast = head.next.next;       // skip ahead so slow lands on middle-1
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
    slow.next = slow.next.next;
    return head;
}
```

### 20. Sort a Linked List
```java
// [OPTIMAL] merge sort on LL — TC: O(n log n), SC: O(log n) stack
Node sortList(Node head) {
    if (head == null || head.next == null) return head;
    Node mid = findMiddleFirst(head);              // returns end of first half
    Node right = mid.next; mid.next = null;
    return mergeTwo(sortList(head), sortList(right));
}

Node mergeTwo(Node a, Node b) {
    Node dummy = new Node(-1), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.next = a; a = a.next; }
        else                { tail.next = b; b = b.next; }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b;
    return dummy.next;
}
```

### 21. Sort a Linked List of 0s, 1s and 2s
```java
// [OPTIMAL] three dummy chains, link them — TC: O(n), SC: O(1)
Node sortZeroOneTwo(Node head) {
    Node z = new Node(-1), o = new Node(-1), t = new Node(-1);
    Node zt = z, ot = o, tt = t, cur = head;
    while (cur != null) {
        if (cur.val == 0)      { zt.next = cur; zt = cur; }
        else if (cur.val == 1) { ot.next = cur; ot = cur; }
        else                   { tt.next = cur; tt = cur; }
        cur = cur.next;
    }
    zt.next = (o.next != null) ? o.next : t.next;
    ot.next = t.next;
    tt.next = null;
    return z.next;
}
// [ALT] count 0s/1s/2s and overwrite values → two passes, only valid if values may be modified
```

### 22. Find the Intersection Point of Y Linked Lists
```java
// [OPTIMAL] two-pointer switch — TC: O(n+m), SC: O(1)
Node getIntersectionNode(Node a, Node b) {
    if (a == null || b == null) return null;
    Node p1 = a, p2 = b;
    while (p1 != p2) {
        p1 = (p1 == null) ? b : p1.next;   // both traverse n+m steps → meet at intersection or null
        p2 = (p2 == null) ? a : p2.next;
    }
    return p1;
}
// [ALT] compute both lengths, advance the longer by the difference, then walk together
```

### 23. Add 1 to a Number Represented by a Linked List
```java
// [OPTIMAL] backtracking carry (no reversal) — TC: O(n), SC: O(n) stack
Node addOne(Node head) {
    int carry = helper(head);
    if (carry == 1) { Node t = new Node(1); t.next = head; return t; }
    return head;
}

int helper(Node node) {
    if (node == null) return 1;                  // the +1 seed
    int carry = helper(node.next);
    int sum = node.val + carry;
    node.val = sum % 10;
    return sum / 10;
}
// [ALT] reverse → add with carry → reverse back, O(n) time O(1) space
```

### 24. Add Two Numbers Represented by Linked Lists
Digits stored in reverse order.
```java
// TC: O(max(n,m)), SC: O(max(n,m)) output
Node addTwoNumbers(Node l1, Node l2) {
    Node dummy = new Node(0), tail = dummy; int carry = 0;
    while (l1 != null || l2 != null || carry != 0) {
        int sum = carry;
        if (l1 != null) { sum += l1.val; l1 = l1.next; }
        if (l2 != null) { sum += l2.val; l2 = l2.next; }
        carry = sum / 10;
        tail.next = new Node(sum % 10); tail = tail.next;
    }
    return dummy.next;
}
```

---

## 6.4 Medium Problems on Doubly Linked List *(3 problems)*

### 25. Delete All Occurrences of a Key in DLL
```java
// TC: O(n), SC: O(1)
DNode deleteAllOccurrences(DNode head, int key) {
    DNode cur = head;
    while (cur != null) {
        DNode nxt = cur.next;
        if (cur.val == key) {
            if (cur == head) head = nxt;
            if (cur.prev != null) cur.prev.next = cur.next;
            if (cur.next != null) cur.next.prev = cur.prev;
        }
        cur = nxt;
    }
    return head;
}
```

### 26. Find Pairs with Given Sum in a Sorted DLL
```java
// [OPTIMAL] two pointers from both ends — TC: O(n), SC: O(1)
List<int[]> pairsWithSum(DNode head, int target) {
    DNode left = head, right = tail(head);
    res = [];
    while (left != null && right != null && left != right && right.next != left) {
        int sum = left.val + right.val;
        if (sum == target) { res.add([left.val, right.val]); left = left.next; right = right.prev; }
        else if (sum < target) left = left.next;
        else right = right.prev;
    }
    return res;
}
```

### 27. Remove Duplicates from a Sorted DLL
```java
// TC: O(n), SC: O(1)
DNode removeDuplicates(DNode head) {
    DNode cur = head;
    while (cur != null && cur.next != null) {
        if (cur.val == cur.next.val) {
            DNode dup = cur.next;
            cur.next = dup.next;
            if (dup.next != null) dup.next.prev = cur;
        } else cur = cur.next;
    }
    return head;
}
```

---

## 6.5 Hard Problems on Linked List *(4 problems)*

### 28. Reverse Nodes in Groups of Size K
```java
// [OPTIMAL] TC: O(n), SC: O(1)
Node reverseKGroup(Node head, int k) {
    Node temp = head, prevLast = null, newHead = null;
    while (temp != null) {
        Node kth = getKthNode(temp, k);
        if (kth == null) { if (prevLast != null) prevLast.next = temp; break; }  // leftover < k stays as is
        Node nextGroup = kth.next;
        kth.next = null;                       // detach the group
        reverse(temp);                         // temp becomes the group's new tail
        if (newHead == null) newHead = kth; else prevLast.next = kth;
        prevLast = temp;
        temp = nextGroup;
    }
    return newHead == null ? head : newHead;
}

Node getKthNode(Node cur, int k) {
    for (int i = 1; i < k && cur != null; i++) cur = cur.next;
    return cur;
}
```

### 29. Rotate a Linked List by K Places (right)
```java
// [OPTIMAL] make it circular, break at the right spot — TC: O(n), SC: O(1)
Node rotateRight(Node head, int k) {
    if (head == null || head.next == null || k == 0) return head;
    Node tail = head; int len = 1;
    while (tail.next != null) { tail = tail.next; len++; }
    k = k % len;
    if (k == 0) return head;
    tail.next = head;                         // form a cycle
    Node newTail = head;
    for (int i = 1; i < len - k; i++) newTail = newTail.next;
    Node newHead = newTail.next;
    newTail.next = null;
    return newHead;
}
```

### 30. Flattening a Linked List
Each node has `next` and `bottom`; every bottom-list is sorted. Flatten into one sorted bottom-list.
```java
// [OPTIMAL] recursive merge from the right — TC: O(n*m), SC: O(n) stack
Node flatten(Node head) {
    if (head == null || head.next == null) return head;
    head.next = flatten(head.next);
    return mergeBottom(head, head.next);
}

Node mergeBottom(Node a, Node b) {
    Node dummy = new Node(-1), tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { tail.bottom = a; a = a.bottom; }
        else                { tail.bottom = b; b = b.bottom; }
        tail = tail.bottom; tail.next = null;
    }
    tail.bottom = (a != null) ? a : b;
    return dummy.bottom;
}
```

### 31. Clone a Linked List with Random and Next Pointers
```java
// [OPTIMAL] interleave copies — TC: O(3n), SC: O(1) extra
Node copyRandomList(Node head) {
    if (head == null) return null;
    // 1) insert a copy after each original node: A -> A' -> B -> B'
    for (Node cur = head; cur != null; cur = cur.next.next) {
        Node copy = new Node(cur.val);
        copy.next = cur.next; cur.next = copy;
    }
    // 2) wire the random pointers of the copies
    for (Node cur = head; cur != null; cur = cur.next.next)
        cur.next.random = (cur.random != null) ? cur.random.next : null;
    // 3) detach the two lists
    Node dummy = new Node(-1), tail = dummy;
    for (Node cur = head; cur != null; cur = cur.next) {
        tail.next = cur.next; tail = tail.next;
        cur.next = cur.next.next;
    }
    return dummy.next;
}
// [ALT] HashMap<original, copy> in two passes → O(n) time, O(n) space
```

---

# Step 7 — Recursion (Pattern-wise)

## 7.1 Get a Strong Hold *(5 problems)*

### 1. Recursive Implementation of Atoi
```java
// TC: O(n), SC: O(n) stack
int atoiHelper(String s, int i, int sign, long res) {
    if (i == s.length() || !isDigit(s.charAt(i))) return (int)(sign * res);
    res = res * 10 + (s.charAt(i) - '0');
    if (sign == 1 && res > INT_MAX) return INT_MAX;
    if (sign == -1 && -res < INT_MIN) return INT_MIN;
    return atoiHelper(s, i + 1, sign, res);
}
```

### 2. Pow(x, n)
```java
// [OPTIMAL] binary exponentiation — TC: O(log n), SC: O(1)
double myPow(double x, int n) {
    long nn = n; boolean neg = nn < 0; nn = Math.abs(nn);
    double ans = 1;
    while (nn > 0) {
        if (nn % 2 == 1) { ans *= x; nn--; }
        else { x *= x; nn /= 2; }
    }
    return neg ? 1.0 / ans : ans;
}
```

### 3. Count Good Numbers
Digits at even indices are even (5 choices), odd indices are prime (4 choices: 2,3,5,7).
```java
// TC: O(log n), SC: O(1)
long countGoodNumbers(long n) {
    long even = (n + 1) / 2, odd = n / 2;
    return (modPow(5, even) * modPow(4, odd)) % MOD;
}

long modPow(long b, long e) {              // fast exponentiation under MOD = 1e9+7
    long res = 1; b %= MOD;
    while (e > 0) {
        if ((e & 1) == 1) res = res * b % MOD;
        b = b * b % MOD; e >>= 1;
    }
    return res;
}
```

### 4. Sort a Stack using Recursion
```java
// TC: O(n^2), SC: O(n) stack
void sortStack(Stack<Integer> st) {
    if (st.isEmpty()) return;
    int top = st.pop();
    sortStack(st);
    insertSorted(st, top);
}

void insertSorted(Stack<Integer> st, int val) {
    if (st.isEmpty() || st.peek() <= val) { st.push(val); return; }
    int top = st.pop();
    insertSorted(st, val);
    st.push(top);
}
```

### 5. Reverse a Stack using Recursion
```java
// TC: O(n^2), SC: O(n)
void reverseStack(Stack<Integer> st) {
    if (st.isEmpty()) return;
    int top = st.pop();
    reverseStack(st);
    insertAtBottom(st, top);
}

void insertAtBottom(Stack<Integer> st, int val) {
    if (st.isEmpty()) { st.push(val); return; }
    int top = st.pop();
    insertAtBottom(st, val);
    st.push(top);
}
```

---

## 7.2 Subsequences Pattern *(12 problems)*

> **Master template:** at each index, *pick* or *not-pick*. TC generally O(2^n * k), SC O(n) recursion depth.

### 6. Generate All Binary Strings (no consecutive 1s)
```java
// TC: O(2^n), SC: O(n)
void genBinary(int n, StringBuilder cur) {
    if (cur.length() == n) { res.add(cur.toString()); return; }
    cur.append('0'); genBinary(n, cur); cur.deleteCharAt(cur.length() - 1);
    if (cur.length() == 0 || cur.charAt(cur.length() - 1) != '1') {
        cur.append('1'); genBinary(n, cur); cur.deleteCharAt(cur.length() - 1);
    }
}
```

### 7. Generate Parentheses
All valid combinations of n pairs.
```java
// TC: O(4^n / sqrt(n)) (Catalan), SC: O(n)
void generate(int open, int close, int n, StringBuilder cur) {
    if (cur.length() == 2 * n) { res.add(cur.toString()); return; }
    if (open < n)     { cur.append('('); generate(open + 1, close, n, cur); cur.deleteLast(); }
    if (close < open) { cur.append(')'); generate(open, close + 1, n, cur); cur.deleteLast(); }
}
```

### 8. Print All Subsequences / Power Set
```java
// [OPTIMAL] pick / not-pick — TC: O(2^n * n), SC: O(n)
void subsequences(int i, int[] a, List<Integer> cur) {
    if (i == n) { res.add(new ArrayList<>(cur)); return; }
    cur.add(a[i]); subsequences(i + 1, a, cur); cur.removeLast();  // pick
    subsequences(i + 1, a, cur);                                    // not pick
}
// [ALT] bitmask: for mask in 0..2^n-1, include a[j] when bit j is set
```

### 9. Learn All Patterns of Subsequences (theory)
```java
// Three canonical return types of the pick/not-pick recursion:
// (a) print all      -> void f(i, cur)
// (b) print any one  -> boolean f(i, cur)   // return true to stop the whole recursion
// (c) count them     -> int f(i, sum)       // return left + right
boolean printAnyOne(int i, int[] a, List<Integer> cur, int sum, int target) {
    if (i == n) { if (sum == target) { print(cur); return true; } return false; }
    cur.add(a[i]);
    if (printAnyOne(i + 1, a, cur, sum + a[i], target)) return true;
    cur.removeLast();
    return printAnyOne(i + 1, a, cur, sum, target);
}
```

### 10. Count All Subsequences with Sum K
```java
// TC: O(2^n), SC: O(n)
int countSubsequences(int i, int[] a, int sum, int target) {
    if (i == n) return sum == target ? 1 : 0;
    int pick = countSubsequences(i + 1, a, sum + a[i], target);
    int notPick = countSubsequences(i + 1, a, sum, target);
    return pick + notPick;
}
```

### 11. Check if There Exists a Subsequence with Sum K
```java
// TC: O(2^n) worst, early exit on success. SC: O(n)
boolean existsSubsequence(int i, int[] a, int sum, int target) {
    if (sum == target) return true;
    if (i == n || sum > target) return false;
    return existsSubsequence(i + 1, a, sum + a[i], target)
        || existsSubsequence(i + 1, a, sum, target);
}
```

### 12. Combination Sum
Distinct candidates, each may be reused unlimited times.
```java
// TC: O(2^t * k) where t = target/min, SC: O(t)
void combinationSum(int i, int[] a, int target, List<Integer> cur) {
    if (target == 0) { res.add(copy(cur)); return; }
    if (i == n || target < 0) return;
    if (a[i] <= target) {
        cur.add(a[i]);
        combinationSum(i, a, target - a[i], cur);      // stay at i → reuse allowed
        cur.removeLast();
    }
    combinationSum(i + 1, a, target, cur);
}
```

### 13. Combination Sum II
Candidates may repeat in input; each element used at most once; unique combinations only.
```java
// TC: O(2^n * k), SC: O(n). Sort first to group duplicates.
void combinationSum2(int idx, int[] a, int target, List<Integer> cur) {
    if (target == 0) { res.add(copy(cur)); return; }
    for (int i = idx; i < n; i++) {
        if (i > idx && a[i] == a[i - 1]) continue;      // skip duplicate at the same depth
        if (a[i] > target) break;                       // sorted → no further candidates
        cur.add(a[i]);
        combinationSum2(i + 1, a, target - a[i], cur);
        cur.removeLast();
    }
}
```

### 14. Subset Sum I
Sums of all subsets, in any order.
```java
// TC: O(2^n), SC: O(2^n) output
void subsetSums(int i, int[] a, int sum, List<Integer> res) {
    if (i == n) { res.add(sum); return; }
    subsetSums(i + 1, a, sum + a[i], res);
    subsetSums(i + 1, a, sum, res);
}
```

### 15. Subset Sum II (Subsets II — unique subsets with duplicates in input)
```java
// TC: O(2^n * n), SC: O(n). Sort input first.
void subsetsWithDup(int idx, int[] a, List<Integer> cur) {
    res.add(copy(cur));
    for (int i = idx; i < n; i++) {
        if (i > idx && a[i] == a[i - 1]) continue;      // duplicate at same level
        cur.add(a[i]);
        subsetsWithDup(i + 1, a, cur);
        cur.removeLast();
    }
}
```

### 16. Combination Sum III
k numbers from 1..9, all distinct, summing to n.
```java
// TC: O(C(9,k) * k), SC: O(k)
void combinationSum3(int start, int k, int target, List<Integer> cur) {
    if (cur.size() == k) { if (target == 0) res.add(copy(cur)); return; }
    for (int d = start; d <= 9; d++) {
        if (d > target) break;
        cur.add(d);
        combinationSum3(d + 1, k, target - d, cur);
        cur.removeLast();
    }
}
```

### 17. Letter Combinations of a Phone Number
```java
// TC: O(4^n * n), SC: O(n)
void letterCombinations(int i, String digits, StringBuilder cur) {
    if (i == digits.length()) { res.add(cur.toString()); return; }
    String letters = keypad[digits.charAt(i) - '0'];    // "2"->"abc", ... "9"->"wxyz"
    for (char c : letters.toCharArray()) {
        cur.append(c);
        letterCombinations(i + 1, digits, cur);
        cur.deleteCharAt(cur.length() - 1);
    }
}
```

---

## 7.3 Hard Recursion / Backtracking *(8 problems)*

### 18. Palindrome Partitioning
All ways to cut s so every part is a palindrome.
```java
// TC: O(2^n * n), SC: O(n)
void partition(int idx, String s, List<String> cur) {
    if (idx == s.length()) { res.add(copy(cur)); return; }
    for (int i = idx; i < s.length(); i++)
        if (isPalindrome(s, idx, i)) {                  // only cut where the prefix is a palindrome
            cur.add(s.substring(idx, i + 1));
            partition(i + 1, s, cur);
            cur.removeLast();
        }
}
```

### 19. Word Search
Does the word exist as a path of adjacent cells in the grid?
```java
// TC: O(m*n*4^L), SC: O(L) stack
boolean exist(char[][] board, String word) {
    for (i, j in grid) if (dfs(board, i, j, 0, word)) return true;
    return false;
}

boolean dfs(char[][] b, int i, int j, int k, String w) {
    if (k == w.length()) return true;
    if (i < 0 || i >= m || j < 0 || j >= n || b[i][j] != w.charAt(k)) return false;
    char tmp = b[i][j]; b[i][j] = '#';                  // mark visited in place
    boolean found = dfs(b,i+1,j,k+1,w) || dfs(b,i-1,j,k+1,w)
                 || dfs(b,i,j+1,k+1,w) || dfs(b,i,j-1,k+1,w);
    b[i][j] = tmp;                                      // backtrack
    return found;
}
```

### 20. N-Queens
```java
// TC: O(n!), SC: O(n^2) for the board
void solveNQueens(int col, char[][] board, boolean[] row, boolean[] diag, boolean[] antiDiag) {
    if (col == n) { res.add(construct(board)); return; }
    for (int r = 0; r < n; r++) {
        // diag index = r + col (constant along "/"), antiDiag = n-1 + col - r (constant along "\")
        if (row[r] || diag[r + col] || antiDiag[n - 1 + col - r]) continue;
        board[r][col] = 'Q'; row[r] = diag[r+col] = antiDiag[n-1+col-r] = true;
        solveNQueens(col + 1, board, row, diag, antiDiag);
        board[r][col] = '.'; row[r] = diag[r+col] = antiDiag[n-1+col-r] = false;   // backtrack
    }
}
```

### 21. Rat in a Maze
All paths from (0,0) to (n-1,n-1) moving D, L, R, U on open cells.
```java
// TC: O(4^(n*n)), SC: O(n*n)
void findPaths(int i, int j, int[][] maze, boolean[][] vis, StringBuilder path) {
    if (i == n - 1 && j == n - 1) { res.add(path.toString()); return; }
    // lexicographic order: D, L, R, U
    int[] di = {1, 0, 0, -1}, dj = {0, -1, 1, 0}; char[] dir = {'D','L','R','U'};
    for (int k = 0; k < 4; k++) {
        int ni = i + di[k], nj = j + dj[k];
        if (ni >= 0 && ni < n && nj >= 0 && nj < n && !vis[ni][nj] && maze[ni][nj] == 1) {
            vis[i][j] = true; path.append(dir[k]);
            findPaths(ni, nj, maze, vis, path);
            path.deleteCharAt(path.length() - 1); vis[i][j] = false;
        }
    }
}
```

### 22. Word Break
Can s be segmented into dictionary words?
```java
// [OPTIMAL] recursion + memo (== DP) — TC: O(n^2 * L), SC: O(n)
boolean wordBreak(int start, String s, Set<String> dict, Boolean[] memo) {
    if (start == s.length()) return true;
    if (memo[start] != null) return memo[start];
    for (int end = start + 1; end <= s.length(); end++)
        if (dict.contains(s.substring(start, end)) && wordBreak(end, s, dict, memo))
            return memo[start] = true;
    return memo[start] = false;
}
```

### 23. M-Coloring Problem
Can the graph be coloured with at most m colours so no adjacent nodes share a colour?
```java
// TC: O(m^n), SC: O(n)
boolean graphColoring(int node, int[] color, int m, List<Integer>[] adj) {
    if (node == n) return true;
    for (int c = 1; c <= m; c++)
        if (isSafe(node, c, color, adj)) {
            color[node] = c;
            if (graphColoring(node + 1, color, m, adj)) return true;
            color[node] = 0;                             // backtrack
        }
    return false;
}

boolean isSafe(int node, int c, int[] color, List<Integer>[] adj) {
    for (int nb : adj[node]) if (color[nb] == c) return false;
    return true;
}
```

### 24. Sudoku Solver
```java
// TC: O(9^(empty cells)), SC: O(1) in-place
boolean solveSudoku(char[][] board) {
    for (int i = 0; i < 9; i++)
        for (int j = 0; j < 9; j++)
            if (board[i][j] == '.') {
                for (char c = '1'; c <= '9'; c++)
                    if (isValid(board, i, j, c)) {
                        board[i][j] = c;
                        if (solveSudoku(board)) return true;
                        board[i][j] = '.';               // backtrack
                    }
                return false;                            // no digit fits → dead end
            }
    return true;                                         // no empty cell left → solved
}

boolean isValid(char[][] b, int r, int c, char d) {
    for (int k = 0; k < 9; k++) {
        if (b[r][k] == d || b[k][c] == d) return false;
        if (b[3 * (r / 3) + k / 3][3 * (c / 3) + k % 3] == d) return false;   // 3x3 sub-box
    }
    return true;
}
```

### 25. Expression Add Operators
Insert +, -, * between digits so the expression evaluates to target.
```java
// TC: O(4^n), SC: O(n)
void addOperators(String num, int pos, long value, long prev, StringBuilder expr, int target) {
    if (pos == num.length()) { if (value == target) res.add(expr.toString()); return; }
    for (int i = pos; i < num.length(); i++) {
        if (i > pos && num.charAt(pos) == '0') break;        // no leading zeros
        long cur = Long.parseLong(num.substring(pos, i + 1));
        int len = expr.length();
        if (pos == 0) {
            expr.append(cur);
            addOperators(num, i + 1, cur, cur, expr, target);
        } else {
            expr.append('+').append(cur);
            addOperators(num, i + 1, value + cur, cur, expr, target);
            expr.setLength(len);
            expr.append('-').append(cur);
            addOperators(num, i + 1, value - cur, -cur, expr, target);
            expr.setLength(len);
            expr.append('*').append(cur);
            // undo prev, then apply precedence: value - prev + prev*cur
            addOperators(num, i + 1, value - prev + prev * cur, prev * cur, expr, target);
        }
        expr.setLength(len);
    }
}
```

---

# Step 8 — Bit Manipulation

## 8.1 Learn Bit Manipulation *(8 problems)*

### 1. Introduction to Bit Manipulation
```java
// Core operations — all O(1)
int getIthBit(int n, int i)    { return (n >> i) & 1; }
int setIthBit(int n, int i)    { return n | (1 << i); }
int clearIthBit(int n, int i)  { return n & ~(1 << i); }
int toggleIthBit(int n, int i) { return n ^ (1 << i); }
int removeLastSetBit(int n)    { return n & (n - 1); }
int lowestSetBit(int n)        { return n & -n; }
// 1's complement = ~n ; 2's complement = ~n + 1 (how negatives are stored)
// Right shift by k == divide by 2^k ; left shift by k == multiply by 2^k
```

### 2. Check if the i-th Bit is Set
```java
boolean isSet(int n, int i) { return ((n >> i) & 1) == 1; }   // or (n & (1 << i)) != 0
```

### 3. Check if a Number is Odd or Even
```java
boolean isOdd(int n) { return (n & 1) == 1; }
```

### 4. Check if a Number is a Power of 2
```java
// Powers of 2 have exactly one set bit — TC: O(1)
boolean isPowerOfTwo(int n) { return n > 0 && (n & (n - 1)) == 0; }
```

### 5. Count the Number of Set Bits
```java
// [OPTIMAL] Brian Kernighan — TC: O(number of set bits), SC: O(1)
int countSetBits(int n) {
    int cnt = 0;
    while (n > 0) { n = n & (n - 1); cnt++; }   // clears the lowest set bit each iteration
    return cnt;
}
// [ALT] loop 32 bits checking (n >> i) & 1 → O(32)
```

### 6. Set / Unset the Rightmost Unset Bit
```java
// TC: O(1)
int setRightmostUnsetBit(int n) {
    if ((n & (n + 1)) == 0) return n;     // all bits already set (n = 2^k - 1)
    return n | (n + 1);                   // n+1 flips the rightmost 0 to 1
}
```

### 7. Swap Two Numbers (without a temp variable)
```java
// TC: O(1), SC: O(1)
void swap(int a, int b) {
    a = a ^ b;
    b = a ^ b;      // (a^b)^b = a
    a = a ^ b;      // (a^b)^a = b
}
```

### 8. Divide Two Integers without *, / and %
```java
// [OPTIMAL] repeated doubling — TC: O(log^2 n), SC: O(1)
int divide(int dividend, int divisor) {
    if (dividend == divisor) return 1;
    boolean sign = (dividend >= 0) == (divisor >= 0);
    long n = Math.abs((long)dividend), d = Math.abs((long)divisor), quotient = 0;
    while (n >= d) {
        int cnt = 0;
        while (n >= (d << (cnt + 1))) cnt++;    // largest power of 2 multiple that still fits
        quotient += (1L << cnt);
        n -= (d << cnt);
    }
    if (quotient > INT_MAX) return sign ? INT_MAX : INT_MIN;   // overflow clamp
    return (int)(sign ? quotient : -quotient);
}
```

---

## 8.2 Interview Problems *(5 problems)*

### 9. Count Bits to Flip to Convert A to B
```java
// TC: O(log n), SC: O(1)
int countBitsToFlip(int a, int b) { return countSetBits(a ^ b); }   // XOR marks differing bits
```

### 10. Find the Number Appearing an Odd Number of Times
```java
// TC: O(n), SC: O(1)
int oddOccurring(int[] a) {
    int xor = 0;
    for (int x : a) xor ^= x;
    return xor;
}
```

### 11. Power Set (using bitmask)
```java
// TC: O(2^n * n), SC: O(1) extra
List<List<Integer>> powerSet(int[] a) {
    res = [];
    for (int mask = 0; mask < (1 << n); mask++) {
        subset = [];
        for (int i = 0; i < n; i++)
            if ((mask & (1 << i)) != 0) subset.add(a[i]);
        res.add(subset);
    }
    return res;
}
```

### 12. Find XOR of Numbers from L to R
```java
// TC: O(1), SC: O(1)
int xorLtoR(int L, int R) { return xorTill(R) ^ xorTill(L - 1); }

int xorTill(int n) {           // XOR of 1..n follows a period-4 pattern
    if (n % 4 == 1) return 1;
    if (n % 4 == 2) return n + 1;
    if (n % 4 == 3) return 0;
    return n;                  // n % 4 == 0
}
```

### 13. Find the Two Numbers Appearing an Odd Number of Times
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int[] twoOddOccurring(int[] a) {
    long xor = 0;
    for (int x : a) xor ^= x;              // xor = num1 ^ num2
    int rightmost = (int)(xor & -xor);     // a bit where num1 and num2 differ
    long b1 = 0, b2 = 0;
    for (int x : a) {
        if ((x & rightmost) != 0) b1 ^= x; else b2 ^= x;   // split into two buckets
    }
    return new int[]{(int)Math.max(b1,b2), (int)Math.min(b1,b2)};
}
```

---

## 8.3 Advanced Maths *(5 problems)*

### 14. Print Prime Factors of a Number
```java
// TC: O(sqrt(n)), SC: O(1)
List<Integer> primeFactors(int n) {
    res = [];
    for (int i = 2; i * i <= n; i++)
        while (n % i == 0) { res.add(i); n /= i; }
    if (n > 1) res.add(n);        // remaining n is prime
    return res;
}
```

### 15. All Divisors of a Number
```java
// TC: O(sqrt(n)), SC: O(number of divisors)
List<Integer> allDivisors(int n) {
    small = []; large = [];
    for (int i = 1; i * i <= n; i++)
        if (n % i == 0) { small.add(i); if (i != n / i) large.add(n / i); }
    reverse(large); small.addAll(large);
    return small;
}
```

### 16. Sieve of Eratosthenes
```java
// TC: O(n log log n), SC: O(n)
boolean[] sieve(int n) {
    boolean[] isPrime = new boolean[n + 1]; fill(isPrime, true);
    isPrime[0] = isPrime[1] = false;
    for (int i = 2; (long)i * i <= n; i++)
        if (isPrime[i])
            for (int j = i * i; j <= n; j += i) isPrime[j] = false;   // start at i*i
    return isPrime;
}
```

### 17. Prime Factorisation using the Sieve (SPF)
```java
// Precompute smallest prime factor: O(n log log n). Each query: O(log n).
int[] buildSPF(int n) {
    int[] spf = new int[n + 1];
    for (int i = 2; i <= n; i++) if (spf[i] == 0)
        for (int j = i; j <= n; j += i) if (spf[j] == 0) spf[j] = i;
    return spf;
}

List<Integer> factorise(int x, int[] spf) {
    res = [];
    while (x > 1) { res.add(spf[x]); x /= spf[x]; }
    return res;
}
```

### 18. Power(n, x) — Binary Exponentiation
```java
// TC: O(log x), SC: O(1)
long power(long n, long x) {
    long res = 1;
    while (x > 0) {
        if ((x & 1) == 1) res = res * n;
        n = n * n;
        x >>= 1;
    }
    return res;
}
```

---

# Step 9 — Stack & Queues

## 9.1 Learning *(8 problems)*

### 1. Implement Stack using Arrays
```java
// All ops O(1), SC: O(capacity)
int[] arr; int top = -1;
void push(int x) { arr[++top] = x; }
int  pop()       { return arr[top--]; }
int  peek()      { return arr[top]; }
boolean isEmpty(){ return top == -1; }
```

### 2. Implement Queue using Arrays (circular)
```java
// All ops O(1), SC: O(capacity)
int[] arr; int start = -1, end = -1, size = 0, cap;
void push(int x) {
    if (size == cap) throw Overflow;
    if (size == 0) { start = end = 0; } else end = (end + 1) % cap;
    arr[end] = x; size++;
}
int pop() {
    if (size == 0) throw Underflow;
    int val = arr[start];
    if (size == 1) { start = end = -1; } else start = (start + 1) % cap;
    size--;
    return val;
}
```

### 3. Implement Stack using Queue(s)
```java
// [OPTIMAL] single queue, rotate on push — push O(n), pop/top O(1)
Queue<Integer> q;
void push(int x) {
    q.add(x);
    for (int i = 0; i < q.size() - 1; i++) q.add(q.remove());   // rotate so x is at the front
}
int pop() { return q.remove(); }
int top() { return q.peek(); }
```

### 4. Implement Queue using Stacks
```java
// [OPTIMAL] two stacks, amortised O(1) per op
Stack<Integer> in, out;
void push(int x) { in.push(x); }
int pop() {
    if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());   // reverse order once
    return out.pop();
}
int peek() {
    if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());
    return out.peek();
}
```

### 5. Implement Stack using Linked List
```java
// All ops O(1); push/pop at head
Node head = null; int size = 0;
void push(int x) { Node t = new Node(x); t.next = head; head = t; size++; }
int  pop()       { int v = head.val; head = head.next; size--; return v; }
int  top()       { return head.val; }
```

### 6. Implement Queue using Linked List
```java
// All ops O(1); enqueue at tail, dequeue at head
Node head = null, tail = null; int size = 0;
void push(int x) {
    Node t = new Node(x);
    if (head == null) head = tail = t; else { tail.next = t; tail = t; }
    size++;
}
int pop() {
    int v = head.val; head = head.next;
    if (head == null) tail = null;
    size--; return v;
}
```

### 7. Check for Balanced Parentheses
```java
// TC: O(n), SC: O(n)
boolean isValid(String s) {
    st = new Stack<Character>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else {
            if (st.isEmpty()) return false;
            char open = st.pop();
            if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{'))
                return false;
        }
    }
    return st.isEmpty();
}
```

### 8. Implement Min Stack
getMin() in O(1).
```java
// [OPTIMAL] encode the previous min into the stack — SC: O(n), no auxiliary stack
Stack<Long> st; long min;
void push(int x) {
    if (st.isEmpty()) { st.push((long)x); min = x; }
    else if (x < min) { st.push(2L * x - min); min = x; }   // store an encoded value < x
    else st.push((long)x);
}
void pop() {
    long t = st.pop();
    if (t < min) min = 2 * min - t;                          // decode the previous min
}
int top()    { long t = st.peek(); return (int)(t < min ? min : t); }
int getMin() { return (int)min; }
// [ALT] parallel stack of running minimums → simpler, O(n) extra space
```

---

## 9.2 Prefix, Infix, Postfix Conversions *(6 problems)*

> All conversions run in **TC: O(n), SC: O(n)**. `prec(op)`: `^`=3, `*`,`/`=2, `+`,`-`=1.

### 9. Infix to Postfix
```java
String infixToPostfix(String s) {
    st = new Stack<Character>(); sb = new StringBuilder();
    for (char c : s.toCharArray()) {
        if (isAlnum(c)) sb.append(c);
        else if (c == '(') st.push(c);
        else if (c == ')') { while (st.peek() != '(') sb.append(st.pop()); st.pop(); }
        else {
            // pop while stack top has >= precedence (use > for right-associative '^')
            while (!st.isEmpty() && prec(st.peek()) >= prec(c)) sb.append(st.pop());
            st.push(c);
        }
    }
    while (!st.isEmpty()) sb.append(st.pop());
    return sb.toString();
}
```

### 10. Prefix to Infix
```java
String prefixToInfix(String s) {
    st = new Stack<String>();
    for (int i = s.length() - 1; i >= 0; i--) {          // scan right to left
        char c = s.charAt(i);
        if (isAlnum(c)) st.push("" + c);
        else { String t1 = st.pop(), t2 = st.pop(); st.push("(" + t1 + c + t2 + ")"); }
    }
    return st.pop();
}
```

### 11. Prefix to Postfix
```java
String prefixToPostfix(String s) {
    st = new Stack<String>();
    for (int i = s.length() - 1; i >= 0; i--) {
        char c = s.charAt(i);
        if (isAlnum(c)) st.push("" + c);
        else { String t1 = st.pop(), t2 = st.pop(); st.push(t1 + t2 + c); }
    }
    return st.pop();
}
```

### 12. Postfix to Prefix
```java
String postfixToPrefix(String s) {
    st = new Stack<String>();
    for (char c : s.toCharArray()) {                     // scan left to right
        if (isAlnum(c)) st.push("" + c);
        else { String t1 = st.pop(), t2 = st.pop(); st.push(c + t2 + t1); }   // note reversed order
    }
    return st.pop();
}
```

### 13. Postfix to Infix
```java
String postfixToInfix(String s) {
    st = new Stack<String>();
    for (char c : s.toCharArray()) {
        if (isAlnum(c)) st.push("" + c);
        else { String t1 = st.pop(), t2 = st.pop(); st.push("(" + t2 + c + t1 + ")"); }
    }
    return st.pop();
}
```

### 14. Infix to Prefix
```java
String infixToPrefix(String s) {
    // 1) reverse the infix, swapping '(' <-> ')'
    // 2) run infixToPostfix, but pop only on STRICTLY greater precedence for left-assoc ops
    // 3) reverse the result
    String rev = reverseAndSwapBrackets(s);
    String post = infixToPostfixForPrefix(rev);
    return reverse(post);
}
```

---

## 9.3 Monotonic Stack / Queue Problems *(11 problems)*

### 15. Next Greater Element
```java
// [OPTIMAL] monotonic decreasing stack, scan right to left — TC: O(2n), SC: O(n)
int[] nextGreater(int[] a) {
    int[] res = new int[n]; st = new Stack<Integer>();
    for (int i = n - 1; i >= 0; i--) {
        while (!st.isEmpty() && st.peek() <= a[i]) st.pop();   // pop useless smaller elements
        res[i] = st.isEmpty() ? -1 : st.peek();
        st.push(a[i]);
    }
    return res;
}
```

### 16. Next Greater Element II (circular array)
```java
// TC: O(2n), SC: O(n) — iterate 2n-1 down to 0, index modulo n
int[] nextGreaterCircular(int[] a) {
    int[] res = new int[n]; st = new Stack<Integer>();
    for (int i = 2 * n - 1; i >= 0; i--) {
        while (!st.isEmpty() && st.peek() <= a[i % n]) st.pop();
        if (i < n) res[i] = st.isEmpty() ? -1 : st.peek();
        st.push(a[i % n]);
    }
    return res;
}
```

### 17. Next Smaller Element
```java
// TC: O(2n), SC: O(n)
int[] nextSmaller(int[] a) {
    int[] res = new int[n]; st = new Stack<Integer>();
    for (int i = n - 1; i >= 0; i--) {
        while (!st.isEmpty() && st.peek() >= a[i]) st.pop();
        res[i] = st.isEmpty() ? -1 : st.peek();
        st.push(a[i]);
    }
    return res;
}
// Previous smaller / previous greater: same loop scanning LEFT to RIGHT.
```

### 18. Number of NGEs to the Right (offline queries)
```java
// For each query index, count elements to its right greater than a[idx]. TC: O(n * q) naive.
// [OPTIMAL] merge-sort / BIT on values processed right to left → O((n+q) log n)
int countNGE(int[] a, int idx) {
    int cnt = 0;
    for (int i = idx + 1; i < n; i++) if (a[i] > a[idx]) cnt++;
    return cnt;
}
```

### 19. Trapping Rainwater
```java
// [OPTIMAL] two pointers — TC: O(n), SC: O(1)
int trap(int[] h) {
    int l = 0, r = n - 1, leftMax = 0, rightMax = 0, water = 0;
    while (l < r) {
        if (h[l] <= h[r]) {                    // the smaller side bounds the water level
            if (h[l] >= leftMax) leftMax = h[l]; else water += leftMax - h[l];
            l++;
        } else {
            if (h[r] >= rightMax) rightMax = h[r]; else water += rightMax - h[r];
            r--;
        }
    }
    return water;
}
// [ALT] prefixMax[] + suffixMax[] arrays → O(n) time, O(n) space
```

### 20. Sum of Subarray Minimums
```java
// [OPTIMAL] contribution technique with PSE/NSE — TC: O(n), SC: O(n)
int sumSubarrayMins(int[] a) {
    int[] nse = nextSmallerIndex(a);         // strictly smaller
    int[] pse = prevSmallerOrEqualIndex(a);  // smaller-or-equal → avoids double counting
    long total = 0;
    for (int i = 0; i < n; i++) {
        long left = i - pse[i], right = nse[i] - i;
        total = (total + left * right % MOD * a[i]) % MOD;   // a[i] is min in left*right subarrays
    }
    return (int)total;
}
```

### 21. Asteroid Collision
Positive = moving right, negative = moving left; smaller one explodes.
```java
// TC: O(n), SC: O(n)
int[] asteroidCollision(int[] a) {
    st = new Stack<Integer>();
    for (int x : a) {
        boolean alive = true;
        while (alive && x < 0 && !st.isEmpty() && st.peek() > 0) {   // collision only here
            if (st.peek() < -x) st.pop();                            // stack asteroid explodes
            else if (st.peek() == -x) { st.pop(); alive = false; }   // both explode
            else alive = false;                                      // incoming explodes
        }
        if (alive) st.push(x);
    }
    return stackToArray(st);
}
```

### 22. Sum of Subarray Ranges
Sum over all subarrays of (max − min).
```java
// [OPTIMAL] sumOfSubarrayMaximums - sumOfSubarrayMinimums — TC: O(n), SC: O(n)
long subArrayRanges(int[] a) {
    return sumSubarrayMaxs(a) - sumSubarrayMins(a);   // each via the same contribution technique
}
```

### 23. Remove K Digits
Remove k digits to leave the smallest possible number.
```java
// [OPTIMAL] monotonic increasing stack — TC: O(n), SC: O(n)
String removeKdigits(String num, int k) {
    st = new Stack<Character>();
    for (char c : num.toCharArray()) {
        while (!st.isEmpty() && k > 0 && st.peek() > c) { st.pop(); k--; }  // drop bigger leading digit
        st.push(c);
    }
    while (k-- > 0) st.pop();                       // still need removals → drop from the end
    build string from stack, strip leading zeros;
    return result.isEmpty() ? "0" : result;
}
```

### 24. Largest Rectangle in a Histogram
```java
// [OPTIMAL] single-pass monotonic increasing stack — TC: O(n), SC: O(n)
int largestRectangleArea(int[] h) {
    st = new Stack<Integer>(); int best = 0;
    for (int i = 0; i <= n; i++) {
        int cur = (i == n) ? 0 : h[i];              // sentinel flushes the stack
        while (!st.isEmpty() && h[st.peek()] >= cur) {
            int height = h[st.pop()];
            int left = st.isEmpty() ? -1 : st.peek();
            int width = i - left - 1;
            best = Math.max(best, height * width);
        }
        st.push(i);
    }
    return best;
}
// [ALT] precompute PSE and NSE arrays, then area = h[i] * (nse[i] - pse[i] - 1)
```

### 25. Maximal Rectangle (in a binary matrix)
```java
// [OPTIMAL] histogram per row — TC: O(m*n), SC: O(n)
int maximalRectangle(char[][] mat) {
    int[] heights = new int[n]; int best = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++)
            heights[j] = (mat[i][j] == '1') ? heights[j] + 1 : 0;   // running column heights
        best = Math.max(best, largestRectangleArea(heights));
    }
    return best;
}
```

---

## 9.4 Implementation Problems *(5 problems)*

### 26. Sliding Window Maximum
```java
// [OPTIMAL] monotonic deque of indices — TC: O(2n), SC: O(k)
int[] maxSlidingWindow(int[] a, int k) {
    dq = new ArrayDeque<Integer>();      // holds indices, values decreasing front→back
    res = new int[n - k + 1];
    for (int i = 0; i < n; i++) {
        if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();   // expire out-of-window
        while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
        dq.offerLast(i);
        if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
    }
    return res;
}
```

### 27. Stock Span Problem
Consecutive days (including today) with price <= today's.
```java
// [OPTIMAL] monotonic stack of (price, span) — amortised O(1) per call, SC: O(n)
Stack<int[]> st;
int next(int price) {
    int span = 1;
    while (!st.isEmpty() && st.peek()[0] <= price) span += st.pop()[1];
    st.push(new int[]{price, span});
    return span;
}
```

### 28. The Celebrity Problem
Celebrity is known by all and knows nobody.
```java
// [OPTIMAL] two-pointer elimination — TC: O(n), SC: O(1)
int celebrity(int[][] M) {
    int top = 0, bottom = n - 1;
    while (top < bottom) {
        if (M[top][bottom] == 1) top++;         // top knows bottom → top is not celebrity
        else bottom--;                          // top doesn't know bottom → bottom is not celebrity
    }
    for (int i = 0; i < n; i++) {               // verify the single candidate
        if (i == top) continue;
        if (M[top][i] == 1 || M[i][top] == 0) return -1;
    }
    return top;
}
```

### 29. LRU Cache
`get` and `put` in O(1).
```java
// [OPTIMAL] HashMap + doubly linked list. Head = most recent, tail = least recent.
Map<Integer, DNode> map; DNode head, tail; int capacity;

int get(int key) {
    if (!map.containsKey(key)) return -1;
    DNode node = map.get(key);
    remove(node); insertAfterHead(node);       // mark as most-recently-used
    return node.val;
}

void put(int key, int value) {
    if (map.containsKey(key)) { remove(map.get(key)); map.remove(key); }
    else if (map.size() == capacity) {
        DNode lru = tail.prev;                 // evict least recently used
        remove(lru); map.remove(lru.key);
    }
    DNode node = new DNode(key, value);
    insertAfterHead(node); map.put(key, node);
}
```

### 30. LFU Cache
Evict least frequently used; break ties by least recently used.
```java
// [OPTIMAL] map key->node, map freq->DLL of nodes, plus minFreq — all ops O(1)
Map<Integer, Node> keyMap;              // key -> node(key, val, freq)
Map<Integer, DoublyList> freqMap;       // freq -> nodes with that freq, MRU at head
int minFreq, capacity;

int get(int key) {
    if (!keyMap.containsKey(key)) return -1;
    touch(keyMap.get(key));
    return keyMap.get(key).val;
}

void put(int key, int value) {
    if (capacity == 0) return;
    if (keyMap.containsKey(key)) { keyMap.get(key).val = value; touch(keyMap.get(key)); return; }
    if (keyMap.size() == capacity) {
        Node evict = freqMap.get(minFreq).removeTail();   // LFU + LRU tie-break
        keyMap.remove(evict.key);
    }
    Node node = new Node(key, value, 1);
    keyMap.put(key, node); freqMap.get(1).addFront(node);
    minFreq = 1;
}

void touch(Node node) {                 // move node from freq f to f+1
    freqMap.get(node.freq).remove(node);
    if (freqMap.get(node.freq).isEmpty() && minFreq == node.freq) minFreq++;
    node.freq++;
    freqMap.get(node.freq).addFront(node);
}
```

---

# Step 10 — Sliding Window & Two Pointer

> **Four canonical patterns:** (1) constant window, (2) longest subarray with a condition, (3) count subarrays meeting a condition (often `atMost(k) - atMost(k-1)`), (4) shortest/minimum window.

## 10.1 Medium *(8 problems)*

### 1. Longest Substring Without Repeating Characters
```java
// [OPTIMAL] jump the left pointer — TC: O(n), SC: O(256)
int lengthOfLongestSubstring(String s) {
    int[] lastIdx = new int[256]; fill(lastIdx, -1);
    int l = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        char c = s.charAt(r);
        if (lastIdx[c] >= l) l = lastIdx[c] + 1;     // shrink past the previous occurrence
        best = Math.max(best, r - l + 1);
        lastIdx[c] = r;
    }
    return best;
}
```

### 2. Max Consecutive Ones III
Flip at most k zeroes.
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int longestOnes(int[] a, int k) {
    int l = 0, zeros = 0, best = 0;
    for (int r = 0; r < n; r++) {
        if (a[r] == 0) zeros++;
        while (zeros > k) { if (a[l] == 0) zeros--; l++; }
        best = Math.max(best, r - l + 1);
    }
    return best;
}
```

### 3. Fruit Into Baskets
Longest subarray with at most 2 distinct values.
```java
// TC: O(n), SC: O(3)
int totalFruit(int[] a) {
    map = new HashMap<Integer,Integer>(); int l = 0, best = 0;
    for (int r = 0; r < n; r++) {
        map.merge(a[r], 1, Integer::sum);
        while (map.size() > 2) {
            map.merge(a[l], -1, Integer::sum);
            if (map.get(a[l]) == 0) map.remove(a[l]);
            l++;
        }
        best = Math.max(best, r - l + 1);
    }
    return best;
}
```

### 4. Longest Repeating Character Replacement
Change at most k characters to get the longest uniform substring.
```java
// [OPTIMAL] TC: O(n), SC: O(26)
int characterReplacement(String s, int k) {
    int[] cnt = new int[26]; int l = 0, maxFreq = 0, best = 0;
    for (int r = 0; r < s.length(); r++) {
        maxFreq = Math.max(maxFreq, ++cnt[s.charAt(r) - 'A']);
        // window is valid when (windowLen - maxFreq) <= k
        while ((r - l + 1) - maxFreq > k) cnt[s.charAt(l++) - 'A']--;
        best = Math.max(best, r - l + 1);
    }
    return best;
}
```

### 5. Binary Subarrays with Sum
Count subarrays of a 0/1 array summing exactly to goal.
```java
// [OPTIMAL] atMost(goal) - atMost(goal-1) — TC: O(2n), SC: O(1)
int numSubarraysWithSum(int[] a, int goal) { return atMost(a, goal) - atMost(a, goal - 1); }

int atMost(int[] a, int goal) {
    if (goal < 0) return 0;
    int l = 0, sum = 0, cnt = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];
        while (sum > goal) sum -= a[l++];
        cnt += (r - l + 1);
    }
    return cnt;
}
```

### 6. Count Number of Nice Subarrays
Subarrays with exactly k odd numbers.
```java
// [OPTIMAL] map odd->1, even->0, then reuse the binary-subarray trick — TC: O(2n), SC: O(1)
int numberOfSubarrays(int[] a, int k) { return atMostOdds(a, k) - atMostOdds(a, k - 1); }

int atMostOdds(int[] a, int k) {
    if (k < 0) return 0;
    int l = 0, odds = 0, cnt = 0;
    for (int r = 0; r < n; r++) {
        odds += a[r] % 2;
        while (odds > k) odds -= a[l++] % 2;
        cnt += (r - l + 1);
    }
    return cnt;
}
```

### 7. Number of Substrings Containing All Three Characters
Substrings of a string over {a,b,c} containing each at least once.
```java
// [OPTIMAL] track the last index of each character — TC: O(n), SC: O(3)
int numberOfSubstrings(String s) {
    int[] last = {-1, -1, -1}; int cnt = 0;
    for (int i = 0; i < s.length(); i++) {
        last[s.charAt(i) - 'a'] = i;
        cnt += 1 + Math.min(last[0], Math.min(last[1], last[2]));   // valid start indices
    }
    return cnt;
}
```

### 8. Maximum Points You Can Obtain from Cards
Take k cards from either end, maximise sum.
```java
// [OPTIMAL] sliding the split point — TC: O(2k), SC: O(1)
int maxScore(int[] a, int k) {
    int leftSum = 0, rightSum = 0, best;
    for (int i = 0; i < k; i++) leftSum += a[i];
    best = leftSum;
    for (int i = 0; i < k; i++) {                  // move one card from left end to right end
        leftSum -= a[k - 1 - i];
        rightSum += a[n - 1 - i];
        best = Math.max(best, leftSum + rightSum);
    }
    return best;
}
```

---

## 10.2 Hard *(4 problems)*

### 9. Longest Substring with At Most K Distinct Characters
```java
// [OPTIMAL] TC: O(n), SC: O(k)
int longestKSubstr(String s, int k) {
    map = new HashMap<Character,Integer>(); int l = 0, best = -1;
    for (int r = 0; r < s.length(); r++) {
        map.merge(s.charAt(r), 1, Integer::sum);
        while (map.size() > k) {
            map.merge(s.charAt(l), -1, Integer::sum);
            if (map.get(s.charAt(l)) == 0) map.remove(s.charAt(l));
            l++;
        }
        if (map.size() == k) best = Math.max(best, r - l + 1);
    }
    return best;
}
```

### 10. Subarrays with K Different Integers
```java
// [OPTIMAL] exactly(k) = atMost(k) - atMost(k-1) — TC: O(2n), SC: O(k)
int subarraysWithKDistinct(int[] a, int k) { return atMostDistinct(a, k) - atMostDistinct(a, k - 1); }

int atMostDistinct(int[] a, int k) {
    map = new HashMap<Integer,Integer>(); int l = 0, cnt = 0;
    for (int r = 0; r < n; r++) {
        map.merge(a[r], 1, Integer::sum);
        while (map.size() > k) {
            map.merge(a[l], -1, Integer::sum);
            if (map.get(a[l]) == 0) map.remove(a[l]);
            l++;
        }
        cnt += (r - l + 1);
    }
    return cnt;
}
```

### 11. Minimum Window Substring
Smallest substring of s containing all characters of t (with multiplicity).
```java
// [OPTIMAL] TC: O(2n + m), SC: O(256)
String minWindow(String s, String t) {
    int[] need = new int[256];
    for (char c : t.toCharArray()) need[c]++;
    int l = 0, count = 0, bestLen = INT_MAX, bestStart = -1;
    for (int r = 0; r < s.length(); r++) {
        if (need[s.charAt(r)] > 0) count++;      // this char was still required
        need[s.charAt(r)]--;
        while (count == t.length()) {            // valid window → try to shrink
            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestStart = l; }
            need[s.charAt(l)]++;
            if (need[s.charAt(l)] > 0) count--;
            l++;
        }
    }
    return bestStart == -1 ? "" : s.substring(bestStart, bestStart + bestLen);
}
```

### 12. Minimum Window Subsequence
Smallest substring of s that contains t as a *subsequence* (order matters).
```java
// [OPTIMAL] forward-then-backward two pointer — TC: O(n*m) worst, SC: O(1)
String minWindowSubsequence(String s, String t) {
    int i = 0, bestLen = INT_MAX, bestStart = -1;
    while (i < s.length()) {
        int j = 0, k = i;
        while (k < s.length()) {                       // forward: match t greedily
            if (s.charAt(k) == t.charAt(j)) j++;
            if (j == t.length()) break;
            k++;
        }
        if (j < t.length()) break;                     // no more matches possible
        int end = k; j = t.length() - 1;
        while (k >= i) {                               // backward: tighten the start
            if (s.charAt(k) == t.charAt(j)) j--;
            if (j < 0) break;
            k--;
        }
        if (end - k + 1 < bestLen) { bestLen = end - k + 1; bestStart = k; }
        i = k + 1;                                     // restart just after the tight start
    }
    return bestStart == -1 ? "" : s.substring(bestStart, bestStart + bestLen);
}
// [ALT] DP table dp[i][j] = start index of window in s[0..i] matching t[0..j] → O(n*m) time & space
```

---

# Step 11 — Heaps

## 11.1 Learning *(4 problems)*

### 1. Introduction to Priority Queues (Binary Heaps)
```java
// Complete binary tree stored in an array.
// parent(i) = (i-1)/2, left(i) = 2i+1, right(i) = 2i+2
// insert O(log n), extract O(log n), peek O(1), build O(n)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();                 // Java default = min-heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>((x,y) -> y - x);   // reverse comparator
```

### 2. Min Heap and Max Heap Implementation
```java
// Sift-up on insert — TC: O(log n)
void insert(int[] heap, int size, int val) {
    heap[size] = val; int i = size;
    while (i > 0 && heap[(i - 1) / 2] > heap[i]) { swap(heap, i, (i - 1) / 2); i = (i - 1) / 2; }
}

// Sift-down (heapify) on extract — TC: O(log n)
void heapify(int[] heap, int n, int i) {
    int smallest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && heap[l] < heap[smallest]) smallest = l;
    if (r < n && heap[r] < heap[smallest]) smallest = r;
    if (smallest != i) { swap(heap, i, smallest); heapify(heap, n, smallest); }
}

int extractMin(int[] heap, int size) {
    int root = heap[0];
    heap[0] = heap[size - 1];
    heapify(heap, size - 1, 0);
    return root;
}

// Build heap from an array — TC: O(n), not O(n log n)
void buildHeap(int[] a) { for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i); }
```

### 3. Check if an Array Represents a Min-Heap
```java
// TC: O(n), SC: O(1) — only internal nodes need checking
boolean isMinHeap(int[] a) {
    for (int i = 0; i <= n / 2 - 1; i++) {
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[i] > a[l]) return false;
        if (r < n && a[i] > a[r]) return false;
    }
    return true;
}
```

### 4. Convert Min Heap to Max Heap
```java
// TC: O(n), SC: O(log n) stack — heapify all internal nodes bottom-up
void convertToMaxHeap(int[] a) {
    for (int i = n / 2 - 1; i >= 0; i--) maxHeapify(a, n, i);
}
```

---

## 11.2 Medium *(7 problems)*

### 5. Kth Largest Element in an Array
```java
// [OPTIMAL] min-heap of size k — TC: O(n log k), SC: O(k)
int findKthLargest(int[] a, int k) {
    pq = new PriorityQueue<Integer>();          // min-heap
    for (int x : a) {
        pq.offer(x);
        if (pq.size() > k) pq.poll();           // drop the smallest → heap holds top-k
    }
    return pq.peek();
}
// [ALT] Quickselect → O(n) average, O(n^2) worst, O(1) space
```

### 6. Kth Smallest Element in an Array
```java
// [OPTIMAL] max-heap of size k — TC: O(n log k), SC: O(k)
int findKthSmallest(int[] a, int k) {
    pq = new PriorityQueue<Integer>((x, y) -> y - x);
    for (int x : a) { pq.offer(x); if (pq.size() > k) pq.poll(); }
    return pq.peek();
}
```

### 7. Sort a K-Sorted (nearly sorted) Array
Each element is at most k positions from its sorted place.
```java
// [OPTIMAL] min-heap of size k+1 — TC: O(n log k), SC: O(k)
void sortKSorted(int[] a, int k) {
    pq = new PriorityQueue<Integer>();
    int idx = 0;
    for (int x : a) {
        pq.offer(x);
        if (pq.size() > k) a[idx++] = pq.poll();
    }
    while (!pq.isEmpty()) a[idx++] = pq.poll();
}
```

### 8. Merge M Sorted Lists
```java
// [OPTIMAL] min-heap of list heads — TC: O(N log m), SC: O(m)
Node mergeKLists(Node[] lists) {
    pq = new PriorityQueue<Node>((x, y) -> x.val - y.val);
    for (Node l : lists) if (l != null) pq.offer(l);
    Node dummy = new Node(-1), tail = dummy;
    while (!pq.isEmpty()) {
        Node min = pq.poll();
        tail.next = min; tail = min;
        if (min.next != null) pq.offer(min.next);
    }
    return dummy.next;
}
```

### 9. Replace Each Array Element by Its Rank
```java
// [OPTIMAL] sort distinct values, map value -> rank — TC: O(n log n), SC: O(n)
int[] replaceWithRank(int[] a) {
    sorted = distinct sorted copy of a;
    map = value -> (index + 1) for sorted;
    for (int i = 0; i < n; i++) a[i] = map.get(a[i]);
    return a;
}
```

### 10. Task Scheduler
Minimum time units with a cooldown n between identical tasks.
```java
// [OPTIMAL] maths on the most frequent task — TC: O(n), SC: O(26)
int leastInterval(char[] tasks, int n) {
    int[] freq = new int[26];
    for (char t : tasks) freq[t - 'A']++;
    int maxFreq = max(freq);
    int countMax = number of tasks with freq == maxFreq;
    // frame layout: (maxFreq-1) full frames of size (n+1), plus the final batch
    int slots = (maxFreq - 1) * (n + 1) + countMax;
    return Math.max(slots, tasks.length);         // if enough distinct tasks, no idling needed
}
// [ALT] max-heap simulation with a cooldown queue → O(t log 26)
```

### 11. Hand of Straights
Can cards be grouped into consecutive runs of size groupSize?
```java
// [OPTIMAL] TreeMap greedy — TC: O(n log n), SC: O(n)
boolean isNStraightHand(int[] hand, int groupSize) {
    if (n % groupSize != 0) return false;
    map = new TreeMap<Integer,Integer>(freqOf(hand));
    while (!map.isEmpty()) {
        int start = map.firstKey();               // smallest card must start a group
        for (int c = start; c < start + groupSize; c++) {
            if (!map.containsKey(c)) return false;
            map.merge(c, -1, Integer::sum);
            if (map.get(c) == 0) map.remove(c);
        }
    }
    return true;
}
```

---

## 11.3 Hard *(6 problems)*

### 12. Design Twitter
```java
// [OPTIMAL] per-user tweet lists + k-way merge via heap
Map<Integer, List<int[]>> tweets;     // userId -> list of {timestamp, tweetId}
Map<Integer, Set<Integer>> follows;   // userId -> followees
int timer = 0;

void postTweet(int userId, int tweetId) { tweets.get(userId).add(new int[]{timer++, tweetId}); }

List<Integer> getNewsFeed(int userId) {   // TC: O(f * 10 log f)
    pq = new PriorityQueue<int[]>((x, y) -> y[0] - x[0]);   // max-heap on timestamp
    users = follows.get(userId) + userId;
    for (int u : users)
        for (last up to 10 tweets of u) pq.offer(tweet);
    res = [];
    while (!pq.isEmpty() && res.size() < 10) res.add(pq.poll()[1]);
    return res;
}

void follow(int a, int b)   { follows.get(a).add(b); }
void unfollow(int a, int b) { follows.get(a).remove(b); }
```

### 13. Connect N Ropes with Minimum Cost
```java
// [OPTIMAL] always join the two smallest (Huffman) — TC: O(n log n), SC: O(n)
long minCost(int[] ropes) {
    pq = new PriorityQueue<Long>(ropes);
    long cost = 0;
    while (pq.size() > 1) {
        long a = pq.poll(), b = pq.poll();
        cost += a + b;
        pq.offer(a + b);
    }
    return cost;
}
```

### 14. Kth Largest Element in a Stream
```java
// [OPTIMAL] min-heap capped at size k — add() is O(log k)
PriorityQueue<Integer> pq; int k;
int add(int val) {
    pq.offer(val);
    if (pq.size() > k) pq.poll();
    return pq.peek();
}
```

### 15. Maximum Sum Combination
Top k sums of a[i] + b[j].
```java
// [OPTIMAL] sort both desc, max-heap + visited set — TC: O(k log k), SC: O(k)
List<Integer> maxCombinations(int[] a, int[] b, int k) {
    sortDesc(a); sortDesc(b);
    pq = max-heap of {sum, i, j};   visited = set of (i,j);
    pq.offer({a[0] + b[0], 0, 0}); visited.add((0,0));
    res = [];
    while (res.size() < k) {
        {sum, i, j} = pq.poll();
        res.add(sum);
        if (i + 1 < n && visited.add((i+1, j))) pq.offer({a[i+1] + b[j], i+1, j});
        if (j + 1 < m && visited.add((i, j+1))) pq.offer({a[i] + b[j+1], i, j+1});
    }
    return res;
}
```

### 16. Find Median from Data Stream
```java
// [OPTIMAL] two heaps — addNum O(log n), findMedian O(1)
PriorityQueue<Integer> lo;   // max-heap, smaller half
PriorityQueue<Integer> hi;   // min-heap, larger half

void addNum(int num) {
    lo.offer(num);
    hi.offer(lo.poll());                 // move the largest of lo into hi
    if (hi.size() > lo.size()) lo.offer(hi.poll());   // rebalance: lo >= hi
}

double findMedian() {
    return lo.size() > hi.size() ? lo.peek() : (lo.peek() + hi.peek()) / 2.0;
}
```

### 17. K Most Frequent Elements
```java
// [OPTIMAL] frequency map + min-heap of size k — TC: O(n log k), SC: O(n)
int[] topKFrequent(int[] a, int k) {
    map = freqMap(a);
    pq = new PriorityQueue<Entry>((x, y) -> x.value - y.value);   // min-heap on frequency
    for (entry in map) { pq.offer(entry); if (pq.size() > k) pq.poll(); }
    return keys of pq;
}
// [ALT] bucket sort by frequency → O(n) time
```

---

# Step 12 — Greedy Algorithms

## 12.1 Easy *(5 problems)*

### 1. Assign Cookies
Maximise content children: greed[i] <= size[j].
```java
// [OPTIMAL] sort both, two pointers — TC: O(n log n + m log m), SC: O(1)
int findContentChildren(int[] greed, int[] size) {
    sort(greed); sort(size);
    int i = 0, j = 0;
    while (i < greed.length && j < size.length) {
        if (size[j] >= greed[i]) i++;      // this cookie satisfies this child
        j++;
    }
    return i;
}
```

### 2. Fractional Knapsack
Items can be broken; maximise value within capacity W.
```java
// [OPTIMAL] sort by value/weight ratio desc — TC: O(n log n), SC: O(1)
double fractionalKnapsack(Item[] items, int W) {
    sort(items by (value / weight) descending);
    double total = 0; int cap = W;
    for (Item it : items) {
        if (it.weight <= cap) { total += it.value; cap -= it.weight; }
        else { total += it.value * ((double)cap / it.weight); break; }   // take a fraction
    }
    return total;
}
```

### 3. Minimum Number of Coins (canonical denominations)
```java
// [OPTIMAL for canonical systems] greedy on largest coin — TC: O(n log n + count)
List<Integer> minCoins(int[] coins, int amount) {
    sortDesc(coins); res = [];
    for (int c : coins)
        while (amount >= c) { res.add(c); amount -= c; }
    return res;
}
// NOTE: greedy fails for arbitrary denominations (e.g. {1,15,25}, amount 30) — use DP there.
```

### 4. Lemonade Change
Bills of 5/10/20; give correct change.
```java
// [OPTIMAL] TC: O(n), SC: O(1)
boolean lemonadeChange(int[] bills) {
    int five = 0, ten = 0;
    for (int b : bills) {
        if (b == 5) five++;
        else if (b == 10) { if (five == 0) return false; five--; ten++; }
        else {                                          // prefer giving 10+5 over 5+5+5
            if (ten > 0 && five > 0) { ten--; five--; }
            else if (five >= 3) five -= 3;
            else return false;
        }
    }
    return true;
}
```

### 5. Valid Parenthesis String (with '*' wildcards)
```java
// [OPTIMAL] track min/max possible open count — TC: O(n), SC: O(1)
boolean checkValidString(String s) {
    int minOpen = 0, maxOpen = 0;
    for (char c : s.toCharArray()) {
        if (c == '(')      { minOpen++; maxOpen++; }
        else if (c == ')') { minOpen--; maxOpen--; }
        else               { minOpen--; maxOpen++; }   // '*' = ')' or '(' or ''
        if (maxOpen < 0) return false;                 // too many ')'
        minOpen = Math.max(minOpen, 0);
    }
    return minOpen == 0;
}
```

---

## 12.2 Medium / Hard *(10 problems)*

### 6. N Meetings in One Room
Maximum non-overlapping meetings.
```java
// [OPTIMAL] sort by end time — TC: O(n log n), SC: O(n)
int maxMeetings(int[] start, int[] end) {
    sort meetings by end ascending;
    int count = 1, lastEnd = meetings[0].end;
    for (int i = 1; i < n; i++)
        if (meetings[i].start > lastEnd) { count++; lastEnd = meetings[i].end; }
    return count;
}
```

### 7. Jump Game
Can you reach the last index?
```java
// [OPTIMAL] track the furthest reachable index — TC: O(n), SC: O(1)
boolean canJump(int[] a) {
    int reach = 0;
    for (int i = 0; i < n; i++) {
        if (i > reach) return false;            // stuck before this index
        reach = Math.max(reach, i + a[i]);
    }
    return true;
}
```

### 8. Jump Game II
Minimum jumps to reach the end.
```java
// [OPTIMAL] BFS-like level expansion — TC: O(n), SC: O(1)
int jump(int[] a) {
    int jumps = 0, curEnd = 0, farthest = 0;
    for (int i = 0; i < n - 1; i++) {
        farthest = Math.max(farthest, i + a[i]);
        if (i == curEnd) { jumps++; curEnd = farthest; }   // finished current "level"
    }
    return jumps;
}
```

### 9. Minimum Number of Platforms Required
```java
// [OPTIMAL] sort arrivals & departures separately, sweep — TC: O(n log n), SC: O(1)
int findPlatform(int[] arr, int[] dep) {
    sort(arr); sort(dep);
    int i = 0, j = 0, platforms = 0, best = 0;
    while (i < n) {
        if (arr[i] <= dep[j]) { platforms++; i++; }        // a train arrives before one leaves
        else { platforms--; j++; }
        best = Math.max(best, platforms);
    }
    return best;
}
```

### 10. Job Sequencing Problem
Each job has a deadline and profit; one unit of time each; maximise profit.
```java
// [OPTIMAL] sort by profit desc, place each job as late as possible — TC: O(n log n + n*maxDeadline)
int[] jobScheduling(Job[] jobs) {
    sort(jobs by profit descending);
    int maxDeadline = max deadline;
    boolean[] slot = new boolean[maxDeadline + 1];
    int count = 0, profit = 0;
    for (Job j : jobs)
        for (int t = j.deadline; t >= 1; t--)              // latest free slot before the deadline
            if (!slot[t]) { slot[t] = true; count++; profit += j.profit; break; }
    return new int[]{count, profit};
}
// [ALT] Disjoint Set Union to find the free slot in near-O(1) → O(n log n) overall
```

### 11. Candy
Each child gets >= 1 candy; higher-rated children get more than their neighbours.
```java
// [OPTIMAL] single-pass slope counting — TC: O(n), SC: O(1)
int candy(int[] ratings) {
    int total = 1, i = 1;
    while (i < n) {
        if (ratings[i] == ratings[i - 1]) { total += 1; i++; continue; }
        int peak = 1;
        while (i < n && ratings[i] > ratings[i - 1]) { peak++; total += peak; i++; }   // up-slope
        int down = 1;
        while (i < n && ratings[i] < ratings[i - 1]) { total += down; down++; i++; }   // down-slope
        if (down > peak) total += (down - peak);           // the peak must exceed the longer side
    }
    return total;
}
// [ALT] two passes with left[] and right[] arrays → O(n) time, O(n) space (easier to reason about)
```

### 12. Shortest Job First (SJF) — Average Waiting Time
```java
// [OPTIMAL] sort by burst time — TC: O(n log n), SC: O(1)
double sjfAverageWait(int[] burst) {
    sort(burst);
    int elapsed = 0; long totalWait = 0;
    for (int b : burst) { totalWait += elapsed; elapsed += b; }
    return (double)totalWait / n;
}
```

### 13. LRU Page Replacement / Insert Interval
```java
// Insert Interval: merge a new interval into a sorted non-overlapping list.
// TC: O(n), SC: O(n)
int[][] insert(int[][] intervals, int[] newInt) {
    res = []; int i = 0;
    while (i < n && intervals[i][1] < newInt[0]) res.add(intervals[i++]);      // strictly before
    while (i < n && intervals[i][0] <= newInt[1]) {                            // overlapping
        newInt[0] = Math.min(newInt[0], intervals[i][0]);
        newInt[1] = Math.max(newInt[1], intervals[i][1]);
        i++;
    }
    res.add(newInt);
    while (i < n) res.add(intervals[i++]);                                     // strictly after
    return res;
}
```

### 14. Merge Intervals
```java
// [OPTIMAL] sort by start — TC: O(n log n), SC: O(n)
int[][] merge(int[][] intervals) {
    sort(intervals by start);
    res = [];
    for (int[] iv : intervals) {
        if (res.isEmpty() || iv[0] > res.last()[1]) res.add(iv);
        else res.last()[1] = Math.max(res.last()[1], iv[1]);
    }
    return res;
}
```

### 15. Non-overlapping Intervals
Minimum removals to make intervals non-overlapping.
```java
// [OPTIMAL] sort by END time, keep greedily — TC: O(n log n), SC: O(1)
int eraseOverlapIntervals(int[][] intervals) {
    sort(intervals by end);
    int kept = 1, lastEnd = intervals[0][1];
    for (int i = 1; i < n; i++)
        if (intervals[i][0] >= lastEnd) { kept++; lastEnd = intervals[i][1]; }
    return n - kept;
}
```

---

# Step 13 — Binary Trees

> `class TreeNode { int val; TreeNode left, right; }`

## 13.1 Traversals *(13 problems)*

### 1. Introduction to Trees (theory)
```java
// Full tree: every node has 0 or 2 children.
// Complete tree: all levels filled except possibly the last, which fills left-to-right.
// Perfect tree: all leaves at the same level; nodes = 2^h - 1.
// Balanced tree: height = O(log n).
// Degenerate tree: behaves like a linked list; height = n.
```

### 2. Binary Tree Representation in Java
```java
class TreeNode {
    int val; TreeNode left, right;
    TreeNode(int v) { val = v; left = right = null; }
}
// Array representation (for heaps / complete trees): left(i)=2i+1, right(i)=2i+2, parent(i)=(i-1)/2
```

### 3. Binary Tree Traversals (theory)
```java
// DFS: Preorder (Root, L, R) | Inorder (L, Root, R) | Postorder (L, R, Root)
// BFS: Level order — uses a queue.
// All traversals: TC O(n); recursive SC O(h) stack, iterative SC O(h) or O(n) for level order.
```

### 4. Preorder Traversal (recursive)
```java
// TC: O(n), SC: O(h)
void preorder(TreeNode root, List<Integer> res) {
    if (root == null) return;
    res.add(root.val);
    preorder(root.left, res);
    preorder(root.right, res);
}
```

### 5. Inorder Traversal (recursive)
```java
void inorder(TreeNode root, List<Integer> res) {
    if (root == null) return;
    inorder(root.left, res);
    res.add(root.val);            // for a BST this yields sorted order
    inorder(root.right, res);
}
```

### 6. Postorder Traversal (recursive)
```java
void postorder(TreeNode root, List<Integer> res) {
    if (root == null) return;
    postorder(root.left, res);
    postorder(root.right, res);
    res.add(root.val);
}
```

### 7. Level Order Traversal (and spiral form)
```java
// TC: O(n), SC: O(n)
List<List<Integer>> levelOrder(TreeNode root) {
    if (root == null) return [];
    q = new LinkedList<TreeNode>(); q.offer(root);
    res = [];
    while (!q.isEmpty()) {
        int size = q.size(); level = [];
        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            level.add(node.val);
            if (node.left != null)  q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        res.add(level);
    }
    return res;
}
```

### 8. Iterative Preorder Traversal
```java
// TC: O(n), SC: O(h)
List<Integer> preorderIterative(TreeNode root) {
    if (root == null) return [];
    st = new Stack<TreeNode>(); st.push(root); res = [];
    while (!st.isEmpty()) {
        TreeNode node = st.pop();
        res.add(node.val);
        if (node.right != null) st.push(node.right);   // push right FIRST so left pops first
        if (node.left != null)  st.push(node.left);
    }
    return res;
}
```

### 9. Iterative Inorder Traversal
```java
// TC: O(n), SC: O(h)
List<Integer> inorderIterative(TreeNode root) {
    st = new Stack<TreeNode>(); TreeNode cur = root; res = [];
    while (true) {
        if (cur != null) { st.push(cur); cur = cur.left; }     // go as far left as possible
        else {
            if (st.isEmpty()) break;
            cur = st.pop();
            res.add(cur.val);
            cur = cur.right;
        }
    }
    return res;
}
```

### 10. Postorder Traversal using 2 Stacks
```java
// TC: O(n), SC: O(2n)
List<Integer> postorderTwoStacks(TreeNode root) {
    if (root == null) return [];
    st1 = new Stack(); st2 = new Stack();
    st1.push(root);
    while (!st1.isEmpty()) {
        TreeNode node = st1.pop();
        st2.push(node);
        if (node.left != null)  st1.push(node.left);
        if (node.right != null) st1.push(node.right);
    }
    while (!st2.isEmpty()) res.add(st2.pop().val);   // st2 holds reverse-postorder
    return res;
}
```

### 11. Postorder Traversal using 1 Stack
```java
// TC: O(n), SC: O(h)
List<Integer> postorderOneStack(TreeNode root) {
    st = new Stack<TreeNode>(); TreeNode cur = root, lastVisited = null; res = [];
    while (cur != null || !st.isEmpty()) {
        if (cur != null) { st.push(cur); cur = cur.left; }
        else {
            TreeNode peek = st.peek();
            if (peek.right != null && lastVisited != peek.right) cur = peek.right;
            else { res.add(peek.val); lastVisited = st.pop(); }
        }
    }
    return res;
}
```

### 12. Preorder, Inorder and Postorder in One Traversal
```java
// [OPTIMAL] state machine on a stack — TC: O(3n), SC: O(4n)
void allThree(TreeNode root) {
    st = stack of {node, state};   st.push({root, 1});
    while (!st.isEmpty()) {
        {node, state} = st.pop();
        if (state == 1) { pre.add(node.val); st.push({node, 2}); if (node.left  != null) st.push({node.left, 1}); }
        else if (state == 2) { in.add(node.val); st.push({node, 3}); if (node.right != null) st.push({node.right, 1}); }
        else post.add(node.val);
    }
}
```

### 13. Tree Traversal Complexity Summary
```java
// Recursive  : TC O(n), SC O(h) — O(log n) balanced, O(n) skewed
// Iterative  : same TC, explicit stack
// Morris     : TC O(n), SC O(1) — uses threaded binary tree links (see 13.3)
```

---

## 13.2 Medium Problems *(12 problems)*

### 14. Height / Maximum Depth of a Binary Tree
```java
// TC: O(n), SC: O(h)
int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}
```

### 15. Check if Binary Tree is Height-Balanced
```java
// [OPTIMAL] single post-order pass, -1 signals "unbalanced" — TC: O(n), SC: O(h)
boolean isBalanced(TreeNode root) { return check(root) != -1; }

int check(TreeNode node) {
    if (node == null) return 0;
    int lh = check(node.left);  if (lh == -1) return -1;
    int rh = check(node.right); if (rh == -1) return -1;
    if (Math.abs(lh - rh) > 1) return -1;
    return 1 + Math.max(lh, rh);
}
// [ALT] compute height at every node → O(n^2)
```

### 16. Diameter of a Binary Tree
Longest path between any two nodes (edge count).
```java
// [OPTIMAL] TC: O(n), SC: O(h)
int diameter = 0;
int height(TreeNode node) {
    if (node == null) return 0;
    int lh = height(node.left), rh = height(node.right);
    diameter = Math.max(diameter, lh + rh);     // path through this node
    return 1 + Math.max(lh, rh);
}
```

### 17. Maximum Path Sum
Any node-to-node path.
```java
// [OPTIMAL] TC: O(n), SC: O(h)
int best = INT_MIN;
int gain(TreeNode node) {
    if (node == null) return 0;
    int l = Math.max(0, gain(node.left));       // discard negative contributions
    int r = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + l + r);    // path turning at this node
    return node.val + Math.max(l, r);           // only one branch can extend upward
}
```

### 18. Check if Two Trees are Identical
```java
// TC: O(n), SC: O(h)
boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null || q == null) return p == q;
    return p.val == q.val && isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```

### 19. Zig-Zag (Spiral) Level Order Traversal
```java
// TC: O(n), SC: O(n)
List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    if (root == null) return [];
    q = queue with root; boolean leftToRight = true; res = [];
    while (!q.isEmpty()) {
        int size = q.size(); int[] level = new int[size];
        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            int idx = leftToRight ? i : size - 1 - i;    // fill positionally instead of reversing
            level[idx] = node.val;
            if (node.left != null)  q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        leftToRight = !leftToRight;
        res.add(level);
    }
    return res;
}
```

### 20. Boundary Traversal (anti-clockwise)
```java
// [OPTIMAL] left boundary + leaves + reversed right boundary — TC: O(n), SC: O(n)
List<Integer> boundary(TreeNode root) {
    res = [];
    if (!isLeaf(root)) res.add(root.val);
    addLeftBoundary(root.left, res);     // walk left, prefer left child, skip leaves
    addLeaves(root, res);                // inorder/preorder collecting leaves only
    addRightBoundary(root.right, res);   // walk right, prefer right child, skip leaves; add REVERSED
    return res;
}

void addLeftBoundary(TreeNode node, List res) {
    while (node != null) {
        if (!isLeaf(node)) res.add(node.val);
        node = (node.left != null) ? node.left : node.right;
    }
}

void addLeaves(TreeNode node, List res) {
    if (isLeaf(node)) { res.add(node.val); return; }
    if (node.left != null)  addLeaves(node.left, res);
    if (node.right != null) addLeaves(node.right, res);
}
```

### 21. Vertical Order Traversal
Sort by (column, row, value).
```java
// [OPTIMAL] BFS with (node, row, col) + TreeMap — TC: O(n log n), SC: O(n)
List<List<Integer>> verticalTraversal(TreeNode root) {
    map = TreeMap<col, TreeMap<row, PriorityQueue<val>>>;
    q = queue of {node, row, col}; q.offer({root, 0, 0});
    while (!q.isEmpty()) {
        {node, row, col} = q.poll();
        map.get(col).get(row).offer(node.val);           // min-heap breaks value ties
        if (node.left != null)  q.offer({node.left,  row + 1, col - 1});
        if (node.right != null) q.offer({node.right, row + 1, col + 1});
    }
    flatten map in key order into res;
    return res;
}
```

### 22. Top View of Binary Tree
```java
// [OPTIMAL] BFS + first node seen per column — TC: O(n log n), SC: O(n)
List<Integer> topView(TreeNode root) {
    map = new TreeMap<Integer,Integer>();      // col -> first value seen
    q = queue of {node, col}; q.offer({root, 0});
    while (!q.isEmpty()) {
        {node, col} = q.poll();
        map.putIfAbsent(col, node.val);        // BFS guarantees the topmost node arrives first
        if (node.left != null)  q.offer({node.left,  col - 1});
        if (node.right != null) q.offer({node.right, col + 1});
    }
    return map.values();
}
```

### 23. Bottom View of Binary Tree
```java
// Same as top view, but always OVERWRITE — TC: O(n log n), SC: O(n)
List<Integer> bottomView(TreeNode root) {
    map = new TreeMap<Integer,Integer>();
    q = queue of {node, col}; q.offer({root, 0});
    while (!q.isEmpty()) {
        {node, col} = q.poll();
        map.put(col, node.val);                // last write wins → lowest node in that column
        if (node.left != null)  q.offer({node.left,  col - 1});
        if (node.right != null) q.offer({node.right, col + 1});
    }
    return map.values();
}
```

### 24. Right / Left View of Binary Tree
```java
// [OPTIMAL] reverse-preorder DFS, first node per level — TC: O(n), SC: O(h)
void rightView(TreeNode node, int level, List<Integer> res) {
    if (node == null) return;
    if (level == res.size()) res.add(node.val);   // first node reached at this depth
    rightView(node.right, level + 1, res);        // right FIRST for right view
    rightView(node.left,  level + 1, res);
}
// Left view: swap the order of the two recursive calls.
```

### 25. Symmetric Binary Tree
```java
// TC: O(n), SC: O(h)
boolean isSymmetric(TreeNode root) { return root == null || isMirror(root.left, root.right); }

boolean isMirror(TreeNode a, TreeNode b) {
    if (a == null || b == null) return a == b;
    return a.val == b.val && isMirror(a.left, b.right) && isMirror(a.right, b.left);
}
```

---

## 13.3 Hard Problems *(14 problems)*

### 26. Root to Node Path in a Binary Tree
```java
// TC: O(n), SC: O(h)
boolean getPath(TreeNode node, int target, List<Integer> path) {
    if (node == null) return false;
    path.add(node.val);
    if (node.val == target) return true;
    if (getPath(node.left, target, path) || getPath(node.right, target, path)) return true;
    path.removeLast();                      // backtrack: this node isn't on the path
    return false;
}
```

### 27. Lowest Common Ancestor in a Binary Tree
```java
// [OPTIMAL] single pass — TC: O(n), SC: O(h)
TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left  = lca(root.left, p, q);
    TreeNode right = lca(root.right, p, q);
    if (left != null && right != null) return root;   // p and q split here → this is the LCA
    return (left != null) ? left : right;
}
```

### 28. Maximum Width of a Binary Tree
Width = nodes between the leftmost and rightmost non-null of a level, counting nulls.
```java
// [OPTIMAL] index nodes as in a heap, normalise per level to avoid overflow — TC: O(n), SC: O(n)
int widthOfBinaryTree(TreeNode root) {
    if (root == null) return 0;
    q = queue of {node, index}; q.offer({root, 0}); int best = 0;
    while (!q.isEmpty()) {
        int size = q.size();
        int minIdx = q.peek().index, first = 0, last = 0;
        for (int i = 0; i < size; i++) {
            {node, idx} = q.poll(); idx -= minIdx;             // normalise
            if (i == 0) first = idx;
            if (i == size - 1) last = idx;
            if (node.left != null)  q.offer({node.left,  2 * idx + 1});
            if (node.right != null) q.offer({node.right, 2 * idx + 2});
        }
        best = Math.max(best, last - first + 1);
    }
    return best;
}
```

### 29. Check for Children Sum Property
Every node's value equals the sum of its children (convert the tree to satisfy it).
```java
// [OPTIMAL] top-down push then bottom-up fix — TC: O(n), SC: O(h)
void changeTree(TreeNode node) {
    if (node == null) return;
    int childSum = (node.left != null ? node.left.val : 0)
                 + (node.right != null ? node.right.val : 0);
    if (childSum >= node.val) node.val = childSum;
    else {                                       // push the parent value down to both children
        if (node.left != null)  node.left.val  = node.val;
        if (node.right != null) node.right.val = node.val;
    }
    changeTree(node.left);
    changeTree(node.right);
    int total = (node.left != null ? node.left.val : 0)
              + (node.right != null ? node.right.val : 0);
    if (node.left != null || node.right != null) node.val = total;    // fix on the way back up
}
```

### 30. All Nodes at Distance K in a Binary Tree
```java
// [OPTIMAL] map child->parent, then BFS in all 3 directions — TC: O(n), SC: O(n)
List<Integer> distanceK(TreeNode root, TreeNode target, int k) {
    parent = new HashMap<TreeNode,TreeNode>();
    markParents(root, parent);
    visited = new HashSet<>(); q = queue with target; visited.add(target);
    int dist = 0;
    while (!q.isEmpty()) {
        if (dist == k) break;
        int size = q.size();
        for (int i = 0; i < size; i++) {
            TreeNode cur = q.poll();
            for (TreeNode nb : {cur.left, cur.right, parent.get(cur)})
                if (nb != null && visited.add(nb)) q.offer(nb);
        }
        dist++;
    }
    return values in q;
}
```

### 31. Minimum Time to Burn the Binary Tree from a Node
```java
// [OPTIMAL] same parent-map + BFS, count levels — TC: O(n), SC: O(n)
int minTimeToBurn(TreeNode root, int startVal) {
    parent = map child -> parent;  TreeNode start = markParentsAndFind(root, parent, startVal);
    visited = {start}; q = queue with start; int time = 0;
    while (!q.isEmpty()) {
        int size = q.size(); boolean spread = false;
        for (int i = 0; i < size; i++) {
            TreeNode cur = q.poll();
            for (TreeNode nb : {cur.left, cur.right, parent.get(cur)})
                if (nb != null && visited.add(nb)) { q.offer(nb); spread = true; }
        }
        if (spread) time++;
    }
    return time;
}
```

### 32. Count Total Nodes in a Complete Binary Tree
```java
// [OPTIMAL] exploit completeness — TC: O(log^2 n), SC: O(log n)
int countNodes(TreeNode root) {
    if (root == null) return 0;
    int lh = leftHeight(root), rh = rightHeight(root);
    if (lh == rh) return (1 << lh) - 1;              // perfect subtree → closed form
    return 1 + countNodes(root.left) + countNodes(root.right);
}

int leftHeight(TreeNode n)  { int h = 0; while (n != null) { h++; n = n.left; }  return h; }
int rightHeight(TreeNode n) { int h = 0; while (n != null) { h++; n = n.right; } return h; }
```

### 33. Requirements to Construct a Unique Binary Tree (theory)
```java
// Inorder + Preorder  -> unique tree  (YES)
// Inorder + Postorder -> unique tree  (YES)
// Preorder + Postorder -> NOT unique for a general binary tree (unique only for a FULL binary tree)
// Reason: inorder is what splits left/right subtrees; without it the boundary is ambiguous.
```

### 34. Construct Binary Tree from Inorder and Preorder
```java
// [OPTIMAL] hashmap of inorder indices — TC: O(n), SC: O(n)
TreeNode build(int[] pre, int preS, int preE, int[] in, int inS, int inE, Map<Integer,Integer> idx) {
    if (preS > preE || inS > inE) return null;
    TreeNode root = new TreeNode(pre[preS]);
    int inRoot = idx.get(root.val);
    int numsLeft = inRoot - inS;
    root.left  = build(pre, preS + 1, preS + numsLeft, in, inS, inRoot - 1, idx);
    root.right = build(pre, preS + numsLeft + 1, preE, in, inRoot + 1, inE, idx);
    return root;
}
```

### 35. Construct Binary Tree from Inorder and Postorder
```java
// TC: O(n), SC: O(n) — postorder's LAST element is the root
TreeNode build(int[] post, int postS, int postE, int[] in, int inS, int inE, Map<Integer,Integer> idx) {
    if (postS > postE || inS > inE) return null;
    TreeNode root = new TreeNode(post[postE]);
    int inRoot = idx.get(root.val);
    int numsLeft = inRoot - inS;
    root.left  = build(post, postS, postS + numsLeft - 1, in, inS, inRoot - 1, idx);
    root.right = build(post, postS + numsLeft, postE - 1, in, inRoot + 1, inE, idx);
    return root;
}
```

### 36. Serialize and Deserialize Binary Tree
```java
// [OPTIMAL] level-order with null markers — TC: O(n), SC: O(n)
String serialize(TreeNode root) {
    if (root == null) return "";
    sb = new StringBuilder(); q = queue with root;
    while (!q.isEmpty()) {
        TreeNode node = q.poll();
        if (node == null) { sb.append("#,"); continue; }
        sb.append(node.val).append(',');
        q.offer(node.left); q.offer(node.right);
    }
    return sb.toString();
}

TreeNode deserialize(String data) {
    if (data.isEmpty()) return null;
    tokens = data.split(",");
    TreeNode root = new TreeNode(parse(tokens[0]));
    q = queue with root; int i = 1;
    while (!q.isEmpty()) {
        TreeNode parent = q.poll();
        if (!tokens[i].equals("#")) { parent.left  = new TreeNode(parse(tokens[i])); q.offer(parent.left); }
        i++;
        if (!tokens[i].equals("#")) { parent.right = new TreeNode(parse(tokens[i])); q.offer(parent.right); }
        i++;
    }
    return root;
}
```

### 37. Morris Inorder Traversal
```java
// [OPTIMAL] threaded traversal — TC: O(n), SC: O(1)
List<Integer> morrisInorder(TreeNode root) {
    res = []; TreeNode cur = root;
    while (cur != null) {
        if (cur.left == null) { res.add(cur.val); cur = cur.right; }
        else {
            TreeNode pred = cur.left;
            while (pred.right != null && pred.right != cur) pred = pred.right;   // rightmost of left subtree
            if (pred.right == null) { pred.right = cur; cur = cur.left; }        // create thread
            else { pred.right = null; res.add(cur.val); cur = cur.right; }       // remove thread, visit
        }
    }
    return res;
}
```

### 38. Morris Preorder Traversal
```java
// TC: O(n), SC: O(1) — identical, but print BEFORE moving left
List<Integer> morrisPreorder(TreeNode root) {
    res = []; TreeNode cur = root;
    while (cur != null) {
        if (cur.left == null) { res.add(cur.val); cur = cur.right; }
        else {
            TreeNode pred = cur.left;
            while (pred.right != null && pred.right != cur) pred = pred.right;
            if (pred.right == null) { pred.right = cur; res.add(cur.val); cur = cur.left; }
            else { pred.right = null; cur = cur.right; }
        }
    }
    return res;
}
```

### 39. Flatten Binary Tree to Linked List (right-skewed, preorder)
```java
// [OPTIMAL] Morris-style — TC: O(n), SC: O(1)
void flatten(TreeNode root) {
    TreeNode cur = root;
    while (cur != null) {
        if (cur.left != null) {
            TreeNode pred = cur.left;
            while (pred.right != null) pred = pred.right;
            pred.right = cur.right;        // attach the current right subtree to the predecessor
            cur.right = cur.left;
            cur.left = null;
        }
        cur = cur.right;
    }
}
// [ALT] reverse-preorder recursion (right → left → root) with a `prev` pointer → O(n) time, O(h) space
```

---

# Step 14 — Binary Search Trees

## 14.1 Concepts *(3 problems)*

### 1. Introduction to Binary Search Tree
```java
// Invariant: left subtree < node < right subtree (typically no duplicates,
// or duplicates handled with a count field / by convention on one side).
// Search / insert / delete: O(h) — O(log n) balanced, O(n) skewed.
// Inorder traversal of a BST is sorted ascending.
```

### 2. Search in a Binary Search Tree
```java
// TC: O(h), SC: O(1)
TreeNode searchBST(TreeNode root, int val) {
    while (root != null && root.val != val)
        root = (val < root.val) ? root.left : root.right;
    return root;
}
```

### 3. Find Min / Max in BST
```java
// TC: O(h), SC: O(1)
int findMin(TreeNode root) { while (root.left  != null) root = root.left;  return root.val; }
int findMax(TreeNode root) { while (root.right != null) root = root.right; return root.val; }
```

---

## 14.2 Practice Problems *(13 problems)*

### 4. Ceil in a BST
Smallest value >= key.
```java
// TC: O(h), SC: O(1)
int findCeil(TreeNode root, int key) {
    int ceil = -1;
    while (root != null) {
        if (root.val == key) return root.val;
        if (root.val < key) root = root.right;
        else { ceil = root.val; root = root.left; }   // candidate; look for a tighter one
    }
    return ceil;
}
```

### 5. Floor in a BST
Largest value <= key.
```java
int findFloor(TreeNode root, int key) {
    int floor = -1;
    while (root != null) {
        if (root.val == key) return root.val;
        if (root.val > key) root = root.left;
        else { floor = root.val; root = root.right; }
    }
    return floor;
}
```

### 6. Insert a Node in a BST
```java
// [OPTIMAL] iterative, insert as a leaf — TC: O(h), SC: O(1)
TreeNode insertIntoBST(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    TreeNode cur = root;
    while (true) {
        if (val <= cur.val) {
            if (cur.left == null) { cur.left = new TreeNode(val); break; }
            cur = cur.left;
        } else {
            if (cur.right == null) { cur.right = new TreeNode(val); break; }
            cur = cur.right;
        }
    }
    return root;
}
```

### 7. Delete a Node in a BST
```java
// [OPTIMAL] TC: O(h), SC: O(1)
TreeNode deleteNode(TreeNode root, int key) {
    if (root == null) return null;
    if (root.val == key) return helper(root);
    TreeNode dummy = root;
    while (root != null) {
        if (key < root.val) {
            if (root.left != null && root.left.val == key) { root.left = helper(root.left); break; }
            root = root.left;
        } else {
            if (root.right != null && root.right.val == key) { root.right = helper(root.right); break; }
            root = root.right;
        }
    }
    return dummy;
}

TreeNode helper(TreeNode node) {         // remove `node`, return its replacement subtree
    if (node.left == null)  return node.right;
    if (node.right == null) return node.left;
    TreeNode rightChild = node.right;
    TreeNode rightmostOfLeft = findRightmost(node.left);
    rightmostOfLeft.right = rightChild;  // graft the right subtree under the left's rightmost node
    return node.left;
}
```

### 8. Kth Smallest / Largest Element in a BST
```java
// [OPTIMAL] inorder with a counter — TC: O(h + k), SC: O(h)
int counter = 0, ans = -1;
void kthSmallest(TreeNode node, int k) {
    if (node == null) return;
    kthSmallest(node.left, k);
    if (++counter == k) { ans = node.val; return; }
    kthSmallest(node.right, k);
}
// Kth LARGEST: do a reverse inorder (right, root, left) with the same counter.
```

### 9. Check if a Tree is a BST
```java
// [OPTIMAL] range validation — TC: O(n), SC: O(h)
boolean isValidBST(TreeNode node, long min, long max) {
    if (node == null) return true;
    if (node.val <= min || node.val >= max) return false;
    return isValidBST(node.left, min, node.val) && isValidBST(node.right, node.val, max);
}
// Call: isValidBST(root, LONG_MIN, LONG_MAX)
// [ALT] inorder traversal must be strictly increasing
```

### 10. LCA in a Binary Search Tree
```java
// [OPTIMAL] exploit ordering — TC: O(h), SC: O(1)
TreeNode lcaBST(TreeNode root, TreeNode p, TreeNode q) {
    while (root != null) {
        if (p.val < root.val && q.val < root.val) root = root.left;
        else if (p.val > root.val && q.val > root.val) root = root.right;
        else return root;                  // the split point is the LCA
    }
    return null;
}
```

### 11. Construct a BST from a Preorder Traversal
```java
// [OPTIMAL] upper-bound recursion, single pass — TC: O(n), SC: O(h)
int i = 0;
TreeNode buildBST(int[] pre, int bound) {
    if (i == pre.length || pre[i] > bound) return null;
    TreeNode root = new TreeNode(pre[i++]);
    root.left  = buildBST(pre, root.val);   // left subtree values are < root
    root.right = buildBST(pre, bound);      // right subtree values are < parent bound
    return root;
}
// [ALT] sort preorder to get inorder, then build from (pre, in) → O(n log n)
```

### 12. Inorder Successor / Predecessor in a BST
```java
// TC: O(h), SC: O(1)
TreeNode inorderSuccessor(TreeNode root, TreeNode p) {
    TreeNode succ = null;
    while (root != null) {
        if (p.val >= root.val) root = root.right;
        else { succ = root; root = root.left; }      // candidate; try to find something smaller
    }
    return succ;
}
// Predecessor: mirror the comparisons (go left when p.val <= root.val).
```

### 13. Merge Two BSTs
```java
// [OPTIMAL] two inorder arrays + merge + build balanced BST — TC: O(n+m), SC: O(n+m)
TreeNode mergeBSTs(TreeNode r1, TreeNode r2) {
    a = inorder(r1); b = inorder(r2);            // both sorted
    merged = mergeTwoSortedArrays(a, b);
    return buildBalanced(merged, 0, merged.size() - 1);
}

TreeNode buildBalanced(List<Integer> a, int lo, int hi) {
    if (lo > hi) return null;
    int mid = (lo + hi) / 2;
    TreeNode root = new TreeNode(a.get(mid));
    root.left  = buildBalanced(a, lo, mid - 1);
    root.right = buildBalanced(a, mid + 1, hi);
    return root;
}
```

### 14. BST Iterator
`next()` and `hasNext()` in amortised O(1), SC O(h).
```java
Stack<TreeNode> st;
void pushAllLeft(TreeNode node) { while (node != null) { st.push(node); node = node.left; } }

boolean hasNext() { return !st.isEmpty(); }

int next() {
    TreeNode node = st.pop();
    pushAllLeft(node.right);
    return node.val;
}
// Constructor: pushAllLeft(root)
```

### 15. Two Sum in a BST
```java
// [OPTIMAL] two BST iterators (forward + reverse) — TC: O(n), SC: O(h)
boolean findTarget(TreeNode root, int k) {
    BSTIterator left  = new BSTIterator(root, false);   // ascending
    BSTIterator right = new BSTIterator(root, true);    // descending
    int i = left.next(), j = right.next();
    while (i < j) {
        if (i + j == k) return true;
        if (i + j < k) i = left.next(); else j = right.next();
    }
    return false;
}
// [ALT] inorder into an array + two pointers → O(n) time, O(n) space
```

### 16. Correct a BST with Two Nodes Swapped
```java
// [OPTIMAL] inorder scan tracking violations — TC: O(n), SC: O(h)
TreeNode first = null, middle = null, last = null, prev = new TreeNode(INT_MIN);

void inorderFix(TreeNode node) {
    if (node == null) return;
    inorderFix(node.left);
    if (prev != null && node.val < prev.val) {
        if (first == null) { first = prev; middle = node; }   // first violation
        else last = node;                                     // second violation
    }
    prev = node;
    inorderFix(node.right);
}

void recoverTree(TreeNode root) {
    inorderFix(root);
    if (last != null) swapValues(first, last);      // non-adjacent swap
    else swapValues(first, middle);                 // adjacent swap
}
```

### 17. Largest BST in a Binary Tree
```java
// [OPTIMAL] post-order returning {minVal, maxVal, size} — TC: O(n), SC: O(h)
int[] largestBST(TreeNode node) {          // returns {min, max, size}
    if (node == null) return new int[]{INT_MAX, INT_MIN, 0};
    int[] l = largestBST(node.left);
    int[] r = largestBST(node.right);
    if (l[1] < node.val && node.val < r[0])                    // valid BST rooted here
        return new int[]{Math.min(l[0], node.val), Math.max(r[1], node.val), l[2] + r[2] + 1};
    // invalid → propagate an impossible range so no ancestor can be a BST through here
    return new int[]{INT_MIN, INT_MAX, Math.max(l[2], r[2])};
}
```

---

# Step 15 — Graphs

> Notation: `adj` = `List<Integer>[]` or `List<List<int[]>>` for weighted graphs (`{node, weight}`).

## 15.1 Learning *(6 problems)*

### 1. Graph and Its Types (theory)
```java
// Directed vs Undirected | Weighted vs Unweighted | Cyclic vs Acyclic (DAG)
// Degree: undirected sum of degrees = 2E. Directed: indegree + outdegree.
// Connected component: a maximal set of mutually reachable nodes.
// A graph may have MULTIPLE components → always loop over all nodes when traversing.
```

### 2. Graph Representation
```java
// Adjacency matrix: SC O(V^2), edge lookup O(1) — good for dense graphs.
int[][] matrix = new int[V + 1][V + 1];
matrix[u][v] = 1; matrix[v][u] = 1;               // undirected

// Adjacency list: SC O(V + 2E) — the default choice.
List<Integer>[] adj = new List[V + 1];
adj[u].add(v); adj[v].add(u);

// Weighted list: adj[u].add(new int[]{v, weight});
```

### 3. Connected Components Logic
```java
// TC: O(V + 2E), SC: O(V)
int countComponents(List<Integer>[] adj, int V) {
    boolean[] vis = new boolean[V]; int count = 0;
    for (int i = 0; i < V; i++)
        if (!vis[i]) { dfs(i, adj, vis); count++; }   // each unvisited start = a new component
    return count;
}
```

### 4. Breadth-First Search (BFS)
```java
// TC: O(V + 2E), SC: O(V)
List<Integer> bfs(int start, List<Integer>[] adj, int V) {
    boolean[] vis = new boolean[V];
    q = new LinkedList<Integer>(); q.offer(start); vis[start] = true;
    res = [];
    while (!q.isEmpty()) {
        int node = q.poll();
        res.add(node);
        for (int nb : adj[node])
            if (!vis[nb]) { vis[nb] = true; q.offer(nb); }   // mark on ENQUEUE, not on dequeue
    }
    return res;
}
```

### 5. Depth-First Search (DFS)
```java
// TC: O(V + 2E), SC: O(V)
void dfs(int node, List<Integer>[] adj, boolean[] vis, List<Integer> res) {
    vis[node] = true;
    res.add(node);
    for (int nb : adj[node]) if (!vis[nb]) dfs(nb, adj, vis, res);
}
```

### 6. Number of Provinces
Count connected components given an adjacency matrix.
```java
// TC: O(n^2), SC: O(n)
int findCircleNum(int[][] isConnected) {
    boolean[] vis = new boolean[n]; int provinces = 0;
    for (int i = 0; i < n; i++)
        if (!vis[i]) { dfsMatrix(i, isConnected, vis); provinces++; }
    return provinces;
}

void dfsMatrix(int node, int[][] mat, boolean[] vis) {
    vis[node] = true;
    for (int j = 0; j < n; j++)
        if (mat[node][j] == 1 && !vis[j]) dfsMatrix(j, mat, vis);
}
```

---

## 15.2 BFS / DFS Problems *(13 problems)*

### 7. Number of Islands (connected components in a matrix)
```java
// [OPTIMAL] TC: O(m*n), SC: O(m*n)
int numIslands(char[][] grid) {
    boolean[][] vis = new boolean[m][n]; int count = 0;
    for (i, j in grid)
        if (grid[i][j] == '1' && !vis[i][j]) { bfsIsland(i, j, grid, vis); count++; }
    return count;
}

void bfsIsland(int r, int c, char[][] grid, boolean[][] vis) {
    q = queue with {r, c}; vis[r][c] = true;
    while (!q.isEmpty()) {
        {i, j} = q.poll();
        for (all 8 (or 4) neighbours ni, nj)
            if (inBounds(ni, nj) && grid[ni][nj] == '1' && !vis[ni][nj]) {
                vis[ni][nj] = true; q.offer({ni, nj});
            }
    }
}
```

### 8. Rotting Oranges
Minimum minutes until every fresh orange rots (multi-source BFS).
```java
// [OPTIMAL] TC: O(m*n), SC: O(m*n)
int orangesRotting(int[][] grid) {
    q = queue of {i, j, time}; int fresh = 0;
    for (i, j in grid) {
        if (grid[i][j] == 2) { q.offer({i, j, 0}); vis[i][j] = 2; }   // ALL rotten start together
        else if (grid[i][j] == 1) fresh++;
    }
    int time = 0, rotted = 0;
    while (!q.isEmpty()) {
        {r, c, t} = q.poll(); time = Math.max(time, t);
        for (4 directions ni, nj)
            if (inBounds && grid[ni][nj] == 1 && vis[ni][nj] != 2) {
                vis[ni][nj] = 2; rotted++; q.offer({ni, nj, t + 1});
            }
    }
    return rotted == fresh ? time : -1;
}
```

### 9. Flood Fill
```java
// TC: O(m*n), SC: O(m*n)
int[][] floodFill(int[][] image, int sr, int sc, int newColor) {
    int oldColor = image[sr][sc];
    if (oldColor == newColor) return image;        // guard against infinite recursion
    dfsFill(image, sr, sc, oldColor, newColor);
    return image;
}

void dfsFill(int[][] img, int i, int j, int oldC, int newC) {
    if (!inBounds(i, j) || img[i][j] != oldC) return;
    img[i][j] = newC;
    for (4 directions ni, nj) dfsFill(img, ni, nj, oldC, newC);
}
```

### 10. Cycle Detection in an Undirected Graph (BFS)
```java
// TC: O(V + 2E), SC: O(V)
boolean hasCycleBFS(int start, List<Integer>[] adj, boolean[] vis) {
    q = queue of {node, parent}; q.offer({start, -1}); vis[start] = true;
    while (!q.isEmpty()) {
        {node, parent} = q.poll();
        for (int nb : adj[node]) {
            if (!vis[nb]) { vis[nb] = true; q.offer({nb, node}); }
            else if (nb != parent) return true;    // visited and not the parent → cycle
        }
    }
    return false;
}
```

### 11. Cycle Detection in an Undirected Graph (DFS)
```java
// TC: O(V + 2E), SC: O(V)
boolean hasCycleDFS(int node, int parent, List<Integer>[] adj, boolean[] vis) {
    vis[node] = true;
    for (int nb : adj[node]) {
        if (!vis[nb]) { if (hasCycleDFS(nb, node, adj, vis)) return true; }
        else if (nb != parent) return true;
    }
    return false;
}
```

### 12. 0/1 Matrix — Distance of Nearest 0
```java
// [OPTIMAL] multi-source BFS from all zeroes — TC: O(m*n), SC: O(m*n)
int[][] updateMatrix(int[][] mat) {
    int[][] dist = new int[m][n]; q = new LinkedList();
    for (i, j in mat)
        if (mat[i][j] == 0) { q.offer({i, j}); vis[i][j] = true; }
    while (!q.isEmpty()) {
        {r, c} = q.poll();
        for (4 directions ni, nj)
            if (inBounds && !vis[ni][nj]) {
                vis[ni][nj] = true;
                dist[ni][nj] = dist[r][c] + 1;
                q.offer({ni, nj});
            }
    }
    return dist;
}
```

### 13. Surrounded Regions
Capture every 'O' region not touching the border.
```java
// [OPTIMAL] DFS from the borders to mark survivors — TC: O(m*n), SC: O(m*n)
void solve(char[][] board) {
    for (every border cell (i,j) with board[i][j] == 'O') dfsMark(board, i, j, vis);
    for (i, j in board)
        if (board[i][j] == 'O' && !vis[i][j]) board[i][j] = 'X';   // unreachable from border → flip
}
```

### 14. Number of Enclaves
Count land cells that cannot walk off the boundary.
```java
// [OPTIMAL] multi-source BFS from boundary land — TC: O(m*n), SC: O(m*n)
int numEnclaves(int[][] grid) {
    q = all boundary cells with value 1, marked visited;
    BFS from q marking all reachable land as visited;
    count = number of cells with grid[i][j] == 1 && !vis[i][j];
    return count;
}
```

### 15. Word Ladder I
Shortest transformation sequence length from beginWord to endWord.
```java
// [OPTIMAL] BFS over the word graph — TC: O(N * L * 26), SC: O(N)
int ladderLength(String begin, String end, List<String> wordList) {
    set = new HashSet<>(wordList);
    q = queue of {word, steps}; q.offer({begin, 1}); set.remove(begin);
    while (!q.isEmpty()) {
        {word, steps} = q.poll();
        if (word.equals(end)) return steps;
        for (int i = 0; i < word.length(); i++)
            for (char c = 'a'; c <= 'z'; c++) {
                String next = replaceCharAt(word, i, c);
                if (set.contains(next)) { set.remove(next); q.offer({next, steps + 1}); }
            }
    }
    return 0;
}
```

### 16. Word Ladder II
All shortest transformation sequences.
```java
// [OPTIMAL] BFS level-by-level (delete words only after finishing a level) + backtrack from end
List<List<String>> findLadders(String begin, String end, List<String> wordList) {
    set = new HashSet<>(wordList);
    q = queue of List<String> sequences; q.offer([begin]);
    usedOnLevel = [begin]; int level = 0;
    res = [];
    while (!q.isEmpty()) {
        List<String> seq = q.poll();
        if (seq.size() > level) {                    // moved to a new level
            level = seq.size();
            for (String w : usedOnLevel) set.remove(w);   // now safe to delete
            usedOnLevel.clear();
        }
        String last = seq.last();
        if (last.equals(end)) { if (res.isEmpty() || res.get(0).size() == seq.size()) res.add(seq); }
        for (each 1-char mutation `next` of last)
            if (set.contains(next)) {
                seq.add(next); q.offer(copy(seq)); seq.removeLast();
                usedOnLevel.add(next);
            }
    }
    return res;
}
// [ALT] BFS to compute distances, then DFS backwards from end using dist[] → far more memory-efficient
```

### 17. Number of Distinct Islands
Islands identical up to translation count once.
```java
// [OPTIMAL] normalise each shape relative to its base cell — TC: O(m*n*log), SC: O(m*n)
int countDistinctIslands(int[][] grid) {
    set = new HashSet<List<String>>();
    for (i, j in grid)
        if (grid[i][j] == 1 && !vis[i][j]) {
            shape = [];
            dfsShape(i, j, i, j, grid, vis, shape);   // record (row - baseRow, col - baseCol)
            set.add(shape);
        }
    return set.size();
}

void dfsShape(int r, int c, int br, int bc, int[][] g, boolean[][] vis, List shape) {
    vis[r][c] = true;
    shape.add((r - br) + "_" + (c - bc));
    for (4 directions nr, nc)
        if (inBounds && g[nr][nc] == 1 && !vis[nr][nc]) dfsShape(nr, nc, br, bc, g, vis, shape);
}
```

### 18. Bipartite Graph (Check with BFS/DFS)
Can nodes be 2-coloured so no edge joins same-coloured nodes?
```java
// [OPTIMAL] TC: O(V + 2E), SC: O(V). A graph is bipartite iff it has no odd-length cycle.
boolean isBipartiteDFS(int node, int col, int[] color, List<Integer>[] adj) {
    color[node] = col;
    for (int nb : adj[node]) {
        if (color[nb] == -1) { if (!isBipartiteDFS(nb, 1 - col, color, adj)) return false; }
        else if (color[nb] == col) return false;      // same colour on both ends of an edge
    }
    return true;
}
```

### 19. Cycle Detection in a Directed Graph (DFS)
```java
// [OPTIMAL] two visited arrays — TC: O(V + E), SC: O(V)
boolean hasCycleDirected(int node, List<Integer>[] adj, boolean[] vis, boolean[] pathVis) {
    vis[node] = true; pathVis[node] = true;
    for (int nb : adj[node]) {
        if (!vis[nb]) { if (hasCycleDirected(nb, adj, vis, pathVis)) return true; }
        else if (pathVis[nb]) return true;            // back edge to the CURRENT recursion path
    }
    pathVis[node] = false;                            // backtrack
    return false;
}
```

---

## 15.3 Topological Sort & Problems *(7 problems)*

### 20. Topological Sort (DFS)
Linear ordering of a DAG such that every edge u→v has u before v.
```java
// TC: O(V + E), SC: O(V)
void topoDFS(int node, List<Integer>[] adj, boolean[] vis, Stack<Integer> st) {
    vis[node] = true;
    for (int nb : adj[node]) if (!vis[nb]) topoDFS(nb, adj, vis, st);
    st.push(node);                    // push AFTER all descendants → reverse finishing order
}
// Answer = pop the entire stack.
```

### 21. Kahn's Algorithm (BFS Topological Sort)
```java
// TC: O(V + E), SC: O(V)
int[] topoBFS(int V, List<Integer>[] adj) {
    int[] indeg = new int[V];
    for (int u = 0; u < V; u++) for (int v : adj[u]) indeg[v]++;
    q = all nodes with indeg == 0;
    res = []; 
    while (!q.isEmpty()) {
        int node = q.poll();
        res.add(node);
        for (int nb : adj[node]) if (--indeg[nb] == 0) q.offer(nb);
    }
    return res;
}
```

### 22. Cycle Detection in a Directed Graph (Kahn's / BFS)
```java
// If topological order length < V, some nodes never reached indegree 0 → a cycle exists.
boolean isCyclicDirectedBFS(int V, List<Integer>[] adj) {
    return topoBFS(V, adj).size() != V;
}
```

### 23. Course Schedule I
Can all courses be finished given prerequisite pairs?
```java
// TC: O(V + E), SC: O(V)
boolean canFinish(int numCourses, int[][] prerequisites) {
    build adj: for [a, b] add edge b -> a;      // b must come before a
    return topoBFS(numCourses, adj).size() == numCourses;
}
```

### 24. Course Schedule II
Return one valid order (or empty if impossible).
```java
int[] findOrder(int numCourses, int[][] prerequisites) {
    order = topoBFS(numCourses, adj);
    return order.size() == numCourses ? order : new int[0];
}
```

### 25. Find Eventual Safe States
Nodes from which every path leads to a terminal node.
```java
// [OPTIMAL] Kahn's on the REVERSED graph — TC: O(V + E), SC: O(V)
List<Integer> eventualSafeNodes(int[][] graph) {
    build reverseAdj (v -> u for each edge u -> v);
    indeg[u] = outdegree of u in the original graph;
    q = all nodes with indeg == 0 (terminal nodes);
    safe = [];
    while (!q.isEmpty()) {
        int node = q.poll(); safe.add(node);
        for (int nb : reverseAdj[node]) if (--indeg[nb] == 0) q.offer(nb);
    }
    sort(safe);
    return safe;
}
// [ALT] DFS cycle detection: any node on or leading to a cycle is unsafe.
```

### 26. Alien Dictionary
Derive the character order from a sorted list of alien words.
```java
// [OPTIMAL] build a graph of character precedences, then topo sort — TC: O(N*L + K), SC: O(K)
String alienOrder(String[] words, int K) {
    adj = new List[K];
    for (int i = 0; i < words.length - 1; i++) {
        String a = words[i], b = words[i + 1];
        int len = Math.min(a.length(), b.length()); boolean found = false;
        for (int j = 0; j < len; j++)
            if (a.charAt(j) != b.charAt(j)) {
                adj[a.charAt(j) - 'a'].add(b.charAt(j) - 'a');   // first mismatch gives the order
                found = true; break;
            }
        if (!found && a.length() > b.length()) return "";        // invalid: prefix comes after
    }
    order = topoBFS(K, adj);
    return order.size() == K ? toString(order) : "";             // cycle → no valid ordering
}
```

---

## 15.4 Shortest Path Algorithms & Problems *(13 problems)*

### 27. Shortest Path in an Undirected Graph with Unit Weights
```java
// [OPTIMAL] plain BFS — TC: O(V + E), SC: O(V)
int[] shortestPathUnit(int V, List<Integer>[] adj, int src) {
    int[] dist = new int[V]; fill(dist, INT_MAX);
    dist[src] = 0; q = queue with src;
    while (!q.isEmpty()) {
        int node = q.poll();
        for (int nb : adj[node])
            if (dist[node] + 1 < dist[nb]) { dist[nb] = dist[node] + 1; q.offer(nb); }
    }
    return dist;
}
```

### 28. Shortest Path in a DAG
```java
// [OPTIMAL] topological order + relax edges once — TC: O(V + E), SC: O(V)
int[] shortestPathDAG(int V, List<int[]>[] adj, int src) {
    Stack<Integer> topo = topoSortDFS(V, adj);
    int[] dist = new int[V]; fill(dist, INT_MAX); dist[src] = 0;
    while (!topo.isEmpty()) {
        int node = topo.pop();
        if (dist[node] == INT_MAX) continue;
        for (int[] e : adj[node])                       // e = {neighbour, weight}
            dist[e[0]] = Math.min(dist[e[0]], dist[node] + e[1]);
    }
    return dist;
}
// Works with NEGATIVE weights too (no cycles possible in a DAG).
```

### 29. Dijkstra's Algorithm
```java
// [OPTIMAL] min-heap — TC: O(E log V), SC: O(V). Non-negative weights only.
int[] dijkstra(int V, List<int[]>[] adj, int src) {
    int[] dist = new int[V]; fill(dist, INT_MAX); dist[src] = 0;
    pq = new PriorityQueue<int[]>((a, b) -> a[0] - b[0]);   // {distance, node}
    pq.offer(new int[]{0, src});
    while (!pq.isEmpty()) {
        int[] top = pq.poll();
        int d = top[0], node = top[1];
        if (d > dist[node]) continue;                       // stale entry
        for (int[] e : adj[node]) {
            int nb = e[0], w = e[1];
            if (d + w < dist[nb]) { dist[nb] = d + w; pq.offer(new int[]{dist[nb], nb}); }
        }
    }
    return dist;
}
// To print the path: keep parent[] and walk backwards from the destination.
```

### 30. Why a Priority Queue in Dijkstra? (theory)
```java
// A queue explores paths in insertion order and re-relaxes the same node many times.
// The PQ always expands the currently-cheapest node, so each node is finalised once
// → O(E log V) instead of exponential blow-up.
// Dijkstra FAILS on negative edges: a finalised node may later be improved. Use Bellman-Ford.
```

### 31. Shortest Path in a Binary Maze
```java
// [OPTIMAL] BFS (all edge weights are 1, so no PQ needed) — TC: O(m*n), SC: O(m*n)
int shortestPathBinaryMatrix(int[][] grid, int[] src, int[] dest) {
    if (grid[src] == 0) return -1;
    dist matrix filled with INT_MAX; dist[src] = 0;
    q = queue with {0, src};
    while (!q.isEmpty()) {
        {d, r, c} = q.poll();
        if ({r,c} == dest) return d;
        for (8 (or 4) directions nr, nc)
            if (inBounds && grid[nr][nc] == 1 && d + 1 < dist[nr][nc]) {
                dist[nr][nc] = d + 1; q.offer({d + 1, nr, nc});
            }
    }
    return -1;
}
```

### 32. Path with Minimum Effort
Minimise the maximum absolute height difference along a path.
```java
// [OPTIMAL] Dijkstra with max-edge cost — TC: O(m*n log(m*n)), SC: O(m*n)
int minimumEffortPath(int[][] heights) {
    effort matrix filled with INT_MAX; effort[0][0] = 0;
    pq = min-heap of {effort, r, c}; pq.offer({0, 0, 0});
    while (!pq.isEmpty()) {
        {diff, r, c} = pq.poll();
        if (r == m - 1 && c == n - 1) return diff;
        for (4 directions nr, nc) {
            int newEffort = Math.max(diff, Math.abs(heights[nr][nc] - heights[r][c]));
            if (newEffort < effort[nr][nc]) { effort[nr][nc] = newEffort; pq.offer({newEffort, nr, nc}); }
        }
    }
    return 0;
}
// [ALT] binary search on the answer + BFS feasibility check
```

### 33. Cheapest Flights Within K Stops
```java
// [OPTIMAL] BFS/Bellman-Ford by stop count (a PQ on price is WRONG here) — TC: O(E*K), SC: O(V)
int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
    int[] dist = new int[n]; fill(dist, INT_MAX); dist[src] = 0;
    q = queue of {stops, node, cost}; q.offer({0, src, 0});
    while (!q.isEmpty()) {
        {stops, node, cost} = q.poll();
        if (stops > k) continue;
        for (int[] e : adj[node]) {
            int nb = e[0], price = e[1];
            if (cost + price < dist[nb] && stops <= k) {
                dist[nb] = cost + price;
                q.offer({stops + 1, nb, cost + price});
            }
        }
    }
    return dist[dst] == INT_MAX ? -1 : dist[dst];
}
// Key insight: order by NUMBER OF STOPS, not by price, or the k-constraint is violated.
```

### 34. Network Delay Time
Time for a signal from k to reach every node.
```java
// [OPTIMAL] Dijkstra, answer = max finite distance — TC: O(E log V), SC: O(V)
int networkDelayTime(int[][] times, int n, int k) {
    int[] dist = dijkstra(n, adj, k);
    int max = 0;
    for (int d : dist) { if (d == INT_MAX) return -1; max = Math.max(max, d); }
    return max;
}
```

### 35. Number of Ways to Arrive at Destination
Count shortest paths from 0 to n-1.
```java
// [OPTIMAL] Dijkstra carrying a path count — TC: O(E log V), SC: O(V)
int countPaths(int n, int[][] roads) {
    long[] dist = fill(INF); long[] ways = new long[n];
    dist[0] = 0; ways[0] = 1;
    pq = min-heap of {dist, node}; pq.offer({0, 0});
    while (!pq.isEmpty()) {
        {d, node} = pq.poll();
        if (d > dist[node]) continue;
        for (int[] e : adj[node]) {
            int nb = e[0]; long w = e[1];
            if (d + w < dist[nb]) {                       // strictly better path
                dist[nb] = d + w; ways[nb] = ways[node];
                pq.offer({dist[nb], nb});
            } else if (d + w == dist[nb]) {               // another path of equal length
                ways[nb] = (ways[nb] + ways[node]) % MOD;
            }
        }
    }
    return (int)ways[n - 1];
}
```

### 36. Minimum Multiplications to Reach End
From start, repeatedly multiply by an array element mod 100000; reach end in fewest steps.
```java
// [OPTIMAL] BFS over the 100000 states — TC: O(100000 * n), SC: O(100000)
int minimumMultiplications(int[] arr, int start, int end) {
    int mod = 100000;
    int[] dist = new int[mod]; fill(dist, INT_MAX); dist[start] = 0;
    q = queue with {start, 0};
    while (!q.isEmpty()) {
        {node, steps} = q.poll();
        if (node == end) return steps;
        for (int x : arr) {
            int next = (node * x) % mod;
            if (steps + 1 < dist[next]) { dist[next] = steps + 1; q.offer({next, steps + 1}); }
        }
    }
    return -1;
}
```

### 37. Bellman-Ford Algorithm
Single-source shortest paths with negative weights; detects negative cycles.
```java
// TC: O(V * E), SC: O(V). Works on DIRECTED graphs (model undirected edges as two directed ones).
int[] bellmanFord(int V, int[][] edges, int src) {
    int[] dist = new int[V]; fill(dist, 1e8); dist[src] = 0;
    for (int i = 0; i < V - 1; i++)                 // V-1 relaxation rounds suffice
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != 1e8 && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
        }
    for (int[] e : edges)                            // Vth round: any improvement = negative cycle
        if (dist[e[0]] != 1e8 && dist[e[0]] + e[2] < dist[e[1]]) return new int[]{-1};
    return dist;
}
```

### 38. Floyd-Warshall Algorithm
All-pairs shortest paths.
```java
// TC: O(V^3), SC: O(V^2)
void floydWarshall(int[][] dist) {                  // dist[i][j] = weight, INF if no edge, 0 on diagonal
    for (int via = 0; via < V; via++)               // intermediate node MUST be the outer loop
        for (int i = 0; i < V; i++)
            for (int j = 0; j < V; j++)
                if (dist[i][via] != INF && dist[via][j] != INF)
                    dist[i][j] = Math.min(dist[i][j], dist[i][via] + dist[via][j]);
    // negative cycle exists iff dist[i][i] < 0 for some i
}
```

### 39. City with the Smallest Number of Neighbours within a Threshold
```java
// [OPTIMAL] Floyd-Warshall then count — TC: O(V^3), SC: O(V^2)
int findTheCity(int n, int[][] edges, int threshold) {
    dist = floydWarshall(build matrix from edges);
    int best = -1, minCount = INT_MAX;
    for (int i = 0; i < n; i++) {
        int cnt = 0;
        for (int j = 0; j < n; j++) if (i != j && dist[i][j] <= threshold) cnt++;
        if (cnt <= minCount) { minCount = cnt; best = i; }   // <= so ties pick the LARGEST index
    }
    return best;
}
```

---

## 15.5 Minimum Spanning Tree & Disjoint Set *(12 problems)*

### 40. Minimum Spanning Tree — Theory
```java
// A spanning tree has V nodes and V-1 edges and keeps the graph connected.
// The MST is the spanning tree of minimum total edge weight.
// Two standard algorithms: Prim's (grow one tree) and Kruskal's (sort edges + DSU).
```

### 41. Prim's Algorithm
```java
// [OPTIMAL] TC: O(E log E), SC: O(V + E)
int primsMST(int V, List<int[]>[] adj) {
    boolean[] inMST = new boolean[V];
    pq = min-heap of {weight, node, parent}; pq.offer({0, 0, -1});
    int sum = 0; mstEdges = [];
    while (!pq.isEmpty()) {
        {wt, node, parent} = pq.poll();
        if (inMST[node]) continue;                  // already absorbed
        inMST[node] = true; sum += wt;
        if (parent != -1) mstEdges.add({parent, node});
        for (int[] e : adj[node]) if (!inMST[e[0]]) pq.offer({e[1], e[0], node});
    }
    return sum;
}
```

### 42. Disjoint Set — Union by Rank
```java
// TC: O(alpha(n)) ~ O(1) amortised per op with path compression
int[] parent, rank;

int find(int x) {
    if (parent[x] == x) return x;
    return parent[x] = find(parent[x]);             // path compression
}

void unionByRank(int u, int v) {
    int pu = find(u), pv = find(v);
    if (pu == pv) return;
    if (rank[pu] < rank[pv]) parent[pu] = pv;
    else if (rank[pv] < rank[pu]) parent[pv] = pu;
    else { parent[pv] = pu; rank[pu]++; }
}
```

### 43. Disjoint Set — Union by Size
```java
int[] parent, size;

void unionBySize(int u, int v) {
    int pu = find(u), pv = find(v);
    if (pu == pv) return;
    if (size[pu] < size[pv]) { parent[pu] = pv; size[pv] += size[pu]; }
    else                     { parent[pv] = pu; size[pu] += size[pv]; }
}
// Union by size is usually preferred: component sizes are directly queryable.
```

### 44. Kruskal's Algorithm
```java
// [OPTIMAL] TC: O(E log E + E * alpha(V)), SC: O(V)
int kruskalMST(int V, int[][] edges) {             // edges = {u, v, weight}
    sort(edges by weight ascending);
    dsu = new DSU(V);
    int sum = 0, used = 0;
    for (int[] e : edges) {
        if (dsu.find(e[0]) != dsu.find(e[1])) {     // adding it would not create a cycle
            dsu.unionBySize(e[0], e[1]);
            sum += e[2]; used++;
            if (used == V - 1) break;
        }
    }
    return sum;
}
```

### 45. Number of Operations to Make Network Connected
```java
// [OPTIMAL] DSU: count extra edges and components — TC: O(E * alpha), SC: O(V)
int makeConnected(int n, int[][] connections) {
    if (connections.length < n - 1) return -1;      // not enough cables
    dsu = new DSU(n); int extraEdges = 0;
    for (int[] c : connections) {
        if (dsu.find(c[0]) == dsu.find(c[1])) extraEdges++;
        else dsu.unionBySize(c[0], c[1]);
    }
    int components = count of i where dsu.find(i) == i;
    return components - 1;                          // need components-1 cables; we have enough
}
```

### 46. Most Stones Removed with Same Row or Column
```java
// [OPTIMAL] union stones sharing a row/column; answer = n - components — TC: O(n * alpha), SC: O(maxCoord)
int removeStones(int[][] stones) {
    dsu = new DSU(2 * 10001);                       // rows: 0..10000, cols: 10001..20001
    set = new HashSet<Integer>();
    for (int[] s : stones) {
        int row = s[0], col = s[1] + 10001;
        dsu.unionBySize(row, col);
        set.add(row); set.add(col);
    }
    int components = count of nodes in set that are their own parent;
    return stones.length - components;
}
```

### 47. Accounts Merge
```java
// [OPTIMAL] union accounts sharing an email — TC: O(N*K log(N*K)), SC: O(N*K)
List<List<String>> accountsMerge(List<List<String>> accounts) {
    dsu = new DSU(accounts.size());
    mailToNode = new HashMap<String,Integer>();
    for (int i = 0; i < accounts.size(); i++)
        for (String mail : emails of accounts[i]) {
            if (!mailToNode.containsKey(mail)) mailToNode.put(mail, i);
            else dsu.unionBySize(i, mailToNode.get(mail));
        }
    group emails by dsu.find(node); sort each group; prepend the account name;
    return result;
}
```

### 48. Number of Islands II (online / dynamic)
Land is added one cell at a time; report the island count after each addition.
```java
// [OPTIMAL] DSU — TC: O(q * alpha), SC: O(m*n)
List<Integer> numOfIslands(int m, int n, int[][] operators) {
    dsu = new DSU(m * n); boolean[][] isLand = new boolean[m][n];
    int count = 0; res = [];
    for (int[] op : operators) {
        int r = op[0], c = op[1];
        if (isLand[r][c]) { res.add(count); continue; }   // duplicate operation
        isLand[r][c] = true; count++;
        for (4 directions nr, nc)
            if (inBounds && isLand[nr][nc]) {
                int nodeA = r * n + c, nodeB = nr * n + nc;
                if (dsu.find(nodeA) != dsu.find(nodeB)) { dsu.unionBySize(nodeA, nodeB); count--; }
            }
        res.add(count);
    }
    return res;
}
```

### 49. Making a Large Island
Flip at most one 0 to 1 to maximise island size.
```java
// [OPTIMAL] DSU over existing islands, then try each 0 — TC: O(m*n*alpha), SC: O(m*n)
int largestIsland(int[][] grid) {
    dsu = new DSU(n * n);
    for (i, j with grid[i][j] == 1)
        for (4 directions ni, nj) if (inBounds && grid[ni][nj] == 1) dsu.unionBySize(i*n+j, ni*n+nj);
    int best = 0;
    for (i, j with grid[i][j] == 0) {
        components = set of distinct dsu.find(neighbour) over the 4 neighbours that are land;
        int total = 1;
        for (int p : components) total += dsu.size[p];     // set avoids double-counting one island
        best = Math.max(best, total);
    }
    if (best == 0) return n * n;                            // grid was all 1s
    return best;
}
```

### 50. Swim in Rising Water
Minimum time t such that a path exists using only cells with height <= t.
```java
// [OPTIMAL] Dijkstra on max-cell-height (or DSU by increasing height) — TC: O(n^2 log n), SC: O(n^2)
int swimInWater(int[][] grid) {
    pq = min-heap of {height, r, c}; pq.offer({grid[0][0], 0, 0}); vis[0][0] = true;
    int time = 0;
    while (!pq.isEmpty()) {
        {h, r, c} = pq.poll();
        time = Math.max(time, h);
        if (r == n - 1 && c == n - 1) return time;
        for (4 directions nr, nc)
            if (inBounds && !vis[nr][nc]) { vis[nr][nc] = true; pq.offer({grid[nr][nc], nr, nc}); }
    }
    return -1;
}
```

### 51. Bridges in a Graph (Tarjan's)
Edges whose removal disconnects the graph.
```java
// [OPTIMAL] TC: O(V + 2E), SC: O(V)
int timer = 1;
void dfsBridge(int node, int parent, List<Integer>[] adj, boolean[] vis,
               int[] tin, int[] low, List<int[]> bridges) {
    vis[node] = true;
    tin[node] = low[node] = timer++;
    for (int nb : adj[node]) {
        if (nb == parent) continue;
        if (!vis[nb]) {
            dfsBridge(nb, node, adj, vis, tin, low, bridges);
            low[node] = Math.min(low[node], low[nb]);
            if (low[nb] > tin[node]) bridges.add(new int[]{node, nb});  // no back edge above node
        } else low[node] = Math.min(low[node], tin[nb]);                // back edge
    }
}
```

### 52. Articulation Points in a Graph
Nodes whose removal increases the number of components.
```java
// [OPTIMAL] TC: O(V + 2E), SC: O(V)
int timer = 1;
void dfsAP(int node, int parent, List<Integer>[] adj, boolean[] vis,
           int[] tin, int[] low, boolean[] isAP) {
    vis[node] = true;
    tin[node] = low[node] = timer++;
    int child = 0;
    for (int nb : adj[node]) {
        if (nb == parent) continue;
        if (!vis[nb]) {
            dfsAP(nb, node, adj, vis, tin, low, isAP);
            low[node] = Math.min(low[node], low[nb]);
            if (low[nb] >= tin[node] && parent != -1) isAP[node] = true;  // note >=, unlike bridges
            child++;
        } else low[node] = Math.min(low[node], tin[nb]);
    }
    if (parent == -1 && child > 1) isAP[node] = true;   // root is an AP iff it has 2+ DFS children
}
```

---

## 15.6 Other Algorithms *(2 problems)*

### 53. Kosaraju's Algorithm — Strongly Connected Components
Maximal sets of mutually reachable nodes in a directed graph.
```java
// [OPTIMAL] TC: O(V + E), SC: O(V + E)
int kosaraju(int V, List<Integer>[] adj) {
    // 1) order nodes by DFS finishing time
    Stack<Integer> st = new Stack<>();
    for (int i = 0; i < V; i++) if (!vis[i]) dfsFinish(i, adj, vis, st);
    // 2) reverse every edge
    List<Integer>[] rev = reverseGraph(adj);
    // 3) DFS on the reversed graph in decreasing finish order — each DFS tree is one SCC
    fill(vis, false); int scc = 0;
    while (!st.isEmpty()) {
        int node = st.pop();
        if (!vis[node]) { dfsSimple(node, rev, vis); scc++; }
    }
    return scc;
}
// [ALT] Tarjan's SCC: single DFS with low-link values and a stack.
```

### 54. Strongly Connected Components — Condensation Graph
```java
// Contracting each SCC to a single node yields a DAG (the "condensation").
// Useful for: 2-SAT, longest path in a general directed graph, dependency analysis.
```

---

# Step 16 — Dynamic Programming

> **Universal method:** (1) write the recurrence with a *recursive* function, (2) add memoisation (top-down), (3) convert to tabulation (bottom-up), (4) space-optimise to O(1)/O(n) rolling arrays. Each entry below gives the **tabulated / space-optimised** form.

## 16.1 Introduction *(1 item)*

### 1. Dynamic Programming — Theory
```java
// DP applies when a problem has:
//   (a) OVERLAPPING SUBPROBLEMS — the same state is recomputed many times
//   (b) OPTIMAL SUBSTRUCTURE   — the optimum is built from optima of subproblems
// Memoisation (top-down): recursion + cache. TC = states * work-per-state, SC = cache + stack.
// Tabulation (bottom-up): iterative fill, no recursion stack.
// Shifting of index: when a recurrence uses i-1 and i-2, tabulation often collapses to 2 variables.
```

---

## 16.2 1D DP *(5 problems)*

### 2. Climbing Stairs
Ways to climb n steps taking 1 or 2 at a time.
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int climbStairs(int n) {
    int prev2 = 1, prev1 = 1;
    for (int i = 2; i <= n; i++) { int cur = prev1 + prev2; prev2 = prev1; prev1 = cur; }
    return prev1;
}
```

### 3. Frog Jump
Minimum energy to reach stone n-1, jumping 1 or 2 stones; cost = |height difference|.
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int frogJump(int[] h) {
    int prev2 = 0, prev1 = 0;
    for (int i = 1; i < n; i++) {
        int oneStep = prev1 + Math.abs(h[i] - h[i - 1]);
        int twoStep = (i > 1) ? prev2 + Math.abs(h[i] - h[i - 2]) : INT_MAX;
        int cur = Math.min(oneStep, twoStep);
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}
```

### 4. Frog Jump with K Distances
```java
// TC: O(n*k), SC: O(n) — cannot collapse to 2 variables, need the last k values
int frogJumpK(int[] h, int k) {
    int[] dp = new int[n]; dp[0] = 0;
    for (int i = 1; i < n; i++) {
        int best = INT_MAX;
        for (int j = 1; j <= k && i - j >= 0; j++)
            best = Math.min(best, dp[i - j] + Math.abs(h[i] - h[i - j]));
        dp[i] = best;
    }
    return dp[n - 1];
}
```

### 5. Maximum Sum of Non-Adjacent Elements (House Robber I)
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int maxNonAdjacentSum(int[] a) {
    int prev2 = 0, prev1 = a[0];
    for (int i = 1; i < n; i++) {
        int pick = a[i] + prev2;          // must skip i-1
        int notPick = prev1;
        int cur = Math.max(pick, notPick);
        prev2 = prev1; prev1 = cur;
    }
    return prev1;
}
```

### 6. House Robber II (houses in a circle)
```java
// [OPTIMAL] first and last are adjacent → solve twice on linear slices — TC: O(n), SC: O(1)
int robCircular(int[] a) {
    if (n == 1) return a[0];
    return Math.max(maxNonAdjacentSum(a[0 .. n-2]), maxNonAdjacentSum(a[1 .. n-1]));
}
```

---

## 16.3 2D / 3D DP and DP on Grids *(7 problems)*

### 7. Ninja's Training
Pick one of 3 activities per day; can't repeat the previous day's activity; maximise points.
```java
// [OPTIMAL] TC: O(n*4*3), SC: O(4)
int ninjaTraining(int[][] points) {
    int[] prev = new int[4];
    prev[0] = Math.max(points[0][1], points[0][2]);
    prev[1] = Math.max(points[0][0], points[0][2]);
    prev[2] = Math.max(points[0][0], points[0][1]);
    prev[3] = Math.max(points[0][0], Math.max(points[0][1], points[0][2]));
    for (int day = 1; day < n; day++) {
        int[] cur = new int[4];
        for (int last = 0; last < 4; last++)
            for (int task = 0; task < 3; task++)
                if (task != last) cur[last] = Math.max(cur[last], points[day][task] + prev[task]);
        prev = cur;
    }
    return prev[3];
}
```

### 8. Grid Unique Paths
Paths from (0,0) to (m-1,n-1) moving only right/down.
```java
// [OPTIMAL] TC: O(m*n), SC: O(n). [ALT] combinatorics: C(m+n-2, m-1) → O(min(m,n))
int uniquePaths(int m, int n) {
    int[] prev = new int[n]; fill(prev, 1);
    for (int i = 1; i < m; i++) {
        int[] cur = new int[n]; cur[0] = 1;
        for (int j = 1; j < n; j++) cur[j] = cur[j - 1] + prev[j];
        prev = cur;
    }
    return prev[n - 1];
}
```

### 9. Grid Unique Paths II (with obstacles)
```java
// TC: O(m*n), SC: O(n)
int uniquePathsWithObstacles(int[][] grid) {
    int[] prev = new int[n];
    for (int i = 0; i < m; i++) {
        int[] cur = new int[n];
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) { cur[j] = 0; continue; }        // obstacle
            if (i == 0 && j == 0) { cur[j] = 1; continue; }
            int up = (i > 0) ? prev[j] : 0;
            int left = (j > 0) ? cur[j - 1] : 0;
            cur[j] = up + left;
        }
        prev = cur;
    }
    return prev[n - 1];
}
```

### 10. Minimum Path Sum in a Grid
```java
// TC: O(m*n), SC: O(n)
int minPathSum(int[][] grid) {
    int[] prev = new int[n];
    for (int i = 0; i < m; i++) {
        int[] cur = new int[n];
        for (int j = 0; j < n; j++) {
            if (i == 0 && j == 0) { cur[j] = grid[0][0]; continue; }
            int up   = (i > 0) ? prev[j] : INT_MAX;
            int left = (j > 0) ? cur[j - 1] : INT_MAX;
            cur[j] = grid[i][j] + Math.min(up, left);
        }
        prev = cur;
    }
    return prev[n - 1];
}
```

### 11. Minimum Path Sum in a Triangular Grid
Fixed start (0,0), variable end (any cell in the last row).
```java
// [OPTIMAL] bottom-up from the last row — TC: O(n^2), SC: O(n)
int minimumTotal(List<List<Integer>> tri) {
    int[] front = last row of tri;
    for (int i = n - 2; i >= 0; i--) {
        int[] cur = new int[i + 1];
        for (int j = 0; j <= i; j++)
            cur[j] = tri[i][j] + Math.min(front[j], front[j + 1]);   // down or diagonal
        front = cur;
    }
    return front[0];
}
```

### 12. Minimum / Maximum Falling Path Sum
Variable start (any cell in row 0) and variable end.
```java
// TC: O(n*m*3), SC: O(m)
int minFallingPathSum(int[][] mat) {
    int[] prev = mat[0];
    for (int i = 1; i < n; i++) {
        int[] cur = new int[m];
        for (int j = 0; j < m; j++) {
            int up = prev[j];
            int leftDiag  = (j > 0)     ? prev[j - 1] : INT_MAX;
            int rightDiag = (j < m - 1) ? prev[j + 1] : INT_MAX;
            cur[j] = mat[i][j] + Math.min(up, Math.min(leftDiag, rightDiag));
        }
        prev = cur;
    }
    return min(prev);
}
```

### 13. 3D DP — Cherry Pickup II (Ninja and His Friends)
Two people traverse the grid top to bottom, collecting chocolates (shared cells count once).
```java
// [OPTIMAL] TC: O(n*m*m*9), SC: O(m*m)
int cherryPickup(int[][] grid) {
    int[][] prev = new int[m][m];
    for (j1, j2) prev[j1][j2] = (j1 == j2) ? grid[n-1][j1] : grid[n-1][j1] + grid[n-1][j2];
    for (int i = n - 2; i >= 0; i--) {
        int[][] cur = new int[m][m];
        for (int j1 = 0; j1 < m; j1++)
            for (int j2 = 0; j2 < m; j2++) {
                int best = INT_MIN;
                for (int d1 = -1; d1 <= 1; d1++)
                    for (int d2 = -1; d2 <= 1; d2++) {
                        int nj1 = j1 + d1, nj2 = j2 + d2;
                        if (!inRange(nj1) || !inRange(nj2)) continue;
                        int value = (j1 == j2) ? grid[i][j1] : grid[i][j1] + grid[i][j2];
                        best = Math.max(best, value + prev[nj1][nj2]);
                    }
                cur[j1][j2] = best;
            }
        prev = cur;
    }
    return prev[0][m - 1];       // one starts top-left, the other top-right
}
```

---

## 16.4 DP on Subsequences / Knapsack *(12 problems)*

### 14. Subset Sum Equal to Target
```java
// [OPTIMAL] TC: O(n*target), SC: O(target)
boolean subsetSumToK(int[] a, int target) {
    boolean[] prev = new boolean[target + 1];
    prev[0] = true;                                  // empty subset always sums to 0
    if (a[0] <= target) prev[a[0]] = true;
    for (int i = 1; i < n; i++) {
        boolean[] cur = new boolean[target + 1]; cur[0] = true;
        for (int t = 1; t <= target; t++) {
            boolean notTake = prev[t];
            boolean take = (a[i] <= t) && prev[t - a[i]];
            cur[t] = take || notTake;
        }
        prev = cur;
    }
    return prev[target];
}
```

### 15. Partition Equal Subset Sum
```java
// TC: O(n*sum/2), SC: O(sum/2)
boolean canPartition(int[] a) {
    int total = sum(a);
    if (total % 2 != 0) return false;                // odd total can never split evenly
    return subsetSumToK(a, total / 2);
}
```

### 16. Partition a Set into Two Subsets with Minimum Absolute Sum Difference
```java
// [OPTIMAL] TC: O(n*sum), SC: O(sum)
int minSubsetSumDifference(int[] a) {
    int total = sum(a);
    boolean[] last = row of reachable subset sums (final DP row of subsetSum over 0..total);
    int best = INT_MAX;
    for (int s1 = 0; s1 <= total / 2; s1++)
        if (last[s1]) best = Math.min(best, Math.abs((total - s1) - s1));
    return best;
}
```

### 17. Count Subsets with Sum K
```java
// TC: O(n*k), SC: O(k). Careful with zeros: a 0 doubles every count.
int countSubsetsWithSumK(int[] a, int k) {
    int[] prev = new int[k + 1];
    prev[0] = 1;
    if (a[0] == 0) prev[0] = 2; else if (a[0] <= k) prev[a[0]] = 1;
    for (int i = 1; i < n; i++) {
        int[] cur = new int[k + 1];
        for (int t = 0; t <= k; t++) {
            int notTake = prev[t];
            int take = (a[i] <= t) ? prev[t - a[i]] : 0;
            cur[t] = (take + notTake) % MOD;
        }
        prev = cur;
    }
    return prev[k];
}
```

### 18. Count Partitions with a Given Difference
S1 - S2 = d, S1 >= S2.
```java
// [OPTIMAL] reduce to counting subsets with sum (total - d) / 2 — TC: O(n*target), SC: O(target)
int countPartitions(int[] a, int d) {
    int total = sum(a);
    if ((total - d) < 0 || (total - d) % 2 != 0) return 0;
    return countSubsetsWithSumK(a, (total - d) / 2);
}
```

### 19. 0/1 Knapsack
```java
// [OPTIMAL] TC: O(n*W), SC: O(W) using a single array iterated RIGHT TO LEFT
int knapsack(int[] wt, int[] val, int W) {
    int[] dp = new int[W + 1];
    for (int w = wt[0]; w <= W; w++) dp[w] = val[0];
    for (int i = 1; i < n; i++)
        for (int w = W; w >= wt[i]; w--)             // reverse order prevents reusing item i
            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);
    return dp[W];
}
```

### 20. Minimum Coins (unbounded, arbitrary denominations)
```java
// [OPTIMAL] TC: O(n*amount), SC: O(amount)
int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1]; fill(dp, INF);
    dp[0] = 0;
    for (int c : coins)
        for (int t = c; t <= amount; t++)            // forward order allows reuse
            dp[t] = Math.min(dp[t], 1 + dp[t - c]);
    return dp[amount] >= INF ? -1 : dp[amount];
}
```

### 21. Target Sum
Assign + or − to each element so the total equals target.
```java
// [OPTIMAL] identical to "count partitions with difference" — TC: O(n*sum), SC: O(sum)
int findTargetSumWays(int[] a, int target) { return countPartitions(a, target); }
```

### 22. Coin Change II (count ways)
```java
// TC: O(n*amount), SC: O(amount)
int change(int amount, int[] coins) {
    long[] dp = new long[amount + 1];
    dp[0] = 1;
    for (int c : coins)                              // coin loop OUTSIDE avoids counting permutations
        for (int t = c; t <= amount; t++) dp[t] += dp[t - c];
    return (int)dp[amount];
}
```

### 23. Unbounded Knapsack
```java
// TC: O(n*W), SC: O(W)
int unboundedKnapsack(int[] wt, int[] val, int W) {
    int[] dp = new int[W + 1];
    for (int i = 0; i < n; i++)
        for (int w = wt[i]; w <= W; w++)             // forward → item i can be reused
            dp[w] = Math.max(dp[w], val[i] + dp[w - wt[i]]);
    return dp[W];
}
```

### 24. Rod Cutting Problem
Maximise revenue by cutting a rod of length N into pieces.
```java
// [OPTIMAL] unbounded knapsack where weight = piece length — TC: O(n*N), SC: O(N)
int rodCutting(int[] price, int N) {
    int[] dp = new int[N + 1];
    for (int len = 1; len <= N; len++)
        for (int cut = 1; cut <= len; cut++)
            dp[len] = Math.max(dp[len], price[cut - 1] + dp[len - cut]);
    return dp[N];
}
```

### 25. DP on Subsequences — Pattern Summary
```java
// State: f(index, remainingTarget). Transition: take / notTake.
// take is allowed only when a[index] <= remainingTarget.
// Base cases: index == 0 handled explicitly (do NOT use index < 0 in tabulation).
// Space optimisation: two rows (prev/cur), or one row iterated backwards for 0/1 knapsack.
```

---

## 16.5 DP on Strings *(10 problems)*

### 26. Longest Common Subsequence (LCS)
```java
// [OPTIMAL] TC: O(n*m), SC: O(m)
int lcs(String s, String t) {
    int[] prev = new int[m + 1];
    for (int i = 1; i <= n; i++) {
        int[] cur = new int[m + 1];
        for (int j = 1; j <= m; j++) {
            if (s.charAt(i - 1) == t.charAt(j - 1)) cur[j] = 1 + prev[j - 1];
            else cur[j] = Math.max(prev[j], cur[j - 1]);
        }
        prev = cur;
    }
    return prev[m];
}
```

### 27. Print the LCS
```java
// TC: O(n*m) to build + O(n+m) to backtrack, SC: O(n*m) — needs the full table
String printLCS(String s, String t) {
    dp = full LCS table;
    int i = n, j = m; sb = new StringBuilder();
    while (i > 0 && j > 0) {
        if (s.charAt(i - 1) == t.charAt(j - 1)) { sb.append(s.charAt(i - 1)); i--; j--; }
        else if (dp[i - 1][j] > dp[i][j - 1]) i--;
        else j--;
    }
    return sb.reverse().toString();
}
```

### 28. Longest Common Substring
Contiguous, unlike LCS.
```java
// [OPTIMAL] TC: O(n*m), SC: O(m)
int longestCommonSubstring(String s, String t) {
    int[] prev = new int[m + 1]; int best = 0;
    for (int i = 1; i <= n; i++) {
        int[] cur = new int[m + 1];
        for (int j = 1; j <= m; j++) {
            if (s.charAt(i - 1) == t.charAt(j - 1)) { cur[j] = 1 + prev[j - 1]; best = Math.max(best, cur[j]); }
            else cur[j] = 0;                                  // contiguity broken → reset
        }
        prev = cur;
    }
    return best;
}
```

### 29. Longest Palindromic Subsequence
```java
// [OPTIMAL] LCS(s, reverse(s)) — TC: O(n^2), SC: O(n)
int longestPalindromeSubseq(String s) { return lcs(s, reverse(s)); }
```

### 30. Minimum Insertions to Make a String Palindrome
```java
// [OPTIMAL] keep the longest palindromic subsequence, insert the rest — TC: O(n^2), SC: O(n)
int minInsertions(String s) { return s.length() - longestPalindromeSubseq(s); }
```

### 31. Minimum Insertions / Deletions to Convert String A to B
```java
// TC: O(n*m), SC: O(m)
int minOperations(String s, String t) {
    int keep = lcs(s, t);
    return (s.length() - keep) + (t.length() - keep);    // deletions + insertions
}
```

### 32. Shortest Common Supersequence
Shortest string having both s and t as subsequences.
```java
// [OPTIMAL] length = n + m - LCS; build by backtracking the LCS table — TC: O(n*m), SC: O(n*m)
String shortestCommonSupersequence(String s, String t) {
    dp = full LCS table;
    int i = n, j = m; sb = new StringBuilder();
    while (i > 0 && j > 0) {
        if (s.charAt(i - 1) == t.charAt(j - 1)) { sb.append(s.charAt(i - 1)); i--; j--; }
        else if (dp[i - 1][j] > dp[i][j - 1]) { sb.append(s.charAt(i - 1)); i--; }
        else { sb.append(t.charAt(j - 1)); j--; }
    }
    while (i > 0) sb.append(s.charAt(--i));
    while (j > 0) sb.append(t.charAt(--j));
    return sb.reverse().toString();
}
```

### 33. Distinct Subsequences
Count occurrences of t as a subsequence of s.
```java
// [OPTIMAL] TC: O(n*m), SC: O(m) with a REVERSE inner loop
int numDistinct(String s, String t) {
    long[] dp = new long[m + 1];
    dp[0] = 1;                                       // empty t matches once
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= 1; j--)                 // backwards so dp[j-1] is still the previous row
            if (s.charAt(i - 1) == t.charAt(j - 1)) dp[j] += dp[j - 1];
    return (int)dp[m];
}
```

### 34. Edit Distance
Minimum insert/delete/replace operations to turn s into t.
```java
// [OPTIMAL] TC: O(n*m), SC: O(m)
int editDistance(String s, String t) {
    int[] prev = new int[m + 1];
    for (int j = 0; j <= m; j++) prev[j] = j;
    for (int i = 1; i <= n; i++) {
        int[] cur = new int[m + 1]; cur[0] = i;
        for (int j = 1; j <= m; j++) {
            if (s.charAt(i - 1) == t.charAt(j - 1)) cur[j] = prev[j - 1];        // free match
            else cur[j] = 1 + Math.min(prev[j - 1],                              // replace
                              Math.min(prev[j],                                  // delete
                                       cur[j - 1]));                             // insert
        }
        prev = cur;
    }
    return prev[m];
}
```

### 35. Wildcard Matching
`?` matches one character, `*` matches any sequence (including empty).
```java
// [OPTIMAL] TC: O(n*m), SC: O(m)
boolean isMatch(String p, String s) {      // p = pattern (length n), s = text (length m)
    boolean[] prev = new boolean[m + 1];
    prev[0] = true;
    for (int i = 1; i <= n; i++) {
        boolean[] cur = new boolean[m + 1];
        cur[0] = allStarsSoFar(p, i);      // pattern prefix of only '*' can match an empty text
        for (int j = 1; j <= m; j++) {
            char pc = p.charAt(i - 1);
            if (pc == s.charAt(j - 1) || pc == '?') cur[j] = prev[j - 1];
            else if (pc == '*') cur[j] = prev[j] || cur[j - 1];   // '*' matches empty OR one more char
            else cur[j] = false;
        }
        prev = cur;
    }
    return prev[m];
}
```

---

## 16.6 DP on Stocks *(6 problems)*

### 36. Best Time to Buy and Sell Stock (one transaction)
```java
// TC: O(n), SC: O(1)
int maxProfit(int[] p) {
    int minSoFar = p[0], profit = 0;
    for (int i = 1; i < n; i++) {
        profit = Math.max(profit, p[i] - minSoFar);
        minSoFar = Math.min(minSoFar, p[i]);
    }
    return profit;
}
```

### 37. Buy and Sell Stock II (unlimited transactions)
```java
// [OPTIMAL] state machine on (index, canBuy) — TC: O(n), SC: O(1)
int maxProfitII(int[] p) {
    int aheadNotHold = 0, aheadHold = 0;
    for (int i = n - 1; i >= 0; i--) {
        int curHold    = Math.max(-p[i] + aheadNotHold, aheadHold);       // buy or skip
        int curNotHold = Math.max( p[i] + aheadHold,    aheadNotHold);    // sell or skip
        aheadHold = curHold; aheadNotHold = curNotHold;
    }
    return aheadHold;   // start in "can buy" state
}
// [ALT] greedy: sum all positive p[i]-p[i-1] differences
```

### 38. Buy and Sell Stock III (at most 2 transactions)
```java
// [OPTIMAL] four rolling states — TC: O(n), SC: O(1)
int maxProfitIII(int[] p) {
    int buy1 = INT_MIN, sell1 = 0, buy2 = INT_MIN, sell2 = 0;
    for (int price : p) {
        buy1  = Math.max(buy1,  -price);
        sell1 = Math.max(sell1, buy1 + price);
        buy2  = Math.max(buy2,  sell1 - price);
        sell2 = Math.max(sell2, buy2 + price);
    }
    return sell2;
}
```

### 39. Buy and Sell Stock IV (at most k transactions)
```java
// [OPTIMAL] TC: O(n*k), SC: O(k)
int maxProfitIV(int k, int[] p) {
    int[] buy = new int[k + 1]; fill(buy, INT_MIN);
    int[] sell = new int[k + 1];
    for (int price : p)
        for (int t = 1; t <= k; t++) {
            buy[t]  = Math.max(buy[t],  sell[t - 1] - price);
            sell[t] = Math.max(sell[t], buy[t] + price);
        }
    return sell[k];
}
```

### 40. Buy and Sell Stock with Cooldown
Must skip one day after selling.
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int maxProfitCooldown(int[] p) {
    int hold = INT_MIN, sold = 0, rest = 0;
    for (int price : p) {
        int prevSold = sold;
        sold = hold + price;                     // sell today
        hold = Math.max(hold, rest - price);     // buy today (only from a rest day)
        rest = Math.max(rest, prevSold);         // cool down
    }
    return Math.max(sold, rest);
}
```

### 41. Buy and Sell Stock with Transaction Fee
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int maxProfitWithFee(int[] p, int fee) {
    int hold = -p[0], notHold = 0;
    for (int i = 1; i < n; i++) {
        int prevNotHold = notHold;
        notHold = Math.max(notHold, hold + p[i] - fee);   // pay the fee on sale
        hold    = Math.max(hold, prevNotHold - p[i]);
    }
    return notHold;
}
```

---

## 16.7 DP on Longest Increasing Subsequence *(7 problems)*

### 42. Longest Increasing Subsequence
```java
// [OPTIMAL for the printing variant] TC: O(n^2), SC: O(n)
int lengthOfLIS(int[] a) {
    int[] dp = new int[n]; fill(dp, 1); int best = 1;
    for (int i = 1; i < n; i++)
        for (int j = 0; j < i; j++)
            if (a[j] < a[i]) { dp[i] = Math.max(dp[i], 1 + dp[j]); best = Math.max(best, dp[i]); }
    return best;
}
```

### 43. Printing the LIS
```java
// TC: O(n^2), SC: O(n)
List<Integer> printLIS(int[] a) {
    int[] dp = new int[n], hash = new int[n];
    fill(dp, 1); for (i) hash[i] = i;
    int best = 1, lastIdx = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (a[j] < a[i] && 1 + dp[j] > dp[i]) { dp[i] = 1 + dp[j]; hash[i] = j; }
        if (dp[i] > best) { best = dp[i]; lastIdx = i; }
    }
    res = [];
    while (hash[lastIdx] != lastIdx) { res.add(a[lastIdx]); lastIdx = hash[lastIdx]; }
    res.add(a[lastIdx]);
    reverse(res);
    return res;
}
```

### 44. LIS using Binary Search
```java
// [OPTIMAL] patience sorting — TC: O(n log n), SC: O(n)
int lisBinarySearch(int[] a) {
    temp = [];                                    // NOT the actual LIS, but its length is correct
    for (int x : a) {
        int idx = lowerBound(temp, x);            // first element >= x
        if (idx == temp.size()) temp.add(x);      // extend
        else temp.set(idx, x);                    // replace to keep tails as small as possible
    }
    return temp.size();
}
```

### 45. Largest Divisible Subset
Every pair in the subset must divide one another.
```java
// [OPTIMAL] sort + LIS-style DP — TC: O(n^2), SC: O(n)
List<Integer> largestDivisibleSubset(int[] a) {
    sort(a);
    int[] dp = new int[n], hash = new int[n]; fill(dp, 1);
    int best = 1, lastIdx = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (a[i] % a[j] == 0 && 1 + dp[j] > dp[i]) { dp[i] = 1 + dp[j]; hash[i] = j; }
        if (dp[i] > best) { best = dp[i]; lastIdx = i; }
    }
    reconstruct via hash as in printLIS;
    return res;
}
```

### 46. Longest String Chain
Each word is formed by inserting one character into the previous.
```java
// [OPTIMAL] sort by length, LIS-style — TC: O(n^2 * L), SC: O(n)
int longestStrChain(String[] words) {
    sort(words by length ascending);
    int[] dp = new int[n]; fill(dp, 1); int best = 1;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < i; j++)
            if (isPredecessor(words[j], words[i]) && 1 + dp[j] > dp[i]) {
                dp[i] = 1 + dp[j]; best = Math.max(best, dp[i]);
            }
    return best;
}

boolean isPredecessor(String s, String t) {        // t is s with exactly one char inserted
    if (t.length() != s.length() + 1) return false;
    int i = 0, j = 0;
    while (j < t.length()) {
        if (i < s.length() && s.charAt(i) == t.charAt(j)) i++;
        j++;
    }
    return i == s.length();
}
```

### 47. Longest Bitonic Subsequence
Increases then decreases.
```java
// [OPTIMAL] LIS from the left + LIS from the right — TC: O(n^2), SC: O(n)
int longestBitonic(int[] a) {
    int[] dp1 = lisEndingAt(a);        // dp1[i] = LIS length ending at i
    int[] dp2 = lisStartingAt(a);      // dp2[i] = LDS length starting at i
    int best = 0;
    for (int i = 0; i < n; i++)
        best = Math.max(best, dp1[i] + dp2[i] - 1);   // i counted twice
    return best;
}
```

### 48. Number of Longest Increasing Subsequences
```java
// [OPTIMAL] LIS DP + a parallel count array — TC: O(n^2), SC: O(n)
int findNumberOfLIS(int[] a) {
    int[] dp = new int[n], cnt = new int[n];
    fill(dp, 1); fill(cnt, 1); int maxLen = 1;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < i; j++)
            if (a[j] < a[i]) {
                if (dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; cnt[i] = cnt[j]; }   // new best
                else if (dp[j] + 1 == dp[i]) cnt[i] += cnt[j];                   // another way
            }
        maxLen = Math.max(maxLen, dp[i]);
    }
    int total = 0;
    for (int i = 0; i < n; i++) if (dp[i] == maxLen) total += cnt[i];
    return total;
}
```

---

## 16.8 MCM DP / Partition DP *(7 problems)*

> **Pattern:** `f(i, j)` = best over all partition points `k` in `[i, j-1]` of `f(i,k) + f(k+1,j) + cost(i,k,j)`.

### 49. Matrix Chain Multiplication (memoisation)
```java
// TC: O(n^3), SC: O(n^2)
int mcm(int[] a, int i, int j, int[][] dp) {
    if (i == j) return 0;                         // single matrix → no multiplication
    if (dp[i][j] != -1) return dp[i][j];
    int best = INT_MAX;
    for (int k = i; k < j; k++) {
        int cost = a[i - 1] * a[k] * a[j] + mcm(a, i, k, dp) + mcm(a, k + 1, j, dp);
        best = Math.min(best, cost);
    }
    return dp[i][j] = best;
}
```

### 50. Matrix Chain Multiplication (bottom-up)
```java
// TC: O(n^3), SC: O(n^2)
int mcmTabulation(int[] a) {
    int[][] dp = new int[n][n];
    for (int i = n - 1; i >= 1; i--)              // i decreasing, j increasing
        for (int j = i + 1; j < n; j++) {
            int best = INT_MAX;
            for (int k = i; k < j; k++)
                best = Math.min(best, a[i-1]*a[k]*a[j] + dp[i][k] + dp[k+1][j]);
            dp[i][j] = best;
        }
    return dp[1][n - 1];
}
```

### 51. Minimum Cost to Cut a Stick
```java
// [OPTIMAL] insert 0 and n into cuts, sort, then partition DP — TC: O(m^3), SC: O(m^2)
int minCost(int n, int[] cuts) {
    arr = [0] + sorted(cuts) + [n];   int c = arr.length;
    int[][] dp = new int[c][c];
    for (int i = c - 2; i >= 1; i--)
        for (int j = 1; j <= c - 2; j++) {
            if (i > j) continue;
            int best = INT_MAX;
            for (int k = i; k <= j; k++)
                best = Math.min(best, (arr[j + 1] - arr[i - 1]) + dp[i][k - 1] + dp[k + 1][j]);
            dp[i][j] = best;                       // cost of a cut = current stick length
        }
    return dp[1][c - 2];
}
```

### 52. Burst Balloons
Bursting balloon i yields `a[i-1]*a[i]*a[i+1]`; maximise total coins.
```java
// [OPTIMAL] think LAST burst, not first — TC: O(n^3), SC: O(n^2)
int maxCoins(int[] nums) {
    arr = [1] + nums + [1];   int c = arr.length;
    int[][] dp = new int[c][c];
    for (int i = c - 2; i >= 1; i--)
        for (int j = 1; j <= c - 2; j++) {
            if (i > j) continue;
            int best = INT_MIN;
            for (int k = i; k <= j; k++)           // k = the LAST balloon burst in [i..j]
                best = Math.max(best, arr[i-1]*arr[k]*arr[j+1] + dp[i][k-1] + dp[k+1][j]);
            dp[i][j] = best;
        }
    return dp[1][c - 2];
}
```

### 53. Evaluate Boolean Expression to True
Count ways to parenthesise so the expression evaluates to true.
```java
// [OPTIMAL] TC: O(n^3), SC: O(n^2 * 2)
long countWays(String exp, int i, int j, int isTrue, long[][][] dp) {
    if (i > j) return 0;
    if (i == j) return (exp.charAt(i) == 'T') == (isTrue == 1) ? 1 : 0;
    if (dp[i][j][isTrue] != -1) return dp[i][j][isTrue];
    long ways = 0;
    for (int k = i + 1; k <= j - 1; k += 2) {      // k always lands on an operator
        long lT = countWays(exp, i, k - 1, 1, dp), lF = countWays(exp, i, k - 1, 0, dp);
        long rT = countWays(exp, k + 1, j, 1, dp), rF = countWays(exp, k + 1, j, 0, dp);
        char op = exp.charAt(k);
        if (op == '&') ways += isTrue == 1 ? lT*rT : lT*rF + lF*rT + lF*rF;
        if (op == '|') ways += isTrue == 1 ? lT*rT + lT*rF + lF*rT : lF*rF;
        if (op == '^') ways += isTrue == 1 ? lT*rF + lF*rT : lT*rT + lF*rF;
    }
    return dp[i][j][isTrue] = ways % MOD;
}
```

### 54. Palindrome Partitioning II
Minimum cuts so every part is a palindrome.
```java
// [OPTIMAL] front partition DP — TC: O(n^2), SC: O(n)
int minCut(String s) {
    int[] dp = new int[n + 1];
    dp[n] = 0;
    for (int i = n - 1; i >= 0; i--) {
        int best = INT_MAX;
        for (int j = i; j < n; j++)
            if (isPalindrome(s, i, j)) best = Math.min(best, 1 + dp[j + 1]);
        dp[i] = best;
    }
    return dp[0] - 1;                              // the final cut at the string end doesn't count
}
```

### 55. Partition Array for Maximum Sum
Split into subarrays of length <= k; each element becomes the subarray max.
```java
// [OPTIMAL] TC: O(n*k), SC: O(n)
int maxSumAfterPartitioning(int[] a, int k) {
    int[] dp = new int[n + 1];
    for (int i = n - 1; i >= 0; i--) {
        int maxVal = INT_MIN, best = INT_MIN;
        for (int len = 1; len <= k && i + len - 1 < n; len++) {
            maxVal = Math.max(maxVal, a[i + len - 1]);
            best = Math.max(best, len * maxVal + dp[i + len]);
        }
        dp[i] = best;
    }
    return dp[0];
}
```

---

## 16.9 DP on Squares *(2 problems)*

### 56. Count Square Submatrices with All Ones
```java
// [OPTIMAL] dp[i][j] = size of the largest square with bottom-right corner (i,j) — TC: O(m*n), SC: O(m*n)
int countSquares(int[][] mat) {
    int[][] dp = new int[m][n]; int total = 0;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (i == 0 || j == 0) dp[i][j] = mat[i][j];
            else if (mat[i][j] == 0) dp[i][j] = 0;
            else dp[i][j] = 1 + Math.min(dp[i-1][j], Math.min(dp[i][j-1], dp[i-1][j-1]));
            total += dp[i][j];                    // each value counts that many squares ending here
        }
    return total;
}
```

### 57. Maximum Rectangle Area with All 1s
```java
// [OPTIMAL] per-row histogram + largest rectangle in histogram — TC: O(m*n), SC: O(n)
int maximalRectangle(char[][] mat) {
    int[] heights = new int[n]; int best = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++)
            heights[j] = (mat[i][j] == '1') ? heights[j] + 1 : 0;
        best = Math.max(best, largestRectangleArea(heights));   // see Step 9.3 #24
    }
    return best;
}
```

---

# Step 17 — Tries

> `class TrieNode { TrieNode[] links = new TrieNode[26]; boolean end; int cntEndWith, cntPrefix; }`

### 1. Implement Trie (Prefix Tree) — I
```java
// insert / search / startsWith all TC: O(L), SC: O(total characters inserted)
TrieNode root = new TrieNode();

void insert(String word) {
    TrieNode node = root;
    for (char c : word.toCharArray()) {
        int i = c - 'a';
        if (node.links[i] == null) node.links[i] = new TrieNode();
        node = node.links[i];
    }
    node.end = true;
}

boolean search(String word) {
    TrieNode node = traverse(word);
    return node != null && node.end;
}

boolean startsWith(String prefix) { return traverse(prefix) != null; }

TrieNode traverse(String s) {
    TrieNode node = root;
    for (char c : s.toCharArray()) {
        node = node.links[c - 'a'];
        if (node == null) return null;
    }
    return node;
}
```

### 2. Implement Trie II (insert / countWordsEqualTo / countWordsStartingWith / erase)
```java
// All ops TC: O(L)
void insert(String word) {
    TrieNode node = root;
    for (char c : word.toCharArray()) {
        int i = c - 'a';
        if (node.links[i] == null) node.links[i] = new TrieNode();
        node = node.links[i];
        node.cntPrefix++;                       // every node on the path gains a prefix count
    }
    node.cntEndWith++;
}

int countWordsEqualTo(String word) {
    TrieNode node = traverse(word);
    return node == null ? 0 : node.cntEndWith;
}

int countWordsStartingWith(String prefix) {
    TrieNode node = traverse(prefix);
    return node == null ? 0 : node.cntPrefix;
}

void erase(String word) {                       // assumes the word exists
    TrieNode node = root;
    for (char c : word.toCharArray()) {
        node = node.links[c - 'a'];
        node.cntPrefix--;
    }
    node.cntEndWith--;
}
```

### 3. Longest String with All Prefixes Present
Longest word whose every prefix is also a word in the list.
```java
// [OPTIMAL] insert everything, then check each word — TC: O(N*L), SC: O(N*L)
String completeString(String[] words) {
    for (String w : words) insert(w);
    String best = "";
    for (String w : words)
        if (allPrefixesExist(w)) {
            if (w.length() > best.length() || (w.length() == best.length() && w.compareTo(best) < 0))
                best = w;
        }
    return best.isEmpty() ? "None" : best;
}

boolean allPrefixesExist(String w) {
    TrieNode node = root;
    for (char c : w.toCharArray()) {
        node = node.links[c - 'a'];
        if (node == null || !node.end) return false;   // every intermediate node must end a word
    }
    return true;
}
```

### 4. Number of Distinct Substrings in a String
```java
// [OPTIMAL] insert every suffix; each NEW trie node = one distinct substring — TC: O(n^2), SC: O(n^2)
int countDistinctSubstrings(String s) {
    TrieNode root = new TrieNode();
    int count = 1;                                     // count the empty substring
    for (int i = 0; i < s.length(); i++) {
        TrieNode node = root;
        for (int j = i; j < s.length(); j++) {
            int idx = s.charAt(j) - 'a';
            if (node.links[idx] == null) { node.links[idx] = new TrieNode(); count++; }
            node = node.links[idx];
        }
    }
    return count;
}
// [ALT] suffix automaton / suffix array + LCP → O(n log n)
```

### 5. Bit Prerequisites for Trie Problems (theory)
```java
// Numbers are inserted MSB-first into a binary trie (links[2] instead of links[26]).
// For 32-bit ints, iterate i from 31 down to 0: bit = (num >> i) & 1.
// To MAXIMISE XOR: at each level prefer the OPPOSITE bit; fall back to the same bit if absent.
// Depth = 32 → every query is O(32) = O(1).
```

### 6. Maximum XOR of Two Numbers in an Array
```java
// [OPTIMAL] binary trie — TC: O(32n), SC: O(32n)
int findMaximumXOR(int[] a) {
    for (int x : a) insertBinary(x);
    int best = 0;
    for (int x : a) best = Math.max(best, maxXorWith(x));
    return best;
}

int maxXorWith(int num) {
    BinaryNode node = root; int result = 0;
    for (int i = 31; i >= 0; i--) {
        int bit = (num >> i) & 1;
        if (node.links[1 - bit] != null) {          // opposite bit gives a 1 in the XOR
            result |= (1 << i);
            node = node.links[1 - bit];
        } else node = node.links[bit];
    }
    return result;
}
```

### 7. Maximum XOR With an Element From an Array (offline queries)
Each query `(x, limit)`: max `x XOR a[i]` over all `a[i] <= limit`.
```java
// [OPTIMAL] sort array + sort queries by limit, insert incrementally — TC: O(n log n + q log q + 32q)
int[] maximizeXor(int[] a, int[][] queries) {
    sort(a);
    indexedQueries = queries with their original index, sorted by limit ascending;
    int[] res = new int[queries.length];
    int i = 0;
    for ({x, limit, qIdx} : indexedQueries) {
        while (i < n && a[i] <= limit) insertBinary(a[i++]);   // only eligible elements are in the trie
        res[qIdx] = (i == 0) ? -1 : maxXorWith(x);
    }
    return res;
}
```

---

# Step 18 — Strings (Advanced / Pattern Matching)

### 1. Minimum Bracket Reversals to Balance an Expression
```java
// [OPTIMAL] TC: O(n), SC: O(1)
int minReversals(String s) {
    if (s.length() % 2 != 0) return -1;                  // odd length can never balance
    int open = 0, unmatchedClose = 0;
    for (char c : s.toCharArray()) {
        if (c == '{') open++;
        else { if (open > 0) open--; else unmatchedClose++; }
    }
    // each pair of unmatched brackets needs ceil(count/2) reversals
    return (open + 1) / 2 + (unmatchedClose + 1) / 2;
}
```

### 2. Count and Say
Each term describes the previous term's run-lengths.
```java
// TC: O(n * L), SC: O(L)
String countAndSay(int n) {
    String s = "1";
    for (int t = 2; t <= n; t++) {
        sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            sb.append(j - i).append(s.charAt(i));        // "count" then "digit"
            i = j;
        }
        s = sb.toString();
    }
    return s;
}
```

### 3. Hashing in Strings — Theory (Polynomial Rolling Hash)
```java
// hash(s) = (s[0]*p^0 + s[1]*p^1 + ... + s[n-1]*p^(n-1)) mod m
// Typical p = 31 (lowercase) or 53 (mixed case); m = 1e9+7 or 1e9+9.
// Prefix hashes let you get any substring hash in O(1):
//   h[i] = prefix hash of s[0..i-1]
//   hash(s[l..r]) = (h[r+1] - h[l]) * inverse(p^l) mod m
// Collisions are possible → use double hashing (two different moduli) for safety.
long[] prefixHash(String s, long p, long m) {
    long[] h = new long[s.length() + 1]; long pw = 1;
    for (int i = 0; i < s.length(); i++) {
        h[i + 1] = (h[i] + (s.charAt(i) - 'a' + 1) * pw) % m;
        pw = pw * p % m;
    }
    return h;
}
```

### 4. Rabin-Karp Algorithm
Substring search using rolling hashes.
```java
// TC: O(n + m) average, O(n*m) worst (many collisions). SC: O(1)
List<Integer> rabinKarp(String text, String pattern) {
    int n = text.length(), m = pattern.length();
    long patHash = 0, winHash = 0, power = 1;
    for (int i = 0; i < m - 1; i++) power = power * BASE % MOD;
    for (int i = 0; i < m; i++) {
        patHash = (patHash * BASE + pattern.charAt(i)) % MOD;
        winHash = (winHash * BASE + text.charAt(i)) % MOD;
    }
    res = [];
    for (int i = 0; i + m <= n; i++) {
        if (patHash == winHash && text.substring(i, i + m).equals(pattern)) res.add(i);
        if (i + m < n) {                                          // roll the window
            winHash = (winHash - text.charAt(i) * power % MOD + MOD) % MOD;
            winHash = (winHash * BASE + text.charAt(i + m)) % MOD;
        }
    }
    return res;
}
```

### 5. Z-Function
`z[i]` = length of the longest substring starting at i that is also a prefix of s.
```java
// [OPTIMAL] TC: O(n), SC: O(n)
int[] zFunction(String s) {
    int n = s.length();
    int[] z = new int[n];
    int l = 0, r = 0;                                   // [l, r] = the rightmost matched segment
    for (int i = 1; i < n; i++) {
        if (i < r) z[i] = Math.min(r - i, z[i - l]);    // reuse a previously computed value
        while (i + z[i] < n && s.charAt(z[i]) == s.charAt(i + z[i])) z[i]++;
        if (i + z[i] > r) { l = i; r = i + z[i]; }
    }
    return z;
}
// Pattern search: run zFunction on (pattern + '#' + text); any z[i] == m is a match.
```

### 6. KMP Algorithm / LPS (Prefix) Array
```java
// Build LPS — TC: O(m), SC: O(m)
int[] buildLPS(String p) {
    int m = p.length(); int[] lps = new int[m];
    int len = 0, i = 1;
    while (i < m) {
        if (p.charAt(i) == p.charAt(len)) lps[i++] = ++len;
        else if (len > 0) len = lps[len - 1];           // fall back, don't restart
        else lps[i++] = 0;
    }
    return lps;
}

// Search — TC: O(n + m), SC: O(m)
List<Integer> kmpSearch(String text, String pattern) {
    int[] lps = buildLPS(pattern);
    res = []; int i = 0, j = 0;
    while (i < text.length()) {
        if (text.charAt(i) == pattern.charAt(j)) { i++; j++; }
        if (j == pattern.length()) { res.add(i - j); j = lps[j - 1]; }
        else if (i < text.length() && text.charAt(i) != pattern.charAt(j)) {
            if (j > 0) j = lps[j - 1]; else i++;        // the text pointer NEVER moves backwards
        }
    }
    return res;
}
```

### 7. Shortest Palindrome
Add the fewest characters *in front* of s to make it a palindrome.
```java
// [OPTIMAL] KMP on (s + '#' + reverse(s)) — TC: O(n), SC: O(n)
String shortestPalindrome(String s) {
    String rev = reverse(s);
    String combined = s + "#" + rev;
    int[] lps = buildLPS(combined);
    int longestPalPrefix = lps[combined.length() - 1];   // longest prefix of s that is a palindrome
    return rev.substring(0, s.length() - longestPalPrefix) + s;
}
```

### 8. Longest Happy Prefix
Longest proper prefix that is also a suffix.
```java
// [OPTIMAL] the last LPS value — TC: O(n), SC: O(n)
String longestPrefix(String s) {
    int[] lps = buildLPS(s);
    return s.substring(0, lps[s.length() - 1]);
}
```

### 9. Count Palindromic Subsequences
Count subsequences of s that are palindromes (variant: count "aba"-form of length 3).
```java
// [OPTIMAL] interval DP — TC: O(n^2), SC: O(n^2)
int countPalindromicSubsequences(String s) {
    int[][] dp = new int[n][n];
    for (int i = 0; i < n; i++) dp[i][i] = 1;
    for (int len = 2; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) {
            int j = i + len - 1;
            if (s.charAt(i) == s.charAt(j))
                dp[i][j] = dp[i + 1][j] + dp[i][j - 1] + 1;        // +1 for the new pair itself
            else
                dp[i][j] = dp[i + 1][j] + dp[i][j - 1] - dp[i + 1][j - 1];   // inclusion–exclusion
        }
    return dp[0][n - 1];
}
```

---

# Appendix — Revision Cheat Sheets

## A. Complexity Reference

| Structure / Algorithm | Access | Search | Insert | Delete |
|---|---|---|---|---|
| Array | O(1) | O(n) | O(n) | O(n) |
| Sorted array (binary search) | O(1) | O(log n) | O(n) | O(n) |
| Linked list | O(n) | O(n) | O(1)* | O(1)* |
| Hash map / set | — | O(1) avg | O(1) avg | O(1) avg |
| Balanced BST / TreeMap | — | O(log n) | O(log n) | O(log n) |
| Heap | O(1) peek | O(n) | O(log n) | O(log n) |
| Trie | — | O(L) | O(L) | O(L) |

\* given a pointer to the node.

| Algorithm | Time | Space |
|---|---|---|
| Merge / Heap sort | O(n log n) | O(n) / O(1) |
| Quick sort | O(n log n) avg, O(n²) worst | O(log n) |
| BFS / DFS | O(V + E) | O(V) |
| Dijkstra (heap) | O(E log V) | O(V) |
| Bellman-Ford | O(V·E) | O(V) |
| Floyd-Warshall | O(V³) | O(V²) |
| Prim / Kruskal | O(E log E) | O(V) |
| DSU (path compression + union by size) | ~O(1) amortised | O(V) |
| KMP / Z-function | O(n + m) | O(m) |

## B. Pattern → Technique Lookup

| Signal in the problem | Reach for |
|---|---|
| Sorted array, "find X", "minimum/maximum such that…" | Binary search (on index or on the answer) |
| "Longest/shortest subarray with condition", contiguous | Sliding window / two pointers |
| "Count subarrays with exactly K" | `atMost(K) - atMost(K-1)`, or prefix sum + hashmap |
| Subarray sum / XOR equals K | Prefix sum or prefix XOR + hashmap |
| "Next greater/smaller", histogram, spans | Monotonic stack |
| "Top K", "Kth largest", streaming median | Heap (size-K or two-heap) |
| "All combinations / permutations / partitions" | Backtracking (pick / not-pick, or loop + prune) |
| Overlapping subproblems + optimal substructure | DP (recursion → memo → tabulation → space-opt) |
| Optimal choice is locally obvious and provably safe | Greedy (usually needs a sort first) |
| Grid / network / dependency / reachability | Graph (BFS, DFS, topo sort, Dijkstra, DSU) |
| Prefix queries, XOR maximisation | Trie |
| Pattern matching in strings | KMP, Z-function, Rabin-Karp |
| "In place", "O(1) extra space" on an array | Two pointers, cyclic sort, index-as-hash, XOR |

## C. Recurring Boilerplate

```java
// Binary search on an answer
while (low <= high) {
    mid = low + (high - low) / 2;
    if (isPossible(mid)) { ans = mid; /* shrink toward the optimum */ }
    else { /* move the other way */ }
}

// Sliding window (longest with a condition)
for (r = 0; r < n; r++) {
    add(a[r]);
    while (invalid()) remove(a[l++]);
    best = max(best, r - l + 1);
}

// Backtracking
void solve(state) {
    if (isGoal(state)) { record(); return; }
    for (choice : choices(state)) {
        apply(choice);
        solve(nextState);
        undo(choice);           // the step people forget
    }
}

// DP conversion order
// f(i, j) recursion  ->  add memo[i][j]  ->  reverse the loop direction of the base cases
//                    ->  replace memo rows with prev/cur arrays
```

---

*End of file — 18 steps, all sections of Striver's A2Z DSA Sheet.*

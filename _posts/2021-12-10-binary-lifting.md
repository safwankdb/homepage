---
title: Binary Lifting with C++
date: 2021-12-10 00:00:00 Z
tags:
- algorithm
- data-structures
- C++
layout: post
excerpt: Binary lifting algorithm with C++ code
excerpt_separator: "<!--more-->"
author: Mohd Safwan
---

I've had quite a lot of practice with DSA questions while preparing for my placements (writing a summary of that right now). I'm gonna intoduce a new algorithm which I found very interesting.

Let's look at a simple looking question [Planets Queries I](https://cses.fi/problemset/task/1750).

We have a graph $$G = (V, E)$$ where there is a single edge going out from each vertex and there are no self loops. Now, we need to answer queries of the form $$(x, k)$$ where you start at vertex $$x$$ and take $$k$$ steps and output the vertex reached.


### Brute Force Solution
We can just create a adjacency list and for processing each query we can just simulate walking k steps.

The time complexity is $$\mathcal{O}(N + QK)$$. We have $$N \leq 10^5, Q \leq 10^5, K \leq 10^9$$. Clearly the brute force solution is extremely slow.

### Binary Lifting

Consider a single query, starting from vertex $$x$$ we need to take $$k$$ steps. Is there some sort of preprocessing we can do to get the result in less than $$\mathcal{O}(k)$$ time?

As the name suggests, we look at the binary representation of $$k$$. Since the number of terms are $$\mathcal{O}(\log k)$$, if we can save the results of $$1, 2,4,...$$ steps in some preprocessing step, then we can answer each query in $$\mathcal{O}(\log k)$$.

### Implementation

We need a 2D array which I call ```jump``` where ```jump[i][j]``` is the node you reach after taking $$2^j$$ steps starting from $$i$$. The first row can be filled using input, then each subsequent row can be filled using the row above. To find destination after $$2^j$$ steps, we can find destination after $$2^{j-1}$$ steps and then jump $$2^{j-1}$$ steps again from there.

```c++
const int MAX = 100000;
const int LOG = 17;
int jump[LOG][MAX];

int main() {
    int n, q;
    cin >> n >> q;
    // Fill the first row with inputs only
    for (int i = 0; i < n; i++) cin >> jump[0][i+1];
    // Fill next rows using the algorithm described
    for (int lg = 1; lg < LOG; lg++) 
        for (int i = 1; i <= n; i++)
            jump[lg][i] = jump[lg-1][jump[lg-1]]
    // Answer Queries
}
```

To answer each query, we just break $$k$$ into its binary paritions.

```c++
int main() {
    ...
    while(q--) {
        int x, k; cin >> x >> k;
        int len = 0;
        while (k) {
            if (k & 1) x = jump[len][x];
            len++;
            k /= 2;
        }
        cout << x << endl;
    }
    ...
}
```
So we finally have $$\mathcal{O}(N\log N)$$ preprocessing with $$\mathcal{O}(\log K)$$ queries. So the final solution is $$\mathcal{O}(N\log N  + Q \log K)$$.

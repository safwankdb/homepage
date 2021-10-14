---
title: Content-Aware Image Resizing with Julia
date: 2021-02-01 00:00:00 Z
tags:
- image-processing,
- julia,
- dynamic-programming
layout: post
excerpt: Implementing the basic Seam Carving algorithm in Julia.
excerpt_separator: "<!--more-->"
author: Mohd Safwan
---

I am going to implement the basic **Seam Carving** algorithm in **Julia**. This method shows the usefulness of dynamic programming.

```julia
using Images, ImageFiltering

download("https://upload.wikimedia.org/wikipedia/commons/c/cb/Broadway_tower_edit.jpg", "test.jpg");
```

<div align='center'>
   <img src="/assets/img/seam_carving/1.png" align='center'/>
</div>

Use Sobel filters to compute the gradient of the image.
```julia
function get_energy(img)
	∇y = luminance.(imfilter(img, Kernel.sobel()[1]))
	∇x = luminance.(imfilter(img, Kernel.sobel()[2]))
	energy = sqrt.(∇x.^2 + ∇y.^2)
end;
```
<div align='center'>
   <img src="/assets/img/seam_carving/2.png" align='center'/>
</div>

The key idea is that the value of gradient at any pixel corresponds to how 'valuable' or 'important' to image the object is. This turns out to be a surprisingly good idea for most natural images.

To shrink the width by 1 pixel, we find a set of connected pixels (one in each row) such that the sum of their gradients or 'energy' as the authors of the paper called it, is minimized. Such a set is called a **seam**.

The least energy seam can be found in $$ \mathcal{O}(HW) $$ time for an $$ H\times W $$ resolution image given its gradients. The algorithm uses dynamic programming to achieve this. Starting from the bottom row, we can use the following recursion to compute the minimum possible energy for a seam originating at each pixel and going down. If $$ E(x,y) $$ represents this value at pixel $$ (x,y) $$, then

$$
	M(x,y) = \min \{M(x-1,y-1),M(x,y-1),M(x+1,y-1)\}
$$

```julia
function get_min_cost(energy)
	min_cost = copy(energy);	
	h, w = size(energy)
	for i in h-1:-1:1, j in 1:w
		if j == 1
			min_cost[i,j] += minimum(min_cost[i+1,1:2])
		elseif j == w
			min_cost[i,j] += minimum(min_cost[i+1,w-1:w])
		else
			min_cost[i,j] += minimum(min_cost[i+1,j-1:j+1])
		end
	end
	return min_cost
end;
```
Next, we use the precomputed values to find the required seam line by traversing down from the minima on the top row. At each step, choose the neighbor with the least cost.

```julia
function get_seam(min_cost)
	h,w = size(min_cost)
	min_idx = argmin(min_cost[1,:])
	indices = [min_idx]
	for i in 2:h
		if min_idx==1
			min_idx += argmin(min_cost[i,1:2]) - 1
		elseif min_idx==w
			min_idx += argmin(min_cost[i,w-1:w]) - 2
		else
			min_idx += argmin(min_cost[i,min_idx-1:min_idx+1]) - 2
		end
		push!(indices, min_idx)
	end
	return indices
end;
```
<div align='center'>
   <img src="/assets/img/seam_carving/3.png" align='center'/>
</div>

The cost function has triangular artifacts as expected since a high energy value would propagate up in such contours.

Now we remove the seam pixels and 'stick' the parts.

```julia
function cut_seam(img, seam)
	new_img = img[:,1:end-1]
	for i in 1:size(img)[1]
		j = seam[i]
		new_img[i,j:end] = img[i,j+1:end]
	end
	new_img
end;
```
Finally, we can achieve resizing by just repeating the above steps iteratively.

```julia
function shrink_width(img, n)
	new_img = copy(img)
	for i in 1:n
		E = get_energy(new_img)
		cost = get_min_cost(E)
		seam = get_seam(cost)
		new_img = cut_seam(new_img, seam)
	end
	new_img
end;

new_img = shrink_width(img, 400)
```

<div align='center'>
   <img src="/assets/img/seam_carving/1.png"  width="700"/>
   <img src="/assets/img/seam_carving/4.png"  width="700"/>
</div>


The results speak for themselves! I would be updating this post soon with detailed descriptions of intermediate steps.

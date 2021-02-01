---
layout: post
title: Content-Aware Image Resizing with Julia
excerpt: Implementing the basic Seam Carving algorithm in Julia.
excerpt_separator:  <!--more-->
author: Mohd Safwan
tags: image-processing, julia, dynamic-programming
---

I am going to implement the basic **Seam Carving** algorithm in **Julia**. This method shows the usefulness of dynamic programming.

```bash
using Images, ImageFiltering

download("https://upload.wikimedia.org/wikipedia/commons/c/cb/Broadway_tower_edit.jpg", "test.jpg");
```

<div align='center'>
   <img src="/assets/img/seam_carving/1.png" align='center'/>
</div>

Use Sobel filters to compute the gradient of the image.
```bash
function get_energy(img)
	∇y = luminance.(imfilter(img, Kernel.sobel()[1]))
	∇x = luminance.(imfilter(img, Kernel.sobel()[2]))
	energy = sqrt.(∇x.^2 + ∇y.^2)
end;
```
<div align='center'>
   <img src="/assets/img/seam_carving/2.png" align='center'/>
</div>

Next, the algorithm uses dynamic programming to find the vertical seam line with the least energy.

```bash
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

```bash
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

```bash
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

```bash
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

new_img = shrink_width(img, 200)
```

<div align='center'>
   <img src="/assets/img/seam_carving/4.png" align='center'/>
</div>

The results speak for themselves! I would be updating this post soon with detailed descriptions of intermediate steps.

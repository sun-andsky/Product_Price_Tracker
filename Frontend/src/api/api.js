// api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;



// Utility to get the saved token
const getToken = () => localStorage.getItem("authToken");

// ---------- AUTH APIs ----------
export const signupUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  console.log("Raw response:", text);

  if (!text) return { error: "Empty response from server" };

  try {
    return JSON.parse(text);
  } catch (e) {
    return { error: "Invalid JSON from server" };
  }
};

export const loginUser = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    console.log("Login raw response:", text);

    if (!text) return { error: "Empty response from server" };

    try {
      const parsed = JSON.parse(text);
      if (!res.ok) return { error: parsed.error || "Login failed" };
      return parsed;
    } catch (e) {
      return { error: "Invalid JSON from server" };
    }
  } catch (err) {
    return { error: "Network error or server down" };
  }
};


// ---------- AUTHENTICATED API (User List) ----------
export const fetchUsers = async () => {
  const token = localStorage.getItem("authToken"); // ✅ Make sure token is stored
  if (!token) return { error: "No auth token found" };

  const res = await fetch(`${BASE_URL}/users/`, {
    headers: {
      Authorization: `Bearer ${token}`,  // ✅ Proper token header
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) return { error: "Unauthorized or failed" };
  return res.json();
};


// ---------- PRODUCT APIs ----------
export async function fetchSuggestions(query = "") {
  const res = await fetch(`${BASE_URL}/suggestions/?q=${query}`);
  return res.json();
}

export const fetchProducts = async ({ query = "", min_price, max_price, sort, source }) => {
  const params = new URLSearchParams();
  if (query) params.append("q", query);
  if (min_price) params.append("min_price", min_price);
  if (max_price) params.append("max_price", max_price);
  if (sort) params.append("sort", sort);
  if (source) params.append("source", source);

  const res = await fetch(`${BASE_URL}/search/?${params.toString()}`);
  return res.json();
};

export async function fetchProductDetails(id) {
  const response = await fetch(`${BASE_URL}/product/${id}/`);
  if (!response.ok) {
    throw new Error("Failed to fetch product details");
  }
  return response.json();
}
// ---------- WISHLIST APIs ----------

// Fetch wishlist (array of product IDs)
export const fetchWishlist = async (token) => {
  const res = await fetch(`${BASE_URL}/users/wishlist/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

// Add to wishlist
export const addToWishlist = async (productId, token) => {
  const res = await fetch(`${BASE_URL}/users/wishlist/add/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });
  return res.json();
};

// ✅ FIXED: Remove from wishlist
export const removeFromWishlist = async (productId, token) => {
  const res = await fetch(`${BASE_URL}/users/wishlist/remove/`, {
    method: "DELETE", // Correct method
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id: productId }),
  });
  return res.json();
};
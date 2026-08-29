import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

// Controls the visual style of each category card: icon, accent color, and glow effect.
const categoryLooks = [
  { icon: "⚔️", accent: "#49dce7", glow: "rgba(73, 220, 231, 0.22)" },
  { icon: "🎴", accent: "#e6b85c", glow: "rgba(230, 184, 92, 0.22)" },
  { icon: "🧢", accent: "#7cc6ff", glow: "rgba(124, 198, 255, 0.2)" },
  { icon: "🪐", accent: "#9a7cff", glow: "rgba(154, 124, 255, 0.18)" },
  { icon: "📦", accent: "#62df9a", glow: "rgba(98, 223, 154, 0.18)" },
  { icon: "✨", accent: "#ff8ec2", glow: "rgba(255, 142, 194, 0.18)" },
];

// Main storefront category list aligned to the real anime clothing and merchandise categories.
const fallbackCategories = [
  { categoryId: "clothing", name: "Clothing", description: "Everyday anime streetwear, layered essentials, and standout fits." },
  { categoryId: "accessories", name: "Accessories", description: "Pins, badges, wallets, and collector details that complete every look." },
  { categoryId: "tech", name: "Tech", description: "Phone gear, desk setups, and useful anime-themed tech add-ons." },
  { categoryId: "art", name: "Art", description: "Posters, art books, prints, and visual inspiration for every room." },
  { categoryId: "collectibles", name: "Collectibles", description: "Figurines, stands, and premium fan favourites gathered in one drop." },
  { categoryId: "cosplay", name: "Cosplay", description: "Detailed outfits, props, and build-ready pieces for every character arc." },
  { categoryId: "home-and-lifestyle", name: "Home & Lifestyle", description: "Lifestyle pieces, desk items, and anime-inspired room upgrades." },
  { categoryId: "bags", name: "Bags", description: "Anime-ready carryalls, backpacks, and daily essentials for on-the-go style." },
  { categoryId: "footwear", name: "Footwear", description: "Sneakers, comfort-first numbers, and anime-ready daily shoes." },
  { categoryId: "stationery", name: "Stationery", description: "Journals, pens, and study accessories shaped for fan life." },
  { categoryId: "jewellery", name: "Jewellery", description: "Statement pieces, subtle accents, and character-inspired charm details." },
  { categoryId: "gaming", name: "Gaming", description: "Controller gear, desk tools, and accessories built for long sessions." },
  { categoryId: "room-decor", name: "Room Decor", description: "Wall art, ambience items, and decor that brings anime energy home." },
];

// Maps backend category names to the storefront category names and their canonical slugs.
const categoryNameMap = {
  clothing: "Clothing",
  accessories: "Accessories",
  tech: "Tech",
  art: "Art",
  collectibles: "Collectibles",
  cosplay: "Cosplay",
  "home-and-lifestyle": "Home & Lifestyle",
  bags: "Bags",
  footwear: "Footwear",
  stationery: "Stationery",
  jewellery: "Jewellery",
  gaming: "Gaming",
  "room-decor": "Room Decor",
  hoodie: "Clothing",
  hoodies: "Clothing",
  tshirt: "Clothing",
  "t-shirts": "Clothing",
  "t-shirts-and-hoodies": "Clothing",
  jacket: "Clothing",
  jackets: "Clothing",
  jersey: "Clothing",
  jerseys: "Clothing",
  sweaters: "Clothing",
  beanie: "Clothing",
  beanies: "Clothing",
  cap: "Clothing",
  caps: "Clothing",
  joggers: "Clothing",
  shorts: "Clothing",
  socks: "Clothing",
  pajamas: "Clothing",
  "anime-pajamas": "Clothing",
  keychains: "Accessories",
  pins: "Accessories",
  badges: "Accessories",
  patches: "Accessories",
  lanyards: "Accessories",
  wallets: "Accessories",
  jewelry: "Accessories",
  "phone-cases": "Tech",
  "laptop-sleeves": "Tech",
  "mouse-pads": "Tech",
  keycaps: "Tech",
  "controller-skins": "Tech",
  "controller-grips": "Tech",
  "earbud-cases": "Tech",
  "phone-grips": "Tech",
  "usb-drives": "Tech",
  "desk-mats": "Tech",
  posters: "Art",
  "art-prints": "Art",
  "canvas-prints": "Art",
  "wall-scrolls": "Art",
  sketchbooks: "Art",
  "art-books": "Art",
  figurines: "Collectibles",
  "mini-figures": "Collectibles",
  "acrylic-stands": "Collectibles",
  "character-stands": "Collectibles",
  "collectible-cards": "Collectibles",
  statues: "Collectibles",
  costumes: "Cosplay",
  props: "Cosplay",
  "cosplay-sets": "Cosplay",
  "room-items": "Home & Lifestyle",
  decor: "Home & Lifestyle",
  "desk-items": "Home & Lifestyle",
  backpacks: "Bags",
  "travel-bags": "Bags",
  sneakers: "Footwear",
  shoes: "Footwear",
  sandals: "Footwear",
  slides: "Footwear",
  notebooks: "Stationery",
  pens: "Stationery",
  planners: "Stationery",
  rings: "Jewellery",
  necklaces: "Jewellery",
  bracelets: "Jewellery",
  charms: "Jewellery",
  controllers: "Gaming",
  "gaming-accessories": "Gaming",
  mouse: "Gaming",
  keyboards: "Gaming",
  "desk-accessories": "Gaming",
  "wall-art": "Room Decor",
  "decor-items": "Room Decor",
};

// Normalizes category strings so duplicate names from the backend are treated as one category.
function normalizeCategoryName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Converts backend names into storefront-friendly names and keeps duplicate type variations unified.
function mapCategoryName(value) {
  const normalized = normalizeCategoryName(value);
  return categoryNameMap[normalized] || value;
}

// Removes duplicate categories that may come back from the backend or different naming styles.
function dedupeCategories(rawCategories) {
  const seen = new Map();

  rawCategories.forEach((category) => {
    const categoryName = mapCategoryName(category.name || category.categoryId || "Uncategorized");
    const key = normalizeCategoryName(categoryName);

    if (!seen.has(key)) {
      seen.set(key, {
        ...category,
        categoryId: category.categoryId || categoryName,
        name: categoryName,
        description: category.description || fallbackCategories.find((fallback) => fallback.name === categoryName)?.description || "Signature pieces designed for every anime mood.",
      });
    }
  });

  return Array.from(seen.values());
}

// Reads product images from the backend and converts them into a valid browser image source.
function getProductImage(product) {
  if (!product.productImage) {
    return null;
  }

  if (typeof product.productImage === "string") {
    return `data:image/jpeg;base64,${product.productImage}`;
  }

  return null;
}

const categorySubcategories = {
  clothing: ["Hoodies", "T-Shirts", "Beanies", "Caps", "Jackets", "Jerseys", "Sweaters", "Long Sleeves", "Joggers", "Shorts", "Socks", "Kimonos", "Anime Pajamas"],
  accessories: ["Keychains", "Pins", "Badges", "Patches", "Lanyards", "Wallets", "Jewelry"],
  tech: ["Phone Cases", "Laptop Sleeves", "Mouse Pads", "Keycaps", "Controller Skins", "Controller Grips", "Earbud Cases", "Phone Grips", "USB Drives", "Desk Mats"],
  art: ["Posters", "Art Prints", "Canvas Prints", "Wall Scrolls", "Sketchbooks", "Art Books"],
  collectibles: ["Figurines", "Mini Figures", "Acrylic Stands", "Character Stands", "Collectible Cards", "Statues"],
  cosplay: ["Costumes", "Wigs", "Props", "Masks", "Capes", "Weapon Props", "Armor Pieces"],
  "home-and-lifestyle": ["Desk Items", "Lifestyle Picks", "Room Essentials", "Daily Carry", "Key Holders", "Bedding"],
  bags: ["Backpacks", "Tote Bags", "Crossbody Bags", "Travel Bags", "Laptop Bags", "Mini Pouches"],
  footwear: ["Sneakers", "Slides", "Sandals", "Slip Ons", "Canvas Shoes", "Boots"],
  stationery: ["Notebooks", "Pens", "Planners", "Sticky Notes", "Desk Pads", "Sketch Pads"],
  jewellery: ["Rings", "Necklaces", "Bracelets", "Charms", "Earrings", "Pins"],
  gaming: ["Controller Skins", "Controller Grips", "Mouse Pads", "Keycaps", "Gaming Mats", "Desk Accessories"],
  "room-decor": ["Wall Art", "Desk Decor", "Posters", "LED Lights", "Shelves", "Mini Displays"],
};

function getCategorySubcategories(categoryValue) {
  if (!categoryValue || categoryValue === "all") {
    return [];
  }

  const normalized = normalizeCategoryName(categoryValue);
  return categorySubcategories[normalized] || [];
}

function resolveCategorySlug(value) {
  if (!value) {
    return "all";
  }

  const normalized = normalizeCategoryName(value);
  const directMatch = Object.keys(categorySubcategories).find((slug) => normalizeCategoryName(slug) === normalized);
  if (directMatch) {
    return directMatch;
  }

  const mapped = categoryNameMap[normalized];
  if (mapped) {
    return normalizeCategoryName(mapped);
  }

  return normalized;
}

function inferProductSubcategory(product, categorySlug) {
  const categoryOptions = getCategorySubcategories(categorySlug);
  if (!categoryOptions.length) {
    return "all";
  }

  const combinedText = [
    product.name,
    product.description,
    product.category?.name,
    product.category?.categoryId,
    product.subcategory,
    product.subCategory,
    product.subcategoryName,
    product.category?.subcategory,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const option of categoryOptions) {
    const optionKey = option.toLowerCase();
    if (combinedText.includes(optionKey) || combinedText.includes(optionKey.replace(/\s+/g, ""))) {
      return option;
    }
  }

  return "all";
}

// Main storefront page: loads products, categories, filters, and search state for the catalog view.
function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(searchParams.get("price") || "all");
  const [selectedPopularityFilter, setSelectedPopularityFilter] = useState(searchParams.get("popularity") || "all");
  const [selectedColorFilter, setSelectedColorFilter] = useState(searchParams.get("color") || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "all");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [drawerSearchTerm, setDrawerSearchTerm] = useState("");
  const [catalogActivated, setCatalogActivated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products once when the page loads so the main catalog grid is ready to render.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (requestError) {
        console.error("Error fetching products:", requestError);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Fetch categories separately so the storefront can show themed category cards.
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(dedupeCategories(response.data));
      } catch (requestError) {
        console.error("Error fetching categories:", requestError);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Keeps the selected category and filters in sync with the URL query string.
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "all";
    const priceFromUrl = searchParams.get("price") || "all";
    const popularityFromUrl = searchParams.get("popularity") || "all";
    const colorFromUrl = searchParams.get("color") || "all";
    const subcategoryFromUrl = searchParams.get("subcategory") || "all";
    const queryFromUrl = searchParams.get("q") || "";

    const urlHasActiveFilter =
      categoryFromUrl !== "all" ||
      priceFromUrl !== "all" ||
      popularityFromUrl !== "all" ||
      colorFromUrl !== "all" ||
      subcategoryFromUrl !== "all" ||
      queryFromUrl.trim().length > 0;

    setSelectedCategory(categoryFromUrl);
    setSelectedPriceFilter(priceFromUrl);
    setSelectedPopularityFilter(popularityFromUrl);
    setSelectedColorFilter(colorFromUrl);
    setSelectedSubcategory(subcategoryFromUrl);
    setSearchTerm(queryFromUrl);
    setCatalogActivated((current) => current || urlHasActiveFilter);
  }, [searchParams]);

  const applyCatalogRoute = (nextParams) => {
    const targetPath = "/catalog";
    const query = nextParams.toString();
    navigate({ pathname: targetPath, search: query ? `?${query}` : "" });
  };

  // Updates the selected category in the URL so the user can share or revisit that specific catalog view.
  const handleCategorySelect = (categoryValue) => {
    const nextParams = new URLSearchParams(searchParams);

    if (categoryValue === "all") {
      nextParams.delete("category");
      nextParams.delete("price");
      nextParams.delete("popularity");
      nextParams.delete("color");
      nextParams.delete("subcategory");
      nextParams.delete("q");
      setSelectedPriceFilter("all");
      setSelectedPopularityFilter("all");
      setSelectedColorFilter("all");
      setSelectedSubcategory("all");
      setSearchTerm("");
    } else {
      nextParams.set("category", categoryValue);
      nextParams.delete("subcategory");
      setSelectedSubcategory("all");
    }

    setSelectedCategory(categoryValue);
    setShowAllCategories(false);
    setShowCategoryDrawer(false);
    setCatalogActivated(true);
    applyCatalogRoute(nextParams);
  };

  // Updates the price filter while preserving the rest of the search state in the URL.
  const handlePriceFilterChange = (value) => {
    setSelectedPriceFilter(value);
    setCatalogActivated(true);
    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") {
      nextParams.delete("price");
    } else {
      nextParams.set("price", value);
    }
    applyCatalogRoute(nextParams);
  };

  // Sorts the visible catalog by popularity or a price-based ranking model.
  const handlePopularityFilterChange = (value) => {
    setSelectedPopularityFilter(value);
    setCatalogActivated(true);
    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") {
      nextParams.delete("popularity");
    } else {
      nextParams.set("popularity", value);
    }
    applyCatalogRoute(nextParams);
  };

  // Filters the catalog by the selected colour.
  const handleColorFilterChange = (value) => {
    setSelectedColorFilter(value);
    setCatalogActivated(true);
    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") {
      nextParams.delete("color");
    } else {
      nextParams.set("color", value);
    }
    applyCatalogRoute(nextParams);
  };

  const handleSubcategoryFilterChange = (value) => {
    setSelectedSubcategory(value);
    setCatalogActivated(true);
    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") {
      nextParams.delete("subcategory");
    } else {
      nextParams.set("subcategory", value);
    }
    applyCatalogRoute(nextParams);
  };

  // Lets the user search by product name or category text without leaving the catalog page.
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCatalogActivated(true);
    const nextParams = new URLSearchParams(searchParams);
    if (!value.trim()) {
      nextParams.delete("q");
    } else {
      nextParams.set("q", value);
    }
    applyCatalogRoute(nextParams);
  };

  // Use live categories when available; otherwise fall back to the curated anime storefront categories.
  const derivedCategories = dedupeCategories([
    ...categories,
    ...products
      .map((product) => product.category)
      .filter(Boolean),
  ]);
  const displayCategories = derivedCategories.length > 0 ? derivedCategories : fallbackCategories;

  // Keep the homepage featured cards stable and guaranteed to render even if the backend category payload is empty or inconsistent.
  const homePopularCategories = [
    displayCategories.find((category) => normalizeCategoryName(category.categoryId || category.name || "") === "clothing") ||
      fallbackCategories.find((category) => normalizeCategoryName(category.categoryId || category.name || "") === "clothing"),
    displayCategories.find((category) => normalizeCategoryName(category.categoryId || category.name || "") === "tech") ||
      fallbackCategories.find((category) => normalizeCategoryName(category.categoryId || category.name || "") === "tech"),
    displayCategories.find((category) => normalizeCategoryName(category.categoryId || category.name || "") === "art") ||
      fallbackCategories.find((category) => normalizeCategoryName(category.categoryId || category.name || "") === "art"),
  ].filter(Boolean);
  const visibleCategories = showAllCategories ? displayCategories : displayCategories.slice(0, 6);
  const drawerQuickFilters = [
    "All",
    "Streetwear",
    "Accessories",
    "Collectibles",
    "Hoodies",
    "New",
  ];
  const filteredDrawerCategories = displayCategories.filter((category) => {
    const categoryName = (category.name || "").toLowerCase();
    const searchValue = drawerSearchTerm.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return categoryName.includes(searchValue);
  });

  // Applies the selected category, subcategory, search term, colour, and price filters to the visible product grid.
  const filteredProducts = products
    .filter((product) => {
      const productCategoryName = mapCategoryName(product.category?.name || "Anime Collection");
      const productCategoryId = product.category?.categoryId;
      const productCategorySlug = resolveCategorySlug(productCategoryName || productCategoryId || "");
      const categoryMatches =
        selectedCategory === "all" ||
        normalizeCategoryName(productCategorySlug) === normalizeCategoryName(selectedCategory) ||
        normalizeCategoryName(productCategoryName) === normalizeCategoryName(selectedCategory) ||
        normalizeCategoryName(productCategoryId || "") === normalizeCategoryName(selectedCategory);

      const productSubcategory = inferProductSubcategory(product, productCategorySlug);
      const subcategoryMatches =
        selectedSubcategory === "all" ||
        selectedCategory === "all" ||
        productSubcategory === selectedSubcategory ||
        normalizeCategoryName(productSubcategory) === normalizeCategoryName(selectedSubcategory);

      const searchableText = [
        product.name,
        product.description,
        productCategoryName,
        productCategoryId,
        productSubcategory,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchMatches = !searchTerm.trim() || searchableText.includes(searchTerm.trim().toLowerCase());

      const price = Number(product.price) || 0;
      const priceMatches =
        selectedPriceFilter === "all" ||
        (selectedPriceFilter === "under-500" && price < 500) ||
        (selectedPriceFilter === "500-1000" && price >= 500 && price <= 1000) ||
        (selectedPriceFilter === "1000-2000" && price > 1000 && price <= 2000) ||
        (selectedPriceFilter === "over-2000" && price > 2000);

      const productColour = (product.colour || product.color || "").toString().toLowerCase();
      const colorMatches =
        selectedColorFilter === "all" ||
        productColour.includes(selectedColorFilter.toLowerCase());

      return categoryMatches && subcategoryMatches && searchMatches && priceMatches && colorMatches;
    })
    .sort((a, b) => {
      const popularityScoreA = Number(a.rating ?? a.popularity ?? a.stock ?? 0);
      const popularityScoreB = Number(b.rating ?? b.popularity ?? b.stock ?? 0);
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;

      // Applies different storefront sorting modes depending on the selected popularity option.
      switch (selectedPopularityFilter) {
        case "top-rated":
          return popularityScoreB - popularityScoreA;
        case "best-sellers":
          return (Number(b.stock ?? 0) + popularityScoreB) - (Number(a.stock ?? 0) + popularityScoreA);
        case "price-low-high":
          return priceA - priceB;
        case "price-high-low":
          return priceB - priceA;
        default:
          return popularityScoreB - popularityScoreA;
      }
    });

  return (
    <main className="products-home">
      <section className="products-hero" id="home">
        <p className="welcome">WELCOME TO ANIME STORE</p>
        <h2>Find your next <span>favorite</span>.</h2>
        <p>Discover anime-inspired clothing and collectibles selected for every fan.</p>
      </section>

      <section className="categories-section">
        <div className="products-section-header">
          <div>
            <p className="section-label">SHOP BY VIBE</p>
            <h2>Popular Categories</h2>
          </div>
          <div className="category-header-actions">
            <button type="button" className="category-toggle" onClick={() => navigate("/all-categories")}>
              All Categories
            </button>
          </div>
        </div>

        {categoriesLoading ? (
          <p className="products-message">Loading categories...</p>
        ) : (
          <>
            {/* Homepage featured cards: keep the three popular category links visible and routed to the correct filtered catalog view. */}
            <div className="category-grid">
              {homePopularCategories.map((category, index) => {
                const look = categoryLooks[index % categoryLooks.length];
                const categoryKey = category.categoryId || category.name;
                const categoryValue = normalizeCategoryName(category.categoryId || category.name || "");
                const categoryDescription = category.description || "Signature pieces designed for every anime mood.";

                return (
                  <Link
                    key={categoryKey}
                    to={`/catalog?category=${encodeURIComponent(categoryValue)}`}
                    className={`category-card ${selectedCategory === categoryValue ? "category-card-active" : ""}`}
                    style={{
                      "--card-accent": look.accent,
                      "--card-glow": look.glow,
                    }}
                  >
                    <div className="category-icon" aria-hidden="true">{look.icon}</div>
                    <div className="category-copy">
                      <p className="category-kicker">Popular</p>
                      <h3>{category.name}</h3>
                      <p>{categoryDescription}</p>
                    </div>
                    <span className="category-link">Explore</span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {showCategoryDrawer && (
        <div className="category-drawer-overlay" onClick={() => setShowCategoryDrawer(false)}>
          <aside className="category-drawer" onClick={(event) => event.stopPropagation()} aria-label="Category drawer">
            <div className="category-drawer-header">
              <div>
                <p className="section-label">CATEGORY BROWSER</p>
                <h3>Popular Categories</h3>
              </div>
              <button type="button" className="drawer-close" onClick={() => setShowCategoryDrawer(false)} aria-label="Close category drawer">
                ✕
              </button>
            </div>

            <div className="drawer-search-wrap">
              <span>⌕</span>
              <input
                type="search"
                value={drawerSearchTerm}
                onChange={(event) => setDrawerSearchTerm(event.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
              />
            </div>

            <div className="category-chip-row">
              {drawerQuickFilters.map((filter) => {
                const isActive = filter === "All" && !drawerSearchTerm.trim();

                return (
                  <button
                    key={filter}
                    type="button"
                    className={`category-chip ${isActive ? "category-chip-active" : ""}`}
                    onClick={() => {
                      if (filter === "All") {
                        setDrawerSearchTerm("");
                        return;
                      }

                      setDrawerSearchTerm(filter);
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <div className="category-drawer-grid">
              <button
                type="button"
                className="category-card"
                onClick={() => {
                  setShowCategoryDrawer(false);
                  handleCategorySelect("all");
                }}
                style={{
                  "--card-accent": "#49dce7",
                  "--card-glow": "rgba(73, 220, 231, 0.22)",
                }}
              >
                <div className="category-icon" aria-hidden="true">✨</div>
                <div className="category-copy">
                  <p className="category-kicker">Featured</p>
                  <h3>Popular Categories</h3>
                  <p>Jump straight to the full anime clothing and accessory collection.</p>
                </div>
                <span className="category-link">All products</span>
              </button>

              {filteredDrawerCategories.map((category, index) => {
                const look = categoryLooks[index % categoryLooks.length];
                const categoryName = category.name;
                const categoryKey = category.categoryId || categoryName;
                const categoryValue = mapCategoryName(categoryName || category.categoryId || "");
                const categoryDescription = category.description || "Signature pieces designed for every anime mood.";

                return (
                  <button
                    key={`${categoryKey}-drawer`}
                    type="button"
                    className={`category-card ${selectedCategory === categoryValue ? "category-card-active" : ""}`}
                    onClick={() => handleCategorySelect(categoryValue)}
                    style={{
                      "--card-accent": look.accent,
                      "--card-glow": look.glow,
                    }}
                  >
                    <div className="category-icon" aria-hidden="true">{look.icon}</div>
                    <div className="category-copy">
                      <p className="category-kicker">Featured</p>
                      <h3>{categoryName}</h3>
                      <p>{categoryDescription}</p>
                    </div>
                    <span className="category-link">Explore</span>
                  </button>
                );
              })}
            </div>

            {!filteredDrawerCategories.length && (
              <div className="drawer-empty-state">
                <p>No matching categories were found.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      <section className="catalog-filters-section" aria-label="Product filters">
        <div className="catalog-search">
          <span>⌕</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search product or category..."
            aria-label="Search products or categories"
          />
        </div>

        <div className="catalog-filters">
          {selectedCategory !== "all" && (
            <label>
              <span>Filter</span>
              <select value={selectedSubcategory} onChange={(event) => handleSubcategoryFilterChange(event.target.value)}>
                <option value="all">All subcategories</option>
                {getCategorySubcategories(selectedCategory).map((subcategory) => (
                  <option key={subcategory} value={subcategory}>{subcategory}</option>
                ))}
              </select>
            </label>
          )}

          <label>
            <span>Price</span>
            <select value={selectedPriceFilter} onChange={(event) => handlePriceFilterChange(event.target.value)}>
              <option value="all">All prices</option>
              <option value="under-500">Under R 500</option>
              <option value="500-1000">R 500 - R 1000</option>
              <option value="1000-2000">R 1000 - R 2000</option>
              <option value="over-2000">R 2000+</option>
            </select>
          </label>

          <label>
            <span>Popularity</span>
            <select value={selectedPopularityFilter} onChange={(event) => handlePopularityFilterChange(event.target.value)}>
              <option value="all">Most popular</option>
              <option value="top-rated">Top rated</option>
              <option value="best-sellers">Best sellers</option>
              <option value="price-low-high">Price: low to high</option>
              <option value="price-high-low">Price: high to low</option>
            </select>
          </label>

          <label>
            <span>Colour</span>
            <select value={selectedColorFilter} onChange={(event) => handleColorFilterChange(event.target.value)}>
              <option value="all">All colours</option>
              <option value="black">Black</option>
              <option value="white">White</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="pink">Pink</option>
              <option value="purple">Purple</option>
            </select>
          </label>
        </div>
      </section>

      {catalogActivated || selectedCategory !== "all" || searchTerm.trim() || selectedPriceFilter !== "all" || selectedPopularityFilter !== "all" || selectedColorFilter !== "all" || selectedSubcategory !== "all" ? (
        <section className="products-section" id="products">
          <div className="products-section-header">
            <div>
              <p className="section-label">OUR COLLECTION</p>
              <h2>{selectedCategory === "all" ? "Featured Products" : `${displayCategories.find((category) => normalizeCategoryName(category.name) === normalizeCategoryName(selectedCategory))?.name || "Category"} Collection`}</h2>
            </div>
            {!loading && <span>{filteredProducts.length} products</span>}
          </div>

          {loading && <p className="products-message">Loading products...</p>}
          {error && <p className="products-message error-message">{error}</p>}
          {!loading && !error && filteredProducts.length === 0 && (
            <p className="products-message">No products are available in this category yet.</p>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const image = getProductImage(product);
                const category = product.category?.name || "Anime Collection";

                return (
                  <Link
                    className="product-card"
                    key={product.productId}
                    to={`/products/${product.productId}`}
                  >
                    <div className="product-image">
                      {image ? (
                        <img src={image} alt={product.name} />
                      ) : (
                        <span>⚔</span>
                      )}
                    </div>
                    <div className="product-details">
                      <p className="product-category">{category}</p>
                      <h3>{product.name}</h3>
                      <div className="product-meta">
                        <strong>R {Number(product.price).toFixed(2)}</strong>
                        <span className={product.stock > 0 ? "in-stock" : "out-of-stock"}>
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}

export default ProductsPage;

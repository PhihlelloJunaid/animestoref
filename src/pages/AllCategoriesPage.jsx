import { Link } from "react-router-dom";

const allCategoryCards = [
  { id: "clothing", name: "Clothing", icon: "👕", description: "Streetwear essentials, statement layers, and everyday anime fits." },
  { id: "accessories", name: "Accessories", icon: "🧢", description: "Pins, badges, jewelry, wallets, and finishing details for your fit." },
  { id: "tech", name: "Tech", icon: "💻", description: "Phone gear, desk upgrades, and practical anime-themed extras." },
  { id: "art", name: "Art", icon: "🎨", description: "Posters, art books, and visual pieces for walls and desks." },
  { id: "collectibles", name: "Collectibles", icon: "🧩", description: "Figurines, stands, and premium fan favourites worth keeping close." },
  { id: "cosplay", name: "Cosplay", icon: "🧥", description: "Outfits, props, and character-inspired pieces made for your next build." },
  { id: "home-and-lifestyle", name: "Home & Lifestyle", icon: "🏠", description: "Desk essentials, room upgrades, and everyday pieces with anime energy." },
  { id: "bags", name: "Bags", icon: "🎒", description: "Backpacks, totes, and functional accessories for daily carry." },
  { id: "footwear", name: "Footwear", icon: "👟", description: "Sneakers, slides, and shoes built for comfort and streetwear style." },
  { id: "stationery", name: "Stationery", icon: "✏️", description: "Notebooks, planners, and writing essentials for fan life." },
  { id: "jewellery", name: "Jewellery", icon: "💍", description: "Statement rings, charms, and subtle details that elevate any fit." },
  { id: "gaming", name: "Gaming", icon: "🎮", description: "Controller accessories, desk upgrades, and everyday play essentials." },
  { id: "room-decor", name: "Room Decor", icon: "🖼️", description: "Wall art, accents, and decor pieces to give your space some anime vibe." },
];

const categoryLooks = [
  { accent: "#49dce7", glow: "rgba(73, 220, 231, 0.22)" },
  { accent: "#e6b85c", glow: "rgba(230, 184, 92, 0.22)" },
  { accent: "#7cc6ff", glow: "rgba(124, 198, 255, 0.2)" },
  { accent: "#9a7cff", glow: "rgba(154, 124, 255, 0.18)" },
  { accent: "#62df9a", glow: "rgba(98, 223, 154, 0.18)" },
  { accent: "#ff8ec2", glow: "rgba(255, 142, 194, 0.18)" },
];

function AllCategoriesPage() {
  return (
    <main className="all-categories-page">
      <section className="all-categories-header">
        <p className="section-label">ALL CATEGORIES</p>
        <h2>Shop every anime category</h2>
      </section>

      <div className="category-grid all-categories-grid">
        {allCategoryCards.map((category, index) => {
          const look = categoryLooks[index % categoryLooks.length];

          return (
            <Link
              key={category.id}
              to={`/catalog?category=${category.id}`}
              className="category-card"
              style={{
                "--card-accent": look.accent,
                "--card-glow": look.glow,
              }}
            >
              <div className="category-icon" aria-hidden="true">{category.icon}</div>
              <div className="category-copy">
                <p className="category-kicker">Category</p>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <span className="category-link">Open</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

export default AllCategoriesPage;

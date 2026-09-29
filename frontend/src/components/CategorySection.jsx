import {
  Apple,
  Milk,
  Wheat,
  Cookie,
  Coffee,
  SprayCan,
  HeartPulse,
} from "lucide-react";

function CategorySection() {
  const categories = [
    { name: "Fruits & Vegetables", icon: Apple },
    { name: "Dairy & Bakery", icon: Milk },
    { name: "Staples", icon: Wheat },
    { name: "Snacks", icon: Cookie },
    { name: "Beverages", icon: Coffee },
    { name: "Household", icon: SprayCan },
    { name: "Personal Care", icon: HeartPulse },
  ];

  return (
    <section className="category-section">
      <div className="section-heading">
        <p>EXPLORE OUR PRODUCTS</p>
        <h2>Shop by Categories</h2>
      </div>

      <div className="category-list">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <div className="category-card" key={category.name}>
              <div className="category-image">
                <Icon size={32} strokeWidth={1.8} />
              </div>

              <h3>{category.name}</h3>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CategorySection;
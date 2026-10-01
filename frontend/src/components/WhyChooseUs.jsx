import {
  Truck,
  Leaf,
  ShieldCheck,
  BadgeIndianRupee,
  Gift,
} from "lucide-react";

function WhyChooseUs() {
  const features = [
    {
      title: "Fast Delivery",
      description: "Get your groceries delivered quickly to your doorstep.",
      icon: Truck,
    },
    {
      title: "Fresh Products",
      description: "Quality and freshness in every order.",
      icon: Leaf,
    },
    {
      title: "Secure Payments",
      description: "Safe and reliable payment options.",
      icon: ShieldCheck,
    },
    {
      title: "Reasonable Prices",
      description: "Great products at prices you'll love.",
      icon: BadgeIndianRupee,
    },
    {
      title: "Great Offers",
      description: "Save more with our latest deals and offers.",
      icon: Gift,
    },
  ];

  return (
    <section className="why-section">
      <div className="section-heading">
        <p>WHY SHOP WITH US</p>
        <h2>Why Choose Us</h2>
      </div>

      <div className="why-list">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div className="why-card" key={feature.title}>
              <div className="why-icon">
                <Icon size={30} strokeWidth={1.8} />
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WhyChooseUs;
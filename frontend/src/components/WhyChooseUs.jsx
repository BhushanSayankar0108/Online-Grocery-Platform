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
      title: "Reliable Delivery",
      description: "Get your everyday groceries delivered to your doorstep.",
      icon: Truck,
    },
    {
      title: "Fresh Products",
      description: "Carefully selected products with freshness in mind.",
      icon: Leaf,
    },
    {
      title: "Secure Payments",
      description: "Safe and convenient payment options at checkout.",
      icon: ShieldCheck,
    },
    {
      title: "Fair Prices",
      description: "Everyday essentials at prices that make sense.",
      icon: BadgeIndianRupee,
    },
    {
      title: "Better Offers",
      description: "Enjoy useful deals and savings on your regular shopping.",
      icon: Gift,
    },
  ];

  return (
    <section className="why-section">
      <div className="section-heading why-heading">
        <div>
          <p>BUILT FOR BETTER SHOPPING</p>
          <h2>Everything you need, made simple.</h2>
        </div>
      </div>

      <div className="why-list">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <div className="why-card" key={feature.title}>
              <div className="why-icon">
                <Icon size={22} strokeWidth={1.8} />
              </div>

              <div className="why-card-content">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WhyChooseUs;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Truck,
  HeartHandshake,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DEFAULT_ABOUT_CONTENT =
  "Online Grocery brings fresh groceries and everyday essentials together in one convenient place, making your daily shopping simple and reliable.";

function About() {
  const [aboutContent, setAboutContent] = useState({
    title: "About Us",
    content: DEFAULT_ABOUT_CONTENT,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchAboutContent = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cms/public`
        );

        if (!response.ok) {
          throw new Error("Unable to fetch About Us content.");
        }

        const result = await response.json();

        if (!result.success || cancelled) return;

        const contentItems = result.data?.contentItems || [];

        const aboutItem = contentItems.find(
          (item) =>
            item.type === "about" &&
            item.status?.toLowerCase() === "active"
        );

        if (aboutItem && !cancelled) {
          setAboutContent({
            title: aboutItem.title || "About Us",
            content: aboutItem.content || DEFAULT_ABOUT_CONTENT,
          });
        }
      } catch (error) {
        console.error("About page CMS error:", error);
      }
    };

    fetchAboutContent();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="info-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            Home / {aboutContent.title}
          </p>

          <span className="info-eyebrow">
            ABOUT ONLINE GROCERY
          </span>

          <h1>Groceries made simpler for everyday life.</h1>

          <p className="info-intro">
            {aboutContent.content}
          </p>
        </div>

        <section className="info-feature-card">
          <div>
            <span className="info-eyebrow">OUR MISSION</span>

            <h2>
              Fresh products. Simple shopping. Reliable delivery.
            </h2>

            <p>
              We aim to make grocery shopping convenient by giving
              customers an easy way to discover products, compare
              options, place orders and have their essentials
              delivered to their doorstep.
            </p>
          </div>

          <div className="info-feature-icon">
            <Leaf size={42} strokeWidth={1.6} />
          </div>
        </section>

        <section className="info-values">
          <div className="info-section-heading">
            <span className="info-eyebrow">WHY CHOOSE US</span>
            <h2>Built around your everyday needs.</h2>
          </div>

          <div className="info-values-grid">
            <article className="info-value-card">
              <div className="info-value-icon">
                <Leaf size={24} />
              </div>

              <h3>Fresh Selection</h3>

              <p>
                Shop a wide range of groceries, fresh produce and
                everyday essentials from one place.
              </p>
            </article>

            <article className="info-value-card">
              <div className="info-value-icon">
                <Truck size={24} />
              </div>

              <h3>Convenient Delivery</h3>

              <p>
                Choose a suitable delivery option and get your
                groceries delivered conveniently to your doorstep.
              </p>
            </article>

            <article className="info-value-card">
              <div className="info-value-icon">
                <ShieldCheck size={24} />
              </div>

              <h3>Secure Shopping</h3>

              <p>
                We focus on providing a simple and secure shopping
                experience from browsing to checkout.
              </p>
            </article>

            <article className="info-value-card">
              <div className="info-value-icon">
                <HeartHandshake size={24} />
              </div>

              <h3>Customer First</h3>

              <p>
                Helpful support and a straightforward shopping
                experience are at the heart of our platform.
              </p>
            </article>
          </div>
        </section>

        <section className="info-bottom-cta">
          <div>
            <span className="info-eyebrow">READY TO SHOP?</span>

            <h2>
              Everything you need, just a few clicks away.
            </h2>

            <p>
              Explore our categories and find your everyday
              essentials.
            </p>
          </div>

          <Link to="/shop" className="info-cta-button">
            Start Shopping
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default About;

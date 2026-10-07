import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse the products you need, add them to your cart, and continue to checkout. Enter your delivery details, select a delivery slot and payment method, then place your order.",
  },
  {
    question: "Can I change my delivery address?",
    answer:
      "Yes. You can manage your saved delivery addresses from the Addresses section of your account. Select the appropriate address before completing checkout.",
  },
  {
    question: "What payment methods are available?",
    answer:
      "The platform supports payment options such as UPI, cards, net banking and Cash on Delivery, depending on availability.",
  },
  {
    question: "How can I track my order?",
    answer:
      "After placing an order, you can open My Orders and select the relevant order to view its current delivery status.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Order cancellation depends on the current order status. If cancellation is available, the option will be shown for the relevant order.",
  },
  {
    question: "What if I receive a damaged or incorrect product?",
    answer:
      "You can submit a return or refund request from the relevant delivered order. Select the appropriate reason and provide the required details.",
  },
  {
    question: "How does delivery work?",
    answer:
      "Delivery availability depends on your location and the delivery zones supported by the platform. Available delivery slots are shown during checkout.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "Visit the Help & Support section to find available support options and submit your request.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="info-page faq-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">Home / FAQ</p>

          <span className="info-eyebrow">HELP CENTER</span>

          <h1>Frequently asked questions.</h1>

          <p className="info-intro">
            Find quick answers to common questions about shopping, orders,
            delivery, payments and returns.
          </p>
        </div>

        <section className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                className={`faq-item ${isOpen ? "open" : ""}`}
                key={faq.question}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className="faq-chevron"
                  />
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <section className="info-bottom-cta">
          <div>
            <span className="info-eyebrow">STILL NEED HELP?</span>
            <h2>We're here to help.</h2>
            <p>
              If you couldn't find your answer, contact our support team.
            </p>
          </div>

          <Link to="/support" className="info-cta-button">
            Contact Support
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default FAQ;

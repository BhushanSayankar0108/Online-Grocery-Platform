import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">

        <div className="newsletter-copy">
          <div className="newsletter-label">
            <Mail size={15} />
            <span>STAY IN THE LOOP</span>
          </div>

          <h2>
            Fresh deals,
            <br />
            straight to your inbox.
          </h2>

          <p>
            Get updates about new products, useful offers,
            and grocery deals worth checking out.
          </p>
        </div>

        <div className="newsletter-action">
          {!subscribed ? (
            <form
              className="newsletter-form"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                aria-label="Email address"
                required
              />

              <button type="submit">
                Subscribe
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="newsletter-success">
              <strong>You're subscribed.</strong>
              <span>
                We'll keep you updated with our latest offers.
              </span>
            </div>
          )}

          <span className="newsletter-note">
            No spam. Only useful grocery updates.
          </span>
        </div>

      </div>
    </section>
  );
}

export default Newsletter;
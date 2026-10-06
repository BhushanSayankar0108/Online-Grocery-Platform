import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Tag } from "lucide-react";

function DealOfTheDay() {
  return (
    <section className="deal-section">
      <div className="deal-content">

        {/* LEFT — DEAL INFORMATION */}
        <div className="deal-text">
          <div className="deal-label">
            <Tag size={15} />
            <span>LIMITED TIME OFFER</span>
          </div>

          <h2>
            Deals worth
            <br />
            <span>grabbing today.</span>
          </h2>

          <p>
            Save more on everyday essentials with our handpicked deals.
            Shop before today's offers end.
          </p>

          {/* COUNTDOWN */}
          <div className="deal-timer">
            <div className="deal-time">
              <strong>08</strong>
              <span>Hours</span>
            </div>

            <div className="deal-separator">:</div>

            <div className="deal-time">
              <strong>32</strong>
              <span>Minutes</span>
            </div>

            <div className="deal-separator">:</div>

            <div className="deal-time">
              <strong>45</strong>
              <span>Seconds</span>
            </div>
          </div>

          <Link to="/shop" className="deal-button">
            Shop Today's Deals
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* RIGHT — VISUAL */}
        <div className="deal-visual">
          <div className="deal-visual-content">
            <Clock3 size={20} />

            <span>Today's Savings</span>

            <strong>Fresh picks.</strong>
            <strong>Better prices.</strong>
          </div>
        </div>

      </div>
    </section>
  );
}

export default DealOfTheDay;
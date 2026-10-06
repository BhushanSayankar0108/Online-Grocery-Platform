import { Link } from "react-router-dom";

function DealOfTheDay() {
  return (
    <section className="deal-section">
      <div className="section-heading">
        <p>LIMITED TIME OFFER</p>
        <h2>Deal of the Day</h2>
      </div>

      <div className="deal-content">
        <div className="deal-text">
          <h3>Special Deals on Everyday Essentials</h3>

          <p>
            Grab today's selected products at special prices before the
            offer ends.
          </p>

          <div className="deal-timer">
            <div>
              <strong>08</strong>
              <span>Hours</span>
            </div>

            <div>
              <strong>32</strong>
              <span>Minutes</span>
            </div>

            <div>
              <strong>45</strong>
              <span>Seconds</span>
            </div>
          </div>

          <Link to="/shop" className="deal-button">
            Shop Deals
          </Link>
        </div>
      </div>
    </section>
  );
}

export default DealOfTheDay;
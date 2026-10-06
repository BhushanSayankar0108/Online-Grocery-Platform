import { Star, Quote } from "lucide-react";

function CustomerReviews() {
  const reviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      review:
        "Fresh products, quick delivery, and a very smooth shopping experience.",
    },
    {
      name: "Rahul Patil",
      rating: 5,
      review:
        "The groceries arrived fresh and well packed. Prices are also reasonable.",
    },
    {
      name: "Sneha Kulkarni",
      rating: 4,
      review:
        "Easy to browse and order. Delivery was on time and everything was good.",
    },
  ];

  return (
    <section className="reviews-section">
      <div className="section-heading reviews-heading">
        <div>
          <p>WHAT OUR CUSTOMERS SAY</p>
          <h2>Shopping made better for everyday needs.</h2>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <article className="review-card" key={review.name}>

            <div className="review-top">
              <div className="review-rating">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={15}
                    fill={
                      index < review.rating
                        ? "currentColor"
                        : "none"
                    }
                    strokeWidth={1.8}
                  />
                ))}
              </div>

              <Quote
                className="review-quote"
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <p className="review-text">
              {review.review}
            </p>

            <div className="review-customer">
              <div className="review-avatar">
                {review.name.charAt(0)}
              </div>

              <div>
                <h3>{review.name}</h3>
                <span>Verified customer</span>
              </div>
            </div>

          </article>
        ))}
      </div>
    </section>
  );
}

export default CustomerReviews;
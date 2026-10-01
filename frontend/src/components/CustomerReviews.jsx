function CustomerReviews() {
  const reviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      review: "Fresh products, quick delivery, and a very smooth shopping experience.",
    },
    {
      name: "Rahul Patil",
      rating: 5,
      review: "The groceries arrived fresh and well packed. Prices are also reasonable.",
    },
    {
      name: "Sneha Kulkarni",
      rating: 4,
      review: "Easy to browse and order. Delivery was on time and everything was good.",
    },
  ];

  return (
    <section className="reviews-section">
      <div className="section-heading">
        <p>WHAT OUR CUSTOMERS SAY</p>
        <h2>Customer Reviews</h2>
      </div>

      <div className="reviews-list">
        {reviews.map((review) => (
          <div className="review-card" key={review.name}>
            <div className="review-rating">
              {"★".repeat(review.rating)}
            </div>

            <p className="review-text">"{review.review}"</p>

            <h3>{review.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CustomerReviews;
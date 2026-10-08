import { useState } from "react";
import { Link } from "react-router-dom";

const deliveredOrders = [
  {
    id: "ORD1001",
    date: "24 Sep 2026",
    items: [
      {
        name: "Fresh Apples",
        quantity: 2,
        price: 120,
      },
      {
        name: "Fresh Milk",
        quantity: 2,
        price: 55,
      },
      {
        name: "Whole Wheat Bread",
        quantity: 1,
        price: 45,
      },
    ],
  },
];

const returnReasons = [
  "Damaged product",
  "Wrong product delivered",
  "Missing item",
  "Expired product",
  "Quality issue",
  "Other",
];

function Returns() {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const order = deliveredOrders.find(
    (item) => item.id === selectedOrder
  );

  const selectedProduct = order?.items.find(
    (item) => item.name === selectedItem
  );

  const handleOrderChange = (event) => {
    setSelectedOrder(event.target.value);
    setSelectedItem("");
    setReason("");
    setDescription("");
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedOrder || !selectedItem || !reason) {
      return;
    }

    setSubmitted(true);
  };

  return (
    <main className="returns-page">
      <div className="returns-container">

        <div className="returns-header">
          <Link to="/orders" className="returns-back-link">
            ← Back to My Orders
          </Link>

          <p>Home / My Orders / Returns & Refunds</p>

          <h1>Returns & Refunds</h1>

          <p>
            Request a return or refund for an eligible delivered product.
          </p>
        </div>

        {submitted ? (
          <div className="return-success-card">
            <div className="return-success-icon">✓</div>

            <span className="return-success-label">
              Request Submitted
            </span>

            <h2>Return request received</h2>

            <p>
              Your return request for{" "}
              <strong>{selectedProduct?.name}</strong> has been submitted
              successfully.
            </p>

            <div className="return-request-summary">
              <div>
                <span>Request ID</span>
                <strong>RET10001</strong>
              </div>

              <div>
                <span>Order ID</span>
                <strong>#{selectedOrder}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong className="return-status-pending">
                  Pending Review
                </strong>
              </div>
            </div>

            <p className="return-success-note">
              Our team will review your request and update the status once
              it has been processed.
            </p>

            <div className="return-success-actions">
              <button
                type="button"
                className="return-new-button"
                onClick={() => {
                  setSubmitted(false);
                  setSelectedItem("");
                  setReason("");
                  setDescription("");
                }}
              >
                Submit Another Request
              </button>

              <Link to="/orders" className="return-orders-button">
                View My Orders
              </Link>
            </div>
          </div>
        ) : (
          <div className="returns-layout">

            <section className="return-form-card">
              <div className="return-form-heading">
                <span>RETURN REQUEST</span>
                <h2>Request a return or refund</h2>
                <p>
                  Select the order and product you need help with.
                </p>
              </div>

              <form onSubmit={handleSubmit}>

                <div className="return-form-group">
                  <label htmlFor="return-order">
                    Select Order
                  </label>

                  <select
                    id="return-order"
                    value={selectedOrder}
                    onChange={handleOrderChange}
                    required
                  >
                    <option value="">
                      Choose a delivered order
                    </option>

                    {deliveredOrders.map((item) => (
                      <option key={item.id} value={item.id}>
                        #{item.id} — {item.date}
                      </option>
                    ))}
                  </select>
                </div>

                {order && (
                  <div className="return-form-group">
                    <label htmlFor="return-product">
                      Select Product
                    </label>

                    <select
                      id="return-product"
                      value={selectedItem}
                      onChange={(event) => {
                        setSelectedItem(event.target.value);
                        setSubmitted(false);
                      }}
                      required
                    >
                      <option value="">
                        Choose a product
                      </option>

                      {order.items.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name} — Qty {item.quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedProduct && (
                  <div className="selected-return-product">
                    <div>
                      <span>Selected Product</span>
                      <strong>{selectedProduct.name}</strong>
                    </div>

                    <div>
                      <span>Quantity</span>
                      <strong>{selectedProduct.quantity}</strong>
                    </div>
                  </div>
                )}

                <div className="return-form-group">
                  <label htmlFor="return-reason">
                    Reason for Return
                  </label>

                  <select
                    id="return-reason"
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value)
                    }
                    required
                  >
                    <option value="">
                      Select a reason
                    </option>

                    {returnReasons.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="return-form-group">
                  <label htmlFor="return-description">
                    Additional Details
                    <span>Optional</span>
                  </label>

                  <textarea
                    id="return-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="Tell us more about the issue..."
                    rows="5"
                  />
                </div>

                <button
                  type="submit"
                  className="submit-return-button"
                >
                  Submit Return Request
                </button>
              </form>
            </section>

            <aside className="return-info-card">
              <span>RETURN POLICY</span>

              <h2>How returns work</h2>

              <div className="return-step">
                <div>1</div>
                <div>
                  <strong>Submit your request</strong>
                  <p>
                    Tell us which product has an issue and why.
                  </p>
                </div>
              </div>

              <div className="return-step">
                <div>2</div>
                <div>
                  <strong>Request review</strong>
                  <p>
                    Our team reviews the return request.
                  </p>
                </div>
              </div>

              <div className="return-step">
                <div>3</div>
                <div>
                  <strong>Return approval</strong>
                  <p>
                    If approved, we'll arrange the next steps.
                  </p>
                </div>
              </div>

              <div className="return-step">
                <div>4</div>
                <div>
                  <strong>Refund processed</strong>
                  <p>
                    Eligible refunds are processed after approval.
                  </p>
                </div>
              </div>

              <div className="return-help-box">
                <strong>Need help?</strong>
                <p>
                  Contact our support team if you need assistance
                  with your return.
                </p>

                <Link to="/support">
                  Contact Support →
                </Link>
              </div>
            </aside>

          </div>
        )}
      </div>
    </main>
  );
}

export default Returns;
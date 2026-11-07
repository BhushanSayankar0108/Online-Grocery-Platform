
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL)
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const CMS_PUBLIC_API = `${API_ROOT}/cms/public`;

function getCustomerToken() {
  if (typeof window === "undefined") return "";

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const rawSession = storage.getItem("customerSession");

      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);

          const token =
            session?.token ||
            session?.accessToken ||
            session?.customerToken ||
            session?.jwt;

          if (token) return token;
        } catch {
          // Continue to standalone token keys.
        }
      }

      const token =
        storage.getItem("customerToken") ||
        storage.getItem("accessToken") ||
        storage.getItem("token") ||
        storage.getItem("jwt");

      if (token) return token;
    } catch {
      // Browser storage may be unavailable.
    }
  }

  return "";
}

function parseReturnsContent(content = "") {
  const sections = [];
  let currentSection = null;

  content.split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) return;

    const headingMatch = trimmedLine.match(/^##\s*(.*?)\s*\|\s*(.+)$/);

    if (headingMatch) {
      currentSection = {
        number: headingMatch[1],
        title: headingMatch[2],
        paragraphs: [],
      };

      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.paragraphs.push(trimmedLine);
    }
  });

  return sections;
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const returnReasons = [
  "Damaged product",
  "Wrong product delivered",
  "Missing item",
  "Expired product",
  "Quality issue",
  "Other",
];

function Returns() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [returnRequest, setReturnRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [returnsContent, setReturnsContent] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policyError, setPolicyError] = useState("");

  const fetchEligibleOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getCustomerToken();

      if (!token) {
        throw new Error("Please log in to request a return or refund.");
      }

      const response = await fetch(
        `${API_ROOT}/returns/eligible-orders`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to load eligible orders."
        );
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      if (isActive) {
        await fetchEligibleOrders();
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, [fetchEligibleOrders]);

  // Load return process information from Admin CMS.
  useEffect(() => {
    const controller = new AbortController();

    const fetchReturnsContent = async () => {
      try {
        const response = await fetch(CMS_PUBLIC_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load return process information.");
        }

        const result = await response.json();

        const contentItems = Array.isArray(result.data?.contentItems)
          ? result.data.contentItems
          : [];

        const activeContent = contentItems.find(
          (item) =>
            item.title?.trim().toLowerCase() === "returns process" &&
            item.status?.toLowerCase() === "active"
        );

        setReturnsContent(activeContent || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Returns CMS error:", err);
          setPolicyError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPolicyLoading(false);
        }
      }
    };

    fetchReturnsContent();

    return () => controller.abort();
  }, []);

  const order = orders.find(
    (item) => String(item._id) === selectedOrder
  );

  const selectedProduct = order?.items?.find(
    (item) => String(item._id) === selectedItem
  );

  const returnSteps = parseReturnsContent(
    returnsContent?.content || ""
  );

  const handleOrderChange = (event) => {
    setSelectedOrder(event.target.value);
    setSelectedItem("");
    setReason("");
    setDescription("");
    setSubmitted(false);
    setReturnRequest(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedOrder || !selectedItem || !reason) {
      setError("Please select an order, product and return reason.");
      return;
    }

    try {
      const token = getCustomerToken();

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      setSubmitting(true);

      const response = await fetch(`${API_ROOT}/returns/customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrder,
          orderItemId: selectedItem,
          reason,
          description,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "Unable to submit return request."
        );
      }

      setReturnRequest(data.returnRequest || null);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
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

        {error && (
          <div
            role="alert"
            className="return-error-message"
          >
            {error}

            {!submitted && (
              <button
                type="button"
                onClick={fetchEligibleOrders}
                disabled={loading}
              >
                {loading ? "Loading..." : "Retry"}
              </button>
            )}
          </div>
        )}

        {submitted ? (
          <div className="return-success-card">
            <div className="return-success-icon">✓</div>

            <span className="return-success-label">
              Request Submitted
            </span>

            <h2>Return request received</h2>

            <p>
              Your return request for{" "}
              <strong>{selectedProduct?.productName}</strong> has been
              submitted successfully.
            </p>

            <div className="return-request-summary">
              <div>
                <span>Request ID</span>
                <strong>
                  {returnRequest?.requestNumber || "Submitted"}
                </strong>
              </div>

              <div>
                <span>Order ID</span>
                <strong>
                  #{order?.orderNumber || selectedOrder}
                </strong>
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
                  setSelectedOrder("");
                  setSelectedItem("");
                  setReason("");
                  setDescription("");
                  setReturnRequest(null);
                  fetchEligibleOrders();
                }}
              >
                Submit Another Request
              </button>

              <Link to="/orders" className="return-orders-button">
                View My Orders
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="returns-loading">
            Loading your delivered orders...
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

              {orders.length === 0 ? (
                <div className="returns-empty">
                  <h3>No eligible delivered orders</h3>

                  <p>
                    You currently have no delivered products available
                    for return.
                  </p>

                  <Link to="/orders" className="return-orders-button">
                    View My Orders
                  </Link>
                </div>
              ) : (
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

                      {orders.map((item) => (
                        <option key={item._id} value={item._id}>
                          #{item.orderNumber} — {formatDate(item.createdAt)}
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
                          <option key={item._id} value={item._id}>
                            {item.productName} — Qty {item.quantity}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedProduct && (
                    <div className="selected-return-product">
                      <div>
                        <span>Selected Product</span>
                        <strong>{selectedProduct.productName}</strong>
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
                      onChange={(event) => setReason(event.target.value)}
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
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Tell us more about the issue..."
                      rows="5"
                      maxLength={1000}
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-return-button"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting Request..."
                      : "Submit Return Request"}
                  </button>
                </form>
              )}
            </section>

            <aside className="return-info-card">
              <span>RETURN POLICY</span>

              <h2>How returns work</h2>

              {policyLoading ? (
                <p>Loading return process...</p>
              ) : policyError ? (
                <p role="alert">{policyError}</p>
              ) : returnSteps.length > 0 ? (
                returnSteps.map((step, index) => (
                  <div
                    className="return-step"
                    key={`${step.number}-${index}`}
                  >
                    <div>{step.number}</div>

                    <div>
                      <strong>{step.title}</strong>

                      {step.paragraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  Return process information is currently unavailable.
                </p>
              )}

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

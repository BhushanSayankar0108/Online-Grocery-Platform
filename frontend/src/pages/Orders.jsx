import { Link } from "react-router-dom";

const orders = [
  {
    id: "ORD1001",
    date: "24 Sep 2026",
    status: "Delivered",
    total: 485,
    items: [
      { name: "Fresh Apples", quantity: 2 },
      { name: "Fresh Milk", quantity: 2 },
      { name: "Whole Wheat Bread", quantity: 1 },
    ],
  },
  {
    id: "ORD1002",
    date: "20 Sep 2026",
    status: "Out for Delivery",
    total: 620,
    items: [
      { name: "Basmati Rice", quantity: 1 },
      { name: "Orange Juice", quantity: 2 },
      { name: "Potato Chips", quantity: 3 },
    ],
  },
];

function Orders() {
  return (
    <main className="orders-page">
      <div className="orders-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <p>Home / My Orders</p>
        <h1>My Orders</h1>
        <p>View and manage your grocery orders.</p>
      </div>

      <div className="orders-content">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>Your orders will appear here after you place an order.</p>

            <Link to="/shop" className="orders-shop-button">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <span>Order ID</span>
                    <h2>#{order.id}</h2>
                  </div>

                  <div className={`order-status ${order.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-info">
                  <div>
                    <span>Order Date</span>
                    <strong>{order.date}</strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>₹{order.total}</strong>
                  </div>

                  <div>
                    <span>Items</span>
                    <strong>{order.items.length} products</strong>
                  </div>
                </div>

                <div className="order-items">
                  <h3>Order Items</h3>

                  {order.items.map((item) => (
                    <div className="order-item" key={item.name}>
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  <Link
                    to={`/order-tracking/${order.id}`}
                    className="order-track-button"
                  >
                    Track Order
                  </Link>

                  <button className="order-reorder-button">
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;
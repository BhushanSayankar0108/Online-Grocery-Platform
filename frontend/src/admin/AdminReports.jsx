import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CreditCard,
  Download,
  IndianRupee,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminReports.css";

const salesData = {
  today: {
    revenue: 18450,
    orders: 42,
    customers: 31,
    productsSold: 126,
    previousRevenue: 16200,
    previousOrders: 38,
  },
  week: {
    revenue: 128750,
    orders: 286,
    customers: 198,
    productsSold: 914,
    previousRevenue: 117400,
    previousOrders: 261,
  },
  month: {
    revenue: 486920,
    orders: 1128,
    customers: 734,
    productsSold: 3865,
    previousRevenue: 449600,
    previousOrders: 1034,
  },
  year: {
    revenue: 5842500,
    orders: 13640,
    customers: 8245,
    productsSold: 45280,
    previousRevenue: 5218000,
    previousOrders: 12180,
  },
};

const monthlySales = [
  { month: "Jan", revenue: 318000, orders: 742 },
  { month: "Feb", revenue: 342000, orders: 798 },
  { month: "Mar", revenue: 376000, orders: 856 },
  { month: "Apr", revenue: 401000, orders: 924 },
  { month: "May", revenue: 438000, orders: 1006 },
  { month: "Jun", revenue: 462000, orders: 1078 },
  { month: "Jul", revenue: 481000, orders: 1124 },
  { month: "Aug", revenue: 498000, orders: 1168 },
  { month: "Sep", revenue: 452000, orders: 1052 },
  { month: "Oct", revenue: 486920, orders: 1128 },
];

const topProducts = [
  {
    id: 1,
    name: "Fresh Organic Apples",
    category: "Fruits",
    units: 428,
    revenue: 64200,
  },
  {
    id: 2,
    name: "Full Cream Milk",
    category: "Dairy",
    units: 386,
    revenue: 23160,
  },
  {
    id: 3,
    name: "Basmati Rice 5kg",
    category: "Staples",
    units: 214,
    revenue: 29960,
  },
  {
    id: 4,
    name: "Fresh Tomatoes",
    category: "Vegetables",
    units: 198,
    revenue: 15840,
  },
  {
    id: 5,
    name: "Whole Wheat Bread",
    category: "Bakery",
    units: 176,
    revenue: 8800,
  },
];

const categorySales = [
  {
    name: "Fruits",
    orders: 284,
    revenue: 112450,
    percentage: 23,
  },
  {
    name: "Vegetables",
    orders: 248,
    revenue: 98400,
    percentage: 20,
  },
  {
    name: "Dairy",
    orders: 216,
    revenue: 82650,
    percentage: 17,
  },
  {
    name: "Staples",
    orders: 182,
    revenue: 76800,
    percentage: 16,
  },
  {
    name: "Bakery",
    orders: 124,
    revenue: 48200,
    percentage: 10,
  },
  {
    name: "Beverages",
    orders: 74,
    revenue: 31420,
    percentage: 6,
  },
  {
    name: "Other",
    orders: 56,
    revenue: 36980,
    percentage: 8,
  },
];

const paymentData = [
  {
    method: "UPI",
    orders: 482,
    amount: 198450,
    percentage: 41,
  },
  {
    method: "Credit / Debit Card",
    orders: 284,
    amount: 126780,
    percentage: 26,
  },
  {
    method: "Cash on Delivery",
    orders: 238,
    amount: 98450,
    percentage: 20,
  },
  {
    method: "Net Banking",
    orders: 82,
    amount: 35620,
    percentage: 7,
  },
  {
    method: "Wallet",
    orders: 42,
    amount: 18620,
    percentage: 4,
  },
];

const orderStatusData = [
  {
    status: "Delivered",
    count: 742,
    percentage: 66,
  },
  {
    status: "Out for Delivery",
    count: 126,
    percentage: 11,
  },
  {
    status: "Packed",
    count: 82,
    percentage: 7,
  },
  {
    status: "Picking",
    count: 64,
    percentage: 6,
  },
  {
    status: "Confirmed",
    count: 58,
    percentage: 5,
  },
  {
    status: "Pending",
    count: 34,
    percentage: 3,
  },
  {
    status: "Cancelled",
    count: 22,
    percentage: 2,
  },
];

function AdminReports() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-31");

  const currentData = salesData[period];

  const revenueChange = useMemo(() => {
    if (!currentData.previousRevenue) {
      return 0;
    }

    return (
      ((currentData.revenue - currentData.previousRevenue) /
        currentData.previousRevenue) *
      100
    ).toFixed(1);
  }, [currentData]);

  const orderChange = useMemo(() => {
    if (!currentData.previousOrders) {
      return 0;
    }

    return (
      ((currentData.orders - currentData.previousOrders) /
        currentData.previousOrders) *
      100
    ).toFixed(1);
  }, [currentData]);

  const formatCurrency = (value) => {
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleExport = () => {
    alert("Report export will be connected to the backend later.");
  };

  return (
    <div className="admin-reports-page">
      <div className="reports-container">
        <div className="reports-top-row">
          <button
            className="reports-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

        <div className="reports-header">
          <div className="reports-title-wrapper">
            <div className="reports-title-icon">
              <BarChart3 size={25} />
            </div>

            <div>
              <h1>Reports & Analytics</h1>
              <p>
                Monitor sales, orders, customers and business performance.
              </p>
            </div>
          </div>

          <button
            className="reports-export-button"
            onClick={handleExport}
          >
            <Download size={18} />
            Export Report
          </button>
        </div>

        <div className="reports-filter-card">
          <div className="reports-period-buttons">
            <button
              className={period === "today" ? "active" : ""}
              onClick={() => setPeriod("today")}
            >
              Today
            </button>

            <button
              className={period === "week" ? "active" : ""}
              onClick={() => setPeriod("week")}
            >
              This Week
            </button>

            <button
              className={period === "month" ? "active" : ""}
              onClick={() => setPeriod("month")}
            >
              This Month
            </button>

            <button
              className={period === "year" ? "active" : ""}
              onClick={() => setPeriod("year")}
            >
              This Year
            </button>
          </div>

          <div className="reports-date-filter">
            <div className="reports-date-field">
              <CalendarDays size={17} />

              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <span>to</span>

            <div className="reports-date-field">
              <CalendarDays size={17} />

              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="reports-stats-grid">
          <div className="reports-stat-card">
            <div className="reports-stat-icon revenue">
              <IndianRupee size={22} />
            </div>

            <div className="reports-stat-content">
              <span>Total Revenue</span>
              <strong>{formatCurrency(currentData.revenue)}</strong>

              <small className="positive">
                <ArrowUpRight size={14} />
                {revenueChange}% vs previous period
              </small>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon orders">
              <ShoppingCart size={22} />
            </div>

            <div className="reports-stat-content">
              <span>Total Orders</span>

              <strong>
                {currentData.orders.toLocaleString("en-IN")}
              </strong>

              <small className="positive">
                <ArrowUpRight size={14} />
                {orderChange}% vs previous period
              </small>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon customers">
              <Users size={22} />
            </div>

            <div className="reports-stat-content">
              <span>Customers</span>

              <strong>
                {currentData.customers.toLocaleString("en-IN")}
              </strong>

              <small>Active customer activity</small>
            </div>
          </div>

          <div className="reports-stat-card">
            <div className="reports-stat-icon products">
              <Package size={22} />
            </div>

            <div className="reports-stat-content">
              <span>Products Sold</span>

              <strong>
                {currentData.productsSold.toLocaleString("en-IN")}
              </strong>

              <small>Units sold during period</small>
            </div>
          </div>
        </div>

        <div className="reports-main-grid">
          <div className="reports-panel sales-chart-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Sales Overview</h2>
                <p>Monthly revenue and order performance.</p>
              </div>

              <div className="reports-chart-legend">
                <span>
                  <i className="legend-revenue"></i>
                  Revenue
                </span>

                <span>
                  <i className="legend-orders"></i>
                  Orders
                </span>
              </div>
            </div>

            <div className="reports-chart">
              <div className="reports-chart-y-axis">
                <span>₹500K</span>
                <span>₹400K</span>
                <span>₹300K</span>
                <span>₹200K</span>
                <span>₹100K</span>
                <span>₹0</span>
              </div>

              <div className="reports-chart-area">
                <div className="reports-chart-grid-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <div className="reports-bars">
                  {monthlySales.map((item) => {
                    const height = Math.max(
                      10,
                      (item.revenue / 500000) * 100
                    );

                    return (
                      <div
                        className="reports-bar-column"
                        key={item.month}
                      >
                        <div className="reports-bar-value">
                          {formatCurrency(item.revenue)}
                        </div>

                        <div className="reports-bar-wrapper">
                          <div
                            className="reports-bar"
                            style={{
                              height: `${height}%`,
                            }}
                          ></div>
                        </div>

                        <span>{item.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Order Status</h2>
                <p>Current order distribution.</p>
              </div>
            </div>

            <div className="order-status-list">
              {orderStatusData.map((item) => (
                <div
                  className="order-status-item"
                  key={item.status}
                >
                  <div className="order-status-top">
                    <span>{item.status}</span>
                    <strong>{item.count}</strong>
                  </div>

                  <div className="order-progress">
                    <div
                      className="order-progress-fill"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    ></div>
                  </div>

                  <small>{item.percentage}% of total orders</small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reports-two-column-grid">
          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Top Selling Products</h2>
                <p>Products generating the highest sales.</p>
              </div>
            </div>

            <div className="reports-product-list">
              {topProducts.map((product, index) => (
                <div
                  className="reports-product-item"
                  key={product.id}
                >
                  <div className="reports-product-rank">
                    #{index + 1}
                  </div>

                  <div className="reports-product-info">
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                  </div>

                  <div className="reports-product-units">
                    <strong>{product.units}</strong>
                    <span>units</span>
                  </div>

                  <div className="reports-product-revenue">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Category Sales</h2>
                <p>Sales distribution by category.</p>
              </div>
            </div>

            <div className="category-sales-list">
              {categorySales.map((category) => (
                <div
                  className="category-sales-item"
                  key={category.name}
                >
                  <div className="category-sales-top">
                    <span>{category.name}</span>

                    <strong>
                      {formatCurrency(category.revenue)}
                    </strong>
                  </div>

                  <div className="category-progress">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${category.percentage}%`,
                      }}
                    ></div>
                  </div>

                  <div className="category-sales-bottom">
                    <span>{category.orders} orders</span>
                    <span>{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="reports-two-column-grid">
          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Payment Summary</h2>
                <p>Revenue grouped by payment method.</p>
              </div>
            </div>

            <div className="reports-payment-list">
              {paymentData.map((payment) => (
                <div
                  className="reports-payment-item"
                  key={payment.method}
                >
                  <div className="reports-payment-icon">
                    <CreditCard size={18} />
                  </div>

                  <div className="reports-payment-info">
                    <strong>{payment.method}</strong>
                    <span>{payment.orders} orders</span>
                  </div>

                  <div className="reports-payment-amount">
                    <strong>
                      {formatCurrency(payment.amount)}
                    </strong>

                    <span>{payment.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reports-panel">
            <div className="reports-panel-header">
              <div>
                <h2>Delivery Overview</h2>
                <p>Order delivery performance.</p>
              </div>

              <Truck size={21} />
            </div>

            <div className="delivery-overview">
              <div className="delivery-big-number">
                <strong>94.2%</strong>
                <span>On-time delivery rate</span>
              </div>

              <div className="delivery-metrics">
                <div>
                  <span>Delivered</span>
                  <strong>742</strong>
                </div>

                <div>
                  <span>Out for Delivery</span>
                  <strong>126</strong>
                </div>

                <div>
                  <span>Delayed</span>
                  <strong>18</strong>
                </div>

                <div>
                  <span>Cancelled</span>
                  <strong>22</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="reports-summary-panel">
          <div className="reports-summary-icon">
            <BarChart3 size={22} />
          </div>

          <div>
            <h3>Report Summary</h3>

            <p>
              The current report is showing frontend demonstration data.
              Real sales, order, customer, payment and delivery statistics
              will be connected to the backend when backend development
              begins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
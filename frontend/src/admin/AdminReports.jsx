import { useMemo, useState } from "react";
import {
    ArrowDownRight,
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
    { name: "Fruits", orders: 284, revenue: 112450, percentage: 23 },
    { name: "Vegetables", orders: 248, revenue: 98400, percentage: 20 },
    { name: "Dairy", orders: 216, revenue: 82650, percentage: 17 },
    { name: "Staples", orders: 182, revenue: 76800, percentage: 16 },
    { name: "Bakery", orders: 124, revenue: 48200, percentage: 10 },
    { name: "Beverages", orders: 74, revenue: 31420, percentage: 6 },
    { name: "Other", orders: 56, revenue: 36980, percentage: 8 },
];

const paymentData = [
    { method: "UPI", orders: 482, amount: 198450, percentage: 41 },
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
    { method: "Net Banking", orders: 82, amount: 35620, percentage: 7 },
    { method: "Wallet", orders: 42, amount: 18620, percentage: 4 },
];

const orderStatusData = [
    { status: "Delivered", count: 742, percentage: 66 },
    { status: "Out for Delivery", count: 126, percentage: 11 },
    { status: "Packed", count: 82, percentage: 7 },
    { status: "Picking", count: 64, percentage: 6 },
    { status: "Confirmed", count: 58, percentage: 5 },
    { status: "Pending", count: 34, percentage: 3 },
    { status: "Cancelled", count: 22, percentage: 2 },
];

const DELIVERY_METRICS = [
    { label: "Delivered", value: 742 },
    { label: "Out for Delivery", value: 126 },
    { label: "Delayed", value: 18 },
    { label: "Cancelled", value: 22 },
];

const PERIOD_OPTIONS = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
];

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatNumber = (value) =>
    Number(value || 0).toLocaleString("en-IN");

const formatDateForDisplay = (value) => {
    if (!value) return "";

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          });
};

const escapeCsvValue = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
};

function downloadCsv(filename, rows) {
    const csv = rows
        .map((row) => row.map(escapeCsvValue).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getInitialDates() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return {
        startDate: `${year}-${month}-01`,
        endDate: `${year}-${month}-${day}`,
    };
}

function AdminReports() {
    const initialDates = getInitialDates();

    const [period, setPeriod] = useState("month");
    const [startDate, setStartDate] = useState(
        initialDates.startDate
    );
    const [endDate, setEndDate] = useState(initialDates.endDate);
    const [dateError, setDateError] = useState("");

    const currentData = salesData[period];

    const revenueChange = useMemo(() => {
        if (!currentData.previousRevenue) return 0;

        return (
            ((currentData.revenue - currentData.previousRevenue) /
                currentData.previousRevenue) *
            100
        ).toFixed(1);
    }, [currentData]);

    const orderChange = useMemo(() => {
        if (!currentData.previousOrders) return 0;

        return (
            ((currentData.orders - currentData.previousOrders) /
                currentData.previousOrders) *
            100
        ).toFixed(1);
    }, [currentData]);

    const revenueIsPositive = Number(revenueChange) >= 0;
    const ordersArePositive = Number(orderChange) >= 0;

    const validateDateRange = (start, end) => {
        if (!start || !end) {
            return "Please select both the start and end dates.";
        }

        if (start > end) {
            return "The start date cannot be later than the end date.";
        }

        return "";
    };

    const handleStartDateChange = (event) => {
        const nextDate = event.target.value;

        setStartDate(nextDate);
        setDateError(validateDateRange(nextDate, endDate));
        setPeriod("custom");
    };

    const handleEndDateChange = (event) => {
        const nextDate = event.target.value;

        setEndDate(nextDate);
        setDateError(validateDateRange(startDate, nextDate));
        setPeriod("custom");
    };

    const handlePeriodChange = (nextPeriod) => {
        const now = new Date();
        const end = new Date(now);
        const start = new Date(now);

        if (nextPeriod === "today") {
            // Start and end remain today.
        } else if (nextPeriod === "week") {
            const day = (now.getDay() + 6) % 7;
            start.setDate(now.getDate() - day);
        } else if (nextPeriod === "month") {
            start.setDate(1);
        } else if (nextPeriod === "year") {
            start.setMonth(0, 1);
        }

        const toInputDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");

            return `${year}-${month}-${day}`;
        };

        setStartDate(toInputDate(start));
        setEndDate(toInputDate(end));
        setPeriod(nextPeriod);
        setDateError("");
    };

    const handleExport = () => {
        const error = validateDateRange(startDate, endDate);

        if (error) {
            setDateError(error);
            window.alert(error);
            return;
        }

        if (
            !window.confirm(
                `Export the current demonstration report for ${formatDateForDisplay(
                    startDate
                )} to ${formatDateForDisplay(
                    endDate
                )} as a CSV file?`
            )
        ) {
            return;
        }

        const rows = [
            ["Online Grocery Platform - Reports & Analytics"],
            ["Start Date", startDate],
            ["End Date", endDate],
            ["Selected Period", period],
            [],
            ["Metric", "Value"],
            ["Total Revenue (INR)", currentData.revenue],
            ["Total Orders", currentData.orders],
            ["Customers", currentData.customers],
            ["Products Sold", currentData.productsSold],
            ["Previous Revenue (INR)", currentData.previousRevenue],
            ["Previous Orders", currentData.previousOrders],
            ["Revenue Change (%)", revenueChange],
            ["Order Change (%)", orderChange],
            [],
            ["Top Selling Products"],
            ["Product", "Category", "Units Sold", "Revenue (INR)"],
            ...topProducts.map((product) => [
                product.name,
                product.category,
                product.units,
                product.revenue,
            ]),
            [],
            ["Category Sales"],
            ["Category", "Orders", "Revenue (INR)", "Percentage"],
            ...categorySales.map((category) => [
                category.name,
                category.orders,
                category.revenue,
                `${category.percentage}%`,
            ]),
            [],
            ["Payment Summary"],
            ["Payment Method", "Orders", "Amount (INR)", "Percentage"],
            ...paymentData.map((payment) => [
                payment.method,
                payment.orders,
                payment.amount,
                `${payment.percentage}%`,
            ]),
            [],
            ["Order Status"],
            ["Status", "Count", "Percentage"],
            ...orderStatusData.map((item) => [
                item.status,
                item.count,
                `${item.percentage}%`,
            ]),
            [],
            [
                "Note",
                "This file contains frontend demonstration data, not live database records.",
            ],
        ];

        const filename = `grocery-report-${startDate}-to-${endDate}.csv`;

        downloadCsv(filename, rows);
    };

    const renderChangeIndicator = (value, isPositive) => {
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

        return (
            <small className={isPositive ? "positive" : "negative"}>
                <Icon size={14} />
                {isPositive ? "+" : ""}
                {value}% vs previous period
            </small>
        );
    };

    return (
        <div className="admin-reports-page">
            <div className="reports-container">
                <div className="reports-header">
                    <div className="reports-title-wrapper">
                        <div className="reports-title-icon">
                            <BarChart3 size={25} />
                        </div>

                        <div>
                            <h1>Reports &amp; Analytics</h1>
                            <p>
                                Monitor sales, orders, customers and business
                                performance.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="reports-export-button"
                        onClick={handleExport}
                    >
                        <Download size={18} />
                        Export Report
                    </button>
                </div>

                <div className="reports-filter-card">
                    <div
                        className="reports-period-buttons"
                        role="group"
                        aria-label="Report period"
                    >
                        {PERIOD_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    period === option.value ? "active" : ""
                                }
                                aria-pressed={period === option.value}
                                onClick={() =>
                                    handlePeriodChange(option.value)
                                }
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="reports-date-filter">
                        <div className="reports-date-field">
                            <CalendarDays size={17} />

                            <input
                                type="date"
                                aria-label="Report start date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={handleStartDateChange}
                            />
                        </div>

                        <span>to</span>

                        <div className="reports-date-field">
                            <CalendarDays size={17} />

                            <input
                                type="date"
                                aria-label="Report end date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={handleEndDateChange}
                            />
                        </div>
                    </div>

                    {dateError && (
                        <p className="reports-date-error" role="alert">
                            {dateError}
                        </p>
                    )}

                    <p className="reports-data-note">
                        Selected range: {formatDateForDisplay(startDate)} –{" "}
                        {formatDateForDisplay(endDate)}. Metrics currently use
                        demonstration data.
                    </p>
                </div>

                <div className="reports-stats-grid">
                    <div className="reports-stat-card">
                        <div className="reports-stat-icon revenue">
                            <IndianRupee size={22} />
                        </div>

                        <div className="reports-stat-content">
                            <span>Total Revenue</span>
                            <strong>{formatCurrency(currentData.revenue)}</strong>
                            {renderChangeIndicator(
                                revenueChange,
                                revenueIsPositive
                            )}
                        </div>
                    </div>

                    <div className="reports-stat-card">
                        <div className="reports-stat-icon orders">
                            <ShoppingCart size={22} />
                        </div>

                        <div className="reports-stat-content">
                            <span>Total Orders</span>
                            <strong>{formatNumber(currentData.orders)}</strong>
                            {renderChangeIndicator(
                                orderChange,
                                ordersArePositive
                            )}
                        </div>
                    </div>

                    <div className="reports-stat-card">
                        <div className="reports-stat-icon customers">
                            <Users size={22} />
                        </div>

                        <div className="reports-stat-content">
                            <span>Customers</span>
                            <strong>{formatNumber(currentData.customers)}</strong>
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
                                {formatNumber(currentData.productsSold)}
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
                                    <i className="legend-revenue" />
                                    Revenue
                                </span>
                                <span>
                                    <i className="legend-orders" />
                                    Orders
                                </span>
                            </div>
                        </div>

                        <div
                            className="reports-chart"
                            role="img"
                            aria-label="Monthly revenue bar chart"
                        >
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
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <span key={index} />
                                    ))}
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
                                                title={`${item.month}: ${formatCurrency(
                                                    item.revenue
                                                )}, ${formatNumber(
                                                    item.orders
                                                )} orders`}
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
                                                    />
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
                                <p>Order distribution in the sample data.</p>
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
                                        />
                                    </div>

                                    <small>
                                        {item.percentage}% of total orders
                                    </small>
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
                                        />
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
                                {DELIVERY_METRICS.map((metric) => (
                                    <div key={metric.label}>
                                        <span>{metric.label}</span>
                                        <strong>{metric.value}</strong>
                                    </div>
                                ))}
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
                            This report currently displays frontend demonstration
                            data. Sales, orders, customer, payment and delivery
                            figures are not live database records. Backend
                            integration can be added when backend development
                            begins.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminReports;
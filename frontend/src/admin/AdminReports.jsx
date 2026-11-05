


import { useEffect, useState } from "react";
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

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_REPORT = {
    summary: {
        revenue: 0,
        orders: 0,
        customers: 0,
        productsSold: 0,
        previousRevenue: 0,
        previousOrders: 0,
        revenueChange: 0,
        orderChange: 0,
    },
    monthlySales: [],
    topProducts: [],
    categorySales: [],
    paymentData: [],
    orderStatusData: [],
    deliveryMetrics: [],
};

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

// Convert backend payment method/type values into readable labels.
const getPaymentLabel = (payment) => {
    const type = String(payment?.paymentType || "").trim().toLowerCase();
    const method = String(payment?.method || "").trim().toLowerCase();

    if (type === "cod" || method === "cod" || method.includes("cash on delivery")) {
        return "Cash on Delivery";
    }

    const labels = {
        card: "Credit / Debit Card",
        upi_id: "UPI",
        upi: "UPI",
        qr_code: "QR Code",
        netbanking: "Net Banking",
        net_banking: "Net Banking",
        wallet: "Wallet",
    };

    if (labels[type]) return labels[type];
    if (type === "online" || method === "online") return "Online Payment";

    return payment?.method || "Other";
};

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
    const [startDate, setStartDate] = useState(initialDates.startDate);
    const [endDate, setEndDate] = useState(initialDates.endDate);
    const [dateError, setDateError] = useState("");

    const [report, setReport] = useState(EMPTY_REPORT);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState("");

    const currentData = report.summary;
    const monthlySales = report.monthlySales;
    const topProducts = report.topProducts;
    const categorySales = report.categorySales;
    const paymentData = report.paymentData;
    const orderStatusData = report.orderStatusData;
    const deliveryMetrics = report.deliveryMetrics;

    const revenueChange = Number(currentData.revenueChange || 0).toFixed(1);
    const orderChange = Number(currentData.orderChange || 0).toFixed(1);

    const revenueIsPositive = Number(revenueChange) >= 0;
    const ordersArePositive = Number(orderChange) >= 0;

    useEffect(() => {
        if (!startDate || !endDate || startDate > endDate) {
            return undefined;
        }

        const controller = new AbortController();

        const loadReports = async () => {
            setLoading(true);
            setApiError("");

            try {
                const token = localStorage.getItem("adminToken");

                if (!token) {
                    throw new Error(
                        "Admin session not found. Please log in again."
                    );
                }

                const query = new URLSearchParams({ startDate, endDate });
                const response = await fetch(
                    `${API_BASE_URL}/api/reports?${query.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Unable to load reports."
                    );
                }

                const data = result.data || {};

                setReport({
                    summary: {
                        ...EMPTY_REPORT.summary,
                        ...(data.summary || {}),
                    },
                    monthlySales: (data.monthlySales || []).map((item) => ({
                        ...item,
                        month: item.month
                            ? new Date(`${item.month}-01T00:00:00`).toLocaleDateString(
                                  "en-IN",
                                  { month: "short", year: "2-digit" }
                              )
                            : "",
                    })),
                    topProducts: (data.topProducts || []).map(
                        (item, index) => ({
                            ...item,
                            id: item.productId || item._id || index,
                            category: item.category || "—",
                        })
                    ),
                    categorySales: data.categorySales || [],
                    paymentData: (data.paymentData || []).map((item) => ({
                        ...item,
                        method: getPaymentLabel(item),
                    })),
                    orderStatusData: (data.orderStatusData || []).map(
                        (item) => ({
                            ...item,
                            status: String(item.status || "")
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (char) =>
                                    char.toUpperCase()
                                ),
                        })
                    ),
                    deliveryMetrics: data.deliveryMetrics || [],
                });
            } catch (error) {
                if (error.name !== "AbortError") {
                    setReport(EMPTY_REPORT);
                    setApiError(error.message || "Failed to load reports.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadReports();

        return () => controller.abort();
    }, [startDate, endDate]);

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
        if (loading) {
            window.alert("Please wait until the report finishes loading.");
            return;
        }

        if (apiError) {
            window.alert("The report could not be loaded. Please fix the error before exporting.");
            return;
        }

        const error = validateDateRange(startDate, endDate);

        if (error) {
            setDateError(error);
            window.alert(error);
            return;
        }

        if (
            !window.confirm(
                `Export the report for ${formatDateForDisplay(
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
                "Report generated from the backend reports API.",
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

    // Dynamic Sales Chart Scale
const maxMonthlyRevenue = Math.max(
    0,
    ...monthlySales.map((item) => Number(item.revenue) || 0)
);

const getNiceChartMax = (value) => {
    if (value <= 0) return 100;

    const roughStep = (value * 1.1) / 5;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;

    let niceStep;

    if (normalized <= 1) niceStep = 1;
    else if (normalized <= 2) niceStep = 2;
    else if (normalized <= 5) niceStep = 5;
    else niceStep = 10;

    return niceStep * magnitude * 5;
};

const chartMax = getNiceChartMax(maxMonthlyRevenue);

const chartYAxisLabels = Array.from(
    { length: 6 },
    (_, index) => {
        const value = chartMax - (chartMax / 5) * index;

        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        }

        if (value >= 1000) {
            return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
        }

        return `₹${Math.round(value)}`;
    }
);

    return (
        <div className="admin-reports-page">
            <style>{`
                .reports-empty-state {
                    padding: 22px 12px;
                    margin: 0;
                    color: #8290a5;
                    text-align: center;
                    font-size: 13px;
                }
                .reports-export-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>
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
                        disabled={loading || Boolean(apiError)}
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
                        {formatDateForDisplay(endDate)}.{" "}
                        {loading
                            ? "Loading live report data..."
                            : apiError
                              ? "Unable to load live report data."
                              : "Report data loaded from the backend."}
                    </p>
                </div>

                {apiError && (
                    <div className="reports-date-error" role="alert">
                        {apiError}
                    </div>
                )}

                {loading && (
                    <p role="status" aria-live="polite">
                        Loading reports from the database...
                    </p>
                )}

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
                                {chartYAxisLabels.map((label, index) => (
                                    <span key={index}>{label}</span>
                                ))}
                            </div>

                            <div className="reports-chart-area">
                                <div className="reports-chart-grid-lines">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <span key={index} />
                                    ))}
                                </div>

                                <div className="reports-bars">
                                    {monthlySales.length === 0 ? (
                                        <p className="reports-empty-state">
                                            No sales data found for this date range.
                                        </p>
                                    ) : monthlySales.map((item) => {
                                        const revenue = Number(item.revenue) || 0;
                                        const height =
                                            revenue > 0
                                                ? Math.max(3, (revenue / chartMax) * 100)
                                                : 0;

                                        return (
                                            <div
                                                className="reports-bar-column"
                                                key={item.month}
                                                title={`${item.month}: ${formatCurrency(
                                                    revenue
                                                )}, ${formatNumber(item.orders)} orders`}
                                            >
                                                <div className="reports-bar-value">
                                                    {formatCurrency(revenue)}
                                                </div>

                                                <div className="reports-bar-wrapper">
                                                    <div
                                                        className="reports-bar"
                                                        style={{ height: `${height}%` }}
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
                                <p>Order distribution for the selected period.</p>
                            </div>
                        </div>

                        <div className="order-status-list">
                            {orderStatusData.length === 0 ? (
                                <p className="reports-empty-state">
                                    No orders found for this date range.
                                </p>
                            ) : orderStatusData.map((item) => (
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
                            {topProducts.length === 0 ? (
                                <p className="reports-empty-state">
                                    No product sales found for this date range.
                                </p>
                            ) : topProducts.map((product, index) => (
    <div
        key={`${product.id || product.productId}-${product.name}-${index}`}
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
                            {categorySales.length === 0 ? (
                                <p className="reports-empty-state">
                                    No category sales found for this date range.
                                </p>
                            ) : categorySales.map((category) => (
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
                            {paymentData.length === 0 ? (
                                <p className="reports-empty-state">
                                    No payment records found for this date range.
                                </p>
                            ) : paymentData.map((payment) => (
                                <div
                                    className="reports-payment-item"
                                    key={`${payment.method}-${payment.paymentType || "unknown"}`}
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
                                <strong>—</strong>
                                <span>On-time delivery rate unavailable</span>
                            </div>

                            <div className="delivery-metrics">
                                {deliveryMetrics.map((metric) => (
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
                            Reports are generated from order records for the
                            selected date range. Revenue and payment totals
                            depend on the payment and order statuses recorded
                            in the database.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminReports;

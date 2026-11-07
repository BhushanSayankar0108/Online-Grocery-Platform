import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  AlertCircle,
  ShoppingBag,
  Clock3,
  ArrowLeft,
} from "lucide-react";

const ORDER_TRACKING_STYLES = `/* Order tracking page */
.tracking-page {
  min-height: 75vh;
  padding: 28px 20px 64px;
  background: #f6f8f5;
  color: #1d3027;
}
.tracking-shell { width: min(1120px, 100%); margin: 0 auto; }
.tracking-breadcrumb { display:flex; align-items:center; gap:10px; color:#849087; font-size:13px; margin: 0 0 22px; }
.tracking-breadcrumb a { display:inline-flex; align-items:center; gap:6px; color:#52685a; text-decoration:none; }
.tracking-breadcrumb a:hover { color:#168044; }
.tracking-hero {
  min-height: 255px; border-radius:24px; overflow:hidden; position:relative;
  display:flex; align-items:center; justify-content:space-between; gap:24px;
  padding:38px 48px; margin-bottom:24px;
  background:linear-gradient(115deg,#123f2c 0%,#17613b 58%,#25834d 100%);
  color:#fff; box-shadow:0 14px 35px rgba(22,75,47,.13);
}
.tracking-hero-copy { position:relative; z-index:1; max-width:650px; }
.tracking-pill { display:inline-flex; align-items:center; gap:7px; padding:7px 11px; border:1px solid rgba(255,255,255,.24); border-radius:30px; background:rgba(255,255,255,.09); font-size:10px; font-weight:800; letter-spacing:1.2px; }
.tracking-hero h1 { margin:16px 0 8px; font-size:clamp(32px,4vw,46px); line-height:1.12; letter-spacing:-1.5px; font-weight:800; color:#fff; }
.tracking-hero h1 span { color:#b8f28a; }
.tracking-hero-copy > p { margin:0; max-width:490px; color:#d8e8dc; font-size:15px; line-height:1.7; }
.tracking-order-ref { margin-top:23px; display:flex; flex-direction:column; gap:5px; }
.tracking-order-ref span { color:#b8d5c0; font-size:10px; font-weight:800; letter-spacing:1.4px; }
.tracking-order-ref strong { font-size:14px; color:white; overflow-wrap:anywhere; }
.tracking-hero-art { width:220px; height:190px; position:relative; flex-shrink:0; display:grid; place-items:center; }
.tracking-art-circle { width:142px; height:142px; display:grid; place-items:center; border-radius:50%; color:#e6ffd4; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); box-shadow:0 0 0 18px rgba(255,255,255,.035),0 0 0 38px rgba(255,255,255,.025); }
.tracking-art-leaf { position:absolute; width:35px; height:18px; border-radius:100% 0 100% 0; background:#b8f28a; transform:rotate(-25deg); }
.leaf-one { top:25px; right:36px; }.leaf-two { bottom:28px; left:22px; transform:rotate(155deg); }
.tracking-art-dot { position:absolute; width:9px; height:9px; border-radius:50%; background:#f2d783; }.dot-one { top:36px; left:30px; }.dot-two { right:18px; bottom:48px; width:6px; height:6px; }
.tracking-card { min-width:0; padding:26px; border:1px solid #e7ece7; border-radius:19px; background:#fff; box-shadow:0 5px 20px rgba(31,57,40,.045); }
.tracking-progress-card { margin-bottom:22px; padding:30px; }
.tracking-section-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:24px; }
.tracking-eyebrow { margin:0 0 6px; color:#718378; font-size:10px; font-weight:800; letter-spacing:1.35px; }
.tracking-section-heading h2,.tracking-card-heading h2 { margin:0; color:#1d3027; font-size:22px; line-height:1.25; font-weight:750; letter-spacing:-.4px; }
.tracking-refresh-status { display:flex; align-items:center; gap:8px; padding:8px 11px; border-radius:30px; background:#eff9ef; color:#267340; font-size:12px; font-weight:700; white-space:nowrap; }
.tracking-live-dot { width:7px; height:7px; border-radius:50%; background:#37a65b; box-shadow:0 0 0 4px #d9f1df; }
.tracking-timeline { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); position:relative; }
.tracking-timeline:before { content:""; position:absolute; top:24px; left:8%; right:8%; height:3px; background:#e9eee9; border-radius:4px; }
.tracking-step { position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; text-align:center; padding:0 8px; }
.tracking-step-marker { width:49px; height:49px; display:grid; place-items:center; border:4px solid #fff; border-radius:50%; color:#a5b1a8; background:#edf1ed; box-shadow:0 0 0 1px #e4eae4; }
.tracking-step.is-complete .tracking-step-marker { color:#fff; background:#27824a; box-shadow:0 0 0 1px #27824a; }
.tracking-step.is-current .tracking-step-marker { box-shadow:0 0 0 5px #dff3e4,0 0 0 6px #a5d7b2; }
.tracking-step-copy { margin-top:13px; }
.tracking-step-title { display:flex; flex-direction:column; align-items:center; gap:6px; }
.tracking-step h3 { margin:0; font-size:12px; font-weight:750; color:#8a978e; }
.tracking-step.is-complete h3 { color:#286d40; }
.tracking-step p { margin:6px auto 0; max-width:135px; color:#8b968e; font-size:11px; line-height:1.45; }
.tracking-current-tag { padding:3px 6px; border-radius:5px; background:#e9f8e9; color:#24743e; font-size:8px; font-weight:900; letter-spacing:.7px; }
.tracking-step-check { display:none; }
.tracking-progress-footer { display:flex; align-items:center; gap:8px; margin-top:25px; padding-top:17px; border-top:1px solid #edf0ed; color:#7e8c82; font-size:12px; }
.tracking-updated { margin-left:auto; }
.tracking-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:22px; margin-bottom:22px; }
.tracking-card-heading { display:flex; align-items:center; gap:13px; margin-bottom:22px; }
.tracking-heading-icon { width:43px; height:43px; display:grid; place-items:center; border-radius:13px; color:#267c43; background:#eaf6e9; }
.tracking-card-heading h2 { font-size:19px; }
.tracking-detail-list { display:flex; flex-direction:column; gap:0; }
.tracking-detail-list > div { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:12px 0; border-bottom:1px solid #f0f2ef; font-size:13px; }
.tracking-detail-list span { color:#77847b; }
.tracking-detail-list strong { text-align:right; color:#2c3e32; font-weight:650; }
.tracking-payment-status { text-transform:capitalize; color:#9a6b12!important; }
.tracking-payment-status.status-paid { color:#247b43!important; }
.tracking-payment-status.status-failed { color:#bd3737!important; }
.tracking-total-row { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:18px; padding:17px; border-radius:12px; background:#f0f8ef; font-size:13px; }
.tracking-total-row span { color:#4c6853; font-weight:650; }
.tracking-total-row strong { color:#20783f; font-size:21px; }
.tracking-address { display:flex; align-items:flex-start; gap:13px; padding:17px; border:1px solid #eaf0e9; border-radius:13px; background:#fbfdfb; }
.tracking-address-pin { flex-shrink:0; width:38px; height:38px; display:grid; place-items:center; border-radius:11px; color:#277e43; background:#eaf6e9; }
.tracking-address h3 { margin:2px 0 6px; font-size:14px; font-weight:750; }
.tracking-address p { margin:4px 0 0; color:#718076; font-size:13px; line-height:1.65; overflow-wrap:anywhere; }
.tracking-address-note { display:flex; align-items:center; gap:7px; margin-top:14px; color:#49835a; font-size:11px; }
.tracking-items-card { margin-bottom:22px; }
.tracking-items-card .tracking-section-heading { margin-bottom:12px; }
.tracking-count { display:inline-grid; place-items:center; min-width:25px; height:25px; margin-left:5px; padding:0 6px; border-radius:20px; background:#edf7ec; color:#267c43; font-size:12px; vertical-align:middle; }
.tracking-items-list { display:flex; flex-direction:column; }
.tracking-item { display:flex; align-items:center; gap:14px; padding:15px 0; border-bottom:1px solid #eff2ef; }
.tracking-item:last-child { border-bottom:0; }
.tracking-item-icon { width:45px; height:45px; display:grid; place-items:center; border-radius:12px; background:#f1f8ed; color:#36834b; flex-shrink:0; }
.tracking-item-name { display:flex; flex:1; flex-direction:column; gap:5px; min-width:0; }
.tracking-item-name strong { color:#2b3c30; font-size:14px; font-weight:700; }
.tracking-item-name span { color:#839087; font-size:12px; }
.tracking-item-price { white-space:nowrap; color:#2b3d31; font-size:14px; }
.tracking-bottom-cta { display:flex; justify-content:space-between; align-items:center; gap:20px; padding:23px 26px; border:1px solid #e3eddf; border-radius:18px; background:linear-gradient(100deg,#eef8e9,#f8fbf5); }
.tracking-bottom-cta h2 { margin:0 0 5px; color:#1d3827; font-size:18px; font-weight:750; }
.tracking-bottom-cta p { margin:0; color:#718174; font-size:13px; }
.tracking-primary-button { display:inline-flex; align-items:center; justify-content:center; gap:9px; padding:12px 17px; border:0; border-radius:10px; background:#218044; color:#fff; font-size:13px; font-weight:750; text-decoration:none; box-shadow:0 5px 12px rgba(33,128,68,.16); transition:background .2s,transform .2s; }
.tracking-primary-button:hover { background:#176a36; color:#fff; transform:translateY(-1px); }
.tracking-error-card { width:min(520px,100%); margin:65px auto; padding:42px 30px; text-align:center; border:1px solid #e7ece7; border-radius:22px; background:#fff; box-shadow:0 12px 32px rgba(31,57,40,.07); }
.tracking-error-icon { width:60px; height:60px; display:grid; place-items:center; margin:0 auto 18px; border-radius:18px; color:#b84242; background:#fff0ef; }
.tracking-error-card h1 { margin:5px 0 10px; font-size:25px; color:#21372a; }
.tracking-muted { color:#77847b; font-size:14px; line-height:1.6; }
.tracking-loading { display:flex; min-height:45vh; align-items:center; justify-content:center; gap:12px; color:#52685a; font-weight:600; }
.tracking-spinner { width:22px; height:22px; border:3px solid #dbe9dc; border-top-color:#27824a; border-radius:50%; animation:tracking-spin .8s linear infinite; }
@keyframes tracking-spin { to { transform:rotate(360deg); } }
.tracking-cancelled { display:flex; align-items:flex-start; gap:14px; padding:22px; margin-bottom:22px; border:1px solid #f3cccc; border-radius:16px; background:#fff4f3; color:#b33232; }
.tracking-cancelled h2 { margin:0 0 5px; font-size:18px; }.tracking-cancelled p { margin:0; color:#8e4a4a; font-size:13px; line-height:1.6; }
@media (max-width: 800px) {
  .tracking-hero { padding:30px; }
  .tracking-hero-art { width:150px; transform:scale(.85); margin-right:-15px; }
  .tracking-timeline { grid-template-columns:repeat(3,minmax(0,1fr)); row-gap:27px; }
  .tracking-timeline:before { display:none; }
  .tracking-info-grid { grid-template-columns:1fr; }
}
@media (max-width: 560px) {
  .tracking-page { padding:18px 13px 40px; }
  .tracking-hero { padding:25px 22px; border-radius:18px; }
  .tracking-hero-art { display:none; }
  .tracking-hero h1 { font-size:34px; }
  .tracking-card,.tracking-progress-card { padding:20px 17px; border-radius:15px; }
  .tracking-section-heading { align-items:flex-start; }
  .tracking-section-heading h2 { font-size:20px; }
  .tracking-refresh-status { font-size:10px; padding:7px 8px; }
  .tracking-timeline { grid-template-columns:1fr; gap:0; }
  .tracking-timeline:before { display:block; top:20px; bottom:25px; left:22px; right:auto; width:2px; height:auto; }
  .tracking-step { flex-direction:row; align-items:flex-start; text-align:left; gap:13px; padding:0 0 18px; }
  .tracking-step-marker { width:44px; height:44px; flex-shrink:0; }
  .tracking-step-copy { margin:5px 0 0; flex:1; }
  .tracking-step-title { align-items:flex-start; }
  .tracking-step h3 { font-size:13px; }
  .tracking-step p { margin:5px 0 0; max-width:none; font-size:12px; }
  .tracking-step-check { display:block; margin:7px 0 0; color:#27824a; }
  .tracking-progress-footer { flex-wrap:wrap; line-height:1.5; }
  .tracking-updated { width:100%; margin-left:24px; }
  .tracking-bottom-cta { align-items:flex-start; flex-direction:column; padding:21px; }
  .tracking-primary-button { width:100%; }
  .tracking-detail-list > div { font-size:12px; }
  .tracking-total-row strong { font-size:18px; }
}
`;

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com").replace(/\/+$/, "");

const trackingSteps = [
  { label: "Order Placed", description: "We've received your order.", icon: ShoppingBag },
  { label: "Order Confirmed", description: "Your order has been confirmed.", icon: CheckCircle },
  { label: "Picking", description: "We're collecting your grocery items.", icon: Package },
  { label: "Packed", description: "Your groceries are packed and ready.", icon: Package },
  { label: "Out for Delivery", description: "Your order is on its way.", icon: Truck },
  { label: "Delivered", description: "Your groceries have arrived.", icon: CheckCircle },
];

const statusStep = {
  placed: 0,
  confirmed: 1,
  processing: 2,
  packed: 3,
  shipped: 4,
  delivered: 5,
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Not available";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";
  return parsedDate.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function getCustomerToken() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem("customerSession");
      if (raw) {
        const session = JSON.parse(raw);
        const token =
          session?.token ||
          session?.accessToken ||
          session?.customerToken ||
          session?.jwt;
        if (token) return token;
      }
      const token =
        storage.getItem("customerToken") ||
        storage.getItem("accessToken") ||
        storage.getItem("token");
      if (token) return token;
    } catch (error) {
      console.error("Unable to read customer session:", error);
    }
  }
  return "";
}

function ErrorMessage({ message }) {
  return (
    <main className="tracking-page">
      <style>{ORDER_TRACKING_STYLES}</style>
      <div className="tracking-error-card">
        <div className="tracking-error-icon"><AlertCircle size={30} /></div>
        <p className="tracking-eyebrow">ORDER TRACKING</p>
        <h1>We couldn’t load your order</h1>
        <p className="tracking-muted">{message}</p>
        <Link to="/shop" className="tracking-primary-button">
          <ShoppingBag size={17} /> Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function OrderTracking() {
  const { orderId } = useParams();
  if (!orderId) return <ErrorMessage message="Order ID is missing." />;
  return <OrderTrackingDetails orderId={orderId} />;
}

function OrderTrackingDetails({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isActive = true;
    let firstLoad = true;
    let controller;

    const fetchOrder = async () => {
      controller?.abort();
      controller = new AbortController();
      if (isActive && !firstLoad) setRefreshing(true);

      try {
        const token = getCustomerToken();
        if (!token) throw new Error("Please log in to track your order.");

       const response = await fetch(
  `${API_BASE_URL}/api/orders/customer/${encodeURIComponent(orderId)}`,
  {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal: controller.signal,
  }
);
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.success || !data?.order) {
          throw new Error(data?.message || "Unable to load order details.");
        }

        if (isActive) {
          setOrder(data.order);
          setError("");
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!isActive || err.name === "AbortError") return;
        if (firstLoad) {
          setOrder(null);
          setError(err.message || "Something went wrong.");
        } else {
          console.error("Order status refresh failed:", err.message);
        }
      } finally {
        if (isActive) {
          if (firstLoad) {
            setLoading(false);
            firstLoad = false;
          }
          setRefreshing(false);
        }
      }
    };

    fetchOrder();
    const refreshId = window.setInterval(fetchOrder, 15000);
    return () => {
      isActive = false;
      controller?.abort();
      window.clearInterval(refreshId);
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="tracking-page">
      <style>{ORDER_TRACKING_STYLES}</style>
        <div className="tracking-loading"><span className="tracking-spinner" />Loading your order details…</div>
      </main>
    );
  }
  if (error || !order) return <ErrorMessage message={error || "Order not found."} />;

  const currentStatus = String(order.status || "placed").toLowerCase();
  const currentStep = statusStep[currentStatus] ?? -1;
  const isCancelled = currentStatus === "cancelled";
  const address = order.deliveryAddress || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQuantity = items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const paymentMethod =
    currentPaymentMethod(order.paymentMethod);
  const orderNumber = order.orderNumber || order._id;
  const addressText = [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.city,
    address.state,
    address.postalCode || address.pinCode,
  ].filter(Boolean).join(", ");

  return (
    <main className="tracking-page">
      <style>{ORDER_TRACKING_STYLES}</style>
      <div className="tracking-shell">
        <div className="tracking-breadcrumb">
          <Link to="/"><ArrowLeft size={16} /> Back to Home</Link>
          <span>/</span><span>Order Tracking</span>
        </div>

        <section className="tracking-hero">
          <div className="tracking-hero-copy">
            <span className="tracking-pill"><Truck size={14} /> LIVE ORDER UPDATES</span>
            <h1>Track your <span>order.</span></h1>
            <p>Stay up to date with your groceries from checkout to your doorstep.</p>
            <div className="tracking-order-ref">
              <span>ORDER NUMBER</span>
              <strong>{orderNumber}</strong>
            </div>
          </div>
          <div className="tracking-hero-art" aria-hidden="true">
            <div className="tracking-art-circle"><ShoppingBag size={64} strokeWidth={1.4} /></div>
            <span className="tracking-art-leaf leaf-one" />
            <span className="tracking-art-leaf leaf-two" />
            <span className="tracking-art-dot dot-one" />
            <span className="tracking-art-dot dot-two" />
          </div>
        </section>

        {isCancelled ? (
          <section className="tracking-cancelled">
            <AlertCircle size={26} />
            <div>
              <h2>Order cancelled</h2>
              <p>{order.cancellationReason || "This order has been cancelled."}</p>
            </div>
          </section>
        ) : (
          <section className="tracking-card tracking-progress-card">
            <div className="tracking-section-heading">
              <div>
                <p className="tracking-eyebrow">YOUR DELIVERY JOURNEY</p>
                <h2>Order progress</h2>
              </div>
              <div className="tracking-refresh-status">
                <span className="tracking-live-dot" />
                {refreshing ? "Updating…" : "Live tracking"}
              </div>
            </div>

            <div className="tracking-timeline">
              {trackingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const completed = currentStep >= index;
                const isCurrent = currentStep === index;
                return (
                  <div
                    key={step.label}
                    className={`tracking-step ${completed ? "is-complete" : ""} ${isCurrent ? "is-current" : ""}`}
                  >
                    <div className="tracking-step-marker"><StepIcon size={20} /></div>
                    <div className="tracking-step-copy">
                      <div className="tracking-step-title">
                        <h3>{step.label}</h3>
                        {isCurrent && <span className="tracking-current-tag">CURRENT</span>}
                      </div>
                      <p>{step.description}</p>
                    </div>
                    <div className="tracking-step-check">{completed && <CheckCircle size={18} />}</div>
                  </div>
                );
              })}
              {currentStep === -1 && <p className="tracking-muted">Current status: {currentStatus}</p>}
            </div>
            <div className="tracking-progress-footer">
              <Clock3 size={16} />
              <span>Status refreshes automatically every 15 seconds.</span>
              {lastUpdated && <span className="tracking-updated">Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>}
            </div>
          </section>
        )}

        <div className="tracking-info-grid">
          <section className="tracking-card">
            <div className="tracking-card-heading">
              <div className="tracking-heading-icon"><Package size={20} /></div>
              <div><p className="tracking-eyebrow">ORDER DETAILS</p><h2>Order summary</h2></div>
            </div>
            <div className="tracking-detail-list">
              <div><span>Order date</span><strong>{formatDate(order.createdAt)}</strong></div>
              <div><span>Total items</span><strong>{totalQuantity} {totalQuantity === 1 ? "item" : "items"}</strong></div>
              <div><span>Payment method</span><strong>{paymentMethod}</strong></div>
              <div><span>Payment status</span><strong className={`tracking-payment-status status-${String(order.paymentStatus || "pending").toLowerCase()}`}>{order.paymentStatus || "pending"}</strong></div>
            </div>
            <div className="tracking-total-row"><span>Total paid / due</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
          </section>

          <section className="tracking-card">
            <div className="tracking-card-heading">
              <div className="tracking-heading-icon"><MapPin size={20} /></div>
              <div><p className="tracking-eyebrow">DELIVERY DESTINATION</p><h2>Delivering to</h2></div>
            </div>
            <div className="tracking-address">
              <div className="tracking-address-pin"><MapPin size={19} /></div>
              <div>
                <h3>{address.fullName || order.customerName || "Customer"}</h3>
                {address.mobile && <p>{address.mobile}</p>}
                <p>{addressText || "Delivery address not available"}</p>
              </div>
            </div>
            <div className="tracking-address-note"> <CheckCircle size={15} /> Delivery address saved with this order</div>
          </section>
        </div>

        <section className="tracking-card tracking-items-card">
          <div className="tracking-section-heading">
            <div><p className="tracking-eyebrow">FRESH PICKS</p><h2>Items in your order <span className="tracking-count">{items.length}</span></h2></div>
          </div>
          {items.length === 0 ? <p className="tracking-muted">No item details available.</p> : (
            <div className="tracking-items-list">
              {items.map((item, index) => {
                const quantity = Number(item.quantity) || 0;
                const unitPrice = Number(item.unitPrice ?? item.price ?? item.sellingPrice ?? item.priceAtPurchase ?? 0);
                const lineTotal = Number(item.lineTotal ?? item.totalPrice ?? unitPrice * quantity);
                const product = item.product || item.productId || {};
                return (
                  <div className="tracking-item" key={item._id || product._id || index}>
                    <div className="tracking-item-icon"><ShoppingBag size={21} /></div>
                    <div className="tracking-item-name">
                      <strong>{item.productName || item.name || product.name || "Grocery item"}</strong>
                      <span>Qty: {quantity}{item.unit ? ` · ${item.unit}` : ""}</span>
                    </div>
                    <strong className="tracking-item-price">{formatCurrency(lineTotal)}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="tracking-bottom-cta">
          <div><h2>Need more groceries?</h2><p>Explore fresh picks and everyday essentials.</p></div>
          <Link to="/shop" className="tracking-primary-button"><ShoppingBag size={17} /> Continue Shopping</Link>
        </div>
      </div>
    </main>
  );
}

function currentPaymentMethod(method) {
  const value = String(method || "").toLowerCase();
  if (value === "cod" || value === "cash_on_delivery") return "Cash on Delivery";
  if (value === "online") return "Online payment";
  return method || "Not specified";
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock3,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  ShieldCheck,
  ArrowRight,
  Check,
  LockKeyhole,
  ShoppingBag,
  Tag,
  X,
  Plus,
  Home,
  Briefcase,
  MapPinned,
} from "lucide-react";

function getCustomerEmail() {
  try {
    const customer = JSON.parse(
      localStorage.getItem("customerSession") || "null"
    );
    return customer?.email?.trim().toLowerCase() || "";
  } catch {
    return "";
  }
}

function loadSavedAddresses() {
  const email = getCustomerEmail();
  if (!email) return [];

  try {
    const addresses = JSON.parse(
      localStorage.getItem(`savedAddresses_${email}`) || "[]"
    );
    return Array.isArray(addresses) ? addresses : [];
  } catch {
    return [];
  }
}

function Checkout({ cart = [], setCart }) {
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState(loadSavedAddresses);

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const addresses = loadSavedAddresses();
    return (
      addresses.find((address) => address.isDefault)?.id ??
      addresses[0]?.id ??
      ""
    );
  });

  const [showNewAddressForm, setShowNewAddressForm] = useState(
    loadSavedAddresses().length === 0
  );

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState(false);

  const [address, setAddress] = useState({
    type: "Home",
    fullName: "",
    mobile: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bank: "",
  });

  const deliverySlots = [
    "9:00 AM - 12:00 PM",
    "12:00 PM - 3:00 PM",
    "3:00 PM - 6:00 PM",
    "6:00 PM - 9:00 PM",
  ];

  const paymentMethods = [
    {
      name: "UPI",
      icon: <Smartphone size={20} />,
      description: "Pay instantly using UPI",
    },
    {
      name: "Credit / Debit Card",
      icon: <CreditCard size={20} />,
      description: "Visa, Mastercard and more",
    },
    {
      name: "Net Banking",
      icon: <Landmark size={20} />,
      description: "Pay through your bank",
    },
    {
      name: "Cash on Delivery",
      icon: <Banknote size={20} />,
      description: "Pay when your order arrives",
    },
  ];

  const selectedSavedAddress =
    savedAddresses.find(
      (item) => String(item.id) === String(selectedAddressId)
    ) || null;

  const cartSubtotal = cart.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const deliveryCharge = cartSubtotal >= 500 ? 0 : 40;

  const discount = appliedPromo
    ? Math.min(appliedPromo.discount, cartSubtotal)
    : 0;

  const cartTotal = Math.max(
    0,
    cartSubtotal - discount + deliveryCharge
  );

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();

    if (!code) {
      setPromoError(true);
      setPromoMessage("Please enter a promo code.");
      return;
    }

    if (code === "FRESH10") {
      if (cartSubtotal <= 0) {
        setPromoError(true);
        setPromoMessage("Add products before applying this code.");
        return;
      }

      const amount = Math.round(cartSubtotal * 0.1);

      setAppliedPromo({ code, discount: amount });
      setPromoError(false);
      setPromoMessage("Promo code applied successfully!");
      return;
    }

    if (code === "SAVE50") {
      if (cartSubtotal < 299) {
        setAppliedPromo(null);
        setPromoError(true);
        setPromoMessage("SAVE50 requires a subtotal of ₹299 or more.");
        return;
      }

      setAppliedPromo({ code, discount: 50 });
      setPromoError(false);
      setPromoMessage("Promo code applied successfully!");
      return;
    }

    setAppliedPromo(null);
    setPromoError(true);
    setPromoMessage("Invalid promo code. Please try again.");
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoMessage("Promo code removed.");
    setPromoError(false);
  };

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddress((currentAddress) => ({
      ...currentAddress,
      [name]: value,
    }));
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;

    setPaymentDetails((currentDetails) => ({
      ...currentDetails,
      [name]: value,
    }));
  };

  const handlePaymentSelection = (method) => {
    setSelectedPayment(method);

    setPaymentDetails({
      upiId: "",
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      bank: "",
    });
  };

  const handleAddressSelection = (event) => {
    setSelectedAddressId(event.target.value);
    setShowNewAddressForm(false);
  };

  const handleSaveNewAddress = () => {
    const email = getCustomerEmail();

    if (!email) {
      alert("Please log in before saving an address.");
      navigate("/login");
      return;
    }

    const requiredFields = [
      address.fullName,
      address.mobile,
      address.house,
      address.street,
      address.city,
      address.state,
      address.pinCode,
    ];

    if (requiredFields.some((field) => !field.trim())) {
      alert("Please complete all delivery address fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(address.mobile.trim())) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(address.pinCode.trim())) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    const newAddress = {
      id: Date.now(),
      type: address.type,
      name: address.fullName.trim(),
      mobile: address.mobile.trim(),
      address: `${address.house.trim()}, ${address.street.trim()}`,
      city: address.city.trim(),
      state: address.state.trim(),
      pinCode: address.pinCode.trim(),
      isDefault: savedAddresses.length === 0,
    };

    const nextAddresses = [...savedAddresses, newAddress];

    try {
      localStorage.setItem(
        `savedAddresses_${email}`,
        JSON.stringify(nextAddresses)
      );

      setSavedAddresses(nextAddresses);
      setSelectedAddressId(newAddress.id);
      setShowNewAddressForm(false);

      setAddress({
        type: "Home",
        fullName: "",
        mobile: "",
        house: "",
        street: "",
        city: "",
        state: "",
        pinCode: "",
      });

      alert("Address saved successfully.");
    } catch {
      alert("Unable to save this address. Please try again.");
    }
  };

  const validatePaymentDetails = () => {
    if (selectedPayment === "UPI" && !paymentDetails.upiId.trim()) {
      alert("Please enter your UPI ID.");
      return false;
    }

    if (
      selectedPayment === "Credit / Debit Card" &&
      (!paymentDetails.cardName.trim() ||
        !paymentDetails.cardNumber.trim() ||
        !paymentDetails.expiry.trim() ||
        !paymentDetails.cvv.trim())
    ) {
      alert("Please enter all card details.");
      return false;
    }

    if (selectedPayment === "Net Banking" && !paymentDetails.bank) {
      alert("Please select your bank.");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    let orderAddress;

    if (!showNewAddressForm && selectedSavedAddress) {
      orderAddress = selectedSavedAddress;
    } else {
      const requiredFields = [
        address.fullName,
        address.mobile,
        address.house,
        address.street,
        address.city,
        address.state,
        address.pinCode,
      ];

      if (requiredFields.some((field) => !field.trim())) {
        alert("Please select a saved address or complete a new address.");
        return;
      }

      if (!/^[6-9]\d{9}$/.test(address.mobile.trim())) {
        alert("Please enter a valid 10-digit Indian mobile number.");
        return;
      }

      if (!/^\d{6}$/.test(address.pinCode.trim())) {
        alert("Please enter a valid 6-digit PIN code.");
        return;
      }

      orderAddress = {
        type: address.type,
        name: address.fullName.trim(),
        mobile: address.mobile.trim(),
        address: `${address.house.trim()}, ${address.street.trim()}`,
        city: address.city.trim(),
        state: address.state.trim(),
        pinCode: address.pinCode.trim(),
      };
    }

    if (!selectedSlot) {
      alert("Please select a delivery slot.");
      return;
    }

    if (!selectedPayment) {
      alert("Please select a payment method.");
      return;
    }

    if (!validatePaymentDetails()) {
      return;
    }

    // Save demo order details so the confirmation page can use them.
    try {
      const order = {
        id: `ORD-${new Date().getTime()}`,
        items: cart,
        address: orderAddress,
        deliverySlot: selectedSlot,
        deliveryInstructions,
        paymentMethod: selectedPayment,
        subtotal: cartSubtotal,
        discount,
        deliveryCharge,
        total: cartTotal,
        promoCode: appliedPromo?.code || null,
        createdAt: new Date().toISOString(),
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("demoOrders") || "[]"
      );

      localStorage.setItem(
        "demoOrders",
        JSON.stringify([order, ...existingOrders])
      );
    } catch {
      alert("Unable to save your order. Please try again.");
      return;
    }

    setCart([]);
    navigate("/order-confirmation");
  };

  const getAddressIcon = (type) => {
    if (type === "Work") return <Briefcase size={17} />;
    if (type === "Other") return <MapPinned size={17} />;
    return <Home size={17} />;
  };

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-container">
          <section className="checkout-empty">
            <div className="checkout-empty-icon">
              <ShoppingBag size={34} strokeWidth={1.6} />
            </div>

            <span>YOUR CART IS EMPTY</span>
            <h1>Nothing to checkout yet.</h1>

            <p>
              Add some groceries to your cart before continuing to checkout.
            </p>

            <Link to="/shop" className="checkout-empty-button">
              Browse Products
              <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-header">
          <Link to="/cart" className="shop-home-link">
            ← Back to Cart
          </Link>

          <p className="checkout-breadcrumb">Home / Cart / Checkout</p>

          <span className="checkout-eyebrow">SECURE CHECKOUT</span>
          <h1>Complete your order.</h1>

          <p className="checkout-intro">
            Choose your delivery address, delivery slot and payment method.
          </p>
        </header>

        <div className="checkout-layout">
          <div className="checkout-main">
            <section className="checkout-card">
              <div className="checkout-card-heading">
                <div className="checkout-step">01</div>
                <div>
                  <span>WHERE SHOULD WE DELIVER?</span>
                  <h2>Delivery Address</h2>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <div className="checkout-saved-addresses">
                  <label>
                    <span>Select a saved address</span>
                    <select
                      value={selectedSavedAddress ? selectedAddressId : ""}
                      onChange={handleAddressSelection}
                    >
                      {savedAddresses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.type} — {item.name}, {item.city} ({item.pinCode})
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedSavedAddress && !showNewAddressForm && (
                    <div className="checkout-selected-address">
                      <div className="checkout-selected-address-heading">
                        {getAddressIcon(selectedSavedAddress.type)}
                        <strong>{selectedSavedAddress.type} Address</strong>
                        {selectedSavedAddress.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </div>

                      <strong>{selectedSavedAddress.name}</strong>
                      <p>{selectedSavedAddress.mobile}</p>
                      <p>{selectedSavedAddress.address}</p>
                      <p>
                        {selectedSavedAddress.city},{" "}
                        {selectedSavedAddress.state} -{" "}
                        {selectedSavedAddress.pinCode}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                className="add-address-button"
                onClick={() => setShowNewAddressForm((current) => !current)}
              >
                {showNewAddressForm ? <X size={17} /> : <Plus size={17} />}
                {showNewAddressForm
                  ? "Cancel New Address"
                  : savedAddresses.length > 0
                    ? "Use a Different Address"
                    : "Add Delivery Address"}
              </button>

              {showNewAddressForm && (
                <div className="checkout-new-address">
                  <h3>Add a new delivery address</h3>

                  <div className="address-type-options">
                    {["Home", "Work", "Other"].map((type) => (
                      <label
                        className={`address-type-option ${
                          address.type === type ? "active" : ""
                        }`}
                        key={type}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={address.type === type}
                          onChange={handleAddressChange}
                        />
                        {getAddressIcon(type)}
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>

                  <div className="checkout-form">
                    <label>
                      <span>Full Name</span>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={address.fullName}
                        onChange={handleAddressChange}
                      />
                    </label>

                    <label>
                      <span>Mobile Number</span>
                      <input
                        type="tel"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={address.mobile}
                        onChange={handleAddressChange}
                      />
                    </label>

                    <label className="checkout-field-wide">
                      <span>House / Flat / Building</span>
                      <input
                        type="text"
                        name="house"
                        placeholder="House, flat or building"
                        value={address.house}
                        onChange={handleAddressChange}
                      />
                    </label>

                    <label className="checkout-field-wide">
                      <span>Street / Area</span>
                      <input
                        type="text"
                        name="street"
                        placeholder="Street, area or locality"
                        value={address.street}
                        onChange={handleAddressChange}
                      />
                    </label>

                    <label>
                      <span>City</span>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={address.city}
                        onChange={handleAddressChange}
                      />
                    </label>

                    <label>
                      <span>State</span>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={address.state}
                        onChange={handleAddressChange}
                      />
                    </label>

                    <label>
                      <span>PIN Code</span>
                      <input
                        type="text"
                        name="pinCode"
                        inputMode="numeric"
                        placeholder="6-digit PIN"
                        maxLength={6}
                        value={address.pinCode}
                        onChange={handleAddressChange}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="save-address-button"
                    onClick={handleSaveNewAddress}
                  >
                    <Check size={17} />
                    Save Address
                  </button>
                </div>
              )}

              <label className="checkout-field-wide checkout-instructions">
                <span>Delivery Instructions</span>
                <textarea
                  rows={3}
                  placeholder="Any instructions for the delivery partner? (Optional)"
                  value={deliveryInstructions}
                  onChange={(event) =>
                    setDeliveryInstructions(event.target.value)
                  }
                />
              </label>

              <div className="checkout-location-note">
                <MapPin size={17} />
                <span>
                  Please make sure your address and PIN code are correct for
                  successful delivery.
                </span>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <div className="checkout-step">02</div>
                <div>
                  <span>CHOOSE WHEN TO RECEIVE IT</span>
                  <h2>Delivery Slot</h2>
                </div>
              </div>

              <div className="checkout-slot-heading">
                <Clock3 size={18} />
                <span>Select a convenient delivery window</span>
              </div>

              <div className="delivery-slots">
                {deliverySlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`delivery-slot ${
                      selectedSlot === slot ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {selectedSlot === slot && <Check size={16} />}
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-heading">
                <div className="checkout-step">03</div>
                <div>
                  <span>HOW WOULD YOU LIKE TO PAY?</span>
                  <h2>Payment Method</h2>
                </div>
              </div>

              <div className="payment-methods">
                {paymentMethods.map((method) => (
                  <button
                    key={method.name}
                    type="button"
                    className={`payment-method ${
                      selectedPayment === method.name ? "selected" : ""
                    }`}
                    onClick={() => handlePaymentSelection(method.name)}
                  >
                    <div className="payment-method-icon">{method.icon}</div>

                    <div className="payment-method-text">
                      <strong>{method.name}</strong>
                      <span>{method.description}</span>
                    </div>

                    <div className="payment-method-check">
                      {selectedPayment === method.name && (
                        <Check size={15} />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedPayment === "UPI" && (
                <div className="payment-details">
                  <h3>UPI Payment</h3>
                  <label>
                    <span>UPI ID</span>
                    <input
                      type="text"
                      name="upiId"
                      placeholder="yourname@upi"
                      value={paymentDetails.upiId}
                      onChange={handlePaymentChange}
                    />
                  </label>
                  <small>Demo payment form.</small>
                </div>
              )}

              {selectedPayment === "Credit / Debit Card" && (
                <div className="payment-details">
                  <h3>Card Details</h3>

                  <label>
                    <span>Cardholder Name</span>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="Name on card"
                      value={paymentDetails.cardName}
                      onChange={handlePaymentChange}
                    />
                  </label>

                  <label>
                    <span>Card Number</span>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                    />
                  </label>

                  <div className="payment-card-row">
                    <label>
                      <span>Expiry</span>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={paymentDetails.expiry}
                        onChange={handlePaymentChange}
                      />
                    </label>

                    <label>
                      <span>CVV</span>
                      <input
                        type="password"
                        name="cvv"
                        placeholder="CVV"
                        maxLength={4}
                        value={paymentDetails.cvv}
                        onChange={handlePaymentChange}
                      />
                    </label>
                  </div>

                  <small>
                    Demo payment form — do not enter real card details.
                  </small>
                </div>
              )}

              {selectedPayment === "Net Banking" && (
                <div className="payment-details">
                  <h3>Select Your Bank</h3>
                  <label>
                    <span>Bank</span>
                    <select
                      name="bank"
                      value={paymentDetails.bank}
                      onChange={handlePaymentChange}
                    >
                      <option value="">Select Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                    </select>
                  </label>
                </div>
              )}

              {selectedPayment === "Cash on Delivery" && (
                <div className="payment-details payment-cod">
                  <Banknote size={22} />
                  <div>
                    <h3>Cash on Delivery</h3>
                    <p>
                      Pay in cash when your order is delivered to your doorstep.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="checkout-summary">
            <div className="checkout-summary-header">
              <span>ORDER SUMMARY</span>
              <h2>Your Order</h2>
            </div>

            <div className="checkout-products">
              {cart.map((product, index) => (
                <div
                  className="checkout-product"
                  key={`${product.name}-${index}`}
                >
                  <div className="checkout-product-image">
                    <img src={product.image} alt={product.name} />
                    <span>{product.quantity}</span>
                  </div>

                  <div className="checkout-product-info">
                    <strong>{product.name}</strong>
                    <span>
                      ₹{product.price} × {product.quantity}
                    </span>
                  </div>

                  <strong>₹{product.price * product.quantity}</strong>
                </div>
              ))}
            </div>

            <section className="checkout-promo">
              <div className="checkout-promo-heading">
                <Tag size={19} />
                <div>
                  <strong>Have a promo code?</strong>
                  <span>Save more on your groceries</span>
                </div>
              </div>

              {appliedPromo ? (
                <div className="checkout-promo-applied">
                  <div className="checkout-promo-applied-info">
                    <Check size={17} />
                    <div>
                      <strong>{appliedPromo.code}</strong>
                      <small>₹{discount} discount applied</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removePromo}
                    aria-label="Remove promo code"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="checkout-promo-form">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    aria-label="Promo code"
                    value={promoInput}
                    onChange={(event) => {
                      setPromoInput(event.target.value);
                      setPromoMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyPromo();
                      }
                    }}
                  />

                  <button type="button" onClick={applyPromo}>
                    Apply
                  </button>
                </div>
              )}

              {promoMessage && (
                <p
                  className={`checkout-promo-message ${
                    promoError ? "error" : "success"
                  }`}
                  role="status"
                >
                  {promoMessage}
                </p>
              )}

              <div className="checkout-demo-codes">
                <span>Demo codes:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPromoInput("FRESH10");
                    setPromoMessage("");
                  }}
                >
                  FRESH10
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPromoInput("SAVE50");
                    setPromoMessage("");
                  }}
                >
                  SAVE50
                </button>
              </div>
            </section>

            <div className="checkout-summary-lines">
              <div>
                <span>Subtotal</span>
                <strong>₹{cartSubtotal}</strong>
              </div>

              {discount > 0 && (
                <div className="checkout-discount-line">
                  <span>Promo discount</span>
                  <strong>−₹{discount}</strong>
                </div>
              )}

              <div>
                <span>Delivery</span>
                <strong>
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </strong>
              </div>
            </div>

            <div className="checkout-summary-total">
              <span>Total</span>
              <strong>₹{cartTotal}</strong>
            </div>

            <button
              type="button"
              className="place-order-button"
              onClick={handlePlaceOrder}
            >
              Place Order
              <ArrowRight size={18} />
            </button>

            <div className="checkout-security">
              <div>
                <LockKeyhole size={16} />
                <span>Demo checkout</span>
              </div>
              <div>
                <ShieldCheck size={16} />
                <span>Your information is stored locally</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;
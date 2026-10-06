import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  const [paymentDetails, setPaymentDetails] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bank: "",
  });

  const [address, setAddress] = useState({
    fullName: "",
    mobile: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const deliverySlots = [
    "9:00 AM - 12:00 PM",
    "12:00 PM - 3:00 PM",
    "3:00 PM - 6:00 PM",
    "6:00 PM - 9:00 PM",
  ];

  const cartSubtotal = cart.reduce(
    (total, product) =>
      total + product.price * product.quantity,
    0
  );

  const deliveryCharge = cartSubtotal >= 500 ? 0 : 40;

  const cartTotal = cartSubtotal + deliveryCharge;

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

  const validatePaymentDetails = () => {
    if (selectedPayment === "UPI") {
      if (!paymentDetails.upiId.trim()) {
        alert("Please enter your UPI ID.");
        return false;
      }
    }

    if (selectedPayment === "Credit / Debit Card") {
      if (
        !paymentDetails.cardName.trim() ||
        !paymentDetails.cardNumber.trim() ||
        !paymentDetails.expiry.trim() ||
        !paymentDetails.cvv.trim()
      ) {
        alert("Please enter all card details.");
        return false;
      }
    }

    if (selectedPayment === "Net Banking") {
      if (!paymentDetails.bank) {
        alert("Please select your bank.");
        return false;
      }
    }

    return true;
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    const requiredAddressFields = [
      address.fullName,
      address.mobile,
      address.house,
      address.street,
      address.city,
      address.state,
      address.pinCode,
    ];

    const isAddressComplete = requiredAddressFields.every(
      (field) => field.trim() !== ""
    );

    if (!isAddressComplete) {
      alert("Please enter your complete delivery address.");
      return;
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

    setCart([]);
    navigate("/order-confirmation");
  };

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>

        <p>
          Complete your order by providing your delivery details.
        </p>
      </div>

      <div className="checkout-content">

        {/* Delivery Address */}
        <div className="checkout-section">
          <h2>Delivery Address</h2>

          <div className="checkout-form">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={address.fullName}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="mobile"
              placeholder="Mobile Number"
              value={address.mobile}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="house"
              placeholder="House / Flat / Building"
              value={address.house}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="street"
              placeholder="Street / Area"
              value={address.street}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="city"
              placeholder="City"
              value={address.city}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="state"
              placeholder="State"
              value={address.state}
              onChange={handleAddressChange}
            />

            <input
              type="text"
              name="pinCode"
              placeholder="PIN Code"
              value={address.pinCode}
              onChange={handleAddressChange}
            />

            <textarea
              placeholder="Delivery instructions (optional)"
              rows="3"
            ></textarea>
          </div>
        </div>

        {/* Delivery Slot */}
        <div className="checkout-section">
          <h2>Delivery Slot</h2>

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
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-section">
          <h2>Payment Method</h2>

          <div className="payment-methods">
            {[
              "UPI",
              "Credit / Debit Card",
              "Net Banking",
              "Cash on Delivery",
            ].map((method) => (
              <button
                key={method}
                type="button"
                className={`payment-method ${
                  selectedPayment === method ? "selected" : ""
                }`}
                onClick={() => handlePaymentSelection(method)}
              >
                {method}
              </button>
            ))}
          </div>

          {/* UPI Form */}
          {selectedPayment === "UPI" && (
            <div className="payment-details">
              <h3>UPI Payment</h3>

              <input
                type="text"
                name="upiId"
                placeholder="Enter UPI ID"
                value={paymentDetails.upiId}
                onChange={handlePaymentChange}
              />

              <small>
                Example: yourname@upi
              </small>
            </div>
          )}

          {/* Card Form */}
          {selectedPayment === "Credit / Debit Card" && (
            <div className="payment-details">
              <h3>Card Details</h3>

              <input
                type="text"
                name="cardName"
                placeholder="Cardholder Name"
                value={paymentDetails.cardName}
                onChange={handlePaymentChange}
              />

              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                maxLength="19"
                value={paymentDetails.cardNumber}
                onChange={handlePaymentChange}
              />

              <div className="payment-card-row">
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM / YY"
                  maxLength="5"
                  value={paymentDetails.expiry}
                  onChange={handlePaymentChange}
                />

                <input
                  type="password"
                  name="cvv"
                  placeholder="CVV"
                  maxLength="4"
                  value={paymentDetails.cvv}
                  onChange={handlePaymentChange}
                />
              </div>

              <small>
                Demo payment form — do not enter real card details.
              </small>
            </div>
          )}

          {/* Net Banking Form */}
          {selectedPayment === "Net Banking" && (
            <div className="payment-details">
              <h3>Select Your Bank</h3>

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
            </div>
          )}

          {/* COD */}
          {selectedPayment === "Cash on Delivery" && (
            <div className="payment-details">
              <h3>Cash on Delivery</h3>

              <p>
                Pay in cash when your order is delivered to your
                doorstep.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="checkout-section">
          <h2>Order Summary</h2>

          {cart.length === 0 ? (
            <div>
              <p>Your cart is empty.</p>

              <button
                type="button"
                className="place-order-button"
                onClick={() => navigate("/shop")}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <>
              {cart.map((product, index) => (
                <div
                  className="checkout-item"
                  key={`${product.name}-${index}`}
                >
                  <span>
                    {product.name} × {product.quantity}
                  </span>

                  <strong>
                    ₹{product.price * product.quantity}
                  </strong>
                </div>
              ))}

              <div className="checkout-item">
                <span>Subtotal</span>
                <strong>₹{cartSubtotal}</strong>
              </div>

              <div className="checkout-item">
                <span>Delivery</span>

                <strong>
                  {deliveryCharge === 0
                    ? "FREE"
                    : `₹${deliveryCharge}`}
                </strong>
              </div>

              <div className="checkout-total">
                <span>Total</span>

                <strong>₹{cartTotal}</strong>
              </div>
            </>
          )}
        </div>

        {/* Place Order */}
        {cart.length > 0 && (
          <div className="checkout-section checkout-final">
            <h2>Complete Order</h2>

            <p>
              Please review your delivery details, delivery slot,
              and payment method before placing your order.
            </p>

            <button
              type="button"
              className="place-order-button"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Checkout;
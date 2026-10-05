import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

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

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddress((currentAddress) => ({
      ...currentAddress,
      [name]: value,
    }));
  };

  const handlePlaceOrder = () => {
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

    setCart([]);
    navigate("/order-confirmation");
  };

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your order by providing your delivery details.</p>
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
                onClick={() => setSelectedPayment(method)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-section">
          <h2>Order Summary</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
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

              <div className="checkout-total">
                <span>Total</span>

                <strong>
                  ₹
                  {cart.reduce(
                    (total, product) =>
                      total + product.price * product.quantity,
                    0
                  )}
                </strong>
              </div>
            </>
          )}
        </div>

        {/* Place Order */}
        <div className="checkout-section checkout-final">
          <h2>Complete Order</h2>

          <p>
            Please review your delivery details, delivery slot, and payment
            method before placing your order.
          </p>

          <button
            type="button"
            className="place-order-button"
            onClick={handlePlaceOrder}
          >
            Place Order
          </button>
        </div>

      </div>
    </main>
  );
}

export default Checkout;
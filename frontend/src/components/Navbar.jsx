
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TopBar from "./TopBar";

import {
  Search,
  MapPin,
  User,
  Heart,
  ShoppingCart,
  House,
  LayoutGrid,
  LocateFixed,
  CheckCircle,
  AlertCircle,
  X,
  LogOut,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function Navbar({
  cartCount = 0,
  wishlistCount = 0,
  deliveryPincode = "",
  setDeliveryPincode,
  isLocationServiceable = false,
  checkPincode,
  customer = null,
  onLogout,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pincodeInput, setPincodeInput] = useState(deliveryPincode || "");

  const [locationMessage, setLocationMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [locationOpen, setLocationOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Store the route key where the account menu was opened.
  // This automatically hides the menu after navigation without useEffect.
  const [accountMenuLocationKey, setAccountMenuLocationKey] =
    useState(null);

  const [storeSettings, setStoreSettings] = useState({
    storeName: "Online Grocery",
    websiteName: "Online Grocery",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = Boolean(customer);

  const isActive = (path) => location.pathname === path;

  const accountMenuOpen =
    accountMenuLocationKey === location.key;

  // --------------------------------------------------
  // FETCH PUBLIC STORE SETTINGS
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    const fetchPublicSettings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/settings/public`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch public settings (${response.status})`
          );
        }

        const data = await response.json();

        if (data.success && data.settings) {
          const store = data.settings.store || {};
          const website = data.settings.website || {};

          setStoreSettings({
            storeName: store.storeName || "Online Grocery",
            websiteName:
              website.websiteName ||
              store.storeName ||
              "Online Grocery",
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Navbar settings error:", error);
        }
      }
    };

    fetchPublicSettings();

    return () => controller.abort();
  }, []);

  const displayStoreName =
    storeSettings.websiteName ||
    storeSettings.storeName ||
    "Online Grocery";

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setSearchTerm("");
  };

  // --------------------------------------------------
  // ACCOUNT MENU
  // --------------------------------------------------

  const toggleAccountMenu = () => {
    setAccountMenuLocationKey(
      accountMenuOpen ? null : location.key
    );
  };

  // --------------------------------------------------
  // PINCODE VERIFICATION
  // --------------------------------------------------

  const handlePincodeCheck = async (event) => {
    event.preventDefault();

    const pincode = pincodeInput.trim();

    if (!/^\d{6}$/.test(pincode)) {
      setMessageType("error");
      setLocationMessage(
        "Please enter a valid 6-digit PIN code."
      );
      return;
    }

    if (typeof checkPincode !== "function") {
      setMessageType("error");
      setLocationMessage(
        "Location checking is currently unavailable."
      );
      return;
    }

    setCheckingPincode(true);
    setMessageType("");
    setLocationMessage("Checking delivery availability...");

    try {
      const serviceable = await checkPincode(pincode);

      if (serviceable) {
        setDeliveryPincode?.(pincode);
        setPincodeInput(pincode);

        setMessageType("success");
        setLocationMessage(
          `Great! Delivery is available at ${pincode}.`
        );
      } else {
        setMessageType("error");
        setLocationMessage(
          `Sorry, ${pincode} is not serviceable yet. Please try another PIN code.`
        );
      }
    } catch (error) {
      console.error("PIN code verification failed:", error);

      setMessageType("error");
      setLocationMessage(
        "Unable to verify your PIN code. Please try again."
      );
    } finally {
      setCheckingPincode(false);
    }
  };

  // --------------------------------------------------
  // GPS LOCATION DETECTION
  // --------------------------------------------------

  const handleGpsDetection = () => {
    if (!navigator.geolocation) {
      setMessageType("error");
      setLocationMessage(
        "GPS detection is not supported by this browser."
      );
      return;
    }

    if (typeof checkPincode !== "function") {
      setMessageType("error");
      setLocationMessage(
        "Location checking is currently unavailable."
      );
      return;
    }

    setGpsLoading(true);
    setMessageType("");
    setLocationMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Could not look up the location.");
          }

          const data = await response.json();

          const detectedPincode = data.address?.postcode
            ?.replace(/\s/g, "")
            .match(/\d{6}/)?.[0];

          if (!detectedPincode) {
            setMessageType("error");
            setLocationMessage(
              "Couldn't detect your PIN code. Please enter it manually."
            );
            return;
          }

          setPincodeInput(detectedPincode);
          setLocationMessage(
            "Checking delivery availability..."
          );

          const serviceable = await checkPincode(detectedPincode);

          if (serviceable) {
            setDeliveryPincode?.(detectedPincode);

            setMessageType("success");
            setLocationMessage(
              `Location detected! Delivery is available at ${detectedPincode}.`
            );
          } else {
            setMessageType("error");
            setLocationMessage(
              `Your detected PIN code (${detectedPincode}) is not serviceable yet.`
            );
          }
        } catch (error) {
          console.error("GPS PIN verification failed:", error);

          setMessageType("error");
          setLocationMessage(
            "Couldn't verify your location. Please enter your PIN code manually."
          );
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        setMessageType("error");

        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Location permission was denied. You can enter your PIN code instead."
          );
        } else {
          setLocationMessage(
            "Couldn't detect your location. Please enter your PIN code manually."
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // --------------------------------------------------
  // LOCATION MODAL
  // --------------------------------------------------

  const openLocationChecker = () => {
    // Sync the input when the user opens the modal.
    setPincodeInput(deliveryPincode || "");
    setLocationMessage("");
    setMessageType("");
    setLocationOpen(true);
  };

  const closeLocationChecker = () => {
    if (checkingPincode || gpsLoading) return;

    setLocationOpen(false);
    setLocationMessage("");
    setMessageType("");
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = () => {
    setAccountMenuLocationKey(null);
    onLogout?.();
    navigate("/");
  };

  const accountLabel =
    customer?.name?.trim()?.split(/\s+/)[0] || "Account";

  return (
    <>
      {/* TOP BAR */}
      <TopBar />

      {/* MAIN NAVBAR */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-main">

          {/* LOGO */}
          <Link to="/" className="navbar-logo">
            <span className="logo-mark">OG</span>

            <span className="logo-text">
              {displayStoreName}
              <small>Freshness Delivered</small>
            </span>
          </Link>

          {/* SEARCH */}
          <form
            className="navbar-search"
            onSubmit={handleSearch}
            role="search"
          >
            <Search size={19} />

            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search products"
            />
          </form>

          {/* DELIVERY LOCATION */}
          <button
            type="button"
            className="navbar-location"
            onClick={openLocationChecker}
            aria-label="Check delivery location"
          >
            <MapPin size={18} />

            <div>
              <span>Deliver to</span>

              <strong>
                {isLocationServiceable && deliveryPincode
                  ? deliveryPincode
                  : "Select location"}
              </strong>
            </div>
          </button>

          {/* CUSTOMER ACCOUNT */}
          {isLoggedIn ? (
            <div className="navbar-account-wrapper">
              <button
                type="button"
                className="navbar-account"
                onClick={toggleAccountMenu}
                aria-expanded={accountMenuOpen}
                aria-haspopup="true"
              >
                <User size={20} />

                <div>
                  <span>Hello,</span>
                  <strong>{accountLabel}</strong>
                </div>
              </button>

              {accountMenuOpen && (
                <div className="navbar-account-menu">
                  <Link
                    to="/account"
                    onClick={() =>
                      setAccountMenuLocationKey(null)
                    }
                  >
                    <User size={17} />
                    My Account
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() =>
                      setAccountMenuLocationKey(null)
                    }
                  >
                    <ShoppingCart size={17} />
                    My Orders
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="navbar-account navbar-login-link"
            >
              <User size={20} />

              <div>
                <span>Welcome</span>
                <strong>Login / Sign Up</strong>
              </div>
            </Link>
          )}

          {/* WISHLIST */}
          <Link
            to="/wishlist"
            className="navbar-icon-link"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Heart size={21} />

            {wishlistCount > 0 && (
              <span className="nav-count">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* CART */}
          <Link
            to="/cart"
            className="navbar-icon-link cart-link"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart size={22} />

            {cartCount > 0 && (
              <span className="nav-count">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* DESKTOP CATEGORY NAVIGATION */}
        <div className="navbar-bottom">
          <Link to="/categories">All Categories</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/offers">Offers</Link>

          <Link to="/shop?category=Fruits%20%26%20Vegetables">
            Fruits &amp; Vegetables
          </Link>

          <Link to="/shop?category=Dairy%20%26%20Bakery">
            Dairy &amp; Bakery
          </Link>

          <Link to="/shop?category=Staples">Staples</Link>
          <Link to="/shop?category=Snacks">Snacks</Link>
          <Link to="/shop?category=Beverages">Beverages</Link>
        </div>
      </nav>

      {/* LOCATION MODAL */}
      {locationOpen && (
        <div
          className="location-modal-overlay"
          onClick={closeLocationChecker}
        >
          <section
            className="location-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="location-modal-close"
              onClick={closeLocationChecker}
              aria-label="Close location checker"
              disabled={checkingPincode || gpsLoading}
            >
              <X size={20} />
            </button>

            <div className="location-modal-icon">
              <MapPin size={25} />
            </div>

            <h2 id="location-modal-title">
              Check delivery availability
            </h2>

            <p className="location-modal-description">
              Enter your PIN code to see whether we deliver to
              your area.
            </p>

            {/* MANUAL PINCODE FORM */}
            <form
              className="location-pincode-form"
              onSubmit={handlePincodeCheck}
            >
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                placeholder="Enter 6-digit PIN code"
                value={pincodeInput}
                onChange={(event) => {
                  const value = event.target.value.replace(
                    /\D/g,
                    ""
                  );

                  setPincodeInput(value);
                  setLocationMessage("");
                  setMessageType("");
                }}
                aria-label="Delivery PIN code"
                disabled={checkingPincode || gpsLoading}
              />

              <button
                type="submit"
                disabled={
                  checkingPincode ||
                  gpsLoading ||
                  pincodeInput.length !== 6
                }
              >
                {checkingPincode ? "Checking..." : "Check"}
              </button>
            </form>

            {/* GPS BUTTON */}
            <button
              type="button"
              className="location-gps-button"
              onClick={handleGpsDetection}
              disabled={gpsLoading || checkingPincode}
            >
              <LocateFixed size={17} />

              {gpsLoading
                ? "Detecting location..."
                : "Use my current location"}
            </button>

            {/* LOCATION FEEDBACK */}
            {locationMessage && (
              <div
                className={`location-feedback ${messageType}`}
                role="status"
                aria-live="polite"
              >
                {messageType === "success" ? (
                  <CheckCircle size={18} />
                ) : messageType === "error" ? (
                  <AlertCircle size={18} />
                ) : null}

                <span>{locationMessage}</span>
              </div>
            )}

            {/* CONTINUE SHOPPING */}
            {isLocationServiceable &&
              deliveryPincode &&
              messageType === "success" && (
                <button
                  type="button"
                  className="location-continue-button"
                  onClick={() => setLocationOpen(false)}
                >
                  Continue shopping
                </button>
              )}
          </section>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Mobile navigation"
      >
        <Link
          to="/"
          className={`mobile-nav-item ${
            isActive("/") ? "active" : ""
          }`}
          aria-label="Home"
          aria-current={isActive("/") ? "page" : undefined}
        >
          <House size={21} />
          <span>Home</span>
        </Link>

        <Link
          to="/categories"
          className={`mobile-nav-item ${
            isActive("/categories") ? "active" : ""
          }`}
          aria-label="Categories"
          aria-current={
            isActive("/categories") ? "page" : undefined
          }
        >
          <LayoutGrid size={21} />
          <span>Categories</span>
        </Link>

        <Link
          to="/wishlist"
          className={`mobile-nav-item ${
            isActive("/wishlist") ? "active" : ""
          }`}
          aria-label={`Wishlist, ${wishlistCount} items`}
          aria-current={
            isActive("/wishlist") ? "page" : undefined
          }
        >
          <span className="mobile-nav-icon">
            <Heart size={21} />

            {wishlistCount > 0 && (
              <span className="mobile-nav-count">
                {wishlistCount}
              </span>
            )}
          </span>

          <span>Wishlist</span>
        </Link>

        <Link
          to="/cart"
          className={`mobile-nav-item ${
            isActive("/cart") ? "active" : ""
          }`}
          aria-label={`Cart, ${cartCount} items`}
          aria-current={
            isActive("/cart") ? "page" : undefined
          }
        >
          <span className="mobile-nav-icon">
            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span className="mobile-nav-count">
                {cartCount}
              </span>
            )}
          </span>

          <span>Cart</span>
        </Link>

        {isLoggedIn ? (
          <Link
            to="/account"
            className={`mobile-nav-item ${
              isActive("/account") ? "active" : ""
            }`}
            aria-label="Account"
            aria-current={
              isActive("/account") ? "page" : undefined
            }
          >
            <User size={21} />
            <span>Account</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`mobile-nav-item ${
              isActive("/login") || isActive("/signup")
                ? "active"
                : ""
            }`}
            aria-label="Login or sign up"
          >
            <User size={21} />
            <span>Login</span>
          </Link>
        )}
      </nav>
    </>
  );
}

export default Navbar;

import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {

   MapPin,

   Clock3,

   Smartphone,

   CreditCard,

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

function parseSession(storage, key) {

   try {

      const raw = storage?.getItem(key);

      if (!raw) return null;

      const parsed = JSON.parse(raw);

      return parsed && typeof parsed === "object" ? parsed : null;

   } catch {

      return null;

   }

}

function getCustomerSession() {

   const candidates = [

      parseSession(window.localStorage, "customerSession"),

      parseSession(window.sessionStorage, "customerSession"),

      parseSession(window.localStorage, "sessionCustomer"),

   ].filter(Boolean);

   for (const candidate of candidates) {

      const nested =

         candidate.customer || candidate.user || candidate.data || {};

      const token =

         candidate.token ||

         candidate.accessToken ||

         candidate.jwt ||

         nested.token ||

         nested.accessToken ||

         nested.jwt ||

         "";

      if (token) {

         return {

            ...nested,

            ...candidate,

            token,

            name:

               candidate.name ||

               candidate.fullName ||

               nested.name ||

               nested.fullName ||

               "",

            email: candidate.email || nested.email || "",

            mobile:

               candidate.mobile ||

               candidate.phone ||

               nested.mobile ||

               nested.phone ||

               "",

         };

      }

   }

   return candidates[0] || {};

}

const API_BASE_URL = (

   import.meta.env?.VITE_API_BASE_URL || "http://localhost:5000"

).replace(/\/$/, "");

function getCustomerToken() {

   const customer = getCustomerSession();

   return customer?.token || customer?.accessToken || customer?.jwt || "";

}

function normalizeSavedAddress(item = {}) {

   const addressLine1 =

      item.addressLine1 || item.address || item.streetAddress || "";

   const addressLine2 = item.addressLine2 || "";

   const id = item._id || item.id || item.addressId || "";

   const rawType = String(

      item.addressType || item.type || "home"

   ).toLowerCase();

   const type =

      rawType === "office" || rawType === "work"

         ? "Work"

         : rawType === "other"

            ? "Other"

            : "Home";

   return {

      ...item,

      id: String(id),

      type,

      name: item.name || item.fullName || item.recipientName || "",

      fullName: item.fullName || item.name || item.recipientName || "",

      mobile: item.mobile || item.phone || item.phoneNumber || "",

      address: [addressLine1, addressLine2].filter(Boolean).join(", "),

      addressLine1,

      addressLine2,

      city: item.city || "",

      state: item.state || "",

      pinCode: item.pinCode || item.postalCode || item.zipCode || "",

      postalCode: item.postalCode || item.pinCode || item.zipCode || "",

      isDefault: Boolean(item.isDefault || item.default),

   };

}

function getCustomerEmail() {

   return getCustomerSession()?.email?.trim().toLowerCase() || "";

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

const loadRazorpayScript = () =>

   new Promise((resolve) => {

      if (window.Razorpay) {

         resolve(true);

         return;

      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);

   });

function Checkout({ cart = [], setCart, deliveryPincode = "" }) {

   const navigate = useNavigate();

   const [savedAddresses, setSavedAddresses] = useState(loadSavedAddresses);

   const [addressesLoading, setAddressesLoading] = useState(false);

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

   const [deliveryZone, setDeliveryZone] = useState(null);

   const [checkoutSettings, setCheckoutSettings] = useState({

      orders: { minimumOrder: 0, deliveryCharge: 0, freeDeliveryAbove: 0, codEnabled: true, onlinePaymentEnabled: true },

   });

   const [settingsLoading, setSettingsLoading] = useState(true);



   const [deliverySlots, setDeliverySlots] = useState([]);

   const [deliveryLoading, setDeliveryLoading] = useState(false);

   const [deliveryError, setDeliveryError] = useState("");

   const [selectedPayment, setSelectedPayment] = useState("");

   const [deliveryInstructions, setDeliveryInstructions] = useState("");

   const [promoInput, setPromoInput] = useState("");

   const [availableCoupons, setAvailableCoupons] = useState([]);

   const [couponsLoading, setCouponsLoading] = useState(false);

   const [appliedPromo, setAppliedPromo] = useState(null);

   const [promoMessage, setPromoMessage] = useState("");

   const [promoError, setPromoError] = useState(false);

   const [isPlacingOrder, setIsPlacingOrder] = useState(false);

   const [isApplyingPromo, setIsApplyingPromo] = useState(false);

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

   useEffect(() => {

      const controller = new AbortController();

      async function fetchCheckoutSettings() {

         try {

            const response = await fetch(`${API_BASE_URL}/api/settings/public`, { signal: controller.signal });

            const result = await response.json();

            if (!response.ok || result?.success === false) throw new Error(result?.message || "Unable to load checkout settings.");

            if (!controller.signal.aborted && result?.settings) {

               setCheckoutSettings({

                  orders: {

                     minimumOrder: Number(result.settings.orders?.minimumOrder || 0),

                     deliveryCharge: Number(result.settings.orders?.deliveryCharge || 0),

                     freeDeliveryAbove: Number(result.settings.orders?.freeDeliveryAbove || 0),

                     codEnabled: result.settings.orders?.codEnabled !== false,

                     onlinePaymentEnabled: result.settings.orders?.onlinePaymentEnabled !== false,

                  },

               });

            }

         } catch (error) {

            if (error.name !== "AbortError") console.error("Checkout settings error:", error);

         } finally {

            if (!controller.signal.aborted) setSettingsLoading(false);

         }

      }

      fetchCheckoutSettings();

      return () => controller.abort();

   }, []);



   useEffect(() => {

      const controller = new AbortController();

      async function fetchAddresses() {

         const token = getCustomerToken();

         if (!token) return;

         setAddressesLoading(true);

         try {

            const response = await fetch(

               `${API_BASE_URL}/api/customers/addresses`,

               {

                  headers: { Authorization: `Bearer ${token}` },

                  signal: controller.signal,

               }

            );

            const result = await response.json();

            if (!response.ok || result?.success === false) {

               throw new Error(

                  result?.message || "Unable to load saved addresses."

               );

            }

            const rawAddresses = Array.isArray(result?.addresses)

               ? result.addresses

               : Array.isArray(result?.data)

                  ? result.data

                  : Array.isArray(result?.data?.addresses)

                     ? result.data.addresses

                     : [];

            const normalized = rawAddresses.map(normalizeSavedAddress);

            if (!controller.signal.aborted) {

               setSavedAddresses(normalized);

               const defaultAddress =

                  normalized.find((item) => item.isDefault) || normalized[0];

               setSelectedAddressId(

                  defaultAddress ? String(defaultAddress.id) : ""

               );

               setShowNewAddressForm(normalized.length === 0);

            }

         } catch (error) {

            if (error.name !== "AbortError") {

               console.error("Unable to load addresses:", error.message);

            }

         } finally {

            if (!controller.signal.aborted) setAddressesLoading(false);

         }

      }

      fetchAddresses();

      return () => controller.abort();

   }, []);

   useEffect(() => {

      const controller = new AbortController();

      async function fetchPublicCoupons() {

         setCouponsLoading(true);

         try {

            const response = await fetch(`${API_BASE_URL}/api/coupons/public`, {

               signal: controller.signal,

            });

            const result = await response.json();

            if (!response.ok || result?.success === false) {

               throw new Error(result?.message || "Unable to load active coupons.");

            }

            const coupons = Array.isArray(result?.coupons)

               ? result.coupons

               : Array.isArray(result?.data?.coupons)

                  ? result.data.coupons

                  : Array.isArray(result?.data)

                     ? result.data

                     : [];

            if (!controller.signal.aborted) {

               setAvailableCoupons(coupons.filter((coupon) => {

                  const active = coupon.isActive !== false && coupon.active !== false &&

                     String(coupon.status || "active").toLowerCase() !== "inactive";

                  const startsAt = coupon.startDate || coupon.validFrom;

                  const endsAt = coupon.endDate || coupon.validUntil || coupon.expiryDate;

                  const now = Date.now();

                  const started = !startsAt || new Date(startsAt).getTime() <= now;

                  const notExpired = !endsAt || new Date(endsAt).getTime() >= now;

                  const underUsageLimit = coupon.usageLimit == null || coupon.usedCount == null ||

                     Number(coupon.usedCount) < Number(coupon.usageLimit);

                  return active && started && notExpired && underUsageLimit && coupon.code;

               }));

            }

         } catch (error) {

            if (error.name !== "AbortError") {

               console.error("Unable to load active coupons:", error);

               if (!controller.signal.aborted) setAvailableCoupons([]);

            }

         } finally {

            if (!controller.signal.aborted) setCouponsLoading(false);

         }

      }

      fetchPublicCoupons();

      return () => controller.abort();

   }, []);

   const allPaymentMethods = [

      {

         name: "Credit / Debit Card",

         icon: <CreditCard size={20} />,

         description: "Pay securely through Razorpay Checkout",

      },

      {

         name: "UPI ID",

         icon: <Landmark size={20} />,

         description: "Pay through supported UPI options",

      },

      {

         name: "QR Code",

         icon: <Smartphone size={20} />,

         description: "Scan the Razorpay QR code to pay",

      },

      {

         name: "Cash on Delivery",

         icon: <Banknote size={20} />,

         description: "Pay when your order arrives",

      },

   ];

   const paymentMethods = allPaymentMethods.filter((method) =>

      method.name === "Cash on Delivery"

         ? checkoutSettings.orders.codEnabled

         : checkoutSettings.orders.onlinePaymentEnabled

   );

   const selectedSavedAddress =

      savedAddresses.find(

         (item) => String(item.id) === String(selectedAddressId)

      ) || null;

   const cartSubtotal = cart.reduce(

      (total, product) =>

         total + Number(product.price || 0) * Number(product.quantity || 0),

      0

   );

   const freeDeliveryAbove = Number(

      deliveryZone?.freeDeliveryAbove ?? checkoutSettings.orders.freeDeliveryAbove

   );

   const configuredDeliveryCharge = Number(

      deliveryZone?.deliveryCharge ?? checkoutSettings.orders.deliveryCharge

   );

   const deliveryCharge =

      Number.isFinite(freeDeliveryAbove) && freeDeliveryAbove > 0 && cartSubtotal >= freeDeliveryAbove

         ? 0

         : Math.max(0, configuredDeliveryCharge || 0);

   const minimumOrder = Number(

      deliveryZone?.minimumOrder ?? checkoutSettings.orders.minimumOrder ?? 0

   );

   const minimumOrderNotMet = Boolean(deliveryZone) && cartSubtotal < minimumOrder;

   const checkoutPinCode = String(

      !showNewAddressForm && selectedSavedAddress

         ? selectedSavedAddress.postalCode || selectedSavedAddress.pinCode || ""

         : address.pinCode || deliveryPincode || ""

   ).trim();

   const discount = appliedPromo

      ? Math.min(appliedPromo.discount, cartSubtotal)

      : 0;

   const cartTotal = Math.max(

      0,

      cartSubtotal - discount + deliveryCharge

   );

   useEffect(() => {

      const controller = new AbortController();

      const fetchDeliveryDetails = async () => {

         setDeliveryZone(null);

         setDeliverySlots([]);

         setSelectedSlot("");

         setDeliveryError("");

         if (!/^\d{6}$/.test(checkoutPinCode)) return;

         setDeliveryLoading(true);

         try {

            const [zoneResponse, slotsResponse] = await Promise.all([

               fetch(

                  `${API_BASE_URL}/api/delivery/check-pincode/${encodeURIComponent(checkoutPinCode)}`,

                  { signal: controller.signal }

               ),

               fetch(`${API_BASE_URL}/api/delivery/public/slots`, {

                  signal: controller.signal,

               }),

            ]);

            const zoneData = await zoneResponse.json();

            const slotsData = await slotsResponse.json();

            const zone = zoneData?.zone || zoneData?.data?.zone || zoneData?.data;

            const serviceable =

               zoneData?.serviceable === true ||

               zoneData?.isServiceable === true ||

               zoneData?.success === true && Boolean(zone);

            if (!zoneResponse.ok || zoneData?.success === false || !serviceable || !zone) {

               throw new Error(

                  zoneData?.message || "Delivery is not available at this PIN code."

               );

            }

            if (!slotsResponse.ok || slotsData?.success === false) {

               throw new Error(slotsData?.message || "Unable to load delivery slots.");

            }

            if (controller.signal.aborted) return;

            setDeliveryZone(zone);

            const slots = Array.isArray(slotsData?.slots)

               ? slotsData.slots

               : Array.isArray(slotsData?.data?.slots)

                  ? slotsData.data.slots

                  : Array.isArray(slotsData?.data)

                     ? slotsData.data

                     : [];

            setDeliverySlots(slots.filter(

               (slot) => String(slot.status || "active").toLowerCase() === "active"

            ));

         } catch (error) {

            if (error.name !== "AbortError") {

               console.error("Delivery details error:", error);

               if (!controller.signal.aborted) {

                  setDeliveryError(error.message || "Unable to load delivery details.");

               }

            }

         } finally {

            if (!controller.signal.aborted) setDeliveryLoading(false);

         }

      };

      fetchDeliveryDetails();

      return () => controller.abort();

   }, [checkoutPinCode]);

   const applyPromo = async () => {

      const code = promoInput.trim().toUpperCase();

      if (!code) {

         setAppliedPromo(null);

         setPromoError(true);

         setPromoMessage("Please enter a promo code.");

         return;

      }

      if (isApplyingPromo) return;

      setIsApplyingPromo(true);

      setPromoError(false);

      setPromoMessage("");

      try {

         const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {

            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({ code, subtotal: cartSubtotal }),

         });

         let result = {};

         try {

            result = await response.json();

         } catch {

            result = {};

         }

         if (!response.ok || !result?.success || !result?.coupon) {

            throw new Error(result?.message || "Unable to validate coupon.");

         }

         const calculatedDiscount = Number(result.discount);

         if (!Number.isFinite(calculatedDiscount) || calculatedDiscount <= 0) {

            throw new Error("This coupon does not provide a valid discount.");

         }

         const safeDiscount = Math.min(calculatedDiscount, cartSubtotal);

         setAppliedPromo({

            ...result.coupon,

            code: String(result.coupon.code || code).toUpperCase(),

            discount: safeDiscount,

         });

         setPromoError(false);

         setPromoMessage(`Coupon applied successfully! You saved ₹${safeDiscount}.`);

      } catch (error) {

         setAppliedPromo(null);

         setPromoError(true);

         setPromoMessage(error.message || "Unable to validate coupon.");

      } finally {

         setIsApplyingPromo(false);

      }

   };

   const removePromo = () => {

      setAppliedPromo(null);

      setPromoInput("");

      setPromoMessage("Promo code removed.");

      setPromoError(false);

   };

   const handleAddressChange = (event) => {

      const { name, value } = event.target;

      setAddress((current) => ({ ...current, [name]: value }));

   };

   const handleSaveNewAddress = async () => {

      const customer = getCustomerSession();

      const email = getCustomerEmail();

      const token = getCustomerToken();

      if (!email || !token) {

         alert("Please log in again before saving an address.");

         navigate("/login", { state: { from: "/checkout" } });

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

      if (requiredFields.some((field) => !String(field || "").trim())) {

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

      const addressPayload = {

         fullName: address.fullName.trim(),

         name: address.fullName.trim(),

         mobile: address.mobile.trim(),

         phone: address.mobile.trim(),

         addressType:

            address.type === "Work"

               ? "office"

               : address.type === "Other"

                  ? "other"

                  : "home",

         addressLine1: `${address.house.trim()}, ${address.street.trim()}`,

         addressLine2: "",

         city: address.city.trim(),

         state: address.state.trim(),

         postalCode: address.pinCode.trim(),

         isDefault: savedAddresses.length === 0,

      };

      try {

         const response = await fetch(

            `${API_BASE_URL}/api/customers/addresses`,

            {

               method: "POST",

               headers: {

                  "Content-Type": "application/json",

                  Authorization: `Bearer ${token}`,

               },

               body: JSON.stringify(addressPayload),

            }

         );

         const result = await response.json();

         if (!response.ok || result?.success === false) {

            throw new Error(

               result?.message || "Unable to save address on the server."

            );

         }

         const saved =

            result?.address || result?.data?.address || result?.data || result;

         const newAddress = normalizeSavedAddress(saved);

         if (!newAddress.id) {

            throw new Error("The server returned no address ID.");

         }

         const nextAddresses = [...savedAddresses, newAddress];

         setSavedAddresses(nextAddresses);

         setSelectedAddressId(String(newAddress.id));

         setShowNewAddressForm(false);

         setAddress({

            type: "Home",

            fullName: "",

            mobile: customer?.mobile || "",

            house: "",

            street: "",

            city: "",

            state: "",

            pinCode: "",

         });

         alert("Address saved successfully.");

      } catch (error) {

         console.error("Save address error:", error);

         alert(error.message || "Unable to save address.");

      }

   };

   const getAddressIcon = (type) => {

      if (type === "Work") return <Briefcase size={17} />;

      if (type === "Other") return <MapPinned size={17} />;

      return <Home size={17} />;

   };

   const handlePlaceOrder = async () => {

      if (isPlacingOrder) return;

      if (cart.length === 0) {

         alert("Your cart is empty.");

         navigate("/shop");

         return;

      }

      let orderAddress;

      if (!showNewAddressForm && selectedSavedAddress) {

         orderAddress = {

            fullName:

               selectedSavedAddress.fullName || selectedSavedAddress.name || "",

            mobile: selectedSavedAddress.mobile || "",

            addressLine1:

               selectedSavedAddress.addressLine1 ||

               selectedSavedAddress.address ||

               "",

            addressLine2: selectedSavedAddress.addressLine2 || "",

            city: selectedSavedAddress.city || "",

            state: selectedSavedAddress.state || "",

            postalCode:

               selectedSavedAddress.postalCode ||

               selectedSavedAddress.pinCode ||

               "",

            landmark: selectedSavedAddress.landmark || "",

         };

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

         if (requiredFields.some((field) => !String(field || "").trim())) {

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

            fullName: address.fullName.trim(),

            mobile: address.mobile.trim(),

            addressLine1: `${address.house.trim()}, ${address.street.trim()}`,

            addressLine2: "",

            city: address.city.trim(),

            state: address.state.trim(),

            postalCode: address.pinCode.trim(),

            landmark: "",

         };

      }

      if (

         !orderAddress.fullName ||

         !orderAddress.mobile ||

         !orderAddress.addressLine1 ||

         !orderAddress.city ||

         !orderAddress.state ||

         !orderAddress.postalCode

      ) {

         alert("The selected address is incomplete.");

         return;

      }

      if (!/^\d{6}$/.test(String(orderAddress.postalCode || "").trim())) {

         alert("Please enter a valid 6-digit delivery PIN code.");

         return;

      }

      if (!deliveryZone || deliveryError || deliveryLoading) {

         alert(

            deliveryLoading

               ? "Please wait while we verify delivery availability."

               : deliveryError || "Please select a serviceable delivery address."

         );

         return;

      }

      if (minimumOrderNotMet) {

         alert(`Minimum order amount for this delivery zone is ₹${minimumOrder}.`);

         return;

      }

      if (!selectedSlot) {

         alert("Please select a delivery slot.");

         return;

      }

      if (!selectedPayment || !paymentMethods.some((method) => method.name === selectedPayment)) {

         alert("Please select an available payment method.");

         return;

      }

      const customer = getCustomerSession();

      const token = getCustomerToken();

      if (!token) {

         alert("Your login session could not be found. Please log in again.");

         navigate("/login", { state: { from: "/checkout" } });

         return;

      }

      const items = cart.map((item) => ({

         productId:

            item.productId ||

            item._id ||

            item.product?._id ||

            item.product?.id ||

            item.id,

         quantity: Number(item.quantity),

      }));

      if (

         items.some(

            (item) =>

               !item.productId ||

               !Number.isFinite(item.quantity) ||

               item.quantity <= 0

         )

      ) {

         alert("Some cart items have an invalid product ID or quantity.");

         return;

      }

      const customerName =

         orderAddress.fullName || customer.name || customer.fullName || "";

      const customerMobile =

         orderAddress.mobile || customer.mobile || customer.phone || "";

      const customerEmail =

         customer.email || customer.customerEmail || "";

      if (!customerName.trim() || !customerMobile.trim()) {

         alert("Please provide your name and mobile number.");

         return;

      }

      const isCOD = selectedPayment === "Cash on Delivery";

      const isQR = selectedPayment === "QR Code";

      const isOnline = !isCOD;

      if (isOnline && !isQR) {

         setIsPlacingOrder(true);

         const loaded = await loadRazorpayScript();

         if (!loaded) {

            setIsPlacingOrder(false);

            alert(

               "Unable to load Razorpay Checkout. Check your internet connection."

            );

            return;

         }

      }

      const payload = {

         customerName: customerName.trim(),

         customerEmail: customerEmail.trim().toLowerCase(),

         customerMobile: customerMobile.trim(),

         items,

         deliveryAddress: orderAddress,

         paymentMethod: isCOD ? "cod" : "online",

         paymentType:

            selectedPayment === "Cash on Delivery"

               ? "cod"

               : selectedPayment === "Credit / Debit Card"

                  ? "card"

                  : selectedPayment === "UPI ID"

                     ? "upi_id"

                     : "qr_code",

         deliverySlot: selectedSlot,

         deliveryInstructions: deliveryInstructions.trim(),

         promoCode: appliedPromo?.code || null,

      };

      setIsPlacingOrder(true);

      const saveOrderLocally = (order) => {

         try {

            localStorage.setItem("lastOrder", JSON.stringify(order));

         } catch (error) {

            console.warn("Unable to cache order:", error);

         }

      };

      let razorpayModalOpened = false;

      try {

         const response = await fetch(

            `${API_BASE_URL}/api/orders/customer`,

            {

               method: "POST",

               headers: {

                  "Content-Type": "application/json",

                  Authorization: `Bearer ${token}`,

               },

               body: JSON.stringify(payload),

            }

         );

         let result;

         try {

            result = await response.json();

         } catch {

            result = {};

         }

         if (!response.ok || !result?.success) {

            throw new Error(

               result?.message || `Unable to place order (HTTP ${response.status}).`

            );

         }

         const savedOrder = result.order;

         if (!savedOrder?._id) {

            throw new Error("The server did not return the created order.");

         }

         const qrCode =

            result.qrCode ||

            (savedOrder.razorpayQrCodeId

               ? {

                     id: savedOrder.razorpayQrCodeId,

                     imageUrl: savedOrder.paymentQrImageUrl,

                     expiresAt: savedOrder.paymentQrExpiresAt,

                  }

               : null);

         const orderForConfirmation = {

            ...savedOrder,

            deliverySlot: selectedSlot,

            deliveryInstructions: deliveryInstructions.trim(),

            promoCode: appliedPromo?.code || null,

            subtotal: savedOrder.subtotal ?? cartSubtotal,

            discount: savedOrder.discountAmount ?? 0,

            deliveryCharge: savedOrder.deliveryCharge ?? deliveryCharge,

            total: savedOrder.totalAmount ?? cartTotal,

         };

         if (isCOD) {

            saveOrderLocally(orderForConfirmation);

            setCart([]);

            navigate("/order-confirmation", {

               state: { order: orderForConfirmation, qrCode: null },

            });

            return;

         }

         if (isQR) {

            if (!qrCode?.imageUrl) {

               saveOrderLocally(orderForConfirmation);

               alert(

                  "Your order was created, but no QR image was returned. Check your orders before placing another order."

               );

               navigate("/order-confirmation", {

                  state: { order: orderForConfirmation, qrCode: null },

               });

               return;

            }

            const qrOrder = {

               ...orderForConfirmation,

               razorpayQrCodeId: qrCode.id,

               paymentQrImageUrl: qrCode.imageUrl,

               paymentQrExpiresAt: qrCode.expiresAt,

            };

            saveOrderLocally(qrOrder);

            setCart([]);

            navigate("/order-confirmation", {

               state: { order: qrOrder, qrCode },

            });

            return;

         }

         const checkout = result.razorpayCheckout;

         if (!checkout?.key || !checkout?.orderId) {

            saveOrderLocally({

               ...orderForConfirmation,

               paymentStatus: "pending",

            });

            alert(

               "Your order was created, but Razorpay Checkout details are missing. Check your orders before retrying."

            );

            return;

         }

         const options = {

            key: checkout.key,

            amount: checkout.amount,

            currency: checkout.currency || "INR",

            name: checkout.name || "Online Grocery Store",

            description:

               checkout.description ||

               `Payment for ${savedOrder.orderNumber || "your order"}`,

            order_id: checkout.orderId,

            ...(selectedPayment === "UPI ID"

               ? {

                     config: {

                        display: {

                           blocks: {

                              upi: {

                                 name: "Pay using UPI",

                                 instruments: [{ method: "upi" }],

                              },

                           },

                           sequence: ["block.upi"],

                           preferences: { show_default_blocks: false },

                        },

                     },

                  }

               : {}),

            prefill: checkout.prefill || {

               name: customerName,

               email: customerEmail,

               contact: customerMobile,

            },

            theme: { color: "#16a34a" },

            handler: async (paymentResponse) => {

               try {

                  const verifyResponse = await fetch(

                     `${API_BASE_URL}/api/orders/verify-payment`,

                     {

                        method: "POST",

                        headers: {

                           "Content-Type": "application/json",

                           Authorization: `Bearer ${token}`,

                        },

                        body: JSON.stringify({

                           orderId: savedOrder._id,

                           razorpay_order_id:

                              paymentResponse.razorpay_order_id,

                           razorpay_payment_id:

                              paymentResponse.razorpay_payment_id,

                           razorpay_signature:

                              paymentResponse.razorpay_signature,

                        }),

                     }

                  );

                  const verifyResult = await verifyResponse.json();

                  if (

                     !verifyResponse.ok ||

                     !verifyResult?.success ||

                     verifyResult?.order?.paymentStatus !== "paid"

                  ) {

                     saveOrderLocally({

                        ...orderForConfirmation,

                        paymentStatus: "pending",

                     });

                     alert(

                        verifyResult?.message ||

                           "Payment verification is pending. Check your order status before retrying."

                     );

                     return;

                  }

                  const verifiedOrder = {

                     ...orderForConfirmation,

                     ...verifyResult.order,

                     deliverySlot: selectedSlot,

                     deliveryInstructions: deliveryInstructions.trim(),

                     paymentStatus: "paid",

                  };

                  saveOrderLocally(verifiedOrder);

                  setCart([]);

                  navigate("/order-confirmation", {

                     state: { order: verifiedOrder, qrCode: null },

                  });

               } catch (error) {

                  console.error("Payment verification error:", error);

                  saveOrderLocally({

                     ...orderForConfirmation,

                     paymentStatus: "pending",

                  });

                  alert(

                     "Payment may have completed, but verification could not be confirmed. Check your order status before retrying."

                  );

               } finally {

                  setIsPlacingOrder(false);

               }

            },

            modal: {

               ondismiss: () => {

                  setIsPlacingOrder(false);

                  saveOrderLocally({

                     ...orderForConfirmation,

                     paymentStatus: "pending",

                  });

                  alert(

                     "Checkout was closed. Your order may still be pending. Check your orders before trying again."

                  );

               },

            },

         };

         const razorpayCheckout = new window.Razorpay(options);

         razorpayCheckout.on("payment.failed", (event) => {

            console.error(

               "Razorpay payment failed:",

               event?.error?.description || event?.error?.reason

            );

            saveOrderLocally({

               ...orderForConfirmation,

               paymentStatus: "pending",

            });

            setIsPlacingOrder(false);

            alert(

               event?.error?.description ||

                  "Payment failed. Check your order status before retrying."

            );

         });

         razorpayCheckout.open();

         razorpayModalOpened = true;

      } catch (error) {

         console.error("Place order error:", error);

         alert(error.message || "Unable to place your order. Please try again.");

      } finally {

         if (!razorpayModalOpened) {

            setIsPlacingOrder(false);

         }

      }

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

      <style>{`
        .checkout-page .delivery-slots {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
          margin-top: 20px;
        }

        .checkout-page .delivery-status-message {
          width: 100%;
          margin: 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.6;
        }

        .checkout-page .delivery-slot-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          width: 100%;
        }

        .checkout-page .delivery-slot {
          width: 100%;
          min-width: 0;
          min-height: 82px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 13px;
          text-align: left;
          background: #fff;
          border: 1px solid #dce5df;
          border-radius: 10px;
          cursor: pointer;
          color: #172b22;
          transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .checkout-page .delivery-slot:hover {
          border-color: #168653;
          background: #f5fbf7;
        }

        .checkout-page .delivery-slot.selected {
          border: 1.5px solid #168653;
          background: #edf8f1;
          box-shadow: 0 0 0 2px rgba(22, 134, 83, .08);
        }

        .checkout-page .delivery-slot-icon {
          width: 42px;
          height: 42px;
          min-width: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f7f2;
          border-radius: 9px;
          font-size: 22px;
        }

        .checkout-page .delivery-slot-info {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
        }

        .checkout-page .delivery-slot-info strong {
          font-size: 14px;
          font-weight: 700;
          color: #172b22;
        }

        .checkout-page .delivery-slot-info small {
          font-size: 12px;
          color: #718078;
          white-space: nowrap;
        }

        .checkout-page .delivery-slot-check {
          width: 23px;
          height: 23px;
          min-width: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #d5e0d9;
          border-radius: 50%;
          color: #168653;
        }

        .checkout-page .delivery-slot.selected .delivery-slot-check {
          border-color: #168653;
          background: #168653;
          color: #fff;
        }

        @media (max-width: 600px) {
          .checkout-page .delivery-slot-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .checkout-page .delivery-slot {
            min-height: 76px;
          }
        }
      `}</style>

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

                              <span>

                                 {addressesLoading

                                    ? "Loading saved addresses..."

                                    : "Select a saved address"}

                              </span>

                              <select

                                 value={selectedSavedAddress ? selectedAddressId : ""}

                                 onChange={(event) => {

                                    setSelectedAddressId(event.target.value);

                                    setShowNewAddressForm(false);

                                 }}

                              >

                                 {savedAddresses.map((item) => (

                                    <option key={item.id} value={item.id}>

                                       {item.type} — {item.name}, {item.city} (

                                       {item.pinCode})

                                    </option>

                                 ))}

                              </select>

                           </label>

                           {selectedSavedAddress && !showNewAddressForm && (

                              <div className="checkout-selected-address">

                                 <div className="checkout-selected-address-heading">

                                    {getAddressIcon(selectedSavedAddress.type)}

                                    <strong>

                                       {selectedSavedAddress.type} Address

                                    </strong>

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

                        onClick={() =>

                           setShowNewAddressForm((current) => !current)

                        }

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

  {/* Delivery status */}

  {deliveryLoading && (

    <p className="delivery-status-message">

      Checking delivery options...

    </p>

  )}



  {!deliveryLoading && deliveryError && (

    <p className="checkout-error" role="alert">

      {deliveryError}

    </p>

  )}



  {!deliveryLoading && !deliveryError && deliveryZone && (

    <p className="delivery-status-message">

      Delivery available in {deliveryZone.name}.

      {minimumOrder > 0

        ? ` Minimum order: ₹${minimumOrder}.`

        : ""}

    </p>

  )}



  {!deliveryLoading &&

    !deliveryError &&

    deliverySlots.length === 0 && (

      <p>No active delivery slots are currently available.</p>

    )}



  {/* Delivery slot cards */}

  {!deliveryLoading && !deliveryError && deliverySlots.length > 0 && (

    <div className="delivery-slot-grid">

      {deliverySlots.map((slot) => {

        const slotId = String(slot._id || slot.id || slot.name);



        const slotName = String(slot.name || "").trim();



        const formatTime = (time) => {

          if (!time) return "";



          const [hours, minutes] = time.split(":");

          const date = new Date();

          date.setHours(Number(hours), Number(minutes), 0, 0);



          return date.toLocaleTimeString("en-IN", {

            hour: "numeric",

            minute: "2-digit",

            hour12: true,

          });

        };



        const timing =

          slot.startTime && slot.endTime

            ? `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`

            : "Timing unavailable";



        const slotIcons = {

          Morning: "🌅",

          Afternoon: "☀️",

          Evening: "🌇",

          Night: "🌙",

        };



        return (

          <button

            key={slotId}

            type="button"

            className={`delivery-slot ${

              selectedSlot === slotId ? "selected" : ""

            }`}

            onClick={() => setSelectedSlot(slotId)}

          >

            <span className="delivery-slot-icon">

              {slotIcons[slotName] || "🕒"}

            </span>



            <span className="delivery-slot-info">

              <strong>{slotName || "Delivery"}</strong>

              <small>{timing}</small>

            </span>



            <span className="delivery-slot-check">

              {selectedSlot === slotId && <Check size={16} />}

            </span>

          </button>

        );

      })}

    </div>

  )}

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

                              onClick={() => setSelectedPayment(method.name)}

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

                     {selectedPayment === "Credit / Debit Card" && (

                        <div className="payment-details">

                           <h3>Secure card payment</h3>

                           <p>

                              Razorpay Checkout will securely collect your card details.

                              Never enter your card number or CVV directly on this website.

                           </p>

                        </div>

                     )}

                     {selectedPayment === "UPI ID" && (

                        <div className="payment-details">

                           <h3>UPI payment</h3>

                           <p>

                              Continue through Razorpay Checkout to use supported UPI

                              payment options. Never enter your UPI PIN on this website.

                           </p>

                        </div>

                     )}

                     {selectedPayment === "QR Code" && (

                        <div className="payment-details">

                           <h3>Secure QR payment</h3>

                           <p>

                              After placing your order, scan the Razorpay QR code using

                              a supported UPI app.

                           </p>

                           <small>

                              The order remains pending until the server verifies payment.

                           </small>

                        </div>

                     )}

                     {selectedPayment === "Cash on Delivery" && (

                        <div className="payment-details payment-cod">

                           <Banknote size={22} />

                           <div>

                              <h3>Cash on Delivery</h3>

                              <p>Pay in cash when your order is delivered.</p>

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

                           key={`${product._id || product.id || product.name}-${index}`}

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

                           <strong>

                              ₹{Number(product.price || 0) * Number(product.quantity || 0)}

                           </strong>

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

                        <span>{couponsLoading ? "Loading active coupons…" : "Available offers:"}</span>

                        {!couponsLoading && availableCoupons.length === 0 && (

                           <small>No active coupons available right now.</small>

                        )}

                        {availableCoupons.map((coupon) => (

                           <button

                              key={coupon._id || coupon.id || coupon.code}

                              type="button"

                              title={coupon.description || coupon.title || coupon.code}

                              onClick={() => {

                                 setPromoInput(String(coupon.code).toUpperCase());

                                 setPromoMessage("");

                                 setPromoError(false);

                              }}

                              disabled={Boolean(appliedPromo)}

                           >

                              {String(coupon.code).toUpperCase()}

                              {coupon.discountType && coupon.discountValue != null

                                 ? ` · ${String(coupon.discountType).toLowerCase() === "percentage" || String(coupon.discountType).toLowerCase() === "percent" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}`

                                 : ""}

                           </button>

                        ))}

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

                  {minimumOrderNotMet && (

                     <p className="checkout-error" role="alert">

                        Add ₹{minimumOrder - cartSubtotal} more to meet this area's minimum order of ₹{minimumOrder}.

                     </p>

                  )}

                  <div className="checkout-summary-total">

                     <span>Total</span>

                     <strong>₹{cartTotal}</strong>

                  </div>

                  <button

                     type="button"

                     className="place-order-button"

                     onClick={handlePlaceOrder}

                     disabled={isPlacingOrder || settingsLoading || deliveryLoading || !deliveryZone || Boolean(deliveryError) || minimumOrderNotMet || !selectedSlot || !selectedPayment || !paymentMethods.some((method) => method.name === selectedPayment)}

                  >

                     {isPlacingOrder ? "Processing..." : "Place Order"}

                     {!isPlacingOrder && <ArrowRight size={18} />}

                  </button>

                  <div className="checkout-security">

                     <div>

                        <LockKeyhole size={16} />

                        <span>Secure checkout</span>

                     </div>

                     <div>

                        <ShieldCheck size={16} />

                        <span>Payments verified by the server</span>

                     </div>

                  </div>

               </aside>

            </div>

         </div>

      </main>

   );

}

export default Checkout;


const Razorpay = require("razorpay");

const hasCredentials =
  Boolean(process.env.RAZORPAY_KEY_ID) &&
  Boolean(process.env.RAZORPAY_KEY_SECRET);

let razorpay;

if (hasCredentials) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("Razorpay initialized successfully.");
} else {
  console.warn(
    "Razorpay is disabled. Payment operations are unavailable until credentials are configured."
  );

  const unavailable = new Proxy(
    function () {
      throw new Error(
        "Payment service is unavailable. Please configure Razorpay credentials."
      );
    },
    {
      get() {
        return unavailable;
      },
      apply() {
        throw new Error(
          "Payment service is unavailable. Please configure Razorpay credentials."
        );
      },
    }
  );

  razorpay = new Proxy(
    {},
    {
      get(_target, property) {
        if (property === "isConfigured") {
          return false;
        }

        return unavailable;
      },
    }
  );
}

module.exports = razorpay;

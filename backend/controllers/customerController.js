const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const crypto = require("crypto");
const nodemailer = require("nodemailer");


// POST /api/customers/register
const registerCustomer = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !mobile?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile, and password are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobile.trim();

    if (normalizedName.length < 2 || normalizedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!/^\+?[0-9]{10,15}$/.test(normalizedMobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid mobile number containing 10 to 15 digits.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must not exceed 72 characters.",
      });
    }

    // Check for an existing account
    const existingCustomer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name: normalizedName,
      email: normalizedEmail,
      mobile: normalizedMobile,
      password: hashedPassword,
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully.",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        status: customer.status,
        created_at: customer.created_at,
      },
    });
  } catch (error) {
    // Handle duplicate email even if two requests arrive simultaneously
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Customer registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register customer at this time.",
    });
  }
};


const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
) {
    return res.status(400).json({
        success: false,
        message: "Email and password are required."
    });
}

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication is not configured.",
      });
    }

    // Password is excluded by default in the Customer model.
    const customer = await Customer.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    // Use the same response for an unknown email and wrong password.
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      customer.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (customer.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
      });
    }

    const token = jwt.sign(
      {
        id: customer._id.toString(),
        email: customer.email,
        role: "customer",
        type: "customer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Customer login successful.",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        status: customer.status,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time.",
    });
  }
};


const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);

    if (!customer || customer.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active customer account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        status: customer.status,
        created_at: customer.created_at,
      },
    });
  } catch (error) {
    console.error("Get customer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customer profile.",
    });
  }
};

const updateCustomerProfile = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    const updates = {};

    if (name === undefined && mobile === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field: name or mobile.",
      });
    }

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 100 characters.",
        });
      }

      updates.name = name.trim();
    }

    if (mobile !== undefined) {
      if (
        typeof mobile !== "string" ||
        !/^\+?[0-9]{10,15}$/.test(mobile.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid mobile number containing 10 to 15 digits.",
        });
      }

      updates.mobile = mobile.trim();
    }

    const customer = await Customer.findByIdAndUpdate(
      req.customer._id,
      { $set: updates },
{ returnDocument: "after", runValidators: true }    );

    if (!customer || customer.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active customer account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully.",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        status: customer.status,
        created_at: customer.created_at,
      },
    });
  } catch (error) {
    console.error("Update customer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer profile.",
    });
  }
};

// =====================================================
// FORGOT PASSWORD
// POST /api/customers/forgot-password
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const customer = await Customer.findOne({
      email,
      status: "active",
    }).select("+resetPasswordToken +resetPasswordExpires");

    // Do not reveal whether an email is registered.
    const genericResponse = {
      success: true,
      message:
        "If an account exists for this email, a password reset link will be sent shortly.",
    };

    if (!customer) {
      return res.status(200).json(genericResponse);
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASS ||
      !process.env.FRONTEND_URL
    ) {
      console.error("Password reset email configuration is incomplete.");

      return res.status(500).json({
        success: false,
        message: "Password reset email service is not configured.",
      });
    }

    // Generate a secure random token.
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store only the hashed token in MongoDB.
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Reset link expires in 15 minutes.
    customer.resetPasswordToken = hashedToken;
    customer.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await customer.save();

    const resetUrl =
      `${process.env.FRONTEND_URL.replace(/\/+$/, "")}` +
      `/reset-password/${resetToken}`;

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from:
          process.env.EMAIL_FROM ||
          process.env.SMTP_USER,

        to: customer.email,

        subject: "Reset Your Online Grocery Password",

        text: `
Hello ${customer.name},

We received a request to reset your Online Grocery account password.

Use the link below to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset, please ignore this email.

Online Grocery Team
        `,

        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #333;">
            <h2 style="color: #198754;">Reset Your Password</h2>

            <p>Hello ${customer.name},</p>

            <p>
              We received a request to reset your Online Grocery account password.
            </p>

            <p>
              Click the button below to create a new password.
            </p>

            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 22px;
                background: #198754;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
              "
            >
              Reset Password
            </a>

            <p style="margin-top: 24px;">
              This link expires in <strong>15 minutes</strong>.
            </p>

            <p>
              If you did not request this password reset, you can safely ignore this email.
            </p>

            <p>Online Grocery Team</p>
          </div>
        `,
      });
    } catch (mailError) {
      // Invalidate the token if the email could not be sent.
      customer.resetPasswordToken = undefined;
      customer.resetPasswordExpires = undefined;
      await customer.save();

      console.error("Password reset email error:", mailError);

      return res.status(500).json({
        success: false,
        message: "Unable to send the password reset email. Please try again later.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your password reset request.",
    });
  }
};


// =====================================================
// RESET PASSWORD
// POST /api/customers/reset-password/:token
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body || {};

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is required.",
      });
    }

    if (
      typeof password !== "string" ||
      typeof confirmPassword !== "string" ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are required.",
      });
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({
        success: false,
        message: "Password must contain between 8 and 72 characters.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const customer = await Customer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
      status: "active",
    }).select("+password +resetPasswordToken +resetPasswordExpires");

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "This password reset link is invalid or has expired.",
      });
    }

    customer.password = await bcrypt.hash(password, 12);

    // A reset token must work only once.
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Your password has been reset successfully. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again.",
    });
  }
};


module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  forgotPassword,
  resetPassword,
};


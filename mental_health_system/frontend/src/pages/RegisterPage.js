import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";

/**
 * Create-an-account page.
 * Client-side validation, inline field errors, banner for API errors.
 * On success: redirect to /login with a friendly notice.
 */
export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Please choose a username.";
    if (!form.email.trim()) {
      errs.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "That doesn't look like a valid email.";
    }
    if (!form.password) {
      errs.password = "Please choose a password.";
    } else if (form.password.length < 8) {
      errs.password = "Password should be at least 8 characters.";
    }
    if (form.password !== form.password2) {
      errs.password2 = "Passwords don't match.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBanner("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      navigate("/login", {
        state: { notice: "Account created! Please log in." },
      });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const mapped = {};
        Object.entries(apiErrors).forEach(([k, v]) => {
          mapped[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setFieldErrors(mapped);
        setBanner(
          err.response?.data?.message ||
            "Please check the highlighted fields."
        );
      } else {
        setBanner(
          err.response?.data?.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-auth-card fade-in">
      <h1
        style={{
          fontSize: 28,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Create your account
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 32,
          marginTop: 0,
        }}
      >
        Start tracking your emotional wellness journey
      </p>

      {banner && <div className="mt-banner-error">{banner}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label className="mt-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            className="mt-input"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
          {fieldErrors.username && (
            <div className="mt-field-error">{fieldErrors.username}</div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="mt-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-input"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          {fieldErrors.email && (
            <div className="mt-field-error">{fieldErrors.email}</div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="mt-label" htmlFor="password">
            Password
          </label>
          <div className="mt-input-wrap">
            <input
              id="password"
              name="password"
              type={showPwd ? "text" : "password"}
              className="mt-input"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              style={{ paddingRight: 64 }}
            />
            <button
              type="button"
              className="mt-input-toggle"
              onClick={() => setShowPwd((v) => !v)}
              tabIndex={-1}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password && (
            <div className="mt-field-error">{fieldErrors.password}</div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="mt-label" htmlFor="password2">
            Confirm Password
          </label>
          <div className="mt-input-wrap">
            <input
              id="password2"
              name="password2"
              type={showPwd2 ? "text" : "password"}
              className="mt-input"
              value={form.password2}
              onChange={handleChange}
              autoComplete="new-password"
              style={{ paddingRight: 64 }}
            />
            <button
              type="button"
              className="mt-input-toggle"
              onClick={() => setShowPwd2((v) => !v)}
              tabIndex={-1}
            >
              {showPwd2 ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrors.password2 && (
            <div className="mt-field-error">{fieldErrors.password2}</div>
          )}
        </div>

        <button type="submit" className="mt-btn" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <div className="mt-divider">or</div>

        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 14,
            margin: 0,
          }}
        >
          Already have an account?{" "}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

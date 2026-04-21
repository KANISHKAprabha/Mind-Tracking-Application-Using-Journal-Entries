import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

/**
 * Welcome-back login page.
 * Validates input, banner for API errors, redirects to /dashboard on success.
 */
export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [banner, setBanner] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Please enter your username.";
    if (!form.password) errs.password = "Please enter your password.";
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
      const res = await login(form);
      saveAuth(res.data.data);
      navigate("/dashboard");
    } catch (err) {
      setBanner(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-auth-card fade-in">
      <h1 style={{ fontSize: 28, textAlign: "center", marginBottom: 8 }}>
        Welcome back
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
        Log in to continue your wellness journey
      </p>

      {notice && <div className="mt-banner-success">{notice}</div>}
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

        <div style={{ marginBottom: 24 }}>
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
              autoComplete="current-password"
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

        <button type="submit" className="mt-btn" disabled={submitting}>
          {submitting ? "Logging in..." : "Log In"}
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
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Persistent navbar across all pages.
 * Shows different links depending on whether the user is signed in.
 */
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      <Link
        to={isAuthenticated ? "/dashboard" : "/login"}
        style={brandStyle}
      >
        MindTrack
      </Link>

      <div style={rightStyle}>
        {isAuthenticated ? (
          <>
            <NavLink to="/journal" style={navLinkStyle}>
              Journal
            </NavLink>
            <NavLink to="/dashboard" style={navLinkStyle}>
              Dashboard
            </NavLink>
            <span style={usernameStyle}>{user?.username}</span>
            <button
              onClick={handleLogout}
              style={logoutBtnStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={navLinkStyle}>
              Login
            </NavLink>
            <NavLink to="/register" style={navLinkStyle}>
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  height: 56,
  padding: "0 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background:
    "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",
  boxShadow: "0 2px 12px rgba(99,102,241,0.15)",
};

const brandStyle = {
  fontFamily: '"DM Serif Display", Georgia, serif',
  fontSize: 20,
  color: "#ffffff",
  letterSpacing: "-0.01em",
  textDecoration: "none",
};

const rightStyle = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const navLinkStyle = ({ isActive }) => ({
  color: "#ffffff",
  opacity: isActive ? 1 : 0.8,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
  textUnderlineOffset: 6,
  borderBottom: isActive ? "1.5px solid #ffffff" : "1.5px solid transparent",
  paddingBottom: 2,
  transition: "opacity 0.2s ease",
});

const usernameStyle = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 500,
  opacity: 0.95,
};

const logoutBtnStyle = {
  background: "transparent",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: 10,
  padding: "6px 16px",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: '"DM Sans", sans-serif',
  transition: "all 0.2s ease",
};

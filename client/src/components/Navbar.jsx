import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userEmail = localStorage.getItem("email");
  const userRole = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-gray-100 shadow-md px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Brand & Links */}
        <div className="flex items-center gap-6 font-medium text-sm">
          <Link
            to="/"
            className="text-lg font-bold text-gray-100 hover:text-gray-400 transition"
          >
            HelpDesk
          </Link>

          {!token && (
            <>
              <Link
                to="/"
                className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
              >
                Register
              </Link>
            </>
          )}

          {token && (
            <>
              {userRole === "user" && (
                <Link
                  to="/tickets"
                  className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
                >
                  My Tickets
                </Link>
              )}

              {userRole === "agent" && (
                <Link
                  to="/agent/tickets"
                  className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
                >
                  Assigned Tickets
                </Link>
              )}

              <Link
                to="/kb"
                className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
              >
                Knowledge Base
              </Link>

              {userRole === "admin" && (
                <>
                  <Link
                    to="/admin/tickets"
                    className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
                  >
                    Manage Tickets
                  </Link>
                  <Link
                    to="/admin/kb"
                    className="hover:bg-gray-800 px-3 py-1 rounded-md transition"
                  >
                    KB Management
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Right: User Info / Logout */}
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="text-sm bg-gray-800 px-2 py-1 rounded-md">
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <span className="text-sm italic text-gray-400">Not logged in</span>
          )}
        </div>
      </div>
    </nav>
  );
}

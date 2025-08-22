import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email);

      // Role-based redirection
      if (res.data.role === "admin") navigate("/admin/tickets");
      else if (res.data.role === "agent") navigate("/agent/tickets");
      else navigate("/tickets");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="bg-gray-900 bg-opacity-70 backdrop-blur-md p-8 rounded-2xl shadow-lg w-96 border border-gray-700">
        <h1 className="text-3xl font-extrabold text-white text-center mb-6">
          LOGIN
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input type="checkbox" className="accent-orange-400" />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-orange-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 text-black font-bold p-3 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>

        <p className="text-gray-400 text-center text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-orange-400 hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);

      navigate("/tickets");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="bg-gray-900 shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-700">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          CREATE ACCOUNT
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-400 focus:outline-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-orange-400 hover:bg-orange-500 text-black font-bold py-3 rounded-lg transition duration-300"
          >
            Register
          </button>
        </form>

        {/* Login Redirect */}
        {/* <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-400 hover:underline">
            Login here
          </Link>
        </p> */}
      </div>
    </div>
  );
}

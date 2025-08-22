import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });

  const fetchTickets = async () => {
    try {
      const res = await API.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tickets", form);
      setForm({ title: "", description: "" });
      fetchTickets();
    } catch (err) {
      alert("Error creating ticket");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Tickets</h1>

      {/* Create Ticket Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          name="title"
          placeholder="Ticket Title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Describe your issue"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Create Ticket
        </button>
      </form>

      {/* Ticket List */}
      <ul className="space-y-3">
        {tickets.map((t) => (
          <li key={t._id} className="border p-4 rounded shadow-sm">
            <Link to={`/tickets/${t._id}`} className="block">
              <h2 className="font-semibold">{t.title}</h2>
              <p className="text-sm text-gray-700">{t.description}</p>
              <p className="text-xs text-gray-500">Status: {t.status}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

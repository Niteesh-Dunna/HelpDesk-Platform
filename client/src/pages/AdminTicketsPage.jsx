import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await API.get("/tickets"); // backend returns ALL tickets if admin
      setTickets(res.data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await API.put(`/tickets/${id}`, { status });
      fetchTickets();
    } catch (err) {
      alert("Error updating ticket");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Tickets</h1>
      <ul className="space-y-4">
        {tickets.map((t) => (
          <li key={t._id} className="border p-4 rounded shadow-sm">
            <p>
              <strong>User:</strong> {t.createdBy?.name} ({t.createdBy?.email})
            </p>
            <p>
              <strong>Title:</strong> {t.title}
            </p>
            <p>
              <strong>Status:</strong> {t.status}
            </p>

            <select
              value={t.status}
              onChange={(e) => handleStatusChange(t._id, e.target.value)}
              className="border p-1 mt-2"
            >
              <option value="open">Open</option>
              <option value="triaged">Triaged</option>
              <option value="waiting_human">Waiting Human</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <div className="mt-3">
              <Link
                to={`/tickets/${t._id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Details →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

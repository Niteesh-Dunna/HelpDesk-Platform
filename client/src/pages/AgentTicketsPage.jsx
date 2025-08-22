import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function AgentTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await API.get("/tickets/assigned"); // tickets assigned to this agent
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  if (loading)
    return (
      <p className="text-gray-400 text-center mt-10">Loading tickets...</p>
    );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">
        Assigned Tickets
      </h1>
      {tickets.length === 0 ? (
        <p className="text-gray-400">No tickets assigned.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket._id}
              className="bg-gray-800 p-4 rounded-md shadow hover:bg-gray-700 transition"
            >
              <Link
                to={`/agent/tickets/${ticket._id}`}
                className="flex justify-between items-center text-gray-100"
              >
                <span className="font-medium">{ticket.title}</span>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    ticket.status === "Open"
                      ? "bg-yellow-500 text-gray-900"
                      : ticket.status === "In-Progress"
                      ? "bg-blue-500 text-gray-100"
                      : "bg-green-500 text-gray-100"
                  }`}
                >
                  {ticket.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function AgentTicketDetailPage() {
  const { id } = useParams(); // ticketId
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyBody, setReplyBody] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
      setMessages(res.data.messages || []);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/tickets/${id}/reply`, { body: replyBody, status });
      setReplyBody("");
      await fetchTicket();
    } catch (err) {
      alert("Error sending reply");
    }
  };

  const handleAssignSelf = async () => {
    try {
      await API.post(`/tickets/${id}/assign`, { assignedTo: "self" }); // backend should interpret 'self' as current agent
      alert("Ticket assigned to you");
      await fetchTicket();
    } catch (err) {
      console.error(err);
      alert("Error assigning ticket");
    }
  };

  useEffect(() => {
    fetchTicket().finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="text-gray-400 text-center mt-10">Loading ticket...</p>;
  if (!ticket)
    return <p className="text-red-500 text-center mt-10">Ticket not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Ticket Info */}
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md shadow mb-6">
        <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
        <p className="mb-2">{ticket.description}</p>
        <p className="text-sm text-gray-400">
          Category: {ticket.category || "N/A"} | Status: {ticket.status}
        </p>
        <p className="text-sm text-gray-400">
          Created By: {ticket.createdBy?.name} ({ticket.createdBy?.email})
        </p>
        <button
          onClick={handleAssignSelf}
          className="mt-3 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md"
        >
          Assign to Me
        </button>
      </div>

      {/* Messages */}
      <div className="bg-gray-800 text-gray-100 p-6 rounded-md shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        {messages.length === 0 ? (
          <p className="text-gray-400">No messages yet</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((m, idx) => (
              <li key={idx} className="bg-gray-900 p-3 rounded-md">
                <div className="text-sm text-gray-400 mb-1">
                  <strong>{m.actor}</strong> •{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div>{m.body}</div>
              </li>
            ))}
          </ul>
        )}

        {/* Reply Form */}
        <form onSubmit={handleReplySubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write your reply..."
            className="p-3 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 rounded-md bg-gray-900 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            <option>Open</option>
            <option>In-Progress</option>
            <option>Resolved</option>
          </select>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md">
            Send Reply
          </button>
        </form>
      </div>
    </div>
  );
}

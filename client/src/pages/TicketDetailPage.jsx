import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

export default function TicketDetailPage() {
  const { id } = useParams(); // ticketId from URL
  const [ticket, setTicket] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");

  // Fetch ticket
  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error("Error fetching ticket:", err);
    }
  };

  // Fetch audit logs
  const fetchAudit = async () => {
    try {
      const res = await API.get(`/tickets/${id}/audit`);
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/tickets/${id}/reply`, { body: replyBody });
      setReplyBody("");
      await fetchTicket();
      await fetchAudit();
    } catch (err) {
      alert("Error sending reply");
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchTicket(), fetchAudit()]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading ticket...</p>;
  }

  if (!ticket) {
    return <p className="p-6 text-red-500">Ticket not found</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ticket Detail</h1>

      {/* Ticket Info */}
      <div className="border rounded p-4 mb-6 shadow-sm">
        <p>
          <strong>Title:</strong> {ticket.title}
        </p>
        <p>
          <strong>Description:</strong> {ticket.description}
        </p>
        <p>
          <strong>Status:</strong> {ticket.status}
        </p>
        <p>
          <strong>Category:</strong> {ticket.category || "N/A"}
        </p>
        <p>
          <strong>User:</strong> {ticket.createdBy?.name} (
          {ticket.createdBy?.email})
        </p>
      </div>

      {/* Messages */}
      <div className="border rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Messages</h2>
        {ticket.messages?.length > 0 ? (
          <ul className="space-y-2">
            {ticket.messages.map((m, idx) => (
              <li key={idx} className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-500">
                  <strong>{m.actor}</strong> •{" "}
                  {new Date(m.createdAt).toLocaleString()}
                </div>
                <div className="mt-1 whitespace-pre-line">{m.body}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No messages yet</p>
        )}

        {/* Reply Form */}
        <form onSubmit={handleReplySubmit} className="mt-4 flex gap-2">
          <textarea
            className="border p-2 rounded flex-grow"
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Write reply..."
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Send
          </button>
        </form>
      </div>

      {/* Audit Logs */}
      <div className="border rounded p-4 shadow-sm">
        <h2 className="font-semibold text-lg mb-2">Audit Timeline</h2>
        {auditLogs.length > 0 ? (
          <ul className="space-y-2">
            {auditLogs.map((log) => (
              <li key={log._id} className="border-b pb-2">
                <p>
                  <strong>{log.action}</strong> by {log.actor} at{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </p>
                {Object.keys(log.meta || {}).length > 0 && (
                  <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-1">
                    {JSON.stringify(log.meta, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No audit logs yet.</p>
        )}
      </div>
    </div>
  );
}

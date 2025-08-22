import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminKBPage() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({
    title: "",
    body: "",
    tags: "",
    status: "draft",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchArticles = async () => {
    try {
      const res = await API.get("/kb?query=");
      setArticles(res.data);
    } catch (err) {
      console.error("Error fetching KBs:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await API.put(`/kb/${editingId}`, {
          ...form,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        });
      } else {
        // Create
        await API.post("/kb", {
          ...form,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        });
      }
      setForm({ title: "", body: "", tags: "", status: "draft" });
      setEditingId(null);
      fetchArticles();
    } catch (err) {
      console.error("Error saving article:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error saving article");
    }
  };

  const handleEdit = (article) => {
    setForm({
      title: article.title,
      body: article.body,
      tags: article.tags?.join(", ") || "",
      status: article.status,
    });
    setEditingId(article._id);
  };

  const handleCancelEdit = () => {
    setForm({ title: "", body: "", tags: "", status: "draft" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await API.delete(`/kb/${id}`);
      fetchArticles();
    } catch (err) {
      console.error(
        "Error deleting article:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Error deleting article");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">KB Management</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <textarea
          name="body"
          placeholder="Body"
          value={form.body}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Article" : "Add Article"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* List */}
      <ul className="space-y-3">
        {articles.map((a) => (
          <li
            key={a._id}
            className="border p-4 rounded shadow-sm flex justify-between items-start"
          >
            <div>
              <h2 className="font-semibold">{a.title}</h2>
              <p className="text-sm text-gray-700">{a.body}</p>
              <p className="text-xs text-gray-500">
                Tags: {a.tags?.join(", ")} | Status: {a.status}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(a)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(a._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

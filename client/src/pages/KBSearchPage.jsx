import { useEffect, useState } from "react";
import API from "../services/api";

export default function KBSearchPage() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState([]);

  const fetchArticles = async () => {
    try {
      const res = await API.get(`/kb?query=${query}`);
      setArticles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []); // fetch on load

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Knowledge Base</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border p-2 rounded flex-grow"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {/* Articles */}
      {articles.length === 0 ? (
        <p className="text-gray-500">No articles found.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((a) => (
            <li key={a._id} className="border p-4 rounded shadow-sm">
              <h2 className="font-semibold text-lg">{a.title}</h2>
              <p className="text-sm text-gray-700">{a.body}</p>
              <p className="text-xs text-gray-500">
                Tags: {a.tags.join(", ")} | Status: {a.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

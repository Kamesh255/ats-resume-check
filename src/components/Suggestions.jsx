import React from "react";

const Suggestions = ({ suggestions }) => {
  return (
    <div className="mt-4">
      <h4>Suggestions</h4>
      <ul className="list-group">
        {suggestions.map((s, i) => (
          <li key={i} className="list-group-item">
            <p className="mb-1 text-danger">❌ {s.original}</p>
            <p className="mb-0 text-success">✅ {s.suggested}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Suggestions;

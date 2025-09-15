import React from "react";

const ResumeUpload = ({ text, setText }) => {
  return (
    <div className="mb-4">
      <label className="form-label fw-bold">Paste Your Resume</label>
      <textarea
        className="form-control"
        rows="8"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your resume text here..."
      ></textarea>
    </div>
  );
};

export default ResumeUpload;

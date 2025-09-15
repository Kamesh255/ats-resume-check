import React from "react";

const ScoreDisplay = ({ score }) => {
  return (
    <div className="my-4">
      <h4>ATS Score: {score}%</h4>
      <div className="progress">
        <div
          className={`progress-bar ${score > 70 ? "bg-success" : "bg-warning"}`}
          role="progressbar"
          style={{ width: `${score}%` }}
          aria-valuenow={score}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {score}%
        </div>
      </div>
    </div>
  );
};

export default ScoreDisplay;

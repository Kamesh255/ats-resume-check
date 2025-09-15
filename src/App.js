import React, { useState } from "react";
import ScoreDisplay from "./components/ScoreDisplay";
import Suggestions from "./components/Suggestions";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import htmlDocx from "html-docx-js/dist/html-docx";

// ✅ Fix PDF.js worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const REACT_APP_GEMINI_API_KEY = "AIzaSyD_qwgE79dfMn9trrFaJItZP5wHgGvjUt4"; // replace with .env in production
const genAI = new GoogleGenerativeAI(REACT_APP_GEMINI_API_KEY);

function App() {
  const [resumeText, setResumeText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [score, setScore] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 📌 Handle File Upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileType = file.type;

    try {
      if (fileType === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async function () {
          const typedArray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let textContent = "";
          for (const i of Array(pdf.numPages).keys()) {
            const page = await pdf.getPage(i + 1);
            const text = await page.getTextContent();
            text.items.forEach((item) => (textContent += item.str + " "));
          }
          setResumeText(textContent.trim());
        };
        reader.readAsArrayBuffer(file);
      } else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const reader = new FileReader();
        reader.onload = async function () {
          const result = await mammoth.extractRawText({ arrayBuffer: this.result });
          setResumeText(result.value.trim());
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please upload a PDF or DOCX (.docx only) file.");
      }
    } catch (err) {
      console.error("File parsing error:", err);
      alert("Failed to read the file. Please try again.");
    }
  };

  // 📌 Analyze & Correct Resume using Gemini AI
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please upload a resume file first.");
      return;
    }

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an ATS resume optimizer.
1. Correct grammar, formatting, and improve ATS points.
2. Suggest improvements in JSON:
{
  "score": number,
  "suggestions": [
    { "original": string, "suggested": string }
  ],
  "corrected_resume": string
}

Resume: ${resumeText}`;

      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      // ✅ Safe JSON parse
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");

      const parsed = JSON.parse(jsonMatch[0]);

      setScore(parsed.score);
      setSuggestions(parsed.suggestions || []);
      setCorrectedText(parsed.corrected_resume || resumeText);
    } catch (error) {
      console.error("AI analyze error:", error);
      alert("AI could not analyze resume. Try again.");
    }
    setLoading(false);
  };

  // 📌 Export corrected PDF
  const exportPDF = () => {
    if (!correctedText.trim()) return alert("Nothing to export");
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(correctedText, 180);
    doc.text(lines, 10, 10);
    doc.save("Corrected_Resume.pdf");
  };

  // 📌 Export corrected Word
  const exportWord = () => {
    if (!correctedText.trim()) return alert("Nothing to export");
    const html = `<html><body><pre>${correctedText}</pre></body></html>`;
    const converted = htmlDocx.asBlob(html);
    saveAs(converted, "Corrected_Resume.docx");
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">ATS Resume Checker & Corrector (AI)</h1>

      {/* File Upload Only */}
      <div className="mb-3">
        <label className="form-label fw-bold">Upload Resume (PDF/DOCX)</label>
        <input
          type="file"
          className="form-control"
          accept=".pdf,.docx"
          onChange={handleFileUpload}
        />
      </div>

      <div className="mt-3 d-flex flex-wrap justify-content-center align-items-center gap-4">
        <button
          onClick={handleAnalyze}
          className="btn btn-primary me-2"
          disabled={loading || !resumeText.trim()}
        >
          {loading ? "Analyzing..." : "Analyze & Correct Resume"}
        </button>

        {/* <button
          onClick={exportPDF}
          className="btn btn-success me-2"
          disabled={!correctedText.trim()}
        >
          Export Corrected PDF
        </button>

        <button
          onClick={exportWord}
          className="btn btn-secondary"
          disabled={!correctedText.trim()}
        >
          Export Corrected Word
        </button> */}
      </div>

      {score !== null && <ScoreDisplay score={score} />}
      {suggestions.length > 0 && <Suggestions suggestions={suggestions} />}
    </div>
  );
}

export default App;

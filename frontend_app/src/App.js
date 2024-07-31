import React, { useState } from "react";
import axios from "axios";

const Section = ({ title, children, className }) => (
  <div
    className={`bg-white p-6 border border-gray-300 rounded-lg shadow-md ${className}`}
  >
    <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
    {children}
  </div>
);

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const [problems, setProblems] = useState("");
  const [text, setText] = useState("");
  const [explanation, setExplanation] = useState("");
  const [image, setImage] = useState(null);
  const [imageQuestion, setImageQuestion] = useState("");
  const [imageSummary, setImageSummary] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [fileQuestion, setFileQuestion] = useState("");
  const [fileResponse, setFileResponse] = useState("");

  const handleQuestionSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/query", {
        question,
      });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error fetching answer:", error);
    }
  };

  const handlePracticeSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/practice", {
        topic,
      });
      setProblems(response.data.problems);
    } catch (error) {
      console.error("Error fetching practice problems:", error);
    }
  };

  const handleExplainSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/explain", {
        text,
      });
      setExplanation(response.data.explanation);
    } catch (error) {
      console.error("Error fetching explanation:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageQuestionSubmit = async () => {
    const formData = new FormData();
    formData.append("question", imageQuestion);
    if (image) formData.append("image", image);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/image",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImageSummary(response.data.imageSummary);
    } catch (error) {
      console.error("Error fetching image summary:", error);
    }
  };

  const onFileChange = (e) => setFile(e.target.files[0]);

  const onFileQuestionChange = (e) => setFileQuestion(e.target.value);

  const onFileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileQuestion", fileQuestion);

    try {
      const result = await axios.post(
        "http://localhost:3001/api/document",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setFileResponse(result.data.answer);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500  min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
        Generative AI Powered Chatbot
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <Section title="Ask a Question" className="bg-red-200">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
          />
          <button
            onClick={handleQuestionSubmit}
            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>
          {answer && (
            <div className="mt-4 bg-gray-50 p-4 border border-gray-300 rounded-lg max-h-80 overflow-auto">
              <strong className="block text-gray-800">Answer:</strong>
              <pre className="whitespace-pre-wrap break-words">{answer}</pre>
            </div>
          )}
        </Section>

        <Section
          title="Provide Explanation or Summary"
          className="bg-green-200"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text for explanation or summary"
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
            rows="5"
          />
          <button
            onClick={handleExplainSubmit}
            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
          >
            Get Explanation
          </button>
          {explanation && (
            <div className="mt-4 bg-gray-50 p-4 border border-gray-300 rounded-lg max-h-80 overflow-auto">
              <strong className="block text-gray-800">Explanation:</strong>
              <pre className="whitespace-pre-wrap break-words">
                {explanation}
              </pre>
            </div>
          )}
        </Section>

        <Section title="Upload and Ask" className="bg-red-100">
          <form onSubmit={onFileSubmit}>
            <input type="file" onChange={onFileChange} className="mb-4" />
            <input
              type="text"
              placeholder="Ask a question about the document"
              value={fileQuestion}
              onChange={onFileQuestionChange}
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
            >
              Upload and Ask
            </button>
          </form>
          {fileResponse && (
            <div className="mt-4 bg-gray-50 p-4 border border-gray-300 rounded-lg max-h-80 overflow-auto">
              <strong className="block text-gray-800">Response:</strong>
              <pre className="whitespace-pre-wrap break-words">
                {fileResponse}
              </pre>
            </div>
          )}
        </Section>
      </div>
      <div className="flex items-center justify-center mt-5 ">
        <Section
          title="Discover Image Insights"
          className="bg-blue-200 mt-5 p-6 w-3/4 justify-center"
        >
          <input
            type="text"
            value={imageQuestion}
            onChange={(e) => setImageQuestion(e.target.value)}
            placeholder="Ask your question related to the uploaded image."
            className="w-full p-3 border border-gray-300 rounded-md mb-4"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4"
          />
          <button
            onClick={handleImageQuestionSubmit}
            className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700"
          >
            Submit
          </button>

          {/* Flex container for image preview and summary */}

          <div className="mt-4 flex justify-center gap-6">
            {/* Image Preview */}
            {imagePreview && (
              <div className="flex flex-col items-center w-1/2 ">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 text-center">
                  Image Preview
                </h3>
                <div className="h-auto w-auto bg-pink-200 mt-4">
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    className="w-auto h-auto border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Image Summary */}
            {imageSummary && (
              <div className="flex flex-col items-center w-1/2">
                <h3 className="text-xl font-semibold mb-2 text-gray-800 text-center">
                  Response:
                </h3>
                <div className="bg-gray-50 p-4 border border-gray-300 rounded-lg max-h-80 overflow-auto mt-4">
                  <pre className="whitespace-pre-wrap break-words">
                    {imageSummary}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

export default App;

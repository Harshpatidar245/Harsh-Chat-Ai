import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;

    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion(""); // Clear input immediately after sending

    // Add user question to chat history
    setChatHistory((prev) => [...prev, { type: "question", content: currentQuestion }]);

    try {
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${
          import.meta.env.VITE_API_KEY
        }`,
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      const aiResponse = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
      setChatHistory((prev) => [...prev, { type: "answer", content: aiResponse }]);
      setAnswer(aiResponse);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="Ai_Container">
      <div className="chat_wrapper">
        {/* Fixed Header */}
        <header className="header">
          <a href="https://github.com/Vishesh-Pandey/chat-ai" target="_blank" rel="noopener noreferrer">
            <h1 className="header_title">Chat AI</h1>
          </a>
        </header>

        {/* Scrollable Chat Container */}
        <div ref={chatContainerRef} className="chat_container">
          {chatHistory.length === 0 ? (
            <div className="welcome_container">
              <div className="welcome_message">
                <h2 className="welcome_title">Welcome to Chat AI! 👋</h2>
                <p className="welcome_text">I'm here to help you with anything you'd like to know. You can ask me about:</p>
                <div className="topics_container">
                  <div className="topic_item">💡 General knowledge</div>
                  <div className="topic_item">🔧 Technical questions</div>
                  <div className="topic_item">📝 Writing assistance</div>
                  <div className="topic_item">🤔 Problem solving</div>
                </div>
                <p className="instructions">Just type your question below and press Enter or click Send!</p>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((chat, index) => (
                <div key={index} className={`chat_bubble ${chat.type}`}>
                  <div className={`chat_text ${chat.type}`}>
                    <ReactMarkdown>{chat.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </>
          )}
          {generatingAnswer && (
            <div className="thinking_bubble text-left">
              <div className="thinking_text inline-block bg-gray-200 p-2 rounded-lg animate-pulse text-sm">Thinking...</div>
            </div>
          )}
        </div>

        {/* Fixed Input Form */}
        <form onSubmit={generateAnswer} className="input_form">
          <div className="input_wrapper">
            <input
              required
              className="input_area"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></input>
            <button type="submit" className={`send_button ${generatingAnswer ? "disabled" : ""}`} disabled={generatingAnswer}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;

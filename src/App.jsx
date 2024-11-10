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
    setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);
    
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
      setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
      setAnswer(aiResponse);
    } catch (error) {
      console.log(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Chat AI</h1>
      </header>

      <div ref={chatContainerRef} className="chat-container">
        {chatHistory.length === 0 ? (
          <div className="welcome-message">
            <h2>Welcome to Chat AI! 👋</h2>
            <p>I'm here to help. Ask me anything.</p>
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`chat-bubble ${chat.type === "question" ? "user" : "ai"}`}
            >
              <ReactMarkdown>{chat.content}</ReactMarkdown>
            </div>
          ))
        )}
        {generatingAnswer && <div className="chat-bubble ai">Thinking...</div>}
      </div>

      <form onSubmit={generateAnswer} className="input-form">
        <input
          required
          className="input-field"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              generateAnswer(e);
            }
          }}
        />
        <button type="submit" className="send-button" disabled={generatingAnswer}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;

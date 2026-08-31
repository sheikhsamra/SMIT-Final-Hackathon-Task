import { useEffect, useRef, useState } from "react";
import { getAssistantReply } from "../utils/assistantReplies";
import { IconChat, IconSend, IconSparkle, IconXCircle } from "./Icons";

const GREETING = "Hi! I'm the RelaySupport Assistant. Ask me how to submit a complaint, track a ticket, leave a review, or anything else about using this app.";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsTyping(true);

    // A short, randomized delay before replying is what actually sells the
    // "someone/something is thinking" illusion — an instant reply reads as
    // an obvious canned script.
    const delay = 500 + Math.random() * 700;
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", text: getAssistantReply(text) }]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <span className="chat-panel-icon"><IconSparkle /></span>
            <div className="chat-panel-title">
              <span>RelaySupport Assistant</span>
              <span className="chat-panel-status"><span className="live-dot" /> Online</span>
            </div>
            <button type="button" className="chat-panel-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <IconXCircle />
            </button>
          </div>

          <div className="chat-panel-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble bot chat-typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <form className="chat-panel-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={300}
            />
            <button type="submit" aria-label="Send" disabled={!input.trim() || isTyping}>
              <IconSend />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? <IconXCircle /> : <IconChat />}
      </button>
    </div>
  );
}

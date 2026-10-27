// // /chatbutton/chatbutton.js
// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'react-router-dom';
// import { SiRobotframework } from "react-icons/si";
// import { AiOutlineSend } from "react-icons/ai";
// import './ChatButton.css';

// const greetings = [
//   "Hey there! Cribby at your service. Looking for a home or just vibing?",
//   "Hi! Need help navigating your next PG or rental move?",
//   "Hey hey! Cribby lives to serve — what can I help you with today?"
// ];

// const LoadingBubble = () => (
//   <div className="message-row">
//     <div className="loading-bubble">
//       <div className="dot"></div>
//       <div className="dot"></div>
//       <div className="dot"></div>
//     </div>
//   </div>
// );

// const MessageBubble = ({ message }) => {
//   const isUser = message.sender === 'user';
//   const messageRowClass = isUser ? 'message-row user' : 'message-row ai';
//   const bubbleClass = isUser ? 'message-bubble user' : 'message-bubble ai';

//   return (
//     <div className={messageRowClass}>
//       <div className={bubbleClass}>
//         <p>{message.text}</p>
//       </div>
//     </div>
//   );
// };

// function ChatButton() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState(() => {
//     const randomIndex = Math.floor(Math.random() * greetings.length);
//     return [{ text: greetings[randomIndex], sender: 'ai' }];
//   });
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const location = useLocation();

//   // This effect now correctly resets the chat on every route change
//   useEffect(() => {
//     const randomIndex = Math.floor(Math.random() * greetings.length);
//     const newGreeting = greetings[randomIndex];
//     setMessages([{ text: newGreeting, sender: 'ai' }]);
//     setIsOpen(false); // Also close the chat window on navigation
//   }, [location.pathname]); // Depend only on the pathname

//   useEffect(() => {
//     if(isOpen) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages, loading, isOpen]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { text: input, sender: 'user' };
//     setMessages(m => [...m, userMessage]);
//     setInput('');
//     setLoading(true);

//     try {
//       const res = await fetch('http://localhost:3001/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({ message: userMessage.text })
//       });
//       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//       const data = await res.json();
//       setMessages(m => [...m, { text: data.response, sender: 'ai' }]);
//     } catch (err) {
//       console.error("Error fetching response:", err);
//       setMessages(m => [...m, { text: "Error fetching response", sender: 'ai' }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <>
//       <button
//         className="chat-overlay-button"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <SiRobotframework />
//         <span>Cribby</span>
//       </button>

//       {isOpen && (
//         <div className="chatbot-popup">
//           <div className="chatbot-header">
//             <span>CribBot</span>
//             <button onClick={() => setIsOpen(false)}>✖</button>
//           </div>

//           <div className="chat-container">
//             <main className="chat-box">
//               {messages.map((m, i) => (
//                 <MessageBubble key={i} message={m} />
//               ))}
//               {loading && <LoadingBubble />}
//               <div ref={messagesEndRef} />
//             </main>

//             <footer className="input-area">
//               <div className="input-wrapper">
//                 <input
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   onKeyDown={handleKeyPress}
//                   placeholder="Type a message..."
//                 />
//                 <button
//                   onClick={sendMessage}
//                   disabled={loading || !input.trim()}
//                   className="sendy-button"
//                 >
//                   <AiOutlineSend size={24} />
//                 </button>
//               </div>
//             </footer>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default ChatButton;

// /chatbutton/chatbutton.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SiRobotframework } from "react-icons/si";
import { AiOutlineSend } from "react-icons/ai";
import './ChatButton.css';

const greetings = [
  "Hey there! Cribby at your service. Looking for a home or just vibing?",
  "Hi! Need help navigating your next PG or rental move?",
  "Hey hey! Cribby lives to serve — what can I help you with today?"
];

const LoadingBubble = () => (
  <div className="message-row">
    <div className="loading-bubble">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </div>
);

const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  const messageRowClass = isUser ? 'message-row user' : 'message-row ai';
  const bubbleClass = isUser ? 'message-bubble user' : 'message-bubble ai';

  return (
    <div className={messageRowClass}>
      <div className={bubbleClass}>
        <p>{message.text}</p>
      </div>
    </div>
  );
};

function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return [{ text: greetings[randomIndex], sender: 'ai' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // This effect now correctly resets the chat on every route change
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const newGreeting = greetings[randomIndex];
    setMessages([{ text: newGreeting, sender: 'ai' }]);
    setIsOpen(false); // Also close the chat window on navigation
  }, [location.pathname]); // Depend only on the pathname

  useEffect(() => {
    if(isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(m => [...m, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // ⚠ CHANGE MADE HERE: Update the port to 5000
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage.text })
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setMessages(m => [...m, { text: data.response, sender: 'ai' }]);
    } catch (err) {
      console.error("Error fetching response:", err);
      setMessages(m => [...m, { text: "Error fetching response", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        className="chat-overlay-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SiRobotframework />
        <span>Cribby</span>
      </button>

      {isOpen && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <span>CribBot</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="chat-container">
            <main className="chat-box">
              {messages.map((m, i) => (
                <MessageBubble key={i} message={m} />
              ))}
              {loading && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </main>

            <footer className="input-area">
              <div className="input-wrapper">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="sendy-button"
                >
                  <AiOutlineSend size={24} />
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatButton;
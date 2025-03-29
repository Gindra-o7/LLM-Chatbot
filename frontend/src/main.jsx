import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from 'declarations/backend';
import botImg from '/bot.svg';
import userImg from '/user.svg';
import '/index.css';

const App = () => {
  const [chat, setChat] = useState([
    {
      role: { system: null },
      content: "I'm a sovereign AI agent living on the Internet Computer. Ask me anything."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState('dark'); // New theme state
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const askAgent = async (messages) => {
    try {
      const response = await backend.chat(messages);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        newChat.push({ role: { system: null }, content: response });
        return newChat;
      });
    } catch (e) {
      console.log(e);
      const eStr = String(e);
      const match = eStr.match(/(SysTransient|CanisterReject), \\+"([^\\"]+)/);
      if (match) {
        alert(match[2]);
      }
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: { user: null },
      content: inputValue
    };
    const thinkingMessage = {
      role: { system: null },
      content: 'Thinking ...'
    };
    setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
    setInputValue('');
    setIsLoading(true);
    const messagesToSend = chat.slice(1).concat(userMessage);
    askAgent(messagesToSend);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Theme-based styles
  const themeStyles = {
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      headerBg: 'bg-black',
      inputBg: 'bg-gray-800',
      botBubble: 'bg-gray-800',
      userBubble: 'bg-cyan-700',
      border: 'border-gray-700',
      accent: 'text-cyan-400',
      buttonBg: 'bg-cyan-600',
      buttonHover: 'hover:bg-cyan-700',
      secondaryText: 'text-gray-400'
    },
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-900',
      headerBg: 'bg-white',
      inputBg: 'bg-white',
      botBubble: 'bg-white',
      userBubble: 'bg-cyan-500',
      border: 'border-gray-300',
      accent: 'text-cyan-600',
      buttonBg: 'bg-cyan-500',
      buttonHover: 'hover:bg-cyan-600',
      secondaryText: 'text-gray-600'
    }
  };

  const ts = themeStyles[theme];
  const showWelcomeScreen = chat.length === 1;

  return (
    <div className={`flex min-h-screen ${ts.bg} ${ts.text} transition-colors duration-300`}>
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 flex items-center px-4 py-3 ${ts.headerBg} border-b ${ts.border} shadow-md z-10`}>
        <div className="flex items-center">
          <div className={`mr-2 ${ts.accent}`}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17L8.5 20.5L5 17M5 7L8.5 3.5L12 7M12 7L15.5 3.5L19 7M19 17L15.5 20.5L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-xl font-bold ${ts.accent}`}>Onchaindemy Bot</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full ${ts.inputBg} ${ts.border}`}
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button className={`px-3 py-1 ${ts.buttonBg} ${ts.buttonHover} text-white rounded-md shadow-sm transition-colors`}>
            General
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full h-screen pt-14 pb-20">
        {/* Chat container */}
        <div 
          ref={chatBoxRef} 
          className="flex-1 w-full h-full overflow-y-auto p-4 scroll-smooth"
        >
          {showWelcomeScreen ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`${ts.accent} mb-8 transform transition-transform hover:scale-110 duration-300`}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17L8.5 20.5L5 17M5 7L8.5 3.5L12 7M12 7L15.5 3.5L19 7M19 17L15.5 20.5L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-4 animate-fadeIn">Welcome to Onchaindemy Bot!</h1>
              <p className={`${ts.secondaryText} max-w-md text-lg leading-relaxed`}>
                Your decentralized AI learning assistant. Ask questions about
                any subject, get explanations, or request practice problems.
              </p>
              <div className="mt-6 flex gap-2">
                <button className={`${ts.buttonBg} text-white px-4 py-2 rounded-md ${ts.buttonHover} transition-colors shadow-md`}>
                  Get Started
                </button>
                <button className={`border ${ts.border} px-4 py-2 rounded-md hover:bg-opacity-10 hover:bg-gray-500 transition-colors`}>
                  Learn More
                </button>
              </div>
            </div>
          ) : (
            chat.map((message, index) => {
              const isUser = 'user' in message.role;
              const bubbleClass = isUser ? ts.userBubble : ts.botBubble;
              const textColor = isUser ? 'text-white' : ts.text;
              const isThinking = message.content === 'Thinking ...';

              return (
                <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slideIn`}>
                  {!isUser && (
                    <div
                      className={`mr-2 h-10 w-10 rounded-full ${ts.inputBg} flex items-center justify-center shadow-sm flex-shrink-0`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17L8.5 20.5L5 17M5 7L8.5 3.5L12 7M12 7L15.5 3.5L19 7M19 17L15.5 20.5L12 17" stroke={theme === 'dark' ? '#06b6d4' : '#0891b2'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[70%] rounded-lg p-3 ${bubbleClass} shadow-md ${isThinking ? 'animate-pulse' : ''} overflow-hidden`}>
                    <div className="mb-1 flex items-center justify-between text-sm text-gray-400">
                      <div>{isUser ? 'You' : 'Bot'}</div>
                      <div className="mx-2">{formatDate(new Date())}</div>
                    </div>
                    <div className={`${textColor} whitespace-pre-wrap break-words overflow-auto max-h-96`}>
                      {isThinking ? (
                        <div className="flex items-center gap-1">
                          <div>Thinking</div>
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </div>
                      ) : (
                        <div className={`${textColor} whitespace-pre-wrap break-words overflow-auto ${message.expanded ? 'max-h-none' : 'max-h-96'}`}>
                          {message.content}
                        </div>
                      )}
                    </div>
                    {!isThinking && message.content.length > 500 && (
                      <div className="mt-2 text-xs">
                        <button 
                          className={`${ts.accent} hover:underline focus:outline-none`}
                          onClick={() => {
                            // Toggle expanded state for this message
                            const newChat = [...chat];
                            const expandState = newChat[index].expanded;
                            newChat[index].expanded = !expandState;
                            setChat(newChat);
                          }}
                        >
                          {message.expanded ? 'Show less' : 'Show more'}
                        </button>
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <div
                      className={`ml-2 h-10 w-10 rounded-full ${ts.userBubble} flex items-center justify-center shadow-sm flex-shrink-0`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className={`fixed bottom-0 left-0 right-0 p-4 ${ts.headerBg} border-t ${ts.border} shadow-lg`}>
          <form className="flex" onSubmit={handleSubmit}>
            <input
              type="text"
              className={`flex-1 rounded-l-md border ${ts.border} ${ts.inputBg} p-3 ${ts.text} focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all`}
              placeholder="Ask anything about your studies..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`rounded-r-md ${ts.buttonBg} p-3 text-white ${ts.buttonHover} disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </form>
          <div className={`text-center text-xs ${ts.secondaryText} mt-2 flex flex-col sm:flex-row justify-center items-center gap-1`}>
            <span>Powered by decentralized AI on the Internet Computer Protocol</span>
            <span className="hidden sm:inline">•</span>
            <span>© Pemuda Hijrah — 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
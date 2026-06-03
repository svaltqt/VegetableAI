import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/services/api';

export default function Chat({ embedded }) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const userMsg = { role: 'user', content: message };
    setHistory((prev) => [...prev, userMsg]);
    setMessage('');
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: userMsg.content });
      const aiMsg = { role: 'assistant', content: data.reply };
      setHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Error desconocido';
      const errMsg = { role: 'assistant', content: `⚠️ ${msg}`, isError: true };
      setHistory((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? "flex flex-col w-full min-h-[420px]" : "fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col"}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-indigo-600 text-white rounded-t-lg">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h2 className="text-sm font-semibold">Asistente IA — Estado del Alimento</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <svg className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Pregunta sobre el estado de un alimento</p>
            <p className="text-xs mt-1">Ej: ¿Cuánto dura una manzana en el refrigerador?</p>
          </div>
        )}
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700 rounded-bl-none'
                    : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg rounded-bl-none px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-gray-400">Vege está pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t bg-white rounded-b-lg">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Escribe tu mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 disabled:opacity-50 transition-colors"
          onClick={handleSend}
          disabled={loading || !message.trim()}
          aria-label="Enviar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
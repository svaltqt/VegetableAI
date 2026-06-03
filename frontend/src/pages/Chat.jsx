import { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  AlertTriangle,
  ChefHat,
  Refrigerator,
  Lightbulb,
  CalendarClock,
} from 'lucide-react';
import env from '@/config/env';
import { supabase } from '@/supabaseClient';
import { useProfile } from '@/hooks/useProfile';

const BOT_IMG = '/icons/icon-192.png';

const SUGGESTIONS = [
  { icon: AlertTriangle, text: '¿Qué productos están por vencerse?' },
  { icon: ChefHat, text: '¿Qué receta me darías hoy para el almuerzo?' },
  { icon: Refrigerator, text: '¿Qué tengo en la nevera?' },
  { icon: Lightbulb, text: '¿Qué puedo hacer con lo que se va a vencer?' },
  { icon: CalendarClock, text: '¿Tengo algún producto ya vencido?' },
];

/** Avatar del asistente: la foto/logo de la app. */
function BotAvatar() {
  return (
    <img
      src={BOT_IMG}
      alt="Vege"
      className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-emerald-100"
    />
  );
}

/** Avatar del usuario: su foto de perfil; si no tiene, su inicial. */
function UserAvatar({ src, initial }) {
  if (src) {
    return <img src={src} alt="Tú" className="h-8 w-8 shrink-0 rounded-full object-cover shadow-sm" />;
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      {initial || 'Tú'}
    </div>
  );
}

export default function Chat({ embedded }) {
  const { data: profile } = useProfile();
  const firstName = (profile?.full_name || '').trim().split(/\s+/)[0] || '';
  const initial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const avatarUrl = profile?.avatar_url || null;

  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failedPrompt, setFailedPrompt] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    historyRef.current = history;
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  /** Agrega texto al último mensaje del asistente (streaming en vivo). */
  const appendToLast = (token) =>
    setHistory((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content: last.content + token };
      return copy;
    });

  /** Lee la respuesta SSE token por token. Nunca impone un timeout. */
  const streamChat = async (content, apiHistory) => {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;

    const res = await fetch(`${env.apiBaseUrl}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message: content, history: apiHistory }),
    });

    if (!res.ok || !res.body) {
      let errMsg = `HTTP ${res.status}`;
      try {
        const j = await res.json();
        errMsg = j.error || j.message || errMsg;
      } catch {
        /* sin cuerpo JSON */
      }
      throw new Error(errMsg);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamError = null;
    let finished = false;

    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf('\n\n')) >= 0) {
        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        let evt = 'message';
        let dataStr = '';
        for (const line of rawEvent.split('\n')) {
          if (line.startsWith(':')) continue; // latido (heartbeat)
          if (line.startsWith('event:')) evt = line.slice(6).trim();
          else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
        }

        if (evt === 'error') {
          try {
            streamError = JSON.parse(dataStr).error;
          } catch {
            streamError = 'Error en el servidor';
          }
          finished = true;
          break;
        }
        if (evt === 'done') {
          finished = true;
          break;
        }
        if (dataStr) {
          try {
            const { token: tk } = JSON.parse(dataStr);
            if (tk) appendToLast(tk);
          } catch {
            /* fragmento parcial */
          }
        }
      }
    }

    if (streamError) throw new Error(streamError);
  };

  /** Ejecuta un turno: el último mensaje ya es el placeholder del asistente. */
  const streamInto = async (content, apiHistory) => {
    setLoading(true);
    setFailedPrompt(null);
    try {
      await streamChat(content, apiHistory);
      setHistory((prev) => {
        const c = [...prev];
        const l = c[c.length - 1];
        if (l?.role === 'assistant') c[c.length - 1] = { ...l, streaming: false };
        return c;
      });
    } catch (err) {
      setFailedPrompt(content);
      setHistory((prev) => {
        const c = [...prev];
        const l = c[c.length - 1];
        const detail = err?.message || 'Error desconocido';
        if (l?.role === 'assistant') {
          c[c.length - 1] = {
            role: 'assistant',
            isError: true,
            content: l.content
              ? `${l.content}\n\n⚠️ La respuesta se interrumpió.`
              : `No pude responder en este momento: ${detail}`,
          };
        }
        return c;
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const send = async (text) => {
    const content = (text ?? message).trim();
    if (!content || loading) return;

    const apiHistory = historyRef.current
      .filter((m) => !m.isError && !m.streaming)
      .map(({ role, content }) => ({ role, content }));

    setMessage('');
    setHistory((prev) => [
      ...prev,
      { role: 'user', content },
      { role: 'assistant', content: '', streaming: true },
    ]);
    await streamInto(content, apiHistory);
  };

  const retry = async () => {
    if (!failedPrompt || loading) return;
    const content = failedPrompt;

    // Historial para la API: quitamos el error final y el mensaje de usuario del turno fallido.
    const snap = [...historyRef.current];
    if (snap.length && snap[snap.length - 1].isError) snap.pop();
    let lastUserIdx = -1;
    for (let i = snap.length - 1; i >= 0; i--) {
      if (snap[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    const apiHistory = snap
      .slice(0, lastUserIdx)
      .filter((m) => !m.isError && !m.streaming)
      .map(({ role, content }) => ({ role, content }));

    // Display: quitamos el bubble de error y añadimos un placeholder nuevo.
    setHistory((prev) => {
      const c = [...prev];
      if (c.length && c[c.length - 1].isError) c.pop();
      c.push({ role: 'assistant', content: '', streaming: true });
      return c;
    });

    await streamInto(content, apiHistory);
  };

  return (
    <div
      className={
        embedded
          ? 'flex flex-col w-full h-[70vh] max-h-[620px] min-h-[460px] overflow-hidden rounded-xl'
          : 'fixed bottom-4 right-4 z-50 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl'
      }
    >
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-3 text-white">
        <img src={BOT_IMG} alt="Vege" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40" />
        <div className="leading-tight">
          <h2 className="text-sm font-bold">Vege · Asistente</h2>
          <p className="text-[11px] text-emerald-50/90">Te ayudo a no botar comida 🌱</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
          En línea
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-emerald-50/50 to-white px-4 py-4 dark:from-emerald-950/10 dark:to-background"
      >
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
            <img src={BOT_IMG} alt="Vege" className="h-16 w-16 rounded-2xl object-cover shadow-lg" />
            <div>
              <p className="text-base font-semibold text-foreground">
                {firstName ? `¡Hola, ${firstName}! 👋` : '¡Hola! 👋'}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                Soy Vege. Puedo revisar tu inventario, decirte qué está por vencerse y darte
                ideas para aprovecharlo. ¿En qué te ayudo?
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {SUGGESTIONS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-left text-sm text-foreground shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-border dark:bg-card dark:hover:bg-emerald-950/20"
                >
                  <Icon className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && <BotAvatar />}
            <div
              className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                msg.role === 'user'
                  ? 'rounded-br-sm bg-emerald-600 text-white'
                  : msg.isError
                    ? 'rounded-bl-sm border border-red-200 bg-red-50 text-red-700'
                    : 'rounded-bl-sm border border-emerald-100 bg-white text-gray-800 dark:border-border dark:bg-card dark:text-foreground'
              }`}
            >
              {msg.streaming && !msg.content ? (
                <span className="flex gap-1 py-0.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <>
                  {msg.content}
                  {msg.streaming && <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-emerald-500 align-middle" />}
                </>
              )}
            </div>
            {msg.role === 'user' && <UserAvatar src={avatarUrl} initial={initial} />}
          </div>
        ))}
      </div>

      {/* Reintentar */}
      {failedPrompt && !loading && (
        <div className="flex justify-center border-t bg-red-50/60 px-4 py-2 dark:bg-red-950/10">
          <button
            onClick={retry}
            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Intentar nuevamente
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 border-t bg-white px-3 py-3 dark:bg-card">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300"
          placeholder="Escribe tu mensaje…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md transition hover:from-emerald-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => send()}
          disabled={loading || !message.trim()}
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

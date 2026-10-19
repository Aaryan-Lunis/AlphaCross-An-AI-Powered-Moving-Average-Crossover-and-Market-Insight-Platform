import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowUp, RotateCcw } from 'lucide-react';
import Button from './ui/Button';
import { AiBadge } from './ui/Badge';
import Markdown from './Markdown';
import { LogoMark } from './layout/Logo';
import api from '../api/api';

// Conversation survives page changes and reloads within the browser session.
const STORE_KEY = 'alphacross-chat-v1';
const loadStore = () => {
  try {
    const v = JSON.parse(sessionStorage.getItem(STORE_KEY));
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
};
const saveStore = (msgs) => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-60)));
  } catch (e) {
    /* ignore */
  }
};

const Dots = () => (
  <span className="inline-flex items-center gap-1" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-3"
        style={{ animationDelay: `${i * 120}ms` }}
      />
    ))}
  </span>
);

const ChatPanel = ({ symbol, buildContext, suggestions = [], prefill = '', contextReady = true }) => {
  const [messages, setMessages] = useState(loadStore);
  const [input, setInput] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const lastSymbol = useRef(null);

  useEffect(() => saveStore(messages), [messages]);

  // Prefill from "Ask the assistant" shortcuts.
  useEffect(() => {
    if (prefill) {
      setInput(prefill);
      taRef.current?.focus();
    }
  }, [prefill]);

  // When the stock changes mid-conversation, leave a marker so the thread stays honest.
  useEffect(() => {
    if (lastSymbol.current && lastSymbol.current !== symbol) {
      setMessages((m) => [...m, { role: 'note', kind: 'note', content: `Now discussing ${symbol}`, symbol }]);
    }
    lastSymbol.current = symbol;
  }, [symbol]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const grow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };
  useEffect(grow, [input]);

  const send = useCallback(
    async (text, { reuseLast = false } = {}) => {
      const query = text.trim();
      if (!query || loading) return;

      const history = messages
        .filter((m) => m.role !== 'note' && !m.error)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      if (!reuseLast) setMessages((m) => [...m, { role: 'user', content: query, symbol }]);
      setInput('');
      setLoading(true);
      try {
        const res = await api.sendChatMessage(symbol, query, buildContext(), history);
        setMessages((m) => [...m, { role: 'ai', content: res.response, symbol }]);
      } catch (e) {
        setMessages((m) => [
          ...m,
          {
            role: 'ai',
            error: true,
            retryWith: query,
            content: 'The assistant could not answer that. Check your connection and try again.',
            symbol,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, symbol, buildContext]
  );

  const retry = (msg) => {
    setMessages((m) => m.filter((x) => x !== msg));
    send(msg.retryWith, { reuseLast: true });
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const clear = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem(STORE_KEY);
    } catch (e) {
      /* ignore */
    }
  };

  const empty = messages.filter((m) => m.role !== 'note').length === 0;

  return (
    <section
      className="card flex h-[calc(100dvh-230px)] min-h-[520px] flex-col overflow-hidden"
      aria-label="Conversation with the AlphaCross assistant"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-body font-semibold text-ink">Conversation</h2>
          <span className="num rounded-md bg-elevated px-2 py-0.5 text-meta font-medium text-ink-2">{symbol}</span>
        </div>
        {!empty && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5" role="log" aria-live="polite" aria-busy={loading}>
        {empty && (
          <div className="mx-auto max-w-xl py-6">
            <LogoMark className="h-9 w-9" />
            <h3 className="mt-4 text-section font-semibold text-ink">Ask about {symbol}</h3>
            <p className="mt-1 text-body text-ink-2">
              The assistant can see {symbol}&apos;s indicators, the model output, backtest results and recent news
              shown in the panel. It answers from that data and says when something isn&apos;t available.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={loading}
                  className="rounded-lg border border-line bg-surface px-3.5 py-3 text-left text-ui text-ink-2 transition-colors hover:border-accent/50 hover:bg-accent-soft/40 hover:text-ink disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((m, i) => {
            if (m.role === 'note') {
              return (
                <div key={i} className="flex items-center gap-3 text-meta text-ink-3">
                  <span className="h-px flex-1 bg-line" />
                  <span>{m.content}</span>
                  <span className="h-px flex-1 bg-line" />
                </div>
              );
            }
            if (m.role === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-br-sm bg-elevated px-4 py-2.5 text-body text-ink">
                    {m.content}
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="flex gap-3">
                <LogoMark className="mt-0.5 h-7 w-7 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-ui font-medium text-ink">AlphaCross AI</span>
                    {!m.error && <AiBadge />}
                  </div>
                  {m.error ? (
                    <div className="flex items-start gap-2 rounded-lg border border-neg/30 bg-neg/5 px-3.5 py-3 text-ui text-ink-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-neg" aria-hidden="true" />
                      <div>
                        <p>{m.content}</p>
                        <Button size="sm" className="mt-2" onClick={() => retry(m)} disabled={loading}>
                          Try again
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Markdown text={m.content} />
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3" role="status" aria-label="Assistant is responding">
              <LogoMark className="mt-0.5 h-7 w-7 flex-shrink-0" />
              <div>
                <div className="mb-1 text-ui font-medium text-ink">AlphaCross AI</div>
                <div className="flex items-center gap-2.5 text-ui text-ink-3">
                  <Dots /> Reading {symbol} data…
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line p-3 sm:p-4">
        {!empty && suggestions.length > 0 && (
          <div className="-mx-1 mb-2.5 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
            {suggestions.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={loading}
                className="whitespace-nowrap rounded-md border border-line bg-surface px-2.5 py-1 text-meta text-ink-2 transition-colors hover:border-ink-3/50 hover:text-ink disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2 rounded-lg border border-line bg-surface p-1.5 transition-colors focus-within:border-accent-hi">
          <label htmlFor="chat-input" className="sr-only">
            Message the assistant
          </label>
          <textarea
            id="chat-input"
            ref={taRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={`Ask about ${symbol}'s signals, risks or backtest`}
            disabled={loading}
            className="max-h-36 min-h-[36px] flex-1 resize-none bg-transparent px-2.5 py-2 text-body text-ink placeholder:text-ink-3 focus:outline-none disabled:opacity-60"
          />
          <Button
            variant="primary"
            size="icon"
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <ArrowUp className="h-[18px] w-[18px]" />
          </Button>
        </div>
        <p className="mt-2 px-1 text-meta text-ink-3">
          {contextReady ? 'Answers are AI-generated and can be wrong. ' : 'Some data is still loading, so answers may have less context. '}
          Enter to send, Shift+Enter for a new line.
        </p>
      </div>
    </section>
  );
};

export default ChatPanel;

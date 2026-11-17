import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, Send, Sparkles, Bot, User, AlertCircle, Copy, Check, Info } from 'lucide-react';
import { askWebsiteQuestion } from '../services/api';

const EXAMPLE_QUESTIONS = [
  'What is the purpose of this website?',
  'What services does this company provide?',
  'Who owns or operates this website, if stated?',
  'What are the main features?',
  'Explain this website in simple words.',
];

export default function AskWebsiteQA({ sessionId, domain, title }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (history.length > 0) {
      scrollToBottom();
    }
  }, [history, isLoading]);

  const handleAsk = async (qText) => {
    const textToAsk = (qText || question).trim();
    if (!textToAsk || isLoading) return;

    setError('');
    setIsLoading(true);
    setQuestion('');

    // Optimistically add user question to history
    const newEntry = {
      id: Date.now(),
      question: textToAsk,
      answer: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHistory((prev) => [...prev, newEntry]);

    try {
      const response = await askWebsiteQuestion(sessionId, textToAsk);

      setHistory((prev) =>
        prev.map((item) =>
          item.id === newEntry.id
            ? { ...item, answer: response.answer, isFallback: response.is_fallback }
            : item
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to get an answer from the website content.');
      setHistory((prev) =>
        prev.map((item) =>
          item.id === newEntry.id
            ? {
                ...item,
                answer: 'Sorry, I encountered an error while searching the website content. Please try again.',
                isError: true,
              }
            : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAnswer = (answerText, idx) => {
    navigator.clipboard.writeText(answerText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <MessageSquareText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Ask This Website
            </h3>
            <p className="text-xs text-slate-500">
              Inquire about specifics grounded strictly in the extracted content of {domain}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span>Factual Grounding • No Hallucination</span>
        </div>
      </div>

      {/* Suggested Questions Carousel / Pills */}
      <div className="my-5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Suggested queries for this website:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              disabled={isLoading}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-200 transition-colors text-left disabled:opacity-50"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat History View */}
      {history.length > 0 && (
        <div className="my-6 space-y-4 max-h-[480px] overflow-y-auto pr-2">
          {history.map((item, idx) => (
            <div key={item.id} className="space-y-3">
              {/* User Question */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-3.5 text-sm shadow-sm">
                  <p className="leading-relaxed">{item.question}</p>
                  <span className="block text-[10px] text-indigo-200 mt-1 text-right">
                    {item.timestamp}
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              </div>

              {/* AI Answer */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-200/80 p-4 text-sm text-slate-800 shadow-sm relative group">
                  {item.answer ? (
                    <>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {item.answer}
                      </div>

                      {/* Copy Answer Button */}
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
                        <span className="text-[11px]">Grounded in {domain}</span>
                        <button
                          onClick={() => handleCopyAnswer(item.answer, idx)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 py-1">
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Searching extracted website content...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="relative mt-2"
      >
        <div className="flex items-center rounded-2xl bg-slate-50 border border-slate-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white p-1.5 transition-all">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask anything about ${domain} (e.g. "What are the pricing tiers?")...`}
            disabled={isLoading}
            className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

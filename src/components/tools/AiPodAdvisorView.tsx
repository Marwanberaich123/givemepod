import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface AiPodAdvisorViewProps {
  currentProject?: any;
}

export const AiPodAdvisorView: React.FC<AiPodAdvisorViewProps> = ({ currentProject }) => {
  const { t } = useLanguage();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I am your AI POD Advisor. I analyze consumer demand, risk mitigation, and commercial differentiation.\n\n${
        currentProject ? `Currently analyzing project: "${currentProject.title}" (${currentProject.product_type}).` : 'Feel free to ask me to analyze a trend, generate variations, or critique an idea.'
      }`
    }
  ]);

  const quickQuestions = [
    "Is this idea worth researching?",
    "Give me 5 variations.",
    "Make this less saturated.",
    "Change this to a women's audience.",
    "Turn this into a hoodie.",
    "Find a different angle.",
    "Explain the risk."
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMessages);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          projectContext: currentProject || null
        })
      });
      const data = await res.json();
      if (res.ok && data.answer) {
        setMessages([...newMessages, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Market data is temporarily busy. Please ask again.' }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Could not connect to advisor service. Check internet connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t('nav.aiAdvisor', 'AI POD Advisor')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contextual commercial intelligence consultant for Print-on-Demand e-commerce.
          </p>
        </div>

        {currentProject && (
          <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
            Active Context: <strong className="text-white">{currentProject.title}</strong>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Frame */}
      <div className="h-[460px] rounded-3xl bg-[#111724] border border-slate-800 p-6 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 max-w-[85%] ${
              m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-indigo-400 border border-slate-700'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="animate-spin w-3 h-3 border border-indigo-400 border-t-transparent rounded-full" />
              <span>Analyzing market context...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask POD Advisor anything about niches, keywords, design angles, or risk..."
          className="flex-1 h-12 px-4 rounded-2xl bg-[#111724] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};

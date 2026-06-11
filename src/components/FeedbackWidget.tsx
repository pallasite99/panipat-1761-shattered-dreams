import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquareCode, CheckCircle, ChevronDown, ListFilter, ArrowRight, Trash2 } from 'lucide-react';
import { Screen } from '../types';

interface FeedbackItem {
  id: string;
  screen: Screen;
  rating: number;
  comment: string;
  timestamp: string;
}

export const FeedbackWidget: React.FC<{ currentScreen: Screen }> = ({ currentScreen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [logs, setLogs] = useState<FeedbackItem[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('panipat_user_feedback');
      if (saved) {
        setLogs(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    const newItem: FeedbackItem = {
      id: Math.random().toString(36).substr(2, 9),
      screen: currentScreen,
      rating,
      comment: comment.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedLogs = [newItem, ...logs];
    setLogs(updatedLogs);
    try {
      localStorage.setItem('panipat_user_feedback', JSON.stringify(updatedLogs));
    } catch (e) {
       console.error("Local storage state write failure", e);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setRating(0);
      setComment('');
      setIsOpen(false);
    }, 2500);
  };

  const deleteFeedback = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = logs.filter(item => item.id !== id);
    setLogs(updated);
    localStorage.setItem('panipat_user_feedback', JSON.stringify(updated));
  };

  const formattedScreenName = (s: Screen) => {
    return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="feedback-open-trigger"
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900/90 text-saffron border-2 border-saffron/40 hover:border-saffron shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer text-xs uppercase tracking-widest font-black rounded-sm group font-serif"
          >
            <MessageSquareCode size={16} className="text-saffron animate-pulse group-hover:rotate-12 transition-transform" />
            <span>Feedback</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="feedback-panel"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="w-80 md:w-96 bg-stone-900 border-2 border-saffron p-4 shadow-3xl flex flex-col relative rounded-sm text-left font-sans"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquareCode className="text-saffron" size={16} />
                <h3 className="font-serif text-sm text-stone-200 uppercase tracking-widest font-bold">Feedback Center</h3>
              </div>
              <div className="flex items-center gap-3">
                {logs.length > 0 && (
                  <button 
                    onClick={() => setShowLogs(!showLogs)}
                    className="text-[10px] text-saffron font-bold hover:underline uppercase tracking-wide cursor-pointer"
                  >
                    {showLogs ? "Write Feedback" : `Logs (${logs.length})`}
                  </button>
                )}
                <button
                  id="feedback-close-btn"
                  onClick={() => {
                    setIsOpen(false);
                    setShowLogs(false);
                  }}
                  className="text-stone-500 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>

            {/* Content Switcher */}
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center flex flex-col items-center justify-center space-y-3"
              >
                <CheckCircle size={44} className="text-green-500 animate-bounce" />
                <h4 className="font-serif text-sm text-white uppercase tracking-wider">Thank You, Commander!</h4>
                <p className="text-xs text-stone-400 max-w-xs px-4">
                  Your ratings on <span className="text-stone-200">{formattedScreenName(currentScreen)}</span> has been registered.
                </p>
              </motion.div>
            ) : showLogs ? (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-2 font-black italic">Submitted Feedback Records:</div>
                {logs.map((item) => (
                  <div key={item.id} className="bg-stone-950 p-2.5 border border-stone-800 flex flex-col gap-1 text-[11px] hover:border-stone-700 transition-all rounded-sm relative group">
                    <button
                      onClick={(e) => deleteFeedback(item.id, e)}
                      className="absolute top-2 right-2 text-stone-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-saffron font-bold uppercase">{formattedScreenName(item.screen)}</span>
                      <span className="text-stone-500">{item.timestamp}</span>
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={10} className={s <= item.rating ? "text-saffron fill-saffron" : "text-stone-800"} />
                      ))}
                    </div>
                    {item.comment && (
                      <p className="text-stone-300 italic">"{item.comment}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-stone-950 border border-stone-800 px-3 py-2 text-stone-400 text-xs">
                  Rating current screen: <span className="text-white font-bold">{formattedScreenName(currentScreen)}</span>
                </div>

                {/* Rating selection (1-5 star) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-500 uppercase tracking-widest font-black block">Rate This Screen</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="text-stone-700 hover:scale-115 active:scale-95 transition-all focus:outline-none cursor-pointer p-0.5"
                        >
                          <Star
                            size={24}
                            className={`transition-colors ${
                              star <= (hoverRating || rating) 
                                ? "text-saffron fill-saffron drop-shadow-[0_0_5px_#FF9933]" 
                                : "text-stone-700 hover:text-stone-500"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-mono text-stone-400 ml-2">
                      {rating > 0 ? `${rating}/5 Stars` : "Select stars"}
                    </span>
                  </div>
                </div>

                {/* Leave a comment text area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-stone-500 uppercase tracking-widest font-black block">Leave a Comment</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Give your appraisal, historical correction, or tactical critique of this screen..."
                    maxLength={200}
                    rows={3}
                    className="w-full bg-stone-950 border border-stone-800 text-xs text-stone-200 px-3 py-2 rounded-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron/20 transition-all font-sans placeholder-stone-600 resize-none"
                  />
                  <div className="flex justify-end">
                    <span className="text-[9px] text-stone-600 font-mono">{comment.length}/200 chars</span>
                  </div>
                </div>

                {/* Submit buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={rating === 0}
                    className="w-full py-2 bg-saffron hover:bg-yellow-600 text-stone-950 disabled:opacity-30 disabled:hover:bg-saffron font-serif font-black uppercase text-xs tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Register Locally</span>
                    <ArrowRight size={12} className="text-stone-950" />
                  </button>

                  <a
                    href={`mailto:salil.apte99@gmail.com?subject=Panipat 1761 App Feedback - ${formattedScreenName(currentScreen)}&body=Commander feedback form:%0D%0A• Screen Name: ${formattedScreenName(currentScreen)}%0D%0A• Rating: ${rating ? `${rating}/5 Stars` : 'Not Selected'}%0D%0A• Comments: ${encodeURIComponent(comment)}`}
                    className="w-full py-2 bg-stone-950 hover:bg-stone-850 text-stone-200 border-2 border-dashed border-[#8B5E3C]/60 hover:border-[#8B5E3C] font-serif font-black uppercase text-xs tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Direct Email (Mailto)</span>
                  </a>

                  <div className="text-[9px] text-stone-500 font-mono italic text-center mt-1">
                    Powered by direct freemium mailto client links.
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

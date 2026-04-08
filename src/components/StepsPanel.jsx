import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Eye, EyeOff, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StepsPanel({
  showSteps,
  setShowSteps,
  currentStep,
  totalSteps,
  isAutoPlaying,
  setIsAutoPlaying,
  onNext,
  onPrev,
  stepDescription,
  disableControls
}) {
  return (
    <div className="w-full bg-slate-800 rounded-2xl shadow-xl border border-slate-700 overflow-hidden mb-8 transition-all duration-300">
      <button 
        onClick={() => setShowSteps(!showSteps)}
        className="w-full flex items-center justify-between p-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
      >
        <span className="flex items-center">
          {showSteps ? <EyeOff className="h-5 w-5 mr-3 text-indigo-400" /> : <Eye className="h-5 w-5 mr-3 text-indigo-400" />}
          Steps / Execution Panel
        </span>
        <span className="text-xs font-black uppercase tracking-wider text-slate-500 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
            {showSteps ? "Hide" : "Expand"}
        </span>
      </button>

      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-t border-slate-700/50 bg-slate-900/30">
              
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                
                {/* Info Text */}
                <div className="flex-1 text-slate-300 text-sm leading-relaxed border-l-4 border-indigo-500 pl-4 bg-indigo-500/5 py-3 pr-3 rounded">
                    <div className="flex items-start">
                        <Info className="h-5 w-5 mr-3 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-slate-100 mb-1">
                                Step {currentStep} of {totalSteps > 0 ? totalSteps : '-'}
                            </p>
                            <p className="text-slate-400">{stepDescription || "Awaiting execution..."}</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={onPrev}
                    disabled={disableControls || currentStep <= 0}
                    className="p-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Previous Step"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    disabled={disableControls || currentStep >= totalSteps}
                    className={`flex items-center justify-center px-6 py-3 rounded-xl shadow-md font-extrabold tracking-wide uppercase text-xs transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${isAutoPlaying ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 border border-amber-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)]'}`}
                  >
                    {isAutoPlaying ? (
                       <><Pause className="h-4 w-4 mr-2" fill="currentColor"/> Pause Autoplay</>
                    ) : (
                       <><Play className="h-4 w-4 mr-2" fill="currentColor"/> Auto Play</>
                    )}
                  </button>

                  <button
                    onClick={onNext}
                    disabled={disableControls || currentStep >= totalSteps}
                    className="p-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Next Step"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
              </div>
              
              {/* Progress Bar */}
              <div className="mt-6 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-300 ease-out"
                    style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
                  />
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

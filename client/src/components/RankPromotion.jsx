import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, RANK_COLORS } from '../context/AppContext';

// Simple helper to render beautiful SVG badges for each rank category
export const RankBadgeSVG = ({ rankName, size = 120 }) => {
  const category = rankName.split(' ')[0]; // Iron, Bronze, Gold, etc.
  const tier = rankName.split(' ')[1] || ''; // I, II, III

  // Custom SVG designs per Rank Category
  const getBadgeColors = () => {
    switch (category) {
      case 'Iron': return { primary: '#94a3b8', secondary: '#475569', accent: '#64748b' };
      case 'Bronze': return { primary: '#b45309', secondary: '#78350f', accent: '#d97706' };
      case 'Silver': return { primary: '#cbd5e1', secondary: '#64748b', accent: '#94a3b8' };
      case 'Gold': return { primary: '#fbbf24', secondary: '#b45309', accent: '#f59e0b' };
      case 'Platinum': return { primary: '#22d3ee', secondary: '#0891b2', accent: '#06b6d4' };
      case 'Diamond': return { primary: '#a855f7', secondary: '#6366f1', accent: '#8b5cf6' };
      case 'Ascendant': return { primary: '#10b981', secondary: '#047857', accent: '#059669' };
      case 'Immortal': return { primary: '#f43f5e', secondary: '#be123c', accent: '#e11d48' };
      case 'Radiant': return { primary: '#facc15', secondary: '#eab308', accent: '#00E5FF' };
      default: return { primary: '#6366f1', secondary: '#4338ca', accent: '#4f46e5' };
    }
  };

  const colors = getBadgeColors();

  // Render different shapes based on category
  const renderShape = () => {
    if (category === 'Radiant') {
      return (
        <g>
          {/* Radiant Sunburst with outer glow */}
          <polygon points="50,15 62,35 85,35 68,52 75,75 50,60 25,75 32,52 15,35 38,35" fill="url(#radiantGrad)" filter="url(#glowFilter)" />
          <polygon points="50,22 59,38 78,38 64,51 70,70 50,57 30,70 36,51 22,38 41,38" fill="#ffffff" opacity="0.3" />
          <circle cx="50" cy="48" r="8" fill="#ffffff" filter="url(#glowFilter)" />
        </g>
      );
    }

    if (category === 'Immortal') {
      return (
        <g>
          {/* Triple Spire Crest */}
          <polygon points="50,12 75,25 65,75 50,88 35,75 25,25" fill="url(#badgeGrad)" stroke={colors.accent} strokeWidth="2" />
          <polygon points="50,22 68,32 60,70 50,80 40,70 32,32" fill="#111827" opacity="0.8" />
          <path d="M 50,30 L 60,60 L 50,50 L 40,60 Z" fill={colors.primary} />
        </g>
      );
    }

    if (category === 'Ascendant' || category === 'Diamond') {
      return (
        <g>
          {/* Diamond Cut Shield */}
          <polygon points="50,15 80,40 50,85 20,40" fill="url(#badgeGrad)" stroke={colors.accent} strokeWidth="2" />
          <polygon points="50,25 70,42 50,75 30,42" fill="#111827" opacity="0.85" />
          <polygon points="50,32 62,45 50,65 38,45" fill={colors.primary} />
        </g>
      );
    }

    if (category === 'Platinum' || category === 'Gold') {
      return (
        <g>
          {/* Elegant Hexagon Shield */}
          <polygon points="50,15 78,30 78,70 50,85 22,70 22,30" fill="url(#badgeGrad)" stroke={colors.accent} strokeWidth="1.5" />
          <polygon points="50,22 72,34 72,66 50,78 28,66 28,34" fill="#111827" opacity="0.85" />
          <polygon points="50,30 65,40 65,60 50,70 35,60 35,40" fill={colors.primary} />
        </g>
      );
    }

    // Iron, Bronze, Silver
    return (
      <g>
        {/* Basic Shield */}
        <polygon points="50,15 80,30 70,75 50,90 30,75 20,30" fill="url(#badgeGrad)" stroke={colors.accent} strokeWidth="1.5" />
        <polygon points="50,25 72,36 64,70 50,82 36,70 28,36" fill="#111827" opacity="0.85" />
        <circle cx="50" cy="50" r="10" fill={colors.primary} />
      </g>
    );
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-[0_0_12px_rgba(0,229,255,0.25)]">
      <defs>
        <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="50%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </linearGradient>
        <linearGradient id="radiantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#00E5FF" />
        </linearGradient>
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {renderShape()}

      {/* Tier indicators (dots or bars) inside the badge */}
      {category !== 'Radiant' && (
        <g transform="translate(0, 5)">
          {tier === 'I' && <circle cx="50" cy="72" r="3" fill="#ffffff" />}
          {tier === 'II' && (
            <g>
              <circle cx="44" cy="72" r="3" fill="#ffffff" />
              <circle cx="56" cy="72" r="3" fill="#ffffff" />
            </g>
          )}
          {tier === 'III' && (
            <g>
              <circle cx="38" cy="72" r="3" fill="#ffffff" />
              <circle cx="50" cy="72" r="3" fill="#ffffff" />
              <circle cx="62" cy="72" r="3" fill="#ffffff" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};

export const RankPromotion = () => {
  const { promotionEvent, setPromotionEvent } = useApp();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (promotionEvent) {
      // Spawn particles
      const newParticles = Array.from({ length: 40 }).map((_, idx) => ({
        id: idx,
        x: Math.random() * 100 - 50, // center-relative percentage
        y: Math.random() * 50 + 20,
        delay: Math.random() * 1.5,
        size: Math.random() * 4 + 2
      }));
      setParticles(newParticles);
    }
  }, [promotionEvent]);

  if (!promotionEvent) return null;

  const { oldRank, newRank, action } = promotionEvent;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden select-none">
        
        {/* Ambient background glow ring */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-slow" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
        </div>

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute left-1/2 bottom-0 w-2 h-2 rounded-full bg-cyan-400/60 blur-[1px] animate-particle"
              style={{
                left: `calc(50% + ${p.x}vw)`,
                bottom: `${p.y}vh`,
                animationDelay: `${p.delay}s`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                boxShadow: '0 0 8px #00E5FF'
              }}
            />
          ))}
        </div>

        {/* Main promotion card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative max-w-lg w-full text-center px-6 py-12 glass-panel rounded-2xl border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Top Valorant-style glowing corner designs */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.3em] text-cyan-400 font-futuristic mb-1 font-semibold"
          >
            Career Advancement Sync
          </motion.p>

          {/* Main Header */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-5xl font-extrabold tracking-wider text-white font-futuristic text-neon-cyan mb-8 uppercase"
          >
            Rank Promoted
          </motion.h1>

          {/* Rank Badges Comparison */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 0.5, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center"
            >
              <RankBadgeSVG rankName={oldRank} size={90} />
              <p className="text-sm font-semibold text-slate-500 font-display mt-2">{oldRank}</p>
            </motion.div>

            {/* Glowing Arrow */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="text-2xl text-cyan-400 animate-pulse font-futuristic"
            >
              ➔
            </motion.div>

            {/* New Rank Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
              className="flex flex-col items-center animate-rank-pop"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                <RankBadgeSVG rankName={newRank} size={150} />
              </div>
              <p className="text-xl font-bold text-white font-display text-neon-cyan mt-3">{newRank}</p>
            </motion.div>
          </div>

          {/* Reason message */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-black/40 border border-white/5 rounded-lg px-4 py-3 max-w-sm mx-auto mb-8"
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest font-display mb-1">Triggered By</p>
            <p className="text-sm font-medium text-slate-200">{action || 'Activity Complete'}</p>
          </motion.div>

          {/* Close CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            onClick={() => setPromotionEvent(null)}
            className="px-8 py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-900 font-futuristic font-bold text-sm tracking-widest uppercase rounded shadow-lg transition-all duration-300 hover:shadow-glow-accent active:scale-95"
          >
            Acknowledge Career Sync
          </motion.button>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

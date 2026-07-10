import React from 'react';

// Hand-drawn premium vector cartoon illustrations of cute animals, birds, and emojis.
// Designed locally with inline SVGs for 100% offline reliability.
export const CUTE_AVATARS = [
  {
    id: 'cute_cat',
    name: 'Sassy Cat',
    color: '#f43f5e',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#f43f5e" opacity="0.2" />
        <polygon points="20,35 15,10 40,30" fill="#f43f5e" />
        <polygon points="80,35 85,10 60,30" fill="#f43f5e" />
        <circle cx="50" cy="55" r="28" fill="#f43f5e" />
        <circle cx="40" cy="50" r="4" fill="#0f172a" />
        <circle cx="60" cy="50" r="4" fill="#0f172a" />
        <polygon points="50,56 46,52 54,52" fill="#fda4af" />
        <line x1="30" y1="54" x2="15" y2="52" stroke="#fda4af" strokeWidth="2.5" />
        <line x1="30" y1="60" x2="12" y2="62" stroke="#fda4af" strokeWidth="2.5" />
        <line x1="70" y1="54" x2="85" y2="52" stroke="#fda4af" strokeWidth="2.5" />
        <line x1="70" y1="60" x2="88" y2="62" stroke="#fda4af" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    id: 'cute_dog',
    name: 'Happy Pup',
    color: '#f59e0b',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#f59e0b" opacity="0.2" />
        <ellipse cx="20" cy="40" rx="6" ry="16" fill="#d97706" />
        <ellipse cx="80" cy="40" rx="6" ry="16" fill="#d97706" />
        <circle cx="50" cy="52" r="30" fill="#f59e0b" />
        <circle cx="40" cy="46" r="4.5" fill="#0f172a" />
        <circle cx="60" cy="46" r="4.5" fill="#0f172a" />
        <ellipse cx="50" cy="55" rx="5" ry="3.5" fill="#0f172a" />
        <path d="M 45,62 Q 50,66 55,62" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cute_bird',
    name: 'Baby Chick',
    color: '#eab308',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#eab308" opacity="0.2" />
        <circle cx="50" cy="52" r="28" fill="#eab308" />
        <ellipse cx="25" cy="55" rx="6" ry="10" fill="#eab308" transform="rotate(-20 25 55)" />
        <ellipse cx="75" cy="55" rx="6" ry="10" fill="#eab308" transform="rotate(20 75 55)" />
        <circle cx="42" cy="45" r="4" fill="#0f172a" />
        <circle cx="58" cy="45" r="4" fill="#0f172a" />
        <polygon points="50,48 45,54 55,54" fill="#f97316" />
        <circle cx="36" cy="50" r="2.5" fill="#f43f5e" opacity="0.6" />
        <circle cx="64" cy="50" r="2.5" fill="#f43f5e" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 'cute_rabbit',
    name: 'Bouncy Bunny',
    color: '#a855f7',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#a855f7" opacity="0.2" />
        <ellipse cx="38" cy="22" rx="6" ry="18" fill="#a855f7" />
        <ellipse cx="38" cy="22" rx="3.5" ry="13" fill="#f472b6" />
        <ellipse cx="62" cy="22" rx="6" ry="18" fill="#a855f7" />
        <ellipse cx="62" cy="22" rx="3.5" ry="13" fill="#f472b6" />
        <circle cx="50" cy="58" r="26" fill="#a855f7" />
        <circle cx="42" cy="52" r="4" fill="#0f172a" />
        <circle cx="58" cy="52" r="4" fill="#0f172a" />
        <polygon points="50,59 47,56 53,56" fill="#f472b6" />
        <rect x="46" y="62" width="3" height="4" fill="white" />
        <rect x="51" y="62" width="3" height="4" fill="white" />
      </svg>
    )
  },
  {
    id: 'cute_panda',
    name: 'Chubby Panda',
    color: '#64748b',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#64748b" opacity="0.2" />
        <circle cx="28" cy="30" r="10" fill="#1e293b" />
        <circle cx="72" cy="30" r="10" fill="#1e293b" />
        <circle cx="50" cy="56" r="30" fill="#f8fafc" />
        <ellipse cx="38" cy="50" rx="7" ry="9" fill="#1e293b" />
        <ellipse cx="62" cy="50" rx="7" ry="9" fill="#1e293b" />
        <circle cx="38" cy="48" r="3" fill="#f8fafc" />
        <circle cx="62" cy="48" r="3" fill="#f8fafc" />
        <ellipse cx="50" cy="58" rx="4.5" ry="3" fill="#1e293b" />
        <path d="M 46,64 Q 50,67 54,64" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cute_bear',
    name: 'Grizzly Cub',
    color: '#b45309',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#b45309" opacity="0.2" />
        <circle cx="28" cy="28" r="9" fill="#78350f" />
        <circle cx="28" cy="28" r="5" fill="#d97706" />
        <circle cx="72" cy="28" r="9" fill="#78350f" />
        <circle cx="72" cy="28" r="5" fill="#d97706" />
        <circle cx="50" cy="56" r="28" fill="#78350f" />
        <circle cx="40" cy="48" r="4" fill="#0f172a" />
        <circle cx="60" cy="48" r="4" fill="#0f172a" />
        <ellipse cx="50" cy="58" rx="9" ry="7" fill="#d97706" />
        <ellipse cx="50" cy="56" rx="4" ry="2.5" fill="#0f172a" />
        <path d="M 47,60 Q 50,63 53,60" fill="none" stroke="#78350f" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'cute_frog',
    name: 'Happy Toad',
    color: '#10b981',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#10b981" opacity="0.2" />
        <circle cx="34" cy="36" r="9" fill="#10b981" />
        <circle cx="66" cy="36" r="9" fill="#10b981" />
        <circle cx="34" cy="36" r="5.5" fill="white" />
        <circle cx="66" cy="36" r="5.5" fill="white" />
        <circle cx="35" cy="36" r="3" fill="#0f172a" />
        <circle cx="65" cy="36" r="3" fill="#0f172a" />
        <ellipse cx="50" cy="58" rx="26" ry="22" fill="#10b981" />
        <ellipse cx="50" cy="62" rx="16" ry="12" fill="#a7f3d0" />
        <path d="M 38,52 Q 50,60 62,52" fill="none" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
        <circle cx="28" cy="50" r="3.5" fill="#f43f5e" opacity="0.6" />
        <circle cx="72" cy="50" r="3.5" fill="#f43f5e" opacity="0.6" />
      </svg>
    )
  },
  {
    id: 'cute_fox',
    name: 'Sneaky Fox',
    color: '#f97316',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#f97316" opacity="0.2" />
        <polygon points="18,30 12,5 34,22" fill="#ea580c" />
        <polygon points="82,30 88,5 66,22" fill="#ea580c" />
        <circle cx="50" cy="54" r="28" fill="#f97316" />
        <ellipse cx="32" cy="58" rx="12" ry="14" fill="white" />
        <ellipse cx="68" cy="58" rx="12" ry="14" fill="white" />
        <circle cx="50" cy="54" r="28" fill="none" />
        <circle cx="36" cy="46" r="4" fill="#0f172a" />
        <circle cx="64" cy="46" r="4" fill="#0f172a" />
        <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#0f172a" />
      </svg>
    )
  },
  {
    id: 'cute_pig',
    name: 'Oink Oink',
    color: '#f472b6',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#f472b6" opacity="0.2" />
        <ellipse cx="30" cy="26" rx="8" ry="5" fill="#f472b6" transform="rotate(-15 30 26)" />
        <ellipse cx="70" cy="26" rx="8" ry="5" fill="#f472b6" transform="rotate(15 70 26)" />
        <circle cx="50" cy="54" r="28" fill="#f472b6" />
        <circle cx="38" cy="46" r="4" fill="#0f172a" />
        <circle cx="62" cy="46" r="4" fill="#0f172a" />
        <ellipse cx="50" cy="56" rx="9" ry="6" fill="#ec4899" />
        <circle cx="47" cy="56" r="2" fill="#0f172a" />
        <circle cx="53" cy="56" r="2" fill="#0f172a" />
      </svg>
    )
  },
  {
    id: 'cute_koala',
    name: 'Sleepy Koala',
    color: '#94a3b8',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#94a3b8" opacity="0.2" />
        <circle cx="24" cy="35" r="14" fill="#64748b" />
        <circle cx="24" cy="35" r="9" fill="#f1f5f9" />
        <circle cx="76" cy="35" r="14" fill="#64748b" />
        <circle cx="76" cy="35" r="9" fill="#f1f5f9" />
        <circle cx="50" cy="58" r="28" fill="#64748b" />
        <circle cx="40" cy="50" r="3.5" fill="#0f172a" />
        <circle cx="60" cy="50" r="3.5" fill="#0f172a" />
        <ellipse cx="50" cy="58" rx="6.5" ry="10" fill="#1e293b" />
      </svg>
    )
  },
  {
    id: 'cute_owl',
    name: 'Wise Hoot',
    color: '#6366f1',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#6366f1" opacity="0.2" />
        <circle cx="50" cy="52" r="28" fill="#6366f1" />
        <circle cx="38" cy="45" r="8" fill="white" />
        <circle cx="62" cy="45" r="8" fill="white" />
        <circle cx="38" cy="45" r="4.5" fill="#0f172a" />
        <circle cx="62" cy="45" r="4.5" fill="#0f172a" />
        <polygon points="50,48 45,56 55,56" fill="#f59e0b" />
        <path d="M 38,62 Q 50,68 62,62" fill="none" stroke="#4f46e5" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    id: 'cute_penguin',
    name: 'Cozy Penguin',
    color: '#06b6d4',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#06b6d4" opacity="0.2" />
        <circle cx="50" cy="54" r="28" fill="#0f172a" />
        <ellipse cx="50" cy="58" rx="20" ry="22" fill="white" />
        <circle cx="50" cy="54" r="28" fill="none" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="42" cy="45" r="4.5" fill="#0f172a" />
        <circle cx="58" cy="45" r="4.5" fill="#0f172a" />
        <polygon points="50,48 46,55 54,55" fill="#f59e0b" />
        <ellipse cx="28" cy="56" rx="4" ry="10" fill="#0f172a" transform="rotate(-15 28 56)" />
        <ellipse cx="72" cy="56" rx="4" ry="10" fill="#0f172a" transform="rotate(15 72 56)" />
      </svg>
    )
  },
  {
    id: 'cute_ghost',
    name: 'Ghosty Spook',
    color: '#22d3ee',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#22d3ee" opacity="0.2" />
        <path d="M 28,54 C 28,30 72,30 72,54 L 72,70 Q 64,66 56,70 Q 48,66 40,70 Q 32,66 28,70 Z" fill="#e2e8f0" />
        <circle cx="42" cy="45" r="4.5" fill="#0f172a" />
        <circle cx="58" cy="45" r="4.5" fill="#0f172a" />
        <ellipse cx="50" cy="53" rx="3.5" ry="5.5" fill="#f43f5e" />
      </svg>
    )
  },
  {
    id: 'cute_alien',
    name: 'Tiny Alien',
    color: '#22c55e',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#22c55e" opacity="0.2" />
        <ellipse cx="50" cy="52" rx="28" ry="22" fill="#22c55e" />
        <ellipse cx="38" cy="48" rx="8" ry="12" fill="#0f172a" transform="rotate(-10 38 48)" />
        <ellipse cx="62" cy="48" rx="8" ry="12" fill="#0f172a" transform="rotate(10 62 48)" />
        <circle cx="36" cy="45" r="2.5" fill="white" />
        <circle cx="60" cy="45" r="2.5" fill="white" />
        <path d="M 44,64 Q 50,68 56,64" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="22" r="5" fill="#22c55e" />
        <line x1="50" y1="30" x2="50" y2="22" stroke="#22c55e" strokeWidth="3.5" />
      </svg>
    )
  },
  {
    id: 'cute_octopus',
    name: 'Inky Octo',
    color: '#ec4899',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#ec4899" opacity="0.2" />
        <circle cx="50" cy="44" r="24" fill="#ec4899" />
        <circle cx="40" cy="42" r="3.5" fill="#0f172a" />
        <circle cx="60" cy="42" r="3.5" fill="#0f172a" />
        <path d="M 45,50 Q 50,54 55,50" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="28" cy="66" r="6" fill="#ec4899" />
        <circle cx="42" cy="70" r="6" fill="#ec4899" />
        <circle cx="58" cy="70" r="6" fill="#ec4899" />
        <circle cx="72" cy="66" r="6" fill="#ec4899" />
      </svg>
    )
  },
  {
    id: 'cute_robot',
    name: 'Beep Boop',
    color: '#8b5cf6',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#8b5cf6" opacity="0.2" />
        <rect x="25" y="32" width="50" height="40" rx="8" fill="#8b5cf6" />
        <circle cx="38" cy="48" r="6" fill="#22d3ee" stroke="#5b21b6" strokeWidth="2" />
        <circle cx="62" cy="48" r="6" fill="#22d3ee" stroke="#5b21b6" strokeWidth="2" />
        <circle cx="38" cy="48" r="2.5" fill="white" />
        <circle cx="62" cy="48" r="2.5" fill="white" />
        <rect x="36" y="60" width="28" height="4" rx="2" fill="#5b21b6" />
        <line x1="50" y1="32" x2="50" y2="18" stroke="#8b5cf6" strokeWidth="3" />
        <circle cx="50" cy="18" r="4" fill="#a78bfa" />
      </svg>
    )
  },
  {
    id: 'cute_star',
    name: 'Baby Star',
    color: '#eab308',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#eab308" opacity="0.2" />
        <polygon points="50,15 60,38 85,38 65,54 72,78 50,62 28,78 35,54 15,38 40,38" fill="#eab308" />
        <circle cx="43" cy="46" r="3.5" fill="#0f172a" />
        <circle cx="57" cy="46" r="3.5" fill="#0f172a" />
        <path d="M 46,53 Q 50,56 54,53" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cute_dino',
    name: 'Little Dino',
    color: '#10b981',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#10b981" opacity="0.2" />
        <circle cx="20" cy="50" r="6" fill="#047857" />
        <circle cx="28" cy="40" r="6" fill="#047857" />
        <circle cx="38" cy="32" r="6" fill="#047857" />
        <circle cx="50" cy="52" r="26" fill="#10b981" />
        <ellipse cx="64" cy="42" rx="14" ry="12" fill="#10b981" />
        <circle cx="68" cy="38" r="3" fill="#0f172a" />
        <polygon points="78,42 74,45 78,47" fill="#10b981" />
        <path d="M 64,48 Q 70,51 74,46" fill="none" stroke="#047857" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'cute_monkey',
    name: 'Cheeky Chimp',
    color: '#854d0e',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#854d0e" opacity="0.2" />
        <circle cx="26" cy="44" r="10" fill="#a16207" />
        <circle cx="26" cy="44" r="5" fill="#fef08a" />
        <circle cx="74" cy="44" r="10" fill="#a16207" />
        <circle cx="74" cy="44" r="5" fill="#fef08a" />
        <circle cx="50" cy="54" r="26" fill="#a16207" />
        <ellipse cx="38" cy="52" rx="9" ry="12" fill="#fef08a" />
        <ellipse cx="62" cy="52" rx="9" ry="12" fill="#fef08a" />
        <circle cx="38" cy="46" r="3.5" fill="#0f172a" />
        <circle cx="62" cy="46" r="3.5" fill="#0f172a" />
        <ellipse cx="50" cy="54" rx="4" ry="2.5" fill="#a16207" />
        <path d="M 44,60 Q 50,64 56,60" fill="none" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cute_lion',
    name: 'Lion King',
    color: '#eab308',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#eab308" opacity="0.2" />
        {/* Mane */}
        <circle cx="50" cy="50" r="34" fill="#d97706" />
        <circle cx="34" cy="34" r="10" fill="#d97706" />
        <circle cx="66" cy="34" r="10" fill="#d97706" />
        <circle cx="34" cy="66" r="10" fill="#d97706" />
        <circle cx="66" cy="66" r="10" fill="#d97706" />
        <circle cx="50" cy="50" r="10" fill="#d97706" />
        
        {/* Face */}
        <circle cx="50" cy="52" r="24" fill="#f59e0b" />
        <circle cx="42" cy="46" r="3.5" fill="#0f172a" />
        <circle cx="58" cy="46" r="3.5" fill="#0f172a" />
        <ellipse cx="50" cy="52" rx="4.5" ry="3" fill="#0f172a" />
        <path d="M 46,58 Q 50,61 54,58" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cute_octopus_green',
    name: 'Inky Squid',
    color: '#06b6d4',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#06b6d4" opacity="0.2" />
        <ellipse cx="50" cy="44" rx="24" ry="20" fill="#06b6d4" />
        <circle cx="40" cy="42" r="3.5" fill="#0f172a" />
        <circle cx="60" cy="42" r="3.5" fill="#0f172a" />
        <ellipse cx="50" cy="49" rx="3.5" ry="5.5" fill="#0891b2" />
        <circle cx="28" cy="64" r="6.5" fill="#06b6d4" />
        <circle cx="42" cy="68" r="6.5" fill="#06b6d4" />
        <circle cx="58" cy="68" r="6.5" fill="#06b6d4" />
        <circle cx="72" cy="64" r="6.5" fill="#06b6d4" />
      </svg>
    )
  },
  {
    id: 'cute_ghost_pink',
    name: 'Pink Boo',
    color: '#f472b6',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#f472b6" opacity="0.2" />
        <path d="M 28,54 C 28,30 72,30 72,54 L 72,70 Q 64,66 56,70 Q 48,66 40,70 Q 32,66 28,70 Z" fill="#fbcfe8" />
        <circle cx="42" cy="45" r="4" fill="#0f172a" />
        <circle cx="58" cy="45" r="4" fill="#0f172a" />
        <circle cx="50" cy="52" r="3.5" fill="#db2777" />
      </svg>
    )
  },
  {
    id: 'cute_owl_blue',
    name: 'Midnight Owl',
    color: '#3b82f6',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#3b82f6" opacity="0.2" />
        <circle cx="50" cy="52" r="28" fill="#3b82f6" />
        <circle cx="38" cy="45" r="8" fill="white" />
        <circle cx="62" cy="45" r="8" fill="white" />
        <circle cx="38" cy="45" r="4" fill="#1e3a8a" />
        <circle cx="62" cy="45" r="4" fill="#1e3a8a" />
        <polygon points="50,48 46,55 54,55" fill="#f97316" />
        <ellipse cx="28" cy="54" rx="3.5" ry="9" fill="#1d4ed8" transform="rotate(-15 28 54)" />
        <ellipse cx="72" cy="54" rx="3.5" ry="9" fill="#1d4ed8" transform="rotate(15 72 54)" />
      </svg>
    )
  },
  {
    id: 'cute_bunny_white',
    name: 'Snowy Bunny',
    color: '#cbd5e1',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#cbd5e1" opacity="0.2" />
        <ellipse cx="38" cy="22" rx="6" ry="18" fill="#f1f5f9" />
        <ellipse cx="38" cy="22" rx="3.5" ry="13" fill="#fda4af" />
        <ellipse cx="62" cy="22" rx="6" ry="18" fill="#f1f5f9" />
        <ellipse cx="62" cy="22" rx="3.5" ry="13" fill="#fda4af" />
        <circle cx="50" cy="58" r="26" fill="#f1f5f9" />
        <circle cx="42" cy="52" r="4.5" fill="#0f172a" />
        <circle cx="58" cy="52" r="4.5" fill="#0f172a" />
        <polygon points="50,59 47,56 53,56" fill="#fda4af" />
        <rect x="46" y="62" width="3" height="4" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
        <rect x="51" y="62" width="3" height="4" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
      </svg>
    )
  },
  {
    id: 'cute_chick_pink',
    name: 'Rosy Pip',
    color: '#fda4af',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
        <circle cx="50" cy="50" r="45" fill="#fda4af" opacity="0.2" />
        <circle cx="50" cy="52" r="28" fill="#fda4af" />
        <ellipse cx="25" cy="55" rx="6" ry="10" fill="#fda4af" transform="rotate(-20 25 55)" />
        <ellipse cx="75" cy="55" rx="6" ry="10" fill="#fda4af" transform="rotate(20 75 55)" />
        <circle cx="42" cy="45" r="4" fill="#0f172a" />
        <circle cx="58" cy="45" r="4" fill="#0f172a" />
        <polygon points="50,48 45,54 55,54" fill="#ea580c" />
        <circle cx="34" cy="50" r="2.5" fill="#f43f5e" />
        <circle cx="66" cy="50" r="2.5" fill="#f43f5e" />
      </svg>
    )
  }
];

// Helper renderer function that dynamically loads either local vector SVGs or external img elements
export const AvatarRenderer = ({ avatarKey, className = "w-10 h-10" }) => {
  const matchingAvatar = CUTE_AVATARS.find(a => a.id === avatarKey || a.url === avatarKey);

  if (matchingAvatar) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        {matchingAvatar.svg}
      </div>
    );
  }

  // Fallback for DiceBear URL seeds or unsplash avatars
  if (avatarKey && (avatarKey.startsWith('http') || avatarKey.startsWith('data:'))) {
    // If it is a Dicebear adventurer URL, parse it to find if we map it to one of our local versions
    const match = avatarKey.match(/seed=([^&]+)/);
    if (match) {
      const seed = match[1];
      // Map common seeds to our local list
      const seedsMap = {
        'Jack': 'cute_cat',
        'Lily': 'cute_dog',
        'Gizmo': 'cute_bird',
        'Buster': 'cute_rabbit',
        'Snuggles': 'cute_panda',
        'Spooky': 'cute_bear',
        'Nala': 'cute_frog',
        'Sassy': 'cute_fox',
        'Cookie': 'cute_pig',
        'Precious': 'cute_koala',
        'Shadow': 'cute_owl',
        'Milo': 'cute_penguin',
        'Luna': 'cute_ghost',
        'Oliver': 'cute_alien',
        'Bella': 'cute_octopus',
        'Leo': 'cute_robot',
        'Lucy': 'cute_star',
        'Max': 'cute_dino',
        'Daisy': 'cute_monkey',
        'Rocky': 'cute_lion',
        'Charlie': 'cute_octopus_green',
        'Molly': 'cute_ghost_pink',
        'Simba': 'cute_owl_blue',
        'Coco': 'cute_bunny_white',
        'Buddy': 'cute_chick_pink'
      };
      
      const localId = seedsMap[seed];
      if (localId) {
        const localAvatar = CUTE_AVATARS.find(a => a.id === localId);
        if (localAvatar) {
          return (
            <div className={`${className} flex items-center justify-center`}>
              {localAvatar.svg}
            </div>
          );
        }
      }
    }

    return (
      <img 
        src={avatarKey} 
        alt="Avatar" 
        className={`${className} rounded-full object-cover`}
        onError={(e) => {
          // If the network fails to load the image, fallback to cute cat svg
          e.target.style.display = 'none';
          const container = e.target.parentElement;
          if (container) {
            container.innerHTML = '';
            // Render the first avatar SVG as inline backup
            const fallbackNode = document.createElement('div');
            fallbackNode.className = 'w-full h-full flex items-center justify-center';
            container.appendChild(fallbackNode);
          }
        }}
      />
    );
  }

  // Final fallback: Render cute cat SVG
  return (
    <div className={`${className} flex items-center justify-center`}>
      {CUTE_AVATARS[0].svg}
    </div>
  );
};

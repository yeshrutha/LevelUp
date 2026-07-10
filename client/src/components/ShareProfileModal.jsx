import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Download, Check, Sparkles, Trophy, Calendar, CheckSquare } from 'lucide-react';

export const ShareProfileModal = () => {
  const { 
    user, 
    showShareModal, 
    setShowShareModal, 
    habitList, 
    habits, 
    customPages,
    triggerToast 
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!showShareModal || !user) return null;

  const shareUrl = `${window.location.origin}/share/${user.email.toLowerCase()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    triggerToast('Share Link Copied', 'Profile URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    // 1. Load jsPDF dynamically if not present
    if (!window.jspdf) {
      triggerToast('Generating PDF', 'Loading layout tools...', 'info');
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      } catch (err) {
        triggerToast('PDF Generation Failed', 'Could not load script library.', 'error');
        return;
      }
    }

    // 2. Generate PDF using jsPDF
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate statistics
      let totalHabitsCount = habitList.length;
      let loggedDays = Object.keys(habits).length;
      let totalTasksDone = 0;
      customPages.forEach(p => {
        Object.values(p.completedLogs || {}).forEach(logs => {
          totalTasksDone += logs.length;
        });
      });

      const readiness = user.readiness || 0;
      const streak = user.streak || 0;
      const xp = user.xp || 0;
      const level = user.level || 1;
      const rank = user.rank || 'Iron I';

      // --- Cyberpunk Neon Dark Theme Design ---
      
      // Page Background
      doc.setFillColor(11, 15, 23); // #0b0f17
      doc.rect(0, 0, 210, 297, 'F');

      // Borders
      doc.setDrawColor(244, 63, 94); // Rose-500
      doc.setLineWidth(1.2);
      doc.rect(6, 6, 198, 285, 'D');

      doc.setDrawColor(168, 85, 247); // Purple-500
      doc.setLineWidth(0.4);
      doc.rect(8, 8, 194, 281, 'D');

      // Top Banner
      doc.setFillColor(17, 24, 39); // #111827
      doc.rect(10, 10, 190, 32, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(244, 63, 94); // Rose
      doc.text('LEVELUP PROFILE DATA REPORT', 15, 24);
      
      doc.setFontSize(9);
      doc.setTextColor(168, 85, 247); // Purple
      doc.text('MASTER TERMINAL OS VERIFIED // SYNC_STATUS: STABLE', 15, 32);

      // Section 1: User Identity
      doc.setFillColor(20, 26, 40); // Dark Gray
      doc.rect(15, 52, 180, 52, 'F');
      doc.setDrawColor(30, 41, 59);
      doc.rect(15, 52, 180, 52, 'D');

      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('AGENT IDENTITY MATRIX', 20, 62);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Agent Display Alias:', 20, 72);
      doc.text('Linked Email Node:', 20, 80);
      doc.text('Assigned Skill Class:', 20, 88);
      doc.text('Overall Level / XP Rank:', 20, 96);

      doc.setTextColor(255, 255, 255);
      doc.text(user.displayName.toUpperCase(), 75, 72);
      doc.text(user.email, 75, 80);
      doc.text(rank.toUpperCase(), 75, 88);
      doc.text(`LEVEL ${level} // ${xp} XP`, 75, 96);

      // Section 2: Consistency Tracker & Metrics
      doc.setFillColor(20, 26, 40);
      doc.rect(15, 115, 180, 78, 'F');
      doc.rect(15, 115, 180, 78, 'D');

      doc.setFontSize(13);
      doc.setTextColor(244, 63, 94); // Rose
      doc.text('HABITS CONSISTENCY INSIGHTS', 20, 126);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Daily Readiness Rating:', 20, 137);
      doc.text('Current Streak Level:', 20, 145);
      doc.text('Monitored Habit Streams:', 20, 153);
      doc.text('Custom Workspaces Task Count:', 20, 161);
      doc.text('Active Consistency Days:', 20, 169);
      doc.text('Operative Grade Category:', 20, 177);

      let grade = "Bronze Operative";
      if (readiness >= 80) grade = "Elite Overlord";
      else if (readiness >= 50) grade = "Silver Guard Operative";

      doc.setTextColor(255, 255, 255);
      doc.text(`${readiness}% INDEXED`, 75, 137);
      doc.text(`${streak} Days Checkpoint`, 75, 145);
      doc.text(`${totalHabitsCount} Habits Active`, 75, 153);
      doc.text(`${totalTasksDone} Actions Done`, 75, 161);
      doc.text(`${loggedDays} Active Days`, 75, 169);
      doc.setTextColor(168, 85, 247); // Purple highlight
      doc.text(grade.toUpperCase(), 75, 177);

      // Certificate Seal / Accreditation
      doc.setDrawColor(244, 63, 94);
      doc.line(15, 208, 195, 208);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('SECURITY VERIFICATION CODE', 15, 222);

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      const description = "This report represents actual daily completions of habit tracking matrices and task items under the LevelUp cyber quest log. Readiness indices are computed directly from daily task completion states and streak checkpoints.";
      doc.text(doc.splitTextToSize(description, 180), 15, 230);

      // Signatures and Date
      doc.setFontSize(10);
      doc.setTextColor(244, 63, 94);
      doc.text('LEVELUP AI COACH CO-SIGN', 15, 262);
      doc.text('ACCREDITED PROTOCOLS', 130, 262);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`ISSUED: ${new Date().toLocaleDateString()} @ ${new Date().toLocaleTimeString()}`, 15, 268);
      doc.text('REF: ' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_SYS', 130, 268);

      // Save A4 file
      doc.save(`levelup_stats_report_${user.displayName.toLowerCase()}.pdf`);
      triggerToast('PDF Downloaded', 'Your stats report is saved successfully!', 'success');
    } catch (err) {
      triggerToast('PDF Generation Error', err.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      
      {/* Modal Container */}
      <div className="max-w-md w-full glass-panel rounded-2xl border-white/10 p-6 shadow-2xl relative space-y-6">
        
        {/* Glow corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-primary" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-primary" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-primary" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} className="animate-pulse" />
            <h2 className="text-sm font-futuristic font-black tracking-widest uppercase">
              Share Profile Portal
            </h2>
          </div>
          <button 
            onClick={() => setShowShareModal(false)}
            className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Brief Stats Overview Card */}
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full border border-primary/50"
            />
            <div>
              <h3 className="font-futuristic font-bold text-white text-sm">{user.displayName}</h3>
              <p className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">Rank {user.rank}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xs font-futuristic font-bold text-emerald-400">{user.readiness}%</span>
            <span className="block text-[8px] uppercase tracking-widest text-slate-500 mt-0.5">Readiness Index</span>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          
          {/* Action 1: Download PDF */}
          <div className="space-y-1.5">
            <h4 className="text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
              Download Performance Credentials
            </h4>
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded flex items-center justify-center gap-2 hover:shadow-glow-accent cursor-pointer transition-all duration-200"
            >
              <Download size={14} />
              Download Stats PDF Report
            </button>
            <span className="block text-[8px] text-slate-500 font-display leading-normal">
              Compiles daily checklist consistency ratings, active habits count, level, and tier rank into a verified A4 PDF report card.
            </span>
          </div>

          {/* Action 2: Shareable Link */}
          <div className="space-y-1.5 pt-2">
            <h4 className="text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
              Share Profile Hub Link
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 border border-white/10 hover:border-primary/40 hover:text-primary rounded-lg text-slate-300 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                title="Copy Link to Clipboard"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

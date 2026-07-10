import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Copy, Download, Check, Sparkles, Trophy, Calendar, CheckSquare } from 'lucide-react';
import { AvatarRenderer } from './AvatarRenderer';

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

      // --- Executive Light Theme Certificate Design ---
      
      // Page Background
      doc.setFillColor(255, 255, 255); // White page
      doc.rect(0, 0, 210, 297, 'F');

      // Sleek Dual Borders
      doc.setDrawColor(15, 23, 42); // Slate-900
      doc.setLineWidth(1.0);
      doc.rect(8, 8, 194, 281, 'D');

      doc.setDrawColor(6, 182, 212); // Cyan Accent
      doc.setLineWidth(0.4);
      doc.rect(10, 10, 190, 277, 'D');

      // Top Header Band
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(12, 12, 186, 30, 'F');
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.rect(12, 12, 186, 30, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // Dark slate
      doc.text('LEVELUP PROFILE REPORT CARD', 18, 23);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Muted slate
      doc.text('VERIFIED PERFORMANCE CREDENTIALS // SYSTEM RECORD SECURE', 18, 30);
      doc.text(`DATE ISSUED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 18, 36);

      // Section 1: User Identity
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(15, 52, 180, 52, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 52, 180, 52, 'D');

      // Cyan accent bar on left
      doc.setFillColor(6, 182, 212);
      doc.rect(15, 52, 2, 52, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('AGENT IDENTITY MATRIX', 22, 62);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Agent Display Name:', 22, 72);
      doc.text('Linked Email:', 22, 80);
      doc.text('Assigned Tier Rank:', 22, 88);
      doc.text('Level & Experience (XP):', 22, 96);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(user.displayName.toUpperCase(), 75, 72);
      doc.text(user.email, 75, 80);
      doc.text(rank.toUpperCase(), 75, 88);
      doc.text(`LEVEL ${level}   [ ${xp} XP TOTAL ]`, 75, 96);

      // Section 2: Consistency Tracker & Metrics
      doc.setFillColor(248, 250, 252); // Slate-50
      doc.rect(15, 115, 180, 78, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, 115, 180, 78, 'D');

      // Indigo accent bar on left
      doc.setFillColor(79, 70, 229);
      doc.rect(15, 115, 2, 78, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('HABITS CONSISTENCY INSIGHTS', 22, 126);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Daily Readiness Score:', 22, 137);
      doc.text('Active Habit Checkpoints:', 22, 145);
      doc.text('Tracked Habit Streams:', 22, 153);
      doc.text('Workspace Task Checkoffs:', 22, 161);
      doc.text('Total Tracked Logs:', 22, 169);
      doc.text('Operative Grade Tier:', 22, 177);

      let grade = "Bronze Operative";
      if (readiness >= 80) grade = "Elite Overlord";
      else if (readiness >= 50) grade = "Silver Guard Operative";

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${readiness}% INDEXED`, 75, 137);
      doc.text(`${streak} Days Checkpoint`, 75, 145);
      doc.text(`${totalHabitsCount} Habits Active`, 75, 153);
      doc.text(`${totalTasksDone} Actions Done`, 75, 161);
      doc.text(`${loggedDays} Active Days`, 75, 169);
      doc.setTextColor(79, 70, 229); // Indigo text for grade
      doc.text(grade.toUpperCase(), 75, 177);

      // Section 3: Certificate Verification Description
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 208, 195, 208);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text('SECURITY ACCREDITATION LOG', 15, 220);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const description = "This credential report reflects verified data records containing daily habit routines, streaks, and milestone checkmarks. Completion metrics are tracked locally on-device and compiled with server-side audit logs. All performance statistics are fully certified by LevelUp terminal processes.";
      doc.text(doc.splitTextToSize(description, 180), 15, 228);

      // Signature Zone
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 255, 75, 255);
      doc.line(135, 255, 195, 255);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('LEVELUP AI COACH CO-SIGN', 15, 260);
      doc.text('AGENT SIGNATURE & SEAL', 135, 260);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('REF CODE: ' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_AUTH', 15, 270);
      doc.text('LEVELUP MASTER TERMINAL OS v2.4', 135, 270);

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
            <div className="w-12 h-12 rounded-full border border-primary/50 overflow-hidden flex items-center justify-center p-0.5 bg-slate-900">
              <AvatarRenderer avatarKey={user.avatar} className="w-full h-full" />
            </div>
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

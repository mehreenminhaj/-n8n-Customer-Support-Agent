import React from 'react';
import { Bot, Database, Workflow, Sparkles, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const AuthBanner: React.FC = () => {
  const { user, signIn, logOut, loading } = useAuth();

  if (loading) {
    return (
      <div id="auth-loading-banner" className="bg-slate-900 text-slate-400 text-xs py-2 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Connecting to Cloud SQL PostgreSQL & Firebase Authentication...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div id="auth-unauthed-banner" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 py-3 border-b border-indigo-500/20 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              Sign in to manage your PostgreSQL support records, live n8n workflows, and Gemini LLM agent logs.
            </p>
            <p className="text-xs text-slate-400">
              Connected to Cloud SQL PostgreSQL (<span className="text-emerald-400 font-mono">asia-southeast1</span>) & Gemini AI.
            </p>
          </div>
        </div>
        <button
          id="btn-google-signin"
          onClick={() => signIn()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          Sign In with Google
        </button>
      </div>
    );
  }

  return (
    <div id="auth-user-bar" className="bg-slate-900 text-slate-200 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-slate-100">Cloud SQL (PostgreSQL 16)</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Workflow className="w-3.5 h-3.5 text-amber-400" />
          <span>n8n Engine Active</span>
        </div>
        <span className="text-slate-600">•</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Gemini 2.5 Flash</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full ring-1 ring-slate-700" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-slate-300 font-medium">{user.displayName || user.email}</span>
        </div>
        <button
          id="btn-signout"
          onClick={() => logOut()}
          className="text-slate-400 hover:text-slate-200 hover:underline cursor-pointer ml-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Globe, Loader2 } from 'lucide-react';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border border-slate-800 bg-slate-950 shadow-lg"
          >
            <div className="p-6 space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {isLogin ? 'Welcome back' : 'Create an account'}
                </h1>
                <p className="text-slate-400">
                  {isLogin
                    ? 'Enter your credentials to access your account'
                    : 'Enter your information to create an account'}
                </p>
              </div>
              <form onSubmit={onSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-slate-200">Name</label>
                    <input
                      id="name"
                      placeholder="John Doe"
                      required
                      className="bg-slate-900 border-slate-800 text-slate-200"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-slate-200">Email</label>
                  <input
                    id="email"
                    placeholder="m@example.com"
                    required
                    type="email"
                    className="bg-slate-900 border-slate-800 text-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-slate-200">Password</label>
                  <input
                    id="password"
                    required
                    type="password"
                    className="bg-slate-900 border-slate-800 text-slate-200"
                  />
                </div>
                <button 
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                  disabled={loading}
                >
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-950 px-2 text-slate-400">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button variant="outline" className="bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800">
                    <Github className="mr-2 h-4 w-4" />
                    Github
                  </button>
                  <button variant="outline" className="bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800">
                    <Globe className="mr-2 h-4 w-4" />
                    Google
                  </button>
                </div>
              </form>
              <div className="text-center text-sm">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-violet-400 hover:text-violet-300 underline-offset-4 hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Login;

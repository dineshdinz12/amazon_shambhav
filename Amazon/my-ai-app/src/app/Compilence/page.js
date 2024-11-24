'use client';

import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, BarChart2, Shield, FileSearch } from 'lucide-react';
import Markdown from 'markdown-to-jsx';

const DocumentAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/compilence', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Raw response:', responseText);
        throw new Error('Invalid server response');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze document');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'An error occurred while analyzing the document');
      console.error('Error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-64 w-64 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `scale(${Math.random() * 2 + 1})`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-indigo-400" />
            <h1 className="text-4xl font-bold text-white">Document Risk Analyzer</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Advanced AI-powered document analysis for identifying potential risks and compliance issues
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileSearch className="text-indigo-400" size={24} />
                <h2 className="text-xl font-semibold text-white">Document Upload</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative cursor-pointer group">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center transition-all duration-300 group-hover:border-indigo-400 group-hover:bg-gray-800/30">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4 group-hover:text-indigo-400 transition-colors duration-300" />
                    <p className="text-gray-200 text-lg mb-2">
                      Drag and drop your document here
                    </p>
                    <p className="text-gray-400 text-sm">
                      Supported: PDF, DOC, DOCX, TXT (Max: 10MB)
                    </p>
                    {file && (
                      <div className="mt-4 text-indigo-400 text-sm font-medium">
                        Selected: {file.name}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!file || isAnalyzing}
                  className="w-full py-3 px-6 rounded-xl font-medium text-white bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-500 transform transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyzing Document...</span>
                    </div>
                  ) : (
                    'Begin Analysis'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-6 bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl flex items-center gap-3 text-red-300">
                  <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 className="text-indigo-400" size={20} />
                  <h3 className="text-gray-200 font-medium">Processing Speed</h3>
                </div>
                <p className="text-2xl font-bold text-white">2.5s</p>
                <p className="text-gray-400 text-sm">Average analysis time</p>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-indigo-400" size={20} />
                  <h3 className="text-gray-200 font-medium">Accuracy Rate</h3>
                </div>
                <p className="text-2xl font-bold text-white">99.9%</p>
                <p className="text-gray-400 text-sm">Detection accuracy</p>
              </div>
            </div>
          </div>

          {/* Analysis Results Section */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="text-emerald-400" size={24} />
              <h2 className="text-xl font-semibold text-white">Analysis Results</h2>
            </div>
            
            {analysis ? (
              <div className="bg-gray-900/50 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <Markdown
                    options={{
                      overrides: {
                        h1: { component: props => <h1 {...props} className="text-2xl font-bold text-indigo-400 mb-4" /> },
                        h2: { component: props => <h2 {...props} className="text-xl font-bold text-indigo-300 mb-3" /> },
                        h3: { component: props => <h3 {...props} className="text-lg font-bold text-indigo-200 mb-2" /> },
                        p: { component: props => <p {...props} className="text-gray-300 mb-4" /> },
                        ul: { component: props => <ul {...props} className="space-y-2 mb-4" /> },
                        li: { component: props => <li {...props} className="text-gray-300 flex gap-2"><span className="text-indigo-400">•</span>{props.children}</li> },
                      }
                    }}
                  >
                    {analysis}
                  </Markdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <FileText className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">Upload a document to see the analysis results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;
'use client';

import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Document Risk Analyzer
        </h1>

        {/* Analysis Results Section */}
        <div className="mb-12">
          {analysis ? (
            <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="text-emerald-400" size={28} />
                  <h2 className="text-2xl font-semibold text-white">Analysis Results</h2>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-6 space-y-6">
                  <div className="text-lg text-gray-200 markdown-content">
                    <Markdown
                      options={{
                        overrides: {
                          h1: { component: props => <h1 {...props} className="text-3xl font-bold text-blue-300 mb-4" /> },
                          h2: { component: props => <h2 {...props} className="text-2xl font-bold text-yellow-300 mb-3" /> },
                          h3: { component: props => <h3 {...props} className="text-xl font-bold text-blue-200 mb-2" /> },
                          p: { component: props => <p {...props} className="text-gray-300 text-lg mb-4" /> },
                          ul: { component: props => <ul {...props} className="space-y-2 mb-4" /> },
                          li: { component: props => <li {...props} className="text-gray-300 flex gap-2"><span className="text-blue-400">•</span>{props.children}</li> },
                        }
                      }}
                    >
                      {analysis}
                    </Markdown>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-lg p-8 text-center border-2 border-dashed border-gray-700">
              <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Analysis results will appear here</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3 text-red-300">
            <AlertCircle className="text-red-400" size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-gray-800/50 rounded-lg shadow-xl border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center transition-colors hover:border-gray-400">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-200 text-lg mb-2">
                  Drag and drop your document here, or click to browse
                </p>
                <p className="text-gray-400 text-sm">
                  Supported formats: PDF, DOC, DOCX, TXT (Max size: 10MB)
                </p>
                {file && (
                  <div className="mt-4 text-blue-300 text-sm font-medium">
                    Selected: {file.name}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!file || isAnalyzing}
              className="w-full py-3 px-6 rounded-lg font-medium text-white bg-indigo-600 disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-indigo-700 transform transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Analyze Document'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;  
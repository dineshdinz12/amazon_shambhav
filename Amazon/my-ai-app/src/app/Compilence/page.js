'use client';

import { useState } from 'react';
import styles from './page.css';

export default function DocumentAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
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
      
      // Fixed API endpoint
      const response = await fetch('/api/compilence', {
        method: 'POST',
        body: formData,
      });

      // Read the response only once
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
    <div className={styles.container}>
      <h1 className={styles.title}>Document Risk Analyzer</h1>
      
      <div className={styles.uploadSection}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Upload Document for Analysis
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className={styles.fileInput}
            />
            <p className={styles.supportedFormats}>
              Supported formats: PDF, DOC, DOCX, TXT (Max size: 10MB)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={!file || isAnalyzing}
            className={`${styles.button} ${isAnalyzing ? styles.loading : ''}`}
          >
            {isAnalyzing ? 'Analyzing Document...' : 'Analyze Document'}
          </button>
        </form>
      </div>

      {error && (
        <div className={styles.error}>
          Error: {error}
        </div>
      )}

      {analysis && (
        <div className={styles.resultsSection}>
          <h2 className={styles.resultsTitle}>Analysis Results</h2>
          <div className={styles.analysisContent}>
            <pre>{analysis}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
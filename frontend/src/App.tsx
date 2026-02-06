import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Columns, Copy, Trash2, Check, AlertCircle, FileJson, Clock, Binary } from 'lucide-react';
import JsonHighlighter from './components/JsonHighlighter';
import TimestampConverter from './components/TimestampConverter';
import BaseConverter from './components/BaseConverter';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'json' | 'timestamp' | 'base'>('json');

    // JSON State
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatJson = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('http://localhost:8080/api/format', { input });
            setOutput(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to format JSON. Please check your input.');
            setOutput(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(JSON.stringify(output, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clear = () => {
        setInput('');
        setOutput(null);
        setError(null);
    };

    return (
        <div className="container">
            <header>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', gap: '1rem' }}>
                    <img
                        src="/logo.svg"
                        alt="Hobbit Logo"
                        className="logo-spin"
                        style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #eab308', background: '#1e293b' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <h1 style={{ margin: 0 }}>Hobbit</h1>
                </div>
                <p className="subtitle">One Ring to rule them all, One Ring to find them, One Ring to bring them all, and in the darkness bind them</p>

                <div className="tabs" style={{ marginTop: '1.5rem' }}>
                    <div
                        className={`tab ${activeTab === 'json' ? 'active' : ''}`}
                        onClick={() => setActiveTab('json')}
                    >
                        <FileJson size={18} /> JSON Formatter
                    </div>
                    <div
                        className={`tab ${activeTab === 'timestamp' ? 'active' : ''}`}
                        onClick={() => setActiveTab('timestamp')}
                    >
                        <Clock size={18} /> Timestamp
                    </div>
                    <div
                        className={`tab ${activeTab === 'base' ? 'active' : ''}`}
                        onClick={() => setActiveTab('base')}
                    >
                        <Binary size={18} /> Base
                    </div>
                </div>
            </header>

            {activeTab === 'json' ? (
                <>
                    <div className="main-layout">
                        <div className="panel">
                            <div className="panel-header">
                                <span className="panel-title">
                                    <Columns size={16} /> Input JSON / String
                                </span>
                            </div>
                            <div className="panel-content">
                                <textarea
                                    placeholder='Enter JSON here... e.g. {"key": "value"} or "{\"a\": 1}"'
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="panel">
                            <div className="panel-header">
                                <span className="panel-title">
                                    <FileJson size={16} /> Structured Output
                                </span>
                                {output && (
                                    <button className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleCopy}>
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </button>
                                )}
                            </div>
                            <div className="panel-content">
                                {loading ? (
                                    <div className="output-area" style={{ opacity: 0.5 }}>Formatting...</div>
                                ) : output ? (
                                    <JsonHighlighter data={output} />
                                ) : error ? (
                                    <div className="error-msg">
                                        <AlertCircle size={14} style={{ inlineSize: 'auto', marginRight: '4px', verticalAlign: 'middle' }} />
                                        {error}
                                    </div>
                                ) : (
                                    <div className="output-area" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        Output will appear here...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="actions">
                        <button className="secondary" onClick={clear}>
                            <Trash2 size={18} /> Clear
                        </button>
                        <button onClick={formatJson} disabled={loading}>
                            {loading ? 'Processing...' : 'Format JSON'}
                        </button>
                    </div>
                </>
            ) : activeTab === 'timestamp' ? (
                <TimestampConverter />
            ) : (
                <BaseConverter />
            )}
        </div>
    );
};

export default App;

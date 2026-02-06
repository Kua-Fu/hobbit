import React, { useState } from 'react';
import { Copy, Trash2, ArrowUpDown, ClipboardCheck } from 'lucide-react';
import base32 from 'hi-base32';

const BaseConverter: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'base64' | 'base32'>('base64');
    const [copied, setCopied] = useState(false);

    const handleEncode = () => {
        try {
            if (mode === 'base64') {
                // UTF-8 safe base64 encoding
                const bytes = new TextEncoder().encode(input);
                const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
                setOutput(window.btoa(binString));
            } else {
                setOutput(base32.encode(input));
            }
        } catch (e) {
            setOutput('Error encoding content');
        }
    };

    const handleDecode = () => {
        try {
            if (mode === 'base64') {
                // UTF-8 safe base64 decoding
                const binString = window.atob(input);
                const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
                setOutput(new TextDecoder().decode(bytes));
            } else {
                setOutput(base32.decode(input));
            }
        } catch (e) {
            setOutput('Error decoding content (invalid format)');
        }
    };

    const swapInputOutput = () => {
        const temp = input;
        setInput(output);
        setOutput(temp);
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearAll = () => {
        setInput('');
        setOutput('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '0 1rem' }}>
            <div className="panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            className="select-field"
                            value={mode}
                            onChange={(e) => setMode(e.target.value as any)}
                        >
                            <option value="base64">Base64</option>
                            <option value="base32">Base32</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="secondary" onClick={clearAll} title="Clear All">
                            <Trash2 size={16} /> Clear
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            className="input-field"
                            placeholder={`Enter text to ${mode} encode or decode...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={{ width: '100%', height: '150px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                        <button className="primary-btn" onClick={handleEncode} style={{ flex: 1 }}>
                            Encode
                        </button>
                        <button className="primary-btn" onClick={handleDecode} style={{ flex: 1 }}>
                            Decode
                        </button>
                        <button className="secondary" onClick={swapInputOutput} style={{ width: 'auto' }} title="Swap Input and Output">
                            <ArrowUpDown size={18} />
                        </button>
                    </div>

                    <div style={{ position: 'relative', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Result:</span>
                            {output && (
                                <button className="secondary" onClick={handleCopy} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                                    {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                        <textarea
                            className="input-field"
                            readOnly
                            value={output}
                            placeholder="Conversion results will appear here..."
                            style={{ width: '100%', height: '150px', resize: 'vertical', background: 'rgba(0,0,0,0.3)', cursor: 'default' }}
                        />
                    </div>
                </div>

                {!input && !output && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        color: 'var(--accent-color)',
                        fontSize: '0.9rem'
                    }}>
                        Enter characters to be encoded or decoded in the first box above.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaseConverter;

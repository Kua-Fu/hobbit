import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { Copy, Pause, Play, RefreshCw, Clock, Calendar } from 'lucide-react';

const timezones = [
    'Asia/Shanghai',
    'Asia/Tokyo',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'UTC'
];

type TimeUnit = 's' | 'ms' | 'us' | 'ns';

const TimestampConverter: React.FC = () => {
    // Current Timestamp State
    const [rawNow, setRawNow] = useState<number>(Date.now());

    const [isPaused, setIsPaused] = useState(false);
    const [unit, setUnit] = useState<TimeUnit>('s');

    // Converter State
    const [tsInput, setTsInput] = useState<string>('');
    const [tsUnit, setTsUnit] = useState<TimeUnit>('s');
    const [tsTimezone, setTsTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [tsResult, setTsResult] = useState<string>('');

    const [dateInput, setDateInput] = useState<string>(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
    const [dateTimezone, setDateTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [dateResult, setDateResult] = useState<string>('');
    const [dateUnit, setDateUnit] = useState<TimeUnit>('ms');

    // Live Clock
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setRawNow(Date.now());
        }, 50); // Fast update
        return () => clearInterval(interval);
    }, [isPaused]);

    // Helpers
    const getDisplayNow = () => {
        switch (unit) {
            case 's': return Math.floor(rawNow / 1000);
            case 'ms': return rawNow;
            case 'us': return rawNow * 1000;
            case 'ns': return rawNow * 1000000;
        }
    };

    const getUnitLabel = (u: TimeUnit) => {
        switch (u) {
            case 's': return 's (Seconds)';
            case 'ms': return 'ms (Milliseconds)';
            case 'us': return 'μs (Microseconds)';
            case 'ns': return 'ns (Nanoseconds)';
        }
    };

    const getShortUnitLabel = (u: TimeUnit) => {
        switch (u) {
            case 's': return 's';
            case 'ms': return 'ms';
            case 'us': return 'μs';
            case 'ns': return 'ns';
        }
    };

    const cycleUnit = () => {
        const units: TimeUnit[] = ['s', 'ms', 'us', 'ns'];
        const nextIndex = (units.indexOf(unit) + 1) % units.length;
        setUnit(units[nextIndex]);
    };

    const copyNow = () => {
        navigator.clipboard.writeText(String(getDisplayNow()));
    };

    const convertTsToDate = () => {
        if (!tsInput) return;
        try {
            // Check if input is scientific notation or just large digits. parseInt handles basic int.
            let timestampStr = tsInput.trim();
            // Handle potentially massive numbers (ns) passed as string? 
            // JS Numbers lose precision for large NS integers (above 2^53 - 1). 
            // Date(ms) conversion needs MS as number.

            // Logic: Convert input to MS (Number).
            let ms: number;

            // We might need BigInt for parsing input to avoid precision loss during calculation, 
            // but eventually Date constructor takes Number (ms). 
            // So precision is lost at Date creation anyway if we care about sub-ms rendering (which we don't, we just format date).
            // So straightforward calculation is fine.
            const val = parseFloat(timestampStr);
            if (isNaN(val)) {
                setTsResult('Invalid Timestamp');
                return;
            }

            switch (tsUnit) {
                case 's': ms = val * 1000; break;
                case 'ms': ms = val; break;
                case 'us': ms = val / 1000; break;
                case 'ns': ms = val / 1000000; break;
                default: ms = val;
            }

            const date = new Date(ms);
            const result = formatInTimeZone(date, tsTimezone, 'yyyy-MM-dd HH:mm:ss.SSS'); // Added SSS to show ms precision if applicable
            setTsResult(result);
        } catch (e) {
            setTsResult('Conversion Error');
        }
    };

    const convertDateToTs = () => {
        if (!dateInput) return;
        try {
            const date = fromZonedTime(dateInput, dateTimezone);
            let ms = date.getTime();

            let res: number;
            switch (dateUnit) {
                case 's': res = Math.floor(ms / 1000); break;
                case 'ms': res = ms; break;
                case 'us': res = ms * 1000; break;
                case 'ns': res = ms * 1000000; break;
            }
            setDateResult(String(res));
        } catch (e) {
            try {
                const d = new Date(dateInput);
                let ms = d.getTime();
                let res: number;
                switch (dateUnit) {
                    case 's': res = Math.floor(ms / 1000); break;
                    case 'ms': res = ms; break;
                    case 'us': res = ms * 1000; break;
                    case 'ns': res = ms * 1000000; break;
                }
                setDateResult(String(res));
            } catch (err) {
                setDateResult('Invalid Date');
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: '0 1rem' }}>
            {/* Current Timestamp Panel */}
            <div className="panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    <Clock size={18} />
                    <span style={{ fontWeight: 600 }}>Current Timestamp</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-color)', marginBottom: '1rem', wordBreak: 'break-all' }}>
                    {getDisplayNow()}
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                        {getShortUnitLabel(unit)}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="secondary" onClick={cycleUnit} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <RefreshCw size={14} style={{ marginRight: '6px' }} /> Switch Unit
                    </button>
                    <button className="secondary" onClick={copyNow} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        <Copy size={14} style={{ marginRight: '6px' }} /> Copy
                    </button>
                    <button
                        className="secondary"
                        onClick={() => setIsPaused(!isPaused)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: '100px', backgroundColor: isPaused ? 'var(--success-color)' : 'var(--error-color)', border: 'none', color: 'white' }}
                    >
                        {isPaused ? <Play size={14} style={{ marginRight: '6px' }} /> : <Pause size={14} style={{ marginRight: '6px' }} />}
                        {isPaused ? 'Start' : 'Stop'}
                    </button>
                </div>
            </div>

            {/* Converter Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                {/* Timestamp -> Date */}
                <div className="panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                        <Clock size={16} />
                        <span style={{ fontWeight: 600 }}>Timestamp to Date</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="input-field"
                            placeholder="Timestamp"
                            value={tsInput}
                            onChange={(e) => setTsInput(e.target.value)}
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <select
                            className="select-field"
                            value={tsUnit}
                            onChange={(e) => setTsUnit(e.target.value as TimeUnit)}
                        >
                            <option value="s">s (Seconds)</option>
                            <option value="ms">ms (Milliseconds)</option>
                            <option value="us">μs (Microseconds)</option>
                            <option value="ns">ns (Nanoseconds)</option>
                        </select>
                        <button className="primary-btn" onClick={convertTsToDate}>Convert</button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                className="input-field"
                                readOnly
                                value={tsResult}
                                placeholder="Result Date"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', cursor: 'default' }}
                            />
                        </div>
                        <select
                            className="select-field"
                            value={tsTimezone}
                            onChange={(e) => {
                                setTsTimezone(e.target.value);
                            }}
                            style={{ width: '180px' }}
                        >
                            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    </div>
                </div>

                {/* Date -> Timestamp */}
                <div className="panel" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={16} />
                        <span style={{ fontWeight: 600 }}>Date to Timestamp</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            className="input-field"
                            placeholder="YYYY-MM-DD HH:mm:ss"
                            value={dateInput}
                            onChange={(e) => setDateInput(e.target.value)}
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <select
                            className="select-field"
                            value={dateTimezone}
                            onChange={(e) => setDateTimezone(e.target.value)}
                            style={{ width: '180px' }}
                        >
                            {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                        <button className="primary-btn" onClick={convertDateToTs}>Convert</button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                className="input-field"
                                readOnly
                                value={dateResult}
                                placeholder="Result Timestamp"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', cursor: 'default' }}
                            />
                        </div>
                        <select
                            className="select-field"
                            value={dateUnit}
                            onChange={(e) => setDateUnit(e.target.value as TimeUnit)}
                            style={{ width: '120px' }}
                        >
                            <option value="s">s</option>
                            <option value="ms">ms</option>
                            <option value="us">μs</option>
                            <option value="ns">ns</option>
                        </select>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TimestampConverter;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface Props {
    inputs: {
        monthlyUsage: number;
        monthlyBill: number;
        psh: number;
        panelWattage: number;
        panelCount: number;
        daySplit: number;
        afa: number;
        batteryKwh: number;
        batteryUnits: number;
        dischargeDepth: number;
        useBattery: boolean;
        systemPrice: number;
        mode: 'kwh' | 'rm';
    };
    onChange: (field: string, value: any) => void;
}

export const CustomerInputs: React.FC<Props> = ({ inputs, onChange }) => {
    // Helper to handle standard changes
    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let val: any = e.target.value;
        if (e.target.type === 'number' || e.target.type === 'range') {
            val = val === '' ? 0 : parseFloat(val);
        }
        if (e.target.type === 'checkbox') {
            val = (e.target as HTMLInputElement).checked;
        }
        onChange(field, val);
    };

    return (
        <div className="card customer-section professional-card">
            <div className="section-header">
                <div className="step-indicator">
                    <span>1</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">System Parameters</h2>
                    <p className="text-sm text-gray-500">Configure your solar system requirements</p>
                </div>
            </div>

            <div className="inputs-container">


                {/* Location (PSH) */}
                <div className="input-group">
                    <label className="input-label">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Location (Peak Sun Hours)
                    </label>
                    <div className="select-wrapper" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <select
                            value={inputs.psh}
                            onChange={handleChange('psh')}
                            className="professional-select"
                            style={{ backgroundColor: 'transparent', border: 'none' }}
                        >
                            <option value="3.4">Kuala Lumpur (3.4)</option>
                            <option value="3.6">Selangor (3.6)</option>
                            <option value="3.8">Penang (3.8)</option>
                            <option value="3.9">Johor (3.9)</option>
                            <option value="4.0">Kedah (4.0)</option>
                            <option value="3.7">Perak (3.7)</option>
                            <option value="3.5">Melaka (3.5)</option>
                            <option value="3.3">Negeri Sembilan (3.3)</option>
                            <option value="3.2">Pahang (3.2)</option>
                            <option value="3.1">Terengganu (3.1)</option>
                            <option value="3.0">Kelantan (3.0)</option>
                            <option value="3.4">Sabah (3.4)</option>
                            <option value="3.3">Sarawak (3.3)</option>
                        </select>
                        <div className="select-arrow">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* Bill / Usage Toggle */}
                <div className="input-group">
                    <label className="input-label">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Monthly Consumption
                    </label>
                    <div className="segmented-control">
                        <motion.div
                            className="segment-background"
                            animate={{ x: inputs.mode === 'rm' ? 0 : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            className={`segment-btn ${inputs.mode === 'rm' ? 'active' : ''}`}
                            onClick={() => onChange('mode', 'rm')}
                        >
                            Bill (RM)
                        </button>
                        <button
                            className={`segment-btn ${inputs.mode === 'kwh' ? 'active' : ''}`}
                            onClick={() => onChange('mode', 'kwh')}
                        >
                            Usage (kWh)
                        </button>
                    </div>

                    <div className="input-with-suffix">
                        <input
                            type="number"
                            className="professional-input"
                            value={inputs.mode === 'rm'
                                ? (inputs.monthlyBill === 0 ? '' : inputs.monthlyBill)
                                : (inputs.monthlyUsage === 0 ? '' : inputs.monthlyUsage)
                            }
                            onChange={handleChange(inputs.mode === 'rm' ? 'monthlyBill' : 'monthlyUsage')}
                            placeholder="0"
                            min={inputs.mode === 'rm' ? "50" : "100"}
                            style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
                            onFocus={(e) => e.target.select()}
                        />
                        <span className="input-suffix">{inputs.mode === 'rm' ? 'RM' : 'kWh'}</span>
                    </div>
                    {inputs.mode === 'rm' && inputs.monthlyBill > 720 && inputs.monthlyBill < 880 && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
                            <strong>Note:</strong> Due to TNB's tariff rate change at 1500 kWh, bill amounts between approximately RM 720 and RM 880 are not possible. The calculator will automatically select the closest valid bill amount.
                        </div>
                    )}
                </div>

                {/* Day / Night Split */}
                <div className="input-group">
                    <label className="input-label">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Usage Pattern
                    </label>
                    <div className="slider-container-modern" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div className="slider-labels">
                            <span className="text-day">Day: {inputs.daySplit}%</span>
                            <span className="text-night">Night: {100 - inputs.daySplit}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={inputs.daySplit}
                            onChange={handleChange('daySplit')}
                            className="modern-slider"
                            style={{ backgroundSize: `${inputs.daySplit}% 100%` }}
                        />
                    </div>
                </div>

                {/* Panel Count */}
                <div className="input-group">
                    <label className="input-label">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Panel Count (650W)
                    </label>
                    <div className="input-with-suffix">
                        <input
                            type="number"
                            value={inputs.panelCount === 0 ? '' : inputs.panelCount}
                            onChange={handleChange('panelCount')}
                            placeholder="0"
                            min="1"
                            className="professional-input"
                            style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}
                            onFocus={(e) => e.target.select()}
                        />
                        <span className="input-suffix">Panels</span>
                    </div>
                </div>

                {/* Battery Toggle & Configuration */}
                <div className="input-group full-width-group">
                    <div className="flex justify-between items-center mb-2">
                        <label className="input-label mb-0">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Battery Storage
                        </label>
                        <div className="switch-toggle">
                            <input
                                type="checkbox"
                                id="battery-toggle"
                                checked={inputs.useBattery}
                                onChange={(e) => onChange('useBattery', e.target.checked)}
                            />
                            <label htmlFor="battery-toggle"></label>
                        </div>
                    </div>

                    <AnimatePresence>
                        {inputs.useBattery && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="battery-qty-wrapper pt-3">
                                    <label className="text-sm text-gray-600 block mb-1">Battery Units (5.12kWh each)</label>
                                    <div className="number-control">
                                        <button
                                            className="qty-btn"
                                            onClick={() => onChange('batteryUnits', Math.max(1, inputs.batteryUnits - 1))}
                                        >-</button>
                                        <div className="qty-display">
                                            <span className="text-xl font-bold">{inputs.batteryUnits}</span>
                                            <span className="text-xs text-gray-500">{(inputs.batteryUnits * 5.12).toFixed(2)} kWh</span>
                                        </div>
                                        <button
                                            className="qty-btn"
                                            onClick={() => onChange('batteryUnits', Math.min(10, inputs.batteryUnits + 1))}
                                        >+</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="divider"></div>

                {/* System Price */}
                <div className="input-group">
                    <label className="input-label">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        System Price (RM)
                    </label>
                    <div className="input-with-prefix">
                        <span className="input-prefix">RM</span>
                        <input
                            type="number"
                            value={inputs.systemPrice === 0 ? '' : inputs.systemPrice}
                            onChange={handleChange('systemPrice')}
                            placeholder="0"
                            step="100"
                            className="professional-input text-right"
                            style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', paddingLeft: '2.5rem' }}
                            onFocus={(e) => e.target.select()}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

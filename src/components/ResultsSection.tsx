
import React from 'react';
import type { SavingsResult } from '../utils/calculations';

import { CountUpNumber } from './ui/CountUpNumber';

interface Props {
    inputs: {
        systemPrice: number;
        mode: 'kwh' | 'rm';
    };
    results: SavingsResult | null;
}

export const ResultsSection: React.FC<Props> = ({ inputs, results }) => {
    if (!results) return null;

    // Derived values for display
    const daytimeSavings = results.directSavings;
    const nighttimeSavings = results.atapExportCredit + results.batterySavings;
    const annualSavings = results.totalSavings * 12;

    return (
        <div className="card customer-section results-container">
            <h2 className="customer-section-title">
                <span className="step-number">3</span>
                Savings & Financial Results
            </h2>

            <div className="results-layout">
                {/* TOP ROW: BILL COMPARISON */}
                <div className="bill-summary-row animate-fade-in">
                    {/* Current Bill - White Card */}
                    <div className="result-card-base result-card-white">
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Bill</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                            <CountUpNumber value={results.billWithoutSolar} prefix="RM " decimals={2} />
                        </div>
                    </div>

                    {/* New Bill - Dark Blue Card */}
                    <div className="result-card-base result-card-dark-blue">
                        <h3>New Bill</h3>
                        <div className="big-value">
                            <CountUpNumber value={results.finalBill} prefix="RM " decimals={2} />
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: SAVINGS BREAKDOWN */}
                <div className="savings-grid-row animate-fade-in">
                    {/* Monthly Savings */}
                    <div className="result-card-base result-card-green">
                        <h3>Monthly Savings</h3>
                        <div className="green-text-value">
                            <CountUpNumber value={results.totalSavings} prefix="RM " decimals={2} />
                        </div>
                    </div>

                    {/* Daytime Savings */}
                    <div className="result-card-base result-card-green">
                        <h3>Daytime Savings</h3>
                        <div className="green-text-value">
                            <CountUpNumber value={daytimeSavings} prefix="RM " decimals={2} />
                        </div>
                    </div>

                    {/* Nighttime Savings */}
                    <div className="result-card-base result-card-green">
                        <h3>Nighttime Savings</h3>
                        <div className="green-text-value">
                            <CountUpNumber value={nighttimeSavings} prefix="RM " decimals={2} />
                        </div>
                    </div>

                    {/* Annual Savings */}
                    <div className="result-card-base result-card-green">
                        <h3>Annual Savings</h3>
                        <div className="green-text-value">
                            <CountUpNumber value={annualSavings} prefix="RM " decimals={2} />
                        </div>
                    </div>
                </div>

                {/* INVESTMENT METRICS */}
                <div className="bill-summary-row animate-fade-in">
                    {/* Payback Period */}
                    <div className="result-card-base result-card-white">
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Est. Payback Period</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                            {inputs.systemPrice > 0 && annualSavings > 0
                                ? <><CountUpNumber value={inputs.systemPrice / annualSavings} decimals={1} /> Years</>
                                : '-'}
                        </div>
                    </div>

                    {/* ROI */}
                    <div className="result-card-base result-card-white">
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Return on Investment (ROI)</h3>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
                            {inputs.systemPrice > 0 && annualSavings > 0
                                ? <><CountUpNumber value={(annualSavings / inputs.systemPrice) * 100} decimals={1} />%</>
                                : '-'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

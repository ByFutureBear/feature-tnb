
import React, { useState } from 'react';
import type { SavingsResult } from '../utils/calculations';

interface Props {
    results: SavingsResult | null;
}

export const BillBreakdown: React.FC<Props> = ({ results }) => {
    const [collapsed, setCollapsed] = useState(false);

    if (!results) return null;

    const before = results.billDetails;
    const after = results.afterSolarBillDetails;

    // Helper to render rows with tax splits
    const renderRow = (label: string, subLabel: string, nonService: number, service: number) => {
        const total = nonService + service;
        return (
            <tr>
                <td>
                    <div className="font-medium text-gray-800">{label}</div>
                    {subLabel && <div className="text-xs text-gray-500">{subLabel}</div>}
                </td>
                <td className="text-right text-gray-600">{nonService.toFixed(2)}</td>
                <td className="text-right text-gray-600">{service.toFixed(2)}</td>
                <td className="text-right font-medium text-gray-900">{total.toFixed(2)}</td>
            </tr>
        );
    };

    return (
        <div className="mt-8">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>Detailed Bill Breakdown</h3>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
                >
                    {collapsed ? 'Show Breakdown' : 'Hide Breakdown'}
                    <span style={{ fontSize: '0.75rem' }}>{collapsed ? '▼' : '▲'}</span>
                </button>
            </div>

            {!collapsed && (
                <div className="breakdown-comparison-grid animate-fade-in">

                    {/* LEFT CARD: BEFORE SOLAR */}
                    <div>
                        <div className="detailed-header">
                            <span>TNB Bill Breakdown (Before Atap)</span>
                        </div>
                        <div className="detailed-card">
                            <table className="detailed-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>Type of Charges</th>
                                        <th className="text-right">Non-Service Tax</th>
                                        <th className="text-right">Service Tax</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Usage Row */}
                                    <tr>
                                        <td>
                                            <div className="font-medium">Your Usage (kWh)</div>
                                        </td>
                                        <td className="text-right">{before.usageNonService}</td>
                                        <td className="text-right">{before.usageService}</td>
                                        <td className="text-right font-medium">{before.usageTotal}</td>
                                    </tr>

                                    {/* Charges */}
                                    {renderRow(`Energy (${before.usageTotal > 1500 ? '37.03' : '27.03'} sen/kWh)`, '', before.energyNonService, before.energyService)}
                                    {renderRow('Automatic Fuel Adjustment (AFA)', '', before.afaNonService, before.afaService)}
                                    {renderRow('Capacity (4.55 sen/kWh)', '', before.capacityNonService, before.capacityService)}
                                    {renderRow('Network (12.85 sen/kWh)', '', before.networkNonService, before.networkService)}

                                    {/* Retail Charge (only applies to Service Tax portion technically, but mapping cleanly) */}
                                    {renderRow('Retail', '', 0, before.retailService)}

                                    {/* Incentive */}
                                    {before.incentiveTotal !== 0 && renderRow('Energy Efficiency Incentive', '', before.incentiveNonService, before.incentiveService)}

                                    {/* Current Month Charge Subtotal */}
                                    <tr className="subtotal-row">
                                        <td>Current Month Usage Charge (RM)</td>
                                        <td className="text-right highlight-text-blue">{before.usageChargeNonService.toFixed(2)}</td>
                                        <td className="text-right highlight-text-blue">{before.usageChargeService.toFixed(2)}</td>
                                        <td className="text-right highlight-text-blue">{before.usageChargeTotal.toFixed(2)}</td>
                                    </tr>

                                    {/* Taxes */}
                                    <tr>
                                        <td>Service Tax (ST) (8%)</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">{before.serviceTax.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>KWTBB (1.6%)</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">{before.kwtbb.toFixed(2)}</td>
                                    </tr>

                                    {/* Final Total Bar */}
                                    <tr className="total-bar">
                                        <td colSpan={3}>Total Bill (RM)</td>
                                        <td className="text-right">{before.totalBeforeSolar.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT CARD: AFTER SOLAR */}
                    <div>
                        <div className="detailed-header">
                            <span>TNB Bill Breakdown After Atap</span>
                            <span className="text-xs font-normal opacity-80 bg-yellow-200 px-2 py-0.5 rounded">
                                {results.batteryStorageKwh > 0 ? 'With Battery' : 'No Battery Storage'}
                            </span>
                        </div>
                        <div className="detailed-card">

                            {/* SOLAR GENERATION BREAKDOWN BOX */}
                            <div className="solar-gen-box">
                                <div className="solar-gen-title">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    Solar Generation Breakdown
                                </div>
                                <table className="solar-gen-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th className="text-right">kWh</th>
                                            <th className="text-right">Unit Price</th>
                                            <th className="text-right">Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="solar-highlight-row">
                                            <td>Total Solar Generation</td>
                                            <td className="text-center highlight-text-orange">{results.monthlySolarGeneration.toFixed(0)}</td>
                                            <td className="text-center highlight-text-orange">-</td>
                                            <td className="text-center highlight-text-orange">-</td>
                                        </tr>
                                        <tr>
                                            <td>Self Consumption</td>
                                            <td className="text-right">{results.selfConsumptionKwh.toFixed(0)}</td>
                                            <td className="text-right">{results.selfConsumptionRate.toFixed(4)}</td>
                                            <td className="text-right">{(results.selfConsumptionKwh * results.selfConsumptionRate).toFixed(2)}</td>
                                        </tr>
                                        {results.batteryStorageKwh > 0 && (
                                            <tr>
                                                <td>Stored in BESS</td>
                                                <td className="text-right">{results.batteryStorageKwh.toFixed(0)}</td>
                                                <td className="text-right">{results.batteryRate.toFixed(4)}</td>
                                                <td className="text-right">{(results.batteryStorageKwh * results.batteryRate).toFixed(2)}</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td>ATAP Offset <span className="text-xs text-gray-500">(Domestic Energy Charge Rate)</span></td>
                                            <td className="text-right">{results.atapOffsetKwh.toFixed(0)}</td>
                                            <td className="text-right">{results.appliedDomesticRate.toFixed(4)}</td>
                                            <td className="text-right">{results.atapExportCredit.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td>Baki <span className="text-xs text-gray-500">(Carry Forward)</span></td>
                                            <td className="text-right">{results.bakiKwh.toFixed(0)}</td>
                                            <td className="text-right">-</td>
                                            <td className="text-right">-</td>
                                        </tr>
                                        <tr className="font-bold border-t border-green-200">
                                            <td className="pt-2 highlight-text-green">Total Value</td>
                                            <td className="pt-2 text-right">-</td>
                                            <td className="pt-2 text-right">-</td>
                                            <td className="pt-2 text-right highlight-text-green">{((results.selfConsumptionKwh * results.selfConsumptionRate) + results.atapExportCredit + (results.batteryStorageKwh > 0 ? (results.batteryStorageKwh * results.batteryRate) : 0)).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* CHARGES TABLE */}
                            <table className="detailed-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>Type of Charges</th>
                                        <th className="text-right">Non-Service Tax</th>
                                        <th className="text-right">Service Tax</th>
                                        <th className="text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Usage Row */}
                                    <tr>
                                        <td>
                                            <div className="font-medium">Your Usage (kWh)</div>
                                        </td>
                                        <td className="text-right">{after.usageNonService}</td>
                                        <td className="text-right">{after.usageService}</td>
                                        <td className="text-right font-medium">{after.usageTotal}</td>
                                    </tr>

                                    {/* Charges */}
                                    {renderRow(`Energy (${after.usageTotal > 1500 ? '37.03' : '27.03'} sen/kWh)`, '', after.energyNonService, after.energyService)}
                                    {renderRow('Automatic Fuel Adjustment (AFA)', '', after.afaNonService, after.afaService)}
                                    {renderRow('Capacity (4.55 sen/kWh)', '', after.capacityNonService, after.capacityService)}
                                    {renderRow('Network (12.85 sen/kWh)', '', after.networkNonService, after.networkService)}
                                    {renderRow('Retail', '', 0, after.retailService)}

                                    {after.incentiveTotal !== 0 && renderRow('Energy Efficiency Incentive', '', after.incentiveNonService, after.incentiveService)}

                                    {/* Subtotal */}
                                    <tr className="subtotal-row">
                                        <td>Current Month Usage Charge (RM)</td>
                                        <td className="text-right highlight-text-blue">{after.usageChargeNonService.toFixed(2)}</td>
                                        <td className="text-right highlight-text-blue">{after.usageChargeService.toFixed(2)}</td>
                                        <td className="text-right highlight-text-blue">{after.usageChargeTotal.toFixed(2)}</td>
                                    </tr>

                                    {/* Taxes */}
                                    <tr>
                                        <td>Service Tax (ST) (8%)</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">{after.serviceTax.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>KWTBB (1.6%)</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">-</td>
                                        <td className="text-right">{after.kwtbb.toFixed(2)}</td>
                                    </tr>

                                    {/* Footer Summaries */}
                                    <tr className="subtotal-row border-t border-blue-200">
                                        <td colSpan={3} className="py-2">Total After Direct Consumption (RM)</td>
                                        <td className="text-right py-2">{after.totalBeforeSolar.toFixed(2)}</td>
                                    </tr>

                                    {/* Incentive Adjustment */}
                                    <tr>
                                        <td colSpan={3} className="text-xs text-gray-500 py-1">Incentive Adjustment (+ Adjustment for exported energy)</td>
                                        <td className="text-right py-1">+{results.incentiveAdjustment.toFixed(2)}</td>
                                    </tr>

                                    <tr className="subtotal-row">
                                        <td colSpan={3} className="py-2">Total After Incentive Adjustment (RM)</td>
                                        <td className="text-right py-2">{(after.totalBeforeSolar + results.incentiveAdjustment).toFixed(2)}</td>
                                    </tr>

                                    {/* ATAP Offset line */}
                                    <tr>
                                        <td colSpan={3} className="py-2">
                                            <div>ATAP Offset (Domestic Energy Charge Rate)</div>
                                            <div className="text-xs text-gray-500">Offset Rate - RM {results.appliedDomesticRate.toFixed(4)}</div>
                                        </td>
                                        <td className="text-right py-2 text-green-700 font-bold">
                                            -{results.atapExportCredit.toFixed(2)}
                                        </td>
                                    </tr>

                                    {/* Final Total Bar */}
                                    <tr className="total-bar">
                                        <td colSpan={3}>Total After ATAP Only {results.batteryStorageKwh === 0 ? '(No BESS)' : '(With BESS)'} (RM) (F)</td>
                                        <td className="text-right">{results.finalBill.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

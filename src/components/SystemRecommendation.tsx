
import React from 'react';
import type { SavingsResult } from '../utils/calculations';
import { MotionCard } from './ui/MotionCard';
import { CountUpNumber } from './ui/CountUpNumber';
import { motion } from 'framer-motion';

interface Props {
    inputs: {
        panelWattage: number;
        panelCount: number;
        batteryUnits: number;
        batteryKwh: number;
        dischargeDepth: number;
        useBattery: boolean;
        psh: number;
    };
    results: SavingsResult | null;
}

export const SystemRecommendation: React.FC<Props> = ({ inputs, results }) => {
    if (!results) return null;

    const systemCapacity = (inputs.panelWattage * inputs.panelCount / 1000).toFixed(2);
    const dailyGen = (results.monthlySolarGeneration / 30).toFixed(0);


    const totalBatteryCapacity = (inputs.batteryUnits * inputs.batteryKwh).toFixed(2);
    const usableBatteryCapacity = (parseFloat(totalBatteryCapacity) * (inputs.dischargeDepth / 100)).toFixed(2);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="card customer-section"
        >
            <h2 className="customer-section-title">
                <span className="step-number">2</span>
                Solar System Configuration
            </h2>

            <div className="recommendation-box">
                <div className="config-recommendation" style={{ fontWeight: 'bold', marginBottom: '15px', color: 'var(--primary-dark)' }}>System Output</div>
                <div className="rec-main-grid">
                    {/* System Size */}
                    <MotionCard delay={0.1} className="rec-column" style={{ background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' }}>
                        <div className="rec-header-item">
                            <span>System Size</span>
                            <div className="rec-value-large">{systemCapacity} kWp</div>
                        </div>
                        <div className="rec-details">
                            <div className="rec-detail-item">
                                <span>Panels ({inputs.panelWattage}W)</span>
                                <strong>{inputs.panelCount} units</strong>
                            </div>
                        </div>
                    </MotionCard>

                    {/* Generation */}
                    <MotionCard delay={0.2} className="rec-column" style={{ background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' }}>
                        <div className="rec-header-item">
                            <span>Estimate Solar Generation</span>
                            <div className="rec-value-medium">
                                <CountUpNumber value={results.monthlySolarGeneration} suffix=" kWh/month" decimals={0} />
                            </div>
                        </div>
                        <div className="rec-details">
                            <div className="rec-detail-item">
                                <span>Estimate Average</span>
                                <strong>{dailyGen} kWh/day</strong>
                            </div>
                        </div>
                    </MotionCard>

                    {/* Battery */}
                    <MotionCard delay={0.3} className="rec-column" style={{ background: 'transparent', boxShadow: 'none', padding: 0, border: 'none' }}>
                        <div className="rec-header-item">
                            <span>Battery Storage</span>
                            <div className="rec-value-medium">
                                {inputs.useBattery ? `${totalBatteryCapacity} kWh` : 'None'}
                            </div>
                        </div>
                        {inputs.useBattery && (
                            <div className="rec-details">
                                <div className="rec-detail-item">
                                    <span>Usable Capacity</span>
                                    <strong>{usableBatteryCapacity} kWh</strong>
                                </div>
                            </div>
                        )}
                    </MotionCard>

                    {inputs.useBattery && (
                        <div className="rec-column">
                            <div className="rec-header-item">
                                <span>Battery Storage</span>
                                <div className="rec-value-medium">
                                    {results.batteryStorageKwh.toFixed(0)} kWh/month
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

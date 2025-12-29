
import React from 'react';

interface Props {
    inputs: {
        batteryUnits: number;
        daySplit: number;
        psh: number;
        useBattery: boolean;
        panelWattage: number;
        panelCount: number;
        monthlyUsage: number;
    };
}

export const BatteryVisualizer: React.FC<Props> = ({ inputs }) => {
    if (!inputs.useBattery) return null;

    const BATTERY_CAPACITY = 5.12;
    const systemCapacity = (inputs.panelWattage * inputs.panelCount) / 1000;

    // Scenarios: Low (2.0), Curr (Input), High (4.5)
    const scenarios = [
        { id: 'low', psh: 2.0, label: 'Low Sun' },
        { id: 'curr', psh: inputs.psh, label: 'Current Scenario' },
        { id: 'high', psh: 4.5, label: 'High Sun' }
    ];

    const renderScenario = (scen: any) => {
        const dailyGen = systemCapacity * scen.psh;
        const dailyUsage = inputs.monthlyUsage / 30;
        const daytimeUsage = dailyUsage * (inputs.daySplit / 100);

        // Self Use = min(daytimeUsage, 30% of Gen)
        const selfUse = Math.min(daytimeUsage, dailyGen * 0.3);
        let availableForBattery = Math.max(0, dailyGen - selfUse);

        let fullyChargedCount = 0;
        const batteries = [];

        for (let i = 1; i <= inputs.batteryUnits; i++) {
            let chargeAmount = Math.min(BATTERY_CAPACITY, availableForBattery);
            let chargePercent = (chargeAmount / BATTERY_CAPACITY) * 100;

            // Deduct from available
            availableForBattery -= chargeAmount;

            if (chargePercent >= 99.9) fullyChargedCount++;

            let color = '#28a745'; // Green
            if (chargePercent < 30) color = '#ef4444'; // Red
            else if (chargePercent < 80) color = '#eab308'; // Yellow/Orange

            batteries.push(
                <div key={i} className="battery-item">
                    <div className="battery-icon-container">
                        <div
                            className="battery-fill"
                            style={{
                                height: `${chargePercent}%`,
                                background: color
                            }}
                        />
                    </div>
                    <div style={{ fontSize: '10px', marginTop: '2px', color: '#334155' }}>
                        {chargePercent.toFixed(0)}%
                    </div>
                </div>
            );
        }

        let summaryText = "";
        let summaryColor = "";
        if (fullyChargedCount === inputs.batteryUnits) {
            summaryText = "All Fully Charged";
            summaryColor = "#166534";
        } else if (fullyChargedCount === 0) {
            summaryText = "0 Fully Charged";
            summaryColor = "#991b1b";
        } else {
            summaryText = `${fullyChargedCount} / ${inputs.batteryUnits} Fully Charged`;
            summaryColor = "#854d0e";
        }

        return (
            <div key={scen.id} style={{ flex: 1, minWidth: '150px' }}>
                <div style={{
                    textAlign: 'center',
                    fontWeight: 600,
                    marginBottom: '5px',
                    fontSize: '0.9rem',
                    color: scen.id === 'curr' ? '#1a5f7a' : '#666'
                }}>
                    {scen.label}
                    <div style={{ fontSize: '0.8rem', fontWeight: 400 }}>
                        {scen.psh} PSH
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${inputs.batteryUnits > 4 ? 4 : inputs.batteryUnits}, 1fr)`,
                    gap: '5px',
                    justifyContent: 'center'
                }}>
                    {batteries}
                </div>

                <div style={{
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    marginTop: '8px',
                    fontWeight: 600,
                    color: summaryColor
                }}>
                    {summaryText}
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999' }}>
                    Gen: {dailyGen.toFixed(1)} kWh
                </div>
            </div>
        );
    };

    return (
        <div className="card customer-section battery-viz-container">
            <h2 className="battery-viz-header">
                Battery Utilization Scenarios
            </h2>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'space-around' }}>
                {scenarios.map(renderScenario)}
            </div>
        </div>
    );
};

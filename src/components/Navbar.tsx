import React from 'react';
import type { TariffType } from '../utils/calculations';

interface Props {
    tariffType: TariffType;
    onTariffChange: (tariffType: TariffType) => void;
}

export const Navbar: React.FC<Props> = ({ tariffType, onTariffChange }) => {
    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <div className="navbar-brand">
                    <span className="brand-icon">ミ?</span>
                    <span className="brand-text">Saving Calculator</span>
                </div>

                <div className="navbar-actions">
                    <label className="tariff-toggle">
                        <span className="tariff-label">Tariff</span>
                        <select
                            className="tariff-select"
                            value={tariffType}
                            onChange={(event) => onTariffChange(event.target.value as TariffType)}
                        >
                            <option value="standard">Standard</option>
                            <option value="tou">TOU (Time-of-Use)</option>
                        </select>
                    </label>
                </div>
            </div>
        </nav>
    );
};

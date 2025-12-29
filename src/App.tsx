
import { useEffect, useState } from 'react';
import './index.css';
import { calculateAtapSavings, calculateTnbBill, solveUsageFromBill } from './utils/calculations';
import { CustomerInputs } from './components/CustomerInputs';
import { SystemRecommendation } from './components/SystemRecommendation';
import { ResultsSection } from './components/ResultsSection';
import { BillBreakdown } from './components/BillBreakdown';
import RotatingText from './components/ui/RotatingText';
import { BatteryVisualizer } from './components/BatteryVisualizer';
import { Navbar } from './components/Navbar';
import { AnimatedBackground } from './components/ui/AnimatedBackground';

function App() {
  const [inputs, setInputs] = useState({
    monthlyUsage: 0,
    monthlyBill: 0,
    psh: 3.4,
    panelWattage: 650,
    panelCount: 0,
    daySplit: 30,
    afa: 0,
    batteryKwh: 5.12,
    batteryUnits: 2,
    dischargeDepth: 90,
    useBattery: false,
    systemPrice: 0,
    mode: 'kwh' as 'kwh' | 'rm'
  });

  const [results, setResults] = useState<any>(null);

  // Initial Calculation
  useEffect(() => {
    recalculate();
  }, []);

  // Handler for Inputs
  const handleInputChange = (field: string, value: any) => {
    let newInputs = { ...inputs, [field]: value };

    if (field === 'monthlyBill' && newInputs.mode === 'rm') {
      const usage = solveUsageFromBill(value, newInputs.afa);
      newInputs.monthlyUsage = usage;
    }
    else if (field === 'monthlyUsage' && newInputs.mode === 'kwh') {
      const bill = calculateTnbBill(value, newInputs.afa).totalBeforeSolar;
      newInputs.monthlyBill = parseFloat(bill.toFixed(2));
    }
    else if (field === 'mode') {
      if (value === 'rm') {
        const bill = calculateTnbBill(newInputs.monthlyUsage, newInputs.afa).totalBeforeSolar;
        newInputs.monthlyBill = parseFloat(bill.toFixed(2));
      }
    }
    setInputs(newInputs);
  };

  // Debounced Recalculation
  useEffect(() => {
    const timer = setTimeout(() => {
      recalculate();
    }, 500); // Debounce delay to prevent lag on mobile

    return () => clearTimeout(timer);
  }, [inputs]);

  const recalculate = () => {
    const systemSizeKWp = (inputs.panelWattage * inputs.panelCount) / 1000;
    const dailyGeneration = systemSizeKWp * inputs.psh;
    const monthlyGeneration = dailyGeneration * 30;

    const totalBatteryKwh = inputs.useBattery ? inputs.batteryUnits * inputs.batteryKwh : 0;

    const dailyUsage = inputs.monthlyUsage / 30;
    const nightUsage = dailyUsage * ((100 - inputs.daySplit) / 100);

    const usableCapacity = totalBatteryKwh * (inputs.dischargeDepth / 100);

    const storedSolarDaily = Math.min(usableCapacity, nightUsage);

    const daytimeUsage = dailyUsage * (inputs.daySplit / 100);
    const selfUseDaily = Math.min(daytimeUsage, dailyGeneration * 0.3);
    const remainingSolarDaily = dailyGeneration - selfUseDaily;

    const actualStoredDaily = Math.min(remainingSolarDaily, storedSolarDaily);
    const monthlyStored = actualStoredDaily * 30;

    const res = calculateAtapSavings(
      inputs.monthlyUsage,
      monthlyGeneration,
      inputs.daySplit,
      inputs.afa,
      monthlyStored
    );

    setResults(res);
  };


  return (
    <AnimatedBackground>
      <div className="app-wrapper">
        <Navbar />

        <main className="container main-content">
          <header className="hero">
            <div className="hero-content">
              <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                Alpha Solar
                <RotatingText
                  texts={['Battery Storage System', 'New Solar Atap Scheme', 'Saving Calculator']}
                  mainClassName="rotating-text-box"
                  style={{
                    backgroundColor: '#10b981', // Emerald-500 equivalent for better visibility
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="rotating-text-char"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                />
              </h1>
              <p className="hero-subtitle">Solar Energy Calculator</p>
            </div>
          </header>

          <div className="main-layout-grid">
            <div className="left-column">
              <CustomerInputs inputs={inputs} onChange={handleInputChange} />
            </div>

            <div className="right-column">
              <SystemRecommendation inputs={inputs} results={results} />
              <BatteryVisualizer inputs={inputs} />
              <ResultsSection inputs={inputs} results={results} />
            </div>
          </div>

          <BillBreakdown results={results} />
        </main>

        <footer className="site-footer">
          <div className="container">
            <div style={{ marginBottom: '2rem', fontSize: '0.75rem', color: '#d1d5db', textAlign: 'justify', lineHeight: '1.5' }}>
              <h4 style={{ fontWeight: 'bold', color: '#f3f4f6', textTransform: 'none', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.875rem' }}>Disclaimer & Important Notice:</h4>
              <p style={{ marginBottom: '1.5rem' }}>
                The calculations, cost estimates, and savings projections generated by this Solar Energy Calculator are for <span style={{ fontWeight: 'bold', color: '#ffffff' }}>illustrative purposes only</span> and are estimations based on the data provided and typical solar generation scenarios. Actual system performance, savings, and Return on Investment (ROI) will vary depending on site-specific factors, including but not limited to weather conditions, roof orientation, shading, energy usage patterns, future tariff rate changes, and equipment efficiency.
              </p>

              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1.5rem', color: '#d1d5db' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  Actual savings are highly dependent on consumption patterns. Variations in monthly usage may result in savings that differ from the estimated figures.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  TNB bill estimates are based on the standard (non-Time of Use) tariff and do not include the Automatic Fuel Adjustment (AFA), which is applied monthly and may result in either additional charges or rebates.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Peak Sun Hour (PSH): The solar generation calculation is based on an estimated PSH value. This is an average estimate and not an accurate constant, as actual daily output varies by weather and location.
                </li>
              </ul>

              <p style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 'bold', color: '#f3f4f6' }}>Battery Storage:</span> All battery storage figures (including capacity, backup duration, and savings from self-consumption) are estimates based on optimal usage conditions. Actual backup performance depends on the connected load and battery state of charge at the time of usage.
              </p>
              <p>
                <span style={{ fontWeight: 'bold', color: '#f3f4f6' }}>Non-Binding:</span> The system recommendations and financial projections provided herein do not constitute a binding offer, guarantee of performance, or compulsory requirement. Users are strongly advised to consult with a qualified solar energy professional for a comprehensive site assessment and detailed formal quotation before making any purchase decisions. We accept no liability for any discrepancies between these estimates and actual realized results.
              </p>
            </div>

            <p className="text-center text-gray-400 text-sm">© 2025 Solar Energy Calculator. By Hong.</p>
          </div>
        </footer>
      </div>
    </AnimatedBackground>
  );

}

export default App;


// TNB Tariff Rates (RM/kWh)
export const RETAIL_TARIFF_LOW = 0.4443;
export const RETAIL_TARIFF_HIGH = 0.5443;

// TNB Billing Logic from NEM Calculator
export const rates = {
    domestic: {
        energy: 27.03,
        energyHigh: 37.03,
        capacity: 4.55,
        network: 12.85,
        retail: 10.00,
    }
};

// Energy Efficiency Incentive rates (RM per kWh)
export const incentiveRates = [
    { min: 1, max: 200, rate: -0.25 },
    { min: 201, max: 250, rate: -0.245 },
    { min: 251, max: 300, rate: -0.225 },
    { min: 301, max: 350, rate: -0.21 },
    { min: 351, max: 400, rate: -0.17 },
    { min: 401, max: 450, rate: -0.145 },
    { min: 451, max: 500, rate: -0.12 },
    { min: 501, max: 550, rate: -0.105 },
    { min: 551, max: 600, rate: -0.09 },
    { min: 601, max: 650, rate: -0.075 },
    { min: 651, max: 700, rate: -0.055 },
    { min: 701, max: 750, rate: -0.045 },
    { min: 751, max: 800, rate: -0.04 },
    { min: 801, max: 850, rate: -0.025 },
    { min: 851, max: 900, rate: -0.01 },
    { min: 901, max: 1000, rate: -0.005 }
];

export function getIncentiveRate(usage: number): number {
    for (const range of incentiveRates) {
        if (usage >= range.min && usage <= range.max) {
            return range.rate;
        }
    }
    return 0;
}

// FIXED: Calculate incentive adjustment with maximum limit - cannot exceed original incentive amount
export function calculateIncentiveAdjustment(exportedEnergy: number, originalUsage: number, originalIncentiveTotal: number): number {
    const originalIncentiveRate = getIncentiveRate(originalUsage);
    const maxIncentiveRate = -0.25; // Maximum rate from incentive structure

    // Use the maximum rate (absolute value) but don't exceed the original incentive amount
    const adjustmentRate = Math.min(Math.abs(originalIncentiveRate), Math.abs(maxIncentiveRate));

    // Export kWh × Rate (converted to positive to add back to bill)
    const calculatedAdjustment = exportedEnergy * adjustmentRate;

    // FIXED: Cap the adjustment at the absolute value of the original incentive total
    // This ensures we don't add back more than the original incentive amount
    const maxAdjustment = Math.abs(originalIncentiveTotal);
    const finalAdjustment = Math.min(calculatedAdjustment, maxAdjustment);

    return finalAdjustment;
}

// Helper to get description text
export function getEnergyRateDescription(monthlyUsage: number): string {
    return monthlyUsage > 1500 ? "Energy (37.03 sen/kWh)" : "Energy (27.03 sen/kWh)";
}

export interface BillDetails {
    billAmount: number;
    usageNonService: number;
    usageService: number;
    usageTotal: number;
    energyNonService: number;
    energyService: number;
    energyTotal: number;
    afaNonService: number;
    afaService: number;
    afaTotal: number;
    capacityNonService: number;
    capacityService: number;
    capacityTotal: number;
    networkNonService: number;
    networkService: number;
    networkTotal: number;
    retailService: number;
    incentiveNonService: number;
    incentiveService: number;
    incentiveTotal: number;
    usageChargeNonService: number;
    usageChargeService: number;
    usageChargeTotal: number;
    serviceTax: number;
    kwtbb: number;
    totalBeforeSolar: number;
}

// Calculate TNB Bill using the real billing formula
export function calculateTnbBill(usage: number, afaRate: number): BillDetails {
    // Convert usage to numbers and handle NaN
    usage = parseFloat(usage.toString());
    afaRate = parseFloat(afaRate.toString());

    if (isNaN(usage)) usage = 0;
    if (isNaN(afaRate)) afaRate = 0;

    // Determine tariff rate based on usage
    const highUsage = usage > 1500;
    const energyRateSen = highUsage ? rates.domestic.energyHigh : rates.domestic.energy;
    const energyRateRM = energyRateSen / 100;

    // Calculate base and excess usage
    const baseUsage = Math.min(usage, 600);
    const excessUsage = Math.max(usage - 600, 0);

    // Calculate energy charges
    const baseEnergy = baseUsage * energyRateRM;
    const excessEnergy = excessUsage * energyRateRM;

    // Calculate other charges
    const capacityRateRM = rates.domestic.capacity / 100;
    const networkRateRM = rates.domestic.network / 100;

    const baseCapacity = baseUsage * capacityRateRM;
    const excessCapacity = excessUsage * capacityRateRM;

    const baseNetwork = baseUsage * networkRateRM;
    const excessNetwork = excessUsage * networkRateRM;

    // Calculate incentive (based on usage)
    const incentiveRate = getIncentiveRate(usage);
    const baseIncentive = baseUsage * incentiveRate;
    const excessIncentive = excessUsage * incentiveRate;
    const totalIncentive = baseIncentive + excessIncentive;

    // Retail charge (only for excess usage)
    const retailCharge = excessUsage > 0 ? rates.domestic.retail : 0;

    // AFA calculation - Only applies when usage > 600 kWh
    const afaRateRM = afaRate / 100;

    let baseAFA = 0;
    let excessAFA = 0;
    let totalAFA = 0;

    if (usage > 600) {
        baseAFA = baseUsage * afaRateRM;
        excessAFA = excessUsage * afaRateRM;
        totalAFA = baseAFA + excessAFA;
    }

    // Current Monthly Usage Charge (before KWTBB and SST)
    const withoutServiceTax = baseEnergy + baseCapacity + baseNetwork + baseIncentive + baseAFA;
    const withServiceTax = excessEnergy + excessCapacity + excessNetwork + retailCharge + excessIncentive + excessAFA;
    const currentCharge = withoutServiceTax + withServiceTax;

    // KWTBB calculation (1.6% of specific components for usage > 300kWh)
    const kwtbbBase = (baseEnergy + excessEnergy) + (baseCapacity + excessCapacity) + (baseNetwork + excessNetwork) + (baseIncentive + excessIncentive);

    const kwtbb = usage > 300 ? Math.round(kwtbbBase * 0.016 * 100) / 100 : 0;

    // SST calculation (8% on just the "With Service Tax" portion)
    let sst = 0;

    if (excessUsage > 0) {
        sst = Math.round(withServiceTax * 0.08 * 100) / 100;
    }

    // Final total
    const grandTotal = currentCharge + kwtbb + sst;

    return {
        billAmount: grandTotal,
        usageNonService: baseUsage,
        usageService: excessUsage,
        usageTotal: usage,
        energyNonService: baseEnergy,
        energyService: excessEnergy,
        energyTotal: baseEnergy + excessEnergy,
        afaNonService: baseAFA,
        afaService: excessAFA,
        afaTotal: totalAFA,
        capacityNonService: baseCapacity,
        capacityService: excessCapacity,
        capacityTotal: baseCapacity + excessCapacity,
        networkNonService: baseNetwork,
        networkService: excessNetwork,
        networkTotal: baseNetwork + excessNetwork,
        retailService: retailCharge,
        incentiveNonService: baseIncentive,
        incentiveService: excessIncentive,
        incentiveTotal: totalIncentive,
        usageChargeNonService: withoutServiceTax,
        usageChargeService: withServiceTax,
        usageChargeTotal: currentCharge,
        serviceTax: sst,
        kwtbb: kwtbb,
        totalBeforeSolar: grandTotal
    };
}

// Helper function to get Domestic Energy Rate
export function getDomesticEnergyRate(monthlyUsage: number): number {
    return monthlyUsage > 1500 ? (rates.domestic.energyHigh / 100) : (rates.domestic.energy / 100);
}

// Calculate After Solar Bill
export function calculateAfterSolarBill(monthlyUsage: number, selfConsumptionKwh: number, afaRate: number): BillDetails {
    const gridUsageAfterSolar = Math.max(0, monthlyUsage - selfConsumptionKwh);
    return calculateTnbBill(gridUsageAfterSolar, afaRate);
}


// Determine tariff rate from usage (for utility purposes)
export function getTariffRate(monthlyUsage: number): number {
    return monthlyUsage > 1500 ? RETAIL_TARIFF_HIGH : RETAIL_TARIFF_LOW;
}


// Convert bill to kWh and vice versa
// NEW: Accurate reverse calculation (Integer only)
export function solveUsageFromBill(targetBill: number, afaRate: number): number {
    if (isNaN(targetBill) || targetBill < 0) return 0;
    let low = 1;
    let high = 10000; // Realistic max kWh for domestic
    let mid = 0;
    let iterations = 0;

    let bestUsage = 0;
    let minDiff = Infinity;

    // Binary search for closest match (using floats to narrow down)
    while (low <= high && iterations < 50) {
        mid = (low + high) / 2;

        const billDetails = calculateTnbBill(mid, afaRate);
        const resultBill = billDetails.totalBeforeSolar;
        const diff = Math.abs(resultBill - targetBill);

        if (diff < minDiff) {
            minDiff = diff;
            bestUsage = mid;
        }

        if (diff < 0.05) {
            break; // Close enough locally
        }

        if (resultBill < targetBill) {
            low = mid + 0.1;
        } else {
            high = mid - 0.1;
        }
        iterations++;
    }

    // Refine to integer: Compare floor and ceil of bestUsage
    // to see which integer yields a closer bill.
    const floorUsage = Math.floor(bestUsage);
    const ceilUsage = Math.ceil(bestUsage);

    const floorBill = calculateTnbBill(floorUsage, afaRate).totalBeforeSolar;
    const ceilBill = calculateTnbBill(ceilUsage, afaRate).totalBeforeSolar;

    const floorDiff = Math.abs(floorBill - targetBill);
    const ceilDiff = Math.abs(ceilBill - targetBill);

    return floorDiff <= ceilDiff ? floorUsage : ceilUsage;
}

export interface SavingsResult {
    billWithoutSolar: number;
    billWithSolar: number;
    finalBill: number;
    monthlyUsage: number;
    monthlySolarGeneration: number;
    selfConsumptionKwh: number;
    selfConsumptionPercent: number;
    batteryStorageKwh: number;
    netImportKwh: number;
    exportableSolar: number;
    atapOffsetKwh: number;
    bakiKwh: number;
    directSavings: number;
    batterySavings: number;
    atapExportCredit: number;
    incentiveAdjustment: number;
    totalSavings: number;
    savingsPercentage: number;
    billDetails: BillDetails;
    afterSolarBillDetails: BillDetails;
    appliedDomesticRate: number;
    selfConsumptionRate: number;
    batteryRate: number;
}

// Calculate ATAP Savings (Scenario E: Selco + Atap)
export function calculateAtapSavings(monthlyUsage: number, monthlySolarGeneration: number, selfConsumptionPercent: number, afaRate: number, batteryStorageKwh: number): SavingsResult {
    const selfConsumptionKwh = Math.min(monthlySolarGeneration, monthlyUsage * (selfConsumptionPercent / 100));

    // Note: batteryStorageKwh is passed in as argument now instead of reading DOM

    const exportedSolar = Math.max(0, monthlySolarGeneration - selfConsumptionKwh - batteryStorageKwh);

    // Calculate original bill (still needed for billWithoutSolar)
    const originalBill = calculateTnbBill(monthlyUsage, afaRate);

    // const originalIncentiveTotal = originalBill.incentiveTotal; // Unused


    // FIXED: Moved incentive calculation to after billWithSolar calculation to use Net Import values
    // const incentiveAdjustment = calculateIncentiveAdjustment(exportedSolar, monthlyUsage, originalIncentiveTotal);

    const billWithoutSolar = originalBill;

    // Cap ATAP offset at Net Import
    // Round net import to nearest integer to consistent with TNB billing blocks and display
    const netImportKwh = Math.round(Math.max(0, monthlyUsage - selfConsumptionKwh - batteryStorageKwh));

    // UPDATED: Battery Rate now follows the "After Atap" usage (Net Import)
    const batteryRate = getTariffRate(netImportKwh);

    const atapOffsetKwh = Math.min(exportedSolar, netImportKwh);
    const atapBakiKwh = Math.max(0, exportedSolar - netImportKwh);

    // Calculate Bill With Solar using ROUNDED net usage
    const billWithSolar = calculateTnbBill(netImportKwh, afaRate);

    // FIXED: Calculate Incentive Adjustment based on After Solar (Net Import) values
    // usage -> netImportKwh
    // impact limit -> billWithSolar.incentiveTotal
    const incentiveAdjustment = calculateIncentiveAdjustment(exportedSolar, netImportKwh, billWithSolar.incentiveTotal);

    const directSavings = billWithoutSolar.billAmount - billWithSolar.billAmount;
    const batterySavings = batteryStorageKwh * batteryRate;

    // Determine Domestic Rate based on ROUNDED Net Import
    const dynamicDomesticRate = getDomesticEnergyRate(netImportKwh);
    // Use Target Tariff based on ROUNDED Net Import (0.4443 or 0.5443)
    const selfConsumptionRate = getTariffRate(netImportKwh);

    const atapExportCredit = atapOffsetKwh * dynamicDomesticRate;

    // Total Actual Savings = (Old Bill - New Bill from Net Import) + Export Credit
    // Note: billWithSolar is derived from Net Import, so it already accounts for the benefits of Self-Consumption AND BESS Discharge.
    const realTotalSavings = directSavings + atapExportCredit;

    // For display purposes, we split into "Daytime" and "Nighttime"
    // Nighttime = Battery Discharge Value + ATAP Export Credit
    const nighttimeSavingsDisplay = batterySavings + atapExportCredit;

    // Daytime = Remainder (Solar Self-Consumption Value)
    const daytimeSavingsDisplay = realTotalSavings - nighttimeSavingsDisplay;

    const finalBill = Math.max(0, billWithSolar.billAmount - atapExportCredit + incentiveAdjustment);
    const savingsPercentage = (realTotalSavings / billWithoutSolar.billAmount) * 100;

    return {
        billWithoutSolar: billWithoutSolar.billAmount,
        billWithSolar: billWithSolar.billAmount,
        finalBill: finalBill,
        monthlyUsage: monthlyUsage,
        monthlySolarGeneration: monthlySolarGeneration,
        selfConsumptionKwh: selfConsumptionKwh,
        selfConsumptionPercent: selfConsumptionPercent,
        batteryStorageKwh: batteryStorageKwh,
        netImportKwh: netImportKwh,
        exportableSolar: exportedSolar,
        atapOffsetKwh: atapOffsetKwh,
        bakiKwh: atapBakiKwh,
        atapExportCredit: atapExportCredit,
        // directSavings in UI maps to "Daytime Savings", so we pass the calculated daytime portion
        directSavings: daytimeSavingsDisplay,
        batterySavings: batterySavings,
        // totalSavings should matches the breakdown sum
        totalSavings: realTotalSavings,
        incentiveAdjustment: incentiveAdjustment,
        savingsPercentage: savingsPercentage,
        billDetails: billWithoutSolar,
        afterSolarBillDetails: billWithSolar,
        appliedDomesticRate: dynamicDomesticRate, // Export rate used
        selfConsumptionRate: selfConsumptionRate,
        batteryRate: batteryRate
    };
}

// Calculate ATAP Only (No BESS) Savings
export function calculateAtapOnlyNoBess(monthlyUsage: number, monthlySolarGeneration: number, selfConsumptionPercent: number, afaRate: number): SavingsResult {
    const selfConsumptionKwh = Math.min(monthlySolarGeneration, monthlyUsage * (selfConsumptionPercent / 100));
    const exportedSolar = Math.max(0, monthlySolarGeneration - selfConsumptionKwh);

    // Calculate original bill to get the original incentive total
    const originalBill = calculateTnbBill(monthlyUsage, afaRate);
    // const originalIncentiveTotal = originalBill.incentiveTotal; // Unused

    // FIXED: Moved incentive calculation to after billWithSolar calculation
    // const incentiveAdjustment = calculateIncentiveAdjustment(exportedSolar, monthlyUsage, originalIncentiveTotal);

    const billWithoutSolar = originalBill;

    // NEW LOGIC: Cap ATAP offset at Net Import
    // Round net import to nearest integer for consistency
    const netImportKwh = Math.round(Math.max(0, monthlyUsage - selfConsumptionKwh));
    const atapOffsetKwh = Math.min(exportedSolar, netImportKwh);
    const atapBakiKwh = Math.max(0, exportedSolar - netImportKwh);

    // Calculate Bill With Solar using ROUNDED net usage
    const billWithSolar = calculateTnbBill(netImportKwh, afaRate);

    // FIXED: Calculate Incentive Adjustment based on After Solar values
    const incentiveAdjustment = calculateIncentiveAdjustment(exportedSolar, netImportKwh, billWithSolar.incentiveTotal);

    const directSavings = billWithoutSolar.billAmount - billWithSolar.billAmount;
    const batterySavings = 0;

    // FIXED: Determine Domestic Rate based on ROUNDED Net Import
    const dynamicDomesticRate = getDomesticEnergyRate(netImportKwh);
    // Use Target Tariff based on ROUNDED Net Import (0.4443 or 0.5443)
    const selfConsumptionRate = getTariffRate(netImportKwh);

    const atapExportCredit = atapOffsetKwh * dynamicDomesticRate;
    const totalSavings = directSavings + batterySavings + atapExportCredit;
    const finalBill = Math.max(0, billWithSolar.billAmount - atapExportCredit + incentiveAdjustment);
    const savingsPercentage = (totalSavings / billWithoutSolar.billAmount) * 100;

    return {
        billWithoutSolar: billWithoutSolar.billAmount,
        billWithSolar: billWithSolar.billAmount,
        finalBill: finalBill,
        monthlyUsage: monthlyUsage,
        monthlySolarGeneration: monthlySolarGeneration,
        selfConsumptionKwh: selfConsumptionKwh,
        selfConsumptionPercent: selfConsumptionPercent,
        batteryStorageKwh: 0,
        netImportKwh: Math.round(Math.max(0, monthlyUsage - selfConsumptionKwh)),
        exportableSolar: exportedSolar,
        atapOffsetKwh: atapOffsetKwh,
        bakiKwh: atapBakiKwh,
        directSavings: directSavings,
        batterySavings: batterySavings,
        atapExportCredit: atapExportCredit,
        incentiveAdjustment: incentiveAdjustment,
        totalSavings: totalSavings,
        savingsPercentage: savingsPercentage,
        billDetails: billWithoutSolar,
        afterSolarBillDetails: billWithSolar,
        appliedDomesticRate: dynamicDomesticRate,
        selfConsumptionRate: selfConsumptionRate,
        batteryRate: 0
    };
}

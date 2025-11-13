import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AmortizationEntry, CurrencyCode } from '../types';

interface LoanChartProps {
  regularData: AmortizationEntry[];
  extraPaymentData: AmortizationEntry[]; // Changed from stepUpData
  currencyCode: CurrencyCode; // Added currencyCode prop
}

const LoanChart: React.FC<LoanChartProps> = ({ regularData, extraPaymentData, currencyCode }) => {
  const chartData = [];
  const maxMonths = Math.max(
    regularData.length > 0 ? regularData[regularData.length - 1].month : 0,
    extraPaymentData.length > 0 ? extraPaymentData[extraPaymentData.length - 1].month : 0 // Changed
  );

  // Combine data for charting. Fill in missing months with last known values.
  for (let i = 0; i < maxMonths; i++) {
    const month = i + 1;
    const regularEntry = regularData.find(d => d.month === month) || regularData[regularData.length - 1];
    const extraPaymentEntry = extraPaymentData.find(d => d.month === month) || extraPaymentData[extraPaymentData.length - 1]; // Changed

    const regularCumulativeInterest = regularEntry ? regularEntry.cumulativeInterest : 0;
    const extraPaymentCumulativeInterest = extraPaymentEntry ? extraPaymentEntry.cumulativeInterest : 0;

    chartData.push({
      month,
      // Regular EMI Data
      regularRemainingBalance: regularEntry ? Math.max(0, regularEntry.endingBalance) : 0,
      regularCumulativeInterest: regularCumulativeInterest,
      regularCumulativePrincipal: regularEntry ? regularEntry.cumulativePrincipal : 0,
      regularEMI: regularEntry ? regularEntry.emi : 0,

      // Extra Payment EMI Data (formerly Step-up)
      extraPaymentRemainingBalance: extraPaymentEntry ? Math.max(0, extraPaymentEntry.endingBalance) : 0, // Changed
      extraPaymentCumulativeInterest: extraPaymentCumulativeInterest, // Changed
      extraPaymentCumulativePrincipal: extraPaymentEntry ? extraPaymentEntry.cumulativePrincipal : 0, // Changed
      extraPaymentEMI: extraPaymentEntry ? extraPaymentEntry.emi : 0, // Changed

      // New: Cumulative Interest Saved
      cumulativeInterestSaved: extraPaymentData.length > 0
        ? Math.max(0, regularCumulativeInterest - extraPaymentCumulativeInterest)
        : 0,
    });
  }

  const chartMaxMonths = Math.max(
    regularData.length > 0 ? regularData[regularData.length - 1].month : 0,
    extraPaymentData.length > 0 ? extraPaymentData[extraPaymentData.length - 1].month : 0 // Changed
  );

  const filteredChartData = chartData.filter(entry => entry.month <= chartMaxMonths);

  const formatCurrency = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(value);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentMonthData = payload[0].payload; // Access the full data object for the month
      const years = Math.floor(label / 12);
      const months = label % 12;

      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-300 text-xs font-semibold text-gray-800">
          <p className="text-base font-semibold mb-1.5">Month: {label} ({years}Y {months}M)</p>
          {payload.map((entry: any, index: number) => {
            const { name, value, stroke } = entry;
            let displayValue = formatCurrency(value);

            // Add cumulative interest paid for both scenarios if available
            if (name === "Regular Remaining Balance" && currentMonthData.regularCumulativeInterest !== undefined) {
              displayValue += ` | Paid Interest: ${formatCurrency(currentMonthData.regularCumulativeInterest)}`;
            } else if (name === "Extra Payment Remaining Balance" && currentMonthData.extraPaymentCumulativeInterest !== undefined) {
              displayValue += ` | Paid Interest: ${formatCurrency(currentMonthData.extraPaymentCumulativeInterest)}`;
            }
            
            return (
              <p key={`item-${index}`} style={{ color: stroke }} className="py-0.5">
                {`${name}: `}
                <span className="font-mono">{displayValue}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const exportToCsv = () => {
    if (filteredChartData.length === 0) {
      alert("No data to export. Please enter loan details.");
      return;
    }

    const headers = [
      "Month",
      "Regular Remaining Balance",
      "Regular Cumulative Interest",
      "Regular Cumulative Principal",
      "Regular EMI",
      "Extra Payment Remaining Balance",
      "Extra Payment Cumulative Interest",
      "Extra Payment Cumulative Principal",
      "Extra Payment EMI",
      "Cumulative Interest Saved"
    ];

    const csvRows = [headers.join(',')];

    filteredChartData.forEach(row => {
      const values = [
        row.month,
        row.regularRemainingBalance,
        row.regularCumulativeInterest,
        row.regularCumulativePrincipal,
        row.regularEMI,
        row.extraPaymentRemainingBalance,
        row.extraPaymentCumulativeInterest,
        row.extraPaymentCumulativePrincipal,
        row.extraPaymentEMI,
        row.cumulativeInterestSaved
      ].map(value => {
        // Ensure numbers are formatted as plain numbers for CSV, not currency strings
        return typeof value === 'number' ? value.toFixed(2) : value;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'loan_amortization_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl mb-12 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 scale-100 hover:scale-[1.005]" role="region" aria-labelledby="loan-chart-heading">
      <div className="flex justify-between items-center mb-7 pb-5 border-b-2 border-indigo-200">
        <h2 id="loan-chart-heading" className="text-2xl font-extrabold text-indigo-800 text-center">Loan Amortization Chart</h2>
        <button
          onClick={exportToCsv}
          disabled={filteredChartData.length === 0}
          className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Download chart data as CSV"
        >
          Download Data (CSV)
        </button>
      </div>
      
      {filteredChartData.length === 0 ? (
        <p className="text-center text-gray-600 text-lg font-medium">No data to display. Please enter valid loan details.</p>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <LineChart
            data={filteredChartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            aria-label="Loan Amortization Comparison Chart"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="month"
              label={{ value: 'Month', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: '12px' }}
              tickFormatter={(value: number) => (value % 12 === 0 ? `${value / 12}Y` : '')} // Show years
              axisLine={{ stroke: '#cbd5e0' }}
              tickLine={{ stroke: '#cbd5e0' }}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              label={{ value: 'Amount', angle: -90, position: 'insideLeft', offset: -5, fill: '#6b7280', fontSize: '12px' }}
              tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`} // Convert to Millions
              axisLine={{ stroke: '#cbd5e0' }}
              tickLine={{ stroke: '#cbd5e0' }}
            />
            <Tooltip
              content={CustomTooltip} // Use custom tooltip
              labelStyle={{ fontWeight: 'bold', color: '#333' }}
              itemStyle={{ color: '#555' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: '#6b7280' }} iconType="circle" />

            <Line
              type="monotone"
              dataKey="regularRemainingBalance"
              stroke="#6366f1" // Indigo-500
              activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              name="Regular Remaining Balance"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="extraPaymentRemainingBalance" // Changed
              stroke="#22c55e" // Green-500
              activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
              name="Extra Payment Remaining Balance" // Changed
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="regularCumulativeInterest"
              stroke="#f97316" // Orange-500
              name="Regular Cumulative Interest"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="extraPaymentCumulativeInterest" // Changed
              stroke="#a855f7" // Purple-500
              name="Extra Payment Cumulative Interest" // Changed
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            {extraPaymentData.length > 0 && (
              <Line
                type="monotone"
                dataKey="cumulativeInterestSaved"
                stroke="#facc15" // Yellow-400 for saved interest
                name="Cumulative Interest Saved"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default LoanChart;
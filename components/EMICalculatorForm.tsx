import React from 'react';
import InputSlider from './InputSlider';
import { CurrencyCode } from '../types';

interface EMICalculatorFormProps {
  principal: number;
  onPrincipalChange: (value: number) => void;
  annualInterestRate: number;
  onAnnualInterestRateChange: (value: number) => void;
  loanTenureYears: number;
  onLoanTenureYearsChange: (value: number) => void;
  currencyCode: CurrencyCode;
  onCurrencyCodeChange: (value: CurrencyCode) => void;
  onReset: () => void;
  principalError?: string; // New: Add principalError prop
}

const EMICalculatorForm: React.FC<EMICalculatorFormProps> = ({
  principal,
  onPrincipalChange,
  annualInterestRate,
  onAnnualInterestRateChange,
  loanTenureYears,
  onLoanTenureYearsChange,
  currencyCode,
  onCurrencyCodeChange,
  onReset,
  principalError, // Destructure principalError
}) => {
  const currencies: { code: CurrencyCode; name: string }[] = [
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
  ];

  return (
    <div className="bg-white p-8 lg:p-9 rounded-3xl shadow-xl border border-gray-100 h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 scale-100 hover:scale-[1.005]">
      <h2 className="text-3xl sm:text-3xl font-extrabold text-indigo-900 mb-8 pb-5 border-b-2 border-indigo-200 text-center">Loan Details</h2>
      
      <div className="mb-7">
        <label htmlFor="currency-select" className="block text-gray-700 text-base font-semibold mb-2">
          Select Currency: <span className="text-indigo-700 font-extrabold text-xl">{currencyCode}</span>
        </label>
        <select
          id="currency-select"
          value={currencyCode}
          onChange={(e) => onCurrencyCodeChange(e.target.value as CurrencyCode)}
          className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base font-medium outline-none cursor-pointer bg-gray-50 transition-all duration-200 hover:bg-gray-100 hover:border-indigo-400 focus:border-indigo-500"
          aria-label="Select Currency"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>

      <InputSlider
        label="Loan Amount"
        value={principal}
        min={100000}
        max={100000000}
        step={100000}
        onChange={onPrincipalChange}
        currencyCode={currencyCode}
        errorMessage={principalError} // New: Pass principalError
      />
      <InputSlider
        label="Annual Interest Rate"
        value={annualInterestRate}
        min={0.1}
        max={20}
        step={0.1}
        onChange={onAnnualInterestRateChange}
        unit="%"
        maximumFractionDigits={1}
      />
      <InputSlider
        label="Loan Tenure"
        value={loanTenureYears}
        min={1}
        max={30}
        step={1}
        onChange={onLoanTenureYearsChange}
        unit=" years"
      />

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="px-7 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 ease-in-out text-base"
          aria-label="Reset all loan details to default values"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default EMICalculatorForm;
import React from 'react';
import InputSlider from './InputSlider';
import { CurrencyCode } from '../types';

interface ExtraPaymentOptionsProps {
  isExtraPaymentEnabled: boolean;
  onToggleExtraPayment: (value: boolean) => void;
  extraEmiPerYear: number;
  onExtraEmiPerYearChange: (value: number) => void;
  currencyCode: CurrencyCode; // Added currencyCode
}

const ExtraPaymentOptions: React.FC<ExtraPaymentOptionsProps> = ({
  isExtraPaymentEnabled,
  onToggleExtraPayment,
  extraEmiPerYear,
  onExtraEmiPerYearChange,
  currencyCode,
}) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 scale-100 hover:scale-[1.005]">
      <h2 className="text-2xl font-extrabold text-indigo-800 mb-7 pb-4 border-b-2 border-indigo-100">Extra Payment Option</h2>
      <div className="mb-7 flex items-center">
        <input
          type="checkbox"
          id="isExtraPaymentEnabled"
          checked={isExtraPaymentEnabled}
          onChange={(e) => onToggleExtraPayment(e.target.checked)}
          className="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer transition-colors duration-200 ease-in-out checked:bg-indigo-600 checked:border-indigo-600 accent-indigo-600"
          aria-checked={isExtraPaymentEnabled}
          role="switch"
        />
        <label htmlFor="isExtraPaymentEnabled" className="ml-3 block text-gray-700 text-base font-medium cursor-pointer select-none">
          Enable Extra Payment per Year
        </label>
      </div>

      {isExtraPaymentEnabled && (
        <InputSlider
          label="Extra Payment Amount per Year"
          value={extraEmiPerYear}
          min={0}
          max={1000000} // Max extra payment amount
          step={1000}
          onChange={onExtraEmiPerYearChange}
          currencyCode={currencyCode} // Pass currency code for formatting
        />
      )}
    </div>
  );
};

export default ExtraPaymentOptions;
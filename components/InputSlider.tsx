import React from 'react';
import { CurrencyCode } from '../types';

interface InputSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  currencyCode?: CurrencyCode; // Added for currency display
  maximumFractionDigits?: number; // Added to control fraction digits
  errorMessage?: string; // New: Error message prop
}

const InputSlider: React.FC<InputSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
  currencyCode,
  maximumFractionDigits = 0, // Default to 0 for most monetary values
  errorMessage, // Destructure errorMessage
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = Number(e.target.value);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (e.target.value === '') {
      // Allow clearing the input without immediately setting to 0 or min.
      // The parent component should handle validation of the empty state if needed.
      onChange(0); // Pass 0 for an empty string, letting parent validation handle min check
    }
  };

  const id = label.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, ''); // Sanitize ID
  const errorId = `${id}-error`;

  const formattedValue = currencyCode
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: maximumFractionDigits,
        minimumFractionDigits: maximumFractionDigits,
      }).format(value)
    : value.toLocaleString(undefined, { maximumFractionDigits: maximumFractionDigits, minimumFractionDigits: maximumFractionDigits }) + unit;

  return (
    <div className="mb-6" role="group" aria-labelledby={`${id}-label`}>
      <label id={`${id}-label`} htmlFor={id} className="block text-gray-700 text-base font-semibold mb-2">
        {label}: <span className="text-indigo-700 font-extrabold text-2xl">{formattedValue}</span>
      </label>
      <div className="flex items-center space-x-4">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2.5 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner transition-all duration-200 ease-in-out hover:opacity-80"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-label={label}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : undefined}
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          className={`w-36 p-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right text-base font-medium outline-none transition-all duration-200 ease-in-out hover:border-indigo-400 ${
            errorMessage ? 'border-red-500 focus:border-red-500' : 'border-gray-300'
          }`}
          aria-label={`${label} numeric input`}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? errorId : undefined}
        />
      </div>
      {errorMessage && (
        <p id={errorId} className="mt-1.5 text-red-600 text-sm font-medium" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default InputSlider;
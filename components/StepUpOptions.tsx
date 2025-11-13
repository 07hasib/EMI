import React from 'react';
import InputSlider from './InputSlider';

interface StepUpOptionsProps {
  isStepUpEMI: boolean;
  onToggleStepUpEMI: (value: boolean) => void;
  stepUpAmount: number; // Changed from stepUpPercentage
  onStepUpAmountChange: (value: number) => void; // Changed from onStepUpPercentageChange
  stepUpFrequencyMonths: number;
  onStepUpFrequencyMonthsChange: (value: number) => void;
}

const StepUpOptions: React.FC<StepUpOptionsProps> = ({
  isStepUpEMI,
  onToggleStepUpEMI,
  stepUpAmount, // Changed from stepUpPercentage
  onStepUpAmountChange, // Changed from onStepUpPercentageChange
  stepUpFrequencyMonths,
  onStepUpFrequencyMonthsChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Step-up EMI Option</h2>
      <div className="mb-6 flex items-center">
        <input
          type="checkbox"
          id="isStepUpEMI"
          checked={isStepUpEMI}
          onChange={(e) => onToggleStepUpEMI(e.target.checked)}
          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          aria-checked={isStepUpEMI}
          role="switch"
        />
        <label htmlFor="isStepUpEMI" className="ml-2 block text-gray-700 text-base font-medium cursor-pointer">
          Enable Step-up EMI
        </label>
      </div>

      {isStepUpEMI && (
        <>
          <InputSlider
            label="Step-up Amount" // Changed label
            value={stepUpAmount} // Changed prop
            min={0} // Min step-up amount can be 0
            max={50000} // Max step-up amount
            step={100}
            onChange={onStepUpAmountChange} // Changed handler
            unit=" ₹" // Changed unit
          />
          <InputSlider
            label="Step-up Frequency"
            value={stepUpFrequencyMonths}
            min={1}
            max={24}
            step={1}
            onChange={onStepUpFrequencyMonthsChange}
            unit=" months"
          />
        </>
      )}
    </div>
  );
};

export default StepUpOptions;
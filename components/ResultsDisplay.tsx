import React from 'react';
import { ComparisonResults, LoanSummary, CurrencyCode } from '../types';

interface ResultsDisplayProps {
  comparisonResults: ComparisonResults;
  isExtraPaymentEnabled: boolean; // Changed from isStepUpEMIEnabled
  currencyCode: CurrencyCode;
}

const formatCurrency = (value: number, currencyCode: CurrencyCode): string => {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, maximumFractionDigits: 0 }).format(value);
};

const formatMonthsToYearsMonths = (months: number): string => {
  if (months < 0) return 'N/A'; // Handle negative months gracefully
  if (months === 0) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
  if (remainingMonths > 0) result += `${years > 0 ? ' and ' : ''}${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  return result.trim();
};

const SummaryCard: React.FC<{ title: string; summary: LoanSummary; currencyCode: CurrencyCode; isExtraPayment?: boolean }> = ({
  title,
  summary,
  currencyCode,
  isExtraPayment = false,
}) => (
  <div className={`p-7 rounded-2xl shadow-md transform transition-all duration-200 hover:shadow-xl ${isExtraPayment ? 'bg-indigo-50/60' : 'bg-blue-50/60'}`} aria-label={`${title} Summary`}>
    <h3 className={`text-xl font-extrabold mb-4 pb-3 border-b-2 ${isExtraPayment ? 'text-indigo-800 border-indigo-200' : 'text-blue-800 border-blue-200'}`}>
      {title}
    </h3>
    <p className={`${isExtraPayment ? 'text-indigo-700' : 'text-blue-700'} mb-2 text-base`}>Initial EMI: <span className={`font-extrabold text-2xl ${isExtraPayment ? 'text-indigo-900' : 'text-blue-900'}`}>{formatCurrency(summary.initialEMI, currencyCode)}</span></p>
    <p className={`${isExtraPayment ? 'text-indigo-700' : 'text-blue-700'} mb-2 text-base`}>Total Interest: <span className={`font-extrabold text-2xl ${isExtraPayment ? 'text-indigo-900' : 'text-blue-900'}`}>{formatCurrency(summary.totalInterest, currencyCode)}</span></p>
    <p className={`${isExtraPayment ? 'text-indigo-700' : 'text-blue-700'} mb-2 text-base`}>Total Payment: <span className={`font-extrabold text-2xl ${isExtraPayment ? 'text-indigo-900' : 'text-blue-900'}`}>{formatCurrency(summary.totalPayment, currencyCode)}</span></p>
    <p className={`${isExtraPayment ? 'text-indigo-700' : 'text-blue-700'} text-base`}>Actual Tenure: <span className={`font-extrabold text-xl ${isExtraPayment ? 'text-indigo-900' : 'text-blue-900'}`}>{formatMonthsToYearsMonths(summary.actualTenureMonths)}</span></p>
  </div>
);

const ResultRow: React.FC<{ label: string; regular: number; extraPayment?: number | null; isCurrency?: boolean; currencyCode: CurrencyCode; showExtraPaymentColumn: boolean }> = ({
  label,
  regular,
  extraPayment,
  isCurrency = true,
  currencyCode,
  showExtraPaymentColumn,
}) => (
  <div className="flex justify-between py-3 border-b border-gray-150 last:border-b-0 items-center hover:bg-gray-50 transition-colors duration-150">
    <span className="font-medium text-gray-800 text-base">{label}</span>
    <div className={`flex space-x-5 md:space-x-10 ${showExtraPaymentColumn ? 'min-w-[180px] sm:min-w-[220px]' : 'min-w-[90px] sm:min-w-[110px] justify-end'}`}>
      <span className="flex-1 text-right text-gray-900 font-semibold text-base">
        {isCurrency ? formatCurrency(regular, currencyCode) : formatMonthsToYearsMonths(regular)}
      </span>
      {showExtraPaymentColumn && extraPayment !== undefined && extraPayment !== null && (
        <span className="flex-1 text-right text-indigo-700 font-semibold text-base">
          {isCurrency ? formatCurrency(extraPayment, currencyCode) : formatMonthsToYearsMonths(extraPayment)}
        </span>
      )}
      {showExtraPaymentColumn && (extraPayment === undefined || extraPayment === null) && (
        <span className="flex-1 text-right text-gray-500 font-semibold text-base">N/A</span>
      )}
    </div>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ comparisonResults, isExtraPaymentEnabled, currencyCode }) => {
  // Renamed from stepUpEMI to extraPaymentEMI
  const { regularEMI, extraPaymentEMI, interestSaved, tenureReducedMonths } = comparisonResults;

  if (!regularEMI) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-xl mb-10 text-center text-gray-600 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 scale-100 hover:scale-[1.005]">
        <p className="text-lg font-medium">Enter loan details to see calculation results.</p>
      </div>
    );
  }

  // Renamed from showStepUpComparison to showExtraPaymentComparison
  const showExtraPaymentComparison = isExtraPaymentEnabled && extraPaymentEMI;

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl mb-10 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 scale-100 hover:scale-[1.005]" role="region" aria-labelledby="comparison-results-heading">
      <h2 id="comparison-results-heading" className="text-2xl font-extrabold text-indigo-800 mb-7 text-center pb-5 border-b-2 border-indigo-200">
        {showExtraPaymentComparison ? 'Comparison Results' : 'Regular EMI Details'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-9" role="group" aria-label="Loan Summaries">
        {regularEMI && <SummaryCard title="Regular EMI Summary" summary={regularEMI} currencyCode={currencyCode} />}
        {showExtraPaymentComparison && extraPaymentEMI && (
          <SummaryCard title="Extra Payment Summary" summary={extraPaymentEMI} currencyCode={currencyCode} isExtraPayment />
        )}
      </div>

      {showExtraPaymentComparison && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-9 rounded-2xl text-center font-bold mb-9 shadow-2xl transform transition-all duration-300 hover:scale-[1.01]" aria-label="Key Savings">
          <p className="text-xl mb-3">You could save:</p>
          <p className="text-4xl font-extrabold mb-5">{formatCurrency(interestSaved, currencyCode)} in Interest!</p>
          <p className="text-xl mb-3">And reduce your loan tenure by:</p>
          <p className="text-4xl font-extrabold">{formatMonthsToYearsMonths(tenureReducedMonths)}</p>
        </div>
      )}

      <div className="overflow-x-auto" role="table" aria-label="Detailed Loan Comparison">
        <div className={`min-w-[${showExtraPaymentComparison ? '400px' : '200px'}]`}>
          <div className="flex justify-between py-3 border-b-2 border-gray-300 font-extrabold text-indigo-800 text-base sm:text-lg">
            <span>Metric</span>
            <div className={`flex space-x-5 md:space-x-10 ${showExtraPaymentComparison ? 'min-w-[180px] sm:min-w-[220px]' : 'min-w-[90px] sm:min-w-[110px] justify-end'}`}>
              <span className="flex-1 text-right">Regular EMI</span>
              {showExtraPaymentComparison && <span className="flex-1 text-right">Extra Payment EMI</span>}
            </div>
          </div>
          <ResultRow label="First EMI" regular={regularEMI.initialEMI} extraPayment={extraPaymentEMI?.initialEMI} isCurrency currencyCode={currencyCode} showExtraPaymentColumn={showExtraPaymentComparison} />
          <ResultRow label="Total Interest" regular={regularEMI.totalInterest} extraPayment={extraPaymentEMI?.totalInterest} isCurrency currencyCode={currencyCode} showExtraPaymentColumn={showExtraPaymentComparison} />
          <ResultRow label="Total Payment" regular={regularEMI.totalPayment} extraPayment={extraPaymentEMI?.totalPayment} isCurrency currencyCode={currencyCode} showExtraPaymentColumn={showExtraPaymentComparison} />
          <ResultRow label="Actual Tenure" regular={regularEMI.actualTenureMonths} extraPayment={extraPaymentEMI?.actualTenureMonths} isCurrency={false} currencyCode={currencyCode} showExtraPaymentColumn={showExtraPaymentComparison} />
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
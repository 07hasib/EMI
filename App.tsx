import React, { useState, useEffect, useMemo, useCallback } from 'react';
import EMICalculatorForm from './components/EMICalculatorForm';
import ExtraPaymentOptions from './components/ExtraPaymentOptions';
import ResultsDisplay from './components/ResultsDisplay';
import LoanChart from './components/LoanChart';
import { generateFixedAmortizationSchedule, calculateRegularEMI } from './services/calculatorService';
import { AmortizationEntry, LoanSummary, ComparisonResults, CurrencyCode } from './types';

function App() {
  // Default values for loan parameters
  const defaultPrincipal = 5000000; // Default Rs. 50 Lakhs
  const minPrincipalAllowed = 100000; // Minimum allowed loan amount
  const defaultAnnualInterestRate = 8.5; // Default 8.5%
  const defaultLoanTenureYears = 20; // Default 20 years
  const defaultCurrencyCode: CurrencyCode = 'INR'; // Default currency
  const defaultExtraEmiPerYear = 12000; // Default ₹12000/year (₹1000/month)

  const [principal, setPrincipal] = useState<number>(defaultPrincipal);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(defaultAnnualInterestRate);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(defaultLoanTenureYears);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(defaultCurrencyCode);

  const [principalError, setPrincipalError] = useState<string | null>(null); // New: State for principal validation error

  const [isExtraPaymentEnabled, setIsExtraPaymentEnabled] = useState<boolean>(false);
  const [extraEmiPerYear, setExtraEmiPerYear] = useState<number>(defaultExtraEmiPerYear);

  const [regularAmortization, setRegularAmortization] = useState<AmortizationEntry[]>([]);
  const [extraPaymentAmortization, setExtraPaymentAmortization] = useState<AmortizationEntry[]>([]);
  const [regularSummary, setRegularSummary] = useState<LoanSummary | null>(null);
  const [extraPaymentSummary, setExtraPaymentSummary] = useState<LoanSummary | null>(null);

  const loanTenureMonths = loanTenureYears * 12;

  // Handler for principal changes with validation
  const handlePrincipalChange = useCallback((value: number) => {
    // Check if value is below minimum or if it's 0 (invalid)
    if (value < minPrincipalAllowed && value !== 0) {
      setPrincipalError(`Loan Amount cannot be less than ${new Intl.NumberFormat(undefined, {style: 'currency', currency: currencyCode, maximumFractionDigits: 0}).format(minPrincipalAllowed)}`);
    } else if (value === 0) {
       setPrincipalError(`Loan Amount cannot be 0. Minimum is ${new Intl.NumberFormat(undefined, {style: 'currency', currency: currencyCode, maximumFractionDigits: 0}).format(minPrincipalAllowed)}`);
    } else {
      setPrincipalError(null); // Clear error if valid
    }
    setPrincipal(value); // Always update the value so the slider moves, error message will handle calculation prevention
  }, [currencyCode]);


  // Function to reset loan details to default values
  const handleReset = useCallback(() => {
    setPrincipal(defaultPrincipal);
    setAnnualInterestRate(defaultAnnualInterestRate);
    setLoanTenureYears(defaultLoanTenureYears);
    setCurrencyCode(defaultCurrencyCode);
    setPrincipalError(null); // New: Clear principal error on reset
    // Optionally reset extra payment options here if desired, but request was specific to 'input fields' of form
    // setIsExtraPaymentEnabled(false);
    // setExtraEmiPerYear(defaultExtraEmiPerYear);
  }, []);

  useEffect(() => {
    // New: Guard clause to prevent calculations if there's a principal error or principal is effectively invalid
    if (principalError || principal < minPrincipalAllowed || principal === 0) {
      setRegularAmortization([]);
      setRegularSummary(null);
      setExtraPaymentAmortization([]);
      setExtraPaymentSummary(null);
      return;
    }

    // Calculate Regular EMI
    const { schedule: regSchedule, summary: regSummary } = generateFixedAmortizationSchedule(
      principal,
      annualInterestRate,
      loanTenureMonths
    );
    setRegularAmortization(regSchedule);
    setRegularSummary(regSummary);

    // Calculate Extra Payment EMI if enabled
    if (isExtraPaymentEnabled && extraEmiPerYear > 0) {
      const monthlyInterestRate = annualInterestRate / 12 / 100;
      const baseRegularEMI = calculateRegularEMI(principal, monthlyInterestRate, loanTenureMonths);
      const extraMonthlyPayment = extraEmiPerYear / 12;
      const effectiveExtraPaymentEMI = baseRegularEMI + extraMonthlyPayment;

      const { schedule: extraPaySchedule, summary: extraPaySummary } = generateFixedAmortizationSchedule(
        principal,
        annualInterestRate,
        loanTenureMonths,
        effectiveExtraPaymentEMI // Pass the adjusted EMI as initialEMI
      );
      setExtraPaymentAmortization(extraPaySchedule);
      setExtraPaymentSummary(extraPaySummary);
    } else {
      // Clear extra payment data if option is disabled or amount is zero
      setExtraPaymentAmortization([]);
      setExtraPaymentSummary(null);
    }
  }, [
    principal,
    annualInterestRate,
    loanTenureYears,
    isExtraPaymentEnabled,
    extraEmiPerYear,
    currencyCode,
    principalError // Include principalError in dependencies to re-run when error state changes
  ]);

  const comparisonResults: ComparisonResults = useMemo(() => {
    // Always provide regular EMI summary for display
    const baseResults: ComparisonResults = {
      regularEMI: regularSummary,
      extraPaymentEMI: null, // Default to null for extra payment
      interestSaved: 0,
      tenureReducedMonths: 0,
    };

    if (isExtraPaymentEnabled && extraEmiPerYear > 0 && regularSummary && extraPaymentSummary) {
      const interestSaved = Math.max(0, regularSummary.totalInterest - extraPaymentSummary.totalInterest);
      const tenureReducedMonths = Math.max(0, regularSummary.actualTenureMonths - extraPaymentSummary.actualTenureMonths);

      return {
        ...baseResults,
        extraPaymentEMI: extraPaymentSummary,
        interestSaved,
        tenureReducedMonths,
      };
    }

    return baseResults;
  }, [regularSummary, extraPaymentSummary, isExtraPaymentEnabled, extraEmiPerYear]);

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 font-sans antialiased text-gray-900">
      <header className="w-full max-w-7xl mx-auto mb-14 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-indigo-950 leading-tight drop-shadow-lg tracking-tight">
          Smart EMI Calculator
        </h1>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">Calculate, Compare, and Optimize Your Loan Payments</p>
      </header>

      <main className="w-full max-w-7xl mx-auto space-y-10 opacity-0 animate-fade-in">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Loan Details - The "Banner" section */}
          <div className="lg:col-span-1">
            <EMICalculatorForm
              principal={principal}
              onPrincipalChange={handlePrincipalChange} // New: Use validation handler
              annualInterestRate={annualInterestRate}
              onAnnualInterestRateChange={setAnnualInterestRate}
              loanTenureYears={loanTenureYears}
              onLoanTenureYearsChange={setLoanTenureYears}
              currencyCode={currencyCode}
              onCurrencyCodeChange={setCurrencyCode}
              onReset={handleReset}
              principalError={principalError} // New: Pass principal error
            />
          </div>
          {/* Extra Payment Options and initial results */}
          <div className="lg:col-span-2 flex flex-col space-y-8">
            <ExtraPaymentOptions
              isExtraPaymentEnabled={isExtraPaymentEnabled}
              onToggleExtraPayment={setIsExtraPaymentEnabled}
              extraEmiPerYear={extraEmiPerYear}
              onExtraEmiPerYearChange={setExtraEmiPerYear}
              currencyCode={currencyCode}
            />
             <ResultsDisplay 
              comparisonResults={comparisonResults} 
              isExtraPaymentEnabled={isExtraPaymentEnabled}
              currencyCode={currencyCode} 
            />
          </div>
        </section>

        {/* Loan Chart - Full width below */}
        <LoanChart
          regularData={regularAmortization}
          extraPaymentData={extraPaymentAmortization}
          currencyCode={currencyCode}
        />
      </main>

      <footer className="w-full max-w-7xl mx-auto mt-16 py-8 text-center text-gray-600 border-t border-gray-200">
        <p className="text-base font-medium">&copy; {new Date().getFullYear()} Smart EMI Calculator. All rights reserved.</p>
        <p className="mt-3 text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          <span className="font-semibold text-gray-700">Disclaimer:</span> All calculations are estimates and for informational purposes only. This is not financial advice. 
          Consult a professional financial advisor for personalized guidance tailored to your specific situation.
        </p>
      </footer>
    </div>
  );
}

export default App;
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface LoanParameters {
  principal: number;
  annualInterestRate: number;
  loanTenureYears: number;
  isExtraPaymentEnabled: boolean; // Changed from isStepUpEMI
  extraEmiPerYear: number; // Added for extra yearly payment
  currencyCode: CurrencyCode;
}

export interface AmortizationEntry {
  month: number;
  startingBalance: number;
  emi: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface LoanSummary {
  initialEMI: number;
  totalInterest: number;
  totalPayment: number;
  actualTenureMonths: number;
}

export interface ComparisonResults {
  regularEMI: LoanSummary | null;
  // Renamed from stepUpEMI to extraPaymentEMI
  extraPaymentEMI: LoanSummary | null; 
  interestSaved: number;
  tenureReducedMonths: number;
}
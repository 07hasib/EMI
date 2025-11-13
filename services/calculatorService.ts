import { AmortizationEntry, LoanSummary } from '../types';

/**
 * Calculates the monthly interest rate from an annual interest rate.
 * @param annualRate The annual interest rate (e.g., 8 for 8%).
 * @returns The monthly interest rate as a decimal.
 */
const calculateMonthlyInterestRate = (annualRate: number): number => annualRate / 12 / 100;

/**
 * Calculates the Equated Monthly Installment (EMI) for a regular loan.
 * @param principal The total loan amount.
 * @param monthlyInterestRate The monthly interest rate as a decimal.
 * @param tenureMonths The loan tenure in months.
 * @returns The calculated regular EMI.
 */
export const calculateRegularEMI = (
  principal: number,
  monthlyInterestRate: number,
  tenureMonths: number,
): number => {
  if (monthlyInterestRate === 0) {
    return principal / tenureMonths;
  }
  const factor = Math.pow(1 + monthlyInterestRate, tenureMonths);
  return principal * monthlyInterestRate * factor / (factor - 1);
};

/**
 * Generates an amortization schedule for a loan with a fixed EMI.
 * @param principal The total loan amount.
 * @param annualInterestRate The annual interest rate (e.g., 8 for 8%).
 * @param tenureMonths The planned loan tenure in months.
 * @param initialEMI The fixed EMI to use. If not provided, it's calculated based on `principal` and `tenureMonths`.
 * @returns An object containing the amortization schedule and a loan summary.
 */
export const generateFixedAmortizationSchedule = (
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  initialEMI?: number,
): { schedule: AmortizationEntry[]; summary: LoanSummary } => {
  const monthlyInterestRate = calculateMonthlyInterestRate(annualInterestRate);
  let currentEMI = initialEMI || calculateRegularEMI(principal, monthlyInterestRate, tenureMonths);
  if (isNaN(currentEMI) || !isFinite(currentEMI) || currentEMI <= 0) {
    return {
      schedule: [],
      summary: { initialEMI: 0, totalInterest: 0, totalPayment: 0, actualTenureMonths: 0 },
    };
  }

  let remainingBalance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  const schedule: AmortizationEntry[] = [];
  let actualTenureMonths = 0;

  // Maximum safe tenure to prevent infinite loops, e.g., 2 times the planned tenure, but with a reasonable upper cap like 100 years.
  const maxCalculationTenure = Math.min(tenureMonths * 2, 100 * 12); 
  let consecutiveInsufficientEMIMonths = 0;
  const maxConsecutiveInsufficientEMIMonths = 12; // If EMI fails to cover interest for 12 months, break.

  for (let month = 1; remainingBalance > 0 && month <= maxCalculationTenure; month++) { 
    const startingBalance = remainingBalance;
    const interestPaid = startingBalance * monthlyInterestRate;

    let principalPaid = currentEMI - interestPaid;

    if (principalPaid < 0) {
        // This scenario implies EMI is insufficient to even cover monthly interest.
        // For a fixed EMI scenario, this means the loan would never be repaid.
        // We'll cap principal paid at 0 to avoid balance increasing.
        principalPaid = 0;
        consecutiveInsufficientEMIMonths++;
        if (consecutiveInsufficientEMIMonths >= maxConsecutiveInsufficientEMIMonths) {
          console.error(`Fixed EMI (${currentEMI.toFixed(2)}) is insufficient to repay loan in month ${month}. Balance: ${startingBalance.toFixed(2)}. Loan not repayable after ${maxConsecutiveInsufficientEMIMonths} consecutive months of insufficient EMI.`);
          break;
        }
    } else {
      consecutiveInsufficientEMIMonths = 0; // Reset counter if EMI covers principal
    }

    // Adjust for the last payment: if remaining balance is less than (currentEMI - interestPaid)
    // the last principal payment should just be the remaining balance.
    if (remainingBalance <= principalPaid) {
      principalPaid = remainingBalance;
      currentEMI = remainingBalance + interestPaid; // Final EMI for the last month will be adjusted
      remainingBalance = 0;
    } else {
      remainingBalance -= principalPaid;
    }

    cumulativeInterest += interestPaid;
    cumulativePrincipal += principalPaid;
    actualTenureMonths = month;

    schedule.push({
      month,
      startingBalance: Math.max(0, startingBalance),
      emi: Math.max(0, currentEMI),
      interestPaid: Math.max(0, interestPaid),
      principalPaid: Math.max(0, principalPaid),
      endingBalance: Math.max(0, remainingBalance),
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  const totalPayment = principal + cumulativeInterest;

  return {
    schedule,
    summary: {
      initialEMI: initialEMI || calculateRegularEMI(principal, monthlyInterestRate, tenureMonths),
      totalInterest: cumulativeInterest,
      totalPayment,
      actualTenureMonths,
    },
  };
};
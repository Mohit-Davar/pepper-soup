# Needs review

Problems a person has to fix: the sources contradict themselves or are missing, a check still fails after automatic review, or ui-map.json has a wrong entry. Each entry names the published page (`page`), its section, the published text to mark (`published`) and the source passages (`sources`, as `file › sheet or heading › rows` then the quoted text). Ids stay the same across runs.

### NR-dd90f2ee · Contradiction
- page: gitbook/user/loan-products/interest-bearing-loans.md
- section: Interest-Bearing Loan Products
- published: "Multidisbursal progressive loans follow these rules:"
- problem: One fact says undoing the last disbursement returns a 403 error when disbursements exceed tranches with disbursement details, while the other says the error does not occur in that situation. Confirm which is correct and fix the source.
- sources:
  - `[UI][API] 403 error is shown while undo last disbursement if loan tranches number configured less then number of disbursements` "1. loan is configured with one tranche 100$ with disbursement details 2. approve and create 2 or more disbursements -e.g. 70$ and 30$ 3. attempt to 'Undo last disbursement' Actual result: 403 error is shown- please, see attachment Expected result: Last disbursement is reverted or, just to prevent such situations - forbid to add bigger number of disbursements that trances with disbursements is configured please, note - it works for cases if number of disbursements is bigger then number of tranches with disbursement details"
  - `[UI][API] 403 error is shown while undo last disbursement if loan tranches number configured less then number of disbursements` "please, note - it works for cases if number of disbursements is bigger then number of tranches with disbursement details"

### NR-e1a33cc8 · Contradiction
- page: gitbook/user/loan-products/interest-calculation.md
- section: EMI Calculation
- published: "Repayment frequency sets how often you repay the loan, and period options set the available repayment periods. Repayment frequency is 1 month."
- problem: Repayment frequency is given as 1 month, 15 days, and 2 weeks. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1855/PP new formula EMI & Interest calculator v5.xlsx › with downpayment(360-30)-multi › rows R4` "R4 | repaid every | 1 | month | | | | | | | | | | Weekly | Rate factor = 1+(rate of interest*(7*repaid every /days in year)*actual days in period/calculated days in period"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v5.xlsx › with downpayment(360-30)-multi › rows R4` "R3 | Principal | 100 | | | | | | | | | | | Monthly | Rate factor = 1+(rate of interest*(repaid every *days in month /days in year)*actual days in period/calculated days in period"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v5.xlsx › daily and weekly example › rows R4` "R4 | repaid every | 15 | days | | | | | | | | | Daily | Rate factor = 1+(rate of interest*(repaid every /days in year)*actual days in period/calculated days in period"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v5.xlsx › daily and weekly example › rows R22` "R22 | repaid every | 2 | weeks | | | | | | | | | Daily | Rate factor = 1+(rate of interest*(repaid every /days in year)*actual days in period/calculated days in period"

### NR-cad76428 · Contradiction
- page: gitbook/user/loan-products/interest-calculation.md
- section: EMI Calculation
- published: "Installment interest is principal balance * (1-ratefactor)."
- problem: Facts disagree on whether installment interest uses principal balance times interest rate per year times days gap or principal balance times (1-ratefactor). Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1900/PP new formula EMI & Interest calculator v7.xlsx › 6 Months(actual) › rows R7` "R7 | 2/1/24 | 83.68 | 17.13 | 16.32 | 0.81 | 31 | 1.008053375 | 0.008053375 | 1 | | 1.048222295 | | Installment Interest=principal balance*(Interest rate/year)*days gap"
  - `attachments/excel/jira-PS-1855/PP new formula EMI & Interest calculator v5.xlsx › 6 Months(actual)` "R7 | 2/1/24 | 83.68 | 17.13 | 16.32 | 0.81 | 31 | 1.008053375 | 0.008053375 | 1 | | 1.048222295 | | Installment Interest=principal balance*(Interest rate/year)*days gap"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 6 Months(actual)` "R7 | 2/1/24 | 83.68 | 17.13 | 16.32 | 0.81 | 31 | 1.008053375 | 0.008053375 | 1 | | 1.048222295 | | Installment Interest=principal balance*(Interest rate/year)*days gap"
  - `attachments/excel/jira-PS-1900/PP new formula EMI & Interest calculator v5.xlsx › daily and weekly example › rows R8, R26` "Installment interest formula is principal balance * (1-ratefactor)."
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 6 Mnths(360-30)mutli disb-step` "R9 | 4/1/24 | 50.59 | 17.13 | 16.60 | 0.53 | 31 | 30 | 1.0079018333 | 0.007901833 | 3.023767939 | | | | Installment Interest =Principa balance * (1-ratefactor"
  - `attachments/excel/jira-PS-1855/PP new formula EMI & Interest calculator v5.xlsx › 6 Months(360-30)` "R9 | 4/1/24 | 50.59 | 17.13 | 16.60 | 0.53 | 31 | 30 | 1.007901833 | 0.007901833 | 3.023767939 | R^n | | Installment Interest =Principa balance * (1-ratefactor"
  - `attachments/excel/jira-PS-1900/PP new formula EMI & Interest calculator v5.xlsx › 6 Months(360-30)` "R9 | 4/1/24 | 50.59 | 17.13 | 16.60 | 0.53 | 31 | 30 | 1.007901833 | 0.007901833 | 3.023767939 | R^n | | Installment Interest =Principa balance * (1-ratefactor"
  - `attachments/excel/google-sheet-1RpF4lyTI3KZFWw5AkPFnSybRKtHB169b/google-sheet-1RpF4lyTI3KZFWw5AkPFnSybRKtHB169b.xlsx › 360-30` "Installment Interest =Principa balance * (ratefactor-1) (R8"

### NR-5276c669 · Contradiction
- page: gitbook/user/loan-products/interest-calculation.md
- section: EMI Calculation
- published: "Monthly interest rate"
- problem: Monthly interest rate is yearly interest rate/12 * no of months, yearly interest rate/12, or yearly interest rate/12 * total months per installment. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1855/Interest Calculcation.xlsx › current behaviour in Fineract` "R13 | 31 | 6/11/24 | 2462.15 | 397.41 | 24.26 | ₹ 421.67 | Interest rate: | Monthly | yearly interest rate/12 * no of months"
  - `attachments/excel/jira-PS-1855/Interest Calculcation.xlsx › with fix-1 for same formula` "R4 | repay every | 1 | month | | | | Interest rate: | Monthly | yearly interest rate/12"
  - `attachments/excel/jira-PS-1855/Interest Calculcation.xlsx › with fix-2 for same formula ` "R4 | repay every | 1 | month | | | | Interest rate: | Monthly | yearly interest rate/12*total months per installment"

### NR-12e0bb9e · Contradiction
- page: gitbook/user/loan-products/interest-calculation.md
- section: EMI Calculation
- published: "Monthly interest rate"
- problem: Weekly interest rate is yearly interest rate/52 * no of weeks in the installment, yearly interest rate/52, or yearly interest rate/52 * total weeks per installment. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1855/Interest Calculcation.xlsx › current behaviour in Fineract` "R15 | 31 | 8/11/24 | 1656.51 | 404.18 | 17.48 | ₹ 421.67 | | weekly | yearly interest rate/52 * no of weeks in the installment"
  - `attachments/excel/jira-PS-1855/Interest Calculcation.xlsx › with fix-1 for same formula` "Row | days gap | due date | Column 3 | Principal | Interest | EMI | Column 7 | weekly | yearly interest rate/52"
  - `attachments/excel/jira-PS-1855/Interest Calculcation.xlsx › with fix-2 for same formula ` "Row | days gap | due date | Column 3 | Principal | Interest | EMI | Column 7 | weekly | yearly interest rate/52*total weeks per installment"

### NR-83e39f96 · Unfixed problem
- page: gitbook/user/loan-products/interest-calculation.md
- section: EMI Calculation
- published: "The system generates the full amortization schedule by looping through each term to calculate the rate factor using days in the current month, then iterating again to calculate principal and interest payments for each term. Interest for a term equals `Rate Factor - 1` multiplied by the remaining balance, and principal payment equals the monthly payment minus the interest payment for that term. On the last term, the monthly payment is the rest of the remaining balance and might not equal previous payments."
- problem: A formula is spelled out in words; write it once as a formula in inline code.

### NR-0cf245be · Contradiction
- page: gitbook/user/loan-products/fees.md
- section: Buy-Down Fees
- problem: One fact says buy-down fees support equal amortization and formula-based amortization, while another says equal amount amortization is the default and only strategy. Confirm which is correct and fix the source.
- sources:
  - `Buy-Down fees` "Equal amortization Formula based amortization"
  - `[Backend] Buy Down fees- Amortization and Calculation Logic` "Equal amount amortization (DEFAULT, and only option for now"

### NR-ed38cf5f · Contradiction
- page: gitbook/user/loan-products/fees.md
- section: Buy-Down Fees
- problem: Facts disagree on whether a Buy Down fees Adjustment reduces the Buy Down fees balance or the Origination fees balance from amortization. Confirm which is correct and fix the source.
- sources:
  - `[Backend] Buy Down fees - Adjustment Transaction` "Buy Down fees - Adjustment Transaction Business requirements Buy Down fees Adjustment is a new type of Transaction type New type of transaction Buy Down fees Adjustment - to be introduced Buy Down fees Adjustment works as a Credit Transaction that reduces the Buy Down fees balance from Amortization Buy Down fees Adjustment Accounting entries works like a Mirror of Buy Down fees entries(entries below for reference) Buy Down fees Adjustment can be done backdated Buy Down fees Adjustment will not have any impact on the loan balance"
  - `[UI] Buy Down fees - Adjustment Transaction` "Buy Down fees - Adjustment Transaction Business requirements Buy Down fees Adjustment is a new type of Transaction type New type of transaction Buy Down feesAdjustment - to be introduced Buy Down fees Adjustment works as a Credit Transaction that reduces the Origination fees balance from Amortization Buy Down fees Adjustment Accounting entries works like a Mirror of Buy Down fees entries Buy Down fees Adjustment can be done backdated"

### NR-7dee67eb · Contradiction
- page: gitbook/user/loan-products/fees.md
- section: Capitalized Income
- published: "Charge-off charges off the capitalized income and stops daily amortization after the charge-off date. Any not yet recognized balance moves to charge-off. Undoing charge-off reverses this behavior and adjusts the accounting entries."
- problem: Some facts state charge-off accounting entries can be reversed or adjusted, while others state no reversal support exists for capitalized income. Confirm which is correct and fix the source.
- sources:
  - `Origination fee -> Capitalized income` "Charge-off will also charge-off the Capitalized income and no amortization will be done after charge-off date → Undo and reverse-replay should be able to reverse or adjust these accounting tries"
  - `[Backend] Capitalized income - amortization in case of Charge-off event` "Undo charge-off should undo this behavior and adjust these accounting tries"
  - `Origination fee -> Capitalized income` "Final Amortization will be done for balance amount if the loan gets Preclosed on the same day → Once a loan was paid off, there is no reversal or anything that “undo” the realized income"
  - `Origination fee -> Capitalized income` "Can Capitalized income or Capitalized income adjustment to be reverted? → No need to support reversal, but worth to review"

### NR-a6d8853c · Contradiction
- page: gitbook/user/loan-products/fees.md
- section: Capitalized Income
- published: "The following rules apply to a Capitalized Income Adjustment:"
- problem: One fact says an unreversed Capitalized Income Adjustment can be reversed, while another says it cannot be reversed and must be re-applied if incorrect. Confirm which is correct and fix the source.
- sources:
  - `[UI & Backend] Capitalized income Adjustment - Reversal of existing transaction` "Not yet reversed “Capitalized Income Adjustment” transaction is allowed to be reversed"
  - `attachments/confluence/4587814923/Capitalized Income-4587814923.html › Capitalized Income in Apache Fineract › Overview › Capitalized Income Adjustment › rows T3.R1` "it works and what it does: 1. **Purpose**: - Correct overcharged or misposted capitalized income amounts. - Reflect fee waivers or negotiated reductions. - Support backdated corrections if needed. 2. **Transaction Behavior**: - It is a **credit-type transaction**, reducing the capitalized income balance. - Treated similarly to other credit transactions and follows a defined allocation strategy. - Can be backdated, but not dated before the original capitalized income transaction. 3. **Validation Rules**: - The adjustment amount **must not exceed** the not-yet-recognized balance of the original capitalized income. - Adjustment is **linked to a specific Capitalized Income transaction** (by ID). - Multiple adjustments can be made against the same original transaction. - Adjustments **cannot be reversed**, but must be re-applied if incorrect. 4. **Accounting Entries**: | Row | Scenario | Debit | Credit | | --- | --- | --- | --- | | T3.R1 | Adjustment ≤ unrecognized balance | Deferred Income (Liability) | Loan Portfolio (Asset"

### NR-4435718a · Contradiction
- page: gitbook/user/loan-products/fees.md
- section: Capitalized Income
- published: "A Capitalized Income Adjustment is a credit transaction that reduces the capitalized income balance. You can create it only against an existing capitalized income transaction, and multiple adjustments are allowed against the same original transaction."
- problem: One fact says the adjustment reduces the Capitalized income balance, while another says it reduces the origination fees balance from amortization. Confirm which is correct and fix the source.
- sources:
  - `Origination fee -> Capitalized income` "Capitalized income Adjustment works as a Credit Transaction that reduces the Capitalized income balance"
  - `[Backend] Capitalized Income - Adjustment Transaction` "Capitalized Income Adjustment is a new type of Transaction type New type of transaction Capitalized Income Adjustment - to be introduced Capitalized Income Adjustment works as a Credit Transaction that reduces the Origination fees balance from Amortization"

### NR-9348ee28 · Contradiction
- page: gitbook/user/loan-products/working-capital.md
- section: Effective Interest Rate Product
- published: "The Payout Refund transaction recovers previously disbursed loan funds from fraudulent Working Capital Product (WCP) loan accounts. It reduces the outstanding principal balance and fees according to the allocation rule and applies to active WCP loans. You enter the refund amount and transaction date when you submit the transaction."
- problem: One fact says Payout Refund applies only to Active loan status, while another says it can only be applied to active and closed WCP loans. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Transaction detailsto be REVIEWed by loguYellow › Payout Refund Transaction › Transaction Type` "Applicable Loan Status:** Active"
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Transaction detailsto be REVIEWed by loguYellow › Payout Refund Transaction › Acceptance Criteria` "5. User can enter a refund amount and transaction date"

### NR-1bc27819 · Contradiction
- page: gitbook/user/loan-products/working-capital.md
- section: Effective Interest Rate Product
- published: "The following rules apply to breach resets:"
- problem: One fact says backdated repayments or adjustments before the reset date alter breach evaluation after reset, while another says changes before the reset date have no effect on current evaluations. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Breach Management › Breach ResetNewPurple › Functionality` "Any **backdated repayments or adjustments** (with a value date before the reset date) will **impact or alter the breach evaluation** after the reset as well.However, anychanges on those periods will not have any effect on current evaluations and calculations"
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Breach Management › Breach ResetNewPurple › Functionality` "Any **backdated repayments or adjustments** (with a value date before the reset date) will **impact or alter the breach evaluation** after the reset as well.However, anychanges on those periods will not have any effect on current evaluations and calculations"

### NR-a60f0717 · Unfixed problem
- page: gitbook/user/loan-products/working-capital.md
- section: Effective Interest Rate Product
- published: "Installment number"
- problem: A formula is spelled out in words; write it once as a formula in inline code.

### NR-348cc81c · Contradiction
- page: gitbook/user/loan-products/working-capital.md
- section: Transaction Types
- published: "Write-off zeros all outstanding balances and closes the loan with status written-off. A write-off can be undone, but backdated transactions or undoing any transactions on a written-off loan are not supported. Incoming parameters follow the current behaviour from progressive loans."
- problem: Facts disagree on whether undoing transactions on a written-off loan is supported. Confirm which is correct and fix the source.
- sources:
  - `[BE] WC - Write-off` "Written-off status can be undone"
  - `[UI] WC - Write-off` "Write-off on a loan can be undone"
  - `[BE] WC - Write-off` "We are not supporting backdated transactions or undo any transactions on written off loan"

### NR-de864db2 · Unfixed problem
- page: gitbook/user/loan-products/working-capital.md
- section: Breach Management
- published: "Breach evaluation occurs at a point determined by the breach start date plus the configured length, or by the breach range start date plus frequency and frequency type. When multiple near-breach evaluation points exist, the threshold is divided by the multiplicator. Backdated Breach Pause entries re-trigger and recompute breach evaluation for the affected period upon application."
- problem: A formula is spelled out in words; write it once as a formula in inline code.

### NR-48dfa0f1 · Contradiction
- page: gitbook/user/loan-products/working-capital.md
- section: Projected Balances
- published: "You can add the discount fee to the loan account through the API or the UI. If the discount was added at loan creation or approval, you cannot add it again after disbursement."
- problem: Facts disagree on whether the discount fee can be added after disbursement. Confirm which is correct and fix the source.
- sources:
  - `[BE][UI] WC - Discount` "User should be able to add the discount fee to the loan account even after disbursement"
  - `[BE][UI] WC - Discount` "Discount can be added only as of disbursement date only"
  - `[BE][UI] WC - Discount` "Discount can be added only one time at the time of disbursement"
  - `[BE][UI] WC - Discount` "User cannot add discount after disbursement if the discount was added at the loan creation/approval state"

### NR-7d07eb6a · Contradiction
- page: gitbook/user/loan-origination/loan-originator.md
- section: Loan Originator Details
- problem: One fact names Transaction Summary Report and Trial Balance Report as required target reports, while another names Trial Summary Report and Trial Balance Report. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/5050597378/Loan origination details-5050597378.html › Goal › Reporting extensions` "Transaction Summary Report** - **Trial Balance Report** (doc also says Trial Summary in one place; assume Trial Balance + Transaction Summary are required"
  - `attachments/confluence/5050597378/Loan origination details-5050597378.html › Goal › Low Level Design › Create and attach immediately as part of loan creation flow` "Reporting** - Trial Summary Report - Trial Balance Report"

### NR-d1d7a5f9 · Contradiction
- page: gitbook/user/loan-origination/down-payments.md
- section: Down Payments
- problem: The facts disagree on whether the second disbursement amount is allocated to the last two installments or to all three remaining future installments when an installment is fully paid. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1493/Disbursement amount distribution scenario.xlsx › use case › rows R18, R21` "R18 | Disbursement | 1/10/22 | 1/10/22 | 400 | | | 2/1/22 | $250.00 | | $- | $50.00 | $300.00 | $- | $300.00 | $- | $900.00 | since this installment is fully paid, the second disbursement amount will be allocated to last two installments only | | R19 | | | | | | | 3/1/22 | $400.00 | | $- | $- | $400.00 | $200.00 | $200.00 | $- | $700.00 | | | R20 | | | | | | | 4/1/22 | $400.00 | | $- | $- | $400.00 | $400.00"
  - `attachments/excel/jira-PS-1493/Disbursement amount distribution scenario.xlsx › use case › rows R41` "R41 | Disbursement | 1/10/22 | 1/10/22 | 400 | | | 2/1/22 | $350.00 | | $- | $50.00 | $350.00 | $50.00 | $300.00 | $- | $850.00 | even though the installment is fully paid, the second disbursement amount will be allocated for all 3 remaining future installments | | R42 | | | | | | | 3/1/22 | $350.00 | | $- | $- | $350.00 | $150.00 | $200.00 | $- | $650.00 | | | R43 | | | | | | | 4/1/22 | $350.00 | | $- | $- | $350.00 | $350.00 | $- | $- | $- | | even though the installment is fully paid, the second disbursement amount will be allocated for all 3 remaining future installments (R45"

### NR-880cf493 · Unfixed problem
- page: gitbook/user/interest/timing.md
- section: First-Day Interest
- published: "An alternative calculation uses actual total outstanding principal multiplied by the interest rate for one day based on the days in year configuration, but the model and EMICalculator are the safest course."
- problem: A formula is spelled out in words; write it once as a formula in inline code.

### NR-dd280a47 · Unfixed problem
- page: gitbook/user/interest/timing.md
- section: Early and Late Repayment Interest
- published: "The configured future installment allocation rule is Next installment, but early and late payment calculations require Last installment."
- problem: Fact F-9314b75b8d73 is already stated in an earlier block; state each fact once.

### NR-976ad15a · Unfixed problem
- page: gitbook/user/interest/timing.md
- section: Early and Late Repayment Interest
- published: "The configured future installment allocation rule is Next installment, but early and late payment calculations require Last installment."
- problem: Fact F-b1078392a272 is already stated in an earlier block; state each fact once.

### NR-99b92357 · Contradiction
- page: gitbook/user/repayments/allocation-strategies.md
- section: Payment Allocation Strategies
- published: "The new repayment strategy allocates payments in this order: due charges, due penalty, due fee, due interest, due principal, in advanced principal, in advanced penalty, in advanced fee, in advanced interest."
- problem: The facts give different payment allocation orders for the new repayment strategy. Confirm which is correct and fix the source.
- sources:
  - `New payment order with _in advance Principal_ and _due charges_` "New payment order: Due charges Due Penalty Due Fee Due interest Due principal In advanced principal In advanced Penalty In advanced Fee In advanced Interest"
  - `attachments/confluence/3309633537/Time respective repayment strategy-3309633537.html › Goal › Expected scenarios › New behaviour #1` "New Repayment strategy:** Due charges, in advance Principal, Penalty, Fee, Interest, Principal"
  - `attachments/confluence/3309633537/Time respective repayment strategy-3309633537.html › Goal › High Level Design (HLD)` "New order:** 1. Due charges 2. In advanced principal 3. Penalty 4. Fee 5. Interest 6. Principal"
  - `New payment order with _in advance Principal_ and _due charges_` "Repayment distribution Due/late penalty Due/late Fee Due/late interest Due/late principal In advance principal In advance penalty In advance fee In advance interest"

### NR-580f8f1a · Unfixed problem
- page: gitbook/user/repayments/configurable-allocations.md
- section: Configurable Payment Allocations
- published: "The same error occurs in these situations:"
- problem: Fact F-a11d47745313 is already stated in an earlier block; state each fact once.

### NR-752857f7 · Contradiction
- page: gitbook/user/repayments/payoff.md
- section: Loan Payoff
- published: "The following rules apply to pay-off accounting and transactions:"
- problem: One fact says disbursement chargeback can be done on a pay-off loan account, while another says it is not allowed yet. Confirm which is correct and fix the source.
- sources:
  - `Payoff transaction(prepay as of given date)` "Disbursement / Chargeback can be done on the pay-off loan account"
  - `Pay-off transaction - Backend` "Disbursement (Chargeback is not allowed yet) can be done on the pay-off loan account"

### NR-b7f00d57 · Contradiction
- page: gitbook/user/chargebacks/interest.md
- section: Interest on Chargebacks
- published: "A Chargeback is allowed on a progressive, interest-bearing loan with interest recalculation enabled when no Chargeback transaction allocation rule is set. If the original transaction portions changed, the Chargeback must be recalculated and reallocated, reprocessing is needed, and the repayment schedule might change."
- problem: Whether a changed original transaction portion requires Chargeback recalculation and reallocation. Confirm which is correct and fix the source.
- sources:
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #1` "If the original transaction portions got changed, we DONT need to recalculate and reallocate the Chargeback, as Chargeback amount cannot be changed and all amount was allocated already to principal, but still we need to reprocess and the repayment schedule might change anyway"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation NOT enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"

### NR-d2f1aa60 · Contradiction
- page: gitbook/user/chargebacks/interest.md
- section: Interest on Chargebacks
- published: "A Chargeback is allowed on a progressive, interest-bearing loan with interest recalculation enabled when no Chargeback transaction allocation rule is set. If the original transaction portions changed, the Chargeback must be recalculated and reallocated, reprocessing is needed, and the repayment schedule might change."
- problem: Whether reprocessing is needed when original transaction portions change. Confirm which is correct and fix the source.
- sources:
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #1` "If the original transaction portions got changed, we DONT need to recalculate and reallocate the Chargeback, as Chargeback amount cannot be changed and all amount was allocated already to principal, but still we need to reprocess and the repayment schedule might change anyway"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation NOT enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"

### NR-d3c15936 · Contradiction
- page: gitbook/user/restructuring/re-aging.md
- section: Re-aging
- published: "Re-aging applies to progressive loan accounts. You can re-age from any date of the loan cycle after the first disbursement date, including before maturity, but not on a charged-off loan. For interest-bearing loans, the re-aging date must not be before the last repayment date."
- problem: Facts disagree on whether re-aging is allowed from any date, only after maturity, only after the first disbursement date, or only before maturity, and whether the re-aging date can precede the last repayment date. Confirm which is correct and fix the source.
- sources:
  - `Re-aging for Interest bearing products` "Allow re-aging from any date of loan cycle"
  - `Re-aging for Interest bearing products` "Re-aging date can be before the last repayment date"
  - `Re-aging:- Allow backdated Re-aging on a loan account` "Currently User can only do Re-aging after the Maturity date and only for Non-Interest Bearing loans"
  - `Re-aging:- Allow backdated Re-aging on a loan account` "Re-aging can be done any date of the loan life cycle (after 1st disbursement date"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Interest calculation: Default Behavior` "Re-aging can be done any date of the loan life cycle"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Default Behavior,  interestRecalculation disabled, re-aging changes the due dates` "Allow backdated Re-aging on interest bearing loan account - Default Behavior, interestRecalculation disabled, re-aging changes the due dates Background and Details Currently User can only do Re-aging after the Maturity date and only for non -Interest Bearing loans. Once this task done, it will remain to cover situations where: interestRecalculation disabled re-aging changes the due dates Goal Allow re-aging for Interest bearing, progressive loan accounts. With Interest handling: default behavior Acceptance Criteria User should be able to configure Re-Aging before maturity date as well Re-aging can be done any date of the loan life cycle Re-aging date should not be before the last repayment date. User should be able to apply re-aging for Interest-bearing loan products. Interest rate and interest recalculation remains the same Interest recalculation = true → update model and use it Interest recalculation = false → use only repayment installments (default behavior) Only applicable for Progressive loan strategy Interest Handling is Default behavior"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Default Behavior,  interestRecalculation disabled, re-aging changes the due dates` "Re-aging date should not be before the last repayment date"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › RE-aging-  interest& fees capit` "re-aging date should not be before the last repayment date (R85"

### NR-e045e684 · Contradiction
- page: gitbook/user/restructuring/re-aging.md
- section: Re-aging
- published: "Re-aging applies to progressive loan accounts. You can re-age from any date of the loan cycle after the first disbursement date, including before maturity, but not on a charged-off loan. For interest-bearing loans, the re-aging date must not be before the last repayment date."
- problem: Facts disagree on whether re-aging is allowed on a charged-off loan. Confirm which is correct and fix the source.
- sources:
  - `Re-aging:   Charge-off and Contract Termination before Reaging` "Reaging is not allowed on a loan that is charged-off"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › AC` "Can be applied on charge-off loan account as well (R5"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › RE-aging-  interest& fees capit` "can be applied on charge-off loan account as well (R87"
  - `attachments/excel/google-sheet-1U1247Rlvvt8Mn0pUeYLLssxfEi1DQ8SPL-_u27oU8yg/google-sheet-1U1247Rlvvt8Mn0pUeYLLssxfEi1DQ8SPL-_u27oU8yg.xlsx › RE-aging-  interest& fees capit` "can be applied on charge-off loan account as well (R87"
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › AC` "Can be applied on charge-off loan account as well (R5"
  - `attachments/excel/google-sheet-1gGMSMG49BfyROx7OY-ayS5s3sX41yFIj2C3tBxqq_SQ/google-sheet-1gGMSMG49BfyROx7OY-ayS5s3sX41yFIj2C3tBxqq_SQ.xlsx › RE-aging-  interest& fees capit` "can be applied on charge-off loan account as well (R87"

### NR-f8f36450 · Contradiction
- page: gitbook/user/restructuring/re-aging.md
- section: Re-aging
- published: "Charges or penalties with a due date after the re-age date are equally split among new installments."
- problem: Facts disagree on whether charges or penalties with a due date after the re-age date are equally split among new installments or remain as is on their respective installment. Confirm which is correct and fix the source.
- sources:
  - `Re-aging for Interest bearing products` "Charge/Penalty with duedate after the re-age date will be be equally split as well to new installments"
  - `[UI] [BE] Re-aging: Interest handling configuration` "Charge/Penalty with duedate after the re-age date will be be equally split as well to new installments"
  - `Re-aging: -Interest Handling Option: Equal amortization` "Penalties/fees with due-date after the re-age date will remain as is on the respective installment"

### NR-fb2c260d · Contradiction
- page: gitbook/user/restructuring/re-aging.md
- section: Re-aging
- published: "Charges and fees are handled as follows during re-aging:"
- problem: One fact says charges and fees due after the re-age date remain as is, while three facts say they are waived off. Confirm which is correct and fix the source.
- sources:
  - `Re-aging for Interest bearing products` "Charges/fees with due-date after the re-age date will remain as is on that installment"
  - `[DUPLICATE OF PS-2778] Re-aging:- Allow fixed, equally amortized reschedule of outstanding balances of the loan` "Penalties/fees with due-date after the re-age date will be waived off. Are we sure about this"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › AC` "Charges/fees with duedate after the re-age date will be waived off (R9"
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › AC` "Charges/fees with duedate after the re-age date will be waived off (R9"

### NR-f5741009 · Contradiction
- page: gitbook/user/restructuring/re-aging.md
- section: Re-aging
- published: "Re-aging applies to charges and fees based on their due date relative to the re-age date, and it applies the same way for interest-bearing and non-interest bearing products. Down-payment amounts and charge-back amounts are not affected by re-aging. Partial payments made before re-aging stay as they are, and only the unpaid amount is re-aged."
- problem: One fact says charges are split evenly across each installment and existing charge-back interest and principal go through equal split, while two facts say charge-back amount has no impact. Confirm which is correct and fix the source.
- sources:
  - `[DUPLICATE OF PS-2778] Re-aging:- Allow fixed, equally amortized reschedule of outstanding balances of the loan` "Charges are split evenly across each installments"
  - `[DUPLICATE OF PS-2778] Re-aging:- Allow fixed, equally amortized reschedule of outstanding balances of the loan` "Existing Charge-back interest and Principal amount will also go through equal split"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › RE-aging-  interest& fees capit` "charge-back amount will not have any impact (R86"
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › RE-aging-  interest& fees capit` "charge-back amount will not have any impact (R86"

### NR-d0096e66 · Contradiction
- page: gitbook/user/restructuring/re-aging.md
- section: Re-aging
- published: "The example uses an EMI of 17.01, an interest rate of 7% per annum with a daily rate of 0.000194444, and iteration disabled with an iterate value of 0.00."
- problem: The facts give two different fixed EMI values. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › Re-aging-S5.1 › rows R21` "R20 | | Total | 102.05 | 100.00 | 2.05 | | | | | | EMI | | R21 | | | | | | | | | | | 17.01"
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › Re-aging-S7 › rows R22` "R21 | | Total | 76.54 | 75.00 | 1.54 | | | | | | EMI | | R22 | | | | | | | | | | | 12.76"

### NR-4647a600 · Contradiction
- page: gitbook/user/restructuring/re-amortization.md
- section: Re-amortization
- published: "Re-amortization applies to interest-bearing loan accounts that use the Progressive loan repayment strategy. It cannot be applied after the maturity date or after the new maturity date, and it cannot be applied on charge-off or written-off loan accounts. Credit transactions such as disbursements and capitalised income work normally on the re-amortization schedule."
- problem: Some facts say re-amortization cannot be applied on charge-off loan accounts while another says it can. Confirm which is correct and fix the source.
- sources:
  - `Re-amortization for Interest Bearing` "Cannot be applied on charge-off and written-off loan accounts"
  - `[UI][BE]Re-amortization on charge-off & Written-off loan account` "Re-amortization cannot be applied on Charge-off loan account"
  - `attachments/excel/google-sheet-1SSPPIhNeBbSzPyrJQqsA7jzN5RorZgVKcsKjAykiCMU/google-sheet-1SSPPIhNeBbSzPyrJQqsA7jzN5RorZgVKcsKjAykiCMU.xlsx › RE` "re-amortization to allow on charge-off loan accounts as well (R94"

### NR-7f35e920 · Contradiction
- page: gitbook/user/restructuring/re-amortization.md
- section: Re-amortization
- problem: Facts disagree on whether re-amortization covers principal only, principal and interest, or principal, interest, and fees. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/google-sheet-1Bi2AYSAV_QlRQWZFberara7KdX_U5T_nFhD88cwDEN4/google-sheet-1Bi2AYSAV_QlRQWZFberara7KdX_U5T_nFhD88cwDEN4.xlsx › RE` "Principal Only will be re-amortized, unpaid Interest and fees will be split equaly to all further installments (R1"
  - `attachments/excel/google-sheet-1SSPPIhNeBbSzPyrJQqsA7jzN5RorZgVKcsKjAykiCMU/google-sheet-1SSPPIhNeBbSzPyrJQqsA7jzN5RorZgVKcsKjAykiCMU.xlsx › RE` "Principal Only will be re-amortized, unpaid Interest and fees will be split equaly to all further installments (R1"
  - `attachments/excel/google-sheet-1Bi2AYSAV_QlRQWZFberara7KdX_U5T_nFhD88cwDEN4/google-sheet-1Bi2AYSAV_QlRQWZFberara7KdX_U5T_nFhD88cwDEN4.xlsx ›  RE-amortization- S1` "Principal and interest Re-amortization (R1"
  - `attachments/excel/google-sheet-1OA4iaxxpycO_fzr_KKyKSt8CfmstejzR-Ds6fOhkcfk/google-sheet-1OA4iaxxpycO_fzr_KKyKSt8CfmstejzR-Ds6fOhkcfk.xlsx › S1-default` "Principal and interest Re-amortization (R1"
  - `attachments/excel/google-sheet-1lQhNOm9NWwb9cFysvG5R_ZHVK8d9rS6VWZnM0x1qWKY/google-sheet-1lQhNOm9NWwb9cFysvG5R_ZHVK8d9rS6VWZnM0x1qWKY.xlsx › RE-amortization- S2` "Principal and interest and Fees Re-amortization (R1"

### NR-8c992368 · Contradiction
- page: gitbook/user/collections/pausing-delinquency.md
- section: Pausing Delinquency
- problem: One fact says multiple resets are possible from the UI while another says multiple reset is out of scope. Confirm which is correct and fix the source.
- sources:
  - `[UI] WC - Delinquency Reset - Multi Reset & Reprocess Support` "User should be able to do Multiple reset on the Delinquency schedule from UI"
  - `[UI] WC - Delinquency Reset` "Mutliple reset"

### NR-bafd5761 · Contradiction
- page: gitbook/user/recovery/charge-off.md
- section: Charge-Off
- published: "The following restrictions apply to charge-off marked loan accounts:"
- problem: Facts disagree on whether reversing transactions before the charge-off date is allowed. Confirm which is correct and fix the source.
- sources:
  - `Charge off Loan Validations` "Reversal of transactions that happened before the charge-off transaction should be allowed"
  - `Charge off Loan Validations` "Reversal of transactions that happened before or on the date of the charge-off transaction isn’t allowed"
  - `Charge off Loan Validations` "Backdated transaction which dates before as charge-off isn’t allowed"
  - `Post charge-off scenarios to Implement` "Not allowing backdated transactions or reversal of transactions that happened before the charge-off date"

### NR-e29297e7 · Unfixed problem
- page: gitbook/user/recovery/future-dated-termination.md
- section: Future-Dated Termination and Loan Withdrawal
- published: "Loan withdrawal accepts the following dates:"
- problem: Fact F-44fdfdfbc509 is already stated in an earlier block; state each fact once.

### NR-7e664601 · Contradiction
- page: gitbook/user/assets-investors/asset-externalization.md
- section: Asset Externalization
- published: "When a sale and its buyback settle on the same day, the system creates GL entries for both transfers, with the sale entry first and the buyback entry last. The investor does not change the GL entries; it appears only as a comment or tag, while the same entries are used."
- problem: Whether same-day sale and buyback creates GL entries or two CANCELLED events. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/3348168732/Asset externalization Solution Design-3348168732.html › Glossary › Decision tracker` "T15.R1 | 2023-04-28 | | > **Decision:** Sale and buyback happening the same day GL entries will still get created. (sale always 1st, buyback last) > **Decision:** Pending transaction can be cancelled. It’s not needed for Pin30 asset transfers. It’ll be an optional story! > **Decision:** GL entries aren’t changing by investor. Investor will only be marked as comment/tag, but same GL entries used. > **Decision:** New requirement: Account and Transaction changed events should contain asset owner from the point it’s owned by external asset owner (active). API doesn’t have to reflect it"
  - `attachments/confluence/3348168732/Asset externalization Solution Design-3348168732.html › Glossary › Decision tracker` "T15.R2 | 2023-05-18 | | > **Decision:** Sale and buyback happening the same day GL entries will NOT be created. There will be two CANCELLED event, one for SALE transfer and one for BUYBACK transfer. Source: [https://mifosforge.jira.com/wiki/spaces/PS/pages/3348168732/Asset+externalization+Solution+Design?focusedCommentId=3365863425](https://mifosforge.jira.com/wiki/spaces/PS/pages/3348168732/Asset+externalization+Solution+Design?focusedCommentId=3365863425"

### NR-7e664601 · Contradiction
- page: gitbook/user/assets-investors/asset-externalization.md
- section: Asset Externalization
- published: "When a sale and its buyback settle on the same day, the system creates GL entries for both transfers, with the sale entry first and the buyback entry last. The investor does not change the GL entries; it appears only as a comment or tag, while the same entries are used."
- problem: Whether same-day sale and buyback creates GL entries or two CANCELLED events. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/3348168732/Asset externalization Solution Design-3348168732.html › Glossary › Decision tracker` "T15.R1 | 2023-04-28 | | > **Decision:** Sale and buyback happening the same day GL entries will still get created. (sale always 1st, buyback last) > **Decision:** Pending transaction can be cancelled. It’s not needed for Pin30 asset transfers. It’ll be an optional story! > **Decision:** GL entries aren’t changing by investor. Investor will only be marked as comment/tag, but same GL entries used. > **Decision:** New requirement: Account and Transaction changed events should contain asset owner from the point it’s owned by external asset owner (active). API doesn’t have to reflect it"
  - `attachments/confluence/3348168732/Asset externalization Solution Design-3348168732.html › Glossary › Decision tracker` "T15.R2 | 2023-05-18 | | > **Decision:** Sale and buyback happening the same day GL entries will NOT be created. There will be two CANCELLED event, one for SALE transfer and one for BUYBACK transfer. Source: [https://mifosforge.jira.com/wiki/spaces/PS/pages/3348168732/Asset+externalization+Solution+Design?focusedCommentId=3365863425](https://mifosforge.jira.com/wiki/spaces/PS/pages/3348168732/Asset+externalization+Solution+Design?focusedCommentId=3365863425"

### NR-67a79a2d · Contradiction
- page: gitbook/developer/dev/loan-engine/interest.md
- section: EMI Calculation
- published: "Period options control how frequently repayments fall due. The default period options are daily, monthly, yearly and whole period, while weekly is an unusual period option."
- problem: Facts disagree on whether the default period options are monthly, yearly, whole period or daily, monthly, yearly, whole period, and whether weekly is unusual or default. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1900/PP new formula EMI & Interest calculator v7.xlsx › 360-30 › rows R13` "Default period: monthly, yearly, whole period! (R13"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 360-30` "Default period: monthly, yearly, whole period! (R13"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 360-30` "Unusual period: daily, weekly (R14"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 365-ACTUAL` "R15 | | | | | | | | | | | 17.13 | | Default period: daily, monthly, yearly, whole period"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 365-ACTUAL` "R15 | | | | | | | | | | | 17.13 | | Default period: daily, monthly, yearly, whole period"

### NR-b9796abc · Contradiction
- page: gitbook/developer/dev/loan-engine/interest.md
- section: EMI Calculation
- published: "Period options control how frequently repayments fall due. The default period options are daily, monthly, yearly and whole period, while weekly is an unusual period option."
- problem: Facts disagree on whether weekly is an unusual period option or a default period option. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1900/PP new formula EMI & Interest calculator v7.xlsx › 360-30 › rows R14` "Unusual period: daily, weekly (R14"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 360-30` "Unusual period: daily, weekly (R14"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 365-ACTUAL` "R15 | | | | | | | | | | | 17.13 | | Default period: daily, monthly, yearly, whole period"
  - `attachments/excel/jira-PS-1955/PP new formula EMI & Interest calculator v7.xlsx › 365-ACTUAL` "R15 | | | | | | | | | | | 17.13 | | Default period: daily, monthly, yearly, whole period"

### NR-9ec0b889 · Unfixed problem
- page: gitbook/developer/dev/loan-engine/interest.md
- section: EMI Calculation
- published: "The interest rate frequency can change how the rate factor formula is applied:"
- problem: A formula is spelled out in words; write it once as a formula in inline code.

### NR-d5e61f41 · Unfixed problem
- page: gitbook/developer/dev/loan-engine/interest.md
- section: Interest Waivers
- published: "The Interest Payment Waiver transaction follows these rules:"
- problem: The lead-in sentence repeats the list items; keep it to one short sentence.

### NR-b147dc9f · Contradiction
- page: gitbook/developer/dev/loan-engine/interest.md
- section: Interest Refunds
- problem: One fact states there are two refund columns while another states there are three refund columns. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1998/GPL Interest Refund Calculations (1).xlsx › UC21` "R5 | | | | | | | | | | First Refund | | | Second Refund"
  - `attachments/excel/jira-PS-1998/GPL Interest Refund Calculations (1).xlsx › UC23` "R5 | | | | | | | | | | First Refund | | | Second Refund | | | Third Refund"

### NR-596c576a · Unfixed problem
- page: gitbook/developer/dev/loan-engine/interest.md
- section: Interest Refunds
- published: "The daily recalculation follows these rules:"
- problem: A formula is spelled out in words; write it once as a formula in inline code.

### NR-973f960d · Contradiction
- page: gitbook/developer/dev/loan-engine/interest.md
- section: Early and Late Repayment Interest
- published: "Repayment and any repayment-like transaction amounts must be allocated properly. The repayment transaction future installment allocation rule must be set to Last installment."
- problem: One fact requires the future installment allocation rule to be Last installment while another states it is Next installment. Confirm which is correct and fix the source.
- sources:
  - `Early,  last installment payment - recalculation and transaction details` "Future installment allocation rule: Last installment"
  - `Early, Next installment payment - recalculation and transaction details` "Future installment allocation rule: Next installment"

### NR-b0002f39 · Contradiction
- page: gitbook/developer/dev/loan-engine/interest.md
- section: First-Day Interest
- published: "The disbursement date is Day 0 for interest purposes, and interest is calculated and accrued on that day at end of day based on the actual total outstanding principal at end of day. Intra-day actions such as repayment affect the daily interest amount, and payable interest stays in sync with the daily periodic accrual calculation. On Day 0 a full repayment can be done without paying any interest before end of day."
- problem: F-6c0c9419a53c says interest is calculated and accrued on Day 0, while F-b452b89d6fb2 says the obligation to pay interest starts on the day after disbursement. Confirm which is correct and fix the source.
- sources:
  - `Technical analysis and design` "Interest is calculated and accrued for Day 0 (disbursement date) at end of day"
  - `Technical analysis and design` "The obligation to pay interest is starting on the day after the disbursement that we consider as Day 0"

### NR-a122aa85 · Contradiction
- page: gitbook/developer/dev/loan-engine/repayment.md
- section: Payment Allocation Strategies
- published: "The repayment strategy order determines how payments are applied to amounts due on a loan. The order is: Due charges, In advanced principal, Penalty, Fee, Interest, Principal."
- problem: The facts give different repayment strategy payment orders. Confirm which is correct and fix the source.
- sources:
  - `New payment order with _in advance Principal_ and _due charges_` "New payment order: Due charges Due Penalty Due Fee Due interest Due principal In advanced principal In advanced Penalty In advanced Fee In advanced Interest"
  - `New payment order with _in advance Principal_ and _due charges_` "Repayment distribution Due/late penalty Due/late Fee Due/late interest Due/late principal In advance principal In advance penalty In advance fee In advance interest"
  - `attachments/confluence/3309633537/Time respective repayment strategy-3309633537.html › Goal › Expected scenarios › Current behaviour` "Repayment strategy:** **Penalty, Fee, Interest, Principal"
  - `attachments/confluence/3309633537/Time respective repayment strategy-3309633537.html › Goal › Expected scenarios › New behaviour #1` "New Repayment strategy:** Due charges, in advance Principal, Penalty, Fee, Interest, Principal"
  - `attachments/confluence/3309633537/Time respective repayment strategy-3309633537.html › Goal › High Level Design (HLD)` "New order:** 1. Due charges 2. In advanced principal 3. Penalty 4. Fee 5. Interest 6. Principal"

### NR-46dca81d · Unfixed problem
- page: gitbook/developer/dev/loan-engine/repayment.md
- section: Payment Allocation Strategies
- published: "Specific charge types use these dates for assignment:"
- problem: Block cites no facts.

### NR-8aebd8a7 · Contradiction
- page: gitbook/developer/dev/loan-engine/repayment.md
- section: Configurable Payment Allocations
- published: "Advanced payment allocation processes transactions, charges, and disbursements in chronological order to minimize reverse replaying. Loan transactions are ordered by transaction date, then submitted on date, then created date time. Loan charges are ordered by due date, then submitted on date, then creation date time."
- problem: F-a565c4a56167 orders loan transactions by transaction date, submitted on date, then created date time, while F-e6e957599b7c orders them by transaction date then created date time. Confirm which is correct and fix the source.
- sources:
  - `[API] - Adv. pmt. alloc. - Loan charge reverse-replaying logic` "Loan transaction order is firstly based on transaction date, secondarily based on submitted on date and thirdly based on created date time"
  - `[API] - Adv. pmt. alloc. - Loan charge reverse-replaying logic` "Loan transaction and loan charges are in chronological order of Loan transaction → transaction date, created date time"

### NR-7ab6b70d · Contradiction
- page: gitbook/developer/dev/loan-engine/repayment.md
- section: Configurable Payment Allocations
- published: "Advanced payment allocation processes transactions, charges, and disbursements in chronological order to minimize reverse replaying. Loan transactions are ordered by transaction date, then submitted on date, then created date time. Loan charges are ordered by due date, then submitted on date, then creation date time."
- problem: F-7ff5f1666fe3 orders loan charges by due date, submitted on date, then creation date time, while F-c3487e9761bc orders them by submitted on date then created date time. Confirm which is correct and fix the source.
- sources:
  - `[API] - Adv. pmt. alloc. - Loan charge reverse-replaying logic` "Loan charge order is firstly based on due date, secondarily submitted on date, third on creation date time"
  - `[API] - Adv. pmt. alloc. - Loan charge reverse-replaying logic` "Loan charge order is firstly based on due date, secondarily submitted on date, third on creation date time Acceptance Criteria Loan charge can be reverse-replayed when advanced repayment allocation strategy is set Prior payment transactions are not effected by later added charges Loan transaction and loan charges are in chronological order of Loan transaction → transaction date, created date time Loan charges → submitted on date, created date time"

### NR-fe6f118e · Contradiction
- page: gitbook/developer/dev/loan-engine/repayment.md
- section: Configurable Payment Allocations
- published: "Future installment allocation rule codes are NEXT_INSTALLMENT, LAST_INSTALLMENT, and REAMORTIZATION. The future installment allocation rule code is futureInstallmentAlocationRule."
- problem: One fact lists Reamortization as REAMORTIZATION while two others list Reamortisation as REAMORTISATION or Re-amortization as RE_AMORTISATION. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/3400335384/Configurable payment allocations for transactions-3400335384.html › Goal › Low Level Design (LLD) › Configuration` "Next installment → code: NEXT_INSTALLMENT - Last installment → code: LAST_INSTALLMENT - Reamortization → code: REAMORTIZATION"
  - `[API] - Advanced payment allocation strategy configuration on Loan product` "Reamortisation (code: REAMORTISATION"
  - `[UI] - Configure advanced payment allocation rules for transactions` "Re-amortization (code: RE_AMORTISATION"

### NR-3891353a · Unfixed problem
- page: gitbook/developer/dev/loan-engine/repayment.md
- section: Configurable Payment Allocations
- published: "The following transaction types are handled the same way as before under Advanced payment allocation:"
- problem: Fact F-0480dc292522 is already stated in an earlier block; state each fact once.

### NR-130aa5c9 · Contradiction
- page: gitbook/developer/dev/loan-engine/chargeback.md
- section: Interest on Chargebacks
- published: "Chargeback allocation rules apply when a chargeback allocation rule is set on the loan product and interest recalculation is enabled. Interest recalculation is disabled when no chargeback allocation rule is set. Full chargeback behaviour applies to any non-progressive loans."
- problem: One fact states chargeback allocation applies when interest recalculation is enabled, while another states chargeback on a loan with interest recalculation is explicitly disabled. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/google-sheet-1qeJEzHb8HKUFUXeLxU4iI1Oq00O2aUrL9XQjbZG0zw4/google-sheet-1qeJEzHb8HKUFUXeLxU4iI1Oq00O2aUrL9XQjbZG0zw4.xlsx › PS-2255 UCs` "When chargeback allocation rule is set and Interest recalculation is ENABLED (R1"
  - `Chargeback not working` "Showing wrong error message seems a UI issue here. However please note at the moment Chargeback on loan with interest recalculation is explicitly disabled at the moment. Shall we do something about this? Please advise"

### NR-c48f5077 · Contradiction
- page: gitbook/developer/dev/loan-engine/chargeback.md
- section: Interest on Chargebacks
- published: "When the original transaction portions changed, the Chargeback must be recalculated and reallocated."
- problem: Facts disagree on whether the Chargeback must be recalculated and reallocated when original transaction portions changed. Confirm which is correct and fix the source.
- sources:
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #1` "If the original transaction portions got changed, we DONT need to recalculate and reallocate the Chargeback, as Chargeback amount cannot be changed and all amount was allocated already to principal, but still we need to reprocess and the repayment schedule might change anyway"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation NOT enabled loans - Behaviour #1` "If the original transaction portions got changed, we DONT need to recalculate and reallocate the Chargeback, as Chargeback amount cannot be changed and all amount was allocated already to principal, but still we need to reprocess and the repayment schedule might change anyway"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation NOT enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"

### NR-e95413ac · Contradiction
- page: gitbook/developer/dev/loan-engine/chargeback.md
- section: Interest on Chargebacks
- published: "For progressive loans where interest recalculation is enabled, all transactions including the Chargeback must be reprocessed to recalculate interest if the principal due amount changed."
- problem: Facts disagree on whether reprocessing is required when original transaction portions changed. Confirm which is correct and fix the source.
- sources:
  - `Enhance chargeback transaction posting for interest component` "For progressive loan where interest recalculation is enabled, we need to change it to reprocess all the transactions (including the Chargeback) as well, because we need to recalculate the interest if the principal due amount got changed"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #1` "For progressive loan where interest recalculation is enabled, we need to change it to reprocess all the transactions (including the Chargeback) as well, because we need to recalculate the interest if the principal due amount got changed"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #2` "Since Chargeback transaction is always the current date, we were not reprocessing every transaction, only applying the Chargeback to the repayment schedule as the last transaction, which was fine for non-interest bearing loans or interest recalculation is not enabled: org.apache.fineract.portfolio.loanaccount.domain.transactionprocessor.LoanRepaymentScheduleTransactionProcessor#processLatestTransaction For progressive loan where interest recalculation is enabled, we need to change it to reprocess all the transactions (including the Chargeback) as well, because we need to recalculate the interest if the principal due amount got changed"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #1` "If the original transaction portions got changed, we DONT need to recalculate and reallocate the Chargeback, as Chargeback amount cannot be changed and all amount was allocated already to principal, but still we need to reprocess and the repayment schedule might change anyway"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation NOT enabled loans - Behaviour #1` "If the original transaction portions got changed, we DONT need to recalculate and reallocate the Chargeback, as Chargeback amount cannot be changed and all amount was allocated already to principal, but still we need to reprocess and the repayment schedule might change anyway"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"
  - `[Backend] Support Chargeback for progressive, interest bearing, interest recalculation NOT enabled loans - Behaviour #2` "If the original transaction portions got changed, we need to recalculate and reallocate the Chargeback, also we need to reprocess and the repayment schedule might also change"

### NR-788dbb27 · Contradiction
- page: gitbook/developer/dev/loan-engine/disbursement.md
- section: Down Payments
- problem: Facts disagree on whether a fully paid installment causes the second disbursement amount to be allocated to the last two installments only or to all three remaining future installments. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/jira-PS-1493/Disbursement amount distribution scenario.xlsx › use case › rows R18, R21` "R18 | Disbursement | 1/10/22 | 1/10/22 | 400 | | | 2/1/22 | $250.00 | | $- | $50.00 | $300.00 | $- | $300.00 | $- | $900.00 | since this installment is fully paid, the second disbursement amount will be allocated to last two installments only | | R19 | | | | | | | 3/1/22 | $400.00 | | $- | $- | $400.00 | $200.00 | $200.00 | $- | $700.00 | | | R20 | | | | | | | 4/1/22 | $400.00 | | $- | $- | $400.00 | $400.00"
  - `attachments/excel/jira-PS-1493/Disbursement amount distribution scenario.xlsx › use case › rows R41` "R41 | Disbursement | 1/10/22 | 1/10/22 | 400 | | | 2/1/22 | $350.00 | | $- | $50.00 | $350.00 | $50.00 | $300.00 | $- | $850.00 | even though the installment is fully paid, the second disbursement amount will be allocated for all 3 remaining future installments | | R42 | | | | | | | 3/1/22 | $350.00 | | $- | $- | $350.00 | $150.00 | $200.00 | $- | $650.00 | | | R43 | | | | | | | 4/1/22 | $350.00 | | $- | $- | $350.00 | $350.00 | $- | $- | $- | | even though the installment is fully paid, the second disbursement amount will be allocated for all 3 remaining future installments (R45"

### NR-40153aab · Contradiction
- page: gitbook/developer/dev/loan-engine/disbursement.md
- section: Same-Day Disbursement and Instalments
- published: "The following rules govern the CBR amount:"
- problem: Facts disagree on whether the CBR amount must match the overpayment amount, may be lower than it, or cannot exceed it. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/3574202422/CBR _ Chargeback _ Disbursement on overpaid loans-3574202422.html › Credit Balance Refund (CBR) on overpaid loan › Key features` "CBR amount is matching with the amount of overpayment on the loan"
  - `attachments/confluence/3574202422/CBR _ Chargeback _ Disbursement on overpaid loans-3574202422.html › Credit Balance Refund (CBR) on overpaid loan › Key features` "It can be lower, but hence this is a tool to handle overpayment on the loan, it does not really make sense to initiate CBR transaction with lower amount"
  - `attachments/confluence/3574202422/CBR _ Chargeback _ Disbursement on overpaid loans-3574202422.html › Credit Balance Refund (CBR) on overpaid loan › Key features` "It **cannot** be higher then the overpayment amount on the loan"

### NR-f5bb5742 · Contradiction
- page: gitbook/developer/dev/loan-engine/disbursement.md
- section: Backdated Loans
- published: "The following results match between Temenos and Fineract:"
- problem: F-fb499a2f1a7b states the first and second repayment period interest amounts match, while F-14e478737569, F-d257125a91df, F-d67789db89d8, F-2586c18e282c, and F-38eaea155226 state future, second, third, or general period interests do not match. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/4296802323/US-Loan Account Scenarios Analysis between T-24 and Fineract-4296802323.html › Discrepancies matrix › S1.2: Single Disbursement - Early payment (current date 01 December 2024) REVIEWEDPurple  NOT MATCHINGRed › Disbursement - $5000 at 01 October 2024 (current date 01 December 2024) REVIEWEDPurple NOT MATCHINGRed` "1st and 2nd repayment period interest amounts are matching - 1st period past due, 2nd period due"
  - `attachments/confluence/4296802323/US-Loan Account Scenarios Analysis between T-24 and Fineract-4296802323.html › Discrepancies matrix › S1.2: Single Disbursement - Early payment (current date 01 December 2024) REVIEWEDPurple  NOT MATCHINGRed › Disbursement - $5000 at 01 October 2024 (current date 01 December 2024) REVIEWEDPurple NOT MATCHINGRed` "Future installments interest amounts are not matching"
  - `attachments/confluence/4296802323/US-Loan Account Scenarios Analysis between T-24 and Fineract-4296802323.html › Discrepancies matrix › S3. Multi Disbursement on Different dates and advance payment (adjust to last) and late payment REVIEWedYellown/aBlue NOT MATcHINGRed › Screenshot after 1st Disbursement (As of 10-Nov-2024)` "2. Interests from second periods are not matching"
  - `attachments/confluence/4296802323/US-Loan Account Scenarios Analysis between T-24 and Fineract-4296802323.html › Discrepancies matrix › S3. Multi Disbursement on Different dates and advance payment (adjust to last) and late payment REVIEWedYellown/aBlue NOT MATcHINGRed › Screenshot after 1st Repayment (As of 10-Nov-2024)` "2. Interests from third periods are not matching"
  - `attachments/confluence/4296802323/US-Loan Account Scenarios Analysis between T-24 and Fineract-4296802323.html › Discrepancies matrix › S1.2: Single Disbursement - Early payment (current date 01 December 2024) REVIEWEDPurple  NOT MATCHINGRed › 1st Repayment (early) - $857.78 at 20 October 2024 (current date 01 December 2024)REVIEWEDPurpleNOT MATCHINGRed` "3rd period calculated interest does not matching"
  - `attachments/confluence/4296802323/US-Loan Account Scenarios Analysis between T-24 and Fineract-4296802323.html › Discrepancies matrix › S3. Multi Disbursement on Different dates and advance payment (adjust to last) and late payment REVIEWedYellown/aBlue NOT MATcHINGRed › Screenshot after 2nd Disbursement` "2. Period Interest is not matching"

### NR-2d7af0e7 · Unfixed problem
- page: gitbook/developer/dev/loan-engine/disbursement.md
- section: Backdated Loans
- published: "Schedule-specific differences include:"
- problem: States a bug or old behaviour (F-3bfb0999e53b, F-77180dae9505); remove that statement and its citation.

### NR-b50f70a6 · Contradiction
- page: gitbook/developer/dev/loan-engine/restructuring.md
- section: Re-aging
- published: "Re-aging applies to interest-bearing, progressive loan accounts with interest handling set to default behavior. You can configure re-aging from any date of the loan cycle after the first disbursement date, including before the maturity date. The re-aging date must not be before the last repayment date."
- problem: Facts disagree on whether re-aging can occur before the last repayment date. Confirm which is correct and fix the source.
- sources:
  - `Re-aging for Interest bearing products` "Allow re-aging from any date of loan cycle"
  - `Re-aging for Interest bearing products` "Re-aging date can be before the last repayment date"
  - `Re-aging:- Allow backdated Re-aging on a loan account` "Re-aging can be done any date of the loan life cycle (after 1st disbursement date"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Default Behavior,  interestRecalculation disabled, re-aging changes the due dates` "Re-aging date should not be before the last repayment date"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › AC` "Re-aging date should not be before the last repayment date (R3"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › RE-aging-  interest& fees capit` "allow re-agin from any date of loan cycle (R84"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › RE-aging-  interest& fees capit` "re-aging date should not be before the last repayment date (R85"

### NR-3ea002f9 · Contradiction
- page: gitbook/developer/dev/loan-engine/restructuring.md
- section: Re-aging
- published: "Re-aging applies to interest-bearing, progressive loan accounts with interest handling set to default behavior. You can configure re-aging from any date of the loan cycle after the first disbursement date, including before the maturity date. The re-aging date must not be before the last repayment date."
- problem: Facts disagree on whether re-aging can occur before the maturity date for interest-bearing loans. Confirm which is correct and fix the source.
- sources:
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Interest calculation: Default Behavior` "Allow re-aging for Interest bearing, progressive loan accounts. With Interest handling: default behavior"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Interest calculation: Default Behavior` "Re-aging date should not be before the last repayment date"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Interest calculation: Default Behavior` "Only applicable for Progressive loan strategy"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Default Behavior,  interestRecalculation disabled, re-aging changes the due dates` "Allow backdated Re-aging on interest bearing loan account - Default Behavior, interestRecalculation disabled, re-aging changes the due dates Background and Details Currently User can only do Re-aging after the Maturity date and only for non -Interest Bearing loans. Once this task done, it will remain to cover situations where: interestRecalculation disabled re-aging changes the due dates Goal Allow re-aging for Interest bearing, progressive loan accounts. With Interest handling: default behavior Acceptance Criteria User should be able to configure Re-Aging before maturity date as well Re-aging can be done any date of the loan life cycle Re-aging date should not be before the last repayment date. User should be able to apply re-aging for Interest-bearing loan products. Interest rate and interest recalculation remains the same Interest recalculation = true → update model and use it Interest recalculation = false → use only repayment installments (default behavior) Only applicable for Progressive loan strategy Interest Handling is Default behavior"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Interest calculation: Default Behavior` "User should be able to configure Re-Aging before maturity date as well"
  - `Re-aging:- Allow backdated Re-aging on interest bearing loan account - Interest calculation: Default Behavior` "Re-aging can be done any date of the loan life cycle"

### NR-933f8b2e · Contradiction
- page: gitbook/developer/dev/loan-engine/restructuring.md
- section: Re-aging
- published: "Re-aging can be applied to a charge-off loan account. Charge-back amount has no impact on re-aging."
- problem: One fact says re-aging is not allowed on a charged-off loan, while six facts say it can be applied to charge-off loan accounts. Confirm which is correct and fix the source.
- sources:
  - `Re-aging:   Charge-off and Contract Termination before Reaging` "Reaging is not allowed on a loan that is charged-off"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › AC` "Can be applied on charge-off loan account as well (R5"
  - `attachments/excel/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ/google-sheet-1dI9k_emnbby8m3QEWvK5T17Fe724A1SjCu2lLXjc7PQ.xlsx › RE-aging-  interest& fees capit` "can be applied on charge-off loan account as well (R87"
  - `attachments/excel/google-sheet-1U1247Rlvvt8Mn0pUeYLLssxfEi1DQ8SPL-_u27oU8yg/google-sheet-1U1247Rlvvt8Mn0pUeYLLssxfEi1DQ8SPL-_u27oU8yg.xlsx › RE-aging-  interest& fees capit` "can be applied on charge-off loan account as well (R87"
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › AC` "Can be applied on charge-off loan account as well (R5"
  - `attachments/excel/google-sheet-1gGMSMG49BfyROx7OY-ayS5s3sX41yFIj2C3tBxqq_SQ/google-sheet-1gGMSMG49BfyROx7OY-ayS5s3sX41yFIj2C3tBxqq_SQ.xlsx › RE-aging-  interest& fees capit` "can be applied on charge-off loan account as well (R87"

### NR-877a0f4a · Contradiction
- page: gitbook/developer/dev/loan-engine/restructuring.md
- section: Re-aging
- published: "The following rules apply to charges, fees, iteration, and fixed amounts during re-aging:"
- problem: Two facts give different fixed EMI amounts: 17.01 and 12.76. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › Re-aging-S5.1 › rows R21` "R20 | | Total | 102.05 | 100.00 | 2.05 | | | | | | EMI | | R21 | | | | | | | | | | | 17.01"
  - `attachments/excel/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ/google-sheet-19BL2t7oKssZZ0YyUSuezUkvhNrhm6bn4N7E-BDD-ATQ.xlsx › Re-aging-S7 › rows R22` "R21 | | Total | 76.54 | 75.00 | 1.54 | | | | | | EMI | | R22 | | | | | | | | | | | 12.76"

### NR-4d7d4b41 · Contradiction
- page: gitbook/developer/dev/loan-engine/restructuring.md
- section: Re-aging
- published: "Charges and fees are handled during re-aging as follows:"
- problem: Facts disagree on whether charges or fees with a due-date before the re-age date remain unchanged or are split among new installments. Confirm which is correct and fix the source.
- sources:
  - `Re-aging for Interest bearing products` "Charges/fees with due-date after the re-age date will remain as is on that installment"
  - `Re-aging for Interest bearing products` "Charges/fees with due-date before the re-age date will be split equally among new installments"
  - `[DUPLICATE OF PS-2778] Re-aging:- Allow fixed, equally amortized reschedule of outstanding balances of the loan` "Charges are split evenly across each installments"

### NR-0c74b514 · Contradiction
- page: gitbook/developer/dev/loan-engine/restructuring.md
- section: Re-amortization
- published: "Re-amortization applies to interest bearing loan accounts that use the Progressive repayment strategy. You cannot apply it after the maturity date or to charge-off and written-off loan accounts."
- problem: Facts disagree on whether re-amortization can be applied to charge-off loan accounts. Confirm which is correct and fix the source.
- sources:
  - `Re-amortization for Interest Bearing` "Cannot be applied on charge-off and written-off loan accounts"
  - `[UI][BE]Re-amortization on charge-off & Written-off loan account` "Re-amortization cannot be applied on Charge-off loan account"
  - `attachments/excel/google-sheet-1Bi2AYSAV_QlRQWZFberara7KdX_U5T_nFhD88cwDEN4/google-sheet-1Bi2AYSAV_QlRQWZFberara7KdX_U5T_nFhD88cwDEN4.xlsx › RE` "re-amortization to allow on charge-off loan accounts as well (R94"

### NR-ab12ab81 · Contradiction
- page: gitbook/developer/dev/loan-engine/delinquency.md
- section: Pausing Delinquency
- published: "A pause start date cannot be backdated and must be from the current date, while the end date can be any valid future date. If a pause period already exists, the new start date cannot be before the last pause period end date; otherwise it cannot be before the loan's first disbursement date. A new pause start date can start as of the old past end date if there was one, because pause days calculation works on N+1 days."
- problem: Facts disagree on whether a pause start date can be backdated. Confirm which is correct and fix the source.
- sources:
  - `Pause Delinquency` "Pause date start date should be from current_date (cannot be backdated) where as end_date can be any valid future date"
  - `Backdated Pause Delinquency - Backend changes` "I want to start the pause delinquency backdated in order to add the pause delinquency from backdate Background and details: Current Implementation of pause delinquency is that the pause start date have to be current date always. In real life the admin gets to know the pause request only after 1 or 2 days. Hence the system should support the backdated pause start date Acceptance criteria As a user I should be able to create a pause start date in backdate"

### NR-81089728 · Contradiction
- page: gitbook/developer/dev/loan-engine/recovery.md
- section: Charge-Off
- published: "You can reverse a transaction dated before the charge-off transaction, and reversing such a transaction increases or decreases the charge-off amount during replay, such as increasing the charge-off amount when reversing a repayment. A transaction dated before the charge-off date cannot be added. Reverse replay of a charge-off transaction keeps the distribution up to date."
- problem: Facts disagree on whether reversing a transaction dated before the charge-off date is allowed. Confirm which is correct and fix the source.
- sources:
  - `Charge off Loan Validations` "Reversal of transactions that happened before the charge-off transaction should be allowed"
  - `Post charge-off scenarios to Implement` "As a user, I should be able to reverse a transaction that happened before the charge-off date"
  - `Charge off Loan Validations` "Reversal of transactions that happened before or on the date of the charge-off transaction isn’t allowed"
  - `Charge off Loan Validations` "Backdated transaction which dates before as charge-off isn’t allowed"
  - `Post charge-off scenarios to Implement` "Not allowing backdated transactions or reversal of transactions that happened before the charge-off date"

### NR-66968a23 · Contradiction
- page: gitbook/developer/dev/loan-engine/recovery.md
- section: Charge-Off Balances
- published: "Charge-off behavior options are Regular, Zero interest after charge-off, and Accelerate maturity to charge-off date. The behavior is stored with the product definition, and support for the selected behavior is validated for the loan product. A Charge-off behavior selector appears on the Setting >> Loan schedule page. The behavior applies only to Progressive loan products where interest is not zero; interest recalculation is not relevant and repayment interest is irrelevant, with all methods working the same way and interest calculated till the charge-off date. If a loan product is not progressive or does not have interest or interest recalculation is not enabled, only REGULAR charge-off behaviour is supported."
- problem: Facts disagree on whether interest recalculation being disabled restricts charge-off behavior to REGULAR. Confirm which is correct and fix the source.
- sources:
  - `[UI + Backend] Configuration extension with new charge-off behaviour` "If loan product is not progressive, only “REGULAR” charge-off behaviour is supported"
  - `[UI + Backend] Configuration extension with new charge-off behaviour` "If loan product is not progressive or does not have interest or interest recalculation is not enabled, only “REGULAR” charge-off behaviour is supported"
  - `[UI + Backend] Configuration extension with new charge-off behaviour` "This is only applicable for Progressive loan product where interest is not zero (interest recalculation is not relevant, same as repayment interest is irrelevant), all of them to work the same way, interest till charge-off date"

### NR-71cfa56b · Contradiction
- page: gitbook/developer/dev/loan-engine/fees.md
- section: Capitalized Income
- published: "You can add capitalized income to a loan account through the API. The transaction amount is whatever amount you provide, and payment type, note, and external id are supported. Capitalized income can be added once the loan is active and is only supported for progressive loans. The transaction date can be any date on or after the first disbursement date."
- problem: F-d156778f3560 says capitalized income is added on disbursement date only, while F-c696767a4fa6 says it can be added once the loan is active. Confirm which is correct and fix the source.
- sources:
  - `Origination fee -> Capitalized income` "It is added to the loan account at Disbursement level and on disbursement date only through API"
  - `[Backend] Capitalized income - Add Capitalized income to Loan` "Once the loan is active, we can add capitalized income"

### NR-3aa62f6e · Contradiction
- page: gitbook/developer/dev/loan-engine/fees.md
- section: Capitalized Income
- published: "You can add capitalized income to a loan account through the API. The transaction amount is whatever amount you provide, and payment type, note, and external id are supported. Capitalized income can be added once the loan is active and is only supported for progressive loans. The transaction date can be any date on or after the first disbursement date."
- problem: F-d156778f3560 says capitalized income is added on disbursement date only, while F-b59e7fe1eef9 says the transaction date can be any date on or after the 1st disbursement date. Confirm which is correct and fix the source.
- sources:
  - `Origination fee -> Capitalized income` "It is added to the loan account at Disbursement level and on disbursement date only through API"
  - `[Backend] Capitalized income - Add Capitalized income to Loan` "Transaction date: It can be added as any date on or after 1st disbursement date"

### NR-4b504e8e · Contradiction
- page: gitbook/developer/dev/loan-engine/fees.md
- section: Capitalized Income
- published: "A transaction can be reversed only when it has not yet been reversed and its dependency condition is met:"
- problem: Facts state both that no reversal support is needed for Capitalized Income or Capitalized Income Adjustment and that each can be reversed when not yet reversed. Confirm which is correct and fix the source.
- sources:
  - `Origination fee -> Capitalized income` "Can Capitalized income or Capitalized income adjustment to be reverted? → No need to support reversal, but worth to review"
  - `[UI & Backend] Capitalized income - Reversal of existing transaction` "Not yet reversed “Capitalized Income” transaction is allowed to be reversed if Mirror JE entries will be based for reversal entry of that transaction There is no any not yet reversed “Capitalized Income Adjustment” that belongs to this transactions (transaction relationship"
  - `[UI & Backend] Capitalized income Adjustment - Reversal of existing transaction` "Not yet reversed “Capitalized Income Adjustment” transaction is allowed to be reversed"

### NR-356704ed · Unfixed problem
- page: gitbook/developer/dev/loan-engine/fees.md
- section: Capitalized Income
- published: "Create Capitalized Income transaction"
- problem: Fact F-dda023b91619 is already stated in an earlier block; state each fact once.

### NR-4953b85c · Contradiction
- page: gitbook/developer/dev/loan-engine/bnpl.md
- section: Pay in 3 and 4
- published: "Asset Owner ID"
- problem: F-66506daea8b9 says new ownership starts the day after settlement, while F-e149e433aee1 says Pin30 is transferred with the same settlement date. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/3348168732/Asset externalization Solution Design-3348168732.html › Glossary` "T2.R3 | **Settlement date** | The last date when the previous owner still holds the asset. New ownership starts the very next day"
  - `attachments/confluence/3280470308/Asset Externalization requirements-3280470308.html › Glossary › Decision tracker` "T6.R1 | 2023-04-21 | | > **Decision:** Settlement date can not be in the past. API refuses it. (Future date is allowed but Pin30 is going to be transferred with same date) No transfer between owners. It’s only possible after buyback. > **Decision:** in case of Transfer (sale) and a buyback added for the same day, Sale first, buyback after. > **Decision:** in case there’s a pending transfer, new transfer requests will be refused"

### NR-2a48115f · Contradiction
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: EIR New Scope
- published: "Changes on periods prior to the reset date do not affect current evaluations and calculations."
- problem: One fact says backdated repayments or adjustments before the reset date affect breach evaluation after reset, while the other says changes before the reset date have no effect on current evaluations. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Breach Management › Breach ResetNewPurple › Functionality` "Any **backdated repayments or adjustments** (with a value date before the reset date) will **impact or alter the breach evaluation** after the reset as well.However, anychanges on those periods will not have any effect on current evaluations and calculations"
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Breach Management › Breach ResetNewPurple › Functionality` "Any **backdated repayments or adjustments** (with a value date before the reset date) will **impact or alter the breach evaluation** after the reset as well.However, anychanges on those periods will not have any effect on current evaluations and calculations"

### NR-007e015f · Unfixed problem
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: EIR New Scope
- published: "Multiple near breach configurations can be mapped to a loan product, and multiple evaluations can be tagged to the loan product."
- problem: The lead-in sentence repeats the list items; keep it to one short sentence.

### NR-4e366b79 · Contradiction
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: Effective Interest Rate Product
- published: "Delinquency configuration parameters defined at the loan account level include Name, Frequency, Frequency Type, Breach amount type (calculation), and Breach amount."
- problem: Facts disagree on whether the loan account-level delinquency parameters include Minimum payment amount type and Minimum payment amount or Breach amount type and Breach amount. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Delinquency Management › Delinquency Configuration` "Name -**name of the Delinquency configuration - **Frequency** Numeric value representing the range interval. - **Frequency Type** Time unit of the range interval (e.g., days, weeks, months). - **Minimum payment amount type (calculation)** - **Percentage** Percentage of loan amount - **Flat** Flat amount - **Minimum payment amount"
  - `attachments/confluence/5097553941/Working Capital Product Requirement-5097553941.html › Breach Management › Purpose › Breach Configuration` "Users must define the following parameters to configure the delinquency at the loan account level: - **Name -**name of the breach configuration - **Frequency** Numeric value representing the range interval. - **Frequency Type** Time unit of the range interval (e.g., days, weeks, months). - **Breach amount type (calculation)** - **Percentage** Percentage of loan amount - **Flat** Flat amount - **Breach amount"

### NR-632b9d4c · Unfixed problem
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: Delinquency Restrictions
- published: "Resume Delinquency"
- problem: Fact F-f35b884f6e31 is already stated in an earlier block; state each fact once.

### NR-26cf5096 · Contradiction
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: Breach Management
- published: "The following rules apply to breach reset behavior:"
- problem: Facts disagree on whether multiple breach resets are supported. Confirm which is correct and fix the source.
- sources:
  - `[BE] WC - Breach Reset / Undo Reset` "User should be able to do Multiple reset on the breach schedule"
  - `[UI] WC - Breach Reset` "Mutliple reset"

### NR-44e73f5d · Contradiction
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: Cross-Cutting Capabilities
- published: "No Discount Fee Amortization Adjustment is generated unless a Discount Fee Adjustment was actually made."
- problem: One fact says an adjustment posts on the last day without any discount fee adjustment having been made, while the other says no adjustment is generated unless one was actually made. Confirm which is correct and fix the source.
- sources:
  - `[BE] WC - Discount fee amortization drifts from the schedule after a repayment that is not a multiple of the daily payment (realized income exceeds the discount fee, self-generated amortization adjustment at closure)` "On the last day the system posts a Discount Fee Amortization Adjustment 0.53 (JE: credit Deferred Interest Revenue / debit Interest Income) although no discount fee adjustment was ever made — that is how the total gets back to 1000.00"
  - `[BE] WC - Discount fee amortization drifts from the schedule after a repayment that is not a multiple of the daily payment (realized income exceeds the discount fee, self-generated amortization adjustment at closure)` "No Discount Fee Amortization Adjustment is generated unless a Discount Fee Adjustment was actually made"

### NR-197dd857 · Contradiction
- page: gitbook/developer/dev/loan-engine/working-capital.md
- section: Cross-Cutting Capabilities
- published: "Discount fee amortization keeps the running amortized total and the not-yet-amortized balance equal to the discount fee net of discount fee adjustments at all times, and realized income never exceeds the discount fee while the loan is active. A deferred discount fee balance can never be negative."
- problem: One fact says realized income never exceeds the discount fee while the loan is active, while another says the loan recognizes more than the whole discount fee while still active. Confirm which is correct and fix the source.
- sources:
  - `[BE] WC - Discount fee amortization drifts from the schedule after a repayment that is not a multiple of the daily payment (realized income exceeds the discount fee, self-generated amortization adjustment at closure)` "amortized + not yet amortized = discount fee (net of discount fee adjustments)" holds at all times; realized income never exceeds the discount fee while the loan is active"
  - `[BE] WC - Discount fee amortization drifts from the schedule after a repayment that is not a multiple of the daily payment (realized income exceeds the discount fee, self-generated amortization adjustment at closure)` "From day 208 the loan has recognised more than the whole discount fee (1000.16 … 1000.53) while it is still ACTIVE with 33.80 outstanding; unrealized income shows 0 only because negative values are cut to 0. In the GL the Deferred Interest Revenue account (240005) is over-debited by 0.53 for four days"

### NR-f22525f0 · Contradiction
- page: gitbook/developer/dev/apis/loan-originator.md
- section: Loan Originator Metadata
- published: "Reporting attaches the originator external id to the Transaction Summary Report and Trial Balance Report, and the MerchantOriginator ID appears in both reports when the loan origination module is enabled."
- problem: Facts disagree on whether the required reports are Transaction Summary Report and Trial Balance Report or Trial Summary Report and Trial Balance Report. Confirm which is correct and fix the source.
- sources:
  - `attachments/confluence/5050597378/Loan origination details-5050597378.html › Goal › Reporting extensions` "Transaction Summary Report** - **Trial Balance Report** (doc also says Trial Summary in one place; assume Trial Balance + Transaction Summary are required"
  - `attachments/confluence/5050597378/Loan origination details-5050597378.html › Goal › Low Level Design › Create and attach immediately as part of loan creation flow` "Reporting** - Trial Summary Report - Trial Balance Report"

### NR-98b42ab7 · Missing source
- page: gitbook/developer/dev/data/write-serialization.md (not published)
- section: Write Serialization
- problem: No spec or ticket describes this topic. Add one, or remove the topic from the sidebar.

### NR-ee0ac5d8 · Unfixed problem
- page: gitbook/developer/dev/assets-investors/asset-externalization.md
- section: Asset Externalization
- published: "COB only processes transfers whose effective date equals the business date and whose valid_to is 9999-12-31."
- problem: Numbers not found in the cited facts: 9999.

### NR-898ecd7e · Contradiction
- page: gitbook/developer/dev/contributing/requirements.md
- section: Re-amortization and Re-aging Requirements
- problem: Whether re-amortization can be applied when outstanding fees or penalties exist. Confirm which is correct and fix the source.
- sources:
  - `Re-amortization and Repayment schedule handing requirements` "Only principal can be re-amortized so re-amortization can be applied if there are any outstanding fees or penalties, those will be still outstanding for their particular Installments and must be paid/waived at original due date, the so re-amortization will redistribute principal only"
  - `attachments/confluence/3510272021/Re-Amortization and Re-Aging-3510272021.html › Goal › Re-amortization` "Only principal can be re-amortized so re-amortization can't be applied if there are any outstanding fees or penalties, those will be still outstanding for their particular Installments and must be paid/waived by the user"

### NR-9591c701 · Contradiction
- page: gitbook/developer/dev/contributing/team-process.md
- section: PepperSoup POC Report Out
- published: "The PepperSoup POC report covers 34827 successful cases, representing 88.90% of cases."
- problem: F-d5e0ccb05563 states 35201 successful cases while F-3600443d43e5 states 34827 successful cases. Confirm which is correct and fix the source.
- sources:
  - `attachments/excel/confluence-3635675224/DE_GPL_Effective_Rate_Below_9995_v3.xlsx › 9.99% Limit › rows R11` "R11 | 3 | 0.10 | 0.000000 | SUCCESS | | SUCCESS Count | 35201 | 88.90%"
  - `attachments/excel/confluence-3635675224/DE_GPL_Effective_Rate_Below_9995_v3.xlsx › 9.995% Limit` "R10 | 3 | 0.09 | 0.000000 | SUCCESS"

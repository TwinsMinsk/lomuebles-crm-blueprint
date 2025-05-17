
-- Create the function to get financial summary
CREATE OR REPLACE FUNCTION public.get_financial_summary(date_from date, date_to date)
RETURNS json AS $$
DECLARE
    income_total numeric;
    expense_total numeric;
    profit numeric;
    result json;
BEGIN
    -- Calculate total income
    SELECT COALESCE(SUM(amount), 0)
    INTO income_total
    FROM transactions
    WHERE type = 'income'
    AND transaction_date >= date_from
    AND transaction_date <= date_to;
    
    -- Calculate total expenses
    SELECT COALESCE(SUM(amount), 0)
    INTO expense_total
    FROM transactions
    WHERE type = 'expense'
    AND transaction_date >= date_from
    AND transaction_date <= date_to;
    
    -- Calculate profit/loss
    profit := income_total - expense_total;
    
    -- Construct result JSON
    SELECT json_build_object(
        'total_income', income_total,
        'total_expense', expense_total,
        'profit', profit
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

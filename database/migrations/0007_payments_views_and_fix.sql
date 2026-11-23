CREATE TABLE IF NOT EXISTS payments.meeting_fee_payments (
    id uuid PRIMARY KEY,
    meeting_fee_id uuid NOT NULL REFERENCES payments.meeting_fees (id),
    status text NOT NULL
);

ALTER TABLE payments.subscription_payments
    ADD COLUMN IF NOT EXISTS period_months int;

UPDATE payments.subscription_payments
SET period_months = CASE
    WHEN period_type = 'Year' THEN 12
    WHEN period_type = 'HalfYear' THEN 6
    ELSE 1
END
WHERE period_months IS NULL;

CREATE OR REPLACE VIEW payments.v_price_list_items AS
SELECT
    id,
    subscription_period_code AS "subscriptionPeriodCode",
    country_code AS "countryCode",
    money_value AS "moneyValue",
    money_currency AS "moneyCurrency",
    price_list_item_category_code AS "priceListItemCategoryCode",
    is_active AS "isActive"
FROM payments.price_list_items;

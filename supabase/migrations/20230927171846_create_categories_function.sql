CREATE OR REPLACE FUNCTION get_categories()
RETURNS json
LANGUAGE sql
AS $$
    SELECT to_jsonb(enum_range(NULL::category_t));
$$;
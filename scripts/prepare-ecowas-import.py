from pathlib import Path
import pandas as pd
import math

DOWNLOADS = Path.home() / "Downloads"
OUTPUT = Path.cwd() / "supabase" / "ecowas_data_import.sql"

INPUT_FILE = DOWNLOADS / "APMD_ECOWAS_Input_Simulated_2006_2025_1.xlsx"
LIVESTOCK_FILE = DOWNLOADS / "APMD_ECOWAS_Livestock_Simulated_2006_2025.xlsx"

COUNTRY_MAP = {
    "Benin": 1,
    "Burkina Faso": 2,
    "Cabo Verde": 3,
    "Côte d’Ivoire": 4,
    "The Gambia": 5,
    "Ghana": 6,
    "Guinea": 7,
    "Guinea-Bissau": 8,
    "Liberia": 9,
    "Mali": 10,
    "Niger": 11,
    "Nigeria": 12,
    "Senegal": 13,
    "Sierra Leone": 14,
    "Togo": 15,
}


def sql_value(value):
    if pd.isna(value):
        return "NULL"

    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"

    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return "NULL"
        return str(value)

    return "'" + str(value).replace("'", "''") + "'"


def validate_dataframe(df, dataset_name):
    required = {"country", "year"}
    missing = required - set(df.columns)

    if missing:
        raise ValueError(
            f"{dataset_name} is missing required columns: {sorted(missing)}"
        )

    if len(df) != 300:
        raise ValueError(
            f"{dataset_name} should contain 300 rows but contains {len(df)}."
        )

    if df["country"].nunique() != 15:
        raise ValueError(
            f"{dataset_name} should contain 15 countries but contains "
            f"{df['country'].nunique()}."
        )

    if df["year"].nunique() != 20:
        raise ValueError(
            f"{dataset_name} should contain 20 years but contains "
            f"{df['year'].nunique()}."
        )

    if df["year"].min() != 2006 or df["year"].max() != 2025:
        raise ValueError(
            f"{dataset_name} must cover 2006-2025."
        )

    duplicates = df.duplicated(
        subset=["country", "year"]
    ).sum()

    if duplicates:
        raise ValueError(
            f"{dataset_name} contains {duplicates} duplicate country/year records."
        )

    missing_values = int(df.isna().sum().sum())

    if missing_values:
        raise ValueError(
            f"{dataset_name} contains {missing_values} missing values."
        )


def generate_country_id_map_sql():
    ...
    return """
CREATE TEMP TABLE import_country_map (
    country_name text PRIMARY KEY,
    country_id bigint NOT NULL
);

INSERT INTO import_country_map (country_name, country_id)
SELECT name, id
FROM public.countries
WHERE name IN (
    'Benin',
    'Burkina Faso',
    'Cabo Verde',
    'Côte d''Ivoire',
    'Gambia',
    'Ghana',
    'Guinea',
    'Guinea-Bissau',
    'Liberia',
    'Mali',
    'Niger',
    'Nigeria',
    'Senegal',
    'Sierra Leone',
    'Togo'
);

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM import_country_map) <> 15 THEN
        RAISE EXCEPTION 'Expected 15 countries in import_country_map.';
    END IF;
END $$;

"""


def generate_bulk_insert(
    table,
    columns,
    dataframe,
):
    value_rows = []

    for _, row in dataframe.iterrows():
        excel_country = row["country"]

        country_id = COUNTRY_MAP.get(excel_country)

        if country_id is None:
            raise ValueError(
                f"Country '{excel_country}' was not found in COUNTRY_MAP."
            )

        values = [
            str(country_id),
            sql_value(int(row["year"])),
        ]

        for column in columns[2:]:
            values.append(sql_value(row[column]))

        value_rows.append(
            "(" + ", ".join(values) + ")"
        )

    country_columns = ", ".join(columns)

    values_sql = ",\n".join(value_rows)

    update_columns = [
        column
        for column in columns
        if column not in ("country_id", "year")
    ]

    sql = f"""
INSERT INTO public.{table} ({country_columns})
VALUES
{values_sql}
ON CONFLICT (country_id, year) DO UPDATE SET
    {", ".join(
        f"{column} = EXCLUDED.{column}"
        for column in update_columns
    )};
"""

    return sql
def main():
    print("Checking source files...")

    if not INPUT_FILE.exists():
        raise FileNotFoundError(
            f"Agricultural Inputs file not found:\n{INPUT_FILE}"
        )

    if not LIVESTOCK_FILE.exists():
        raise FileNotFoundError(
            f"Livestock file not found:\n{LIVESTOCK_FILE}"
        )

    print("Reading Agricultural Inputs...")

    input_df = pd.read_excel(
        INPUT_FILE,
        sheet_name="Simulated_Input_Data"
    )

    print("Reading Livestock...")

    livestock_df = pd.read_excel(
        LIVESTOCK_FILE,
        sheet_name="Simulated_Livestock_Data"
    )

    print("Validating Agricultural Inputs...")

    validate_dataframe(
        input_df,
        "Agricultural Inputs"
    )

    print("Validating Livestock...")

    validate_dataframe(
        livestock_df,
        "Livestock"
    )

    print("Validating country mappings...")

    all_countries = set(input_df["country"].unique()) | set(
        livestock_df["country"].unique()
    )

    unmapped = [
        country
        for country in all_countries
        if country not in COUNTRY_MAP
    ]

    if unmapped:
        raise ValueError(
            f"Unmapped countries found: {unmapped}"
        )

    input_columns = [
        "country_id",
        "year",
        "cereal_seeds_tons",
        "fertilizer_tons",
        "pesticide_liters",
        "improved_seed_use_pct",
        "fertilizer_kg_per_ha",
        "input_price_index_2006_base",
        "agro_dealer_count",
        "input_subsidy_budget_usd",
        "distribution_timeliness_pct",
        "stockouts_days_per_year",
        "input_import_value_usd",
        "local_production_inputs_tons",
        "mechanization_units_per_1000_farms",
        "credit_access_pct",
    ]

    livestock_columns = [
        "country_id",
        "year",
        "cattle_head",
        "small_ruminants_head",
        "pigs_head",
        "poultry_head",
        "milk_production_tons",
        "meat_production_tons",
        "livestock_price_index_2006_base",
        "vaccination_coverage_pct",
        "fmd_incidents_count",
        "grazing_area_ha",
        "transhumance_events",
        "veterinary_facilities_count",
        "feed_imports_tons",
        "local_feed_production_tons",
        "livestock_exports_tons",
        "offtake_rate_pct",
    ]

    print("Generating bulk SQL...")

    sql = """-- ============================================================
-- ECOAGRIS ECOWAS DATA IMPORT
-- Generated from validated Excel datasets
-- ============================================================

BEGIN;

"""



    sql += """
-- ============================================================
-- Agricultural Inputs: 300 records
-- ============================================================

"""

    sql += generate_bulk_insert(
        "agricultural_inputs",
        input_columns,
        input_df
    )

    sql += """
-- ============================================================
-- Livestock: 300 records
-- ============================================================

"""

    sql += generate_bulk_insert(
        "livestock_data",
        livestock_columns,
        livestock_df
    )

    sql += """

COMMIT;
"""

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    OUTPUT.write_text(
        sql,
        encoding="utf-8"
    )

    print()
    print("=" * 60)
    print("BULK IMPORT SQL GENERATED SUCCESSFULLY")
    print("=" * 60)
    print(f"Output file: {OUTPUT}")
    print("Agricultural Input rows: 300")
    print("Livestock rows: 300")
    print("Total rows: 600")
    print("=" * 60)


if __name__ == "__main__":
    main()
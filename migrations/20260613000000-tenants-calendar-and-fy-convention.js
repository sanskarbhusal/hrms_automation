/**
 * Tenants — calendar_preference + fiscal_year_convention.
 *
 * Replaces the numeric `fiscal_year_start_month` knob (TINYINT 1-12) with a
 * named convention so the spec can express Nepal's FY (Shrawan 1 ≈ Jul 16)
 * which doesn't fit a "start month" alone, and to surface the calendar a
 * tenant prefers for DISPLAY (storage stays AD everywhere).
 *
 * The frontend `frontend/src/lib/calendar.ts` holds the canonical
 * (convention → start_month, start_day) lookup so all renderers agree.
 *
 * Backfill (no data loss):
 *   7  → NEPAL      (the demo tenant seed used this)
 *   4  → INDIA
 *   10 → US_FEDERAL
 *   *  → CALENDAR   (default — Jan 1)
 *
 * `calendar_preference` defaults to AD so existing tenants keep rendering
 * AD dates with no UI flicker. A tenant admin flips it in Settings → Company.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('tenants');

    if (!desc.calendar_preference) {
      await queryInterface.addColumn('tenants', 'calendar_preference', {
        type: Sequelize.ENUM('AD', 'BS'),
        allowNull: false,
        defaultValue: 'AD',
      });
    }

    if (!desc.fiscal_year_convention) {
      await queryInterface.addColumn('tenants', 'fiscal_year_convention', {
        type: Sequelize.ENUM('NEPAL', 'INDIA', 'US_FEDERAL', 'CALENDAR'),
        allowNull: false,
        defaultValue: 'CALENDAR',
      });
    }

    // Backfill from the old TINYINT (only if the source column still exists —
    // re-running the migration on a partially-applied DB is a no-op).
    if (desc.fiscal_year_start_month) {
      await queryInterface.sequelize.query(
        'UPDATE tenants SET fiscal_year_convention = CASE fiscal_year_start_month ' +
          "WHEN 7 THEN 'NEPAL' " +
          "WHEN 4 THEN 'INDIA' " +
          "WHEN 10 THEN 'US_FEDERAL' " +
          "ELSE 'CALENDAR' END"
      );
      await queryInterface.removeColumn('tenants', 'fiscal_year_start_month');
    }
  },

  async down(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('tenants');

    if (!desc.fiscal_year_start_month) {
      await queryInterface.addColumn('tenants', 'fiscal_year_start_month', {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      });
    }

    // Best-effort reverse-backfill (NEPAL → 7, INDIA → 4, US_FEDERAL → 10,
    // CALENDAR → 1). Loses the AD/BS calendar preference; that's expected on
    // a down migration.
    if (desc.fiscal_year_convention) {
      await queryInterface.sequelize.query(
        'UPDATE tenants SET fiscal_year_start_month = CASE fiscal_year_convention ' +
          "WHEN 'NEPAL' THEN 7 " +
          "WHEN 'INDIA' THEN 4 " +
          "WHEN 'US_FEDERAL' THEN 10 " +
          'ELSE 1 END'
      );
      await queryInterface.removeColumn('tenants', 'fiscal_year_convention');
    }

    if (desc.calendar_preference) {
      await queryInterface.removeColumn('tenants', 'calendar_preference');
    }
  },
};

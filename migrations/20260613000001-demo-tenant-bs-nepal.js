/**
 * Demo tenant — switch to BS + NEPAL FY.
 *
 * The previous migration (20260613000000) backfilled every tenant from the
 * old `fiscal_year_start_month` TINYINT — the demo tenant had `4` which
 * mapped to `INDIA`. The demo tenant is meant to showcase the Nepali HRM
 * defaults, so this one-off data migration retargets that single row to
 * `calendar_preference='BS'` + `fiscal_year_convention='NEPAL'`.
 *
 * Idempotent: the UPDATE matches `slug = 'demo'` exactly; running it again
 * sets the same values. Other tenants are untouched.
 *
 * NOT meant for follow-up "fix it across tenants" backfills — every other
 * tenant chose their convention at provisioning time (or via the Settings UI)
 * and we never overwrite that.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "UPDATE tenants SET calendar_preference = 'BS', fiscal_year_convention = 'NEPAL' WHERE slug = 'demo'"
    );
  },

  async down(queryInterface) {
    // Reverse to whatever 20260613000000 would have produced from the original
    // `fiscal_year_start_month = 4` — i.e. AD + INDIA.
    await queryInterface.sequelize.query(
      "UPDATE tenants SET calendar_preference = 'AD', fiscal_year_convention = 'INDIA' WHERE slug = 'demo'"
    );
  },
};

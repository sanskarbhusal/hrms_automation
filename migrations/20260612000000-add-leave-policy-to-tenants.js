/**
 * tenants.leave_policy — JSON column carrying the tenant-wide Leave policy
 * the admin sets in Settings → Leave. Shape:
 *
 *   { allow_half_day: bool, allow_full_day: bool, allow_wfh: bool }
 *
 * NULL is treated by the service as the defaults `{ true, true, false }` so
 * existing tenants keep working with Half + Full (WFH off) until an admin
 * opens the new tab. Same JSON pattern as `security_policy` / `smtp_config`
 * (see 20260603000000-add-settings-columns.js) — read through the
 * `jsonGetter` helper in `tenant.model.js` so mysql2 string round-trips
 * never leak to consumers.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('tenants');
    if (!desc.leave_policy) {
      await queryInterface.addColumn('tenants', 'leave_policy', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'leave_policy');
  },
};

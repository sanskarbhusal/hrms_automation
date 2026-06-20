/**
 * Add `show_dual_calendar` to the tenants table.
 *
 * Drives the dashboard calendar widget's "show both AD and BS dates in each
 * cell" toggle. Defaults to false so existing tenants get the same single-
 * calendar rendering they have today. Lives next to `calendar_preference`
 * as another tenant-level display knob.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'show_dual_calendar', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'show_dual_calendar');
  },
};

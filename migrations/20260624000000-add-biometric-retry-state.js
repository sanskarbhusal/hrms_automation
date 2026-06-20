/**
 * Phase 4 follow-up — bounded retry state on biometric_devices.
 *
 * `last_attempt_at`         — every poll attempt (success or fail) stamps this.
 *                             The pull worker uses it to space out retries
 *                             without touching `last_pulled_at` (which still
 *                             only advances on a successful poll, so it stays
 *                             a valid "log-cursor" timestamp for ingest).
 *
 * `consecutive_failures`    — counts back-to-back failed polls. Reset to 0 on
 *                             any successful poll. The worker uses it to
 *                             gate retry behaviour: < 3 → retry every minute;
 *                             >= 3 → wait the full interval before trying
 *                             again. Cheap counter; no separate state table.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('biometric_devices', 'last_attempt_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('biometric_devices', 'consecutive_failures', {
      type: Sequelize.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('biometric_devices', 'consecutive_failures');
    await queryInterface.removeColumn('biometric_devices', 'last_attempt_at');
  },
};

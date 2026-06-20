/**
 * AttendanceSync user-directory ingest follow-up (Phase 4).
 *
 *   biometric_device_users.removed_from_device_at  - DATETIME NULL
 *     Snapshot-absence marker. NULL = present on the device's latest roster.
 *     Non-NULL = absent from the most recent snapshot, stamped with the time we
 *     observed the absence. Reset to NULL when the user reappears in a later
 *     snapshot. Soft-delete is NOT used here — the row stays visible in admin
 *     views (we want "employee was enrolled here but isn't anymore" as a
 *     first-class state, not a recovered tombstone).
 *
 *   biometric_devices.last_user_sync_at           - DATETIME NULL
 *     Stamped on every successful /api/biometric/users push. Lets the UI show
 *     "User roster last synced N minutes ago" alongside the existing
 *     `last_seen_at` (which any sync — punches OR roster — also touches).
 *
 *   biometric_device_users.sync_source ENUM        - added 'attendance_sync'
 *     The third origin alongside 'pull' (zklib) and 'adms' (push handshake).
 *     The new endpoint stamps this value so diagnostics can tell where a
 *     given roster row came from without re-parsing raw_payload.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('biometric_device_users', 'removed_from_device_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('biometric_devices', 'last_user_sync_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('biometric_device_users', 'sync_source', {
      type: Sequelize.ENUM('pull', 'adms', 'attendance_sync'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('biometric_device_users', 'sync_source', {
      type: Sequelize.ENUM('pull', 'adms'),
      allowNull: true,
    });
    await queryInterface.removeColumn('biometric_devices', 'last_user_sync_at');
    await queryInterface.removeColumn('biometric_device_users', 'removed_from_device_at');
  },
};

/**
 * tenants.attendance_policy — JSON column carrying the tenant-wide
 * fallback attendance schedule the admin sets in Settings → Attendance.
 * Shape:
 *
 *   { start_time, end_time, break_minutes, grace_minutes_late,
 *     grace_minutes_early }
 *
 * Weekly off days are NOT stored here — they already live on
 * tenants.leave_policy.weekend_days. The synthesized fallback shift built
 * in shifts.resolveActiveShift reads both columns.
 *
 * NULL is treated by the DTO as the defaults `{ 09:00, 17:00, 60, 15, 0 }`
 * so existing tenants get a sane policy without an opt-in step. Same JSON
 * pattern as `leave_policy` / `security_policy` (see
 * 20260603000000-add-settings-columns.js and 20260612000000-add-leave-policy-to-tenants.js)
 * — read through the `jsonGetter` helper in `tenant.model.js` so mysql2
 * string round-trips never leak to consumers.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('tenants');
    if (!desc.attendance_policy) {
      await queryInterface.addColumn('tenants', 'attendance_policy', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'attendance_policy');
  },
};

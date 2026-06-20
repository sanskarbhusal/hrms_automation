const { standardColumns, addStandardIndexes } = require('../utils/migration');

/**
 * attendance_records — append-only daily attendance (implementation plan §3.x, §4.5).
 *
 * **EXEMPT from soft-delete** (§6.9). Corrections go through a
 * regularization request that patches the row in-place; the change is
 * captured in audit_logs (before/after). There is no DELETE route and no
 * `deleted_at` column.
 *
 * One row per (tenant, employee, date) — enforced by a plain unique index
 * (no Pattern A — soft-delete doesn't apply). Geo / BSSID columns store
 * what was captured at the punch for forensic review. The status is set
 * by the daily compute job (or inline by check-out).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance_records', {
      ...standardColumns(Sequelize),
      employee_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      shift_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'shifts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      check_in_at: { type: Sequelize.DATE, allowNull: true },
      check_in_source: {
        type: Sequelize.ENUM('web', 'mobile', 'manual', 'zkteco'),
        allowNull: true,
      },
      check_in_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      check_in_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      check_in_bssid: { type: Sequelize.STRING(17), allowNull: true },
      check_out_at: { type: Sequelize.DATE, allowNull: true },
      check_out_source: {
        type: Sequelize.ENUM('web', 'mobile', 'manual', 'zkteco'),
        allowNull: true,
      },
      check_out_lat: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      check_out_lng: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      check_out_bssid: { type: Sequelize.STRING(17), allowNull: true },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'day_off', 'insufficient'),
        allowNull: true,
      },
      work_minutes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      overtime_minutes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      note: { type: Sequelize.STRING(512), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
    });
    // No deleted_at index — this table is exempt.
    await addStandardIndexes(queryInterface, 'attendance_records', { softDelete: false });
    await queryInterface.addIndex('attendance_records', ['tenant_id', 'employee_id', 'date'], {
      unique: true,
      name: 'uq_attendance_records_tenant_employee_date',
    });
    await queryInterface.addIndex('attendance_records', ['tenant_id', 'date', 'status'], {
      name: 'ix_attendance_records_tenant_date_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attendance_records');
  },
};

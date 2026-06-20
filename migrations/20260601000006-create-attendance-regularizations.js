const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * attendance_regularizations — correction requests on attendance (implementation plan §4.5).
 *
 * An employee files a request; HR approves or rejects. On approval the
 * underlying attendance_records row is patched in-place (the audit row
 * carries the before/after — attendance_records itself remains
 * append-only). `attendance_record_id` is nullable for the case of
 * proposing a brand-new record (the day had no check-in at all).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'attendance_regularizations',
      Object.assign(
        standardColumns(Sequelize),
        {
          attendance_record_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'attendance_records', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          date: { type: Sequelize.DATEONLY, allowNull: false },
          reason: { type: Sequelize.STRING(512), allowNull: false },
          requested_status: {
            type: Sequelize.ENUM('present', 'absent', 'late', 'half_day', 'on_leave', 'holiday', 'day_off', 'insufficient'),
            allowNull: true,
          },
          requested_check_in_at: { type: Sequelize.DATE, allowNull: true },
          requested_check_out_at: { type: Sequelize.DATE, allowNull: true },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
          },
          decided_by_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          decided_at: { type: Sequelize.DATE, allowNull: true },
          decision_note: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'attendance_regularizations');
    await queryInterface.addIndex('attendance_regularizations', ['tenant_id', 'employee_id', 'date'], {
      name: 'ix_attendance_regularizations_tenant_employee_date',
    });
    await queryInterface.addIndex('attendance_regularizations', ['tenant_id', 'status'], {
      name: 'ix_attendance_regularizations_tenant_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attendance_regularizations');
  },
};

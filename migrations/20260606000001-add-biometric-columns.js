/**
 * Per the Phase 4 plan: `employees.biometric_pin` + Pattern A uniqueness so a
 * tenant cannot have two employees sharing the same device PIN, and
 * `attendance_records.device_id` so a reconciled record carries the device it
 * came from (pre-planned in §3.3).
 *
 * `employees` already carries the Pattern A `deleted_at_key` STORED generated
 * column (added when `employee_code` got its unique constraint). We reuse
 * that column here — only the unique index is new.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // employees.biometric_pin — re-runnable add (a previous failed migration
    // may have partially landed this column).
    const employeesDesc = await queryInterface.describeTable('employees');
    if (!employeesDesc.biometric_pin) {
      await queryInterface.addColumn('employees', 'biometric_pin', {
        type: Sequelize.STRING(20),
        allowNull: true,
      });
    }
    // Reuse the existing `deleted_at_key` STORED column on `employees`.
    const [existingIndexes] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `employees` WHERE Key_name = 'uq_employees_tenant_biometric_pin'"
    );
    if (!existingIndexes.length) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `employees` ' +
          'ADD UNIQUE INDEX `uq_employees_tenant_biometric_pin` ' +
          '(`tenant_id`, `biometric_pin`, `deleted_at_key`)'
      );
    }

    // attendance_records.device_id (FK to biometric_devices, nullable so the
    // historic web/manual rows stay valid).
    await queryInterface.addColumn('attendance_records', 'device_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'biometric_devices', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('attendance_records', 'device_id');
    await queryInterface.sequelize.query('ALTER TABLE `employees` DROP INDEX `uq_employees_tenant_biometric_pin`');
    await queryInterface.removeColumn('employees', 'biometric_pin');
  },
};

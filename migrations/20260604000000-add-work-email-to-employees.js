/**
 * Add `work_email` to the employees table.
 *
 * Used as the login email of the auto-provisioned user account that is created
 * alongside an employee. Nullable so historical rows (which were created before
 * this column existed) remain valid; new creates always provide it.
 *
 * Unique per tenant via Pattern A (§6.9) — we reuse the existing
 * `deleted_at_key` generated column (already added when `employee_code`'s
 * unique index was created) and add a second unique index on
 * (tenant_id, work_email, deleted_at_key). Soft-deleted rows free the slot.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'work_email', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
    await queryInterface.sequelize.query(
      'ALTER TABLE `employees` ADD UNIQUE INDEX `uq_employees_tenant_work_email` ' +
        '(`tenant_id`, `work_email`, `deleted_at_key`)'
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE `employees` DROP INDEX `uq_employees_tenant_work_email`');
    await queryInterface.removeColumn('employees', 'work_email');
  },
};

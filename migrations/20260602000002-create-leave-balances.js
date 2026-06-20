const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * leave_balances — per-employee per-leave-type per-year balance ledger
 * (implementation plan §4.6, Phase 3).
 *
 * One row per (employee, leave_type, year). `entitled_days` is set on creation
 * (from leave_type.accrual_days_per_year, prorated for mid-year hires by the
 * service). `consumed_days` ticks up when a leave request is approved, down on
 * cancellation. `carried_forward_days` is populated by the year-rollover job.
 * `adjusted_days` is the manual HR override (e.g. compensation, correction).
 *
 * Available = entitled + carried_forward + adjusted - consumed.
 *
 * Pattern A unique on (tenant, employee, leave_type, year) prevents duplicates
 * but allows a soft-deleted balance to be re-created.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'leave_balances',
      Object.assign(
        standardColumns(Sequelize),
        {
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          leave_type_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'leave_types', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          // Calendar year for v1 — fiscal-year support is a tenant setting and
          // lands when payroll arrives (Phase 5, §10 open decision).
          year: { type: Sequelize.INTEGER, allowNull: false },
          entitled_days: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
          carried_forward_days: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
          consumed_days: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
          adjusted_days: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
          notes: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'leave_balances');
    await queryInterface.addIndex('leave_balances', ['tenant_id', 'employee_id', 'year'], {
      name: 'ix_leave_balances_tenant_employee_year',
    });
    await addSoftDeleteUnique(
      queryInterface,
      'leave_balances',
      ['tenant_id', 'employee_id', 'leave_type_id', 'year'],
      'uq_leave_balances_tenant_emp_type_year'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('leave_balances');
  },
};

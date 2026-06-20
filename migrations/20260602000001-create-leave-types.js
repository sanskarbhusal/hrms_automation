const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * leave_types — leave catalog per tenant (implementation plan §4.6, Phase 3).
 *
 * `branch_id` is nullable: NULL = tenant-wide leave type (e.g. "Annual Leave"
 * for the whole company); non-NULL = branch-specific (e.g. a local statutory
 * holiday allowance). Pattern A unique covers `(tenant, code)` so a soft-
 * deleted code can be reused (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'leave_types',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(100), allowNull: false },
          code: { type: Sequelize.STRING(32), allowNull: false },
          description: { type: Sequelize.STRING(512), allowNull: true },
          is_paid: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          // Entitlement (per year). 0 = no fixed entitlement (e.g. unpaid leave).
          accrual_days_per_year: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
          max_carry_forward_days: { type: Sequelize.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
          // Smallest request unit. 0.5 = half-day allowed, 1 = whole days only.
          min_request_days: { type: Sequelize.DECIMAL(4, 2), allowNull: false, defaultValue: 1 },
          requires_attachment: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          // When non-null, attachment becomes mandatory if total_days > threshold
          // (e.g. sick leave > 2 days needs a medical certificate).
          requires_attachment_above_days: { type: Sequelize.INTEGER, allowNull: true },
          color: { type: Sequelize.STRING(16), allowNull: true },
          is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'leave_types');
    await addSoftDeleteUnique(queryInterface, 'leave_types', ['tenant_id', 'code'], 'uq_leave_types_tenant_code');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('leave_types');
  },
};

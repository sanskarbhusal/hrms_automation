const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * leave_requests — leave applications (implementation plan §4.6, Phase 3).
 *
 * Status flow: draft → pending → approved | rejected | cancelled | withdrawn.
 * `total_days` is computed by the service from start_date/end_date minus
 * weekly off + holidays (and divided by 2 if `is_half_day`). On approval the
 * service ticks `leave_balances.consumed_days`; on cancel/withdraw it ticks
 * back. `attachment_file_id` is a soft pointer (no FK yet — a central `files`
 * table is part of the still-pending cross-cutting work, see audit plan).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'leave_requests',
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
          start_date: { type: Sequelize.DATEONLY, allowNull: false },
          end_date: { type: Sequelize.DATEONLY, allowNull: false },
          total_days: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
          is_half_day: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          // Only meaningful when is_half_day = true (start_date == end_date).
          half_day_session: { type: Sequelize.ENUM('AM', 'PM'), allowNull: true },
          reason: { type: Sequelize.STRING(1024), allowNull: false },
          // Soft pointer until the central `files` table lands.
          attachment_file_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
          status: {
            type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled', 'withdrawn'),
            allowNull: false,
            defaultValue: 'pending',
          },
          // Final decision metadata. Per-step decisions live in
          // leave_approval_steps; these mirror the last step for fast filter.
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
    await addStandardIndexes(queryInterface, 'leave_requests');
    await queryInterface.addIndex('leave_requests', ['tenant_id', 'employee_id', 'status'], {
      name: 'ix_leave_requests_tenant_employee_status',
    });
    await queryInterface.addIndex('leave_requests', ['tenant_id', 'start_date', 'end_date'], {
      name: 'ix_leave_requests_tenant_date_range',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('leave_requests');
  },
};

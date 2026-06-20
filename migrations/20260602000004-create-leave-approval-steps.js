const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * leave_approval_steps — per-request multi-step approval audit
 * (implementation plan §3.0 exception list — id-only, no public_id; §4.6).
 *
 * A leave_request can require one or more approvers (e.g. reporting manager →
 * HR). The service materialises the steps when the request leaves `draft`.
 * Each step is decided independently; the request status flips to `approved`
 * when the last step approves, or `rejected` as soon as any step rejects.
 *
 * Not exposed via URL — owned by the parent request. No public_id, no soft
 * delete, no Pattern A unique. `tenant_id` is denormalised for fast
 * tenant-scoped audit queries; deletion cascades from the parent.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'leave_approval_steps',
      Object.assign(
        standardColumns(Sequelize, { publicId: false }),
        {
          leave_request_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'leave_requests', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          step_order: { type: Sequelize.INTEGER, allowNull: false },
          // Either a concrete approver (FK) OR a role placeholder ("reporting_manager",
          // "branch_admin", "hr") resolved at decision time. At least one is set.
          approver_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          approver_role: { type: Sequelize.STRING(64), allowNull: true },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected', 'skipped'),
            allowNull: false,
            defaultValue: 'pending',
          },
          decided_at: { type: Sequelize.DATE, allowNull: true },
          decided_by_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          decision_note: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'leave_approval_steps', { publicId: false, softDelete: false });
    await queryInterface.addIndex('leave_approval_steps', ['leave_request_id', 'step_order'], {
      name: 'ix_leave_approval_steps_request_order',
    });
    await queryInterface.addIndex('leave_approval_steps', ['tenant_id', 'status'], {
      name: 'ix_leave_approval_steps_tenant_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('leave_approval_steps');
  },
};

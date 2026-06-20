const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * support_tickets — the main ticket entity (Support Ticket System).
 *
 * Dual-ID, soft-delete. Branch-scoped (most tickets) or org-scoped.
 * Tickets can be forwarded from branch to organization level.
 * Grievance tickets have confidential + anonymous flags.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'support_tickets',
      Object.assign(
        standardColumns(Sequelize),
        {
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          assigned_to: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          parent_ticket_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'support_tickets', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          ticket_number: {
            type: Sequelize.STRING(20),
            allowNull: false,
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          category: {
            type: Sequelize.STRING(50),
            allowNull: false,
          },
          subcategory: {
            type: Sequelize.STRING(100),
            allowNull: true,
          },
          priority: {
            type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'medium',
          },
          status: {
            type: Sequelize.ENUM(
              'open',
              'in_progress',
              'waiting_for_employee',
              'resolved',
              'closed',
              'reopened',
              'forwarded'
            ),
            allowNull: false,
            defaultValue: 'open',
          },
          scope: {
            type: Sequelize.ENUM('branch', 'organization'),
            allowNull: false,
            defaultValue: 'branch',
          },
          confidential: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          anonymous: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          forwarded_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          forwarded_by: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
          },
          closed_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
        },
        auditColumns(Sequelize)
      )
    );

    await addStandardIndexes(queryInterface, 'support_tickets');

    await queryInterface.addIndex('support_tickets', ['tenant_id', 'branch_id', 'deleted_at'], {
      name: 'ix_support_tickets_tenant_branch_deleted',
    });
    await queryInterface.addIndex('support_tickets', ['tenant_id', 'scope', 'deleted_at'], {
      name: 'ix_support_tickets_tenant_scope_deleted',
    });
    await queryInterface.addIndex('support_tickets', ['tenant_id', 'status', 'deleted_at'], {
      name: 'ix_support_tickets_tenant_status_deleted',
    });
    await queryInterface.addIndex('support_tickets', ['tenant_id', 'employee_id', 'deleted_at'], {
      name: 'ix_support_tickets_tenant_employee_deleted',
    });

    // Pattern A — ticket_number is unique per tenant until soft-deleted.
    await addSoftDeleteUnique(
      queryInterface,
      'support_tickets',
      ['tenant_id', 'ticket_number'],
      'uq_support_tickets_tenant_ticket_number'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('support_tickets');
  },
};

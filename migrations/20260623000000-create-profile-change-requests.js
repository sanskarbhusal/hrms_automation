const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * Migration to create profile_change_requests table.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'profile_change_requests',
      Object.assign(
        standardColumns(Sequelize),
        {
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          field: {
            type: Sequelize.ENUM('legal_name', 'permanent_address', 'date_of_birth', 'marital_status', 'bank_account'),
            allowNull: false,
          },
          current_value: {
            type: Sequelize.JSON,
            allowNull: false,
          },
          proposed_value: {
            type: Sequelize.JSON,
            allowNull: false,
          },
          reason: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected', 'withdrawn'),
            allowNull: false,
            defaultValue: 'pending',
          },
          decided_by: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          decided_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          decision_note: {
            type: Sequelize.STRING(512),
            allowNull: true,
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'profile_change_requests');
    await queryInterface.addIndex('profile_change_requests', ['tenant_id', 'branch_id', 'status'], {
      name: 'ix_profile_change_requests_tenant_branch_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('profile_change_requests');
  },
};

const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'time_select_requests',
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
          request_mode: {
            type: Sequelize.ENUM('early_arrive', 'early_leave', 'late_leave'),
            allowNull: false,
          },
          start_date: { type: Sequelize.DATEONLY, allowNull: false },
          end_date: { type: Sequelize.DATEONLY, allowNull: false },
          reason: { type: Sequelize.TEXT, allowNull: false },
          attachment_url: { type: Sequelize.STRING(500), allowNull: true },
          status: {
            type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled', 'withdrawn'),
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
    await addStandardIndexes(queryInterface, 'time_select_requests');
    await queryInterface.addIndex('time_select_requests', ['tenant_id', 'employee_id', 'status'], {
      name: 'ix_time_select_requests_tenant_employee_status',
    });
    await queryInterface.addIndex('time_select_requests', ['tenant_id', 'start_date', 'end_date'], {
      name: 'ix_time_select_requests_tenant_date_range',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('time_select_requests');
  },
};

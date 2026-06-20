module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('asset_assignments', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      tenant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      asset_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      employee_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      assigned_at: { type: Sequelize.DATEONLY, allowNull: false },
      assigned_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      condition_at_assign: { type: Sequelize.TEXT, allowNull: true },
      returned_at: { type: Sequelize.DATEONLY, allowNull: true },
      condition_at_return: { type: Sequelize.TEXT, allowNull: true },
      return_note: { type: Sequelize.TEXT, allowNull: true },
      created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('asset_assignments', ['tenant_id', 'asset_id']);
    await queryInterface.addIndex('asset_assignments', ['tenant_id', 'employee_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('asset_assignments');
  },
};

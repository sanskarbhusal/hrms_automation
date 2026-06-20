const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'roles',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(80), allowNull: false },
          description: { type: Sequelize.STRING(255), allowNull: true },
          is_system: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'roles');
    await addSoftDeleteUnique(queryInterface, 'roles', ['tenant_id', 'name'], 'uq_roles_tenant_name');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};

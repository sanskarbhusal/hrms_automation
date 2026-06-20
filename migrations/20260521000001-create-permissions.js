const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'permissions',
      Object.assign(
        standardColumns(Sequelize, { tenantId: false }),
        {
          key: { type: Sequelize.STRING(80), allowNull: false },
          description: { type: Sequelize.STRING(255), allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'permissions', { tenantId: false, softDelete: false });
    await queryInterface.addIndex('permissions', ['key'], { unique: true, name: 'uq_permissions_key' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('permissions');
  },
};

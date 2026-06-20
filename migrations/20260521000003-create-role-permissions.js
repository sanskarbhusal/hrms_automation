const { standardColumns, auditColumns } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'role_permissions',
      Object.assign(
        standardColumns(Sequelize, { publicId: false, tenantId: false }),
        {
          role_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'roles', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          permission_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'permissions', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
      unique: true,
      name: 'uq_role_permissions_role_permission',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('role_permissions');
  },
};

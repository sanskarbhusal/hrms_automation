const { standardColumns, auditColumns } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'user_permission_overrides',
      Object.assign(
        standardColumns(Sequelize, { publicId: false, tenantId: false }),
        {
          user_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'users', key: 'id' },
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
          granted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await queryInterface.addIndex('user_permission_overrides', ['user_id', 'permission_id'], {
      unique: true,
      name: 'uq_user_permission_overrides_user_permission',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_permission_overrides');
  },
};

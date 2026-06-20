const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * designations — a job title within a department (implementation plan §3.2).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'designations',
      Object.assign(
        standardColumns(Sequelize),
        {
          department_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'departments', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          name: { type: Sequelize.STRING(150), allowNull: false },
          description: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'designations');
    await queryInterface.addIndex('designations', ['tenant_id', 'department_id'], {
      name: 'ix_designations_tenant_department',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('designations');
  },
};

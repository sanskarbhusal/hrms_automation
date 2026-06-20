const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'document_types',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(120), allowNull: false },
          code: { type: Sequelize.STRING(60), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          icon: { type: Sequelize.STRING(60), allowNull: true },
          is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'document_types');
    await addSoftDeleteUnique(queryInterface, 'document_types', ['tenant_id', 'code'], 'uq_doc_types_tenant_code');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('document_types');
  },
};

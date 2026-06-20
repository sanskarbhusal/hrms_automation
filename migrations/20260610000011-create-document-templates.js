const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'document_templates',
      Object.assign(
        standardColumns(Sequelize),
        {
          document_type_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
          name: { type: Sequelize.STRING(200), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          content_blocks: { type: Sequelize.JSON, allowNull: false, defaultValue: [] },
          page_format: {
            type: Sequelize.ENUM('A4', 'Letter'),
            allowNull: false,
            defaultValue: 'A4',
          },
          orientation: {
            type: Sequelize.ENUM('portrait', 'landscape'),
            allowNull: false,
            defaultValue: 'portrait',
          },
          margin_top: { type: Sequelize.DECIMAL(5, 1), allowNull: false, defaultValue: 20 },
          margin_right: { type: Sequelize.DECIMAL(5, 1), allowNull: false, defaultValue: 20 },
          margin_bottom: { type: Sequelize.DECIMAL(5, 1), allowNull: false, defaultValue: 20 },
          margin_left: { type: Sequelize.DECIMAL(5, 1), allowNull: false, defaultValue: 20 },
          page_numbering: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'document_templates');
    await queryInterface.addIndex('document_templates', ['tenant_id', 'document_type_id', 'deleted_at'], {
      name: 'ix_doc_templates_tenant_type_deleted',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('document_templates');
  },
};

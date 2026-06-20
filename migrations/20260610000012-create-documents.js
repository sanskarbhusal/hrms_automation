const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'documents',
      Object.assign(
        standardColumns(Sequelize),
        {
          document_template_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
          document_type_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
          employee_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
          title: { type: Sequelize.STRING(200), allowNull: false },
          recipient_name: { type: Sequelize.STRING(200), allowNull: false },
          recipient_email: { type: Sequelize.STRING(255), allowNull: true },
          merged_data: { type: Sequelize.JSON, allowNull: true },
          content_html: { type: Sequelize.TEXT('medium'), allowNull: true },
          file_url: { type: Sequelize.STRING(512), allowNull: true },
          status: {
            type: Sequelize.ENUM('draft', 'generated', 'sent', 'printed', 'archived'),
            allowNull: false,
            defaultValue: 'draft',
          },
          sent_at: { type: Sequelize.DATE, allowNull: true },
          sent_to: { type: Sequelize.STRING(255), allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'documents', { softDelete: false });
    await queryInterface.addIndex('documents', ['tenant_id', 'employee_id'], {
      name: 'ix_documents_tenant_employee',
    });
    await queryInterface.addIndex('documents', ['tenant_id', 'status'], {
      name: 'ix_documents_tenant_status',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents');
  },
};

/**
 * Add `document_type_id` to employee_documents — the optional link to the
 * tenant catalog (employee_document_type_definitions). Nullable so that
 * pre-existing free-text rows survive the migration; new uploads from the
 * Create wizard / Documents tab carry the catalog FK.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employee_documents', 'document_type_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'employee_document_type_definitions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await queryInterface.addIndex('employee_documents', ['tenant_id', 'employee_id', 'document_type_id'], {
      name: 'ix_employee_documents_tenant_emp_type',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('employee_documents', 'ix_employee_documents_tenant_emp_type');
    await queryInterface.removeColumn('employee_documents', 'document_type_id');
  },
};

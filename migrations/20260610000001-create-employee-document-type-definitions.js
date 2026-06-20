const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * employee_document_type_definitions — tenant-managed catalog of employee
 * document slots (PAN, SSF, academic certificates, work-experience letters…).
 * Mirrors `leave_types` (§3.4) as a tenant-scoped, soft-deletable catalog
 * with Pattern A uniqueness on (tenant_id, code) so a deleted code can be
 * reused later.
 *
 * `category` groups entries for the 3-step Employee Create wizard:
 *   basic       — slots surfaced on the basic-info step (PAN, SSF, etc.)
 *   academic    — wizard step 2
 *   experience  — wizard step 3
 *
 * `is_multiple` toggles between single-file (one PAN per employee) and
 * multi-file (many work-experience letters) slots — enforced in the
 * service layer.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employee_document_type_definitions',
      Object.assign(
        standardColumns(Sequelize),
        {
          code: { type: Sequelize.STRING(60), allowNull: false },
          title: { type: Sequelize.STRING(120), allowNull: false },
          category: {
            type: Sequelize.ENUM('basic', 'academic', 'experience'),
            allowNull: false,
            defaultValue: 'basic',
          },
          is_multiple: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          is_required: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          accept_mime: { type: Sequelize.STRING(255), allowNull: true },
          max_size_mb: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 15 },
          expiry_supported: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
          description: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_document_type_definitions');
    await addSoftDeleteUnique(
      queryInterface,
      'employee_document_type_definitions',
      ['tenant_id', 'code'],
      'uq_emp_doc_types_tenant_code'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_document_type_definitions');
  },
};

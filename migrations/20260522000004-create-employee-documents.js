const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * employee_documents — owned child of an employee (implementation plan §3.2).
 * Soft-deleted; cascade-soft-deleted with the parent employee (§6.9). `file_url`
 * is a storage URL supplied by the client — upload handling lands with the
 * `files` infrastructure in a later phase.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employee_documents',
      Object.assign(
        standardColumns(Sequelize),
        {
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          type: { type: Sequelize.STRING(60), allowNull: false },
          file_url: { type: Sequelize.STRING(512), allowNull: false },
          expires_at: { type: Sequelize.DATEONLY, allowNull: true },
          note: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_documents');
    await queryInterface.addIndex('employee_documents', ['tenant_id', 'employee_id'], {
      name: 'ix_employee_documents_tenant_employee',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_documents');
  },
};

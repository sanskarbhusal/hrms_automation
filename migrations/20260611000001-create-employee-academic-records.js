const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * employee_academic_records — owned child of an employee. Holds the
 * employee's education history: one row per degree / qualification, with
 * an optional attached document (degree certificate / transcript).
 *
 * Cascade-soft-deleted with the parent employee (§6.9 — same pattern as
 * employee_documents and employee_lifecycle_events).
 *
 * No business-key uniqueness — employees can hold multiple credentials
 * from the same institution.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employee_academic_records',
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
          degree: { type: Sequelize.STRING(160), allowNull: false },
          field_of_study: { type: Sequelize.STRING(160), allowNull: true },
          institution_name: { type: Sequelize.STRING(200), allowNull: false },
          // 4-digit calendar year. SMALLINT (unsigned) is more than enough.
          start_year: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          // NULL = ongoing (in-progress credential).
          end_year: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          grade: { type: Sequelize.STRING(60), allowNull: true },
          description: { type: Sequelize.STRING(1024), allowNull: true },
          // Optional URL written by the existing /v1/uploads/employee/:id/document
          // endpoint — same path the documents tab uses.
          attachment_file_url: { type: Sequelize.STRING(512), allowNull: true },
          sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_academic_records');
    await queryInterface.addIndex('employee_academic_records', ['tenant_id', 'employee_id'], {
      name: 'ix_employee_academic_records_tenant_employee',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_academic_records');
  },
};

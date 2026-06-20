const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * employee_work_experiences — owned child of an employee. Holds prior
 * employment history: one row per previous employer / role, with an
 * optional attached document (experience letter / reference letter).
 *
 * Cascade-soft-deleted with the parent employee (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employee_work_experiences',
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
          company_name: { type: Sequelize.STRING(200), allowNull: false },
          job_title: { type: Sequelize.STRING(150), allowNull: false },
          start_date: { type: Sequelize.DATEONLY, allowNull: false },
          // NULL only when the row records a current (still-employed) role —
          // unusual for prior experience, but allowed for symmetry.
          end_date: { type: Sequelize.DATEONLY, allowNull: true },
          location: { type: Sequelize.STRING(150), allowNull: true },
          description: { type: Sequelize.STRING(2048), allowNull: true },
          attachment_file_url: { type: Sequelize.STRING(512), allowNull: true },
          sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_work_experiences');
    await queryInterface.addIndex('employee_work_experiences', ['tenant_id', 'employee_id'], {
      name: 'ix_employee_work_experiences_tenant_employee',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_work_experiences');
  },
};

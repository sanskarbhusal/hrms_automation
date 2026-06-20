const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * job_requisitions — open roles a tenant is hiring for (implementation plan §3.10, §4.18).
 *
 * Owns the requisition lifecycle (draft → open → on_hold ⇄ open → closed/filled).
 * Branch/department/designation are required references for an opened
 * requisition; the hiring manager points to an employee. No business-key
 * uniqueness — a tenant may run several concurrent reqs for the same
 * designation.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'job_requisitions',
      Object.assign(
        standardColumns(Sequelize),
        {
          title: { type: Sequelize.STRING(200), allowNull: false },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          department_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'departments', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          designation_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'designations', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          hiring_manager_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          employment_type: {
            type: Sequelize.ENUM('full_time', 'part_time', 'contract', 'intern'),
            allowNull: false,
            defaultValue: 'full_time',
          },
          headcount: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
          status: {
            type: Sequelize.ENUM('draft', 'open', 'on_hold', 'closed', 'filled'),
            allowNull: false,
            defaultValue: 'draft',
          },
          description: { type: Sequelize.TEXT, allowNull: true },
          requirements: { type: Sequelize.TEXT, allowNull: true },
          opened_at: { type: Sequelize.DATE, allowNull: true },
          closes_at: { type: Sequelize.DATE, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'job_requisitions');
    await queryInterface.addIndex('job_requisitions', ['tenant_id', 'status'], {
      name: 'ix_job_requisitions_tenant_status',
    });
    await queryInterface.addIndex('job_requisitions', ['tenant_id', 'department_id'], {
      name: 'ix_job_requisitions_tenant_department',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_requisitions');
  },
};

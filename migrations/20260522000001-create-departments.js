const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * departments — belong to a branch, or company-wide when `branch_id` is null
 * (implementation plan §3.2). `head_employee_id` is added as a plain nullable
 * column here; its FK to `employees` is added later (20260522000005) once the
 * employees table exists.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'departments',
      Object.assign(
        standardColumns(Sequelize),
        {
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          // FK to employees added in 20260522000005-add-org-foreign-keys.
          head_employee_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
          name: { type: Sequelize.STRING(150), allowNull: false },
          description: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'departments');
    await queryInterface.addIndex('departments', ['tenant_id', 'branch_id'], {
      name: 'ix_departments_tenant_branch',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('departments');
  },
};

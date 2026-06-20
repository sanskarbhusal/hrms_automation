module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add column as nullable first to prevent failures on tables with existing rows
    await queryInterface.addColumn('time_select_requests', 'branch_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'branches', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    // 2. Populate branch_id from the linked employee
    await queryInterface.sequelize.query(`
      UPDATE time_select_requests ts
      JOIN employees e ON ts.employee_id = e.id
      SET ts.branch_id = e.branch_id
      WHERE ts.branch_id IS NULL;
    `);

    // 3. Fallback: if any employee has no branch assigned, use branch 1 (which is seeded)
    await queryInterface.sequelize.query(`
      UPDATE time_select_requests
      SET branch_id = 1
      WHERE branch_id IS NULL;
    `);

    // 4. Change the column to NOT NULL
    await queryInterface.changeColumn('time_select_requests', 'branch_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });

    // 5. Add composite index for performance
    await queryInterface.addIndex('time_select_requests', ['tenant_id', 'branch_id'], {
      name: 'idx_time_select_requests_tenant_branch',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('time_select_requests', 'idx_time_select_requests_tenant_branch');
    await queryInterface.removeColumn('time_select_requests', 'branch_id');
  },
};

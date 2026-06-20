module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('agents');
    if (tableDesc.branch_id) return;

    await queryInterface.addColumn('agents', 'branch_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
    });

    // Pick the first branch per tenant so existing agents get a real branch.
    await queryInterface.sequelize.query(
      'UPDATE agents a JOIN (SELECT tenant_id, MIN(id) AS bid FROM branches GROUP BY tenant_id) b ON b.tenant_id = a.tenant_id SET a.branch_id = b.bid WHERE a.branch_id IS NULL'
    );

    await queryInterface.changeColumn('agents', 'branch_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'branches', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addIndex('agents', ['tenant_id', 'branch_id'], {
      name: 'ix_agents_tenant_branch',
    });
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('agents');
    if (!tableDesc.branch_id) return;
    await queryInterface.removeIndex('agents', 'ix_agents_tenant_branch');
    await queryInterface.removeColumn('agents', 'branch_id');
  },
};

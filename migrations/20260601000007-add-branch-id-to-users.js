/**
 * Add `branch_id` to the `users` table.
 *
 * NULL = org-wide (tenant Admin, HR, Employee — visibility spans the whole
 * tenant). Non-NULL = scoped to that branch — used by the BranchAdmin role
 * and any tenant-defined role the org admin wants to scope. Service-layer
 * policies (BaseRepository.branchWhere) enforce read scoping; write paths
 * force `branch_id = req.user.branch_id` for scoped actors.
 *
 * See IMPLEMENTATION.md §2.2 line 79 — "policies answer 'to whose data?'".
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'branch_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'branches', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
    await queryInterface.addIndex('users', ['tenant_id', 'branch_id'], {
      name: 'idx_users_tenant_branch',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', 'idx_users_tenant_branch');
    await queryInterface.removeColumn('users', 'branch_id');
  },
};

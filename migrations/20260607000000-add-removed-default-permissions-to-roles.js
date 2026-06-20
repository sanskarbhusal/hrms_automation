/**
 * roles.removed_default_permissions — JSON array of permission keys an admin
 * has explicitly removed from a system role.
 *
 * Sync-permissions tops up missing SYSTEM_ROLES defaults on each run; without
 * this column an admin who unchecked `user.delete` from HR would see it
 * silently re-added on the next sync. With the column, the sync script skips
 * any default key listed here, so intentional removals stick. Only meaningful
 * when `roles.is_system = true`; custom roles ignore it.
 *
 * NULL or [] = "nothing removed" (the default and the most common case).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'removed_default_permissions', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('roles', 'removed_default_permissions');
  },
};

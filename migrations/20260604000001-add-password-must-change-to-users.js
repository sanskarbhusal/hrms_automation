/**
 * Add `password_must_change` to the users table.
 *
 * Set to TRUE by the auto-provisioning flow when an employee is created with
 * a system-generated temporary password (which is emailed to them). The login
 * response carries the flag so the frontend can route the user to the
 * change-password screen, and a server-side middleware
 * (`requirePasswordReady`) 403s every protected request other than the
 * change-password / logout / refresh / me allowlist until the flag clears.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'password_must_change', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'password_must_change');
  },
};

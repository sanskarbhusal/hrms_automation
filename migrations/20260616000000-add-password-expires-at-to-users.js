/**
 * Add `password_expires_at` to the users table.
 *
 * Populated to NOW() + INVITATION_EXPIRY_HOURS by the auto-provisioning flow
 * (employees.service -> users.service.provisionEmployeeUser) and by the
 * resend-invitation flow. Cleared on successful first-time password change.
 * Pairs with the existing `password_must_change` flag: only meaningful while
 * that flag is true. Login refuses any user whose temp password has expired.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'password_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'password_expires_at');
  },
};

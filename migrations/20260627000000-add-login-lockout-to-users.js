/**
 * Login lockout — per-account brute-force protection (Phase 9.1 §1.3).
 *
 *   failed_login_attempts INT NOT NULL DEFAULT 0
 *     Sequential failed-password count for the account. Incremented on every
 *     wrong password; reset to 0 on a successful login (post-2FA if 2FA is on).
 *
 *   locked_until DATETIME NULL
 *     When non-NULL and in the future, login refuses with the same generic
 *     "Incorrect email or password" message (no enumeration — CLAUDE.md
 *     guardrail). Set when `failed_login_attempts` reaches the configured
 *     threshold; cleared on the next successful login.
 *
 * Threshold + lockout duration are configurable per-tenant via
 * `tenants.security_policy.login_lockout` (defaults: 5 attempts → 15 min lock).
 * The superadmin login (no tenant) uses the bare defaults.
 *
 * Both columns sit on the existing `users` table — no soft-delete required.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'failed_login_attempts', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('users', 'locked_until', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'locked_until');
    await queryInterface.removeColumn('users', 'failed_login_attempts');
  },
};

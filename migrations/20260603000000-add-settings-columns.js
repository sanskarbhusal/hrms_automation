/**
 * Settings columns — tenant branding/security/SMTP + per-user 2FA.
 *
 * Tenant columns (all NULL = "no override"):
 *   - primary_color           - 7-char hex (e.g. #1f3a8a) for branded theming.
 *   - security_policy         - JSON: password rules, session timeout, IP
 *                               allowlist, require_2fa flag.
 *   - smtp_config             - JSON: { host, port, secure, username,
 *                               from_email, from_name }. The password is NOT
 *                               here — it lives in the three cipher columns
 *                               below so it can never accidentally leak into a
 *                               JSON dump, log line, or DTO.
 *   - smtp_password_cipher    - AES-256-GCM ciphertext (binary).
 *   - smtp_password_iv        - AES-256-GCM IV (12 bytes, stored as 16 for
 *                               headroom).
 *   - smtp_password_tag       - AES-256-GCM auth tag (16 bytes).
 *
 * User columns (per-user TOTP):
 *   - two_factor_secret       - base32 TOTP secret. Treat like a password —
 *                               never logged, never in a DTO.
 *   - two_factor_enabled_at   - non-NULL means TOTP is active for the account.
 *
 * See `backend/src/utils/secretCipher.js` for the encryption helper and the
 * "Never leak secrets" guardrail in CLAUDE.md.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tenants', 'primary_color', {
      type: Sequelize.STRING(7),
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'security_policy', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'smtp_config', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'smtp_password_cipher', {
      type: 'VARBINARY(512)',
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'smtp_password_iv', {
      type: 'VARBINARY(16)',
      allowNull: true,
    });
    await queryInterface.addColumn('tenants', 'smtp_password_tag', {
      type: 'VARBINARY(16)',
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'two_factor_secret', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'two_factor_enabled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'two_factor_enabled_at');
    await queryInterface.removeColumn('users', 'two_factor_secret');
    await queryInterface.removeColumn('tenants', 'smtp_password_tag');
    await queryInterface.removeColumn('tenants', 'smtp_password_iv');
    await queryInterface.removeColumn('tenants', 'smtp_password_cipher');
    await queryInterface.removeColumn('tenants', 'smtp_config');
    await queryInterface.removeColumn('tenants', 'security_policy');
    await queryInterface.removeColumn('tenants', 'primary_color');
  },
};

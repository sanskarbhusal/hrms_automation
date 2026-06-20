const uuid = require('../utils/uuid');
const password = require('../utils/password');
const config = require('../config/config');

/**
 * Seed the single platform superadmin (implementation plan §2.1 — the
 * cross-tenant operator who provisions tenants).
 *
 * The superadmin is an ordinary `users` row distinguished only by
 * `is_superadmin = true`, with `tenant_id = NULL` and `role_id = NULL`
 * (it belongs to no tenant and holds no tenant-scoped role). Credentials come
 * from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD (config/config.js).
 *
 * Idempotent: skips entirely if any superadmin already exists, so `db:seed`
 * is safe to re-run. The NULL `tenant_id` means the (tenant_id, email) unique
 * index does not enforce superadmin email uniqueness, so this app-level guard
 * is the only thing keeping a second superadmin from being seeded.
 */
module.exports = {
  async up(queryInterface) {
    const [existing] = await queryInterface.sequelize.query('SELECT id FROM users WHERE is_superadmin = true LIMIT 1');
    if (existing.length > 0) {
      return;
    }

    const seed = config.seed || {};
    const now = new Date();
    await queryInterface.bulkInsert('users', [
      {
        public_id: uuid.newBuffer(),
        tenant_id: null,
        role_id: null,
        is_superadmin: true,
        name: 'Platform Superadmin',
        email: String(seed.superadminEmail).trim().toLowerCase(),
        password_hash: await password.hash(seed.superadminPassword),
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { is_superadmin: true }, {});
  },
};

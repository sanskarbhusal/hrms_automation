const { SYSTEM_ROLES, PERMISSIONS } = require('../config/permissions');
const uuid = require('../utils/uuid');
const password = require('../utils/password');
const config = require('../config/config');

/**
 * Seed a demo tenant with its system roles, role-permission grants and an admin
 * user. This is the Phase 0 deliverable's starting point: an empty tenant exists
 * and a superadmin can log in. Run after the permissions seeder.
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const seed = config.seed || {};

    // 1. Demo tenant (id 1).
    await queryInterface.bulkInsert('tenants', [
      {
        id: 1,
        public_id: uuid.newBuffer(),
        name: 'Demo Company',
        slug: 'demo',
        subscription_plan: 'trial',
        trial_duration_months: 1,
        status: 'active',
        timezone: 'Asia/Kathmandu',
        currency: 'NPR',
        calendar_preference: 'BS',
        fiscal_year_convention: 'NEPAL',
        soft_delete_retention_days: 180,
        created_at: now,
        updated_at: now,
      },
    ]);

    // 2. System roles for the tenant (ids 1..N in SYSTEM_ROLES order).
    const roleNames = Object.keys(SYSTEM_ROLES);
    const roleRows = roleNames.map((name, i) => ({
      id: i + 1,
      public_id: uuid.newBuffer(),
      tenant_id: 1,
      name,
      description: SYSTEM_ROLES[name].description,
      is_system: true,
      created_at: now,
      updated_at: now,
    }));
    await queryInterface.bulkInsert('roles', roleRows);

    const roleIdByName = {};
    roleNames.forEach((name, i) => {
      roleIdByName[name] = i + 1;
    });
    const permIdByKey = {};
    PERMISSIONS.forEach((p, i) => {
      permIdByKey[p.key] = i + 1;
    });

    // 3. role_permissions grants.
    const rolePerms = [];
    let rpId = 1;
    roleNames.forEach((name) => {
      SYSTEM_ROLES[name].permissions.forEach((key) => {
        rolePerms.push({
          id: rpId,
          role_id: roleIdByName[name],
          permission_id: permIdByKey[key],
          created_at: now,
          updated_at: now,
        });
        rpId += 1;
      });
    });
    if (rolePerms.length > 0) {
      await queryInterface.bulkInsert('role_permissions', rolePerms);
    }

    // 4. Admin user (id 1).
    const adminEmail = String(seed.adminEmail || 'admin@demo.test').toLowerCase();
    const adminPassword = seed.adminPassword || 'Admin@123';
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        public_id: uuid.newBuffer(),
        tenant_id: 1,
        role_id: roleIdByName.Admin,
        name: 'Demo Admin',
        email: adminEmail,
        password_hash: await password.hash(adminPassword),
        status: 'active',
        is_email_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { tenant_id: 1 }, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('roles', { tenant_id: 1 }, {});
    await queryInterface.bulkDelete('tenants', { id: 1 }, {});
  },
};

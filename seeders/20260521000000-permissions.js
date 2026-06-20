const { PERMISSIONS } = require('../config/permissions');
const uuid = require('../utils/uuid');

/**
 * Seed the global permission catalog. Ids are assigned 1..N in PERMISSIONS
 * order so the demo-tenant seeder can map permission keys to ids deterministically.
 */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const rows = PERMISSIONS.map((p, i) => ({
      id: i + 1,
      public_id: uuid.newBuffer(),
      key: p.key,
      description: p.description,
      created_at: now,
      updated_at: now,
    }));
    await queryInterface.bulkInsert('permissions', rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permissions', null, {});
  },
};

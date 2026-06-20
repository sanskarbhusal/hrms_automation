const crypto = require('crypto');
const uuid = require('../utils/uuid');

const PREFIX = 'ask_';

/**
 * Generate an agent key deterministically for the seed so the plaintext key is
 * known and can be used immediately in the CLI.
 */
function generateSeedKey() {
  // Deterministic 32-byte seed so repeated runs produce the same key.
  const seed = Buffer.alloc(32, 'demo-agent-seed-2026');
  const keyBytes = crypto.createHash('sha256').update(seed).digest();
  const rawKey = PREFIX + keyBytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const hint = rawKey.slice(0, 7);
  return { rawKey, hash, hint };
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const { rawKey, hash, hint } = generateSeedKey();

    // Ensure a demo branch exists for the agent.
    const [branches] = await queryInterface.sequelize.query(
      'SELECT id FROM `branches` WHERE `tenant_id` = 1 ORDER BY `id` ASC LIMIT 1'
    );
    let branchId;
    if (branches && branches.length > 0 && branches[0].id) {
      branchId = branches[0].id;
    } else {
      await queryInterface.bulkInsert('branches', [
        {
          id: 1,
          public_id: uuid.newBuffer(),
          tenant_id: 1,
          name: 'Main Branch',
          code: 'MAIN',
          created_by: 1,
          updated_by: 1,
          created_at: now,
          updated_at: now,
        },
      ]);
      branchId = 1;
    }

    await queryInterface.bulkInsert('agents', [
      {
        id: 1,
        public_id: uuid.newBuffer(),
        tenant_id: 1,
        name: 'Demo Agent',
        agent_key_hash: hash,
        agent_key_hint: hint,
        branch_id: branchId,
        status: 'offline',
        last_seen_at: null,
        last_ip: null,
        created_by: 1,
        updated_by: 1,
        created_at: now,
        updated_at: now,
      },
    ]);

    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('╔══════════════════════════════════════════════════════════╗');
    // eslint-disable-next-line no-console
    console.log('║          Demo Agent seeded — use this key:              ║');
    // eslint-disable-next-line no-console
    console.log('║                                                        ║');
    // eslint-disable-next-line no-console
    console.log(`║  ${rawKey}  ║`);
    // eslint-disable-next-line no-console
    console.log('║                                                        ║');
    // eslint-disable-next-line no-console
    console.log('║  attendance-sync agent configure \\                      ║');
    // eslint-disable-next-line no-console
    console.log('║    --agent-key <above> \\                                ║');
    // eslint-disable-next-line no-console
    console.log(`║    --ws-url ws://localhost:3000/ws/agent                   ║`);
    // eslint-disable-next-line no-console
    console.log('╚══════════════════════════════════════════════════════════╝');
    // eslint-disable-next-line no-console
    console.log('');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('agents', { tenant_id: 1 }, {});
  },
};

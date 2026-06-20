const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * notices — tenant-wide announcement board (implementation plan §3.7, §4.13).
 *
 * Notices live at the tenant scope (no branch_id column — branch is a
 * targeting dimension, not row ownership). Audience is a combination of
 * `audience` (the type — all/branch/department/role/specific) and
 * `audience_ids` (a JSON array of internal BIGINTs for that type). Visibility
 * is computed at read time by the service layer; BranchAdmin write-force
 * ensures a scoped author can only target entities inside their own branch.
 *
 * Acknowledgements live in the sibling `notice_acknowledgements` table —
 * only `priority IN ('high','urgent')` notices accept acks (the "important"
 * tier the spec mentions for read receipts).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'notices',
      Object.assign(
        standardColumns(Sequelize),
        {
          title: { type: Sequelize.STRING(200), allowNull: false },
          body: { type: Sequelize.TEXT('medium'), allowNull: false },
          audience: {
            type: Sequelize.ENUM('all', 'branch', 'department', 'role', 'specific'),
            allowNull: false,
            defaultValue: 'all',
          },
          // Array of internal BIGINTs of the target entities (branches /
          // departments / roles / employees, depending on `audience`).
          // Empty array when `audience='all'`.
          audience_ids: { type: Sequelize.JSON, allowNull: false },
          priority: {
            type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'normal',
          },
          publish_at: { type: Sequelize.DATE, allowNull: false },
          expires_at: { type: Sequelize.DATE, allowNull: true },
          // Array of { name, url, size, mime } — no dedicated upload endpoint
          // in this phase, the frontend supplies the URLs.
          attachments: { type: Sequelize.JSON, allowNull: false },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'notices');
    await queryInterface.addIndex('notices', ['tenant_id', 'publish_at'], {
      name: 'ix_notices_tenant_publish',
    });
    await queryInterface.addIndex('notices', ['tenant_id', 'expires_at'], {
      name: 'ix_notices_tenant_expires',
    });
    await queryInterface.addIndex('notices', ['tenant_id', 'audience'], {
      name: 'ix_notices_tenant_audience',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notices');
  },
};

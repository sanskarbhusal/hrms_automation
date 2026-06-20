const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * broadcasts — SuperAdmin platform-wide announcement history.
 *
 * Cross-tenant (no `tenant_id` — broadcasts belong to the platform operator,
 * not a tenant), soft-deletable so a mis-sent broadcast can be hidden from
 * the history without breaking the linked delivery rows.
 *
 * `parent_broadcast_id` is set when the row is a re-send of an earlier
 * broadcast; the original send keeps its deliveries intact and the resend is
 * its own historical record. Stats columns (`queued_count`, …) snapshot the
 * fan-out result so the history list doesn't have to aggregate every render.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'broadcasts',
      Object.assign(
        // Platform-level table: no tenant_id.
        standardColumns(Sequelize, { tenantId: false }),
        {
          subject: { type: Sequelize.STRING(200), allowNull: false },
          body: { type: Sequelize.TEXT('medium'), allowNull: false },
          scope: {
            type: Sequelize.ENUM('all', 'active', 'tenant_ids'),
            allowNull: false,
          },
          priority: {
            type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
            allowNull: false,
            defaultValue: 'normal',
          },
          post_notice: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          send_email: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          // Snapshot stats — kept in-row so listing the history doesn't need
          // a COUNT(*) join on broadcast_deliveries every page.
          queued_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          notices_posted_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          emails_sent_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          skipped_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          parent_broadcast_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'broadcasts', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        },
        auditColumns(Sequelize)
      )
    );
    // Platform-level table — skip the (tenant_id, deleted_at) composite, but
    // do add the unique public_id index.
    await addStandardIndexes(queryInterface, 'broadcasts', { tenantId: false });
    // Sort key for the history listing.
    await queryInterface.addIndex('broadcasts', ['created_at'], {
      name: 'ix_broadcasts_created_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('broadcasts');
  },
};

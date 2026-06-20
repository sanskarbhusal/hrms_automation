/**
 * broadcast_deliveries — one row per (broadcast × tenant). Enables the
 * SuperAdmin to see which tenants got which channel and to re-send to the
 * skipped tenants once their SMTP is fixed.
 *
 * Internal join table (implementation plan §3.0): no public_id, no
 * soft-delete. tenant_id is a hard FK; broadcast_id is a hard FK with
 * CASCADE so removing a broadcast (via its eventual purge job) takes its
 * deliveries with it.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('broadcast_deliveries', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      broadcast_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'broadcasts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tenant_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notice_posted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      email_sent: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      // Comma-joined channel failures: 'no_admin_user', 'smtp_not_configured',
      // 'send_failed', 'notice_failed' or NULL when at least one channel
      // succeeded.
      skipped_reason: { type: Sequelize.STRING(120), allowNull: true },
      delivered_at: { type: Sequelize.DATE, allowNull: false },
    });
    // One delivery row per broadcast × tenant. Mid-air repeats from the
    // worker pool are blocked by the unique index.
    await queryInterface.addIndex('broadcast_deliveries', ['broadcast_id', 'tenant_id'], {
      unique: true,
      name: 'uq_broadcast_deliveries_broadcast_tenant',
    });
    await queryInterface.addIndex('broadcast_deliveries', ['tenant_id'], {
      name: 'ix_broadcast_deliveries_tenant',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('broadcast_deliveries');
  },
};

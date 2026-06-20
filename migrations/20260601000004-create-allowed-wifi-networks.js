const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * allowed_wifi_networks — BSSIDs accepted for web check-in (implementation plan §3.x, §4.5).
 *
 * Companion of work_locations: a branch can require both (or either or
 * neither) to be configured for a check-in. The Pattern A unique covers
 * (tenant, branch, bssid) so a stale entry can be soft-deleted and the
 * same BSSID re-registered later (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'allowed_wifi_networks',
      Object.assign(
        standardColumns(Sequelize),
        {
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          ssid: { type: Sequelize.STRING(64), allowNull: true },
          bssid: { type: Sequelize.STRING(17), allowNull: false },
          note: { type: Sequelize.STRING(255), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'allowed_wifi_networks');
    await addSoftDeleteUnique(
      queryInterface,
      'allowed_wifi_networks',
      ['tenant_id', 'branch_id', 'bssid'],
      'uq_allowed_wifi_networks_tenant_branch_bssid'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('allowed_wifi_networks');
  },
};

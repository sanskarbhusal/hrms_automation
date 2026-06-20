const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * event_sync_runs — append-only log of recurring-events cron runs
 * (implementation plan §4.14, §6.9 soft-delete-exempt).
 *
 * One row per tenant per materialiser run. No soft-delete (append-only log,
 * same lifecycle convention as audit_logs / biometric_raw_logs). Keeps the
 * standard public_id so the run is UUID-addressable on the wire.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'event_sync_runs',
      Object.assign(
        standardColumns(Sequelize),
        {
          started_at: { type: Sequelize.DATE, allowNull: false },
          finished_at: { type: Sequelize.DATE, allowNull: true },
          status: { type: Sequelize.ENUM('success', 'failed'), allowNull: false },
          // `trigger_source` avoids the MySQL reserved word `trigger`.
          trigger_source: {
            type: Sequelize.ENUM('scheduled', 'manual', 'cli'),
            allowNull: false,
            defaultValue: 'scheduled',
          },
          created_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          window_start: { type: Sequelize.DATEONLY, allowNull: true },
          window_end: { type: Sequelize.DATEONLY, allowNull: true },
          months_ahead: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          triggered_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
          error: { type: Sequelize.TEXT, allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    // Append-only: no tenant+deleted_at index (softDelete:false skips it); keeps
    // the public_id unique index.
    await addStandardIndexes(queryInterface, 'event_sync_runs', { softDelete: false });
    // "Latest run first" history query, per tenant.
    await queryInterface.addIndex('event_sync_runs', ['tenant_id', 'started_at'], {
      name: 'ix_event_sync_runs_tenant_started',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('event_sync_runs');
  },
};

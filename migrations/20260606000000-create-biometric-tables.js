const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * Biometric devices + raw push/pull ingest + server→device command queue
 * (implementation plan §3.3 + Phase 4 §8). Three tables:
 *
 *   biometric_devices         — tenant + branch scoped, soft-deletable, dual-ID.
 *   biometric_raw_logs        — append-only ingest; exempt from soft-delete (§6.9).
 *   biometric_device_commands — internal queue server→device; exempt from soft-delete.
 *
 * Logs and the command queue are internal — no `public_id`, no `deleted_at`,
 * `id` only (joins the §3.0 / §6.9 exemption lists alongside `tokens`,
 * `two_factor_recovery_codes`).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── biometric_devices ──────────────────────────────────────────────────
    await queryInterface.createTable(
      'biometric_devices',
      Object.assign(
        standardColumns(Sequelize),
        {
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          serial_number: { type: Sequelize.STRING(64), allowNull: false },
          name: { type: Sequelize.STRING(120), allowNull: false },
          mode: {
            type: Sequelize.ENUM('push', 'pull'),
            allowNull: false,
            defaultValue: 'push',
          },
          ip: { type: Sequelize.STRING(45), allowNull: true },
          port: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true, defaultValue: 4370 },
          pull_interval_minutes: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          last_seen_at: { type: Sequelize.DATE, allowNull: true },
          last_pulled_at: { type: Sequelize.DATE, allowNull: true },
          status: {
            type: Sequelize.ENUM('active', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
          },
          // bcrypt hash of the optional shared secret the device echoes back
          // on every ADMS request (push mode). NULL = secret-less.
          shared_secret_hash: { type: Sequelize.STRING(255), allowNull: true },
          // node-zklib's pull-mode comm-key. Numeric, optional.
          comm_key: { type: Sequelize.INTEGER, allowNull: true },
          firmware: { type: Sequelize.STRING(64), allowNull: true },
          note: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'biometric_devices');
    await queryInterface.addIndex('biometric_devices', ['tenant_id', 'branch_id'], {
      name: 'ix_biometric_devices_tenant_branch',
    });
    // A serial number is unique per tenant (a device belongs to exactly one
    // branch within a tenant); Pattern A so a soft-deleted device frees the
    // slot for re-registration.
    await addSoftDeleteUnique(
      queryInterface,
      'biometric_devices',
      ['tenant_id', 'serial_number'],
      'uq_biometric_devices_tenant_serial'
    );

    // ── biometric_raw_logs ─────────────────────────────────────────────────
    // Internal: no public_id, no soft-delete. Tenant-scoped for read isolation.
    await queryInterface.createTable('biometric_raw_logs', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      device_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'biometric_devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      // The device-side "PIN" (user id on the terminal). NOT a login PIN.
      device_user_id: { type: Sequelize.STRING(20), allowNull: false },
      // Resolved from `employees.biometric_pin` at ingest. NULL when the
      // device fires a punch for an unmapped employee — the row still lands
      // so reconciliation can pick it up later once the PIN is mapped.
      employee_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      event_at: { type: Sequelize.DATE, allowNull: false },
      event_type: {
        type: Sequelize.ENUM('in', 'out', 'break_in', 'break_out', 'ot_in', 'ot_out', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
      },
      verify_mode: {
        type: Sequelize.ENUM('fingerprint', 'password_card', 'face', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown',
      },
      work_code: { type: Sequelize.STRING(32), allowNull: true },
      raw_payload: { type: Sequelize.JSON, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    // Dedupe — the device may retry on network errors. Same (device, user,
    // event_at) triple must land at most once.
    await queryInterface.addIndex('biometric_raw_logs', ['device_id', 'device_user_id', 'event_at'], {
      unique: true,
      name: 'uq_biometric_raw_logs_dedupe',
    });
    // The reconciliation query joins by (tenant, employee, day).
    await queryInterface.addIndex('biometric_raw_logs', ['tenant_id', 'employee_id', 'event_at'], {
      name: 'ix_biometric_raw_logs_tenant_employee_event',
    });

    // ── biometric_device_commands ──────────────────────────────────────────
    // Internal queue (server→device). No public_id, no soft-delete.
    await queryInterface.createTable('biometric_device_commands', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      device_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'biometric_devices', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      command_kind: {
        type: Sequelize.ENUM('user_upsert', 'user_delete', 'clear_data', 'reboot'),
        allowNull: false,
      },
      // Resolved values the renderer needs (biometric_pin, name, ...) at the
      // moment the command was queued. Decouples the queued payload from
      // later edits to the employee row.
      payload: { type: Sequelize.JSON, allowNull: true },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'acked', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      acked_at: { type: Sequelize.DATE, allowNull: true },
      attempts: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      failure_reason: { type: Sequelize.STRING(512), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    // Drives the /iclock/getrequest poll: cheap lookup for the oldest pending
    // command per device.
    await queryInterface.addIndex('biometric_device_commands', ['device_id', 'status', 'created_at'], {
      name: 'ix_biometric_device_commands_device_status',
    });
    await queryInterface.addIndex('biometric_device_commands', ['tenant_id'], {
      name: 'ix_biometric_device_commands_tenant',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('biometric_device_commands');
    await queryInterface.dropTable('biometric_raw_logs');
    await queryInterface.dropTable('biometric_devices');
  },
};

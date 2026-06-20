const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * biometric_device_users — the on-device user roster snapshot
 * (implementation plan §3.3, Phase 4 follow-up).
 *
 * One row per (device, device_user_id) pair. Captures what the terminal
 * holds — name, privilege, card number, enrollment counts — without storing
 * the raw fingerprint / face template blobs (those stay on the hardware and
 * carry stricter biometric-PII handling rules).
 *
 *   sync_source  — 'pull' (zklib getUsers) or 'adms' (OPERLOG USER row).
 *   employee_id  — resolved from employees.biometric_pin at sync time. NULL
 *                  for orphans (enrolled on the device but no employee
 *                  match yet). FK ON DELETE SET NULL so deleting an employee
 *                  doesn't lose the device-side roster.
 *
 * Pattern A unique on (device_id, device_user_id) so re-registering a soft-
 * deleted device-user reuses the slot.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. New table ────────────────────────────────────────────────────────
    await queryInterface.createTable(
      'biometric_device_users',
      Object.assign(
        standardColumns(Sequelize),
        {
          device_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'biometric_devices', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          // The "PIN" the device knows the user by. String so leading zeros
          // survive ("00042" stays distinct from 42).
          device_user_id: { type: Sequelize.STRING(64), allowNull: false },
          name: { type: Sequelize.STRING(120), allowNull: true },
          privilege: {
            type: Sequelize.ENUM('user', 'enroller', 'admin', 'super_admin'),
            allowNull: false,
            defaultValue: 'user',
          },
          card_number: { type: Sequelize.STRING(64), allowNull: true },
          password_set: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          // 0..10 fingers enrolled on this terminal.
          fingerprint_count: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
          face_enrolled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          // ZK-style group + time zone numbers; nullable when the firmware
          // doesn't surface them.
          group_no: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          time_zone: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          // Resolved at sync time; null for orphans.
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          last_synced_at: { type: Sequelize.DATE, allowNull: true },
          sync_source: {
            type: Sequelize.ENUM('pull', 'adms'),
            allowNull: true,
          },
          // The original parsed row (zklib object or OPERLOG line) — handy
          // for diagnostics without re-running the parser.
          raw_payload: { type: Sequelize.JSON, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'biometric_device_users');
    await queryInterface.addIndex('biometric_device_users', ['tenant_id', 'employee_id'], {
      name: 'ix_biometric_device_users_tenant_employee',
    });
    await queryInterface.addIndex('biometric_device_users', ['device_id'], {
      name: 'ix_biometric_device_users_device',
    });
    // Pattern A — a device-user slot is unique per device until soft-deleted.
    await addSoftDeleteUnique(
      queryInterface,
      'biometric_device_users',
      ['device_id', 'device_user_id'],
      'uq_biometric_device_users_device_user'
    );

    // ── 2. Extend the command-queue enum with 'user_query' ─────────────────
    // The push-mode "sync users from device" flow queues a DATA QUERY
    // USERINFO command; the device replies on its next handshake via OPERLOG.
    await queryInterface.changeColumn('biometric_device_commands', 'command_kind', {
      type: Sequelize.ENUM('user_upsert', 'user_delete', 'user_query', 'clear_data', 'reboot'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('biometric_device_commands', 'command_kind', {
      type: Sequelize.ENUM('user_upsert', 'user_delete', 'clear_data', 'reboot'),
      allowNull: false,
    });
    await queryInterface.dropTable('biometric_device_users');
  },
};

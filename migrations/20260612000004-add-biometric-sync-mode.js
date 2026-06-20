/**
 * AttendanceSync (Electron app) ingest pathway (Phase 4 follow-up).
 *
 * A third device mode joins the existing `push` (ADMS) / `pull` (node-zklib)
 * pair: `sync` — an external desktop relay (the AttendanceSync app) pulls
 * punches from the ZKTeco device on its LAN, then POSTs them to HRM at
 * `/biometric-sync` authenticated by a Bearer API key.
 *
 * Why a separate column from `shared_secret_hash`:
 *   - `shared_secret_hash` is a 6-digit numeric PIN (the ADMS pin_code on
 *     the device itself). Bcrypt is the right hash there — short PINs need
 *     a slow KDF.
 *   - The AttendanceSync API key is a 32-byte (256-bit) random token. With
 *     that much entropy, unsalted SHA-256 is preimage-resistant and gives
 *     us an O(1) indexed lookup — the same pattern used by GitHub PATs.
 *
 * `api_key_hint` stores the last 8 chars of the plaintext token so the UI
 * can render "Ends in …a1b2c3d4" without the operator having to keep the
 * token around. The plaintext itself is shown ONCE on create/rotate.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Extend the mode enum: push | pull | sync.
    await queryInterface.sequelize.query(
      "ALTER TABLE `biometric_devices` MODIFY COLUMN `mode` ENUM('push','pull','sync') NOT NULL DEFAULT 'push'"
    );

    // 2. Add api_key_hash + hint + generated_at — re-runnable so a partial
    //    migration can be re-applied without manual cleanup.
    const desc = await queryInterface.describeTable('biometric_devices');
    if (!desc.api_key_hash) {
      await queryInterface.addColumn('biometric_devices', 'api_key_hash', {
        type: Sequelize.STRING(64),
        allowNull: true,
      });
    }
    if (!desc.api_key_hint) {
      await queryInterface.addColumn('biometric_devices', 'api_key_hint', {
        type: Sequelize.STRING(8),
        allowNull: true,
      });
    }
    if (!desc.api_key_generated_at) {
      await queryInterface.addColumn('biometric_devices', 'api_key_generated_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // 3. Index on api_key_hash for the per-request bearer lookup. NOT unique:
    //    a soft-deleted device may still hold the hash, and rotating after a
    //    restore would otherwise need Pattern A scaffolding. Hash collisions
    //    on 256 bits of entropy are not a real concern; the controller will
    //    SELECT the active row (deleted_at IS NULL, status='active') and
    //    treat any other hit as not-found.
    const [existing] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `biometric_devices` WHERE Key_name = 'ix_biometric_devices_api_key_hash'"
    );
    if (!existing.length) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `biometric_devices` ADD INDEX `ix_biometric_devices_api_key_hash` (`api_key_hash`)'
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE `biometric_devices` DROP INDEX `ix_biometric_devices_api_key_hash`');
    await queryInterface.removeColumn('biometric_devices', 'api_key_generated_at');
    await queryInterface.removeColumn('biometric_devices', 'api_key_hint');
    await queryInterface.removeColumn('biometric_devices', 'api_key_hash');
    await queryInterface.sequelize.query(
      "ALTER TABLE `biometric_devices` MODIFY COLUMN `mode` ENUM('push','pull') NOT NULL DEFAULT 'push'"
    );
  },
};

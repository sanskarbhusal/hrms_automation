/**
 * biometric_raw_logs dedupe — switch the uniqueness key from per-device to
 * per-tenant (AttendanceSync follow-up).
 *
 * Why
 * ───
 * The original dedupe key was (device_id, device_user_id, event_at). That's
 * fine for ONE delivery path per device, but the same physical punch can
 * arrive through TWO HRM device rows in practice:
 *
 *   - The admin originally set up the terminal in `push` or `pull` mode and
 *     punches landed under that device row.
 *   - Later the admin added an `AttendanceSync` relay device (the new
 *     `mode='sync'` path) without removing the old row. The relay forwards
 *     the same SDK punches, but they land with a different `device_id`.
 *
 *   - Or the admin soft-deleted the original device. Its raw_logs survived
 *     (the FK is `ON DELETE CASCADE` for hard delete only; soft-delete just
 *     stamps `deleted_at`). New punches via a freshly-added device duplicate
 *     the historical rows.
 *
 * A human cannot physically present a fingerprint to two terminals in the
 * same second, so `(tenant_id, device_user_id, event_at)` is the natural
 * identity of a punch — and is also the key AttendanceSync itself uses for
 * dedupe on its side. Aligning ours with theirs eliminates the duplicate.
 *
 * What this migration does
 * ────────────────────────
 * 1. Picks the "best" row per (tenant_id, device_user_id, event_at) group:
 *      a. Prefer rows with a non-'unknown' event_type (the second ingest
 *         path knew the punch direction; the first didn't).
 *      b. Prefer rows whose device is still active (deleted_at IS NULL).
 *      c. Tiebreak by highest id (newest insert wins — most recent state).
 * 2. Hard-deletes every other row in the group. (`biometric_raw_logs` is
 *    exempt from soft-delete per §6.9 — real DELETE is the only mode.)
 * 3. Drops the old unique index `uq_biometric_raw_logs_dedupe` and adds the
 *    new `uq_biometric_raw_logs_tenant_dedupe` on the tenant-wide tuple.
 *
 * The `down()` reverses the index change but does NOT resurrect deleted
 * rows — they were duplicates and cannot be reconstructed.
 *
 * Re-run safety: the SELECT/DELETE pair below is idempotent — running it
 * on a clean table is a no-op. The index swap is guarded by
 * `SHOW INDEX` lookups so a partial migration can be re-applied.
 */
module.exports = {
  async up(queryInterface) {
    const sql = queryInterface.sequelize;

    // Step 1: stage the keepers in a temp table. MySQL DELETE can't reference
    // its own target table inside a subquery, so we materialise first.
    await sql.query('DROP TEMPORARY TABLE IF EXISTS _biometric_raw_logs_keep');
    await sql.query('CREATE TEMPORARY TABLE _biometric_raw_logs_keep (keeper_id BIGINT UNSIGNED PRIMARY KEY) ENGINE=MEMORY');
    await sql.query(
      'INSERT INTO _biometric_raw_logs_keep (keeper_id) ' +
        'SELECT id FROM (' +
        '  SELECT brl.id, ROW_NUMBER() OVER (' +
        '    PARTITION BY brl.tenant_id, brl.device_user_id, brl.event_at ' +
        '    ORDER BY ' +
        "      CASE brl.event_type WHEN 'unknown' THEN 1 ELSE 0 END ASC, " +
        '      CASE WHEN bd.deleted_at IS NOT NULL THEN 1 ELSE 0 END ASC, ' +
        '      brl.id DESC' +
        '  ) AS rn ' +
        '  FROM biometric_raw_logs brl ' +
        '  LEFT JOIN biometric_devices bd ON bd.id = brl.device_id' +
        ') ranked WHERE rn = 1'
    );

    // Step 2: hard-delete everything that isn't a keeper. Reports the row
    // count so the operator can see what cleanup happened.
    const [deleteResult] = await sql.query(
      'DELETE brl FROM biometric_raw_logs brl ' +
        'LEFT JOIN _biometric_raw_logs_keep k ON k.keeper_id = brl.id ' +
        'WHERE k.keeper_id IS NULL'
    );
    const deletedCount = deleteResult && typeof deleteResult.affectedRows === 'number' ? deleteResult.affectedRows : 0;
    // eslint-disable-next-line no-console
    console.log(`[migration] biometric_raw_logs: removed ${deletedCount} cross-device duplicate row(s)`);

    await sql.query('DROP TEMPORARY TABLE IF EXISTS _biometric_raw_logs_keep');

    // Step 3: swap the unique index. The old unique index
    // `(device_id, device_user_id, event_at)` is leading on `device_id`, so
    // MySQL is currently using it to back the FK constraint on `device_id`.
    // Dropping it directly fails with "needed in a foreign key constraint".
    //
    // Fix: add a plain index on `device_id` FIRST so the FK has another
    // index to lean on, then drop the unique index, then add the new
    // tenant-wide unique index. The standalone device_id index also speeds
    // up the device-filtered raw-log listing the activity panel uses, so
    // it's a net win even after the rest of the swap is done.
    const [devIdx] = await sql.query("SHOW INDEX FROM `biometric_raw_logs` WHERE Key_name = 'ix_biometric_raw_logs_device'");
    if (!devIdx.length) {
      await sql.query('ALTER TABLE `biometric_raw_logs` ADD INDEX `ix_biometric_raw_logs_device` (`device_id`)');
    }
    const [oldIdx] = await sql.query("SHOW INDEX FROM `biometric_raw_logs` WHERE Key_name = 'uq_biometric_raw_logs_dedupe'");
    if (oldIdx.length) {
      await sql.query('ALTER TABLE `biometric_raw_logs` DROP INDEX `uq_biometric_raw_logs_dedupe`');
    }
    const [newIdx] = await sql.query(
      "SHOW INDEX FROM `biometric_raw_logs` WHERE Key_name = 'uq_biometric_raw_logs_tenant_dedupe'"
    );
    if (!newIdx.length) {
      await sql.query(
        'ALTER TABLE `biometric_raw_logs` ' +
          'ADD UNIQUE INDEX `uq_biometric_raw_logs_tenant_dedupe` ' +
          '(`tenant_id`, `device_user_id`, `event_at`)'
      );
    }
  },

  async down(queryInterface) {
    const sql = queryInterface.sequelize;
    // Reverse order: add the old unique index back first (it covers the FK
    // on `device_id` again), then drop the new tenant-wide unique, then
    // drop the standalone device_id index (now redundant with the unique).
    const [oldIdx] = await sql.query("SHOW INDEX FROM `biometric_raw_logs` WHERE Key_name = 'uq_biometric_raw_logs_dedupe'");
    if (!oldIdx.length) {
      await sql.query(
        'ALTER TABLE `biometric_raw_logs` ' +
          'ADD UNIQUE INDEX `uq_biometric_raw_logs_dedupe` ' +
          '(`device_id`, `device_user_id`, `event_at`)'
      );
    }
    const [newIdx] = await sql.query(
      "SHOW INDEX FROM `biometric_raw_logs` WHERE Key_name = 'uq_biometric_raw_logs_tenant_dedupe'"
    );
    if (newIdx.length) {
      await sql.query('ALTER TABLE `biometric_raw_logs` DROP INDEX `uq_biometric_raw_logs_tenant_dedupe`');
    }
    const [devIdx] = await sql.query("SHOW INDEX FROM `biometric_raw_logs` WHERE Key_name = 'ix_biometric_raw_logs_device'");
    if (devIdx.length) {
      await sql.query('ALTER TABLE `biometric_raw_logs` DROP INDEX `ix_biometric_raw_logs_device`');
    }
  },
};

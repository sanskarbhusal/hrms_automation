/**
 * Per-tenant uniqueness on branches.phone, soft-delete aware (Pattern A — §6.9).
 *
 * Re-uses the `deleted_at_key` generated column already on `branches` (added by
 * 20260522000000-create-branches for the (tenant_id, code) unique). NULL phones
 * do not collide thanks to MySQL's UNIQUE+NULL semantics.
 *
 * Replaces an earlier draft that tried to add a global `UNIQUE (phone)` and
 * `UNIQUE (is_head_office)`. The boolean unique is wrong by construction (it
 * caps the whole table at 2 rows); global phone uniqueness violates the
 * tenancy boundary.
 *
 * Production-safety:
 *   1. Idempotent — re-running is a no-op once the target index exists.
 *   2. Cleans up partial state from the previous broken version of this file.
 *   3. Verifies the Pattern A `deleted_at_key` column exists before altering.
 *   4. Pre-flight check for duplicate (tenant_id, phone) among active rows —
 *      aborts with an actionable error listing offenders instead of failing
 *      mid-ALTER and leaving the operator to read raw MySQL output.
 *   5. Forces ALGORITHM=INPLACE, LOCK=NONE so the ALTER does not silently fall
 *      back to a table-locking copy on a large branches table.
 *   6. `down` only drops the index when present.
 */
module.exports = {
  async up(queryInterface) {
    const sql = queryInterface.sequelize;

    const indexes = await queryInterface.showIndex('branches');
    const names = new Set(indexes.map((i) => i.name));

    if (names.has('uq_branches_tenant_phone')) {
      return;
    }

    if (names.has('unique_phone')) {
      await sql.query('ALTER TABLE `branches` DROP INDEX `unique_phone`');
    }
    if (names.has('unique_is_head_office')) {
      await sql.query('ALTER TABLE `branches` DROP INDEX `unique_is_head_office`');
    }

    const [cols] = await sql.query(
      'SELECT COLUMN_NAME FROM information_schema.COLUMNS ' +
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'branches' " +
        "AND COLUMN_NAME = 'deleted_at_key'"
    );
    if (cols.length === 0) {
      throw new Error(
        '`branches.deleted_at_key` is missing — expected from 20260522000000-create-branches. ' +
          'Run earlier migrations first.'
      );
    }

    const [dupes] = await sql.query(
      'SELECT tenant_id, phone, COUNT(*) AS n, ' +
        '       GROUP_CONCAT(id ORDER BY id) AS ids ' +
        '  FROM branches ' +
        ' WHERE phone IS NOT NULL ' +
        "   AND phone <> '' " +
        '   AND deleted_at IS NULL ' +
        ' GROUP BY tenant_id, phone ' +
        'HAVING COUNT(*) > 1'
    );
    if (dupes.length > 0) {
      const sample = dupes
        .slice(0, 5)
        .map((d) => `  tenant_id=${d.tenant_id} phone=${d.phone} branch_ids=[${d.ids}]`)
        .join('\n');
      const more = dupes.length > 5 ? `\n  ...and ${dupes.length - 5} more` : '';
      throw new Error(
        `Cannot add uq_branches_tenant_phone: ${dupes.length} (tenant, phone) pair(s) have ` +
          'duplicate active rows. Resolve them (update or soft-delete the loser) and re-run:\n' +
          `${sample}${more}`
      );
    }

    await sql.query(
      'ALTER TABLE `branches` ' +
        'ADD UNIQUE INDEX `uq_branches_tenant_phone` ' +
        '(`tenant_id`, `phone`, `deleted_at_key`), ' +
        'ALGORITHM=INPLACE, LOCK=NONE'
    );
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex('branches');
    if (indexes.some((i) => i.name === 'uq_branches_tenant_phone')) {
      await queryInterface.sequelize.query('ALTER TABLE `branches` DROP INDEX `uq_branches_tenant_phone`');
    }
  },
};

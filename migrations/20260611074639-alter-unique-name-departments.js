/**
 * Per-tenant, per-branch uniqueness on departments.name, soft-delete aware
 * (Pattern A — §6.9).
 *
 * Replaces an earlier draft that added `ALTER TABLE departments ADD CONSTRAINT
 * name UNIQUE (branch_id, name)`. That version named the constraint literally
 * `name` (collides confusingly with the column), skipped tenant_id, and was not
 * soft-delete aware (a soft-deleted department blocked the name forever).
 *
 * Production-safety:
 *   1. Idempotent — re-running is a no-op once the target index exists.
 *   2. Cleans up the prior broken `name` index if it landed.
 *   3. Adds the Pattern A `deleted_at_key` generated column if not present
 *      (the create-departments migration didn't call addSoftDeleteUnique).
 *   4. Pre-flight check for duplicate (tenant_id, branch_id, name) among
 *      active rows — aborts with an actionable error listing offenders.
 *   5. Forces ALGORITHM=INPLACE, LOCK=NONE so the ALTER stays online and
 *      fails fast rather than silently locking the table.
 *   6. `down` only drops the index when present.
 *
 * Note: NULL `branch_id` (company-wide departments) is not deduplicated by
 * this index — MySQL treats NULL slots in a UNIQUE index as distinct. If
 * company-wide-name uniqueness is needed, enforce it at the service layer
 * or extend the index with a COALESCE'd branch_key.
 */
module.exports = {
  async up(queryInterface) {
    const sql = queryInterface.sequelize;

    const indexes = await queryInterface.showIndex('departments');
    const names = new Set(indexes.map((i) => i.name));

    if (names.has('uq_departments_tenant_branch_name')) {
      return;
    }

    if (names.has('name')) {
      await sql.query('ALTER TABLE `departments` DROP INDEX `name`');
    }

    const [cols] = await sql.query(
      'SELECT COLUMN_NAME FROM information_schema.COLUMNS ' +
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'departments' " +
        "AND COLUMN_NAME = 'deleted_at_key'"
    );
    if (cols.length === 0) {
      await sql.query(
        'ALTER TABLE `departments` ADD COLUMN `deleted_at_key` DATETIME ' +
          "GENERATED ALWAYS AS (COALESCE(`deleted_at`, '1970-01-01 00:00:00')) STORED"
      );
    }

    const [dupes] = await sql.query(
      'SELECT tenant_id, branch_id, name, COUNT(*) AS n, ' +
        '       GROUP_CONCAT(id ORDER BY id) AS ids ' +
        '  FROM departments ' +
        ' WHERE deleted_at IS NULL ' +
        ' GROUP BY tenant_id, branch_id, name ' +
        'HAVING COUNT(*) > 1'
    );
    if (dupes.length > 0) {
      const sample = dupes
        .slice(0, 5)
        .map((d) => `  tenant_id=${d.tenant_id} branch_id=${d.branch_id} name=${d.name} dept_ids=[${d.ids}]`)
        .join('\n');
      const more = dupes.length > 5 ? `\n  ...and ${dupes.length - 5} more` : '';
      throw new Error(
        `Cannot add uq_departments_tenant_branch_name: ${dupes.length} (tenant, branch, name) ` +
          'triplet(s) have duplicate active rows. Resolve them (rename or soft-delete the loser) ' +
          `and re-run:\n${sample}${more}`
      );
    }

    await sql.query(
      'ALTER TABLE `departments` ' +
        'ADD UNIQUE INDEX `uq_departments_tenant_branch_name` ' +
        '(`tenant_id`, `branch_id`, `name`, `deleted_at_key`), ' +
        'ALGORITHM=INPLACE, LOCK=NONE'
    );
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex('departments');
    if (indexes.some((i) => i.name === 'uq_departments_tenant_branch_name')) {
      await queryInterface.sequelize.query('ALTER TABLE `departments` DROP INDEX `uq_departments_tenant_branch_name`');
    }
  },
};

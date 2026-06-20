/**
 * Extend `employee_document_type_definitions.category` ENUM to add 'others'.
 *
 * The 4-step Employee Create wizard introduces a Step 4 ("Other documents")
 * that renders catalog rows with `category IN ('basic','others')`. Existing
 * 'academic'/'experience' values are kept for backwards compat with seeded
 * data — they remain visible on the detail-page Documents tab but no longer
 * appear in the wizard. Admins can re-categorise them via Settings UI.
 *
 * Non-destructive: pure ENUM widening, no row updates.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `employee_document_type_definitions` ' +
        "MODIFY `category` ENUM('basic','academic','experience','others') NOT NULL DEFAULT 'basic'"
    );
  },

  async down(queryInterface) {
    // Shrinking the enum is unsafe if any row already uses 'others' — fail
    // loudly instead of silently dropping rows. The migration logs which
    // codes are blocking the down so the operator can clean them up first.
    const [rows] = await queryInterface.sequelize.query(
      "SELECT code FROM `employee_document_type_definitions` WHERE category = 'others'"
    );
    if (rows.length > 0) {
      const codes = rows.map((r) => r.code).join(', ');
      throw new Error(`Cannot down-migrate: rows still using category='others' (${codes}). Re-categorise them first.`);
    }
    await queryInterface.sequelize.query(
      'ALTER TABLE `employee_document_type_definitions` ' +
        "MODIFY `category` ENUM('basic','academic','experience') NOT NULL DEFAULT 'basic'"
    );
  },
};

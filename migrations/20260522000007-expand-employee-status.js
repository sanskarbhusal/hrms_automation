/**
 * Expand employees.status for the lifecycle phase (implementation plan §3.2, §4.17).
 *
 * The Phase 1 enum was ('active','on_leave','terminated'); the lifecycle phase
 * needs 'probation' (a new hire before confirmation) and 'resigned' (distinct
 * from an employer-initiated 'terminated').
 *
 * `up` only WIDENS the enum — every existing value stays valid, so no data
 * migration is needed. `down` is intentionally LOSSY: it first re-homes the two
 * new values (probation -> active, resigned -> terminated) because MySQL's
 * strict mode rejects narrowing an enum while rows still hold dropped members.
 */
const WIDE = "ENUM('probation','active','on_leave','resigned','terminated')";
const NARROW = "ENUM('active','on_leave','terminated')";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TABLE \`employees\` MODIFY COLUMN \`status\` ${WIDE} NOT NULL DEFAULT 'active'`
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("UPDATE `employees` SET `status` = 'active' WHERE `status` = 'probation'");
    await queryInterface.sequelize.query("UPDATE `employees` SET `status` = 'terminated' WHERE `status` = 'resigned'");
    await queryInterface.sequelize.query(
      `ALTER TABLE \`employees\` MODIFY COLUMN \`status\` ${NARROW} NOT NULL DEFAULT 'active'`
    );
  },
};

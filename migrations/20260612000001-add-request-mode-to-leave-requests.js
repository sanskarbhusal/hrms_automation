/**
 * leave_requests.request_mode — discrete request mode chosen by the
 * employee at apply time. Replaces the dual interpretation of
 * `is_half_day` by adding an explicit ENUM('half_day','full_day','wfh').
 *
 * Backfill: existing rows are mapped from `is_half_day` to either
 * 'half_day' or 'full_day'. The old `is_half_day` / `half_day_session`
 * columns stay around for one release for backwards-compatible DTOs.
 *
 * `leave_type_id` becomes nullable because WFH requests have no leave
 * type — a WFH request says "I'm working from home", it is not absence
 * and does not deduct from any leave balance.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('leave_requests');

    // Add the column nullable first so the backfill can populate it; flip to
    // NOT NULL once every row has a value. (MySQL won't add a NOT NULL ENUM
    // to a non-empty table without a default we'd rather not bake in.)
    if (!desc.request_mode) {
      await queryInterface.addColumn('leave_requests', 'request_mode', {
        type: Sequelize.ENUM('half_day', 'full_day', 'wfh'),
        allowNull: true,
      });
    }

    // Backfill from is_half_day.
    await queryInterface.sequelize.query(
      "UPDATE `leave_requests` SET `request_mode` = CASE WHEN `is_half_day` = 1 THEN 'half_day' ELSE 'full_day' END WHERE `request_mode` IS NULL"
    );

    // Lock the column to NOT NULL now that every existing row has a value.
    await queryInterface.sequelize.query(
      "ALTER TABLE `leave_requests` MODIFY COLUMN `request_mode` ENUM('half_day','full_day','wfh') NOT NULL"
    );

    // Relax leave_type_id to NULL for WFH requests. New code enforces in the
    // service that NULL leave_type_id is only valid when request_mode='wfh'.
    await queryInterface.sequelize.query('ALTER TABLE `leave_requests` MODIFY COLUMN `leave_type_id` BIGINT UNSIGNED NULL');
  },

  async down(queryInterface) {
    // Re-tighten leave_type_id. Rows with NULL leave_type_id are WFH —
    // refuse to migrate down if any exist, rather than silently delete them.
    const [rows] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS n FROM `leave_requests` WHERE `leave_type_id` IS NULL'
    );
    if (rows && rows[0] && Number(rows[0].n) > 0) {
      throw new Error(
        'Cannot revert: leave_requests has rows with NULL leave_type_id (WFH). Migrate them away or delete first.'
      );
    }
    await queryInterface.sequelize.query(
      'ALTER TABLE `leave_requests` MODIFY COLUMN `leave_type_id` BIGINT UNSIGNED NOT NULL'
    );
    await queryInterface.removeColumn('leave_requests', 'request_mode');
  },
};

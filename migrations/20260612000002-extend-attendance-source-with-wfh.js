/**
 * Extend the `attendance_records.check_in_source` and `check_out_source`
 * ENUMs with `'wfh'`. An approved Work-From-Home leave request stamps the
 * day's attendance row as `status='present'` with `check_in_source='wfh'`
 * so reports and payroll see the day as worked, not absent.
 *
 * Same in-place ENUM merge pattern as 20260603000001-extend-tokens-type-enum.js.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE `attendance_records` MODIFY COLUMN `check_in_source` ENUM('web','mobile','manual','zkteco','wfh') NULL"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE `attendance_records` MODIFY COLUMN `check_out_source` ENUM('web','mobile','manual','zkteco','wfh') NULL"
    );
  },

  async down(queryInterface) {
    // Wipe any wfh-sourced rows before narrowing the ENUM.
    await queryInterface.sequelize.query(
      "UPDATE `attendance_records` SET `check_in_source` = NULL WHERE `check_in_source` = 'wfh'"
    );
    await queryInterface.sequelize.query(
      "UPDATE `attendance_records` SET `check_out_source` = NULL WHERE `check_out_source` = 'wfh'"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE `attendance_records` MODIFY COLUMN `check_in_source` ENUM('web','mobile','manual','zkteco') NULL"
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE `attendance_records` MODIFY COLUMN `check_out_source` ENUM('web','mobile','manual','zkteco') NULL"
    );
  },
};

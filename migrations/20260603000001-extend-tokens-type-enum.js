/**
 * Extend the `tokens.type` ENUM with the new `twoFaChallenge` value used by
 * the 2FA login flow (see token.service.generateTwoFaChallengeToken).
 *
 * MySQL ENUMs are an in-place schema change; we use raw DDL because Sequelize
 * does not offer a "merge value into ENUM" helper.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE `tokens` MODIFY COLUMN `type` ENUM('refresh','resetPassword','verifyEmail','twoFaChallenge') NOT NULL"
    );
  },

  async down(queryInterface) {
    // Rolling back drops the new value. Pre-existing rows of that type would
    // become invalid; we delete them defensively before narrowing the column.
    await queryInterface.sequelize.query("DELETE FROM `tokens` WHERE `type` = 'twoFaChallenge'");
    await queryInterface.sequelize.query(
      "ALTER TABLE `tokens` MODIFY COLUMN `type` ENUM('refresh','resetPassword','verifyEmail') NOT NULL"
    );
  },
};

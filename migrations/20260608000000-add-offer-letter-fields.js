/**
 * job_offers.cover_text + job_offers.offer_letter_url — completes the "send
 * offer" flow so the recruiter can ship a real offer to the candidate by email
 * (implementation plan §4.18 extension).
 *
 * Both columns are nullable so existing offers stay valid. Idempotent — a
 * partial earlier run will not duplicate the columns.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const desc = await queryInterface.describeTable('job_offers');
    if (!desc.cover_text) {
      await queryInterface.addColumn('job_offers', 'cover_text', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    if (!desc.offer_letter_url) {
      await queryInterface.addColumn('job_offers', 'offer_letter_url', {
        type: Sequelize.STRING(512),
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const desc = await queryInterface.describeTable('job_offers');
    if (desc.offer_letter_url) {
      await queryInterface.removeColumn('job_offers', 'offer_letter_url');
    }
    if (desc.cover_text) {
      await queryInterface.removeColumn('job_offers', 'cover_text');
    }
  },
};

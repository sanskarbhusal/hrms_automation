module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('tenants', 'email_preferences', {
      type: queryInterface.sequelize.Sequelize.JSON,
      allowNull: true,
      comment: "JSON array of enabled email types: ['welcome','offer','broadcast']. Null = none.",
    });

    // Backfill for tenants that already have SMTP configured — enable all types.
    await queryInterface.sequelize.query(
      'UPDATE `tenants` SET `email_preferences` = \'["welcome","offer","broadcast"]\' ' +
        "WHERE `smtp_config` IS NOT NULL AND JSON_EXTRACT(`smtp_config`, '$.host') IS NOT NULL"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tenants', 'email_preferences');
  },
};

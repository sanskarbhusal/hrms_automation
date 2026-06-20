const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'tenants',
      Object.assign(
        standardColumns(Sequelize, { tenantId: false }),
        {
          name: { type: Sequelize.STRING(150), allowNull: false },
          slug: { type: Sequelize.STRING(80), allowNull: false },
          subscription_plan: { type: Sequelize.STRING(40), allowNull: false, defaultValue: 'free' },
          status: {
            type: Sequelize.ENUM('active', 'suspended', 'trial'),
            allowNull: false,
            defaultValue: 'trial',
          },
          timezone: { type: Sequelize.STRING(64), allowNull: false, defaultValue: 'UTC' },
          currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'NPR' },
          fiscal_year_start_month: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 1 },
          logo_url: { type: Sequelize.STRING(512), allowNull: true },
          soft_delete_retention_days: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 180 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'tenants', { tenantId: false });
    await addSoftDeleteUnique(queryInterface, 'tenants', ['slug'], 'uq_tenants_slug');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tenants');
  },
};

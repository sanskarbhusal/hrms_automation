const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * branches — org-structure unit inside a tenant (implementation plan §3.2).
 * A branch is NOT a tenancy boundary; `tenant_id` still scopes every row.
 * `code` is user-facing and unique per tenant via Pattern A (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'branches',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(150), allowNull: false },
          code: { type: Sequelize.STRING(40), allowNull: false },
          address: { type: Sequelize.STRING(512), allowNull: true },
          city: { type: Sequelize.STRING(100), allowNull: true },
          country: { type: Sequelize.STRING(100), allowNull: true },
          timezone: { type: Sequelize.STRING(64), allowNull: false, defaultValue: 'UTC' },
          phone: { type: Sequelize.STRING(30), allowNull: true },
          is_head_office: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'branches');
    await addSoftDeleteUnique(queryInterface, 'branches', ['tenant_id', 'code'], 'uq_branches_tenant_code');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('branches');
  },
};

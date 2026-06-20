const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * holidays — paid leave days (implementation plan §3.x, §4.6).
 *
 * `branch_id` is nullable — NULL = company-wide holiday. The Pattern A
 * unique index covers (tenant, date, branch_id) so a tenant cannot
 * accidentally double-declare the same day for the same scope but CAN
 * re-create one after soft delete (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'holidays',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(150), allowNull: false },
          date: { type: Sequelize.DATEONLY, allowNull: false },
          is_full_day: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'holidays');
    await addSoftDeleteUnique(
      queryInterface,
      'holidays',
      ['tenant_id', 'date', 'branch_id'],
      'uq_holidays_tenant_date_branch'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('holidays');
  },
};

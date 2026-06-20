const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * shifts — work schedule templates (implementation plan §3.x, §4.7).
 *
 * Reusable across employee assignments. `weekly_off_days` stores 0–6 (Sun=0)
 * as a CSV string so a shift can declare multi-day weekends ("0,6"). A
 * night-shift's `end_time < start_time` is treated as next-day end. `name`
 * is unique per tenant via Pattern A so a soft-deleted shift frees its slot
 * (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'shifts',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(150), allowNull: false },
          start_time: { type: Sequelize.TIME, allowNull: false },
          end_time: { type: Sequelize.TIME, allowNull: false },
          break_minutes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          grace_minutes_late: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          grace_minutes_early: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
          is_night_shift: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          weekly_off_days: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '' },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'shifts');
    await addSoftDeleteUnique(queryInterface, 'shifts', ['tenant_id', 'name'], 'uq_shifts_tenant_name');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shifts');
  },
};

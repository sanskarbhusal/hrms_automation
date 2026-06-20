const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * employee_shifts — per-employee shift assignment history (implementation plan §3.x, §4.7).
 *
 * `effective_from` / `effective_to` model an open-ended interval; an
 * employee's "active shift on date D" is the row where
 * `effective_from <= D AND (effective_to IS NULL OR effective_to >= D)`.
 * Soft-deletable so a wrong assignment can be trashed without losing
 * history of the corrected one (§6.9).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employee_shifts',
      Object.assign(
        standardColumns(Sequelize),
        {
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          shift_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'shifts', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          effective_from: { type: Sequelize.DATEONLY, allowNull: false },
          effective_to: { type: Sequelize.DATEONLY, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_shifts');
    await queryInterface.addIndex('employee_shifts', ['tenant_id', 'employee_id', 'effective_from'], {
      name: 'ix_employee_shifts_tenant_employee_from',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_shifts');
  },
};

const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * employee_lifecycle_events — the per-employee timeline (implementation plan §3.9,
 * §4.17). Each row is a dated lifecycle event (recruitment, onboarding,
 * confirmation, transfer, resignation, termination, or a free-form note).
 * Soft-deleted; cascade-soft-deleted with the parent employee (§6.9). `details`
 * is a JSON payload whose shape depends on `event_type` (e.g. a transfer stores
 * from/to org assignments).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employee_lifecycle_events',
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
          event_type: {
            type: Sequelize.ENUM(
              'recruitment',
              'onboarding',
              'confirmation',
              'transfer',
              'resignation',
              'termination',
              'note'
            ),
            allowNull: false,
          },
          effective_date: { type: Sequelize.DATEONLY, allowNull: false },
          title: { type: Sequelize.STRING(150), allowNull: true },
          note: { type: Sequelize.STRING(512), allowNull: true },
          details: { type: Sequelize.JSON, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_lifecycle_events');
    await queryInterface.addIndex('employee_lifecycle_events', ['tenant_id', 'employee_id', 'effective_date'], {
      name: 'ix_employee_lifecycle_events_tenant_employee_date',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employee_lifecycle_events');
  },
};

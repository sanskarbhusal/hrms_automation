const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * application_activities — interviews / screens / assessments / notes logged
 * against an application (implementation plan §3.10, §4.18).
 *
 * Multiple activities per application; each is timestamped (scheduled_at can
 * be past or future). `interviewer_employee_id` is nullable so a `note` or
 * `assessment` row need not name an interviewer.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'application_activities',
      Object.assign(
        standardColumns(Sequelize),
        {
          application_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'applications', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          type: {
            type: Sequelize.ENUM('interview', 'screening', 'assessment', 'note'),
            allowNull: false,
          },
          scheduled_at: { type: Sequelize.DATE, allowNull: true },
          interviewer_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          mode: {
            type: Sequelize.ENUM('in_person', 'phone', 'video'),
            allowNull: true,
          },
          outcome: {
            type: Sequelize.ENUM('pass', 'fail', 'pending'),
            allowNull: false,
            defaultValue: 'pending',
          },
          rating: { type: Sequelize.DECIMAL(3, 1), allowNull: true },
          feedback: { type: Sequelize.TEXT, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'application_activities');
    await queryInterface.addIndex('application_activities', ['tenant_id', 'application_id'], {
      name: 'ix_application_activities_tenant_application',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('application_activities');
  },
};

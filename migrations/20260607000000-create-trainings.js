const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'trainings',
      Object.assign(
        standardColumns(Sequelize),
        {
          title: { type: Sequelize.STRING(200), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          type: {
            type: Sequelize.ENUM('internal', 'external'),
            allowNull: false,
            defaultValue: 'internal',
          },
          trainer_name: { type: Sequelize.STRING(150), allowNull: true },
          start_date: { type: Sequelize.DATEONLY, allowNull: false },
          end_date: { type: Sequelize.DATEONLY, allowNull: true },
          venue: { type: Sequelize.STRING(255), allowNull: true },
          cost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
          status: {
            type: Sequelize.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'planned',
          },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'trainings');
    await addSoftDeleteUnique(queryInterface, 'trainings', ['tenant_id', 'title'], 'uq_trainings_tenant_title');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('trainings');
  },
};

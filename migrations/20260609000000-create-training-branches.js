const { standardColumns, auditColumns } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Create the junction table
    await queryInterface.createTable(
      'training_branches',
      Object.assign(
        standardColumns(Sequelize, { publicId: false, tenantId: false }),
        {
          training_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'trainings', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await queryInterface.addIndex('training_branches', ['training_id', 'branch_id'], {
      unique: true,
      name: 'uq_training_branches_training_branch',
    });

    // 2. Migrate existing data: trainings with a branch_id get a junction row
    await queryInterface.sequelize.query(
      'INSERT INTO training_branches (training_id, branch_id, created_at, updated_at) ' +
        'SELECT id, branch_id, NOW(), NOW() FROM trainings WHERE branch_id IS NOT NULL'
    );

    // 3. Drop the old column from trainings
    await queryInterface.removeColumn('trainings', 'branch_id');
  },

  async down(queryInterface, Sequelize) {
    // Add the column back
    await queryInterface.addColumn('trainings', 'branch_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
    });

    // Restore data from junction (one branch per training — first row wins)
    await queryInterface.sequelize.query(
      'UPDATE trainings t ' +
        'JOIN (SELECT training_id, MIN(branch_id) AS branch_id FROM training_branches GROUP BY training_id) tb ' +
        'ON t.id = tb.training_id ' +
        'SET t.branch_id = tb.branch_id'
    );

    await queryInterface.dropTable('training_branches');
  },
};

const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'agents',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(120), allowNull: false },
          agent_key_hash: { type: Sequelize.STRING(64), allowNull: false },
          agent_key_hint: { type: Sequelize.STRING(8), allowNull: false },
          last_seen_at: { type: Sequelize.DATE, allowNull: true },
          last_ip: { type: Sequelize.STRING(45), allowNull: true },
          status: {
            type: Sequelize.ENUM('online', 'offline'),
            allowNull: false,
            defaultValue: 'offline',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'agents');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('agents');
  },
};

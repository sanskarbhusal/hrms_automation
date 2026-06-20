const { tokenTypes } = require('../config/tokens');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tokens', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: { type: Sequelize.STRING(512), allowNull: false },
      type: {
        type: Sequelize.ENUM(tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL),
        allowNull: false,
      },
      expires: { type: Sequelize.DATE, allowNull: false },
      blacklisted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('tokens', ['token'], { name: 'ix_tokens_token' });
    await queryInterface.addIndex('tokens', ['user_id', 'type'], { name: 'ix_tokens_user_type' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tokens');
  },
};

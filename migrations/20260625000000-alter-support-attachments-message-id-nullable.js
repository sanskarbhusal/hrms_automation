module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('support_attachments', 'message_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'support_messages', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('support_attachments', 'message_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'support_messages', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};

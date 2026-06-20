module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('support_messages', 'sender_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
    });

    await queryInterface.addColumn('support_messages', 'sender_user_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      after: 'sender_id',
    });

    await queryInterface.addIndex('support_messages', ['sender_user_id'], {
      name: 'ix_support_messages_sender_user',
    });

    await queryInterface.addConstraint('support_messages', {
      fields: ['sender_user_id'],
      type: 'foreign key',
      name: 'fk_support_messages_sender_user',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('support_messages', 'fk_support_messages_sender_user');
    await queryInterface.removeIndex('support_messages', 'ix_support_messages_sender_user');
    await queryInterface.removeColumn('support_messages', 'sender_user_id');

    await queryInterface.changeColumn('support_messages', 'sender_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    });
  },
};

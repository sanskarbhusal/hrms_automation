/**
 * support_messages — chat-style message thread per ticket
 * (Support Ticket System).
 *
 * No public_id, no soft delete. Messages cascade with the parent ticket.
 * `is_system` marks auto-generated status change / forward notifications.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('support_messages', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      ticket_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'support_tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'employees', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('support_messages', ['ticket_id', 'created_at'], {
      name: 'ix_support_messages_ticket_created',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('support_messages');
  },
};

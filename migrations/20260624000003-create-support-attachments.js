/**
 * support_attachments — file metadata per message
 * (Support Ticket System).
 *
 * No public_id, no soft delete. Attachments cascade with the parent message.
 * Files stored on disk at uploads/support/<ticket_publicId>/<uuid>.<ext>.
 * Media files (images/video) are compressed for non-grievance tickets;
 * grievance tickets store originals unchanged for legal/audit trail.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('support_attachments', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      message_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'support_messages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      file_size: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('support_attachments', ['message_id'], {
      name: 'ix_support_attachments_message',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('support_attachments');
  },
};

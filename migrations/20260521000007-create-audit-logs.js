module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      // Nullable so bootstrap / superadmin actions can still be logged.
      tenant_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      action: { type: Sequelize.STRING(40), allowNull: false },
      entity: { type: Sequelize.STRING(60), allowNull: false },
      entity_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      before: { type: Sequelize.JSON, allowNull: true },
      after: { type: Sequelize.JSON, allowNull: true },
      ip: { type: Sequelize.STRING(64), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('audit_logs', ['tenant_id', 'entity', 'entity_id'], {
      name: 'ix_audit_logs_entity',
    });
    await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'ix_audit_logs_created_at' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};

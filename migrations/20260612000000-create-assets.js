module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assets', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      public_id: { type: 'BINARY(16)', allowNull: false },
      tenant_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
      asset_tag: { type: Sequelize.STRING(100), allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      category: {
        type: Sequelize.ENUM('laptop', 'phone', 'sim', 'access_card', 'other'),
        allowNull: false,
        defaultValue: 'other',
      },
      serial_number: { type: Sequelize.STRING(200), allowNull: true },
      purchase_date: { type: Sequelize.DATEONLY, allowNull: true },
      purchase_cost: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      warranty_until: { type: Sequelize.DATEONLY, allowNull: true },
      status: {
        type: Sequelize.ENUM('available', 'assigned', 'in_repair', 'retired'),
        allowNull: false,
        defaultValue: 'available',
      },
      created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      updated_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      deleted_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    // Pattern A: soft-delete-aware unique on tenant_id + asset_tag.
    await queryInterface.sequelize.query(
      'ALTER TABLE assets ADD COLUMN deleted_at_key TINYINT(1) GENERATED ALWAYS AS (IF(deleted_at IS NULL, 1, NULL)) STORED'
    );
    await queryInterface.addIndex('assets', ['tenant_id', 'asset_tag', 'deleted_at_key'], {
      unique: true,
      name: 'uq_assets_tenant_tag',
    });

    await queryInterface.addIndex('assets', ['tenant_id', 'deleted_at']);
    await queryInterface.addIndex('assets', ['tenant_id', 'status']);
    await queryInterface.addIndex('assets', ['public_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assets');
  },
};

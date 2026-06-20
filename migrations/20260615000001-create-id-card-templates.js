const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * id_card_templates — tenant catalog of employee ID-card designs (§4.16, Phase 8).
 *
 * `branch_id` nullable: NULL = tenant-wide design; non-NULL = branch-specific.
 * `layout` holds the array of field descriptors (positions in mm on a CR80
 * card). Pattern A unique on `(tenant, name)` so a soft-deleted name is reusable.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'id_card_templates',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(120), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          layout: { type: Sequelize.JSON, allowNull: false },
          card_size: { type: Sequelize.STRING(20), allowNull: false, defaultValue: '85.6x53.98mm' },
          background_color: { type: Sequelize.CHAR(7), allowNull: false, defaultValue: '#ffffff' },
          background_image_url: { type: Sequelize.STRING(500), allowNull: true },
          is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'id_card_templates');
    await addSoftDeleteUnique(
      queryInterface,
      'id_card_templates',
      ['tenant_id', 'name'],
      'uq_id_card_templates_tenant_name'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('id_card_templates');
  },
};

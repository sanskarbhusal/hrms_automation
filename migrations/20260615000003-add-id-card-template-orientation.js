/**
 * Add `orientation` to id_card_templates (§4.16, Phase 8).
 *
 * A card design is either `horizontal` (landscape, 85.6 × 53.98 mm — the
 * existing default) or `vertical` (portrait, 53.98 × 85.6 mm). Existing rows
 * keep the landscape behaviour via the column default. The renderer swaps the
 * page dimensions based on this value; `card_size` stays a free-form label.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('id_card_templates', 'orientation', {
      type: Sequelize.ENUM('horizontal', 'vertical'),
      allowNull: false,
      defaultValue: 'horizontal',
      after: 'card_size',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('id_card_templates', 'orientation');
  },
};

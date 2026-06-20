module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('assets', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      "ALTER TABLE assets MODIFY COLUMN category ENUM('laptop','phone','sim','access_card','bike','car','mouse','keyboard','monitor','hdmi_cable','pc','printer','scanner','router','projector','cctv','tablet','other') NOT NULL DEFAULT 'other'"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('assets', 'image_url');

    await queryInterface.sequelize.query(
      "ALTER TABLE assets MODIFY COLUMN category ENUM('laptop','phone','sim','access_card','other') NOT NULL DEFAULT 'other'"
    );
  },
};

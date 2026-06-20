module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE assets ADD COLUMN description TEXT NULL AFTER `name`');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE assets DROP COLUMN description');
  },
};

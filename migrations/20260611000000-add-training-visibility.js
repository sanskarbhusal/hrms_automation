module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE trainings ADD COLUMN visibility ENUM('public','private') NOT NULL DEFAULT 'public' AFTER status"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('ALTER TABLE trainings DROP COLUMN visibility');
  },
};

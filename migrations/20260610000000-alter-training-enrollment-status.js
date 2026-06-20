module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE training_enrollments MODIFY COLUMN status ENUM('enrolled','completed','dropped','pending_approval','rejected','pending_withdrawal') NOT NULL DEFAULT 'enrolled'"
    );
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TABLE training_enrollments MODIFY COLUMN status ENUM('enrolled','completed','dropped') NOT NULL DEFAULT 'enrolled'"
    );
  },
};

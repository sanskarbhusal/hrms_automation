module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('time_select_requests', 'request_mode', {
      type: Sequelize.ENUM('early_arrive', 'late_arrive', 'early_leave'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('time_select_requests', 'request_mode', {
      type: Sequelize.ENUM('early_arrive', 'early_leave', 'late_leave'),
      allowNull: false,
    });
  },
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('time_select_requests', 'start_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.changeColumn('time_select_requests', 'end_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('time_select_requests', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
    await queryInterface.changeColumn('time_select_requests', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  },
};

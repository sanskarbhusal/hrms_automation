/**
 * Add `salary` column to the employees table.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'salary', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employees', 'salary');
  },
};

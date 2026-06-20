/**
 * Migration to:
 * 1. Allow nullable `slug` (subdomain) in `tenants` table.
 * 2. Update default value of `subscription_plan` from 'free' to 'trial'.
 * 3. Update existing tenants with 'free' subscription plan to 'trial'.
 * 4. Add `trial_duration_months` (default 1) to `tenants` table.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Allow nullable `slug`
    await queryInterface.changeColumn('tenants', 'slug', {
      type: Sequelize.STRING(80),
      allowNull: true,
    });

    // 2. Add `trial_duration_months`
    await queryInterface.addColumn('tenants', 'trial_duration_months', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    });

    // 3. Change `subscription_plan` default to 'trial'
    await queryInterface.changeColumn('tenants', 'subscription_plan', {
      type: Sequelize.STRING(40),
      allowNull: false,
      defaultValue: 'trial',
    });

    // 4. Update existing 'free' plans to 'trial'
    await queryInterface.sequelize.query("UPDATE tenants SET subscription_plan = 'trial' WHERE subscription_plan = 'free'");
  },

  async down(queryInterface, Sequelize) {
    // Revert existing 'trial' plans to 'free'
    await queryInterface.sequelize.query("UPDATE tenants SET subscription_plan = 'free' WHERE subscription_plan = 'trial'");

    // Revert `subscription_plan` default
    await queryInterface.changeColumn('tenants', 'subscription_plan', {
      type: Sequelize.STRING(40),
      allowNull: false,
      defaultValue: 'free',
    });

    // Remove `trial_duration_months`
    await queryInterface.removeColumn('tenants', 'trial_duration_months');

    // Revert nullable `slug` (Note: if there are NULLs, this will fail, which is expected)
    await queryInterface.changeColumn('tenants', 'slug', {
      type: Sequelize.STRING(80),
      allowNull: false,
    });
  },
};

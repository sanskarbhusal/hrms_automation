const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'users',
      Object.assign(
        standardColumns(Sequelize),
        {
          // tenant_id is nullable: the platform superadmin belongs to no tenant
          // (is_superadmin = true). standardColumns makes it NOT NULL, so the
          // FK is re-declared here as nullable.
          tenant_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'tenants', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          // role_id is nullable for the same reason — a superadmin has no
          // tenant-scoped role.
          role_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'roles', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          // Platform-level operator who provisions tenants via /superadmin/*.
          is_superadmin: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          // Nullable link to an employee record; FK constraint added in Phase 1.
          employee_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
          name: { type: Sequelize.STRING(150), allowNull: false },
          email: { type: Sequelize.STRING(255), allowNull: false },
          password_hash: { type: Sequelize.STRING(255), allowNull: false },
          phone: { type: Sequelize.STRING(30), allowNull: true },
          status: {
            type: Sequelize.ENUM('active', 'invited', 'suspended'),
            allowNull: false,
            defaultValue: 'active',
          },
          is_email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          last_login_at: { type: Sequelize.DATE, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'users');
    await addSoftDeleteUnique(queryInterface, 'users', ['tenant_id', 'email'], 'uq_users_tenant_email');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};

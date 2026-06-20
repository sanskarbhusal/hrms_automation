/**
 * two_factor_recovery_codes — single-use TOTP-replacement codes (8 per enroll).
 *
 * Joins the soft-delete exemption list alongside `tokens`: these are ephemeral
 * single-use credentials, hard-deleted when the user disables 2FA or rotates
 * their secret. `used_at` is the consume-once marker; no `deleted_at` column.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('two_factor_recovery_codes', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'tenants', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      code_hash: { type: Sequelize.STRING(255), allowNull: false },
      used_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('two_factor_recovery_codes', ['user_id', 'used_at'], {
      name: 'ix_two_factor_recovery_codes_user_used',
    });
    await queryInterface.addIndex('two_factor_recovery_codes', ['tenant_id'], {
      name: 'ix_two_factor_recovery_codes_tenant',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('two_factor_recovery_codes');
  },
};

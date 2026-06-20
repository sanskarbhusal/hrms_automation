const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * id_card_issues — one row per ID-card issuance (§4.16, Phase 8).
 *
 * Soft-deletable (NOT on the §6.9 exemption list). Revocation flips
 * `revoked_at`; it does not soft-delete. `verify_token` keys the public verify
 * route — Pattern A unique so a soft-deleted token frees its slot. Optional
 * `idempotency_key` is Pattern A unique (allow-null) for POST dedup.
 * `employee_id` is ON DELETE RESTRICT so a real purge can never strand the FK.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'id_card_issues',
      Object.assign(
        standardColumns(Sequelize),
        {
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          template_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'id_card_templates', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          verify_token: { type: Sequelize.CHAR(43), allowNull: false },
          issued_at: { type: Sequelize.DATE, allowNull: false },
          expires_at: { type: Sequelize.DATE, allowNull: true },
          revoked_at: { type: Sequelize.DATE, allowNull: true },
          revoked_by: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          revoke_reason: { type: Sequelize.STRING(255), allowNull: true },
          pdf_path: { type: Sequelize.STRING(500), allowNull: false },
          idempotency_key: { type: Sequelize.STRING(64), allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'id_card_issues');
    // "Current card for this employee" lookups.
    await queryInterface.addIndex('id_card_issues', ['employee_id', 'revoked_at'], {
      name: 'ix_id_card_issues_employee_revoked',
    });
    // Public route key — Pattern A so a soft-deleted token frees its slot.
    // This call also creates the shared `deleted_at_key` generated column.
    await addSoftDeleteUnique(
      queryInterface,
      'id_card_issues',
      ['tenant_id', 'verify_token'],
      'uq_id_card_issues_tenant_token'
    );
    // Idempotency dedup — a SECOND Pattern A index reusing the `deleted_at_key`
    // column the call above already added (the helper can't add the column
    // twice). Most rows leave idempotency_key NULL, and MySQL allows multiple
    // NULLs in a unique index, so unkeyed issues never collide.
    await queryInterface.sequelize.query(
      'ALTER TABLE `id_card_issues` ADD UNIQUE INDEX `uq_id_card_issues_tenant_idem` ' +
        '(`tenant_id`, `idempotency_key`, `deleted_at_key`)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('id_card_issues');
  },
};

const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * notice_acknowledgements — read receipts for "important" notices
 * (implementation plan §3.0 exception list — id-only, no public_id; §3.7, §4.13).
 *
 * One row per (notice, employee). Created by an explicit POST
 * `/v1/notices/:id/acknowledge`; idempotent — a second POST is a no-op. Only
 * notices with `priority IN ('high','urgent')` accept acks (the "important"
 * tier).
 *
 * Internal join: no public_id, no soft delete (lifecycle keyed to the parent
 * notice — joined to the §6.9 soft-delete-exemption list alongside
 * `meeting_attendees` / `event_attendees`). `tenant_id` is denormalised for
 * fast per-tenant audit queries; deletion cascades from the parent.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'notice_acknowledgements',
      Object.assign(
        standardColumns(Sequelize, { publicId: false }),
        {
          notice_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'notices', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          acknowledged_at: { type: Sequelize.DATE, allowNull: false },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'notice_acknowledgements', {
      publicId: false,
      softDelete: false,
    });
    await queryInterface.addIndex('notice_acknowledgements', ['notice_id', 'employee_id'], {
      unique: true,
      name: 'uq_notice_acks_notice_employee',
    });
    await queryInterface.addIndex('notice_acknowledgements', ['tenant_id', 'employee_id'], {
      name: 'ix_notice_acks_tenant_employee',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notice_acknowledgements');
  },
};

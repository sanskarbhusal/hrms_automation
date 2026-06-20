const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * applications — a candidate applying to a requisition (implementation plan §3.10, §4.18).
 *
 * The stage enum drives the pipeline; transitions are unidirectional (the
 * service enforces it). One candidate applies at most once per requisition —
 * the (requisition, candidate) pair is unique per tenant via Pattern A so a
 * soft-deleted application can be reopened (§6.9). `hired_employee_id` is
 * populated by the offer-accept transaction so analytics can trace the hire
 * back to the application that produced it.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'applications',
      Object.assign(
        standardColumns(Sequelize),
        {
          job_requisition_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'job_requisitions', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          candidate_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'candidates', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          stage: {
            type: Sequelize.ENUM('applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'),
            allowNull: false,
            defaultValue: 'applied',
          },
          applied_at: { type: Sequelize.DATE, allowNull: false },
          rejected_reason: { type: Sequelize.STRING(255), allowNull: true },
          hired_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'applications');
    await addSoftDeleteUnique(
      queryInterface,
      'applications',
      ['tenant_id', 'job_requisition_id', 'candidate_id'],
      'uq_applications_tenant_req_candidate'
    );
    await queryInterface.addIndex('applications', ['tenant_id', 'stage'], { name: 'ix_applications_tenant_stage' });
    await queryInterface.addIndex('applications', ['tenant_id', 'candidate_id'], {
      name: 'ix_applications_tenant_candidate',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('applications');
  },
};

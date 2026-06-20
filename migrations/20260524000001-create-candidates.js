const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * candidates — pre-employment applicants (implementation plan §3.10, §4.18).
 *
 * Candidates are independent of employees and users; a single person is one
 * candidate row that can apply to multiple requisitions. `email` is unique
 * per tenant via Pattern A so a soft-deleted candidate frees its slot (§6.9).
 * `referred_by_employee_id` records an employee referral; the FK is nullable
 * and set to NULL if the referring employee is hard-purged.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'candidates',
      Object.assign(
        standardColumns(Sequelize),
        {
          first_name: { type: Sequelize.STRING(100), allowNull: false },
          last_name: { type: Sequelize.STRING(100), allowNull: false },
          email: { type: Sequelize.STRING(255), allowNull: false },
          phone: { type: Sequelize.STRING(30), allowNull: true },
          resume_url: { type: Sequelize.STRING(512), allowNull: true },
          current_company: { type: Sequelize.STRING(150), allowNull: true },
          source: {
            type: Sequelize.ENUM('referral', 'job_portal', 'agency', 'walk_in', 'other'),
            allowNull: false,
            defaultValue: 'other',
          },
          referred_by_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          notes: { type: Sequelize.TEXT, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'candidates');
    await addSoftDeleteUnique(queryInterface, 'candidates', ['tenant_id', 'email'], 'uq_candidates_tenant_email');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('candidates');
  },
};

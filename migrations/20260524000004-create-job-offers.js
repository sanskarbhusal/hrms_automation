const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * job_offers — formal offers extended on an application (implementation plan §3.10, §4.18).
 *
 * The offer carries the proposed designation / branch / joining_date / salary
 * — accepting it triggers the hire flow, which calls the existing employees
 * create service inside a transaction (§4.17). `salary` is JSON
 * {amount, currency} so the amount stays as a string and never round-trips
 * through a JS float (§6.8). `valid_until` drives the expiry sweep.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'job_offers',
      Object.assign(
        standardColumns(Sequelize),
        {
          application_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'applications', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          designation_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'designations', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          salary: { type: Sequelize.JSON, allowNull: false },
          joining_date: { type: Sequelize.DATEONLY, allowNull: false },
          status: {
            type: Sequelize.ENUM('draft', 'sent', 'accepted', 'declined', 'withdrawn', 'expired'),
            allowNull: false,
            defaultValue: 'draft',
          },
          valid_until: { type: Sequelize.DATE, allowNull: true },
          sent_at: { type: Sequelize.DATE, allowNull: true },
          responded_at: { type: Sequelize.DATE, allowNull: true },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'job_offers');
    await queryInterface.addIndex('job_offers', ['tenant_id', 'application_id'], {
      name: 'ix_job_offers_tenant_application',
    });
    await queryInterface.addIndex('job_offers', ['tenant_id', 'status'], { name: 'ix_job_offers_tenant_status' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_offers');
  },
};

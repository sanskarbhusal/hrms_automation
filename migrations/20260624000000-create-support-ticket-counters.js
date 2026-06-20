/**
 * support_ticket_counters — atomic counter for ticket number generation
 * (Support Ticket System, implementation plan).
 *
 * One row per (tenant_id, year, category_code). Incremented atomically inside
 * the create-ticket transaction via SELECT ... FOR UPDATE. No soft delete,
 * no public_id — this is a transient counter, not a domain entity.
 *
 *   category_code — two-letter code derived from ticket category:
 *     PR (Payroll), AT (Attendance), BN (Benefits), HR (Policies),
 *     SY (System), AD (Admin), GV (Grievance), OT (Other)
 *
 *   last_number  — the last assigned sequence number for that combo.
 *     Starts at 0; the create service atomically increments to 1 on first use.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('support_ticket_counters', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
      },
      year: {
        type: Sequelize.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      category_code: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      last_number: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('support_ticket_counters', ['tenant_id', 'year', 'category_code'], {
      unique: true,
      name: 'uq_support_ticket_counters_tenant_year_category',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('support_ticket_counters');
  },
};

const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * meetings — scheduled team meetings (implementation plan §3.7, §4.9).
 *
 * Branch-scoped (every meeting lives in exactly one branch — BranchAdmin
 * write-force applies at the service layer). `organizer_employee_id` is the
 * employee who scheduled the meeting; `department_id` is an optional narrowing
 * dimension (NULL = branch-wide). `meeting_link` is a plain URL — no
 * Zoom/Teams/Meet API integration in this phase. `agenda` and `minutes` are
 * dedicated JSON slots each carrying a single `{ name, url, size, mime }`
 * descriptor (agenda set at create-time, minutes uploaded after the meeting).
 *
 * Attendees live in the sibling `meeting_attendees` table — RSVP + attendance
 * marking, internal join, no public_id, exempt from soft delete (lifecycle
 * keyed to the parent meeting via ON DELETE CASCADE).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'meetings',
      Object.assign(
        standardColumns(Sequelize),
        {
          title: { type: Sequelize.STRING(200), allowNull: false },
          description: { type: Sequelize.TEXT('medium'), allowNull: true },
          start_at: { type: Sequelize.DATE, allowNull: false },
          end_at: { type: Sequelize.DATE, allowNull: false },
          location: { type: Sequelize.STRING(255), allowNull: true },
          meeting_link: { type: Sequelize.STRING(500), allowNull: true },
          organizer_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
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
          department_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'departments', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          // `{ name, url, size, mime }` descriptor, set at create-time. NULL
          // when the organiser did not attach an agenda document.
          agenda: { type: Sequelize.JSON, allowNull: true },
          // Same shape, uploaded after the meeting. NULL until minutes published.
          minutes: { type: Sequelize.JSON, allowNull: true },
          status: {
            type: Sequelize.ENUM('scheduled', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'scheduled',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'meetings');
    // Drives the calendar view + management list — paginate by start_at within
    // a branch window.
    await queryInterface.addIndex('meetings', ['tenant_id', 'branch_id', 'start_at'], {
      name: 'ix_meetings_tenant_branch_start',
    });
    // "Meetings I organised" lookups.
    await queryInterface.addIndex('meetings', ['tenant_id', 'organizer_employee_id'], {
      name: 'ix_meetings_tenant_organizer',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('meetings');
  },
};

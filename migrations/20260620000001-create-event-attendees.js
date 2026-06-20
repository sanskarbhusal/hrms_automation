const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * event_attendees — per-employee RSVP + attendance for an event
 * (implementation plan §3.0 exception list — id-only, no public_id; §4.14).
 *
 * Mirrors meeting_attendees exactly: one row per (event, employee), idempotent
 * invite, internal join (no public_id, no soft-delete; lifecycle keyed to the
 * parent event via ON DELETE CASCADE — joined to the §6.9 soft-delete-exemption
 * list alongside `meeting_attendees`).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'event_attendees',
      Object.assign(
        standardColumns(Sequelize, { publicId: false }),
        {
          event_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'events', key: 'id' },
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
          rsvp_status: {
            type: Sequelize.ENUM('pending', 'accepted', 'declined', 'tentative'),
            allowNull: false,
            defaultValue: 'pending',
          },
          responded_at: { type: Sequelize.DATE, allowNull: true },
          attended: { type: Sequelize.BOOLEAN, allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'event_attendees', {
      publicId: false,
      softDelete: false,
    });
    // Idempotent invite — a second POST returns the existing row.
    await queryInterface.addIndex('event_attendees', ['event_id', 'employee_id'], {
      unique: true,
      name: 'uq_event_attendees_event_employee',
    });
    // "Events I'm an attendee of" lookups drive the /feed endpoint + bell badge.
    await queryInterface.addIndex('event_attendees', ['tenant_id', 'employee_id'], {
      name: 'ix_event_attendees_tenant_employee',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('event_attendees');
  },
};

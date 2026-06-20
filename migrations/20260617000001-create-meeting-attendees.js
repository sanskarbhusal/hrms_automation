const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * meeting_attendees — per-employee RSVP + attendance for a meeting
 * (implementation plan §3.0 exception list — id-only, no public_id; §3.7, §4.9).
 *
 * One row per (meeting, employee). Created when the organiser adds an
 * attendee; the attendee updates `rsvp_status` via the self-RSVP endpoint;
 * the organiser flips `attended` after the meeting via mark-attendance.
 *
 * Internal join: no public_id, no soft-delete (lifecycle keyed to the parent
 * meeting via ON DELETE CASCADE — joined to the §6.9 soft-delete-exemption
 * list alongside `notice_acknowledgements` / `event_attendees`). `tenant_id`
 * is denormalised for fast per-tenant audit queries.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'meeting_attendees',
      Object.assign(
        standardColumns(Sequelize, { publicId: false }),
        {
          meeting_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'meetings', key: 'id' },
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
          // Stamped when the attendee transitions out of `pending`. NULL until
          // they respond — drives the "Pending RSVPs" badge count.
          responded_at: { type: Sequelize.DATE, allowNull: true },
          // NULL = not marked yet; 0/1 = absent/present. Nullable so a
          // future-dated meeting's attendees stay untracked until after the
          // organiser flips them.
          attended: { type: Sequelize.BOOLEAN, allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'meeting_attendees', {
      publicId: false,
      softDelete: false,
    });
    // Idempotent invite — a second POST returns the existing row, never a
    // duplicate. Mirrors the notice_acknowledgements pattern.
    await queryInterface.addIndex('meeting_attendees', ['meeting_id', 'employee_id'], {
      unique: true,
      name: 'uq_meeting_attendees_meeting_employee',
    });
    // "Meetings I'm an attendee of" lookups drive the `/feed` endpoint + the
    // bell badge.
    await queryInterface.addIndex('meeting_attendees', ['tenant_id', 'employee_id'], {
      name: 'ix_meeting_attendees_tenant_employee',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('meeting_attendees');
  },
};

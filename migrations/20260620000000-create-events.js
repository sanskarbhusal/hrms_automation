const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * events — company events + auto-generated birthday/anniversary occurrences
 * (implementation plan §4.14).
 *
 * Branch-scoped (BranchAdmin write-force at the service layer, mirrors meetings).
 * `organizer_employee_id` is NULL for auto-events. `source_employee_id` +
 * `source_year` dedup the auto-generated rows: a unique index on
 * (tenant_id, event_type, source_employee_id, source_year) lets the recurring
 * cron findOrCreate idempotently. Manual events leave those NULL — MySQL treats
 * NULLs as distinct in a unique index, so they never collide.
 *
 * `cover_image` is a single `{ name, url, size, mime }` descriptor; `audience` /
 * `audience_ids` mirror notices and only matter when `is_public` is true.
 * Attendees live in the sibling `event_attendees` table (RSVP + attendance,
 * internal join, no public_id, exempt from soft-delete via ON DELETE CASCADE).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'events',
      Object.assign(
        standardColumns(Sequelize),
        {
          title: { type: Sequelize.STRING(200), allowNull: false },
          description: { type: Sequelize.TEXT('medium'), allowNull: true },
          event_type: {
            type: Sequelize.ENUM('general', 'birthday', 'anniversary'),
            allowNull: false,
            defaultValue: 'general',
          },
          // All-day calendar day — always set. Drives the calendar bucketing.
          event_date: { type: Sequelize.DATEONLY, allowNull: false },
          // Optional timed window for general events (NULL = all-day).
          start_at: { type: Sequelize.DATE, allowNull: true },
          end_at: { type: Sequelize.DATE, allowNull: true },
          location: { type: Sequelize.STRING(255), allowNull: true },
          // `{ name, url, size, mime }` descriptor, or NULL.
          cover_image: { type: Sequelize.JSON, allowNull: true },
          is_public: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
          audience: {
            type: Sequelize.ENUM('all', 'branch', 'department', 'role', 'specific'),
            allowNull: false,
            defaultValue: 'all',
          },
          // JSON array of internal BIGINT ids — empty unless is_public targets a
          // specific audience. Same shape + getter as notices.audience_ids.
          audience_ids: { type: Sequelize.JSON, allowNull: false },
          organizer_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
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
          // Birthday/anniversary provenance — the employee + occurrence year.
          // CASCADE so an auto-event vanishes when the employee is hard-purged.
          source_employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          source_year: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
          status: {
            type: Sequelize.ENUM('scheduled', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'scheduled',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'events');
    // Drives the calendar view + management list — paginate by event_date
    // within a branch window.
    await queryInterface.addIndex('events', ['tenant_id', 'branch_id', 'event_date'], {
      name: 'ix_events_tenant_branch_date',
    });
    // Filter by type (birthdays / anniversaries / general).
    await queryInterface.addIndex('events', ['tenant_id', 'event_type'], {
      name: 'ix_events_tenant_type',
    });
    // Idempotency guard for the recurring-events cron. Manual events leave
    // source_employee_id/source_year NULL (distinct in MySQL → no collision).
    await queryInterface.addIndex('events', ['tenant_id', 'event_type', 'source_employee_id', 'source_year'], {
      unique: true,
      name: 'uq_events_autogen',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('events');
  },
};

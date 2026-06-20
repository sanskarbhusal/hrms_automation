/**
 * Phase 6 follow-up — per-user read state for every notice (not just the
 * "important" ones that require acknowledgement).
 *
 * The `notice_acknowledgements` table is reused as a per-user
 * interaction-state table:
 *   - `read_at`         — set when the user opens / views the notice
 *                          (auto-fired on detail page mount).
 *   - `acknowledged_at` — set only on the formal ack endpoint, and only for
 *                          notices with priority IN ('high','urgent').
 *
 * A row exists once the user has either read OR acknowledged the notice.
 * The unique key on `(notice_id, employee_id)` already enforces
 * one-row-per-pair, so a read upgrade to an ack is an UPDATE in place.
 *
 * Backfill: every existing ack row gets `read_at = acknowledged_at`
 * (a user who acknowledged has clearly read).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('notice_acknowledgements', 'read_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Backfill so pre-existing acked rows are not also flagged as unread in
    // the new feed-with-read-state shape.
    await queryInterface.sequelize.query(
      'UPDATE `notice_acknowledgements` SET `read_at` = `acknowledged_at` WHERE `read_at` IS NULL'
    );
    // Drop the NOT NULL on `acknowledged_at` — a row may now exist for
    // "just read, not yet acknowledged" notices.
    await queryInterface.changeColumn('notice_acknowledgements', 'acknowledged_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addIndex('notice_acknowledgements', ['tenant_id', 'employee_id', 'read_at'], {
      name: 'ix_notice_acks_tenant_emp_read',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('notice_acknowledgements', 'ix_notice_acks_tenant_emp_read');
    await queryInterface.changeColumn('notice_acknowledgements', 'acknowledged_at', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.removeColumn('notice_acknowledgements', 'read_at');
  },
};

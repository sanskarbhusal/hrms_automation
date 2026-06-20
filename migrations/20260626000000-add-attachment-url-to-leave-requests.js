/**
 * Add `attachment_url` to leave_requests so an employee can attach a single
 * supporting file (PDF or image) when filing a request. Stored as the public
 * URL returned by /v1/uploads/leave/attachment — matches the existing
 * filename-on-disk + URL-on-row pattern used by employee documents, meeting
 * agendas, and event covers (see modules/uploads/uploads.controller.js).
 *
 * The pre-existing `attachment_file_id` BIGINT column was reserved for a
 * never-built `files` table; we leave it in place (nullable) rather than
 * dropping it, since it carries no data and removing it would force a
 * follow-up DTO/model edit on already-deployed environments.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('leave_requests', 'attachment_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    // Bump `reason` from VARCHAR(1024) to TEXT — the column now holds
    // sanitised HTML emitted by the Tiptap rich-text editor in the
    // dashboard form. Even a short paragraph with bold + a list runs
    // ~1200 chars once the tags are factored in, so 1024 is too tight.
    // TEXT (~65K bytes) gives ample headroom without bloating the row
    // storage estimate beyond MySQL's safe range.
    await queryInterface.changeColumn('leave_requests', 'reason', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('leave_requests', 'reason', {
      type: Sequelize.STRING(1024),
      allowNull: false,
    });
    await queryInterface.removeColumn('leave_requests', 'attachment_url');
  },
};

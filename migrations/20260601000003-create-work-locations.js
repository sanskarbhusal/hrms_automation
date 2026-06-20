const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * work_locations — geofences for web check-in (implementation plan §3.x, §4.5).
 *
 * One branch can have several work locations (e.g. main office, annex).
 * `radius_m` is the acceptance radius in metres; the haversine check in
 * attendance.checkin.service enforces it. Soft-deletable; auditing a
 * locked-out check-in is fine since the row still exists in trash.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'work_locations',
      Object.assign(
        standardColumns(Sequelize),
        {
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          name: { type: Sequelize.STRING(150), allowNull: false },
          lat: { type: Sequelize.DECIMAL(10, 8), allowNull: false },
          lng: { type: Sequelize.DECIMAL(11, 8), allowNull: false },
          radius_m: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 100 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'work_locations');
    await queryInterface.addIndex('work_locations', ['tenant_id', 'branch_id'], {
      name: 'ix_work_locations_tenant_branch',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('work_locations');
  },
};

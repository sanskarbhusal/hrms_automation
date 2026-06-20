const { standardColumns, auditColumns, addStandardIndexes } = require('../utils/migration');

/**
 * training_enrollments — per-employee enrollment records (implementation plan §4.10).
 *
 * Exception table per AGENTS.md §3: NO public_id, NO soft-delete.
 * Join-table lifecycle tied to parent training; records are immutable history
 * once the training is completed. Unique on (tenant_id, training_id, employee_id)
 * so an employee cannot be double-enrolled.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'training_enrollments',
      Object.assign(
        standardColumns(Sequelize, { publicId: false, tenantId: true }),
        {
          training_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'trainings', key: 'id' },
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
          status: {
            type: Sequelize.ENUM('enrolled', 'completed', 'dropped'),
            allowNull: false,
            defaultValue: 'enrolled',
          },
          score: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
          certificate_url: { type: Sequelize.STRING(512), allowNull: true },
          enrolled_at: { type: Sequelize.DATEONLY, allowNull: false },
          completed_at: { type: Sequelize.DATEONLY, allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );

    // Unique index so an employee is only enrolled once per training.
    await queryInterface.addIndex('training_enrollments', ['tenant_id', 'training_id', 'employee_id'], {
      unique: true,
      name: 'uq_training_enrollments_tenant_training_employee',
    });

    // Quick lookup for "all enrollments for this training" and "all trainings for this employee".
    await queryInterface.addIndex('training_enrollments', ['training_id'], {
      name: 'ix_training_enrollments_training',
    });
    await queryInterface.addIndex('training_enrollments', ['employee_id'], {
      name: 'ix_training_enrollments_employee',
    });

    // Standard tenant+audit index (no soft-delete column since softDelete: false).
    await addStandardIndexes(queryInterface, 'training_enrollments', {
      publicId: false,
      tenantId: true,
      softDelete: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('training_enrollments');
  },
};

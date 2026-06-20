const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * employees — the people directory (implementation plan §3.2, §4.4).
 *
 * `employee_code` is user-facing and unique per tenant via Pattern A (§6.9).
 * `user_id` is a nullable link to a login account (set when an employee is
 * invited). `reporting_to_employee_id` is a self-reference added as a plain
 * column here; its FK is added in 20260522000005 once the table exists.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'employees',
      Object.assign(
        standardColumns(Sequelize),
        {
          user_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          department_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'departments', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          designation_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'designations', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          // FK to employees(id) added in 20260522000005-add-org-foreign-keys.
          reporting_to_employee_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
          employee_code: { type: Sequelize.STRING(40), allowNull: false },
          first_name: { type: Sequelize.STRING(100), allowNull: false },
          last_name: { type: Sequelize.STRING(100), allowNull: false },
          dob: { type: Sequelize.DATEONLY, allowNull: true },
          gender: { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true },
          marital_status: {
            type: Sequelize.ENUM('single', 'married', 'divorced', 'widowed'),
            allowNull: true,
          },
          nationality: { type: Sequelize.STRING(80), allowNull: true },
          personal_email: { type: Sequelize.STRING(255), allowNull: true },
          personal_phone: { type: Sequelize.STRING(30), allowNull: true },
          emergency_contact_name: { type: Sequelize.STRING(150), allowNull: true },
          emergency_contact_phone: { type: Sequelize.STRING(30), allowNull: true },
          emergency_contact_relation: { type: Sequelize.STRING(60), allowNull: true },
          address: { type: Sequelize.STRING(512), allowNull: true },
          joining_date: { type: Sequelize.DATEONLY, allowNull: false },
          confirmation_date: { type: Sequelize.DATEONLY, allowNull: true },
          exit_date: { type: Sequelize.DATEONLY, allowNull: true },
          employment_type: {
            type: Sequelize.ENUM('full_time', 'part_time', 'contract', 'intern'),
            allowNull: false,
            defaultValue: 'full_time',
          },
          bank_name: { type: Sequelize.STRING(150), allowNull: true },
          bank_account: { type: Sequelize.STRING(50), allowNull: true },
          tax_id: { type: Sequelize.STRING(50), allowNull: true },
          salary_currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'NPR' },
          photo_url: { type: Sequelize.STRING(512), allowNull: true },
          status: {
            type: Sequelize.ENUM('active', 'on_leave', 'terminated'),
            allowNull: false,
            defaultValue: 'active',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employees');
    await addSoftDeleteUnique(queryInterface, 'employees', ['tenant_id', 'employee_code'], 'uq_employees_tenant_code');
    await queryInterface.addIndex('employees', ['tenant_id', 'branch_id'], { name: 'ix_employees_tenant_branch' });
    await queryInterface.addIndex('employees', ['tenant_id', 'department_id'], {
      name: 'ix_employees_tenant_department',
    });
    await queryInterface.addIndex('employees', ['tenant_id', 'reporting_to_employee_id'], {
      name: 'ix_employees_tenant_manager',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('employees');
  },
};

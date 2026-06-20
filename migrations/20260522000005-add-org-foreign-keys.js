/**
 * Deferred foreign keys (implementation plan §3.2).
 *
 * Three FKs point at `employees`, which is created after the tables that
 * reference it, so they are added here once every table exists:
 *   - users.employee_id            — a login account's optional employee link
 *   - departments.head_employee_id — the department head
 *   - employees.reporting_to_employee_id — the org-chart self-reference
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('users', {
      fields: ['employee_id'],
      type: 'foreign key',
      name: 'fk_users_employee',
      references: { table: 'employees', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addConstraint('departments', {
      fields: ['head_employee_id'],
      type: 'foreign key',
      name: 'fk_departments_head_employee',
      references: { table: 'employees', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.addConstraint('employees', {
      fields: ['reporting_to_employee_id'],
      type: 'foreign key',
      name: 'fk_employees_reporting_to',
      references: { table: 'employees', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('employees', 'fk_employees_reporting_to');
    await queryInterface.removeConstraint('departments', 'fk_departments_head_employee');
    await queryInterface.removeConstraint('users', 'fk_users_employee');
  },
};

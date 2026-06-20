const { standardColumns, auditColumns, addStandardIndexes, addSoftDeleteUnique } = require('../utils/migration');

/**
 * Migration for creating all Payroll & Tax tables (§3.6).
 * Tables:
 *   1. salary_components
 *   2. employee_salary_structures
 *   3. employee_salary_components (child join table, no soft-delete/public_id/tenant_id)
 *   4. payroll_runs (immutable/locked, no soft-delete)
 *   5. payslips (immutable/locked, no soft-delete)
 *   6. payslip_lines (child table, no soft-delete/public_id/tenant_id)
 *   7. advance_salary_requests (soft-deletable)
 *   8. tax_slabs (soft-deletable)
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. salary_components
    await queryInterface.createTable(
      'salary_components',
      Object.assign(
        standardColumns(Sequelize),
        {
          name: { type: Sequelize.STRING(100), allowNull: false },
          type: { type: Sequelize.ENUM('earning', 'deduction'), allowNull: false },
          calculation: { type: Sequelize.ENUM('fixed', 'percent_of_basic', 'formula'), allowNull: false },
          value: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
          formula: { type: Sequelize.STRING(255), allowNull: true },
          is_taxable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
          is_statutory: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'salary_components');
    await addSoftDeleteUnique(
      queryInterface,
      'salary_components',
      ['tenant_id', 'name'],
      'uq_salary_components_tenant_name'
    );

    // 2. employee_salary_structures
    await queryInterface.createTable(
      'employee_salary_structures',
      Object.assign(
        standardColumns(Sequelize),
        {
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          effective_from: { type: Sequelize.DATEONLY, allowNull: false },
          gross_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'NPR' },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'employee_salary_structures');
    await addSoftDeleteUnique(
      queryInterface,
      'employee_salary_structures',
      ['tenant_id', 'employee_id', 'effective_from'],
      'uq_emp_sal_struct_tenant_emp_eff'
    );

    // 3. employee_salary_components
    await queryInterface.createTable(
      'employee_salary_components',
      Object.assign(
        standardColumns(Sequelize, { publicId: false, tenantId: false }),
        {
          structure_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employee_salary_structures', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          component_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'salary_components', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          amount_or_percent: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await queryInterface.addIndex('employee_salary_components', ['structure_id', 'component_id'], {
      unique: true,
      name: 'uq_emp_sal_components_struct_comp',
    });

    // 4. payroll_runs
    await queryInterface.createTable(
      'payroll_runs',
      Object.assign(
        standardColumns(Sequelize),
        {
          period_year: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
          period_month: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false },
          branch_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'branches', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          status: { type: Sequelize.ENUM('draft', 'locked', 'paid'), allowNull: false, defaultValue: 'draft' },
          run_by: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          run_at: { type: Sequelize.DATE, allowNull: true },
          locked_at: { type: Sequelize.DATE, allowNull: true },
          paid_at: { type: Sequelize.DATE, allowNull: true },
          notes: { type: Sequelize.TEXT, allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'payroll_runs', { softDelete: false });
    await queryInterface.addIndex('payroll_runs', ['tenant_id', 'period_year', 'period_month', 'branch_id'], {
      name: 'ix_payroll_runs_tenant_period_branch',
    });

    // 5. payslips
    await queryInterface.createTable(
      'payslips',
      Object.assign(
        standardColumns(Sequelize),
        {
          payroll_run_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'payroll_runs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          gross: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          total_earnings: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          total_deductions: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          tax: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          net_pay: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          working_days: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
          present_days: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
          leave_days: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
          lop_days: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
          overtime_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
          bonus: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
          currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'NPR' },
          pdf_url: { type: Sequelize.STRING(512), allowNull: true },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await addStandardIndexes(queryInterface, 'payslips', { softDelete: false });
    await queryInterface.addIndex('payslips', ['payroll_run_id', 'employee_id'], {
      unique: true,
      name: 'uq_payslips_run_employee',
    });
    await queryInterface.addIndex('payslips', ['tenant_id', 'employee_id'], {
      name: 'ix_payslips_tenant_employee',
    });

    // 6. payslip_lines
    await queryInterface.createTable(
      'payslip_lines',
      Object.assign(
        standardColumns(Sequelize, { publicId: false, tenantId: false }),
        {
          payslip_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'payslips', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
          },
          component_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'salary_components', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          label: { type: Sequelize.STRING(150), allowNull: false },
          amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          is_earning: { type: Sequelize.BOOLEAN, allowNull: false },
        },
        auditColumns(Sequelize, { softDelete: false })
      )
    );
    await queryInterface.addIndex('payslip_lines', ['payslip_id'], {
      name: 'ix_payslip_lines_payslip',
    });

    // 7. advance_salary_requests
    await queryInterface.createTable(
      'advance_salary_requests',
      Object.assign(
        standardColumns(Sequelize),
        {
          employee_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: { model: 'employees', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
          },
          amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          reason: { type: Sequelize.TEXT, allowNull: true },
          status: {
            type: Sequelize.ENUM('pending', 'approved', 'rejected', 'deducted'),
            allowNull: false,
            defaultValue: 'pending',
          },
          installments: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
          approved_by: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          payroll_run_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: { model: 'payroll_runs', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'advance_salary_requests');
    await queryInterface.addIndex('advance_salary_requests', ['tenant_id', 'employee_id'], {
      name: 'ix_advance_salary_requests_tenant_employee',
    });

    // 8. tax_slabs
    await queryInterface.createTable(
      'tax_slabs',
      Object.assign(
        standardColumns(Sequelize),
        {
          country_code: { type: Sequelize.STRING(2), allowNull: false },
          fiscal_year: { type: Sequelize.STRING(20), allowNull: false },
          min_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
          max_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
          rate_percent: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
          fixed_deduction: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.0 },
        },
        auditColumns(Sequelize)
      )
    );
    await addStandardIndexes(queryInterface, 'tax_slabs');
    await queryInterface.addIndex('tax_slabs', ['tenant_id', 'country_code', 'fiscal_year'], {
      name: 'ix_tax_slabs_tenant_country_fy',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tax_slabs');
    await queryInterface.dropTable('advance_salary_requests');
    await queryInterface.dropTable('payslip_lines');
    await queryInterface.dropTable('payslips');
    await queryInterface.dropTable('payroll_runs');
    await queryInterface.dropTable('employee_salary_components');
    await queryInterface.dropTable('employee_salary_structures');
    await queryInterface.dropTable('salary_components');
  },
};

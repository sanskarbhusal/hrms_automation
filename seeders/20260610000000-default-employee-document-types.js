const uuid = require('../utils/uuid');

/**
 * Seed a sensible default catalog of employee document slots for the demo
 * tenant. Idempotent-safe via insert-or-skip: re-running on a populated DB
 * only inserts codes the tenant has not yet defined, so it can also be used
 * as a one-shot bootstrap for the existing demo tenant after the catalog
 * migration lands.
 *
 * Existing prod tenants start with an empty catalog and the admin defines
 * their own slots in Settings → Documents.
 */
const DEFAULTS = [
  // Basic / identity documents — each employee carries exactly one.
  { code: 'pan_card', title: 'PAN Card', category: 'basic', is_multiple: false, is_required: true, sort_order: 10 },
  { code: 'citizenship', title: 'Citizenship', category: 'basic', is_multiple: false, is_required: true, sort_order: 20 },
  {
    code: 'ssf_card',
    title: 'Social Security Fund (SSF) Card',
    category: 'basic',
    is_multiple: false,
    is_required: false,
    sort_order: 30,
  },
  // Academic — multiple certificates per employee.
  {
    code: 'academic_certificate',
    title: 'Academic Certificate',
    category: 'academic',
    is_multiple: true,
    is_required: false,
    sort_order: 10,
    description: 'Marksheets, transcripts and degree certificates.',
  },
  // Experience — multiple letters per employee.
  {
    code: 'work_experience_letter',
    title: 'Work Experience Letter',
    category: 'experience',
    is_multiple: true,
    is_required: false,
    sort_order: 10,
    description: 'One per previous employer.',
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const tenants = await queryInterface.sequelize.query('SELECT id FROM tenants WHERE deleted_at IS NULL', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });
    if (tenants.length === 0) return;
    const rows = [];
    for (let i = 0; i < tenants.length; i += 1) {
      const tenantId = tenants[i].id;
      // eslint-disable-next-line no-await-in-loop
      const existing = await queryInterface.sequelize.query(
        'SELECT code FROM employee_document_type_definitions WHERE tenant_id = :tenantId AND deleted_at IS NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT, replacements: { tenantId } }
      );
      const have = new Set(existing.map((r) => r.code));
      DEFAULTS.forEach((d) => {
        if (have.has(d.code)) return;
        rows.push({
          public_id: uuid.newBuffer(),
          tenant_id: tenantId,
          code: d.code,
          title: d.title,
          category: d.category,
          is_multiple: !!d.is_multiple,
          is_required: !!d.is_required,
          accept_mime: null,
          max_size_mb: 15,
          expiry_supported: false,
          sort_order: d.sort_order || 0,
          description: d.description || null,
          created_at: now,
          updated_at: now,
        });
      });
    }
    if (rows.length > 0) {
      await queryInterface.bulkInsert('employee_document_type_definitions', rows);
    }
  },

  async down(queryInterface) {
    const codes = DEFAULTS.map((d) => d.code);
    await queryInterface.bulkDelete('employee_document_type_definitions', { code: codes }, {});
  },
};

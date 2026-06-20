const uuid = require('../utils/uuid');

const DOCUMENT_TYPES = [
  {
    name: 'Offer Letter (Intern)',
    code: 'offer_letter_intern',
    description: 'Internship offer with terms',
    icon: 'FileText',
    sort_order: 10,
  },
  {
    name: 'Offer Letter (Full-time)',
    code: 'offer_letter_fulltime',
    description: 'Full-time employment offer',
    icon: 'FileText',
    sort_order: 20,
  },
  {
    name: 'Appointment Letter',
    code: 'appointment_letter',
    description: 'Formal appointment confirmation',
    icon: 'FileBadge',
    sort_order: 30,
  },
  {
    name: 'Confirmation Letter',
    code: 'confirmation_letter',
    description: 'Post-probation confirmation',
    icon: 'BadgeCheck',
    sort_order: 40,
  },
  {
    name: 'Promotion Letter',
    code: 'promotion_letter',
    description: 'Promotion to new role',
    icon: 'ArrowUpCircle',
    sort_order: 50,
  },
  {
    name: 'Salary Revision Letter',
    code: 'salary_revision_letter',
    description: 'Salary increment/revision',
    icon: 'DollarSign',
    sort_order: 60,
  },
  {
    name: 'Transfer Letter',
    code: 'transfer_letter',
    description: 'Branch/department transfer',
    icon: 'ArrowLeftRight',
    sort_order: 70,
  },
  {
    name: 'Internship Completion Certificate',
    code: 'internship_completion',
    description: 'Internship completion certificate',
    icon: 'Certificate',
    sort_order: 80,
  },
  {
    name: 'Experience Certificate',
    code: 'experience_certificate',
    description: 'Work experience record',
    icon: 'ScrollText',
    sort_order: 90,
  },
  {
    name: 'Training Completion Certificate',
    code: 'training_completion',
    description: 'Training program completion',
    icon: 'Award',
    sort_order: 100,
  },
  {
    name: 'Certificate of Excellence',
    code: 'excellence_certificate',
    description: 'Best employee / excellence award',
    icon: 'Star',
    sort_order: 110,
  },
  {
    name: 'Relieving Letter',
    code: 'relieving_letter',
    description: 'Employee release upon resignation',
    icon: 'LogOut',
    sort_order: 120,
  },
  {
    name: 'Resignation Acceptance Letter',
    code: 'resignation_acceptance',
    description: 'Acknowledging employee resignation',
    icon: 'FileCheck',
    sort_order: 130,
  },
  {
    name: 'Termination Letter',
    code: 'termination_letter',
    description: 'Employment termination notice',
    icon: 'FileX',
    sort_order: 140,
  },
  {
    name: 'Employment Verification Letter',
    code: 'employment_verification',
    description: 'Proof of employment for third parties',
    icon: 'ShieldCheck',
    sort_order: 150,
  },
  {
    name: 'Salary Certificate',
    code: 'salary_certificate',
    description: 'Salary verification for banks/embassies',
    icon: 'Receipt',
    sort_order: 160,
  },
  {
    name: 'No Objection Certificate (NOC)',
    code: 'noc_letter',
    description: 'NOC for further studies or travel',
    icon: 'FileCheck',
    sort_order: 170,
  },
  {
    name: 'Bond Agreement',
    code: 'bond_agreement',
    description: 'Service bond agreement',
    icon: 'FileSignature',
    sort_order: 180,
  },
  {
    name: 'Warning / Show Cause Letter',
    code: 'warning_letter',
    description: 'Disciplinary warning notice',
    icon: 'AlertTriangle',
    sort_order: 190,
  },
  {
    name: 'Performance Improvement Plan (PIP)',
    code: 'pip_letter',
    description: 'PIP notice and improvement plan',
    icon: 'TrendingUp',
    sort_order: 200,
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
    for (let t = 0; t < tenants.length; t += 1) {
      const tenantId = tenants[t].id;
      // eslint-disable-next-line no-await-in-loop
      const existing = await queryInterface.sequelize.query(
        'SELECT code FROM document_types WHERE tenant_id = :tenantId AND deleted_at IS NULL',
        { type: queryInterface.sequelize.QueryTypes.SELECT, replacements: { tenantId } }
      );
      const have = new Set(existing.map((r) => r.code));
      DOCUMENT_TYPES.forEach((dt) => {
        if (have.has(dt.code)) return;
        rows.push({
          public_id: uuid.newBuffer(),
          tenant_id: tenantId,
          name: dt.name,
          code: dt.code,
          description: dt.description || null,
          icon: dt.icon || null,
          is_active: true,
          sort_order: dt.sort_order || 0,
          created_at: now,
          updated_at: now,
        });
      });
    }
    if (rows.length > 0) {
      await queryInterface.bulkInsert('document_types', rows);
    }
  },

  async down(queryInterface) {
    const codes = DOCUMENT_TYPES.map((dt) => dt.code);
    await queryInterface.bulkDelete('document_types', { code: codes }, {});
  },
};

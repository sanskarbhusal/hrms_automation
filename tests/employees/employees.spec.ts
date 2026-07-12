import { expect, test, Page } from "@playwright/test"
import path from "path"
import data from "../../fixture/data.json"
import { getCsrfToken, createBranch, createDepartment, createDesignation, deleteDesignation, deleteDepartment, deleteBranch } from "../../utils/api-suits"

const adminStorageFile = path.join(__dirname, "../../playwright/.auth/admin-storage-state.json")

test.use({ storageState: adminStorageFile });

test.describe("Employees module", async () => {
  test.describe.configure({ mode: "serial" })

  let csrfToken: string = "fallback value"
  let branch_id: string
  let department_id: string
  let designation_id: string
  let page: Page

  test("[Precondition] Create branch, department and designation with api.", async ({ context, request, browser }) => {
    //
    // Retrieve csrf token.
    csrfToken = await getCsrfToken(context)
    //
    //Create a branch with api.
    const baranchPayload = data.branch_1
    const createBranchResponse = await createBranch(request, baranchPayload, csrfToken)
    // Assertion on create branch response
    expect(createBranchResponse.ok()).toBeTruthy()
    branch_id = (await createBranchResponse.json()).data.id
    //
    // Create a department with api.
    const departmentPayload = {
      branch_id,
      description: data.department_1.description,
      name: data.department_1.name
    }
    const createDepartmentResponse = await createDepartment(request, departmentPayload, csrfToken)
    // Assertion on create department response
    expect(createDepartmentResponse.ok()).toBeTruthy()
    department_id = (await createDepartmentResponse.json()).data.id
    //
    // Create a designation with api
    const designationPayload = {
      name: data.designation_1.name,
      description: data.designation_1.description,
      department_id
    }
    const createDesignationResponse = await createDesignation(request, designationPayload, csrfToken)
    // Assertion on create department response
    expect(createDesignationResponse.ok()).toBeTruthy()
    designation_id = (await createDesignationResponse.json()).data.id
    //
    // Create a page after pre-condition is performed
    page = await browser.newPage()
  })

  test("[EMP_01] Verify that user can quickly create new employee.", async () => {
    await page.goto("/dashboard/employees")

    await page.getByRole('button', { name: 'New employee' }).first().click();
    await page.getByRole('textbox', { name: 'First name' }).fill(data.employee_1.first_name);
    await page.getByRole('textbox', { name: 'Last name' }).fill(data.employee_1.last_name);
    await page.getByRole('textbox', { name: 'Company email' }).fill(data.employee_1.company_email);
    await page.getByLabel('Branch').selectOption({ label: data.employee_1.branch });
    await page.getByLabel('Department').selectOption({ label: data.employee_1.department });
    await page.getByLabel('Designation').selectOption({ label: data.employee_1.designation });
    await page.getByRole('textbox', { name: 'Biometric device PIN' }).fill('001');
    await page.getByRole('spinbutton', { name: 'Salary' }).fill('1000');
    await page.getByRole('button', { name: 'Create employee' }).click();
    // Assertion on credential modal
    await expect(page.getByText(data.employee_1.company_email)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Employee credentials' })).toBeVisible()
    // 
    await page.getByRole('button', { name: 'I\'ve saved it' }).click();
    // Assertion on employee detail page that appears after creating an employee
    await expect(page.getByRole('heading', { name: `${data.employee_1.first_name} ${data.employee_1.last_name}` })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByText(`First name${data.employee_1.first_name}`)).toBeVisible();
    await expect(page.getByText(`Last name${data.employee_1.last_name}`)).toBeVisible();
    await expect(page.getByText(`Designation${data.designation_1.name}`)).toBeVisible();
    await expect(page.getByText(`Department${data.department_1.name}`)).toBeVisible();
    await expect(page.getByText(`Branch${data.branch_1.name}`)).toBeVisible();
    await expect(page.getByLabel('Profile').getByText(data.employee_1.company_email)).toBeVisible();
    await expect(page.getByText('Invitation pending')).toBeVisible();
    await expect(page.getByText(`${data.employee_1.salary}.00 NPR`)).toBeVisible();

    // Cleanup: Delete created employee from the ui
    await page.goto("/dashboard/employees")
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name} moved to trash`)).toBeVisible();
  });

  test("[EMP_02] Verify that the user can search employee with name, code and email.", async () => {


  });
  test("[EMP_03] Verify that filter [statuses], [branches], [departments] and [designations] works.", async () => { });
  test("[EMP_04] Verify that the user can edit employee details.", async () => { });
  test("[EMP_05] Verify that the user can delete employee.", async () => { });
  test("[EMP_06] Verify that the user can view employee details.", async () => { });
  test("[EMP_07] Verify that the org chart shows employee hierarchy correctly.", async () => { });
  test("[EMP_08] Verify that the user can view profile change requests.", async () => { });
  //
  // After all
  test("[Post-condition] Delete all the branches, department and designation.", async ({ request, context }) => {
    // read csrf token
    csrfToken = await getCsrfToken(context)

    const deleteDesignationResponse = await deleteDesignation(request, designation_id, csrfToken)
    expect(deleteDesignationResponse.ok()).toBeTruthy()

    const deleteDepartmentResponse = await deleteDepartment(request, department_id, csrfToken)
    expect(deleteDepartmentResponse.ok()).toBeTruthy()

    const deleteBranchResponse = await deleteBranch(request, branch_id, csrfToken)
    expect(deleteBranchResponse.ok()).toBeTruthy()
  })
})
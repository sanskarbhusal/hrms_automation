import { expect, test, Page } from "@playwright/test"
import path from "path"
import data from "../../fixture/data.json"
import { getCsrfToken, createBranch, createDepartment, createDesignation, deleteDesignation, deleteDepartment, deleteBranch } from "../../utils/api-suits"

const adminStorageFile = path.join(__dirname, "../../playwright/.auth/admin-storage-state.json")

test.use({ storageState: adminStorageFile });

test.describe("Employees module", async () => {
  test.describe.configure({ mode: "serial" })

  let csrfToken: string = "fallback value"
  let branch_id_1: string, branch_id_2: string
  let department_id_1: string, department_id_2: string
  let designation_id_1: string, designation_id_2: string
  let page: Page

  test("[Precondition] Create branch, department and designation with api.", async ({ context, request }) => {
    // Retrieve csrf token.
    csrfToken = await getCsrfToken(context)

    //Create branch 1 with api.
    const baranch1Payload = data.branch_1
    const createBranch1Response = await createBranch(request, baranch1Payload, csrfToken)
    expect(createBranch1Response.ok()).toBeTruthy()
    branch_id_1 = (await createBranch1Response.json()).data.id

    //Create branch 2 with api.
    const baranch2Payload = data.branch_2
    const createBranch2Response = await createBranch(request, baranch2Payload, csrfToken)
    expect(createBranch2Response.ok()).toBeTruthy()
    branch_id_2 = (await createBranch2Response.json()).data.id

    // Create department 1 with api.
    const department1Payload = {
      branch_id: branch_id_1,
      description: data.department_1.description,
      name: data.department_1.name
    }
    const createDepartment1Response = await createDepartment(request, department1Payload, csrfToken)
    expect(createDepartment1Response.ok()).toBeTruthy()
    department_id_1 = (await createDepartment1Response.json()).data.id

    // Create department 2 with api.
    const department2Payload = {
      branch_id: branch_id_2,
      description: data.department_2.description,
      name: data.department_2.name
    }
    const createDepartment2Response = await createDepartment(request, department2Payload, csrfToken)
    expect(createDepartment2Response.ok()).toBeTruthy()
    department_id_2 = (await createDepartment2Response.json()).data.id

    // Create designation 1 with api
    const designation1Payload = {
      name: data.designation_1.name,
      description: data.designation_1.description,
      department_id: department_id_1
    }
    const createDesignation1Response = await createDesignation(request, designation1Payload, csrfToken)
    expect(createDesignation1Response.ok()).toBeTruthy()
    designation_id_1 = (await createDesignation1Response.json()).data.id

    // Create designation 2 with api
    const designation2Payload = {
      name: data.designation_2.name,
      description: data.designation_2.description,
      department_id: department_id_2
    }
    const createDesignation2Response = await createDesignation(request, designation2Payload, csrfToken)
    // Assertion on create designation response
    expect(createDesignation2Response.ok()).toBeTruthy()
    designation_id_2 = (await createDesignation2Response.json()).data.id
  })

  test("Create a page after pre-condition is performed.", async ({ browser }) => {
    page = await browser.newPage()
  })

  test("[EMP_01] Verify that user can quickly create new employee.", async () => {
    //
    // Test steps
    await page.goto("/dashboard/employees")
    await page.getByRole('button', { name: 'New employee' }).first().click();
    await page.getByRole('textbox', { name: 'First name' }).fill(data.employee_1.first_name);
    await page.getByRole('textbox', { name: 'Last name' }).fill(data.employee_1.last_name);
    await page.getByRole('textbox', { name: 'Company email' }).fill(data.employee_1.company_email);
    await page.getByLabel('Branch').selectOption({ label: data.branch_1.name });
    await page.getByLabel('Department').selectOption({ label: data.department_1.name });
    await page.getByLabel('Designation').selectOption({ label: data.designation_1.name });
    await page.getByRole('textbox', { name: 'Biometric device PIN' }).fill(data.employee_1.biometric_device_pin);
    await page.getByRole('spinbutton', { name: 'Salary' }).fill(data.employee_1.salary);
    await page.getByRole('button', { name: 'Create employee' }).click();
    //
    // Assertion on credential modal
    await expect(page.getByText(data.employee_1.company_email)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Employee credentials' })).toBeVisible()
    // 
    await page.getByRole('button', { name: 'I\'ve saved it' }).click();
    //
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
    //
    // Cleanup: Delete created employee from the ui
    await page.goto("/dashboard/employees")
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name} moved to trash`)).toBeVisible();
  });

  test("[EMP_02] Verify that the user can search employee with name and employee code", async () => {
    await page.goto("/dashboard/employees")
    //
    // Precondition
    // Create employee 1 on branch 1, department 1 and designation 1
    await page.getByRole('button', { name: 'New employee' }).first().click();
    await page.getByRole('textbox', { name: 'First name' }).fill(data.employee_1.first_name);
    await page.getByRole('textbox', { name: 'Last name' }).fill(data.employee_1.last_name);
    await page.getByRole('textbox', { name: 'Company email' }).fill(data.employee_1.company_email);
    await page.getByLabel('Branch').selectOption({ label: data.branch_1.name });
    await page.getByLabel('Department').selectOption({ label: data.department_1.name });
    await page.getByLabel('Designation').selectOption({ label: data.designation_1.name });
    await page.getByRole('textbox', { name: 'Biometric device PIN' }).fill(data.employee_1.biometric_device_pin);
    await page.getByRole('spinbutton', { name: 'Salary' }).fill(data.employee_1.salary);
    await page.getByRole('button', { name: 'Create employee' }).click();
    await page.getByRole('button', { name: 'I\'ve saved it' }).click();
    // Create employee 2 on branch 1, department 1 and designation 1
    await page.goto("/dashboard/employees")
    await page.getByRole('button', { name: 'New employee' }).first().click();
    await page.getByRole('textbox', { name: 'First name' }).fill(data.employee_2.first_name);
    await page.getByRole('textbox', { name: 'Last name' }).fill(data.employee_2.last_name);
    await page.getByRole('textbox', { name: 'Company email' }).fill(data.employee_2.company_email);
    await page.getByLabel('Branch').selectOption({ label: data.branch_1.name });
    await page.getByLabel('Department').selectOption({ label: data.department_1.name });
    await page.getByLabel('Designation').selectOption({ label: data.designation_1.name });
    await page.getByRole('textbox', { name: 'Biometric device PIN' }).fill(data.employee_2.biometric_device_pin);
    await page.getByRole('spinbutton', { name: 'Salary' }).fill(data.employee_2.salary);
    await page.getByRole('button', { name: 'Create employee' }).click();
    await page.getByRole('button', { name: 'I\'ve saved it' }).click();
    //
    // Test steps
    await page.goto("/dashboard/employees")
    // await page.getByRole('textbox', { name: 'Search employees…' }).click();
    await page.getByRole('textbox', { name: 'Search' }).fill(data.employee_1.first_name);
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();

    // Cleanup: Delete employee from the ui 
    await page.getByRole('textbox', { name: 'Search' }).fill('')
    await page.getByRole('button', { name: 'Move to trash' }).first().click();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await expect(page.getByText('moved to trash')).toBeVisible();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await expect(page.getByText('moved to trash')).toBeVisible();
  });

  test("[EMP_03] Verify that filter [statuses], [branches], [departments] and [designations] works.", async () => {
    await page.goto("/dashboard/employees")
    //
    // Precondition
    // Create employee 1 on branch 1, department 1 and designation 1
    await page.getByRole('button', { name: 'New employee' }).first().click();
    await page.getByRole('textbox', { name: 'First name' }).fill(data.employee_1.first_name);
    await page.getByRole('textbox', { name: 'Last name' }).fill(data.employee_1.last_name);
    await page.getByRole('textbox', { name: 'Company email' }).fill(data.employee_1.company_email);
    await page.getByLabel('Branch').selectOption({ label: data.branch_1.name });
    await page.getByLabel('Department').selectOption({ label: data.department_1.name });
    await page.getByLabel('Designation').selectOption({ label: data.designation_1.name });
    await page.getByRole('textbox', { name: 'Biometric device PIN' }).fill(data.employee_1.biometric_device_pin);
    await page.getByRole('spinbutton', { name: 'Salary' }).fill(data.employee_1.salary);
    await page.getByRole('button', { name: 'Create employee' }).click();
    await page.getByRole('button', { name: 'I\'ve saved it' }).click();
    // Create employee 2 on branch 2, department 2 and designation 2
    await page.goto("/dashboard/employees")
    await page.getByRole('button', { name: 'New employee' }).first().click();
    await page.getByRole('textbox', { name: 'First name' }).fill(data.employee_2.first_name);
    await page.getByRole('textbox', { name: 'Last name' }).fill(data.employee_2.last_name);
    await page.getByRole('textbox', { name: 'Company email' }).fill(data.employee_2.company_email);
    await page.getByLabel('Branch').selectOption({ label: data.branch_2.name });
    await page.getByLabel('Department').selectOption({ label: data.department_2.name });
    await page.getByLabel('Designation').selectOption({ label: data.designation_2.name });
    await page.getByRole('textbox', { name: 'Biometric device PIN' }).fill(data.employee_2.biometric_device_pin);
    await page.getByRole('spinbutton', { name: 'Salary' }).fill(data.employee_2.salary);
    await page.getByRole('button', { name: 'Create employee' }).click();
    await page.getByRole('button', { name: 'I\'ve saved it' }).click();

    // Test steps
    await page.goto("/dashboard/employees")

    // Filter by branch
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(1).selectOption({ label: data.branch_1.name });
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(1).selectOption({ label: data.branch_2.name });
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(1).selectOption({ label: "All branches" });
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();

    //Filter by department
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(2).selectOption({ label: data.department_1.name });
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(2).selectOption({ label: data.department_2.name });
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(2).selectOption({ label: "All departments" });
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();

    //Filter by designation
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(3).selectOption({ label: data.designation_1.name });
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(3).selectOption({ label: data.designation_2.name });
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).not.toBeVisible();
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await page.getByRole('combobox').nth(3).selectOption({ label: "All designations" });
    await expect(page.getByText(`${data.employee_2.first_name} ${data.employee_2.last_name}`)).toBeVisible();
    await expect(page.getByText(`${data.employee_1.first_name} ${data.employee_1.last_name}`)).toBeVisible();

    // Cleanup: Delete all the employees
    await page.getByRole('button', { name: 'Move to trash' }).first().click();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await expect(page.getByText('moved to trash')).toBeVisible();

    await page.getByRole('button', { name: 'Move to trash' }).click();
    await page.getByRole('button', { name: 'Move to trash' }).click();
    await expect(page.getByText('moved to trash')).toBeVisible();

    await page.pause()

  });
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

    const deleteDesignation1Response = await deleteDesignation(request, designation_id_1, csrfToken)
    expect(deleteDesignation1Response.ok()).toBeTruthy()
    const deleteDesignation2Response = await deleteDesignation(request, designation_id_2, csrfToken)
    expect(deleteDesignation2Response.ok()).toBeTruthy()

    const deleteDepartment1Response = await deleteDepartment(request, department_id_1, csrfToken)
    expect(deleteDepartment1Response.ok()).toBeTruthy()
    const deleteDepartment2Response = await deleteDepartment(request, department_id_2, csrfToken)
    expect(deleteDepartment2Response.ok()).toBeTruthy()

    const deleteBranch1Response = await deleteBranch(request, branch_id_1, csrfToken)
    expect(deleteBranch1Response.ok()).toBeTruthy()
    const deleteBranch2Response = await deleteBranch(request, branch_id_2, csrfToken)
    expect(deleteBranch2Response.ok()).toBeTruthy()
  })
})
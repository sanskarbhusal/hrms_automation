import { test, expect, type Page } from "@playwright/test";
import data from "../../fixture/data.json";

test.describe.skip("Employees module", async () => {
  // Stops other tests when one fails
  test.describe.configure({ mode: "serial" });

  let page: Page;

  test.beforeAll("Create a branch, two department and two designations", async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/auth/login");
    await expect(page.getByText("Sign in to HRM")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await page.getByRole("textbox", { name: "Email *" }).click();
    await page.getByRole("textbox", { name: "Email *" }).fill(data.role.admin.email);
    await page.getByRole("textbox", { name: "Password *" }).click();
    await page.getByRole("textbox", { name: "Password *" }).fill(data.role.admin.password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();

    // Create "test_branch1"
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_1.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_1.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill(data.branch_1.phone);
    await page.getByRole("button", { name: "Create branch" }).click();
    await expect(page.getByText("Branch created")).toBeVisible();

    // Create "test_branch1"
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch2");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code2");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city2");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country1");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address1");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("9888888888");
    await page.getByRole("button", { name: "Create branch" }).click();
    await expect(page.getByText("Branch created")).toBeVisible();

    // create "test_department1"
    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department1");
    await page.getByRole("combobox").selectOption({ label: "test_branch1" });
    await page.getByRole("button", { name: "Create department" }).click();
    await expect(page.getByText("Department created")).toBeVisible();

    // create "test_department2"
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department2");
    await page.getByRole("combobox").selectOption({ label: "test_branch1" });
    await page.getByRole("button", { name: "Create department" }).click();
    await expect(page.getByText("Department created")).toBeVisible();

    // Create "test_designation1"
    await page.goto("/dashboard/designations");

    // Create "test_designation1"
    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_designation1");
    await page.getByRole("combobox").selectOption({ label: "test_department1 — test_branch1" });
    await page.getByRole("button", { name: "Create designation" }).click();
    await expect(page.getByText("Designation created")).toBeVisible();

    // Create "test_designation2"
    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("t");
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_designation2");
    await page.getByRole("combobox").selectOption({ label: "test_department2 — test_branch1" });
    await page.getByRole("button", { name: "Create designation" }).click();
    await expect(page.getByText("Designation created")).toBeVisible();
  });

  test.afterAll("Remove the test branch, department and designations", async () => {
    await page.goto("/dashboard/designations");
    // Delete "test_designation2"
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(page.getByText("test_designation2 moved to")).toBeVisible();
    // Delete "test_designation1"
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(page.getByText("test_designation1 moved to")).toBeVisible();

    await page.goto("/dashboard/departments");
    // Remove "test_department2"
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(page.getByText("test_department2 moved to")).toBeVisible();
    // Remove "test_department1"
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(page.getByText("test_department1 moved to")).toBeVisible();

    await page.goto("/dashboard/branches");
    // Remove test "test_branch1"
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(page.getByText("test_branch1 moved to trash")).toBeVisible();
  });

  // test.beforeEach("Login as admin", async ({ page }) => {
  //   await login(page);
  // });

  test.afterEach(async () => {
    await page.waitForTimeout(500);
  });

  test.only("[EMP_01] Verify that user can create new employee.", async () => {
    await page.goto("/dashboard/employees");

    await page.getByRole("button", { name: "New employee" }).click();
    await page.getByRole("textbox", { name: "Employee code *" }).click();
    await page.getByRole("textbox", { name: "Employee code *" }).fill("test_emp_code1");
    await page.getByRole("textbox", { name: "First name *" }).click();
    await page.getByRole("textbox", { name: "First name *" }).fill("test_fname");
    await page.getByRole("textbox", { name: "Last name *" }).click();
    await page.getByRole("textbox", { name: "Last name *" }).fill("test_lname");
    await page.getByRole("textbox", { name: "Company email *" }).click();
    await page.getByRole("textbox", { name: "Company email *" }).fill("test_fname.test_lname@test.com");
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByRole("button", { name: "Next" }).click();
    // await page.getByRole("button", { name: "Upload" }).first().click();
    await page.locator('input[type="file"]').first().setInputFiles("/home/sb/Downloads/Test files/Traveller/Traveller-DP.jpg");
    // await page.getByRole("button", { name: "Upload" }).first().click();
    await page.locator('input[type="file"]').nth(1).setInputFiles("/home/sb/Downloads/Test files/Traveller/Traveller-DP.jpg");
    await page.getByRole("button", { name: "Create employee" }).click();
    await expect(page.getByText("/Employee created with 2/")).toBeVisible();

    await page.pause();
  });
  test("[EMP_02] Verify that the search works.", async () => { });
  test("[EMP_03] Verify that filter [statuses], [branches], [departments] and [designations] works.", async () => { });
  test("[EMP_04] Verify that the user can edit employee details.", async () => { });
  test("[EMP_05] Verify that the user can delete employee.", async ({ page }) => { });
  test("[EMP_06] Verify that the user can view employee details.", async ({ page }) => { });
  test("[EMP_07] Verify that the org chart shows employee hierarchy correctly.", async ({ page }) => { });
  test("[EMP_08] Verify that the user can view profile change requests.", async ({ page }) => { });
});

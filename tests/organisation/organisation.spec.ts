import { test, expect } from "@playwright/test";
import { login } from "../../utils/login";
import data from "../../fixture/data.json";

test.describe("Organization module", async () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach("Login as admin", async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test("[ORG_01] Verify that user can user can create new branch.", async ({ page }) => {
    // Create a branch
    await page.getByRole("button", { name: "Organisation" }).click();
    await page.getByRole("link", { name: "Branches" }).click();
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_1.code);
    await page
      .locator("div")
      .filter({ hasText: /^New branch$/ })
      .nth(1)
      .click();
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_1.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill(data.branch_1.phone);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Assertion
    await expect(page.getByText("Branch created")).toBeVisible();
    await page.reload({ waitUntil: "load" });
    await expect(page.getByRole("cell", { name: data.branch_1.name })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("cell", { name: data.branch_1.code, exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.city })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.country })).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_02] Verify that user can edit branch details.", async ({ page }) => {
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
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

    await expect(page.getByRole("cell", { name: "test" }).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("cell", { name: "test" }).nth(1)).toBeVisible();
    await expect(page.getByRole("cell", { name: "test" }).nth(2)).toBeVisible();
    await expect(page.getByRole("cell", { name: "test" }).nth(3)).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_2.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_2.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_2.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_2.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_2.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill(data.branch_2.phone);
    await page.getByRole("button", { name: "Save changes" }).click();

    // Assertion
    await expect(page.getByRole("cell", { name: data.branch_2.name })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("cell", { name: data.branch_2.code })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_2.city })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_2.country })).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_03] Verify that user can delete branch.", async ({ page }) => {
    await page.getByRole("button", { name: "Organisation" }).click();
    await page.getByRole("link", { name: "Branches" }).click();
    await page.getByRole("button", { name: "New branch" }).click();

    await page.getByRole("textbox", { name: "Name *" }).click();
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

    // Assertion
    await expect(page.getByRole("cell", { name: data.branch_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.code })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.city })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.country })).toBeVisible();

    // Cleanup: Delte the created branch
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_04] Verify that user can search branches by name, code or city.", async ({ page }) => {
    await page.getByRole("button", { name: "Organisation" }).click();
    await page.getByRole("link", { name: "Branches" }).click();
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
    await page.getByRole("textbox", { name: "Search by name, code or city" }).click();
    await page.getByRole("textbox", { name: "Search by name, code or city" }).fill(data.branch_1.name);
    await expect(page.getByRole("cell", { name: data.branch_1.name })).toBeVisible();
    await page.getByRole("textbox", { name: "Search by name, code or city" }).click();
    await page.getByRole("textbox", { name: "Search by name, code or city" }).fill(data.branch_1.code);
    await expect(page.getByRole("cell", { name: data.branch_1.code })).toBeVisible();
    await page.getByRole("textbox", { name: "Search by name, code or city" }).click();
    await page.getByRole("textbox", { name: "Search by name, code or city" }).fill(data.branch_1.city);
    await expect(page.getByRole("cell", { name: data.branch_1.city })).toBeVisible();
    // Cleanup
    await page.getByRole("textbox", { name: "Search by name, code or city" }).click();
    await page.getByRole("textbox", { name: "Search by name, code or city" }).fill("");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_05] Verify that user can create new department.", async ({ page }) => {
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

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.department_1.description);
    await page.getByLabel("Branch").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();
    // Assertion
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.branch })).toBeVisible();
    // Cleanup: Remove department
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_06] Verify that the user can edit department details.", async ({ page }) => {
    // Create a branch
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

    // Create department
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.department_1.description);
    await page.getByLabel("Branch").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();
    // Assertion of CREATE operation
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.description })).toBeVisible();

    // Update the department detail
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_2.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.department_2.description);
    await page.getByRole("button", { name: "Save changes" }).click();
    //
    // Assertion of UPDATE operation
    await expect(page.getByRole("cell", { name: data.department_2.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_2.description })).toBeVisible();
    //
    // Cleanup: Delete department then branch
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_07] Verify that the user can delete department.", async ({ page }) => {
    // Create a branch
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_1.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill(data.branch_1.phone);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Create a department
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.department_1.description);
    await page.getByLabel("Branch").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();
    // Assertion of department CREATE operation
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.name })).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(page.getByText(`${data.department_1.name} moved to trash`)).toBeVisible();
    // Cleanup: remove branch
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_08] Verify that the user can [search] department.", async ({ page }) => {
    // Create a branch
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

    // Create a department
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.department_1.description);
    await page.getByLabel("Branch").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();
    // Assertion of department CREATE operation
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.name })).toBeVisible();

    // Test step
    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page.getByRole("textbox", { name: "Search by name..." }).fill(data.department_1.name);
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.branch_1.name })).toBeVisible();

    // Cleanup: remove department then branch
    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page.getByRole("textbox", { name: "Search by name..." }).fill("");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_09] Verify that departments can be filtered by branch.", async ({ page }) => {
    await page.goto("/dashboard/branches");

    // Create a test_branch1
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
    await page.getByRole("button", { name: "Create branch" }).click();
    // Create a test_branch2
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_2.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_2.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_2.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_2.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_2.address);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Create department 1
    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByLabel("Branch").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();
    await page.getByRole("button", { name: "New department" }).click();

    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_2.name);

    await page.getByLabel("Branch").selectOption({ label: data.department_2.branch });
    await page.getByRole("button", { name: "Create department" }).click();

    // Filter department by branch
    await page.getByRole("combobox").selectOption({ label: data.department_1.branch });
    // Assertion on filtered result
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.branch })).toBeVisible();
    // Filter department by branch
    await page.getByRole("combobox").selectOption({ label: data.department_2.branch });
    // Assertion on filtered result
    await expect(page.getByRole("cell", { name: data.department_2.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_2.branch })).toBeVisible();

    // Reset the filter for cleanup
    await page.getByRole("combobox").selectOption("");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_10] Verify that user can create new designation.", async ({ page }) => {
    // Create a branch
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_1.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_1.address);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Create a department
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("combobox").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();

    // Create designation
    await page.goto("/dashboard/designations");
    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.designation_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.designation_1.description);


    await page.getByRole("combobox").selectOption({ label: data.designation_1.department });
    await page.getByRole("button", { name: "Create designation" }).click();
    // Assertion on CREATE operation of designation
    await expect(page.getByRole("cell", { name: data.designation_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.designation_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();

    // Cleanup
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "Move to trash" }).first().click();

    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_11] Verify that the user can edit designation details.", async ({ page }) => {
    // Create a branch 1
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_1.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_1.address);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Create branch 2
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_2.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_2.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_2.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_2.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_2.address);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Create a department 1
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("combobox").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();

    // Create a department 2
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_2.name);
    await page.getByRole("combobox").selectOption({ label: data.department_2.branch });
    await page.getByRole("button", { name: "Create department" }).click();

    // Create a desgination
    await page.goto("/dashboard/designations");
    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.designation_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.designation_1.description);
    await page.getByRole("combobox").selectOption({ label: data.designation_1.department });
    await page.getByRole("button", { name: "Create designation" }).click();

    // Assert on CREATE operation of designation
    await expect(page.getByRole("cell", { name: data.designation_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.designation_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();

    // Perform the actual test
    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.designation_2.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.designation_2.description);
    await page.getByRole("combobox").selectOption({ label: data.designation_2.department });
    await page.getByRole("button", { name: "Save changes" }).click();

    // Assertion on UPDATE operation of designation
    await expect(page.getByRole("cell", { name: data.designation_2.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.designation_2.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_2.name })).toBeVisible();

    // Clean up
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_12] Verify that the user can delete designation.", async ({ page }) => {
    // Create a branch
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill(data.branch_1.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill(data.branch_1.address);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Create a department
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.department_1.name);
    await page.getByRole("combobox").selectOption({ label: data.department_1.branch });
    await page.getByRole("button", { name: "Create department" }).click();

    // Creat a department
    await page.goto("/dashboard/designations");
    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill(data.designation_1.name);
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill(data.designation_1.description);
    await page.getByRole("combobox").selectOption({ label: data.designation_1.department });
    await page.getByRole("button", { name: "Create designation" }).click();

    // Assertion on CREATE operation of desgination
    await expect(page.getByRole("cell", { name: data.designation_1.name })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.designation_1.description })).toBeVisible();
    await expect(page.getByRole("cell", { name: data.department_1.name })).toBeVisible();

    // Test step
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    // Assertion on DELETE operation of designation
    await expect(page.getByText(`${data.designation_1.name} moved to trash`)).toBeVisible();

    // Cleanup
    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_13] Verify that the user can [search] designation.", async ({ page }) => {
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department");

    await page.getByRole("combobox").selectOption({ label: "test_branch" });

    await page.getByRole("button", { name: "Create department" }).click();

    await page.goto("/dashboard/designations");

    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_designation");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page.getByRole("textbox", { name: "Description" }).fill("test_description");
    await page.getByRole("combobox").selectOption({ label: "test_department — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();

    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page.getByRole("textbox", { name: "Search by name..." }).fill("test_designation");
    await expect(page.getByRole("cell", { name: "test_designation" })).toBeVisible();

    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page.getByRole("textbox", { name: "Search by name..." }).fill("");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_14] Verify that the filter on the right side of [search] bar works.", async ({ page }) => {
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code");
    await page
      .locator("div")
      .filter({ hasText: /^New branch$/ })
      .nth(1)
      .click();
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("98888888888");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department1");
    await page.getByRole("combobox").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();
    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department2");
    await page.getByRole("combobox").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();

    await page.goto("/dashboard/designations");

    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_designation1");
    await page.getByRole("combobox").selectOption({ label: "test_department1 — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();

    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_designation2");
    //
    // assertion
    await page.getByRole("combobox").selectOption({ label: "test_department2 — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();

    await page.getByRole("combobox").selectOption({ label: "test_department1 — test_branch" });

    await expect(page.getByRole("cell", { name: "test_designation1" })).toBeVisible();

    await page.getByRole("combobox").selectOption({ label: "test_department2 — test_branch" });

    await expect(page.getByRole("cell", { name: "test_designation2" })).toBeVisible();

    await page.getByRole("combobox").selectOption("");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/departments");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });
});

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

  test("[ORG_01] Verify that user can user can create new branch.", async ({
    page,
  }) => {
    // Create a branch
    await page.getByRole("button", { name: "Organisation" }).click();
    await page.getByRole("link", { name: "Branches" }).click();
    await page.getByRole("button", { name: "New branch" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page
      .getByRole("textbox", { name: "Code *" })
      .fill(data.branch_1.code);
    await page
      .locator("div")
      .filter({ hasText: /^New branch$/ })
      .nth(1)
      .click();
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page
      .getByRole("textbox", { name: "Country" })
      .fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page
      .getByRole("textbox", { name: "Address" })
      .fill(data.branch_1.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page
      .getByRole("textbox", { name: "Phone" })
      .fill(data.branch_1.phone);
    await page.getByRole("button", { name: "Create branch" }).click();

    // Assertion
    await expect(page.getByText("Branch created")).toBeVisible();
    await page.reload({ waitUntil: "load" });
    await expect(
      page.getByRole("cell", { name: data.branch_1.name }),
    ).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("cell", { name: data.branch_1.code, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: data.branch_1.city }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: data.branch_1.country }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test.only("[ORG_02] Verify that user can edit branch details.", async ({
    page,
  }) => {
    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill(data.branch_1.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page
      .getByRole("textbox", { name: "Code *" })
      .fill(data.branch_1.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_1.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page
      .getByRole("textbox", { name: "Country" })
      .fill(data.branch_1.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page
      .getByRole("textbox", { name: "Address" })
      .fill(data.branch_1.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page
      .getByRole("textbox", { name: "Phone" })
      .fill(data.branch_1.phone);
    await page.getByRole("button", { name: "Create branch" }).click();

    await expect(page.getByRole("cell", { name: "test" }).first()).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("cell", { name: "test" }).nth(1)).toBeVisible();
    await expect(page.getByRole("cell", { name: "test" }).nth(2)).toBeVisible();
    await expect(page.getByRole("cell", { name: "test" }).nth(3)).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill(data.branch_2.name);
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page
      .getByRole("textbox", { name: "Code *" })
      .fill(data.branch_2.code);
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill(data.branch_2.city);
    await page.getByRole("textbox", { name: "Country" }).click();
    await page
      .getByRole("textbox", { name: "Country" })
      .fill(data.branch_2.country);
    await page.getByRole("textbox", { name: "Address" }).click();
    await page
      .getByRole("textbox", { name: "Address" })
      .fill(data.branch_2.address);
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page
      .getByRole("textbox", { name: "Phone" })
      .fill(data.branch_2.phone);
    await page.getByRole("button", { name: "Save changes" }).click();

    // Assertion
    await expect(
      page.getByRole("cell", { name: data.branch_2.name }),
    ).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByRole("cell", { name: data.branch_2.code }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: data.branch_2.city }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: data.branch_2.country }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_03] Verify that user can delete branch.", async ({ page }) => {
    await page.getByRole("button", { name: "Organisation" }).click();
    await page.getByRole("link", { name: "Branches" }).click();
    await page.getByRole("button", { name: "New branch" }).click();

    await page.getByRole("textbox", { name: "Name *" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("deleting_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("deleting_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("d");
    await page.getByRole("textbox", { name: "City" }).fill("deleting_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("d");
    await page
      .getByRole("textbox", { name: "Country" })
      .fill("deleting_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page
      .getByRole("textbox", { name: "Address" })
      .fill("deleting_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("988888888888");
    await page.getByRole("button", { name: "Create branch" }).click();

    await expect(
      page.getByRole("cell", { name: "deleting_branch" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "deleting_code" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "deleting_city" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "deleting_country" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_04] Verify that user can search branches by name, code or city.", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Organisation" }).click();
    await page.getByRole("link", { name: "Branches" }).click();
    await page.getByRole("button", { name: "New branch" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("searching_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("searching_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("searching_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page
      .getByRole("textbox", { name: "Country" })
      .fill("searching_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page
      .getByRole("textbox", { name: "Address" })
      .fill("searching_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("searching_phone");
    await page.getByRole("button", { name: "Create branch" }).click();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .click();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .fill("searching_branch");
    await expect(
      page.getByRole("cell", { name: "searching_branch" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .click();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .fill("searching_code");
    await expect(
      page.getByRole("cell", { name: "searching_code" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .click();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .fill("searching_city");
    await expect(
      page.getByRole("cell", { name: "searching_city" }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .click();
    await page
      .getByRole("textbox", { name: "Search by name, code or city" })
      .fill("");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_05] Verify that user can create new department.", async ({
    page,
  }) => {
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("9888888888");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page.getByLabel("Branch").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "test_branch" })).toBeVisible();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_06] Verify that the user can edit department details.", async ({
    page,
  }) => {
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("9888888888");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page.getByLabel("Branch").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("updated_department_name");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("updated_description");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(
      page.getByRole("cell", { name: "updated_department_name" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "updated_description" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_07] Verify that the user can delete department.", async ({
    page,
  }) => {
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("9888888888");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page.getByLabel("Branch").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "test_branch" })).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
    await expect(
      page.getByText("test_department moved to trash"),
    ).toBeVisible();

    await page.goto("/dashboard/branches");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_08] Verify that the user can [search] department.", async ({
    page,
  }) => {
    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("textbox", { name: "Phone" }).fill("9888888888");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_department");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page.getByLabel("Branch").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "test_branch" })).toBeVisible();

    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page
      .getByRole("textbox", { name: "Search by name..." })
      .fill("test_department");
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "test_branch" })).toBeVisible();

    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page.getByRole("textbox", { name: "Search by name..." }).fill("");
    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_09] Verify that the filter on the right side of [search] bar works.", async ({
    page,
  }) => {
    await page.goto("/dashboard/branches");

    // Create a test_branch1
    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch1");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code1");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_code2");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address");
    await page.getByRole("textbox", { name: "Phone" }).click();
    await page.getByRole("button", { name: "Create branch" }).click();
    // Create a test_branch1

    await page.getByRole("button", { name: "New branch" }).click();
    await page.getByRole("textbox", { name: "Name *" }).fill("test_branch2");
    await page.getByRole("textbox", { name: "Code *" }).click();
    await page.getByRole("textbox", { name: "Code *" }).fill("test_code2");
    await page.getByRole("textbox", { name: "City" }).click();
    await page.getByRole("textbox", { name: "City" }).fill("test_city2");
    await page.getByRole("textbox", { name: "Country" }).click();
    await page.getByRole("textbox", { name: "Country" }).fill("test_country2");
    await page.getByRole("textbox", { name: "Address" }).click();
    await page.getByRole("textbox", { name: "Address" }).fill("test_address2");
    await page.getByRole("button", { name: "Create branch" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "New department" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_department1");
    await page.getByLabel("Branch").selectOption({ label: "test_branch1" });
    await page.getByRole("button", { name: "Create department" }).click();
    await page.getByRole("button", { name: "New department" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_department2");
    await page.getByLabel("Branch").selectOption({ label: "test_branch2" });
    await page.getByRole("button", { name: "Create department" }).click();

    await page.getByRole("combobox").selectOption({ label: "test_branch1" });
    await expect(
      page.getByRole("cell", { name: "test_department1" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_branch1" }),
    ).toBeVisible();
    await page.getByRole("combobox").selectOption({ label: "test_branch2" });
    await expect(
      page.getByRole("cell", { name: "test_department2" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_branch2" }),
    ).toBeVisible();

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

  test("[ORG_10] Verify that user can create new designation.", async ({
    page,
  }) => {
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
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_designation");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();
    await expect(
      page.getByRole("cell", { name: "test_designation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_11] Verify that the user can edit designation details.", async ({
    page,
  }) => {
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
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_designation");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();
    await expect(
      page.getByRole("cell", { name: "test_designation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("updated_test_designation");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("updated_test_description");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(
      page.getByRole("cell", { name: "updated_test_designation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "updated_test_description" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_12] Verify that the user can delete designation.", async ({
    page,
  }) => {
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
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_designation");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();
    await expect(
      page.getByRole("cell", { name: "test_designation" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_description" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "test_department" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await expect(page.getByText("test_designation moved to")).toBeVisible();

    await page.goto("/dashboard/departments");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();

    await page.goto("/dashboard/branches");

    await page.getByRole("button", { name: "Move to trash" }).first().click();
    await page.getByRole("button", { name: "Move to trash" }).click();
  });

  test("[ORG_13] Verify that the user can [search] designation.", async ({
    page,
  }) => {
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
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_designation");
    await page.getByRole("textbox", { name: "Description" }).click();
    await page
      .getByRole("textbox", { name: "Description" })
      .fill("test_description");
    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();

    await page.getByRole("textbox", { name: "Search by name..." }).click();
    await page
      .getByRole("textbox", { name: "Search by name..." })
      .fill("test_designation");
    await expect(
      page.getByRole("cell", { name: "test_designation" }),
    ).toBeVisible();

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

  test("[ORG_14] Verify that the filter on the right side of [search] bar works.", async ({
    page,
  }) => {
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
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_department1");
    await page.getByRole("combobox").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();
    await page.getByRole("button", { name: "New department" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_department2");
    await page.getByRole("combobox").selectOption({ label: "test_branch" });
    await page.getByRole("button", { name: "Create department" }).click();

    await page.goto("/dashboard/designations");

    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_designation1");
    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department1 — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();

    await page.getByRole("button", { name: "New designation" }).click();
    await page.getByRole("textbox", { name: "Name *" }).click();
    await page
      .getByRole("textbox", { name: "Name *" })
      .fill("test_designation2");
    //
    // assertion
    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department2 — test_branch" });
    await page.getByRole("button", { name: "Create designation" }).click();

    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department1 — test_branch" });

    await expect(
      page.getByRole("cell", { name: "test_designation1" }),
    ).toBeVisible();

    await page
      .getByRole("combobox")
      .selectOption({ label: "test_department2 — test_branch" });

    await expect(
      page.getByRole("cell", { name: "test_designation2" }),
    ).toBeVisible();

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

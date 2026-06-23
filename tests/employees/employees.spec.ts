import { test, expect } from "@playwright/test";
import { login } from "../../utils/login";

test.describe.skip("Employees module", async () => {
  test.beforeAll(
    "Create a branch, two department and two designations",
    async () => {
      // await page.goto('');
    },
  );

  test.beforeEach("Login as admin", async ({ page }) => {
    await login(page);
  });

  test.afterEach(async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test.only("[EMP_01] Verify that user can create new employee.", async ({
    page,
  }) => {});
  test("[EMP_02] Verify that the search works.", async ({ page }) => {});
  test("[EMP_03] Verify that filter [statuses], [branches], [departments] and [designations] works.", async ({
    page,
  }) => {});
  test("[EMP_04] Verify that the user can edit employee details.", async ({
    page,
  }) => {});
  test("[EMP_05] Verify that the user can delete employee.", async ({
    page,
  }) => {});
  test("[EMP_06] Verify that the user can view employee details.", async ({
    page,
  }) => {});
  test("[EMP_07] Verify that the org chart shows employee hierarchy correctly.", async ({
    page,
  }) => {});
  test("[EMP_08] Verify that the user can view profile change requests.", async ({
    page,
  }) => {});
});

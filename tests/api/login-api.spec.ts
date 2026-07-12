import { expect, test } from '@playwright/test';
import data from "../../fixture/data.json";
import path from "path"

const csrfStorageFile = path.join(__dirname, "../../playwright/.auth/csrf-storage-state.json")
const superAdminStorageFile = path.join(__dirname, "../../playwright/.auth/super-admin-storage-state.json")
const adminStorageFile = path.join(__dirname, "../../playwright/.auth/admin-storage-state.json")
const employeeStorageFile = path.join(__dirname, "../../playwright/.auth/employee-storage-state.json")

let csrfToken: string | undefined

test.describe("Login with api", async () => {

    test.describe.configure({ mode: "serial" });

    test("Get csrf", async ({ request }) => {

        const csrfResponse = await request.get("/v1/auth/csrf-token")
        expect(csrfResponse.ok()).toBeTruthy()

        csrfToken = csrfResponse.headers()["set-cookie"].split(";").find((element) => element.split("=").includes("XSRF-TOKEN"))?.split("=")[1]

        // Save the storage state in a file
        await request.storageState({ path: csrfStorageFile })

    })

    test.describe("", async () => {
        test.use({ storageState: csrfStorageFile })

        test("Login with API as Super Admin", async ({ request }) => {
            const superAdminLoginResponse = await request.post("/v1/auth/login", {
                data: {
                    email: data.role.super_admin.email,
                    password: data.role.super_admin.password
                },
                headers: {
                    "x-xsrf-token": csrfToken as string
                }
            })
            expect(superAdminLoginResponse.ok()).toBeTruthy()
            // Save the storage state in a file
            await request.storageState({ path: superAdminStorageFile })

        })

        test("Login with API as Admin", async ({ request }) => {
            const adminLoginResponse = await request.post("/v1/auth/login", {
                data: {
                    email: data.role.admin.email,
                    password: data.role.admin.password
                },
                headers: {
                    "x-xsrf-token": csrfToken as string
                }
            })
            expect(adminLoginResponse.ok()).toBeTruthy()
            // Save the storage state in a file
            await request.storageState({ path: adminStorageFile })

        })

        test.skip("Login with API as Employee", async ({ request }) => {
            const employeeLoginResponse = await request.post("/v1/auth/login", {
                data: {
                    email: data.role.employee.email,
                    password: data.role.employee.password
                },
                headers: {
                    "x-xsrf-token": csrfToken as string
                }
            })
            expect(employeeLoginResponse.ok()).toBeTruthy()
            // Save the storage state in a file
            await request.storageState({ path: employeeStorageFile })

        })

    })


})
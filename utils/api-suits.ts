import { APIRequestContext, BrowserContext, APIResponse } from "@playwright/test"

export async function getCsrfToken(context: BrowserContext): Promise<string> {
    const cookies = await context.cookies()
    let csrfToken: string = "fallback value"

    cookies.forEach((element) => {
        if (element.name === "XSRF-TOKEN") {
            csrfToken = element.value
        }
    })

    return csrfToken
}

export async function createBranch(request: APIRequestContext, payload: object, csrfToken: string): Promise<APIResponse> {
    // Return the response object directly
    return await request.post("/v1/branches", {
        data: payload,
        headers: {
            "x-xsrf-token": csrfToken
        }
    })
}

export async function createDepartment(request: APIRequestContext, payload: object, csrfToken: string): Promise<APIResponse> {
    // Return the response object directly
    return await request.post("/v1/departments", {
        data: payload,
        headers: {
            "x-xsrf-token": csrfToken
        }
    })
}

export async function createDesignation(request: APIRequestContext, payload: object, csrfToken: string): Promise<APIResponse> {
    // Return the response object directly
    return await request.post("/v1/designations", {
        data: payload,
        headers: {
            "x-xsrf-token": csrfToken
        }
    })
}

export async function deleteDesignation(request: APIRequestContext, designation_id: string, csrfToken: string) {
    return await request.delete(`/v1/designations/${designation_id}`, {
        headers: {
            "x-xsrf-token": csrfToken
        }
    })
}

export async function deleteDepartment(request: APIRequestContext, department_id: string, csrfToken: string) {
    return await request.delete(`/v1/departments/${department_id}`, {
        headers: {
            "x-xsrf-token": csrfToken
        }
    })
}

export async function deleteBranch(request: APIRequestContext, branch_id: string, csrfToken: string) {
    return await request.delete(`/v1/branches/${branch_id}`, {
        headers: {
            "x-xsrf-token": csrfToken
        }
    })
}



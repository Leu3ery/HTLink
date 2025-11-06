export function makeCreateProjectPayload(overrides: Record<string, any> = {}) {
    const oneWeekFromNowIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Ensure unique title per call to avoid cross-test interference
    const uniqueSuffix = Math.random().toString(36).slice(2, 6);

    const base = {
        title: "Test Project " + uniqueSuffix,
        category: "Web development",
        shortDescription: "A short description for the test project.",
        fullReadme: "# Readme\n\nDetailed info about the test project.",
        deadline: oneWeekFromNowIso,
        skills: ["Express Js", "Angular"]
    };

    return { ...base, ...overrides };
}

export const validCreateProjectPayload = () => makeCreateProjectPayload();
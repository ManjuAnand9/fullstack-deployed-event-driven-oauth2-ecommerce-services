import { useEffect, useState } from "react";

import { saveTokens } from "../services/authservice";

const API_GATEWAY =
    import.meta.env.VITE_API_GATEWAY ||
    "http://localhost:8081";

const wait = (milliseconds) =>
    new Promise((resolve) =>
        setTimeout(resolve, milliseconds)
    );

export default function AuthCallback() {
    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        async function syncCustomer(accessToken) {
            const maxAttempts = 3;

            for (
                let attempt = 1;
                attempt <= maxAttempts;
                attempt++
            ) {
                const response = await fetch(
                    `${API_GATEWAY}/CUSTOMER-SERVICE/customers/me/sync`,
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${accessToken}`
                        }
                    }
                );

                if (response.ok) {
                    return response.json();
                }

                const errorText =
                    await response.text();

                const retryableStatuses = [
                    502,
                    503,
                    504
                ];

                const shouldRetry =
                    retryableStatuses.includes(
                        response.status
                    ) &&
                    attempt < maxAttempts;

                if (!shouldRetry) {
                    throw new Error(
                        `Customer sync failed: ${response.status} ${errorText}`
                    );
                }

                await wait(3000);
            }
        }

        async function finishSocialLogin() {
            try {
                const params =
                    new URLSearchParams(
                        window.location.search
                    );

                const code =
                    params.get("code");

                const codeVerifier =
                    sessionStorage.getItem(
                        "pkce_code_verifier"
                    );

                if (!code || !codeVerifier) {
                    throw new Error(
                        "Missing authorization code or PKCE verifier"
                    );
                }

                const response = await fetch(
                    `${API_GATEWAY}/auth/social-callback`
                    + `?code=${encodeURIComponent(code)}`
                    + `&codeVerifier=${encodeURIComponent(codeVerifier)}`,
                    {
                        method: "POST"
                    }
                );

                if (!response.ok) {
                    const text =
                        await response.text();

                    throw new Error(
                        `Social login failed: ${response.status} ${text}`
                    );
                }

                const tokens =
                    await response.json();

                const customer =
                    await syncCustomer(
                        tokens.access_token
                    );

                console.log(
                    "SOCIAL CUSTOMER SYNCED:",
                    customer
                );

                // Save login only after customer sync succeeds
                saveTokens(tokens);

                sessionStorage.removeItem(
                    "pkce_code_verifier"
                );

                window.location.href = "/";
            } catch (error) {
                console.error(
                    "SOCIAL LOGIN CALLBACK FAILED:",
                    error
                );

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Social login failed"
                );
            }
        }

        finishSocialLogin();
    }, []);

    return (
        <div style={{ padding: "40px" }}>
            {errorMessage
                ? `Sign-in failed: ${errorMessage}`
                : "Signing you in..."}
        </div>
    );
}
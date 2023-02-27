import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { DependencyList, useCallback, useEffect, useState } from 'react'

import { kratos } from './kratos'

// original source: https://github.com/ory/elements/blob/a340041ccdefecd24e860ecdfb47546862b15fc7/examples/nextjs-spa/src/pkg/hooks.tsx#L7-L80
export function HandleError(): (err: AxiosError) => Promise<void> {
    const router = useRouter()

    return useCallback(
        (error: AxiosError): Promise<void> => {
            console.log(`HandleError hook: ${JSON.stringify(error.response)}`)

            if (!error.response || error.response?.status === 0) {
                window.location.href = `/error?error=${encodeURIComponent(JSON.stringify(error.response))}`
                return Promise.resolve()
            }

            if (error.response.data?.error) {
                // handle specific error ids here
                switch (error.response.data?.error.id) {
                    case 'session_aal2_required':
                        return router
                            .push({
                                pathname: '/login',
                                query: {
                                    aal: 'aal2'
                                }
                            })
                            .then(noop)
                    case 'session_already_available':
                        return router.push('/').then(noop)
                    case 'session_refresh_required':
                        return router
                            .push({
                                pathname: '/login',
                                query: {
                                    refresh: true,
                                    returnTo: router.pathname
                                }
                            })
                            .then(noop)
                    case 'self_service_flow_return_to_forbidden':
                    // the flow expired, so just reload the page without the flow id
                    case 'self_service_flow_expired':
                        // the flow expired, so just reload the page without the flow id
                        return router.push(router.pathname).then(noop)
                }
            }

            switch (error.response?.status) {
                // this could be many things, such as the session exists
                case 400:
                    return Promise.reject(error)
                case 404:
                    // The flow data could not be found. Let's just redirect to the error page!
                    window.location.href = `/error?error=${encodeURIComponent(JSON.stringify(error.response))}`
                    return Promise.resolve()
                // we need to parse the response and follow the `redirect_browser_to` URL
                // this could be when the user needs to perform a 2FA challenge
                // or password less login
                case 422:
                // we have no session or the session is invalid
                // we should redirect the user to the login page
                // don't handle it here, return the error so the caller can handle it
                case 401:
                    return Promise.reject(error)
                case 410:
                    // Status code 410 means the request has expired - so let's load a fresh flow!
                    return router.push(router.pathname).then(noop)
                default:
                    // The flow could not be fetched due to e.g. network or server issues. Let's reload the page!
                    // This will trigger the useEffect hook again, and we will try to fetch the flow again.
                    return Promise.resolve(router.reload())
            }
        },
        [router]
    )
}

// original source: https://github.com/ory/elements/blob/a340041ccdefecd24e860ecdfb47546862b15fc7/examples/nextjs-spa/src/pkg/hooks.tsx#L83-L112
export function LogoutLink(deps?: DependencyList) {
    const [logoutToken, setLogoutToken] = useState<string | null>(null)
    const [loginRedirect, setLoginRedirect] = useState<boolean>(false)
    const handleError = HandleError()
    const router = useRouter()

    useEffect(() => {
        kratos
            .createBrowserLogoutFlow()
            .then(({ data }) => {
                setLogoutToken(data.logout_token)
            })
            .catch((err: AxiosError) => {
                switch (err.response?.status) {
                    case 401:
                        setLoginRedirect(true)
                        return
                }
            })
            .catch((err: AxiosError) => handleError(err))
    }, deps)

    return () => {
        if (logoutToken) {
            kratos
                .updateLogoutFlow({ token: logoutToken })
                .then(() => router.push('/login'))
                .then(() => router.reload())
        } else if (loginRedirect) {
            router.push('/login').catch(console.error)
        }
    }
}

function noop(): void {}

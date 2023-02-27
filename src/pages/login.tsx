import { LoginFlow, UpdateLoginFlowBody } from '@ory/client'
import { UserAuthCard } from '@ory/elements'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'

import Layout from '../components/layout'
import { HandleError } from '../lib/hooks'
import { kratos } from '../lib/kratos'

// original source: https://github.com/ory/elements/blob/a340041ccdefecd24e860ecdfb47546862b15fc7/examples/nextjs-spa/src/pages/login.tsx#L22-L144
export default function Login() {
    const [flow, setFlow] = useState<LoginFlow | null>(null)
    const handleError = HandleError()
    const router = useRouter()

    const returnTo = router.query.return_to ? String(router.query.return_to) : undefined
    const flowId = router.query.flow ? String(router.query.flow) : undefined
    const loginChallenge = router.query.login_challenge ? String(router.query.login_challenge) : undefined

    // Refresh means we want to refresh the session. This is needed, for example, when we want to update the password
    // of a user.
    const refresh = Boolean(router.query.refresh)

    // AAL = Authorization Assurance Level. This implies that we want to upgrade the AAL, meaning that we want
    // to perform two-factor authentication/verification.
    const aal = String(router.query.aal || '')

    const getLoginFlow = useCallback(
        (id: string) =>
            // If ?flow=.. was in the URL, we fetch it
            kratos
                .getLoginFlow({ id })
                .then(({ data }) => {
                    setFlow(data)
                })
                .catch((error: AxiosError) => handleError(error)),
        [handleError]
    )

    const createFlow = useCallback(
        (refresh: boolean, aal: string, returnTo?: string) =>
            kratos
                .createBrowserLoginFlow({
                    aal,
                    loginChallenge,
                    refresh,
                    returnTo
                })
                .then(({ data }) => {
                    setFlow(data)
                    return router.push(`/login?flow=${data.id}`, undefined, { shallow: true })
                })
                .catch((error: AxiosError) => handleError(error)),
        [handleError, router]
    )

    useEffect(() => {
        if (!router.isReady) {
            return
        }

        if (flowId) {
            getLoginFlow(flowId).catch(
                (err: AxiosError) => err.response?.status === 410 ?? createFlow(refresh, aal, returnTo)
            ) // if for some reason the flow has expired, we need to get a new one
            return
        }

        // Otherwise we initialize it
        createFlow(refresh, aal, returnTo).catch(console.error)
    }, [createFlow, getLoginFlow, refresh, aal, returnTo, flowId, router.isReady])

    const submitFlow = (values: UpdateLoginFlowBody) =>
        kratos
            .updateLoginFlow({
                flow: String(flow?.id),
                updateLoginFlowBody: values
            })
            // We logged in successfully! Let's bring the user home.
            .then(() => {
                if (flow?.return_to) {
                    window.location.href = flow?.return_to
                    return
                }

                router.push('/').catch(console.error)
            })
            .catch((err: AxiosError) => handleError(err))
            .catch((err: AxiosError) => {
                switch (err.response?.status) {
                    // If the previous handler did not catch the error it's most likely a form validation error
                    case 400:
                        // Yup, it is!
                        setFlow(err.response?.data)
                        break
                    case 422:
                        // get new flow data based on the flow id in the redirect url
                        const flow = new URLSearchParams(err.response.data.redirect_browser_to).get('flow') || ''
                        // add the new flow id to the URL
                        router
                            .push(`/login${flow ? `?flow=${flow}` : ''}`, undefined, {
                                shallow: true
                            })
                            .catch(console.error)
                        break
                    default:
                        return Promise.reject(err)
                }
            })

    return (
        <Layout>
            {flow ? (
                // create a login form that dynamically renders based on the flow data using Ory Elements
                <UserAuthCard
                    cardImage="/ory.svg"
                    title="Login"
                    // This defines what kind of card we want to render.
                    flowType="login"
                    // we always need the flow data which populates the form fields and error messages dynamically
                    flow={flow}
                    // the login card should allow the user to go to the registration page and the recovery page
                    additionalProps={{
                        loginURL: '/login',
                        signupURL: '/registration'
                    }}
                    // we might need webauthn support which requires additional js
                    includeScripts={true}
                    // we submit the form data to Ory
                    onSubmit={({ body }) => submitFlow(body as UpdateLoginFlowBody)}
                />
            ) : (
                <div>Loading...</div>
            )}
        </Layout>
    )
}

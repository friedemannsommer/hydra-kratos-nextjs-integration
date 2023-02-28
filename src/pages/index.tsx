import { Session } from '@ory/client'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import styles from '../styles/home.module.css'

import Layout from '../components/layout'
import { HandleError, KratosErrorResponse } from '../lib/hooks'
import { kratos } from '../lib/kratos'

export default function Home(): ReactElement {
    const router = useRouter()
    const [session, setSession] = useState<Session>()
    const handleError = HandleError()

    useEffect(() => {
        if (!session) {
            kratos
                .toSession()
                .then(({ data }) => {
                    setSession(data)
                })
                .catch((err: AxiosError<KratosErrorResponse>) => handleError(err))
                .catch(() => {
                    router.push('/login').catch(console.error)
                })
        }
    }, [handleError, router, session])

    return (
        <Layout>
            {session ? (
                <main className={styles.main}>
                    <h2>Home</h2>
                    <h3>Session Information</h3>
                    <code className={styles.sessionDisplay}>
                        <pre>{JSON.stringify(session, undefined, 2)}</pre>
                    </code>
                </main>
            ) : (
                <div>Loading...</div>
            )}
        </Layout>
    )
}

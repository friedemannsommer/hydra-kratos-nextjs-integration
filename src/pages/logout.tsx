import { ReactElement, useEffect } from 'react'

import Layout from '../components/layout'
import { LogoutLink } from '../lib/hooks'

// original source: https://github.com/ory/elements/blob/main/examples/nextjs-spa/src/pages/logout.tsx#L5-L13
export default function Logout(): ReactElement {
    const onLogout = LogoutLink()

    useEffect(() => {
        onLogout()
    }, [onLogout])

    return (
        <Layout>
            <div>Loading</div>
        </Layout>
    )
}

import { ThemeProvider } from '@ory/elements'
import Link from 'next/link'
import React, { PropsWithChildren } from 'react'

import styles from '../styles/layout.module.css'

// original source: https://github.com/ory/elements/blob/a340041ccdefecd24e860ecdfb47546862b15fc7/examples/nextjs-spa/src/components/layout.tsx#L8-L62
export default function Layout({ children }: PropsWithChildren) {
    return (
        <ThemeProvider theme="dark">
            <div className={styles.mainContainer}>
                <nav role="navigation" className={styles.mainNavigation}>
                    <h1>Hydra + Kratos example</h1>
                    <ul>
                        <li>
                            <Link href="/">Home</Link>
                        </li>
                        <li>
                            <Link href="/login">Login</Link>
                        </li>
                        <li>
                            <Link href="/registration">Register</Link>
                        </li>
                        <li>
                            <Link href="/logout">Logout</Link>
                        </li>
                    </ul>
                </nav>
                <section className={styles.content}>{children}</section>
            </div>
        </ThemeProvider>
    )
}

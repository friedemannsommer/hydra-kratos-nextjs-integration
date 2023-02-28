import '@ory/elements/assets/normalize.css'
import '@ory/elements/style.css'
import type { AppProps } from 'next/app'
import { ReactElement } from 'react'

import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps): ReactElement {
    return <Component {...pageProps} />
}

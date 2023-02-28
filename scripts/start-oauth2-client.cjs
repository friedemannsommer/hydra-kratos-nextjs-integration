const {spawn} = require('node:child_process')
const {request} = require('node:http')
const path = require('node:path')

function createHydraClient(callback) {
    const req = request('http://127.0.0.1:5445/admin/clients', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        }
    }, (res) => {
        // documentation says 201, but it's 200
        if (res.statusCode !== 200 && res.statusCode !== 201) {
            console.error('failed to create Hydra client, http status:', res.statusCode)
            process.exit(1)
        }

        const chunks = []

        res.on('data', (chunk) => {
            chunks.push(chunk)
        })

        res.once('error', (err) => {
            console.error('error while trying to receive response from Hydra', err)
            process.exit(1)
        })

        res.once('end', () => {
            const jsonText = Buffer.concat(chunks).toString('utf-8')
            let result

            try {
                result = JSON.parse(jsonText)
            } catch (err) {
                console.error('failed to parse JSON response', err)
                process.exit(1)
            }

            callback(result)
        })
    })

    req.once('error', (err) => {
        console.error('error while trying to request Hydra', err)
        process.exit(1)
    })

    req.write(JSON.stringify({
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code', 'id_token'],
        redirect_uris: ['http://127.0.0.1:5446/callback']
    }))

    req.end()
}

function startOauthClient(credentials) {
    console.log('starting OAuth2 client with clientId: "%s" and clientSecret: "%s"...', credentials.client_id, credentials.client_secret)

    const hydraPerform = spawn('docker-compose', ['exec', 'hydra', 'hydra', 'perform', 'authorization-code', '--client-id', credentials.client_id, '--client-secret', credentials.client_secret, '--endpoint', 'http://127.0.0.1:5444/', '--port', '5446'], {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit',
    })

    hydraPerform.once('error', (err) => {
        console.error('failed to run "docker-compose exec hydra"', err)
        process.exit(1)
    })

    hydraPerform.once('exit', (code) => {
        // exit code null means process couldn't be started, this should already be handled by "error"
        // exit code 130 means process received "CTRL+C" (SIGTERM)
        if (code !== null && code !== 0 && code !== 130) {
            console.error('process "docker-compose exec hydra" exited with:', code)
            process.exit(1)
        }
    })

    process.once('beforeExit', () => {
        if (hydraPerform.connected) {
            hydraPerform.kill('SIGTERM')
        }
    })
}

createHydraClient(startOauthClient)

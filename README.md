This is a [Next.js](https://nextjs.org/) project which _should_ exemplify a problem with the communication
between [Hydra](https://www.ory.sh/hydra/) and [Kratos](https://www.ory.sh/kratos/).

## Requirements

* Docker
* Docker compose
* node >= v14
* npm

## Getting Started

### Setup

1. `$ npm ci`
2. `$ docker-compose up`
3. `$ npm run dev`
4. Open [127.0.0.1:3000/registration](http://127.0.0.1:3000/registration) in the browser of your choice
5. Create a new Kratos identity (valid email format, password with a min length of 6)

## Reproduction steps

1. `$ node scripts/start-oauth2-client.cjs`
2. Open [127.0.0.1:5446](http://127.0.0.1:5446) in the browser of your choice
3. Follow the directions on the website (click "Authorize application")
4. Note that a "Login challenge" will be shown, but the OAuth2 login request data aren't available
5. Sign in with the previously created Kratos identity credentials
6. After a successful sign in you aren't redirect back to Hydra

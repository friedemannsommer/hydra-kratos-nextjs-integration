This is a [Next.js](https://nextjs.org/) project which should exemplify a problem with the communication
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
3. `$ docker-compose exec hydra hydra create client --endpoint http://127.0.0.1:4445 --format json --grant-type authorization_code,refresh_token --response-type code,id_token --redirect-uri http://127.0.0.1:5446/callback` (
   note `client_id` and `client_secret`)
4. `$ npm run dev`
5. Open [127.0.0.1:3000/registration](http://127.0.0.1:3000/registration) in the browser of your choice
6. Create a new Kratos identity (valid email format, password with a min length of 6)

## Reproduction steps

1. `$ docker-compose exec hydra hydra perform authorization-code --client-id $client_id --client-secret $client_secret --endpoint http://127.0.0.1:5444/ --port 5446`
2. Open [127.0.0.1:5446](http://127.0.0.1:5446) in the browser of your choice
3. Follow the directions on the website (click "Authorize application")
4. Sign-in with the previously created Kratos identity credentials
5. TODO

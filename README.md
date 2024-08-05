# external-idp-user-api

[![Build State](https://github.com/LinkedMink/external-idp-user-api/actions/workflows/build-main.yml/badge.svg)](https://github.com/LinkedMink/external-idp-user-api/actions/workflows/build-main.yml)

Verify external ID tokens and allow internal APIs to verify access without knowledge of the identity provider

## Usage

TODO

## Development

### Prerequisites

- NodeJS 20
- Docker

### Getting Started

Install dependencies:

```sh
npm install
```

Initialize development configuration:

```sh
npx external-idp-user-cli dev
```

Create an admin user:

```sh
npx external-idp-user-cli user add developer@mydomain.com !tempPass1
```

Start the server:

```sh
npm run start
```

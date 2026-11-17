# GitTalk

**Your codebase, in conversation.**

GitTalk connects a GitHub repository to a chat interface that can index source
files and answer questions with file citations. The project consists of a
Next.js client and a Spring Boot API backed by PostgreSQL with pgvector.

## Requirements

- Node.js and npm
- Java 17+
- Docker Compose (for local PostgreSQL/pgvector)
- GitHub OAuth app credentials and an OpenAI API key

## Configure credentials

Copy `.env.example` to `.env`, then set the required credentials. Never commit
`.env` or paste credentials into source files.

The backend reads `DATABASE_URL` (defaults to the local Compose database),
`DB_USERNAME`, `DB_PASSWORD`, `OPENAI_API_KEY`, `GITHUB_CLIENT_ID`,
`GITHUB_CLIENT_SECRET`, `TOKEN_ENCRYPTION_PASSWORD`, and
`TOKEN_ENCRYPTOR_SALT`. The salt must be a unique 16-character hexadecimal
value; keep the encryption password and salt stable for as long as encrypted
GitHub tokens need to remain readable.

For local GitHub OAuth, set the callback URL to
`http://localhost:8080/login/oauth2/code/github`. Set `NEXT_PUBLIC_API_BASE_URL`
for the client only when the backend is not available at
`http://localhost:8080`.

## Run locally

From the project root, start the database (Compose reads `DB_PASSWORD` from
the root `.env` file):

```powershell
docker compose --env-file .env -f client/docker-compose.yml up -d
```

In another terminal, load the variables from `.env` into the current PowerShell
process, then start the backend:

```powershell
Get-Content .env | ForEach-Object {
  if ($_ -match '^([^#=]+)=(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
  }
}
cd backend
.\mvnw.cmd spring-boot:run
```

Then start the client:

```powershell
cd client
npm ci
npm run dev
```

Open <http://localhost:3000>.

## Checks

```powershell
cd client
npm run lint
npm run build
```

```powershell
cd backend
.\mvnw.cmd test
```

The backend context test uses an in-memory H2 database and does not require the
local PostgreSQL service.

## Security notes

All production credentials must be provided through environment variables.
If any real credential was previously committed or shared, revoke/rotate it
before publishing this repository. Use HTTPS and secure session cookies in
production, and restrict CORS to the deployed client origin.

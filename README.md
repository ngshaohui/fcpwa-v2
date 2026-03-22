# FCPWA v2

## Install dependencies

```bash
npm i
```

## Development

```bash
npm run dev
```

## Server

Run server on localhost

```bash
uv run fastapi dev main.py
```

Run server on all interfaces

```bash
uv run fastapi run main.py
```

### Cloudflare tunnel

```bash
cloudflared tunnel --url http://localhost:8000
```

## TODO

- download status and progress

## Screens

### Data

- Download dataset from the backend server
- Sync progress data with backend server

### Quiz

- Flipcard style quiz
  - Front displays the cue card
  - Back displays the solution, with a score selection from 0 to 6
  - Review order and score is calculated using sm2 algorithm

### Review

- View all quiz items
- Sort by `active`, `repetitions`, `date`
  - Default sort: `active` asc (active first), `date` asc (oldest first)
  - Priority: `active` > `date` > `repetitions`
  - Fallback to lexicographical cue text when all columns are neutral
- Allow toggle active/inactive

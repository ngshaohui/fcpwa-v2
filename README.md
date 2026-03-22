# FCPWA v2

## Install dependencies

```bash
npm i
```

## Development

```bash
npm run dev
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

# Route List

GET|HEAD / ─────────────────────────────────────────────────────── Closure
POST /api/generate/:id ─────────────────────────────────────── IndexController.index

# Deploy Guide

1. install packages

   ```
   npm i
   ```

1. build

   ```
   npm run build
   ```

1. follow build output instruction
1. clone and update `.env` file on build folder from `.env.example`
1. run `yarn start` on `/build` folder

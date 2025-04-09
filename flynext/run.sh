#!/bin/bash

echo "Starting FlyNext backend server and Prisma Studio..."
npm run dev &

# add a delay to make sure server starts
sleep 3

# start prisma studio in background
npx prisma studio &
 
# keep script running so it doesn't terminate immedietely
wait
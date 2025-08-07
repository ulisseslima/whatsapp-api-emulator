#!/bin/bash
# This script starts the WhatsApp bot server
MYSELF="$(readlink -f "$0")"
MYDIR="${MYSELF%/*}"

# check if this project is already running by checking a node process with the name "whatsapp-bot"
if pgrep -f "whatsapp-bot" > /dev/null; then
  echo "WhatsApp bot is already running"
  exit 1
fi

port=$(cat $MYDIR/.env | grep PORT | cut -d '=' -f2)
nohup npm-start.sh &
pid=$!
echo "Server started with PID $pid"

ngrok.sh --port $port

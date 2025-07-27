#!/bin/bash
# This script starts the WhatsApp bot server
MYSELF="$(readlink -f "$0")"
MYDIR="${MYSELF%/*}"

port=$(cat $MYDIR/.env | grep PORT | cut -d '=' -f2)
nohup npm-start.sh &
pid=$!
echo "Server started with PID $pid"

ngrok.sh --port $port

#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

AMMAN=$DIR/../../node_modules/.bin/amman
cd $DIR

echo "--- Starting Amman to run Minimal IDL Test ---"
$AMMAN start &

sleep 4

node -r esbuild-runner/register --test --test-reporter=spec $DIR/test/minimal-idl.ts

echo "--- Starting Amman to run Large IDL Test ---"
$AMMAN start &

sleep 4

node -r esbuild-runner/register --test --test-reporter=spec $DIR/test/large-idl.ts

echo "--- Stopping Amman ---"
$AMMAN stop

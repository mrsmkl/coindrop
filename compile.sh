#!/bin/sh

mkdir -p compiled

solc --abi --optimize --overwrite --bin -o compiled coindrop.sol


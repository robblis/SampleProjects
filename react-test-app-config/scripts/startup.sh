#!/bin/sh

echo "Hello from $HOSTNAME"
echo "Environment: $ENV"
echo "pwd: $(pwd)"

# Run the node.js script
node scripts/script.js

# Run the update script
if [ -n "${ENV}" ]; then
	node scripts/UpdateConfigFiles.js $(pwd) $(pwd)/scripts/ConfigUpdateVariablesTest.xlsx $ENV
fi

# Start app
npm start

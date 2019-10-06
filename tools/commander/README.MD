# List of commands

* install:all - installs dependencies of the products and shared directories
* compile:all - tsc on all the directories
* build:prod - production build of only the products
* build:all - dev build of the products and shared directories
* test:all - runs `npm run test:clean` on all the products and shared directories
* test:server - runs `npm run test:clean` on the shared, shared-node and server directories
* upgrade-dep:all - runs `npm run upgrade-dep` on all the products and shared directories
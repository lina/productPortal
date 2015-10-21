## Synopsis

A web portal that accepts csv files containing product and testing information to track product quality

## Installation

- Specify postgres user (config.user) and password (config.password) inside config.js at root directory
- Run 'node install' and 'bower install' in command line at the root directory
- Run 'psql' to start PostgresSQl database server
- Run 'psql -U postgres -f server/schema.sql' in command line at the root directory to create PostgresSQL database
- Run "node server/server.js" in command line at the root directory
- Go to "http://localhost:8000" in browser


## Contributors

* Lina Lu 
* Email: linalu001@gmail.com
* Twitter: @thelinalu

## License

MIT

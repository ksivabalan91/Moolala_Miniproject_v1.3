# Databases

## SQL
```
docker run -d --rm --name mysql-container -p 30306:3306 --env-file ./database/sql/.env -v sqldata:/var/lib/mysql ksivabalan91/mysql:231124-2242
```
### Run SQL CMD line
```
docker exec -it mysql-container mysql -u root -p password
```
## Mongo
```
docker run -d --rm --name mongo-container -p 27017:27017 -v mongodata:/data/db mongo
```
### Copy bson file over
```
docker exec -it mongo-container bash
docker cp . mongo-container:/.
mongorestore --db moolala portfolios.bson
```
# Server
```
docker run -d --rm -p 8080:8080 --env-file ./server/.env --name server  ksivabalan91/moolala-server
```
# Client
```
docker run -d --rm -p 3000:80 --name client ksivabalan91/moolala-client:latest
```

# Run all containers in same network

## 1. Create network
```
docker network create moonet
```
## 2. Spin up databases
```
docker run -d --rm --name mysql-container --env-file ./database/sql/.env -v sqldata:/var/lib/mysql --network moonet ksivabalan91/mysql:231124-2242
docker run -d --rm --name mongo-container -v mongodata:/data/db --network moonet mongo
```
## 3. Start server
```
docker run -d --rm -p 8080:8080 --env-file ./server/.env-containerDb --name server --network moonet  ksivabalan91/moolala-server:localDb
```
## 4. Start Client
```
docker run -d --rm -p 3000:80 --name client ksivabalan91/moolala-client:localDb
```


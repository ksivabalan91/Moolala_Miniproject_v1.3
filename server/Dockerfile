# Step 1: Use a base image with Java (Maven or Gradle can also be included if needed for building)
FROM openjdk:17

EXPOSE 8080

WORKDIR /app

COPY target/server.jar server.jar

CMD [ "java","-jar","server.jar" ]
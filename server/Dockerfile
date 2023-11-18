# Step 1: Use a base image with Java (Maven or Gradle can also be included if needed for building)
FROM openjdk:11-jdk as build

# Set the working directory in the Docker image
WORKDIR /app

# Copy the Maven or Gradle configuration files first (for caching)
# This is optional and depends on your project structure and build tool
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download dependencies (also for caching)
RUN ./mvnw dependency:go-offline -B

# Copy the source code
COPY src src

# Build the application
RUN ./mvnw package -DskipTests

# Step 2: Use a smaller JRE base image to run the application
FROM openjdk:11-jre-slim

# Copy the built artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port the application runs on
EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "app.jar"]

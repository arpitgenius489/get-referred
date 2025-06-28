# Use Maven to build the app
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Skip tests for faster build
RUN mvn clean package -DskipTests

# Use a lightweight JRE for running the app
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar ./app.jar
# Expose port 8080
EXPOSE 8080
# Set environment variable for Google credentials (can be overridden)
ENV GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/firebase-service.json
# Run the fat jar
CMD ["java", "-jar", "./app.jar"]

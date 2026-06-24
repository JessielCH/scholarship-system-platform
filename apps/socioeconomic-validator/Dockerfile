FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the compiled JAR file from the target directory
COPY target/socioeconomic-validator-0.0.1-SNAPSHOT.jar app.jar

# Expose the port the app runs on (adjust if your app uses a different port)
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

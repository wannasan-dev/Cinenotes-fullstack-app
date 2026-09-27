FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /build

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src/main/java ./src/main/java
COPY src/main/resources/application.properties ./src/main/resources/application.properties
COPY src/main/resources/application-prod.properties ./src/main/resources/application-prod.properties
COPY src/main/resources/db ./src/main/resources/db

RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]

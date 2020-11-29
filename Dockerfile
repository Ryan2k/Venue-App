ADD openjdk:11
ADD target/photo-share.jar photo-share.jar
EXPOSE 9000
ENTRYPOINT["java", "-jar", "phot-share.jar"]
const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testJavaDetection() {
  mock({
    '/java-project': {
      'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>test-project</artifactId>
  <version>1.0.0</version>
  
  <dependencies>
    <dependency>
      <groupId>com.applitools</groupId>
      <artifactId>eyes-selenium-java5</artifactId>
      <version>5.56.0</version>
    </dependency>
  </dependencies>
</project>`
    }
  });

  try {
    const scanner = new Scanner('/java-project', true);
    const result = await scanner.scan();
    console.log('Java result:', result);
  } catch (error) {
    console.log('Java Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testJavaDetection();

const mock = require('mock-fs');
const { XMLParser } = require('fast-xml-parser');

async function testJavaParsing() {
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
    const fs = require('fs').promises;
    const content = await fs.readFile('/java-project/pom.xml', 'utf-8');
    console.log('XML content:', content);
    
    const parser = new XMLParser();
    const pomXml = parser.parse(content);
    console.log('Parsed XML:', JSON.stringify(pomXml, null, 2));
    
    // Check if dependencies exist
    if (pomXml.project?.dependencies?.dependency) {
      console.log('Dependencies found:', pomXml.project.dependencies.dependency);
    } else {
      console.log('No dependencies found');
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    mock.restore();
  }
}

testJavaParsing();

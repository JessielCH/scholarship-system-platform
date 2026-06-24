package ec.edu.uce.document.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "ec.edu.uce.document.repository")
public class MongoConfig {
}

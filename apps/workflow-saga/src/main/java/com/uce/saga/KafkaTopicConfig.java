package com.uce.saga;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic sagaFailureEventsTopic() {
        return TopicBuilder.name("saga-failure-events")
                .partitions(3)
                .replicas(3)
                .build();
    }

    @Bean
    public NewTopic academicEventsTopic() {
        return TopicBuilder.name("academic-events")
                .partitions(3)
                .replicas(3)
                .build();
    }
}

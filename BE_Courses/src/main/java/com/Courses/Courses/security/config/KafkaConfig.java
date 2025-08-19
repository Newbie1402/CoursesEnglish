package com.Courses.Courses.security.config;

import com.Courses.Courses.model.dto.MonitoringEventDto;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.mapping.DefaultJackson2JavaTypeMapper;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    /**
     * Topic cho sự kiện giám sát gian lận bài kiểm tra
     */
    @Bean
    public NewTopic examMonitoringTopic() {
        return TopicBuilder.name("exam-monitoring")
                .partitions(1) // Giảm xuống 1 partition để đơn giản hóa
                .replicas(1)
                .build();
    }

    /**
     * Topic cho các cảnh báo gian lận
     */
    @Bean
    public NewTopic examAlertsTopic() {
        return TopicBuilder.name("exam-alerts")
                .partitions(1)
                .replicas(1)
                .build();
    }

    /**
     * KafkaTemplate dùng để gửi sự kiện giám sát
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> producerFactory) {
        return new KafkaTemplate<>(producerFactory);
    }

    /**
     * ConcurrentKafkaListenerContainerFactory để xử lý sự kiện giám sát
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory(
            ConsumerFactory<String, Object> consumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setConcurrency(1); // Giảm xuống 1 luồng để tránh phức tạp

        // Thay đổi từ MANUAL_IMMEDIATE sang RECORD để xử lý đơn giản hơn
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);

        // Thêm error handler để tránh consumer bị restart khi có lỗi
        DefaultErrorHandler errorHandler = new DefaultErrorHandler(
                (record, exception) -> {
                    // Log lỗi nhưng không làm gián đoạn consumer
                    System.err.println("Lỗi xử lý message: " + exception.getMessage() +
                            " cho record: " + record);
                },
                new FixedBackOff(1000L, 3) // Thử lại tối đa 3 lần, cách nhau 1 giây
        );
        factory.setCommonErrorHandler(errorHandler);

        return factory;
    }

    /**
     * Cấu hình ProducerFactory cho KafkaTemplate
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put("bootstrap.servers", bootstrapServers);
        configProps.put("key.serializer", StringSerializer.class);
        configProps.put("value.serializer", JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    /**
     * Cấu hình ConsumerFactory cho ConcurrentKafkaListenerContainerFactory
     */
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put("bootstrap.servers", bootstrapServers);
        configProps.put("group.id", "exam_group");
        configProps.put("auto.offset.reset", "earliest");
        configProps.put("enable.auto.commit", "false");
        configProps.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        configProps.put(JsonDeserializer.VALUE_DEFAULT_TYPE, MonitoringEventDto.class); // default type

        return new DefaultKafkaConsumerFactory<>(
                configProps,
                new StringDeserializer(),
                new ErrorHandlingDeserializer<>(new JsonDeserializer<>())
        );
    }

}

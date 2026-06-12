package broker

import (
	"log"

	"github.com/rabbitmq/amqp091-go"
	"github.com/JessielCH/scholarship-system-platform/apps/academic-engine/internal/core/ports"
)

type rabbitMQBroker struct {
	conn *amqp091.Connection
	ch   *amqp091.Channel
}

func NewRabbitMQBroker(url string) ports.MessageBroker {
	if url == "" {
		log.Println("RabbitMQ URL is empty, using fallback NoOp broker")
		return &noOpBroker{}
	}

	conn, err := amqp091.Dial(url)
	if err != nil {
		log.Printf("Failed to connect to RabbitMQ: %v, using fallback NoOp broker", err)
		return &noOpBroker{}
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Printf("Failed to open a channel: %v, using fallback NoOp broker", err)
		return &noOpBroker{}
	}

	return &rabbitMQBroker{
		conn: conn,
		ch:   ch,
	}
}

func (b *rabbitMQBroker) PublishEvent(topic string, payload []byte) error {
	err := b.ch.ExchangeDeclare(
		topic,    // name
		"fanout", // type
		true,     // durable
		false,    // auto-deleted
		false,    // internal
		false,    // no-wait
		nil,      // arguments
	)
	if err != nil {
		return err
	}

	err = b.ch.Publish(
		topic, // exchange
		"",    // routing key
		false, // mandatory
		false, // immediate
		amqp091.Publishing{
			ContentType: "application/json",
			Body:        payload,
		})
	return err
}

func (b *rabbitMQBroker) Close() error {
	if b.ch != nil {
		b.ch.Close()
	}
	if b.conn != nil {
		b.conn.Close()
	}
	return nil
}

// Fallback if RabbitMQ is down
type noOpBroker struct{}
func (b *noOpBroker) PublishEvent(topic string, payload []byte) error { return nil }
func (b *noOpBroker) Close() error { return nil }

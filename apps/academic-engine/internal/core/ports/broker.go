package ports

type MessageBroker interface {
	PublishEvent(topic string, payload []byte) error
	Close() error
}

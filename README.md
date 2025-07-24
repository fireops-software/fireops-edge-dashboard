# FireOps Edge Dashboard
This repository contains the backend, as well as the corresponding frontend of the FireOps Edge Dashboard for fire departments. 
The contained frontend will be provided by the contained backend. So there is no need to host a separate web server, that serves the frontend.

## Configuration
All configuration is done via environmental variables because the intended form of running the project is in a Docker container.

| Variable | Default | Description |
|----------|---------|-------------|
| RABBITMQ_HOST |  | RabbitMQ host (e.g. 192.168.x.x or Hostname) |
| RABBITMQ_PORT | 5672 | RabbitMQ port |
| RABBITMQ_USER |  | RabbitMQ user |
| RABBITMQ_PW |  | RabbitMQ password |
| RABBITMQ_ALERTS_EXCHANGE | fireops-edge-events | RabbitMQ Exchange, of which Events can be received |
| RABBITMQ_ALERTS_ROUTING_KEY | active | RabbitMQ routing key for incomming notifications, that should be displayed |
| RABBITMQ_UNITS_EXCHANGE | fireops-edge-units | RabbitMQ exchange for incomming unit states |
| RABBITMQ_UNITS_ROUTING_KEY |  | RabbitMQ routing key for incomming unit states | 
| RABBITMQ_HEALTH_EXCHANGE | fireops-edge-health | RabbitMQ exchange for health messages |
| RABBITMQ_HEALTH_ROUTING_KEY |  | RabbitMQ routing key for health messages |
||||
| FIREDEP_NAME |  | Name of fire department (shown in headline) |
| FIREDEP_ADDR |  | Address of latitude, longitude of firedepartment (used as src for map navigation) |
| FIREDEP_LOGO_URL |  | Url for Logo, that is displayed in left upper corner |
| FIREDEP_MAX_TIME_TEXT_TO_SPEECH | 0 | Time, how long the voice output will play in a loop (0 -> disabled) |
||||
| API_PORT | 80 | Port, via the dashboard will be available |
| LOG_LEVEL | INFO | Possible TRACE, DEBUG, INFO, WARNING, ERROR, FATAL, OFF |

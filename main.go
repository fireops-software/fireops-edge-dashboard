package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/fireops-software/fireops-edge-dashboard/api"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/fireops-software/fireops-edge-dashboard/services"
	"github.com/uoul/go-common/config"
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/messaging"
)

const (
	VERSION      = "{VERSION}"
	SERVICE_NAME = "fireops-edge-dashboard"
)

func main() {

	// Create ConfigProvider
	cp := config.NewEnvVarProvider()

	// Create Logger
	logger := log.NewConsoleLogger(
		log.StringToLogLevel(cp.StringOrDefault("LOG_LEVEL", ""), log.INFO),
	)

	// Create application context
	appCtx, appCtxCancel := context.WithCancel(context.Background())

	// Create services
	rabbitMq := messaging.NewRabbitMqMessenger(
		appCtx,
		logger,
		cp.StringOrDefault("RABBITMQ_HOST", ""),
		cp.UInt16OrDefault("RABBITMQ_PORT", 5672),
		cp.StringOrDefault("RABBITMQ_USER", ""),
		cp.StringOrDefault("RABBITMQ_PW", ""),
	)

	eventsCache := services.NewEventsCache(
		appCtx,
		logger,
		rabbitMq,
		messaging.RabbitMqExchange{
			Type:       "topic",
			Exchange:   cp.StringOrDefault("RABBITMQ_EVENTS_EXCHANGE", "fireops-edge-events"),
			RoutingKey: cp.StringOrDefault("RABBITMQ_EVENTS_ROUTING_KEY", "active"),
		},
	)

	unitsCache := services.NewUnitStateCache(
		appCtx,
		logger,
		rabbitMq,
		messaging.RabbitMqExchange{
			Type:       "topic",
			Exchange:   cp.StringOrDefault("RABBITMQ_UNITS_EXCHANGE", "fireops-edge-units"),
			RoutingKey: cp.StringOrDefault("RABBITMQ_UNITS_ROUTING_KEY", ""),
		},
	)

	healthMonitor := services.NewHealthMonitor(
		appCtx,
		logger,
		rabbitMq,
		messaging.RabbitMqExchange{
			Type:       "topic",
			Exchange:   cp.StringOrDefault("RABBITMQ_HEALTH_EXCHANGE", "fireops-edge-health"),
			RoutingKey: cp.StringOrDefault("RABBITMQ_HEALTH_ROUTING_KEY", ""),
		},
	)

	// Create Api
	api := api.NewApi(
		eventsCache,
		unitsCache,
		healthMonitor,
		&domain.Settings{
			DashboardVersion:    VERSION,
			Name:                cp.StringOrDefault("FIREDEP_NAME", ""),
			Address:             cp.StringOrDefault("FIREDEP_ADDR", ""),
			LogoUrl:             cp.StringOrDefault("FIREDEP_LOGO_URL", ""),
			MaxTimeTextToSpeech: cp.UIntOrDefault("FIREDEP_MAX_TIME_TEXT_TO_SPEECH", 0),
			ScreenBlankingDelay: cp.UIntOrDefault("SCREEN_BLANKING_DELAY", 300),
			StartNightMode:      cp.StringOrDefault("NIGHT_MODE_START", "22:00"),
			EndNightMode:        cp.StringOrDefault("NIGHT_MODE_END", "06:00"),
			SelectedTheme:       cp.StringOrDefault("UI_THEME", "default"),
		},
		logger,
		api.WithApiReleaseMode(),
	)

	// Run Api
	apiPort := cp.UInt16OrDefault("API_PORT", 80)
	go api.Run(apiPort)

	// Wait until stop
	osSig := make(chan os.Signal, 1)
	signal.Notify(osSig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)
	<-osSig
	appCtxCancel()
	logger.Infof("Shutting down...")
}

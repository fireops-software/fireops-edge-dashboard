package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/api"
	"github.com/fireops-software/fireops-edge-dashboard/dal/fireops"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/fireops-software/fireops-edge-dashboard/services"
	"github.com/uoul/go-common/config"
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/messaging"
)

const (
	VERSION          = "{VERSION}"
	SERVICE_NAME     = "fireops-edge-dashboard"
	SHUTDOWN_TIMEOUT = 10
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

	// Create fireops api
	fireOpsApi := fireops.NewFireOpsApi(
		cp.StringOrDefault("FIREOPS_BASE_URL", ""),
		cp.StringOrDefault("FIREOPS_TOKEN", ""),
		logger,
	)

	// Create services
	rabbitMq := messaging.NewRabbitMqMessenger(
		appCtx,
		logger,
		cp.StringOrDefault("RABBITMQ_HOST", ""),
		cp.UInt16OrDefault("RABBITMQ_PORT", 5672),
		cp.StringOrDefault("RABBITMQ_USER", ""),
		cp.StringOrDefault("RABBITMQ_PW", ""),
	)

	activeAlertsCache := services.NewActiveAlertsCache(
		appCtx,
		rabbitMq,
		messaging.RabbitMqExchange{
			Type:       "topic",
			Exchange:   cp.StringOrDefault("RABBITMQ_ALERTS_EXCHANGE", "fireops-edge-alerts"),
			RoutingKey: cp.StringOrDefault("RABBITMQ_ALERTS_ROUTING_KEY", "active"),
		},
		fireOpsApi,
		logger,
		services.WithFireOpsRefreshRate(
			time.Duration(cp.IntOrDefault("FIREOPS_OPERATIONS_POLL_INTERVAL", 20))*time.Second,
		),
	)

	unitsCache := services.NewUnitStateCache(
		appCtx,
		fireOpsApi,
		logger,
		services.WithUnitPollInterval(time.Duration(cp.IntOrDefault("FIREOPS_UNITS_POLL_INTERVAL", 60))*time.Second),
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
		activeAlertsCache,
		unitsCache,
		healthMonitor,
		&domain.FireDepInfo{
			DashboardVersion:    VERSION,
			Name:                cp.StringOrDefault("FIREDEP_NAME", ""),
			Address:             cp.StringOrDefault("FIREDEP_ADDR", ""),
			LogoUrl:             cp.StringOrDefault("FIREDEP_LOGO_URL", ""),
			MaxTimeTextToSpeech: cp.UIntOrDefault("FIREDEP_MAX_TIME_TEXT_TO_SPEECH", 0),
		},
		logger,
		api.WithApiReleaseMode(),
	)

	// Run Services
	go activeAlertsCache.Run()
	go unitsCache.Run()
	go healthMonitor.Run()

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

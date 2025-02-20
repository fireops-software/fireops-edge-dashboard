package main

import (
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/api"
	"github.com/fireops-software/fireops-edge-dashboard/dal/fireops"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/fireops-software/fireops-edge-dashboard/services"
	"github.com/uoul/go-common/config"
	"github.com/uoul/go-common/log"
	"github.com/uoul/go-common/resource"
)

const (
	SHUTDOWN_TIMEOUT = time.Duration(20) * time.Second
)

func main() {

	// Create ConfigProvider
	cp := config.NewEnvVarProvider()

	// Create Logger
	logger := log.NewConsoleLogger(
		log.StringToLogLevel(cp.StringOrDefault("LOG_LEVEL", ""), log.INFO),
	)

	// Create ResourceManager
	rm := resource.NewResourceManager(SHUTDOWN_TIMEOUT, logger)

	// Create fireops api
	fireOpsApi := fireops.NewFireOpsApi(
		cp.StringOrDefault("FIREOPS_BASE_URL", ""),
		cp.StringOrDefault("FIREOPS_TOKEN", ""),
		logger,
	)

	// Create services
	activeAlertsClient := services.NewActiveAlertsClient(
		cp.StringOrDefault("RABBITMQ_HOST", "localhost"),
		cp.UInt16OrDefault("RABBITMQ_PORT", 5672),
		cp.StringOrDefault("RABBITMQ_USER", ""),
		cp.StringOrDefault("RABBITMQ_PW", ""),
		cp.StringOrDefault("RABBITMQ_EXCHANGE", ""),
		logger,
	)

	activeAlertsCache := services.NewActiveAlertsCache(
		activeAlertsClient,
		fireOpsApi,
		logger,
		services.WithFireOpsRefreshRate(
			time.Duration(cp.IntOrDefault("FIREOPS_OPERATIONS_POLL_INTERVAL", 20))*time.Second,
		),
	)

	unitsCache := services.NewUnitStateCache(
		fireOpsApi,
		logger,
		services.WithUnitPollInterval(time.Duration(cp.IntOrDefault("FIREOPS_UNITS_POLL_INTERVAL", 60))*time.Second),
	)

	// Create Api
	api := api.NewApi(
		activeAlertsCache,
		unitsCache,
		&domain.FireDepInfo{
			Name:                cp.StringOrDefault("FIREDEP_NAME", ""),
			Address:             cp.StringOrDefault("FIREDEP_ADDR", ""),
			LogoUrl:             cp.StringOrDefault("FIREDEP_LOGO_URL", ""),
			MaxTimeTextToSpeech: cp.UIntOrDefault("FIREDEP_MAX_TIME_TEXT_TO_SPEECH", 0),
		},
		logger,
		api.WithApiReleaseMode(),
	)

	// Run Services
	go activeAlertsClient.Run()
	rm.Register(activeAlertsClient)

	go activeAlertsCache.Run()
	rm.Register(activeAlertsCache)

	go unitsCache.Run()
	rm.Register(unitsCache)

	// Run Api
	apiPort := cp.UInt16OrDefault("API_PORT", 80)
	api.Run(apiPort)
}

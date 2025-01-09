package main

import (
	"time"

	"github.com/uoul/fireops-edge-dashboard/api"
	"github.com/uoul/fireops-edge-dashboard/dal/fireops"
	"github.com/uoul/fireops-edge-dashboard/domain"
	"github.com/uoul/fireops-edge-dashboard/services"
	"github.com/uoul/go-common/config"
	"github.com/uoul/go-common/log"
)

func main() {
	cp := config.NewEnvVarProvider()
	logger := log.NewConsoleLogger(
		log.StringToLogLevel(cp.StringOrDefault("LOG_LEVEL", ""), log.INFO),
	)

	activeAlertsClient := services.NewActiveAlertsClient(
		cp.StringOrDefault("RABBITMQ_HOST", "localhost"),
		cp.UInt16OrDefault("RABBITMQ_PORT", 5672),
		cp.StringOrDefault("RABBITMQ_USER", ""),
		cp.StringOrDefault("RABBITMQ_PW", ""),
		cp.StringOrDefault("RABBITMQ_EXCHANGE", ""),
		logger,
	)
	defer activeAlertsClient.Close()

	fireOpsApi := fireops.NewFireOpsApi(
		cp.StringOrDefault("FIREOPS_BASE_URL", ""),
		cp.StringOrDefault("FIREOPS_TOKEN", ""),
		logger,
	)

	activeAlertsCache := services.NewActiveAlertsCache(
		activeAlertsClient,
		fireOpsApi,
		logger,
		services.WithFireOpsRefreshRate(
			time.Duration(cp.IntOrDefault("FIREOPS_POLL_INTERVAL", 20))*time.Second,
		),
	)
	defer activeAlertsCache.Close()

	api := api.NewApi(
		activeAlertsCache,
		&domain.FireDepInfo{
			Name:    cp.StringOrDefault("FIREDEP_NAME", ""),
			Address: cp.StringOrDefault("FIREDEP_ADDR", ""),
			LogoUrl: cp.StringOrDefault("FIREDEP_LOGO_URL", ""),
		},
		logger,
	)

	go activeAlertsClient.Run()
	go activeAlertsCache.Run()
	apiPort := cp.UInt16OrDefault("API_PORT", 80)
	logger.Infof("Listening on for incomming connections on port %d", apiPort)
	api.Run(apiPort)
}

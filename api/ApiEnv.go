package api

import (
	"fmt"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/uoul/fireops-edge-dashboard/domain"
	"github.com/uoul/fireops-edge-dashboard/services"
	"github.com/uoul/go-common/log"
)

type ApiEnv struct {
	activeAlertsCache *services.ActiveAlertsCache
	fireDepInfo       *domain.FireDepInfo
	logger            log.ILogger
}

func (a *ApiEnv) Run(port uint16) {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(static.Serve("/", static.LocalFile("wwwroot", true)))

	apiV1 := router.Group("/api/v1")
	apiV1.Use(
		gin.Logger(),
		gin.Recovery(),
		a.useCors(),
		a.errorTranslation(),
	)
	apiV1.GET("/fireDepInfo", a.getFireDepInfo)
	apiV1.GET("/operations/notification", a.getActiveAlertsStream)
	apiV1.GET("/operations", a.getActiveAlerts)

	router.Run(fmt.Sprintf(":%v", port))
}

func NewApi(activeAlertsCache *services.ActiveAlertsCache, fireDepInfo *domain.FireDepInfo, logger log.ILogger) *ApiEnv {
	return &ApiEnv{
		activeAlertsCache: activeAlertsCache,
		fireDepInfo:       fireDepInfo,
		logger:            logger,
	}
}

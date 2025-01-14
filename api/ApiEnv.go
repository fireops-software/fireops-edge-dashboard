package api

import (
	"fmt"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/fireops-software/fireops-edge-dashboard/services"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/uoul/go-common/log"
)

type ApiEnv struct {
	activeAlertsCache *services.ActiveAlertsCache
	fireDepInfo       *domain.FireDepInfo
	logger            log.ILogger
	releaseMode       bool
}

func (a *ApiEnv) Run(port uint16) {
	if a.releaseMode {
		gin.SetMode(gin.ReleaseMode)
	}
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

	a.logger.Infof("Local api running on port %d", port)
	router.Run(fmt.Sprintf(":%v", port))
}

func NewApi(activeAlertsCache *services.ActiveAlertsCache, fireDepInfo *domain.FireDepInfo, logger log.ILogger, opts ...func(*ApiEnv)) *ApiEnv {
	api := &ApiEnv{
		activeAlertsCache: activeAlertsCache,
		fireDepInfo:       fireDepInfo,
		logger:            logger,
		releaseMode:       false,
	}
	for _, o := range opts {
		o(api)
	}
	return api
}

func WithApiReleaseMode() func(*ApiEnv) {
	return func(ae *ApiEnv) {
		ae.releaseMode = true
	}
}

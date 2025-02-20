package api

import (
	"fmt"
	"reflect"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/fireops-software/fireops-edge-dashboard/services"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/uoul/go-common/log"
)

type ApiEnv struct {
	activeAlertsCache services.INotificationService[[]domain.Operation]
	unitsCache        services.INotificationService[[]domain.Unit]
	fireDepInfo       *domain.FireDepInfo
	logger            log.ILogger
	releaseMode       bool
}

type ErrorResponse struct {
	Type    string `json:"type"`
	Message string `json:"message"`
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
	apiV1.GET("/operations", a.getActiveAlertsStream)
	apiV1.GET("/units", a.getUnitsStream)

	a.logger.Infof("Local api running on port %d", port)
	router.Run(fmt.Sprintf(":%v", port))
}

func WithApiReleaseMode() func(*ApiEnv) {
	return func(ae *ApiEnv) {
		ae.releaseMode = true
	}
}

func NewApi(activeAlertsCache services.INotificationService[[]domain.Operation], unitsCache services.INotificationService[[]domain.Unit], fireDepInfo *domain.FireDepInfo, logger log.ILogger, opts ...func(*ApiEnv)) *ApiEnv {
	api := &ApiEnv{
		activeAlertsCache: activeAlertsCache,
		unitsCache:        unitsCache,
		fireDepInfo:       fireDepInfo,
		logger:            logger,
		releaseMode:       false,
	}
	for _, o := range opts {
		o(api)
	}
	return api
}

func NewErrorResponse(err error) *ErrorResponse {
	return &ErrorResponse{
		Type:    reflect.TypeOf(err).Name(),
		Message: err.Error(),
	}
}

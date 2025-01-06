package api

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (a *ApiEnv) getActiveAlertsStream(ctx *gin.Context) {
	updateCh := a.activeAlertsCache.Subscribe()
	defer a.activeAlertsCache.Unsubscribe(updateCh)
	ticker := time.NewTicker(10 * time.Second)
	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Done():
			return false
		case <-ticker.C:
			ctx.SSEvent("heartbeat", nil)
			return true
		case o := <-updateCh:
			if o.Error == nil {
				ctx.SSEvent("message", o.Result)
			} else {
				ctx.SSEvent("error", o.Result)
			}
			return true
		}
	})
}

func (a *ApiEnv) getFireDepInfo(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, a.fireDepInfo)
}

func (a *ApiEnv) getActiveAlerts(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, a.activeAlertsCache.GetOperations())
}

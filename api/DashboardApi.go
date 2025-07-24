package api

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func (a *ApiEnv) getEventsStream(ctx *gin.Context) {
	updateCh := a.eventsCache.Subscribe()
	defer a.eventsCache.Unsubscribe(updateCh)
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
				ctx.SSEvent("error", NewErrorResponse(o.Error))
			}
			return true
		}
	})
}

func (a *ApiEnv) getFireDepInfo(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, a.fireDepInfo)
}

func (a *ApiEnv) getUnitsStream(ctx *gin.Context) {
	updateCh := a.unitsCache.Subscribe()
	defer a.unitsCache.Unsubscribe(updateCh)
	ticker := time.NewTicker(10 * time.Second)
	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Done():
			return false
		case <-ticker.C:
			ctx.SSEvent("heartbeat", nil)
			return true
		case u := <-updateCh:
			if u.Error == nil {
				ctx.SSEvent("message", u.Result)
			} else {
				ctx.SSEvent("error", NewErrorResponse(u.Error))
			}
			return true
		}
	})
}

func (a *ApiEnv) getHealthStream(ctx *gin.Context) {
	updateCh := a.healtMonitor.Subscribe()
	defer a.healtMonitor.Unsubscribe(updateCh)
	ticker := time.NewTicker(10 * time.Second)
	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Done():
			return false
		case <-ticker.C:
			ctx.SSEvent("heartbeat", nil)
			return true
		case u := <-updateCh:
			if u.Error == nil {
				ctx.SSEvent("message", u.Result)
			} else {
				ctx.SSEvent("error", NewErrorResponse(u.Error))
			}
			return true
		}
	})
}

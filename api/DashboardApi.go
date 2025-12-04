package api

import (
	"io"
	"net/http"
	"time"

	"github.com/fireops-software/fireops-edge-dashboard/api/dto"
	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func (a *ApiEnv) getLiveData(ctx *gin.Context) {
	// Get version info from query parameter
	clientVersion := ctx.Query("version")
	a.logger.Debugf("Client with version %s connected", clientVersion)
	defer a.logger.Debug("Client disconnected")
	pageRefreshCommand := make(chan bool, 1)
	if clientVersion != a.settings.DashboardVersion {
		pageRefreshCommand <- true
	}
	// Subscribe to events
	eventCh := a.eventsCache.Subscribe()
	defer a.eventsCache.Unsubscribe(eventCh)
	// Subscribe to units
	unitsCh := a.unitsCache.Subscribe()
	defer a.unitsCache.Unsubscribe(unitsCh)
	// Subscribe to health
	healthCh := a.healtMonitor.Subscribe()
	defer a.healtMonitor.Unsubscribe(healthCh)
	// Create Ticker
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	// Run Stream
	ctx.Stream(func(w io.Writer) bool {
		select {
		case <-ctx.Done():
			return false
		case <-pageRefreshCommand:
			ctx.SSEvent("message", dto.LiveMsg[any]{
				MsgId:     uuid.NewString(),
				MsgType:   dto.RELOAD,
				Timestamp: time.Now(),
				Body:      nil,
			})
			return true
		case <-ticker.C:
			ctx.SSEvent("heartbeat", nil)
			return true
		case msg := <-eventCh:
			if msg.Error == nil {
				ctx.SSEvent("message", dto.LiveMsg[[]domain.Event]{
					MsgId:     uuid.NewString(),
					MsgType:   dto.EVENTS,
					Timestamp: time.Now(),
					Body:      msg.Result,
				})
			} else {
				ctx.SSEvent("error", NewErrorResponse(msg.Error))
			}
			return true
		case msg := <-unitsCh:
			if msg.Error == nil {
				ctx.SSEvent("message", dto.LiveMsg[[]domain.Unit]{
					MsgId:     uuid.NewString(),
					MsgType:   dto.UNITS,
					Timestamp: time.Now(),
					Body:      msg.Result,
				})
			} else {
				ctx.SSEvent("error", NewErrorResponse(msg.Error))
			}
			return true
		case msg := <-healthCh:
			if msg.Error == nil {
				ctx.SSEvent("message", dto.LiveMsg[[]domain.Health]{
					MsgId:     uuid.NewString(),
					MsgType:   dto.HEALTH,
					Timestamp: time.Now(),
					Body:      msg.Result,
				})
			} else {
				ctx.SSEvent("error", NewErrorResponse(msg.Error))
			}
			return true
		}
	})
}

func (a *ApiEnv) getSettings(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, a.settings)
}

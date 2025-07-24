package api

import (
	"net/http"

	appError "github.com/fireops-software/fireops-edge-dashboard/error"
	"github.com/gin-gonic/gin"
)

func (e *ApiEnv) useCors() func(ctx *gin.Context) {
	return func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		ctx.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		ctx.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		ctx.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		if ctx.Request.Method == "OPTIONS" {
			ctx.AbortWithStatus(204)
			return
		}
		ctx.Next()
	}
}

func (e *ApiEnv) errorTranslation() func(*gin.Context) {
	return func(ctx *gin.Context) {
		ctx.Next()
		if !ctx.IsAborted() {
			for _, err := range ctx.Errors {
				switch err.Err.(type) {
				case appError.ErrDataParsing:
					ctx.Status(http.StatusBadRequest)
				case appError.ErrRabbitMq, appError.ErrUnavailable:
					ctx.Status(http.StatusServiceUnavailable)
				default:
					ctx.Status(http.StatusInternalServerError)
				}
			}
		}
	}
}

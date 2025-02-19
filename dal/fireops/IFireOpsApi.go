package fireops

import (
	"context"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
	"github.com/uoul/go-common/async"
)

type IFireOpsApi interface {
	GetOperation(ctx context.Context, operationId string) chan async.ActionResult[domain.Operation]
	GetUnits(ctx context.Context) chan async.ActionResult[[]domain.Unit]
}

package fireops

import (
	"context"

	"github.com/uoul/fireops-edge-dashboard/domain"
	"github.com/uoul/go-common/async"
)

type IFireOpsApi interface {
	GetOperation(ctx context.Context, operationId string) chan async.ActionResult[domain.Operation]
}

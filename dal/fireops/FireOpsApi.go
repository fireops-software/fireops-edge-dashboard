package fireops

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/uoul/fireops-edge-dashboard/domain"
	appError "github.com/uoul/fireops-edge-dashboard/error"
	"github.com/uoul/go-common/async"
)

type FireOpsApi struct {
	baseUrl    string
	apiToken   string
	httpClient *http.Client
}

// GetOperation implements IFireOpsApi.
func (f *FireOpsApi) GetOperation(ctx context.Context, operationId string) chan async.ActionResult[domain.Operation] {
	r := make(chan async.ActionResult[domain.Operation])
	go func() {
		// Create HTTP request
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/event/%s", f.baseUrl, operationId), nil)
		if err != nil {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrFireOpsApi("failed create http request to get operation %s - %v", operationId, err),
			)
			return
		}
		req.Header.Add("Accept", `application/json`)
		req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", f.apiToken))
		// Do Request
		resp, err := f.httpClient.Do(req)
		if err != nil {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrFireOpsApi("failed fetch %s from FireOpsApi - %v", operationId, err),
			)
			return
		}
		if resp.StatusCode != http.StatusOK {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrFireOpsApi("failed fetch %s from FireOpsApi (StatusCode: %d)", operationId, resp.StatusCode),
			)
			return
		}
		defer resp.Body.Close()

		// Parse response
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrFireOpsApi("failed to read body from FireOpsApi for %s - %v", operationId, err),
			)
			return
		}
		o := domain.Operation{}
		err = json.Unmarshal(body, &o)
		if err != nil {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrFireOpsApi("failed to parse response from FireOpsApi for %s - %v", operationId, err),
			)
			return
		}
		// Return result
		r <- async.ActionResult[domain.Operation]{
			Result: o,
			Error:  nil,
		}
	}()
	return r
}

func NewFireOpsApi(baseUrl string, apiToken string) IFireOpsApi {
	return &FireOpsApi{
		baseUrl:  baseUrl,
		apiToken: apiToken,

		httpClient: http.DefaultClient,
	}
}

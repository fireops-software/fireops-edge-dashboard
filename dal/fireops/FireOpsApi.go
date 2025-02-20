package fireops

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/fireops-software/fireops-edge-dashboard/domain"
	appError "github.com/fireops-software/fireops-edge-dashboard/error"
	"github.com/uoul/go-common/async"
	"github.com/uoul/go-common/log"
)

type FireOpsApi struct {
	baseUrl    string
	apiToken   string
	logger     log.ILogger
	httpClient *http.Client
}

// GetUnits implements IFireOpsApi.
func (f *FireOpsApi) GetUnits(ctx context.Context) chan async.ActionResult[[]domain.Unit] {
	r := make(chan async.ActionResult[[]domain.Unit])
	go func() {
		// Create HTTP request
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/user/firedepartment/units", f.baseUrl), nil)
		if err != nil {
			r <- async.NewErrorActionResult[[]domain.Unit](
				appError.NewErrFireOpsApi("failed to create http request to get unit state - %v", err),
			)
			return
		}
		f.addRequestHeader(req)
		// Do Request
		resp, err := f.httpClient.Do(req)
		if err != nil {
			r <- async.NewErrorActionResult[[]domain.Unit](
				appError.NewErrUnavailable("failed to fetch units - %v", err),
			)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			r <- async.NewErrorActionResult[[]domain.Unit](
				appError.NewErrUnavailable("failed fetch units from FireOpsApi (StatusCode: %d)", resp.StatusCode),
			)
			return
		}
		// Parse Response
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			r <- async.NewErrorActionResult[[]domain.Unit](
				appError.NewErrFireOpsApi("failed to read response body - %v", err),
			)
			return
		}
		units := []domain.Unit{}
		err = json.Unmarshal(body, &units)
		if err != nil {
			r <- async.NewErrorActionResult[[]domain.Unit](
				appError.NewErrDataParsing("failed to parse units response from fireops - %v", err),
			)
			return
		}
		// Return units
		r <- async.ActionResult[[]domain.Unit]{
			Result: units,
			Error:  nil,
		}
	}()
	return r
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
		f.addRequestHeader(req)
		// Do Request
		resp, err := f.httpClient.Do(req)
		if err != nil {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrUnavailable("failed fetch %s from FireOpsApi - %v", operationId, err),
			)
			return
		}
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			r <- async.NewErrorActionResult[domain.Operation](
				appError.NewErrUnavailable("failed fetch %s from FireOpsApi (StatusCode: %d)", operationId, resp.StatusCode),
			)
			return
		}
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
				appError.NewErrDataParsing("failed to parse response from FireOpsApi for %s - %v", operationId, err),
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

func (f *FireOpsApi) addRequestHeader(req *http.Request) {
	req.Header.Add("Accept", `application/json`)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", f.apiToken))
}

func NewFireOpsApi(baseUrl string, apiToken string, logger log.ILogger) IFireOpsApi {
	return &FireOpsApi{
		baseUrl:  baseUrl,
		apiToken: apiToken,
		logger:   logger,

		httpClient: http.DefaultClient,
	}
}

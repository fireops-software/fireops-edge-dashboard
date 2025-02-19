package domain

type Unit struct {
	UnidLong      *string `json:"unid_long"`
	UniTyp        *string `json:"unityp"`
	UnitStatus    *string `json:"unit_status"`
	UnitStatusId  *int    `json:"unit_status_id"`
	ActTetraGroup *string `json:"act_tetragroup"`
}

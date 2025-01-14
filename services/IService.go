package services

type IService interface {
	Run()
	Close() error
}

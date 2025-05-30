export class Health {
  constructor(
    public ServiceName: string,
	  public Timestamp: string,
	  public State: string,
	  public Errors: string[],
    public Description: string,
  ){}
}